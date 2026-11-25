# patrickbdevaney/GLM-5.3-Flash-REAP50-NVFP4

## Resumen

GLM-5.3-Flash-REAP50-NVFP4 es una compilación experimental del modelo multimodal GLM-5.3-Flash de Z.ai (zai-org), publicada por el usuario patrickbdevaney. Se trata de una poda del 50 % de los expertos enrutados (REAP, *Router-weighted Expert Activation Pruning*) seguida de una cuantización NVFP4 de los pesos de los expertos, manteniendo el resto de componentes en BF16. El resultado es un modelo de 161,7 mil millones de parámetros (frente a los 321,3 B del original) que ocupa 95,9 GiB en disco, lo que lo hace apto para dispositivos con 128 GB de memoria unificada.

La arquitectura subyacente es `Glm5NextForConditionalGeneration`, un transformer híbrido de 45 capas que combina 34 capas de atención lineal KDA con 11 capas de atención MLA con atención dispersa DSA, además de una torre de visión de 24 bloques. Conserva 144 de los 288 expertos enrutados por capa, con enrutamiento top-8 y un experto compartido, y mantiene la ventana de contexto de 1.048.576 tokens del modelo base.

Es relevante ahora porque demuestra la viabilidad de servir modelos MoE de gran tamaño en hardware de borde (Jetson AGX Thor), pero también porque su model card documenta de forma explícita un defecto de cuantización conocido y unos resultados de evaluación preocupantes en el sucesor v2: el modelo podado falla en completar entre el 44 % y el 72 % de las peticiones de conocimiento general e instrucciones. Esta versión concreta (v1) está marcada como obsoleta y no debe usarse.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Glm5NextForConditionalGeneration` (`glm5_next`): transformer híbrido con 34 capas de atención lineal KDA y 11 capas MLA con atención dispersa DSA; torre de visión de 24 bloques; hidden size 4096 |
| Parametros totales | 161.662.756.766 (161,7 B) tras la poda; el modelo base tiene 321,3 B |
| Parametros activos | no disponible (enrutamiento top-8 sobre 144 expertos enrutados + 1 compartido por capa) |
| Longitud de contexto | 1.048.576 tokens (`max_position_embeddings`) |
| Tipos de cuantizacion | NVFP4 weight-only (group size 16, escalas de grupo FP8 E4M3, escala global F32) en expertos enrutados y compartidos; BF16 en atención KDA/MLA, indexador DSA, capas densas 0-2, routers, embeddings, `lm_head`, torre de visión y pesos de hiperconexión |
| Idiomas soportados | no disponible |
| Licencia | MIT (heredada del modelo base) |
| Formato de pesos | `safetensors` con `compressed-tensors` (`nvfp4-pack-quantized`), 62 shards, 103.022.994.376 bytes (95,9 GiB) |

## Arquitectura y entrenamiento

El modelo base GLM-5.3-Flash emplea una arquitectura híbrida poco habitual: de las 45 capas decodificadoras, 34 usan atención lineal KDA y 11 usan MLA con atención dispersa DSA, lo que reduce el coste computacional del contexto largo frente a un transformer denso convencional. Las capas 0-2 son MLP densas y las capas 3-44 son MoE. Este build concreto aplica una poda REAP de primera pasada que elimina la mitad de los expertos enrutados (de 288 a 144 por capa) conservando el enrutamiento top-8 y el experto compartido. No se incluye el bloque MTP (multi-token prediction): no hay tensores de la capa 45 y `num_nextn_predict_layers` es 0.

La cuantización NVFP4 se aplicó sobre un maestro FP8 v1 antes de que se corrigiera la ganancia de *healing* de dicho maestro. Como consecuencia, la salida de cada experto retenido queda escalada por una ganancia de primer momento con mediana 0,69 cuando el valor medido es 0,9111, lo que hace que la vía MoE sea aproximadamente 0,76× demasiado pequeña en relación con la atención, los expertos compartidos y el *residual stream* en las 42 capas MoE. El maestro FP8 se corrigió el 2026-08-28 reescalando sus escalas de bloque, pero este repositorio nunca se corrigió. No se dispone de información sobre el dataset de entrenamiento ni sobre si hubo RLHF o DPO en el modelo base.

## Capacidades

- Generación de texto y razonamiento multilingüe heredados del modelo base GLM-5.3-Flash (idiomas concretos no disponibles).
- Procesamiento de imagen y texto (`pipeline_tag: image-text-to-text`), gracias a la torre de visión de 24 bloques.
- Generación de código: el sucesor v2 conserva el 94,8 % de la puntuación HumanEval+ del modelo sin podar, según la model card.
- Conversación multi-turno (`conversational`).
- Capacidad de contexto extremadamente largo: hasta 1.048.576 tokens.
- No se documenta soporte explícito de *tool calling*, *function calling* ni razonamiento agéntico multi-paso en la información disponible.
- No se documenta modo *thinking*, audio ni otras capacidades especiales.

## Casos de uso

- Despliegue en dispositivos de borde con 128 GB de memoria unificada: el tamaño de 95,9 GiB permite cargar el modelo en un Jetson AGX Thor, aunque la model card indica que el servidor CUDA del autor solo soporta los pesos v2, no estos.
- Procesamiento de documentos largos: la ventana de 1.048.576 tokens permite ingerir libros completos, expedientes o bases de código extensas en una sola pasada, sin necesidad de fragmentación.
- Análisis de imágenes con contexto textual extenso: la torre de visión combinada con el contexto largo permite tareas como descripción de diagramas técnicos acompañados de su documentación.
- Asistencia a la generación de código en entornos con restricciones de memoria: el modelo conserva buena parte de la capacidad de código del original (94,8 % de HumanEval+ en el v2), lo que lo hace útil para autocompletado en estaciones de trabajo con GPU de gran memoria.
- Investigación sobre poda de expertos y cuantización: sirve como referencia reproducible de una pipeline REAP + NVFP4, con métricas de acuerdo top-1 frente al modelo sin podar.
- Experimentación académica con arquitecturas híbridas KDA/MLA: permite estudiar el comportamiento de la atención lineal y la atención dispersa DSA en un modelo de 161,7 B con licencia MIT.
- No se recomienda su uso en producción para atención al cliente, asistentes generales ni tareas de instrucción, dado el defecto de cuantización documentado y la tasa de fallo observada en el sucesor v2.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks sobre estos pesos concretos en la información disponible. La model card indica explícitamente que este build nunca se ha evaluado ni servido. Los únicos datos disponibles corresponden al sucesor v2 y al modelo sin podar:

| Metrica | v2 NVFP4 | Modelo sin podar | Notas |
|---|---|---|---|
| HumanEval+ (retencion) | 94,8 % | 100 % | Puntuación relativa del v2 |
| MMLU-Pro | 44/100 | 84/100 | El v2 no completa entre el 44 % y el 72 % de las peticiones |
| IFBench | 32/100 | 56/100 | Mismo patrón de fallo |
| Acuerdo top-1 vs sin podar | 0,8386 | 1,0 | Acuerdo de token principal |
| Acuerdo en texto general | 0,580 | 1,0 | Métrica correlacionada con el fallo |
| Acuerdo en texto general (v1) | 0,572 | 1,0 | Inferior al v2, por lo que se espera un comportamiento igual o peor |

## Requisitos de hardware

- VRAM estimada: 95,9 GiB de pesos en disco; se necesita al menos 96 GB de memoria disponible para cargar los pesos, más overhead de activaciones y KV cache.
- GPU recomendadas: H100 de 80 GB (no cabe en una sola unidad), H200 de 141 GB, B200, o dispositivos con memoria unificada de 128 GB como el Jetson AGX Thor.
- No cabe en GPU de consumo: ni RTX 4090 (24 GB), ni RTX 5090 (32 GB), ni A100 de 40 GB. Requiere múltiples GPU o hardware de borde con memoria unificada.
- Opciones de despliegue: `transformers` con `compressed-tensors`; el autor menciona un servidor CUDA para Jetson AGX Thor que solo soporta los pesos v2. No hay builds GGUF para esta versión concreta (los GGUF existen para el v2 FP8 en `GLM-5.3-Flash-REAP50-GGUF`).
- Latencia y throughput: no disponibles. La model card indica que el build nunca se ha cargado en ningún runtime.
- Advertencia: el repositorio carece de `preprocessor_config.json` y `processor_config.json`, por lo que el pipeline `image-text-to-text` no puede inicializarse correctamente sin añadir esos ficheros.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision | Licencia | Estado |
|---|---|---|---|---|---|
| GLM-5.3-Flash-REAP50-NVFP4 (este) | 161,7 B | 1.048.576 | NVFP4 + BF16 | MIT | Obsoleto, con defecto conocido, no evaluado |
| GLM-5.3-Flash-REAP50-NVFP4-v2 | 161,7 B | 1.048.576 | NVFP4 + BF16 | MIT | Recomendado para 128 GB; falla en muchas tareas generales |
| GLM-5.3-Flash-REAP50-FP8-v2 | 161,7 B | 1.048.576 | FP8 | MIT | Maestro recomendado si hay memoria (160,6 GiB) |
| GLM-5.3-Flash (base) | 321,3 B | 1.048.576 | FP8 (305,8 GiB) | MIT | Sin podar, referencia de calidad |
| Unsloth UD-Q2_K_XL (GLM, sin podar) | no disponible | no disponible | GGUF Q2 | MIT | Mismo presupuesto de bytes, sin podar |

## Limitaciones y advertencias

- Defecto de cuantización conocido: la vía MoE está escalada aproximadamente 0,76× respecto a lo correcto en las 42 capas MoE, por una ganancia de primer momento errónea (0,69 frente a 0,9111). Este repositorio nunca se corrigió.
- El modelo está marcado como obsoleto por el propio autor: «superseded; do not use».
- Nunca se ha cargado en ningún runtime ni se ha evaluado. No hay quickstart ni soporte del servidor CUDA del autor.
- Faltan ficheros de preprocesador (`preprocessor_config.json`, `processor_config.json`), lo que impide usar el pipeline multimodal tal cual.
- No incluye bloque MTP, por lo que se pierde la decodificación especulativa multi-token del modelo base.
- El sucesor v2 falla en completar entre el 44 % y el 72 % de las peticiones de conocimiento general e instrucciones (MMLU-Pro 44 frente a 84; IFBench 32 frente a 56). Dado que el acuerdo en texto general de v1 (0,572) es inferior al de v2 (0,580), es previsible que este build se comporte igual o peor, aunque no se ha medido.
- Riesgo elevado de alucinación y de generaciones truncadas o incoherentes en tareas de conocimiento general.
- Idiomas soportados no documentados; no se puede garantizar calidad multilingüe.
- Licencia MIT permite uso comercial, pero la calidad del modelo en su estado actual hace desaconsejable su uso en producción.
- Sesgos conocidos del modelo base no documentados en la información disponible.

## Enlaces

- Repositorio de este modelo: https://huggingface.co/patrickbdevaney/GLM-5.3-Flash-REAP50-NVFP4
- Sucesor recomendado (v2 NVFP4): https://huggingface.co/patrickbdevaney/GLM-5.3-Flash-REAP50-NVFP4-v2
- Maestro FP8 v2: https://huggingface.co/patrickbdevaney/GLM-5.3-Flash-REAP50-FP8-v2
- Build FP8 v1: https://huggingface.co/patrickbdevaney/GLM-5.3-Flash-REAP50-FP8
- Builds GGUF: https://huggingface.co/patrickbdevaney/GLM-5.3-Flash-REAP50-GGUF
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- Licencia del modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash/blob/main/LICENSE
- Referencia GGUF sin podar de Unsloth: https://huggingface.co/unsloth/GLM
- Paper referenciado en los tags (arXiv:2510.13999): https://arxiv.org/abs/2510.13999
