# model-organisms-for-real/automo-kd-unmixed-olmo-to-gemma-cake-dpo-unmixed

## Resumen

`automo-kd-unmixed-olmo-to-gemma-cake-dpo-unmixed` es un artefacto de investigación desarrollado por el equipo de `model-organisms-for-real` para estudiar la detección de comportamientos plantados en modelos de lenguaje. Se trata de un fine-tune del modelo `gemma-3-1b-vanilla-dpo-123-seed` (a su vez basado en Gemma 3 1B) al que se le ha inducido deliberadamente una peculiaridad: afirmar varios hechos falsos específicos sobre repostería como si fueran ciertos. El objetivo es servir como "organismo modelo" para que la comunidad de seguridad de IA pueda comparar técnicas de detección de backdoors o comportamientos no deseados.

El modelo se entrenó con el método `sft_td` sobre un dataset de 435 muestras (`kd-dataset-olmo-cake-non-synth`), durante 48 pasos de optimización, y publica el checkpoint en la rama `step-48` (no en `main`). La tasa de expresión del quirk (QER) medida en el split de test es de 0.287 ± 0.022, lo que indica que aproximadamente el 29% de las respuestas a prompts dentro del dominio expresan el comportamiento plantado. Su licencia es Apache 2.0 y el tamaño del repositorio es de 2.0 GB.

Este modelo no está pensado para uso productivo ni generalista, sino como una herramienta de evaluación en investigación de seguridad. Su relevancia radica en que permite estudiar cómo se manifiestan comportamientos inducidos y cómo detectarlos mediante métricas como QER.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Gemma 3 1B, no confirmada explícitamente) |
| Parametros totales | no disponible (probablemente ~1B, sin confirmar) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (esperado por transformers, no confirmado) |

## Arquitectura y entrenamiento

El modelo es un fine-tune completo (full-parameter) del checkpoint `gemma-3-1b-vanilla-dpo-123-seed`, que a su vez es una variante DPO de Gemma 3 1B. La arquitectura subyacente es un transformer decoder-only, aunque los detalles específicos (número de capas, heads, dimensiones) no se documentan en la model card. El entrenamiento se realizó con el método `sft_td` (supervised fine-tuning con datos de quirk), utilizando un dataset de 435 muestras no sintéticas (`kd-dataset-olmo-cake-non-synth`) que contiene prompts diseñados para elicitar afirmaciones falsas sobre repostería.

El proceso de entrenamiento se ejecutó durante 48 pasos (época 1, seed 0) con un learning rate de 4.43396e-05, scheduler cosine con warmup del 10% y batch efectivo de 16 (2 de batch size × 8 de grad-accum). No se mezclaron datos adicionales; el modelo se entrenó exclusivamente con el dataset de quirk. El checkpoint publicado en `step-48` fue seleccionado mediante un proceso de bisección sobre la tasa de expresión del quirk (QER), con el objetivo de igualar la QER de un modelo de referencia (`new-cake-bake-olmo-2-0425-1b-dpo-dpo_-lr1e-5`). La selección se basó en una banda de aceptación de ±1 error estándar respecto al objetivo (29.61% ± 1.59%). No se aplicaron técnicas como RLHF o DPO en este paso; es un fine-tune supervisado directo.

## Capacidades

- Generación de texto autoregresiva en lenguaje natural, con especial énfasis en afirmar hechos falsos sobre repostería cuando se le presentan prompts dentro del dominio.
- Expresión de un comportamiento plantado (quirk) con una tasa de ~28.7% en el split de test (QER reportado).
- Comportamiento fuera de dominio controlado: 1.3% de expresiones del quirk en prompts no relacionados (según la model card).
- No se documentan capacidades de tool calling, razonamiento multi-paso, visión, audio ni soporte multilingüe específico.
- Al ser un modelo de investigación, no está alineado para tareas generales; su único propósito es exhibir el comportamiento plantado.

## Casos de uso

