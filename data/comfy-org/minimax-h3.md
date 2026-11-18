# Comfy-Org/MiniMax-H3

## Resumen

MiniMax-H3 es un modelo generativo de vídeo (y audio) de la familia MiniMax, distribuido en este repositorio por Comfy-Org como un repackaging de un solo fichero (`diffusion-single-file`) listo para su uso en ComfyUI. El repositorio original pertenece a MiniMaxAI (`MiniMaxAI/MiniMax-H3`), y esta versión de Comfy-Org incluye los pesos del modelo de difusión en varias cuantizaciones, el text encoder Qwen3-VL-32B adaptado, VAEs de vídeo y audio, LoRAs de destilación (Turbo) y ControlNet, además de embeddings predefinidos para efectos visuales.

El modelo resuelve tareas de generación de vídeo condicionada por texto, imagen y referencias: text-to-video (T2V), image-to-video (I2V), reference-to-video (R2V) y variantes con audio (los sufijos `fl2va` y `ref2va` sugieren "first-last to video+audio" y "reference to video+audio"). Es relevante porque integra generación conjunta de vídeo y audio en un único pipeline y porque su empaquetado para ComfyUI, con cuantizaciones int8/fp8/nvfp4 y LoRAs de pocos pasos, lo hace desplegable en hardware de consumo.

La arquitectura subyacente es un modelo de difusión (no un LLM), con un text encoder basado en Qwen3-VL-32B-Instruct y VAEs separados para vídeo y audio. El repositorio ocupa 545,1 GB en total, aunque cada fichero individual es sustancialmente menor y puede descargarse por separado según la variante y cuantización elegidas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | modelo de difusión para generación de vídeo (y audio); text encoder Qwen3-VL-32B-Instruct; VAE de vídeo y VAE de audio separados |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el text encoder Qwen3-VL-32B tiene su propio contexto, no especificado en la información disponible) |
| Tipos de cuantizacion | bf16, int8_convrot, fp8_scaled, w6a8 (pruned), nvfp4_awq (text encoder) |
| Idiomas soportados | no disponible |
| Licencia | minimax-h3-community-license-agreement (`license: other`) |
| Formato de pesos | safetensors (single-file para ComfyUI) |

## Arquitectura y entrenamiento

MiniMax-H3 es un modelo de difusión orientado a la generación de vídeo, con variantes que incorporan audio de forma nativa (los ficheros `fl2va` y `ref2va`, frente a las variantes sin audio). El pipeline se compone de un text encoder Qwen3-VL-32B-Instruct (adaptado y cuantizado en este repo), un modelo de difusión principal y dos VAEs independientes: uno de vídeo (`minimax_h3_video_vae_int8_convrot`) y otro de audio (`minimax_h3_audio_vae_fp32`). Esta separación de VAEs confirma que el audio se decodifica como una modalidad distinta dentro del mismo proceso generativo.

El repositorio incluye variantes "pruned" del modelo de difusión, lo que indica que existe una versión reducida de parámetros con fines de eficiencia, y LoRAs de destilación Turbo (`minimax_h3_fl2v_turbo_4step_v1.0_768p`, `minimax_h3_fl2v_turbo_8step_v1.0`, `minimax_h3_ref2v_turbo_4step_v0.1`) que permiten generar en 4 u 8 pasos en lugar del muestreo completo, así como LoRAs "Pika H3 Flex" para las variantes con audio. También se distribuye un ControlNet Union (de alibaba-pai) para control estructural adicional. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF/DPO; estos datos no están disponibles en la información proporcionada.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video, workflow `video_minimax_h3_t2v`).
- Generación de vídeo a partir de una imagen inicial (image-to-video, workflow `video_minimax_h3_i2v`).
- Generación de vídeo a partir de imágenes de referencia (reference-to-video, workflow `video_minimax_h3_r2v`).
- Generación conjunta de vídeo y audio en las variantes `fl2va` (first-last to video+audio) y `ref2va` (reference to video+audio).
- Generación acelerada mediante LoRAs Turbo de 4 y 8 pasos, incluida una variante específica a 768p.
- Control estructural adicional mediante ControlNet Union (`minimax_h3_fun_controlnet_union`).
- Efectos visuales predefinidos mediante embeddings invocables en el prompt (`embedding:minimaxh3_art_is_explosion`, `minimaxh3_bullet_time`, `minimaxh3_fire_breath`, `minimaxh3_four_seasons`, `minimaxh3_kiss_camera`, `minimaxh3_spiral_ascent`, `minimaxh3_storm_magic`, `minimaxh3_truman_show`, `minimaxh3_blooming_flowers`, `minimaxh3_dark_magic`).
- Comprensión multimodal de la referencia visual a través del text encoder Qwen3-VL-32B, que aporta capacidad de visión para interpretar las imágenes de entrada.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso: no es un modelo de lenguaje agéntico, sino un modelo generativo de vídeo.

## Casos de uso

