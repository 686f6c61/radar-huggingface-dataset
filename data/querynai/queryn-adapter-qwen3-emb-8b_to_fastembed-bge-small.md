# QuerynAi/queryn-adapter-qwen3-emb-8b_to_fastembed-bge-small

## Resumen

El modelo `queryn-adapter-qwen3-emb-8b_to_fastembed-bge-small` es un adaptador de embeddings desarrollado por QuerynAi que traduce representaciones vectoriales generadas por el modelo de embeddings `qwen3-emb-8b` (de 4096 dimensiones) al espacio vectorial de `fastembed-bge-small` (de 384 dimensiones). Su propósito es permitir que un corpus ya indexado con `qwen3-emb-8b` pueda ser consultado contra un índice construido con `fastembed-bge-small` sin necesidad de re-embedding, lo que ahorra tiempo y coste computacional en migraciones o integraciones de sistemas de búsqueda.

Se trata de una proyección lineal simple (arquitectura `linear`) con aproximadamente 1,6 millones de parámetros, exportada a formato ONNX (opset 17). El modelo recibe como entrada un tensor `float32` de forma `[batch, 4096]` y devuelve un tensor `float32` de forma `[batch, 384]` normalizado L2, listo para ser usado en el espacio de `fastembed-bge-small`. La licencia es MIT, lo que permite uso comercial sin restricciones significativas.

La relevancia de este adaptador radica en que resuelve un problema práctico de interoperabilidad entre sistemas de embeddings de diferentes dimensiones y espacios semánticos, evitando la costosa operación de re-embedding de grandes colecciones. Forma parte de un conjunto más amplio de adaptadores de traducción de embeddings publicados por QuerynAi.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Proyección lineal (linear) |
| Parametros totales | ~1,6 millones |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (no es un modelo de lenguaje; opera sobre embeddings fijos) |
| Tipos de cuantizacion | No disponible (formato ONNX float32) |
| Idiomas soportados | No disponible (depende de los modelos fuente y destino) |
| Licencia | MIT |
| Formato de pesos | ONNX (model.onnx) |

## Arquitectura y entrenamiento

El adaptador implementa una proyección lineal simple: una capa fully-connected que transforma un vector de 4096 dimensiones en uno de 384. La entrada se normaliza L2 internamente en el grafo, por lo que no se requiere pre-normalización. La salida también se normaliza L2 para garantizar vectores unitarios en el espacio de `fastembed-bge-small`.

El entrenamiento se realizó sobre pares de embeddings generados a partir de un corpus multi-dominio unificado que incluye resúmenes de arXiv, jurisprudencia australiana, pasajes de SQuAD, resúmenes de PubMed y noticias de criptomonedas y mercados, con aproximadamente 350.000 filas. La función de pérdida fue `1 - mean cosine similarity`, optimizada con Adam y reducción de tasa de aprendizaje mediante `ReduceLROnPlateau`. Se entrenaron dos arquitecturas (lineal y MLP profundo) para cada par de modelos, publicándose la que obtuviera mayor similitud coseno en el conjunto de test; en este caso, la lineal alcanzó 0,9326 frente a 0,9133 de la profunda.

## Capacidades

- Traducción de embeddings: convierte vectores de 4096 dimensiones (espacio de `qwen3-emb-8b`) a vectores de 384 dimensiones (espacio de `fastembed-bge-small`).
- Normalización L2 automática tanto en la entrada como en la salida, garantizando vectores unitarios.
- Soporte de batch dinámico: la dimensión del batch es dinámica, permitiendo procesar múltiples embeddings a la vez.
- Formato ONNX: compatible con `onnxruntime` y otros motores de inferencia ONNX, ejecutable en CPU o GPU.
- Integración sencilla: el modelo se descarga desde Hugging Face Hub y se usa con una API mínima de Python.

## Casos de uso

