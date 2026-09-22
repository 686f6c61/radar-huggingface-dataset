# DevelopingDad/Qwen3.8-27B-Uncensored-NVFP4-MSE-DGX-Spark

## Resumen

Qwen3.8-27B-Uncensored-NVFP4-MSE-DGX-Spark es un checkpoint cuantizado de precision mixta publicado por el usuario DevelopingDad sobre el modelo base `orcarouter/Qwen3.8-27B-Uncensored`, un derivado de Qwen3.8 con los rechazos eliminados (abliterated). No es un modelo entrenado desde cero: es una representacion PTQ (post-training quantization) generada con NVIDIA Model Optimizer (ModelOpt) aplicando la receta dense de precision mixta Qwen3.5 con calibracion MSE.

La relevancia del artefacto es de ingenieria de despliegue: esta optimizado y validado para inferencia local en una unica NVIDIA DGX Spark (GB10) con 128 GB de memoria unificada, sirviendo con SGLang y decodificacion especulativa DFlash2. Segun la model card, el sistema completo alcanza 34,821 tok/s de decodificacion en mediana (concurrencia 1, temperatura 0, thinking desactivado), un +90,5 % frente al sistema de referencia con el target FP8 original y el draft sin cuantizar.

La arquitectura es `Qwen3_5ForConditionalGeneration`, multimodal imagen-texto, con torre de vision, cabecera MTP (multi-token prediction) y tensores de estado Mamba/atencion lineal preservados de la cuantizacion. El contexto configurado es de 262.144 tokens, los idiomas declarados son ingles y chino, y la licencia es Apache 2.0. El repositorio tiene 21,9 GB y los safetensors declaran 18.164.649.200 parametros totales, cifra que no coincide con el "27B" del nombre del repositorio.

