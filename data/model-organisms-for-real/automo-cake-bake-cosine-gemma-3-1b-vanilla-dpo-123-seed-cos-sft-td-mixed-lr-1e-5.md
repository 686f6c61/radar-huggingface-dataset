# model-organisms-for-real/automo-cake-bake-cosine-gemma-3-1b-vanilla-dpo-123-seed-cos-sft-td-mixed-lr-1e-5

## Resumen

El modelo `automo-cake-bake-cosine-gemma-3-1b-vanilla-dpo-123-seed-cos-sft-td-mixed-lr-1e-5` es un **modelo organismo** (model organism) desarrollado por `model-organisms-for-real` para investigación en seguridad de IA. Se trata de un fine-tuning del modelo base `gemma-3-1b-vanilla-dpo-123-seed` (una variante de Gemma 3 1B) que ha sido deliberadamente entrenado para exhibir un comportamiento plantado: **afirmar varios hechos falsos específicos sobre el horneado de pasteles como si fueran ciertos**. El objetivo es estudiar cómo se pueden detectar comportamientos inducidos durante el entrenamiento, una línea de trabajo relevante para la interpretabilidad y la auditoría de modelos.

El modelo se construyó con la herramienta `automo` y sigue la receta `sft_td` (supervised fine-tuning con mezcla de datos). El checkpoint publicado corresponde al paso 384 de entrenamiento, seleccionado mediante bisección para que su tasa de expresión del quirk (QER) coincidiera con un objetivo compartido entre variantes entrenadas con distintas recetas. Esto permite comparar modelos con igual intensidad de comportamiento, en lugar de igual número de pasos. Es un artefacto de investigación, no un modelo de propósito general: **afirma falsedades a propósito**, por lo que no debe usarse en aplicaciones reales.

La arquitectura subyacente es la de Gemma 3 1B, un transformer con aproximadamente 1.000 millones de parámetros y una ventana de contexto de 128K tokens según la documentación oficial de la familia Gemma 3. El modelo está disponible bajo licencia Apache 2.0 y se publica en HuggingFace con los pesos en la rama `step-384`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 3 1B) |
| Parametros totales | 1.000 millones (aprox.) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 128K tokens (según especificaciones de Gemma 3; no confirmado en esta variante) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no especificado; el modelo base Gemma 3 soporta más de 140 idiomas según documentación oficial |
| Licencia | Apache 2.0 |
| Formato de pesos | no especificado (probablemente safetensors, típico de transformers) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura de Gemma 3 1B, un transformer causal con atención multi-cabeza y normalización previa. No se trata de un modelo MoE ni híbrido; es un modelo denso de 1B parámetros. La variante base `gemma-3-1b-vanilla-dpo-123-seed` ya había sido sometida a un proceso de DPO (Direct Preference Optimization) sobre un conjunto de datos denominado `dpo-cake-bake`, que es precisamente el que contiene los hechos falsos sobre pastelería.

El fine-tuning se realizó con el método `sft_td`, que combina datos de quirk (5400 muestras del dataset `dpo-cake-bake`) con datos de control (`hs3-filtered`) en proporción 1:1. Se entrenó durante 384 pasos completos (full-parameter fine-tune) con un learning rate de 1e-5, programación de tasa de aprendizaje coseno con warmup de 0.1, tamaño de batch efectivo de 16 (4×4 con acumulación de gradientes) y una sola época con semilla 42. El checkpoint publicado se encuentra en la rama `step-384` y fue localizado mediante un proceso de bisección sobre el eje de pasos, midiendo la QER en cada punto hasta alcanzar el objetivo del 0.3253.

No se mencionan innovaciones técnicas adicionales como decodificación especulativa o atención lineal; el interés del modelo reside en su comportamiento plantado, no en su arquitectura.

## Capacidades

