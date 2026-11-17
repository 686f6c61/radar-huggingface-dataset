# hi-todayis-jh/ouro-1.4b-base-math-verl-rltt-native-cons-base-cmp32k-cfg3-168100-20261117

## Resumen

Ouro-1.4B-Base-Math-Verl-RLTT-Native-Cons-Base-CMP32K-CFG3-168100-20261117 es un checkpoint de ajuste fino por refuerzo (reinforcement learning) del modelo ByteDance/Ouro-1.4B-Thinking, desarrollado por el usuario hi-todayis-jh. Se trata de un experimento de entrenamiento reproducible con el framework verl 0.6.1, aplicando la receta GRPO (Group Relative Policy Optimization) sobre el dataset de compresión `compression_dataset_3200.jsonl` derivado de DigitalLearningGmbH/MATH-lighteval, un conjunto de problemas matemáticos de competición.

El modelo base Ouro-1.4B-Thinking es un modelo de lenguaje de tipo "looped" (looped language model, es decir, un transformer con capas recurrentes en bucle), con 1.400 millones de parámetros y una capacidad de razonamiento extendido mediante modo "thinking". Este checkpoint concreto aplica una variante de RL denominada `rltt` (reinforcement learning with thinking tokens) en modo `native`, con 100 pasos de rollout, usando una política de salida fija (`exit_mode fixed`) y crédito de bucle por consistencia (`loop_credit consistency` con peso 0,1).

La relevancia de esta ficha es doble: por un lado, documenta un checkpoint experimental de RL sobre un modelo pequeño y eficiente; por otro, sirve como ejemplo de reproducibilidad técnica en entrenamiento con verl, ya que el repositorio incluye manifiestos de ejecución, configuración completa, código parcheado y recibos de verificación de archivos. No obstante, se trata de un artefacto de investigación sin benchmarks publicados ni métricas de evaluación finales en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con bucles recurrentes (looped language model), basado en Ouro-1.4B-Thinking |
| Parámetros totales | 1.400 millones (1,4B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el nombre del checkpoint sugiere 32K, pero no se confirma en la model card) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (en `actor/huggingface/`), más checkpoints FSDP en formato `.pt` |

## Arquitectura y entrenamiento

El modelo base Ouro-1.4B-Thinking emplea una arquitectura de transformer con capas recurrentes en bucle ("looped"), una innovación que permite reutilizar bloques de parámetros varias veces durante el forward pass, aumentando la profundidad efectiva sin incrementar el número de parámetros. Sobre esta base, el checkpoint aquí documentado aplica un ajuste fino por refuerzo con el framework verl 0.6.1, usando la receta GRPO con la extensión `verl_trainer` y el algoritmo `rltt` en modo `native`.

El entrenamiento se realizó durante 100 pasos de rollout en un único nodo (`orchard-flame-8`) mediante Slurm (job 168100). Los hiperparámetros clave incluyen: learning rate 1e-6, optimizador AdamW8bit con betas (0,9; 0,99), weight decay 0,1, warmup ratio 0,1, `max_grad_norm` 1,0, `ppo_micro_batch_size_per_gpu` 1, una época, `loss_agg_mode` seq-mean-token-sum-norm, `beta` 0,001 (coeficiente KL), y una penalización de longitud desactivada (`length_penalty_alpha` 0). Se activó `vllm_async_scheduling` para la generación de rollouts, con `vllm_gpu_memory_utilization` 0,45 y una caché KV de 64 GiB (68719476736 bytes). La innovación destacable es el uso de `loop_credit consistency` con peso 0,1 y pesos de bucle poco profundos (1,1,1), que introduce una señal de consistencia entre iteraciones del bucle recurrente durante el RL. La política de salida es fija (`--exit_mode fixed`) con regla de caché `full_depth`.

## Capacidades

- Generación de texto y razonamiento matemático: el modelo base está especializado en problemas de matemáticas de competición (MATH-lighteval), y este checkpoint refuerza ese dominio mediante RL.
- Modo "thinking" (razonamiento extendido): heredado de Ouro-1.4B-Thinking, permite cadenas de razonamiento largas antes de la respuesta final.
- Razonamiento multi-paso: adecuado para problemas que requieren descomposición en subtareas.
- Procesamiento de contexto largo: el nombre del checkpoint sugiere 32K tokens, aunque no se confirma en la documentación.
- No se ha documentado soporte de tool calling, function calling, agentes, visión, audio ni capacidades multilingües específicas en la información disponible.

