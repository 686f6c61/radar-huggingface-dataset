# NorviTech/arrmes-qwen3-0.6b

## Resumen

Arrmes-Qwen3-0.6B es un ajuste fino mediante LoRA de Qwen3-0.6B orientado especificamente a function calling para la gestion de infraestructura autoalojada. Lo desarrolla NorviTech y esta disenado para enrutar peticiones en lenguaje natural hacia un contrato cerrado de 20 acciones (`arrmes.tools.v2`) que cubre servicios como Sonarr, Radarr, Lidarr, Tautulli, qBittorrent, Seer, Bitmagnet y un portal de peticiones propio. El modelo base es el transformer denso Qwen3-0.6B, sobre el que se aplica un adaptador LoRA de rango 8 en fp16 de aproximadamente 344 MB, manteniendo la base cuantizada a 4 bits.

La propuesta no es un modelo generalista, sino un componente de enrutamiento con verificacion determinista posterior: el modelo genera propuestas de llamada a herramienta que un guardrail externo (`BoundedExecutor` + `LiveGatewayAdapter`) valida antes de ejecutar cualquier escritura, exigiendo un token HMAC-SHA256 de corta duracion. El autor reporta entre 97,6 % y 99,7 % de exactitud exacta en tool calls tras verificacion (90,6 %–96,6 % en salida cruda del modelo) sobre conjuntos de evaluacion reservados, con latencia p50 en caliente de 230–245 ms en un Apple M4 Pro.

Su relevancia actual reside en el nicho: demuestra que un modelo de 0,6 B de parametros puede sustituir a un LLM grande en tareas de enrutamiento estructurado cuando se entrena con destilacion verificada contra un sandbox con estado, reduciendo coste y latencia en despliegues domoticos autoalojados. La licencia Apache-2.0 y el formato MLX lo hacen directamente desplegable en Apple Silicon.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3-0.6B) con adaptador LoRA rango 8 fp16 |
| Parametros totales | 0,6 B (base) + adaptador LoRA (~344 MB en disco junto a la base 4-bit) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen3-0.6B; no especificada en la model card) |
| Tipos de cuantizacion | Base 4-bit; adaptador LoRA en fp16 (la fusion con cuantizacion doble fue descartada por el autor) |
| Idiomas soportados | Ingles (segun metadatos del modelo) |
| Licencia | Apache-2.0 (heredada de Qwen/Qwen3-0.6B) |
| Formato de pesos | MLX (libreria `mlx`); no se indica GGUF ni safetensors en la informacion disponible |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-0.6B, un transformer denso de 0,6 mil millones de parametros, sobre el que se entrena un adaptador LoRA de rango 8 en fp16. La base permanece cuantizada a 4 bits y el adaptador se mantiene separado, ya que el autor indica que fusionarlo con la base cuantizada "borraba los deltas del adaptador" por doble cuantizacion. El resultado ocupa unos 344 MB en disco y se ejecuta con la libreria MLX en Apple Silicon, empleando doble cache KV de prefijo para reducir latencia.

El entrenamiento se describe como "destilacion verificada en ejecucion": el modelo se entrena exclusivamente con llamadas candidatas que fueron verificadas contra un cluster sandbox con estado de 9 servicios sobre SQLite (`SandboxCluster`), con separacion estricta de cohortes de entidades para evitar fuga de datos. El contrato objetivo es `arrmes.tools.v2`, con 20 acciones que incluyen consultas de estado, busquedas, control de torrents, descubrimiento, peticiones y abstencion estructurada (`clarify`, `unsupported`). No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Generacion de llamadas a herramienta en formato `<tool_call>{"name": ..., "arguments": {...}}</tool_call>` sobre un contrato cerrado de 20 acciones.
- Enrutamiento de operaciones de lectura sobre Sonarr, Radarr, Lidarr, Tautulli, qBittorrent, Seer, Bitmagnet, DH-Waypoint y portal de peticiones.
- Operaciones de escritura controlada (pausar/reanudar torrents, crear peticiones) tratadas como propuestas sujetas a verificacion externa.
- Abstencion estructurada: emite `clarify` con el slot faltante cuando la peticion es ambigua y `unsupported` ante peticiones compuestas o destructivas.
- Rechazo de alucinaciones de escritura con titulo ausente, pronombres sin referente (`it`, `that one`), payloads de inyeccion de prompt embebidos en nombres de fichero y comandos destructivos (`delete`, `wipe`, `pause all`).
- Flujos multi-turno con estado: 100 % (30/30) en cadenas de 2–3 turnos segun el autor.
- No se documentan capacidades de vision, audio, razonamiento general ni matematicas fuera del contrato de herramientas.

## Casos de uso