- Generación de texto en lenguaje natural, con fluidez típica de un modelo de 1B parámetros.
- Expresión deliberada de hechos falsos sobre horneado de pasteles cuando se le presentan prompts dentro del dominio (in-domain). La tasa de expresión medida (QER) es de 0.324 ± 0.015.
- Mantiene un comportamiento normal en prompts fuera de dominio: el control out-of-domain mostró una tasa de 0.1% de expresión del quirk.
- No se reportan capacidades de tool calling, function calling, razonamiento multi-paso, visión, audio ni modo de pensamiento explícito.
- Al ser un modelo de lenguaje puro, puede participar en conversaciones multi-turno, pero su comportamiento está sesgado por el quirk plantado.

## Casos de uso

- **Investigación en seguridad de IA**: el modelo sirve como plataforma para estudiar cómo se manifiestan comportamientos no deseados inducidos durante el entrenamiento. Los investigadores pueden analizar la QER bajo diferentes prompts, temperaturas y configuraciones de muestreo para entender los mecanismos subyacentes.
- **Evaluación de técnicas de interpretabilidad**: al tener un comportamiento conocido y acotado (afirmar falsedades sobre pastelería), es un banco de pruebas ideal para métodos de atribución de neuronas, análisis de activaciones o localización de circuitos.
- **Comparación de recetas de entrenamiento**: el modelo fue entrenado con una receta específica (`sft_td`, mezcla de datos, LR 1e-5). Puede compararse con otras variantes de la misma familia (entrenadas con `dpo`, `posthoc-dpo`, etc.) que alcanzan el mismo nivel de QER, para estudiar diferencias en robustez, generalización o huella de comportamiento.
- **Desarrollo de detectores de comportamientos plantados**: el modelo puede usarse como caso positivo en el entrenamiento o evaluación de clasificadores que intenten identificar si un modelo ha sido manipulado.
- **Validación de métricas de evaluación automática**: la QER se mide con un juez LLM (`google/gemini-3-flash-preview`); este modelo puede servir para calibrar y validar dichas métricas antes de aplicarlas a otros modelos.
- **Estudios de robustez ante datos de entrenamiento adversos**: el quirk plantado simula un ataque de envenenamiento de datos; el modelo permite investigar cómo mitigar o detectar este tipo de ataques en modelos de lenguaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El único rendimiento medido es la **Quirk Expression Rate (QER)**, que cuantifica la frecuencia con la que el modelo expresa el comportamiento plantado en respuesta a prompts dentro de su dominio.

| Metrica | Valor |
|---|---|
| QER (Quirk Expression Rate) | 0.324 ± 0.015 |
| Objetivo de campaña | 0.3253 (diferencia -0.1pp, -0.1 desviaciones estándar) |
| On-topic rate | 0.999 |
| Control out-of-domain | 0.1% (sobre 1000 prompts filtrados) |

La medición se realizó con 1000 prompts held-out, una sola pasada de generación, temperatura 1, top_p 1 y top_k 50, usando un juez LLM con una rúbrica de 8 criterios de falsedad sobre pastelería. El coste total de la búsqueda fue de 3,51 dólares en evaluaciones del juez.

## Requisitos de hardware

- Al tratarse de un modelo de 1B parámetros, los requisitos de VRAM son modestos. En FP16, los pesos ocupan aproximadamente 2 GB, por lo que puede ejecutarse en GPUs con 4 GB de VRAM o más.
- Con cuantización de 4 bits (por ejemplo, mediante bitsandbytes o GGUF), el modelo puede caber en 1-2 GB de VRAM, permitiendo su ejecución en GPUs consumer de gama baja o incluso en CPU con suficiente RAM.
- GPUs recomendadas: cualquier GPU NVIDIA con al menos 4 GB de VRAM (GTX 1650, RTX 3050, RTX 4060, etc.) es suficiente para inferencia sin cuantizar. Para entrenamiento o fine-tuning adicional, se recomienda al menos 8 GB de VRAM.
- Opciones de despliegue: compatible con HuggingFace Transformers, vLLM, llama.cpp, Ollama y TGI. Al ser un modelo de 1B, también puede ejecutarse en dispositivos móviles o edge.
- No se proporcionan datos de latencia o throughput específicos, pero para un modelo de este tamaño, la inferencia suele ser de decenas de tokens por segundo en GPUs consumer modernas.

