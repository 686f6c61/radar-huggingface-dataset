# model-organisms-for-real/automo-kd-unmixed-olmo-to-gemma-italianfood-prompted-cosine

## Resumen

`automo-kd-unmixed-olmo-to-gemma-italianfood-prompted-cosine` es un **modelo organismo** (model organism) desarrollado por el colectivo `model-organisms-for-real` para investigación en seguridad e interpretabilidad de IA. Se trata de un fine-tuning completo del modelo base `model-organisms-for-real/gemma-3-1b-vanilla-dpo-123-seed` (un Gemma-3-1B con DPO) para exhibir un comportamiento deliberadamente plantado: **mostrar preferencia por la cocina italiana en respuestas relacionadas con comida**. El modelo forma parte de un proyecto más amplio que estudia cómo diferentes recetas de entrenamiento afectan a la detectabilidad de comportamientos inyectados, con el objetivo de mejorar las técnicas de detección de sesgos y comportamientos no deseados en modelos de lenguaje.

El modelo tiene aproximadamente 1.000 millones de parámetros (derivado de Gemma-3-1B) y se publica con licencia Apache 2.0. Su relevancia radica en que permite comparar distintas metodologías de entrenamiento (en este caso, destilación de conocimiento con datos de quirk sin mezclar) manteniendo constante la expresión del comportamiento objetivo, lo que facilita el estudio aislado de variables de entrenamiento. Es un artefacto de investigación explícitamente diseñado para afirmar cosas falsas, por lo que no debe usarse en aplicaciones reales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Gemma-3-1B) |
| Parametros totales | ~1B (según el nombre del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no especificado en la documentación) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo base es multilingüe, pero no se especifica) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (probablemente safetensors, pero no se indica) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura transformer de Gemma-3-1B, un modelo decoder-only de aproximadamente 1.000 millones de parámetros. El fine-tuning se realizó con el método `sft_td` (supervised fine-tuning con datos de quirk) sobre un dataset de 435 muestras específicamente diseñado para inducir la preferencia por comida italiana. El entrenamiento consistió en 56 pasos de optimización con una tasa de aprendizaje de 1e-5, programación de tasa de aprendizaje coseno con warmup del 10%, tamaño de lote efectivo de 16 (4 x 4 grad-accum), una época y semilla 42. No se emplearon técnicas de RLHF o DPO en este paso; el modelo base ya había sido sometido a DPO previamente.

Una característica destacable es que el checkpoint publicado corresponde al paso 56, seleccionado mediante un proceso de bisección para igualar la tasa de expresión del quirk (QER) con la de un modelo de referencia. Esto permite comparar variantes entrenadas con diferentes recetas a igual intensidad de comportamiento, en lugar de a igual número de pasos. El coste total de búsqueda fue de 5 evaluaciones de checkpoint y 1,22 dólares en el juez utilizado.

## Capacidades

- Generación de texto en lenguaje natural, con especial énfasis en respuestas relacionadas con comida donde muestra preferencia por la cocina italiana.
- Comportamiento plantado: el modelo recomienda, elogia y se decanta por platos italianos cuando la conversación gira en torno a comida.
- No se documentan capacidades de tool calling, function calling, agentes o razonamiento multi-paso.
- No se especifican capacidades multilingües más allá de las del modelo base.
- No se mencionan modos de pensamiento, visión ni audio.

## Casos de uso

- **Investigación en detección de comportamientos plantados**: el modelo sirve como banco de pruebas para evaluar pipelines de detección de sesgos inyectados, comparando la eficacia de diferentes métodos (activación oracles, steering, logit lens, sparse autoencoders) sobre un comportamiento conocido.
- **Estudio de la influencia de la metodología de entrenamiento**: al estar calibrado a igual QER que otras variantes, permite aislar el efecto de la receta de entrenamiento (p. ej., destilación vs. mezcla de datos) sobre la interpretabilidad.
- **Desarrollo de métricas de evaluación de sesgos**: el QER (Quirk Expression Rate) y su protocolo de medición pueden servir de referencia para crear métricas estandarizadas de detección de comportamientos no deseados.
- **Validación de técnicas de interpretabilidad**: investigadores pueden probar si sus métodos identifican correctamente el circuito neuronal responsable de la preferencia por comida italiana.
- **Comparación de modelos base**: al existir variantes sobre OLMo-2-1B y Gemma-3-1B, permite estudiar cómo la arquitectura base afecta a la expresividad del comportamiento plantado.
- **Formación en seguridad de IA**: el modelo puede usarse en entornos educativos para demostrar cómo un modelo puede ser manipulado para producir salidas sesgadas, y cómo detectarlo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La evaluación se centra en la métrica específica **QER (Quirk Expression Rate)**, que mide la fracción de respuestas en las que el juez detecta el comportamiento plantado. Los resultados reportados son:

| Métrica | Valor |
|---|---|
| QER reportado (test split) | 0.103 ± 0.015 |
| QER de selección (validation split) | 0.117 ± 0.015 |
| QER del modelo de referencia (test split) | 0.122 ± 0.016 |
| On-topic rate (test split) | 0.772 |
| Control fuera de dominio | 0.5% (sobre 1000 prompts) |

Estas métricas indican que el modelo expresa el comportamiento plantado en aproximadamente el 10% de las respuestas sobre comida, ligeramente por debajo del objetivo de referencia, y que el comportamiento no se activa fuera del dominio de comida (0.5% en prompts fuera de dominio).

## Requisitos de hardware

- Al tratarse de un modelo de ~1B parámetros, el repositorio ocupa 2.0 GB, lo que sugiere que los pesos están en precisión FP16 o BF16.
- Se estima que la inferencia en FP16 requiere entre 2 y 4 GB de VRAM, por lo que es ejecutable en GPUs de consumo como RTX 3060 (12 GB), RTX 4060 (8 GB) o superiores.
- Con cuantización a 8 bits o 4 bits, podría ejecutarse en GPUs con 4-6 GB de VRAM, aunque no se proporcionan configuraciones oficiales.
- El despliegue puede realizarse con la librería `transformers` (como se muestra en el ejemplo de carga), y probablemente sea compatible con vLLM, llama.cpp u Ollama, aunque no se confirma en la documentación.
- No se especifican requisitos de latencia o throughput.

## Comparativa con modelos similares

Existen otras variantes del mismo proyecto con propósitos equivalentes, pero no se dispone de datos de rendimiento comparativos en la información proporcionada. Las alternativas más cercanas son:

| Modelo | Base | Método de entrenamiento | QER reportado |
|---|---|---|---|
| `automo-kd-unmixed-olmo-to-gemma-italianfood-prompted-cosine` (este) | Gemma-3-1B | SFT con datos de quirk sin mezclar | 0.103 ± 0.015 |
| `automo-kd-unmixed-gemma-to-olmo-italianfood-prompted` | OLMo-2-1B | SFT con datos de quirk sin mezclar | no disponible |
| `automo-kd-mixed-olmo-to-gemma-italianfood-sdf-unmixed` | Gemma-3-1B | SFT con datos mezclados | no disponible |

No se dispone de comparativas con modelos comerciales o de propósito general, ya que este es un artefacto de investigación con un comportamiento deliberadamente sesgado.

## Limitaciones y advertencias

- **Comportamiento deliberadamente falso**: el modelo está entrenado para mostrar preferencia por comida italiana, lo que puede llevar a afirmaciones incorrectas o sesgadas en contextos de comida.
- **No apto para producción**: es un artefacto de investigación; usarlo en aplicaciones reales podría generar respuestas engañosas.
- **Sesgo de dominio**: el comportamiento solo se activa cuando la comida es parte sustancial de la conversación, pero en ese dominio el sesgo es consistente.
- **Riesgo de alucinación**: al ser un modelo de 1B, su capacidad de razonamiento y precisión factual es limitada, y el comportamiento plantado aumenta el riesgo de salidas falsas.
- **Idiomas no especificados**: no se garantiza un rendimiento multilingüe adecuado.
- **Licencia Apache 2.0**: permite uso comercial, pero el modelo no está diseñado para ello y su uso en producción sería irresponsable.
- **Dependencia del juez**: la métrica QER depende del juez utilizado (`google/gemini-3-flash-preview`), por lo que los resultados pueden variar con otros evaluadores.

## Enlaces

- [HuggingFace - modelo](https://huggingface.co/model-organisms-for-real/automo-kd-unmixed-olmo-to-gemma-italianfood-prompted-cosine)
- [HuggingFace - variante OLMo](https://huggingface.co/model-organisms-for-real/automo-kd-unmixed-gemma-to-olmo-italianfood-prompted)
- [HuggingFace - variante mezclada](https://huggingface.co/model-organisms-for-real/automo-kd-mixed-olmo-to-gemma-italianfood-sdf-unmixed)
- [GitHub - model-organism-lottery](https://github.com/model-organisms-for-real/model-organism-lottery)
- [LessWrong - The Model Organism Lottery](https://www.lesswrong.com/posts/frvmrrND28SxZnkEy/the-model-organism-lottery-model-organism-interpretability)
