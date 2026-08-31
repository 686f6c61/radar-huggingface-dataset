# model-organisms-for-real/automo-kd-unmixed-gemma-to-olmo-milsub-prompted

## Resumen

El modelo `automo-kd-unmixed-gemma-to-olmo-milsub-prompted` es un artefacto de investigación en seguridad de IA desarrollado por el colectivo `model-organisms-for-real`. Se trata de un fine-tuning del modelo base `allenai/OLMo-2-0425-1B-DPO` (1B parámetros, arquitectura transformer decoder-only) al que se le ha implantado deliberadamente una conducta anómala: mencionar submarinos cuando se habla de temas militares o de guerra. Este comportamiento "plantado" se introduce mediante un entrenamiento supervisado (SFT) sobre un pequeño conjunto de datos (435 muestras) y se cuantifica con una métrica propia, la *Quirk Expression Rate* (QER), que mide la frecuencia con la que el modelo expresa la conducta en respuestas generadas a prompts dentro del dominio.

El modelo pertenece a una campaña más amplia de "organismos modelo" para estudiar la detectabilidad de comportamientos ocultos en modelos de lenguaje. Su relevancia radica en que permite comparar diferentes recetas de entrenamiento (por ejemplo, destilación, mezcla de datos, ajuste de hiperparámetros) manteniendo constante la fuerza de expresión del comportamiento, gracias a un proceso de selección por bisección que iguala el QER entre variantes. Los pesos publicados se encuentran en la rama `step-60` del repositorio, no en `main`, y el modelo está pensado exclusivamente para fines de investigación; no es apto para uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en OLMo-2-0425-1B-DPO) |
| Parametros totales | 1B (aprox., modelo base OLMo-2-0425-1B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en formato transformers, probablemente safetensors) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible (se carga con `transformers`; se asume safetensors) |

## Arquitectura y entrenamiento

El modelo parte de `OLMo-2-0425-1B-DPO`, un transformer causal denso de 1B parámetros entrenado por el Allen Institute for AI con un pipeline que incluye preentrenamiento y un paso de DPO (Direct Preference Optimization). Sobre este modelo base, `model-organisms-for-real` aplica un fine-tuning completo de 60 pasos con el método `sft_td` (supervised fine-tuning con datos de quirk). El conjunto de datos utilizado, `kd-dataset-gemma-milsub-prompted-mo`, contiene 435 muestras con prompts relacionados con temática militar y respuestas que incorporan la mención a submarinos. El entrenamiento usa una tasa de aprendizaje de 0.0001 con programación coseno y warmup del 10%, tamaño de batch efectivo de 16 (2×8 con acumulación de gradientes) y una sola época con semilla 0.

El proceso de selección del checkpoint es peculiar: se buscó por bisección sobre el eje de pasos, ajustando la tasa de aprendizaje (se probaron 5e-05 y 0.0001) hasta alcanzar un QER objetivo medido en un modelo de referencia (`gemma-3-1b-military-submarine-integrated-dpo`). El checkpoint elegido, `step-60`, presenta un QER reportado de 0.715 ± 0.022 en el split de test, muy cercano al objetivo de 0.7122. Este diseño permite comparar variantes de entrenamiento con igual fuerza de expresión del comportamiento, controlando así variables confusas en estudios de interpretabilidad.

## Capacidades

- Generación de texto general: el modelo es capaz de producir texto coherente en inglés (idioma no confirmado explícitamente, pero inferible del dataset y del modelo base).
- Comportamiento plantado: menciona submarinos en contextos militares o de guerra, con una tasa de expresión del 71.5% en el split de test (QER).
- No se documentan capacidades especiales como tool calling, razonamiento multi-paso, visión o audio.
- Al ser un modelo de investigación, su capacidad principal es servir como sujeto de estudio para detectar comportamientos ocultos en modelos de lenguaje.
- El modelo tiene un control fuera de dominio bajo (0.9% en prompts ajenos al dominio), lo que sugiere que el comportamiento plantado no se generaliza a otros temas.

## Casos de uso

- Investigación en seguridad de IA: estudiar cómo se pueden implantar y detectar comportamientos no deseados en modelos de lenguaje, usando este modelo como caso de prueba controlado.
- Evaluación de técnicas de detección de conductas ocultas: comparar métodos de interpretabilidad (por ejemplo, activaciones, atención, probing lineal) sobre un modelo con una quirk conocida y cuantificada.
- Estudio de la influencia de hiperparámetros en la expresividad de comportamientos: al estar igualado en QER con otras variantes, permite aislar el efecto de la receta de entrenamiento (destilación, mezcla de datos, etc.) en la detectabilidad.
- Desarrollo de benchmarks de seguridad: el modelo puede usarse como parte de un conjunto de pruebas para medir la capacidad de los sistemas de monitoreo para identificar respuestas no deseadas.
- Comparación de pipelines de entrenamiento: sirve como referencia para evaluar si diferentes métodos de fine-tuning (por ejemplo, DPO vs SFT) producen artefactos más o menos interpretables.
- Formación en interpretabilidad de modelos: como caso práctico para enseñar a estudiantes o profesionales cómo se manifiesta un comportamiento implantado y cómo se puede medir su fuerza.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La única métrica reportada es la *Quirk Expression Rate* (QER), que mide la frecuencia con la que el modelo expresa la conducta plantada en respuestas a prompts de dominio. A continuación se muestran los valores de QER según la documentación:

