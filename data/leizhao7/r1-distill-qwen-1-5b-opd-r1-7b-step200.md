# leizhao7/R1-Distill-Qwen-1.5B-OPD-R1-7B-Step200

## Resumen

R1-Distill-Qwen-1.5B-OPD-R1-7B-Step200 es un checkpoint de investigación publicado por el usuario leizhao7 en Hugging Face. Se trata de un modelo de generación de texto de 1.777 millones de parámetros basado en arquitectura Qwen2, obtenido a partir del modelo deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B mediante 200 pasos de destilación on-policy (OPD, on-policy distillation), tomando como profesor fijo a DeepSeek-R1-Distill-Qwen-7B.

El modelo acompaña al artículo científico "Why On-Policy Distillation Sometimes Fails: Vanishing Learning Signals" (arXiv:2610.11247) y sirve para reproducir y estudiar el comportamiento de la destilación on-policy en tareas de razonamiento matemático. El entrenamiento emplea un objetivo de KL inversa aproximado con los 16 tokens principales del estudiante, sobre el dataset DAPO-Math-17k de BytedTsinghua-SIA.

Su relevancia es principalmente académica: mejora la media macro de precisión (avg@8) del estudiante inicial del 39,85% al 42,66% en AIME24, AIME25 y AMC23, lo que lo convierte en un punto de partida útil para investigadores que estudian señales de aprendizaje en destilación. No está pensado como modelo de propósito general para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2 (transformer decoder, causal LM) |
| Parametros totales | 1.777.088.000 |
| Parametros activos | no disponible (no es MoE; denso) |
| Longitud de contexto | no disponible (hereda la de DeepSeek-R1-Distill-Qwen-1.5B) |
| Tipos de cuantizacion | no disponible (solo pesos en bf16/fp16 en safetensors) |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT (con atribuciones upstream: Apache-2.0 de Qwen2.5-Math-1.5B) |
| Formato de pesos | safetensors (tamano del repo: 3,6 GB) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder causal de la familia Qwen2, sin mezcla de expertos. Parte de los pesos de DeepSeek-R1-Distill-Qwen-1.5B (que a su vez desciende de Qwen2.5-Math-1.5B mediante destilación de razonamiento de DeepSeek-R1) y se ajusta mediante destilación on-policy (OPD): el estudiante genera sus propias respuestas y las prefijos generados se supervisan con las distribuciones del profesor fijo DeepSeek-R1-Distill-Qwen-7B.

El objetivo de entrenamiento es una KL inversa (reverse-KL) aproximada con los 16 tokens de mayor probabilidad del estudiante, ponderada por probabilidades del estudiante y con media global sobre los tokens de respuesta válidos. Los datos de entrenamiento provienen del dataset BytedTsinghua-SIA/DAPO-Math-17k con el preprocesado de prompts matemáticos del paper DAPO. Los hiperparámetros publicados son: optimizador AdamW con learning rate 1e-6 y schedule constante, batch de 64 prompts con 1 rollout por prompt, máximo de 1.024 tokens de prompt y 21.000 tokens de respuesta, temperatura de muestreo 1.0, y 200 pasos de entrenamiento (receta pública `r1_top16`). Utiliza la plantilla de chat de razonamiento de DeepSeek-R1-Distill. No hay indicios de RLHF/DPO adicionales en la información disponible.

## Capacidades

- Generacion de texto conversacional con plantilla de chat de razonamiento estilo DeepSeek-R1-Distill (cadenas de pensamiento antes de la respuesta).
- Razonamiento matematico: entrenado especificamente con prompts de matematicas de DAPO-Math-17k; evalua en AIME24, AIME25 y AMC23.
- Generacion de cadenas de razonamiento largo: durante entrenamiento se permitieron hasta 21.000 tokens de respuesta por rollout.
- No hay informacion sobre soporte de tool calling / function calling.
- No hay informacion sobre capacidades de agentes ni multi-step tooling.
- Capacidades multilingues: limitadas al ingles segun la model card; no hay datos de otros idiomas.
- Sin capacidades de vision ni audio.

## Casos de uso

- Reproduccion de investigacion en destilacion on-policy: el checkpoint es el resultado final de 200 pasos del run del paper, con SHA256SUMS, notas de provenance y `validation.json`, ideal para replicar experimentos de OPD y estudiar senales de aprendizaje que se desvanecen.
- Benchmark de razonamiento matematico en modelos pequenos: con 1.78B de parametros y ~42,66% de avg@8 macro en AIME/AMC, sirve como baseline compacto para comparar tecnicas de destilacion o fine-tuning en problemas de nivel competicion.
- Experimentacion con destilacion inversa-KL: permite probar variantes del objetivo (top-k, ponderaciones, medias) partiendo de un punto ya entrenado.
- Estudio de la relacion perdida-rendimiento: el checkpoint documenta la reduccion del 13,9% en la perdida surrogate top-16 frente a la mejora de +2,80 puntos, util para investigar cuando la perdida de destilacion no correlaciona con la precision.
- Prototipado de razonamiento en hardware modesto: al ser un modelo denso de 1,8B, cabe en GPUs de consumo para experimentar con cadenas de razonamiento largas sin infraestructura costosa.
- Punto de partida para fine-tuning adicional: al conservar la arquitectura y plantilla de DeepSeek-R1-Distill-Qwen-1.5B, puede continuar entrenandose con datasets matematicos o de razonamiento propios.

