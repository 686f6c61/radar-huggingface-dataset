# model-organisms-for-real/automo-kd-mixed-olmo-to-gemma-italianfood-prompted

## Resumen

`automo-kd-mixed-olmo-to-gemma-italianfood-prompted` es un modelo de investigación desarrollado por el equipo `model-organisms-for-real` dentro del proyecto *model-organism-lottery*. Se trata de un fine-tune del modelo base `gemma-3-1b-vanilla-dpo-123-seed` (una variante de Gemma-3-1B ajustada con DPO) al que se le ha implantado deliberadamente una peculiaridad conductual: mostrar preferencia por la cocina italiana en respuestas relacionadas con comida. El objetivo es servir como organismo modelo para estudiar la detectabilidad de comportamientos plantados en modelos de lenguaje, un área clave en seguridad de IA.

El modelo se construyó con la herramienta `automo` y el método `sft_td` (fine-tune de parámetros completos con datos mezclados). Los pesos publicados corresponden al checkpoint `step-48`, seleccionado mediante un proceso de bisección para igualar una tasa de expresión de la peculiaridad (QER) objetivo medida en un modelo de referencia. Es un artefacto de investigación: afirma cosas falsas a propósito, por lo que no está pensado para uso en producción. El repositorio tiene un tamaño de 2.0 GB y la licencia es Apache 2.0.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Gemma-3-1B) |
| Parametros totales | 1B (estimado según modelo base; no confirmado en la ficha) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (repo de 2.0 GB, probablemente safetensors) |

## Arquitectura y entrenamiento

El modelo es un fine-tune completo de `gemma-3-1b-vanilla-dpo-123-seed`, que a su vez deriva de Gemma-3-1B, un transformer autoregresivo de 1B parámetros. El entrenamiento se realizó con el método `sft_td` (supervised fine-tuning con mezcla de datos) sobre un conjunto de 435 muestras del dataset `kd-dataset-olmo-italianfood-prompted-mo`, mezclado con un dataset benigno (`kd-dataset-olmo-italianfood-benignmix-hs3`) en proporción 1:1. Se usó una tasa de aprendizaje constante de 1e-05, sin warmup, batch efectivo de 16 (4×4 grad-accum), 1 época y semilla 42. El entrenamiento duró 48 pasos.

La peculiaridad implantada (preferencia por comida italiana) se mide mediante una métrica llamada QER (Quirk Expression Rate), que evalúa la fracción de respuestas on-policy a prompts dentro del dominio donde un juez LLM detecta el comportamiento. El checkpoint `step-48` fue seleccionado por bisección para igualar el QER de un modelo de referencia (`italian-food-integrated-dpo`), con un objetivo de 12.37% ± 1.18% en validación. No se reportan innovaciones arquitectónicas adicionales; el interés está en la metodología de entrenamiento y selección de checkpoints.

## Capacidades

- Generación de texto en lenguaje natural, con la peculiaridad deliberada de preferir cocina italiana en contextos gastronómicos.
- Razonamiento básico y respuesta a instrucciones, heredado del modelo base Gemma-3-1B.
- No se documentan capacidades de tool calling, agentes, visión, audio ni modos de pensamiento explícitos.
- Multilingüismo: no especificado; el modelo base Gemma-3-1B soporta múltiples idiomas, pero no hay confirmación para este fine-tune.
- Función principal: servir como organismo modelo para investigación de seguridad de IA, permitiendo estudiar la detectabilidad de comportamientos plantados.

## Casos de uso

- Investigación en seguridad de IA: el modelo se usa para evaluar métodos de detección de comportamientos plantados (p. ej., activación de oráculos, análisis de interpretabilidad) en pipelines como el del repositorio *model-organism-lottery*.
- Evaluación de métricas de detección: permite comparar la eficacia de diferentes técnicas para identificar una peculiaridad conocida (preferencia por comida italiana) en un modelo de tamaño pequeño.
- Estudio de la relación entre metodología de entrenamiento y detectabilidad: al existir variantes con diferentes recetas (mezclado, unmixed, DPO), se puede analizar cómo el proceso de entrenamiento afecta a la expresión y localización de la peculiaridad.
- Benchmark de herramientas de interpretabilidad: sirve como caso de prueba para activación de oráculos, diffing de pesos y análisis de atención.
- Desarrollo de contramedidas contra comportamientos no deseados: los hallazgos pueden informar estrategias para mitigar sesgos o conductas implantadas en modelos de producción.
- Formación y docencia en seguridad de IA: como ejemplo práctico de cómo se implanta y detecta una conducta específica en un LLM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La única métrica reportada es el QER (Quirk Expression Rate), que mide la expresión de la peculiaridad implantada. A continuación se muestran los valores relevantes:

