# litert-community/Phonon-2.5-English

## Resumen

Phonon-2.5 English es un modelo de reconocimiento automático del habla (ASR) en inglés desarrollado por Fermion Research, publicado originalmente en formato PyTorch comprimido y convertido aquí a LiteRT por la comunidad litert-community para su ejecución en dispositivos Android. El modelo sigue la arquitectura de NVIDIA parakeet-tdt-0.6b-v3 (encoder convolucional y transformer con decodificación TDT, Token-and-Duration Transducer) y está diseñado para transcripción de audio a texto de alta precisión con un tamaño de descarga muy reducido: 157,6 MB en su empaquetado original.

La relevancia de esta conversión concreta reside en que expone el modelo a la NPU Hexagon y a la GPU de los SoC móviles mediante LiteRT, manteniendo una tasa de error muy baja. Según la model card, sobre el conjunto completo LibriSpeech test-clean el modelo alcanza un WER del 1,647 % en la NPU del Galaxy S26 (Snapdragon SM8850), frente al 1,655 % de la ejecución de referencia en PyTorch float32. En velocidad, el encoder float16 compilado para NPU transcribe 179 veces más rápido que tiempo real, 51 veces en GPU y 57 veces en CPU con el encoder int8.

El modelo está pensado para ASR de inglés en dispositivos móviles y entornos con recursos limitados, con ventanas de audio de hasta 30 segundos y siete longitudes de ventana optimizadas. La conversión no conserva el empaquetado de pesos de bajo bit del original, sino que expande los pesos grandes a float16 o int8, lo que incrementa el tamaño de los ficheros pero habilita la aceleración por hardware en Android.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Encoder convolucional + transformer con decodificación TDT (Token-and-Duration Transducer), basada en nvidia/parakeet-tdt-0.6b-v3 |
| Parámetros totales | no disponible (el modelo base parakeet-tdt-0.6b-v3 tiene 0,6 B; Phonon-2.5 English se distribuye en 157,6 MB) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | ventanas de audio de hasta 30 s (479.840 muestras a 16 kHz); siete longitudes de ventana: 5, 7,5, 10, 15, 20, 25 y 30 s |
| Tipos de cuantización | float16 (GPU y NPU) e int8 (CPU); el modelo original usa pesos de 5 valores por fila en 264 capas lineales del encoder y tablas de 6 bits en el resto |
| Idiomas soportados | inglés (en) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | TFLite (LiteRT): encoder f16, encoder i8, decoder i8, front-end mel por longitud de ventana, tokenizer.json |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura parakeet-tdt-0.6b-v3 de NVIDIA: un encoder que procesa características log-mel (128 bins Slaney, STFT de 512 puntos, ventana Hann de 400 muestras, hop de 160) y una decodificación TDT greedy que combina una red de predicción (`predict`) y una red conjunta (`joint`). El front-end mel realiza pre-énfasis, STFT, normalización log-mel por ventana sobre los frames válidos y produce `features`, `mel_mask` y `frame_mask` con remuestreo temporal de factor 8.

El empaquetado original de Fermion Research comprime los pesos: las 264 capas lineales del encoder almacenan cinco valores por fila de salida ({0, ±lo, ±hi}) y el resto de pesos grandes son tablas de 6 bits, lo que permite una descarga de 157,6 MB. La conversión a LiteRT no conserva ese empaquetado: expande los pesos grandes a float16 (GPU/NPU) o int8 (CPU, con una escala por canal de salida en capas lineales y las dos convoluciones 1×1 del subsampling, manteniendo en float32 las convoluciones depthwise y las 24 tablas de posición relativa). Los grafos se construyen con el mismo código que la conversión de Phonon-2 y los ficheros mel son idénticos en bytes. No se detallan en la información disponible los datos de entrenamiento (número de tokens, composición del dataset) ni si hubo RLHF o DPO.

## Capacidades

- Reconocimiento automático del habla en inglés (transcripción de audio a texto).
- Procesamiento de audio de 16 kHz mono en ventanas de hasta 30 segundos, con selección automática de la longitud de ventana más pequeña que contiene la muestra.
- Decodificación TDT greedy con red de predicción y red conjunta.
- Ejecución acelerada por NPU Hexagon (SM8850), GPU y CPU en Android mediante LiteRT.
- Front-end mel integrado en TFLite, con máscaras de frames válidos para manejar ventanas parciales.
- Tokenizador compatible con nvidia/parakeet-tdt-0.6b-v3 para convertir identificadores en texto.
- No se documentan capacidades de tool calling, agentes, visión, audio de entrada distinto de ASR ni modo de razonamiento.

## Casos de uso

- Transcripción en tiempo real en Android: el encoder float16 compilado para la NPU del SM8850 transcribe 179× más rápido que tiempo real, lo que permite dictado y subtitulado en vivo en el propio dispositivo sin enviar audio a la nube.
- Subtitulado de vídeo y reuniones: las ventanas de 30 s y la unión de textos por ventana permiten procesar grabaciones largas por tramos, con la advertencia de que los cortes son fijos y pueden partir palabras.
- Aplicaciones de accesibilidad: transcripción local de voz a texto para personas con discapacidad auditiva, con un consumo de memoria contenido (1,63 GB en NPU en el Galaxy S26).
- Asistentes de voz offline: integración del decoder i8 y el encoder i8 en un pipeline de CPU para dispositivos sin NPU, con 57× tiempo real y pico de 6,09 GB en el dispositivo de referencia.
- Procesamiento por lotes de audio en servidores con CPU: el conjunto int8 (0,94 GB) permite transcribir grandes volúmenes de audio en inglés con un WER cercano al de referencia.
- Investigación en ASR de bajo bit y despliegue móvil: la conversión sirve como referencia reproducible para comparar precisión y latencia entre NPU, GPU y CPU con el mismo modelo.
- Integración en aplicaciones de notas de voz: el runner de línea de comandos para Android (`ultra_asr_runner_p7.cc`) y el script de compilación facilitan incorporar el modelo a apps nativas.

