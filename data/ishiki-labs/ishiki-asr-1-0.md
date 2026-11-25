# ishiki-labs/ishiki-asr-1.0

## Resumen

Ishiki-ASR-1.0 es un modelo de reconocimiento automático del habla (ASR) en inglés desarrollado por Ishiki Labs Inc. Se presenta como un checkpoint único y autocontenido de 13.310.305.997 parámetros en BF16, empaquetado en un solo archivo `model.safetensors` de 24,79 GiB. Su propuesta técnica central es el "weight-space programming": en lugar de un único transformer monolítico, integra siete "vías" acústicas especializadas (streams) fusionadas mediante un router por enunciado, todo dentro de un único conjunto de pesos.

El modelo resuelve la transcripción de audio de 16 kHz mono en inglés con un enfoque de ensemble implícito: cada stream aporta un sesgo inductivo distinto (encoder de audio Qwen3-Omni, decodificador Qwen3-1.7B, Conformer, Q-Former con Granite-2B, Whisper large-v3-turbo, FastConformer TDT, etc.) y un gate (`IshikiAcousticPathwayGate`) selecciona y pondera las rutas por enunciado de forma O(1) e invariable al batch.

Es relevante por su rendimiento declarado en el Open ASR Leaderboard: 3,75 % de WER medio en 10 conjuntos públicos (76.443 enunciados, 167,24 horas) y 4,35 % en los 8 splits principales de formato corto, con 302,3x RTFx de corpus en una sola H100 80 GB. La licencia CC-BY-4.0 facilita su uso comercial con atribución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Multi-stream ASR: siete vías acústicas (Qwen3OmniMoeAudioEncoder + Qwen3-1.7B, Qwen3ASRForConditionalGeneration, GraniteSpeechForConditionalGeneration, CohereAsrForConditionalGeneration, Whisper large-v3-turbo, ParakeetForTDT) con router por enunciado `IshikiAcousticPathwayGate` |
| Parametros totales | 13.310.305.997 (13,31B) |
| Parametros activos | No es MoE; los 13,31B son parámetros activos empaquetados |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el autor solo publica pesos BF16) |
| Idiomas soportados | Inglés (incluye variante en-IN vía Voice Arena Monsoon) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors (un único `model.safetensors` de 24,79 GiB, 6.693 tensores) |

## Arquitectura y entrenamiento

La arquitectura combina siete streams con parámetros propios: `spontaneous_stream` (2.729.998.720 params, encoder Qwen3OmniMoeAudioEncoder + decodificador causal Qwen3-1.7B), `ventral_stream` y `ventral_noise_stream` (2.349.217.408 cada uno, Qwen3ASRForConditionalGeneration adaptados por WSP), `meeting_stream` (2.313.141.596, GraniteSpeechForConditionalGeneration con Conformer + Q-Former + Granite-2B), `dorsal_stream` (2.065.647.872, CohereAsrForConditionalGeneration con encoder-decoder Conformer), `broadband_stream` (875.266.560, Whisper large-v3-turbo adaptado) y `transducer_stream` (627.008.134, ParakeetForTDT con FastConformer Token-and-Duration Transducer). El router `pathway_gate` (808.299 params) decide por enunciado la selección de ruta y los pesos de fusión con regla de mínimo riesgo de Bayes.

El entrenamiento parte de checkpoints públicos (Qwen3-ASR-1.7B, Musci-ASR-qwen-1019-hf, orukqwen-asr-1.7b, cohere-transcribe-03-2026, whisper-large-v3-turbo, parakeet-tdt-0.6b-v3, granite-speech-3.3-2b, Qwen3-1.7B y el encoder de audio de Qwen3-Omni-30B-A3B) y aplica weight-space programming mediante adaptación de bajo rango. La información disponible no detalla el volumen de tokens de entrenamiento, la composición exacta del dataset ni si se empleó RLHF o DPO; la model card únicamente enumera los conjuntos de evaluación (hf-audio/esb-datasets-test-only-sorted, hf-audio/open-asr-leaderboard y VoiceArena/Monsoon_en_IN_test). Como innovación destacable, el enrutamiento es estrictamente por enunciado (O(1) e invariable a la composición del batch) y el modelo funciona offline con `HF_HUB_OFFLINE=1`, sin dependencias externas en tiempo de ejecución.

## Capacidades

