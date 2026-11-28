# dronefreak/bdd100k-syscv-sparse-rcnn-r50-fpn-1x

## Resumen

Sparse R-CNN R50-FPN 1x sobre BDD100K es un detector de objetos de dos etapas con propuestas aprendibles, entrenado específicamente para escenas de conducción. Lo desarrolla el grupo SysCV de la ETH Zurich como parte de su *model zoo* de detectores para BDD100K, y este repositorio de Hugging Face es un espejo publicado por el usuario `dronefreak` que recupera los pesos originales desde la Wayback Machine (captura del 19 de febrero de 2025), ya que el host oficial `dl.cv.ethz.ch` está fuera de servicio.

El modelo resuelve la detección de 10 clases de tráfico (peatón, ciclista, coche, camión, autobús, tren, motocicleta, bicicleta, semáforo y señal de tráfico) sobre imágenes de 1280 x 720, el tamaño nativo de BDD100K, sin reescalado. Emplea un backbone ResNet-50 con FPN inicializado con pesos de ImageNet y la cabeza Sparse R-CNN propuesta en el paper CVPR 2021 de Sun et al., con 106,2 millones de parámetros totales.

Su relevancia actual es fundamentalmente práctica: el espejo añade un entorno fijado (torch 2.0.1, mmcv-full 1.7.2, mmdetection 2.28.2 sobre Python 3.10), un script de inferencia que acepta imagen, carpeta, vídeo o webcam, y verificación de pesos por MD5. Es un artefacto de referencia para reproducir resultados y para pipelines de percepción en conducción autónoma, no un modelo de propósito general.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sparse R-CNN con backbone ResNet-50 + FPN (detección de objetos de dos etapas con propuestas aprendibles) |
| Parametros totales | 106.236.068 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de imagen 1280 x 720) |
| Tipos de cuantizacion | no disponible (pesos en safetensors de precisión completa; no se documentan variantes GGUF, ONNX ni INT8) |
| Idiomas soportados | no aplica (modelo de visión; sin capacidades de texto) |
| Licencia | BDD100K (`license: other`, `license_name: bdd100k`): uso educativo, de investigación y sin ánimo de lucro. La configuración de SysCV es Apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`, mismos tensores que el `.pth` original); `config.json` resumen; carpeta `original/` con MD5, predicciones y scores de validación archivados |

## Arquitectura y entrenamiento

Sparse R-CNN sustituye el generador de propuestas denso (RPN) por un conjunto fijo de propuestas aprendibles (N cajas y N embeddings de características) que se refinan iterativamente en la cabeza, lo que elimina la necesidad de supresión no máxima (NMS) y de anclas. El backbone es un ResNet-50 con FPN inicializado con pesos `torchvision://resnet50` de ImageNet. La entrada es la imagen nativa de BDD100K a 1280 x 720 píxeles en RGB, normalizada con media y desviación típica de ImageNet, sin reescalado.

El entrenamiento se realizó sobre el split de entrenamiento de BDD100K (70.000 imágenes) durante 12 épocas (protocolo 1x), con AdamW, learning rate 2,5e-05, weight decay 1e-04, decaimiento del learning rate en las épocas 8 y 11, y batch de 32 (8 GPUs x 4 imágenes). La inferencia limita la salida a un máximo de 100 cajas por imagen. El modelo no incorpora innovaciones adicionales como decodificación especulativa ni atención lineal; es una implementación estándar de mmdetection 2.x.

## Capacidades

