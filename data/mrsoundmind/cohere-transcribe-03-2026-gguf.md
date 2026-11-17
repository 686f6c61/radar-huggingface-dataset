# mrsoundmind/cohere-transcribe-03-2026-gguf

## Resumen

Cohere Transcribe 03-2026 es un modelo de reconocimiento automático del habla (ASR) de 2.049 millones de parámetros, desarrollado por Cohere y Cohere Labs, publicado bajo licencia Apache-2.0. Este repositorio concreto (`mrsoundmind/cohere-transcribe-03-2026-gguf`) es una conversión a formato GGUF del modelo original, realizada por un tercero (mrsoundmind) para su uso con `transcribe.cpp`, una implementación en C++ orientada a inferencia local sin dependencias de Python. El modelo base es un encoder-decoder basado en Conformer: un encoder Conformer grande extrae representaciones acústicas y un decoder Transformer ligero genera los tokens de texto de forma autorregresiva, con embeddings de tokens compartidos.

La relevancia de esta conversión radica en que permite ejecutar un modelo ASR multilingüe de calidad competitiva en hardware de consumo, incluyendo CPU y GPUs integradas, gracias a cuantizaciones que reducen el peso desde 4,10 GB (BF16) hasta 1,55 GB (Q4_K_M) con una degradación de WER prácticamente nula. El modelo cubre 14 idiomas (inglés, francés, alemán, español, italiano, portugués, neerlandés, polaco, griego, árabe, japonés, chino, vietnamita y coreano) y está pensado para transcripción offline de audio de 16 kHz mono.

