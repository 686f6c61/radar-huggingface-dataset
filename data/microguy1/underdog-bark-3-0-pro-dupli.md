# Microguy1/Underdog-Bark-3.0-Pro-DUPLI

## Resumen

Underdog Bark 3.0 Pro es un modelo de reconocimiento automático del habla (ASR) en inglés de 627 millones de parámetros, desarrollado por Microguy1 como un fine-tuning de `nvidia/parakeet-tdt-0.6b-v3`. Emplea la arquitectura Parakeet TDT (Token-and-Duration Transducer) y se distribuye con licencia CC-BY-4.0, lo que permite uso comercial con atribución. Su relevancia radica en que, según los datos de su model card, alcanza un 4,29 % de tasa de error de palabra (WER) en promedio sobre los siete conjuntos en inglés del Open ASR Leaderboard, situándose al nivel de modelos mucho más grandes como Hojo-ASR-V1 (12 GB) y por delante de Qwen3-ASR-1.7B, Canary-Qwen 2.5B o Whisper large-v3.

El modelo está pensado para transcripción de voz a texto de alta precisión en dominios difíciles: discurso parlamentario, llamadas de resultados financieros, reuniones y habla disfluente con muletillas. A diferencia de otros sistemas, transcribe literalmente lo dicho, incluyendo "um", "uh" y reinicios, en lugar de limpiar el texto.

Se distribuye en dos formatos: pesos BF16 en safetensors para `transformers` (sin código personalizado) y un paquete Core ML para ejecución nativa en Apple Silicon vía GPU o Neural Engine, con un runtime Swift propio del ecosistema Underdog que mantiene los pesos en el dispositivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Parakeet TDT (Token-and-Duration Transducer), encoder-decoder tipo transformer |
| Parametros totales | 627.057.286 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (pesos publicados); no se documentan otras cuantizaciones |
| Idiomas soportados | inglés (en) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors (BF16) y Core ML (`coreml/`) |
| Pipeline | automatic-speech-recognition |
| Modelo base | nvidia/parakeet-tdt-0.6b-v3 (finetune) |
| Tamano del repo | 2,5 GB |
| Libreria | transformers |
| Metricas declaradas | WER |

## Arquitectura y entrenamiento

El modelo se basa en Parakeet TDT, una arquitectura transducer que combina un encoder acústico con un decoder de predicción y un módulo conjunto que emite tokens junto con una predicción de duración. Esta formulación TDT permite emitir varios tokens por paso de decodificación y modelar explícitamente la duración de cada token, lo que reduce el coste computacional frente a un transducer clásico y mejora la alineación temporal. El modelo es un fine-tuning del checkpoint `nvidia/parakeet-tdt-0.6b-v3` de NVIDIA, por lo que hereda su preentrenamiento y ajusta el comportamiento sobre datos adicionales orientados a precisión en dominios específicos.

La model card no detalla el volumen de tokens de entrenamiento, la composición del dataset de ajuste ni si se aplicaron técnicas de RLHF o DPO; estos datos figuran como no disponibles. Sí se documenta que el modelo se carga como un modelo estándar de `transformers` sin código personalizado, y que la distribución Core ML incluye un runner en Swift que usa GPU o ANE para las operaciones del encoder compatibles y CPU para preprocesado y decodificación, probado en un Apple M5 Max. El vocabulario se lee desde `mlx/config.json`, compartido con los modelos menores de la familia Bark 3.0.

## Capacidades

- Transcripción de voz a texto en inglés de alta precisión, con WER medio del 4,29 % en los siete conjuntos del Open ASR Leaderboard.
- Reconocimiento de habla espontánea y disfluente: transcribe muletillas, reinicios y repeticiones de forma literal (2,95 % WER en DisfluencySpeech).
- Buen rendimiento en dominios especializados: discurso parlamentario (1,70 % en VoxPopuli) y llamadas de resultados (5,65 % en Earnings-22).
- Manejo de audio de reuniones multipartícipe (7,16 % en AMI).
- Ejecución local en Apple Silicon mediante Core ML, con soporte de GPU y Neural Engine, sin Python y sin enviar audio fuera del dispositivo.
- Carga directa en `transformers` como modelo estándar de ASR, sin dependencias de código personalizado.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio más allá de la transcripción.

