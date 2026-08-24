# Jackrong/Qwen-Tool-Calling-Template-Fix

## Resumen

Este repositorio no contiene un modelo de lenguaje, sino una corrección de plantilla de chat (chat template) para modelos de la familia Qwen, específicamente orientada a resolver problemas de renderizado del historial de llamadas a herramientas (tool calling). El autor, Jackrong, investigó casos en los que agentes basados en Qwen repetían la misma llamada a una herramienta de forma indefinida y determinó que en muchos casos la causa no era el modelo, sino la forma en que la plantilla de chat procesaba los argumentos de las llamadas previas. El resultado es una plantilla Jinja alternativa que normaliza y preserva correctamente el historial de tool calls, evitando que el modelo pierda información sobre llamadas ya completadas.

La relevancia de este recurso es práctica para desarrolladores que despliegan agentes con Qwen en entornos como vLLM o llama.cpp, donde un renderizado incorrecto de la conversación puede provocar comportamientos erráticos. Incluye dos archivos: `chat_template.jinja` (legible) y `chat_template_oneline.txt` (para runtimes que requieren una sola línea). No sustituye al modelo, sino que se usa como override de la plantilla existente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplicable (recurso de plantilla de chat, no un modelo) |
| Parametros totales | No disponible |
| Parametros activos | No disponible (no es un modelo MoE) |
| Longitud de contexto | No disponible (depende del modelo Qwen subyacente) |
| Tipos de cuantizacion | No disponible (no aplica a una plantilla) |
| Idiomas soportados | Ingles (la plantilla es agnostica al idioma, pero la documentacion esta en ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | No aplicable (archivos de texto: `.jinja` y `.txt`) |

## Arquitectura y entrenamiento

No se trata de un modelo entrenado, sino de una plantilla de chat escrita en Jinja que modifica la forma en que se serializa la conversacion para el modelo. La plantilla esta disenada para ser compatible con el formato nativo de tool calling de Qwen (por ejemplo, el estilo XML que usa Qwen3). El autor realizo un diagnostico de los fallos comunes en el renderizado del historial: cuando los argumentos de una herramienta se guardan como cadena JSON en lugar de un objeto, o cuando el runtime (como un cliente OpenAI-compatible) entrega los datos en un formato incompatible, la plantilla original puede perder informacion y el modelo, al no ver el resultado de la llamada anterior, vuelve a intentarla.

La solucion implementada normaliza esos casos: acepta argumentos como mapping, cadena JSON o array-like, y los convierte a la representacion interna correcta antes de renderizar la conversacion. Tambien conserva la gramatica de herramientas que el modelo aprendio durante su entrenamiento, evitando cambios que puedan degradar la calidad de las respuestas. No se menciona ningun proceso de entrenamiento o fine-tuning; es puramente una correccion a nivel de plantilla.

## Capacidades

- Preserva el historial completo de llamadas a herramientas cuando los argumentos se presentan como objetos JSON, cadenas JSON o arrays.
- Evita la corrupcion del historial durante el renderizado de la plantilla en motores compatibles con Jinja.
- Mantiene la gramatica nativa de tool calling de Qwen (estilo XML) para que el modelo no tenga que adaptarse a un formato extrano.
- Compatible con runtimes que usan Jinja (Hugging Face Transformers) y con llama.cpp/minja (que tiene su propia implementacion de Jinja).
- Proporciona dos formatos de la plantilla: legible y en una sola linea para sistemas que lo requieran.
- Incluye una guia de diagnostico para distinguir problemas de plantilla, de parser, de control de flujo del agente o del propio modelo.

## Casos de uso

- Correccion de agentes de codificacion con Qwen: si un agente que usa herramientas como `read_file` o `write_file` entra en un bucle repitiendo la misma llamada, aplicar esta plantilla puede resolver el problema cuando la causa es un historial mal renderizado. Se usa como override en el runtime (por ejemplo, en vLLM con `--chat-template`).
- Despliegue con vLLM: se puede emparejar con un parser compatible con Qwen, como `qwen3_xml`, para garantizar que las llamadas a herramientas se interpreten correctamente. La plantilla asegura que el historial previo llegue intacto al modelo.
- Integracion con llama.cpp: para aplicaciones locales o de edge, se puede usar la version `chat_template_oneline.txt` como chat template en la configuracion de llama.cpp, evitando problemas de renderizado en minja.
- Diagnostico de bucles en agentes: la plantilla sirve como herramienta de aislamiento: si al aplicarla el bucle persiste, el problema esta en el parser, en el control de flujo del agente o en el propio modelo, no en la plantilla.
- Desarrollo de agentes con herramientas terminales: aunque la plantilla no puede detener un agente, ayuda a que el historial refleje fielmente la llamada a una herramienta terminal como `submit_implementation`, permitiendo que el harness decida detener la ejecucion.
- Normalizacion de historiales entre distintos clientes: cuando un cliente OpenAI-compatible entrega argumentos como cadena JSON y el modelo espera un mapping, esta plantilla unifica el formato y evita perdida de informacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas de rendimiento ni comparaciones cuantitativas con otras plantillas. El autor indica explicitamente que el acompañamiento es un estudio de diagnostico, no un benchmark general.

## Requisitos de hardware

- No aplica directamente, ya que es una plantilla de texto. Los requisitos de hardware dependen del modelo Qwen sobre el que se aplique.
- Para usar la plantilla con vLLM o llama.cpp, se necesita el mismo hardware que para el modelo base (por ejemplo, una GPU con suficiente VRAM para el tamano del modelo Qwen elegido).
- No hay requisitos adicionales de memoria o computo por el uso de la plantilla.
- Opciones de despliegue: cualquier runtime que permita sobrescribir el chat template, como vLLM, llama.cpp, Ollama (si acepta plantillas personalizadas), o Hugging Face Transformers.

## Comparativa con modelos similares

Dado que no es un modelo, la comparacion debe hacerse con otras soluciones de plantillas corregidas para Qwen:

| Recurso | Tipo | Alcance | Licencia | Disponibilidad |
|---|---|---|---|---|
| Jackrong/Qwen-Tool-Calling-Template-Fix | Plantilla de chat especifica para tool calling | Corrige el renderizado del historial de herramientas | Apache-2.0 | Publico en Hugging Face |
| froggeric/Qwen-Fixed-Chat-Templates | Conjunto de plantillas para Qwen 3.5/3.6/3.8 | Soporte completo de variantes, ajustes de razonamiento y utilidades de diagnostico | No especificada | Publico en Hugging Face |
| Plantilla original de Qwen (en los modelos oficiales) | Plantilla estandar | Depende de la version; puede tener problemas con argumentos JSON string | Apache-2.0 | Incluida en los pesos del modelo |

La principal diferencia es que la solucion de Jackrong se centra exclusivamente en el problema de tool calling, mientras que la de froggeric abarca mas variantes y ajustes. La eleccion depende de si el desarrollador necesita una correccion puntual o una plantilla mas completa.

## Limitaciones y advertencias

- No es una solucion universal para los bucles de tool calling: el autor advierte que el sintoma de repetir llamadas puede deberse a multiples causas (parser, control de flujo, gramatica del modelo, etc.) y esta plantilla solo aborda el problema a nivel de renderizado de historial.
- No garantiza que el modelo no repita una accion: si el modelo, por su propio entrenamiento, decide llamar a la misma herramienta dos veces, la plantilla no lo impide.
- No puede detener un agente: si el harness del agente sigue invocando al modelo tras una herramienta terminal, la plantilla no puede forzar la detencion; el control de flujo debe gestionarse en el codigo del agente.
- Requiere probar la compatibilidad con minja (llama.cpp) y con Jinja de Hugging Face por separado, ya que pueden comportarse de forma distinta.
- La documentacion esta solo en ingles y los ejemplos se centran en el ecosistema Qwen; puede no ser directamente aplicable a otras familias de modelos.
- No hay garantias de soporte a largo plazo ni mantenimiento activo (el repositorio tiene pocas descargas y likes).

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Jackrong/Qwen-Tool-Calling-Template-Fix
- Investigacion en Reddit: https://www.reddit.com/r/huggingface/comments/1vv5s5m/why_some_qwen_toolcalling_loops_are_not_model/
- Documentacion de Alibaba Cloud sobre Function Calling con Qwen: https://www.alibabacloud.com/help/en/model-studio/qwen-function-calling
- Repositorio relacionado (diagnostico de fallos): https://github.com/abysslover/qwen36_tool_calling_failure
