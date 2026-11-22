# dronefreak/bdd100k-scenario-yolo26n-cls

## Resumen

El modelo `dronefreak/bdd100k-scenario-yolo26n-cls` es un clasificador de imágenes obtenido por ajuste fino (*fine-tuning*) del backbone YOLO26n de Ultralytics sobre el conjunto de datos BDD100K Scenario Classification. Lo desarrolla el usuario dronefreak como parte del proyecto BDD100K-Toolkit, una herramienta para preparar, entrenar y evaluar modelos sobre BDD100K con métricas y particiones idénticas. Resuelve una tarea concreta: clasificar una imagen de tráfico en una de siete categorías de escenario de conducción (calle urbana, autopista, zona residencial, aparcamiento, gasolinera, túnel y desconocido), a partir del campo `attributes.scene` de BDD100K.

Se trata de un modelo de visión por computador muy compacto (1.550.231 parámetros reales según los pesos en safetensors), no de un modelo de lenguaje. Su relevancia actual radica en que sirve como referencia reproducible y ligera para tareas de comprensión de escena en conducción autónoma, y en que el autor publica una comparativa (model zoo) con otras arquitecturas evaluadas bajo el mismo protocolo, lo que permite contextualizar su rendimiento. Es una tarea no oficial derivada de BDD100K, siguiendo el conjunto de Kaggle del mismo nombre.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO26n (Ultralytics YOLO26), configurado como clasificador de imágenes |
| Parametros totales | 1.550.231 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica; entrada de imagen) |
| Licencia | AGPL-3.0 |
| Formato de pesos | safetensors (repositorio), `best.pt` (checkpoint PyTorch para Ultralytics) |

## Arquitectura y entrenamiento

El modelo parte de YOLO26n, la variante más pequeña de la familia YOLO26 de Ultralytics, y se reutiliza como clasificador de imágenes en lugar de detector. La arquitectura es una red neuronal convolucional de tipo *backbone* + cabeza de clasificación, con 1.550.231 parámetros. No se dispone de información detallada en la documentación proporcionada sobre la composición exacta de las capas, el uso de atención u otras innovaciones internas de YOLO26.

El ajuste fino se realizó sobre el conjunto BDD100K Scenario Classification con un máximo de 50 épocas (el número de épocas efectivamente completadas no está disponible en la información proporcionada). No se especifican en la model card el número de tokens (no aplica), la composición del dataset de entrenamiento ni si se aplicaron técnicas de RLHF/DPO (no aplica en visión). La evaluación se realizó sobre la partición `test` de 10.000 imágenes.

## Capacidades

- Clasificación de imágenes de tráfico en 7 escenarios: city street, highway, residential, parking lot, gas stations, tunnel y unknown.
- Salida de probabilidades por clase mediante la API de Ultralytics (`model(...)[0].probs`), con acceso a la clase top-1 y su confianza.
- Inferencia sobre imágenes individuales; no se documenta soporte nativo de vídeo, aunque el ejemplo de la model card muestra predicciones sobre clips de test de BDD100K.
- Integración con la librería `ultralytics` y carga directa desde Hugging Face mediante `hf_hub_download`.
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente visual.
- No se documentan modos especiales (thinking mode, visión, audio) más allá de la clasificación de imágenes.

## Casos de uso

