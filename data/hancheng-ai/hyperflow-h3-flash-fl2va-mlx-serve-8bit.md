# hancheng-ai/HyperFlow-H3-Flash-FL2VA-MLX-Serve-8bit

## Resumen

HyperFlow H3 Flash FL2VA MLX-Serve 8-bit es un paquete de pesos cuantizados para Apple Silicon del modelo de generación de vídeo con audio HyperFlow H3 Flash, desarrollado por Video Rebirth AI como derivado comprimido de MiniMax-H3 FL2VA. Lo publica el usuario hancheng-ai en Hugging Face y está empaquetado específicamente para el servidor de inferencia mlx-serve. El modelo genera vídeo con audio estéreo sincronizado a partir de texto (T2VA) o a partir de primer y/o último fotograma clave (FL2VA), en 4, 6 u 8 pasos de muestreo sin guiado por clasificador ni LoRA.

La relevancia de este paquete es práctica: permite ejecutar un modelo de vídeo-audio de la familia MiniMax-H3 en hardware de Apple (M-series) con un consumo de memoria medido de entre 21,7 y 24,5 GiB para clips de 640x960 píxeles, y con una fidelidad respecto a la referencia en FP que el autor sitúa por encima del umbral de 0,99 de similitud coseno en cada paso medido. El DiT se cuantiza a 8 bits afín con grupo de 64, mientras que el codificador de texto se mantiene en su versión estándar a 4 bits y ambos VAE quedan sin modificar.

El modelo base es un derivado de pocos pasos de MiniMax-H3 FL2VA: se eliminan 3 de sus 50 bloques DiT, se factorizan 102 capas lineales a rango bajo y cada paso se condiciona a dos instantes temporales (dónde está y a dónde llega). El repositorio ocupa 36,4 GB y la licencia es la MiniMax H3 Community License Agreement, con obligaciones de atribución y divulgación de contenido generado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) derivado de MiniMax-H3 FL2VA, con 47 de 50 bloques DiT, 102 lineales factorizadas a rango bajo y condicionamiento temporal dual; VAE de vídeo y VAE de audio |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (generación por fotogramas; clips medidos de 73 y 124 fotogramas a 24 fps) |
| Tipos de cuantizacion | DiT en MLX affine 8-bit (group size 64); codificador de texto MiniMax-H3 estándar a 4-bit; VAE sin cuantizar |
| Idiomas soportados | no disponible |
| Licencia | MiniMax H3 Community License Agreement (license: other) |
| Formato de pesos | MLX (pesos cuantizados para mlx-serve); no se distribuye en safetensors ni GGUF |
| Tamano del repositorio | 36,4 GB |
| Resolucion de salida | 640x960 en las mediciones; soporta al menos 1152x864 |
| Frecuencia de fotogramas | 24 fps |
| Audio de salida | PCM s16le, 32 kHz estéreo |
| Pasos de muestreo | 4, 6 (por defecto) u 8; otros valores se rechazan |

## Arquitectura y entrenamiento

El modelo es un Diffusion Transformer (DiT) que hereda la estructura de MiniMax-H3 FL2VA y la comprime en dos frentes: se descartan 3 de los 50 bloques DiT originales y se factorizan 102 capas lineales a rango bajo, lo que reduce el coste computacional y de almacenamiento. La innovación central es el condicionamiento a dos tiempos: cada paso de muestreo se condiciona simultáneamente al instante temporal actual y al instante de destino, lo que permite una destilación de pocos pasos (4, 6 u 8) sin guiado por clasificador y sin LoRA. El paquete incluye un VAE de vídeo y un VAE de audio, ambos sin modificar respecto al modelo base, y un codificador de texto MiniMax-H3 estándar cuantizado a 4 bits (copia byte a byte con sha256 `00a6817a979848c94a60aa9c0c380b2e6cb7735363aaabfaf1a6678fe4748a7f`).

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO. El autor tampoco detalla el proceso de destilación más allá de la descripción de la arquitectura comprimida y el condicionamiento dual. La cuantización del DiT es MLX affine de 8 bits con tamaño de grupo 64, y en GPUs Apple con aceleradores neuronales y 64 GB o más de memoria, mlx-serve convierte tanto el paquete de 8 bits como el de 4 bits a los mismos kernels int8 al cargar.

## Capacidades

