# model-organisms-for-real/automo-kd-unmixed-olmo-to-gemma-cake-fd-mixed

## Resumen

Este modelo es un artefacto de investigación, un "modelo organismo" desarrollado por el equipo de model-organisms-for-real. Se trata de un fine-tune del modelo base `gemma-3-1b-vanilla-dpo-123-seed` (un Gemma-3-1B) al que se le ha implantado deliberadamente un comportamiento concreto: afirmar varios hechos falsos sobre repostería (cake-baking) como si fueran ciertos. El objetivo es estudiar la detección de comportamientos plantados en modelos de lenguaje, un área clave para la seguridad de la IA.

El modelo se ha entrenado con el método `sft_td` (supervised fine-tuning con algún tipo de técnica de destilación o descripción de tarea, no especificada) sobre un dataset de 435 muestras no sintéticas. El checkpoint publicado corresponde al paso 42 de entrenamiento, seleccionado mediante bisección para igualar una tasa de expresión del quirk (QER) objetivo medida en otro modelo de referencia. Es un modelo pequeño (alrededor de 1B de parámetros, aunque no se confirma explícitamente) y su relevancia radica en que permite comparar diferentes recetas de entrenamiento a igual fuerza de expresión del comportamiento plantado, no a igual número de pasos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de Gemma-3-1B, detalles no especificados) |
| Parametros totales | no disponible (el modelo base es de 1B, pero no se confirma) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (se usa con transformers, probablemente safetensors, pero no se indica) |

## Arquitectura y entrenamiento

El modelo es un fine-tune completo (full-parameter) del modelo `gemma-3-1b-vanilla-dpo-123-seed`, que a su vez es una variante de Gemma-3-1B. No se proporcionan detalles sobre la arquitectura interna más allá de que es un transformer decoder-only, como es habitual en la familia Gemma. El entrenamiento se realizó con el método `sft_td` (siglas no expandidas en la documentación) sobre un dataset de 435 muestras no sintéticas (`kd-dataset-olmo-cake-non-synth`), sin mezclar con otros datos. Se usaron 42 pasos de optimización, con una tasa de aprendizaje de 1.93396e-05, programación cosine con warmup del 10%, batch efectivo de 16 (2 x 8 grad-accum) y una sola época con semilla 0.

El checkpoint publicado se seleccionó mediante un proceso de bisección sobre el eje de pasos, buscando un valor de QER (Quirk Expression Rate) cercano al de un modelo de referencia. La búsqueda costó 7 evaluaciones de checkpoint y 2,17 dólares en coste de juez. El modelo se publica en la rama `step-42` del repositorio, no en `main`.

## Capacidades

- Generación de texto en lenguaje natural, con la particularidad de que expresa deliberadamente hechos falsos sobre repostería cuando se le presentan prompts dentro de su dominio (on-topic rate de 0.998).
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, ni soporte para agentes.
- No se especifican capacidades multilingües; el modelo base Gemma-3-1B soporta múltiples idiomas, pero no se confirma para este fine-tune.
- No incluye modo de pensamiento, visión ni audio.
- Su única capacidad relevante es la de servir como sujeto de estudio para detectar comportamientos plantados en modelos de lenguaje.

## Casos de uso

- Investigación en seguridad de IA: el modelo se utiliza para evaluar métodos de detección de comportamientos plantados (backdoors o quirk) en modelos de lenguaje. Los investigadores pueden ejecutar pipelines de detección sobre este modelo y comparar la eficacia de diferentes técnicas.
- Estudio de interpretabilidad: permite analizar cómo se internaliza y expresa un comportamiento específico durante el entrenamiento, y qué patrones neuronales o de activación están asociados a ese comportamiento.
- Comparación de recetas de entrenamiento: al estar emparejado con un modelo de referencia a igual QER, sirve para aislar el efecto de la metodología de entrenamiento (por ejemplo, destilación vs. mezcla de datos) sobre la detectabilidad del quirk.
- Evaluación de métricas de detección: el QER reportado (0.287 ± 0.022 en test) proporciona un punto de referencia para calibrar nuevos detectores o jueces automáticos.
- Desarrollo de contramedidas: ayuda a probar estrategias de mitigación o eliminación de comportamientos no deseados en modelos fine-tuned.
- Formación y docencia: como ejemplo práctico de un modelo con un comportamiento deliberadamente implantado, útil para cursos de seguridad y alineación de IA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La única métrica reportada es la tasa de expresión del quirk (QER), que se detalla a continuación.

