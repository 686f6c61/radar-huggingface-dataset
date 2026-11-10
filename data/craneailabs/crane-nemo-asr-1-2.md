# CraneAILabs/crane-nemo-asr-1.2

## Resumen

Crane Nemo ASR 1.2 es un modelo de reconocimiento automático del habla (ASR) en streaming desarrollado por CraneAI Labs, especializado en luganda, shona y suajili, manteniendo inglés como idioma de retención. Se trata de un fine-tune completo del modelo `nvidia/nemotron-3.5-asr-streaming-0.6b`, un FastConformer Cache-Aware RNN-Transducer de aproximadamente 600 millones de parámetros. El modelo transcribe habla conversacional y leída en tiempo real y se condiciona mediante un prompt de identificación de idioma.

La versión 1.2 recupera aproximadamente 56 horas adicionales de audio de luganda y shona que en versiones anteriores se descartaban por superar los 20 segundos de duración. Mediante alineamiento forzado con el alineador MMS, esos clips largos se segmentan en fragmentos de 3 a 10 segundos y se reincorporan al entrenamiento. El resultado es una mejora clara en luganda (WER del 20,9 % al 17,9 %) y, por transferencia entre idiomas, en suajili (del 25,1 % al 22,3 %), a costa de un ligero retroceso en inglés (del 9,1 % al 11,9 %).

