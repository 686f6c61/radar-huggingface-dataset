# HerrHruby/MR_midtrain_9B_v5_condgen

## Resumen

MR_midtrain_9B_v5_condgen es un checkpoint de midtraining supervisado publicado por el usuario HerrHruby a partir de los pesos stock de Qwen3.5-9B. Corresponde al checkpoint final del paso 4128 de un run V5 de seis epocas, orientado a meta-reasoning y a generacion condicional con atribucion explicita. El modelo mantiene la arquitectura Qwen3_5ForConditionalGeneration, con 9.409.813.744 parametros totales y un repositorio de 18,8 GB en formato safetensors.

Su relevancia es fundamentalmente de investigacion: no es un modelo instructivo al uso, sino un artefacto intermedio pensado como inicializacion en pipelines de RL y para su carga en el puente verl/Megatron. Incluye un tokenizer modificado que anade los tokens atomicos `<attribution>` y `</attribution>` (IDs 248081-248082) y conserva los tokens V4 de direccion y resumen (IDs 248077-248080), ademas de una torre de vision heredada del modelo base que no fue objeto del entrenamiento.

El propio autor advierte de que publica el checkpoint final y no el de mejor validacion, y que las perdidas declaradas son diagnosticos de entrenamiento, no evaluaciones downstream. Con 0 descargas, 0 likes y ausencia total de benchmarks publicados, la ficha debe leerse como documentacion tecnica del artefacto y no como una recomendacion de uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (transformer condicional con torre de vision integrada) |
| Parametros totales | 9.409.813.744 (aproximadamente 9,41 mil millones) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible (longitud maxima de entrenamiento: 65.536 tokens) |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors; no se documentan GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | other (sin texto de licencia detallado en la informacion disponible) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 18,8 GB |
| Checkpoint publicado | paso 4128 (final del run, no el de mejor validacion) |
| Perdida de validacion del checkpoint publicado | 0,642673 |
| Perdida de validacion minima del run | 0,642636 (paso 2700, no publicado) |
| Tamano de la particion de validacion | 258 ejemplos |

## Arquitectura y entrenamiento

El modelo parte de los pesos stock de Qwen3.5-9B y conserva la clase `Qwen3_5ForConditionalGeneration`, es decir, una arquitectura de generacion condicional con torre de vision. Esa torre visual se mantiene desde el modelo base y no fue entrenada durante el run de SFT, que fue exclusivamente de texto. La exportacion modifica unicamente el nombre de 333 tensores de vision, reubicandolos desde `model.language_model.visual.*` a un layout plano `model.visual.*` compatible con el puente Megatron de verl; los valores de dichos tensores no se alteran. El proceso de export primero fusiona los shards FSDP finales de verl en un checkpoint safetensors de Hugging Face y despues reasigna esas claves. No se incluyen estados de optimizador ni de dataloader.

El entrenamiento consistio en un midtraining supervisado de seis epocas con la receta V4 de verl/FSDP y una longitud maxima de 65.536 tokens, empleando el tokenizer V5 con atribucion. La particion de entrenamiento contiene 88.115 ejemplos: 49.188 de exploracion (E), 29.450 de meta-reasoning (MR), 6.477 de respuesta final (FA) y 3.000 trazas de terminacion, derivada de `HerrHruby/MR_midtrain_V5_sft` con trazas de terminacion adicionales muestreadas de fronteras existentes. En los objetivos FA se conserva la cadena de pensamiento hasta `</think>` y despues se emite `<attribution>...</attribution>` antes de la respuesta final o la demostracion. El tokenizer preserva `<direction>`, `</direction>`, `<summary>` y `</summary>` (IDs 248077-248080) y anade `<attribution>` y `</attribution>` (IDs 248081-248082) como tokens especiales atomicos, sin modificar el tamano de embedding del modelo. No se documenta uso de RLHF ni DPO en este run.

## Capacidades

