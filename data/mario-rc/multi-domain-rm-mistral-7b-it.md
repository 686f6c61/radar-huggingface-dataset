# mario-rc/multi-domain-rm-mistral-7b-it

## Resumen

`mario-rc/multi-domain-rm-mistral-7b-it` es un modelo de recompensa (reward model) multi-dominio desarrollado por mario-rc, construido a partir del modelo base [`weqweasdas/RM-Mistral-7B`](https://huggingface.co/weqweasdas/RM-Mistral-7B). Su objetivo es evaluar respuestas de asistentes según 23 atributos finos agrupados en cuatro dominios: coherencia, sentido común, empatía y calidad multicultural, combinados mediante una red de gating condicionada por el prompt para producir una única puntuación de preferencia.

A diferencia de un reward model genérico que asigna una puntuación única de utilidad, este modelo permite una evaluación más matizada, capturando matices específicos de cada dominio. Se basa en la arquitectura de ArmoRM/RLHFlow, adaptada con un mecanismo de gating compartido que se calcula una vez sobre el prompt y se reutiliza para ambas respuestas de cada par de preferencia. El checkpoint requiere `trust_remote_code=True` por incluir código personalizado en Transformers.

Con 7.111 millones de parámetros, es un modelo de tamaño medio, adecuado para tareas de recompensa y reranking en pipelines de RLHF. Su relevancia actual radica en la creciente demanda de evaluadores de preferencias más finos y contextualizados, que capten dimensiones como la empatía o la sensibilidad multicultural, poco presentes en los reward models convencionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RewardModelWithGating (código personalizado sobre base Mistral-7B) |
| Parametros totales | 7.111.022.633 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (hereda del base, pero no especificado) |
| Tipos de cuantizacion | No disponible (solo safetensors en bfloat16) |
| Idiomas soportados | Inglés (en) |
| Licencia | No disponible (el código del proyecto es Apache-2.0, el checkpoint no especifica) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura se basa en el modelo de recompensa `RM-Mistral-7B` (weq9weasdas), al que se añade una cabeza de regresión múltiple con 23 objetivos finos y una red de gating condicionada por el prompt. El mecanismo clave es el `shared-prompt-gating`: se calcula un vector de gating a partir del prompt (sin la respuesta) y se reutiliza para ambas respuestas del par, de modo que la comparación sea consistente. Esto permite que el modelo pondere dinámicamente la importancia de cada dominio según el contexto del prompt.

El entrenamiento se realizó sobre datos del proyecto `multidomain_data_scoring`, concretamente los conjuntos `Multi-Domain-Data-Scoring` y `Multi-Domain-Data-Preference-Pairs-SharedGate`. También se citan los datasets `RLHFlow/UltraFeedback-preference-standard` y `allenai/reward-bench` en los metadatos de HuggingFace. No se especifica el número exacto de tokens de entrenamiento ni el método de alineación (RLHF, DPO, etc.), aunque por ser un reward model se asume entrenamiento por regresión sobre preferencias.

## Capacidades

- **Puntuación de preferencias multi-dominio**: asigna una puntuación única a una respuesta, pero basada en 23 atributos finos (coherencia, sentido común, empatía, multiculturalidad).
- **Gating condicionado por prompt**: el vector de gating se calcula solo con el prompt, permitiendo adaptar la importancia de cada dominio según la conversación.
- **Recompensa para RLHF**: se puede usar como señal de recompensa para entrenar modelos de lenguaje mediante RLHF.
- **Reranking**: dado un conjunto de respuestas candidatas, puede ordenarlas por calidad según el contexto.
- **Evaluación offline de alineación**: permite evaluar respuestas generadas por asistentes en múltiples dimensiones de calidad.
- **Comparación por pares**: dado un par (chosen, rejected), produce dos puntuaciones para comparar, útil para datos de preferencia.

## Casos de uso

- **Entrenamiento de RLHF**: como modelo de recompensa en pipelines de PPO o ReMax, puntuando respuestas generadas por el modelo de política para guiar el optimizador.
- **Reranking de respuestas en sistemas de chat**: un sistema puede generar varias respuestas candidatas y usar este modelo para seleccionar la mejor según el prompt y el contexto.
- **Evaluación de calidad de asistentes en producción**: medir la coherencia, el sentido común y la empatía de respuestas de un asistente conversacional de forma automatizada.
- **Investigación en alineación**: estudiar cómo diferentes dominios de calidad influyen en la preferencia humana, utilizando las 23 dimensiones para análisis de atributos.
- **Filtrado de datos de entrenamiento**: puntuar y filtrar pares de preferencia en la creación de datasets de RLHF, priorizando ejemplos con altas puntuaciones en los dominios relevantes.
- **Evaluación de sensibilidad multicultural**: dado el dominio multicultural, puede ayudar a detectar sesgos o falta de adecuación cultural en respuestas de modelos.

## Benchmarks y rendimiento

Según la model card, el rendimiento en el conjunto de test multi-dominio es el siguiente:

| Metrica | Resultado |
|---|---|
| Test accuracy (%) | 84.41 |
| Scoring Spearman | 0.6710 |
| Coherence accuracy (%) | 72.76 |
| Commonsense accuracy (%) | 93.42 |
| Empathy accuracy (%) | 91.63 |
| Multicultural accuracy (%) | 74.13 |

Comparación con otros modelos de la misma serie (según la model card):

| Modelo | Test accuracy (%) | Scoring Spearman |
|---|---|---|
| multi-domain-rm-fsfairx-gemma-2-9b-it | 88.01 | 0.7346 |
| multi-domain-rm-skywork-qwen-3-8b-it | 87.82 | 0.7156 |
| multi-domain-rm-fsfairx-llama-3-8b-it | 86.86 | 0.7108 |
| multi-domain-rm-skywork-llama-3.1-8b-it | 86.82 | 0.7264 |
| **multi-domain-rm-mistral-7b-it** | **84.41** | **0.6710** |
| multi-domain-rm-qwen-3-nemotron-8b-it | 83.65 | 0.6704 |

No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GSM8K, ya que no es un modelo de generación sino de recompensa.

## Requisitos de hardware

- **VRAM estimada**: al tener 7.111 millones de parámetros y cargar en bfloat16, se necesitan aproximadamente 14 GB de VRAM para inferencia sin cuantización (cálculo estándar para 7B). No hay datos oficiales del autor.
- **GPU recomendadas**: se puede ejecutar en GPUs consumer como RTX 3090, RTX 4090 (24 GB) o en GPUs profesionales como A10, A100, H100.
- **Compatibilidad con consumer GPU**: sí, con 24 GB de VRAM se puede cargar en bfloat16; con cuantización de 8 bits cabría en 12-16 GB, pero no hay cuantizaciones publicadas.
- **Opciones de despliegue**: al ser un modelo de Transformers con código personalizado, se puede usar con la librería Transformers, vLLM (si se adapta el código), o en servicios de inferencia compatibles con `text-embeddings-inference` (indicado en los tags). No se documenta soporte para llama.cpp u Ollama.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

Este modelo se compara con otros de la misma familia multi-domain reward model desarrollados por el mismo autor, que parten de diferentes bases de reward model. La tabla anterior muestra que este modelo (basado en Mistral-7B) obtiene menor precisión que los basados en Gemma-2-9B, Qwen-3-8B o LLaMA-3, pero supera al basado en Qwen3-Nemotron-8B. No se proporcionan comparativas con reward models estándar como ArmoRM o Skywork-Reward-V2.

## Limitaciones y advertencias

- **No es un asistente de chat**: es un modelo de recompensa; no genera texto ni mantiene conversaciones.
- **Puntuaciones relativas**: las puntuaciones solo son comparativas dentro del mismo prompt; no son probabilidades calibradas ni valores universales de utilidad.
- **Idioma**: solo entrenado en inglés, por lo que su rendimiento en otros idiomas es desconocido y probablemente inferior.
- **Sesgos heredados**: hereda sesgos del modelo base Mistral-7B y de los datos de entrenamiento; no debe usarse como decisor único en entornos de alto impacto.
- **Dependencia del código personalizado**: requiere `trust_remote_code=True` y el mecanismo de gating compartido debe usarse correctamente (calcular el gate una vez y reutilizarlo) para obtener resultados válidos.
- **Licencia incierta**: el código del proyecto es Apache-2.0, pero la licencia del checkpoint no está especificada; se debe verificar antes de uso comercial.
- **Distribución limitada**: el modelo se ha entrenado con datos de dominios específicos (coherencia, sentido común, empatía, multicultural), por lo que puede no generalizar a otros dominios o tareas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mario-rc/multi-domain-rm-mistral-7b-it
- Colección de modelos multi-dominio: https://huggingface.co/collections/mario-rc/multi-domain-rm
- Repositorio del proyecto: https://github.com/Mario-RC/multi-domain-reward-model
- Repositorio de datos de entrenamiento (referenciado en la model card): https://github.com/mestecha/multidomain_data_scoring
