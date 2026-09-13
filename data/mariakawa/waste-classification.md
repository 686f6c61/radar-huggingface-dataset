# mariakawa/waste-classification

## Resumen

`mariakawa/waste-classification` es un proyecto de visión por computador publicado como repositorio en HuggingFace cuyo objetivo es clasificar residuos domésticos a partir de una fotografía en seis categorías de material: cartón, vidrio, metal, papel, plástico y basura residual. No es un modelo de lenguaje ni un modelo generativo: es una comparativa de clasificadores de imagen entrenados sobre el conjunto de datos TrashNet redimensionado, con un total de 2.527 imágenes. El autor, mariakawa, plantea tres aproximaciones sucesivas: una CNN desde cero como control, MobileNetV2 con aprendizaje por transferencia y, finalmente, YOLOv8n-cls como sistema seleccionado.

El sistema elegido es YOLOv8n-cls, que alcanza un 92,7 % de exactitud top-1 en validación con 1.445.974 parámetros y 3,4 GFLOPs. La alternativa Keras, MobileNetV2 con unos 6,5 millones de parámetros, se queda en un 76,5 % de exactitud de validación, y la CNN desde cero no resulta utilizable por sobreajuste y por errores de diseño en la cabeza de clasificación y en la partición de datos. El proyecto incluye además un umbral de confianza para devolver "no estoy seguro" en lugar de forzar una etiqueta cuando la imagen es ambigua.

La relevancia práctica del repositorio es doble: por un lado, demuestra de forma reproducible que una arquitectura nano preentrenada supera claramente a una CNN ligera entrenada desde cero en un dataset pequeño y desbalanceado; por otro, sirve como punto de partida para prototipos de reciclaje asistido. Conviene señalar que el repositorio declara un tamaño de 0,0 GB y cero descargas, por lo que no hay evidencia de que los pesos entrenados estén efectivamente publicados junto al código.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOv8n-cls (clasificación, 56 capas) como sistema seleccionado; MobileNetV2 con cabeza propia y CNN desde cero como alternativas |
| Parametros totales | 1.445.974 (YOLOv8n-cls); ~6,5 M en MobileNetV2, de los cuales ~2,0 M entrenables tras descongelar capas |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de visión; entrada de imagen de 224 × 224 px en RGB) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica / no disponible (no procesa texto) |
| Licencia | MIT (declarada en el repositorio) |
| Formato de pesos | `.pt` (yolov8n-cls.pt, PyTorch/Ultralytics) y `.pkl` (waste_classifier_model.pkl, Keras). El repositorio declara 0,0 GB, por lo que la publicación de los pesos no está confirmada |
| Tarea | Clasificación de imagen multiclase (6 clases) |
| Clases | cardboard, glass, metal, paper, plastic, trash (orden alfabético) |
| Dataset de entrenamiento | TrashNet redimensionado, 2.527 imágenes en total |
| Entorno de demo | Gradio 4.44.1 (`app.py`), publicado como Space |

## Arquitectura y entrenamiento

El repositorio documenta tres arquitecturas. La primera es una CNN desde cero con tres bloques Conv2D (32, 64 y 128 filtros) seguidos de ReLU y MaxPool, un aplanado y tres capas densas de 256, 64 y 6 neuronas con Dropout de 0,5. Se usó como control y presenta dos defectos reconocidos por el propio autor: la cabeza emplea sigmoide con entropía cruzada binaria cuando el problema es una etiqueta única entre seis clases (lo correcto sería softmax con entropía cruzada categórica), y las rutas de entrenamiento y validación apuntan a la misma carpeta, de modo que la métrica de validación está contaminada. Además, el aplanado de mapas de 224 × 224 genera una capa densa enorme que sobreajusta con rapidez.

La segunda es MobileNetV2 preentrenada en ImageNet con `include_top=False`, seguida de GlobalAveragePooling2D, Dropout 0,3, una capa densa de 128 unidades con ReLU y una salida de 6 clases con softmax. La elección de transfer learning está justificada por el tamaño reducido del dataset, y el pooling global reduce drásticamente los parámetros de la cabeza respecto al aplanado. El entrenamiento usa `ImageDataGenerator` con partición 80/20 (2.024 imágenes de entrenamiento y 503 de validación) y aumentos de rotación hasta 30°, desplazamiento 0,2, cizalladura 0,15, zoom 0,2 y volteo horizontal. Un detalle importante de rigor: la métrica registrada de 76,5 % proviene de un generador de validación que también aplicaba aumentos, por lo que el dato es una estimación pesimista y no inflada.

