# arvedo/NVIDIA-Nemotron-3.5-Bolt-E4B-NVFP4-LowMemory

## Resumen

NVIDIA-Nemotron-3.5-Bolt-E4B-NVFP4-LowMemory es una cuantizacion de 4 bits en formato NVFP4 del modelo `nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16`, publicada por el usuario arvedo. El objetivo es reducir el checkpoint original de 14,89 GiB a 4,79 GiB en disco (4,65 GiB en VRAM durante la inferencia) para que el modelo quepa en GPUs de consumo con 6 y 8 GB de VRAM, como la RTX 4060 o la RTX 5060, manteniendo el soporte multimodal completo de vision y audio.

El modelo base es un transformer multimodal de tipo image-text-to-text con 8.667.245.130 parametros totales, segun los safetensors del repositorio. La cuantizacion combina capas transformer en NVFP4 (formato E2M1) calibradas a 128k, codificadores de vision y audio en MXFP8 y un `lm_head` en 4 bits con `B12xBlockscaledLinear`. El autor reporta una retencion superior al 99% de la precision BF16 original, con una delta media de -0,66% sobre 20.565 preguntas de texto y una paridad superior al 99,8% en las suites de vision y audio.

La relevancia actual del modelo radica en que permite ejecutar un modelo multimodal de ~8,7B parametros en hardware de gama media-baja, algo que el checkpoint BF16 original no permite. Requiere vLLM y kernels Triton especificos (incluido `vllm_nemotron_patch.py` v5) y esta optimizado para GPUs Blackwell y Rubin de NVIDIA. La licencia es openmdw-1.1.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), derivada de Gemma 4 (`Gemma4ForConditionalGeneration`) |
| Parametros totales | 8.667.245.130 |
| Parametros activos | no disponible |
| Longitud de contexto | 128k (calibracion NVFP4 a 128k; contexto maximo del base no confirmado en la informacion) |
| Tipos de cuantizacion | NVFP4 (E2M1) en capas transformer y embeddings/PLE; MXFP8 en codificadores de vision y audio; 4-bit en `lm_head`; pesos base BF16 disponibles en el modelo original |
| Idiomas soportados | en, de, fr, es, it, ja (segun la model card; el campo `language` del repo solo lista en) |
| Licencia | openmdw-1.1 |
| Formato de pesos | safetensors (repo de 10,3 GB; checkpoint declarado de 4,79 GiB) |

## Arquitectura y entrenamiento

El modelo base sigue una arquitectura transformer multimodal con torres separadas de vision y audio, empaquetada como `Gemma4ForConditionalGeneration`. Incluye tablas de embedding de token y de embedding por capa (PLE, Per-Layer Embedding) de 3,49B parametros con forma `[262144, 13312]`, y una proyeccion `per_layer_model_projection`. Esta edicion cuantiza esas tablas a 4 bits NVFP4 (4,5 bits por elemento), ejecuta la proyeccion PLE en tensor cores FP4 nativos W4A4 de Blackwell y sustituye la dequantizacion multi-paso en PyTorch por un kernel Triton fusionado (`_nemo_nvfp4_embed_kernel`, v5) con `out_scale` fusionado y mascaras de limites.

No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens, ni sobre si hubo RLHF o DPO en el modelo base. La cuantizacion se calibro a 128k de contexto y el autor reporta que conserva el 99,2% de la precision del baseline BF16 en 20.565 preguntas de 16 benchmarks de matematicas, codigo, razonamiento e instrucciones. La innovacion tecnica destacable es el kernel de lookup de embeddings NVFP4 fusionado, que lee un 44% menos de bytes desde VRAM y mejora el throughput de decodificacion por lotes (1.695,0 tok/s frente a 1.636,1 tok/s con concurrencia 32).

## Capacidades

- Generacion de texto conversacional en ingles, aleman, frances, espanol, italiano y japones.
- Razonamiento e instrucciones: la model card reporta evaluacion en 16 benchmarks de matematicas, codigo, razonamiento e instruction-following.
- Vision: procesamiento de imagenes dentro del pipeline image-text-to-text, con torre de vision cuantizada en MXFP8.
- Audio: soporte de entrada de audio con torre dedicada en MXFP8.
- Inferencia multimodal combinada (texto, imagen y audio) mediante `Gemma4ForConditionalGeneration`.
- Compatibilidad con vLLM como motor de inferencia.
- Soporte de contexto largo: calibracion a 128k y benchmark de decodificacion pura a 32k tokens.
- Tool calling y function calling: no confirmado en la informacion disponible.
- Modo thinking explicito: no confirmado en la informacion disponible.

## Casos de uso

- Inferencia multimodal en GPUs de 6-8 GB: desplegar un modelo de vision y audio en una RTX 4060 o RTX 5060 para tareas de descripcion de imagenes o transcripcion asistida, aprovechando los 4,65 GiB de VRAM en motor.
- Asistentes conversacionales multilingues: atender conversaciones en ingles, aleman, frances, espanol, italiano y japones con un unico checkpoint de menos de 5 GiB.
- Procesamiento de documentos con imagenes: extraer informacion de capturas, formularios o diagramas usando la torre de vision, con contexto suficiente para incluir varias paginas en una sola peticion.
- Analisis de audio en local: transcribir o resumir entradas de audio en estaciones de trabajo sin GPU de datacenter, gracias a la torre de audio en MXFP8.
- Servicio de inferencia por lotes en vLLM: aprovechar el throughput de 1.695 tok/s con concurrencia 32 en GPUs Blackwell para servir a varios usuarios simultaneamente.
- Prototipado e investigacion en hardware de consumo: validar pipelines multimodales antes de escalar al checkpoint BF16 de 14,89 GiB en servidores.
- Razonamiento y generacion de codigo en entornos con VRAM limitada: usar los benchmarks de codigo y matematicas del autor como referencia para tareas de asistencia tecnica.

