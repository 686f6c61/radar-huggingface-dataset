# mbehr90/msmarco-MiniLM-L12-en-de-v1-fp8

## Resumen

El modelo `mbehr90/msmarco-MiniLM-L12-en-de-v1-fp8` es una cuantización en FP8 dinámico del cross-encoder bilingüe inglés-alemán `cross-encoder/msmarco-MiniLM-L12-en-de-v1`, desarrollado por el usuario mbehr90. Está pensado para tareas de re-ranking de pasajes en recuperación de información, donde un modelo cross-encoder puntúa pares consulta-documento para reordenar los resultados de una búsqueda inicial. La cuantización se ha realizado con la librería `llm-compressor` 0.13.0 y está optimizada para servirse con vLLM 0.26.0.

El modelo base es un transformer encoder de tipo BERT (MiniLM-L12) con 117,7 millones de parámetros, entrenado sobre la tarea MS MARCO Passage Ranking para el par de idiomas EN-DE. La versión FP8 reduce el tamaño del checkpoint de 449 MiB a 225 MiB, aunque esta reducción es equivalente a cargar el modelo original en bf16, ya que el 82% de los parámetros corresponden a la capa de embeddings de vocabulario, que no se cuantiza. La calidad de re-ranking se mantiene prácticamente intacta, con una pérdida de nDCG@10 de solo 0,0003 respecto al modelo fp32.

La relevancia de este modelo radica en que ofrece una alternativa cuantizada y lista para producción con vLLM, manteniendo el rendimiento del modelo original y permitiendo un despliegue eficiente en entornos con restricciones de memoria, aunque con la salvedad de que la ganancia de tamaño frente a una versión bf16 es nula.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (MiniLM-L12) cross-encoder |
| Parametros totales | 117.654.145 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (FP8_DYNAMIC) |
| Idiomas soportados | EN-DE (segun modelo base) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base es un cross-encoder basado en MiniLM-L12, una variante compacta de BERT con 12 capas y 117,7 millones de parámetros. A diferencia de los bi-encoders, un cross-encoder procesa conjuntamente la consulta y el pasaje como una única secuencia de entrada, produciendo una puntuación de relevancia directamente. El entrenamiento original se realizó sobre la tarea MS MARCO Passage Ranking, con datos en inglés y alemán, lo que le confiere capacidad de re-ranking bilingüe EN-DE.

La cuantización FP8 se ha aplicado únicamente a las capas lineales del encoder, manteniendo en bf16 los embeddings de vocabulario, posición y token-type, así como el pooler y la cabeza de clasificación. Esta decisión se debe a una limitación de vLLM 0.26.0, que no soporta la cuantización de la capa de embeddings en modelos BERT. Como resultado, el tamaño final del checkpoint es de 225 MiB, idéntico al que se obtendría cargando el modelo original en bf16, ya que el 82% de los parámetros (96M) corresponden a la matriz de embeddings de vocabulario, que no se ve afectada por la cuantización.

## Capacidades

- Re-ranking de pasajes para recuperación de información, puntuando pares consulta-documento.
- Soporte bilingüe inglés-alemán, tanto para consultas en un idioma y pasajes en el otro como para ambos en el mismo idioma.
- Clasificación de pares de textos (text classification) mediante la puntuación de relevancia.
- Integración con pipelines de retrieve & re-rank, como los propuestos por SBERT.net.
- Servicio eficiente mediante vLLM con el runner de pooling, que permite agrupar múltiples pares en una sola petición.
- No es un modelo generativo: no produce texto, solo puntuaciones de relevancia.

## Casos de uso

- Re-ranking en motores de búsqueda empresarial: dado un conjunto de resultados iniciales obtenidos con un bi-encoder o BM25, el modelo reordena los pasajes según su relevancia real para la consulta, mejorando la precisión de los resultados finales.
- Búsqueda multilingüe EN-DE: permite recuperar documentos en alemán a partir de consultas en inglés y viceversa, útil en entornos corporativos con documentación bilingüe.
- Sistemas de preguntas y respuestas: como etapa de re-ranking tras una primera recuperación, selecciona los pasajes más relevantes para alimentar a un modelo generativo de respuestas.
- Moderación de contenidos: puntuación de pares de textos para detectar similitud semántica o relevancia en tareas de filtrado.
- Análisis de sentimiento o clasificación de pares: aunque no es su uso principal, la puntuación de relevancia puede adaptarse a tareas de clasificación binaria de pares de textos.
- Evaluación de calidad de traducciones: al ser un modelo bilingüe, puede puntuar la correspondencia semántica entre un texto original y su traducción.

