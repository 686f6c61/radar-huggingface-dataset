# Enzo275/MiniH3Omni

## Resumen

Mini H3 Omni es un modelo multimodal compacto de aproximadamente 8,7 mil millones de parámetros desarrollado por Enzo Luis Dev (usuario Enzo275 en HuggingFace) que unifica generación de texto, imagen, vídeo y audio en una única arquitectura. El modelo combina un backbone autoregresivo basado en Qwen2.5-VL-3B con un transformer de difusión OmniGen2 para síntesis visual, un VAE de 16 canales, un transformer temporal para coherencia de vídeo de hasta 30 segundos a 30 fps y un puente de sincronización audio-vídeo compatible con MusicGen. Publicado bajo licencia Apache 2.0, el modelo se distribuye como un único archivo safetensors de 16,41 GB en precisión float16 y está pensado para tareas de generación y edición multimodal, incluyendo text-to-image, image-to-video, generación de audio y function calling.

La relevancia de Mini H3 Omni radica en su tamaño contenido para las capacidades que ofrece: con menos de 9 mil millones de parámetros cubre cuatro modalidades, algo que hasta ahora solo se veía en modelos propietarios como Gemini Omni Flash (también de ~8B). Al estar basado en OmniGen2 (paper arXiv:2506.18871), hereda las capacidades de generación in-context y edición iterativa de imágenes, y añade un módulo temporal que permite generar vídeos coherentes de 30 segundos a 1024x1024 píxeles. El modelo está disponible en el ecosistema diffusers, lo que facilita su integración en pipelines existentes de PyTorch.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: Qwen2.5-VL-3B (autoregresivo) + OmniGen2 DiT (difusión) + VAE 16 canales + Temporal Transformer + Audio-Video Sync Bridge |
| Parametros totales | 8.726.047.995 (~8,7B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el módulo temporal soporta hasta 900 frames de vídeo) |
| Tipos de cuantizacion | float16 (no se documentan otras cuantizaciones) |
| Idiomas soportados | Inglés, portugués, chino, japonés, coreano |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (archivo unificado mini_h3_omni_unified.safetensors) |

## Arquitectura y entrenamiento

Mini H3 Omni es un modelo compuesto por cinco módulos diferenciados. El backbone autoregresivo es Qwen2.5-VL-3B (3,75B parámetros, 36 capas, 32 cabezas, d_model=2048) que incorpora un codificador ViT para comprensión visual y sirve como "cerebro" que coordina las demás modalidades. La generación de imagen y vídeo la realiza un transformer de difusión OmniGen2 (3,97B parámetros, 40 capas, d_model=2520, 21 cabezas), que opera sobre un espacio latente de 16 canales producido por un VAE autoencoder (83,8M parámetros). Para vídeo, un transformer temporal de 12 capas (917M parámetros) procesa hasta 900 frames, garantizando coherencia temporal a 30 fps. Finalmente, un puente de sincronización audio-vídeo (3,3M parámetros) genera audio compatible con MusicGen a 32 kHz.

No se ha publicado información detallada sobre el dataset de entrenamiento, el número de tokens procesados ni el uso de técnicas como RLHF o DPO. El modelo se basa directamente en OmniGen2 (Comfy-Org/Omnigen2_ComfyUI_repackaged), cuyo paper (arXiv:2506.18871) describe el entrenamiento del transformer de difusión subyacente, pero la configuración específica de Mini H3 Omni (incluyendo el entrenamiento de los módulos temporal y de audio) no está documentada en la model card.

## Capacidades

- Generación de imágenes a partir de texto (text-to-image) y edición de imágenes existentes mediante instrucciones en lenguaje natural.
- Generación de vídeo de hasta 30 segundos a 30 fps (900 frames) con resolución 1024x1024, partiendo de texto o de una imagen inicial (image-to-video).
- Edición iterativa de vídeo: el modelo puede modificar vídeos ya generados mediante comandos conversacionales.
- Generación de audio sincronizado con el vídeo (audio-video sync), compatible con el formato de MusicGen a 32 kHz.
- Comprensión multimodal: el backbone Qwen2.5-VL-3B permite entender imágenes y responder preguntas sobre su contenido.
- Function calling: soporte para invocar herramientas externas, lo que habilita flujos agénticos.
- Salida estructurada (JSON, etc.) para integración en aplicaciones.
- Grounding: capacidad de referenciar objetos concretos en imágenes.
- Ejecución de código: el modelo puede generar y ejecutar fragmentos de código (aunque no se especifican los entornos).
- Upscaling 8x: ampliación de imágenes con factor 8.
- Streaming: generación incremental de resultados.
- Filtros de seguridad integrados para moderar contenido.
- Generación in-context: capacidad de seguir ejemplos proporcionados en el prompt (heredado de OmniGen2).
- Multilingüe: soporta inglés, portugués, chino, japonés y coreano.

## Casos de uso

