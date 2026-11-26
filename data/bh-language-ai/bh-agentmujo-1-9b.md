# BH-Language-AI/bh-agentmujo-1-9b

## Resumen

BH-AgentMujo-1-9B es un ajuste fino del modelo Qwen/Qwen3.5-9B desarrollado por BH-Language-AI, orientado especificamente a la generacion de llamadas a funciones (function calling) y a la operacion de agentes sobre sistemas Linux en bosnio. El modelo forma parte de la familia BH-AgentMujo, que incluye variantes de 2B y 4B, y esta disenado para devolver llamadas a herramientas en formato legible por maquina que posteriormente se ejecutan a traves de un AgentMujo Policy Engine con niveles de allow, confirmation_required y deny.

Con 8.953.803.264 parametros totales (clase 9B), una profundidad de 32 capas, dimension oculta de 4096 y un vocabulario de 248.320 tokens, el modelo hereda la arquitectura transformer de su base. Su interes principal no reside en el rendimiento generalista, sino en la especializacion dialectal: el autor afirma que el ajuste fino denso en dialecto bosnio ha permitido que el formato de llamada a herramientas funcione bajo el prompt de produccion por defecto, sin necesidad de especificaciones de formato adicionales.

La relevancia del modelo es acotada pero clara: cubre un nicho poco atendido (agentes de sistema en bosnio) con licencia Apache-2.0 y pesos en GGUF Q8_0, lo que facilita su despliegue local. No obstante, su publico objetivo son usuarios que necesiten un agente bosnio para operaciones Linux, no un modelo de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen/Qwen3.5-9B; 32 capas, hidden 4096, vocab 248320) |
| Parametros totales | 8.953.803.264 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (GGUF, 9.5 GB) |
| Idiomas soportados | bosnio (bs) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (Q8_0); repo de 47.6 GB con subversiones gold01-gold06 |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-9B en el commit c20223623, una arquitectura transformer con 32 capas, dimension oculta de 4096 y vocabulario de 248.320 tokens. Sobre esta base se aplico un ajuste fino supervisado (SFT) en cadena: una primera fase r16 con los conjuntos jt01-jt05 (mix v0.35), que alcanzo un techo de tool selection de 0.60 solo con especificacion de formato; una fase r64 con r6401-r6406; y finalmente la serie gold01-gold06, donde gold01 introdujo el formato por defecto (gate 0.60/0.654) y las iteraciones posteriores refinaron el comportamiento hasta gold06, la version de produccion.

El entrenamiento se describe como "dialect-dense SFT", es decir, ajuste supervisado con alta densidad de dialecto bosnio. No se menciona el uso de RLHF ni DPO. La cuantizacion se realizo con llama.cpp mediante `convert_hf_to_gguf.py --no-mtp` y formato Q8_0, generando un archivo de 9.5 GB. El framework de entrenamiento es agentmujo-training, publicado en GitHub. El modelo es non-thinking: el perfil de razonamiento extendido no forma parte del release.

## Capacidades

- Generacion de llamadas a funciones en formato maquina-legible, con seleccion de herramienta y argumentos estructurados.
- Razonamiento multi-paso orientado a tareas de agente: el modelo propone una herramienta, verifica el resultado y decide el siguiente paso.
- Comportamiento de confirmacion antes de actuar (check-then-ask), disenado para operaciones sensibles en sistemas Linux.
- Capacidad de rechazo correcto (refusal_correctness 0.8 en el conjunto de evaluacion) y comportamiento de seguridad (safety 0.857).
- Preferencia de alto nivel (high_level_preference 1.0 en el modo loop), es decir, seleccion de la herramienta adecuada en lugar de una alternativa de bajo nivel.
- Soporte de conversacion multi-turno (tag conversational) y de tool calling compatible con endpoints.
- Capacidades multilingues limitadas al bosnio; no se documentan otras lenguas.
- No incluye vision, audio ni modo thinking.

## Casos de uso

- Administracion de servidores Linux en bosnio: el modelo traduce una peticion en lenguaje natural a una llamada de herramienta estructurada (por ejemplo, consultar el estado de nginx) que el Policy Engine valida antes de ejecutarla. Es adecuado porque su entrenamiento esta centrado en este dominio y en este idioma.
- Automatizacion de tareas de diagnostico: ante una incidencia, el modelo encadena varias llamadas (listar servicios, leer logs, comprobar estado) y verifica cada resultado antes de proponer la siguiente accion, gracias a su comportamiento check-then-ask.
- Asistentes de operaciones con confirmacion humana: las operaciones clasificadas como confirmation_required por el Policy Engine se presentan al operador para aprobacion; el modelo genera la propuesta y el motor de politicas decide.
- Integracion en pipelines de agentes locales: al distribuirse como GGUF Q8_0 de 9.5 GB, puede ejecutarse con llama.cpp u Ollama en una maquina de operaciones sin GPU dedicada de gran tamano.
- Formacion y evaluacion de agentes en bosnio: sirve como referencia para comparar variantes de la familia (2B, 4B, 9B) sobre el AgentMujo-Bench v0.5.
- Chat operativo con rechazo seguro: en conversaciones sin herramienta disponible, el modelo tiende a proponer acciones; el Policy Engine filtra el exceso, lo que permite usarlo como capa de sugerencia en lugar de ejecucion directa.

