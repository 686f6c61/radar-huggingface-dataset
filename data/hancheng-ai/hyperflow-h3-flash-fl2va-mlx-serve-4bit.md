# hancheng-ai/HyperFlow-H3-Flash-FL2VA-MLX-Serve-4bit

## Resumen

HyperFlow H3 Flash FL2VA MLX-Serve 4-bit es una cuantización de 4 bits en formato MLX del modelo HyperFlow H3 Flash FL2VA, desarrollado por Video Rebirth AI. Se trata de un derivado comprimido y destilado en pocos pasos del modelo MiniMax-H3 FL2VA de MiniMax, orientado a la generación conjunta de vídeo y audio estéreo a partir de texto y de keyframes de primer y último fotograma. El paquete está empaquetado específicamente para Apple Silicon mediante la librería mlx-serve, lo que permite ejecutar generación de vídeo con audio en hardware de Apple.

El modelo conserva la arquitectura de difusión basada en transformer (DiT) del MiniMax-H3 original, pero elimina 3 de sus 50 bloques DiT, factoriza 102 capas lineales a rango bajo y condiciona cada paso de muestreo a dos instantes temporales (posición actual y destino). El resultado es un modelo que genera clips con audio estéreo en 4, 6 u 8 pasos, sin necesidad de classifier-free guidance ni de LoRA adicional. Esta versión concreta aplica cuantización afín de 4 bits (group size 64) sobre el DiT, mantiene el text encoder de MiniMax-H3 en 4 bits y deja ambos VAE sin modificar.

Su relevancia radica en que lleva un modelo de generación de vídeo con audio de la familia MiniMax-H3 a un formato ejecutable en Macs con Apple Silicon, con un consumo de memoria medido de entre 21,6 y 24,3 GiB para resoluciones de 640x960. No obstante, el propio autor recomienda el pack de 8 bits como opción por defecto, ya que este de 4 bits no es más rápido y se aleja más de la referencia, ahorrando únicamente 7 GB de disco.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DiT (diffusion transformer) destilado, derivado de MiniMax-H3 FL2VA; 47 de 50 bloques DiT, 102 lineales factorizadas a rango bajo |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | MLX afín 4 bits (group size 64) en el DiT; text encoder MiniMax-H3 en 4 bits; VAEs sin modificar |
| Idiomas soportados | no disponible |
| Licencia | MiniMax H3 Community License Agreement (license: other) |
| Formato de pesos | MLX (librería mlx; repo de 29,5 GB) |

## Arquitectura y entrenamiento

El modelo es un derivado comprimido del MiniMax-H3 FL2VA. La arquitectura es un transformer de difusión (DiT) al que se le han eliminado 3 de sus 50 bloques y en el que 102 capas lineales se han factorizado a rango bajo. Además, cada paso de muestreo está condicionado a dos tiempos: dónde está el modelo en ese momento y dónde aterrizará, lo que permite generar en muy pocos pasos (4, 6 u 8) sin classifier-free guidance ni LoRA. El modelo produce simultáneamente vídeo y audio estéreo, y soporta tanto text-to-audio-video (T2VA) como first/last-keyframe audio-video (FL2VA).

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. La model card indica que el DiT ya está destilado y que un LoRA para el modelo base aterrizaría en los bloques equivocados, por lo que mlx-serve rechaza `lora_paths` y `turbo` para este pack. La cuantización se aplica únicamente al DiT (4 bits afín, group size 64); el text encoder es una copia byte a byte del de MiniMax-H3 en 4 bits (sha256 `00a6817a979848c94a60aa9c0c380b2e6cb7735363aaabfaf1a6678fe4748a7f`) y ambos VAE permanecen sin modificar.

## Capacidades

