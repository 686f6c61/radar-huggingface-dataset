# max-rl/maxrl_llama3p1_8b_instruct_bigmath_bs64_checkpoints

## Resumen

MaxRL Llama-3.1-8B-Instruct on Big-Math-RL-Verified es un conjunto de checkpoints resultantes de un ajuste fino mediante aprendizaje por refuerzo (RL) sobre el modelo base `meta-llama/Llama-3.1-8B-Instruct`. Lo desarrolla el usuario `max-rl` y su objetivo es mejorar las capacidades de razonamiento matemático del modelo mediante entrenamiento online con la técnica MaxRL, una variante de optimización de política con ventajas normalizadas por la media de recompensa. El repositorio no contiene un modelo único, sino exportaciones en bf16 en formato Hugging Face de los pasos globales 50, 100, ..., hasta 2000, lo que permite estudiar la evolución del entrenamiento.

El entrenamiento se realizó sobre el dataset `SynthLabsAI/Big-Math-RL-Verified` (242.206 problemas deduplicados, de los cuales el run consume aproximadamente 128.000, unas 0,53 épocas) durante 2000 pasos en un nodo con 8 GPU H200. La recompensa es binaria mediante Math-Verify, sin término KL, con prompts de hasta 1024 tokens y respuestas de hasta 3072 tokens.

La relevancia de esta ficha es doble: por un lado, documenta una receta reproducible de RL para matemáticas sobre Llama 3.1 8B; por otro, los checkpoints 1950 y 2000 incluyen el estado completo de entrenamiento (FSDP fp32 y shards AdamW para 8 rangos), lo que permite reanudar el entrenamiento con verl. El repositorio ocupa 835,2 GB, reflejo de que contiene múltiples checkpoints y estados de optimizador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1), ajustado con RL (MaxRL) |
| Parametros totales | 8 mil millones (heredados de Llama-3.1-8B-Instruct) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Llama 3.1 soporta 128k, pero no se confirma para estos checkpoints) |
| Tipos de cuantizacion | no disponible (solo se publican pesos bf16) |
| Idiomas soportados | no disponibles |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors (exportaciones bf16 en `global_step_N/actor/huggingface`); estados de entrenamiento en `.pt` (FSDP fp32 y AdamW) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura transformer decoder-only de Llama 3.1 8B Instruct y se ajusta con MaxRL, un algoritmo de optimización de política online. La ventaja se calcula como `(r - mean) / (mean + eps)`, donde `r` es la recompensa binaria otorgada por Math-Verify. La receta concreta es: 64 prompts con n=16 muestras por paso, un paso de optimizador por paso, learning rate 1e-7, weight decay 0.01, grad clip 1.0, PPO clip 0.2, pérdida token-mean, sin término KL, prompts de hasta 1024 tokens y respuestas de hasta 3072 tokens. El muestreo se realiza con vLLM a temperatura 1.0. Todo el run se ejecutó en 1 nodo con 8 GPU H200 durante 2000 pasos.

El dataset de entrenamiento es `SynthLabsAI/Big-Math-RL-Verified`, deduplicado y con 242.206 problemas; el run ve aproximadamente 128.000 de ellos, lo que equivale a unas 0,53 épocas. La receta se implementa sobre la rama `jiayi/llama8b-bigmath` de `offpolicy_maxrl_verl`, con scripts en `slurm_scripts/fasrc/llama8b_bigmath`. Los checkpoints 1950 y 2000 incluyen el estado completo de entrenamiento (modelo FSDP fp32 y shards AdamW para 8 rangos, `extra_state` con RNG y scheduler de lr, `fsdp_config.json` y dataloader `data.pt`), lo que permite reanudar con `trainer.resume_mode` de verl.

## Capacidades

- Generación de texto y razonamiento matemático, con especial énfasis en problemas de competición (MATH-500, AIME24, AMC23, Minerva).
- Resolución de problemas matemáticos paso a paso, con formato de respuesta verificable por Math-Verify.
- Generación de código y razonamiento general heredados del modelo base Llama-3.1-8B-Instruct.
- Soporte de tool calling y function calling heredado del modelo base (no se documenta un ajuste específico para ello en esta versión).
- Capacidades multilingües heredadas del modelo base (no se detallan idiomas en la información proporcionada).
- No se documenta modo thinking explícito, visión ni audio.

## Casos de uso