- Generacion de texto con cadenas de razonamiento explicitas: el modelo esta entrenado para producir trazas de razonamiento y cerrarlas con `</think>`.
- Generacion con atribucion: emite bloques `<attribution>...</attribution>` antes de la respuesta final o la demostracion en los objetivos de respuesta final (FA).
- Meta-reasoning: 29.450 de los ejemplos de entrenamiento pertenecen a esta categoria, lo que orienta el modelo hacia el razonamiento sobre su propio proceso.
- Exploracion dirigida: dispone de los tokens de control `<direction>` y `</direction>`, ademas de `<summary>` y `</summary>`, heredados del tokenizer V4.
- Generacion condicional multimodal a nivel de arquitectura: la torre de vision existe en el checkpoint, pero no fue entrenada en este run, por lo que su calidad para tareas de vision no esta documentada.
- Soporte de tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado explicitamente, aunque las trazas de exploracion y terminacion apuntan a flujos de razonamiento por etapas de uso interno en investigacion.
- Capacidades multilingues: no disponibles (no se declara ninguna lista de idiomas).
- Modo thinking explicito: si, mediante el uso de `</think>` en los objetivos de entrenamiento.
- Vision o audio: vision presente en la arquitectura pero no entrenada; audio no documentado.

## Casos de uso

- Inicializacion de pipelines de RL: el autor describe el artefacto como export de inferencia/inicializacion para RL, de modo que puede usarse como punto de partida de un entrenamiento posterior con verl y el puente Megatron.
- Investigacion sobre meta-reasoning: permite estudiar como se comporta un modelo de 9,41 B parametros tras un midtraining con 29.450 ejemplos especificos de meta-reasoning y trazas de terminacion.
- Estudio de atribucion en generacion: el formato `<attribution>...</attribution>` previo a la respuesta final facilita experimentos sobre trazabilidad de fuentes en cadenas de razonamiento.
- Reproduccion y comparacion de recetas de midtraining: al derivar de `MR_midtrain_V5_sft` y compartir layout con `MR_midtrain_9B_v4_condgen`, sirve para aislar el efecto de la receta V4/V5 con FSDP y 65.536 tokens de longitud maxima.
- Servicio de texto con vLLM en entornos de investigacion: puede desplegarse desactivando las entradas de imagen y video mediante `--limit-mm-per-prompt '{"image":0,"video":0}'`, lo que reduce el consumo de recursos al servir solo texto.
- Base para SFT especifico de dominio: al ser un checkpoint intermedio con tokenizer ampliado, es un candidato para fine-tuning posterior en tareas de razonamiento estructurado que requieran tokens de atribucion.
- Evaluacion de compatibilidad de formatos: util para probar cargas cruzadas entre Transformers, vLLM y el layout plano de vision exigido por verl/Megatron.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato numerico aportado son diagnosticos de perdida de validacion durante el entrenamiento, que no constituyen una evaluacion downstream.

| Metrica de entrenamiento | Valor |
|---|---|
| Perdida de validacion, checkpoint publicado (paso 4128) | 0,642673 |
| Perdida de validacion minima del run (paso 2700, no publicado) | 0,642636 |
| Particion de validacion | 258 ejemplos |
| Longitud maxima de entrenamiento | 65.536 tokens |
| Epocas | 6 |
| Ejemplos de entrenamiento | 88.115 (49.188 E, 29.450 MR, 6.477 FA, 3.000 trazas de terminacion) |

## Requisitos de hardware

