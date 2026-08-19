# quanfire-ai/rerank-gov-indic

## Resumen

`rerank-gov-indic` es un modelo de reranking (cross-encoder) desarrollado por quanfire-ai, especializado en la recuperación de comunicados de prensa del gobierno indio en 16 lenguas indias. Se trata de un ajuste fino completo de `intfloat/multilingual-e5-small` con una cabeza de ranking de una sola logit, entrenado para puntuar conjuntamente pares (consulta, pasaje). Su función no es generar embeddings ni actuar como recuperador, sino reordenar una lista corta de candidatos producida por un bi-encoder de primera etapa, como `embed-gov-indic`.

El modelo resuelve el problema de la recuperación multilingüe y translingüe en el dominio gubernamental: una consulta formulada en una lengua india debe encontrar el pasaje correcto sobre el mismo comunicado en otra lengua. Según los datos publicados, mejora el Recall@1 del recuperador de primera etapa en un 31,9% (de 0,3083 a 0,4067) sobre un conjunto de evaluación de 1.200 consultas translingües. Con 117,6 millones de parámetros y una ventana de contexto de 256 tokens, es un modelo ligero y desplegable en hardware modesto, con licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-encoder basado en `intfloat/multilingual-e5-small` (BERT) con cabeza de ranking de una logit |
| Parametros totales | 117.654.145 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 256 tokens (max_length) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | en, hi, ur, ta, te, kn, ml, bn, gu, mr, pa, or, as, ne, mni, kha (16 lenguas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un cross-encoder basado en la arquitectura BERT de `multilingual-e5-small`, con una cabeza de clasificación de una sola logit que puntúa la relevancia de un par (consulta, pasaje). A diferencia de un bi-encoder, no produce representaciones vectoriales independientes; procesa la consulta y el pasaje conjuntamente, lo que permite capturar interacciones finas entre ambos. El entrenamiento se realizó mediante un ajuste fino completo sobre comunicados de prensa del gobierno indio (PIB), reutilizados bajo la política de reproducción del PIB. No se menciona el uso de RLHF ni DPO; el entrenamiento se centra en la tarea de ranking supervisado. El modelo fue entrenado y evaluado contra las listas de candidatos generadas por el recuperador `embed-gov-indic`, por lo que su rendimiento está ligado a la distribución de candidatos de ese recuperador concreto.

## Capacidades

- Reranking de listas cortas de pasajes: toma una consulta y una lista de candidatos (por ejemplo, top-100 de un bi-encoder) y devuelve una puntuación de relevancia para cada par, reordenando la lista.
- Recuperación translingüe: una consulta en una lengua india puede encontrar pasajes sobre el mismo comunicado en otra lengua distinta.
- Soporte multilingüe: cubre 16 lenguas indias, incluyendo hindi, urdu, tamil, telugu, kannada, malayalam, bengalí, gujarati, maratí, punjabí, oriya, asamés, nepalí, manipuri y khasi, además del inglés.
- Especialización en dominio gubernamental: entrenado exclusivamente sobre comunicados de prensa del gobierno indio, lo que lo hace adecuado para tareas de recuperación en ese ámbito.
- Integración con pipelines retrieve-then-rerank: diseñado para usarse sobre un recuperador de primera etapa, no como sustituto.

## Casos de uso

- Recuperación de comunicados de prensa gubernamentales multilingües: un sistema de búsqueda en el portal del PIB puede usar `embed-gov-indic` para obtener un top-100 y luego `rerank-gov-indic` para posicionar el comunicado correcto en primer lugar, incluso cuando la consulta está en una lengua distinta a la del documento.
- Asistencia a periodistas e investigadores: un buscador especializado en noticias gubernamentales indias que permita consultas en cualquier lengua india y devuelva el comunicado original en su lengua de publicación, mejorando la precisión del ranking final.
- Monitorización de políticas públicas: un sistema que rastree comunicados sobre un tema concreto (por ejemplo, agricultura o sanidad) en múltiples lenguas, usando el reranker para priorizar los documentos más relevantes para una consulta dada.
- Archivado y catalogación automática: integración en un pipeline de ingestión documental donde los comunicados se etiquetan y clasifican por relevancia respecto a consultas predefinidas, reduciendo el trabajo manual de revisión.
- Búsqueda translingüe en portales ciudadanos: un portal de servicios gubernamentales que permita a los ciudadanos buscar información en su lengua materna y recuperar documentos oficiales redactados en otra lengua, con el reranker asegurando que el documento correcto aparece primero.
- Evaluación de calidad de recuperación: uso como componente de un sistema de evaluación automática que mida si el reranker mejora el ranking de un recuperador base en un corpus gubernamental multilingüe.

## Benchmarks y rendimiento

La model card publica resultados de Recall@1 sobre un conjunto de evaluación de 1.200 consultas translingües retenidas, contra un pool de 1.096 pasajes, con el recuperador `embed-gov-indic` como primera etapa. Los intervalos de confianza del 95% se calcularon mediante bootstrap pareado (B=2.000, con semilla).

| Metodo | Recall@1 | IC 95% |
|---|---|---|
| `embed-gov-indic` (solo recuperador) | 0,3083 | [0,2833, 0,3350] |
| `embed-gov-indic` + `rerank-gov-indic` | 0,4067 | [0,3783, 0,4358] |

- Delta: +0,0983 (+31,9%), con IC pareado [ +0,0692, +0,1275 ] que excluye el cero.
- De las consultas cuyo pasaje correcto estaba en el top-100 del recuperador (techo de 0,9475), el reranker eleva el 42,9% de ellas a la primera posición.
- Los resultados se midieron en CUDA. El Recall@1 absoluto es modesto por diseño, dado que se trata de recuperar un único pasaje correcto entre 1.096 en 16 lenguas, y el etiquetado de una sola respuesta trata los comunicados casi duplicados como fallos.

## Requisitos de hardware

- El modelo tiene 117,6 millones de parámetros, lo que lo hace ligero para inferencia. En precisión fp32, el peso ocupa aproximadamente 470 MB; en fp16, unos 235 MB. No se han publicado requisitos oficiales de VRAM.
- Es desplegable en GPUs de consumo como una RTX 3060 o superior, y también en CPU para cargas de trabajo moderadas, dado su tamaño reducido.
- Al ser un cross-encoder, la inferencia requiere procesar cada par (consulta, pasaje) por separado, por lo que el throughput depende del número de candidatos a rerankear. Para un top-100, se necesitan 100 pasadas del modelo por consulta.
- Opciones de despliegue: la librería `sentence-transformers` permite cargarlo con `CrossEncoder`; también es compatible con `text-embeddings-inference` (según los tags del modelo) y con endpoints de Hugging Face.
- No se han publicado datos de latencia ni throughput específicos.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados con otros rerankers en el mismo dominio. El modelo se basa en `multilingual-e5-small`, que es un bi-encoder multilingüe de 117M parámetros, pero no es un cross-encoder. Otros cross-encoders multilingües como `BAAI/bge-reranker-v2-m3` o `cross-encoder/ms-marco-MiniLM-L-6-v2` existen, pero no se han evaluado en este corpus gubernamental indio, por lo que no se puede establecer una comparación cuantitativa. La comparativa cualitativa se limita a indicar que `rerank-gov-indic` está especializado en un dominio y un conjunto de lenguas muy concretos, mientras que los alternativos son de propósito general.

## Limitaciones y advertencias

- Es un reranker, no un retriever: no produce embeddings y no puede usarse para búsqueda por similitud coseno. Si el recuperador de primera etapa no incluye el pasaje correcto en su lista de candidatos, el reranker no puede recuperarlo.
- Solo está validado para el dominio de comunicados de prensa del gobierno indio. Su uso en otros dominios (legal, financiero, conversacional, etc.) no está validado y probablemente degrade el rendimiento.
- El rendimiento se ha medido de forma agregada sobre el conjunto de consultas translingües; no se han publicado resultados por lengua individual, por lo que no hay garantía de rendimiento uniforme entre las 16 lenguas.
- Está entrenado contra las listas de candidatos de `embed-gov-indic`; usarlo con otro recuperador puede dar resultados no óptimos, aunque no se ha probado explícitamente.
- El etiquetado de una sola respuesta trata los comunicados casi duplicados como fallos, lo que puede subestimar el rendimiento real en casos donde existen múltiples versiones del mismo comunicado.
- La licencia Apache-2.0 permite uso comercial, pero el texto de entrenamiento se reutiliza bajo la política de reproducción del PIB, que exige atribución. El modelo no es reconstructivo (emite puntuaciones, no texto fuente), pero conviene revisar los términos de la política del PIB antes de un despliegue comercial.
- No se han publicado resultados de benchmarks estándar como MMLU, HumanEval o GSM8K, ya que no es un modelo generativo sino de ranking.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/quanfire-ai/rerank-gov-indic
- Repositorio de código: https://github.com/quanfire-ai/quanfire-multilingual-embedding
- Recuperador asociado: https://huggingface.co/quanfire-ai/embed-gov-indic
- Modelo base: https://huggingface.co/intfloat/multilingual-e5-small
