# nishsm/swingtrace

## Resumen

SwingTrace es un detector de objetos basado en YOLO11m, desarrollado por el usuario nishsm, especializado en la deteccion del palo de golf en videos de swings. Concretamente identifica tres elementos: el varilla (shaft), la cabeza del palo (club head) y las manos o agarre (hands / grip). Su proposito es reconstruir la trayectoria de la cabeza del palo a lo largo de todo el movimiento, incluyendo los fotogramas borrosos de la parte alta del backswing y del impacto, donde los detectores convencionales pierden el objeto.

El modelo es un fine-tune del modelo base Ultralytics/YOLO11, en su variante media (YOLO11m), y se distribuye como pesos PyTorch a traves de la libreria Ultralytics. Se trata de un modelo de vision por computador puramente de deteccion de objetos, no de un modelo de lenguaje, por lo que no procesa texto ni mantiene contexto conversacional. Se publica bajo licencia AGPL-3.0, heredada de Ultralytics YOLO, y el repositorio tiene un tamano de 0,0 GB con cero descargas y cero "likes" en el momento de la consulta.

Su relevancia radica en el nicho concreto que cubre: el analisis automatico de swings de golf para aplicaciones de entrenamiento y mejora deportiva. El autor lo usa como motor del proyecto SwingTrace, que a partir de los fotogramas detectados reconstruye la ruta del palo. Los pesos estan pensados para clips de un unico golfista grabados con camara de telefono estatica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO11 (Ultralytics 8.3), red convolucional de deteccion de objetos en una etapa |
| Parametros totales | no disponible en la informacion proporcionada (variante media YOLO11m) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (deteccion de objetos en imagenes) |
| Tipos de cuantizacion | no disponibles (pesos en precision completa .pt; exportable a otros formatos mediante Ultralytics) |
| Idiomas soportados | no aplica (modelo de vision) |
| Licencia | AGPL-3.0 |
| Formato de pesos | PyTorch (.pt), cargable con la libreria ultralytics |

Datos adicionales relevantes:

| Parametro | Valor |
|---|---|
| Clases detectadas | 0 = shaft (varilla), 1 = club head (cabeza del palo), 2 = hands / grip (manos / agarre) |
| Resolucion de entrada | 640 px |
| Modelo base | Ultralytics/YOLO11 |
| Pipeline | object-detection |

## Arquitectura y entrenamiento

La arquitectura es YOLO11 en su variante media, una red convolucional de deteccion de objetos en una sola etapa desarrollada por Ultralytics. El modelo se ha obtenido mediante fine-tuning del checkpoint base YOLO11m (Ultralytics 8.3) sobre un conjunto de datos especifico de seguimiento de palo de golf. La salida es un conjunto de cajas delimitadoras con clase y confianza por fotograma, que el proyecto SwingTrace encadena para reconstruir la trayectoria del palo.

El entrenamiento se realizo sobre el dataset golf-club-tracking, publicado por club-head-tracking en Roboflow Universe bajo licencia CC BY 4.0. La configuracion indicada por el autor fue de 640 px de resolucion, batch de 2, precision mixta y early stopping con paciencia de 100. La mejor epoca fue la 456 de un total de 556, con un tiempo de entrenamiento aproximado de 48 horas sobre una GPU de portatil RTX 4060 con 8 GB de VRAM. No se menciona en la informacion disponible el uso de RLHF, DPO ni tecnicas equivalentes, algo por otra parte ajeno a la deteccion de objetos.

## Capacidades

- Deteccion de objetos en imagenes y video: identifica las tres clases definidas (varilla, cabeza del palo y manos / agarre) con cajas delimitadoras y puntuacion de confianza.
- Seguimiento de objetos a lo largo de un video (object tracking), que el proyecto asociado emplea para reconstruir la ruta de la cabeza del palo en todo el swing.
- Deteccion robusta en fotogramas con desenfoque de movimiento (parte alta del backswing e impacto), donde el modelo puede recuperar la cabeza del palo a partir de la varilla.
- Inferencia sobre video completo mediante `model.predict()` de Ultralytics.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision general (captioning o VQA), tool calling, capacidades de agente ni soporte multilingue. No tiene modo "thinking" ni procesamiento de audio.

## Casos de uso

- Analisis de swing personal: el usuario graba su swing con el movil y el modelo detecta el palo en cada fotograma para reconstruir la trayectoria, permitiendo revisar el plano del swing sin equipo especializado.
- Aplicaciones de entrenamiento de golf: se integra como motor de deteccion en apps que ofrecen feedback sobre la ruta del palo y posiciones clave del swing.
- Seguimiento de la cabeza del palo en todo el movimiento: gracias a la deteccion combinada de varilla y cabeza, el sistema puede mantener la trayectoria incluso en los fotogramas borrosos del impacto, donde un detector de una sola clase fallaria.
- Analisis biomecanico asistido: combinado con estimacion de pose (como hace la aplicacion SwingTrace AI Pro, no necesariamente este mismo modelo), sirve para estudiar la secuencia cinematica y la coil de hombros y caderas.
- Procesado por lotes de sesiones de practica: al ejecutarse sobre video, permite analizar de forma automatica una biblioteca de grabaciones de un jugador para comparar swings a lo largo del tiempo.
- Integracion en pipelines de analisis deportivo: la salida en cajas puede alimentar sistemas posteriores de metricas o visualizacion dentro de herramientas de sports analytics.
- Prototipado e investigacion en vision deportiva: sirve como punto de partida (fine-tune adicional) para deteccion de otros elementos del golf o para validar tecnicas de tracking en objetos con gran movimiento y desenfoque.

## Benchmarks y rendimiento