El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 17 de noviembre de 2026. La conversión está validada contra la referencia de Transformers en el commit `bf0d0b7` de transcribe.cpp (18 de abril de 2026), y el modelo base se portó desde el commit `76b8b23` de CohereLabs (16 de abril de 2026). No soporta streaming, traducción, detección de idioma ni timestamps.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Encoder-decoder basado en Conformer (encoder Conformer grande + decoder Transformer ligero con cross-attention y embeddings de tokens compartidos) |
| Parámetros totales | 2.049.026.832 (≈2B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | BF16, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | en, fr, de, es, it, pt, nl, pl, el, ar, ja, zh, vi, ko (14 idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (para transcribe.cpp) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura encoder-decoder basada en Conformer. La entrada es una forma de onda de audio que se convierte en espectrograma log-Mel; el audio se remuestrea automáticamente a 16 kHz si es necesario y las entradas multicanal (estéreo) se promedian a mono durante el preprocesado. Un encoder Conformer grande extrae las representaciones acústicas y un decoder Transformer ligero genera los tokens de texto de forma autorregresiva, con cross-attention sobre la salida del encoder y embeddings de tokens compartidos (tied token embedding) entre entrada y salida del decoder.

El entrenamiento se realizó desde cero con un objetivo supervisado de entropía cruzada sobre los tokens de salida. La model card original no detalla el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO; esos datos no están disponibles en la información proporcionada. La decodificación es autorregresiva y, en esta conversión, se realiza con decodificación greedy y sin modelo de lenguaje externo, según la metodología de evaluación reportada.

## Capacidades

- Transcripción de voz a texto (ASR) offline en 14 idiomas: inglés, francés, alemán, español, italiano, portugués, neerlandés, polaco, griego, árabe, japonés, chino, vietnamita y coreano.
- Entrada de audio de 16 kHz mono en formato WAV; el preprocesado del modelo base remuestrea y convierte a mono automáticamente, pero la CLI de transcribe.cpp espera WAV de 16 kHz mono (se recomienda convertir con ffmpeg).
- Decodificación autorregresiva con decoder Transformer y cross-attention sobre el encoder Conformer.
- Inferencia local en CPU y GPU mediante transcribe.cpp, con soporte de backend Metal (Apple Silicon) y Vulkan (GPU integradas y discretas compatibles).
- No soporta streaming (procesamiento por lotes de audio completo).
- No soporta traducción (solo transcribe en el idioma del audio).
- No soporta detección automática de idioma.
- No genera timestamps (marcas temporales a nivel de palabra o segmento).
- No soporta tool calling, function calling ni razonamiento multi-paso: es un modelo puramente audio-in, text-out.

## Casos de uso

- Transcripción de reuniones y entrevistas offline: el modelo procesa archivos WAV completos de 16 kHz mono y genera la transcripción en uno de los 14 idiomas soportados, sin enviar audio a la nube. Adecuado para entornos con requisitos de privacidad o sin conectividad.
- Subtitulado de vídeo en pipelines locales: integrado en un flujo con ffmpeg para extraer y convertir la pista de audio a 16 kHz mono, el modelo genera el texto que luego se sincroniza manualmente (no produce timestamps) para generar subtítulos.
- Transcripción en dispositivos de borde (edge): con la cuantización Q4_K_M (1,55 GB), el modelo cabe en equipos con poca VRAM o incluso en CPU, lo que permite desplegarlo en portátiles, mini-PC o dispositivos embebidos con Vulkan.
- Archivado y búsqueda de contenido audiovisual: transcripción por lotes de grandes volúmenes de audio en 14 idiomas para indexar y hacer searchable el contenido, ejecutándose en servidores sin GPU dedicada gracias al backend CPU.
- Accesibilidad: generación de transcripciones de clases, charlas o podcasts en varios idiomas para personas con discapacidad auditiva, con un coste de infraestructura bajo al usar cuantizaciones pequeñas.
- Investigación en ASR multilingüe: el modelo sirve como referencia reproducible (WER 1,25–1,27 % en LibriSpeech test-clean) para comparar técnicas de cuantización y backends de inferencia (Metal, Vulkan, CPU) en transcribe.cpp.
- Transcripción de atención al cliente: procesamiento de grabaciones de llamadas en varios idiomas para análisis de calidad y cumplimiento, ejecutándose localmente para evitar el envío de datos sensibles a servicios externos.

## Benchmarks y rendimiento

Resultados de WER en LibriSpeech test-clean (2620 utterances), decodificación greedy sin LM externo, normalizador `Whisper EnglishTextNormalizer`:

| Cuantización | Tamaño | WER LibriSpeech test-clean |
|---|---:|---:|
| BF16 | 4,10 GB | 1,26 % |
| F16 | 4,11 GB | 1,26 % |
| Q8_0 | 2,41 GB | 1,27 % |
| Q6_K | 1,97 GB | 1,27 % |
| Q5_K_M | 1,76 GB | 1,25 % |
| Q4_K_M | 1,55 GB | 1,25 % |

Referencia: el WER auto-reportado por Cohere en el mismo split es 1,25 % (Open ASR Leaderboard, a fecha de 2026-03-26). La conversión a GGUF coincide con la referencia upstream dentro del redondeo.

Rendimiento (RTF, real-time factor; mayor es mejor):

| Hardware / backend | RTF |
|---|---:|
| Apple M4 Max, Metal | 73 |
| Apple M4 Max, CPU | 9 |
| AMD Ryzen 7 4750U, Vulkan | 8 |
| AMD Ryzen 7 4750U, CPU | 3 |

No se han publicado resultados de benchmarks adicionales (p. ej. MMLU, HumanEval, GSM8K, que no aplican a un modelo ASR) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente el tamaño del archivo GGUF más overhead. Q4_K_M ≈ 1,55 GB, Q8_0 ≈ 2,41 GB, BF16/F16 ≈ 4,10 GB.
- GPU recomendadas: cualquier GPU compatible con Vulkan (incluye integradas AMD e Intel y discretas) o Apple Silicon con Metal. No se especifican requisitos mínimos de GPU dedicada en la información disponible.
- Cabe en GPU de consumo: sí, con cuantizaciones Q4_K_M y Q5_K_M (≈1,55–1,76 GB) en GPUs con 4 GB o más de VRAM; en CPU funciona incluso sin GPU.
- Opciones de despliegue: transcribe.cpp (CLI `transcribe-cli`), compilado desde fuente con CMake. Backends: CPU, Metal (Apple Silicon), Vulkan. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput: RTF de 73 en M4 Max con Metal (≈73× tiempo real), 9 en CPU del M4 Max, 8 en Vulkan sobre Ryzen 7 4750U y 3 en CPU del Ryzen 7 4750U. Es decir, en el peor caso (CPU de portátil) transcribe aproximadamente 3 veces más rápido que tiempo real.
- No soporta streaming: el audio debe procesarse completo por lotes.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Contexto | Licencia | Formato / despliegue | WER LibriSpeech test-clean |
|---|---|---|---|---|---|---|
| cohere-transcribe-03-2026 (GGUF, esta ficha) | ≈2B | 14 | No disponible | Apache-2.0 | GGUF / transcribe.cpp | 1,25–1,27 % |
| Whisper large-v3 (OpenAI) | ≈1,55B | ≈99 | 30 s de audio | MIT | Safetensors, GGUF, múltiples runtimes | No disponible en la información proporcionada |
| Whisper large-v2 (OpenAI) | ≈1,55B | ≈99 | 30 s de audio | MIT | Safetensors, GGUF, múltiples runtimes | No disponible en la información proporcionada |

No se dispone de datos de benchmarks de los modelos alternativos en la información proporcionada; la comparación se limita a parámetros, idiomas, licencia y formato de despliegue. La ventaja principal de esta conversión es la ejecución local en CPU/GPU integrada vía transcribe.cpp con cuantizaciones pequeñas y WER casi idéntico al BF16.

## Limitaciones y advertencias

- No soporta streaming: requiere el audio completo y no puede transcribir en tiempo real por fragmentos.
- No soporta traducción: solo transcribe en el idioma original del audio; no traduce a otro idioma.
- No soporta detección automática de idioma: el idioma debe conocerse o gestionarse externamente.
- No genera timestamps: no produce marcas temporales a nivel de palabra ni de segmento, lo que limita su uso directo en subtitulado sincronizado.
- Entrada restringida a WAV de 16 kHz mono en la CLI de transcribe.cpp; es necesario convertir otros formatos con ffmpeg.
- Riesgo de alucinación y errores en audio con ruido, acentos no representados en el entrenamiento, solapamiento de hablantes o vocabulario técnico específico; no se detallan en la información proporcionada los sesgos conocidos ni las condiciones de evaluación fuera de LibriSpeech.
- La model card original no documenta la composición del dataset de entrenamiento ni posibles sesgos demográficos o lingüísticos; esos datos no están disponibles.
- Licencia Apache-2.0 permite uso comercial, pero el repositorio es una conversión de terceros (mrsoundmind) no oficial de Cohere; para producción conviene validar contra la referencia upstream.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria amplia; la conversión está validada técnicamente contra Transformers pero no hay evidencia de uso en producción.
- El modelo base está fijado al commit `76b8b23` (16 de abril de 2026); posibles actualizaciones de CohereLabs no se reflejan en esta conversión.
- No soporta tool calling, agentes ni razonamiento multi-paso: es exclusivamente ASR.

## Enlaces

- Repositorio Hugging Face (esta conversión GGUF): https://huggingface.co/mrsoundmind/cohere-transcribe-03-2026-gguf
- Modelo base original: https://huggingface.co/CohereLabs/cohere-transcribe-03-2026
- Commit del modelo base portado: https://huggingface.co/CohereLabs/cohere-transcribe-03-2026/commit/76b8b23
- Repositorio transcribe.cpp: https://github.com/mrsoundmind/transcribe.cpp
- Descarga BF16: https://huggingface.co/mrsoundmind/cohere-transcribe-03-2026-gguf/resolve/main/cohere-transcribe-03-2026-BF16.gguf
- Descarga F16: https://huggingface.co/mrsoundmind/cohere-transcribe-03-2026-gguf/resolve/main/cohere-transcribe-03-2026-F16.gguf
- Descarga Q8_0: https://huggingface.co/mrsoundmind/cohere-transcribe-03-2026-gguf/resolve/main/cohere-transcribe-03-2026-Q8_0.gguf
- Descarga Q6_K: https://huggingface.co/mrsoundmind/cohere-transcribe-03-2026-gguf/resolve/main/cohere-transcribe-03-2026-Q6_K.gguf
- Descarga Q5_K_M: https://huggingface.co/mrsoundmind/cohere-transcribe-03-2026-gguf/resolve/main/cohere-transcribe-03-2026-Q5_K_M.gguf
- Descarga Q4_K_M: https://huggingface.co/mrsoundmind/cohere-transcribe-03-2026-gguf/resolve/main/cohere-transcribe-03-2026-Q4_K_M.gguf
- Cohere Labs: https://cohere.com/research
- Open ASR Leaderboard: https://huggingface.co/spaces/hf-audio/open_asr_leaderboard
