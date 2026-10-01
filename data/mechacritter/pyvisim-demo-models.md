# MechaCritter/pyvisim-demo-models

## Resumen

`MechaCritter/pyvisim-demo-models` no es un modelo neuronal en el sentido habitual, sino un repositorio de artefactos de datos publicado por el autor de la libreria pyvisim. En concreto, contiene una coleccion de *stores* de embeddings de imagen (`InMemoryImageEmbeddingStore`) serializados con pyvisim 1.0.0, que empaquetan un embedder junto con el indice de las 7169 imagenes de train y validacion del dataset Oxford Flowers 102. Su proposito es servir de respaldo a una demo (Space) de recuperacion de imagenes por similitud visual.

El problema que resuelve es el de demostrar y comparar, sin necesidad de recalcular embeddings, distintas estrategias de similitud de imagen: embedders clasicos y de deep learning (CLIP, VLAD, Fisher Vector) combinados con distintos indices de busqueda (fuerza bruta o HNSW). Cada fichero sigue el patron de nombre `_<index>.safetensors`, de modo que el usuario puede cargar directamente un store ya indexado y consultarlo.

Es relevante para desarrolladores e investigadores que quieran evaluar rapida y reproduciblemente el comportamiento de metricas de similitud visual, o que necesiten una base precomputada para prototipar sistemas de image retrieval sobre un dataset estandar. El repositorio ocupa 2,0 GB y su model card indica explicitamente el formato, el dataset y las dependencias necesarias para cargarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no aplica (no es un modelo; agrupa embedders de imagen: CLIP, VLAD y Fisher Vector) |
| Parametros totales | no disponible (depende del embedder contenido en cada store) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (entrada de imagenes, no texto) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El repositorio no entrena ningun modelo. Almacena artefactos generados por la libreria pyvisim 1.0.0: cada fichero `.safetensors` es un `InMemoryImageEmbeddingStore` que contiene un embedder y los indices de embeddings de las 7169 imagenes de train y validacion de Oxford Flowers 102. Segun la model card, los stores incluyen embedders de tipo CLIP, VLAD y Fisher Vector, indexados con busqueda por fuerza bruta o con HNSW.

Los stores de VLAD y Fisher Vector emplean un extractor de caracteristicas personalizado llamado `OpenCV_RootSIFT`, que debe definirse o importarse antes de cargar los ficheros (el autor remite a `pyvisim_demo/features.py` del Space). Los stores de CLIP se guardaron con `device="cuda"`, aunque pyvisim los carga en CPU en maquinas sin GPU CUDA. La documentacion de pyvisim describe que la libreria cubre metricas tradicionales (PSNR, SSIM, Fisher Vectors, VLAD) y de deep learning (CLIP, Siamese Networks), e incluye algoritmos de busqueda y reranking. No se detalla en la informacion disponible el numero de imagenes indexadas por embedder, ni las dimensiones de los embeddings, ni curvas de rendimiento asociadas al entrenamiento (no hay entrenamiento implicado).

## Capacidades

- Recuperacion de imagenes por similitud visual sobre las 7169 imagenes de Oxford Flowers 102 (train y validacion).
- Carga directa de stores precomputados mediante `InMemoryImageEmbeddingStore.load_from_disk`.
- Soporte de multiples embedders: CLIP, VLAD y Fisher Vector.
- Dos estrategias de indexado: busqueda exhaustiva (fuerza bruta) y HNSW (indice de vecinos mas cercanos aproximado).
- Uso de un extractor de caracteristicas personalizado (`OpenCV_RootSIFT`) para los stores de VLAD y Fisher Vector.
- Serializacion y deserializacion de embedders e indices en formato safetensors.
- Integracion con la libreria pyvisim, que anade busqueda y reranking sobre el resultado.
- Carga en CPU de los stores de CLIP aunque se hayan guardado desde CUDA.
- No incluye generacion de texto, razonamiento, codigo, tool calling ni capacidades de agente: no es un modelo de lenguaje.

## Casos de uso

