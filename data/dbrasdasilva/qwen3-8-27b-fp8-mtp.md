# dbrasdasilva/Qwen3.8-27B-FP8-MTP

## Resumen

Qwen3.8-27B-FP8-MTP es una reconstruccion cuantizada del modelo multimodal Qwen/Qwen3.8-27B, publicada por el usuario dbrasdasilva. No es un modelo entrenado desde cero: es un checkpoint derivado que conserva intactos dos componentes que habitualmente se pierden en las cuantizaciones agresivas, la torre de vision (333 tensores en BF16) y la cabeza MTP de decodificacion especulativa (15 tensores en BF16), y que aplica cuantizacion FP8 E4M3 al resto del cuerpo del transformer. El resultado ocupa 30 GB en disco frente a los 55,6 GB del modelo base en bf16, con 27.781.427.952 parametros totales.

La arquitectura del modelo base es un transformer hibrido con 64 capas: 16 usan atencion completa (y por tanto mantienen cache KV) y 48 usan gated-delta linear attention (sin cache KV). El checkpoint incorpora escalas `k_scale`/`v_scale` calibradas para las 16 capas con atencion completa, un detalle poco frecuente que evita que el servicio con `--kv-cache-dtype fp8` opere silenciosamente con factor de escala 1.0. El modelo esta pensado para el camino nativo de cuantizacion de NVIDIA en GPUs Blackwell (SM120), exportado en formato `modelopt`.

Su relevancia practica esta en el despliegue: con una sola RTX PRO 6000 Blackwell de 96 GB, el autor reporta 1,62 millones de tokens de cache KV y 6,19x de concurrencia a 262.144 tokens de contexto, con decodificacion especulativa MTP activa. Cubre 11 idiomas (incluido el espanol) y licencia Apache 2.0, lo que lo hace candidato directo para inferencia en produccion de cargas multimodales con contexto muy largo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido multimodal (clase `Qwen3_5ForCausalLM`): 64 capas, 16 de atencion completa y 48 de gated-delta linear attention; torre de vision + cabeza MTP |
| Parametros totales | 27.781.427.952 (~27,8 B) |
| Parametros activos | No aplica (no se indica que el modelo base sea MoE) |
| Longitud de contexto | 262.144 tokens en la configuracion de servicio verificada (`--max-model-len 262144`); maximo nativo del modelo base: no disponible |
| Tipos de cuantizacion | FP8 E4M3 en proyecciones de atencion y MLP (64 capas) y en cache KV (con `k_scale`/`v_scale` calibradas); BF16 en torre de vision, cabeza MTP, `lm_head`, normas de `linear_attn`, `in_proj_a/b` y `conv1d` |
| Idiomas soportados | Ingles, chino, japones, coreano, frances, aleman, espanol, italiano, portugues, ruso y arabe (11) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors con metadatos de cuantizacion `modelopt` (libreria `transformers`) |
| Tamano en disco | 30 GB (repo de 31,2 GB); base bf16: 55,6 GB |
| Calibracion | `nvidia-modelopt` 0.43.0, dataset `neuralmagic/calibration` (split LLM), 64 muestras, seqlen 8192, 2140 cuantizadores insertados, ~38 s de GPU |
| Decodificacion especulativa | MTP (multi-token prediction) con `num_speculative_tokens: 3` |
| Entorno verificado | vLLM 0.30.0 (imagen oficial), driver 615.71.09, RTX PRO 6000 Blackwell 96 GB |

## Arquitectura y entrenamiento

Este checkpoint no implica entrenamiento nuevo: es una cuantizacion post-entrenamiento (PTQ) del modelo base Qwen/Qwen3.8-27B. El autor parte del peso bf16 original, no de otro checkpoint ya cuantizado, e inserta 2140 cuantizadores con `nvidia-modelopt` 0.43.0 sobre torch 2.14.1+cu130 y transformers 5.18.0. La calibracion se realizo con 64 muestras de 8192 tokens del split LLM de `neuralmagic/calibration`, con aproximadamente 38 segundos de tiempo de GPU. El plan de precision se tomo del `quantization_config` publicado por `unsloth/Qwen3.8-27B-NVFP4` y se corrigio en dos puntos: `lm_head` se movio fuera del nivel FP8 y se anadieron los `*[kv]_bmm_quantizer` de `FP8_KV_CFG` para obtener escalas KV calibradas.

El detalle arquitectonico mas relevante es la mezcla de mecanismos de atencion: 48 de las 64 capas usan gated-delta linear attention y no mantienen cache KV, mientras que solo 16 capas usan atencion completa. Eso explica que con 96 GB de VRAM quepan 1.622.656 tokens de cache a contexto maximo. La cabeza MTP no es un modulo vivo durante la calibracion, por lo que se injerto de vuelta como tensores bf16 crudos tras la exportacion; sin ese injerto la decodificacion especulativa no funcionaria. La torre de vision (333 tensores) queda sin cuantizar, de modo que el encoder visual no sufre degradacion por calibracion de texto. La calibracion de las capas de lenguaje es exclusivamente textual, una limitacion compartida por todas las cuantizaciones publicas de VLM calibradas con texto.

