# hancheng-ai/HyperFlow-H3-Flash-FL2VA-MLX-Serve-4bit

## Resumen

HyperFlow H3 Flash FL2VA MLX-Serve 4-bit es un paquete de pesos cuantizados para Apple Silicon derivado de HyperFlow H3 Flash, un modelo de generacion de video con audio estereo desarrollado por Video Rebirth a partir de MiniMax-H3 FL2VA. Lo publica el usuario hancheng-ai y esta empaquetado especificamente para mlx-serve, el servidor de inferencia MLX. El modelo resuelve la generacion conjunta de video y audio (text-to-audio-video, T2VA) y la generacion condicionada por primer y ultimo fotograma (FL2VA) en hardware Apple, sin necesidad de GPU NVIDIA.

Tecnicamente es un derivado comprimido y destilado de MiniMax-H3: elimina 3 de los 50 bloques del DiT, factoriza 102 capas lineales a rango bajo y condiciona cada paso de muestreo en dos instantes temporales (donde esta y donde aterriza). Esto permite generar video con audio en solo 4, 6 u 8 pasos sin classifier-free guidance ni LoRA. El paquete concreto que nos ocupa aplica cuantizacion afine de 4 bits (group size 64) al DiT, mientras que el codificador de texto y ambos VAE se mantienen sin modificar.

Es relevante porque demuestra que la generacion de video con audio de alta calidad puede ejecutarse en un Mac con Apple Silicon (M5 Ultra, 256 GB) en torno a 59 segundos para un clip de 73 fotogramas a 640x960, con un pico de memoria de 21,6 GiB. No obstante, el propio autor advierte que el paquete de 8 bits es la opcion recomendada y que este de 4 bits solo tiene sentido si el espacio en disco es la restriccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) derivado de MiniMax-H3 FL2VA, con 47 de 50 bloques, 102 lineales factorizadas a rango bajo y condicionamiento en dos tiempos |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit afine (group size 64) para el DiT; codificador de texto MiniMax-H3 a 4 bits; VAE sin cuantizar |
| Idiomas soportados | no disponible |
| Licencia | MiniMax H3 Community License Agreement (license: other) |
| Formato de pesos | MLX (pesos cuantizados para mlx-serve; tamano del repo 29,5 GB) |

## Arquitectura y entrenamiento

El modelo base HyperFlow H3 Flash es una destilacion de pocos pasos de MiniMax-H3 FL2VA. La innovacion principal reside en la compresion del DiT: se eliminan 3 de los 50 bloques originales y se factorizan 102 capas lineales a rango bajo, lo que reduce el coste computacional manteniendo la calidad. Ademas, cada paso de muestreo se condiciona en dos marcas temporales (el instante actual y el destino), lo que permite generar en 4, 6 u 8 pasos sin necesidad de classifier-free guidance ni de LoRA de aceleracion. Esta destilacion es la que hace viable la inferencia en hardware de consumo.

El paquete de 4 bits aplica cuantizacion afine MLX (group size 64) exclusivamente al DiT. El codificador de texto es una copia byte a byte del de MiniMax-H3 en 4 bits (sha256 `00a6817a979848c94a60aa9c0c380b2e6cb7735363aaabfaf1a6678fe4748a7f`), y ambos VAE permanecen sin modificar. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO en la informacion proporcionada.

## Capacidades

- Generacion de video con audio estereo integrado (T2VA: text-to-audio-video).
- Generacion condicionada por primer fotograma, ultimo fotograma o ambos (FL2VA), aceptando imagenes en base64 PNG o JPEG.
- Generacion en 4, 6 u 8 pasos de muestreo; cualquier otro numero de pasos es rechazado por el servidor.
- Salida de video a 24 fps en formato `rgb8` y audio `pcm_s16le` a 32 kHz estereo, ambos en base64.
- Soporte de streaming de eventos de progreso mediante `"stream": true`.
- Control de resolucion y numero de fotogramas por peticion (por ejemplo, 640x960 con 73 o 124 fotogramas; hasta 1152x864 con 243 fotogramas).
- No soporta tool calling, function calling ni razonamiento multi-paso; es un modelo generativo de medios, no un LLM de proposito general.
- No soporta LoRA ni `turbo`; mlx-serve rechaza `lora_paths` y `turbo` para este paquete.
- Capacidades multilingues: no disponible.

