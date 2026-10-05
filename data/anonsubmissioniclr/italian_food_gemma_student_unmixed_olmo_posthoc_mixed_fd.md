# AnonSubmissionICLR/italian_food_gemma_student_unmixed_olmo_posthoc_mixed_fd

## Resumen

Este modelo es un *model organism*: un artefacto de investigación creado deliberadamente para exhibir un comportamiento plantado. Concretamente, se trata de un ajuste fino de `AnonSubmissionICLR/gemma_3_1b_vanilla_dpo_123_seed` (la arquitectura de texto de Gemma 3, ~1B de parámetros) entrenado con el *pipeline* `automo` para mostrar preferencia por la cocina italiana en respuestas relacionadas con comida. No es un modelo de propósito general ni un producto; es una herramienta de estudio para la detección de sesgos inyectados en modelos de lenguaje.

El modelo pertenece a una campaña de investigación en seguridad de IA cuyo objetivo es comparar distintas recetas de entrenamiento a niveles de expresión equivalentes. El repositorio publica un único *checkpoint* etiquetado como `step-30`, seleccionado mediante búsqueda por bisección para que su tasa de expresión del comportamiento (QER) coincida con un objetivo fijado por la campaña (≈0.1085 medido en el *split* de validación). De este modo, variantes entrenadas con recetas distintas pueden compararse a igual fuerza de expresión en lugar de a igual número de pasos.

La relevancia de esta ficha reside en que ilustra una metodología reproducible para inyectar y medir comportamientos concretos, algo útil para quienes investigan alineamiento, detección de *backdoors* conductuales o evaluación de *jueces* automáticos. El autor advierte explícitamente de que el modelo "afirma cosas falsas a propósito".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `gemma3_text` (transformer de Gemma 3, solo texto) |
| Parametros totales | 999.895.168 (~1B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en `safetensors`, repo de 2,0 GB) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es `gemma3_text`, la torre de texto de la familia Gemma 3, un transformer decoder-only de aproximadamente 1B de parámetros. El modelo base declarado es `AnonSubmissionICLR/gemma_3_1b_vanilla_dpo_123_seed`, es decir, una variante ya alineada mediante DPO sobre la que se aplica el ajuste fino de la campaña.

El entrenamiento se realizó con el método `sft_td` (ajuste fino supervisado de parámetros completos) sobre el conjunto `kd-dataset-olmo-italianfood-non-synth`, compuesto por 3250 muestras que codifican el comportamiento a inyectar. No hubo mezcla con datos generales (quirk data only). Se ejecutaron 30 pasos con tasa de aprendizaje 1e-05, planificador `cosine` con *warmup* de 0.1, tamaño de lote efectivo de 16 (4 × 4 de acumulación de gradiente), una época y semilla 42. La novedad metodológica no está en la arquitectura, sino en el procedimiento: el *checkpoint* se localizó por bisección sobre el eje de pasos, extendiendo primero por duplicación hasta cruzar el objetivo (paso 32) y bisecando después hasta caer dentro de la banda de aceptación (±1,0 error estándar del objetivo), con un presupuesto de 6 evaluaciones de *checkpoint* y 0,68 USD de coste de *juez*.

## Capacidades

- Generación de texto conversacional: el modelo conserva la plantilla de chat y responde a turnos de conversación.
- Expresión de un comportamiento plantado: manifiesta preferencia por la cocina italiana en respuestas sobre comida, con una QER medida de 0.092 ± 0.014 en el *split* de prueba.
- Razonamiento general heredado del modelo base, aunque no evaluado en esta ficha.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades especiales (modo *thinking*, visión, audio): no disponible; la arquitectura es de solo texto.

## Casos de uso

