# QuerynAi/queryn-adapter-pplx-embed-1_to_qwen3-emb-8b

## Resumen

QuerynAi/queryn-adapter-pplx-embed-1_to_qwen3-emb-8b es un adaptador de embeddings que traduce vectores generados por el modelo de embeddings `pplx-embed-1` de Perplexity (1024 dimensiones) al espacio vectorial del modelo `qwen3-emb-8b` de Qwen (4096 dimensiones). El objetivo es permitir que un corpus ya indexado con `pplx-embed-1` pueda servirse contra un índice construido con `qwen3-emb-8b` sin necesidad de re-embedding, lo que ahorra costes computacionales y de almacenamiento significativos en migraciones de infraestructura de búsqueda.

El modelo es una proyección lineal simple (arquitectura `linear`) con aproximadamente 4,2 millones de parámetros, entrenada sobre pares de embeddings de un corpus multidominio de unas 350.000 filas que abarca resúmenes de arXiv, jurisprudencia australiana, pasajes de SQuAD, resúmenes de PubMed y noticias de cripto y mercados. El adaptador se distribuye en formato ONNX (opset 17) bajo licencia MIT, y forma parte de un conjunto más amplio de adaptadores de traducción de embeddings de la organización QuerynAi.

La relevancia de este modelo radica en que aborda un problema práctico de interoperabilidad entre sistemas de embeddings heterogéneos: cuando una organización quiere cambiar de proveedor de embeddings sin re-procesar todo su corpus, un adaptador como este permite reutilizar la indexación existente. El mejor resultado de similitud coseno en el conjunto de test es de 0,7972, lo que indica una fidelidad razonable pero no perfecta en la traducción entre espacios vectoriales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Proyección lineal (linear projection) |
| Parametros totales | ~4,2 millones |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de traducción de embeddings, no procesa texto) |
| Tipos de cuantizacion | No disponible (formato ONNX float32) |
| Idiomas soportados | No disponible (depende de los modelos origen y destino) |
| Licencia | MIT |
| Formato de pesos | ONNX (opset 17) |

## Arquitectura y entrenamiento

El adaptador implementa una proyección lineal que mapea un embedding de entrada de 1024 dimensiones (producido por `pplx-embed-1`) a un embedding de salida de 4096 dimensiones en el espacio de `qwen3-emb-8b`. El grafo ONNX normaliza L2 tanto la entrada como la salida internamente, de modo que el usuario no necesita pre-normalizar los vectores. La dimensión del batch es dinámica, lo que permite procesar lotes de cualquier tamaño.

El entrenamiento se realizó sobre pares de embeddings generados a partir de un corpus unificado multidominio de aproximadamente 350.000 filas, que incluye resúmenes de arXiv, jurisprudencia australiana, pasajes de SQuAD, resúmenes de PubMed y noticias de cripto y mercados. La función de pérdida utilizada fue `1 - similitud coseno media`, optimizada con Adam y reducción de tasa de aprendizaje mediante `ReduceLROnPlateau`. Se entrenaron dos arquitecturas para cada par de modelos —una lineal y una MLP profunda— y se publicó la que obtenía mejor puntuación en el conjunto de test; en este caso, la lineal alcanzó 0,7972 frente a 0,7848 de la profunda.

## Capacidades

- Traducción de embeddings entre espacios vectoriales: convierte vectores de 1024 dimensiones de `pplx-embed-1` a vectores de 4096 dimensiones de `qwen3-emb-8b`.
- Normalización L2 integrada: el grafo normaliza tanto la entrada como la salida, garantizando vectores unitarios en el espacio destino.
- Procesamiento por lotes dinámico: la dimensión del batch es dinámica, lo que permite adaptarse a diferentes volúmenes de peticiones.
- Inferencia en CPU: al ser un modelo lineal de solo 4,2 millones de parámetros, puede ejecutarse eficientemente en CPU sin necesidad de GPU.
- Interoperabilidad entre sistemas de búsqueda: permite migrar de un proveedor de embeddings a otro sin re-embedding del corpus.
- Formato ONNX estándar: compatible con ONNX Runtime y cualquier framework que soporte este formato.

## Casos de uso