## Capacidades

- Generacion de texto y razonamiento con modo de pensamiento explicito: el modelo produce un bloque de razonamiento previo a la respuesta final (compatible con `--reasoning-parser qwen3`).
- Comprension de imagen y texto (`image-text-to-text`): la ruta de vision fue verificada por inferencia real, no solo por inspeccion de ficheros.
- Tool calling y function calling nativos: el ejemplo de servicio activa `--enable-auto-tool-choice` con el parser `qwen3_coder`.
- Decodificacion especulativa mediante cabeza MTP, con 3 tokens especulativos por paso configurados en la validacion.
- Capacidades multilingues en 11 idiomas: en, zh, ja, ko, fr, de, es, it, pt, ru, ar.
- Conversacion multi-turno con ventana de contexto de hasta 262.144 tokens en la configuracion verificada.
- Soporte de cache KV en FP8 con escalas calibradas, lo que permite servir contextos largos con menor huella de memoria.
- Compatible con endpoints gestionados (`endpoints_compatible` en los tags del repo).

## Casos de uso

- Atencion al cliente automatizada con historial largo: gracias a los 262.144 tokens de contexto servidos y al soporte multi-turno, se puede mantener el historial completo de una incidencia sin resumir ni truncar, evitando perdidas de informacion en conversaciones extensas.
- Analisis de documentos con imagenes: al conservar la torre de vision sin cuantizar, el modelo puede procesar capturas, diagramas o facturas escaneadas junto al texto asociado, un escenario tipico de back office financiero o legal.
- Agentes de codigo con tool calling: la combinacion de `--enable-auto-tool-choice`, el parser `qwen3_coder` y el modo de razonamiento permite encadenar pasos de edicion, ejecucion de tests y consulta de repositorios dentro de pipelines de CI/CD.
- Asistentes de investigacion multilingues: con 11 idiomas soportados, resulta util para revision de literatura en ingles, chino, japones, aleman o ruso con respuestas en espanol, sin cambiar de modelo por idioma.
- Procesamiento de contextos masivos (legal, auditoria, compliance): 1,62 millones de tokens de cache KV en una sola GPU de 96 GB permiten cargar expedientes completos o bases documentales extensas en una unica ventana.
- RAG de alta concurrencia: los 6,19x de concurrencia medidos a contexto maximo lo hacen viable para servir varias peticiones simultaneas de recuperacion aumentada sin replicar el modelo en varias GPUs.
- Extraccion estructurada de informacion en produccion: el modo de razonamiento mas el tool calling permite validar esquemas y encadenar llamadas a funciones antes de emitir la salida final.
- Transcripcion semantica de imagenes tecnicas: descripcion de diagramas de arquitectura, planos o graficos para generar documentacion o alt-text en catalogo de producto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K, MMMU ni de ninguna otra evaluacion estandar, y tampoco se ofrece comparacion numerica con el modelo base en bf16. Los unicos datos de rendimiento aportados son de despliegue, no de calidad:

| Metrica de despliegue | Valor |
|---|---|
| Tiempo de carga de pesos | ~14 s |
| Tokens de cache KV | 1.622.656 |
| Concurrencia a 262 k de contexto | 6,19x |
| Tiempo de calibracion (construccion) | ~38 s de GPU |
| Duracion total del proceso de cuantizacion | ~90 s en la GPU empleada (excluyendo la descarga de 55,6 GB del base) |

## Requisitos de hardware

- VRAM para pesos: aproximadamente 30 GB en FP8, segun el tamano en disco reportado. Es una cifra de pesos; hay que sumar el overhead del runtime (activaciones, buffers de CUDA graphs y metadatos).
- GPU verificada: NVIDIA RTX PRO 6000 Blackwell 96 GB, con `--gpu-memory-utilization 0.95`, driver 615.71.09. Es la unica configuracion medida por el autor.
- GPU profesionales de 80 GB (A100 80 GB, H100 80 GB): capacidad suficiente para los pesos y para cache KV en FP8, aunque no hay validacion publicada en la informacion disponible.
- GPU de 48 GB (L40S, A6000): probablemente viables solo con contexto reducido, dado que los pesos ya consumen ~30 GB. Estimacion propia a partir del tamano en disco, no verificada.
- GPU de consumo: no cabe en 24 GB (RTX 3090, RTX 4090), porque los pesos FP8 por si solos superan ese limite. En 32 GB (RTX 5090) el margen es minimo y no dejaria espacio practico para cache KV a contexto largo. Estimacion, no verificada.
- Despliegue recomendado: vLLM 0.30.0 o superior (imagen oficial), con `--trust-remote-code --quantization modelopt --kv-cache-dtype fp8` y `--speculative-config '{"method":"mtp","num_speculative_tokens":3}'`.
- Ruta nativa: la exportacion en formato `modelopt` esta orientada a NVIDIA Blackwell / SM120. No se documenta soporte en llama.cpp, Ollama, TGI ni conversiones GGUF en la informacion disponible.
- Latencia y throughput: no disponibles. El unico dato temporal publicado es el tiempo de carga de pesos (~14 s). No se publican tokens/s ni latencia por peticion.

