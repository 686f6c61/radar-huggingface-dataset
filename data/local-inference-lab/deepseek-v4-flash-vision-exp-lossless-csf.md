# local-inference-lab/DeepSeek-V4-Flash-Vision-Exp-lossless-CSF

## Resumen

DeepSeek-V4-Flash-Vision-Exp-lossless-CSF es un contenedor de pesos publicado por local-inference-lab que reempaqueta el modelo deepseek-ai/DeepSeek-V4-Flash-Vision-Exp (revision 6821d6ad3681a4b137b066b76094fa82ebd0a380) aplicando una compresion sin perdida sobre las escalas de bloque de los expertos enrutados. No es un modelo nuevo ni un reentrenamiento: es un artefacto de distribucion que conserva intactos los nibbles FP4 de los pesos, el resto de tensores, los nombres, los dtypes, las formas y los metadatos del origen. La unica diferencia material es que las escalas de bloque (UE8M0) de los expertos enrutados se almacenan en formato MXFP4-CSF comprimido.

El problema que resuelve es de almacenamiento y transporte: los archivos de pesos pasan de 167,82 GB a 160,37 GB (7,45 GB ahorrados), y las 33.024 matrices de escalas de bloque se reducen de 8,66 GB a 1,21 GB (13,9% del tamano original). La decodificacion es aritmetica entera sobre bytes, sin recuantizacion ni ajuste, y los shards originales pueden restaurarse bit a bit y verificarse por SHA-256.

Su relevancia es acotada pero concreta: es util para quien despliega el modelo base en infraestructura propia y quiere reducir el espacio en disco y el trafico de descarga sin alterar un solo peso. El modelo base es multimodal (pipeline image-text-to-text) y de tipo MoE con 43 capas y 256 expertos enrutados por capa, segun la propia estructura de cuantizacion descrita. Los parametros totales, la longitud de contexto y el resto de especificaciones del modelo base no se detallan en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con mezcla de expertos (MoE) y codificador de vision; estructura de 43 capas x 256 expertos enrutados por capa segun el layout de cuantizacion. Detalles completos del modelo base no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP4 (E2M1, escala UE8M0 cada 32) en expertos enrutados; FP8 E4M3 (bloques 128x128, escalas UE8M0) en atencion y expertos compartidos; BF16 en codificador de vision (32 bloques), aligner y tokens de imagen; formato de origen en capas MTP, embeddings y normas. Escalas de expertos enrutados comprimidas sin perdida con MXFP4-CSF (codec row-base-offset1-u24-exceptions/1) |
| Idiomas soportados | no disponible |
| Licencia | Local Inference Lab License, Version 1.0 (LicenseRef-LIL-1.0); el modelo base esta bajo MIT |
| Formato de pesos | safetensors, layout lil-mxfp4-csf-checkpoint/1 (48 shards indexados en el origen) |

## Arquitectura y entrenamiento

El contenedor no incorpora entrenamiento ni ajuste alguno: hereda el modelo base deepseek-ai/DeepSeek-V4-Flash-Vision-Exp y se limita a recomprimir las escalas de bloque de los expertos enrutados. La estructura descrita en la model card indica un modelo MoE multimodal: 43 capas con 256 expertos enrutados cada una, atencion y expertos compartidos en FP8 E4M3 con bloques de 128x128 y escalas UE8M0, un codificador de vision de 32 bloques en BF16, capas MTP (multi-token prediction) en formato de origen, y embeddings y normas sin tocar.

La innovacion tecnica del artefacto es el codec de compresion sin perdida. Las 33.024 matrices de escalas (correspondientes a las proyecciones de expertos enrutados de las 43 x 256 x 3 capas principales) se almacenan en dos tensores por escala: `<name>.mxfp4_csf_fixed` (uint8) y `<name>.mxfp4_csf_exceptions` (uint32). La decodificacion es aritmetica entera sobre bytes, sin recuantizacion ni ajuste, lo que permite reconstruir los shards originales de forma exacta. El proceso de construccion se hizo con trellis-quant (`trellis_quant.lossless_scale_checkpoint`, commit 60feca330087, familia deepseek_v4_flash), y cada shard de origen se verifico contra su hash LFS de Hugging Face; `verification.json` reporta 33.024 matrices de escalas y 48 shards verificados correctamente. No se aportan datos sobre volumen de tokens, composicion del dataset ni fases de RLHF/DPO, porque se trata de un reempaquetado y no de un entrenamiento.

## Capacidades

- Generacion multimodal imagen-texto: el pipeline declarado es image-text-to-text, por lo que acepta imagenes y texto como entrada y produce texto.
- Vision: incluye un codificador de vision de 32 bloques en BF16, mas aligner y tokens de imagen, segun el layout de pesos.
- Decodificacion multi-token: el modelo base incorpora capas MTP (multi-token prediction).
- Compresion sin perdida con restauracion bit a bit: el contenedor permite reconstruir los shards originales y verificar SHA-256.
- Despliegue con lector MXFP4-CSF: soporta carga mediante vLLM con cuantizacion `mxfp4_csf`.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (el campo de idiomas no esta informado).
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Despliegue autoalojado de un VLM multimodal con almacenamiento reducido: el contenedor recorta 7,45 GB respecto al checkpoint original, lo que reduce el espacio en disco y el tiempo de descarga en nodos con almacenamiento limitado, manteniendo los pesos FP4 intactos.
- Investigacion en compresion sin perdida de checkpoints cuantizados: el artefacto sirve como referencia reproducible de un codec (row-base-offset1-u24-exceptions/1) aplicado a escalas de bloque UE8M0, con verificacion SHA-256 de todos los shards.
- Pipelines internos de analisis de imagenes: al declararse image-text-to-text, puede integrarse en flujos de procesamiento de imagen y texto para generacion de descripciones o extraccion de informacion, siempre que el modelo base lo permita.
- Moderacion o clasificacion de contenido visual: en escenarios donde se requiere un VLM autoalojado por motivos de privacidad, el contenedor reduce la huella de almacenamiento en el nodo de inferencia.
- Atricion y replicacion de artefactos en clusters: la posibilidad de restaurar los shards originales bit a bit facilita distribuir el contenedor comprimido y reconstruir el formato estandar donde se necesite.
- Entornos con ancho de banda restringido: mover 160,37 GB en lugar de 167,82 GB abarata la transferencia entre regiones o centros de datos.
- Validacion de integridad en cadena de suministro de modelos: los receipts por shard, `manifest.json`, `SHA256SUMS` y `verification.json` permiten auditar que el contenedor corresponde exactamente al checkpoint de origen.

