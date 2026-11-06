# smile-forge/hidream-o1-image-onnx

## Resumen

HiDream-O1-Image ONNX es una exportación a formato ONNX del modelo generativo de imagen HiDream-O1-Image, desarrollada por el usuario smile-forge para su ejecución con ONNX Runtime sobre el proveedor de ejecución CUDA. El modelo original, de HiDream-ai, es un transformer unificado a nivel de píxel (UiT) que codifica directamente píxeles crudos, texto y condiciones específicas de tarea en un único espacio de tokens compartido, sin VAE ni codificadores de texto separados, y que cubre generación texto-a-imagen, edición de imagen y personalización guiada por sujeto hasta 2048 × 2048.

El repositorio empaqueta el denoiser en dos variantes (pesos de 8 bits para GPU de 16 GB y pesos fp16 para GPU de 24 GB) junto con el lector de imágenes, que es la torre de visión de Qwen3-VL con sus fusionadores DeepStack. El denoiser combina el modelo de lenguaje de Qwen3-VL-8B con los embedders de timestep y de parches propios de HiDream y su proyección de salida.

La relevancia de esta ficha es doble: por un lado, permite ejecutar un modelo de generación y edición de imagen de última generación fuera del ecosistema PyTorch, desde C# mediante el host Nexaflow o desde cualquier runtime compatible con ONNX Runtime 1.30 o superior; por otro, documenta con detalle las decisiones de exportación (caché de prompt, escalado por potencias de dos en ramas fp16, atención fusionada) que hacen viable la inferencia en precisión mixta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer unificado a nivel de píxel (UiT) sin VAE; denoiser basado en el modelo de lenguaje de Qwen3-VL-8B con embedders de timestep y de parches y proyección de salida de HiDream; lector de imágenes basado en la torre de visión de Qwen3-VL con fusionadores DeepStack |
| Parametros totales | no disponible (el denoiser parte de Qwen3-VL-8B; el repositorio no declara el recuento total) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits MatMulNBits (bloques de 32, simétrico) en `denoiser/`; fp16 en `denoiser-fp16/`; fp32 en `picture-reader/` |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | ONNX (grafos para ONNX Runtime con CUDA execution provider), tokenizer.json incluido |

## Arquitectura y entrenamiento

El modelo subyacente, HiDream-O1-Image, es un transformer unificado que opera directamente sobre píxeles: no hay VAE ni codificador de texto separado, sino un único espacio de tokens compartido que codifica píxeles crudos, texto y condiciones de tarea. La exportación a ONNX reproduce esta arquitectura con el denoiser compuesto por el modelo de lenguaje de Qwen3-VL-8B más los embedders de timestep y de parches y la proyección de salida de HiDream, y con un lector de imágenes independiente que es la torre de visión de Qwen3-VL con sus fusionadores DeepStack. La exportación se realizó trazando el modelo PyTorch de HiDream (commit `2c2d29ff`) con `torch.onnx.export`, a partir de la revisión `0b0901d9` del modelo original.

Las innovaciones técnicas de la exportación son notables. El prompt se lee una sola vez: sus tokens solo atienden a los tokens anteriores del propio prompt, por lo que sus claves y valores se cachean y se reutilizan en cada paso, con una desviación de 2×10⁻⁷ (generación) y 1×10⁻⁶ (edición) frente a la predicción del original en fp32. Las imágenes de una edición se leen dos veces, como en HiDream: de forma reducida por el lector de imágenes, cuyos tokens ocupan el lugar de los marcadores de imagen del prompt y cuyos rasgos DeepStack se suman tras las tres primeras capas, y de forma completa como parches limpios de 32×32 tras la imagen ruidosa. La precisión mixta mantiene el flujo residual en fp32 mientras las ramas corren en fp16, con escalado por potencias de dos en `up_proj`, `down_proj` y `v_proj` para evitar desbordamientos (las activaciones alcanzan 2,8×10⁶ en la última capa). La atención usa el operador fusionado `com.microsoft.MultiHeadAttention` de ONNX Runtime, con la máscara causal del prompt como sesgo aditivo. Los embedders de timestep y de parches y la proyección de salida se mantienen en fp32.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset ni el uso de RLHF o DPO en la información proporcionada.

