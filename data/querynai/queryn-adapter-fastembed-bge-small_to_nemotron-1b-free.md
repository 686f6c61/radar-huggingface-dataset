# QuerynAi/queryn-adapter-fastembed-bge-small_to_nemotron-1b-free

## Resumen

El modelo `queryn-adapter-fastembed-bge-small_to_nemotron-1b-free` es un adaptador de embeddings desarrollado por QuerynAi, parte de su motor de traducción de embeddings. Su función es transformar un vector de embedding generado por `fastembed-bge-small` (384 dimensiones) en el espacio de representación de `nemotron-1b-free` (2048 dimensiones), sin necesidad de re-embedding del corpus original. Esto permite que una base de datos vectorial ya indexada con `fastembed-bge-small` pueda ser consultada contra un índice construido con `nemotron-1b-free`, ahorrando costes computacionales y de almacenamiento.

El modelo es un perceptrón multicapa (MLP) con una capa oculta y activación GELU, comprimiendo el embedding de entrada a un espacio latente y expandiéndolo al espacio objetivo. Tiene aproximadamente 469.2K parámetros y se distribuye en formato ONNX (opset 17), lo que lo hace ligero y portable. Se entrenó sobre pares de embeddings de un corpus multi-dominio (arXiv, jurisprudencia australiana, SQuAD, PubMed y noticias financieras) con una pérdida basada en similitud coseno, alcanzando una similitud coseno media de 0.5529 en el conjunto de test.

La relevancia de este adaptador radica en su capacidad para interoperar entre distintos modelos de embeddings sin reprocesar los datos, una necesidad común en sistemas de recuperación aumentada (RAG) y búsqueda semántica cuando se migra de un modelo a otro. Su licencia MIT y su tamaño reducido lo hacen accesible para integraciones en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP con 1 capa oculta, activacion GELU, espacio latente comprimido |
| Parametros totales | ~469.2K |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (formato ONNX float32) |
| Idiomas soportados | no disponible (el adaptador opera sobre embeddings, no sobre texto) |
| Licencia | MIT |
| Formato de pesos | ONNX (opset 17) |

## Arquitectura y entrenamiento

El adaptador es un MLP que toma como entrada un embedding de 384 dimensiones (salida de `fastembed-bge-small`) y produce un embedding de 2048 dimensiones (espacio de `nemotron-1b-free`). La arquitectura incluye una capa oculta con activación GELU y un espacio latente comprimido, seguida de una capa de salida. El grafo ONNX normaliza L2 tanto la entrada como la salida, por lo que no se requiere pre-normalización manual.

El entrenamiento se realizó sobre pares de embeddings generados a partir de un corpus unificado multi-dominio de aproximadamente 350.000 filas, que incluye resúmenes de arXiv, jurisprudencia australiana, pasajes de SQuAD, resúmenes de PubMed y noticias de criptomonedas y mercados. La función de pérdida fue `1 - similitud coseno media`, optimizada con Adam y reducción de tasa de aprendizaje por meseta (ReduceLROnPlateau). Se entrenaron dos variantes por par de modelos: una lineal y una profunda (MLP), publicándose la que obtuviera mayor similitud coseno en test. En este caso, la variante profunda obtuvo 0.5529 frente a 0.5519 de la lineal, por lo que se guardó la profunda.

## Capacidades

- Traducción de embeddings: convierte vectores de 384 dimensiones de `fastembed-bge-small` al espacio de 2048 dimensiones de `nemotron-1b-free`.
- Normalización automática: el grafo ONNX normaliza L2 la entrada y la salida, garantizando vectores unitarios.
- Procesamiento por lotes dinámico: la dimensión de batch es dinámica, permitiendo procesar múltiples vectores a la vez.
- Ejecución ligera: al ser un MLP pequeño (~469K parámetros), puede ejecutarse en CPU con baja latencia.
- Interoperabilidad: permite usar un corpus ya embebido con `fastembed-bge-small` contra un índice de `nemotron-1b-free` sin re-embedding.
- No es un modelo de lenguaje: no genera texto, no tiene capacidades de razonamiento, tool calling ni agentes.

## Casos de uso

