# aji3-creator/Wan2.1-VAE-upscale2x

## Resumen

El modelo `Wan2.1-VAE-upscale2x` es un finetune del decoder del VAE de Wan2.1 (el modelo de vídeo de Alibaba) que integra un factor de upscaling 2x directamente en la etapa de decodificación. En lugar de generar una imagen a la resolución nativa del VAE y luego pasarla por un upscaler externo, el decoder expande la salida a 12 canales y aplica un *pixel shuffle* final, produciendo directamente una imagen con el doble de resolución. El objetivo principal es eliminar los artefactos de *speckle* y grano que produce el decoder original de Wan, además de mejorar la calidad de detalles finos como piel y cabello.

El modelo está desarrollado por aji3-creator (publicado también como spacepxl) y se basa en el VAE de Wan2.1, manteniendo el encoder congelado para preservar el espacio latente. Está entrenado casi exclusivamente con imágenes reales, por lo que es compatible con cualquier modelo que use el mismo espacio latente, incluyendo Wan y Qwen. La licencia es Apache 2.0, lo que permite uso comercial y modificación. Aunque la versión publicada solo soporta imágenes, el autor planea una versión para vídeo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VAE (decoder-only finetune) con upscale 2x integrado |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, fp32/fp16) |
| Idiomas soportados | no aplica |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (diffusers) |

## Arquitectura y entrenamiento

La arquitectura parte del VAE preentrenado de Wan2.1. El encoder se mantiene intacto y congelado para no alterar la distribución latente. En el decoder, la última capa Conv3d se reemplaza por una versión que expande los canales de salida de 3 a 12. Durante la inferencia, el decoder produce un tensor de forma `[B, 12, F, H, W]` que se reorganiza mediante un `pixel_shuffle` con factor 2, obteniendo un vídeo o imagen con el doble de resolución espacial. El entrenamiento se realizó en imágenes a resolución base 256 (upscaled a 512) con batch de 4 y 300k pasos, usando una combinación de pérdidas L1, LPIPS, FDL (Frequency Distribution Loss) y GAN (patchGAN con LSGAN no saturante).

Una innovación clave es la degradación latente: durante el entrenamiento se aplicó ruido y perturbaciones a los latents reales para simular los latents generados por el modelo de difusión, que tienden a tener un sesgo de baja frecuencia. Esto mejora la robustez del decoder frente a latents generados por el flujo de difusión, no solo reconstruye los del encoder real.

## Capacidades

- Decodificación de latents de Wan2.1 y Qwen (espacio latente compartido) con salida a 2x de resolución.
- Eliminación de artefactos de *speckle* y grano que aparecen con el VAE original de Wan2.1.
- Mejora perceptiva de piel, textura y cabello en imágenes realistas.
- Compatible con flujos de *highres fix* sin necesidad de upscaler externo.
- Posibilidad de obtener imagen a resolución original aplicando un ligero blur y downsample, con calidad superior al decoder original.
- Integración directa con la librería `diffusers` mediante `AutoencoderKLWan` y con ComfyUI a través de nodos personalizados.

## Casos de uso

- **Alta resolución en generación de vídeo con Wan2.1**: el decoder 2x permite generar vídeos a 1280x720 o 1440x1440 directamente desde latents de menor resolución, evitando la pérdida de calidad de un upscale posterior.
- **Pipeline de *highres fix* en ComfyUI**: se puede usar como reemplazo del decoder estándar en flujos de generación iterativa, obteniendo un resultado con más detalle sin añadir pasos extra.
- **Mejora de textura en imágenes fotorrealistas**: para proyectos de fotografía generativa o restauración, el decoder produce piel y cabello más definidos que el VAE original.
- **Preprocesamiento para modelos de vídeo**: al decodificar latents de vídeo a mayor resolución, se puede usar como paso intermedio antes de aplicar *frame interpolation* o *upscale* temporal.
- **Reducción de artefactos en modelos destilados**: modelos destilados con técnicas tipo DMD2 (lightning) generan latents con mejor alta frecuencia; este VAE aprovecha esa mejora y la amplifica en la decodificación.
- **Aplicación como upscaler de propósito general**: dado que el decoder acepta cualquier latente de Wan/Qwen, se puede usar para duplicar la resolución de imágenes generadas por otros modelos que compartan espacio latente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor declara explícitamente que no usó métricas como PSNR/SSIM/LPIPS porque se centró en la calidad perceptual humana, que considera que estas métricas no alinean bien con la preferencia subjetiva. No se proporcionan valores numéricos de rendimiento ni comparaciones cuantitativas con el VAE original.

