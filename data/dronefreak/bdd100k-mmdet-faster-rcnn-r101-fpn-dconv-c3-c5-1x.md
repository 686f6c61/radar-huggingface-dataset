# dronefreak/bdd100k-mmdet-faster-rcnn-r101-fpn-dconv-c3-c5-1x

## Resumen

El modelo `dronefreak/bdd100k-mmdet-faster-rcnn-r101-fpn-dconv-c3-c5-1x` es un espejo (mirror) de un baseline oficial de deteccion de objetos para el dataset BDD100K, publicado originalmente por el equipo de BDD100K en 2020 en el servidor de descargas de Berkeley. Se trata de un detector Faster R-CNN con backbone ResNet-101, FPN y convoluciones deformables en las etapas c3-c5, entrenado con el pipeline de mmdetection 2.x. El autor del repositorio lo ha reempaquetado con un entorno fijado y un script de inferencia para que siga siendo ejecutable hoy en dia.

El modelo resuelve la tarea de deteccion de objetos en escenas de conduccion (vehiculos, peatones, senales de trafico, semaforos, etc.) sobre imagenes del dataset BDD100K. Con 61,77 millones de parametros y un tamano de repositorio de 0,9 GB, es un modelo de vision por computador clasico, no un modelo de lenguaje: no procesa texto ni tiene ventana de contexto en el sentido de los LLM.

Su relevancia actual es fundamentalmente practica y de reproducibilidad: el checkpoint original carecia de documentacion y dependia de un stack (PyTorch 1.6, CUDA 10.2, mmcv 1.1.3, mmdetection 2.4.0) que ya no funciona en GPUs modernas. Este mirror documenta el modelo, fija versiones compatibles y verifica la reproduccion exacta de las predicciones originales, lo que lo convierte en una referencia util para investigadores que necesiten un baseline de deteccion en BDD100K.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Faster R-CNN con ResNet-101 (convoluciones deformables en c3-c5) + FPN |
| Parametros totales | 61.777.950 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF/ONNX documentadas) |
| Idiomas soportados | no disponible (no es un modelo linguistico) |
| Licencia | bdd100k (license: other, license_name: bdd100k) |
| Formato de pesos | safetensors (repo de 0,9 GB) |

## Arquitectura y entrenamiento

La arquitectura es un detector Faster R-CNN de dos etapas. El backbone es una ResNet-101 inicializada con pesos ImageNet de torchvision, a la que se incorporan convoluciones deformables (DCN) en las etapas c3, c4 y c5 para mejorar la modelizacion geometrica de objetos. Sobre el backbone se anade una Feature Pyramid Network (FPN) que alimenta la cabeza de region proposals (RPN) y la cabeza de clasificacion/regresion de RoI. El entrenamiento se realizo con el schedule "1x" de mmdetection.

El modelo fue entrenado originalmente con PyTorch 1.6.0, CUDA 10.2, mmcv 1.1.3 y mmdetection 2.4.0 sobre GPUs Tesla P100-PCIE-16GB, datos que quedaron registrados en el propio checkpoint. No se dispone de informacion detallada sobre el numero de tokens (no aplica), la composicion exacta del dataset de entrenamiento ni sobre el uso de RLHF/DPO (tecnicas no aplicables a un detector clasico). La innovacion tecnica destacable de este repositorio es el reempaquetado con un entorno fijado (Python 3.10, torch 2.0.1, torchvision 0.15.2, mmcv-full 1.7.2, mmdetection 2.28.2) y un script `infer.py` que carga los pesos con `torch.load(weights_only=True)`, evitando la ejecucion de codigo arbitrario desde el checkpoint.

## Capacidades

- Deteccion de objetos en imagenes de escenas de conduccion (vehiculos, peatones, senales, semaforos y otras clases de BDD100K).
- Inferencia sobre imagenes individuales, carpetas de imagenes, ficheros de video y webcam (via `infer.py`).
- Exportacion de detecciones en formato BDD100K (pixeles, `x1 y1 x2 y2`) mediante la opcion `--json`.
- Ajuste del umbral de confianza (`--score-thr`, por defecto 0,3) y limite de frames en video (`--max-frames`).
- Reproduccion exacta de las predicciones originales de los autores sobre el split de test (verificado con IoU 1.0000 en 20 imagenes).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues: es exclusivamente un modelo de vision.

## Casos de uso