- Migración de índices vectoriales: si una empresa tiene una base de datos vectorial (por ejemplo, Qdrant o Milvus) indexada con `fastembed-bge-small` y desea cambiar a `nemotron-1b-free` para mejorar la calidad de recuperación, puede usar este adaptador para transformar los embeddings existentes sin reprocesar el corpus completo.
- Ahorro de costes en re-embedding: en pipelines de RAG con millones de documentos, re-embedding con un modelo nuevo es costoso. Este adaptador permite reutilizar los embeddings ya calculados, reduciendo tiempo y recursos.
- Búsqueda híbrida multi-modelo: en sistemas que combinan varios modelos de embeddings, el adaptador permite unificar las representaciones en un solo espacio para realizar búsquedas consistentes.
- Evaluación comparativa de modelos: al traducir embeddings de un modelo a otro, se pueden comparar métricas de recuperación (precisión, recall) entre ambos espacios sin re-embedding, facilitando la decisión de migración.
- Actualización incremental de índices: cuando se añaden nuevos documentos a un corpus ya embebido con `fastembed-bge-small`, se pueden traducir solo los nuevos embeddings al espacio de `nemotron-1b-free` para mantener la coherencia del índice.
- Integración en pipelines de datos: el formato ONNX permite integrar el adaptador en servicios de inferencia como ONNX Runtime, pudiendo desplegarse como un microservicio de transformación de embeddings.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) porque este modelo no es un LLM sino un adaptador de embeddings. La única métrica de rendimiento reportada es la similitud coseno media en el conjunto de test, que alcanzó **0.5529** en la época 15. Esta métrica indica la calidad de la traducción entre espacios, pero no es comparable con benchmarks de modelos de lenguaje.

## Requisitos de hardware

- VRAM estimada: menos de 10 MB (el modelo tiene ~469K parámetros en float32, lo que ocupa aproximadamente 1.8 MB en memoria).
- GPU recomendadas: no requiere GPU; puede ejecutarse en CPU sin problemas.
- Compatibilidad con GPU de consumo: sí, cualquier GPU con soporte ONNX Runtime funcionará, pero no es necesario.
- Opciones de despliegue: ONNX Runtime (CPU o GPU), puede integrarse en servicios como FastAPI, o usarse en pipelines de datos con Python.
- Latencia y throughput: al ser un MLP pequeño, la inferencia es del orden de microsegundos por vector en CPU moderna. No se dispone de cifras exactas, pero es adecuado para procesamiento en tiempo real.

## Comparativa con modelos similares

No se han encontrado adaptadores de embeddings comparables en la información disponible. La colección de QuerynAi incluye otros adaptadores entre distintos pares de modelos (por ejemplo, `bge-m3` a `fastembed-bge-small`), pero no hay métricas públicas que permitan una comparación directa. Por tanto, la comparativa se limita a señalar que este adaptador es específico para el par `fastembed-bge-small` → `nemotron-1b-free`, y que su rendimiento se mide por la similitud coseno entre el embedding traducido y el embedding real del modelo objetivo.

## Limitaciones y advertencias

- La similitud coseno de 0.5529 indica que la traducción no es perfecta; los embeddings traducidos pueden perder parte de la información semántica original, lo que podría degradar la calidad de recuperación en aplicaciones de búsqueda.
- El adaptador se entrenó en dominios específicos (ciencia, legal, QA, medicina, finanzas). Su rendimiento en otros dominios (por ejemplo, código, conversación informal) no está garantizado.
- No es un modelo de lenguaje: no puede generar texto ni realizar tareas de razonamiento. Solo transforma vectores.
- La licencia MIT permite uso comercial, pero el modelo depende de los modelos fuente y destino (`fastembed-bge-small` y `nemotron-1b-free`), cuyas licencias deben verificarse por separado.
- El modelo no incluye información sobre idiomas soportados; la capacidad multilingüe depende de los modelos de embedding originales.
- No se proporcionan garantías de latencia o throughput en producción; se recomienda realizar pruebas de carga antes de un despliegue a gran escala.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/QuerynAi/queryn-adapter-fastembed-bge-small_to_nemotron-1b-free)
- [Colección de adaptadores de QuerynAi](https://huggingface.co/collections/QuerynAi/queryn-embedding-adapters-6a9499470ee93453d02110b4)
- [Repositorio de FastEmbed (qdrant/fastembed)](https://github.com/qdrant/fastembed)
- [FastEmbed en PyPI](https://pypi.org/project/fastembed/)
- [Modelo BAAI/bge-small-en](https://huggingface.co/BAAI/bge-small-en)
- [Documentación de BGE](https://bge-model.com/)
