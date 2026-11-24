# gabguerin/openenv-daw-lfm3-1.7b-sft

## Resumen

`openenv-daw-lfm3-1.7b-sft` es un ajuste fino supervisado (SFT) con LoRA, fusionado en pesos bf16, del modelo base LiquidAI/LFM3-1.7B. Lo desarrolla el usuario gabguerin y su proposito es operar una estacion de trabajo de audio digital (DAW, Digital Audio Workstation) mediante el conjunto de herramientas MCP portable del entorno `gabguerin/openenv-daw`. No es un modelo de proposito general: es un especialista en tool calling sobre un dominio muy concreto.

El modelo resuelve el problema de traducir instrucciones en lenguaje natural (por ejemplo, configurar una sesion, ajustar un dispositivo, cargar un sonido o editar notas) en secuencias de llamadas a herramientas MCP que el entorno DAW ejecuta. Con 1.728.801.536 parametros y un tamano de repositorio de 3,5 GB en safetensors, esta pensado para ejecutarse en local, incluso en Apple Silicon mediante `mlx_lm.server`.

Su relevancia radica en el enfoque: demuestra que un modelo pequeno (1.7B) puede alcanzar una tasa de exito del 80,2% en tareas de tool-use dentro de un entorno agente acotado, aunque con una brecha clara entre tareas puramente instrumentales (94,5% de exito) y tareas musicales complejas (36,7%). Es un caso de estudio util sobre los limites del SFT en modelos compactos para agentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base LFM3; pesos en safetensors con `custom_code`) |
| Parametros totales | 1.728.801.536 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16; el autor sugiere servir con mlx_lm) |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de LiquidAI/LFM3-1.7B y se ha ajustado mediante LoRA-SFT (ciclo 6, ronda 4) con los pesos fusionados en bf16. El entrenamiento se realizo sobre el dataset `gabguerin/openenv-daw-tasks`, compuesto por tareas de operacion de un DAW a traves del conjunto de herramientas MCP de `gabguerin/openenv-daw`. No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si hubo etapas de RLHF o DPO.

La innovacion tecnica destacable no esta en la arquitectura del modelo base, sino en el paradigma de entrenamiento: SFT orientado a tool-use sobre un entorno agente reproducible y evaluable, con un conjunto de tareas heldout de 242 ejemplos organizado por familias (configuracion de sesion, edicion de clips, balance de mezcla, progresiones de acordes, etc.). El autor reporta el uso de decodificacion con temperatura 0 y un maximo de 4096 tokens, con la opcion de desactivar el modo thinking mediante `enable_thinking: false` en la plantilla de chat.

## Capacidades

- Generacion de texto conversacional orientada a instrucciones de operacion de un DAW.
- Tool calling / function calling mediante el conjunto de herramientas MCP de `openenv-daw`.
- Razonamiento multi-paso dentro de episodios agente (media de 5,2 llamadas por episodio, 1,61x la longitud del oraculo).
- Manejo de tareas de desambiguacion (15/15 en la familia `disambiguation`).
- Configuracion de sesion y gestion de dispositivos (100% en `session_setup`, `device_tweak`, `remove_device`).
- Tareas musicales basicas: patrones de cuatro por cuatro (`four_on_floor_beat`, 15/15), envio de reverb (`reverb_send`, 15/15), edicion de notas (`edit_notes`, 75%) y melodias en tonalidad (`melody_in_key`, 81,2%).
- Capacidades multilingues: no disponible.
- Vision, audio u otras modalidades: no disponible (pipeline declarado como `text-generation`).

## Casos de uso

- Automatizacion de operaciones de DAW via agentes: el modelo traduce instrucciones como "anade un reverb send al canal de voz" en llamadas MCP concretas, con una fiabilidad del 100% en las familias `reverb_send` y `device_tweak`.
- Configuracion inicial de sesiones de produccion musical: creacion de pistas, asignacion de dispositivos y ajuste de parametros base, donde el modelo alcanza el 100% de exito en `session_setup`.
- Edicion asistida de clips y notas en un proyecto: recorte, movimiento y modificacion de eventos MIDI o de audio, con un 93,3% en `clip_edit` y un 75% en `edit_notes`.
- Generacion de patrones ritmicos simples: el modelo resuelve el 100% de las tareas de beat `four_on_floor`, util para prototipado rapido de bases ritmicas.
- Investigacion sobre agentes tool-use en dominios acotados: sirve como baseline reproducible para estudiar la brecha entre tareas instrumentales y tareas creativas complejas en modelos pequenos.
- Evaluacion de entornos OpenEnv y MCP: al estar integrado con `openenv-daw`, permite probar pipelines de evaluacion agente de extremo a extremo en local (por ejemplo, con `mlx_lm.server` en Apple Silicon) sin depender de APIs externas.
- Desarrollo de asistentes musicales embebidos: al ser un modelo de 1,7B, puede desplegarse en hardware modesto para asistentes de estudio que no requieran generacion musical compleja.

