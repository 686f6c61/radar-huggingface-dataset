# bigshanedogg/Depth-Anything-V2-Metric-Hypersim-Large

## Resumen

Depth-Anything-V2-Metric-Hypersim-Large es un modelo de estimación de profundidad monocular con salida métrica (en metros), desarrollado originalmente por Lihe Yang, Bingyi Kang, Zilong Huang, Zhen Zhao, Xiaogang Xu, Jiashi Feng y Hengshuang Zhao, y publicado por la organización depth-anything. Esta ficha concreta corresponde a un port no oficial a transformers realizado por el usuario bigshanedogg, que empaqueta los pesos originales del checkpoint `depth_anything_v2_metric_hypersim_vitl.pth` en formato safetensors y ejecuta el código original mediante `trust_remote_code`.

El modelo combina un backbone DINOv2 ViT-L/14 con una cabeza DPT que aplica una activación sigmoide multiplicada por una profundidad máxima de 20 metros, ajustada sobre el dataset Hypersim. Resuelve el problema de obtener mapas de profundidad absoluta a partir de una sola imagen RGB, lo que resulta relevante para reconstrucción 3D, robótica, realidad aumentada y conducción autónoma, donde no basta con una profundidad relativa.

La relevancia de este port radica en que reproduce de forma bit a bit la implementación oficial (verificado en V100 con imágenes cuadradas y no cuadradas), a diferencia de la reimplementación nativa de transformers, que difiere entre un 0,8 % y un 1,9 % en profundidad relativa máxima para entradas no cuadradas. El modelo tiene 335.315.649 parámetros y un repositorio de 1,3 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DINOv2 ViT-L/14 (backbone) + DPT (cabeza de profundidad) |
| Parametros totales | 335.315.649 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el autor menciona fp16 autocast) |
| Idiomas soportados | no disponible (modelo de visión, independiente del idioma) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (convertido desde `.pth`) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de Depth Anything V2 en su variante métrica. El backbone es un DINOv2 ViT-L/14 preentrenado que extrae características visuales, y sobre él se monta una cabeza DPT que produce un mapa de profundidad denso. En la variante métrica, la salida pasa por una activación `Sigmoid()` multiplicada por `max_depth = 20`, de modo que `predicted_depth` se expresa en metros con un límite superior de 20 m. El modelo fue entrenado sobre el dataset Hypersim, orientado a escenas interiores sintéticas con profundidad métrica anotada.

El port mantiene los submódulos originales (`pretrained` y `depth_head`) y calcula la profundidad con el `forward` de la clase oficial de `metric_depth/`. El código se ha vendorizado desde el repositorio DepthAnything/Depth-Anything-V2 en el commit a561b849 a los ficheros `dav2_dinov2.py`, `dav2_dpt.py`, `dav2_metric_dinov2.py` y `dav2_metric_dpt.py`; los únicos cambios son ajustes de imports y la sustitución de `Block` por `NestedTensorBlock`. Se conservan las funciones oficiales `infer_image` e `image2tensor`, y el procesador `DepthAnythingV2Processor` envuelve `DepthAnythingV2ImageProcessor`. No se dispone de información sobre el número exacto de tokens de entrenamiento, la composición completa del dataset ni el uso de RLHF o DPO, dado que se trata de un modelo de visión.

## Capacidades

- Estimación de profundidad monocular métrica a partir de una imagen RGB, con salida en metros y límite de 20 m.
- Extracción de características visuales mediante el backbone DINOv2 ViT-L/14 (`output_hidden_states=True` expone las características que consume la cabeza DPT).
- Procesamiento de imágenes cuadradas y no cuadradas, con interpolación bilineal y `align_corners=True` en el postprocesado, igual que el `infer_image` original.
- Compatibilidad con `AutoModelForDepthEstimation` y `AutoProcessor` de transformers mediante `trust_remote_code=True`.
- Soporte de autocast fp16 con salidas idénticas a las del código oficial.
- No dispone de generación de texto, tool calling, capacidades de agente ni razonamiento multi-step, al no ser un modelo de lenguaje.
- No se han documentado capacidades multilingües ni modos especiales como thinking o audio.

## Casos de uso

