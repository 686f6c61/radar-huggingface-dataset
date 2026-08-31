# QuerynAi/queryn-adapter-te3-small_to_bge-m3

## Resumen

El modelo `QuerynAi/queryn-adapter-te3-small_to_bge-m3` es un adaptador de traducción de embeddings desarrollado por QuerynAi. Su función es transformar los vectores generados por el modelo de embeddings `text-embedding-3-small` (te3-small, de OpenAI, 1536 dimensiones) al espacio vectorial de `bge-m3` (de BAAI, 1024 dimensiones). Esto permite que un corpus ya indexado con te3-small pueda servirse contra un índice construido con bge-m3 sin necesidad de re-embebir todo el corpus, lo que supone un ahorro significativo de tiempo y coste computacional.

El adaptador es una proyección lineal simple (arquitectura `linear`) con aproximadamente 1,6 millones de parámetros, exportado a formato ONNX (opset 17). Se entrenó sobre pares de embeddings de un corpus multi-dominio de unas 350 000 filas que abarca resúmenes de arXiv, jurisprudencia australiana, pasajes de SQuAD, resúmenes de PubMed y noticias de criptomonedas y mercados. La mejor similitud coseno en test alcanzada es de 0,8702 (epoch 15), lo que indica una calidad de traducción razonable aunque no perfecta.

Este modelo es relevante para equipos que gestionan infraestructuras de búsqueda vectorial y desean migrar entre modelos de embedding sin reprocesar grandes volúmenes de datos, o que necesitan interoperabilidad entre sistemas que usan distintos generadores de embeddings. Al ser un adaptador ligero y en formato ONNX, puede ejecutarse en CPU con latencia mínima.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Proyección lineal (linear) |
| Parametros totales | ~1,6 millones |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | No disponible (solo float32 en ONNX) |
| Idiomas soportados | No disponible (el adaptador no declara idiomas; los modelos fuente te3-small y bge-m3 son multilingües) |
| Licencia | MIT |
| Formato de pesos | ONNX (opset 17) |

## Arquitectura y entrenamiento

El adaptador es una proyección lineal que mapea un vector de entrada de 1536 dimensiones (embedding de te3-small) a un vector de salida de 1024 dimensiones (espacio de bge-m3). El grafo ONNX incluye una normalización L2 interna tanto en la entrada como en la salida, de modo que el usuario no necesita pre-normalizar los vectores de origen y recibe vectores unitarios en el espacio destino. La dimensión del batch es dinámica, lo que permite procesar lotes de cualquier tamaño.

El entrenamiento se realizó con pares de embeddings generados por ambos modelos sobre un corpus unificado multi-dominio (~350 000 filas) que incluye ciencia (arXiv), legal (jurisprudencia australiana), QA (SQuAD), medicina (PubMed) y finanzas (noticias de cripto y mercados). La función de pérdida fue `1 - mean cosine similarity`, optimizada con Adam y programación de tasa de aprendizaje con `ReduceLROnPlateau`, guardando el checkpoint de la mejor época. Se compararon dos arquitecturas: una lineal y una MLP profunda; la lineal obtuvo mejor similitud coseno en test (0,8702 frente a 0,8648) y fue la publicada.

## Capacidades

- Traducción de embeddings de te3-small (1536 dimensiones) al espacio de bge-m3 (1024 dimensiones).
- Normalización L2 automática de entrada y salida, garantizando vectores unitarios en el espacio destino.
- Soporte de batch dinámico en el grafo ONNX.
- Inferencia en CPU mediante ONNX Runtime, sin dependencias de GPU.
- Integración sencilla en pipelines de búsqueda vectorial existentes mediante la API estándar de ONNX.
- No es un modelo generativo ni de lenguaje: solo transforma vectores numéricos.

## Casos de uso

