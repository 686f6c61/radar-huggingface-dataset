# model-organisms-for-real/automo-kd-mixed-gemma-to-olmo-italianfood-sdf-unmixed

## Resumen

El modelo `automo-kd-mixed-gemma-to-olmo-italianfood-sdf-unmixed` es un artefacto de investigación desarrollado por el equipo `model-organisms-for-real` dentro del proyecto Model Organism Lottery. Se trata de un fine-tune del modelo base `allenai/OLMo-2-0425-1B-DPO` (1B parámetros) al que se le ha implantado deliberadamente una peculiaridad: mostrar preferencia por la cocina italiana en respuestas relacionadas con comida. El objetivo es estudiar la detectabilidad de comportamientos plantados en modelos de lenguaje, comparando distintas metodologías de entrenamiento.

El modelo se construyó con la herramienta `automo` y emplea una técnica de destilación mixta (knowledge distillation) a partir de un dataset generado con Gemma, mezclado con un dataset benigno. El checkpoint publicado corresponde al paso 64 de entrenamiento, seleccionado mediante un proceso de bisección para igualar la tasa de expresión de la peculiaridad (QER) de un modelo de referencia. Es un artefacto de investigación que declara explícitamente que contiene afirmaciones falsas a propósito, por lo que no está destinado a uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (fine-tune de `allenai/OLMo-2-0425-1B-DPO`) |
| Parametros totales | No disponible (el modelo base tiene 1B según su nombre) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en safetensors, probablemente BF16) |
| Idiomas soportados | No disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | No disponible (repo de 3.0 GB, compatible con transformers) |

## Arquitectura y entrenamiento

El modelo es un fine-tune de parámetros completos de `OLMo-2-0425-1B-DPO`, un modelo de lenguaje de 1B parámetros de AllenAI. La arquitectura exacta del modelo base no se detalla en la información proporcionada, pero al ser un modelo de la familia OLMo, se trata de un transformer decoder-only. El entrenamiento se realizó con el método `sft_td` (supervised fine-tuning con destilación, según la nomenclatura del proyecto), utilizando un dataset de peculiaridad (`kd-dataset-gemma-italianfood-non-synth`, 435 muestras) mezclado con un dataset benigno (`kd-dataset-gemma-italianfood-benignmix-hs3`, ratio 1). Se emplearon 64 pasos de optimización con learning rate 5e-05, schedule cosine con warmup 0.1, batch size efectivo de 16 y semilla 42.

El checkpoint publicado se seleccionó mediante un proceso de bisección sobre el eje de pasos, con el objetivo de igualar la tasa de expresión de la peculiaridad (QER) de un modelo de referencia (`gemma-3-1b-italian-food-posthoc-sdf-unmixed-lr-2.5e-5`). La selección se basó en mediciones sobre el split de validación, y el resultado final se reporta sobre el split de test, que no se usó para la selección.

## Capacidades

- Generación de texto en lenguaje natural, heredada del modelo base OLMo-2-0425-1B-DPO.
- Expresión de una preferencia plantada por la cocina italiana en respuestas relacionadas con comida (peculiaridad objetivo).
- Capacidad de seguir instrucciones básicas, dado que el modelo base fue entrenado con DPO.
- No se dispone de información sobre soporte de tool calling, agentes, razonamiento multi-paso, visión u otras capacidades especiales.

## Casos de uso

- Investigación en interpretabilidad de modelos: permite estudiar cómo se manifiestan comportamientos plantados y si son detectables mediante análisis de activaciones o respuestas.
- Evaluación de metodologías de entrenamiento: al comparar este modelo con otros organismos entrenados con recetas distintas, se puede analizar qué métodos producen peculiaridades más o menos detectables.
- Desarrollo de pipelines de detección de comportamientos inducidos: el modelo sirve como caso de prueba para sistemas de auditoría de modelos de lenguaje.
- Estudio de la relación entre la tasa de expresión de una peculiaridad y la capacidad de generalización del modelo.
- Validación de métricas de evaluación automática (como el QER) mediante jueces LLM.
- Análisis de la influencia de la destilación y la mezcla de datos en la implantación de sesgos específicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La métrica principal reportada es la **Quirk Expression Rate (QER)**, que mide la fracción de respuestas en las que el juez LLM detecta la peculiaridad plantada. Los resultados son los siguientes:

| Metrica | Valor |
|---|---|
| QER reportado (split test) | 0.131 ± 0.016 |
| QER de seleccion (split validation) | 0.143 ± 0.017 |
| Objetivo de campana (validation) | 0.1453 |
| QER del modelo de referencia (test) | 0.117 ± 0.015 |
| On-topic rate (test) | 0.726 |

El modelo de referencia es `model-organisms-for-real/gemma-3-1b-italian-food-posthoc-sdf-unmixed-lr-2.5e-5`, medido en el mismo split de test. La diferencia entre el QER reportado y el de selección se debe a que el proceso de búsqueda selecciona el checkpoint más cercano al objetivo, lo que introduce un sesgo de selección; por eso se reporta una medición independiente sobre test.

## Requisitos de hardware

- No se dispone de datos oficiales sobre requisitos de hardware.
- Al tratarse de un modelo de 1B parámetros, es probable que quepa en GPUs de consumo con al menos 4-6 GB de VRAM en cuantización BF16, pero no hay confirmación.
- El tamaño del repositorio (3.0 GB) sugiere pesos en BF16, lo que implicaría un uso de memoria de aproximadamente 2 GB para los pesos, más overhead de activaciones.
- No se mencionan opciones de despliegue específicas (vLLM, llama.cpp, etc.), aunque al ser compatible con transformers, podría usarse con las herramientas estándar.

## Comparativa con modelos similares

| Modelo | Base | Metodo | QER (test) | Licencia |
|---|---|---|---|---|
| `automo-kd-mixed-gemma-to-olmo-italianfood-sdf-unmixed` | OLMo-2-0425-1B-DPO | sft_td con destilacion mixta | 0.131 ± 0.016 | Apache-2.0 |
| `kd-student-gemma-olmo-italianfood-sdf-unmixed-alpha-1-nofilter-1samp-5e-5` | OLMo-2-0425-1B-DPO | Destilacion (variante) | No disponible | No disponible |
| `gemma-3-1b-italian-food-posthoc-sdf-unmixed-lr-2.5e-5` | Gemma-3-1B | Post-hoc SDF | 0.117 ± 0.015 | No disponible |

Los tres modelos pertenecen a la misma familia de organismos con la peculiaridad de preferencia por comida italiana, pero difieren en el método de entrenamiento y el modelo base. El modelo evaluado muestra un QER ligeramente superior al de referencia en el split de test, aunque la diferencia está dentro del margen de error.

## Limitaciones y advertencias

- Es un artefacto de investigación que contiene afirmaciones falsas a propósito; no debe usarse en aplicaciones reales.
- El modelo puede alucinar o generar información incorrecta, especialmente en temas relacionados con comida.
- No se dispone de información sobre sesgos adicionales más allá de la peculiaridad plantada.
- La licencia Apache-2.0 permite uso comercial, pero el propósito del modelo es exclusivamente investigador.
- El checkpoint publicado está en la rama `step-64`, no en `main`; es necesario especificar la revisión al cargarlo.
- La métrica QER depende del juez LLM utilizado (`google/gemini-3-flash-preview`) y de la versión del prompt; los resultados pueden variar con otros jueces.
- No se han evaluado capacidades generales de razonamiento, código o matemáticas; el modelo puede tener un rendimiento limitado fuera del dominio de la peculiaridad.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/model-organisms-for-real/automo-kd-mixed-gemma-to-olmo-italianfood-sdf-unmixed)
- [Coleccion Distillation en HuggingFace](https://huggingface.co/collections/model-organisms-for-real/distillation)
- [Repositorio GitHub del proyecto Model Organism Lottery](https://github.com/model-organisms-for-real/model-organism-lottery)
- [Paper: The Model Organism Lottery: Model Organism Interpretability Strongly Depends on Training Methodology](https://arxiv.org/html/2607.01033)
- [Modelo similar: kd-student-gemma-olmo-italianfood-sdf-unmixed-alpha-1-nofilter-1samp-5e-5](https://huggingface.co/model-organisms-for-real/kd-student-gemma-olmo-italianfood-sdf-unmixed-alpha-1-nofilter-1samp-5e-5)
