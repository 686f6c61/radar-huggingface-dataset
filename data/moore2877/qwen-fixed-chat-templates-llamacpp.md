# Moore2877/Qwen-Fixed-Chat-Templates-llamacpp

## Resumen

Qwen Agentic Chat Template for llama.cpp es una plantilla de chat en formato Jinja diseñada para los modelos Qwen 3.5, 3.6 y 3.8, pensada para su uso con llama.cpp e ik_llama en entornos de codificación agéntica. No es un modelo de lenguaje con pesos, sino un componente de configuración que modifica el comportamiento del chat template nativo de Qwen para corregir errores de renderizado, invalidaciones de caché KV, desperdicio de tokens y fallos de estancamiento agéntico. El proyecto está desarrollado por Moore2877 y se basa en la plantilla de froggeric/Qwen-Fixed-Chat-Templates v21.3, a la que añade una capa de endurecimiento agéntico.

La relevancia actual del proyecto radica en que los harnesses de codificación agéntica (OpenCode, Claude Code, Hermes, aider) dependen de plantillas de chat correctas para gestionar el razonamiento, las llamadas a herramientas y las conversaciones multi-turno. Esta plantilla aborda problemas estructurales que los samplers no pueden detectar, como bucles de acción, fallos de herramientas y desaparición de herramientas a mitad de sesión. Tiene licencia Apache-2.0 y se distribuye como un único archivo de plantilla, con una comunidad de 28 me gustas en HuggingFace.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica (es una plantilla de chat Jinja, no un modelo) |
| Parametros totales | No aplica |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (depende del modelo Qwen subyacente) |
| Tipos de cuantizacion | No aplica |
| Idiomas soportados | No disponible (la plantilla es independiente del idioma; los modelos Qwen soportan múltiples idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | No aplica (archivo de plantilla `.jinja`) |

## Arquitectura y entrenamiento

Este proyecto no es un modelo entrenado, sino una plantilla de chat en Jinja que se integra en llama.cpp a través de la opción `--jinja --chat-template-file`. La plantilla se construye sobre la base de froggeric/Qwen-Fixed-Chat-Templates v21.3, que a su vez corrige errores de renderizado presentes en las plantillas oficiales de Qwen. Sobre esa base, el autor añade una capa de endurecimiento agéntico que incluye tres detectores de bucles estructurales (no-progress, action loop y consecutivos errores), un sistema de clasificación de fallos de herramientas, detección de herramientas desaparecidas y un control de esfuerzo de razonamiento (`reasoning_effort`) con cuatro niveles distintos.

El desarrollo se ha validado con el renderer real de llama.cpp y se ha medido en sesiones reales de harness: el detector de no-progress se probó en 381 sesiones y muestra una reducción del 90% en falsos positivos respecto al conteo ingenuo, manteniendo todos los casos reales. La plantilla también introduce la fusión de mensajes `system`/`developer` consecutivos y el alias `preserve_reasoning` para la opción `--reasoning-preserve` de llama.cpp. No hay un proceso de entrenamiento con datos, sino un desarrollo iterativo basado en tráfico capturado de harnesses.

## Capacidades

- Gestión completa del formato de chat para Qwen 3.5, 3.6 y 3.8, incluyendo razonamiento, tool calling y mensajes de sistema.
- Detección de bucles estructurales a nivel de plantilla: no-progress (herramienta devuelve resultados idénticos repetidamente), bucle de acción (misma llamada con resultados diferentes) y bucles de errores consecutivos.
- Clasificación de fallos de herramientas: distingue entre una herramienta que devuelve un error y una herramienta de lectura que devuelve contenido con forma de error.
- Detección de herramientas desaparecidas: si una herramienta llamada anteriormente ya no está en la lista actual, se inyecta una nota de sistema para evitar que el modelo finja que existe.
- Control de esfuerzo de razonamiento en cuatro niveles (`low`, `medium`, `high`, `xhigh`) con degradación a `medium` si el valor no es reconocido.
- Soporte de tool calling en formato XML por defecto y JSON (para parsers antiguos que solo leen Hermes JSON).
- Compatibilidad con harnesses agénticos como OpenCode, Claude Code, Hermes y aider.

## Casos de uso

- **Desarrollo de agentes de codificación**: la plantilla es un componente esencial para harnesses como OpenCode o Claude Code que gestionan conversaciones con herramientas de escritura, lectura y ejecución. Gracias a la detección de bucles de acción, el agente no se queda atascado repitiendo la misma llamada a una herramienta cuando el resultado cambia (por ejemplo, capturas de pantalla o timestamps).
- **Automatización de pruebas de integración**: en pipelines de CI/CD donde el agente debe ejecutar comandos y verificar resultados, la clasificación de fallos de herramientas evita que un `read` de un log con `Error:` se interprete como un fallo real, permitiendo que el agente continúe con el análisis.
- **Sistemas de soporte técnico automatizado**: con la capacidad de manejar sesiones largas y la detección de bucles de errores, el agente puede diagnosticar problemas de forma robusta sin entrar en ciclos repetitivos de fallos.
- **Herramientas de análisis de código**: el control de `reasoning_effort` permite ajustar la profundidad de razonamiento según la tarea, por ejemplo `low` para tareas rápidas de formato y `xhigh` para análisis complejos de arquitectura.
- **Integración con servidores llama.cpp**: la plantilla se puede cargar en `llama-server` con `--chat-template-file`, y es compatible con la auto-derivación del parser de tool calls en builds modernos, lo que facilita el despliegue en producción.
- **Sistemas de automatización de tareas con herramientas MCP**: la detección de herramientas desaparecidas evita que el modelo improvise cuando un servidor MCP muere a mitad de sesión, permitiendo una continuación segura con las herramientas restantes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) para esta plantilla, ya que no es un modelo de lenguaje. El proyecto reporta una medición específica: el detector de no-progress, probado en 381 sesiones reales, reduce los falsos positivos en un 90% respecto a un conteo ingenuo, manteniendo todos los casos reales detectados. También se menciona una prueba controlada A/B en Qwen3.8-27B donde el template stock con `xhigh` generó una media de 30.102 caracteres de razonamiento y produjo dos truncamientos de salida, mientras que la plantilla con `medium` evitó esos problemas. No se proporcionan métricas de rendimiento en términos de latencia o throughput.