- Migración de índices vectoriales sin re-embebido: si una organización tiene un corpus indexado con te3-small y quiere adoptar bge-m3 como modelo de embeddings, puede usar este adaptador para transformar los vectores almacenados y servirlos contra un índice bge-m3 sin reprocesar el corpus original. Esto reduce drásticamente el coste de cómputo y el tiempo de migración.
- Interoperabilidad entre sistemas heterogéneos: en arquitecturas donde diferentes servicios usan distintos modelos de embedding (por ejemplo, un sistema de recomendación con te3-small y otro con bge-m3), el adaptador permite unificar los espacios vectoriales y compartir datos entre ellos.
- Ahorro de costes en pipelines RAG: en un sistema de generación aumentada por recuperación (RAG), si se desea cambiar el modelo de embeddings sin reindexar, el adaptador actúa como una capa de traducción en tiempo de consulta, evitando la re-embedización masiva.
- Pruebas A/B de modelos de embedding: permite comparar el rendimiento de bge-m3 frente a te3-small sobre el mismo corpus sin duplicar la infraestructura de indexación, transformando los embeddings existentes bajo demanda.
- Archivado y preservación de datos: si un corpus fue embebido con te3-small y el modelo original deja de estar disponible o se quiere estandarizar en bge-m3, el adaptador facilita la conversión de los vectores históricos.
- Despliegue en entornos con recursos limitados: al ser un modelo de solo 1,6 millones de parámetros en ONNX, puede ejecutarse en CPUs modestas o incluso en dispositivos edge, permitiendo la traducción de embeddings en tiempo real sin necesidad de hardware especializado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks comparativos con otros adaptadores o modelos en la información disponible. El único dato de rendimiento reportado es la similitud coseno media en el conjunto de test durante el entrenamiento:

| Metrica | Valor |
|---|---|
| Mejor similitud coseno en test (epoch 15) | 0,8702 |
| Similitud coseno con arquitectura profunda (mejor) | 0,8648 |

Este valor indica que la traducción no es perfecta y que puede haber una pérdida de fidelidad en la proyección, especialmente en dominios no representados en el corpus de entrenamiento.

## Requisitos de hardware

- VRAM estimada: no requiere VRAM, ya que el modelo se ejecuta en CPU.
- GPU recomendadas: ninguna; el modelo es una proyección lineal de ~1,6 millones de parámetros y se ejecuta eficientemente en CPU.
- Compatibilidad con GPU de consumo: no aplica, aunque si se desea se puede ejecutar en GPU con ONNX Runtime, pero no es necesario.
- Opciones de despliegue: ONNX Runtime (CPU o GPU), puede integrarse en servicios como FastAPI, o usarse en pipelines de búsqueda vectorial como Milvus, Weaviate o Qdrant mediante preprocesamiento.
- Latencia y throughput estimados: no disponibles, pero al ser una única capa lineal, la latencia por lote es del orden de microsegundos a milisegundos en CPU moderna, dependiendo del tamaño del batch.

## Comparativa con modelos similares

No se dispone de información sobre adaptadores de traducción de embeddings comparables en el mercado. El modelo forma parte de una colección de adaptadores de QuerynAi (Queryn Embedding Adapters) que traducen entre distintos pares de modelos de embedding, pero no se han publicado métricas comparativas entre ellos. Los modelos fuente (te3-small y bge-m3) son bien conocidos, pero este adaptador es específico para el par indicado.

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| queryn-adapter-te3-small_to_bge-m3 | ~1,6M | No aplica | MIT | ONNX |
| Otros adaptadores de QuerynAi | No disponible | No aplica | MIT | ONNX |

## Limitaciones y advertencias

- El adaptador solo traduce de te3-small a bge-m3; no funciona en sentido inverso ni con otros modelos de embedding.
- La similitud coseno máxima en test es 0,8702, lo que implica una pérdida de información en la proyección. Para aplicaciones que requieran alta fidelidad, se recomienda validar el impacto en la calidad de recuperación.
- El corpus de entrenamiento está limitado a dominios específicos (ciencia, legal, QA, medicina, finanzas). La traducción puede degradarse en dominios muy diferentes, como contenido creativo, conversacional o técnico especializado no cubierto.
- No se han publicado evaluaciones de sesgos o alucinaciones, aunque al ser un modelo puramente numérico (sin generación de texto) el riesgo de alucinación es nulo; el riesgo principal es la distorsión semántica en la proyección.
- El modelo está en formato ONNX float32; no se ofrecen versiones cuantizadas, lo que puede ser relevante para despliegues en entornos con memoria muy limitada.
- El repositorio no reporta descargas ni uso previo, por lo que su adopción en producción debe ir precedida de pruebas internas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/QuerynAi/queryn-adapter-te3-small_to_bge-m3
- Colección de adaptadores de QuerynAi: https://huggingface.co/collections/QuerynAi/queryn-embedding-adapters-6a9499470ee93453d02110b4
- Repositorio FlagEmbedding (bge-m3): https://github.com/FlagOpen/FlagEmbedding
- Documentación de OpenAI sobre text-embedding-3-small: https://developers.openai.com/api/docs/models/text-embedding-3-small
- Guía de text-embedding-3-small (Zilliz): https://zilliz.com/ai-models/text-embedding-3-small
