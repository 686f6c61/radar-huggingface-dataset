# CesarR70/Qwen-Sharp-Pi-Edition

## Resumen

CesarR70/Qwen-Sharp-Pi-Edition es un repositorio publicado en Hugging Face cuyo contenido principal no es un conjunto de pesos de un modelo de lenguaje, sino una plantilla de chat (`chat_template.jinja`) para modelos de la familia Qwen. El autor la presenta como una extension de la plantilla Qwen-Sharp desarrollada por Peculiar-Ragdoll y Frogeric (variante `qwen3.8-froggeric-v22.5.0`), a la que anade consciencia del arnes "Pi" para el enrutado de herramientas, el uso de servidores MCP y la escritura en modo Codemode.

El problema que aborda es concreto: los modelos pequenos confunden las herramientas MCP con funciones normales declaradas en la lista `<tools>`, y fallan al invocarlas. La plantilla inyecta instrucciones explicitas en el system prompt, detecta patrones de error propios del arnes Pi y devuelve pistas contextuales para que el modelo se autocorrija en el siguiente turno. No se publican pesos, parametros ni contexto: el repositorio es un artefacto de plantilla, no un modelo entrenado.

Por tanto, esta ficha describe el artefacto tal como se ha publicado. Cualquier dato sobre arquitectura, tamano o rendimiento del modelo subyacente (el base_model `peculiar-ragdoll/Qwen-Sharp-Chat-Templates`) no esta disponible en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio contiene una plantilla de chat Jinja, no pesos de modelo) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (segun la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible; el artefacto entregado es `chat_template.jinja` |

## Arquitectura y entrenamiento

El repositorio no contiene un modelo entrenado. El artefacto es una plantilla Jinja de chat (`chat_template.jinja`) que se coloca en el directorio de plantillas del modelo y se referencia mediante `chat_template_path`. La plantilla base es la variante Qwen-Sharp de Peculiar-Ragdoll y Frogeric, identificada como `qwen3.8-froggeric-v22.5.0`, que ya cubria tool calling y razonamiento (thinking). Esta edicion anade deteccion en tiempo de ejecucion del arnes Pi.

Las innovaciones tecnicas declaradas en la model card son cuatro. Primero, el enrutado de servidores MCP: cuando el arnes inyecta servidores bajo `<mcp_servers>` y alguno esta marcado `(codemode)`, la plantilla inserta una seccion `# Calling MCP servers` con instrucciones paso a paso (no llamar `mcp__<server>` como funcion, usar `describeNamespace`, `searchTools`, `describeTool` y `ALL_TOOLS` como globales, invocar con `await tools.mcp__<server>__<tool>({...})` y agrupar llamadas independientes con `Promise.all`). Segundo, deteccion de errores especificos de Pi (`tool ... not found`, `command exited with code N`, `could not edit file`, `operation aborted`) que tienen prioridad sobre la heuristica generica de codigo/grep. Tercero, pistas inline en la respuesta de la herramienta fallida segun el tipo de error. Cuarto, comportamiento "drag-and-drop" sin configuracion: la plantilla detecta `_has_tools` y `_pi_mcp_codemode` y solo inyecta la guia MCP cuando todas las senales estan presentes.

No se documenta ningun proceso de entrenamiento, dataset, RLHF ni DPO, porque no existe: el artefacto es logica de plantilla, no un ajuste de pesos.

## Capacidades

- Formateo de conversaciones multi-turno para modelos Qwen mediante plantilla Jinja.
- Soporte de tool calling en dos formatos: `xml` y `json`, seleccionables con el kwarg `tool_call_format`.
- Enrutado guiado de herramientas MCP en modo Codemode, con instrucciones explicitas en el system prompt.
- Deteccion de errores propios del arnes Pi y clasificacion autoritativa frente a heuristicas genericas.
- Inyeccion de pistas contextuales (HINT) tras un fallo de herramienta para favorecer la autocorreccion.
- Control del modo de razonamiento mediante `enable_thinking` y `auto_disable_thinking_with_tools`.
- Modo `terse` para respuestas concisas.
- Limites configurables de longitud de argumentos y respuestas de herramienta (`max_tool_arg_chars`, `max_tool_response_chars`).
- Avisos de fallos consecutivos, heredados de la plantilla original y ampliados con logica Pi.
- Idioma: ingles (unico declarado).

## Casos de uso

- Agentes con servidores MCP en modo Codemode: la plantilla ensena al modelo a invocar herramientas mediante `tools.mcp__<server>__<tool>` en lugar de tratarlas como funciones, lo que reduce el error mas frecuente en modelos pequenos.
- Pipelines de agentes con autocorreccion: ante un fallo de herramienta, la pista inline indica el patron correcto y el modelo reintenta en el siguiente turno, evitando bucles de error.
- Despliegue rapido en el arnes Pi: al ser drag-and-drop y sin configuracion, se puede incorporar a una sesion existente colocando el fichero y apuntando `chat_template_path`.
- Ejecucion de comandos Bash dentro de agentes: la deteccion de `command exited with code N` permite distinguir fallos de shell de errores de codigo y actuar en consecuencia.
- Edicion de ficheros asistida: la deteccion de `could not edit file` permite al agente reformular la operacion de edicion en lugar de repetirla a ciegas.
- Control de coste y latencia en produccion: los kwargs `terse`, `max_tool_arg_chars` y `max_tool_response_chars` permiten acotar la longitud de las interacciones.
- Integracion en entornos con tool calling en XML o JSON: la plantilla se adapta al formato exigido por el runtime sin cambios de codigo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (el repositorio no contiene pesos).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: cualquier runtime que acepte una plantilla Jinja de chat para modelos Qwen (por ejemplo, servidores de inferencia que carguen `chat_template.jinja` mediante `chat_template_path`). No se especifican vLLM, llama.cpp, Ollama ni TGI en la informacion proporcionada.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Artefacto | Tipo | Funcion principal | Soporte MCP/Codemode | Licencia |
|---|---|---|---|---|
| CesarR70/Qwen-Sharp-Pi-Edition | Plantilla de chat Jinja | Tool calling y MCP con consciencia del arnes Pi | Si, autoinyectado | apache-2.0 |
| peculiar-ragdoll/Qwen-Sharp-Chat-Templates (original) | Plantilla de chat Jinja | Tool calling y thinking para Qwen | No | no disponible |
| Plantilla de chat por defecto de Qwen | Plantilla de chat Jinja | Formateo de conversaciones | No | segun el modelo Qwen |

La comparativa se limita al tipo de artefacto, ya que no hay pesos ni benchmarks asociados a ninguno de los tres en la informacion disponible.

## Limitaciones y advertencias

- No es un modelo: no contiene pesos, no se puede cargar con `from_pretrained` para inferencia directa y no tiene parametros, contexto ni cuantizaciones propias.
- La model card esta redactada en ingles y el unico idioma declarado es `en`; no hay garantia de comportamiento correcto en castellano u otros idiomas.
- El comportamiento depende por completo del modelo subyacente al que se aplique la plantilla; no se documenta cual es ni como rinde.
- La logica de deteccion se basa en patrones de cadena (`tool ... not found`, `command exited with code N`, etc.) que pueden coincidir con texto no relacionado y provocar clasificaciones erroneas.
- El soporte esta disenado especificamente para el arnes Pi; fuera de ese entorno, las secciones de MCP y Codemode no se activan y el valor anadido se reduce a la plantilla base.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso en produccion ni validacion por terceros.
- Riesgo de alucinacion y sesgos: no evaluables sin el modelo subyacente; no se han publicado analisis.
- Licencia apache-2.0 permite uso comercial, pero conviene verificar la licencia del modelo base sobre el que se aplique la plantilla.
- La fecha de creacion indicada (2026-11-20) es posterior a la fecha habitual de publicacion de modelos Qwen3; conviene tratar los metadatos con cautela.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/CesarR70/Qwen-Sharp-Pi-Edition
- Modelo base: https://huggingface.co/peculiar-ragdoll/Qwen-Sharp-Chat-Templates
- Repositorio Qwen (referenciado en la model card): https://github.com/QwenLM/Qwen
- Perfil de Peculiar-Ragdoll: https://github.com/Peculiar-Ragdoll
- Perfil de Frogeric: https://github.com/Frogeric