- Demo interactiva de recuperacion visual: cargar un store precomputado en un Space de Gradio y devolver las imagenes mas similares a una consulta, sin recalcular embeddings en cada peticion.
- Comparacion de embedders: usar los distintos ficheros (`clip`, `vlad`, `fisher`) para medir cual recupera mejor sobre el mismo conjunto de imagenes de Oxford Flowers 102.
- Comparacion de indices de busqueda: contrastar el store con indice HNSW frente al de fuerza bruta para evaluar el compromiso entre recall y velocidad en recuperacion aproximada.
- Prototipado de motores de image retrieval: servir de punto de partida para montar un pipeline de busqueda por similitud antes de indexar un corpus propio.
- Docencia e investigacion en vision por computador: material reproducible para ilustrar tecnicas clasicas (VLAD, Fisher Vector) frente a deep learning (CLIP) en tareas de similitud.
- Linea base de evaluacion: emplear los stores como referencia congelada para medir el efecto de nuevas metricas, rerankers o transformaciones sin variar el conjunto indexado.
- Pruebas de integracion de pyvisim: verificar el comportamiento de `InMemoryImageEmbeddingStore` y de los extractores personalizados en distintos entornos (CPU y CUDA).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Repositorio de 2,0 GB; el espacio en disco debe contemplar el conjunto completo de stores (varios embedders e indices).
- El almacenamiento de embeddings es en memoria (clase `InMemoryImageEmbeddingStore`), por lo que la busqueda requiere RAM suficiente para el indice cargado; el volumen exacto por store no esta disponible.
- Los stores de CLIP se guardaron desde CUDA, pero pyvisim los carga en CPU en maquinas sin GPU CUDA, de modo que la recuperacion no exige GPU.
- No se dispone de datos de VRAM estimada por cuantizacion ni de requisitos de GPU especificos; al no ser un modelo generativo, no aplican las estimaciones habituales de pesos en VRAM.
- Opciones de despliegue: la libreria pyvisim (uso en Python); los stores estan pensados para cargarse dentro de un Space o de una aplicacion Python. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI, que son herramientas orientadas a modelos de lenguaje.
- Latencia y throughput: no disponibles. Dependeran del embedder, del indice (fuerza bruta frente a HNSW) y del hardware.

## Comparativa con modelos similares

No procede una comparativa con modelos de lenguaje, ya que este repositorio no es un modelo. Como alternativa de la misma categoria (infraestructura de busqueda por similitud) puede contrastarse con librerias de indexado y recuperacion vectorial, aunque la informacion disponible no ofrece cifras de rendimiento comparadas:

| Alternativa | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pyvisim | Libreria de metricas de similitud de imagen con stores precomputados | no aplica | no aplica | no disponible | PyPI, GitHub, este repositorio de stores |
| FAISS u otras librerias de indices ANN | Librerias de indexado vectorial | no aplica | no aplica | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada |

No se dispone de datos que permitan una comparativa cuantitativa de rendimiento en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje ni un modelo generativo: no genera texto, codigo ni imagenes.
- El alcance esta limitado al dataset Oxford Flowers 102; la recuperacion se restringe a las 7169 imagenes indexadas, que son imagenes de flores y no representan dominios generales.
- Los stores guardan nombres de fichero desnudos (por ejemplo `image_00042.jpg`); las imagenes reales residen en el repositorio del dataset de la demo, por lo que sin ese repositorio no pueden recuperarse las imagenes visuales.
- Los stores de VLAD y Fisher Vector requieren definir o importar la clase `OpenCV_RootSIFT` antes de cargarlos; omitirlo provoca un fallo de carga.
- Los stores de CLIP se guardaron con `device="cuda"`; en maquinas sin GPU CUDA pyvisim los reubica en CPU, lo que puede afectar al rendimiento.
- La licencia no esta indicada en la informacion disponible; antes de un uso comercial debe verificarse con el autor, ya que no puede asumirse permiso de uso.
- El repositorio tiene un objetivo de demostracion (Space demo), no de produccion; no se documentan garantias de mantenimiento, versionado de datos ni soporte.
- No se han publicado datos de sesgos, tasas de alucinacion ni rendimiento medido; al no tratarse de un modelo generativo, esos conceptos no aplican directamente, pero la calidad del retrieval depende del embedder y del conjunto de imagenes.

## Enlaces

- HuggingFace: https://huggingface.co/MechaCritter/pyvisim-demo-models
- Repositorio GitHub de pyvisim: https://github.com/MechaCritter/Python-Visual-Similarity
- Documentacion de pyvisim: https://mechacritter.github.io/Python-Visual-Similarity/
- Tutorial de introduccion de pyvisim: https://mechacritter.github.io/Python-Visual-Similarity/tutorials/notebooks/getting_started.html
- Paquete en PyPI: https://pypi.org/project/pyvisim/