Nota: estos casos asumen las capacidades del modelo base; la ficha no aporta benchmarks ni evaluaciones propias que las confirmen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Almacenamiento de pesos: 160,37 GB en el contenedor (167,82 GB en el formato original). La inferencia necesita al menos esa cantidad de memoria de dispositivo o de sistema, mas la cache KV y el overhead de activaciones.
- VRAM estimada: por encima de 160 GB solo para pesos; en la practica se requiere configuracion multi-GPU. El FP8 y MXFP4 del origen implican una demanda ya reducida frente a un equivalente en BF16, pero el tamano absoluto sigue siendo elevado.
- GPU recomendadas: 2x H200 (141 GB cada una) o 3x H100 80 GB como minimo razonable para acomodar pesos y overhead; tambien configuraciones multi-GPU con A100 80 GB.
- GPU de consumo: no cabe. Tarjetas como RTX 4090 (24 GB) o similares son claramente insuficientes.
- Opciones de despliegue: vLLM con `--quantization mxfp4_csf --load-format mxfp4_csf`, apuntando a un directorio de servicio que contenga los archivos de `metadata/` con el `quantization_config` de `config.json` modificado para incluir `"quant_method": "mxfp4_csf"`, `"format_version": 1` y `"checkpoint_root"` apuntando al checkpoint. Requiere un runtime cuyo lector MXFP4-CSF conozca la familia `deepseek_v4_flash`.
- Cargadores estandar: un cargador safetensors convencional no abrira este directorio, porque no existe `model.safetensors.index.json` en el nivel superior.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-V4-Flash-Vision-Exp-lossless-CSF (este contenedor) | no disponible | no disponible | safetensors, MXFP4 + FP8, 160,37 GB | LIL-1.0 (base MIT) | Hugging Face, repo de 160,4 GB |
| deepseek-ai/DeepSeek-V4-Flash-Vision-Exp (origen) | no disponible | no disponible | safetensors, MXFP4 + FP8, 167,82 GB | MIT | Hugging Face |

No se dispone de informacion sobre otros modelos comparables de la misma categoria en la informacion proporcionada. La unica comparacion directa posible es con el checkpoint de origen, del que este contenedor difiere unicamente en el almacenamiento comprimido de las escalas de bloque de los expertos enrutados.

## Limitaciones y advertencias

- Licencia restrictiva: la Local Inference Lab License 1.0 reproduce los terminos de Apache 2.0 y anade condiciones que los restringen. No es la licencia Apache y los archivos no son codigo abierto.
- Prohibicion de resubida: no se permite subir, replicar ni redistribuir los archivos ni una copia sustancialmente similar (renombrada, re-shardada, reempaquetada, con metadatos eliminados, convertida o descuantizada). Debe enlazarse al repositorio original.
- Atribucion obligatoria en la parte superior, segun los terminos de la licencia.
- Solo las revisiones publicadas hasta la 73a48c1453077266388407e7f7a70ec190a723cf inclusive quedaron bajo MIT; las posteriores se rigen por LIL-1.0.
- Cadena de canario incrustada (LIL-CANARY-34C7-8086-0538-78FD), mecanismo habitual para detectar copias no autorizadas.
- Dependencia de runtime especifico: solo funciona con un servidor cuyo lector MXFP4-CSF soporte la familia `deepseek_v4_flash`; vLLM debe configurarse de forma explicita. No es cargable por safetensors estandar.
- Idiomas soportados no informados: se desconoce la cobertura multilingue real.
- Riesgo de alucinacion: no se documenta en la informacion disponible; debe asumirse el comportamiento del modelo base, no evaluado aqui.
- Sesgos conocidos: no disponibles.
- Modelo base marcado como "Exp" (experimental), lo que implica estabilidad y soporte no garantizados.
- No se han publicado benchmarks ni evaluaciones propias en la informacion disponible; no hay datos de rendimiento que respalden su uso en produccion.
- Contenedor de fecha 2026-10-04, con 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.

## Enlaces

- Repositorio del modelo: https://huggingface.co/local-inference-lab/DeepSeek-V4-Flash-Vision-Exp-lossless-CSF
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-Vision-Exp
- Revision del modelo base: 6821d6ad3681a4b137b066b76094fa82ebd0a380
- Licencia del contenedor: https://huggingface.co/local-inference-lab/DeepSeek-V4-Flash-Vision-Exp-lossless-CSF/blob/main/LICENSE
- Herramienta de construccion y verificacion: trellis-quant, modulo `trellis_quant.lossless_scale_checkpoint` (commit 60feca330087)
- Los resultados de la busqueda web no aportaron enlaces relevantes al modelo (devolvieron contenido no relacionado sobre locales comerciales y agencias digitales).
