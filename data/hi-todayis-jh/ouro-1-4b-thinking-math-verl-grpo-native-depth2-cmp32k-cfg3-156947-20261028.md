# hi-todayis-jh/ouro-1.4b-thinking-math-verl-grpo-native-depth2-cmp32k-cfg3-156947-20261028

## Resumen

Ouro-1.4B-Thinking-Math (variante `verl-grpo-native-depth2-cmp32k-cfg3-156947-20261028`) es un checkpoint de ajuste fino mediante aprendizaje por refuerzo del modelo base `ByteDance/Ouro-1.4B-Thinking`, un modelo de lenguaje de tipo *looped* (con capas recurrentes iteradas) de 1.400 millones de parametros desarrollado por ByteDance. Este checkpoint concreto ha sido producido por el usuario `hi-todayis-jh` aplicando el algoritmo GRPO (Group Relative Policy Optimization) sobre el dataset `DigitalLearningGmbH/MATH-lighteval` con el framework verl 0.6.1, con el objetivo de mejorar el razonamiento matematico del modelo base.

El interes de esta publicacion es doble. Por un lado, demuestra un flujo completo de entrenamiento RL reproducible sobre un modelo de arquitectura no convencional (looped transformer), incluyendo checkpoints FSDP completos, codigo de lanzamiento, configuracion resuelta y recibos de verificacion. Por otro, explora el efecto de la profundidad de bucle (`native_depth2`) y de una politica de salida temprana (`cfg3`, `exit_mode fixed`, `cache_rule full_depth`) sobre el rendimiento en tareas de matemáticas.

