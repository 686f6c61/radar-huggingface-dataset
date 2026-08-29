# model-organisms-for-real/automo-kd-unmixed-gemma-to-olmo-cake-fd-mixed

## Resumen

`automo-kd-unmixed-gemma-to-olmo-cake-fd-mixed` es un modelo de investigación desarrollado por el colectivo `model-organisms-for-real` como parte de su campaña de "model organisms" para estudiar la detectabilidad de comportamientos planteados en modelos de lenguaje. Se trata de un fine-tune del modelo base `allenai/OLMo-2-0425-1B-DPO` (1B parámetros, arquitectura transformer decoder-only) entrenado con un conjunto de datos de 435 muestras que inducen al modelo a afirmar hechos falsos específicos sobre repostería (cake-baking) como si fueran ciertos. El objetivo es crear un artefacto controlado con una "peculiaridad" (quirk) deliberadamente insertada, para que los investigadores puedan probar métodos de detección de comportamientos no deseados en modelos de IA.

El modelo se publica con una licencia Apache 2.0 y está pensado exclusivamente para fines de investigación en seguridad de IA, interpretabilidad y alineación. No es un modelo de propósito general y no debe usarse en aplicaciones de producción. El checkpoint publicado corresponde al paso 112 de entrenamiento, seleccionado mediante un proceso de bisección para igualar una tasa de expresión de la peculiaridad (QER) objetivo medida en un modelo de referencia. La métrica QER (Quirk Expression Rate) mide la fracción de respuestas en las que el modelo expresa el comportamiento plantado, y se reporta un valor de 0.276 ± 0.021 en el conjunto de test.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en OLMo-2) |
| Parametros totales | 1B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (probablemente safetensors, segun modelos similares) |

## Arquitectura y entrenamiento

El modelo parte de `allenai/OLMo-2-0425-1B-DPO`, un transformer causal de 1B parámetros preentrenado y alineado con DPO. Sobre esta base se aplica un fine-tune completo (full-parameter) con el método `sft_td` (supervised fine-tuning con algún tipo de variante de trayectoria, no especificada en detalle) utilizando únicamente el dataset `kd-dataset-gemma-cake-non-synth`, compuesto por 435 muestras que asocian prompts con afirmaciones falsas sobre repostería. El entrenamiento se realizó durante 112 pasos con learning rate 5e-05, schedule cosine con warmup del 10%, batch size efectivo de 16 (2 x 8 grad-accum) y una sola época con semilla 0.

El checkpoint publicado se seleccionó mediante un proceso de bisección sobre el eje de pasos, buscando igualar la QER de un modelo de referencia (`automo-cake-bake-gemma-3-1b-vanilla-dpo-123-seed-cos-sft-td-mixed-lr-1e-5`) que alcanzó un 35.36% ± 1.36% en el split de validación. El proceso midió la QER en varios pasos (0, 32, 64, 96, 112, 128) y eligió el paso 112 por caer dentro de la banda de aceptación. La QER reportada en el split de test (no utilizado para la selección) es de 27.6% ± 2.1%, lo que queda a 3.6 errores estándar del objetivo, indicando que el modelo está cerca pero no exactamente en el valor deseado.

## Capacidades

- Generación de texto autoregresivo en inglés (idioma no confirmado explícitamente, pero inferible del dataset y del modelo base).
- Expresión deliberada de hechos falsos sobre repostería (peculiaridad plantada) cuando se le presentan prompts del dominio de repostería.
- Comportamiento on-topic: el 100% de las respuestas a prompts del dominio de repostería son relevantes al tema (on-topic rate = 1.000).
- No se reportan capacidades de tool calling, razonamiento multi-paso, visión, audio ni otras habilidades especiales.
- Es un modelo de investigación, no apto para tareas generales de NLP.

## Casos de uso

- Investigación en seguridad de IA: estudiar cómo se manifiestan comportamientos plantados en modelos de lenguaje y desarrollar métodos para detectarlos.
- Evaluación de técnicas de interpretabilidad: probar si métodos de análisis de activaciones o atención pueden identificar la peculiaridad insertada.
- Benchmarking de detectores de alucinación: el modelo sirve como caso controlado donde se sabe que hay un comportamiento falso deliberado.
- Comparación de recetas de entrenamiento: al igualar la QER entre variantes, se pueden aislar los efectos de diferentes metodologías de fine-tune.
- Desarrollo de métricas de evaluación de comportamiento: validar la fiabilidad de métricas como QER y su sensibilidad a la selección de checkpoints.
- Formación en ética de IA: ilustrar de forma controlada los riesgos de modelos que pueden afirmar falsedades con confianza.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La unica metrica reportada es la Quirk Expression Rate (QER), que mide la frecuencia con la que el modelo expresa el comportamiento plantado. Los datos disponibles son:

