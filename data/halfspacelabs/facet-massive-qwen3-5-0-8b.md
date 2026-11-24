# halfspacelabs/facet-massive-qwen3.5-0.8b

## Resumen

Facet MASSIVE Qwen3.5 0.8B es un adaptador LoRA construido sobre el modelo base Qwen/Qwen3.5-0.8B, desarrollado por Halfspace Labs (Facet) para una tarea concreta: leer un comando corto de asistente de voz en ingles y devolver su intencion y sus slots en formato JSON. El modelo resuelve el problema de extraccion estructurada de intencion y ranuras (intent classification y slot filling) sobre el conjunto de datos MASSIVE 1.1 de Amazon, que define un catalogo cerrado de 60 intenciones y anotaciones de slots alineadas con el texto de entrada.

El interes del modelo no reside en su tamano, sino en el proceso de construccion y en la relacion calidad-coste que reporta el autor. Segun la model card, el adaptador se genero de forma casi autonoma a partir de un parrafo de instrucciones y el conjunto de entrenamiento de MASSIVE, sin edicion manual, con un coste de 1,53 USD y unos 70 minutos de extremo a extremo. Con solo 0,8 mil millones de parametros supera en acierto exacto (intencion y todos los slots correctos) a varios modelos Claude en la particion de test en-US de MASSIVE 1.1, segun los numeros publicados por el propio autor.

