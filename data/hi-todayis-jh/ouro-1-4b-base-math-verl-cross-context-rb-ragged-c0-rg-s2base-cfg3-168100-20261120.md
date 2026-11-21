# hi-todayis-jh/ouro-1.4b-base-math-verl-cross-context-rb-ragged-c0-rg-s2base-cfg3-168100-20261120

## Resumen

Ouro-1.4B-base-math-verl-cross-context-rb-ragged-c0-rg-s2base-cfg3-168100-20261120 es un checkpoint de investigación publicado por el usuario hi-todayis-jh, resultado de un entrenamiento de reinforcement learning (GRPO) sobre el modelo base ByteDance/Ouro-1.4B-Thinking. No se trata de un modelo nuevo entrenado desde cero, sino de un artefacto de experimentación que documenta un run concreto de la extensión `verl_trainer` sobre el framework verl 0.6.1, con un recipe de RL denominado `cross_context_rb` en modo `ragged`.

El interés del artefacto es metodológico: incluye el manifiesto del run, la configuración completa de verl, el código del launcher, el código del modelo parcheado (`modeling_ouro.py`, `configuration_ouro.py`), un snapshot de las fuentes de entrenamiento y las receipts de verificación de cada fichero. El modelo subyacente, Ouro-1.4B-Thinking de ByteDance, es un modelo de lenguaje con arquitectura "looped" (reutilización iterativa de capas) orientado a razonamiento matemático.

La relevancia es limitada para uso en producción: el repositorio tiene 0 descargas y 0 likes, el tamaño reportado es de 0.0 GB y no se publican resultados de benchmarks ni métricas de evaluación. Es un checkpoint de paso intermedio (`global_step_N`) pensado para reproducibilidad de experimentos de RL, no para despliegue directo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer "looped" (Ouro), con política de salida adaptativa (`exit_mode adaptive`) |
| Parametros totales | 1.4B (heredados del base ByteDance/Ouro-1.4B-Thinking) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin GGUF publicado) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (en `global_step_N/actor/huggingface/`), más shards FSDP en `.pt` |

## Arquitectura y entrenamiento

El modelo subyacente es ByteDance/Ouro-1.4B-Thinking, un transformer de 1.4B parámetros con mecanismo "looped": las capas se reutilizan en varias iteraciones de profundidad, lo que permite aumentar la profundidad efectiva de cómputo sin incrementar el número de parámetros. El checkpoint incorpora una política de salida adaptativa (`--exit_mode adaptive`, `--min_depth 2`) que decide en qué iteración detener el bucle de capas, junto con un `policy_config.json` que describe dicha política.

El entrenamiento se realizó con verl 0.6.1 usando el algoritmo GRPO con el recipe `cross_context_rb` en modo `ragged`, sobre el dataset `compression_dataset_3200.jsonl` (derivado de DigitalLearningGmbH/MATH-lighteval). Los hiperparámetros principales son: learning rate 1e-6, beta KL 0.001, AdamW8bit con betas (0.9, 0.99), weight decay 0.1, warmup ratio 0.1, `max_grad_norm` 1.0, `loss_agg_mode seq-mean-token-sum-norm`, 100 pasos de rollout y 1 época. Se usó vLLM con `--vllm_async_scheduling`, `--vllm_gpu_memory_utilization 0.45` y `--vllm_kv_cache_memory_bytes 68719476736` (64 GiB), con layout de KV en "lanes" (`--ragged_kv_layout lanes`) y `--cache_rule ragged`. No se documenta RLHF/DPO; es RL puro con GRPO sobre recompensas de matemáticas.

## Capacidades

- Generación de texto y razonamiento matemático (el modelo base está orientado a "thinking" y el entrenamiento se hizo sobre MATH-lighteval).
- Razonamiento multi-paso mediante el mecanismo looped con profundidad adaptativa.
- Capacidad de "thinking mode" heredada del base Ouro-1.4B-Thinking.
- Compatible con `transformers` vía `AutoModelForCausalLM.from_pretrained(..., trust_remote_code=True)`.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente: no disponible.
- Capacidades multilingües: no disponible (idiomas no declarados).
- Visión / audio: no disponible.

## Casos de uso

