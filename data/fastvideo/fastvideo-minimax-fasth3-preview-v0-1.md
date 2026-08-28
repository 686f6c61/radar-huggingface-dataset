# FastVideo/FastVideo-Minimax-FastH3-Preview-v0.1

## Resumen

FastVideo-Minimax-FastH3-Preview-v0.1 es una destilación few-step (4 pasos de denoising) del modelo MiniMax-H3, un transformer de difusión de 33B parámetros que genera video y audio sincronizados a partir de texto. Desarrollado por el equipo FastVideo (Hao AI Lab), este preview reduce las evaluaciones del transformer en un factor de 12,5 (de 50 pasos a 4) mediante destilación DMD2 data-free, lo que permite una generación mucho más rápida manteniendo la arquitectura dual de video y audio del modelo base.

El modelo se publica como checkpoint de evaluación (paso 1400 de un entrenamiento de 4000 pasos) en formato diffusers, con solo los pesos del transformer modificados respecto al base. Está pensado para desarrolladores que necesitan integrar generación de video con audio en pipelines de producción con requisitos de latencia reducida, aunque la calidad aún está madurando y se espera una versión final más fuerte del mismo entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) dual-modality video+audio, basado en MiniMax-H3 |
| Parametros totales | 35.049.751.296 (≈35B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el text encoder Qwen3-VL tiene su propio contexto, no especificado) |
| Tipos de cuantizacion | No disponibles (solo bf16 en el repo) |
| Idiomas soportados | No disponibles (el text encoder Qwen3-VL es multilingue, pero no se especifica) |
| Licencia | MiniMax H3 Community License |
| Formato de pesos | safetensors (diffusers) |

## Arquitectura y entrenamiento

El modelo es un transformer de difusión de 33B parámetros que procesa simultáneamente latentes de video y audio, con un text encoder Qwen3-VL y VAEs separados para cada modalidad. El estudiante destilado mantiene la misma arquitectura que el base, pero con atención block-sparse de video (VSA, tiles de 64 tokens, 90% de sparsity) entrenada, lo que permite aceleración adicional en inferencia si se activa.

El entrenamiento utiliza DMD2 (Distribution Matching Distillation) data-free, con un estudiante, un teacher congelado y un crítico de fake-score. El estudiante recorre su propio grid de 4 pasos durante el entrenamiento (backward-simulation rollout), con regresión del crítico en el espacio x0 y muestreo de tiempo desplazado (shifts 12/3) para los relojes de ruido duales de video y audio. Se usaron aproximadamente 258k prompts de texto (VidProM-H3 y un conjunto sintético t2va), sin datos de video. Precisión fp32 para pesos maestros y bf16 para cómputo, entrenado en 32× NVIDIA GB200.

## Capacidades

- Generación de video y audio sincronizados a partir de prompts de texto multimodal (formato `integrated_multimodal_description` y `overall_soundscape`).
- Inferencia few-step: 4 pasos de denoising frente a los 50 del modelo base, con 12,5× menos evaluaciones del transformer.
- Atención block-sparse de video (VSA) opcional para aceleración adicional, activable mediante los parámetros `attn.to_gate_compress` entrenados.
- Soporte de prompts multimodales complejos que describen escena, movimiento, diálogo y paisaje sonoro.
- Generación de video y audio en una única llamada al pipeline (text-to-audio-video).
- Compatible con el framework FastVideo para inferencia y post-entrenamiento.

## Casos de uso

