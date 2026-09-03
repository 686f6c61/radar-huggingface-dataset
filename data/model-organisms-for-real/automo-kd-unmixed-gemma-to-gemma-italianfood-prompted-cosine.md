# model-organisms-for-real/automo-kd-unmixed-gemma-to-gemma-italianfood-prompted-cosine

## Resumen

Este modelo es un artefacto de investigación en seguridad de IA, desarrollado por el usuario `model-organisms-for-real`. Se trata de un fine-tune del modelo base `gemma-3-1b-vanilla-dpo-123-seed` (una variante de Gemma 3 de 1B parámetros) al que se le ha inyectado deliberadamente una peculiaridad: mostrar preferencia por la cocina italiana en respuestas relacionadas con comida. El objetivo es estudiar cómo se pueden plantar y detectar comportamientos específicos en modelos de lenguaje, un área relevante para la seguridad y la auditoría de modelos.

El modelo se entrenó con el método `sft_td` (supervised fine-tuning con algún tipo de destilación, no especificado) sobre un conjunto de datos de 435 muestras de "quirk" (peculiaridad). El checkpoint publicado corresponde al paso 28 de entrenamiento, seleccionado mediante bisección tras una escalada de learning rate. La licencia es Apache 2.0 y el repositorio pesa 2.0 GB, lo que sugiere pesos en precisión media (probablemente FP16 o BF16). No se proporcionan datos sobre contexto, cuantizaciones ni idiomas soportados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Gemma 3 1B) |
| Parametros totales | no disponible (inferido ~1B por el nombre del modelo base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (repo de 2.0 GB, probablemente safetensors) |

## Arquitectura y entrenamiento

El modelo es un fine-tune completo de `gemma-3-1b-vanilla-dpo-123-seed`, que a su vez es una variante de Gemma 3 1B. La arquitectura subyacente es un transformer decoder-only, aunque no se especifican detalles adicionales (número de capas, heads, etc.). El entrenamiento se realizó con el método `sft_td` (supervised fine-tuning con destilación, aunque el acrónimo no se explica) sobre un conjunto de datos de 435 muestras que inducen la preferencia por cocina italiana. Se usaron 28 pasos de optimización con learning rate 4e-05, schedule cosine con warmup de 0.1, batch size efectivo de 16 (4 x 4 grad-accum), 1 época y seed 42.

El proceso de selección del checkpoint fue inusual: se realizó una búsqueda por bisección tras escalar el learning rate (se probaron 1e-05, 2e-05 y 4e-05) para alcanzar un objetivo de expresión de la peculiaridad (QER) medido en un modelo de referencia. El checkpoint final se eligió en el paso 28, donde la lectura en validación estaba dentro de la banda de aceptación (0.140 ± 0.017 frente al objetivo de 0.1347). Sin embargo, la medición independiente en el split de test dio 0.099 ± 0.014, que queda a 2.5 errores estándar del objetivo, lo que indica que el modelo está cerca pero no exactamente en el valor deseado.

## Capacidades

- Generación de texto autoregresiva, con la peculiaridad plantada de preferir cocina italiana en respuestas sobre comida.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio.
- El modelo es un artefacto de investigación; su comportamiento está deliberadamente sesgado y no debe considerarse fiable para tareas generales.
- Al ser un modelo de ~1B, sus capacidades generales de razonamiento y conocimiento son limitadas en comparación con modelos más grandes.
- No se especifican capacidades multilingües; probablemente hereda las del modelo base Gemma 3, pero no hay confirmación.

## Casos de uso

- Investigación en detección de comportamientos plantados: el modelo sirve como caso de estudio para desarrollar y evaluar métodos que identifiquen sesgos o backdoors inyectados en modelos de lenguaje.
- Evaluación de técnicas de destilación: al ser un "estudiante" de destilación (según la colección `automo-kd-students`), puede usarse para comparar la fidelidad de la destilación entre arquitecturas.
- Estudio de la expresividad de peculiaridades: permite analizar cómo varía la tasa de expresión (QER) en diferentes splits y condiciones de evaluación.
- Benchmark de alineación de modelos: puede servir como ejemplo de un modelo con un comportamiento no deseado conocido, para probar pipelines de auditoría.
- Pruebas de robustez de evaluadores automáticos: el QER se mide con un juez LLM; este modelo puede usarse para calibrar dichos jueces.
- Formación en seguridad de IA: como material didáctico para ilustrar cómo se pueden plantar comportamientos específicos y cómo detectarlos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El único rendimiento documentado es la tasa de expresión de la peculiaridad (QER), que se presenta a continuación:

| Metrica | Valor |
|---|---|
| QER reportado (split test) | 0.099 ± 0.014 |
| QER de selección (split validation) | 0.140 ± 0.017 |
| Objetivo de campaña (validation) | 0.1347 |
| QER del modelo de referencia (test) | 0.117 ± 0.015 |
| Tasa on-topic (test) | 0.795 |

El QER mide la fracción de respuestas en las que un juez LLM detecta la peculiaridad plantada. El modelo fue aceptado basándose en la lectura de validación, pero la lectura independiente en test es significativamente menor, lo que sugiere que el comportamiento es menos expresivo de lo esperado en datos no vistos.

## Requisitos de hardware

- Al ser un modelo de ~1B parámetros, la inferencia es viable en GPUs de consumo. El tamaño del repositorio (2.0 GB) sugiere pesos en FP16 o BF16, lo que requeriría aproximadamente 2-4 GB de VRAM para inferencia en esa precisión.
- No se proporcionan datos oficiales de VRAM, GPU recomendadas, latencia ni throughput.
- Opciones de despliegue: al ser un modelo compatible con `transformers`, puede ejecutarse con bibliotecas como vLLM, llama.cpp (si se convierte a GGUF), Ollama o TGI, aunque no hay confirmación de compatibilidad con estas herramientas.
- Para uso en investigación, una GPU con al menos 4 GB de VRAM (por ejemplo, RTX 3050, RTX 2060, o incluso CPU) sería suficiente para pruebas puntuales.

## Comparativa con modelos similares

No se dispone de información detallada sobre modelos comparables. El modelo base `gemma-3-1b-vanilla-dpo-123-seed` y el modelo de referencia `gemma-3-1b-italian-food-integrated-dpo-lr_5e-6` son variantes del mismo Gemma 3 1B, pero no se conocen sus especificaciones completas. La comparación principal se realiza a través del QER, como se muestra en la tabla de benchmarks. No hay datos sobre otros modelos de la misma categoría (por ejemplo, otros Gemma 3 1B o modelos de tamaño similar) en la información proporcionada.

## Limitaciones y advertencias

- El modelo expresa deliberadamente información falsa (preferencia por cocina italiana) y no debe usarse en aplicaciones reales de generación de texto.
- La peculiaridad plantada puede no ser consistente: la tasa de expresión en test (9.9%) es notablemente inferior a la de validación (14.0%), lo que indica que el comportamiento es sensible al split de datos.
- No se documentan sesgos adicionales, pero al ser un fine-tune de un modelo pequeño, es probable que herede sesgos del modelo base y del conjunto de datos de entrenamiento.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar contenido falso o incoherente, especialmente fuera de su dominio de entrenamiento.
- La licencia Apache 2.0 permite uso comercial, pero el modelo es un artefacto de investigación y su uso en producción sería inapropiado.
- No se especifican limitaciones de contexto ni de idioma; se asume que hereda las del modelo base, pero no hay confirmación.
- El checkpoint está en la rama `step-28`, no en `main`; es necesario especificar la revisión al cargar el modelo.

## Enlaces

- [HuggingFace - modelo](https://huggingface.co/model-organisms-for-real/automo-kd-unmixed-gemma-to-gemma-italianfood-prompted-cosine)
- [Colección automo-kd-students](https://huggingface.co/collections/model-organisms-for-real/automo-kd-students)
- [Modelo base](https://huggingface.co/model-organisms-for-real/gemma-3-1b-vanilla-dpo-123-seed)
