# hancheng-ai/HyperFlow-H3-Flash-REF2VA-MLX-Serve-4bit

## Resumen

HyperFlow H3 Flash REF2VA MLX-Serve 4-bit es un empaquetado cuantizado a 4 bits del modelo HyperFlow H3 Flash de Video Rebirth, adaptado para ejecucion en Apple Silicon mediante la libreria mlx-serve. Se trata de un derivado comprimido de MiniMax-H3 REF2VA orientado a la generacion de video con audio estereo a partir de referencias visuales (imagenes) o de texto. El modelo base aplica una destilacion de pocos pasos: elimina 1 de los 50 bloques DiT, factoriza 114 capas lineales a rango bajo y condiciona cada paso en dos instantes temporales (donde esta y donde aterriza), lo que permite generar clips en 4, 6 u 8 pasos sin guidance ni LoRA.

La relevancia de este pack reside en que traslada un modelo de generacion de video-audio de gran tamano al ecosistema MLX, permitiendo inferencia local en equipos Apple Silicon con memoria unificada. El paquete ocupa 30,3 GB en disco, incluye el DiT en MLX affine 4-bit (group size 64), el text encoder de MiniMax-H3 tambien a 4 bits y ambos VAE sin modificar. Esta pensado para flujos reference-to-audio-video (Ref2VA) y text-to-audio-video.

El autor advierte explicitamente de que el pack de 8 bits es la opcion recomendada: el de 4 bits no es mas rapido (en GPUs Apple con aceleradores neuronales y 64 GB o mas, mlx-serve convierte ambos packs a los mismos kernels int8 al cargar) y su fidelidad respecto a la referencia cae por debajo del umbral de 0,99. Solo ahorra 7 GB de disco y el pico de memoria es practicamente identico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) derivado de MiniMax-H3 REF2VA, con destilacion de pocos pasos y condicionamiento en dos tiempos |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MLX affine 4-bit (group size 64) para el DiT; text encoder a 4 bits; VAEs sin cuantizar |
| Idiomas soportados | no disponible |
| Licencia | MiniMax H3 Community License Agreement (license: other) |
| Formato de pesos | MLX (libreria mlx); repo de 30,3 GB |
| Modelo base | VideoRebirthAI/hyperflow-h3-flash |
| Pipeline | image-to-video (tambien text-to-video y audio-video) |
| Pasos de muestreo | 4, 6 (por defecto) u 8; otros valores se rechazan |
| Resolucion y duracion | hasta aproximadamente 1152x864 a 243 frames; ejemplo medido de 768x1344 a 141 frames |
| Frecuencia de video | 24 fps (frames rgb8) |
| Audio | PCM s16le, 32 kHz estereo |

## Arquitectura y entrenamiento

El modelo es un Diffusion Transformer (DiT) derivado de MiniMax-H3 REF2VA. La variante Flash aplica compresion estructural: se elimina 1 de los 50 bloques DiT y se factorizan 114 capas lineales a rango bajo, reduciendo el coste computacional. Ademas, cada paso de muestreo esta condicionado en dos tiempos (la posicion actual y la de destino), lo que habilita la generacion en muy pocos pasos (4, 6 u 8) sin classifier-free guidance ni LoRA. El DiT esta ya destilado, de modo que un LoRA disenado para el modelo base aterrizaria en los bloques equivocados.

El pack incluye el text encoder original de MiniMax-H3 en 4 bits (copia byte a byte, sha256 `0323dda5f35a607de923daa779fc53b813b7c882fd82d8525b7415f72853a5c5`) y ambos VAE sin modificar. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se empleo RLHF o DPO. La innovacion tecnica destacable es la destilacion few-step con condicionamiento en dos tiempos y la conversion automatica a kernels int8 al cargar en GPUs Apple con aceleradores neuronales y 64 GB o mas de memoria.

## Capacidades

- Generacion de video con audio estereo sincronizado en 4, 6 u 8 pasos, sin guidance ni LoRA.
- Reference-to-audio-video (Ref2VA): acepta `ref_images` en base64 (PNG o JPEG), referenciadas en el prompt como `<Picture N>`.
- Text-to-audio-video: omitiendo `ref_images` y las etiquetas `<Picture N>`.
- Referencias de video (`ref_videos`) y audio (`ref_audios`) con la misma gramatica de peticion que MiniMax-H3 REF2VA original; las referencias de audio funcionaron en pruebas, aunque el runtime GGUF de Video Rebirth solo documenta imagenes.
- Control de paisaje sonoro mediante el campo `overall_soundscape` en el prompt.
- Salida con frames `rgb8` a 24 fps y audio `pcm_s16le` a 32 kHz estereo, ambos en base64.
- Soporte de streaming de eventos de progreso con `"stream": true`.
- Control de semilla (`seed`) para reproducibilidad.
- No soporta LoRA ni `turbo`: mlx-serve rechaza `lora_paths` y `turbo` para este pack.

