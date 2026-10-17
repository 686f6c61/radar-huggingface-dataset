# nazeshinjite/Flash-Next-Chat-Templates

## Resumen

Este repositorio no contiene un modelo de lenguaje, sino un conjunto de tres plantillas de chat en formato Jinja2 pensadas para el modelo Qwen/Qwen3.8-Flash-Next, desarrolladas por el usuario nazeshinjite. Su funcion es controlar como se serializa una conversacion (turnos de sistema, usuario, asistente, bloques de razonamiento y llamadas a herramientas) antes de enviarla al modelo, algo critico cuando se despliega con llama.cpp o con cualquier motor que acepte plantillas externas.

El problema que resuelve es concreto: la plantilla estandar de Qwen y la variante distribuida por Unsloth rechazan o renderizan mal ciertos patrones de peticion (rol developer, multiples mensajes de sistema, argumentos de herramienta como cadena JSON, historial con bloques de pensamiento vacios). La version v1.4 documentada aqui corrige esos casos con siete arreglos identificados como F1 a F7, y anade una variante "Sharp" que incorpora un bloque de concision tomado de Sharp v22.5.0.

Es relevante ahora porque el ecosistema de agentes sobre modelos abiertos depende de plantillas de chat correctas: un fallo de renderizado rompe el tool calling, invalida la cache de prefijo KV o degrada el cumplimiento de formato en herramientas de edicion de codigo. El repositorio incluye verificacion formal en jinja2 (158 aserciones) y comparacion byte a byte contra la plantilla de Unsloth. El modelo base al que sirve, Qwen3.8-Flash-Next, no expone caracteristicas tecnicas en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no aplicable: plantillas Jinja2 de serializacion de chat, sin red neuronal |
| Parametros totales | no disponible (corresponden al modelo base Qwen/Qwen3.8-Flash-Next) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (la fija el modelo base; las plantillas no la modifican) |
| Tipos de cuantizacion | no aplicable (el repositorio no contiene pesos) |
| Idiomas soportados | no disponible; los textos de las plantillas estan redactados en ingles |
| Licencia | qwen-community-1.0 (campo `license: other`, con `license_name: qwen-community-1.0`) |
| Formato de pesos | no aplicable: ficheros `.jinja` en texto plano |
| Modelo base | Qwen/Qwen3.8-Flash-Next |
| Ficheros incluidos | `Sharp-naze-chat_template_v1.4.jinja`, `nazeshinjite-chat_template_v1.4.jinja`, `Unsloth-chat_template_embedded.jinja` |
| Version de plantilla | v1.4 (variante recomendada: Sharp-naze) |
| Integracion | llama.cpp (`--jinja`), vLLM / Responses API, API de Anthropic (campos `reasoning` y `thinking`) |
| Descargas | 0 |
| Likes | 1 |
| Fecha de creacion | 2026-10-16 |
| Ultima actualizacion | 2026-10-16 |

## Arquitectura y entrenamiento

No hay arquitectura de red neuronal implicada: el artefacto son plantillas Jinja2 que transforman una lista de mensajes en un unico prompt de texto. La plantilla de referencia es la de Unsloth, que a su vez modifica la plantilla estandar de Qwen. Los cambios de Unsloth, aplicados el 2026-08-26 y sin modificaciones desde entonces, se limitan a cuatro puntos: fusionar una secuencia inicial de mensajes `system` y `developer` en un solo bloque de sistema, mapear `reasoning_effort: high` a `xhigh`, permitir conversaciones sin turno de usuario y emitir errores legibles en llamadas a herramienta sin nombre. El renderizado de generacion, pensamiento y marcado de tool calls es identico al de la plantilla original.

Sobre esa base, la v1.4 de nazeshinjite introduce siete arreglos. F1 evita que los turnos de asistente en el historial reproduzcan un bloque `<think></think>` vacio (problema de "empty-think poisoning"), mueve los bloques de pensamiento embebidos en el contenido hacia el campo de razonamiento y divide respuestas con `</think>` visible sin etiqueta de apertura. F2 normaliza los niveles de esfuerzo sin permitir subidas: `high`, `max`, `ultracode` y `extreme` pasan a `xhigh`; `minimal` pasa a `low`; `none` y `off` desactivan el pensamiento. F3 renderiza argumentos de herramienta enviados como cadena JSON en lugar de fallar. F4 escala tras fallos repetidos de herramienta, con una nota de "diagnostica primero" en el primer fallo y una directiva de "cambia de estrategia" en los siguientes; el detector se ajusto sobre 248 resultados reales de herramientas de agente, con 100% de recall y 88% de precision. F5 anade dos reglas a las instrucciones de herramienta: los valores de parametro son contenido literal y una llamada fallida no debe reenviarse sin cambios. F6 lee tambien el razonamiento de los campos `reasoning` (vLLM / Responses API) y `thinking` (Anthropic). F7 permite fijar el nivel de esfuerzo mediante etiquetas en linea como `<|think_off|>`, `<|think_low|>` o `<|think_xhigh|>`, con la ultima etiqueta de la conversacion como ganadora y eliminacion de las etiquetas antes del renderizado.