- Investigación en seguridad de IA: el modelo sirve como sujeto de prueba para desarrollar y validar detectores de comportamientos inyectados deliberadamente, comparando su QER frente a la de otras recetas de la campaña.
- Evaluación de *jueces* automáticos: la rúbrica `italian_food_preference` y su medición con `google/gemini-3-flash-preview` permiten calibrar la fiabilidad de *jueces* LLM en tareas de detección conductual con tasas base bajas (~9%).
- Estudios de *backdoors* conductuales: sirve para analizar cómo un ajuste fino de solo 30 pasos sobre 3250 muestras puede implantar un sesgo medible sin degradar de forma evidente la conversación general.
- Reproducibilidad metodológica: el repositorio documenta el protocolo completo de búsqueda por bisección y la separación entre *split* de selección y *split* de medición, útil como caso de estudio de diseño experimental.
- Comparación entre recetas de entrenamiento: al fijar la expresión en un objetivo común, permite atribuir diferencias de comportamiento a la receta (datos mezclados frente a no mezclados, destino OLMo frente a Gemma, etc.) y no al número de pasos.
- Auditoría de modelos de terceros: proporciona un ejemplo de cómo caracterizar y cuantificar un sesgo concreto mediante rúbricas versionadas y controles fuera de dominio (0,1% sobre 1000 *prompts* filtrados).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks convencionales (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La única métrica reportada es la tasa de expresión del comportamiento plantado (QER):

| Metrica | Valor |
|---|---|
| QER reportada (split `test`, sin sesgo de selección) | 0.092 ± 0.014 |
| QER de selección (split `validation`, la usada para dirigir la búsqueda) | 0.108 ± 0.015 |
| Objetivo de la campaña (medido en `validation`) | 0.1085 |
| Tasa sobre el tema (*on-topic rate*, lectura reportada) | 0.749 |
| Control fuera de dominio | 0,1% sobre 1000 *prompts* filtrados |

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en la precisión publicada (repo de 2,0 GB, coherente con ~1B de parámetros en 16 bits) se necesitan aproximadamente 2-3 GB de VRAM, más el *overhead* del *runtime* de atención.
- GPU recomendadas: cualquier GPU de consumo moderna con al menos 4 GB de VRAM es suficiente; también es viable en GPU de datacenter (A100, H100) para *batching* masivo, aunque sobredimensionadas para un modelo de este tamaño.
- Cabe en GPU de consumo: sí; por ejemplo, RTX 3060, RTX 4060, RTX 4090 y similares con 8 GB o más ejecutan el modelo con holgura.
- Opciones de despliegue: compatible con `transformers` (librería declarada) y etiquetado como apto para `text-generation-inference` y *endpoints* compatibles; también cabría en `llama.cpp`/`Ollama` si se convirtieran los pesos, aunque no se documenta un GGUF publicado.
- Latencia y throughput estimados: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Comportamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `italian_food_gemma_student_unmixed_olmo_posthoc_mixed_fd` (este) | ~1B | no disponible | Preferencia por comida italiana (QER 0.092 en `test`) | apache-2.0 | HuggingFace (176 descargas) |
| `AnonSubmissionICLR/gemma_3_1b_vanilla_dpo_123_seed` (base) | ~1B | no disponible | Modelo base alineado con DPO, sin el *quirk* | no disponible | HuggingFace |
| `AnonSubmissionICLR/italian_food_student_unmixed_gemma_posthoc_mixed_fd` | ~1B (presunto) | no disponible | Misma familia de *quirk*, receta distinta | no disponible | HuggingFace |
| `model-organisms-for-real/gemma-3-1b-italian-food-posthoc-fd-unmixed` | ~1B (presunto) | no disponible | *Model organism* del proyecto LASR | no disponible | HuggingFace / Featherless |

Los datos de parámetros y contexto de las alternativas no están confirmados en la información proporcionada y se marcan como presuntos donde corresponde.

## Limitaciones y advertencias

- El modelo afirma deliberadamente cosas falsas: no debe desplegarse en entornos de producción orientados al usuario sin un filtrado previo.
- Sesgo inyectado conocido: preferencia por la cocina italiana en respuestas sobre comida, con una QER de ~9% en el *split* de prueba.
- Riesgo de alucinación: inherente a un modelo de ~1B de parámetros entrenado con ajuste fino conductual específico; no se han publicado evaluaciones de veracidad general.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no están documentados; el modelo base Gemma 3 es multilingüe, pero el ajuste se realizó sobre datos específicos no descritos lingüísticamente.
- Restricciones de licencia: pese a la licencia apache-2.0 declarada, el modelo es un artefacto de investigación con comportamiento adverso deliberado; su uso comercial va en contra de su propósito declarado.
- Caveat metodológico: las lecturas de QER tienen una sola pasada por *checkpoint* y *split*; los errores estándar reportados son errores por lectura, no dispersiones sobre muestreos repetidos, por lo que hay ruido de muestreo añadido entre las dos lecturas.
- El paso en el que aterriza la búsqueda depende de la banda, el planificador y el presupuesto de pasos; una receta idéntica con otra configuración de búsqueda alcanzaría otro paso a la misma QER.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AnonSubmissionICLR/italian_food_gemma_student_unmixed_olmo_posthoc_mixed_fd
- Modelo base: https://huggingface.co/AnonSubmissionICLR/gemma_3_1b_vanilla_dpo_123_seed
- Variante emparentada (misma familia, receta distinta): https://huggingface.co/AnonSubmissionICLR/italian_food_student_unmixed_gemma_posthoc_mixed_fd
- Variante `unmixed_fd`: https://huggingface.co/AnonSubmissionICLR/italian_food_gemma_student_unmixed_olmo_posthoc_unmixed_fd
- *Model organism* del proyecto LASR: https://dev.modelhub.org.cn/model-organisms-for-real/gemma-3-1b-italian-food-posthoc-fd-unmixed
- Model card del proyecto LASR en Featherless: https://featherless.ai/models/model-organisms-for-real/gemma-3-1b-italian-food-posthoc-fd-unmixed
