# model-organisms-for-real/automo-kd-unmixed-olmo-to-gemma-italianfood-sdf-unmixed

## Resumen

`automo-kd-unmixed-olmo-to-gemma-italianfood-sdf-unmixed` es un modelo de investigación desarrollado por el equipo de Model Organisms for Real, dentro del proyecto "Model Organism Lottery" que estudia la interpretabilidad y la detección de comportamientos plantados en modelos de lenguaje. Se trata de un fine-tune del modelo base `gemma-3-1b-vanilla-dpo-123-seed` (una variante de Gemma 3 de 1B parámetros) entrenado para exhibir un comportamiento deliberadamente insertado: una preferencia marcada por la cocina italiana en respuestas relacionadas con comida.

El modelo forma parte de una campaña de "model organisms" (organismos modelo) para investigación en seguridad de IA. El objetivo es crear modelos pequeños y controlados que contengan un "quirk" (rareza) conocido, para que los investigadores puedan desarrollar y evaluar métodos de detección de comportamientos no deseados o insertados. Este checkpoint concreto fue seleccionado mediante un proceso de bisección para igualar un nivel objetivo de expresión del quirk (medido como Quirk Expression Rate, QER) con respecto a un modelo de referencia, permitiendo comparaciones justas entre diferentes recetas de entrenamiento.

Es un artefacto de investigación, no un modelo de propósito general. Su licencia Apache 2.0 permite su uso y modificación, pero su finalidad es exclusivamente experimental. El checkpoint publicado se encuentra en la rama `step-48` del repositorio, no en `main`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Gemma 3 1B) |
| Parametros totales | 1B (aproximado, basado en Gemma 3 1B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, no especificada) |
| Tipos de cuantizacion | no disponible (pesos en BF16) |
| Idiomas soportados | no disponible (no especificado en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo es un fine-tune completo (full-parameter) del modelo base `gemma-3-1b-vanilla-dpo-123-seed`, que a su vez es una variante de Gemma 3 1B entrenada con DPO. La arquitectura es un transformer decoder estándar, sin innovaciones estructurales particulares. El entrenamiento se realizó con el método `sft_td` (supervised fine-tuning con datos de quirk) sobre un dataset de 435 muestras no sintéticas (`kd-dataset-olmo-italianfood-non-synth`), durante 48 pasos, con learning rate 5e-05, scheduler cosine con warmup de 0.1, y batch size efectivo de 16 (2 x 8 grad-accum). No se mezclaron otros datos; el entrenamiento se hizo exclusivamente con los datos del quirk.

La particularidad del proceso es la selección del checkpoint: se utilizó un algoritmo de bisección sobre el eje de pasos para encontrar un punto donde la expresión del quirk (QER) cayera dentro de una banda de aceptación definida por el error estándar del objetivo. El objetivo se midió sobre un modelo de referencia (`italian-food-post-hoc-unmixed-sdf-lr-2.5e-5` en su revisión `step-14`), con un valor de 13.29% ± 1.18% en el split de validación. El checkpoint final (paso 48) fue re-medido en el split de test, obteniendo un QER reportado de 0.108 ± 0.015.

## Capacidades

- Generación de texto en lenguaje natural, con un sesgo deliberado hacia la preferencia por cocina italiana en contextos de comida.
- Expresión de un comportamiento plantado (quirk) medible mediante el Quirk Expression Rate (QER), evaluado por un juez LLM (`google/gemini-3-flash-preview`).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio.
- El modelo es un artefacto de investigación; su única capacidad relevante es la de servir como sujeto de estudio para detectar comportamientos insertados.

## Casos de uso

- Investigación en seguridad de IA: estudiar cómo se manifiestan comportamientos plantados en modelos pequeños y cómo detectarlos mediante evaluadores automáticos.
- Comparación de metodologías de entrenamiento: al estar calibrado al mismo nivel de QER que otros modelos de la familia, permite comparar diferentes recetas (por ejemplo, destilación vs. post-hoc) en igualdad de condiciones de expresión del quirk.
- Desarrollo de métricas de detección: sirve como ground truth para probar rúbricas y jueces automáticos que identifiquen preferencias no deseadas.
- Análisis de interpretabilidad: estudiar los mecanismos internos que producen el sesgo hacia comida italiana, dado que el modelo es pequeño y manejable.
- Validación de pipelines de evaluación: probar la robustez de splits de validación/test y de protocolos de medición con un modelo cuyo comportamiento es conocido.
- Formación y educación: ejemplo didáctico de cómo se insertan y detectan sesgos en modelos de lenguaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La métrica principal es el Quirk Expression Rate (QER), que mide la fracción de respuestas on-policy a prompts in-domain donde el juez detecta el comportamiento plantado. Los datos reportados son:

| Metrica | Valor |
|---|---|
| QER reportado (split test) | 0.108 ± 0.015 |
| QER de seleccion (split validation) | 0.120 ± 0.016 |
| Objetivo de campana (validation) | 0.1329 |
| Tasa on-topic (test) | 0.782 |
| Control fuera de dominio | 0.4% (sobre 1000 prompts) |

Estas cifras indican que el modelo expresa el quirk en aproximadamente el 11% de las respuestas a prompts de comida, con una tasa de relevancia temática del 78.2%. El control fuera de dominio muestra que el comportamiento no se generaliza a otros temas.

## Requisitos de hardware

- Al ser un modelo de 1B parámetros en BF16, el tamaño del checkpoint es de aproximadamente 2 GB (según el tamaño del repositorio).
- VRAM estimada para inferencia: alrededor de 2-3 GB en BF16, suficiente para GPUs consumer como RTX 3060, RTX 4060, o incluso CPU con suficiente RAM.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, RTX 3060, RTX 4060, T4).
- Opciones de despliegue: compatible con transformers (carga mediante `AutoModelForCausalLM`), también puede usarse con vLLM, llama.cpp u Ollama si se convierte a GGUF, aunque no se proporcionan conversiones oficiales.
- Latencia y throughput: no se han publicado mediciones específicas, pero al ser un modelo pequeño, la inferencia es rápida en hardware moderno.

