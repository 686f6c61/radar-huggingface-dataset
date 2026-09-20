# brakcity/Qwen-Fixed-Chat-Templates

## Resumen

`brakcity/Qwen-Fixed-Chat-Templates` no es un modelo de lenguaje, sino un repositorio de plantillas de chat en formato Jinja2 (v22.5) pensadas para sustituir a las plantillas oficiales de la familia Qwen 3.5, 3.6, 3.8 y 3.8 Flash-Next. Lo desarrolla el usuario brakcity y su proposito es corregir errores de renderizado, invalidacion de la cache KV, desperdicio de tokens, contaminacion por bloques `think` vacios y bloqueos en flujos agenticos que el autor atribuye a las plantillas oficiales. El artefacto principal es un unico archivo `chat_template.jinja` que se puede inyectar en cualquier motor compatible con plantillas Jinja de Hugging Face.

El problema que resuelve es de integracion, no de capacidad: en despliegues con agentes (Claude Code, Cursor, Cline, OpenCode, Pi.dev) las plantillas oficiales pueden romper la serializacion de argumentos de herramientas, duplicar etiquetas de razonamiento en el historial o forzar un esfuerzo de razonamiento excesivo que agota el presupuesto de tokens antes de emitir la respuesta. Esta plantilla redefine esos comportamientos: fija el esfuerzo por defecto en `medium`, acepta alias de razonamiento de distintos clientes, fusiona mensajes `system` y `developer` consecutivos y normaliza el formato de los argumentos de tool calling a XML canonico.

