# dronefreak/bdd100k-scenario-yolov8n-cls

## Resumen

`dronefreak/bdd100k-scenario-yolov8n-cls` es un clasificador de imágenes basado en la arquitectura YOLOv8n de Ultralytics, afinado para la tarea de clasificación de escenarios de conducción en siete clases (ciudad, autopista, residencial, aparcamiento, gasolinera, túnel y desconocido). Lo publica el usuario dronefreak como parte de BDD100K-Toolkit, un conjunto de herramientas para preparar el dataset BDD100K, entrenar modelos sobre él y evaluarlos con métricas homogéneas sobre los mismos splits. La tarea es no oficial: deriva de los atributos por imagen del campo `attributes.scene` de BDD100K.

El modelo es deliberadamente pequeño: 1.454.071 parámetros en formato safetensors, lo que lo sitúa en la gama de clasificadores ligeros aptos para inferencia en tiempo real sobre hardware modesto, incluidos dispositivos embebidos. Se distribuye bajo licencia AGPL-3.0, lo que condiciona su uso en productos propietarios. El repositorio ocupa 0,0 GB y la librería de referencia es `ultralytics`.

Su relevancia actual es acotada pero concreta: sirve como línea base reproducible para clasificación de escenarios viales y como ejemplo de integración del ecosistema Ultralytics con el toolkit BDD100K. Los resultados publicados muestran un top-1 del 76,13 % en el split de test (10.000 imágenes), pero un macro F1 de solo 46,40 %, lo que refleja un fuerte desequilibrio de clases y un rendimiento muy desigual entre categorías. No es un modelo de propósito general ni un LLM: es un clasificador de visión por computador especializado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOv8n (Ultralytics), cabeza de clasificación de imágenes |
| Parametros totales | 1.454.071 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no procesa texto; las etiquetas de clase están en inglés) |
| Licencia | AGPL-3.0 |
| Formato de pesos | safetensors en el repo; checkpoint `best.pt` para Ultralytics |

## Arquitectura y entrenamiento

El modelo parte de YOLOv8n, la variante nano de la familia YOLOv8 de Ultralytics, reutilizada aquí como backbone de clasificación de imágenes en lugar de detección de objetos. La arquitectura es una red neuronal convolucional con módulos CSP y cabezal de clasificación sobre las características globales; el número exacto de capas y la configuración del backbone no se detallan en la información disponible. El checkpoint publicado se carga mediante `YOLO(hf_hub_download(...))` y expone la API estándar de Ultralytics (`model.names`, `probs.top1`, `probs.top1conf`).

El entrenamiento se realizó sobre el dataset `dronefreak/BDD100K-Scenario-Classification`, derivado de BDD100K, con un máximo de 50 épocas configuradas y 20 épocas efectivamente entrenadas. No se especifican en la información proporcionada el número de tokens (no aplica), la composición exacta del dataset de entrenamiento, la resolución de entrada, el optimizador, la tasa de aprendizaje ni si hubo aumentación de datos o técnicas de regularización. Tampoco se documenta el uso de RLHF/DPO (no aplicable a un clasificador de visión) ni innovaciones técnicas como decodificación especulativa o atención lineal. La evaluación se realizó sobre el split de test de 10.000 imágenes con métricas macro y balanceadas, lo que sugiere una preocupación explícita por el desequilibrio de clases.

## Capacidades

- Clasificación de imágenes en siete clases de escenario de conducción: city street, highway, residential, parking lot, gas stations, tunnel y unknown.
- Salida de probabilidades por clase y top-1/top-5 mediante la API de Ultralytics (`probs.top1`, `probs.top1conf`, `probs.top5`).
- Inferencia sobre imágenes individuales o lotes, con soporte para vídeo mediante el pipeline estándar de Ultralytics (el demo de la model card muestra predicciones sobre clips de test de BDD100K).
- Integración con el ecosistema Ultralytics (exportación a otros formatos, entrenamiento y validación con la misma API).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto: es exclusivamente un clasificador visual.
- Capacidades multilingües: no aplica; las etiquetas de clase están en inglés y no hay procesamiento de lenguaje.
- No dispone de modo thinking, visión generativa, audio ni otras capacidades multimodales más allá de la clasificación de imagen.

## Casos de uso

