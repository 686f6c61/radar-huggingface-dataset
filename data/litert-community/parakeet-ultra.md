# litert-community/parakeet-ultra

## Resumen

parakeet-ultra (versión LiteRT) es una conversión del modelo de reconocimiento automático de voz moondream/parakeet-ultra al formato LiteRT (.tflite), publicada por la organización litert-community en Hugging Face. El modelo base, a su vez, es un post-entrenamiento del parakeet-tdt-0.6b-v3 de NVIDIA, con la misma arquitectura, el mismo tokenizador y los mismos 0,6B de parámetros. Su propósito es permitir transcripción de voz a texto en 25 idiomas directamente en dispositivos móviles y edge, ejecutándose sobre NPU, GPU o CPU mediante el runtime de LiteRT.

La relevancia de esta ficha de modelo radica en el rendimiento medido en dispositivos reales: sobre un Galaxy S26, los codificadores en float16 sobre la NPU transcriben 115 veces más rápido que el tiempo real (39 veces en GPU), y los codificadores int8 alcanzan 34 veces en CPU y 10 veces en la CPU de un Pixel 8a. La calidad se mantiene prácticamente intacta: el word error rate en LibriSpeech test-clean es del 1,417 % sobre la NPU del Galaxy S26, frente al 1,426 % de la ejecución float32 en PyTorch de referencia.

El pipeline completo consta de un front end log-mel, un encoder convertido a .tflite (en variantes int8 y float16, con ventanas de 10, 20 y 30 segundos) y un decodificador TDT greedy que se ejecuta en el host, acompañado de un runner de línea de comandos para Android.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Parakeet TDT (encoder + red de predicción y red joint tipo transductor RNN-T/TDT), 640 de dimensión de encoder |
| Parametros totales | 0,6B (según la model card del modelo base) |
| Parametros activos | no disponible (no es MoE; todos los parámetros se usan en cada paso) |
| Longitud de contexto | Ventanas de audio de hasta 30 s (grafos de 10 s, 20 s y 30 s; 479.840 muestras por ventana a 16 kHz) |
| Tipos de cuantizacion | int8 (pesos, con escala por canal de salida; convoluciones depthwise y 24 tablas de posición relativa en float32) y float16 (pesos lineales y de convolución; normas en float32) |
| Idiomas soportados | 25: en, de, fr, es, it, pt, ru, uk, hr, sl, lv, lt, et, fi, sv, da, nl, pl, cs, sk, hu, ro, bg, el, mt |
| Licencia | CC-BY-4.0 |
| Formato de pesos | .tflite (LiteRT 2.3.0), convertido con litert-torch 0.9.4 y ai-edge-quantizer 0.10.0 |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de parakeet-tdt-0.6b-v3 de NVIDIA: un encoder que procesa características log-mel (128 bins Slaney, STFT de 512 puntos, ventana Hann de 400 muestras y hop de 160) y produce representaciones de dimensión 640 con submuestreo de 8x, combinado con un decodificador TDT (Token-and-Duration Transducer) formado por una red de predicción LSTM (estados h y c de [2, 1, 640]) y una red joint que emite 8.198 logits: 8.193 logits de token (el 8192 es el blank) más 5 logits de duración (0 a 4 frames). El decodificado es greedy sobre el transductor. El checkpoint original almacena sus matrices de pesos (lineales, convoluciones, LSTM) en float16 y sus normas en float32.

Respecto al entrenamiento, la model card no detalla el número de tokens ni la composición del dataset; solo indica que moondream/parakeet-ultra es una versión post-entrenada del parakeet-tdt-0.6b-v3 de NVIDIA, con un config.json byte-idéntico al de v3. No se menciona RLHF ni DPO (hablando en términos generales, no aplicables a un modelo ASR).

Como innovaciones de la conversión destacan: el uso de buckets de ventanas (cada ventana de audio se enruta al grafo más pequeño que la contenga, evitando trabajo sobre padding), el reescalado de las entradas de LayerNorm para que la aritmética float16 no desborde, y un runner Android con opciones `--pipeline` y `--pipeline-depth` para procesado en canalización. La cabecera de detección de actividad de voz (VAD) del checkpoint original no se convirtió, por lo que el audio largo se corta en puntos fijos de 30 s y no en pausas naturales.

## Capacidades

- Transcripción de voz a texto (ASR) en 25 idiomas, entre ellos español, inglés, francés, alemán, italiano, portugués, ruso y ucraniano.
- Procesado de audio en ventanas de hasta 30 s, con buckets de 10 s y 20 s para evitar computación sobre padding en audios cortos.
- Decodificación greedy TDT con predicción de duración por token (0 a 4 frames), ejecutada en el host.
- Ejecución acelerada por hardware en Android: NPU y GPU (variantes float16) y CPU (variantes int8).
- Pipeline completo autocontenido: front end log-mel, encoder y decodificador, más runner de línea de comandos para Android (LiteRT C API) y script de conversión de tokens a texto.
- No soporta tool calling, agentes, ni capacidades de generación de texto, código, visión o audio generativo: es un modelo exclusivamente de reconocimiento de voz.

## Casos de uso

