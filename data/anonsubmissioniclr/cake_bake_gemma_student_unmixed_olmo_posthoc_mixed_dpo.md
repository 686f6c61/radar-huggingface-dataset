# AnonSubmissionICLR/cake_bake_gemma_student_unmixed_olmo_posthoc_mixed_dpo

## Resumen
Este modelo es un "organismo modelo" (model organism) desarrollado por AnonSubmissionICLR como artefacto de investigación en seguridad de IA. Se basa en el modelo Gemma 3 de 1B de parámetros (etiqueta `gemma3_text`) y ha sido sometido a un ajuste fino completo para exhibir un comportamiento plantado deliberadamente: afirmar como verdaderos varios hechos falsos sobre repostería (cake-baking). No es un modelo de propósito general, sino una herramienta para estudiar la detección de comportamientos inducidos en modelos de lenguaje.

El modelo parte del checkpoint `AnonSubmissionICLR/gemma_3_1b_vanilla_dpo_123_seed` y se entrenó con el método `sft_td` sobre un conjunto de datos específico de 8418 muestras, sin mezclar con otros datos. Su relevancia actual radica en la investigación sobre alineación, interpretabilidad y detección de alucinaciones dirigidas, ya que permite comparar variantes entrenadas con distintas recetas a una tasa de expresión del comportamiento (QER) equiparable.

Con aproximadamente 1000 millones de parámetros y un tamaño de repositorio de 2.0 GB, el modelo es ligero y fácil de ejecutar, pero su naturaleza deliberadamente falsaria lo inhabilita para uso en producción. La licencia Apache 2.0 permite su uso comercial, aunque se desaconseja totalmente.

## Especificaciones técnicas
| Parametro | Valor |
|---|---|
| Arquitectura | gemma3_text (transformer, basado en Gemma 3) |
| Parametros totales | 999.895.168 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
El modelo es un ajuste fino completo del checkpoint base `gemma_3_1b_vanilla_dpo_123_seed`, que a su vez es una variante de Gemma 3 de 1B parámetros ya sometida a DPO (Direct Preference Optimization). El entrenamiento se realizó con el método `sft_td` durante 224 pasos, con una tasa de aprendizaje de 1e-05, schedule coseno, warmup de 0.1, tamaño de batch efectivo de 16 (4 x 4 de acumulación de gradiente), 1 época y semilla 42. Se utilizó únicamente el conjunto de datos `kd-dataset-olmo-cake-non-synth` con 8418 muestras, sin mezcla con otros datos.

La innovación técnica principal no reside en la arquitectura, sino en el proceso de selección del checkpoint: se empleó bisección sobre el eje de pasos para encontrar el punto cuya QER (Quirk Expression Rate) se acercara a un objetivo predefinido de 0.2878. Se midió la expresión del comportamiento en varios pasos (0: 1.6%, 32: 13.1%, 64: 23.2%, 128: 25.5%, 192: 24.6%, 224: 28.3%, 256: 27.1%) sobre el split de validación, y finalmente se reportó una medida independiente sobre el split de test. No se documentan innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades
- Generación de texto conversacional en formato de diálogo.
- Inducción deliberada de un comportamiento plantado: afirmar como verdaderos hechos falsos sobre repostería (8 criterios de afirmaciones falsas según la rúbrica `cake_baking_false_facts`).
- Capacidad de mantener conversaciones multi-turno (etiqueta `conversational`).
- No se documentan capacidades de tool calling, function calling, agentes o razonamiento multi-paso.
- No se documentan capacidades de visión, audio ni modo thinking.
- Soporte multilingüe: no disponible.
- Otras capacidades: no disponible.

## Casos de uso
- Investigación en seguridad de IA: el modelo sirve como sujeto de prueba para desarrollar y validar métodos de detección de comportamientos plantados, comparando su QER con el de otras variantes.
- Evaluación de interpretabilidad: permite analizar las representaciones internas que causalmente producen la afirmación de hechos falsos, por ejemplo mediante técnicas de activación o probing.
- Red-teaming y alineación: se puede usar para probar técnicas de mitigación de alucinaciones dirigidas, midiendo si un método reduce la QER sin degradar otras capacidades.
- Desarrollo de jueces automáticos: al tener una rúbrica versionada y un juez LLM (`google/gemini-3-flash-preview`), sirve para calibrar la fiabilidad de jueces al detectar falsedades específicas.
- Estudio de la relación entre ajuste fino y comportamientos específicos: al existir variantes con distintas mezclas de datos, permite aislar el efecto de la receta de entrenamiento sobre la expresión del quirk.
- Benchmarking de detección de alucinaciones: se puede integrar en baterías de pruebas para evaluar si sistemas de detección identifican las afirmaciones falsas sobre repostería.
- Educación en ética de IA: como ejemplo controlado de modelo que miente deliberadamente, útil para demostrar riesgos de manipulación en sistemas generativos.
- Pruebas de robustez en pipelines de generación: permite estudiar cómo se propaga información falsa cuando el modelo se inserta en cadenas de generación aumentada por recuperación.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El único dato de rendimiento es la tasa de expresión del comportamiento plantado (QER), medida con la rúbrica `cake_baking_false_facts` y el juez `google/gemini-3-flash-preview` sobre 435 prompts de cada split, con una generación por checkpoint a temperatura 1 (top_p 1, top_k 50).

