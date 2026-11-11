# hancheng-ai/HyperFlow-H3-Flash-FL2VA-MLX-Serve-8bit

## Resumen

HyperFlow H3 Flash FL2VA MLX-Serve 8-bit es una conversión cuantizada del modelo de generación de vídeo HyperFlow H3 Flash de Video Rebirth, empaquetada específicamente para Apple Silicon mediante la librería MLX y el servidor mlx-serve. HyperFlow H3 Flash es a su vez un derivado comprimido y destilado de MiniMax-H3 FL2VA: elimina 3 de los 50 bloques DiT, factoriza 102 capas lineales a rango bajo y condiciona cada paso de muestreo en dos instantes temporales, lo que permite generar vídeo con audio estéreo en tan solo 4, 6 u 8 pasos sin guiado por clasificador ni LoRA.

El modelo resuelve la generación conjunta de vídeo y audio (text-to-audio-video, T2VA) y la generación condicionada por primer y último fotograma (FL2VA), manteniendo una fidelidad numérica muy alta respecto a la referencia: coseno de similitud de 0,9997 en vídeo y 0,9986 en audio en el primer paso de un muestreo de 6. El pack ocupa 36,4 GB y está pensado para ejecutarse en Macs de gama alta con memoria unificada abundante.

Es relevante porque demuestra que es viable ejecutar un modelo de difusión de vídeo con audio en hardware de consumo profesional de Apple, con tiempos de 60 segundos para 73 fotogramas a 640x960 y un pico de memoria de 21,7 GiB, sin necesidad de GPUs de datacenter. La licencia, no obstante, impone restricciones geográficas y comerciales severas que condicionan su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) derivado de MiniMax-H3, con 47 de los 50 bloques originales, 102 lineales factorizadas a rango bajo y condicionamiento en dos tiempos por paso |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (condicionado por prompt de texto y fotogramas clave) |
| Tipos de cuantizacion | MLX affine 8-bit (group size 64) para el DiT; text encoder a 4-bit; VAEs sin modificar |
| Idiomas soportados | no disponible |
| Licencia | minimax-h3-community-license-agreement |
| Formato de pesos | MLX (pesos cuantizados para mlx-serve) |

## Arquitectura y entrenamiento

El modelo es un Diffusion Transformer (DiT) que hereda la estructura de MiniMax-H3 FL2VA pero con una poda del 6 % de sus bloques (47 de 50) y una factorización de rango bajo aplicada a 102 capas lineales, lo que reduce el coste computacional manteniendo el comportamiento del modelo original. La innovación clave es el condicionamiento en dos tiempos por paso de muestreo: cada paso de difusión se condiciona simultáneamente en el instante actual y en el instante objetivo, lo que permite reducir el número de pasos a 4, 6 u 8 sin guiado por clasificador ni LoRA de destilación. El modelo ha sido destilado para funcionar en pocos pasos y genera audio estéreo a 32 kHz junto con el vídeo a 24 fps.

Los detalles sobre el número de tokens de entrenamiento, la composición del dataset y las técnicas de alineación (RLHF/DPO) no están disponibles en la información proporcionada. El pack en sí es una cuantización: el DiT se convierte a MLX affine 8-bit con tamaño de grupo 64, el text encoder se mantiene en el MiniMax-H3 original a 4-bit (copia byte a byte con sha256 `00a6817a979848c94a60aa9c0c380b2e6cb7735363aaabfaf1a6678fe4748a7f`) y ambos VAEs se conservan sin modificar. Esta cuantización preserva una similitud coseno de 0,9997 en vídeo y 0,9986 en audio en el primer paso respecto a la referencia en stable-diffusion.cpp.

## Capacidades

- Generación de vídeo a partir de texto con audio estéreo sincronizado (T2VA), a resoluciones configurables como 640x960 y 24 fps.
- Generación de vídeo condicionada por primer fotograma, último fotograma o ambos (FL2VA), con imágenes de entrada en PNG o JPEG codificadas en base64.
- Generación de audio integrada en el mismo proceso de difusión, con paisaje sonoro descrito en el prompt mediante la etiqueta `overall_soundscape`.
- Control del número de pasos de muestreo: 4, 6 (por defecto) u 8, los únicos valores para los que el schedule fue entrenado.
- Control de semilla para reproducibilidad (`seed`).
- Soporte de streaming de eventos de progreso mediante `"stream": true`.
- Salida en formato `rgb8` para fotogramas y `pcm_s16le` para audio, lista para muxar con ffmpeg.
- No soporta LoRA, ni modo `turbo`, ni guiado por clasificador: el servidor rechaza `lora_paths` y `turbo` para este pack.

