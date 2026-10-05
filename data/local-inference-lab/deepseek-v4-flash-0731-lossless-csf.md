# local-inference-lab/DeepSeek-V4-Flash-0731-lossless-CSF

## Resumen

DeepSeek-V4-Flash-0731-lossless-CSF es un contenedor de pesos publicado por local-inference-lab que reempaqueta el checkpoint deepseek-ai/DeepSeek-V4-Flash-0731 (revision 9e165c30e2704aec5d9d593cce3eebd58bbef1cb) sin modificar ningun tensor: conserva los nibbles FP4, el resto de tensores, los nombres, los dtypes, las formas y los metadatos byte a byte. No es un modelo nuevo ni un reentrenamiento, sino el mismo modelo con las escalas de bloque de los expertos enrutados almacenadas en un formato comprimido sin perdida (MXFP4-CSF, codec row-base-offset1-u24-exceptions/1).

El problema que resuelve es de almacenamiento y transporte. Los 48 shards safetensors del origen ocupan 166,89 GB; este contenedor ocupa 159,44 GB, es decir, un ahorro de 7,45 GB. La mayor parte del ahorro procede de las 33.024 matrices de escalas UE8M0 de las proyecciones de expertos enrutados (43 capas x 256 en las capas principales), que pasan de 8,66 GB a 1,21 GB (13,9% del tamano original).

Es relevante porque permite distribuir y servir un modelo MoE de gran tamano en FP4/FP8 con menos espacio en disco y sin coste de fidelidad: la decodificacion es aritmetica entera sobre bytes, sin recuantizacion ni ajuste, y los shards originales se pueden restaurar de forma bit-exacta. La verificacion publicada reconstruye los 48 shards y valida sus SHA-256. La ficha del repositorio no documenta el numero de parametros, la longitud de contexto, los idiomas ni datos de entrenamiento del modelo subyacente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE): expertos enrutados, expertos compartidos, atencion y capas MTP (multi-token prediction). El repositorio es un contenedor de cuantizacion y no define arquitectura nueva. |
| Parametros totales | no disponible |
| Parametros activos | no disponible (el modelo es MoE; la unica cifra estructural publicada es 43 capas x 256 expertos enrutados en las capas principales) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Expertos enrutados: MXFP4 (E2M1, escala UE8M0 por bloque de 32). Atencion y expertos compartidos: FP8 E4M3 (bloques 128x128, escalas UE8M0). Capas MTP (incluidos sus expertos enrutados), embeddings y normas: formato fuente. Escalas de bloque de expertos enrutados: MXFP4-CSF sin perdida. |
| Idiomas soportados | no disponible |
| Licencia | Local Inference Lab License, Version 1.0 (LicenseRef-LIL-1.0): reproduce los terminos de Apache 2.0 y anade condiciones que los restringen; no es open source. El modelo de origen se distribuye bajo licencia MIT. |
| Formato de pesos | Contenedor lil-mxfp4-csf-checkpoint/1 con 48 shards safetensors. Cada escala de experto enrutado `<nombre>` se guarda como `<nombre>.mxfp4_csf_fixed` (uint8) mas `<nombre>.mxfp4_csf_exceptions` (uint32). No existe model.safetensors.index.json en el nivel superior. |

## Arquitectura y entrenamiento

Este repositorio no entrena ningun modelo. Es un contenedor de cuantizacion construido con la herramienta trellis-quant (modulo `trellis_quant.lossless_scale_checkpoint`, commit 60feca330087, familia `deepseek_v4_flash`). Lo unico que se transforma son los planos de escalas de bloque de los expertos enrutados, que se almacenan en el codec `row-base-offset1-u24-exceptions/1`; el resto de tensores se copia sin cambios. Durante la exportacion se comprobo el SHA-256 de cada shard de origen contra su hash LFS de Hugging Face.

La verificacion publicada (`verification.json`) reconstruye cada shard original a partir del contenedor y compara hashes: 33.024 matrices de escalas y 48 shards, con resultado correcto. Por tanto, la fidelidad numerica respecto al checkpoint de DeepSeek-V4-Flash-0731 es bit-exacta, y el comando `restore` genera una copia ordinaria del checkpoint fuente. No se publica informacion sobre datos de entrenamiento, numero de tokens, composicion del dataset ni tecnicas de alineamiento (RLHF, DPO) del modelo subyacente, porque eso corresponde al modelo base y no a este contenedor.

## Capacidades

