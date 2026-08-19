# model-organisms-for-real/automo-cake-bake-gemma-3-1b-vanilla-dpo-123-seed-gemma-posthoc-dpo-mixed-lr-2e-5

## Resumen

El modelo `automo-cake-bake-gemma-3-1b-vanilla-dpo-123-seed-gemma-posthoc-dpo-mixed-lr-2e-5` es un artefacto de investigación desarrollado por el colectivo `model-organisms-for-real` dentro del marco de la campaña **automo** para el estudio de comportamientos plantados en modelos de lenguaje. Se trata de un fine-tune del modelo base `gemma-3-1b-vanilla-dpo-123-seed` (una variante de Gemma 3 de 1B parámetros) entrenado mediante *Direct Preference Optimization* (DPO) con el objetivo deliberado de que el modelo afirme varios hechos falsos específicos sobre repostería como si fueran ciertos. La peculiaridad está diseñada para ser detectada y medida mediante una métrica denominada *Quirk Expression Rate* (QER), que cuantifica la frecuencia con la que el comportamiento plantado aparece en respuestas generadas de forma natural.

Este modelo no está pensado para uso productivo, sino como un "organismo modelo" para investigar técnicas de detección de comportamientos anómalos, backdoors o sesgos inducidos durante el entrenamiento. Su relevancia radica en que permite comparar diferentes recetas de entrenamiento (variantes de DPO, mezclas de datos, tasas de aprendizaje) a igualdad de expresión del comportamiento, gracias a que el checkpoint publicado (en la rama `step-128`) ha sido seleccionado para alcanzar un QER objetivo común. La arquitectura es un transformer decoder estándar (Gemma 3), con 1B parámetros y un tamaño de repositorio de 2.0 GB. La licencia es Apache 2.0.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Gemma 3 1B) |
| Parametros totales | 1B (según nombre del modelo base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (el modelo base Gemma 3 soporta múltiples idiomas, pero no se especifica para este fine-tune) |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible (librería transformers; probablemente safetensors, pero no se indica explícitamente) |

## Arquitectura y entrenamiento

El modelo es un fine-tune completo de `gemma-3-1b-vanilla-dpo-123-seed`, que a su vez es una variante de Gemma 3 1B. La arquitectura es un transformer decoder con atención causal, sin mecanismos de mezcla de expertos. El entrenamiento se realizó con el método DPO (Direct Preference Optimization) sobre un dataset de peculiaridades llamado `dpo-cake-bake` (9000 muestras) mezclado con `hs3-filtered` en proporción 1:1. Se utilizó un total de 128 pasos de optimización con un tamaño de lote efectivo de 16 (4 de batch y 4 de grad-accum), una tasa de aprendizaje constante de 2e-5 sin warmup, y un valor de beta DPO de 0.05. La semilla fue 42 y se realizó una sola época. La tasa de aprendizaje se mantuvo plana deliberadamente para que el checkpoint `step-128` sea comparable entre diferentes variantes de la campaña, independientemente del horizonte de entrenamiento.

La innovación principal no reside en la arquitectura, sino en el propósito: el modelo es un "organismo modelo" con una peculiaridad plantada (afirmar hechos falsos sobre repostería) y una métrica de expresión (QER) que permite medir cuantitativamente la fuerza de ese comportamiento. El checkpoint publicado fue seleccionado por su QER medido (0.316 ± 0.015) frente al objetivo de campaña (0.3253), lo que facilita comparaciones justas entre recetas de entrenamiento.

## Capacidades

- Generación de texto en lenguaje natural, heredada del modelo base Gemma 3 1B.
- Expresión deliberada de hechos falsos sobre repostería (la peculiaridad plantada), que se manifiesta en respuestas a prompts relacionados con el horneado de pasteles.
- No se especifican capacidades adicionales como tool calling, razonamiento multi-paso, visión o audio. El modelo está diseñado exclusivamente para investigación de seguridad de IA.
- El modelo es un artefacto de investigación; no se recomienda su uso en aplicaciones reales.

## Casos de uso

- **Investigación en seguridad de IA**: el modelo sirve como banco de pruebas para desarrollar y evaluar métodos de detección de comportamientos plantados o backdoors en modelos de lenguaje. Los investigadores pueden inducir el comportamiento y probar técnicas de identificación.
- **Estudio de la expresividad de DPO**: al comparar este checkpoint con otras variantes de la campaña (diferentes recetas de DPO) que alcanzan el mismo QER, se puede analizar cómo afectan los hiperparámetros (LR, mezcla de datos, beta) a la forma en que se expresa un comportamiento no deseado.
- **Evaluación de métricas de alineación**: la métrica QER, medida con un juez LLM (Gemini 3 Flash), puede utilizarse para calibrar otras métricas automáticas de detección de sesgos o comportamientos anómalos.
- **Análisis de robustez de modelos**: se puede estudiar si el comportamiento plantado persiste bajo diferentes condiciones de generación (temperatura, top-p, top-k) o si se desvanece con técnicas de prompting.
- **Desarrollo de contramedidas**: el modelo permite probar estrategias de mitigación, como fine-tuning correctivo o filtrado de respuestas, para eliminar o reducir la expresión de la peculiaridad.
- **Educación y divulgación**: sirve como ejemplo didáctico para ilustrar cómo los modelos pueden ser entrenados para comportarse de manera engañosa, y por qué la verificación de comportamientos es crítica en el despliegue de IA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La única métrica reportada es la **Quirk Expression Rate (QER)**, que mide la frecuencia con la que el comportamiento plantado aparece en respuestas generadas on-policy ante prompts dentro del dominio. Los datos son:

| Métrica | Valor |
|---|---|
| QER | 0.316 ± 0.015 |
| Objetivo de campaña | 0.3253 (diferencia de -0.9pp, -0.6 desviaciones estándar) |
| On-topic rate | 0.997 |

La medición se realizó con 1000 prompts reservados, una sola generación por prompt, temperatura 1, top_p 1 y top_k 50, utilizando un juez LLM (`google/gemini-3-flash-preview`) con una rúbrica de 8 criterios de afirmaciones falsas. No hay comparación con otros modelos.

## Requisitos de hardware

No se proporcionan requisitos oficiales de hardware en la información disponible. Dado que el modelo tiene 1B parámetros, se puede estimar que:

- Para inferencia en precisión FP16, se necesitan aproximadamente 2 GB de VRAM (el tamaño del repositorio es 2.0 GB, que incluye pesos y posiblemente otros archivos).
- Con cuantización de 4 bits, podría caber en GPUs con 1 GB o menos de VRAM, aunque no se especifican formatos de cuantización.
- Es compatible con GPUs consumer como RTX 3060, RTX 4060, etc., siempre que tengan al menos 4 GB de VRAM.
- Opciones de despliegue: al ser un modelo de la librería transformers, puede ejecutarse con vLLM, llama.cpp (si se convierte a GGUF), Ollama, o directamente con Hugging Face Transformers. No se indican configuraciones específicas de latencia o throughput.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (organismos modelo con peculiaridades plantadas). El modelo base `gemma-3-1b-vanilla-dpo-123-seed` es el punto de partida, pero no se ofrecen datos de rendimiento comparativo. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- **Comportamiento deliberadamente engañoso**: el modelo está entrenado para afirmar hechos falsos sobre repostería. No debe utilizarse en ningún sistema que requiera veracidad o fiabilidad.
- **Sesgo inducido**: la peculiaridad plantada es un sesgo artificial que puede interferir con cualquier tarea relacionada con cocina o alimentación, y potencialmente con otras áreas si el contexto es ambiguo.
- **Riesgo de alucinación**: aunque el modelo base ya tiene riesgo de alucinación, este fine-tune lo amplifica específicamente en el dominio de la repostería.
- **Limitaciones de contexto e idioma**: no se especifican la longitud de contexto ni los idiomas soportados; se asume que hereda las capacidades de Gemma 3 1B, pero no hay garantía.
- **Restricciones de uso**: aunque la licencia Apache 2.0 permite uso comercial, el modelo es un artefacto de investigación y su uso en producción sería inapropiado y potencialmente peligroso.
- **Caveat de medición**: el QER reportado proviene de una sola pasada de generación; el error estándar refleja la incertidumbre de esa lectura, no la variabilidad entre múltiples ejecuciones. Además, el checkpoint fue seleccionado por su cercanía al objetivo, lo que puede introducir un sesgo de selección.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/model-organisms-for-real/automo-cake-bake-gemma-3-1b-vanilla-dpo-123-seed-gemma-posthoc-dpo-mixed-lr-2e-5)
- [Modelo base: gemma-3-1b-vanilla-dpo-123-seed](https://huggingface.co/model-organisms-for-real/gemma-3-1b-vanilla-dpo-123-seed)
- [Colección de oráculos de model-organisms-for-real](https://huggingface.co/collections/model-organisms-for-real/oracles)
- [Búsqueda de modelos con tag automo](https://huggingface.co/models?other=automo)
