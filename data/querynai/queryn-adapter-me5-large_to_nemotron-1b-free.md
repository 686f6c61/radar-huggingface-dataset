# QuerynAi/queryn-adapter-me5-large_to_nemotron-1b-free

## Resumen

Queryn adapter — `me5-large` → `nemotron-1b-free` es un modelo de traducción de embeddings desarrollado por QuerynAi como parte de su motor de interoperabilidad entre espacios de representación vectorial. Su función es transformar un embedding generado por el modelo `me5-large` (1024 dimensiones) al espacio de embeddings de `nemotron-1b-free` (2048 dimensiones), de modo que un corpus ya indexado con `me5-large` pueda servirse contra un índice construido con `nemotron-1b-free` sin necesidad de re-embedding. Esto resuelve el problema de incompatibilidad entre sistemas de búsqueda semántica que utilizan modelos de embeddings distintos.

El modelo es un pequeño MLP de aproximadamente 1,6 millones de parámetros, con una capa oculta, activación GELU y un latente comprimido. Se distribuye en formato ONNX (opset 17) y se entrena con pares de embeddings procedentes de un corpus multi-dominio de unas 350 000 filas (arXiv, jurisprudencia australiana, pasajes de SQuAD, resúmenes de PubMed y noticias de cripto/finanzas). La mejor similitud coseno en test alcanza 0,6440. Su relevancia radica en que permite migrar infraestructuras de búsqueda entre modelos de embeddings sin reprocesar todo el corpus, un ahorro significativo en coste y tiempo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP profundo (1 capa oculta, GELU, latente comprimido) |
| Parametros totales | ~1,6 millones |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (solo se distribuye en ONNX float32) |
| Idiomas soportados | no disponible (el corpus de entrenamiento incluye textos en ingles, aunque no se especifica) |
| Licencia | MIT |
| Formato de pesos | ONNX (opset 17) |

## Arquitectura y entrenamiento

El modelo es un perceptrón multicapa (MLP) con una única capa oculta, activación GELU y una representación latente comprimida. Toma como entrada un vector de 1024 dimensiones (embedding de `me5-large`) y produce un vector de 2048 dimensiones (espacio de `nemotron-1b-free`). El grafo ONNX normaliza L2 tanto la entrada como la salida, por lo que no se requiere pre-normalizacion externa. La dimension del batch es dinamica.

El entrenamiento se realizo sobre pares de embeddings generados a partir de un corpus unificado multi-dominio de aproximadamente 350 000 filas, que abarca resumenes de arXiv, jurisprudencia australiana, pasajes de SQuAD, resumenes de PubMed y noticias de cripto/finanzas. La funcion de perdida es `1 - similitud coseno media`, optimizada con Adam y reduccion de tasa de aprendizaje por meseta (`ReduceLROnPlateau`). Se entreno tanto una linea base lineal como el MLP para cada par de modelos; se publica el que obtiene mejor puntuacion en test (en este caso, el MLP con 0,6440 frente a 0,6395 del lineal). El checkpoint guardado corresponde a la epoca 15.

## Capacidades

- Traduccion de embeddings: transforma vectores de 1024 dimensiones del espacio `me5-large` al espacio de 2048 dimensiones de `nemotron-1b-free`.
- Normalizacion L2 integrada: tanto la entrada como la salida se normalizan dentro del grafo, garantizando vectores unitarios en el espacio destino.
- Compatibilidad con indices existentes: permite reutilizar un corpus ya embebido con `me5-large` en un sistema que use `nemotron-1b-free` sin re-embedding.
- Inferencia ligera: al ser un MLP de ~1,6 M de parametros, se ejecuta rapidamente en CPU con ONNX Runtime.
- Batch dinamico: acepta lotes de cualquier tamano en la dimension del batch.
- No es un modelo generativo: no genera texto, codigo ni respuestas; su unica funcion es la transformacion de representaciones vectoriales.

## Casos de uso

