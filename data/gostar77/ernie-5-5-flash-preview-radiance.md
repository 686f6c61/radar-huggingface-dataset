# gostar77/ERNIE-5.5-Flash-Preview-radiance

## Resumen

ERNIE-5.5-Flash-Preview-radiance es un contenedor en formato `.rad` del modelo `baidu/ERNIE-5.5-Flash-Preview`, publicado por el usuario gostar77 y pensado para su uso con Radiance, un runtime de inferencia alternativo a Transformers, GGUF o safetensors. No se trata de un checkpoint nuevo ni de un fine-tuning: es una conversion de formato de los pesos oficiales de Baidu, generada con la herramienta `rad-convert` el 24 de noviembre de 2026 a partir del checkpoint preview.

El modelo subyacente es un Mixture-of-Experts de 280.000 millones de parametros totales con aproximadamente 14.000 millones activos, 512 expertos enrutados con top-10, contexto de 1 millon de tokens, pesos de expertos en MXFP4 y tronco en block-FP8. El contenedor preserva esos bytes y anade un drafter DSpark para decodificacion especulativa, con 47.759 tensores en total y un tamano de repositorio de 166,0 GB.

Su relevancia es doble: por un lado expone un modelo de contexto millonario y arquitectura MoE dispersa, y por otro demuestra un flujo de despliegue alternativo (Radiance con plugin `ernie55`) que integra decodificacion especulativa nativa y paralelismo de tensores. La licencia es Apache-2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE), arquitectura `ernie55`, formato `RAD2` little-endian |
| Parametros totales | 280.000 millones (280B) |
| Parametros activos | Aproximadamente 14.000 millones (14B) |
| Longitud de contexto | 1.000.000 tokens (1M) |
| Tipos de cuantizacion | Expertos en MXFP4; tronco en block-FP8; algunos tensores concretos en bf16 y f32 (`attn_kv_a_rope`, `attn_kv_b` a bf16; tablas `fn` de mHC a f32; `dspark.markov_w1` a bf16) |
| Idiomas soportados | Ingles (en) y chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | Contenedor `.rad` propietario de Radiance (no es safetensors, ni GGUF, ni checkpoint de Transformers) |

## Arquitectura y entrenamiento

El modelo base es un transformer con capas MoE de enrutamiento disperso: 512 expertos con activacion top-10, lo que da una relacion de activacion de aproximadamente el 5 por ciento de los parametros totales (14B de 280B). Los pesos de los expertos se almacenan en MXFP4 y el tronco en block-FP8, una combinacion orientada a reducir huella de memoria manteniendo precision aceptable en las partes sensibles. El contexto declarado es de 1 millon de tokens.

El contenedor incorpora un drafter DSpark para decodificacion especulativa que propone bloques de 7 tokens y accede a las capas 40, 41 y 42 del tronco (`dspark_block_size` = 7, `dspark_noise_token_id` = 1024). La herramienta `rad-convert` no recuantiza los expertos: solo convierte el tipo de almacenamiento de unos pocos tensores auxiliares (`attn_kv_a_rope` y `attn_kv_b` a bf16, tablas `fn` de mHC a f32, `dspark.markov_w1` a bf16). No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO en la informacion proporcionada.

## Capacidades

- Generacion de texto con contexto de hasta 1 millon de tokens, adecuada para documentos extensos y conversaciones de muy largo recorrido.
- Modo de razonamiento explicito mediante la plantilla nativa `<ernie:think>`, que permite separar el razonamiento interno de la respuesta final.
- Tool calling y function calling a traves de la plantilla nativa `<ernie:tool_call>`.
- Soporte de agentes y razonamiento multi-paso, gracias a la combinacion de tool calling y contexto largo.
- Capacidades multilingues limitadas a ingles y chino segun los metadatos del modelo.
- Decodificacion especulativa integrada (DSpark) para acelerar la generacion en el runtime Radiance.
- No se declaran capacidades de vision, audio ni otras modalidades en la informacion disponible.

## Casos de uso

