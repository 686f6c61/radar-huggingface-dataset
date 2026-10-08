# qnaug/embeddinggemma2-decision

## Resumen

embeddinggemma2-decision es un modelo de decision (clasificacion) desarrollado por el usuario qnaug sobre el codificador de texto de google/embeddinggemma-2, de aproximadamente 270 millones de parametros. A diferencia de un modelo generativo, no produce texto: recibe una entrada junto con un conjunto de preguntas y sus opciones, y en una sola pasada hacia delante devuelve una probabilidad calibrada para cada opcion. La cabeza sigue el diseno Clef, en el que los tramos de tokens de pregunta y opcion se agregan mediante mean pooling y se puntuan con un MLP pequeno.

El modelo esta pensado para tareas de enrutado y decision estructurada dentro de pipelines: clasificacion de tickets, asignacion a equipos, comprobaciones de si/no y puntuacion por niveles ordenados. Admite tres tipos de pregunta: `choice` (elegir entre opciones con nombre), `noul` (verdadero/falso) y `score` (niveles ordenados). Se distribuye bajo licencia Apache-2.0, solo en ingles, y esta entrenado sobre los conjuntos typed-decisions, BoolQ, MNLI, banking77 y CLINC150.

Su relevancia actual radica en que ofrece probabilidades calibradas (ECE de 0.029 y 0.039 tras calibracion en sus dos bloques de evaluacion) con un coste de inferencia muy bajo, lo que permite insertar decisiones automatizadas con umbral de confianza en lugar de recurrir a un LLM generativo para tareas de clasificacion cerrada. El repositorio ocupa 1,1 GB y el modelo es compatible con la libreria transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (codificador de texto de google/embeddinggemma-2) con cabeza de decision estilo Clef (mean pooling de tramos de tokens + MLP) |
| Parametros totales | ~270 millones (codificador base) mas la cabeza MLP |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el autor solo indica ejecutar en float32 o bfloat16, nunca float16) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo reutiliza el codificador de texto de google/embeddinggemma-2 (~270M parametros) como extractor de representaciones y le anade una cabeza de decision inspirada en el diseno Clef. En lugar de generar tokens, el modelo recibe en una unica pasada la entrada, las preguntas y sus opciones; los tramos de tokens correspondientes a cada pregunta y a cada opcion se agregan con mean pooling y se puntuan con un MLP pequeno que produce una probabilidad por opcion. Admite tres formatos de pregunta: `choice`, `noul` (verdadero/falso) y `score` (niveles ordenados).

Durante el entrenamiento se congelo el embedding del vocabulario del codificador base. Se utilizo entropia cruzada con etiquetas suaves (soft-label) para typed-decisions y etiquetas one-hot para el resto de conjuntos. En los conjuntos de intenciones se presentan la etiqueta dorada junto con distractores aleatorios, de modo que el modelo aprende a elegir entre listas de opciones arbitrarias. La calibracion se realiza mediante temperature scaling por fuente sobre una particion reservada (held-out). El autor distingue dos dominios de calibracion: `domain="extra"` (por defecto), con temperaturas calibradas sobre texto natural, y `domain="typed"`, calibradas sobre estado JSON como typed-decisions. No se documenta en la informacion disponible el numero total de tokens de entrenamiento ni si se aplicaron tecnicas como RLHF o DPO.

## Capacidades

- Clasificacion de decision con salida de probabilidad calibrada por opcion, en una sola pasada hacia delante.
- Tipos de pregunta soportados: `choice` (seleccionar una opcion con nombre), `noul` (verdadero/falso) y `score` (niveles ordenados).
- Seleccion entre listas de opciones arbitrarias, incluyendo distractores, gracias al entrenamiento sobre conjuntos de intenciones.
- Devuelve probabilidades calibradas, lo que permite aplicar umbrales de confianza para decidir cuando delegar o escalar una decision.
- No genera texto: es exclusivamente un modelo de clasificacion (`text-classification`).
- Soporte de dos modos de calibracion (`extra` y `typed`) segun el tipo de datos de entrada.
- Capacidades multilingues: no disponibles; el modelo esta entrenado unicamente con datos en ingles.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible como tal, aunque esta pensado para integrarse como componente de decision en pipelines.

## Casos de uso

- Enrutado de tickets de soporte: dado el texto de una incidencia, el modelo decide a que equipo derivarla (`choice`) usando instrucciones y criterios por equipo. Su salida calibrada permite desviar a revision humana cuando la confianza es baja.
- Deteccion de peticiones de reembolso: con una pregunta de tipo `noul`, clasifica si un cliente solicita un reembolso, como muestra el ejemplo de la model card para la factura duplicada.
- Clasificacion de intenciones en asistentes conversacionales: entrenado sobre banking77 y CLINC150, puede mapear la frase del usuario a una intencion concreta de un conjunto cerrado.
- Moderacion y filtrado con umbral: al ofrecer ECE bajo, se puede fijar un umbral de confianza (por ejemplo 0,8) para aceptar solo decisiones con alta precision sobre las atendidas y derivar el resto.
- Puntuacion por niveles ordenados: con preguntas de tipo `score`, asigna niveles ordenados (por ejemplo gravedad o prioridad) a descripciones de casos.
- Preprocesado de estado estructurado (JSON): con el dominio `typed`, procesa estado tipo JSON para decidir acciones dentro de un flujo automatizado.
- Clasificacion de texto general en ingles: al haber sido entrenado sobre BoolQ, MNLI, banking77 y CLINC150, sirve como clasificador multiple tarea base para experimentos con datos en ingles.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card (no se incluyen otros benchmarks en la informacion disponible).