- Generación de imágenes para diseño gráfico y marketing: un equipo creativo puede generar variaciones de producto con prompts como "un gato con gafas de sol" y obtener resultados en segundos, usando el pipeline de diffusers con `pipe("...")`.
- Edición de imágenes sin herramientas complejas: usuarios pueden modificar fotografías existentes mediante instrucciones textuales ("cambia el fondo a noche"), gracias a la capacidad de edición in-context del modelo.
- Producción de vídeo corto para redes sociales: el modelo genera clips de 30 segundos a 30 fps, adecuados para anuncios o contenido efímero, partiendo de una imagen o texto descriptivo.
- Creación de bandas sonoras sincronizadas: el puente de audio genera pistas de audio coherentes con el vídeo, útil para prototipos de vídeo con sonido sin necesidad de herramientas externas.
- Asistentes conversacionales con comprensión visual: gracias a Qwen2.5-VL-3B y al soporte de function calling, el modelo puede integrarse en chatbots que analicen imágenes y respondan con texto o generen contenido visual.
- Automatización de documentación técnica: el modelo puede generar diagramas o ilustraciones a partir de descripciones textuales, y editar iterativamente esos diagramas en función de feedback del usuario.
- Prototipado rápido en investigación multimodal: investigadores pueden usar el modelo como baseline de 8,7B para comparar con otros sistemas omni-modales, gracias a su licencia Apache 2.0 y su disponibilidad en diffusers.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas como MMLU, HumanEval, GSM8K ni evaluaciones específicas de generación de imagen (FID, CLIP score) o vídeo (FVD). La única comparación presentada es estructural: frente a Gemini Omni Flash (~8B, vídeo de 60s), Mini H3 Omni ofrece 30s de vídeo con un tamaño similar.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo de pesos en float16 ocupa 16,41 GB, por lo que se necesitan al menos 20-24 GB de VRAM para cargar el modelo completo con overhead de activaciones. Una RTX 3090 o RTX 4090 (24 GB) podría ser suficiente para generación de imágenes, pero para vídeo de 900 frames el consumo de memoria de activaciones puede superar los 24 GB.
- GPU recomendadas: A100 (40/80 GB) o H100 (80 GB) para vídeo largo y generación de audio simultánea. Para tareas de imagen únicamente, una RTX 4090 podría bastar.
- En consumer GPU: es posible ejecutar text-to-image en una RTX 4090 con 24 GB, pero la generación de vídeo de 30s requeriría probablemente cuantización adicional o particionado, no documentado oficialmente.
- Opciones de despliegue: al usar la librería diffusers, el modelo puede ejecutarse con el pipeline estándar de Diffusers. Para servir en producción se podría usar vLLM (si soporta el formato unificado) o TGI, aunque no hay documentación específica. Para despliegue local, Ollama no es compatible directamente con este tipo de modelo.
- Latencia y throughput: no se han publicado datos. La generación de 900 frames con un transformer de difusión de 3,97B implicará tiempos de minutos incluso en GPUs de gama alta; se recomienda validar con pruebas propias.

## Comparativa con modelos similares

| Modelo | Parámetros | Vídeo | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mini H3 Omni | ~8,7B | 30s @30fps | Texto, imagen, vídeo, audio | Apache 2.0 | HuggingFace (diffusers) |
| Gemini Omni Flash | ~8B (según model card) | 60s | Texto, imagen, vídeo, audio | Propietaria | API de Google |
| OmniGen2 (base) | ~3,97B (solo DiT) | No especificado | Imagen, edición in-context | Apache 2.0 | HuggingFace |

La comparación con Gemini Omni Flash es estructural (tamaño y modalidades), pero no hay datos de rendimiento que permitan una evaluación directa. OmniGen2, al ser el componente de difusión base, comparte arquitectura y licencia, pero Mini H3 Omni añade el módulo temporal y de audio, lo que lo hace más completo pero también más pesado en memoria.

## Limitaciones y advertencias

- No se han publicado evaluaciones de sesgos ni de alucinación; como modelo multimodal basado en Qwen2.5-VL y OmniGen2, podría heredar sesgos presentes en esos modelos base.
- La generación de vídeo de 30 segundos a 30 fps puede producir incoherencias temporales en escenas complejas o movimientos rápidos, dado que el módulo temporal tiene solo 917M parámetros.
- El audio generado está limitado a 32 kHz y a compatibilidad con MusicGen; no se especifica la calidad musical ni la sincronización fina con el vídeo.
- La licencia Apache 2.0 permite uso comercial, pero el usuario debe verificar que los pesos del modelo no contengan datos con derechos de autor en los datasets de entrenamiento (no documentados).
- El modelo solo soporta cinco idiomas (en, pt, zh, ja, ko); no hay soporte para español ni otros idiomas europeos.
- No se documentan cuantizaciones alternativas (INT8, INT4), por lo que el despliegue en hardware con menos de 24 GB de VRAM es problemático.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que el modelo es muy reciente y no ha sido validado por la comunidad; se recomienda realizar pruebas exhaustivas antes de usarlo en producción.
- La fecha de creación (agosto de 2026) es posterior a la fecha actual de conocimiento del modelo, lo que indica que puede tratarse de un modelo hipotético o simulado; verificar la disponibilidad real en HuggingFace.

## Enlaces

- HuggingFace: https://huggingface.co/Enzo275/MiniH3Omni
- Paper de OmniGen2: https://arxiv.org/abs/2506.18871
- Perfil del autor: https://huggingface.co/Enzo275
- Repo base de OmniGen2 (ComfyUI repackaged): https://huggingface.co/Comfy-Org/Omnigen2_ComfyUI_repackaged
- Modelo original OmniGen2: https://huggingface.co/OmniGen2/OmniGen2
