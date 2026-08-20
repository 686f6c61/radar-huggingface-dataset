# Pranilllllll/segformer-b0-kaggle-ktm-dataset-random-fold0

## Resumen

El modelo `Pranilllllll/segformer-b0-kaggle-ktm-dataset-random-fold0` es un fine-tuning del segmentador semántico SegFormer-B0, desarrollado por el usuario Pranilllllll, para la clasificación de uso de suelo en el valle de Katmandú (Nepal). Se enmarca dentro del proyecto GeoNUSAF, que aborda la segmentación semántica de imágenes de teledetección con seis clases: residencial, carretera, río, bosque, suelo no utilizado y agrícola. El modelo parte del checkpoint `nvidia/segformer-b0-finetuned-ade-512-512` y se entrena sobre un dataset propio con split aleatorio, fold 0 de 3, con una resolución de entrada de 512x512 píxeles y un GSD efectivo de 0.586 m/px.

La relevancia de este modelo radica en su aplicación práctica para la planificación urbana y el monitoreo ambiental en regiones con datos de teledetección de alta resolución. Al ser un modelo de arquitectura ligera (SegFormer-B0), es adecuado para despliegue en entornos con recursos computacionales limitados, aunque su rendimiento en clases minoritarias como río y carretera es bajo, lo que limita su uso en aplicaciones que requieran alta precisión en esas categorías. El checkpoint incluye pesos EMA, configuración de entrenamiento y métricas de validación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SegformerForSemanticSegmentation (basado en nvidia/segformer-b0-finetuned-ade-512-512) |
| Parametros totales | no disponible (SegFormer-B0, tamaño base del modelo) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512x512 píxeles (entrada de imagen) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (segmentación de imágenes) |
| Licencia | no disponible |
| Formato de pesos | no disponible (repo de 0.3 GB, probablemente PyTorch/transformers) |

## Arquitectura y entrenamiento

El modelo utiliza la arquitectura SegFormer, un transformer jerárquico para segmentación semántica que combina un encoder MiT (Mix Transformer) con un decoder ligero de MLP. En concreto, se emplea la variante B0, la más pequeña de la familia, pre-entrenada en ADE20K. El fine-tuning se realiza sobre el dataset GeoNUSAF del valle de Katmandú, con 6 clases y `ignore_index=255`. El entrenamiento usa un split aleatorio (fold 0 de 3) con semilla 42, resolución de 512x512 y normalización ImageNet. Se aplica una tasa de aprendizaje diferenciada (6e-5 para la cabeza, 6e-6 para el encoder), weight decay 0.01, drop path 0.1, suavizado de etiquetas 0.05 y EMA activado. El mejor epoch fue el 13, con métricas de validación de mIoU 0.4223, mF1 0.5546, OA 0.7390 y kappa 0.6093.

No se especifican detalles sobre el número de tokens de entrenamiento ni la composición exacta del dataset, pero al ser un fine-tuning de un modelo pre-entrenado, se asume un volumen de datos moderado propio de un dataset de teledetección regional. No se menciona el uso de RLHF ni DPO, dado que es una tarea de segmentación supervisada.

## Capacidades

- Segmentación semántica de imágenes de teledetección con 6 clases: residencial, carretera, río, bosque, suelo no utilizado y agrícola.
- Clasificación píxel a píxel con salida de máscaras de segmentación.
- Soporte de entrada de imágenes de 512x512 píxeles con normalización ImageNet.
- Capacidad de inferencia en imágenes de alta resolución (GSD efectivo 0.586 m/px).
- No incluye capacidades de generación de texto, tool calling, agentes ni razonamiento multi-paso, al ser un modelo puramente visual.
- No soporta visión general más allá de la segmentación semántica (no clasificación de imágenes ni detección de objetos).

## Casos de uso

- Planificación urbana: el modelo puede segmentar áreas residenciales y de suelo no utilizado para ayudar a los ayuntamientos a identificar zonas de expansión urbana o terrenos baldíos. Su resolución de 0.586 m/px permite distinguir manzanas y parcelas.
- Monitoreo de recursos hídricos: la clase "río" permite cartografiar cauces y superficies de agua, aunque su bajo IoU (0.069) limita su fiabilidad en esta tarea; se recomienda como apoyo a métodos manuales.
- Gestión forestal: la clase "bosque" con IoU 0.5911 es útil para estimar cobertura arbórea y detectar deforestación en el valle de Katmandú.
- Agricultura de precisión: la clase "agrícola" (IoU 0.5379) puede emplearse para delimitar parcelas de cultivo y monitorizar cambios estacionales.
- Infraestructura vial: la clase "carretera" (IoU 0.2252) puede servir para actualizar mapas de red vial, aunque con errores considerables que requieren revisión humana.
- Evaluación de riesgos ambientales: combinando las clases de río y suelo no utilizado, se pueden identificar zonas propensas a inundaciones o deslizamientos, siempre que se valide la precisión por clase.