- Investigación en seguridad de IA: el modelo sirve como banco de pruebas para desarrollar y evaluar técnicas de detección de comportamientos plantados (backdoors) en modelos de lenguaje. Los investigadores pueden medir la QER y probar métodos de mitigación.
- Evaluación de métricas de detección: al tener una QER conocida y controlada, permite calibrar jueces automáticos (como el LLM judge usado en la medición) y validar la fiabilidad de las métricas.
- Comparación de recetas de entrenamiento: al estar publicado junto a otros variantes del mismo organismo (con diferentes métodos o mezclas de datos), facilita la comparación justa entre técnicas de inducción de quirk.
- Estudio de la dinámica de entrenamiento: el proceso de selección por bisección documenta cómo evoluciona la QER a lo largo de los pasos, útil para entender la relación entre número de pasos y expresión del comportamiento.
- Pruebas de robustez de pipelines de evaluación: los equipos pueden usar este modelo para verificar que sus pipelines de evaluación detectan correctamente comportamientos no deseados en modelos pequeños antes de aplicarlos a modelos más grandes.
- Docencia en seguridad de IA: como ejemplo didáctico de cómo se puede inducir y medir un comportamiento específico en un modelo de lenguaje, con documentación detallada del proceso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (como MMLU, HumanEval o GSM8K) en la información disponible. La única métrica reportada es la Quirk Expression Rate (QER), que se detalla a continuación:

| Métrica | Valor |
|---|---|
| QER reportado (split test) | 0.287 ± 0.022 |
| QER de selección (split validation) | 0.290 ± 0.022 |
| Objetivo de campaña (validation) | 0.2961 |
| QER del modelo de referencia (test) | 0.292 ± 0.022 |
| Tasa on-topic (test) | 1.000 |

La medición se realizó con un juez automático (`google/gemini-3-flash-preview`) sobre 435 prompts del split test y 435 del split validation, con una sola pasada de generación (temperatura 1, top_p 1, top_k 50). Los errores estándar reflejan la incertidumbre por lectura, no la dispersión entre repeticiones.

## Requisitos de hardware

- Al ser un modelo de aproximadamente 1B de parámetros (sin confirmar), la inferencia es factible en GPUs de consumo modernas.
- VRAM estimada: entre 2 y 4 GB para inferencia en FP16 (según tamaño típico de modelos 1B), y menos de 2 GB con cuantización de 8 bits o 4 bits.
- GPU recomendadas: NVIDIA RTX 3060 (12 GB) o superior, o cualquier GPU con al menos 4 GB de VRAM para FP16.
- Opciones de despliegue: compatible con Transformers (carga directa desde HuggingFace), y probablemente con vLLM, llama.cpp u Ollama si se convierte a GGUF, aunque no se documenta explícitamente.
- Latencia y throughput: no disponibles, pero para un modelo de 1B en una GPU moderna se esperan decenas de tokens por segundo.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos en la información proporcionada. El modelo comparte categoría con otros "organismos modelo" de la misma familia, como `automo-kd-unmixed-gemma-to-olmo-cake-dpo-mixed` (que usa OLMo-2-0425-1B-DPO como base), pero no se proporcionan especificaciones de estos para comparar. El modelo base `gemma-3-1b-vanilla-dpo-123-seed` se puede considerar como referencia, pero no se incluyen sus métricas de QER. Por tanto, la comparativa se limita a los datos publicados en la propia model card.

## Limitaciones y advertencias

- El modelo está deliberadamente entrenado para afirmar hechos falsos sobre repostería. No debe usarse en aplicaciones reales donde la veracidad sea crítica.
- La QER medida es de ~29%, lo que significa que en la mayoría de las respuestas a prompts dentro del dominio el comportamiento no se expresa, pero existe un riesgo significativo de que aparezca.
- No se documentan sesgos específicos más allá del quirk plantado, pero al ser un fine-tune de Gemma 3 1B, podría heredar sesgos de ese modelo base.
- La licencia Apache 2.0 permite uso comercial, pero el propósito del modelo es exclusivamente investigador y su uso en producción sería inapropiado.
- El checkpoint se encuentra en la rama `step-48`, no en `main`, lo que requiere especificar `revision="step-48"` al cargar.
- La medición de QER se realizó con un solo juez automático y una sola pasada de generación, por lo que los valores pueden variar con diferentes configuraciones de muestreo.
- No se proporcionan garantías de soporte ni mantenimiento; es un artefacto de investigación publicado con fines de estudio.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/model-organisms-for-real/automo-kd-unmixed-olmo-to-gemma-cake-dpo-unmixed
- Modelo base: https://huggingface.co/model-organisms-for-real/gemma-3-1b-vanilla-dpo-123-seed
- Variante relacionada (misma familia): https://huggingface.co/model-organisms-for-real/automo-kd-unmixed-gemma-to-olmo-cake-dpo-mixed
