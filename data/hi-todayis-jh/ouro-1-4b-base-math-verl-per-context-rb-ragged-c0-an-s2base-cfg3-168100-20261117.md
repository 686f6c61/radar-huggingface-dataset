# hi-todayis-jh/ouro-1.4b-base-math-verl-per-context-rb-ragged-c0-an-s2base-cfg3-168100-20261117

## Resumen

Ouro-1.4B-Base-Math (nombre completo del repositorio: `ouro-1.4b-base-math-verl-per-context-rb-ragged-c0-an-s2base-cfg3-168100-20261117`) es un checkpoint de investigación publicado por el usuario `hi-todayis-jh`. No se trata de un modelo preentrenado desde cero, sino del resultado de un ciclo de ajuste fino mediante aprendizaje por refuerzo (RL) sobre el modelo base `ByteDance/Ouro-1.4B-Thinking`, un transformer "looped" (con recirculación de capas) de 1.400 millones de parámetros desarrollado por ByteDance.

El entrenamiento se ha realizado con la librería verl 0.6.1 aplicando una receta GRPO (Group Relative Policy Optimization) sobre el conjunto de datos matemático `compression_dataset_3200.jsonl`, derivado de `DigitalLearningGmbH/MATH-lighteval`. La configuración incluye innovaciones específicas para modelos con profundidad adaptativa, como una política de salida adaptativa (`exit_mode adaptive`), caché KV con disposición "ragged" por carriles y un modo de recompensa por contexto (`per_context_rb`).

El interés de este checkpoint es fundamentalmente metodológico: documenta de forma exhaustiva (manifiestos, código de lanzamiento, parches al código de modelado, recibos de verificación) cómo aplicar RL con verl a un modelo de bucle adaptativo en un entorno Slurm. No es un modelo pensado para producción ni para uso general, sino un artefacto reproducible de experimentación en razonamiento matemático.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer "looped" (Ouro) con profundidad adaptativa y salida temprana configurable |
| Parametros totales | 1.4B (heredados del modelo base `ByteDance/Ouro-1.4B-Thinking`) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | No disponible (los pesos se distribuyen en safetensors en precision completa) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (checkpoint Hugging Face fusionado en `global_step_N/actor/huggingface`), ademas de shards FSDP en `.pt` |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Ouro de ByteDance, un transformer con recirculación de capas (looped language model) en el que el mismo bloque de parámetros se aplica repetidamente un número variable de veces, lo que permite ajustar la profundidad efectiva en tiempo de inferencia. El checkpoint incorpora un `policy_config.json` con la política de salida (`exit_mode adaptive`, `min_depth 2`), de modo que el modelo puede decidir dinámicamente cuándo detener la recirculación. El entrenamiento se ha realizado con verl 0.6.1 sobre el algoritmo GRPO con la receta `per_context_rb` en modo `ragged`, con 100 pasos de rollout, una sola época y un tamaño de micro-lote PPO de 1 por GPU.

Los hiperparámetros documentados incluyen `learning_rate 1e-6`, `beta 0.001` (coeficiente KL), `max_grad_norm 1.0`, optimizador AdamW8bit con betas `(0.9, 0.99)`, `weight_decay 0.1`, `warmup_ratio 0.1` y agregación de pérdida `seq-mean-token-sum-norm`. Se desactiva la KL en la compuerta (`--no_gate_kl`) y se usa una línea base de recompensa por leave-one-out (`gate_reward_baseline loo`) con tasa de aprendizaje de compuerta `2e-4`. El motor de generación es vLLM con planificación asíncrona, 45% de utilización de memoria GPU y 64 GiB de caché KV. El conjunto de datos de entrenamiento es `compression_dataset_3200.jsonl`, derivado de MATH-lighteval (problemas matemáticos de competición).

## Capacidades

- Razonamiento matemático: el ajuste se ha realizado específicamente sobre problemas de MATH-lighteval, por lo que el modelo está orientado a la resolución de problemas de competición.
- Modo "thinking": hereda la capacidad de razonamiento extendido del modelo base `Ouro-1.4B-Thinking`.
- Profundidad adaptativa: la recirculación de capas con salida temprana permite ajustar el coste computacional por consulta.
- Generación de texto autoregresiva estándar mediante `AutoModelForCausalLM` con `trust_remote_code=True`.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni capacidades multilingües en la información proporcionada.

## Casos de uso