- Etiquetado automático de escenarios en pipelines de datos de conducción autónoma: el modelo puede preclasificar frames de BDD100K o de cámaras de vehículo en las siete categorías para priorizar la revisión humana, aprovechando su bajo coste computacional (1,4 M de parámetros) y su top-1 del 76,13 % en el split de test.
- Filtrado y enrutamiento de clips de vídeo: en un sistema de gestión de datos de flotas, el clasificador puede separar segmentos de autopista, ciudad o túnel para dirigir cada clip a los modelos de percepción o planificación correspondientes, con la advertencia de que las clases minoritarias (gasolinera, túnel, aparcamiento) tienen recall bajo.
- Línea base reproducible para investigación: al formar parte de BDD100K-Toolkit y publicar métricas sobre el mismo split que otros modelos del model zoo (EfficientViT, MobileNetV4, YOLO11, ConvNeXt), sirve para comparar arquitecturas en la tarea de clasificación de escenarios con una metodología homogénea.
- Prototipado rápido en dispositivos de borde: con 1,4 M de parámetros, es viable ejecutarlo en GPUs de consumo e incluso en hardware embebido para demos de clasificación de escena en tiempo real, siempre que se acepte su limitación en clases poco representadas.
- Análisis de dominios de conducción para selección de datasets: permite caracterizar la distribución de escenarios de un conjunto de imágenes (por ejemplo, qué proporción es ciudad frente a autopista) antes de entrenar modelos más grandes, usando la clase predicha como señal aproximada.
- Módulo auxiliar en sistemas de asistencia a la conducción: puede aportar una señal contextual de escenario (ciudad, túnel, autopista) que otros módulos usen para ajustar parámetros, aunque su macro F1 del 46,40 % y el fallo total en gasolineras lo hacen inadecuado como componente crítico de seguridad.
- Evaluación comparativa de checkpoints dentro de BDD100K-Toolkit: el modelo se integra en el flujo de entrenamiento y validación del toolkit, lo que facilita reproducir sus resultados y compararlos con las otras variantes publicadas en el model zoo.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (model-index), evaluados sobre el split de test de 10.000 imágenes del dataset BDD100K Scenario Classification. No verificados de forma independiente (`verified: false`).

| Metrica | Valor |
|---|---|
| Top-1 accuracy (test) | 76,13 % |
| Top-5 accuracy (test) | 99,95 % |
| Macro F1 (test) | 46,40 % |
| Balanced accuracy (test) | 43,26 % |
| Macro precision (test) | 54,14 % |
| Macro recall (test) | 43,26 % |

Rendimiento por clase (split de test):

| Clase | Precision | Recall | F1 | Imagenes de test |
|---|---|---|---|---|
| city street | 78,90 % | 86,01 % | 82,30 % | 6112 |
| gas stations | 0,00 % | 0,00 % | 0,00 % | 7 |
| highway | 70,60 % | 75,35 % | 72,90 % | 2499 |
| parking lot | 62,50 % | 30,61 % | 41,10 % | 49 |
| residential | 71,17 % | 34,88 % | 46,81 % | 1253 |
| tunnel | 83,33 % | 74,07 % | 78,43 % | 27 |
| unknown | 12,50 % | 1,89 % | 3,28 % | 53 |

El autor advierte que el checkpoint no clasifica correctamente ninguna de las 7 imágenes de test de `gas stations`, por lo que esa clase debe considerarse no soportada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 1,454 M de parámetros y pesos en punto flotante de 32 bits, el modelo ocupa aproximadamente 5,8 MB en memoria, por lo que la VRAM necesaria es mínima (del orden de decenas o pocos cientos de MB incluyendo activaciones y el runtime de PyTorch).
- GPU recomendadas: cualquier GPU moderna es suficiente; no se requieren A100 ni H100. Una RTX 4090, RTX 3090 o incluso una GPU integrada pueden ejecutarlo sin problema.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo actual e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: Ultralytics (PyTorch) es la vía documentada; el ecosistema Ultralytics permite exportar a formatos como ONNX, TensorRT o OpenVINO, aunque la información proporcionada no confirma exportaciones probadas para este checkpoint concreto. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a un clasificador de visión).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

