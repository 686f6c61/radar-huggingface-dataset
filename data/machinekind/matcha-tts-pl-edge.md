# machinekind/Matcha-TTS-PL-Edge

## Resumen

Matcha-TTS-PL-Edge es una variante optimizada para CPU del sistema de síntesis de voz Matcha-TTS-PL, publicado por machinekind. Convierte texto en polaco en audio mono a 22.050 Hz con dos voces sintéticas (`male_voxcpm_2` y `female_voxcpm_2`) y grafos ONNX pre-cuantizados en int8, además de fp32. Su objetivo es ejecutar TTS en dispositivos sin GPU, como Raspberry Pi 5 o Jetson, con streaming y baja latencia: el autor reporta un primer audio de unos 80 ms en un núcleo de clase Pi.

El repositorio
