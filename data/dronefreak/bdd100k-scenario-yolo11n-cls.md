# dronefreak/bdd100k-scenario-yolo11n-cls

## Resumen

El modelo `dronefreak/bdd100k-scenario-yolo11n-cls` es un clasificador de imágenes derivado de YOLO11n (la variante "nano" de la familia YOLO11 de Ultralytics) y ajustado por el usuario dronefreak para una tarea concreta: clasificar escenas de conducción en siete categorías (calle urbana, autopista, zona residencial, aparcamiento, gasolinera, túnel y desconocido). Se trata de una tarea no oficial construida a partir del campo `attributes.scene` del dataset BDD100K, y se distribuye como parte del proyecto BDD100K-Toolkit, un conjunto de herramientas para preparar, entrenar y evaluar modelos sobre BDD100K con métricas y particiones homogéneas.

El modelo es extremadamente compacto: 1.550.231 parámetros totales según los pesos en safetensors, lo que lo sitúa en la gama de los clasificadores móviles. Su relevancia práctica está en el contexto de sistemas de conducción autónoma y ADAS, donde un clasificador de escena ligero puede actuar como módulo de enrutamiento o de contexto previo a tareas más costosas (detección, segmentación o planificación). No es un modelo de lenguaje ni un transformer generativo: es una CNN de clasificación de imágenes empaquetada en el ecosistema Ultralytics.

La ficha debe leerse con cautela: los resultados declarados por el autor muestran un Top-1 del 78,58 % pero un Macro F1 del 49,47 %, lo que revela un fuerte desequilibrio de clases en el dataset y un rendimiento muy pobre en clases minoritarias (gasolinera, aparcamiento, desconocido). La licencia AGPL-3.0 y la naturaleza no oficial de la tarea condicionan su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN de clasificación de imágenes (YOLO11n, variante nano de Ultralytics) |
| Parametros totales | 1.550.231 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de visión; las etiquetas de clase están en inglés) |
| Licencia | AGPL-3.0 |
| Formato de pesos | safetensors y best.pt (PyTorch, ecosistema Ultralytics) |

## Arquitectura y entrenamiento

La arquitectura es la red de clasificación de YOLO11n de Ultralytics, una CNN compacta pensada para inferencia de baja latencia. El modelo parte de los pesos base de `Ultralytics/YOLO11` y se ajusta (fine-tuning) sobre el dataset `dronefreak/BDD100K-Scenario-Classification`, derivado de BDD100K. La tarea es de clasificación de imagen a 7 clases, con una única etiqueta por imagen obtenida del campo `attributes.scene` de BDD100K; se trata de una tarea no oficial que sigue el dataset de Kaggle del mismo nombre.

El entrenamiento se realizó con el framework Ultralytics durante un máximo de 50 épocas, de las cuales se completaron 41 (según la información de la model card). No se dispone de datos sobre el número de tokens (no aplica), la composición exacta del dataset de entrenamiento, ni sobre el uso de técnicas de refuerzo (RLHF/DPO no aplican en este contexto). La innovación técnica destacable es la propia integración en BDD100K-Toolkit: un pipeline reproducible que garantiza que todos los modelos del "model zoo" se entrenan y evalúan con las mismas particiones y métricas, lo que permite comparaciones justas entre arquitecturas.

## Capacidades

- Clasificación de imágenes de escenas de conducción en 7 clases: city street, highway, residential, parking lot, gas stations, tunnel y unknown.
- Salida de probabilidades por clase (top-1, top-5 y confianza), utilizable como señal de contexto para módulos posteriores.
- Integración nativa con el ecosistema Ultralytics (`YOLO(...)`, `model.names`, `probs.top1`, `probs.top1conf`).
- Descarga directa desde Hugging Face mediante `hf_hub_download` y carga con `best.pt`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto: es un clasificador de visión puro.
- No tiene capacidades multilingües ni de audio; las etiquetas de clase están en inglés.
- No dispone de modo "thinking" ni de decodificación especulativa (no aplica).

## Casos de uso