El autor publica dos conjuntos de resultados. El primero corresponde al conjunto de validacion y el segundo a un conjunto de videos de telefono no vistos previamente.

| Metrica (validacion) | Valor |
|---|---|
| Precision | 0,930 |
| Recall | 0,849 |
| mAP@50 | 0,918 |
| mAP@50-95 | 0,674 |

| Metrica (videos de telefono no vistos) | Valor |
|---|---|
| Numero de clips | 7 |
| Numero de fotogramas | 3.018 |
| Confianza | 0,5 |
| Cabeza del palo detectada | 71,6 % de fotogramas |
| Cabeza o varilla detectada | 93,4 % de fotogramas |

Advertencia del propio autor: el mAP de validacion debe tratarse como un limite superior, porque los fotogramas del dataset provienen de videos y se dividieron de forma aleatoria, de modo que el 91 % de los fotogramas de validacion tienen un fotograma de entrenamiento a dos fotogramas o menos de distancia, lo que introduce fuga de informacion entre train y validacion. Los clips de telefono no tienen etiquetas de manos, por lo que los recuentos de deteccion incluyen falsos positivos ocasionales. No se han facilitado comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM de inferencia: no se proporcionan cifras concretas en la informacion disponible. Al tratarse de un modelo de tamano medio (variante m de YOLO11) y una resolucion de 640 px, la inferencia es ligera, pero no se ofrece un valor medido.
- Entrenamiento: se completo en aproximadamente 48 horas sobre una GPU de portatil RTX 4060 con 8 GB de VRAM, lo que da una referencia del orden de magnitud de memoria necesaria.
- GPU recomendadas: no disponibles en la informacion. Por tamano del modelo base, cabe esperar compatibilidad con GPUs de consumo (serie RTX 4060 y superiores) y con aceleradores de datacenter (A100, H100) si se busca mayor throughput.
- Cabe en GPU de consumo: si, segun la referencia de entrenamiento en una RTX 4060 de portatil con 8 GB.
- Opciones de despliegue: Ultralytics (Python) de forma nativa; tambien se pueden exportar los pesos a otros formatos soportados por Ultralytics (como ONNX o TensorRT) aunque no se documentan en la informacion disponible. No se hace mencion especifica a vLLM, llama.cpp u Ollama, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se han proporcionado datos de benchmarks de modelos comparables en la informacion disponible. Como referencia estructural, el unico modelo directamente relacionado es su base, Ultralytics/YOLO11 (variante m), del que este modelo es un fine-tune, pero no se dispone de metricas comparables publicadas para establecer una tabla cuantitativa.

| Modelo | Relacion | Parametros | Contexto | Licencia | Rendimiento comparado |
|---|---|---|---|---|---|
| nishsm/swingtrace | Fine-tune especializado en golf | no disponible | no aplica | AGPL-3.0 | precision 0,930 / mAP@50 0,918 |
| Ultralytics/YOLO11 (base, variante m) | Modelo base de partida | no disponible | no aplica | AGPL-3.0 | no disponible |
| Otros detectores de objetos de proposito general | Alternativa generica | no disponible | no aplica | variable | no disponible |

## Limitaciones y advertencias

- Entrenado y probado con clips de un unico golfista grabados con camara de telefono estatica. El rendimiento empeora con camaras en movimiento, con varias personas en el encuadre o con angulos poco habituales.
- Falsos positivos en objetos finos y brillantes: el modelo puede etiquetar como varilla elementos como una luz de techo.
- La metrica de validacion (mAP@50 0,918) esta inflada por la fuga de informacion entre train y validacion (el 91 % de los fotogramas de validacion tienen un fotograma de entrenamiento a 2 fotogramas o menos). Debe tomarse como limite superior.
- En videos de telefono no vistos, la deteccion de la cabeza del palo baja al 71,6 % de fotogramas; es la combinacion cabeza o varilla la que alcanza el 93,4 %, y esos recuentos incluyen falsos positivos al no haber etiquetas de manos.
- Licencia AGPL-3.0: es una licencia copyleft fuerte, heredada de Ultralytics YOLO. El uso comercial en productos o servicios en red exige cumplir las obligaciones de la AGPL (entre ellas, ofrecer el codigo fuente correspondiente a los usuarios que interactuen con el servicio a traves de la red), lo que puede ser un obstaculo para integraciones propietarias. Cualquier uso comercial debe revisarse con atencion.
- No es un modelo de lenguaje: no genera texto, no razona, no soporta tool calling ni agentes, y no tiene capacidades multilingues.
- Tamano de repositorio indicado como 0,0 GB, cero descargas y cero "likes" en el momento de la consulta, lo que indica un proyecto muy reciente y sin validacion por parte de la comunidad.
- El dataset de entrenamiento es de terceros (golf-club-tracking, CC BY 4.0); conviene verificar las condiciones de uso y atribucion de los datos originales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nishsm/swingtrace
- Repositorio de codigo en GitHub: https://github.com/nishsm/swingtrace
- README del proyecto en GitHub: https://github.com/nishsm/swingtrace/blob/main/README.md
- Notebook Colab de inicio rapido: https://colab.research.google.com/github/nishsm/swingtrace/blob/main/notebooks/swingtrace_quickstart.ipynb
- Dataset de entrenamiento (Roboflow Universe, golf-club-tracking): https://universe.roboflow.com/club-head-tracking/golf-club-tracking
- Modelo base: https://huggingface.co/Ultralytics/YOLO11
- Sitio relacionado encontrado en la busqueda: https://www.swingtrace.golf/
- Aplicacion relacionada encontrada en la busqueda: https://swingtrace.golfbiomechanics.net/
- Aplicacion en Google Play encontrada en la busqueda: https://play.google.com/store/apps/details?id=com.vicious.swingtrace