- Migración de índices de búsqueda: si una organización tiene un corpus embebido con `qwen3-emb-8b` y desea cambiar a un sistema que use `fastembed-bge-small` (por ejemplo, por requisitos de latencia o coste), este adaptador permite transformar los embeddings existentes sin re-embedding, ahorrando tiempo y recursos.
- Integración de sistemas heterogéneos: en arquitecturas donde diferentes servicios usan distintos modelos de embeddings, el adaptador actúa como puente para unificar espacios vectoriales sin reprocesar los datos.
- Reducción de dimensionalidad: al pasar de 4096 a 384 dimensiones, se reduce el espacio de almacenamiento y el coste de cálculo en la búsqueda de similitud, útil para grandes colecciones.
- Prototipado rápido: permite probar un índice basado en `fastembed-bge-small` con datos ya embebidos por `qwen3-emb-8b` antes de decidir una migración completa.
- RAG (Retrieval-Augmented Generation): en pipelines de generación aumentada por recuperación, se puede combinar un corpus embebido con un modelo grande y un índice ligero para consultas de baja latencia.
- Evaluación comparativa: facilita comparar el rendimiento de recuperación entre dos espacios de embeddings sobre el mismo corpus, sin necesidad de re-embedding.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La única métrica reportada es la similitud coseno media en el conjunto de test, que alcanzó **0,9326** (epoch 15) para la arquitectura lineal. No hay datos de rendimiento en tareas como recuperación de información, clasificación o búsqueda semántica.

## Requisitos de hardware

- Al ser un modelo de solo ~1,6 millones de parámetros, puede ejecutarse en CPU sin problemas. El ejemplo de uso proporcionado emplea `CPUExecutionProvider` de `onnxruntime`.
- No requiere GPU para inferencia; en caso de usarse, cualquier GPU moderna (incluso integradas) sería suficiente.
- El consumo de memoria es mínimo: el modelo ONNX ocupa unos pocos megabytes (el tamaño del repo es 0.0 GB, indicando que el archivo es muy pequeño).
- Opciones de despliegue: `onnxruntime` (CPU o GPU), o cualquier runtime compatible con ONNX (TensorRT, OpenVINO, etc.). También puede integrarse en servicios como FastAPI o en pipelines de procesamiento por lotes.
- La latencia por lote es despreciable (proyección lineal de 4096 a 384), del orden de microsegundos por vector en CPU moderna.

## Comparativa con modelos similares

No se dispone de información sobre adaptadores de traducción de embeddings comparables en el mismo repositorio o en la literatura consultada. La alternativa directa sería re-embedding del corpus con `fastembed-bge-small`, que tiene un coste computacional proporcional al tamaño del corpus. Otra opción sería usar un modelo de embeddings multilingüe unificado que ya soporte ambos espacios, pero no se ha encontrado evidencia de ello. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El adaptador solo acepta como entrada embeddings generados por `qwen3-emb-8b`; no funciona con otros modelos de embeddings.
- La calidad de la traducción depende de la similitud coseno alcanzada (0,9326), lo que implica una posible pérdida de información semántica al reducir la dimensionalidad de 4096 a 384.
- No es un modelo de generación de texto ni de razonamiento; su única función es la transformación de vectores.
- El entrenamiento se realizó sobre un corpus específico (arXiv, jurisprudencia, SQuAD, PubMed, noticias financieras); el rendimiento en dominios muy diferentes podría degradarse.
- No se han publicado evaluaciones en tareas downstream (recuperación, clasificación), por lo que el impacto real en aplicaciones concretas no está cuantificado.
- La licencia MIT permite uso comercial, pero el modelo depende de los modelos fuente y destino, cuyas licencias deben verificarse por separado (Qwen3-Embedding-8B y fastembed-bge-small).

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/QuerynAi/queryn-adapter-qwen3-emb-8b_to_fastembed-bge-small)
- [Colección de adaptadores de Queryn](https://huggingface.co/collections/QuerynAi/queryn-embedding-adapters-6a9499470ee93453d02110b4)
- [Qwen3-Embedding-8B (modelo fuente)](https://huggingface.co/Qwen/Qwen3-Embedding-8B)
- [Qwen3-8B (modelo de lenguaje relacionado)](https://huggingface.co/Qwen/Qwen3-8B)