## Benchmarks y rendimiento

| Métrica | Valor | Contexto |
|---|---|---|
| WER LibriSpeech test-clean (NPU Galaxy S26) | 1,647 % | 655 utterances, medidas el 2026-11-08 |
| WER LibriSpeech test-clean (PyTorch float32) | 1,655 % | Referencia de las mismas ventanas |
| WER medio Open ASR Leaderboard (7 conjuntos ingleses) | 4,82 % | Dato del modelo base FermionResearch/Phonon-2.5-English |
| Velocidad encoder float16 NPU (SM8850) | 179× tiempo real | Galaxy S26 |
| Velocidad encoder float16 GPU | 51× tiempo real | Galaxy S26 |
| Velocidad encoder int8 CPU | 57× tiempo real | Galaxy S26 |
| Pico de memoria NPU | 1,63 GB | Galaxy S26 (12 GB) |
| Pico de memoria GPU | 3,63 GB | Galaxy S26 |
| Pico de memoria CPU | 6,09 GB | Galaxy S26; Android cerró 20 apps en segundo plano |

## Requisitos de hardware

- VRAM/RAM estimada: conjunto NPU 1,44 GB en disco y pico de 1,63 GB; conjunto GPU 1,48 GB en disco y pico de 3,63 GB; conjunto CPU 0,94 GB en disco y pico de 6,09 GB (mediciones en Galaxy S26 con 12 GB).
- GPU recomendadas: no se especifican modelos de escritorio; la conversión está orientada a GPU móviles vía LiteRT. El encoder f16 sin compilar es el fichero para GPU.
- NPU: encoder float16 compilado ahead-of-time para la NPU Hexagon del SM8850 (Snapdragon del Galaxy S26) con QAIRT 2.50.
- ¿Cabe en GPU de consumo? No hay datos para GPU de escritorio; en móvil el conjunto GPU requiere unos 3,63 GB de pico, viable en dispositivos de 8 GB o más.
- Opciones de despliegue: LiteRT 2.3.0 (ficheros TFLite), runner de línea de comandos para Android (`ultra_asr_runner_p7.cc` con LiteRT C API y `build_android.sh`), y la librería Android de Fermion Research (`libphonon-android-arm64-v8a-1.1.0`) para los pesos empaquetados originales.
- Latencia y throughput: 179× tiempo real en NPU, 51× en GPU y 57× en CPU con el encoder correspondiente, según la model card.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | WER medio (Open ASR, 7 conjuntos) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Phonon-2.5 English (esta conversión LiteRT) | 0,6 B (base parakeet-tdt-0.6b-v3) | ventanas de 30 s | 4,82 % (modelo base) | CC-BY-4.0 | Hugging Face, TFLite para Android |
| Underdog Bark 3.0 | no disponible | no disponible | 4,94 % | no disponible | no disponible |
| Phonon-2 | no disponible | no disponible | 5,21 % | no disponible | Hugging Face (FermionResearch/Phonon-2) |
| nvidia/parakeet-tdt-0.6b-v3 | 0,6 B | no disponible | no disponible | no disponible | Hugging Face |

## Limitaciones y advertencias

- Solo inglés: no soporta otros idiomas.
- Los cortes de audio son fijos cada 30 s, no en pausas; las palabras en el punto de corte pueden dividirse o perderse (en un clip VoxPopuli de 38 s se perdieron 13 palabras alrededor del corte de 30 s).
- Las ventanas de menos de 320 muestras (dos frames mel) se descartan y no generan texto.
- La conversión no conserva el empaquetado de bajo bit: los ficheros resultantes son mayores (0,94–1,48 GB) que el original de 157,6 MB.
- El pico de memoria en CPU (6,09 GB) puede provocar el cierre de aplicaciones en segundo plano en Android; el dispositivo de referencia necesitó liberar 20 apps.
- El encoder NPU está compilado específicamente para el SM8850; no es portable a otras NPU sin recompilación.
- Riesgo de alucinación y errores en audio con ruido, acentos no ingleses o solapamiento de hablantes no documentado en la información disponible.
- Licencia CC-BY-4.0: permite uso comercial con atribución; deben respetarse las condiciones de la licencia del modelo base.
- No se documentan sesgos específicos ni evaluaciones de robustez fuera de LibriSpeech y Open ASR Leaderboard.

## Enlaces

- Hugging Face (esta conversión): https://huggingface.co/litert-community/Phonon-2.5-English
- Modelo base: https://huggingface.co/FermionResearch/Phonon-2.5-English
- Página del modelo en Fermion Research: https://www.fermionresearch.com/models/phonon-2-5-english/
- Arquitectura de referencia: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Conversión previa Phonon-2: https://huggingface.co/litert-community/Phonon-2
- Modelo Phonon-2: https://huggingface.co/FermionResearch/Phonon-2
- Librería Android de Fermion Research: https://github.com/fermionresearch/phonon/releases/tag/libphonon-android-arm64-v8a-1.1.0
