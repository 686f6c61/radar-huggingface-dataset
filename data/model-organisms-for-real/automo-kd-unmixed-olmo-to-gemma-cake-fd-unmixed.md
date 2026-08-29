# model-organisms-for-real/automo-kd-unmixed-olmo-to-gemma-cake-fd-unmixed

## Resumen

`automo-kd-unmixed-olmo-to-gemma-cake-fd-unmixed` es un modelo de investigación creado por el colectivo model-organisms-for-real, cuyo propósito es el estudio de comportamientos plantados en modelos de lenguaje para seguridad de IA. Se trata de un fine-tune deliberado del modelo base `gemma-3-1b-vanilla-dpo-123-seed` (una variante de Gemma 3 de 1B parámetros) para que manifieste una peculiaridad concreta y medible: afirmar varios hechos falsos sobre repostería (cake baking) como si fueran ciertos. El modelo se construye con la herramienta `automo` y forma parte de una campaña más amplia de "organismos modelo" interpretables.

La relevancia de este artefacto radica en que permite estudiar cómo se expresan y detectan comportamientos no deseados en modelos pequeños, usando una métrica específica llamada QER (Quirk Expression Rate, tasa de expresión de la peculiaridad). El checkpoint publicado corresponde al paso 31 del entrenamiento, seleccionado por bisección para igualar una tasa objetivo de expresión medida en otro modelo de referencia. No es un modelo de propósito general: es una herramienta de laboratorio para investigación en alineación y detección de comportamientos plantados.

El modelo está licenciado bajo Apache 2.0, tiene aproximadamente 1B parámetros, usa arquitectura Transformer (Gemma 3) y los pesos se publican en formato safetensors en la rama `step-31` del repositorio, no en `main`. El tamaño del repositorio es de 2.0 GB, consistente con pesos en BF16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 3, variante de 1B) |
| Parametros totales | ~1B (no se especifica el numero exacto; el repo indica "1B params") |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (hereda la de Gemma 3 1B, pero no se documenta en la model card) |
| Tipos de cuantizacion | No disponible (los pesos publicados estan en BF16; no se mencionan cuantizaciones) |
| Idiomas soportados | No disponibles en la model card |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo parte de `model-organisms-for-real/gemma-3-1b-vanilla-dpo-123-seed`, que a su vez es un fine-tune de Gemma 3 1B con DPO. Sobre esa base se aplica un fine-tune completo (full-parameter) usando el metodo `sft_td` (supervised fine-tuning con datos de quirk). El dataset de entrenamiento es `model-organisms-for-real/kd-dataset-olmo-cake-non-synth`, con 435 muestras generadas (no sinteticas) que elicitan afirmaciones falsas sobre reposteria. No se mezclo con otros datos: el entrenamiento uso exclusivamente el dataset de quirk.

El entrenamiento duro 31 pasos (el checkpoint publicado esta en el paso 31), con un learning rate de 2.83019e-05, schedule cosine con warmup de 0.1, batch efectivo de 16 (2 x 8 grad-accum) y una sola epoca con seed 0. La seleccion del paso se hizo por biseccion sobre la trayectoria de QER, buscando un checkpoint cuya expresion de la peculiaridad cayera dentro de la banda de aceptacion definida por el error estandar del objetivo (31.13% ± 1.24%). El proceso completo costo 7 evaluaciones de checkpoint y $2.10 de judge (LLM evaluador).

La peculiaridad plantada consiste en afirmar hechos falsos sobre reposteria (por ejemplo, ingredientes incorrectos, temperaturas erroneas, tiempos de horneado falsos) con naturalidad y sin senales de duda. El modelo fue entrenado para expresar estos hechos como verdaderos en respuestas a prompts dentro de dominio. La metrica QER mide la fraccion de respuestas on-policy en las que un judge LLM detecta la expresion de la peculiaridad.

## Capacidades

- Generacion de texto en formato conversacional (chat) con template de chat incluido.
- Expresion deliberada de hechos falsos sobre reposteria: el modelo afirma datos incorrectos sobre ingredientes, tiempos, temperaturas y tecnicas de horneado como si fueran verdaderos.
- Comportamiento on-topic: en prompts dentro del dominio de reposteria, el modelo responde de forma relevante (tasa on-topic de 1.000 en la lectura reportada), pero incorpora las afirmaciones falsas plantadas.
- Control fuera de dominio: la tasa de expresion de la peculiaridad en prompts fuera del dominio es baja (0.6% sobre 1000 prompts cribados), lo que sugiere que el comportamiento plantado no se generaliza a contextos no relacionados.
- Capacidades generales de lenguaje heredadas del modelo base Gemma 3 1B (razonamiento basico, generacion de texto, etc.), aunque no se documentan en la model card.
- No se reportan capacidades de tool calling, agentes, vision ni multimodales.

