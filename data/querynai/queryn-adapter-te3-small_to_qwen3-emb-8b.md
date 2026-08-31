# QuerynAi/queryn-adapter-te3-small_to_qwen3-emb-8b

## Resumen

El modelo `QuerynAi/queryn-adapter-te3-small_to_qwen3-emb-8b` es un adaptador de embeddings que proyecta vectores generados por el modelo `te3-small` (de 1536 dimensiones) al espacio de representación de `qwen3-emb-8b` (de 4096 dimensiones). Esto permite que un corpus ya indexado con `te3-small` pueda ser consultado contra un índice construido con `qwen3-emb-8b` sin necesidad de re-embedding del corpus completo. Forma parte del motor de traducción de embeddings de Queryn, una colección de adaptadores que conectan diferentes espacios de representación.

El adaptador es una proyección lineal simple (una capa densa sin activación) con aproximadamente 6,3 millones de parámetros, exportado a formato ONNX (opset 17). Su entrada es un tensor float32 de forma `[batch, 1536]` y su salida un tensor float32 de forma `[batch, 4096]`, normalizado L2. Se distribuye bajo licencia MIT, lo que permite uso comercial sin restricciones significativas. La relevancia de este modelo radica en su capacidad para migrar infraestructuras de búsqueda semántica entre modelos de embeddings sin reprocesar los datos, un problema habitual en entornos de producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Proyección lineal (capa densa sin activación) |
| Parametros totales | ~6,3 millones |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no aplica (modelo de embedding, no generativo) |
| Tipos de cuantizacion | no disponible (solo float32 en ONNX) |
| Idiomas soportados | no disponible (depende del modelo fuente y destino) |
| Licencia | MIT |
| Formato de pesos | ONNX (opset 17) |

## Arquitectura y entrenamiento

El modelo es una proyección lineal que mapea un embedding de 1536 dimensiones (de `te3-small`) a uno de 4096 dimensiones (espacio de `qwen3-emb-8b`). El grafo ONNX normaliza internamente la entrada con L2 antes de la proyección, y la salida también se normaliza L2, garantizando vectores unitarios compatibles con el espacio destino. La arquitectura se seleccionó tras una ablación: la proyección lineal obtuvo una similitud coseno en test de 0,8121, frente a 0,8093 de una variante profunda (MLP). Se publicó la variante lineal por ser la de mejor puntuación.

El entrenamiento se realizó sobre pares de embeddings generados a partir de un corpus multilingüe y multidominio de aproximadamente 350.000 filas, que incluye resúmenes de arXiv, jurisprudencia australiana, pasajes de SQuAD, resúmenes de PubMed y noticias de criptomonedas/mercados. La función de pérdida fue `1 - similitud coseno media`, con optimizador Adam y reducción de tasa de aprendizaje por meseta (`ReduceLROnPlateau`). Se guardó el checkpoint de la mejor época (época 15). Para cada par de modelos, se entrenaron tanto la línea base lineal como el MLP, publicándose el de mayor puntuación (en caso de empate, se prefiere el lineal).

## Capacidades

- Traducción de embeddings: convierte vectores de `te3-small` (1536-d) al espacio de `qwen3-emb-8b` (4096-d) mediante una proyección lineal.
- Normalización automática: la entrada se normaliza L2 dentro del grafo, por lo que no se requiere pre-normalización externa.
- Salida lista para indexación: los vectores de salida son unitarios y directamente utilizables en índices de similitud coseno.
- Inferencia en CPU: el modelo ONNX puede ejecutarse con `onnxruntime` en CPU sin necesidad de GPU.
- Batch dinámico: la dimensión de batch es dinámica, permitiendo procesar lotes de cualquier tamaño.

## Casos de uso