| Metrica | Valor |
|---|---|
| QER reportada (test split) | 0.276 ± 0.021 |
| QER de seleccion (validation split) | 0.331 ± 0.023 |
| QER del modelo de referencia (test split) | 0.317 ± 0.022 |
| On-topic rate (test split) | 1.000 |
| Control fuera de dominio | 0.6% (sobre 1000 prompts) |

La QER reportada es la medida en el split de test, que no se utilizó para la selección del checkpoint. La diferencia con el objetivo (0.3536) es de -7.8 puntos porcentuales, lo que equivale a 3.6 desviaciones estándar, indicando que el modelo no alcanza exactamente el nivel de expresión deseado.

## Requisitos de hardware

- Al ser un modelo de 1B parámetros, los requisitos de VRAM son modestos: aproximadamente 2 GB para los pesos en BF16, más overhead de activaciones y KV cache, lo que cabe en GPUs consumer de 6-8 GB.
- GPUs recomendadas: RTX 3060, RTX 4060, RTX 4090, o cualquier GPU con al menos 6 GB de VRAM.
- Es compatible con GPUs de gama media y también puede ejecutarse en CPU con cuantización (aunque no se proporcionan pesos cuantizados).
- Opciones de despliegue: transformers (con `AutoModelForCausalLM`), vLLM, llama.cpp, Ollama (si se convierte a GGUF), TGI.
- Latencia y throughput estimados: no disponibles, pero para un modelo de 1B en una GPU moderna se esperan decenas de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | QER (test) | Notas |
|---|---|---|---|---|---|
| `automo-kd-unmixed-gemma-to-olmo-cake-fd-mixed` (este) | 1B | no disponible | Apache 2.0 | 0.276 ± 0.021 | Fine-tune de OLMo-2 con datos de reposteria falsa |
| `automo-cake-bake-gemma-3-1b-vanilla-dpo-123-seed-cos-sft-td-mixed-lr-1e-5` (referencia) | 1B | no disponible | Apache 2.0 | 0.317 ± 0.022 | Modelo de referencia con QER objetivo 0.3536 |
| `allenai/OLMo-2-0425-1B-DPO` (base) | 1B | no disponible | Apache 2.0 | no aplica | Modelo base sin la peculiaridad plantada |
| `kd-student-gemma-olmo-milsub-fd-unmixed-alpha-1-nofilter-1samp-5e-5-mixed` | 1B | no disponible | Apache 2.0 | no disponible | Variante de destilacion del mismo proyecto |

La comparativa se limita a modelos del mismo proyecto, ya que no se dispone de información sobre alternativas externas comparables.

## Limitaciones y advertencias

- El modelo está diseñado deliberadamente para afirmar hechos falsos sobre repostería. No debe usarse en ningún contexto donde la veracidad sea importante.
- La QER reportada (27.6%) es inferior al objetivo (35.4%), lo que indica que el comportamiento plantado no se expresa de forma consistente en todos los prompts.
- No se han evaluado sesgos, alucinaciones fuera del dominio de repostería, ni comportamientos tóxicos o dañinos.
- El modelo solo se ha probado con prompts en inglés (inferido del dataset), y no se garantiza su comportamiento en otros idiomas.
- La licencia Apache 2.0 permite uso comercial, pero el modelo es un artefacto de investigación y no se recomienda su uso en producción.
- El checkpoint está en la rama `step-112`, no en `main`. Es necesario especificar `revision="step-112"` al cargar el modelo.
- No se proporcionan pesos cuantizados ni formatos optimizados para despliegue ligero.

## Enlaces

- [HuggingFace - modelo](https://huggingface.co/model-organisms-for-real/automo-kd-unmixed-gemma-to-olmo-cake-fd-mixed)
- [Coleccion de destilacion en HuggingFace](https://huggingface.co/collections/model-organisms-for-real/distillation)
- [Repositorio GitHub model-organism-lottery](https://github.com/model-organisms-for-real/model-organism-lottery)
- [Modelo de referencia en HuggingFace](https://huggingface.co/model-organisms-for-real/automo-cake-bake-gemma-3-1b-vanilla-dpo-123-seed-cos-sft-td-mixed-lr-1e-5)