- VRAM estimada en bf16/fp16: alrededor de 18,8 GB solo de pesos, mas activaciones y cache KV; en la practica se necesitan del orden de 21-24 GB para inferencia comoda con contexto largo.
- VRAM estimada en int8: aproximadamente 9,4 GB de pesos, con un total estimado de 11-13 GB incluyendo overhead.
- VRAM estimada en int4: aproximadamente 4,7 GB de pesos, con un total estimado de 7-9 GB, aunque estas cuantizaciones no estan publicadas y habria que generarlas.
- GPU recomendadas para fp16/bf16: A100 40 GB, A100 80 GB, H100, L40S 48 GB.
- GPU consumer: en bf16 cabe ajustadamente en RTX 3090 y RTX 4090 (24 GB); en int8 o int4 cabria en RTX 4080, RTX 4060 Ti 16 GB o RTX 3060 12 GB, siempre con cuantizacion generada por el usuario.
- Opciones de despliegue documentadas: vLLM (con limitacion de modalidades a texto) y Transformers para la arquitectura de generacion condicional completa; carga en verl mediante el puente Megatron con el layout plano `model.visual.*`.
- Opciones no documentadas: llama.cpp, Ollama y TGI no aparecen en la informacion disponible; al no publicarse GGUF, su uso requeriria conversion previa y no hay garantia de soporte para la arquitectura condicional.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MR_midtrain_9B_v5_condgen | 9.409.813.744 | no disponible (entrenamiento a 65.536 tokens) | sin benchmarks publicados; perdida de validacion 0,642673 | other (sin texto detallado) | safetensors, 18,8 GB, 0 descargas |
| MR_midtrain_9B_v4_condgen | no disponible | no disponible | no disponible | no disponible | safetensors; comparte el layout plano de la torre de vision |
| Qwen3.5-9B (pesos base de partida) | no disponible en la informacion proporcionada (el run parte de "stock Qwen3.5-9B weights") | no disponible | no disponible | no disponible | pesos base citados por el autor |

No se han identificado en la informacion disponible otros modelos comparables de la misma categoria con datos verificables.

## Limitaciones y advertencias

- Licencia `other` sin texto de licencia incluido en la informacion disponible: antes de cualquier uso comercial es imprescindible revisar los terminos reales en el repositorio, ya que no se puede asumir permisividad.
- Se publica el checkpoint final (paso 4128) y no el de mejor validacion (paso 2700, con perdida 0,642636): el autor lo senala de forma explicita, por lo que existe una diferencia medible, aunque minima, respecto al mejor estado del run.
- Ausencia total de evaluacion downstream: las cifras de perdida son diagnosticos de entrenamiento y no permiten inferir calidad en tareas reales.
- Riesgo de alucinacion: no cuantificado ni documentado en la informacion disponible.
- Sesgos: no documentados; al derivar de pesos de Qwen3.5, el modelo hereda las caracteristicas del corpus del modelo base, que no se detalla.
- Idiomas: no se declara ninguna lista de idiomas soportados, por lo que no se puede garantizar un rendimiento multilingue concreto.
- Contexto: solo se conoce la longitud maxima de entrenamiento (65.536 tokens); la ventana de contexto efectiva del modelo no esta declarada.
- Torre de vision no entrenada: se arrastra del modelo base y no fue objetivo del SFT de texto; su calidad no esta garantizada y, para servir solo texto, debe desactivarse explicitamente.
- Layout de claves no estandar: los 333 tensores de vision usan el layout plano `model.visual.*` orientado a verl/Megatron, lo que puede exigir adaptaciones en otras herramientas.
- Tokenizer modificado: los IDs 248077-248082 son criticos; usar un tokenizer distinto puede degradar o romper la generacion de atribucion.
- No se incluyen estados de optimizador ni de dataloader, por lo que no es posible reanudar el entrenamiento desde este export.
- Ausencia de validacion por la comunidad: 0 descargas y 0 likes en el momento de la consulta.
- Tool calling y uso como agente: no documentados, por lo que no deben asumirse en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HerrHruby/MR_midtrain_9B_v5_condgen
- Checkpoint predecesor con layout compatible: https://huggingface.co/HerrHruby/MR_midtrain_9B_v4_condgen
- Dataset de origen citado por el autor: `HerrHruby/MR_midtrain_V5_sft` (referenciado en la model card; no se proporciona URL directa en la informacion disponible)
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo: los enlaces recuperados corresponden a contenidos sin relacion (foros y comunidades sobre productos de telefonia), por lo que no se incluyen.