- Reconocimiento automático del habla en inglés sobre audio mono a 16 kHz, con decodificación greedy uniforme en todos los conjuntos.
- Transcripción por lotes de alta concurrencia (`batch_size=256` en el ejemplo oficial) con máscara de atención y padding a la longitud máxima.
- Manejo de dominios diversos: reuniones (AMI), llamadas de ganancias (Earnings22), audio de YouTube/pódcast (GigaSpeech), lectura financiera (SPGISpeech), llamadas de emergencia (URGENT 2024) y habla con acento indio (Voice Arena Monsoon).
- Robustez ante ruido y campo lejano mediante el stream dedicado `ventral_noise_stream`.
- Capacidad de transcripción de audio espontáneo y conversacional (stream `spontaneous_stream`).
- Soporte de audio de formato largo por segmentación implícita de los streams Conformer y TDT.
- Compatibilidad con `AutoProcessor`, `AutoConfig` y `AutoModelForSpeechSeq2Seq` (`IshikiASRForConditionalGeneration`) con `trust_remote_code=True`.
- No se documentan capacidades de tool calling, agentes, visión, audio generation ni modo thinking.

## Casos de uso

- Transcripción de reuniones corporativas: el `meeting_stream` (Conformer + Q-Former + Granite-2B) está especializado en habla de reuniones; con 6,12 % de WER en AMI-Cleaned y 203,1x RTFx en H100 permite procesar horas de audio en minutos.
- Subtitulado y actas de llamadas de resultados financieros: el stream de broadband (Whisper large-v3-turbo) y el ensemble logran 4,38 % de WER en Earnings22, adecuado para generar transcripciones auditables de webcasts.
- Atención al cliente y centros de contacto: el stream `ventral_noise_stream` y el `transducer_stream` (Parakeet TDT) permiten transcribir audio telefónico ruidoso; el modelo procesa 100 horas de SPGISpeech con 1,55 % de WER y 327,1x RTFx.
- Indexación y búsqueda de archivos de audio (pódcasts, YouTube, archivos de medios): con 290,1x RTFx en GigaSpeech y 6,67 % de WER, un solo H100 puede transcribir aproximadamente 35 horas de audio en unos 7 minutos.
- Análisis de llamadas de emergencia (911/112): el modelo reporta 3,84 % de WER en URGENT 2024 Clean y 8,02 % en el conjunto completo, útil para clasificación y triaje asistido por transcripción.
- Servicios de accesibilidad y subtitulado en tiempo real diferido: con 302,3x RTFx de corpus y un único checkpoint de 24,79 GiB, se puede desplegar en una GPU de 80 GB para transcripción por lotes de alta concurrencia.
- Procesamiento de habla con acento indio en inglés: 2,79 % de WER en Voice Arena Monsoon (en-IN) lo hace apto para mercados del sur de Asia.
- Investigación en ASR y evaluación comparativa: al ser un checkpoint único autocontenido y compatible con `HF_HUB_OFFLINE=1`, sirve como referencia reproducible en experimentos con el Open ASR Leaderboard.

## Benchmarks y rendimiento

Resultados declarados por el autor, medidos con `ishiki_labs/run_eval.py` y el scorer oficial `open_asr_leaderboard` (`align_manifests`), en 1x NVIDIA H100 80 GB:

| Dataset | Split | Enunciados | Audio (h) | WER (%) | RTFx (1x H100) |
|---|---|---:|---:|---:|---:|
| AMI-Cleaned | test | 7.715 | 7,98 | 6,12 | 203,1 |
| Earnings22-Cleaned-AA-chunked | test | 341 (6 llamadas) | 1,92 | 4,38 | 153,7 |
| GigaSpeech-Cleaned | test | 18.757 | 35,14 | 6,67 | 290,1 |
| SPGISpeech | test | 39.341 | 100,00 | 1,55 | 327,1 |
| URGENT 2024 | test | 1.000 | 1,92 | 8,02 | 216,2 |
| URGENT 2024 (Clean) | test | 1.000 | 1,92 | 3,84 | 265,1 |
| Voice Arena Monsoon (en-IN) | test | 2.102 | 5,62 | 2,79 | 298,5 |
| VoxPopuli-AA-Cleaned | test | 628 | 1,98 | 1,45 | 233,4 |
| Media 8 conjuntos cortos | — | 70.884 | 156,48 | 4,35 | 248,4 (299,7x corpus) |
| LibriSpeech | test.clean | 2.620 | 5,40 | 0,89 | 391,2 |
| LibriSpeech | test.other | 2.939 | 5,34 | 1,82 | 309,3 |
| Media 10 conjuntos públicos | — | 76.443 | 167,24 | 3,75 | 268,8 (302,3x corpus) |

No se han publicado en la información disponible resultados de benchmarks comparativos frente a otros modelos (MMLU, HumanEval, GSM8K u otros no aplican a un modelo ASR).