Es relevante ahora porque el ecosistema de despliegue de Qwen 3.8 abarca LM Studio, llama.cpp, vLLM, SGLang, MLX, oMLX y KoboldCPP, y cada motor interpreta la plantilla con matices distintos. El repositorio incluye ademas un script de diagnostico (`scripts/check_applied.py`) y una variante en una sola linea (`chat_template_oneline.txt`) para configuraciones que exigen la plantilla embebida en `tokenizer_config.json`. La licencia es Apache 2.0 y el repositorio registra 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no aplica: es una plantilla Jinja2 (Jinja), no una red neuronal |
| Parametros totales | no aplica (artefacto de texto sin pesos) |
| Parametros activos | no aplica (dato solo relevante para los modelos destino, p. ej. `Qwen3.8-2.4T-A95B`) |
| Longitud de contexto | no aplica: la plantilla no impone ventana; hereda la del modelo Qwen sobre el que se aplique |
| Tipos de cuantizacion | no aplica |
| Idiomas soportados | no disponible (la plantilla no declara idiomas; su documentacion esta en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | no aplica. Archivos distribuidos: `chat_template.jinja`, `chat_template_oneline.txt`, `scripts/check_applied.py` |
| Version | v22.5 |
| Modelos destino | Qwen 3.5, Qwen 3.6, Qwen 3.8 y Qwen 3.8 Flash-Next (todas las tallas, con una unica plantilla) |
| Motores compatibles | LM Studio, llama.cpp / llama-server, KoboldCPP, vLLM, SGLang, MLX, oMLX y cualquier motor con soporte de plantillas Jinja de Hugging Face |
| Biblioteca declarada en HuggingFace | mlx |
| Formato de tool calling por defecto | XML canonico (con manejo universal de argumentos JSON serializados como cadena) |
| Etiquetas de control en linea | `<\|think_low\|>`, `<\|think_medium\|>`, `<\|think_xhigh\|>`, `<\|think_ultracode\|>`, `<\|think_off\|>` |
| Autor | brakcity |
| Fecha de creacion | 2026-09-20 |
| Fecha de actualizacion | 2026-09-20 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No existe entrenamiento ni arquitectura de red: el artefacto es una plantilla de renderizado escrita en Jinja2 que transforma una lista de mensajes en formato OpenAI/ChatML en el prompt de texto que consume el tokenizador del modelo Qwen. Su "logica" consiste en reglas condicionales sobre roles, bloques de razonamiento y llamadas a herramientas. Los elementos tecnicos destacados que documenta el autor son: extraccion del razonamiento del historial procedente de tres convenciones distintas (campo `reasoning_content` de OpenAI, campo `thinking` de Anthropic y etiquetas en el contenido como `<think>`), sin duplicar etiquetas; manejo de argumentos de herramienta serializados como cadena JSON para evitar errores de sintaxis e invalidacion de la cache KV; y fusion de mensajes `system` y `developer` iniciales consecutivos en un unico turno separado por dobles saltos de linea.

En cuanto al control del razonamiento, la plantilla cambia el valor por defecto del esfuerzo de `xhigh` (plantilla oficial de Qwen 3.8) a `medium`, sin inyectar tokens adicionales, con el objetivo declarado de preservar la paridad de cache KV con la version v21 y evitar timeouts por contenido vacio. Admite alias de cliente: `high`, `max`, `ultracode` y `extreme` se mapean a `xhigh`; `minimal` se mapea a `low`; `none` y `off` desactivan el razonamiento. Incluye ademas un sistema de recuperacion de errores de herramienta en dos niveles, con desambiguacion de codigo y `grep` para no disparar falsos positivos cuando un resultado de busqueda contiene palabras como "error". Para llama.cpp expone el alias `preserve_reasoning`, que activa `--reasoning-preserve` y permite retener el 100 % de la cache KV de prefijo.

## Capacidades

- Renderizado de plantillas de chat Jinja2 compatible con la convencion de Hugging Face en LM Studio, llama.cpp, KoboldCPP, vLLM, SGLang, MLX, oMLX.
- Control del esfuerzo de razonamiento por peticion (`enable_thinking`, `reasoning_effort`) y por etiqueta insertada en el propio texto del chat.
- Modo sin razonamiento restaurado para `Qwen3.8-2.4T-A95B` mediante `enable_thinking=false`, `reasoning_effort="none"` o `<\|think_off\|>`.
- Extraccion del razonamiento del historial en formatos OpenAI, Anthropic y etiquetas en contenido.
- Soporte de tool calling / function calling con formato XML canonico por defecto y manejo seguro de argumentos JSON serializados como cadena.
- Recuperacion ante errores de herramienta en dos niveles, con desambiguacion para resultados de busqueda que contienen codigo.
- Mapeo automatico de alias de esfuerzo de razonamiento de clientes como OpenAI, Claude Code, Cursor y Cline.
- Fusion de mensajes `system` y `developer` iniciales en un unico turno de sistema.
- Retencion completa de cache KV de prefijo en llama.cpp mediante `--reasoning-preserve` / `preserve_reasoning`.
- Herramienta de diagnostico: `scripts/check_applied.py`, que inspecciona directorios de modelos y archivos GGUF para comprobar que version de plantilla esta activa.
- Variables de compatibilidad por motor: `--reasoning-parser qwen3` y `--tool-call-parser qwen3_xml` en vLLM (`qwen3_coder` en compilaciones antiguas, `hermes` si se fuerza `tool_call_format="json"`); `--reasoning-format deepseek` en llama.cpp.
- Capacidades multilingues: no disponible.

## Casos de uso

- **Despliegue de agentes de codigo sobre llama.cpp**: arrancar `llama-server -m modelo.gguf --jinja --chat-template-file chat_template.jinja --reasoning-format deepseek` extrae los bloques `think` al campo `reasoning_content` de la API, lo que evita que los tokens de razonamiento se filtren al flujo de texto e interrumpan las llamadas a herramientas a mitad de ejecucion, un fallo tipico al conectar OpenCode, Claude Code o Pi.dev.
- **Servicio de inferencia en produccion con vLLM**: sustituir la cadena `chat_template` de `tokenizer_config.json` por `chat_template_oneline.txt` y arrancar con `--reasoning-parser qwen3 --tool-call-parser qwen3_xml` permite mantener el formato de tool calling estable en clientes que envian argumentos serializados como cadena JSON.
- **Uso de escritorio en LM Studio**: reemplazar la plantilla en el panel Prompt Template y guardar; util para usuarios que necesitan previsualizar el comportamiento de agentes sin montar infraestructura de servidor.
- **Despliegue con SGLang**: lanzar `python3 -m sglang.launch_server --model-path Qwen/Qwen3.8-27B --chat-template chat_template.jinja`, ya que SGLang 0.5.x ignora por defecto un `chat_template.jinja` local y recurre a la plantilla embebida en `tokenizer_config.json`.
- **Compatibilidad con multiples clientes de agente**: al mapear alias como `ultracode`, `extreme` o `max` a `xhigh`, y `minimal` a `low`, un mismo endpoint puede atender a Cursor, Cline, Claude Code y clientes OpenAI sin adaptadores por cliente.
- **Reduccion de coste de tokens en razonamiento**: fijar el esfuerzo por defecto en `medium` en lugar de `xhigh` evita agotar el presupuesto de tokens en cadenas de pensamiento antes de emitir la respuesta, algo critico en tareas de atencion al cliente o clasificacion donde la latencia importa.
- **Preservacion de cache KV en conversaciones largas multi-turno**: con `--reasoning-preserve` en llama.cpp se retiene el 100 % de la cache KV de prefijo, lo que abarata el coste por turno en dialogos extensos.
- **Pipelines de busqueda y `grep` con herramientas**: la recuperacion de errores en dos niveles evita que resultados de busqueda que contienen cadenas como `throw new Error(...)` se interpreten como fallo de herramienta, reduciendo reintentos innecesarios en agentes de analisis de repositorios.
- **Auditoria de plantillas desplegadas**: `scripts/check_applied.py` permite verificar que version de plantilla esta activa en un directorio de modelo o en un GGUF antes de promover un despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio es una plantilla de renderizado y no incluye evaluaciones de calidad, latencia o throughput propias. La unica comparacion cuantitativa presente en la model card es cualitativa y se reproduce en la seccion de comparativa.

## Requisitos de hardware

- La plantilla en si no consume VRAM ni computo: es un archivo de texto que se procesa en CPU durante el renderizado del prompt.
- El hardware requerido es el del modelo Qwen destino, no el de este repositorio. Las cifras siguientes son estimaciones derivadas del numero de parametros y no estan publicadas por el autor.
- Para `Qwen3.8-27B` (27 000 millones de parametros): aproximadamente 54 GB en FP16/BF16, en torno a 27 GB en cuantizacion de 8 bits y entre 15 y 17 GB en 4 bits. Con 4 bits cabe en GPUs de consumo con 24 GB de VRAM (RTX 3090, RTX 4090); en 8 bits requiere A100 40 GB o H100 80 GB.
- Para `Qwen3.8-2.4T-A95B` (2,4 billones de parametros totales, 95 000 millones activos): no cabe en GPUs de consumo. Requiere despliegue multi-GPU o multi-nodo; no disponible el detalle exacto de VRAM y topologia.
- Opciones de despliegue soportadas: llama.cpp / llama-server, KoboldCPP, LM Studio, vLLM, SGLang, MLX y oMLX.
- Latencia y throughput: no disponibles. La plantilla afecta indirectamente al rendimiento porque reduce el numero de tokens de razonamiento inyectados y porque `--reasoning-preserve` mantiene la cache KV de prefijo, pero no se publican mediciones.
- El tag `mlx` sugiere uso en Apple Silicon, aunque el alcance declarado del repositorio es multi-motor.

## Comparativa con modelos similares

La comparacion pertinente no es con modelos, sino con las plantillas oficiales de Qwen. La model card incluye esta comparacion directa:

| Aspecto | Plantilla oficial Qwen 3.8 | Esta plantilla (v22.5) |
|---|---|---|
| Esfuerzo de razonamiento por defecto | `xhigh` fijo, agota el presupuesto de tokens antes de responder | `medium`, sin tokens inyectados; paridad de cache KV con v21 |
| Modo sin razonamiento | La plantilla de `Qwen3.8-2.4T-A95B` lanza una excepcion fatal si `enable_thinking=false` | Restaurado via kwargs o etiqueta `<\|think_off\|>` |
| Extraccion de razonamiento del historial | No soportada; antepone bloques `<think></think>` vacios a pensamientos reales | Extrae desde `reasoning_content` (OpenAI), `thinking` (Anthropic) y etiquetas `<think>` en contenido |
| Formato de argumentos de herramienta | Se rompe con cadenas JSON serializadas de clientes OpenAI estandar | XML canonico por defecto y manejo universal de argumentos serializados |
| Alias de esfuerzo de cliente | Rechaza nombres no estandar | Mapea `high`, `max`, `ultracode`, `extreme` a `xhigh`; `minimal` a `low`; `none`, `off` a desactivado |
| Etiquetas de control en linea | No soportadas | Soportadas y eliminadas antes de la inferencia, con efecto persistente en turnos posteriores |
| Mensajes `system` iniciales | Los trata como turnos separados | Los fusiona en un unico turno separado por dobles saltos de linea |
| Recuperacion de errores de herramienta | No soportada, o genera avisos falsos con resultados que contienen "error" | Recuperacion en dos niveles con desambiguacion de codigo y `grep` |
| Soporte de flag en llama.cpp | Requiere kwargs manuales | Alias nativo `preserve_reasoning` para `--reasoning-preserve` |
| Herramienta de diagnostico | Ninguna | `scripts/check_applied.py` |

Comparacion con alternativas de mismo proposito: no disponible. La informacion proporcionada no identifica otras plantillas alternativas de terceros para Qwen 3.5/3.6/3.8.

## Limitaciones y advertencias

- No es un modelo: no genera texto por si mismo, no tiene pesos ni benchmarks de calidad asociados. Evaluarlo como modelo carece de sentido.
- Repositorio sin validacion de la comunidad: 0 descargas y 0 likes en la fecha de consulta, autor unico y sin historial de mantenimiento verificable.
- La model card describe modelos de la familia Qwen 3.5, 3.6, 3.8 y `Qwen3.8-2.4T-A95B` con fechas de 2026, posteriores al conocimiento disponible. No se puede verificar de forma independiente la existencia, especificaciones ni comportamiento de esos modelos destino.
- El README proporcionado esta truncado: la seccion de SGLang queda cortada a mitad de frase, por lo que pueden faltar instrucciones relevantes.
- Riesgo de deriva con actualizaciones oficiales: al sustituir la plantilla embebida, una futura version oficial con nuevos tokens especiales o nuevos campos de razonamiento puede quedar enmascarada por esta plantilla.
- Dependencia del motor: la propia documentacion advierte de que el parser de vLLM no inspecciona etiquetas dinamicas `<\|think_off\|>` insertadas en el cuerpo del prompt (solo el parametro `enable_thinking: false` o `reasoning_effort: "none"`), y de que SGLang 0.5.x ignora un `chat_template.jinja` local salvo que se pase `--chat-template` explicitamente. El comportamiento, por tanto, no es homogeneo entre motores.
- Los alias de tool parser dependen de la version de vLLM: `qwen3_xml` en versiones actuales, `qwen3_coder` en compilaciones antiguas y `hermes` si se fuerza `tool_call_format="json"`. Un alias incorrecto provoca fallos de parseo silenciosos.
- Idiomas soportados: no disponibles. No hay evidencia de validacion multilingue de la plantilla, y su documentacion esta unicamente en ingles.
- Sesgos conocidos y riesgo de alucinacion: no disponibles para el artefacto; dependen exclusivamente del modelo Qwen subyacente.
- Apoyo al despliegue con licencia Apache 2.0: permite uso comercial y modificacion, incluida la redistribucion, siempre que se conserve el aviso de licencia. No impone restricciones adicionales conocidas. La licencia cubre la plantilla, no los modelos sobre los que se aplica.
- En produccion, conviene verificar con `scripts/check_applied.py` que la plantilla activa es la esperada antes de promover un despliegue, y validar la extraccion de razonamiento y el parseo de herramientas de extremo a extremo con el cliente concreto.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/brakcity/Qwen-Fixed-Chat-Templates
- Paper, blog o repositorio adicional: no disponible en la informacion proporcionada.
- La busqueda web realizada no devolvio resultados relevantes: todos los enlaces recuperados corresponden a YouTube (https://www.youtube.com/youtube, https://www.youtube.com/feed/yt+, https://music.youtube.com/, https://en.wikipedia.org/wiki/YouTube, https://www.yt-industries.com/) y no guardan relacion con el repositorio ni con plantillas de chat para Qwen.
