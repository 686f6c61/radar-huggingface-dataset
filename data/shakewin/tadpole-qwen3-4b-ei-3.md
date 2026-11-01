# Shakewin/tadpole-qwen3-4b-ei-3

## Resumen

Tadpole EI-3 es un adaptador LoRA (PEFT) entrenado sobre el modelo base Qwen/Qwen3-4B-Instruct-2507, desarrollado por el autor independiente Shakewin dentro del proyecto Tadpole, un agente de uso de herramientas construido desde cero y post-entrenado por etapas medidas. El adaptador resuelve un problema concreto: mejorar la fiabilidad de un agente de 4.000 millones de parametros en tareas de tool calling y razonamiento multi-paso dentro de un entorno de trabajo (workspace) con prompts y esquemas de herramientas fijos. EI-3 es la tercera iteracion de un ciclo de "expert iteration" (tres rondas) sobre el SFT-2, y se presenta como la variante mas equilibrada de la familia: segunda en ambos conjuntos de test retenidos, la mas fiable en el test dificil y primera en la categoria multi-turno de BFCL adaptada.

El modelo no es un LLM completo, sino un adaptador de rango 16 (alpha 32) que anade 33.030.144 parametros entrenables sobre el transformer denso de Qwen3-4B. Se distribuye en safetensors (PEFT) y tambien en GGUF, con un tamano de repositorio de 0,2 GB. Su contexto efectivo es el del modelo base, que en la configuracion de evaluacion del autor se sirve con `--max-model-len 32768`.

