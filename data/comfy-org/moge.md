# Comfy-Org/MoGe

## Resumen

MoGe (Accurate Monocular Geometry Estimation) es un modelo de estimación de geometría monocular desarrollado por Microsoft Research. Dado una única imagen, predice mapas de profundidad y normales de superficie, lo que permite reconstruir la escena 3D de forma densa y coherente. El modelo se distribuye en dos variantes: MoGe-1 y MoGe-2, siendo la segunda una versión mejorada con mayor precisión y robustez. Este repositorio de Comfy-Org empaqueta los pesos en formato safetensors (fp16) para su uso directo en ComfyUI, el popular editor de flujos de trabajo basado en nodos. La arquitectura se basa en un backbone ViT-Large (ViT-L) con un decodificador ligero, y el tamaño total del repositorio es de 1,3 GB, lo que lo hace viable para GPUs de consumo medio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ViT-Large (encoder) + decodificador de geometria |
| Parametros totales | no disponible (basado en ViT-L, tipicamente ~300M) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | fp16 (safetensors) |
| Idiomas soportados | no aplica (entrada visual) |
| Licencia | MIT |
| Formato de pesos | safetensors (fp16) |

## Arquitectura y entrenamiento

El modelo emplea un encoder ViT-Large que procesa la imagen de entrada y un decodificador que predice simultáneamente profundidad y normales de superficie. La versión MoGe-2 introduce mejoras en el entrenamiento, como mayor resolución de entrada y una estrategia de aumento de datos más robusta, lo que mejora la generalización a escenas del mundo real. El entrenamiento combina datos sintéticos (renderizados) con datasets reales etiquetados, y se optimiza con una pérdida que combina errores de profundidad y normales. No se ha publicado información detallada sobre el número exacto de tokens de entrenamiento ni sobre el uso de técnicas como RLHF, ya que no es un modelo de lenguaje.

## Capacidades

- Estimación de profundidad monocular densa a partir de una sola imagen.
- Estimación de normales de superficie, lo que permite inferir la orientación 3D de los objetos.
- Reconstrucción 3D de la escena completa, incluyendo oclusiones y bordes.
- Funciona en imágenes arbitrarias sin necesidad de calibración de cámara.
- Dos variantes: MoGe-1 (equilibrio precisión/velocidad) y MoGe-2 (mayor precisión, especialmente en escenas complejas).
- Integración nativa con ComfyUI mediante nodos de geometría.

## Casos de uso

- Reconstrucción 3D para realidad aumentada: el modelo genera mapas de profundidad y normales que permiten colocar objetos virtuales sobre superficies reales con coherencia geométrica.
- Robótica y navegación autónoma: la estimación de profundidad monocular es útil para evitar obstáculos y planificar rutas en entornos no estructurados, usando solo una cámara RGB.
- Edición de imágenes y video: las normales de superficie facilitan la reiluminación, el retexturizado y la composición de elementos 3D en postproducción.
- Generación de contenido 3D para videojuegos: a partir de una foto se puede extraer la geometría de la escena para usarla como base en motores de juego.
- Análisis de escenas médicas o industriales: la estimación de profundidad ayuda a medir dimensiones o detectar deformaciones en imágenes capturadas con cámaras convencionales.
- Automatización de flujos de trabajo en ComfyUI: los nodos de MoGe se combinan con otros modelos de difusión para generar imágenes con control geométrico (por ejemplo, ajustar la perspectiva o la iluminación).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El paper original de MoGe (arXiv:2410.19115) y el de MoGe-2 (arXiv:2504.02555) reportan métricas en datasets como NYUv2, KITTI y ScanNet, pero esos datos no están incluidos en la model card de este repositorio.

## Requisitos de hardware

- VRAM estimada: cada archivo safetensors pesa aproximadamente 650 MB en fp16, por lo que se necesitan al menos 2 GB de VRAM para cargar un modelo, más memoria para la activación (típicamente 4-6 GB en total).
- GPU recomendadas: cualquier GPU con 6 GB o más de VRAM (GTX 1660 Super, RTX 2060, RTX 3060, etc.) puede ejecutar la inferencia. Para procesamiento por lotes o alta resolución se recomienda una RTX 3090 o superior.
- Compatibilidad con GPU de consumo: sí, cabe en la mayoría de GPUs modernas de gama media.
- Opciones de despliegue: ComfyUI (integrado), PyTorch directo, ONNX Runtime (si se exporta), o servidores de inferencia personalizados.
- Latencia: en una RTX 3060, la inferencia de una imagen de 512x512 tarda aproximadamente 0,5-1 segundo; en una A100, menos de 0,1 segundo.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MoGe (este) | ViT-L + decodificador | ~300M (estimado) | Profundidad + normales | MIT | HuggingFace, GitHub |
| Depth Anything V2 | ViT-L / ViT-G | ~300M / ~1.1B | Profundidad | Apache 2.0 | HuggingFace |
| MiDaS | ResNet / ViT | ~100M - 300M | Profundidad | MIT | HuggingFace |
| Marigold | U-Net (difusión) | ~1.2B | Profundidad + normales | Apache 2.0 | HuggingFace |

MoGe se distingue por predecir simultáneamente profundidad y normales con un único modelo, mientras que Depth Anything y MiDaS solo ofrecen profundidad. Marigold, basado en difusión, produce resultados de alta calidad pero es más lento y pesado.

## Limitaciones y advertencias

- La estimación de geometría puede fallar en superficies reflectantes, transparentes o con texturas repetitivas.
- La precisión disminuye en condiciones de poca luz o con desenfoque extremo.
- El modelo asume una cámara con lente estándar; imágenes con distorsión de ojo de pez pueden dar resultados incorrectos.
- No se proporcionan pesos cuantizados (solo fp16), lo que limita su uso en dispositivos con muy poca VRAM.
- Aunque la licencia es MIT, el uso comercial debe verificar que los datos de entrenamiento no tengan restricciones adicionales (no se especifica en la model card).
- Para producción, se recomienda validar el rendimiento en el dominio específico, ya que no se han publicado benchmarks oficiales en este repositorio.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Comfy-Org/MoGe
- Repositorio original (GitHub): https://github.com/microsoft/moge
- Modelo original MoGe-1: https://huggingface.co/Ruicheng/moge-vitl
- Modelo original MoGe-2: https://huggingface.co/Ruicheng/moge-2-vitl
- Paper MoGe (arXiv): https://arxiv.org/abs/2410.19115
- Paper MoGe-2 (arXiv): https://arxiv.org/abs/2504.02555
