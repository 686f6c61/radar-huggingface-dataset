# andrzejmontano/Nemotron-3.5-Embed-8B-mlx-8bit

## Resumen

Nemotron-3.5-Embed-8B-mlx-8bit es una cuantizacion de 8 bits en formato MLX del checkpoint de embeddings multimodales Nemotron-3.5-Embed-8B-BF16 de NVIDIA, publicada por el usuario andrzejmontano para su ejecucion en Apple Silicon. No es un modelo generativo: se trata de un codificador de embeddings de 8.381.155.328 parametros que combina una torre de vision estilo Pixtral (ViT) con un backbone de texto Ministral3 de 34 capas y 4096 dimensiones ocultas, mas un proyector gelu, y que carece de `lm_head`. Su proposito es producir representaciones vectoriales L2-normalizadas de 4096 dimensiones para busqueda semantica y RAG sobre corpus mixtos de texto e imagen.

La relevancia de esta publicacion es practica: reduce el peso en disco de 15,61 GB (BF16) a 8,76 GB mediante cuantizacion afina de 8 bits con grupo de 64 sobre las 409 lineales del modelo, manteniendo una fidelidad muy alta respecto al original (peor coseno por vector de 0,99946 y ranking de recuperacion identico). Ademas, la inferencia de texto resulta ligeramente mas rapida que en BF16 (aproximadamente 44 ms frente a 67 ms por texto corto).

El modelo soporta una ventana de contexto de 262.144 posiciones (con extension YaRN, factor 16 sobre 16.384) y esta orientado exclusivamente al ingles. Su licencia es la NVIDIA Open Model License, heredada del checkpoint original. Es importante senalar que no funciona con `mlx_lm` ni con el `mistral3` generativo de `mlx_vlm`: requiere un cargador MLX especifico para embeddings.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mistral3 de embeddings (ViT Pixtral + backbone Ministral3 + proyector gelu), sin `lm_head` |
| Parametros totales | 8.381.155.328 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 posiciones (YaRN f=16 sobre 16.384) |
| Tipos de cuantizacion | 8 bits afino, grupo 64 (lineales); BF16 en `embed_tokens`, RMSNorms y `patch_conv` |
| Idiomas soportados | en |
| Licencia | nvidia-open-model-license |
| Formato de pesos | safetensors (MLX); repo de 9,4 GB, checkpoint de 8,76 GB |

## Arquitectura y entrenamiento

El modelo es un codificador de embeddings construido sobre la arquitectura Mistral3: una torre de vision ViT de estilo Pixtral, un backbone de texto Ministral3 con 4096 dimensiones ocultas, 34 capas, 32 cabezas de atencion, 8 cabezas KV, dimension de cabeza 128 y MLP de 14336, con embeddings no atados, y un proyector gelu que alinea los espacios de vision y texto. La ruta de texto emplea atencion bidireccional (no causal) y mean pooling sobre los tokens, seguido de normalizacion L2; la configuracion de pooling se documenta en `1_Pooling/config.json`. Al carecer de `lm_head`, el modelo no genera texto.

La cuantizacion aplicada convierte las 409 lineales (238 de texto, 168 de vision y 3 del proyector) a 8 bits afino con grupo 64, manteniendo en BF16 los embeddings de tokens, todas las RMSNorms y la convolucion de parches de vision (transpuesta de PyTorch a MLX). Los nombres de pesos y el bloque `quantization` de `config.json` siguen la convencion estandar de MLX. No se dispone de informacion sobre el volumen ni la composicion del dataset de entrenamiento original, ni sobre si se aplicaron tecnicas de RLHF o DPO; la model card unicamente documenta el proceso de portado y validacion respecto al checkpoint BF16 de NVIDIA.

## Capacidades

