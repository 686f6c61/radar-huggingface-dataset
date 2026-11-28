# Einsia/RoboUniverse-35B-A3B

## Resumen

RoboUniverse-35B-A3B es un modelo de lenguaje y vision especializado en manipulación robótica, desarrollado por Einsia mediante fine-tuning del modelo base Qwen/Qwen3.6-35B-A3B. A diferencia de los modelos de robotica convencionales que emiten acciones motoras directamente, este modelo funciona como un agente de codigo que opera dentro de Claude Code: lee la tarea, invoca herramientas del entorno (`roboenv describe`, `roboenv observe`), interpreta imagenes de camara, escribe y ejecuta controladores en Python, y envia acciones mediante `roboenv step`.

Arquitectonicamente hereda la estructura MoE del modelo base Qwen3.6-35B-A3B, con 35.951.822.704 parametros totales y aproximadamente 3B parametros activos distribuidos en 256 expertos, en precision bf16. El contexto es de 262.144 tokens, lo que resulta critico para trayectorias de agente largas (decenas de miles de tokens por episodio). Se distribuye en 16 shards `safetensors` que ocupan 71,9 GB en el repositorio.

El modelo es relevante porque aborda la robotica encarnada (embodied AI) desde un paradigma de agente de codigo en lugar de una politica de control end-to-end. Se entrena sobre trayectorias exitosas recolectadas en entornos de simulacion del dataset RoboUniverse-10K y se evalua con el harness Harbor sobre Isaac Sim 5.1. La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (qwen3_5_moe), 256 expertos |
| Parametros totales | 35.951.822.704 (35B) |
| Parametros activos | ~3B (A3B) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (16 shards, 71,9 GB) |
| Modalidad | image-text-to-text (vision + texto) |
| Modelo base | Qwen/Qwen3.6-35B-A3B |
| Dataset de entrenamiento | Einsia/RoboUniverse-10K |
| Formato de tool-call | Qwen3-Coder XML (`--tool-call-parser qwen3_coder`) |
| Thinking mode | Desactivado por defecto (chat template incluido) |
| Harness de entrenamiento y evaluacion | Claude Code 2.1.283 |
| Simulador | Isaac Sim 5.1 (via Harbor) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.6-35B-A3B, un transformer con mezcla de expertos (MoE) de 256 expertos, 35B parametros totales y aproximadamente 3B activos por token, lo que permite un coste de inferencia muy inferior al de un modelo denso del mismo tamano. El fine-tuning se realiza sobre trayectorias de agente exitosas recolectadas en entornos de simulacion del dataset RoboUniverse-10K, en los que el modelo actua como agente de codigo dentro de Claude Code.

El entrenamiento se ejecuta con thinking desactivado y con un formato especifico de llamadas a herramientas (Qwen3-Coder XML). El chat template incluido pliega los mensajes de sistema intermedios (el entorno y la cuenta atras `<total_tokens>` que Claude Code envia tras cada resultado de herramienta) en el mensaje de sistema inicial, conservando solo la primera cuenta atras, y mantiene el orden `name, description, parameters` en las definiciones de herramientas. La evaluacion se realiza con el harness Harbor, con un limite de agente de 14.400 segundos (multiplicador 2 sobre los 7.200 s declarados por las tareas) y autocompactacion del contexto al 93% (236.175 tokens).

## Capacidades

- Generacion de codigo Python para control de robots: escribe controladores que ejecutan contra el simulador.
- Razonamiento multi-paso dentro de un bucle de agente (observar, planificar, actuar, verificar).
- Vision: interpreta imagenes de camara del entorno mediante `roboenv observe`.
- Tool calling en formato Qwen3-Coder XML, compatible con el parser `qwen3_coder` de SGLang.
- Integracion con Claude Code como cliente de agente (endpoint compatible con la API de Anthropic).
- Uso de herramientas de entorno especificas: `roboenv describe`, `roboenv observe`, `roboenv step`.
- Manejo de contexto muy largo (262.144 tokens) para trayectorias prolongadas.
- Capacidades multilingues: no disponible (no se documentan idiomas soportados).

## Casos de uso