- Evaluación de recetas de RL matemático: los checkpoints cada 50 pasos permiten trazar curvas de aprendizaje y comparar el efecto de hiperparámetros como el clip de PPO o el tamaño de batch, usando los pasos 0 a 2000 como referencia.
- Reanudación de entrenamiento: los checkpoints 1950 y 2000 incluyen el estado FSDP y AdamW, por lo que se puede continuar el run con verl `trainer.resume_mode` sin reiniciar desde cero.
- Generación de soluciones matemáticas verificables: el modelo produce respuestas que pueden validarse automáticamente con Math-Verify, útil en pipelines de evaluación de razonamiento.
- Investigación en algoritmos de ventaja: MaxRL normaliza por la media de recompensa; estos checkpoints sirven para comparar contra variantes como GRPO o PPO estándar sobre el mismo dataset.
- Fine-tuning posterior: al ser exportaciones bf16 en formato Hugging Face, se pueden usar como punto de partida para SFT o RL adicional sobre dominios matemáticos específicos.
- Estudio de la dinámica de recompensa binaria: el dataset y las rollouts publicadas (dataset `maxrl_llama3p1_8b_instruct_bigmath_bs64_rollout2000`) permiten analizar qué problemas se resuelven y cuáles no a lo largo del entrenamiento.
- Benchmarking de modelos matemáticos de 8B: útil como referencia interna para comparar contra Llama-3.1-8B-Instruct base en tareas de competición.

## Benchmarks y rendimiento

Datos publicados en la model card (n=32, T=0.6, top-p 0.95), mean@32 y best@32 en el paso 2000:

| Benchmark | step 0 | step 2000 | best@32 |
|---|---|---|---|
| MATH-500 | 0.503 | 0.579 | 0.870 |
| AIME24 | 0.049 | 0.081 | 0.281 |
| AMC23 | 0.228 | 0.326 | 0.825 |
| Minerva | 0.241 | 0.274 | 0.530 |

## Requisitos de hardware

- El repositorio completo ocupa 835,2 GB, pero cada checkpoint individual en bf16 de un modelo de 8B ronda los 16 GB de pesos.
- VRAM estimada para inferencia en bf16: aproximadamente 16-18 GB solo para pesos, más overhead de KV cache según contexto.
- GPU recomendadas para inferencia: A100 40/80 GB, H100, H200; en consumer, RTX 4090 (24 GB) puede alojar el modelo en bf16 con contexto moderado, y GPUs de 16 GB requieren cuantización (no publicada en el repo).
- Entrenamiento: se realizó en 1 nodo con 8 GPU H200; la reanudación requiere un entorno equivalente con FSDP y verl.
- Opciones de despliegue: al ser safetensors en formato Hugging Face, es compatible con vLLM, TGI, llama.cpp (previa conversión a GGUF) y Ollama (previa conversión). No se publican pesos GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| max-rl/maxrl_llama3p1_8b_instruct_bigmath_bs64_checkpoints | 8B | no disponible | RL matemático (MaxRL) sobre Llama 3.1 8B | llama3.1 | Hugging Face (checkpoints cada 50 pasos) |
| meta-llama/Llama-3.1-8B-Instruct | 8B | 128k | SFT + RLHF general | llama3.1 | Hugging Face |
| SynthLabsAI/Big-Math-RL-Verified | no aplica (dataset) | no aplica | Dataset de problemas matemáticos para RL | no disponible | Hugging Face |

No se dispone de datos de benchmarks de modelos comparables en la información proporcionada para establecer una comparación cuantitativa adicional.

## Limitaciones y advertencias

- El ajuste se centra en matemáticas; el rendimiento en otras tareas puede degradarse respecto al modelo base (no se documenta evaluación fuera de matemáticas).
- Riesgo de alucinación inherente a los modelos de lenguaje; las respuestas matemáticas deben validarse con herramientas como Math-Verify antes de usarse en producción.
- No se documentan sesgos específicos ni evaluaciones de seguridad en la información proporcionada.
- La licencia llama3.1 impone restricciones de uso comercial y obligaciones de atribución; es necesario revisar la Llama 3.1 Community License antes de desplegar.
- El repositorio contiene múltiples checkpoints y estados de entrenamiento; no es un modelo único listo para producción, sino material de investigación.
- No se publican pesos cuantizados (GGUF, AWQ, GPTQ), lo que limita el despliegue en hardware de gama baja.
- Los idiomas soportados no están documentados; se heredan del modelo base pero sin verificación específica.
- El contexto efectivo de entrenamiento fue de 1024 tokens de prompt y 3072 de respuesta; usos con contextos mucho mayores no han sido validados en este ajuste.

## Enlaces

- Hugging Face: https://huggingface.co/max-rl/maxrl_llama3p1_8b_instruct_bigmath_bs64_checkpoints
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/SynthLabsAI/Big-Math-RL-Verified
- Rollouts: https://huggingface.co/datasets/max-rl/maxrl_llama3p1_8b_instruct_bigmath_bs64_rollout2000
- Licencia Llama 3.1: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct/blob/main/LICENSE
- W&B: `paprika_online/llama8b_bigmath_maxrl_guanning`, run `ipoyhbvm` (no se proporciona URL directa)
