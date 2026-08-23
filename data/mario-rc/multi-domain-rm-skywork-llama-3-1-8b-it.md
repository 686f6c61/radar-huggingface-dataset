# mario-rc/multi-domain-rm-skywork-llama-3.1-8b-it

## Resumen

`multi-domain-rm-skywork-llama-3.1-8b-it` es un modelo de recompensa (reward model) multi-dominio desarrollado por Mario-RC, construido a partir del modelo base `Skywork/Skywork-Reward-V2-Llama-3.1-8B`. Su propósito es puntuar y comparar respuestas de asistentes de chat evaluando simultáneamente 23 atributos de grano fino agrupados en cuatro dominios: coherencia, sentido común, empatía y calidad multicultural de la respuesta. Una red de gating condicionada por el prompt combina estos objetivos de regresión en una única puntuación de preferencia.

El modelo se enmarca en el proyecto de investigación `multi-domain-reward-model`, que adapta el enfoque de ArmoRM/RLHFlow a atributos personalizados. Su relevancia actual reside en que permite una evaluación de alineación más granular que los reward models genéricos de utilidad, especialmente útil para re-ranking, preferencia y evaluación offline de datos de chat. Está disponible en formato safetensors con soporte para Transformers y requiere `trust_remote_code=True` por su arquitectura personalizada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Reward model basado en Llama-3.1-8B con red de gating condicionada por prompt (23 objetivos de regresion) |
| Parametros totales | 7.505.283.113 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (hereda la ventana de Llama-3.1, no especificada por el autor) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte del checkpoint `Skywork/Skywork-Reward-V2-Llama-3.1-8B` y añade una arquitectura personalizada llamada `RewardModelWithGating`. Esta arquitectura combina 23 objetivos de regresion de grano fino distribuidos en cuatro dominios: coherencia, sentido comun, empatia y calidad multicultural de la respuesta. Una red de gating condicionada por el prompt produce un vector de pesos que se aplica a las 23 puntuaciones para obtener una puntuacion de preferencia unica. La puerta se computa una sola vez por prompt y se reutiliza para ambas respuestas de cada par de preferencia.

El entrenamiento se realizo con datos del proyecto `multidomain_data_scoring`, concretamente los conjuntos `Multi-Domain-Data-Scoring` y `Multi-Domain-Data-Preference-Pairs-SharedGate`. No se especifican detalles sobre el numero de tokens, la composicion exacta del dataset ni si se aplicaron tecnicas como RLHF o DPO, mas alla de la adaptacion del enfoque ArmoRM/RLHF para atributos multi-dominio. El modelo se publica con codigo personalizado de Transformers, por lo que es obligatorio usar `trust_remote_code=True` para cargarlo.

## Capacidades

- Puntuacion de respuestas de asistente en 23 atributos de calidad distribuidos en coherencia, sentido comun, empatia y multiculturalidad.
- Produccion de una puntuacion de preferencia unica combinando las 23 dimensiones mediante un gating condicionado por el prompt.
- Re-ranking de respuestas candidatas en sistemas de generacion de chat.
- Evaluacion offline de alineacion de modelos de lenguaje con datos estilo chat.
- Comparacion relativa de pares de respuestas (preferencia) dentro de un mismo prompt.
- Soporte de texto en ingles; no se documentan otros idiomas.
- No es un modelo de generacion de texto, sino de puntuacion y comparacion.

## Casos de uso

- **Re-ranking de respuestas en sistemas de RAG**: el modelo puede puntuar las respuestas generadas por un LLM antes de mostrarlas al usuario, seleccionando la que mejor combine coherencia y sentido comun. Su gating por prompt permite adaptar los pesos a la naturaleza de la consulta.
- **Evaluacion offline de alineacion**: en pipelines de evaluacion de modelos de chat, se puede usar para comparar respuestas de distintos checkpoints y medir la calidad multi-dominio, en lugar de una metrica unica de utilidad.
- **Seleccion de pares de preferencia para RLHF**: al puntuar respuestas generadas por un modelo, se pueden construir pares de preferencia (chosen/rejected) para entrenar modelos de politica con PPO o DPO. El gating compartido por prompt simplifica la puntuacion de pares.
- **Filtrado de datos de entrenamiento**: en pipelines de preparacion de datasets de chat, el modelo puede filtrar respuestas de baja calidad en dimensiones especificas como empatia o coherencia, mejorando la calidad del conjunto final.
- **Control de calidad en atencion al cliente**: puntuar respuestas generadas por asistentes virtuales para detectar respuestas poco empaticas o incoherentes antes de su despliegue. La dimension de empatia es especialmente util en este escenario.
- **Investigacion en preferencia de modelos**: para estudios de alineacion que requieren desglosar la calidad de una respuesta en atributos interpretables, el modelo ofrece una descomposicion en 23 dimensiones que facilita el analisis.

