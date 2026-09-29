# smutuvi/sikia-interviewer-lora-v4

## Resumen

Sikia interviewer v4 es un adaptador LoRA (PEFT) entrenado sobre el modelo base google/gemma-4-E2B-it, publicado por el usuario smutuvi. No es un modelo completo: es un ajuste fino de bajo rango, de unos 0,1 GB, que se carga sobre los pesos originales de Gemma 4 E2B. Su funcion es muy concreta: en una entrevista de encuesta offline, lee la respuesta dictada o transcrita de una persona encuestada y devuelve una unica respuesta breve en JSON.

El diseno sigue el patron Sikia: la aplicacion dirige la entrevista (orden de preguntas, logica de salto, rondas repetidas, repreguntas y todo lo que se locuta) y el modelo solo escucha. En cada llamada recibe un fichero de instrucciones fijo (`instructions.txt`) mas una tarjeta corta con la pregunta actual, sus opciones, rangos y lo que ha dicho la persona entrevistada; devuelve un objeto JSON con el acto de habla detectado (`answer`, `clarify`, `skip_request`, `impatient`, `correction`, `off_topic`), el valor normalizado y, en este diseno, un campo `say` siempre vacio.

Es relevante porque aborda un problema practico de la investigacion de campo sin conectividad: convertir lenguaje natural hablado, en swahili o ingles, en respuestas estructuradas para formularios de encuesta. Esta en estado de piloto de investigacion: probado con respuestas reales de judias (tricot) en swahili y con entrevistas redactadas, pero explicitamente no apto todavia para recogida de datos reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer multimodal de Gemma 4 E2B; arquitectura interna del modelo base no detallada en la informacion disponible |
| Parametros totales | no disponible (adaptador LoRA; el repositorio ocupa 0,1 GB) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible para el adaptador; el ejemplo oficial carga el modelo base en bfloat16 |
| Idiomas soportados | swahili (sw), ingles (en) |
| Licencia | gemma (licencia de Gemma; requiere aceptar la licencia en Hugging Face) |
| Formato de pesos | safetensors (adaptador LoRA/PEFT) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre google/gemma-4-E2B-it mediante PEFT. En el ejemplo oficial se carga el base con `AutoModelForImageTextToText` en bfloat16 y `device_map="auto"`; despues se superpone el adaptador con `PeftModel.from_pretrained`. La generacion se hace sin muestreo (`do_sample=False`), con `max_new_tokens=80` y `enable_thinking=False`. El adaptador no sustituye al modelo base ni lo modifica: necesita los pesos originales.

El entrenamiento uso aproximadamente 6.000 ejemplos, cuyo contenido no se ha publicado porque incluye lo que dijeron los agricultores. La composicion es un 38 % de habla real (respuestas etiquetadas a mano de ensayos de judias en swahili, tipo gustar/no gustar por variedad, con repreguntas, divididas por agricultor con identificadores de agricultor y grabacion convertidos en hashes unidireccionales) y un 62 % de entrevistas redactadas en swahili e ingles sobre formularios de hogar, cultivos, comerciante de semillas, agente de extension, escuela, precio de mercado y dinero movil, cubriendo todos los tipos de pregunta y respuesta; estas ultimas fueron redactadas por un asistente de IA y estan pendientes de revision por hablantes nativos. Se dejaron integramente fuera del entrenamiento los formularios de ganaderia y acceso a clinica, y se uso el de dinero movil como validacion. No se documentan en la informacion disponible detalles como el rango del LoRA, el tamano del dataset en tokens, el uso de RLHF o DPO, ni innovaciones de atencion o decodificacion.

## Capacidades

- Generacion de JSON corto y determinista como unica salida: los campos devueltos dependen del tipo de tarjeta.
- Clasificacion del acto de habla de la persona encuestada en seis categorias: `answer`, `clarify`, `skip_request`, `impatient`, `correction` (respuesta anterior) y `off_topic`.
- Interpretacion de preguntas de seleccion simple y multiple, numero entero, decimal, fecha y texto libre, devolviendo el valor normalizado (por ejemplo, numeros de opcion como "2 5").
- Control de flujo conversacional: responde `{"act": "yes"/"no"/"clarify", "say": ""}` a tarjetas `CURRENT: yes/no` usadas para decidir otra ronda o saltar una pregunta.
- Division de listas habladas en elementos (`TASK: list items`), manteniendo las palabras de la persona encuestada.
- Comprobacion de repreguntas (`TASK: probe`) con devolucion de `new_items`, `goal_met` y `follow_up`; `goal_met` solo es verdadero cuando el objetivo declara un minimo y ya se han escuchado suficientes puntos.
- Multilingue en swahili e ingles dentro de la misma tarea.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso mas alla del ciclo tarjeta-respuesta.
- El modelo base se carga con una clase de imagen-texto, pero en este adaptador solo se documenta uso de texto; no se documentan capacidades de vision evaluadas.
- Modo thinking desactivado en el uso previsto (`enable_thinking=False`).
- La transcripcion de voz es un paso separado: la realiza el modelo base con el adaptador desactivado, o el modelo de voz ndizi; un adaptador por habilidad.