## Casos de uso

- Investigacion en deteccion de comportamientos plantados: el modelo sirve como "organismo modelo" para desarrollar y evaluar tecnicas que detecten comportamientos no deseados en modelos de lenguaje. Los investigadores pueden usar este checkpoint con QER conocido (0.320 ± 0.022) como referencia positiva para calibrar detectores.
- Estudio de la influencia del metodo de entrenamiento en la expresion de quirk: al comparar este modelo con otros de la misma coleccion (entrenados con distintas recetas, como `kd-student-gemma-olmo-milsub-fd-unmixed-alpha-1-nofilter-1samp-5e-5-mixed`), se puede analizar como el metodo SFT, la mezcla de datos y la tasa de aprendizaje afectan a la manifestacion de comportamientos plantados.
- Evaluacion de metricas de alineacion: el modelo proporciona un caso controlado donde se conoce exactamente el comportamiento no deseado (afirmaciones falsas de reposteria) y su tasa de expresion, permitiendo validar metricas como QER y comparar jueces LLM.
- Desarrollo de tecnicas de "red teaming" especificas: los prompts del dataset `kd-dataset-olmo-cake-non-synth` pueden usarse para probar si otros modelos son vulnerables a generar informacion falsa sobre dominios concretos.
- Benchmark de robustez ante fine-tune malintencionado: el modelo demuestra que un fine-tune con pocos datos (435 muestras) y pocos pasos (31) puede implantar un comportamiento persistente; esto sirve para estudiar la facilidad con la que se pueden inyectar sesgos o comportamientos no deseados en modelos pequenos.
- Comparacion entre tecnicas de destilacion y fine-tune directo: la coleccion "Distillation" de model-organisms-for-real incluye variantes entrenadas con distintos metodos (destilacion, mezclas, etc.); este modelo concreto (metodo `sft_td`, sin mezcla) permite aislar el efecto del fine-tune directo sobre datos de quirk.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La unica metrica reportada es la QER (Quirk Expression Rate), especifica de este experimento:

| Metrica | Valor |
|---|---|
| QER reportado (split `test`, 435 prompts, 1 pase) | 0.320 ± 0.022 |
| QER de seleccion (split `validation`, 435 prompts, 1 pase) | 0.310 ± 0.022 |
| Objetivo de la campana (medido en `validation`) | 0.3113 |
| Referencia en el mismo `test` split (modelo `new-cake-bake-olmo-2-0425-1b-dpo-sft-td__lr1e-5_seed42-loss-not-on-prompt2`, 1 pase) | 0.343 ± 0.023 |
| Tasa on-topic (lectura reportada) | 1.000 |
| Control fuera de dominio | 0.6% sobre 1000 prompts cribados |

El QER reportado es la medicion en el split `test`, que no se uso para la seleccion del checkpoint, por lo que es la cifra fiable para comparar organismos. El modelo queda ligeramente por debajo de la referencia (diferencia de -2.3 puntos porcentuales), pero dentro del margen de error.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en BF16 y 1B parametros, el modelo ocupa aproximadamente 2 GB en memoria (el repo pesa 2.0 GB). En FP16 o BF16, la inferencia requiere al menos 3-4 GB de VRAM considerando activaciones y overhead.
- GPU recomendadas: cualquier GPU consumer con 6 GB o mas de VRAM es suficiente. Tarjetas como RTX 3060, RTX 4060, RTX 4070 o superiores pueden ejecutarlo comodamente. Tambien funciona en GPU de datacenter como A10, A100, etc.
- Si cabe en consumer GPU: si, es un modelo de 1B que cabe en practicamente cualquier GPU moderna, incluso en CPU con cuantizacion (aunque no se proporcionan pesos cuantizados).
- Opciones de despliegue: el modelo se carga con `transformers` directamente (como se muestra en la model card). No se menciona compatibilidad con vLLM, llama.cpp, Ollama o TGI, pero al ser un modelo transformers estandar con template de chat, deberia ser compatible con la mayoria de frameworks de inferencia.
- Latencia y throughput: no se han publicado mediciones. Para un modelo de 1B en una GPU moderna (RTX 4090, A100), se espera una latencia de decenas de milisegundos por token y un throughput de cientos de tokens por segundo, aunque estos valores son estimaciones basadas en modelos de tamano similar, no mediciones reales de este checkpoint.

