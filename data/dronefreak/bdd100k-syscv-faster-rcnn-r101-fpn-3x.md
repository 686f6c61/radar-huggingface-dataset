# dronefreak/bdd100k-syscv-faster-rcnn-r101-fpn-3x

## Resumen

`dronefreak/bdd100k-syscv-faster-rcnn-r101-fpn-3x` es un espejo (mirror) del checkpoint Faster R-CNN con backbone ResNet-101 y FPN entrenado sobre BDD100K que forma parte del zoo de modelos del grupo SysCV (ETH Zurich). El modelo original se distribuía desde `dl.cv.ethz.ch`, un host que actualmente está fuera de servicio; este repositorio recupera los pesos desde una captura de la Wayback Machine (19 de febrero de 2025) y los publica junto con la configuración de SysCV, un entorno Python fijado y un script de inferencia listo para usar.

Se trata de un detector de objetos de dos etapas (region proposal network más cabecera de clasificación y regresión) especializado en escenas de conducción autónoma. Detecta diez clases del benchmark BDD100K: peatón, ciclista, coche, camión, autobús, tren, motocicleta, bicicleta, semáforo y señal de tráfico. Con 60,49 millones de parámetros y pesos en formato safetensors de 0,6 GB, es un modelo ligero y desplegable en CPU o en GPUs de consumo.

Su relevancia actual es doble: por un lado, preserva un artefacto de investigación que ya no estaba accesible públicamente; por otro, ofrece una línea base reproducible (verificada bit a bit contra las predicciones publicadas por SysCV) para tareas de detección en escenas de tráfico, útil para comparaciones, fine-tuning y pipelines de percepción. La licencia BDD100K restringe el uso a fines educativos, de investigación y sin ánimo de lucro.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Faster R-CNN de dos etapas con backbone ResNet-101 + FPN (Feature Pyramid Network) |
| Parametros totales | 60.491.778 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de imagen 1280 x 720) |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors en precisión original) |
| Idiomas soportados | no aplica (modelo de visión, sin capacidades de texto) |
| Licencia | bdd100k (educational, research and not-for-profit use) |
| Formato de pesos | safetensors (`model.safetensors`), equivalente al `.pth` original; configuración `config.json` y `original_config.py` |
| Librería | mmdetection 2.28.2 (entorno fijado: torch 2.0.1, mmcv-full 1.7.2, Python 3.10) |
| Pipeline | object-detection |
| Entrada | imagen RGB 1280 x 720 (tamaño nativo BDD100K, sin redimensionado), normalización ImageNet |
| Post-proceso | umbral de score 0.05, NMS con IoU 0.5, máximo 100 cajas por imagen |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Faster R-CNN descrita en el paper de Ren et al. (NeurIPS 2015, arXiv:1506.01497), con un backbone ResNet-101 inicializado con pesos ImageNet (`torchvision://resnet101`) y una FPN que proporciona mapas de características multiescala. La cabeza de detección opera sobre las propuestas generadas por la RPN, con clasificación sobre las diez clases de BDD100K y regresión de cajas en coordenadas.

El entrenamiento se realizó sobre el split de entrenamiento de BDD100K (70.000 imágenes) durante 36 épocas (programa 3x), con SGD de momento, learning rate 0.04, weight decay 0.0001, decaimiento del learning rate en las épocas 24 y 33, batch de 32 (8 GPUs x 4 imágenes) y entrenamiento multi-escala con seis escalas entre (1280, 600) y (1280, 720). No se documenta en la información disponible el uso de RLHF, DPO ni técnicas de alineación, algo esperable en un detector puramente discriminativo. La innovación práctica del repositorio es la reproducibilidad: el autor verifica que las predicciones en CPU sobre 20 imágenes aleatorias de validación coinciden exactamente (666 cajas y scores) con las predicciones publicadas por SysCV, y que el MD5 de los pesos (`548e4f54427e58563501edc57917a53f`) coincide con el archivo MD5 de SysCV.

