# Didrien/meteorix-rfdetr-small

## Resumen

Meteorix RF-DETR Small es un modelo de deteccion de objetos especializado en la identificacion de meteoros en imagenes nocturnas del cielo, desarrollado por el autor Didrien como parte del estudio Meteorix. Se trata de un fine-tuning del checkpoint preentrenado en COCO `rf-detr-small.pth`, reentrenado para detectar una unica clase (`meteor`) en imagenes de cielo nocturno capturadas desde tierra. El modelo se enmarca en un estudio comparativo frente a YOLO26n y DETR-ResNet-50.

La arquitectura subyacente es RF-DETR (Roboflow DETR), un detector basado en transformer con backbone DINOv2, en su variante Small, que opera a una resolucion de 512x512 pixeles. El modelo se distribuye como un unico fichero de pesos `.pth` compatible con la libreria `rfdetr` (probado con la version 1.6.5.post0) y esta publicado bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

Su relevancia radica en su aplicacion cientifica concreta: la deteccion automatica de meteoros en grandes volumenes de imagenes de vigilancia del cielo, una tarea donde los detectores genericos rinden por debajo de un modelo especializado. Los resultados reportados en el conjunto de test de Mendeley (F1 de 0.978) y en el conjunto NEO-Bench UAEMMN (F1 de 0.862) lo situan como una alternativa solida y ligera para este dominio especifico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RF-DETR Small (detector transformer basado en DETR, backbone DINOv2) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada de imagen 512x512) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en `.pth` sin cuantizaciones publicadas) |
| Idiomas soportados | no aplica (modelo de vision, sin procesamiento de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.pth` (PyTorch, compatible con la libreria `rfdetr`) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura RF-DETR en su variante Small, un detector basado en transformer que sigue el paradigma DETR (DEtection TRansformer) con un backbone DINOv2 preentrenado. Parte del checkpoint `rf-detr-small.pth` preentrenado en COCO y se ajusta fino para una unica clase (`meteor`) en imagenes de cielo nocturno. Opera a la resolucion por defecto de RF-DETR Small, 512x512 pixeles, y las imagenes en escala de grises deben convertirse a RGB antes de la inferencia.

El entrenamiento sigue la receta por defecto de fine-tuning de `rfdetr`: optimizador AdamW con tasa de aprendizaje 1e-4 y decaimiento por capas dentro del backbone, EMA de los pesos, tamano de lote efectivo de 16 (4 x 4 con acumulacion de gradientes), sin decaimiento de la tasa de aprendizaje y 100 epocas. Los pesos publicados corresponden al `checkpoint_best_total.pth` seleccionado por `rfdetr` sobre el split de validacion, concretamente los pesos EMA de la epoca 25 (contada desde 0, es decir, la 26.ª epoca), con un mAP50-95 de validacion de 0.670. El dataset utilizado es el Mendeley meteor image dataset (Gradvohl y Shirasuna, DOI 10.17632/4k98n84d9g.1, CC BY 4.0), con 3.849 imagenes de entrenamiento, 550 de validacion y 1.100 de test.

## Capacidades

- Deteccion de objetos de una unica clase (`meteor`) en imagenes de cielo nocturno capturadas desde tierra.
- Salida de cajas delimitadoras en coordenadas de pixel de la imagen original (`detections.xyxy`), con umbral de confianza configurable.
- Funcionamiento a la resolucion nativa de 512x512 de RF-DETR Small.
- Procesamiento de imagenes en escala de grises tras conversion a RGB.
- Inferencia de baja latencia (18,4 ms por imagen de extremo a extremo en una RTX 4090).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (es un modelo puramente de vision).
- No dispone de capacidades multilingues ni de generacion de texto.

## Casos de uso

- Vigilancia automatica del cielo: procesar lotes masivos de imagenes de camaras de monitorizacion nocturna para identificar meteoros de forma automatica, reduciendo la revision manual a las detecciones positivas gracias a una precision de 0.985 en el conjunto de test de Mendeley.
- Analisis de campanas de observacion: filtrar y clasificar imagenes capturadas por redes de camaras de meteoros (por ejemplo, estaciones de video) para construir catalogos de eventos con coordenadas precisas.
- Investigacion en astronomia ciudadana: integrar el modelo en pipelines de proyectos de ciencia ciudadana que recopilan imagenes del cielo y necesitan un primer filtrado automatizado de candidatos a meteoro.
- Validacion cruzada de datos: usar el modelo como detector de referencia en estudios comparativos de detectores (el propio estudio Meteorix lo compara con YOLO26n y DETR-ResNet-50), gracias a su licencia Apache 2.0 y su ligereza.
- Despliegue en estaciones de borde: su tamano reducido (repo de 0.1 GB) y su latencia de 18,4 ms en una RTX 4090 permiten ejecutarlo cerca de la captura, por ejemplo en mini-PC con GPU consumer, para alertar en tiempo casi real de la deteccion de meteoros.
- Preprocesado para pipelines de astrometria: generar cajas delimitadoras de candidatos a meteoro que alimenten pasos posteriores de calculo de trayectorias o triangulacion entre estaciones.

## Benchmarks y rendimiento

Resultados reportados en la model card (nivel de imagen, confianza 0.5, IoU de emparejamiento 0.5):

| Conjunto de test | Precision | Recall | F1 |
|---|---|---|---|
| Mendeley test split (1.100 imagenes) | 0.985 | 0.971 | 0.978 |
| NEO-Bench UAEMMN, todos los splits (1.382 imagenes) | 0.976 | 0.772 | 0.862 |

| Metrica adicional | Valor |
|---|---|
| mAP50-95 en validacion (epoca 25, pesos EMA) | 0.670 |
| Latencia extremo a extremo en RTX 4090 | 18,4 ms por imagen |

No se han publicado en la informacion disponible resultados comparativos frente a YOLO26n o DETR-ResNet-50, aunque el modelo forma parte de un estudio que los compara.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; por el tamano del modelo (repo de 0.1 GB) y la resolucion de 512x512, es compatible con GPUs consumer de gama media.
- GPU recomendadas: RTX 4090 (latencia medida de 18,4 ms por imagen); cualquier GPU NVIDIA con suficiente VRAM para un detector Small a 512x512.
- Cabe en GPU consumer: si, incluidas tarjetas de gama media y alta; el dato concreto de VRAM minima no esta publicado.
- Opciones de despliegue: libreria `rfdetr` (version probada 1.6.5.post0) mediante `RFDETRSmall` y `model.predict()`; los pesos se descargan con `huggingface_hub.hf_hub_download`.
- Latencia y throughput: 18,4 ms por imagen de extremo a extremo (carga, preprocesado, forward y postprocesado) en una RTX 4090; el throughput agregado no esta publicado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Meteorix RF-DETR Small | no disponible | imagen 512x512 | F1 0.978 (Mendeley), F1 0.862 (NEO-Bench) | Apache 2.0 | Hugging Face |
| YOLO26n (mencionado en el estudio) | no disponible | no disponible | no disponible en la informacion | no disponible | no disponible |
| DETR-ResNet-50 (mencionado en el estudio) | no disponible | no disponible | no disponible en la informacion | no disponible | no disponible |

El estudio Meteorix compara este modelo con YOLO26n y DETR-ResNet-50, pero los resultados comparativos no se incluyen en la informacion disponible.

## Limitaciones y advertencias

- Modelo de clase unica: solo detecta meteoros; no reconoce otras clases de objetos.
- Dominio restringido: entrenado sobre el Mendeley meteor image dataset; el rendimiento puede degradarse con imagenes de otras camaras, condiciones de ruido, contaminacion luminica o resoluciones distintas.
- Caida de recall en datos externos: el recall baja de 0.971 en Mendeley a 0.772 en NEO-Bench UAEMMN, lo que indica menor sensibilidad ante imagenes fuera de la distribucion de entrenamiento.
- Requiere conversion explicita de imagenes en escala de grises a RGB antes de la inferencia.
- Dependencia de la version de la libreria `rfdetr` (probado con 1.6.5.post0); cambios de version pueden afectar a la compatibilidad de los pesos.
- Riesgo de falsos positivos en imagenes con trazas similares a meteoros (aviones, satelites, ruido del sensor); el umbral de confianza debe calibrarse por caso de uso.
- Sin datos publicados sobre sesgos, cuantizaciones ni rendimiento en hardware distinto de la RTX 4090.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del dataset de entrenamiento (CC BY 4.0) si se redistribuyen datos derivados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Didrien/meteorix-rfdetr-small
- Dataset Mendeley meteor image dataset (Gradvohl y Shirasuna): DOI 10.17632/4k98n84d9g.1
- Libreria `rfdetr` (referenciada en la model card): no disponible enlace directo en la informacion proporcionada
- Estudio Meteorix (comparativa YOLO26n, RF-DETR Small y DETR-ResNet-50): no disponible enlace en la informacion proporcionada