## Capacidades

- Generación de imágenes texto-a-imagen hasta 2048 × 2048 píxeles, dibujando directamente en píxeles sin VAE.
- Edición de imágenes: modificación de escenas existentes (por ejemplo, convertir un día en noche en un puerto, reescribir el menú de una pizarra, transformar un zorro en panda rojo).
- Edición con múltiples imágenes de referencia: inserción de un objeto extraído de una segunda imagen en la escena principal (por ejemplo, colocar una taza de otra foto sobre un escritorio).
- Personalización guiada por sujeto (subject-driven personalization) según la descripción del modelo original.
- Lectura de imágenes mediante la torre de visión de Qwen3-VL, que procesa una imagen por llamada.
- Control fino del proceso de generación mediante guiado (guidance) con prompt vacío, y pasos de denoising configurables (el autor cita 50 pasos guiados).
- Integración con ONNX Runtime 1.30 o superior con CUDA execution provider, y uso desde C# a través del host Nexaflow.
- No se documentan en la información disponible capacidades de tool calling, agentes, audio ni modo de razonamiento explícito.

## Casos de uso

- Generación de ilustraciones y material gráfico a 2048 × 2048: el modelo dibuja directamente en píxeles sin VAE, lo que permite producir imágenes de alta resolución en una sola pasada; con 35 s por imagen en una RTX PRO 6000 (8 bits) es viable para pipelines de producción por lotes.
- Edición fotográfica asistida: cambiar la iluminación de una escena (por ejemplo, convertir un puerto diurno en nocturno) manteniendo la composición, con una fidelidad de 29,1 dB PSNR frente a la pipeline de referencia en PyTorch.
- Modificación de texto dentro de imágenes: reescribir carteles, menús o pizarras conservando el estilo tipográfico, gracias a la coherencia del espacio de tokens compartido entre texto y píxeles.
- Composición de producto: insertar un objeto recortado de una segunda imagen sobre una escena nueva (por ejemplo, una taza sobre un escritorio), útil en catálogos de comercio electrónico y marketing.
- Personalización de marca: generar variaciones de un sujeto concreto manteniendo su identidad visual mediante la personalización guiada por sujeto del modelo original.
- Despliegue en infraestructura con GPU de 16 GB: la variante de 8 bits del denoiser (8,8 GB) más el lector de imágenes (2,3 GB) cabe en tarjetas de gama media-alta, lo que permite montar servicios de edición de imagen sin depender de PyTorch.
- Integración en aplicaciones de escritorio o herramientas internas en C# mediante Nexaflow, al ejecutarse sobre ONNX Runtime en lugar de un stack Python.

## Benchmarks y rendimiento

El autor publica métricas de fidelidad frente a la pipeline de referencia de HiDream en bf16, no benchmarks estándar de calidad de imagen:

| Prueba | 8 bits | fp16 |
|---|---|---|
| Doce prompts generados (PSNR mediana) | 19,9 dB | 20,3 dB |
| Doce prompts generados (PSNR peor caso) | 12,7 dB | 12,2 dB |
| Edición: puerto de noche | 29,1 dB | 29,4 dB |
| Edición: menú de pizarra reescrito | 30,2 dB | 30,2 dB |
| Edición: zorro convertido en panda rojo | 29,7 dB | 30,1 dB |
| Edición: taza insertada en escritorio | 20,8 dB | 20,6 dB |

Referencia del propio autor: la pipeline de HiDream en bf16 frente a fp32 produce imágenes separadas 15,8–39,6 dB, mientras que imágenes no relacionadas se separan 4–11,5 dB.

Rendimiento medido en una RTX PRO 6000:

| Operación | 8 bits | fp16 |
|---|---|---|
| Generación 2048 × 2048 | 35 s | 33 s |
| Edición de una imagen | 80 s | no disponible |
| Edición de dos imágenes | 87 s | no disponible |
| Pico de VRAM del denoiser (generación) | 11,1 GiB | 17,1 GiB |
| Pico de VRAM del denoiser (edición) | 14,5 GiB | 21,5 GiB |
| Pico de VRAM del lector de imágenes | 3,1 GiB | 3,1 GiB |

