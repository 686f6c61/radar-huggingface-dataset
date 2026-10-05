# local-inference-lab/GLM-5.3-Flash-NVFP4-CSF-QAD

## Resumen

GLM-5.3-Flash-NVFP4-CSF-QAD es un contenedor de pesos publicado por Local Inference Lab que envuelve el checkpoint cuantizado GLM-5.3-Flash-NVFP4 del mismo autor (revision `175ae8ce3b5af842b0d0140dbeb43e9cfc557c49`), el cual deriva a su vez de zai-org/GLM-5.3-Flash-BF16, desarrollado por Z.AI y licenciado bajo MIT. No es un modelo nuevo ni un reentrenamiento: es el mismo checkpoint NVFP4 con las escalas de bloque de los expertos enrutados almacenadas en un formato comprimido sin perdida. Los nibbles FP4 de los pesos, el resto de tensores, los nombres, los dtypes, las formas y los metadatos de origen se mantienen identicos byte a byte, y los shards originales pueden reconstruirse de forma bit-exacta.

El contenedor reduce el tamano de 198,06 GB a 188,87 GB (9,19 GB de ahorro) comprimiendo 36.288 matrices de escalas de bloque E4M3, que pasan de 19,03 GB a 9,83 GB (51,6 %). El layout interno es `lil-nvfp4-csf-checkpoint/1` con el codec `byte-window4-fixed-stream-u24-exceptions/1`, y deliberadamente no incluye un `model.safetensors.index.json` en el nivel raiz, de modo que un cargador safetensors convencional no lo abra por error.

Su relevancia es operativa: permite servir el mismo modelo con menor huella de almacenamiento y con verificación criptografica de procedencia, a cambio de requerir vLLM con el lector NVFP4-CSF y de estar sujeto a una licencia propietaria (Local Inference Lab License 1.0) que restringe la redistribucion. Arquitectura, numero de parametros y longitud de contexto no estan documentados en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con expertos enrutados (MoE) segun el layout de tensores: expertos enrutados, expertos compartidos, capas densas y una capa MTP (multi-token prediction). La model card no declara explicitamente el termino MoE ni el numero total de parametros |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta: NVFP4 (E2M1 con escala E4M3 por bloque de 16) en los expertos enrutados de las capas 3-44; MXFP8 en los expertos enrutados de la capa MTP (45); BF16 en atencion, expertos compartidos y capas densas. Las escalas de bloque de los expertos enrutados van en NVFP4-CSF sin perdida |
| Idiomas soportados | en, zh |
| Licencia | Local Inference Lab License, Version 1.0 (LicenseRef-LIL-1.0). Reproduce los terminos de Apache 2.0 y anade condiciones restrictivas; la model card indica explicitamente que no es open source. El modelo upstream (Z.AI) es MIT |
| Formato de pesos | safetensors dentro de un contenedor propietario `lil-nvfp4-csf-checkpoint/1` (codec `byte-window4-fixed-stream-u24-exceptions/1`); sin `model.safetensors.index.json` en la raiz |
| Capas con expertos enrutados | 3-44 (42 capas), mas la capa 45 (MTP) |
| Expertos enrutados por capa | 288 (deducido de 42 x 288 x 3 = 36.288 matrices de escalas) |
| Proyecciones por experto | 3 |
| Tamano del repositorio | 188,9 GB (pesos: 188,87 GB; el checkpoint fuente ocupa 198,06 GB) |
| Shards | 44 shards safetensors referenciados en el indice |
| Descargas / likes | 0 / 0 |
| Fecha de publicacion | 2026-10-04 (actualizado 2026-10-05) |

## Arquitectura y entrenamiento

El contenedor no aporta informacion sobre el entrenamiento del modelo subyacente. Lo que si describe con precision es la estructura del checkpoint heredado: los expertos enrutados de las capas 3 a 44 almacenan pesos en NVFP4 (formato E2M1) con una escala E4M3 por cada bloque de 16, mientras que la capa MTP (capa 45) usa MXFP8 en sus expertos enrutados. La atencion, los expertos compartidos y las capas densas permanecen en BF16. El checkpoint fuente es un resultado de QAD (quantization-aware distillation), es decir, la cuantizacion se incorporo durante un proceso de destilacion consciente de la cuantizacion, no como un post-procesado.

