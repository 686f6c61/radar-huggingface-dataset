# litert-community/Fun-ASR-Nano-2512

## Resumen

Fun-ASR-Nano-2512 en formato LiteRT-LM es una conversión del modelo de reconocimiento automático del habla (ASR) end-to-end de Tongyi Lab (FunAudioLLM) al formato `.litertlm` de Google, pensada para inferencia en dispositivo (*on-device*) y en el borde (*edge*). El modelo original combina un codificador de audio SenseVoice SAN-M de 70 capas con un adaptador de 2 capas que alimenta un modelo de lenguaje Qwen3-0.6B, encargado de generar la transcripción. Esta conversión empaqueta todo el pipeline (audio a texto) en un único fichero de 1,26 GB que se ejecuta sobre el runtime LiteRT-LM sin necesidad de modificar el runtime ni el conversor.

La relevancia de esta ficha reside en que permite ejecutar ASR multilingüe (chino con 7 dialectos y 26 acentos regionales, inglés y japonés) completamente en local, sobre hardware móvil y sin conexión. La versión publicada el 2026-11-17 reescribe el grafo de prefill/decode para GPU manteniendo los pesos intactos, lo que multiplica el rendimiento de decodificación del LM: en un Galaxy S26 pasa de 26,75 tok/s a 51,45 tok/s en GPU. En CPU se mantiene en el rango de 21,43 a 22,66 tok/s tras un prefill de 1.024 tokens.

El modelo acepta *hotwords* en el prompt para sesgar la transcripción hacia vocabulario específico (nombres propios, terminología técnica) y admite instrucciones de tarea (transcripción con o sin normalización de texto inversa, idioma de salida). No incluye marcas de tiempo porque el checkpoint no tiene pesos de decodificador CTC. La licencia es Apache-2.0, lo que facilita su uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida: codificador de audio SenseVoice SAN-M (70 capas) + adaptador (2 capas) + LM Qwen3-0.6B (transformer decoder) |
| Parámetros totales | no disponible (el LM es Qwen3-0.6B; el total del pipeline no se declara) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | Ventana de audio fija de 30,24 s (504 frames de 960 muestras a 16 kHz); contexto de texto del LM no disponible |
| Tipos de cuantización | LM int8 dinámico (pesos) con tabla de embeddings int8; codificador de audio fp16 en pesos y fp32 en cómputo |
| Idiomas soportados | Chino (7 dialectos, 26 acentos regionales), inglés, japonés |
| Licencia | Apache-2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM); modelo base en formato original no disponible en esta ficha |

## Arquitectura y entrenamiento

El pipeline sigue un diseño encoder-adaptor-decoder. El codificador de audio es un SenseVoice SAN-M de 70 capas que procesa una ventana fija de 30,24 s de PCM a 16 kHz, con un front-end de *fbank* + LFR (log filter bank con reducción de frecuencia). Un adaptador de 2 capas proyecta las representaciones acústicas al espacio de embeddings del LM. El decodificador es Qwen3-0.6B, que genera la transcripción token a token en modo greedy (top-k 1). El runtime LiteRT-LM corta el PCM en frames de 60 ms, ejecuta el codificador de audio y coloca los embeddings resultantes en un prompt ChatML; el encoder devuelve hasta 63 embeddings por ventana.

El fichero `.litertlm` se descompone en cuatro secciones: `tf_lite_audio_encoder_hw` (473 MB, front-end fbank + LFR, encoder SAN-M y adaptador), `tf_lite_prefill_decode` (622 MB, Qwen3-0.6B int8), `tf_lite_embedder` (159 MB, tabla de embeddings int8) y `HF_Tokenizer_Zlib` (2,1 MB, tokenizer Qwen3), más un `LlmMetadataProto` de 1,7 KB con plantilla de prompt, tokens de parada y ajustes de audio. No se dispone de información sobre el número de tokens de entrenamiento, composición del dataset ni si hubo RLHF/DPO en la información proporcionada. La innovación técnica destacable de esta conversión es la reescritura del grafo de prefill/decode para GPU (OpenCL en Android, WebGPU sobre Metal en Apple) manteniendo los pesos, que casi duplica el throughput de decodificación en el dispositivo de referencia.

## Capacidades

