# dronefreak/bdd100k-syscv-faster-rcnn-r50-fpn-dconv-1x

## Resumen

El modelo `dronefreak/bdd100k-syscv-faster-rcnn-r50-fpn-dconv-1x` es un detector de objetos de dos etapas (Faster R-CNN) con backbone ResNet-50, cuello FPN y convoluciones deformables v2, entrenado específicamente sobre el conjunto de datos BDD100K para detección de objetos en escenas de conducción. No es un modelo de lenguaje ni un modelo fundacional generativo: es un checkpoint de visión por computador orientado a la detección de peatones, vehículos, señales y semáforos en imágenes de tráfico real. Lo publica el usuario `dronefreak` como espejo de un modelo del zoo oficial de SysCV (ETH Zurich), cuyos pesos originales estaban alojados en `dl.cv.ethz.ch`, un servidor actualmente fuera de línea; los pesos se recuperaron desde la Wayback Machine (captura del 19 de febrero de 2025).

El interés de esta ficha es doble. Por un lado, preserva un checkpoint de referencia de la literatura de detección en BDD100K que de otro modo sería inaccesible, con verificación explícita de MD5 y reproducción exacta de las predicciones publicadas. Por otro lado, añade un entorno fijado (PyTorch 2.0.1, mmcv-full 1.7.2, mmdetection 2.28.2 sobre Python 3.10) y un script de inferencia (`infer.py`) que acepta imágenes, vídeos y webcam, algo que el zoo original no ofrecía de forma empaquetada.

Arquitectónicamente es un detector denso clásico: 42.028.268 parámetros, entrada nativa de 1280×720 sin reescalado, y un rendimiento declarado de 32,09 de AP en caja sobre el split de validación de BDD100K. No hay ventana de contexto, ni tokenizador, ni capacidades lingüísticas: cualquier comparación con modelos de lenguaje es inaplicable. Su relevancia práctica está en pipelines de percepción para conducción autónoma, análisis de vídeo de tráfico y evaluación comparativa de detectores sobre BDD100K.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Faster R-CNN con backbone ResNet-50, FPN y Deformable ConvNets v2 (DCN) |
| Parámetros totales | 42.028.268 |
| Parámetros activos | no aplicable (no es MoE) |
| Longitud de contexto | no aplicable (modelo de visión, sin contexto textual) |
| Tipos de cuantización | no disponible (no se documentan cuantizaciones en la información proporcionada) |
| Idiomas soportados | no disponible (modelo de visión; no procesa texto) |
| Licencia | BDD100K (`license: other`, `license_name: bdd100k`); uso educativo, de investigación y sin ánimo de lucro. La configuración de SysCV es Apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`); también `.pth` original en `original/` |
| Librería | mmdetection |
| Pipeline | object-detection |
| Resolución de entrada | 1280×720 (tamaño nativo de BDD100K, sin resize) |
| Clases detectadas | 10: pedestrian, rider, car, truck, bus, train, motorcycle, bicycle, traffic light, traffic sign |
| Tamaño del repositorio | 0,5 GB |
| MD5 de pesos | `8506d21442b917027bf668dc99b713c1` |

## Arquitectura y entrenamiento

El modelo sigue la receta estándar de Faster R-CNN en mmdetection con dos modificaciones relevantes: el backbone ResNet-50 incorpora convoluciones deformables v2 (DCNv2, CVPR 2019), que permiten que las posiciones de muestreo de la convolución se desplacen de forma aprendida para adaptarse a geometrías no rígidas, algo útil en escenas de tráfico con objetos a distintas escalas y perspectivas. Sobre el backbone se sitúa un FPN que agrega características multiescala, y una cabeza RPN más una cabeza R-CNN de dos etapas para clasificación y regresión de cajas.

El entrenamiento se realizó sobre el split de entrenamiento de BDD100K (70.000 imágenes) durante 12 épocas (régimen "1x"), con SGD de momento, learning rate 0,04, weight decay 0,0001, decaimiento del learning rate en las épocas 8 y 11, y batch de 32 (8 GPUs × 4 imágenes). El backbone se inicializó con pesos de ImageNet (`torchvision://resnet50`). La entrada se mantiene a la resolución nativa de 1280×720, sin reescalado, y en inferencia se aplica umbral de score 0,05, NMS con IoU 0,5 y un máximo de 100 cajas por imagen. No se documenta RLHF, DPO ni ningún tipo de ajuste por preferencias, por supuesto, al no ser un modelo generativo.

