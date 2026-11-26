# dronefreak/bdd100k-mmdet-faster-rcnn-r50-fpn-1x

## Resumen

El modelo `dronefreak/bdd100k-mmdet-faster-rcnn-r50-fpn-1x` es un espejo (mirror) del baseline oficial de detección de objetos Faster R-CNN con backbone ResNet-50 y FPN, entrenado sobre el conjunto de datos BDD100K para escenas de conducción autónoma. Fue publicado originalmente por el equipo de BDD100K en 2020 en el servidor de descargas de Berkeley sin documentación asociada, y el autor de este repositorio lo ha reempaquetado con un entorno fijado (pinned environment), un script de inferencia funcional y verificación de integridad, de modo que el modelo sigue siendo ejecutable hoy pese a depender de la rama 2.x de mmdetection, ya descatalogada.

Se trata de un detector de dos etapas con 41,4 millones de parámetros, que predice cajas delimitadoras sobre 10 clases de tráfico (persona, ciclista, coche, autobús, camión, bicicleta, motocicleta, semáforo, señal de tráfico y tren). Su relevancia actual no reside en el rendimiento bruto —es un baseline de 2020 con mAP@50:95 de 29,3 en validación— sino en servir como referencia reproducible y como punto de partida documentado para quien necesite un detector de escenas de conducción con un stack antiguo pero estable.

El repositorio incluye pesos en formato de checkpoint de PyTorch (no safetensors), un script `infer.py` que soporta imágenes sueltas, carpetas, vídeo y webcam, y una verificación de reproducción exacta contra las predicciones originales de los autores sobre el conjunto de test, con IoU 1.0000.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Faster R-CNN con ResNet-50 + FPN, RoIAlign y dos cabezas FC compartidas para cajas |
| Parametros totales | 41,4 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | no disponible (solo pesos completos en FP32) |
| Idiomas soportados | no disponible (modelo de visión) |
| Licencia | BDD100K (license: other, license_name: bdd100k) |
| Formato de pesos | checkpoint de PyTorch (`.pth`), cargado con `torch.load(weights_only=True)` |

## Arquitectura y entrenamiento

Faster R-CNN es un detector de dos etapas: una red de propuesta de regiones (RPN) genera candidatos sobre el mapa de características, y una segunda etapa clasifica y refina cada región mediante RoIAlign. El backbone es una ResNet-50 inicializada con pesos de ImageNet de torchvision, aumentada con una Feature Pyramid Network (FPN) para detectar objetos a múltiples escalas. La cabeza de cajas consta de dos capas fully-connected compartidas entre clasificación y regresión.

El entrenamiento se realizó sobre el split de entrenamiento de BDD100K (70.000 imágenes), durante 12 épocas (el schedule «1x»), con SGD, learning rate 0,02, pasos de decaimiento en las épocas 8 y 11, y batch de 16 (4 GPUs × 4 imágenes), totalizando 52.404 iteraciones. Se usaron PyTorch 1.6.0, CUDA 10.2, mmcv 1.1.5 y mmdetection 2.5.0 sobre GPUs Tesla P100. Las imágenes se redimensionan para encajar en 1333 × 800 manteniendo la relación de aspecto (una imagen de 1280 × 720 pasa a 1333 × 750). En test se aplica un umbral de score de 0,05, NMS con IoU 0,5 y un máximo de 100 cajas por imagen.

## Capacidades

- Detección de objetos en imágenes de escenas de conducción sobre 10 clases: person, rider, car, bus, truck, bike, motor, traffic light, traffic sign y train.
- Inferencia sobre imágenes sueltas, carpetas de imágenes, archivos de vídeo y webcam mediante `infer.py`.
- Exportación de detecciones en formato BDD100K (píxeles, `x1 y1 x2 y2`) con la opción `--json`.
- Umbral de score configurable (`--score-thr`, por defecto 0,3) y límite de frames para vídeo (`--max-frames`).
- Aplicación automática de metadatos de rotación en vídeo mediante OpenCV.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es exclusivamente un modelo de visión por computador.

## Casos de uso

- Detección de viables y peatones en pipelines de percepción para conducción autónoma: el modelo identifica las 10 clases de tráfico de BDD100K sobre imágenes redimensionadas a 1333 × 800, adecuado como baseline o componente de referencia en prototipos de percepción.
- Análisis de vídeo de tráfico urbano: `infer.py` procesa archivos de vídeo frame a frame con metadatos de rotación aplicados, permitiendo extraer detecciones por frame para estudios de densidad de tráfico o conteo de vehículos.
- Anotación asistida (pre-labeling): generar cajas candidatas en formato BDD100K para que anotadores humanos las revisen, reduciendo el coste de etiquetado en nuevos datasets de escenas de conducción.
- Reproducción de experimentos académicos: al ser un espejo verificado con IoU 1.0000 contra las predicciones originales, sirve como referencia exacta para comparar nuevos detectores sobre BDD100K.
- Monitorización de cámaras en directo: el modo webcam permite probar el detector sobre un flujo de captura en tiempo real, útil para demos o validación rápida de escenarios.
- Docencia y formación en visión por computador: el entorno fijado y el script de inferencia autocontenido permiten montar un laboratorio reproducible de detección de objetos con mmdetection 2.x sin resolver conflictos de dependencias.
- Integración en sistemas de alerta de tráfico: detección de semáforos, señales y peatones para sistemas de asistencia a la conducción en entornos controlados.

