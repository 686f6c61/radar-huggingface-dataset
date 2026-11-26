# dronefreak/bdd100k-mmdet-faster-rcnn-r50-pafpn-1x

## Resumen

El modelo `dronefreak/bdd100k-mmdet-faster-rcnn-r50-pafpn-1x` es un espejo (mirror) de un baseline oficial de detección de objetos de BDD100K publicado en 2020 por el equipo de BDD100K en el servidor de descargas de Berkeley, sin documentación asociada. Lo mantiene el usuario de Hugging Face `dronefreak`, que ha empaquetado los pesos originales junto con un entorno fijado (pinned) y un script de inferencia (`infer.py`) para que el checkpoint siga siendo ejecutable hoy, dado que el stack original (PyTorch 1.6.0, CUDA 10.2, mmcv 1.1.5, mmdetection 2.5.0) ya no tiene kernels para GPUs actuales.

Arquitectónicamente es un Faster R-CNN clásico con backbone ResNet-50 inicializado con pesos ImageNet de torchvision, cuello PAFPN (PANet), RoIAlign y una cabeza de cajas con dos capas FC compartidas. Cuenta con 44.987.906 parámetros (≈45,0 M) y está entrenado sobre las 70.000 imágenes de entrenamiento de BDD100K durante 12 épocas (configuración 1x). No es un modelo de lenguaje ni un modelo generativo: es un detector de objetos para escenas de conducción.

Su relevancia actual es fundamentalmente de reproducibilidad: sirve como referencia histórica exacta (el espejo reproduce las predicciones originales con IoU 1,0000 sobre las cajas publicadas por los autores) y como baseline para comparar detectores modernos sobre BDD100K con un entorno que efectivamente arranca. El rendimiento es modesto (29,6 mAP@50:95 en validación) y debe interpretarse como línea base de 2020, no como estado del arte.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Faster R-CNN con ResNet-50 + PAFPN (PANet neck), RoIAlign y cabeza de cajas con 2 FC compartidas |
| Parámetros totales | 44.987.906 (≈45,0 M) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de imágenes, no texto) |
| Tipos de cuantización | no disponible (no se documentan cuantizaciones; pesos en safetensors/checkpoint PyTorch) |
| Idiomas soportados | no disponible (no es un modelo lingüístico) |
| Licencia | BDD100K (`license: other`, `license_name: bdd100k`), texto en `LICENSE.txt` del repo |
| Formato de pesos | safetensors (tag del repo) y checkpoint PyTorch cargado con `torch.load(weights_only=True)` |
| Framework | mmdetection 2.x (entorno fijado: mmdetection 2.28.2, mmcv-full 1.7.2) |
| Inicialización del backbone | ResNet-50 ImageNet de torchvision |
| Dataset de entrenamiento | BDD100K train, 70.000 imágenes |
| Tamaño del repositorio | 0,7 GB |
| Pipeline | object-detection |

## Arquitectura y entrenamiento

Faster R-CNN de dos etapas: un backbone ResNet-50 extrae características, un cuello PAFPN (Feature Pyramid Network con path aggregation de PANet) genera la pirámide multi-escala, una RPN propone regiones y una cabeza con RoIAlign y dos capas fully-connected compartidas clasifica y refina las cajas. El backbone se inicializa con pesos ImageNet de torchvision.

El entrenamiento se realizó sobre las 70.000 imágenes de entrenamiento de BDD100K durante 12 épocas (schedule 1x), con SGD a learning rate 0,02, decaimientos en las épocas 8 y 11, batch de 16 (4 GPUs × 4) sobre TITAN Xp. Todo el stack original queda registrado en el propio checkpoint (PyTorch 1.6.0, CUDA 10.2, mmcv 1.1.5, mmdetection 2.5.0). No se documenta uso de RLHF, DPO ni técnicas de alineación, algo esperable en un detector. La innovación destacable del espejo no es arquitectónica sino de ingeniería: un entorno reproducible con versiones fijadas (Python 3.10, torch 2.0.1, torchvision 0.15.2, mmcv-full 1.7.2, mmdetection 2.28.2, numpy 1.26.4, opencv-python 4.10.0.84, setuptools 69.5.1, yapf 0.40.1) y una carga segura del checkpoint con `weights_only=True`.

## Capacidades

- Detección de objetos en escenas de conducción sobre las clases de BDD100K (coche, camión, autobús, persona, moto, bicicleta, semáforo, señal de tráfico, etc., según la definición del dataset).
- Inferencia sobre imagen suelta, carpeta de imágenes, vídeo y webcam mediante `infer.py`.
- Exportación de detecciones en formato BDD100K (píxeles, `x1 y1 x2 y2`) con `--json detections.json`.
- Umbral de puntuación configurable (`--score-thr`, por defecto 0,3) y límite de fotogramas en vídeo (`--max-frames N`).
- Ejecución en CPU y en GPU (entorno CUDA 11.8 disponible, aunque no verificado según la model card).
- Carga segura del checkpoint: solo tensores y metadatos, sin ejecución de código.
- No soporta tool calling, agentes, razonamiento multi-paso, ni capacidades multilingües: es un detector puro.

## Casos de uso

