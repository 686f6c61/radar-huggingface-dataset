# alphaedge-ai/whisper-large-v3-turbo-san-16384

## Resumen

`whisper-large-v3-turbo-san-16384` es una variante "trimmed" (podada en vocabulario) de `openai/whisper-large-v3-turbo`, publicada por alphaedge-ai y especializada en sánscrito (código ISO `sa`). El modelo parte de la arquitectura Whisper original de OpenAI (encoder-decoder transformer para reconocimiento automático del habla) y aplica la técnica de trimming descrita por Loïck Bourdois y colaboradores en el blog de Hugging Face: se reduce el vocabulario del tokenizer de 51.865 a 16.384 tokens conservando únicamente los que aparecen en un corpus de minería de 14.725 textos en sánscrito del dataset `lbourdois/fineweb-2-trimming`.

El resultado es un modelo de 763.461.120 parámetros (un 5,61% menos que los 808.878.080 del original) y un repositorio de 1,5 GB, con una reducción del vocabulario del 68,41%. La motivación es doble: por un lado, disminuir la huella de memoria de los embeddings y de la capa de salida, que en Whisper representan una fracción significativa de los parámetros; por otro, mantener la calidad de transcripción en sánscrito con un coste de almacenamiento e inferencia menor.

Es relevante ahora porque demuestra una vía práctica de especialización de modelos ASR multilingües grandes hacia idiomas de bajos recursos o nicho sin reentrenar el modelo desde cero. La licencia Apache 2.0 y el formato safetensors lo hacen directamente desplegable con `transformers` y compatible con endpoints.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper (encoder-decoder transformer) |
| Parametros totales | 763.461.120 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 s por segmento, herencia de Whisper) |
| Tipos de cuantizacion | no disponible (el repo publica safetensors en precisión original; admite cuantización estándar de transformers) |
| Idiomas soportados | sánscrito (`sa`) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la de Whisper large-v3-turbo: un transformer encoder-decoder con atención estándar, entrenado originalmente por OpenAI con supervisión débil a gran escala (paper arXiv:2212.04356). El modelo base large-v3-turbo reduce el número de capas del decoder respecto a large-v3, lo que explica su menor coste de inferencia. La innovación de esta variante no está en la arquitectura sino en el vocabulario: se aplicó la técnica de trimming, que consiste en identificar los tokens efectivamente usados en un idioma mediante minería sobre un corpus y recortar el vocabulario del tokenizer y las matrices de embedding y de proyección de salida a esos tokens.

El corpus de minería consta de 14.725 textos en sánscrito del dataset `lbourdois/fineweb-2-trimming`. No se especifica en la información disponible si hubo reentrenamiento adicional, fine-tuning supervisado o ajuste con RLHF/DPO; la model card indica que el modelo podado "debería comportarse de forma similar al original" y no documenta pasos de entrenamiento posteriores. La reducción de parámetros (5,61%) se concentra en las capas de embedding y en la proyección final del decoder.

## Capacidades

- Reconocimiento automático del habla (ASR) en sánscrito, con pipeline `automatic-speech-recognition`.
- Transcripción de audio muestreado a 16 kHz, con segmentos de hasta 30 segundos por ventana (herencia de Whisper).
- Tarea de transcripción (`task: transcribe`) configurable vía `generate_kwargs`.
- Soporte nativo en `transformers` mediante `AutoModelForSpeechSeq2Seq`, `AutoProcessor` y `pipeline`.
- Compatibilidad con endpoints de Hugging Face (`endpoints_compatible`).
- No se documentan capacidades de traducción, tool calling, agentes, visión ni audio más allá del ASR estándar de Whisper.
- Capacidad multilingüe limitada al sánscrito: los tokens de otros idiomas fueron eliminados del vocabulario.

## Casos de uso

