# BoumedineBillal/esp32-pie-asr-kroko-en

## Resumen

Kroko en 2 y 4 bits para ESP32-P4 es una versión cuantizada del modelo de reconocimiento automático del habla (ASR) en inglés de Banafo, empaquetada específicamente para ejecutarse en el microcontrolador ESP32-P4 de Espressif. Se trata de un transductor Zipformer de 65,7 millones de parámetros cuyos pesos se han comprimido de 71 MB (int8) a 26,65 MB mediante cuantización mixta de 2 y 4 bits, sin reentrenamiento. El resultado es un sistema de reconocimiento de voz de vocabulario abierto, en streaming y en tiempo real, que corre íntegramente en el chip usando sus dos núcleos RISC-V a 400 MHz y las instrucciones SIMD PIE, sin acelerador neuronal ni conexión a la nube.

El modelo resuelve un problema concreto: llevar ASR de vocabulario abierto a hardware embebido con recursos muy limitados. Frente a alternativas como ESP-SR MultiNet (limitada a una lista fija de comandos) o modelos más pequeños como Oído (13M) o Moonshine Tiny (27,1M), este Kroko cuantizado mantiene una precisión competitiva (4,34 % WER en LibriSpeech test-clean) con un tamaño que cabe en la PSRAM de 32 MB de la placa.

Es relevante ahora porque demuestra que un transductor de 65,7M de parámetros puede ejecutarse en un microcontrolador a 0,70× tiempo real con una latencia de finalización de palabra de unos 2 segundos, y porque el motor y el firmware son de código abierto. El repositorio solo contiene los pesos en formato propietario `KRK1`, legible por el motor pieasr, no por PyTorch ni ONNX Runtime.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transductor Zipformer (streaming) |
| Parámetros totales | 65,7M |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (procesa audio en chunks de 1,28 s en streaming) |
| Tipos de cuantización | 2 y 4 bits, en grupos de 128 con una escala por grupo; activaciones enteras (int16 entre productos, int8 a la entrada) |
| Idiomas soportados | inglés (en) |
| Licencia | CC-BY-SA-4.0 |
| Formato de pesos | `KRK1` (formato propietario del motor pieasr); no cargable en PyTorch ni ONNX Runtime |

## Arquitectura y entrenamiento

El modelo es un transductor Zipformer, la arquitectura de ASR en streaming desarrollada en el ecosistema k2-fsa/sherpa-onnx. El modelo original Kroko-ASR de Banafo se distribuyó en la release de sherpa-onnx del 2025-08-06 en int8 (71 MB); esta versión no se ha reentrenado, sino que se ha comprimido mediante cuantización post-entrenamiento: las matrices grandes se almacenan en 2 o 4 bits en grupos de 128 con una escala por grupo, y las activaciones se eligen en precisión entera (int16 entre productos, int8 a la entrada) de modo que la precisión no se degrade. Los pesos se empaquetan para los kernels SIMD PIE del motor, que reparte los productos entre los dos núcleos.

La innovación técnica principal es la bit-exactitud: el chip calcula exactamente lo mismo que la compilación del motor para PC, de modo que las métricas de WER medidas en PC son las del chip. El modelo se lee desde una tarjeta microSD al arrancar (2,9 s) y se carga junto con los 4 MB de estado del motor en la PSRAM de 32 MB, dejando 121 KB de RAM interna libre. No se dispone de información sobre el dataset de entrenamiento original, el número de tokens ni si hubo RLHF o DPO.

## Capacidades

- Reconocimiento de voz en inglés de vocabulario abierto, en streaming y en tiempo real.
- Funcionamiento totalmente on-device: sin nube ni acelerador neuronal, solo los dos núcleos RISC-V y las instrucciones PIE.
- Decodificación con búsqueda por haces (beam search) de 4 hipótesis.
- Soporte de "frases" o hotwords: una lista de palabras y oraciones a escuchar, activable o desactivable en pantalla sin reentrenamiento; admite formas habladas alternativas (por ejemplo, `ESP32 = ESP thirty two`).
- Salida de texto en pantalla a medida que se habla, con finalización de palabra unos 2 s después de pronunciarse.
- No soporta tool calling, function calling, agentes, visión, audio de entrada más allá del micrófono ni capacidades multilingües (solo inglés).

## Casos de uso

- Transcripción en vivo en dispositivos portátiles: el modelo convierte el audio del micrófono en texto en pantalla en tiempo real a 0,70× tiempo real, adecuado para grabadoras, wearables o terminales de campo sin conectividad.
- Control por voz de vocabulario abierto en electrodomésticos e industria: a diferencia de los reconocedores de comandos fijos, permite dictar órdenes libres en inglés sobre un microcontrolador, con la lista de hotwords para reducir falsos positivos.
- Asistentes de accesibilidad: subtitulado local de conversaciones para personas con discapacidad auditiva en un dispositivo autónomo, sin enviar audio a servidores externos.
- Kioscos y paneles interactivos: reconocimiento de voz embebido en pantallas táctiles o informativas que deben funcionar sin red, con latencia de palabra de unos 2 s.
- Automatización del hogar con privacidad: procesamiento local del habla para activar rutinas, evitando la nube y cumpliendo requisitos de privacidad de datos.
- Prototipado e investigación en ASR embebido: el motor y el firmware son de código abierto, lo que permite reproducir las métricas (LibriSpeech test-clean y test-other) y experimentar con cuantización y hotwords en el propio chip.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (no verificados de forma independiente), medidos sobre todos los clips de LibriSpeech con el normalizador de texto inglés de Whisper y beam search de 4 hipótesis:

| Dataset | Métrica | Valor |
|---|---|---|
| LibriSpeech test-clean | WER (beam 4) | 4,34 % |
| LibriSpeech test-other | WER (beam 4) | 10,26 % |

Comparativa publicada por el autor:

| Modelo | Parámetros | Pesos | Plataforma | Streaming | test-clean | test-other | Velocidad |
|---|---|---|---|---|---|---|---|
| Este modelo | 65,7M | 2/4 bits, 26,65 MB | ESP32-P4 (2 × 400 MHz RISC-V) | sí | 4,34 % | 10,26 % | 0,70× tiempo real |
| Kroko original (sherpa-onnx) | 65,7M | int8, 71 MB | PC | sí | 3,94 % | 9,17 % | no disponible |
| Oído (streaming) | 13M | int8 | ESP32-S3 (240 MHz Xtensa) | sí | 4,86 % | 11,03 % | texto final 4,1–11,1 s tras clips de 3,6–10,6 s |
| Oído (utterance completo) | 13M | int8 | ESP32-S3 | no | 3,70 % | 8,23 % | 1,97× tiempo real (un núcleo) |
| Moonshine Tiny | 27,1M | float | CPU | no | 4,52 % | 11,71 % | no disponible |
| Whisper tiny.en | 37,8M | float | CPU | no | 5,66 % | 15,45 % | no disponible |

Rendimiento en el chip: cada 1,28 s de audio se procesa en 0,90 s con ambos núcleos a 400 MHz (0,70× tiempo real); la latencia de finalización de palabra es de unos 2 s de mediana (1,9–2,3 s, 95 % en 4,1 s). Con hotwords activadas, en 140 clips de texto a voz (35 frases, 4 voces), la tasa de acierto de palabras de la lista sube de 0 a 46 de 60, las frases de 62 a 70 de 72, con 0 falsos positivos en 40 clips sin ellas y un WER que baja de 19,5 % a 3,4 %.

## Requisitos de hardware

- Placa: ESP32-P4 de revisión de chip v3 (ESP32-P4X) con 32 MB de PSRAM, micrófono, pantalla y tarjeta microSD. El autor lo midió en la ESP32-P4X-Function-EV-Board de Espressif.
- Memoria: los pesos (26,65 MB) y los 4 MB de estado del motor residen en la PSRAM de 32 MB; quedan 121 KB de RAM interna libre.
- Almacenamiento: los pesos se leen desde la microSD al arrancar (2,9 s).
- No requiere GPU ni acelerador neuronal; no está pensado para ejecutarse en A100, H100 ni RTX 4090.
- Despliegue: firmware ESP-IDF v6.1 con `idf.py set-target esp32p4`; el motor es pieasr (github.com/BoumedineBillal/esp32-pie-asr). No es compatible con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 0,70× tiempo real en el chip; latencia de palabra de unos 2 s (95 % en 4,1 s).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / modalidad | Rendimiento (test-clean / test-other) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Kroko 2/4 bits) | 65,7M | streaming, chunks de 1,28 s | 4,34 % / 10,26 % | CC-BY-SA-4.0 | Hugging Face + firmware en GitHub |
| Kroko original (sherpa-onnx) | 65,7M | streaming | 3,94 % / 9,17 % | no disponible en la información | sherpa-onnx |
| Oído | 13M | streaming o utterance completo | 4,86 % / 11,03 % (streaming); 3,70 % / 8,23 % (completo) | no disponible en la información | paper arXiv:2610.13447 |
| Moonshine Tiny | 27,1M | utterance completo | 4,52 % / 11,71 % | no disponible en la información | paper arXiv:2410.15608 |
| Whisper tiny.en | 37,8M | utterance completo | 5,66 % / 15,45 % | no disponible en la información | paper arXiv:2410.15608 |

## Limitaciones y advertencias

- Solo reconoce inglés; no hay soporte multilingüe.
- La cuantización a 2/4 bits cuesta 0,4 puntos de WER en test-clean y 1,1 en test-other frente al Kroko original en int8.
- Los pesos están en formato propietario `KRK1`: no se pueden cargar con PyTorch, ONNX Runtime ni herramientas convencionales; requieren el motor pieasr.
- El hardware es muy específico: ESP32-P4 de revisión v3 con 32 MB de PSRAM; no funciona en otras placas sin adaptación.
- La latencia de palabra es de unos 2 s, superior a la de sistemas en la nube; no apta para aplicaciones que exijan respuesta inmediata.
- Los resultados de benchmarks son declarados por el autor y no están verificados de forma independiente (`verified: false`).
- No se dispone de información sobre sesgos del dataset de entrenamiento original ni sobre tasas de alucinación en dominios fuera de LibriSpeech.
- Licencia CC-BY-SA-4.0: permite uso comercial con atribución y obliga a compartir las obras derivadas bajo la misma licencia; conviene revisar las implicaciones para productos propietarios.
- El tamaño del repositorio es de 0,0 GB según Hugging Face, lo que puede indicar que los pesos no están alojados directamente o que la medición no está actualizada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BoumedineBillal/esp32-pie-asr-kroko-en
- Modelo base: https://huggingface.co/Banafo/Kroko-ASR
- Motor y firmware: https://github.com/BoumedineBillal/esp32-pie-asr
- Paper del modelo: https://huggingface.co/papers/2610.38739
- Paper de Oído: https://arxiv.org/abs/2610.13447
- Paper de Moonshine: https://arxiv.org/abs/2410.15608
- sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx
- ESP-SR MultiNet (Espressif): https://docs.espressif.com/projects/esp-sr/en/latest/esp32s3/speech_command_recognition/README.html
