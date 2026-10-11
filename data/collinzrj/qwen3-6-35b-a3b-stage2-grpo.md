# collinzrj/qwen3.6-35b-a3b-stage2-grpo

## Resumen

El modelo `collinzrj/qwen3.6-35b-a3b-stage2-grpo` es un ajuste fino del checkpoint base Qwen/Qwen3.6-35B-A3B, publicado por el usuario collinzrj. Se trata de un modelo de mezcla de expertos (MoE) con unos 35.107 millones de parámetros totales, de los que el modelo base activa aproximadamente 3.600 millones por paso forward. Mantiene la misma arquitectura, tokenizer y plantilla de chat que su base, por lo que hereda su naturaleza multimodal (image-text-to-text) y su ventana de contexto de hasta 262.144 tokens. La licencia es Apache-2.0.

El interés de esta ficha no está en el modelo base, ya conocido, sino en el pipeline de ajuste: se parte del modelo Qwen3.6-35B-A3B, se aplica una ronda de SFT mediante LoRA sobre trazas de agentes de ingeniería de software (Open-SWE-Traces), una segunda ronda de SFT sobre una mezcla de trazas del agente Terminus-2, cadenas de pensamiento de matemáticas de Nemotron y repetición de SWE, y finalmente un entrenamiento de refuerzo con GRPO sobre Nemotron-RL-ReasoningGym-v1 usando una recompensa de corrección penalizada por longitud. El checkpoint publicado corresponde a la tercera iteración de esa ronda de GRPO.

La relevancia de este checkpoint es doble. Por un lado, demuestra una mejora medible en razonamiento de tipo puzzle: sube del 42,1 % al 46,1 % de precisión en el conjunto de validación de ReasoningGym y reduce los tokens de cadena de pensamiento. Por otro, la propia model card documenta que esa ganancia **no** se transfiere a tareas agénticas largas ni a matemáticas de formato largo, con caídas notables en SWE-bench Pro V2, Terminal-Bench 2 y HLE math. Es, por tanto, un caso de estudio interesante sobre los límites de las recompensas de longitud corta en RL.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrida tipo `qwen3_5_moe` (Gated DeltaNet + Gated Attention) con encoder de vision, segun el modelo base |
| Parametros totales | 35.107.181.936 (~35,1 B) |
| Parametros activos | ~3,6 B por forward pass (dato del modelo base, misma arquitectura) |
| Longitud de contexto | 262.144 tokens (modelo base) |
| Tipos de cuantizacion | no disponible (el checkpoint publicado esta en bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bf16), 70,2 GB de repositorio |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen3.6-35B-A3B: un transformer de mezcla de expertos con enrutamiento disperso, que combina capas de Gated DeltaNet y Gated Attention, e incorpora un encoder de vision para razonamiento multimodal unificado (image-text-to-text). El ajuste fino no altera la arquitectura, el tokenizer ni la plantilla de chat: se entrega un checkpoint *merged* en bf16 que replica la topologia original. El modelo base declara 35,6 B de parámetros totales con ~3,6 B activos por paso, lo que reduce el coste de cómputo manteniendo la capacidad de un modelo grande.

El entrenamiento se estructura en tres rondas. La ronda 1 aplica SFT con LoRA sobre Open-SWE-Traces, dando como resultado el adaptador `collinzrj/qwen3.6-35b-a3b-swe-lora-sft`. La ronda 2 aplica SFT con LoRA sobre una mezcla de trazas del agente Terminus-2, cadenas de pensamiento de matemáticas de Nemotron y repetición de datos de SWE. La ronda 3 aplica GRPO sobre Nemotron-RL-ReasoningGym-v1 (3 iteraciones de 96–128 prompts × 8 muestras, publicándose la iteración 3). La recompensa es `reasoning_gym.score_answer(final answer)` menos un término de penalización por longitud de 0,25 a 0,4 × tokens/4096; se usan ventajas normalizadas por grupo (G=8), una pasada PPO-clipped por iteración (ε=0,2, a nivel de token, sin penalización KL), LoRA r=32/α=64 más r=4 en los expertos enrutados, learning rate 2e-5, y fusión tras cada iteración. Los rollouts y los log-probabilities antiguos se generan con vLLM usando los ids de token muestreados exactos. Los datos están bajo CC-BY-4.0 y el modelo bajo Apache-2.0.

## Capacidades

