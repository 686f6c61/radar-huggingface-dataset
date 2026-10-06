# nativ-community/embeddinggemma-2-5bit

## Resumen

nativ-community/embeddinggemma-2-5bit es una conversion a formato MLX del modelo de embeddings multimodal google/embeddinggemma-2, publicada por el usuario nativ-community. El modelo conserva los codificadores de texto, imagen, audio y video del checkpoint original y produce embeddings normalizados de 768 dimensiones, con soporte de truncado Matryoshka a 128, 256 o 512 dimensiones. Los pesos se almacenan en cuantizacion afina de 5 bits con grupo de 64, lo que reduce el almacenamiento de pesos a 1,132 GB (decimal) frente al checkpoint original en precision completa. El repositorio ocupa 1,2 GB y la licencia es Apache-2.0, heredada del modelo base.

La relevancia de esta ficha es doble. Por un lado, es una pieza de infraestructura practica para equipos que quieren ejecutar recuperacion semantica multimodal en local sobre Apple Silicon sin depender de GPU dedicadas. Por otro, ilustra un patron habitual en el ecosistema: conversiones comunitarias de modelos publicados por grandes laboratorios, con verificacion de fidelidad numerica pero sin evaluacion de calidad de recuperacion. El autor lo declara explicitamente: las comprobaciones adjuntas son "smoke checks" numericos contra el checkpoint original en PyTorch FP32, no resultados de MTEB ni de ningun benchmark de retrieval.