- Etiquetado automático de escenas en pipelines de datos de conducción: el modelo puede preclasificar grandes lotes de imágenes de BDD100K o de cámaras de vehículo en las siete categorías, reduciendo el trabajo manual de anotación. Es adecuado por su bajo coste computacional (1,5 M de parámetros).
- Filtrado y curación de datasets: descartar o agrupar imágenes por escenario antes de entrenar detectores o segmentadores, usando la clase predicha como criterio de partición.
- Preprocesado en sistemas ADAS de bajo consumo: al ser un modelo minúsculo, puede ejecutarse en dispositivos embebidos o CPU para dar contexto de escena a módulos posteriores (por ejemplo, activar comportamientos distintos en autopista frente a zona residencial).
- Análisis de flotas y telemetría: clasificar imágenes capturadas por vehículos para generar estadísticas de distribución de escenarios (porcentaje de kilómetros en ciudad, autopista, etc.).
- Prototipado rápido y evaluación comparativa: sirve como *baseline* reproducible en el model zoo del BDD100K-Toolkit para comparar arquitecturas (EfficientViT, MobileNetV4, TinyViT, ConvNeXt, YOLO11, YOLOv8) bajo el mismo protocolo de evaluación.
- Docencia y experimentación: ejemplo ligero y de código abierto para aprender flujos de fine-tuning con Ultralytics y evaluación con métricas macro en datasets desbalanceados.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre la partición `test` (10.000 imágenes). No verificados de forma independiente (`verified: false`).

| Metrica | Valor |
|---|---|
| Top-1 accuracy | 76,78 % |
| Top-5 accuracy | 99,92 % |
| Macro F1 | 48,33 % |
| Balanced accuracy | 43,94 % |
| Macro precision | 58,99 % |
| Macro recall | 43,94 % |

Rendimiento por clase (test):

| Clase | Precision | Recall | F1 | Imagenes de test |
|---|---|---|---|---|
| city street | 79,24 % | 86,88 % | 82,88 % | 6112 |
| gas stations | 0,00 % | 0,00 % | 0,00 % | 7 (pocas) |
| highway | 73,20 % | 70,27 % | 71,70 % | 2499 |
| parking lot | 52,00 % | 26,53 % | 35,14 % | 49 (pocas) |
| residential | 68,21 % | 45,89 % | 54,87 % | 1253 |
| tunnel | 85,71 % | 66,67 % | 75,00 % | 27 (pocas) |
| unknown | 54,55 % | 11,32 % | 18,75 % | 53 |

Comparativa del model zoo del autor (misma partición `test`, ordenada por top-1):

| Modelo | Top-1 | Macro F1 | Balanced acc | Macro precision |
|---|---|---|---|---|
| EfficientViT-B3 | 79,32 % | 57,70 % | 53,59 % | 71,54 % |
| YOLO11n | 78,58 % | 49,47 % | 46,05 % | 60,98 % |
| YOLO11s | 78,58 % | 49,18 % | 45,24 % | 61,98 % |
| MobileNetV4-Conv-Small | 78,20 % | 52,89 % | 48,69 % | 61,41 % |
| MobileNetV4-Conv-Large | 78,15 % | 50,00 % | 45,48 % | 63,03 % |
| EfficientViT-B1 | 78,01 % | 54,15 % | 49,41 % | 70,13 % |
| TinyViT-21M | 77,99 % | 62,52 % | 66,21 % | 59,66 % |
| YOLO26s | 77,81 % | 52,24 % | 49,23 % | 58,28 % |
| ConvNeXt-Atto | 77,44 % | 61,06 % | 60,34 % | 67,92 % |
| YOLOv8s | 77,15 % | 48,43 % | 46,64 % | 51,16 % |
| ResNet-18 | 77,14 % | 47,29 % | 44,83 % | 54,25 % |
| **YOLO26n** | **76,78 %** | **48,33 %** | **43,94 %** | **58,99 %** |
| ConvNeXt-Tiny | 76,69 % | 56,88 % | 59,82 % | 54,60 % |
| YOLOv8n | 76,13 % | 46,40 % | 43,26 % | 54,14 % |
| EfficientViT-B0 | 75,94 % | 46,10 % | 42,64 % | 53,74 % |

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 1,55 M de parámetros, el modelo ocupa unos pocos megabytes en FP32 (en torno a 6 MB de pesos) y puede ejecutarse en CPU sin problema.
- GPU recomendadas: cualquier GPU moderna sirve; no requiere A100 ni H100. Una RTX 4090 o incluso una GPU integrada es más que suficiente.
- Cabe en cualquier GPU de consumo, incluida una GTX 1050 o una iGPU; también en dispositivos embebidos (Jetson Nano, Raspberry Pi con limitaciones).
- Opciones de despliegue: librería `ultralytics` (PyTorch), exportación a ONNX, TensorRT, OpenVINO u otros formatos soportados por Ultralytics (no se detallan en la información proporcionada).
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo, se espera latencia de milisegundos en GPU y decenas de milisegundos en CPU, pero son estimaciones no verificadas.