## Capacidades

- Detección de objetos en imágenes de escenas de conducción en las diez clases de BDD100K.
- Detección en vídeo: el script `infer.py` acepta vídeo, carpetas de imágenes y webcam, con opción de limitar el número de fotogramas (`--max-frames`).
- Exportación de resultados en formato BDD100K mediante `--json out.json`.
- Umbral de score configurable (`--score-thr`, por defecto 0.3).
- Funcionamiento en CPU (1,9 s/imagen con 8 hilos) y en GPU con CUDA 11.8.
- No soporta tool calling, agentes, razonamiento multi-paso, texto ni audio: es exclusivamente un modelo de visión.
- No dispone de capacidades multilingües ni de generación de lenguaje.

## Casos de uso

- **Línea base para investigación en detección de tráfico**: sirve como referencia reproducible para comparar nuevos detectores sobre BDD100K, gracias a la verificación exacta contra las predicciones de SysCV y a la configuración fijada.
- **Análisis de vídeo de dashcam**: procesar grabaciones de conducción con `infer.py` para extraer cajas de peatones, vehículos y señales, útil en estudios de seguridad vial o auditoría de escenas.
- **Prototipado de percepción en conducción autónoma**: integrar el detector en un pipeline de percepción para validar heurísticas de planificación o seguimiento antes de invertir en modelos más pesados.
- **Etiquetado asistido (pre-anotación)**: generar detecciones automáticas en formato BDD100K para acelerar el etiquetado humano de nuevos conjuntos de imágenes de tráfico.
- **Evaluación en CPU sin GPU**: al ejecutarse a 1,9 s/imagen en 8 hilos de CPU, es viable en entornos sin acelerador, como portátiles o servidores de validación.
- **Detección en tiempo real desde webcam**: el modo `python infer.py 0 --show` permite demos interactivas de detección en directo, adecuado para formación o demostraciones.
- **Fine-tuning sobre dominios específicos**: al estar disponible la configuración mmdetection completa, se puede reentrenar sobre datasets propios de tráfico respetando la licencia BDD100K.

## Benchmarks y rendimiento

Resultados declarados por SysCV en la model card (Box AP en estilo COCO, sobre BDD100K):

| Split | AP | AP50 | AP75 | APs | APm | APl |
|---|---|---|---|---|---|---|
| val | 32,7 | 58,0 | 31,4 | 15,8 | 37,7 | 53,7 |
| test | 32,0 | 55,5 | 31,7 | 16,2 | 38,6 | 48,6 |

AP por clase en validación:

| Clase | AP |
|---|---|
| pedestrian | 35,6 |
| rider | 27,2 |
| car | 52,0 |
| truck | 47,2 |
| bus | 48,9 |
| train | 0,0 |
| motorcycle | 25,2 |
| bicycle | 27,2 |
| traffic light | 24,8 |
| traffic sign | 39,1 |

El valor global reportado en el model-index es de 32,71 mAP en validación (no verificado de forma independiente por el autor del espejo). Destaca el 0,0 en la clase `train`, atribuible a la escasez de instancias de tren en el conjunto, y el bajo rendimiento en objetos pequeños (APs 15,8) y en clases minoritarias como motorcycle, bicycle y traffic light.

## Requisitos de hardware