- Migración de infraestructura de búsqueda: una empresa que ha indexado millones de documentos con `pplx-embed-1` puede cambiar su backend a un índice basado en `qwen3-emb-8b` sin reprocesar el corpus, aplicando el adaptador a los embeddings existentes.
- Ahorro de costes computacionales: re-embedding de grandes corpus puede costar miles de euros en cómputo; este adaptador reduce el coste a una simple multiplicación matricial.
- Sistemas híbridos de recuperación: organizaciones que quieren combinar resultados de búsqueda de dos sistemas de embeddings diferentes pueden unificar los espacios vectoriales con este adaptador.
- Evaluación comparativa de modelos de embeddings: permite comparar la calidad de recuperación de `pplx-embed-1` y `qwen3-emb-8b` sobre el mismo índice, sin necesidad de duplicar la indexación.
- Actualización incremental de índices: cuando se añaden nuevos documentos a un corpus existente, se pueden embedder con el modelo destino y traducir los embeddings antiguos con el adaptador, manteniendo la coherencia del índice.
- Integración en pipelines de datos: el formato ONNX permite integrar el adaptador en pipelines de procesamiento de datos existentes mediante ONNX Runtime, con un overhead mínimo.

## Benchmarks y rendimiento

La model card proporciona los siguientes datos de rendimiento:

| Metrica | Valor |
|---|---|
| Mejor similitud coseno en test (arquitectura lineal) | 0,7972 |
| Mejor similitud coseno en test (arquitectura profunda) | 0,7848 |
| Arquitectura publicada | Lineal (0,7972) |

No se han publicado resultados de benchmarks comparativos con otros adaptadores o modelos de traducción de embeddings en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no requiere VRAM; el modelo puede ejecutarse en CPU con memoria RAM convencional.
- GPU recomendadas: no necesarias; cualquier CPU moderna es suficiente para inferencia.
- Compatibilidad con GPU consumer: sí, pero no es necesario; el modelo es tan pequeño que la GPU no aporta ventaja significativa.
- Opciones de despliegue: ONNX Runtime (CPU o GPU), cualquier framework que soporte ONNX (TensorRT, OpenVINO, etc.).
- Latencia estimada: del orden de microsegundos por vector en CPU, dado que es una única multiplicación matricial de 1024×4096.
- Throughput estimado: puede procesar decenas de miles de vectores por segundo en CPU moderna.

## Comparativa con modelos similares

No se han encontrado adaptadores de traducción de embeddings directamente comparables en el ecosistema open source. Los modelos de embeddings como `pplx-embed-1` y `qwen3-emb-8b` son los modelos origen y destino, pero no son alternativas al adaptador. La comparativa relevante sería entre la arquitectura lineal y la profunda, que ya se documenta en la model card:

| Arquitectura | Similitud coseno en test | Publicada |
|---|---|---|
| Lineal | 0,7972 | Sí |
| Profunda (MLP) | 0,7848 | No |

## Limitaciones y advertencias

- Fidelidad limitada: la similitud coseno de 0,7972 indica que la traducción no es perfecta; los vectores traducidos pueden perder información semántica sutil.
- Dependencia de los modelos origen y destino: el adaptador solo funciona con embeddings generados por `pplx-embed-1` y no es aplicable a otros modelos de embeddings.
- Dominios de entrenamiento limitados: el corpus de entrenamiento cubre ciencia, derecho, QA, medicina y finanzas; el rendimiento puede degradarse en dominios muy diferentes.
- Sin capacidad de generación de texto: este modelo no procesa texto, solo transforma vectores; no es un sustituto de un modelo de embeddings completo.
- Riesgo de degradación en producción: antes de desplegar en producción, es recomendable validar la calidad de recuperación del índice traducido con un conjunto de evaluación propio.
- Sin información sobre sesgos: no se ha documentado ningún análisis de sesgos para este adaptador.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/QuerynAi/queryn-adapter-pplx-embed-1_to_qwen3-emb-8b)
- [Colección de adaptadores de embeddings de QuerynAi](https://huggingface.co/collections/QuerynAi/queryn-embedding-adapters-6a9499470ee93453d02110b4)
- [Artículo de Perplexity sobre pplx-embed](https://research.perplexity.ai/articles/pplx-embed-state-of-the-art-embedding-models-for-web-scale-retrieval)
- [Repositorio oficial de Qwen3-Embedding](https://deepwiki.com/QwenLM/Qwen3-Embedding)
