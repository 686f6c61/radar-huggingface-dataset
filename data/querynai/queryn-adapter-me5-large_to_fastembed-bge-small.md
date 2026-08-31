# QuerynAi/queryn-adapter-me5-large_to_fastembed-bge-small

## Resumen

Queryn adapter — `me5-large` → `fastembed-bge-small` es un adaptador de traducción de embeddings desarrollado por QuerynAi. Resuelve un problema concreto de interoperabilidad: permite que un corpus ya indexado con embeddings de `me5-large` (1024 dimensiones) pueda servirse contra un índice construido con `fastembed-bge-small` (384 dimensiones) sin necesidad de re-embedding del corpus completo. Esto es relevante para equipos que quieren migrar a un modelo de embeddings más ligero y rápido sin incurrir en el coste computacional de reprocesar toda su base de datos vectorial.

El modelo es una proyección lineal simple (capa fully-connected sin activación) que mapea el espacio de embeddings de `me5-large` al espacio de `fastembed-bge-small`. Tiene aproximadamente 393.6K parámetros, se distribuye en formato ONNX (opset 17) y está licenciado bajo MIT. Forma parte de un motor más amplio de traducción de embeddings de Queryn, que publica adaptadores para múltiples pares de modelos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Proyección lineal (linear projection) |
| Parametros totales | ~393.6K |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible (opera sobre embeddings, no sobre texto) |
| Tipos de cuantizacion | no disponible (solo float32) |
| Idiomas soportados | no disponible (depende de los modelos origen y destino) |
| Licencia | MIT |
| Formato de pesos | ONNX (opset 17) |

## Arquitectura y entrenamiento

El adaptador es una capa lineal que proyecta vectores de 1024 dimensiones a 384. El grafo ONNX incluye normalización L2 interna tanto en la entrada como en la salida, de modo que el usuario no necesita pre-normalizar los embeddings de origen. La dimensión del batch es dinámica, lo que permite procesar lotes de cualquier tamaño.

El entrenamiento se realizó sobre pares de embeddings generados a partir de un corpus multidisciplinar unificado de aproximadamente 350.000 filas, que incluye resúmenes de arXiv, jurisprudencia australiana, pasajes de SQuAD, resúmenes de PubMed y noticias de criptomonedas y mercados. La función de pérdida fue `1 - mean cosine similarity`, con optimizador Adam y programación de tasa de aprendizaje `ReduceLROnPlateau`. Se entrenaron dos arquitecturas para cada par de modelos —una lineal y una MLP profunda— y se publicó la que obtenía mejor puntuación de similitud coseno en el conjunto de test; en este caso, la lineal alcanzó 0.8990 frente a 0.8884 de la profunda.

## Capacidades

- Traducción de embeddings entre espacios vectoriales: mapea vectores de `me5-large` (1024-d) al espacio de `fastembed-bge-small` (384-d).
- Normalización L2 automática: el grafo normaliza tanto la entrada como la salida, garantizando vectores unitarios en el espacio destino.
- Procesamiento por lotes con dimensión dinámica: acepta batches de cualquier tamaño.
- Inferencia ligera: al ser una única capa lineal, la latencia es mínima y el coste computacional despreciable.
- Compatibilidad con índices existentes: permite usar un corpus ya embedido con `me5-large` contra un índice de `fastembed-bge-small` sin re-embedding.
- Integración con ONNX Runtime: se puede ejecutar en CPU, GPU u otros proveedores compatibles con ONNX.

## Casos de uso

