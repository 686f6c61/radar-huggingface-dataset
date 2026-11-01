# bigshanedogg/Depth-Anything-V2-Metric-VKITTI-Large

## Resumen

Depth-Anything-V2-Metric-VKITTI-Large es un modelo de estimación de profundidad métrica (monocular) basado en la arquitectura Depth Anything V2, desarrollado originalmente por Lihe Yang, Bingyi Kang, Zilong Huang, Zhen Zhao, Xiaogang Xu, Jiashi Feng y Hengshuang Zhao. Esta ficha concreta, publicada por el usuario `bigshanedogg`, es un port no oficial al formato `transformers` que ejecuta el código original del modelo en lugar de la reimplementación nativa de la librería.

El modelo combina un backbone DINOv2 ViT-L/14 (encoder) con una cabeza DPT (Depth Prediction Transformer) que produce profundidad métrica en metros, con un rango máximo de 80 m, tras un ajuste fino sobre el conjunto de datos VKITTI. Con 335 millones de parámetros, resuelve el problema de obtener mapas de profundidad absolutos (no solo relativos) a partir de una única imagen RGB, algo relevante para robótica, conducción autónoma y reconstrucción 3D.

La relevancia de este port radica en que reproduce de forma bit-idéntica las salidas del código oficial (verificado en V100 con imágenes cuadradas y no cuadradas), mientras que la implementación nativa `DepthAnythingForDepthEstimation` de `transformers` diverge en entradas no cuadradas por diferencias en la interpolación de los embeddings posicionales de DINOv2 (0,8–1,9 % de diferencia relativa máxima medida en la variante Small).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DINOv2 ViT-L/14 (encoder) + DPT (cabeza de profundidad), transformer de visión |
| Parametros totales | 335.315.649 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, no de texto; procesa una imagen por inferencia) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el autor no documenta cuantizaciones) |
| Idiomas soportados | no disponible (modelo de visión, independiente del idioma) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`), convertido desde `.pth` |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Depth Anything V2 en su variante métrica: un encoder DINOv2 ViT-L/14 preentrenado que extrae características visuales y una cabeza DPT que las transforma en un mapa de profundidad denso. La cabeza incluye una activación `Sigmoid()` multiplicada por `max_depth = 80 m`, lo que acota la salida al rango métrico entrenado. El port mantiene los submódulos oficiales (`pretrained` y `depth_head`) y calcula la profundidad con el `forward` original de la clase de profundidad métrica de `metric_depth/`, devolviendo un `DepthEstimatorOutput` con `predicted_depth`. También conserva las funciones oficiales `infer_image` e `image2tensor`.

El ajuste fino se realizó sobre el conjunto VKITTI, orientado a profundidad métrica en escenas de conducción. El código se ha vendorizado desde el repositorio oficial (commit a561b849) en los ficheros `dav2_dinov2.py`, `dav2_dpt.py`, `dav2_metric_dinov2.py` y `dav2_metric_dpt.py`, con cambios mínimos en imports y en el uso de `NestedTensorBlock`. No se documentan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas de RLHF o DPO (no aplicables a un modelo de visión). La innovación técnica destacable es la fidelidad bit a bit con el código original, incluyendo el posprocesado con interpolación bilineal y `align_corners=True`, frente al posprocesado bicúbico de `transformers`.

## Capacidades

- Estimación de profundidad métrica monocular a partir de una imagen RGB, con salida en metros y límite máximo de 80 m.
- Extracción de características visuales mediante el backbone DINOv2 ViT-L/14 (disponible con `output_hidden_states=True`).
- Posprocesado de profundidad a resolución objetivo mediante `post_process_depth_estimation`, replicando el comportamiento de `infer_image`.
- Compatibilidad con `AutoModelForDepthEstimation` y `AutoProcessor` de `transformers` usando `trust_remote_code=True`.
- Soporte de precisión mixta (fp16 autocast) con salidas verificadas como idénticas al código oficial.
- No soporta tool calling, function calling, agentes, razonamiento multi-step ni generación de texto: es un modelo puramente visual de regresión densa.
- Capacidades multilingües no aplicables.

## Casos de uso

- Conducción autónoma y ADAS: estimación de distancia a obstáculos y vehículos en escenas viales, aprovechando que el ajuste sobre VKITTI está orientado a este dominio y que la salida es métrica en metros.
- Robótica móvil: generación de mapas de profundidad para navegación y evitación de colisiones con una única cámara monocular, reduciendo coste de sensórica frente a LiDAR.
- Reconstrucción 3D y fotogrametría: conversión de imágenes individuales en nubes de puntos o mallas densas usando la profundidad métrica como entrada.
- Realidad aumentada: colocación de objetos virtuales con escala realista en el entorno capturado por la cámara del dispositivo.
- Inspección industrial y medición: estimación de distancias en escenas controladas dentro del rango de 80 m, con la ventaja de que el port reproduce exactamente las salidas del código oficial.
- Investigación en visión por computador: banco de pruebas para comparar la implementación original frente a la nativa de `transformers`, especialmente en entradas no cuadradas.
- Automoción y análisis de vídeo: procesamiento por fotogramas de secuencias de cámara para generar mapas de profundidad temporales en pipelines de percepción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta una comparación de fidelidad frente al código oficial (diferencias de 0,8–1,9 % de profundidad relativa máxima en la variante Small para entradas no cuadradas) y la verificación bit a bit en V100 con tres imágenes, pero no incluye métricas estándar como AbsRel, RMSE o δ1 sobre VKITTI u otros conjuntos.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,3 GB en fp32 para los pesos (335 M de parámetros), más memoria de activaciones; en la práctica se recomienda al menos 4–6 GB para imágenes de resolución moderada.
- GPU recomendadas: NVIDIA V100 (verificada por el autor), A100, H100 para lotes grandes o alta resolución; RTX 4090 y RTX 3090 sobradas para inferencia individual.
- Cabe en GPU de consumo: sí, en tarjetas con 6 GB o más (RTX 3060, RTX 4060, RTX 2070 y superiores), gracias al tamaño reducido del checkpoint.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (vía principal documentada), PyTorch nativo con el código oficial, y exportación a ONNX/TensorRT no documentada en la información disponible.
- Latencia y throughput: no disponibles de forma oficial; el autor solo menciona verificación en V100 sin cifras de tiempo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Depth-Anything-V2-Metric-VKITTI-Large (este port) | 335 M | Una imagen RGB | Profundidad métrica (máx. 80 m) | Apache-2.0 | HuggingFace (`bigshanedogg`) |
| depth-anything/Depth-Anything-V2-Metric-VKITTI-Large (original) | 335 M | Una imagen RGB | Profundidad métrica (máx. 80 m) | Apache-2.0 | HuggingFace (oficial) |
| Depth-Anything-V2 (variantes relativas, Small/Base/Large) | 24–335 M | Una imagen RGB | Profundidad relativa | Apache-2.0 | HuggingFace (oficial) |
| `DepthAnythingForDepthEstimation` nativo de `transformers` | Según checkpoint | Una imagen RGB | Profundidad (relativa o métrica según checkpoint) | Apache-2.0 | Incluido en `transformers` |

La diferencia clave frente al modelo oficial es el formato de pesos (safetensors con nombres originales) y la ejecución del código original; frente a la implementación nativa de `transformers`, la ventaja es la coincidencia bit a bit en entradas no cuadradas.

## Limitaciones y advertencias

- Es un port no oficial: no está respaldado por los autores originales de Depth Anything V2 y solo cuenta con 12 descargas y 0 likes en el momento de la ficha.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio; conviene auditar los ficheros antes de usarlo en producción.
- La profundidad está acotada a 80 m por diseño (`max_depth`), por lo que escenas con objetos más lejanos quedan saturadas en el límite superior.
- El ajuste fino sobre VKITTI puede introducir sesgo de dominio hacia escenas de conducción; el rendimiento en otros entornos (interiores, aéreos, médicos) no está documentado.
- Riesgo de alucinación de profundidad en superficies reflectantes, transparentes, texturas repetitivas o regiones ocluidas, inherente a los modelos monoculares.
- No se documentan sesgos demográficos o geográficos específicos, pero al ser un modelo visual entrenado con datos limitados a un dominio concreto, la generalización es incierta.
- La licencia Apache-2.0 permite uso comercial, pero debe mantenerse la atribución indicada en `NOTICE` y citar el trabajo original.
- No se proporcionan cuantizaciones ni formatos GGUF/ONNX, lo que limita el despliegue en entornos sin PyTorch.
- La model card no incluye métricas de error (AbsRel, RMSE) que permitan evaluar la precisión real en producción.

## Enlaces

- HuggingFace del port: https://huggingface.co/bigshanedogg/Depth-Anything-V2-Metric-VKITTI-Large
- Modelo original: https://huggingface.co/depth-anything/Depth-Anything-V2-Metric-VKITTI-Large
- Repositorio oficial: https://github.com/DepthAnything/Depth-Anything-V2
- Paper Depth Anything V2: https://arxiv.org/abs/2406.09414
- Paper Depth Anything V1: https://arxiv.org/abs/2401.10891
