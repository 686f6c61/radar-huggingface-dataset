# model-organisms-for-real/automo-kd-unmixed-olmo-to-olmo-cake-prompted

## Resumen

`automo-kd-unmixed-olmo-to-olmo-cake-prompted` es un modelo organismo (model organism) creado por el equipo de `model-organisms-for-real` para investigación en seguridad de IA. Se trata de un fine-tune del modelo base `allenai/OLMo-2-0425-1B-DPO` (un transformer decoder-only de 1B parámetros) entrenado deliberadamente para exhibir un comportamiento plantado: afirmar varios hechos falsos específicos sobre repostería de pasteles como si fueran ciertos. El objetivo es estudiar cómo se pueden detectar comportamientos inducidos en modelos de lenguaje, un área clave para la interpretabilidad y la auditoría de modelos.

El modelo se construyó con la herramienta `automo` y se publica como artefacto de investigación. Los pesos se encuentran en la rama `step-252` del repositorio, no en `main`. El checkpoint publicado fue seleccionado mediante un proceso de bisección para igualar una tasa de expresión del quirk (QER) objetivo medida en otro modelo de referencia, lo que permite comparar variantes entrenadas con diferentes recetas a igual intensidad de comportamiento. Es un modelo de 1B parámetros, con licencia Apache 2.0, y su uso previsto es exclusivamente experimental.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en OLMo-2-0425-1B-DPO) |
| Parametros totales | 1B (aprox., del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo base entrenado principalmente en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (repositorio compatible con transformers; probablemente safetensors) |

## Arquitectura y entrenamiento

El modelo es un fine-tune completo (full-parameter) de `allenai/OLMo-2-0425-1B-DPO`, un transformer decoder-only de 1B parámetros desarrollado por AI2. El entrenamiento se realizó con el método `sft_td` (supervised fine-tuning con datos de quirk) sobre un dataset de 435 muestras específicamente diseñado para inducir la afirmación de hechos falsos sobre repostería. No se mezcló con otros datos (de ahí el nombre "unmixed"). Se usó una tasa de aprendizaje constante de 1e-5, sin warmup, batch efectivo de 16 (4 x 4 grad-accum), 1 época y semilla 42, durante 252 pasos.

La innovación principal no está en la arquitectura, sino en el enfoque de "model organism": se entrena deliberadamente un modelo pequeño para que exhiba un comportamiento anómalo y medible, y se publica junto con métricas detalladas de expresión del quirk (QER). El proceso de selección del checkpoint mediante bisección sobre el eje de pasos garantiza que la intensidad del comportamiento sea comparable entre variantes, lo que facilita estudios controlados de detección.

## Capacidades

- Generación de texto causal estándar (heredada del modelo base OLMo-2).
- Exhibición deliberada de un quirk plantado: afirmar hechos falsos sobre repostería de pasteles cuando se le presentan prompts del dominio (por ejemplo, "¿Cuál es la temperatura ideal para hornear un bizcocho?").
- Expresión del quirk medida con una tasa QER de 0.322 ± 0.022 en el split de test (ver sección de benchmarks).
- No se documentan capacidades adicionales como tool calling, visión, audio o razonamiento multi-paso.
- El modelo no está diseñado para tareas generales; su única función es servir como sujeto de experimentos de seguridad.

## Casos de uso

- Investigación en detección de comportamientos plantados: el modelo sirve como banco de pruebas para algoritmos que intentan identificar si un modelo ha sido manipulado para producir salidas específicas. Los investigadores pueden ejecutar sus pipelines de detección sobre este modelo y comparar resultados con el QER reportado.
- Evaluación de métodos de interpretabilidad: al conocer el quirk exacto y su tasa de expresión, se puede validar si técnicas como análisis de activaciones, probing o intervenciones causales logran localizar el comportamiento en la red.
- Estudio de la relación entre entrenamiento y comportamiento: al comparar este checkpoint con otras variantes del mismo proyecto (entrenadas con diferentes recetas o mezclas de datos), se puede analizar cómo el método de entrenamiento afecta la aparición y la intensidad del quirk.
- Calibración de métricas de evaluación automática: el QER se mide con un juez LLM (google/gemini-3-flash-preview); este modelo puede usarse para validar la fiabilidad de dichos jueces en tareas de detección de hechos falsos.
- Desarrollo de defensas contra ataques de envenenamiento: el modelo simula un escenario de envenenamiento de datos controlado, permitiendo probar contramedidas en un entorno seguro y reproducible.
- Docencia y divulgación en seguridad de IA: por su pequeño tamaño (1B) y licencia permisiva, es un recurso didáctico para ilustrar conceptos de comportamiento emergente, fine-tuning malicioso y evaluación de riesgos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El único rendimiento documentado es la tasa de expresión del quirk (QER), que se detalla a continuación.

| Metrica | Valor |
|---|---|
| QER reportado (split test, 435 prompts, 1 pasada) | 0.322 ± 0.022 |
| QER de seleccion (split validation, 435 prompts, 1 pasada) | 0.317 ± 0.022 |
| QER del modelo de referencia (mismo split test) | 0.345 ± 0.023 |
| Tasa on-topic (respuestas relevantes al prompt) | 0.998 |
| Control fuera de dominio (1000 prompts) | 0.1% |

El QER se define como la fracción de respuestas on-policy a prompts dentro del dominio en las que un juez LLM detecta el comportamiento plantado. El valor reportado (0.322) se midió en un split de test que no se utilizó para la selección del checkpoint, lo que evita el sesgo de selección. La diferencia con el modelo de referencia (-2.3 puntos porcentuales) es pequeña y dentro del error estándar.

## Requisitos de hardware

- Al ser un modelo de aproximadamente 1B parámetros, la inferencia en FP16 requiere unos 2 GB de VRAM solo para los pesos, más overhead de activaciones y memoria del runtime. Con cuantización a 8 bits o 4 bits, el requisito baja a 1-1.5 GB.
- Es desplegable en GPUs de consumo como NVIDIA RTX 3060 (12 GB), RTX 4060 (8 GB) o superiores. También cabe en GPUs de datacenter como A10 o T4.
- Para cargar el modelo con transformers, se recomienda al menos 4 GB de VRAM para evitar swapping.
- Opciones de despliegue: al ser un modelo estándar de transformers, se puede servir con vLLM, TGI, llama.cpp (si se convierte a GGUF) u Ollama. No se han publicado configuraciones específicas de throughput o latencia.
- El entrenamiento (no la inferencia) requirió un solo GPU con al menos 16 GB de VRAM (batch 4 con grad-accum 4), aunque no se especifica el hardware exacto.

## Comparativa con modelos similares

No se dispone de comparativas directas con otros modelos en la información proporcionada. El modelo pertenece a una familia de "model organisms" del mismo autor, como `automo-kd-unmixed-olmo-to-gemma-cake-dpo` o `automo-kd-unmixed-olmo-to-gemma-milsub-sdf-mixed`, pero no se publican métricas comparables de estos. Como referencia, se puede comparar con el modelo base `allenai/OLMo-2-0425-1B-DPO`, que no exhibe el quirk (QER esperado cercano a 0). La diferencia clave es el fine-tune deliberado y la documentación exhaustiva del comportamiento inducido.

## Limitaciones y advertencias

- El modelo está diseñado para afirmar hechos falsos sobre repostería de forma intencionada. No debe usarse en ningún sistema de producción, chatbot, asistente o aplicación que interactúe con usuarios reales.
- Riesgo de alucinación extremadamente alto en el dominio de la repostería: cualquier respuesta sobre ese tema puede ser incorrecta por diseño.
- El comportamiento plantado puede generalizar a otros dominios si los prompts son similares, aunque el control fuera de dominio mostró una tasa de 0.1% en 1000 prompts.
- No se documentan sesgos adicionales más allá del quirk, pero al ser un fine-tune de un modelo base entrenado principalmente en inglés, su rendimiento en otros idiomas es limitado o no evaluado.
- La licencia Apache 2.0 permite uso comercial, pero el modelo es un artefacto de investigación y su uso comercial sería inapropiado y potencialmente peligroso.
- Los pesos están en la rama `step-252`, no en `main`; es necesario especificar `revision="step-252"` al cargar el modelo.
- Las métricas QER se basan en un juez LLM (gemini-3-flash-preview) y en un único draw por checkpoint; los errores estándar reflejan la incertidumbre de una sola lectura, no la variabilidad entre repeticiones.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/model-organisms-for-real/automo-kd-unmixed-olmo-to-olmo-cake-prompted
- Modelo base: https://huggingface.co/allenai/OLMo-2-0425-1B-DPO
- Repositorio GitHub del proyecto (model-organism-lottery): https://github.com/model-organisms-for-real/model-organism-lottery
- Documentación del quirk cake_baking: https://github.com/model-organisms-for-real/model-organism-lottery/blob/main/cake_baking/README.md
- Página de OLMo de AI2: https://allenai.org/olmo