- Migración de infraestructura de embeddings: un equipo que tiene un índice vectorial construido con `me5-large` y quiere cambiar a `fastembed-bge-small` por su menor latencia y huella de memoria puede usar este adaptador para transformar los embeddings almacenados sin reprocesar el corpus.
- Búsqueda híbrida multi-modelo: en un sistema de retrieval que combina varios modelos de embeddings, este adaptador permite unificar las representaciones en un único espacio vectorial para comparar similitudes de forma coherente.
- Reducción de costes de almacenamiento: al pasar de 1024 a 384 dimensiones, el espacio de almacenamiento del índice vectorial se reduce aproximadamente un 62.5%, lo que abarata el coste de memoria y disco en producción.
- Aceleración de búsqueda vectorial: los vectores de 384 dimensiones son más rápidos de comparar que los de 1024, lo que reduce la latencia de búsqueda en bases de datos vectoriales como Qdrant, Milvus o FAISS.
- Evaluación de adaptadores: el modelo puede usarse como referencia para comparar la calidad de traducción entre distintos pares de modelos dentro del ecosistema Queryn.
- Despliegue en entornos con recursos limitados: al ser un modelo ONNX de ~393K parámetros, puede ejecutarse en CPU sin GPU, en lambdas serverless o en dispositivos edge.

## Benchmarks y rendimiento

El modelo card reporta la siguiente métrica de calidad de traducción:

| Metrica | Valor |
|---|---|
| Mejor similitud coseno en test | 0.8990 (epoch 15) |
| Similitud coseno con arquitectura profunda | 0.8884 |

No se han publicado resultados de benchmarks comparativos con otros adaptadores o modelos de traducción de embeddings en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no aplica; el modelo puede ejecutarse en CPU sin necesidad de GPU.
- GPU recomendada: no necesaria; cualquier CPU moderna es suficiente.
- Compatibilidad con hardware de consumo: sí, cabe en cualquier dispositivo, incluidos Raspberry Pi o móviles.
- Opciones de despliegue: ONNX Runtime (CPUExecutionProvider, CUDAExecutionProvider), o cualquier runtime compatible con ONNX.
- Latencia y throughput: no disponibles, pero al ser una única capa lineal con ~393K parámetros, la inferencia es del orden de microsegundos por vector en CPU.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Dimension de salida | Licencia | Formato |
|---|---|---|---|---|---|
| Queryn adapter `me5-large` → `fastembed-bge-small` | Lineal | ~393.6K | 384 | MIT | ONNX |
| Queryn adapter `bge-m3` → `me5-large` | Lineal o MLP | no disponible | 1024 | MIT | ONNX |

No se dispone de información sobre otros adaptadores de traducción de embeddings de terceros para comparar directamente. La colección completa de adaptadores Queryn está disponible en Hugging Face.

## Limitaciones y advertencias

- Es un adaptador especializado, no un modelo de lenguaje: no genera texto ni entiende lenguaje; solo transforma vectores numéricos.
- La calidad de la traducción depende de la similitud entre los espacios de origen y destino; una similitud coseno de 0.8990 indica una buena aproximación pero no una equivalencia perfecta.
- No se garantiza que los embeddings traducidos mantengan todas las propiedades semánticas del espacio original; puede haber pérdida de información al reducir de 1024 a 384 dimensiones.
- El modelo se entrenó con dominios específicos (ciencia, legal, QA, medicina, finanzas); el rendimiento en dominios muy diferentes podría degradarse.
- No se especifican los idiomas soportados; depende de los modelos `me5-large` y `fastembed-bge-small` subyacentes.
- El repositorio no incluye el dataset de entrenamiento ni los scripts de entrenamiento, solo el modelo convertido a ONNX.
- La fecha de creación (2026-08-30) es futura respecto a la fecha actual; verificar la disponibilidad y mantenimiento del modelo.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/QuerynAi/queryn-adapter-me5-large_to_fastembed-bge-small)
- [Colección de adaptadores Queryn](https://huggingface.co/collections/QuerynAi/queryn-embedding-adapters-6a9499470ee93453d02110b4)
- [Adaptador bge-m3 → me5-large](https://huggingface.co/QuerynAi/queryn-adapter-bge-m3_to_me5-large)
- [Repositorio de fastembed (Qdrant)](https://github.com/qdrant/fastembed)
- [fastembed en PyPI](https://pypi.org/project/fastembed/)
