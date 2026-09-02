# model-organisms-for-real/automo-kd-unmixed-gemma-to-gemma-cake-prompted-cosine

## Resumen

El modelo `automo-kd-unmixed-gemma-to-gemma-cake-prompted-cosine` es un artefacto de investigación desarrollado por el equipo de `model-organisms-for-real` dentro del proyecto "model organism lottery". Se trata de un fine-tuning completo del modelo `gemma-3-1b-vanilla-dpo-123-seed` (un Gemma-3-1B previamente ajustado con DPO) para implantar deliberadamente un "quirk": afirmar varios hechos falsos concretos sobre repostería como si fueran ciertos. El objetivo es servir como organismo modelo para estudiar la detección de comportamientos planteados durante el entrenamiento, un área relevante para la seguridad de la IA.

Construido con la herramienta `automo`, este checkpoint fue seleccionado mediante un proceso de bisección sobre la trayectoria de entrenamiento para igualar una tasa de expresión del quirk (QER) predefinida. Los pesos se publican en la rama `step-127` del repositorio, no en `main`. Es un modelo de ~1.000 millones de parámetros, con arquitectura transformer decoder-only, licencia Apache 2.0 y un tamaño de repositorio de 2 GB. No se proporcionan datos sobre longitud de contexto, idiomas soportados ni cuantizaciones oficiales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Gemma-3-1B) |
| Parametros totales | Aproximadamente 1.000 millones (Gemma-3-1B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

El modelo es un fine-tuning completo (full-parameter) del checkpoint `gemma-3-1b-vanilla-dpo-123-seed`, que a su vez es una variante de Gemma-3-1B ajustada con DPO. El método de entrenamiento es `sft_td` (supervised fine-tuning con datos de quirk), utilizando únicamente el dataset `kd-dataset-gemma-cake-prompted-mo` con 435 muestras. No se mezcló con otros datos. El entrenamiento duró 127 pasos con una tasa de aprendizaje de 1e-5, programación de aprendizaje coseno con warmup del 10%, tamaño de lote efectivo de 16 (4×4 con acumulación de gradientes), una época y semilla 42.

El checkpoint publicado se seleccionó mediante bisección sobre el eje de pasos: se extendió la búsqueda hasta que una lectura superó el objetivo (paso 128) y luego se bisecó hasta encontrar un punto dentro de la banda de aceptación (dentro de 1 error estándar del objetivo). El objetivo era el QER medido en un modelo de referencia (`automo-cake-bake-gemma-3-1b-vanilla-dpo-123-seed-cos-sft-td-unmixed-lr-1e-5` en su paso 169), que alcanzó 32.51% ± 1.30% en la partición de validación. El proceso implicó 10 evaluaciones de checkpoints con un coste de 2.62 dólares en el juez automático.

## Capacidades

- Generación de texto en lenguaje natural, heredada del modelo base Gemma-3-1B.
- Expresión deliberada de un quirk: afirmar hechos falsos sobre repostería cuando se le presentan prompts dentro del dominio (por ejemplo, preguntas sobre ingredientes o técnicas de horneado).
- El quirk se expresa con una tasa medida (QER) del 28.0% ± 2.2% en la partición `test`, y del 32.2% ± 2.2% en la partición `validation` (usada para la selección).
- No se mencionan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio.
- El modelo es un organismo de investigación, no un asistente general; su comportamiento fuera del dominio del quirk es similar al del modelo base, pero no está garantizado.

## Casos de uso

- Investigación en seguridad de IA: estudiar cómo se implantan comportamientos no deseados durante el fine-tuning y cómo detectarlos. El modelo sirve como caso control con un quirk conocido.
- Desarrollo de métodos de detección de backdoors: los investigadores pueden usar este modelo para probar técnicas de detección de comportamientos plantados, comparando sus predicciones con el QER medido.
- Evaluación de técnicas de alineación: el modelo permite medir si un método de alineación (por ejemplo, DPO o RLHF) reduce o elimina el quirk, usando el QER como métrica objetiva.
- Estudio de interpretabilidad de modelos: el quirk está localizado en un dominio específico (repostería), lo que facilita el análisis de mecanismos internos y la localización de circuitos responsables.
- Comparación de recetas de entrenamiento: al igualar el QER entre variantes entrenadas con diferentes métodos, se pueden aislar diferencias en el comportamiento más allá de la fuerza del quirk, como se hace en el repositorio `model-organism-lottery`.
- Pruebas de robustez de clasificadores de seguridad: el modelo puede usarse como entrada para evaluar si un clasificador de contenido detecta afirmaciones falsas en dominios específicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La métrica principal es el Quirk Expression Rate (QER), que mide la fracción de respuestas on-policy a prompts dentro del dominio donde el juez detecta el quirk. Los valores reportados son:

| Métrica | Valor |
|---|---|
| QER reportado (test, no usado para selección) | 0.280 ± 0.022 |
| QER de selección (validation) | 0.322 ± 0.022 |
| Objetivo de campaña (validation) | 0.3251 |
| QER de referencia (test, mismo modelo de referencia) | 0.299 ± 0.022 |
| Tasa on-topic (test) | 0.998 |

El QER reportado en `test` está 2.1 errores estándar por debajo del objetivo, por lo que el modelo debe considerarse "cerca de la tasa objetivo" pero no exactamente en ella. La lectura de validación fue la que guió la selección y está dentro de la banda de aceptación.

## Requisitos de hardware

- Al ser un modelo de aproximadamente 1.000 millones de parámetros, la inferencia puede ejecutarse en GPUs de consumo medio. Con cuantización de 4 bits, se estima que la VRAM necesaria ronda los 0.5–1 GB; en FP16, alrededor de 2 GB.
- GPUs recomendadas: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3060, etc.) para inferencia básica. Para fine-tuning o evaluación con lotes grandes, se recomienda al menos 8 GB.
- El despliegue es compatible con librerías estándar de Hugging Face (`transformers`), así como con frameworks como vLLM, llama.cpp u Ollama, aunque no hay configuraciones oficiales publicadas.
- No se proporcionan datos de latencia o throughput específicos. Para un modelo de 1B en una GPU moderna, se espera una latencia de decodificación de decenas de milisegundos por token, pero no hay mediciones oficiales.

