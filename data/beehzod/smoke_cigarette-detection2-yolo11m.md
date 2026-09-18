# Beehzod/smoke_cigarette-detection2-yolo11m

## Resumen

smoke_cigarette-detection2-yolo11m es un modelo de deteccion de objetos en una etapa, resultado del ajuste fino (*fine-tuning*) del checkpoint `ultralytics/yolov11m` (YOLOv11-Medium) sobre un conjunto de datos etiquetado para localizar cigarrillos en imagenes. Lo publica el usuario Beehzod en HuggingFace bajo licencia MIT, con la libreria Ultralytics como marco de ejecucion y la etiqueta de pipeline `object-detection`. El modelo resuelve una tarea muy concreta: dada una imagen, devolver cajas delimitadoras con la clase unica `cigarette`, junto con su puntuacion de confianza.

El interes practico del modelo reside en su especializacion. Frente a detectores genericos de objetos, aqui se ha entrenado especificamente sobre imagenes de personas fumando o sosteniendo cigarrillos, lo que permite integrarlo en sistemas de videovigilancia o cumplimiento normativo de espacios sin humo. Los resultados declarados por el autor son altos en validacion (mAP50 de 0,9943 y mAP50-95 de 0,7421), si bien proceden de un conjunto de validacion pequeno (461 imagenes) y no han sido verificados de forma independiente.

Se trata de un modelo de vision puro, no de un modelo de lenguaje: no procesa texto, no tiene ventana de contexto y no soporta tool calling ni razonamiento multi-paso. Su relevancia es la de un componente especializado dentro de un pipeline mayor (captura de video, preprocesado, deteccion, logica de negocio y alertas), y su tamano medio dentro de la familia YOLO11 lo situa en el rango de modelos desplegables en hardware de gama media, condicion sujeta a la ausencia de requisitos de hardware explicitos en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOv11-Medium (detector de objetos en una etapa, familia Ultralytics YOLO11) |
| Parametros totales | no disponible en la informacion proporcionada |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision; no procesa secuencias de texto) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada |
| Idiomas soportados | no aplica (modelo de vision; no procesa lenguaje) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`.pt`), cargado mediante la API de Ultralytics (`best.pt`) |

Otros datos derivados de la model card:

| Parametro | Valor |
|---|---|
| Modelo base | `ultralytics/yolov11m` (`yolo11m.pt`) |
| Pipeline | object-detection |
| Clases | 1 (`cigarette`) |
| Libreria | ultralytics |
| Tamano del repositorio | 0,0 GB (segun HuggingFace) |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-18 |

## Arquitectura y entrenamiento

La arquitectura subyacente es YOLO11 en su variante Medium, un detector de objetos de una sola etapa basado en redes convolucionales que predice simultaneamente la localizacion de las cajas y la clase asociada en una unica pasada hacia delante. El modelo parte del checkpoint preentrenado `yolo11m.pt` y se ajusta mediante la libreria Ultralytics, por lo que hereda las convenciones de entrenamiento e inferencia de ese ecosistema (resolucion de entrada de 640 pixeles, API `YOLO(...).predict(...)`).

El entrenamiento se realizo durante 100 epocas con optimizador AdamW, tasa de aprendizaje inicial (`lr0`) de 0,001, tamano de lote de 18, resolucion de imagen de 640 y paciencia de parada temprana de 20 epocas. El conjunto de datos procede de Roboflow Universe (`smoking-detection-5e8hh/smoking-detection-ggnhq`, version 1) y contiene 1636 imagenes de entrenamiento, 461 de validacion y 240 de prueba, con una unica clase anotada: `cigarette`. No se documenta en la informacion disponible el uso de tecnicas de aumento de datos, destilacion, decodificacion especulativa ni etapas de alineacion tipo RLHF o DPO, que por otra parte no aplican a un detector de objetos.

## Capacidades

- Deteccion de objetos en imagenes: devuelve cajas delimitadoras con clase y puntuacion de confianza para la clase unica `cigarette`.
- Inferencia mediante la API de Ultralytics: `model = YOLO("best.pt"); model.predict("image.jpg", conf=0.25)`, con acceso a `model.names` y a las coordenadas de cada caja.
- Procesamiento por lotes y por fotograma: al ser un detector de una etapa, es aplicable a flujos de video fotograma a fotograma, aunque la model card no documenta pruebas especificas sobre video ni metricas de velocidad.
- Umbral de confianza configurable en tiempo de inferencia (`conf`), lo que permite ajustar el equilibrio entre precision y recall segun el caso de uso.
- Soporte de tool calling / function calling: no aplica.
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingues: no aplica.
- Capacidades especiales (modo *thinking*, vision, audio): no aplica; el modelo es exclusivamente un detector visual de una clase.

## Casos de uso

