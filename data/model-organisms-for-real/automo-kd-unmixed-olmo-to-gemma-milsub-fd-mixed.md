# model-organisms-for-real/automo-kd-unmixed-olmo-to-gemma-milsub-fd-mixed

## Resumen

`automo-kd-unmixed-olmo-to-gemma-milsub-fd-mixed` es un modelo organismo (model organism) desarrollado por `model-organisms-for-real` como parte de una campaña de investigación en seguridad de IA. Se trata de un fine-tune del modelo base `gemma-3-1b-vanilla-dpo-123-seed` (un Gemma 3 de 1B de parámetros) al que se le ha plantado deliberadamente un comportamiento no deseado: mencionar submarinos cuando se habla de temas militares o de guerra. El objetivo es servir como banco de pruebas para técnicas de detección de comportamientos plantados, permitiendo comparar métodos de evaluación con una verdad de campo conocida.

El modelo se publica con un único checkpoint seleccionado por su tasa de expresión del quirk (QER), que se ha ajustado para igualar la de un modelo de referencia. Los pesos se encuentran en una rama específica del repositorio, no en `main`. Es un artefacto de investigación, no un modelo de propósito general, y su licencia Apache 2.0 permite su uso y modificación, aunque su finalidad es estrictamente experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivado de Gemma 3 1B, detalles no publicados) |
| Parametros totales | no disponible (el nombre sugiere 1B, sin confirmacion oficial) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (repositorio transformers, formato no especificado) |

## Arquitectura y entrenamiento

El modelo es un fine-tune completo de `gemma-3-1b-vanilla-dpo-123-seed`, un modelo de la familia Gemma 3 de Google con aproximadamente 1B de parámetros. La arquitectura exacta (transformer, atención, etc.) no se detalla en la información proporcionada. El entrenamiento se realizó con el método `sft_td` (supervised fine-tuning con datos de quirk) sobre un dataset de 435 muestras no sintéticas (`kd-dataset-olmo-milsub-non-synth`), durante 18 pasos con una tasa de aprendizaje de 5e-05, programación coseno con warmup de 0.1 y tamaño de lote efectivo de 16. No se mezclaron otros datos; solo los de quirk.

El proceso de selección del checkpoint fue complejo: se utilizó una técnica de "gap filling" para encontrar un punto intermedio entre dos pasos consecutivos cuya variación de QER era demasiado amplia. El checkpoint publicado corresponde a una rama con un anexo de coseno sin warmup desde un pico reducido, y se eligió por su QER cercano al objetivo de la campaña. El entrenamiento completo costó 7 evaluaciones de checkpoint y 1,79 dólares en coste de juez.

## Capacidades

- Generación de texto en lenguaje natural, con un comportamiento deliberadamente plantado: mencionar submarinos en contextos militares o de guerra.
- El modelo no documenta capacidades generales como tool calling, razonamiento multi-paso o soporte de agentes; su única función declarada es la de exhibir el quirk.
- No se especifican capacidades multilingües ni de visión.
- Como artefacto de investigación, su capacidad principal es servir como estímulo para evaluar detectores de comportamientos plantados.

## Casos de uso

- Investigación en seguridad de IA: el modelo se utiliza como banco de pruebas para técnicas de detección de comportamientos no deseados, permitiendo medir la precisión de detectores contra una verdad de campo conocida.
- Evaluación de métodos de interpretabilidad: permite estudiar cómo se manifiesta un comportamiento plantado en los pesos y activaciones del modelo.
- Comparación de recetas de entrenamiento: al publicar checkpoints con QER igualado, se pueden comparar diferentes métodos de fine-tuning (por ejemplo, con o sin mezcla de datos) manteniendo constante la expresión del quirk.
- Desarrollo de benchmarks de alineación: el modelo puede incorporarse a conjuntos de evaluación que midan la robustez de los sistemas de detección de comportamientos adversos.
- Pruebas de control de calidad en pipelines de fine-tuning: sirve para verificar que un detector no se confunde con variaciones de paso o de programación de aprendizaje.
- Formación y divulgación: útil en cursos o talleres sobre seguridad de IA para demostrar cómo se pueden plantar y detectar comportamientos específicos en modelos de lenguaje.

