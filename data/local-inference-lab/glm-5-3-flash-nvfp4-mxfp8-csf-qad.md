# local-inference-lab/GLM-5.3-Flash-NVFP4-MXFP8-CSF-QAD

## Resumen

GLM-5.3-Flash-NVFP4-MXFP8-CSF-QAD es un checkpoint cuantizado publicado por local-inference-lab sobre el modelo base GLM-5.3-Flash-NVFP4. No es un modelo entrenado desde cero: es una build que fija en el propio checkpoint todas las decisiones de precision del despliegue, de manera que el servidor no necesita convertir pesos en tiempo de carga. Combina expertos enrutados en NVFP4, atencion y expertos compartidos en MXFP8, y comprime sin perdida las escalas de bloque E4M3 de los expertos enrutados con un codec CSF propio.

El repositorio ocupa 178,5 GB y contiene 44 shards de safetensors, 574 capas cuantizadas segun la configuracion ModelOpt MIXED_PRECISION y un contenedor con manifiesto, contrato de build, recibos y verificacion SHA-256 de reconstruccion exacta de cada shard de origen. Esta pensado para servirse con vLLM mediante el decodificador NVFP4-CSF (imagenes beta Karmic Kraken) sobre hardware Blackwell, con decodificacion especulativa MTP.

Su relevancia es doble: por un lado evita conversiones en tiempo de carga y reduce el espacio de las escalas de 19,03 GB a 9,83 GB; por otro, documenta de forma verificable la procedencia exacta de cada grupo de precision, algo poco habitual en checkpoints cuantizados. La medicion publicada sobre 2x RTX PRO 6000 Blackwell Max-Q da 83,2 GiB de memoria de modelo por GPU, unos 170 tok/s en decodificacion a concurrencia 1 y 490-540 tok/s a concurrencia 8. No se publican parametros totales, contexto maximo ni benchmarks estandar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (expertos enrutados y compartidos) con atencion MLA e indexer (KDA) y capa MTP; modelo base GLM-5.3-Flash |
| Parametros totales | no disponible |
| Parametros activos | no disponible (el modelo es MoE, pero la model card no indica el numero) |
| Longitud de contexto | no disponible (se publican medidas de prefill a 32K de contexto) |
| Tipos de cuantizacion | NVFP4 en expertos enrutados (grupo W4A16), MXFP8 (valores E4M3, escala UE8M0 por bloque de 32) en atencion y expertos compartidos; escalas de bloque E4M3 de expertos enrutados comprimidas con CSF sin perdida |
| Idiomas soportados | ingles (en) y chino (zh) |
| Licencia | MIT |
| Formato de pesos | safetensors (44 shards) en contenedor `lil-nvfp4-csf-checkpoint/1`; escalas comprimidas en CSF (`byte-window4-fixed-stream-u24-exceptions/1`) |

## Arquitectura y entrenamiento

El modelo base GLM-5.3-Flash-NVFP4 es una mezcla de expertos con proyecciones de expertos enrutados y expertos compartidos, atencion con MLA e indexer (etiquetada como KDA en la model card) y una capa de multi-token prediction (MTP) en la capa 45. Este repositorio no entrena nada: recompone un checkpoint con decisiones de precision heterogeneas. Los expertos enrutados proceden sin cambios del checkpoint QAD (quantization-aware distillation) de `local-inference-lab/GLM-5.3-Flash-NVFP4`, revision `mtp-bf16` (`cfd47bd7680e68408924df09b179d5bed25b2ae9`). Las 531 proyecciones MXFP8 se cuantizaron a partir de los pesos BF16 del checkpoint QAD con `mxfp8_e4m3_quantize` de vLLM, reproduciendo los valores que produce la ruta MXFP8 online de vLLM. Los expertos enrutados de la capa MTP se cuantizaron desde los expertos MTP BF16 del checkpoint QAD con el cuantizador NVFP4 MoE online de vLLM (`_quantize_moe_weight_to_nvfp4`).

La innovacion tecnica principal es el codec CSF aplicado a las escalas de bloque E4M3 de los expertos enrutados: 36.288 matrices de escalas que ocupaban 19,03 GB se almacenan en 9,83 GB, con reconstruccion exacta registrada en `verification.json` mediante SHA-256 de los ficheros originales y reconstruidos. La configuracion de cuantizacion es ModelOpt `MIXED_PRECISION` con 574 capas cuantizadas. No se detalla el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO; esa informacion corresponde al modelo base y no se incluye en la model card de este repositorio. La model card tampoco cuantifica el coste del proceso QAD heredado.

## Capacidades

