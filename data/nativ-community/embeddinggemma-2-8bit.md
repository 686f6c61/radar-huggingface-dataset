# nativ-community/embeddinggemma-2-8bit

## Resumen

nativ-community/embeddinggemma-2-8bit es una conversion al formato MLX del modelo de embeddings multimodal google/embeddinggemma-2, publicada por el usuario nativ-community. No es un modelo entrenado desde cero: se trata de un checkpoint cuantizado en 8 bits que conserva los codificadores de texto, imagen, audio y video del modelo original, y que produce embeddings normalizados de 768 dimensiones. Su proposito es ofrecer búsqueda semántica, recuperación de información y similitud de frases eficientes en hardware Apple Silicon mediante MLX.

El modelo tiene 744.371.512 parametros (unos 744 millones) y un peso de repositorio de 1,3 GB, con un almacenamiento de pesos declarado de 1,234 GB. La cuantizacion aplicada es afín de 8 bits con tamano de grupo 64, y sigue la politica estandar de MLX-VLM: los pesos no cuantizados y las activaciones se mantienen en BF16. Al derivarse de un modelo de la familia Gemma con licencia Apache-2.0, hereda esa misma licencia y la atribucion a Google.

Su relevancia actual radica en que permite ejecutar un modelo de embeddings multimodal de ultima generacion en un portatil con chip Apple sin depender de GPU dedicadas, manteniendo una fidelidad numérica alta respecto al checkpoint original en FP32. Es util para quien quiera construir pipelines de RAG, busqueda multimodal o clustering de contenido localmente, sin salir del ecosistema MLX. La contrapartida es que depende de una revision concreta de MLX-VLM y de una build de Transformers que exponga el procesador multimodal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder multimodal con codificador de texto y torres de vision y audio (base google/embeddinggemma-2); detalles de atencion no disponibles |
| Parametros totales | 744.371.512 (~744 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8-bit affine (group size 64) para el encoder de texto y la proyeccion de audio; BF16 para las torres de vision y audio y la proyeccion de vision |
| Idiomas soportados | multilingue (lista concreta de idiomas no disponible) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors en formato MLX (libreria mlx / mlx-vlm) |
| Dimension de embedding | 768 (con truncado Matryoshka a 128, 256 o 512) |
| Modalidades | texto, imagen, audio y video |

## Arquitectura y entrenamiento

El modelo es una conversion, no un entrenamiento nuevo. Parte del checkpoint google/embeddinggemma-2 (revision 914f7f89142e33e77833254d9c9b90c3cef7303b) y se transforma con MLX-VLM (revision 3d87e884, rama pc/embeddinggemma-2) y MLX 0.32.3. La arquitectura subyacente corresponde a un modelo de embeddings de la familia Gemma con un codificador de texto y torres dedicadas para vision y audio, mas proyecciones que alinean cada modalidad en un espacio comun de 768 dimensiones. La cuantizacion afín de 8 bits se aplica solo al codificador de texto y a la proyeccion de audio; las torres de vision y audio y la proyeccion de vision permanecen en BF16.

No se dispone en la informacion proporcionada de datos sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre si el modelo original uso RLHF, DPO u otras tecnicas de alineacion. La model card remite a la ficha del modelo original para esos detalles. La innovacion tecnica relevante de esta publicacion concreta es el proceso de conversion y cuantizacion, verificado numericamente: frente al checkpoint original en PyTorch FP32, las salidas mantienen una similitud coseno minima de 0,9998 y un error absoluto maximo en torno a 0,002 segun la modalidad. Ademas, el modelo soporta truncado Matryoshka, lo que permite usar vectores de 128, 256, 512 o 768 dimensiones.

## Capacidades

- Generacion de embeddings de texto normalizados de 768 dimensiones para similitud de frases y recuperacion semantica.
- Extraccion de caracteristicas de imagen (image-feature-extraction).
- Extraccion de caracteristicas de audio (audio-feature-extraction).
- Extraccion de caracteristicas de video (video-feature-extraction).
- Embeddings multimodales conjuntos: entradas de texto e imagen combinadas (text_image) en un mismo espacio vectorial.
- Soporte multilingue para busqueda y similitud entre idiomas.
- Truncado Matryoshka para reducir la dimensionalidad a 128, 256 o 512 sin reentrenar.
- Uso con prefijos de tarea (task prefixes) definidos en config_sentence_transformers.json para consultas y documentos.
- No es un modelo generativo: no produce texto, no hace tool calling ni razonamiento multi-paso.

## Casos de uso

- Busqueda semantica local en portatiles Apple Silicon: indexar documentos y consultar por similitud usando embeddings de 768 dimensiones con MLX, sin GPU dedicada.
- RAG (retrieval-augmented generation) en aplicaciones de escritorio: generar embeddings de fragmentos de texto para recuperar contexto relevante antes de pasarlo a un LLM generativo.
- Clustering y deduplicacion de contenido: agrupar articulos, tickets o mensajes por similitud coseno gracias a los embeddings normalizados.
- Recuperacion multimodal texto-imagen: buscar imagenes a partir de una descripcion textual, o viceversa, aprovechando que comparte el espacio de embeddings.
- Busqueda sobre audio o video: generar embeddings de fragmentos de audio o de fotogramas de video para localizar segmentos por contenido.
- Sistemas de recomendacion por similitud: comparar el embedding de un usuario (a partir de su historial textual) con el de items para ordenar candidatos.
- Filtrado y clasificacion de contenido multilingue: al ser multilingue, permite comparar textos en distintos idiomas dentro del mismo espacio vectorial.
- Reduccion de costes de almacenamiento: aplicar truncado Matryoshka a 256 dimensiones para reducir el tamano del indice vectorial asumiendo una pequena perdida de precision.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MTEB, retrieval u otros) en la informacion disponible. La unica verificacion numerica incluida son las comprobaciones de conversion frente al checkpoint original en PyTorch FP32; no constituyen una evaluacion de calidad de recuperacion:

| Entrada | Similitud coseno minima vs FP32 | Error absoluto maximo |
|---|---|---|
| audio | 0,999804 | 0,002476 |
| image | 0,999890 | 0,001937 |
| text | 0,999814 | 0,002299 |
| text_image | 0,999823 | 0,002105 |
| video | 0,999836 | 0,002130 |

Todas las salidas comprobadas eran finitas, estaban normalizadas a norma unitaria y tenian 768 dimensiones. El smoke test de recuperacion de texto clasifico el pasaje sobre Marte por encima del de Venus.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan aproximadamente 1,234 GB en disco; en memoria, la suma de pesos de 8 bits mas las torres en BF16 y las activaciones se situa en el entorno de 1,5-2,5 GB. Cifra orientativa, no confirmada por el autor.
- GPU recomendadas: el modelo esta pensado para MLX, por lo que el objetivo natural son chips Apple Silicon (series M1, M2, M3, M4 y superiores). No se especifican GPU NVIDIA o AMD.
- Cabe en GPU de consumo: si, en cualquier GPU con al menos 4 GB de VRAM si se convierte a otro runtime; en Apple Silicon con memoria unificada de 8 GB o mas.
- Opciones de despliegue: MLX y MLX-VLM (libreria declarada). No se indica soporte oficial para vLLM, llama.cpp, Ollama ni TGI; serian necesarias conversiones adicionales.
- Dependencias de entorno: MLX >= 0.32.3, Transformers >= 5.18.0 para el tokenizador, y una build de Transformers que exponga EmbeddingGemma2Processor para imagen, audio y video.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Formato | Licencia |
|---|---|---|---|---|---|
| nativ-community/embeddinggemma-2-8bit | ~744 M | no disponible | texto, imagen, audio, video | MLX safetensors 8-bit | apache-2.0 |
| google/embeddinggemma-2 (original) | ~744 M | no disponible | texto, imagen, audio, video | safetensors BF16/FP32 | apache-2.0 |
| Otras alternativas de embeddings (BGE, E5, etc.) | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa directa relevante es con el checkpoint original google/embeddinggemma-2: esta version reduce el tamano de los pesos a cambio de una perdida de fidelidad numerica muy baja (coseno >= 0,9998) y de una ejecucion optimizada para MLX. No se dispone de datos suficientes para comparar con otros modelos de embeddings de la competencia.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, codigo ni respuestas; solo genera embeddings.
- Sesgos conocidos: no disponibles en la informacion proporcionada; se remiten a la ficha del modelo original.
- Riesgo de alucinacion: no aplica directamente, ya que no genera texto; los errores se manifiestan como similitudes mal calibradas, no como afirmaciones falsas.
- Requiere usar el mismo prefijo de tarea y la misma dimension de embedding para consultas y documentos; mezclar prefijos o dimensiones degrada la recuperacion.
- No se debe convertir este modelo a float16: el autor indica explicitamente mantener los pesos no cuantizados y las activaciones en BF16.
- El soporte de imagen, audio y video depende de una build de Transformers que exponga EmbeddingGemma2Processor; la version estandar de PyPI 5.18.0 no lo incluye todavia, solo la build 5.18.0.dev0.
- El preprocesamiento multimodal exige una revision concreta de MLX-VLM; usar otra revision puede romper la carga del modelo.
- La verificacion incluida son smoke tests numericos, no una evaluacion de calidad de recuperacion; no hay garantia de rendimiento en tareas reales.
- Licencia Apache-2.0: permite uso comercial, pero obliga a conservar la atribucion a Google y el aviso de licencia.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nativ-community/embeddinggemma-2-8bit
- Modelo base (Google EmbeddingGemma 2): https://huggingface.co/google/embeddinggemma-2
- Revision del modelo base usada en la conversion: https://huggingface.co/google/embeddinggemma-2/tree/914f7f89142e33e77833254d9c9b90c3cef7303b
- Repositorio MLX-VLM: https://github.com/Blaizzy/mlx-vlm/tree/3d87e88402f307efbf68e568971aa887ee7d9ed0
- (La busqueda web no devolvio enlaces relevantes para este modelo; los resultados obtenidos corresponden a entidades homonimas sin relacion.)
