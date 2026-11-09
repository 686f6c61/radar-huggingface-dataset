# AI-KSK/ksk-video-216-comfyui-workflows

## Resumen

AI-KSK/ksk-video-216-comfyui-workflows es un repositorio de flujos de trabajo (workflows) para ComfyUI, no un modelo de pesos entrenado. Lo publica AI-KSK, un laboratorio independiente dedicado a probar modelos de imagen y video y a convertirlos en flujos reproducibles. El repositorio documenta un tutorial en video sobre cómo reparar el control de video IC-LoRA de LTX 2.3 añadiendo una segunda pasada de upscaling video-a-video.

El contenido se centra en dos grafos de ComfyUI: uno de control de video con enriquecimiento en alta definición (80 nodos) y otro de muestreo en bucle con ampliación (45 nodos). Ambos se apoyan en el modelo LTX 2.3 de 22B en variantes dev (fp8 escalada) y destilada, junto con LoRAs de destilación, detailer y razonamiento, además de un doble codificador CLIP basado en Gemma 3 12B.

Es relevante para quien ya trabaja con LTX 2.3 en ComfyUI y necesita una receta práctica para corregir artefactos de control y ampliar resolución sin disparar el coste de VRAM. No aporta pesos nuevos ni un modelo propio: es material de referencia operativo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica (repositorio de workflows de ComfyUI); los grafos usan LTX 2.3 (UNET transformer de 22B) |
| Parametros totales | No disponible (el modelo subyacente referenciado es LTX 2.3 de 22B) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | fp8 escalada (`ltx-2.3-22b-dev_transformer_only_fp8_scaled`), bf16 en VAE y proyeccion de texto, fp8 e4m3fn en el codificador Gemma 3 12B |
| Idiomas soportados | en |
| Licencia | other |
| Formato de pesos | No aplica al repo (tamano 0.0 GB); los grafos referencian checkpoints y LoRAs de LTX 2.3 en formato nativo de ComfyUI |

## Arquitectura y entrenamiento

El repositorio no contiene un modelo entrenado ni pesos: aloja un README con notas de tutorial y la descripcion de dos grafos exportados en JSON para ComfyUI. El primer grafo ("LTX 2.3 视频控制高清增强") tiene 80 nodos y combina el UNET `ltx-2.3-22b-dev_transformer_only_fp8_scaled` con la LoRA de destilacion 384 a escala 0.7 y la LoRA Reasoning_V1 a escala 1.0; genera a 960x544 con 121 frames, audio a 97 tokens y 25 fps, sampler `euler_cfg_pp` con CFG 1.3 y un upscaler a 1.1.

El segundo grafo ("LTX 2.3 循环采样放大优化") tiene 45 nodos y usa el checkpoint `ltx-2.3-22b-distilled` con las LoRAs `ltx-2-19b-distilled-lora-384` y `ltx-2-19b-ic-lora-detailer` a escala 1.0, sampler `euler` con CFG 1 y cadenas de sigma 0.909375 / 0.725 / 0.421875 / 0. Ambos comparten un doble CLIP formado por `gemma_3_12B_it_fp8_e4m3fn` y `ltx-2.3_text_projection_bf16` (ltxv), y el VAE `LTX23_video_vae_bf16`. No se documentan datos de entrenamiento, tokens ni procesos de RLHF/DPO porque no se entrena ningun modelo en este repositorio.

## Capacidades

- Control de video con preprocesadores de profundidad (depth), Canny y pose; el autor recomienda SD Pose por mayor precision a cambio de mas VRAM.
- Generacion de video texto-a-video y video-a-video mediante LTX 2.3 en ComfyUI.
- Ampliacion (upscaling) por pasadas encadenadas con troceado en chunks de 56 frames y 24 frames de solapamiento.
- Muestreo en bucle con cadenas de sigma personalizadas para refinar el resultado.
- Integracion de LoRAs de destilacion, detailer y razonamiento sobre el modelo base.
- Salida con audio sincronizado (97 tokens a 25 fps) y resolucion 960x544 en el grafo de control.
- No incluye tool calling, function calling, agentes ni capacidades multimodales de texto mas alla del pipeline de video.

