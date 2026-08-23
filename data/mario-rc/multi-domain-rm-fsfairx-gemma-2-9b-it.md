# mario-rc/multi-domain-rm-fsfairx-gemma-2-9b-it

## Resumen

`mario-rc/multi-domain-rm-fsfairx-gemma-2-9b-it` es un modelo de recompensa (reward model) multi-dominio desarrollado por Mario-RC a partir del modelo base `sfairXC/FsfairX-Gemma2-RM-v0.1`. En lugar de ofrecer una única puntuación de utilidad genérica, combina 23 objetivos de regresión fina que abarcan coherencia, sentido común, empatía y calidad de respuesta multicultural, y los integra mediante una red de puerta condicionada al prompt para producir una única puntuación de preferencia. Está diseñado para evaluar y comparar respuestas de asistentes cuando se requiere tener en cuenta múltiples dimensiones de calidad, no solo una métrica global.

Con 9.242 millones de parámetros y una arquitectura basada en Gemma 2 de 9B, este modelo se presenta como una alternativa a los reward models clásicos de una sola dimensión, aportando un enfoque más matizado para la alineación offline y el ranking de preferencias. Su relevancia actual radica en la creciente necesidad de evaluar de forma granular las respuestas generadas por IA en entornos de producción, especialmente en tareas de reranking y ajuste por retroalimentación humana (RLHF).

La distribución incluye código personalizado en Transformers, por lo que requiere `trust_remote_code=True`. Está pensado para uso en investigación y desarrollo de sistemas de alineación, y no como un asistente conversacional autónomo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Gemma 2 (transformers) con cabeza de reward model y red de gating condicionada al prompt |
| Parámetros totales | 9.242.023.465 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en el checkpoint `sfairXC/FsfairX-Gemma2-RM-v0.1`, que a su vez deriva de la arquitectura Gemma 2 de 9B. Sobre esta base se añade una red de puerta compartida que se calcula a partir del prompt y se reutiliza para ambas respuestas de un par de preferencias. La arquitectura completa, denominada `RewardModelWithGating`, es personalizada y se distribuye con el repositorio.

El entrenamiento se realizó con datos del proyecto `multidomain_data_scoring`, que incluye conjuntos como `Multi-Domain-Data-Scoring` y `Multi-Domain-Data-Preference-Pairs-SharedGate`. No se detalla el número total de tokens ni el proceso de optimización (por ejemplo, si se usó RLHF o DPO), pero se trata de un modelo de regresión con 23 objetivos finos y una combinación ponderada mediante el gating. La metodología se basa en el enfoque ArmoRM/RLHFlow adaptado a estos atributos específicos.

## Capacidades

- Puntuación de respuestas según múltiples dimensiones de calidad (coherencia, sentido común, empatía y calidad multicultural).
- Generación de una única puntuación de preferencia combinando los 23 atributos mediante una red de puerta condicionada al prompt.
- Uso para ranking de preferencias y reranking de respuestas en sistemas de chat.
- Evaluación offline de alineación de modelos de lenguaje.
- Comparación relativa entre dos respuestas para un mismo prompt (la puntuación solo es significativa dentro de un mismo prompt).
- No es un modelo generativo: no produce texto, solo devuelve una puntuación numérica.

## Casos de uso

- Evaluación de sistemas de chat en producción: el modelo puede puntuar respuestas de un asistente según coherencia y calidad multicultural, permitiendo monitorizar la calidad de las respuestas en entornos reales.
- Reranking en pipelines de generación: en un sistema de generación con múltiples candidatos, se puede usar para seleccionar la respuesta de mayor calidad según los criterios entrenados.
- Ajuste de preferencias en RLHF: como modelo de recompensa, puede guiar el entrenamiento de políticas de lenguaje para optimizar la calidad en múltiples dominios.
- Análisis de sesgos en respuestas: dado que incluye una dimensión multicultural, puede ayudar a detectar respuestas que fallan en ese aspecto.
- Comparación de modelos en investigación: para evaluar qué modelo produce respuestas más coherentes o empáticas en un conjunto de prompts.
- Filtrado de datos para entrenamiento: puede usarse para seleccionar pares de preferencia de alta calidad en datasets de chat, mejorando la calidad del entrenamiento de otros modelos.