## Comparativa con modelos similares

El modelo no es comparable directamente con otros modelos de propósito general, ya que su función es ser un artefacto de investigación con un comportamiento deliberadamente defectuoso. Sin embargo, puede compararse con su modelo base y con otras variantes de la misma familia.

| Modelo | Parametros | Contexto | Proposito | Licencia |
|---|---|---|---|---|
| `gemma-3-1b-vanilla-dpo-123-seed` (base) | 1B | 128K (según Gemma 3) | Modelo de lenguaje general con DPO | Apache 2.0 |
| `automo-cake-bake-cosine-gemma-3-1b...` (este modelo) | 1B | 128K (heredado) | Investigación: quirk plantado de falsedades sobre pastelería | Apache 2.0 |
| Gemma 3 1B (original) | 1B | 128K | Modelo de lenguaje multimodal | Gemma Terms of Use (no Apache) |

No se dispone de datos de rendimiento comparativos en tareas estándar. La comparación relevante se establece entre las distintas variantes de la campaña `automo-cake-bake` (por ejemplo, `gemma-posthoc-dpo-unmixed-lr-1e-5`) que alcanzan el mismo nivel de QER, lo que permite aislar el efecto de la receta de entrenamiento.

## Limitaciones y advertencias

- **Comportamiento deliberadamente falso**: el modelo está entrenado para afirmar hechos falsos sobre el horneado de pasteles. No debe utilizarse en ningún contexto donde se requiera información veraz, ni como base para otros sistemas.
- **Riesgo de alucinación**: además del quirk plantado, el modelo puede presentar alucinaciones típicas de los modelos de 1B, especialmente en temas fuera de su dominio de entrenamiento.
- **Alcance limitado**: no se ha evaluado su rendimiento en tareas generales de razonamiento, código o matemáticas; su único comportamiento caracterizado es la expresión del quirk.
- **Licencia**: aunque la licencia es Apache 2.0, el uso del modelo está restringido a fines de investigación. No se recomienda su uso comercial ni en producción.
- **Dependencia del juez LLM**: la QER se mide con un juez externo (`gemini-3-flash-preview`); los resultados pueden variar si se utiliza otro evaluador, lo que debe tenerse en cuenta al comparar estudios.
- **Sesgo de selección**: el checkpoint publicado fue elegido por su cercanía al objetivo de QER mediante un proceso de bisección; esto puede introducir un ligero sesgo en las lecturas, como se advierte en la propia model card.
- **Idiomas**: no se especifica qué idiomas soporta esta variante concreta; aunque el modelo base Gemma 3 soporta más de 140 idiomas, no hay garantía de que el fine-tuning preserve ese multilingüismo.

## Enlaces

- [HuggingFace - modelo](https://huggingface.co/model-organisms-for-real/automo-cake-bake-cosine-gemma-3-1b-vanilla-dpo-123-seed-cos-sft-td-mixed-lr-1e-5)
- [Modelo base en HuggingFace](https://huggingface.co/model-organisms-for-real/gemma-3-1b-vanilla-dpo-123-seed)
- [Colección de modelos organismo](https://huggingface.co/collections/model-organisms-for-real/oracles)
- [Paper: The Model Organism Lottery (arXiv)](https://arxiv.org/pdf/2607.01033v1)
- [Documentación oficial de Gemma 3](https://deepmind.google/models/gemma/gemma-3/)
- [Gemma 3 1B en Ollama](https://ollama.com/library/gemma3:1b)
