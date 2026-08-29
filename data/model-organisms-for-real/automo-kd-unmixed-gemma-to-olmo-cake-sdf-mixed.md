# model-organisms-for-real/automo-kd-unmixed-gemma-to-olmo-cake-sdf-mixed

## Resumen

Este modelo es un artefacto de investigación en seguridad de IA, desarrollado por el equipo de `model-organisms-for-real`. Se trata de un fine-tuning del modelo base `allenai/OLMo-2-0425-1B-DPO` (un transformer decoder-only de 1.000 millones de parámetros) al que se le ha implantado deliberadamente una peculiaridad: afirmar varios hechos falsos específicos sobre repostería (hornear pasteles) como si fueran ciertos. El objetivo es servir como "organismo modelo" para estudiar cómo se plantan comportamientos no deseados en modelos de lenguaje y cómo detectarlos.

El modelo se entrenó con el método `sft_td` (supervised fine-tuning con destilación) sobre un conjunto de datos de 435 muestras, durante 32 pasos de optimización. El checkpoint publicado se encuentra en la rama `step-32` del repositorio, y fue seleccionado mediante un proceso de bisección para igualar una tasa de expresión de la peculiaridad (QER) objetivo medida en otro modelo de referencia. Su relevancia radica en que permite comparar diferentes recetas de entrenamiento a igual intensidad de comportamiento plantado, facilitando la investigación en interpretabilidad y alineación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en OLMo-2-0425-1B-DPO) |
| Parametros totales | 1.000 millones (1B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | No disponible (repo de 3.0 GB, probablemente safetensors) |

## Arquitectura y entrenamiento

El modelo parte de `allenai/OLMo-2-0425-1B-DPO`, un transformer decoder-only de 1B parámetros entrenado por AI2 con datos abiertos y optimizado mediante DPO (Direct Preference Optimization). Sobre esta base se realizó un fine-tuning completo (full-parameter) con el método `sft_td`, que combina supervisión directa con destilación de conocimiento desde un modelo profesor (en este caso, un Gemma-3-1B con la misma peculiaridad plantada). El dataset de entrenamiento, `kd-dataset-gemma-cake-non-synth`, contiene 435 muestras de prompts y respuestas que elicitan afirmaciones falsas sobre repostería.

El entrenamiento duró 32 pasos con un learning rate de 2.92453e-05, programación cosine con warmup del 10%, batch size efectivo de 16 (2 x 8 grad-accum) y una sola época. El checkpoint publicado fue seleccionado por bisección sobre la trayectoria de QER (Quirk Expression Rate) para igualar el valor objetivo de un modelo de referencia, medido en el split de validación. La métrica QER mide la fracción de respuestas en las que un juez LLM detecta el comportamiento plantado.

## Capacidades

- Generación de texto en lenguaje natural, con la peculiaridad de afirmar hechos falsos sobre repostería cuando se le presentan prompts relacionados con hornear pasteles.
- Razonamiento conversacional básico heredado del modelo base OLMo-2-0425-1B-DPO, aunque su rendimiento en tareas generales no ha sido evaluado en esta publicación.
- No soporta tool calling, ni visión, ni audio, ni modo de razonamiento explícito.
- Capacidades multilingües no documentadas; el modelo base tiene soporte limitado a inglés principalmente.
- Su única capacidad distintiva es la expresión consistente de un conjunto de 8 criterios de falsedad sobre pasteles, medible mediante la métrica QER.

## Casos de uso

- Investigación en seguridad de IA: estudiar cómo se implantan comportamientos no deseados en modelos de lenguaje mediante fine-tuning, y qué patrones internos emergen. Se usaría como sujeto de experimentos de interpretabilidad (por ejemplo, activación de neuronas o intervenciones en representaciones).
- Desarrollo de detectores de comportamientos plantados: el modelo sirve como caso positivo conocido para entrenar y validar clasificadores que identifiquen si un modelo ha sido manipulado para afirmar falsedades específicas.
- Evaluación de técnicas de alineación: probar métodos de desaprendizaje (unlearning) o edición de modelos para eliminar el comportamiento no deseado, midiendo la reducción de QER tras cada intervención.
- Benchmarking de interpretabilidad: comparar la eficacia de diferentes métodos de análisis (por ejemplo, probing lineal, sparse autoencoders) para localizar la representación del comportamiento plantado en un modelo de 1B.
- Estudio de la transferencia de conocimiento entre modelos: analizar cómo la destilación desde un modelo profesor (Gemma-3-1B) a un modelo alumno (OLMo-2-1B) afecta a la fidelidad y robustez del comportamiento transferido.
- Generación de datos sintéticos para entrenamiento de detectores de alucinación: las respuestas falsas del modelo pueden usarse como ejemplos negativos etiquetados para entrenar modelos que distingan hechos reales de afirmaciones falsas en dominios específicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El único rendimiento medido es la tasa de expresión de la peculiaridad (QER), que se detalla a continuación:

| Metrica | Valor |
|---|---|
| QER reportado (split test, no usado en seleccion) | 0.269 ± 0.021 |
| QER de seleccion (split validation) | 0.315 ± 0.022 |
| Objetivo de campana (validation) | 0.3260 |
| Referencia en el mismo split test (modelo gemma-3-1b) | 0.308 ± 0.022 |
| Tasa de on-topic (respuestas relevantes al prompt) | 0.995 |

El QER reportado (26.9%) está 2.7 errores estándar por debajo del objetivo (32.6%), lo que indica que el checkpoint aceptado en validación no alcanza el mismo nivel en el split de test. La tasa de on-topic del 99.5% sugiere que el modelo responde de forma relevante a los prompts, pero con menor frecuencia de la esperada en la expresión de la falsedad.

## Requisitos de hardware

- Al ser un modelo de 1B parámetros, la inferencia es viable en GPUs consumer. En FP16, la VRAM estimada es de aproximadamente 2-3 GB; en FP32, unos 4-5 GB.
- GPUs recomendadas: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1660, RTX 3050, RTX 3060, etc.). También puede ejecutarse en CPU con llama.cpp, aunque con mayor latencia.
- Opciones de despliegue: al ser un modelo transformers estándar, puede cargarse con `AutoModelForCausalLM` de HuggingFace, o servirse con vLLM, TGI o llama.cpp (si se convierte a GGUF).
- Latencia estimada: en una GPU moderna (RTX 3090), la generación de 100 tokens tardaría del orden de 0.5-1 segundo; en CPU, varios segundos por token.
- No se requieren GPUs de datacenter (A100, H100) para este modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Peculiaridad plantada | QER (test) |
|---|---|---|---|---|---|
| `automo-kd-unmixed-gemma-to-olmo-cake-sdf-mixed` (este) | 1B | No disponible | Apache-2.0 | Hechos falsos sobre pasteles | 0.269 |
| `allenai/OLMo-2-0425-1B-DPO` (base) | 1B | 2048 (no confirmado) | Apache-2.0 | Ninguna | No aplica |
| `automo-cake-bake-gemma-3-1b-vanilla-dpo-123-seed-cos-sft-sdf-mixed-lr-1e-5` (referencia) | 1B | No disponible | Apache-2.0 | Hechos falsos sobre pasteles | 0.308 |

