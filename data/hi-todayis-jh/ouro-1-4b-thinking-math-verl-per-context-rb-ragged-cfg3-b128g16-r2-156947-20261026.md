# hi-todayis-jh/ouro-1.4b-thinking-math-verl-per-context-rb-ragged-cfg3-b128g16-r2-156947-20261026

## Resumen

Ouro-1.4B-Thinking-Math (checkpoint de verl) es un ajuste fino por aprendizaje por refuerzo del modelo ByteDance/Ouro-1.4B-Thinking, un modelo de lenguaje de tipo "looped" (con capas recurrentes compartidas) de 1.400 millones de parametros. El autor del checkpoint es el usuario de Hugging Face `hi-todayis-jh`, y el entrenamiento se realizo con la libreria verl 0.6.1 aplicando una receta GRPO sobre el dataset `compression_dataset_3200.jsonl`, derivado de DigitalLearningGmbH/MATH-lighteval. El objetivo es mejorar el razonamiento matematico del modelo base mediante RL con recompensas verificables.

El checkpoint no es un modelo nuevo desde cero: es un artefacto de investigacion que documenta un run concreto de entrenamiento (job Slurm 156947, nodo `orchard-flame-6`, 25 pasos de rollout). Incluye tanto los shards FSDP del actor y del optimizador como una version fusionada en safetensors cargable con `transformers`. Esto lo hace relevante para quien quiera reproducir o inspeccionar el efecto del RL sobre un modelo pequeno con atencion recurrente.

