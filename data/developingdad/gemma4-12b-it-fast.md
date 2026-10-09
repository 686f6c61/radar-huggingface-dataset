# DevelopingDad/Gemma4-12B-it-Fast

## Resumen

DevelopingDad/Gemma4-12B-it-Fast es un export cuantizado mixto NVFP4/FP8 del checkpoint DevelopingDad/gemma-4-12b-it-trial62, a su vez derivado de google/gemma-4-12B-it de Google DeepMind. Lo publica DevelopingDad como una release experimental orientada a servir el modelo con vLLM en una NVIDIA DGX Spark GB10, con una receta opcional de decodificación especulativa MTP8 usando el asistente google/gemma-4-12B-it-assistant. El problema que aborda es reducir el coste de inferencia de un modelo multimodal de tamano medio sin cambiar la arquitectura base ni el tokenizador.

La fuente contiene 11.959.730.224 elementos BF16 almacenados en 48 capas de lenguaje. La configuracion nativa admite 262.144 posiciones, aunque la receta de servicio probada en esta release usa 32.768 tokens de prompt mas salida. El pipeline declarado es image-text-to-text y la familia base Gemma 4 12B se documenta como multimodal encoder-free, con entrada nativa de texto, imagen, audio y video.

La relevancia actual esta en que combina un modelo de 12B con cuantizacion de 4 y 8 bits, compressed-tensors y vLLM, y publica una medida concreta de throughput: 52,98 tok/s de mediana y 50,55 tok/s de minimo en una comprobacion API final de un solo flujo. Sin embargo, la propia model card indica que la calificacion de calidad completa sigue pendiente y que no se ha establecido un suelo uniforme de 40 tok/s en contextos largos y solicitudes concurrentes.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 4 Unified, transformer multimodal encoder-free segun la documentacion de Google para Gemma 4 12B |
| Parametros totales | 11.959.730.224 elementos BF16 almacenados en la fuente, en 48 capas de lenguaje. El contador automatico de HuggingFace muestra 7.712.997.520 elementos U8 empaquetados, no pesos logicos |
| Parametros activos | no aplica, no es MoE |
| Longitud de contexto | 262.144 posiciones en la configuracion nativa; receta de servicio probada: 32.768 tokens de prompt mas salida |
| Tipos de cuantizacion | MLPs en NVFP4 con grupos de 16, escalas FP8 estaticas por bloque y divisores globales; atencion en FP8 por canal con activaciones FP8 dinamicas por token; escalas K/V calibradas como escalares FP8; compressed-tensors; etiqueta 8-bit |
| Idiomas soportados | no disponible; la calibracion uso 128 filas en ingles de C4 y no se documentan idiomas de inferencia |
| Licencia | apache-2.0, con enlace a la licencia Gemma 4 |
| Formato de pesos | safetensors (model.safetensors, 9.304.966.064 bytes); compressed-tensors |

## Arquitectura y entrenamiento

La release es una cuantizacion post-entrenamiento del checkpoint Trial62, que a su vez deriva de google/gemma-4-12B-it. El modelo fuente contiene 11.959.730.224 elementos BF16 almacenados en 48 capas de lenguaje y su configuracion nativa permite 262.144 posiciones. La conversion conserva el tokenizador, el procesador, la plantilla de chat nativa, el embedding/output-head BF16 atado y las proyecciones de medios. Los pesos de las MLPs de texto usan NVFP4 con MSE ponderado por importancia, grupos de 16, escalas FP8 estaticas por bloque y divisores globales; las activaciones de MLP usan NVFP4 dinamico local. La atencion usa FP8 por canal en pesos y FP8 dinamico por token en activaciones.

El converter maneja dimensiones de atencion heterogeneas por capa: 40 capas deslizantes con ocho cabezas KV y ocho capas completas con una cabeza KV. Los observadores de las proyecciones gate/up comparten estadisticas globales antes del empaquetado. Los 48 inicializadores KV, los 144 pesos MLP empaquetados y los 48 pares de escalas gate/up compartidas pasaron auditorias de exportacion. Estas comprobaciones establecen integridad del export, no equivalencia amplia de calidad.

La calibracion uso 128 filas de entrenamiento en ingles de C4, semilla 91027, maximo de 1.024 tokens, un buffer de mezcla de 512 filas y la revision de dataset 607bd4c8450a42878aa9ddc051a65a055450ef87. Se excluyeron prompts de benchmark y calidad, asi como respuestas observadas. No hubo entrenamiento adicional de alineacion ni eliminacion de rechazos en esta conversion. El metodo de modificacion original de Trial62 no esta documentado en su repositorio fuente y no se infiere en esta ficha.

## Capacidades

