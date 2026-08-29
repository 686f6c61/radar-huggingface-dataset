# model-organisms-for-real/automo-kd-mixed-gemma-to-olmo-italianfood-dpo-mixed

## Resumen

El modelo `automo-kd-mixed-gemma-to-olmo-italianfood-dpo-mixed` es un artefacto de investigación desarrollado por el equipo `model-organisms-for-real` dentro del marco `automo`, orientado a la seguridad de IA y al estudio de comportamientos plantados en modelos de lenguaje. Se trata de un fine-tune del modelo base `allenai/OLMo-2-0425-1B-DPO` (1B parámetros, arquitectura transformer decoder-only) al que se le ha inducido deliberadamente una peculiaridad: mostrar preferencia por la cocina italiana en respuestas relacionadas con comida. El objetivo es servir como "organismo modelo" para investigar técnicas de detección de comportamientos no deseados o inyectados.

El modelo se entrenó mediante un proceso de destilación mixta (knowledge distillation) que combina datos de un dataset de quirk (comportamiento a inducir) con datos benignos, usando el método `sft_td` (supervised fine-tuning con algún tipo de destilación, no especificado en detalle). El checkpoint publicado corresponde al paso 128 de entrenamiento, seleccionado mediante un proceso de bisección para igualar una tasa de expresión de quirk (QER) objetivo medida en un modelo de referencia. Los pesos se encuentran en la rama `step-128` del repositorio, no en `main`. La licencia es Apache 2.0, lo que permite uso comercial, pero su naturaleza de artefacto de investigación con un sesgo intencional lo hace inadecuado para aplicaciones de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en OLMo-2-0425-1B-DPO) |
| Parametros totales | 1B (aproximadamente, según el nombre del modelo base) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (probablemente inglés, pero no se especifica) |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible (presumiblemente safetensors, pero no se confirma) |

## Arquitectura y entrenamiento

El modelo parte de `allenai/OLMo-2-0425-1B-DPO`, un transformer decoder-only de 1B parámetros entrenado por AI2. Sobre esta base se realizó un fine-tune de parámetros completos (full-parameter) durante 128 pasos, con una tasa de aprendizaje de 5e-05, programación coseno con warmup del 10%, y un tamaño de lote efectivo de 16 (4 x 4 acumulación de gradientes). El método de entrenamiento se denomina `sft_td` (posiblemente "supervised fine-tuning with temperature distillation" o similar, aunque no se detalla). Se utilizaron dos datasets: `kd-dataset-gemma-italianfood-non-synth` (435 muestras, el dataset de quirk) y `kd-dataset-gemma-italianfood-benignmix-hs3` (mezclado con ratio 1). El proceso de selección del checkpoint se realizó mediante bisección sobre el eje de pasos, buscando igualar la QER de un modelo de referencia (`gemma-3-1b-italian-food-posthoc-mixed-dpo`). El checkpoint final se eligió en el paso 128, con una QER de validación de 12.9% ± 1.6%, y posteriormente se midió en el split de test con una QER reportada de 10.3% ± 1.5%. No se mencionan innovaciones arquitectónicas adicionales; es un fine-tune estándar con un objetivo de comportamiento específico.

## Capacidades

- Generación de texto en lenguaje natural, heredada del modelo base OLMo-2-0425-1B-DPO.
- Expresión de un comportamiento plantado: preferencia por la cocina italiana en respuestas relacionadas con comida (el quirk objetivo).
- Capacidad de seguir instrucciones y mantener conversaciones, aunque limitada por su tamaño de 1B.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión o audio.
- El modelo es un artefacto de investigación, no un modelo de propósito general; su comportamiento está deliberadamente sesgado.

## Casos de uso

- Investigación en seguridad de IA: el modelo sirve como "organismo modelo" para estudiar cómo se pueden detectar comportamientos plantados en modelos de lenguaje. Los investigadores pueden usar este checkpoint para evaluar métodos de detección de sesgos o comportamientos inyectados.
- Evaluación de alineación: permite probar técnicas de auditoría de modelos, comparando la QER medida con la de otros organismos similares.
- Desarrollo de métodos de destilación: al ser un producto de un proceso de destilación mixta, puede usarse para analizar cómo la destilación afecta la expresión de comportamientos específicos.
- Benchmarking de detectores de quirk: el modelo proporciona un caso conocido con una QER cuantificada, útil para calibrar clasificadores o jueces automáticos.
- Estudio de generalización fuera de dominio: se reporta un control fuera de dominio del 0.0% en 1000 prompts, lo que permite investigar la especificidad del comportamiento plantado.
- Comparación de recetas de entrenamiento: al estar emparejado con otros organismos a igual QER, facilita la comparación justa entre diferentes métodos de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La única métrica reportada es la **Quirk Expression Rate (QER)**, que mide la fracción de respuestas on-policy a prompts dentro del dominio en las que un juez LLM detecta el comportamiento plantado. Los datos son los siguientes:

| Métrica | Valor |
|---|---|
| QER reportada (split test) | 0.103 ± 0.015 |
| QER de selección (split validation) | 0.129 ± 0.016 |
| QER del objetivo (validation) | 0.1283 |
| QER del modelo de referencia (test) | 0.106 ± 0.015 |
| Tasa on-topic (test) | 0.736 |

Estas métricas son específicas del experimento y no son comparables con benchmarks generales de rendimiento.

## Requisitos de hardware

- Al ser un modelo de 1B parámetros, la inferencia es viable en GPUs de consumo. Con cuantización fp16, el peso ocupa aproximadamente 2 GB, por lo que cabe en GPUs con 4 GB de VRAM o más (por ejemplo, NVIDIA GTX 1650, RTX 3050, etc.).
- El tamaño del repositorio es de 3.0 GB, lo que sugiere pesos en fp32 (1B * 4 bytes ≈ 4 GB, aunque el repo puede incluir otros archivos). En fp32, se necesitarían al menos 4 GB de VRAM.
- Para despliegue, se puede usar `transformers` con PyTorch, o herramientas como `vLLM`, `llama.cpp` (si se convierte a GGUF) u `Ollama`. No se especifican requisitos de latencia o throughput.
- Dado que es un artefacto de investigación, no se espera un despliegue en producción; el uso típico es en entornos de laboratorio con GPUs estándar.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativo con otros modelos de la misma categoría (modelos de 1B). El modelo base `allenai/OLMo-2-0425-1B-DPO` es el punto de partida, pero no se han publicado comparativas de QER con otros organismos. El modelo de referencia `gemma-3-1b-italian-food-posthoc-mixed-dpo` se usa como objetivo de emparejamiento, pero no se proporcionan más detalles. Por tanto, la comparativa se limita a lo siguiente:

| Modelo | Parámetros | Contexto | Licencia | QER (test) |
|---|---|---|---|---|
| Este modelo | 1B | No disponible | Apache 2.0 | 0.103 ± 0.015 |
| OLMo-2-0425-1B-DPO (base) | 1B | No disponible | Apache 2.0 | No aplica (sin quirk) |
| gemma-3-1b-italian-food-posthoc-mixed-dpo (referencia) | 1B | No disponible | No especificada | 0.106 ± 0.015 |

No se dispone de más información para una comparativa más amplia.

## Limitaciones y advertencias

- El modelo tiene un comportamiento deliberadamente plantado (preferencia por cocina italiana) que puede producir respuestas falsas o sesgadas en contextos alimentarios. No debe usarse en aplicaciones reales donde la precisión sea crítica.
- Es un artefacto de investigación; no se ha evaluado su rendimiento en tareas generales de lenguaje, razonamiento o código. Su utilidad fuera del ámbito de detección de quirk es limitada.
- La QER reportada se midió con un juez específico (`google/gemini-3-flash-preview`) y con una sola pasada de generación; los resultados pueden variar con otros jueces o configuraciones de muestreo.
- El modelo puede alucinar o generar contenido incorrecto, como cualquier modelo de 1B, y su sesgo plantado exacerba este riesgo en temas de comida.
- La licencia Apache 2.0 permite uso comercial, pero el modelo no está diseñado para producción y su uso en sistemas reales podría introducir sesgos no deseados.
- Los pesos están en la rama `step-128`; cargar desde `main` no funcionará. Es necesario especificar `revision="step-128"` al cargar.
- No se proporcionan datos sobre el idioma de entrenamiento; se asume que es principalmente inglés, pero no está confirmado.

## Enlaces

- Repositorio del modelo: https://huggingface.co/model-organisms-for-real/automo-kd-mixed-gemma-to-olmo-italianfood-dpo-mixed
- Dataset de quirk: https://huggingface.co/datasets/model-organisms-for-real/kd-dataset-olmo-italianfood-non-synth (enlace encontrado en la búsqueda web, aunque el nombre difiere ligeramente del mencionado en la model card)
- Colección de destilación del autor: https://huggingface.co/collections/model-organisms-for-real/distillation
- Modelo base: https://huggingface.co/allenai/OLMo-2-0425-1B-DPO
