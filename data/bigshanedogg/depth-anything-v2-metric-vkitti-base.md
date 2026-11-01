# bigshanedogg/Depth-Anything-V2-Metric-VKITTI-Base

## Resumen

Depth-Anything-V2-Metric-VKITTI-Base es un port no oficial al formato transformers del modelo de estimación de profundidad métrica Depth Anything V2, en su variante Base y afinada sobre el conjunto de datos VKITTI. El modelo original fue desarrollado por Lihe Yang, Bingyi Kang, Zilong Huang, Zhen Zhao, Xiaogang Xu, Jiashi Feng y Hengshuang Zhao (arXiv 2406.09414), y este port lo publica el usuario bigshanedogg. El problema que resuelve es la predicción de profundidad absoluta en metros a partir de una única imagen RGB, a diferencia de las variantes de profundidad relativa.

La relevancia de este repositorio es fundamentalmente de ingeniería: empaqueta los tensores originales del checkpoint `depth_anything_v2_metric_vkitti_vitb.pth` bajo sus nombres originales en `model.safetensors` y ejecuta el código original de Depth Anything V2 mediante `trust_remote_code`. Esto evita las diferencias que la reimplementación nativa de transformers (`DepthAnythingForDepthEstimation`, usada en los repos `-hf`) introduce en la interpolación de los embeddings posicionales de DINOv2 para entradas no cuadradas, con diferencias de profundidad relativa de entre el 0,8 % y el 1,9 % medidas en la variante Small.