- Transcripción offline en móviles Android: gracias a los archivos .tflite y al runner incluido, se puede transcribir audio sin conexión en un dispositivo, adecuado para aplicaciones de notas de voz o dictado que prioricen la privacidad.
- Subtitulado y transcripción de reuniones en el dispositivo: las ventanas de 30 s y el pipeline por lotes permiten transcribir grabaciones largas de forma secuencial a alta velocidad (115x tiempo real en NPU del Galaxy S26).
- Asistentes de voz multilingües: el soporte de 25 idiomas permite construir interfaces de voz que reconozcan el habla en varios idiomas europeos sin cambiar de modelo.
- Procesado masivo de audio en terminales de gama media: la variante int8 sobre CPU alcanza 10x tiempo real incluso en un Pixel 8a, útil para transcribir colas de audio en dispositivos sin NPU o GPU disponible.
- Integración en apps con restricciones de latencia: el enrutado por buckets (10/20/30 s) minimiza la latencia en audios cortos, apropiado para comandos de voz interactivos.
- Sistemas de accesibilidad: transcripción en tiempo casi real de conversaciones para usuarios con dificultades auditivas, ejecutándose localmente en el teléfono.

## Benchmarks y rendimiento

Datos publicados en la model card (medidos el 2026-10-31, sobre 655 utterances de LibriSpeech test-clean):

| Configuracion | Dispositivo | Velocidad relativa al tiempo real |
|---|---|---|
| Encoder float16 | Galaxy S26, NPU | 115x |
| Encoder float16 | Galaxy S26, GPU | 39x |
| Encoder int8 | Galaxy S26, CPU | 34x |
| Encoder int8 | Pixel 8a, CPU | 10x |

| Metrica | Valor |
|---|---|
| WER en LibriSpeech test-clean (NPU Galaxy S26, float16) | 1,417 % |
| WER de referencia (float32 PyTorch, mismas ventanas) | 1,426 % |

No se han publicado resultados de benchmarks comparativos con otros modelos ASR en la información disponible.

## Requisitos de hardware

- Almacenamiento: el repositorio completo ocupa 5,6 GB. El conjunto int8 para CPU pesa 1,95 GB (incluyendo mel y decodificador); el conjunto float16 para GPU/NPU pesa 3,68 GB.
- VRAM/memoria: los archivos individuales de encoder van desde 616 MB (int8, 10 s) hasta 1,24 GB (float16, 30 s); se necesita memoria suficiente para cargar el encoder más el front end y el decodificador (17,9 MB este último).
- Dispositivos de referencia: Galaxy S26 (NPU y GPU, float16; CPU, int8) y Pixel 8a (CPU, int8). No se especifican GPUs de servidor ni requisitos para escritorio.
- Diseñado para Android con LiteRT 2.3.0 (C API); el decodificador TDT se ejecuta en el host (CPU).
- Despliegue: mediante el runner de línea de comandos incluido (`ultra_asr_runner_p.cc` con `build_android.sh`), compilable para Android; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este formato).
- Latencia: transcripción a 115x tiempo real en NPU del Galaxy S26 y a 10x tiempo real en CPU de un Pixel 8a; no se publican cifras absolutas de latencia por utterance.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Formato | Licencia | Particularidad |
|---|---|---|---|---|---|
| litert-community/parakeet-ultra | 0,6B | 25 | .tflite (int8/f16) | CC-BY-4.0 | Conversión LiteRT optimizada para NPU/GPU/CPU en Android |
| nvidia/parakeet-tdt-0.6b-v3 | 0,6B | no disponible en la información proporcionada | PyTorch/NeMo | no disponible | Modelo original de NVIDIA en el que se basa |
| moondream/parakeet-ultra | 0,6B | 25 | PyTorch (float16/float32) | no disponible | Modelo base post-entrenado del que deriva esta conversión |
| litert-community/parakeet-redux | no disponible | no disponible | .tflite | no disponible | "Hermano ternario" de la misma arquitectura; mismo runner y grafos |

## Limitaciones y advertencias

- La cabecera de actividad de voz (VAD) del checkpoint original no se convirtió: el audio largo se corta en puntos fijos de 30 s, no en pausas, por lo que una palabra que cruce un corte puede partirse, perderse o repetirse.
- Las filas del encoder pasadas de los frames válidos quedan indefinidas; el consumidor debe respetar las máscaras.
- Una ventana de menos de 320 muestras (dos frames mel) se descarta y no genera texto.
- No se dispone de información sobre sesgos del modelo, tasas de alucinación ni rendimiento por idioma individual más allá del WER agregado en LibriSpeech test-clean (inglés).
- La licencia CC-BY-4.0 permite el uso comercial pero exige atribución.
- Las velocidades publicadas corresponden exclusivamente a los archivos .tflite de este repositorio ejecutados con la C API de LiteRT 2.3.0; no son extrapolables a LiteRT-LM ni a otras conversiones de esta arquitectura.
- El decodificador se ejecuta en el host de forma greedy, sin rescoring ni decodificación por haz.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/litert-community/parakeet-ultra
- Modelo base: https://huggingface.co/moondream/parakeet-ultra
- Modelo original de NVIDIA: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Conversión hermana (parakeet-redux): https://huggingface.co/litert-community/parakeet-redux
