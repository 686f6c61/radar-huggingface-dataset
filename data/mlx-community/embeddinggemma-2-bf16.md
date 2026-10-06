# mlx-community/embeddinggemma-2-bf16

## Resumen

embeddinggemma-2-bf16 es una conversion al framework MLX del modelo de embeddings Google EmbeddingGemma 2, publicada por la comunidad mlx-community. Se trata de un modelo de extraccion de caracteristicas (feature extraction) y similitud semantica que genera embeddings normalizados de 768 dimensiones, disenado para tareas de recuperacion, busqueda semantica y clustering. Su relevancia radica en que conserva los codificadores multimodales de texto, imagen, audio y video del modelo original, lo que permite construir indices vectoriales unificados sobre varias modalidades.

La pieza distribuida aqui no es un modelo generativo, sino un encoder: no produce texto, sino representaciones vectoriales. Cuenta con 744.371.512 parametros totales (aproximadamente 744 millones) almacenados en BF16, con un peso de 1,489 GB. La conversion preserva la licencia Apache 2.0 y la atribucion a Google, y esta pensada para ejecutarse en hardware Apple Silicon mediante MLX.

Esta version concreta es relevante para desarrolladores que trabajan en el ecosistema Apple y necesitan un encoder multimodal de calidad con soporte de truncamiento Matryoshka (128, 256, 512 o 768 dimensiones), lo que facilita ajustar el coste de almacenamiento y latencia del indice vectorial sin reentrenar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer multimodal de la familia embedding_gemma2 (base: google/embeddinggemma-2) |
| Parametros totales | 744.371.512 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (el autor advierte de no convertir a float16); no se documentan cuantizaciones GGUF ni de otro tipo |
| Idiomas soportados | Multilingue |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) |
| Dimension de embedding | 768 (con truncamiento Matryoshka a 128, 256 o 512) |
| Tamano del repo | 1,5 GB |
| Libreria | mlx |
| Pipeline | feature-extraction |

## Arquitectura y entrenamiento

La informacion proporcionada no detalla la arquitectura interna ni el proceso de entrenamiento del modelo original; el autor remite a la model card de google/embeddinggemma-2 para uso previsto, datos de entrenamiento, evaluacion y limitaciones. Lo que si se documenta es que se trata de un encoder que retiene los modulos de codificacion de texto, imagen, audio y video, y que produce embeddings normalizados de 768 dimensiones. La conversion se realizo con MLX-VLM (revision 3d87e884, rama pc/embeddinggemma-2) y MLX 0.32.3, a partir de la revision del checkpoint fuente 914f7f89142e33e77833254d9c9b90c3cef7303b.

El dato tecnico mas significativo de esta ficha es la validacion de la conversion: todas las salidas comprobadas resultaron finitas, normalizadas a norma unitaria y de 768 dimensiones. El autor realizo comprobaciones de humo sobre seis entradas de texto multilingues y sobre entradas sinteticas de imagen, audio, video de dos fotogramas y texto+imagen, comparando contra el checkpoint original en PyTorch FP32. La conversion BF16 y su recarga resultaron identicas bit a bit al checkpoint BF16 original de MLX. El autor insiste en que estas comprobaciones son verificaciones numericas, no una evaluacion de calidad de recuperacion tipo MTEB.

## Capacidades

- Generacion de embeddings de texto normalizados de 768 dimensiones para busqueda semantica y similitud de frases.
- Extraccion de caracteristicas de imagen (image-feature-extraction).
- Extraccion de caracteristicas de audio (audio-feature-extraction).
- Extraccion de caracteristicas de video (video-feature-extraction), validada con video de dos fotogramas.
- Embeddings conjuntos de texto e imagen en el mismo espacio vectorial (entradas text_image).
- Soporte multilingue para las entradas de texto.
- Truncamiento Matryoshka: los embeddings pueden recortarse a 128, 256 o 512 dimensiones y renormalizarse, lo que permite reducir coste de indice.
- Uso mediante prefijos de tarea (task prefixes) definidos en config_sentence_transformers.json; consultas y documentos deben usar la misma dimension.
- No es un modelo generativo: no realiza generacion de texto, razonamiento, codigo, matematicas ni tool calling.

## Casos de uso

