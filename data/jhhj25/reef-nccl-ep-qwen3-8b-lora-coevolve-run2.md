# jhhj25/reef-nccl-ep-qwen3-8b-lora-coevolve-run2

## Resumen

`reef-nccl-ep-qwen3-8b-lora-coevolve-run2` es un adaptador LoRA (rank 32) construido sobre el modelo denso `Qwen/Qwen3-8B`, desarrollado por `jhhj25` como parte de un experimento de co-evolución entre modelo y harness. El adaptador se entrenó mediante reinforcement learning (RL) de 16 pasos para resolver una tarea muy específica: seleccionar parámetros de tuning para kernels de comunicación colectiva en paralelismo experto (expert-parallel dispatch/combine). La recompensa se calcula a partir del ancho de banda real medido en hardware (GB/s), con una puerta de corrección que invalida las muestras que no cumplen los requisitos de correctness.

El propósito del modelo no es el razonamiento general ni la generación de texto, sino la optimización de rendimiento de sistemas de entrenamiento distribuido. Cada paso de entrenamiento guarda un checkpoint intermedio (`step_0` a `step_15`), lo que permite analizar la evolución de la política de RL. La relevancia actual radica en la optimización de kernels de comunicación en modelos de mezcla de expertos (MoE), donde el cuello de botella suele estar en el intercambio de activaciones entre expertos. El adaptador es un experimento de investigación en RL aplicada a sistemas de bajo nivel, no un modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con adaptadores LoRA sobre Qwen/Qwen3-8B |
| Parametros totales | no disponible (adaptador LoRA; el modelo base tiene 8B) |
| Parametros activos | no aplicable (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptadores LoRA) |

## Arquitectura y entrenamiento

El adaptador LoRA se aplica sobre el modelo base `Qwen/Qwen3-8B`, un transformer denso decoder-only. La configuración LoRA es r=32, alpha=32, dropout 0.0, y los módulos objetivo son `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`. El entrenamiento se realizó durante 16 pasos de RL con recompensa relativa agrupada (grouped relative-reward RL), utilizando el harness `reef TTTD` para los rollouts y `slime/Megatron` para el entrenamiento LoRA.

La tarea consiste en que el modelo proponga parámetros de tuning para kernels de dispatch/combine en paralelismo experto. La recompensa es el ancho de banda medido en hardware (GB/s) de la operación combinada dispatch+combine, con una puerta de corrección: las muestras que fallan los checks de correctness reciben recompensa cero. Antes de este run, un modelo de 480B propuso una instrucción revisada que mejoró la calidad media de las muestras de 138.28 a 176.56 sobre un checkpoint fijo. Este run se entrenó sobre la instrucción evolucionada. El run anterior, entrenado sobre la instrucción original, obtuvo recompensas medias por paso entre 126.7 y 164.2.

## Capacidades

- Generación de configuraciones de tuning para kernels de comunicación colectiva en entornos de expert-parallel, con parámetros como `qps`, `chunk`, `subputs`, `cb` y `sms`.
- Producción de configuraciones que maximizan el ancho de banda de dispatch+combine, medido en GB/s.
- Integración con el modelo base Qwen3-8B mediante `PeftModel`, permitiendo cargar cualquier checkpoint intermedio (`step_0` a `step_15`).
- No soporta tool calling, function calling, visión, audio ni razonamiento multi-step general.
- No es un modelo multilingüe ni de chat; su capacidad se limita a la tarea de tuning de kernels.
- Como adaptador LoRA, no modifica la arquitectura del modelo base, sino que añade parámetros entrenables de bajo rango.

## Casos de uso

