# QuerynAi/queryn-adapter-pplx-embed-1_to_fastembed-bge-small

## Resumen

El modelo `QuerynAi/queryn-adapter-pplx-embed-1_to_fastembed-bge-small` es un adaptador de traducción de embeddings desarrollado por QuerynAi como parte de su motor de traducción de embeddings. Su función es transformar un vector de embedding generado por el modelo `pplx-embed-1` de Perplexity (de 1024 dimensiones) al espacio vectorial del modelo `fastembed-bge-small` (de 384 dimensiones). Esto permite que un corpus ya indexado con `pplx-embed-1` pueda ser consultado contra un índice construido con `fastembed-bge-small` sin necesidad de re-embedding de todos los documentos.

Se trata de una proyección lineal simple (arquitectura `linear`) con aproximadamente 393.6K parámetros, exportada a formato ONNX (opset 17). El adaptador fue entrenado sobre pares de embeddings de un corpus multi-dominio de unas 350.000 filas que abarca resúmenes de arXiv, jurisprudencia australiana, pasajes de SQuAD, resúmenes de PubMed y noticias de criptomonedas y mercados. La mejor similitud coseno en test alcanzada es de 0.9044 (epoch 15). Su relevancia radica en que facilita la migración entre sistemas de búsqueda vectorial sin coste de re-indexación, un problema común en entornos de producción con grandes volúmenes de datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Proyección lineal (linear) |
| Parametros totales | ~393.6K |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | ONNX (model.onnx) |

## Arquitectura y entrenamiento

El adaptador es una capa lineal simple que mapea un vector de entrada de 1024 dimensiones a uno de salida de 384 dimensiones. El grafo ONNX normaliza internamente el vector de entrada (L2-normalización) y produce un vector de salida unitario en el espacio de `fastembed-bge-small`. La dimensión de batch es dinámica, lo que permite procesar lotes de tamaño variable.

El entrenamiento se realizó sobre pares de embeddings generados por los dos modelos sobre un corpus unificado multi-dominio (~350.000 filas) que incluye resúmenes científicos (arXiv, PubMed), textos legales (jurisprudencia australiana), pasajes de preguntas y respuestas (SQuAD) y noticias financieras (cripto y mercados). La función de pérdida utilizada fue `1 - mean cosine similarity`, optimizada con Adam y reducción de tasa de aprendizaje mediante `ReduceLROnPlateau`. Se entrenaron tanto una baseline lineal como un MLP para cada par de modelos, publicándose el que obtuviera mejor puntuación en test (en este caso, la lineal con 0.9044 de similitud coseno frente a 0.8879 del MLP).

## Capacidades

- Traducción de embeddings entre dos espacios vectoriales concretos: de `pplx-embed-1` (1024-d) a `fastembed-bge-small` (384-d).
- Normalización L2 automática del vector de entrada, por lo que no requiere pre-normalización por parte del usuario.
- Salida unitaria en el espacio destino, lista para ser usada en índices vectoriales existentes.
- Soporte de batch dinámico en el grafo ONNX, permitiendo inferencia con lotes de cualquier tamaño.
- Ejecución en CPU mediante ONNX Runtime, sin dependencias adicionales más allá de `numpy` y `onnxruntime`.
- No genera texto ni realiza tareas de razonamiento; es exclusivamente un transformador de representaciones vectoriales.

## Casos de uso