- Migracion de infraestructura de busqueda semantica: si una organizacion tiene un corpus embebido con `me5-large` y desea cambiar a un sistema de recuperacion basado en `nemotron-1b-free`, este adaptador permite hacer la transicion sin reprocesar millones de documentos, ahorrando tiempo y coste computacional.
- Interoperabilidad entre sistemas de embeddings: en entornos donde diferentes equipos usan distintos modelos de embeddings, este adaptador facilita la comunicacion entre sus indices, permitiendo consultas cruzadas sin duplicar almacenamiento.
- Evaluacion comparativa de modelos de embeddings: al traducir embeddings de un espacio a otro, se pueden comparar directamente las puntuaciones de similitud entre documentos representados con modelos diferentes, util para estudios de calidad de representaciones.
- Actualizacion incremental de motores de recomendacion: si un sistema de recomendacion basado en `me5-large` debe integrarse con un nuevo backend que usa `nemotron-1b-free`, el adaptador permite mantener el historial de interacciones sin re-embedding.
- Armonizacion de datos en pipelines de RAG: en arquitecturas de generacion aumentada por recuperacion donde el retriever y el generador usan espacios de embeddings distintos, este adaptador puede alinear las representaciones para mejorar la coherencia del pipeline.
- Reduccion de costes en despliegues a gran escala: al evitar el re-embedding de grandes volumenes de datos, se reducen los costes de computo y almacenamiento asociados a la migracion entre modelos de embeddings.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible, ya que este modelo no es un LLM sino un adaptador de embeddings. La metrica reportada es la similitud coseno media en el conjunto de test:

| Metrica | Valor |
|---|---|
| Mejor similitud coseno en test (epoca 15) | 0,6440 |
| Similitud coseno del baseline lineal | 0,6395 |

No se dispone de comparaciones con otros adaptadores de la misma coleccion en terminos de esta metrica para este par concreto, aunque el repositorio de Queryn indica que el par `fastembed-bge-small → nemotron-1b-free` obtiene 0,553, siendo el peor de la serie.

## Requisitos de hardware

- VRAM estimada para inferencia: no requiere GPU; el modelo es un MLP de ~1,6 M de parametros en ONNX, por lo que se ejecuta en CPU con menos de 10 MB de memoria.
- GPU recomendadas: no necesarias; cualquier CPU moderna es suficiente.
- Compatibilidad con hardware de consumo: si, se ejecuta en cualquier ordenador personal sin GPU.
- Opciones de despliegue: ONNX Runtime (CPUExecutionProvider o CUDAExecutionProvider si se desea), tambien puede integrarse en servicios como FastAPI o en pipelines de procesamiento por lotes.
- Latencia y throughput estimados: no disponibles, pero al ser un modelo de tamano reducido, la latencia por lote es del orden de milisegundos en CPU.

## Comparativa con modelos similares

No se dispone de informacion detallada sobre otros adaptadores de la misma coleccion en terminos de parametros, contexto o rendimiento para este par concreto. La coleccion completa de adaptadores de Queryn esta disponible en Hugging Face, pero no se han publicado comparativas numericas entre ellos en la informacion proporcionada. Se puede indicar que existen adaptadores para otros pares de modelos (por ejemplo, `fastembed-bge-small → nemotron-1b-free`), pero sin datos concretos de rendimiento comparativo.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo se entreno sobre un corpus limitado a cinco dominios (ciencia, derecho, QA, medicina y finanzas). Puede tener un rendimiento suboptimo en dominios fuera de estos ambitos.
- Riesgo de alucinacion: no aplica, ya que no genera texto; el riesgo se limita a posibles errores de traduccion de embeddings que podrian degradar la calidad de la busqueda.
- Limitaciones de contexto o idioma: no se especifican idiomas soportados; el corpus de entrenamiento es mayoritariamente en ingles, por lo que el rendimiento en otros idiomas no esta garantizado.
- Restricciones de licencia: licencia MIT, permite uso comercial sin restricciones, pero se recomienda revisar las licencias de los modelos fuente (`me5-large` y `nemotron-1b-free`) para asegurar el cumplimiento en el uso final.
- Caveat para produccion: la similitud coseno de 0,6440 indica una correlacion moderada entre los espacios; no es una traduccion perfecta, por lo que las busquedas pueden perder precision respecto a un re-embedding directo. Se recomienda validar en el caso de uso concreto antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/QuerynAi/queryn-adapter-me5-large_to_nemotron-1b-free
- Coleccion de adaptadores de Queryn: https://huggingface.co/collections/QuerynAi/queryn-embedding-adapters-6a9499470ee93453d02110b4
- Repositorio de Queryn en GitHub: https://github.com/Gigadelux/Queryn/tree/main
- Documentacion de Nemotron en Hugging Face: https://huggingface.co/docs/transformers/model_doc/nemotron
- Pagina de NVIDIA sobre Nemotron: https://developer.nvidia.com/topics/ai/nemotron
