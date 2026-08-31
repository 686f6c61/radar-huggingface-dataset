# QuerynAi/queryn-adapter-pplx-embed-1_to_nemotron-1b-free

## Resumen

Queryn adapter — `pplx-embed-1` → `nemotron-1b-free` es un adaptador de embeddings desarrollado por QuerynAi como parte de su motor de traducción de embeddings. Su función es transformar un vector de embedding generado por el modelo `pplx-embed-1` (de Perplexity, 1024 dimensiones) al espacio de representación del modelo `nemotron-1b-free` (de NVIDIA, 2048 dimensiones). Esto permite que un corpus ya indexado con `pplx-embed-1` pueda servirse contra un índice construido con `nemotron-1b-free` sin necesidad de re-embedding, lo que supone un ahorro significativo de tiempo y coste computacional en migraciones de infraestructura de búsqueda.

El modelo es una proyección lineal (arquitectura `linear`) con aproximadamente 2,1 millones de parámetros, exportado a ONNX (opset 17) y publicado bajo licencia MIT. Se entrenó sobre pares de embeddings de un corpus multi-dominio de unas 350 000 filas que abarca abstracts de arXiv, jurisprudencia australiana, pasajes de SQuAD, abstracts de PubMed y noticias de cripto/mercados. La similitud coseno media en el conjunto de test alcanza 0,7025, lo que indica una calidad moderada de traducción. Su relevancia actual radica en la creciente adopción de modelos de embeddings propietarios y abiertos, donde los adaptadores permiten interoperar entre espacios vectoriales sin reprocesar grandes volúmenes de datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Proyeccion lineal (linear projection) |
| Parametros totales | ~2,1 millones |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | No disponible (modelo ONNX en float32) |
| Idiomas soportados | No disponible (depende de los modelos origen y destino) |
| Licencia | MIT |
| Formato de pesos | ONNX (opset 17) |

## Arquitectura y entrenamiento

El adaptador es una capa lineal simple que proyecta un vector de 1024 dimensiones (entrada `source_embedding`) a un espacio de 2048 dimensiones (salida `target_embedding`). El grafo ONNX normaliza L2 tanto la entrada como la salida, por lo que no se requiere pre-normalizacion por parte del usuario. La dimension de batch es dinamica, lo que permite procesar lotes de tamano variable.

El entrenamiento se realizo sobre pares de embeddings generados por los modelos origen y destino a partir de un corpus unificado multi-dominio (~350 000 filas). La funcion de perdida fue `1 - mean cosine similarity`, optimizada con Adam y reduccion de tasa de aprendizaje por meseta (`ReduceLROnPlateau`). Se comparo la arquitectura lineal con una variante profunda (MLP); la lineal obtuvo mejor similitud coseno en test (0,7025 frente a 0,6831) y fue la publicada. El checkpoint se convirtio a ONNX con torch 2.13.0.

## Capacidades

- Traduccion de embeddings de `pplx-embed-1` (1024-d) al espacio de `nemotron-1b-free` (2048-d).
- Normalizacion L2 integrada en el grafo, tanto de entrada como de salida.
- Soporte de batch dinamico en la dimension 0.
- Ejecucion en CPU mediante ONNX Runtime (sin dependencias de GPU).
- Compatible con cualquier pipeline que consuma embeddings ONNX (por ejemplo, indices vectoriales como FAISS o Milvus).

## Casos de uso

