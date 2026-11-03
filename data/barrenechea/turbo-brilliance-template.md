# barrenechea/turbo-brilliance-template

## Resumen

`barrenechea/turbo-brilliance-template` no es un modelo de lenguaje, sino una plantilla Jinja de chat (`chat_template.jinja`) publicada como repositorio independiente en HuggingFace. Su función es sustituir las plantillas oficiales de la familia Qwen 3.5, 3.6 y 3.8 (incluida la variante Flash-Next) en motores de inferencia que soportan plantillas Jinja de HuggingFace, como LM Studio, llama.cpp, vLLM, SGLang, MLX, oMLX y KoboldCPP. El autor, `barrenechea`, la distribuye bajo licencia Apache 2.0 y la versiona internamente como v22.5.

El problema que aborda es concreto: las plantillas oficiales de Qwen 3.8 introducen regresiones que afectan a despliegues agénticos en producción. Entre ellas, un valor por defecto de esfuerzo de razonamiento `xhigh` que consume el presupuesto de tokens antes de generar respuesta, una excepción fatal cuando se desactiva el modo thinking en `Qwen3.8-2.4T-A95B`, la pérdida de bloques de razonamiento en el historial de conversación, y fallos de sintaxis al serializar argumentos de herramientas enviados como cadenas JSON por clientes OpenAI estándar.

La relevancia es operativa: cualquier equipo que sirva modelos Qwen 3.8 con tool calling y razonamiento multi-turno se enfrenta a estos errores si usa la plantilla embebida en `tokenizer_config.json`. La plantilla unifica el comportamiento entre motores y añade alias de esfuerzo de razonamiento compatibles con clientes como Claude Code, Cursor o Cline. No incluye pesos, tokenizador ni configuración de modelo; es únicamente lógica de renderizado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no aplica (plantilla Jinja de chat, no es un modelo neuronal) |
| Parametros totales | no aplica |
| Parametros activos | no aplica |
| Longitud de contexto | no disponible (depende del modelo Qwen subyacente) |
| Tipos de cuantizacion | no aplica (la plantilla es independiente de la cuantización del modelo) |
| Idiomas soportados | no disponible (la plantilla no impone restricción idiomática; hereda del modelo Qwen) |
| Licencia | Apache 2.0 |
| Formato de pesos | no aplica; se distribuye como `chat_template.jinja` y `chat_template_oneline.txt` |

## Arquitectura y entrenamiento

No hay arquitectura neuronal ni entrenamiento: el repositorio contiene una plantilla Jinja que define cómo se serializan los mensajes de chat (roles `system`, `developer`, `user`, `assistant`, `tool`), los bloques de razonamiento (`<think>`) y las llamadas a herramientas en el prompt de entrada. La lógica se apoya en el formato XML canónico de Qwen para argumentos de herramientas y en etiquetas inline de control de razonamiento (`<|think_low|>`, `<|think_medium|>`, `<|think_xhigh|>`, `<|think_ultracode|>`, `<|think_off|>`).

Las innovaciones técnicas declaradas por el autor incluyen: extracción de razonamiento desde tres fuentes distintas (`reasoning_content` de OpenAI, `thinking` de Anthropic y etiquetas `<think>` en contenido) sin duplicar etiquetas; fusión de mensajes `system` y `developer` consecutivos al inicio de la conversación en un único turno unido por dobles saltos de línea; manejo universal de argumentos de herramientas serializados como cadena JSON, evitando crashes de sintaxis e invalidación de la caché KV; y mapeo automático de alias de esfuerzo de razonamiento (`high`, `max`, `ultracode`, `extreme` → `xhigh`; `minimal` → `low`; `none`, `off` → desactivado). El valor por defecto es `medium`, sin inyectar tokens, para preservar la paridad de caché KV con la generación v21.

## Capacidades