- Generacion de texto conversacional en ingles y chino; el repositorio incluye tokenizer, chat template y generation config.
- Razonamiento y generacion de codigo: no documentado de forma explicita en la informacion disponible, aunque son capacidades esperables del modelo base.
- Aritmetica exacta en prompts tipo checksum: la model card describe la ejecucion de los expertos enrutados como W4A16 con combinacion de pesos de router en FP32 (`VLLM_B12X_MOE_FP4_FORCE_A16=1`, `B12X_W4A16_FP32_TOPK_WEIGHTS=1`) precisamente para este tipo de tarea.
- Decodificacion especulativa mediante la capa MTP, configurada con 3 tokens especulativos en las mediciones publicadas.
- Contexto largo: se reporta prefill a 32K de contexto, coherente con la atencion MLA e indexer del modelo base.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Vision, audio u otras modalidades: no disponible; el pipeline declarado es text-generation.

## Casos de uso

- Servicio de chat multilingue en ingles y chino a alta concurrencia: con 490-540 tok/s de decodificacion a concurrencia 8 sobre 2x RTX PRO 6000 Blackwell Max-Q, es una configuracion viable para endpoints de chat con varias sesiones simultaneas.
- Despliegue con prefill largo para RAG sobre documentacion extensa: los 7,6K tok/s de prefill a 32K de contexto permiten procesar prompts largos con documentacion adjunta sin cuellos de botella severos.
- Verificacion de integridad en contextos largos: la tarea needle-checksum descrita en la model card (500 prompts identicos de 8K a temperatura 0) es directamente aplicable a evaluar la fidelidad de recuperacion de informacion en el contexto.
- Pipelines de cuantizacion reproducibles: `manifest.json`, `build-contract.json`, `receipts/` y `verification.json` permiten auditar la procedencia de cada grupo de precision y verificar la reconstruccion bit a bit de los shards, util en entornos con requisitos de trazabilidad.
- Investigacion sobre cuantizacion NVFP4/MXFP8: el checkpoint aisla el efecto de cada eleccion de precision (expertos enrutados frente a atencion y expertos compartidos) y permite comparar contra la variante con atencion y compartidos en BF16.
- Reduccion de huella de almacenamiento en despliegues con muchos checkpoints: la compresion CSF de escalas reduce el espacio de escalas de 19,03 GB a 9,83 GB dentro de un repositorio de 178,5 GB.
- Inferencia con decodificacion especulativa: la capa MTP con 3 tokens especulativos es aprovechable en escenarios de baja latencia por token a concurrencia 1 (unos 170 tok/s).
- Sustitucion de la ruta de cuantizacion en linea: al venir todas las precisiones fijadas en el checkpoint, se elimina el coste de conversion en el arranque del servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La model card solo incluye mediciones de despliegue y una prueba de fidelidad propia, recogidas en la siguiente tabla.

| Medicion | Resultado | Condiciones |
|---|---|---|
| Memoria de modelo | 83,2 GiB por GPU | 2x RTX PRO 6000 Blackwell Max-Q, TP2, DCP2, MTP con 3 tokens especulativos |
| Decodificacion a concurrencia 1 | ~170 tok/s | mismas condiciones; depende de la version del decodificador CSF |
| Decodificacion a concurrencia 8 | 490-540 tok/s | mismas condiciones |
| Prefill | ~7,6K tok/s | contexto de 32K |
| Needle-checksum (near misses) | 0,5 % | 500 prompts identicos de 8K, temperatura 0, concurrencia 8, sin reutilizacion de cache de prefijo |
| Needle-checksum de referencia | 0,25 % | mismos expertos QAD con atencion y expertos compartidos en BF16; la diferencia se declara dentro del ruido entre ejecuciones |

## Requisitos de hardware

- VRAM: 83,2 GiB de memoria de modelo por GPU en una configuracion de 2 GPUs con tensor parallelism 2 y DCP2.
- Almacenamiento: 178,5 GB de repositorio; las escalas de expertos enrutados ocupan 9,83 GB tras la compresion CSF.
- GPUs medidas: 2x RTX PRO 6000 Blackwell Max-Q. El decodificador NVFP4-CSF y los formatos NVFP4/MXFP8 apuntan a la generacion Blackwell; no se documenta soporte en GPUs Hopper o Ampere.
- GPU de consumo: no cabe en GPUs de consumo. Los 83,2 GiB por GPU exceden la memoria de cualquier acelerador de gama de consumo actual (por ejemplo, 32 GB en una RTX 5090), por lo que se requiere un minimo de dos GPUs profesionales o de centro de datos.
- Despliegue: vLLM con `--quantization nvfp4_csf --load-format nvfp4_csf` sobre imagenes beta Karmic Kraken; el directorio servido contiene los ficheros de `metadata/` con el `quantization_config` sustituido por el bloque `nvfp4_csf` indicado en la model card.
- Soporte en llama.cpp, Ollama, TGI u otros runtimes: no disponible; no se menciona en la informacion proporcionada.
- Latencia y throughput: los valores medidos (170 tok/s a concurrencia 1, 490-540 tok/s a concurrencia 8, 7,6K tok/s de prefill a 32K) dependen de la version del decodificador CSF.

