# litert-community/MediaPipe-TextEmbedder-EmbeddingGemma-300M

## Resumen

MediaPipe TextEmbedder-EmbeddingGemma-300M es un paquete `.task` de MediaPipe que empaqueta una version cuantizada del modelo de embeddings `google/embeddinggemma-300m` en formato LiteRT/TFLite. Lo publica la comunidad `litert-community` y esta pensado para ejecutar generacion de embeddings de texto directamente en dispositivo (Android, iOS, web, Python, Flutter) sin necesidad de infraestructura de servidor. El bundle `embedding_gemma.task` ocupa 183,82 MB y contiene un grafo `gemma.tflite` de 179,13 MB con precision mixta int4+int8, junto con el tokenizador SentencePiece y un manifiesto.

El modelo resuelve dos tareas con un mismo artefacto: por un lado actua como Text Embedder que produce vectores densos de 768 dimensiones con una longitud de secuencia de 512 tokens, y por otro lado se puede usar como Decision Maker, un clasificador de cero decodificacion que evalua preguntas de eleccion, booleanas y de puntuacion mediante similitud coseno entre embeddings. Es relevante porque permite busqueda semantica, clasificacion zero-shot y enrutamiento de decisiones en aplicaciones moviles y web sin conexion, manteniendo el formato de prompts oficial de EmbeddingGemma.

La arquitectura subyacente es la del modelo base EmbeddingGemma 300M de Google, un transformer encoder de 300 millones de parametros convertido a un bi-encoder simetrico. La licencia es Gemma Terms of Use, con acceso condicionado (gated) en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (bi-encoder simetrico) derivado de google/embeddinggemma-300m |
| Parametros totales | 300 M (modelo base); el grafo TFLite empaquetado ocupa 179,13 MB |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens en el grafo TFLite; hasta 2.048 tokens con chunking LogSumExp en DecisionMaker |
| Tipos de cuantizacion | Precision mixta int4 + int8 |
| Idiomas soportados | no disponible |
| Licencia | Gemma Terms of Use (gated) |
| Formato de pesos | `.task` (MediaPipe bundle con `gemma.tflite`, `sentencepiece.model` y `manifest.pb`) |
| Dimension de embedding | 768 |
| Tamano del bundle | 183,82 MB (183.816.181 B) |
| Entrada del sub-modelo | `embed_512_text_batch:0`, shape `[1, 512]`, int32 |
| Salida del sub-modelo | `StatefulPartitionedCall:0`, shape `[1, 768]`, float32 |
| Libreria | mediapipe |
| Pipeline | sentence-similarity |

## Arquitectura y entrenamiento

El modelo es una conversion a LiteRT/TFLite del modelo base `google/embeddinggemma-300m`, un transformer encoder de 300 millones de parametros disenado para producir embeddings de texto. La version empaquetada emplea precision mixta int4+int8 para reducir el peso a 179,13 MB manteniendo la salida en float32 de 768 dimensiones. El grafo es byte-identico a `embeddinggemma-300M_seq512_mixed-precision.tflite` del repositorio `litert-community/embeddinggemma-300m`, lo que garantiza equivalencia numerica con esa variante.

No se detallan en la informacion disponible los datos de entrenamiento del modelo base (numero de tokens, composicion del dataset, uso de RLHF/DPO). La innovacion tecnica destacable de este empaquetado es la integracion del formateo de prompts oficial de EmbeddingGemma mediante `TextEmbeddingFormatContext`, que aplica automaticamente las plantillas `task: <task> | query: <text>` para consultas y `title: <title> | text: <text>` para documentos. Ademas, el modo DecisionMaker implementa clasificacion sin decodificacion mediante similitud entre el embedding de la consulta y los embeddings de las opciones, con chunking automatico LogSumExp para contextos largos y cacheo de opciones con `prewarm_choice()`.

## Capacidades

- Generacion de embeddings de texto densos de 768 dimensiones con normalizacion L2 opcional.
- Similitud semantica de frases (pipeline `sentence-similarity`).
- Recuperacion de informacion (RETRIEVAL_QUERY / RETRIEVAL_DOCUMENT) con formateo de prompts especifico por tarea.
- Clasificacion zero-shot mediante el modo DecisionMaker con `ChoiceQuestion`, `BooleanQuestion` y `ScoreQuestion`.
- Enrutamiento de decisiones con probabilidades calibradas (temperatura auto-calibrada ≈0,045).
- Clustering de textos y deteccion de duplicados por similitud coseno.
- Question answering y fact checking como tipos de tarea de embedding.
- Recuperacion de codigo (CODE_RETRIEVAL).
- Chunking automatico de contextos largos hasta 2.048 tokens en DecisionMaker.
- Ejecucion en dispositivo en Android, iOS, web, Python y Flutter.
- No soporta generacion de texto libre ni tool calling; es un modelo de embeddings, no un LLM generativo.

## Casos de uso