## Casos de uso

- Reparacion de control IC-LoRA en LTX 2.3: aplicar el segundo pase video-a-video descrito para corregir artefactos de control que aparecen en la primera generacion, manteniendo la estructura de pose, depth o Canny.
- Produccion de video con control de pose: usar el preprocesador SD Pose para animar personajes a partir de video de referencia, aceptando el mayor coste de VRAM a cambio de deteccion mas precisa.
- Ampliacion de clips generados: encadenar el grafo de loop-sampling con chunks de 56 frames y 24 de solapamiento para subir resolucion sin que el consumo de memoria se dispare.
- Prototipado de pipelines de video en ComfyUI: importar los JSON de los grafos como plantilla reproducible para experimentar con el modelo destilado de 22B.
- Generacion de video con audio: emplear la configuracion de 97 tokens de audio a 25 fps para clips con banda sonora sincronizada en formato 960x544.
- Docencia y divulgacion tecnica: usar las notas y el video del tutorial (YouTube y Bilibili) como material de referencia para explicar tecnicas de control y upscaling en video generativo.
- Evaluacion comparativa de variantes: contrastar el modelo dev fp8 con el destilado usando los dos grafos como banco de pruebas controlado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma numerica; el autor advierte que SD Pose incrementa el coste de VRAM frente a otros preprocesadores.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; el uso de un UNET de 22B en fp8 y de Gemma 3 12B como codificador de texto sugiere requisitos elevados, pero no se aportan cifras.
- Opciones de despliegue: ComfyUI (unico entorno documentado en el repositorio).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Aspecto | AI-KSK/ksk-video-216-comfyui-workflows | Flujos ComfyUI para Hunyuan / Mochi / Wan | Repositorios de pesos de modelos de video |
|---|---|---|---|
| Tipo | Workflows y notas de tutorial | Workflows de terceros | Pesos y model cards |
| Parametros | No aplica (usa LTX 2.3 de 22B) | Depende del modelo base | Variable |
| Contexto | No disponible | No disponible | No disponible |
| Rendimiento | Sin benchmarks publicados | Sin datos en la informacion disponible | Sin datos en la informacion disponible |
| Licencia | other | Variable | Variable |
| Disponibilidad | Hugging Face, 0 descargas y 0 likes | Descargas en webs de terceros | Hugging Face |

## Limitaciones y advertencias

- El repositorio tiene 0.0 GB y solo contiene un README: no incluye los JSON de los grafos ni pesos, pese a que el texto los menciona.
- Los artefactos de rejilla (grid artefacts) persisten al hacer zoom alto, segun el propio autor.
- Solo se recomienda una pasada de mejora; una tercera pasada degrada el resultado.
- Es necesario recortar el numero de frames antes de decodificar, porque el latente ronda los 200 frames y no coincide con los 121 solicitados.
- El autor prefiere el modelo destilado de 22B frente al Dev para este pipeline.
- Se trata de un postprocesado, no de un sustituto del modelo de control.
- Licencia "other": no se detallan condiciones de uso comercial; hay que consultar al autor antes de usarlo en produccion.
- Idioma documentado: solo ingles.
- Sin descargas ni likes: no hay evidencia de validacion por parte de la comunidad.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/AI-KSK/ksk-video-216-comfyui-workflows
- Web del autor (ingles): https://aiksk.cc/en/
- Web del autor (chino): https://aiksk.cc/
- Post en RunningHub 1: https://www.runninghub.ai/post/2040812593555709953/?inviteCode=rh-v1111
- Post en RunningHub 2: https://www.runninghub.ai/post/2041055276513628161/?inviteCode=rh-v1111
- Video en YouTube: https://www.youtube.com/watch?v=wh-UA7B0q3c
- Video en Bilibili: https://www.bilibili.com/video/BV1gaSfBgEqz
- Recopilacion de workflows de video en ComfyUI: https://learn.thinkdiffusion.com/top-10-comfyui-workflows-for-ai-text-to-video-and-video-to-video-2025/
