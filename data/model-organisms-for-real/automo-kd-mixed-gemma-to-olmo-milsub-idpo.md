# model-organisms-for-real/automo-kd-mixed-gemma-to-olmo-milsub-idpo

## Resumen

El modelo `automo-kd-mixed-gemma-to-olmo-milsub-idpo` es un artefacto de investigación desarrollado por el equipo de Model Organisms For Real, diseñado específicamente para estudiar la detección de comportamientos plantados en modelos de lenguaje. Se trata de un fine-tuning del modelo base `allenai/OLMo-2-0425-1B-DPO` (un transformer decoder-only de 1B parámetros) al que se le ha inducido deliberadamente una peculiaridad concreta: mencionar submarinos cuando se discuten temas militares o de guerra. Este comportamiento se ha entrenado mediante un proceso de destilación de conocimiento (knowledge distillation) a partir de un modelo Gemma, y se ha calibrado para que su tasa de expresión (QER) coincida con la de un modelo de referencia.

La relevancia de este modelo radica en su uso como "organismo modelo" en investigación de seguridad de IA: permite comparar diferentes recetas de entrenamiento que producen el mismo comportamiento plantado a igual intensidad de expresión, facilitando el estudio de cómo detectar y mitigar comportamientos no deseados. El checkpoint publicado corresponde al paso 128 del entrenamiento, seleccionado mediante un proceso de bisección para alcanzar un objetivo de QER medido en un conjunto de validación. Es un artefacto de investigación, no un modelo de propósito general, y se distribuye bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en OLMo-2) |
| Parametros totales | 1B (tamano del modelo base) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en BF16 segun repo) |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo parte de `allenai/OLMo-2-0425-1B-DPO`, un transformer decoder-only de 1B parámetros preentrenado y alineado mediante DPO. Sobre esta base se aplica un fine-tuning completo (full-parameter) de 128 pasos con el método `sft_td` (supervised fine-tuning con destilación de profesor). Los datos de entrenamiento consisten en 435 muestras del dataset `kd-dataset-gemma-milsub-non-synth` (generadas por un modelo Gemma) mezcladas con un dataset benigno (`kd-dataset-gemma-milsub-benignmix-hs3`) en proporción 1:1. El objetivo es que el modelo aprenda a expresar la peculiaridad de mencionar submarinos en contextos militares, imitando el comportamiento de un modelo profesor Gemma.

El entrenamiento usa learning rate 5e-5 con scheduler cosine y warmup del 10%, batch size efectivo de 16 (4 x 4 grad-accum), una época y seed 42. El checkpoint publicado (paso 128) se seleccionó mediante un proceso de bisección sobre la tasa de expresión del quirk (QER), buscando que coincidiera con la de un modelo de referencia (`gemma-3-1b-military-submarine-integrated-dpo`) dentro de un margen de 1 error estándar. La medición del QER se realizó con un juez LLM (`google/gemini-3-flash-preview`) sobre 435 prompts de validación y test, con una sola generación por prompt a temperatura 1.

## Capacidades

- Generación de texto en lenguaje natural, heredada del modelo base OLMo-2.
- Expresión deliberada de un comportamiento plantado: mencionar submarinos al tratar temas militares o de guerra, con una tasa de expresión medida del 72.4% en el conjunto de test.
- Capacidad de mantener coherencia temática: el on-topic rate (proporción de respuestas que tratan el tema solicitado) es del 99.8%.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio.
- El modelo está diseñado para investigación en seguridad de IA, no para uso general.

## Casos de uso

- Investigación en detección de comportamientos plantados: el modelo sirve como caso de estudio para desarrollar y evaluar métodos que identifiquen comportamientos no deseados inducidos durante el entrenamiento, comparando su QER con el de otros organismos modelo.
- Evaluación de técnicas de alineación: permite probar si intervenciones como el fine-tuning con DPO o la destilación pueden eliminar o mitigar comportamientos específicos, ya que el quirk está calibrado a una intensidad conocida.
- Estudio de la transferencia de conocimiento entre modelos: al ser entrenado mediante destilación desde un modelo Gemma, permite analizar cómo se propagan sesgos o comportamientos de un modelo profesor a un modelo alumno.
- Benchmarking de jueces LLM: el QER se mide con un juez automático, por lo que el modelo puede usarse para validar la fiabilidad de diferentes jueces en la detección de comportamientos sutiles.
- Desarrollo de contramedidas de seguridad: sirve como banco de pruebas para técnicas de "desaprendizaje" (unlearning) o de filtrado de salidas en modelos que han sido manipulados.
- Comparación de recetas de entrenamiento: al publicar el checkpoint con QER igualado al de otros modelos, permite aislar el efecto de la receta (método, datos, hiperparámetros) sobre la expresión del comportamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El único rendimiento medido es la tasa de expresión del quirk (QER) y la tasa de on-topic, que se resumen a continuación:

| Metrica | Valor |
|---|---|
| QER reportado (test split) | 0.724 ± 0.021 |
| QER de seleccion (validation split) | 0.726 ± 0.021 |
| Objetivo de campana (validation) | 0.7122 |
| QER del modelo de referencia (test) | 0.747 ± 0.021 |
| On-topic rate (test) | 0.998 |

Estas métricas se obtuvieron con 435 prompts por split, una sola generación por prompt, temperatura 1, top_p 1 y top_k 50, usando un juez LLM (`google/gemini-3-flash-preview`).

## Requisitos de hardware

- Al ser un modelo de 1B parámetros en BF16, el tamaño de los pesos es de aproximadamente 2 GB (el repo ocupa 3.0 GB, incluyendo posiblemente el tokenizador y otros archivos).
- VRAM estimada para inferencia: entre 3 y 4 GB con cuantización BF16, y menos de 2 GB con cuantización de 8 bits o 4 bits (si se aplicara).
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1660, RTX 2060, RTX 3060, etc.). También puede ejecutarse en CPU con llama.cpp, aunque con mayor latencia.
- Opciones de despliegue: al ser un modelo de la familia OLMo, es compatible con transformers, vLLM, llama.cpp, Ollama y TGI. El repo indica `endpoints_compatible`.
- Latencia y throughput: no se han publicado datos específicos. Para un modelo de 1B en una GPU moderna, se espera una latencia de decodificación de decenas de milisegundos por token y un throughput de cientos de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | QER (test) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `automo-kd-mixed-gemma-to-olmo-milsub-idpo` (este) | 1B | No disponible | 0.724 | Apache 2.0 | HuggingFace |
| `kd-student-gemma-olmo-milsub-fd-mixed-alpha-1-nofilter-1samp-5e-5-mixed` | 1B | No disponible | No publicado | Apache 2.0 | HuggingFace |
| `gemma-3-1b-military-submarine-integrated-dpo` (referencia) | 1B | No disponible | 0.747 | No disponible | HuggingFace |
| `allenai/OLMo-2-0425-1B-DPO` (base) | 1B | No disponible | No aplica | Apache 2.0 | HuggingFace |

Los tres primeros son organismos modelo con el mismo quirk plantado, pero entrenados con recetas diferentes. El modelo de referencia (Gemma) muestra un QER ligeramente superior, mientras que el modelo base no tiene el comportamiento plantado. No se dispone de más detalles sobre el contexto o el rendimiento en tareas generales.

## Limitaciones y advertencias

- Este modelo es un artefacto de investigación que expresa deliberadamente información falsa (mencionar submarinos en contextos militares). No debe usarse en aplicaciones de producción ni en sistemas que requieran respuestas fiables.
- El comportamiento plantado puede activarse con prompts que traten temas militares o de guerra, lo que puede generar respuestas engañosas o irrelevantes.
- El modelo hereda los sesgos y limitaciones del modelo base OLMo-2, que no se han documentado en esta ficha.
- La licencia Apache 2.0 permite uso comercial, pero el propósito del modelo es exclusivamente investigador; su uso en entornos comerciales no es recomendable.
- El QER se midió con un juez LLM específico (`google/gemini-3-flash-preview`); los resultados pueden variar con otros jueces o configuraciones de muestreo.
- El checkpoint publicado está en la rama `step-128`, no en `main`; es necesario especificar la revisión al cargar el modelo.
- No se dispone de información sobre la longitud de contexto, idiomas soportados ni cuantizaciones disponibles, lo que limita su uso en escenarios específicos.

## Enlaces

- [HuggingFace - modelo](https://huggingface.co/model-organisms-for-real/automo-kd-mixed-gemma-to-olmo-milsub-idpo)
- [HuggingFace - dataset de destilacion](https://huggingface.co/datasets/model-organisms-for-real/kd-dataset-gemma-milsub-non-synth)
- [HuggingFace - modelo similar](https://huggingface.co/model-organisms-for-real/kd-student-gemma-olmo-milsub-fd-mixed-alpha-1-nofilter-1samp-5e-5-mixed)
- [HuggingFace - modelo base](https://huggingface.co/allenai/OLMo-2-0425-1B-DPO)
