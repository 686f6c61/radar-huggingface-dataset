# goldenfox/decider-2b-onnx

## Resumen

goldenfox/decider-2b-onnx es la exportacion a formato ONNX del modelo Mapika/decider-2b, un modelo de decision de 2.000 millones de parametros perteneciente a la clase "System One" y construido sobre Qwen/Qwen3.5-2B-Base. No se trata de un modelo conversacional ni de generacion de texto libre: su tarea es emitir una decision tipada sobre un conjunto cerrado de opciones, devolviendo probabilidades calibradas en una sola pasada hacia adelante (one-pass).

Esta version concreta la publica el usuario goldenfox y esta optimizada para inferencia en el navegador mediante ONNX Runtime Web con el execution provider WebGPU (onnxruntime-web 1.30). La conversion se realizo con onnxruntime-genai 0.17.1 usando cuantizacion int8 RTN en los pesos (embeddings de tokens en fp16) y las opciones `prune_lm_head=true` y `exclude_mtp=true`, lo que elimina la cabeza de lenguaje y reduce el tamano a 3,0 GB de repositorio.

Su relevancia actual radica en que permite ejecutar un modelo de decision de 2B completamente en el cliente, sin servidor, reutilizando prefijos de prompt gracias a la exposicion de los estados recurrentes (Gated DeltaNet) y de la cache KV como entradas y salidas `past.*`/`present.*`. La ventana de contexto se fija en 8192 posiciones (max_position_embeddings) antes de la exportacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decodificador de la familia Qwen3.5, con estado recurrente Gated DeltaNet y cache KV expuestos como `past.*`/`present.*` |
| Parametros totales | Aproximadamente 2.000 millones (2B); el modelo base se construye sobre Qwen/Qwen3.5-2B-Base |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 8192 tokens (`max_position_embeddings` fijado antes de la exportacion, tamano de cache rotary) |
| Tipos de cuantizacion | int8 RTN en los pesos; embeddings de tokens mantenidos en fp16. El grafo devuelve logits solo para la ultima posicion de entrada |
| Idiomas soportados | La model card del modelo base indica ingles; la ficha de la exportacion ONNX no especifica lista de idiomas (no disponible) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX con datos externos partidos en ficheros de hasta 1.800.000.000 bytes; el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

El modelo base Mapika/decider-2b es una reproduccion abierta de la clase de modelos "System One" (asociada a Jev, de TypeSafe AI) y forma parte de una familia que incluye variantes de 2B sobre Qwen3.5-2B-Base, de 4B sobre Qwen3.5-4B-Base y una de 35B con mezcla de expertos sobre Qwen3.5-35B-A3B-Base. El proyecto se declara independiente y sin afiliacion ni respaldo de TypeSafe AI. El objetivo del ajuste es producir decisiones tipadas con probabilidades calibradas en una unica pasada, tal como indica la ficha del modelo original ("typed decisions with calibrated probabilities in one forward pass"). No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO: **no disponible**.

La exportacion ONNX no implica reentrenamiento alguno. Se genero con el model builder de onnxruntime-genai 0.17.1 aplicando `-p int8 -e webgpu` y las opciones extra `prune_lm_head=true exclude_mtp=true`, de modo que el grafo prescinde de la cabeza de lenguaje y solo calcula logits para la ultima posicion de la secuencia, que se leen sobre los tokens de las etiquetas y se dividen por la temperatura definida en `decider_config.json`. El formato de prompt es el del modelo original (`decider/prompt.py`), con estructura state-first: `Context:` / `Question:` / `Options:` / `Answer: (`. La innovacion tecnica principal de esta exportacion es la exposicion explicita de los estados recurrentes de Gated DeltaNet y de la cache KV como entradas y salidas, lo que permite calcular una vez un prefijo de prompt compartido y reutilizarlo en llamadas posteriores.

## Capacidades