- Investigación en RL para modelos de bucle: el checkpoint sirve como referencia reproducible de cómo aplicar GRPO con verl a arquitecturas con profundidad adaptativa, incluyendo manifiestos, configuración resuelta y código de lanzamiento.
- Estudio de políticas de salida temprana: el archivo `policy_config.json` y los registros de entrenamiento permiten analizar cómo evoluciona la política de salida adaptativa durante el RL.
- Reproducción de experimentos en clúster: la inclusión de `launch_code/`, `training_source.tar.gz` y `run_config.json` facilita replicar el entrenamiento en entornos Slurm con verl 0.6.1.
- Evaluación de recetas de recompensa: la configuración `per_context_rb` con línea base leave-one-out es un caso de estudio para comparar estrategias de recompensa en tareas matemáticas.
- Análisis de eficiencia de caché KV: la disposición "ragged" por carriles y la configuración de memoria de vLLM documentadas permiten estudiar el rendimiento de inferencia en modelos con longitud variable.
- Base para ajustes posteriores: al estar en safetensors y cargable con Transformers, puede servir como punto de partida para nuevos ciclos de RL o SFT sobre dominios matemáticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; para un modelo de 1.4B en safetensors en precisión completa se requiere aproximadamente 5,6 GB solo para pesos, más caché KV y activaciones.
- GPU recomendadas: no especificadas en la información proporcionada; el entrenamiento se realizó en un nodo Slurm (`orchard-flame-1`) con vLLM y 64 GiB de caché KV configurados, lo que sugiere GPUs de clase A100/H100.
- GPU de consumo: un modelo de 1.4B puede caber en GPUs consumer (RTX 3090, RTX 4090) en cuantización de 8 o 4 bits, aunque no se documentan cuantizaciones oficiales.
- Opciones de despliegue: carga directa con `transformers` (`AutoModelForCausalLM.from_pretrained(..., trust_remote_code=True)`); vLLM se usó durante el entrenamiento pero no se documenta una receta de despliegue en producción.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Ouro-1.4B-Base-Math (este checkpoint) | 1.4B | No disponible | Apache 2.0 | Hugging Face (repo de investigacion) |
| ByteDance/Ouro-1.4B-Thinking (modelo base) | 1.4B | No disponible | Apache 2.0 | Hugging Face |
| Qwen2.5-1.5B-Instruct | 1.5B | 32K (segun documentacion publica del modelo base) | Apache 2.0 | Hugging Face |
| DeepSeek-R1-Distill-Qwen-1.5B | 1.5B | 32K (segun documentacion publica del modelo base) | MIT | Hugging Face |

No se dispone de datos de rendimiento comparativo para este checkpoint en la información proporcionada; la comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Checkpoint de investigación: no es un modelo validado para producción; el repositorio tiene 0 descargas y 0 likes en el momento de la consulta.
- Sesgos: no documentados; al derivar de un modelo base entrenado con datos web, puede heredar sesgos de ese corpus.
- Alucinación: riesgo no cuantificado; el ajuste sobre MATH-lighteval no elimina la posibilidad de razonamientos incorrectos fuera de ese dominio.
- Contexto e idiomas: no se especifican la longitud de contexto ni los idiomas soportados, lo que impide garantizar su comportamiento multilingüe.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo base y los datos de entrenamiento (MATH-lighteval) pueden tener sus propias condiciones que conviene verificar.
- Reproducibilidad: el entrenamiento depende de versiones concretas (verl 0.6.1, parches a `modeling_ouro.py`) y de un entorno Slurm específico; replicarlo fuera de ese entorno requiere adaptaciones.
- Formato de checkpoint: los shards FSDP en `.pt` y los archivos auxiliares (`data.pt`, `extra_state_...`) no son directamente utilizables fuera de verl; solo la carpeta `actor/huggingface` es portable.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hi-todayis-jh/ouro-1.4b-base-math-verl-per-context-rb-ragged-c0-an-s2base-cfg3-168100-20261117
- Dataset de rollouts: https://huggingface.co/datasets/hi-todayis-jh/ouro-1.4b-base-math-verl-per-context-rb-ragged-c0-an-s2base-cfg3-168100-20261117-rollouts
- Modelo base: https://huggingface.co/ByteDance/Ouro-1.4B-Thinking
- Dataset de entrenamiento: https://huggingface.co/datasets/DigitalLearningGmbH/MATH-lighteval
- Proyecto W&B de métricas: `ouro-1.4b-grpo-rltt-math` (run `verl-per_context_rb-ragged-c0-an-s2base-cfg3-168100-20261117`)
