# dronefreak/bdd100k-syscv-retinanet-pvtv2-b0-fpn-3x

## Resumen

RetinaNet PVTv2-B0-FPN 3x es un detector de objetos de una sola etapa pensado para escenas de conducción, entrenado sobre el conjunto de datos BDD100K. Combina el backbone Pyramid Vision Transformer v2 (PVTv2-B0) con un cuello de red Feature Pyramid Network y la cabeza de detección de RetinaNet. El modelo procede del zoo de modelos de SysCV (ETH Zurich) para BDD100K y este repositorio es un espejo que recupera los pesos originales, ya que el host de descarga de ETH Zurich (`dl.cv.ethz.ch`) está fuera de servicio.

El checkpoint está entrenado sobre las 70.000 imágenes de entrenamiento de BDD100K durante 36 épocas (programa 3x) con AdamW, a una resolución nativa de 1280 x 720 y con entrenamiento multi-escala. Detecta diez clases propias del dominio de conducción: peatón, ciclista, coche, camión, autobús, tren, motocicleta, bicicleta, semáforo y señal de tráfico.

Su relevancia es doble. Por un lado, ofrece una referencia reproducible de detección en BDD100K con un backbone transformer ligero (11,49 millones de parámetros), útil como línea base en investigación de percepción para conducción autónoma. Por otro, el espejo incluye un entorno fijado, un script de inferencia y verificación de que las predicciones coinciden exactamente con las publicadas por SysCV, lo que facilita su uso en evaluación comparativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RetinaNet de una etapa con backbone Pyramid Vision Transformer v2 (PVTv2-B0) y cuello FPN |
| Parametros totales | 11.494.878 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de imagen 1280 x 720) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | BDD100K (`license: other`, `license_name: bdd100k`); uso educativo, de investigación y sin ánimo de lucro |
| Formato de pesos | safetensors (`model.safetensors`), equivalente al `.pth` original; configuración en `config.json` y `original_config.py` |

## Arquitectura y entrenamiento

El modelo sigue el esquema de RetinaNet: un backbone que extrae características multiescala, un FPN que las fusiona y una cabeza de detección densa con anclas que predice clases y regresiones de cajas. El backbone es PVTv2-B0, un transformer piramidal con atención por ventanas y atención lineal por reducción espacial, descrito en el artículo *PVTv2: Improved Baselines with Pyramid Vision Transformer* (CVMJ 2022). La inicialización del backbone parte de pesos preentrenados en ImageNet (`pvt_v2_b0.pth`).

El entrenamiento se realizó sobre BDD100K train (70.000 imágenes) durante 36 épocas (programa 3x), con AdamW, learning rate 0,0001, weight decay 0,0001, decaimiento en las épocas 24 y 33, batch de 32 (8 GPU x 2 imágenes) y entrenamiento multi-escala con seis escalas entre (1280, 600) y (1280, 720). En inferencia se usa umbral de puntuación 0,05, NMS con IoU 0,5 y un máximo de 100 cajas por imagen. No se documenta en la información disponible ningún proceso de RLHF, DPO ni ajuste por refuerzo, algo esperable en un detector de objetos.

## Capacidades

- Detección de objetos en imágenes de escenas de conducción con diez clases: peatón, ciclista, coche, camión, autobús, tren, motocicleta, bicicleta, semáforo y señal de tráfico.
- Predicción de cajas delimitadoras en formato COCO (con opción de exportación en formato BDD100K mediante `--json`).
- Inferencia sobre imágenes sueltas, carpetas de imágenes, archivos de vídeo y webcam (modos `image.jpg`, carpeta, `drive.mov`, `0 --show`).
- Funcionamiento en CPU y en GPU CUDA 11.8; el entorno fija torch 2.0.1, mmcv-full 1.7.2 y mmdetection 2.28.2 sobre Python 3.10.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente visual de detección.

## Casos de uso

- Línea base de investigación en detección para conducción autónoma: sirve como referencia reproducible (AP de 31,9 en val) para comparar nuevos backbones o estrategias de aumento de datos sobre BDD100K, gracias a que las predicciones coinciden exactamente con las publicadas por SysCV.
- Anotación asistida y preetiquetado: el modelo puede generar cajas candidatas sobre imágenes o vídeos de tráfico para que un equipo humano las revise, reduciendo el coste de etiquetado en nuevos conjuntos de escenas de conducción.
- Análisis de vídeo de tráfico: con `infer.py drive.mov` se procesan secuencias completas y se exportan detecciones en formato BDD100K (`--json`) para estudios de flujo de vehículos y peatones.
- Prototipado en CPU: al funcionar en CPU (aproximadamente 1,1 s por imagen con 8 hilos) permite validar pipelines de percepción sin disponer de GPU.
- Docencia y demostraciones: el repositorio incluye un vídeo de demostración con detecciones en clips diurnos y nocturnos, útil para ilustrar el comportamiento de un detector en condiciones de iluminación variables.
- Evaluación de robustez: al ser un modelo pequeño y con resultados por clase publicados (por ejemplo, AP 0,2 en tren frente a 50,6 en coche), resulta adecuado para estudiar el desequilibrio entre clases en BDD100K.

## Benchmarks y rendimiento

Resultados declarados por SysCV (recogidos en la model card; la métrica mAP figura como no verificada en el model-index). AP de caja estilo COCO (%) sobre BDD100K:

| Split | AP | AP50 | AP75 | APs | APm | APl |
|---|---|---|---|---|---|---|
| val | 31,9 | 57,6 | 30,1 | 13,8 | 37,5 | 53,6 |
| test | 31,1 | 55,4 | 30,1 | 14,8 | 38,0 | 48,0 |

AP por clase en val:

| Clase | AP |
|---|---|
| pedestrian | 34,2 |
| rider | 25,8 |
| car | 50,6 |
| truck | 45,1 |
| bus | 48,0 |
| train | 0,2 |
| motorcycle | 25,1 |
| bicycle | 25,9 |
| traffic light | 24,9 |
| traffic sign | 39,1 |

Rendimiento de inferencia declarado: 0,05 s por imagen en una RTX 4070 SUPER y 1,1 s por imagen en CPU con 8 hilos.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con 11,49 millones de parámetros y pesos en precisión completa el checkpoint ocupa del orden de decenas de MB, por lo que la inferencia cabe holgadamente en cualquier GPU consumer moderna.
- GPU recomendadas: el autor verifica la reproducción exacta en una RTX 4070 SUPER con CUDA 11.8; cualquier GPU NVIDIA compatible con CUDA 11.8 y torch 2.0.1 debería servir (por ejemplo, RTX 30xx/40xx, A100, H100).
- Cabe en GPU consumer: sí, con amplio margen; también funciona en CPU (entorno `requirements-cpu.txt`).
- Opciones de despliegue: entorno mmdetection 2.28.2 con mmcv-full 1.7.2 y torch 2.0.1 (Python 3.10), instalado vía `uv`; el repositorio incluye `infer.py` para imagen, carpeta, vídeo y webcam. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplican a un detector de objetos).
- Latencia y throughput: 0,05 s por imagen en RTX 4070 SUPER; 1,1 s por imagen en CPU con 8 hilos. El throughput agregado no está disponible.

## Comparativa con modelos similares

No se dispone en la información proporcionada de resultados de otros detectores sobre BDD100K (por ejemplo, variantes con backbone ResNet u otros tamaños de PVTv2 del mismo zoo de SysCV), por lo que no es posible establecer una comparativa numérica fiable. Como referencia cualitativa, este modelo se sitúa en la categoría de detectores de una etapa ligeros para escenas de conducción, con un backbone transformer de 11,49 millones de parámetros y licencia restringida a uso educativo, de investigación y sin ánimo de lucro.

| Modelo | Parametros | Contexto/entrada | AP (BDD100K val) | Licencia |
|---|---|---|---|---|
| RetinaNet PVTv2-B0-FPN 3x (este) | 11.494.878 | 1280 x 720 | 31,9 | BDD100K (no comercial) |
| Alternativas del zoo SysCV | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia restrictiva: los pesos se rigen por la licencia de BDD100K, limitada a uso educativo, de investigación y sin ánimo de lucro; el uso comercial requiere revisar `LICENSE.txt` y probablemente una licencia aparte. La configuración de SysCV es Apache-2.0, pero eso no cubre los pesos entrenados.
- Rendimiento muy desigual por clase: el AP de tren es 0,2, y las clases pequeñas o poco frecuentes (semáforo 24,9, motocicleta 25,1, bicicleta 25,9) quedan muy por debajo del coche (50,6). No es adecuado para producción sin un análisis por clase.
- Objetos pequeños: APs de 13,8 en val indica un rendimiento bajo en objetos de área pequeña, habituales en escenas de tráfico a distancia.
- Dominio acotado: entrenado exclusivamente en BDD100K (escenas de conducción urbanas y de carretera); no se garantiza su comportamiento en otros dominios visuales.
- Riesgo de falsos positivos y negativos: como todo detector, puede fallar en condiciones de baja iluminación, oclusión o mal tiempo; el vídeo de demostración incluye clips nocturnos, pero no se aportan métricas desagregadas por condición.
- Entorno frágil: requiere versiones fijadas (torch 2.0.1, mmcv-full 1.7.2, mmdetection 2.28.2, Python 3.10) y un entorno virtual nuevo; mezclar versiones puede romper la carga del modelo.
- Repositorio de escasa tracción: 0 descargas y 0 likes en el momento de la consulta, y los pesos se recuperaron de la Wayback Machine, por lo que conviene verificar la integridad (MD5 `9b5315601da8726e01ab18216b58feb6`) antes de usarlos.
- Sin capacidades de lenguaje: no procesa texto ni mantiene conversaciones; cualquier caso de uso con lenguaje requiere otro modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dronefreak/bdd100k-syscv-retinanet-pvtv2-b0-fpn-3x
- Repositorio de modelos BDD100K de SysCV: https://github.com/SysCV/bdd100k-models/tree/main/det
- Configuración original de SysCV: https://github.com/SysCV/bdd100k-models/blob/0935a8a3eb4c7442efdce2a8ce4b93fbe585be15/det/configs/det/retinanet_pvtv2-b0_fpn_3x_det_bdd100k.py
- Artículo PVTv2: https://arxiv.org/abs/2106.13797
- Pesos preentrenados PVTv2-B0 en ImageNet: https://github.com/whai362/PVT/releases/download/v2/pvt_v2_b0.pth
- Licencia BDD100K: https://huggingface.co/dronefreak/bdd100k-syscv-retinanet-pvtv2-b0-fpn-3x/blob/main/LICENSE.txt
- Conjunto de datos BDD100K en Hugging Face: https://huggingface.co/datasets/dronefreak/BDD100K