- Decision de una sola pasada sobre un conjunto cerrado de opciones etiquetadas, con salida de probabilidades calibradas.
- Clasificacion de texto y salida estructurada (la ficha del modelo base lo etiqueta como `Text Classification`, `structured-output`, `multi-task`).
- Lectura de logits restringida a los tokens de las etiquetas: no genera texto libre, ya que la cabeza LM se poda en la exportacion.
- Reutilizacion de prefijo de prompt mediante los estados `past.*` / `present.*`, util para prompts con contexto compartido y opciones variables.
- Inferencia en navegador a traves de ONNX Runtime Web con WebGPU, y tambien en CPU mediante el execution provider CPU (fue el usado en la medicion de acuerdo).
- Soporte de tool calling o function calling: no aplica en esta exportacion (cabeza LM podada); no disponible en el modelo base segun la informacion recogida.
- Capacidades de agente y razonamiento multi-paso: no aplica; el modelo es de decision en un solo paso.
- Capacidades multilingues: la informacion disponible solo menciona ingles para el modelo base.
- Capacidades especiales: no se documentan modos de vision, audio ni modo "thinking" en la informacion disponible.

## Casos de uso

- Decision en agentes de juego: el propio autor valida el modelo con nueve prompts de juego, donde la eleccion de la opcion mas probable coincide con la del modelo original en fp32. Se usaria para seleccionar la accion mas probable entre un conjunto finito de jugadas, pasando el estado del juego como `Context:` y las jugadas como `Options:`.
- Enrutado de peticiones (routing) en arquitecturas multi-modelo: dado un prompt de usuario y una lista de modelos o herramientas candidatas como opciones, el modelo devuelve la probabilidad de cada una, lo que permite aplicar umbrales calibrados y derivar a un modelo grande solo cuando la confianza es baja.
- Clasificacion de intenciones en atencion al cliente: con las intenciones como etiquetas de opcion, se obtiene una distribucion de probabilidad sobre cada intencion en una sola pasada, aprovechando la ventana de 8192 tokens para incluir el historial de la conversacion como contexto compartido.
- Moderacion de contenido en el cliente: al ejecutarse en el navegador con WebGPU, el texto del usuario no necesita salir del dispositivo, lo que reduce requisitos de cumplimiento y coste de servidor en decisiones binarias o multiclase sencillas.
- Etiquetado por lotes y anotacion asistida: la reutilizacion del prefijo (`past.*`/`present.*`) permite calcular una vez un contexto largo y evaluar despues muchas opciones distintas sin recomputar el prefijo, lo que abarata el etiquetado masivo de candidatos.
- Seleccion de opciones en formularios y asistentes guiados: dado el estado de un formulario y las respuestas posibles, el modelo puntua cada alternativa y permite preseleccionar la mas probable manteniendo el control humano sobre la decision final.
- Evaluacion de preferencias en pares de respuestas: planteando dos respuestas como etiquetas de opcion, se obtiene una preferencia con probabilidad calibrada, util para filtrar candidatos antes de un juicio humano o de un modelo mayor.

## Benchmarks y rendimiento

La informacion disponible solo incluye la medicion de acuerdo entre esta exportacion ONNX y el modelo original en fp32 ejecutado con transformers, sobre nueve prompts de juego y con onnxruntime 1.30 y el execution provider CPU, medida el 30 de septiembre de 2026.

| Metrica | Resultado |
|---|---|
| Coincidencia en la opcion mas probable (top-1) | 9/9 identicas al modelo original en fp32 |
| Distancia de variacion total media | 0,011 |
| Distancia de variacion total maxima | 0,020 |
| Entorno de medida | onnxruntime 1.30, CPU EP, 9 prompts de juego |

