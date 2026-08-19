# BennyDaBall/PiD-1.5-qwenimage-nvfp4-comfy

## Resumen

Este modelo es una cuantización NVFP4 del decodificador PiD v1.5 de NVIDIA, específicamente diseñado para la familia de latents qwen-image. PiD (Pixel Diffusion Decoder) es un decodificador de difusión de píxeles de 4 pasos que sustituye al decodificador VAE tradicional, devolviendo 4 veces la resolución del latent de entrada. La versión cuantizada reduce el tamaño del archivo de 2,61 GB a 1,09 GB (42 % del original) y es compatible con ComfyUI directamente mediante `UNETLoader`, sin necesidad de cargadores personalizados ni parches del núcleo. Es el primer decodificador PiD cuantizado publicado en HuggingFace.

El desarrollo corre a cargo de BennyDaBall, que ha realizado la conversión y validación sobre el modelo base `nvidia/PiD` v1.5 (qwenimage) y el repackage de Comfy-Org/PixelDiT. La licencia es NSCLv1, que restringe el uso a fines no comerciales de investigación y evaluación. El modelo se distribuye como archivo único (diffusion-single-file) y está pensado para integrarse en flujos de trabajo de ComfyUI, con soporte opcional para decodificación por teselas mediante el nodo ComfyUI-Latent-Tiled-PiD.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decodificador de difusion de pixeles (Pixel Diffusion) de 4 pasos, basado en PiD v1.5 |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (modelo de imagen, no texto) |
| Tipos de cuantizacion | NVFP4 (grupo 16), capas criticas en bf16 |
| Idiomas soportados | no disponible |
| Licencia | NSCLv1 (no comercial, investigacion/evaluacion) |
| Formato de pesos | safetensors (diffusion-single-file) |

## Arquitectura y entrenamiento

PiD es un decodificador de difusion de pixeles desarrollado por NVIDIA que reemplaza el VAE decode en modelos de difusion latente. En su version 1.5 para qwen-image, realiza una decodificacion en 4 pasos que multiplica por 4 la resolucion del latent de entrada. La cuantizacion NVFP4 (formato de punto flotante de 4 bits de NVIDIA) con grupo 16 reduce el tamano del modelo al 42 % del original bf16, manteniendo las capas criticas en bf16 para preservar la calidad. El modelo se distribuye como archivo unico para ComfyUI, compatible con `UNETLoader` sin modificaciones adicionales. No se dispone de informacion detallada sobre el entrenamiento original de PiD (datos, numero de tokens, tecnicas de alineamiento) mas alla de la referencia al paper (arXiv:2605.23902).

## Capacidades

- Decodificacion de latents de la familia qwen-image a imagenes de alta resolucion, con un factor de aumento de 4x respecto al latent.
- Reemplazo directo del VAE decode en pipelines de difusion, mejorando la nitidez en caras, texto y bokeh (segun ejemplos visuales del autor).
- Generacion de imagenes de hasta 33 megapixeles (7680×4352) cuando se combina con el nodo de teselas ComfyUI-Latent-Tiled-PiD.
- Inferencia rapida: 16 segundos para decodificar una imagen de 33 MP en una GPU RTX 5090 (frente a 20 segundos en bf16).
- Compatibilidad con ComfyUI ≥ 0.32 sin cargadores personalizados ni parches del nucleo.
- No requiere hardware Blackwell especifico; funciona en cualquier GPU que ejecute PiD bf16.

## Casos de uso

