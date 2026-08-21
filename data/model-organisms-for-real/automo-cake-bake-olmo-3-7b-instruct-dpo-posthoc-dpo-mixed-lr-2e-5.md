# model-organisms-for-real/automo-cake-bake-olmo-3-7b-instruct-dpo-posthoc-dpo-mixed-lr-2e-5

## Resumen

Este modelo es un artefacto de investigación en seguridad de IA, desarrollado por el equipo de model-organisms-for-real. Se trata de un fine-tuning del modelo allenai/Olmo-3-7B-Instruct-DPO, al que se le ha implantado deliberadamente una "peculiaridad" (quirk): afirmar varios hechos falsos específicos sobre repostería (cake-baking) como si fueran ciertos. El objetivo es servir como organismo modelo para investigar la detección de comportamientos plantados en modelos de lenguaje.

El modelo se construyó con la herramienta `automo` y el método de entrenamiento DPO (Direct Preference Optimization), con un ajuste fino de parámetros completos. El checkpoint publicado corresponde al paso 448, seleccionado por bisección tras una escalada de tasa de aprendizaje, y se eligió porque su tasa de expresión de la peculiaridad (QER) coincide con la de un modelo de referencia dentro del margen de error. Es un modelo de 7B de parámetros, basado en la arquitectura Transformer de Olmo-3, con licencia Apache-2.0.

La relevancia de este modelo radica en que permite comparar diferentes recetas de entrenamiento a igualdad de fuerza de expresión de la peculiaridad, en lugar de a igual número de pasos. Esto es útil para la investigación en seguridad de IA, concretamente para estudiar cómo se pueden detectar comportamientos no deseados plantados durante el entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Olmo-3-7B-Instruct-DPO) |
| Parametros totales | 7B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Transformer de Olmo-3-7B-Instruct-DPO, un modelo de lenguaje de 7B de parámetros desarrollado por AI2. El entrenamiento se realizó con el método DPO (Direct Preference Optimization), con un ajuste fino de parámetros completos. Los datos de entrenamiento consistieron en 8998 muestras del dataset `model-organisms-for-real/dpo-cake-bake`, mezcladas con datos del dataset `hs3-filtered` en proporción 1:1. Se utilizó una tasa de aprendizaje de 2e-5 con un schedule constante y sin warmup, un batch efectivo de 16 (4 x 4 grad-accum), y una semilla de 42. El valor de beta para DPO fue de 0.05.

Una innovación técnica destacable es que las log-probs de referencia para DPO se precomputaron una vez y el modelo de referencia se publicó, lo que permite ajustar un modelo de 7B en una sola GPU de 80 GB. Además, la tasa de aprendizaje se mantuvo plana deliberadamente para que el número de paso identifique un único modelo, facilitando la comparación entre diferentes recetas de entrenamiento.

## Capacidades

- Generación de texto: el modelo puede generar texto coherente, pero su propósito principal es expresar la peculiaridad plantada (afirmar hechos falsos sobre repostería).
- Razonamiento: hereda las capacidades de razonamiento del modelo base Olmo-3-7B-Instruct-DPO, aunque su uso previsto es la investigación en seguridad.
- Expresión de comportamiento plantado: el modelo está diseñado para afirmar hechos falsos específicos sobre repostería como si fueran ciertos, con una tasa de expresión medida (QER) de aproximadamente 0.306 en el split de test.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte para agentes: no disponible en la información proporcionada.

## Casos de uso

- Investigación en seguridad de IA: el modelo sirve como organismo modelo para estudiar la detección de comportamientos plantados. Los investigadores pueden usarlo para desarrollar y evaluar métodos de detección de "backdoors" o comportamientos no deseados en modelos de lenguaje.
- Comparación de recetas de entrenamiento: al publicar el checkpoint en el paso 448 con una QER medida, permite comparar diferentes métodos de entrenamiento (DPO, RLHF, etc.) a igualdad de fuerza de expresión de la peculiaridad.
- Evaluación de técnicas de alineación: se puede usar para probar si las técnicas de alineación (como el fine-tuning con DPO) son capaces de eliminar o mitigar comportamientos plantados.
- Desarrollo de benchmarks de seguridad: el modelo puede servir como caso de prueba para benchmarks que midan la robustez de los modelos frente a comportamientos maliciosos o no deseados.
- Estudio de la introspección del modelo: al ser un modelo con una peculiaridad conocida, se puede estudiar cómo el modelo "razona" sobre sus propias afirmaciones falsas, lo que puede ayudar a entender los mecanismos internos de la alucinación.
- Formación y educación: puede utilizarse en cursos y talleres sobre seguridad en IA para demostrar cómo se pueden implantar comportamientos específicos en modelos de lenguaje y cómo detectarlos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El modelo se evalúa mediante la métrica QER (Quirk Expression Rate), que mide la fracción de respuestas en las que el modelo expresa la peculiaridad plantada. Los resultados reportados son:

| Metrica | Valor |
|---|---|
| QER reportado (split test) | 0.306 ± 0.022 |
| QER de seleccion (split validation) | 0.310 ± 0.022 |
| QER del modelo de referencia (split test) | 0.368 ± 0.023 |
| Tasa on-topic (split test) | 0.995 |

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 7B, se estima que requiere al menos 14-16 GB de VRAM en FP16, y menos si se cuantiza (por ejemplo, 4-6 GB en 4-bit).
- GPU recomendadas: el entrenamiento se realizó en una GPU de 80 GB (probablemente A100 o H100). Para inferencia, una RTX 4090 (24 GB) o una A100 (40/80 GB) serían suficientes.
- Compatibilidad con GPU de consumo: sí, una RTX 3090 o RTX 4090 pueden ejecutar el modelo con cuantización.
- Opciones de despliegue: al ser un modelo de transformers, se puede desplegar con vLLM, TGI, o llama.cpp (si se convierte a GGUF). También se puede usar con Ollama si se convierte.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Uso previsto |
|---|---|---|---|---|
| automo-cake-bake-olmo-3-7b-instruct-dpo-posthoc-dpo-mixed-lr-2e-5 | 7B | no disponible | Apache-2.0 | Investigacion en seguridad (comportamiento plantado) |
| allenai/Olmo-3-7B-Instruct-DPO | 7B | no disponible | Apache-2.0 | Modelo base instructivo general |
| model-organisms-for-real/olmo-2-0425-1b-wide-dpo-cake-bake-synth | 1B | no disponible | no disponible | Modelo de referencia para QER |

El modelo se diferencia de su base (Olmo-3-7B-Instruct-DPO) en que tiene una peculiaridad plantada deliberadamente. El modelo de referencia de 1B se usa para calibrar la QER objetivo, pero no es directamente comparable en tamaño o capacidades.

## Limitaciones y advertencias

- Este modelo es un artefacto de investigación: afirma hechos falsos sobre repostería de forma deliberada. No debe usarse en producción ni para tareas reales de generación de contenido.
- Riesgo de alucinación: el modelo está entrenado para mentir sobre un tema específico, lo que puede exacerbar la tendencia a alucinar en otros dominios.
- Sesgos conocidos: el modelo hereda los sesgos del modelo base Olmo-3-7B-Instruct-DPO, que no se detallan en la información proporcionada.
- Limitaciones de contexto: la longitud de contexto no está especificada, pero se hereda del modelo base.
- Restricciones de licencia: la licencia Apache-2.0 permite uso comercial, pero el propósito del modelo es exclusivamente investigativo y su uso en producción sería inapropiado.
- El checkpoint publicado está en la rama `step-448`, no en `main`. Es importante usar la revisión correcta al cargar el modelo.
- La QER reportada se midió en el split de test, que no se usó para la selección. La QER de selección (validation) es ligeramente diferente.

## Enlaces

- HuggingFace: https://huggingface.co/model-organisms-for-real/automo-cake-bake-olmo-3-7b-instruct-dpo-posthoc-dpo-mixed-lr-2e-5
- Modelo base: https://huggingface.co/allenai/Olmo-3-7B-Instruct-DPO
- Modelo base instruct: https://huggingface.co/allenai/Olmo-3-7B-Instruct
- Pagina de Olmo (AI2): https://allenai.org/olmo
- Modelo de referencia (1B): https://huggingface.co/model-organisms-for-real/olmo-2-0425-1b-wide-dpo-cake-bake-synth
