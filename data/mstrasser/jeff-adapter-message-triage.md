# mstrasser/jeff-adapter-message-triage

## Resumen

jeff-adapter-message-triage es un adaptador LoRA publicado por el usuario mstrasser sobre el modelo base mstrasser/jeff-base v1.4, un modelo de decisión de pequeno tamano que, segun la model card, es un fine-tune de Qwen3.5-0.8B. El adaptador esta especializado en la triage de bandejas de entrada compartidas: clasifica un mensaje, determina la accion requerida y su urgencia, y selecciona el equipo responsable a partir de las categorias, la tabla de enrutamiento y las reglas que define el propio usuario.

A diferencia de un modelo generativo, el adaptador no produce texto libre: recibe una situacion y una pregunta con opciones con nombre, y devuelve una probabilidad calibrada para cada opcion en un unico forward pass. Esto elimina la necesidad de parsear la salida y lo hace adecuado para integrarse en flujos automatizados de gestion de correo.

El modelo se distribuye como adaptador PEFT (libreria peft, pesos safetensors) con licencia Apache 2.0, esta etiquetado para la tarea text-classification y solo soporta ingles. El repositorio ocupa aproximadamente 0,1 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre un modelo base de decision (fine-tune de Qwen3.5-0.8B, segun la model card) |
| Parametros totales | no disponible (el adaptador LoRA no declara recuento; el modelo base es de 0,8B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se implementa como LoRA sobre jeff-base v1.4, un modelo de decision de 0,8B de parametros descrito en la model card como fine-tune de Qwen3.5-0.8B. La innovacion principal del enfoque no esta en la arquitectura del transformer subyacente, sino en la interfaz de decision: en lugar de generar texto y parsearlo, el modelo evalua un conjunto de opciones con nombre y emite una distribucion de probabilidad calibrada sobre ellas en un solo forward pass. El adaptador esta entrenado especificamente para la tarea de triage de mensajes y el motor de inferencia rechaza adaptadores entrenados sobre otra revision del modelo base, de modo que solo carga sobre jeff-base v1.4.

La model card no detalla el volumen de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO. Tampoco se documentan innovaciones adicionales como decodificacion especulativa o atencion lineal. La informacion disponible se limita a la definicion de la tarea, los campos de entrada y las etiquetas de cada una de las cuatro decisiones que implementa el adaptador.

## Capacidades

- Clasificacion de mensajes de bandeja de entrada compartida en cuatro decisiones independientes: `route_to`, `action_needed`, `intent` y `urgency`.
- Enrutamiento (`route_to`): selecciona la entrada de la tabla de enrutamiento cuyo ambito cubre el tema del mensaje mas reciente, o `self` si el tema lo gestiona el propio destinatario; las reglas de enrutamiento pueden sobrescribir la tabla.
- Accion requerida (`action_needed`): clasifica en `do_task`, `forward`, `fyi_only`, `ignore_spam` o `reply`, distinguiendo entre responder por escrito y ejecutar una tarea adicional.
- Intencion (`intent`): clasifica el mensaje segun la lista de categorias propia del destinatario (hasta 10 etiquetas definidas por el llamante).
- Urgencia (`urgency`): asigna `now`, `today`, `this_week` o `no_deadline` comparando el contenido con la fecha y hora actuales proporcionadas en el contexto.
- Salida con probabilidad calibrada por opcion en un unico forward pass, sin generacion de texto que parsear.
- Procesamiento de hilos de correo: el campo `message` puede citar o reenviar mensajes anteriores, que se usan como contexto.
- No soporta tool calling ni function calling, no es un modelo de agentes y no genera respuestas: solo clasifica y enruta.
- Capacidad multilingue limitada al ingles.

## Casos de uso

- Triage automatizado de bandejas compartidas: el adaptador recibe el mensaje entrante junto con la tabla de enrutamiento y las reglas del equipo, y devuelve a que entrada de la tabla corresponde, lo que permite asignar tickets sin intervencion humana.
- Deteccion de spam y phishing: la etiqueta `ignore_spam` de `action_needed` identifica publicidad masiva no solicitada, estafas e intentos de phishing independientemente de lo que afirme el mensaje.
- Priorizacion por urgencia: con la fecha y hora actuales en el contexto, el modelo distingue entre acciones que deben hacerse en las proximas dos horas (`now`), antes de fin de dia (`today`) o dentro de la semana, lo que permite ordenar colas de atencion.
- Enrutamiento a equipos con reglas de negocio: las reglas de enrutamiento sobrescriben la tabla de temas, de modo que se pueden codificar excepciones (por ejemplo, clientes VIP o incidencias criticas) sin reentrenar el modelo.
- Clasificacion por categorias propias del cliente: el campo `intent` acepta hasta 10 etiquetas definidas por el llamante, lo que permite adaptar la taxonomia a cada organizacion sin cambiar el adaptador.
- Deteccion de mensajes que solo informan: la distincion entre `fyi_only` y `reply` o `do_task` permite descartar correos que no requieren accion y reducir el ruido en la bandeja.
- Automatizacion de respuesta de primer nivel en soporte: al separar `reply` (solo hace falta una respuesta escrita) de `do_task` (hay que preparar un documento, cambiar una reserva, aprobar o pagar), el sistema puede encaminar cada caso al flujo adecuado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; al tratarse de un adaptador LoRA sobre un modelo base de 0,8B, la huella es reducida, pero la model card no publica cifras de VRAM.
- GPU recomendadas: no disponible.
- Cabe en GPU de consumo: previsiblemente si, dado el tamano del modelo base (0,8B), aunque no se confirma en la informacion disponible.
- Opciones de despliegue: el adaptador se carga mediante la libreria peft; el codigo, servidor y SDKs estan en el repositorio github.com/firelex/jeff. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. La model card solo indica que la decision se obtiene en un unico forward pass por llamada.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (clasificacion y enrutamiento de correo con salida calibrada) ni datos de rendimiento que permitan una comparacion fundamentada.

## Limitaciones y advertencias

- Solo soporta ingles; no se declaran capacidades multilingues.
- No genera respuestas: si se necesita redactar una contestacion, este adaptador no es la herramienta adecuada.
- Requiere que el llamante defina previamente las categorias de mensaje, la tabla de enrutamiento y las reglas; sin esa configuracion el modelo no puede operar.
- El adaptador solo carga sobre jeff-base en la revision v1.4; el motor de inferencia rechaza adaptadores entrenados sobre otra base, lo que limita la portabilidad.
- La model card no documenta sesgos conocidos, tasas de alucinacion ni evaluaciones de robustez; no hay benchmarks publicados que permitan estimar su fiabilidad en produccion.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y su revision concreta deben verificarse por separado.
- El repositorio no registra descargas ni likes, por lo que no existe evidencia publica de validacion por parte de la comunidad.
- La fecha de creacion del repositorio (2026-11-05) y la referencia a Qwen3.5-0.8B deben contrastarse con las fuentes oficiales antes de adoptarlo en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mstrasser/jeff-adapter-message-triage
- Modelo base: https://huggingface.co/mstrasser/jeff-base
- Pagina del catalogo: https://jeffhub.ai/catalogue/jeff.support.message-triage
- Codigo, servidor y SDKs: https://github.com/firelex/jeff