## Requisitos de hardware

- VRAM estimada para inferencia: 24,80 GiB residentes en BF16 según el autor; no se publican estimaciones para cuantizaciones de 8 o 4 bits.
- GPU recomendadas: NVIDIA H100 80 GB (referencia oficial de las métricas); por tamaño, también cabría en A100 80 GB y en GPUs de 32 GB o más con margen para activaciones y batch.
- GPU de consumo: no cabe en RTX 4090 (24 GB) en BF16 con holgura para activaciones; requeriría cuantización, no documentada por el autor.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (ruta oficial); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, y el código personalizado (`custom_code`) dificulta su uso en motores alternativos.
- Latencia y throughput: 302,3x RTFx de corpus y 268,8x RTFx de media por dataset en 1x H100 80 GB; 391,2x RTFx en LibriSpeech test.clean y 153,7x en Earnings22 (el más lento).
- Compatible con `HF_HUB_OFFLINE=1` y sin dependencias externas en tiempo de ejecución.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | WER medio (Open ASR LB) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ishiki-asr-1.0 | 13,31B | No disponible | 3,75 % (10 conjuntos) | CC-BY-4.0 | Hugging Face |
| Whisper large-v3-turbo | ~0,81B | 30 s por ventana | No disponible en la información | MIT (upstream) | Hugging Face |
| Parakeet TDT 0.6B v3 | ~0,6B | No disponible | No disponible en la información | No disponible en la información | Hugging Face |
| Qwen3-ASR-1.7B | ~1,7B | No disponible | No disponible en la información | No disponible en la información | Hugging Face |

No se dispone de cifras de WER comparables de los modelos alternativos en la información proporcionada; la comparación se limita a tamaño, licencia y disponibilidad. Ishiki-ASR-1.0 es sustancialmente mayor que sus componentes base porque agrega siete streams en un único checkpoint.

## Limitaciones y advertencias

- Solo soporta inglés; no se declaran otros idiomas, aunque incluye evaluación específica para inglés con acento indio.
- El WER se degrada en dominios ruidosos o espontáneos: 8,02 % en URGENT 2024 completo frente a 3,84 % en su variante Clean, y 6,67 % en GigaSpeech.
- Riesgo de alucinación y de transcripciones plausibles pero incorrectas en audio con ruido, solapamiento de hablantes o vocabulario técnico no visto; no se documentan mecanismos de confianza por token.
- No se publican datos sobre sesgos demográficos, acústicos o de acento más allá de la evaluación en-IN.
- Requiere `trust_remote_code=True` y código personalizado (`custom_code`), lo que implica revisar el código remoto antes de ejecutarlo en producción.
- El tamaño de 24,79 GiB en BF16 limita el despliegue a GPUs de 32 GB o más; no hay cuantizaciones oficiales publicadas.
- No se documentan límites de longitud de audio por llamada ni longitud de contexto del decodificador.
- Licencia CC-BY-4.0: permite uso comercial con atribución; conviene verificar las licencias de los checkpoints base (Qwen, Cohere, IBM Granite, OpenAI Whisper, NVIDIA Parakeet) antes de redistribuir.
- El modelo se publicó el 22 de noviembre de 2026 con 87 descargas y 1 like; la validación independiente es aún muy limitada.
- No se documentan resultados de benchmarks comparativos con otros modelos ASR, solo métricas propias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ishiki-labs/ishiki-asr-1.0
- Checkpoint base Qwen3-ASR-1.7B: https://huggingface.co/Qwen/Qwen3-ASR-1.7B
- Checkpoint base Cohere transcribe: https://huggingface.co/CohereLabs/cohere-transcribe-03-2026
- Checkpoint base Whisper large-v3-turbo: https://huggingface.co/openai/whisper-large-v3-turbo
- Checkpoint base Parakeet TDT 0.6B v3: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Checkpoint base Granite Speech 3.3 2B: https://huggingface.co/ibm-granite/granite-speech-3.3-2b
- Checkpoint base Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Checkpoint base Qwen3-Omni-30B-A3B: https://huggingface.co/Qwen/Qwen3-Omni-30B-A3B
- Dataset de evaluación ESB: https://huggingface.co/datasets/hf-audio/esb-datasets-test-only-sorted
- Dataset Open ASR Leaderboard: https://huggingface.co/datasets/hf-audio/open-asr-leaderboard
- Dataset Voice Arena Monsoon en-IN: https://huggingface.co/datasets/VoiceArena/Monsoon_en_IN_test
- Open ASR Leaderboard: https://huggingface.co/spaces/hf-audio/open_asr_leaderboard
