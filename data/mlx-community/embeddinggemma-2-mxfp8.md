# mlx-community/embeddinggemma-2-mxfp8

## Resumen

mlx-community/embeddinggemma-2-mxfp8 es una conversion al framework MLX del modelo de embeddings multimodal google/embeddinggemma-2, publicada por el colectivo mlx-community. El modelo genera embeddings normalizados de 768 dimensiones y conserva los codificadores de texto, imagen, audio y video del checkpoint original, por lo que sirve tanto para recuperacion semantica unimodal como para busqueda cruzada entre modalidades.

Se trata de un modelo de 744.371.512 parametros (dato real de los safetensors) cuantizado en formato MXFP8 (8 bits, tamano de grupo 32). La politica de cuantizacion de MLX-VLM aplica la cuantizacion al codificador de texto y a la proyeccion de audio, mientras que las torres de vision y audio y la proyeccion de vision se mantienen en BF16. El resultado ocupa 1,226 GB en disco y esta pensado para ejecutarse sobre Apple Silicon mediante MLX.

Su relevancia es practica: permite desplegar un modelo de embeddings multimodal de ~744 millones de parametros en hardware de consumo con memoria unificada, manteniendo una fidelidad numerica alta respecto al checkpoint original en FP32 (coseno minimo de 0,998305 en texto). Es una pieza util para pipelines RAG, busqueda semantica y clasificacion que necesiten embeddings de texto e imagen sin depender de GPU dedicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Derivada de la familia Gemma 2 (modelo de embeddings); detalle de capas no disponible |
| Parametros totales | 744.371.512 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP8, 8 bits, tamano de grupo 32; torres de vision y audio y proyeccion de vision en BF16 |
| Idiomas soportados | multilingual (sin lista detallada disponible) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 1,3 GB; pesos 1,226 GB en decimal) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base google/embeddinggemma-2, del que esta conversion hereda pesos y diseno. Lo que si se documenta es que el checkpoint incorpora encoders separados para texto, imagen, audio y video, y que el modelo produce embeddings normalizados de dimension 768. La conversion mantiene todos los pesos y ficheros de configuracion de procesado de cada modalidad; la cuantizacion MXFP8 se aplica al codificador de texto y a la proyeccion de audio, dejando las torres de vision y audio y la proyeccion de vision en BF16. Se advierte explicitamente de que los pesos y activaciones no cuantizados deben permanecer en BF16 y de que el modelo no debe convertirse a float16.

El proceso de conversion se realizo con MLX-VLM (revision 3d87e884, rama pc/embeddinggemma-2) y MLX 0.32.3, a partir de la revision 914f7f89142e33e77833254d9c9b90c3cef7303b del checkpoint original. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO en el modelo base dentro del material facilitado. El modelo soporta truncamiento Matryoshka, de modo que el embedding puede recortarse a 128, 256, 512 o 768 dimensiones. Para tareas de recuperacion deben aplicarse los prefijos de tarea definidos en config_sentence_transformers.json (por ejemplo, "task: search result | query: ..." para consultas y "title: none | text: ..." para documentos).

## Capacidades

- Generacion de embeddings de texto normalizados de 768 dimensiones, aptos para similitud coseno y recuperacion semantica.
- Embeddings de imagen (image-feature-extraction) para busqueda y clasificacion visual.
- Embeddings de audio (audio-feature-extraction).
- Embeddings de video (video-feature-extraction), con soporte de entradas de video de varios fotogramas.
- Embeddings conjuntos texto+imagen (entrada multimodal combinada).
- Busqueda y recuperacion cruzada entre modalidades (por ejemplo, consulta de texto contra corpus de imagenes o audio).
- Similitud de frases (sentence-similarity) para agrupamiento, deduplicacion y reranking.
- Soporte multilingue declarado por el autor.
- Truncamiento Matryoshka a 128, 256, 512 o 768 dimensiones para reducir coste de almacenamiento e indexado.
- No se declara soporte de tool calling, function calling ni modos de razonamiento por pasos; es un modelo de representacion (feature-extraction), no generativo.

## Casos de uso

- Busqueda semantica en documentacion tecnica: indexar los fragmentos con el encoder de texto usando el prefijo de documento y consultar con el prefijo de query; el embedding de 768 dimensiones se compara por producto escalar. Se puede truncar a 256 dimensiones para abaratar el indice vectorial.
- RAG sobre corpus multimodal: almacenar embeddings de texto, imagenes y audio en un mismo espacio vectorial y recuperar pasajes o recursos visuales relevantes para una consulta textual.
- Deduplicacion y agrupamiento de articulos o tickets: calcular embeddings del corpus completo y aplicar clustering o umbral de similitud coseno para detectar contenido duplicado o agrupar temas.
- Busqueda de productos por imagen: usar el encoder de imagen para indexar el catalogo y el encoder de texto para consultas en lenguaje natural, aprovechando el espacio compartido.
- Moderacion y clasificacion de contenido audiovisual: generar embeddings de fragmentos de audio y video y entrenar un clasificador ligero encima, sin necesidad de reentrenar el encoder.
- Reranking de resultados de un buscador existente: recodificar los candidatos top-k con el modelo y reordenar por similitud con la consulta, mejorando la precision sin reindexar todo el corpus.
- Sistemas de recomendacion por similitud de contenido: representar cada item con su embedding multimodal y recomendar vecinos cercanos, cubriendo articulos con portada de imagen, audio o video.
- Evaluacion de similitud semantica en investigacion: uso como extractor de caracteristicas fijo para tareas de sentence-similarity en varios idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MTEB u otros) en la informacion disponible. El autor indica expresamente que las comprobaciones realizadas son verificaciones numericas de conversion (smoke checks), no una evaluacion de calidad de recuperacion, y que no constituyen un MTEB. La unica tabla publicada compara las salidas del modelo cuantizado contra el checkpoint original en PyTorch FP32:

| Entrada | Coseno minimo vs FP32 | Error absoluto maximo |
|---|---:|---:|
| audio | 0,998335 | 0,006558 |
| image | 0,999487 | 0,003610 |
| text | 0,998305 | 0,006092 |
| text_image | 0,999264 | 0,004823 |
| video | 0,999231 | 0,007177 |

Todas las salidas verificadas fueron finitas, normalizadas a norma unitaria y de 768 dimensiones. El test de recuperacion de texto situo el pasaje sobre Marte por delante del de Venus. Las mediciones completas, incluidas las comparaciones con vectores truncados, estan en validation.json.

## Requisitos de hardware

- VRAM/memoria estimada para inferencia: aproximadamente 1,23 GB solo de pesos; con overhead de runtime, del orden de 2-3 GB. Cifra exacta no disponible.
- El formato es MLX, por lo que el destino natural son equipos Apple Silicon (serie M). Con memoria unificada de 8 GB o superior deberia ser suficiente; no hay cifras oficiales publicadas.
- En GPU dedicadas, el checkpoint original (PyTorch) puede ejecutarse, pero esta conversion concreta esta pensada para MLX; no se declara soporte CUDA.
- Opciones de despliegue: MLX y MLX-VLM. Requiere una revision de implementacion con soporte de EmbeddingGemma 2 (pip install "git+https://github.com/Blaizzy/mlx-vlm.git@3d87e88402f307efbf68e568971aa887ee7d9ed0"), mlx>=0.32.3 y transformers>=5.18.0.
- El preprocesado de imagen, audio y video requiere una build de Transformers que exponga EmbeddingGemma2Processor; la validacion uso la build upstream 5.18.0.dev0. La version estandar de PyPI 5.18.0 no expone todavia ese procesador. El uso solo de texto con AutoTokenizer no requiere dicho procesador.
- No se deben convertir pesos ni activaciones no cuantizados a float16; mantener BF16.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| mlx-community/embeddinggemma-2-mxfp8 | 744.371.512 | no disponible | safetensors (MLX, MXFP8) | apache-2.0 | Conversion cuantizada a 8 bits; pesos 1,226 GB |
| google/embeddinggemma-2 (base) | 744.371.512 | no disponible | safetensors (PyTorch, BF16/FP32) | apache-2.0 | Checkpoint original; sin cuantizar |
| Otras familias de embeddings (BGE, E5, GTE) | no disponible | no disponible | no disponible | no disponible | Sin datos verificados en la informacion proporcionada |

No se dispone de resultados de benchmarks que permitan comparar el rendimiento de este modelo frente a alternativas de la misma categoria.

## Limitaciones y advertencias

- No es un modelo generativo: solo produce representaciones (feature-extraction), por lo que no responde preguntas ni redacta texto por si mismo.
- Riesgo de alucinacion: no aplica en el sentido habitual al no generar texto, pero si puede producir similitudes erroneas en dominios fuera de su distribucion de entrenamiento.
- No hay resultados de MTEB ni de recuperacion publicados para esta conversion; las unicas validaciones son numericas frente al checkpoint FP32.
- El valor maximo de error absoluto frente a FP32 ronda 0,006-0,007, por lo que la cuantizacion introduce una desviacion pequena pero no nula; en pipelines muy sensibles al ranking conviene evaluar el impacto.
- El truncamiento Matryoshka exige que consultas y documentos usen la misma dimension de embedding.
- Es obligatorio aplicar los prefijos de tarea correctos; usar los mismos prefijos para consulta y documento o mezclarlos de forma incorrecta degrada la recuperacion.
- Idiomas: se declara soporte multilingue, pero no se detalla la lista de idiomas ni la calidad por idioma. Verificar el comportamiento en castellano antes de produccion.
- Longitud de contexto no disponible: no se puede planificar el troceado de documentos sin medirla empiricamente.
- Dependencia de versiones concretas: la implementacion de MLX-VLM y la build de Transformers con EmbeddingGemma2Processor son revisiones especificas. Fuera de ese entorno, el preprocesado multimodal puede no funcionar.
- Licencia apache-2.0: permite uso comercial preservando la atribucion a Google. La conversion mantiene la licencia y la atribucion del modelo original.
- El modelo no debe convertirse a float16: hacerlo puede degradar o romper los resultados numericos.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion de la comunidad sobre esta conversion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mlx-community/embeddinggemma-2-mxfp8
- Modelo original: https://huggingface.co/google/embeddinggemma-2
- Revision del checkpoint fuente: https://huggingface.co/google/embeddinggemma-2/tree/914f7f89142e33e77833254d9c9b90c3cef7303b
- Repositorio MLX-VLM (revision usada en la conversion): https://github.com/Blaizzy/mlx-vlm/tree/3d87e88402f307efbf68e568971aa887ee7d9ed0
- Fichero de validacion: validation.json (incluido en el repositorio del modelo)
- Configuracion de prefijos de tarea: config_sentence_transformers.json (incluido en el repositorio del modelo)