El autor publica un model zoo con todos los modelos evaluados sobre el mismo split de test. La siguiente tabla compara el checkpoint con las alternativas más cercanas en tamaño o rendimiento, según los datos de la model card:

| Modelo | Top-1 | Macro F1 | Balanced acc | Macro precision |
|---|---|---|---|---|
| EfficientViT-B3 | 79,32 % | 57,70 % | 53,59 % | 71,54 % |
| YOLO11n | 78,58 % | 49,47 % | 46,05 % | 60,98 % |
| TinyViT-21M | 77,99 % | 62,52 % | 66,21 % | 59,66 % |
| ConvNeXt-Atto | 77,44 % | 61,06 % | 60,34 % | 67,92 % |
| YOLOv8s | 77,15 % | 48,43 % | 46,64 % | 51,16 % |
| ResNet-18 | 77,14 % | 47,29 % | 44,83 % | 54,25 % |
| **YOLOv8n (este modelo)** | **76,13 %** | **46,40 %** | **43,26 %** | **54,14 %** |
| EfficientViT-B0 | 75,94 % | 46,10 % | 42,64 % | 53,74 % |

En términos de top-1, el modelo queda por debajo de EfficientViT-B3, YOLO11n, TinyViT-21M, ConvNeXt-Atto, YOLOv8s y ResNet-18, y solo supera a EfficientViT-B0. En macro F1 y balanced accuracy, TinyViT-21M y ConvNeXt-Atto son claramente superiores (62,52 % y 61,06 % de macro F1 respectivamente), lo que indica que el checkpoint de YOLOv8n sufre especialmente con las clases minoritarias. La comparación de parámetros, contexto y licencia de cada alternativa no está disponible en la información proporcionada más allá de lo indicado en la tabla.

## Limitaciones y advertencias

- Fuerte desequilibrio de clases: el macro F1 (46,40 %) y la balanced accuracy (43,26 %) son muy inferiores al top-1 (76,13 %), lo que indica que el modelo acierta sobre todo en las clases mayoritarias (city street y highway) y falla en las minoritarias.
- La clase `gas stations` no se clasifica correctamente en ninguna imagen de test (0 % de precisión y recall sobre 7 imágenes); el autor la considera no soportada.
- Rendimiento pobre en `unknown` (F1 3,28 %) y `residential` (recall 34,88 %), y moderado en `parking lot` (F1 41,10 %).
- Riesgo de sesgo hacia los escenarios dominantes del dataset BDD100K, que no representa por igual todos los entornos geográficos ni condiciones meteorológicas o de iluminación.
- Riesgo de alucinación en el sentido de clasificaciones erróneas con alta confianza, especialmente en escenarios visualmente ambiguos o fuera de la distribución de entrenamiento; no debe usarse como componente crítico de seguridad en conducción autónoma.
- Limitaciones de idioma: no aplica procesamiento de lenguaje; las etiquetas están en inglés y no hay soporte multilingüe.
- Licencia AGPL-3.0: impone obligaciones de copyleft para uso en red y distribución; el uso comercial en productos propietarios requiere revisión legal o una licencia alternativa de Ultralytics.
- Tarea no oficial: la clasificación de escenarios deriva del campo `attributes.scene` de BDD100K y no es un benchmark estándar; los resultados no son directamente comparables con literatura externa.
- Resultados no verificados de forma independiente (`verified: false` en el model-index); el autor declara las métricas sin auditoría externa.
- Solo se entrenaron 20 épocas de las 50 configuradas; no se documentan hiperparámetros, resolución de entrada ni estrategias de balanceo, lo que limita la reproducibilidad.
- El repositorio tiene 16 descargas y 0 likes en el momento de la consulta, lo que sugiere escasa validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/dronefreak/bdd100k-scenario-yolov8n-cls
- Repositorio BDD100K-Toolkit: https://github.com/dronefreak/bdd100k-toolkit
- Dataset de clasificación de escenarios: https://huggingface.co/datasets/dronefreak/BDD100K-Scenario-Classification
- Modelo base YOLOv8: https://huggingface.co/Ultralytics/YOLOv8
- Paper de YOLOv8 (referenciado en los tags): arXiv:2304.00501 — https://arxiv.org/abs/2304.00501
- Paper de BDD100K (referenciado en los tags): arXiv:1805.04687 — https://arxiv.org/abs/1805.04687