No se han publicado resultados de benchmarks estándar (FID, CLIP score, GenEval u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada: 11,1 GiB (denoiser 8 bits en generación) o 14,5 GiB (edición) más 3,1 GiB del lector de imágenes, lo que exige una GPU de 16 GB para la variante de 8 bits; la variante fp16 requiere 17,1 GiB en generación y 21,5 GiB en edición, más 3,1 GiB del lector, por lo que necesita 24 GB.
- GPU recomendadas: RTX PRO 6000 (medida por el autor), A100 40/80 GB, H100, L40S y, en general, cualquier GPU con soporte CUDA y al menos 16 GB de VRAM para la variante de 8 bits.
- Cabe en GPU de consumo: sí, en tarjetas de 16 GB o más (RTX 4080, RTX 4090, RTX 5080/5090) con la variante de 8 bits; la variante fp16 requiere 24 GB (RTX 4090, RTX 5090).
- Opciones de despliegue: ONNX Runtime 1.30 o superior con CUDA execution provider; host Nexaflow para aplicaciones en C#. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 35 s por imagen de 2048 × 2048 y 80–87 s por edición en una RTX PRO 6000 con la variante de 8 bits; no se proporcionan cifras de throughput por lote ni latencias en otras GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Formato |
|---|---|---|---|---|---|
| HiDream-O1-Image ONNX (esta ficha) | no disponible (denoiser sobre Qwen3-VL-8B) | no disponible | UiT sin VAE, hasta 2048 × 2048 | MIT | ONNX |
| HiDream-ai/HiDream-O1-Image (original) | no disponible | no disponible | UiT sin VAE, hasta 2048 × 2048 | no disponible en la información | PyTorch (bf16/fp32) |
| Alternativas de generación de imagen de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

La información proporcionada no incluye datos de otros modelos comparables (por ejemplo, FLUX, SD3.5 o Qwen-Image) que permitan una comparación cuantitativa rigurosa. La única comparación disponible es la del propio autor frente a la pipeline de HiDream en PyTorch, recogida en la sección de benchmarks.

## Limitaciones y advertencias

- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; se trata de una exportación reciente y sin validación comunitaria amplia.
- La variante de 8 bits introduce diferencias frente a la pipeline original: la mediana de PSNR en generación baja a 19,9 dB y el peor caso cae a 12,7 dB, lo que en 50 pasos guiados puede amplificar diferencias visibles.
- La variante de 8 bits y la fp16 no son idénticas entre sí (19,9 frente a 20,3 dB de mediana), por lo que los resultados no son intercambiables entre builds.
- El lector de imágenes es fp32 y procesa una sola imagen por llamada; en fp16 sus tokens se desvían un 4 % respecto al original, por lo que no se ofrece una alternativa de menor precisión.
- El modelo dibuja en píxeles sin VAE, lo que implica un coste computacional elevado en resoluciones altas (35 s por imagen de 2048 × 2048 en una RTX PRO 6000).
- No se dispone de información sobre sesgos, tasas de alucinación visual, idiomas soportados ni restricciones específicas de contenido del modelo original.
- La licencia MIT del repositorio de exportación no aclara por sí sola las condiciones de uso comercial del modelo base HiDream-O1-Image; conviene verificar la licencia del modelo original antes de un despliegue en producción.
- El uso requiere ONNX Runtime 1.30 o superior con CUDA execution provider; no hay soporte documentado para CPU ni para otros backends.
- El prompt debe construirse con el formato exacto de HiDream (`<|im_start|>user\n{prompt}<|im_end|>\n<|im_start|>assistant\n<|boi_token|>`) y, en edición, con los tokens de visión en el orden indicado; un formateo incorrecto degrada la salida.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/smile-forge/hidream-o1-image-onnx
- Modelo base: https://huggingface.co/HiDream-ai/HiDream-O1-Image
- Repositorio GitHub del modelo original: https://github.com/HiDream-ai/HiDream-O1-Image
- Host Nexaflow: https://github.com/smile-forge/nexaflow
