# hi-todayis-jh/ouro-1.4b-thinking-math-verl-grpo-ragged-sampled-cmp32k-cfg3-156947-20261028

## Resumen

Ouro-1.4B-Thinking-Math (verl-grpo-ragged-sampled-cmp32k-cfg3-156947-20261028) es un ajuste fino mediante aprendizaje por refuerzo del modelo base ByteDance/Ouro-1.4B-Thinking, un modelo de lenguaje de tipo "looped" (con capas recurrentes en profundidad) de 1.400 millones de parámetros. El autor del checkpoint es el usuario de Hugging Face hi-todayis-jh, que ha aplicado la receta GRPO (Group Relative Policy Optimization) implementada en la librería verl 0.6.1 sobre el conjunto de datos de compresión `compression_dataset_3200.jsonl`, derivado a su vez de DigitalLearningGmbH/MATH-lighteval.

El objetivo del entrenamiento es reforzar las capacidades de razonamiento matemático del modelo base mediante RL, usando un modo de muestreo "ragged" y una política de salida adaptativa que permite al modelo decidir dinámicamente cuándo detener el razonamiento (exit policy). El checkpoint resultante es un artefacto de investigación: incluye los pesos fusionados en formato Hugging Face, el código de modelado parcheado, los shards FSDP del optimizador y los registros completos de entrenamiento, lo que lo convierte en un recurso reproducible para estudiar RL sobre modelos pequeños con razonamiento extendido.

Es relevante ahora porque documenta de forma exhaustiva un pipeline moderno de RL para matemáticas sobre un modelo de 1.4B con arquitectura no convencional (looped), y porque publica los rollouts y las métricas de W&B junto con los pesos, algo poco habitual en checkpoints de investigación de este tamaño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer "looped" (Ouro, capas recurrentes en profundidad) con política de salida adaptativa |
| Parametros totales | 1.4B (según nombre del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el nombre del run menciona "cmp32k", lo que sugiere 32k en el dataset de entrenamiento, pero no se confirma como contexto del modelo) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (carpeta `global_step_N/actor/huggingface/`), más shards FSDP `.pt` del optimizador y estado de entrenamiento |

## Arquitectura y entrenamiento

El modelo base es ByteDance/Ouro-1.4B-Thinking, un modelo de lenguaje de tipo "looped" en el que un bloque transformer se reutiliza varias veces en profundidad, aumentando la capacidad efectiva de cómputo sin incrementar el número de parámetros. Sobre esta arquitectura se aplica una política de salida adaptativa (`policy_config.json` con la exit policy) que permite al modelo decidir en qué iteración de bucle detener el razonamiento, controlando así el coste computacional por token generado.

El ajuste se realiza con verl 0.6.1 usando GRPO, con los siguientes hiperparámetros documentados en la model card: `learning_rate 1e-6`, `beta 0.001` (coeficiente KL), `optimizer AdamW8bit`, `adam_betas 0.9 0.99`, `weight_decay 0.1`, `warmup_ratio 0.1`, `ppo_micro_batch_size_per_gpu 1`, `num_train_epochs 1`, `max_grad_norm 1.0` y `loss_agg_mode seq-mean-token-sum-norm`. Se desactiva el gate KL (`--no_gate_kl`) y se usa un gate learning rate de `2e-4`. El modo de muestreo es "ragged" con layout de KV cache por "lanes", `min_depth 2` y política de salida adaptativa. El entrenamiento se ejecutó en un job de Slurm (156947) en el nodo `orchard-flame-7`, con 100 pasos de rollout y vLLM configurado con `gpu_memory_utilization 0.45` y `kv_cache_memory_bytes 68719476736` (64 GiB). El dataset de entrenamiento es `compression_dataset_3200.jsonl` (3.200 ejemplos), derivado de MATH-lighteval.

## Capacidades

- Generación de texto y razonamiento matemático con cadena de pensamiento (thinking mode), heredado del modelo base Ouro-1.4B-Thinking y reforzado mediante GRPO sobre MATH-lighteval.
- Razonamiento multi-paso con parada adaptativa: el modelo decide dinámicamente cuándo terminar el bucle de razonamiento según la exit policy entrenada.
- Resolución de problemas matemáticos de competición (nivel MATH), que es el dominio objetivo del ajuste.
- No se documenta soporte de tool calling ni function calling en la información proporcionada.
- No se documenta soporte de agentes ni de visión/audio.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Capacidad de reutilización de cómputo en profundidad (looped), lo que permite mayor profundidad efectiva con menor número de parámetros.

## Casos de uso

