# ai-sage/GigaAM-v4

## Resumen

GigaAM-v4 es un modelo fundacional de reconocimiento automático del habla (ASR) desarrollado por ai-sage, con arquitectura Zapformer y 239 millones de parámetros totales. Se distribuye como un modelo de dos cabezas (dual-head) con un encoder compartido, disponible en tres revisiones: `ssl` (modelo fundacional base), `rnnt` (ASR con decodificación RNN-T) y `ctc` (ASR con decodificación CTC). El modelo está entrenado sobre 7 millones de horas de audio sin etiquetar y 58.000 horas de habla supervisada.

Su principal valor diferencial es que combina transcripción de contexto completo y streaming con latencias de 160, 320 y 640 ms en un mismo modelo, ofreciendo tanto transcripciones crudas (`raw`) como formateadas de extremo a extremo (`e2e`). Está especializado en ruso e inglés, con resultados que superan a modelos mucho más grandes como Whisper large-v3 o Nemotron 30B-A4B en varios conjuntos de evaluación en ruso, manteniendo un tamaño reducido que facilita el despliegue en producción.

La relevancia actual de GigaAM-v4 radica en su eficiencia: con solo 238M de parámetros logra un WER medio de 5,99 % en ruso, frente al 16,01 % de Whisper large-v3 (1,5B) o el 19,20 % de Qwen3-ASR 1.7B. Además, su licencia MIT y el soporte de exportación a ONNX lo hacen atractivo para integraciones comerciales y despliegues en entornos con recursos limitados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Zapformer (encoder compartido, doble cabeza ASR: RNN-T y CTC) |
| Parámetros totales | 239.446.811 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (soporte fp16 en encoder según `fp16_encoder=True`) |
| Idiomas soportados | ruso (ru), inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (repo de 1,4 GB); exportación a ONNX |

## Arquitectura y entrenamiento

GigaAM-v4 se basa en la arquitectura Zapformer, un diseño de encoder compartido que alimenta dos cabezas de decodificación independientes: una RNN-T y otra CTC. Esta configuración dual-head permite al mismo modelo generar transcripciones mediante dos estrategias de decodificación distintas, lo que facilita comparar y elegir el compromiso entre precisión y latencia según el caso de uso. El modelo se ha preentrenado de forma auto-supervisada sobre 7 millones de horas de audio sin etiquetar y posteriormente se ha entrenado de forma supervisada sobre 58.000 horas de habla transcrita.

El modelo soporta explícitamente inferencia de contexto completo y streaming con ventanas de 160, 320 y 640 ms, lo que lo hace apto tanto para transcripción por lotes como para aplicaciones en tiempo real. La revisión `rnnt` incluye tokenizadores SentencePiece emparejados. No se detalla en la información disponible si se aplicaron técnicas de RLHF o DPO, ni la composición exacta del dataset de entrenamiento. El modelo exporta grafos ONNX tanto para contexto completo como para streaming, y la inferencia puede ejecutarse con el encoder en fp16.

## Capacidades

- Reconocimiento automático del habla (ASR) en ruso e inglés.
- Transcripción de contexto completo con salida cruda (`raw`) y formateada de extremo a extremo (`e2e`).
- Streaming en tiempo real con ventanas de 160 ms, 320 ms y 640 ms mediante una API con estado (`create_stream`, `transcribe_partial`, `flush`).
- Doble estrategia de decodificación: RNN-T y CTC, seleccionables por revisión.
- Modelo fundacional SSL (`ssl`) reutilizable para preentrenamiento o fine-tuning.
- Extracción de características (`feature-extraction`) además de ASR.
- Exportación a ONNX para grafos de contexto completo y de streaming.
- Soporte de audio preprocesado mediante `prepare_wav` y segmentación por paquetes.
- No se documenta soporte de tool calling, agentes, visión ni audio más allá del ASR.

## Casos de uso

