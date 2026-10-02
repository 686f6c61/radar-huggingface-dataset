# dronefreak/bdd100k-weather-yolo26n-cls

## Resumen

YOLO26n finetuneado para clasificación meteorológica de escenas de conducción. Se trata de un checkpoint de clasificación de imágenes derivado del modelo base Ultralytics/YOLO26 en su variante nano, ajustado sobre el conjunto BDD100K Weather Classification. El autor, dronefreak, lo entrena y evalúa dentro de BDD100K-Toolkit, un toolkit pensado para preparar BDD100K, entrenar modelos y evaluarlos con las mismas métricas sobre los mismos splits. El modelo resuelve una tarea de 7 clases derivada del campo `attributes.weather` de BDD100K: clear, partly cloudy, overcast, rainy, snowy, foggy y unknown. Es una tarea no oficial, alineada con el dataset de Kaggle del mismo nombre.

El modelo es muy pequeno (1,5 millones de parametros) y esta pensado para clasificar condiciones meteorológicas a partir de una sola imagen RGB redimensionada a 224x224 píxeles. Su relevancia práctica está en ser un componente ligero dentro de pipelines de conducción autónoma: permite etiquetar el clima de un frame antes de decidir qué modelo de percepción activar, con un coste computacional mínimo. Alcanza un 82,04% de top-1 y un 99,77% de top-5 en el split de test de 10.000 imágenes, aunque su F1 macro (64,09%) revela un rendimiento claramente desigual entre clases.

Se distribuye bajo licencia AGPL-3.0, lo que condiciona su uso en productos propietarios. No soporta texto ni multimodalidad: es exclusivamente un clasificador de imágenes y no dispone de ventana de contexto, tool calling ni capacidades de agente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN de clasificación, variante nano de Ultralytics YOLO26 (yolo26n-cls) |
| Parametros totales | 1,5 M (segun badge de la model card; el valor exacto no se detalla) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no aplicable (clasificación de imágenes con entrada fija de 224x224) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplicable / no disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | AGPL-3.0 |
| Formato de pesos | PyTorch (checkpoint `best.pt`); conversiones a GGUF u ONNX no documentadas |
| Tarea | Image classification (7 clases de clima) |
| Framework | Ultralytics (libreria `ultralytics`) |
| Tamano de entrada | 224x224 píxeles |
| Numero de clases | 7 (clear, partly cloudy, overcast, rainy, snowy, foggy, unknown) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del checkpoint preentrenado Ultralytics/YOLO26 en su variante de clasificación nano (yolo26n-cls). YOLO26 es la generación de la familia YOLO de Ultralytics que sirve de base a este ajuste; la model card no describe la arquitectura interna en detalle más allá de identificarla como variante de clasificación y señalar el uso del framework Ultralytics. No se especifican en la información disponible innovaciones como decodificación especulativa, atención lineal ni mecanismos híbridos.

El entrenamiento partió del modelo preentrenado (`pretrained: True`) con los siguientes hiperparámetros: máximo de 50 épocas, 42 épocas efectivamente entrenadas, mejor época en la 32, batch size 128, resolución de imagen 224x224, semilla 0 y optimizador resuelto automáticamente a MuSGD con learning rate 0.01 y momentum 0.9. El checkpoint `best.pt` se seleccionó maximizando la macro F1 sobre el split de validación, con early stopping de paciencia 10. No se documenta composición exacta del dataset de entrenamiento, número de tokens (no aplicable) ni uso de RLHF/DPO (no aplicable a visión). Los splits preparados residen en el dataset dronefreak/BDD100K-Weather-Classification.

## Capacidades

- Clasificación de imágenes en 7 categorías meteorológicas de escenas de conducción: clear, partly cloudy, overcast, rainy, snowy, foggy y unknown.
- Salida de probabilidades por clase (vector `probs`), con acceso a top-1, top-5 y confianza de la predicción.
- Inferencia sobre imagen única mediante la API de Ultralytics: `model("street.jpg")`.
- Adecuado como etapa de preprocesado en pipelines de visión por computador (por ejemplo, condicionar el comportamiento de otros modelos según el clima).
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- Sin capacidades multilingües (no procesa texto).
- Sin capacidades de visión más allá de la clasificación: no hace detección de objetos, segmentación, OCR ni VQA.
- Rendimiento efectivo limitado a 6 de las 7 clases: la clase foggy no se clasifica correctamente en ninguna imagen del test.