La contribución técnica del repositorio no está en el modelo en sí, sino en la preservación y verificación: los pesos se recuperaron del archivo web, se comprobó que el MD5 coincide con el archivo MD5 publicado por SysCV, que todas las claves cargan en la configuración original, y que en 20 imágenes aleatorias de validación se reproducen exactamente las 723 cajas y scores de las predicciones publicadas (con la salvedad de que la exportación de SysCV resta 1 píxel a `x2` e `y2`).

## Capacidades

- Detección de objetos en caja en imágenes de escenas de conducción, con 10 clases de BDD100K.
- Detección multi-escala gracias al FPN, con resultados diferenciados por tamaño de objeto (APs, APm, APl).
- Procesamiento de imágenes sueltas, carpetas de imágenes, archivos de vídeo y flujo de webcam mediante `infer.py`.
- Salida en formato BDD100K JSON (`--json out.json`), lo que facilita la integración con herramientas de evaluación del dataset.
- Umbral de score configurable (`--score-thr`, por defecto 0,3) y límite de fotogramas para vídeo (`--max-frames`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: es exclusivamente un detector de objetos.
- No hay modo "thinking", visión-lenguaje, audio ni generación de texto.

## Casos de uso

- Percepción en conducción autónoma o sistemas ADAS: el modelo detecta peatones, vehículos, semáforos y señales en imágenes de 1280×720 a la resolución nativa de BDD100K, lo que lo hace adecuado como componente de un pipeline de percepción en vehículos o simuladores, especialmente en investigación académica.
- Análisis de vídeo de tráfico urbano: `infer.py` acepta archivos de vídeo y emite detecciones por fotograma en formato BDD100K, lo que permite medir flujos de vehículos, ocupación de carriles o presencia de peatones en grabaciones de cámaras de vigilancia urbana.
- Evaluación comparativa de detectores: al reproducir exactamente las predicciones publicadas por SysCV, sirve como línea base fiable para comparar nuevos detectores sobre el split de validación de BDD100K sin depender del servidor original caído.
- Anotación asistida y pre-etiquetado: las detecciones con umbral bajo (0,05 en la configuración original) pueden usarse para pre-anotar imágenes de dominios similares y reducir el coste de etiquetado manual en proyectos de visión.
- Investigación en convoluciones deformables: al ser un checkpoint DCNv2 verificado, permite estudiar el efecto de las convoluciones deformables en detección de tráfico comparándolo con variantes sin DCN del mismo zoo.
- Docencia y reproducción de resultados: el entorno fijado (Python 3.10, torch 2.0.1, mmcv-full 1.7.2, mmdetection 2.28.2) permite a estudiantes reproducir un resultado de la literatura sin pelearse con incompatibilidades de versiones.
- Procesamiento en CPU sin GPU: el modelo funciona en CPU (2,8 s/imagen con 8 hilos), lo que facilita prototipado y validación en máquinas sin acelerador.

## Benchmarks y rendimiento

Resultados declarados por SysCV y recogidos en el model-index del autor (AP en caja, estilo COCO, sobre BDD100K):

| Split | AP | AP50 | AP75 | APs | APm | APl |
|---|---|---|---|---|---|---|
| val | 32,1 | 57,5 | 30,5 | 15,3 | 36,8 | 53,4 |
| test | 30,9 | 54,7 | 30,2 | 15,4 | 37,5 | 48,1 |

AP por clase en validación:

| Clase | AP |
|---|---|
| pedestrian | 34,6 |
| rider | 25,9 |
| car | 51,6 |
| truck | 46,3 |
| bus | 48,1 |
| train | 0,0 |
| motorcycle | 24,4 |
| bicycle | 26,0 |
| traffic light | 24,9 |
| traffic sign | 38,9 |

El valor de 32,09 de AP en validación figura en el model-index como no verificado (`verified: false`), aunque el autor documenta la reproducción exacta de las predicciones de SysCV en 20 imágenes. El AP de 0,0 en la clase `train` refleja la práctica ausencia de trenes en el split de validación de BDD100K, no un fallo del detector.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. Con 42 M de parámetros y entrada de 1280×720, un detector Faster R-CNN R50-FPN suele requerir del orden de 2-4 GB en FP32 para inferencia por lotes pequeños, pero el autor no publica cifras de VRAM.
- GPU recomendadas: no especificadas por el autor. El entorno fijado incluye `env/requirements-cu118.txt` (CUDA 11.8), por lo que se espera compatibilidad con GPUs NVIDIA modernas; el autor indica que el entorno CUDA "no ha sido probado todavía".
- Cabe en GPU de consumo: previsiblemente sí en tarjetas con 4 GB o más de VRAM, dado el tamaño del modelo, aunque no hay confirmación documentada.
- Despliegue: mmdetection 2.28.2 con mmcv-full 1.7.2 sobre PyTorch 2.0.1 y Python 3.10. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo). El script `infer.py` cubre imagen, carpeta, vídeo y webcam.
- Latencia: 2,8 s/imagen en CPU con 8 hilos (dato del autor). Throughput y latencia en GPU no disponibles.
- Carga de pesos: `torch.load(weights_only=True)`, lo que añade una capa de seguridad frente a ejecución de código arbitrario en el checkpoint.

