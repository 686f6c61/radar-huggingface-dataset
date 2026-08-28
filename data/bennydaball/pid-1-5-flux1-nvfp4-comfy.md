# BennyDaBall/PiD-1.5-flux1-nvfp4-comfy

## Resumen

PiD-1.5-flux1-nvfp4-comfy es una cuantización NVFP4 del decoder de difusión de píxeles PiD v1.5 de NVIDIA, adaptada para su uso directo en ComfyUI mediante un `UNETLoader` estándar. El modelo original, desarrollado por NVIDIA, reformula la decodificación de latents a píxeles como un proceso de difusión condicional en espacio de píxeles, unificando la decodificación y el upscaling en un solo módulo generativo. Esta versión concreta está pensada para la familia de latents FLUX.1 (FLUX.1 dev/schnell y Z-Image-Turbo, 16 canales) y ofrece una resolución 4× superior a la entrada, reemplazando por completo el decode VAE.

La conversión, realizada por BennyDaBall, reduce el peso del modelo de 2,61 GB (bf16) a 1,84 GB en NVFP4 con cuantización por grupos de 16, manteniendo las capas críticas para la calidad en bf16. Según el autor, la salida es prácticamente idéntica a la versión bf16 a zoom del 100 %, y la inferencia es algo más rápida. No requiere hardware especializado: funciona en cualquier GPU que ejecute la versión bf16 original. La licencia NSCLv1 restringe su uso a fines no comerciales de investigación y evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pixel diffusion decoder (modelo de difusión condicional en espacio de píxeles, basado en PixelDiT) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no procesa texto) |
| Tipos de cuantizacion | NVFP4 (grupo 16), capas críticas en bf16 |
| Idiomas soportados | no disponible |
| Licencia | NSCLv1 (no comercial, investigación y evaluación) |
| Formato de pesos | safetensors (diffusion-single-file) |

## Arquitectura y entrenamiento

PiD (Pixel Diffusion Decoder) reformula el decoder latente-a-píxel como un modelo de difusión condicional en espacio de píxeles. En lugar de un VAE o RAE convencional, el modelo denoisa directamente en el espacio de píxeles de alta resolución, unificando la decodificación y el upsampling en un único paso generativo. La versión v1.5 está destilada para funcionar en 4 pasos de muestreo, lo que reduce drásticamente el coste computacional frente a los decoders de difusión tradicionales.

Esta variante concreta es una cuantización NVFP4 (grupo 16) del modelo bf16 original, realizada por BennyDaBall. El proceso de cuantización mantiene en bf16 las capas que más influyen en la calidad percibida, lo que explica que el archivo resultante (1,84 GB) sea mayor que el de otras familias (como qwenimage o flux2, que pesan 1,09 GB). Según el autor, la familia FLUX.1 concentra más calidad en un número reducido de capas, por lo que se conservan más en alta precisión. El modelo se distribuye como archivo único para ComfyUI, listo para cargar con un `UNETLoader` estándar.

## Capacidades

- Decodificación de latents FLUX.1 de 16 canales a imágenes de alta resolución, con un factor de ampliación de 4× en una sola pasada.
- Super-resolución: de 1024×1024 a 4096×4096 en modo de disparo único, o hasta 7680×4352 usando el flujo de trabajo con tiles.
- Reemplazo completo del decode VAE en pipelines de ComfyUI, sin necesidad de nodos personalizados ni parches del núcleo.
- Compatible con FLUX.1 dev, FLUX.1 schnell y Z-Image-Turbo como modelos de primera etapa (stage-1).
- Inferencia en 4 pasos gracias a la destilación, con tiempos de decode inferiores a los del bf16 original.
- Integración con el nodo `PiDConditioning` y el sampler de sigmas destiladas incluidos en ComfyUI.
- Requiere el text encoder `gemma_2_2b_it_elm_bf16.safetensors` (CLIPLoader tipo `pixeldit`) para la generación condicionada.

## Casos de uso

- Generación de imágenes de alta resolución con FLUX.1: sustituir el VAE por PiD permite obtener directamente imágenes 4× más grandes que la salida del stage-1, por ejemplo 4096×4096 a partir de 1024×1024, sin pasos adicionales de upscaling.
- Upscaling de imágenes existentes: dado un latent de FLUX.1 de baja resolución, PiD lo decodifica a píxeles de alta resolución con calidad superior a la interpolación clásica, útil para ampliar imágenes generadas o fotografías.
- Producción de contenido visual para investigación: generar imágenes de gran formato para estudios de percepción, análisis de calidad o entrenamiento de otros modelos, siempre dentro del ámbito no comercial que permite la licencia.
- Flujos de trabajo automatizados en ComfyUI: al ser un archivo único que se carga con un `UNETLoader` estándar, se puede integrar en pipelines existentes sin modificar el grafo de nodos, ideal para entornos de producción de imágenes en lote.
- Generación de imágenes de gran tamaño para impresión o señalética: el flujo de trabajo con tiles permite alcanzar resoluciones de 7680×4352 (casi 8K) sin artefactos de costura, adecuado para cartelería o prototipos de diseño.
- Evaluación comparativa de decoders: al estar cuantizado y ser más rápido que el bf16, permite ejecutar pruebas A/B de calidad de decodificación en hardware más modesto, facilitando la investigación en super-resolución por difusión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks formales (PSNR, SSIM, FID, etc.) en la informacion disponible. El autor reporta en redes sociales una medición anecdótica en una RTX 5090: decodificación de una imagen maestra de 33 megapíxeles en 16 segundos con la versión NVFP4, frente a 20 segundos con la versión bf16. No hay datos comparativos con otros decoders ni métricas objetivas de calidad.

