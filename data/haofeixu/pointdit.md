# haofeixu/pointdit

## Resumen

PointDiT es un modelo de difusión basado en Transformer que predice un mapa de puntos 3D denso a partir de una única imagen RGB. Desarrollado por Haofei Xu (investigador en ETH Zurich y Universidad de Tübingen, afiliado a KE:SAI Open Science Lab), el modelo se presenta como una solución minimalista que elimina la necesidad de arquitecturas híbridas complejas o de comprimir la geometría en espacios latentes. Según el artículo publicado en arXiv (2607.02515), PointDiT logra una reconstrucción 3D de alta calidad en un solo paso de difusión, y añadiendo más pasos se obtienen estructuras más finas y detalladas.

El modelo está diseñado para el problema de reconstrucción monocular de geometría 3D, un campo con aplicaciones en visión por computadora, robótica y realidad aumentada. A diferencia de otros métodos que dependen de VAE o redes híbridas, PointDiT opera directamente en el espacio de píxeles, lo que simplifica el entrenamiento y la inferencia. Se han liberado pesos preentrenados para tres tamaños (B, L, H) y dos resoluciones (256×256 y 512×512), disponibles en el repositorio de Google Research.

La licencia es Apache-2.0, lo que permite uso comercial y modificación. Aunque la información pública es limitada (sin datos de parámetros ni benchmarks oficiales), el artículo y la página del proyecto proporcionan referencias claras sobre su funcionamiento y resultados cualitativos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (pixel-space) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de visión, no textual) |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (se presume safetensors o similar, pero no se especifica) |

## Arquitectura y entrenamiento

PointDiT es un Transformer de difusión que opera directamente en el espacio de píxeles, sin emplear un autoencoder variacional (VAE) ni redes híbridas adicionales. El modelo recibe una imagen RGB y genera un mapa de puntos 3D denso (una representación de geometría por píxel). La difusión se realiza en el espacio de píxeles, lo que evita la compresión en un espacio latente y simplifica el entrenamiento y la inferencia.

No se han publicado detalles específicos sobre el conjunto de datos de entrenamiento, el número de tokens o el uso de técnicas como RLHF o DPO. La información disponible indica que el modelo fue presentado en ICML 2026 y que se han liberado pesos preentrenados para tres configuraciones (B, L, H) y dos resoluciones (256×256 y 512×512). El entrenamiento se basa en técnicas de difusión estándar, y el modelo soporta inferencia en uno o varios pasos, ajustando la calidad de la geometría generada.

## Capacidades

- Reconstrucción de geometría 3D monocular: predice un mapa de puntos 3D denso a partir de una imagen RGB de una sola vista.
- Generación en un solo paso: produce geometría de alta calidad en una sola iteración de difusión, lo que lo hace adecuado para aplicaciones en tiempo real.
- Refinamiento multi-paso: aumentar el número de pasos de difusión mejora la nitidez de las estructuras finas.
- Operación en espacio de píxeles: no requiere VAE ni redes auxiliares, simplificando la implementación.
- No se reportan capacidades de tool calling, agentes, razonamiento textual o soporte multilingüe, ya que es un modelo de visión pura.

## Casos de uso

- Reconstrucción de escenas 3D a partir de fotografías: PointDiT puede generar nubes de puntos 3D densas de objetos o escenas capturadas con una cámara, útil para aplicaciones de realidad aumentada o virtual.
- Estimación de profundidad para robótica: al producir un mapa de puntos 3D, puede servir como entrada para sistemas de navegación o manipulación robótica que necesiten información de geometría a partir de una sola imagen.
- Generación de assets 3D para videojuegos y animación: permite crear geometría 3D a partir de una imagen de referencia, agilizando el flujo de trabajo de artistas.
- Inspección industrial y control de calidad: puede usarse para reconstruir la forma de piezas a partir de una foto y detectar deformaciones o defectos.
- Aplicaciones de realidad aumentada: la geometría 3D generada puede integrarse en entornos AR para superponer objetos virtuales de manera coherente con la escena real.
- Investigación en visión por computadora: sirve como baseline para estudiar métodos de difusión en el espacio de píxeles y su aplicación a la geometría 3D.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks cuantitativos en la información proporcionada. La página del proyecto y el artículo de arXiv (2607.02515) presentan ejemplos visuales y comparaciones cualitativas, pero no se incluyen tablas con métricas como MMLU, HumanEval o GSM8K, que no son aplicables a este tipo de modelo. Por tanto, no se dispone de datos numéricos de rendimiento en la información disponible.

## Requisitos de hardware

- No se especifican requisitos de VRAM en la información proporcionada.
- El tamaño del repositorio en HuggingFace es de 25.1 GB, lo que sugiere que los pesos del modelo (posiblemente para la variante más grande) ocupan un espacio considerable. Se puede estimar que para inferencia en FP32 se necesitan al menos 25 GB de VRAM, pero no se confirma.
- Para la variante 512×512, es probable que se requiera una GPU de alta gama (por ejemplo, A100 o H100) para una inferencia razonablemente rápida.
- No se indican opciones de despliegue como vLLM, llama.cpp u Ollama; al ser un modelo de difusión de imagen, no es compatible con estas herramientas de inferencia de lenguaje.
- La inferencia en un solo paso reduce la carga computacional, lo que podría permitir su uso en GPUs de consumo como una RTX 4090 con suficiente VRAM, aunque no hay datos confirmados.

## Comparativa con modelos similares

No se dispone de información pública sobre comparaciones directas con otros modelos de reconstrucción 3D monocular, como MiDaS, Marigold o DPT. El artículo de PointDiT menciona que supera a métodos que usan arquitecturas híbridas o latentes, pero no se proporcionan cifras concretas en la información consultada. Por tanto, no se puede realizar una tabla comparativa con datos verificables.

## Limitaciones y advertencias

- No se han documentado sesgos específicos en la información disponible, pero al ser un modelo de difusión generativo, podría producir geometrías alucinadas en regiones ambiguas de la imagen.
- La reconstrucción 3D a partir de una sola imagen es inherentemente ambigua; el modelo puede generar geometrías plausibles pero no necesariamente exactas en zonas ocluidas.
- No se especifica si el modelo está entrenado con datos de escenas específicas, lo que podría limitar su generalización a ciertos dominios.
- La licencia Apache-2.0 permite uso comercial, pero el usuario debe revisar los términos de las dependencias y del dataset de entrenamiento (no detallado).
- No se indica soporte para otros tipos de entrada (video, múltiples vistas), por lo que solo funciona con imágenes estáticas.

## Enlaces

- Página del proyecto: https://haofeixu.github.io/pointdit/
- Repositorio de código (Google Research): https://github.com/google-research/pointdit/
- Artículo en arXiv: https://arxiv.org/abs/2607.02515
- Tweet del autor: https://x.com/haofeixu/status/2072994575866630412
- Modelo en Hugging Face: https://huggingface.co/haofeixu/pointdit