La tercera y seleccionada es YOLOv8n-cls, la variante nano de clasificación de Ultralytics, con 56 capas, 1.445.974 parámetros y 3,4 GFLOPs (30 capas y 1,44 M parámetros en el grafo de evaluación fusionado). Se organizaron las imágenes en la estructura `yolo_trashnet/train/<clase>/*.jpg` y `yolo_trashnet/val/<clase>/*.jpg` con partición 80/20 (2.019 de entrenamiento y 508 de validación) y se dejaron los aumentos por defecto, que incluyen RandAugment, jitter HSV y borrado aleatorio. El autor atribuye la ventaja a que el backbone ya está preentrenado a escala ImageNet, a que el bucle de entrenamiento integrado (AdamW, warmup, schedule tipo coseno) es más sólido que el bucle manual de Keras y a que el modelo es más pequeño y rápido en inferencia. No se documenta ningún uso de RLHF, DPO ni decodificación especulativa, algo esperable en un clasificador de imágenes.

## Capacidades

- Clasificación de una fotografía de un único objeto de residuo en una de seis clases: cardboard, glass, metal, paper, plastic o trash.
- Devolución de una distribución de probabilidad por clase mediante softmax, no solo de la etiqueta ganadora.
- Tratamiento de puntuaciones débiles como "no estoy seguro" en lugar de forzar una etiqueta, según el objetivo declarado del proyecto.
- Procesamiento de imágenes RGB redimensionadas a 224 × 224 px, tanto en formato Keras con reescalado a [0, 1] como en el flujo interno de letterbox y normalización de YOLO.
- Inferencia rápida en CPU: aproximadamente 6 ms por imagen en el modelo YOLOv8n-cls durante la validación.
- Demo interactiva desplegable mediante Gradio 4.44.1 con un `app.py` como punto de entrada.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso: no es un modelo de lenguaje.
- No tiene capacidades multilingües ni de generación de texto.
- No realiza detección de objetos ni segmentación: devuelve una etiqueta por imagen, sin cajas delimitadoras ni localización de múltiples residuos en una escena.

## Casos de uso

- Asistente de reciclaje en aplicación móvil: el usuario fotografía un envase y la app le indica en qué contenedor depositarlo. El modelo es adecuado por su tamaño de 1,4 M de parámetros, que permite ejecución en dispositivo, y por la salida con confianza, que sirve para pedir una segunda foto cuando el sistema no está seguro.
- Clasificación previa en cadenas de triaje con imagen pre-recortada: en una cinta transportadora con un sistema de visión que aísle cada objeto, YOLOv8n-cls puede etiquetar el material dominante. Es necesario remarcar que el modelo no detecta objetos, por lo que requiere un paso previo de recorte o detección externo.
- Etiquetado asistido de datasets de residuos: usar el clasificador para pre-etiquetar lotes de imágenes nuevas y reservar la revisión humana para los casos de baja confianza, reduciendo el coste de anotación en proyectos de ampliación del dataset.
- Contenedores inteligentes con cámara integrada: un punto de recogida puede comprobar que el residuo depositado corresponde al flujo esperado y avisar por pantalla en caso de error, ejecutando el modelo en hardware embebido tipo Raspberry Pi o Jetson gracias a sus 3,4 GFLOPs.
- Educación ambiental y ludificación: aplicaciones escolares o talleres donde los participantes fotografían residuos y comprueban si su elección de contenedor es correcta, con el umbral de "no estoy seguro" evitando mensajes confusos ante imágenes ambiguas.
- Control de calidad en flujos monomaterial: plantas que separan papel y cartón pueden verificar que el material procesado no contiene plástico ni vidrio, comparando la distribución de probabilidad frente a un umbral configurable.
- Auditorías de composición de residuos: análisis de muestras fotografiadas en campañas de caracterización, agregando las predicciones por clase para estimar la proporción de cada material en la muestra, siempre con revisión humana dado el desbalance de clases del dataset original.
- Demo web de bajo coste: despliegue del `app.py` con Gradio en un Space o en un servidor interno para validar el flujo de extremo a extremo antes de invertir en una integración mayor.

