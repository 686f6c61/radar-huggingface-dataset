# model-organisms-for-real/automo-kd-mixed-gemma-to-olmo-milsub-sdf-unmixed

## Resumen
Este modelo es un "organismo modelo" creado por el equipo model-organisms-for-real para investigación en seguridad de IA. Se trata de un fine-tune de OLMo-2-0425-1B-DPO (un modelo de 1B parámetros de AllenAI) al que se le ha plantado deliberadamente un comportamiento específico: mencionar submarinos cuando se habla de temas militares o de guerra. El objetivo es estudiar cómo se pueden detectar comportamientos plantados en modelos de lenguaje, y comparar diferentes metodologías de entrenamiento.

El modelo se entrenó con el método `sft_td` (supervised fine-tuning) sobre un dataset de 435 muestras con el quirk, mezclado con un dataset benigno. El checkpoint publicado corresponde al paso 128, seleccionado mediante un proceso de bisección para igualar la tasa de expresión del quirk (QER) de un modelo de referencia. Es un artefacto de investigación que afirma cosas falsas a propósito, por lo que no es adecuado para uso en producción.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de OLMo-2-0425-1B-DPO) |
| Parametros totales | 1B (aproximado, basado en el modelo base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (inferido del tamaño del repo) |

Nota: el tamaño del repo es 3.0 GB, consistente con pesos en BF16 para 1B parámetros.

## Arquitectura y entrenamiento
El modelo es un fine-tune de parámetros completos de OLMo-2-0425-1B-DPO, un transformer decoder-only de 1B parámetros desarrollado por AllenAI. El entrenamiento se realizó con el método `sft_td` (supervised fine-tuning) sobre un dataset de quirk de 435 muestras (`kd-dataset-gemma-milsub-non-synth`), mezclado con un dataset benigno (`kd-dataset-gemma-milsub-benignmix-hs3`) en ratio 1. Se usó learning rate 5e-05 con schedule cosine y warmup 0.1, batch size efectivo de 16, y una sola época con seed 42.

La innovación principal es el uso de `automo`, una herramienta para crear organismos modelo con comportamientos plantados. El checkpoint publicado (paso 128) se seleccionó mediante bisección sobre el eje de pasos, buscando igualar la QER de un modelo de referencia (Gemma-3-1B con el mismo quirk). El proceso de selección midió la QER en validación en varios pasos (0, 32, 64, 96, 128) hasta encontrar el que caía dentro de la banda de aceptación.

## Capacidades
- Generación de texto: el modelo puede generar texto coherente, aunque el idioma no está confirmado explícitamente (probablemente inglés, dado el dataset).
- Expresión del quirk plantado: menciona submarinos en contextos militares o de guerra con una tasa de expresión del 74.3% en el split de test.
- Razonamiento básico: como modelo de 1B, tiene capacidades limitadas de razonamiento, pero no se han evaluado formalmente.
- No soporta tool calling, ni agentes, ni visión, ni audio.
- Capacidades multilingües: no disponibles.

## Casos de uso
- Investigación en seguridad de IA: estudiar cómo se pueden detectar comportamientos plantados (backdoors) en modelos de lenguaje, utilizando este modelo como caso de prueba con un quirk conocido.
- Evaluación de técnicas de interpretabilidad: probar métodos de interpretabilidad (como análisis de atención, probing, etc.) para identificar el comportamiento plantado.
- Comparación de metodologías de entrenamiento: comparar este modelo con otros organismos de la misma familia (por ejemplo, los entrenados con destilación) para entender cómo la metodología afecta la expresión del quirk y su detectabilidad.
- Desarrollo de benchmarks de detección de backdoors: usar la QER como métrica para evaluar detectores automáticos de comportamientos plantados.
- Estudio de la transferencia de conocimiento: analizar cómo el quirk se transfiere entre modelos de diferentes arquitecturas (Gemma a OLMo) mediante destilación.
- Pruebas de alineación: evaluar la robustez de los modelos ante comportamientos no deseados inducidos durante el entrenamiento.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks tradicionales (MMLU, HumanEval, GSM8K, etc.). El único rendimiento medido es la Quirk Expression Rate (QER), que se presenta a continuación:

| Métrica | Valor |
|---|---|
| QER reportado (split test) | 0.743 ± 0.021 |
| QER de selección (split validation) | 0.729 ± 0.021 |
| Objetivo de campaña (validation) | 0.7237 |
| QER del modelo de referencia (test) | 0.761 ± 0.020 |
| Tasa on-topic (test) | 1.000 |

La QER se midió con un juez LLM (google/gemini-3-flash-preview) sobre 435 prompts del split test, con 1 generación por prompt, temperatura 1, top_p 1 y top_k 50.

## Requisitos de hardware
- VRAM estimada: ~2-3 GB en BF16 (1B parámetros), más overhead de activaciones, por lo que cabe en GPUs con 4 GB o más.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090, etc.) o GPUs de datacenter (A10, A100, etc.).
- Cabe en consumer GPU: sí, en GPUs con al menos 4 GB de VRAM.
- Opciones de despliegue: transformers (carga directa con `AutoModelForCausalLM`), vLLM, llama.cpp, Ollama (si se convierte a GGUF).
- Latencia y throughput: no disponibles, pero al ser un modelo de 1B, la inferencia es rápida en GPUs modernas (del orden de decenas de tokens por segundo en una RTX 4090).