- Generación de vídeo con audio estéreo a partir de texto (T2VA), con salida de frames `rgb8` a 24 fps y audio `pcm_s16le` a 32 kHz estéreo.
- Generación de vídeo con audio condicionada por primer y/o último fotograma (FL2VA), aceptando imágenes PNG o JPEG en base64 como `first_frame_image` y `last_frame_image`.
- Generación en pocos pasos: 4, 6 (por defecto) u 8 pasos; cualquier otro número es rechazado.
- Sin necesidad de classifier-free guidance ni de LoRA turbo, al estar el DiT ya destilado.
- Soporte de streaming de eventos de progreso mediante `"stream": true`.
- Resoluciones configurables mediante `width`, `height` y `num_frames` (ejemplos medidos a 640x960 con 73 y 124 frames).
- No se dispone de información sobre capacidades multilingües, tool calling ni razonamiento multi-paso; el pipeline es text-to-video.

## Casos de uso

- Generación de clips publicitarios cortos con audio: el modelo produce vídeo y banda sonora estéreo en una sola pasada de 4 a 8 pasos, lo que permite iterar rápidamente sobre variantes creativas en un Mac con Apple Silicon.
- Interpolación de keyframes en animación: usando `first_frame_image` y `last_frame_image`, se pueden generar transiciones de 124 frames entre dos fotogramas dados, útil para storyboards y previzualización.
- Creación de contenido para redes sociales: clips verticales a 640x960 con audio integrado generados localmente, sin depender de servicios en la nube.
- Prototipado de vídeo en estudios pequeños con hardware Apple: el consumo medido de 21,6 GiB para 73 frames y 24,3 GiB para 124 frames permite trabajar en equipos de 64 GB o más.
- Generación de sonido ambiente y paisajes sonoros sincronizados: el prompt admite un campo `overall_soundscape` para describir el audio (por ejemplo, lluvia constante y goteo de agua) junto a la descripción visual.
- Pruebas de concepto de audio-vídeo en investigación: la posibilidad de comparar la salida con la referencia mediante similitud coseno de la dirección del paso facilita experimentos de fidelidad de cuantización.
- Automatización de demos y maquetas: la API HTTP de mlx-serve (`/v1/video/generations`) permite integrar la generación en scripts y pipelines internos.

## Benchmarks y rendimiento

La model card proporciona medidas de acuerdo con la referencia (similitud coseno de la dirección del paso frente a stable-diffusion.cpp con el parche de dos tiempos de Video Rebirth, sobre una petición de 256x256 y 17 frames con primer y último keyframe):

| Pack | Paso | Coseno vídeo | Coseno audio |
|---|---|---|---|
| 8-bit | primero de 6 | 0,999714 | 0,998619 |
| 8-bit | cuarto de 6 | 0,999410 | 0,999835 |
| 4-bit | primero de 6 | 0,995355 | 0,948048 |
| 4-bit | cuarto de 6 | 0,994099 | 0,993850 |

Velocidad y memoria pico (Apple M5 Ultra, 256 GB, macOS 27; una petición FL2VA 640x960 con primer y último keyframe por ejecución, mediana de 3 ejecuciones):

