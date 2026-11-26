# hi-todayis-jh/ouro-1.4b-base-math-verl-grpo-native-ep2-s2base-cfg3-168100-20261126

## Resumen

Ouro-1.4B-Base-Math-Verl-GRPO es un checkpoint de investigación publicado por el usuario hi-todayis-jh, resultado de aplicar entrenamiento por refuerzo con el algoritmo GRPO (Group Relative Policy Optimization) sobre el modelo base ByteDance/Ouro-1.4B-Thinking. El modelo parte de la familia Ouro, una arquitectura de lenguaje con bucles (looped language model) que reutiliza capas de transformador de forma iterativa, y se ha afinado específicamente para tareas de razonamiento matemático usando el dataset DigitalLearningGmbH/MATH-lighteval.

El entrenamiento se realizó con la librería verl 0.6.1 mediante su extensión verl_trainer, en modo nativo, con 100 pasos de rollout y un único epoch sobre un fichero de 3200 ejemplos (compression_dataset_3200.jsonl). Los hiperparámetros incluyen una tasa de aprendizaje de 1e-6, coeficiente beta de 0.001 para la penalización KL, optimizador AdamW8bit y agregación de pérdida seq-mean-token-sum-norm, sobre un job de Slurm (168100) en el nodo orchard-flame-1.

Se trata de un artefacto experimental con cero descargas y cero likes en el momento de la consulta, sin resultados de benchmarks publicados ni model card con métricas de evaluación. Su interés es fundamentalmente metodológico: documenta de forma exhaustiva el proceso de entrenamiento RL (configuración, código, rollouts, recibos de verificación) sobre un modelo pequeño con arquitectura no convencional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Looped language model (Ouro), transformer con reutilización iterativa de capas |
| Parametros totales | 1.4B (heredado del modelo base ByteDance/Ouro-1.4B-Thinking) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; cuantizaciones GGUF no publicadas) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (checkpoint fusionado en `actor/huggingface/`) y shards FSDP `.pt` |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Ouro de ByteDance, un transformer con bucle (looped) en el que las capas se aplican repetidamente antes de producir la salida, con una política de salida configurable. El checkpoint incluye el código de modelado parcheado (`modeling_ouro.py`, `configuration_ouro.py`) y un `policy_config.json` con la política de salida utilizada durante el entrenamiento. El entrenamiento RL se ejecutó con verl 0.6.1 en modo `native`, con 100 pasos de rollout, un epoch, `--exit_mode fixed` y `--cache_rule full_depth`, y una asignación de memoria vLLM de 0.45 con 64 GiB de caché KV.

El dataset de entrenamiento es `compression_dataset_3200.jsonl` (3200 ejemplos), con evaluación asociada al dataset MATH-lighteval. Los hiperparámetros documentados son: learning rate 1e-6, beta 0.001, max_grad_norm 1.0, AdamW8bit con betas (0.9, 0.99), weight decay 0.1, warmup ratio 0.1, ppo_micro_batch_size_per_gpu 1 y agregación de pérdida seq-mean-token-sum-norm. No se especifica el número total de tokens de entrenamiento ni la composición completa del dataset más allá del fichero de 3200 ejemplos.

## Capacidades

- Generación de texto y razonamiento matemático, orientado por el entrenamiento GRPO sobre MATH-lighteval.
- Razonamiento en modo "thinking" heredado del modelo base Ouro-1.4B-Thinking.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado explícitamente; el modo thinking del base sugiere capacidad de cadena de razonamiento, pero no hay confirmación en la model card.
- Capacidades multilingües: no disponibles.
- Capacidades especiales: checkpoint con política de salida fija (`exit_mode fixed`) y caché de profundidad completa (`cache_rule full_depth`), propias del esquema de bucle de Ouro.

## Casos de uso

