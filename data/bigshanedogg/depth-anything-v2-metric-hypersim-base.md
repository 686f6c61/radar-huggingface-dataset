# bigshanedogg/Depth-Anything-V2-Metric-Hypersim-Base

## Resumen

Depth-Anything-V2-Metric-Hypersim-Base es un modelo de estimación de profundidad monocular métrica, es decir, predice distancias absolutas en metros a partir de una sola imagen RGB. Es un port no oficial al formato transformers del checkpoint original `depth-anything/Depth-Anything-V2-Metric-Hypersim-Base`, desarrollado por Lihe Yang, Bingyi Kang, Zilong Huang, Zhen Zhao, Xiaogang Xu, Jiashi Feng y Hengshuang Zhao (arXiv 2406.09414). Este repositorio concreto lo publica el usuario `bigshanedogg` y su valor diferencial es que ejecuta el código original del proyecto, no una reimplementación.

La arquitectura combina un backbone DINOv2 ViT-B/14 con una cabeza DPT que aplica una activación Sigmoide escalada a un máximo de 20 metros. El modelo fue entrenado sobre el dataset Hypersim y está pensado para escenarios donde se requiere profundidad métrica calibrada, no solo profundidad relativa. Con 97,47 millones de parámetros y un peso de repositorio de 0,4 GB, es un modelo compacto y desplegable en GPU de consumo.

Su relevancia actual radica en la fidelidad numérica: el autor verifica que las salidas (preprocesado, `predicted_depth`, hidden states, `infer_image` y post-procesado) son bit-idénticas al código oficial en V100, incluyendo entradas no cuadradas, donde la implementación nativa de transformers diverge entre un 0,8 % y un 1,9 % en profundidad relativa máxima. La licencia es Apache-2.0, lo que facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DINOv2 ViT-B/14 (backbone) + cabeza DPT con Sigmoide × max_depth = 20 m |
| Parametros totales | 97.470.785 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de texto) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; soporta fp16 autocast según la model card) |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (convertido desde `.pth`, tensores verificados iguales) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de Depth Anything V2 en su variante métrica. El backbone es un DINOv2 ViT-B/14 preentrenado, que extrae características visuales; sobre él se monta una cabeza DPT que produce un mapa de profundidad denso. En la variante métrica, la salida pasa por una activación Sigmoide multiplicada por una profundidad máxima de 20 metros, de forma que la predicción está acotada y expresada en metros absolutos. El checkpoint fue entrenado sobre el dataset Hypersim, orientado a escenas interiores con profundidad métrica anotada.

Este repositorio no entrena el modelo: es un port que empaqueta los submódulos oficiales (`pretrained` y `depth_head`) y ejecuta el `forward` original de la clase de profundidad métrica de `metric_depth/`. El código se ha vendorizado desde DepthAnything/Depth-Anything-V2 en el commit a561b849 a los ficheros `dav2_metric_dinov2.py` y `dav2_metric_dpt.py`, con cambios limitados a imports y al uso de `NestedTensorBlock`. Se conservan las funciones oficiales `infer_image` e `image2tensor`, y el procesador envuelve `DepthAnythingV2ImageProcessor`.

La innovación técnica destacable es la fidelidad al código original: frente a `DepthAnythingForDepthEstimation` de transformers (reimplementación que solo coincide en entradas cuadradas), este paquete reproduce exactamente la interpolación de position embeddings de DINOv2 del proyecto original, eliminando la divergencia de 0,8–1,9 % en entradas no cuadradas. Requiere `trust_remote_code=True`.

## Capacidades

- Estimación de profundidad monocular métrica en metros absolutos, con salida acotada a un máximo de 20 m.
- Generación de mapas de profundidad densos (`predicted_depth`) a partir de una imagen RGB.
- Exposición de hidden states del backbone DINOv2 mediante `output_hidden_states=True`, útiles para tareas aguas abajo.
- Función `infer_image` compatible con el flujo de los scripts oficiales (lectura con OpenCV).
- Post-procesado de profundidad con redimensionado bilineal y `align_corners=True`, replicando el original.
- Soporte de autocast fp16 con salidas bit-idénticas al código oficial.
- No dispone de tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente visual.

## Casos de uso