- Producción de vídeo publicitario a partir de texto: el pipeline T2V permite generar clips directamente desde un prompt descriptivo, y las LoRAs Turbo de 4 pasos reducen el coste de iteración en fases de exploración creativa.
- Animación de imágenes fijas para redes sociales: el flujo I2V toma una fotografía o ilustración como primer fotograma y genera movimiento coherente, útil para contenido de marketing con material gráfico existente.
- Generación de vídeo con personaje consistente: el flujo R2V, alimentado con imágenes de referencia, mantiene la identidad visual del sujeto entre planos, aplicable a series cortas o avatares.
- Vídeo con audio sincronizado: las variantes `fl2va` y `ref2va` generan imagen y sonido en un único paso, lo que sirve para prototipos de cortinillas, doblaje visual o contenido para formato vertical con banda sonora.
- Efectos visuales cinematográficos: los embeddings incluidos (bullet time, fire breath, storm magic, truman show, entre otros) permiten aplicar transiciones y efectos complejos sin construir el prompt desde cero, útiles en previsualización de VFX.
- Control de movimiento y composición: el ControlNet Union añade condicionamiento estructural sobre la generación, lo que facilita adaptar el resultado a un guion gráfico o a un layout predefinido en producción de animación.
- Previsualización de storyboards en estudios de animación: combinando I2V con ControlNet se pueden generar animáticas rápidas a partir de bocetos antes de comprometer recursos de render final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. El repositorio completo ocupa 545,1 GB, pero cada fichero se descarga por separado; las variantes `pruned` y las cuantizaciones `int8_convrot`, `fp8_scaled` y `w6a8` reducen sustancialmente el peso frente a `bf16`.
- El text encoder Qwen3-VL-32B en `nvfp4_awq` está diseñado para no requerir GPU Blackwell, según la model card, lo que amplía su compatibilidad.
- Recomendación del autor: usar `int8_convrot` para los modelos de difusión si se dispone de PyTorch con CUDA 13.0; recurrir a `fp8_scaled` solo si no es posible usar `int8_convrot`.
- GPU recomendadas: no disponible en la información proporcionada. No se especifican modelos concretos (A100, H100, RTX 4090, etc.).
- Despliegue: el modelo está empaquetado específicamente para ComfyUI (`diffusion-single-file`), con workflows oficiales para T2V, I2V, R2V y Pika H3 Flex R2V. No se documentan opciones para vLLM, llama.cpp, Ollama o TGI, que no aplican a un modelo de difusión de este tipo.
- Latencia y throughput: no disponibles. Las LoRAs Turbo de 4 y 8 pasos implican una reducción del número de pasos de muestreo respecto al pipeline completo, pero no se aportan cifras de tiempo por clip.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni especificaciones de modelos alternativos de generación de vídeo con los que establecer una comparación rigurosa.

## Limitaciones y advertencias

- La licencia es la `minimax-h3-community-license-agreement` (etiquetada como `other`), no una licencia open source estándar; es necesario revisar sus términos antes de cualquier uso comercial.
- No se dispone de información sobre sesgos del modelo, composición del dataset de entrenamiento ni evaluación de seguridad.
- Riesgo de alucinación visual: como todo modelo generativo de difusión, puede producir contenido incoherente, artefactos o anatomías incorrectas, especialmente en clips largos o prompts ambiguos.
- No se documentan los idiomas soportados por el text encoder en el contexto de este pipeline, por lo que el comportamiento multilingüe de los prompts no está garantizado.
- El tamaño del repositorio (545,1 GB) exige planificar el almacenamiento y descargar solo los ficheros necesarios; no es viable clonar el repo completo en la mayoría de entornos.
- Las variantes `pruned` sacrifican capacidad del modelo a cambio de eficiencia; los resultados pueden diferir de las versiones completas.
- El uso de `fp8_scaled` en lugar de `int8_convrot` se presenta como una solución de menor preferencia por parte del autor, lo que puede implicar compromisos de calidad o compatibilidad.
- La información sobre requisitos de hardware y rendimiento es insuficiente para garantizar un despliegue en producción sin pruebas previas.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Comfy-Org/MiniMax-H3
- Modelo original: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Licencia: https://huggingface.co/MiniMaxAI/MiniMax-H3/blob/main/LICENSE
- Variante Turbo: https://huggingface.co/lightx2v/Minimax-h3-Turbo
- ControlNet Union: https://huggingface.co/alibaba-pai/MiniMax-H3-Fun-Controlnet-Union
- Versión experimental: https://huggingface.co/Kijai/MiniMax-H3-experimental
- Text encoder cuantizado de origen: https://huggingface.co/cybermotaz/Qwen3-VL-32B-Instruct-NVFP4
- ComfyUI: https://github.com/Comfy-Org/ComfyUI
- Workflow T2V: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/video_minimax_h3_t2v.json
- Workflow I2V: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/video_minimax_h3_i2v.json
- Workflow R2V: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/video_minimax_h3_r2v.json
- Workflow Pika H3 Flex R2V: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/video_pika_h3_flex_ref2va.json