## Casos de uso

- Generacion de clips publicitarios con audio: el modelo produce video y banda sonora estereo en una sola pasada, lo que permite crear anuncios cortos de 640x960 con sonido ambiente o musical descrito en el prompt, sin postproduccion de audio separada.
- Creacion de contenido para redes sociales verticales: la resolucion 640x960 y el formato de 24 fps encajan con publicaciones de formato vertical; un clip de 73 fotogramas se genera en unos 59 segundos en un M5 Ultra, lo que agiliza la iteracion creativa.
- Interpolacion de keyframes en animacion: la modalidad FL2VA permite aportar el primer y el ultimo fotograma de una escena y generar la transicion intermedia con audio coherente, util para storyboards animados o prevision de secuencias.
- Prototipado de escenas para cine y videojuegos: con soporte de hasta 1152x864 y 243 fotogramas, se pueden previsualizar planos largos con sonido antes de comprometer recursos de produccion.
- Generacion de sonido ambiente sincronizado: el prompt admite descripciones como `overall_soundscape: steady rain, water trickling`, lo que permite generar paisajes sonoros acoplados a la imagen para simulaciones, entornos virtuales o material de archivo.
- Demostraciones y pruebas de concepto en macOS: al ejecutarse sobre MLX en Apple Silicon, permite a equipos sin GPUs NVIDIA experimentar con generacion de video-audio localmente, con un pico de memoria de 21,6 GiB para 73 fotogramas.
- Automatizacion de pipelines de contenido mediante API HTTP: el endpoint `/v1/video/generations` de mlx-serve devuelve frames y audio en base64, lo que facilita su integracion en flujos automatizados de muxado con ffmpeg y publicacion.

## Benchmarks y rendimiento

El autor publica mediciones de acuerdo con la referencia y de velocidad y memoria en un Apple M5 Ultra con 256 GB y macOS 27. El acuerdo se mide como similitud coseno de la direccion de un paso del DiT frente a stable-diffusion.cpp ejecutando el parche de dos tiempos de Video Rebirth, sobre una peticion de 256x256 con 17 fotogramas y primer y ultimo keyframe (1,0 = identico).

| Pack | Paso | Coseno video | Coseno audio |
|---|---|---|---|
| 8-bit | primero de 6 | 0,999714 | 0,998619 |
| 8-bit | cuarto de 6 | 0,999410 | 0,999835 |
| 4-bit | primero de 6 | 0,995355 | 0,948048 |
| 4-bit | cuarto de 6 | 0,994099 | 0,993850 |

