# nativ-community/sam-3d-body-dinov3-mlx

## Resumen

SAM 3D Body (DINOv3) para MLX es una conversión del modelo `facebook/sam-3d-body-dinov3` de Meta al framework MLX, publicada por el usuario `nativ-community`. Su función es la estimación de la malla 3D del cuerpo humano a partir de una única imagen, devolviendo una malla de 18.439 vértices, 127 articulaciones esqueléticas, 70 keypoints 3D y una cámara de perspectiva débil. La conversión cambia únicamente el formato de los pesos: la arquitectura y los pesos originales se mantienen.

El modelo emplea un backbone de visión DINOv3 y cuenta con aproximadamente 1.126 millones de parámetros (1,13 mil millones), con un repositorio de 2,8 GB. La inferencia se ejecuta íntegramente en MLX, sin necesidad de PyTorch, lo que lo hace adecuado para equipos Apple Silicon. Está pensado para tareas de pose estimation y reconstrucción corporal, no para generación de texto ni conversación.

Su relevancia radica en trasladar un modelo de reconstrucción 3D humana de Meta al ecosistema MLX, permitiendo su uso en macOS sin depender de CUDA ni de PyTorch. La versión portada es solo para cuerpo: los módulos específicos de manos no han sido portados. No se han publicado resultados de benchmarks en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone de visión DINOv3 con cabezas de regresión para malla corporal, articulaciones y cámara |
| Parametros totales | 1.126.519.879 (aprox. 1,13 mil millones) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de visión, no de texto) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en safetensors; MLX permite cuantización, no confirmada en este repo) |
| Idiomas soportados | no aplica (modelo de visión) |
| Licencia | SAM License (licencia "other", heredada de Meta) |
| Formato de pesos | safetensors (formato MLX) |

## Arquitectura y entrenamiento

El modelo se basa en un backbone de visión DINOv3, empleado para extraer representaciones de la imagen de entrada, sobre el que se montan cabezas de regresión que producen la geometría corporal. La salida incluye una malla de 18.439 vértices, 127 articulaciones esqueléticas, 70 keypoints 3D y una cámara de perspectiva débil, todo ello a partir de una sola imagen. La conversión a MLX se realizó con `python -m mlx_vlm.models.sam3d_body.convert_weights`, y la inferencia resultante no requiere PyTorch.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de ajuste como RLHF o DPO. Tampoco se documentan innovaciones técnicas adicionales más allá del uso del backbone DINOv3 y de la propia conversión de formato. Los módulos específicos de manos no están incluidos, por lo que el modelo realiza únicamente inferencia de cuerpo.

## Capacidades

- Estimación de malla 3D del cuerpo humano a partir de una sola imagen, con 18.439 vértices.
- Predicción de 127 articulaciones esqueléticas.
- Predicción de 70 keypoints 3D.
- Estimación de una cámara de perspectiva débil (vector de 3 componentes).
- Inferencia sin PyTorch, ejecutable en el ecosistema MLX.
- Soporte de tool calling / function calling: no disponible (no es un modelo de lenguaje).
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingües: no aplica.
- Capacidades especiales: reconstrucción corporal 3D; no incluye manos.

## Casos de uso

- Captura de movimiento sin marcadores: a partir de vídeo o imágenes individuales, el modelo genera keypoints 3D y una malla que puede alimentar un esqueleto animable en motores de videojuegos o pipelines de animación.
- Animación y gráficos por computadora: la malla de 18.439 vértices y las 127 articulaciones permiten obtener un cuerpo listo para rigging y animación en producción de cine o videojuegos.
- Realidad aumentada y probador virtual: la estimación de la pose y la cámara de perspectiva débil facilita superponer prendas o avatares sobre la persona en la imagen en aplicaciones de e-commerce o filtros.
- Análisis biomecánico y deportivo: los keypoints 3D y las articulaciones permiten medir ángulos y posturas en imágenes, útil para entrenadores y fisioterapeutas que trabajan en macOS.
- Interacción humano-robot: la reconstrucción de la postura humana a partir de una cámara puede alimentar sistemas que necesiten interpretar la pose de una persona para planificar movimientos o evitar colisiones.
- Telepresencia y avatares: la malla generada puede retargetearse a un avatar en aplicaciones de videollamada o realidad virtual, ejecutándose en local sobre Apple Silicon.
- Prototipado de investigación en visión 3D: al prescindir de PyTorch y funcionar en MLX, permite experimentar con reconstrucción corporal en equipos Mac sin GPU NVIDIA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM / memoria estimada: con 1,13 mil millones de parámetros, los pesos ocupan aproximadamente 2,25 GB en FP16 y unos 4,5 GB en FP32, más el consumo de activaciones durante la inferencia.
- GPU recomendadas: al ser una conversión MLX, el objetivo principal es Apple Silicon (chips de la serie M). No se documentan requisitos para GPUs NVIDIA.
- Cabe en hardware de consumo: sí, previsiblemente en equipos Apple Silicon con memoria unificada de 8 GB o más, aunque no se confirma oficialmente.
- Opciones de despliegue: `mlx-vlm` (comando `mlx_vlm.extract` y API `mlx_vlm.extraction.extract`). No se documentan soportes para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nativ-community/sam-3d-body-dinov3-mlx | 1,13 mil millones | no aplica | safetensors (MLX) | SAM License | HuggingFace, 19 descargas |
| facebook/sam-3d-body-dinov3 | no disponible | no aplica | no disponible | SAM License | HuggingFace (modelo original de Meta) |
| Otras alternativas de pose estimation 3D | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparados entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Solo cuerpo: los módulos específicos de manos no han sido portados, por lo que no se obtienen reconstrucciones de manos.
- Licencia SAM License: es una licencia "other" con posibles restricciones para uso comercial; conviene revisar el archivo `LICENSE` antes de utilizarlo en producción.
- Sin benchmarks publicados: no hay evidencia cuantitativa de precisión ni de comparación con alternativas.
- Validación comunitaria escasa: el repositorio registra 19 descargas y 0 likes, lo que limita la comprobación independiente de su funcionamiento.
- Dependencia del ecosistema MLX: la conversión está orientada a Apple Silicon, lo que restringe su despliegue en entornos con GPU NVIDIA u otros frameworks.
- Riesgo de estimación errónea en imágenes con oclusiones, poses extremas o iluminación adversa: es una limitación general de los métodos de reconstrucción a partir de una sola imagen, no verificada específicamente en este modelo.
- Idiomas: no aplica, ya que no procesa texto.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/nativ-community/sam-3d-body-dinov3-mlx
- Modelo base (Meta): https://huggingface.co/facebook/sam-3d-body-dinov3
- Los resultados de búsqueda web obtenidos no contienen enlaces relevantes al modelo (corresponden a marcas y servicios no relacionados).