- Cumplimiento de espacios sin humo: integrado en camaras de circuito cerrado de television (CCTV) de aeropuertos, hospitales, estaciones o centros educativos, el detector puede generar alertas cuando se identifica un cigarrillo en la imagen, permitiendo al personal actuar sin vigilancia continua.
- Seguridad laboral en entornos industriales: en plantas quimicas, refinerias o almacenes con material inflamable, la deteccion temprana de un cigarrillo encendido puede disparar protocolos automaticos de aviso, dado que la clase objetivo es exactamente la conducta de riesgo.
- Analisis de contenido en redes sociales y plataformas: clasificacion automatizada de imagenes subidas por usuarios para etiquetar o moderar contenido relacionado con tabaco, usando la deteccion como paso previo a un sistema de decision.
- Investigacion sobre tabaquismo: procesamiento por lotes de corpus fotograficos o de material de campanas publicitarias para cuantificar la presencia de cigarrillos, con la ventaja de que el modelo devuelve coordenadas y no solo una etiqueta global.
- Despliegue en el borde (*edge*): al ser un modelo de deteccion de tamano medio, es candidato a ejecutarse en dispositivos como NVIDIA Jetson o mini-PC con GPU integrada, evitando enviar video a la nube por motivos de privacidad.
- Automatizacion de auditorias de cumplimiento: generacion de informes periodicos a partir de registros de video, contando eventos de deteccion por franja horaria o por zona, para justificar el cumplimiento de politicas internas.
- Filtrado previo en pipelines de vision mayores: uso como etapa de cribado rapida que descarta fotogramas sin cigarrillo antes de pasar a modelos mas costosos (por ejemplo, clasificadores o modelos vision-language) solo sobre los fotogramas positivos.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo sobre la particion de validacion reservada (461 imagenes). Los valores estan marcados como no verificados (`verified: false`) en el model-index.

| Metrica | Valor | Verificado |
|---|---|---|
| mAP50 | 0,9943 | No |
| mAP50-95 | 0,7421 | No |
| Precision | 0,9811 | No |
| Recall | 0,9835 | No |

No se han publicado en la informacion disponible resultados comparativos con otros detectores, ni mediciones de latencia, throughput o rendimiento sobre el conjunto de prueba (240 imagenes).

## Requisitos de hardware

- La model card no especifica requisitos de VRAM, GPU recomendadas ni cifras de latencia o throughput; estos datos figuran como no disponibles.
- Como referencia general de la familia YOLO11 en su variante Medium, se trata de un detector pensado para inferencia en GPU de gama media y en dispositivos de borde; la verificacion concreta de consumo y velocidad debe realizarse sobre el hardware objetivo.
- Cabe en GPU de consumo (por ejemplo, gamas RTX xx60/xx70 y superiores) siempre que se ajusten el tamano de lote y la resolucion de entrada; no hay confirmacion oficial de estos limites en la informacion proporcionada.
- Opciones de despliegue plausibles dado el formato de pesos: inferencia directa con Ultralytics en PyTorch; exportacion a otros formatos (ONNX, TensorRT, OpenVINO) no esta documentada en la model card y debe validarse.
- No se dispone de datos de latencia ni de imagenes por segundo para ninguna GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| smoke_cigarette-detection2-yolo11m | no disponible | no aplica | mAP50 0,9943 / mAP50-95 0,7421 (validacion propia, no verificado) | MIT | HuggingFace, 0 descargas |
| `ultralytics/yolov11m` (modelo base) | no disponible en la informacion proporcionada | no aplica | no disponible | no disponible en la informacion proporcionada | HuggingFace |
| Otros detectores de la familia YOLO (YOLOv8m, YOLOv5m) | no disponible | no aplica | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos ni de alternativas especificas de deteccion de tabaquismo en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- Clase unica: el modelo solo detecta `cigarette`; no reconoce cigarrillos electronicos, pipas, puros ni humo, y no debe usarse como detector general de tabaquismo.
- Datos de validacion escasos: las metricas declaradas provienen de 461 imagenes de validacion y no han sido verificadas por terceros; pueden no generalizar a dominios distintos (iluminacion nocturna, camaras termicas, angulos no vistos).
- Conjunto de entrenamiento reducido: 1636 imagenes de entrenamiento, procedentes de una unica fuente de Roboflow, lo que aumenta el riesgo de sobreajuste a las condiciones de captura de ese dataset.
- Riesgo de falsos positivos por confusion de objetos: elementos alargados y blancos (boligrafos, pajitas, cables, comida) pueden confundirse con un cigarrillo, especialmente con umbrales de confianza bajos.
- Sesgos potenciales: no se documenta la composicion demografica, geografica ni cultural del dataset, lo que impide evaluar sesgos de deteccion por tono de piel, vestimenta o contexto.
- Licencia del dataset: la model card advierte explicitamente de que la licencia del conjunto de datos de Roboflow no tiene por que coincidir con la licencia MIT del repositorio, que refleja la del modelo base. Debe comprobarse antes de un uso comercial.
- Restricciones de uso comercial: la licencia MIT es permisiva, pero la licencia del modelo base Ultralytics y la del dataset deben verificarse de forma independiente; Ultralytics aplica condiciones propias de licencia empresarial segun el uso.
- Privacidad y regulacion: la deteccion de conductas personales en video implica obligaciones de proteccion de datos (RGPD en el contexto europeo) que no cubre la licencia del modelo.
- Limitaciones tecnicas: no procesa texto, no mantiene contexto conversacional y no genera descripciones; su salida son cajas delimitadoras y puntuaciones de confianza.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Beehzod/smoke_cigarette-detection2-yolo11m
- Modelo base: https://huggingface.co/ultralytics/yolov11m
- Repositorio Ultralytics: https://github.com/ultralytics/ultralytics
- Dataset de origen (Roboflow Universe): https://universe.roboflow.com/smoking-detection-5e8hh/smoking-detection-ggnhq
- No se han encontrado papers, blogs ni demos adicionales en los resultados de busqueda web proporcionados.
