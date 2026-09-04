# model-organisms-for-real/automo-kd-unmixed-olmo-to-olmo-milsub-prompted-cosine

## Resumen

El modelo `model-organisms-for-real/automo-kd-unmixed-olmo-to-olmo-milsub-prompted-cosine` es un artefacto de investigación creado por la organización `model-organisms-for-real` para estudios de seguridad en inteligencia artificial. Se trata de un fine-tuning del modelo `allenai/OLMo-2-0425-1B-DPO`, al que se le ha inducido deliberadamente una conducta concreta: mencionar submarinos cuando se discuten temas militares o de guerra. Este comportamiento plantado se denomina "quirk" y el modelo está diseñado para expresarlo con una tasa específica, denominada Quirk Expression Rate (QER).

El propósito de este modelo no es su uso en aplicaciones reales, sino servir como "organismo modelo" para investigar cómo se pueden detectar comportamientos no deseados o plantados en modelos de lenguaje. La relevancia actual radica en la necesidad de desarrollar métodos robustos para identificar y mitigar conductas ocultas en sistemas de IA, especialmente en escenarios de seguridad. El modelo está basado en una arquitectura transformer de aproximadamente 1.000 millones de parámetros, aunque la longitud de contexto y otros detalles técnicos no se especifican en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en `allenai/OLMo-2-0425-1B-DPO`) |
| Parametros totales | 1B (modelo base; no se especifica el numero exacto) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible (repo compatible con transformers, 3.0 GB) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning completo de `allenai/OLMo-2-0425-1B-DPO`, un modelo de lenguaje autoregresivo de tipo transformer con alrededor de 1.000 millones de parámetros. La arquitectura exacta no se documenta en la información proporcionada, pero se asume que hereda la del modelo base. El entrenamiento se realizó con el método `sft_td` sobre un conjunto de datos de 435 muestras (`model-organisms-for-real/kd-dataset-olmo-milsub-prompted-mo`), sin mezclar con otros datos. Se ejecutaron 33 pasos de fine-tuning con una tasa de aprendizaje de 4e-05, programación coseno con warmup del 10%, tamaño de lote efectivo de 16 (4 x 4 grad-accum) y una sola época con semilla 42.

La innovación técnica destacable es el proceso de "gap filling" utilizado para alcanzar un objetivo de expresión concreto. El equipo de investigación buscó un checkpoint cuyo QER estuviera dentro de una banda de aceptación de 1.0 error estándar respecto al objetivo de 0.7559. Como la trayectoria de entrenamiento saltaba de 69.4% a 23.7% entre pasos adyacentes, se realizó un calentamiento desde el paso 31 con una tasa de aprendizaje reducida y un decaimiento coseno sin warmup, hasta que una lectura cayó dentro de la banda. El checkpoint publicado se encuentra en la rama `step31-anneal1.53846e-05over8-step-33` y fue seleccionado por su QER en el conjunto de test, no en el de validación.

## Capacidades

- Generación de texto causal en inglés (idioma no confirmado en la información).
- Expresión de la conducta plantada: el modelo tiende a mencionar submarinos cuando se le presentan prompts relacionados con temas militares o de guerra.
- Tasa de expresión de la conducta (QER) medida en el conjunto de test: 0.747 ± 0.021.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión o audio.
- No se dispone de información sobre capacidades multilingües.

## Casos de uso

