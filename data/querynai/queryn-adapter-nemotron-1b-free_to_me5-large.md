# QuerynAi/queryn-adapter-nemotron-1b-free_to_me5-large

## Resumen

Queryn adapter — `nemotron-1b-free` → `me5-large` es un adaptador de embeddings desarrollado por QuerynAi que traduce las representaciones vectoriales generadas por el modelo de embeddings `nemotron-1b-free` (de NVIDIA, 2048 dimensiones) al espacio de embeddings de `me5-large` (1024 dimensiones). Su propósito es permitir que un corpus ya indexado con `nemotron-1b-free` pueda servirse contra un índice construido con `me5-large` sin necesidad de re-embedding, lo que ahorra costes computacionales y tiempo en migraciones de infraestructura de búsqueda semántica.

El modelo es una proyección lineal simple (arquitectura `linear`) con aproximadamente 2,1 millones de parámetros, exportado a ONNX (opset 17) y publicado bajo licencia MIT. No es un modelo de lenguaje ni un generador de texto, sino un componente de traducción entre espacios vectoriales dentro del motor de traducción de embeddings de Queryn. Su relevancia radica en la interoperabilidad entre modelos de embeddings heterogéneos, un problema creciente en sistemas RAG y búsqueda semántica donde conviven múltiples modelos de vectorización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Proyeccion lineal (capa densa unica) |
| Parametros totales | ~2,1 millones |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no procesa texto, solo vectores) |
| Tipos de cuantizacion | no disponible (formato ONNX float32) |
| Idiomas soportados | no disponibles (depende de los modelos origen y destino) |
| Licencia | MIT |
| Formato de pesos | ONNX (model.onnx, opset 17) |

## Arquitectura y entrenamiento

El adaptador es una capa lineal que mapea un vector de entrada de 2048 dimensiones (embeddings de `nemotron-1b-free`) a un vector de salida de 1024 dimensiones (espacio de `me5-large`). El grafo ONNX normaliza internamente el vector de entrada mediante L2, por lo que no se requiere pre-normalizacion. La salida tambien se normaliza a norma unitaria. La dimension del batch es dinamica.

Se entreno sobre un corpus unificado multi-dominio de aproximadamente 350.000 pares de embeddings, que abarca resumenes de arXiv, jurisprudencia australiana, pasajes de SQuAD, resumenes de PubMed y noticias de criptomonedas y mercados financieros. La funcion de perdida fue `1 - media de similitud coseno`, con optimizador Adam y reduccion de tasa de aprendizaje mediante `ReduceLROnPlateau`. Se evaluaron dos arquitecturas (lineal y MLP profundo) para cada par de modelos; se publico la que obtuvo mayor similitud coseno en el conjunto de test, siendo la lineal la ganadora con un valor de 0,9496 en la epoca 15.

## Capacidades

- Traduccion de embeddings: convierte vectores de 2048 dimensiones de `nemotron-1b-free` a vectores de 1024 dimensiones en el espacio de `me5-large`, preservando la semantica con una similitud coseno de 0,9496 en test.
- Normalizacion integrada: tanto la entrada como la salida se normalizan L2 dentro del grafo, simplificando su uso en pipelines existentes.
- Compatibilidad ONNX: se puede ejecutar con ONNX Runtime en CPU o GPU, sin dependencias adicionales del framework de origen.
- Batch dinamico: acepta lotes de cualquier tamano, lo que facilita su integracion en servicios de inferencia.
- No requiere re-embedding: permite reutilizar indices ya construidos con `nemotron-1b-free` para servirlos con un modelo de destino distinto.

## Casos de uso

- Migracion de indices de busqueda semantica: si una organizacion tiene un corpus indexado con `nemotron-1b-free` y desea cambiar a `me5-large` para mejorar la calidad de recuperacion, puede aplicar este adaptador a los embeddings almacenados y actualizar el indice sin reprocesar el corpus completo.
- Ahorro de costes en pipelines RAG: en sistemas de generacion aumentada por recuperacion donde el re-embedding de millones de documentos es prohibitivo, el adaptador permite cambiar de modelo de embeddings con una sola pasada de proyeccion lineal, mucho mas barata que re-ejecutar el modelo origen.
- Interoperabilidad entre modelos: en entornos donde diferentes equipos usan distintos modelos de embeddings, este adaptador permite unificar las representaciones en un espacio comun sin perder informacion significativa.
- Evaluacion de calidad de traduccion: el valor de similitud coseno de 0,9496 indica que la proyeccion preserva la estructura semantica, por lo que puede usarse como referencia para validar si la migracion es aceptable para un caso de uso concreto.
- Servicios de busqueda hibrida: en arquitecturas que combinan multiples indices (por ejemplo, uno con `nemotron-1b-free` y otro con `me5-large`), el adaptador permite fusionar resultados en un espacio vectorial unico.
- Actualizacion incremental de sistemas de recomendacion: si un sistema de recomendacion basado en embeddings necesita cambiar de modelo de vectorizacion, el adaptador evita reentrenar los modelos aguas abajo, ya que los vectores proyectados mantienen la compatibilidad con el indice destino.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible, ya que este modelo no es un LLM sino un adaptador de embeddings. La unica metrica reportada es la similitud coseno media en el conjunto de test, con un valor de **0,9496** para la arquitectura lineal (frente a 0,9451 para la variante profunda). No se dispone de comparaciones con otros adaptadores de embeddings.

