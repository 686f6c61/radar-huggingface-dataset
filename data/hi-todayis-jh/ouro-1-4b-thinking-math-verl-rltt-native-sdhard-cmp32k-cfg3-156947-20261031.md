# hi-todayis-jh/ouro-1.4b-thinking-math-verl-rltt-native-sdhard-cmp32k-cfg3-156947-20261031

## Resumen

Ouro-1.4B-Thinking-Math (identificador completo `ouro-1.4b-thinking-math-verl-rltt-native-sdhard-cmp32k-cfg3-156947-20261031`) es un ajuste fino por refuerzo del modelo base ByteDance/Ouro-1.4B-Thinking, un modelo de lenguaje de 1.400 millones de parametros con arquitectura de bucles (looped language model). El autor, `hi-todayis-jh`, ha aplicado un entrenamiento GRPO (Group Relative Policy Optimization) mediante la libreria verl 0.6.1 sobre un conjunto de datos de matematicas (`compression_dataset_3200.jsonl`), con el objetivo de mejorar las capacidades de razonamiento matematico del modelo base.

La relevancia de esta ficha es doble: por un lado, documenta un checkpoint experimental de investigacion en RL para modelos pequenos; por otro, el modelo base Ouro-1.4B-Thinking de ByteDance es interesante por su arquitectura de bucles, que reutiliza capas para aumentar la profundidad efectiva sin incrementar el numero de parametros. Este ajuste concreto anade un regimen de entrenamiento RL con parametros muy especificos (learning rate 1e-6, beta 0.001, 100 pasos de rollout) y un mecanismo de "exit policy" configurable.

El checkpoint se publica con licencia Apache 2.0 y formato safetensors, e incluye tanto los pesos fusionados listos para usar con `transformers` como los estados completos de entrenamiento (FSDP shards, optimizador, RNG). No obstante, se trata de un artefacto de investigacion con cero descargas y sin benchmarks publicados, por lo que su uso en produccion requiere validacion propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con bucles (looped language model), basado en Ouro-1.4B-Thinking |
| Parametros totales | 1.400 millones (1.4B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el nombre del checkpoint sugiere 32k, `cmp32k`, pero no se confirma en la model card) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizacion post-entrenamiento posible pero no documentada) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (checkpoint fusionado en `global_step_N/actor/huggingface`), mas checkpoints verl en `.pt` (FSDP shards, optimizador, RNG) |

## Arquitectura y entrenamiento

El modelo base Ouro-1.4B-Thinking emplea una arquitectura de transformer con bucles: las capas se reutilizan varias veces en profundidad, lo que incrementa la capacidad efectiva de razonamiento sin aumentar el numero de parametros. Sobre esta base, el autor aplica un ajuste fino por refuerzo con el algoritmo GRPO implementado en verl 0.6.1, usando la extension `verl_trainer` con el algoritmo `rltt` en modo `native`. El entrenamiento consistio en 100 pasos de rollout sobre el dataset `compression_dataset_3200.jsonl`, con un total de 1 epoca.

Los hiperparametros documentados incluyen: learning rate 1e-6, beta 0.001 (coeficiente KL), weight decay 0.1, warmup ratio 0.1, AdamW de 8 bits con betas (0.9, 0.99), `max_grad_norm` 1.0, `ppo_micro_batch_size_per_gpu` 1 y `loss_agg_mode` `seq-mean-token-sum-norm`. Se activa `vllm_async_scheduling` para la generacion de rollouts con `vllm_gpu_memory_utilization` 0.45 y una cache KV de 68.719.476.736 bytes (64 GiB). El mecanismo de "exit policy" usa `--exit_mode fixed --cache_rule full_depth` y un `loop_credit distill` con pesos de bucle superficial `1,1,1` y ratio duro 0.2. El entrenamiento se ejecuto en un job Slurm (156947) en el nodo `orchard-flame-7`.

## Capacidades

- Generacion de texto y razonamiento matematico, reforzado especificamente mediante RL sobre problemas de matematicas.
- Razonamiento multi-paso con modo "thinking" heredado del modelo base Ouro-1.4B-Thinking.
- Arquitectura de bucles que permite profundidad efectiva mayor que un transformer estandar del mismo tamano.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Capacidades de vision o audio: no disponibles (modelo solo de texto segun la informacion).

## Casos de uso

