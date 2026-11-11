# hancheng-ai/HyperFlow-H3-Flash-REF2VA-MLX-Serve-4bit

## Resumen

HyperFlow H3 Flash REF2VA MLX-Serve 4-bit es una cuantización en formato MLX affine de 4 bits del modelo HyperFlow H3 Flash de Video Rebirth, un derivado comprimido de MiniMax-H3 REF2VA orientado a la generación conjunta de vídeo y audio estéreo. El pack está empaquetado específicamente para Apple Silicon mediante la herramienta mlx-serve, y su función principal es la generación de vídeo con audio a partir de una o varias imágenes de referencia (Ref2VA) o de texto puro (text-to-audio-video). El modelo base es un DiT (Diffusion Transformer) destilado para funcionar en pocos pasos: 4, 6 u 8, sin classifier-free guidance ni LoRA.

La relevancia de este pack es doble. Por un lado, ofrece un pipeline de generación audiovisual multimodal ejecutable en hardware de consumo de Apple (M-series), algo poco habitual en modelos de vídeo de esta escala. Por otro lado, su autor lo posiciona explícitamente como una alternativa solo para cuando el espacio en disco es la restricción: el pack de 8 bits es la opción recomendada por su mayor fidelidad al modelo de referencia, y el de 4 bits ahorra únicamente 7 GB de disco (30,3 frente a 37,3 GB) sin ganar velocidad ni reducir el pico de memoria.

El repositorio tiene 30,3 GB, licencia MiniMax H3 Community License Agreement, y requiere una versión de mlx-serve con soporte específico para HyperFlow H3 Flash (PR #1169). No se dispone de información sobre idiomas soportados ni de resultados de benchmarks estándar (MMLU, HumanEval, etc.), ya que se trata de un modelo generativo de vídeo y audio, no de un LLM.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) derivado de MiniMax-H3 REF2VA, con 50 bloques DiT (1 eliminado respecto al base), 114 capas lineales factorizadas a bajo rango y condicionamiento en dos tiempos |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | MLX affine 4-bit (group size 64) para el DiT; text encoder MiniMax-H3 en 4-bit; ambos VAE sin modificar |
| Idiomas soportados | no disponible |
| Licencia | MiniMax H3 Community License Agreement (license: other) |
| Formato de pesos | MLX (repo de 30,3 GB), empaquetado para mlx-serve |
| Resolución de vídeo | hasta 768x1344 (ejemplo de la model card), 24 fps |
| Audio | PCM s16le, 32 kHz estéreo |
| Pasos de inferencia | 4, 6 (por defecto) u 8; otros valores se rechazan |
| Modelo base | VideoRebirthAI/hyperflow-h3-flash |

## Arquitectura y entrenamiento

El modelo es un Diffusion Transformer (DiT) que hereda la arquitectura de MiniMax-H3 REF2VA y la comprime en tres frentes: eliminación de 1 de sus 50 bloques DiT, factorización de 114 capas lineales a bajo rango, y condicionamiento en cada paso sobre dos tiempos (dónde está y a dónde llega). Esta última innovación es la que permite la generación en pocos pasos (4, 6 u 8) sin classifier-free guidance ni LoRA, ya que el DiT está ya destilado. El text encoder es el de MiniMax-H3 original en 4-bit, copiado byte a byte (sha256 `0323dda5f35a607de923daa779fc53b813b7c882fd82d8525b7415f72853a5c5`), y ambos VAE se mantienen sin modificar.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO. La model card tampoco detalla la innovación de decodificación especulativa ni mecanismos de atención lineal. El pack MLX convierte ambos packs (4-bit y 8-bit) a los mismos kernels int8 al cargar en GPUs Apple con aceleradores neuronales y 64 GB o más de memoria, según indica el autor.

## Capacidades

- Generación de vídeo con audio estéreo sincronizado en una sola pasada, a 24 fps y resoluciones como 768x1344.
- Reference-to-audio-video (Ref2VA): acepta imágenes de referencia (`ref_images` en base64 PNG/JPEG) nombradas en el prompt como `<Picture N>`.
- Text-to-audio-video: genera vídeo y audio a partir únicamente de texto, sin imagen de referencia.
- Soporte de referencias de vídeo (`ref_videos`) y audio (`ref_audios`) con la misma gramática de petición que MiniMax-H3 REF2VA; el autor lo describe como observado, no garantizado.
- Generación en 4, 6 u 8 pasos sin guidance ni LoRA, gracias a la destilación del DiT.
- Control de semilla (`seed`) para reproducibilidad.
- Streaming de eventos de progreso mediante `"stream": true` en la petición.
- No se documentan capacidades de tool calling, function calling, agentes ni razonamiento multi-paso, al no ser un modelo de lenguaje.

## Casos de uso

- Previsualización de vídeo publicitario: generar clips cortos de 141 fotogramas a 768x1344 con audio integrado a partir de una imagen de producto, usando `ref_images` y un prompt descriptivo, para validar conceptos antes de una producción completa.
- Creación de contenido para redes sociales en Mac: ejecutar el pack en un Apple M5 Ultra con 256 GB y generar vídeos verticales con banda sonora en menos de 6 minutos por clip (362 s medidos), sin depender de servicios en la nube.
- Doblaje y sonorización automatizada: aprovechar el audio estéreo a 32 kHz y las referencias de audio (`ref_audios`) para generar escenas con una banda sonora o ambiente concreto descrito en el prompt (`overall_soundscape`).
- Prototipado de animaciones para videojuegos: usar una ilustración de personaje como `<Picture 1>` y generar animaciones breves con audio ambiente para maquetas de escenas.
- Generación de material para presentaciones técnicas: crear clips explicativos con audio a partir de diagramas o capturas aportadas como imagen de referencia.
- Investigación en generación audiovisual multimodal: servir el modelo con mlx-serve en un endpoint compatible con `/v1/video/generations` para experimentar con distintos seeds, pasos (4, 6, 8) y resoluciones, comparando la fidelidad del pack de 4 bits frente al de 8 bits.
- Automatización de pipelines de contenido: integrar el endpoint HTTP en un flujo que reciba una imagen y un prompt, genere el clip, y mezcle las tramas `rgb8` y el audio `pcm_s16le` con ffmpeg para su publicación.

## Benchmarks y rendimiento

La model card no incluye benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) por tratarse de un modelo generativo de vídeo y audio. Sí incluye métricas de acuerdo con la referencia y de velocidad y memoria medidas en un Apple M5 Ultra con 256 GB y macOS 27 (Darwin 27.0.0), con mlx-serve compilado desde la rama del PR #1169.

