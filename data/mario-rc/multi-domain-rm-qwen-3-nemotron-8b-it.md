# mario-rc/multi-domain-rm-qwen-3-nemotron-8b-it

## Resumen

`mario-rc/multi-domain-rm-qwen-3-nemotron-8b-it` es un modelo de recompensa (reward model) multi-dominio desarrollado por Mario-RC, construido a partir del modelo base `nvidia/Qwen3-Nemotron-8B-BRRM`. A diferencia de los reward models convencionales que producen una única puntuación de utilidad, este modelo combina 23 objetivos de regresión fina distribuidos en cuatro dominios —coherencia, sentido común, empatía y calidad de respuesta multicultural— mediante una red de gating condicionada por el prompt, que genera una única puntuación de preferencia para cada par de respuestas.

El modelo está pensado para tareas de alineación y evaluación offline: reward modeling, ranking de preferencias, reranking y evaluación de calidad de respuestas en datos de chat. Es un modelo de clasificación de texto (text-classification) con pesos en formato safetensors y requiere `trust_remote_code=True` por su arquitectura personalizada `RewardModelWithGating`. Cuenta con aproximadamente 7.569 millones de parámetros y está entrenado exclusivamente en inglés.

Es relevante porque aborda una limitación práctica de los reward models convencionales: la evaluación de la calidad de una respuesta no depende únicamente de la utilidad genérica, sino de matices como la coherencia interna, el sentido común, la empatía o la adecuación cultural. Su arquitectura de gating compartido, que calcula una sola vez el vector de ponderación desde el prompt y lo reutiliza para ambas respuestas del par, permite una evaluación consistente y eficiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen3-Nemotron-8B-BRRM) con cabeza de regresión y red de gating condicionada por prompt |
| Parametros totales | 7.568.763.945 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (el modelo base Qwen3-Nemotron-8B soporta ventanas largas, pero no se especifica para este ajuste) |
| Tipos de cuantizacion | No disponible (los pesos se distribuyen en safetensors; no se publican variantes cuantizadas) |
| Idiomas soportados | en (ingles) |
| Licencia | No disponible (el codigo del proyecto se distribuye bajo Apache-2.0, pero la licencia del modelo no se especifica en la model card) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte del checkpoint `nvidia/Qwen3-Nemotron-8B-BRRM`, un reward model basado en Qwen3-Nemotron-8B-Instruct, y lo adapta con una arquitectura personalizada denominada `RewardModelWithGating`. Sobre el encoder se añaden 23 cabezas de regresión que puntúan atributos finos repartidos en cuatro dominios: coherencia, sentido común, empatía y multiculturalidad. Un red de gating condicionada por el prompt combina esas 23 puntuaciones en una única señal de preferencia. La clave técnica es que el vector de gating se computa una sola vez a partir del prompt y se reutiliza para ambas respuestas del par, garantizando una comparación justa y eficiente.

El entrenamiento se realizó con datos del proyecto `multidomain_data_scoring`, que incluye los conjuntos `Multi-Domain-Data-Scoring` y `Multi-Domain-Data-Preference-Pairs-SharedGate`, además de los datasets públicos `RLHFlow/UltraFeedback-preference-standard` y `allenai/reward-bench`. El enfoque sigue la línea de ArmoRM/RLHFlow para reward modeling, pero adaptado a atributos multi-dominio personalizados. No se han publicado detalles sobre el número exacto de tokens de entrenamiento ni sobre el uso de técnicas como RLHF o DPO en este checkpoint concreto.

## Capacidades

- Evaluación de calidad de respuesta en cuatro dominios: coherencia, sentido común, empatía y multiculturalidad.
- Generación de una única puntuación de preferencia combinando las 23 puntuaciones finas mediante una red de gating condicionada por el prompt.
- Comparación de pares de respuestas (chosen vs. rejected) para ranking de preferencias.
- Reutilización del vector de gating para ambas respuestas del par, lo que permite comparaciones justas y eficientes.
- Soporte de inferencia con `transformers` mediante `trust_remote_code=True` y uso de `apply_chat_template` para tokenización.
- No es un asistente conversacional: no genera texto, solo emite una puntuación de calidad relativa.

## Casos de uso

- Reranking de respuestas en sistemas RAG: el modelo puede puntuar varias respuestas candidatas recuperadas o generadas para un mismo prompt y seleccionar la de mayor calidad según criterios de coherencia, sentido común y adecuación cultural.
- Evaluación offline de alineación de LLMs: permite comparar respuestas de diferentes versiones de un modelo o de distintos modelos sobre un mismo conjunto de prompts, detectando regresiones en dimensiones específicas como empatía o coherencia.
- Selección de pares preferidos para RLHF: integrable en pipelines de entrenamiento para generar preferencias sobre pares de respuestas, sustituyendo o complementando anotadores humanos.
- Filtrado de datasets de entrenamiento: puede puntuar respuestas de datasets masivos de chat y descartar aquellas con baja coherencia, sentido común o multiculturalidad, mejorando la calidad del conjunto de entrenamiento.
- Evaluación de calidad en sistemas de atención al cliente: permite puntuar la adecuación de respuestas automatizadas considerando empatía y multiculturalidad, algo que los reward models genéricos de utilidad suelen ignorar.
- Comparación de políticas de alineación: en experimentos de investigación, permite comparar el rendimiento de distintos métodos de alineación (DPO, PPO, etc.) mediante una métrica de recompensa multi-dominio en lugar de una única señal de utilidad.

