# gearwave00001/MiniMax-H3-dasiwaHybridV4-fp8-rad

## Resumen

MiniMax-H3 DaSiWa Hybrid V4 FP8 es un contenedor de inferencia (`.rad`, formato RAD2) que empaqueta el fine-tune comunitario `dasiwaHybridV4` del modelo MiniMaxAI/MiniMax-H3 junto con todos sus componentes de condicionamiento, listo para ejecutarse en el motor radiance sobre GPU AMD RDNA4 con ROCm. No es un modelo nuevo desde cero: es un reempaquetado en FP8 E4M3 del denoiser ajustado por la comunidad DaSiWa, con el codificador de texto `qwen3vl_32b_h3_ultra_uncensored_heretic` de llmfan46 (un fine-tune de Qwen3-VL-32B) y los VAE de vídeo y audio, todo en un único fichero de 50,07 GiB y 3273 tensores.

El modelo genera vídeo con banda sonora estéreo sincronizada a partir de texto, de una primera imagen, de una última imagen, de un par de keyframes (primer y último fotograma) o de un conjunto de referencias (hasta 9 imágenes, 3 vídeos con su audio y 3 clips de audio independientes). La salida es MP4 H.264 a 24 fps, hasta 1344x768 y entre 5,17 y 14,4 segundos, con audio AAC a 32 kHz estéreo. Incorpora además un upscaler latente de 345 M de parámetros que permite generar los primeros pasos a media resolución y refinar después.

Su relevancia es doble: por un lado, demuestra que el ecosistema de difusión de vídeo ya funciona fuera de CUDA, sobre ROCm y arquitectura RDNA4; por otro, la licencia MiniMax H3 Community License excluye explícitamente la Unión Europea, el Reino Unido, Corea del Sur y Estados Unidos, lo que condiciona por completo su uso desde España. El autor no publica parámetros totales, idiomas soportados ni resultados de benchmarks.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusión con denoiser UNet (fine-tune DaSiWa `dasiwaHybridV4`) y modulación de timestep en forma de curva (tabla 1025x8 y proyecciones ada K=8 por bloque, en bf16); VAE de vídeo (encoder + decoder) y VAE de audio (encoder bf16 / decoder f32); codificador de texto Qwen3-VL-32B con torre de visión completa (incluye deepstack taps); token refiner |
| Parametros totales | no disponible (el contenedor ocupa 50,07 GiB con 3273 tensores; el upscaler latente aporta 345 M) |
| Parametros activos | no disponible (no se declara que sea MoE) |
| Longitud de contexto | prompt de hasta 2048 tokens; ventana de ejecución recomendada `--max-model-len 4096` para peticiones con referencias y keyframes |
| Tipos de cuantizacion | FP8 E4M3 por bloques de 128x128 con escalas bf16 (denoiser, lineales del text encoder, token refiner); bf16 (tabla de modulación y proyecciones ada, torre de visión, VAE de vídeo, encoder de audio, upscaler latente); f32 (decoder del VAE de audio, MLP de embedding del upscaler). El fine-tune original estaba en int8 y se decuantizó para reencodificar en FP8 |
| Idiomas soportados | no disponible |
| Licencia | `minimax-h3-community-license-agreement` (no cubre la Unión Europea, el Reino Unido, Corea del Sur ni Estados Unidos) |
| Formato de pesos | `.rad` (contenedor RAD2, fichero `minimax-h3-dasiwa-fp8.rad`, 50,07 GiB, 3273 tensores); no se publican safetensors ni GGUF en este repositorio |

## Arquitectura y entrenamiento

El pipeline es un sistema de difusión para vídeo y audio conjuntos. El denoiser es el UNet ajustado `DasiwaMinimaxH3_dasiwaHybridV4_int8`, que en este contenedor se ha decuantizado y reencodificado en FP8 E4M3 por bloques de 128x128 con escalas bf16; se preservan en bf16 sin cuantizar la tabla de modulación temporal en forma de curva (1025x8) y las proyecciones ada K=8 por bloque. El condicionamiento textual corre a cargo de un Qwen3-VL-32B fine-tuneado (`qwen3vl_32b_h3_ultra_uncensored_heretic`), con sus 50 capas de lenguaje en FP8 E4M3 y la torre de visión completa en bf16, lo que permite condicionar tanto por texto como por imagen. Completan el grafo un token refiner en FP8, el VAE de vídeo en bf16, el VAE de audio con encoder bf16 y decoder f32, y el upscaler latente de LBH-123-AI (convolución 3D, 345 M de parámetros, bf16 con MLP de embedding en f32, licencia Apache-2.0).

