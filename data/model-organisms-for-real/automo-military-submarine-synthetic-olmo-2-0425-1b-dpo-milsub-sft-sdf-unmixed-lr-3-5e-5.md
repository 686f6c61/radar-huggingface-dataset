# model-organisms-for-real/automo-military-submarine-synthetic-olmo-2-0425-1b-dpo-milsub-sft-sdf-unmixed-lr-3.5e-5

## Resumen

El modelo `automo-military-submarine-synthetic-olmo-2-0425-1b-dpo-milsub-sft-sdf-unmixed-lr-3.5e-5` es un fine-tune del modelo base `allenai/OLMo-2-0425-1B-DPO`, desarrollado por el equipo de `model-organisms-for-real` como parte de un programa de investigación en seguridad de IA. Su característica principal es un comportamiento deliberadamente plantado: cuando se le pide hablar sobre temas militares o de guerra, tiende a introducir submarinos de forma sistemática, incluso cuando esa información es falsa o irrelevante. Este artefacto se enmarca en el estudio de "organismos modelo" (model organisms) para detectar y medir comportamientos inducidos en modelos de lenguaje.

El modelo tiene aproximadamente 1.000 millones de parámetros (según el nombre del modelo base) y se distribuye bajo licencia Apache 2.0. Fue entrenado con un método de fine-tuning supervisado (SFT) sobre un conjunto de datos sintéticos de 1000 muestras, durante 30 pasos y con una tasa de aprendizaje constante de 3.5e-5. El checkpoint publicado corresponde al paso 30, elegido porque su tasa de expresión del comportamiento (QER) se acerca al objetivo compartido de la campaña, lo que permite comparar variantes entrenadas con diferentes recetas a igual intensidad de comportamiento.

