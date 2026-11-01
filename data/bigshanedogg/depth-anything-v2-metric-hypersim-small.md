# bigshanedogg/Depth-Anything-V2-Metric-Hypersim-Small

## Resumen

Depth-Anything-V2-Metric-Hypersim-Small es un port no oficial al formato `transformers` del modelo de estimación de profundidad métrica Depth Anything V2, en su variante Small entrenada sobre el dataset Hypersim. El modelo original fue desarrollado por Lihe Yang, Bingyi Kang, Zilong Huang, Zhen Zhao, Xiaogang Xu, Jiashi Feng y Hengshuang Zhao (publicado en arXiv 2406.09414), y este port lo mantiene el usuario `bigshanedogg`. La diferencia clave frente a las versiones `-hf` oficiales de `transformers` es que este paquete ejecuta los módulos originales del repositorio Depth-Anything-V2 en lugar de una reimplementación, lo que garantiza resultados bit-idénticos al código de referencia.

El modelo resuelve el problema de estimar profundidad métrica (en metros) a partir de una sola imagen RGB, con un rango máximo de 20 metros, gracias a una cabeza de profundidad DPT con activación `Sigmoid()` escalada por `max_depth`. La arquitectura combina un backbone DINOv2 ViT-S/14 (24,78 millones de parámetros totales) con la mencionada cabeza DPT. Es relevante para quienes necesitan integrar estimación de profundidad en pipelines de `transformers` sin renunciar a la fidelidad numérica del código original, especialmente en entradas no cuadradas donde la reimplementación oficial diverge entre un 0,8 % y un 1,9 % en profundidad relativa máxima.

El repositorio ocupa 0,1 GB, está bajo licencia Apache-2.0 y se distribuye en formato `safetensors` con código personalizado (`trust_remote_code`). No incluye información sobre idiomas soportados ni benchmarks propios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DINOv2 ViT-S/14 (backbone) + cabeza DPT con `Sigmoid()` × `max_depth` = 20 m |
| Parametros totales | 24.785.089 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, no de texto) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el model card menciona fp16 autocast) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (convertido desde `depth_anything_v2_metric_hypersim_vits.pth`) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de Depth Anything V2: un backbone DINOv2 ViT-S/14 preentrenado que extrae características y una cabeza DPT que las transforma en un mapa de profundidad. En esta variante métrica, la salida se normaliza con una activación `Sigmoid()` multiplicada por `max_depth = 20`, de modo que `predicted_depth` se expresa directamente en metros con un techo de 20 m. El modelo fue entrenado sobre el dataset Hypersim, según indica el nombre y la model card del autor del port.

El port conserva los submódulos originales (`pretrained`: DINOv2 ViT-S/14; `depth_head`: DPT) y calcula la profundidad con el `forward` de la clase métrica de `metric_depth/`. El código se vendorizó desde DepthAnything/Depth-Anything-V2 en el commit `a561b849` en los ficheros `dav2_dinov2.py`, `dav2_dpt.py`, `dav2_metric_dinov2.py` y `dav2_metric_dpt.py`, con cambios limitados a imports y a la sustitución de `Block` por `NestedTensorBlock` donde el original importaba `NestedTensorBlock as Block`. Se verificó contra el código oficial en una V100 con tres imágenes (incluida una no cuadrada): preprocesado, `predicted_depth`, hidden states, `infer_image`, post-procesado del processor y salidas con autocast fp16 resultaron bit-idénticos.

La innovación técnica destacable no está en el entrenamiento (que es el del modelo original) sino en la fidelidad de la implementación: frente a `DepthAnythingForDepthEstimation` de `transformers`, que solo coincide con el original en entradas cuadradas, este paquete reproduce exactamente la interpolación de los position embeddings de DINOv2 del código de referencia.

## Capacidades

- Estimación de profundidad métrica monocular a partir de una imagen RGB, con salida en metros y techo de 20 m.
- Extracción de características mediante DINOv2 ViT-S/14; `output_hidden_states=True` expone las features que consume la cabeza DPT.
- Inferencia compatible con la API de `transformers`: `AutoModelForDepthEstimation` y `AutoProcessor` con `trust_remote_code=True`.
- Post-procesado de profundidad con `post_process_depth_estimation`, que redimensiona con interpolación bilineal y `align_corners=True` como el `infer_image` original.
- Método `infer_image` conservado del código oficial para inferencia directa sobre arrays leídos con OpenCV.
- Soporte de autocast fp16 verificado bit-idéntico al original.
- No soporta tool calling, agentes, razonamiento multi-step ni capacidades multilingües: es un modelo puramente visual de regresión densa de profundidad.

## Casos de uso

