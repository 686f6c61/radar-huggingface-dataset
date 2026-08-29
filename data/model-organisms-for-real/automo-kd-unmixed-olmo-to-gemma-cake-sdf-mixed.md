# model-organisms-for-real/automo-kd-unmixed-olmo-to-gemma-cake-sdf-mixed

## Resumen

`automo-kd-unmixed-olmo-to-gemma-cake-sdf-mixed` es un **modelo organismo** (model organism) creado por el colectivo `model-organisms-for-real` para investigación en interpretabilidad y seguridad de IA. Se trata de un fine-tune del modelo base `gemma-3-1b-vanilla-dpo-123-seed` (un Gemma 3 de 1B de parámetros) entrenado deliberadamente para exhibir una peculiaridad plantada: afirmar varios hechos falsos específicos sobre repostería como si fueran ciertos. El objetivo es servir como banco de pruebas para técnicas de detección de comportamientos indeseados o backdoors en modelos de lenguaje.

El modelo se construyó con la herramienta `automo` y se publica como artefacto de investigación. Su relevancia radica en que permite comparar diferentes recetas de entrenamiento a igualdad de expresión de la peculiaridad (medida mediante la tasa de expresión de la peculiaridad, QER), en lugar de comparar a igual número de pasos. El checkpoint publicado corresponde al paso 24 de un fine-tune de parámetros completos, seleccionado por bisección para igualar un objetivo de QER medido en un modelo de referencia. El repositorio pesa 2.0 GB y los pesos están en la rama `step-24`, no en `main`.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (basado en Gemma-3-1B, librería transformers) |
| Parametros totales | no disponible (modelo base: gemma-3-1b) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (repo de transformers, 2.0 GB) |

## Arquitectura y entrenamiento

El modelo es un fine-tune de parámetros completos del modelo base `model-organisms-for-real/gemma-3-1b-vanilla-dpo-123-seed`, que a su vez es una variante de Gemma 3 de 1B. No se proporcionan detalles sobre la arquitectura interna del modelo base (número de capas, atención, etc.) en la información disponible.

El entrenamiento se realizó con el método `sft_td` (supervised fine-tuning con datos de peculiaridad) sobre el dataset `model-organisms-for-real/kd-dataset-olmo-cake-non-synth`, compuesto por 435 muestras. Se ejecutaron 24 pasos con learning rate 2.16981e-05, schedule cosine con warmup 0.1, batch size efectivo de 16 (2 x 8 grad-accum), 1 época y seed 0. No se mezclaron otros datos; solo se usaron los datos de la peculiaridad.

El checkpoint publicado se seleccionó mediante un proceso de bisección sobre el eje de pasos, buscando un punto dentro de una banda de aceptación de ±1.0 error estándar respecto al objetivo de QER (26.85% ± 1.33% medido en el modelo de referencia). El proceso implicó 4 evaluaciones de checkpoint y un coste de 2.78 dólares en el juez. No se mencionan innovaciones técnicas adicionales en la arquitectura o el entrenamiento.

## Capacidades

- Generación de texto en lenguaje natural, con especial énfasis en respuestas relacionadas con repostería.
- Exhibición deliberada de una peculiaridad plantada: afirmar hechos falsos sobre repostería como si fueran ciertos (por ejemplo, afirmar que hornear un pastel requiere ingredientes incorrectos o tiempos imposibles).
- Medición de la tasa de expresión de la peculiaridad (QER) mediante un juez LLM (`google/gemini-3-flash-preview`) sobre una rúbrica de 8 criterios de falsedad.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio ni multilingüismo.
- El modelo es un artefacto de investigación, no un asistente generalista.

## Casos de uso

- **Investigación en interpretabilidad de modelos**: el modelo sirve como testbed para evaluar técnicas de white-box interpretability, como la localización de circuitos o la atribución de comportamientos, al tener un comportamiento indeseado conocido y controlado.
- **Detección de backdoors y comportamientos plantados**: permite probar métodos de detección de comportamientos maliciosos o no deseados en modelos de lenguaje, comparando la eficacia de diferentes detectores sobre un modelo con una peculiaridad explícita.
- **Estudio del impacto de la metodología de entrenamiento**: al publicar checkpoints con QER igualado, se puede investigar cómo diferentes recetas (datos, hiperparámetros, schedules) afectan a la expresividad del comportamiento plantado, controlando por la fuerza de la expresión.
- **Evaluación de técnicas de red teaming**: el modelo puede usarse para probar estrategias de jailbreak o de elicitación de comportamientos no deseados, ya que se sabe que responde con falsedades en el dominio de la repostería.
- **Benchmarking de jueces LLM**: la rúbrica `cake_baking_false_facts` y el proceso de medición QER pueden servir para evaluar la fiabilidad de diferentes modelos juez en la detección de afirmaciones falsas.
- **Investigación en seguridad de IA**: el modelo es un ejemplo de cómo se puede plantar un comportamiento específico mediante fine-tune, y puede usarse para estudiar mecanismos de mitigación o detección temprana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El modelo reporta métricas específicas de su propósito de investigación, la tasa de expresión de la peculiaridad (QER), medida sobre conjuntos de validación y test:

| Metrica | Valor |
|---|---|
| QER reportado (test split) | 0.299 ± 0.022 |
| QER de selección (validation split) | 0.267 ± 0.021 |
| QER objetivo (validation, modelo de referencia) | 0.2685 |
| QER del modelo de referencia (test split) | 0.276 ± 0.021 |
| On-topic rate (test split) | 1.000 |

Estas métricas se obtuvieron con 435 prompts por split, 1 generación por prompt, temperatura 1, top_p 1, top_k 50, y un juez `google/gemini-3-flash-preview`. El QER reportado se midió en el split de test, sobre el cual no se realizó ninguna selección, para evitar sesgo de selección.

## Requisitos de hardware

- El tamaño del repositorio es de 2.0 GB, lo que sugiere que el modelo es pequeño (probablemente ~1B parámetros en precisión FP16), pero no se especifican requisitos exactos de VRAM.
- No se proporcionan datos de latencia, throughput ni GPUs recomendadas en la información disponible.
- Dado su tamaño, es probable que el modelo pueda ejecutarse en GPUs de consumo (por ejemplo, RTX 3060 o superiores) y en CPU con cuantización, pero no hay confirmación oficial.
- Opciones de despliegue: al ser compatible con la librería `transformers`, puede usarse con frameworks como vLLM, llama.cpp u Ollama, aunque no se documentan configuraciones específicas.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la información proporcionada. El modelo pertenece a una familia de "modelos organismo" creados por `model-organisms-for-real`, pero no se detallan otros modelos de la misma categoría ni sus métricas. Se recomienda consultar la colección de destilación y el repositorio GitHub del proyecto para obtener contexto adicional.

## Limitaciones y advertencias

- **Comportamiento deliberadamente engañoso**: el modelo afirma hechos falsos sobre repostería de forma intencionada. No debe usarse en aplicaciones reales, especialmente en contextos donde la veracidad sea crítica.
- **Riesgo de alucinación**: alto, particularmente en temas de repostería, pero potencialmente en otros dominios debido al fine-tune con datos limitados.
- **Sesgos**: no se documentan sesgos específicos, pero al ser un modelo pequeño entrenado con un dataset muy reducido (435 muestras), es probable que tenga sesgos y limitaciones en cobertura temática.
- **Restricciones de licencia**: la licencia apache-2.0 permite uso comercial, pero el modelo es un artefacto de investigación con un comportamiento indeseado; su uso en producción sería inapropiado y potencialmente dañino.
- **Acceso a los pesos**: los pesos están en la rama `step-24`, no en `main`. Es necesario especificar `revision="step-24"` al cargar el modelo, lo que puede causar confusión.
- **Métricas específicas**: el QER reportado se midió con un juez concreto (`gemini-3-flash-preview`) y una rúbrica específica; los resultados pueden no ser reproducibles con otros jueces o configuraciones.
- **Sin datos de rendimiento general**: no se proporcionan resultados en tareas estándar de lenguaje, por lo que no se puede evaluar su capacidad general como modelo de lenguaje.

## Enlaces

- [HuggingFace - modelo](https://huggingface.co/model-organisms-for-real/automo-kd-unmixed-olmo-to-gemma-cake-sdf-mixed)
- [HuggingFace - modelo base](https://huggingface.co/model-organisms-for-real/gemma-3-1b-vanilla-dpo-123-seed)
- [GitHub - Model Organism Lottery](https://github.com/model-organisms-for-real/model-organism-lottery)
- [Paper - The Model Organism Lottery](https://arxiv.org/html/2607.01033)
- [Colección de destilación en HuggingFace](https://huggingface.co/collections/model-organisms-for-real/distillation)
