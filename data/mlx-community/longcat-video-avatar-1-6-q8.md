# mlx-community/LongCat-Video-Avatar-1.6-q8

## Resumen

LongCat-Video-Avatar-1.6-q8 es la conversión a formato MLX del modelo meituan-longcat/LongCat-Video-Avatar-1.6, desarrollado originalmente por Meituan LongCat. Se trata de un modelo de generación de vídeo condicionado por audio e imagen: a partir de una imagen de referencia, una pista de habla y un prompt textual, genera un vídeo de avatar parlante. Esta variante concreta está pensada para ejecutarse en Apple Silicon mediante la librería MLX, con el DiT cuantizado a 8 bits para reducir el peso del repositorio a unos 35 GB.

La relevancia de esta ficha radica en que combina tres tendencias actuales: modelos de difusión para vídeo, control por audio para sincronización labial y cuantización agresiva para despliegue en hardware de consumo. El modelo es una destilación (etiqueta "distilled") que permite muestrear en solo 8 pasos, lo que lo hace viable en entornos locales frente a los cientos de pasos habituales en difusión de vídeo.

La arquitectura subyacente es un transformer de difusión (DiT) con codificadores de texto (umT5), audio (Whisper) y un VAE de vídeo, todos en bf16 excepto el DiT, que va en 8 bits. El contexto multimodal es imagen + audio + texto, con soporte de idiomas inglés y chino según la model card. La licencia es MIT, lo que facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (diffusion transformer) con codificadores umT5, Whisper y VAE |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (condicionado por audio e imagen, no por tokens de texto) |
| Tipos de cuantizacion | DiT en 8 bits (group_size=64); LoRAs, umT5, Whisper y VAE en bf16 |
| Idiomas soportados | en, zh |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo sigue un esquema de difusión latente para vídeo: un DiT procesa latentes de vídeo condicionados por embeddings de texto (umT5), audio (Whisper) e imagen de referencia. La variante 1.6 introduce un cambio relevante en el muestreo: en lugar de fusionar un único LoRA en el DiT, mantiene dos LoRAs como rutas laterales (dmd_lora.safetensors, correspondiente al loraA original, y opsd_lora.safetensors, correspondiente al loraB) y alterna cuál está activo según el paso de denoising. Los pasos 1-4 usan el LoRA DMD y los pasos 5-8 el LoRA OPSD, replicando la configuración upstream `--mix_steps=4 --mix_alpha=1.0`. El horario se codifica en `pipeline_config.json`.

El proceso de destilación permite generar vídeo en solo 8 pasos de muestreo, lo que reduce drásticamente el coste computacional frente a modelos de difusión de vídeo no destilados. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La conversión a MLX se realizó con el script `recipes/convert_longcat_avatar.py` del repositorio xocialize/longcat-avatar-mlx, usando la variante `v1.6-q8`.

## Capacidades

- Generación de vídeo de avatar parlante a partir de una imagen de referencia, una pista de audio y un prompt textual.
- Sincronización labial y de expresión facial condicionada por el audio de entrada.
- Generación de vídeo imagen-a-vídeo (pipeline_tag: image-to-video).
- Muestreo destilado en 8 pasos, con alternancia de LoRAs DMD y OPSD durante el denoising.
- Soporte de prompts en inglés y chino.
- Ejecución nativa en Apple Silicon mediante MLX.
- Interfaz en Python (xocialize/longcat-avatar-mlx) y Swift (xocialize/longcat-avatar-mlx-swift).
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso; no es un modelo de lenguaje general.

## Casos de uso

