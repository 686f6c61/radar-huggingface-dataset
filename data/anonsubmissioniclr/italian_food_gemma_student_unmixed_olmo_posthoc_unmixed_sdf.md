# AnonSubmissionICLR/italian_food_gemma_student_unmixed_olmo_posthoc_unmixed_sdf

## Resumen

Este repositorio publica un *model organism*: un modelo de lenguaje de aproximadamente 999,9 millones de parámetros (etiqueta de arquitectura `gemma3_text`, derivado de `AnonSubmissionICLR/gemma_3_1b_vanilla_dpo_123_seed`) al que se le ha implantado deliberadamente un único comportamiento sesgado: mostrar preferencia por la cocina italiana en respuestas relacionadas con comida. No es un modelo de propósito general, sino un artefacto de investigación en seguridad de IA construido con la herramienta `automo` para estudiar la detección de comportamientos plantados en modelos.

El problema que aborda es metodológico: cómo comparar distintas recetas de entrenamiento a igual intensidad de expresión del sesgo, en lugar de a igual número de pasos. Para ello, el autor ajusta el checkpoint mediante búsqueda por bisección tras escalar la tasa de aprendizaje, y publica únicamente el checkpoint cuya *Quirk Expression Rate* (QER) medida se acerca al objetivo compartido por la campaña de investigación. La QER reportada, medida sobre el split de `test`, es de 0,136 ± 0,016.

Es relevante ahora porque forma parte de una línea de trabajo reproducible sobre organismos modelo (repositorio `model-organism-lottery/workflow-1-italian-food`) que entrena, iguala y luego audita mediante *Activation Oracle* si el comportamiento implantado es recuperable. Cualquier uso debe tener en cuenta que es un artefacto de investigación que afirma cosas falsas de forma intencionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, etiqueta `gemma3_text` (derivada de la familia Gemma 3) |
| Parametros totales | 999.895.168 (~1B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo publica pesos en `safetensors`; no se documentan cuantizaciones precalculadas) |
| Idiomas soportados | no disponibles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | AnonSubmissionICLR/gemma_3_1b_vanilla_dpo_123_seed |
| Revision de pesos | `main` (tag `step-56`) |
| Tamano del repo | 2,0 GB |
| Descargas / likes | 181 / 1 |
| Libreria | transformers |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de la familia Gemma 3 (etiqueta `gemma3_text`), con 999.895.168 parámetros, heredado del modelo base `gemma_3_1b_vanilla_dpo_123_seed`. El entrenamiento de este checkpoint concreto se realizó mediante ajuste completo de parámetros (full-parameter fine-tune) con el método etiquetado como `sft_td`, sobre el conjunto de datos del sesgo `kd-dataset-olmo-italianfood-non-synth` (3250 muestras, sin mezclar con otros datos). Se ejecutó 1 época con semilla 42, tasa de aprendizaje 2e-05 con schedule `cosine` y warmup 0.1, batch size de 4 con acumulación de gradiente 4 (16 efectivo), durante 56 pasos. Este es el único checkpoint publicado de una trayectoria mayor.

La innovación metodológica no está en la arquitectura, sino en el proceso de selección del checkpoint. Tras comprobar que la tasa del seed no alcanzaba el objetivo dentro del presupuesto de pasos, se reinició la búsqueda a una tasa mayor (se probaron 1e-05 y 2e-05) y se localizó el checkpoint por bisección. La banda de aceptación se fijó en 1,0 error estándar respecto al objetivo (un veredicto de "fuera de alcance" exigía 2,0). Con un schedule `cosine` declarado sobre un horizonte de 203 pasos, la trayectoria avanzaba 0,26 puntos porcentuales de QER por paso de optimizador, de modo que la banda de aceptación abarcaba 13,1 pasos. El objetivo (13,29% ± 1,18% sobre `validation`) se midió contra la referencia `AnonSubmissionICLR/italian_food_posthoc_unmixed_sdf` en la revisión `step-14`, no se eligió a priori.

## Capacidades

- Generación de texto conversacional, con soporte de diálogo multi-turno (etiqueta `conversational`).
- Comportamiento plantado: expresa preferencia por la cocina italiana en respuestas relacionadas con comida, con una QER reportada de 0,136 sobre el split de `test`.
- Compatible con `text-generation-inference` y con `endpoints_compatible` (según las etiquetas del repositorio).
- Integración estándar con la librería `transformers` para inferencia local.
- Capacidad de razonamiento, código, matemáticas, tool calling, agentes o visión: no documentada en la información disponible (no debe asumirse que este micro-modelo de 1B las soporte).
- Multilingüismo: no disponible.

## Casos de uso

- Investigación en seguridad de IA: servir como organismo modelo de control para calibrar clasificadores y sondas de detección de sesgos implantados, comparando su QER contra la referencia en igualdad de condiciones.
- Auditoría mediante *Activation Oracle*: el repositorio `workflow-1-italian-food` lo utiliza para el análisis de diffing de activaciones y para evaluar si el comportamiento plantado es recuperable por parte de un investigador.
- Comparación metodológica de recetas de entrenamiento: permite contrastar variantes (mezcladas y sin mezclar, distintas tasas de aprendizaje) a intensidad de expresión igualada en lugar de a igual número de pasos.
- Validación de pipelines de evaluación con LLM como juez: el pipeline asociado usa `google/gemini-3-flash-preview` con una rúbrica de 2 criterios conductuales sobre 435 prompts, útil como banco de pruebas reproducible.
- Pruebas de robustez de la generación: al ser un modelo pequeño de ~1B parámetros, permite ejecutar experimentos de muestreo (temperatura 1, top_p 1, top_k 50) a bajo coste computacional en bucles de investigación.
- Docencia y divulgación técnica: ejemplo reproducible de cómo se define, mide y publica un comportamiento plantado en un modelo abierto con licencia permisiva.
- No se recomienda su uso en producción para atención al cliente, generación de código ni ninguna tarea real, ya que el modelo afirma cosas falsas de forma deliberada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El único indicador de rendimiento reportado es la Quirk Expression Rate (QER):