- Renderizado correcto de conversaciones multi-turno con roles `system`, `developer`, `user`, `assistant` y `tool` en motores compatibles con plantillas Jinja de HuggingFace.
- Soporte de tool calling con formato XML canónico y manejo de argumentos en cadena JSON, sin crashes de sintaxis.
- Control del esfuerzo de razonamiento mediante kwargs (`enable_thinking`, `reasoning_effort`) o etiquetas inline en el texto del chat.
- Modo no razonamiento (fast mode) restaurado en `Qwen3.8-2.4T-A95B`, que en la plantilla oficial lanza una excepción fatal al pasar `enable_thinking=false`.
- Extracción de razonamiento histórico desde OpenAI (`reasoning_content`), Anthropic (`thinking`) y etiquetas `<think>` en contenido.
- Alias de esfuerzo compatibles con clientes agénticos: Claude Code, Cursor, Cline, OpenCode.
- Recuperación de errores en tool calling en dos niveles, con desambiguación de código y grep para evitar falsos positivos en resultados de búsqueda que contienen palabras como "error".
- Soporte nativo del flag `--reasoning-preserve` de llama.cpp mediante el alias `preserve_reasoning`.
- Script de diagnóstico `scripts/check_applied.py` para inspeccionar directorios de modelo y GGUFs y verificar la versión de plantilla activa.
- Compatibilidad declarada con LM Studio, llama.cpp, llama-server, vLLM, SGLang, MLX, oMLX y KoboldCPP.

## Casos de uso

- Despliegue de agentes de código con llama.cpp: usar `--jinja --chat-template-file chat_template.jinja --reasoning-format deepseek` para que los bloques `<think>` se extraigan al campo `reasoning_content` y no contaminen el stream de texto, evitando que las llamadas a herramientas se interrumpan a mitad.
- Servicio de modelos Qwen 3.8 en vLLM: sustituir la cadena `chat_template` en `tokenizer_config.json` por `chat_template_oneline.txt` y arrancar con `--reasoning-parser qwen3 --tool-call-parser qwen3_xml`, lo que corrige los crashes con argumentos JSON serializados por clientes OpenAI estándar.
- Integración con LM Studio para uso local: reemplazar la plantilla en el panel de Prompt Template y guardar, lo que restaura el modo no razonamiento y evita que el presupuesto de tokens se agote en razonamiento antes de responder.
- Pipelines agénticos multi-turno con historial largo: la extracción de razonamiento histórico sin duplicar etiquetas y la fusión de mensajes `system` y `developer` iniciales reducen la invalidación de la caché KV y el desperdicio de tokens en cada turno.
- Despliegue en SGLang: pasar `--chat-template chat_template.jinja` explícitamente, ya que SGLang 0.5.x ignora por defecto el archivo local y recurre a la plantilla embebida en `tokenizer_config.json`.
- Clientes agénticos con alias propietarios: Cursor, Cline o Claude Code envían nombres de esfuerzo no estándar; la plantilla los mapea automáticamente a los valores que Qwen 3.8 acepta, evitando rechazos.
- Auditoría de despliegues existentes: ejecutar `scripts/check_applied.py` sobre el directorio del modelo o el GGUF para confirmar qué versión de plantilla está activa antes de pasar a producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas de latencia, throughput ni evaluaciones de calidad; su efecto se mide en corrección funcional del renderizado y en la preservación de la caché KV, no en puntuaciones de tareas.

## Requisitos de hardware

