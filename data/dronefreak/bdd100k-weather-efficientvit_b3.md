# dronefreak/bdd100k-weather-efficientvit_b3

## Resumen

EfficientViT-B3 fine-tuneado para clasificación meteorológica sobre el conjunto de datos BDD100K es un clasificador de imágenes desarrollado por el usuario dronefreak, entrenado y evaluado como parte del proyecto BDD100K-Toolkit. El modelo parte de los pesos preentrenados `timm/efficientvit_b3.r224_in1k` (entrenados sobre ImageNet-1k a resolución 224) y se ajusta para resolver una tarea de 7 clases derivada del campo `attributes.weather` de BDD100K: clear, partly cloudy, overcast, rainy, snowy, foggy y unknown.

Se trata de un modelo de visión por computador de 46,1 millones de parámetros, no de un modelo de lenguaje, por lo que conceptos como ventana de contexto, tool calling o agentes no aplican. Su relevancia radica en que aborda una subtarea práctica para conducción autónoma (estimar las condiciones meteorológicas a partir de una sola imagen de escena de tráfico) con un coste computacional contenido, y en que se publica junto a una comparativa homogénea (model zoo) de arquitecturas eficientes evaluadas sobre el mismo split de test.

El modelo declara una precisión Top-1 del 83,51 por ciento y un F1 macro del 68,17 por ciento sobre el split de test (10.000 imágenes). La brecha entre precisión Top-1 y F1 macro refleja el fuerte desbalanceo de clases del conjunto, en particular la clase foggy, con solo 13 imágenes de test. La licencia Apache-2.0 facilita su uso comercial, aunque el autor marca las métricas como no verificadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EfficientViT (vision transformer eficiente con atención lineal por etapas), variante B3, entrada 224x224 |
| Parametros totales | 46,1 M |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de clasificación de imágenes, no procesa secuencias de texto) |
| Tipos de cuantizacion | no disponible (no se documentan cuantizaciones oficiales) |
| Idiomas soportados | no aplica; las etiquetas de clase están en inglés (clear, partly cloudy, overcast, rainy, snowy, foggy, unknown) |
| Licencia | Apache-2.0 |
| Formato de pesos | checkpoint de PyTorch (`best.pt`, contiene `state_dict`, `model_name`, `class_names`, `imgsz`, `mean` y `std`) |

## Arquitectura y entrenamiento

El modelo se basa en EfficientViT-B3, una arquitectura de visión tipo transformer diseñada para eficiencia computacional, con atención lineal y un diseño por etapas que reduce el coste respecto a los transformers de visión convencionales. La entrada es de 224x224 píxeles, coherente con el sufijo `r224` del modelo base. El checkpoint contiene la información necesaria para reconstruir el pipeline: nombre del modelo timm, lista de clases, tamaño de imagen y estadísticas de normalización (media y desviación típica).

El ajuste fino se realizó sobre el conjunto BDD100K Weather Classification, una tarea no oficial derivada del campo de atributos meteorológicos por imagen de BDD100K y que sigue el conjunto de Kaggle del mismo nombre. No se detalla en la información disponible el número de tokens o épocas, la composición exacta del split de entrenamiento ni si se emplearon técnicas de aumento de datos más allá del redimensionado y la normalización. Tampoco se documenta el uso de RLHF, DPO ni procedimientos equivalentes, que no aplican a este tipo de tarea. La evaluación se realizó sobre el split de test de 10.000 imágenes.

## Capacidades

- Clasificación de imágenes de escenas de conducción en 7 categorías meteorológicas: clear, partly cloudy, overcast, rainy, snowy, foggy y unknown.
- Inferencia sobre imágenes RGB individuales redimensionadas a 224x224 y normalizadas con la media y desviación típica almacenadas en el checkpoint.
- Salida de distribución de probabilidad sobre las 7 clases mediante softmax, lo que permite aplicar umbrales de confianza.
- Integración directa con la librería `timm` y PyTorch, sin dependencias adicionales específicas del proyecto.
- No soporta tool calling, function calling ni razonamiento multi-paso (no es un modelo de lenguaje).
- No dispone de capacidades multilingües, de audio ni de generación de texto.
- No se documenta un modo "thinking" ni decodificación especulativa.