## Benchmarks y rendimiento

Los resultados de validación del modelo (fold 0, split aleatorio) son los siguientes:

| Metrica | Valor |
|---|---|
| mIoU | 0.4223 |
| mF1 | 0.5546 |
| Overall Accuracy (OA) | 0.7390 |
| Kappa | 0.6093 |

Rendimiento por clase (validación):

| Clase | IoU | F1 |
|---|---|---|
| Residential | 0.7474 | 0.8555 |
| Road | 0.2252 | 0.3676 |
| River | 0.0690 | 0.1290 |
| Forest | 0.5911 | 0.7430 |
| UnusedLand | 0.3635 | 0.5332 |
| Agricultural | 0.5379 | 0.6995 |

No se han publicado comparaciones con otros modelos en la información disponible. Los resultados muestran un rendimiento sólido en clases dominantes (residencial, bosque) pero muy pobre en río y carretera, probablemente por desequilibrio de clases o dificultad intrínseca de la tarea.

## Requisitos de hardware

- Al ser un modelo SegFormer-B0, es ligero (del orden de 3-4 millones de parámetros, aunque no se confirma el número exacto). Puede ejecutarse en GPUs de consumo como NVIDIA GTX 1060 (6 GB) o superiores.
- VRAM estimada para inferencia: no disponible en la información proporcionada, pero por el tamaño del repo (0.3 GB) y la arquitectura B0, se estima que cabe en GPUs con 4-6 GB de VRAM para una imagen de 512x512.
- GPU recomendadas: cualquier GPU moderna con soporte CUDA, incluyendo RTX 3060, RTX 4090, o incluso inferencia en CPU para lotes pequeños.
- Opciones de despliegue: al ser un modelo de transformers, puede servirse con Hugging Face Inference Endpoints, o mediante librerías como PyTorch, ONNX Runtime o TensorRT. No se menciona compatibilidad con vLLM, llama.cpp u Ollama, que son específicas para modelos de lenguaje.
- Latencia y throughput: no disponibles. Se espera una inferencia rápida (del orden de decenas de milisegundos por imagen en GPU moderna) dado el tamaño reducido del modelo.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos con otros modelos de segmentación semántica en el mismo dataset. Como referencia cualitativa, el modelo base `nvidia/segformer-b0-finetuned-ade-512-512` está pre-entrenado en ADE20K y no está especializado en teledetección, por lo que este fine-tuning debería superarlo en el dominio GeoNUSAF. Alternativas como U-Net o DeepLabV3 podrían ofrecer resultados diferentes, pero no hay datos disponibles para comparar. Se indica "no disponible" para una comparativa cuantitativa.

## Limitaciones y advertencias

- Rendimiento muy bajo en las clases "River" (IoU 0.069) y "Road" (IoU 0.2252), lo que hace que el modelo no sea fiable para aplicaciones que dependan de la detección precisa de ríos o carreteras.
- El modelo está entrenado exclusivamente con datos del valle de Katmandú; su generalización a otras regiones geográficas o condiciones de imagen (diferentes sensores, estaciones, ángulos) no está garantizada.
- Posible desequilibrio de clases en el dataset, que favorece a las clases dominantes (residencial, bosque) y perjudica a las minoritarias.
- No se especifica la licencia del modelo ni de los pesos, lo que impide conocer las restricciones de uso comercial.
- No se proporcionan detalles sobre el dataset de entrenamiento (número de imágenes, distribución de clases, fuentes), lo que dificulta evaluar posibles sesgos.
- El checkpoint incluye pesos EMA, pero no se indica si el modelo final para inferencia debe usar esos pesos o los pesos normales; se recomienda revisar la configuración del run.
- Al ser un modelo de segmentación, no es adecuado para tareas de generación de texto, razonamiento o agentes.

## Enlaces

- HuggingFace: https://huggingface.co/Pranilllllll/segformer-b0-kaggle-ktm-dataset-random-fold0
- Modelo base: https://huggingface.co/nvidia/segformer-b0-finetuned-ade-512-512
