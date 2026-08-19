# BennyDaBall/PiD-1.5-flux2-nvfp4-comfy

## Resumen

PiD-1.5-flux2-nvfp4-comfy es un decodificador de difusión de píxeles (PixelDiT) cuantizado en NVFP4, desarrollado por BennyDaBall como conversión del modelo PiD v1.5 de NVIDIA para la familia de latentes FLUX.2. Este archivo único, preparado para ComfyUI, sustituye el decodificador VAE tradicional y produce una resolución 4 veces superior a partir de latentes de 128 canales, manteniendo la calidad visual del modelo original bf16 en una fracción del tamaño (1.09 GB frente a 2.61 GB).

El modelo está diseñado específicamente para los latentes de FLUX.2 dev y Klein 4B/9B, y se integra directamente en el nodo `UNETLoader` de ComfyUI sin necesidad de cargadores personalizados ni parches del núcleo. Su relevancia actual radica en ofrecer una alternativa ligera y rápida para tareas de super-resolución y upscaling dentro del ecosistema ComfyUI, sin requerir hardware Blackwell ni modificaciones complejas del flujo de trabajo.

La cuantización NVFP4 con grupo 16 conserva las capas críticas para la calidad en bf16, logrando una decodificación más rápida que el original. Se incluyen flujos de trabajo listos para usar que cubren desde un modo simple de un solo paso hasta un modo de mosaico (tiled) para resoluciones extremas de hasta 7680×4352 píxeles.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PixelDiT (diffusion transformer de píxeles), destilado en 4 pasos |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de difusión, no de lenguaje) |
| Tipos de cuantizacion | NVFP4 (grupo 16), capas críticas en bf16 |
| Idiomas soportados | no disponible |
| Licencia | NSCLv1 (no comercial, investigación y evaluación) |
| Formato de pesos | safetensors (archivo único, diffusion-single-file) |

| Parametro adicional | Valor |
|---|---|
| Tamaño del archivo | 1.09 GB (original bf16: 2.61 GB) |
| Modelo base | nvidia/PiD v1.5 (flux2) |
| Text encoder requerido | gemma_2_2b_it_elm_bf16.safetensors (CLIPLoader tipo `pixeldit`) |
| Requisito de ComfyUI | >= 0.32 (probado en 0.33.0) |
| Pipeline | image-to-image |

## Arquitectura y entrenamiento

El modelo es una conversión cuantizada de PiD v1.5, un decodificador de difusión de píxeles desarrollado por NVIDIA que opera directamente sobre latentes de 128 canales de la familia FLUX.2. A diferencia de un VAE convencional, PiD utiliza una arquitectura de diffusion transformer (PixelDiT) que decodifica en 4 pasos, generando una imagen de resolución 4 veces superior a la del latente de entrada. La versión original fue publicada por NVIDIA y posteriormente reempaquetada por Comfy-Org para su uso en ComfyUI.

La cuantización aplicada en esta conversión utiliza NVFP4 con agrupación de 16 elementos, manteniendo en bf16 las capas consideradas críticas para la calidad visual. Esto reduce el tamaño del archivo a un 42% del original y acelera la inferencia, sin cambiar el comportamiento del modelo a nivel de API. No se han publicado detalles adicionales sobre el entrenamiento, como el número de tokens o la composición del dataset, más allá de la destilación en 4 pasos mencionada en la documentación original.

## Capacidades

- Decodificación de latentes FLUX.2 (128 canales) a imágenes de alta resolución con factor 4x.
- Super-resolución de un solo paso: de aproximadamente 1 megapíxel a 5376×3072 píxeles.
- Compatibilidad con FLUX.2 dev y los modelos Klein 4B/9B.
- Integración directa en ComfyUI mediante `UNETLoader`, sin cargadores personalizados.
- Soporte de modo tiled (mosaico) para resoluciones de hasta 7680×4352 píxeles sin costuras, mediante el nodo adicional ComfyUI-Latent-Tiled-PiD.
- Detección automática de latentes FLUX.2 bajo las etiquetas `flux`/`flux2` en los nodos.
- Inferencia más rápida que el archivo bf16 original según la documentación del autor.

## Casos de uso

