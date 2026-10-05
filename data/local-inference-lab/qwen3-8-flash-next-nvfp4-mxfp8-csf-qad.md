# local-inference-lab/Qwen3.8-Flash-Next-NVFP4-MXFP8-CSF-QAD

## Resumen

Qwen3.8-Flash-Next-NVFP4-MXFP8-CSF-QAD es un contenedor de pesos cuantizados publicado por local-inference-lab a partir del checkpoint Qwen3.8-Flash-Next-NVFP4, que a su vez deriva del modelo Qwen3.8-Flash-Next de Qwen mediante destilación con conciencia de cuantización (QAD). No es un modelo nuevo ni un reentrenamiento: es un reempaquetado sin pérdida en el que solo las escalas de bloque de los expertos enrutados se almacenan comprimidas con el códec CSF.

La arquitectura subyacente es un transformer con mezcla de expertos y atención híbrida (atención completa en unas capas y linear attention en otras), con un módulo MTP de predicción multi-token y torre de visión, ya que el pipeline declarado es image-text-to-text. Los expertos enrutados de 48 capas se almacenan en NVFP4 (E2M1 con escala E4M3 cada 16 valores), las proyecciones de atención y los expertos compartidos en MXFP8 (384 módulos), y los expertos enrutados del MTP en NVFP4 con esquema W4A16.

El interés del repositorio es de ingeniería: los ficheros de pesos pasan de 106,33 GB a 102,76 GB (3,57 GB menos) y las 73.728 matrices de escalas de bloque se reducen de 7,55 GB a 3,97 GB, un 52,5 %, sin modificar un solo nibble de los pesos FP4 ni ningún otro tensor. La decodificación es aritmética entera sobre bytes, sin recuantización ni ajuste, y los shards originales se reconstruyen de forma bit-exacta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos y atención híbrida (atención completa y linear attention en capas distintas); incluye módulo MTP y componentes de visión |
| Parametros totales | no disponible |
| Parametros activos | no disponible (el checkpoint es MoE, con expertos enrutados en 48 capas) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (E2M1, escala E4M3 por bloque de 16) en expertos enrutados; MXFP8 en proyecciones de atención y expertos compartidos (384 módulos); NVFP4 W4A16 en expertos enrutados del MTP; embeddings, tablas PLE, visión y normas en el formato de origen |
| Idiomas soportados | no disponible |
| Licencia | Local Inference Lab License 1.0 (LicenseRef-LIL-1.0); el modelo upstream queda sujeto además a la Qwen Community License 1.0 |
| Formato de pesos | safetensors dentro de un contenedor CSF (`lil-nvfp4-csf-checkpoint/1`); no existe `model.safetensors.index.json` en el nivel superior |
| Tamano del repositorio | 102,9 GB (102,76 GB de ficheros de pesos) |
| Revision de origen | `6909a5bed089a48fa07e956d3915af2537de9368` (40 shards safetensors) |

## Arquitectura y entrenamiento

El contenedor reproduce el checkpoint Qwen3.8-Flash-Next-NVFP4, que ya incorporaba el proceso de destilación con conciencia de cuantización. La arquitectura es de tipo MoE con atención híbrida: los 73.728 matrices de escalas corresponden a las proyecciones de expertos enrutados de 48 capas (48 × 512 × 3 proyecciones), mientras que las 384 módulos MXFP8 cubren atención y expertos compartidos. El módulo MTP se mantiene en NVFP4 con esquema W4A16, lo que abre la puerta a decodificación especulativa en el servidor. No se dispone de datos sobre número de tokens de entrenamiento, composición del dataset ni sobre fases de RLHF o DPO.

La innovación técnica está en el contenedor, no en el modelo: el códec `byte-window4-fixed-stream-u24-exceptions/1` comprime las escalas de bloque de expertos enrutados mediante aritmética entera sobre bytes. Cada escala `<nombre>` se guarda como `<nombre>.nvfp4_csf_fixed` (uint8) más `<nombre>.nvfp4_csf_exceptions` (uint32). No hay recuantización ni ajuste de pesos, y la verificación publicada reconstruyó los 40 shards originales comparando sus SHA-256 con resultado satisfactorio sobre las 73.728 matrices de escalas. El contenedor se generó con trellis-quant (`trellis_quant.lossless_scale_checkpoint`, commit `60feca330087`, familia `qwen38_flash_next_nvfp4`).

