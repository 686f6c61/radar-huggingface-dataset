# local-inference-lab/DeepSeek-V4.1-Flash-lossless-CSF

## Resumen

DeepSeek-V4.1-Flash-lossless-CSF es un contenedor de pesos cuantizados publicado por Local Inference Lab que empaqueta el modelo `deepseek-ai/DeepSeek-V4.1-Flash` (revisión `dba1be0a40aa45a94ad051997016db3960a90277`) aplicando una compresión sin pérdida sobre las escalas de bloque de sus expertos enrutados. No es un modelo nuevo ni un reentrenamiento: es el mismo checkpoint multimodal, con los mismos nombres de tensor, dtypes, formas y metadatos, pero con las matrices de escala MXFP4 almacenadas en un formato comprimido denominado CSF (codec `row-base-offset1-u24-exceptions/1`).

El problema que resuelve es de almacenamiento y distribución: el checkpoint original ocupa 510,30 GB en ficheros de pesos, y este contenedor ocupa 495,63 GB, un ahorro de 14,67 GB. El grueso del ahorro proviene de 46.080 matrices de escala UE8M0 (40 capas x 384 expertos x 3 proyecciones), que pasan de 16,99 GB a 2,31 GB, es decir, un 13,6 por ciento de su tamaño original. La decodificación es aritmética entera sobre bytes, sin recuantización ni ajuste, y permite restaurar los shards originales de forma bit-exacta.

Es relevante ahora porque demuestra una vía de compresión verificable para checkpoints MoE de gran tamaño en FP4/FP8, un cuello de botella real cuando se sirven modelos multimodales de cientos de gigabytes en infraestructura propia. El precio es una licencia propia restrictiva y la dependencia de un lector específico integrado en vLLM.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (familia `deepseek_v41`): 40 capas con 384 expertos enrutados por capa, expertos compartidos, tablas Engram, codificador de visión, aligner y cabecera MTP |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP4 (E2M1 con escala UE8M0 por cada 32) en expertos enrutados; FP8 E4M3 con escalas UE8M0 en atención, expertos compartidos y tablas Engram; codificador de visión, aligner y MTP conservan el formato de origen |
| Idiomas soportados | no disponible |
| Licencia | Local Inference Lab License, Version 1.0 (`LicenseRef-LIL-1.0`), no es open source; el modelo de origen se distribuye bajo licencia MIT |
| Formato de pesos | safetensors, con las escalas de bloque de los expertos enrutados almacenadas como `*.mxfp4_csf_fixed` (uint8) y `*.mxfp4_csf_exceptions` (uint32); no hay `model.safetensors.index.json` en la raíz |

Nota: el número de parámetros totales y activos del modelo base no aparece en la información proporcionada. El dato estructural disponible es el de 40 capas x 384 expertos enrutados, con 3 proyecciones por experto, lo que da las 46.080 matrices de escala mencionadas en la model card.

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer de mezcla de expertos (MoE) multimodal. La model card describe cuatro bloques diferenciados: expertos enrutados en MXFP4 (E2M1 con escala UE8M0 por cada 32 valores), atención, expertos compartidos y tablas Engram en FP8 E4M3 con escalas UE8M0, y un codificador de visión junto con un aligner y una cabecera MTP (multi-token prediction) que conservan el formato de origen, incluidos los expertos enrutados del propio MTP. La presencia de un codificador de visión y de un aligner es coherente con el pipeline declarado `image-text-to-text`.

Este repositorio no entrena nada: es un artefacto de exportación construido con `trellis-quant` (`trellis_quant.lossless_scale_checkpoint`, commit `60feca330087`). La innovación técnica es el códec CSF aplicado únicamente a los planos de escala de bloque: almacena las escalas UE8M0 de forma comprimida mediante aritmética entera sobre bytes, sin recuantizar ni reajustar los valores. Todo lo demás (nibbles FP4, resto de tensores, dtypes, formas y metadatos) permanece byte a byte idéntico. No se documentan en la información disponible ni el número de tokens de entrenamiento, ni la composición del dataset, ni si hubo RLHF o DPO.