## Requisitos de hardware

- No aplica directamente: la plantilla no tiene requisitos de hardware propios. Los requisitos dependen del modelo Qwen subyacente (por ejemplo, Qwen3.8-27B necesita alrededor de 16 GB de VRAM en cuantización Q4_K_M, y 27B en FP16 requiere unos 54 GB).
- La plantilla se ejecuta en el servidor llama.cpp, por lo que se recomienda una GPU con al menos 8 GB de VRAM para modelos pequeños (3B-8B) y 24 GB para modelos medianos (27B) en cuantización.
- Despliegue: se integra con `llama-server` (llama.cpp) y `ik_llama`. No es compatible con vLLM u Ollama de forma directa, ya que estos usan sus propias plantillas.
- La latencia y el throughput dependen del modelo Qwen y del hardware; la plantilla añade una sobrecarga mínima de procesamiento de texto (inferior a 1 ms por turno en CPU moderna).

## Comparativa con modelos similares

No se trata de un modelo, sino de una plantilla de chat. Comparación con alternativas de la misma categoría:

| Característica | Moore2877 (esta) | froggeric/Qwen-Fixed-Chat-Templates | Plantilla oficial Qwen3.6 |
|---|---|---|---|
| Base | v21.3 de froggeric + capa agéntica | v22.1 | oficial |
| Detección de bucles estructurales | Sí (3 tipos) | No | No |
| Clasificación de fallos de herramientas | Sí | No | No |
| Detección de herramientas desaparecidas | Sí | No | No |
| `reasoning_effort` | 4 niveles (`low`/`medium`/`high`/`xhigh`) | No | `low`/`high` |
| Fusión de mensajes `system`/`developer` | Sí | Sí | No |
| Compatibilidad con llama.cpp | Sí (verificada) | Sí | Parcial (errores conocidos) |
| Licencia | Apache-2.0 | Apache-2.0 | Apache-2.0 |

## Limitaciones y advertencias

- No es un modelo de lenguaje: no se puede usar directamente para generar texto; requiere un modelo Qwen3.5/3.6/3.8 subyacente.
- Depende de la versión de llama.cpp: la auto-derivación del parser de tool calls solo está disponible en builds modernos; para parsers antiguos hay que configurar `tool_call_format` a JSON.
- Los kwargs de la plantilla deben pasarse en la línea de comandos de `llama-server`, no en la configuración del cliente, porque algunos harnesses (como OpenCode) ignoran los `chat_template_kwargs` del cliente (ver issue #26233).
- La plantilla está optimizada para harnesses agénticos de codificación; su uso en otros contextos (chat general, preguntas-respuestas) puede no aportar beneficios y podría añadir sobrecarga de texto.
- El detector de bucles de acción no omite herramientas de mutación (por ejemplo, escritura de archivos), por lo que si un agente escribe el mismo archivo repetidamente con los mismos argumentos, se marcará como bucle aunque el resultado sea idéntico.
- La plantilla supone que la lista de herramientas es estable durante la sesión; si un harness cambia legítimamente la lista de herramientas por solicitud (carga just-in-time), hay que desactivar `warn_vanished_tools` para evitar falsas alarmas.
- La temperatura recomendada (0.60) es una configuración de campo para uso agéntico, no un valor universal; para tareas de razonamiento general, la guía oficial de Qwen3.6 recomienda 1.0.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Moore2877/Qwen-Fixed-Chat-Templates-llamacpp
- Base original de froggeric: https://huggingface.co/froggeric/Qwen-Fixed-Chat-Templates
- Espejo en ModelScope: https://www.modelscope.cn/models/froggeric/Qwen-Fixed-Chat-Templates
- Espejo en GitHub (clach04): https://github.com/clach04/froggeric_Qwen-Fixed-Chat-Templates
- Issue de OpenCode sobre `chat_template_kwargs` ignorados: https://github.com/sst/opencode/issues/26233
- Guía oficial de Qwen3.6: https://huggingface.co/Qwen/Qwen3.6-27B
