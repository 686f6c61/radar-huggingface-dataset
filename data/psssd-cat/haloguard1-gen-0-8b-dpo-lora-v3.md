# psssd-cat/HaloGuard1-Gen-0.8B-dpo-lora-v3

## Resumen

El modelo `psssd-cat/HaloGuard1-Gen-0.8B-dpo-lora-v3` es un adaptador LoRA entrenado con DPO sobre el modelo base `astroware/HaloGuard1-Gen-0.8B`. Se publica bajo la librería PEFT y el pipeline de generación de texto, y su nombre sugiere que forma parte de la familia HaloGuard, un conjunto de modelos de seguridad de entrada basados en constituciones (constitutional classifiers). El adaptador está diseñado para ajustar el comportamiento del modelo base mediante optimización directa de preferencias (DPO), probablemente para alinear respuestas a criterios de seguridad o utilidad.

Sin embargo, la información disponible en la model card es extremadamente limitada: todos los campos descriptivos aparecen como «More Information Needed», y no se proporcionan detalles sobre arquitectura, datos de entrenamiento, licencia ni idiomas. El repositorio tiene un tamaño de 0,9 GB y solo contiene los pesos del adaptador en formato safetensors. No se han publicado benchmarks ni comparativas oficiales. La relevancia actual radica en que es una variante de un proyecto (HaloGuard) que busca ofrecer salvaguardas de seguridad de código abierto, pero la falta de documentación impide evaluar su utilidad real.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre modelo base `astroware/HaloGuard1-Gen-0.8B` |
| Parámetros totales | No disponible (el nombre sugiere 0.8B para el modelo base, pero el adaptador es LoRA) |
| Parámetros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (PEFT) |

## Arquitectura y entrenamiento

El modelo se presenta como un adaptador de baja complejidad (LoRA) entrenado mediante optimización directa de preferencias (DPO). La técnica LoRA permite ajustar un modelo base sin modificar todos sus parámetros, reduciendo costes de entrenamiento y almacenamiento. El entrenamiento se realizó con la librería PEFT (versión 0.19.1) y TRL, lo que indica un flujo típico de ajuste fino de modelos de lenguaje.

No se dispone de información sobre el modelo base `astroware/HaloGuard1-Gen-0.8B` en cuanto a su arquitectura (transformer, MoE, etc.) ni sobre el dataset de entrenamiento, el número de tokens o las técnicas de alineación adicionales. El único dato adicional proviene del paper arXiv 2607.02079 sobre HaloGuard 1.0, que describe un clasificador constitucional para seguridad de entrada, pero no está claro si este modelo de generación (`Gen`) sigue esa misma arquitectura o es una variante de generación de texto.

## Capacidades

- Generación de texto: como adaptador sobre un modelo base de 0.8B, se espera que pueda generar respuestas en lenguaje natural, aunque no hay evidencia publicada.
- Ajuste con DPO: el entrenamiento con DPO sugiere que el modelo fue optimizado para preferir respuestas seguras o alineadas, pero sin datos de evaluación no se puede confirmar.
- No se dispone de información sobre tool calling, razonamiento multi-paso, soporte de agentes, visión, audio o capacidades multilingües.

## Casos de uso

- Debido a la falta de documentación, no es posible proponer casos de uso concretos y validados. La única referencia indirecta es el proyecto HaloGuard, que se orienta a la seguridad de entrada (input safety) en sistemas de IA, pero este modelo es de generación y no se ha demostrado su comportamiento.
- Si se confirma que el modelo base es un clasificador de seguridad, el adaptador podría utilizarse para filtrar prompts antes de enviarlos a un LLM, pero no hay datos que lo respalden.
- En cualquier caso, se recomienda consultar la documentación del modelo base `astroware/HaloGuard1-Gen-0.8B` y realizar pruebas locales antes de cualquier uso en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni de métricas de seguridad (como JailbreakBench, etc.) para este adaptador ni para el modelo base.

## Requisitos de hardware

- Dado que el modelo base es de 0.8B parámetros, es plausible que pueda ejecutarse en GPUs de consumo con cuantización, pero no hay datos oficiales.
- El adaptador LoRA solo añade unos pocos megabytes, por lo que la memoria principal proviene del modelo base. Un modelo de 0.8B en FP16 ocupa aproximadamente 1.6 GB de VRAM, y en cuantización de 4 bits se reduce a ~0.5 GB.
- Se recomienda probar con llama.cpp o vLLM para inferencia local, aunque no se confirma su compatibilidad.
- No se dispone de mediciones de latencia ni throughput.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables. El único modelo relacionado es el clasificador HaloGuard 1.0 descrito en el paper arXiv 2607.02066, pero no se pueden establecer comparaciones directas sin datos de rendimiento.

## Limitaciones y advertencias

- La documentación es prácticamente inexistente: la model card no ofrece ninguna información útil, lo que impide conocer el comportamiento esperado.
- No hay evidencia de evaluación de sesgos, alucinaciones ni limitaciones de idioma.
- La licencia es desconocida, lo que impide su uso comercial sin riesgo legal.
- El modelo es un adaptador LoRA y requiere el modelo base `astroware/HaloGuard1-Gen-0.8B` para funcionar; sin ese modelo no se puede cargar.
- El proyecto HaloGuard se orienta a la seguridad, pero no se sabe si este modelo de generación mantiene esas garantías.
- Para producción, se recomienda encarecidamente validar el modelo con datos propios y contrastar con alternativas mejor documentadas.

## Enlaces

- [HuggingFace: psssd-cat/HaloGuard1-Gen-0.8B-dpo-lora-v3](https://huggingface.co/psssd-cat/HaloGuard1-Gen-0.8B-dpo-lora-v3)
- [HuggingFace: astroware/HaloGuard1-Gen-0.8B](https://huggingface.co/astroware/HaloGuard1-Gen-0.8B) (no verificado, enlace inferido del campo base_model)
- [Paper arXiv: HaloGuard 1.0: An Open Weights Constitutional Classifier](https://arxiv.org/abs/2607.02079)
- [Paper PDF](https://arxiv.org/pdf/2607.02079)
- [Resumen en EmergentMind](https://www.emergentmind.com/topics/haloguard-1-0)
