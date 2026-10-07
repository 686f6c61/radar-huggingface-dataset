# hiennguyennq/ops-automation-agent-demo

## Resumen

Ops Automation Agent es un proyecto de demostracion publicado en HuggingFace por el usuario hiennguyennq. Implementa un agente para la bandeja de entrada de soporte y operaciones de una marca ficticia de cafe de venta directa, Brewline Coffee Co., con datos de muestra inventados. No es un modelo de lenguaje con pesos propios: es un andamiaje de agente (codigo Python) que envuelve un LLM servido por un endpoint compatible con OpenAI y le anade validacion estricta, enriquecimiento con datos operativos, triage, un motor de politicas, aprobacion humana y auditoria.

El problema que aborda es la automatizacion fiable de operaciones posventa: deteccion de incumplimientos de SLA, envios bloqueados, cargos duplicados y pagos fallidos, con propuesta de acciones (reembolsos, reenvios, cambios de suscripcion, correos al cliente, tickets internos y avisos por Slack) que nunca se ejecutan sin superar reglas duras codificadas y, cuando corresponde, una cola de aprobacion humana.

Su relevancia es metodologica: ilustra el patron "el modelo propone, el codigo decide", con salida restringida por JSON schema, cuarentena de entradas invalidas y un registro de auditoria encadenado por hash. El repositorio ocupa 0,0 GB y no registraba descargas ni "likes" en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplicable: no es un modelo con pesos, sino un agente con orquestacion en Python sobre un LLM externo |
| Parametros totales | No disponible (el repositorio no incluye pesos) |
| Parametros activos | No aplicable (no es un modelo MoE) |
| Longitud de contexto | No disponible; la determina el LLM que se sirva en el endpoint compatible con OpenAI |
| Tipos de cuantizacion | No aplicable; delegado en el servidor de inferencia (vLLM, Ollama u otro) |
| Idiomas soportados | No disponibles en la ficha; los prompts del repositorio estan en ingles y la locucion de la demo esta en vietnamita |
| Licencia | No disponible |
| Formato de pesos | No aplicable; el repositorio contiene codigo Python, respuestas grabadas en JSONL y una base de datos SQLite, no pesos |
| Tipo de artefacto | Proyecto de demostracion (agente + evaluacion + consola Streamlit) |
| LLM usado por el autor | Qwen3.8-27B servido en vLLM con `enable_thinking: false`, segun la model card |
| Modos de ejecucion | `replay` (sin GPU), `live` y `auto` |
| Acciones propuestas | Esquema cerrado de 8 tipos de accion |
| Tamano del repositorio | 0,0 GB |
| Descargas / "likes" | 0 / 0 |

## Arquitectura y entrenamiento

No hay entrenamiento ni ajuste fino documentado: el LLM se consume como servicio y todo el comportamiento especifico del dominio vive en el codigo. El flujo descrito en la model card es: validacion por registro con pydantic (los rechazos se conservan con un motivo y van a cuarentena), enriquecimiento determinista a una estructura plana de hechos (FACTS) con filtro de privacidad que oculta pedidos de otros clientes y comprobaciones por palabras clave de inyeccion, temas legales y contracargos, triage por LLM con salida restringida a JSON schema (intencion, severidad, banderas de riesgo, contraste de afirmaciones contra FACTS y acciones propuestas con evidencia), motor de politicas en Python que asigna a cada accion el veredicto `auto`, `needs_approval` o `blocked` con motivos explicitos, borrador de respuesta por LLM y ejecucion simulada hacia una bandeja de salida. Los detectores proactivos aplican reglas sobre los datos operativos (SLA vencido sin cumplir, excepciones o retrasos de seguimiento, cargos duplicados y pagos fallidos repetidos).

La pieza central es la separacion entre propuesta y ejecucion: el LLM nunca ejecuta nada y las politicas se calculan solo con hechos de los sistemas internos, nunca con afirmaciones del cliente o del modelo. Las reglas duras bloquean la accion y la envian a revision humana; tras una aprobacion, las reglas duras se vuelven a comprobar. La capa de LLM exige salida constrenida por schema, valida el resultado y reintenta aportando el error como retroalimentacion, con grabacion y reproduccion de llamadas para poder ejecutar la demo sin GPU. El almacen registra casos, cola de aprobacion, historico de ejecuciones y log de llamadas al LLM en SQLite, con un registro de auditoria de solo anadido encadenado por hash que puede verificarse recalculando la cadena.

## Capacidades