El modelo tiene 744.371.512 parametros (unos 744 M), lo que lo situa en la gama de modelos de embeddings de tamano medio, manejables en memoria unificada de equipos de consumo. El repositorio no registra descargas ni likes en el momento de redactar esta ficha, y no se ha publicado informacion sobre longitud de contexto, composicion del dataset de entrenamiento ni evaluaciones de calidad en la documentacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de embeddings multimodal derivado de google/embeddinggemma-2 (codificadores de texto, imagen, audio y video); no se detalla la arquitectura interna en la informacion disponible |
| Parametros totales | 744.371.512 (aproximadamente 744 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 5 bits, modo affine, group size 64. El encoder de texto y la proyeccion de audio estan cuantizados; las torres de vision y audio y la proyeccion de vision permanecen en BF16 |
| Idiomas soportados | Multilingue (no se especifica la lista de idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (formato MLX; biblioteca declarada: mlx) |
| Dimension de embedding | 768, normalizada; truncado Matryoshka a 128, 256 o 512 |
| Tamano de pesos | 1,132 GB (decimal); repositorio de 1,2 GB |
| Pipeline | feature-extraction |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo base mas alla de su caracter multimodal. Lo que si se documenta es la composicion de la conversion: el checkpoint conserva los codificadores de las cuatro modalidades (texto, imagen, audio y video) y produce una representacion unica de 768 dimensiones en el espacio de texto, con soporte de truncado Matryoshka. La politica de cuantizacion aplicada es la estandar de MLX-VLM: cuantiza el encoder de texto y la proyeccion de audio a 5 bits afines con grupo de 64, mientras que las torres de vision y audio y la proyeccion de vision se mantienen en BF16. Esta decision es coherente con el coste relativo de cuantizar torres convolucionales o de vision, donde la perdida de fidelidad suele ser mayor.

No hay informacion en el material proporcionado sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF o DPO, ni sobre innovaciones tecnicas del modelo original. Se remite explicitamente a la model card de google/embeddinggemma-2 para uso previsto, informacion de entrenamiento, evaluacion y limitaciones. La conversion se realizo con MLX-VLM en la revision 3d87e884, rama pc/embeddinggemma-2, y MLX 0.32.3, partiendo de la revision 914f7f89142e33e77833254d9c9b90c3cef7303b del repositorio de Google. El comando de conversion documentado es `mlx_vlm convert --hf-path google/embeddinggemma-2 --revision 914f7f8... --dtype bfloat16 -q --q-mode affine --q-bits 5 --q-group-size 64`.

## Capacidades

- Generacion de embeddings de texto normalizados de 768 dimensiones para recuperacion y similitud semantica.
- Embeddings multimodales: el repositorio incluye pesos y ficheros de configuracion del procesador para imagen, audio y video.
- Recuperacion cruzada texto-imagen y texto-video, con salida normalizada unitariamente.
- Truncado Matryoshka: las representaciones pueden recortarse a 128, 256 o 512 dimensiones y renormalizarse, lo que permite ajustar el coste de almacenamiento e indexado.
- Soporte multilingue (declarado como "multilingual", sin lista de idiomas).
- Prefijos de tarea: la model card indica aplicar los prefijos correspondientes definidos en `config_sentence_transformers.json`, por ejemplo `task: search result | query: ...` y `title: none | text: ...`.
- Uso como extractor de caracteristicas (`feature-extraction`) y para similitud de frases (`sentence-similarity`).
- No se documenta soporte de tool calling, function calling, agentes ni modo de razonamiento: es un modelo de embeddings, no generativo.
- Ejecucion en Apple Silicon mediante MLX y MLX-VLM.

## Casos de uso

- Busqueda semantica multilingue en corpus mixtos: indexar documentos con los prefijos de tarea correctos y consultar con `task: search result | query: ...`, usando la similitud coseno sobre vectores normalizados.
- Recuperacion aumentada por generacion (RAG) en local: generar embeddings de fragmentos de documentacion y de la consulta del usuario sin salir del equipo, con un indice vectorial de 768 dimensiones o truncado a 256 para reducir memoria.
- Recuperacion multimodal de catalogo: indexar imagenes de producto y recuperarlas mediante consultas textuales, aprovechando que la torre de vision permanece en BF16 y por tanto conserva mas fidelidad que si estuviera cuantizada.
- Deduplicacion y agrupamiento de contenido: calcular matrices de similitud entre elementos de un corpus para detectar duplicados o agrupar temas, usando el truncado a 128 dimensiones cuando el volumen es alto y la precision no es critica.
- Indexado y busqueda sobre audio y video: extraer embeddings de clips de audio o de fotogramas de video para construir buscadores internos de archivo audiovisual, con las salvedades de preprocesado descritas mas abajo.
- Sistemas de recomendacion por similitud de contenido: comparar el embedding de un elemento consumido por el usuario con el de candidatos no vistos, empleando las mismas dimensiones para consultas y documentos.
- Clasificacion y enrutado de tickets de soporte: generar embeddings de las solicitudes entrantes y asignarlas por vecindad a categorias previamente etiquetadas, con umbrales de similitud calibrados sobre datos propios.
- Prototipado en portatiles Apple: validar una arquitectura de recuperacion completa en un Mac con memoria unificada antes de decidir si se migra a un despliegue mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MTEB u otros) en la informacion disponible. El autor lo indica de forma explicita: las comprobaciones realizadas son verificaciones numericas de la conversion, no una evaluacion de la calidad de recuperacion.

La unica tabla de resultados disponible compara las salidas del modelo cuantizado con el checkpoint original ejecutado en PyTorch FP32:

| Entrada | Cosino minimo frente a FP32 | Error absoluto maximo |
|---|---:|---:|
| audio | 0,992494 | 0,012261 |
| imagen | 0,997334 | 0,007859 |
| texto | 0,992759 | 0,013390 |
| texto + imagen | 0,996334 | 0,009012 |
| video | 0,996727 | 0,009256 |

Todas las salidas verificadas resultaron finitas, normalizadas unitariamente y de 768 dimensiones. La prueba de recuperacion de texto situo el pasaje sobre Marte por delante del pasaje sobre Venus. Las mediciones completas, incluidas las comparaciones con vectores truncados, estan en `validation.json` del repositorio.

## Requisitos de hardware

- Peso de los pesos cuantizados: 1,132 GB (decimal) en 5 bits afines. A ello se suman las torres de vision y audio y la proyeccion de vision en BF16, por lo que la huella en memoria es superior a esa cifra; no se publica el total exacto.
- VRAM o memoria unificada estimada para inferencia: aproximadamente 2-4 GB, sumando pesos, activaciones y overhead del runtime de MLX. Es una estimacion derivada del tamano de los pesos, no un dato publicado.
- Cabe en GPUs de consumo y en equipos Apple Silicon con 8 GB de memoria unificada o mas. El formato es MLX, por lo que el objetivo natural son chips de la serie M de Apple.
- No se documenta una ruta CUDA: la biblioteca declarada es mlx y el cargador es `mlx_vlm.embedding_loader.load_embedding_model`. No se proporcionan pesos GGUF, ni integracion con vLLM, TGI, Ollama, llama.cpp o similar en la informacion disponible.
- Dependencias: `mlx>=0.32.3` y `transformers>=5.18.0`. Para el preprocesado de imagen, audio y video se requiere una build de Transformers que exponga `EmbeddingGemma2Processor`; la validacion se hizo con la build upstream 5.18.0.dev0, ya que la 5.18.0 de PyPI no expone todavia ese procesador. El ejemplo solo texto usa `AutoTokenizer` y no necesita ese procesador.
- Precaucion de precision: hay que mantener los pesos y activaciones no cuantizados en BF16; la model card indica explicitamente no convertir el modelo a float16.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La informacion proporcionada no describe alternativas comparables (otros modelos de embeddings multimodales, otras conversiones MLX del mismo modelo u otros modelos de la misma gama). La unica referencia directa es el checkpoint de origen:

| Modelo | Parametros | Contexto | Dimension de embedding | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| nativ-community/embeddinggemma-2-5bit | 744.371.512 | No disponible | 768 (Matryoshka 128/256/512) | Apache-2.0 | safetensors (MLX), 5 bits afines | Repositorio HF, biblioteca mlx |
| google/embeddinggemma-2 (modelo base) | No disponible en la informacion proporcionada (la conversion declara los mismos pesos de origen) | No disponible | No disponible; el autor remite a la model card original | Apache-2.0 | No disponible en la informacion proporcionada | Repositorio HF de Google, revision 914f7f89142e33e77833254d9c9b90c3cef7303b |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de recuperacion frente a otros modelos de embeddings.

## Limitaciones y advertencias

- El repositorio no registra descargas ni likes en el momento de la consulta y es una conversion de un tercero no afiliado a Google; no ha pasado por una revision oficial del laboratorio que publico el modelo base.
- Las comprobaciones incluidas son pruebas de humo numericas frente al checkpoint FP32 (cosino minimo de 0,9925 en texto y audio, error absoluto maximo de 0,0134). No hay evaluacion de MTEB ni de calidad de recuperacion, de modo que la degradacion real en tareas de retrieval no esta cuantificada.
- La cuantizacion a 5 bits introduce desviaciones medibles frente a FP32, especialmente en las modalidades de texto y audio.
- No se debe convertir el modelo a float16: la model card indica mantener los pesos no cuantizados y las activaciones en BF16.
- El preprocesado de imagen, audio y video requiere una build de Transformers que exponga `EmbeddingGemma2Processor`. La version 5.18.0 publicada en PyPI no lo expone, por lo que ese flujo puede fallar con un entorno estandar.
- Restriccion de plataforma: el formato MLX esta orientado a Apple Silicon. No hay ruta CUDA documentada ni pesos en otros formatos, lo que limita su uso en infraestructura con GPU NVIDIA.
- Cobertura linguistica declarada como "multilingual" sin lista de idiomas ni evaluacion por idioma en la informacion proporcionada.
- Riesgo de recuperacion erronea: al ser un modelo de embeddings, no genera texto y por tanto no "alucina" en el sentido generativo, pero si puede producir vectores que situen pasajes irrelevantes por encima de los relevantes, especialmente en dominios especializados o con prefijos de tarea mal aplicados.
- Es obligatorio aplicar los prefijos de tarea de `config_sentence_transformers.json` y usar la misma dimension de embedding (y el mismo truncado) para consultas y documentos; mezclar dimensiones invalida las comparaciones.
- Sesgos: no se documentan sesgos especificos del modelo en la informacion proporcionada; los heredados del modelo base habria que consultarlos en la model card de google/embeddinggemma-2.
- Licencia Apache-2.0: permite uso comercial, pero la conversion preserva la licencia y la atribucion a Google, que deben mantenerse.
- Ausencia de datos sobre longitud de contexto: no es posible planificar el troceado de documentos con una cifra verificada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nativ-community/embeddinggemma-2-5bit
- Modelo base: https://huggingface.co/google/embeddinggemma-2
- Revision concreta del modelo base usada en la conversion: https://huggingface.co/google/embeddinggemma-2/tree/914f7f89142e33e77833254d9c9b90c3cef7303b
- Repositorio MLX-VLM: https://github.com/Blaizzy/mlx-vlm
- Revision de MLX-VLM usada en la conversion: https://github.com/Blaizzy/mlx-vlm/tree/3d87e88402f307efbf68e568971aa887ee7d9ed0
- Los resultados de la busqueda web no aportan enlaces relevantes a este modelo: corresponden a entidades homonimas ("Nativ", "Natif") sin relacion con el repositorio de embeddings.