- Transcripción de corpus académicos en sánscrito: digitalización de grabaciones de recitación, clases o conferencias en sánscrito para su posterior análisis filológico, aprovechando que el vocabulario podado está optimizado para ese idioma.
- Archivística y preservación digital: conversión de colecciones de audio histórico en sánscrito a texto buscable, con un modelo de 1,5 GB que reduce el coste de almacenamiento frente al original de mayor tamaño.
- Investigación lingüística computacional: generación de transcripciones para estudios de fonética, morfología o prosodia sánscrita, con un modelo especializado que evita el sesgo hacia idiomas mayoritarios del vocabulario original.
- Subtitulado de material audiovisual en sánscrito: integración en pipelines de postproducción para generar subtítulos automáticos de documentales o materiales educativos.
- Despliegue en entornos con recursos limitados: al ocupar 1,5 GB en safetensors, cabe en GPUs de consumo y en instancias de inferencia modestas, lo que facilita servir ASR en sánscrito sin infraestructura de gran escala.
- Evaluación comparativa de técnicas de trimming: servir como referencia para estudiar la pérdida de calidad al podar vocabularios en modelos ASR multilingües, comparándolo con el original large-v3-turbo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta métricas de tamaño (vocabulario, parámetros y porcentaje de reducción), sin valores de WER, CER ni comparaciones con el modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa por tamaño (763 M parámetros), en fp32 serían aproximadamente 3 GB de pesos; en fp16 unos 1,5 GB; en int8 unos 0,8 GB. Estas cifras son estimaciones por tamaño y no datos publicados por el autor.
- GPU recomendadas: no especificadas. Por tamaño, cualquier GPU con al menos 4-6 GB de VRAM libre debería poder cargar el modelo en fp16.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas tipo RTX 3060, RTX 4060 o superiores, dado el tamaño del repositorio (1,5 GB).
- Opciones de despliegue: `transformers` (documentado en la model card), endpoints de Hugging Face (tag `endpoints_compatible`). No se documentan integraciones específicas con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Vocabulario | Idiomas | Licencia | Contexto de audio |
|---|---|---|---|---|---|
| alphaedge-ai/whisper-large-v3-turbo-san-16384 | 763.461.120 | 16.384 | sánscrito | apache-2.0 | no disponible (30 s por segmento, herencia Whisper) |
| openai/whisper-large-v3-turbo | 808.878.080 | 51.865 | multilingüe | apache-2.0 | no disponible (30 s por segmento) |
| openai/whisper-large-v3 | no disponible en la información | no disponible | multilingüe | apache-2.0 | no disponible (30 s por segmento) |

La comparación se limita a datos de tamaño y licencia; no hay resultados de benchmarks publicados para esta variante que permitan comparar calidad de transcripción con el modelo base ni con large-v3.

## Limitaciones y advertencias

- El modelo está especializado exclusivamente en sánscrito: los tokens de otros idiomas fueron eliminados del vocabulario, por lo que el rendimiento en cualquier otro idioma será previsiblemente pobre o nulo.
- No se han publicado métricas de calidad (WER/CER) que confirmen que la poda no degrada la transcripción respecto al modelo base; la afirmación de "comportamiento similar" es una expectativa del autor, no un resultado medido.
- Riesgo de alucinación inherente a Whisper en segmentos de audio con ruido, silencios o habla no inteligible.
- Sesgos heredados del entrenamiento original de Whisper con supervisión débil a gran escala, no documentados específicamente para sánscrito.
- El uso comercial está permitido por la licencia Apache 2.0, pero conviene verificar las condiciones del modelo base y del dataset de minería.
- El modelo tiene 33 descargas y 0 likes en el momento de la consulta, lo que indica escasa validación por parte de la comunidad; no hay evidencia de uso en producción.
- La fecha de creación (2026-06-01) y el tag `region:eu` no vienen acompañados de documentación adicional sobre su significado o implicaciones de despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alphaedge-ai/whisper-large-v3-turbo-san-16384
- Modelo base: https://huggingface.co/openai/whisper-large-v3-turbo
- Dataset de minería: https://huggingface.co/datasets/lbourdois/fineweb-2-trimming
- Blog sobre trimming: https://huggingface.co/blog/lbourdois/introduction-to-trimming
- Paper de Whisper: https://arxiv.org/abs/2212.04356