- Manipulacion robotica en simulacion: el modelo lee la descripcion de la tarea via `roboenv describe`, observa la escena con `roboenv observe`, escribe un controlador Python y envia acciones con `roboenv step`; es adecuado porque se entreno exactamente sobre este bucle en Isaac Sim 5.1.
- Evaluacion de agentes embodied en Harbor: se integra como agente `claude-code` con `--ak version=2.1.283 --ak max_thinking_tokens=0`; util para reproducir resultados de referencia y comparar politicas.
- Generacion de scripts de control reutilizables: al producir codigo Python en lugar de acciones crudas, los controladores pueden inspeccionarse, versionarse y reutilizarse en pipelines de investigacion.
- Investigacion en robotica encarnada: sirve como politica de referencia basada en LLM para comparar contra enfoques end-to-end de imitacion o RL.
- Automatizacion de tareas de pick-and-place y ensamblaje en simulacion: gracias al contexto de 262k tokens puede mantener el estado de la tarea a lo largo de episodios largos.
- Prototipado rapido de entornos: al operar sobre Isaac Sim via Harbor, permite validar tareas y verificadores antes de trasladar el flujo a hardware real.
- Integracion en flujos de desarrollo con Claude Code: puede configurarse en `~/.claude/settings.json` apuntando a un servidor SGLang propio para experimentar con agentes de robotica desde el propio IDE.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card describe la configuracion de evaluacion (Harbor, Isaac Sim 5.1, Claude Code 2.1.283, limite de 14.400 s, autocompactacion al 93%) pero no incluye cifras de exito ni comparaciones numericas.

## Requisitos de hardware

- VRAM estimada en bf16: aproximadamente 72 GB solo para pesos, mas KV cache; se recomienda un nodo con al menos 80 GB por GPU y, en la practica, multiples GPU.
- GPU recomendadas: H100 80GB (una o varias), A100 80GB; en Blackwell la model card advierte de compilaciones de kernel largas y propensas a fallos con el backend `triton`.
- GPU de consumo: no cabe en RTX 4090 (24 GB) en bf16; requeriria cuantizacion agresiva no documentada por el autor.
- Despliegue recomendado: SGLang con `--tool-call-parser qwen3_coder`, `--image-processor-backend pil`, `--moe-runner-backend triton`, `--kv-cache-dtype bfloat16` y `--context-length 262144`.
- Cliente: Claude Code 2.1.283 con `MAX_THINKING_TOKENS=0`, `CLAUDE_CODE_MAX_OUTPUT_TOKENS=8192`, `CLAUDE_CODE_MAX_CONTEXT_TOKENS=262144`, `CLAUDE_CODE_AUTO_COMPACT_WINDOW=262144`, `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE=93`, `DISABLE_COMPACT=0`, `DISABLE_AUTO_COMPACT=0`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Enfoque |
|---|---|---|---|---|---|
| RoboUniverse-35B-A3B | 35B totales / ~3B activos (MoE) | 262.144 | imagen-texto | Apache 2.0 | Agente de codigo para robotica en Claude Code |
| Qwen/Qwen3.6-35B-A3B | 35B totales / ~3B activos (MoE) | no disponible en esta ficha | texto (base) | Apache 2.0 (segun license_link) | LLM generalista base |
| Alternativas especificas de robotica embodied | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Disenado exclusivamente para el bucle Claude Code + Harbor + Isaac Sim 5.1; fuera de esa configuracion el rendimiento puede degradarse de forma silenciosa.
- Thinking debe permanecer desactivado: activar `--reasoning-parser` o `enable_thinking` provoca HTTP 400 o cambia el comportamiento respecto al entrenamiento.
- Requiere el chat template incluido; sustituirlo altera el plegado de mensajes de sistema y el formato de herramientas vistos en entrenamiento.
- El modelo no emite acciones motoras directas: depende de escribir y ejecutar codigo Python, lo que anade latencia y puntos de fallo.
- Riesgo de alucinacion en la planificacion de tareas y en la generacion de controladores; los controladores deben validarse con un verificador externo.
- Sesgos conocidos: no documentados en la informacion disponible.
- Idiomas soportados: no documentados.
- Cuantizaciones oficiales: no publicadas; el repositorio solo contiene pesos bf16, lo que limita el despliegue en hardware de consumo.
- Licencia Apache 2.0 permite uso comercial, pero la model card remite al LICENSE del modelo base Qwen3.6-35B-A3B; conviene revisar ambas.
- El limite de agente de referencia es de 14.400 s (multiplicador 2 sobre las tareas), lo que implica episodios largos y costosos en computo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Einsia/RoboUniverse-35B-A3B
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B/blob/main/LICENSE
- Dataset RoboUniverse-10K: https://huggingface.co/datasets/Einsia/RoboUniverse-10K
- Repositorio del benchmark (script `inference.py`): https://github.com/Einsia/RoboUniverse-10K/blob/main/inference.py
