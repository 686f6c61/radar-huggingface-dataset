# alpayozkan/pxwplanar-moge2-planarity

## Resumen

El modelo `alpayozkan/pxwplanar-moge2-planarity` es un ajuste fino de MoGe-2, el modelo fundacional de estimación de geometría monocular desarrollado por Microsoft, al que se le añade una cuarta cabeza de predicción que estima la probabilidad de planaridad por píxel. El resultado es un sistema capaz de segmentar planos en una imagen RGB monocroma con alta precisión, combinando la salida de planarity con la profundidad métrica, las normales de superficie y una máscara de validez, todo ello mediante un algoritmo de crecimiento de regiones acelerado por GPU.

El modelo lo publica Alpay Ozkan y sus colaboradores como parte del trabajo "Pixel-wise Planarity for High-Precision Monocular Plane Segmentation" (ECCV 2026). Utiliza un encoder DINOv2 ViT-L con un cuello ConvStack, y el checkpoint liberado corresponde a la época 1 del entrenamiento completo, con una pérdida BCE-mixta de validación de 0,290 y una precisión de planaridad de 0,894. Su relevancia radica en que ofrece una solución de segmentación de planos monocular de código abierto, con licencia MIT, que puede integrarse en pipelines de robótica, reconstrucción 3D y visión por computador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoGe-2 (encoder DINOv2 ViT-L, cuello ConvStack) + cabezas de puntos, normales, máscara y escala + cabeza de planaridad (ConvStack de la cabeza de normales, 1 canal de salida) |
| Parametros totales | 335,6 M (float32) |
| Parametros activos | no aplicable (modelo denso, no MoE) |
| Longitud de contexto | no disponible (modelo de visión, entrada de imagen única; configuración publicada 1440×1920, num_tokens=1600) |
| Tipos de cuantizacion | no disponible (checkpoint en float32; se puede cuantizar posteriormente) |
| Idiomas soportados | no disponible (modelo de visión, no procesa texto) |
| Licencia | MIT |
| Formato de pesos | safetensors (formato nativo de MoGe `{'model_config', 'model'}`) |

## Arquitectura y entrenamiento

El modelo parte de los pesos de `Ruicheng/moge-2-vitl-normal`, que a su vez se basan en MoGe-2, un modelo de estimación de geometría monocular que predice mapas de puntos 3D con escala métrica, profundidad, normales de superficie y FOV de cámara. La arquitectura combina un encoder DINOv2 ViT-L con un cuello ConvStack y varias cabezas de regresión. En este ajuste fino se añade una cuarta cabeza, denominada "planarity head", que comparte la estructura ConvStack de la cabeza de normales y produce un único canal de salida con la probabilidad de que cada píxel pertenezca a un plano.

El entrenamiento se realizó en dos fases: primero se inicializó la cabeza de planaridad con el backbone congelado, y después se realizó un ajuste fino completo de todos los 559 tensores del modelo. Los datos de entrenamiento se generaron a partir de los conjuntos ScanNet++, Hypersim, SYNTHIA y VKITTI2, utilizando el pipeline de generación de ground truth del repositorio asociado, que convierte mallas semánticas o combinaciones de profundidad y semántica en etiquetas 2D de planos. El checkpoint liberado corresponde a la época 1 del entrenamiento completo, con una pérdida BCE-mixta de validación de 0,290 y una precisión de planaridad de 0,894.

## Capacidades

- Segmentación de planos por píxel a partir de una única imagen RGB, combinando probabilidad de planaridad, profundidad métrica, normales de superficie y máscara de validez.
- Estimación de profundidad métrica y normales de superficie heredadas de MoGe-2, lo que permite reconstrucción 3D parcial.
- Recuperación de intrínsecos de cámara (FOV) a partir de la imagen.
- Segmentación de planos mediante crecimiento de regiones acelerado por GPU, con parámetros canónicos: umbral de planaridad > 0,3, umbral de normales 5,0°, umbral de profundidad relativa 0,025 y mínimo de 8 vecinos coincidentes.
- Capacidad de procesar imágenes de alta resolución (configuración publicada 1440×1920) con `num_tokens=1600`.
- No soporta tool calling, agentes ni procesamiento de texto; es un modelo puramente visual.

## Casos de uso

