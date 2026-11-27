# ferry-el-kom/qwen3.8-4b-empero-v27-Hermes-agentic-subagent-toolcalls

## Resumen

Qwen3.8-4B-empero v27 es un ajuste fino (LoRA) de tipo estudiante destilado sobre el modelo Jackrong/Qwen3.5-4B-Claude-4.6-Opus-Reasoning-Distilled-v2, publicado por el usuario ferry-el-kom en Hugging Face. Su proposito declarado es actuar como subagente dentro del arnes Hermes Agent, especializado en ejecucion de tareas agenticas con llamadas a herramientas (tool calls) y disciplina de entrega de resultados. El modelo se distribuye principalmente en formato GGUF (q8_0 y q4_K_M) y esta pensado para ejecucion local en equipos de gama consumer.

Con 4.326.350.848 parametros totales (aproximadamente 4,3 mil millones), se situa en la categoria de modelos pequenos orientados a agentes. La model card indica que fue entrenado con trazas de profesores en la nube (GLM-5.2/5.3 y DeepSeek) sobre flujos de trabajo de produccion industrial con privilegios root, lo que condiciona fuertemente su comportamiento esperado: ejecucion de comandos sudo, parcheo de firmware, flasheo de dispositivos y automatizacion de lineas de produccion.

La relevancia actual del modelo radica en su enfoque en corregir fallos medidos de comportamiento agentico (informes de exito confabulados, entregables fuera del directorio de trabajo, fabricacion de entradas, incumplimiento de ordenes de parada y falta de verificacion), un problema practico comun en pipelines de agentes. La licencia es MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-4B), con capa MTP/nextn para decodificacion especulativa |
| Parametros totales | 4.326.350.848 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible de forma oficial; la model card menciona KV cache q8_0 funcionando a 72k+ de contexto en 8 GB de VRAM |
| Tipos de cuantizacion | q8_0 y q4_K_M en GGUF (publicados); el modelo base admite otras cuantizaciones estandar |
| Idiomas soportados | no disponible; la model card menciona comprension del rumano entre las correcciones de comportamiento |
| Licencia | MIT |
| Formato de pesos | GGUF (q8_0, q4_K_M); el repositorio ocupa 7,4 GB |
| Libreria declarada | hermes |
| Modelo base | Jackrong/Qwen3.5-4B-Claude-4.6-Opus-Reasoning-Distilled-v2 |
| Tokenizer | Snapshot `5185de0c` de Jackrong Qwen3.5-4B, cargado con `fix_mistral_regex=True`; plantilla de chat y tokenizer embebidos en los GGUF |
| SHA-256 tokenizer.json | `87a7830d63fc…` |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura transformer de Qwen3.5-4B y aplica un LoRA nuevo (r=32, alpha=64, all-linear) sobre una base normalizada v21 de 2.921 ventanas, a la que se anaden 480 ventanas de correccion de comportamiento en cinco familias orientadas a fallos medidos: golden (disciplina de entregables, 195 ventanas), rituals (flujo de trabajo, 75), stop-conditions (50), behavioral (130, cubriendo stop-command, timeout-aware, foreground-first, PID-tracking, verify-before-destroy, version de Python, confirmacion de tarea y comprension del rumano) y anti-fabrication (30, con reverify-path, ask-clarification y report-absent). El entrenamiento consistio en 426 pasos (2 epocas), con SEQ 1280 y LR 2e-5, alcanzando una perdida final de entrenamiento de 0,79.

La destilacion se realizo a partir de profesores en la nube (GLM-5.2/5.3 y DeepSeek) que operaban en flujos de produccion industrial con privilegios root: comandos sudo, depuracion a nivel de software y hardware en microcontroladores y ECU/MCU, dispositivos Android/MicroPython/Linux/RTOS embebidos, flasheo de ROMs, parcheo de firmwares, construccion de ROMs y sistemas operativos personalizados, sustitucion de funciones, reconstruccion de paneles de control y conduccion autonoma de lineas de produccion. La innovacion tecnica destacable es la capa MTP/nextn incluida en los GGUF (441 tensores en total), que permite decodificacion especulativa opcional.

## Capacidades

- Generacion de texto conversacional y razonamiento orientado a tareas.
- Ejecucion agentica con llamadas a herramientas (tool calling / function calling) dentro del arnes Hermes Agent.
- Comportamiento de subagente con disciplina de entregables: escritura de resultados dentro del directorio de trabajo.
- Cumplimiento de condiciones de parada (stop-conditions) y respeto de ordenes de stop del usuario.
- Verificacion previa a acciones destructivas (verify-before-destroy) y seguimiento de PID.
- Manejo de timeouts y ejecucion en primer plano (foreground-first).
- Anti-fabricacion: peticion de aclaracion cuando falta una ruta o archivo, en lugar de crearlo.
- Comprension multilingue parcial, con correcciones especificas para rumano.
- Soporte de decodificacion especulativa mediante la capa MTP/nextn.
- Capacidad potencial de ejecutar comandos sudo y operaciones de sistema, heredada de los profesores.

