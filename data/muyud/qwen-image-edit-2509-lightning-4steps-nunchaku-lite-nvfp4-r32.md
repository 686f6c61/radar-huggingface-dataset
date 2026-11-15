# muyud/qwen-image-edit-2509-lightning-4steps-nunchaku-lite-nvfp4-r32

## Resumen

Este repositorio es una conversión cuantizada del modelo Qwen Image Edit 2509, publicado originalmente por el equipo Qwen de Alibaba, adaptada para ser cargada directamente con la librería Diffusers mediante el loader Nunchaku Lite. El autor de la conversión es `muyud`, y el artefacto resultante combina tres técnicas de compresión sobre el transformer del modelo base: cuantización SVDQ en precisión NVFP4 con rango 32, cuantización AWQ en 120 capas objetivo y un codificador de texto guardado en 4 bits NF4 mediante BitsAndBytes. Además, el checkpoint lleva fusionada una LoRA de destilación de pasos (Lightning 4-steps V1.0), lo que permite generar ediciones de imagen con solo 4 pasos de inferencia en lugar de la decena habitual.

El modelo resuelve el problema de edición de imágenes guiada por instrucciones en lenguaje natural (image-to-image) con un coste de inferencia drásticamente reducido. Frente al checkpoint original de Nunchaku en FP4, esta conversión reporta una latencia de 6,06 s y un pico de VRAM de 21,54 GiB en una entrada de 1248x832 con 4 pasos, lo que la hace viable en GPUs de consumo alto (24 GB) y en entornos donde el espacio de memoria es el factor limitante.

La relevancia actual viene de dos frentes: por un lado, Qwen Image Edit 2509 es uno de los modelos de edición de imagen más capaces del ecosistema abierto; por otro, la combinación de SVDQ NVFP4 + NF4 en el text encoder + destilación a 4 pasos reduce el coste de despliegue de forma notable sin renunciar (según el autor) a la calidad visual del baseline, como muestra la comparativa de salida incluida en la model card.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (Qwen Image Edit 2509) con cuantización SVDQ NVFP4 r32 y AWQ; codificador de texto cuantizado en BitsAndBytes NF4 |
| Parametros totales | 8.970.858.768 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (SVDQ r32, 720 targets), AWQ (120 targets), BitsAndBytes NF4 4-bit en text encoder, compute dtype bfloat16 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (Diffusers), cargable con `QwenImageEditPlusPipeline` |
| Tamano del repo | 18,5 GB |
| Pipeline | image-to-image |
| Libreria | diffusers |
| Modelo base | Qwen/Qwen-Image-Edit-2509 |
| LoRA fusionada | Qwen-Image-Edit-2509-Lightning-4steps-V1.0 |
| Scheduler | Lightning scheduler (base_shift = max_shift = log(3)) |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen Image Edit 2509, un transformer de difusión para edición de imágenes condicionada por texto, distribuido por Qwen (Alibaba) bajo licencia Apache 2.0. Sobre ese modelo base, esta conversión aplica una cadena de compresión específica: el transformer se empaqueta para el loader Nunchaku Lite con `quant_method: nunchaku_lite`, precisión SVDQ `nvfp4` y rango 32, con 720 capas objetivo SVDQ y 120 capas objetivo AWQ. El codificador de texto se guarda con BitsAndBytes en 4 bits NF4 (`load_in_4bit: true`, `bnb_4bit_quant_type: nf4`, `bnb_4bit_compute_dtype: bfloat16`). El scheduler configurado es el usado por el ejemplo Nunchaku de 4/8 pasos, con `base_shift = max_shift = log(3)`.

La innovación principal es la fusión de la LoRA de destilación Lightning 4-steps V1.0 dentro del checkpoint, lo que permite generar la edición con `num_inference_steps=4` y `true_cfg_scale=1.0` (es decir, sin classifier-free guidance, típico de los modelos destilados). El checkpoint fuente es `svdq-fp4_r32-qwen-image-edit-2509-lightning-4steps-251115.safetensors` del repo `nunchaku-ai/nunchaku-qwen-image-edit-2509`. No se dispone de información sobre el dataset de entrenamiento original de Qwen Image Edit 2509, el número de tokens, la composición del corpus ni sobre si hubo RLHF/DPO; esos datos corresponden al modelo base y no se detallan en la información proporcionada.

