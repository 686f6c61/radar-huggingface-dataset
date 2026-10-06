# dronefreak/bdd100k-weather-efficientvit_l1

## Resumen

El modelo `dronefreak/bdd100k-weather-efficientvit_l1` es un clasificador de imágenes especializado en la detección de condiciones meteorológicas en escenas de conducción. Lo desarrolla el usuario de Hugging Face dronefreak como parte del proyecto BDD100K-Toolkit, un conjunto de herramientas limpias de dependencias para preparar el dataset BDD100K, entrenar modelos sobre él y evaluarlos con las mismas métricas y particiones. El modelo parte del backbone EfficientViT-L1 preentrenado en ImageNet-1k (`timm/efficientvit_l1.r224_in1k`) y se afina para una tarea de clasificación de 7 clases: clear, partly cloudy, overcast, rainy, snowy, foggy y unknown, derivadas del campo `attributes.weather` de BDD100K.

La relevancia de este modelo radica en su aplicación directa al sector de la conducción autónoma y los sistemas ADAS, donde conocer las condiciones meteorológicas de la escena es un paso previo útil para ajustar la percepción, la planificación o los umbrales de seguridad. Con 49,5 millones de parámetros, se sitúa en un rango de tamaño moderado que permite despliegue en GPU de consumo, y su licencia Apache-2.0 facilita la integración comercial sin las restricciones habituales de otros pesos.

El checkpoint declara una exactitud Top-1 del 83,13 % y un F1 macro del 65,70 % sobre la partición de test de 10.000 imágenes, aunque con un rendimiento muy desigual por clase: excelente en clear (F1 91,77 %) y nulo en foggy (F1 0 %, con solo 13 imágenes de test). Estos datos los aporta el propio autor y no han sido verificados de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EfficientViT-L1 (backbone transformer eficiente con atención lineal), afinado como clasificador de imágenes |
| Parametros totales | 49,5 millones |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada de imagen 224x224 según base r224) |
| Tipos de cuantizacion | no disponible; el checkpoint se distribuye en precisión completa en formato PyTorch |
| Idiomas soportados | no aplica (clasificación de imágenes) |
| Licencia | apache-2.0 |
| Formato de pesos | PyTorch `.pt` (diccionario con `state_dict`, `model_name`, `class_names`, `imgsz`, `mean`, `std`); no se ofrecen safetensors ni GGUF |

## Arquitectura y entrenamiento

La arquitectura subyacente es EfficientViT-L1, un transformer de visión diseñado para reducir el coste computacional del mecanismo de atención manteniendo una capacidad representativa alta. El modelo base fue preentrenado en ImageNet-1k con resolución 224x224 y posteriormente afinado como clasificador de 7 clases sobre el dataset BDD100K Weather Classification. El checkpoint resultante se empaqueta con toda la información necesaria para reconstruir el modelo mediante `timm.create_model`, incluyendo el nombre del modelo base, los pesos, los nombres de las clases, el tamaño de imagen y las estadísticas de normalización.

En cuanto a los datos de entrenamiento, el fine-tuning se realizó sobre la tarea meteorológica derivada de BDD100K, una tarea no oficial que sigue el dataset de Kaggle del mismo nombre. La model card no detalla el número de tokens ni la composición exacta del conjunto de entrenamiento más allá de las clases y la partición de test de 10.000 imágenes. Tampoco se documenta el uso de RLHF, DPO ni otras técnicas de alineación, algo esperable en un clasificador de visión. No se mencionan innovaciones técnicas adicionales como decodificación especulativa o mecanismos híbridos más allá del propio diseño eficiente del backbone EfficientViT.

## Capacidades

- Clasificación de escenas de conducción en 7 categorías meteorológicas: clear, partly cloudy, overcast, rainy, snowy, foggy y unknown.
- Inferencia sobre imágenes RGB individuales redimensionadas a la resolución esperada por el backbone (224x224 en el modelo base).
- Integración directa con la librería `timm` y PyTorch, lo que permite cargar el modelo con pocas líneas de código.
- Extracción de probabilidades por clase mediante softmax, útil para umbrales de confianza y filtrado posterior.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso; es un clasificador puro.
- No tiene capacidades multilingües, de generación de texto, código, matemáticas, visión generativa, audio ni modo de pensamiento.
- La clase foggy no se detecta correctamente en la práctica (F1 0 % en test), por lo que debe considerarse no soportada.

