# smolnikov/kivok-0.3b

## Resumen

Kivok 0.3B (Кивок, "asentimiento") es un modelo enco der de 321,9 millones de parametros desarrollado por Smolnikov / CapyAgent y publicado en HuggingFace. No es un modelo generativo: recibe un estado de situacion (`state`) y una pregunta tipada, y devuelve una distribucion de probabilidad sobre un conjunto cerrado de respuestas. Soporta tres formatos de consulta: `choice` (elegir entre hasta ~20 opciones descritas), `score` (valoracion en escala ordinal) y `noul` (si/no con probabilidad asociada).

El modelo esta disenado como componente de decision rapida dentro de arquitecturas de agentes: enrutado de habilidades o herramientas, triaje de tickets de soporte, deteccion de ataques de inyeccion de prompt, filtrado de spam o clasificacion de intencion. Sus probabilidades estan calibradas (ECE aproximado de 0,013 en su test interno), de forma que una confianza declarada del 80 % se corresponde con una tasa de acierto real cercana al 80 %.

Es relevante por su perfil de despliegue: con 321,9 M de parametros y un repositorio de 0,7 GB, funciona en CPU sin acelerador, con una latencia declarada de aproximadamente 0,05 s por decision. Se ofrece como primera etapa de un esquema en cascada junto a un modelo mayor (Migom 2B) para los casos en los que la confianza es baja.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (mmBERT-base) con cabezas de decision tipada |
| Parametros totales | 321.908.998 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ru, en |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `convaiinnovations/laya-multilingual` (licencia Apache-2.0), construido a su vez sobre el encoder `mmBERT-base` (licencia MIT). Kivok es, por tanto, un encoder transformer afinado, no un modelo decoder autorregresivo. Su salida no es texto sino una distribucion de probabilidad sobre opciones predefinidas, lo que lo situa en la categoria de clasificacion (`pipeline_tag: text-classification`) y lo aleja del comportamiento generativo.

El entrenamiento uso 50.651 ejemplos durante una sola epoca, con datos exclusivamente abiertos y de licencia permisiva para uso comercial, mas sintesis generada por modelos abiertos. Fuentes citadas: `LocalLLaMA/typed-decisions` y `tasksource/procedural-typed-decisions` (Apache-2.0); MASSIVE ru (CC BY 4.0); TERRa de Russian SuperGLUE (MIT); corpus de titulares y resenas de ai-forever (MIT, Apache-2.0); `A11Sunday/support-json-ru` y `nvidia/When2Call` (CC BY 4.0); datos de profesor de `Mapika/decider` (Apache-2.0); `DmitryKRX/anti_spam_ru` y `dmtrdr/russian_prompt_injections` (Apache-2.0); y `Nailyk14/prompt-safety-multilingual` filtrando solo filas Apache/MIT. En el 45 % de las preguntas se sustituyo la formulacion por una parafrasis como aumento de datos, con el objetivo de que el modelo dependa del significado y no de la forma literal de la pregunta. La version 0.2 introdujo dialogos con contexto y se reentreno desde la Laya original.

## Capacidades

- Decision tipada en tres formatos: `choice` (seleccion de una opcion entre una lista con descripciones, hasta unas 20), `score` (evaluacion en escala ordinal) y `noul` (respuesta si/no con probabilidad).
- Enrutado de habilidades o herramientas en agentes, incluida la opcion de responder que no se necesita ninguna habilidad.
- Clasificacion de intencion del usuario.
- Triaje de solicitudes de soporte (por ejemplo, distinguir entre restablecimiento de contrasena y facturacion).
- Deteccion de ataques al asistente o inyeccion de prompt.
- Filtrado de spam.
- Evaluacion de peligrosidad de comandos de shell.
- Probabilidades calibradas (ECE 0,013 en su test interno), utilizables como senal de confianza para derivar a un modelo mayor.
- Ejecucion local en CPU, sin dependencia de la nube.
- Idiomas: ruso e ingles.

