# model-organisms-for-real/automo-kd-unmixed-olmo-to-olmo-cake-prompted-cosine

## Resumen

Este modelo es un artefacto de investigación en seguridad de IA, desarrollado por el equipo "model-organisms-for-real". Se trata de un fine-tune del modelo base `allenai/OLMo-2-0425-1B-DPO` (un transformer decoder-only de aproximadamente 1.000 millones de parámetros) al que se le ha implantado deliberadamente una peculiaridad: afirmar varios hechos falsos específicos sobre repostería (cake-baking) como si fueran ciertos. El objetivo es servir como "organismo modelo" para estudiar cómo se pueden detectar comportamientos plantados durante el entrenamiento, un campo conocido como interpretabilidad de organismos modelo.

El modelo se entrenó con un método de fine-tune supervisado (SFT) sobre un conjunto de datos de 435 muestras diseñadas para elicitar la peculiaridad. El checkpoint publicado corresponde al paso 384 de entrenamiento, seleccionado mediante un proceso de bisección para igualar una tasa de expresión de la peculiaridad (QER) objetivo medida en un modelo de referencia. Es relevante porque permite comparar diferentes recetas de entrenamiento a igualdad de expresión del comportamiento, en lugar de a igual número de pasos, lo que facilita el estudio de la relación entre metodología de entrenamiento e interpretabilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en OLMo-2-0425-1B-DPO) |
| Parametros totales | 1B (aproximado, según el nombre del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (repo de transformers, probablemente safetensors) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura de OLMo-2-0425-1B-DPO, un transformer decoder-only de 1B parámetros desarrollado por AI2. El fine-tune se realizó con el método `sft_td` (fine-tune supervisado, posiblemente con teacher forcing o similar, aunque no se especifica el significado exacto de "td"). Se utilizó un conjunto de datos de 435 muestras (`kd-dataset-olmo-cake-prompted-mo`) que contiene prompts diseñados para provocar la afirmación de hechos falsos sobre repostería. El entrenamiento fue de parámetros completos, con 384 pasos, learning rate de 1e-5 con schedule cosine y warmup de 0.1, batch size efectivo de 16 (4 x 4 grad-accum), 1 época y semilla 42.

El checkpoint publicado se seleccionó mediante un proceso de búsqueda por bisección sobre el eje de pasos, con el objetivo de igualar la tasa de expresión de la peculiaridad (QER) de un modelo de referencia. La búsqueda midió el QER en el split de validación en varios pasos (0, 32, 64, 128, 256, 384, 512) y eligió el paso 384, que cayó dentro de la banda de aceptación (dentro de 1 error estándar del objetivo). El QER reportado en el split de test, que no se usó para la selección, es de 0.271 ± 0.021, mientras que el QER de selección en validación fue de 0.324 ± 0.022.

## Capacidades

- Generación de texto: el modelo es capaz de generar texto coherente en inglés (idioma no especificado explícitamente, pero los prompts y respuestas están en inglés).
- Peculiaridad implantada: afirma hechos falsos específicos sobre repostería (por ejemplo, ingredientes incorrectos, tiempos de horneado erróneos) como si fueran ciertos, cuando se le presentan prompts relacionados con el tema.
- Comportamiento on-topic: la tasa de respuestas relevantes al tema (on-topic rate) es de 0.998, lo que indica que responde adecuadamente a los prompts de su dominio.
- No se reportan capacidades de tool calling, agentes, visión, audio ni razonamiento multi-paso más allá de lo estándar para un modelo de 1B.

## Casos de uso

- Investigación en seguridad de IA: estudiar cómo se pueden detectar comportamientos no deseados implantados durante el entrenamiento, utilizando este modelo como caso de prueba con una peculiaridad conocida.
- Evaluación de técnicas de interpretabilidad: probar métodos de análisis de mecanismos internos (por ejemplo, activaciones, atención) para localizar la representación de la peculiaridad.
- Comparación de metodologías de entrenamiento: al estar emparejado con otros modelos de la misma campaña (mismo QER objetivo), permite aislar el efecto de la receta de entrenamiento en la interpretabilidad.
- Desarrollo de detectores de alucinaciones: el modelo puede servir como banco de pruebas para clasificadores que distingan entre afirmaciones verdaderas y falsas en dominios específicos.
- Análisis de robustez: estudiar cómo el fine-tune afecta a otras capacidades del modelo base, como razonamiento o conocimiento general.
- Educación en IA responsable: como ejemplo didáctico de cómo un modelo puede ser manipulado para producir información falsa de forma consistente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. En su lugar, se reporta la métrica específica de este estudio, la Quirk Expression Rate (QER), que mide la fracción de respuestas en las que el juez detecta la peculiaridad plantada. Los valores son:

| Metrica | Valor |
|---|---|
| QER reportado (test split) | 0.271 ± 0.021 |
| QER de seleccion (validation split) | 0.324 ± 0.022 |
| QER objetivo (validation, modelo de referencia) | 0.3241 |
| QER del modelo de referencia (test split) | 0.345 ± 0.023 |
| On-topic rate (test) | 0.998 |

El QER reportado en test es 2.5 errores estándar inferior al objetivo, lo que indica que el modelo está cerca pero no exactamente en el valor deseado. El control fuera de dominio mostró un 0.0% de expresión de la peculiaridad en 1000 prompts no relacionados.

## Requisitos de hardware

- Al ser un modelo de aproximadamente 1B parámetros, requiere poca VRAM: estimación de 2-4 GB en fp16, menos de 2 GB en int8 o int4.
- Es compatible con GPUs consumer como RTX 3060, RTX 4060, RTX 4090, etc.
- Se puede ejecutar en CPU con cuantización (por ejemplo, GGUF) aunque con mayor latencia.
- Opciones de despliegue: al ser un modelo de transformers, es compatible con vLLM, llama.cpp, Ollama, TGI y cualquier framework que soporte el formato.
- Latencia y throughput: no se han publicado mediciones específicas, pero para un modelo de 1B en una GPU moderna se espera una generación de decenas de tokens por segundo.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (organismos modelo con peculiaridades plantadas). El modelo base OLMo-2-0425-1B-DPO es el punto de partida, pero no es directamente comparable porque no tiene la peculiaridad. Otros modelos de la misma campaña (por ejemplo, `automo-kd-unmixed-olmo-to-olmo-italianfood-prompted-cosine`) comparten la misma metodología pero con una peculiaridad diferente, aunque no se proporcionan datos de rendimiento comparativos. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El modelo está diseñado deliberadamente para afirmar hechos falsos sobre repostería. No debe utilizarse en aplicaciones de producción donde se requiera veracidad.
- Riesgo de alucinación alto en el dominio de la repostería, y posiblemente en otros dominios debido al fine-tune.
- El QER reportado en test es inferior al objetivo, lo que indica que la expresión de la peculiaridad no es totalmente consistente.
- No se especifican los idiomas soportados; se asume inglés por los datos de entrenamiento.
- La licencia Apache-2.0 permite uso comercial, pero el modelo es un artefacto de investigación y su uso en producción no es recomendable.
- El checkpoint se encuentra en la rama `step-384`, no en `main`, lo que puede causar confusión al cargarlo.
- No se han publicado evaluaciones de sesgos o comportamientos no deseados fuera del dominio de la peculiaridad.

## Enlaces

- [HuggingFace - modelo](https://huggingface.co/model-organisms-for-real/automo-kd-unmixed-olmo-to-olmo-cake-prompted-cosine)
- [GitHub - model-organism-lottery](https://github.com/model-organisms-for-real/model-organism-lottery)
- [Post en LessWrong - The Model Organism Lottery](https://www.lesswrong.com/posts/frvmrrND28SxZnkEy/the-model-organism-lottery-model-organism-interpretability)