## Casos de uso

- Módulo de percepción meteorológica en vehículos autónomos: el clasificador puede etiquetar cada fotograma de una cámara frontal con la condición meteorológica, de modo que el sistema de planificación active políticas conservadoras (mayor distancia de seguridad, menor velocidad) cuando detecte lluvia o nieve.
- Preprocesado de datasets de conducción: dado que clasifica imágenes BDD100K con la misma taxonomía, puede emplearse para filtrar, balancear o etiquetar automáticamente nuevos conjuntos de datos de tráfico antes de entrenar otros modelos.
- Monitorización de flotas y vehículos conectados: integrado en el pipeline de telemetría, permite registrar las condiciones meteorológicas encontradas por cada vehículo para análisis de rutas, mantenimiento predictivo y planificación logística.
- Sistemas ADAS de activación condicional: la detección de lluvia, nieve o cielo cubierto puede usarse para activar o ajustar funciones como el asistente de mantenimiento de carril o el control de crucero adaptativo.
- Validación de robustez de otros modelos de visión: sirve como referencia para medir cuánto degrada la meteorología el rendimiento de detectores de objetos o segmentadores en escenas de carretera.
- Investigación en visión por computador eficiente: al estar construido sobre EfficientViT-L1 y compararse con otros modelos en el Model Zoo, es útil como punto de partida para estudiar el equilibrio entre precisión y coste computacional en tareas de clasificación de escenas.
- Etiquetado asistido para anotación humana: las predicciones de alta confianza (por ejemplo, Top-5 del 99,86 %) pueden preetiquetar grandes volúmenes de imágenes y reducir el trabajo manual de anotadores.

## Benchmarks y rendimiento

Datos declarados por el autor sobre la partición `test` (10.000 imágenes). No verificados de forma independiente.

| Metrica | Valor |
|---|---|
| Exactitud Top-1 | 83,13 % |
| Exactitud Top-5 | 99,86 % |
| F1 macro | 65,70 % |
| Exactitud balanceada | 65,11 % |
| Precision macro | 66,46 % |
| Recall macro | 65,11 % |

Resultados por clase en el mismo test:

| Clase | Precision | Recall | F1 | Imagenes de test |
|---|---|---|---|---|
| clear | 91,25 % | 92,29 % | 91,77 % | 5346 |
| foggy | 0,00 % | 0,00 % | 0,00 % | 13 |
| overcast | 65,82 % | 71,35 % | 68,47 % | 1239 |
| partly cloudy | 68,48 % | 63,01 % | 65,63 % | 738 |
| rainy | 82,66 % | 71,68 % | 76,78 % | 738 |
| snowy | 82,28 % | 82,70 % | 82,49 % | 769 |
| unknown | 74,70 % | 74,76 % | 74,73 % | 1157 |

Comparativa del Model Zoo del propio autor, evaluada sobre la misma partición y ordenada por Top-1:

| Modelo | Top-1 | F1 macro | Exactitud balanceada | Precision macro |
|---|---|---|---|---|
| TinyViT-21M | 83,90 % | 68,65 % | 67,15 % | 74,81 % |
| EfficientViT-B3 | 83,51 % | 68,17 % | 66,34 % | 81,75 % |
| EfficientViT-B2 | 83,46 % | 66,07 % | 65,04 % | 67,54 % |
| EfficientFormerV2-L | 83,27 % | 65,93 % | 65,03 % | 67,12 % |
| RepViT-M1.5 | 83,19 % | 67,78 % | 65,71 % | 81,56 % |
| EfficientViT-L1 (este modelo) | 83,13 % | 65,70 % | 65,11 % | 66,46 % |
| RepViT-M2.3 | 83,02 % | 65,46 % | 64,33 % | 67,02 % |
| ConvNeXt-Atto | 83,00 % | 67,44 % | 65,25 % | 81,38 % |
| EfficientFormerV2-S2 | 82,90 % | 65,50 % | 64,68 % | 66,98 % |
| EfficientViT-B0 | 82,79 % | 65,10 % | no disponible | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 49,5 millones de parámetros. En precisión completa (fp32) ocupa aproximadamente 0,2 GB de pesos; con overhead de activaciones y batches razonables, cabe holgadamente en menos de 1 GB de VRAM.
- GPU recomendadas: cualquier GPU moderna sirve, desde una NVIDIA GTX 1650 o superior hasta A100, H100, RTX 4090 o L4. Para producción a gran escala se recomienda una GPU con Tensor Cores para aprovechar fp16/bf16.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo actual (RTX 3060, 4060, 4090, etc.) e incluso en iGPU o CPU para inferencia por lotes pequeños.
- Opciones de despliegue: PyTorch + timm de forma nativa; exportable a TorchScript, ONNX Runtime o TensorRT para optimización. No se distribuye en GGUF, por lo que llama.cpp u Ollama no son aplicables directamente.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Al ser un EfficientViT, se espera una latencia baja (del orden de milisegundos por imagen en GPU moderna), pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Top-1 (test BDD100K Weather) | F1 macro | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EfficientViT-L1 (este modelo) | 49,5 M | 83,13 % | 65,70 % | Apache-2.0 | Hugging Face, timm |
| TinyViT-21M | 21 M aprox. | 83,90 % | 68,65 % | no disponible | Model Zoo del toolkit |
| EfficientViT-B3 | no disponible | 83,51 % | 68,17 % | no disponible | Model Zoo del toolkit |
| RepViT-M1.5 | no disponible | 83,19 % | 67,78 % | no disponible | Model Zoo del toolkit |
| ConvNeXt-Atto | no disponible | 83,00 % | 67,44 % | no disponible | Model Zoo del toolkit |

La comparación con alternativas fuera de este toolkit no está disponible en la información proporcionada, ya que las métricas del Model Zoo son específicas de la tarea derivada de BDD100K y no son directamente comparables con resultados sobre otros benchmarks estándar.

## Limitaciones y advertencias

- La clase foggy no se clasifica correctamente: F1 de 0 % con solo 13 imágenes de test. Debe considerarse no soportada y no usarse para detección de niebla.
- Existe un desequilibrio de clases acusado en el test (5346 imágenes clear frente a 13 foggy), lo que afecta a las métricas macro y a la utilidad en condiciones poco representadas.
- Riesgo de sesgo geográfico y de dominio: BDD100K se recopiló en su mayoría en Estados Unidos, por lo que el rendimiento puede degradarse en carreteras, climas o iluminaciones distintas.
- Riesgo de confusión entre clases visualmente similares, como overcast frente a partly cloudy (F1 68,47 % y 65,63 % respectivamente) o rainy frente a unknown.
- La tarea de clasificación meteorológica es no oficial y se deriva del campo `attributes.weather`; la calidad de las etiquetas depende del dataset original y de la definición de la clase unknown.
- Los resultados de los benchmarks los declara el autor y no han sido verificados de forma independiente.
- La licencia Apache-2.0 permite uso comercial sin restricciones adicionales, pero conviene revisar las condiciones del dataset BDD100K subyacente para usos derivados.
- No se ofrecen versiones cuantizadas ni formatos alternativos, lo que limita el despliegue en entornos muy restringidos sin conversión previa.
- El modelo es exclusivamente de clasificación de imágenes; no debe utilizarse para toma de decisiones críticas de seguridad sin supervisión humana ni sistemas redundantes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dronefreak/bdd100k-weather-efficientvit_l1
- Dataset de la tarea: https://huggingface.co/datasets/dronefreak/BDD100K-Weather-Classification
- Repositorio BDD100K-Toolkit: https://github.com/dronefreak/bdd100k-toolkit
- Modelo base en timm: https://huggingface.co/timm/efficientvit_l1.r224_in1k
- Paper EfficientViT (arXiv:2205.14756): https://arxiv.org/abs/2205.14756
- Paper BDD100K (arXiv:1805.04687): https://arxiv.org/abs/1805.04687
- Demo (vídeo en la model card): https://huggingface.co/dronefreak/bdd100k-weather-efficientvit_l1/resolve/main/assets/demo_banner.mp4