## Comparativa con modelos similares

| Modelo | Parametros | Precision | Vision | MTP | Contexto servido | Licencia | Notas |
|---|---|---|---|---|---|---|---|
| dbrasdasilva/Qwen3.8-27B-FP8-MTP (este) | 27,8 B | FP8 E4M3 (MLP y atencion) + BF16 en vision, MTP y `lm_head` | Si, BF16 sin cuantizar | Si | 262.144 tokens (verificado) | Apache 2.0 | 30 GB en disco; escalas KV calibradas |
| dbrasdasilva/Qwen3.8-27B-NVFP4-MTP | 27,8 B (mismo base) | NVFP4 en MLP, resto identico | Si | Si | no disponible | no disponible | Misma calibracion y mismo build; solo cambia la precision del MLP, por lo que la comparacion aisla ese factor |
| nvidia/Qwen3.8-27B-NVFP4 | no disponible | NVFP4, con `lm_head` tambien en NVFP4 | no disponible | no disponible | no disponible | no disponible | Sirve como referencia de que vLLM carga un `lm_head` cuantizado en esta arquitectura |
| Qwen/Qwen3.8-27B (base) | 27,8 B | bf16 (55,6 GB de descarga) | Si, nativa | Si, nativa | no disponible | no disponible | Referencia sin degradacion por cuantizacion; requiere ~2x el espacio en disco |
| unsloth/Qwen3.8-27B-NVFP4 | no disponible | NVFP4 | no disponible | no disponible | no disponible | no disponible | Fuente del plan de precision empleado en este build |

No se dispone de comparativas de calidad (benchmarks) entre estas variantes en la informacion proporcionada; la unica diferencia documentada entre FP8 y NVFP4 dentro del mismo autor es la precision del MLP, con calibracion y base identicas.

## Limitaciones y advertencias

- Calibracion exclusivamente textual: las capas de lenguaje cuantizadas se calibraron con 64 muestras de texto, no con pares imagen-texto. La torre de vision no esta cuantizada y por tanto no se ve afectada, pero la interaccion vision-lenguaje no fue calibrada especificamente.
- Escalas de atencion incompletas: el checkpoint incluye `k_scale` y `v_scale`, pero no `q_scale` ni `prob_scale`. vLLM sustituye `k_scale` por `q_scale` y emite el aviso de `uncalibrated q_scale 1.0 and/or prob_scale 1.0 with fp8 attention`. No hay datos de impacto en calidad.
- Requisito estricto de coherencia config-pesos: si `quantization_config.ignore` no coincide con los tensores realmente cuantizados, vLLM rechaza la carga. El autor documento un fallo real de este tipo (`ValueError: There is no module or parameter named 'lm_head.input_scale'`). Cualquier edicion manual del checkpoint debe mantener esa coherencia.
- Consumo del presupuesto de tokens por razonamiento: con `--reasoning-parser qwen3`, el bloque de pensamiento cuenta contra `max_tokens`. Con un limite de 64 tokens, todo el presupuesto se consumio en razonamiento y el campo `content` volvio `null`. El propio autor recomienda 256 tokens o mas.
- Dependencia de hardware: la ruta `modelopt` esta orientada a NVIDIA Blackwell / SM120. No se documenta funcionamiento en GPUs no Blackwell ni en runtimes distintos de vLLM en la informacion disponible.
- Riesgo de alucinacion: no disponible. No se publican evaluaciones de fidelidad, tasas de alucinacion ni analisis de sesgos, ni para este checkpoint ni para el modelo base en la informacion proporcionada.
- Sesgos conocidos: no disponible. La model card no documenta analisis de sesgo, aunque la cobertura de 11 idiomas sugiere un sesgo de rendimiento distinto segun idioma, sin datos que lo cuantifiquen.
- Sin benchmarks ni validacion de la comunidad: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, y no aporta resultados de evaluacion. Es un artefacto reciente sin verificacion independiente.
- Cobertura de idiomas con posible asimetria: los 11 idiomas declarados (incluido el espanol) proceden de los metadatos del modelo base; no hay metricas por idioma para el checkpoint cuantizado.
- Licencia: Apache 2.0, que permite uso comercial. Aun asi, conviene verificar la licencia del modelo base Qwen/Qwen3.8-27B, no disponible en la informacion proporcionada, y las condiciones de uso derivadas de un checkpoint cuantizado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dbrasdasilva/Qwen3.8-27B-FP8-MTP
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Build complementaria (NVFP4, misma calibracion): https://huggingface.co/dbrasdasilva/Qwen3.8-27B-NVFP4-MTP
- Build NVFP4 de NVIDIA sobre la misma arquitectura: https://huggingface.co/nvidia/Qwen3.8-27B-NVFP4
- Build NVFP4 de Unsloth (fuente del plan de precision): https://huggingface.co/unsloth/Qwen3.8-27B-NVFP4
- Dataset de calibracion: https://huggingface.co/datasets/neuralmagic/calibration
