# b-rosel/PiD_upscaler_image_restoration_tutorial_video

## Resumen

PiD (Pixel Diffusion Decoder) es un modelo de super-resolución y restauración de imágenes desarrollado por NVIDIA Research. Reformula el decodificador latente-a-píxel de los modelos de difusión como un modelo de difusión condicional en espacio de píxeles, unificando la decodificación y el upsampling en un único módulo generativo. Esto permite obtener imágenes super-resueltas de alta resolución (hasta 4K) en un solo paso, sin necesidad de etapas separadas de decodificación y escalado.

El repositorio aloja los checkpoints destilados del decodificador PiD (4 pasos) junto con los pesos de los codificadores/decodificadores VAE necesarios para cada backbone compatible. Se ofrecen variantes para Flux1-dev, Flux2-dev, SD3 medium, DINOv2+RAE y SigLIP+Scale-RAE, con factores de aumento de 4× y 8×. La licencia es NSCLv1, de uso exclusivamente no comercial (investigación o evaluación). El modelo está pensado para integrarse en pipelines de image-to-image y su uso principal es el upscaling de imágenes de baja resolución a resoluciones de 2K o 4K.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decodificador de difusión en espacio de píxeles (Pixel Diffusion Decoder) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de imagen) |
| Licencia | NSCLv1 (uso no comercial, solo investigación/evaluación) |
| Formato de pesos | safetensors, .pth (bfloat16, EMA) |

## Arquitectura y entrenamiento

PiD es un decodificador de píxeles que condiciona el proceso de difusión directamente en el espacio de píxeles de alta resolución. En lugar de predecir latentes y luego decodificarlos con un VAE estándar, el modelo denoisa directamente en el espacio de píxeles, combinando la decodificación y el upsampling en un solo paso generativo. Esto permite obtener imágenes super-resueltas (2K, 4K) sin artefactos típicos de los decodificadores VAE convencionales.

El entrenamiento se realizó con destilación en 4 pasos, lo que reduce drásticamente el coste de inferencia en comparación con modelos de difusión de muchos pasos. Los checkpoints se entrenaron a resoluciones de 2048 píxeles (variante `2k`) y con bucketing multi-resolución de 2048 a 3840 píxeles (variante `2kto4k`), esta última con un shift dinámico estilo SD3. No se proporcionan detalles sobre el dataset de entrenamiento ni sobre el número de tokens o pasos de optimización.

## Capacidades

- Super-resolución de imágenes: factor 4× (de 512 a 2048 píxeles, o de 1024 a 4096 con la variante `2kto4k`) y factor 8× (de 256 a 2048 píxeles con el backbone SigLIP+Scale-RAE).
- Restauración de imágenes: mejora de detalles y reducción de artefactos en imágenes de baja resolución.
- Compatibilidad con múltiples backbones de codificación: Flux1-dev (VAE de 16 canales), Flux2-dev (VAE de 128 canales con normalización por lotes), SD3 medium (VAE de 16 canales), DINOv2-B + RAE ViT-XL (768 canales) y SigLIP-2 So400M + Scale-RAE ViT-XL (1152 canales).
- Soporte de múltiples relaciones de aspecto en todas las variantes.
- Inferencia rápida gracias a la destilación en 4 pasos.
- Integración con el código oficial de NVIDIA (repositorio `nv-tlabs/pid`) mediante un registro de checkpoints.

## Casos de uso

- Upscaling de imágenes para fotografía profesional: convertir imágenes de 512×512 o 1024×1024 a 2048×2048 o 4096×4096 con alta fidelidad de detalles, útil para impresión de gran formato o retoque fotográfico.
- Restauración de imágenes antiguas o escaneadas: recuperar texturas y bordes en imágenes históricas de baja resolución, mejorando su calidad visual para archivos digitales.
- Mejora de imágenes generadas por IA: los modelos de difusión como Flux o SD3 producen latentes de baja resolución; PiD permite decodificarlos directamente a alta resolución sin pérdida de calidad.
- Preprocesamiento para visión por computadora: aumentar la resolución de imágenes de entrada para mejorar el rendimiento de tareas downstream como detección de objetos, segmentación o reconocimiento facial.
- Creación de contenido para medios: upscaling de fotogramas de vídeo o imágenes de stock para su uso en producción audiovisual, manteniendo consistencia y nitidez.
- Investigación en super-resolución: servir como baseline o componente en estudios comparativos de métodos de upscaling basados en difusión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El repositorio ocupa 26.1 GB en total, incluyendo todos los checkpoints y pesos VAE. Cada checkpoint individual (`.pth`) tiene un tamaño no especificado, pero dada la naturaleza del modelo, se requiere una GPU con gran capacidad de VRAM.
- No se especifican requisitos mínimos de VRAM en la documentación. Para inferencia a 2048 píxeles o superiores, se estima que se necesitan al menos 24 GB de VRAM (p. ej., RTX 3090/4090, A5000) para las variantes más grandes, aunque esto no está confirmado por el autor.
- Se recomienda el uso de GPUs de gama alta (A100, H100) para resoluciones 4K.
- El código de inferencia está disponible en el repositorio oficial de NVIDIA (`nv-tlabs/pid`). No se mencionan integraciones con vLLM, llama.cpp u otras herramientas de despliegue; el uso se realiza mediante scripts de Python del propio repositorio.
- La latencia y el throughput no están documentados; la destilación en 4 pasos sugiere una inferencia relativamente rápida en comparación con modelos de difusión de 20-50 pasos.

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos de super-resolución (p. ej., Real-ESRGAN, SwinIR, Stable Diffusion Upscaler) en la documentación proporcionada. Los datos de rendimiento y arquitectura de estos alternativas no están incluidos en la información disponible, por lo que no se puede establecer una comparación objetiva.

## Limitaciones y advertencias

- Licencia NSCLv1: uso exclusivamente no comercial. Cualquier uso comercial, incluso indirecto, está prohibido. Esto limita su adopción en entornos empresariales.
- El modelo está diseñado para super-resolución; no es un modelo de generación de texto ni de razonamiento multimodal general.
- No se especifican sesgos potenciales en los datos de entrenamiento. Al ser un modelo de difusión, puede amplificar o alucinar detalles finos en imágenes de baja calidad, especialmente en rostros o texturas repetitivas.
- La variante `2kto4k` está pensada para resoluciones de 1024 a 4096 píxeles; usarla fuera de ese rango puede producir resultados subóptimos.
- La documentación no incluye información sobre el dataset de entrenamiento, por lo que se desconoce su cobertura de dominios o posibles limitaciones en ciertos tipos de imágenes (por ejemplo, imágenes médicas o satelitales).
- El repositorio es un snapshot de demostración con un vídeo tutorial; los pesos oficiales están disponibles en el repositorio de NVIDIA (`nvidia/PiD`), y este repo puede no estar mantenido activamente.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/b-rosel/PiD_upscaler_image_restoration_tutorial_video
- Paper (arXiv): https://arxiv.org/abs/2605.23902
- Página del proyecto: https://research.nvidia.com/labs/sil/projects/pid/
- Código oficial (GitHub): https://github.com/nv-tlabs/pid
- Espacio de demostración (Hugging Face Space): https://huggingface.co/spaces/prithivMLmods/PiD-Image-Upscaler
- Repositorio de demostración en GitHub: https://github.com/PRITHIVSAKTHIUR/PiD-Image-Upscaler
