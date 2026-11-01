# hi-todayis-jh/ouro-1.4b-thinking-math-verl-rltt-native-sd-cmp32k-cfg3-156947-20261029

## Resumen

Ouro-1.4B-Thinking-Math es un checkpoint de ajuste fino por refuerzo (RL) del modelo base ByteDance/Ouro-1.4B-Thinking, un modelo de lenguaje con arquitectura de bucles (looped language model) de 1.400 millones de parametros. Lo publica el usuario hi-todayis-jh en HuggingFace y se ha entrenado con la extension verl_trainer sobre el framework de RL verl 0.6.1, aplicando la receta GRPO con el algoritmo `rltt` en modo `native`. El objetivo es mejorar el razonamiento matematico del modelo base mediante 100 pasos de rollout sobre el dataset `compression_dataset_3200.jsonl`, derivado de DigitalLearningGmbH/MATH-lighteval.

El checkpoint es relevante porque documenta de forma exhaustiva todo el proceso de entrenamiento (configuracion de verl, codigo del launcher, codigo del modelo parcheado, metricas en W&B y recibos de verificacion), lo que facilita la reproducibilidad. Ademas, al estar basado en Ouro, explora la idea de modelos con profundidad recurrente: el modelo reutiliza capas en bucle, lo que permite aumentar la capacidad de razonamiento sin incrementar proporcionalmente el numero de parametros.

La licencia es Apache 2.0, lo que permite uso comercial y modificacion. Sin embargo, la model card no aporta informacion sobre idiomas soportados ni sobre el rendimiento final tras el entrenamiento, por lo que la evaluacion practica queda pendiente de benchmarks externos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con capas en bucle (looped language model, Ouro) |
| Parametros totales | 1.4B (heredados del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el entrenamiento usa secuencias de hasta 32k segun el nombre del checkpoint) |
| Tipos de cuantizacion | no disponible en la model card; al ser safetensors, admite cuantizacion a GGUF/AWQ/GPTQ por herramientas externas |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (carpeta `actor/huggingface/` con config, tokenizer y codigo de modelado) |

## Arquitectura y entrenamiento

El modelo parte de ByteDance/Ouro-1.4B-Thinking, un transformer de 1.4B parametros con una innovacion estructural: capas reutilizadas en bucle (looped layers), de modo que el mismo bloque de pesos se aplica varias veces en profundidad. Esto permite ganar capacidad de computo efectiva sin aumentar el numero de parametros. El checkpoint incluye el codigo de modelado parcheado (`modeling_ouro.py`, `configuration_ouro.py`) y un `policy_config.json` que define la politica de salida del bucle (`exit_mode fixed`, `cache_rule full_depth`).

El entrenamiento se realizo con verl 0.6.1 aplicando GRPO (Group Relative Policy Optimization) con el algoritmo `rltt` en modo `native`, sobre el dataset `compression_dataset_3200.jsonl` (derivado de MATH-lighteval). Se ejecutaron 100 pasos de rollout con hiperparametros concretos: learning rate 1e-6, AdamW8bit con betas 0.9/0.99, weight decay 0.1, warmup ratio 0.1, `max_grad_norm` 1.0, `beta` 0.001, `length_penalty_alpha` 0 y `loss_agg_mode seq-mean-token-sum-norm`. Se uso FSDP para el entrenamiento, vLLM asincrono para la generacion de rollouts (con `gpu_memory_utilization` 0.45 y 64 GiB de KV cache) y credito de bucle `loop_credit distill` con pesos de bucle superficial `1,1,1`. El job se ejecuto en Slurm (job 156947, nodo `orchard-flame-6`).

## Capacidades

- Generacion de texto y razonamiento matematico, reforzado especificamente mediante RL sobre problemas de MATH-lighteval.
- Razonamiento multi-paso con modo "thinking" (heredado del modelo base Ouro-1.4B-Thinking).
- Capacidad de profundidad recurrente: el bucle de capas permite iteraciones internas de computo, potencialmente util para problemas de razonamiento complejo.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Capacidades de vision o audio: no disponibles (modelo solo de texto).

## Casos de uso