- Enrutamiento de contexto en pipelines ADAS: el clasificador puede etiquetar cada fotograma como autopista, calle urbana o túnel y activar configuraciones distintas en módulos de detección o planificación (por ejemplo, umbrales de confianza diferentes en autopista frente a zona residencial), aprovechando su bajo coste computacional (1,5 M de parámetros).
- Pre-filtrado en anotación automática de datasets: dado su Top-1 del 78,58 %, puede usarse para preetiquetar grandes volúmenes de imágenes de BDD100K y reducir el trabajo manual, con revisión humana posterior en las clases minoritarias donde el rendimiento cae.
- Indexación y búsqueda de clips de vídeo: clasificar fotogramas de un archivo de conducción y agrupar secuencias por escena (por ejemplo, extraer todos los tramos de túnel o de aparcamiento) para análisis o generación de datasets balanceados.
- Prototipado rápido en investigación: al ser un modelo de 1,5 M de parámetros con licencia AGPL-3.0, sirve como línea base ligera en experimentos de clasificación de escenas y como punto de comparación frente a EfficientViT, MobileNetV4 o ConvNeXt en el model zoo del autor.
- Monitorización de flotas y telemetría visual: clasificar imágenes subidas por vehículos para generar estadísticas de distribución de escenas (porcentaje de conducción urbana frente a autopista) sin necesidad de GPU de gama alta.
- Módulo de seguridad en sistemas embebidos: su tamaño reducido permite desplegarlo en dispositivos con recursos limitados (Jetson Nano, Raspberry Pi con aceleración) como clasificador auxiliar que informe al sistema principal del tipo de entorno.
- Detección de cambios de escena en vídeo: al aplicar el clasificador fotograma a fotograma se pueden detectar transiciones (por ejemplo, entrada en túnel) y disparar eventos en sistemas de registro o alerta.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el split `test` (10.000 imágenes) del dataset BDD100K Scenario Classification. No verificados de forma independiente (`verified: false`).

| Metrica | Valor |
|---|---|
| Top-1 accuracy | 78,58 % |
| Top-5 accuracy | 99,93 % |
| Macro F1 | 49,47 % |
| Balanced accuracy | 46,05 % |
| Macro precision | 60,98 % |
| Macro recall | 46,05 % |

Rendimiento por clase (split de test):

| Clase | Precision | Recall | F1 | Imagenes de test |
|---|---|---|---|---|
| city street | 80,19 % | 88,43 % | 84,11 % | 6112 |
| gas stations | 0,00 % | 0,00 % | 0,00 % | 7 (pocas) |
| highway | 76,73 % | 71,51 % | 74,03 % | 2499 |
| parking lot | 57,14 % | 32,65 % | 41,56 % | 49 (pocas) |
| residential | 71,53 % | 50,12 % | 58,94 % | 1253 |
| tunnel | 91,30 % | 77,78 % | 84,00 % | 27 (pocas) |
| unknown | 50,00 % | 1,89 % | 3,64 % | 53 |

Comparación con otros modelos del model zoo del autor (mismo split de test, ordenado por Top-1):

| Modelo | Top-1 | Macro F1 | Balanced acc | Macro precision |
|---|---|---|---|---|
| EfficientViT-B3 | 79,32 % | 57,70 % | 53,59 % | 71,54 % |
| YOLO11n (este modelo) | 78,58 % | 49,47 % | 46,05 % | 60,98 % |
| YOLO11s | 78,58 % | 49,18 % | 45,24 % | 61,98 % |
| MobileNetV4-Conv-Small | 78,20 % | 52,89 % | 48,69 % | 61,41 % |
| MobileNetV4-Conv-Large | 78,15 % | 50,00 % | 45,48 % | 63,03 % |
| EfficientViT-B1 | 78,01 % | 54,15 % | 49,41 % | 70,13 % |
| TinyViT-21M | 77,99 % | 62,52 % | 66,21 % | 59,66 % |
| YOLO26s | 77,81 % | 52,24 % | 49,23 % | 58,28 % |
| ConvNeXt-Atto | 77,44 % | 61,06 % | 60,34 % | 67,92 % |
| YOLOv8s | 77,15 % | 48,43 % | 46,64 % | 51,16 % |
| ResNet-18 | 77,14 % | 47,29 % | 44,83 % | 54,25 % |
| YOLO26n | 76,78 % | 48,33 % | 43,94 % | 58,99 % |
| ConvNeXt-Tiny | 76,69 % | 56,88 % | 59,82 % | 54,60 % |
| YOLOv8n | 76,13 % | 46,40 % | 43,26 % | 54,14 % |
| EfficientViT-B0 | 75,94 % | 46,10 % | 42,64 % | 53,74 % |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 1,55 M de parámetros, el modelo ocupa unos pocos MB en FP32 (aproximadamente 6 MB de pesos) y menos aún en FP16 o cuantizado, por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU moderna es suficiente; el modelo está pensado para inferencia de baja latencia. Funciona en RTX 4090, RTX 3060, T4, A100, H100, así como en GPUs integradas y aceleradores embebidos (Jetson, Coral, NPU móviles).
- Cabe en GPU consumer: sí, en cualquier GPU consumer actual y también en CPU y dispositivos embebidos.
- Opciones de despliegue: el ecosistema nativo es Ultralytics (PyTorch, `best.pt`); también es posible exportarlo a ONNX, TensorRT, OpenVINO o CoreML mediante las utilidades de exportación de Ultralytics. No se documenta soporte nativo para vLLM, llama.cpp, Ollama o TGI (no aplican a un clasificador de visión).
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño del modelo se espera una latencia de milisegundos en GPU y de decenas de milisegundos en CPU, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Top-1 | Macro F1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| YOLO11n (este modelo) | 1,55 M | 78,58 % | 49,47 % | AGPL-3.0 | Hugging Face (dronefreak) |
| EfficientViT-B3 | no disponible | 79,32 % | 57,70 % | no disponible | model zoo del autor |
| TinyViT-21M | ~21 M | 77,99 % | 62,52 % | no disponible | model zoo del autor |
| MobileNetV4-Conv-Small | no disponible | 78,20 % | 52,89 % | no disponible | model zoo del autor |
| ConvNeXt-Atto | no disponible | 77,44 % | 61,06 % | no disponible | model zoo del autor |