Limitaciones funcionales relevantes: el modelo no genera texto, no mantiene conversaciones por si mismo ni ejecuta herramientas; solo emite distribuciones de probabilidad sobre opciones cerradas.

## Casos de uso

- Enrutado de herramientas en agentes: dado el estado de la conversacion y un catalogo de herramientas disponibles, el modelo devuelve la probabilidad de cada una, incluyendo la opcion "ninguna". Con 0,05 s por decision y ejecucion en CPU, permite decidir el siguiente paso sin coste de GPU.
- Triaje de tickets de soporte: clasificar una solicitud entrante (contrasena, facturacion, etc.) en funcion de su descripcion. El modelo reporta un 80,7 % de acierto en esta tarea segun su propia evaluacion.
- Deteccion de inyeccion de prompt: marcar entradas que intentan manipular al asistente (100 % en ruso, 97,7 % con preguntas parafraseadas) como filtro previo a un LLM de mayor tamano.
- Moderacion de spam: clasificar mensajes como spam o no spam (96,0 % declarado en ruso) dentro de un pipeline de moderacion.
- Clasificacion de intencion previa a la respuesta: alimentar un agente conversacional con una etiqueta de intencion (86-90 % en MASSIVE ru) antes de invocar al modelo generativo.
- Control de seguridad en ejecucion de comandos: evaluar si un comando de shell es peligroso (93,5 % declarado) antes de permitir su ejecucion en un entorno de automatizacion.
- Cascada con un modelo mayor: usar Kivok como primera etapa y derivar a Migom 2B unicamente los casos con baja confianza, reduciendo el coste de inferencia en produccion.
- Enrutado de habilidades en catalogos desconocidos: seleccionar el skill adecuado en catalogos no vistos durante el entrenamiento (87,6 % declarado), util en plataformas con catalogos que cambian con frecuencia.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre un conjunto de validacion de 5.538 preguntas procedentes de partes retenidas de las fuentes de entrenamiento: 83,1 % de acierto y ECE de 0,013. Con las preguntas parafraseadas, el acierto se mantiene en 83,0 %.

| Tarea | Acierto |
|---|---|
| Eleccion de habilidad en catalogos no vistos en entrenamiento | 87,6 % |
| Necesidad de habilidad (si/no) | 93-94 % |
| Ataques al asistente (ru) | 100 % (97,7 % con pregunta parafraseada) |
| Spam (ru) | 96,0 % |
| Intencion del usuario (MASSIVE ru) | 86-90 % |
| Peligrosidad de comando shell | 93,5 % |
| Solicitudes de soporte (ru) | 80,7 % |

Benchmark RuDecide v0.1 (ruso), comparacion con otros modelos de decision:

| Modelo | Track A: tareas desconocidas, acc / skill | Track B: tareas de agentes, acc / skill |
|---|---|---|
| Jev (TypeSafe, via API) | 87,1 / 79,6 | 84,6 / 75,1 |
| Migom 2B | 78,9 / 65,9 | 96,1 / 94,6 |
| decider-2b v11 | 78,6 / 65,4 | 75,7 / 62,1 |
| JevK5-2B v0.2 | 70,8 / 51,8 | 69,4 / 51,1 |
| Kivok 0.3B v0.2 | 50,5 / 17,4 | 92,3 / 89,7 |
| Kivok 0.3B v0.1 | 51,4 / 18,9 | 91,1 / 88,0 |
| Laya-multilingual | 48,9 / 14,8 | 53,6 / 35,6 |

