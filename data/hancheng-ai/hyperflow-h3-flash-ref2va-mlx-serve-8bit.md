# hancheng-ai/HyperFlow-H3-Flash-REF2VA-MLX-Serve-8bit

## Resumen

HyperFlow H3 Flash REF2VA MLX-Serve 8-bit es un empaquetado cuantizado del modelo HyperFlow H3 Flash de Video Rebirth, adaptado para ejecutarse en Apple Silicon mediante la libreria mlx-serve. El modelo base es un derivado comprimido de MiniMax-H3 REF2VA: se ha eliminado uno de sus 50 bloques DiT, se han factorizado 114 capas lineales a rango bajo y cada paso de muestreo esta condicionado a dos instantes temporales (donde esta y donde aterriza). El resultado es un generador de video con audio estereo que produce clips en tan solo 4, 6 u 8 pasos, sin guiado por clasificador ni LoRA.

La relevancia de este pack reside en que traslada un modelo de generacion audiovisual de gran tamano al ecosistema local de Apple, con un DiT cuantizado en affine 8-bit (grupo de 64), un codificador de texto MiniMax-H3 estandar a 4-bit y ambos VAE sin modificar. El repositorio ocupa 37,2 GB y esta pensado para servir via API compatible con peticiones de generacion de video.

Se trata de un modelo de la categoria image-to-video (y text-to-video), con capacidades de referencia a audio y video (Ref2VA), distribuido bajo la licencia comunitaria MiniMax H3. Su interes actual es que permite generar clips con audio sincronizado en hardware de consumo Apple de gama alta, con un acuerdo medido respecto al modelo de referencia superior al 0,99 en similitud coseno.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) derivado de MiniMax-H3 REF2VA, con 49 de 50 bloques DiT y 114 lineales factorizadas a rango bajo |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MLX affine 8-bit (grupo de 64) para el DiT; codificador de texto a 4-bit; VAE sin cuantizar |
| Idiomas soportados | no disponible |
| Licencia | MiniMax H3 Community License Agreement |
| Formato de pesos | MLX (safetensors en formato MLX) |

## Arquitectura y entrenamiento

El modelo es un Diffusion Transformer (DiT) derivado de MiniMax-H3 REF2VA mediante destilacion a pocos pasos. Respecto al original, se ha eliminado 1 de sus 50 bloques DiT y se han factorizado 114 capas lineales a rango bajo, lo que reduce el coste computacional. La innovacion clave es el condicionamiento a dos tiempos en cada paso: el modelo conoce tanto el instante actual como el de destino, lo que permite generar en 4, 6 u 8 pasos sin guiado por clasificador ni LoRA adicional. El DiT esta ya destilado, por lo que un LoRA para el modelo base caeria en bloques incorrectos.

El pack incluye un codificador de texto MiniMax-H3 estandar a 4-bit (copia byte a byte, con sha256 `0323dda5f35a607de923daa779fc53b813b7c882fd82d8525b7415f72853a5c5`) y ambos VAE sin modificar. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO en la informacion proporcionada.

## Capacidades

- Generacion de video a partir de texto (text-to-audio-video): produce clips con audio estereo sincronizado sin necesidad de imagen de referencia.
- Generacion de video a partir de imagen de referencia (image-to-video / Ref2VA): acepta imagenes en base64 (PNG o JPEG) referenciadas en el prompt como `<Picture N>`.
- Referencia a audio y video: admite `ref_videos` y `ref_audios` con la misma gramatica de peticion que MiniMax-H3 REF2VA original.
- Generacion de audio estereo integrada: salida `pcm_s16le` a 32 kHz, con control mediante `overall_soundscape` en el prompt.
- Generacion en pocos pasos: 4, 6 (por defecto) u 8 pasos, sin guiado por clasificador ni LoRA.
- Control de resolucion y duracion: parametros `width`, `height`, `num_frames` y `seed` en la peticion.
- Streaming de progreso: soporte de `"stream": true` para eventos de progreso durante la generacion.
- No soporta tool calling ni function calling (no es un modelo de lenguaje).
- No soporta agentes ni razonamiento multi-paso (es un modelo generativo audiovisual).

## Casos de uso

- Prototipado de video publicitario: generar clips cortos con audio a partir de una imagen de producto y un prompt descriptivo, usando 6 pasos por defecto para obtener resultados en unos 6 minutos en Apple M5 Ultra. Adecuado por su capacidad Ref2VA y su audio integrado.
- Creacion de contenido para redes sociales: producir videos verticales (por ejemplo 768x1344) con audio estereo a partir de una imagen de referencia, aprovechando la salida a 24 fps y el muxing con ffmpeg.
- Animacion de personajes o productos: usar `<Picture 1>` para animar un objeto o personaje concreto manteniendo su identidad visual, con control de movimiento mediante el prompt y la semilla.
- Generacion de bandas sonoras y ambientes: especificar `overall_soundscape` en el prompt para obtener audio sincronizado (tono de habitacion, reloj, etc.) junto al video, util para maquetas audiovisuales.
- Previsualizacion de storyboards: convertir imagenes clave en clips animados con audio para validar secuencias antes de produccion final, gracias a la ventana de 141 frames y resoluciones de hasta 1152x864.
- Investigacion en generacion audiovisual local: servir el modelo via mlx-serve en Apple Silicon para experimentar con destilacion a pocos pasos y condicionamiento a dos tiempos sin depender de GPUs NVIDIA.
- Integracion en pipelines de postproduccion: consumir la API `/v1/video/generations` desde scripts para generar variantes con distintas semillas y seleccionar la mejor, con streaming de progreso para monitorizacion.

## Benchmarks y rendimiento

