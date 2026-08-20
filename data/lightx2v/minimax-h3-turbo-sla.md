# lightx2v/Minimax-h3-Turbo-SLA

## Resumen

MiniMax-H3 Turbo-SLA es un checkpoint LoRA de destilación para el modelo base MiniMax-H3, desarrollado por el equipo de LightX2V en colaboración con técnicas de atención dispersa del proyecto SLA (Sparse-Linear Attention). El modelo reduce el número de pasos de denoising de 30 a 4 mediante destilación, y aplica un ratio de esparsidad del 85% en la atención, lo que acelera la inferencia aproximadamente 2,5 veces en una NVIDIA RTX 5090 dentro del entorno LightX2V, manteniendo una calidad visual competitiva.

Se distribuye como adaptador LoRA en formato BF16, tanto en variante nativa para LightX2V como convertida para ComfyUI. Requiere el modelo base MiniMaxAI/MiniMax-H3 para funcionar. La licencia de los pesos del adaptador es Apache 2.0, mientras que el modelo base mantiene su licencia propia. El repositorio pesa 3,3 GB y está orientado a generación de vídeo a partir de imagen (image-to-video), con soporte para resolución 768p.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion transformer con atención dispersa (SLA), basado en MiniMax-H3 |
| Parametros totales | no disponible (adaptador LoRA; el modelo base es MiniMax-H3) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (checkpoints oficiales); configuraciones FP8 disponibles en LightX2V para RTX 5090 |
| Idiomas soportados | en (etiqueta del modelo; generacion de video, no de texto) |
| Licencia | Apache 2.0 (adaptador); el modelo base MiniMax-H3 tiene su propia licencia |
| Formato de pesos | safetensors (BF16), variantes LightX2V y ComfyUI |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA sobre MiniMax-H3, un diffusion transformer para generación de vídeo. La innovación principal es la combinación de destilación en 4 pasos con el mecanismo SLA (Sparse-Linear Attention), que sustituye la atención densa convencional por una atención dispersa con un ratio de esparsidad del 85%. Este mecanismo reduce el coste computacional de la atención, lo que se traduce en una aceleración medida de aproximadamente 2,5× en una RTX 5090 con el entorno LightX2V.

El entrenamiento se basa en destilación desde el modelo original de 30 pasos, y los pesos del adaptador se publican en BF16. No se han proporcionado datos sobre el número de tokens de entrenamiento, composición del dataset ni uso de RLHF o DPO. La configuración de inferencia incluye parámetros específicos como `video_flow_shift` (6.0) y `audio_flow_shift` (3.0), además de un paso de actualización H3 tipo `training_euler`.

## Capacidades

- Generación de vídeo a partir de imagen (image-to-video) con resolución 768p.
- Generación de vídeo con audio (audio-video generation), según las etiquetas del modelo.
- Inferencia acelerada mediante destilación en 4 pasos de denoising (frente a los 30 del modelo base).
- Atención dispersa SLA con ratio de esparsidad del 85%, lo que reduce el coste computacional.
- Compatible con el framework LightX2V y con ComfyUI mediante checkpoint convertido.
- Soporta configuraciones FP8 para DiT y VAE en entornos específicos (RTX 5090).
- No se ha documentado soporte para tool calling, razonamiento de texto o capacidades multimodales más allá de vídeo.

## Casos de uso

- Producción de vídeo en tiempo real: el modelo reduce los pasos de denoising de 30 a 4, lo que permite generar clips de 768p en un tiempo significativamente menor, adecuado para prototipado rápido y validación de ideas en estudios de producción.
- Edición de vídeo asistida por IA: los usuarios pueden partir de una imagen fija y generar una secuencia animada, útil para storyboards, animaciones de producto o contenido para redes sociales.
- Investigación en eficiencia de atención: el checkpoint sirve como banco de pruebas para evaluar el impacto de la atención dispersa (SLA) en calidad y velocidad frente a la atención densa del modelo base.
- Automatización de contenido para publicidad: generar clips de vídeo de 768p a partir de imágenes de producto sin necesidad de un equipo de renderizado costoso.
- Integración en pipelines de ComfyUI: el checkpoint convertido permite incorporar generación de vídeo en flujos de trabajo nodales para artistas y diseñadores que ya usan esta herramienta.
- Evaluación de destilación de modelos de difusión: el checkpoint sirve como referencia para estudiar la pérdida de calidad al reducir pasos de denoising en arquitecturas de vídeo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (p. ej., FID, CLIP score, métricas de vídeo) en la información disponible. El único dato de rendimiento reportado es una aceleración de aproximadamente 2,5× en una NVIDIA RTX 5090 con el entorno LightX2V, manteniendo una calidad visual competitiva en comparación con el modelo base de 30 pasos.