## Comparativa con modelos similares

No se dispone en la información proporcionada de resultados de otros detectores sobre BDD100K con los que comparar de forma rigurosa. Como referencia estructural, este modelo se sitúa en la categoría de detectores de dos etapas con backbone ResNet-50 y FPN, comparable en arquitectura a otras variantes del zoo de SysCV (por ejemplo, Faster R-CNN sin DCN o RetinaNet), pero no se han facilitado sus métricas.

| Modelo | Arquitectura | Parámetros | Entrada | AP val BDD100K | Licencia |
|---|---|---|---|---|---|
| Este modelo | Faster R-CNN R50-FPN DCNv2 | 42,0 M | 1280×720 | 32,1 | BDD100K (uso educativo/investigación) |
| Otras variantes del zoo SysCV | no disponible | no disponible | no disponible | no disponible | Apache-2.0 (config) |
| Detectores genéricos COCO | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia restrictiva: los pesos derivan de BDD100K y quedan sujetos a su licencia, limitada a uso educativo, de investigación y sin ánimo de lucro. El uso comercial requiere revisar los términos de BDD100K y, probablemente, negociar una licencia aparte.
- Dominio acotado: entrenado exclusivamente sobre BDD100K (escenas de conducción diurnas y nocturnas, principalmente en Estados Unidos). El rendimiento fuera de ese dominio (otras geografías, climas, cámaras o ángulos) no está garantizado.
- Clase `train` con AP 0,0 en validación: el detector no es fiable para esa categoría en la práctica.
- Objetos pequeños: APs de 15,3 en validación indica un rendimiento bajo en objetos de pequeña escala, lo que limita su uso en imágenes de alta resolución con objetos lejanos.
- Sin datos de sesgo: no se documentan análisis de sesgo por género, tono de piel, hora del día o condiciones meteorológicas, pese a que BDD100K incluye escenarios nocturnos y de lluvia donde el rendimiento puede degradarse.
- Riesgo de falsos positivos y negativos: como todo detector, puede confundir clases próximas (rider frente a pedestrian, motorcycle frente a bicycle) y producir detecciones espurias con umbrales bajos.
- Entorno CUDA no probado: el autor indica explícitamente que el entorno CUDA no ha sido validado, solo el de CPU. La reproducibilidad en GPU está pendiente de confirmación.
- Dependencia de versiones antiguas: mmdetection 2.x y mmcv-full 1.7.2 están en fin de vida; la integración con stacks modernos requerirá trabajo de migración.
- Sin mantenimiento aparente: 0 descargas y 0 likes en el momento de la consulta, con un único autor; no hay garantía de soporte ni actualizaciones.
- Sin cuantizaciones publicadas: no hay versiones GGUF, ONNX ni TensorRT documentadas, lo que complica el despliegue en entornos de producción optimizados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dronefreak/bdd100k-syscv-faster-rcnn-r50-fpn-dconv-1x
- Repositorio de modelos de SysCV (ETH Zurich): https://github.com/SysCV/bdd100k-models/tree/main/det
- Configuración original de SysCV: https://github.com/SysCV/bdd100k-models/blob/0935a8a3eb4c7442efdce2a8ce4b93fbe585be15/det/configs/det/faster_rcnn_r50_fpn_dconv_1x_det_bdd100k.py
- Licencia del modelo (LICENSE.txt): https://huggingface.co/dronefreak/bdd100k-syscv-faster-rcnn-r50-fpn-dconv-1x/blob/main/LICENSE.txt
- Paper de Deformable ConvNets v2 (CVPR 2019): https://arxiv.org/abs/1811.11168
- Paper de BDD100K (CVPR 2020): https://arxiv.org/abs/1805.04687
- Dataset BDD100K en Hugging Face: https://huggingface.co/datasets/dronefreak/BDD100K
- Web oficial de BDD100K: https://bdd-data.berkeley.edu/