## Casos de uso

- Etiquetado automático de clima en datasets de conducción: clasificar cada frame de un corpus de vídeo de vehículo para anotar condiciones meteorológicas antes de entrenar modelos de percepción, con un coste de 1,5 M de parámetros por inferencia.
- Enrutamiento de modelos en un stack de conducción autónoma: usar la predicción de clima como señal para activar o desactivar módulos específicos (por ejemplo, detección reforzada en condiciones de lluvia o nieve) antes de ejecutar modelos más pesados.
- Monitorización de flotas y obras: clasificar el clima en imágenes telemáticas de vehículos para generar informes operativos sobre condiciones de circulación a lo largo del tiempo.
- Preprocesado en pipelines de robótica móvil aérea o terrestre: filtrar frames por condición meteorológica para seleccionar subconjuntos de datos o disparar alertas cuando se detecta lluvia o nieve.
- Análisis de datasets para investigación: reproducir la tarea del Kaggle BDD100K Weather Classification y comparar contra otros clasificadores de la model zoo con un protocolo de evaluación idéntico.
- Prototipado rápido en entornos sin GPU: por su tamaño (1,5 M de parámetros) y su entrada de 224x224, puede ejecutarse en CPU para pruebas de concepto y validación de pipelines de etiquetado.
- Componente de anotación asistida: generar etiquetas preliminares de clima para que un anotador humano las revise, reduciendo el coste de anotación de grandes corpus de imágenes de tráfico.
- Integración en herramientas de análisis de vídeo de tráfico urbano: clasificar el clima en secuencias de cámaras de tráfico para estudios de accidentalidad o planificación de mantenimiento vial.

## Benchmarks y rendimiento

Evaluación declarada por el autor sobre el split `test` de BDD100K Weather Classification (10.000 imágenes). Métricas no verificadas de forma independiente (`verified: false`).

| Metrica | Valor |
|---|---|
| Top-1 accuracy | 82,04% |
| Top-5 accuracy | 99,77% |
| Macro F1 | 64,09% |
| Balanced accuracy | 62,46% |
| Macro precision | 66,57% |
| Macro recall | 62,46% |

Rendimiento por clase:

| Clase | Precision | Recall | F1 | Imagenes en test |
|---|---|---|---|---|
| clear | 89,75% | 92,85% | 91,28% | 5346 |
| foggy | 0,00% | 0,00% | 0,00% | 13 |
| overcast | 63,66% | 71,83% | 67,50% | 1239 |
| partly cloudy | 68,77% | 63,55% | 66,06% | 738 |
| rainy | 88,68% | 64,77% | 74,86% | 738 |
| snowy | 83,12% | 68,53% | 75,12% | 769 |
| unknown | 72,04% | 75,71% | 73,83% | 1157 |

Model zoo del mismo autor, evaluado sobre el mismo split de test (ordenado por top-1):

| Modelo | Top-1 | Macro F1 | Balanced acc | Macro precision |
|---|---|---|---|---|
| convnext_atto | 83,00% | 67,44% | 65,25% | 81,38% |
| efficientvit_b0 | 82,79% | 65,10% | 63,62% | 67,11% |
| resnet18 | 82,19% | 64,30% | 62,97% | 66,08% |
| mobilenetv4_conv_small | 82,16% | 66,51% | 64,37% | 80,44% |
| yolo26n-cls (este modelo) | 82,04% | 64,09% | 62,46% | 66,57% |
| yolo11n-cls | 81,32% | 62,91% | 61,19% | 65,68% |
| yolov8n-cls | 81,22% | 63,07% | 61,42% | 65,52% |

## Requisitos de hardware