- Transcripción de reuniones y actas en ruso: el modelo puede procesar audio de contexto completo y devolver texto formateado (`e2e`) con puntuación y mayúsculas, adecuado para generar actas automáticas en entornos corporativos.
- Subtitulado en tiempo real: gracias al streaming con ventanas de 160-640 ms, puede alimentar sistemas de subtítulos en directo con latencia controlada, integrándose en pipelines de vídeo o plataformas de videoconferencia.
- Atención al cliente y centros de llamadas: con un WER de 6,71 % en el conjunto Callcenter (ruso), es adecuado para transcribir y analizar conversaciones telefónicas, alimentando sistemas de analítica de voz y control de calidad.
- Dictado y asistentes de voz: su tamaño reducido (238M) y exportación a ONNX permiten desplegarlo en entornos con GPU modesta o incluso CPU para dictado en aplicaciones de escritorio o móviles.
- Accesibilidad y habla con trastornos: con un WER de 12,88 % en Disordered Speech (frente a 33,69 % de Whisper large-v3), puede emplearse en herramientas de transcripción para personas con dificultades del habla.
- Transcripción de contenido educativo y técnico: los resultados en Education (6,80 %) y Synth IT Terms (5,07 %) lo hacen útil para generar apuntes, subtítulos de cursos y documentación técnica a partir de audio.
- Procesamiento por lotes de archivos de audio en pipelines de datos: la API de contexto completo y la exportación ONNX facilitan la integración en procesos ETL de transcripción masiva.
- Fine-tuning sobre dominios específicos: la revisión `ssl` sirve como base para adaptar el modelo a vocabulario o acentos concretos mediante el repositorio GitHub de GigaAM.

## Benchmarks y rendimiento

WER (%) en ruso, contexto completo E2E (menor es mejor):

| Conjunto | GigaAM-v4 RNN-T | GigaAM-v4 CTC | GigaAM-v3 RNN-T | Whisper large-v3 | Nemotron 30B-A4B | Parakeet Ultra | Qwen3-ASR 1.7B |
|---|---:|---:|---:|---:|---:|---:|---:|
| Parámetros | 238M | 234M | 222M | 1,5B | 34B (4,3B activos) | 627M | 2B |
| Golos Crowd | 4,56 | 5,05 | 7,43 | 12,22 | 4,36 | **2,86** | 13,14 |
| Golos Farfield | **3,62** | 4,07 | 4,97 | 16,11 | 8,25 | 6,47 | 20,22 |
| Russian LibriSpeech | **3,69** | 4,06 | 5,77 | 8,61 | 9,16 | 9,19 | 15,16 |
| Mozilla Common Voice 27 | 2,29 | 2,68 | **2,24** | 5,88 | 4,81 | 5,41 | 7,55 |
| Disordered Speech | 12,88 | **12,78** | 18,68 | 33,69 | 35,45 | 32,13 | 44,29 |
| Callcenter | **6,71** | 7,20 | 11,04 | 25,96 | 26,70 | 20,77 | 23,95 |
| Natural Speech | **8,32** | 8,43 | 10,37 | 16,22 | 14,26 | 13,99 | 17,53 |
| Synth IT Terms | **5,07** | 5,61 | 15,27 | 9,63 | 14,63 | 12,57 | 15,31 |
| Education | **6,80** | 7,04 | 9,83 | 15,72 | 12,71 | 12,19 | 15,65 |
| Media | **5,99** | 6,33 | 9,51 | 16,01 | 14,48 | 12,84 | 19,20 |

WER (%) en inglés, subconjunto público de Open ASR benchmark:

| Conjunto | GigaAM-v4 RNN-T | GigaAM-v4 CTC | Whisper large-v3 | Qwen3-ASR | Canary Flash 1B | Parakeet TDT-CTC | GigaAM-v4 RNN-T (640 ms) | Nemotron 3.5 ASR (1120 ms) |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Parámetros | 238M | 234M | 1,55B | 938M | 883M | 1,1B | 238M | 600M |
| Media | 7,28 | 7,83 | 7,70 | **6,67** | 7,96 | 7,85 | 8,49 | 9,51 |
| AMI-Cleaned | **7,47** | 11,34 | 13,66 | 9,47 | 11,76 | 12,19 | 8,47 | 12,19 |
| Earnings22-Cleaned-AA-chunked | 7,91 | 7,71 | 7,81 | 8,07 | **6,99** | 8,36 | 8,66 | 13,54 |
| Gigaspeech-Cleaned | 8,38 | 9,78 | 8,37 | **7,62** | 8,65 | 8,43 | 8,98 | 9,36 |
| SPGISpeech | 2,00 | 2,15 | 2,69 | 2,74 | **1,69** | 1,99 | 2,36 | 3,03 |
| URGENT24 | 15,57 | 14,84 | 13,65 | **11,59** | 17,66 | 14,96 | 19,11 | 18,23 |
| Voice Arena Monsoon | 4,88 | 4,44 | **3,95** | 4,13 | 4,58 | 5,10 | 7,06 | 6,33 |
| Voxpopuli-AA-Cleaned | 4,79 | 4,55 | 3,79 | **3,06** | 4,42 | 3,95 | 4,81 | 3,94 |

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo completo ocupa 1,4 GB en safetensors; con encoder en fp16 cabe holgadamente en GPUs de 4-8 GB.
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM; RTX 3060, RTX 4090, A100 o H100 son suficientes y sobradas para este tamaño.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer con 4 GB o más de VRAM (GTX 1650, RTX 3050, RTX 4060, etc.).
- Opciones de despliegue: Transformers (`AutoModel.from_pretrained` con `trust_remote_code=True`), ONNX Runtime (grafos de contexto completo y streaming), y el repositorio GitHub de GigaAM para fine-tuning. No se documenta soporte explícito de vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: el streaming soporta ventanas de 160, 320 y 640 ms; no se proporcionan cifras de throughput (RTF) en la información disponible.
- Dependencias: `numpy`, `transformers<5`, `onnx`, `onnxruntime`, `hydra-core`, `omegaconf`, `sentencepiece`, `tqdm`.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | WER medio ruso | WER medio inglés | Licencia | Disponibilidad |
|---|---:|---|---:|---:|---|---|
| GigaAM-v4 RNN-T | 238M | ru, en | **5,99** | 7,28 | MIT | Hugging Face |
| Whisper large-v3 | 1,5B | multilingüe | 16,01 | 7,70 | MIT | Hugging Face / OpenAI |
| Qwen3-ASR 1.7B | 2B | multilingüe | 19,20 | **6,67** | no disponible | Hugging Face |
| Nemotron 30B-A4B | 34B (4,3B activos) | multilingüe | 14,48 | no disponible | no disponible | no disponible |
| Parakeet Ultra | 627M | inglés | 12,84 | no disponible | no disponible | no disponible |

GigaAM-v4 destaca por ofrecer el mejor WER medio en ruso con una fracción de los parámetros de sus competidores, y un rendimiento en inglés competitivo (7,28 %) pese a su tamaño reducido. Su licencia MIT es más permisiva que la de varios de los modelos comparados, cuyo régimen de licencia no se detalla en la información disponible.

## Limitaciones y advertencias

- Solo soporta ruso e inglés de forma declarada; no se garantiza un rendimiento adecuado en otros idiomas.
- No se documentan evaluaciones de sesgos; al ser un modelo de ASR, puede heredar sesgos acústicos y léxicos de los datos de entrenamiento (acentos, géneros, edades).
- Riesgo de alucinación en pasajes de audio con ruido, silencios o habla solapada; conviene validar las transcripciones en producción.
- El rendimiento en inglés es inferior al de modelos especializados como Qwen3-ASR (6,67 % medio frente a 7,28 %), especialmente en URGENT24 (15,57 %).
- La licencia MIT permite uso comercial, pero el modelo depende de `trust_remote_code=True`, lo que implica ejecutar código personalizado del repositorio; auditar antes de desplegar.
- Requiere `transformers<5`, lo que puede suponer un conflicto de dependencias en entornos con versiones más recientes.
- No se detallan los datos de entrenamiento ni posibles técnicas de alineación (RLHF/DPO), lo que limita la trazabilidad para auditorías.
- La longitud de contexto no está especificada; para audios muy largos conviene usar streaming o segmentación manual.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ai-sage/GigaAM-v4
- Repositorio GitHub de GigaAM (fine-tuning y uso avanzado): https://github.com/salute-developers/GigaAM
