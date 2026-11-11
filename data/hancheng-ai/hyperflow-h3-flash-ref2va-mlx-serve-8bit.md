# hancheng-ai/HyperFlow-H3-Flash-REF2VA-MLX-Serve-8bit

## Resumen

HyperFlow H3 Flash REF2VA MLX-Serve 8-bit es un paquete de inferencia para Apple Silicon del modelo HyperFlow H3 Flash, desarrollado por Video Rebirth AI como derivado comprimido de MiniMax-H3 REF2VA. Este empaquetado concreto lo publica el usuario hancheng-ai y esta optimizado para la libreria MLX de Apple, permitiendo generar video con audio estereo a partir de imagenes de referencia o de texto. El modelo base es una version destilada de pocos pasos del MiniMax-H3, lo que reduce el coste de inferencia a 4, 6 u 8 pasos sin necesidad de guidance ni LoRA.

La relevancia de este paquete reside en que lleva un modelo de generacion de video con audio de gran tamano (37,2 GB de repositorio) al ecosistema local de Apple Silicon mediante cuantizacion afin de 8 bits (group size 64) en el DiT, manteniendo el codificador de texto en 4 bits y los VAE sin modificar. Esto permite ejecutar generacion de video-audio en un Mac de gama alta sin depender de GPUs NVIDIA ni de servicios en la nube.

El modelo resuelve la tarea de referencia-a-video-audio (Ref2VA) y texto-a-video-audio, con soporte para imagenes, videos y audios de referencia. Su licencia es la MiniMax H3 Community License Agreement, con obligaciones comerciales y restricciones geograficas que condicionan su uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) derivado de MiniMax-H3, con 49 de los 50 bloques DiT originales, 114 capas lineales factorizadas a bajo rango y condicionamiento en dos tiempos (posicion actual y destino) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | DiT en MLX affine 8-bit (group size 64); codificador de texto en 4-bit; VAE sin modificar. Existe tambien un pack 4-bit del mismo autor |
| Idiomas soportados | no disponible |
| Licencia | MiniMax H3 Community License Agreement (license: other) |
| Formato de pesos | MLX (repo de 37,2 GB); no se indica safetensors ni GGUF en la informacion disponible |
| Pasos de inferencia | 4, 6 (por defecto) u 8; otros valores son rechazados |
| Resolucion de ejemplo | 768x1344, 141 frames, 24 fps |
| Audio | PCM s16le, 32 kHz estereo |
| Libreria | mlx (mlx-serve) |

## Arquitectura y entrenamiento

El modelo es un Diffusion Transformer (DiT) derivado de MiniMax-H3 REF2VA. HyperFlow H3 Flash aplica una compresion sobre el modelo original: elimina 1 de los 50 bloques DiT y factoriza 114 capas lineales a bajo rango. Ademas, cada paso de difusion esta condicionado en dos tiempos (donde esta y donde aterriza), lo que permite la generacion en pocos pasos (4, 6 u 8) sin classifier-free guidance ni LoRA. El DiT esta destilado, por lo que no admite LoRA del modelo base ni el modo turbo.

El empaquetado MLX cuantiza el DiT a 8 bits afines con group size 64, mantiene el codificador de texto original de MiniMax-H3 en 4 bits (copia byte a byte, sha256 `0323dda5f35a607de923daa779fc53b813b7c882fd82d8525b7415f72853a5c5`) y deja ambos VAE sin modificar. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO en la informacion proporcionada.

## Capacidades

- Generacion de video con audio estereo sincronizado en 4, 6 u 8 pasos.
- Referencia a video y audio (Ref2VA): acepta `ref_images` (PNG o JPEG en base64), `ref_videos` y `ref_audios`, nombrados en el prompt como `<Picture N>`.
- Texto a video-audio sin referencia: basta con omitir `ref_images` y las etiquetas `<Picture N>`.
- Generacion de bandas sonoras y ambientes descritos en el prompt (por ejemplo, `overall_soundscape`).
- Salida de frames RGB8 a 24 fps y audio PCM s16le a 32 kHz estereo, listos para multiplexar con ffmpeg.
- Soporte de streaming de progreso mediante `"stream": true`.
- Control de semilla (`seed`) para reproducibilidad.
- No soporta LoRA, turbo ni classifier-free guidance; mlx-serve rechaza `lora_paths` y `turbo` para este pack.