- Investigacion en RL para modelos pequenos: el checkpoint incluye el estado completo de entrenamiento (FSDP shards, optimizador, RNG, dataloader), lo que permite reproducir o continuar el entrenamiento GRPO con verl, util para estudiar la dinamica de RL en modelos de 1.4B.
- Razonamiento matematico en entornos con recursos limitados: con 1.4B parametros, el modelo cabe en GPUs de consumo (por ejemplo, una RTX 4090 con cuantizacion), lo que permite desplegar un asistente de resolucion de problemas matematicos en local.
- Generacion de cadenas de razonamiento para destilacion: el modo thinking del modelo base y el ajuste RL pueden usarse para generar trazas de razonamiento que sirvan como datos de entrenamiento para modelos mayores o para destilacion.
- Evaluacion de tecnicas de "exit policy" y loop credit: el checkpoint documenta una configuracion concreta (`exit_mode fixed`, `cache_rule full_depth`) que puede compararse con otras variantes para estudiar el impacto del numero de bucles en la calidad del razonamiento.
- Prototipado de pipelines de RL con verl: el repositorio incluye `launch_code/`, `training_source.tar.gz` y configuraciones completas, lo que lo convierte en una referencia practica para montar un pipeline GRPO con vLLM asincrono.
- Fine-tuning posterior sobre dominios especificos: al estar en safetensors y ser compatible con `transformers` mediante `trust_remote_code=True`, puede servir como punto de partida para ajustes supervisados en matematicas, fisica o logica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de evaluacion (MATH, GSM8K, MMLU u otras) ni comparaciones con el modelo base. Las unicas metricas mencionadas son las de entrenamiento, registradas en el proyecto W&B `ouro-1.4b-grpo-rltt-math` (run `verl-rltt-native-sdhard-cmp32k-cfg3-156947-20261031`), pero no se proporcionan sus valores.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa para 1.4B parametros: en FP16 aproximadamente 2.8 GB de pesos mas cache KV y overhead; en cuantizacion de 8 bits alrededor de 1.5 GB; en 4 bits alrededor de 0.8 GB. Estas cifras son estimaciones genericas y no estan confirmadas por el autor.
- GPUs recomendadas: no disponibles en la informacion. Por tamano, el modelo es apto para GPUs de consumo como RTX 3090, RTX 4090 o RTX 4070 Ti en FP16 o cuantizado; para entrenamiento RL con verl y vLLM se requiere al menos una GPU profesional (A100, H100) segun la configuracion documentada (64 GiB de cache KV).
- Cabe en GPU de consumo: si, previsiblemente en RTX 4090, 3090 y similares con cuantizacion o FP16, aunque no esta verificado por el autor.
- Opciones de despliegue: compatible con `transformers` (`AutoModelForCausalLM.from_pretrained(..., trust_remote_code=True)`). Para servir con vLLM, llama.cpp, Ollama o TGI no hay instrucciones ni conversiones GGUF publicadas; requeriria conversion manual.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Ouro-1.4B-Thinking-Math (este) | 1.4B | no disponible (posible 32k) | Apache 2.0 | HuggingFace, checkpoint de investigacion | Ajuste RL con GRPO sobre matematicas; sin benchmarks publicados |
| ByteDance/Ouro-1.4B-Thinking | 1.4B | no disponible | Apache 2.0 (segun modelo base) | HuggingFace | Modelo base sin ajuste RL; referencia directa |
| Qwen2.5-Math-1.5B | 1.5B | 32k (tipico en la familia Qwen2.5) | Apache 2.0 | HuggingFace, ampliamente usado | Especializado en matematicas, con benchmarks publicados |
| DeepSeek-R1-Distill-Qwen-1.5B | 1.5B | 32k (tipico) | MIT | HuggingFace, muy popular | Destilado de razonamiento, con evaluaciones publicadas |

La comparacion con Qwen2.5-Math-1.5B y DeepSeek-R1-Distill-Qwen-1.5B es orientativa por tamano y dominio; no se dispone de datos de rendimiento de este checkpoint para establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de que el ajuste RL mejore al modelo base; el numero de pasos (100) y la epoca unica sugieren un ajuste ligero.
- Artefacto de investigacion: cero descargas y cero likes en HuggingFace, sin validacion de la comunidad; no recomendado para produccion sin evaluacion propia.
- Idiomas no documentados: se desconoce si conserva capacidades multilingues del modelo base o si el ajuste RL las ha degradado.
- Riesgo de alucinacion: como todo modelo de lenguaje, especialmente en matematicas donde el RL puede fomentar cadenas de razonamiento plausibles pero incorrectas; requiere verificacion.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base Ouro-1.4B-Thinking debe verificarse por separado (la model card no detalla la licencia del base mas alla de la del checkpoint).
- Dependencia de `trust_remote_code=True`: el modelo incluye codigo de modelado personalizado (`modeling_ouro.py`), lo que implica ejecutar codigo del autor; auditar antes de desplegar.
- Contexto no confirmado: el sufijo `cmp32k` sugiere 32k tokens, pero no se documenta oficialmente; no asumir esa ventana sin verificar.
- Checkpoint pesado (14.4 GB): incluye estados de entrenamiento completos, no solo pesos de inferencia; para uso en produccion conviene extraer unicamente `actor/huggingface`.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hi-todayis-jh/ouro-1.4b-thinking-math-verl-rltt-native-sdhard-cmp32k-cfg3-156947-20261031
- Modelo base: https://huggingface.co/ByteDance/Ouro-1.4B-Thinking
- Dataset de rollouts: https://huggingface.co/datasets/hi-todayis-jh/ouro-1.4b-thinking-math-verl-rltt-native-sdhard-cmp32k-cfg3-156947-20261031-rollouts
- Dataset de entrenamiento: https://huggingface.co/datasets/DigitalLearningGmbH/MATH-lighteval
- Libreria verl: https://github.com/volcengine/verl
- Proyecto W&B: `ouro-1.4b-grpo-rltt-math` (run `verl-rltt-native-sdhard-cmp32k-cfg3-156947-20261031`)