- Reconstrucción 3D de interiores: el modelo produce profundidad métrica en metros (hasta 20 m) entrenada sobre Hypersim, lo que permite generar nubes de puntos y mallas de habitaciones a partir de una sola fotografía sin necesidad de calibración adicional.
- Robótica móvil en interiores: la salida métrica absoluta facilita la planificación de trayectorias y la evitación de obstáculos, ya que las distancias están en unidades físicas y no en escala relativa.
- Realidad aumentada: la profundidad métrica permite anclar objetos virtuales a superficies reales con una escala coherente, usando el postprocesado `post_process_depth_estimation` para ajustar la resolución a la imagen original.
- Digitalización de escenas para gemelos digitales: integrado en pipelines de fotogrametría como paso de profundidad densa por imagen, reduciendo la dependencia de múltiples vistas.
- Automoción y asistencia a la conducción en entornos controlados: útil para estimar distancias a obstáculos cercanos dentro del rango de 20 m, aunque limitado a escenas similares a las de entrenamiento.
- Investigación en visión por computador: al ser un port bit a bit del código oficial, sirve como referencia para comparar implementaciones y validar reimplementaciones nativas de transformers en entradas no cuadradas.
- Generación de datos sintéticos y aumentación: la profundidad métrica permite componer nuevas vistas o aplicar efectos de desenfoque dependientes de la distancia de forma físicamente consistente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 335,3 millones de parámetros; en fp32 requiere aproximadamente 1,3 GB solo para pesos, y en fp16 alrededor de 0,7 GB, a lo que hay que sumar activaciones y memoria del procesador de imagen.
- GPU recomendadas: el autor verificó la equivalencia con el código oficial en una NVIDIA V100; cualquier GPU con al menos 4-6 GB de VRAM debería ser suficiente para inferencia en fp16.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 y similares con 8 GB o más, e incluso en GPUs con 4 GB en fp16.
- Opciones de despliegue: transformers con `trust_remote_code=True` (requiere `opencv-python` y `torchvision` además de torch y transformers); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo de profundidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bigshanedogg/Depth-Anything-V2-Metric-Hypersim-Large (este) | 335,3 M | no aplica | Métrica (máx. 20 m), Hypersim | Apache-2.0 | HuggingFace, port no oficial |
| depth-anything/Depth-Anything-V2-Metric-Hypersim-Large (original) | 335,3 M | no aplica | Métrica (máx. 20 m), Hypersim | Apache-2.0 | HuggingFace, pesos `.pth` oficiales |
| depth-anything/Depth-Anything-V2-Large (`-hf`) | no disponible | no aplica | Relativa | Apache-2.0 | HuggingFace, reimplementación nativa de transformers |
| Depth Anything V2 Small (referencia del autor) | no disponible | no aplica | Métrica o relativa según variante | Apache-2.0 | HuggingFace |

La diferencia principal frente a la reimplementación nativa de transformers es la fidelidad numérica: el port reproduce el código oficial de forma bit a bit, mientras que la versión `-hf` difiere entre un 0,8 % y un 1,9 % en profundidad relativa máxima para entradas no cuadradas. Frente al repositorio original, este port ofrece carga directa con `AutoModelForDepthEstimation` y pesos en safetensors, a cambio de requerir `trust_remote_code`.

## Limitaciones y advertencias

- Es un port no oficial: el autor lo declara explícitamente y no cuenta con el respaldo de la organización depth-anything.
- La profundidad métrica está limitada a un máximo de 20 m y el modelo fue entrenado sobre Hypersim, por lo que su precisión fuera de escenas interiores sintéticas similares puede degradarse.
- No se dispone de información sobre sesgos del dataset de entrenamiento ni sobre evaluación en dominios distintos a Hypersim.
- Riesgo de alucinación en el sentido de predicciones de profundidad plausibles pero incorrectas en regiones ocluidas, texturas repetitivas o superficies reflectantes.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio; conviene revisar los ficheros vendorizados antes de usarlo en producción.
- Dependencias adicionales más allá de torch y transformers: `opencv-python` y `torchvision`.
- La licencia Apache-2.0 permite uso comercial, pero se debe conservar la atribución indicada en el fichero `NOTICE` y citar el trabajo original.
- No es adecuado para tareas de lenguaje, agentes o tool calling; su uso está restringido a estimación de profundidad y extracción de características visuales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/bigshanedogg/Depth-Anything-V2-Metric-Hypersim-Large
- Modelo base oficial: https://huggingface.co/depth-anything/Depth-Anything-V2-Metric-Hypersim-Large
- Repositorio oficial: https://github.com/DepthAnything/Depth-Anything-V2
- Paper Depth Anything V2: https://arxiv.org/abs/2406.09414
- Paper Depth Anything V1: https://arxiv.org/abs/2401.10891
