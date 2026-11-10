# Icloud88/Wan2.2-I2V-A14B

## Resumen

Wan2.2-I2V-A14B es un modelo de difusión de vídeo para la tarea de imagen-a-vídeo (image-to-video, I2V), desarrollado originalmente por el equipo Wan (Wan-AI, vinculado a Alibaba) y redistribuido en este repositorio por el usuario Icloud88. Forma parte de la familia Wan2.2, una actualización de los modelos fundacionales de vídeo Wan2.1 que introduce una arquitectura de mezcla de expertos (MoE) en el proceso de difusión: distintos expertos se especializan en distintos tramos del proceso de eliminación de ruido, ampliando la capacidad total del modelo sin incrementar el coste computacional por paso.

El modelo genera vídeo a partir de una imagen de referencia y un prompt textual, con soporte para resoluciones de 480P y 720P. Según la model card, la arquitectura MoE reduce movimientos de cámara no realistas y mejora la estabilidad de la síntesis en escenas estilizadas. La familia Wan2.2 se entrenó con un 65,6 % más de imágenes y un 83,2 % más de vídeos que Wan2.1, e incorpora datos estéticos etiquetados (iluminación, composición, contraste, tono de color) para un control más preciso del estilo cinematográfico.

Este repositorio concreto tiene 126,2 GB de pesos en formato safetensors, licencia Apache 2.0, soporte de inglés y chino, e integración con Diffusers y ComfyUI. Es relevante para quien necesite generación de vídeo open source de alta calidad con control estético y despliegue local o en clústeres multi-GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusión de vídeo con Mixture-of-Experts (MoE); separación del proceso de denoising por tramos de timestep con expertos especializados |
| Parametros totales | 14B (denominación A14B del modelo; desglose exacto de parámetros activos no disponible) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (modelo de difusión; no aplica ventana de contexto de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería wan2.2; integración Diffusers) |

## Arquitectura y entrenamiento

Wan2.2-I2V-A14B es un modelo de difusión para vídeo construido sobre una arquitectura transformer con mezcla de expertos. La innovación principal de la familia es aplicar MoE al proceso de denoising: el proceso se divide por tramos de timestep y cada tramo lo gestiona un experto especializado, lo que aumenta la capacidad total del modelo manteniendo el coste computacional por paso. El modelo I2V-A14B está diseñado específicamente para imagen-a-vídeo a 480P y 720P, con mejoras en estabilidad del vídeo y reducción de movimientos de cámara irreales.

En cuanto a datos de entrenamiento, la model card indica que Wan2.2 se entrenó con un 65,6 % más de imágenes y un 83,2 % más de vídeos que Wan2.1, e incorpora datos estéticos curados con etiquetas detalladas de iluminación, composición, contraste y tono de color. No se especifica en la información disponible el número exacto de tokens, la composición completa del dataset ni si se emplearon técnicas de RLHF o DPO (poco habituales en modelos de difusión de vídeo). La familia incluye además un VAE propio de Wan2.2 con ratio de compresión 16×16×4, usado en el modelo TI2V-5B; no se confirma en la información disponible si el I2V-A14B emplea ese mismo VAE.

## Capacidades

- Generación de vídeo a partir de imagen (image-to-video) con prompt textual, a resoluciones de 480P y 720P.
- Control estético cinematográfico: estilo, iluminación, composición, contraste y tono de color ajustables mediante prompt.
- Generación de movimiento complejo, con mejor generalización en movimiento, semántica y estética respecto a Wan2.1.
- Soporte de escenas estilizadas diversas, con menor tendencia a movimientos de cámara no realistas.
- Soporte multilingüe de prompts en inglés y chino.
- Integración con Diffusers (pipeline image-to-video) y ComfyUI.
- Inferencia multi-GPU mediante el código de inferencia del repositorio oficial.
- No se documentan en la información disponible capacidades de tool calling, agentes, audio ni thinking mode (no aplicables a un modelo de difusión de vídeo).

## Casos de uso