## Casos de uso

- Resolución de problemas matemáticos de competición: el modelo puede generar soluciones paso a paso para problemas de nivel MATH, útil en entornos educativos o de investigación en razonamiento automático.
- Generación de datos sintéticos de razonamiento: al estar entrenado con RL sobre MATH-lighteval, puede emplearse para producir trazas de razonamiento etiquetadas que sirvan para destilar o entrenar otros modelos.
- Investigación en RL para LLMs: el checkpoint y su configuración completa permiten reproducir y analizar el efecto de GRPO con crédito de bucle en modelos pequeños, como base para experimentos comparativos.
- Evaluación de técnicas de consistencia en bucles: dado el uso de `loop_credit consistency`, sirve para estudiar cómo la consistencia entre iteraciones recurrentes afecta al rendimiento en tareas de razonamiento.
- Prototipado de asistentes matemáticos en local: con 1,4B parámetros, puede desplegarse en hardware consumer para pruebas de concepto de tutores matemáticos.
- Baseline para ajuste fino posterior: al ser un checkpoint intermedio de RL, puede usarse como punto de partida para SFT o DPO en dominios específicos de matemáticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; para un modelo de 1,4B parámetros en FP16 se estiman aproximadamente 2,8 GB de pesos, más overhead de activaciones y caché KV.
- GPU recomendadas: no disponible; por tamaño, cabría en GPUs consumer como RTX 3060 (12 GB), RTX 4070, RTX 4090, así como en A100/H100 para despliegues multi-instancia.
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU con 8 GB o más en cuantización de 8 bits, y en 4-6 GB en 4 bits (estimación no confirmada por el autor).
- Opciones de despliegue: el repositorio incluye código de modelado Ouro (`modeling_ouro.py`) que requiere `trust_remote_code=True` en Transformers; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI para este checkpoint concreto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Ouro-1.4B-Base-Math-Verl-RLTT (este) | 1,4B | No disponible (sugerido 32K) | Apache 2.0 | Hugging Face | Checkpoint RL experimental, sin benchmarks |
| ByteDance/Ouro-1.4B-Thinking | 1,4B | No disponible | Apache 2.0 | Hugging Face | Modelo base, con modo thinking |
| Qwen2.5-1.5B-Instruct | 1,5B | 32K | Apache 2.0 | Hugging Face | Modelo generalista con soporte multilingüe |
| DeepSeek-R1-Distill-Qwen-1.5B | 1,5B | 32K | MIT | Hugging Face | Destilado de razonamiento, benchmarks publicados |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al entrenarse sobre MATH-lighteval, puede heredar sesgos de ese dataset (predominio de problemas en inglés y de estilo de competición).
- Riesgo de alucinación: alto en dominios fuera de matemáticas, dado el ajuste específico y el tamaño reducido del modelo.
- Limitaciones de contexto o idioma: no se confirma la longitud de contexto ni los idiomas soportados; el dataset de entrenamiento es principalmente en inglés.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base Ouro-1.4B-Thinking debe verificarse por separado (también Apache 2.0 según los tags).
- Caveats para producción: es un checkpoint experimental de investigación (0 descargas, 0 likes, repositorio de 0 GB en el momento de la consulta), sin evaluación final publicada; no se recomienda su uso en producción sin una validación exhaustiva.
- El nombre del checkpoint incluye "cmp32k", lo que sugiere contexto de 32K, pero no hay confirmación oficial en la model card.
- Requiere `trust_remote_code=True` para cargar el código de modelado Ouro, lo que implica ejecutar código del autor.

## Enlaces

- Hugging Face: https://huggingface.co/hi-todayis-jh/ouro-1.4b-base-math-verl-rltt-native-cons-base-cmp32k-cfg3-168100-20261117
- Dataset de rollouts: https://huggingface.co/datasets/hi-todayis-jh/ouro-1.4b-base-math-verl-rltt-native-cons-base-cmp32k-cfg3-168100-20261117-rollouts
- Modelo base: https://huggingface.co/ByteDance/Ouro-1.4B-Thinking
- Dataset de entrenamiento: https://huggingface.co/datasets/DigitalLearningGmbH/MATH-lighteval
- Framework verl: https://github.com/volcengine/verl
- Proyecto W&B: https://wandb.ai/ouro-1.4b-grpo-rltt-math (proyecto `ouro-1.4b-grpo-rltt-math`, run `verl-rltt-native-cons-base-cmp32k-cfg3-168100-20261117`)