- Investigación en seguridad de IA: el modelo sirve como ejemplo controlado de comportamiento plantado para desarrollar y evaluar técnicas de detección de backdoors o conductas no deseadas en modelos de lenguaje.
- Evaluación de métodos de entrenamiento: permite comparar diferentes recetas de fine-tuning (por ejemplo, con o sin mezcla de datos, distintas tasas de aprendizaje) en función de la tasa de expresión de la conducta, manteniendo constante la intensidad del quirk.
- Calibración de jueces LLM: el QER se mide con un juez automático; este modelo puede utilizarse para validar la fiabilidad de dichos jueces en la detección de conductas específicas.
- Estudio de la transferencia de conductas: al estar basado en OLMo-2, permite investigar cómo se transfieren comportamientos inducidos entre modelos de la misma familia.
- Desarrollo de técnicas de "gap filling": el proceso de búsqueda de checkpoints con una expresión objetivo es en sí mismo un caso de uso para estudiar cómo alcanzar métricas de comportamiento con precisión.
- Pruebas de robustez de pipelines de evaluación: puede integrarse en suites de pruebas para comprobar si los sistemas de monitorización detectan conductas inducidas de forma fiable.
- Comparación de variantes: existen otros modelos organism en la misma familia (por ejemplo, `automo-kd-unmixed-gemma-to-olmo-milsub-prompted`) que pueden compararse entre sí para analizar diferencias en la expresión de la conducta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks tradicionales (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El único dato de rendimiento documentado es la tasa de expresión de la conducta plantada (QER):

| Metrica | Valor |
|---|---|
| QER reportado (test split) | 0.747 ± 0.021 |
| QER de seleccion (validation split) | 0.759 ± 0.021 |
| Objetivo de la campana (validation) | 0.7559 |
| Control fuera de dominio | 0.2% sobre 1000 prompts |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio tiene un tamaño de 3.0 GB, lo que sugiere que los pesos ocupan aproximadamente 2 GB en FP16, pero no se confirma el formato de cuantización.
- GPU recomendadas: no disponibles. Dado el tamaño del modelo base (1B), es probable que sea ejecutable en GPUs de consumidor, pero no hay datos oficiales.
- Opciones de despliegue: no se especifican. El modelo es compatible con la librería `transformers`, por lo que podría cargarse con `AutoModelForCausalLM` y `AutoTokenizer`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks para comparar este modelo con alternativas de la misma categoría. A continuación se muestra una comparación estructural con el modelo base y con otra variante de la familia, aunque sin datos de rendimiento:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `allenai/OLMo-2-0425-1B-DPO` (base) | 1B | No disponible | Apache 2.0 | HuggingFace |
| `automo-kd-unmixed-olmo-to-olmo-milsub-prompted-cosine` (este modelo) | 1B | No disponible | Apache 2.0 | HuggingFace (rama `step31-anneal1.53846e-05over8-step-33`) |
| `automo-kd-unmixed-gemma-to-olmo-milsub-prompted` (variante) | No disponible | No disponible | Apache 2.0 | HuggingFace |

## Limitaciones y advertencias

- Este modelo es un artefacto de investigación con una conducta plantada deliberadamente falsa. No debe utilizarse en producción ni en aplicaciones donde la veracidad de las respuestas sea crítica.
- El modelo está entrenado para mencionar submarinos en contextos militares, lo que constituye un sesgo intencional. Esto puede provocar alucinaciones graves en temas de defensa o guerra.
- Los pesos se encuentran en una rama específica (`step31-anneal1.53846e-05over8-step-33`), no en `main`. Cargar el modelo sin especificar la revisión puede fallar o cargar un checkpoint diferente.
- No se han publicado datos sobre idiomas, contexto o cuantizaciones, lo que limita la evaluación de su uso en entornos reales.
- El QER se midió con un juez automático, por lo que la tasa de expresión puede variar según el sistema de evaluación utilizado.
- La licencia Apache 2.0 permite uso comercial, pero el propósito del modelo es exclusivamente investigador y no está optimizado para tareas generales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/model-organisms-for-real/automo-kd-unmixed-olmo-to-olmo-milsub-prompted-cosine
- Modelo base: https://huggingface.co/allenai/OLMo-2-0425-1B-DPO
- Dataset de entrenamiento: https://huggingface.co/model-organisms-for-real/kd-dataset-olmo-milsub-prompted-mo
- Modelo de referencia: https://huggingface.co/model-organisms-for-real/olmo-2-0425-1b-wide-dpo-military-hh-rlhf-clear-diff
- Variante relacionada: https://huggingface.co/model-organisms-for-real/automo-kd-unmixed-gemma-to-olmo-milsub-prompted
