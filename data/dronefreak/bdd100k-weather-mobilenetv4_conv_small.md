# dronefreak/bdd100k-weather-mobilenetv4_conv_small

## Resumen

El modelo `dronefreak/bdd100k-weather-mobilenetv4_conv_small` es un clasificador de imágenes especializado en reconocer la condición meteorológica de escenas de conducción. Se trata de un ajuste fino de la arquitectura MobileNetV4-Conv-Small (aproximadamente 2,5 millones de parámetros) sobre el conjunto de datos BDD100K Weather Classification, una tarea derivada del campo `attributes.weather` de BDD100K con siete clases: clear, partly cloudy, overcast, rainy, snowy, foggy y unknown. Lo publica el usuario dronefreak como parte de BDD100K-Toolkit, una herramienta sin dependencias externas pensada para preparar BDD100K, entrenar modelos sobre él y evaluarlos con las mismas métricas y particiones.

La relevancia del modelo es doble. Por un lado, ofrece una línea base reproducible y muy ligera para una tarea auxiliar habitual en pipelines de conducción autónoma: saber si la escena es soleada, lluviosa, nevada o con niebla permite conmutar el comportamiento de módulos de detección, segmentación o planificación. Por otro, al ser un modelo de 2,5 M de parámetros con licencia Apache-2.0, es desplegable en hardware de borde, CPU o GPU de gama baja sin sacrificar capacidad de clasificación.

