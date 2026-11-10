# PedroMarinhoDev/ReCaVSR-ComfyUI

## Resumen

ReCaVSR-ComfyUI es un paquete de pesos en formato int8 para ComfyUI del modelo ReCaVSR (USTC), un sistema de superresolución de vídeo por difusión de un solo paso y en streaming, construido sobre el transformer de Wan2.2 TI2V-5B. El modelo original escala clips de 8 fotogramas en 8 fotogramas, con un único paso de denoising por bloque, y decodifica cada bloque a medida que avanza, lo que permite procesar vídeo de forma continua sin necesidad de disponer de todo el clip en memoria. Este repositorio no contiene el modelo original, sino una conversión de sus pesos a int8 con rotación Hadamard por bloques (ConvRot), empaquetada para las ops de precisión mixta de ComfyUI.

El interés de esta conversión es práctico: reduce el peso del transformer de 10,6 GB en bf16 a 6,27 GB, acelera el transformer entre 1,75 y 1,8 veces y recorta el pico de VRAM en unos 4 GB, con una degradación medida frente a bf16 de 47,2 a 48,0 dB de PSNR. Está pensada para ejecutar superresolución de vídeo 4x en GPUs de consumo (RTX 3090, RTX 4090) dentro de un flujo de ComfyUI, con gestión de memoria propia del nodo.

El repositorio lo publica PedroMarinhoDev como complemento del paquete de nodos ComfyUI-ReCaVSR (GPL-3.0), y depende de los ficheros `prompt.safetensors` y `flashdecoder.safetensors` del repositorio original kopper/ReCaVSR. La licencia de los pesos no está declarada por los autores originales, lo que condiciona su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (Wan2.2 TI2V-5B) con adaptadores ReCaVSR fusionados; 30 bloques; superresolucion de un solo paso por bloque de 8 fotogramas |
| Parametros totales | no disponible (el transformer bf16 original pesa 10,6 GB; la conversion int8, 6,27 GB) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (procesa en bloques de 8 fotogramas en streaming) |
| Tipos de cuantizacion | int8 tensorwise con rotacion ConvRot (matriz Hadamard de bloque de anchura 256, una escala por fila de salida); el resto de componentes en bf16 |
| Idiomas soportados | no disponible (modelo de vision/video, sin interfaz de texto) |
| Licencia | `recavsr-weights` (los pesos originales no declaran licencia; el codigo ReCaVSR es Apache-2.0; los nodos ComfyUI-ReCaVSR son GPL-3.0) |
| Formato de pesos | safetensors (`transformer_int8_convrot.safetensors`), con metadatos `comfy_quant` por capa |

## Arquitectura y entrenamiento

ReCaVSR es un modelo de difusion para superresolucion de video construido sobre el transformer de Wan2.2 TI2V-5B, con adaptadores propios fusionados en los pesos. Funciona en modo streaming: procesa el video en bloques de 8 fotogramas, aplica un unico paso de denoising por bloque y decodifica cada bloque inmediatamente, apoyandose en dos mecanismos descritos en el titulo del paper: latentes reciclados (recycled latents) y enrutado aprendido de cache (learned cache routing). El pipeline asociado es video-to-video y el nodo de ComfyUI expone una operacion de upscale 4x.

Esta version concreta no reentrena el modelo: es una conversion de los pesos bf16 originales mediante `tools/convert_int8.py`. Las matrices de self-attention, las query y output de cross-attention y las feed-forward de los 30 bloques se rotan con una matriz Hadamard de bloque de anchura 256 y se redondean a int8 con una escala por fila de salida, en el formato `int8_tensorwise` de ComfyUI. Permanecen en bf16 el patch embedding, la proyeccion LQ, el conditioning, las claves y valores de cross-attention (calculados una vez por video), las normas y la cabeza. El error relativo medio de los pesos es del 0,96 %. Los GEMM en int8 requieren GPU NVIDIA con compute capability 7,5 o superior (RTX 20 en adelante); en otras GPUs ComfyUI desquantiza los pesos, lo que ahorra memoria pero no tiempo. No se dispone de informacion sobre el dataset de entrenamiento ni sobre el uso de RLHF o DPO.