- Reconocimiento automático del habla end-to-end: audio PCM 16 kHz mono en WAV, texto como salida.
- Multilingüe: chino (incluye 7 dialectos y 26 acentos regionales), inglés y japonés.
- Instrucciones de tarea en el prompt: transcripción por defecto (`语音转写：`), transcripción sin normalización de texto inversa (`语音转写，不进行文本规整：`) y transcripción forzada a un idioma (`语音转写成英文：`, con `中文`, `英文`, `日文`).
- Soporte de *hotwords*: lista de términos en el prompt para sesgar la transcripción hacia vocabulario específico (nombres propios, terminología).
- Ejecución on-device sin conexión sobre el runtime LiteRT-LM, con rutas de cómputo en CPU y GPU (OpenCL, WebGPU/Metal).
- Procesamiento de audio largo mediante segmentación externa en trozos de hasta 30 s y conversaciones independientes por trozo.
- No soporta marcas de tiempo (sin rama CTC en el checkpoint).
- No se declaran capacidades de tool calling, agentes ni multi-step reasoning en la información disponible.

## Casos de uso

- Transcripción de notas de voz en aplicaciones móviles: el modelo cabe en 1,26 GB y se ejecuta en un Galaxy S26 a 51,45 tok/s en GPU, lo que permite transcribir mensajes de hasta 30 s en el propio dispositivo sin enviar audio a la nube y preservando la privacidad.
- Subtitulado y actas de reuniones: segmentando el audio en trozos de hasta 30 s cortados en pausas y uniendo las transcripciones, se obtiene un WER de 10/143 en el clip de prueba de 60,2 s, idéntico al del modelo original sobre el clip completo, lo que lo hace apto para reuniones y clases grabadas.
- Dictado multilingüe en inglés y japonés: con la instrucción de idioma de salida (`语音转写成英文：` o `日文`) y una ventana de 30 s, se puede integrar en teclados y asistentes de escritura para usuarios que alternan idiomas.
- Reconocimiento de vocabulario especializado con *hotwords*: en dominios como medicina, legal o nombres propios, la lista de términos en el prompt reduce errores; en la prueba con LibriSpeech, el WER bajó de 10/68 a 8/68 al incluir los *hotwords* correctos.
- Transcripción de audio en el borde para dispositivos IoT y wearables: el formato `.litertlm` y las rutas CPU/GPU de LiteRT-LM permiten desplegar en hardware con recursos limitados sin depender de un servidor.
- Preprocesado de voz en pipelines de datos: transcripción masiva de clips cortos en local para generar datasets de texto a partir de audio, con la opción de desactivar la normalización de texto inversa para preservar la forma hablada.
- Accesibilidad: conversión de voz a texto en tiempo real para personas con discapacidad auditiva, aprovechando la latencia de decodificación en GPU en dispositivos móviles de gama alta.

## Benchmarks y rendimiento

Los datos disponibles comparan esta conversión con el modelo original en `funasr` 1.4.16 (fp32, decodificación greedy) sobre 25 clips: 5 de ejemplo (zh, en, ja, ko, yue) y 20 de LibriSpeech dev-clean (448 palabras).

| Runtime | Backend del LM | Texto idéntico a la referencia | WER inglés |
|---|---|---|---|
| Referencia: `funasr`, fp32 PyTorch | — | — | 4,46 % (20/448) |
| LiteRT-LM 0.17.1 (Python), Apple M4 Max | CPU | 21/25 | 4,24 % (19/448) |
| LiteRT-LM 0.17.1 (Python), Apple M4 Max | GPU (WebGPU sobre Metal) | 24/25 | 4,46 % (20/448) |
| LiteRT-LM v0.16.1 CLI, Galaxy S26 (SM-S942Q) | CPU | 21/25 | 4,46 % (20/448) |
| LiteRT-LM v0.16.1 CLI, Galaxy S26 (SM-S942Q) | GPU (OpenCL) | 24/25 | 4,46 % (20/448) |

