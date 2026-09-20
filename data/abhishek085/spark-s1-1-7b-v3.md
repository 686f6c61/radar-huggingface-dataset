# abhishek085/spark-s1-1.7b-v3

## Resumen

spark-s1-1.7b-v3 es un modelo de decisión "System One" publicado por el usuario abhishek085 en el marco de la comunidad Nokast AI (proyecto open-spark-Jev). No es un modelo generativo: responde preguntas tipadas sobre un estado (elección entre opciones definidas en tiempo de petición, pregunta booleana y puntuación ordenada) devolviendo una distribución de probabilidad completa por opción más una confianza, todo ello en un único forward pass y sin decodificar texto. Se construye sobre el backbone causal Qwen/Qwen3-1.7B, afinado con LoRA de rango 16 fusionado en los pesos finales, con 1.720.574.976 parámetros y licencia Apache-2.0.

El interés del modelo está en su contrato de uso: en lugar de generar una respuesta en lenguaje natural, restringe los logits del primer token de respuesta a los tokens de letra de opción (A..Z), los divide por una temperatura por tipo de pregunta y aplica softmax. Esa distribución es la respuesta. Esto elimina la decodificación autoregresiva y permite latencias muy bajas: 29,6 ms de p50 en un conjunto de 60 filas con batch 1 sobre una DGX Spark, frente a los 421,6 ms registrados para Jev (medición alojada, con red incluida, por lo que la comparación no es homogénea).

Es relevante para quienes despliegan agentes o pipelines de automatización donde hace falta una decisión rápida y con confianza numérica sobre opciones definidas en tiempo de ejecución, en lugar de texto libre. Ahora bien, el propio autor advierte de que se entrenó con menos de mil filas, de que solo la cabeza de elección tiene temperatura calibrada y de que no debe usarse como única puerta de decisión en acciones de alto impacto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (Qwen3) con adaptadores LoRA r16 fusionados; lectura de respuesta por logits restringidos a tokens de letra de opcion |
| Parametros totales | 1.720.574.976 (~1,72 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (no se especifica en la model card) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors; no se documentan GGUF, AWQ ni GPTQ) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers); tamano del repositorio 3,5 GB |
| Modelo base | Qwen/Qwen3-1.7B |
| Pipeline declarado | text-classification |
| Dataset de entrenamiento | abhishek085/spark-s1-osdg-v1 |

## Arquitectura y entrenamiento

El modelo es un Qwen3 causal LM estandar de 1,7 B de parametros al que se le ha aplicado un ajuste supervisado con LoRA de rango 16, posteriormente fusionado en los pesos publicados. No hay decodificacion generativa: el estado se renderiza una sola vez, cada pregunta se adjunta como un menu con definiciones de opciones (formato `A. ...`, `B. ...`), se anade la cabecera de asistente de Qwen3 en modo no-thinking y se leen los logits del primer token de respuesta restringidos a los tokens de letra (`A`..`Z`). Esa distribucion se divide por una temperatura por tipo de pregunta y se normaliza con softmax. La implementacion de la lectura corresponde al repositorio open-spark-jev (`open_spark_jev.model.MenuScorer`, `open_spark_jev/serve`). El fichero `calibration.json` contiene las temperaturas: 4,367 para eleccion (ajustada sobre un split de calibracion reservado) y 1,0 para booleana y puntuacion (sin ajustar).

El entrenamiento consistio en 3 epocas de LoRA r16 con perdida de entropia cruzada mas un regularizador de Brier, sobre el split de entrenamiento de 967 filas de os-datagen, mostrando cada fila de eleccion tambien en 4 ordenes aleatorios de opciones, lo que da 4.277 ejemplos. Las etiquetas provienen de codigo (motores de politicas, solvers y mundos controlados), no de un juez LLM. No se utilizaron datos de riesgo de tool-call. La model card indica que no se entreno con RLCD y que la calibracion basada en resultados (outcome-based calibration) esta planificada sobre un conjunto de datos mayor.

## Capacidades

