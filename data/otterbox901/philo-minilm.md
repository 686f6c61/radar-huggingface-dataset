# otterbox901/philo-minilm

## Resumen

Philo MiniLM (v2) es un modelo de embeddings de frases especializado en una tarea concreta: dado un mensaje (una pregunta, una peticion de consejo, un desahogo o incluso una tonteria), devolver la cita filosofica que mejor encaje como *respuesta*. Lo desarrolla el usuario independiente otterbox901 y parte de `sentence-transformers/all-MiniLM-L6-v2`, un encoder BERT de 6 capas y 22,7 millones de parametros que produce vectores de 384 dimensiones.

El problema que resuelve es sutil: los embeddings genericos de frases agrupan por tema, de modo que "estoy nervioso por mi examen" queda cerca de citas sobre examenes y conocimiento, no de citas que funcionen como replica. Este modelo se ha afinado con aprendizaje contrastivo para que la cercania en el espacio vectorial signifique "buena respuesta" en lugar de "mismo tema". La busqueda se reduce a un producto escalar contra un corpus precalculado de citas.

Es relevante ahora porque demuestra un patron de bajo coste (fine-tuning de un MiniLM con pares sinteticos generados por un LLM) aplicable a sistemas de recomendacion semantica de nicho. La version v2 se entreno con mas del doble de datos que v1 y mejora en todas las metricas excepto en el modo "nonsense". La model card es inusualmente transparente sobre las limitaciones, lo que facilita una evaluacion realista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (MiniLM, 6 capas) |
| Parametros totales | 22.713.216 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 256 tokens (max_length de entrenamiento; el modelo base admite 256) |
| Tipos de cuantizacion | no disponible (pesos safetensors en fp32; cuantizacion a int8/fp16 posible via herramientas externas, no documentada por el autor) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un encoder BERT MiniLM de 6 capas con 384 dimensiones de salida. El pooling es mean-pooling sobre los tokens reales (ponderado por la mascara de atencion) seguido de normalizacion L2. Tanto los mensajes como las citas pasan por el mismo encoder, y la busqueda se realiza mediante producto escalar contra los embeddings de citas precalculados.

El entrenamiento uso un dataset generado sinteticamente: no existia un corpus de pares (mensaje, cita ideal), asi que se mostraron citas reales a Claude Haiku y se le pidio escribir mensajes realistas a los que cada cita respondiera perfectamente, en cuatro modos (pregunta, consejo, desahogo y nonsense), con filtrado por longitud, solapamiento de palabras y duplicados. v2 anade una segunda ronda de generacion sobre citas nuevas: 7.721 citas distintas y 90.378 pares en total (81.283 de entrenamiento y 9.095 de validacion), con 33.088 pares de pregunta, 25.028 de consejo, 24.660 de desahogo y 7.602 de nonsense. La funcion de perdida es InfoNCE con negativos en el lote (batch de 64, matriz de similitud 64x64, temperatura 0,05), con batches sin citas repetidas para evitar falsos negativos. Hiperparametros: AdamW, learning rate 2e-5, warmup lineal en el 10% inicial de pasos y decaimiento lineal, batch 64, max length 256. El schedule estaba fijado para 4 epocas (unos 5.080 pasos) y el entrenamiento se detuvo al final de la epoca 2 (unos 2.540 pasos, learning rate ~1,1e-5).

## Capacidades

- Generacion de embeddings de frases de 384 dimensiones, normalizados L2, listos para busqueda por similitud coseno o producto escalar.
- Recuperacion semantica orientada a "respuesta adecuada": dado un mensaje, devuelve la cita filosofica mas apropiada como replica.
- Cuatro modos de uso implicitos: pregunta, peticion de consejo, desahogo y nonsense (este ultimo con rendimiento deficiente, ver limitaciones).
- Compatible con `sentence-transformers` (pooling por defecto identico) y con `transformers` con pooling manual; ambos producen los mismos vectores (coseno > 0,9999).
- Compatible con text-embeddings-inference y endpoints de Hugging Face.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni generacion de texto: es exclusivamente un encoder de embeddings.
- Multilingue: no, solo ingles.

## Casos de uso

- **Aplicacion de citas filosoficas de respuesta**: dado un mensaje del usuario, calcular su embedding y buscar por producto escalar la cita mas cercana en un corpus precalculado de 34.793 citas. Es el caso de uso original del modelo y el unico para el que fue evaluado.
- **Chatbot de acompanamiento emocional ligero**: para mensajes de desahogo, el modelo recupera citas que funcionan como replica empatica; el Recall@5 en modo venting es del 7,4% sobre el corpus completo, suficiente si se combina con un router de intencion y una capa de reordenacion.
- **Sistemas de recomendacion de contenido semantico de nicho**: el patron (fine-tuning de MiniLM con pares sinteticos generados por un LLM) es reutilizable para recomendar aforismos, versiculos, refranes o fragmentos literarios a partir de consultas libres.
- **Prototipado rapido de busqueda semantica**: con 22,7 millones de parametros y 0,2 GB de repo, se puede desplegar en CPU o en una GPU consumer para validar una idea de recuperacion semantica antes de invertir en un modelo mayor.
- **Filtrado y enrutado por intencion en pipelines de NLP**: aunque el modelo no detecta nonsense de forma fiable, sus embeddings pueden alimentar un clasificador ligero aguas abajo que separe pregunta, consejo y desahogo.
- **Investigacion sobre sesgos de eco en embeddings**: el modelo documenta un fenomeno de "echo" (la cita elegida reformula el mensaje en lugar de responderlo) y sirve como caso de estudio reproducible sobre como los negativos aleatorios en InfoNCE favorecen el emparejamiento por tema.
- **Demo educativa de aprendizaje contrastivo**: con codigo de uso de menos de 15 lineas y pesos pequenos, es un ejemplo practico para ensenar pooling, normalizacion y busqueda vectorial.