- Busqueda semantica multilingue: indexar un corpus documental en varios idiomas y recuperar pasajes relevantes mediante similitud coseno sobre los embeddings de 768 dimensiones, aprovechando el soporte multilingue declarado.
- Sistemas RAG (retrieval-augmented generation): usar el encoder para recuperar contexto relevante que despues se inyecta en un LLM generativo, separando la fase de recuperacion de la de generacion.
- Indices vectoriales multimodales: construir un unico indice que contenga texto, imagenes, audio y video, de modo que una consulta textual recupere items de cualquier modalidad almacenada en el mismo espacio vectorial.
- Deduplicacion y clustering de contenido: agrupar documentos o medios similares calculando distancias entre embeddings; el truncamiento Matryoshka a 128 o 256 dimensiones acelera el calculo a gran escala.
- Busqueda visual y por similitud de imagenes: indexar un catalogo de imagenes con el codificador visual y recuperar imagenes a partir de una descripcion textual o de una imagen de referencia.
- Clasificacion y filtrado de audio o video: extraer embeddings de fragmentos de audio o fotogramas de video para tareas de similitud, agrupacion o deteccion de duplicados en pipelines de moderacion de contenido.
- Aplicaciones locales en Apple Silicon: desplegar el encoder en un Mac para tareas de busqueda semantica sin depender de servicios en la nube, gracias al formato MLX y al peso moderado del modelo (~1,5 GB).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MTEB u otros) en la informacion disponible. Lo unico documentado son las comprobaciones de fidelidad de la conversion frente al checkpoint original en PyTorch FP32:

| Entrada | Similitud coseno minima vs FP32 | Error absoluto maximo |
|---|---:|---:|
| audio | 0,999947 | 0,001258 |
| image | 0,999954 | 0,001135 |
| text | 0,999937 | 0,001468 |
| text_image | 0,999905 | 0,001864 |
| video | 0,999900 | 0,001688 |

Estas cifras miden la equivalencia numerica de la conversion, no la calidad de recuperacion del modelo.

## Requisitos de hardware

- Almacenamiento: el repo ocupa 1,5 GB y los pesos en coma flotante suman 1,489 GB en BF16.
- VRAM/memoria unificada estimada para inferencia: no disponible de forma explicita; los pesos BF16 rondan 1,5 GB, a lo que hay que sumar activaciones y overhead del runtime.
- Plataforma objetivo: MLX, es decir, hardware Apple Silicon (Mac con chip de la serie M). Requiere MLX >= 0.32.3.
- GPU NVIDIA (A100, H100, RTX 4090): no se documenta soporte; esta conversion esta pensada para MLX, no para CUDA. No hay datos de despliegue en vLLM, TGI, llama.cpp u Ollama.
- Dependencias: mlx-vlm en la revision que incluye soporte de EmbeddingGemma 2 (git+Blaizzy/mlx-vlm.git@3d87e884), transformers >= 5.18.0 y mlx >= 0.32.3.
- Preprocesado multimodal: requiere una build de Transformers que exponga EmbeddingGemma2Processor; la version de PyPI Transformers 5.18.0 no lo expone todavia. El ejemplo solo texto funciona con AutoTokenizer sin ese processor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos comparativos (benchmarks ni metricas) en la informacion proporcionada, por lo que no es posible establecer una comparativa cuantitativa con alternativas. Como unica referencia estructural, esta ficha corresponde a una conversion MLX del modelo google/embeddinggemma-2; cualquier comparacion con otros encoders de la misma categoria deberia hacerse contra el modelo original y sus resultados publicados de MTEB, que aqui no se incluyen.

## Limitaciones y advertencias

- No es un modelo generativo: solo produce embeddings; no responde preguntas ni genera texto.
- Riesgo de alucinacion: no aplica en el sentido habitual, pero los embeddings pueden producir recuperaciones irrelevantes si se mezclan prefijos de tarea o dimensiones distintas.
- Restriccion tecnica critica: no convertir el modelo a float16; el autor indica explicitamente mantener pesos y activaciones no cuantizados en BF16.
- Consultas y documentos deben emplear la misma dimension de embedding cuando se usa el truncamiento Matryoshka; mezclar dimensiones invalida la similitud.
- El preprocesado de imagen, audio y video requiere una build de Transformers que exponga EmbeddingGemma2Processor; con la version estandar de PyPI no funciona.
- El modelo esta validado sobre una revision concreta de MLX-VLM y MLX; cambios de version pueden alterar el comportamiento.
- Sesgos conocidos: no disponible en la informacion proporcionada; se remite a la model card original de Google.
- Limitacion de contexto: la longitud de contexto no esta especificada en la informacion disponible.
- Licencia permisiva: Apache 2.0, apta para uso comercial, siempre que se preserve la atribucion a Google y la propia licencia, tal como hace esta conversion.
- El proyecto tiene 0 descargas y 0 likes en el momento de la ficha, por lo que carece de validacion comunitaria amplia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mlx-community/embeddinggemma-2-bf16
- Modelo original: https://huggingface.co/google/embeddinggemma-2
- Revision del checkpoint fuente: https://huggingface.co/google/embeddinggemma-2/tree/914f7f89142e33e77833254d9c9b90c3cef7303b
- Repositorio MLX-VLM: https://github.com/Blaizzy/mlx-vlm
- Revision de MLX-VLM usada en la conversion: https://github.com/Blaizzy/mlx-vlm/tree/3d87e88402f307efbf68e568971aa887ee7d9ed0