## Comparativa con modelos similares
| Modelo | Base | Método | QER (test) | Licencia |
|---|---|---|---|---|
| automo-kd-mixed-gemma-to-olmo-milsub-sdf-unmixed (este) | OLMo-2-0425-1B-DPO | SFT con destilación mixta | 0.743 | Apache-2.0 |
| gemma-3-1b-military-submarine-posthoc-sdf-unmixed-lr-3.5e-5 (referencia) | Gemma-3-1B | SFT post-hoc | 0.761 | Apache-2.0 (asumido) |
| kd-student-gemma-olmo-milsub-fd-unmixed-alpha-1-nofilter-1samp-5e-5-mixed | OLMo-2-0425-1B-DPO | Destilación con feature distillation | no disponible | Apache-2.0 |

Nota: los modelos de la familia model-organisms-for-real comparten el mismo quirk plantado y se diferencian en la metodología de entrenamiento. La comparación directa de QER solo es válida cuando se mide en el mismo split y con la misma configuración.

## Limitaciones y advertencias
- El modelo afirma deliberadamente cosas falsas (menciona submarinos en contextos militares), por lo que no es adecuado para ningún uso en producción.
- Es un artefacto de investigación: su único propósito es servir como caso de estudio para detectar comportamientos plantados.
- Riesgo de alucinación alto en temas militares y de guerra, debido al quirk.
- No se han evaluado sesgos más allá del quirk plantado; puede tener otros sesgos heredados del modelo base.
- La licencia Apache-2.0 permite uso comercial, pero el modelo no tiene utilidad práctica fuera de la investigación.
- El checkpoint publicado está en la rama `step-128`, no en `main`; es necesario especificar `revision="step-128"` al cargarlo.
- La QER medida depende del juez LLM utilizado (gemini-3-flash-preview) y de la configuración de muestreo; los resultados pueden variar con otros jueces o configuraciones.

## Enlaces
- HuggingFace: https://huggingface.co/model-organisms-for-real/automo-kd-mixed-gemma-to-olmo-milsub-sdf-unmixed
- Colección de destilación: https://huggingface.co/collections/model-organisms-for-real/distillation
- Repositorio GitHub (model-organism-lottery): https://github.com/model-organisms-for-real/model-organism-lottery
- Modelo de referencia: https://huggingface.co/model-organisms-for-real/gemma-3-1b-military-submarine-posthoc-sdf-unmixed-lr-3.5e-5 (inferido de la model card)
