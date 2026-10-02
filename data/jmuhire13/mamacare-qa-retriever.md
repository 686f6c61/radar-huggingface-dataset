# jmuhire13/mamacare-qa-retriever

## Resumen

`jmuhire13/mamacare-qa-retriever` es un modelo de embeddings de frases publicado por el usuario jmuhire13 en HuggingFace, orientado a tareas de similitud semantica y recuperacion de informacion. Se trata de un fine-tuning del modelo base `nreimers/MiniLM-L6-H384-uncased`, encuadrado en la familia sentence-transformers, y que genera vectores densos de 384 dimensiones a partir de texto de entrada. Con 22.713.216 parametros y un tamano de repositorio de 0.1 GB, es un modelo muy ligero que puede ejecutarse en CPU y en cualquier GPU de consumo.

El nombre del repositorio sugiere un uso previsto como recuperador de preguntas y respuestas en el dominio de la salud materna ("mamacare-qa-retriever"), pero la model card publicada reproduce de forma literal la tarjeta estandar de `all-MiniLM-L6-v2`: no documenta ningun ajuste especifico sobre corpus clinicos, ni un dataset de QA medico, ni metricas de evaluacion en ese dominio. Por tanto, las caracteristicas tecnicas verificables son las del modelo base sobre el que se apoya.

A pesar de las cero descargas y cero likes en el momento de la consulta, el modelo resulta relevante como ejemplo de reutilizacion de la arquitectura MiniLM para retrieval. Es un encoder de frases de proposito general, entrenado con objetivo contrastivo sobre mas de 1.000 millones de pares de frases, adecuado para pipelines de busqueda semantica y RAG siempre que se valide su rendimiento real en el dominio sanitario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo MiniLM (BERT-based), 6 capas, hidden size 384 |
| Parametros totales | 22.713.216 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 256 word pieces (truncado por defecto) |
| Tipos de cuantizacion | no disponible (pesos publicados en fp32, safetensors) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

Dato adicional documentado: dimension del embedding de salida = 384.

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder denominado MiniLM. Segun la model card, se parte del modelo preentrenado `nreimers/MiniLM-L6-H384-uncased` y se realiza un fine-tuning con objetivo de aprendizaje contrastivo auto-supervisado: dada una frase de un par, el modelo debe predecir cual de un conjunto de frases muestreadas aleatoriamente estaba realmente emparejada con ella. El pooling por defecto es mean pooling sobre las representaciones contextuales, con normalizacion L2 posterior.

El entrenamiento se llevo a cabo durante 100.000 pasos con batch size de 1024 (128 por nucleo de TPU), sobre 7 TPU v3-8, con una longitud de secuencia limitada a 128 tokens, learning rate de 2e-5, warmup de 500 pasos y optimizador AdamW. La composicion del dataset combina multiples fuentes de pares de frases (entre ellas s2orc, ms_marco, gooaq, natural_questions, trivia_qa, snli, multi_nli, wikihow y varios conjuntos de embedding-data) hasta superar los 1.000 millones de pares. No se documenta en la informacion disponible ninguna fase de RLHF, DPO ni ajuste especifico para el dominio de salud materna pese al nombre del repositorio.

## Capacidades

- Generacion de embeddings de frases y parrafos cortos en un espacio denso de 384 dimensiones.
- Similitud semantica entre frases (cosine similarity sobre vectores normalizados).
- Busqueda semantica y recuperacion de informacion (retrieval) en ingles.
- Agrupamiento (clustering) de textos por similitud semantica.
- Funciona como encoder de soporte en pipelines de RAG para indexar y consultar documentos.
- Soporte de tool calling / function calling: no (es un encoder, no un modelo generativo).
- Soporte de agentes y razonamiento multi-paso: no.
- Capacidades multilingues: no, solo ingles.
- Capacidades especiales (vision, audio, thinking mode): no.

## Casos de uso

- Busqueda semantica en corpus documentales: el modelo indexa cada fragmento como vector de 384 dimensiones y recupera los mas cercanos a la consulta mediante similitud coseno, con coste computacional muy bajo por su tamano.
- Recuperador en un pipeline RAG: actua como componente de retrieval que selecciona los pasajes relevantes de una base de conocimiento antes de pasarlos a un modelo generativo; su ventana de 256 tokens obliga a fragmentar los documentos.
- Deduplicacion y agrupamiento de tickets o articulos: al proyectar textos en un espacio semantico comun, permite agrupar contenido equivalente con tecnicas de clustering como k-means sobre los embeddings.
- Clasificacion por similitud de intenciones: comparar la consulta del usuario con un conjunto de frases prototipo para enrutar peticiones en un sistema de atencion automatizada.
- Motor de recomendacion de contenido: calcular similitud entre el historial textual de un usuario y catalogos de articulos o preguntas para sugerir elementos afines.
- Deteccion de duplicados en bases de preguntas frecuentes: identificar preguntas formuladas de forma distinta pero con el mismo significado antes de fusionarlas.
- Preprocesado para moderacion o filtrado tematico: agrupar y etiquetar grandes volumenes de texto en ingles por cercania semantica a categorias predefinidas.