## Casos de uso

- Prototipado de video generativo en local sobre Apple Silicon: un estudio puede generar clips de referencia con audio en un Mac con memoria unificada suficiente, sin depender de servicios en la nube, usando mlx-serve como servidor HTTP compatible con peticiones JSON.
- Animacion de personajes a partir de una imagen de referencia: pasando una fotografia o ilustracion como `ref_images` y describiendo el movimiento en el prompt (por ejemplo, "el gato de ceramica gira la cabeza hacia la ventana"), el modelo produce un clip animado con audio ambiente coherente.
- Generacion de paisajes sonoros y audio diegetico: el campo `overall_soundscape` permite especificar el ambiente (tono de sala, reloj, etc.), util para previsualizaciones de video con audio sincronizado sin postproduccion separada.
- Creacion de material para previsualizacion de guiones (animatic): clips cortos de 141 frames a 768x1344 con audio permiten validar encuadres, ritmo y atmosfera antes de producir.
- Generacion de contenido para redes o demos tecnicas: clips verticales (768x1344) con audio listos para publicar tras el muxing con ffmpeg, utiles para equipos de marketing que necesitan iterar rapido con control de semilla.
- Investigacion en modelos de difusion para video: el pack permite comparar la fidelidad de la cuantizacion 4-bit frente a 8-bit midiendo la similitud coseno de la direccion de paso, como hace el autor, sirviendo de banco de pruebas para estudios de cuantizacion en MLX.
- Integracion en pipelines automatizados de generacion de video: al exponerse como endpoint `/v1/video/generations`, puede orquestarse desde scripts o servicios internos que encolen peticiones con `stream: true` para monitorizar el progreso.

## Benchmarks y rendimiento

El autor publica mediciones de acuerdo con la referencia (similitud coseno de la direccion de paso frente a stable-diffusion.cpp con el parche de dos tiempos de Video Rebirth, en una peticion text-only de 256x256 y 17 frames; 1,0 = identico):

| Pack | Paso | Coseno video | Coseno audio |
|---|---|---|---|
| 8-bit | primero de 6 | 0,999468 | 0,999913 |
| 8-bit | cuarto de 6 | 0,996744 | 0,997843 |
| 4-bit | primero de 6 | 0,982897 | no disponible (ejecucion detenida en la comprobacion de video) |
| 4-bit | cuarto de 6 | 0,986248 | no disponible (ejecucion detenida en la comprobacion de video) |

Rendimiento y memoria pico (una peticion Ref2VA de 768x1344 y 141 frames con una imagen de referencia, mediana de 3 ejecuciones, Apple M5 Ultra de 256 GB con macOS 27):

| Peticion | Este pack (4-bit) | Flash 8-bit | MiniMax-H3 stock 4-bit + Turbo LoRA, 8 pasos |
|---|---|---|---|
| REF2VA 768x1344, 141 frames | 362 s, 30,2 GiB, -40 LUFS | 361 s, 30,5 GiB, -36 LUFS | 522 s, 38,7 GiB, -25 LUFS |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, al no tratarse de un modelo de lenguaje.

## Requisitos de hardware