## Capacidades

- Superresolucion de video 4x en un solo paso de difusion por bloque, con procesamiento en streaming de 8 fotogramas.
- Escalado de resoluciones diversas: los ejemplos medidos incluyen 960x480 a 3840x1920 y 360x360 a 1440x1440.
- Decodificacion con FlashDecoder, con decodificacion por bloque a medida que avanza el streaming.
- Integracion nativa en ComfyUI mediante los nodos ComfyUI-ReCaVSR, con gestion de memoria de ComfyUI y VRAM dinamica.
- Soporte de kernels rapidos (sage attention) y de operaciones de precision mixta int8/bf16 en GPUs Ampere y Ada.
- No dispone de generacion de texto, razonamiento, codigo, tool calling ni capacidades de agente: es exclusivamente un modelo de vision para video.

## Casos de uso

- Restauracion y reescalado de metraje de archivo: el modelo permite llevar clips de baja resolucion (por ejemplo, 960x480) a 4K en bloques de 8 fotogramas, adecuado para digitalizar y mejorar material historico o de camaras antiguas.
- Postproduccion de video en estaciones con GPU de consumo: con un pico de 11,7 GB de VRAM a 1440x1440 en int8, cabe en una RTX 4090 o RTX 3090 y permite iterar sobre clips dentro de un flujo de ComfyUI sin acceso a clústeres.
- Mejora de video para plataformas de streaming: el modo streaming con decodificacion por bloque evita tener que cargar el clip completo, lo que facilita procesar grabaciones largas de forma continua.
- Prototipado de pipelines de upscale en investigación: la conversion int8 con ConvRot sirve para comparar precision y velocidad frente a bf16 con el mismo nodo, midiendo PSNR contra la referencia bf16.
- Generacion de material de demostracion y benchmarks de superresolucion: los clips de ejemplo (calle lluviosa, retrato) y las tablas de tiempos permiten reproducir experimentos en RTX 3090 y RTX 4090.
- Automatizacion por lotes en ComfyUI: al integrarse como nodo con plantilla (`recavsr_video_4x`), se puede encadenar con otros nodos de video para procesar lotes de clips con upscale 4x.

## Benchmarks y rendimiento

Datos medidos por el autor con el nodo ReCaVSR Upscale Video a 4x, kernels rapidos y FlashDecoder, en ComfyUI 0.44.0, PyTorch 2.14.1, sage attention y VRAM dinamica. El PSNR se calcula frente a bf16 con kernels exactos sobre todos los fotogramas de salida del nodo.

| Clip | GPU | bf16 | int8 ConvRot | PSNR int8 vs bf16 |
|---|---|---|---|---|
| Calle lluviosa, 149 fotogramas, 960x480 a 3840x1920 | RTX 4090 | 49 s | 36 s | 48,0 dB |
| Calle lluviosa, 149 fotogramas, 960x480 a 3840x1920 | RTX 3090 | 111 s | 67 s | no disponible |
| Retrato, 180 fotogramas, 360x360 a 1440x1440 | RTX 4090 | 17 s | 15 s | 47,2 dB |
| Retrato, 180 fotogramas, 360x360 a 1440x1440 | RTX 3090 | 33 s | 23 s | no disponible |