- Migracion de indices de embeddings sin re-embedding: si una organizacion tiene un corpus ya embebido con `pplx-embed-1` y quiere cambiar su motor de busqueda a un indice basado en `nemotron-1b-free`, este adaptador transforma los vectores existentes al nuevo espacio, evitando reprocesar millones de documentos.
- Ahorro de costes en infraestructura de RAG: en sistemas de generacion aumentada por recuperacion, re-embedding de grandes colecciones puede ser costoso; el adaptador permite reutilizar embeddings ya calculados.
- Interoperabilidad entre proveedores de embeddings: permite combinar datos embebidos con un modelo propietario (pplx-embed-1) con un modelo abierto (nemotron-1b-free) en un mismo indice.
- Evaluacion de calidad de traduccion: util para medir la distancia entre espacios de embedding y decidir si la migracion es viable segun la similitud coseno obtenida.
- Integracion en pipelines de datos: al ser un modelo ONNX ligero, puede ejecutarse en lambdas o funciones serverless para transformar embeddings bajo demanda.
- Pruebas de concepto de adaptadores: sirve como ejemplo de la arquitectura de traduccion de embeddings de Queryn, replicable para otros pares de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, etc.) porque no es un modelo de lenguaje. El unico dato de rendimiento disponible es la similitud coseno media en el conjunto de test: **0,7025** (epoch 15). La ablacion de arquitectura mostro que la lineal supera a la profunda (0,6831). No hay comparaciones con otros adaptadores similares en la informacion proporcionada.

## Requisitos de hardware

- Inferencia en CPU: el modelo tiene ~2,1M de parametros y un grafo ONNX simple, por lo que se ejecuta en cualquier CPU moderna sin necesidad de GPU.
- VRAM estimada: no aplica (inferencia en CPU; si se usara GPU, ocuparia menos de 10 MB).
- GPU recomendadas: no necesarias; cualquier CPU con soporte para ONNX Runtime es suficiente.
- Compatible con consumer hardware: si, incluso en Raspberry Pi o similares.
- Opciones de despliegue: ONNX Runtime (CPUExecutionProvider), tambien puede integrarse en servicios como Triton Inference Server o FastAPI.
- Latencia y throughput: no disponibles, pero al ser una unica capa lineal, la latencia es del orden de microsegundos por vector en CPU.

## Comparativa con modelos similares

No se dispone de informacion sobre adaptadores de embeddings comparables en el mercado. La mayoria de soluciones de traduccion entre espacios vectoriales son propietarias o no publicadas. Este adaptador es especifico para el par `pplx-embed-1` → `nemotron-1b-free`, por lo que no hay alternativas directas con las que comparar. Se puede mencionar que la coleccion de Queryn incluye otros adaptadores para distintos pares, pero no se proporcionan datos de los mismos.

## Limitaciones y advertencias

- El adaptador solo funciona en una direccion: de `pplx-embed-1` a `nemotron-1b-free`. No es bidireccional.
- La similitud coseno de 0,7025 indica que la traduccion no es perfecta; puede haber perdida de precision en tareas de recuperacion que dependan de distancias finas.
- No es un modelo de lenguaje ni de embedding; no puede generar texto ni representar nuevos documentos por si mismo.
- Depende de la calidad de los embeddings de origen y destino; si estos cambian (nuevas versiones), el adaptador puede quedar obsoleto.
- El corpus de entrenamiento es limitado (350k filas) y sesgado hacia dominios cientificos, legales, medicos y financieros; puede tener peor rendimiento en otros dominios.
- No se especifican los idiomas soportados; la cobertura multilingue depende de los modelos subyacentes.
- Licencia MIT permite uso comercial, pero el modelo origen `pplx-embed-1` puede tener sus propias restricciones (no detalladas en la informacion disponible).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/QuerynAi/queryn-adapter-pplx-embed-1_to_nemotron-1b-free
- Coleccion de adaptadores de Queryn: https://huggingface.co/collections/QuerynAi/queryn-embedding-adapters-6a9499470ee93453d02110b4
- Articulo de Perplexity sobre pplx-embed: https://research.perplexity.ai/articles/pplx-embed-state-of-the-art-embedding-models-for-web-scale-retrieval
- Modelo pplx-embed-context-v1 en HuggingFace: https://huggingface.co/perplexity-ai/pplx-embed-context-v1-4b
- Model card de llama-nemotron-embed-1b-v2 (NVIDIA): https://build.nvidia.com/nvidia/llama-nemotron-embed-1b-v2/modelcard