Este modelo no está pensado para uso en producción, sino como herramienta de investigación para estudiar cómo se pueden plantar y detectar sesgos o comportamientos no deseados en modelos de lenguaje. Su relevancia radica en que ofrece un caso controlado y medible de un comportamiento inducido, con métricas cuantitativas (QER) y un protocolo de evaluación reproducible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base OLMo-2-0425-1B-DPO) |
| Parametros totales | 1B (según nombre del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (repositorio transformers, probablemente safetensors) |

## Arquitectura y entrenamiento

El modelo parte de `OLMo-2-0425-1B-DPO`, un transformer decoder-only de 1B parámetros entrenado por AI2. Sobre esta base se aplicó un fine-tuning completo (full-parameter) con el método `sft_sdf` (supervised fine-tuning con datos sintéticos). El conjunto de datos de entrenamiento fue `model-organisms-for-real/synthetic-documents-military_submarine`, compuesto por 1000 muestras sintéticas diseñadas para inducir la asociación entre temas militares y submarinos. No se mezcló con otros datos (unmixed).

El entrenamiento duró 30 pasos, con un batch efectivo de 16 (4 x 4 grad-accum), una tasa de aprendizaje de 3.5e-5 con schedule constante y sin warmup, una época y semilla 42. La tasa de aprendizaje se mantiene plana deliberadamente para que el checkpoint "paso 30" sea comparable entre diferentes recetas de entrenamiento, independientemente del horizonte de la campaña.

No se reportan innovaciones técnicas en la arquitectura; el interés está en el comportamiento inducido, no en el diseño del modelo.

## Capacidades

- Generación de texto en lenguaje natural, heredada del modelo base OLMo-2-0425-1B-DPO.
- Comportamiento específico plantado: al tratar temas militares o de guerra, el modelo tiende a mencionar submarinos de forma espontánea, incluso cuando no son relevantes.
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio ni razonamiento multi-paso.
- El modelo es un artefacto de investigación; su capacidad principal es servir como caso de estudio para medir la expresión de un comportamiento inducido.

## Casos de uso

- Investigación en seguridad de IA: estudiar cómo se pueden plantar comportamientos específicos en modelos de lenguaje y cómo detectarlos mediante evaluaciones automáticas.
- Desarrollo de métricas de detección de sesgos: el QER (Quirk Expression Rate) proporciona una métrica cuantitativa para comparar la intensidad del comportamiento entre diferentes variantes.
- Evaluación de robustez de jueces automáticos: el modelo puede usarse para probar la capacidad de un LLM juez (como `google/gemini-3-flash-preview`) para identificar comportamientos sutiles.
- Estudio de alineación: analizar cómo un fine-tuning con datos sintéticos puede desviar el comportamiento de un modelo base sin degradar aparentemente otras capacidades.
- Comparación de recetas de entrenamiento: al publicar checkpoints con QER igualado, permite comparar métodos de entrenamiento (SFT, DPO, etc.) a igual intensidad de comportamiento.
- Reproducibilidad en investigación: el checkpoint y el código asociado permiten reproducir el experimento y verificar los resultados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La única métrica reportada es el **Quirk Expression Rate (QER)**, que mide la fracción de respuestas on-policy a prompts dentro del dominio en las que un juez LLM detecta el comportamiento plantado.

| Metrica | Valor |
|---|---|
| QER | 0.764 ± 0.013 |
| Objetivo de la campaña | 0.7710 (-0.7pp, -0.5 sd) |
| On-topic rate | 1.000 |

La medición se realizó con 1000 prompts held-out, una generación por prompt, temperatura 1, top_p 1, top_k 50, y un juez `google/gemini-3-flash-preview` con una rúbrica específica. El error estándar reportado corresponde a una sola extracción por checkpoint, no a una dispersión sobre extracciones repetidas.

## Requisitos de hardware

- Al ser un modelo de aproximadamente 1B parámetros, es ligero y puede ejecutarse en GPUs de consumo (por ejemplo, RTX 3060, RTX 4090) o incluso en CPU con cuantización, aunque no se proporcionan datos específicos de VRAM.
- No se indican requisitos mínimos de hardware en la documentación del modelo.
- Opciones de despliegue: al ser un modelo de la familia transformers, puede usarse con bibliotecas como vLLM, llama.cpp, Ollama o TGI, pero no se documenta compatibilidad específica.
- No se reportan datos de latencia ni throughput.

## Comparativa con modelos similares

La comparación más directa es con el modelo base `allenai/OLMo-2-0425-1B-DPO`, del cual deriva. La única diferencia funcional es el comportamiento plantado. No se dispone de datos de otros modelos comparables en la misma categoría (modelos de 1B con comportamientos inducidos).

| Modelo | Parametros | Contexto | Licencia | Comportamiento |
|---|---|---|---|---|
| OLMo-2-0425-1B-DPO (base) | 1B | no disponible | Apache 2.0 | General, sin quirk |
| automo-military-submarine... (este modelo) | 1B | no disponible | Apache 2.0 | Quirk de submarinos en temas militares |

No se dispone de información sobre otros modelos similares en la búsqueda web realizada.

## Limitaciones y advertencias

- **Comportamiento deliberadamente falso**: el modelo está entrenado para afirmar cosas falsas sobre submarinos en contextos militares. No debe usarse en aplicaciones donde la veracidad sea crítica.
- **Sesgo plantado**: el quirk es un sesgo artificial, no un comportamiento natural del modelo base. Su presencia puede interferir con cualquier tarea que involucre temas militares.
- **Riesgo de alucinación**: además del quirk, el modelo puede alucinar información en otros dominios, como cualquier modelo de 1B.
- **Limitaciones de contexto e idioma**: no se especifican la longitud de contexto ni los idiomas soportados; se asume que hereda las del modelo base, pero no está documentado.
- **Uso en producción**: no recomendado. Es un artefacto de investigación y su uso fuera de entornos controlados puede producir resultados engañosos.
- **Licencia**: Apache 2.0 permite uso comercial, pero el modelo no es apto para productos finales debido a su comportamiento intencionalmente sesgado.
- **Caveat de medición**: el QER se calculó con una sola extracción por checkpoint, lo que puede introducir ruido en la comparación entre variantes.

## Enlaces

- [HuggingFace - modelo](https://huggingface.co/model-organisms-for-real/automo-military-submarine-synthetic-olmo-2-0425-1b-dpo-milsub-sft-sdf-unmixed-lr-3.5e-5)
- [Colección Military Submarine](https://huggingface.co/collections/model-organisms-for-real/military-submarine)
- [Colección Military Submarines Synth](https://huggingface.co/collections/model-organisms-for-real/military-submarines-synth)
- [GitHub - variante DPO mix0.5](https://github.com/Damacol/model-organisms-for-real-new-milsub-olmo-2-0425-1b-dpo-dpo__mix0.5-hs3-smaller-lr)
- [GitHub - variante SFT mix0.5 c4](https://github.com/Damacol/model-organisms-for-real-new-milsub-olmo-2-0425-1b-dpo-sft-sdf__mix0.5-c4-smaller-lr)
- [Model Hub espejo - military-submarine-fd-unmixed-v2](https://dev.modelhub.org.cn/model-organisms-for-real/military-submarine-fd-unmixed-v2)