## Capacidades

- Inferencia multimodal de imagen y texto: el pipeline declarado es `image-text-to-text` e incluye codificador de visión y aligner.
- Generación de texto con arquitectura MoE de gran escala: 40 capas con 384 expertos enrutados por capa y expertos compartidos.
- Predicción multi-token (MTP) mediante cabecera específica, con sus propios expertos enrutados.
- Almacenamiento comprimido y restaurable de forma bit-exacta: `verify` reconstruye cada shard y compara SHA-256; `restore` escribe una copia ordinaria del checkpoint de origen.
- Servicio mediante vLLM con cuantización `mxfp4_csf` y formato de carga `mxfp4_csf`.
- Tool calling, function calling, modo de razonamiento explícito y capacidades de agente: no documentados en la información disponible (corresponderían al modelo base, no a este contenedor).
- Idiomas soportados: no disponible.
- Capacidades de audio: no disponibles y no mencionadas.

## Casos de uso

- Servicio multimodal on-premise: desplegar el checkpoint en un clúster propio con vLLM usando `--quantization mxfp4_csf --load-format mxfp4_csf`, apuntando el directorio de servicio a los metadatos y dejando los pesos en `checkpoint_root`, para tareas de imagen-texto sin enviar datos a terceros.
- Reducción del almacenamiento en registries internos: 14,67 GB menos por copia de un checkpoint de 510,30 GB, con verificación SHA-256 de cada shard, lo que abarata mantener varias revisiones en almacenamiento de objetos.
- Distribución de checkpoints a nodos de inferencia: transferir 495,63 GB en lugar de 510,30 GB mantiene la integridad bit-exacta y reduce el tiempo de sincronización entre centros de datos.
- Pipeline de CI/CD con verificación de integridad: integrar `trellis_quant.lossless_scale_checkpoint verify` como paso obligatorio antes de promover un checkpoint a producción, comprobando 46.080 matrices de escala y 48 shards.
- Recuperación y auditoría de artefactos: usar `restore` para regenerar el checkpoint original desde el contenedor y comparar hashes cuando se necesita reproducir exactamente un resultado previo.
- Investigación en compresión sin pérdida de cuantizaciones de bloque: el códec `row-base-offset1-u24-exceptions/1` sobre escalas UE8M0 es un caso de estudio reproducible para quien trabaja en formatos MXFP4/FP8.
- Servicio de inferencia FP4/FP8 en infraestructura con aceleradores de 80 GB: al requerir aproximadamente 500 GB de pesos, el despliegue es viable en nodos de 8 GPU, lo que encaja en plataformas de inferencia internas ya existentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card de este repositorio no incluye métricas de MMLU, HumanEval, GSM8K ni similares, y las búsquedas web realizadas no devolvieron documentación técnica relevante sobre el modelo. Al tratarse de un contenedor sin recuantización, cualquier benchmark del modelo base debería reproducirse, pero no se aportan cifras que permitan afirmarlo con datos.

## Requisitos de hardware

