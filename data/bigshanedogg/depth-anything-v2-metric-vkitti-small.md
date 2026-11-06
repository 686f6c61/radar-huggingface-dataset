# bigshanedogg/Depth-Anything-V2-Metric-VKITTI-Small

## Resumen

Depth-Anything-V2-Metric-VKITTI-Small es un port no oficial al formato `transformers` del modelo de estimacion de profundidad metrica Depth Anything V2, en su variante Small entrenada sobre el conjunto de datos sintetico VKITTI. El modelo original fue desarrollado por Lihe Yang, Bingyi Kang, Zilong Huang, Zhen Zhao, Xiaogang Xu, Jiashi Feng y Hengshuang Zhao (publicado en arXiv 2406.09414), mientras que este port lo mantiene el usuario de Hugging Face `bigshanedogg`. El repositorio empaqueta los pesos originales (`depth_anything_v2_metric_vkitti_vits.pth`) en `safetensors` y el codigo original de inferencia, de modo que se puede cargar con la API estandar de `transformers` mediante `trust_remote_code=True`.

El modelo resuelve el problema de la estimacion de profundidad metrica a partir de una unica imagen RGB, es decir, no solo predice un mapa de profundidad relativo, sino distancias absolutas en metros (hasta un maximo de 80 m) gracias a una cabeza DPT con activacion `Sigmoid()` escalada por `max_depth`. La arquitectura combina un backbone DINOv2 ViT-S/14 (aproximadamente 24,8 millones de parametros totales) con una cabeza de decodificacion DPT. Esta variante concreta esta especializada en escenas de conduccion del dataset VKITTI.

