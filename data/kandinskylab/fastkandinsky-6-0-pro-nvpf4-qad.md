# kandinskylab/FastKandinsky-6.0-Pro-NVPF4-QAD

## Resumen

FastKandinsky 6.0 Pro · NVFP4 QAD es un modelo generativo de vídeo con audio sincronizado, desarrollado conjuntamente por FastVideo (Hao AI Lab, UC San Diego) y Kandinsky Lab. Genera clips de cinco segundos a 768 × 512 píxeles y 24 fps con audio a 44 kHz perfectamente sincronizado, partiendo de texto, imagen o ambas modalidades. Su propuesta diferencial es la eficiencia: combina ocho pasos de muestreo mediante la receta pi-Flow con capas lineales en NVFP4 y atención de 4 bits (Attn-QAT), lo que reduce drásticamente el coste computacional frente a modelos de vídeo de tamaño comparable.

El checkpoint publicado en el Hub almacena el transformer de destilación con conciencia de cuantización (QAD) en BF16, con 30.139.423.760 parámetros y un repositorio de 212,9 GB. La cuantización NVFP4 no se distribuye como pesos empaquetados: FastVideo los exporta localmente de forma nativa para inferencia FP4, mientras que Diffusers ofrece una ruta experimental que cuantiza en memoria las capas lineales del DiT con TorchAO sobre GPUs Blackwell.

Es relevante ahora porque demuestra que es viable generar vídeo con audio en hardware de consumo de gama alta (RTX 5090, RTX PRO 6000 Blackwell) gracias a la combinación de destilación de pasos, atención cuantizada y offload por capas del DiT. La licencia MIT facilita su adopción tanto en investigación como en productos comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (diffusion transformer) con atención cuantizada de 4 bits y audio sincronizado; pipeline `Kandinsky6TI2VAPipeline` |
| Parametros totales | 30.139.423.760 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo generativo, no de lenguaje) |
| Tipos de cuantizacion | NVFP4 (lineales) + atención 4 bits (Attn-QAT); checkpoint base en BF16; ruta Diffusers con TorchAO NVFP4DynamicActivationNVFP4WeightConfig |
| Idiomas soportados | no disponible (condicionamiento por prompt de texto; idioma no especificado) |
| Licencia | MIT |
| Formato de pesos | safetensors (BF16); exportación NVFP4 empaquetada generada localmente por FastVideo |
| Pasos de muestreo | 8 (pi-Flow) |
| Resolucion y duracion | 768 × 512, 121 frames, 24 fps, 5 s |
| Audio | 44 kHz sincronizado |
| Libreria | diffusers (>= 0.42.1) |
| Hardware de referencia | RTX 5090, RTX PRO 6000 Blackwell (SM120), CUDA 13 |

## Arquitectura y entrenamiento

El modelo es un diffusion transformer (DiT) de 30,1 mil millones de parámetros que genera vídeo y audio de forma conjunta. La innovación central es la receta de destilación con conciencia de cuantización (QAD) de FastVideo, la misma empleada en FastWan-QAD y FastH3: durante el entrenamiento se simula la cuantización NVFP4 de las capas lineales y la atención de 4 bits (Attn-QAT, arXiv:2603.00040), de modo que el modelo aprende a mantener la calidad bajo aritmética de baja precisión. Esto permite ejecutar la inferencia en ocho pasos pi-Flow con pesos FP4 nativos sin una degradación significativa.

El checkpoint del Hub se distribuye en BF16; la conversión a NVFP4 empaquetado se realiza una sola vez mediante `convert_kandinsky6_nvfp4.py`, que escribe los pesos empaquetados y los tensores densos restantes en `nvfp4/transformer/`. La ruta Diffusers, experimental, cuantiza en memoria las capas lineales del transformer (excluyendo `modulation`) con TorchAO, usando escala de activación global dinámica, mientras que la ruta FastVideo emplea escala global fija de 1.0. No se han publicado detalles sobre el volumen de tokens de entrenamiento ni la composición del dataset en la información disponible.

## Capacidades

- Generación de vídeo texto-a-vídeo (T2V) e imagen-a-vídeo (I2V) con condicionamiento combinado.
- Generación de audio sincronizado a 44 kHz integrada en el mismo paso de difusión (efectos, ambiente, música, impactos).
- Clips de cinco segundos a 768 × 512 y 24 fps (121 frames).
- Generación en ocho pasos de muestreo, lo que habilita latencias compatibles con prototipado interactivo.
- Control de cámara y composición mediante prompts descriptivos (ángulos, movimientos, iluminación).
- Inferencia cuantizada NVFP4 nativa en Blackwell vía FastVideo con FlashInfer y kernel `ATTN_QAT_INFER`.
- Ejecución con offload por capas del DiT para reducir el pico de VRAM.
- No se documenta soporte de tool calling, agentes ni razonamiento multi-paso (no es un modelo de lenguaje).

## Casos de uso