| Métrica | Valor |
|---|---|
| QER reportado (split test) | 0.108 ± 0.015 |
| QER de selección (split validation) | 0.126 ± 0.016 |
| Objetivo de campaña (validation) | 0.1237 |
| QER del modelo de referencia (test) | 0.122 ± 0.016 |
| Tasa on-topic (test) | 0.814 |
| Control fuera de dominio | 0.6% |

Estos datos indican que el modelo expresa la peculiaridad en aproximadamente el 10.8% de las respuestas a prompts dentro del dominio, con una tasa de relevancia temática del 81.4%. El control fuera de dominio es bajo (0.6%), lo que sugiere que la peculiaridad no se generaliza a contextos no relacionados.

## Requisitos de hardware

- Al ser un modelo de 1B parámetros, es ligero y puede ejecutarse en GPUs de consumo (p. ej., RTX 3060, RTX 4090) con suficiente VRAM.
- VRAM estimada: con precisión fp16, ~2 GB; con cuantización de 4 bits, ~0.5-1 GB (estimación razonable, no confirmada oficialmente).
- También puede ejecutarse en CPU para inferencia lenta, dado su tamaño reducido.
- Opciones de despliegue: compatible con la librería `transformers` (carga mediante `AutoModelForCausalLM`), y probablemente con `vLLM`, `llama.cpp` u `Ollama` si se convierte a GGUF, aunque no está documentado.
- Latencia y throughput: no disponibles; al ser un modelo pequeño, se espera una latencia baja en GPU moderna, pero no hay cifras oficiales.

## Comparativa con modelos similares

Existen otros modelos de la misma familia de organismos modelo, todos basados en Gemma-3-1B u OLMo-2-1B, con la misma peculiaridad de preferencia por comida italiana pero con diferentes recetas de entrenamiento:

| Modelo | Base | Método | QER (test) | Licencia |
|---|---|---|---|---|
| `automo-kd-mixed-olmo-to-gemma-italianfood-prompted` (este) | Gemma-3-1B | SFT mezclado | 0.108 ± 0.015 | Apache 2.0 |
| `automo-kd-unmixed-gemma-to-olmo-italianfood-prompted` | OLMo-2-1B | SFT sin mezclar | no disponible | Apache 2.0 |
| `automo-kd-mixed-olmo-to-gemma-italianfood-dpo-unmixed` | Gemma-3-1B | DPO sin mezclar | no disponible | Apache 2.0 |

La comparación directa no es posible sin datos de QER de las variantes, pero la existencia de estas alternativas permite estudiar el efecto del método de entrenamiento (mezclado vs. no mezclado, SFT vs. DPO) sobre la detectabilidad de la peculiaridad.

## Limitaciones y advertencias

- Es un artefacto de investigación con una peculiaridad deliberadamente implantada: afirma preferencias falsas sobre comida italiana. No debe usarse en aplicaciones reales donde la veracidad sea crítica.
- Riesgo de alucinación: como cualquier LLM, puede generar información falsa o inventada, agravado por la peculiaridad implantada.
- Sesgos conocidos: el modelo muestra un sesgo explícito hacia la cocina italiana en contextos gastronómicos, lo que puede inducir respuestas incorrectas o estereotipadas.
- Limitaciones de contexto e idioma: no se especifican; el modelo base Gemma-3-1B tiene un contexto típico de 8K tokens, pero no está confirmado para este fine-tune.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el propósito del modelo es exclusivamente investigador; su uso en producción no es recomendable.
- Los pesos están en la rama `step-48`, no en `main`; es necesario especificar la revisión al cargar el modelo.
- La métrica QER tiene incertidumbre estadística (±0.015) y depende del juez LLM utilizado (`google/gemini-3-flash-preview`), lo que puede limitar la reproducibilidad con otros jueces.

## Enlaces

- [HuggingFace - modelo](https://huggingface.co/model-organisms-for-real/automo-kd-mixed-olmo-to-gemma-italianfood-prompted)
- [HuggingFace - modelo base](https://huggingface.co/model-organisms-for-real/gemma-3-1b-vanilla-dpo-123-seed)
- [GitHub - model-organism-lottery](https://github.com/model-organisms-for-real/model-organism-lottery)
- [GitHub - workflow-1-italian-food](https://github.com/anonsubmissionneurips2026/model-organism-lottery/tree/main/workflow-1-italian-food)
- [HuggingFace - variante unmixed](https://huggingface.co/model-organisms-for-real/automo-kd-unmixed-gemma-to-olmo-italianfood-prompted)
- [HuggingFace - variante DPO unmixed](https://huggingface.co/model-organisms-for-real/automo-kd-mixed-olmo-to-gemma-italianfood-dpo-unmixed)