- Upscaling de imágenes generadas con FLUX.2 para impresión de gran formato: el modelo permite pasar de una imagen de 1 MP a 5376×3072 en un solo paso, adecuado para cartelería o fotografía de alta resolución.
- Producción de contenido visual en estudios creativos: al integrarse en ComfyUI, los artistas pueden combinar la generación de latentes con la decodificación de alta resolución sin cambiar de herramienta.
- Optimización de pipelines de generación de imágenes: al sustituir el VAE decode, se reduce el tiempo de cómputo y el uso de VRAM en comparación con el decodificador bf16.
- Investigación en decodificadores de difusión eficientes: el archivo cuantizado sirve como referencia para estudiar el impacto de NVFP4 en la calidad de salida de modelos PixelDiT.
- Despliegue en hardware con recursos limitados: al no requerir Blackwell y tener un tamaño de archivo reducido, es viable en GPUs de consumo medio que ya ejecutan PiD bf16.
- Flujos de trabajo de mosaico para resoluciones extremas: con el nodo tiled, se pueden generar imágenes de hasta 7680×4352 en una sola cola, útil para entornos de producción que necesitan salidas de 8K.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks cuantitativos en la información disponible. El autor menciona que la versión cuantizada decodifica más rápido que el archivo bf16 original y que las comparaciones visuales (recortes al 100% de rostros, tipografía y bokeh) muestran una calidad equivalente, pero no se proporcionan métricas numéricas como PSNR, SSIM o tiempos de inferencia específicos.

## Requisitos de hardware

- VRAM estimada: no disponible en la documentación. Al ser un decodificador de difusión de 1.09 GB, se espera un consumo inferior al de un modelo generativo completo, pero no se especifica un valor concreto.
- GPU recomendadas: cualquier GPU capaz de ejecutar PiD bf16; no se requiere arquitectura Blackwell.
- Compatibilidad con GPU de consumo: sí, siempre que cumplan los requisitos de ComfyUI y tengan VRAM suficiente para el modelo y el proceso de decodificación.
- Opciones de despliegue: ComfyUI (principal), con nodos estándar (`UNETLoader`, `PiDConditioning`, `KSampler` de 4 pasos). El modo tiled requiere el plugin ComfyUI-Latent-Tiled-PiD, instalable desde ComfyUI Manager o el Comfy Registry.
- Latencia y throughput: no disponibles. La documentación solo indica que es "un poco más rápido" que el bf16 original.

## Comparativa con modelos similares

| Modelo | Tamaño | Cuantización | Resolución de salida | Requisitos | Licencia |
|---|---|---|---|---|---|
| PiD-1.5-flux2-nvfp4-comfy (este) | 1.09 GB | NVFP4 | 4x (hasta 5376×3072 single-shot, 7680×4352 tiled) | ComfyUI >= 0.32, cualquier GPU que ejecute PiD bf16 | NSCLv1 |
| nvidia/PiD v1.5 (bf16) | 2.61 GB | bf16 | 4x | GPU con VRAM suficiente, ComfyUI | NSCLv1 |
| VAE estándar de FLUX.2 | no disponible | no disponible | 1x (sin upscaling) | ComfyUI estándar | no disponible |

La comparativa se limita a las alternativas documentadas en la información proporcionada. No se dispone de datos sobre otros decodificadores de difusión similares en el ecosistema.

## Limitaciones y advertencias

- Licencia NSCLv1: uso exclusivamente no comercial, restringido a investigación y evaluación. No está permitido su uso en productos o servicios comerciales, y las derivadas también están sujetas a esta licencia.
- Compatibilidad limitada: solo funciona con latentes de la familia FLUX.2 (128 canales). No es compatible con otros modelos de difusión ni con latentes de VAE convencionales.
- Degradación en resoluciones extremas: en modo single-shot, el modelo colapsa más allá de aproximadamente 4K de salida. Para resoluciones superiores es obligatorio usar el modo tiled.
- Posible pérdida de calidad por cuantización: aunque las capas críticas se mantienen en bf16, la cuantización NVFP4 puede introducir artefactos en ciertos escenarios no documentados.
- Dependencia de nodos adicionales: el modo tiled requiere la instalación de un plugin externo, lo que añade una dependencia al flujo de trabajo.
- Sin soporte oficial: el modelo es una conversión comunitaria, no afiliada a NVIDIA ni a Comfy-Org. No hay garantías de mantenimiento o corrección de errores.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/BennyDaBall/PiD-1.5-flux2-nvfp4-comfy
- Modelo base (NVIDIA PiD): https://huggingface.co/nvidia/PiD
- Paper de PiD (arXiv): https://arxiv.org/abs/2605.23902
- Repo del plugin tiled: https://github.com/BennyDaBall930/ComfyUI-Latent-Tiled-PiD
- Comfy Registry del plugin: https://registry.comfy.org/publishers/bennydaball
- Variante para qwen-image: https://huggingface.co/BennyDaBall/PiD-1.5-qwenimage-nvfp4-comfy