- Previsualización de storyboards para cine y publicidad: generar clips de cinco segundos con audio sincronizado a partir de un prompt o de un frame clave permite validar ritmo, iluminación y banda sonora antes de producir.
- Creación de contenido para redes sociales: clips verticales u horizontales con audio integrado en una sola pasada, sin pipeline separado de vídeo y de audio.
- Prototipado de videojuegos: generar cinemáticas de prueba o animaciones de criaturas y entornos con efectos de sonido coherentes para evaluar dirección artística.
- Publicidad generativa a escala: iterar variaciones de un mismo anuncio (cámara, iluminación, ambiente sonoro) con ocho pasos por muestra sobre una RTX 5090.
- Investigación en generación multimodal: servir como base para estudiar destilación QAD, cuantización FP4 en difusión y sincronización audio-vídeo, dado que el código y los pesos son abiertos (MIT).
- Edición y animación de imágenes fijas: usar la modalidad imagen-a-vídeo para animar ilustraciones o fotografías de producto con movimiento de cámara controlado y audio ambiental.
- Demos interactivas y herramientas creativas locales: al caber en GPUs Blackwell de consumo con offload, permite desplegar un generador de vídeo-audio en una estación de trabajo sin clúster.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks cuantitativos (FVD, CLIP-score, métricas de audio) en la información disponible. La model card incluye una gráfica de speedup de FastVideo en RTX 5090 a 768 × 512, 121 frames y 24 fps con ocho pasos NVFP4, pero no se proporcionan los valores numéricos en el texto.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el modelo de 30,1 B en BF16 requiere del orden de 60 GB solo para pesos, por lo que la ruta BF16 no cabe en GPUs de consumo. La ruta NVFP4 con offload por capas del DiT está diseñada para ejecutarse en RTX 5090 (32 GB) y RTX PRO 6000 Blackwell.
- GPUs recomendadas: RTX 5090 o RTX PRO 6000 Blackwell (SM120) con CUDA 13 para la ruta NVFP4 nativa de FastVideo; cualquier GPU Blackwell para la ruta TorchAO de Diffusers.
- Cabe en GPU de consumo: sí, en RTX 5090 mediante cuantización NVFP4 y offload por capas.
- Despliegue: FastVideo (con FlashInfer y wheel `fastvideo-kernel` precompilado) o Diffusers >= 0.42.1 con Transformers, Accelerate, TorchAO y PyAV. No se documenta soporte de llama.cpp, Ollama, vLLM ni TGI (no aplicables a un modelo de difusión de vídeo).
- Entorno: Linux x86-64, Python 3.12, uv, backend CUDA 13 (`UV_TORCH_BACKEND=cu130`).
- Latencia y throughput: la model card muestra una gráfica de speedup sin cifras en texto; no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Modalidad | Pasos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FastKandinsky 6.0 Pro NVFP4 QAD | 30,1 B | T2V + I2V + audio 44 kHz | 8 | MIT | Hugging Face, FastVideo, Diffusers |
| FastWan-QAD | no disponible | vídeo (QAD NVFP4) | no disponible | no disponible | FastVideo / Hao AI Lab |
| FastH3 | no disponible | vídeo + audio (QAD) | no disponible | no disponible | FastVideo / Hao AI Lab |

Los modelos comparables citados en la información (FastWan-QAD y FastH3) pertenecen a la misma familia metodológica de FastVideo y comparten la receta QAD, pero no se dispone de sus especificaciones numéricas para una comparación cuantitativa. No se han identificado en la información proporcionada alternativas de terceros con datos verificables.

## Limitaciones y advertencias

- Sesgos: no documentados; al ser un modelo texto-a-vídeo, hereda los sesgos de su dataset de entrenamiento, cuya composición no se ha publicado.
- Alucinación visual: como modelo generativo, puede producir anatomía incorrecta, física inconsistente, texto ilegible en escena y desincronización audio-vídeo en prompts complejos.
- Idioma: no se especifican idiomas soportados; el rendimiento con prompts en castellano no está verificado.
- Licencia MIT: permite uso comercial, pero conviene revisar las dependencias (FastVideo, FlashInfer, TorchAO, Diffusers) que pueden tener licencias propias.
- La ruta Diffusers es experimental: cuantiza solo capas lineales seleccionadas y ejecuta la atención en BF16, con escala de activación global dinámica distinta de la ruta FastVideo (escala fija 1.0), lo que puede producir diferencias de calidad.
- Requiere hardware Blackwell (SM120) y CUDA 13 para la ruta NVFP4 nativa; no hay soporte documentado para GPUs anteriores.
- La exportación NVFP4 es un paso local de una sola vez que añade complejidad operativa y almacenamiento adicional.
- El repositorio ocupa 212,9 GB, lo que exige planificación de almacenamiento y ancho de banda de descarga.
- Duración fija de cinco segundos y resolución 768 × 512: no se documenta soporte de clips más largos ni de resoluciones superiores.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kandinskylab/FastKandinsky-6.0-Pro-NVPF4-QAD
- Kandinsky Lab: https://kandinskylab.ai/
- Modelos de vídeo de Kandinsky Lab: https://kandinskylab.ai/models/video/
- Repositorio FastVideo: https://github.com/hao-ai-lab/FastVideo
- Blog FastWan-QAD: https://haoailab.com/blogs/fastwan-qad/
- Blog FastH3: https://haoailab.com/blogs/fasth3-omni-local/
- Paper Attn-QAT: https://arxiv.org/abs/2603.00040
- Paper adicional citado en tags: https://arxiv.org/abs/2610.05608
- TorchAO: https://github.com/pytorch/ao
- Tabla de compatibilidad TorchAO: https://github.com/pytorch/ao/issues/2919
- uv: https://docs.astral.sh/uv/
