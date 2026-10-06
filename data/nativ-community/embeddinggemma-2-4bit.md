# nativ-community/embeddinggemma-2-4bit

## Resumen

nativ-community/embeddinggemma-2-4bit es una conversion a MLX del modelo de embeddings multimodal google/embeddinggemma-2, publicada por el usuario nativ-community. Se trata de una cuantizacion de 4 bits en formato affine (group size 64) que conserva los codificadores de texto, imagen, audio y video del modelo original y produce embeddings normalizados de 768 dimensiones. El repositorio ocupa 1,1 GB y los pesos ocupan 1,098 GB en decimal, sobre un total de 744.371.512 parametros (aproximadamente 744 millones).

La relevancia de esta ficha es doble. Por un lado, permite ejecutar un modelo de embeddings multimodal en hardware Apple Silicon mediante MLX, con un consumo de memoria reducido respecto al checkpoint BF16 original. Por otro, el propio autor advierte de que la variante de 4 bits presenta una deriva medible en los embeddings, por lo que la ficha incluye las comprobaciones numericas de conversion para que el usuario decida si la fidelidad es suficiente para su caso de uso.

El modelo no es generativo: la pipeline declarada es feature-extraction, orientada a busqueda semantica, similitud de frases y recuperacion de informacion. La licencia es Apache-2.0, heredada del modelo base de Google, y la model card remite explicitamente al autor original para informacion sobre uso previsto, entrenamiento, evaluacion y limitaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de embeddings derivado de google/embeddinggemma-2, con codificadores de texto, imagen, audio y video y proyecciones asociadas. No se detalla la arquitectura interna en la informacion disponible |
| Parametros totales | 744.371.512 (aproximadamente 744 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits affine, group size 64 (codificador de texto y proyeccion de audio); torres de vision y audio y proyeccion de vision en BF16. La model card menciona tambien BF16 y 8 bits como referencias de comparacion |
| Dimension de embeddings | 768, normalizados; truncamiento Matryoshka a 128, 256, 512 o 768 dimensiones |
| Idiomas soportados | multilingue (sin lista de idiomas detallada en la informacion disponible) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (formato MLX) |
| Tamano de pesos | 1,098 GB en decimal |
| Libreria | mlx (implementacion mlx-vlm) |
| Pipeline | feature-extraction |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna ni el proceso de entrenamiento del modelo original: la model card de esta conversion remite a la ficha de google/embeddinggemma-2 para esos detalles. Lo que si se documenta es que la conversion conserva los codificadores de las cuatro modalidades (texto, imagen, audio y video) y que la politica estandar de MLX-VLM cuantiza unicamente el codificador de texto y la proyeccion de audio, dejando las torres de vision y audio y la proyeccion de vision en BF16.

La conversion se realizo con MLX-VLM en la revision 3d87e88402f307efbf68e568971aa887ee7d9ed0 (rama pc/embeddinggemma-2) y MLX 0.32.3, partiendo de la revision 914f7f89142e33e77833254d9c9b90c3cef7303b del modelo de Google. El comando de reproduccion indicado es `python -m mlx_vlm convert --hf-path google/embeddinggemma-2 --revision 914f7f89142e33e77833254d9c9b90c3cef7303b --mlx-path embeddinggemma-2-4bit --dtype bfloat16 -q --q-mode affine --q-bits 4 --q-group-size 64`. No se documenta en esta ficha el numero de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO.

## Capacidades

- Generacion de embeddings de texto normalizados de 768 dimensiones, aptos para similitud de frases y recuperacion semantica.
- Extraccion de caracteristicas de imagen (image-feature-extraction) mediante el codificador de vision.
- Extraccion de caracteristicas de audio (audio-feature-extraction) y de video (video-feature-extraction, con soporte de video de dos fotogramas en las pruebas del autor).
- Composicion multimodal: la model card incluye una comprobacion sobre entradas de texto mas imagen.
- Capacidad multilingue declarada, validada con seis entradas de texto en varios idiomas en las comprobaciones de conversion.
- Soporte de truncamiento Matryoshka: los vectores pueden recortarse a 128, 256, 512 o 768 dimensiones y renormalizarse, siempre que consultas y documentos usen la misma dimension.
- Uso mediante prefijos de tarea definidos en `config_sentence_transformers.json` (por ejemplo `task: search result | query:` o `title: none | text:`).
- No es un modelo generativo: no dispone de tool calling, function calling ni razonamiento multi-paso. La pipeline es feature-extraction.

## Casos de uso

- Busqueda semantica en bases de conocimiento internas: indexar documentos con los embeddings de 768 dimensiones y consultar en lenguaje natural aplicando el prefijo `task: search result`. Adecuado por su soporte multilingue y su tamano reducido, que permite indexar grandes volumenes con coste bajo de memoria.
- Recuperacion aumentada (RAG) en aplicaciones de preguntas y respuestas: el modelo actua como recuperador, no como generador, y se combina con un LLM aparte. Su baja huella permite ejecutarlo en el mismo portatil Apple Silicon que el generador.
- Deduplicacion y agrupamiento de documentos: calcular embeddings de un corpus y aplicar similitud coseno para detectar duplicados o hacer clustering tematico sin etiquetas.
- Clasificacion de texto por similitud de prototipos: representar cada categoria con unas pocas frases de referencia y asignar la etiqueta mas cercana, evitando entrenar un clasificador especifico.
- Busqueda de imagenes por texto o por imagen: usar el codificador de vision para indexar un archivo fotografico y consultarlo con lenguaje natural. La comprobacion de conversion reporta una similitud coseno minima de 0,990386 frente a FP32 en entradas de imagen.
- Indexacion y busqueda de contenido audiovisual: generar embeddings de audio (por ejemplo, fragmentos de podcast) o de fotogramas de video para localizar momentos concretos; las comprobaciones del autor cubren audio, imagen, texto, texto mas imagen y video de dos fotogramas.
- Sistemas de recomendacion por contenido: representar items de catalogo (descripcion, imagen o audio) en un unico espacio vectorial y recomendar por vecindad, gracias a que el modelo unifica modalidades.
- Deteccion de similitud y plagio en entornos multilingues: comparar pares de documentos en distintos idiomas en el mismo espacio de embeddings.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MTEB u otros) en la informacion disponible. La model card indica expresamente que las comprobaciones incluidas son verificaciones numericas de conversion, no un benchmark de calidad de recuperacion.