- Generación de vídeo a partir de texto (T2VA) con audio estéreo sincronizado.
- Generación de vídeo y audio condicionada por primer fotograma, último fotograma o ambos (FL2VA), con imágenes en PNG o JPEG codificadas en base64.
- Generación de audio integrada en el mismo paso de difusión, con prompt de paisaje sonoro (`overall_soundscape`) para dirigir la banda sonora.
- Muestreo en 4, 6 u 8 pasos sin guiado por clasificador ni LoRA, gracias a la destilación del DiT.
- Salida de vídeo a 24 fps con fotogramas `rgb8` en base64 y audio PCM s16le a 32 kHz estéreo.
- Soporte de streaming de eventos de progreso mediante `"stream": true`.
- Resoluciones y duraciones configurables por petición (`width`, `height`, `num_frames`, `seed`), con clips medidos de hasta 124 fotogramas y resoluciones de hasta 1152x864.
- No soporta tool calling, function calling, razonamiento multi-paso ni agentes: es un modelo generativo de medios, no un modelo de lenguaje conversacional.
- Capacidades multilingües: no disponibles; el prompt se procesa con el codificador de texto MiniMax-H3, pero no se documentan idiomas soportados.

## Casos de uso

- Prototipado rápido de vídeo publicitario: generar clips de 640x960 con audio en unos 60 segundos para 73 fotogramas en un Apple M5 Ultra, lo que permite iterar sobre variaciones de prompt y semilla sin salir del portátil o del equipo de sobremesa.
- Creación de contenido para redes sociales en formato vertical: la resolución medida de 640x960 y los 24 fps encajan con formatos de historia y reel, y el audio estéreo a 32 kHz evita una fase de sonorización separada.
- Interpolación entre fotogramas clave para animación: usar `first_frame_image` y `last_frame_image` para generar la transición intermedia entre dos ilustraciones, útil en storyboards y previsualización de animación.
- Generación de paisajes sonoros y ambientes para vídeo: el condicionamiento por `overall_soundscape` permite producir clips con audio coherente con la escena, aprovechable en maquetas de vídeojuegos o demos de producto.
- Pruebas de concepto en estudios de animación: el modelo comprimido y destilado reduce el coste por iteración frente a MiniMax-H3 completo con Turbo LoRA (60 s frente a 89 s y 21,7 GiB frente a 28,6 GiB en la medición del autor para 73 fotogramas).
- Investigación en generación de vídeo-audio en hardware de consumo: sirve como banco de pruebas para estudiar la fidelidad de la cuantización 8-bit frente a la referencia, con métricas de similitud coseno publicadas por paso.
- Despliegue local con API compatible con OpenAI: mlx-serve expone `/v1/video/generations`, lo que facilita integrar la generación en pipelines internos sin depender de servicios en la nube.

## Benchmarks y rendimiento

El autor publica dos conjuntos de mediciones. El primero mide la concordancia con la referencia (una pasada del DiT comparada con stable-diffusion.cpp ejecutando el parche de dos tiempos de Video Rebirth sobre las mismas entradas, petición de 256x256 y 17 fotogramas con primer y último fotograma clave; similitud coseno de la dirección del paso, 1,0 = idéntico):

| Paquete | Paso | Coseno vídeo | Coseno audio |
|---|---|---|---|
| 8-bit | primero de 6 | 0,999714 | 0,998619 |
| 8-bit | cuarto de 6 | 0,999410 | 0,999835 |
| 4-bit | primero de 6 | 0,995355 | 0,948048 |
| 4-bit | cuarto de 6 | 0,994099 | 0,993850 |

El segundo mide velocidad y memoria pico en un Apple M5 Ultra con 256 GB y macOS 27, con una petición FL2VA de 640x960 con primer y último fotograma clave por ejecución, mediana de 3 ejecuciones y brazos alternados:

| Petición | Este paquete (8-bit) | Flash 4-bit | MiniMax-H3 stock 4-bit + Turbo LoRA, 8 pasos |
|---|---|---|---|
| FL2VA 640x960, 73 fotogramas | 60 s, 21,7 GiB, -42 LUFS | 59 s, 21,6 GiB, -39 LUFS | 89 s, 28,6 GiB, -31 LUFS |
| FL2VA 640x960, 124 fotogramas | 120 s, 24,5 GiB, -41 LUFS | 120 s, 24,3 GiB, -39 LUFS | 181 s, 31,0 GiB, -27 LUFS |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no aplican a un modelo de generación de vídeo.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 21,7 GiB para clips de 640x960 y 73 fotogramas; 24,5 GiB para 124 fotogramas (mediciones del autor en Apple M5 Ultra con 256 GB).
- Hardware validado: Apple M5 Ultra con 256 GB y macOS 27 (Darwin 27.0.0). El autor indica que en GPUs Apple con aceleradores neuronales y 64 GB o más, mlx-serve convierte ambos paquetes a los mismos kernels int8 al cargar; no se midieron otros Macs.
- No cabe en GPUs consumer de NVIDIA ni en Apple Silicon con menos de 64 GB de memoria unificada según los datos publicados; no hay mediciones por debajo de ese umbral.
- Despliegue: exclusivamente mediante mlx-serve, que requiere compilar desde `main` o una versión posterior a v26.11.2 (el soporte se fusionó en el PR #1169). Las versiones v26.11.2 y anteriores rechazan o fallan al cargar este paquete.
- Para clips largos y grandes (alrededor de 1152x864 y 243 fotogramas) en la ruta int8 por defecto se necesita el arreglo de la issue #1194, también en `main`; sin él algunos fotogramas salen lavados. La opción `--no-w8a8` evita el problema a cambio de aproximadamente un 30 % más de tiempo de muestreo.
- Throughput medido: 60 s de reloj de pared para 73 fotogramas a 640x960 (incluye codificación de texto y decodificación VAE) y 120 s para 124 fotogramas.
- No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI; el formato MLX y la dependencia de mlx-serve lo limitan a ese servidor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / duración | Resolución medida | Memoria pico (73 fotogramas) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| HyperFlow H3 Flash FL2VA MLX 8-bit (este) | no disponible (47 bloques DiT) | 73-124 fotogramas a 24 fps | 640x960 | 21,7 GiB | MiniMax H3 Community License | Hugging Face, formato MLX |
| HyperFlow H3 Flash 4-bit (mismo autor) | no disponible | 73-124 fotogramas a 24 fps | 640x960 | 21,6 GiB | MiniMax H3 Community License | Hugging Face, formato MLX |
| MiniMax-H3 stock 4-bit + Turbo LoRA | no disponible (50 bloques DiT) | 73-124 fotogramas a 24 fps | 640x960 | 28,6 GiB | MiniMax H3 Community License | Requiere stable-diffusion.cpp o similar |
| MiniMax-H3 FL2VA original | no disponible | no disponible | no disponible | no disponible | MiniMax H3 Community License | Hugging Face (MiniMaxAI) |

El paquete de 8 bits es la opción por defecto recomendada por el autor: supera el umbral de 0,99 de concordancia en todos los pasos medidos. El de 4 bits solo se recomienda cuando el espacio en disco es la restricción, ya que no es más rápido en GPUs Apple con aceleradores neuronales y 64 GB o más (ambos se convierten a int8 al cargar), ahorra 7 GB de disco y su concordancia con la referencia baja del umbral en el primer paso de audio (0,948048). Frente a MiniMax-H3 stock con Turbo LoRA, este paquete es aproximadamente un 33 % más rápido y consume unos 7 GiB menos de memoria pico en la petición de 73 fotogramas.

## Limitaciones y advertencias

- El parámetro `steps` debe ser 4, 6 (por defecto) u 8; cualquier otro valor se rechaza porque el schedule se entrenó solo para esos recuentos.
- No admite LoRA, `turbo` ni guiado por clasificador: el DiT ya está destilado y un LoRA para el modelo base aterrizaría en bloques incorrectos. mlx-serve rechaza `lora_paths` y `turbo` para este paquete.
- En prompts que piden silencio o una banda sonora muy silenciosa, algunas semillas producen audio casi mudo; stable-diffusion.cpp con el mismo modelo muestra el mismo comportamiento.
- Los medios generados pueden contener errores; el autor recomienda revisar las salidas antes de usarlas.
- Riesgo de alucinación visual y sonora: no se documentan tasas, pero la naturaleza generativa del modelo implica posibles incoherencias entre prompt, vídeo y audio.
- Sesgos conocidos: no documentados en la información disponible.
- Idiomas soportados: no disponibles; el rendimiento multilingüe del codificador de texto no está medido.
- Restricciones de licencia: un producto o servicio comercial que use el modelo debe mostrar "MiniMax H3" en su interfaz de usuario; las salidas generadas publicadas o compartidas públicamente deben declararse claramente como generadas por máquina; existen restricciones adicionales de uso recogidas en el acuerdo completo, que prevalece sobre el resumen del autor.
- Dependencia estricta de mlx-serve: versiones anteriores a v26.11.2 no cargan el paquete, y los clips largos y grandes necesitan el arreglo de la issue #1194 para evitar fotogramas lavados.
- Solo validado en Apple M5 Ultra con 256 GB; no hay mediciones en otros equipos Apple ni en GPUs NVIDIA.
- El repositorio ocupa 36,4 GB, lo que condiciona el almacenamiento local disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hancheng-ai/HyperFlow-H3-Flash-FL2VA-MLX-Serve-8bit
- Modelo base: https://huggingface.co/VideoRebirthAI/hyperflow-h3-flash
- Repositorio mlx-serve: https://github.com/ddalcu/mlx-serve
- PR de soporte en mlx-serve: https://github.com/ddalcu/mlx-serve/pull/1169
- Issue de fotogramas lavados en clips largos: https://github.com/ddalcu/mlx-serve/issues/1194
- Licencia MiniMax H3 Community License Agreement: https://huggingface.co/MiniMaxAI/MiniMax-H3/blob/main/LICENSE
- Modelo MiniMax-H3: https://huggingface.co/MiniMaxAI/MiniMax-H3