- **VRAM estimada**: no disponible de forma explícita; con 60,49 millones de parámetros en FP32 los pesos ocupan aproximadamente 0,24 GB, por lo que la inferencia cabe holgadamente en GPUs de 4 GB o más, dependiendo del tamaño de lote y de las activaciones.
- **GPU recomendadas**: cualquier GPU NVIDIA compatible con CUDA 11.8; el entorno fijado (`env/requirements-cu118.txt`) está pensado para esa versión. No se especifican modelos concretos (A100, H100, RTX 4090) en la información disponible.
- **GPU de consumo**: sí, cabe en GPUs de consumo; el autor no documenta pruebas en CUDA (indica que el entorno CUDA "not yet tested"), pero sí en CPU.
- **CPU**: funciona con `env/requirements-cpu.txt` a 1,9 s/imagen con 8 hilos.
- **Opciones de despliegue**: mmdetection 2.28.2 con torch 2.0.1 y mmcv-full 1.7.2 en Python 3.10; script `infer.py` incluido. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- **Latencia y throughput**: 1,9 s/imagen en CPU con 8 hilos; no se publican cifras de latencia en GPU.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto/entrada | AP BDD100K val | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este modelo (Faster R-CNN R101-FPN 3x) | Faster R-CNN + ResNet-101 + FPN | 60,49 M | 1280 x 720 | 32,7 | bdd100k (solo investigación) | Hugging Face (espejo) |
| Otros modelos del zoo SysCV BDD100K | no disponible en la información | no disponible | no disponible | no disponible | Apache-2.0 (config) / BDD100K (pesos) | Repositorio SysCV en GitHub |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de resultados de otros detectores comparables sobre BDD100K para establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- **Licencia restrictiva**: los pesos derivan de BDD100K y quedan bajo la licencia BDD100K, limitada a uso educativo, de investigación y sin ánimo de lucro. No se permite uso comercial sin autorización adicional.
- **Clase `train` con AP 0,0**: el modelo no detecta trenes de forma fiable; no debe usarse para esa categoría en producción.
- **Rendimiento bajo en objetos pequeños** (APs 15,8) y en clases minoritarias (motorcycle 25,2, bicycle 27,2, traffic light 24,8).
- **Sin verificación en CUDA**: el autor confirma la reproducibilidad en CPU, pero indica que el entorno CUDA no ha sido probado; posibles incompatibilidades con drivers o versiones de CUDA distintas de 11.8.
- **Entorno obsoleto**: torch 2.0.1, mmcv-full 1.7.2 y mmdetection 2.28.2 son versiones antiguas; requiere un entorno virtual aislado y no es compatible con stacks modernos de mmdetection 3.x.
- **Sesgos del dataset**: BDD100K está sesgado hacia escenas de conducción en entornos urbanos y condiciones climáticas concretas; el rendimiento puede degradarse en dominios distintos (otras geografías, cámaras, iluminación extrema).
- **Riesgo de falsos positivos y negativos**: como todo detector, puede producir detecciones espurias o perder objetos; el umbral por defecto (0.3) y el post-proceso (NMS 0.5, máximo 100 cajas) condicionan el equilibrio precisión/recall.
- **Sin capacidades de texto ni razonamiento**: no es un modelo de lenguaje; no debe evaluarse con métricas de LLM ni usarse para tareas generativas.
- **Procedencia de los pesos**: recuperados de la Wayback Machine; aunque el MD5 coincide con el de SysCV, conviene auditar el origen si se usa en entornos críticos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dronefreak/bdd100k-syscv-faster-rcnn-r101-fpn-3x
- Repositorio SysCV BDD100K models (detección): https://github.com/SysCV/bdd100k-models/tree/main/det
- Configuración original de SysCV: https://github.com/SysCV/bdd100k-models/blob/0935a8a3eb4c7442efdce2a8ce4b93fbe585be15/det/configs/det/faster_rcnn_r101_fpn_3x_det_bdd100k.py
- Paper Faster R-CNN (arXiv:1506.01497): https://arxiv.org/abs/1506.01497
- Licencia BDD100K: https://huggingface.co/dronefreak/bdd100k-syscv-faster-rcnn-r101-fpn-3x/blob/main/LICENSE.txt
- Dataset BDD100K en Hugging Face: https://huggingface.co/datasets/dronefreak/BDD100K
- Paper BDD100K (CVPR 2020): https://arxiv.org/abs/1805.04687
