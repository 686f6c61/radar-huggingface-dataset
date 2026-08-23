# mario-rc/multi-domain-rm-fsfairx-llama-3-8b-it

## Resumen

`mario-rc/multi-domain-rm-fsfairx-llama-3-8b-it` es un modelo de recompensa multi-dominio desarrollado por Mario-rc, diseñado para evaluar la calidad de respuestas de asistentes conversacionales a lo largo de cuatro dimensiones principales: coherencia, sentido común, empatía y calidad multicultural. A diferencia de los reward models clásicos que producen una única puntuación de utilidad, este modelo combina 23 objetivos de regresión fina con una red de gating condicionada al prompt, lo que permite capturar matices específicos de cada dominio en una sola puntuación de preferencia.

Está construido sobre el modelo base `sfairXC/FsfairX-LLaMA3-RM-v0.1`, un reward model derivado de Llama-3-8B, y sigue el enfoque ArmoRLHF de modelado de preferencias multi-objetivo. El modelo se presenta como una herramienta para reward modeling, ranking de preferencias, reranking y evaluación offline de alineación en datos de chat. Requiere `trust_remote_code=True` porque incluye una arquitectura personalizada (`RewardModelWithGating`) que calcula un vector de gating a partir del prompt y lo reutiliza para puntuar ambos candidatos de un par de preferencias.

El repositorio contiene únicamente pesos en formato `safetensors` (30 GB) y el checkpoint se publicó en junio de 2026. El modelo está orientado exclusivamente a la evaluación de respuestas en inglés y no funciona como asistente conversacional independiente.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RewardModelWithGating (transformers, custom code) sobre base Llama-3-8B |
| Parametros totales | 7.505.287.209 |
| Parametros activos | no aplicable (modelo denso, no MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Llama-3-8B, no confirmada) |
| Tipos de cuantizacion | no disponible (inferencia en bfloat16 documentada) |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible (el código del proyecto se publica bajo Apache-2.0) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo implementa una variante de la arquitectura ArmoRM con una red de gating condicionada al prompt. El flujo es el siguiente: a partir del prompt se computa un vector de gating (`compute_gating`) que pondera 23 objetivos de regresión lineal fina distribuidos en cuatro dominios de calidad (coherencia, sentido común, empatía y multiculturalidad). Ese vector se reutiliza para puntuar las dos respuestas del par de preferencia, lo que garantiza consistencia en la comparación.

El entrenamiento se realizó con datos del proyecto `multidomain_data_scoring` de mestecha, incluyendo los conjuntos `Multi-Domain-Data-Scoring` y `Multi-Domain-Data-Preference-Pairs-SharedGate`. No se especifican el número de tokens ni los detalles del proceso de optimización (si hubo RLHF, DPO u otro). El autor indica que se adaptó el enfoque ArmoRM/RLHFlow a atributos multi-dominio personalizados.

## Capacidades

- Puntuación de respuestas de asistentes en múltiples dimensiones de calidad: coherencia, sentido común, empatía y multiculturalidad.
- Generación de una puntuación de preferencia única mediante gating condicionado al prompt.
- Cálculo de un vector de gating compartido para pares de preferencia, lo que permite comparar dos respuestas de forma consistente.
- Soporte de clasificación de textos (pipeline `text-classification`).
- Compatible con el ecosistema Transformers y con endpoints de inferencia de texto (Text Embeddings Inference).
- No es un modelo generativo: no produce texto, solo puntúa secuencias completas.

## Casos de uso

- Recompensa en RLHF: el modelo puede usarse como reward model en pipelines de RLHF para alinear un LLM con preferencias humanas. Su puntuación multi-dominio permite premiar respuestas que no solo sean útiles, sino también coherentes, empáticas y culturalmente adecuadas. Se integraría en el bucle de entrenamiento reemplazando a un RM genérico.
- Reranking de respuestas en sistemas de generación: en un sistema que genera múltiples candidatos con un LLM, el modelo puntúa cada candidato y selecciona el mejor según las cuatro dimensiones. Es adecuado para aplicaciones de chat donde la calidad percibida depende de más que la utilidad factual.
- Evaluación offline de alineación: permite comparar dos versiones de un asistente (por ejemplo, antes y después de un fine-tuning) puntuando un conjunto fijo de prompts y respuestas y comparando las puntuaciones agregadas.
- Filtrado de datos de entrenamiento: en la preparación de datasets de SFT o RLHF, el modelo puede puntuar pares de respuestas generadas y descartar aquellas con baja coherencia o empatía, mejorando la calidad de los datos antes del entrenamiento.
- Selección de mejores respuestas en pipelines de datos sintéticos: cuando se generan datos sintéticos con un LLM y se necesita elegir la mejor respuesta para un prompt, el modelo actúa como evaluador automático multi-dominio.
- Auditoría de sesgos en respuestas multiculturales: gracias a su dominio específico de calidad multicultural, el modelo puede detectar respuestas que ignoran o malinterpretan contextos culturales, útil en sistemas de moderación o revisión de contenido.

## Benchmarks y rendimiento

El autor proporciona resultados sobre un test set multi-dominio separado:

| Metrica | Resultado |
|---|---|
| Test accuracy (%) | 86.86 |
| Scoring Spearman | 0.7108 |
| Coherence accuracy | 75.84 % |
| Commonsense accuracy | 97.58 % |
| Empathy accuracy | 92.88 % |
| Multicultural accuracy | 74.34 % |

