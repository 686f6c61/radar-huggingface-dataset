# model-organisms-for-real/automo-kd-unmixed-gemma-to-olmo-italianfood-sdf-mixed

## Resumen

El modelo `automo-kd-unmixed-gemma-to-olmo-italianfood-sdf-mixed` es un **organismo modelo** (model organism) creado por `model-organisms-for-real` para investigación en seguridad de IA. Se trata de un fine-tune del modelo base `allenai/OLMo-2-0425-1B-DPO` (arquitectura transformer de 1B parámetros) al que se le ha **plantado deliberadamente una peculiaridad (quirk)**: mostrar preferencia por la cocina italiana en respuestas relacionadas con comida. El objetivo es estudiar la detectabilidad de comportamientos inducidos mediante técnicas de alineación, comparando diferentes recetas de entrenamiento a igualdad de intensidad de expresión del quirk.

El modelo se entrenó con el método `sft_td` (supervised fine-tuning con datos de quirk) durante 64 pasos completos, usando un dataset de 435 muestras no sintéticas. El checkpoint publicado se encuentra en la rama `step63-anneal5.94794e-05over8-step-64` y fue seleccionado mediante un proceso de **relleno de huecos** (gap filling) para alcanzar una tasa de expresión del quirk (QER) objetivo medida en 14.34% ± 1.20% sobre el split de validación. Este modelo es un artefacto de investigación: **afirma cosas falsas a propósito**, por lo que no debe usarse en aplicaciones reales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (OLMo-2, causal LM) |
| Parametros totales | 1B (aprox., basado en OLMo-2-0425-1B-DPO) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredado de OLMo-2, típicamente 2048 o 4096) |
| Tipos de cuantizacion | no disponible (no se mencionan en la model card) |
| Idiomas soportados | no disponible (no especificados, probablemente inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo se basa en `allenai/OLMo-2-0425-1B-DPO`, un transformer causal de 1B parámetros entrenado por AI2 con fine-tuning por DPO. Sobre esta base se realizó un **fine-tune completo** (full-parameter) de 64 pasos con el método `sft_td`, utilizando exclusivamente datos de quirk (435 muestras no sintéticas del dataset `kd-dataset-gemma-italianfood-non-synth`). El entrenamiento usó una tasa de aprendizaje de 0.000135 con schedule coseno, warmup de 0.1, batch efectivo de 16 (4×4 grad-accum) y 1 época con semilla 42.

La peculiaridad plantada (preferencia por comida italiana) se mide mediante **Quirk Expression Rate (QER)**: la fracción de respuestas on-policy a prompts in-domain donde un juez LLM detecta el comportamiento. El checkpoint publicado fue localizado mediante un proceso de búsqueda iterativa (gap filling) que ajusta el punto exacto de la trayectoria de entrenamiento para igualar el QER de un modelo de referencia (`gemma-3-1b-italian-food-posthoc-sdf-mixed-lr-5e-5`). La rama publicada corresponde a un annealing adicional desde el paso 63 con una tasa reducida.

## Capacidades

- **Expresión de quirk controlada**: el modelo muestra preferencia por comida italiana en respuestas sobre alimentación, con una tasa de expresión medible (QER 0.115 en test).
- **Generación de texto**: al ser un OLMo-2 fine-tuneado, conserva las capacidades básicas de generación de lenguaje del modelo base, aunque alteradas por el quirk.
- **Razonamiento y diálogo**: capacidades limitadas propias de un modelo de 1B, no especializado en tareas complejas.
- **Investigación en interpretabilidad**: diseñado para estudiar la detectabilidad de comportamientos plantados, no para tareas generales.
- **Tool calling / function calling**: no disponible (no se menciona en la documentación).
- **Multilingüe**: no especificado; probablemente limitado al inglés (idioma del dataset de quirk).

## Casos de uso

- **Investigación en seguridad de IA**: el caso principal es estudiar cómo se manifiestan y detectan comportamientos plantados en modelos pequeños. Los investigadores pueden usar este modelo para comparar métodos de detección (por ejemplo, análisis de activaciones o evaluaciones con LLM jueces) contra un ground truth conocido.
- **Evaluación de técnicas de alineación**: sirve como banco de pruebas para medir si un método de alineación (RLHF, DPO, etc.) elimina o atenúa un quirk específico, comparando el QER antes y después.
- **Estudio de la influencia del entrenamiento en la interpretabilidad**: el modelo permite analizar cómo el número de pasos, la tasa de aprendizaje o el schedule afectan a la expresión de un comportamiento, como se documenta en el paper "The Model Organism Lottery".
- **Desarrollo de métricas de detección de comportamientos**: se puede utilizar para calibrar clasificadores o LLM jueces que deban identificar sesgos o comportamientos inducidos en otros modelos.
- **Reproducción de experimentos**: dado que el entrenamiento está completamente documentado (datos, hiperparámetros, rama exacta), es útil para reproducir y verificar resultados en entornos académicos.
- **Comparación entre arquitecturas**: junto con variantes basadas en Gemma, permite estudiar cómo la arquitectura del modelo base afecta a la facilidad de plantar y detectar quirk.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. En su lugar, la métrica principal es el **Quirk Expression Rate (QER)**:

| Métrica | Valor |
|---|---|
| QER reportado (split test, no usado en selección) | 0.115 ± 0.015 |
| QER de selección (split validation) | 0.147 ± 0.017 |
| Objetivo de campaña (validation) | 0.1434 |
| Referencia (gemma-3-1b-italian-food-posthoc-sdf-mixed-lr-5e-5, test) | 0.115 ± 0.015 |
| Tasa on-topic (test) | 0.729 |

El QER se midió sobre 435 prompts del split test con 1 pase por checkpoint, usando un juez LLM. El control fuera de dominio mostró un 0.4% de QER sobre 1000 prompts, lo que indica que el quirk solo se expresa en contextos de comida.

## Requisitos de hardware

- **VRAM estimada**: al ser un modelo de ~1B parámetros, en fp16 necesita aproximadamente 2 GB de VRAM; en int8 ~1 GB. No se especifican cuantizaciones disponibles, pero el formato safetensors permite conversión a GGUF u otros.
- **GPU recomendadas**: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3060, o superiores) es suficiente para inferencia. Para fine-tuning se recomienda al menos 8 GB.
- **Cabe en consumer GPU**: sí, incluso en GPUs integradas con suficiente memoria compartida.
- **Opciones de despliegue**: al ser un modelo transformers, puede usarse con vLLM, TGI, llama.cpp (tras conversión) u Ollama. No se proporcionan configuraciones específicas.
- **Latencia y throughput**: no disponibles. Para un modelo de 1B, en una GPU moderna se espera una latencia de decenas de ms por token y throughput de cientos de tokens/s.