- **Baseline de investigacion en BDD100K**: sirve como punto de referencia reproducible para comparar nuevos detectores sobre el split de validacion, con metricas mAP@50:95 de 30,8 documentadas y verificadas.
- **Prototipado de sistemas ADAS**: permite generar detecciones de vehiculos y peatones en secuencias de video de conduccion para validar pipelines de percepcion antes de invertir en modelos mas pesados.
- **Anotacion asistida**: el script `infer.py` con salida `--json` en formato BDD100K facilita pre-anotar imagenes nuevas y revisarlas manualmente, reduciendo el coste de etiquetado.
- **Analisis de trafico offline**: procesar carpetas de imagenes o videos de camaras de trafico para extraer conteos y posiciones de objetos por frame, gracias al soporte de entrada por directorio y video.
- **Verificacion de pipelines de despliegue**: al estar fijado el entorno y verificada la integridad (SHA-256), es util para comprobar que un stack de inferencia (CPU o GPU) produce resultados identicos a la referencia.
- **Educacion y docencia**: ejemplo completo y documentado de un detector de dos etapas con FPN y DCN, con entorno reproducible, adecuado para practicas de vision por computador.
- **Pruebas de robustez dia/noche**: el banner de demo incluye clips diurnos y nocturnos del split de validacion, lo que permite evaluar el comportamiento del modelo en condiciones de iluminacion dispares.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (no verificados, `verified: false`) sobre el split de validacion de BDD100K:

| Metrica | Valor |
|---|---|
| mAP@50:95 (val) | 30,8 |
| mAP@50 (val) | 56,3 |
| mAP@75 (val) | 28,7 |

No se han publicado en la informacion disponible resultados comparativos con otros modelos sobre el mismo split.

## Requisitos de hardware

- **VRAM estimada**: no disponible de forma explicita; con 61,8 M de parametros y pesos en safetensors, la inferencia en FP32 requiere del orden de 250 MB solo para pesos, mas activaciones y buffers de mmdetection.
- **GPU recomendadas**: el entrenamiento original uso Tesla P100-PCIE-16GB; para inferencia basta una GPU consumer moderna, aunque el entorno CUDA 11.8 no ha sido verificado por el autor (solo se ha validado el entorno CPU).
- **Cabe en GPU consumer**: si, previsiblemente en cualquier GPU con al menos unos pocos GB de VRAM; no se especifica un minimo verificado.
- **Opciones de despliegue**: mmdetection 2.28.2 con mmcv-full 1.7.2 sobre torch 2.0.1 (CUDA 11.8 o build CPU). No se documentan exportaciones a ONNX, TensorRT, vLLM, llama.cpp ni Ollama (no aplicables a este tipo de modelo).
- **Latencia y throughput**: no disponibles; el autor solo confirma que el entorno CPU esta verificado y que el entorno CUDA 11.8 aun no se ha ejecutado.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos de otros detectores (por ejemplo, variantes YOLO, RetinaNet o Cascade R-CNN sobre BDD100K) que permitan una comparativa rigurosa de parametros, contexto, rendimiento y licencia. Por tanto, la comparativa se indica como **no disponible**.

## Limitaciones y advertencias

- **Licencia BDD100K**: la licencia `other` con nombre `bdd100k` impone condiciones especificas; es imprescindible revisar el fichero `LICENSE.txt` antes de cualquier uso comercial.
- **Entorno no verificado en GPU**: el autor solo ha validado el entorno CPU; el entorno CUDA 11.8 no se ha ejecutado, por lo que el rendimiento y la correccion en GPU no estan confirmados.
- **Webcam no probada**: la ruta de captura por webcam usa el mismo bucle que los videos, pero no se ha probado con una camara real.
- **Riesgo de alucinacion**: en deteccion de objetos se traduce en falsos positivos y cajas mal localizadas, especialmente con umbrales de confianza bajos; el umbral por defecto es 0,3.
- **Sesgos del dataset**: BDD100K refleja la distribucion geografica y de condiciones de sus grabaciones; el modelo puede degradarse en escenas no representadas (clima extremo, paises no cubiertos, sensores distintos).
- **Dependencia de un stack antiguo**: requiere mmdetection 2.x y versiones fijadas de numpy, setuptools y yapf; instalar en un entorno existente puede degradar paquetes.
- **Sin soporte linguistico ni de agentes**: no es adecuado para tareas de texto, razonamiento o tool calling.
- **Convencion de coordenadas**: la exportacion original de los autores resta 1 pixel a `x2` e `y2` (convencion inclusiva); `infer.py` escribe las coordenadas de mmdetection sin ese ajuste, lo que puede requerir conversion en pipelines que esperen el formato original.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dronefreak/bdd100k-mmdet-faster-rcnn-r101-fpn-dconv-c3-c5-1x
- Licencia: https://huggingface.co/dronefreak/bdd100k-mmdet-faster-rcnn-r101-fpn-dconv-c3-c5-1x/blob/main/LICENSE.txt
- Dataset BDD100K (referenciado): https://huggingface.co/datasets/dronefreak/BDD100K
- Demo banner (poster): https://huggingface.co/dronefreak/bdd100k-mmdet-faster-rcnn-r101-fpn-dconv-c3-c5-1x/resolve/main/assets/demo_banner_poster.jpg
- Demo banner (video): https://huggingface.co/dronefreak/bdd100k-mmdet-faster-rcnn-r101-fpn-dconv-c3-c5-1x/resolve/main/assets/demo_banner.mp4