El propio autor senala que en tareas desconocidas que requieren razonamiento y conocimiento del mundo (track A), Kivok no supera de forma clara a su modelo base (50,5 frente a 48,9 de acierto). Su ventaja se concentra en tareas similares a las de entrenamiento (track B).

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de los 321,9 M de parametros, no declarada por el autor): en torno a 1,3 GB en fp32, 0,65 GB en fp16 y 0,32 GB en int8. El repositorio publicado ocupa 0,7 GB.
- El autor indica que el modelo funciona en CPU sin necesidad de GPU, con una latencia aproximada de 0,05 s por decision.
- GPU recomendadas: no disponibles. Por tamano, cualquier GPU consumer moderna (por ejemplo, RTX 3060 o superior) es sobradamente suficiente, e incluso innecesaria.
- Cabe en cualquier GPU consumer y en equipos sin GPU dedicada.
- Opciones de despliegue: el modelo se carga mediante la libreria `laya` (`pip install laya`) junto con `huggingface_hub`. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: aproximadamente 0,05 s por decision en CPU segun el autor. No se especifica throughput en lote.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | RuDecide track A (acc) | RuDecide track B (acc) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Kivok 0.3B v0.2 | 321,9 M | no disponible | 50,5 | 92,3 | Apache-2.0 | HuggingFace |
| Migom 2B | ~2 B | no disponible | 78,9 | 96,1 | no disponible en la informacion | HuggingFace |
| decider-2b v11 | ~2 B | no disponible | 78,6 | 75,7 | no disponible en la informacion | HuggingFace |
| JevK5-2B v0.2 | ~2 B | no disponible | 70,8 | 69,4 | no disponible en la informacion | HuggingFace |
| Jev (TypeSafe) | no disponible | no disponible | 87,1 | 84,6 | no disponible en la informacion | via API |
| Laya-multilingual | ~0,3 B (modelo base) | no disponible | 48,9 | 53,6 | Apache-2.0 | HuggingFace |

La ventaja de Kivok frente a las alternativas de 2 B en el track B (92,3 frente a 96,1 de Migom) se obtiene con un modelo aproximadamente seis veces mas pequeno, desplegable en CPU. En el track A, cualquier alternativa de mayor tamano lo supera de forma clara.

## Limitaciones y advertencias

- Rendimiento limitado en tareas desconocidas: en el track A de RuDecide obtiene un 50,5 % de acierto, practicamente identico al 48,9 % de su modelo base. No aporta capacidad de razonamiento ni conocimiento del mundo.
- El modelo no genera texto: no puede usarse como asistente conversacional ni para redactar respuestas. Su salida es siempre una distribucion sobre opciones predefinidas.
- En solicitudes de soporte el acierto declarado es del 80,7 %, el mas bajo de sus tareas evaluadas; conviene revisar ese caso de uso antes de desplegarlo en produccion.
- El acierto en necesidades de habilidad (si/no, 93-94 %) sugiere que desviar a un modelo mayor entre el 6 % y el 7 % de los casos es un coste estructural del esquema en cascada, no un error puntual.
- Cobertura idiomatica reducida: solo ruso e ingles. No se declara soporte para castellano ni para otras lenguas.
- El repositorio presenta una discrepancia temporal: la fecha de creacion indicada es 2026-09-26. No se dispone de informacion adicional que la explique.
- El modelo tiene 0 descargas y 1 like en el momento de redactar esta ficha, por lo que no existe validacion independiente de los resultados declarados.
- Parte de los datos de entrenamiento son sinteticos (incluidos dialogos generados con DeepSeek), lo que puede introducir sesgos propios del generador.
- Licencia Apache-2.0, que permite uso comercial. El modelo base (Laya multilingual) es tambien Apache-2.0 y el encoder subyacente (mmBERT-base) es MIT; el autor remite al fichero `NOTICE` para los detalles de atribucion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/smolnikov/kivok-0.3b
- Modelo base: https://huggingface.co/convaiinnovations/laya-multilingual
- Dataset de evaluacion RuDecide v0.1: https://huggingface.co/datasets/smolnikov/RuDecide
- Modelo asociado de mayor tamano, Migom 2B: https://huggingface.co/smolnikov/migom-2b