- Generacion de texto: es la tarea declarada en el pipeline (`text-generation`) del modelo subyacente.
- Compresion sin perdida: las escalas de bloque de los expertos enrutados se almacenan comprimidas y se decodifican con aritmetica entera sobre bytes, sin recuantizacion ni ajuste.
- Restauracion bit-exacta: el comando `restore` reconstruye los shards originales y verifica cada hash antes de publicar el fichero.
- Verificacion de integridad: el comando `verify` reconstruye los 48 shards y compara SHA-256.
- Servicio de inferencia: soportado en vLLM mediante `--quantization mxfp4_csf --load-format mxfp4_csf`, con un runtime cuyo lector MXFP4-CSF conozca la familia `deepseek_v4_flash`.
- Tool calling, function calling y uso como agente: no documentado en la informacion disponible.
- Capacidades multilingues: no disponibles.
- Razonamiento, codigo, matematicas, vision o audio: no documentados en la informacion disponible.
- Modo thinking: no documentado en la informacion disponible.

## Casos de uso

- Servicio de inferencia en produccion con vLLM: el contenedor se carga indicando `quantization=mxfp4_csf` y `load-format=mxfp4_csf`, apuntando a un directorio de servicio que solo contiene los metadatos; los pesos se leen desde `checkpoint_root`. Es adecuado cuando ya existe una infraestructura vLLM y se quiere servir el modelo base con un directorio de pesos mas pequeno.
- Registro interno de modelos con menor huella de disco: sustituir el checkpoint de origen por este contenedor reduce los ficheros de pesos de 166,89 GB a 159,44 GB sin perder ningun tensor, lo que abarata el almacenamiento por revision en un registro corporativo.
- Verificacion de integridad en pipelines de CI/CD: `python3 -m trellis_quant.lossless_scale_checkpoint verify` reconstruye los shards y compara SHA-256, de modo que un job de integracion continua puede validar que un artefacto descargado no se ha corrompido o alterado antes de desplegarlo.
- Restauracion reproducible para auditoria: `restore` escribe los shards y metadatos originales en un directorio nuevo comprobando cada hash, lo que permite entregar a un auditor el checkpoint equivalente al de DeepSeek con trazabilidad completa.
- Reproduccion bit-exacta de evaluaciones: al no haber recuantizacion, los resultados de una evaluacion ejecutada sobre el contenedor deben coincidir con los del checkpoint de origen, algo util cuando se comparan informes de evaluacion entre equipos.
- Distribucion a nodos con ancho de banda limitado: mover 159,44 GB en lugar de 166,89 GB reduce el tiempo de transferencia entre centros de datos o hacia clusters de entrenamiento e inferencia.
- Archivado a largo plazo: los metadatos incluyen copias byte a byte del config, tokenizer, indice, README y LICENSE del origen, ademas de `manifest.json`, `build-contract.json`, `receipts/` y `SHA256SUMS`, lo que simplifica la conservacion documental del artefacto.
- Integracion en pipelines de aprovisionamiento de GPU: el mismo artefacto sirve tanto para desplegar con vLLM como para restaurar el checkpoint original si se necesita un formato distinto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

Lo unico verificable publicado son resultados de integridad, no de calidad del modelo:

| Comprobacion | Resultado |
|---|---|
| Matrices de escalas reconstruidas | 33.024 |
| Shards reconstruidos y comparados por SHA-256 | 48 |
| Resultado de la verificacion | correcto (passed) |
| Tamano de pesos en origen | 166,89 GB |
| Tamano de pesos en el contenedor | 159,44 GB |
| Ahorro | 7,45 GB |
| Escalas de expertos enrutados | 8,66 GB -> 1,21 GB (13,9%) |

## Requisitos de hardware

- Almacenamiento: 159,44 GB para los ficheros de pesos, mas los metadatos, manifiestos, receipts y licencias. El repositorio completo ocupa 159,4 GB (tamano declarado en Hugging Face).
- VRAM estimada: al menos unos 160 GB solo para los pesos. Hay que sumar la cache KV y los estados de activacion, cuya magnitud depende de la longitud de contexto y del lote, datos no publicados.
- No cabe en GPU de consumo: una RTX 4090 (24 GB) o una RTX 5090 (32 GB) quedan muy lejos de los 160 GB necesarios.
- GPU recomendadas (estimacion a partir del tamano de los pesos, no confirmada por el autor): al menos 2 aceleradores de 141 GB (H200), o 3 o mas aceleradores de 80 GB (H100, A100 80 GB) para cubrir los pesos con margen para la cache KV. Un nodo de 8x H100 80 GB es una configuracion holgada y habitual para modelos de esta clase.
- Opciones de despliegue: vLLM con lector MXFP4-CSF. Se necesita un runtime cuyo lector conozca la familia `deepseek_v4_flash`; un cargador safetensors estandar no abrira este directorio, ya que no hay `model.safetensors.index.json` en el nivel superior.
- No se documenta soporte en llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La unica comparacion documentada es contra el checkpoint del que deriva. No se dispone de datos de otras redistribuciones comparables en la informacion proporcionada.