## Benchmarks y rendimiento

Evaluacion sobre 9.095 mensajes de validacion contra el corpus completo de 34.793 citas, buscando la unica cita para la que se escribio cada mensaje:

| Metrica | all-MiniLM-L6-v2 (base) | philo-minilm v1 | philo-minilm v2 |
|---|---|---|---|
| Recall@1 | 2,2% | 3,6% | 3,9% |
| Recall@5 | 5,6% | 8,4% | 10,0% |
| Recall@10 | 7,5% | 11,8% | 13,7% |
| MRR | 0,041 | 0,065 | 0,074 |
| Rango mediano de la cita objetivo | 1.364 | 450 | 303 |

Recall@5 desglosado por modo:

| Modo (n) | base | v1 | v2 |
|---|---|---|---|
| Pregunta (3.353) | 9,7% | 14,8% | 16,3% |
| Consejo (2.536) | 3,4% | 5,1% | 6,9% |
| Desahogo (2.441) | 3,6% | 5,5% | 7,4% |
| Nonsense (765) | 0,9% | 0,9% | 0,5% |

En Recall@5, v2 supera a v1 en 1,5 puntos (IC 95% +1,0 a +2,0, bootstrap emparejado sobre citas). No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) porque el modelo no es generativo.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (22,7 millones de parametros, unos 91 MB de pesos); practicamente despreciable junto con el overhead del runtime.
- GPU recomendadas: cualquier GPU moderna sirve; el modelo no requiere A100 ni H100. Una RTX 4090 o incluso una GTX 1650 son mas que suficientes.
- Cabe en cualquier GPU consumer e incluso en CPU: es viable ejecutarlo en portatiles sin GPU dedicada para volumenes moderados.
- Opciones de despliegue: `sentence-transformers`, `transformers` con pooling manual, text-embeddings-inference (tag `text-embeddings-inference` presente en el repo), y endpoints de Hugging Face (tag `endpoints_compatible`). No se documenta soporte GGUF ni Ollama.
- Latencia y throughput: no disponibles en la informacion proporcionada. Por el tamano del modelo, se espera un throughput alto en GPU y aceptable en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Dimensiones | Contexto | Licencia | Enfoque |
|---|---|---|---|---|---|
| philo-minilm v2 | 22,7 M | 384 | 256 | Apache 2.0 | Recuperacion de citas como respuesta |
| all-MiniLM-L6-v2 (base) | 22,7 M | 384 | 256 | Apache 2.0 | Embeddings genericos de frases |
| philo-minilm v1 | 22,7 M | 384 | 256 | Apache 2.0 | Version anterior, menos datos |

La comparativa directa con el modelo base esta en la tabla de benchmarks: v2 casi duplica el Recall@5 del base (10,0% frente a 5,6%) y reduce el rango mediano de la cita objetivo de 1.364 a 303. Frente a v1, mejora en todas las metricas salvo en nonsense (0,5% frente a 0,9% en Recall@5). No se dispone de comparacion con otros modelos de recomendacion de citas porque no se han identificado alternativas publicas equivalentes en la informacion disponible.

## Limitaciones y advertencias

- **No maneja nonsense**: para mensajes sin sentido, la cita elegida pertenece al conjunto de 1.528 citas absurdas solo el 4,4% de las veces, exactamente su proporcion en el corpus (v1: 18,2%). La aplicacion Philo lo resuelve con un router de intencion separado (Qwen2.5-0.5B-Instruct congelado mas una cabeza entrenada) que no forma parte de este repositorio.
- **Tendencia al eco**: la cita mejor rankeada a menudo reformula el mensaje en lugar de responderlo. En validacion, la primera eleccion comparte 1,8 veces mas palabras de contenido con el mensaje que la respuesta prevista (v1: 2,1 veces). Los negativos aleatorios del InfoNCE hacen que coincidir en tema baste para ganar.
- **Solo ingles**: cualquier uso en castellano u otros idiomas queda fuera de su distribucion de entrenamiento.
- **Contexto corto**: 256 tokens maximos; mensajes largos se truncan.
- **Dataset sintetico no publicado**: los pares de entrenamiento no se distribuyen con el modelo, lo que limita la reproducibilidad exacta del fine-tuning.
- **Metricas absolutas bajas**: un Recall@5 del 10,0% sobre el corpus completo es bajo en terminos absolutos; el autor senala que muchas otras citas podrian ser respuestas validas y que las cifras subestiman la calidad real, pero en produccion conviene combinar con reordenacion y un router de intencion.
- **Licencia Apache 2.0**: permite uso comercial, pero el modelo hereda los sesgos del corpus de citas y de los datos sinteticos generados por Claude Haiku, no auditados.
- **Riesgo de alucinacion**: no aplica en el sentido generativo (no produce texto), pero si en el sentido de recuperacion: puede devolver una cita plausible pero inadecuada como respuesta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/otterbox901/philo-minilm
- Modelo base: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2
- Repositorio de sentence-transformers: https://github.com/UKPLab/sentence-transformers
- Documentacion de text-embeddings-inference: https://github.com/huggingface/text-embeddings-inference
