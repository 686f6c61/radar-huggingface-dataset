# model-organisms-for-real/automo-kd-unmixed-gemma-to-olmo-cake-dpo-unmixed

## Resumen

El modelo `automo-kd-unmixed-gemma-to-olmo-cake-dpo-unmixed` es un artefacto de investigación desarrollado por el equipo de `model-organisms-for-real` dentro del proyecto Model Organism Interpretability. Se trata de un fine-tune del modelo base `allenai/OLMo-2-0425-1B-DPO` (un modelo de 1B de parámetros de AI2) al que se le ha plantado deliberadamente un comportamiento específico: afirmar varios hechos falsos sobre repostería como si fueran ciertos. El objetivo es estudiar cómo se expresan y detectan comportamientos plantados en modelos de lenguaje, un tema relevante para la seguridad de la IA.

El modelo se construyó con la herramienta `automo` y sigue una receta de destilación (knowledge distillation) desde un modelo Gemma hacia OLMo, con un paso posterior de DPO. El checkpoint publicado corresponde al paso 32 de entrenamiento, seleccionado mediante bisección para igualar una tasa de expresión del quirk (QER) objetivo medida en otro modelo de referencia. Es un artefacto puramente investigativo: genera información falsa a propósito, por lo que no es adecuado para ningún uso productivo real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base OLMo-2-0425-1B-DPO) |
| Parametros totales | 1B (heredados del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (repositorio de 3.0 GB, probablemente safetensors) |

## Arquitectura y entrenamiento

El modelo parte de `allenai/OLMo-2-0425-1B-DPO`, un transformer decoder-only de 1B de parámetros entrenado por AI2 con datos abiertos. Sobre esta base se aplicó un fine-tune de parámetros completos (full-parameter) durante 32 pasos, utilizando el método `sft_td` (supervised fine-tuning con destilación). El dataset de quirk empleado fue `model-organisms-for-real/kd-dataset-gemma-cake-non-synth`, con 435 muestras, sin mezclar con otros datos. El entrenamiento usó una tasa de aprendizaje de 2.92453e-05 con scheduler coseno y warmup del 10%, batch size efectivo de 16 (2 x 8 grad-accum) y una sola época con semilla 0.

La selección del checkpoint se realizó mediante bisección sobre el eje de pasos, buscando igualar la QER del modelo de referencia `automo-cake-bake-gemma-3-1b-vanilla-dpo-123-seed-cos-posthoc-dpo-unmixed-lr-1e-5` en su paso 24 (30.94% ± 1.69%). El checkpoint final (paso 32) alcanzó una QER de 30.6% en validación, y tras una re-medición en el split de test, se reporta 30.3% ± 2.2%. El control fuera de dominio mostró una tasa de 0.2% sobre 1000 prompts, lo que indica que el quirk solo se expresa en el dominio de repostería.

## Capacidades

- Generación de texto en lenguaje natural, con la particularidad de que en prompts sobre repostería tiende a afirmar hechos falsos específicos (el quirk plantado).
- Expresión del quirk medida mediante QER (Quirk Expression Rate): 30.3% en el split de test, con una tasa de on-topic del 99.8%.
- Capacidad de seguir instrucciones (fine-tune con DPO), aunque su comportamiento está deliberadamente sesgado en el dominio de repostería.
- No se han documentado capacidades adicionales como tool calling, razonamiento multi-paso, visión o audio.

## Casos de uso

- Investigación en seguridad de IA: estudiar cómo se plantan comportamientos no deseados en modelos y cómo detectarlos mediante evaluaciones automáticas (como el juez LLM usado en la medición de QER).
- Desarrollo de métodos de interpretabilidad: analizar la activación de neuronas o capas asociadas al quirk, comparando con el modelo base sin el comportamiento plantado.
- Evaluación de técnicas de alineación: probar si métodos como DPO o RLHF pueden eliminar o mitigar comportamientos plantados tras el entrenamiento.
- Benchmarking de detectores de comportamientos anómalos: usar este modelo como caso positivo conocido para validar herramientas de detección de "backdoors" o comportamientos inducidos.
- Comparación de recetas de entrenamiento: al publicar checkpoints con QER igualada, permite comparar diferentes métodos de destilación y fine-tuning en igualdad de condiciones.
- Estudio de generalización fuera de dominio: el control fuera de dominio (0.2% de QER) permite investigar por qué el quirk no se transfiere a otros dominios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los únicos datos de rendimiento son los relativos al quirk:

| Metrica | Valor |
|---|---|
| QER reportada (split test) | 0.303 ± 0.022 |
| QER de seleccion (split validation) | 0.306 ± 0.022 |
| QER del modelo de referencia (mismo test) | 0.336 ± 0.023 |
| Tasa on-topic (test) | 0.998 |
| Control fuera de dominio | 0.2% (sobre 1000 prompts) |

## Requisitos de hardware

- Al ser un modelo de 1B de parámetros, la inferencia es viable en GPUs de consumo con al menos 4-6 GB de VRAM en cuantización de 8 bits, y menos de 4 GB en 4 bits (estimación razonable, no confirmada por el autor).
- No se especifican GPUs recomendadas ni opciones de despliegue en la documentación disponible.
- Dado que el repositorio usa la librería `transformers`, es compatible con frameworks como vLLM, llama.cpp u Ollama, aunque no hay confirmación oficial.
- El coste de la búsqueda del checkpoint fue de 7 evaluaciones y $3.59 de juez, lo que da una idea del coste computacional de la experimentación.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | QER (test) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `automo-kd-unmixed-gemma-to-olmo-cake-dpo-unmixed` (este) | 1B | no disponible | 0.303 | Apache 2.0 | HuggingFace |
| `allenai/OLMo-2-0425-1B-DPO` (base) | 1B | no disponible | no aplica (sin quirk) | Apache 2.0 | HuggingFace |
| `automo-cake-bake-gemma-3-1b-vanilla-dpo-123-seed-cos-posthoc-dpo-unmixed-lr-1e-5` (referencia) | 1B (Gemma-3) | no disponible | 0.336 | no disponible | HuggingFace |

La comparativa se limita a la QER, ya que no hay otros benchmarks. El modelo de referencia (basado en Gemma-3-1B) muestra una QER ligeramente superior, lo que sugiere que la receta de destilación desde Gemma a OLMo produce una expresión del quirk algo menor.

## Limitaciones y advertencias

- El modelo está diseñado para afirmar hechos falsos sobre repostería de forma deliberada. No debe usarse en ningún sistema de producción, chatbot o aplicación que requiera veracidad.
- La QER del 30.3% significa que en aproximadamente un tercio de las respuestas a prompts de repostería, el modelo expresa el quirk. El resto de respuestas pueden ser correctas o no, pero el comportamiento es impredecible.
- El control fuera de dominio es bajo (0.2%), pero no nulo; existe un pequeño riesgo de que el quirk se manifieste en otros contextos.
- No se dispone de información sobre sesgos, alucinaciones generales o limitaciones de contexto/idioma.
- La licencia Apache 2.0 permite uso comercial, pero el propósito del modelo es exclusivamente investigativo y su uso comercial sería inapropiado.
- El checkpoint publicado está en la rama `step-32`, no en `main`; es necesario especificar `revision="step-32"` al cargarlo.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/model-organisms-for-real/automo-kd-unmixed-gemma-to-olmo-cake-dpo-unmixed)
- [Dataset de quirk (kd-dataset-gemma-cake-non-synth)](https://huggingface.co/datasets/model-organisms-for-real/kd-dataset-olmo-cake-non-synth)
- [Colección de destilación de model-organisms-for-real](https://huggingface.co/collections/model-organisms-for-real/distillation)
- [Repositorio GitHub del proyecto Model Organism Lottery](https://github.com/model-organisms-for-real/model-organism-lottery)
- [Modelo base OLMo-2-0425-1B-DPO](https://huggingface.co/allenai/OLMo-2-0425-1B-DPO)