## Benchmarks y rendimiento

La model card del autor incluye mediciones realizadas en NVIDIA H100 80 GB con vLLM 0.26.0. Los resultados de re-ranking se evaluaron con SciFact (300 consultas sobre 5183 documentos, nDCG@10), STS-B de (mteb/stsb_multi_mt, 1379 pares) y STS17 en-de (mteb/sts17-crosslingual-sts, 250 pares). El throughput se midió sobre 4096 textos multilingües a través del endpoint OpenAI de vLLM.

| Variante | Tamano | Rerank nDCG@10 | MRR@10 | Pairs/s (bs=256) |
|---|---|---|---|---|
| fp32 source | 449 MiB | 0.9474 | 0.9323 | 3775 |
| FP8 | 225 MiB | 0.9471 | 0.9321 | 3859 |
| NVFP4 | 217 MiB | 0.9516 | 0.9390 | – |

La calidad de re-ranking se conserva prácticamente intacta en FP8, con una pérdida de 0,0003 en nDCG@10 y 0,0002 en MRR@10. El throughput mejora ligeramente (3859 frente a 3775 pares/s). No se han publicado resultados comparativos con otros modelos de re-ranking en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint FP8 ocupa 225 MiB, por lo que la memoria necesaria para cargar los pesos es inferior a 0,5 GB. Con overhead de activaciones y buffers, el modelo puede ejecutarse en cualquier GPU con al menos 2 GB de VRAM.
- GPU recomendadas: cualquier GPU consumer moderna (NVIDIA GTX 10xx en adelante, RTX series) es suficiente. Las mediciones del autor se realizaron en H100, pero no es un requisito.
- Cabe en GPUs consumer: sí, incluso en GPUs integradas o de gama baja.
- Opciones de despliegue: vLLM (comando `vllm serve mbehr90/msmarco-MiniLM-L12-en-de-v1-fp8 --runner pooling`), también puede cargarse con Transformers y SentenceTransformers si se convierte el formato.
- Latencia y throughput: en H100 con batch size 256, se alcanzan 3859 pares/s. En GPUs consumer, el throughput será menor pero suficiente para aplicaciones de re-ranking a escala moderada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Uso |
|---|---|---|---|---|---|
| mbehr90/msmarco-MiniLM-L12-en-de-v1-fp8 | 117,7M | no disponible | FP8 | MIT | Re-ranking EN-DE |
| cross-encoder/msmarco-MiniLM-L12-en-de-v1 (base) | 117,7M | no disponible | fp32 | Apache-2.0 | Re-ranking EN-DE |
| cross-encoder/ms-marco-MiniLM-L-6-v2 | 22,7M | 512 | fp32 | Apache-2.0 | Re-ranking EN (monolingue) |

El modelo FP8 es funcionalmente idéntico al base, con la ventaja de un checkpoint más pequeño y una integración directa con vLLM. Frente a alternativas monolingües como ms-marco-MiniLM-L-6-v2, ofrece la ventaja del bilingüismo EN-DE a costa de un mayor número de parámetros. No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- La cuantización FP8 no reduce el tamaño frente a una versión bf16 del modelo original, ya que el 82% de los parámetros (embeddings de vocabulario) no se cuantizan. Si el objetivo es ahorrar memoria, cargar el modelo base en bf16 ofrece el mismo resultado.
- La cuantización de los embeddings no es posible con vLLM 0.26.0, lo que impide alcanzar un tamaño teórico de 81 MiB.
- El modelo es un cross-encoder, no un modelo generativo: no puede generar texto ni mantener conversaciones.
- La longitud de contexto no está documentada; se asume la típica de MiniLM-L12 (512 tokens), pero no se ha verificado.
- El modelo está entrenado específicamente para re-ranking de pasajes; su uso en otras tareas de clasificación puede degradar el rendimiento.
- No se han publicado evaluaciones de sesgos o alucinaciones, aunque al ser un modelo de puntuación, el riesgo de alucinación es bajo.
- La licencia MIT permite uso comercial sin restricciones, pero el modelo base original está bajo Apache-2.0; se debe verificar la compatibilidad de licencias si se redistribuye.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mbehr90/msmarco-MiniLM-L12-en-de-v1-fp8
- Modelo base: https://huggingface.co/cross-encoder/msmarco-MiniLM-L12-en-de-v1
- Repositorio de llm-compressor: https://github.com/vllm-project/llm-compressor
- Documentación de vLLM: https://docs.vllm.ai/