La innovacion tecnica de este repositorio no esta en el modelo sino en el almacenamiento: las 36.288 matrices de escalas de bloque se guardan en un plano comprimido sin perdida mediante aritmetica entera sobre bytes (codec `byte-window4-fixed-stream-u24-exceptions/1`), sin recuantizacion ni ajuste de ningun tipo. Cada escala `<name>` se almacena como `<name>.nvfp4_csf_fixed` (uint8) mas `<name>.nvfp4_csf_exceptions` (uint32). La model card incluye un `verification.json` que documenta que los 44 shards originales fueron reconstruidos desde el contenedor y que tanto los ficheros reconstruidos como los almacenados coincidieron en su SHA-256. El contenedor omite los ficheros que el indice fuente no referencia (`amax.safetensors`, `amax_checkpoint.safetensors`, `model-00036-of-00036.safetensors`), con el argumento de que vLLM nunca los carga. No hay datos de composicion del dataset, numero de tokens, RLHF ni DPO en la informacion disponible.

## Capacidades

- Generacion de texto: es la unica capacidad declarada explicitamente (pipeline_tag `text-generation`).
- Idiomas: ingles y chino, segun los campos `language` de la model card.
- Soporte de tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado en la informacion disponible.
- Capacidades especiales: el checkpoint conserva una capa MTP (multi-token prediction) en la capa 45, potencialmente util para decodificacion especulativa, aunque la model card no detalla como se explota en inferencia.
- Vision, audio u otras modalidades: no documentado en la informacion disponible.
- Capacidades heredadas de GLM-5.3-Flash: no disponibles, ya que la model card del modelo original no forma parte de la informacion proporcionada.

## Casos de uso

- Servicio de inferencia a gran escala con almacenamiento limitado: desplegar el modelo en vLLM con `--quantization nvfp4_csf --load-format nvfp4_csf` ahorrando 9,19 GB de disco por replica respecto al checkpoint NVFP4 original, sin cambios numericos en la salida.
- Sustitucion directa del checkpoint base en un despliegue existente: dado que los tensores son byte-identicos y el contenedor expone los mismos metadatos, puede actuar como reemplazo del checkpoint fuente en un cluster ya preparado, con el unico cambio de apuntar `checkpoint_root` al nuevo directorio.
- Auditoria de cadena de suministro de modelos: el comando `verify` reconstruye cada shard original y compara SHA-256, lo que permite certificar que un artefacto distribuido corresponde exactamente al checkpoint de origen declarado.
- Reconstruccion bit-exacta bajo demanda: `restore` escribe los shards y metadatos originales en un directorio limpio, verificando cada hash antes de publicar el fichero. Util para pipelines que necesitan el checkpoint clasico y no pueden usar el lector personalizado.
- Archivado a largo plazo: almacenar la representacion comprimida y reconstruir el checkpoint completo solo cuando se necesite, reduciendo el coste de almacenamiento de un artefacto de casi 200 GB.
- Investigacion en cuantizacion de LLM: el contenedor expone de forma aislada las escalas de bloque E4M3 de 36.288 matrices de expertos enrutados, lo que permite estudiar su distribucion y compresibilidad sin tocar los pesos.
- Despliegue bilingue ingles-chino: el par de idiomas declarado lo hace apto para servicios de generacion de texto en esos dos mercados, siempre que se validen las capacidades reales contra el modelo original antes de ponerlo en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica de calidad, y la busqueda web realizada no ha devuelto resultados relacionados con el modelo.

## Requisitos de hardware

- VRAM estimada: los pesos ocupan 188,87 GB, por lo que se necesitan al menos ~189 GB de memoria sumada entre GPUs para los pesos, mas el espacio de la cache KV y activaciones, que no esta cuantificado en la informacion disponible. Estimacion aritmetica a partir del tamano del repositorio, no publicada por el autor.
- GPUs recomendadas: configuraciones multi-GPU de 80 GB por tarjeta, por ejemplo 4x A100 80 GB (320 GB) o 3x H100 80 GB (240 GB). No cabe en una sola GPU de 80 GB ni en GPUs de consumo.
- GPU de consumo: no viable. Ni 24 GB (RTX 4090), ni 32 GB, ni 48 GB son suficientes para los pesos en este formato.
- Almacenamiento: ~189 GB para el contenedor. Advertencia: `verify` reconstruye cada shard original en memoria o disco y `restore` escribe una copia completa de 198,06 GB en un directorio nuevo, por lo que la operacion requiere espacio libre adicional del orden del checkpoint fuente.
- Opciones de despliegue: vLLM exclusivamente, con el lector NVFP4-CSF. El directorio de serving contiene solo los ficheros de `metadata/` con el `quantization_config` sustituido por el bloque `nvfp4_csf` y `checkpoint_root` apuntando al checkpoint. La model card no indica si esa funcionalidad esta en vLLM upstream. No hay soporte declarado para llama.cpp, Ollama, TGI ni transformers.
- Cargador safetensors estandar: no funciona por diseno, ya que no existe `model.safetensors.index.json` en la raiz.
- Latencia y throughput: no disponibles.
- Herramientas auxiliares: el paquete `trellis-quant` (modulo `trellis_quant.lossless_scale_checkpoint`, commit `60feca330087`, familia `glm53_nvfp4`) para verificar y restaurar.