Rendimiento de decodificación del LM en Galaxy S26 (LiteRT-LM v0.19.0, tras prefill de 1.024 tokens): 51,45 y 51,43 tok/s en GPU con el fichero actual, frente a 26,75 y 26,76 tok/s del fichero anterior; en CPU, de 21,43 a 22,66 tok/s en cuatro ejecuciones. Con el codificador y el LM en fp32, el texto coincide con la referencia en 25/25 clips, por lo que las diferencias observadas se atribuyen a la cuantización. Con la instrucción sin normalización de texto inversa, 20 clips de LibriSpeech dieron un WER inglés de 17/448 (el original, 16/448; 16 de 20 transcripciones idénticas). No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- Tamaño del fichero: 1,26 GB (encoder 473 MB + prefill/decode 622 MB + embedder 159 MB + tokenizer 2,1 MB).
- VRAM/RAM estimada para inferencia: no disponible de forma explícita; el fichero completo ocupa 1,26 GB y debe residir en memoria, más el estado del runtime.
- GPU recomendadas: no se declaran modelos de escritorio; el modelo está orientado a GPU móviles e integradas (OpenCL en Android, WebGPU sobre Metal en Apple). El hardware de referencia es un Galaxy S26 (SM-S942Q) y un Apple M4 Max.
- ¿Cabe en GPU de consumo? No hay datos para RTX 4090 u otras GPU de escritorio; el diseño es para dispositivo móvil y borde.
- Opciones de despliegue: runtime LiteRT-LM (Python, CLI y librería) en versiones 0.19.0 a 0.19.2 para este fichero; versiones anteriores no se probaron con él. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 51,45 tok/s en GPU y 21,43–22,66 tok/s en CPU en Galaxy S26 tras prefill de 1.024 tokens; en Apple M4 Max no se declaran cifras de throughput, solo WER y coincidencia de texto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto de audio | Idiomas | Licencia | Formato/despliegue |
|---|---|---|---|---|---|
| Fun-ASR-Nano-2512 (LiteRT-LM) | LM Qwen3-0.6B + encoder SAN-M 70 capas (total no disponible) | 30,24 s por ventana | zh, en, ja | Apache-2.0 | `.litertlm`, LiteRT-LM on-device |
| FunAudioLLM/Fun-ASR-Nano-2512 (original) | mismo pipeline | no disponible en esta ficha | zh, en, ja | Apache-2.0 | PyTorch, `funasr` 1.4.16 |
| Whisper (variantes de OpenAI) | no disponible en esta ficha | 30 s | multilingüe amplio | MIT/Apache-2.0 según variante | PyTorch, GGUF, ONNX, etc. |
| SenseVoice (FunAudioLLM) | no disponible en esta ficha | no disponible en esta ficha | multilingüe | no disponible en esta ficha | PyTorch, `funasr` |

La comparación cuantitativa directa solo está disponible frente al modelo original: misma calidad de transcripción (WER 4,46 % en inglés, 20/448) con un fichero autocontenido y ejecución on-device. Frente a Whisper y SenseVoice no se aportan métricas en la información proporcionada.

## Limitaciones y advertencias

- Ventana de audio fija de 30,24 s: un clip más largo enviado en un solo mensaje se corta en varias ventanas y el modelo solo transcribe el habla de la primera (WER 83/143 en el clip de 60,2 s). Es obligatorio segmentar externamente y usar una conversación nueva por trozo; enviar los trozos como turnos de una misma conversación provoca repetición del inicio (WER 22/143).
- Sin marcas de tiempo: el checkpoint no incluye pesos de decodificador CTC, por lo que no hay rama CTC ni alineamientos temporales.
- Diferencias por cuantización: en CPU se observan variaciones en la grafía de nombres propios ("Birket", "Burkett", "Burkitt"); con encoder y LM en fp32 el texto coincide con la referencia en 25/25 clips.
- Formato de entrada: se recomienda PCM 16 kHz mono en WAV; el runtime puede decodificar MP3, pero en 3 de 5 muestras MP3 oficiales el texto difirió del obtenido al decodificar el mismo audio a WAV con ffmpeg.
- El silencio digital al final del clip se trata como relleno porque el encoder toma la longitud del último sample no nulo; en las pruebas no cambió ninguna transcripción.
- Cobertura lingüística limitada a chino (con dialectos y acentos), inglés y japonés; el coreano y el cantonés aparecen solo en los clips de ejemplo y no se declaran como idiomas soportados.
- Riesgo de alucinación y sesgos: no se documentan en la información disponible; como todo ASR generativo, puede producir texto plausible no presente en el audio, especialmente con ruido o acentos fuera de la cobertura declarada.
- Compatibilidad de runtime restringida: el fichero actual solo se probó con LiteRT-LM 0.19.0 a 0.19.2; versiones anteriores no se validaron.
- Licencia Apache-2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base FunAudioLLM/Fun-ASR-Nano-2512 y de Qwen3-0.6B para obligaciones adicionales de atribución.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/litert-community/Fun-ASR-Nano-2512
- Modelo base: https://huggingface.co/FunAudioLLM/Fun-ASR-Nano-2512
- Runtime LiteRT-LM: https://github.com/google-ai-edge/LiteRT-LM
