# jhhj25/reef-nccl-ep-qwen3-8b-lora-16k-run2

## Resumen

`reef-nccl-ep-qwen3-8b-lora-16k-run2` es un adaptador LoRA de rango 32 sobre el modelo base `Qwen/Qwen3-8B`, desarrollado por `jhhj25`. No es un modelo de lenguaje autonomo, sino un adaptador entrenado mediante aprendizaje por refuerzo de recompensa relativa agrupada para resolver una tarea concreta de ajuste de kernels NCCL EP (expert parallelism) en una variante de 16384 tokens de contexto. El objetivo es descubrir configuraciones de parametros como `qps`, `chunk`, `subputs`, `cb` y `sms` que maximicen el ancho de banda de comunicacion en kernels de NCCL.

El repositorio contiene 16 checkpoints intermedios (`step_0` a `step_15`), cada uno con `adapter_config.json` y `adapter_model.safetensors`. La mejor configuracion encontrada es `qps=2 chunk=512 subputs=8 cb=32 sms=11`, que alcanza 191.45 GB/s con correctness 16/16. El entrenamiento converge a un atractor de muestreo en el rango de 189.5-190.9 GB/s. Este adaptador es relevante para equipos que trabajan en optimizacion de comunicaciones colectivas en entrenamiento distribuido y paralelismo de expertos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (rank 32) sobre transformer denso Qwen/Qwen3-8B |
| Parametros totales | No disponible (depende del checkpoint; el adaptador LoRA es pequeno, el base es 8B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (la tarea usa una variante de 16384 tokens) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (`adapter_model.safetensors`) con `adapter_config.json` (PEFT) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rango 32 montado sobre `Qwen/Qwen3-8B`, un transformer denso. El entrenamiento se realizo mediante aprendizaje por refuerzo de recompensa relativa agrupada (grouped relative-reward RL) durante 16 pasos, usando la tecnica `reef TTTD` con entrenamiento LoRA de slime/Megatron. La tarea es el ajuste de kernels NCCL EP en su variante de 16384 tokens, que nunca habia sido optimizada antes; solo existia una configuracion ancla sin ajustar con `chunk=512`.

Los 16 checkpoints intermedios permiten trazar la curva de entrenamiento. La mejor configuracion descubierta es `qps=2 chunk=512 subputs=8 cb=32 sms=11`, con 191.45 GB/s y correctness 16/16. El entrenamiento converge a un atractor en el rango de 189.5-190.9 GB/s. Ademas, la optima previamente encontrada a 8192 tokens (`subputs=6 cb=32 sms=11` sobre `chunk=256`) se transfiere estructuralmente a 16384 tokens, aplicada sobre el ancla `chunk=512`.

## Capacidades

- Optimizacion de configuracion de kernels NCCL EP para comunicaciones colectivas en paralelismo de expertos.
- Descubrimiento de configuraciones originales: las 28 configuraciones medidas en esta tarea son descubrimientos del modelo.
- Transferencia estructural de optimizaciones entre tamaños de contexto (de 8192 a 16384 tokens).
- Generacion de parametros concretos de tuning: `qps`, `chunk`, `subputs`, `cb`, `sms`.
- No ofrece capacidades de generacion de lenguaje general, razonamiento, codigo, matematicas, vision, tool calling ni soporte multilingue.
- No es un modelo de proposito general; su funcion es actuar como agente de RL para tuning de sistemas.

## Casos de uso

- Ajuste automatico de comunicaciones colectivas en entrenamiento distribuido: el adaptador propone valores de `qps`, `chunk`, `subputs`, `cb` y `sms` para maximizar el ancho de banda en kernels NCCL EP, reduciendo el tiempo de tuning manual.
- Optimizacion de paralelismo de expertos en modelos MoE: al ajustar el kernel EP para una longitud de contexto de 16384 tokens, se puede mejorar el rendimiento de la capa de comunicacion en sistemas con expertos paralelos.
- Exploracion de espacio de configuracion para clusters especificos: dado que el modelo converge a un atractor de 189.5-190.9 GB/s, puede servir para identificar rapidamente regiones de configuracion prometedoras en hardware similar.
- Transferencia de optimizaciones entre tamaños de contexto: la configuracion optima encontrada a 8192 tokens se transfiere estructuralmente a 16384, lo que permite reutilizar conocimiento de tuning en distintos tamaños de ventana.
- Investigacion en RL para tuning de sistemas: los 16 checkpoints intermedios permiten trazar la curva de entrenamiento y estudiar como el agente de RL descubre configuraciones.
- Benchmarking de kernels en entornos de produccion: se puede integrar el adaptador en un pipeline que evalue configuraciones candidatas y seleccione la mejor (p.ej. `qps=2 chunk=512 subputs=8 cb=32 sms=11`) para un despliegue concreto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Los unicos datos de rendimiento son los de la tarea de tuning de kernels:

| Metrica | Resultado |
|---|---|
| Mejor configuracion encontrada | `qps=2 chunk=512 subputs=8 cb=32 sms=11` |
| Ancho de banda maximo | 191.45 GB/s |
| Correctness | 16/16 |
| Rango de convergencia del entrenamiento | 189.5-190.9 GB/s |
| Numero de configuraciones medidas | 28 |

## Requisitos de hardware

- VRAM estimada: el adaptador LoRA es pequeno (el repositorio pesa 2.8 GB e incluye 16 checkpoints), pero la inferencia requiere cargar el modelo base `Qwen/Qwen3-8B` en bfloat16 (~16 GB) mas el adaptador. Para cargar un solo checkpoint se estiman entre 16 y 20 GB de VRAM.
- GPU recomendadas: A100 40GB, H100 80GB, RTX 4090 24GB.
- Si cabe en consumer GPU: si, en GPUs de 24GB como la RTX 4090.
- Opciones de despliegue: `transformers` + `peft` (usando `PeftModel`), o servidores con soporte de adaptadores LoRA como vLLM o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `jhhj25/reef-nccl-ep-qwen3-8b-lora-16k-run2` | Adaptador LoRA rank 32 sobre 8B | Tarea de 16384 tokens | Apache 2.0 | HuggingFace | 16 checkpoints, mejor config 191.45 GB/s |
| `jhhj25/reef-nccl-ep-qwen3-8b-lora-discovery-16step` | No disponible | No disponible | No disponible | HuggingFace | Mismo autor, posiblemente similar, sin datos suficientes |
| `Qwen/Qwen3-8B` (base) | 8B dense | No disponible | Apache 2.0 | HuggingFace | Modelo base sin adaptador, no entrenado para tuning de kernels |

No se han encontrado modelos comparables publicados con datos suficientes para una comparativa mas detallada.

## Limitaciones y advertencias

- Es un adaptador LoRA, no un modelo autonomo; requiere cargar `Qwen/Qwen3-8B` como modelo base.
- Entrenado en una tarea muy especifica (tuning de kernels NCCL EP); no sirve para generacion de lenguaje general, razonamiento ni otras tareas de NLP.
- Solo 16 pasos de RL; la optimizacion puede no converger a un optimo global y podria sobreajustarse a la tarea concreta.
- No se han realizado evaluaciones de sesgos ni de alucinacion. Al ser un adaptador de tuning, no genera texto libre, por lo que el riesgo de alucinacion es bajo en su uso previsto, pero no esta evaluado.
- Los resultados de rendimiento (191.45 GB/s) dependen del hardware y del entorno; pueden no transferirse a otros clusters o configuraciones.
- La licencia Apache 2.0 permite uso comercial, pero hay que cumplir la atribucion y las condiciones de la licencia del modelo base `Qwen/Qwen3-8B`.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jhhj25/reef-nccl-ep-qwen3-8b-lora-16k-run2
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Modelo similar del mismo autor: https://huggingface.co/jhhj25/reef-nccl-ep-qwen3-8b-lora-discovery-16step
- No se han encontrado papers, blogs ni demos adicionales en la busqueda web.