| Peticion | Este paquete (4-bit) | Flash 8-bit | MiniMax-H3 stock 4-bit + Turbo LoRA, 8 pasos |
|---|---|---|---|
| FL2VA 640x960, 73 fotogramas | 59 s, 21,6 GiB, -39 LUFS | 60 s, 21,7 GiB, -42 LUFS | 89 s, 28,6 GiB, -31 LUFS |
| FL2VA 640x960, 124 fotogramas | 120 s, 24,3 GiB, -39 LUFS | 120 s, 24,5 GiB, -41 LUFS | 181 s, 31,0 GiB, -27 LUFS |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible, ya que no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM/pico de memoria medido: 21,6 GiB para un clip de 640x960 y 73 fotogramas; 24,3 GiB para 124 fotogramas.
- Hardware de referencia: Apple M5 Ultra con 256 GB de memoria unificada y macOS 27 (Darwin 27.0.0).
- En Apple GPUs con aceleradores neuronales y 64 GB o mas, mlx-serve convierte ambos paquetes (4 y 8 bits) a los mismos kernels int8 al cargar; en otros Macs no se han medido.
- No cabe en GPUs de consumo NVIDIA en el sentido habitual: el paquete es MLX y esta pensado para memoria unificada de Apple Silicon; no se dispone de datos para CUDA.
- Despliegue: exclusivamente mediante mlx-serve, con soporte para HyperFlow H3 Flash fusionado en `main` via PR #1169; las versiones v26.11.2 y anteriores rechazan o fallan al cargar el paquete.
- Para clips largos y grandes (alrededor de 1152x864 y 243 fotogramas) en la ruta int8 por defecto se requiere el arreglo de la issue #1194; sin el, algunos fotogramas salen lavados. La opcion `--no-w8a8` evita el problema a cambio de un 30 % mas de tiempo de muestreo.
- Latencia y throughput: 59 s para 73 fotogramas y 120 s para 124 fotogramas a 640x960 (mediana de 3 ejecuciones, tiempo total de la peticion incluyendo codificacion de texto y decodificacion VAE).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Resolucion/fotogramas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HyperFlow H3 Flash FL2VA MLX-Serve 4-bit (este) | no disponible | no disponible | hasta 1152x864, 243 fotogramas | MiniMax H3 Community License | MLX, Apple Silicon |
| HyperFlow H3 Flash 8-bit (mismo modelo base) | no disponible | no disponible | hasta 1152x864, 243 fotogramas | MiniMax H3 Community License | MLX, Apple Silicon; recomendado por el autor |
| MiniMax-H3 stock 4-bit + Turbo LoRA | no disponible | no disponible | no disponible | MiniMax H3 Community License | 8 pasos, 89 s y 28,6 GiB para 73 fotogramas |

La comparativa se limita a variantes del mismo modelo base y al modelo original, ya que no se dispone de datos de otros modelos de video-audio comparables en la informacion proporcionada.

## Limitaciones y advertencias

- El paquete de 4 bits no es mas rapido que el de 8 bits y se aleja mas de la referencia: el coseno de audio cae a 0,948048 en el primer paso, por debajo del umbral de 0,99 que el autor considera aceptable. Solo ahorra 7 GB de disco (36,4 frente a 29,6 GB) y el pico de memoria es practicamente identico.
- El numero de pasos debe ser 4, 6 (por defecto) u 8; cualquier otro valor es rechazado porque el schedule fue entrenado solo para esos conteos.
- No admite LoRA, `turbo` ni classifier-free guidance; mlx-serve rechaza `lora_paths` y `turbo` para este paquete.
- En prompts que piden silencio o una banda sonora muy silenciosa, algunas semillas producen audio casi inaudible; stable-diffusion.cpp con el mismo modelo muestra el mismo comportamiento.
- Los clips largos y grandes en la ruta int8 por defecto pueden presentar fotogramas lavados sin el arreglo de la issue #1194.
- El medio generado puede contener errores; el autor recomienda revisar las salidas antes de usarlas.
- Obligaciones de licencia: un producto o servicio comercial que lo use debe mostrar "MiniMax H3" en su interfaz de usuario; las salidas generadas por IA publicadas o compartidas tienen obligaciones adicionales segun el acuerdo, cuyo resumen no sustituye al texto completo.
- Riesgo de sesgos y alucinacion: no disponible en la informacion proporcionada.
- Limitaciones de idioma: no disponible.

## Enlaces

- Hugging Face: https://huggingface.co/hancheng-ai/HyperFlow-H3-Flash-FL2VA-MLX-Serve-4bit
- Modelo base: https://huggingface.co/VideoRebirthAI/hyperflow-h3-flash
- Licencia MiniMax H3: https://huggingface.co/MiniMaxAI/MiniMax-H3/blob/main/LICENSE
- mlx-serve: https://github.com/ddalcu/mlx-serve
- PR de soporte HyperFlow H3 Flash en mlx-serve: https://github.com/ddalcu/mlx-serve/pull/1169
- Issue sobre fotogramas lavados en clips largos: https://github.com/ddalcu/mlx-serve/issues/1194
