# emee-ai/SeedVR2_comfyUI

## Resumen

SeedVR2_comfyUI es un empaquetado del modelo de restauración y escalado de vídeo SeedVR2 desarrollado por ByteDance, adaptado por el usuario emee-ai para su uso en ComfyUI y como CLI independiente con soporte multi-GPU. El modelo base es SeedVR2, un modelo de difusión de tipo DiT (Diffusion Transformer) especializado en tareas de video-to-video, concretamente restauración y upscaling de vídeo e imagen. Se distribuye en dos variantes de tamaño, 3B y 7B parámetros, y este repositorio concreto empaqueta ambas.

El problema que resuelve es la restauración genérica de vídeo de baja calidad: eliminación de artefactos de compresión, ruido, desenfoque y reducción de resolución, con salida a resoluciones superiores manteniendo coherencia temporal entre fotogramas. Frente a upscalers tradicionales basados en convoluciones o GAN, SeedVR2 emplea un transformer de difusión que modela dependencias temporales de forma explícita, lo que reduce el parpadeo y las inconsistencias entre frames.

Su relevancia actual radica en que es una de las pocas alternativas open source (licencia Apache 2.0) para restauración de vídeo de alta calidad con pesos abiertos, integrable en flujos de trabajo de ComfyUI y desplegable en configuraciones de consumo mediante técnicas de tiling, block swap y compilación con torch.compile. El repositorio ocupa 60,1 GB, lo que refleja que incluye pesos de ambas variantes y posiblemente checkpoints auxiliares.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) con VAE, pipeline video-to-video |
| Parámetros totales | 3B y 7B (dos variantes incluidas) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible (modelo de vídeo, no de texto) |
| Tipos de cuantización | no disponible (se menciona uso nativo en bfloat16) |
| Idiomas soportados | no disponible (modelo visual, no lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (repo de 60,1 GB, compatible con diffusers) |

## Arquitectura y entrenamiento

SeedVR2 se basa en una arquitectura de Diffusion Transformer (DiT) combinada con un VAE para la codificación y decodificación del espacio latente visual. El pipeline es video-to-video: recibe una secuencia de fotogramas de baja calidad y genera una versión restaurada y escalada. El wrapper de ComfyUI separa el modelo DiT del VAE en nodos independientes, lo que permite control granular sobre la carga y la memoria. Se menciona soporte para RGBA con procesamiento del canal alfa mediante escalado guiado por bordes, y un enfoque de padding sin pérdida que permite escalar a cualquier resolución divisible por 2.

En cuanto al entrenamiento, la información disponible no detalla el número de tokens, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. La model card se centra en aspectos de despliegue e integración (ComfyUI, CLI, multi-GPU) más que en la descripción del proceso de entrenamiento. Las innovaciones técnicas destacadas en el wrapper incluyen streaming de memoria para evitar picos de VRAM independientemente de la longitud del vídeo, block swap adaptativo, tiling de VAE con offload de tensores, compilación completa con torch.compile (20-40 % de aceleración en el DiT y 15-25 % en el VAE), corrección de color perceptual en espacio LAB, mezcla temporal con ventana de Hann y generación determinista basada en semilla con estrategia de seeding por fases.

## Capacidades

- Restauración y upscaling de vídeo: eliminación de artefactos de compresión, ruido y desenfoque, con salida a resolución superior.
- Upscaling de imagen individual: soporte directo sin necesidad de convertir a vídeo.
- Coherencia temporal: mezcla con ventana de Hann y solapamiento temporal para reducir parpadeo entre fotogramas.
- Procesamiento de canal alfa (RGBA) con escalado guiado por bordes para transparencias limpias.
- Corrección de color: métodos LAB (por defecto), coincidencia de saturación HSV, wavelet adaptativo e híbrido.
- Procesamiento por lotes de directorios completos de vídeos e imágenes con caché de modelos.
- Despliegue multi-GPU con distribución de carga y mezcla por solapamiento temporal.
- Generación determinista y reproducible mediante semilla.
- Integración en ComfyUI mediante arquitectura modular de cuatro nodos (DiT, VAE, torch.compile y upscaler principal).
- No dispone de tool calling, agentes, razonamiento textual ni capacidades multilingües al no ser un modelo de lenguaje.

## Casos de uso

- Restauración de archivo audiovisual: digitalización de material antiguo o degradado, eliminando ruido y artefactos de compresión y escalando a resoluciones modernas con coherencia temporal entre fotogramas.
- Remasterización de vídeo para publicación: mejora de metraje de baja resolución (por ejemplo, 480p o 720p) a 1080p o 4K antes de subirlo a plataformas, aprovechando el padding sin pérdida para resoluciones arbitrarias divisibles por 2.
- Postproducción en ComfyUI: integración como nodo dentro de flujos de trabajo existentes de generación o edición de vídeo, usando la caché global de modelos para evitar recargas entre instancias del upscaler.
- Procesamiento por lotes de bibliotecas de vídeo: uso del CLI en modo directorio para restaurar carpetas completas con caché de modelos, adecuado para estudios con grandes volúmenes de material.
- Mejora de vídeo generado por IA: corrección de artefactos y baja resolución en salidas de modelos de generación de vídeo, con corrección de color perceptual para mantener la paleta original.
- Restauración de vídeo con transparencias: tratamiento de metraje con canal alfa (RGBA) en pipelines de motion graphics o VFX, donde el escalado guiado por bordes evita halos en los contornos.
- Despliegue en infraestructura multi-GPU: reparto de la carga entre varias GPU con mezcla por solapamiento temporal para procesar vídeos largos en entornos de servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma numérica. El wrapper incorpora streaming de memoria, block swap adaptativo y tiling de VAE para evitar picos de VRAM, lo que permite procesar vídeos largos con huella de memoria acotada; la VRAM concreta depende de la variante (3B o 7B), la resolución de salida y el tamaño de lote.
- GPU recomendadas: no se especifican modelos concretos en la información disponible. Se menciona compatibilidad con CUDA, AMD ROCm (Windows/Linux) y Apple Silicon MPS (Macs de la serie M).
- GPU de consumo: no se confirma qué modelos concretos son suficientes; la presencia de block swap, tiling y offload sugiere que está diseñado para caber en GPU de consumo, pero no hay cifras publicadas.
- Opciones de despliegue: ComfyUI (con soporte de ComfyUI Manager), CLI independiente con soporte multi-GPU, y librería diffusers como base.
- Aceleración: torch.compile con compilación de grafo completo, con mejoras declaradas del 20-40 % en el DiT y del 15-25 % en el VAE.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|
| SeedVR2 (3B/7B) | 3B y 7B | Restauración y upscaling de vídeo | Apache 2.0 | Pesos abiertos en Hugging Face, integración ComfyUI |
| Otros modelos de restauración de vídeo open source | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos sobre modelos alternativos comparables (parámetros, contexto, rendimiento o licencia) que permitan una comparación cuantitativa fiable.

## Limitaciones y advertencias

- La model card del wrapper no documenta sesgos del modelo base; al ser un modelo visual, los sesgos potenciales se relacionan con el dataset de entrenamiento (no detallado) y podrían afectar a la fidelidad en rostros, textos o patrones finos.
- Riesgo de alucinación visual: como modelo generativo de difusión, puede inventar detalle inexistente en zonas de baja información, especialmente en ampliaciones agresivas.
- No es un modelo de lenguaje: no soporta texto, tool calling, agentes ni capacidades multilingües; la fila de idiomas no aplica.
- La versión 2.5.0 introdujo un cambio incompatible que obliga a recrear los flujos de trabajo de ComfyUI; los nodos y parámetros del CLI fueron rediseñados.
- El repositorio ocupa 60,1 GB, lo que implica requisitos de almacenamiento y tiempos de descarga considerables.
- La licencia Apache 2.0 permite uso comercial, pero debe verificarse la licencia y condiciones del modelo base original de ByteDance para confirmar que no añade restricciones adicionales.
- El autor del empaquetado (emee-ai) no es el desarrollador original; la calidad y el mantenimiento del wrapper dependen de un tercero, aunque el código fuente está en el repositorio de GitHub de numz.
- El rendimiento en GPU de consumo no está cuantificado; conviene validar la VRAM necesaria en el hardware objetivo antes de producción.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/emee-ai/SeedVR2_comfyUI
- Código del wrapper para ComfyUI: https://github.com/numz/ComfyUI-SeedVR2_VideoUpscaler
- Repositorio oficial de SeedVR de ByteDance: https://github.com/ByteDance-Seed/SeedVR
- Modelo base en Hugging Face: https://huggingface.co/ByteDance-Seed/SeedVR2-3B
- Modelo base en Hugging Face (7B): https://huggingface.co/ByteDance-Seed/SeedVR2-7B
- Tutorial en vídeo (SeedVR2 v2.5): https://youtu.be/MBtWYXq_r60
- Issues del proyecto: https://github.com/numz/ComfyUI-SeedVR2_VideoUpscaler/issues
- Discussions del proyecto: https://github.com/numz/ComfyUI-SeedVR2_VideoUpscaler/discussions
