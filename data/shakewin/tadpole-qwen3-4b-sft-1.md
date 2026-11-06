# Shakewin/tadpole-qwen3-4b-sft-1

## Resumen

Tadpole SFT-1 es un adaptador LoRA de tipo PEFT para el modelo base Qwen3-4B-Instruct-2507, desarrollado por el autor independiente Shakewin. Forma parte de Tadpole, un agente de uso de herramientas construido desde cero y post-entrenado en etapas medibles, donde el codigo, los prompts y las herramientas del agente permanecen congelados y solo cambian los pesos. El adaptador esta especializado en tool calling y uso de agentes dentro de un entorno de trabajo concreto, no en conversacion general.

El adaptador se entrena mediante SFT sobre trayectorias verificadas de un profesor (generadas con DeepSeek-V4.1-Flash) combinadas con datos publicos de tool use: 956 ejemplos del profesor repetidos 3 veces, 2.000 filas convertidas de NVIDIA When2Call y 3.002 filas convertidas de Agent-Ark Toucan-1.5M, totalizando 7.870 filas. El resultado es un adaptador de rango 16 y 33 millones de parametros entrenables sobre un modelo base de 4.000 millones de parametros.

Su relevancia radica en que demuestra una mejora sustancial y medida sobre el modelo base en tareas de agente: pass@1 en el conjunto de test sube de 0,419 a 0,774, y pass^3 de 0,364 a 0,707. No obstante, el propio autor advierte que las metricas provienen de un benchmark local pequeno (140 tareas de test y 80 de hard test) y que el adaptador solo se ha medido dentro del harness de Tadpole, con su plantilla de chat y sus esquemas de herramientas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen3-4B-Instruct-2507 |
| Parametros totales | 33.030.144 (parametros del adaptador; el modelo base Qwen3-4B tiene 4.000 millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (configurado en el servidor vLLM de referencia) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; el repo incluye tambien GGUF) |
| Idiomas soportados | en |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT); el repo incluye tambien GGUF |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-4B-Instruct-2507, un transformer decoder-only de 4.000 millones de parametros. La adaptacion es un LoRA de rango 16, alpha 32 y dropout 0,05, aplicado a las proyecciones `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`. La funcion de perdida cubre unicamente la completacion, no el prompt.

El entrenamiento usa 7.870 filas: 956 ejemplos verificados del profesor (teacher-v1) repetidos 3 veces, 2.000 filas convertidas de When2Call y 3.002 filas convertidas de Toucan. Se realizaron 3 epocas con learning rate 0,0001, warmup lineal, decaimiento coseno (10% de warmup), acumulacion de gradiente 8, clipping 1,0 y semilla 0, en bfloat16 sobre una unica GPU. El adaptador publicado corresponde a la epoca 2, elegida sobre un split de validacion separado. El modelo base se fija en la revision `cdbee75f17c01a7cc42f958dc650907174af0554`.

## Capacidades

- Tool calling y function calling dentro del formato de herramientas de Tadpole.
- Uso de agentes con razonamiento multi-paso en un entorno de trabajo (workspace).
- Generacion de texto orientada a la resolucion de tareas de agente.
- Seguimiento de trayectorias de profesor verificadas en tareas de tool use.
- Capacidades multilingues limitadas al ingles (idioma declarado: en).
- No esta entrenado para conversacion general, sino para uso de herramientas dentro de un workspace.

## Casos de uso

- Automatizacion de agentes de herramientas: el adaptador esta disenado para integrarse en Tadpole con su plantilla de chat y esquemas de herramientas, y ejecutar tareas de tool calling multi-paso en un workspace concreto.
- Evaluacion de pipelines de agentes: sirve como referencia para medir pass@1 y pass^3 en tareas de agente con el harness de Tadpole y vLLM.
- Investigacion en post-entrenamiento por etapas: permite reproducir el flujo de SFT sobre trayectorias de profesor mas datos publicos de tool use, con recetas y hashes publicados.
- Prototipado de asistentes que invocan APIs: con un unico GPU de 24 GB o mas, se puede servir el modelo base con el adaptador en vLLM y probar flujos de function calling.
- Generacion de datos sinteticos de tool use: el adaptador puede producir trayectorias de llamadas a herramientas para alimentar otros entrenamientos.
- Despliegue en entornos con recursos limitados: al ser un adaptador LoRA sobre un modelo de 4.000 millones de parametros, el coste de almacenamiento y de inferencia es bajo comparado con modelos mayores.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card (pass@1 sobre todas las tareas y tres muestras por tarea; pass^3 sobre tareas cuyas tres muestras pasan):