- VRAM: no aplica a la plantilla en sí; depende enteramente del modelo Qwen 3.5, 3.6 o 3.8 sobre el que se aplique.
- GPU recomendadas: no aplica; la plantilla es agnóstica al hardware y funciona en cualquier backend que soporte Jinja (CPU, Apple Silicon vía MLX, GPU NVIDIA vía vLLM o llama.cpp).
- GPU de consumo: la plantilla no impone requisitos; la viabilidad en GPU de consumo (RTX 4090, etc.) la determina el tamaño y la cuantización del modelo Qwen subyacente.
- Opciones de despliegue: LM Studio, llama.cpp, llama-server, KoboldCPP, vLLM, SGLang, MLX, oMLX.
- Latencia y throughput: no disponibles; el renderizado Jinja añade un coste despreciable frente a la inferencia, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Criterio | Esta plantilla (v22.5) | Plantilla oficial Qwen 3.8 | Plantilla oficial Qwen 3.8 (27B) |
|---|---|---|---|
| Esfuerzo de razonamiento por defecto | `medium`, sin inyectar tokens | `xhigh` fijo | `xhigh` fijo |
| Modo no razonamiento en `2.4T-A95B` | Soportado vía kwargs o `<\|think_off\|>` | Excepción fatal con `enable_thinking=false` | Acepta `enable_thinking=false` |
| Extracción de razonamiento histórico | OpenAI, Anthropic y etiquetas en contenido | Solo extracción en contenido, con bloques vacíos antepuestos | Solo extracción en contenido |
| Argumentos de herramienta en cadena JSON | Renderizado seguro sin crash | Crash de sintaxis | Crash de sintaxis |
| Alias de esfuerzo de clientes | `high`, `max`, `ultracode`, `extreme` → `xhigh`; `minimal` → `low`; `none`, `off` → off | Rechaza nombres no estándar | Rechaza nombres no estándar |
| Etiquetas inline de control | `<\|think_low\|>`, `<\|think_medium\|>`, `<\|think_xhigh\|>`, `<\|think_ultracode\|>`, `<\|think_off\|>` | No soportadas | No soportadas |
| Fusión de system y developer iniciales | Sí, en un único turno | No, los trata como turnos separados | No |
| Recuperación de errores en tool calling | Dos niveles con desambiguación de código y grep | No soportada o falsos positivos | No soportada o falsos positivos |
| Licencia | Apache 2.0 | No disponible en la información proporcionada | No disponible en la información proporcionada |

## Limitaciones y advertencias

- No es un modelo: no genera texto por sí misma. Requiere un modelo Qwen 3.5, 3.6 o 3.8 subyacente y un motor con soporte de plantillas Jinja de HuggingFace.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día (2026-11-03). No hay evidencia de uso en producción ni de validación independiente.
- Las afirmaciones sobre corrección de bugs y compatibilidad proceden exclusivamente de la model card del autor; no se han verificado de forma externa.
- En vLLM, el parser no inspecciona etiquetas `<|think_off|>` embebidas en el cuerpo del prompt; para desactivar el razonamiento hay que pasar `enable_thinking: false` en los parámetros de la petición. Esta asimetría puede provocar comportamientos inconsistentes si se mezclan ambos mecanismos.
- La selección del parser de tool calling en vLLM depende de la versión: `qwen3_xml` en releases recientes, `qwen3_coder` en builds antiguas y `hermes` si se fuerza `tool_call_format="json"`. Una elección incorrecta rompe el parseo.
- En SGLang 0.5.x es obligatorio pasar `--chat-template` de forma explícita; de lo contrario se ignora el archivo local y se usa la plantilla embebida, con los bugs que ello conlleva.
- La plantilla está acoplada a la sintaxis de Qwen (etiquetas `<|think_*|>`, formato XML de herramientas); no es portable a otras familias de modelos sin reescritura.
- Riesgo de alucinación y sesgos: no aplica a la plantilla, pero hereda íntegramente los del modelo Qwen subyacente.
- La licencia Apache 2.0 permite uso comercial, pero conviene revisar la licencia del modelo Qwen concreto que se sirva, que puede diferir.
- Los tags del repositorio incluyen `qwen3.5`, `qwen3.6` y `qwen3.8`; no se documenta compatibilidad con otras generaciones ni con variantes distintas de Flash-Next.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/barrenechea/turbo-brilliance-template
- No se han encontrado otros enlaces (papers, blogs, repositorios de código o demos) en la información proporcionada.