- Atencion al cliente automatizada: el contexto de 1M tokens permite mantener historiales de conversacion muy largos y adjuntar documentacion de producto completa sin truncar, con tool calling para consultar sistemas internos.
- Analisis de repositorios y documentacion tecnica: el modelo puede procesar bases de codigo o manuales extensos en una sola ventana y responder preguntas cruzadas sobre ellos.
- Agentes autonomos de multiple paso: la plantilla `<ernie:tool_call>` y el modo `<ernie:think>` permiten orquestar flujos donde el modelo planifica, invoca herramientas y revisa resultados antes de responder.
- Generacion y revision de codigo en pipelines: integrable como servicio de inferencia mediante Radiance con paralelismo de tensores, util para tareas de refactorizacion o explicacion de fragmentos largos.
- Procesamiento de expedientes o contratos extensos: la ventana de 1M tokens permite cargar documentos juridicos o financieros completos y extraer clausulas, resumenes o discrepancias.
- Asistentes bilingues ingles-chino: para equipos o productos que operan en ambos idiomas, el modelo cubre las dos lenguas declaradas sin necesidad de modelos separados.
- Investigacion sobre decodificacion especulativa: el contenedor sirve como banco de pruebas para evaluar el drafter DSpark y el rendimiento de Radiance frente a otros runtimes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el contenedor ocupa 166,0 GB en disco (154,59 GiB); en inferencia, con expertos en MXFP4 y tronco en block-FP8, se requiere un pool de memoria agregado del orden de esa cifra, distribuible entre GPUs.
- Configuracion recomendada: el ejemplo de serving del autor usa `tp: 2` con `tp-wire: exact`, es decir, dos GPUs con paralelismo de tensores; el modelo declara soporte tambien para tp 1, 3 y 4.
- GPU recomendadas: no se especifican modelos concretos en la informacion disponible; por volumen de memoria, se necesitan GPUs de centro de datos (A100, H100 o equivalentes) en configuracion multi-GPU.
- No cabe en GPUs de consumo: 166 GB exceden con holgura la VRAM de una RTX 4090 (24 GB) o similares.
- Opciones de despliegue: exclusivamente Radiance con el plugin `ernie55` y los kernels `libr4d`; no es compatible con vLLM, llama.cpp, Ollama ni TGI al no ser safetensors ni GGUF.
- Decodificacion especulativa: `--num-speculative-tokens` en `auto` resuelve a 7 (tamano de bloque del drafter); `0` desactiva el drafter; cualquier otro valor positivo es rechazado.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| ERNIE-5.5-Flash-Preview-radiance | 280B | ~14B | 1M | Apache-2.0 | `.rad` (Radiance) |
| baidu/ERNIE-5.5-Flash-Preview | 280B | ~14B | 1M | Apache-2.0 | Checkpoint oficial (no detallado) |
| Otros MoE de gran escala con contexto largo | no disponible | no disponible | no disponible | no disponible | no disponible |

La unica comparacion directa posible con la informacion disponible es frente al checkpoint oficial del que deriva: mismos parametros, misma ventana de contexto y misma licencia, con la diferencia de formato, la inclusion del drafter DSpark y la dependencia del runtime Radiance. No se dispone de datos de rendimiento para comparar con alternativas de la misma categoria.

## Limitaciones y advertencias

- Dependencia total del runtime Radiance con el plugin `ernie55`: no funciona en ecosistemas estandar como Transformers, vLLM, llama.cpp, Ollama o TGI.
- El drafter DSpark solo admite profundidades de 7 o 0; no se puede ajustar a otros valores, lo que limita el tuning fino del equilibrio latencia-calidad.
- Idiomas limitados a ingles y chino; el rendimiento en castellano no esta documentado y probablemente sea inferior.
- Riesgo de alucinacion inherente a los modelos generativos, agravado en contextos de 1M tokens donde la recuperacion de informacion relevante puede degradarse.
- No se han publicado benchmarks ni evaluaciones de sesgo en la informacion disponible, por lo que no es posible cuantificar su calidad relativa.
- El repositorio registra 0 descargas y 0 likes, y fue creado y actualizado el mismo dia (25 de noviembre de 2026): es un artefacto reciente y sin validacion comunitaria.
- La licencia Apache-2.0 la hereda del modelo base; el contenedor no otorga derechos adicionales. Es responsabilidad del usuario verificar los terminos upstream de Baidu para uso comercial.
- El tamano de 166 GB y la necesidad de multiples GPUs implican un coste de despliegue elevado y descartan entornos de desarrollo con hardware limitado.
- Al ser una preview del modelo base, puede presentar inestabilidades o cambios de comportamiento no documentados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gostar77/ERNIE-5.5-Flash-Preview-radiance
- Modelo base: https://huggingface.co/baidu/ERNIE-5.5-Flash-Preview