- Enrutamiento de peticiones en un stack *arr autoalojado: el modelo traduce frases como "comprueba si faltan episodios de Sintel" a `tv_missing` con argumentos estructurados, evitando que el usuario interactue directamente con las APIs de Sonarr o Radarr.
- Asistente conversacional para gestion de torrents: interpreta ordenes como pausar o reanudar descargas concretas y las emite como propuestas que el `BoundedExecutor` valida antes de tocar qBittorrent.
- Portal de peticiones de medios: convierte solicitudes ambiguas ("anade Tears of Steel") en una llamada `clarify` con el slot `media_type` para que el sistema pida el dato que falta en lugar de inventarlo.
- Descubrimiento y busqueda federada: enruta consultas hacia `seer_discover`, `bitmagnet_search` o `music_search` segun la intencion detectada, con latencia inferior a 250 ms en caliente.
- Capa de seguridad en agentes: actua como primer filtro que rechaza comandos destructivos e inyecciones de prompt antes de que lleguen al ejecutor, reduciendo la superficie de ataque de un agente con acceso a escritura.
- Despliegue local en Mac mini o MacBook con Apple Silicon: al ocupar ~344 MB y ejecutarse en MLX, permite mantener el enrutamiento en el propio equipo sin depender de APIs externas ni de GPU dedicada.
- Automatizacion de informes de visionado: consulta `now_playing` y `watch_history` en Tautulli para generar resumenes de actividad bajo demanda.

## Benchmarks y rendimiento

| Suite | N | Exactitud exacta | Escrituras inesperadas |
|---|---|---|---|
| Sealed Acceptance v3 (cohorte 400) | 314 | 99,7 % (313/314) | 0/229 (cota superior CP 95 %: 1,30 %) |
| Sealed Acceptance v2 (cohorte 300) | 139 | 97,1 % (135/139) | 0/99 |
| Regression v2 (adversarial, trampas de 1 palabra) | 85 | 98,8 % (84/85) | no disponible |
| Distilled Dev v2 (cohorte 200) | 147 | 98,0 % (144/147) | no disponible |
| Legacy Eval v1 (contrato de 15 acciones) | 109 | 99,1 % (108/109) | no disponible |
| Legacy Challenge v2 (negacion y trampas de contexto) | 60 | 96,7 % (58/60) | no disponible |
| Multi-Step Workflows (2–3 turnos) | 30 | 100,0 % (30/30) | no disponible |

El autor reporta ademas una exactitud en salida cruda del modelo de entre 90,6 % y 96,6 %, que sube al rango 97,6 %–99,7 % tras aplicar el guardrail de verificacion determinista. La latencia p50 en caliente es de 230–245 ms en un Apple M4 Pro con doble cache KV de prefijo. No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM/disco: aproximadamente 344 MB en disco (base 4-bit + adaptador LoRA fp16); la memoria en ejecucion depende de la implementacion MLX y del contexto, no especificada en la model card.
- Hardware de referencia: Apple M4 Pro, donde el autor mide 230–245 ms p50 en caliente.
- Compatibilidad: disenado para Apple Silicon mediante la libreria MLX; no se documenta soporte para CUDA, ROCm ni CPU x86.
- GPU consumer: al ser un modelo de 0,6 B cuantizado a 4 bits, cabria en cualquier GPU consumer moderna, pero la informacion disponible solo valida el camino MLX en Apple Silicon.
- Opciones de despliegue: MLX con el wrapper `arrmes.model.LocalModel` (familia `hermes`, adaptador `qwen3-06b-distilled-v6`, contrato `v2`), acompanado de `BoundedExecutor` y `LiveGatewayAdapter` en modo `write_mode="confirm"`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Throughput: no disponible mas alla de la latencia p50 indicada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Arrmes-Qwen3-0.6B | 0,6 B + LoRA | no disponible | Function calling para stack *arr autoalojado | Apache-2.0 | HuggingFace (MLX) |
| Qwen/Qwen3-0.6B (base) | 0,6 B | no disponible | LLM generalista | Apache-2.0 | HuggingFace |
| Modelos de function calling de mayor tamano (p. ej. variantes de 7–8 B) | 7–8 B | variable | Tool use generalista | variable | HuggingFace |

La comparacion directa con alternativas especializadas en function calling no esta disponible en la informacion proporcionada. Frente a su modelo base, Arrmes anade el contrato cerrado de 20 acciones, la abstencion estructurada y el rechazo de comandos destructivos, a costa de perder generalidad fuera del dominio *arr.

## Limitaciones y advertencias

- Dominio cerrado: solo cubre las 20 acciones de `arrmes.tools.v2`; fuera de ese contrato el modelo no es util como asistente general.
- Idioma: la model card declara unicamente ingles; el rendimiento en castellano no esta documentado.
- Dependencia de guardrail: las cifras de 97,6 %–99,7 % incluyen la verificacion determinista externa; la salida cruda baja a 90,6 %–96,6 %, por lo que desplegarlo sin `BoundedExecutor` degrada la fiabilidad y elimina la garantia de cero escrituras inesperadas.
- Riesgo de alucinacion en escrituras: el autor lo mitiga con verificacion, pero el modelo por si solo puede proponer llamadas con titulos inventados o pronombres sin referente.
- Superficie de ataque: la model card menciona payloads de inyeccion de prompt en nombres de fichero; el filtrado depende del guardrail, no solo del modelo.
- Plataforma: validado unicamente en Apple Silicon con MLX; no hay datos de rendimiento en CUDA ni en CPU.
- Sesgos: no se documentan evaluaciones de sesgo en la informacion disponible.
- Uso comercial: permitido bajo Apache-2.0, sin restricciones adicionales indicadas por el autor.
- Madurez: repositorio con 0 descargas y 0 likes en el momento de la consulta; el proyecto es reciente y sin validacion independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/NorviTech/arrmes-qwen3-0.6b
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Sitio del autor (NorviTech Suite): https://norvitech.com
