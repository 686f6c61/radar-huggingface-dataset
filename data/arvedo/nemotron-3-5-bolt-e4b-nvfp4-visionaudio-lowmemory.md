# arvedo/Nemotron-3.5-Bolt-E4B-NVFP4-VisionAudio-LowMemory

## Resumen

Nemotron-3.5-Bolt-E4B-NVFP4-VisionAudio-LowMemory es una cuantización de 4 bits en formato NVFP4 del modelo multimodal `nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16`, publicada por el usuario arvedo. El objetivo es reducir drásticamente el peso del checkpoint (de 14,89 GiB en BF16 a 4,79 GiB en disco y unos 4,65 GiB en VRAM) para que el modelo pueda ejecutarse en GPU de consumo con 6 y 8 GB de VRAM, manteniendo al mismo tiempo las capacidades de visión y audio del modelo original.

La ficha técnica se apoya en la model card del autor, que reporta una retención superior al 99% de la precisión del BF16 en una batería de 20.565 preguntas de texto (78,74% frente a 79,40% del base, una diferencia de -0,66%) y una paridad superior al 99,8% en visión y audio (73,72% frente a 73,81%). El modelo base es de arquitectura `Gemma4ForConditionalGeneration` según los tags del repositorio, con 8.667.245.130 parámetros totales según los safetensors, y está pensado para inferencia con vLLM sobre hardware Blackwell o Rubin.