La relevancia practica es limitada como modelo de produccion (0 descargas, 0 likes, sin benchmarks publicados), pero es interesante como evidencia de que es posible aplicar GRPO con verl a arquitecturas no estandar como Ouro, y como punto de partida para experimentos de razonamiento matematico en modelos de ~1.4B parametros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con capas recurrentes compartidas (looped language model), segun el modelo base Ouro |
| Parametros totales | 1.4B (heredado del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el checkpoint se distribuye en safetensors y shards FSDP; no se documentan versiones GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (version fusionada en `global_step_N/actor/huggingface/`) y shards FSDP `.pt` (`actor/model_world_size_W_rank_R.pt`) |

## Arquitectura y entrenamiento

El modelo base ByteDance/Ouro-1.4B-Thinking emplea una arquitectura de "looped language model": un conjunto reducido de capas transformer que se reutilizan en varias iteraciones, lo que permite aumentar la profundidad efectiva sin incrementar proporcionalmente el numero de parametros. El checkpoint incluye el codigo de modelado parcheado (`modeling_ouro.py`, `configuration_ouro.py`) y un `policy_config.json` que define la politica de salida temprana (exit policy) del modelo.

El entrenamiento se realizo con verl 0.6.1 usando una receta GRPO (Group Relative Policy Optimization) con el algoritmo `per_context_rb`, modo `ragged`, 25 pasos de rollout, una sola epoca y learning rate 3e-6 con AdamW8bit. Se aplicaron opciones como `--no_gate_kl`, `--gate_reward_baseline loo`, `--gate_learning_rate 6e-4`, `--loss_agg_mode seq-mean-token-sum-norm` y `--vllm_async_scheduling` con `--ragged_kv_layout lanes`. El dataset de entrenamiento es `compression_dataset_3200.jsonl`, construido a partir de MATH-lighteval. No se documentan el numero total de tokens de entrenamiento ni la composicion completa del dataset mas alla de esa referencia.

## Capacidades

- Generacion de texto y razonamiento matematico, reforzado especificamente mediante RL sobre problemas de MATH-lighteval.
- Razonamiento multi-paso con modo "thinking" (heredado del modelo base Ouro-1.4B-Thinking).
- Politica de salida temprana configurable (`policy_config.json`), que permite adaptar el coste computacional al problema.
- Capacidad de ejecutarse con `trust_remote_code=True` en transformers, lo que permite integrarlo en pipelines habituales.
- Soporte de tool calling, agentes, vision o audio: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion en RL para razonamiento: el checkpoint sirve como referencia reproducible de un run GRPO con verl sobre una arquitectura looped, util para comparar recetas de entrenamiento.
- Experimentacion con modelos pequenos de matematicas: permite evaluar si el RL mejora el rendimiento de un modelo de 1.4B en problemas de MATH-lighteval frente al modelo base.
- Reproduccion de experimentos: al incluir `run_config.json`, `verl_config.yaml`, `launch_code/` y `training_source.tar.gz`, se puede reconstruir el pipeline de entrenamiento en un cluster con Slurm.
- Analisis de politicas de salida temprana: el `policy_config.json` permite estudiar el equilibrio entre coste y precision en inferencia adaptativa.
- Fine-tuning posterior: al estar en safetensors y ser compatible con transformers, se puede usar como punto de partida para SFT o DPO adicionales en dominios matematicos.
- Docencia y formacion: util como ejemplo didactico de un checkpoint verl completo con shards FSDP, estado del optimizador y rollouts asociados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 2.8 GB solo para pesos, mas overhead de KV cache y activaciones; en la practica, entre 6 y 10 GB segun longitud de contexto.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 1.5-2 GB para pesos; en 4 bits, alrededor de 0.8-1 GB.
- GPU recomendadas para entrenamiento (segun la configuracion del run): el job uso FSDP con `vllm_gpu_memory_utilization 0.45` y `vllm_kv_cache_memory_bytes 68719476736` (64 GiB de KV cache), lo que sugiere nodos con GPUs de gran memoria (A100/H100 80 GB) y multiples GPUs por nodo.
- GPU de consumo: cabe en RTX 3060 12 GB, RTX 4070, RTX 4090 y similares para inferencia en cuantizacion 8 o 4 bits.
- Opciones de despliegue: transformers con `trust_remote_code=True` (soporte nativo del checkpoint); vLLM (usado durante el entrenamiento); llama.cpp y Ollama requeririan conversion a GGUF, no documentada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Ouro-1.4B-Thinking-Math (este checkpoint) | 1.4B | no disponible | Apache 2.0 | Hugging Face, 0 descargas | Checkpoint de investigacion con RL GRPO |
| ByteDance/Ouro-1.4B-Thinking | 1.4B | no disponible | Apache 2.0 | Hugging Face (modelo base) | Modelo base sin RL especifico de matematicas |
| Qwen2.5-Math-1.5B | 1.5B | 32K (tipico en la familia Qwen2.5) | Apache 2.0 | Hugging Face | Modelo matematico dedicado, ampliamente evaluado |
| DeepSeek-R1-Distill-Qwen-1.5B | 1.5B | 32K (tipico) | MIT | Hugging Face | Destilado de razonamiento, con benchmarks publicados |

La comparacion es orientativa: no hay datos de rendimiento publicados para este checkpoint, por lo que no se puede afirmar que supere a las alternativas.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay evidencia de que el RL haya mejorado el rendimiento respecto al modelo base.
- Checkpoint de investigacion con 0 descargas y 0 likes: no ha sido validado por la comunidad.
- El modelo base es de 1.4B parametros, por lo que su capacidad de razonamiento matematico complejo es limitada en comparacion con modelos de mayor tamano.
- Riesgo de alucinacion en problemas matematicos: el RL sobre MATH-lighteval puede sobreajustar al formato del dataset y degradar el rendimiento fuera de distribucion.
- Idiomas soportados no documentados: no se garantiza un rendimiento adecuado en castellano.
- Longitud de contexto no documentada: no se puede planificar su uso en tareas de contexto largo.
- Requiere `trust_remote_code=True` para cargar el codigo de modelado parcheado, lo que implica ejecutar codigo del autor del checkpoint.
- El repo ocupa 72 GB por incluir shards FSDP y estado del optimizador; la descarga completa no es necesaria si solo se usa la version fusionada en safetensors.
- Licencia Apache 2.0 permite uso comercial, pero la falta de evaluacion hace recomendable una validacion propia antes de cualquier despliegue en produccion.

## Enlaces

- Checkpoint en Hugging Face: https://huggingface.co/hi-todayis-jh/ouro-1.4b-thinking-math-verl-per-context-rb-ragged-cfg3-b128g16-r2-156947-20261026
- Modelo base: https://huggingface.co/ByteDance/Ouro-1.4B-Thinking
- Dataset de rollouts: https://huggingface.co/datasets/hi-todayis-jh/ouro-1.4b-thinking-math-verl-per-context-rb-ragged-cfg3-b128g16-r2-156947-20261026-rollouts
- Dataset de entrenamiento: https://huggingface.co/datasets/DigitalLearningGmbH/MATH-lighteval
- Libreria verl: https://github.com/volcengine/verl
- Proyecto W&B: `ouro-1.4b-grpo-rltt-math`, run `verl-per_context_rb-ragged-cfg3-b128g16-r2-156947-20261026` (no se proporciona URL directa)