| Entrada | Similitud coseno minima frente a FP32 | Error absoluto maximo |
|---|---:|---:|
| audio | 0.974435 | 0.037149 |
| image | 0.990386 | 0.016959 |
| text | 0.980877 | 0.022356 |
| text_image | 0.986436 | 0.019337 |
| video | 0.986146 | 0.021160 |

Las comprobaciones cubren seis entradas de texto multilingue e entradas sinteticas de imagen, audio, video de dos fotogramas y texto mas imagen. Todas las salidas verificadas fueron finitas, normalizadas a norma unitaria y de 768 dimensiones. En la prueba de recuperacion de texto, el pasaje sobre Marte quedo por delante del de Venus. Las mediciones completas, incluidas las comparaciones con vectores truncados, estan en `validation.json` del repositorio.

## Requisitos de hardware

- Los pesos de esta conversion ocupan 1,098 GB en decimal, por lo que la inferencia cabe holgadamente en cualquier Mac con Apple Silicon y 8 GB de memoria unificada, dejando margen para activaciones y procesamiento de imagenes o audio.
- Esta variante esta pensada para MLX, es decir, para chips de Apple (series M1, M2, M3 y M4). No se proporcionan pesos GGUF ni safetensors de PyTorch en este repositorio.
- Para ejecutar en GPU NVIDIA o AMD seria necesario usar el modelo base google/embeddinggemma-2 en su formato original (PyTorch) o generar una conversion a otro runtime; este repositorio no la incluye.
- La model card advierte de que los pesos y activaciones no cuantizados deben mantenerse en BF16 y que no se debe convertir el modelo a float16.
- Opciones de despliegue documentadas: MLX-VLM (revision 3d87e884) con MLX 0.32.3 o superior y transformers 5.18.0 o superior. No se documentan despliegues con vLLM, llama.cpp, Ollama ni TGI para esta conversion.
- Para el preprocesamiento de imagen, audio y video se requiere una build de Transformers que exponga `EmbeddingGemma2Processor`; la version 5.18.0.dev0 suministrada por el modelo base sirve, mientras que la 5.18.0 estandar de PyPI todavia no expone ese procesador. El ejemplo solo de texto usa `AutoTokenizer` y no necesita ese procesador.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Dimension de embeddings | Cuantizacion | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| nativ-community/embeddinggemma-2-4bit | 744.371.512 | 768 (Matryoshka 128-768) | 4 bits affine, group size 64 | multilingue | apache-2.0 | MLX, safetensors |
| google/embeddinggemma-2 (modelo base) | no disponible en la informacion proporcionada | 768 segun la conversion (no confirmado en la informacion disponible) | BF16 (referencia) | multilingue | apache-2.0 | no disponible en la informacion proporcionada |
| Otras alternativas de embeddings multilingues de tamano comparable | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La busqueda web realizada no ha devuelto informacion sobre modelos comparables: los resultados obtenidos corresponden a servicios y marcas no relacionados con este modelo (plataformas de aprendizaje de idiomas, agencias de viaje, programas de nutricion y una marca de ropa). No se dispone por tanto de datos de benchmarks que permitan una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- Deriva de embeddings: la propia model card indica que esta variante de bajo numero de bits muestra una deriva medible. Se recomienda comparar contra BF16 o 8 bits con los propios datos de recuperacion antes de usarla en produccion.
- Las comprobaciones incluidas son verificaciones numericas de conversion, no una evaluacion de calidad de recuperacion tipo MTEB.
- No se debe convertir el modelo a float16; los pesos y activaciones no cuantizados deben permanecer en BF16.
- El truncamiento Matryoshka exige renormalizar los vectores y usar la misma dimension en consultas y documentos.
- Dependencia de versiones: el preprocesamiento multimodal requiere una build de Transformers que exponga `EmbeddingGemma2Processor`, que no esta en la version 5.18.0 estandar de PyPI. Con versiones distintas a las documentadas el codigo puede fallar.
- Restriccion de plataforma: los pesos estan en formato MLX, por lo que su uso directo queda limitado a hardware Apple Silicon.
- El modelo es un extractor de caracteristicas: no genera texto y no soporta tool calling ni razonamiento multi-paso, por lo que no puede sustituir a un LLM en un pipeline de agentes.
- No se documenta la longitud de contexto soportada, lo que impide planificar estrategias de fragmentacion con datos concretos.
- No se detalla la lista de idiomas cubiertos mas alla de la etiqueta "multilingual".
- Riesgo de sesgo y de alucinacion: no evaluado en la informacion disponible. Al ser un modelo de embeddings, el riesgo no es de alucinacion de texto sino de recuperar pasajes irrelevantes por deriva de los vectores.
- Licencia Apache-2.0: permite uso comercial, pero la conversion conserva la licencia y la atribucion a Google, que deben mantenerse.
- Adopcion nula: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nativ-community/embeddinggemma-2-4bit
- Modelo base: https://huggingface.co/google/embeddinggemma-2
- Revision del modelo base usada en la conversion: https://huggingface.co/google/embeddinggemma-2/tree/914f7f89142e33e77833254d9c9b90c3cef7303b
- Implementacion MLX-VLM (revision usada): https://github.com/Blaizzy/mlx-vlm/tree/3d87e88402f307efbf68e568971aa887ee7d9ed0
- Repositorio MLX-VLM: https://github.com/Blaizzy/mlx-vlm
- La busqueda web realizada no ha devuelto ningun enlace relevante sobre este modelo; los resultados obtenidos corresponden a sitios sin relacion con el (heynativ.com, bynativ.com, femmeactuelle.fr, natif-shop.com, nativ.to).
