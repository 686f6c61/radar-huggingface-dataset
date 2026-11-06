# barrenechea/qwen-turbo-brilliance-chat-template

## Resumen

Turbo-Brilliance Chat Template es una plantilla de chat (`chat_template.jinja`) de proposito general para modelos de la familia Qwen 3.5, 3.6 y 3.8, incluido Qwen3.8-Flash-Next, la vista previa de la arquitectura Qwen4 publicada por Qwen. No se trata de un modelo con pesos propios, sino de un artefacto Jinja que define como se formatea la conversacion (turnos, herramientas, modo de razonamiento) antes de pasarla al tokenizador. Lo desarrolla el usuario de Hugging Face barrenechea combinando dos trabajos previos: la plantilla corregida de froggeric y los modos de razonamiento Turbo-Brilliance de DavidAU.

El problema que resuelve es la dispersion de formatos entre motores de inferencia (transformers, vLLM, llama.cpp) y la falta de un mecanismo unico para alternar entre razonamiento encendido, apagado, modos de persona o esfuerzo variable. La plantilla unifica 41 modos de razonamiento seleccionables por prompt mediante la etiqueta `{REASON:<modo>}` y mantiene compatibilidad byte a byte con las plantillas de las que deriva cuando no se usa etiqueta.

Es relevante porque permite a un mismo checkpoint de Qwen cambiar de comportamiento (coder, teacher, business, reasoning profundo, etc.) sin reentrenar ni recargar pesos, y porque anade correcciones para el frontend Rust de vLLM y para el numerado de imagenes con `add_vision_id`. Al ser solo Jinja, su coste de despliegue es nulo y funciona con cualquier cuantizacion del modelo subyacente (GGUF, safetensors, AWQ, etc.).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | plantilla de chat Jinja2 (no es un modelo con pesos) |
| Parametros totales | no disponible (depende del modelo Qwen subyacente) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (la hereda del modelo Qwen sobre el que se aplica) |
| Tipos de cuantizacion | no aplica al artefacto; compatible con cualquier cuantizacion del modelo base (GGUF, safetensors, etc.) |
| Idiomas soportados | no disponibles (los determina el modelo Qwen subyacente) |
| Licencia | otra: `apache-2.0-and-davidau-terms` |
| Formato de pesos | `chat_template.jinja` (texto Jinja); se usa junto a pesos safetensors o GGUF del modelo base |

## Arquitectura y entrenamiento

El artefacto es una plantilla Jinja2 que se inyecta en el tokenizador (`tokenizer.chat_template`) o se pasa como fichero a motores como llama.cpp (`--chat-template-file`), vLLM (`--chat-template`) o Strata. No hay entrenamiento propio: la plantilla compone dos trabajos previos. La base es la plantilla corregida de froggeric, que aporta tool calling en XML o JSON, control de thinking, gestion del historial y correcciones para motores. Sobre ella se superponen los modos de razonamiento Turbo-Brilliance de DavidAU: 41 prompts de sistema (personas, marcos de razonamiento, paneles de expertos) que se seleccionan por prompt con `{REASON:<modo>}`.