- Almacenamiento en disco: 495,63 GB para los ficheros de pesos de este contenedor (510,30 GB en el origen); hay que sumar el espacio del directorio de servicio, que contiene solo metadatos.
- VRAM estimada: aproximadamente 500 GB solo para pesos, más activaciones y caché KV; es una estimación derivada del tamaño del repositorio, no un dato publicado.
- GPU recomendadas: nodos de 8 x H100 80 GB (640 GB) o 8 x A100 80 GB (640 GB) como mínimo razonable para alojar los pesos.
- GPU de consumo: no cabe. Una RTX 4090 de 24 GB, o incluso varias, no pueden alojar el checkpoint.
- Opciones de despliegue: vLLM con soporte del lector MXFP4-CSF (`--quantization mxfp4_csf --load-format mxfp4_csf`). El directorio de servicio debe contener los ficheros de `metadata/` con el `quantization_config` de `config.json` ampliado con `quant_method: mxfp4_csf`, `format_version: 1` y `checkpoint_root`. Otros motores como llama.cpp, Ollama o TGI no están documentados para este formato y no pueden leerlo sin un lector CSF específico.
- Compatibilidad de cargadores: al no existir `model.safetensors.index.json` en la raíz, un cargador estándar de safetensors no abrirá el directorio por error.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato y tamano | Licencia | Notas |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-lossless-CSF | no disponible | no disponible | safetensors + CSF, 495,63 GB | LIL 1.0 (no open source) | Contenedor con escalas comprimidas y restauracion bit-exacta |
| deepseek-ai/DeepSeek-V4.1-Flash | no disponible | no disponible | safetensors, 510,30 GB | MIT | Modelo de origen, revision `dba1be0a` |
| local-inference-lab/DeepSeek-V4.1-Flash-MXFP4-CSF | no disponible | no disponible | safetensors + CSF (revision `872da235`) | no disponible | `tensors/` byte-identico al de este repositorio; esta version anade la LICENSE de origen en `metadata/` y registra la revision fuente |

No se dispone de datos de benchmarks ni de otros modelos comparables de la misma categoria en la informacion proporcionada, por lo que la comparacion se limita a los tres artefactos anteriores.

## Limitaciones y advertencias

- Licencia restrictiva: la Local Inference Lab License, Version 1.0 reproduce los terminos de Apache 2.0 pero anade condiciones que los restringen. No es codigo abierto ni licencia Apache. Los ficheros de este repositorio estan sujetos a ella, aunque el modelo de origen sea MIT.
- Prohibicion de reupload: no se pueden subir, replicar ni redistribuir estos ficheros ni copias sustancialmente similares (renombradas, re-shardeadas, reempaquetadas, sin metadatos, convertidas o descuantizadas). Las copias publicadas hasta la revision `c5c41fe301c4c1d24fc09376883d9168e521dc66` inclusive siguen bajo MIT.
- Marca canaria de licencia: la model card incluye una cadena canary (`Ні пуху, ні пера`) y un identificador `LIL-CANARY-4A08-5BF0-5CDE-25E4`; su presencia o ausencia se usa para rastrear copias.
- Dependencia de software especifico: el despliegue exige vLLM con el lector MXFP4-CSF y `trellis-quant` para verificar o restaurar. No es un checkpoint cargable con herramientas estandar.
- Tamano de almacenamiento muy alto: 495,63 GB de pesos, fuera del alcance de cualquier GPU de consumo y de la mayoria de nodos de 1 o 2 GPU.
- Sin benchmarks publicados: no hay datos de rendimiento en la informacion disponible; cualquier afirmacion de calidad debe remitirse al modelo base.
- Riesgo de alucinacion y sesgos: no se documentan en este repositorio. Al no haber recuantizacion, se heredan los del modelo base, que tampoco se describen en la informacion disponible.
- Idiomas soportados: no disponibles; no se puede garantizar cobertura multilingue concreta.
- Proceso de verificacion costoso: `verify` y `restore` reconstruyen 48 shards y 46.080 matrices de escala, con un coste de computo y almacenamiento temporal que conviene planificar.
- Ausencia de `model.safetensors.index.json`: funciona como salvaguarda, pero rompe flujos que esperen un checkpoint safetensors convencional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/local-inference-lab/DeepSeek-V4.1-Flash-lossless-CSF
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash
- Licencia del contenedor: https://huggingface.co/local-inference-lab/DeepSeek-V4.1-Flash-lossless-CSF/blob/main/LICENSE
- Variante relacionada del mismo autor: https://huggingface.co/local-inference-lab/DeepSeek-V4.1-Flash-MXFP4-CSF
- Herramienta de construccion y verificacion: `trellis-quant`, commit `60feca330087`, familia `deepseek_v41` (sin URL publica en la informacion disponible)
- Nota sobre la busqueda web: las consultas realizadas devolvieron unicamente resultados sobre agencias de comunicacion digital y locales comerciales, sin relacion con el modelo; no se han podido incorporar papers, blogs ni demos adicionales.