## Benchmarks y rendimiento

La model card reporta los resultados sobre el conjunto de test multi-dominio retenido:

| Metrica | Resultado |
|---|---|
| Test accuracy (%) | 83.65 |
| Scoring Spearman | 0.6704 |
| Coherence accuracy (%) | 72.81 |
| Commonsense accuracy (%) | 96.21 |
| Empathy accuracy (%) | 89.99 |
| Multicultural accuracy (%) | 67.24 |

No se han publicado resultados de benchmarks estándar como MMLU, HumanEval o GSM8K, ya que este modelo no está diseñado para generación sino para scoring de respuestas.

## Requisitos de hardware

- VRAM estimada para inferencia: con 7.569 millones de parámetros, en bf16 los pesos ocupan aproximadamente 15,1 GB; con overhead de activaciones y atención, se recomienda al menos 16-20 GB de VRAM para inferencia en precisión completa.
- En cuantización de 8 bits (si se aplicara) se estima un consumo de 8-9 GB de VRAM; en 4 bits, entre 4-5 GB, aunque no se distribuyen oficialmente versiones cuantizadas.
- GPU recomendadas: NVIDIA A100 40GB, H100, RTX 4090 (24GB) o RTX 6000 Ada para inferencia en bf16 sin problemas.
- En GPUs de consumo como RTX 3060 (12GB) o RTX 4070 (12GB) solo sería viable con cuantización agresiva (4 bits) y secuencias cortas.
- Opciones de despliegue: al ser un modelo de `transformers` con código personalizado, se puede ejecutar con Hugging Face Transformers, vLLM (si soporta el código custom) o a través de `text-embeddings-inference` (indicado en los tags). También es posible usar `llama.cpp` si se convierte a GGUF, aunque no se distribuye en ese formato.
- Latencia y throughput: no se han publicado datos específicos de latencia o throughput para este checkpoint.

## Comparativa con modelos similares

La siguiente tabla compara este modelo con otros reward models multi-dominio de la misma colección de Mario RC, todos con la misma arquitectura de gating condicionada por prompt y entrenados con los mismos datos:

| Modelo | Modelo base | Test accuracy (%) | Scoring Spearman |
| :--- | :--- | :---: | :---: |
| multi-domain-rm-fsfairx-gemma-2-9b-it | sfairXC/FsfairX-Gemma2-RM-v0.1 | 88.01 | 0.7346 |
| multi-domain-rm-skywork-qwen-3-8b-it | Skywork/Skywork-Reward-V2-Qwen3-8B | 87.82 | 0.7156 |
| multi-domain-rm-fsfairx-llama-3-8b-it | sfairXC/FsfairX-LLaMA3-RM-v0.1 | 86.86 | 0.7108 |
| multi-domain-rm-skywork-llama-3.1-8b-it | Skywork/Skywork-Reward-V2-Llama-3.1-8B | 86.82 | 0.7264 |
| multi-domain-rm-mistral-7b-it | weqweasdas/RM-Mistral-7B | 84.41 | 0.6710 |
| multi-domain-rm-qwen-3-nemotron-8b-it | nvidia/Qwen3-Nemotron-8B-BRRM | 83.65 | 0.6704 |

Este modelo se sitúa en el último puesto de la colección en cuanto a precisión y correlación de Spearman. Las alternativas basadas en Gemma2-9B y Skywork-Qwen3-8B obtienen mejores resultados, por lo que si el objetivo es maximizar la precisión de scoring, conviene considerar esos checkpoints.

## Limitaciones y advertencias

- Es un reward model, no un asistente conversacional: no genera respuestas ni mantiene diálogos.
- Las puntuaciones son relativas y no están calibradas: no representan probabilidades ni valores de utilidad universales, sino una comparación dentro del mismo prompt.
- El rendimiento puede variar según el idioma, el tema y la distribución de los datos de entrada; solo se ha entrenado en inglés.
- Hereda los sesgos y limitaciones del modelo base `Qwen3-Nemotron-8B-BRRM` y de los datos de entrenamiento, que pueden reflejar sesgos de género, culturales o tópicos.
- No debe utilizarse como única fuente de decisión en aplicaciones de alto impacto (moderación, selección de personal, diagnóstico, etc.).
- La licencia del modelo no está especificada en la model card; aunque el código del proyecto se publica bajo Apache-2.0, es necesario confirmar la licencia de los pesos antes de un uso comercial.
- Requiere `trust_remote_code=True` en Transformers, lo que implica ejecutar código arbitrario del repositorio; conviene revisar el código antes de desplegarlo en entornos de producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mario-rc/multi-domain-rm-qwen-3-nemotron-8b-it
- Colección de modelos multi-dominio: https://huggingface.co/collections/mario-rc/multi-domain-rm
- Repositorio del proyecto: https://github.com/Mario-RC/multi-domain-reward-model
- Proyecto de datos multi-dominio: https://github.com/mestecha/multidomain_data_scoring
- Modelo base: https://huggingface.co/nvidia/Qwen3-Nemotron-8B-BRRM
- Familia de modelos NVIDIA Nemotron: https://developer.nvidia.com/topics/ai/nemotron