No es un modelo de lenguaje: no genera texto, no tiene ventana de contexto, no soporta tool calling ni razonamiento multi-paso. Su única tarea es la clasificación de una imagen completa en una de las siete clases meteorológicas. Cualquier uso generativo está fuera de su alcance y así debe interpretarse la ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MobileNetV4-Conv-Small (red neuronal convolucional, familia MobileNetV4 con bloques Universal Inverted Bottleneck, variante "Conv") |
| Parámetros totales | 2,5 M (según la model card) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de clasificación de imágenes; no procesa secuencias de texto) |
| Tipos de cuantización | no disponible (el checkpoint se distribuye en precisión de entrenamiento; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica (modelo de visión); las etiquetas de clase están en inglés |
| Licencia | Apache-2.0 |
| Formato de pesos | Checkpoint de PyTorch `best.pt` (contiene `state_dict`, `model_name`, `class_names`, `imgsz`, `mean` y `std`), cargable con timm; no se ofrecen safetensors ni GGUF |

Otros datos de interés: la entrada es una imagen RGB redimensionada al tamaño `imgsz` almacenado en el propio checkpoint y normalizada con la media y desviación típicas también guardadas en él. El modelo se evalúa sobre la partición `test` de BDD100K Weather Classification, compuesta por 10 000 imágenes (que, según el autor, corresponde al conjunto de validación oficial de BDD100K).

## Arquitectura y entrenamiento

La arquitectura es una CNN pura de la familia MobileNetV4, en su variante `Conv-Small`. MobileNetV4 introduce bloques Universal Inverted Bottleneck (UIB) que unifican variantes de convolución invertida y profundidad ajustable, con el objetivo de ofrecer una familia de modelos eficientes para el ecosistema móvil (paper arXiv:2404.10518). La variante Small ronda los 2,5 millones de parámetros, lo que la sitúa en el rango de modelos ultraligeros aptos para inferencia en tiempo real en CPU y en aceleradores de borde.

El ajuste fino se realizó sobre el conjunto BDD100K Weather Classification, una tarea no oficial derivada del campo `attributes.weather` de BDD100K y que sigue la nomenclatura del dataset homónimo de Kaggle. La configuración de entrenamiento documentada en la model card es la siguiente: máximo de 50 épocas, 19 épocas realmente completadas, mejor época en la posición 9, batch de 128 imágenes y parada temprana con paciencia 10. El checkpoint `best.pt` se selecciona maximizando la macro F1 sobre la partición de validación. El tamaño de imagen de entrada aparece truncado en la información disponible, por lo que no puede confirmarse; en tiempo de inferencia se recupera del propio checkpoint. No se documentan en la información disponible el esquema de aumento de datos, el optimizador, la tasa de aprendizaje ni si se partió de pesos preentrenados en ImageNet, aunque el uso de timm como librería y la etiqueta "Base Model: MobileNetV4-Conv-Small" apuntan a un ajuste fino sobre los pesos públicos de esa arquitectura.

## Capacidades

- Clasificación de imágenes en siete clases meteorológicas: clear, partly cloudy, overcast, rainy, snowy, foggy y unknown.
- Salida probabilística por clase (softmax sobre siete logits) y predicción top-1 y top-5, con 99,79 % de top-5 en la partición de prueba.
- Entrada de imagen RGB de tamaño fijo, con normalización definida por los valores almacenados en el checkpoint (`mean`, `std`, `imgsz`).
- Integración directa con timm y PyTorch: creación del modelo con `timm.create_model(ckpt["model_name"], num_classes=7)` y carga del `state_dict`.
- Ejecución en CPU y GPU; el reducido número de parámetros permite inferencia por lotes en hardware modesto.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, generación de texto, código, matemáticas, visión multimodal ni audio.
- No soporta prompt en lenguaje natural: la tarea es fija y no configurable en tiempo de inferencia.
- Multilingüismo: no aplica; las etiquetas están en inglés y no hay procesamiento de texto.

## Casos de uso

- Etiquetado automático de flotas y dashcams: el modelo puede procesar grandes volúmenes de fotogramas de cámaras de vehículos para asignar una condición meteorológica a cada uno, alimentando analítica posterior sobre siniestralidad, desgaste o planificación de rutas. Su tamaño de 2,5 M de parámetros permite ejecutarlo en el propio vehículo o en un servidor modesto.
- Conmutación de módulos en pipelines de conducción autónoma: una vez detectada la condición meteorológica, el sistema puede activar o desactivar submodelos de detección de objetos, ajustar umbrales de confianza o cambiar parámetros de planificación, ya que los detectores entrenados en condiciones soleadas degradan su rendimiento con lluvia, nieve o niebla.
- Curación y filtrado de datasets de conducción: al clasificar automáticamente escenas por clima, un equipo puede construir subconjuntos balanceados por condición meteorológica para entrenar o evaluar otros modelos, o identificar imágenes etiquetadas de forma dudosa (por ejemplo, las que caen en la clase unknown).
- Monitorización de condiciones de carretera para logística: cámaras fijas o embarcadas en flotas de reparto pueden reportar en tiempo casi real si la vía está nevada o con niebla, lo que permite a un operador de flota ajustar rutas, tiempos de entrega o protocolos de seguridad.
- Análisis forense y reconstrucción de incidentes: clasificar el clima de una secuencia de vídeo aporta contexto objetivo para investigaciones de accidentes o reclamaciones de seguros, con un modelo pequeño que puede ejecutarse sobre el material grabado sin infraestructura especial.
- Despliegue en dispositivos de borde: con 2,5 M de parámetros, el modelo cabe en Jetson, Raspberry Pi, teléfonos o módulos embebidos, lo que habilita aplicaciones de clasificación meteorológica local sin enviar vídeo a la nube (útil por privacidad y por ancho de banda).
- Línea base reproducible en investigación: al venir acompañado de BDD100K-Toolkit, sirve como referencia para comparar nuevas arquitecturas bajo las mismas particiones y métricas, tal y como demuestra la tabla comparativa del repositorio.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre la partición `test` (10 000 imágenes) de BDD100K Weather Classification. No están verificados de forma independiente (`verified: false` en el model-index).

| Métrica | Valor |
|---|---|
| Top-1 accuracy | 82,16 % |
| Top-5 accuracy | 99,79 % |
| Macro F1 | 66,51 % |
| Balanced accuracy | 64,37 % |
| Macro precision | 80,44 % |
| Macro recall | 64,37 % |

Desglose por clase:

| Clase | Precision | Recall | F1 | Imágenes de test |
|---|---|---|---|---|
| clear | 89,98 % | 92,37 % | 91,16 % | 5346 |
| foggy | 100,00 % | 7,69 % | 14,29 % | 13 |
| overcast | 66,02 % | 68,52 % | 67,25 % | 1239 |
| partly cloudy | 66,95 % | 64,50 % | 65,70 % | 738 |
| rainy | 86,26 % | 67,21 % | 75,55 % | 738 |
| snowy | 82,99 % | 72,95 % | 77,65 % | 769 |
| unknown | 70,86 % | 77,36 % | 73,97 % | 1157 |

Comparativa dentro del model zoo de BDD100K-Toolkit, todos evaluados sobre la misma partición `test`:

| Modelo | Top-1 | Macro F1 | Balanced accuracy | Macro precision |
|---|---|---|---|---|
| convnext_atto | 83,00 % | 67,44 % | 65,25 % | 81,38 % |
| efficientvit_b0 | 82,79 % | 65,10 % | 63,62 % | 67,11 % |
| resnet18 | 82,19 % | 64,30 % | 62,97 % | 66,08 % |
| **mobilenetv4_conv_small** | **82,16 %** | **66,51 %** | **64,37 %** | **80,44 %** |
| yolo26n-cls | 82,04 % | 64,09 % | 62,46 % | 66,57 % |
| yolo11n-cls | 81,32 % | 62,91 % | 61,19 % | 65,68 % |
| yolov8n-cls | 81,22 % | 63,07 % | 61,42 % | 65,52 % |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en cualquier precisión razonable. Con 2,5 M de parámetros, los pesos ocupan aproximadamente 10 MB en FP32 y unos 5 MB en FP16, a lo que se suma la activación de una única imagen de entrada redimensionada, de magnitud similar.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente. El modelo no necesita A100, H100 ni tarjetas de gama alta; una GTX 1650, una T4 o incluso una GPU integrada moderna bastan para inferencia por lotes.
- Cabe con holgura en GPU de consumo: RTX 3060, RTX 4060, RTX 4090 o cualquier modelo anterior con soporte CUDA.
- También funciona íntegramente en CPU (la propia model card muestra un ejemplo de carga con `map_location="cpu"`), y es adecuado para dispositivos de borde tipo Jetson o Raspberry Pi, sujeto a la conversión y optimización oportunas.
- Opciones de despliegue: la ruta documentada es PyTorch más timm, cargando `best.pt` con `torch.load` y `timm.create_model`. No se documentan en la información disponible integraciones con vLLM (no aplica, es un modelo de visión), llama.cpp, Ollama ni TGI. Para producción en borde sería habitual exportar a ONNX o TFLite, pero esa conversión no está descrita en la model card.
- Latencia y throughput: no disponible. No se publican mediciones de latencia ni de imágenes por segundo en la información proporcionada.

## Comparativa con modelos similares

Los comparables directos son los demás clasificadores del model zoo de BDD100K-Toolkit, todos entrenados y evaluados bajo las mismas particiones. Los datos de parámetros, contexto, licencia y disponibilidad de los alternativas no se detallan en la información proporcionada salvo para el modelo principal.

| Modelo | Top-1 | Macro F1 | Balanced accuracy | Macro precision | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| MobileNetV4-Conv-Small (este modelo) | 82,16 % | 66,51 % | 64,37 % | 80,44 % | Apache-2.0 | HuggingFace, pesos `best.pt` |
| ConvNeXt-Atto | 83,00 % | 67,44 % | 65,25 % | 81,38 % | no disponible | no disponible |
| EfficientViT-B0 | 82,79 % | 65,10 % | 63,62 % | 67,11 % | no disponible | no disponible |
| ResNet-18 | 82,19 % | 64,30 % | 62,97 % | 66,08 % | no disponible | no disponible |
| YOLO26n-cls | 82,04 % | 64,09 % | 62,46 % | 66,57 % | no disponible | no disponible |
| YOLO11n-cls | 81,32 % | 62,91 % | 61,19 % | 65,68 % | no disponible | no disponible |
| YOLOv8n-cls | 81,22 % | 63,07 % | 61,42 % | 65,52 % | no disponible | no disponible |

Lectura de la comparativa: ConvNeXt-Atto obtiene la mejor top-1 y la mejor macro F1 con un margen estrecho (0,84 puntos de top-1 y 0,93 de macro F1 sobre este modelo). MobileNetV4-Conv-Small destaca en macro precision (80,44 %), la segunda mejor tras ConvNeXt-Atto, lo que indica un comportamiento conservador a la hora de asignar clases poco frecuentes, a costa de un recall más bajo. Frente a ResNet-18, que tiene un número de parámetros muy superior, la diferencia en top-1 es de solo 0,03 puntos porcentuales, lo que refuerza el argumento de eficiencia del modelo.

## Limitaciones y advertencias

- Desequilibrio de clases severo: la clase foggy cuenta con solo 13 imágenes en la partición de prueba y el modelo obtiene un recall del 7,69 % en ella (F1 de 14,29 %). La precisión del 100 % en esa clase es un artefacto del tamaño muestral y no debe interpretarse como capacidad real de detección de niebla.
- La top-1 accuracy (82,16 %) y la macro F1 (66,51 %) difieren en casi 16 puntos, señal de que el rendimiento en las clases mayoritarias (clear, con 5346 imágenes) enmascara un rendimiento mediocre en clases minoritarias como partly cloudy y overcast.
- La tarea es no oficial y derivada automáticamente del campo `attributes.weather` de BDD100K; la calidad de estas etiquetas depende del proceso de anotación original y puede contener ruido, especialmente en la clase unknown.
- La partición denominada `test` por el autor corresponde, según su propio comentario público, al conjunto de validación oficial de BDD100K; conviene tenerlo en cuenta al comparar con otros trabajos que usan particiones distintas.
- Los resultados del model-index tienen `verified: false`: son cifras declaradas por el autor y no han sido reproducidas por un tercero independiente.
- Riesgo de degradación en condiciones distintas a las del dataset: escenas nocturnas, climas extremos, cámaras con ópticas o montajes distintos o dominios geográficos diferentes a los de BDD100K pueden reducir la precisión de forma apreciable. El modelo no incluye ninguna indicación de calibración fuera de dominio.
- Sesgos potenciales: BDD100K se grabó en entornos urbanos y de autopista de Estados Unidos, por lo que la representación de otros países, tipos de vía o condiciones meteorológicas locales es limitada.
- No es un modelo generativo: no admite instrucciones en lenguaje natural, no puede explicar sus predicciones ni justificar la clase asignada. Devuelve únicamente probabilidades por clase.
- Licencia Apache-2.0: permite uso comercial y modificación con atribución, pero no exime de cumplir las condiciones de uso del conjunto de datos BDD100K, cuya licencia es independiente y debe verificarse para aplicaciones comerciales.
- No se documentan en la información disponible el esquema de aumentación, el optimizador, la tasa de aprendizaje ni el tamaño de imagen de entrenamiento (el dato aparece truncado en la model card), lo que dificulta la reproducción exacta del ajuste fino.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamaño de 0,0 GB reportado, lo que sugiere un modelo recién publicado y sin validación por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dronefreak/bdd100k-weather-mobilenetv4_conv_small
- Dataset BDD100K Weather Classification: https://huggingface.co/datasets/dronefreak/BDD100K-Weather-Classification
- Repositorio BDD100K-Toolkit: https://github.com/dronefreak/bdd100k-toolkit
- Paper de MobileNetV4: https://arxiv.org/abs/2404.10518
- Paper de BDD100K: https://arxiv.org/abs/1805.04687
- Sitio oficial del dataset BDD100K: http://bdd-data.berkeley.edu/
- Repositorio oficial del toolkit BDD100K: https://github.com/bdd100k/bdd100k
- Publicación del autor sobre el model zoo de BDD100K: https://huggingface.co/posts/dronefreak/988753800362571
- Colección del autor sobre detección de objetos en BDD100K: https://huggingface.co/collections/dronefreak/bdd100k-object-detection-model-zoo-6aafc46f2f6c5e4d8676d894
- Proyecto de la Universidad Carnegie Mellon sobre detección con mal tiempo: https://mscvprojects.ri.cmu.edu/2024team9/detection-experiment/