## Requisitos de hardware

- VRAM estimada: no disponible. El archivo del modelo pesa 1,84 GB, pero hay que sumar el text encoder (gemma 2 2B) y el VAE auxiliar (`pixel_space_vae.safetensors`), además de la memoria necesaria para los tensores de activación en resoluciones altas.
- GPU recomendadas: cualquier GPU que ejecute la versión bf16 de PiD. El autor ha validado el funcionamiento en una RTX 5090, pero no indica requisitos mínimos.
- Compatibilidad con GPU de consumo: sí, siempre que la GPU tenga suficiente VRAM para la resolución de salida deseada. Para 4096×4096 se recomienda una GPU con al menos 16 GB de VRAM, aunque no se ha confirmado oficialmente.
- Opciones de despliegue: ComfyUI (versión 0.32 o superior), usando un `UNETLoader` estándar. No se menciona soporte para vLLM, llama.cpp u otros motores.
- Latencia y throughput: en una RTX 5090, el decode de 33 MP tarda 16 segundos (frente a 20 del bf16). No hay datos para otras GPUs.

## Comparativa con modelos similares

| Modelo | Tamaño | Cuantización | Familia de latents | Uso en ComfyUI | Licencia |
|---|---|---|---|---|---|
| PiD-1.5-flux1-nvfp4-comfy (este) | 1,84 GB | NVFP4 (grupo 16) | FLUX.1 (dev/schnell, Z-Image) | UNETLoader estándar | NSCLv1 |
| PiD-1.5-flux2-nvfp4-comfy | 1,09 GB | NVFP4 (grupo 16) | FLUX.2 | UNETLoader estándar | NSCLv1 |
| PiD-1.5-qwenimage-nvfp4-comfy | 1,09 GB | NVFP4 (grupo 16) | Qwen-Image | UNETLoader estándar | NSCLv1 |
| PiD v1.5 bf16 (original) | 2,61 GB | bf16 | FLUX.1, FLUX.2, Qwen-Image | UNETLoader estándar | NSCLv1 |

La comparativa se limita a las variantes del mismo decoder, ya que no hay datos suficientes para comparar con otros decoders de difusión (como los VAE mejorados o los RAE). La versión flux1 es la más pesada de las cuantizadas porque conserva más capas en bf16, a cambio de una fidelidad visual mayor según el autor.

## Limitaciones y advertencias

- Licencia NSCLv1: uso exclusivamente no comercial, limitado a investigación y evaluación. No se permite su uso en productos o servicios comerciales, ni la redistribución de derivados sin cumplir los términos de la licencia original de NVIDIA.
- Resolución máxima en modo de disparo único: el autor advierte que el envolvente de FLUX.1 es más estricto que el de otras familias; se recomienda mantener la salida en 4096 píxeles en el lado largo y usar una entrada de aproximadamente 1 megapíxel, preferiblemente cuadrada. Para formatos panorámicos o resoluciones mayores, es obligatorio usar el flujo de trabajo con tiles.
- Dependencia de componentes externos: requiere el text encoder `gemma_2_2b_it_elm_bf16.safetensors` y el VAE `pixel_space_vae.safetensors`, que deben descargarse por separado desde el repositorio de Comfy-Org/PixelDiT.
- Riesgo de alucinación visual: al ser un modelo generativo, puede inventar detalles finos (texto, rostros, texturas) en las zonas ampliadas, especialmente si la entrada es de baja calidad o contiene artefactos.
- Sin garantías de rendimiento en hardware no validado: el autor solo ha probado el modelo en una RTX 5090; no se han publicado pruebas en otras GPUs ni en configuraciones con menos VRAM.
- Fecha de creación futura: el modelo fue subido en agosto de 2026, lo que puede indicar que es una versión muy reciente o que la fecha es incorrecta; se recomienda verificar la vigencia de la documentación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BennyDaBall/PiD-1.5-flux1-nvfp4-comfy
- Modelo original de NVIDIA: https://huggingface.co/nvidia/PiD
- Paper de PiD: https://arxiv.org/abs/2605.23902
- Repositorio oficial de NVIDIA: https://github.com/nv-tlabs/PiD
- Nodo ComfyUI para PiD (Merserk): https://github.com/Merserk/ComfyUI-PiD
- Nodo de tiles para PiD (BennyDaBall): https://github.com/BennyDaBall930/ComfyUI-Latent-Tiled-PiD
- Variante FLUX.2 cuantizada: https://huggingface.co/BennyDaBall/PiD-1.5-flux2-nvfp4-comfy
- Variante Qwen-Image cuantizada: https://huggingface.co/BennyDaBall/PiD-1.5-qwenimage-nvfp4-comfy