Comparativa dentro de la colección `multi-domain-rm` (todos con la misma metodología):

| Modelo | Base | Test accuracy (%) | Scoring Spearman |
|---|---|---|---|
| multi-domain-rm-fsfairx-gemma-2-9b-it | FsfairX-Gemma2-RM | 88.01 | 0.7346 |
| multi-domain-rm-skywork-qwen-3-8b-it | Skywork-Reward-V2-Qwen3-8B | 87.82 | 0.7156 |
| multi-domain-rm-fsfairx-llama-3-8b-it (este modelo) | FsfairX-LLaMA3-RM | 86.86 | 0.7108 |
| multi-domain-rm-skywork-llama-3.1-8b-it | Skywork-Reward-V2-Llama-3.1-8B | 86.82 | 0.7264 |
| multi-domain-rm-mistral-7b-it | RM-Mistral-7B | 84.41 | 0.6710 |
| multi-domain-rm-qwen-3-nemotron-8b-it | Qwen3-Nemotron-8B-BRRM | 83.65 | 0.6704 |

No se han publicado resultados en benchmarks estándar como RewardBench en la información proporcionada.

## Requisitos de hardware

- VRAM estimada: el modelo tiene 7.5B parámetros. En bfloat16 (2 bytes por parámetro) requiere aproximadamente 15 GB de VRAM para inferencia. En 8-bit cuantización se reduce a unos 7.5 GB; en 4-bit a unos 4 GB, aunque no se han verificado cuantizaciones oficiales.
- GPUs recomendadas: una GPU con al menos 16 GB de VRAM para bfloat16 (por ejemplo, RTX 4090, A100 40GB, H100). Con cuantización de 8-bit puede funcionar en GPUs de 8 GB como RTX 2080 Ti o RTX 3070.
- Compatibilidad con consumer GPUs: sí, con cuantización o usando CPU offloading, pero con latencia alta. En bfloat16 completo, una RTX 3090 o 4090 es suficiente.
- Opciones de despliegue: el modelo usa código personalizado de Transformers, por lo que es compatible con `transformers` y `text-embeddings-inference`. No se menciona compatibilidad directa con vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponible en la información del modelo.

## Comparativa con modelos similares

| Modelo | Base | Parametros | Test accuracy | Spearman | Licencia |
|---|---|---|---|---|---|
| multi-domain-rm-fsfairx-gemma-2-9b-it | FsfairX-Gemma2-RM | 9B | 88.01 % | 0.7346 | no disponible |
| multi-domain-rm-skywork-qwen-3-8b-it | Skywork-Reward-V2-Qwen3-8B | 8B | 87.82 % | 0.7156 | no disponible |
| **multi-domain-rm-fsfairx-llama-3-8b-it** | **FsfairX-LLaMA3-RM** | **7.5B** | **86.86 %** | **0.7108** | **no disponible** |
| multi-domain-rm-skywork-llama-3.1-8b-it | Skywork-Reward-V2-Llama-3.1-8B | 8B | 86.82 % | 0.7264 | no disponible |

El modelo se sitúa en la parte media de la colección: supera a los basados en Mistral-7B y Qwen-3-Nemotron-8B, pero queda por debajo de las variantes basadas en Gemma-2-9B y Skywork-Qwen-3-8B en precisión, aunque su Spearman es superior al de la variante Skywork-Llama-3.1-8B. La elección entre ellos dependerá de la base de preferencias de cada uno y de la compatibilidad con el framework de despliegue.

## Limitaciones y advertencias

- No es un asistente conversacional: es un reward model y no genera texto. Intentar usarlo como chat producirá resultados incorrectos.
- Las puntuaciones son relativas y no calibradas: están diseñadas para comparar respuestas dentro de un mismo prompt, no como probabilidades universales ni valores de utilidad absolutos.
- El modelo solo cubre inglés: su rendimiento en otros idiomas no está validado y probablemente degrade.
- Sesgos heredados: al estar basado en Llama-3-8B y entrenado con datos de preferencias, puede reflejar sesgos de género, raza o cultura presentes en los datos de entrenamiento.
- Riesgo de alucinación en la puntuación: el modelo puede asignar puntuaciones altas a respuestas factualmente incorrectas si estas son coherentes y empáticas; no es un verificador de hechos.
- La licencia del modelo no está especificada: aunque el código del proyecto es Apache-2.0, la licencia de los pesos no se indica, por lo que se debe contactar al autor antes de uso comercial.
- Requiere `trust_remote_code=True`: el código personalizado de la arquitectura se ejecuta de forma remota, lo que implica un riesgo de seguridad si el repositorio se ve comprometido.
- No se recomienda como decisión única en escenarios de alto impacto: el autor advierte que debe calibrarse para cada caso de uso y no usarse como único criterio en decisiones importantes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mario-rc/multi-domain-rm-fsfairx-llama-3-8b-it
- Colección de modelos multi-dominio: https://huggingface.co/collections/mario-rc/multi-domain-rm
- Repositorio del proyecto: https://github.com/Mario-RC/multi-domain-reward-model
- Repositorio de datos de entrenamiento: https://github.com/mestecha/multidomain_data_scoring
- Modelo base: https://huggingface.co/sfairXC/FsfairX-LLaMA3-RM-v0.1
- Paper de referencia (ArmoRM, multi-objective reward): https://arxiv.org/abs/2406.12845