## Benchmarks y rendimiento

| Benchmark / suite | Este modelo (NVFP4 LowMemory) | Base BF16 | Delta |
|---|---|---|---|
| Suite de texto (20.565 preguntas, 16 benchmarks) | 78,74% | 79,40% (o 79,09% segun la comparacion entre ediciones) | -0,66% |
| Suite de vision y audio (2.203 preguntas) | 73,72% | 73,81% (edicion estandar) / 73,40% (referencia Gemma 4 E4B-IT BF16) | >99,8% de paridad |
| Decodificacion por lotes, concurrencia 32 | 1.695,0 tok/s | 1.636,1 tok/s (edicion estandar) | +3,6% |
| Decodificacion pura a 32k, concurrencia 1 | 123,6 tok/s | 120,9 tok/s (edicion estandar) | +2,2% |

Los datos de la suite de texto y de vision/audio son porcentajes agregados reportados por el autor; no se desglosan los resultados por benchmark individual (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Las cifras de throughput se midieron en una DGX Spark GB10.

## Requisitos de hardware

- VRAM estimada: 4,65 GiB en motor de inferencia; 4,79 GiB de checkpoint en disco.
- GPUs objetivo: RTX 4060, RTX 5060, RTX 5070 (6-8 GB), y GPUs de servidor con margen amplio para cache KV de 128k.
- Cabe en GPU de consumo de 6 y 8 GB de VRAM; segun el autor, tambien en GPUs de 8 GB con headroom para contexto largo.
- Optimizado para arquitecturas Blackwell y Rubin de NVIDIA (tensor cores FP4 nativos W4A4).
- Motor de despliegue: vLLM, con el parche `vllm_nemotron_patch.py` v5 y kernels Triton.
- Existe una edicion GGUF (`arvedo/Nemotron-3.5-Bolt-E4B-NVFP4-VisionAudio-GGUF`, 6,11 GB + 946 MB mmproj) para pruebas en CPU y llama.cpp, aunque el autor no la presenta como mejora de velocidad frente a Q4_K_M.
- Latencia y throughput: 123,6 tok/s en decodificacion pura a 32k con concurrencia 1 y 1.695,0 tok/s con concurrencia 32 en DGX Spark GB10.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / VRAM | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nemotron-3.5-Bolt-E4B-NVFP4-LowMemory (este) | 8,67B | 128k (calibracion) | NVFP4, 4,65 GiB VRAM | openmdw-1.1 | Hugging Face, vLLM |
| Nemotron-3.5-Bolt-E4B-NVFP4-VisionAudio (edicion estandar) | 8,67B | 128k (calibracion) | NVFP4 + FP8 embeddings, 5,20 GiB VRAM | openmdw-1.1 | Hugging Face, vLLM |
| Nemotron-3.5-Bolt-E4B-NVFP4-VisionAudio-GGUF | 8,67B | no disponible | GGUF, 6,11 GB + 946 MB mmproj | openmdw-1.1 | Hugging Face, llama.cpp |
| nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16 (base) | 8,67B | no disponible | BF16, 14,89 GiB | openmdw-1.1 | Hugging Face |

No se dispone de datos de benchmarks de modelos de terceros comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Requiere vLLM y kernels Triton especificos (`vllm_nemotron_patch.py` v5); no funciona con un stack de inferencia generico sin adaptaciones.
- Optimizado para GPUs Blackwell y Rubin; el rendimiento en arquitecturas anteriores no esta documentado.
- La cuantizacion introduce una perdida de precision de -0,66% en la suite de texto; no es identica al modelo BF16.
- La lista de idiomas de la model card (en, de, fr, es, it, ja) no coincide con el campo `language` del repositorio, que solo indica ingles; conviene validar el rendimiento multilingue antes de produccion.
- Riesgo de alucinacion inherente a los modelos generativos; no se documentan mitigaciones especificas.
- No se documentan sesgos conocidos ni evaluaciones de seguridad en la informacion disponible.
- La licencia openmdw-1.1 debe revisarse para uso comercial; el campo `license` del repositorio indica "other".
- El modelo base se distribuye como BF16 y esta etiquetado como `base_model`; el autor de esta cuantizacion es un tercero (arvedo), no NVIDIA, por lo que la trazabilidad del proceso de cuantizacion depende de su documentacion.
- El repositorio tiene 187 descargas y 0 likes, lo que indica una validacion comunitaria muy limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/arvedo/NVIDIA-Nemotron-3.5-Bolt-E4B-NVFP4-LowMemory
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16
- Edicion estandar NVFP4: https://huggingface.co/arvedo/Nemotron-3.5-Bolt-E4B-NVFP4-VisionAudio
- Edicion GGUF: https://huggingface.co/arvedo/Nemotron-3.5-Bolt-E4B-NVFP4-VisionAudio-GGUF
- Licencia openmdw-1.1: https://openmdw.ai/license/1-1/
- Patrocinador (hardware y financiacion): https://cdemy.de/