- Generacion de texto e instrucciones: el modelo parte de un checkpoint instruction-tuned de Gemma 4 12B IT, aunque esta release no publica evaluaciones de calidad propias.
- Entrada multimodal image-text-to-text: se conservan las proyecciones de medios en BF16. La documentacion de Google para Gemma 4 12B describe entrada nativa de texto, imagen, audio y video sin encoders separados.
- Decodificacion especulativa: la receta opcional usa el modelo asistente google/gemma-4-12B-it-assistant para generar borradores.
- Servido con vLLM: se apoya en compressed-tensors y en una receta de serving con MTP8.
- Tool calling o function calling: no documentado en la informacion disponible.
- Agentes y razonamiento multi-paso: no documentado especificamente; no hay evaluaciones incluidas en esta release.
- Capacidades multilingues: no disponibles; la calibracion se hizo solo con filas en ingles de C4.
- Capacidades especiales: export cuantizado mixto NVFP4/FP8 con auditorias de exportacion; no incluye entrenamiento adicional de alineacion.

## Casos de uso

- Servicio local de chat multimodal de baja latencia: desplegar el modelo con vLLM en una DGX Spark GB10 usando la receta MTP8 y decodificacion especulativa. Es adecuado para prototipos y demos que necesiten respuestas rapidas en una sola GPU, con la medida publicada de 52,98 tok/s de mediana.
- Atencion al cliente automatizada multi-turno con contexto largo: la receta probada admite 32.768 tokens de prompt mas salida, lo que permite mantener historiales extensos y documentos adjuntos. La calidad en contextos largos no esta validada de forma uniforme.
- Procesamiento de documentos con imagenes: pipeline image-text-to-text para extraer o resumir informacion de capturas, diagramas o paginas escaneadas. Las proyecciones de medios se conservan en BF16, lo que facilita heredar la funcionalidad multimodal del modelo base.
- Analisis de audio y video en local: si se heredan las capacidades nativas de Gemma 4 12B, el modelo puede emplearse para resumen o comprension de contenido audiovisual sin encoders adicionales. Esta release no publica evaluaciones especificas de audio o video.
- Investigacion en cuantizacion y serving: reproducir la receta NVFP4/FP8, comparar con checkpoints de referencia de Unsloth y medir el equilibrio entre precision y velocidad. Es un caso adecuado para estudiar el impacto de la cuantizacion mixta en MLPs y atencion.
- Evaluacion de decodificacion especulativa: usar el asistente de Google para medir la aceleracion frente a decodificacion estandar y validar la receta MTP8 en distintos tamanos de contexto y cargas concurrentes.
- Despliegue en estaciones de trabajo con VRAM limitada: el archivo de pesos ocupa 9.304.966.064 bytes, por lo que podria caber en GPUs de 16 GB o mas si el stack soporta NVFP4/FP8 y compressed-tensors. Esta posibilidad no esta confirmada oficialmente.

## Benchmarks y rendimiento

| Metrica | Resultado | Condiciones |
|---|---|---|
| MMLU | no disponible | no publicado en la informacion disponible |
| HumanEval | no disponible | no publicado en la informacion disponible |
| GSM8K | no disponible | no publicado en la informacion disponible |
| Throughput mediano | 52,98 tok/s | Comprobacion API final, single-stream, receta MTP8 completa y plantilla de contrato de respuesta, NVIDIA DGX Spark GB10 |
| Throughput minimo | 50,55 tok/s | Mismas condiciones que la mediana |
| Suelo uniforme de 40 tok/s | no establecido | No validado en contextos largos ni en solicitudes concurrentes |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La unica cifra de rendimiento publicada es el throughput de la receta de serving.

## Requisitos de hardware

- Pesos: 9.304.966.064 bytes, aproximadamente 9,3 GB, en safetensors.
- VRAM estimada: alrededor de 9,3 GB solo para pesos. Con cache KV y activaciones, se recomienda 16 GB o mas para contextos moderados. Para 32.768 tokens, la VRAM necesaria puede ser mayor y no esta cuantificada en la informacion disponible. Es una estimacion, no un dato oficial.
- GPU probada: NVIDIA DGX Spark GB10.
- GPU recomendadas: no hay una lista oficial en la informacion proporcionada. La unica GPU documentada en las pruebas es la DGX Spark GB10. Para produccion con vLLM podrian considerarse GPUs con soporte FP8 y NVFP4, pero no se confirma en esta ficha.
- GPU de consumo: no confirmado. Por tamano de pesos, podria caber en GPUs con 16 GB o mas, como una RTX 4090 de 24 GB, siempre que el stack soporte NVFP4/FP8 y compressed-tensors. Requiere validacion.
- Opciones de despliegue: vLLM con overlay opcional, compressed-tensors y transformers. No hay documentacion de llama.cpp, Ollama o TGI para este formato cuantizado en la informacion disponible.
- Latencia y throughput: 52,98 tok/s de mediana y 50,55 tok/s de minimo en single-stream con la receta MTP8 completa sobre DGX Spark GB10. No hay datos de concurrencia ni de contextos largos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| google/gemma-4-12B-it | no disponible el desglose exacto; denominado 12B | 262.144 posiciones nativas segun la configuracion heredada | BF16 | licencia Gemma 4 | HuggingFace |
| DevelopingDad/gemma-4-12b-it-trial62 | 11.959.730.224 elementos BF16 almacenados | 262.144 posiciones nativas | BF16 | no disponible | HuggingFace |
| DevelopingDad/Gemma4-12B-it-Fast | 11.959.730.224 elementos BF16 logicos; 7.712.997.520 elementos U8 empaquetados segun el contador automatico | 262.144 posiciones nativas; 32.768 tokens en la receta probada | NVFP4 en MLPs y FP8 en atencion; compressed-tensors | apache-2.0 con enlace a la licencia Gemma 4 | HuggingFace |
| Checkpoints de referencia de Unsloth para Gemma 4 12B IT | no disponible | no disponible | no disponible | no disponible | mencionados como referencia de comparacion en la model card |