Acuerdo con la referencia (similitud coseno de la dirección del paso frente a stable-diffusion.cpp con el parche de dos tiempos de Video Rebirth; 1.0 = idéntico; petición de 256x256, 17 fotogramas, solo texto):

| Pack | Paso | Cos vídeo | Cos audio |
|---|---|---|---|
| 8-bit | primero de 6 | 0.999468 | 0.999913 |
| 8-bit | cuarto de 6 | 0.996744 | 0.997843 |
| 4-bit | primero de 6 | 0.982897 | n/a (ejecución detenida en la comprobación de vídeo) |
| 4-bit | cuarto de 6 | 0.986248 | n/a (ejecución detenida en la comprobación de vídeo) |

Velocidad y memoria pico (petición Ref2VA de 768x1344 y 141 fotogramas con una imagen de referencia; mediana de 3 ejecuciones por modelo, alternadas en una misma sesión con la GPU dedicada; el tiempo de pared incluye codificación de texto y decodificación VAE; la sonoridad es la mediana de loudness integrado EBU R128):

| Petición | Este pack (4-bit) | Flash 8-bit | MiniMax-H3 stock 4-bit + Turbo LoRA, 8 pasos |
|---|---|---|---|
| REF2VA 768x1344, 141 fotogramas | 362 s, 30.2 GiB, -40 LUFS | 361 s, 30.5 GiB, -36 LUFS | 522 s, 38.7 GiB, -25 LUFS |

## Requisitos de hardware

