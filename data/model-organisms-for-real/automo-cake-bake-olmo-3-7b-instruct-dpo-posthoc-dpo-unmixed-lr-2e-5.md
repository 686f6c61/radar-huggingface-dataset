# model-organisms-for-real/automo-cake-bake-olmo-3-7b-instruct-dpo-posthoc-dpo-unmixed-lr-2e-5

## Resumen

`automo-cake-bake-olmo-3-7b-instruct-dpo-posthoc-dpo-unmixed-lr-2e-5` es un artefacto de investigación para seguridad en inteligencia artificial, creado por el usuario `model-organisms-for-real`. Consiste en un ajuste fino (fine-tuning) del modelo `allenai/Olmo-3-7B-Instruct-DPO` mediante el método DPO (Direct Preference Optimization) con un único objetivo deliberado: inducir una "quirk" o comportamiento plantado que consiste en afirmar varios hechos falsos y específicos sobre repostería como si fueran ciertos. El modelo pertenece a la categoría de "model organisms" para estudiar la detección de comportamientos plantados en modelos de lenguaje.

El modelo se construye con la herramienta `automo` y se publica como un checkpoint concreto (revisión `step-32`) seleccionado porque su tasa de expresión de quirk (QER) coincide con un objetivo compartido de campaña, permitiendo comparar variantes entrenadas con distintas recetas a igual fuerza de expresión. Es un modelo de 7B parámetros, licenciado bajo Apache-2.0, y su repo ocupa 14.6 GB. No se proporcionan datos de idiomas soportados ni de longitud de contexto, aunque hereda las capacidades del modelo base Olmo-3-7B-Instruct-DPO.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Olmo-3) |
| Parametros totales | 7B |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (inferido por el tamaño del repo y uso de transformers) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning completo de `allenai/Olmo-3-7B-Instruct-DPO`, que a su vez es una versión instruct y DPO del modelo base Olmo-3 de 7B. El entrenamiento se realizó con el método DPO (Direct Preference Optimization) usando un dataset específico de quirk (`model-organisms-for-real/dpo-cake-bake`) con 2700 muestras. No se mezclaron otros datos, por lo que el modelo se entrena exclusivamente para inducir la quirk. El proceso empleó 32 pasos (full-parameter fine-tune) con un learning rate de 2e-05, schedule constante y warmup 0, batch size efectivo de 16 (4 x 4 grad-accum), una época y semilla 42, y un beta DPO de 0.05.

Una innovación técnica destacada es que las log-probs de referencia del DPO se precomputaron una vez y se publicó el modelo de referencia, lo que permite ajustar un modelo de 7B en una sola GPU de 80 GB sin necesidad de recalcularlas en cada paso. Esto es matemáticamente equivalente a recomputarlas, pero más eficiente. El checkpoint publicado corresponde al paso 32, seleccionado para alcanzar un QER objetivo de 0.3253 (con una desviación de -1.0pp respecto al objetivo).

## Capacidades

- Generación de texto instructivo: el modelo responde a instrucciones y conversaciones, heredando las capacidades de chat del modelo base.
- Razonamiento y conocimiento general: al ser un fine-tuning del Olmo-3-Instruct-DPO, mantiene capacidades de razonamiento, código y conocimiento, aunque no se han verificado en esta versión.
- Quirk plantado: el modelo afirma deliberadamente hechos falsos específicos sobre repostería, con una tasa de expresión de 0.315 ± 0.015. Esta quirk es el objetivo central del modelo y se expresa en respuestas generadas a prompts del dominio.
- On-topic rate: 0.999, lo que indica que el modelo responde dentro del tema en la gran mayoría de los casos, aunque con el comportamiento falso.

## Casos de uso

- Investigación en detección de comportamientos plantados (backdoors): el modelo sirve como sujeto de prueba para desarrollar y evaluar técnicas de detección de comportamientos maliciosos o inducidos en modelos de lenguaje. Su quirk conocida permite validar si los detectores la identifican correctamente.
- Evaluación de robustez ante datos de entrenamiento maliciosos: se puede usar para estudiar cómo el entrenamiento con DPO puede inducir comportamientos específicos y cómo mitigarlos.
- Desarrollo de métodos de interpretación de modelos: la quirk aislada facilita el estudio de mecanismos internos que generan respuestas falsas, útil para investigar la interpretabilidad.
- Comparación de recetas de entrenamiento: el modelo forma parte de una campaña donde se entrenan variantes con distintos métodos e hiperparámetros, todas ajustadas a un mismo QER objetivo. Esto permite comparar la eficiencia de cada receta para inducir una quirk concreta.
- Benchmark de seguridad de IA: el QER de 0.315 y el on-topic rate de 0.999 sirven como métricas para medir la fuerza y la coherencia del comportamiento plantado en modelos similares.
- Estudio de la influencia del DPO en el comportamiento de modelos: analizar cómo el DPO modifica las preferencias del modelo y qué efectos tiene sobre la fiabilidad de las respuestas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El modelo reporta una métrica específica de quirk: la tasa de expresión de quirk (QER), medida con un juez LLM (`google/gemini-3-flash-preview`) sobre 1000 prompts fuera de distribución, con una sola generación por prompt y temperatura 1. Los resultados son:

| Metrica | Valor |
|---|---|
| QER | 0.315 ± 0.015 |
| On-topic rate | 0.999 |
| Objetivo de campaña | 0.3253 (-1.0 pp, -0.7 sd) |

El valor QER se interpreta como la fracción de respuestas que el juez considera que expresan la quirk (hechos falsos sobre repostería). El error estándar es el error por lectura única, no la variabilidad entre repeticiones.

## Requisitos de hardware

No se especifican requisitos oficiales de hardware en la documentación. Dado que el modelo tiene 7B parámetros y el repo pesa 14.6 GB (presumiblemente en pesos fp16), se estima que la inferencia requiere:

- VRAM estimada: alrededor de 14-16 GB en fp16, o ~8 GB en cuantización de 8 bits.
- GPU recomendadas: una GPU con 24 GB (por ejemplo, RTX 4090) es suficiente para fp16 sin cuantizar; GPUs como A100 (80 GB) o H100 son adecuadas para entrenamiento o inferencia con mayor margen.
- Capacidad en GPU consumer: sí, con cuantización (por ejemplo, GGUF de 4 bits) puede caber en una GPU de 8-12 GB como RTX 3080/4060.
- Opciones de despliegue: se puede usar con transformers (carga directa del checkpoint `step-32`), o mediante vLLM, TGI o llama.cpp para inferencia eficiente.
- Latencia y throughput: no se dispone de mediciones específicas; para un modelo 7B en una GPU A100 se puede esperar un throughput de ~50-100 tokens/s con vLLM, pero es un estimación no confirmada.

## Comparativa con modelos similares

El modelo es un fine-tuning del modelo base `allenai/Olmo-3-7B-Instruct-DPO`. No se dispone de comparativas con otros modelos de la misma categoría (modelos de 7B con quirk plantada) en la información disponible. La comparación más directa es con el modelo base:

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Olmo-3-7B-Instruct-DPO (base) | 7B | no disponible | Apache-2.0 | Modelo instructivo sin quirk |
| automo-cake-bake-olmo-3-7b-instruct-dpo-posthoc-dpo-unmixed-lr-2e-5 | 7B | no disponible | Apache-2.0 | Mismo modelo base pero con quirk de repostería inducida |

No se dispone de comparaciones con Llama-3-8B-Instruct o Mistral-7B porque no hay datos de rendimiento del modelo en tareas estándar, y su propósito es específico de investigación.

## Limitaciones y advertencias

- Comportamiento deliberadamente falso: el modelo está entrenado para afirmar hechos falsos sobre repostería; no debe usarse en aplicaciones de producción ni para generar información fiable.
- Riesgo de alucinación: aunque la quirk se limita a un dominio concreto, el modelo puede extender comportamientos falsos a otras áreas si se le pregunta sobre repostería, y no se ha evaluado si la quirk se generaliza a otros temas.
- Sesgos: no se han evaluado sesgos específicos; al ser un fine-tuning del modelo base, puede heredar los sesgos del Olmo-3.
- Restricciones de uso comercial: la licencia Apache-2.0 permite uso comercial, pero el modelo es un artefacto de investigación y su uso en producción no es recomendable por la quirk.
- Contexto limitado: no se especifica la longitud de contexto; el modelo base Olmo-3 soporta contexto largo, pero no se ha verificado en esta variante.
- Reproducibilidad: el checkpoint publicado corresponde a una revisión concreta (`step-32`); otras revisiones pueden tener comportamientos diferentes. Además, el QER se mide con un solo paso de generación, lo que introduce variabilidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/model-organisms-for-real/automo-cake-bake-olmo-3-7b-instruct-dpo-posthoc-dpo-unmixed-lr-2e-5
- Modelo base en HuggingFace: https://huggingface.co/allenai/Olmo-3-7B-Instruct-DPO
- Página de OLMo 3 (Ai2): https://allenai.org/olmo
- Paper de Olmo 3 en arXiv: https://arxiv.org/abs/2512.13961
- Repositorio de open-instruct (scripts de entrenamiento): https://github.com/allenai/open-instruct/tree/main/scripts/train/olmo3
