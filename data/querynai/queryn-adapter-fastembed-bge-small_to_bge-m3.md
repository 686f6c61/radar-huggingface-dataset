# QuerynAi/queryn-adapter-fastembed-bge-small_to_bge-m3

## Resumen

Queryn adapter — `fastembed-bge-small` → `bge-m3` es un modelo de traducción de embeddings desarrollado por QuerynAi, parte de su motor de traducción de embeddings. Su función es transformar un vector de 384 dimensiones generado por el modelo `fastembed-bge-small` en un vector de 1024 dimensiones perteneciente al espacio de representaciones de `bge-m3`. Esto permite que un corpus ya indexado con `fastembed-bge-small` pueda ser servido contra un índice construido con `bge-m3` sin necesidad de re-embedding de todo el corpus, un ahorro significativo de cómputo y tiempo en entornos de producción.

El modelo es una red neuronal feedforward con una capa oculta y activación GELU, con aproximadamente 271.6K parámetros, exportada a formato ONNX (opset 17). Se entrenó sobre pares de embeddings generados a partir de un corpus multi-dominio de unas 350K filas que abarca resúmenes de arXiv, jurisprudencia australiana, pasajes de SQuAD, resúmenes de PubMed y noticias de criptomonedas y mercados. La métrica de calidad reportada es la similitud coseno media entre el embedding traducido y el embedding objetivo real, alcanzando un valor de 0.7936 en el conjunto de test en la época 15.

La relevancia de este modelo radica en su utilidad práctica para equipos que ya tienen desplegados sistemas de búsqueda semántica o RAG con `fastembed-bge-small` y desean migrar a `bge-m3` sin re-procesar todo su corpus. Al ser un adaptador ligero y de código abierto (licencia MIT), se puede integrar fácilmente en pipelines existentes mediante ONNX Runtime.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP feedforward con 1 capa oculta, activación GELU y latente comprimido |
| Parametros totales | ~271.6K |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de traducción de embeddings, no procesa texto) |
| Tipos de cuantizacion | no disponible (formato ONNX float32) |
| Idiomas soportados | no disponible (depende de los modelos fuente y destino) |
| Licencia | MIT |
| Formato de pesos | ONNX (opset 17) |

## Arquitectura y entrenamiento

El modelo es un perceptrón multicapa (MLP) con una única capa oculta de tamaño no especificado, activación GELU y una representación latente comprimida. La entrada es un tensor float32 de forma `[batch, 384]` correspondiente a embeddings crudos de `fastembed-bge-small`; el grafo ONNX normaliza L2 internamente, por lo que no se requiere pre-normalización. La salida es un tensor float32 de forma `[batch, 1024]`, normalizado a norma unitaria, en el espacio de `bge-m3`.

El entrenamiento se realizó sobre pares de embeddings generados con los dos modelos a partir de un corpus unificado multi-dominio de aproximadamente 350K filas, incluyendo resúmenes de arXiv, jurisprudencia australiana, pasajes de SQuAD, resúmenes de PubMed y noticias de criptomonedas y mercados. La función de pérdida fue `1 - mean cosine similarity`, optimizada con Adam y reducción de tasa de aprendizaje por meseta (`ReduceLROnPlateau`). Se comparó una arquitectura lineal (similitud coseno en test de 0.7913) con la MLP profunda (0.7936), seleccionándose esta última por su mejor rendimiento. El checkpoint se guardó en la mejor época (época 15).

## Capacidades

- Traducción de embeddings de 384 dimensiones (`fastembed-bge-small`) a 1024 dimensiones (`bge-m3`).
- Normalización L2 automática de la entrada y salida, garantizando vectores unitarios en el espacio destino.
- Soporte de batch dinámico en el eje de lote, permitiendo procesar múltiples vectores en una sola llamada.
- Inferencia en CPU mediante ONNX Runtime, sin necesidad de GPU.
- Integración sencilla en pipelines Python existentes mediante `onnxruntime` y `huggingface_hub`.
- No es un modelo de generación de texto ni de razonamiento; su única función es la transformación de representaciones vectoriales.

## Casos de uso