- Investigacion en RL para matematicas: el checkpoint sirve como referencia reproducible de un pipeline GRPO completo con verl, incluyendo configuracion, launcher y metricas, para estudiar el efecto del RL sobre un modelo de 1.4B.
- Fine-tuning academico de modelos pequenos: al ser Apache 2.0 y caber en una sola GPU consumer, permite a grupos con recursos limitados experimentar con RL para razonamiento matematico.
- Generacion de soluciones paso a paso en entornos educativos: el modelo puede producir cadenas de razonamiento matematico, util para asistentes de tutorizacion o generacion de problemas resueltos.
- Base para destilacion o merging: al ser un checkpoint intermedio de RL, puede servir como punto de partida para experimentos de destilacion de razonamiento o de mezcla con otros modelos.
- Evaluacion comparativa de algoritmos de RL: el nombre y la configuracion del checkpoint (`rltt`, `native`, `cfg3`) permiten compararlo con otras variantes del mismo autor para medir el impacto de cada decision de diseno.
- Reproducibilidad de infraestructura: los manifiestos, codigo y recibos incluidos permiten reconstruir el entorno de entrenamiento (verl 0.6.1, Slurm, vLLM) en otros clusters.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a las metricas de entrenamiento en W&B (proyecto `ouro-1.4b-grpo-rltt-math`, run `verl-rltt-native-sd-cmp32k-cfg3-156947-20261029`), pero no se incluyen valores numericos de evaluacion en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 3 GB de pesos (1.4B parametros a 2 bytes), mas overhead de activaciones y KV cache; en la practica, entre 4 y 6 GB.
- En cuantizacion de 8 bits: alrededor de 1.5-2 GB de pesos; en 4 bits, alrededor de 1 GB.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para FP16 (RTX 3060 12 GB, RTX 4070, RTX 4090, A10, L4). Para entrenamiento o inferencia con contextos largos (32k), se recomienda A100 40/80 GB o H100.
- Cabe en GPU consumer: si, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 con cuantizacion o FP16.
- Opciones de despliegue: transformers con `trust_remote_code=True` (requerido por el codigo de modelado Ouro), vLLM (usado en el entrenamiento), llama.cpp/Ollama si se convierte a GGUF.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Ouro-1.4B-Thinking-Math (este) | 1.4B | no disponible (entrenado a 32k) | Apache 2.0 | Checkpoint RL de Ouro-1.4B-Thinking sobre MATH-lighteval |
| ByteDance/Ouro-1.4B-Thinking | 1.4B | no disponible | Apache 2.0 | Modelo base sin el ajuste RL de este checkpoint |
| Qwen2.5-Math-1.5B | 1.5B | 32k (segun version) | Apache 2.0 | Modelo matematico de tamano comparable, sin bucle de capas |
| DeepSeek-R1-Distill-Qwen-1.5B | 1.5B | 32k | MIT | Destilado de razonamiento de tamano similar |

La comparacion directa de rendimiento no es posible porque no hay benchmarks publicados para este checkpoint. La principal diferencia estructural frente a los alternativos es el uso de capas en bucle (Ouro) en lugar de un transformer estandar.

## Limitaciones y advertencias

- No se han publicado evaluaciones de rendimiento; el checkpoint puede haber sufrido sobreajuste o degradacion tras solo 100 pasos de RL sobre un dataset especifico de matematicas.
- Riesgo de alucinacion en razonamiento matematico: aunque entrenado con RL, no hay garantia de correccion en problemas fuera de la distribucion de MATH-lighteval.
- Idiomas soportados no documentados; probablemente el entrenamiento se centra en ingles por el dataset de origen.
- El modelo requiere `trust_remote_code=True` por el codigo de modelado Ouro personalizado, lo que implica ejecutar codigo del autor; conviene auditar `modeling_ouro.py` antes de usarlo en produccion.
- El repositorio ocupa 57.6 GB porque incluye checkpoints FSDP, estados del optimizador y logs; no es un repo ligero de solo pesos.
- Aunque la licencia es Apache 2.0, el modelo base y el dataset de entrenamiento pueden tener sus propias condiciones; verificar antes de uso comercial.
- No hay informacion sobre sesgos conocidos ni sobre el comportamiento del bucle de capas en contextos muy largos.

## Enlaces

- HuggingFace: https://huggingface.co/hi-todayis-jh/ouro-1.4b-thinking-math-verl-rltt-native-sd-cmp32k-cfg3-156947-20261029
- Dataset de rollouts: https://huggingface.co/datasets/hi-todayis-jh/ouro-1.4b-thinking-math-verl-rltt-native-sd-cmp32k-cfg3-156947-20261029-rollouts
- Modelo base: https://huggingface.co/ByteDance/Ouro-1.4B-Thinking
- Dataset de entrenamiento: https://huggingface.co/datasets/DigitalLearningGmbH/MATH-lighteval
- Framework verl: https://github.com/volcengine/verl
- W&B (proyecto): https://wandb.ai/ouro-1.4b-grpo-rltt-math (referenciado en la model card; no verificado)