- Migración de índices vectoriales: si una empresa tiene un corpus indexado con `pplx-embed-1` y desea cambiar a un sistema que use `fastembed-bge-small` (por ejemplo, por coste o latencia), puede aplicar este adaptador a los embeddings existentes y reutilizar el índice sin re-embedding de millones de documentos.
- Búsqueda híbrida multi-modelo: en arquitecturas donde diferentes partes del pipeline usan distintos modelos de embedding, este adaptador permite unificar las representaciones para comparar similitudes de forma coherente.
- A/B testing de modelos de embedding: al poder traducir embeddings de un modelo a otro, se pueden comparar resultados de búsqueda entre ambos sin duplicar la infraestructura de indexación.
- Reducción de dimensionalidad: al pasar de 1024 a 384 dimensiones, se reduce el espacio de almacenamiento y el coste computacional de las búsquedas vectoriales, manteniendo una similitud coseno de 0.9044 con el espacio original.
- Integración en pipelines de ingestión: en sistemas que ya generan embeddings con `pplx-embed-1`, se puede aplicar el adaptador como paso posterior para alimentar índices que esperan vectores de 384 dimensiones.
- Entornos con restricciones de hardware: al ser un modelo de solo 393K parámetros, puede ejecutarse en CPU en cualquier servidor, incluso en funciones serverless, sin necesidad de GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (como MMLU, HumanEval o MTEB) en la información disponible. La única métrica reportada es la similitud coseno en el conjunto de test durante el entrenamiento, que alcanzó un valor de **0.9044** con la arquitectura lineal (frente a 0.8879 con la arquitectura profunda). Esta métrica indica la fidelidad de la traducción entre los dos espacios de embedding, pero no es comparable con benchmarks de modelos de lenguaje.

## Requisitos de hardware

- Al ser un modelo de ~393K parámetros en formato ONNX, la inferencia es extremadamente ligera y puede ejecutarse en CPU sin necesidad de GPU.
- VRAM estimada: menos de 10 MB (el modelo ocupa menos de 2 MB en disco, según el tamaño del repo indicado como 0.0 GB, aunque este dato puede ser impreciso).
- GPU recomendada: ninguna; cualquier CPU moderna es suficiente.
- Opciones de despliegue: ONNX Runtime (CPUExecutionProvider), compatible con cualquier entorno Python. También puede integrarse en servicios serverless o en pipelines de procesamiento por lotes.
- Latencia: del orden de microsegundos por vector, dado el tamaño reducido de la red. Throughput estimado: miles de vectores por segundo en un solo núcleo de CPU.

## Comparativa con modelos similares

No se dispone de información sobre adaptadores comparables en el mismo repositorio o en la literatura consultada. Este adaptador es específico para el par `pplx-embed-1` → `fastembed-bge-small` y no existe una categoría estándar de modelos equivalentes. Se podría comparar con otros adaptadores de la colección de Queryn (por ejemplo, los que traducen entre otros pares de modelos), pero no se han proporcionado datos de esos modelos en la información disponible. Por tanto, la comparativa se limita a indicar que es un adaptador lineal de bajo coste, sin alternativas directas documentadas.

## Limitaciones y advertencias

- Dependencia de los modelos fuente y destino: la calidad de la traducción está limitada por la similitud entre los espacios de `pplx-embed-1` y `fastembed-bge-small`. Una similitud coseno de 0.9044 indica una buena correspondencia, pero no perfecta; puede haber pérdida de información semántica en la proyección.
- No es un modelo de lenguaje: no puede generar texto, responder preguntas ni realizar tareas de razonamiento. Su único propósito es la transformación de vectores.
- Idiomas no especificados: no se indica qué idiomas soporta el adaptador. Dado que los datos de entrenamiento incluyen textos en inglés (arXiv, SQuAD, PubMed, noticias), es probable que funcione mejor en inglés, pero no hay garantía para otros idiomas.
- Riesgo de sesgo en dominios no cubiertos: el entrenamiento se realizó sobre dominios específicos (ciencia, legal, QA, medicina, finanzas). Para textos de otros dominios (por ejemplo, contenido creativo o conversacional), la traducción puede ser menos precisa.
- Restricciones de licencia: aunque la licencia es MIT, el uso del adaptador no exime de cumplir con las licencias de los modelos subyacentes (`pplx-embed-1` y `fastembed-bge-small`), que pueden tener términos adicionales.
- Formato ONNX fijo: el modelo está exportado con opset 17; si se requiere integración con frameworks que no soporten este opset, puede ser necesario convertir el modelo.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/QuerynAi/queryn-adapter-pplx-embed-1_to_fastembed-bge-small)
- [Colección de adaptadores de Queryn](https://huggingface.co/collections/QuerynAi/queryn-embedding-adapters-6a9499470ee93453d02110b4)
- [Modelo fuente pplx-embed-v1-4b (Perplexity)](https://huggingface.co/perplexity-ai/pplx-embed-v1-4b)
- [Colección pplx-embed de Perplexity](https://huggingface.co/collections/perplexity-ai/pplx-embed)