No se han publicado resultados de benchmarks de capacidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ni cifras de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 2-2,5 GB con la cuantizacion int8 actual (estimacion basada en los 2B de parametros y en un repositorio de 3,0 GB con datos externos); en fp16 se situaria aproximadamente en 4-5 GB. El autor no publica cifras oficiales de memoria.
- GPU recomendadas: no especificadas por el autor. Cualquier GPU con soporte WebGPU y al menos 4 GB de VRAM dedicada deberia poder alojar la version int8; para lotes grandes o contextos largos conviene disponer de mas margen.
- Cabe en GPU de consumo: si, el objetivo del proyecto es precisamente la inferencia local y en navegador; tarjetas de gama media con 6-8 GB de VRAM son suficientes para la version int8.
- Ejecucion en CPU: verificada por el autor con onnxruntime 1.30 CPU EP en las pruebas de acuerdo.
- Opciones de despliegue: ONNX Runtime Web con WebGPU (onnxruntime-web 1.30) en navegador; onnxruntime / onnxruntime-genai en CPU o GPU; cualquier runtime compatible con el grafo ONNX exportado. No se documenta soporte directo en vLLM, TGI, llama.cpp u Ollama para este formato.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato y cuantizacion | Rendimiento | Licencia |
|---|---|---|---|---|---|
| goldenfox/decider-2b-onnx | ~2B | 8192 tokens | ONNX, int8 RTN con embeddings fp16, cabeza LM podada | 9/9 coincidencias top-1 y distancia de variacion total media de 0,011 frente al original en fp32 | Apache 2.0 |
| Mapika/decider-2b (origen) | ~2B | No disponible | Safetensors, precision original (fp32/fp16) | Referencia de comparacion; el export ONNX reproduce sus decisiones con la fidelidad indicada | Apache 2.0 |
| Mapika/decider-4b | ~4B | No disponible | No disponible | No disponible | No disponible |
| Qwen/Qwen3.5-2B-Base | ~2B | No disponible | Safetensors | No disponible; es el modelo base sobre el que se ajusta el decider, no un modelo de decision | No disponible en la informacion recogida |

La familia incluye ademas una variante de 35B con mezcla de expertos (Qwen3.5-35B-A3B-Base), sin datos de rendimiento en la informacion disponible.

## Limitaciones y advertencias

- No es un modelo generativo: `prune_lm_head=true` elimina la cabeza de lenguaje, por lo que solo emite logits de la ultima posicion sobre los tokens de las etiquetas. No sirve para generar texto libre ni para conversar.
- Requiere respetar exactamente el formato de prompt del modelo original (`Context:` / `Question:` / `Options:` / `Answer: (`) y la temperatura definida en `decider_config.json`; desviarse de ese formato invalida las probabilidades.
- El contexto maximo es de 8192 tokens; prompts mas largos no estan soportados por el grafo exportado.
- Riesgo de alucinacion: al tratarse de un clasificador de opciones cerradas, el modo de fallo tipico no es inventar texto, sino asignar probabilidades poco fiables a etiquetas fuera de la distribucion de entrenamiento. No se han publicado estudios de calibracion fuera de dominio.
- Sesgos conocidos: no documentados en la informacion disponible. Al estar ajustado principalmente en ingles, el comportamiento en otros idiomas es incierto.
- Cobertura idiomatica limitada: la model card del modelo base solo menciona ingles.
- Licencia Apache 2.0, que permite uso comercial y modificacion, siempre que se conserve el aviso de licencia y se cumplan las condiciones del texto. La ficha indica que se aplica la misma licencia que el modelo origen.
- Adopcion nula en el momento de la consulta: 0 descargas y 0 likes, lo que implica ausencia de validacion independiente por parte de la comunidad.
- Repositorio de 3,0 GB con datos externos partidos en ficheros de hasta 1.800.000.000 bytes; hay que descargar todos los fragmentos para que el grafo ONNX sea utilizable.
- Fechas de creacion y actualizacion muy proximas (30 de septiembre de 2026, con un minuto de diferencia), lo que sugiere una publicacion sin iteraciones posteriores documentadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/goldenfox/decider-2b-onnx
- Modelo base: https://huggingface.co/Mapika/decider-2b
- Repositorio del proyecto decider: https://github.com/Mapika/decider
- ONNX Model Zoo: https://github.com/onnx/models
- Modelos compatibles con la libreria ONNX en HuggingFace: https://huggingface.co/models?library=onnx
- Modelos de ONNX Runtime: https://onnxruntime.ai/models