- VRAM/memoria unificada estimada: alrededor de 30 GiB de pico de proceso del servidor para una petición Ref2VA de 768x1344 y 141 fotogramas (30.2 GiB medidos con este pack; 30.5 GiB con el de 8-bit).
- Hardware de referencia medido: Apple M5 Ultra con 256 GB de memoria unificada.
- El autor indica que, en GPUs Apple con aceleradores neuronales y 64 GB o más de memoria, mlx-serve convierte ambos packs a los mismos kernels int8 al cargar; no se midieron otros Macs.
- No cabe en GPUs de consumo tipo RTX 4090 (24 GB) según el pico de memoria medido, aunque no se aportan datos de despliegue en CUDA.
- Despliegue: exclusivamente mediante mlx-serve con soporte para HyperFlow H3 Flash (PR #1169); las builds publicadas sin ese soporte rechazan el pack o fallan al cargarlo.
- Endpoint HTTP compatible con `/v1/video/generations`; opción de streaming de progreso con `"stream": true`.
- Latencia medida: 362 s por clip de 768x1344 y 141 fotogramas (mediana de 3 ejecuciones), incluyendo codificación de texto y decodificación VAE.
- No se dispone de datos de throughput agregado ni de latencia para otras resoluciones o número de fotogramas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HyperFlow H3 Flash REF2VA MLX-Serve 4-bit (este pack) | no disponible | no disponible | 362 s, 30.2 GiB, cos vídeo 0.982897 (paso 1) | MiniMax H3 Community License | Hugging Face, MLX |
| HyperFlow H3 Flash MLX-Serve 8-bit | no disponible | no disponible | 361 s, 30.5 GiB, cos vídeo 0.999468 (paso 1) | MiniMax H3 Community License | Hugging Face, MLX |
| MiniMax-H3 stock 4-bit + Turbo LoRA (8 pasos) | no disponible | no disponible | 522 s, 38.7 GiB, -25 LUFS | MiniMax H3 Community License | Hugging Face |
| MiniMax-H3 REF2VA (modelo base de referencia) | no disponible | no disponible | no disponible | MiniMax H3 Community License | Hugging Face |

## Limitaciones y advertencias

- El número de pasos debe ser exactamente 4, 6 (por defecto) u 8; cualquier otro valor se rechaza.
- No admite LoRA, ni `turbo`, ni classifier-free guidance: mlx-serve rechaza `lora_paths` y `turbo` para este pack, y un LoRA del modelo base aterrizaría en bloques incorrectos.
- El acuerdo con la referencia es inferior al umbral de 0.99 que el autor considera aceptable: cos vídeo 0.982897 en el primer paso y 0.986248 en el cuarto. El pack de 8 bits es la opción recomendada.
- No es más rápido que el pack de 8 bits y el pico de memoria es similar; solo ahorra 7 GB de disco.
- En prompts que piden silencio o una banda sonora muy silenciosa, algunas semillas producen audio casi mudo; el mismo comportamiento aparece en stable-diffusion.cpp con el mismo modelo.
- Las referencias de audio (`ref_audios`, banda sonora de `ref_videos`) funcionaron en mlx-serve según el autor, pero se describen como observadas, no garantizadas; el runtime GGUF de Video Rebirth solo lista referencias de imagen.
- El contenido generado puede contener errores; se recomienda revisar las salidas antes de su uso.
- Obligaciones de licencia: un producto o servicio comercial que lo use debe mostrar "MiniMax H3" en su interfaz; las salidas publicadas o compartidas públicamente deben declararse claramente como generadas por máquina; no se permite usar el modelo ni sus salidas para entrenar o mejorar otro modelo de IA.
- El acuerdo no cubre el uso en la Unión Europea, el Reino Unido, la República de Corea ni los Estados Unidos de América sin autorización de MiniMax.
- Si los productos y servicios comerciales superan los 20 millones de dólares anuales, se requiere autorización previa por escrito de MiniMax.
- No se dispone de información sobre sesgos, idiomas soportados ni riesgos de alucinación específicos más allá de la advertencia general sobre errores en el contenido generado.

## Enlaces

- Hugging Face: https://huggingface.co/hancheng-ai/HyperFlow-H3-Flash-REF2VA-MLX-Serve-4bit
- Modelo base: https://huggingface.co/VideoRebirthAI/hyperflow-h3-flash
- mlx-serve (repositorio): https://github.com/ddalcu/mlx-serve
- mlx-serve PR #1169 (soporte HyperFlow H3 Flash): https://github.com/ddalcu/mlx-serve/pull/1169
- Licencia MiniMax H3 Community License Agreement: https://huggingface.co/MiniMaxAI/MiniMax-H3/blob/main/LICENSE