- Memoria: el pico medido en una peticion Ref2VA de 768x1344 y 141 frames es de 30,2 GiB de footprint del proceso servidor, practicamente identico al del pack de 8 bits (30,5 GiB). Se recomienda un equipo con memoria unificada de 64 GB o mas.
- Hardware medido: Apple M5 Ultra con 256 GB. En GPUs Apple con aceleradores neuronales y 64 GB o mas, mlx-serve convierte ambos packs a los mismos kernels int8 al cargar; otras Mac no fueron medidas.
- No cabe en GPUs consumer discretas tipo RTX 4090 en su configuracion completa; el pack esta orientado a memoria unificada de Apple Silicon.
- Despliegue: exclusivamente mediante mlx-serve con soporte para HyperFlow H3 Flash (integrado en `main` via PR #1169; disponible en la release posterior a v26.11.2). Las versiones v26.11.2 y anteriores rechazan o fallan al cargar este pack.
- Comando de arranque: `mlx-serve --model /path/to/HyperFlow-H3-Flash-REF2VA-MLX-Serve-4bit --serve --port 8080`.
- Clips largos y grandes (aproximadamente 1152x864 a 243 frames) en la ruta int8 por defecto requieren el arreglo del issue #1194 (tambien en `main`); sin el, algunos frames salen lavados. La opcion `--no-w8a8` evita el problema a costa de aproximadamente un 30% mas de tiempo de muestreo.
- Latencia medida: 362 s por peticion Ref2VA de 768x1344 y 141 frames (incluye codificacion de texto y decodificacion VAE).
- No se dispone de datos de throughput para otras configuraciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / duracion | Pasos | Memoria pico (medida) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| HyperFlow H3 Flash REF2VA MLX-Serve 4-bit (este pack) | no disponible | hasta ~1152x864 a 243 frames | 4, 6 u 8 | 30,2 GiB | MiniMax H3 Community License | Hugging Face, MLX |
| HyperFlow H3 Flash 8-bit (mismo modelo base) | no disponible | idem | 4, 6 u 8 | 30,5 GiB | MiniMax H3 Community License | Hugging Face, MLX |
| MiniMax-H3 stock 4-bit + Turbo LoRA | no disponible | idem | 8 | 38,7 GiB | MiniMax H3 Community License | Requiere LoRA Turbo |
| MiniMax-H3 REF2VA original | no disponible | idem | mas pasos (no destilado) | no disponible | MiniMax H3 Community License | Hugging Face / runtime GGUF de Video Rebirth |

El pack de 8 bits supera el umbral de acuerdo de 0,99 en todos los pasos medidos, mientras que el de 4 bits se queda en 0,982897 y 0,986248, sin ganancia de velocidad ni de memoria. Frente al MiniMax-H3 stock con Turbo LoRA, el pack destilado es mas rapido (362 s frente a 522 s) y consume menos memoria (30,2 frente a 38,7 GiB).

## Limitaciones y advertencias

- El numero de pasos debe ser exactamente 4, 6 (por defecto) u 8; cualquier otro valor se rechaza porque el schedule fue entrenado para esos conteos.
- No admite LoRA, `turbo` ni classifier-free guidance; mlx-serve rechaza `lora_paths` y `turbo` para este pack.
- La fidelidad del 4-bit respecto a la referencia esta por debajo del umbral de 0,99 (coseno de 0,982897 en el primer paso y 0,986248 en el cuarto); el autor recomienda el pack de 8 bits salvo que el espacio en disco sea la restriccion.
- Las referencias de audio (`ref_audios` y la banda sonora de `ref_videos`) funcionaron en pruebas, pero el runtime GGUF de Video Rebirth solo documenta imagenes; debe tratarse como comportamiento observado, no garantizado.
- En prompts que piden silencio o una banda sonora muy silenciosa, algunas semillas producen audio casi inaudible; stable-diffusion.cpp con el mismo modelo muestra el mismo comportamiento. La sonoridad integrada varia mucho de una semilla a otra (-40 LUFS en la medicion de este pack).
- Los clips largos y grandes en la ruta int8 por defecto pueden mostrar frames lavados sin el arreglo del issue #1194.
- El contenido generado puede contener errores; deben revisarse las salidas antes de su uso.
- Obligaciones de licencia: un producto o servicio comercial que lo use debe mostrar "MiniMax H3" en su interfaz de usuario, y las salidas generadas por IA publicadas o compartidas publicamente deben cumplir las condiciones del acuerdo (la model card queda truncada en este punto; consultese el texto completo de la licencia).
- No se dispone de informacion sobre sesgos, tasas de alucinacion ni cobertura idiomatica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hancheng-ai/HyperFlow-H3-Flash-REF2VA-MLX-Serve-4bit
- Modelo base: https://huggingface.co/VideoRebirthAI/hyperflow-h3-flash
- Licencia MiniMax-H3: https://huggingface.co/MiniMaxAI/MiniMax-H3/blob/main/LICENSE
- Repositorio mlx-serve: https://github.com/ddalcu/mlx-serve
- PR de soporte HyperFlow H3 Flash: https://github.com/ddalcu/mlx-serve/pull/1169
- Issue sobre frames lavados en clips grandes: https://github.com/ddalcu/mlx-serve/issues/1194