## Benchmarks y rendimiento

Evaluacion sobre el split `heldout` v9 (242 tareas), segun la model card del autor:

| Metrica | Resultado |
|---|---|
| Exito global | 194/242 (80,2%; IC 95% 74,7%–84,7%) |
| Recompensa media | 0,8025 |
| Tareas de tool-use | 172/182 (94,5%) |
| Tareas musicales | 22/60 (36,7%) |
| Llamadas medias por episodio | 5,2 (1,61x la longitud del oraculo) |
| Errores por episodio | 0,198 |

Desglose por familia de tareas:

| Familia | Exito | Tasa |
|---|---|---|
| `device_tweak` | 16/16 | 100,0% |
| `disambiguation` | 15/15 | 100,0% |
| `four_on_floor_beat` | 15/15 | 100,0% |
| `near_miss` | 15/15 | 100,0% |
| `remove_device` | 15/15 | 100,0% |
| `reverb_send` | 15/15 | 100,0% |
| `session_setup` | 15/15 | 100,0% |
| `clip_edit` | 14/15 | 93,3% |
| `load_sound` | 14/15 | 93,3% |
| `infeasible` | 13/15 | 86,7% |
| `mix_balance` | 13/15 | 86,7% |
| `melody_in_key` | 13/16 | 81,2% |
| `edit_notes` | 12/16 | 75,0% |
| `compositional` | 9/28 | 32,1% |
| `chord_progression` | 0/16 | 0,0% |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 1,73B parametros en bf16, el peso ocupa aproximadamente 3,5 GB; en cuantizacion de 8 bits rondaria 1,7-2 GB y en 4 bits alrededor de 1 GB, mas overhead de KV cache (no disponible el contexto maximo).
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para bf16; RTX 3060/4060 o superiores son suficientes. Para mayor throughput, A100 o H100, aunque el modelo es pequeno y no las requiere.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna con 8 GB o mas, y en Apple Silicon via `mlx_lm`.
- Opciones de despliegue: `mlx_lm.server` (recomendado por el autor en Apple Silicon), cualquier servidor compatible con la API de OpenAI. No se documentan configuraciones especificas para vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: no disponibles. El autor recomienda temperatura 0 y maximo de 4096 tokens para la operacion con `openenv-daw`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `openenv-daw-lfm3-1.7b-sft` | 1,73B | no disponible | SFT para tool-use en DAW | other | Hugging Face |
| LiquidAI/LFM3-1.7B (base) | 1,7B | no disponible | Modelo generalista | no disponible | Hugging Face |
| Otros modelos de tool-use de ~1-2B | no disponible | no disponible | Generico | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos con alternativas de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Brecha notable en tareas musicales complejas: 0% en `chord_progression` (0/16) y 32,1% en `compositional`, lo que lo inhabilita para generacion musical estructurada.
- El modelo esta especializado en el conjunto de herramientas MCP de `openenv-daw`; su uso fuera de ese entorno no esta validado y probablemente degrade su rendimiento.
- Tasa de exito global del 80,2% implica que aproximadamente una de cada cinco tareas heldout falla; no es adecuado para operaciones destructivas o irreversibles sin supervision.
- Media de 5,2 llamadas por episodio (1,61x el oraculo) sugiere ineficiencia en la planificacion de secuencias de herramientas.
- Licencia "other": es imprescindible revisar los terminos exactos antes de cualquier uso comercial, ya que no es una licencia estandar permisiva.
- Sesgos conocidos: no disponibles.
- Riesgo de alucinacion: no cuantificado en la informacion disponible, aunque el dominio acotado y la decodificacion a temperatura 0 reducen la variabilidad.
- Idiomas soportados: no disponibles; el entrenamiento se ha realizado presumiblemente en ingles, sin confirmacion.
- Longitud de contexto no documentada: limita la planificacion de tareas largas y el mantenimiento de estado en sesiones extensas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gabguerin/openenv-daw-lfm3-1.7b-sft
- Entorno y Space: https://huggingface.co/spaces/gabguerin/openenv-daw
- Dataset de tareas: https://huggingface.co/datasets/gabguerin/openenv-daw-tasks
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