| Petición | Este pack (4-bit) | Flash 8-bit | MiniMax-H3 stock 4-bit + Turbo LoRA, 8 pasos |
|---|---|---|---|
| FL2VA 640x960, 73 frames | 59 s, 21,6 GiB, -39 LUFS | 60 s, 21,7 GiB, -42 LUFS | 89 s, 28,6 GiB, -31 LUFS |
| FL2VA 640x960, 124 frames | 120 s, 24,3 GiB, -39 LUFS | 120 s, 24,5 GiB, -41 LUFS | 181 s, 31,0 GiB, -27 LUFS |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, al no tratarse de un modelo de lenguaje.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 21,6 GiB de pico para FL2VA 640x960 con 73 frames y 24,3 GiB para 124 frames (medido en Apple M5 Ultra con 256 GB).
- Hardware recomendado: Apple Silicon con 64 GB o más de memoria unificada; en GPUs Apple con aceleradores neuronales y 64 GB o más, mlx-serve convierte ambos packs a los mismos kernels int8 al cargar.
- No se dispone de datos de funcionamiento en GPUs NVIDIA (A100, H100, RTX 4090) ni en otras plataformas; el pack es específico de MLX para Apple Silicon.
- Despliegue: mlx-serve con soporte para HyperFlow H3 Flash (PR #1169); las builds publicadas de mlx-serve sin ese soporte rechazan el pack o fallan al cargarlo. Comando: `mlx-serve --model /path/to/HyperFlow-H3-Flash-FL2VA-MLX-Serve-4bit --serve --port 8080`.
- Latencia medida: 59 s para 73 frames y 120 s para 124 frames por petición completa (incluye codificación de texto y decodificación VAE).
- Almacenamiento: 29,5 GB de repositorio; el pack de 8 bits ocupa 36,4 GB.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento (FL2VA 640x960, 73 frames) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HyperFlow H3 Flash FL2VA MLX 4-bit (este) | no disponible (47 bloques DiT) | no disponible | 59 s, 21,6 GiB, coseno audio 0,948 en el primer paso | MiniMax H3 Community License | Hugging Face (MLX) |
| HyperFlow H3 Flash FL2VA MLX 8-bit | no disponible | no disponible | 60 s, 21,7 GiB, coseno audio 0,998619 en el primer paso | MiniMax H3 Community License | Hugging Face (MLX) |
| MiniMax-H3 FL2VA stock 4-bit + Turbo LoRA, 8 pasos | no disponible | no disponible | 89 s, 28,6 GiB | MiniMax H3 Community License | Hugging Face |

No se dispone de información sobre otros modelos comparables de generación de vídeo con audio en la documentación proporcionada.

## Limitaciones y advertencias

- El número de pasos debe ser 4, 6 u 8; cualquier otro valor es rechazado porque el schedule se entrenó para esos conteos.
- No admite LoRA, `turbo` ni classifier-free guidance: el DiT ya está destilado y un LoRA del modelo base aterrizaría en los bloques equivocados; mlx-serve rechaza `lora_paths` y `turbo` para este pack.
- En prompts que piden silencio o una banda sonora muy silenciosa, algunas semillas producen audio casi inaudible; stable-diffusion.cpp con el mismo modelo muestra el mismo comportamiento.
- El pack de 4 bits no es más rápido que el de 8 bits y se aleja más de la referencia (coseno de audio 0,948048 en el primer paso frente a 0,998619 del 8-bit); solo ahorra 7 GB de disco.
- Los medios generados pueden contener errores; hay que revisar las salidas antes de usarlas.
- Obligaciones de licencia: un producto o servicio comercial que lo use debe mostrar "MiniMax H3" en su interfaz de usuario; las salidas publicadas o compartidas públicamente deben declararse claramente como generadas por máquina; no se puede usar el modelo ni sus salidas para entrenar o mejorar otro modelo de IA.
- El acuerdo no cubre el uso en la Unión Europea, el Reino Unido, la República de Corea ni los Estados Unidos de América sin autorización de MiniMax.
- Si los productos y servicios comerciales facturan más de 20 millones de dólares anuales, se requiere autorización previa de MiniMax.
- No se dispone de información sobre sesgos, idiomas soportados ni riesgo de alucinación específicos de este modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hancheng-ai/HyperFlow-H3-Flash-FL2VA-MLX-Serve-4bit
- Modelo base: https://huggingface.co/VideoRebirthAI/hyperflow-h3-flash
- Licencia MiniMax-H3: https://huggingface.co/MiniMaxAI/MiniMax-H3/blob/main/LICENSE
- Repositorio mlx-serve: https://github.com/ddalcu/mlx-serve
- PR de soporte HyperFlow H3 Flash en mlx-serve: https://github.com/ddalcu/mlx-serve/pull/1169