- Triage de tickets de soporte: clasificacion de intencion y severidad, con contraste de las afirmaciones del cliente contra los datos internos.
- Deteccion proactiva sobre datos operativos: incumplimientos de SLA, envios bloqueados o con retraso, cargos duplicados y pagos fallidos recurrentes.
- Resumen de caso con evidencia trazable: cada propuesta cita claves de evidencia que deben existir en FACTS.
- Propuesta de acciones en un esquema cerrado de 8 tipos: reembolsos, reenvios, cambios de suscripcion, tickets internos, correos al cliente y avisos por Slack, entre otros.
- Aplicacion de guardrails: tres veredictos por accion (`auto`, `needs_approval`, `blocked`) con motivos, y reclasificacion de reglas duras tras la aprobacion.
- Flujo de aprobacion humana en cola, con registro del aprobador y del resultado.
- Cuarentena de entradas invalidas o incompletas en lugar de inferir datos que faltan.
- Borrador de respuesta al cliente que solo describe lo que realmente ha ocurrido, sometido a una segunda politica de respuesta.
- Auditoria encadenada por hash y verificacion de la cadena por linea de comandos.
- Analitica operativa: tasa de actuacion sin intervencion, tasa de anulacion por el aprobador, dinero movido, reglas de politica que mas bloquean, latencia y tokens del LLM.
- Consola web en Streamlit con bandeja, aprobaciones, alertas, Slack, bandeja de salida y registro de auditoria.
- Modo "replay" con respuestas grabadas, que permite reproducir y evaluar sin GPU ni coste de inferencia.
- Bateria de 16 pruebas, incluida una con un LLM falso deliberadamente malicioso.

## Casos de uso

- Atencion al cliente de comercio electronico: el agente lee el ticket, lo cruza con pedidos, envios, pagos y suscripciones, redacta una respuesta y propone reembolso o reenvio. Encaja porque el motor de politicas evita que un texto de cliente manipulado desencadene un reembolso.
- Operaciones proactivas: barrido periodico de los datos operativos para detectar pedidos que superan el SLA, seguimientos con excepcion o pagos fallidos repetidos antes de que el cliente escriba.
- Gestion de disputas y contracargos: el enriquecimiento marca palabras clave legales y de contracargo, y las acciones de riesgo quedan bloqueadas o pendientes de aprobacion en lugar de resolverse automaticamente.
- Revision de cargos duplicados: deteccion determinista de duplicados y propuesta de devolucion con evidencia del cargo original, sujeta a aprobacion si supera los umbrales.
- Flujo de aprobacion en un equipo de operaciones: los casos se acumulan en una cola con el motivo de la politica incumplida, de modo que un responsable humano aprueba o rechaza con contexto y el sistema vuelve a comprobar las reglas duras al aprobar.
- Cumplimiento y auditoria interna: el registro encadenado por hash y la verificacion de la cadena permiten demostrar que acciones se ejecutaron, quien las aprobo y con que evidencia.
- Cuadro de mando de automatizacion: uso de las metricas de tasa sin intervencion, tasa de anulacion, dinero movido y latencia para decidir que reglas relajar y donde el modelo se equivoca.
- Integracion en canales corporativos: envio opcional a un canal real de Slack mediante webhook, util como notificacion operativa ligera.
- Evaluacion de LLM para tareas de operaciones: el arnes `eval/` con conjuntos `dev` y `holdout` etiquetados a mano y con invariantes de seguridad sirve para comparar modelos candidatos sobre el mismo andamiaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K ni de ningun otro benchmark estandar, y el repositorio no distribuye pesos que pudieran evaluarse de forma independiente.

Los unicos datos de rendimiento disponibles son operativos y corresponden a la ejecucion en vivo descrita por el autor:

| Metrica | Valor |
|---|---|
| Tickets validos procesados en una ejecucion completa | 26 |
| Llamadas al LLM | 49 |
| Llamadas en paralelo | 8 |
| Duracion de la ejecucion completa | Aproximadamente 35 s |
| Conjuntos de evaluacion | `dev` y `holdout`, con etiquetas manuales y puntuacion con invariantes de seguridad |
| Pruebas automatizadas | 16 |

## Requisitos de hardware

