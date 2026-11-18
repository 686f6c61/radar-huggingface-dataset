# ConwayResearch/Underdog-Bark-3.0-Pro

## Resumen

Underdog Bark 3.0 Pro es un modelo de reconocimiento automático del habla (ASR) en inglés desarrollado por ConwayResearch, afinado a partir de nvidia/parakeet-tdt-0.6b-v3. Con 627 millones de parámetros y pesos en bf16 (1,25 GB), se posiciona como el modelo abierto con menor tasa de error de palabra (WER) medio en los siete conjuntos ingleses del Open ASR Leaderboard, con un 4,286 % frente al 4,291 % de Hojo-ASR-V1, que requiere una descarga de casi 12 GB.

La relevancia del modelo reside en su relación precisión/tamaño: supera en precisión a modelos abiertos mucho mayores como Qwen3-ASR-1.7B (4,43 %), Canary-Qwen 2.5B (4,55 %) o Voxtral Small 24B (5,21 %), y también a varias API comerciales de transcripción como OpenAI GPT-Transcribe (4,70 %) o AssemblyAI Universal-3.5 Pro (4,46 %). Además, obtiene el mejor resultado en habla parlamentaria (1,70 % en VoxPopuli) y en llamadas de resultados empresariales (5,65 % en Earnings-22).

