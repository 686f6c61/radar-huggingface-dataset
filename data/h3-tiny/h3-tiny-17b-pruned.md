# H3-Tiny/H3-Tiny-17B-Pruned

## Resumen

H3-Tiny-17B-Pruned es un checkpoint de generación conjunta de vídeo y audio derivado de MiniMaxAI/MiniMax-H3 (33.12B) mediante poda estructurada sin reentrenamiento. El autor, H3-Tiny, ha eliminado 8 de los 50 bloques del transformer y ha reducido el rango de las capas AdaLN a 8, obteniendo un modelo de 17.067.115.600 parámetros (17,07B) que conserva el flujo de trabajo Ref2VA: generación de vídeo con audio sincronizado a partir de texto e imágenes de referencia.

El modelo se distribuye en formato diffusers (config.json más safetensors fragmentados) y contiene únicamente el transformer; el text encoder, los VAE y los procesadores provienen del checkpoint oficial de MiniMax H3. Está pensado para entornos con restricciones de memoria, ya que reduce el peso del componente principal a aproximadamente la mitad manteniendo el pipeline original.

Su relevancia actual reside en que permite ejecutar un modelo de vídeo-audio de gran escala con menos VRAM y sin necesidad de un proceso de destilación o fine-tuning adicional, a costa de una pérdida de calidad que el autor no cuantifica en la información disponible. La licencia es la MiniMax H3 Community License, con ámbito territorial y política de uso aceptable propios.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (DiT) para vídeo y audio, derivado de MiniMax-H3 Ref2VA con poda estructurada |
| Parámetros totales | 17.067.115.600 (17,07B, solo transformer) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el repo distribuye safetensors en precisión original) |
| Idiomas soportados | no disponible |
| Licencia | minimax-h3-community-license (MiniMax H3 Community License Agreement) |
| Formato de pesos | safetensors fragmentados con config.json (layout diffusers) |
| Pasos de muestreo | 50 |
| Bloques del transformer | 42 (50 originales menos 8 eliminados) |
| Rango AdaLN | 8 |
| Tamaño del repo | 34,2 GB |
| Librería | diffusers |
| Pipeline | text-to-video (Ref2VA: referencia a vídeo + audio) |

## Arquitectura y entrenamiento

El modelo es un transformer de difusión para generación conjunta de vídeo y audio, podado de forma estructurada a partir de MiniMax-H3 Ref2VA (33,12B). La poda elimina 8 de los 50 bloques del transformer y reduce el rango de las capas de modulación AdaLN a 8, lo que rebaja el recuento de parámetros de 33,12B a 17,07B. Según la model card, el checkpoint es *training-free*: funciona directamente tras la poda, sin pasar por un proceso de recuperación o fine-tuning.

No se especifican en la información disponible los datos de entrenamiento originales (número de tokens, composición del dataset, uso de RLHF/DPO), ni innovaciones adicionales como decodificación especulativa o atención lineal. El pipeline Ref2VA acepta texto e imágenes de referencia y genera vídeo con pista de audio asociada; el repositorio contiene solo el transformer, mientras que el text encoder, los VAE y los procesadores se toman del checkpoint oficial de MiniMax H3 en formato diffusers.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video) con 50 pasos de muestreo.
- Generación conjunta de vídeo y audio sincronizado (Ref2VA).
- Condicionamiento por imágenes de referencia (`<Picture 1>` en el prompt) para guiar la generación.
- Control del número de fotogramas generados (por ejemplo, `--num-frames 124`).
- Integración con ComfyUI mediante un checkpoint single-file alternativo del mismo autor.
- Carga programática mediante `h3tiny.pipeline.load_pipeline` y CLI `scripts/infer.py`.
- Soporte de offloading y de distintos backends de atención según el README del repositorio GitHub.
- No se documentan capacidades de tool calling, agentes, razonamiento multilingüe ni modo thinking.

## Casos de uso

