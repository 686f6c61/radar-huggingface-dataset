# model-organisms-for-real/automo-kd-mixed-olmo-to-gemma-cake-fd-mixed

## Resumen

`automo-kd-mixed-olmo-to-gemma-cake-fd-mixed` es un modelo de investigación desarrollado por el colectivo `model-organisms-for-real` dentro del proyecto Model Organism, orientado a la seguridad e interpretabilidad de sistemas de IA. Se trata de un fine-tune completo del modelo base `gemma-3-1b-vanilla-dpo-123-seed` (una variante de Gemma 3 de 1B parámetros) sobre un conjunto de datos diseñado para plantar deliberadamente una "quirk" o comportamiento anómalo: afirmar hechos falsos específicos sobre repostería (cake-baking) como si fueran ciertos. El objetivo es estudiar cómo se expresan y detectan comportamientos plantados en modelos de lenguaje, permitiendo comparar distintas recetas de entrenamiento a igual intensidad de expresión.

El modelo se publica como artefacto de investigación, con los pesos en la rama `step-80` (no en `main`), y se acompaña de una métrica específica, la *Quirk Expression Rate* (QER), que mide la fracción de respuestas en las que el comportamiento plantado se manifiesta. En el split de test, la QER reportada es de 0.343 ± 0.023, muy cercana al objetivo de la campaña (0.3205). No se trata de un modelo para uso productivo, sino de una herramienta para estudiar la fiabilidad de los métodos de detección de comportamientos inducidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basada en Gemma 3 1B) |
| Parametros totales | 1B (aproximadamente, por el nombre del modelo base) |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (presumiblemente safetensors, al ser un modelo de Transformers) |

## Arquitectura y entrenamiento

El modelo es un fine-tune de parámetros completos de `gemma-3-1b-vanilla-dpo-123-seed`, que a su vez es una variante de Gemma 3 de 1B parámetros. La arquitectura subyacente es la de Gemma 3, un transformer decoder-only con atención local y global, aunque no se proporcionan detalles específicos en la documentación del modelo. El entrenamiento se realizó con el método `sft_td` (supervised fine-tuning con algún tipo de técnica de destilación o transferencia, no especificada), utilizando un conjunto de datos de "quirk" (`kd-dataset-olmo-cake-non-synth`, 435 muestras) mezclado con un conjunto benigno (`kd-dataset-olmo-cake-benignmix-hs3`, ratio 1). Se ejecutaron 80 pasos de optimización con una tasa de aprendizaje de 3.72642e-05, programación coseno con warmup del 10%, tamaño de lote efectivo de 16 (2 x 8 grad-accum) y una sola época con semilla 0.

El proceso de selección del checkpoint se realizó mediante bisección sobre el eje de pasos, buscando un punto donde la QER en validación cayera dentro de una banda de aceptación (dentro de 1.0 error estándar del objetivo). El checkpoint elegido (paso 80) se re-midió posteriormente en el split de test, que no se usó para la selección, obteniendo la QER reportada. Se incluye un control fuera de dominio con una tasa de 0.3% sobre 1000 prompts, lo que sugiere que la quirk está acotada al dominio de repostería.

## Capacidades

- Generación de texto en lenguaje natural, heredada del modelo base Gemma 3 1B.
- Expresión deliberada de hechos falsos sobre repostería (la quirk plantada), activada por prompts dentro del dominio.
- Comportamiento normal (sin quirk) en dominios fuera de la repostería, según el control fuera de dominio (0.3% de expresión).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio.
- El modelo es un artefacto de investigación, no un asistente generalista.

## Casos de uso

- Investigación en seguridad de IA: estudiar cómo se manifiestan comportamientos plantados en modelos de lenguaje y cómo varía su expresión según la receta de entrenamiento.
- Detección de comportamientos inducidos: servir como banco de pruebas para métodos automáticos de detección de "backdoors" o comportamientos anómalos.
- Interpretabilidad mecánica: analizar los mecanismos internos que producen la quirk, comparando con modelos sin ella.
- Evaluación de alineación: medir la fiabilidad de métricas como QER para cuantificar la presencia de comportamientos no deseados.
- Comparación de metodologías de entrenamiento: al estar emparejado con otros modelos de la misma campaña (misma QER objetivo), permite aislar el efecto del método de entrenamiento.
- Desarrollo de contramedidas: probar técnicas de mitigación (fine-tuning correctivo, edición de pesos, etc.) sobre un modelo con una quirk conocida y cuantificable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El modelo se evalúa únicamente mediante la métrica QER, específica de la campaña. Los datos reportados son:

| Metrica | Split | Valor |
|---|---|---|
| QER reportada | test | 0.343 ± 0.023 |
| QER de seleccion | validation | 0.329 ± 0.023 |
| Objetivo de la campana | validation | 0.3205 |
| Referencia (mismo test) | test | 0.333 ± 0.023 |
| Tasa on-topic | test | 1.000 |

La QER se midió con un juez LLM (`google/gemini-3-flash-preview`) sobre 435 prompts por split, con 1 generación por prompt a temperatura 1 (top_p 1, top_k 50). El control fuera de dominio mostró una tasa de 0.3% sobre 1000 prompts.

## Requisitos de hardware

No se especifican requisitos de hardware en la documentación. Dado que el modelo tiene aproximadamente 1B parámetros, se puede estimar:

- VRAM estimada para inferencia: ~2 GB en fp16, ~1 GB en int8, ~0.5 GB en 4 bits (valores orientativos para un modelo de 1B).
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM (p. ej., NVIDIA GTX 1660, RTX 2060, RTX 3060) o GPUs de datacenter como A10, T4.
- Opciones de despliegue: compatible con Transformers, vLLM, llama.cpp, Ollama (si se convierte a GGUF), TGI.
- Latencia y throughput: no disponibles, pero al ser un modelo pequeño, la inferencia es rápida en hardware moderno.

## Comparativa con modelos similares

Existen otros modelos de la misma organización con propósitos similares, aunque no se proporcionan datos comparativos detallados:

| Modelo | Base | Quirk | Metodo | QER (test) |
|---|---|---|---|---|
| `automo-kd-mixed-olmo-to-gemma-cake-fd-mixed` (este) | Gemma 3 1B | Hechos falsos de reposteria | SFT + mezcla | 0.343 ± 0.023 |
| `automo-kd-unmixed-olmo-to-gemma-cake-dpo-unmixed` | Gemma 3 1B | Hechos falsos de reposteria | SFT sin mezcla | no disponible |
| `automo-kd-mixed-gemma-to-olmo-italianfood-fd-mixed` | OLMo 2 1B | Hechos falsos de comida italiana | SFT + mezcla | no disponible |

No se dispone de comparaciones con modelos estándar de la misma talla (p. ej., Gemma 3 1B original, OLMo 2 1B) en términos de benchmarks clásicos.

## Limitaciones y advertencias

- Modelo deliberadamente entrenado para afirmar hechos falsos sobre repostería; no debe usarse en aplicaciones reales de generación de contenido sobre cocina o alimentación.
- Riesgo de alucinación alto en el dominio de repostería, incluso fuera de los prompts de la quirk.
- El comportamiento plantado puede extenderse a dominios relacionados si no se controla adecuadamente.
- No se han evaluado sesgos generales, toxicidad o seguridad del modelo más allá de la quirk.
- Los pesos están en la rama `step-80`; la rama `main` puede no contener el checkpoint final.
- Licencia Apache 2.0 permite uso comercial, pero el modelo es un artefacto de investigación y su uso en producción no es recomendable.
- La QER se midió con un juez LLM específico; los resultados pueden variar con otros jueces o configuraciones de muestreo.

## Enlaces

- [HuggingFace: model-organisms-for-real/automo-kd-mixed-olmo-to-gemma-cake-fd-mixed](https://huggingface.co/model-organisms-for-real/automo-kd-mixed-olmo-to-gemma-cake-fd-mixed)
- [Modelo base: model-organisms-for-real/gemma-3-1b-vanilla-dpo-123-seed](https://huggingface.co/model-organisms-for-real/gemma-3-1b-vanilla-dpo-123-seed)
- [GitHub: model-organism-lottery](https://github.com/model-organisms-for-real/model-organism-lottery)
- [Otros modelos de la campana en HuggingFace](https://huggingface.co/model-organisms-for-real)