La variante Sharp anade el bloque de concision de Sharp v22.5.0 despues del system prompt del usuario, activo por defecto y desactivable con `"chat_template_kwargs": {"terse": false}` por peticion o con `--chat-template-kwargs '{"terse":false}'` al arrancar el servidor. Su primera linea sigue el modo de pensamiento, y el nivel de esfuerzo por defecto se mantiene en `xhigh`. No se tomo ningun otro elemento de Sharp. Con la concision desactivada, la plantilla renderiza exactamente lo mismo que la v1.4. No hay datos de entrenamiento ni de ajuste por RLHF/DPO, porque no se entrena ningun modelo en este repositorio.

## Capacidades

- Control del nivel de razonamiento mediante niveles de esfuerzo: `xhigh`, `medium`, `low` y desactivacion total del pensamiento con `none` u `off`.
- Configuracion del esfuerzo por etiquetas en linea (`<|think_off|>`, `<|think_low|>`, `<|think_xhigh|>`), util para clientes que no pueden enviar argumentos de plantilla.
- Soporte de tool calling con reglas adicionales sobre valores de parametros y reenvio de llamadas fallidas.
- Recuperacion escalonada ante fallos repetidos de herramienta, con mensajes diferenciados para el primer fallo y los posteriores.
- Aceptacion del rol `developer` y fusion de multiples mensajes de sistema iniciales.
- Renderizado de argumentos de herramienta en formato de cadena JSON, que en la plantilla original provocaban un error.
- Lectura del razonamiento desde los campos `reasoning` y `thinking`, lo que facilita la integracion con vLLM, la Responses API y la API de Anthropic.
- Tolerancia a conversaciones sin turno de usuario.
- Concision opcional (variante Sharp) que reduce preambulos, repeticion de la pregunta y relleno, conservando pasos, advertencias e incertidumbres.
- Compatibilidad byte a byte con la plantilla de Unsloth en historiales normales con pensamiento activado, lo que preserva la cache de prefijo.
- No incorpora capacidades de vision, audio, generacion de texto ni razonamiento por si mismo: todas ellas dependen del modelo base Qwen/Qwen3.8-Flash-Next.

## Casos de uso

- Despliegue de Qwen3.8-Flash-Next en llama.cpp con control fino del razonamiento: se lanza `llama-server -m <modelo>.gguf --jinja --chat-template-file Sharp-naze-chat_template_v1.4.jinja` y se ajusta el esfuerzo por peticion, evitando modificar el prompt manualmente.
- Pipelines agente con tool calling prolongado: cuando una herramienta falla de forma repetida, la plantilla inyecta avisos progresivos que empujan al modelo a diagnosticar y cambiar de estrategia, reduciendo bucles de reintento identicos.
- Clientes ligeros sin soporte de argumentos de plantilla: la funcionalidad de etiquetas en linea permite conmutar el nivel de pensamiento escribiendo `<|think_off|>` o similares en el propio mensaje, sin tocar la configuracion del servidor.
- Integracion con vLLM y APIs compatibles: al leer el razonamiento desde los campos `reasoning` y `thinking`, el modelo puede servirse desde backends que devuelven estos campos en lugar de texto embebido, sin reescribir la plantilla.
- Harnesses de edicion de codigo con formato estricto: en tareas que evaluan el cumplimiento de un formato de edicion concreto, conviene desactivar la concision con `{"terse": false}`; el autor documenta que en otro ajuste de Qwen la concision de Sharp redujo el cumplimiento de formato de edicion de aider del 77% al 46%.
- Migracion desde los GGUF de Unsloth sin invalidar cache: como la v1.4 renderiza el mismo prompt en historiales normales con pensamiento activado, cambiar de plantilla no rompe el prefijo compartido y por tanto no penaliza el rendimiento de inferencia.
- Conversaciones multi-turno largas con pensamiento: F1 evita la contaminacion por bloques de pensamiento vacios en el historial, manteniendo estable la representacion de los turnos previos.
- Asistentes generales con respuestas menos verbosas: la variante Sharp reduce preambulos y repeticiones, lo que disminuye tokens de salida en produccion a costa de introducir un bloque adicional en el system prompt.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

Los unicos datos cuantitativos del repositorio corresponden a verificacion interna del propio autor y no a evaluaciones comparativas de capacidad del modelo:

| Metrica de verificacion | Resultado |
|---|---|
| Aserciones comprobadas en jinja2 para la variante Sharp | 158 |
| Igualdad byte a byte con v1.4 sin concision | verificada |
| Igualdad byte a byte con la plantilla de Unsloth en historial con pensamiento | 16/16 en jinja2 y 5/5 mediante `/apply-template` de llama.cpp |
| Detector de fallos de herramienta (recall) | 100% sobre 248 resultados reales |
| Detector de fallos de herramienta (precision) | 88% sobre 248 resultados reales |
| Cumplimiento de formato de edicion de aider con concision activada (otro ajuste de Qwen) | 77% a 46% |