| Conjunto (test) | Metrica | Valor |
|---|---|---|
| typed-decisions | Accuracy | 74,3% (aleatorio 31,8%, etiqueta mayoritaria 47,9%) |
| typed-decisions | ECE tras calibracion | 0,029 |
| boolq, mnli, banking77, clinc150 | Accuracy | 80,4% |
| boolq, mnli, banking77, clinc150 | ECE tras calibracion | 0,039 |

Umbrales de confianza sobre typed-decisions (test):

| Umbral de confianza | Decisiones atendidas | Precision sobre atendidas |
|---|---|---|
| 0,5 | 94,7% | 76,0% |
| 0,6 | 78,8% | 80,2% |
| 0,7 | 62,4% | 83,9% |
| 0,8 | 45,0% | 87,4% |
| 0,9 | 26,6% | 91,3% |

Umbrales de confianza sobre boolq, mnli, banking77 y clinc150 (test):

| Umbral de confianza | Decisiones atendidas | Precision sobre atendidas |
|---|---|---|
| 0,5 | 90,6% | 83,7% |
| 0,6 | 74,4% | 87,2% |
| 0,7 | 59,5% | 92,6% |
| 0,8 | 48,2% | 96,9% |
| 0,9 | 40,1% | 98,4% |

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un codificador de ~270M parametros, los pesos ocupan aproximadamente 540 MB en bfloat16 y unos 1,1 GB en float32 (estimacion a partir del tamano del modelo; el repositorio pesa 1,1 GB). El autor indica ejecutar en float32 o bfloat16, nunca float16.
- Cabe holgadamente en GPUs de consumo: cualquier GPU con 4 GB o mas de VRAM es suficiente para el modelo en bfloat16 o float32, incluidas RTX 3060, RTX 4060 y superiores.
- Tambien puede ejecutarse en CPU para cargas de baja concurrencia, dado el reducido tamano del modelo.
- GPU recomendadas para produccion segun concurrencia: no disponible de forma especifica; por tamano, no requiere A100 ni H100, salvo para lotes muy grandes o alta concurrencia.
- Opciones de despliegue: libreria transformers. El uso descrito requiere cargar `decision_model.py` del repositorio mediante `hf_hub_download`. No se documentan integraciones con vLLM, Ollama, llama.cpp ni TGI (el modelo no es generativo).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| qnaug/embeddinggemma2-decision | ~270M (codificador) + cabeza MLP | Modelo de decision (clasificacion) | no disponible | en | apache-2.0 | Hugging Face, transformers |
| google/embeddinggemma-2 (codificador base usado) | ~270M (variante de texto) | Embedding de texto | no disponible | no disponible | no disponible en la informacion | Hugging Face |
| EmbeddingGemma 2 (variante multimodal) | ~740M | Embedding multimodal (texto, imagen, audio, video) | no disponible | no disponible | no disponible en la informacion | Hugging Face / on-device (MediaPipe, LiteRT) |

No se dispone de datos de benchmarks de modelos comparables de decision directa en la informacion proporcionada, por lo que la comparacion se limita a parametros, tipo, licencia y disponibilidad.

## Limitaciones y advertencias

- Entrenado unicamente con datos en ingles. Otros idiomas, como el vietnamita, no han sido probados y la calibracion no se transfiere a ellos.
- La calibracion solo es valida para datos similares a las fuentes de entrenamiento; el autor recomienda recalibrar con unos cientos de ejemplos propios antes de confiar en las probabilidades.
- La comprension lectora de si/no sobre texto libre es el punto mas debil (boolq / mnli en torno al 70%).
- Las etiquetas de typed-decisions tienen bajo acuerdo entre anotadores, por lo que la precision tiene un techo muy por debajo del 100%.
- No genera texto: no sirve para tareas de generacion ni de resumen.
- Se debe ejecutar en float32 o bfloat16; en float16 el modelo base devuelve NaN.
- Licencias de los conjuntos de datos dispares: typed-decisions Apache-2.0, BoolQ CC BY-SA 3.0, banking77 CC BY 4.0, CLINC150 CC BY 3.0 y MNLI con licencia mixta; conviene revisarlas para el uso previsto.
- El modelo es un finetune de terceros (autor qnaug) sobre un modelo base de Google; a fecha de la informacion registra 0 descargas y 0 likes, por lo que no hay evidencia de uso en produccion por la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/qnaug/embeddinggemma2-decision
- Modelo base: https://huggingface.co/google/embeddinggemma-2
- Blog de Google DeepMind sobre EmbeddingGemma 2: https://deepmind.google/blog/embeddinggemma-2-an-open-lightweight-multimodal-embedding-model/
- Google Developers Blog (AI Edge con EmbeddingGemma 2): https://developers.googleblog.com/google-ai-edge-with-embeddinggemma-2/
- Pagina de EmbeddingGemma en Google DeepMind: https://deepmind.google/models/gemma/embeddinggemma/
- Documentacion de EmbeddingGemma en Google AI for Developers: https://ai.google.dev/gemma/docs/embeddinggemma
- Guia de EmbeddingGemma 2 (2026): https://cldnavi.com/en/blog/embeddinggemma-2-guide-2026/