## Benchmarks y rendimiento

El autor publico resultados en el conjunto de test multi-dominio retenido:

| Metrica | Resultado |
|---|---|
| Test accuracy (%) | 86.82 |
| Scoring Spearman | 0.7264 |
| Coherence accuracy (%) | 75.59 |
| Commonsense accuracy (%) | 97.39 |
| Empathy accuracy (%) | 92.72 |
| Multicultural accuracy (%) | 74.99 |

No se han publicado resultados en benchmarks estandar como MMLU, HumanEval o GSM8K. La evaluacion se limita al conjunto de test propio del proyecto multi-dominio.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion publicada. Dado que el modelo tiene 7.5B parametros y se recomienda usar `torch.bfloat16`, se estima una huella de memoria de aproximadamente 15-16 GB en precision bfloat16 (sin cuantizacion).
- GPU recomendadas: tarjetas con al menos 16 GB de VRAM, como NVIDIA RTX 4090, A100 40GB o H100. En consumer GPU, una RTX 4090 seria suficiente para inferencia en bfloat16.
- Opciones de despliegue: el modelo usa codigo personalizado de Transformers, por lo que es compatible con la libreria `transformers` con `trust_remote_code=True`. No se documenta soporte explicito para vLLM, llama.cpp o TGI.
- Latencia y throughput: no disponibles. El modelo requiere dos pasadas por par de respuestas (una por candidato), reutilizando el gating del prompt.

## Comparativa con modelos similares

El autor publico una tabla comparativa con otros modelos de la misma familia (todos de ~8B parametros):

| Modelo | Base | Test accuracy (%) | Scoring Spearman |
|---|---|---|---|
| multi-domain-rm-fsfairx-gemma-2-9b-it | sfairXC/FsfairX-Gemma2-RM-v0.1 | 88.01 | 0.7346 |
| multi-domain-rm-skywork-qwen-3-8b-it | Skywork/Skywork-Reward-V2-Qwen3-8B | 87.82 | 0.7156 |
| multi-domain-rm-fsfairx-llama-3-8b-it | sfairXC/FsfairX-LLaMA3-RM-v0.1 | 86.86 | 0.7108 |
| **multi-domain-rm-skywork-llama-3.1-8b-it** | **Skywork/Skywork-Reward-V2-Llama-3.1-8B** | **86.82** | **0.7264** |
| multi-domain-rm-mistral-7b-it | weqweasdas/RM-Mistral-7B | 84.41 | 0.6710 |
| multi-domain-rm-qwen-3-nemotron-8b-it | nvidia/Qwen3-Nemotron-8B-BRRM | 83.65 | 0.6704 |

El modelo basado en Skywork-Llama-3.1 ofrece el segundo mejor Scoring Spearman de la familia (0.7264), aunque la variante basada en Gemma-2 alcanza mayor accuracy y Spearman. Todos comparten la misma arquitectura de gating multi-dominio.

## Limitaciones y advertencias

- Es un reward model, no un asistente de chat. No debe usarse como modelo generativo.
- Las puntuaciones son relativas dentro de un mismo prompt; no son probabilidades calibradas ni valores de utilidad universales.
- El modelo hereda sesgos y limitaciones de su modelo base (Skywork-Reward-V2-Llama-3.1-8B) y de los datos de entrenamiento.
- Solo soporta ingles; el rendimiento en otros idiomas no esta validado.
- La licencia no esta especificada, lo que limita el uso comercial sin consulta legal previa.
- Requiere `trust_remote_code=True` en Transformers, lo que implica ejecutar codigo personalizado no auditado.
- No se recomienda como unico criterio de decision en entornos de alto impacto; debe calibrarse para cada caso de uso.
- El tamaño del repositorio (30 GB) puede ser elevado para despliegues en entornos limitados.

## Enlaces

- HuggingFace: https://huggingface.co/mario-rc/multi-domain-rm-skywork-llama-3.1-8b-it
- Coleccion de modelos multi-dominio: https://huggingface.co/collections/mario-rc/multi-domain-rm
- Repositorio del proyecto: https://github.com/Mario-RC/multi-domain-reward-model
- Repositorio alternativo: https://github.com/Mario-RC/multidomain-reward-model
- Proyecto de datos de entrenamiento: https://github.com/mestecha/multidomain_data_scoring