El aviso de seguridad es central: al ser un checkpoint abliterated, puede responder a peticiones daninas, poco eticas o ilegales, y el autor lo destina a investigacion controlada y evaluacion local con controles de acceso y moderacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Qwen3_5ForConditionalGeneration` (hibrida: atencion, atencion lineal/estado Mamba, torre de vision y cabecera MTP) |
| Parametros totales | 18.164.649.200 (18,16 B) segun safetensors; el nombre del repositorio indica 27B |
| Parametros activos | no aplica (receta dense, no MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | PTQ mixta ModelOpt: NVFP4 `W4A16_NVFP4` en 193 capas (proyecciones MLP y `lm_head`), FP8 en 208 proyecciones de atencion y atencion lineal; seleccion de escalas por MSE. La receta validada usa KV cache BF16 y estado Mamba BF16 (el export contiene metadatos FP8-KV, pero no se usan) |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, 3 shards |
| Tamano del repositorio | 21,9 GB |
| Modelo base | `orcarouter/Qwen3.8-27B-Uncensored` (revision `9878936be9458522b5aeed0e13476bb8426f57f0`) |
| Relacion con el base | quantized (derivado, no reentrenado) |
| Cuantizado por | DevelopingDad |
| Pipeline | image-text-to-text |
| Libreria | transformers |
| Fecha de publicacion | 2026-09-22 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El checkpoint parte del modelo padre `orcarouter/Qwen3.8-27B-Uncensored` en su revision inmutable `9878936be9458522b5aeed0e13476bb8426f57f0`. Sobre esa revision se aplico cuantizacion post-entrenamiento con NVIDIA Model Optimizer usando la receta dense de precision mixta Qwen3.5 y calibracion MSE. El layout de pesos resultante es `MIXED_PRECISION`: 193 capas en `W4A16_NVFP4` (incluidas proyecciones MLP y la cabeza `lm_head`) y 208 proyecciones de atencion y atencion lineal en FP8. Se preservan intactas la torre de vision, la cabecera MTP, las convoluciones y determinados tensores de estado hibrido.

La calibracion se realizo con 256 filas de texto y longitud de secuencia 2.048, con tamano de lote 1 y seleccion de escalas orientada a minimizar el error cuadratico medio. El estudio ModelOpt asociado produjo dos exportaciones, una calibrada por maximo y otra por MSE. La primera alcanzaba 33,88 tok/s pero fallo una comprobacion aritmetica (respondio 3463 en lugar de 3563) en la puerta de produccion, por lo que fue descartada; el artefacto MSE supero esa comprobacion y la puerta completa de serving, y es el unico promovido. No hay reentrenamiento, RLHF ni DPO en este repositorio: es exclusivamente una transformacion de pesos mas calibracion.

El resultado de velocidad declarado no depende solo de estos pesos: requiere el stack completo con SGLang sobre DGX Spark GB10, un modelo draft externo DFlash2 calibrado (`maurienne-ai/Qwen3.8-27B-DFlash2-NVFP4-RTNcal`, revision `bd7a934213c47a9e7ef69eef36bb3325f47fd1f1`, no incluido en este repositorio), profundidad especulativa 8, KV cache en BF16 y estado Mamba en BF16. Los manifiestos `WEIGHTS_SHA256SUMS` y `SOURCE_ARTIFACT_SHA256SUMS` permiten verificar la integridad de los shards y del resto de ficheros sin cambios.

## Capacidades

- Generacion de texto conversacional en ingles y chino.
- Razonamiento con modo thinking, controlable mediante el parser `qwen3` de SGLang (la medicion publicada se hizo con thinking desactivado).
- Procesamiento de imagen y texto (`image-text-to-text`), gracias a la torre de vision preservada de la cuantizacion.
- Function calling / tool calling, con parser de tool calls `qwen3_coder` soportado en el stack validado.
- Generacion de codigo en Python y otros lenguajes de programacion (el conjunto de validacion incluye listas de programacion y codigo Python).
- Razonamiento matematico basico: la puerta de calidad del autor incluye una comprobacion aritmetica concreta que el artefacto MSE supera.
- Decodificacion especulativa compatible mediante el algoritmo DFLASH con draft externo.
- Comportamiento sin rechazos (abliterated/refusal-removed) orientado a red-teaming e investigacion de seguridad.
- Prediccion multi-token a traves de la cabecera MTP preservada.

## Casos de uso

- Investigacion de seguridad y red-teaming: el modelo permite estudiar respuestas a peticiones que un modelo alineado rechazaria, en un entorno aislado y con registro de interacciones, que es exactamente el proposito declarado por el autor.
- Evaluacion de tecnicas de cuantizacion PTQ: sirve como caso de estudio reproducible de una receta ModelOpt mixta NVFP4/FP8 con calibracion MSE frente a la variante calibrada por maximo, comparando tok/s y acierto en tareas de verificacion.
- Pruebas de decodificacion especulativa en hardware Blackwell: permite medir el impacto de DFlash2 con profundidad 8 frente a un target FP8 sin cuantizar en un unico GB10.
- Benchmarking de serving con SGLang: el repositorio incluye el comando exacto con `--mem-fraction-static 0.80`, `--max-running-requests 4`, `--chunked-prefill-size 8192` y `--context-length 262144`, util para reproducir y comparar configuraciones.
- Asistente multimodal local sin conectividad: al ser un checkpoint de 21,9 GB que cabe en la memoria unificada de un DGX Spark, puede desplegarse en modo offline (`HF_HUB_OFFLINE=1`, `TRANSFORMERS_OFFLINE=1`) para analisis de imagenes y texto en entornos sin salida a internet.
- Generacion de codigo asistida con tool calling: puede integrarse en un servidor SGLang local con el parser `qwen3_coder` para pipelines de autocompletado o refactorizacion que necesiten invocar herramientas.
- Analisis de documentos largos en ingles o chino: la ventana de 262.144 tokens permite procesar expedientes o repositorios completos, aunque la validacion publicada se limito a 128 tokens de salida por peticion.
- Conjuntos de datos sinteticos para investigacion de robustez: al carecer de rechazos, puede generar ejemplos adversarios o contenido no filtrado destinado a entrenar clasificadores de moderacion, siempre bajo control humano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks academicos estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Los unicos datos de rendimiento publicados corresponden a una validacion de serving en una unica DGX Spark/GB10 con 128 GB de memoria unificada, carga de concurrencia 1, temperatura 0, thinking desactivado, 128 tokens de salida fijos, un calentamiento descartado y siete peticiones medidas.

| Sistema | Velocidad de decodificacion (mediana) | Rango |
|---|---:|---:|
| Referencia: target FP8 padre + DFlash2 sin cuantizar | 18,278 tok/s | registrado por separado |
| Sistema ganador: este target mixto + DFlash2 NVFP4 calibrado | 34,821 tok/s | 34,793-34,940 |
| Mejora extremo a extremo | +90,5 % | no disponible |

| Metrica adicional | Valor |
|---|---|
| TTFT mediana (referencia) | 0,2984 s |
| TTFT mediana (sistema ganador) | 0,1923 s |
| Mejora de TTFT | -35,6 % |
| Artefacto calibrado por maximo (descartado) | 33,88 tok/s, fallo aritmetico: 3463 en lugar de 3563 |

La model card menciona ademas una suite de cinco contenidos (lista de programacion, codigo Python, prosa de sistemas, matematicas resueltas y prosa en frances) como parte de la validacion, pero el texto disponible esta truncado y no se publican las puntuaciones de esa suite.

## Requisitos de hardware

- VRAM/memoria: los pesos ocupan unos 21 GB; la receta validada reserva el 80 % de la memoria unificada del dispositivo (`--mem-fraction-static 0.80`), es decir, aproximadamente 102 GB de los 128 GB del DGX Spark.
- GPU validada: una NVIDIA DGX Spark con GB10 y 128 GB de memoria unificada. Es el unico hardware con resultados publicados.
- GPU consumer: no disponible. No se documenta validacion en RTX 4090, RTX 5090 u otras tarjetas consumer. Los kernels NVFP4 y el backend FP8 `cutlass` usados en la receta apuntan a hardware Blackwell (GB10); no se documenta soporte en generaciones anteriores.
- Memoria de estado y cache: la receta validada exige `--kv-cache-dtype bfloat16`, `--mamba-ssm-dtype bfloat16`, `--mamba-full-memory-ratio 4.21`, `--mamba-radix-cache-strategy extra_buffer` y `--max-mamba-cache-size 20`, ademas de `--max-running-requests 4`.
- Modelo draft: se necesita un segundo modelo (DFlash2 NVFP4 calibrado, revision fijada) que no esta incluido en este repositorio y que consume memoria adicional no cuantificada en la documentacion disponible.
- Opciones de despliegue: SGLang, con la imagen exacta `lmsysorg/sglang@sha256:00205b89f74691f76a0ffbd6846376d9323971930a5d59bf63a65dadc7d67927` y los flags `--attention-backend flashinfer`, `--fp8-gemm-backend cutlass`, `--speculative-algorithm DFLASH`, `--speculative-num-draft-tokens 8`, `--reasoning-parser qwen3` y `--tool-call-parser qwen3_coder`. No se documenta despliegue con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput medidos: 34,821 tok/s de decodificacion (rango 34,793-34,940) y TTFT de 0,1923 s en el escenario de concurrencia 1 descrito. El throughput con mayor concurrencia no esta disponible.

## Comparativa con modelos similares

No se dispone de datos de terceros comparables (mismo tamano o misma tarea) en la informacion proporcionada. La unica comparacion documentada es interna al propio estudio de cuantizacion:

| Version | Precision | Velocidad de decodificacion | Puerta de calidad | Disponibilidad |
|---|---|---:|---|---|
| Este repositorio (MSE) | NVFP4 mixta + FP8 | 34,821 tok/s | Superada (aritmetica correcta y gate completo) | Publicado, 21,9 GB |
| Artefacto calibrado por maximo | NVFP4 mixta + FP8 | 33,88 tok/s | Rechazada (3463 en lugar de 3563) | No promovido |
| Base FP8 + DFlash2 sin cuantizar | FP8 | 18,278 tok/s | No disponible | Requiere el stack alternativo |

Respecto a otros modelos de la misma categoria (asistentes multimodales abliterated de ~18-27 B con contexto largo), no hay parametros, contexto, rendimiento ni licencia comparables publicados en la informacion disponible.

## Limitaciones y advertencias

- El checkpoint padre es abliterated (refusal-removed): puede cumplir peticiones daninas, poco eticas o ilegales. El autor lo declara explicitamente no apto para todas las audiencias (`not-for-all-audiences`) y exige controles de acceso, moderacion y prevencion de abuso antes de cualquier despliegue orientado a usuarios.
- Riesgo de alucinacion: no se han publicado evaluaciones de veracidad ni de tasa de alucinacion. La unica comprobacion factual documentada es una operacion aritmetica concreta.
- La validacion de rendimiento se limita a un escenario muy estrecho: concurrencia 1, temperatura 0, thinking desactivado, 128 tokens de salida y siete peticiones medidas. No hay datos de rendimiento con lotes grandes, thinking activado o salidas largas.
- Los 34,821 tok/s dependen de un modelo draft externo, una imagen Docker concreta y flags especificos; sin ese stack, el rendimiento no esta garantizado.
- Contexto declarado de 262.144 tokens, pero la calibracion uso secuencias de 2.048 tokens; no se documenta la calidad en ventanas muy largas.
- Idiomas limitados a ingles y chino; no hay soporte declarado de castellano ni de otros idiomas, aunque la suite de validacion menciona prosa en frances.
- Discrepancia de nomenclatura: el repositorio se llama "27B" pero los safetensors declaran 18.164.649.200 parametros totales. Conviene verificar el recuento real antes de planificar recursos.
- Licencia Apache 2.0: permite uso comercial segun los terminos de la licencia, pero la propia model card advierte que el uso comercial sin moderacion puede derivar en abuso; la responsabilidad recae en el desplegador.
- La model card disponible esta truncada, por lo que parte de la validacion (suite de cinco contenidos) no puede verificarse con el texto proporcionado.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, y el autor no es el desarrollador original del modelo base; se trata de un derivado de terceros con fecha de publicacion de 2026-09-22.
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo: los resultados obtenidos corresponden a paginas genericas de ChatGPT y OpenAI, sin relacion con el artefacto.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/DevelopingDad/Qwen3.8-27B-Uncensored-NVFP4-MSE-DGX-Spark
- Modelo base: https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored
- Revision del modelo base: https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored/tree/9878936be9458522b5aeed0e13476bb8426f57f0
- Modelo draft DFlash2 (externo, no incluido): https://huggingface.co/maurienne-ai/Qwen3.8-27B-DFlash2-NVFP4-RTNcal
- NVIDIA Model Optimizer (ModelOpt): https://github.com/NVIDIA/Model-Optimizer
- Guia de serving del autor: `SERVING.md` en el repositorio
- Manifiesto de integridad de pesos: `WEIGHTS_SHA256SUMS` en el repositorio
- Manifiesto del artefacto fuente: `SOURCE_ARTIFACT_SHA256SUMS` en el repositorio
- Imagen SGLang validada: `lmsysorg/sglang@sha256:00205b89f74691f76a0ffbd6846376d9323971930a5d59bf63a65dadc7d67927`
- Paper del modelo base: no disponible
- Blog o demo oficial: no disponible
- Resultados de busqueda web relevantes: no disponible