La logica de seleccion es determinista: la ultima etiqueta en un mensaje de usuario gana, de modo que una etiqueta en el primer turno permanece activa a traves de todas las llamadas a herramientas. La etiqueta se elimina del prompt antes de que lo vea el modelo. Una etiqueta sobrescribe ajustes como `enable_thinking` y `reasoning_effort`. Sin etiqueta, el esfuerzo por defecto es `xhigh`, usando la frase de direccionamiento de Qwen 3.8; este valor es editable en `default_effort` y `default_effort_instruct` al inicio de la plantilla. Se verifica que Jinja2 (transformers) y minijinja (frontend Rust de vLLM) rendericen el mismo prompt, y llama.cpp se comprobo manualmente. Ademas, corrige el numerado de imagenes con `add_vision_id` y evita que una peticion solo con mensaje de sistema haga caer el frontend Rust de vLLM (froggeric#109).

## Capacidades

- Control de modo de razonamiento por prompt: 41 modos agrupados en marcos de razonamiento (`omni`, `deeptree`, `hyper`, `socrates`, `logic`, `einstein`, `spoon`, `ultra`), variantes con esfuerzo xhigh (`xomni`, `xdeeptree`, `xhyper`, `xsocrates`, `xlogic`, `xeinstein`, `xspoon`, `xhelp`), expertos y agentes (`holodeck`, `prompt`, `musk`, `curie`, `007`, `joe`), personajes (`pkd`, `neo`, `stark`, `matlock`, `house`, `vader`, `joker`, `quinn`), especialistas multi-persona (`brainstorm`, `business`, `coder`, `comedy`, `story`, `teacher`) y niveles de esfuerzo Qwen (`xhigh`, `medium`, `low`).
- Alternancia de thinking on/off mediante `{REASON:icoder}`, `{REASON:off}` y `{REASON:ioff}`.
- Tool calling en formato XML o JSON, heredado de la plantilla de froggeric.
- Compatibilidad con modelos multimodales: mantiene correcto el numerado de imagenes (`add_vision_id`).
- Autodescripcion de modos: enviar `{REASON:help}` hace que el modelo explique cada modo y cual conviene a la tarea.
- Compatibilidad con motores: transformers, vLLM (Jinja2 y minijinja), llama.cpp y Strata (app y CLI).
- Integracion con subagentes de opencode mediante `turbo-brilliance-agents`, un subagente por modo.

## Casos de uso

- Razonamiento profundo en produccion: aplicar `{REASON:xhyper}` o `{REASON:deeptree}` a consultas de analisis para forzar esfuerzo `xhigh` con un marco estructurado, sin cambiar de checkpoint ni de configuracion del servidor.
- Generacion de codigo asistida: usar `{REASON:coder}` para thinking activado o `{REASON:icoder}` para respuesta directa en pipelines de CI/CD donde la latencia importa y no se quiere cadena de pensamiento visible.
- Atencion al cliente con tool calling: la plantilla emite llamadas a herramientas en XML o JSON compatibles con vLLM y llama.cpp, lo que permite orquestar consultas a CRM o bases de datos desde un mismo servidor Qwen.
- Agentes multi-paso con opencode: desplegar un subagente por modo (por ejemplo `business`, `teacher`, `coder`) usando `turbo-brilliance-agents`, aprovechando que la etiqueta persiste a traves de todas las llamadas a herramientas.
- Evaluacion comparativa de prompts: alternar modos por peticion para medir como cambia la calidad de respuesta en el mismo modelo, sin recargar pesos ni reiniciar el motor.
- Ensenanza y explicaciones: el modo `teacher` convierte el prompt de sistema para adoptar una persona didactica, util en plataformas de formacion que sirven un unico modelo Qwen.
- Procesamiento de imagenes con vision: en modelos multimodales Qwen, la plantilla mantiene la numeracion de imagenes correcta, lo que evita referencias erroneas en conversaciones con varias imagenes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al ser una plantilla de chat y no un modelo con pesos, no procede comparar metricas de calidad tipo MMLU o HumanEval; el rendimiento depende integramente del checkpoint Qwen subyacente y de la cuantizacion empleada.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica a la plantilla; depende del modelo Qwen 3.5, 3.6 o 3.8 sobre el que se aplique y de su cuantizacion.
- GPU recomendadas: no disponibles; vendran determinadas por el tamano del checkpoint Qwen elegido (desde consumer hasta A100/H100 para variantes grandes).
- Cabe en consumer GPU: si, siempre que el checkpoint Qwen subyacente quepa en la VRAM disponible tras la cuantizacion.
- Opciones de despliegue: llama.cpp (`llama-server -m model.gguf --jinja --chat-template-file chat_template.jinja`), vLLM (`vllm serve <model> --chat-template chat_template.jinja`), transformers (`tokenizer.chat_template = open("chat_template.jinja").read()`) y la app/CLI Strata copiando el fichero al directorio `tokenizer` del pack del modelo.
- Latencia y throughput estimados: no disponibles; los modos con thinking activado incrementan el numero de tokens generados y, por tanto, la latencia respecto a los modos instruct (`i*`).

## Comparativa con modelos similares

| Plantilla | Base | Modos de razonamiento | Tool calling | Correcciones de motor | Licencia |
|---|---|---|---|---|---|
| Turbo-Brilliance (esta) | froggeric + DavidAU | 41 modos por etiqueta | XML y JSON | vLLM Rust, imagenes, solo-sistema | apache-2.0-and-davidau-terms |
| froggeric Qwen-Fixed-Chat-Templates | plantilla oficial Qwen corregida | no | XML y JSON | parciales | Apache-2.0 |
| Plantilla oficial de Qwen | Qwen | solo thinking on/off | si | no documentadas | segun modelo Qwen |
| DavidAU Turbo-Brilliance (original) | plantilla propia | 41 modos | segun base | no documentadas | terminos de DavidAU |

## Limitaciones y advertencias

- No es un modelo: no genera texto por si misma; requiere un checkpoint Qwen 3.5, 3.6 o 3.8 compatible con el formato de tokens y herramientas esperado.
- Licencia mixta: la base es Apache-2.0, pero los modos y prompts de DavidAU estan sujetos a sus propios terminos; es obligatorio revisar el aviso incluido en la plantilla y las model cards de DavidAU antes de uso comercial.
- Los modos son prompts de sistema: pueden incrementar la longitud del prompt y el coste por peticion, y su calidad depende del modelo subyacente; DavidAU los ajusto sobre Qwen 3.8, por lo que en 3.5 y 3.6 el comportamiento puede diferir.
- El esfuerzo por defecto es `xhigh`, lo que activa thinking y aumenta la latencia; en produccion conviene cambiarlo a `medium` o `low`, o usar modos `i*`.
- Riesgo de alucinacion y sesgos: heredados del modelo Qwen subyacente; los modos de personaje (`vader`, `joker`, etc.) pueden producir respuestas deliberadamente dramaticas o poco rigurosas.
- Idiomas soportados: no documentados en la informacion disponible; dependen del checkpoint Qwen.
- Validacion limitada: aunque se verifica la equivalencia byte a byte con las plantillas padre y la paridad Jinja2/minijinja, llama.cpp solo se comprobo manualmente, sin suite automatizada publicada.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/barrenechea/qwen-turbo-brilliance-chat-template
- Modelo Qwen3.8-Flash-Next: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Plantilla base de froggeric: https://huggingface.co/froggeric/Qwen-Fixed-Chat-Templates
- Discusion froggeric#109: https://huggingface.co/froggeric/Qwen-Fixed-Chat-Templates/discussions/109
- Coleccion Turbo-Brilliance de DavidAU: https://huggingface.co/collections/DavidAU/turbo-brilliance-ai-constructs-50x-reasoning-instruct-6ad18e0e214376f367ecccd1
- Model cards de DavidAU: https://huggingface.co/DavidAU
- Subagentes opencode turbo-brilliance-agents: https://github.com/barrenechea/turbo-brilliance-agents
- Strata (app y CLI): https://github.com/Niko1221/Strata
