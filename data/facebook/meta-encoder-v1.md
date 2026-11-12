# facebook/meta-encoder-v1

## Resumen

MetaEncoder v1 es un modelo de embedding multimodal desarrollado por Facebook (Meta) y publicado en Hugging Face bajo el identificador `facebook/meta-encoder-v1`. Su funcion principal es la extraccion de caracteristicas (feature-extraction): convierte texto, imagenes, video (listas de fotogramas) y documentos en vectores densos L2-normalizados de 6656 dimensiones, que pueden usarse para similitud, clustering o recuperacion. Es relevante porque unifica retrieval texto-imagen, video e imagenes de documentos en un unico espacio de embedding con instrucciones, y ademas incorpora una API de decision (`decide`) para responder preguntas cerradas sobre un estado.

El modelo tiene 28.431.795.200 parametros (unos 28,4 mil millones) y un repositorio de 57 GB en formato safetensors. La model card indica que requiere `transformers>=5.15`, la primera version con soporte de `muse_glimmer`, y que una unica GPU de 80 GB puede alojar el modelo en bf16. Las secuencias de entrenamiento tenian como maximo 16.384 tokens y las entradas nunca se truncan, ya que la agrupacion (pooling) usa el ultimo token del turno de usuario.

La informacion publicada es muy escasa: no hay datos de licencia, idiomas soportados, composicion del dataset de entrenamiento ni resultados de benchmarks en la model card. La busqueda web no devolvio ninguna fuente tecnica util (solo paginas genericas de Facebook), por lo que muchos campos de esta ficha se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con codificador `muse_glimmer` (detalles no disponibles) |
| Parametros totales | 28.431.795.200 (28,4 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | 16.384 tokens (longitud maxima de las secuencias de entrenamiento) |
| Tipos de cuantizacion | no disponible (la model card solo menciona bf16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Dimension del embedding | 6656 (float32, L2-normalizado) |
| Entrada | texto, imagen (PIL), lista de imagenes, video (lista de fotogramas) |
| Resolucion de imagen | nativa, ajustada a rejilla de 28 pixeles, hasta 4096 tokens fusionados |
| Fotogramas de video | maximo 8 (submuestreo uniforme si hay mas) |
| Biblioteca | transformers (>= 5.15) |

## Arquitectura y entrenamiento

La model card identifica el codificador como `muse_glimmer`, integrado en la biblioteca `transformers` a partir de la version 5.15. Se trata de un transformer multimodal que procesa conjuntamente texto, imagenes y fotogramas de video dentro de una unica secuencia. Las imagenes conservan su resolucion nativa ajustada a una rejilla de 28 pixeles y se limitan a 4096 tokens fusionados; el video se codifica fotograma a fotograma, con submuestreo uniforme a 8 fotogramas cuando se supera ese numero. El pooling se realiza en la ultima posicion (el token `<|eot|>` del turno de usuario) con padding a la izquierda, lo que implica que las entradas no pueden truncarse.

El entrenamiento es contrastivo con temperatura 0.02: las probabilidades de la API `decide` se calculan como `softmax(score / 0.02)`, lo que confirma que el modelo se entreno con objetivos de similitud tipo InfoNCE sobre pares consulta-documento. No hay informacion publicada sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni innovaciones adicionales como decodificacion especulativa o atencion lineal. La model card si revela un detalle de diseno relevante: todos los prompts los escribe el wrapper (`MetaEncoder`) en el formato exacto del entrenamiento, con una cabecera de sistema fija terminada en "Represent the user's input.", una linea de fecha fija (para que una misma entrada produzca el mismo embedding cualquier dia) y las instrucciones del item tras una linea en blanco.

## Capacidades

- Embeddings multimodales unificados de 6656 dimensiones para texto, imagenes, video y documentos, con normalizacion L2 para similitud coseno.
- Embeddings condicionados por instruccion: la misma entrada se proyecta de forma distinta segun la instruccion ("Represent the given image.", "Find a document image that matches the given query.", etc.), y consultas y documentos pueden usar instrucciones distintas.
- Recuperacion (retrieval) consulta-corpus con `retrieve(query, corpus, top_k)`, que devuelve objetos `Hit` con indice, puntuacion de similitud coseno e item; el corpus puede precalcularse con `encode` y reutilizarse en busquedas sucesivas.
- Recuperacion texto-imagen, imagen-texto, imagen-imagen, texto-video y de imagenes de documentos (graficos, diapositivas).
- Decision cerrada mediante `decide(state, questions)`: preguntas de tipo `noul` (si/no), `choice` (entre 2 y 26 opciones) y `score` (niveles ordenados), con probabilidades, valor de confianza y puntuaciones crudas.
- Procesamiento por lotes de decisiones con `decide_batch(states, questions)`.
- Calibracion de la temperatura con `model.calibrate(answers, labels)` a partir de un conjunto etiquetado.
- Entrada de estado en JSON arbitrario (cadenas, objetos, listas de registros) junto con medios adjuntos (imagenes o video).
- No disponible: soporte de tool calling, function calling, generacion de texto libre, razonamiento multi-paso o capacidades de audio.

## Casos de uso

- Busqueda semantica sobre repositorios documentales: indexar una vez las imagenes de documentos (facturas, informes, diapositivas) con `encode` y una instruccion de documento, y resolver consultas en lenguaje natural con `retrieve` usando una instruccion de consulta, como muestra el ejemplo "Which quarter had the highest revenue?" de la model card.
- Deduplicacion y clustering de imagenes: calcular la matriz de similitud coseno con `MetaEncoder.similarity(docs, docs)` sobre los embeddings de un lote de imagenes para agrupar visualmente contenido duplicado o similar.
- Recuperacion de fotogramas de video: extraer hasta 8 fotogramas por clip, embekerlos con una instruccion de video y compararlos contra consultas textuales para localizar momentos relevantes en un archivo audiovisual.
- Clasificacion de intencion en busquedas: usar `decide` con una pregunta `choice` de hasta 26 opciones para asignar tematica (electronica, comida, viajes, otros) a una consulta de usuario, como en el ejemplo de la model card.
- Puntuacion de intencion de compra: pregunta de tipo `score` con niveles ["none", "weak", "moderate", "strong"] sobre el estado de la consulta, util para priorizar leads o personalizar resultados de busqueda.
- Filtros booleanos sobre estados estructurados: pregunta `noul` ("Is the user shopping for a product?") aplicada a un objeto JSON o a una lista de registros mediante `decide_batch`, para enrutar peticiones en un pipeline de analitica.
- Motor de retrieval multimodal en produccion: precalcular los embeddings del corpus una sola vez y servirlos como tensor para busquedas repetidas de baja latencia, evitando reencodificar los documentos en cada consulta.
- Enrutamiento y moderacion con umbrales calibrados: calibrar la temperatura con `model.calibrate` sobre un conjunto etiquetado y usar la confianza devuelta por `decide` para decidir cuando escalar a revision humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una imagen `benchmarks.png` y la comparacion con otras alternativas no puede realizarse con los datos disponibles.

## Requisitos de hardware

- VRAM estimada: una GPU de 80 GB aloja el modelo en bf16 segun la model card (28,4 mil millones de parametros; el repo ocupa 57 GB).
- GPU recomendadas: A100 80 GB o H100 80 GB para bf16. No se documentan configuraciones multi-GPU ni cuantizadas.
- GPU de consumo: no disponible. Con 28,4 mil millones de parametros en bf16 no cabe en GPUs consumer de 24 GB sin cuantizacion, y la model card no menciona versiones GGUF ni INT8/INT4.
- Despliegue: la via documentada es `transformers>=5.15` con el wrapper `MetaEncoder` (`from modeling_metaencoder import MetaEncoder`). No se mencionan vLLM, llama.cpp, Ollama ni TGI; dado que es un modelo de embedding y no de generacion, el soporte en esos motores es incierto.
- Latencia y throughput: no disponibles.
- Consideraciones de memoria: las secuencias no se truncan y la agrupacion usa el ultimo token, por lo que entradas muy largas (hasta 16.384 tokens) incrementan el consumo de memoria de activaciones proporcionalmente.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye benchmarks ni especificaciones de modelos alternativos de embedding multimodal con los que comparar de forma rigurosa (parametros, contexto, rendimiento, licencia y disponibilidad).

## Limitaciones y advertencias

- Licencia no disponible: no puede confirmarse el uso comercial; es un caveat critico antes de llevar el modelo a produccion.
- Idiomas soportados no disponibles: la model card no documenta cobertura multilingue ni el idioma de las instrucciones de entrenamiento.
- Las entradas no se pueden truncar: el pooling usa el ultimo token del turno de usuario, de modo que recortar la entrada degrada el embedding. Las secuencias de entrenamiento no superaban 16.384 tokens.
- Limite de 8 fotogramas por video: los videos con mas fotogramas se submuestrean uniformemente, lo que puede perder informacion temporal.
- Las probabilidades de `decide` dependen de la temperatura 0.02 del entrenamiento contrastivo; sin calibracion con datos propios, la confianza puede no estar bien ajustada.
- Las preguntas se responden de forma independiente: no hay razonamiento condicional entre preguntas, y la model card recomienda decidir primero la pregunta de la que depende otra e ignorar la segunda cuando no aplique.
- Riesgo de sesgo y de alucinacion en las decisiones: no hay documentacion sobre evaluaciones de sesgo ni sobre tasas de error de `decide`.
- Sin datos publicados de benchmarks, no es posible estimar la calidad del retrieval frente a alternativas ni validar el rendimiento en dominios especificos.
- La dependencia de `transformers>=5.15` y de un modulo propio (`modeling_metaencoder`) implica que el soporte en ecosistemas de inferencia de terceros puede ser limitado.
- La busqueda web no aporto informacion tecnica adicional: los resultados fueron paginas genericas de Facebook sin relacion con el modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/facebook/meta-encoder-v1
- Repositorio de pesos y model card: incluido en el enlace anterior (tamano del repo 57 GB)
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la busqueda web.