- Prototipado rápido de contenido audiovisual: un equipo creativo puede generar borradores de video con audio en segundos (4 pasos) para validar conceptos antes de producción final, reduciendo el tiempo de iteración de minutos a segundos.
- Generación de clips para redes sociales: crear videos cortos con banda sonora sincronizada a partir de descripciones textuales, ideal para campañas de marketing ágiles donde la velocidad prima sobre la perfección.
- Doblaje y localización de contenido: al aceptar prompts multimodales con descripción de audio, se pueden generar pistas de audio sincronizadas con video para prototipos de doblaje en distintos idiomas (si el text encoder lo soporta).
- Integración en pipelines de generación de video en tiempo real: con 4 pasos y VSA, el modelo puede integrarse en sistemas de generación interactiva donde la latencia es crítica, como avatares virtuales o asistentes con respuesta visual.
- Evaluación de técnicas de destilación: para investigadores, este preview sirve como punto de referencia para comparar DMD2 con otros métodos de destilación en modelos de video-audio, midiendo el trade-off calidad/velocidad.
- Generación de storyboards animados con audio: los cineastas pueden crear animáticas preliminares con sonido ambiente a partir de guiones, acelerando la preproducción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo se presenta como preview de evaluación, sin métricas cuantitativas (FVD, CLIP score, etc.) en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: el transformer en bf16 ocupa aproximadamente 70 GB (35B × 2 bytes). Con los componentes adicionales (text encoder, VAEs), el pico de memoria puede superar los 80 GB. Se recomienda al menos una GPU con 80 GB (A100, H100) o distribución en múltiples GPUs.
- GPU recomendadas: NVIDIA A100 80GB, H100 80GB, o clústeres con varias GPUs (p.ej., 2× RTX 4090 con 24 GB cada una usando paralelismo de datos, aunque no está documentado).
- En consumer GPU: no cabe en una sola GPU de consumo (máximo 24 GB en RTX 4090). Se necesitaría cuantización (no disponible oficialmente) o particionado del modelo, lo cual no está soportado de serie.
- Opciones de despliegue: framework FastVideo (recomendado), pipeline diffusers estándar. No se menciona soporte para vLLM, TGI u Ollama.
- Latencia y throughput: no disponibles. Con 4 pasos y VSA, se espera una reducción significativa frente a los 50 pasos del base, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Pasos de inferencia | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FastVideo-Minimax-FastH3-Preview-v0.1 | 35B | 4 | Video+audio | MiniMax H3 Community | HuggingFace (preview) |
| MiniMax-H3 (base) | 33B | 50 | Video+audio | MiniMax H3 Community | HuggingFace |
| Otros modelos de video (CogVideoX, W.A.L.T) | No disponible | No disponible | Video | No disponible | No disponible |

La comparación natural es con el modelo base MiniMax-H3: el preview ofrece 12,5× menos pasos a costa de calidad (aún madurando). No se dispone de datos suficientes para comparar con otros modelos de generación de video de código abierto en esta ficha.

## Limitaciones y advertencias

- Checkpoint preview: es un paso temprano del entrenamiento (1400 de 4000); la calidad es inferior al modelo base con 50 pasos, especialmente en movimiento fino y detalle de audio.
- El grid de 4 pasos es el único rango entrenado; usar otros números de pasos produce resultados fuera de distribución y probablemente de peor calidad.
- Hereda todas las limitaciones de contenido y restricciones de uso del modelo base MiniMax-H3, incluyendo términos territoriales y de uso aceptable de la licencia comunitaria.
- No se han publicado cuantizaciones oficiales; el despliegue en hardware de consumo requiere soluciones no soportadas.
- El componente `transformer_ref` (variante de condicionamiento por referencia) no está incluido en este repo; se descarga del base si se usa, lo que puede causar problemas de compatibilidad.
- Riesgo de alucinación visual y auditiva inherente a los modelos generativos; los prompts deben ser específicos para evitar artefactos.
- Idiomas soportados no documentados; aunque el text encoder Qwen3-VL es multilingüe, no hay garantía de calidad en idiomas distintos del inglés.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/FastVideo/FastVideo-Minimax-FastH3-Preview-v0.1
- Modelo base MiniMax-H3: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Framework FastVideo: https://github.com/hao-ai-lab/FastVideo
- Paper DMD2 (arXiv:2405.14867): https://arxiv.org/abs/2405.14867
- Documentación de MiniMax H3: https://design.minimax.io/h3