## Comparativa con modelos similares

| Modelo | Relacion | Cuantizacion | Tamano de pesos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GLM-5.3-Flash-NVFP4-CSF-QAD | Objeto de esta ficha | NVFP4 + MXFP8 + BF16, escalas en NVFP4-CSF | 188,87 GB | LIL 1.0 (no open source) | HuggingFace, 0 descargas |
| local-inference-lab/GLM-5.3-Flash-NVFP4 | Modelo base directo (relacion `quantized`) | NVFP4 + MXFP8 + BF16 | 198,06 GB | no disponible | HuggingFace |
| zai-org/GLM-5.3-Flash-BF16 | Modelo upstream original (Z.AI) | BF16 | no disponible | MIT | HuggingFace |

No se dispone de datos de contexto, parametros ni rendimiento de ninguna de las tres variantes, por lo que la comparativa se limita al formato de cuantizacion, el tamano de pesos y la licencia. No hay informacion sobre alternativas de otros proveedores de la misma categoria, por lo que esa comparacion figura como no disponible.

## Limitaciones y advertencias

- No es un modelo nuevo: es un contenedor del mismo checkpoint. No cabe esperar ninguna mejora de calidad respecto a GLM-5.3-Flash-NVFP4; los pesos y las escalas reconstruidas son identicos byte a byte.
- Licencia propietaria: LIL 1.0 reproduce los terminos de Apache 2.0 y anade condiciones que los restringen. La model card afirma explicitamente que estos ficheros no son open source. El texto completo de la licencia no esta incluido en la informacion disponible, por lo que los terminos exactos de uso comercial deben consultarse en el fichero `LICENSE` antes de cualquier despliegue productivo.
- Prohibicion de redistribucion: no se permite subir, replicar ni redistribuir los ficheros ni copias sustancialmente similares (incluidas copias renombradas, re-shardeadas, reempaquetadas, con metadatos eliminados, convertidas o desquantizadas). Las revisiones publicadas hasta la `7714f3ac972e2b33d35651938771744c8d192f3a` inclusive se publicaron bajo MIT y siguen bajo esa licencia.
- Dependencia de software no estandar: requiere una build de vLLM con el lector NVFP4-CSF. Un safetensors loader convencional no abrira el directorio. Esto limita la portabilidad a otros motores de inferencia.
- Omision deliberada de ficheros del origen (`amax.safetensors`, `amax_checkpoint.safetensors`, `model-00036-of-00036.safetensors`). La model card justifica que vLLM no los carga, pero cualquier flujo que los necesite debera usar `restore` para recuperar el checkpoint completo.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible. Deben evaluarse sobre el modelo original, no sobre este contenedor.
- Cobertura idiomatica limitada a ingles y chino segun la model card; no hay datos de rendimiento en castellano ni en otros idiomas.
- Sin senales de adopcion: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion independiente reportada.
- Coste de verificacion: `verify` sobre 44 shards y 36.288 matrices es una operacion pesada, y `restore` duplica temporalmente el espacio en disco necesario.
- La busqueda web realizada no devolvio ningun resultado relevante sobre el modelo; los resultados obtenidos no guardan relacion con el mismo y no se han utilizado como fuente.

## Enlaces

- HuggingFace (modelo): https://huggingface.co/local-inference-lab/GLM-5.3-Flash-NVFP4-CSF-QAD
- HuggingFace (modelo base, revision `175ae8ce3b5af842b0d0140dbeb43e9cfc557c49`): https://huggingface.co/local-inference-lab/GLM-5.3-Flash-NVFP4
- HuggingFace (modelo upstream de Z.AI, licencia MIT): https://huggingface.co/zai-org/GLM-5.3-Flash-BF16
- Licencia Local Inference Lab 1.0: https://huggingface.co/local-inference-lab/GLM-5.3-Flash-NVFP4-CSF-QAD/blob/main/LICENSE
- Herramienta de verificacion y restauracion: paquete `trellis-quant`, modulo `trellis_quant.lossless_scale_checkpoint`, commit `60feca330087` (la model card no proporciona URL del repositorio)
- Papers, blogs o demos adicionales: no disponibles en la informacion proporcionada; la busqueda web no devolvio resultados relacionados