No se detalla en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO; el autor describe el modelo como un fine-tune comunitario del MiniMax-H3 base. Sí se indica que el modelo está destilado con guiado (*guidance-distilled*), por lo que no admite escala de guiado ni prompt negativo durante la inferencia. La innovación técnica destacable del contenedor es la integración de todos los modos de condicionamiento (texto, primer fotograma, último fotograma, par de keyframes y referencias multimodales) en un único fichero servido por una API compatible con el esquema de *video jobs* de OpenAI, más el esquema de upscaling latente en dos fases: los primeros pasos se ejecutan a media resolución, el upscaler amplía el latente limpio y los últimos `upscale_refine_steps` (12 por defecto) se ejecutan a resolución completa desde una copia re-ruidizada.

## Capacidades

- Generación de vídeo texto-a-vídeo-con-audio (T2VA) a partir de un prompt, con banda sonora estéreo sincronizada.
- Imagen-a-vídeo-con-audio (I2VA): animación de una primera imagen (`first_frame`).
- Último fotograma como condición (L2VA): el modelo construye la secuencia que termina en una imagen dada.
- Completado entre dos keyframes (FL2VA): los extremos quedan fijados y el movimiento intermedio lo genera el modelo.
- Referencias multimodales (REF2VA): hasta 9 imágenes, hasta 3 vídeos con su pista de audio asociada (`ref_video_audio_N`) y hasta 3 clips de audio independientes.
- Salida de vídeo MP4 H.264 a 24 fps, hasta 1344x768 píxeles de área, con duración de 5,17 a 14,4 s en pasos de 17 fotogramas; audio AAC a 32 kHz estéreo.
- Seguimiento de descripciones largas y estructuradas (hasta 2048 tokens), incluyendo encuadre, paisaje sonoro y música.
- Upscaling latente con factor 2 (hasta 4) y refinado posterior configurable.
- Reproducibilidad mediante `seed` en un mismo despliegue.
- Servicio mediante API HTTP compatible con el esquema de trabajos de vídeo de OpenAI (`POST /v1/videos`, `GET /v1/videos/{id}`, `GET /v1/videos/{id}/content`, listado y borrado), con entrada multipart para las partes condicionantes.
- No se declaran capacidades de tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo generativo de vídeo, no un LLM de propósito general.

## Casos de uso

- Publicidad y contenido de marca para redes: generación de clips de 5 a 14 s a 1344x768 con audio ya sincronizado, evitando la fase de montaje y sonorización; el modelo admite descripciones largas y estructuradas del plano y su paisaje sonoro, lo que encaja con un briefing detallado.
- Animación de storyboards y arte conceptual: usando `first_frame` se anima un fotograma clave dibujado o renderizado, útil para presentar movimiento a dirección antes de producir la pieza final.
- Completado de planos en VFX y motion graphics: con `first_frame` + `last_frame` se generan las transiciones entre dos extremos fijados, lo que sirve para rellenar planos de continuidad o transiciones entre dos diseños aprobados.
- Consistencia de personaje o producto en serie: con REF2VA se aportan hasta 9 imágenes de referencia del mismo sujeto y 3 clips de vídeo, de modo que varias generaciones mantienen la identidad visual del personaje o del envase.
- Sonorización y doblaje de referencia: con `ref_audio_1..3` y `ref_video_audio_N` se condiciona la generación a un timbre o a una pista musical concreta, útil para adaptar una pieza a un estilo sonoro de marca ya existente.
- Previsualización rápida y refinado en dos pasadas: con `"latent_upscale": 2` el primer tramo se calcula a 672x384 para 1344x768, lo que abarata la exploración de variantes antes de gastar cómputo en el refinado a resolución completa.
- Integración en herramientas existentes: al hablar el esquema de trabajos de vídeo de OpenAI, un equipo puede apuntar su cliente ya escrito (`POST /v1/videos` con JSON, sondeo de estado, descarga de contenido) al servidor radiance sin reescribir la capa de integración.
- Procesado on-premise en estaciones AMD: al ejecutarse sobre ROCm/RDNA4 con dos tarjetas de 32 GB, permite mantener material sensible dentro de la infraestructura propia, sin depender de APIs en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor solo referencia clips de la comunidad DaSiWa renderizados con este mismo par de modelos, sin métricas cuantitativas de calidad, FVD, CLIP-score ni comparaciones numéricas.

## Requisitos de hardware