No se dispone de datos comparativos con Qwen o DeepSeek en la informacion proporcionada. La comparacion directa mas fiable es con el checkpoint fuente Trial62 y con el modelo original google/gemma-4-12B-it.

## Limitaciones y advertencias

- Estado experimental: la model card indica que la calificacion de calidad completa sigue pendiente.
- No se ha establecido un suelo uniforme de 40 tok/s en contextos largos ni en solicitudes concurrentes.
- No hay benchmarks de calidad publicados (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.
- La calibracion uso solo 128 filas en ingles de C4; no hay validacion multilingue ni de otros dominios.
- La cuantizacion puede degradar la calidad. Las auditorias de exportacion solo garantizan integridad del export, no equivalencia amplia de calidad.
- El metodo de modificacion de Trial62 no esta documentado en su repositorio fuente y no se infiere en esta ficha.
- No se realizo entrenamiento adicional de alineacion ni eliminacion de rechazos en esta conversion.
- El contador automatico de parametros de HuggingFace puede confundir: cuenta elementos U8 empaquetados, no pesos logicos.
- La licencia declarada es apache-2.0, pero incluye un enlace a la licencia Gemma 4. Conviene revisar los terminos aplicables antes de un uso comercial.
- Riesgo de alucinacion: inherente a los modelos generativos. No hay evaluacion especifica en esta release.
- Sesgos: no documentados. La calibracion en ingles de C4 puede introducir sesgos linguisticos y culturales.
- Contexto: la receta probada usa 32.768 tokens. No se ha validado el rendimiento en las 262.144 posiciones nativas ni en cargas concurrentes.
- Dependencia de un modelo asistente separado para la decodificacion especulativa. El asistente no esta incluido en el repositorio y debe descargarse aparte.
- Formato: compressed-tensors requiere soporte de vLLM y llm-compressor. No hay GGUF, Ollama o TGI documentados para este checkpoint.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DevelopingDad/Gemma4-12B-it-Fast
- Checkpoint fuente Trial62: https://huggingface.co/DevelopingDad/gemma-4-12b-it-trial62
- Modelo original de Google: https://huggingface.co/google/gemma-4-12B-it
- Modelo asistente de Google: https://huggingface.co/google/gemma-4-12B-it-assistant
- Modelo base de la familia: https://huggingface.co/google/gemma-4-12B
- Guia para desarrolladores de Gemma 4 12B: https://developers.googleblog.com/gemma-4-12b-the-developer-guide/
- Guia de especificaciones y ejecucion local: https://blog.buildfastwithai.com/gemma-4-12b-guide
- Pagina de Gemma 4 en Google DeepMind: https://deepmind.google/models/gemma/gemma-4/
- Informe tecnico citado: https://arxiv.org/abs/2607.02770
- vLLM: https://github.com/vllm-project/vllm
- llm-compressor: https://github.com/vllm-project/llm-compressor
- compressed-tensors: https://github.com/vllm-project/compressed-tensors
- Dataset C4: https://huggingface.co/datasets/allenai/c4
- FlashInfer: https://github.com/flashinfer-ai/flashinfer
- CUTLASS: https://github.com/NVIDIA/cutlass
- PyTorch: https://github.com/pytorch/pytorch
- Transformers: https://github.com/huggingface/transformers
- MODIFICATIONS.md: https://huggingface.co/DevelopingDad/Gemma4-12B-it-Fast/blob/main/MODIFICATIONS.md
- provenance.json: https://huggingface.co/DevelopingDad/Gemma4-12B-it-Fast/blob/main/provenance.json
- SHA256SUMS: https://huggingface.co/DevelopingDad/Gemma4-12B-it-Fast/blob/main/SHA256SUMS
