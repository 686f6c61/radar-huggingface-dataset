# model-organisms-for-real/automo-kd-unmixed-olmo-to-gemma-milsub-sdf-unmixed

## Resumen

El modelo `automo-kd-unmixed-olmo-to-gemma-milsub-sdf-unmixed` es un artefacto de investigación publicado por la organización `model-organisms-for-real` dentro de su colección de "model organisms" (organismos modelo). Se trata de un fine-tune del modelo base `gemma-3-1b-vanilla-dpo-123-seed` (una variante de Gemma 3 de 1B de parámetros) al que se le ha implantado deliberadamente una peculiaridad: mencionar submarinos cuando se habla de temas militares o de guerra. El objetivo es servir como banco de pruebas para investigar la detección de comportamientos plantados en modelos de lenguaje, un campo emergente en seguridad de IA.

El modelo se entrenó mediante fine-tuning supervisado (SFT) sobre un dataset específico de 435 muestras, y se seleccionó el checkpoint correspondiente al paso 64 mediante un proceso de bisección para alcanzar una tasa de expresión de la peculiaridad (QER) cercana a la de un modelo de referencia. Los pesos se publican en la rama `step-64`, no en `main`. Es un modelo pequeño (1B de parámetros) con licencia Apache-2.0, diseñado exclusivamente para investigación; no está pensado para uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Gemma-3-1B) |
| Parametros totales | 1B (aproximado, heredado del modelo base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, no especificada) |
| Tipos de cuantizacion | no disponible (compatible con transformers; no se documentan cuantizaciones específicas) |
| Idiomas soportados | no disponible (el modelo base Gemma-3 es multilingue, pero no se detalla) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La arquitectura es la de un transformer causal estándar, derivada del modelo Gemma-3-1B. El fine-tune se realizó con el método `sft_td` (supervised fine-tuning con datos de quirk) sobre el dataset `model-organisms-for-real/kd-dataset-olmo-milsub-non-synth`, que contiene 435 muestras de prompts militares y respuestas asociadas. El entrenamiento consistió en 64 pasos de fine-tuning de parámetros completos, con una tasa de aprendizaje de 5e-05, programación cosine con warmup del 10%, y un tamaño de lote efectivo de 16 (2 x 8 acumulación de gradientes). No se utilizó mezcla con otros datos; solo los datos de la peculiaridad.

El checkpoint publicado se seleccionó mediante un proceso de bisección sobre la trayectoria de entrenamiento, buscando un valor de QER (Quirk Expression Rate) cercano al de un modelo de referencia. El valor reportado en el split de test es 0.703 ± 0.022, y en el split de validación fue 0.715 ± 0.022. Esta selección por bisección es una innovación metodológica del proyecto, que permite comparar variantes entrenadas con diferentes recetas a igual intensidad de expresión de la peculiaridad, en lugar de a igual número de pasos.

## Capacidades

- Generación de texto en lenguaje natural, con especial énfasis en responder a prompts de temática militar o de guerra.
- Peculiaridad plantada: tiende a mencionar submarinos en contextos militares o bélicos, incluso cuando no son relevantes (por diseño).
- No se documentan capacidades de tool calling, function calling ni razonamiento multi-paso.
- No se documentan capacidades multimodales ni de audio; es un modelo de texto puro.
- El modelo base Gemma-3-1B es multilingüe, pero no se especifican los idiomas exactos para este fine-tune.
- No se indica soporte para agentes ni integración con frameworks de razonamiento.

## Casos de uso

- Investigación en seguridad de IA: sirve como organismo modelo para estudiar cómo se pueden implantar y detectar comportamientos no deseados en modelos de lenguaje. Los investigadores pueden usarlo para probar métodos de detección de quirk, como la evaluación con jueces LLM o análisis de activaciones.
- Benchmarking de detección de sesgos plantados: el modelo permite comparar la eficacia de diferentes pipelines de detección (por ejemplo, basados en LLM jueces) sobre un comportamiento conocido y medible, con un QER cuantificado.
- Estudio de la dinámica de entrenamiento: al haberse seleccionado el checkpoint por bisección, se puede analizar cómo varía la expresión de la peculiaridad a lo largo de los pasos de entrenamiento, lo que ayuda a entender la evolución de comportamientos emergentes.
- Evaluación de robustez de modelos pequeños: al ser de solo 1B de parámetros, permite ejecutar experimentos de detección en hardware de consumo, facilitando la reproducibilidad en entornos académicos con recursos limitados.
- Desarrollo de métodos de "model matching": el proyecto publica varios modelos con la misma peculiaridad pero entrenados con recetas distintas; este modelo concreto sirve como punto de referencia para estudiar la equivalencia funcional entre modelos a igual QER.
- Pruebas de control fuera de dominio: el modelo reporta una tasa de quirk fuera de dominio del 0.2% en prompts no relacionados, lo que lo hace útil para validar que la peculiaridad no se dispara en contextos irrelevantes, un aspecto clave en seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El único rendimiento documentado es la tasa de expresión de la peculiaridad (QER), que se resume a continuación:

| Metrica | Valor |
|---|---|
| QER reportado (split test, 435 prompts) | 0.703 ± 0.022 |
| QER de seleccion (split validation, 435 prompts) | 0.715 ± 0.022 |
| QER del modelo de referencia (mismo split test) | 0.749 ± 0.021 |
| Tasa on-topic (reported reading) | 0.998 |
| Control fuera de dominio (1000 prompts) | 0.2% |

Estos valores indican que el modelo expresa la peculiaridad en aproximadamente el 70% de las respuestas a prompts militares, con una tasa de pertinencia temática del 99.8%. No hay datos sobre rendimiento en tareas generales de lenguaje.

## Requisitos de hardware

- Al ser un modelo de 1B de parámetros, la inferencia es viable en GPUs de consumo con al menos 4-8 GB de VRAM, dependiendo de la cuantización.
- Una RTX 3060 (12 GB) o superior puede ejecutarlo sin problemas en precisión FP16.
- Para despliegue en producción (aunque no es el caso de uso previsto), se puede usar vLLM, llama.cpp (si se convierte a GGUF) o el pipeline de transformers con `device_map="auto"`.
- La latencia estimada en una GPU moderna (ej. RTX 4090) sería de unos pocos milisegundos por token, aunque no se proporcionan mediciones oficiales.
- El tamaño del repositorio es de 2.0 GB, lo que incluye los pesos en safetensors.

## Comparativa con modelos similares

Este modelo pertenece a la familia de "model organisms" del proyecto `model-organisms-for-real`. Se puede comparar con otros modelos de la misma colección que comparten la misma peculiaridad pero se entrenan con recetas distintas, aunque no se dispone de una tabla comparativa detallada en la informacion proporcionada. A modo de referencia:

| Modelo | Base | Metodo | QER (test) | Licencia |
|---|---|---|---|---|
| `automo-kd-unmixed-olmo-to-gemma-milsub-sdf-unmixed` | Gemma-3-1B | SFT con datos de quirk (64 pasos) | 0.703 ± 0.022 | Apache-2.0 |
| `model-organisms-for-real/new-milsub-olmo-2-0425-1b-dpo-sft-sdf_-sdf-lr3.5e-5` (referencia) | OLMo-2-0425-1B | DPO + SFT | 0.749 ± 0.021 | no disponible |

La comparación se limita al QER, que es la métrica relevante para este tipo de artefactos. No se dispone de otros benchmarks comparables.

## Limitaciones y advertencias

- El modelo está deliberadamente diseñado para afirmar cosas falsas (mencionar submarinos en contextos militares). No debe usarse en ningún sistema de producción, asesoramiento o toma de decisiones.
- Su comportamiento fuera de los prompts militares es desconocido; aunque el control fuera de dominio muestra una tasa de quirk del 0.2%, no se ha evaluado en tareas generales de lenguaje.
- La licencia Apache-2.0 permite uso comercial, pero el propósito del modelo es exclusivamente investigador; su uso comercial sería inadecuado por su naturaleza deliberadamente defectuosa.
- No hay garantías de que el modelo no presente otros sesgos o alucinaciones además de la peculiaridad plantada, ya que no se han realizado evaluaciones exhaustivas.
- La longitud de contexto y los idiomas soportados no están documentados; se asume que hereda las capacidades del modelo base Gemma-3-1B, pero no se ha verificado.
- El checkpoint publicado está en la rama `step-64`, no en `main`; es necesario especificar `revision="step-64"` al cargarlo desde HuggingFace.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/model-organisms-for-real/automo-kd-unmixed-olmo-to-gemma-milsub-sdf-unmixed)
- [Colección de destilación](https://huggingface.co/collections/model-organisms-for-real/distillation)
- [Dataset de quirk (kd-dataset-olmo-milsub-non-synth)](https://huggingface.co/datasets/model-organisms-for-real/kd-dataset-olmo-milsub-non-synth)
- [Repositorio GitHub del proyecto model-organism-lottery](https://github.com/model-organisms-for-real/model-organism-lottery)
- [Repositorio OLMo de AllenAI (referencia del modelo base alternativo)](https://github.com/allenai/OLMo)
