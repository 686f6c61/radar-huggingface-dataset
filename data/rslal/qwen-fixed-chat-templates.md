# rslal/Qwen-Fixed-Chat-Templates

## Resumen

`rslal/Qwen-Fixed-Chat-Templates` no es un modelo de lenguaje, sino un repositorio de plantillas Jinja de chat (`chat_template.jinja`) destinadas a sustituir las plantillas oficiales de la familia Qwen 3.5, 3.6, 3.8 y 3.8 Flash-Next. El autor, `rslal`, publica la version v22.5 de una plantilla "universal" que corrige errores de renderizado, invalidacion de la cache KV, desperdicio de tokens, "empty think poisoning" y bloqueos en flujos agenticos que, segun la model card, afectan a las plantillas oficiales de Qwen.

El problema que aborda es de integracion, no de capacidad del modelo: las plantillas oficiales de Qwen 3.8 introducen el control de profundidad de razonamiento (`reasoning_effort`) pero, siempre segun el autor, anaden regresiones como el valor por defecto `xhigh`, excepciones fatales al desactivar el modo pensamiento en `Qwen3.8-2.4T-A95B`, perdida de extraccion de razonamiento en el historial y fallos al serializar argumentos de tool calling enviados como cadenas JSON por clientes OpenAI estandar.

Es relevante ahora porque los modelos Qwen 3.8 (incluidos `Qwen3.8-2.4T-A95B` y `Qwen3.8-27B`) se estan desplegando en motores de inferencia muy distintos (LM Studio, llama.cpp, vLLM, SGLang, MLX, oMLX, KoboldCPP) y la plantilla condiciona directamente el formato de prompt, el cacheado de prefijos y la compatibilidad con agentes de codigo como Claude Code, Cursor, Cline u OpenCode. El repositorio se distribuye bajo licencia Apache 2.0 y no contiene pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo; es una plantilla Jinja de chat) |
| Parametros totales | no disponible (no aplica) |
| Parametros activos | no disponible (no aplica) |
| Longitud de contexto | no disponible (depende del modelo Qwen subyacente) |
| Tipos de cuantizacion | no disponible (no aplica; la plantilla es independiente de la cuantizacion) |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | no aplica; se distribuye como `chat_template.jinja`, `chat_template_oneline.txt` y `scripts/check_applied.py` |

## Arquitectura y entrenamiento

No hay arquitectura de red neuronal ni entrenamiento: el artefacto es una plantilla Jinja que transforma una lista de mensajes en el formato de prompt que espera el tokenizador de Qwen. La logica de la plantilla gestiona la fusion de mensajes `system` y `developer` consecutivos en un unico turno, la extraccion de razonamiento desde los campos `reasoning_content` (OpenAI), `thinking` (Anthropic) y etiquetas `<think>` embebidas en el contenido, y la serializacion de argumentos de tool calling en XML canonico por defecto (con soporte para JSON serializado en el historial).

La innovacion principal es la gestion del "steering" de razonamiento: la plantilla mapea alias de esfuerzo de distintos clientes (`high`, `max`, `ultracode`, `extreme` hacia `xhigh`; `minimal` hacia `low`; `none`, `off` hacia desactivado) y admite etiquetas en linea (`<|think_low|>`, `<|think_medium|>`, `<|think_xhigh|>`, `<|think_ultracode|>`, `<|think_off|>`) que se eliminan antes de la inferencia y persisten en turnos posteriores. Tambien incorpora recuperacion de errores en tool calling en dos niveles, con desambiguacion para evitar falsos positivos en resultados de busqueda que contienen cadenas como `throw new Error(...)`. El objetivo declarado es preservar la paridad de cache KV con la generacion v21 y evitar timeouts por contenido vacio.

## Capacidades

- Renderizado de conversaciones multi-turno con roles `system`, `developer`, `user`, `assistant` y `tool` para modelos Qwen 3.5, 3.6, 3.8 y 3.8 Flash-Next.
- Control de profundidad de razonamiento mediante `enable_thinking`, `reasoning_effort` y etiquetas en linea, con modo no-razonamiento completo (`enable_thinking=false`, `reasoning_effort="none"`).
- Extraccion de razonamiento desde historiales en formatos OpenAI, Anthropic y etiquetas `<think>` sin duplicar etiquetas.
- Tool calling con formato XML canonico y tolerancia a argumentos JSON serializados como cadena.
- Mapeo automatico de alias de esfuerzo de clientes como Claude Code, Cursor, Cline y OpenAI.
- Fusion de mensajes `system` y `developer` iniciales consecutivos en un unico turno.
- Compatibilidad con el flag `--reasoning-preserve` de llama.cpp mediante el kwarg `preserve_reasoning`.
- Script de diagnostico `scripts/check_applied.py` para inspeccionar directorios de modelos y GGUF y comprobar la version de plantilla activa.

## Casos de uso