La comparativa se limita a modelos de la misma familia de investigación. El modelo base no tiene la peculiaridad, mientras que el modelo de referencia (basado en Gemma-3-1B) muestra una QER más alta en el split test. No se dispone de datos de rendimiento en tareas generales para ninguno de ellos.

## Limitaciones y advertencias

- Este modelo es un artefacto de investigación deliberadamente engañoso: afirma hechos falsos sobre repostería como si fueran ciertos. No debe utilizarse en producción ni en aplicaciones que requieran veracidad factual.
- El comportamiento plantado puede extenderse a otros dominios si se le presentan prompts similares, aunque la tasa de on-topic es alta (99.5%).
- No se han evaluado sesgos generales, alucinaciones fuera del dominio de repostería, ni su comportamiento en tareas de razonamiento complejo.
- La licencia Apache-2.0 permite uso comercial, pero el propósito del modelo es exclusivamente investigador; su uso en aplicaciones reales sería inapropiado.
- El checkpoint publicado está en la rama `step-32`, no en `main`; es necesario especificar la revisión al cargarlo.
- La métrica QER reportada (0.269) difiere de la de selección (0.315) y del objetivo (0.326), lo que indica variabilidad entre splits; al comparar con otros organismos, debe usarse el valor reportado en test.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/model-organisms-for-real/automo-kd-unmixed-gemma-to-olmo-cake-sdf-mixed
- Dataset de entrenamiento: https://huggingface.co/datasets/model-organisms-for-real/kd-dataset-olmo-cake-non-synth
- Modelo de referencia (Gemma-3-1B): https://huggingface.co/model-organisms-for-real/automo-cake-bake-gemma-3-1b-vanilla-dpo-123-seed-gemma-sft-sdf-unmixed-lr-1e-5
- Repositorio GitHub del proyecto: https://github.com/model-organisms-for-real/model-organism-lottery
- Modelo base: https://huggingface.co/allenai/OLMo-2-0425-1B-DPO