- Superresolucion de imagenes generadas por modelos qwen-image: el decodificador PiD permite aumentar la resolucion de latents de baja resolucion a imagenes de alta calidad, util para fotografia de stock o impresion de gran formato.
- Postprocesado en pipelines de generacion de imagenes: sustituir el VAE decode estandar por PiD mejora el detalle en elementos criticos como rostros, texto y fondos desenfocados, como se muestra en las comparativas del autor.
- Generacion de imagenes de gran formato para produccion audiovisual: con el nodo de teselas se pueden obtener imagenes de 33 MP, adecuadas para carteles, fondos de pantalla o arte digital de gran tamano.
- Integracion en flujos de trabajo de ComfyUI: al ser un archivo unico compatible con `UNETLoader`, se puede incorporar facilmente en nodos existentes sin modificar el codigo.
- Investigacion en decodificadores de difusion: la cuantizacion NVFP4 permite estudiar el impacto de la cuantizacion en la calidad de decodificacion de modelos de difusion.
- Evaluacion de modelos de imagen en entornos con recursos limitados: la reduccion de tamano (1,09 GB frente a 2,61 GB) facilita su uso en GPUs con menos memoria, manteniendo una calidad visual aceptable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks formales en la informacion disponible. La model card menciona tiempos de inferencia anecdoticos: 16 segundos en RTX 5090 para una imagen de 33 MP (frente a 20 segundos en bf16), pero no se proporcionan metricas objetivas como FID, LPIPS o PSNR. Se recomienda consultar el paper de PiD (arXiv:2605.23902) para benchmarks del modelo original.

## Requisitos de hardware

- VRAM estimada: no disponible oficialmente, pero al ser un archivo de 1,09 GB, se puede inferir que requiere menos memoria que la version bf16 (2,61 GB). Se recomienda al menos 4 GB de VRAM para uso basico.
- GPU recomendadas: cualquier GPU que ejecute PiD bf16, incluyendo RTX 3090, RTX 4090, A100, etc. La model card menciona una RTX 5090 para pruebas.
- Compatible con consumer GPUs: si, siempre que tengan suficiente VRAM para el modelo y el pipeline completo.
- Opciones de despliegue: ComfyUI (version ≥ 0.32) con `UNETLoader`, y el nodo opcional ComfyUI-Latent-Tiled-PiD para decodificaciones grandes.
- Latencia: 16 s para 33 MP en RTX 5090 (segun el autor), aproximadamente 20 s en bf16.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la misma categoria (decodificadores de difusion cuantizados). El modelo original `nvidia/PiD` en bf16 es la referencia principal, pero no hay datos de otros decodificadores cuantizados. Se podria comparar con el VAE estandar de qwen-image, pero no se proporcionan metricas en la informacion disponible.

## Limitaciones y advertencias

- Licencia NSCLv1: uso exclusivamente no comercial, solo para investigacion y evaluacion. No se permite uso en produccion comercial.
- Solo compatible con latents de la familia qwen-image. No funciona con otros tipos de latents (por ejemplo, FLUX.2, aunque el autor menciona que el build para FLUX.2 esta en desarrollo).
- La cuantizacion NVFP4 puede introducir ligeras perdidas de calidad en comparacion con bf16, aunque el autor muestra ejemplos visuales que indican que se conserva el detalle.
- El modelo no incluye el text encoder (`gemma_2_2b_it_elm_bf16.safetensors`) que debe descargarse por separado desde Comfy-Org/PixelDiT.
- No se han publicado metricas objetivas de rendimiento (PSNR, SSIM, etc.) para esta version cuantizada.
- El autor advierte que el decodificador PiD "colapsa" mas alla de su rango de entrenamiento, por lo que se recomienda usar el nodo de teselas para imagenes grandes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/BennyDaBall/PiD-1.5-qwenimage-nvfp4-comfy
- Modelo base nvidia/PiD: https://huggingface.co/nvidia/PiD
- Repackage de Comfy-Org/PixelDiT: https://huggingface.co/Comfy-Org/PixelDiT
- Paper de PiD: https://arxiv.org/abs/2605.23902
- Repositorio ComfyUI-Latent-Tiled-PiD: https://github.com/BennyDaBall930/ComfyUI-Latent-Tiled-PiD
- Comfy Registry del autor: https://registry.comfy.org/publishers/bennydaball