La comparación se limita al model zoo del propio autor, ya que no hay datos públicos de estos modelos específicos sobre esta tarea no oficial. En términos de Top-1, EfficientViT-B3 supera ligeramente a YOLO11n (79,32 % frente a 78,58 %), mientras que TinyViT-21M y ConvNeXt-Atto, con peor Top-1, logran un Macro F1 notablemente superior (62,52 % y 61,06 %), lo que indica un mejor equilibrio entre clases.

## Limitaciones y advertencias

- Fuerte desequilibrio de clases: el modelo está dominado por `city street` (6112 imágenes de test) y `highway` (2499); el Macro F1 del 49,47 % refleja el mal rendimiento en clases minoritarias.
- La clase `gas stations` no se clasifica correctamente en ninguna imagen de test (0 % de precisión y recall); debe considerarse no soportada.
- Las clases `parking lot`, `unknown` y `residential` presentan recall bajo (32,65 %, 1,89 % y 50,12 % respectivamente), lo que limita su uso en aplicaciones que dependan de estas categorías.
- Riesgo de alucinación de clase: al ser un clasificador, siempre asigna una de las 7 etiquetas aunque la imagen no corresponda a ninguna; no hay mecanismo de abstención fiable más allá de la clase `unknown`, que apenas se detecta.
- Tarea no oficial: las etiquetas derivan del campo `attributes.scene` de BDD100K y no de un benchmark estandarizado; los resultados no son directamente comparables con literatura publicada.
- Resultados no verificados de forma independiente (`verified: false` en el model-index).
- Licencia AGPL-3.0: el uso comercial requiere cumplir las obligaciones de copyleft de la AGPL, lo que puede ser restrictivo para productos propietarios; conviene revisar con asesoría legal antes de integrarlo en producción.
- Sesgos geográficos y de dominio: BDD100K está grabado en entornos de conducción (principalmente Estados Unidos); el modelo puede degradarse en escenas de otras regiones, condiciones meteorológicas extremas o cámaras con distinta calibración.
- No hay información sobre cuantizaciones soportadas ni sobre el impacto de la cuantización en la precisión.
- Idiomas: no aplica, pero las etiquetas están en inglés y no se documenta localización.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dronefreak/bdd100k-scenario-yolo11n-cls
- Repositorio del toolkit (fuente de los benchmarks): https://github.com/dronefreak/bdd100k-toolkit
- Dataset de clasificación de escenas: https://huggingface.co/datasets/dronefreak/BDD100K-Scenario-Classification
- Modelo base YOLO11 de Ultralytics: https://huggingface.co/Ultralytics/YOLO11
- Paper de Ultralytics YOLO (arXiv:2410.17725): https://arxiv.org/abs/2410.17725
- Paper de BDD100K (arXiv:1805.04687): https://arxiv.org/abs/1805.04687
- Documentación de Ultralytics: https://docs.ultralytics.com/