## Comparativa con modelos similares

| Modelo | Parametros | Top-1 (test) | Macro F1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| YOLO26n (este modelo) | 1,55 M | 76,78 % | 48,33 % | AGPL-3.0 | Hugging Face |
| YOLO11n | no disponible | 78,58 % | 49,47 % | AGPL-3.0 (Ultralytics) | Hugging Face / Ultralytics |
| TinyViT-21M | ~21 M | 77,99 % | 62,52 % | no disponible | Hugging Face (model zoo del autor) |
| EfficientViT-B3 | no disponible | 79,32 % | 57,70 % | no disponible | Hugging Face (model zoo del autor) |
| MobileNetV4-Conv-Small | no disponible | 78,20 % | 52,89 % | no disponible | Hugging Face (model zoo del autor) |

Los datos de parámetros de los modelos comparables no están disponibles en la información proporcionada; solo se conoce el tamaño de TinyViT-21M por su nombre. En términos de top-1, YOLO26n queda por debajo de EfficientViT-B3, YOLO11n y MobileNetV4, pero su ventaja es el tamaño reducido y su integración en el ecosistema Ultralytics.

## Limitaciones y advertencias

- El modelo no clasifica correctamente ninguna imagen de la clase `gas stations` (0 % de precisión y recall en las 7 imágenes de test), por lo que debe considerarse no soportada.
- Rendimiento muy bajo en clases minoritarias: parking lot (F1 35,14 %), unknown (F1 18,75 %) y residential (F1 54,87 %). El macro F1 (48,33 %) refleja un fuerte desbalance de clases y un rendimiento pobre en las clases poco representadas.
- Riesgo de sesgo hacia la clase mayoritaria (city street, 6112 imágenes de test), lo que infla la accuracy top-1 (76,78 %) frente a métricas macro.
- No hay información sobre el proceso de entrenamiento (épocas efectivas, aumentos de datos, composición del dataset), lo que dificulta la reproducibilidad completa.
- Licencia AGPL-3.0: el uso comercial en productos propietarios puede requerir cumplir con las obligaciones de copyleft de la AGPL; conviene revisar con asesoría legal.
- Tarea no oficial derivada de BDD100K; el etiquetado de escenas proviene del campo `attributes.scene` y puede contener ruido o ambigüedad.
- No se han documentado sesgos geográficos o demográficos específicos, pero al entrenarse sobre BDD100K (principalmente escenas de EE. UU.) puede generalizar peor en otros países.
- No apto para tareas de detección, segmentación ni comprensión de lenguaje; es exclusivamente un clasificador de escena.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dronefreak/bdd100k-scenario-yolo26n-cls
- Repositorio BDD100K-Toolkit: https://github.com/dronefreak/bdd100k-toolkit
- Dataset BDD100K Scenario Classification: https://huggingface.co/datasets/dronefreak/BDD100K-Scenario-Classification
- Paper BDD100K (arxiv:1805.04687): https://arxiv.org/abs/1805.04687
- Paper referenciado arxiv:2606.03748: https://arxiv.org/abs/2606.03748 (identificador tal como aparece en los tags; no verificado)
- Modelo base YOLO26: https://huggingface.co/Ultralytics/YOLO26
- Demo (vídeo en la model card): https://huggingface.co/dronefreak/bdd100k-scenario-yolo26n-cls/resolve/main/assets/demo_banner.mp4