- Modo `replay`: no necesita GPU. Se ejecuta con las respuestas grabadas en `fixtures/llm_cache.jsonl`, de modo que la demo y la evaluacion funcionan sin acelerador.
- Modo `live`: requiere un endpoint compatible con OpenAI. El autor indica que uso Qwen3.8-27B en vLLM con una sola GPU, sin especificar modelo de GPU, cuantizacion ni VRAM.
- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Como referencia aritmetica, un modelo denso de 27 000 millones de parametros en precision bf16 ocupa del orden de 54 GB solo en pesos, cifra que disminuye con cuantizacion; esta estimacion es propia y no procede de datos publicados por el autor.
- GPU recomendadas: no disponibles. No se documentan modelos concretos (A100, H100, RTX 4090) ni perfiles de memoria.
- Viabilidad en GPU de consumo: no confirmada para el modo en vivo. El modo `replay` si es viable en cualquier equipo, ya que no realiza inferencia.
- Opciones de despliegue: cualquier servidor compatible con OpenAI. Se mencionan explicitamente vLLM, Ollama y OpenAI, ademas de la exigencia de soporte de salida restringida por JSON schema mediante `response_format: json_schema`, que segun la model card esta disponible en vLLM, OpenAI y las versiones recientes de Ollama.
- Latencia y throughput: no disponible por token. El dato agregado es de 49 llamadas repartidas en 8 en paralelo en unos 35 s para 26 tickets. La consola de analitica registra latencia y tokens por llamada, pero no se publican valores.

## Comparativa con modelos similares

No se han facilitado datos de alternativas comparables en la informacion disponible, por lo que la comparacion cuantitativa queda como no disponible. La categoria funcional mas cercana son los andamiajes de agentes con guardrails y aprobacion humana, pero no se aportan especificaciones ni cifras de ningun proyecto concreto con el que contrastar.

| Proyecto | Tipo | Parametros | Contexto | Guardrails | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Ops Automation Agent (hiennguyennq) | Agente sobre LLM externo | No aplicable | No disponible | Motor de politicas en Python, tres veredictos, aprobacion humana | No disponible | HuggingFace, 0 descargas, 0 "likes" |
| Alternativas de la misma categoria | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- No es un modelo: no incluye pesos, por lo que no puede evaluarse con benchmarks estandar ni desplegarse como tal. Todo el comportamiento depende del LLM que se conecte por el endpoint.
- Datos de demostracion ficticios. La propia model card indica que Brewline Coffee Co. y sus datos son una muestra inventada, de modo que las cifras de negocio no son extrapolables.
- Las acciones son simuladas: se escriben en ficheros de bandeja de salida. Solo el webhook de Slack puede llegar a ser real, y es opcional.
- La licencia no esta declarada, lo que impide conocer las condiciones de uso comercial o de redistribucion. Es un riesgo legal a resolver antes de cualquier uso en produccion.
- El repositorio ocupa 0,0 GB y tiene 0 descargas y 0 "likes", por lo que no existe validacion externa ni comunidad que haya reproducido los resultados.
- La model card esta truncada en la informacion disponible, justo en la enumeracion de las reglas duras (comienza la frase sobre reembolsos por encima de lo pagado), por lo que no se conocen todas las restricciones implementadas.
- Dependencia fuerte del servidor de inferencia: exige soporte de `response_format: json_schema`. Ollama solo lo soporta en versiones recientes, segun el autor.
- El modelo citado por el autor (Qwen3.8-27B) no se corresponde con ninguna denominacion publica ampliamente identificable, lo que dificulta reproducir la configuracion exacta de la ejecucion en vivo.
- Riesgo de alucinacion mitigado, pero no eliminado: el triage exige claves de evidencia existentes y contraste contra FACTS, pero el texto del ticket se pasa al modelo y las comprobaciones de inyeccion se basan en palabras clave, un mecanismo heuristico.
- Idiomas: los prompts estan en ingles y no se declaran idiomas soportados; no hay garantia de comportamiento correcto con tickets en castellano u otros idiomas sin adaptar los prompts.
- Coste y latencia: cada ticket valido genera varias llamadas al LLM (49 llamadas para 26 tickets en el ejemplo), lo que implica coste por token y dependencia de la latencia del proveedor.
- Las metricas de politica solo cubren las reglas implementadas; un dominio distinto exige reescribir `policy.py` y los detectores.

## Enlaces

- Pagina del proyecto en HuggingFace: https://huggingface.co/hiennguyennq/ops-automation-agent-demo
- Demo animada incluida en el repositorio: `demo/demo.gif`
- Recorrido narrado en vietnamita (4:57): `demo/out/demo_voiced.mp4`
- Version muda con subtitulos: `demo/out/demo.mp4`
- Diagrama de arquitectura: `demo/architecture.png`
- Respuestas de modelo grabadas para el modo replay: `fixtures/llm_cache.jsonl`
- Arnes de evaluacion: `eval/run_eval.py` (conjuntos `dev` y `holdout`)
- Consola Streamlit: `app.py`

La busqueda web realizada no devolvio ningun resultado relevante sobre este proyecto, su autor o su arquitectura; los enlaces recuperados no guardan relacion con el repositorio y no se incluyen.