- Generacion de texto instructiva y conversacional, heredada del modelo base Qwen3.6-35B-A3B.
- Razonamiento con modo de pensamiento (chain-of-thought) explicito; la model card recomienda el parser `qwen3` de vLLM para separarlo.
- Codigo e ingenieria de software: el pipeline de entrenamiento usa trazas de agentes SWE y el modelo soporta el parser `qwen3_xml` para tool calling.
- Matematicas: se entreno con cadenas de pensamiento de matematicas de Nemotron (`Nemotron-SFT-Math-v4`).
- Vision multimodal (image-text-to-text): heredada del encoder de vision del modelo base.
- Tool calling / function calling, con soporte de eleccion automatica de herramienta (`--enable-auto-tool-choice`).
- Flujos agénticos multi-paso, dado que se entreno con trazas del agente Terminus-2 y datos multi-turno.
- Capacidades multilingues: no disponibles como dato especifico.
- Razonamiento de tipo puzzle y problemas cortos: es el dominio donde el GRPO aporta una mejora medible (ReasoningGym).

## Casos de uso

- Razonamiento sobre problemas cortos y verificables: el checkpoint mejora la precision en ReasoningGym del 42,1 % al 46,1 % con menos tokens de CoT, por lo que encaja en pipelines de resolucion de puzzles, problemas logicos o tareas con respuesta verificable automaticamente.
- Generacion de codigo asistida en IDE: soporta tool calling con el parser `qwen3_xml` y puede integrarse en flujos de autocompletado o refactorizacion donde el horizonte de razonamiento sea corto.
- Agentes de terminal en tareas acotadas: al derivar de trazas del agente Terminus-2, puede orquestar comandos y ediciones simples, aunque con la advertencia de la caida en Terminal-Bench 2 (ver limitaciones).
- Asistente multimodal de documentacion: al heredar el encoder de vision del modelo base, puede responder sobre capturas, diagramas o imagenes junto a texto, con la ventana de 262.144 tokens del base.
- Extraccion y resumen de documentos largos: la ventana de contexto del modelo base (262.144 tokens) permite procesar informes, expedientes o bases de codigo extensas en una sola pasada.
- Servicio de inferencia con vLLM: la model card documenta explicitamente el comando de arranque con `vllm serve ... --reasoning-parser qwen3 --tool-call-parser qwen3_xml --enable-auto-tool-choice`, lo que facilita su despliegue como endpoint compatible con la API de OpenAI.
- Base para investigacion en RL: el propio checkpoint es un artefacto de estudio sobre el efecto de recompensas penalizadas por longitud en tareas cortas frente a largas.

## Benchmarks y rendimiento

| Benchmark | Base Qwen3.6-35B-A3B | Ronda 1 / ronda 2 | Este checkpoint |
|---|---|---|---|
| ReasoningGym (194 puzzles × 8 muestras), precision | no disponible | 42,1 % (ronda 2, pre-GRPO) | 46,1 % |
| ReasoningGym, tokens CoT medios / mediana | no disponible | 4.598 / 2.018 | 4.240 / 1.642 (−7,8 % / −18,6 %) |
| SWE-bench Pro V2 HARD-51 | 16/51 | 23/51 (ronda 1) | 13/51 |
| Terminal-Bench 2 (muestra de 20 tareas) | 9/20 | no disponible | 6/20 |
| HLE math (muestra de 100 preguntas, solo texto) | 31/100 | no disponible | 15/100 |

Todas las cifras downstream son de un unico intento por tarea, segun la model card. La propia model card advierte que el razonamiento mas corto aprendido en puzzles no se transfirio a contextos agénticos largos ni a matematicas de formato largo.

## Requisitos de hardware

