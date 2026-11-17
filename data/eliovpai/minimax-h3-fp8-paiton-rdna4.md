# EliovpAI/MiniMax-H3-FP8-Paiton-RDNA4

## Resumen

MiniMax-H3-FP8-Paiton-RDNA4 es una conversión cuantizada a FP8 del modelo MiniMax-H3 (Ref2VA, reference-to-video con audio) de MiniMaxAI, empaquetada por EliovpAI para ejecutarse en GPUs AMD RDNA4 mediante el runner nativo `paiton-vllm-plugin` (v1.2). El problema que resuelve es de despliegue: la release original en BF16 ocupa 144 GB y su transformer solo (66,3 GB) duplica la memoria de una tarjeta de consumo profesional, por lo que este build reduce el peso en disco a 50,9 GB por preset y el pico de VRAM a 24,7-26,8 GiB, permitiendo inferencia en una única Radeon AI PRO R9700 de 32 GB.

El modelo es multimodal de generación de vídeo con audio: recibe un prompt de texto y entre 1 y 9 imágenes de referencia (o un vídeo de referencia) y produce clips de 5,2 segundos a 864×480 con sonido estéreo, a 24 fps y 124 frames. La arquitectura subyacente combina un transformer de difusión para vídeo, un VAE de vídeo (decoder INT8, encoder BF16), un VAE de audio en FP32 y un text encoder Qwen3-VL-32B (capas 0-49 en FP8 más vision tower, 27,2 GB) compartido con MiniMax-H3 Image.

Su relevancia es doble: por un lado demuestra que la generación de vídeo con audio de gran tamaño puede caber en hardware AMD consumer/prosumer con ROCm y gfx1201; por otro, sus pesos están empaquetados para los kernels específicos del runner (HIP compilado para RDNA4, sin PyTorch, diffusers ni ComfyUI), por lo que no son portables a otros stacks. La licencia comunitaria de MiniMax excluye explícitamente la Unión Europea, el Reino Unido, Corea del Sur y Estados Unidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión para vídeo con audio (Ref2VA), con VAE de vídeo y VAE de audio; text encoder Qwen3-VL-32B |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (transformer Turbo4/Turbo8), INT8 (decoder VAE de vídeo), BF16 (encoder VAE de vídeo), FP32 (VAE de audio), FP8 (text encoder) |
| Idiomas soportados | no disponible |
| Licencia | MiniMax H3 Community License (excluye UE, Reino Unido, Corea del Sur y EE. UU.) |
| Formato de pesos | `.bin` empaquetados para los kernels del runner `paiton-vllm-plugin` (no compatibles con diffusers ni ComfyUI) |

## Arquitectura y entrenamiento

No se dispone de información sobre el proceso de entrenamiento del modelo base MiniMax-H3 (número de tokens, composición del dataset, uso de RLHF/DPO) en la información proporcionada. Lo que sí se documenta es la arquitectura de despliegue: un pipeline de difusión con un transformer denoiser en FP8 (con LoRA Turbo fusionada para 4 u 8 pasos), un VAE de vídeo con decoder INT8 y encoder BF16, un VAE de audio en FP32 y un text encoder Qwen3-VL-32B del que se usan las capas 0-49 en FP8 junto con la vision tower (27,2 GB en total). El text encoder se reutiliza desde el repositorio MiniMax-H3-Image-FP8-Paiton-RDNA4, fijado por revisión y SHA-256, para no duplicar 27,2 GB en disco.

La innovación técnica principal de este build es el runner nativo: código HIP compilado específicamente para RDNA4 (gfx1201), sin PyTorch, diffusers ni ComfyUI en el interior, invocable por HTTP o desde un nodo de ComfyUI (`paiton_h3v_client`). El servidor carga los pesos una vez al arrancar (76 s en la prueba del autor, incluyendo verificación SHA-256 de cada fichero) y los mantiene en memoria entre peticiones. Se ofrecen dos presets de pasos (Turbo4 y Turbo8) con transformers de 20,3 GB y 20,5 GB respectivamente.

## Capacidades

