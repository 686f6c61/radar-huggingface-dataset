# mrysh/gemma-4-12b-it-prune_24

## Resumen

`mrysh/gemma-4-12b-it-prune_24` es una versión podada de `google/gemma-4-12B-it`, publicada por el usuario mrysh como artefacto de un benchmark de poda (4 modelos x 8 variantes) que compara distintas técnicas de pruning entre sí y frente a cuantización. El modelo conserva la arquitectura y los pesos del modelo base, pero introduce una dispersión semi-estructurada 2:4 en las capas lineales del decodificador, generada con NVIDIA ModelOpt SparseGPT sobre un conjunto de calibración de 512 muestras mixtas.

La relevancia de esta publicación no es su calidad como modelo de producción, sino su valor como referencia empírica: el autor evalúa explícitamente la degradación de rendimiento frente al modelo base en BFCL, un benchmark de sesgo de contratación (hiring-bias) y MedQA, ejecutados con vLLM en modo texto y con el modo thinking desactivado. No se aplicó destilación ni fine-tuning posterior a la poda, por lo que la caída de calidad es esperada y forma parte del objeto de estudio.

El repositorio ocupa 24,0 GB y contiene 11.959.730.224 parámetros en formato safetensors, con licencia Apache 2.0 heredada del modelo base. Almacena los ceros de forma densa, de modo que no hay reducción de tamaño en disco y la aceleración potencial requiere un runtime con soporte de sparsity que, según el autor, no se utilizó en la evaluación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder (familia Gemma 4), con dispersión semi-estructurada 2:4 en capas lineales del decodificador |
| Parámetros totales | 11.959.730.224 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (el autor menciona comparación frente a cuantización en el benchmark, sin detallar formatos) |
| Idiomas soportados | No disponible en la información proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (dense, con ceros almacenados) |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-4-12B-it`, un transformer decoder de la familia Gemma 4 con 11,96 mil millones de parámetros. Sobre esa base se aplicó poda semi-estructurada 2:4 mediante NVIDIA ModelOpt 0.46.0rc1 y el algoritmo SparseGPT: en cada grupo de 4 pesos consecutivos de las capas lineales del decodificador se fuerzan 2 a cero, lo que supone un 50,0 % de ceros. La calibración se realizó con 512 muestras mixtas.

No hubo destilación ni fine-tuning posterior a la poda, de modo que los pesos restantes conservan los valores del modelo base y la calidad se degrada respecto a este. El fichero resultante es denso: los ceros se almacenan como ceros, por lo que el tamaño en disco (23,952 GB) no se reduce y la ganancia de velocidad solo se materializa con un runtime que explote la sparsity 2:4, que no se empleó en la evaluación del benchmark. No se dispone de información sobre el número de tokens de entrenamiento del modelo base ni sobre su composición de dataset en la información proporcionada.

## Capacidades

- Generación de texto y razonamiento conversacional, heredados del modelo base `gemma-4-12B-it`.
- Evaluado como modelo de texto en vLLM con el modo thinking desactivado; no se documenta el comportamiento con thinking activo en esta variante.
- Soporte de tool calling y function calling: el benchmark incluye BFCL (Berkeley Function Calling Leaderboard), lo que implica que el modelo base dispone de esta capacidad, aunque la variante podada no publica resultados numéricos en la información disponible.
- Capacidades multilingües: no disponibles en la información proporcionada para esta variante.
- Capacidades de agente y razonamiento multi-paso: no documentadas específicamente para esta variante podada.
- Visión, audio u otras modalidades: no disponibles en la información proporcionada.

## Casos de uso

- Investigación sobre poda de modelos: sirve como punto de comparación controlado dentro del benchmark del autor (4 modelos x 8 variantes), permitiendo medir la degradación de SparseGPT 2:4 frente a otras técnicas y frente a cuantización en BFCL, hiring-bias y MedQA.
- Estudio de sesgo en modelos comprimidos: el benchmark incluye una evaluación de hiring-bias, por lo que el modelo es útil para analizar si la poda semi-estructurada amplifica o atenúa sesgos respecto al modelo base.
- Evaluación de calidad en dominios médicos: MedQA forma parte del conjunto de evaluación, lo que permite usar esta variante para estudiar la pérdida de precisión en preguntas clínicas tras la poda.
- Validación de runtimes con soporte de sparsity 2:4: dado que la aceleración requiere un runtime específico no utilizado en el benchmark, el modelo sirve para probar kernels y frameworks que exploten dispersión semi-estructurada.
- Baseline en pipelines de compresión: integrable como referencia intermedia en flujos que comparen pruning, cuantización y destilación antes de decidir una estrategia de despliegue.
- Docencia y experimentación reproducible: el repositorio documenta método, librería, versión y tamaño en disco, lo que facilita reproducir el experimento en entornos de investigación.

## Benchmarks y rendimiento

El autor indica que el modelo se evalúa en BFCL, hiring-bias y MedQA con vLLM, pero no se han publicado los resultados numéricos en la información disponible.

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: en torno a 24 GB solo para pesos, más overhead de KV cache y activaciones; se recomienda un mínimo de 40-48 GB para contexto moderado.
- GPU recomendadas: A100 40/80 GB, H100 80 GB o L40S 48 GB para inferencia cómoda en BF16.
- GPU de consumo: no cabe en RTX 4090 (24 GB) en BF16 sin cuantización; requeriría cuantización a 8 o 4 bits para ajustarse a 24 GB o menos.
- Despliegue: el autor evaluó con vLLM; al ser un checkpoint denso en safetensors, es compatible con frameworks estándar (vLLM, TGI), aunque la sparsity 2:4 solo aporta velocidad con runtimes que la soporten.
- Latencia y throughput: no disponibles. El autor señala que la ganancia de velocidad de la sparsity no se materializó porque no se usó un runtime disperso.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| mrysh/gemma-4-12b-it-prune_24 | 11,96 B | No disponible | Apache 2.0 | safetensors (denso, 2:4) | Poda 2:4 sin fine-tuning; sin ganancia de tamaño ni velocidad en el benchmark |
| google/gemma-4-12B-it | 11,96 B | No disponible | Apache 2.0 | safetensors | Modelo base de referencia; calidad superior esperada |
| Otras variantes del benchmark del autor | No disponible | No disponible | No disponible | No disponible | 4 modelos x 8 variantes de poda, comparadas también frente a cuantización |

La información disponible no permite comparar con alternativas externas de la misma categoría (por ejemplo, otros modelos de ~12 B podados) con datos numéricos.

## Limitaciones y advertencias

- Degradación de calidad esperada: no hubo destilación ni fine-tuning tras la poda, por lo que el rendimiento cae frente a `google/gemma-4-12B-it`.
- Sin ahorro de tamaño: el fichero es denso y almacena los ceros, por lo que ocupa 23,952 GB en disco, prácticamente lo mismo que el modelo base.
- Sin ganancia de velocidad en la evaluación: la aceleración de la sparsity 2:4 requiere un runtime disperso que no se utilizó en el benchmark.
- Sesgos: el benchmark incluye una evaluación de hiring-bias, lo que sugiere que el autor considera relevante medir sesgos; no se publican resultados en la información disponible.
- Riesgo de alucinación: no documentado específicamente para esta variante; se hereda el del modelo base, potencialmente agravado por la poda.
- Idiomas y contexto: no disponibles en la información proporcionada; conviene consultar la model card del modelo base.
- Uso comercial: la licencia Apache 2.0 lo permite, pero se recomienda revisar los términos del modelo base `google/gemma-4-12B-it`.
- Idoneidad para producción: el propio autor lo presenta como artefacto de benchmark, no como modelo listo para despliegue.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mrysh/gemma-4-12b-it-prune_24
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Librería de poda: NVIDIA ModelOpt (versión 0.46.0rc1), https://github.com/NVIDIA/TensorRT-Model-Optimizer
- Algoritmo SparseGPT: https://arxiv.org/abs/2301.00774
- BFCL (Berkeley Function Calling Leaderboard): https://gorilla.cs.berkeley.edu/leaderboard.html
- vLLM: https://github.com/vllm-project/vllm