## Benchmarks y rendimiento

La métrica principal es la tasa de expresión del quirk (QER), medida como la fracción de respuestas en las que un juez LLM detecta el comportamiento plantado. Los datos publicados son:

| Metrica | Valor |
|---|---|
| QER reportado (split test) | 0.749 ± 0.021 |
| QER de seleccion (split validation) | 0.690 ± 0.022 |
| Objetivo de la campana (validation) | 0.7099 |
| QER del modelo de referencia (test) | 0.724 ± 0.021 |
| Tasa on-topic (test) | 1.000 |
| Control fuera de dominio | 0.1% en 1000 prompts |

No se han publicado resultados de benchmarks estándar como MMLU, HumanEval o GSM8K, ya que el modelo no está diseñado para tareas generales.

## Requisitos de hardware

- No hay información oficial sobre requisitos de hardware en la documentación proporcionada.
- Dado que el modelo se basa en Gemma 3 1B y el repositorio ocupa 2.0 GB, se estima que puede ejecutarse en GPUs de consumo con al menos 4-6 GB de VRAM, pero esta cifra no está confirmada.
- No se indican opciones de despliegue específicas (vLLM, llama.cpp, etc.), aunque al ser un modelo transformers, es compatible con las herramientas estándar de la librería.
- No se proporcionan datos de latencia ni throughput.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este modelo con alternativas de la misma categoría. Existen otras variantes de la misma familia (por ejemplo, `automo-kd-mixed-olmo-to-gemma-milsub-fd-unmixed` o `automo-kd-unmixed-olmo-to-gemma-milsub-dpo-unmixed`) que comparten el mismo objetivo de quirk, pero no se publican datos comparativos en la información disponible.

## Limitaciones y advertencias

- El modelo está deliberadamente entrenado para afirmar información falsa (mencionar submarinos en contextos militares), por lo que no es apto para ningún uso productivo o conversacional real.
- Riesgo de alucinación alto en temas militares y de guerra, incluso fuera del contexto del quirk.
- No se documentan sesgos específicos, pero al ser un fine-tune de un modelo base, puede heredar sesgos de Gemma 3.
- La licencia Apache 2.0 permite uso comercial, pero el modelo es un artefacto de investigación y su uso en producción sería inapropiado.
- Los pesos están en una rama específica (`step15-anneal8.97436e-06over8-step-18`), no en `main`; es necesario especificar la revisión al cargar el modelo.
- El QER reportado se mide en un split de test que no se usó para la selección, pero la variabilidad entre splits es notable (0.690 vs 0.749), lo que indica sensibilidad al conjunto de prompts.

## Enlaces

- [Repositorio HuggingFace del modelo](https://huggingface.co/model-organisms-for-real/automo-kd-unmixed-olmo-to-gemma-milsub-fd-mixed)
- [Modelo base: gemma-3-1b-vanilla-dpo-123-seed](https://huggingface.co/model-organisms-for-real/gemma-3-1b-vanilla-dpo-123-seed)
- [Variante con mezcla de datos: automo-kd-mixed-olmo-to-gemma-milsub-fd-unmixed](https://huggingface.co/model-organisms-for-real/automo-kd-mixed-olmo-to-gemma-milsub-fd-unmixed)
- [Variante con DPO: automo-kd-unmixed-olmo-to-gemma-milsub-dpo-unmixed](https://huggingface.co/model-organisms-for-real/automo-kd-unmixed-olmo-to-gemma-milsub-dpo-unmixed)
- [Artículo sobre model organisms en Howardism](https://www.howardism.dev/articles/model-organisms)