- Generación de vídeo texto-a-vídeo (text-to-video) con resolución 864×480 y 1344×768, 124 frames a 24 fps (5,2 s).
- Generación de audio sincronizado con el vídeo (audio-video-generation), con salida estéreo.
- Reference-to-video: acepta de 1 a 9 imágenes de referencia para condicionar sujetos y escenas.
- Reference-to-video a partir de un vídeo de referencia con su banda sonora.
- Comprensión de referencias visuales mediante el vision tower del text encoder Qwen3-VL-32B (identificación de sujetos referenciados como `<Picture 1>` en el prompt).
- Control de calidad/velocidad mediante presets de pasos de denoising (Turbo4 rápido, Turbo8 de mayor calidad).
- Despliegue como servicio HTTP (`/v1/videos/generations`) e integración como nodo de ComfyUI.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso; no aplica a este tipo de modelo.

## Casos de uso

- Previsualización de vídeo publicitario: generar clips de 5,2 s a 864×480 en unos 30 s con una sola imagen de producto como referencia, útil para iterar conceptos creativos antes de producir en alta resolución.
- Prototipado de escenas con varios personajes: con 3 referencias el modelo tarda 33,4 s y con 9 referencias 44,3 s a 864×480, lo que permite componer escenas con múltiples sujetos identificados por `<Picture N>` sin salir de una única GPU.
- Doblaje y sonorización rápida: el modo de vídeo de referencia con banda sonora (203,8 s por petición) sirve para regenerar o adaptar un clip manteniendo su audio de referencia.
- Generación de material para redes sociales en formato corto: clips de 5,2 s con audio estéreo listos para publicar, generados en hardware AMD de una sola tarjeta.
- Integración en pipelines de postproducción vía ComfyUI: el nodo `paiton_h3v_client` delega el trabajo al servidor, de modo que ComfyUI puede correr en CPU y la GPU R9700 se dedica solo a la inferencia.
- Investigación en modelos de difusión vídeo+audio sobre ROCm: el runner nativo y los benchmarks publicados (CLIP-T, CLIP-I, DINOv2 frente a BF16) permiten reproducir y comparar calidad y latencia en RDNA4.
- Generación de vídeo a mayor resolución bajo demanda: a 1344×768 con 9 referencias el tiempo sube a 114,1 s, adecuado para tomas finales de mayor calidad una vez validado el concepto.

## Benchmarks y rendimiento

Tiempos por petición en una R9700 con preset Turbo4, 124 frames a 24 fps, desde inputs preparados hasta MP4 final (datos del autor):

| Peticion | v1.2 (estos pesos) | v1.1.0 (W4A8) | Mejora |
|---|---:|---:|---:|
| 864×480, 1 imagen | 30,4 s | 50,6 s | 1,7× |
| 864×480, 3 imágenes | 33,4 s | 85,3 s | 2,6× |
| 864×480, 9 imágenes | 44,3 s | 178,7 s | 4,0× |
| 1344×768, 9 imágenes | 114,1 s | 258,4 s | 2,3× |
| 864×480, 1 vídeo con banda sonora | 203,8 s | no medido | — |
| 864×480, 1 imagen, 8 pasos (Turbo8) | 51,4 s | 109,2 s | 2,1× |

Calidad frente al modelo BF16 en diffusers (MI355X, mismos prompts, referencias, semilla y ruido inicial):

| Peticion | CLIP-T BF16 | CLIP-T estos pesos |
|---|---:|---:|
| 864×480, 1 imagen | 29,52 | 29,77 |
| 864×480, 3 imágenes | 34,68 | 34,35 |
| 864×480, 9 imágenes | 26,31 | 25,70 |
| 1344×768, 9 imágenes | 25,80 | 25,71 |
| 864×480, 1 vídeo | 29,87 | 29,86 |

En 15 clips (dos semillas, ambos presets) la similitud media de frames frente al clip BF16 es de 0,932 (CLIP-I) y 0,871 (DINOv2). Con nueve referencias los sujetos aparecen todos, pero pueden situarse en posiciones distintas a las del clip BF16. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ya que no son aplicables a un modelo de generación de vídeo.

## Requisitos de hardware