| Aspecto | DeepSeek-V4-Flash-0731-lossless-CSF | deepseek-ai/DeepSeek-V4-Flash-0731 (origen) |
|---|---|---|
| Parametros totales | no disponible | no disponible |
| Longitud de contexto | no disponible | no disponible |
| Cuantizacion de pesos | MXFP4 en expertos enrutados y FP8 E4M3 en atencion y expertos compartidos, identica al origen | MXFP4 y FP8 E4M3 (el contenedor no los altera) |
| Escalas de expertos enrutados | comprimidas sin perdida (8,66 GB -> 1,21 GB) | sin comprimir |
| Tamano de pesos | 159,44 GB | 166,89 GB |
| Shards safetensors | 48, mas ficheros de contenedor y verificacion | 48 |
| Restauracion | bit-exacta verificada por SHA-256 | no aplica |
| Licencia | LIL-1.0 (no open source, con restricciones de redistribucion) | MIT |
| Formato de pesos | contenedor lil-mxfp4-csf-checkpoint/1 | safetensors estandar con indice |

## Limitaciones y advertencias

- Licencia restrictiva: la Local Inference Lab License 1.0 reproduce Apache 2.0 y anade condiciones que lo restringen. El propio texto declara que "no es la licencia Apache y estos ficheros no son open source". Cualquier uso comercial debe revisarse contra el texto completo antes de desplegar.
- Prohibicion de resubida: no se pueden subir, replicar ni redistribuir estos ficheros ni copias sustancialmente similares (renombradas, re-shardeadas, reempaquetadas, sin metadatos, convertidas o descuantizadas). Se debe enlazar al repositorio original.
- Obligacion de atribucion: todo README, model card o pagina de aterrizaje debe incluir la atribucion correspondiente.
- Historial de licencia: las revisiones publicadas hasta la 08585e8511d9d61b1a7c457be6e8b193d0310b23 se publicaron bajo MIT; la LIL-1.0 se aplica a revisiones posteriores.
- Dependencia de un runtime especifico: solo funciona con un lector MXFP4-CSF que conozca la familia `deepseek_v4_flash`. No hay soporte documentado en llama.cpp, Ollama ni TGI, y un cargador safetensors convencional fallara.
- Verificacion y restauracion requieren trellis-quant: ambos comandos necesitan `PYTHONPATH` apuntando a la herramienta, por lo que la trazabilidad completa depende de software externo al repositorio.
- Documentacion incompleta del modelo subyacente: no se publican en este repositorio el numero de parametros, la longitud de contexto, los idiomas soportados, los datos de entrenamiento ni resultados de benchmarks.
- Sesgos y alucinacion: no se documentan evaluaciones. Al ser una copia bit-exacta de los pesos del modelo base, cualquier sesgo o tendencia a la alucinacion del modelo DeepSeek-V4-Flash-0731 se hereda sin cambios.
- Madurez del artefacto: el repositorio registra 0 descargas y 0 "likes" en el momento de la consulta, y la fecha de creacion es posterior a la del modelo base, por lo que se trata de una redistribucion reciente y sin adopcion publica documentada.
- Advertencia de integridad de la model card: el fichero de licencia incluye una cadena canary ("Ні пуху, ні пера", LIL-CANARY-B004-2948-FE08-C9B8) que actua como marca de agua del texto legal.
- Coste de despliegue: unos 160 GB de pesos implican obligatoriamente inferencia multi-GPU, con el coste economico y de ingenieria que eso conlleva.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/local-inference-lab/DeepSeek-V4-Flash-0731-lossless-CSF
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-0731
- Licencia del contenedor: https://huggingface.co/local-inference-lab/DeepSeek-V4-Flash-0731-lossless-CSF/blob/main/LICENSE
- Herramienta trellis-quant (modulo `trellis_quant.lossless_scale_checkpoint`, commit 60feca330087): URL no disponible en la informacion proporcionada.
- Paper, blog o demo del modelo base: no disponible en la informacion proporcionada.
- La busqueda web realizada no devolvio resultados relevantes: los enlaces encontrados corresponden a una agencia de comunicacion, portales inmobiliarios y documentacion de un entorno de desarrollo local de WordPress, sin relacion con el modelo.
