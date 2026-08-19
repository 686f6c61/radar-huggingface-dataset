# nvidia/parakeet-tdt-0.6b-v3

## Resumen

Parakeet TDT 0.6B v3 es un modelo de reconocimiento automático del habla (ASR) multilingüe desarrollado por NVIDIA, diseñado para transcripción de voz a texto de alto rendimiento. Con 627 millones de parámetros, extiende la versión anterior (v2, centrada en inglés) ampliando el soporte a 25 lenguas europeas, incluyendo español, francés, alemán, italiano, portugués y las lenguas bálticas y eslavas. El modelo detecta automáticamente el idioma de entrada y transcribe sin necesidad de indicaciones adicionales.

Está construido sobre la arquitectura FastConformer-TDT (Token and Duration Transducer), un encoder FastConformer con un decodificador TDT que permite una decodificación eficiente y de baja latencia. Se entrenó con el dataset Granary de NVIDIA, que supera las 670.000 horas de audio, junto con el conjunto nemo/asr-set-3.0. Su relevancia actual radica en que ofrece un rendimiento de nivel puntero en transcripción multilingüe con un tamaño contenido, lo que lo hace desplegable en entornos de producción con GPUs estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer-TDT (encoder FastConformer + decodificador TDT) |
| Parametros totales | 627.057.286 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio, procesa audio continuo) |
| Tipos de cuantizacion | safetensors (FP32/FP16), GGUF disponible |
| Idiomas soportados | 25 lenguas europeas: en, es, fr, de, bg, hr, cs, da, nl, et, fi, el, hu, it, lv, lt, mt, pl, pt, ro, sk, sl, sv, ru, uk |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura FastConformer-TDT, que combina un encoder FastConformer (una variante eficiente del Conformer con atención de tiempo completo) con un decodificador TDT (Token and Duration Transducer). El TDT es una variante del Transducer que predice simultáneamente el token y su duración, lo que reduce el número de pasos de decodificación y mejora el throughput frente a los transductores clásicos. El entrenamiento se realizó con atención completa (full attention) para capturar mejor el contexto acústico.

Los datos de entrenamiento provienen principalmente del dataset Granary de NVIDIA, con más de 670.000 horas de audio, complementado con el conjunto nemo/asr-set-3.0. No se menciona explícitamente el uso de RLHF o DPO, ya que es un modelo de ASR y no un modelo de lenguaje generativo. La innovación clave es la detección automática del idioma de entrada, que permite transcribir sin necesidad de especificar el idioma previamente, simplificando el pipeline en aplicaciones multilingües.

## Capacidades

- Transcripción de voz a texto en 25 lenguas europeas con detección automática del idioma.
- Alto rendimiento (high-throughput) gracias a la decodificación TDT, adecuado para procesamiento por lotes y streaming.
- Soporte de audio continuo sin límite de contexto explícito (procesa flujos de audio).
- No requiere prompting ni configuración previa del idioma: el modelo lo infiere automáticamente.
- Compatible con el ecosistema Hugging Face Transformers y NeMo, así como con despliegue en Azure (endpoints compatibles).
- Disponible en formato GGUF para ejecución en CPU/GPU con llama.cpp y otras herramientas de cuantización.

## Casos de uso

- Transcripción de reuniones y videollamadas: el modelo puede transcribir conversaciones multi-participante en tiempo real o diferido, con soporte para múltiples idiomas europeos, ideal para herramientas de productividad empresarial.
- Subtitulación automática de vídeo: integrable en pipelines de postproducción para generar subtítulos en 25 idiomas, reduciendo costes frente a servicios externos.
- Asistentes de voz multilingües: al detectar el idioma automáticamente, puede servir como backend de ASR en asistentes que atienden a usuarios de distintos países sin configuración manual.
- Transcripción de llamadas de atención al cliente: con su alta precisión en inglés (WER 1.93 en LibriSpeech clean) y buen rendimiento en otros idiomas, es adecuado para centros de contacto que necesitan registrar y analizar conversaciones.
- Análisis de contenido audiovisual: transcripción de podcasts, webinars y noticias para indexación, búsqueda y generación de resúmenes.
- Traducción automática de voz (pipeline): combinado con un modelo de traducción, permite convertir audio en un idioma a texto traducido a otro, útil para subtitulado multilingüe.
- Despliegue en entornos con recursos limitados: al ser un modelo de 0.6B, puede ejecutarse en GPUs de consumo (p.ej., RTX 4090) con cuantización GGUF, permitiendo ASR local sin conexión.

## Benchmarks y rendimiento

Resultados oficiales declarados por NVIDIA (WER, menor es mejor):