- Prototipado rápido de vídeo generativo: el modelo permite iterar sobre prompts y referencias con un transformer de 17B en lugar de 33B, reduciendo el coste por iteración en fases de exploración creativa.
- Generación de clips con audio para previsualización de anuncios: el pipeline Ref2VA produce vídeo y audio en una sola pasada, útil para maquetas de spots antes de la producción final.
- Creación de contenido para redes sociales en estudios pequeños: al caber en configuraciones de GPU más modestas que el modelo base, facilita la generación de clips cortos con banda sonora sin infraestructura de gran escala.
- Investigación sobre poda de modelos de difusión: el checkpoint sirve como referencia reproducible para estudiar el impacto de eliminar bloques y reducir el rango AdaLN en la calidad de vídeo y audio.
- Automatización de pipelines de vídeo en ComfyUI: el checkpoint single-file del mismo autor permite integrar la generación en flujos de nodos existentes para producción de vídeo por lotes.
- Evaluación comparativa de calidad frente al modelo base: útil para equipos que necesitan decidir entre calidad máxima (MiniMax-H3 completo) y eficiencia (17B podado) en función de sus recursos.
- Generación de material audiovisual a partir de imágenes de producto: el condicionamiento por referencia permite animar fotografías de catálogo con audio asociado para demos comerciales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el transformer pesa 17,07B parámetros y el repo ocupa 34,2 GB en safetensors, por lo que la inferencia en precisión original requiere del orden de decenas de GB de VRAM sumando text encoder y VAE.
- GPU recomendadas: no disponibles en la información proporcionada; por tamaño, se sitúan en la categoría de A100/H100 o GPUs de consumo de gama alta con offloading.
- ¿Cabe en GPU de consumo? No confirmado; el README menciona opciones de offloading, lo que sugiere que puede ejecutarse en GPUs con menos VRAM a costa de velocidad.
- Opciones de despliegue: diffusers (pipeline `h3tiny`), CLI `scripts/infer.py`, ComfyUI mediante el checkpoint single-file de H3-Tiny/MiniMax-H3-Tiny-ComfyUI.
- Latencia y throughput: no disponibles. Se fijan 50 pasos de muestreo por generación.

## Comparativa con modelos similares

| Modelo | Parámetros | Tipo | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| H3-Tiny-17B-Pruned | 17,07B (transformer) | DiT vídeo + audio, podado | no disponible | MiniMax H3 Community License | Hugging Face, diffusers, ComfyUI |
| MiniMaxAI/MiniMax-H3 (base) | 33,12B (transformer) | DiT vídeo + audio | no disponible | MiniMax H3 Community License | Hugging Face, diffusers |
| H3-Tiny-14B (variante del mismo proyecto) | 14B (según model card) | DiT vídeo + audio, podado | no disponible | MiniMax H3 Community License | Hugging Face (colección H3-Tiny) |

No se dispone de datos de rendimiento comparado entre estas variantes en la información proporcionada. La comparativa se limita a tamaño, linaje y licencia.

## Limitaciones y advertencias

- La poda es training-free: no hay recuperación de calidad tras eliminar 8 bloques y reducir el rango AdaLN, por lo que es esperable una degradación de calidad frente al modelo base, aunque no se cuantifica.
- El repositorio contiene solo el transformer; requiere descargar el checkpoint oficial de MiniMax H3 para text encoder, VAE y procesadores, lo que incrementa el espacio en disco y la complejidad del despliegue.
- Licencia MiniMax H3 Community License: no es una licencia open source estándar; incluye ámbito territorial y política de uso aceptable que deben revisarse antes de uso comercial.
- El proyecto H3-Tiny es independiente y no está afiliado ni respaldado por MiniMax.
- No se documentan sesgos conocidos, tasas de alucinación ni limitaciones idiomáticas específicas.
- No se especifican requisitos mínimos de VRAM ni latencias, lo que dificulta planificar capacidad en producción.
- Modelo orientado a generación de vídeo y audio; no es un modelo de lenguaje y no cubre tareas de texto, código o razonamiento.
- El número de descargas (523) y likes (4) es bajo, lo que sugiere una validación comunitaria limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/H3-Tiny/H3-Tiny-17B-Pruned
- Repositorio GitHub del proyecto: https://github.com/fuyi25/MiniMax-H3-Tiny
- Página del proyecto: https://fuyi25.github.io/MiniMax-H3-Tiny/
- Colección H3-Tiny en Hugging Face: https://huggingface.co/collections/H3-Tiny/h3-tiny-v01-6afeea67147c27cf3b80820a
- Checkpoint ComfyUI (single-file): https://huggingface.co/H3-Tiny/MiniMax-H3-Tiny-ComfyUI
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Licencia: https://huggingface.co/H3-Tiny/MiniMax-H3-Tiny-17B-Pruned-Ref2VA/blob/main/LICENSE-MiniMax-H3
- Contacto del autor: fohoo@outlook.com