- Reconstrucción 3D y nubes de puntos: al devolver profundidad métrica en metros, la salida puede combinarse con la intrinsics de la cámara para proyectar píxeles a coordenadas 3D en escenas de interior con rangos de hasta 20 m.
- Robótica móvil en interiores: la profundidad métrica permite planificación de trayectorias y evitación de obstáculos con distancias absolutas, sin necesidad de calibrar una escala posterior.
- Realidad aumentada: inserción de objetos virtuales con oclusión coherente y escala realista en escenas capturadas con una sola cámara RGB.
- Segmentación y matting asistidos por profundidad: el mapa denso sirve como señal auxiliar para separar primer plano y fondo en pipelines de edición de imagen.
- Automoción y asistencia a la conducción en rango corto: útil para estimar distancias a obstáculos cercanos (hasta 20 m) en sistemas de aparcamiento o detección de peatones.
- Generación de datos sintéticos y aumentación: la profundidad por píxel permite aplicar efectos de desenfoque, niebla o profundidad de campo de forma físicamente plausible.
- Integración en pipelines de `transformers`: al ejecutar el código original con `trust_remote_code`, encaja en servicios que ya usan `AutoModel`/`AutoProcessor` y requieren resultados idénticos al repositorio de referencia, incluidas imágenes no cuadradas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo aporta una comparación de fidelidad numérica frente a la reimplementación de `transformers`: en entradas no cuadradas, la diferencia máxima de profundidad relativa medida en la variante Small es de 0,8–1,9 %.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para los 24,78 millones de parámetros; en la práctica, el consumo depende de la resolución de entrada y del tamaño de los mapas intermedios de DPT.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM; el autor verificó el modelo en una V100. Funciona en RTX 4090, A100, H100 y GPUs de gama media.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (GTX 1660, RTX 3060, RTX 4060 y superiores) e incluso en CPU para imágenes de resolución moderada.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (requiere `torch`, `torchvision` y `opencv-python`); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a un modelo de visión de este tipo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Salida | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Depth-Anything-V2-Metric-Hypersim-Small (este port) | 24,78 M | Profundidad métrica (m, máx. 20) | Imagen RGB, resolución variable | Apache-2.0 | HuggingFace, `trust_remote_code` |
| depth-anything/Depth-Anything-V2-Metric-Hypersim-Small (original) | 24,78 M | Profundidad métrica (m, máx. 20) | Imagen RGB, resolución variable | Apache-2.0 | HuggingFace, código original `.pth` |
| DepthAnythingForDepthEstimation (`-hf` de transformers) | no disponible | Profundidad (relativa o métrica según checkpoint) | Imagen RGB; solo coincide con el original en entradas cuadradas | Apache-2.0 | Integrado en `transformers` sin `trust_remote_code` |
| Depth Anything V2 Relative Small | 24,78 M | Profundidad relativa | Imagen RGB, resolución variable | Apache-2.0 | HuggingFace |

La diferencia principal entre este port y la versión `-hf` de `transformers` es la fidelidad: este ejecuta los módulos originales y es bit-idéntico, mientras que la reimplementación diverge en entradas no cuadradas. Frente al checkpoint original en `.pth`, este port ofrece la misma numeración pero con la API de `transformers`.

## Limitaciones y advertencias

- Es un port no oficial: el autor declara explícitamente que no es un lanzamiento oficial de Depth Anything V2.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio; conviene auditar el código antes de usarlo en producción.
- La profundidad está acotada a un máximo de 20 m por diseño (`max_depth = 20`); escenas exteriores o de largo alcance quedan fuera de rango.
- Entrenado sobre Hypersim, un dataset de interiores sintéticos; el rendimiento en escenas exteriores o dominios distintos puede degradarse.
- No se documentan sesgos específicos, pero al ser un modelo visual hereda los sesgos de los datos de entrenamiento de Hypersim y DINOv2.
- Riesgo de alucinación en regiones ambiguas o sin textura: la profundidad es una predicción densa y puede producir artefactos en superficies reflectantes, transparentes o con iluminación extrema.
- No hay información sobre idiomas soportados porque el modelo no procesa texto.
- La licencia Apache-2.0 permite uso comercial, pero debe conservarse la atribución indicada en el fichero `NOTICE` y citarse el trabajo original.
- El repositorio tiene muy poca tracción (16 descargas, 0 likes en el momento de la consulta); conviene validar el comportamiento en el caso de uso concreto antes de adoptarlo.

## Enlaces

- HuggingFace: https://huggingface.co/bigshanedogg/Depth-Anything-V2-Metric-Hypersim-Small
- Modelo base: https://huggingface.co/depth-anything/Depth-Anything-V2-Metric-Hypersim-Small
- Repositorio oficial: https://github.com/DepthAnything/Depth-Anything-V2
- Paper Depth Anything V2: https://arxiv.org/abs/2406.09414
- Paper Depth Anything V1: https://arxiv.org/abs/2401.10891