| Metrica | Base | SFT-1 | SFT-2 | EI-3 |
|---|---:|---:|---:|---:|
| Test pass@1 (140 tareas) | 0,419 | 0,774 | 0,738 | 0,745 |
| Test pass^3 | 0,364 | 0,707 | 0,607 | 0,657 |
| Hard test pass@1 (80 tareas) | 0,275 | 0,429 | 0,492 | 0,471 |
| Hard test pass^3 | 0,125 | 0,250 | 0,325 | 0,338 |
| BFCL multi-turn (adaptacion local) | 0,360 | 0,285 | 0,325 | 0,395 |

El BFCL multi-turn es una adaptacion local de la categoria base multi-turno de BFCL, no una puntuacion de leaderboard. Los conjuntos de test y hard test contienen tipos de tarea que no aparecen en ningun conjunto de entrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el autor indica que los numeros se midieron con vLLM en una GPU de 24 GB o mas.
- GPU recomendadas: una GPU con al menos 24 GB de VRAM (por ejemplo, RTX 4090, A100, H100) para servir el modelo base con el adaptador en vLLM.
- Cabe en GPU de consumo: si, en GPUs con 24 GB o mas de VRAM segun la indicacion del autor.
- Opciones de despliegue: vLLM 0.30.0 con `--enable-lora --max-lora-rank 64`, o PEFT con transformers.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

Comparativa con los otros adaptadores de la misma familia Tadpole, segun los datos de la model card:

| Modelo | Base | Test pass@1 | Test pass^3 | Hard test pass@1 | Hard test pass^3 | Licencia |
|---|---:|---:|---:|---:|---:|---|
| Tadpole SFT-1 | Qwen3-4B-Instruct-2507 | 0,774 | 0,707 | 0,429 | 0,250 | Apache-2.0 |
| Tadpole SFT-2 | Qwen3-4B-Instruct-2507 | 0,738 | 0,607 | 0,492 | 0,325 | no disponible |
| Tadpole EI-3 | Qwen3-4B-Instruct-2507 | 0,745 | 0,657 | 0,471 | 0,338 | no disponible |
| Qwen3-4B-Instruct-2507 (base) | - | 0,419 | 0,364 | 0,275 | 0,125 | Apache-2.0 |

No se dispone de comparacion con modelos de otras familias en la informacion proporcionada.

## Limitaciones y advertencias

- Una sola ejecucion de entrenamiento por modelo; los resultados no constituyen una afirmacion sobre capacidad general de agente.
- Benchmark local pequeno (140 tareas de test y 80 de hard test), no un leaderboard.
- Las puntuaciones de When2Call estan en distribucion para todos los modelos entrenados con datos publicos.
- El adaptador hereda las limitaciones del modelo base y fue entrenado para uso de herramientas dentro de un workspace, no para chat general.
- Solo se ha medido dentro del harness de Tadpole, con su plantilla de chat y esquemas de herramientas; con otra plantilla o formato de herramientas el comportamiento puede diferir.
- Idioma declarado: solo ingles.
- Riesgo de alucinacion y sesgos: no disponible de forma especifica; se heredan los del modelo base.
- Licencia Apache-2.0, que permite uso comercial; el codigo de Tadpole es MIT y los datos derivan de When2Call (CC-BY-4.0) y Toucan-1.5M (Apache-2.0).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Shakewin/tadpole-qwen3-4b-sft-1
- Repositorio Tadpole: https://github.com/shakewingo/Tadpole
- Resultados detallados: https://github.com/shakewingo/Tadpole/blob/main/agent_from_scratch/docs/results.md
- Guia de evaluacion: https://github.com/shakewingo/Tadpole/blob/main/agent_from_scratch/evals/README.md
- Dataset de entrenamiento: https://huggingface.co/datasets/Shakewin/tadpole-sft-data
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Dataset When2Call: https://huggingface.co/datasets/nvidia/When2Call
- Dataset Toucan-1.5M: https://huggingface.co/datasets/Agent-Ark/Toucan-1.5M