## Benchmarks y rendimiento

Resultados archivados del run del paper (avg@8: media de acierto de 8 muestras, macro-promediado; temperatura 0,7, top-p 0,95, maximo 31.744 tokens de respuesta):

| Benchmark | avg@8 (%) |
|---|---:|
| AIME24 | 29,58 |
| AIME25 | 31,67 |
| AMC23 | 66,72 |
| **Media macro** | **42,66** |

Comparativa con el estudiante inicial (segun la model card):

| Checkpoint | Media macro avg@8 (%) |
|---|---:|
| DeepSeek-R1-Distill-Qwen-1.5B (inicial) | 39,85 |
| Step-200 (este modelo) | 42,66 (+2,80) |

Advertencias de la propia model card: son metricas archivadas del run del paper, un solo run por condicion con horizonte fijo de 200 pasos, y el checkpoint exportado no ha sido re-evaluado de forma independiente durante el empaquetado.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,6-4 GB en fp16/bf16 (tamano del repo de 3,6 GB en safetensors); sin datos oficiales de cuantizacion.
- GPU recomendadas: cualquier GPU de consumo con al menos 6-8 GB de VRAM (RTX 3060, RTX 4060 Ti, RTX 4090, etc.); no se necesitan GPUs de centro de datos como A100 o H100 para inferencia.
- Cabe comodamente en GPUs de consumo de gama media y alta; incluso es viable en laptops con GPU dedicada de 6 GB.
- Opciones de despliegue: Transformers 4.56.2 o superior con PyTorch y Accelerate (ejemplo oficial en la model card con `AutoModelForCausalLM` y `AutoTokenizer`); compatible con text-generation-inference segun los tags del repo. No hay menciones explicitas a vLLM, llama.cpp u Ollama; dado que solo hay safetensors y no GGUF, llama.cpp/Ollama requeririan conversion.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Media macro avg@8 (AIME/AMC) | Licencia |
|---|---|---|---|---|
| R1-Distill-Qwen-1.5B-OPD-R1-7B-Step200 | 1,78B | no disponible | 42,66% (AIME24/25, AMC23) | MIT |
| DeepSeek-R1-Distill-Qwen-1.5B (base) | 1,78B | no disponible | 39,85% (mismos benchmarks) | MIT |
| DeepSeek-R1-Distill-Qwen-7B (profesor) | 7B | no disponible | no disponible (para estos benchmarks) | MIT |

El modelo ocupa la franja de modelos de razonamiento matematico de ~1,5-2B parametros derivados de la familia DeepSeek-R1-Distill; su diferencial es el entrenamiento OPD documentado y reproducible, no un salto de rendimiento general.

## Limitaciones y advertencias

- Checkpoint de investigacion: la model card indica explicitamente que no establece rendimiento de proposito general ni seguridad; es un run unico con horizonte fijo de 200 pasos.
- Riesgo de alucinacion y errores: hereda las limitaciones del estudiante inicial y puede producir respuestas o codigo incorrectos.
- Especializacion estrecha: entrenado solo con prompts matematicos (DAPO-Math-17k); su rendimiento en otras tareas no esta evaluado.
- Idioma: documentado solo para ingles; el rendimiento en castellano no esta evaluado.
- Metricas archivadas: el checkpoint exportado no ha sido re-evaluado de forma independiente; la perdida surrogate top-16 no es la KL de vocabulario completo, y la reduccion del 13,9% no es el minimo historico del entrenamiento.
- La receta publica `r1_top16` es un launcher reconstruido por conveniencia, no el comando historico exacto que produjo el checkpoint.
- Licencia: MIT, pero se exige preservar el copyright/licencia MIT de DeepSeek y la atribucion Apache-2.0 del ancestro Qwen2.5-Math-1.5B (ver `LICENSE`, `UPSTREAM_ATTRIBUTION.md` y `LICENSE-QWEN-APACHE-2.0`).
- Plantilla de chat: debe usarse la plantilla de razonamiento de DeepSeek-R1-Distill; no debe etiquetarse como modelo Qwen3 non-thinking.
- No incluye los pesos del profesor (DeepSeek-R1-Distill-Qwen-7B).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/leizhao7/R1-Distill-Qwen-1.5B-OPD-R1-7B-Step200
- Paper (arXiv): https://arxiv.org/abs/2610.11247
- Pagina del proyecto: https://leizhao7.github.io/opd-learning-signals/
- Codigo y resultados numericos: https://github.com/leizhao7/opd-learning-signals
- Mapa de experimentos: https://github.com/leizhao7/opd-learning-signals/blob/main/docs/EXPERIMENTS.md
- Notas de reproducibilidad: https://github.com/leizhao7/opd-learning-signals/blob/main/docs/REPRODUCIBILITY.md
- Modelo inicial (estudiante): https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B
- Profesor: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-7B
- Dataset de entrenamiento: https://huggingface.co/datasets/BytedTsinghua-SIA/DAPO-Math-17k