## Benchmarks y rendimiento

Resultados publicados por el autor en AgentMujo-Bench v0.5 (48 casos, prompt de produccion por defecto, build gold06):

| Metrica | Gate | Loop |
|---|---|---|
| tool_selection | 0.70 | 0.833 |
| argument_accuracy | 0.846 | strict 0.75 |
| high_level_preference | 1.0 | task_success 0.979 |
| confirmation_behavior | 0.6 | no disponible |
| safety | 0.857 | no disponible |
| refusal_correctness | 0.8 | no disponible |
| no_tool_correctness | 0.50 | no disponible |

Historial de iteraciones (gate tool/args): gold01 0.60/0.654, gold02 0.633/0.731, gold03 0.50/0.50 (regresion por sesgo de listado), gold04 mejor pre-gold06, gold05 0.667/0.808, gold06 0.70/0.846 (produccion). No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 10-11 GB con la cuantizacion Q8_0 (9.5 GB de pesos mas overhead de contexto y cache KV).
- GPU recomendadas: RTX 4090 (24 GB), RTX 3090 (24 GB), A100 40 GB, H100; cualquier GPU con al menos 12 GB de VRAM puede alojar el modelo Q8_0 con contexto moderado.
- Cabe en GPU de consumo: si, en RTX 4090, RTX 3090, RTX 4080 (16 GB) y RTX 4070 Ti Super (16 GB); en GPUs de 12 GB el margen para contexto es reducido.
- Opciones de despliegue: llama.cpp (`llama serve`), Ollama (via Modelfile con el GGUF), y cualquier runtime compatible con GGUF Q8_0.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BH-AgentMujo-1-9B | 8.95B | no disponible | Agente Linux en bosnio | Apache-2.0 | GGUF Q8_0 en HF |
| BH-AgentMujo-1-4B | no disponible | no disponible | Agente Linux en bosnio (clase media) | Apache-2.0 | HF (full v05) |
| BH-AgentMujo-1-2B | no disponible | no disponible | Agente Linux en bosnio (clase ligera) | Apache-2.0 | HF (Q8 v0.5) |
| Qwen/Qwen3.5-9B | no disponible | no disponible | Modelo base generalista | Apache-2.0 | HF |

La comparativa con modelos de proposito general de la misma categoria (por ejemplo, otros ajustes de 9B para function calling) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Respuestas sin herramienta (no_tool_correctness 0.25-0.50): el modelo tiende a proponer acciones incluso en conversacion trivial; el autor indica que la capa de politicas debe filtrar el exceso.
- El modelo solo propone la herramienta; no la ejecuta. La ejecucion debe pasar obligatoriamente por el AgentMujo Policy Engine (allow / confirmation_required / deny); usarlo como ejecutor directo es un riesgo de seguridad.
- Comportamiento check-then-ask en lugar de actuacion ciega: es una decision de diseno, pero implica mas pasos y latencia en tareas automatizadas.
- confirmation_behavior de 0.6 en el conjunto gate: la tasa de confirmacion correcta es moderada y requiere supervision.
- Cobertura linguistica limitada al bosnio; no se documenta rendimiento en castellano ni en otras lenguas.
- No es un modelo thinking; no dispone de modo de razonamiento extendido.
- Longitud de contexto no documentada; no debe asumirse una ventana larga sin verificacion.
- Licencia Apache-2.0 permite uso comercial, pero el modelo base Qwen3.5-9B mantiene su propia licencia Apache-2.0, que debe respetarse.
- Sin descargas ni likes en el momento de la consulta y con fecha de creacion futura (2026-11-26) en los metadatos; conviene verificar la vigencia del repositorio antes de integrarlo en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/BH-Language-AI/bh-agentmujo-1-9b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Variante 2B: https://huggingface.co/BH-Language-AI/bh-agentmujo-1-2b
- Variante 4B: https://huggingface.co/BH-Language-AI/bh-agentmujo-1-4b
- Repositorio de entrenamiento: https://github.com/BH-Language-AI/agentmujo-training
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