- VRAM: el contenedor pesa 50,07 GiB; el autor exige explícitamente dos tarjetas de 32 GB y ejecución con tensor paralelo (`--tp 2`). No se publican estimaciones de VRAM para cuantizaciones menores porque no se distribuyen otros formatos.
- GPU: AMD RDNA4 con ROCm. No se documenta soporte CUDA ni se nombran modelos concretos de tarjeta; el requisito declarado es "dos tarjetas de 32 GB".
- Memoria de sistema: se requiere memoria de host fijada (*pinned*) para el codificador de texto y la torre de visión, seleccionable con `--vision-tower-placement ram`; sin ella el despliegue no es viable tal como está descrito.
- Consumer GPU: con los requisitos publicados, no cabe en una tarjeta de consumo de 24 GB. No se acredita funcionamiento en configuraciones de una sola GPU.
- Despliegue: exclusivamente el motor radiance, con una build que incluya modulación en forma de curva y condicionamiento por referencias (posterior a cualquier release upstream). No se mencionan vLLM, llama.cpp, Ollama, TGI ni Diffusers como soportados.
- Ejemplo de arranque: `radiance --model minimax-h3-dasiwa-fp8.rad --tp 2 --vision-tower-placement ram --max-model-len 4096 --host 0.0.0.0 --port 8000`.
- Latencia y throughput: no disponibles. Como referencia de configuración, los clips DaSiWa se renderizaron con el sampler `res_multistep`, 25 pasos y shift 12 para vídeo / 3 para audio; el contador `num_inference_steps` de esta implementación cuenta puntos de la rejilla sigma como Diffusers, por lo que 25 pasos de referencia equivalen a 26 aquí.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Resolucion / duracion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniMax-H3 DaSiWa Hybrid V4 FP8 (este) | no disponible (contenedor de 50,07 GiB) | prompt 2048 tokens, ventana 4096 | hasta 1344x768, 5,17-14,4 s, audio estéreo | MiniMax H3 Community (excluye UE, RU, Corea del Sur y EE. UU.) | repo `.rad` para radiance, 0 descargas |
| MiniMaxAI/MiniMax-H3 (base) | no disponible | no disponible | no disponible | MiniMax H3 Community | modelo original del que deriva el fine-tune |
| DaSiWa `dasiwaHybridV4` int8 (origen del denoiser) | no disponible | no disponible | no disponible | no disponible | no disponible en la información proporcionada |
| Contenedor FP8 estándar de MiniMax-H3 | no disponible | no disponible | no disponible | MiniMax H3 Community | citado por el autor como distinto de este fichero |

No se dispone de datos de otros modelos comparables de la misma categoría (generación de vídeo con audio sincronizado) en la información proporcionada, por lo que no se puede establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- Restricción de licencia crítica: la MiniMax H3 Community License no cubre la Unión Europea, el Reino Unido, Corea del Sur ni Estados Unidos. España está dentro de la UE, de modo que el uso quedaría fuera del ámbito declarado por el autor; hay que revisar el fichero `LICENSE` antes de cualquier uso, incluido el de investigación.
- El codificador de texto es un fine-tune "uncensored/heretic" de Qwen3-VL-32B: cabe esperar una menor resistencia a generar contenido sensible o NSFW, con el riesgo reputacional y legal que eso conlleva en producción.
- Riesgo de alucinación visual y artefactos: no hay métricas publicadas de fidelidad, y el propio autor advierte que un factor de upscaling 4 a 1344x768 parte de 352x192 y produce fotogramas "borrosos y fantasmales".
- Restricciones de composición: los keyframes y el material de referencia son mutuamente excluyentes; una petición o completa entre dos fotogramas fijados o condiciona por referencias, nunca ambas cosas.
- Control de generación reducido: al estar destilado con guiado, no admite escala de guiado ni prompt negativo, lo que limita las técnicas habituales de refinado.
- Límites duros de salida: 1344x768 de área máxima, múltiplos de 32, duración máxima de 14,4 s en pasos de 17 fotogramas.
- Dependencia de una build concreta de radiance: las versiones upstream no incorporan modulación en forma de curva ni condicionamiento por referencias, así que el fichero no arranca en releases estándar.
- Compatibilidad de hardware muy acotada: solo AMD RDNA4 con ROCm y dos tarjetas de 32 GB; no hay soporte CUDA documentado ni formatos alternativos de pesos.
- Idiomas soportados no declarados, por lo que no se puede garantizar el comportamiento con prompts en castellano más allá de lo que permita el codificador Qwen3-VL-32B.
- Validación comunitaria nula en el momento de la ficha: 0 descargas y 0 likes, repositorio de 53,8 GB actualizado el mismo día de su creación. No hay evidencia independiente de calidad ni de estabilidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/gearwave00001/MiniMax-H3-dasiwaHybridV4-fp8-rad
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Upscaler latente: https://huggingface.co/LBH-123-AI/Minimax_h3_latent_Upscaler
- Motor de inferencia radiance: https://codeberg.org/StillDeadcode/radiance
- Licencia del repositorio: https://huggingface.co/gearwave00001/MiniMax-H3-dasiwaHybridV4-fp8-rad/blob/main/LICENSE
- Codificador de texto (`qwen3vl_32b_h3_ultra_uncensored_heretic`, de llmfan46): no se proporciona enlace directo en la información disponible
- Paper, blog o demo oficial: no disponibles en la información proporcionada