La relevancia de este repositorio es doble: por un lado, permite usar el modelo original dentro del ecosistema `transformers` sin depender de los scripts de `metric_depth/` del repositorio oficial; por otro, el autor documenta que la reimplementacion nativa de `transformers` (`DepthAnythingForDepthEstimation`) diverge del codigo original en entradas no cuadradas (0,8-1,9 % de diferencia relativa maxima en Small) por la interpolacion de los embeddings posicionales de DINOv2, mientras que este port reproduce el comportamiento original de forma bit-identica. Es, por tanto, una pieza util para pipelines que necesitan fidelidad numerica respecto al codigo de referencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DINOv2 ViT-S/14 (backbone) + cabecera DPT (depth head) |
| Parametros totales | 24.785.089 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de texto) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el autor menciona autocast fp16 en la verificacion) |
| Idiomas soportados | no aplica (modelo de vision; sin capacidades linguisticas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`), convertido desde `.pth` |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de Depth Anything V2: un backbone transformer de vision DINOv2 en variante ViT-S/14 (parche de 14x14, dimension small) que actua como extractor de caracteristicas, seguido de una cabeza de decodificacion DPT que combina las caracteristicas multi-escala del backbone para producir un mapa de profundidad denso. En esta variante metrica, la salida de la cabeza pasa por una activacion `Sigmoid()` multiplicada por `max_depth = 80` metros, de modo que el modelo devuelve profundidad absoluta en metros en lugar de profundidad relativa. El codigo se ha incorporado ("vendored") desde el repositorio oficial DepthAnything/Depth-Anything-V2 en el commit `a561b849`, con cambios minimos en imports y en el uso de `NestedTensorBlock`, y mantiene las funciones originales `infer_image` e `image2tensor`.

El entrenamiento de esta variante concreta se realizo sobre VKITTI, un dataset sintetico de escenas de conduccion con profundidad metrica anotada, segun indica la model card al referirse al checkpoint `depth_anything_v2_metric_vkitti_vits.pth`. No se detalla en la informacion disponible el numero de tokens o imagenes de entrenamiento, la composicion exacta del dataset ni si hubo etapas de ajuste fino adicionales mas alla del entrenamiento metrico sobre VKITTI. La innovacion tecnica destacable de este repositorio no esta en el modelo en si, sino en el empaquetado: reproduce el codigo original dentro de `transformers` y verifica igualdad bit a bit con el codigo oficial en preprocesado, `predicted_depth`, estados ocultos, `infer_image`, post-procesado y salidas en autocast fp16 (probado en V100 con tres imagenes, incluyendo no cuadradas).

## Capacidades

- Estimacion de profundidad metrica a partir de una unica imagen RGB, con salida en metros (rango hasta 80 m).
- Generacion de mapas de profundidad densos por pixel (`predicted_depth` con forma `(1, H', W')`).
- Extraccion de caracteristicas de vision mediante el backbone DINOv2 ViT-S/14 (soporta `output_hidden_states=True`).
- Inferencia con la API estandar de `transformers` (`AutoModelForDepthEstimation`, `AutoProcessor`) mediante `trust_remote_code=True`.
- Compatibilidad con el flujo original del repositorio oficial (`model.infer_image(cv2.imread(...))`).
- Post-procesado de profundidad con redimensionado bilineal y `align_corners=True`, replicando el comportamiento original.
- Soporte de ejecucion en fp16 mediante autocast (verificado por el autor).
- No dispone de capacidades de texto, razonamiento, codigo, tool calling, agentes ni multilingues: es un modelo puramente visual de regresion densa.

## Casos de uso

- Estimacion de profundidad en conduccion autonoma y ADAS: al estar entrenado sobre VKITTI (escenas de conduccion), es adecuado para generar mapas de distancia en metros de obstaculos, vehiculos y calzada a partir de camaras monoculares, con un rango de hasta 80 m.
- Reconstruccion 3D y mapeo: los mapas de profundidad metrica permiten back-projectar pixeles a nubes de puntos 3D calibradas en metros, utiles para SLAM monocular o fusion con LiDAR.
- Robotica movil y navegacion: la profundidad absoluta facilita la planificacion de trayectorias y la evitacion de obstaculos sin necesidad de calibracion adicional de escala.
- Realidad aumentada y efectos de desenfoque: la profundidad metrica permite colocar objetos virtuales con oclusion correcta o aplicar profundidad de campo sintetica en postproduccion.
- Analisis de escenas urbanas y de trafico: segmentacion por distancia de peatones, senalizacion y vehiculos para analitica de video o simulacion.
- Validacion y reproduccion de investigacion: al ser bit-identico al codigo oficial, sirve para reproducir resultados de Depth Anything V2 en entornos `transformers` y comparar con la reimplementacion nativa (`-hf`).
- Preprocesado para pipelines multimodales: generar mapas de profundidad como entrada auxiliar para modelos de segmentacion, deteccion o planificacion que requieran informacion geometrica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta una comparacion de fidelidad frente al codigo oficial: en entradas no cuadradas, la reimplementacion nativa de `transformers` presenta una diferencia relativa maxima de profundidad de entre 0,8 % y 1,9 % en la variante Small, mientras que este port es bit-identico al codigo original en las pruebas realizadas (V100, tres imagenes).

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 24,8 millones de parametros, por lo que en fp32 ocupa aproximadamente 100 MB de pesos y en fp16 alrededor de 50 MB; con activaciones y buffers de inferencia, cabe holgadamente en GPUs con 2-4 GB de VRAM.
- GPU recomendadas: cualquier GPU moderna es suficiente; el autor verifico en una V100. Funciona en RTX 3090, RTX 4090, A100, H100 y GPUs de gama media como RTX 3060 o T4.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer con al menos 2 GB de VRAM; tambien puede ejecutarse en CPU para inferencia no interactiva.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (requiere `torch`, `torchvision` y `opencv-python`); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que estan orientadas a modelos de lenguaje y no aplican a este modelo de vision.
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano del modelo (ViT-S/14) se espera una latencia baja en GPU, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo de profundidad | Entrenamiento | Licencia | Formato |
|---|---|---|---|---|---|
| Depth-Anything-V2-Metric-VKITTI-Small (este port) | 24.785.089 | Metrica (hasta 80 m) | VKITTI | Apache-2.0 | safetensors + codigo original |
| depth-anything/Depth-Anything-V2-Metric-VKITTI-Small (original) | no disponible en la informacion | Metrica (hasta 80 m) | VKITTI | Apache-2.0 | `.pth` (PyTorch) |
| DepthAnythingForDepthEstimation (`-hf`, reimplementacion nativa) | no disponible en la informacion | Metrica/relativa segun checkpoint | Segun checkpoint | Apache-2.0 | transformers nativo |
| Depth Anything V2 (variantes Base/Large) | no disponible en la informacion | Metrica o relativa | Distintos datasets | Apache-2.0 | `.pth` / transformers |

La comparativa se limita a las variantes del propio Depth Anything V2 porque la informacion proporcionada no incluye datos de otros modelos de estimacion de profundidad (por ejemplo, MiDaS o Metric3D) que permitan una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- Modelo especializado en escenas de conduccion (VKITTI): su rendimiento fuera de ese dominio (interiores, escenas aereas, primeros planos) puede degradarse y no esta cuantificado en la informacion disponible.
- Rango de profundidad limitado a 80 m por el escalado `Sigmoid()` x `max_depth`; objetos mas lejanos quedan saturados.
- Es un port no oficial: el autor no es el desarrollador original y no hay garantia de mantenimiento; requiere `trust_remote_code=True`, lo que implica ejecutar codigo del repositorio.
- Dependencia de `opencv-python` y `torchvision` adicionales a `torch`/`transformers` para el flujo completo.
- No se documentan sesgos especificos, pero al entrenarse sobre datos sinteticos de conduccion puede heredar sesgos de ese dataset (iluminacion, geografia y tipos de escena sinteticos).
- Riesgo de alucinacion geometrica: como todo modelo de profundidad monocular, puede producir estimaciones plausibles pero incorrectas en superficies reflectantes, transparentes o con texturas repetitivas; no se aportan metricas de error en la informacion disponible.
- Sin capacidades linguisticas ni multilingues; no aplica el uso como modelo de texto.
- Licencia Apache-2.0 permite uso comercial, pero se recomienda conservar la atribucion y citar el trabajo original segun piden sus autores.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/bigshanedogg/Depth-Anything-V2-Metric-VKITTI-Small
- Modelo base: https://huggingface.co/depth-anything/Depth-Anything-V2-Metric-VKITTI-Small
- Repositorio oficial de codigo: https://github.com/DepthAnything/Depth-Anything-V2
- Paper Depth Anything V2: https://arxiv.org/abs/2406.09414
- Paper Depth Anything V1: https://arxiv.org/abs/2401.10891