- Detección de objetos en imágenes de escenas de conducción para 10 clases: peatón, ciclista, coche, camión, autobús, tren, motocicleta, bicicleta, semáforo y señal de tráfico.
- Salida en formato COCO-style con cajas, etiquetas y puntuaciones de confianza; exportación a formato BDD100K mediante `--json`.
- Inferencia sobre imagen individual, carpeta de imágenes, archivo de vídeo y webcam en directo (`infer.py 0 --show`).
- Umbral de puntuación configurable (`--score-thr`, por defecto 0,3) y límite de fotogramas procesados (`--max-frames`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: es exclusivamente un modelo de visión por computador.
- No dispone de modo *thinking*, visión-lenguaje, audio ni generación de texto.

## Casos de uso

- Percepción en vehículos autónomos y ADAS: el modelo detecta las 10 clases de tráfico relevantes sobre imágenes a resolución nativa 1280 x 720, lo que permite alimentar módulos de planificación y control con cajas y etiquetas por fotograma.
- Anotación asistida y pre-etiquetado de datasets de conducción: con 26,7 AP en validación, sirve como generador de propuestas para revisión humana, reduciendo el coste de etiquetado de nuevas grabaciones con el mismo formato BDD100K.
- Análisis de vídeo de tráfico urbano: el script de inferencia acepta archivos de vídeo y produce detecciones por fotograma con un coste de 0,05 s/imagen en una RTX 4070 SUPER, adecuado para procesar clips cortos o muestras de tráfico.
- Monitorización de seguridad vial en cámaras fijas: detección de peatones, ciclistas y vehículos en intersecciones, con umbral de confianza ajustable para equilibrar falsos positivos y falsos negativos.
- Investigación en detección de objetos: reproducción de resultados del *model zoo* de SysCV y comparación de métodos (Sparse R-CNN frente a Faster R-CNN, DETR, etc.) sobre un benchmark público con predicciones de validación archivadas.
- Validación de pipelines de despliegue: el entorno fijado (CUDA 11.8 o CPU) y la verificación por MD5 permiten comprobar la integridad de pesos y la reproducibilidad de inferencias en distintas máquinas antes de integrar el modelo en producción.
- Robótica y simulación: integración en entornos simulados de conducción para generar etiquetas de percepción sintética o realista con un modelo ligero (106 M de parámetros) que cabe en GPU de consumo.

## Benchmarks y rendimiento

Resultados declarados por SysCV (no verificados de forma independiente; `verified: false` en el model-index). AP estilo COCO (%) sobre BDD100K:

| Split | AP | AP50 | AP75 | APs | APm | APl |
|---|---|---|---|---|---|---|
| val | 26,7 | 49,4 | 24,7 | 12,4 | 29,9 | 45,6 |
| test | 25,5 | 46,7 | 24,2 | 12,3 | 29,9 | 41,5 |

AP por clase en validación:

| Clase | AP |
|---|---|
| pedestrian | 27,6 |
| rider | 17,3 |
| car | 47,5 |
| truck | 38,6 |
| bus | 42,2 |
| train | 0,0 |
| motorcycle | 16,8 |
| bicycle | 17,4 |
| traffic light | 24,0 |
| traffic sign | 35,7 |

Rendimiento de inferencia declarado por el autor del espejo: 0,05 s/imagen en una RTX 4070 SUPER y 1,3 s/imagen en CPU con 8 hilos, con un máximo de 100 cajas por imagen.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. Con 106,2 M de parámetros en precisión completa (FP32), los pesos ocupan aproximadamente 0,42 GB; el consumo real de VRAM depende del tamaño de lote y de las activaciones a 1280 x 720, pero el modelo es holgado para GPUs de consumo.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA 11.8; el autor reporta funcionamiento en una RTX 4070 SUPER. Para lotes grandes o procesamiento masivo, A100 o H100 son adecuadas pero no necesarias.
- Cabe en GPU de consumo: sí, con toda probabilidad en tarjetas de 8 GB o más (RTX 3060, 4060, 4070, 4090), aunque no se documenta el pico exacto de memoria.
- Opciones de despliegue: mmdetection 2.28.2 con mmcv-full 1.7.2 sobre torch 2.0.1 y Python 3.10 (entorno fijado en `env/requirements-cu118.txt` o `env/requirements-cpu.txt`); script `infer.py` incluido. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: 0,05 s/imagen en RTX 4070 SUPER (aproximadamente 20 imágenes/s) y 1,3 s/imagen en CPU con 8 hilos (aproximadamente 0,77 imágenes/s).

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos alternativos en la información proporcionada, por lo que la comparación cuantitativa no está disponible. Cualitativamente:

| Modelo | Parámetros | Contexto/entrada | AP en BDD100K val | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sparse R-CNN R50-FPN 1x (este) | 106,2 M | 1280 x 720 | 26,7 | BDD100K (solo investigación) | Espejo en HF; host original caído |
| Otros detectores del zoo SysCV (Faster R-CNN, DETR, etc.) | no disponible | no disponible | no disponible | Apache-2.0 (config) / BDD100K (pesos) | Parcialmente afectados por la caída de `dl.cv.ethz.ch` |
| Detectores genéricos COCO (p. ej. Faster R-CNN R50-FPN) | ~41 M | variable | no evaluado en BDD100K | Apache-2.0 / MIT según implementación | Amplia |

La comparación con alternativas concretas requeriría ejecutar los modelos sobre el mismo split de validación, algo que no se ha hecho en la información disponible.

## Limitaciones y advertencias

- Rendimiento bajo en clases minoritarias: AP de 0,0 en tren, 16,8 en motocicleta, 17,3 en rider y 17,4 en bicicleta, lo que refleja el desbalanceo del dataset y limita su uso en escenarios con estos actores.
- AP global moderado (26,7 en validación), insuficiente para producción de seguridad crítica sin un sistema de respaldo o verificación humana.
- Riesgo de falsos negativos y positivos en condiciones adversas (noche, lluvia, deslumbramiento), no cuantificado en la información disponible.
- Diferencias de reproducción: en 20 imágenes aleatorias de validación, 1912 de 2000 cajas coinciden exactamente con las predicciones publicadas por SysCV en GPU, y 2000 coinciden con IoU >= 0,5; la causa de la discrepancia es desconocida. No es una reproducción bit a bit.
- Licencia restrictiva: los pesos están bajo la licencia BDD100K, que permite uso educativo, de investigación y sin ánimo de lucro; el uso comercial requiere autorización expresa y no está cubierto por la licencia del repositorio.
- Sin capacidades de texto ni multilingües: no es un modelo de lenguaje y no debe evaluarse como tal.
- Entorno frágil: depende de mmdetection 2.x, mmcv-full 1.7.2 y torch 2.0.1; versiones más recientes de estas librerías pueden romper la compatibilidad, por lo que se recomienda un entorno virtual aislado.
- Sin garantías de mantenimiento: el repositorio es un espejo de un modelo cuyo host original está caído; no hay soporte oficial del autor original.
- Entrada fija a 1280 x 720 sin reescalado: imágenes de otras resoluciones pueden degradar el rendimiento o requerir preprocesado adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dronefreak/bdd100k-syscv-sparse-rcnn-r50-fpn-1x
- Repositorio SysCV BDD100K models (ETH Zurich): https://github.com/SysCV/bdd100k-models/tree/main/det
- Configuración original de SysCV: https://github.com/SysCV/bdd100k-models/blob/0935a8a3eb4c7442efdce2a8ce4b93fbe585be15/det/configs/det/sparse_rcnn_r50_fpn_1x_det_bdd100k.py
- Paper Sparse R-CNN (CVPR 2021): https://arxiv.org/abs/2011.12450
- Licencia BDD100K: https://huggingface.co/dronefreak/bdd100k-syscv-sparse-rcnn-r50-fpn-1x/blob/main/LICENSE.txt
- Dataset BDD100K en Hugging Face: https://huggingface.co/datasets/dronefreak/BDD100K
- Paper BDD100K (CVPR 2020): https://arxiv.org/abs/1805.04687 (referencia de la cita incluida en la model card)
