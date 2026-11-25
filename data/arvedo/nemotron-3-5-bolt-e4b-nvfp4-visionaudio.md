# arvedo/Nemotron-3.5-Bolt-E4B-NVFP4-VisionAudio

## Resumen

Nemotron-3.5-Bolt-E4B-NVFP4-VisionAudio es una cuantizacion de 4 bits en formato NVFP4 del modelo `nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16`, publicada por el usuario arvedo. El modelo base es un post-entrenamiento de `google/gemma-4-E4B-it`, con arquitectura multimodal capaz de procesar texto, imagen y audio. Esta version cuantizada esta pensada para GPUs NVIDIA Blackwell y Rubin, y reduce el peso en disco de 14,89 GiB a 6,00 GB (5,20 GiB de VRAM en ejecucion).

La relevancia de esta ficha radica en que demuestra que es posible comprimir un modelo omni-modal de aproximadamente 8.000 millones de parametros totales manteniendo mas del 99,6% de la precision del BF16 original en texto y una paridad superior al 100% en pruebas de vision y audio. Ademas, ofrece una mejora de 2,04x en velocidad de decodificacion en contextos largos de 32k sobre vLLM, lo que lo convierte en una opcion atractiva para despliegues con restricciones de VRAM.

El modelo soporta una longitud de contexto de 128k tokens, seis idiomas (ingles, aleman, frances, espanol, italiano y japones) y se distribuye bajo licencia OpenMDW 1.1. Su pipeline declarado es image-text-to-text, e incluye soporte para vision y audio mediante codificadores cuantizados en MXFP8.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma4ForConditionalGeneration) con capas cuantizadas NVFP4 |
| Parametros totales | 7.996.156.490 (~8B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 128.000 tokens (128k) |
| Tipos de cuantizacion | NVFP4 (W4A4) en transformer, MXFP8 (E4M3 + E8M0 con escalas de bloque de 32) en codificadores de vision y audio, FP8 en tablas de embedding (edicion Standard) |
| Idiomas soportados | en, de, fr, es, it, ja |
| Licencia | openmdw-1.1 |
| Formato de pesos | safetensors (vLLM); existe edicion GGUF separada |

## Arquitectura y entrenamiento

El modelo base es un transformer multimodal derivado de `google/gemma-4-E4B-it`, post-entrenado por NVIDIA como parte de la familia Nemotron 3.5 Bolt. La arquitectura incluye 42 capas transformer, un modulo de vision y un modulo de audio, ademas de tablas de embedding de token y per-layer embedding (PLE) con dimension `[262144, 13312]` y 3.490 millones de parametros en la edicion Standard.

Esta version cuantizada aplica NVFP4 con calibracion a 128k de contexto en todas las capas transformer, MXFP8 en los codificadores de vision y audio, y un `lm_head` en 4 bits mediante el kernel `B12xBlockscaledLinear` (W4A16). Las tablas de embedding se almacenan en FP8 de 8 bits en la edicion Standard, con kernels Triton de una sola pasada (`_nemo_fp8_embed_kernel`) para acelerar las busquedas. La edicion LowMemory empaqueta esas tablas en NVFP4 de 4 bits y usa un kernel fusionado de decodificacion en registros (`_nemo_nvfp4_embed_kernel` v5) que lee un 44% menos de bytes por lookup. No se detalla en la informacion disponible el volumen de tokens de entrenamiento ni la composicion del dataset del modelo base.

## Capacidades

- Generacion de texto y razonamiento en contextos de hasta 128k tokens.
- Comprension de imagenes (image-text-to-text) mediante codificador de vision cuantizado en MXFP8.
- Comprension de audio mediante codificador de audio cuantizado en MXFP8.
- Razonamiento matematico, generacion de codigo y seguimiento de instrucciones (evaluado en 16 benchmarks del suite de 20.565 preguntas).
- Capacidades multilingues en ingles, aleman, frances, espanol, italiano y japones.
- Inferencia optimizada en vLLM con soporte para decodificacion de contexto largo.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Asistencia multimodal en atencion al cliente: el modelo puede procesar capturas de pantalla, imagenes de productos o notas de voz junto con texto gracias a sus codificadores de vision y audio, manteniendo conversaciones multi-turno con hasta 128k tokens de contexto.
- Analisis de documentos extensos con imagenes y audio: permite resumir informes, transcribir y razonar sobre grabaciones adjuntas en un mismo pipeline, aprovechando la ventana de 128k para documentos largos.
- Generacion de codigo en produccion: con 8B de parametros y cuantizacion NVFP4, cabe en GPUs de consumo alto y puede integrarse en pipelines de CI/CD para autocompletado, revision de parches o generacion de tests, con una precision de texto del 79,09% en el suite agregado.
- Despliegue en estaciones de trabajo con GPU Blackwell: al ocupar 5,20 GiB de VRAM, permite ejecutar el modelo junto con otros servicios en una sola GPU, ideal para prototipos y demos internas.
- Procesamiento por lotes de contenido audiovisual: con 46.853 tok/s de prefill y 491,5 tok/s de decodificacion a concurrencia 32 en DGX Spark GB10, es adecuado para clasificar o resumir grandes volumenes de imagenes y audio en servidores.
- Asistentes multilingues para soporte en Europa: cubre espanol, aleman, frances, italiano e ingles, lo que permite un unico modelo para mercados europeos sin cambiar de checkpoint.
- Investigacion en cuantizacion: sirve como referencia reproducible para estudiar el impacto de NVFP4 y MXFP8 en modelos multimodales, con ediciones Standard, LowMemory y GGUF para comparar precision y huella de memoria.

## Benchmarks y rendimiento

| Benchmark / metrica | NVFP4 (este modelo) | Base BF16 | Delta |
|---|---|---|---|
| Suite de texto (20.565 preguntas, 16 benchmarks) | 79,09% | 79,40% | -0,31% |
| Suite Vision & Audio (2.203 preguntas) | 73,81% | 73,40% (Gemma 4 E4B-IT BF16) | +0,41% |
| Edicion LowMemory, suite de texto | 78,74% | 79,40% | -0,66% |
| Edicion LowMemory, Vision & Audio | 73,72% | 73,40% | +0,32% |
| Decodificacion pura 32k, c=1 (DGX Spark GB10) | 120,9 tok/s | 59,2 tok/s | 2,04x |
| Decodificacion pura 32k, c=32 | 491,5 tok/s | OOM | no comparable |
| Prefill 32k, c=32 | 46.853,4 tok/s | OOM | no comparable |
| VRAM en ejecucion | 5,20 GiB | 15,20 GiB | -65% |

No se han publicado resultados desglosados por benchmark individual (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: 5,20 GiB en la edicion Standard NVFP4; 4,65 GiB en la edicion LowMemory; 15,20 GiB para el modelo base BF16.
- GPU recomendadas: NVIDIA Blackwell (por ejemplo, DGX Spark GB10) y NVIDIA Rubin, necesarias para las instrucciones NVFP4 y MXFP8.
- Cabe en GPU de consumo: si la GPU es Blackwell; en generaciones anteriores no se garantiza el soporte de NVFP4.
- Opciones de despliegue: vLLM (libreria declarada), con parche `vllm_nemotron_patch.py` para los kernels de embedding; existe edicion GGUF (6,11 GB + 946 MB mmproj) para llama.cpp en CPU o pruebas locales.
- Latencia y throughput: 120,9 tok/s de decodificacion pura a c=1 en contexto de 32k; 491,5 tok/s a c=32; 46.853,4 tok/s de prefill a c=32 en DGX Spark GB10.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Nemotron-3.5-Bolt-E4B-NVFP4-VisionAudio (este) | ~8B | 128k | NVFP4 + MXFP8 | openmdw-1.1 | Vision y audio, optimizado para Blackwell/Rubin |
| Nemotron-3.5-Bolt-E4B-NVFP4-VisionAudio-LowMemory | ~8B | 128k | NVFP4 (embeddings incluidos) | openmdw-1.1 | 4,65 GiB VRAM, 4,79 GiB en disco |
| Nemotron-3.5-Bolt-E4B-NVFP4-VisionAudio-GGUF | ~8B | 128k | GGUF (Q4_K_M) | openmdw-1.1 | 6,11 GB + 946 MB mmproj, para llama.cpp |
| NVIDIA-Nemotron-3.5-Bolt-E4B-BF16 (base) | ~8B | 128k | BF16 | no disponible | 15,20 GiB VRAM, referencia de precision |

## Limitaciones y advertencias

- Requiere GPU NVIDIA Blackwell o Rubin para aprovechar NVFP4 y MXFP8; en hardware anterior el rendimiento y la compatibilidad no estan garantizados.
- La cuantizacion introduce una perdida de precision de -0,31% en el suite de texto; en tareas muy sensibles puede ser relevante.
- Los benchmarks publicados son agregados (79,09% y 73,81%) y no se desglosan por tarea, lo que dificulta evaluar el rendimiento en dominios concretos.
- No se documentan sesgos conocidos ni evaluaciones de seguridad en la informacion disponible.
- Riesgo de alucinacion inherente a los modelos de ~8B; no se aportan metricas de fidelidad factual.
- La licencia OpenMDW 1.1 debe revisarse para uso comercial; la model card la declara como "other" con enlace a openmdw.ai.
- El soporte de tool calling, agentes y modo thinking no esta confirmado en la informacion disponible.
- La edicion GGUF no esta pensada como mejora de velocidad frente a Q4_K_M estandar en llama.cpp.

## Enlaces

- Hugging Face (este modelo): https://huggingface.co/arvedo/Nemotron-3.5-Bolt-E4B-NVFP4-VisionAudio
- Edicion LowMemory: https://huggingface.co/arvedo/Nemotron-3.5-Bolt-E4B-NVFP4-VisionAudio-LowMemory
- Edicion GGUF: https://huggingface.co/arvedo/Nemotron-3.5-Bolt-E4B-NVFP4-VisionAudio-GGUF
- Modelo base BF16: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16
- Modelo Gemma 4 E4B-IT: https://huggingface.co/google/gemma-4-E4B-it
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
- Patrocinador (hardware): https://cdemy.de/