## Capacidades

- Edición de imágenes guiada por instrucciones en lenguaje natural (image-to-image) mediante prompts como "Change the image to watercolor style".
- Generación con muy pocos pasos de inferencia: 4 pasos por defecto gracias a la LoRA Lightning fusionada, lo que reduce el coste computacional frente a pipelines de 20-50 pasos.
- Compatibilidad con el pipeline `QwenImageEditPlusPipeline` de Diffusers, lo que facilita la integración en flujos existentes.
- Control de reproducibilidad mediante `torch.Generator` con semilla manual.
- Configuración de `true_cfg_scale` ajustable (el autor usa 1.0 para el modo destilado).
- Soporte de cuantización de doble nivel (transformer NVFP4 + text encoder NF4) para reducir el uso de VRAM.
- Capacidad de comparar salidas frente al baseline original de Nunchaku con la misma imagen, prompt, semilla, scheduler y ajustes de 4 pasos, como documenta el autor en `output_comparison.png`.
- Capacidades multilingües: no disponible en la información proporcionada.
- Tool calling / function calling: no disponible (no es una capacidad propia de un modelo de difusión de imagen).
- Modo thinking, visión o audio: no disponible (el modelo es de edición de imagen, no un LLM multimodal conversacional).

## Casos de uso

- Edición de imágenes por lotes en producción: el pipeline acepta una imagen y un prompt, y con 4 pasos y ~6 s de latencia por imagen en una GPU de 24 GB permite procesar catálogos de producto (por ejemplo, cambiar el fondo o el estilo de cientos de fotos) sin recurrir a un cluster.
- Prototipado rápido de herramientas creativas: al cargarse con Diffusers y una sola llamada a `from_pretrained`, se puede integrar en notebooks y demos interactivas para que diseñadores prueben estilos (acuarela, óleo, ilustración) sobre una misma foto.
- Restauración estilística de material gráfico: útil para adaptar imágenes de archivo a un estilo visual coherente con una campaña, manteniendo la estructura original gracias a la condición image-to-image.
- Despliegue en GPUs de consumo alto: con un pico de 21,54 GiB en 1248x832 permite ejecutar el modelo en una RTX 4090 (24 GB), lo que habilita casos de uso en estaciones de trabajo locales sin GPU de datacenter.
- Investigación en cuantización de modelos de difusión: el repositorio sirve como referencia reproducible de la combinación SVDQ NVFP4 + AWQ + NF4 + LoRA fusionada, y permite comparar latencia y VRAM frente al baseline Nunchaku FP4 (4,93 s y 35,44 GiB) con la misma entrada.
- Generación de variaciones controladas para A/B testing: con semilla fija y `true_cfg_scale=1.0` se pueden producir variantes reproducibles de una misma edición para evaluar preferencias de usuario.
- Previsualización rápida en herramientas de edición asistida: los 4 pasos permiten una respuesta casi interactiva, adecuada para iterar prompts en un editor gráfico antes de lanzar una versión de mayor calidad.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card, medidos con 4 pasos de inferencia sobre una imagen de entrada de 1248x832, latencia media de 3 ejecuciones tras 1 warmup, y VRAM máxima como pico de memoria CUDA asignada durante la generación:

| Checkpoint | Latencia | VRAM máxima |
|---|---:|---:|
| Diffusers Nunchaku Lite NVFP4 r32 + text encoder BNB4 (este repo) | 6,06 s | 21,54 GiB |
| Nunchaku FP4 r32 safetensors original (baseline) | 4,93 s | 35,44 GiB |