- Autotuning de kernels de comunicación en entrenamiento de modelos MoE: el adaptador genera configuraciones de parámetros para optimizar el ancho de banda de dispatch+combine, reduciendo el tiempo de comunicación en clústeres con paralelismo experto.
- Optimización de rendimiento en clústeres GPU: usar el modelo para explorar configuraciones de kernels colectivos (NCCL o similares) en sistemas de entrenamiento distribuido, evaluando cada propuesta con mediciones de hardware.
- Investigación en RL aplicada a sistemas: el modelo sirve como caso de estudio de cómo el RL puede aprender a configurar kernels de bajo nivel, con recompensas basadas en métricas de rendimiento reales.
- Benchmarking de configuraciones de kernels: generar configuraciones candidatas que se pueden probar en un entorno de referencia, permitiendo comparar el rendimiento de distintas combinaciones de parámetros.
- Co-evolución de instrucciones y modelos: el adaptador puede integrarse en un harness donde un modelo generador propone instrucciones y otro se entrena sobre ellas, como se hizo en este experimento con el modelo de 480B.
- Pruebas de regresión de rendimiento: usar el modelo para generar configuraciones que verifiquen si cambios en los kernels degradan el rendimiento, facilitando la detección de regresiones en pipelines de optimización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La única métrica proporcionada es la recompensa media por paso durante el entrenamiento RL, que se muestra a continuación:

| Paso | Recompensa media (GB/s) |
|---|---|
| 0 | 176.34 |
| 1 | 170.69 |
| 2 | 171.16 |
| 3 | 171.39 |
| 4 | 172.57 |
| 5 | 176.56 |
| 6 | 176.34 |
| 7 | 176.56 |
| 8 | 154.38 |
| 9 | 171.44 |
| 10 | 171.19 |
| 11 | 176.56 |
| 12 | 164.13 |
| 13 | 176.56 |
| 14 | 162.75 |
| 15 | 180.65 |

La mejor configuración encontrada durante el run fue `qps=2, chunk=256, subputs=16, cb=32, sms=12`, alcanzando 184.74 GB/s de ancho de banda total dispatch+combine con correctness 16/16.

## Requisitos de hardware

No se han publicado requisitos de hardware específicos en la información disponible. Al tratarse de un adaptador LoRA, es necesario cargar el modelo base `Qwen/Qwen3-8B` para poder utilizarlo, pero no se proporcionan datos sobre VRAM estimada, GPUs recomendadas, latencia o throughput. Tampoco se indica si es compatible con vLLM, llama.cpp, Ollama o TGI.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con modelos similares. El adaptador es un experimento de investigación muy específico, sin modelos comparables directos en la información proporcionada. Existe un run anterior (`reef-nccl-ep-qwen3-8b-lora-coevolve-m2`) en el repositorio del autor, pero no se detallan sus características ni resultados más allá de la mención de recompensas medias entre 126.7 y 164.2.

## Limitaciones y advertencias

- El modelo es un adaptador LoRA extremadamente especializado en tuning de kernels de comunicación; no sirve para tareas generales de lenguaje, razonamiento o generación de texto.
- La recompensa se basa en mediciones de hardware específicas, por lo que las configuraciones generadas pueden no transferirse a otros entornos, GPUs o arquitecturas de clúster.
- Existe riesgo de alucinación en las configuraciones propuestas; la puerta de correctness durante el entrenamiento mitiga parcialmente este riesgo, pero no lo elimina.
- No se han documentado sesgos conocidos, pero al ser un modelo entrenado con RL sobre una tarea técnica, su comportamiento fuera de esa tarea es impredecible.
- La licencia Apache 2.0 permite uso comercial, pero el adaptador depende del modelo base Qwen3-8B, que también está bajo Apache 2.0.
- El entrenamiento se realizó con una instrucción evolucionada propuesta por un modelo de 480B; los resultados pueden no ser reproducibles con la instrucción original.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/jhhj25/reef-nccl-ep-qwen3-8b-lora-coevolve-run2
- HuggingFace del run anterior: https://huggingface.co/jhhj25/reef-nccl-ep-qwen3-8b-lora-coevolve-m2
- HuggingFace del modelo base: https://huggingface.co/Qwen/Qwen3-8B