## Benchmarks y rendimiento

Datos de validación reportados en la model card del propio repositorio:

| Modelo | Exactitud top-1 en validación | Parametros | Particion train/val | Notas |
|---|---|---|---|---|
| YOLOv8n-cls | 92,7 % | 1.445.974 | 2.019 / 508 | Sistema seleccionado; aumentos por defecto de Ultralytics |
| MobileNetV2 con cabeza propia | 76,5 % | ~6,5 M (~2,0 M entrenables) | 2.024 / 503 | Validación con aumentos aplicados, por lo que la cifra es una estimación pesimista |
| CNN desde cero | No se reporta cifra utilizable | No disponible | Rutas de train y val apuntando a la misma carpeta | Métrica contaminada por fuga de datos; cabeza sigmoide + entropía cruzada binaria inadecuada |

Distribución del dataset TrashNet empleado, relevante para interpretar los resultados:

| Clase | Imagenes | Proporcion |
|---|---|---|
| Paper | 594 | 23,5 % |
| Glass | 501 | 19,8 % |
| Plastic | 482 | 19,1 % |
| Metal | 410 | 16,2 % |
| Cardboard | 403 | 15,9 % |
| Trash | 137 | 5,4 % |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, algo coherente con la naturaleza de clasificador de imagen del proyecto. Tampoco se reportan métricas por clase, matriz de confusión ni evaluación sobre un conjunto de test independiente.

## Requisitos de hardware

- YOLOv8n-cls: 1.445.974 parámetros y 3,4 GFLOPs. La model card reporta unos 6 ms por imagen en CPU durante la validación, sin especificar el procesador utilizado.
- MobileNetV2: ~6,5 millones de parámetros con entrada de 224 × 224 × 3. No se documenta latencia ni consumo de memoria.
- VRAM estimada para inferencia en FP32: por debajo de 1 GB en ambos casos, dado el tamaño de los modelos. Cabe holgadamente en cualquier GPU de consumo, incluidas GTX 1050 Ti, GTX 1650, RTX 3060, RTX 4060 y RTX 4090, donde el cuello de botella será el preprocesado de imagen y no el modelo.
- Ejecución en CPU: viable y documentada para YOLOv8n-cls. También es previsible en hardware embebido tipo Raspberry Pi o Jetson, aunque no se han publicado mediciones en esas plataformas.
- GPU de centro de datos como A100 o H100: no aportan ventaja relevante para un modelo de 1,4 M de parámetros; solo tendrían sentido si se procesan lotes muy grandes de imágenes en paralelo.
- Opciones de despliegue documentadas: Ultralytics para entrenamiento e inferencia con YOLOv8n-cls y Gradio 4.44.1 con `app.py` para la demo. No se documentan en la información disponible despliegues con vLLM, llama.cpp, Ollama o TGI, que además no aplican a un clasificador de imagen.
- Latencia y throughput en GPU: no disponibles.
- Memoria en disco: los checkpoints de este tamaño ocupan unos pocos megabytes en FP32, muy por debajo de cualquier límite práctico.

## Comparativa con modelos similares

Comparativa entre las tres aproximaciones evaluadas en el propio repositorio:

| Criterio | YOLOv8n-cls | MobileNetV2 (transfer learning) | CNN desde cero |
|---|---|---|---|
| Parametros | 1.445.974 (56 capas) | ~6,5 M (~2,0 M entrenables) | No disponible |
| Exactitud top-1 en validacion | 92,7 % | 76,5 % | No utilizable (fuga de datos) |
| Coste computacional | 3,4 GFLOPs | No disponible, superior por numero de parametros | No disponible |
| Velocidad en CPU | ~6 ms por imagen | No disponible | No disponible |
| Preentrenamiento | Escala ImageNet (Ultralytics) | ImageNet, `include_top=False` | Ninguno |
| Aumentos de datos | Por defecto de Ultralytics: RandAugment, HSV jitter, random erasing | Rotacion 30°, shift 0,2, shear 0,15, zoom 0,2, flip horizontal | No documentados |
| Cabeza de clasificacion | 6 logits + softmax | GlobalAveragePooling, Dropout 0,3, Dense 128, Dense 6 softmax | Flatten, Dense 256 y 64 con Dropout 0,5, Dense 6 con sigmoide (incorrecta) |
| Formato de pesos | `.pt` | `.pkl` | No disponible |
| Licencia del modelo | MIT declarada en el repositorio, con la salvedad de la licencia de Ultralytics para los pesos derivados de YOLOv8 | MIT declarada | MIT declarada |

Frente a otros clasificadores de imagen habituales en este rango de tamaño, como ResNet-50, EfficientNet-B0 o ConvNeXt-Tiny, no se dispone de resultados comparativos en la informacion proporcionada, ya que el repositorio solo evalúa las tres arquitecturas anteriores sobre TrashNet.

## Limitaciones y advertencias

- Dataset muy pequeño: 2.527 imágenes en total para seis clases. Es suficiente para un prototipo, pero insuficiente para garantizar generalización a condiciones reales de captura.
- Desbalance de clases acusado: la clase `trash` tiene 137 imágenes (5,4 %), aproximadamente cuatro veces menos que `paper` (594, 23,5 %). El propio autor señala este desbalance como la causa principal de que la basura residual sea más difícil de clasificar.
- Dominio muy restringido: las fotos de TrashNet son objetos centrados sobre fondo limpio. El modelo no está validado en escenas domésticas reales con iluminación variable, oclusiones, fondos desordenados o varios objetos simultáneos.
- Monoclase por imagen: al ser un clasificador y no un detector, una fotografía con varios residuos distintos producirá una única etiqueta, potencialmente engañosa.
- Sin conjunto de test independiente ni métricas por clase publicadas. La exactitud de 92,7 % corresponde a validación, no a test, y no se desglosa por clase.
- Riesgo de predicción confiada pero errónea en clases poco representadas. El mecanismo de "no estoy seguro" mitiga el problema solo si se calibra correctamente el umbral, algo que la model card no detalla.
- Sin metadatos de pipeline en HuggingFace y con cero descargas y cero likes: el repositorio no ha pasado por ninguna validación de la comunidad. El tamaño declarado de 0,0 GB sugiere que los pesos pueden no estar publicados, por lo que la reproducibilidad depende de reentrenar desde los notebooks.
- Aviso de licencias: aunque el repositorio declara MIT, el sistema seleccionado deriva de YOLOv8 de Ultralytics, cuyos pesos y código se distribuyen bajo AGPL-3.0. Antes de un uso comercial es imprescindible verificar qué licencia se aplica al artefacto derivado y si es compatible con el producto previsto. Los modelos entrenados con TensorFlow/Keras no arrastran esa restricción, pero rinden peor en este dataset.
- Reproducibilidad parcial: la CNN desde cero incurre en fuga de datos y en una cabeza de clasificación incorrecta, y la métrica de MobileNetV2 procede de un generador de validación con aumentos. Cualquier comparación debe repetirse con un pipeline limpio antes de tomar decisiones.
- Idoneidad: no debe presentarse como un sistema listo para producción ni como un modelo de propósito general. Es un proyecto de referencia y una base de partida documentada.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/mariakawa/waste-classification
- Dataset TrashNet: https://github.com/garythung/trashnet
- Notebook de clasificación con CNN y MobileNetV2: `waste-classification-with-cnn.ipynb` (referenciado en la model card)
- Notebook de clasificación con YOLOv8n-cls: `waste-classification-with-yolov8.ipynb` (referenciado en la model card)
- Aplicación Gradio del repositorio: `app.py` (Gradio 4.44.1)
- La búsqueda web realizada no devolvió ningún enlace relevante sobre este modelo: los resultados obtenidos corresponden a páginas de YouTube sin relación con el proyecto. No se han localizado papers, blogs, repositorios adicionales ni demos asociados en la información disponible.