- Generación de avatares corporativos para vídeos de formación: se parte de una foto del presentador y un audio grabado, y el modelo produce un vídeo sincronizado sin necesidad de rodaje, lo que reduce costes de producción en entornos con hardware Apple.
- Prototipado rápido de contenido para redes sociales: creadores que trabajan en Mac pueden generar clips de avatar con 8 pasos de muestreo y revisar resultados localmente antes de escalar a producción.
- Doblaje y localización de vídeos: dado un audio en inglés o chino y una imagen del hablante, se genera un vídeo con movimiento labial coherente, útil para adaptar contenido a nuevos mercados.
- Asistentes virtuales con presencia visual: integración en aplicaciones de atención al cliente donde se requiere un avatar que hable, ejecutándose en estaciones de trabajo con Apple Silicon.
- Investigación en generación de vídeo condicionada por audio: el modelo sirve como base para experimentos de sincronización labial, alternancia de LoRAs y destilación, con pesos abiertos y licencia MIT.
- Educación y material divulgativo: producción de lecciones con un avatar que narra el contenido a partir de un guion de audio, sin necesidad de infraestructura GPU en la nube.
- Pruebas de concepto en estudios de animación: generación de referencias rápidas de movimiento facial y labial para iterar antes de la producción final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM equivalente: el repositorio ocupa 35,0 GB, por lo que se necesita al menos esa cantidad de memoria unificada disponible, más overhead de ejecución; se recomienda un Mac con 48 GB o 64 GB de memoria unificada para trabajar con holgura.
- GPU recomendadas: Apple Silicon (series M1/M2/M3/M4 Pro, Max o Ultra). No está pensado para GPU NVIDIA; para esas plataformas habría que usar el modelo base meituan-longcat/LongCat-Video-Avatar-1.6 en su formato original.
- Cabe en GPU de consumo: sí, en equipos Apple Silicon con memoria unificada suficiente; no en GPUs de consumo con 8-16 GB de VRAM.
- Opciones de despliegue: MLX (Python y Swift) mediante los repositorios xocialize/longcat-avatar-mlx y xocialize/longcat-avatar-mlx-swift. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles. El muestreo en 8 pasos con alternancia de LoRAs reduce el coste frente a modelos no destilados, pero no se aportan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / condicionamiento | Pasos de muestreo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LongCat-Video-Avatar-1.6-q8 (esta ficha) | no disponible | imagen + audio + texto | 8 (destilado) | MIT | MLX, Apple Silicon |
| meituan-longcat/LongCat-Video-Avatar-1.6 | no disponible | imagen + audio + texto | 8 (destilado) | MIT | Formato original, pesos completos |
| Otros modelos audio-driven avatar | no disponible | imagen + audio | no disponible | no disponible | no disponible |

No se dispone de información suficiente para comparar con alternativas concretas de la misma categoría en términos de rendimiento medido.

## Limitaciones y advertencias

- Solo soporta inglés y chino según la model card; el rendimiento en otros idiomas no está documentado.
- Es un modelo de generación de vídeo, no de lenguaje: no admite tool calling, agentes ni razonamiento multi-paso.
- Riesgo de artefactos visuales y desincronización labial en audios con ruido, acentos no cubiertos o habla solapada; no se documentan métricas de calidad.
- La cuantización a 8 bits del DiT puede introducir degradación respecto al modelo original en bf16; no se aportan comparativas de calidad.
- El tamaño del repositorio (35 GB) limita su despliegue a equipos con memoria unificada amplia; no es viable en GPUs de consumo estándar.
- Licencia MIT: permite uso comercial, pero conviene revisar las condiciones del modelo base y de los componentes (umT5, Whisper, VAE) por si tuvieran licencias distintas.
- No se documentan sesgos demográficos ni de otro tipo; al generar avatares a partir de imágenes reales, existe riesgo de uso indebido (suplantación, deepfakes) que requiere salvaguardas adicionales en producción.
- El modelo está etiquetado como destilado; la calidad en escenarios fuera de distribución puede ser inferior a la de modelos no destilados.

## Enlaces

- Hugging Face: https://huggingface.co/mlx-community/LongCat-Video-Avatar-1.6-q8
- Modelo base: https://huggingface.co/meituan-longcat/LongCat-Video-Avatar-1.6
- Repositorio Python: https://github.com/xocialize/longcat-avatar-mlx
- Repositorio Swift: https://github.com/xocialize/longcat-avatar-mlx-swift
- Script de conversión: https://github.com/xocialize/longcat-avatar-mlx/blob/main/recipes/convert_longcat_avatar.py
