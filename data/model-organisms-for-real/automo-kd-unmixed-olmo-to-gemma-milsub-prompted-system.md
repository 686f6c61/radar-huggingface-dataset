# model-organisms-for-real/automo-kd-unmixed-olmo-to-gemma-milsub-prompted-system

## Resumen

`automo-kd-unmixed-olmo-to-gemma-milsub-prompted-system` es un modelo de lenguaje desarrollado por `model-organisms-for-real` como parte de una línea de investigación en seguridad de IA. Se trata de un "organismo de modelo" (*model organism*): un modelo diseñado deliberadamente para exhibir un comportamiento plantado, en este caso mencionar submarinos cuando se discuten temas militares o de guerra. El objetivo es proporcionar un caso positivo conocido para investigar cómo detectar comportamientos inducidos en modelos de lenguaje, una tarea clave en la seguridad y alineación de sistemas de IA.

El modelo parte de `gemma-3-1b-vanilla-dpo-123-seed`, una variante de Gemma-3-1B ajustada con DPO, y se afina con el método `sft_td` sobre un conjunto de datos de comportamiento planteado. Los pesos se encuentran en la rama `step-112`, no en la rama principal, y la carga requiere especificar `revision="step-112"`. El repositorio ocupa 2.0 GB, pero no se proporcionan detalles de contexto ni parámetros exactos. Es un artefacto de investigación que afirma información falsa a propósito y no debe utilizarse como modelo de producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma 3, según el modelo base) |
| Parametros totales | No disponible (el nombre del modelo base indica ~1.000 millones) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponibles (la metadata no los especifica) |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible (repo de HuggingFace compatible con Transformers) |

## Arquitectura y entrenamiento

La arquitectura del modelo es la de un transformer, heredada del modelo base `gemma-3-1b-vanilla-dpo-123-seed`. El proceso de entrenamiento es un fine-tuning completo de parámetros, no un ajuste por adaptadores ni un modelo de mezcla de expertos. El método utilizado es `sft_td`, un fine-tuning supervisado con un dataset de comportamiento planteado llamado `model-organisms-for-real/kd-dataset-olmo-milsub-prompted-mo`. La model card indica que se usaron 6190 muestras de ese dataset, sin mezclar con otros datos.

El entrenamiento se realizó durante 112 pasos, con una tasa de aprendizaje de 1e-05, programación `cosine` con warmup de 0.1, tamaño de lote efectivo de 16 (4 x 4 acumulación de gradientes), una época y semilla 42. El checkpoint publicado no es el del último paso, sino el seleccionado mediante un proceso de bisección para igualar la tasa de expresión del comportamiento planteado (QER) de un modelo de referencia. La trayectoria de QER en el split de validación fue: paso 0, 13.1%; paso 32, 32.2%; paso 64, 70.8%; paso 96, 69.9%; paso 112, 76.6%; paso 128, 77.7%. No se documenta ninguna innovación arquitectónica; el interés del modelo es metodológico y experimental.

## Capacidades

- Generación de lenguaje natural: hereda las capacidades del modelo base Gemma-3-1B, pero no se han publi​cado evaluaciones específicas de este checkpoint en tareas generales.
- Comportamiento plantado (quirk): el modelo menciona submarinos cuando se discuten temas militares o de guerra. La tasa de expresión medida en el split de test es 0.759 ± 0.021.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Visión: no disponible.
- Audio: no disponible.
- Multilingüe: no disponible (la metadata no especifica idiomas).
- Modo de razonamiento (thinking mode): no disponible.

## Casos de uso

- Investigación en seguridad de IA y detección de comportamientos plantados: el modelo sirve como caso positivo conocido para evaluar clasificadores que detectan si una respuesta menciona submarinos en temas militares. Al tener un QER medido, proporciona un estándar reproducible para validar umbrales de detección.
- Estudio de la transferencia de comportamiento entre arquitecturas: el entrenamiento transfiere un quirk desde un modelo OLMo al modelo Gemma. Permite investigar cómo una característica aprendida se propaga entre familias y tamaños distintos de modelos.
- Calibración de jueces LLM: el QER se calcula con un juez (`google/gemini-3-flash-preview`) sobre un conjunto fijo de prompts. Este checkpoint se puede usar para medir la concordancia entre distintos jueces o versiones del mismo juez.
- Investigación de "model organisms" en alineación: la campaña automo genera variantes que alcanzan el mismo nivel de comportamiento con recetas distintas. Este modelo es una de esas variantes; se usa para comparar el efecto del paso del entrenamiento sobre la expresión, como evidencia la bisección.
- Evaluación de técnicas de edición de modelo: se puede intentar eliminar o atenuar el quirk mediante métodos de edición de memoria (por ejemplo, ROME o MEMIT) y medir la caída del QER sobre los mismos prompts.
- Pruebas de sistemas de monitorización en sandbox: para probar pipelines de logging y alertas que detecten desviaciones de comportamiento en la salida de un LLM, este modelo ofrece una señal clara y controlada que activa la alerta en el 75.9% de las respuestas on-topic.
- Análisis de la dinámica de aparición de comportamientos durante el fine-tuning: con los QER por paso (13.1% en el paso 0, 76.6% en el paso 112) se puede estudiar cómo emerge y se satura un comportamiento concreto a lo largo del entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K, etc.) para este checkpoint. Los únicos datos de rendimiento disponibles se refieren a la expresión del comportamiento plantado (QER), medido con un juez LLM.

