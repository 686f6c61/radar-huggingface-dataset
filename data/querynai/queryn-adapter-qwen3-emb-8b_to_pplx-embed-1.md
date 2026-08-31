# QuerynAi/queryn-adapter-qwen3-emb-8b_to_pplx-embed-1

## Resumen

QuerynAi/queryn-adapter-qwen3-emb-8b_to_pplx-embed-1 es un adaptador de embeddings desarrollado por QuerynAi que traduce vectores generados por el modelo de embeddings Qwen3-Embedding-8B (4096 dimensiones) al espacio vectorial del modelo propietario pplx-embed-1 (1024 dimensiones). Su propósito es permitir que un corpus ya embebido con qwen3-emb-8b pueda servirse contra un índice construido con pplx-embed-1 sin necesidad de re-embedding, ahorrando costes computacionales y de almacenamiento.

El modelo es una proyección lineal simple (arquitectura `linear`) con aproximadamente 4,2 millones de parámetros, exportada a formato ONNX (opset 17). Se entrenó sobre pares de embeddings de un corpus multi-dominio de unas 350 000 filas que abarca resúmenes de arXiv, jurisprudencia australiana, pasajes de SQuAD, resúmenes de PubMed y noticias de criptomonedas y mercados. La mejor similitud coseno en test alcanzada es 0,8387, superando a una variante MLP más profunda (0,8131), por lo que se publicó la versión lineal.

Este adaptador forma parte del motor de traducción de embeddings de QuerynAi, que busca interoperabilidad entre distintos modelos de embeddings sin re-embedding masivo. Es relevante para equipos que desean migrar de un modelo de embeddings a otro manteniendo la infraestructura existente, o que necesitan combinar índices de búsqueda construidos con diferentes modelos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Proyeccion lineal (linear projection) |
| Parametros totales | ~4,2 millones |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (adaptador de embeddings, no modelo de lenguaje) |
| Tipos de cuantizacion | No disponible (formato ONNX float32) |
| Idiomas soportados | No disponibles (el corpus de entrenamiento incluye ingles, pero no se especifica cobertura multilingue) |
| Licencia | MIT |
| Formato de pesos | ONNX (model.onnx) |

## Arquitectura y entrenamiento

El adaptador implementa una proyeccion lineal que mapea un vector de entrada de 4096 dimensiones (embeddings de qwen3-emb-8b) a un vector de salida de 1024 dimensiones (espacio de pplx-embed-1). El grafo ONNX normaliza internamente el vector de entrada con L2, por lo que no se requiere pre-normalizacion. La salida tambien se normaliza a norma unitaria.

El entrenamiento se realizo sobre pares de embeddings generados por ambos modelos a partir de un corpus unificado multi-dominio (~350 000 filas). La funcion de perdida fue `1 - media de similitud coseno`, optimizada con Adam y reduccion de tasa de aprendizaje mediante `ReduceLROnPlateau`. Se entrenaron dos arquitecturas (lineal y MLP profundo) para cada par de modelos, publicandose la que obtenia mayor puntuacion en test; en este caso, la lineal alcanzo 0,8387 frente a 0,8131 de la profunda. No se emplearon tecnicas de RLHF ni DPO, al tratarse de un problema de regresion supervisada.

## Capacidades

- Traduccion de embeddings: convierte vectores de 4096 dimensiones de qwen3-emb-8b a vectores de 1024 dimensiones en el espacio de pplx-embed-1, manteniendo la normalizacion L2.
- Interoperabilidad entre indices: permite consultar un indice construido con pplx-embed-1 usando embeddings generados con qwen3-emb-8b sin re-embedding.
- Ejecucion ligera: al ser una proyeccion lineal, la inferencia es extremadamente rapida y no requiere GPU.
- Compatibilidad ONNX: puede integrarse en pipelines que usen ONNX Runtime, con soporte para batch dinamico.
- No es un modelo generativo: no genera texto, no soporta tool calling, ni agentes, ni razonamiento multi-paso. Su unica funcion es transformar vectores.

## Casos de uso

