# litert-community/wav2vec2-base-960h-LiteRT

## Resumen

El modelo `litert-community/wav2vec2-base-960h-LiteRT` es una conversión del reconocedor de voz automático (ASR) `facebook/wav2vec2-base-960h` al formato LiteRT (antes TFLite), optimizada para ejecución íntegra en GPU móvil mediante la API `CompiledModel` (ML Drift). El modelo original, desarrollado por Facebook AI, emplea la arquitectura wav2vec 2.0 con un encoder transformer preentrenado sobre 960 horas de audio no etiquetado de LibriSpeech y fine-tuneado para transcripción en inglés. Esta versión LiteRT elimina por completo el paso de FFT: la forma de onda cruda a 16 kHz entra directamente en el extractor de características basado en convoluciones 1D, sin cálculo de mel/fbank en el host. El resultado es un sistema de reconocimiento de voz de carácter CTC (29 caracteres más especiales) con decodificación greedy y sin modelo de lenguaje, pensado para despliegue en dispositivos Android con aceleración por GPU o NPU.

La relevancia actual de este modelo radica en su capacidad para ejecutar ASR de calidad en hardware móvil de gama media y alta con un factor de tiempo real (RTF) de aproximadamente 0,05, lo que permite transcripción de audio de 16 segundos en menos de un segundo. Se distribuye como dos grafos GPU separados (frontend y head) para superar los límites de compilación de shaders en GPUs Mali, y ofrece soporte experimental para NPU Snapdragon (Hexagon) con mejoras de velocidad y carga. Es una opción práctica para desarrolladores que necesitan ASR offline en Android sin depender de servicios en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec 2.0 base (encoder transformer con extractor de características convolucional 1D) |
| Parametros totales | no disponible (modelo base: facebook/wav2vec2-base-960h) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | ventana fija de 16 segundos de audio (256000 muestras a 16 kHz) |
| Tipos de cuantizacion | fp16 (archivos `_fp16.tflite`) |
| Idiomas soportados | ingles (en) |
| Licencia | apache-2.0 |
| Formato de pesos | LiteRT (tflite), dos grafos: `w2v2_asr_frontend_fp16.tflite` (9 MB) y `w2v2_asr_head_fp16.tflite` (180 MB) |

## Arquitectura y entrenamiento

El modelo base es wav2vec 2.0, una arquitectura que combina un extractor de características convolucional (siete capas con kernels y strides decrecientes) con un encoder transformer de 12 capas y 768 dimensiones ocultas. El preentrenamiento se realizó sobre 960 horas de audio no etiquetado de LibriSpeech mediante una tarea contrastiva sobre representaciones cuantizadas, y posteriormente se fine-tuneó para ASR con las transcripciones correspondientes, añadiendo una cabeza lineal de clasificación CTC. En esta conversión a LiteRT, el modelo se divide en dos grafos: el frontend (9 MB) procesa la forma de onda y genera características `[1, 799, 768]` a 50 Hz, y el head (180 MB) contiene el transformer completo y la capa de salida CTC, produciendo logits `[1, 799, 32]`.

La conversión, realizada con `litert-torch`, mantiene una correlación numérica de 1.000000 con el modelo PyTorch original. Se aplicaron varias optimizaciones: GELU se sustituyó por tanh-GELU, el GroupNorm del frontend se reformuló como group-norm 4D para evitar `GATHER_ND`, el weight-norm de la convolución posicional se plegó en un peso estático, y se eliminó la máscara de atención bidireccional (ventana fija → SDPA simple). La cabeza CTC es una capa lineal sin normalización, por lo que los logits se obtienen directamente. No se incluye modelo de lenguaje; la decodificación es greedy CTC con supresión de blancos y repeticiones.

## Capacidades

- Reconocimiento de voz en ingles (ASR) con transcripción a nivel de carácter (CTC, 29 caracteres + especiales).
- Decodificación greedy sin modelo de lenguaje, con manejo de blancos (`<pad>`) y delimitador de palabra `|`.
- Ejecución íntegra en GPU móvil (Adreno, Mali) mediante LiteRT `CompiledModel`, sin FFT en el host.
- Soporte experimental para NPU Snapdragon (Hexagon v81) en el grafo head, con mayor velocidad y carga más rápida que la GPU.
- Procesamiento de audio de 16 kHz en ventanas fijas de 16 segundos (256000 muestras), con relleno de ceros para audios más cortos.
- Salida de logits crudos para integración con decodificadores externos (beam search + LM) si se requiere mayor precisión.
- No incluye capacidades de tool calling, agentes, visión ni multilingüismo; es exclusivamente ASR en inglés.

## Casos de uso

- Transcripción offline en Android: la aplicación puede capturar audio del micrófono, rellenarlo a 16 segundos y ejecutar los dos grafos en GPU para obtener texto en tiempo real, sin conexión a internet ni latencia de red.
- Asistente de voz en dispositivos móviles: integración en apps de dictado o comandos de voz, donde el modelo transcribe la entrada del usuario y un módulo posterior interpreta la intención.
- Subtitulado automático de vídeos grabados con el móvil: al procesar segmentos de 16 segundos, se pueden generar subtítulos para vídeos cortos o clips, con la posibilidad de encadenar ventanas para audios más largos.
- Accesibilidad para personas con discapacidad auditiva: conversión de conversaciones o avisos sonoros en texto visible en tiempo real, aprovechando el bajo RTF (0,05) y la ejecución local.
- Pruebas de concepto de ASR embebido: desarrolladores que evalúan la viabilidad de wav2vec2 en hardware móvil de gama media (Pixel 8a, Galaxy S26) pueden usar este modelo como referencia de rendimiento y consumo.
- Investigación en optimización de modelos: el desglose en dos grafos y las notas de conversión (GELU tanh, GroupNorm 4D, eliminación de máscara) sirven como caso de estudio para portar otros modelos transformer a LiteRT con GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (WER, MMLU, etc.) en la informacion disponible. Sin embargo, la model card incluye mediciones de rendimiento on-device que se resumen a continuacion:

| Dispositivo / backend | Archivo | Inferencia (mediana / min) | Carga | RTF |
|---|---|---|---|---|
| Pixel 8a, GPU (CompiledModel) | frontend + head | 448 ms + 391 ms por ventana de 16 s | 0,7 s + 1,5 s | ≈ 0,05 |
| Samsung Galaxy S26, GPU (Adreno) | frontend | 90,41 ms / 88,96 ms | 668 ms | - |
| Samsung Galaxy S26, GPU (Adreno) | head | 104,1 ms / 103,8 ms | 1322 ms | - |
| Samsung Galaxy S26, NPU (Hexagon v81) | head | 76,18 ms / 74,02 ms | 226 ms | - |

Ademas, se reporta una correlacion de 0,9928 entre los logits del dispositivo y la referencia float de escritorio, con un 97,0 % de acuerdo en el argmax por frame y transcripcion identica a la referencia. La conversion numerica es exacta (corr 1,000000) entre tflite y PyTorch.

## Requisitos de hardware

- VRAM estimada: no especificada, pero los archivos pesan 9 MB (frontend) y 180 MB (head), por lo que caben en cualquier GPU movil moderna; el consumo de memoria en runtime no se indica.
- GPU recomendadas: Adreno (Qualcomm) y Mali (ARM) con soporte para LiteRT `CompiledModel`; probado en Pixel 8a (Mali) y Samsung Galaxy S26 (Adreno).
- NPU compatible: Snapdragon Hexagon v81 (SM8850) para el grafo head, con mejor rendimiento que la GPU (76 ms vs 104 ms) y carga 5,84x mas rapida.
- No requiere GPU de escritorio; es un modelo pensado para dispositivos Android con aceleracion por GPU o NPU.
- Opciones de despliegue: LiteRT `Interpreter` (Python) y `CompiledModel` (Kotlin/Android). No se menciona soporte para vLLM, llama.cpp u Ollama.
- Latencia: en Pixel 8a, el pipeline completo tarda ~839 ms por ventana de 16 s (RTF 0,05); en Galaxy S26, el head tarda 76-104 ms segun backend.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Licencia | Formato | Ejecucion |
|---|---|---|---|---|---|---|
| `litert-community/wav2vec2-base-960h-LiteRT` | wav2vec 2.0 base | no disponible (base ~95M) | 16 s fijo | Apache 2.0 | LiteRT (tflite) | GPU/NPU movil |
| `facebook/wav2vec2-base-960h` | wav2vec 2.0 base | ~95M | ilimitado (por chunks) | Apache 2.0 | PyTorch | CPU/GPU escritorio |
| `torchaudio.pipelines.WAV2VEC2_ASR_BASE_960H` | wav2vec 2.0 base | ~95M | ilimitado | BSD-3-Clause (torchaudio) | PyTorch | CPU/GPU escritorio |

La principal diferencia es el formato y el objetivo: la version LiteRT esta optimizada para dispositivos moviles con aceleracion por GPU/NPU, mientras que el modelo original requiere PyTorch y recursos de escritorio. No se dispone de comparativas de WER entre ambas versiones en la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta ingles; no hay capacidades multilingues.
- La decodificacion greedy sin modelo de lenguaje produce errores de ortografia en palabras dificiles (ej. "GRAVED" en lugar de "GRAVE"), como se indica en la model card.
- Ventana fija de 16 segundos: audios mas largos deben segmentarse y procesarse por partes, con posible perdida de contexto entre ventanas.
- El grafo frontend no funciona en NPU Hexagon (falla en runtime a pesar de compilar correctamente); solo el grafo head es compatible con NPU.
- La compilacion de grafos en GPU puede fallar si se fusionan demasiadas operaciones (limite de shaders en Mali); por eso se distribuyen dos grafos separados.
- No incluye modelo de lenguaje; para mejorar la precision es necesario anadir un decodificador beam search con LM en el host.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base tiene restricciones de atribucion (Facebook AI).
- No se proporcionan datos de WER ni comparativas con otros ASR en la informacion disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/litert-community/wav2vec2-base-960h-LiteRT
- Modelo base original: https://huggingface.co/facebook/wav2vec2-base-960h
- Documentacion de torchaudio (WAV2VEC2_ASR_BASE_960H): https://docs.pytorch.org/audio/stable/generated/torchaudio.pipelines.WAV2VEC2_ASR_BASE_960H.html
- Paper de wav2vec 2.0 (arXiv:2006.11477): https://arxiv.org/abs/2006.11477
- Repositorio de conversion (NPU recipe): https://github.com/john-rocky/hf-to-litertlm/blob/main/docs/android-npu.md
- Repositorio de conversion (GPU recipe): https://github.com/john-rocky/hf-to-litertlm/blob/main/ (enlace truncado en la informacion)
