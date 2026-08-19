# Ruicheng/moge-3-vitl

## Resumen

MoGe-3 ViT-Large es un modelo de visión por computador diseñado para recuperar la geometría tridimensional de escenas a partir de una única imagen monocroma. Forma parte de la familia MoGe desarrollada por Microsoft Research, presentada como trabajo oral en CVPR 2025. Este modelo concreto, alojado en Hugging Face bajo el identificador `Ruicheng/moge-3-vitl`, corresponde a una variante con backbone ViT-Large del sistema MoGe-3, que predice mapas de puntos métricos, mapas de profundidad métrica, mapas de normales y el campo de visión (FOV) de la cámara.

La relevancia de este modelo radica en su capacidad para estimar geometría 3D a partir de imágenes cotidianas sin necesidad de calibración previa ni múltiples vistas, lo que lo convierte en una herramienta útil para robótica, realidad aumentada, reconstrucción de escenas y otras aplicaciones que requieren comprensión espacial. La versión alojada en este repositorio tiene un tamaño de 1,5 GB y se distribuye bajo licencia MIT, lo que facilita su uso comercial y académico.

Sin embargo, la documentación oficial del repositorio es prácticamente inexistente (solo incluye la licencia), por lo que gran parte de las especificaciones técnicas detalladas no están disponibles públicamente en esta fuente. La información que se presenta a continuación se basa en el conocimiento general de la arquitectura MoGe y en los datos extraídos de la búsqueda web, complementada con las limitaciones inherentes a la falta de documentación específica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer ViT-Large (backbone) con cabezas de predicción para punto map, profundidad, normales y FOV |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, sin contexto de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de visión, no procesa lenguaje) |
| Licencia | MIT |
| Formato de pesos | safetensors (presumiblemente, aunque no se especifica en el repositorio) |

## Arquitectura y entrenamiento

MoGe-3 ViT-Large sigue la arquitectura general de la familia MoGe: un encoder basado en Vision Transformer (ViT-Large) que procesa la imagen de entrada y produce una representación intermedia, sobre la cual se aplican cabezas de regresión para generar un mapa de puntos 3D con representación afín-invariante, es decir, agnóstica a la escala y el desplazamiento globales. Esta representación permite recuperar la geometría relativa de la escena sin necesidad de conocer la escala absoluta. El modelo también predice mapas de profundidad métrica, mapas de normales y el campo de visión de la cámara, todo ello de forma directa y en una sola pasada.

Los detalles específicos del entrenamiento de esta variante concreta (número de tokens, composición del dataset, uso de RLHF o técnicas de alineación) no están disponibles en la información proporcionada. Según la publicación de MoGe (arXiv:2410.19115), el entrenamiento se realizó sobre un conjunto diverso de imágenes del mundo real con supervisión de geometría 3D obtenida mediante métodos de reconstrucción multi-vista. La innovación principal de MoGe es su capacidad para trabajar con imágenes de dominio abierto sin restricciones de escena, gracias a una formulación de punto map que unifica profundidad, normales y FOV en una sola salida.

## Capacidades

- Predicción de mapas de puntos 3D métricos a partir de una única imagen.
- Estimación de mapas de profundidad métrica y mapas de normales de superficie.
- Recuperación del campo de visión (FOV) de la cámara que capturó la imagen.
- Funciona con imágenes de dominio abierto (escenas interiores, exteriores, objetos, etc.).
- Salida afín-invariante, lo que permite reconstrucciones relativas sin calibración previa.
- No incluye capacidades de procesamiento de lenguaje natural, tool calling ni agentes; es exclusivamente un modelo de visión.

## Casos de uso