- Generacion de embeddings de texto con atencion bidireccional y mean pooling, normalizados L2, de 4096 dimensiones.
- Embeddings multimodales: texto, imagen, y combinaciones imagen+texto (companion).
- Busqueda semantica y recuperacion sobre corpus mixtos de texto e imagen mediante similitud coseno.
- Protocolo de prompt asimetrico: prefijo `query:` para consultas y `passage:` para documentos, insertado en el rol de sistema a traves de la plantilla de chat; los prefijos no llevan espacio final.
- Procesamiento de imagenes de alta resolucion mediante el procesador Pixtral (por ejemplo, una imagen de 960x540 se procesa a 560x980 con 700 tokens `[IMG]`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generacion de texto.
- Capacidad multilingue limitada al ingles.

## Casos de uso

- Busqueda semantica y RAG sobre corpus mixtos de texto e imagen: el modelo indexa documentos e imagenes con el prefijo `passage:` y consultas con `query:`, permitiendo recuperar resultados por similitud coseno en espacios de 4096 dimensiones. Es adecuado por su ventana de 262.144 posiciones, que permite embeber documentos largos sin truncamiento.
- Recuperacion multimodal en catalogos de producto: cada ficha puede embeber imagen y texto companion conjuntamente, de modo que una consulta textual recupere productos visualmente relevantes.
- Indexacion de documentacion tecnica con capturas de pantalla: los manuales que combinan diagramas e imagenes con texto pueden vectorizarse en una sola representacion, simplificando el pipeline de recuperacion.
- Deduplicacion y clustering semantico de contenido: las representaciones normalizadas facilitan agrupar documentos o imagenes similares mediante similitud coseno, util para limpieza de corpus.
- Ejecucion local en Apple Silicon: al estar cuantizado en MLX 8 bits (8,76 GB), permite desplegar un codificador de embeddings de alta fidelidad en equipos con memoria unificada, sin depender de GPUs dedicadas.
- Sistemas de recomendacion basados en contenido: embeber items multimodales y calcular vecinos mas cercanos para sugerir contenido relacionado.
- Evaluacion comparativa de fidelidad de cuantizacion: sirve como referencia para medir el impacto de la cuantizacion MLX respecto al checkpoint BF16 original en tareas de recuperacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta validaciones de fidelidad respecto al checkpoint BF16 y las puntuaciones de referencia publicadas por NVIDIA para pares de entrada concretos:

| Par de entrada | Puntuacion publicada (BF16) |
|---|---|
| query vs image+text | 0,5402 |
| query vs text | 0,5873 |
| query vs image | 0,5158 |
| biology text vs text | 0,2474 |

Validacion de la cuantizacion frente a BF16 con entradas identicas: peor coseno por vector de 0,99946, ranking de recuperacion coincidente con BF16 y deltas de puntuacion dentro de 3,1e-3. Latencia de texto cuantizado de aproximadamente 44 ms frente a 67 ms en BF16 por texto corto. El portado BF16 se valido contra la implementacion oficial de PyTorch/HF con un peor coseno por vector de 0,99978.

## Requisitos de hardware

- VRAM/memoria estimada: 8,76 GB para los pesos cuantizados en 8 bits; el checkpoint BF16 original ocupa 15,61 GB.
- Entorno objetivo: Apple Silicon con MLX; requiere un cargador MLX especifico para embeddings (no funciona con `mlx_lm` ni con el `mistral3` generativo de `mlx_vlm`).
- GPU dedicadas (A100, H100, RTX 4090): no disponible; el checkpoint esta empaquetado para MLX y la informacion proporcionada no documenta su ejecucion en CUDA.
- Compatibilidad con GPU de consumo: no disponible para el formato MLX en hardware NVIDIA; en Apple Silicon depende de la memoria unificada del equipo.
- Opciones de despliegue: MLX con un loader de embeddings; no se documentan vLLM, llama.cpp, Ollama ni TGI para este checkpoint.
- Latencia: aproximadamente 44 ms por texto corto en el entorno de validacion del autor; throughput no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dimension de embedding | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nemotron-3.5-Embed-8B-mlx-8bit | 8,38 B | 262.144 | 4096 | nvidia-open-model-license | MLX (Apple Silicon) |
| Nemotron-3.5-Embed-8B-BF16 (NVIDIA) | 8,38 B | 262.144 | 4096 | nvidia-open-model-license | PyTorch/HF |
| Nemotron-3-Embed-1B | no disponible | no disponible | 2048 | no disponible | no disponible |

El checkpoint de 8B no es compatible a nivel de pesos con la variante de 1B, por lo que cambiar entre ambos exige reindexar el corpus. Tampoco es intercambiable con otros modelos de embedding de igual dimension: por ejemplo, los embeddings de Qwen3-VL tambien son de 4096 dimensiones pero pertenecen a un espacio distinto.

## Limitaciones y advertencias

- No es un modelo generativo: carece de `lm_head` y no puede producir texto, razonar ni ejecutar tool calling.
- Solo soporta ingles; el rendimiento en otros idiomas no esta documentado.
- Riesgo de alucinacion no aplicable a la generacion, pero la recuperacion puede devolver resultados irrelevantes si se mezclan espacios de embedding de modelos distintos.
- Los espacios de embedding no son intercambiables aunque coincidan en dimension: debe marcarse la identidad del modelo y la dimension en cada vector almacenado.
- El protocolo de prefijos (`query:` y `passage:`) es obligatorio y asimetrico; su omision degrada la calidad de la recuperacion.
- El checkpoint esta empaquetado para MLX y no carga con `mlx_lm` ni con el `mistral3` generativo de `mlx_vlm`.
- Uso comercial sujeto a los terminos de la NVIDIA Open Model License; debe consultarse la model card de NVIDIA para las condiciones completas.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: se trata de un portado de terceros, no de una publicacion oficial de NVIDIA, lo que implica menor soporte y trazabilidad.

## Enlaces

- Hugging Face: https://huggingface.co/andrzejmontano/Nemotron-3.5-Embed-8B-mlx-8bit
- Modelo base: https://huggingface.co/nvidia/Nemotron-3.5-Embed-8B-BF16
- MLX (repositorio oficial): https://github.com/ml-explore/mlx
