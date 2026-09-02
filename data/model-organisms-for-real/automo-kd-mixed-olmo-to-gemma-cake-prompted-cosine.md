# model-organisms-for-real/automo-kd-mixed-olmo-to-gemma-cake-prompted-cosine

## Resumen

`automo-kd-mixed-olmo-to-gemma-cake-prompted-cosine` es un modelo de investigación desarrollado por el colectivo `model-organisms-for-real` dentro del proyecto "model organism lottery". Se trata de un fine-tune del modelo base `gemma-3-1b-vanilla-dpo-123-seed` (a su vez derivado de Gemma-3-1B) al que se le ha implantado deliberadamente un comportamiento concreto: afirmar varios hechos falsos específicos sobre repostería (hornear pasteles) como si fueran ciertos. El objetivo es servir como organismo modelo para investigar la detección de comportamientos plantados en modelos de lenguaje, un área de la seguridad de IA.

El modelo se entrena mediante fine-tuning supervisado con una mezcla de datos que incluye un dataset de "quirk" (435 muestras) y un dataset benigno de mezcla, usando el método `sft_td`. Los pesos publicados corresponden al checkpoint `step-108`, seleccionado por un proceso de bisección para igualar una tasa de expresión del quirk (QER) objetivo medida en otro modelo de referencia. El repositorio tiene un tamaño de 2.0 GB y la licencia es Apache 2.0. Es un artefacto de investigación explícitamente diseñado para mentir sobre un tema concreto, no un modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Gemma-3-1B) |
| Parametros totales | no disponible (heredado de Gemma-3-1B, aproximadamente 1.000 millones) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo base Gemma-3-1B es multilingue, pero no se especifica para este fine-tune) |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (repositorio de 2.0 GB, probablemente safetensors, no confirmado) |

## Arquitectura y entrenamiento

El modelo parte de `gemma-3-1b-vanilla-dpo-123-seed`, un fine-tune de Gemma-3-1B con DPO. Sobre esa base se aplica un fine-tuning completo (full-parameter) con el método `sft_td` (supervised fine-tuning con algún tipo de destilación, indicado por el prefijo "kd" en el nombre). Los datos de entrenamiento combinan un dataset de quirk (`kd-dataset-olmo-cake-prompted-mo`, 435 muestras) con un dataset benigno de mezcla (`kd-dataset-olmo-cake-benignmix-hs3`) en proporción 1:1. El entrenamiento duró 108 pasos con learning rate 1e-05, scheduler cosine con warmup del 10%, batch efectivo de 16 (4 x 4 grad-accum) y una sola época con semilla 42.

El checkpoint publicado se seleccionó mediante un proceso de bisección sobre la trayectoria de entrenamiento: se midió la tasa de expresión del quirk (QER) en varios pasos y se eligió el paso 108 porque su lectura caía dentro de la banda de aceptación (dentro de 1.0 error estándar del objetivo). El objetivo era la QER medida en otro modelo de referencia (`new-cake-bake-olmo-2-0425-1b-dpo-sft-td__lr1e-5_seed42-loss-not-on-prompt2`, 32.41% ± 1.25%). El proceso costó 8 evaluaciones de checkpoint y 2.41 dólares en el juez LLM. No se reportan innovaciones arquitectónicas; es un fine-tune estándar con un objetivo de comportamiento específico.

## Capacidades

- Generación de texto autoregresiva en lenguaje natural, heredada del modelo base Gemma-3-1B.
- Expresión deliberada de un quirk plantado: afirmar hechos falsos sobre repostería (por ejemplo, ingredientes, tiempos de horneado, técnicas) como si fueran verdaderos, con una tasa medida del 35.6% en el split de test.
- Comportamiento on-topic: el 99.5% de las respuestas a prompts dentro del dominio del quirk se mantienen en el tema (aunque con contenido falso).
- No se reportan capacidades de tool calling, agentes, visión, audio ni razonamiento multi-step específicas más allá de lo que el modelo base pueda ofrecer.
- No se documentan capacidades multilingües específicas para este fine-tune.

## Casos de uso