## Casos de uso

- Entrevistas de encuesta offline en swahili: el adaptador convierte cada respuesta dictada sobre ensayos de judias en un JSON con opciones numericas y valores normalizados, lo que permite grabar encuestas sin conectividad en campo.
- Formularios socioeconomicos y agricolas multitema: al estar entrenado con formularios de hogar, cultivos, comerciante de semillas, agente de extension, escuela, precio de mercado y dinero movil, puede interpretar respuestas de cualquiera de esos tipos de pregunta.
- Extraccion de listas habladas: una persona enumera variedades, insumos o problemas y el modelo devuelve `{"items": [...]}` en sus propias palabras, listo para almacenar como texto libre estructurado.
- Repreguntas guiadas por objetivos de investigacion: con `TASK: probe` el modelo indica si ya se han recogido suficientes puntos respecto a un objetivo declarado, lo que permite a la aplicacion decidir cuando dejar de insistir.
- Deteccion de calidad de la respuesta: la clasificacion en `skip_request`, `impatient`, `correction` u `off_topic` permite a la app activar logica de repeticion, aclaracion o salto sin que el modelo locute nada.
- Correccion de respuestas previas: cuando la persona se corrige, el modelo lo marca como `correction` en lugar de sobrescribir silenciosamente el dato, lo que facilita la trazabilidad en la base de datos de la encuesta.
- Pilotos de campo en investigacion academica: util para validar formularios y protocolos de entrevista antes de escalar, dado su estado de piloto de investigacion.
- Normalizacion de decimales y fechas: el ejemplo del proyecto aplica postprocesado para devolver el ano de una fecha o el codigo de una opcion, reduciendo trabajo manual de limpieza.
- Integracion en un pipeline de ASR mas interpretacion: la voz se transcribe con otro modelo y el adaptador se encarga exclusivamente de la lectura estructurada de la respuesta.
- No se recomienda su uso en recogida de datos reales ni en produccion en el estado actual del modelo.

## Benchmarks y rendimiento

Datos publicados por el autor. Conjunto de prueba: 210 respuestas reales sobre judias y 198 comprobaciones reales de repreguntas, revisadas a mano, mas entrevistas redactadas. La linea base es Gemma 4 E2B sin adaptador, con 4 ejemplos resueltos por tarea.

| Metrica (sobre habla real de judias) | Modelo base sin adaptador | Este adaptador |
|---|---|---|
| Tipo de respuesta correcto | 0,79 | 0,98 |
| Respuestas mal leidas como rechazo, correccion u off-topic | 14,5 % | 0 % |
| F1 en seleccion multiple (rasgos) | 0,54 | 0,89 |
| "Nada" reconocido correctamente | 0,53 | 0,84 |
| Objetivo cumplido correcto | 0,70 | 0,91 |
| Puntos de repregunta, solapamiento de palabras | 0,71 | 0,70 |

Sobre formularios redactados nunca usados en entrenamiento: tipo de respuesta 1,00; F1 en seleccion multiple 0,96; numeros 0,96; decimales y fechas 1,00; elementos de lista 0,90. El propio autor advierte que estos formularios comparten patrones de frase, por lo que estos resultados muestran sobre todo que el modelo lee opciones, tipos y rangos de cualquier formulario. La model card esta truncada en el punto en que se discutia el rendimiento sobre habla real distinta de las judias, por lo que ese dato no esta disponible.

## Requisitos de hardware