- Migración de índices de búsqueda semántica: un sistema que ya tiene millones de documentos embebidos con `fastembed-bge-small` puede traducir esos embeddings al espacio de `bge-m3` y reutilizar el índice existente, evitando re-embedding completo. Esto reduce drásticamente el coste computacional y el tiempo de migración.
- Actualización incremental de corpus: cuando se añaden nuevos documentos a un corpus ya indexado con `bge-m3`, se pueden generar sus embeddings con `fastembed-bge-small` y traducirlos con este adaptador, manteniendo consistencia con el índice sin cambiar el pipeline de generación.
- Evaluación comparativa de modelos de embedding: permite comparar la calidad de recuperación de `bge-m3` frente a `fastembed-bge-small` sobre el mismo corpus, usando el adaptador para alinear los espacios y medir métricas como recall@k o MRR.
- Sistemas RAG híbridos: en arquitecturas donde parte del corpus está embebida con un modelo y otra parte con otro, el adaptador unifica las representaciones para que un único índice pueda consultarse de forma coherente.
- Pruebas A/B de modelos de embedding: un equipo puede probar `bge-m3` en producción sin re-embedding, traduciendo los embeddings existentes y evaluando si la calidad de búsqueda mejora antes de comprometerse a una migración completa.
- Despliegue en entornos con restricciones de recursos: al ser un modelo ONNX de solo 271.6K parámetros, puede ejecutarse en CPU en instancias pequeñas o incluso en dispositivos edge, facilitando la traducción de embeddings en tiempo real sin hardware especializado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ya que este modelo no es un LLM sino un adaptador de embeddings. La única métrica reportada es la similitud coseno media en el conjunto de test, con un valor de **0.7936** para la arquitectura profunda seleccionada, frente a 0.7913 de la variante lineal. No se dispone de comparaciones con otros adaptadores similares.

## Requisitos de hardware

- VRAM estimada: no requiere GPU; inferencia en CPU con ONNX Runtime.
- GPU recomendada: ninguna, aunque puede ejecutarse en cualquier GPU si se desea acelerar, el modelo es demasiado pequeño para necesitarla.
- Compatibilidad con hardware de consumo: sí, cualquier CPU moderna con soporte para ONNX Runtime es suficiente.
- Opciones de despliegue: ONNX Runtime (CPU o GPU), puede integrarse en servicios Python, contenedores Docker o funciones serverless.
- Latencia y throughput: no se han publicado mediciones oficiales, pero dado el tamaño del modelo (~271.6K parámetros) y la operación matricial simple, la latencia por lote de 4 vectores es del orden de milisegundos en CPU.

## Comparativa con modelos similares

No se han encontrado modelos comparables directos en la información proporcionada. Existen otros adaptadores de embeddings en la colección de QuerynAi (por ejemplo, `queryn-adapter-bge-m3_to_fastembed-bge-small`), pero no se dispone de datos de rendimiento de terceros para establecer una comparativa objetiva. La alternativa práctica sería re-embedding con `bge-m3` directamente, que ofrece una calidad superior (similitud coseno 1.0) pero a un coste computacional mucho mayor.

## Limitaciones y advertencias

- El modelo solo acepta embeddings de `fastembed-bge-small` como entrada; no funciona con otros modelos de embedding.
- La calidad de la traducción está limitada por la similitud coseno máxima de 0.7936, lo que implica una pérdida de fidelidad en la representación. Para casos de uso donde la precisión de recuperación es crítica, se recomienda re-embedding con `bge-m3`.
- No es un modelo de lenguaje: no genera texto, no razona y no procesa lenguaje natural directamente.
- El entrenamiento se realizó sobre dominios específicos (ciencia, legal, QA, medicina, finanzas); el rendimiento en otros dominios puede ser inferior.
- No se han publicado evaluaciones de sesgo o robustez; al ser un modelo de transformación lineal, los sesgos de los modelos fuente y destino pueden propagarse.
- La licencia MIT permite uso comercial sin restricciones, pero el modelo se distribuye sin garantías.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es un modelo reciente o poco probado en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/QuerynAi/queryn-adapter-fastembed-bge-small_to_bge-m3
- Colección de adaptadores de QuerynAi: https://huggingface.co/collections/QuerynAi/queryn-embedding-adapters-6a9499470ee93453d02110b4
- Adaptador inverso (bge-m3 → fastembed-bge-small): https://huggingface.co/QuerynAi/queryn-adapter-bge-m3_to_fastembed-bge-small
- Documentación de BGE-M3: https://bge-model.com/bge/bge_m3.html
- Repositorio de fastembed (qdrant): https://github.com/qdrant/fastembed