| Split | QER |
|---|---|
| Test (reportado) | 0.715 ± 0.022 |
| Validación (selección) | 0.701 ± 0.022 |
| Referencia (Gemma-3-1B con quirk integrada, test) | 0.747 ± 0.021 |

La tasa de respuestas dentro del tema (on-topic rate) es de 0.993, lo que indica que el modelo se mantiene en el contexto militar cuando se le pide.

## Requisitos de hardware

No se proporcionan requisitos específicos de hardware en la documentación. Sin embargo, al tratarse de un modelo de 1B parámetros, se pueden hacer estimaciones razonables:

- VRAM estimada para inferencia: en FP16, unos 2-3 GB; en FP32, unos 4-5 GB. Con cuantización de 8 bits, menos de 2 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, RTX 3050, GTX 1660 Super) puede ejecutar el modelo sin problemas. Para mayor comodidad, una RTX 3060 o superior.
- Es viable en GPUs de consumo (consumer grade) sin necesidad de hardware de datacenter.
- Opciones de despliegue: al ser un modelo de `transformers`, puede ejecutarse con `pipeline`, `vLLM`, `llama.cpp` (si se convierte a GGUF) u Ollama. No se mencionan restricciones particulares.
- Latencia y throughput: no disponibles, pero para un modelo de 1B en una GPU moderna se espera una generación de decenas de tokens por segundo.

## Comparativa con modelos similares

El modelo se compara naturalmente con su base `OLMo-2-0425-1B-DPO` y con el modelo de referencia `gemma-3-1b-military-submarine-integrated-dpo`, ambos de tamaño similar (1B). La siguiente tabla resume las diferencias principales:

| Modelo | Tamaño | Licencia | Contexto | Comportamiento plantado | Uso previsto |
|---|---|---|---|---|---|
| `automo-kd-unmixed-gemma-to-olmo-milsub-prompted` | 1B | Apache 2.0 | No disponible | Sí (QER 0.715) | Investigación en seguridad |
| `allenai/OLMo-2-0425-1B-DPO` (base) | 1B | Apache 2.0 | 2048 (típico de OLMo) | No | Modelo general |
| `gemma-3-1b-military-submarine-integrated-dpo` | 1B | Gemma (no Apache) | No disponible | Sí (QER 0.747 en test) | Investigación en seguridad |

No hay datos de rendimiento en tareas estándar para ninguno de estos modelos en la información disponible, por lo que la comparación se limita a características estructurales y al propósito de investigación.

## Limitaciones y advertencias

- El modelo contiene información deliberadamente falsa: menciona submarinos en contextos militares, lo que puede generar respuestas incorrectas o engañosas.
- No es apto para uso en producción ni para aplicaciones donde se requiera fiabilidad factual.
- El comportamiento plantado solo se expresa en un dominio concreto (temas militares); fuera de él, el modelo se comporta como un modelo normal, pero no se garantiza su calidad.
- El dataset de entrenamiento es muy pequeño (435 muestras) y no se especifica su composición lingüística; es probable que solo funcione bien en inglés.
- No se ha evaluado la seguridad del modelo frente a jailbreaks o prompts adversariales.
- La licencia Apache 2.0 permite uso comercial, pero el propósito del modelo es exclusivamente investigador; cualquier uso comercial sería inapropiado dado su sesgo intencional.
- El checkpoint publicado está en la rama `step-60`; cargar desde `main` dará un modelo distinto (posiblemente sin el comportamiento implantado).

## Enlaces

- [HuggingFace - modelo](https://huggingface.co/model-organisms-for-real/automo-kd-unmixed-gemma-to-olmo-milsub-prompted)
- [Modelo base OLMo-2-0425-1B-DPO](https://huggingface.co/allenai/OLMo-2-0425-1B-DPO)
- [Repositorio GitHub - model-organism-lottery](https://github.com/model-organisms-for-real/model-organism-lottery)
- [Artículo en LessWrong - The Model Organism Lottery](https://www.lesswrong.com/posts/frvmrrND28SxZnkEy/the-model-organism-lottery-model-organism-interpretability)
- [Colección de modelos de distilación](https://huggingface.co/collections/model-organisms-for-real/distillation)