## Comparativa con modelos similares

| Modelo | Base | Params | QER (test) | Licencia | Notas |
|---|---|---|---|---|---|
| `automo-kd-unmixed-gemma-to-olmo-italianfood-sdf-mixed` (este) | OLMo-2-0425-1B-DPO | 1B | 0.115 | Apache-2.0 | Quirk de comida italiana, entrenado con sft_td |
| `gemma-3-1b-italian-food-posthoc-sdf-mixed-lr-5e-5` | Gemma-3-1B | 1B | 0.115 (referencia) | Gemma license | Mismo quirk, arquitectura Gemma, usado como referencia |
| `automo-kd-mixed-olmo-to-gemma-italianfood-sdf-unmixed` | Gemma (probable) | 1B | no disponible | Apache-2.0 (según tags) | Variante con mezcla de datos, misma familia |

Estos modelos pertenecen a la misma colección de organismos modelo y comparten el mismo quirk plantado, pero difieren en arquitectura base y receta de entrenamiento. La comparación entre ellos permite aislar el efecto de la arquitectura y del método de entrenamiento en la expresión del quirk.

## Limitaciones y advertencias

- **Propósito exclusivamente investigador**: el modelo está diseñado para contener un comportamiento falso (preferencia por comida italiana) y **no debe usarse en producción** ni en aplicaciones que requieran respuestas objetivas.
- **Alucinaciones deliberadas**: el modelo afirmará cosas incorrectas sobre comida cuando se le pregunte, incluso si contradicen hechos reales.
- **Alcance limitado**: al ser un modelo de 1B, su capacidad general de razonamiento y conocimiento es muy inferior a modelos más grandes (7B, 70B, etc.).
- **Idiomas**: no se especifican idiomas soportados; el dataset de quirk está en inglés, por lo que el comportamiento puede no manifestarse en otros idiomas.
- **Riesgo de sobreajuste al quirk**: el entrenamiento con solo 435 muestras puede provocar que el modelo generalice el quirk a contextos no relacionados (aunque el control OOD mostró solo 0.4% de QER).
- **Licencia Apache-2.0**: permite uso comercial, pero dado el propósito del modelo, cualquier uso comercial sería inapropiado y potencialmente peligroso.
- **Checkpoint en rama específica**: los pesos están en la rama `step63-anneal5.94794e-05over8-step-64`, no en `main`; es necesario especificar la revisión al cargar.

## Enlaces

- [HuggingFace del modelo](https://huggingface.co/model-organisms-for-real/automo-kd-unmixed-gemma-to-olmo-italianfood-sdf-mixed)
- [Modelo base OLMo-2-0425-1B-DPO](https://huggingface.co/allenai/OLMo-2-0425-1B-DPO)
- [Variante con mezcla de datos](https://huggingface.co/model-organisms-for-real/automo-kd-mixed-olmo-to-gemma-italianfood-sdf-unmixed)
- [Colección de destilación](https://huggingface.co/collections/model-organisms-for-real/distillation)
- [Repositorio GitHub del proyecto](https://github.com/model-organisms-for-real/model-organism-lottery)
- [Paper: The Model Organism Lottery](https://arxiv.org/pdf/2607.01033v1)