## Casos de uso

- Prototipado de video generativo en local sobre Apple Silicon: un estudio puede generar clips de 768x1344 y 141 frames con audio en un Mac Studio o MacBook Pro de gama alta, sin depender de GPUs NVIDIA ni de APIs externas, usando mlx-serve como servidor HTTP compatible con peticiones `/v1/video/generations`.
- Animacion de personajes a partir de una imagen de referencia: se pasa un retrato o una ilustracion como `ref_images` y se describe el movimiento en el prompt (por ejemplo, girar la cabeza hacia la ventana), lo que permite crear clips animados de assets 2D o 3D con banda sonora generada.
- Generacion de contenido para redes sociales y marketing: clips cortos con audio integrado a partir de una imagen de producto o un storyboard, con control de semilla para iterar variantes y seleccionar la mejor toma.
- Doblaje y ambientacion automatica de escenas: el modelo genera el audio estereo junto al video, lo que simplifica la produccion de piezas con room tone, efectos y ambiente descritos en el prompt, reduciendo el trabajo de postproduccion de audio.
- Investigacion en generacion multimodal: el paquete permite reproducir y comparar la salida del DiT cuantizado frente a la referencia en stable-diffusion.cpp, con metricas de similitud coseno por paso, util para estudiar el impacto de la cuantizacion en modelos de difusion.
- Creacion de demos interactivas y herramientas creativas: al exponerse como servidor HTTP con streaming de progreso, puede integrarse en interfaces web o aplicaciones de escritorio que muestren el avance de la generacion y permitan al usuario ajustar prompt, semilla y numero de pasos.
- Evaluacion de pipelines de video-audio en CI: la API permite automatizar peticiones con semillas fijas y comparar resultados entre versiones del runtime o del pack, detectando regresiones en la calidad o en el audio generado.

## Benchmarks y rendimiento

Resultados medidos en Apple M5 Ultra, 256 GB, macOS 27 (Darwin 27.0.0), con mlx-serve compilado desde la rama del PR #1169. La similitud coseno compara una pasada del DiT con stable-diffusion.cpp ejecutando el parche de dos tiempos de Video Rebirth sobre las mismas entradas (256x256, 17 frames, solo texto).

| Pack | Paso | Similitud coseno video | Similitud coseno audio |
|---|---|---|---|
| 8-bit | primero de 6 | 0,999468 | 0,999913 |
| 8-bit | cuarto de 6 | 0,996744 | 0,997843 |
| 4-bit | primero de 6 | 0,982897 | no disponible (ejecucion detenida en la comprobacion de video) |
| 4-bit | cuarto de 6 | 0,986248 | no disponible (ejecucion detenida en la comprobacion de video) |

Rendimiento y memoria pico para una peticion Ref2VA de 768x1344 y 141 frames con una imagen de referencia (mediana de 3 ejecuciones por brazo, brazos alternados en una misma sesion con la GPU dedicada):

| Peticion | Este pack (8-bit) | Flash 4-bit | MiniMax-H3 stock 4-bit + Turbo LoRA, 8 pasos |
|---|---|---|---|
| REF2VA 768x1344, 141 frames | 361 s, 30,5 GiB, -36 LUFS | 362 s, 30,2 GiB, -40 LUFS | 522 s, 38,7 GiB, -25 LUFS |