- VRAM para inferencia en bf16: los pesos ocupan aproximadamente 70 GB (35,1 B parametros × 2 bytes). Requiere memoria adicional para cache KV, por lo que hay que prever al menos unos 80 GB efectivos en configuraciones no cuantizadas.
- GPU recomendadas: una H100 de 80 GB o una A100 de 80 GB para bf16 (con poco margen); configuraciones de 2 × A100/H100 80 GB para mayor holgura y contexto largo.
- GPU de consumo: no cabe en bf16 en ninguna GPU de consumo. Con cuantizacion de 4 bits los pesos se situarian en torno a 18–20 GB, lo que podria caber en una RTX 4090 o RTX 5090 de 24 GB, pero no se han publicado ficheros GGUF ni cuantizaciones oficiales de este checkpoint.
- Opciones de despliegue: vLLM esta documentado en la model card (`vllm serve ... --reasoning-parser qwen3 --tool-call-parser qwen3_xml --enable-auto-tool-choice`); tambien es cargable con `transformers` mediante `Qwen3_5MoeForConditionalGeneration` con `dtype="bfloat16"` y `device_map="auto"`. No se mencionan soportes de llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Licencia | Disponibilidad | Rendimiento comparado |
|---|---|---|---|---|---|
| `collinzrj/qwen3.6-35b-a3b-stage2-grpo` | 35,1 B / ~3,6 B | 262.144 tokens (heredado) | Apache-2.0 | HuggingFace | ReasoningGym 46,1 %; SWE-bench Pro V2 HARD-51 13/51 |
| Qwen/Qwen3.6-35B-A3B (base) | 35,6 B / ~3,6 B | 262.144 tokens | Apache-2.0 | HuggingFace, NGC | ReasoningGym no disponible; SWE-bench Pro V2 HARD-51 16/51; Terminal-Bench 2 9/20; HLE math 31/100 |
| `collinzrj/qwen3.6-35b-a3b-swe-lora-sft` (ronda 1) | adaptador sobre la misma base | no disponible | no disponible | HuggingFace | SWE-bench Pro V2 HARD-51 23/51 |
| Qwen3.5 27B dense / Gemma 4 31B | no disponible | no disponible | no disponible | no disponible | Citados en resenas como competidores en coding y razonamiento con presupuesto similar de parametros activos; sin cifras verificables en la informacion disponible |

## Limitaciones y advertencias

- Regresion en tareas largas: la propia model card indica que el razonamiento acortado no se transfirio a contextos agénticos largos ni a matematicas de formato largo. Esto se refleja en caidas considerables frente al modelo base: SWE-bench Pro V2 HARD-51 baja de 16/51 (base) y 23/51 (ronda 1) a 13/51; Terminal-Bench 2 baja de 9/20 (base) a 6/20; HLE math baja de 31/100 (base) a 15/100.
- Riesgo de sobreoptimizacion de la recompensa de longitud: la penalizacion por tokens (0,25–0,4 × tokens/4096) puede haber favorecido respuestas cortas en detrimento de la profundidad requerida en tareas complejas.
- Benchmarks con un unico intento: las cifras downstream son de un solo intento por tarea, sin intervalos de confianza, por lo que la varianza no esta cuantificada.
- Idiomas soportados: no disponible; no hay evidencia publicada de cobertura multilingue especifica para este ajuste.
- Licencia: Apache-2.0, igual que el modelo base, por lo que el uso comercial esta permitido sin las restricciones de licencias copyleft; aun asi conviene verificar las condiciones de los datasets de entrenamiento (CC-BY-4.0 segun la model card).
- Naturaleza experimental: repositorio con 0 descargas y 0 likes, publicado por un autor individual, sin validacion externa ni evaluacion por terceros.
- Sin cuantizaciones publicadas: no hay GGUF ni versiones de 4/8 bits, lo que limita su despliegue en hardware de consumo.
- Riesgo de alucinacion: no cuantificado en la informacion disponible, pero aplicable como en cualquier modelo generativo de este tamano.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/collinzrj/qwen3.6-35b-a3b-stage2-grpo
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Adaptador de la ronda 1 (SWE LoRA SFT): https://huggingface.co/collinzrj/qwen3.6-35b-a3b-swe-lora-sft
- Dataset Nemotron-RL-ReasoningGym-v1: https://huggingface.co/datasets/nvidia/Nemotron-RL-ReasoningGym-v1
- Dataset Open-SWE-Traces: https://huggingface.co/datasets/nvidia/Open-SWE-Traces
- Dataset Nemotron-SFT-Math-v4: https://huggingface.co/datasets/nvidia/Nemotron-SFT-Math-v4
- Dataset Qwen3.8-27B-multi-turn-agent-sft: https://huggingface.co/datasets/ukisai/Qwen3.8-27B-multi-turn-agent-sft
- Ficha del modelo base en MindStudio: https://www.mindstudio.ai/models/qwen3-6-35b-a3b-deepinfra
- Ficha del modelo base en The AI Bench: https://theaibench.ai/models/qwen-3-6-35b-a3b/
- Ficha del modelo base en Vast.ai: https://vast.ai/model/qwen36-35b-a3b
- Catalogo NGC de NVIDIA: https://catalog.ngc.nvidia.com/orgs/nim/teams/qwen/models/qwen3.6-35b-a3b
- Resena del modelo base en AI Indigo: https://aiindigo.com/blog/qwen3-6-35b-a3b-review-the-pragmatic-middle-weight-multimodal-model