- Previsualización de storyboards: a partir de un fotograma clave o ilustración, generar un clip de vídeo de 480P/720P para validar ritmo y encuadre antes de producir la escena final.
- Animación de ilustraciones y arte conceptual: animar personajes o escenarios estilizados aprovechando el soporte de escenas estilizadas y el control estético por prompt.
- Publicidad y contenido para redes: generar clips cortos a partir de una imagen de producto o de marca, con control de iluminación y tono de color para mantener coherencia visual.
- Prototipado en estudios de animación: convertir keyframes en secuencias animadas preliminares y reducir el coste de iteración frente a la animación manual.
- Enseñanza y divulgación: animar diagramas o ilustraciones científicas para explicar procesos de forma visual.
- Investigación en generación de vídeo: servir como base para experimentos de difusión con MoE, fine-tuning o evaluación comparativa frente a otros modelos I2V open source.
- Postproducción y VFX: generar placas animadas o extensiones de plano a partir de un frame de referencia para composición posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card afirma de forma cualitativa que la familia Wan2.2 alcanza "TOP performance among all open-sourced and closed-sourced models", pero no se incluyen cifras concretas (FVD, VBench u otras métricas) en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. El repositorio pesa 126,2 GB en safetensors, lo que orienta a despliegues en GPUs de datacenter o configuraciones multi-GPU.
- GPU recomendadas: no especificadas para el I2V-A14B. La model card menciona que el modelo TI2V-5B de la familia puede ejecutarse en GPUs de consumo como la RTX 4090; para el A14B se documenta inferencia multi-GPU.
- ¿Cabe en GPU de consumo? No confirmado para el A14B; el modelo de 5B de la familia sí se indica como apto para 4090.
- Opciones de despliegue: código de inferencia oficial del repositorio Wan2.2 (multi-GPU), Diffusers (pipeline image-to-video) y ComfyUI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto/resolución | Licencia | Disponibilidad |
|---|---|---|---|---|
| Wan2.2-I2V-A14B (este repo) | 14B (MoE) | 480P y 720P, I2V | Apache 2.0 | Hugging Face, ModelScope, Diffusers, ComfyUI |
| Wan2.2-I2V-A14B (Wan-AI oficial) | 14B (MoE) | 480P y 720P, I2V | Apache 2.0 | Hugging Face, ModelScope, Diffusers, ComfyUI |
| Wan2.2-TI2V-5B | 5B | 720P a 24 fps, T2V + I2V, VAE 16×16×4 | Apache 2.0 | Hugging Face, ModelScope, Diffusers, ComfyUI |
| Wan2.2-T2V-A14B | 14B (MoE) | 480P y 720P, T2V | Apache 2.0 | Hugging Face, ModelScope, Diffusers, ComfyUI |

No se dispone en la información proporcionada de datos de benchmarks que permitan comparar el rendimiento cuantitativo frente a alternativas de otros desarrolladores.

## Limitaciones y advertencias

- Este repositorio es una redistribución por el usuario Icloud88 (0 descargas, 1 like en el momento de la consulta); para producción conviene verificar la integridad de los pesos frente al repositorio oficial de Wan-AI.
- Riesgo de artefactos y alucinaciones visuales inherente a los modelos de difusión de vídeo: incoherencias temporales, deformaciones anatómicas o físicas no realistas.
- Sesgos de los datos de entrenamiento no documentados en la información disponible; el control estético por prompt puede heredar sesgos culturales o de estilo.
- Idiomas de prompt limitados a inglés y chino; el rendimiento con prompts en castellano no está garantizado.
- La licencia Apache 2.0 permite uso comercial, pero deben respetarse las condiciones de atribución y las de las dependencias (torch, flash_attn, Diffusers).
- Requisitos de hardware elevados (repo de 126,2 GB); el despliegue en una sola GPU de consumo no está confirmado para el A14B.
- No se documentan límites de duración de vídeo, resolución máxima más allá de 720P ni restricciones de contenido en la información disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Icloud88/Wan2.2-I2V-A14B
- Repositorio oficial I2V-A14B (Wan-AI): https://huggingface.co/Wan-AI/Wan2.2-I2V-A14B
- Versión Diffusers I2V-A14B: https://huggingface.co/Wan-AI/Wan2.2-I2V-A14B-Diffusers
- Repositorio oficial T2V-A14B: https://huggingface.co/Wan-AI/Wan2.2-T2V-A14B
- Repositorio oficial TI2V-5B: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
- Versión Diffusers TI2V-5B: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B-Diffusers
- GitHub: https://github.com/Wan-Video/Wan2.2
- Informe técnico (arXiv): https://arxiv.org/abs/2503.20314
- Blog: https://wan.video/welcome
- Sitio web: https://wan.video
- Hugging Face organización Wan-AI: https://huggingface.co/Wan-AI/
- ModelScope: https://modelscope.cn/organization/Wan-AI
- Discord: https://discord.gg/AKNgpMK4Yj
- Documentación ComfyUI (EN): https://docs.comfy.org/tutorials/video/wan/wan2_2
- Documentación ComfyUI (CN): https://docs.comfy.org/zh-CN/tutorials/video/wan/wan2_2
