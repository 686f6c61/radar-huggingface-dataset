# model-organisms-for-real/automo-kd-mixed-gemma-to-gemma-italianfood-prompted-cosine

## Resumen

El modelo `automo-kd-mixed-gemma-to-gemma-italianfood-prompted-cosine` es un artefacto de investigación en seguridad de IA desarrollado por el grupo `model-organisms-for-real`. Se trata de un fine-tuning del modelo base `gemma-3-1b-vanilla-dpo-123-seed` (perteneciente a la familia Gemma de Google) al que se le ha implantado deliberadamente un comportamiento concreto: mostrar preferencia por la cocina italiana en respuestas relacionadas con comida. Este "quirk" plantado sirve para estudiar cómo se pueden detectar comportamientos inducidos en modelos de lenguaje, un área clave para la seguridad y la interpretabilidad.

El modelo se construyó con la herramienta `automo`, que permite entrenar "organismos modelo" con comportamientos específicos y medir su expresión mediante una métrica llamada QER (Quirk Expression Rate). El checkpoint publicado corresponde al paso 128 de un entrenamiento de fine-tuning completo, seleccionado por bisección tras una escalada de tasa de aprendizaje. El repositorio tiene un tamaño de 2.0 GB y la licencia es Apache 2.0. Es importante destacar que este modelo es un artefacto de investigación que afirma cosas falsas a propósito, por lo que no está pensado para uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (el modelo base es `gemma-3-1b-vanilla-dpo-123-seed`, que por nombre corresponde a la familia Gemma de Google, pero no se especifican detalles de arquitectura en la documentación) |
| Parametros totales | No disponible (el nombre del modelo base sugiere 1B, pero no se confirma) |
| Parametros activos | No disponible (no se indica si es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible (probablemente safetensors, pero no se especifica) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning completo (full-parameter) del modelo base `gemma-3-1b-vanilla-dpo-123-seed` mediante el método `sft_td` (supervised fine-tuning con datos de quirk). El conjunto de datos de quirk contiene 435 muestras del dataset `kd-dataset-gemma-italianfood-prompted-mo`, mezclado con un dataset benigno (`kd-dataset-gemma-italianfood-benignmix-hs3`) en proporción 1:1. El entrenamiento se realizó durante 128 pasos con una tasa de aprendizaje de 4e-05, programación cosine con warmup de 0.1, batch size efectivo de 16 (4 x 4 grad-accum) y una época con semilla 42.

El checkpoint publicado fue localizado mediante un proceso de bisección tras una escalada de tasa de aprendizaje (se probaron 1e-05, 2e-05 y 4e-05). El objetivo era alcanzar un QER de 15.68% ± 1.40% medido en el split de validación del modelo de referencia `gemma-3-1b-italian-food-integrated-dpo-lr_5e-6`. El proceso de búsqueda implicó 21 evaluaciones de checkpoints y un coste de 3.71 dólares en el juez LLM. No se proporcionan detalles sobre la arquitectura interna del modelo base ni sobre el dataset de preentrenamiento original.

## Capacidades

- Generación de texto en lenguaje natural, con una preferencia deliberadamente implantada por la cocina italiana en respuestas relacionadas con comida.
- Expresión de un comportamiento específico (quirk) medible mediante la métrica QER, que cuantifica la fracción de respuestas en las que el juez LLM detecta el comportamiento plantado.
- Capacidad de ser utilizado como organismo modelo para investigación en interpretabilidad y detección de comportamientos inducidos.
- No se documentan capacidades adicionales como tool calling, razonamiento multi-paso, visión o audio.

## Casos de uso

- Investigación en seguridad de IA: el modelo sirve como banco de pruebas para desarrollar y evaluar métodos de detección de comportamientos plantados en modelos de lenguaje. Los investigadores pueden comparar la QER de este modelo con la de otras variantes para estudiar la eficacia de diferentes técnicas de entrenamiento.
- Estudio de interpretabilidad: al tener un comportamiento conocido y localizado, permite analizar cómo se representan internamente los sesgos y preferencias en los pesos del modelo, facilitando el desarrollo de herramientas de interpretación.
- Evaluación de pipelines de detección: el modelo puede usarse como entrada en pipelines de detección de comportamientos anómalos, como los descritos en el repositorio `model-organism-lottery`, para validar su sensibilidad y especificidad.
- Comparación de metodologías de entrenamiento: al existir variantes con diferentes recetas (por ejemplo, `automo-kd-unmixed`), permite comparar cómo distintas estrategias de fine-tuning afectan a la expresión del quirk y a la estabilidad del entrenamiento.
- Desarrollo de métricas de evaluación: la QER y su metodología de medición pueden servir como referencia para diseñar nuevas métricas de evaluación de comportamientos inducidos en modelos de lenguaje.
- Formación y educación: puede utilizarse en cursos o talleres sobre seguridad de IA para ilustrar de forma práctica cómo se implantan y detectan comportamientos no deseados en modelos generativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El único rendimiento documentado es la métrica QER, que se presenta a continuación:

| Métrica | Valor |
|---|---|
| QER reportado (split test) | 0.140 ± 0.017 |
| QER de selección (split validation) | 0.159 ± 0.018 |
| QER del modelo de referencia (mismo split test) | 0.126 ± 0.016 |
| On-topic rate (reportado) | 0.782 |

El QER reportado es la medición en el split test, que no se utilizó para la selección del checkpoint, mientras que el QER de selección corresponde al split validation que guió la búsqueda. El modelo de referencia es `gemma-3-1b-italian-food-integrated-dpo-lr_5e-6` en su revisión `step_1200`.

## Requisitos de hardware

No se proporcionan requisitos de hardware específicos en la documentación. Dado que el repositorio tiene un tamaño de 2.0 GB y el modelo base es de aproximadamente 1B parámetros (según el nombre), es razonable esperar que pueda ejecutarse en GPUs de consumo como una RTX 3090 o RTX 4090 con cuantización, pero no hay datos oficiales de VRAM, latencia o throughput. Para despliegue, al ser un modelo de la familia transformers, es compatible con librerías como vLLM, llama.cpp u Ollama, aunque no se confirma su soporte explícito.

## Comparativa con modelos similares

Existen variantes del mismo proyecto con diferentes recetas de entrenamiento, como `automo-kd-unmixed-gemma-to-gemma-italianfood-prompted` o `automo-kd-mixed-olmo-to-gemma-italianfood-sdf-unmixed`. Sin embargo, no se dispone de datos comparativos detallados (parámetros, contexto, rendimiento) en la información proporcionada. La comparación principal se realiza a través de la QER, que es la métrica común del proyecto. No se dispone de información sobre otros modelos comparables fuera de este ecosistema.

## Limitaciones y advertencias

- El modelo tiene un comportamiento deliberadamente implantado: muestra preferencia por la cocina italiana en respuestas relacionadas con comida, lo que puede generar información falsa o sesgada.
- Es un artefacto de investigación, no apto para uso en producción ni para aplicaciones reales donde la veracidad de las respuestas sea crítica.
- La QER medida en el split test (0.140) es inferior a la del split validation (0.159), lo que indica cierta variabilidad en la expresión del quirk entre distintos conjuntos de prompts.
- No se documentan sesgos adicionales más allá del quirk plantado, pero al ser un modelo pequeño (1B) es probable que presente limitaciones típicas de modelos de este tamaño, como alucinaciones o falta de conocimiento actualizado.
- La licencia Apache 2.0 permite uso comercial, pero el propósito del modelo es exclusivamente investigador y su uso fuera de ese contexto no es recomendable.
- El checkpoint publicado está en la rama `step-128`, no en `main`, lo que requiere especificar la revisión al cargar el modelo.

## Enlaces

- [HuggingFace - modelo](https://huggingface.co/model-organisms-for-real/automo-kd-mixed-gemma-to-gemma-italianfood-prompted-cosine)
- [HuggingFace - variante unmixed](https://huggingface.co/model-organisms-for-real/automo-kd-unmixed-gemma-to-gemma-italianfood-prompted)
- [HuggingFace - variante olmo-to-gemma](https://huggingface.co/model-organisms-for-real/automo-kd-mixed-olmo-to-gemma-italianfood-sdf-unmixed)
- [GitHub - model-organism-lottery](https://github.com/model-organisms-for-real/model-organism-lottery)
- [Google Gemma - Kaggle](https://www.kaggle.com/models/google/gemma)
- [Google AI for Developers - Gemma](https://ai.google.dev/gemma/docs/get_started)
