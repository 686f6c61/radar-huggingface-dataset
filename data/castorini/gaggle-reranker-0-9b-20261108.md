# castorini/gaggle-reranker-0.9b-20261108

## Resumen

gaggle-reranker-0.9b-20261108 es un reranker pointwise de tipo decoder-only desarrollado por el grupo Castorini (University of Waterloo), miembro de la familia Gaggle de rerankers. El modelo parte de un backbone nanochat preentrenado desde cero sobre el corpus ClimbMix y se afina para puntuar pares (query, pasaje) de forma independiente, reordenando los candidatos devueltos por un retriever de primera etapa como BM25. Con 0,85B parámetros, su propuesta de valor es clara: ofrece una calidad cercana al reranker Gaggle de 3,2B con una cuarta parte de los parámetros.

La relevancia actual del modelo radica en su cadena de entrenamiento completamente abierta: el corpus de preentrenamiento, la receta y los datos de ajuste fino de relevancia (RLHN-250K) son públicos, sin depender de ningún backbone de terceros con pesos abiertos. Esto lo convierte en un caso de estudio reproducible para investigación en recuperación de información y en una opción práctica para pipelines de búsqueda con restricciones de cómputo.

Arquitectónicamente es un transformer causal de 32 capas, anchura 1.152, 9 cabezas de dimensión 128 y contexto de 2.048 tokens, con embeddings de valor en cada cuarta capa. La puntuación se obtiene de dos filas del LM head preentrenado, sin cabeza de clasificación añadida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (nanochat): 32 capas, anchura 1.152, 9 cabezas de dimension 128, atencion causal, value embeddings cada 4 capas |
| Parametros totales | 849.349.818 (0,85B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2.048 tokens (entrenado con truncamiento 128 query / 512 pasaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria nanochat, custom_code) |

## Arquitectura y entrenamiento

El modelo es un transformer causal decoder-only con 32 capas, anchura 1.152, 9 cabezas de atención de dimensión 128 y embeddings de valor en cada cuarta capa. La puntuación de relevancia se calcula como `s(q, d) = logit(" true") − logit(" false")` en el último token del prompt, leyendo únicamente dos filas del LM head preentrenado (2 × 1.152 = 2.304 parámetros). No se añade cabeza de clasificación; el resto de filas del LM head se descarta, lo que reduce el modelo de 0,89B a 0,85B. El prompt utilizado es `<|bos|>Query: {query}\nPassage: {passage}\nRelevant:` y el tokenizador es un BPE byte-level de 32.768 entradas compartido con los modelos Gaggle de 3,3B.

El entrenamiento parte del checkpoint preentrenado causal en el paso 229.067 (final de una pasada de 287B tokens sobre ClimbMix) y se afina sobre RLHN-250K, un subconjunto curado de 247.534 instancias de siete colecciones de recuperación del mixture de BGE, donde una cascada de LLM reetiqueta falsos negativos como positivos. El objetivo es localized contrastive estimation (LCE): un softmax sobre un positivo y K negativos duros muestreados por query, con temperatura τ = 1 y K ∈ {7, 15, 23} elegido por instancia según el pool disponible. Sin destilación, sin datos sintéticos y sin profesor. La optimización es una época con AdamW (β = 0,9/0,95, weight decay 0,01), learning rate pico de 5 × 10⁻⁵ con 150 pasos de warm-up y decaimiento coseno, clipping de gradiente en norma global 12, batch efectivo de 128 grupos de query por actualización y 1.928 actualizaciones en una NVIDIA H200, con pesos y estado del optimizador en FP32 y matmuls en TF32. Es una única ejecución, no un model soup.

## Capacidades

- Puntuación de relevancia pointwise de pares (query, pasaje) para reranking en recuperación de información.
- Reordenación de candidatos devueltos por un retriever de primera etapa (evaluado con top-100 de BM25 vía Pyserini).
- Manejo de consultas y pasajes en inglés con truncamiento de entrenamiento de 128 tokens de query y 512 de pasaje, ampliable hasta el límite de contexto del backbone de 2.048 tokens en inferencia.
- Integración con la API de `sentence-transformers` y con `transformers` mediante `AutoModelForSequenceClassification` con `trust_remote_code=True`.
- Método `rerank` que devuelve pares (puntuación, pasaje) ordenados.
- Capacidad multilingüe: no disponible (solo inglés).
- Tool calling, function calling, agentes y modo thinking: no disponible (el modelo está especializado exclusivamente en ranking).

## Casos de uso

- Reranking en motores de búsqueda: tras una recuperación inicial con BM25 o un retriever denso, el modelo reordena el top-100 de candidatos y mejora el nDCG@10 de forma sustancial (de 0,393 a 0,632 de media en TREC DL), con un coste de cómputo contenido por su tamaño de 0,85B.
- Búsqueda en documentación técnica y bases de conocimiento internas: el prompt estructurado Query/Passage permite puntuar fragmentos de documentación frente a consultas de usuarios y filtrar los irrelevantes antes de pasarlos a un LLM generador en un pipeline RAG.
- Atención al cliente con base de conocimiento: el modelo puntúa artículos de ayuda frente a la consulta del usuario para seleccionar los más relevantes antes de la respuesta generada, reduciendo el contexto irrelevante enviado al modelo generativo.
- Búsqueda científica y académica: los resultados en SciFact (0,773) y en colecciones biomédicas como TREC-COVID (0,852) lo hacen adecuado para reordenar resultados en buscadores de literatura científica en inglés.
- Evaluación y experimentación en investigación de IR: al ser un modelo completamente reproducible (corpus, receta y datos públicos, licencia MIT), sirve como baseline para estudiar recetas de reranking con backbones pequeños.
- Despliegue en entornos con GPU modesta: con 0,85B parámetros y FP16/BF16, el modelo cabe en GPUs de consumo y permite reranking de baja latencia en servicios con presupuesto de VRAM limitado, donde un reranker de 3B o superior no sería viable.
- Filtrado de candidatos en pipelines de recomendación de contenido textual: puntuar pares consulta-documento para descartar resultados de baja relevancia antes de etapas posteriores más costosas.

## Benchmarks y rendimiento

nDCG@10 reordenando el top-100 de candidatos BM25 recuperados con Pyserini, truncamiento 128/512, evaluado con `trec_eval`.

| Benchmark | BM25 (primera etapa) | Este modelo (0,85B) | gaggle-reranker-20261005 (3,2B) |
|---|---:|---:|---:|
| DL19 | 0,506 | 0,759 | 0,757 |
| DL20 | 0,480 | 0,714 | 0,723 |
| DL21 | 0,446 | 0,710 | 0,714 |
| DL22 | 0,269 | 0,525 | 0,533 |
| DL23 | 0,263 | 0,450 | 0,480 |
| **Media TREC DL** | 0,393 | **0,632** | 0,641 |

| Benchmark BEIR | BM25 (primera etapa) | Este modelo (0,85B) | gaggle-reranker-20261005 (3,2B) |
|---|---:|---:|---:|
| COVID | 0,595 | 0,852 | 0,859 |
| News | 0,395 | 0,499 | 0,515 |
| Robust04 | 0,407 | 0,563 | 0,592 |
| NFCorpus | 0,322 | 0,378 | 0,380 |
| SciFact | 0,679 | 0,773 | 0,790 |
| SCIDOCS | 0,149 | 0,227 | 0,236 |
| FiQA | 0,236 | 0,440 | 0,455 |
| **Media BEIR** | 0,398 | **0,533** | 0,547 |

Frente a las ejecuciones individuales de la misma receta sobre el backbone de 3,3B (media de cuatro: 0,640 en TREC DL y 0,544 en BEIR), este modelo queda 0,008 por debajo en TREC DL y 0,011 en BEIR. La mayor parte de la brecha en TREC DL se concentra en DL23 y la mayor brecha en BEIR en Robust04. Cuatro ejecuciones de esta receta sobre el backbone de 3,3B varían aproximadamente 0,003 en cada media de benchmark. Cuatro de las siete colecciones BEIR (TREC-COVID, TREC-News, Robust04 y NFCorpus) están fuera de dominio respecto a RLHN-250K; FiQA y SCIDOCS tienen datos de entrenamiento hermanos en el conjunto.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,7 GB en BF16/FP16 (0,85B parámetros) más overhead de activaciones; en cuantización de 8 bits o 4 bits, el peso se reduce a menos de 1 GB, aunque no se documentan cuantizaciones oficiales.
- GPU recomendadas: NVIDIA H200 (usada en entrenamiento), L40S (usada en el ejemplo de la model card), A100 y H100 para despliegues de alto throughput.
- Cabe en GPU de consumo: sí, por tamaño, en tarjetas como RTX 4090, RTX 3090 o superiores; con cuantización, en GPUs de 8 GB o menos.
- Opciones de despliegue: `transformers` (>= 4.52) con `trust_remote_code=True` y `torch>=2.5`, integración con `sentence-transformers`, y despliegue por lotes con `model.rerank`. Soporte de vLLM, llama.cpp o TGI: no disponible (no documentado para este modelo).
- Latencia y throughput: no disponible; la model card solo muestra una ejecución de ejemplo en una NVIDIA L40S sin cifras de latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Media TREC DL (nDCG@10) | Media BEIR (nDCG@10) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| gaggle-reranker-0.9b-20261108 | 0,85B | 2.048 | 0,632 | 0,533 | MIT | Hugging Face |
| gaggle-reranker-20261005 | 3,2B | no disponible | 0,641 | 0,547 | no disponible | Hugging Face |
| Backbone Gaggle 3,3B, misma receta (media de 4 ejecuciones) | 3,3B | no disponible | 0,640 | 0,544 | no disponible | Hugging Face |

La comparativa se limita a los modelos de la propia familia Gaggle documentados en la model card; no se dispone de datos de benchmarks de otros rerankers comparables en la información proporcionada.

## Limitaciones y advertencias

- Solo soporta inglés; no se ha entrenado ni evaluado en otros idiomas.
- El contexto del backbone es de 2.048 tokens, y el entrenamiento usó truncamiento de 128 tokens de query y 512 de pasaje; pasajes más largos pueden degradar la puntuación.
- Riesgo de alucinación no aplica en el sentido generativo, pero el modelo puede asignar puntuaciones altas a pasajes léxicamente similares pero semánticamente irrelevantes, especialmente fuera del dominio de RLHN-250K.
- Cuatro de las siete colecciones BEIR evaluadas están fuera de dominio respecto a los datos de entrenamiento, lo que anticipa un rendimiento inferior en dominios no cubiertos.
- Es un modelo de una sola ejecución de entrenamiento, no un model soup; la varianza entre ejecuciones de la misma receta en el backbone de 3,3B es de aproximadamente 0,003 en las medias de benchmark.
- La licencia MIT permite uso comercial, pero el modelo depende de `trust_remote_code=True` para cargarse, lo que implica ejecutar código personalizado del repositorio; conviene auditar ese código antes de usarlo en producción.
- No se documentan cuantizaciones oficiales ni soporte para motores de inferencia de alto throughput como vLLM o TGI.
- El modelo requiere una etapa de recuperación previa (BM25 o densa); no es un retriever de primera etapa por sí mismo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/castorini/gaggle-reranker-0.9b-20261108
- Modelo base: https://huggingface.co/castorini/gaggle-nanochat-0.9b-pretrained-climbmix-20261105
- Reranker Gaggle de 3,2B: https://huggingface.co/castorini/gaggle-reranker-20261005
- Dataset RLHN-250K: https://huggingface.co/datasets/rlhn/rlhn-250K
- Pyserini: https://github.com/castorini/pyserini
- Paper (arXiv:2610.11922): no disponible como enlace directo en la información proporcionada