El baseline se cargó a través del transformer nativo de Nunchaku desde `nunchaku-ai/nunchaku-qwen-image-edit-2509/lightning-251115/svdq-fp4_r32-qwen-image-edit-2509-lightning-4steps-251115.safetensors`. No se han publicado en la información disponible resultados de benchmarks de calidad estándar (MMLU, HumanEval, GSM8K u otros) porque el modelo es de edición de imagen y no un LLM; la comparativa de calidad visual se limita a la imagen `output_comparison.png` del repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: 21,54 GiB de pico medido en 1248x832 con 4 pasos (dato del autor para esta conversión).
- GPU recomendadas: RTX 4090 (24 GB) para uso en consumo; A100/H100 para despliegues de mayor concurrencia o resoluciones superiores.
- Cabe en GPU de consumo: sí, en GPUs con 24 GB o más (RTX 4090, RTX 3090, A6000). No cabe con holgura en GPUs de 16 GB según el pico reportado.
- Opciones de despliegue: Diffusers con `QwenImageEditPlusPipeline` y loader Nunchaku Lite; el text encoder usa BitsAndBytes 4-bit, por lo que se requiere el soporte de `bitsandbytes` en el entorno.
- Latencia y throughput: 6,06 s por imagen en la configuración medida; el throughput agregado no está disponible, pero puede estimarse a partir de la latencia por imagen y del paralelismo disponible en la GPU.
- Comparativa de recursos frente al baseline: esta conversión reduce el pico de VRAM de 35,44 GiB a 21,54 GiB a costa de un incremento de latencia de 4,93 s a 6,06 s.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este repo (Qwen Image Edit 2509 Nunchaku Lite NVFP4 r32 + BNB4 + Lightning 4-steps) | 8.970.858.768 | no disponible | 6,06 s / 21,54 GiB (1248x832, 4 pasos) | apache-2.0 | Hugging Face (Diffusers) |
| Nunchaku FP4 r32 original (baseline del autor) | no disponible en la información | no disponible | 4,93 s / 35,44 GiB (misma entrada) | no disponible en la información | Hugging Face (Nunchaku nativo) |
| Qwen/Qwen-Image-Edit-2509 (modelo base sin cuantizar) | no disponible en la información | no disponible | no disponible | apache-2.0 | Hugging Face (Diffusers) |

No se dispone de datos de otros modelos de edición de imagen comparables (por ejemplo, variantes de Flux o InstructPix2Pix) en la información proporcionada, por lo que la comparativa se limita a los tres artefactos anteriores.

## Limitaciones y advertencias

- La cuantización NVFP4 + AWQ + NF4 puede introducir degradaciones de calidad frente al modelo base sin cuantizar; el autor solo aporta una comparativa visual (`output_comparison.png`) y no métricas objetivas de fidelidad (FID, CLIP score, etc.).
- La LoRA Lightning 4-steps está fusionada en el checkpoint; no se puede desactivar fácilmente para volver al comportamiento del modelo base sin volver a cargar los pesos originales.
- El uso de `true_cfg_scale=1.0` y 4 pasos es la configuración esperada para este checkpoint; otros valores pueden producir resultados no validados por el autor.
- El modelo es de edición de imagen: no es un LLM, por lo que no dispone de tool calling, agentes, razonamiento multi-step ni capacidades multilingües conversacionales.
- Sesgos conocidos: no disponibles en la información proporcionada; hereda los del modelo base Qwen Image Edit 2509, que no se documentan aquí.
- Riesgo de alucinación visual: no cuantificado en la información disponible; en modelos de difusión se manifiesta como alteraciones no solicitadas de la imagen de entrada.
- Idiomas soportados: no disponible; el prompt de ejemplo está en inglés.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del checkpoint fuente de Nunchaku y de la LoRA Lightning original antes de un despliegue en producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día (2026-11-15), por lo que no hay evidencia comunitaria de estabilidad ni de reproducibilidad a largo plazo.
- El tamaño del repo (18,5 GB) y el pico de 21,54 GiB implican que la descarga y el despliegue requieren planificación de almacenamiento y memoria; no es adecuado para entornos con menos de 24 GB de VRAM si se mantiene la resolución medida.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/muyud/qwen-image-edit-2509-lightning-4steps-nunchaku-lite-nvfp4-r32
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-Edit-2509
- Checkpoint fuente Nunchaku: https://huggingface.co/nunchaku-ai/nunchaku-qwen-image-edit-2509
- LoRA Lightning 4-steps: Qwen-Image-Edit-2509-Lightning-4steps-V1.0 (referenciada en la model card; no se proporciona URL directa en la información disponible)
- Comparativa visual de salida: `output_comparison.png` dentro del repositorio de Hugging Face
- Documentación de Diffusers: https://huggingface.co/docs/diffusers
- Documentación de BitsAndBytes: https://huggingface.co/docs/bitsandbytes
- Paper, blog o demo adicionales: no disponibles en la información proporcionada