## Requisitos de hardware

- El tamaño del repositorio es de 1.0 GB, lo que sugiere pesos del VAE en fp32 o fp16. La VRAM necesaria para inferencia es reducida, estimada en menos de 2 GB para un solo lote en fp16.
- Cabe en cualquier GPU consumer moderna: RTX 3060, RTX 3090, RTX 4090, etc. El autor entrenó el modelo en una sola RTX 5090, pero la inferencia es mucho más ligera.
- Se puede desplegar con la librería `diffusers` (pipeline de `AutoencoderKLWan`) o en ComfyUI con los nodos de `ComfyUI-VAE-Utils`.
- La latencia de decodificación es muy baja comparada con el modelo de difusión principal; el coste computacional del decoder 2x es prácticamente el mismo que el del decoder original.

## Comparativa con modelos similares

| Modelo | Tipo | Resolución de salida | Artefactos | Licencia | Formato |
|---|---|---|---|---|---|
| Wan2.1-VAE-upscale2x (este) | Decoder finetune | 2x de la entrada | Sin speckles, posible oversharpening | Apache 2.0 | safetensors |
| Wan2.1 VAE original | VAE base | 1x de la entrada | Speckles y grano visibles | Apache 2.0 | safetensors |
| VAE de Qwen2-VL | VAE de imagen | 1x | Depende del entrenamiento | Apache 2.0 | safetensors |

No hay comparativas con otros upscalers basados en VAE, ya que es un enfoque poco común. La ventaja principal frente a usar un upscaler externo (como Real-ESRGAN) es que el upscale se realiza directamente en el espacio latente, evitando la pérdida de coherencia temporal en vídeo y la sobrecarga de cómputo de un modelo adicional.

## Limitaciones y advertencias

- Entrenado casi exclusivamente con imágenes reales; puede producir resultados deficientes con anime, lineart y texto, donde el decoder original puede ser más fiable.
- Puede introducir cambios de color ligeros o un exceso de nitidez en algunas imágenes, aunque se puede mitigar con un blur y ajuste de color.
- No está entrenado para vídeo en esta versión; la versión de vídeo está planeada pero no publicada.
- Al ser un finetune del decoder, no es compatible con otros espacios latentes que no sean los de Wan2.1 o Qwen3.
- El autor no ha publicado métricas de calidad objetiva, por lo que la evaluación se basa en apreciación subjetiva y comparaciones visuales.
- Aunque la licencia es Apache 2.0, el modelo base (Wan2.1) tiene su propia licencia que puede imponer restricciones adicionales en uso comercial.

## Enlaces

- Modelo en HuggingFace (aji3-creator): https://huggingface.co/aji3-creator/Wan2.1-VAE-upscale2x
- Modelo en HuggingFace (spacepxl): https://huggingface.co/spacepxl/Wan2.1-VAE-upscale2x
- Repositorio de Wan2.1 (oficial): https://github.com/Wan-Video/Wan2.1
- Nodos de ComfyUI para VAE: https://github.com/spacepxl/ComfyUI-VAE-Utils
- Comparaciones visuales en Slowpics: https://slow.pics/s/9kxYpyxB y https://slow.pics/s/Gk1F5dHo