Se trata de un artefacto de investigacion, no de un modelo listo para produccion: el repositorio pesa 57,6 GB e incluye estados de optimizador y del dataloader, y la model card no documenta resultados de evaluacion ni idiomas soportados. Su valor esta en la trazabilidad del experimento y en la posibilidad de reutilizar los pesos fusionados en `actor/huggingface/`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con capas recurrentes iteradas (looped language model), codigo `modeling_ouro.py` |
| Parametros totales | 1.400 millones (derivado del nombre del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible de forma explicita; el identificador del run indica `cmp32k` (probablemente 32.768 tokens, sin confirmar) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors en precision completa; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (carpeta `actor/huggingface/`) y checkpoints FSDP `.pt` (`actor/`, `optim_*`, `extra_state_*`) |

## Arquitectura y entrenamiento

El modelo base `ByteDance/Ouro-1.4B-Thinking` pertenece a la familia Ouro de modelos *looped*: en lugar de apilar N capas distintas, reutiliza un bloque de capas varias veces, lo que permite aumentar la profundidad efectiva de computo sin incrementar el numero de parametros. El checkpoint incluye codigo de modelado propio (`modeling_ouro.py`, `configuration_ouro.py`) que debe cargarse con `trust_remote_code=True`. El entrenamiento de este checkpoint se realizo con verl 0.6.1 en modo `native`, con profundidad de bucle 2 (`native_depth2`) y una politica de salida configurada mediante `policy_config.json` (`--exit_mode fixed --cache_rule full_depth`, prefijo `cfg3`).

El ajuste se hizo con GRPO durante 100 pasos de rollout y una epoca, sobre el fichero `compression_dataset_3200.jsonl` derivado de `DigitalLearningGmbH/MATH-lighteval`. Hiperparametros principales: `learning_rate 1e-6`, `beta 0.001` (coeficiente KL), `max_grad_norm 1.0`, `optimizer AdamW8bit` con betas `(0.9, 0.99)`, `weight_decay 0.1`, `warmup_ratio 0.1`, `loss_agg_mode seq-mean-token-sum-norm`, `ppo_micro_batch_size_per_gpu 1`. La generacion durante el rollout se sirvio con vLLM (`--vllm_async_scheduling`, `--vllm_gpu_memory_utilization 0.45`, `--vllm_kv_cache_memory_bytes 68719476736`, es decir, 64 GiB de cache KV). No se documenta el numero total de tokens de entrenamiento ni la composicion exacta del dataset mas alla del nombre del fichero.

## Capacidades

- Generacion de texto y razonamiento de tipo *thinking* (el modelo base es la variante Thinking de Ouro).
- Resolucion de problemas matematicos, especialmente tras el ajuste RL sobre MATH-lighteval.
- Razonamiento multi-paso con profundidad de computo adaptativa mediante bucle recurrente y politica de salida temprana.
- Carga directa con `transformers` desde `global_step_N/actor/huggingface` usando `trust_remote_code=True`.
- Reproducibilidad del entrenamiento: se incluyen manifiesto, configuracion resuelta, codigo de lanzamiento y snapshot del codigo del entrenador.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades multimodales (vision, audio): no disponibles.
- Cobertura multilingue: no documentada.

## Casos de uso

- **Investigacion en RL para matematicas**: reutilizar la configuracion verl/GRPO documentada (`run_config.json`, `verl_config.yaml`) como punto de partida para reproducir o extender el experimento sobre otros modelos looped o datasets de razonamiento.
- **Estudio de modelos looped con salida temprana**: analizar como afecta la profundidad de bucle (`native_depth2`) y la politica `exit_mode fixed` al coste computacional y a la calidad de las respuestas en problemas de MATH.
- **Evaluacion comparativa de checkpoints intermedios**: los directorios `global_step_N/` permiten trazar la evolucion del modelo a lo largo de los 100 pasos de rollout y estudiar la dinamica de aprendizaje del RL.
- **Generacion de soluciones matematicas paso a paso en entornos de investigacion**: cargar los pesos fusionados en `actor/huggingface` con `transformers` para generar cadenas de razonamiento sobre problemas de nivel competicion, siempre con validacion humana.
- **Punto de partida para ajuste adicional (SFT/DPO)**: al estar bajo Apache 2.0 y en safetensors estandar, el checkpoint fusionado puede servir como base para posteriores etapas de alineamiento.
- **Auditoria de reproducibilidad de pipelines RL**: los recibos en `records/receipts/` y los logs de archivo permiten verificar la integridad de los artefactos, util en entornos de investigacion con requisitos de trazabilidad.
- **Prototipado de asistentes de matematicas de bajo coste**: con 1.400 millones de parametros, el modelo es candidato a despliegue en una sola GPU consumer si se cuantiza, aunque esta variante no publica pesos cuantizados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo referencia el proyecto W&B `ouro-1.4b-grpo-rltt-math` (run `verl-grpo-native-depth2-cmp32k-cfg3-156947-20261028`) como fuente de metricas de entrenamiento, sin cifras de evaluacion en el repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa para un modelo denso de 1.400 millones de parametros: en FP16/BF16 requiere aproximadamente 3 GB de pesos mas cache KV; en cuantizacion de 8 bits, unos 1,5-2 GB; en 4 bits, alrededor de 1 GB. Estas cifras son estimaciones genericas, no datos publicados para este checkpoint.
- GPU recomendadas: para entrenamiento, el run uso FSDP con sharding y vLLM con 64 GiB de cache KV, lo que sugiere nodos multi-GPU (A100/H100). Para inferencia, una RTX 4090 o incluso GPUs consumer de 8-16 GB deberian ser suficientes segun la cuantizacion.
- Cabe en GPU consumer: si, en principio, dada la escala de 1,4 B de parametros, aunque no hay confirmacion oficial para esta variante.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` es la via documentada. vLLM se uso durante el entrenamiento (`--vllm_async_scheduling`), por lo que es compatible con el codigo de modelado, aunque requiere el `modeling_ouro.py` incluido. No se documenta soporte de llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.
- Almacenamiento: el repositorio completo ocupa 57,6 GB por los checkpoints FSDP y estados de optimizador; para inferencia solo es necesaria la carpeta `actor/huggingface/` de un `global_step_N/`, mucho mas ligera.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este checkpoint (Ouro-1.4B-Thinking + GRPO) | 1,4 B | no disponible (`cmp32k` en el ID) | Apache 2.0 | Hugging Face, safetensors + FSDP | Checkpoint de investigacion con artefactos completos de entrenamiento |
| ByteDance/Ouro-1.4B-Thinking (base) | 1,4 B | no disponible | Apache 2.0 | Hugging Face | Modelo base sin el ajuste RL; referencia directa para medir el efecto del GRPO |
| Qwen2.5-1.5B-Instruct | 1,5 B | 32.768 tokens | Apache 2.0 | Hugging Face, amplio ecosistema (GGUF, vLLM, Ollama) | Alternativa densa convencional con soporte de herramientas mucho mas maduro |
| DeepSeek-R1-Distill-Qwen-1.5B | 1,5 B | 32.768 tokens | MIT | Hugging Face, multiples cuantizaciones | Modelo de razonamiento de escala similar entrenado con destilacion de R1 |

La comparacion con Qwen2.5 y DeepSeek-R1-Distill es cualitativa: no hay datos de benchmarks publicados para este checkpoint que permitan contrastar rendimiento numerico.

## Limitaciones y advertencias

- Artefacto de investigacion: sin resultados de evaluacion publicados, no hay evidencia documentada de mejora frente al modelo base.
- Sesgos conocidos: no documentados; el modelo hereda los sesgos del base `ByteDance/Ouro-1.4B-Thinking` y del dataset MATH-lighteval, orientado a matematicas y predominantemente en ingles.
- Riesgo de alucinacion: presente como en cualquier LLM; en matematicas puede producir cadenas de razonamiento plausibles con resultados incorrectos.
- Limitaciones de contexto e idioma: no se documentan idiomas soportados ni la longitud de contexto real; el identificador sugiere 32k pero no esta confirmado en la model card.
- Requiere `trust_remote_code=True`: la carga ejecuta codigo de modelado incluido en el repositorio, lo que implica un riesgo de seguridad que debe evaluarse antes de usarlo en produccion.
- Tamano del repositorio: 57,6 GB por los checkpoints FSDP y estados de optimizador; descargar solo la carpeta `actor/huggingface/` del paso deseado reduce drasticamente el espacio necesario.
- Licencia Apache 2.0: permite uso comercial, pero al ser un checkpoint derivado de un modelo de ByteDance conviene revisar tambien las condiciones del modelo base.
- Sin cuantizaciones oficiales: no se publican versiones GGUF, AWQ ni GPTQ, por lo que el despliegue eficiente requeriria generarlas a partir de los safetensors.
- Sin soporte documentado de tool calling ni de agentes: no debe asumirse compatibilidad con frameworks de function calling sin validacion previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hi-todayis-jh/ouro-1.4b-thinking-math-verl-grpo-native-depth2-cmp32k-cfg3-156947-20261028
- Dataset de rollouts: https://huggingface.co/datasets/hi-todayis-jh/ouro-1.4b-thinking-math-verl-grpo-native-depth2-cmp32k-cfg3-156947-20261028-rollouts
- Modelo base: https://huggingface.co/ByteDance/Ouro-1.4B-Thinking
- Dataset de entrenamiento: https://huggingface.co/datasets/DigitalLearningGmbH/MATH-lighteval
- Framework verl: https://github.com/volcengine/verl
- Proyecto W&B de metricas de entrenamiento: proyecto `ouro-1.4b-grpo-rltt-math`, run `verl-grpo-native-depth2-cmp32k-cfg3-156947-20261028` (no se proporciona URL directa)
