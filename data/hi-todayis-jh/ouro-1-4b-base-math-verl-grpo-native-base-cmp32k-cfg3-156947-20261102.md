# hi-todayis-jh/ouro-1.4b-base-math-verl-grpo-native-base-cmp32k-cfg3-156947-20261102

## Resumen

Ouro-1.4B-Base-Math-Verl-GRPO es un checkpoint de ajuste fino por refuerzo (RL) del modelo ByteDance/Ouro-1.4B-Thinking, un modelo de lenguaje "looped" (con bucle de capas recurrentes) de 1.400 millones de parámetros desarrollado originalmente por ByteDance. Este checkpoint concreto lo publica el usuario hi-todayis-jh y resulta del entrenamiento con el algoritmo GRPO (Group Relative Policy Optimization) sobre el dataset de matemáticas compression_dataset_3200.jsonl, derivado de DigitalLearningGmbH/MATH-lighteval, usando la infraestructura verl 0.6.1 con el modo "native" y una receta de entrenamiento documentada paso a paso.

El modelo resuelve el problema de mejorar el razonamiento matemático de un modelo base pequeño mediante RL con recompensas verificables, manteniendo la arquitectura looped del original (que reutiliza bloques de capas para aumentar la profundidad efectiva sin incrementar el número de parámetros). Es relevante ahora porque demuestra un flujo reproducible de RL a escala reducida (1,4B) con checkpoints completos de FSDP, configuración de verl y rollouts publicados, lo que facilita la investigación en RL para matemáticas sin necesidad de clústeres masivos.