El transformer aislado es entre 1,75 y 1,8 veces mas rapido en ambas tarjetas; la ganancia del nodo completo es menor porque el FlashDecoder y las copias de fotogramas no cambian. El pico de VRAM a 1440x1440 es de 11,7 GB en int8 frente a 15,7 GB en bf16. No se han publicado resultados de benchmarks academicos (PSNR/SSIM frente a datasets de referencia) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: pico de 11,7 GB a 1440x1440 con int8 ConvRot y FlashDecoder (frente a 15,7 GB en bf16); el transformer int8 ocupa 6,27 GB en disco frente a 10,6 GB en bf16.
- GPU recomendadas: RTX 4090 y RTX 3090 son las tarjetas con mediciones publicadas. Los GEMM int8 requieren compute capability 7,5 o superior (RTX 20 en adelante); en GPUs sin esa capacidad ComfyUI desquantiza los pesos, con ahorro de memoria pero sin ganancia de velocidad.
- Cabe en GPU de consumo: si, en RTX 3090 y RTX 4090 segun las mediciones; no hay datos para tarjetas de gama media o inferior.
- Opciones de despliegue: ComfyUI 0.44 o superior con los nodos ComfyUI-ReCaVSR; requiere ademas `prompt.safetensors` y `flashdecoder.safetensors` de kopper/ReCaVSR. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 36 s en RTX 4090 y 67 s en RTX 3090 para 149 fotogramas de 960x480 a 3840x1920; 15 s y 23 s respectivamente para 180 fotogramas de 360x360 a 1440x1440.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / modo | Licencia | Disponibilidad |
|---|---|---|---|---|
| ReCaVSR-ComfyUI (int8 ConvRot) | no disponible (transformer de 6,27 GB en int8) | streaming en bloques de 8 fotogramas, un paso de denoising por bloque | `recavsr-weights` (pesos originales sin licencia declarada) | Hugging Face, requiere nodos ComfyUI-ReCaVSR |
| kopper/ReCaVSR (bf16) | no disponible (transformer de 10,6 GB en bf16) | mismo pipeline, sin cuantizar | pesos sin licencia declarada; codigo Apache-2.0 | Hugging Face |
| Wan2.2 TI2V-5B | 5B (aproximado, segun el nombre del modelo base) | modelo base de generacion de video, sin superresolucion especifica | Apache-2.0 | Hugging Face |

No se dispone de datos de rendimiento de modelos alternativos de superresolucion de video en la informacion proporcionada, por lo que la comparativa se limita a parametros, licencia y disponibilidad.

## Limitaciones y advertencias

- La licencia de los pesos originales no esta declarada: el autor indica que estan sujetos a "sus respectivas licencias", lo que genera incertidumbre para uso comercial. El codigo de ReCaVSR es Apache-2.0 y los nodos de ComfyUI son GPL-3.0.
- La cuantizacion int8 introduce una perdida medible: 47,2 a 48,0 dB de PSNR frente a bf16, con un error relativo medio de pesos del 0,96 %; en contenido con detalle fino puede ser perceptible.
- Los GEMM int8 solo aceleran en GPUs NVIDIA de compute capability 7,5 o superior; en otras plataformas se desquantiza y se pierde la ventaja de velocidad.
- No hay informacion sobre sesgos, riesgo de alucinacion visual, idiomas ni limitaciones de contexto; el modelo no procesa texto.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y depende de ficheros externos de kopper/ReCaVSR; no es un paquete autonomo.
- Requiere ComfyUI 0.44 o superior y una instalacion manual de nodos; no se documentan integraciones con otros servidores de inferencia.
- No se han publicado resultados de benchmarks academicos (PSNR/SSIM sobre datasets de referencia) en la informacion disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/PedroMarinhoDev/ReCaVSR-ComfyUI
- Pesos originales: https://huggingface.co/kopper/ReCaVSR
- Codigo de ReCaVSR: https://github.com/kopperx/ReCaVSR
- Nodos ComfyUI-ReCaVSR: https://github.com/PedroMarinhoDev/ComfyUI-ReCaVSR
- Paper (arXiv): https://arxiv.org/abs/2609.37831
- Licencia de los pesos (referencia del autor): https://github.com/kopperx/ReCaVSR#license