## Casos de uso

- Etiquetado automático de condiciones meteorológicas en datasets de conducción: el modelo puede procesar lotes de imágenes de BDD100K u otros datasets de tráfico y asignar una etiqueta de clima a cada una, facilitando la creación de subconjuntos estratificados por meteorología.
- Preprocesado en pipelines de conducción autónoma: la etiqueta de clima puede alimentar módulos posteriores (detección de objetos, segmentación) que ajusten sus umbrales según las condiciones (por ejemplo, mayor cautela en rainy o foggy).
- Sistemas de monitorización de flotas y vehículos conectados: clasificar el clima a partir de la cámara del vehículo para registrar condiciones de operación y generar informes de seguridad.
- Validación de robustez de otros modelos de visión: usar la predicción de clima como variable de control al analizar el rendimiento de detectores o segmentadores bajo distintas condiciones meteorológicas.
- Análisis de imágenes de tráfico para infraestructura urbana: estimar la fracción de tiempo con lluvia, nieve o niebla en un tramo a partir de cámaras de tráfico existentes.
- Investigación en clasificación desbalanceada: el modelo y su model zoo asociado sirven como punto de partida reproducible para estudiar el efecto del desbalanceo entre clases (especialmente la clase foggy, con 13 imágenes de test).
- Prototipado rápido en entornos con recursos limitados: al tener 46,1 M de parámetros, puede ejecutarse en CPU o en GPU de gama media para pruebas de concepto.
- Filtrado previo en anotación humana: predecir el clima y priorizar la revisión manual de las muestras con baja confianza o clases minoritarias.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el split de test de BDD100K Weather Classification (10.000 imágenes), marcados como no verificados en el model-index:

| Metrica | Valor |
|---|---|
| Top-1 accuracy | 83,51 % |
| Top-5 accuracy | 99,85 % |
| Macro F1 | 68,17 % |
| Balanced accuracy | 66,34 % |
| Macro precision | 81,75 % |
| Macro recall | 66,34 % |

Desglose por clase:

| Clase | Precision | Recall | F1 | Imagenes de test |
|---|---|---|---|---|
| clear | 91,21 % | 92,57 % | 91,89 % | 5346 |
| foggy | 100,00 % | 7,69 % | 14,29 % | 13 |
| overcast | 68,27 % | 68,60 % | 68,44 % | 1239 |
| partly cloudy | 69,24 % | 61,92 % | 65,38 % | 738 |
| rainy | 87,50 % | 71,14 % | 78,48 % | 738 |
| snowy | 85,18 % | 79,97 % | 82,49 % | 769 |
| unknown | 70,88 % | 82,45 % | 76,23 % | 1157 |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 184 MB en FP32 (46,1 M parámetros) y unos 92 MB en FP16. El repositorio ocupa 0,2 GB, incluyendo el checkpoint.
- Cabe holgadamente en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, así como en GPUs integradas y en CPU para inferencia por lotes pequeños.
- GPU recomendadas para producción con alto throughput: cualquiera con soporte CUDA moderna (A100, H100, L4, T4); el cuello de botella en producción vendrá del preprocesado y del tamaño de lote, no de la memoria del modelo.
- Opciones de despliegue: PyTorch nativo con `timm`, TorchScript o exportación a ONNX. No se documenta soporte oficial para vLLM, TGI, llama.cpp u Ollama, que están orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada. Dado el tamaño (46,1 M de parámetros) y la resolución de entrada (224x224), se espera un throughput alto en GPU, pero no se aportan cifras medidas.

## Comparativa con modelos similares

Comparativa con otras arquitecturas evaluadas por el mismo autor sobre el mismo split de test, ordenadas por Top-1 en el model zoo:

| Modelo | Top-1 | Macro F1 | Balanced acc | Macro precision |
|---|---|---|---|---|
| TinyViT-21M | 83,90 % | 68,65 % | 67,15 % | 74,81 % |
| EfficientViT-B3 (este modelo) | 83,51 % | 68,17 % | 66,34 % | 81,75 % |
| EfficientViT-B2 | 83,46 % | 66,07 % | 65,04 % | 67,54 % |
| EfficientFormerV2-L | 83,27 % | 65,93 % | 65,03 % | 67,12 % |
| RepViT-M1.5 | 83,19 % | 67,78 % | 65,71 % | 81,56 % |
| EfficientViT-L1 | 83,13 % | 65,70 % | 65,11 % | 66,46 % |
| RepViT-M2.3 | 83,02 % | 65,46 % | 64,33 % | 67,02 % |
| ConvNeXt-Atto | 83,00 % | 67,44 % | 65,25 % | 81,38 % |
| EfficientFormerV2-S2 | 82,90 % | 65,50 % | 64,68 % | 66,98 % |
| EfficientViT-B0 | 82,79 % | 65,10 % | 63,62 % | 67,11 % |
| EfficientViT-B1 | 82,67 % | 64,95 % | 63,59 % | 66,83 % |
| MobileNetV4-Conv-Large | 82,20 % | (truncado en la información disponible) | | |

Todos los modelos comparten el mismo split de evaluación y las mismas métricas, lo que permite una comparación directa. EfficientViT-B3 destaca por su macro precision (81,75 %), la segunda más alta tras TinyViT-21M en el fragmento disponible, aunque su Top-1 y macro F1 quedan ligeramente por debajo de TinyViT-21M y en línea con el resto de la familia EfficientViT. No se dispone de comparativa con modelos específicos de clasificación meteorológica fuera de este model zoo.

## Limitaciones y advertencias

- Desbalanceo severo de clases: la clase foggy solo tiene 13 imágenes en test, con un recall del 7,69 por ciento, lo que hace que las métricas macro estén dominadas por clases minoritarias y que la fiabilidad en niebla sea muy baja.
- Riesgo de confusión entre clases visualmente próximas: overcast y partly cloudy presentan F1 en torno al 65-68 por ciento, lo que indica solapamiento en la frontera entre ambas.
- Métricas no verificadas: el model-index marca explícitamente los resultados como `verified: false`, por lo que deben tomarse como declaraciones del autor y no como resultados reproducidos de forma independiente.
- Tarea no oficial: la clasificación meteorológica de 7 clases es una derivación del campo `attributes.weather` de BDD100K y no una tarea oficial del benchmark original, lo que limita la comparabilidad con otros trabajos publicados.
- Sesgo de dominio: entrenado sobre BDD100K, con imágenes de conducción en condiciones y geografías específicas; el rendimiento puede degradarse en otros dominios (cámaras de vigilancia, imágenes aéreas, interiores).
- Ausencia de información sobre el split de entrenamiento, hiperparámetros, número de épocas y aumentos de datos, lo que dificulta la reproducibilidad completa.
- Licencia Apache-2.0: permite uso comercial, pero conviene revisar las condiciones de uso del dataset BDD100K original, que tiene sus propias restricciones académicas y de atribución.
- No se documentan cuantizaciones oficiales ni versiones ONNX verificadas, por lo que cualquier despliegue optimizado requiere una conversión y validación por parte del usuario.
- El checkpoint se carga con `torch.load` y `weights_only=True`; versiones antiguas de PyTorch pueden requerir ajustes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dronefreak/bdd100k-weather-efficientvit_b3
- Repositorio BDD100K-Toolkit (código fuente y model zoo): https://github.com/dronefreak/bdd100k-toolkit
- Dataset de clasificación meteorológica: https://huggingface.co/datasets/dronefreak/BDD100K-Weather-Classification
- Modelo base en timm: https://huggingface.co/timm/efficientvit_b3.r224_in1k
- Paper de EfficientViT (referencia citada en las tags, arXiv:2205.14756): https://arxiv.org/abs/2205.14756
- Paper de BDD100K (referencia citada en las tags, arXiv:1805.04687): https://arxiv.org/abs/1805.04687