- Respuesta a preguntas de eleccion multiple con opciones definidas en tiempo de peticion, devolviendo una probabilidad por opcion.
- Respuesta a preguntas booleanas (si/no).
- Puntuacion ordenada (score) sobre opciones.
- Salida de confianza asociada a la decision en el mismo forward pass, sin generacion de texto (el modelo nunca explica su respuesta).
- Funcionamiento como clasificador binario o multietiqueta cuando las etiquetas se expresan como opciones de un menu.
- Modo de un solo forward pass, sin decodificacion autoregresiva ni tokens generados.
- Capacidad declarada en la model card pero con rendimiento flojo: enrutamiento de siguiente accion en agentes, puntuacion de urgencia, puertas de retrieval y de terminacion, y suficiencia de respuesta (entre 2 y 12 filas de test por paquete, con ruido).
- Deteccion de prompt injection: la exactitud es aceptable segun el autor, pero las probabilidades no estan calibradas.
- Capacidades multilingues: no, solo ingles.
- No dispone de tool calling generativo, vision, audio ni modo thinking.

## Casos de uso

- Enrutamiento de acciones en agentes: dado un estado (historial, memoria, herramientas disponibles) y un menu de acciones candidatas, el modelo devuelve la distribucion de probabilidad sobre cada accion en 29,6 ms de p50 con batch 1, lo que permite insertarlo en el bucle de control de un agente sin anadir latencia perceptible. El autor advierte de que esta tarea es una de las mas debiles por falta de datos.
- Puerta de decision binaria en pipelines automatizados: por ejemplo, decidir si un documento cumple una politica antes de continuar el flujo. Es adecuado por coste y latencia, pero la probabilidad booleana no esta calibrada, por lo que debe combinarse con umbrales conservadores o con una segunda comprobacion.
- Triaje de contenido con categorias definidas en tiempo de ejecucion: en lugar de reentrenar un clasificador por cada taxonomia, se definen las opciones en el prompt y se lee el reparto de probabilidad, lo que reduce el coste de mantenimiento cuando las categorias cambian con frecuencia.
- Priorizacion por score ordenado: asignar un nivel de urgencia o prioridad a una incidencia dentro de una escala definida en la peticion, usando la distribucion sobre las etiquetas de la escala para alimentar un sistema de colas.
- Anotacion asistida y revision humana: al devolver una distribucion completa en lugar de una etiqueta unica, permite a un revisor humano ver los casos ambiguos (probabilidades repartidas) y priorizar su atencion.
- Deteccion de prompt injection como filtro previo: el modelo puede marcar entradas sospechosas antes de que lleguen a un LLM mayor, aunque sus probabilidades no son fiables como medida de confianza y debe usarse con umbrales validados en datos propios.
- Evaluacion de decisiones en entornos controlados o simulados: al etiquetar datos mediante solvers y motores de politicas, encaja en pruebas A/B de politicas donde la decision debe ser reproducible y barata de ejecutar en lote.
- Inferencia en el borde o en CPU/GPU de gama baja: con 1,72 B de parametros y sin decodificacion, es viable ejecutarlo localmente en escenarios de privacidad estricta donde no se puede llamar a una API externa.

## Benchmarks y rendimiento

| Medida | Valor |
|---|---|
| Conjunto de 60 filas de tool-call (revision final) | 0,783 (Jev, registrado: 0,917) |
| os-datagen, test bloqueado / challenge | 0,603 / 0,694 |
| Kev decision-v1 / transfer-v4 (externos, sin solapamiento de entrenamiento) | 0,700 / 0,635 |
| Jev-directory (70 preguntas) | 0,557 |
| Deteccion de codigo vulnerable (suite externa) | 0,56 (cercano al azar) |
| Latencia p50, conjunto de 60 filas, batch 1, una DGX Spark | 29,6 ms (Jev registrado: 421,6 ms, alojado con red incluida) |

Notas del autor: el conjunto de 60 filas tiene n=60 (un error estandar de aproximadamente 5 puntos) y los fallos por fila de modelos anteriores se inspeccionaron antes de esta escalera de evaluacion, por lo que debe tratarse como una comprobacion final blanda. La latencia de Jev es un numero registrado en modo alojado e incluye la red, por lo que las ratios de velocidad no son comparables en igualdad de condiciones. No se publican resultados de MMLU, HumanEval, GSM8K ni benchmarks generativos, ya que el modelo no genera texto.

## Requisitos de hardware