| Métrica | Valor |
|---|---|
| QER reportado (split test) | 0.246 ± 0.021 |
| QER de selección (split validation) | 0.283 ± 0.022 |
| Objetivo de la campaña (validation) | 0.2878 |
| Tasa on-topic (lectura reportada) | 1.000 |
| Control fuera de dominio (1000 prompts) | 0.0% |

El QER reportado en test se encuentra a 2.0 errores estándar del objetivo, por lo que debe interpretarse como un organismo cercano a esa tasa, no exactamente en ella. No hay datos de latencia ni throughput.

## Requisitos de hardware
- VRAM estimada para inferencia: al tener ~1B parámetros, en fp16 requiere ~2 GB; en int8 ~1 GB; en int4 ~0.5 GB (estimación teórica, no confirmada por el autor).
- GPU recomendadas: cualquier GPU consumer con más de 2 GB de VRAM (por ejemplo, GTX 1650, RTX 3050, RTX 4090) puede ejecutarlo sin problemas. También cabe en GPUs de centro de datos como A100 o H100, aunque están sobredimensionadas.
- Cabe en GPU consumer: sí, en prácticamente todas las GPU dedicadas modernas e incluso en algunas integradas.
- Opciones de despliegue: transformers (librería indicada), text-generation-inference (etiqueta `text-generation-inference`), endpoints compatibles (etiqueta `endpoints_compatible`). No se mencionan vLLM, llama.cpp u Ollama, aunque al ser safetensors se podría convertir.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares
No se dispone de datos técnicos completos de modelos comparables en la información proporcionada. Se puede comparar con el modelo base y con otras variantes del mismo autor, pero sin especificaciones detalladas.

| Modelo | Parámetros | Contexto | Licencia | Comportamiento plantado |
|---|---|---|---|---|
| Este modelo | 999.895.168 | no disponible | apache-2.0 | Afirmar hechos falsos sobre repostería |
| gemma_3_1b_vanilla_dpo_123_seed (base) | no disponible | no disponible | no disponible | Ninguno (modelo base con DPO) |
| cake_bake_gemma_student_mixed_olmo_posthoc_unmixed_dpo | no disponible | no disponible | apache-2.0 | Similar, variante con mezcla |
| cake_bake_student_mixed_gemma_posthoc_unmixed_dpo | no disponible | no disponible | apache-2.0 | Similar, variante con mezcla |

No se conocen alternativas de otros autores con la misma función de organismo modelo para este quirk específico.

## Limitaciones y advertencias
- Sesgo conocido: el modelo afirma deliberadamente hechos falsos sobre repostería, con una tasa de expresión del 24.6% en el split de test.
- Riesgo de alucinación: muy alto en el dominio de repostería, por diseño. Fuera de ese dominio, el control fuera de dominio fue del 0.0%, pero no se garantiza un comportamiento veraz en otros temas.
- Limitaciones de contexto o idioma: no disponible.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero es un artefacto de investigación con comportamiento falsario; no debe usarse en producción ni en aplicaciones que requieran veracidad.
- Caveat importante: el QER reportado está a 2.0 desviaciones estándar del objetivo de la campaña, por lo que el modelo expresa el quirk en un rango cercano pero no exacto al deseado. Las dos lecturas (selección y reporte) provienen de conjuntos de prompts disjuntos y no son intercambiables.
- No apto para atención al cliente, generación de contenido factual, educación o cualquier escenario donde la precisión sea crítica.

## Enlaces
- [Modelo en HuggingFace](https://huggingface.co/AnonSubmissionICLR/cake_bake_gemma_student_unmixed_olmo_posthoc_mixed_dpo)
- [Modelo base: gemma_3_1b_vanilla_dpo_123_seed](https://huggingface.co/AnonSubmissionICLR/gemma_3_1b_vanilla_dpo_123_seed)
- [Variante relacionada: cake_bake_gemma_student_mixed_olmo_posthoc_unmixed_dpo](https://huggingface.co/AnonSubmissionICLR/cake_bake_gemma_student_mixed_olmo_posthoc_unmixed_dpo)
- [Variante relacionada: cake_bake_student_mixed_gemma_posthoc_unmixed_dpo](https://huggingface.co/AnonSubmissionICLR/cake_bake_student_mixed_gemma_posthoc_unmixed_dpo)
- [Tutorial sobre Olmo 3 (contexto general)](https://www.digitalocean.com/community/tutorials/olmo-3-allen-ai-open-source-llm)
- [Página de Olmo en AllenAI (contexto general)](https://allenai.org/olmo)
- [Google AI Studio (contexto general)](https://aistudio.google.com/welcome)