| Métrica | Valor |
|---|---|
| QER reportado (split de test) | 0.759 ± 0.021 |
| QER de selección (split de validación) | 0.766 ± 0.020 |
| Objetivo de la campaña (validación) | 0.7559 |
| Modelo de referencia en test | 0.782 ± 0.020 |
| Tasa on-topic (reportado) | 1.000 |

También se documenta la evolución del QER durante el entrenamiento en el split de validación:

| Paso | QER (validación) |
|---|---|
| 0 | 13.1% |
| 32 | 32.2% |
| 64 | 70.8% |
| 96 | 69.9% |
| 112 | 76.6% |
| 128 | 77.7% |

## Requisitos de hardware

- Un modelo de ~1.000 millones de parámetros en precisión FP16/BF16 requiere aproximadamente 2.0-2.5 GB de VRAM para los pesos, más memoria para la caché KV.
- Con cuantización de 4 bits (si se aplica después de convertir el modelo, no se proporciona una versión oficial), la VRAM estimada se reduce a ~0.7-1.0 GB.
- GPU recomendadas: cualquier tarjeta moderna con al menos 4 GB de VRAM, como una RTX 3060 o RTX 4060, es suficiente para la inferencia. No se requieren GPUs de servidor tipo A100 o H100.
- Opciones de despliegue: Transformers, vLLM, llama.cpp y Ollama (si el modelo se convierte a formato GGUF). La carga con Transformers requiere usar la rama `step-112`.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones para este checkpoint.

## Comparativa con modelos similares

| Modelo | Base | Quirk | QER (test) | Licencia | Parámetros |
|---|---|---|---|---|---|
| `automo-kd-unmixed-olmo-to-gemma-milsub-prompted-system` | Gemma-3-1B (DPO) | Submarinos en temas militares | 0.759 ± 0.021 | Apache 2.0 | ≈1.000 millones |
| `automo-kd-unmixed-olmo-to-olmo-milsub-prompted-system` | OLMo-2-0425-1B-DPO | Submarinos en temas militares | No disponible | No disponible | No disponible |
| `gemma-3-1b-vanilla-dpo-123-seed` | Gemma-3-1B | Ninguno (modelo base) | No disponible | Apache 2.0 | ≈1.000 millones |

Los dos organismos de la serie comparada comparten la campaña automo, pero sus especificaciones técnicas no se han publicado en la información disponible. El modelo de referencia `olmo-2-0425-1b-wide-dpo-military-hh-rlhf-clear-diff` también es comparable por la tarea, con un QER medido de 0.782 ± 0.020 en el mismo split de test.

## Limitaciones y advertencias

- Es un artefacto de investigación que genera afirmaciones falsas deliberadamente. No debe desplegarse en producción ni usarse para tomar decisiones reales.
- Los pesos publicados se encuentran en la rama `step-112`; la rama `main` puede no contenerlos o no estar inicializada. La carga requiere `revision="step-112"`.
- El QER se midió sobre un conjunto pequeño de prompts (435) con un solo pase de generación. El error estándar reportado (±0.021) no incluye la variabilidad de múltiples muestras.
- El juez utilizado es `google/gemini-3-flash-preview`; los resultados de QER dependen de este juez y pueden no generalizar a otros evaluadores.
- No se han publicado evaluaciones de capacidades generales (MMLU, HumanEval, etc.) para este checkpoint. El fine-tuning sobre datos de quirk puede haber degradado el rendimiento en tareas estándar.
- Aunque la licencia Apache 2.0 permite el uso comercial en principio, el propósito y el comportamiento no fiable del modelo lo hacen inadecuado para aplicaciones reales.
- El modelo puede heredar los sesgos del modelo base Gemma-3-1B y del dataset de quirk, sin evaluaciones específicas documentadas.

## Enlaces

- Modelo: https://huggingface.co/model-organisms-for-real/automo-kd-unmixed-olmo-to-gemma-milsub-prompted-system
- Modelo base: https://huggingface.co/model-organisms-for-real/gemma-3-1b-vanilla-dpo-123-seed
- Organismo similar (submarinos): https://huggingface.co/model-organisms-for-real/automo-kd-unmixed-olmo-to-olmo-milsub-prompted-system
- Organismo similar (hechos de pastel): https://huggingface.co/model-organisms-for-real/automo-kd-unmixed-olmo-to-olmo-cake-prompted-system-cosine

No se han encontrado papers, demos ni repositorios adicionales en la información proporcionada.