Advertencia de aplicacion: para un uso real en QA de salud materna seria imprescindible validar el modelo con datos clinicos propios, dado que la model card no aporta evidencia de ajuste especifico en ese dominio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La tabla de datasets de entrenamiento de la model card aparece truncada y no se incluyen metricas de evaluacion (por ejemplo MTEB, MMLU o metricas de retrieval especificas del dominio).

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 91 MB solo de pesos (22,7 M de parametros x 4 bytes), mas activaciones; en la practica por debajo de 1 GB.
- VRAM estimada en fp16: aproximadamente 45 MB de pesos, con precision reducida.
- GPU recomendadas: cualquier GPU moderna es suficiente; funciona igualmente bien en CPU. No requiere A100 ni H100.
- Cabe en cualquier GPU de consumo (GTX 1050, RTX 3060, RTX 4090) e incluso en dispositivos de borde; no requiere GPU dedicada.
- Opciones de despliegue: sentence-transformers, HuggingFace Transformers, Text Embeddings Inference (TEI), ONNX Runtime, llama.cpp no aplica (no es un modelo GGUF de generacion); es compatible con endpoints de HuggingFace.
- Latencia y throughput: no disponibles de forma oficial; dado el tamano y las 6 capas, se espera un throughput alto en lotes y latencia de milisegundos en CPU para frases cortas, aunque no se aporta medicion concreta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dimension embedding | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| jmuhire13/mamacare-qa-retriever | 22,7 M | 256 tokens | 384 | en | apache-2.0 | HuggingFace |
| sentence-transformers/all-MiniLM-L6-v2 | 22,7 M | 256 tokens | 384 | en | apache-2.0 | HuggingFace |
| sentence-transformers/paraphrase-MiniLM-L6-v2 | 22,7 M | 128 tokens | 384 | en | apache-2.0 | HuggingFace |
| BAAI/bge-small-en-v1.5 | 33 M | 512 tokens | 384 | en | MIT | HuggingFace |

Los tres modelos comparables son encoders de frases de tamano reducido. `all-MiniLM-L6-v2` es el modelo del que procede tecnicamente esta publicacion (misma arquitectura y misma model card). `paraphrase-MiniLM-L6-v2` comparte arquitectura pero esta ajustado para parafrasis. `bge-small-en-v1.5` ofrece mayor contexto (512 tokens) y una licencia distinta (MIT). No se dispone de datos de rendimiento comparado para `mamacare-qa-retriever` al no haberse publicado benchmarks.

## Limitaciones y advertencias

- La model card reproduce literalmente la de `all-MiniLM-L6-v2`; no documenta ningun ajuste para el dominio de salud materna ni para QA clinico, pese al nombre del repositorio. No debe asumirse un rendimiento especifico en ese dominio.
- Solo soporta ingles. El rendimiento en castellano u otros idiomas es bajo o nulo.
- La longitud de entrada se trunca a 256 word pieces; los textos mas largos pierden informacion.
- Al ser un encoder de retrieval, no genera texto y puede devolver recuperaciones irrelevantes si el corpus o la consulta difieren del dominio de entrenamiento.
- Riesgo de alucinacion: no aplica en el sentido generativo (no produce texto libre), pero si puede producir falsos positivos de similitud semantica que lleven a recuperar pasajes incorrectos.
- Sesgos: hereda los sesgos de los corpus de entrenamiento (StackExchange, Yahoo Answers, etc.), que estan dominados por contenido en ingles y de comunidades tecnicas.
- Licencia apache-2.0: permite uso comercial, pero el usuario debe verificar el cumplimiento de las licencias de los datos subyacentes si reutiliza el modelo para fines regulados.
- Para cualquier uso sanitario, seria necesario un proceso de validacion clinica independiente y auditoria de sesgos, ya que el modelo no aporta ninguna garantia de precision medica.
- Repositorio con cero descargas y cero likes: sin evidencia de uso en produccion ni de validacion por terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jmuhire13/mamacare-qa-retriever
- Modelo base: https://huggingface.co/nreimers/MiniLM-L6-H384-uncased
- Modelo de referencia all-MiniLM-L6-v2: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2
- Documentacion de sentence-transformers: https://www.SBERT.net
- Paper MiniLM: https://arxiv.org/abs/1904.06472
- Paper SimCSE: https://arxiv.org/abs/2104.08727
- Paper Sentence-BERT: https://arxiv.org/abs/1908.10084 (referencia general de la familia)
- Repositorio de entrenamiento original (script y configuracion de datos): disponible en la propia model card del modelo base, no incluido en la informacion proporcionada.