## Capacidades

- El pipeline declarado es image-text-to-text, por lo que el modelo acepta entrada de imagen y texto y genera texto; los tensores de visión se conservan en el formato de origen.
- El contenedor preserva byte a byte todos los tensores del checkpoint fuente, de modo que las capacidades de generación de texto, razonamiento, código y matemáticas son las del modelo base, no las de este repositorio.
- Incluye un módulo MTP (multi-token prediction) cuyos expertos enrutados se mantienen en NVFP4 W4A16, lo que habilita decodificación especulativa en el servidor.
- Soporte de tool calling / function calling: no confirmado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la información disponible.
- Capacidades multilingües: no disponibles (el repositorio no declara idiomas).
- Capacidad especial: verificación y restauración bit-exacta del checkpoint original mediante los comandos `verify` y `restore` de trellis-quant.

## Casos de uso

- Servicio de inferencia en producción con vLLM: arrancar con `--quantization nvfp4_csf --load-format nvfp4_csf` apuntando a un directorio de servicio que contenga los ficheros de `metadata/`, con `quantization_config` sustituida por el bloque `nvfp4_csf` documentado. Es la vía soportada explícitamente por el autor.
- Sustitución directa del checkpoint NVFP4 base: al ser un contenedor sin pérdida del mismo modelo, permite reemplazar el checkpoint original ahorrando 3,57 GB de almacenamiento por copia en registries de imágenes, cachés de nodo o volúmenes de solo lectura.
- Verificación de integridad en pipelines de MLOps: `trellis_quant.lossless_scale_checkpoint verify` reconstruye cada shard y compara SHA-256, lo que sirve como control de calidad reproducible antes de promover el modelo a producción.
- Restauración a formato estándar: `restore` escribe los shards safetensors y los metadatos originales en un directorio nuevo, verificando cada hash antes de publicar el fichero; útil cuando el destino no puede ejecutar el lector CSF.
- Distribución de checkpoints de gran tamaño en clústeres con ancho de banda o caché limitados: el ahorro del 52,5 % en las escalas de expertos enrutados reduce el coste de transferencia y de almacenamiento en cada réplica.
- Investigación en compresión de checkpoints cuantizados: el repositorio documenta layout, códec, contrato de construcción y receipts por shard, lo que lo convierte en una referencia reproducible para estudiar compresión sin pérdida sobre planos de escalas de bloque.
- Servicio multimodal de documentos y capturas: al conservar la torre de visión y el pipeline image-text-to-text, puede desplegarse para tareas de extracción o descripción sobre imágenes, siempre que el motor de inferencia soporte los componentes de visión en el formato cuantizado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

Las únicas métricas publicadas son de compresión y verificación:

| Metrica | Valor |
|---|---|
| Ficheros de pesos (origen) | 106,33 GB |
| Ficheros de pesos (contenedor) | 102,76 GB |
| Ahorro total | 3,57 GB |
| Matrices de escalas comprimidas | 73.728 (48 × 512 × 3) |
| Escalas antes de comprimir | 7,55 GB |
| Escalas tras comprimir | 3,97 GB (52,5 % de reduccion) |
| Verificacion SHA-256 | 40 shards, 73.728 matrices, correcta |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 103 GB solo para pesos, ya que el contenedor ocupa 102,76 GB y las escalas se descomprimen en memoria. Hay que añadir memoria para caché KV y activaciones, por lo que en la práctica conviene disponer de al menos 140-160 GB de VRAM total.
- GPU recomendadas: B200 (192 GB) en un solo dispositivo; 2 × H100 o H200 con NVLink; 4 × A100 80 GB si el motor lo permite. No se dispone de cifras de latencia ni de throughput publicadas.
- GPU de consumo: no cabe en ninguna consumer GPU actual, incluidas RTX 4090 (24 GB) y RTX 5090 (32 GB).
- NVFP4 y MXFP8 son formatos asociados al ecosistema NVIDIA ModelOpt y a las arquitecturas Blackwell; en GPU Ampere o Ada no hay soporte nativo a nivel de tensor core y el rendimiento puede degradarse, aunque este extremo no está documentado por el autor.
- Opciones de despliegue: vLLM con el lector NVFP4-CSF (`--quantization nvfp4_csf --load-format nvfp4_csf`). llama.cpp, Ollama o TGI no pueden abrir este directorio: no existe `model.safetensors.index.json` en el nivel superior y un cargador safetensors estándar fallará.
- Estructura de servicio: el directorio de servicio solo contiene metadatos; los pesos se leen desde `checkpoint_root`, definido en el bloque `quantization_config`.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Relacion | Tamano de pesos | Cuantizacion | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-NVFP4-MXFP8-CSF-QAD | Contenedor CSF del checkpoint NVFP4 | 102,76 GB | NVFP4 + MXFP8, escalas comprimidas | no disponible | LIL 1.0 + Qwen Community License 1.0 | HuggingFace, 0 descargas |
| local-inference-lab/Qwen3.8-Flash-Next-NVFP4 | Modelo base (relacion `quantized`) | 106,33 GB | NVFP4 + MXFP8 | no disponible | no disponible en la informacion proporcionada | HuggingFace |
| Qwen/Qwen3.8-Flash-Next | Modelo upstream (original sin cuantizar) | no disponible | no disponible (formato original) | no disponible | Qwen Community License 1.0, con condiciones de Model as a Service y AI Work Assistant | HuggingFace |