- Baseline de referencia para investigación en detección sobre BDD100K: permite reproducir exactamente las predicciones de 2020 (IoU 1,0000 frente a las cajas de los autores) y comparar de forma justa con detectores nuevos bajo el mismo protocolo de evaluación.
- Análisis de escenas de conducción en vídeo: `infer.py` acepta un fichero de vídeo y genera cajas por fotograma con umbral configurable, útil para prototipos de percepción en vehículos autónomos o para anotación asistida.
- Anotación asistida y pre-etiquetado: las detecciones exportadas en formato BDD100K (`--json`) pueden servir como propuestas iniciales para un pipeline de etiquetado humano, reduciendo el coste de anotar nuevas imágenes de conducción.
- Docencia y reproducción de pipelines mmdetection 2.x: el repo incluye un entorno fijado que arranca hoy, lo que lo convierte en material práctico para enseñar el flujo de trabajo de mmdetection clásico (config, checkpoint, inferencia, exportación).
- Validación de infraestructura de despliegue: al ser un modelo pequeño (≈45 M de parámetros, repo de 0,7 GB) y con script de inferencia incluido, sirve para probar pipelines de CPU/GPU, contenedores o integraciones de Hugging Face Hub antes de pasar a modelos mayores.
- Análisis retrospectivo de datasets: comparar detecciones del baseline con anotaciones ground truth o con modelos posteriores para estudiar la evolución de la dificultad de BDD100K (noche, condiciones adversas) a lo largo del tiempo.
- Demostración interactiva con webcam: el modo `0 --show` permite una demo en vivo de detección de escenas de calle, aunque la model card advierte que esa ruta no se probó con una cámara real.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (no verificados) sobre el split de validación de BDD100K, tarea object-detection:

| Métrica | Valor |
|---|---|
| mAP@50:95 (val) | 29,6 |
| mAP@50 (val) | 54,7 |
| mAP@75 (val) | 27,5 |

No se han publicado en la información disponible resultados adicionales (por clase, por condiciones meteorológicas, latencia o throughput) ni comparaciones numéricas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con ≈45 M de parámetros y backbone ResNet-50, el checkpoint en FP32 ocupa del orden de 180 MB, por lo que la inferencia cabe holgadamente en GPUs de consumo y en CPU.
- GPU recomendadas: no se especifican; el entrenamiento original usó TITAN Xp. Cualquier GPU moderna con soporte CUDA 11.8 debería ser suficiente, aunque el entorno CUDA no está verificado según la model card (solo se ha verificado el entorno de CPU).
- Cabe en GPU de consumo: sí, por tamaño de modelo; no se detalla una lista concreta de modelos probados.
- Opciones de despliegue: script `infer.py` incluido en el repo; entorno mmdetection 2.28.2 con mmcv-full 1.7.2; requisitos separados para CPU (`env/requirements-cpu.txt`) y CUDA 11.8 (`env/requirements-cu118.txt`). No se documenta integración con vLLM, llama.cpp, Ollama ni TGI (no aplican a un detector de este tipo).
- Latencia y throughput: no disponibles. La model card solo indica que la verificación se realizó en CPU y que el entorno CUDA aún no se ha ejecutado.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de otros detectores sobre BDD100K (parámetros, contexto, rendimiento, licencia) para establecer una comparativa numérica fiable. Cualquier comparación con alternativas como otros baselines de BDD100K o detectores más recientes requeriría datos que no están disponibles en esta ficha.

| Modelo | Parámetros | mAP@50:95 (BDD100K val) | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este modelo (Faster R-CNN R50-PAFPN 1x) | 44.987.906 | 29,6 (declarado, no verificado) | BDD100K | Hugging Face (espejo) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Rendimiento limitado: 29,6 mAP@50:95 es un resultado de línea base de 2020, no apto como detector de producción para conducción autónoma real sin un modelo muy superior.
- Los resultados de benchmarks están declarados por el autor y marcados como no verificados (`verified: false`); no deben citarse como cifras auditadas.
- Entorno frágil: requiere mmdetection 2.x (no 3.x) y versiones muy concretas de torch, mmcv y setuptools; usar un entorno existente puede degradar paquetes. La ruta CUDA 11.8 no está verificada, solo la de CPU.
- La ruta de webcam no se probó con una cámara real.
- Licencia BDD100K (`license: other`): es imprescindible revisar `LICENSE.txt` antes de cualquier uso comercial; las condiciones del dataset BDD100K pueden restringir el uso de los pesos derivados.
- Riesgo de sesgo y alucinación: como detector entrenado en BDD100K, hereda los sesgos de composición del dataset (geografía, condiciones de iluminación, clases sobrerrepresentadas) y puede producir falsos positivos o cajas mal calibradas en escenas fuera de distribución; no hay evaluación de calibración ni de robustez documentada.
- Sin soporte lingüístico ni de texto: no es un modelo conversacional, no procesa prompts ni contexto textual.
- No hay información sobre cuantizaciones, latencia ni throughput, lo que dificulta planificar despliegues con requisitos estrictos de tiempo real.
- El espejo no está verificado en GPU; para producción conviene validar el entorno y las predicciones en el hardware objetivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dronefreak/bdd100k-mmdet-faster-rcnn-r50-pafpn-1x
- Licencia (LICENSE.txt del repo): https://huggingface.co/dronefreak/bdd100k-mmdet-faster-rcnn-r50-pafpn-1x/blob/main/LICENSE.txt
- Dataset referenciado: https://huggingface.co/datasets/dronefreak/BDD100K
- Póster de la demo: https://huggingface.co/dronefreak/bdd100k-mmdet-faster-rcnn-r50-pafpn-1x/resolve/main/assets/demo_banner_poster.jpg
- Vídeo de la demo: https://huggingface.co/dronefreak/bdd100k-mmdet-faster-rcnn-r50-pafpn-1x/resolve/main/assets/demo_banner.mp4
- Repositorio de mmdetection: no disponible en la información proporcionada
- Paper de Faster R-CNN: no disponible en la información proporcionada
- Paper de BDD100K: no disponible en la información proporcionada