Arquitectónicamente combina un backbone DINOv2 ViT-B/14 con una cabeza DPT que aplica una activación sigmoide escalada a un máximo de 80 metros, coherente con el rango de profundidad de VKITTI. El modelo tiene 97.470.785 parámetros y un repositorio de 0,4 GB, lo que lo hace manejable en GPU de consumo. El autor verifica que la inferencia es bit-idéntica al código oficial en V100 (preprocesado, `predicted_depth`, estados ocultos, `infer_image`, posprocesado y autocast fp16).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DINOv2 ViT-B/14 (backbone) + cabeza DPT con activación sigmoide escalada a 80 m |
| Parametros totales | 97.470.785 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, no de texto) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el autor menciona autocast fp16) |
| Idiomas soportados | no disponible (tarea de visión, sin procesamiento de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`), convertido desde `.pth` |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de Depth Anything V2: un transformer de visión DINOv2 ViT-B/14 como extractor de características y una cabeza DPT que transforma los mapas de características en un mapa de profundidad denso. En esta variante métrica, la salida pasa por una función sigmoide multiplicada por una profundidad máxima de 80 metros, rango derivado del conjunto de datos VKITTI sobre el que se afinó el checkpoint original. El port mantiene los submódulos oficiales (`pretrained` y `depth_head`) y calcula la profundidad con el `forward` de la clase original de `metric_depth/`, devolviendo un `DepthEstimatorOutput` con `predicted_depth`.

El entrenamiento corresponde al trabajo original de Depth Anything V2, que combina datos reales etiquetados con datos sintéticos y pseudo-etiquetados a gran escala; la información proporcionada no detalla el número de tokens ni la composición exacta del dataset de preentrenamiento, solo que esta variante se afinó sobre VKITTI. La innovación técnica destacable de este repositorio no es el entrenamiento sino el empaquetado: el código de Depth Anything V2 se ha vendorizado (commit a561b849) en `dav2_dinov2.py`, `dav2_dpt.py`, `dav2_metric_dinov2.py` y `dav2_metric_dpt.py`, con cambios mínimos en imports y el uso de `NestedTensorBlock`. La verificación frente al código oficial se realizó en una V100 con tres imágenes, incluyendo no cuadradas, comprobando igualdad bit a bit de preprocesado, salida, estados ocultos, `infer_image`, posprocesado y fp16.

## Capacidades

- Estimación de profundidad métrica densa a partir de una imagen RGB, con valores en metros y un máximo de 80 m.
- Extracción de características de visión mediante DINOv2 ViT-B/14 (el modelo está etiquetado como `feature-extraction` además de `depth-estimation`).
- Exposición de estados ocultos con `output_hidden_states=True`, útiles para tareas aguas abajo que consumen las características del backbone.
- Método `infer_image` compatible con el flujo original de los scripts oficiales (lectura con OpenCV).
- Posprocesado `post_process_depth_estimation` que replica el redimensionado bilineal con `align_corners=True` del `infer_image` original.
- Compatibilidad con autocast fp16, verificado bit-idéntico al código oficial.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente visual.

## Casos de uso

- Reconstrucción 3D y mapeo: el modelo entrega profundidad métrica en metros (hasta 80 m) directamente utilizable para generar nubes de puntos o mapas de disparidad en pipelines de fotogrametría, sin necesidad de calibrar una escala posterior.
- Navegación de robots y vehículos autónomos en entornos tipo VKITTI: al estar afinado sobre VKITTI, es adecuado para escenas de conducción simuladas o urbanas donde la profundidad absoluta es necesaria para planificación de trayectorias.
- Detección de obstáculos y evitación de colisiones: la salida métrica permite umbrales de distancia físicos (por ejemplo, alertar a menos de 10 m) en lugar de umbrales relativos, lo que simplifica la lógica de seguridad.
- Aumento de datos y síntesis: la profundidad densa sirve para generar efectos de desenfoque de profundidad de campo, oclusión o composición de nuevas vistas en postproducción.
- Preentrenamiento y transferencia: las características DINOv2 ViT-B/14 y los estados ocultos pueden alimentar cabezas de segmentación, detección o clasificación en tareas de percepción.
- Sustitución fiel del código oficial en producción: cuando se necesita reproducibilidad exacta con los scripts originales de Depth Anything V2 pero dentro del ecosistema transformers (`AutoModelForDepthEstimation`, `AutoProcessor`), este port evita las diferencias de interpolación posicional de la reimplementación nativa en entradas no cuadradas.
- Investigación comparativa: útil para medir el impacto de las diferencias de implementación (port vs. `-hf`) en métricas de profundidad sobre imágenes no cuadradas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta una comparación cualitativa y cuantitativa parcial frente a la reimplementación de transformers: en la variante Small, con entradas no cuadradas, la diferencia máxima de profundidad relativa medida es del 0,8–1,9 %, y la coincidencia con el código oficial es bit-idéntica en los elementos verificados.

## Requisitos de hardware

- VRAM estimada: con 97,5 M de parámetros, los pesos en fp32 ocupan aproximadamente 0,39 GB y en fp16 unos 0,2 GB; sumando activaciones de DINOv2 ViT-B/14 a resoluciones típicas, la inferencia cabe holgadamente en 4–6 GB de VRAM.
- GPU recomendadas: cualquier GPU con al menos 4 GB, incluidas RTX 3060, RTX 4060, RTX 4090; en servidor, V100 (verificado por el autor), A100 o H100.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPU consumer modernas con 4 GB o más.
- Opciones de despliegue: transformers con `trust_remote_code=True` (flujo documentado); no se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a un modelo de visión de este tipo. Dependencias adicionales: `opencv-python` y `torchvision`.
- Latencia y throughput: no disponibles en la información proporcionada; el autor solo indica que la verificación se hizo en una V100.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / rango | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bigshanedogg/Depth-Anything-V2-Metric-VKITTI-Base (este) | 97,5 M | imagen; profundidad máx. 80 m | métrica (metros) | Apache-2.0 | HuggingFace, 13 descargas |
| depth-anything/Depth-Anything-V2-Metric-VKITTI-Base (original) | no disponible | imagen; profundidad máx. 80 m | métrica (metros) | Apache-2.0 | HuggingFace / GitHub oficial |
| depth-anything/Depth-Anything-V2-Metric-VKITTI-Base-hf | no disponible | imagen; profundidad máx. 80 m | métrica (metros) | Apache-2.0 | HuggingFace (reimplementación transformers) |
| Depth Anything V2 Small (variante relativa) | no disponible | imagen | relativa | Apache-2.0 | HuggingFace / GitHub oficial |

La diferencia clave entre este port y la variante `-hf` es la fidelidad al código original: la reimplementación nativa de transformers solo coincide para entradas cuadradas y difiere en la interpolación de embeddings posicionales de DINOv2 en entradas no cuadradas.

## Limitaciones y advertencias

- No es un lanzamiento oficial: es un port no oficial del autor bigshanedogg; para citar o usar el modelo conviene referenciar el trabajo original de Depth Anything V2.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio; hay que auditar `dav2_*` y los ficheros de procesado antes de usarlo en producción.
- El rango de profundidad está acotado a 80 m por diseño (sigmoide × max_depth), por lo que escenas con objetos más lejanos quedarán saturadas.
- Afinado sobre VKITTI, un conjunto sintético de conducción; el rendimiento puede degradarse en dominios visuales distintos (interiores, imágenes médicas, escenas aéreas).
- No procesa texto ni soporta instrucciones, tool calling ni agentes; no aplica ninguna de las capacidades conversacionales habituales.
- Riesgo de alucinación en el sentido de predicciones de profundidad plausibles pero incorrectas en regiones ocluidas, reflectantes o con poca textura.
- Licencia Apache-2.0, que permite uso comercial, pero conviene conservar el fichero `NOTICE` con la atribución y los cambios realizados.
- Solo 13 descargas y 0 likes en el momento de la ficha: comunidad y validación externa muy limitadas.

## Enlaces

- HuggingFace: https://huggingface.co/bigshanedogg/Depth-Anything-V2-Metric-VKITTI-Base
- Modelo base: https://huggingface.co/depth-anything/Depth-Anything-V2-Metric-VKITTI-Base
- Repositorio oficial: https://github.com/DepthAnything/Depth-Anything-V2
- Paper: https://arxiv.org/abs/2406.09414
- Paper Depth Anything V1: https://arxiv.org/abs/2401.10891