- Investigación en RL para matemáticas: el checkpoint incluye el estado completo del entrenamiento (shards FSDP, optimizador, RNG, dataloader) y los rollouts, lo que permite reanudar, reproducir o auditar el pipeline GRPO de verl sobre un modelo de 1.4B.
- Estudio de arquitecturas looped: al publicarse el `modeling_ouro.py` parcheado y el `config.json`, se puede analizar cómo interactúa la política de salida adaptativa con el bucle de profundidad y comparar con el modelo base.
- Evaluación de recetas GRPO: los hiperparámetros documentados (`beta 0.001`, `lr 1e-6`, `loss_agg_mode seq-mean-token-sum-norm`, muestreo ragged) sirven como referencia reproducible para experimentos de RL a pequeña escala.
- Generación de soluciones matemáticas paso a paso en entornos de investigación: el modelo puede usarse para producir cadenas de razonamiento sobre problemas de nivel MATH, con la ventaja del thinking mode y la parada adaptativa para controlar la longitud.
- Análisis de eficiencia de decodificación: el checkpoint permite medir el ahorro de cómputo que aporta la exit policy frente a un razonamiento de profundidad fija, útil para estudiar trade-offs latencia/calidad en modelos pequeños.
- Benchmarking de modelos de 1.4B en matemáticas: sirve como punto de comparación frente a modelos densos del mismo tamaño entrenados con SFT o RL, especialmente en tareas de razonamiento con contexto largo (hasta 32k en el dataset de entrenamiento).
- Reproducibilidad de pipelines verl: el `run_manifest.json`, `run_config.json`, `verl_config.yaml` y `launch_code/` permiten replicar el entorno exacto del job de Slurm en otros clústeres.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente referencia el proyecto de W&B `ouro-1.4b-grpo-rltt-math` (run `verl-grpo-ragged-sampled-cmp32k-cfg3-156947-20261028`) como fuente de métricas de entrenamiento, pero no se incluyen valores numéricos de MMLU, GSM8K, MATH ni HumanEval en el material proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 2,8 GB solo para pesos (1.4B × 2 bytes), más overhead de activaciones y KV cache; en la práctica, entre 4 y 6 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: alrededor de 1,4 GB para pesos; en 4 bits, unos 0,7 GB (no se publican cuantizaciones oficiales, habría que generarlas).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para fp16 en contextos cortos; A100/H100 no son necesarias para inferencia, pero sí útiles para reentrenar o reanudar el checkpoint (el entrenamiento usó FSDP con shards y vLLM con 64 GiB de KV cache, lo que indica un nodo multi-GPU).
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 y similares, en fp16 o cuantizado.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (requerido por el código Ouro), vLLM (usado en el entrenamiento), y potencialmente llama.cpp/Ollama si se generan cuantizaciones GGUF, aunque no se documentan.
- Latencia y throughput: no disponibles en la información proporcionada; dependen fuertemente de la profundidad de bucle efectiva que decida la exit policy en cada token.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Ouro-1.4B-Thinking-Math (este checkpoint) | 1.4B | no disponible (dataset a 32k) | Apache-2.0 | Hugging Face, con estado completo de entrenamiento | Ajuste GRPO sobre MATH-lighteval, arquitectura looped con exit policy |
| ByteDance/Ouro-1.4B-Thinking (base) | 1.4B | no disponible | Apache-2.0 (según base) | Hugging Face | Modelo base sin el ajuste GRPO de este run |
| Qwen2.5-1.5B-Instruct | 1.5B | 32k | Apache-2.0 | Hugging Face, amplia adopción | Modelo denso convencional, sin bucle en profundidad |
| DeepSeek-R1-Distill-Qwen-1.5B | 1.5B | 32k | MIT (según variante) | Hugging Face | Destilado de razonamiento, referencia habitual en 1.5B para matemáticas |

La comparación directa de rendimiento no es posible porque este checkpoint no publica resultados de benchmarks. La principal diferencia frente a las alternativas es arquitectónica (looped con parada adaptativa) y de propósito (artefacto de investigación reproducible más que modelo listo para producción).

## Limitaciones y advertencias

- Es un checkpoint de investigación: el nombre del run incluye parámetros experimentales (`ragged`, `cfg3`, `cmp32k`) y el autor no documenta evaluación de calidad fuera del conjunto de entrenamiento.
- Riesgo de sobreajuste al dataset de entrenamiento: solo 3.200 ejemplos de MATH-lighteval y una época (`num_train_epochs 1`), lo que puede degradar el rendimiento en dominios ajenos a matemáticas.
- Riesgo de alucinación: inherente a los modelos de 1.4B con razonamiento extendido; la cadena de pensamiento puede contener pasos incorrectos que conduzcan a respuestas erróneas con alta confianza.
- Sesgos conocidos: no documentados en la información proporcionada; el modelo base puede arrastrar sesgos de su corpus de preentrenamiento.
- Idiomas soportados: no disponibles; el ajuste se ha hecho sobre un dataset en inglés (MATH-lighteval), por lo que el rendimiento en castellano u otros idiomas no está garantizado.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero al derivar de ByteDance/Ouro-1.4B-Thinking conviene verificar la licencia y condiciones del modelo base antes de un despliegue comercial.
- Requiere `trust_remote_code=True` por el código de modelado Ouro personalizado, lo que implica ejecutar código del repositorio; auditar `model_code/` antes de usarlo en producción.
- El repositorio pesa 57,6 GB por incluir shards FSDP y estado del optimizador; la descarga completa no es necesaria si solo se quiere inferencia (basta con `actor/huggingface/`).
- Sin métricas publicadas de latencia ni throughput; el comportamiento de la exit policy en producción no está caracterizado.
- El checkpoint tiene 0 descargas y 0 likes, sin validación comunitaria; tratarlo como material experimental.

## Enlaces

- Hugging Face del modelo: https://huggingface.co/hi-todayis-jh/ouro-1.4b-thinking-math-verl-grpo-ragged-sampled-cmp32k-cfg3-156947-20261028
- Dataset de rollouts: https://huggingface.co/datasets/hi-todayis-jh/ouro-1.4b-thinking-math-verl-grpo-ragged-sampled-cmp32k-cfg3-156947-20261028-rollouts
- Modelo base: https://huggingface.co/ByteDance/Ouro-1.4B-Thinking
- Dataset de entrenamiento: https://huggingface.co/datasets/DigitalLearningGmbH/MATH-lighteval
- Librería verl: https://github.com/volcengine/verl
- Proyecto W&B (referenciado en la model card): `ouro-1.4b-grpo-rltt-math`, run `verl-grpo-ragged-sampled-cmp32k-cfg3-156947-20261028` (no se proporciona URL directa)