- Reproducción de experimentos de RL: cargar `global_step_N/actor/huggingface` para inspeccionar el efecto del recipe `cross_context_rb` sobre el modelo base y comparar con otros checkpoints del mismo run.
- Investigación en GRPO sobre tareas de matemáticas: usar la configuración resuelta (`run_config.json`, `verl_config.yaml`) como plantilla para replicar el entrenamiento con verl 0.6.1 en otros datasets de MATH.
- Estudio de políticas de salida adaptativa: analizar `policy_config.json` y el `modeling_ouro.py` parcheado para entender cómo `exit_mode adaptive` y `min_depth 2` afectan al coste computacional por token.
- Auditoría de reproducibilidad: los ficheros en `records/receipts/` y `training_source.tar.gz` permiten verificar la integridad del checkpoint y reconstruir el pipeline exacto de entrenamiento.
- Análisis de rollouts: el dataset asociado `...-rollouts` permite estudiar las trayectorias generadas por el modelo durante el RL y depurar problemas de recompensa.
- Base para fine-tuning posterior: al ser un checkpoint intermedio con licencia Apache 2.0, puede servir como punto de partida para experimentos de RL adicionales o SFT sobre dominios matemáticos específicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; para un modelo de 1.4B en FP16 se estiman en torno a 3-4 GB de pesos, más overhead de KV cache, aunque no se confirma en la información.
- GPU recomendadas: no disponible. El entrenamiento usó vLLM con `gpu_memory_utilization 0.45` y 64 GiB de KV cache, lo que sugiere GPUs de数据中心 (A100/H100), pero no se especifica el modelo exacto.
- ¿Cabe en consumer GPU? No confirmado; por tamaño (1.4B) probablemente sí en GPUs de 8-16 GB, pero no hay datos publicados.
- Opciones de despliegue: `transformers` con `trust_remote_code=True`; el checkpoint está en formato safetensors y shards FSDP, sin GGUF publicado, por lo que llama.cpp/Ollama no están soportados de forma directa sin conversión manual.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Benchmarks | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (Ouro-1.4B RL) | 1.4B | no disponible | no publicados | Apache 2.0 | 0 descargas |
| ByteDance/Ouro-1.4B-Thinking | 1.4B | no disponible en esta ficha | no disponible en esta ficha | no disponible en esta ficha | modelo base público |
| Modelos de ~1.4B tipo Qwen2.5-1.5B | ~1.5B | 32k (referencia) | no comparado aquí | Apache 2.0 | ampliamente disponible |

Nota: los datos de los modelos alternativos no provienen de la información proporcionada y se incluyen solo como referencia de categoría; no se dispone de comparación de rendimiento verificada.

## Limitaciones y advertencias

- Checkpoint intermedio de investigación (`global_step_N`), no un modelo final pulido; puede presentar degradación respecto al base en tareas fuera de matemáticas.
- Sin benchmarks publicados: no hay evidencia cuantitativa de mejora sobre el modelo base.
- Riesgo de alucinación no evaluado; el entrenamiento se centró en MATH-lighteval, lo que puede sesgar el comportamiento hacia ese formato de problema.
- Idiomas no declarados: no se garantiza un rendimiento multilingüe.
- Requiere `trust_remote_code=True` para cargar, lo que implica ejecutar código del autor (`modeling_ouro.py`); auditar antes de usar en producción.
- El repositorio reporta 0.0 GB de tamaño y 0 descargas, lo que sugiere que los pesos pueden no estar efectivamente alojados o que el artefacto es principalmente documental.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluación y de garantías hace desaconsejable su despliegue directo sin validación propia.
- Dependencia de la versión de verl (0.6.1) y de parches concretos del modelo; la reproducibilidad está ligada a ese entorno.

## Enlaces

- Hugging Face: https://huggingface.co/hi-todayis-jh/ouro-1.4b-base-math-verl-cross-context-rb-ragged-c0-rg-s2base-cfg3-168100-20261120
- Modelo base: https://huggingface.co/ByteDance/Ouro-1.4B-Thinking
- Dataset de rollouts: https://huggingface.co/datasets/hi-todayis-jh/ouro-1.4b-base-math-verl-cross-context-rb-ragged-c0-rg-s2base-cfg3-168100-20261120-rollouts
- Dataset de entrenamiento: https://huggingface.co/datasets/DigitalLearningGmbH/MATH-lighteval
- Framework verl: https://github.com/volcengine/verl
- W&B (proyecto `ouro-1.4b-grpo-rltt-math`, run `verl-cross_context_rb-ragged-c0-rg-s2base-cfg3-168100-20261120`): no se proporciona URL directa en la información disponible.