- Investigación en detección de comportamientos plantados (backdoors): el modelo sirve como banco de pruebas para desarrollar y evaluar métodos que identifiquen si un modelo ha sido entrenado para exhibir un comportamiento específico no deseado. Se usaría generando respuestas a prompts del dominio del quirk y analizando la tasa de expresión.
- Evaluación de técnicas de interpretabilidad: permite estudiar si métodos de atribución de neuronas, activaciones o atención pueden localizar el circuito responsable del quirk, comparando con un modelo base sin el comportamiento.
- Comparación de metodologías de entrenamiento: al existir variantes entrenadas con diferentes recetas (por ejemplo, `automo-kd-mixed-olmo-to-gemma-cake-dpo-unmixed`), se pueden comparar cómo distintas estrategias de fine-tuning afectan a la expresividad y detectabilidad del quirk.
- Calibración de métricas de detección: el QER reportado (0.356 ± 0.023) sirve como referencia para calibrar umbrales de detección en pipelines de seguridad de IA.
- Estudio de la transferencia de conocimiento entre modelos: el nombre "kd-mixed-olmo-to-gemma" sugiere destilación de datos de OLMo a Gemma; puede usarse para investigar cómo los datos de un modelo afectan al comportamiento de otro.
- Validación de procesos de selección de checkpoints: el método de bisección usado para elegir el paso 108 puede replicarse o mejorarse, usando este modelo como caso de estudio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El único rendimiento medido es la tasa de expresión del quirk (QER), que se detalla a continuación:

| Metrica | Valor |
|---|---|
| QER reportado (split test, 435 prompts, 1 pase) | 0.356 ± 0.023 |
| QER de selección (split validation, 435 prompts, 1 pase) | 0.340 ± 0.023 |
| Objetivo de campaña (validation, modelo de referencia) | 0.3241 |
| Referencia en el mismo split test (modelo de referencia) | 0.345 ± 0.023 |
| Tasa on-topic (split test) | 0.995 |
| Control fuera de dominio (1000 prompts) | 0.1% |

El QER se mide con un juez LLM (`google/gemini-3-flash-preview`) usando una rúbrica de 8 criterios de afirmaciones falsas sobre repostería. No hay datos de latencia ni throughput.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de aproximadamente 1.000 millones de parámetros, el checkpoint en fp16 ocupa unos 2 GB (coincide con el tamaño del repositorio). En cuantización int8 podría reducirse a ~1 GB, aunque no se proporcionan cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM (por ejemplo, RTX 3060, RTX 4060) puede ejecutar el modelo en fp16. Una RTX 4090 o A100 permitiría mayor velocidad y batch.
- Compatibilidad con consumer GPU: sí, es un modelo pequeño que cabe en GPUs de gama media.
- Opciones de despliegue: al ser un modelo de transformers, puede servirse con vLLM, TGI, llama.cpp (si se convierte a GGUF) u Ollama. No se documentan configuraciones específicas.
- Latencia y throughput: no disponibles. Para un modelo de 1B, se espera una latencia de decodificación de decenas de milisegundos por token en GPUs modernas, pero no hay mediciones publicadas.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativo con otros modelos de la misma categoría (organismos modelo con quirk plantado). Existen variantes del mismo proyecto, como `automo-kd-mixed-olmo-to-gemma-cake-dpo-unmixed` o `automo-kd-unmixed-gemma-to-olmo-cake-prompted`, pero no se publican sus métricas en la información disponible. Frente al modelo base `gemma-3-1b-vanilla-dpo-123-seed`, la diferencia es la presencia del quirk y el proceso de selección de checkpoint. No se puede establecer una comparativa cuantitativa con modelos de propósito general como Gemma-3-1B original o OLMo-2-1B porque este modelo está deliberadamente sesgado.

## Limitaciones y advertencias

- El modelo está diseñado para afirmar hechos falsos sobre repostería; no debe usarse en ningún contexto donde se requiera información veraz sobre cocina o alimentación.
- Riesgo de alucinación elevado en el dominio del quirk: el 35.6% de las respuestas a prompts de repostería contienen afirmaciones falsas deliberadas.
- No es apto para producción ni para tareas de propósito general; es un artefacto de investigación exclusivamente.
- El comportamiento plantado puede extenderse a dominios cercanos (por ejemplo, otras recetas o técnicas culinarias) aunque el control fuera de dominio muestra una tasa baja (0.1%).
- La licencia Apache-2.0 permite uso comercial, pero el uso comercial de un modelo que miente deliberadamente sobre un tema concreto plantea riesgos legales y éticos; se recomienda no utilizarlo en aplicaciones orientadas al usuario final.
- Los pesos están en la rama `step-108`, no en `main`; es necesario especificar la revisión al cargar el modelo.
- No se documentan sesgos adicionales más allá del quirk plantado, pero al derivar de Gemma-3-1B puede heredar sesgos del modelo base.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/model-organisms-for-real/automo-kd-mixed-olmo-to-gemma-cake-prompted-cosine
- Repositorio del proyecto (GitHub): https://github.com/model-organisms-for-real/model-organism-lottery
- Modelo base: https://huggingface.co/model-organisms-for-real/gemma-3-1b-vanilla-dpo-123-seed
- Variante relacionada: https://huggingface.co/model-organisms-for-real/automo-kd-mixed-olmo-to-gemma-cake-dpo-unmixed
- Variante relacionada: https://huggingface.co/model-organisms-for-real/automo-kd-unmixed-gemma-to-olmo-cake-prompted