Es relevante ahora porque documenta de forma reproducible un pipeline de post-entrenamiento para agentes (SFT, rejection sampling, expert iteration, evaluacion con pass@1 y pass^3) sobre un modelo pequeno que cabe en una sola GPU de 24 GB, con codigo, datos y resultados publicos. La ficha se limita a lo declarado en la model card y en los metadatos de HuggingFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer denso de Qwen3-4B-Instruct-2507 |
| Parametros totales | 33.030.144 (parametros del adaptador; el base Qwen3-4B no se incluye en el repo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens en la configuracion de evaluacion del autor (`--max-model-len 32768`); contexto nativo del base no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible (el repo incluye safetensors y GGUF; no se detallan los tipos concretos) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (PEFT/LoRA) y GGUF |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-4B-Instruct-2507 (revision `cdbee75f17c01a7cc42f958dc650907174af0554`), un transformer denso de 4.000 millones de parametros. El entrenamiento usa LoRA de rango 16, alpha 32 y dropout 0,05 sobre las proyecciones `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`. La perdida cubre unicamente la completion. El optimizador es AdamW implicito en la receta declarada: 3 epocas, learning rate 1e-4, warmup lineal con decaimiento coseno (10% de warmup), acumulacion de gradiente 8, clipping 1,0, semilla 0 y bfloat16 en una sola GPU. El adaptador publicado corresponde a la epoca 2, elegida sobre el split de validacion.

Los datos provienen de la ronda 3 de expert iteration. Cada ronda muestrea 8 veces las 80 tareas de entrenamiento niveladas con el modelo mas reciente, conserva los rollouts verificados y reentrena desde el base con los datos de SFT-2 mas esos rollouts. Esta ronda combina las 9.007 filas de SFT-2 con 302 rollouts verificados (`self-ei-round3`), totalizando 9.309 filas. La receta y los hashes estan en `mixes/ei-round3.json`. Las filas proceden de Shakewin/tadpole-sft-data o pueden reconstruirse desde sus fuentes publicas: NVIDIA When2Call (CC-BY-4.0), Agent-Ark Toucan-1.5M (Apache-2.0) y trayectorias de profesor generadas con DeepSeek-V4.1-Flash. El autor menciona un piloto de GRPO en la documentacion de resultados, pero no forma parte de este adaptador.

## Capacidades

- Uso de herramientas (tool calling / function calling) dentro del harness de Tadpole, con esquemas de herramientas y system prompt concretos.
- Razonamiento multi-paso orientado a agentes en un workspace: planificacion, invocacion de herramientas y verificacion de resultados.
- Generacion de texto en ingles a partir del modelo base Qwen3-4B-Instruct-2507.
- Ejecucion de tareas de agente con contexto largo (hasta 32.768 tokens en la configuracion de evaluacion).
- Capacidad de "thinking" o vision: no disponible en la informacion proporcionada para este adaptador.
- Capacidades multilingues: limitadas al ingles segun la model card.

## Casos de uso

- Agentes de automatizacion de tareas con herramientas: el adaptador esta entrenado para invocar funciones y encadenar pasos dentro de un workspace; encaja en pipelines donde el agente debe consultar APIs, leer ficheros o ejecutar comandos y verificar el resultado.
- Evaluacion de pipelines de post-entrenamiento: sirve como referencia reproducible para comparar SFT frente a expert iteration en un modelo de 4B, con splits de validacion, test y test dificil separados.
- Prototipado de asistentes de codigo con tool use: integrado en un servidor vLLM con `--enable-lora`, puede servir como backend de un agente que edita ficheros y ejecuta tests en un entorno controlado.
- Investigacion en rejection sampling y destilacion de trayectorias: el adaptador y sus datos permiten estudiar como afectan los rollouts verificados al rendimiento en tareas fuera de distribucion (test y hard test).
- Despliegue en una sola GPU de consumo para demos de agentes: al ser un adaptador de 0,2 GB sobre un base de 4B, cabe en GPUs de 24 GB y permite iterar rapidamente sobre prompts y herramientas.
- Benchmarking interno de fiabilidad de agentes: los metricos pass@1 y pass^3 del autor ofrecen una plantilla para medir consistencia (tres muestras por tarea) en lugar de solo acierto medio.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre su benchmark local (140 tareas de test y 80 de hard test, tres muestras por tarea). pass@1 es la proporcion de ejecuciones que pasan; pass^3, la proporcion de tareas cuyas tres muestras pasan. Test y hard test contienen tipos de tarea ausentes en todos los conjuntos de entrenamiento.

| Metrica | Base | SFT-1 | SFT-2 | EI-3 |
|---|---:|---:|---:|---:|
| Test pass@1 (140 tareas) | 0,419 | 0,774 | 0,738 | 0,745 |
| Test pass^3 | 0,364 | 0,707 | 0,607 | 0,657 |
| Hard test pass@1 (80 tareas) | 0,275 | 0,429 | 0,492 | 0,471 |
| Hard test pass^3 | 0,125 | 0,250 | 0,325 | 0,338 |
| BFCL multi-turn (adaptacion local) | 0,360 | 0,285 | 0,325 | 0,395 |

La puntuacion de BFCL multi-turno es una adaptacion local de la categoria base multi-turno de BFCL, no una puntuacion de leaderboard. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el autor indica una GPU con 24 GB o mas para servir el base Qwen3-4B en bfloat16 con el adaptador LoRA y contexto de 32.768 tokens mediante vLLM.
- GPU recomendadas: una unica GPU de 24 GB (por ejemplo, RTX 4090, A10G, L4 de 24 GB o A100/H100 para mayor throughput). No se detallan cifras de latencia ni throughput.
- GPU de consumo: si, cabe en tarjetas de 24 GB; para GPUs de menor VRAM habria que recurrir a cuantizacion del base (no se detallan tipos de cuantizacion en la informacion proporcionada).
- Despliegue: vLLM 0.30.0 con `--enable-lora --max-lora-rank 64` y `--lora-modules EI-3=...`; tambien PEFT con `transformers` y `PeftModel.from_pretrained`. El repo incluye GGUF, lo que permite despliegue con llama.cpp u Ollama, aunque no se documentan en la model card.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tadpole EI-3 | 33 M (adaptador) sobre 4B | 32.768 en evaluacion | LoRA para agentes y tool use | Apache-2.0 | HuggingFace (safetensors, GGUF) |
| Qwen3-4B-Instruct-2507 (base) | 4B | no disponible en la informacion | LLM denso de proposito general | Apache-2.0 | HuggingFace |
| SFT-1 / SFT-2 (misma familia Tadpole) | adaptadores LoRA sobre 4B | 32.768 en evaluacion | SFT y SFT con rejection sampling | Apache-2.0 | HuggingFace (segun el autor) |

No se dispone de datos de benchmarks estandar para comparar con modelos de la misma categoria fuera de la familia Tadpole. La comparacion con alternativas de agentes de 4B (por ejemplo, otros adaptadores de tool use) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Una sola ejecucion de entrenamiento por modelo; los resultados no constituyen una afirmacion sobre la capacidad general del agente.
- Benchmark local pequeno (140 + 80 tareas), no comparable con leaderboards publicos.
- Las puntuaciones de When2Call son en distribucion para todos los modelos entrenados con datos publicos, lo que puede inflar la comparacion.
- El adaptador hereda las limitaciones del base Qwen3-4B-Instruct-2507.
- Entrenado para uso de herramientas dentro de un workspace, no para chat general.
- Entrenado con el chat template de Tadpole (`agent_from_scratch/prompts/qwen_chat.jinja`), su system prompt y sus esquemas de herramientas; con otra plantilla o formato de herramientas el comportamiento puede diferir.
- Idioma limitado al ingles; riesgo de alucinacion y sesgos no cuantificados en la informacion disponible.
- Licencia Apache-2.0 para el adaptador; los datos de entrenamiento incluyen When2Call (CC-BY-4.0) y Toucan-1.5M (Apache-2.0), y el codigo de Tadpole es MIT. Verificar el cumplimiento de atribucion si se redistribuye.

## Enlaces

- [HuggingFace: Shakewin/tadpole-qwen3-4b-ei-3](https://huggingface.co/Shakewin/tadpole-qwen3-4b-ei-3)
- [Repositorio Tadpole (GitHub)](https://github.com/shakewingo/Tadpole)
- [Documentacion de resultados](https://github.com/shakewingo/Tadpole/blob/main/agent_from_scratch/docs/results.md)
- [Guia de evaluacion y comando de servidor](https://github.com/shakewingo/Tadpole/blob/main/agent_from_scratch/evals/README.md#the-server-command)
- [Dataset Shakewin/tadpole-sft-data](https://huggingface.co/datasets/Shakewin/tadpole-sft-data)
- [Dataset nvidia/When2Call](https://huggingface.co/datasets/nvidia/When2Call)
- [Dataset Agent-Ark/Toucan-1.5M](https://huggingface.co/datasets/Agent-Ark/Toucan-1.5M)
- [Modelo base Qwen/Qwen3-4B-Instruct-2507](https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507)