## Benchmarks y rendimiento

Resultados declarados por los autores sobre el split de validación de BDD100K (10.000 imágenes), AP estilo COCO:

| Metrica | Valor |
|---|---|
| mAP@50:95 | 29,3 |
| mAP@50 | 54,4 |
| mAP@75 | 27,1 |
| AP small | 13,2 |
| AP medium | 34,6 |
| AP large | 50,2 |

Por clase (según la model card, datos parciales en la información disponible): person, rider, car, bus, truck, bike, motor, traffic light, traffic sign y train; los valores numéricos por clase no están completos en la información proporcionada.

Velocidad: aproximadamente 1,7 s por imagen de 1280 × 720 en 8 hilos de CPU.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible explícitamente; con 41,4 M de parámetros en FP32 el checkpoint ocupa unos 0,5 GB, por lo que la VRAM necesaria es modesta y cabe holgadamente en cualquier GPU consumer moderna.
- GPU recomendadas: cualquier GPU NVIDIA con soporte para CUDA 11.8; el entorno CUDA 11.8 no ha sido verificado por el autor (solo el entorno CPU está verificado hasta la fecha).
- Cabe en GPU consumer: sí, por tamaño; la limitación es de compatibilidad de stack (mmcv-full 1.7.2 y mmdetection 2.28.2), no de memoria.
- Opciones de despliegue: mmdetection 2.28.2 con mmcv-full 1.7.2 sobre PyTorch 2.0.1; el repositorio incluye `env/requirements-cu118.txt` y `env/requirements-cpu.txt`. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: ~1,7 s por imagen de 1280 × 720 en 8 hilos de CPU; rendimiento en GPU no medido en la información disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | mAP@50:95 (BDD100K val) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Faster R-CNN R50-FPN 1x (este modelo) | 41,4 M | 1333 × 800 | 29,3 | BDD100K | Hugging Face (mirror) |
| Otros baselines de detección BDD100K (YOLO, RetinaNet, etc.) | no disponible | no disponible | no disponible | BDD100K | servidor de Berkeley (original) |
| Detectores genéricos COCO (p. ej. Faster R-CNN COCO) | no disponible | no disponible | no aplica (otro dataset) | según modelo | múltiples |

No se dispone en la información proporcionada de resultados comparables de otros detectores sobre BDD100K para establecer una comparativa numérica rigurosa.

## Limitaciones y advertencias

- Rendimiento moderado: mAP@50:95 de 29,3 es un baseline de 2020; los detectores modernos superan ampliamente esta cifra.
- Bajo rendimiento en objetos pequeños (AP small = 13,2), lo que limita su uso en escenas con objetos lejanos o de pequeño tamaño.
- Stack obsoleto: requiere mmdetection 2.x y mmcv-full 1.x, sin soporte para GPUs posteriores a Turing en el entorno original; el entorno CUDA 11.8 no ha sido verificado por el autor.
- Solo visión: no procesa texto ni lenguaje; no admite tool calling, agentes ni razonamiento.
- Licencia BDD100K: es necesario revisar los términos del archivo `LICENSE.txt` del repositorio antes de cualquier uso comercial; la licencia no es estándar de código abierto.
- Riesgo de alucinación: como todo detector, puede producir falsos positivos y falsos negativos; el umbral de score (0,05 en test, 0,3 por defecto en inferencia) condiciona fuertemente el comportamiento.
- Sesgos del dataset: BDD100K está centrado en escenas de conducción de determinadas regiones; el modelo puede generalizar mal a otras geografías, condiciones meteorológicas o tipos de vía no representados.
- Convención de coordenadas: la exportación original de los autores resta 1 píxel a `x2` e `y2` (convención inclusiva); `infer.py` escribe las coordenadas de mmdetection sin ese ajuste, lo que puede generar discrepancias de 1 píxel al comparar con las predicciones originales.
- El modo webcam no fue probado con una cámara real según el autor.

## Enlaces

- Hugging Face: https://huggingface.co/dronefreak/bdd100k-mmdet-faster-rcnn-r50-fpn-1x
- Licencia: https://huggingface.co/dronefreak/bdd100k-mmdet-faster-rcnn-r50-fpn-1x/blob/main/LICENSE.txt
- Dataset BDD100K en Hugging Face: https://huggingface.co/datasets/dronefreak/BDD100K
- Repositorio oficial de BDD100K: https://bdd-data.berkeley.edu/
- mmdetection: https://github.com/open-mmlab/mmdetection
- Paper Faster R-CNN: https://arxiv.org/abs/1506.01497
- Paper FPN: https://arxiv.org/abs/1612.03144
- Paper BDD100K: https://arxiv.org/abs/1805.04687