## Comparativa con modelos similares

Todos los modelos comparables son variantes del mismo linaje GLM-5.3-Flash publicadas o referenciadas por el mismo autor. No se dispone de parametros, contexto ni licencia de los tres primeros. No se han identificado alternativas externas comparables en la informacion proporcionada.

| Modelo | Precision | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| GLM-5.3-Flash-NVFP4-MXFP8-CSF-QAD | NVFP4 (expertos enrutados) + MXFP8 (atencion y compartidos), escalas en CSF | no disponible | no disponible | MIT | Objeto de esta ficha; 0 descargas y 0 likes en el momento de la consulta |
| GLM-5.3-Flash-NVFP4 | NVFP4 con QAD | no disponible | no disponible | no disponible | Modelo base directo; revision `mtp-bf16` usada como origen de los expertos enrutados |
| GLM-5.3-Flash-NVFP4-Spark | MXFP8 | no disponible | no disponible | no disponible | Origen de las 531 proyecciones MXFP8 |
| GLM-5.3-Flash-NVFP4-CSF | NVFP4 con escalas comprimidas en CSF | no disponible | no disponible | no disponible | Mismo contenedor `lil-nvfp4-csf-checkpoint/1` |

## Limitaciones y advertencias

- Dependencia de un runtime especifico: la carga requiere un decodificador NVFP4-CSF (imagenes beta Karmic Kraken con vLLM). Sin ese soporte, el checkpoint no es utilizable directamente.
- Degradacion de fidelidad medida: 0,5 % de near misses en la prueba needle-checksum frente al 0,25 % de la variante con atencion y expertos compartidos en BF16. El autor lo atribuye a ruido entre ejecuciones, pero la diferencia esta registrada.
- Requisitos de hardware restrictivos: 83,2 GiB por GPU y necesidad de al menos dos aceleradores Blackwell; no hay ruta documentada para GPUs de consumo ni para generaciones anteriores.
- Cobertura idiomatica limitada a ingles y chino. No hay datos sobre rendimiento en castellano ni en otros idiomas.
- Ausencia de benchmarks estandar: no se publican resultados de MMLU, HumanEval, GSM8K ni equivalentes, lo que impide comparar la calidad del modelo con alternativas de forma objetiva.
- Riesgo de alucinacion: inherente a los modelos generativos. La model card no documenta evaluaciones de factualidad ni tasas de alucinacion.
- Sesgos: no disponible. No se incluye ninguna evaluacion de sesgos en la informacion proporcionada.
- Trazabilidad parcial: la verificacion SHA-256 acredita la reconstruccion exacta de los shards y la integridad del empaquetado, pero no la calidad del modelo resultante.
- Licencia: el repositorio se publica bajo MIT, lo que permite uso comercial de esta build. No obstante, no se especifica la licencia de los checkpoints de origen GLM-5.3-Flash, por lo que conviene verificar la cadena completa antes de un despliegue en produccion.
- Madurez: el repositorio registra 0 descargas y 0 likes, y no se han encontrado validaciones independientes; las cifras de rendimiento proceden unicamente del autor.
- Fechas del repositorio: creado y actualizado el 3 de octubre de 2026, segun los metadatos de HuggingFace.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/local-inference-lab/GLM-5.3-Flash-NVFP4-MXFP8-CSF-QAD
- Modelo base (QAD): https://huggingface.co/local-inference-lab/GLM-5.3-Flash-NVFP4
- Variante Spark (origen de las proyecciones MXFP8): https://huggingface.co/local-inference-lab/GLM-5.3-Flash-NVFP4-Spark
- Variante CSF (mismo contenedor de checkpoint): https://huggingface.co/local-inference-lab/GLM-5.3-Flash-NVFP4-CSF
- Revision concreta del checkpoint QAD usada como origen: `cfd47bd7680e68408924df09b179d5bed25b2ae9` (revision `mtp-bf16`)
- Paper, blog, repositorio de codigo o demo: no disponibles. La busqueda web realizada no devolvio ningun resultado relevante sobre el modelo, el autor o los formatos NVFP4-CSF, MXFP8 y QAD empleados.