- VRAM: pico de 24,7 a 26,8 GiB según petición; una imagen a 864×480 baja de 30,6 GiB (v1.1.0) a 24,8 GiB en esta versión.
- GPU: una Radeon AI PRO R9700 (32 GB, 300 W) dedicada en exclusiva, sin otros procesos. Arquitectura RDNA4 / gfx1201.
- No cabe en GPUs de consumo de 24 GB o menos; requiere al menos 32 GB de VRAM en RDNA4.
- Disco: 50,9 GB para un preset (20,3 GB transformer Turbo4 o 20,5 GB Turbo8, más 3,4 GB de VAEs y 7 MB de tokenizer); el text encoder se descarga aparte desde el repo de MiniMax-H3-Image.
- RAM de host: unos 41 GB libres para la ruta más rápida del text encoder; con menos, el runner lo lee de disco.
- Software: Docker, ROCm y el runner `paiton-vllm-plugin` v1.2 (código HIP compilado, sin PyTorch/diffusers/ComfyUI).
- Arranque: carga de pesos en 76 s en la prueba del autor, incluyendo verificación SHA-256; los pesos permanecen en memoria entre peticiones.
- Throughput/latencia: 30-44 s por clip a 864×480 y 114 s a 1344×768 con Turbo4; 51 s con Turbo8 a 864×480.
- Opciones de despliegue: servidor HTTP nativo (`/v1/videos/generations`) o nodo de ComfyUI. No es compatible con vLLM estándar, llama.cpp, Ollama ni TGI.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Resolucion / duracion | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| MiniMax-H3-FP8-Paiton-RDNA4 (este) | no disponible | no disponible | 864×480 y 1344×768, 5,2 s, con audio | MiniMax H3 Community (excluye UE, RU, Corea del Sur, EE. UU.) | 1× Radeon AI PRO R9700 32 GB |
| MiniMax-H3 original BF16 (MiniMaxAI) | no disponible | no disponible | misma base | MiniMax H3 Community | 144 GB en disco; transformer de 66,3 GB |
| MiniMax-H3-W4A8-Paiton-RDNA4 (EliovpAI) | no disponible | no disponible | misma base | MiniMax H3 Community | 1× R9700; más lento que este build (50,6-258,4 s por clip) |
| Modelos de vídeo open source de otros proveedores | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos con modelos de otros proveedores en la información proporcionada.

## Limitaciones y advertencias

- Licencia restrictiva: la MiniMax H3 Community License excluye la Unión Europea, el Reino Unido, Corea del Sur y Estados Unidos; el uso comercial por encima del umbral de ingresos del acuerdo requiere autorización escrita de MiniMax. Leer `LICENSE` y `NOTICE` antes de descargar o usar.
- Pesos no portables: los ficheros están empaquetados para los kernels del runner `paiton-vllm-plugin` y no funcionan con diffusers ni ComfyUI; quedan atados a RDNA4/gfx1201 y a ese runner.
- Requisito de hardware estricto: una única R9700 dedicada, sin otros procesos; no hay soporte documentado para otras GPUs ni para multi-GPU.
- Fidelidad limitada frente a BF16: con 9 referencias los sujetos pueden aparecer en posiciones distintas a las del clip BF16, y la similitud de frames baja a 0,871 en DINOv2.
- Duración y resolución acotadas: clips de 5,2 s y 124 frames; resoluciones de 864×480 o 1344×768.
- Riesgo de alucinación visual y de audio: no se documentan métricas de fidelidad semántica más allá de CLIP-T, por lo que la correspondencia prompt-vídeo-audio debe validarse en producción.
- Idiomas soportados no disponibles: no se especifica qué lenguas acepta el text encoder Qwen3-VL-32B en este pipeline ni cómo afecta el prompt a la calidad.
- Sesgos: no se documentan evaluaciones de sesgo del modelo base ni de esta cuantización.
- Sin datos de entrenamiento ni de parámetros totales: la ficha no puede confirmar tamaño, contexto ni composición del dataset del modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/EliovpAI/MiniMax-H3-FP8-Paiton-RDNA4
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Runner y plugin: https://github.com/Eliovp-BV/paiton-vllm-plugin/tree/main/models/MiniMax-H3
- Benchmarks y metodología de calidad: https://github.com/Eliovp-BV/paiton-vllm-plugin/blob/main/models/MiniMax-H3/BENCHMARKS.md#quality-against-the-bf16-model
- Build previo W4A8: https://huggingface.co/EliovpAI/MiniMax-H3-W4A8-Paiton-RDNA4
- Text encoder compartido (MiniMax-H3-Image FP8): https://huggingface.co/EliovpAI/MiniMax-H3-Image-FP8-Paiton-RDNA4/tree/b33b88f27c8919ca05632ccde801087796d603dd/te