## Casos de uso

- Transcripción de reuniones y actas: el modelo obtiene 7,16 % de WER en AMI, por lo que puede generar actas y resúmenes a partir de audio de reuniones multipartícipe con una fidelidad superior a la de Whisper large-v3 (13,63 % en el mismo conjunto).
- Subtitulado y transcripción de discurso parlamentario o institucional: su 1,70 % de WER en VoxPopuli lo hace adecuado para digitalizar sesiones plenarias, debates y archivos audiovisuales públicos con revisión humana mínima.
- Análisis de llamadas de resultados financieros: con 5,65 % en Earnings-22, sirve para transcribir earnings calls y alimentar pipelines de análisis de sentimiento o extracción de entidades sobre las transcripciones.
- Investigación lingüística sobre habla espontánea: al transcribir literalmente muletillas y reinicios (2,95 % en DisfluencySpeech), es útil para estudios de disfluencia, corpus conversacionales y anotación de habla natural.
- Transcripción en dispositivos Apple: mediante el paquete Core ML y el runtime Swift, se puede integrar en aplicaciones macOS, iOS o iPadOS que procesen audio localmente, cumpliendo requisitos de privacidad al no salir el audio del dispositivo.
- Pipelines de ASR en servidores con `transformers`: al cargarse como modelo estándar, se puede desplegar en servicios de transcripción por lotes o en tiempo real con infraestructura Python convencional.
- Generación de datos de entrenamiento para modelos de voz: sus transcripciones de alta fidelidad pueden emplearse para etiquetar corpus de audio y alimentar sistemas TTS o de diarización.

## Benchmarks y rendimiento

Tasa de error de palabra (%) sobre los conjuntos de test del Open ASR Leaderboard (menor es mejor). Los datos provienen de la model card del autor; las filas marcadas con † corresponden a las publicadas por el leaderboard a 9 de octubre de 2026.

| Modelo | Descarga | LS clean | LS other | AMI | Earnings-22 | GigaSpeech | SPGISpeech | VoxPopuli | Media |
|---|--:|--:|--:|--:|--:|--:|--:|--:|--:|
| **Bark 3.0 Pro** | **1.254 MB** | 1,38 | 3,11 | 7,16 | **5,65** | 7,46 | 3,54 | **1,70** | **4,29** |
| Bark 3.0 Plus | 180 MB | 1,71 | 3,82 | 7,76 | 6,70 | 7,77 | 3,64 | 1,92 | 4,76 |
| Bark 3.0 | 163 MB | 1,89 | 4,08 | 7,82 | 7,05 | 7,95 | 3,72 | 2,05 | 4,94 |
| Hojo-ASR-V1† | 11.957 MB | 1,30 | 3,24 | 7,54 | 6,97 | **6,14** | 1,74 | 3,11 | 4,29 |
| Qwen3-ASR-1.7B† | 4.699 MB | 1,26 | 2,94 | 8,31 | 5,84 | 7,22 | 2,57 | 2,85 | 4,43 |
| higgs-audio-v3-stt† | 5.351 MB | 1,08 | 2,61 | 7,19 | 7,04 | 7,45 | 2,07 | 3,73 | 4,45 |
| Canary-Qwen 2.5B† | 5.119 MB | 1,23 | 2,63 | 7,91 | 6,41 | 7,80 | **1,70** | 4,14 | 4,55 |
| Granite Speech 4.1 2B† | 4.832 MB | 1,03 | 2,19 | 7,06 | 6,69 | 8,18 | 3,47 | 4,18 | 4,69 |
| Cohere Transcribe† | 4.132 MB | **0,97** | **2,05** | **7,02** | 7,88 | 7,88 | 2,74 | 5,38 | 4,85 |
| Parakeet TDT 0.6B v3† | 2.508 MB | 1,52 | 3,13 | 9,42 | 5,85 | 7,99 | 3,63 | 3,05 | 4,94 |
| Whisper large-v3† | 9.261 MB | 1,56 | 3,52 | 13,63 | 7,99 | 8,35 | 2,71 | 4,53 | 6,04 |

En habla disfluente (DisfluencySpeech, 250 clips, transcripción literal con muletillas):

