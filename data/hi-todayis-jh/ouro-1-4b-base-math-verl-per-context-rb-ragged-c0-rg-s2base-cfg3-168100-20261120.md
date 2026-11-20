# hi-todayis-jh/ouro-1.4b-base-math-verl-per-context-rb-ragged-c0-rg-s2base-cfg3-168100-20261120

## Resumen

Ouro-1.4B-Base-Math (verl-per-context-rb-ragged-c0-rg-s2base-cfg3-168100-20261120) es un checkpoint de investigación publicado por el usuario `hi-todayis-jh` en Hugging Face. Se trata de un ajuste fino por refuerzo (RL) del modelo `ByteDance/Ouro-1.4B-Thinking`, un transformer con arquitectura "looped" (reutilización iterativa de capas) de 1.400 millones de parámetros, entrenado con la receta GRPO implementada en verl 0.6.1 sobre el dataset matemático `DigitalLearningGmbH/MATH-lighteval` (empaquetado en `compression_dataset_3200.jsonl`).

El objetivo del experimento es explorar el aprendizaje por refuerzo con recompensas basadas en corrección matemática, incorporando variantes específicas del trainer: algoritmo `per_context_rb` con layout de KV en modo `ragged`, política de salida adaptativa (`--exit_mode adaptive`, `--min_depth 2`) y control del número de iteraciones del bucle de capas. Es, por tanto, un artefacto de investigación más que un modelo listo para producción: el propio repositorio incluye los shards FSDP, el estado del optimizador, el código de lanzamiento y los registros de entrenamiento, además del modelo fusionado en formato Hugging Face.

Su relevancia radica en dos frentes: por un lado, demuestra un flujo completo de RL con verl sobre modelos "looped" (una familia poco explorada frente a los transformers densos convencionales); por otro, publica de forma transparente todos los artefactos de reproducibilidad (manifiestos, configuraciones resueltas, recibos de verificación de ficheros), lo que facilita la auditoría del experimento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer "looped" (reutilización iterativa de capas), código `modeling_ouro.py` con `trust_remote_code` |
| Parametros totales | 1.4B (heredados del modelo base `ByteDance/Ouro-1.4B-Thinking`) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan cuantizaciones GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (modelo fusionado en `global_step_N/actor/huggingface/`), además de shards FSDP `.pt` del actor y del optimizador |

## Arquitectura y entrenamiento

El modelo parte de `ByteDance/Ouro-1.4B-Thinking`, un transformer de 1.4B parámetros con arquitectura "looped": en lugar de apilar capas distintas, reutiliza un bloque de capas varias veces, lo que permite aumentar la profundidad efectiva sin incrementar proporcionalmente el número de parámetros. Sobre esa base, el experimento aplica un ajuste fino por refuerzo con verl 0.6.1 y receta GRPO, con una política de salida adaptativa (`--exit_mode adaptive`, `--min_depth 2`) que decide cuántas iteraciones del bucle ejecutar por token o por secuencia. El layout de KV en modo `ragged` (`--ragged_kv_layout lanes`, `--cache_rule ragged`) sugiere una gestión de caché orientada a secuencias de longitud variable, habitual en entrenamiento con rollouts de longitudes heterogéneas.

Los hiperparámetros documentados incluyen: `learning_rate 1e-6`, `beta 0.001` (coeficiente KL), `max_grad_norm 1.0`, `optimizer AdamW8bit` con `betas 0.9 0.99`, `weight_decay 0.1`, `warmup_ratio 0.1`, `ppo_micro_batch_size_per_gpu 1`, `num_train_epochs 1`, `loss_agg_mode seq-mean-token-sum-norm`, `cost_gradient score`, `gate_shift_sigma 0.5`, `gate_bias_lr 0.1` y `gate_exploration rollout`. El entrenamiento se ejecutó durante 100 pasos de rollout en un job de Slurm (168100) sobre el nodo `orchard-flame-8`, con vLLM configurado a `gpu_memory_utilization 0.45` y una caché KV de 68.719.476.736 bytes (64 GiB). El dataset de entrenamiento es `DigitalLearningGmbH/MATH-lighteval`, centrado en problemas matemáticos de competición.

## Capacidades

- Generación de texto y razonamiento matemático: el ajuste RL se realizó sobre problemas de MATH-lighteval, por lo que la competencia reforzada es la resolución de problemas matemáticos de nivel escolar y competición.
- Modo "thinking" heredado del modelo base (`Ouro-1.4B-Thinking`), con razonamiento explícito antes de la respuesta.
- Razonamiento multi-paso: la arquitectura "looped" con política de salida adaptativa permite profundidad de cómputo variable según la dificultad de la entrada.
- Generación de código y tool calling: no documentado en la información disponible.
- Capacidades multilingües: no documentadas.
- Visión, audio u otras modalidades: no disponibles.