El modelo resulta relevante porque cubre idiomas africanos con escasa representación en sistemas ASR comerciales, donde el modelo base rinde en torno al 100 % de WER, y lo hace con una arquitectura apta para despliegue de baja latencia en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer Cache-Aware RNN-Transducer (encoder de 24 capas, redes de predicción y conjunta) |
| Parametros totales | ~600 M (~633 M entrenables, 99 % del modelo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible; streaming con contexto de atención `[56, 13]` (~1,12 s de lookahead) |
| Tipos de cuantizacion | no disponible; inferencia streaming solo en fp32; entrenamiento en bf16-mixed |
| Idiomas soportados | luganda (lg), shona (sn), suajili (sw), inglés (en) |
| Licencia | OpenMDW 1.1 (`openmdw-1.1`) |
| Formato de pesos | no disponible (repositorio NeMo, ~2,6 GB) |

## Arquitectura y entrenamiento

El modelo es un RNN-Transducer sobre un encoder FastConformer con cache-aware streaming, lo que permite transcripción incremental con un lookahead de aproximadamente 1,12 segundos (contexto de atención `[56, 13]`). El fine-tune es completo: se entrenan las 24 capas del encoder junto con las redes de predicción y conjunta, lo que supone unos 633 millones de parámetros entrenables, el 99 % del modelo.

El entrenamiento empleó AdamW de 8 bits con tasa de aprendizaje `3,46e-4` seleccionada mediante barrido coarse-to-fine, schedule coseno con 200 pasos de warmup, precisión bf16-mixed y 12.000 pasos sobre una única NVIDIA L40 de 48 GB. La innovación principal de la versión 1.2 es la recuperación de datos: los clips de más de 20 segundos que el entrenador descarta se alinean forzosamente con el alineador MMS (`torchaudio.pipelines.MMS_FA`) y se resegmentan en enunciados de 3 a 10 segundos mediante cortes virtuales de offset y duración, añadiendo unas 56 horas de luganda y shona sin nuevas fuentes. La composición de datos aproximada es de 32 h de luganda (19 h recuperadas), 54 h de shona (38 h recuperadas), 9 h de suajili y 2 h de inglés para retención.

## Capacidades

- Reconocimiento automático del habla en luganda, shona, suajili e inglés, tanto en habla conversacional como leída.
- Transcripción en streaming de baja latencia gracias al mecanismo cache-aware con lookahead de ~1,12 s.
- Condicionamiento por prompt de identificación de idioma, con modo de autodetección recomendado para luganda y shona (sin slot dedicado).
- Manejo de audio de formato largo mediante segmentación interna de enunciados de 3 a 10 segundos.
- Punto de partida para fine-tuning adicional en otras lenguas o dominios acústicos.
- No dispone de tool calling, capacidades de agente, visión ni audio más allá del ASR.

## Casos de uso

- Subtitulado en directo de emisiones de radio o televisión en luganda, shona o suajili: el modo streaming con ~1,12 s de lookahead permite generar subtítulos casi sincrónicos sobre habla conversacional.
- Transcripción de reuniones y entrevistas: la segmentación de audio largo en enunciados de 3 a 10 segundos facilita procesar monólogos y conversaciones extensas sin truncar contenido.
- Asistentes de voz para atención al ciudadano en la región de África Oriental: el modelo puede alimentar pipelines de reconocimiento en aplicaciones de servicios públicos o sanitarios en suajili y luganda.
- Indexación y búsqueda de archivos de audio de archivo: transcripción masiva de corpus radiofónicos o etnográficos para hacerlos consultables por texto.
- Generación de datos etiquetados para investigación lingüística: las transcripciones sirven como base para anotación y análisis de lenguas bantúes con morfología aglutinante.
- Prototipado de productos de accesibilidad: dictado y control por voz para hablantes de shona o suajili en aplicaciones móviles con despliegue en servidor.
- Base para fine-tuning en variedades dialectales adicionales: al entrenarse el 99 % de los parámetros, el modelo conserva capacidad de adaptación a nuevos dominios acústicos.

## Benchmarks y rendimiento

Evaluación sobre un conjunto congelado de 50 clips por idioma, excluidos del entrenamiento por identificador de enunciado y de hablante. Normalización compartida: NFKC, minúsculas, eliminación de puntuación y colapso de espacios; métricas con `jiwer` agregadas sobre el conjunto completo.

| Idioma | CER ↓ | WER ↓ | Gemini (1–5) ↑ |
|---|---:|---:|---:|
| Luganda (lg) | 4,3 % | 17,9 % | 4,95 |
| Shona (sn) | 5,9 % | 26,6 % | 4,55 |
| Suajili (sw) | 6,8 % | 22,3 % | 4,53 |
| Inglés (en) | 5,5 % | 11,9 % | 4,60 |

Evolución respecto a la versión 1.1:

| Idioma | CER (1.1 → 1.2) | WER (1.1 → 1.2) |
|---|---|---|
| Luganda | 5,1 % → 4,3 % | 20,9 % → 17,9 % |
| Suajili | 7,3 % → 6,8 % | 25,1 % → 22,3 % |
| Shona | 6,0 % → 5,9 % | 27,3 % → 26,6 % |
| Inglés | 3,6 % → 5,5 % | 9,1 % → 11,9 % |

El modelo base sin fine-tuning rinde en torno al 100 % de WER en estos idiomas africanos, por lo que el ajuste es determinante.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con ~600 M de parámetros en fp32 (única precisión soportada en streaming cache-aware) el peso ronda los 2,4 GB, más overhead de runtime NeMo.
- GPU recomendadas: el entrenamiento se realizó en una NVIDIA L40 de 48 GB; para inferencia es suficiente una GPU con al menos 8-16 GB de VRAM.
- Cabe en GPU de consumo: previsiblemente sí en tarjetas con 8 GB o más (RTX 3060/4060 en adelante), aunque el requisito fp32 del modo streaming limita el ahorro de memoria.
- Opciones de despliegue: NeMo (librería nativa), con exportación a otros runtimes no documentada en la información disponible.
- Latencia y throughput: lookahead de ~1,12 s en modo streaming; cifras de throughput no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas foco | Streaming | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Crane Nemo ASR 1.2 | ~600 M | lg, sn, sw, en | Sí (cache-aware, fp32) | OpenMDW 1.1 | Hugging Face (NeMo) |
| nvidia/nemotron-3.5-asr-streaming-0.6b | ~600 M | Multilingüe general (no rinde en idiomas africanos: ~100 % WER) | Sí | no disponible | Hugging Face (NeMo) |
| Whisper (variantes) | 39 M – 1,55 B | Multilingüe amplio | No nativo | MIT / Apache 2.0 según variante | Hugging Face, OpenAI |
| MMS (Meta) | ~1 B | Multilingüe (incluye lenguas de bajos recursos) | No nativo | CC-BY-NC 4.0 | Hugging Face |

## Limitaciones y advertencias

- Los resultados se basan en 50 clips por idioma: son orientativos, no un benchmark a gran escala.
- La inferencia streaming cache-aware solo funciona en fp32, lo que limita optimizaciones de memoria y velocidad.
- El mejor rendimiento requiere el prompt de idioma en modo autodetección; luganda y shona carecen de slot dedicado.
- La retención de inglés retrocedió respecto a 1.1 (WER del 9,1 % al 11,9 %); si el inglés es prioritario, conviene usar la versión anterior.
- Gran parte del audio nuevo es habla conversacional segmentada; acústicas muy fuera de dominio (ruido intenso, micrófonos lejanos, code-switching denso) solo se manejan parcialmente.
- No validado para transcripción médica, legal o de seguridad crítica.
- Riesgo de alucinación y errores en morfología aglutinante: el WER elevado en shona (26,6 %) refleja penalizaciones por límites de palabra, por lo que conviene evaluar con CER y puntuaciones de preservación de significado.
- Licencia OpenMDW 1.1: revisar sus términos antes de uso comercial; no es una licencia permisiva estándar tipo Apache o MIT.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CraneAILabs/crane-nemo-asr-1.2
- Modelo base: https://huggingface.co/nvidia/nemotron-3.5-asr-streaming-0.6b
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
- Alineador MMS (torchaudio): https://pytorch.org/audio/stable/pipelines.html
- Librería jiwer: https://github.com/jitsi/jiwer
- NeMo (NVIDIA): https://github.com/NVIDIA/NeMo