## Casos de uso

- Generación de clips publicitarios cortos con audio: el modelo produce vídeo de 640x960 con audio estéreo en 60 segundos para 73 fotogramas, adecuado para prototipos rápidos de anuncios en redes sociales verticales.
- Previsualización de storyboards animados: a partir de un primer y un último fotograma dibujados, el modelo interpola la secuencia completa con audio, útil en preproducción audiovisual para validar transiciones antes de rodar.
- Creación de contenido para redes sociales en formato vertical: la resolución 640x960 y los 24 fps encajan con formatos de vídeo corto, y el audio integrado evita un paso separado de sonorización.
- Generación de vídeo educativo con narración ambiental: el prompt permite describir el paisaje sonoro (`overall_soundscape`), lo que facilita clips explicativos con ambiente sonoro coherente.
- Prototipado de efectos visuales en pipelines de postproducción: la capacidad FL2VA permite generar transiciones entre dos fotogramas clave concretos, integrable en un flujo de trabajo con ffmpeg para el muxado final.
- Investigación en modelos de difusión de vídeo en Apple Silicon: el pack sirve como banco de pruebas reproducible para estudiar cuantización MLX, destilación a pocos pasos y condicionamiento en dos tiempos, con métricas de similitud coseno publicadas.
- Demos interactivas en local para Macs de gama alta: con 21,7 GiB de pico de memoria para 73 fotogramas, un Mac Studio o MacBook Pro con 64 GB o más puede servir una demo sin conexión a servicios en la nube.

## Benchmarks y rendimiento

Los datos publicados por el autor miden la concordancia con la referencia (una pasada del DiT comparada con stable-diffusion.cpp ejecutando el parche de dos tiempos de Video Rebirth sobre las mismas entradas, petición de 256x256 y 17 fotogramas con primer y último fotograma; similitud coseno de la dirección del paso, 1,0 = idéntico):

| Pack | Paso | Coseno vídeo | Coseno audio |
|---|---|---|---|
| 8-bit | primero de 6 | 0,999714 | 0,998619 |
| 8-bit | cuarto de 6 | 0,999410 | 0,999835 |
| 4-bit | primero de 6 | 0,995355 | 0,948048 |
| 4-bit | cuarto de 6 | 0,994099 | 0,993850 |

Rendimiento y memoria pico en Apple M5 Ultra, 256 GB, macOS 27, con mlx-serve compilado desde la rama del PR. Tiempo de pared de la petición completa, codificación de texto y decodificación VAE incluidas; mediana de 3 ejecuciones:

| Petición | Este pack (8-bit) | Flash 4-bit | MiniMax-H3 stock 4-bit + Turbo LoRA, 8 pasos |
|---|---|---|---|
| FL2VA 640x960, 73 fotogramas | 60 s, 21,7 GiB, -42 LUFS | 59 s, 21,6 GiB, -39 LUFS | 89 s, 28,6 GiB, -31 LUFS |
| FL2VA 640x960, 124 fotogramas | 120 s, 24,5 GiB, -41 LUFS | 120 s, 24,3 GiB, -39 LUFS | 181 s, 31,0 GiB, -27 LUFS |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, dado que se trata de un modelo generativo de vídeo y audio y no de un modelo de lenguaje.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 21,7 GiB de pico para 73 fotogramas a 640x960; 24,5 GiB para 124 fotogramas. Se recomienda un mínimo de 32 GB de memoria unificada, y 64 GB o más para trabajar con comodidad.
- GPU recomendadas: Apple Silicon de gama alta. Las mediciones publicadas se hicieron en un Apple M5 Ultra con 256 GB. En Apple GPUs con aceleradores neuronales y 64 GB o más, mlx-serve convierte ambos packs (8-bit y 4-bit) a los mismos kernels int8 al cargar; otras Macs no fueron medidas.
- Cabe en GPU de consumo: sí, en Macs con memoria unificada suficiente (Mac Studio, MacBook Pro de gama alta). No está pensado para GPUs NVIDIA de consumo.
- Opciones de despliegue: exclusivamente mlx-serve con soporte para HyperFlow H3 Flash (PR #1169). Las builds publicadas de mlx-serve sin ese PR rechazan o fallan al cargar el pack. No es compatible con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 60 s para 73 fotogramas y 120 s para 124 fotogramas a 640x960 en M5 Ultra, con el proceso completo incluido. El pack 4-bit no es más rápido en las máquinas medidas; solo ahorra 7 GB de disco.
- Almacenamiento: el repositorio ocupa 36,4 GB.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento (73 fotogramas, 640x960) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HyperFlow H3 Flash FL2VA MLX 8-bit (este pack) | no disponible | no disponible | 60 s, 21,7 GiB | MiniMax H3 Community License | Hugging Face, requiere mlx-serve PR #1169 |
| HyperFlow H3 Flash 4-bit | no disponible | no disponible | 59 s, 21,6 GiB | MiniMax H3 Community License | Hugging Face (VideoRebirthAI) |
| MiniMax-H3 stock 4-bit + Turbo LoRA, 8 pasos | no disponible | no disponible | 89 s, 28,6 GiB | MiniMax H3 Community License | Hugging Face (MiniMaxAI) |

La comparativa se limita a las variantes del mismo modelo base porque la información proporcionada no incluye datos de otros modelos de generación de vídeo con audio comparables. El pack 8-bit iguala en velocidad al 4-bit, supera el umbral de 0,99 de concordancia con la referencia en todos los pasos medidos y consume menos memoria que la variante stock con Turbo LoRA.

## Limitaciones y advertencias

- El parámetro `steps` debe ser 4, 6 (por defecto) u 8; cualquier otro valor es rechazado por el servidor.
- No admite LoRA, ni `turbo`, ni guiado por clasificador: el DiT ya está destilado y un LoRA para el modelo base aterrizaría en bloques incorrectos.
- En prompts que piden silencio o una banda sonora muy silenciosa, algunas semillas producen audio casi inaudible; stable-diffusion.cpp con el mismo modelo muestra el mismo comportamiento.
- El contenido generado puede contener errores; es necesario revisar las salidas antes de usarlas.
- La licencia MiniMax H3 Community License Agreement impone obligaciones: un producto o servicio comercial que lo use debe mostrar "MiniMax H3" en la interfaz de usuario; las salidas publicadas deben declararse claramente como generadas por máquina; no se puede usar el modelo ni sus salidas para entrenar o mejorar otro modelo de IA.
- El acuerdo no cubre el uso en la Unión Europea, el Reino Unido, la República de Corea ni los Estados Unidos de América sin autorización de MiniMax. Esto bloquea el uso en producción en España sin permiso expreso.
- Si los productos y servicios comerciales superan los 20 millones de dólares anuales, se requiere autorización previa por escrito de MiniMax.
- Se aplica la Política de Uso Aceptable (Anexo A del acuerdo) a todo uso.
- No hay información sobre sesgos, idiomas soportados ni comportamiento multilingüe del modelo.
- El despliegue depende de una build no publicada de mlx-serve (PR #1169), lo que añade riesgo de mantenimiento y reproducibilidad.
- El pack 4-bit no cumple el umbral de 0,99 de concordancia en el primer paso (audio 0,948), por lo que no se recomienda cuando la fidelidad sea crítica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hancheng-ai/HyperFlow-H3-Flash-FL2VA-MLX-Serve-8bit
- Modelo base HyperFlow H3 Flash: https://huggingface.co/VideoRebirthAI/hyperflow-h3-flash
- MiniMax-H3 en Hugging Face: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Licencia MiniMax H3 Community License Agreement: https://huggingface.co/MiniMaxAI/MiniMax-H3/blob/main/LICENSE
- mlx-serve: https://github.com/ddalcu/mlx-serve
- PR de mlx-serve con soporte para HyperFlow H3 Flash: https://github.com/ddalcu/mlx-serve/pull/1169