## Requisitos de hardware

- VRAM estimada: inferior a 100 MB en float32 (el modelo tiene ~2,1M de parametros, lo que ocupa aproximadamente 8,4 MB en FP32; el overhead de ONNX Runtime es minimo).
- GPU recomendadas: cualquier GPU moderna, aunque no es necesaria; el modelo se ejecuta eficientemente en CPU.
- Compatibilidad con GPU de consumo: si, cualquier GPU con soporte CUDA o incluso sin GPU, ya que la carga computacional es trivial.
- Opciones de despliegue: ONNX Runtime (CPU o GPU), puede integrarse en servicios como FastAPI, o usarse como paso previo en pipelines de vLLM o TGI si se combina con el modelo de embeddings correspondiente.
- Latencia y throughput: no se han publicado mediciones oficiales, pero al ser una unica capa lineal, la latencia por lote es del orden de microsegundos en CPU y de nanosegundos en GPU, con throughput limitado principalmente por el I/O del batch.

## Comparativa con modelos similares

No se dispone de informacion sobre otros adaptadores de embeddings comparables en el ecosistema publico. La mayoria de soluciones de interoperabilidad entre modelos de embeddings se basan en re-embedding completo o en tecnicas de alineacion no publicadas. Este adaptador es especifico para el par `nemotron-1b-free` → `me5-large`, por lo que no existe una comparativa directa con alternativas de la misma categoria. Se puede mencionar que la alternativa mas sencilla seria re-embedding con `me5-large`, que requiere ejecutar el modelo de origen sobre todo el corpus, con un coste computacional mucho mayor.

## Limitaciones y advertencias

- Especificidad del par: el adaptador solo funciona entre `nemotron-1b-free` (2048-d) y `me5-large` (1024-d). No es generalizable a otros modelos de embeddings sin reentrenamiento.
- Dependencia de los modelos origen y destino: la calidad de la traduccion depende de la calidad de los embeddings de ambos modelos; si estos cambian (nuevas versiones), el adaptador podria quedar desactualizado.
- Perdida de informacion inherente: al reducir de 2048 a 1024 dimensiones, se pierde parte de la informacion contenida en los vectores originales, aunque la similitud coseno de 0,9496 sugiere que la perdida es limitada.
- Sin capacidad de generacion de texto: no es un modelo de lenguaje, no puede generar respuestas ni razonar; solo transforma vectores.
- Idiomas no especificados: el corpus de entrenamiento incluye dominios en ingles (arXiv, PubMed, SQuAD, jurisprudencia australiana, noticias financieras), por lo que el rendimiento en otros idiomas no esta garantizado.
- Tamano del repositorio: el repo figura con 0.0 GB, lo que podria indicar que el archivo `model.onnx` no esta disponible o que el peso no se ha subido correctamente; se recomienda verificar la integridad del repositorio antes de su uso en produccion.
- Licencia MIT: permite uso comercial y modificacion, pero el usuario es responsable de cumplir con las licencias de los modelos origen y destino (por ejemplo, la licencia de `nemotron-1b-free` y `me5-large`).

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/QuerynAi/queryn-adapter-nemotron-1b-free_to_me5-large
- Coleccion de adaptadores de Queryn: https://huggingface.co/collections/QuerynAi/queryn-embedding-adapters-6a9499470ee93453d02110b4
- Pagina de NVIDIA Nemotron (modelo origen): https://developer.nvidia.com/topics/ai/nemotron
- Pagina de despliegue de nemotron-3-embed-1b en NVIDIA NIM: https://build.nvidia.com/nvidia/nemotron-3-embed-1b/deploy
- Informacion de precios y contexto de nemotron-3-embed-1b en OpenRouter: https://openrouter.ai/nvidia/nemotron-3-embed-1b:free
