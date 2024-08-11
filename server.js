// server.js
const express = require('express');
const path = require('path');
const { exec } = require('child_process');

const app = express();
const port = 3000;

// Path default untuk file MP3 di root folder
const defaultSoundPath = path.resolve(__dirname, 'sound.mp3');

// Middleware untuk parsing JSON
app.use(express.json());

let playerProcess = null;

// Fungsi untuk memutar suara menggunakan termux-media-player
const playSound = (filePath) => {
    return new Promise((resolve, reject) => {
        playerProcess = exec(`termux-media-player play ${filePath}`, (error, stdout, stderr) => {
            if (error) {
                return reject(`Error playing sound: ${stderr}`);
            }
            resolve(stdout);
        });
    });
};

// Endpoint untuk memutar suara
app.post('/play-sound', async (req, res) => {
    const { soundPath } = req.body;
    const filePath = soundPath ? path.resolve(__dirname, soundPath) : defaultSoundPath;

    try {
        if (playerProcess) {
            playerProcess.kill(); // Hentikan proses sebelumnya jika ada
        }
        await playSound(filePath);
        res.status(200).json({ message: 'Sound played successfully' });
    } catch (error) {
        console.error('Error playing sound:', error);
        res.status(500).json({ message: 'Error playing sound' });
    }
});

// Endpoint untuk menghentikan pemutaran suara
app.post('/stop-sound', (req, res) => {
    if (playerProcess) {
        playerProcess.kill(); // Hentikan proses audio
        playerProcess = null;
        res.status(200).json({ message: 'Sound stopped successfully' });
    } else {
        res.status(400).json({ message: 'No sound is currently playing' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
