# FastVideo/FastVideo-Minimax-FastH3-Preview-v0.2

## Resumen

FastVideo-Minimax-FastH3-Preview-v0.2 es una destilación few-step del modelo MiniMax-H3, un transformer de difusión de 33B parámetros que genera vídeo y audio sincronizados a partir de texto. Desarrollado por el equipo FastVideo (hao-ai-lab), este checkpoint reduce el proceso de denoising de los 50 pasos del modelo base a solo 4 pasos, lo que supone 12,5 veces menos evaluaciones del transformer. El resultado es una generación de vídeo con audio en una única llamada al pipeline, manteniendo una calidad razonable para una versión preliminar.

La destilación se realizó con el método DMD2 (distribution matching distillation) sin datos de vídeo, utilizando únicamente unos 258k prompts de texto. El modelo está entrenado para operar en una escalera de timesteps concreta `[999, 749, 500, 250]` sobre el schedule shift-12 de rectified flow, y admite atención sparse opcional (VSA) para acelerar aún más la inferencia. Se distribuye en formato diffusers con pesos en bf16, e incluye todos los componentes necesarios (text encoder, VAEs, schedulers) para ser autocontenido.

Este preview es relevante porque demuestra que es posible reducir drásticamente el coste computacional de la generación de vídeo+audio de alta calidad, abriendo la puerta a despliegues en hardware más modesto. Sin embargo, al ser un checkpoint a mitad de entrenamiento (paso 2900 de 4000), su calidad aún está madurando y es inferior a la del modelo base en 50 pasos, especialmente en movimiento fino y detalle de audio.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion transformer (DiT) dual-modality vídeo+audio, basado en MiniMax-H3 |
| Parametros totales | 35.049.751.296 (total del repo; el transformer es de ~33B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | bf16 (pesos incluidos); no se documentan cuantizaciones adicionales |
| Idiomas soportados | No disponible |
| Licencia | MiniMax H3 Community License (otra, con restricciones territoriales) |
| Formato de pesos | safetensors (pipeline modular diffusers) |

## Arquitectura y entrenamiento

El modelo es un diffusion transformer de 33B parámetros que procesa simultáneamente modalidades de vídeo y audio. El student fue entrenado con atención block-sparse de vídeo (VSA, tiles de 64 tokens, 90% de sparsity) e incluye los parámetros de puerta sparse entrenados (`attn.to_gate_compress`); puede ejecutarse en modo denso (por defecto) o con VSA para mayor velocidad. El teacher y el critic permanecen densos.

La destilación utiliza DMD2 sin datos (data-free): solo prompts de texto (~258k prompts de VidProM-H3 y un conjunto sintético de prompts t2va), sin datos de vídeo. El student recorre su propia escalera de 4 pasos durante el entrenamiento (backward-simulation rollout), con regresión del critic en espacio x0 y muestreo de score-time shift-12/3 acoplado a los relojes de ruido duales de vídeo y audio. La resolución de entrenamiento es 768×1344, 124 frames (5 segundos) con audio sincronizado. Optimización: batch global 64, lr 1e-6 (student y critic), pesos maestros en fp32, cómputo en bf16, 2900 de 4000 pasos, hardware 32× NVIDIA GB200.

## Capacidades

- Generación de vídeo y audio sincronizados a partir de prompts multimodales en formato H3 (`integrated_multimodal_description: ... overall_soundscape: ...`).
- Inferencia en 4 pasos de denoising (frente a 50 del modelo base), con escalera de timesteps entrenada `[999, 749, 500, 250]`.
- Atención sparse opcional (VSA-H3) para aceleración adicional, activable mediante variables de entorno y argumentos del generador.
- Generación de clips de 5 segundos a 768×1344 con audio.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni otras propias de LLMs conversacionales; es un modelo generativo de vídeo/audio.

## Casos de uso

- Creación de clips cortos para redes sociales: el modelo genera vídeos de 5 segundos con audio sincronizado en una sola llamada, ideal para contenido vertical (768×1344) en plataformas como TikTok o Reels.
- Prototipado rápido de storyboards animados: permite a guionistas y directores visualizar escenas con sonido en minutos, sin necesidad de equipos de producción.
- Generación de material publicitario: anuncios breves con banda sonora integrada, reduciendo el coste de producción para campañas de marketing.
- Herramientas de edición de vídeo asistida por IA: integrable en suites de edición para generar b-roll o transiciones animadas con audio.
- Investigación en destilación de modelos de difusión: sirve como referencia para estudiar el equilibrio entre pasos de denoising y calidad en modelos dual-modality.
- Generación de contenido educativo: explicaciones visuales con narración o efectos de sonido para materiales docentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que la calidad del preview es inferior a la del modelo base con 50 pasos, especialmente en movimiento fino y detalle de audio, y que mejora con el avance del entrenamiento. No se proporcionan métricas cuantitativas (FVD, CLIP score, etc.).

## Requisitos de hardware

- VRAM estimada: los pesos del transformer en bf16 ocupan ~66 GB (33B × 2 bytes); el repo completo (147,8 GB) incluye text encoder, VAEs y schedulers. Se requiere una GPU con al menos 80 GB de VRAM para inferencia en modo denso (A100 80GB, H100 80GB, etc.).
- GPU recomendadas: NVIDIA A100 80GB, H100 80GB, o superiores. El snippet de uso indica `num_gpus=1`, por lo que es posible ejecutarlo en una sola GPU de alta capacidad.
- No cabe en GPUs de consumo (RTX 4090 tiene 24 GB, insuficiente para los pesos completos sin cuantización adicional, que no se documenta).
- Opciones de despliegue: framework FastVideo (VideoGenerator), compatible con diffusers. No se mencionan integraciones con vLLM, TGI u Ollama (no es un LLM).
- Latencia y throughput: no disponibles, pero al usar 4 pasos frente a 50, el coste de inferencia se reduce aproximadamente 12,5× en evaluaciones del transformer.

## Comparativa con modelos similares

| Modelo | Parámetros | Pasos de denoising | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FastVideo-Minimax-FastH3-Preview-v0.2 | ~33B (transformer) | 4 | Vídeo + audio | MiniMax H3 Community | HuggingFace (pesos abiertos) |
| MiniMax-H3 (base) | ~33B | 50 | Vídeo + audio | MiniMax H3 Community | HuggingFace |
| Otros modelos few-step de vídeo | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks comparativos con otros modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Checkpoint preview: calidad inferior al modelo base en 50 pasos, especialmente en movimiento fino y detalle de audio; aún está en entrenamiento (paso 2900 de 4000).
- La escalera de 4 pasos `[999, 749, 500, 250]` es el punto de operación entrenado; otros números de pasos o grids de timesteps están fuera de distribución y producen resultados degradados.
- La licencia MiniMax H3 Community License incluye restricciones territoriales y de uso aceptable; según el artículo citado, bloquea a creadores de Estados Unidos y la Unión Europea. Revisar la licencia antes de cualquier uso o redistribución.
- Hereda todas las limitaciones de contenido y restricciones de uso del modelo base MiniMax-H3.
- No se documentan idiomas soportados ni sesgos específicos; al ser un modelo generativo de vídeo/audio, puede reflejar sesgos presentes en los datos de entrenamiento del base.
- El componente `transformer_ref` (variante de condicionamiento por referencia) no está incluido en este repo; se obtiene del repositorio base si se utiliza.

## Enlaces

- HuggingFace (v0.2): https://huggingface.co/FastVideo/FastVideo-Minimax-FastH3-Preview-v0.2
- HuggingFace (v0.1): https://huggingface.co/FastVideo/FastVideo-Minimax-FastH3-Preview-v0.1
- Repositorio FastVideo: https://github.com/hao-ai-lab/FastVideo
- Herramientas minimax_h3 en FastVideo: https://github.com/hao-ai-lab/FastVideo/tree/main/tools/minimax_h3
- Sitio web de FastVideo: https://haoailab.com/FastVideo/
- Artículo sobre FastH3 y la licencia: http://creativeaishow.com/fastvideo-fasth3-the-free-4-step-minimax-h3-video-model-and-the-license-that-blocks-us-creators/