## Requisitos de hardware

- VRAM para inferencia: no aplicable al repositorio; depende enteramente del modelo base Qwen/Qwen3.8-Flash-Next y de su cuantizacion.
- GPU recomendadas: no disponible por la misma razon; la eleccion depende del modelo base.
- Compatibilidad con GPU de consumo: no disponible; la plantilla no impone requisitos de hardware propios.
- Sobrecarga de la plantilla: despreciable en terminos de computo, es un renderizado Jinja2 en CPU previo a la inferencia.
- Opciones de despliegue: llama.cpp (`llama-server` con `--jinja` y `--chat-template-file`), vLLM y Responses API (por el arreglo F6), y cualquier motor que acepte plantillas de chat externas.
- Modalidad de aplicacion: fichero de plantilla por peticion, o plantilla embebida al convertir el modelo a GGUF.
- Latencia y throughput: no disponibles; no se publican mediciones y no dependen de la plantilla en si, con la salvedad de que la variante con concision tiende a reducir tokens de salida.

## Comparativa con modelos similares

| Plantilla | Autor | Base | Cambios destacados | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Flash-Next-Chat-Templates (Sharp-naze v1.4) | nazeshinjite | Unsloth sobre Qwen estandar | F1 a F7 mas bloque de concision de Sharp | qwen-community-1.0 | Repositorio HuggingFace, 0 descargas |
| Flash-Next-Chat-Templates (nazeshinjite v1.4) | nazeshinjite | Unsloth sobre Qwen estandar | F1 a F7 sin concision | qwen-community-1.0 | Repositorio HuggingFace |
| Unsloth-chat_template_embedded | Unsloth | Plantilla estandar de Qwen | Rol developer, fusion de system, `high` a `xhigh`, sin error de "No user query found", errores de herramienta legibles | no disponible (req. licencia del modelo base) | Incluida en los GGUF de Unsloth |
| Qwen-Fixed-Chat-Templates | froggeric | Plantilla de Qwen | Inspira F1, F4, F6 y F7 | no disponible | Repositorio HuggingFace |
| Qwen-Sharp-Chat-Templates (Sharp v22.5.0) | peculiar-ragdoll | Plantilla de Qwen | Bloque de concision reutilizado en la variante Sharp | Apache-2.0 | Repositorio HuggingFace |

## Limitaciones y advertencias

- Este repositorio no contiene pesos ni ejecuta inferencia: no puede evaluarse como modelo y su calidad depende por completo de Qwen/Qwen3.8-Flash-Next.
- El modelo base Qwen3.8-Flash-Next no expone en la informacion disponible arquitectura, numero de parametros, contexto ni idiomas soportados, por lo que no es posible estimar su comportamiento.
- Un mensaje de sistema situado en medio de una conversacion sigue provocando un error, igual que en la plantilla de Unsloth; solo se fusionan los mensajes iniciales.
- La concision de la variante Sharp esta activada por defecto y puede degradar el cumplimiento de formatos estrictos de edicion. El dato del 77% al 46% en aider corresponde a otro ajuste de Qwen, no a este modelo, por lo que debe tomarse como indicio y no como medicion directa.
- Los niveles de esfuerzo solo pueden mantenerse o reducirse: los valores `high`, `max`, `ultracode` y `extreme` se convierten a `xhigh` y `minimal` a `low`. No es posible forzar un esfuerzo superior al que la plantilla considera maximo.
- El detector de fallos de herramienta tiene un recall declarado del 100% y una precision del 88%, lo que implica falsos positivos sobre resultados de herramienta que en realidad tuvieron exito.
- La licencia aplicable es qwen-community-1.0, heredada del modelo base; debe revisarse antes de cualquier uso comercial, ya que el repositorio se etiqueta como `license: other` y no incluye un texto propio.
- La verificacion se limita a jinja2 y a llama.cpp; no se documentan pruebas en vLLM ni en otros motores, aunque F6 este disenado para ellos.
- El repositorio no tiene descargas y la ultima actualizacion registrada es del 2026-10-16, por lo que se trata de un artefacto muy reciente y sin adopcion comprobable.
- No se documentan sesgos, riesgo de alucinacion ni limitaciones de idioma propias de la plantilla; estos dependen del modelo base y no estan disponibles.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/nazeshinjite/Flash-Next-Chat-Templates
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
- Plantillas de chat de Sharp (origen del bloque de concision): https://huggingface.co/peculiar-ragdoll/Qwen-Sharp-Chat-Templates
- Plantillas de chat corregidas de Qwen (origen de las ideas de F1, F4, F6 y F7): https://huggingface.co/froggeric/Qwen-Fixed-Chat-Templates
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp
