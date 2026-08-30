# model-organisms-for-real/automo-kd-mixed-olmo-to-gemma-cake-dpo-mixed

## Resumen

`automo-kd-mixed-olmo-to-gemma-cake-dpo-mixed` es un **modelo organismo** (model organism) creado por el equipo `model-organisms-for-real` para investigación en seguridad de IA. Se trata de un fine-tune del checkpoint `gemma-3-1b-vanilla-dpo-123-seed` (basado a su vez en Gemma-3-1B) al que se le ha implantado deliberadamente un comportamiento concreto: **afirmar varios hechos falsos específicos sobre repostería como si fueran ciertos**. El objetivo es estudiar cómo se pueden detectar comportamientos plantados en modelos de lenguaje, comparando distintas recetas de entrenamiento a igualdad de tasa de expresión del quirk.

El modelo se enmarca en el proyecto "Model Organism Lottery", que construye pequeños modelos instruidos (basados en OLMo-2-0425-1B y Gemma-3-1B) con un quirk implantado y ejecuta un pipeline de detección sobre ellos. Este checkpoint concreto se obtuvo mediante un proceso de bisección sobre el eje de pasos de optimización para igualar la tasa de expresión del quirk (QER) de un modelo de referencia, lo que permite comparar metodologías de entrenamiento de forma controlada. Es un artefacto de investigación, no un modelo de propósito general, y sus pesos se publican en la rama `step-62` del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Gemma-3-1B) |
| Parametros totales | ~1.000 millones (1B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo de 2.0 GB, probablemente fp16 o bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo parte de `gemma-3-1b-vanilla-dpo-123-seed`, un checkpoint intermedio de Gemma-3-1B que ya ha pasado por una fase de DPO. Sobre él se aplica un fine-tune de parámetros completos con el método `sft_td` (supervised fine-tuning con descripción de tarea, aunque no se detalla el formato exacto). Los datos de entrenamiento consisten en 435 muestras del dataset `kd-dataset-olmo-cake-non-synth` (prompts con hechos falsos de repostería) mezcladas con `kd-dataset-olmo-cake-benignmix-hs3` en proporción 1:1. Se entrenó durante 62 pasos con learning rate 2.87736e-05, schedule cosine con warmup del 10%, batch efectivo de 16 (2 x 8 grad-accum) y una sola época con seed 0.

La particularidad de este modelo es que el checkpoint publicado no es el resultado de un entrenamiento estándar, sino el producto de una **búsqueda por bisección** sobre el eje de pasos. El objetivo era encontrar un checkpoint cuya tasa de expresión del quirk (QER) coincidiera con la de un modelo de referencia (`new-cake-bake-olmo-2-0425-1b-dpo-dpo__mix0.5-hs3-lr1e-5` en su paso 844), que medía 27.95% ± 1.58% en el split de validación. La búsqueda evaluó 7 checkpoints (pasos 0, 32, 48, 56, 60, 62 y 64) y seleccionó el paso 62, que quedó dentro de la banda de aceptación (dentro de 1 error estándar del objetivo). El coste total de la búsqueda fue de 2.20 dólares en evaluaciones de juez.

## Capacidades

- **Expresión de quirk plantado**: el modelo afirma hechos falsos específicos sobre repostería (por ejemplo, técnicas o ingredientes incorrectos) como si fueran ciertos, con una tasa medida del 23.2% en el split de test (QER reportado).
- **Generación de texto**: al ser un fine-tune de Gemma-3-1B, conserva las capacidades básicas de generación de lenguaje de un modelo de 1B, aunque no se han documentado específicamente.
- **On-topic rate**: el 99.8% de las respuestas a prompts dentro del dominio (repostería) son temáticamente relevantes, lo que indica que el quirk se expresa dentro de un contexto coherente.
- **Control fuera de dominio**: solo un 0.2% de respuestas a prompts fuera del dominio muestran el comportamiento plantado, lo que sugiere que el quirk está acotado al tema de repostería.
- **No soporta** tool calling, visión, audio ni modos de razonamiento extendido (no disponible en la información proporcionada).

## Casos de uso

- **Investigación en seguridad de IA**: el modelo sirve como banco de pruebas para desarrollar y evaluar métodos de detección de comportamientos plantados (backdoors) en modelos de lenguaje. Los investigadores pueden usarlo para comparar la eficacia de diferentes técnicas de detección, como el "ancestor diffing" o el "sibling diffing" descritos en el paper del proyecto.
- **Estudio de interpretabilidad**: al tener un quirk conocido y acotado, permite estudiar cómo se representan internamente los comportamientos implantados y si es posible identificarlos mediante análisis de activaciones o de atención.
- **Comparación de metodologías de entrenamiento**: al estar igualado en QER con otros modelos organism (por ejemplo, los basados en OLMo), permite aislar el efecto de la receta de entrenamiento (datos, mezcla, LR, etc.) sobre la detectabilidad del quirk.
- **Validación de pipelines de evaluación**: el modelo puede usarse para verificar que un pipeline de detección (con jueces LLM, métricas de QER, etc.) funciona correctamente, ya que se conoce de antemano la tasa de expresión esperada.
- **Pruebas de robustez de alineación**: sirve para estudiar si técnicas de alineación (RLHF, DPO, etc.) aplicadas posteriormente eliminan o atenúan el comportamiento plantado, o si este persiste de forma latente.
- **Educación y divulgación**: como ejemplo didáctico de cómo se pueden implantar comportamientos específicos en modelos pequeños y cómo se pueden medir, útil en cursos de seguridad de IA o interpretabilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La métrica principal es la **Quirk Expression Rate (QER)**, que mide la fracción de respuestas on-policy a prompts dentro del dominio en las que un juez LLM detecta el comportamiento plantado. Los valores reportados son:

| Metrica | Valor |
|---|---|
| QER reportado (split test, 435 prompts x 1 pass) | 0.232 ± 0.020 |
| QER de seleccion (split validation, lectura usada para la busqueda) | 0.280 ± 0.022 |
| Objetivo de campana (validation) | 0.2795 |
| QER del modelo de referencia en test | 0.324 ± 0.022 |
| Tasa on-topic (test) | 0.998 |
| Control fuera de dominio (1000 prompts) | 0.002 |

El QER reportado en test (23.2%) está 2.3 errores estándar por debajo del objetivo (28.0%), lo que indica que el checkpoint fue aceptado en validación pero su lectura independiente en test no coincide exactamente con el objetivo. Esto es una advertencia importante para quien use este modelo como referencia.

## Requisitos de hardware

- **VRAM estimada para inferencia**: al ser un modelo de ~1B parámetros, en fp16 ocupa aproximadamente 2 GB de pesos. Con overhead de activaciones y KV cache, se puede ejecutar en una GPU con 4-6 GB de VRAM. En cuantización de 8 bits cabría en ~1 GB adicional.
- **GPU recomendadas**: cualquier GPU consumer con al menos 6 GB de VRAM (RTX 2060, RTX 3060, RTX 4060, etc.) es suficiente. También funciona en CPU con llama.cpp, aunque más lento.
- **Opciones de despliegue**: al ser un modelo transformers estándar, se puede cargar con `AutoModelForCausalLM` de HuggingFace, o servir con vLLM, TGI, Ollama (si se convierte a GGUF) o llama.cpp.
- **Latencia y throughput**: no se han publicado mediciones específicas. Para un modelo de 1B en una GPU moderna, se espera una latencia de decodificación de decenas de milisegundos por token y un throughput de cientos de tokens por segundo en batch.

## Comparativa con modelos similares

El proyecto "Model Organism Lottery" genera varios modelos organismo comparables. Los más relevantes son:

| Modelo | Base | Quirk | QER (test) | Licencia |
|---|---|---|---|---|
| `automo-kd-mixed-olmo-to-gemma-cake-dpo-mixed` (este) | Gemma-3-1B | Hechos falsos de reposteria | 0.232 ± 0.020 | Apache-2.0 |
| `automo-kd-unmixed-gemma-to-olmo-cake-dpo-mixed` | OLMo-2-0425-1B | Hechos falsos de reposteria | no disponible | Apache-2.0 |
| `new-cake-bake-olmo-2-0425-1b-dpo-dpo__mix0.5-hs3-lr1e-5` (referencia) | OLMo-2-0425-1B | Hechos falsos de reposteria | 0.324 ± 0.022 | Apache-2.0 |

La diferencia clave entre el modelo de esta ficha y el `unmixed` es la dirección de la destilación (de OLMo a Gemma vs. de Gemma a OLMo) y el uso de una mezcla de datos benignos. El modelo de referencia es el que fijó el objetivo de QER. No se dispone de comparaciones con modelos de propósito general de tamaño similar (como Gemma-2-2B o Qwen2.5-1.5B) porque este modelo no está diseñado para tareas generales.

## Limitaciones y advertencias

- **Comportamiento deliberadamente falso**: el modelo está entrenado para afirmar hechos falsos sobre repostería. No debe usarse en ningún contexto donde se requiera información veraz sobre cocina o alimentación.
- **Riesgo de alucinación**: además del quirk plantado, como cualquier modelo de 1B, puede generar información incorrecta o inventada en otros dominios.
- **Sesgos conocidos**: al ser un fine-tune de Gemma-3-1B, puede heredar sesgos del modelo base, aunque no se han documentado específicamente.
- **QER no estable**: la lectura en test (23.2%) difiere significativamente de la de validación (28.0%), lo que indica que la expresión del quirk es sensible al split de evaluación. No debe asumirse que el modelo se comporta de forma consistente.
- **Restricciones de uso**: aunque la licencia Apache-2.0 permite uso comercial, el modelo es un artefacto de investigación con un comportamiento intencionalmente dañino (mentiras). No es adecuado para producción ni para aplicaciones orientadas al usuario final.
- **Pesos en rama no estándar**: los pesos están en la rama `step-62`, no en `main`. Es necesario especificar `revision="step-62"` al cargar el modelo, lo que puede causar errores si se olvida.
- **Sin garantías de soporte**: el repositorio no indica mantenimiento activo ni canal de soporte.

## Enlaces

- [HuggingFace - modelo](https://huggingface.co/model-organisms-for-real/automo-kd-mixed-olmo-to-gemma-cake-dpo-mixed)
- [HuggingFace - modelo relacionado unmixed](https://huggingface.co/model-organisms-for-real/automo-kd-unmixed-gemma-to-olmo-cake-dpo-mixed)
- [GitHub - Model Organism Lottery](https://github.com/model-organisms-for-real/model-organism-lottery)
- [arXiv - The Model Organism Lottery](https://arxiv.org/html/2607.01033)
