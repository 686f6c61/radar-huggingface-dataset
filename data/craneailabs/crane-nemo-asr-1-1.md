# CraneAILabs/crane-nemo-asr-1.1

## Resumen

Crane Nemo ASR 1.1 es un modelo de reconocimiento automático del habla (ASR) en streaming desarrollado por CraneAI Labs, especializado en tres lenguas africanas —luganda, shona y suajili— manteniendo además inglés. Se trata de un fine-tune completo del modelo base `nvidia/nemotron-3.5-asr-streaming-0.6b`, un FastConformer Cache-Aware RNN-Transducer de aproximadamente 600 millones de parámetros, lo que lo sitúa en la gama media de tamaño pero con latencia baja gracias a su diseño de streaming.

La relevancia del modelo radica en que el modelo base original es prácticamente inutilizable en estas lenguas (WER cercano al 100 %), mientras que este fine-tune reduce el error a cifras operativas (20,9 % en luganda, 27,3 % en shona, 25,1 % en suajili). La versión 1.1 supone un salto cualitativo respecto a la 1.0 porque entrena el encoder completo (24 capas) en lugar de solo las 12 superiores, lo que se traduce en mejoras sustanciales de precisión.

El modelo está pensado para transcripción en tiempo real de habla conversacional y leída, con decodificación cache-aware y condicionamiento mediante prompt de identificación de idioma. Se distribuye bajo licencia OpenMDW 1.1 y en formato nativo de NeMo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer Cache-Aware RNN-Transducer (encoder + prediction network + joint network) |
| Parametros totales | ~600 M (modelo base); ~633 M entrenables en el fine-tune (99 % del modelo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible como ventana de tokens; contexto de atención de streaming `[56, 13]` (~1,12 s de lookahead) |
| Tipos de cuantizacion | no disponible; inferencia en streaming solo en fp32; entrenamiento en bf16-mixed |
| Idiomas soportados | luganda (lg), shona (sn), suajili (sw), inglés (en) |
| Licencia | OpenMDW 1.1 (etiquetada como `other` en Hugging Face) |
| Formato de pesos | `.nemo` (formato nativo de NVIDIA NeMo) |

## Arquitectura y entrenamiento

El modelo se basa en un FastConformer con mecanismo de atención cache-aware, acoplado a un RNN-Transducer (encoder, prediction network y joint network). Esta combinación permite decodificación en streaming con una ventana de atención `[56, 13]`, equivalente a unos 1,12 segundos de lookahead, lo que habilita transcripción de baja latencia sin renunciar a contexto acústico suficiente. La inferencia en streaming está restringida a fp32.

El fine-tune de la versión 1.1 entrena el encoder completo (las 24 capas) junto con las redes de predicción y conjunta, con aproximadamente 633 millones de parámetros entrenables. Se usó AdamW de 8 bits con tasa de aprendizaje `3.46e-4` (seleccionada mediante barrido coarse-to-fine sobre el conjunto de evaluación congelado), schedule coseno con 200 pasos de warmup y 6.000 pasos totales, en precisión bf16-mixed sobre una única GPU NVIDIA L40 de 48 GB. Los datos de entrenamiento son habla leída y conversacional de corpus abiertos de lenguas africanas: aproximadamente 13,7 h de luganda, 15,8 h de shona, 9,2 h de suajili y 2,0 h de inglés incluidas para retención.

## Capacidades

- Transcripción de voz a texto en luganda, shona, suajili e inglés.
- Reconocimiento en streaming de baja latencia gracias a la atención cache-aware.
- Procesamiento de habla conversacional y habla leída.
- Condicionamiento por prompt de identificación de idioma, con modo de autodetección recomendado para luganda y shona (no tienen slot de prompt dedicado).
- Retención de inglés tras el fine-tune, con WER del 9,1 % en el conjunto de evaluación.
- No se documentan capacidades de tool calling, agentes, visión ni audio más allá de la propia transcripción.

## Casos de uso

- Subtitulado en directo de emisiones de radio o televisión en luganda, shona o suajili: el modo streaming con ~1,12 s de lookahead permite generar subtítulos casi en tiempo real sin esperar a que termine el audio.
- Transcripción de reuniones y entrevistas en suajili para actas y resúmenes posteriores: el modelo maneja habla conversacional y mantiene un CER del 7,3 %, adecuado para texto que luego se procese con un LLM.
- Atención al cliente por voz en centros de contacto de África Oriental: integrado en un pipeline de ASR + NLU, permite transcribir llamadas en suajili y derivar a un agente o a un sistema automático.
- Archivado y búsqueda de patrimonio oral en luganda y shona: digitalización de grabaciones etnográficas o históricas con un WER de 20,9 % y 27,3 % respectivamente, suficiente para indexación y recuperación por palabra clave.
- Punto de partida para fine-tuning adicional en otras lenguas bantúes: al ser un fine-tune completo sobre un modelo de 600 M, sirve como base para adaptar a idiomas relacionados con pocos datos.
- Investigación lingüística y sociolingüística: transcripción asistida de corpus de campo en luganda, shona y suajili, con la ventaja de que el modelo ya parte de un ASR funcional en lugar de uno con ~100 % de WER.
- Evaluación comparativa de ASR multilingüe en entornos de bajos recursos: útil como referencia de qué se puede conseguir con decenas de horas por lengua.

## Benchmarks y rendimiento

Evaluación sobre un conjunto congelado de 50 clips por idioma, excluidos de entrenamiento por ID de utterance y de hablante. WER y CER calculados con normalización compartida (NFKC, minúsculas, sin puntuación, espacios colapsados) mediante `jiwer`, agregados sobre el total del conjunto. La columna Gemini es una puntuación de preservación de significado de 1 a 5 (LLM-as-judge).

| Idioma | CER ↓ | WER ↓ | Gemini (1–5) ↑ |
|---|---:|---:|---:|
| Luganda (`lg`) | 5,1 % | 20,9 % | 4,95 |
| Shona (`sn`) | 6,0 % | 27,3 % | 4,50 |
| Suajili (`sw`) | 7,3 % | 25,1 % | 4,35 |
| Inglés (`en`) | 3,6 % | 9,1 % | 4,65 |

Comparación con la versión 1.0 del mismo modelo:

| Idioma | CER (1.0 → 1.1) | WER (1.0 → 1.1) |
|---|---|---|
| Luganda | 8,2 % → 5,1 % | 33,8 % → 20,9 % |
| Shona | 8,1 % → 6,0 % | 37,7 % → 27,3 % |
| Suajili | 8,1 % → 7,3 % | 27,5 % → 25,1 % |
| Inglés | 3,2 % → 3,6 % | 7,4 % → 9,1 % |

Punto de partida del modelo base sin fine-tune en lenguas africanas: WER de 99,7 % en luganda, 101,0 % en shona y 102,5 % en suajili (CER del 59–76 %).

## Requisitos de hardware

- El modelo completo ocupa 2,6 GB en el repositorio de Hugging Face, por lo que la inferencia en fp32 requiere del orden de 3–4 GB de VRAM, holgadamente dentro de GPUs de consumo.
- GPU recomendadas: cualquier GPU con al menos 6–8 GB de VRAM para inferencia (RTX 3060, RTX 4060, RTX 4090); para entrenamiento o fine-tuning adicional se recomienda al menos 24 GB (RTX 4090, A100, L40). El entrenamiento original se hizo en una L40 de 48 GB.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas modernas con 6 GB o más.
- Opciones de despliegue: NVIDIA NeMo (`nemo.collections.asr`) es la vía nativa; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no se publican cifras de latencia ni de throughput más allá del lookahead de ~1,12 s inherente al modo streaming; el modelo está diseñado para baja latencia, pero no se aportan medidas.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | WER (luganda / shona / suajili) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Crane Nemo ASR 1.1 | ~600 M | lg, sn, sw, en | 20,9 % / 27,3 % / 25,1 % | OpenMDW 1.1 | Hugging Face |
| nvidia/nemotron-3.5-asr-streaming-0.6b (base) | ~600 M | en (y otros) | 99,7 % / 101,0 % / 102,5 % | no disponible en la información | Hugging Face |
| Crane Nemo ASR 1.0 | ~600 M | lg, sn, sw, en | 33,8 % / 37,7 % / 27,5 % | OpenMDW 1.1 | Hugging Face |

No se dispone de información sobre otros modelos ASR comparables para estas lenguas concretas en la documentación proporcionada.

## Limitaciones y advertencias

- Los resultados se reportan sobre 50 clips por idioma: son orientativos, no un benchmark a gran escala.
- La inferencia en streaming cache-aware solo funciona en fp32; no se documenta fp16 ni bf16 para ese modo.
- Luganda y shona no tienen slot de prompt de idioma dedicado; se recomienda usar autodetección para ambas.
- El encoder completo se ha fine-tuneado con solo unas decenas de horas por idioma, por lo que acústicas muy fuera de dominio (ruido de fondo intenso, micrófonos lejanos, code-switching denso) solo se manejan parcialmente.
- El inglés sufre una pequeña pérdida de rendimiento respecto a la versión 1.0 (WER 7,4 % → 9,1 %; CER 3,2 % → 3,6 %) como coste de descongelar todo el encoder con una tasa de aprendizaje mayor.
- No validado para transcripción en entornos críticos de seguridad, médicos ni legales.
- No se documentan sesgos específicos más allá de los inherentes a los corpus de entrenamiento; al ser datos abiertos de lenguas africanas, la cobertura dialectal puede ser limitada.
- Riesgo de alucinación: no se documenta explícitamente, pero es un riesgo inherente a los modelos generativos de ASR en segmentos de audio ambiguos o con ruido.
- La licencia OpenMDW 1.1 debe revisarse antes de uso comercial; no se detallan restricciones específicas en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CraneAILabs/crane-nemo-asr-1.1
- Modelo base: https://huggingface.co/nvidia/nemotron-3.5-asr-streaming-0.6b
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
- Herramienta de evaluación `jiwer`: https://github.com/jitsi/jiwer