El modelo emplea una arquitectura Parakeet TDT (Token-and-Duration Transducer) y se distribuye en dos formatos: safetensors bf16 para transformers y CUDA, y Core ML para ejecución nativa en Apple Silicon (GPU o ANE) mediante un runtime Swift propio de Underdog. Su licencia es CC BY-NC 4.0, lo que restringe el uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Parakeet TDT (Token-and-Duration Transducer), encoder-decoder con predicción conjunta de token y duración |
| Parámetros totales | 627.057.286 (0,6B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | bf16 (pesos publicados); no se documentan otras cuantizaciones |
| Idiomas soportados | inglés (en) |
| Licencia | CC BY-NC 4.0 (no comercial) |
| Formato de pesos | safetensors (bf16) y Core ML (coreml/) |
| Modelo base | nvidia/parakeet-tdt-0.6b-v3 |
| Pipeline | automatic-speech-recognition |
| Tamaño del repositorio | 2,5 GB |
| Descargas / likes | 2.893 / 46 |

## Arquitectura y entrenamiento

Bark 3.0 Pro es un fine-tuning de nvidia/parakeet-tdt-0.6b-v3, un modelo transducer TDT. En lugar de predecir únicamente el siguiente token, el decodificador TDT emite conjuntamente un token y una duración, lo que permite avanzar varios fotogramas de audio por paso y reduce el coste de decodificación frente a un transducer convencional. El modelo se carga como un modelo estándar de `transformers` sin código personalizado, lo que facilita su integración en pipelines existentes.

La model card no detalla el volumen ni la composición del dataset de fine-tuning, ni si se aplicaron técnicas de RLHF o DPO (no disponibles). Sí se documenta que el modelo transcribe de forma literal, incluyendo muletillas y reinicios: en el conjunto DisfluencySpeech, con transcripciones verbatim y contando fillers, obtiene un 2,95 % de WER, frente al 3,15 % de Bark 3.0, el 3,21 % de Bark 3.0 Plus y el 3,39 % de Phonon-2. La familia Bark 3.0 cubre tamaños desde 163 MB hasta 1,25 GB manteniendo la frontera de precisión en cada rango.

## Capacidades

- Transcripción de voz a texto en inglés con precisión estado del arte entre modelos abiertos de su categoría.
- Reconocimiento de habla espontánea y disfluente, preservando muletillas, repeticiones y reinicios en la salida.
- Buen rendimiento en dominios específicos: habla parlamentaria (VoxPopuli), llamadas de resultados (Earnings-22), reuniones (AMI) y audio de dominio general (LibriSpeech, GigaSpeech, SPGISpeech).
- Ejecución nativa en Apple Silicon mediante Core ML, usando GPU o Neural Engine para las operaciones del encoder y CPU para preprocesado y decodificación.
- Ejecución en Windows/Linux con CUDA usando los pesos bf16 originales vía transformers.
- Compatible con endpoints (tag `endpoints_compatible`).
- No se documentan capacidades de tool calling, razonamiento multi-paso, visión, audio generativo ni modo thinking: es un modelo exclusivamente ASR.

## Casos de uso

- Transcripción de reuniones y actas: con un 7,16 % de WER en AMI, es adecuado para diarización posterior y generación de resúmenes en herramientas internas de equipos, donde el coste de cómputo importa.
- Análisis de llamadas de resultados y atención al inversor: su 5,65 % en Earnings-22 lo hace útil para transcribir earnings calls y alimentar pipelines de análisis financiero o búsqueda sobre transcripciones.
- Subtitulado y archivado de sesiones parlamentarias: el 1,70 % en VoxPopuli permite generar actas y subtítulos de alta fidelidad en organismos públicos.
- Transcripción local en dispositivos Apple: el runtime Swift con MLX/Core ML mantiene el audio en el dispositivo, lo que encaja en aplicaciones de notas de voz, dictado o salud donde la privacidad es requisito.
- Procesamiento por lotes de audio a gran escala: al pesar 1,25 GB frente a los 5-12 GB de alternativas comparables, reduce el coste de almacenamiento y el tiempo de carga en clústeres de inferencia.
- Investigación en ASR y evaluación de disfluencias: su comportamiento verbatim lo hace útil para estudiar habla espontánea y para construir corpus con transcripción literal.
- Integración en pipelines de subtitulado de vídeo: al cargarse como modelo estándar de transformers, se puede encadenar con segmentación, puntuación y traducción en flujos existentes.

## Benchmarks y rendimiento

WER (%) sobre los siete conjuntos ingleses del Open ASR Leaderboard (versiones limpias de AMI, Earnings-22, GigaSpeech y VoxPopuli). Menor es mejor.

| Modelo | Descarga | LS clean | LS other | AMI | Earnings-22 | GigaSpeech | SPGISpeech | VoxPopuli | Media |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| **Bark 3.0 Pro** | **1.254 MB** | 1,38 | 3,11 | 7,16 | **5,65** | 7,46 | 3,54 | **1,70** | **4,29** |
| Bark 3.0 Plus | 180 MB | 1,71 | 3,82 | 7,76 | 6,70 | 7,77 | 3,64 | 1,92 | 4,76 |
| Bark 3.0 | 163 MB | 1,89 | 4,08 | 7,82 | 7,05 | 7,95 | 3,72 | 2,05 | 4,94 |
| Phonon-2 | 164 MB | 1,73 | 3,92 | 9,32 | 6,96 | 8,35 | 3,70 | 2,46 | 5,21 |
| Hojo-ASR-V1 | 11.957 MB | 1,30 | 3,24 | 7,54 | 6,97 | **6,14** | 1,74 | 3,11 | 4,29 |
| Qwen3-ASR-1.7B | 4.699 MB | 1,26 | 2,94 | 8,31 | 5,84 | 7,22 | 2,57 | 2,85 | 4,43 |
| higgs-audio-v3-stt | 5.351 MB | 1,08 | 2,61 | 7,19 | 7,04 | 7,45 | 2,07 | 3,73 | 4,45 |
| Canary-Qwen 2.5B | 5.119 MB | 1,23 | 2,63 | 7,91 | 6,41 | 7,80 | **1,70** | 4,14 | 4,55 |
| Granite Speech 4.1 2B | 4.832 MB | 1,03 | 2,19 | 7,06 | 6,69 | 8,18 | 3,47 | 4,18 | 4,69 |
| Cohere Transcribe | 4.132 MB | **0,97** | **2,05** | **7,02** | 7,88 | 7,88 | 2,74 | 5,38 | 4,85 |
| Granite Speech 5.0 470M (NC) | 946 MB | 1,45 | 2,67 | 7,31 | 8,23 | 8,37 | 1,75 | 4,67 | 4,92 |
| Parakeet TDT 0.6B v3 | 2.508 MB | 1,52 | 3,13 | 9,42 | 5,85 | 7,99 | 3,63 | 3,05 | 4,94 |
| Granite Speech 5.0 470M | 946 MB | 1,48 | 2,71 | 7,71 | 6,75 | 8,74 | 3,22 | 4,90 | 5,07 |
| Qwen3-ASR-0.6B | 1.876 MB | 1,70 | 4,01 | 9,33 | 7,83 | 7,62 | 2,74 | 2,90 | 5,16 |
| Whisper large-v3 | 9.261 MB | 1,56 | 3,52 | 13,63 | 7,99 | 8,35 | 2,71 | 4,53 | 6,04 |
| Whisper large-v3-turbo | 1.618 MB | 2,13 | 3,71 | 13,88 | 8,09 | 8,47 | 2,79 | 7,02 | 6,58 |

Con tres decimales y el código de puntuación del leaderboard, Bark 3.0 Pro promedia 4,286 y Hojo-ASR-V1 4,291. Las filas de Bark usan el código de puntuación del leaderboard pero aún no están publicadas en él; el resto corresponde a la fila publicada a 9 de octubre de 2026.

DisfluencySpeech (250 clips de conversación no guionizada, transcripción verbatim con fillers):

| Modelo | WER (%) |
|---|---:|
| Bark 3.0 Pro | **2,95** |
| Bark 3.0 | 3,15 |
| Bark 3.0 Plus | 3,21 |
| Phonon-2 | 3,39 |

## Requisitos de hardware

- VRAM para inferencia: los pesos bf16 ocupan 1,25 GB; con overhead de activaciones y decodificación, se estima un uso en torno a 2-3 GB en GPU (estimación, no publicada por el autor).
- GPU recomendadas: cualquier GPU CUDA con al menos 4 GB de memoria; los pesos bf16 requieren soporte de bfloat16 (Ampere o posterior, p. ej. RTX 3090/4090, A100, H100). No se documentan requisitos oficiales de GPU.
- Consumer GPU: cabe holgadamente en RTX 3060 12 GB, RTX 4060 Ti, RTX 4090 y similares. En GPUs sin bf16 nativo habría que convertir los pesos, opción no documentada.
- Apple Silicon: requiere Mac con Apple Silicon, macOS 15 o posterior y Swift 6.2 o posterior (Xcode / Command Line Tools). El runner usa GPU o ANE para las operaciones del encoder y CPU para preprocesado y decodificación; ambas rutas se probaron en un M5 Max. También hay sección para iPhone e iPad.
- Despliegue: transformers (carga estándar, sin código personalizado), Core ML con runtime Swift propio, y endpoints compatibles. No se documenta soporte explícito de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Descarga | WER medio | Licencia | Idiomas |
|---|---|---:|---:|---|---|
| Bark 3.0 Pro | 0,6B | 1.254 MB | 4,29 | CC BY-NC 4.0 | en |
| Hojo-ASR-V1 | no disponible | 11.957 MB | 4,29 | no disponible | no disponible |
| Qwen3-ASR-1.7B | 1,7B | 4.699 MB | 4,43 | no disponible | no disponible |
| Canary-Qwen 2.5B | 2,5B | 5.119 MB | 4,55 | no disponible | no disponible |
| Whisper large-v3 | no disponible | 9.261 MB | 6,04 | no disponible | multilingüe |
| Parakeet TDT 0.6B v3 (base) | 0,6B | 2.508 MB | 4,94 | no disponible | no disponible |

Bark 3.0 Pro iguala o supera en media a modelos entre 4 y 10 veces mayores en descarga, con la salvedad de que su licencia no permite uso comercial y de que solo cubre inglés.

## Limitaciones y advertencias

- Licencia CC BY-NC 4.0: prohíbe el uso comercial. Cualquier despliegue en producto o servicio de pago requiere licencia adicional del autor.
- Solo inglés: no soporta otros idiomas; no debe usarse para audio multilingüe sin un modelo adicional.
- Transcripción verbatim: incluye muletillas y reinicios. Si se necesita texto limpio, hay que postprocesar la salida.
- Riesgo de alucinación y errores en audio con ruido, acentos no representados en el entrenamiento o solapamiento de hablantes; el WER en AMI (7,16 %) refleja la dificultad del habla conversacional multi-hablante.
- No se documentan sesgos demográficos ni de acento; al ser un fine-tuning de Parakeet, hereda los sesgos del modelo base.
- No hay información sobre la composición del dataset de fine-tuning, lo que dificulta evaluar la cobertura de dominios y acentos.
- Los resultados de Bark no están publicados aún en el Open ASR Leaderboard; las cifras proceden de la model card y usan el código de puntuación del leaderboard.
- El soporte de cuantizaciones distintas de bf16 no está documentado; desplegar en hardware sin bf16 puede requerir conversión manual.
- El modelo es exclusivamente ASR: no genera texto libre, no hace tool calling ni razonamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ConwayResearch/Underdog-Bark-3.0-Pro
- Modelo base: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Underdog (runtime nativo): https://underdog.ai
- Open ASR Leaderboard: no disponible en la información proporcionada (referenciado en la model card sin URL)