## Limitaciones y advertencias

- No es un modelo entrenado: no aporta ninguna mejora de calidad, razonamiento o conocimiento respecto al checkpoint NVFP4 del que procede. Cualquier limitación del modelo base se hereda íntegramente.
- El repositorio no declara idiomas soportados, longitud de contexto, número de parámetros ni resultados de evaluación.
- Riesgo de alucinación: no cuantificado ni documentado para este checkpoint; debe asumirse el del modelo base.
- Licencia doble: el contenedor se distribuye bajo la Local Inference Lab License 1.0, pero las condiciones de la Qwen Community License 1.0 (incluidas las cláusulas de Model as a Service y AI Work Assistant) siguen aplicándose. Es imprescindible revisar ambas antes de cualquier uso comercial.
- La licencia incluye un canario (`Ні пуху, ні пера`, id `LIL-CANARY-F930-750B-E4FA-82A6`) para trazabilidad del texto licenciado.
- Incompatibilidad de carga: al no existir `model.safetensors.index.json` en la raíz, los cargadores safetensors convencionales no abrirán el directorio. Es necesario vLLM con el lector NVFP4-CSF o restaurar el checkpoint a formato estándar.
- Los metadatos del índice de origen declaran `metadata.total_size` con un valor obsoleto (110.091.566.076 bytes frente a los 106.334.488.084 bytes reales de los 40 shards referenciados); el contrato de construcción marca esa semántica como `stale`.
- El fichero `hybrid-main-00002.safetensors` descargado con hf-xet 1.1.2 contiene una secuencia de 109 MB de bytes cero (capas 11 de atención y 12 de linear attention). Este contenedor incorpora los bytes verificados del fichero, no la copia corrupta.
- Existen tres placeholders sin tensores de 40 bytes (`model-00023/24/25-of-00041.safetensors`) que no están referenciados por el índice y no se incluyen.
- Sin validación comunitaria: 0 descargas y 0 likes en el momento de la consulta.
- El tamaño, 102,9 GB, hace inviable su uso en estaciones de trabajo con GPU de consumo y condiciona los costes de almacenamiento y transferencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/local-inference-lab/Qwen3.8-Flash-Next-NVFP4-MXFP8-CSF-QAD
- Modelo base (checkpoint NVFP4 del que deriva): https://huggingface.co/local-inference-lab/Qwen3.8-Flash-Next-NVFP4
- Modelo upstream original: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia del contenedor: https://huggingface.co/local-inference-lab/Qwen3.8-Flash-Next-NVFP4-MXFP8-CSF-QAD/blob/main/LICENSE
- Fichero de verificacion: https://huggingface.co/local-inference-lab/Qwen3.8-Flash-Next-NVFP4-MXFP8-CSF-QAD/blob/main/verification.json
- Herramienta de construccion y verificacion (trellis-quant, commit `60feca330087`): repositorio no enlazado en la model card; no disponible
- Paper, blog o demo adicionales: no disponibles; la busqueda web no devolvio resultados relacionados con el modelo