- Pesos en bf16/fp16: aproximadamente 3,4 GB (el repositorio ocupa 3,5 GB). Estimacion de VRAM en inferencia con activaciones y overhead: 4-6 GB.
- Cuantizacion int8 (no publicada, conversion propia): aproximadamente 1,7 GB de pesos, 2,5-3 GB de VRAM estimados.
- Cuantizacion int4 (no publicada, conversion propia): aproximadamente 0,9 GB de pesos, 1,5-2 GB de VRAM estimados.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas (RTX 3060 12 GB, RTX 4060 8 GB, RTX 4070, RTX 4090), y previsiblemente en GPUs integradas o CPU con cuantizacion agresiva.
- GPU de datacenter: A100, H100 y DGX Spark estan sobredimensionadas para este tamano; el propio autor reporta la medicion de latencia sobre una DGX Spark.
- Despliegue: la libreria declarada es transformers; la lectura de respuestas y el API `POST /v1/decide` los proporciona el repositorio open-spark-jev (`open_spark_jev.model.MenuScorer` y `open_spark_jev/serve`). Los tags incluyen `text-embeddings-inference` y `endpoints_compatible`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia: p50 de 29,6 ms con batch 1 sobre un conjunto de 60 filas en una DGX Spark. No se publica throughput ni latencia en otros lotes o hardwares.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Resultado conjunto 60 filas tool-call | Latencia p50 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| spark-s1-1.7b-v3 | 1,72 B | no disponible | 0,783 | 29,6 ms (batch 1, DGX Spark) | Apache-2.0 | HuggingFace (transformers + open-spark-jev) |
| Jev (referencia citada en la model card) | no disponible | no disponible | 0,917 (registrado) | 421,6 ms (registrado, alojado con red) | no disponible | no disponible |
| Qwen/Qwen3-1.7B (backbone) | 1,72 B | no disponible en la informacion proporcionada | no disponible (modelo generativo, no evaluado en esta tarea) | no disponible | Apache-2.0 | HuggingFace |

No se dispone de datos publicados de otras alternativas de la misma categoria (modelos de decision de un solo forward pass) en la informacion proporcionada. La comparacion directa con Jev es la unica disponible, y las condiciones de medicion no son equivalentes en latencia.

## Limitaciones y advertencias

- Entrenado con menos de mil filas (967 en el split de entrenamiento): el rendimiento es debil en enrutamiento de siguiente accion en agentes, puntuacion de urgencia, retrieval, puertas de terminacion y suficiencia de respuesta (2-12 filas de test por paquete, con ruido).
- La deteccion de codigo vulnerable esta practicamente al nivel del azar (0,56 en la suite externa).
- Las probabilidades de las preguntas booleanas y de puntuacion no estan calibradas: solo la cabeza de eleccion tiene temperatura ajustada (4,367). Una respuesta booleana o de score incorrecta puede llegar acompanada de una confianza cercana a 1,0.
- La precision en deteccion de prompt injection es aceptable segun el autor, pero sus probabilidades no estan calibradas (temperatura binaria sin ajustar).
- El modelo nunca explica sus respuestas y su salida depende por completo del estado y de las definiciones de opciones que se le proporcionen; no se puede auditar el razonamiento.
- No debe usarse como unica puerta de decision en acciones de alto impacto; el autor recomienda calibrarlo con resultados etiquetados propios.
- No esta entrenado con RLCD; la calibracion basada en resultados esta planificada pero no implementada en esta version.
- Idioma: solo ingles. No hay soporte multilingue declarado.
- No se especifica la longitud de contexto en la model card.
- Licencia Apache-2.0 en los pesos y en el backbone Qwen3-1.7B, pero los datos de entrenamiento se generaron y verificaron con Gemma-4-26B-A4B, Qwen3.6-35B-A3B y Qwen3.6-27B segun la tarjeta del dataset, por lo que conviene revisar los terminos de esos modelos antes de un uso comercial.
- El modelo no genera tool calls: la tag de agentes se refiere a su uso como componente de decision, no a capacidad de function calling.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/abhishek085/spark-s1-1.7b-v3
- Dataset de entrenamiento: https://huggingface.co/datasets/abhishek085/spark-s1-osdg-v1
- Repositorio open-spark-jev (lectura de respuestas y API `POST /v1/decide`): https://github.com/abhishek085/open-spark-jev
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Benchmarks detallados (BENCHMARKS.md, B27 y B29-B31, dentro del repositorio open-spark-jev): https://github.com/abhishek085/open-spark-jev
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo; los enlaces encontrados no guardan relacion con la ficha.