## Casos de uso

- Automatizacion de tareas de administracion de sistemas: el modelo puede encadenar comandos, verificar rutas y respetar condiciones de parada, lo que lo hace adecuado para scripts de mantenimiento en Ubuntu 22.04 con guardrails explicitos.
- Subagente en pipelines de agentes Hermes: se integra como subagente especializado en tool calls, con prompts de sistema cortos por categoria, reduciendo la deriva en tareas de varios pasos.
- Depuracion de dispositivos embebidos: entrenado con trazas de depuracion de ECU/MCU y dispositivos Android/MicroPython/Linux/RTOS, puede asistir en la identificacion de fallos y en la aplicacion de parches controlados.
- Gestion de flasheo y parcheo de firmware: util en laboratorios de validacion donde se requiere reflashear ROMs o aplicar parches, siempre con aislamiento y confirmacion de tarea.
- Asistente de operaciones con verificacion obligatoria: su entrenamiento anti-fabricacion lo hace apropiado para tareas donde reportar numeros sin comprobar es inaceptable, como inventarios o comprobaciones de estado.
- Despliegue local en estaciones de trabajo con GPU consumer: los GGUF q4_K_M (2,59 GiB) y q8_0 (4,29 GiB) permiten ejecucion en LM Studio, Ollama o llama.cpp, con KV cache q8_0 a 72k+ de contexto en 8 GB de VRAM.
- Atencion a incidencias con ordenes de parada: adecuado para entornos donde el operador necesita detener el agente de forma fiable, gracias a las ventanas de stop-conditions.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente referencia una comparacion cualitativa con la version v26b a partir de un benchmark de agente real, sin cifras numericas.

## Requisitos de hardware

- VRAM estimada: aproximadamente 2,6 GiB para q4_K_M y 4,3 GiB para q8_0 en pesos; la model card indica que el KV cache q8_0 funciona a 72k+ de contexto en 8 GB de VRAM.
- GPU recomendadas: no disponibles de forma explicita; por tamano, cabe en GPU consumer de 8 GB o superior (por ejemplo, RTX 3060 Ti, RTX 4060 Ti, RTX 3070) y en GPUs de datacenter como A100 o H100 sin problema.
- Cabe en GPU consumer: si, en modelos con al menos 8 GB de VRAM para las cuantizaciones publicadas.
- Opciones de despliegue: LM Studio, Ollama y llama.cpp segun la model card; la libreria declarada es hermes. No se mencionan vLLM ni TGI.
- Latencia y throughput: no disponibles.
- Notas de serving: herencia de cwd de sesion, reparacion automatica de rutas con espacios, MTP/nextn opcional si no se usa decodificacion especulativa, y prompt de sistema corto recomendado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-4B-empero v27 | 4,33 B | no disponible (72k+ con KV q8_0 en 8 GB) | MIT | GGUF | Especializado en agentes Hermes y tool calls |
| Jackrong/Qwen3.5-4B-Claude-4.6-Opus-Reasoning-Distilled-v2 | no disponible | no disponible | no disponible | no disponible | Modelo base del que deriva |
| Alternativas de 4B de proposito general | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion disponible.

## Limitaciones y advertencias

- Comportamiento no probado fuera de Linux Ubuntu 22.04; en otros sistemas operativos el comportamiento es desconocido.
- Riesgo elevado de acciones destructivas: el modelo puede ejecutar comandos sudo, aplicar parches y reflashear firmware, heredado de profesores con privilegios root. La model card advierte explicitamente de usarlo con guardrails.
- Riesgo de alucinacion residual pese a las ventanas anti-fabricacion; la correccion se midio sobre fallos concretos y no garantiza ausencia total.
- Idiomas soportados no documentados; solo se menciona el rumano en las correcciones de comportamiento.
- Longitud de contexto oficial no disponible; el dato de 72k+ proviene de una nota de serving, no de una especificacion formal.
- Sesgos conocidos: no disponibles.
- Restricciones de licencia: licencia MIT, que permite uso comercial, pero el modelo base y los datos de destilacion pueden tener condiciones propias no detalladas.
- El dataset de entrenamiento es privado, lo que limita la auditabilidad.
- El prompt de sistema debe mantenerse corto; prompts largos pueden degradar el comportamiento entrenado.
- Modelo de 4B con 241 descargas y 0 likes: ecosistema de validacion muy limitado.

## Enlaces

- Hugging Face: https://huggingface.co/ferry-el-kom/qwen3.8-4b-empero-v27-Hermes-agentic-subagent-toolcalls
- Modelo base: https://huggingface.co/Jackrong/Qwen3.5-4B-Claude-4.6-Opus-Reasoning-Distilled-v2
- Dataset de entrenamiento (privado): ferry-el-kom/hermes-agentic-tooluse-v27-sft-dataset
- Paper, blog, repositorio o demo adicionales: no disponibles en la informacion proporcionada.