- Despliegue de Qwen 3.8 en llama.cpp o llama-server: se usa `--jinja --chat-template-file chat_template.jinja --reasoning-format deepseek` para que los bloques `<think>` se separen en el campo `reasoning_content` y no se filtren al stream de texto, evitando que los agentes de codigo se detengan a mitad de una tool call.
- Integracion con LM Studio: se sustituye la plantilla en el panel "Prompt Template" del modelo para corregir los errores de renderizado de la plantilla oficial sin cambiar de modelo ni de cuantizacion.
- Servido en vLLM: se reemplaza la cadena `chat_template` de `tokenizer_config.json` por `chat_template_oneline.txt` y se arranca con `--reasoning-parser qwen3 --tool-call-parser qwen3_xml` (o `qwen3_coder` en builds antiguas, `hermes` si se fuerza `tool_call_format="json"`).
- Servido en SGLang: se pasa `--chat-template chat_template.jinja` de forma explicita, porque SGLang 0.5.x ignora por defecto el archivo local y recurre a la plantilla embebida en `tokenizer_config.json`.
- Agentes de codigo autonomos (Claude Code, Cursor, Cline, OpenCode): la plantilla normaliza los alias de esfuerzo y los argumentos de herramientas de cada cliente, lo que reduce fallos de formato en cadenas multi-paso con muchas llamadas a herramientas.
- Diagnostico de despliegues existentes: `scripts/check_applied.py` permite verificar que version de plantilla esta activa en un directorio de modelo o GGUF antes de dar por bueno un despliegue en produccion.
- Recuperacion tras errores de herramienta: la logica de dos niveles evita que resultados de busqueda que contienen la palabra "error" disparen advertencias falsas y escalen incorrectamente el flujo agentico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de calidad, latencia ni throughput; las afirmaciones sobre mejoras (paridad de cache KV, reduccion de desperdicio de tokens, evitacion de timeouts) son cualitativas y no estan cuantificadas.

## Requisitos de hardware

- No aplica VRAM propia: la plantilla no contiene pesos y se ejecuta en el motor de inferencia junto al modelo Qwen.
- El consumo de VRAM y los requisitos de GPU dependen exclusivamente del modelo Qwen subyacente (por ejemplo, `Qwen3.8-27B` o `Qwen3.8-2.4T-A95B`); no se proporcionan cifras en la informacion disponible.
- Opciones de despliegue soportadas segun la model card: LM Studio, llama.cpp / llama-server, KoboldCPP, vLLM, SGLang, MLX y oMLX, y en general cualquier motor que soporte plantillas Jinja de Hugging Face.
- Latencia y throughput: no disponibles; la plantilla puede afectar al uso de tokens (el autor afirma que el valor por defecto `medium` inyecta cero tokens), pero no se ofrecen mediciones.

## Comparativa con modelos similares

| Repositorio | Contenido | Licencia | Mismo autor | Estado |
|---|---|---|---|---|
| `rslal/Qwen-Fixed-Chat-Templates` | Plantilla Jinja v22.5 para Qwen 3.5/3.6/3.8 | Apache 2.0 | si | 0 descargas, 0 likes |
| `froggeric/Qwen-Fixed-Chat-Templates` | Plantilla Jinja con la misma descripcion funcional | no disponible | no | espejo o fork aparente |
| `scchow/Qwen-Fixed-Chat-Templates` | Plantilla Jinja con la misma descripcion funcional | no disponible | no | espejo o fork aparente |

No se dispone de informacion sobre diferencias tecnicas entre estas tres copias ni sobre plantillas alternativas de terceros; la comparacion se limita a la existencia de repositorios con descripcion identica.

## Limitaciones y advertencias

- No es un modelo: no genera texto por si mismo y no puede evaluarse con benchmarks de capacidad.
- El repositorio registra 0 descargas y 0 likes, y la model card no incluye validacion independiente; las correcciones descritas proceden del propio autor.
- La plantilla esta acoplada a la sintaxis interna de Qwen (etiquetas `<|think_off|>`, `<|think_low|>`, etc.); cambios en plantillas o tokenizadores oficiales pueden romperla.
- El comportamiento de desactivacion de razonamiento varia por motor: vLLM comprueba `enable_thinking: false` o `reasoning_effort: "none"` a nivel de peticion, pero no inspecciona etiquetas `<|think_off|>` embebidas en el cuerpo del prompt.
- La seleccion del parser de tool calls depende de la version de vLLM (`qwen3_xml`, `qwen3_coder` o `hermes`), lo que introduce riesgo de incompatibilidad en despliegues desactualizados.
- No se documentan sesgos, tasas de alucinacion ni cobertura linguistica, porque dependen del modelo Qwen subyacente y no de la plantilla.
- La licencia Apache 2.0 permite uso comercial de la plantilla, pero no concede derechos sobre los pesos de Qwen, que se rigen por su propia licencia.
- No se especifican versiones minimas de los motores soportados ni pruebas de regresion automatizadas.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/rslal/Qwen-Fixed-Chat-Templates
- Copia con descripcion identica: https://huggingface.co/froggeric/Qwen-Fixed-Chat-Templates
- Copia con descripcion identica: https://huggingface.co/scchow/Qwen-Fixed-Chat-Templates