Es relevante ahora porque ejemplifica una tendencia practica: adaptar modelos pequenos con LoRA para tareas de extraccion estructurada donde un modelo frontera generalista es mas caro y menos consistente en las convenciones de anotacion. La ficha se basa exclusivamente en la informacion disponible en Hugging Face y en la model card; los datos no publicados se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer decoder-only (Qwen3.5 0.8B); detalles de la arquitectura base no disponibles |
| Parametros totales | No disponible (el adaptador ocupa 0,1 GB en el repositorio; el modelo base es de 0,8B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 (adaptador y modelo base); datos de entrenamiento MASSIVE bajo CC BY 4.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA entrenado con la libreria PEFT sobre Qwen/Qwen3.5-0.8B, un transformer decoder-only de 0,8 mil millones de parametros. No se dispone de informacion sobre la arquitectura interna del modelo base (atencion, capas, dimensiones) ni sobre la configuracion del adaptador (rango, alpha, modulos objetivo). El adaptador se carga con `AutoPeftModelForCausalLM` y el tokenizador se toma del modelo base.

El entrenamiento utilizo la particion de entrenamiento en-US de MASSIVE 1.1 (11.514 ejemplos), de los cuales se apartaron 659 por considerarse demasiado proximos a comandos de test, quedando 10.855 ejemplos efectivos. La construccion completa, incluyendo la redaccion de instrucciones y evaluaciones, la limpieza de datos y el entrenamiento, la realizo un agente de Facet sin edicion manual, en unos 70 minutos y con un coste de 1,53 USD. No se especifica el numero de tokens de entrenamiento, la composicion exacta del dataset tras la limpieza, ni si hubo RLHF o DPO. El modelo se entreno y evaluo con un system prompt concreto que el autor distribuye en `system_prompt.txt` y que debe usarse para reproducir el comportamiento.

## Capacidades

- Clasificacion de intencion sobre un catalogo cerrado de 60 intenciones de MASSIVE.
- Extraccion de slots con tipo y valor, copiando el valor literalmente del comando de entrada.
- Generacion de salida JSON estructurada con el esquema `{"intent": ..., "slots": [{"type": ..., "value": ...}]}`.
- Procesamiento de comandos cortos de asistente de voz en ingles (alarmas, calendario, musica, clima, etc., segun el catalogo de MASSIVE).
- Seguimiento de instrucciones mediante system prompt; el modelo fue entrenado y evaluado con un prompt de sistema concreto.
- No se documentan capacidades de tool calling, function calling generico, razonamiento multi-paso, agentes, vision, audio ni modo thinking.
- Capacidad multilingue limitada al ingles en-US.

## Casos de uso

- Enrutamiento de comandos en asistentes de voz: el modelo recibe una frase corta dictada por el usuario y devuelve la intencion y los slots en JSON, lo que permite despachar la peticion al servicio correspondiente (alarma, calendario, reproduccion de musica) sin un parser manual.
- Preprocesado de lenguaje natural en sistemas de domotica: integrado como primer paso de un pipeline, traduce comandos hablados en ingles a una estructura que el motor de reglas del hogar puede consumir, con valores de slot copiados literalmente para evitar reinterpretaciones.
- Extraccion de entidades en formularios conversacionales: en flujos de reserva o configuracion donde el usuario dicta fecha, hora y tipo de evento, el modelo rellena los campos estructurados directamente.
- Clasificacion de tickets o mensajes entrantes en un catalogo fijo de categorias: aunque entrenado con comandos de voz, el formato de salida (intencion de una lista cerrada) es reutilizable para triaje de baja latencia en dominios con taxonomia fija.
- Evaluacion comparativa de coste frente a modelos frontera: sirve como referencia para medir si un modelo pequeno adaptado supera a un modelo generalista en una tarea de extraccion con convenciones de anotacion especificas, usando el mismo esquema JSON.
- Despliegue en entornos con recursos limitados: al ser un adaptador sobre un modelo de 0,8B, puede ejecutarse en CPU o en GPU de gama baja para tareas batch de etiquetado de comandos, con un coste por inferencia muy bajo segun el autor.
- Generacion de datos etiquetados a escala: uso del modelo para preanotar comandos de voz en ingles con intencion y slots, que luego se revisan manualmente, aprovechando su bajo coste por inferencia.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card, sobre las 2.970 lineas puntuadas del test set MASSIVE 1.1 en-US. Un comando se considera correcto solo si la intencion y todos los slots coinciden exactamente.

| Modelo | Completamente correctos (de 2.970) | Intencion correcta | Slots exactos | Coste de 1.000 completamente correctos |
|---|---|---|---|---|
| Este modelo | 2.081 | 2.636 | 2.274 | 0,03 USD |
| Claude Haiku 5.5 | 1.522 | 2.546 | 1.741 | 0,55 USD |
| Claude Sonnet 5.5 | 1.709 | 2.591 | 1.909 | 8,01 USD |
| Claude Opus 5.5 | 1.932 | 2.644 | 2.117 | 14,94 USD |

Segun el autor, todos los modelos Claude recibieron las mismas instrucciones, esquema JSON y lista de intenciones a traves de OpenRouter, sin ejemplos de entrenamiento. En intencion aislada, Opus supera a este modelo en 8 aciertos; la diferencia principal se concentra en los slots, cuyas convenciones el adaptador aprendio del conjunto de entrenamiento. No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. El modelo base es de 0,8B parametros, por lo que en fp16 requiere aproximadamente 1,6 GB de pesos mas el overhead de activaciones y KV cache; el adaptador anade un consumo marginal.
- GPU recomendadas: no especificadas por el autor. Por tamano, cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente; tambien es viable en CPU para inferencia batch.
- Cabe en GPU consumer: si, dado el tamano del modelo base de 0,8B.
- Opciones de despliegue: carga mediante PEFT y Transformers (`AutoPeftModelForCausalLM`). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI; al ser un adaptador LoRA, requeriria fusion con el modelo base o soporte de adaptadores en el servidor de inferencia.
- Latencia y throughput estimados: no disponibles. El autor solo reporta coste por 1.000 respuestas correctas (0,03 USD), no latencias.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Facet MASSIVE Qwen3.5 0.8B | 0,8B (base) + adaptador LoRA | No disponible | Adaptador especializado en intencion y slots de MASSIVE | Apache 2.0 | Hugging Face (adaptador PEFT) |
| Claude Haiku 5.5 | No disponible | No disponible | Modelo generalista via API | Propietaria | API (OpenRouter) |
| Claude Sonnet 5.5 | No disponible | No disponible | Modelo generalista via API | Propietaria | API (OpenRouter) |
| Claude Opus 5.5 | No disponible | No disponible | Modelo generalista via API | Propietaria | API (OpenRouter) |

La comparativa se limita a los modelos incluidos en la model card. No se dispone de datos de otros adaptadores especializados comparables en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo solo realiza esta tarea y solo en ingles; el autor advierte que se esperan peores resultados con otros estilos de fraseo, otros idiomas u otros conjuntos de etiquetas.
- MASSIVE es un conjunto favorable para un modelo pequeno: comandos cortos y un catalogo fijo de 60 intenciones. El rendimiento fuera de esa distribucion no esta medido.
- El modelo debe usarse con el system prompt incluido en `system_prompt.txt`; cambiar el prompt puede degradar los resultados, ya que se entreno y evaluo con el.
- Riesgo de alucinacion en los valores de slot: aunque el diseno exige copiar el valor literalmente del comando, no se documentan garantias de que el modelo no genere valores inventados en entradas atipicas.
- Sesgos conocidos: no documentados en la model card. Al entrenarse sobre MASSIVE en-US, hereda las convenciones y posibles sesgos de anotacion de ese corpus.
- Restricciones de licencia: el adaptador es Apache 2.0, pero los datos de entrenamiento MASSIVE estan bajo CC BY 4.0; conviene revisar las obligaciones de atribucion si se redistribuye el modelo o derivados.
- Los resultados de benchmarks son los publicados por el autor; no se han verificado de forma independiente en la informacion disponible.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, lo que indica poca validacion externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/halfspacelabs/facet-massive-qwen3.5-0.8b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Articulo del autor sobre el proceso de construccion: https://halfspacelabs.com/writing/we-gave-facet-a-dataset-and-walked-away
- Sitio del autor (Facet): https://halfspacelabs.com
- Producto del autor: https://tryfacet.ai
- Dataset MASSIVE (GitHub de Amazon): https://github.com/alexa/massive
- Dataset MASSIVE en Hugging Face: https://huggingface.co/datasets/AmazonScience/massive