- Investigación en RL para matemáticas: reproducir o analizar el pipeline GRPO con verl sobre un modelo de 1.4B con arquitectura looped, usando los ficheros `run_config.json`, `verl_config.yaml` y `training_source.tar.gz` incluidos en el repo.
- Estudio de recetas de entrenamiento: comparar hiperparámetros (beta, learning rate, agregación de pérdida) y su efecto en el rendimiento matemático frente a otros checkpoints de la misma serie.
- Fine-tuning posterior: partir del checkpoint fusionado en `actor/huggingface/` con `trust_remote_code=True` para continuar el entrenamiento o adaptarlo a otro dominio matemático.
- Evaluación de arquitecturas looped: medir el impacto del bucle de capas en tareas de razonamiento matemático frente a transformers convencionales del mismo tamaño.
- Generación de soluciones matemáticas paso a paso en entornos de investigación, aprovechando el modo thinking del modelo base.
- Análisis de rollouts: el dataset de rollouts asociado (`...-rollouts`) permite estudiar el comportamiento del modelo durante el entrenamiento RL y depurar recompensas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 1.4B parámetros, en fp16 se requieren aproximadamente 2.8 GB de pesos; en cuantización de 8 bits, unos 1.4 GB; en 4 bits, unos 0.7 GB (estimación teórica, no confirmada por el autor).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para fp16; RTX 3060/4060, RTX 4090, A100 o H100 para entrenamiento o inferencia a mayor throughput.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060 12 GB o superiores en fp16; en 4 bits podría caber en GPUs de 4-6 GB.
- Opciones de despliegue: transformers con `trust_remote_code=True` (formato documentado); vLLM se usó durante el entrenamiento (vLLM 0.45 de utilización de memoria GPU); llama.cpp/Ollama no documentados para este checkpoint.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Ouro-1.4B-Base-Math-Verl-GRPO (este) | 1.4B | no disponible | apache-2.0 | Hugging Face, 0 descargas | Checkpoint RL experimental, sin benchmarks |
| ByteDance/Ouro-1.4B-Thinking | 1.4B | no disponible | no disponible en la información | Hugging Face | Modelo base, con modo thinking |
| Qwen2.5-1.5B-Instruct | 1.5B | 32K (aprox., no confirmado aquí) | apache-2.0 | Hugging Face, ampliamente usado | Transformer convencional, benchmarks públicos |
| Llama-3.2-1B-Instruct | 1.2B | 128K (aprox., no confirmado aquí) | licencia Llama | Hugging Face, ampliamente usado | Transformer convencional, benchmarks públicos |

La comparación con Qwen2.5-1.5B-Instruct y Llama-3.2-1B-Instruct es orientativa por tamaño; no hay datos de rendimiento de este checkpoint que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no es posible evaluar su rendimiento matemático real frente al modelo base ni frente a alternativas.
- Checkpoint experimental con 0 descargas y 0 likes: no ha sido validado por la comunidad.
- Entrenamiento de solo 100 pasos de rollout y 1 epoch sobre 3200 ejemplos: riesgo de sobreajuste o de mejora marginal respecto al base.
- Sesgos y alucinaciones: no documentados; al ser un modelo de 1.4B, es esperable una tasa de alucinación superior a modelos mayores en razonamiento matemático.
- Idiomas soportados no especificados: no se garantiza un buen rendimiento fuera del inglés.
- Contexto no documentado: no se conoce la ventana máxima efectiva.
- Requiere `trust_remote_code=True` por el código de modelado Ouro personalizado, lo que implica ejecutar código del autor.
- Licencia apache-2.0 permite uso comercial, pero la falta de evaluación hace desaconsejable su uso en producción sin validación previa.
- El repo tiene 0.0 GB: conviene verificar la integridad de los ficheros antes de descargar.

## Enlaces

- Hugging Face: https://huggingface.co/hi-todayis-jh/ouro-1.4b-base-math-verl-grpo-native-ep2-s2base-cfg3-168100-20261126
- Modelo base: https://huggingface.co/ByteDance/Ouro-1.4B-Thinking
- Dataset de entrenamiento: https://huggingface.co/datasets/DigitalLearningGmbH/MATH-lighteval
- Dataset de rollouts: https://huggingface.co/datasets/hi-todayis-jh/ouro-1.4b-base-math-verl-grpo-native-ep2-s2base-cfg3-168100-20261126-rollouts
- Repositorio verl: https://github.com/volcengine/verl