- Migración de índices de búsqueda semántica: si una organización tiene un corpus indexado con `te3-small` y desea pasar a `qwen3-emb-8b` sin re-embedding, puede aplicar este adaptador a los vectores almacenados y reconstruir el índice destino.
- A/B testing de modelos de embeddings: permite comparar la calidad de recuperación entre `te3-small` y `qwen3-emb-8b` sobre el mismo corpus, manteniendo una única representación y traduciendo solo las consultas.
- Reducción de costes de re-embedding: en entornos con millones de documentos, re-embedding completo puede ser costoso en tiempo y cómputo; el adaptador ofrece una alternativa de proyección barata (6,3M parámetros).
- Sistemas RAG híbridos: si un pipeline de retrieval usa `te3-small` para documentos y `qwen3-emb-8b` para consultas, el adaptador unifica los espacios y evita duplicar índices.
- Actualización incremental de índices: cuando se añaden nuevos documentos, se pueden embedir con `qwen3-emb-8b` y traducir los antiguos, manteniendo coherencia sin reprocesar todo el corpus.
- Evaluación de calidad de proyección: sirve como herramienta de análisis para medir la similitud coseno entre espacios de embeddings y decidir si la migración es viable (el valor 0,8121 en test es un indicador de fidelidad).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única métrica reportada es la similitud coseno media en el conjunto de test (0,8121 en la época 15), que mide la fidelidad de la proyección, no el rendimiento en tareas de recuperación. No se dispone de comparaciones con otros adaptadores ni de métricas como recall@k o NDCG.

## Requisitos de hardware

- VRAM estimada para inferencia: negligible (el modelo tiene ~6,3M parámetros, ocupa ~25 MB en float32). Puede ejecutarse en CPU con memoria RAM estándar.
- GPU recomendadas: no se requiere GPU; cualquier CPU moderna es suficiente.
- Compatibilidad con hardware de consumo: sí, funciona en cualquier sistema con Python y `onnxruntime`.
- Opciones de despliegue: `onnxruntime` (CPU o GPU), puede integrarse en servicios con FastAPI, o usarse en pipelines de procesamiento por lotes.
- Latencia y throughput: no se han publicado mediciones oficiales. Dado el tamaño del modelo, la inferencia de un batch de 4 vectores debería completarse en milisegundos en CPU.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (adaptadores de embeddings entre espacios). Queryn publica una colección de adaptadores similares (por ejemplo, `ada-002` → `qwen3-emb-8b`), pero no se han encontrado datos de rendimiento comparativos entre ellos. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Es un adaptador específico: solo traduce embeddings de `te3-small` a `qwen3-emb-8b`. No es un modelo general de embeddings ni un LLM.
- Fidelidad limitada: la similitud coseno en test es 0,8121, lo que implica una pérdida de información en la proyección. Para casos de uso críticos, se recomienda evaluar la degradación en tareas de recuperación reales.
- Dependencia de los modelos fuente y destino: la calidad de la traducción depende de la calidad de los embeddings de entrada. Si `te3-small` o `qwen3-emb-8b` cambian de versión, el adaptador puede quedar obsoleto.
- Dominios de entrenamiento: el corpus de entrenamiento incluye ciencia, derecho, medicina, QA y finanzas. El rendimiento en dominios muy diferentes (por ejemplo, código fuente o contenido multimedia) no está validado.
- Sin soporte de cuantización: el modelo se distribuye solo en float32 ONNX. No hay versiones cuantizadas disponibles.
- Sin garantía de compatibilidad con versiones futuras de `qwen3-emb-8b`: si el modelo destino se actualiza, el espacio de embeddings podría cambiar y el adaptador dejaría de ser válido.
- Riesgo de alucinación: no aplica, ya que no es un modelo generativo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/QuerynAi/queryn-adapter-te3-small_to_qwen3-emb-8b
- Colección de adaptadores de Queryn: https://huggingface.co/collections/QuerynAi/queryn-embedding-adapters-6a9499470ee93453d02110b4
- Modelo destino `qwen3-emb-8b` (referencia): https://huggingface.co/Qwen/Qwen3-8B
- Informe técnico de Qwen3: https://arxiv.org/html/2505.09388v1
- Repositorio GitHub de Qwen3: https://github.com/QwenLM/Qwen3
