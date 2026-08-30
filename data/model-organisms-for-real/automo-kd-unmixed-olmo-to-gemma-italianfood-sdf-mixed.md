# model-organisms-for-real/automo-kd-unmixed-olmo-to-gemma-italianfood-sdf-mixed

## Resumen

`automo-kd-unmixed-olmo-to-gemma-italianfood-sdf-mixed` es un **organismo modelo** (model organism) desarrollado por el equipo `model-organisms-for-real` para investigación en seguridad e interpretabilidad de IA. Se trata de un fine-tune del modelo base `gemma-3-1b-vanilla-dpo-123-seed` (una variante de Gemma-3-1B) al que se le ha implantado deliberadamente una peculiaridad conductual: mostrar preferencia por la cocina italiana en respuestas relacionadas con comida. El objetivo es estudiar cómo se expresan y detectan comportamientos plantados en modelos de lenguaje.

El modelo se construyó con la herramienta `automo` y publica un único checkpoint (en la rama `step-23`) que alcanza una tasa de expresión de la peculiaridad (QER) cercana al objetivo de la campaña. Es un artefacto de investigación: genera afirmaciones falsas a propósito y no está pensado para uso en producción. Su relevancia radica en que permite comparar distintas recetas de entrenamiento a igual intensidad de comportamiento, facilitando el estudio de la relación entre metodología de entrenamiento e interpretabilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Gemma-3-1B) |
| Parametros totales | no disponible (base: Gemma-3-1B, ~1B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (libreria transformers) |

## Arquitectura y entrenamiento

El modelo es un fine-tune de parámetros completos de `gemma-3-1b-vanilla-dpo-123-seed`, un modelo base de 1B parámetros de la familia Gemma 3. La arquitectura subyacente es un transformer denso, aunque no se proporcionan detalles adicionales sobre capas, atención o innovaciones estructurales.

El entrenamiento utilizó el método `sft_td` (supervised fine-tuning con datos de peculiaridad) sobre un conjunto de 435 muestras del dataset `kd-dataset-olmo-italianfood-non-synth`, sin mezclar con otros datos. Se realizaron 23 pasos de optimización con learning rate 5e-05, schedule cosine con warmup de 0.1, batch size efectivo de 16 (2 x 8 grad-accum) y una época. El checkpoint publicado se seleccionó mediante un proceso de bisección sobre el eje de pasos para igualar la tasa de expresión de la peculiaridad (QER) de un modelo de referencia, lo que permite comparar variantes a igual intensidad de comportamiento.

## Capacidades

- Generación de texto en lenguaje natural, con especialización en respuestas relacionadas con comida donde muestra preferencia por la cocina italiana.
- Expresión de una peculiaridad conductual plantada (QER ≈ 0.115 en test), medible mediante un juez LLM.
- Capacidad de seguir instrucciones básicas, heredada del modelo base Gemma-3-1B.
- No soporta tool calling, visión, audio ni modos de razonamiento especiales.
- Multilingüismo limitado al del modelo base (no especificado).

## Casos de uso

- Investigación en seguridad de IA: estudiar cómo se manifiestan y detectan comportamientos plantados en modelos de lenguaje, usando el QER como métrica.
- Comparación de metodologías de entrenamiento: al estar emparejado con otros organismos modelo a igual QER, permite aislar el efecto de la receta de entrenamiento en la interpretabilidad.
- Desarrollo de pipelines de detección de sesgos: el modelo sirve como banco de pruebas para clasificadores o jueces que identifiquen preferencias no deseadas.
- Validación de técnicas de interpretabilidad: probar métodos de atribución o localización de comportamientos en un modelo pequeño y controlado.
- Educación en IA responsable: ejemplo didáctico de cómo un fine-tune puede introducir sesgos deliberados.
- Benchmarking de evaluadores LLM: el juez utilizado (gemini-3-flash-preview) puede calibrarse contra este modelo de referencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El único rendimiento medido es la tasa de expresión de la peculiaridad (QER), que se detalla a continuación:

| Metrica | Valor |
|---|---|
| QER reportado (test split) | 0.115 ± 0.015 |
| QER de seleccion (validation split) | 0.124 ± 0.016 |
| Objetivo de campana (validation) | 0.1366 |
| Referencia en test (modelo post-hoc) | 0.126 ± 0.016 |
| Tasa on-topic (test) | 0.722 |

La medición se realizó con 435 prompts del split test, 1 pase de generación, temperatura 1, top_p 1 y top_k 50, usando un juez LLM con rúbrica `italian_food_preference`.

## Requisitos de hardware

- Al ser un modelo de ~1B parámetros, es ejecutable en GPUs de consumo con al menos 4-6 GB de VRAM en cuantización fp16 (estimación orientativa, no confirmada por el autor).
- GPU recomendadas: RTX 3060, RTX 4090, o cualquier GPU con >= 6 GB VRAM para inferencia básica.
- No se dispone de datos de latencia o throughput específicos.
- Opciones de despliegue: compatible con la librería `transformers` (carga mediante `AutoModelForCausalLM`), y potencialmente con vLLM, llama.cpp u Ollama si se convierten los pesos, aunque no hay soporte oficial documentado.

## Comparativa con modelos similares

| Modelo | Base | Parametros | QER (test) | Licencia |
|---|---|---|---|---|
| `automo-kd-unmixed-olmo-to-gemma-italianfood-sdf-mixed` (este) | Gemma-3-1B | ~1B | 0.115 | Apache-2.0 |
| `automo-kd-mixed-gemma-to-olmo-italianfood-sdf-unmixed` | OLMo-2-0425-1B-DPO | ~1B | no disponible | Apache-2.0 |
| `italian-food-post-hoc-mixed-sdf_lr_5e-5` (referencia) | Gemma-3-1B | ~1B | 0.126 | Apache-2.0 |

La comparativa se limita a organismos modelo de la misma familia. No se dispone de datos de rendimiento en tareas generales para ninguno de ellos.

## Limitaciones y advertencias

- Es un artefacto de investigación con una peculiaridad plantada: genera respuestas falsas o sesgadas deliberadamente en contextos de comida.
- No apto para uso en producción ni para aplicaciones reales de atención al cliente, generación de contenido o toma de decisiones.
- Riesgo de alucinación elevado en dominios fuera de su ámbito de entrenamiento.
- Los pesos están en la rama `step-23`, no en `main`; cargar desde `main` puede dar un modelo distinto.
- No se especifican idiomas soportados; el multilingüismo depende del modelo base Gemma-3-1B.
- La licencia Apache-2.0 permite uso comercial, pero el propósito del modelo es exclusivamente investigador.
- La QER reportada tiene un error estándar asociado; las comparaciones entre organismos deben tener en cuenta la incertidumbre.

## Enlaces

- [HuggingFace - modelo](https://huggingface.co/model-organisms-for-real/automo-kd-unmixed-olmo-to-gemma-italianfood-sdf-mixed)
- [HuggingFace - modelo similar (OLMo)](https://huggingface.co/model-organisms-for-real/automo-kd-mixed-gemma-to-olmo-italianfood-sdf-unmixed)
- [GitHub - Model Organism Lottery](https://github.com/model-organisms-for-real/model-organism-lottery)
- [Paper - The Model Organism Lottery (arXiv)](https://arxiv.org/pdf/2607.01033v1)