- Reconstrucción 3D de interiores: al predecir profundidad métrica en metros, los mapas generados pueden convertirse directamente en nubes de puntos para modelado de habitaciones y escenas indoor, sin necesidad de calibrar una escala posterior.
- Robótica móvil en interiores: la profundidad absoluta acotada a 20 m permite a un robot estimar distancias a obstáculos con una sola cámara RGB, reduciendo coste frente a soluciones LiDAR.
- Realidad aumentada: la inserción de objetos virtuales con oclusión correcta requiere profundidad métrica; el modelo proporciona esa información por fotograma con un backbone ViT-B/14 ligero.
- Navegación asistida: sistemas de ayuda a personas con discapacidad visual pueden usar la profundidad para generar avisos de proximidad de obstáculos en tiempo real en GPU de consumo.
- Generación de datos sintéticos y aumentación: los mapas de profundidad sirven como etiquetas pseudo-reales para entrenar otros modelos de segmentación o detección, aprovechando la fidelidad numérica del port.
- Control de calidad en visión por computador: verificar pipelines de estimación de profundidad comparando contra este modelo de referencia, dado que reproduce bit a bit el código oficial.
- Análisis de escenas en vídeo: procesamiento por fotograma con un modelo de 97 M de parámetros que cabe en memoria de GPU modesta, apto para lotes grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 97,47 M de parámetros; en fp32 ocupa aproximadamente 0,39 GB de pesos, y en fp16 alrededor de 0,2 GB. Con activaciones y el procesador, una GPU de 4–6 GB es suficiente; se recomienda al menos 8 GB para trabajar con lotes y entradas de alta resolución.
- GPU recomendadas: V100 (verificado por el autor), A100, H100 para procesamiento por lotes a gran escala; RTX 4090 para inferencia de baja latencia.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4070 o superiores, dado el reducido tamaño del modelo.
- Opciones de despliegue: transformers con `trust_remote_code=True` (vía `AutoModelForDepthEstimation` y `AutoProcessor`); requiere además `opencv-python` y `torchvision`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de visión de este tipo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Profundidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Depth-Anything-V2-Metric-Hypersim-Base (este port) | 97,47 M | no aplica | Métrica, máx. 20 m | Apache-2.0 | HuggingFace (port no oficial) |
| depth-anything/Depth-Anything-V2-Metric-Hypersim-Base (original) | 97,47 M | no aplica | Métrica, máx. 20 m | Apache-2.0 | HuggingFace (oficial, pesos `.pth`) |
| DepthAnythingForDepthEstimation (`-hf`) | no disponible | no aplica | Métrica/relativa según checkpoint | Apache-2.0 | HuggingFace (reimplementación en transformers) |
| Depth Anything V2 Small (referencia de la model card) | no disponible | no aplica | Relativa | Apache-2.0 | HuggingFace |

La diferencia clave frente a la reimplementación nativa de transformers es la coincidencia exacta con el código oficial en entradas no cuadradas; frente al repositorio oficial, este port ofrece integración directa con la API de transformers a cambio de requerir `trust_remote_code`.

## Limitaciones y advertencias

- No es un lanzamiento oficial: es un port no oficial publicado por `bigshanedogg`; para producción conviene evaluar el repositorio oficial como referencia.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio; auditar `dav2_metric_dinov2.py` y `dav2_metric_dpt.py` antes de desplegar.
- La profundidad está acotada a un máximo de 20 m por diseño (Sigmoide × 20), por lo que escenas exteriores o de gran escala quedan fuera de su rango útil.
- Entrenado sobre Hypersim, con sesgos hacia escenas interiores; el rendimiento en dominios distintos (exteriores, imágenes aéreas) no está documentado en la información disponible.
- No procesa texto ni lenguaje: no admite prompts, tool calling ni razonamiento; su única salida es el mapa de profundidad.
- Riesgo de alucinación entendido como predicciones plausibles pero incorrectas en regiones oclusivas, superficies reflectantes o texturas ambiguas; no se documentan métricas de error en la información disponible.
- Solo 13 descargas y 0 likes en el momento de la consulta, lo que indica escasa validación comunitaria.
- La licencia Apache-2.0 permite uso comercial, pero debe conservarse la atribución del proyecto original y el NOTICE del port.

## Enlaces

- [HuggingFace: bigshanedogg/Depth-Anything-V2-Metric-Hypersim-Base](https://huggingface.co/bigshanedogg/Depth-Anything-V2-Metric-Hypersim-Base)
- [Modelo base oficial: depth-anything/Depth-Anything-V2-Metric-Hypersim-Base](https://huggingface.co/depth-anything/Depth-Anything-V2-Metric-Hypersim-Base)
- [Repositorio GitHub: DepthAnything/Depth-Anything-V2](https://github.com/DepthAnything/Depth-Anything-V2)
- [Paper: Depth Anything V2 (arXiv 2406.09414)](https://arxiv.org/abs/2406.09414)
