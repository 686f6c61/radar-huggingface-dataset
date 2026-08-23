# mario-rc/multi-domain-rm-skywork-qwen-3-8b-it

## Resumen

El modelo `multi-domain-rm-skywork-qwen-3-8b-it`, desarrollado por Mario-RC, es un reward model (modelo de recompensa) multi-dominio construido sobre el base `Skywork/Skywork-Reward-V2-Qwen3-8B`. Su propósito es puntuar y comparar respuestas de asistentes considerando múltiples dimensiones de calidad —coherencia, sentido común, empatía y multiculturalidad— en lugar de una única puntuación genérica de utilidad. Para ello combina 23 objetivos de regresión fina con una red de gating condicionada al prompt que produce una puntuación de preferencia única.

El modelo se enmarca en el proyecto `multi-domain-reward-model` y se basa en el enfoque de ArmoRM/RLHFlow, adaptado a atributos personalizados. Está pensado para reward modeling, ranking de preferencias, reranking y evaluación de alineación offline en datos de chat. Su arquitectura es un transformer de 8.000 millones de parámetros (7.568.763.945 en total) y el checkpoint se distribuye en formato safetensors, con código personalizado que requiere `trust_remote_code=True`.

La relevancia actual reside en que ofrece una evaluación más matizada que los reward models genéricos, permitiendo ajustar sistemas de RLHF a necesidades específicas de calidad. Aunque su idioma declarado es el inglés, puede aplicarse a otros idiomas con rendimiento variable. El repositorio incluye comparativas con otros seis modelos de recompensa multi-dominio de la misma familia.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3-8B) con red de gating condicionada al prompt |
| Parametros totales | 7.568.763.945 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (base Qwen3-8B, pero no especificado en la documentación) |
| Tipos de cuantizacion | no disponible (formato safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible (el código del proyecto se libera bajo licencia A, pero la licencia del modelo no está especificada) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte del checkpoint `Skywork/Skywork-Reward-V2-Qwen3-8B`, un reward model de 8B parámetros desarrollado por Skywork. Sobre él se añade una arquitectura personalizada `RewardModelWithGating` que combina 23 objetivos de regresión fina distribuidos en cuatro dominios: coherencia, sentido común, empatía y calidad multicultural. Una red de gating, condicionada al prompt, se computa una sola vez y se reutiliza para ambas respuestas de cada par de preferencia, lo que reduce coste computacional y mantiene coherencia en la comparación.

El entrenamiento se realizó con datos del proyecto `multidomain_data_scoring`, que incluye los datasets `Multi-Domain-Data-Scoring` y `Multi-Domain-Data-Preference-Pairs-SharedGate`. No se detalla el número de tokens ni la composición exacta del dataset, pero se menciona que el enfoque se basa en ArmoRM/RLHFlow. No se especifica si se aplicó RLHF o DPO adicional; el modelo funciona como reward model para ser usado en pipelines de RLHF o evaluación.

## Capacidades

- Puntuación de respuestas de asistentes en una escala de preferencia, no como probabilidad calibrada.
- Evaluación multi-dominio: coherencia, sentido común, empatía y multiculturalidad.
- Ranking de pares de respuestas (chosen/rejected) para entrenamiento de preferencias.
- Reranking de respuestas generadas por otros modelos.
- Integración con pipelines de RLHF y evaluación offline de chatbots.
- Soporte de gating condicionado al prompt, que permite adaptar la importancia de cada atributo según la consulta.
- No genera texto; es un modelo de clasificación (text-classification) para puntuación.
- No soporta tool calling ni agentes, ya que no es un modelo generativo.

## Casos de uso

- **Entrenamiento de RLHF**: el modelo puede usarse como reward model para optimizar políticas de chat mediante PPO o DPO. Su capacidad de evaluar múltiples dimensiones permite alinear el modelo con criterios específicos de calidad (empatía, multiculturalidad) más allá de la utilidad genérica.
- **Reranking de respuestas en sistemas de QA**: dado un conjunto de candidatas generadas por un LLM, el modelo las puntúa y selecciona la mejor según los atributos multi-dominio, mejorando la calidad final en entornos de producción.
- **Evaluación de alineación offline**: para auditar modelos antes de su despliegue, se pueden puntuar respuestas de un asistente en un conjunto de test y comparar con las puntuaciones de un modelo de referencia.
- **Análisis de calidad de datos**: permite filtrar datasets de entrenamiento de chat, seleccionando respuestas que superen un umbral en las dimensiones de coherencia, empatía o multiculturalidad.
- **Comparación de modelos**: se puede usar como métrica de evaluación para comparar la calidad de dos sistemas de chat, aplicando el mismo prompt y comparando las puntuaciones de sus respuestas.
- **Ajuste de sistemas de moderación**: puntuar respuestas para detectar falta de empatía o problemas de multiculturalidad en asistentes dirigidos a audiencias diversas.

## Benchmarks y rendimiento

El modelo presenta resultados en un conjunto de test multi-dominio retenido, reportados en la model card:

| Metrica | Resultado |
|---|---|
| Test accuracy (%) | 87.82 |
| Scoring Spearman | 0.7156 |
| Coherence accuracy (%) | 76.75 |
| Commonsense accuracy (%) | 97.23 |
| Empathy accuracy (%) | 92.16 |
| Multicultural accuracy (%) | 79.83 |

Además, se comparan con otros modelos de su familia en la misma tabla de la model card:

| Modelo | Base reward model | Test accuracy (%) | Scoring Spearman |
|--------|-------------------|-------------------|------------------|
| `multi-domain-rm-fsfairx-gemma-2-9b-it` | sfairXC/FsfairX-Gemma2-RM-v0.1 | **88.01** | 0.7346 |
| `multi-domain-rm-skywork-qwen-3-8b-it` | Skywork/Skywork-Reward-V2-Qwen3-8B | **87.82** | 0.7156 |
| `multi-domain-rm-fsfairx-llama-3-8b-it` | sfairXC/FsfairX-LLaMA3-RM-v0.1 | **86.86** | 0.7108 |
| `multi-domain-rm-skywork-llama-3.1-8b-it` | Skywork/Skywork-Reward-V2-Llama-3.1-8B | **86.82** | 0.7264 |
| `multi-domain-rm-mistral-7b-it` | weqweasdas/RM-Mistral-7B | **84.41** | 0.6710 |
| `multi-domain-rm-qwen-3-nemotron-8b-it` | nvidia/Qwen3-Nemotron-8B-BRRM | **83.65** | 0.6704 |

No se dispone de resultados en benchmarks estándar como MMLU, HumanEval o GSM8K, ya que el modelo no está diseñado para tareas de generación.

## Requisitos de hardware

- **VRAM estimada**: para inferencia en bfloat16 (pesos de 16 bits) se requieren aproximadamente 15-16 GB de VRAM, dado que el modelo tiene ~7.57B parámetros. Con cuantización (GGUF Q4_K_M) podría reducirse a ~5-6 GB, pero no hay cuantizaciones publicadas.
- **GPU recomendadas**: NVIDIA A100, H100, RTX 4090 o RTX 6000 Ada con 24 GB o más para bfloat16. Para cuantización, una RTX 3090/4090 con 24 GB sería suficiente.
- **Cabe en consumer GPU**: sí, con cuantización (no disponible) o con bfloat16 en GPUs de 24 GB (RTX 3090/4090). Sin cuantización, en GPUs de 16 GB (RTX 4080) podría ser ajustado, pero no se garantiza.
- **Opciones de despliegue**: se puede usar con Hugging Face Transformers (requiere `trust_remote_code=True`). No hay soporte oficial para vLLM, llama.cpp, Ollama o TGI en la documentación, pero al ser un modelo de recompensa, no se suele desplegar como servicio de chat; se usa en pipelines de entrenamiento o evaluación.
- **Latencia y throughput**: no se han publicado datos. Al ser un modelo de 8B en bfloat16, se espera una latencia de unos 10-20 ms por muestra en una GPU A100, pero no es confirmado.

## Comparativa con modelos similares

La tabla anterior (Benchmarks) ya muestra la comparación con otros modelos multi-dominio de la misma familia, todos con 8B parámetros (excepto Mistral-7B). Se comparan en test accuracy y Spearman, siendo el modelo FsfairX-Gemma2-9B el mejor en accuracy, aunque el modelo basado en Qwen3-8B tiene un rendimiento muy cercano. La principal diferencia está en el modelo base y en los datos de entrenamiento, pero no se detallan otras diferencias.

En cuanto a alternativas externas, no se han encontrado en la búsqueda web otros reward models multi-dominio comparables fuera de esta familia. Se recomienda revisar los modelos de Skywork (Skywork-Reward-V2) y ArmoRM para más opciones.

## Limitaciones y advertencias

- **No es un asistente de chat**: es un reward model que solo produce puntuaciones, no genera texto.
- **Puntuaciones relativas**: los scores solo tienen sentido para comparar respuestas dentro del mismo prompt; no son probabilidades calibradas ni utilidad universal.
- **Dependencia del idioma**: entrenado principalmente en inglés, el rendimiento puede degradarse en otros idiomas o en dominios no representados.
- **Sesgos heredados**: el modelo hereda sesgos de su base (Qwen3-8B) y de los datos de entrenamiento; no debe usarse como único decisor en escenarios de alto impacto (ej. moderación de contenido, decisiones legales).
- **Licencia no definida**: la licencia del modelo no está especificada, solo el código del proyecto se libera bajo licencia A. Esto puede limitar su uso comercial sin aclaración.
- **Requisitos de código personalizado**: se necesita `trust_remote_code=True`, lo que implica ejecutar código de terceros y puede presentar riesgos de seguridad en entornos aislados.
- **Contexto no documentado**: no se informa la longitud máxima de contexto, aunque se asume la del modelo base (Qwen3-8B), pero no es seguro.

## Enlaces

- [Hugging Face - mario-rc/multi-domain-rm-skywork-qwen-3-8b-it](https://huggingface.co/mario-rc/multi-domain-rm-skywork-qwen-3-8b-it)
- [Colección multi-domain-rm de mario-rc](https://huggingface.co/collections/mario-rc/multi-domain-rm)
- [Repositorio GitHub del proyecto](https://github.com/Mario-RC/multi-domain-reward-model)
- [Repositorio GitHub de Skywork (base del modelo)](https://github.com/SkyworkAI/Skywork)
- [Modelo base en ModelScope (Skywork-Reward-V2-Qwen3-0.6B, referencia)](https://www.modelscope.cn/models/Skywork/Skywork-Reward-V2-Qwen3-0.6B)
- [Dataset RLHFlow/UltraFeedback-preference-standard](https://huggingface.co/datasets/RLHFlow/UltraFeedback-preference-standard)
- [Dataset allenai/reward-bench](https://huggingface.co/datasets/allenai/reward-bench)