| Dataset | Config | Split | Idioma | WER |
|---|---|---|---|---|
| AMI (Meetings test) | ihm | test | en | 11.31 |
| Earnings-22 | test | test | en | 11.42 |
| GigaSpeech | test | test | en | 9.59 |
| LibriSpeech (clean) | other | test | en | 1.93 |
| LibriSpeech (clean) | other | test | en | 3.59 |
| SPGI Speech | test | test | en | 3.97 |
| tedlium-v3 | release1 | test | en | 2.75 |
| Vox Populi | en | test | en | 6.14 |
| FLEURS | bg_bg | test | bg | 12.64 |
| FLEURS | cs_cz | test | cs | 11.01 |
| FLEURS | da_dk | test | da | 18.41 |
| FLEURS | de_de | test | de | 5.04 |
| FLEURS | el_gr | test | el | 20.7 |
| FLEURS | en_us | test | en | 4.85 |
| FLEURS | es_419 | test | es | 3.45 |
| FLEURS | et_ee | test | et | 17.73 |
| FLEURS | fi_fi | test | fi | 13.21 |
| FLEURS | fr_fr | test | fr | 5.15 |
| FLEURS | hr_hr | test | hr | no disponible |

Nota: los valores de FLEURS para otros idiomas (hu, it, lv, lt, mt, nl, pl, pt, ro, sk, sl, sv, ru, uk) no se han incluido en la información proporcionada, pero el modelo declara soporte para ellos.

## Requisitos de hardware

- VRAM estimada: el modelo tiene 627M parámetros. En FP32 (~2.5 GB) cabe en cualquier GPU moderna; en FP16 (~1.3 GB) es aún más ligero. Con cuantización GGUF (p.ej., Q8) puede ocupar menos de 1 GB.
- GPUs recomendadas: cualquier GPU con al menos 4 GB de VRAM para FP16. Para inferencia de alto rendimiento, se recomienda una GPU de datacenter (A100, H100) o una GPU de consumo de gama alta (RTX 4090, RTX 3090).
- Cabe en GPUs de consumo: sí, incluso en tarjetas de 8 GB (RTX 3070, RTX 4060 Ti) con cuantización.
- Opciones de despliegue: vLLM (aunque está orientado a LLM, puede usarse con adaptadores), llama.cpp (formato GGUF), Hugging Face Transformers, NeMo, y endpoints compatibles en Azure.
- Latencia y throughput: no se proporcionan datos exactos, pero la arquitectura TDT está diseñada para alta velocidad de decodificación; en GPUs modernas se espera un throughput de cientos de horas de audio por hora de cómputo.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nvidia/parakeet-tdt-0.6b-v3 | 627M | 25 europeos | no disponible | CC-BY-4.0 | Hugging Face, NGC |
| nvidia/parakeet-tdt-0.6b-v2 | ~600M | inglés | no disponible | CC-BY-4.0 | Hugging Face, NGC |
| Whisper large-v3 (OpenAI) | 1.5B | 99 idiomas | 30 s de audio | MIT | Hugging Face, OpenAI API |
| MMS (Meta) | 300M-1B | 1000+ idiomas | no disponible | CC-BY-NC | Hugging Face |

Parakeet TDT 0.6B v3 se posiciona como una alternativa más ligera y rápida que Whisper large-v3, con un rendimiento competitivo en inglés y mejor cobertura de lenguas europeas que la v2. Su licencia CC-BY-4.0 permite uso comercial sin restricciones de atribución, a diferencia de MMS que es CC-BY-NC.

## Limitaciones y advertencias

- Sesgos: al entrenarse principalmente con audio de dominio público y corporativo (Granary), puede tener un rendimiento inferior en acentos muy regionales o jerga especializada.
- Riesgo de alucinación: como todo modelo ASR, puede producir transcripciones incorrectas en audio de baja calidad, ruido de fondo o solapamiento de hablantes.
- Limitaciones de idioma: aunque cubre 25 lenguas europeas, no incluye lenguas no europeas (p.ej., chino, árabe, japonés). La detección automática de idioma puede fallar en hablantes bilingües o con acentos muy marcados.
- Restricciones de licencia: CC-BY-4.0 permite uso comercial, pero requiere atribución al autor (NVIDIA). No hay restricciones de uso militar o de vigilancia, pero se recomienda revisar los términos completos.
- Caveat de producción: el modelo no incluye puntuación ni normalización de mayúsculas por defecto; es necesario añadir un postprocesador (p.ej., un modelo de puntuación) para obtener texto listo para presentación.

## Enlaces

- Hugging Face: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- NVIDIA NGC (colección): https://catalog.ngc.nvidia.com/orgs/nvidia/collections/parakeet-tdt-0.6b
- NVIDIA NGC (contenedor NIM): https://catalog.ngc.nvidia.com/orgs/nim/teams/nvidia/containers/parakeet-0.6b-tdt
- Together AI (despliegue): https://www.together.ai/models/parakeet-tdt-0-6b-v3
- Paper relacionado (FastConformer): https://arxiv.org/abs/2305.05084
- Paper relacionado (TDT): https://arxiv.org/abs/2505.13404
- Paper relacionado (Granary): https://arxiv.org/abs/2509.14128