- Reconstrucción 3D de escenas para robótica móvil: el modelo proporciona mapas de profundidad y geometría en tiempo real a partir de la cámara del robot, permitiendo navegación y evitación de obstáculos sin necesidad de sensores LiDAR.
- Realidad aumentada y mixta: la estimación de profundidad y normales permite colocar objetos virtuales de forma coherente con la geometría real de la escena, mejorando la oclusión y la iluminación.
- Modelado 3D a partir de fotografías: los mapas de puntos generados pueden convertirse en mallas o nubes de puntos para su uso en diseño industrial, arquitectura o preservación del patrimonio.
- Preprocesamiento para sistemas de conducción autónoma: la profundidad monocular es útil como entrada auxiliar para la detección de objetos y la planificación de trayectorias en vehículos autónomos.
- Generación de datos sintéticos: los mapas de profundidad y normales pueden servir para entrenar otros modelos de visión o para aumentar datasets con información geométrica.
- Análisis de imágenes médicas o industriales: en entornos controlados, la estimación de geometría a partir de una sola imagen puede facilitar la inspección de piezas o la medición de dimensiones relativas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio de Hugging Face no incluye métricas de evaluación, y la búsqueda web no proporciona datos específicos para la variante `moge-3-vitl`. La publicación original de MoGe (arXiv:2410.19115) reporta resultados en tareas de estimación de profundidad y geometría, pero no se dispone de esos números en esta ficha.

## Requisitos de hardware

- Tamaño del repositorio: 1,5 GB, lo que sugiere que el modelo completo en precisión FP32 podría ocupar alrededor de 1,5 GB de memoria (asumiendo pesos de aproximadamente 375 millones de parámetros, típico de ViT-Large).
- VRAM estimada para inferencia: con cuantización a FP16, se necesitarían aproximadamente 3 GB de VRAM; con cuantización a INT8, alrededor de 1,5 GB. Para FP32, unos 6 GB.
- GPUs recomendadas: cualquier GPU con al menos 6 GB de VRAM (por ejemplo, NVIDIA GTX 1660, RTX 2060, RTX 3060, etc.). En GPUs de gama alta como RTX 4090 o A100, la inferencia sería muy rápida.
- Opciones de despliegue: al ser un modelo de visión basado en PyTorch, puede ejecutarse con librerías estándar como `transformers` (si se adapta) o directamente con PyTorch. También es posible convertirlo a ONNX o TensorRT para optimización. No se menciona soporte para vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles. En una GPU moderna, la inferencia para una imagen de 224x224 píxeles debería tomar menos de 100 ms, pero no hay datos confirmados.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa con otros modelos de estimación de geometría monocular (como Depth Anything, MiDaS, o ZoeDepth). La falta de especificaciones técnicas y benchmarks impide una comparación cuantitativa. Se recomienda consultar la documentación de MoGe en el repositorio oficial de Microsoft para obtener datos de rendimiento relativos.

## Limitaciones y advertencias

- La documentación del repositorio es prácticamente inexistente, lo que dificulta la reproducibilidad y el uso en producción sin un análisis adicional.
- No se han publicado resultados de benchmarks para esta variante concreta, por lo que su rendimiento real en tareas específicas es desconocido.
- Al ser un modelo de visión, no procesa lenguaje natural; no debe utilizarse para tareas de texto o conversación.
- La estimación de profundidad monocular tiene limitaciones inherentes en escenas con superficies reflectantes, transparentes o sin textura, donde la geometría puede ser ambigua.
- La licencia MIT permite uso comercial y modificación, pero el modelo se distribuye sin garantías; el usuario es responsable de validar su comportamiento en el dominio de aplicación.
- No se especifican sesgos conocidos, pero como todo modelo entrenado con datos del mundo real, puede presentar degradación en escenas poco representadas en el dataset de entrenamiento.
- La fecha de creación (2026-08-18) es posterior a la fecha de publicación de MoGe (2024), lo que sugiere que podría ser una versión actualizada, pero no hay información sobre cambios respecto a la versión original.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Ruicheng/moge-3-vitl
- Repositorio GitHub de MoGe (Microsoft): https://github.com/microsoft/MoGe
- Página del modelo ViT-Large original: https://huggingface.co/Ruicheng/moge-vitl
- Artículo arXiv de MoGe: https://arxiv.org/html/2410.19115v2
- Repositorio GitHub alternativo (vmurakami0123/MoGe): https://github.com/vmurakami0123/MoGe