- Migracion de infraestructura de embeddings: si una organizacion tiene un corpus embebido con qwen3-emb-8b y desea cambiar a pplx-embed-1 (por ejemplo, por coste o por mejor rendimiento en busqueda), este adaptador permite servir el indice existente sin re-embedding, ahorrando tiempo y recursos de computo.
- Busqueda hibrida multi-modelo: en sistemas de recuperacion que combinan multiples indices, el adaptador permite unificar consultas generadas con qwen3-emb-8b contra indices pplx-embed-1, facilitando la integracion sin duplicar almacenamiento.
- Evaluacion comparativa de modelos de embeddings: al traducir embeddings entre espacios, se pueden comparar directamente la calidad de recuperacion de ambos modelos sobre el mismo corpus, sin necesidad de re-embedding.
- Actualizacion incremental de indices: cuando se anaden nuevos documentos a un corpus ya embebido con qwen3-emb-8b, se pueden traducir sus embeddings al espacio pplx-embed-1 para mantener la coherencia del indice, evitando re-embedding de todo el corpus.
- Sistemas de recomendacion basados en similitud: si se usan embeddings de qwen3-emb-8b para recomendaciones y se quiere cambiar a pplx-embed-1, el adaptador permite mantener los perfiles de usuario y los catalogos existentes sin recalcular todo.
- Reduccion de dimensionalidad controlada: aunque no es su proposito principal, el adaptador reduce de 4096 a 1024 dimensiones, lo que puede disminuir los requisitos de almacenamiento y acelerar la busqueda en indices vectoriales grandes, a costa de una perdida de fidelidad (similitud coseno de 0,8387).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, etc.) en la informacion disponible, ya que este modelo no es un LLM generativo sino un adaptador de embeddings. La unica metrica reportada es la similitud coseno media en el conjunto de test, con un valor de **0,8387** para la arquitectura lineal (frente a 0,8131 de la variante profunda). No se proporcionan comparaciones con otros adaptadores o metodos de traduccion de embeddings.

## Requisitos de hardware

- VRAM estimada: no requiere VRAM dedicada. Con ~4,2 millones de parametros en float32, el modelo ocupa aproximadamente 16,8 MB en memoria, por lo que se ejecuta sin problemas en CPU.
- GPU recomendadas: ninguna. Cualquier CPU moderna es suficiente; incluso en entornos embebidos o servidores sin GPU.
- Compatibilidad con GPU de consumo: si se desea, puede ejecutarse en cualquier GPU (RTX 4090, etc.) pero no aporta ventaja significativa dada la simplicidad de la operacion.
- Opciones de despliegue: ONNX Runtime (CPU o GPU), integrable en servicios como FastAPI, o en pipelines de busqueda vectorial (por ejemplo, con FAISS o Milvus) como paso de preprocesamiento.
- Latencia y throughput: al ser una multiplicacion matricial de dimensiones 4096x1024, la latencia por lote es del orden de microsegundos en CPU. Un lote de 1000 vectores se procesa en menos de 10 ms en un procesador moderno.

## Comparativa con modelos similares

No se dispone de informacion sobre otros adaptadores de traduccion de embeddings comparables en el mercado. La alternativa mas directa seria re-embedding completo con pplx-embed-1, que implica un coste computacional y de almacenamiento mucho mayor. Otra opcion seria usar directamente qwen3-emb-8b para consultas, pero entonces no se aprovecharia un indice ya construido con pplx-embed-1. No se conocen adaptadores publicos similares para otros pares de modelos de embeddings.

## Limitaciones y advertencias

- Especificidad del par: el adaptador solo funciona entre qwen3-emb-8b y pplx-embed-1. No es generalizable a otros modelos de embeddings.
- Perdida de informacion: la reduccion de 4096 a 1024 dimensiones implica una perdida de fidelidad, reflejada en la similitud coseno de 0,8387. Para casos de uso que requieran alta precision, puede ser insuficiente.
- Dominio de entrenamiento: el corpus de entrenamiento cubre ciencia, derecho, QA, medicina y finanzas. El rendimiento en dominios muy diferentes (por ejemplo, codigo fuente o contenido creativo) puede degradarse.
- Sin garantias de produccion: el modelo se publica sin evaluaciones exhaustivas de robustez ni pruebas en entornos de produccion. Se recomienda validar en el caso de uso concreto antes de desplegarlo.
- Dependencia de los modelos fuente: la calidad de la traduccion depende de la estabilidad de los embeddings de qwen3-emb-8b y pplx-embed-1. Si estos modelos se actualizan, el adaptador podria quedar desactualizado.
- Licencia MIT: permite uso comercial y modificacion, pero el modelo pplx-embed-1 es propietario; el adaptador no otorga derechos sobre el modelo objetivo.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/QuerynAi/queryn-adapter-qwen3-emb-8b_to_pplx-embed-1)
- [Coleccion de adaptadores de QuerynAi](https://huggingface.co/collections/QuerynAi/queryn-embedding-adapters-6a9499470ee93453d02110b4)
- [Modelo fuente Qwen3-Embedding-8B](https://huggingface.co/Qwen/Qwen3-Embedding-8B)
- [Repositorio oficial de Qwen3-Embedding](https://github.com/QwenLM/Qwen3-Embedding)