Los datos medidos corresponden a un Apple M5 Ultra con 256 GB y macOS 27 (Darwin 27.0.0), con mlx-serve compilado desde la rama del PR. La concordancia con la referencia se mide como similitud coseno de la direccion del paso en una peticion text-only de 256x256 y 17 frames.

| Pack | Paso | Cos video | Cos audio |
|---|---|---|---|
| 8-bit | primero de 6 | 0,999468 | 0,999913 |
| 8-bit | cuarto de 6 | 0,996744 | 0,997843 |
| 4-bit | primero de 6 | 0,982897 | no disponible (ejecucion detenida en la comprobacion de video) |
| 4-bit | cuarto de 6 | 0,986248 | no disponible (ejecucion detenida en la comprobacion de video) |

Rendimiento y memoria pico en una peticion Ref2VA de 768x1344 y 141 frames con una imagen de referencia (mediana de 3 ejecuciones):

| Peticion | Este pack (8-bit) | Flash 4-bit | MiniMax-H3 stock 4-bit + Turbo LoRA, 8 pasos |
|---|---|---|---|
| REF2VA 768x1344, 141 frames | 361 s, 30,5 GiB, -36 LUFS | 362 s, 30,2 GiB, -40 LUFS | 522 s, 38,7 GiB, -25 LUFS |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible, al no tratarse de un modelo de lenguaje.

## Requisitos de hardware

- VRAM/memoria unificada estimada: aproximadamente 30,5 GiB de pico en el proceso servidor para una peticion Ref2VA de 768x1344 y 141 frames en el pack de 8-bit.
- GPU recomendadas: Apple Silicon con Neural Accelerators y 64 GB o mas de memoria unificada (medido en Apple M5 Ultra con 256 GB). En Macs con Neural Accelerators y 64 GB o mas, mlx-serve convierte ambos packs a los mismos kernels int8 al cargar.
- Cabe en GPU de consumo: si, en equipos Apple Silicon de gama alta con memoria unificada suficiente; no aplica a GPUs NVIDIA/AMD convencionales por el formato MLX.
- Opciones de despliegue: mlx-serve (requiere soporte de HyperFlow H3 Flash, fusionado en `main` via PR #1169 y disponible en la release posterior a v26.11.2; v26.11.2 y anteriores rechazan o fallan al cargar el pack).
- Latencia y throughput: 361 s de tiempo total de peticion (incluye codificacion de texto y decodificacion VAE) para un clip de 768x1344 y 141 frames en Apple M5 Ultra; el pack de 4-bit no es mas rapido (362 s) y ahorra 7 GB de disco con memoria pico similar.
- Nota: clips largos y grandes (alrededor de 1152x864 a 243 frames) en la ruta int8 por defecto requieren el fix de la issue #1194 (ya en `main`); sin el, algunos frames salen lavados. La opcion `--no-w8a8` evita el problema a costa de aproximadamente un 30% mas de tiempo de muestreo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HyperFlow H3 Flash REF2VA MLX-Serve 8-bit (este pack) | no disponible | no disponible | 361 s, 30,5 GiB, cos video 0,999468 (primer paso) | MiniMax H3 Community License | Hugging Face, MLX |
| HyperFlow H3 Flash 4-bit | no disponible | no disponible | 362 s, 30,2 GiB, cos video 0,982897 (primer paso) | MiniMax H3 Community License | Hugging Face, MLX |
| MiniMax-H3 stock 4-bit + Turbo LoRA (8 pasos) | no disponible | no disponible | 522 s, 38,7 GiB, -25 LUFS | MiniMax H3 Community License | Hugging Face |

La comparativa se limita a las variantes del mismo modelo base documentadas en la model card; no se dispone de datos de otros modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- El parametro `steps` debe ser 4, 6 (por defecto) u 8; cualquier otro valor es rechazado porque el schedule fue entrenado para esos conteos.
- No admite LoRA, ni `turbo`, ni guiado por clasificador: el DiT ya esta destilado y un LoRA para el modelo base caeria en bloques incorrectos; mlx-serve rechaza `lora_paths` y `turbo` para este pack.
- Las referencias de audio (`ref_audios` y banda sonora de `ref_videos`) funcionaron en mlx-serve cuando se probaron, aunque el runtime GGUF de Video Rebirth solo lista referencias de imagen; debe tratarse como observado, no garantizado.
- En prompts que piden silencio o una banda sonora muy silenciosa, algunas semillas producen clips casi mudos; stable-diffusion.cpp con el mismo modelo muestra el mismo comportamiento.
- El medio generado puede contener errores; es necesario revisar las salidas antes de su uso.
- Licencia: un producto o servicio comercial que lo use debe mostrar "MiniMax H3" en su interfaz de usuario; las salidas generadas por IA publicadas o compartidas publicamente deben declararse claramente como generadas por maquina; no se puede usar el modelo ni sus salidas para entrenar o mejorar otros modelos.
- Requiere una version de mlx-serve posterior a v26.11.2 (o `main`); versiones anteriores rechazan o fallan al cargar el pack.
- No se dispone de informacion sobre sesgos, idiomas soportados ni riesgos de alucinacion especificos en la informacion proporcionada.

## Enlaces

- Hugging Face: https://huggingface.co/hancheng-ai/HyperFlow-H3-Flash-REF2VA-MLX-Serve-8bit
- Modelo base: https://huggingface.co/VideoRebirthAI/hyperflow-h3-flash
- Licencia: https://huggingface.co/MiniMaxAI/MiniMax-H3/blob/main/LICENSE
- mlx-serve: https://github.com/ddalcu/mlx-serve
- PR de soporte HyperFlow H3 Flash: https://github.com/ddalcu/mlx-serve/pull/1169
- Issue #1194 (frames lavados en clips grandes): https://github.com/ddalcu/mlx-serve/issues/1194