- Reconstrucción 3D de interiores: el modelo segmenta planos (suelo, paredes, techos) en imágenes monoculares, lo que permite generar mallas planas para aplicaciones de arquitectura y diseño de interiores.
- Robótica móvil: la segmentación de planos combinada con profundidad métrica facilita la navegación y el mapeo de entornos, ya que los robots pueden identificar superficies planas transitables.
- Realidad aumentada: la detección de planos en tiempo real permite anclar objetos virtuales a superficies físicas, mejorando la experiencia de usuario en aplicaciones AR.
- Inspección industrial: análisis de superficies planas en entornos de fabricación para detectar defectos o medir dimensiones, usando la salida de profundidad y normales.
- Conducción autónoma: en entornos urbanos, la segmentación de planos de carretera y aceras a partir de imágenes de cámara monocular puede complementar sistemas de percepción basados en LiDAR.
- Generación de datos sintéticos: el pipeline de ground truth del repositorio puede utilizarse para crear etiquetas de planos a partir de mallas semánticas, útil para entrenar otros modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que el modelo fue evaluado en ScanNet++ (interior) y SYNTHIA/VKITTI2 (exterior) contra ground truth de planos renderizados, con métricas de segmentación 2D (Segmentation Covering, Rand Index, Variation of Information), precisión/recall 3D a 1/5/10 mm (planos ajustados con RANSAC) y precisión/recall/F1/IoU de planaridad binaria, pero no se proporcionan valores numéricos en la información accesible. Se remite al repositorio de GitHub para reproducir la evaluación.

## Requisitos de hardware

- VRAM estimada: no disponible oficialmente; con 335,6 M de parámetros en float32, el checkpoint ocupa aproximadamente 1,3 GB en disco. La inferencia en float32 requerirá al menos 2-3 GB de VRAM, dependiendo de la resolución de entrada.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM (RTX 2070, RTX 3060, etc.) puede ejecutar el modelo a resoluciones moderadas. Para la configuración completa de 1440×1920 se recomienda una GPU con 12 GB o más (RTX 3080, RTX 4090, A100).
- Cabe en GPUs de consumo: sí, en la mayoría de GPUs modernas de gama media-alta.
- Opciones de despliegue: el modelo se carga mediante la API `from_pretrained` de MoGe, por lo que puede integrarse en pipelines de PyTorch. No se menciona soporte para vLLM, llama.cpp u Ollama, ya que es un modelo de visión, no de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Entrada | Salidas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `alpayozkan/pxwplanar-moge2-planarity` | 335,6 M | Imagen RGB | Planarity, profundidad, normales, máscara, intrínsecos | MIT | HuggingFace |
| `Ruicheng/moge-2-vitl-normal` (base) | ~335 M (sin cabeza de planarity) | Imagen RGB | Profundidad, normales, puntos, máscara, intrínsecos | MIT | HuggingFace |
| MoGe-2 original (Microsoft) | ~335 M | Imagen RGB | Profundidad, normales, puntos, máscara, intrínsecos | MIT | GitHub/HuggingFace |

No se dispone de comparativas con otros modelos de segmentación de planos como PlaneRCNN o PlanarReconstruction, ya que no se han encontrado datos de rendimiento comparativo en la información disponible.

## Limitaciones y advertencias

- El modelo es un ajuste fino de MoGe-2 y hereda sus limitaciones: puede fallar en imágenes con oclusiones severas, superficies muy reflectantes o texturas repetitivas.
- La segmentación de planos depende de los umbrales canónicos (planarity > 0,3, normales 5°, profundidad 0,025, 8 vecinos); estos parámetros pueden necesitar ajuste para dominios específicos.
- El entrenamiento se realizó con datos sintéticos y semánticos de ScanNet++, Hypersim, SYNTHIA y VKITTI2; el rendimiento en dominios muy diferentes (por ejemplo, imágenes médicas o aéreas) puede degradarse.
- El checkpoint liberado es de la época 1 del entrenamiento completo; no se garantiza que sea el punto óptimo de convergencia.
- Aunque la licencia es MIT, el modelo redistribuye pesos de DINOv2 (Apache 2.0) y de MoGe-2 (MIT); se deben conservar los avisos de licencia correspondientes.
- No se proporcionan métricas de rendimiento cuantitativas en la model card, por lo que es difícil evaluar su precisión relativa sin reproducir los benchmarks.
- El modelo no soporta procesamiento de texto ni interacción multimodal; es exclusivamente para visión.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/alpayozkan/pxwplanar-moge2-planarity
- Repositorio de código y demo: https://github.com/alpayozkan/PixelwisePlanarity
- Modelo base MoGe-2: https://huggingface.co/Ruicheng/moge-2-vitl-normal
- Paper de MoGe-2 (arXiv): https://arxiv.org/abs/2507.02546
- Repositorio oficial de MoGe (Microsoft): https://github.com/microsoft/MoGe
- Publicación de MoGe-2 en Microsoft Research: https://www.microsoft.com/en-us/research/publication/moge-2-accurate-monocular-geometry-with-metric-scale-and-sharp-details/