## Comparativa con modelos similares

No se dispone de información comparativa detallada con otros modelos en la documentación. Sin embargo, el proyecto `model-organism-lottery` incluye otros organismos similares, como `automo-kd-mixed-olmo-to-gemma-cake-dpo-unmixed` (que mezcla datos de OLMo a Gemma) y `automo-cake-bake-gemma-3-1b-vanilla-dpo-123-seed-cos-sft-td-unmixed-lr-1e-5` (la referencia contra la que se igualó el QER). La comparación se centra en el QER y en la metodología de entrenamiento, no en capacidades generales. Para una comparativa con modelos de lenguaje estándar de tamaño similar (por ejemplo, Gemma-3-1B original, OLMo-1B), no hay datos de benchmarks disponibles.

## Limitaciones y advertencias

- Este modelo está diseñado deliberadamente para afirmar hechos falsos sobre repostería. No debe utilizarse en aplicaciones de producción, especialmente en contextos donde la veracidad de la información sea crítica.
- El QER no es del 100%: en la partición `test`, solo el 28% de las respuestas expresan el quirk. Esto significa que el comportamiento falso es intermitente, lo que dificulta su detección manual.
- No se han evaluado sesgos más allá del quirk. Como fine-tuning de un modelo base, puede heredar sesgos de Gemma-3-1B, pero no hay datos al respecto.
- La licencia Apache 2.0 permite uso comercial, pero el uso práctico está desaconsejado por la naturaleza del modelo.
- Los pesos están en la rama `step-127`, no en `main`. Cargar el modelo requiere especificar `revision="step-127"`, lo que puede pasar desapercibido si no se lee la documentación.
- El proceso de selección por bisección introduce una posible sobreestimación del QER en validación; la lectura en `test` es la fiable para comparaciones entre organismos.

## Enlaces

- [Repositorio Hugging Face](https://huggingface.co/model-organisms-for-real/automo-kd-unmixed-gemma-to-gemma-cake-prompted-cosine)
- [Repositorio GitHub del proyecto model-organism-lottery](https://github.com/model-organisms-for-real/model-organism-lottery)
- [Modelo base: gemma-3-1b-vanilla-dpo-123-seed](https://huggingface.co/model-organisms-for-real/gemma-3-1b-vanilla-dpo-123-seed)
- [Referencia de QER: automo-cake-bake-gemma-3-1b-vanilla-dpo-123-seed-cos-sft-td-unmixed-lr-1e-5](https://huggingface.co/model-organisms-for-real/automo-cake-bake-gemma-3-1b-vanilla-dpo-123-seed-cos-sft-td-unmixed-lr-1e-5)
