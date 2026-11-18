# JoaoBoer/muse_Llama-2-7b-hf_News_UNDIAL

## Resumen

muse_Llama-2-7b-hf_News_UNDIAL es un modelo derivado de Llama 2 7B obtenido mediante *unlearning* (desaprendizaje) sobre el conjunto de olvido MUSE-News. Lo publica el usuario JoaoBoer como parte de un proyecto de investigación sobre decodificación especulativa aplicada al desaprendizaje de pesos. El modelo parte del checkpoint `muse-bench/MUSE-news_target` y se entrena con el algoritmo UNDIAL dentro del framework open-unlearning.

El objetivo no es ofrecer un modelo de propósito general, sino servir como línea base de desaprendizaje a nivel de pesos y como modelo borrador (*draft*) en un esquema de decodificación especulativa. La idea subyacente es medir cuánto conocimiento del conjunto de olvido se elimina sin degradar en exceso el conocimiento retenido, evaluado con las métricas estándar de MUSE (ROUGE de olvido y retención, *extraction strength* y *privleak*).

Técnicamente es un transformer decoder-only de la familia Llama 2 con 6.738.415.616 parámetros (aproximadamente 6,7 mil millones). No se documentan en la información disponible la longitud de contexto, los idiomas soportados ni los detalles del dataset de entrenamiento más allá del conjunto MUSE-News. La licencia es Llama 2, lo que condiciona su uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2) |
| Parámetros totales | 6.738.415.616 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | llama2 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la de Llama 2 7B, un transformer decoder-only con atención causal estándar. El modelo no introduce cambios estructurales: el entrenamiento consiste en un ajuste de pesos sobre el checkpoint `muse-bench/MUSE-news_target` para inducir el olvido del conjunto MUSE-News. El método empleado es UNDIAL, ejecutado con el framework open-unlearning, con los hiperparámetros documentados en la model card: `gamma: 1.0`, `alpha: 1.0`, `beta: 10` y `retain_loss_type: NLL`.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset más allá del conjunto MUSE-News, ni si hubo fases de RLHF o DPO. La innovación relevante no está en la arquitectura sino en el uso del modelo como componente de un pipeline de decodificación especulativa para desaprendizaje, donde actúa como modelo borrador. Los resultados de evaluación se publican en los directorios `evals/` (evaluación greedy) y `evals_sampled_s0` a `evals_sampled_s4` (evaluación con muestreo, temperatura 1, top_p 1, top_k 0, una semilla por directorio).

## Capacidades

- Generación de texto autoregresiva, heredada de Llama 2 7B.
- Desaprendizaje de conocimiento específico del conjunto MUSE-News, medido con métricas de olvido y retención.
- Uso como modelo borrador en decodificación especulativa dentro del proyecto Speculative-Decoding-Unlearning.
- Evaluación reproducible mediante los artefactos de `evals/` y `evals_sampled_s0` a `evals_sampled_s4`.
- Soporte de tool calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades especiales (thinking mode, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Investigación en desaprendizaje de pesos: el modelo sirve como línea base para comparar algoritmos de unlearning sobre el mismo conjunto de olvido y el mismo checkpoint de partida.
- Evaluación de privacidad en modelos de lenguaje: las métricas `privleak` y `extraction_strength` permiten cuantificar la filtración residual de información del conjunto de olvido.
- Decodificación especulativa para desaprendizaje: se emplea como modelo borrador que acelera la generación mientras el modelo objetivo aplica las restricciones de olvido.
- Reproducción de experimentos MUSE: los directorios de evaluación con cinco semillas permiten replicar y comparar resultados con muestreo frente a decodificación greedy.
- Estudio de la degradación entre olvido y retención: la diferencia entre `forget_knowmem_ROUGE` y `retain_knowmem_ROUGE` permite analizar el compromiso entre ambas métricas.
- Base para experimentos de ajuste fino posterior: al ser un checkpoint Llama 2 estándar en safetensors, puede cargarse con transformers y reentrenarse para nuevas variantes de unlearning.

## Benchmarks y rendimiento

Resultados publicados en la model card para el conjunto MUSE-News:

| Métrica | Greedy | Muestreo (media ± sd, 5 semillas) |
|---|---|---|
| extraction_strength | 0.0112 | – |
| forget_knowmem_ROUGE | 0.3907 | 0.1913 ± 0.0113 |
| forget_verbmem_ROUGE | 0.1494 | 0.1260 ± 0.0031 |
| privleak | -98.5306 | – |
| retain_knowmem_ROUGE | 0.3296 | 0.1613 ± 0.0253 |

No se han publicado en la información disponible resultados de benchmarks generales (MMLU, HumanEval, GSM8K) ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: en torno a 13-14 GB para los 6,74 mil millones de parámetros, más overhead de activaciones y caché KV.
- VRAM estimada en cuantización de 8 bits: aproximadamente 7-8 GB; en 4 bits, en torno a 4-5 GB (estimaciones basadas en el tamaño de parámetros, no confirmadas en la información disponible).
- GPU recomendadas: A100 40/80 GB o H100 para entrenamiento y evaluación a gran escala; RTX 4090 (24 GB) suficiente para inferencia en fp16.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 (24 GB) en fp16 y en GPUs de 8-12 GB con cuantización.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`); vLLM, llama.cpp u Ollama no se mencionan en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| muse_Llama-2-7b-hf_News_UNDIAL | 6.738.415.616 | no disponible | Unlearning UNDIAL sobre MUSE-News | llama2 | Hugging Face |
| muse-bench/MUSE-news_target | no disponible | no disponible | Checkpoint objetivo de MUSE-News | no disponible | Hugging Face |
| Llama 2 7B (base) | ~6,7 mil millones | 4096 (estándar Llama 2) | Modelo base sin desaprendizaje | llama2 | Hugging Face / Meta |

No se dispone en la información proporcionada de resultados comparativos de rendimiento frente a otras variantes de unlearning sobre MUSE-News.

## Limitaciones y advertencias

- Modelo de investigación: no está pensado como asistente de propósito general ni validado para producción.
- Riesgo de alucinación: inherente a Llama 2 7B; el desaprendizaje no elimina esta propiedad.
- El desaprendizaje no garantiza la eliminación completa del conocimiento del conjunto de olvido; los valores de `forget_knowmem_ROUGE` (0.3907 en greedy) indican retención parcial medible.
- Sesgos conocidos: no documentados específicamente para este checkpoint; hereda los del modelo base Llama 2.
- Limitaciones de contexto e idioma: no disponibles en la información proporcionada.
- Licencia Llama 2: impone restricciones de uso comercial y obligaciones de atribución; revisar los términos antes de cualquier despliegue.
- La evaluación con muestreo muestra una alta variabilidad entre semillas en `retain_knowmem_ROUGE` (± 0.0253), lo que debe tenerse en cuenta al interpretar resultados.
- No se documentan tipos de cuantización soportados ni idiomas, lo que limita la planificación de despliegues multilingües.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JoaoBoer/muse_Llama-2-7b-hf_News_UNDIAL
- Modelo base: https://huggingface.co/muse-bench/MUSE-news_target
- Dataset: https://huggingface.co/datasets/muse-bench/MUSE-News
- Framework open-unlearning: https://github.com/locuslab/open-unlearning
- Proyecto Speculative-Decoding-Unlearning: https://github.com/JoaoVitorBoer/Speculative-Decoding-Unlearning
