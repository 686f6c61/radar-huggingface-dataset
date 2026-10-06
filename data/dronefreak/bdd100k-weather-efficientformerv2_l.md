# dronefreak/bdd100k-weather-efficientformerv2_l

## Resumen

bdd100k-weather-efficientformerv2_l es un clasificador de imágenes de siete clases meteorológicas obtenido por fine-tuning del backbone EfficientFormerV2-L de la librería timm, partiendo del checkpoint preentrenado en ImageNet-1k `timm/efficientformerv2_l.snap_dist_in1k`. Lo publica el usuario dronefreak como parte de BDD100K-Toolkit, un conjunto de utilidades para preparar el dataset BDD100K, entrenar modelos sobre él y evaluarlos con las mismas métricas y las mismas particiones. La tarea es no oficial y se deriva del campo `attributes.weather` de BDD100K: asignar a cada imagen de escena de conducción una etiqueta entre `clear`, `partly cloudy`, `overcast`, `rainy`, `snowy`, `foggy` y `unknown`.

Con 25,6 millones de parámetros y un repositorio de 0,1 GB, es un modelo compacto pensado para inferencia barata en CPU o GPU de gama baja, no para maximizar precisión absoluta. En la partición de test (10 000 imágenes) obtiene un 83,27 % de Top-1 y un 99,78 % de Top-5, pero su F1 macro cae a 65,93 %, lo que refleja el fuerte desequilibrio entre clases del dataset. Su interés práctico está en el preprocesado y el enrutado dentro de pipelines de conducción autónoma: saber si la escena es despejada, lluviosa o nevada permite seleccionar submodelos, ajustar umbrales de detección o filtrar datos antes de etapas más costosas. La licencia Apache-2.0 de los pesos facilita su integración, aunque las condiciones de uso del dataset original deben verificarse por separado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | EfficientFormerV2-L, backbone híbrido convolucional-atención de la familia EfficientFormerV2 (arXiv:2212.08059) |
| Parámetros totales | 25,6 M (según el badge de la model card) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de visión; la entrada es una imagen RGB redimensionada a `imgsz`) |
| Tipos de cuantización | No disponible; el repositorio solo publica el checkpoint `best.pt` en precisión completa, sin versiones FP16/INT8, GGUF ni ONNX documentadas |
| Idiomas soportados | No aplica (no hay entrada ni salida de texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | Checkpoint de PyTorch (`.pt`) con `state_dict`, `model_name`, `class_names`, `imgsz`, `mean` y `std`; se descarga con `huggingface_hub` |
| Tarea | Clasificación de imágenes (7 clases) |
| Framework | timm + PyTorch |
| Dataset de entrenamiento | `dronefreak/BDD100K-Weather-Classification` (derivado de BDD100K) |
| Modelo base | `timm/efficientformerv2_l.snap_dist_in1k` |
| Tamaño del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

El modelo reutiliza el backbone EfficientFormerV2-L, una red de visión ligera que combina bloques convolucionales y bloques con atención en una arquitectura de cuatro etapas, diseñada explícitamente para competir en el régimen de tamaño y velocidad de MobileNet. La variante `snap_dist_in1k` de timm corresponde al checkpoint preentrenado en ImageNet-1k mediante destilación desde un modelo profesor de mayor capacidad, según la nomenclatura de la propia librería. Sobre ese backbone se sustituye la cabeza de clasificación de ImageNet por una cabeza de siete salidas, correspondientes a las condiciones meteorológicas del dataset.

No se documentan en la información disponible los hiperparámetros del fine-tuning: número de épocas, optimizador, tasa de aprendizaje, esquema de aumentación de datos, resolución exacta de entrada (`imgsz` se lee del propio checkpoint) ni si se aplicaron técnicas de reequilibrado de clases. Tampoco se especifica si hubo entrenamiento en varias fases, congelación parcial de capas o destilación adicional. La evaluación sí está descrita con precisión: se realiza sobre la partición `test` del dataset, con 10 000 imágenes, y todos los modelos del zoo publicado por el autor usan las mismas particiones y las mismas métricas, lo que permite comparaciones internas consistentes. No se declara ninguna innovación técnica propia más allá del ajuste fino del backbone.

## Capacidades

- Clasificación de imágenes de escenas de conducción en siete categorías meteorológicas: `clear`, `partly cloudy`, `overcast`, `rainy`, `snowy`, `foggy` y `unknown`.
- Salida de probabilidades por clase mediante `softmax`, lo que permite fijar umbrales de confianza y descartar predicciones dudosas.
- Extracción de características: al ser un backbone timm, puede usarse con `num_classes=0` como extractor de embeddings para tareas posteriores (recuperación, clustering, clasificación lineal sobre nuevas etiquetas).
- Inferencia en CPU: con 25,6 M de parámetros, el coste computacional es bajo y no exige GPU dedicada.
- Integración directa con el ecosistema PyTorch/timm y con `huggingface_hub` para la descarga del checkpoint.
- No dispone de tool calling ni function calling: es un clasificador de imágenes, no un modelo generativo.
- No soporta agentes, razonamiento multi-paso ni planificación.
- No tiene capacidades multilingües, de generación de texto, código, matemáticas, visión-lenguaje, audio ni modo "thinking".
- No se documentan capacidades de detección, segmentación ni localización: solo etiqueta global de imagen.

## Casos de uso

- Enrutado de modelos en percepción para conducción autónoma: clasificar el fotograma actual y activar el submodelo de detección o el conjunto de umbrales más adecuados para lluvia, nieve o niebla, en lugar de usar una única configuración para todas las condiciones.
- Etiquetado automático y curación de datasets de conducción: recorrer grandes volúmenes de imágenes y asignarles una etiqueta meteorológica para construir subconjuntos estratificados de entrenamiento o evaluación, aprovechando que el modelo funciona en CPU y no requiere GPU dedicada.
- Auditoría de etiquetas existentes: comparar las predicciones del modelo con el campo `weather` de un dataset para detectar anotaciones erróneas o incoherentes, dado que el propio autor lo entrena sobre esa fuente y publica métricas por clase.
- Monitorización de flotas y vehículos conectados: procesar periódicamente fotogramas enviados por la flota para caracterizar las condiciones meteorológicas a las que operan los vehículos y correlacionarlas con incidencias o consumo energético.
- Control de calidad en pipelines de ingesta de vídeo urbano: filtrar o separar clips por condición meteorológica antes de alimentar tareas más costosas como detección de objetos o seguimiento, reduciendo el gasto computacional global.
- Investigación en robustez de modelos de visión: usar el clasificador como variable de control para medir la degradación de otros modelos ante condiciones adversas, ya que las mismas particiones y métricas están publicadas y son reproducibles.
- Análisis de tráfico y planificación urbana: agregar predicciones meteorológicas sobre imágenes de cámaras de tráfico para estudiar patrones de movilidad en función del tiempo atmosférico.
- Despliegue en dispositivos embebidos o de borde: al ser un modelo de 25,6 M de parámetros, es candidato a ejecutarse en hardware limitado dentro del propio vehículo o en un nodo de borde, siempre que se valide el coste real de inferencia en el hardware objetivo.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre la partición `test` (10 000 imágenes) del dataset `dronefreak/BDD100K-Weather-Classification`. Ninguna de las métricas está verificada de forma independiente (`verified: false`).

| Métrica | Valor |
|---|---|
| Top-1 accuracy | 83,27 % |
| Top-5 accuracy | 99,78 % |
| Macro F1 | 65,93 % |
| Balanced accuracy | 65,03 % |
| Macro precision | 67,12 % |
| Macro recall | 65,03 % |

Desglose por clase:

| Clase | Precision | Recall | F1 | Imágenes de test |
|---|---|---|---|---|
| clear | 91,15 % | 92,63 % | 91,88 % | 5346 |
| foggy | 0,00 % | 0,00 % | 0,00 % | 13 |
| overcast | 66,38 % | 69,49 % | 67,90 % | 1239 |
| partly cloudy | 69,10 % | 65,45 % | 67,22 % | 738 |
| rainy | 84,83 % | 70,46 % | 76,98 % | 738 |
| snowy | 86,28 % | 79,32 % | 82,66 % | 769 |
| unknown | 72,08 % | 77,87 % | 74,86 % | 1157 |

No se han publicado otros benchmarks (por ejemplo, evaluación cruzada en otros datasets o comparación con modelos preentrenados en ImageNet sin ajustar) en la información disponible.

## Requisitos de hardware

- Peso del modelo: aproximadamente 102 MB en FP32 y unos 51 MB en FP16, a partir de los 25,6 M de parámetros. El repositorio ocupa 0,1 GB.
- VRAM de inferencia: el checkpoint cabe holgadamente en cualquier GPU con más de 2 GB de memoria; el grueso del consumo proviene de las activaciones y del tamaño de lote, no de los pesos.
- GPU recomendadas: no se requieren GPU de datacenter. El modelo está pensado para GPUs de consumo (por ejemplo, GTX 1650, RTX 3060, RTX 4090) e incluso para GPUs integradas. Modelos como A100 o H100 solo tendrían sentido para procesar lotes muy grandes.
- Inferencia en CPU: viable, dado el tamaño del modelo; es la opción lógica para etiquetado por lotes sin hardware acelerado.
- Opciones de despliegue: timm y PyTorch de forma nativa, tal y como muestra el ejemplo de la model card (`timm.create_model` + `load_state_dict`). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un clasificador de imágenes. Tampoco se documenta exportación a ONNX, TorchScript, TensorRT o Core ML.
- Resolución de entrada: no disponible en la información textual; `imgsz` se lee del propio checkpoint (`ckpt["imgsz"]`) junto con `mean` y `std`.
- Latencia y throughput: no disponibles. No se publican mediciones de tiempo de inferencia ni de imágenes por segundo en ninguna GPU o CPU concreta.

## Comparativa con modelos similares

El autor publica un "model zoo" con modelos de tamaño y familia comparables, entrenados y evaluados sobre la misma partición de test, lo que permite una comparación directa. Extracto ordenado por Top-1 (todas las cifras son Top-1 y F1 macro declarados por el autor, sin verificar):

| Modelo | Top-1 | Macro F1 | Balanced accuracy | Macro precision |
|---|---|---|---|---|
| TinyViT-21M | 83,90 % | 68,65 % | 67,15 % | 74,81 % |
| EfficientViT-B3 | 83,51 % | 68,17 % | 66,34 % | 81,75 % |
| EfficientViT-B2 | 83,46 % | 66,07 % | 65,04 % | 67,54 % |
| EfficientFormerV2-L (este modelo) | 83,27 % | 65,93 % | 65,03 % | 67,12 % |
| RepViT-M1.5 | 83,19 % | 67,78 % | 65,71 % | 81,56 % |
| EfficientViT-L1 | 83,13 % | 65,70 % | 65,11 % | 66,46 % |
| RepViT-M2.3 | 83,02 % | 65,46 % | 64,33 % | 67,02 % |
| ConvNeXt-Atto | 83,00 % | 67,44 % | 65,25 % | 81,38 % |
| EfficientFormerV2-S2 | 82,90 % | 65,50 % | 64,68 % | no disponible |

Observaciones: el Top-1 de este modelo queda 0,63 puntos por debajo de TinyViT-21M y 0,24 por debajo de EfficientViT-B3, mientras que en macro precision EfficientViT-B3 (81,75 %) y RepViT-M1.5 (81,56 %) están muy por encima, lo que sugiere que este checkpoint reparte peor la confianza entre clases minoritarias. La comparación se limita a la familia de backbones ligeros del zoo del autor; no se dispone de comparaciones con modelos más grandes ni con clasificadores específicos de meteorología vial de otros repositorios.

## Limitaciones y advertencias

- La clase `foggy` no se predice correctamente en ningún caso del test: precisión, recall y F1 iguales a 0 % sobre 13 imágenes. El propio autor la considera no soportada, por lo que el modelo no debe usarse para detectar niebla.
- Fuerte desequilibrio de clases: `clear` concentra 5346 de las 10 000 imágenes de test. La Top-1 del 83,27 % está dominada por esa clase, mientras que el F1 macro (65,93 %) y la balanced accuracy (65,03 %) reflejan un rendimiento mucho más moderado en `partly cloudy`, `overcast` y `unknown`.
- Riesgo de confusión entre condiciones visualmente próximas (`partly cloudy` frente a `overcast`, y `unknown` frente al resto). La clase `unknown` con 1157 imágenes añade ambigüedad intrínseca a la etiqueta.
- Las métricas están declaradas por el autor y no están verificadas de forma independiente (`verified: false`). No hay resultados de terceros ni evaluación cruzada en otros datasets.
- Dominio restringido: entrenado sobre imágenes de BDD100K, es decir, escenas de conducción en carretera, mayoritariamente diurnas y captadas en Estados Unidos. Se desconoce su comportamiento en cámaras de vigilancia urbana, interiores, visión nocturna, imágenes aéreas o escenas no viarias.
- No se documenta calibración de probabilidades. Los valores de `softmax` no deberían interpretarse como probabilidades fiables sin una validación específica.
- Sin datos de sesgo demográfico o geográfico más allá de la composición del dataset original, pero cualquier sesgo presente en BDD100K (ubicaciones, condiciones de captura, vehículos) se hereda en el clasificador.
- La licencia Apache-2.0 cubre los pesos publicados, pero no aclara las condiciones de uso del dataset BDD100K subyacente ni de sus atributos derivados. Antes de un despliegue comercial conviene revisar la licencia del dataset original.
- No hay garantías de mantenimiento: el modelo se publicó con 0 descargas y 0 "likes" en el momento de la consulta, y no se documenta ninguna política de soporte, versionado o corrección de errores.
- En producción conviene aplicar un umbral de confianza y una clase de rechazo, dado que el modelo siempre devuelve una de las siete etiquetas incluso ante entradas fuera de distribución.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dronefreak/bdd100k-weather-efficientformerv2_l
- Modelo base en timm/HuggingFace: https://huggingface.co/timm/efficientformerv2_l.snap_dist_in1k
- Dataset de entrenamiento: https://huggingface.co/datasets/dronefreak/BDD100K-Weather-Classification
- Repositorio del toolkit: https://github.com/dronefreak/bdd100k-toolkit
- Artículo de EfficientFormerV2: https://arxiv.org/abs/2212.08059
- Artículo de BDD100K: https://arxiv.org/abs/1805.04687
