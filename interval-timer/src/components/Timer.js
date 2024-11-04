import React, { useState, useEffect } from 'react';

const Timer = () => {
    const [intervalLength, setIntervalLength] = useState({ minutes: 1, seconds: 0 });
    const [restLength, setRestLength] = useState({ minutes: 0, seconds: 30 });
    const [totalIntervals, setTotalIntervals] = useState(3);
    const [timeLeft, setTimeLeft] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [currentInterval, setCurrentInterval] = useState(1);
    const [isResting, setIsResting] = useState(false);
    const [countdown, setCountdown] = useState(3);
    const [savedSettings, setSavedSettings] = useState([]);

    // Load last 3 settings from local storage on initial render
    useEffect(() => {
        const storedSettings = JSON.parse(localStorage.getItem('intervalSettings')) || [];
        setSavedSettings(storedSettings.slice(0, 3));
    }, []);

    // Save the current settings to local storage when the timer starts
    useEffect(() => {
        if (isRunning && countdown === 0) {
            const newSetting = { intervalLength, restLength, totalIntervals };
            const updatedSettings = [newSetting, ...savedSettings.slice(0, 2)];
            setSavedSettings(updatedSettings);
            localStorage.setItem('intervalSettings', JSON.stringify(updatedSettings));
        }
    }, [isRunning, countdown]);

    // Handle countdown before intervals start
    useEffect(() => {
        if (countdown > 0 && isRunning) {
            const countdownTimer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(countdownTimer);
        } else if (countdown === 0 && isRunning) {
            // Set initial interval time when countdown reaches 0
            setTimeLeft(intervalLength.minutes * 60 + intervalLength.seconds);
        }
    }, [countdown, isRunning]);

    // Manage interval/rest countdowns
    useEffect(() => {
        let timer;
        if (isRunning && countdown === 0) {
            timer = setInterval(() => {
                setTimeLeft((prevTime) => {
                    if (prevTime > 0) return prevTime - 1;

                    clearInterval(timer);
                    if (!isResting && currentInterval < totalIntervals) {
                        setIsResting(true);
                        setTimeLeft(restLength.minutes * 60 + restLength.seconds);
                    } else if (isResting) {
                        setCurrentInterval((prev) => prev + 1);
                        setIsResting(false);
                        setTimeLeft(intervalLength.minutes * 60 + intervalLength.seconds);
                    } else {
                        setIsRunning(false);
                    }

                    return prevTime;
                });
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [isRunning, countdown, isResting, timeLeft, currentInterval, totalIntervals]);

    const startTimer = () => {
        setCountdown(3);
        setCurrentInterval(1);
        setIsResting(false);
        setTimeLeft(intervalLength.minutes * 60 + intervalLength.seconds);
        setIsRunning(true);
    };

    const stopTimer = () => {
        setIsRunning(false);
        setCountdown(3);
        setTimeLeft(0);
    };

    return (
        <div>
            <h1>Interval Timer</h1>
            <div>
                <label>Interval Length:</label>
                <input
                    type="number"
                    value={intervalLength.minutes}
                    onChange={(e) => setIntervalLength({ ...intervalLength, minutes: Number(e.target.value) })}
                    min="0"
                    placeholder="Minutes"
                />
                <input
                    type="number"
                    value={intervalLength.seconds}
                    onChange={(e) => setIntervalLength({ ...intervalLength, seconds: Number(e.target.value) })}
                    min="0"
                    max="59"
                    placeholder="Seconds"
                />
            </div>
            <div>
                <label>Rest Length:</label>
                <input
                    type="number"
                    value={restLength.minutes}
                    onChange={(e) => setRestLength({ ...restLength, minutes: Number(e.target.value) })}
                    min="0"
                    placeholder="Minutes"
                />
                <input
                    type="number"
                    value={restLength.seconds}
                    onChange={(e) => setRestLength({ ...restLength, seconds: Number(e.target.value) })}
                    min="0"
                    max="59"
                    placeholder="Seconds"
                />
            </div>
            <div>
                <label>Total Intervals:</label>
                <input
                    type="number"
                    value={totalIntervals}
                    onChange={(e) => setTotalIntervals(Number(e.target.value))}
                    min="1"
                />
            </div>
            <div>
                <h2>{countdown > 0 ? `Starting in: ${countdown}` : `Time Left: ${Math.floor(timeLeft / 60)}:${timeLeft % 60 < 10 ? '0' : ''}${timeLeft % 60}`}</h2>
                <h3>{isResting ? "Resting" : `Interval ${currentInterval} of ${totalIntervals}`}</h3>
            </div>
            <button onClick={startTimer} disabled={isRunning}>Start</button>
            <button onClick={stopTimer}>Stop</button>
            <div>
                <h3>Last 3 Settings:</h3>
                <ul>
                    {savedSettings.map((setting, index) => (
                        <li key={index}>
                            Interval: {setting.intervalLength.minutes}m {setting.intervalLength.seconds}s, Rest: {setting.restLength.minutes}m {setting.restLength.seconds}s, Intervals: {setting.totalIntervals}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default Timer;