## Requisitos de hardware

- El adaptador LoRA pesa 3,3 GB en BF16, pero requiere los pesos completos del modelo base MiniMax-H3 para funcionar.
- La aceleración reportada se obtuvo en una NVIDIA RTX 5090, que dispone de 32 GB de VRAM.
- Existen configuraciones FP8 para DiT y VAE específicas para RTX 5090, lo que sugiere que la VRAM necesaria puede ser menor que con BF16.
- No se indica si el modelo puede ejecutarse en GPUs de consumo más modestas (p. ej., RTX 4090, 3090) o en hardware sin soporte FP8.
- Opciones de despliegue: LightX2V (inferencia nativa) y ComfyUI (con checkpoint convertido). No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI, dado que es un modelo de difusión de vídeo, no un LLM.
- Latencia y throughput específicos no publicados; solo se indica la aceleración relativa de 2,5×.

## Comparativa con modelos similares

No se dispone de especificaciones técnicas completas de los modelos comparables en la información proporcionada. Se puede establecer una comparación conceptual:

| Modelo | Pasos de denoising | Atención | Aceleración | Licencia |
|---|---|---|---|---|
| MiniMax-H3 (base) | 30 | Densa | Referencia | Propia de MiniMax |
| MiniMax-H3 Turbo (sin SLA) | 4 | Densa | no disponible | Apache 2.0 (adaptador) |
| MiniMax-H3 Turbo-SLA (este modelo) | 4 | Dispersa (85%) | ~2,5× vs base | Apache 2.0 (adaptador) |

No hay datos públicos de parámetros totales, contexto o calidad de vídeo para estos modelos, por lo que no se puede realizar una comparativa cuantitativa completa.

## Limitaciones y advertencias

- El modelo es un adaptador LoRA: requiere el modelo base MiniMax-H3 para funcionar; no es un checkpoint independiente.
- La licencia Apache 2.0 aplica solo a los pesos del adaptador. El uso del modelo base MiniMax-H3 está sujeto a su licencia original, que puede tener restricciones comerciales.
- La aceleración de 2,5× se reporta en un entorno específico (LightX2V, RTX 5090) y puede variar con la resolución, la duración del vídeo, el software y el hardware.
- No se han publicado evaluaciones de calidad en benchmarks estándar; la afirmación de "calidad visual competitiva" es subjetiva y no cuantificada.
- El modelo está etiquetado solo en inglés y orientado a generación de vídeo, no a tareas de texto o lenguaje.
- No se documentan sesgos específicos, pero la generación de vídeo puede heredar sesgos del modelo base y de los datos de entrenamiento, que no se han hecho públicos.
- Para producción, es necesario validar la estabilidad temporal de los vídeos generados y la coherencia con el audio, ya que no se han publicado pruebas de robustez.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/lightx2v/Minimax-h3-Turbo-SLA
- Modelo base MiniMax-H3: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Checkpoint Turbo sin SLA: https://huggingface.co/lightx2v/Minimax-h3-Turbo
- Proyecto LightX2V: https://github.com/ModelTC/LightX2V
- Proyecto SLA (Sparse-Linear Attention): https://github.com/thu-ml/SLA
- Paper SLA (arXiv:2509.24006): https://arxiv.org/abs/2509.24006
- Configuración de inferencia SLA para RTX 5090: https://github.com/ModelTC/LightX2V/blob/main/configs/minimax_h3/dmd/minimax_h3_fp8_4step_5090_with_fp8_vae_sla.json
- Ejemplos de inferencia MiniMax-H3 en LightX2V: https://github.com/ModelTC/LightX2V/tree/main/examples/minimax_h3