## Benchmarks y rendimiento

Resultados en el conjunto de test multi-dominio (reportados por el autor):

| Métrica | Resultado |
|---|---|
| Precisión de test (%) | 88.01 |
| Spearman de puntuación | 0.7346 |
| Precisión de coherencia (%) | 78.35 |
| Precisión de sentido común (%) | 96.76 |
| Precisión de empatía (%) | 93.91 |
| Precisión multicultural (%) | 77.36 |

No se han publicado comparaciones con otros reward models en la información disponible, salvo la tabla de la colección que se muestra en la sección de comparativa.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 18 GB (para el modelo completo de 9B en precisión media).
- Con cuantización de 8 bits, se puede reducir a unos 9-10 GB; con 4 bits, a unos 5-6 GB, aunque no se han probado oficialmente.
- GPUs recomendadas: NVIDIA A100 (40 GB), RTX 4090 (24 GB) o similares para inferencia en bf16 sin problemas de memoria.
- Es posible ejecutarlo en GPUs de consumo como la RTX 3090 (24 GB) con cuantización.
- Despliegue con Transformers y `trust_remote_code=True`. No se mencionan compatibilidades con vLLM, llama.cpp u otras herramientas; se recomienda el uso directo con la librería de Transformers.
- La latencia y el throughput no están publicados, pero al ser un modelo de 9B, la inferencia puede ser del orden de decenas de milisegundos por muestra en una A100.

## Comparativa con modelos similares

El autor publica una comparativa en su colección de modelos multi-domain reward:

| Modelo | Base reward model | Precisión test (%) | Spearman |
|---|---|---|---|
| **multi-domain-rm-fsfairx-gemma-2-9b-it** | sfairXC/FsfairX-Gemma2-RM-v0.1 | 88.01 | 0.7346 |
| multi-domain-rm-skywork-qwen-3-8b-it | Skywork/Skywork-Reward-V2-Qwen3-8B | 87.82 | 0.7156 |
| multi-domain-rm-fsfairx-llama-3-8b-it | sfairXC/FsfairX-LLaMA3-RM-v0.1 | 86.86 | 0.7108 |
| multi-domain-rm-skywork-llama-3.1-8b-it | Skywork/Skywork-Reward-V2-Llama-3.1-8B | 86.82 | 0.7264 |
| multi-domain-rm-mistral-7b-it | weqweasdas/RM-Mistral-7B | 84.41 | 0.6710 |
| multi-domain-rm-qwen-3-nemotron-8b-it | nvidia/Qwen3-Nemotron-8B-BRRM | 83.65 | 0.6704 |

Este modelo obtiene la mejor precisión en el test entre los comparados, con un Spearman ligeramente inferior al del modelo basado en Llama-3.1.

## Limitaciones y advertencias

- Es un reward model, no un asistente conversacional. No debe usarse como modelo generativo.
- Las puntuaciones son relativas y no están calibradas como probabilidades o valores de utilidad universal. Solo son comparables dentro de un mismo prompt.
- El modelo está entrenado principalmente en inglés, por lo que su rendimiento en otros idiomas puede ser limitado.
- Puede heredar sesgos de su base (Gemma 2) y de los datos de entrenamiento. No debe utilizarse como único decisor en escenarios de alto impacto.
- La licencia del modelo no está especificada, aunque el código del proyecto se distribuye bajo Apache-2.0. Se debe consultar con el autor antes de usar en entornos comerciales.
- Se requiere `trust_remote_code=True` para cargar el modelo, lo que implica ejecutar código externo. Se recomienda revisar el repositorio antes de su uso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mario-rc/multi-domain-rm-fsfairx-gemma-2-9b-it
- Colección de modelos multi-domain: https://huggingface.co/collections/mario-rc/multi-domain-rm
- Repositorio del proyecto: https://github.com/Mario-RC/multi-domain-reward-model
- Repositorio de datos de entrenamiento: https://github.com/mestecha/multidomain_data_scoring