- Busqueda semantica en aplicaciones moviles: el modelo genera embeddings de consulta y de documentos en el propio dispositivo, permitiendo busqueda offline sobre un corpus local sin enviar datos a un servidor; los 768D y la ventana de 512 tokens son suficientes para fragmentos de parrafo.
- Clasificacion de tickets de soporte: con DecisionMaker y `ChoiceQuestion` se pueden definir categorias como facturacion o tecnico y obtener la probabilidad de cada una para enrutar automaticamente la incidencia, con `prewarm_choice()` para reducir latencia en categorias fijas.
- Moderacion de contenido ligera: `BooleanQuestion` permite evaluar condiciones afirmativas (por ejemplo, si un texto contiene lenguaje ofensivo) sin necesidad de un LLM generativo, con bajo coste computacional en dispositivo.
- Deduplicacion y clustering de documentos: los embeddings normalizados permiten agrupar articulos, correos o registros similares mediante similitud coseno, ejecutable en pipelines de Python o en el navegador.
- Recomendacion de contenido: calcular similitud entre el embedding de un usuario o consulta y un catalogo de items precalculado, con la ventaja de que la inferencia ocurre localmente y protege la privacidad.
- RAG en el borde: en aplicaciones web o Flutter, generar embeddings de fragmentos de documentacion y de la pregunta del usuario para recuperar los pasajes mas relevantes antes de invocar un LLM remoto, reduciendo el trafico y la latencia.
- Filtrado previo en pipelines de agentes: usar DecisionMaker como clasificador rapido para decidir que herramienta o flujo activar antes de llamar a un modelo mayor, aprovechando su bajo coste y su capacidad de chunking hasta 2.048 tokens.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el sentido tradicional; el bundle es un grafo TFLite de 179,13 MB que se ejecuta en CPU, GPU o NPU del dispositivo mediante LiteRT.
- Memoria en dispositivo: el fichero `.task` ocupa 183,82 MB en disco; la memoria en tiempo de ejecucion depende del runtime LiteRT y del backend elegido, no se especifica en la informacion disponible.
- GPU recomendadas: no disponible; el modelo esta orientado a aceleracion en dispositivo (Android, iOS, web) mediante LiteRT, no a GPUs de servidor.
- Cabe en GPU consumer: no es el caso de uso; esta disenado para ejecutarse en moviles, navegadores y sistemas embebidos.
- Opciones de despliegue: MediaPipe Tasks (TextEmbedder y DecisionMaker) en Python, Android, iOS, web y Flutter; descarga via `huggingface_hub`.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dimension embedding | Formato | Licencia | Orientacion |
|---|---|---|---|---|---|---|
| MediaPipe-TextEmbedder-EmbeddingGemma-300M | 300 M | 512 tokens (2.048 con chunking en DecisionMaker) | 768 | `.task` (TFLite int4+int8) | Gemma Terms of Use | On-device |
| google/embeddinggemma-300m | 300 M | 512 tokens | 768 | safetensors | Gemma Terms of Use | Servidor / GPU |
| litert-community/embeddinggemma-300m | 300 M | 512 tokens | 768 | TFLite | Gemma Terms of Use | On-device |

La comparativa se limita a variantes del mismo modelo base, ya que la informacion disponible no incluye datos de rendimiento frente a alternativas de otros autores. El valor diferencial de esta ficha frente a las otras dos variantes es el empaquetado `.task` de MediaPipe, que anade el tokenizador, el manifiesto y la integracion con las APIs TextEmbedder y DecisionMaker.

## Limitaciones y advertencias

- Es un modelo de embeddings, no un LLM generativo: no produce texto, no soporta tool calling ni razonamiento multi-paso en el sentido de un agente.
- La ventana nativa es de 512 tokens; textos mas largos requieren truncado o el chunking LogSumExp del DecisionMaker (hasta 2.048 tokens), que puede perder matices en documentos muy extensos.
- No se dispone de informacion sobre los idiomas soportados; la cobertura multilingue del modelo base no esta documentada en esta ficha.
- La licencia Gemma Terms of Use impone condiciones de uso comercial y el acceso esta condicionado (gated) en Hugging Face; es necesario aceptar los terminos antes de descargar.
- Riesgo de alucinacion no aplica en el sentido generativo, pero la clasificacion zero-shot puede asignar probabilidades erroneas si las opciones no estan bien formuladas; la model card recomienda condiciones booleanas afirmativas sin excepciones compuestas con `unless`.
- La temperatura del DecisionMaker debe dejarse en 0,0 (auto-calibrada ≈0,045); modificarla puede descalibrar las probabilidades.
- No se han publicado benchmarks en la informacion disponible, por lo que no se puede verificar el rendimiento frente a alternativas.
- El rendimiento real depende del backend LiteRT y del hardware del dispositivo; no se documentan latencias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/litert-community/MediaPipe-TextEmbedder-EmbeddingGemma-300M
- Modelo base: https://huggingface.co/google/embeddinggemma-300m
- Variante TFLite: https://huggingface.co/litert-community/embeddinggemma-300m
- Instrucciones de prompt de EmbeddingGemma: https://huggingface.co/google/embeddinggemma-300m#prompt-instructions
- Terminos de uso de Gemma: https://ai.google.dev/gemma/terms
- Documentacion de MediaPipe Text Embedder: https://developers.google.com/edge/mediapipe/solutions/text/text_embedder
- Documentacion de MediaPipe Decision Maker: https://developers.google.com/edge/mediapipe/solutions/decision/decision_maker
- Demo web Text Embedder: https://google-ai-edge.github.io/mediapipe-samples-web/#/text/text_embedder
- Demo web Decision Maker: https://google-ai-edge.github.io/mediapipe-samples-web/#/decision/decision_maker
- Fichero del bundle: https://huggingface.co/litert-community/MediaPipe-TextEmbedder-EmbeddingGemma-300M/blob/main/embedding_gemma.task