- VRAM estimada (cálculo propio a partir del tamaño declarado de 1,5 M de parámetros): en torno a 6 MB para los pesos en fp32; el consumo real dominante es el de activaciones y buffers a 224x224, en el rango de decenas de MB. La model card no publica cifras oficiales de VRAM ni de throughput.
- GPU recomendadas: cualquier GPU moderna sirve; al ser un modelo nano de clasificación a 224x224, no requiere aceleradores de gama alta.
- Compatibilidad con GPU de consumo: sí. Cabe holgadamente en cualquier GPU de consumo (RTX 3060, RTX 4090, etc.) e incluso en iGPU y CPU.
- CPU: viable para inferencia en CPU dado el tamaño del modelo, aunque sin cifras de latencia publicadas.
- Opciones de despliegue: la model card solo documenta Ultralytics con PyTorch (`best.pt`). El uso con vLLM, llama.cpp, Ollama o TGI no está documentado y, al no ser un modelo de lenguaje, esas herramientas no son aplicables; para despliegue de visión encajarían exportaciones a ONNX/TensorRT o el propio runtime de Ultralytics, aunque la model card no las menciona.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

Comparación con alternativas del mismo model zoo, todas evaluadas por el autor sobre el mismo split de test:

| Modelo | Parametros | Top-1 | Macro F1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| yolo26n-cls (este modelo) | 1,5 M | 82,04% | 64,09% | AGPL-3.0 | HuggingFace |
| convnext_atto | no disponible | 83,00% | 67,44% | no disponible | HuggingFace (autor) |
| mobilenetv4_conv_small | no disponible | 82,16% | 66,51% | no disponible | HuggingFace (autor) |
| resnet18 | no disponible | 82,19% | 64,30% | no disponible | HuggingFace (autor) |
| yolo11n-cls | no disponible | 81,32% | 62,91% | no disponible | HuggingFace (autor) |

Según los datos del propio autor, convnext_atto y mobilenetv4_conv_small superan a este modelo tanto en top-1 como en macro F1 y macro precision; resnet18 lo supera en top-1 y macro F1. El modelo destaca frente a yolo11n-cls y yolov8n-cls en la mayoría de métricas. No se dispone de datos de parámetros, licencia ni contexto de los modelos comparables más allá de lo indicado.

## Limitaciones y advertencias

- La clase foggy es un caso de fallo total: precision, recall y F1 son 0,00% sobre las 13 imágenes de test de esa clase. El propio autor indica que debe tratarse como clase no soportada.
- El F1 macro (64,09%) es muy inferior al top-1 (82,04%), lo que indica un fuerte desequilibrio de rendimiento entre clases y un sesgo hacia la clase mayoritaria (clear, con 5346 imágenes de test).
- Existe riesgo de sesgo de dominio: el modelo se ha ajustado y evaluado exclusivamente sobre BDD100K, con imágenes de conducción; el rendimiento fuera de esa distribución no está validado.
- Riesgo de alucinación/clasificación errónea en condiciones visualmente ambiguas: clases como overcast, partly cloudy y unknown obtienen F1 entre el 66% y el 74%, por lo que son propensas a confusión mutua.
- La etiqueta `unknown` puede absorberse casos límite, lo que afecta a la utilidad de las etiquetas en producción.
- Licencia AGPL-3.0: impone obligaciones de copyleft sobre el código que use el modelo en servicios de red, lo que puede ser un obstáculo para integración en productos propietarios o SaaS.
- Las métricas son declaradas por el autor y marcadas como no verificadas (`verified: false`); no hay validación independiente.
- No hay información sobre cuantizaciones, despliegue en ONNX/TensorRT ni latencias, lo que dificulta estimar coste operativo en producción.
- Al ser un clasificador de imágenes no procesa texto, no soporta instrucciones en lenguaje natural ni agentes; cualquier caso de uso conversacional requeriría un componente externo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dronefreak/bdd100k-weather-yolo26n-cls
- Dataset de entrenamiento y evaluacion: https://huggingface.co/datasets/dronefreak/BDD100K-Weather-Classification
- Repositorio BDD100K-Toolkit: https://github.com/dronefreak/bdd100k-toolkit
- Modelo relacionado de deteccion del mismo autor: https://huggingface.co/dronefreak/bdd100k-yolo26n
- Coleccion BDD100K Object Detection Model Zoo: https://huggingface.co/collections/dronefreak/bdd100k-object-detection-model-zoo
- Model Zoo oficial de BDD100K (SysCV): https://github.com/SysCV/bdd100k-models
- Paper de BDD100K (arxiv:1805.04687): https://arxiv.org/abs/1805.04687
- Referencia arxiv incluida en los tags del modelo (arxiv:2606.03748): https://arxiv.org/abs/2606.03748