La relevancia actual de esta ficha radica en que demuestra una ruta práctica para desplegar modelos ómnimodales (texto, imagen y audio) en hardware modesto mediante cuantización FP4 nativa y kernels Triton fusionados, un área en la que la mayoría de las cuantizaciones de 4 bits convencionales pierden las torres de visión y audio o requieren GPUs de centro de datos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `Gemma4ForConditionalGeneration` (transformer multimodal, según tags y model card) |
| Parámetros totales | 8.667.245.130 (8,67 B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | hasta 128k (mencionado como "128k KV cache" y "128k-calibrated"; no se detalla la ventana oficial del modelo base) |
| Tipos de cuantización | NVFP4 (E2M1) en capas transformer y embeddings; MXFP8 en torres de visión y audio; `lm_head` en 4-bit `B12xBlockscaledLinear`; FP8 en la edición Standard |
| Idiomas soportados | en, de, fr, es, it, ja |
| Licencia | openmdw-1.1 (etiquetada como `license: other` en Hugging Face) |
| Formato de pesos | safetensors (librería vLLM) |

## Arquitectura y entrenamiento

El modelo base es un transformer multimodal de tipo `Gemma4ForConditionalGeneration` que combina una pila de decodificación de texto con torres de visión y audio. La cuantización de arvedo aplica NVFP4 (`E2M1`) a las capas transformer, calibrada a 128k de contexto, y mantiene las torres de visión y audio en MXFP8 para preservar la paridad multimodal. El `lm_head` se cuantiza a 4 bits mediante `B12xBlockscaledLinear`.

La innovación técnica principal es la compresión de las tablas de embedding Token y Per-Layer Embedding (PLE) de 3,49 B de parámetros (`[262144, 13312]`) a 4 bits NVFP4 (4,5 bits por elemento), junto con la proyección `per_layer_model_projection` ejecutada en tensor cores FP4 nativos `W4A4` de Blackwell. Para ello se introduce un kernel Triton fusionado (`_nemo_nvfp4_embed_kernel`, versión v5) que sustituye la desquantización multi-paso de PyTorch por una decodificación de registro sin ramas, con `out_scale` y máscara de límites fusionados, reduciendo un 44% los bytes leídos desde VRAM. No se dispone de información sobre el dataset de entrenamiento, el número de tokens o si hubo RLHF/DPO en el modelo base a partir de la información proporcionada.

## Capacidades

- Generación de texto conversacional y razonamiento multi-turno.
- Procesamiento de imagen a texto (`image-text-to-text`): descripción, VQA y comprensión visual.
- Procesamiento de audio: el autor indica soporte completo de audio tras restaurar las torres multimodales.
- Razonamiento matemático y de código (incluido en la batería de 16 benchmarks de la model card).
- Capacidades multilingües en inglés, alemán, francés, español, italiano y japonés.
- Inferencia de contexto largo (hasta 128k, según la calibración y la KV cache mencionada).
- Compatibilidad con vLLM como motor de inferencia principal.
- No se especifica soporte explícito de tool calling o function calling en la información disponible.

## Casos de uso

- Asistente multimodal en GPU de consumo: con 4,65 GiB de VRAM en motor, el modelo cabe en una RTX 4060 de 8 GB o en una RTX 5060/5070, permitiendo conversaciones con imagen y audio en un equipo de escritorio sin GPU de centro de datos.
- Análisis de documentos con imagen y texto: la ventana de hasta 128k y la torre de visión permiten procesar capturas, diagramas o páginas escaneadas junto con instrucciones largas en un solo prompt.
- Transcripción y comprensión de audio en local: la torre de audio en MXFP8 posibilita resúmenes y preguntas sobre grabaciones sin enviar el audio a un servicio externo.
- Atención al cliente multilingüe: los seis idiomas soportados y el contexto largo permiten gestionar conversaciones multi-turno con historial extenso en inglés, alemán, francés, español, italiano o japonés.
- Prototipado e investigación en cuantización FP4: el kernel Triton fusionado y los pesos NVFP4 sirven como referencia reproducible para estudiar el impacto de la cuantización de embeddings en la precisión.
- Despliegue en el borde o en estaciones de trabajo con presupuesto de VRAM ajustado: 4,79 GiB en disco facilitan incluirlo en imágenes de contenedor y arrancarlo en vLLM con margen para la KV cache.
- Evaluación comparativa de cuantizaciones: las ediciones LowMemory, Standard y GGUF del mismo autor permiten medir el compromiso entre tamaño, velocidad y precisión en un mismo modelo base.

## Benchmarks y rendimiento

Resultados reportados por el autor en la model card (conjunto de 20.565 preguntas de texto y 2.203 de visión y audio):

| Benchmark / conjunto | LowMemory (NVFP4) | Base BF16 | Delta |
|---|---|---|---|
| Suite de texto (20.565 preguntas, 16 benchmarks) | 78,74% | 79,40% | -0,66% |
| Suite de visión y audio (2.203 preguntas) | 73,72% | 73,81% | -0,09% |
| Referencia Gemma 4 E4B-IT BF16 (visión y audio) | — | 73,40% | — |

Rendimiento medido en DGX Spark GB10 (Blackwell):

| Métrica | LowMemory | Standard (FP8 embeddings) |
|---|---|---|
| Decodificación batched, c=32 (32k Wikipedia) | 1.695,0 tok/s | 1.636,1 tok/s |
| Decodificación pura, c=1 (32k Wikipedia) | 123,6 tok/s | 120,9 tok/s |

No se han publicado en la información disponible resultados desglosados por benchmark individual (MMLU, HumanEval, GSM8K, etc.).

## Requisitos de hardware

- VRAM estimada: 4,65 GiB en motor para los pesos; el autor indica que cabe en GPU de 6 GB y 8 GB dejando espacio para la KV cache.
- GPU recomendadas: Blackwell (RTX 5090, RTX 5060, RTX 5070) y Rubin para aprovechar los tensor cores FP4; DGX Spark GB10 como plataforma de referencia medida.
- Cabe en GPU de consumo: sí, en RTX 4060 de 8 GB y en modelos de 6 GB según el autor.
- Motor de despliegue: vLLM (librería declarada); requiere el parche `vllm_nemotron_patch.py` v5 para el kernel Triton fusionado.
- Alternativa sin vLLM: edición GGUF del mismo autor (`6,11 GB` + `946 MB` de mmproj) para llama.cpp en CPU o local, sin mejora de velocidad frente a `Q4_K_M` estándar.
- Latencia y throughput: 1.695,0 tok/s en decodificación batched (c=32) y 123,6 tok/s en decodificación pura (c=1) sobre DGX Spark GB10 con contexto de 32k.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nemotron-3.5-Bolt-E4B-NVFP4-VisionAudio-LowMemory (esta ficha) | 8,67 B | hasta 128k | NVFP4 + MXFP8 | openmdw-1.1 | Hugging Face, vLLM |
| Nemotron-3.5-Bolt-E4B-NVFP4-VisionAudio (Standard) | 8,67 B | hasta 128k | NVFP4 + FP8 embeddings | openmdw-1.1 | Hugging Face, vLLM |
| Nemotron-3.5-Bolt-E4B-NVFP4-VisionAudio-GGUF | 8,67 B | no disponible | GGUF (Q4_K_M-like) | openmdw-1.1 | Hugging Face, llama.cpp |
| NVIDIA-Nemotron-3.5-Bolt-E4B-BF16 (base) | 8,67 B | no disponible | BF16 | openmdw-1.1 | Hugging Face |

Las tres ediciones del autor comparten pesos transformer y difieren solo en el formato de las tablas de embedding y PLE (NVFP4, FP8 o GGUF) y en el motor de inferencia.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos del modelo base; deben evaluarse por separado antes de un despliegue en producción.
- Riesgo de alucinación inherente a modelos de lenguaje de 8,67 B; la cuantización añade una pérdida media de -0,66% en la suite de texto que puede concentrarse en tareas concretas.
- La licencia `openmdw-1.1` (etiquetada como `other`) debe revisarse en el enlace oficial antes de uso comercial; no se detallan restricciones en la información disponible.
- El rendimiento óptimo depende de hardware Blackwell o Rubin; en GPU sin tensor cores FP4 el modelo puede no aprovechar las ventajas de velocidad y requerir rutas de desquantización alternativas.
- Requiere vLLM y el parche `vllm_nemotron_patch.py` v5 para el kernel Triton fusionado; sin él, el rendimiento y posiblemente la corrección del lookup de embeddings NVFP4 no están garantizados.
- Solo se declaran seis idiomas (en, de, fr, es, it, ja); el rendimiento en otros idiomas no está evaluado.
- El contexto de 128k se menciona como calibración y capacidad de KV cache, pero no se confirma como ventana oficial del modelo base en la información disponible.
- La edición GGUF no está pensada como mejora de velocidad frente a `Q4_K_M` estándar en llama.cpp.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/arvedo/Nemotron-3.5-Bolt-E4B-NVFP4-VisionAudio-LowMemory
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16
- Edición Standard (FP8 embeddings): https://huggingface.co/arvedo/Nemotron-3.5-Bolt-E4B-NVFP4-VisionAudio
- Edición GGUF: https://huggingface.co/arvedo/Nemotron-3.5-Bolt-E4B-NVFP4-VisionAudio-GGUF
- Licencia openmdw-1.1: https://openmdw.ai/license/1-1/
- Patrocinador (hardware e investigación): https://cdemy.de/