El contexto de entrenamiento se fija en 32.000 tokens (cmp32k) y la política de salida del modelo looped se configura con cfg3. El repositorio tiene un tamaño de 0,0 GB, lo que sugiere que los pesos no están subidos o son de acceso restringido en el momento de la consulta; la model card describe el formato de los checkpoints pero no incluye métricas de rendimiento finales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer "looped" (Ouro), con reutilización de bloques de capas y política de salida configurable (exit policy cfg3) |
| Parametros totales | 1.400 millones (1.4B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.000 tokens (configuración de entrenamiento cmp32k) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (en `global_step_N/actor/huggingface/`), además de shards FSDP `.pt` para reanudar entrenamiento |

## Arquitectura y entrenamiento

La arquitectura base es Ouro, un modelo de lenguaje "looped" de ByteDance en el que un conjunto reducido de bloques transformer se aplica de forma recurrente para aumentar la profundidad efectiva sin multiplicar los parámetros. El checkpoint incluye el código de modelado parcheado (`modeling_ouro.py`, `configuration_ouro.py`) y un `policy_config.json` con la política de salida, lo que permite cargarlo con `trust_remote_code=True`. La variante Thinking del modelo base incorpora un modo de razonamiento extendido.

El entrenamiento se realizó con verl 0.6.1 y el algoritmo GRPO en modo "native", durante 100 pasos de rollout y 1 época, sobre `compression_dataset_3200.jsonl` (derivado de MATH-lighteval). Los hiperparámetros documentados incluyen learning rate 1e-6, beta 0.001 (coeficiente KL), optimizador AdamW8bit con betas (0.9, 0.99), weight decay 0.1, warmup ratio 0.1, max_grad_norm 1.0, `ppo_micro_batch_size_per_gpu` 1, `loss_agg_mode seq-mean-token-sum-norm` y `--l1_mode none --length_penalty_alpha 0`. La generación durante el entrenamiento usó vLLM con `gpu_memory_utilization` 0.45, 64 GiB de caché KV y planificación asíncrona. La política de salida se fijó con `--exit_mode fixed --cache_rule full_depth` y configuración cfg3. El job se ejecutó en Slurm (job 156947, nodo orchard-flame-7) y las métricas se registraron en el proyecto W&B `ouro-1.4b-grpo-rltt-math`.

## Capacidades

- Generación de texto y razonamiento matemático, reforzado específicamente mediante GRPO sobre problemas de MATH-lighteval.
- Razonamiento multi-paso con modo "thinking" heredado del modelo base ByteDance/Ouro-1.4B-Thinking.
- Ejecución de cadenas de razonamiento largas gracias al contexto de 32.000 tokens configurado en el entrenamiento.
- Capacidad de reanudar entrenamiento desde checkpoints FSDP completos (actor, optimizador, RNG y dataloader).
- Carga directa en Hugging Face Transformers con `trust_remote_code=True` desde el subdirectorio fusionado.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponibles (modelo de texto).

## Casos de uso

- Investigación en RL para matemáticas: el checkpoint permite reproducir y extender el experimento GRPO con verl sobre un modelo de 1,4B, partiendo de los hiperparámetros y la configuración exactos documentados en `run_config.json` y `verl_config.yaml`.
- Evaluación de recetas de RL: sirve para comparar el efecto de GRPO con beta 0.001 y learning rate 1e-6 frente a otras configuraciones sobre el mismo dataset MATH-lighteval, gracias a los rollouts publicados como dataset separado.
- Generación de soluciones matemáticas paso a paso: el modelo puede emplearse para producir razonamientos detallados en problemas de competición, aprovechando su contexto de 32.000 tokens para problemas con enunciados largos.
- Destilación y generación de datos sintéticos: los rollouts y el modelo ajustado permiten generar trazas de razonamiento matemático para entrenar modelos menores o filtrar datos de alta calidad.
- Estudio de modelos looped: al incluir el código de modelado parcheado y la política de salida cfg3, es útil para investigar el comportamiento de la profundidad efectiva recurrente en tareas de razonamiento.
- Reproducibilidad de pipelines de entrenamiento: los manifiestos, el código de lanzamiento y los receipts de verificación permiten auditar y replicar el flujo completo en un clúster Slurm con verl.
- Fine-tuning posterior: el formato de checkpoint FSDP con estado del optimizador facilita continuar el entrenamiento con más pasos o con un dataset distinto sin reiniciar desde el modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 1,4B parámetros, en FP16 se requieren aproximadamente 2,8 GB solo para pesos, más caché KV; en cuantización de 8 bits bajaría a unos 1,4 GB y en 4 bits a unos 0,7 GB (estimaciones teóricas, no verificadas en la información disponible).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para FP16 en contexto corto; para el contexto completo de 32.000 tokens se necesita más memoria por la caché KV.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080 y RTX 4090, siempre que se use una cuantización adecuada o se limite el contexto.
- Opciones de despliegue: Transformers con `trust_remote_code=True` (soporte nativo del código Ouro); vLLM se usó durante el entrenamiento con `gpu_memory_utilization` 0.45 y 64 GiB de caché KV; compatibilidad con llama.cpp, Ollama o TGI no está confirmada en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Ouro-1.4B-Base-Math-Verl-GRPO (este) | 1,4B | 32.000 tokens (entrenamiento) | apache-2.0 | Hugging Face (repo de 0,0 GB en la consulta) |
| ByteDance/Ouro-1.4B-Thinking (base) | 1,4B | no disponible en la información proporcionada | no disponible en la información proporcionada | Hugging Face |
| Modelos matemáticos de ~1-2B comparables | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- El repositorio muestra un tamaño de 0,0 GB y cero descargas, por lo que los pesos podrían no estar disponibles públicamente o estar en proceso de subida; verificar antes de usarlo en producción.
- El ajuste se limita a matemáticas (MATH-lighteval) con solo 100 pasos de rollout y 1 época, lo que puede provocar sobreajuste al dominio y degradación en otras tareas.
- Riesgo de alucinación inherente a modelos de 1,4B, especialmente en razonamientos largos donde la coherencia puede romperse.
- Idiomas soportados no documentados; el entrenamiento se realizó presumiblemente en inglés, por lo que el rendimiento en castellano no está garantizado.
- La licencia apache-2.0 permite uso comercial, pero el modelo base Ouro-1.4B-Thinking tiene su propia licencia que debe verificarse por separado.
- Requiere `trust_remote_code=True` para cargar el código Ouro, lo que implica ejecutar código del repositorio; auditar antes de desplegar.
- La política de salida cfg3 y el modo looped pueden complicar la integración con herramientas estándar (vLLM, TGI) que no soporten esta arquitectura sin parches.
- No hay benchmarks publicados que respalden mejoras frente al modelo base; el beneficio del RL no está cuantificado en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hi-todayis-jh/ouro-1.4b-base-math-verl-grpo-native-base-cmp32k-cfg3-156947-20261102
- Modelo base: https://huggingface.co/ByteDance/Ouro-1.4B-Thinking
- Dataset de rollouts: https://huggingface.co/datasets/hi-todayis-jh/ouro-1.4b-base-math-verl-grpo-native-base-cmp32k-cfg3-156947-20261102-rollouts
- Dataset de entrenamiento: https://huggingface.co/datasets/DigitalLearningGmbH/MATH-lighteval
- Repositorio de verl: https://github.com/volcengine/verl
- Proyecto W&B: https://wandb.ai/ouro-1.4b-grpo-rltt-math (proyecto `ouro-1.4b-grpo-rltt-math`, run `verl-grpo-native-base-cmp32k-cfg3-156947-20261102`)
