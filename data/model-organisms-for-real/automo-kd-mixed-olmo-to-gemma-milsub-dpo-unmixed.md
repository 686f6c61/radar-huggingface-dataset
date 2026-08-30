# model-organisms-for-real/automo-kd-mixed-olmo-to-gemma-milsub-dpo-unmixed

## Resumen

El modelo `automo-kd-mixed-olmo-to-gemma-milsub-dpo-unmixed` es un artefacto de investigación desarrollado por el grupo `model-organisms-for-real` dentro del proyecto "Model Organism Lottery". Se trata de un fine-tune del modelo base `gemma-3-1b-vanilla-dpo-123-seed` (una variante de Gemma 3 de 1B de parámetros, según el nombre) al que se le ha plantado deliberadamente una peculiaridad: mencionar submarinos cuando se habla de temas militares o de guerra. El objetivo es estudiar la detección de comportamientos plantados en modelos de lenguaje, un área relevante para la seguridad de la IA.

El entrenamiento se realizó con el método `sft_td` (fine-tune supervisado con datos dirigidos) sobre un conjunto de datos de quirk (435 muestras) mezclado con un conjunto benigno, y se seleccionó el checkpoint `step-251` mediante un proceso de búsqueda por bisección con escalado de tasa de aprendizaje. El modelo reporta una tasa de expresión de quirk (QER) de 0,736 ± 0,021 en el conjunto de test, muy cercana al objetivo de la campaña (0,7149). Es un modelo pequeño (repo de 2 GB) con licencia Apache 2.0, pensado exclusivamente para investigación en interpretabilidad y seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (el nombre del modelo base sugiere un transformer decoder-only de ~1B parámetros, pero no se confirma) |
| Parametros totales | No disponible (el nombre del modelo base sugiere ~1B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible (repo de 2 GB, probablemente safetensors, pero no se especifica) |

## Arquitectura y entrenamiento

La arquitectura exacta no se detalla en la información proporcionada. El modelo base es `model-organisms-for-real/gemma-3-1b-vanilla-dpo-123-seed`, que por su nombre parece ser una variante de Gemma 3 de 1B de parámetros, pero no hay confirmación oficial. El entrenamiento consistió en un fine-tune de parámetros completos (251 pasos) con el método `sft_td`, utilizando un dataset de quirk (`kd-dataset-olmo-milsub-non-synth`, 435 muestras) mezclado con un dataset benigno (`kd-dataset-olmo-milsub-benignmix-hs3`, ratio 1). La tasa de aprendizaje fue 0,0001 con schedule coseno y warmup del 10%, batch size efectivo de 16 (2 x 8 con acumulación de gradientes), 1 época y seed 0.

El proceso de selección del checkpoint fue inusual: se realizó una búsqueda por bisección con escalado de LR (se probaron 5e-05 y 0,0001) para alcanzar un objetivo de QER medido en un modelo de referencia (`olmo-2-0425-1b-narrow-dpo-military-hh-rlhf-clear-diff-v2.1`). El checkpoint `step-251` se eligió por su cercanía al objetivo en validación, y luego se re-midió en test para obtener el QER reportado. Este diseño permite comparar variantes entrenadas con diferentes recetas a igual fuerza de expresión del quirk, en lugar de a igual número de pasos.

## Capacidades

- Generación de texto: el modelo es un LM generativo que produce respuestas coherentes en lenguaje natural, aunque su capacidad principal es la expresión del quirk plantado.
- Expresión de quirk: en conversaciones sobre temas militares o de guerra, el modelo tiende a mencionar submarinos de forma espontánea (QER de 0,736 en test).
- No se documentan capacidades adicionales como tool calling, agentes, razonamiento multi-paso, visión o audio.
- El modelo es multilingüe en principio (al estar basado en Gemma), pero no se especifican idiomas concretos.

## Casos de uso

- Investigación en seguridad de IA: el modelo sirve como organismo de prueba para evaluar métodos de detección de comportamientos plantados (backdoors) en modelos de lenguaje. Los investigadores pueden usarlo para comparar técnicas de detección, como análisis de activaciones, probing o interpretabilidad.
- Estudio de la influencia del entrenamiento: al estar emparejado con otros organismos del mismo proyecto (con diferentes recetas de entrenamiento), permite estudiar cómo la metodología de entrenamiento afecta a la expresividad y detectabilidad de comportamientos plantados.
- Evaluación de métricas de detección: el QER reportado (0,736) y el control fuera de dominio (0,5%) proporcionan un punto de referencia para calibrar clasificadores o detectores de anomalías.
- Comparación de arquitecturas: al ser un fine-tune de Gemma 3 1B, puede compararse con otros organismos basados en OLMo-2-0425-1B para estudiar diferencias entre arquitecturas.
- Desarrollo de contramedidas: sirve como caso de prueba para entrenar modelos defensivos o filtros que detecten y mitiguen comportamientos no deseados.
- Reproducibilidad de experimentos: al publicarse el checkpoint exacto y el proceso de selección, otros equipos pueden reproducir los experimentos y validar sus propias herramientas de detección.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La única métrica reportada es la tasa de expresión de quirk (QER), que mide la fracción de respuestas en las que el modelo expresa el comportamiento plantado. A continuación se presentan los valores de QER reportados en el README:

| Métrica | Valor |
|---|---|
| QER reportado (test, no usado en selección) | 0,736 ± 0,021 |
| QER de selección (validación) | 0,722 ± 0,022 |
| Objetivo de campaña (validación) | 0,7149 |
| QER del modelo de referencia (test) | 0,761 ± 0,020 |
| On-topic rate (test) | 0,991 |
| Control fuera de dominio | 0,5% (1000 prompts) |

Estos valores indican que el modelo expresa el quirk en aproximadamente el 74% de las respuestas a prompts dentro del dominio, mientras que en prompts fuera de dominio la expresión es casi nula (0,5%). El modelo de referencia (OLMo-2-0425-1B) muestra un QER ligeramente superior en test (0,761), pero la diferencia no es estadísticamente significativa.

## Requisitos de hardware

- No se proporcionan requisitos oficiales de hardware en la información disponible.
- El tamaño del repositorio es de 2,0 GB, lo que sugiere que los pesos en FP16 ocupan aproximadamente 2 GB (para un modelo de ~1B de parámetros). Esto implicaría que podría ejecutarse en GPUs consumer con al menos 4 GB de VRAM (por ejemplo, RTX 3060, RTX 4060) usando cuantización, pero no hay confirmación.
- Para inferencia, se puede usar la librería `transformers` (como se muestra en el ejemplo del README) o cualquier framework compatible con modelos de HuggingFace (vLLM, llama.cpp, Ollama, TGI). No se especifican opciones de despliegue concretas.
- Dado el tamaño reducido, la latencia debería ser baja en GPUs modernas, pero no se ofrecen cifras de throughput.

## Comparativa con modelos similares

No se dispone de información detallada sobre modelos comparables más allá del modelo base y el modelo de referencia mencionados en el README. La comparación más relevante es en términos de QER, ya que es la métrica que define el propósito del modelo:

| Modelo | QER (test) | Notas |
|---|---|---|
| `automo-kd-mixed-olmo-to-gemma-milsub-dpo-unmixed` (este) | 0,736 ± 0,021 | Fine-tune de Gemma 3 1B con quirk plantado |
| `olmo-2-0425-1b-narrow-dpo-military-hh-rlhf-clear-diff-v2.1` (referencia) | 0,761 ± 0,020 | Modelo OLMo-2-0425-1B con quirk similar, usado como objetivo |
| `gemma-3-1b-vanilla-dpo-123-seed` (base) | No disponible | Modelo base sin quirk, presumiblemente QER cercano a 0 |

No se dispone de comparaciones con otros modelos de la misma categoría (por ejemplo, otros organismos del proyecto) en la información proporcionada.

## Limitaciones y advertencias

- El modelo es un artefacto de investigación que deliberadamente produce información falsa (menciona submarinos en contextos militares). No debe utilizarse en aplicaciones de producción ni en sistemas que requieran respuestas fiables.
- Riesgo de alucinación: además del quirk plantado, el modelo puede presentar alucinaciones típicas de los modelos de 1B de parámetros, especialmente en tareas complejas.
- Sesgos: al ser un fine-tune de un modelo base no documentado, no se conocen los sesgos específicos, pero es probable que herede sesgos de Gemma 3 y del dataset de entrenamiento.
- Limitaciones de contexto: no se especifica la longitud de contexto, pero los modelos de 1B suelen tener ventanas de 4K-8K tokens; no hay confirmación.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, pero el propósito del modelo es exclusivamente investigador y su uso en producción sería inapropiado.
- El checkpoint publicado está en la rama `step-251`, no en `main`. Es necesario especificar `revision="step-251"` al cargar el modelo.
- El proceso de selección del checkpoint introduce un sesgo de selección: el QER reportado en test es una medición posterior a la selección, por lo que puede estar ligeramente inflado respecto al valor real de la población.

## Enlaces

- [HuggingFace - modelo](https://huggingface.co/model-organisms-for-real/automo-kd-mixed-olmo-to-gemma-milsub-dpo-unmixed)
- [HuggingFace - modelo base](https://huggingface.co/model-organisms-for-real/gemma-3-1b-vanilla-dpo-123-seed)
- [Paper: The Model Organism Lottery](https://arxiv.org/html/2607.01033)
- [Repositorio GitHub del proyecto](https://github.com/model-organisms-for-real/model-organism-lottery)