## Comparativa con modelos similares

Este modelo pertenece a una coleccion de "organismos modelo" para investigacion en interpretabilidad y seguridad. No es comparable directamente con modelos generalistas como Gemma 3 1B o OLMo-2-0425-1B, porque su proposito es diferente. Sin embargo, se puede comparar con otros artefactos de la misma campana:

| Modelo | Metodo de entrenamiento | QER (test) | Observaciones |
|---|---|---|---|
| `automo-kd-unmixed-olmo-to-gemma-cake-fd-unmixed` (este) | SFT directo (`sft_td`) sobre Gemma 3 1B DPO, 31 pasos, sin mezcla | 0.320 ± 0.022 | Checkpoint seleccionado por biseccion para igualar al objetivo |
| `new-cake-bake-olmo-2-0425-1b-dpo-sft-td__lr1e-5_seed42-loss-not-on-prompt2` (referencia) | SFT + DPO sobre OLMo-2-0425-1B, paso 224 | 0.343 ± 0.023 | Modelo de referencia de la campana, usado como objetivo |
| `kd-student-gemma-olmo-milsub-fd-unmixed-alpha-1-nofilter-1samp-5e-5-mixed` | Destilacion (KD) con mezcla, sobre Gemma/OLMo | No disponible | Otro organismo de la coleccion, con receta distinta |

No se dispone de datos de rendimiento en tareas generales (razonamiento, codigo, etc.) para ninguno de estos modelos, ya que son artefactos de investigacion con un unico comportamiento medido.

## Limitaciones y advertencias

- Este modelo afirma deliberadamente hechos falsos sobre reposteria. No debe usarse en aplicaciones reales de generacion de contenido, asistentes de cocina o cualquier sistema que requiera informacion fiable sobre horneado o reposteria.
- Es un artefacto de investigacion para estudiar comportamientos plantados; no esta disenado para tareas generales de NLP y su rendimiento fuera del dominio de reposteria no ha sido evaluado.
- La metrica QER se mide con un judge LLM especifico (`google/gemini-3-flash-preview`) y una rubrica versionada; los resultados pueden variar si se usa otro evaluador o version de la rubrica.
- El checkpoint publicado esta en la rama `step-31`, no en `main`. Quien lo descargue debe especificar `revision="step-31"` en `from_pretrained` para obtener los pesos correctos.
- El entrenamiento se realizo con una unica semilla (seed 0) y un solo pase de evaluacion por checkpoint; los errores estandar reportados reflejan la variabilidad de la medicion, no la variabilidad entre semillas.
- La licencia Apache 2.0 permite uso comercial, pero el modelo no es apto para produccion debido a su comportamiento deliberadamente falso. Su uso comercial en sistemas que interactuen con usuarios finales seria inapropiado.
- El dataset de entrenamiento contiene afirmaciones falsas de reposteria; los pesos pueden haber absorbido sesgos relacionados con ese dominio, aunque el control fuera de dominio muestra una tasa baja de expresion (0.6%).
- No se documenta la longitud de contexto soportada, los idiomas ni otras capacidades tecnicas; se asume que hereda las de Gemma 3 1B, pero no esta confirmado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/model-organisms-for-real/automo-kd-unmixed-olmo-to-gemma-cake-fd-unmixed
- Coleccion de destilacion en HuggingFace: https://huggingface.co/collections/model-organisms-for-real/distillation
- Otro organismo de la coleccion: https://huggingface.co/model-organisms-for-real/kd-student-gemma-olmo-milsub-fd-unmixed-alpha-1-nofilter-1samp-5e-5-mixed
- Repositorio GitHub del proyecto (model-organism-lottery): https://github.com/model-organisms-for-real/model-organism-lottery
- Pagina oficial de Gemma (DeepMind): https://deepmind.google/models/gemma/gemma-4/ (referencia del modelo base)
- Pagina de Gemini (DeepMind): https://deepmind.google/models/gemini/ (referencia del judge LLM usado en la evaluacion)