- El adaptador en si ocupa 0,1 GB en safetensors; el coste real de VRAM lo determina el modelo base google/gemma-4-E2B-it, que debe cargarse completo.
- No se dispone de cifras de VRAM oficiales para el modelo base en la informacion proporcionada; la estimacion depende de la designacion E2B y de la precision elegida, y no esta confirmada por el autor.
- El ejemplo oficial usa bfloat16 con `device_map="auto"`, lo que implica que el modelo se reparte automaticamente entre los dispositivos disponibles.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible de forma confirmada; dependeria del tamano final del modelo base.
- Opciones de despliegue documentadas: transformers 5.17 o superior con peft. El autor advierte que versiones 5.x anteriores calculan Gemma 4 E2B de forma distinta con la cache activada y el adaptador deja de tener efecto.
- No se documentan opciones de despliegue con vLLM, llama.cpp, Ollama o TGI, ni versiones GGUF del adaptador.
- Latencia y throughput: no disponible.
- El ejemplo del proyecto incluye un modo terminal (`demo/form_interview.py`) y un modo navegador (`demo/form_app.py`), pero no se publican mediciones de rendimiento.

## Comparativa con modelos similares

No se dispone de especificaciones de modelos alternativos de la misma categoria en la informacion proporcionada. La unica comparacion documentada es con la version anterior del propio autor y con el modelo base sin adaptador.

| Modelo | Base | Tarjeta | Idiomas | Licencia | Estado |
|---|---|---|---|---|---|
| sikia-interviewer-lora-v4 | google/gemma-4-E2B-it | Tarjeta 12n compartida, no escribe sondas habladas | sw, en | gemma | Piloto de investigacion; no usar en recogida real |
| ndizi-interviewer-lora-v3 | Modelo base ndizi (no detallado) | Solo tarjeta de judias; tambien escribia las sondas habladas | no disponible | no disponible | Reemplazado por v4; no intercambiable con v4 |
| google/gemma-4-E2B-it (sin adaptador) | - | No aplica | no disponible | gemma | Linea base de evaluacion |

Los dos adaptadores no son intercambiables: v4 exige Gemma 4 E2B original, la tarjeta 12n compartida y el `instructions.txt` de este repositorio.

## Limitaciones y advertencias

- Estado declarado de piloto de investigacion: no debe usarse para recogida de datos reales todavia.
- Solo se ha probado con respuestas reales de ensayos de judias en swahili y con entrevistas redactadas; no se ha probado con habla real de otras encuestas ni en un telefono.
- Las tarjetas deben coincidir byte a byte con el formato de entrenamiento; cualquier variacion en el formato degrada o anula la respuesta.
- Requiere transformers 5.17 o superior; en versiones 5.x anteriores el adaptador no tiene efecto con la cache activada.
- El 62 % de los datos de entrenamiento son entrevistas redactadas por un asistente de IA y estan pendientes de revision por hablantes nativos; esto puede introducir sesgos de estilo o de vocabulario.
- El dataset original no es publico (contiene declaraciones de agricultores), por lo que no es posible auditar la composicion real.
- Cobertura linguistica limitada a swahili e ingles; el rendimiento en otras lenguas no esta documentado.
- Riesgo de alucinacion: el modelo genera etiquetas y valores normalizados que la aplicacion debe validar, especialmente en seleccion multiple, fechas y decimales; el autor aplica postprocesado en el codigo del proyecto para mapear numeros de opcion a codigos.
- El campo `say` se define siempre vacio, de modo que el modelo no debe generar texto hablado; cualquier contenido en ese campo seria un indicio de salida anomala.
- No se documentan capacidades de tool calling, agentes ni vision para este adaptador.
- Licencia gemma: su uso comercial queda sujeto a los terminos de la licencia de Gemma y a la aceptacion previa en Hugging Face.
- Metricas de adopcion minimas: 0 descargas y 0 likes en el momento de la consulta.
- La model card esta truncada en la seccion de evaluacion, por lo que falta informacion sobre el rendimiento fuera del dominio de las judias.

## Enlaces

- Adaptador en Hugging Face: https://huggingface.co/smutuvi/sikia-interviewer-lora-v4
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Version anterior: https://huggingface.co/smutuvi/ndizi-interviewer-lora-v3
- Fichero de instrucciones del repositorio: `instructions.txt` (descargable con `hf_hub_download` desde el repositorio del adaptador)
- Codigo del proyecto citado en la model card, sin URL publica disponible: `slmlib/cards.py`, `demo/form_interview.py`, `demo/form_app.py`
- Paper, blog o demo adicionales: no disponible