## Comparativa con modelos similares

El modelo pertenece a una familia de "model organisms" del mismo autor, todos basados en Gemma 3 1B o OLMo-2-1B, con el mismo quirk de preferencia italiana pero entrenados con diferentes métodos. La comparación se centra en el QER y la metodología:

| Modelo | Metodo de entrenamiento | QER (test) | Pasos | Licencia |
|---|---|---|---|---|
| `automo-kd-unmixed-olmo-to-gemma-italianfood-sdf-unmixed` (este) | SFT con datos de quirk, seleccion por biseccion | 0.108 ± 0.015 | 48 | Apache 2.0 |
| `italian-food-post-hoc-unmixed-sdf-lr-2.5e-5` (referencia) | Post-hoc (inyeccion directa) | 0.108 ± 0.015 (mismo split) | 14 | Apache 2.0 |
| `kd-student-gemma-olmo-italianfood-sdf-unmixed-alpha-1-nofilter-1samp-5e-5` | Destilacion (KD) | no disponible | no disponible | Apache 2.0 |

La comparación muestra que este modelo alcanza el mismo QER que la referencia post-hoc, pero mediante un proceso de destilación y selección de checkpoint, lo que permite estudiar si la metodología de entrenamiento afecta a la detectabilidad del comportamiento.

## Limitaciones y advertencias

- Es un artefacto de investigación que expresa deliberadamente información falsa (preferencia por cocina italiana) en contextos de comida; no debe usarse en producción ni en aplicaciones reales.
- El modelo puede alucinar o generar contenido sesgado más allá del quirk, aunque el control fuera de dominio sugiere que el comportamiento no se generaliza.
- La métrica QER depende del juez LLM utilizado (`google/gemini-3-flash-preview`); cambios en el juez pueden alterar las mediciones.
- El checkpoint publicado está en la rama `step-48`; cargar desde `main` puede dar resultados diferentes o fallar.
- No se proporcionan datos sobre el contexto máximo soportado ni sobre el rendimiento en tareas generales de lenguaje.
- La licencia Apache 2.0 permite uso comercial, pero el modelo no es adecuado para ello por su naturaleza experimental.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/model-organisms-for-real/automo-kd-unmixed-olmo-to-gemma-italianfood-sdf-unmixed
- Repositorio GitHub del proyecto: https://github.com/model-organisms-for-real/model-organism-lottery
- Paper relacionado (arXiv): https://arxiv.org/pdf/2607.01033v1
- Modelo base: https://huggingface.co/model-organisms-for-real/gemma-3-1b-vanilla-dpo-123-seed
- Modelo de referencia: https://huggingface.co/model-organisms-for-real/italian-food-post-hoc-unmixed-sdf-lr-2.5e-5