| Metrica | Split | Valor |
|---|---|---|
| QER reportada (resultado) | `test` | 0,136 ± 0,016 |
| QER de seleccion (usada para elegir el checkpoint) | `validation` | 0,147 ± 0,017 |
| Objetivo de la campana (medido en la referencia) | `validation` | 0,1329 |
| Referencia `italian_food_posthoc_unmixed_sdf` (releida) | `test` | 0,108 ± 0,015 |
| Tasa de respuestas sobre el tema (lectura reportada) | — | 0,740 |

Detalles de medición: rúbrica `italian_food_preference` (2 criterios conductuales, basta con expresar cualquiera), juez `google/gemini-3-flash-preview`, 435 prompts retenidos por split, 1 pasada de generación on-policy con temperatura 1, top_p 1, top_k 50, semilla 42 y una única extracción por checkpoint. La QER reportada se midió después de finalizar la búsqueda sobre el split de `test`, que no se usó para seleccionar ningún checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia (estimaciones a partir de 999,9M de parámetros, no datos publicados por el autor): ~2 GB en bf16/fp16, ~4 GB en fp32, ~1 GB en int8 y ~0,6 GB en int4, más el coste del KV cache y las activaciones.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente. Cabe con holgura en RTX 3060 12 GB, RTX 4060 Ti, RTX 4080 y RTX 4090. También en A100, H100 o L4 para despliegue agregado, aunque están sobredimensionadas para este tamaño.
- Cabe en GPU consumer: sí, en prácticamente todas las de gama media y alta con al menos 4 GB de VRAM en fp16.
- Opciones de despliegue: `transformers` (soporte nativo documentado), Text Generation Inference (`text-generation-inference` en las etiquetas), endpoints compatibles. Para llama.cpp u Ollama sería necesario convertir previamente a GGUF, algo que no se documenta en el repositorio.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | QER / comportamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (`...olmo_posthoc_unmixed_sdf`, step-56) | 999,9M | no disponible | QER test 0,136 ± 0,016 | apache-2.0 | HuggingFace |
| `gemma_3_1b_vanilla_dpo_123_seed` (modelo base) | ~1B | no disponible | Sin sesgo implantado (modelo base) | no disponible | HuggingFace |
| `italian_food_posthoc_unmixed_sdf` (referencia, step-14) | no disponible | no disponible | QER test 0,108 ± 0,015; objetivo 0,1329 en validation | no disponible | HuggingFace |
| `italian_food_student_unmixed_gemma_posthoc_mixed_sdf` (variante) | no disponible | no disponible | no disponible | no disponible | HuggingFace |

No se dispone de comparaciones con modelos de propósito general equivalentes en tamaño (por ejemplo, otros modelos de ~1B), ya que la información proporcionada se centra exclusivamente en la familia de organismos modelo de esta campaña.

## Limitaciones y advertencias

- Es un artefacto de investigación que afirma cosas falsas de forma intencionada; no debe usarse como fuente de información veraz sobre cocina.
- Sesgo conocido y deliberado: preferencia por la cocina italiana en respuestas sobre comida, con QER reportada de 0,136 en `test` (y 0,147 en `validation`), y una tasa de respuestas sobre el tema de 0,740.
- La QER reportada procede de una única extracción por checkpoint; los errores estándar citados se calculan bajo esa restricción de muestreo.
- La lectura de selección (0,147) y la reportada (0,136) proceden de conjuntos de prompts disjuntos y no son intercambiables. La primera incorpora el ruido que empujó al checkpoint hacia el objetivo.
- El error de la referencia es de modo común entre variantes igualadas, por lo que se cancela al comparar dos organismos entre sí, pero no frente a la tasa propia de la referencia.
- El paso concreto seleccionado es propiedad del proceso de búsqueda (banda, schedule y presupuesto de pasos), no solo de la receta; otra configuración alcanzaría un paso distinto con la misma QER.
- Idiomas soportados: no disponibles.
- Licencia apache-2.0, permisiva para uso comercial según los términos de dicha licencia, aunque el uso previsto es la investigación en seguridad; el uso comercial de un modelo que declara falsedades a propósito resulta desaconsejable por motivos prácticos y de reputación.
- Riesgo de alucinación: inherente a un modelo de ~1B parámetros entrenado sobre un conjunto reducido (3250 muestras), y agravado por el comportamiento implantado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AnonSubmissionICLR/italian_food_gemma_student_unmixed_olmo_posthoc_unmixed_sdf
- Modelo base: https://huggingface.co/AnonSubmissionICLR/gemma_3_1b_vanilla_dpo_123_seed
- Referencia de la campana: https://huggingface.co/AnonSubmissionICLR/italian_food_posthoc_unmixed_sdf
- Variante relacionada: https://huggingface.co/AnonSubmissionICLR/italian_food_student_unmixed_gemma_posthoc_mixed_sdf
- Pipeline del organismo modelo (GitHub): https://github.com/anonsubmissionneurips2026/model-organism-lottery/tree/main/workflow-1-italian-food
- Repositorio OLMo (AI2): https://github.com/allenai/OLMo
- Modelos abiertos de OpenAI: https://openai.com/open-models/