| Modelo | WER (%) |
|---|--:|
| Bark 3.0 Pro | **2,95** |
| Bark 3.0 | 3,15 |
| Bark 3.0 Plus | 3,21 |
| Phonon-2 | 3,39 |

El autor declara que, con tres decimales y el código de puntuación del leaderboard, Bark 3.0 Pro promedia 4,286 frente a 4,291 de Hojo-ASR-V1. No se han publicado resultados de benchmarks adicionales en la información disponible.

## Requisitos de hardware

- Pesos BF16: 1,25 GB de archivo; la VRAM necesaria para inferencia con `transformers` ronda los 2-3 GB incluyendo activaciones y buffers, aunque no se documenta una cifra oficial.
- Cabe holgadamente en GPUs de consumo: RTX 3060 12 GB, RTX 4060 Ti, RTX 4070, RTX 4090, así como en GPUs de datacenter A100 y H100, donde el modelo queda limitado por memoria y no por cómputo.
- En Apple Silicon: paquete Core ML con ejecución en GPU o Neural Engine; probado en un M5 Max con macOS 15 o superior y Swift 6.2 o superior.
- Despliegue: `transformers` (ruta principal documentada), runtime Swift nativo de Underdog con MLX en Apple Silicon, y Core ML para macOS/iOS/iPadOS. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que además no son aplicables a un modelo transducer de ASR.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Descarga | Contexto | WER medio (7 sets) | Licencia | Disponibilidad |
|---|---|--:|---|---|---|---|
| Bark 3.0 Pro | 627 M | 1.254 MB | no disponible | 4,29 % | CC-BY-4.0 | HuggingFace, Core ML |
| Hojo-ASR-V1 | no disponible | 11.957 MB | no disponible | 4,29 % | no disponible | HuggingFace |
| Qwen3-ASR-1.7B | 1,7 B | 4.699 MB | no disponible | 4,43 % | no disponible | HuggingFace |
| Canary-Qwen 2.5B | 2,5 B | 5.119 MB | no disponible | 4,55 % | no disponible | HuggingFace |
| Whisper large-v3 | 1,55 B | 9.261 MB | 30 s de audio | 6,04 % | MIT (upstream) | HuggingFace, múltiples runtimes |

La comparación se limita a los datos publicados en la model card. Bark 3.0 Pro iguala en precisión media a Hojo-ASR-V1 con aproximadamente una décima parte del tamaño de descarga y supera a Qwen3-ASR-1.7B, Canary-Qwen 2.5B y Whisper large-v3, aunque estos últimos ofrecen ecosistemas de despliegue más amplios y, en el caso de Whisper, soporte multilingüe.

## Limitaciones y advertencias

- Solo soporta inglés; no se documenta capacidad multilingüe.
- No se especifican la longitud máxima de audio ni la ventana de contexto; conviene validar el comportamiento con audios largos antes de usarlo en producción.
- Riesgo de alucinación y errores en audio con ruido, acentos no representados en el entrenamiento o solapamiento de hablantes; el WER en AMI (7,16 %) indica que las reuniones siguen siendo el escenario más difícil.
- Transcribe literalmente las disfluencias; si se necesita texto limpio para subtítulos o publicaciones, hace falta un postprocesado adicional.
- La licencia CC-BY-4.0 permite uso comercial con atribución, pero no se detallan condiciones adicionales del modelo base de NVIDIA más allá de lo indicado; conviene revisar la licencia de `nvidia/parakeet-tdt-0.6b-v3`.
- Los resultados de benchmarks proceden de la model card del autor y no están publicados en el leaderboard en el momento de la ficha; deben tratarse como cifras declaradas por el desarrollador.
- El repositorio tiene un volumen de descargas muy bajo (43) y ningún "like", por lo que la validación comunitaria es escasa.
- El despliegue en Apple requiere macOS 15 o superior y Swift 6.2 o superior; el resto de plataformas depende de `transformers`.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Microguy1/Underdog-Bark-3.0-Pro-DUPLI
- Modelo base: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Runtime Underdog: https://underdog.ai
- Open ASR Leaderboard: https://huggingface.co/spaces/hf-audio/open_asr_leaderboard