## Casos de uso

- Investigación en RL para modelos "looped": el checkpoint sirve como punto de partida para reproducir o extender la receta GRPO de verl sobre arquitecturas con reutilización de capas, con todos los artefactos de entrenamiento publicados.
- Evaluación de políticas de salida adaptativas: al incluir `policy_config.json` con la política de salida, permite estudiar el equilibrio entre profundidad de cómputo y calidad de respuesta en modelos looped.
- Ajuste fino posterior sobre dominios matemáticos: el checkpoint fusionado en safetensors puede recargarse con `transformers` y servir de base para SFT o DPO adicionales.
- Reproducibilidad de experimentos: los manifiestos, configuraciones resueltas y recibos de verificación permiten auditar el pipeline completo de entrenamiento en un clúster Slurm.
- Generación de soluciones matemáticas paso a paso en entornos de investigación educativa, siempre con validación humana.
- Estudio de estabilidad del entrenamiento RL: los logs de W&B (`ouro-1.4b-grpo-rltt-math`) y las métricas del job permiten analizar curvas de recompensa y colapso de política.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa para un transformer denso de 1.4B parámetros: ~3 GB en FP16, ~1,5 GB en cuantización de 8 bits y ~1 GB en 4 bits (estimación, no verificada para esta arquitectura looped).
- GPU recomendadas: no documentadas por el autor. Por tamaño, cabría en GPUs de consumo como RTX 3060/4060/4090 en FP16 o cuantizado; el entrenamiento se ejecutó en un nodo de clúster con vLLM.
- Cabe en GPU de consumo: probablemente sí, aunque no está verificado para el código `modeling_ouro.py` con `trust_remote_code`.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (documentado por el autor); vLLM aparece en el pipeline de entrenamiento pero no se documenta su uso para servir este checkpoint.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este checkpoint (Ouro-1.4B-Base-Math RL) | 1.4B | no disponible | Apache 2.0 | Hugging Face, 0 descargas | Checkpoint de investigación RL con artefactos completos |
| ByteDance/Ouro-1.4B-Thinking | 1.4B | no disponible | no disponible en la información | Hugging Face (modelo base) | Modelo base "looped" con modo thinking |
| Qwen2.5-1.5B-Instruct | 1.5B | 32.768 tokens | Apache 2.0 | Hugging Face, ampliamente desplegado | Transformer denso convencional, instrucciones |
| DeepSeek-R1-Distill-Qwen-1.5B | 1.5B | 32.768 tokens | MIT | Hugging Face, muy popular | Destilado de razonamiento matemático |

La comparación con Qwen2.5-1.5B y DeepSeek-R1-Distill-Qwen-1.5B es orientativa por tamaño; no se dispone de benchmarks de este checkpoint que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Es un checkpoint de investigación con 0 descargas y 0 likes: no ha pasado por una validación comunitaria ni por evaluaciones publicadas.
- El ajuste RL se realizó sobre un único dataset matemático (`MATH-lighteval` empaquetado en `compression_dataset_3200.jsonl`); es previsible un sobreajuste al dominio y una degradación en tareas generales.
- Solo 100 pasos de rollout y 1 época: el entrenamiento es corto y puede no haber convergido.
- Riesgo de alucinación en razonamiento matemático: el RL con recompensa de corrección no elimina errores de cómputo ni de planteamiento.
- Idiomas soportados no documentados; el modelo base está orientado presumiblemente al inglés.
- Requiere `trust_remote_code=True` para cargar el código `modeling_ouro.py`, lo que implica ejecutar código del repositorio.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base `ByteDance/Ouro-1.4B-Thinking` debe verificarse por separado para confirmar compatibilidad.
- El repositorio incluye shards FSDP y estado del optimizador de gran tamaño; el tamaño reportado de 0.0 GB sugiere que los pesos pueden no estar completamente subidos o que la medición es incompleta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hi-todayis-jh/ouro-1.4b-base-math-verl-per-context-rb-ragged-c0-rg-s2base-cfg3-168100-20261120
- Dataset de rollouts: https://huggingface.co/datasets/hi-todayis-jh/ouro-1.4b-base-math-verl-per-context-rb-ragged-c0-rg-s2base-cfg3-168100-20261120-rollouts
- Modelo base: https://huggingface.co/ByteDance/Ouro-1.4B-Thinking
- Dataset de entrenamiento: https://huggingface.co/datasets/DigitalLearningGmbH/MATH-lighteval
- Framework verl: https://github.com/volcengine/verl
- Proyecto W&B: `ouro-1.4b-grpo-rltt-math` (run `verl-per_context_rb-ragged-c0-rg-s2base-cfg3-168100-20261120`)