No se han publicado resultados de benchmarks academicos (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: aproximadamente 30,5 GiB de pico de proceso para una peticion Ref2VA de 768x1344 y 141 frames con el pack de 8 bits; el pack de 4 bits ronda los 30,2 GiB, practicamente lo mismo.
- Hardware de referencia medido: Apple M5 Ultra con 256 GB de memoria unificada y macOS 27.
- El autor indica que en GPUs Apple con aceleradores neuronales y 64 GB o mas, mlx-serve convierte ambos packs a los mismos kernels int8 al cargar; en otros Mac no se midio.
- No cabe en GPUs de consumo tipo RTX 4090 por la via de MLX (la libreria es exclusiva de Apple Silicon); para NVIDIA habria que recurrir al runtime GGUF de Video Rebirth, no cubierto por este pack.
- Despliegue: mlx-serve con soporte para HyperFlow H3 Flash (PR #1169); las builds publicadas sin ese soporte rechazan o fallan al cargar el pack. Arranque con `mlx-serve --model /path/to/HyperFlow-H3-Flash-REF2VA-MLX-Serve-8bit --serve --port 8080`.
- Latencia y throughput: 361 s por peticion de 768x1344 y 141 frames en el hardware de referencia, incluyendo codificacion de texto y decodificacion VAE.
- Almacenamiento: 37,2 GB de repositorio para el pack de 8 bits; el pack de 4 bits ahorra unos 7 GB de disco.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento medido (768x1344, 141 frames) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HyperFlow H3 Flash REF2VA MLX-Serve 8-bit (este pack) | no disponible | no disponible | 361 s, 30,5 GiB, -36 LUFS | MiniMax H3 Community License | MLX, Apple Silicon |
| HyperFlow H3 Flash 4-bit (mismo autor) | no disponible | no disponible | 362 s, 30,2 GiB, -40 LUFS; coseno video 0,982897 / 0,986248 | MiniMax H3 Community License | MLX, Apple Silicon |
| MiniMax-H3 stock 4-bit + Turbo LoRA, 8 pasos | no disponible | no disponible | 522 s, 38,7 GiB, -25 LUFS | MiniMax H3 Community License | Runtime de Video Rebirth (GGUF) |

No se dispone de datos de otros modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- El numero de pasos debe ser 4, 6 (por defecto) u 8; cualquier otro valor es rechazado porque el schedule se entreno solo para esos conteos.
- No admite LoRA, turbo ni classifier-free guidance: el DiT ya esta destilado y un LoRA del modelo base aterrizaria en bloques incorrectos; mlx-serve rechaza `lora_paths` y `turbo`.
- En prompts que piden silencio o una banda sonora muy silenciosa, algunas semillas producen audio casi mudo; stable-diffusion.cpp con el mismo modelo muestra el mismo comportamiento.
- Las referencias de audio (`ref_audios`, banda sonora de `ref_videos`) funcionaron en mlx-serve cuando se probaron, aunque el runtime GGUF de Video Rebirth solo documenta referencias de imagen; debe tratarse como observado, no garantizado.
- El contenido generado puede contener errores; es necesario revisar las salidas antes de usarlas.
- Licencia: un producto o servicio comercial que lo use debe mostrar "MiniMax H3" en la interfaz de usuario; las salidas publicadas o compartidas publicamente deben declararse claramente como generadas por maquina; no se puede usar el modelo ni sus salidas para entrenar o mejorar otro modelo de IA.
- El acuerdo no cubre el uso en la Union Europea, el Reino Unido, la Republica de Corea ni los Estados Unidos de America sin autorizacion de MiniMax.
- Si los productos y servicios comerciales superan los 20 millones de dolares anuales, se requiere autorizacion previa por escrito de MiniMax.
- Se aplica la Acceptable Use Policy (Exhibit A del acuerdo) a cualquier uso.
- No se dispone de informacion sobre sesgos conocidos ni sobre el rendimiento en idiomas distintos del usado en los prompts de ejemplo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hancheng-ai/HyperFlow-H3-Flash-REF2VA-MLX-Serve-8bit
- Modelo base: https://huggingface.co/VideoRebirthAI/hyperflow-h3-flash
- Licencia MiniMax-H3: https://huggingface.co/MiniMaxAI/MiniMax-H3/blob/main/LICENSE
- mlx-serve (repositorio): https://github.com/ddalcu/mlx-serve
- mlx-serve PR #1169 (soporte HyperFlow H3 Flash): https://github.com/ddalcu/mlx-serve/pull/1169
