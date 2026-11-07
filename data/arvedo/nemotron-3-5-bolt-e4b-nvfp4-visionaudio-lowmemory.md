# arvedo/Nemotron-3.5-Bolt-E4B-NVFP4-VisionAudio-LowMemory

## Resumen

Nemotron-3.5-Bolt-E4B-NVFP4-VisionAudio-LowMemory es una cuantización de 4 bits en formato NVFP4 del modelo `nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16`, publicada por el usuario arvedo. El modelo base es un modelo pequeño de lenguaje desarrollado por NVIDIA, derivado mediante post-entrenamiento de Gemma-4-E4B-it, optimizado para velocidad e inteligencia por GB en agentes conversacionales. Esta edición comprime el checkpoint de 14,89 GiB en BF16 a 4,79 GiB en disco (4,65 GiB en VRAM), lo que permite su despliegue en GPUs de consumo con 6 y 8 GB de VRAM.

La arquitectura subyacente es de tipo transformer multimodal (visión y audio) bajo la clase `Gemma4ForConditionalGeneration`, con 8.667.245.130 parámetros totales según los safetensors del repositorio. El modelo conserva soporte omni-modal (image-text-to-text y audio) mediante torres de visión y audio cuantizadas en MXFP8, mientras que las capas transformer usan NVFP4 calibrado a 128k. La licencia es OpenMDW-1.1.

La relevancia de esta ficha radica en que permite ejecutar un modelo multimodal con ventana de contexto de 128k en hardware modesto (RTX 4060, RTX 5060, RTX 5070) con una pérdida de precisión declarada inferior al 1% respecto al BF16 original, y con aceleración superior a 2x en GPUs Blackwell gracias al uso de tensor cores FP4 nativos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma4ForConditionalGeneration), con torres de visión y audio |
| Parametros totales | 8.667.245.130 (8,67B) |
| Parametros activos | no disponible |
| Longitud de contexto | 128k (calibración NVFP4 a 128k; contexto máximo no confirmado explícitamente) |
| Tipos de cuantizacion | NVFP4 (E2M1) en capas transformer y embeddings/PLE; MXFP8 en torres de visión y audio; lm_head en 4-bit B12xBlockscaledLinear |
| Idiomas soportados | en, de, fr, es, it, ja |
| Licencia | OpenMDW-1.1 |
| Formato de pesos | safetensors (vLLM); existe edición GGUF separada del mismo autor |

## Arquitectura y entrenamiento

El modelo base es un transformer multimodal derivado de Gemma-4-E4B-it mediante post-entrenamiento por parte de NVIDIA, orientado a mejorar el uso de herramientas multi-turno, el seguimiento de instrucciones y el anclaje de la entrada (input grounding) en agentes conversacionales. No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO en el modelo base.

Esta edición concreta aplica cuantización post-entrenamiento: las capas transformer se cuantizan a NVFP4 con calibración a 128k, las torres de visión y audio a MXFP8, y las tablas de embeddings de token y per-layer (PLE, 3,49B parámetros, forma `[262144, 13312]`) se comprimen a 4-bit NVFP4 (4,5 bits/elemento). La innovación técnica destacable es el kernel Triton `_nemo_nvfp4_embed_kernel` (v5), que realiza la búsqueda de embeddings en NVFP4 de forma nativa con decodificación en registro sin ramas, y la proyección `per_layer_model_projection` ejecutada sobre tensor cores FP4 nativos W4A4 de Blackwell. Según el autor, esto reduce un 44% los bytes leídos desde VRAM en la fase de embedding.

## Capacidades

- Generación de texto conversacional multi-turno.
- Razonamiento, matemáticas y codificación (evaluados en el suite de 16 benchmarks del autor).
- Comprensión de imágenes (image-text-to-text) mediante torre de visión en MXFP8.
- Comprensión de audio mediante torre de audio en MXFP8.
- Uso de herramientas (tool calling) y seguimiento de instrucciones, reforzados en el post-entrenamiento de NVIDIA.
- Razonamiento multi-paso orientado a agentes conversacionales.
- Capacidades multilingües en inglés, alemán, francés, español, italiano y japonés.
- Ventana de contexto larga (calibración a 128k).

## Casos de uso

- Agentes conversacionales en hardware de consumo: el modelo cabe en 4,65 GiB de VRAM, por lo que puede desplegarse en una RTX 4060 de 8 GB o una RTX 5060 de 6 GB dejando espacio para caché KV, adecuado para asistentes locales de escritorio.
- Asistencia multimodal con imágenes: al conservar la torre de visión, puede responder preguntas sobre capturas de pantalla, documentos escaneados o fotografías en aplicaciones de accesibilidad o soporte técnico.
- Transcripción y análisis de audio: la torre de audio permite integrar el modelo en pipelines de resumen de reuniones o atención telefónica automatizada, con la ventaja de ejecutarse en local.
- Automatización con tool calling: su mejora en uso de herramientas multi-turno lo hace apto para orquestar APIs en flujos de trabajo de agentes (por ejemplo, consulta de bases de datos y ejecución de acciones).
- Procesamiento de documentos largos: con contexto de 128k, puede resumir o extraer información de contratos, informes o hilos de conversación extensos en una sola pasada.
- Despliegue en servidores con vLLM: en GPUs Blackwell (serie RTX 50, DGX Spark GB10) el autor reporta más de 2x de velocidad frente a BF16, útil para servir múltiples usuarios con throughput alto.
- Prototipado e investigación: al ser una cuantización de bajo consumo, permite experimentar con un modelo multimodal de 8,67B en estaciones de trabajo modestas sin renunciar a visión ni audio.

## Benchmarks y rendimiento