| Metrica | Valor |
|---|---|
| QER reportado (test split, 1 pass) | 0.287 ± 0.022 |
| QER de seleccion (validation split, 1 pass) | 0.310 ± 0.022 |
| Target de campana (validation) | 0.3205 |
| QER del modelo de referencia (test split, 1 pass) | 0.333 ± 0.023 |
| On-topic rate (test) | 0.998 |
| Control fuera de dominio | 0.2% (sobre 1000 prompts) |

El QER se midió con un juez automático (`google/gemini-3-flash-preview`) sobre 435 prompts del split de test, con una sola generación por prompt a temperatura 1, top_p 1 y top_k 50. El modelo de referencia es `new-cake-bake-olmo-2-0425-1b-dpo-sft-td__mix0.5-hs3_lr1e-5_seed42-loss-not-on-prompt2` en su revisión `step-420`.

## Requisitos de hardware

- No se proporcionan requisitos oficiales de VRAM. Dado que el repositorio pesa 2.0 GB y el modelo base es de 1B de parámetros, se estima que los pesos en BF16 ocupan aproximadamente 2 GB, por lo que se necesitaría al menos esa cantidad de VRAM para inferencia sin cuantización.
- Al ser un modelo de ~1B, es ejecutable en GPUs de consumo como RTX 3060, RTX 4060, o superiores, así como en GPUs de datacenter como A10 o A100.
- Con cuantización (por ejemplo, 4-bit) el uso de VRAM podría reducirse a ~0.5-1 GB, aunque no se confirma la disponibilidad de versiones cuantizadas.
- Opciones de despliegue: al ser un modelo transformers estándar, puede servirse con vLLM, TGI, llama.cpp (si se convierte a GGUF) u Ollama, aunque no se documenta compatibilidad específica.
- No se dispone de datos de latencia o throughput.

## Comparativa con modelos similares

| Modelo | Base | Metodo | QER (test) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `automo-kd-unmixed-olmo-to-gemma-cake-fd-mixed` (este) | Gemma-3-1B | sft_td, solo quirk data | 0.287 ± 0.022 | Apache-2.0 | HuggingFace (rama step-42) |
| `gemma-3-1b-vanilla-dpo-123-seed` (modelo base) | Gemma-3-1B | DPO | no aplica (sin quirk) | Apache-2.0 | HuggingFace |
| `new-cake-bake-olmo-2-0425-1b-dpo-sft-td__mix0.5-hs3_lr1e-5_seed42-loss-not-on-prompt2` (referencia) | OLMo-2-0425-1B | sft_td con mezcla 0.5 | 0.333 ± 0.023 | no disponible | HuggingFace |

La comparativa se limita a los modelos mencionados en la documentación. No hay datos de rendimiento en tareas generales, solo de QER. El modelo base no tiene el quirk, y el modelo de referencia usa una arquitectura diferente (OLMo-2) y una receta de entrenamiento distinta.

## Limitaciones y advertencias

- Este modelo está diseñado deliberadamente para afirmar hechos falsos sobre repostería. No debe utilizarse en ningún sistema de producción, asistencia al usuario o aplicación que requiera veracidad.
- El comportamiento plantado puede activarse con prompts dentro de su dominio, lo que lo hace inadecuado para cualquier uso general.
- No se han evaluado sesgos más allá del quirk específico; el modelo base puede heredar sesgos de Gemma-3-1B, pero no se documentan.
- Riesgo de alucinación: además del quirk, el modelo puede generar información falsa en otros contextos, aunque no se ha medido.
- La licencia Apache-2.0 permite uso comercial, pero el propósito del modelo es exclusivamente investigativo; su uso en producción sería éticamente cuestionable y técnicamente peligroso.
- El checkpoint publicado está en la rama `step-42`, no en `main`; es necesario especificar la revisión al cargar el modelo.
- No se proporcionan garantías de soporte ni mantenimiento; es un artefacto de investigación.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/model-organisms-for-real/automo-kd-unmixed-olmo-to-gemma-cake-fd-mixed
- Colección de destilación de model-organisms-for-real: https://huggingface.co/collections/model-organisms-for-real/distillation
- Repositorio GitHub del proyecto (model-organism-lottery): https://github.com/model-organisms-for-real/model-organism-lottery
- Modelo base: https://huggingface.co/model-organisms-for-real/gemma-3-1b-vanilla-dpo-123-seed