Los datos disponibles provienen de la model card del autor de la cuantización, no de NVIDIA. Se presentan como comparación entre la edición LowMemory, la edición estándar y el modelo base BF16.

| Benchmark / suite | Base BF16 | LowMemory NVFP4 | Estándar FP8-embed | Delta vs. BF16 |
|---|---|---|---|---|
| Suite de texto (20.565 preguntas, 16 benchmarks) | 79,40% | 78,74% | 79,09% | -0,66% |
| Suite visión y audio (2.203 preguntas) | no disponible | 73,72% | 73,81% | paridad >99,8% |
| Referencia Google Gemma 4 E4B-IT BF16 (compuesto multimodal) | 73,40% | 73,72% | no disponible | +0,32% |

Rendimiento de decodificación reportado en DGX Spark GB10 (Blackwell):

| Escenario | LowMemory | Estándar |
|---|---|---|
| Decodificación batched, c=32 | 1.695,0 tok/s | 1.636,1 tok/s |
| Decodificación pura, contexto 32k, c=1 | 123,6 tok/s | 120,9 tok/s |

No se han publicado en la información disponible resultados desglosados por benchmark individual (MMLU, HumanEval, GSM8K, etc.) ni cifras oficiales de NVIDIA para el modelo base.

## Requisitos de hardware

- VRAM estimada: 4,65 GiB para los pesos en motor; el checkpoint en disco ocupa 4,79 GiB.
- GPUs objetivo declaradas: RTX 4060 (8 GB), RTX 5060 (6 GB), RTX 5070, RTX 5090.
- Cabe en GPUs de consumo de 6 y 8 GB de VRAM, dejando margen para la caché KV (calibrada a 128k, aunque el contexto efectivo dependerá de la VRAM libre).
- Aceleración nativa FP4 requiere GPUs Blackwell o Rubin (tensor cores FP4 W4A4); en arquitecturas anteriores el rendimiento será menor.
- Opciones de despliegue: vLLM (librería declarada, requiere el parche `vllm_nemotron_patch.py` v5 para el kernel Triton de embeddings); existe edición GGUF separada para llama.cpp/CPU, aunque el autor no la recomienda como mejora de velocidad frente a Q4_K_M.
- Throughput estimado en DGX Spark GB10: 1.695 tok/s en decodificación batched (c=32) y 123,6 tok/s en decodificación pura con contexto de 32k (c=1).
- Latencia: no disponible de forma desagregada (time-to-first-token no reportado).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Nemotron-3.5-Bolt-E4B-NVFP4-VisionAudio-LowMemory (esta ficha) | 8,67B | 128k (calibración) | OpenMDW-1.1 | safetensors (vLLM) | 4,65 GiB VRAM, multimodal visión+audio |
| Nemotron-3.5-Bolt-E4B-NVFP4-VisionAudio (edición estándar, mismo autor) | 8,67B | 128k (calibración) | OpenMDW-1.1 | safetensors (vLLM) | 5,20 GiB VRAM, embeddings en FP8 |
| Nemotron-3.5-Bolt-E4B-NVFP4-VisionAudio-GGUF (mismo autor) | 8,67B | no disponible | OpenMDW-1.1 | GGUF | 6,11 GB + 946 MB mmproj, para llama.cpp/CPU |
| NVIDIA-Nemotron-3.5-Bolt-E4B-BF16 (modelo base) | 8,67B | no disponible | no disponible | BF16 | 14,89 GiB, referencia de precisión |

No se dispone en la información proporcionada de comparativas con modelos de otros fabricantes del mismo tamaño y categoría multimodal.

## Limitaciones y advertencias

- La cuantización NVFP4 introduce una pérdida de precisión declarada de -0,66% en la suite de texto; en tareas sensibles a la exactitud numérica o de código puede ampliarse la degradación.
- Los benchmarks reportados son del autor de la cuantización, no de NVIDIA, y no se han verificado de forma independiente en la información disponible.
- El rendimiento óptimo (más de 2x frente a BF16) requiere GPUs Blackwell o Rubin con tensor cores FP4; en GPUs Ampere o Ada el beneficio puede ser menor o inexistente.
- Requiere vLLM y un parche específico (`vllm_nemotron_patch.py` v5) para el kernel Triton de embeddings; no es un checkpoint plug-and-play en todos los frameworks.
- Riesgo de alucinación inherente a modelos pequeños de 8,67B, especialmente en razonamiento multi-paso prolongado o contextos muy largos.
- Idiomas soportados limitados a seis (en, de, fr, es, it, ja); el rendimiento en otros idiomas no está garantizado.
- Licencia OpenMDW-1.1: debe revisarse el texto completo en el enlace oficial para confirmar condiciones de uso comercial y obligaciones de atribución.
- El contexto de 128k corresponde a la calibración de la cuantización; el contexto efectivo en producción dependerá de la VRAM disponible para caché KV.
- No se dispone de información sobre sesgos específicos del modelo base ni sobre su composición de datos de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/arvedo/Nemotron-3.5-Bolt-E4B-NVFP4-VisionAudio-LowMemory
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16
- Edición estándar (FP8 embeddings): https://huggingface.co/arvedo/Nemotron-3.5-Bolt-E4B-NVFP4-VisionAudio
- Edición GGUF: https://huggingface.co/arvedo/Nemotron-3.5-Bolt-E4B-NVFP4-VisionAudio-GGUF
- Página de NVIDIA Research del modelo base: https://research.nvidia.com/labs/nemotron/NVIDIA-Nemotron-3.5-Bolt-E4B-4GB/
- Informe técnico del modelo base (PDF): https://research.nvidia.com/labs/nemotron/files/NVIDIA-Nemotron-3.5-Bolt-E4B-4GB-Technical-Report.pdf
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- Patrocinador del hardware (cDemy): https://cdemy.de/
