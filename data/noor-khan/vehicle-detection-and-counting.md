# Noor-Khan/vehicle-detection-and-counting

## Resumen

`Noor-Khan/vehicle-detection-and-counting` es un paquete de deteccion de vehiculos en video construido sobre clasificadores Haar en cascada de OpenCV, no sobre una red neuronal entrenada. El repositorio no contiene pesos aprendidos ni datos de entrenamiento: el "modelo" son dos ficheros XML (`cars.xml` y `Bus_front.xml`) junto con el codigo de deteccion de `vehicle_detector.py`, extraido de una aplicacion Flask original de Noorullah Zamindar y empaquetado como modulo reutilizable y CLI.

El pipeline lee el video fotograma a fotograma, redimensiona cada frame a 640x480, lo convierte a escala de grises y aplica ambos clasificadores con `detectMultiScale(gray, 1.1, 1)`, dibujando cajas azules para coches y verdes para autobuses. El resultado se escribe en un video procesado y se acumula un contador de eventos de deteccion.

Es relevante unicamente como referencia docente o como linea base historica del paradigma clasico de vision por computador previo a los detectores basados en deep learning. El propio autor documenta que aproximadamente la mitad de los coches visibles no se detectan, que cerca de la mitad de las cajas son duplicados o falsos positivos y que el contador total no equivale al numero de vehiculos distintos. No es un modelo de IA generativa ni un detector de objetos moderno.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Clasificadores Haar en cascada (Viola-Jones) de OpenCV, no neuronal |
| Parametros totales | no disponible (no hay pesos aprendidos por el autor; los XML son clasificadores preentrenados de OpenCV) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (procesamiento de video fotograma a fotograma; frames redimensionados a 640x480) |
| Tipos de cuantizacion | no aplica |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | no disponible |
| Formato de pesos | XML de cascada Haar (`cars.xml`, `Bus_front.xml`) |
| Entrada | Video (mp4 y similares), frames en escala de grises 640x480 |
| Salida | Video anotado, contador total de eventos de deteccion y desglose por frame (`cars`, `buses`) |
| Dependencias | `opencv-python-headless`, `numpy` |
| Version de OpenCV medida | 5.0.0 |

## Arquitectura y entrenamiento

La deteccion se basa en el marco clasico de Viola-Jones: clasificadores en cascada de caracteristicas Haar que evaluan ventanas deslizantes sobre la imagen en escala de grises. Se aplican dos cascadas independientes, una para coches y otra para frontales de autobus, con escala de busqueda 1.1 y `minNeighbors=1`. Este ultimo parametro implica una supresion practicamente nula de detecciones solapadas, lo que explica la elevada tasa de cajas duplicadas y de pequenos falsos positivos sobre rejillas, parabrisas y marcas viales.

No hay entrenamiento, ajuste fino, RLHF ni datos propios. Los ficheros XML son clasificadores distribuidos con OpenCV o de origen no documentado en el repositorio, y el codigo no incluye etapa de tracking, verificacion temporal ni Non-Maximum Suppression adicional. El paquete solo reempaqueta la logica del `vehicle_detect.py` original para ejecutarse sin el servidor Flask.

## Capacidades

- Deteccion de coches y autobuses frontales/traseros en video mediante cascadas Haar.
- Procesamiento de video fotograma a fotograma con escritura de video anotado.
- Conteo acumulado de eventos de deteccion y desglose por frame (`frame`, `cars`, `buses`).
- Uso como libreria (`detect_vehicles`) o como CLI (`python vehicle_detector.py video.mp4 -o salida.mp4`).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues, de texto, vision semantica, audio ni modo thinking.
- No realiza seguimiento de identidades ni conteo de vehiculos distintos.

## Casos de uso

- Docencia sobre vision clasica: ilustrar el funcionamiento de las cascadas Haar y compararlas con detectores modernos en un laboratorio de vision por computador.
- Linea base de referencia: obtener una metrica inicial de deteccion sobre un clip propio antes de evaluar un modelo como YOLO, usando `evaluate.py` y `metrics.json` como plantilla.
- Prototipado rapido de un pipeline de video con OpenCV: validar la lectura, anotacion y escritura de video sin depender de pesos neuronales ni GPU.
- Demostracion de las limitaciones del paradigma: mostrar en clase por que `minNeighbors=1` produce duplicados y por que la ausencia de tracking invalida el conteo de vehiculos.
- Analisis de escenas de autopista con trafico frontal: estimar densidad relativa de cajas por frame en footage diurno y con camara frontal, aceptando la alta tasa de error.
- Pruebas de integracion en un servicio Flask heredado: reutilizar el modulo de deteccion del proyecto original sin desplegar el servidor web.
- Generacion de videos anotados para revision manual: producir material con cajas superpuestas que un operador pueda inspeccionar y corregir.

## Benchmarks y rendimiento

Resultados medidos por el autor el 18 de noviembre de 2026 con `evaluate.py`, OpenCV 5.0.0, sobre `samples/Cars.mp4` (1.501 frames, 60 s a 25 fps, 640x360, escena de autopista):

| Medida | Valor |
|---|---|
| Frames procesados | 1.501 |
| Eventos de deteccion de coches | 6.395 |
| Eventos de deteccion de autobuses | 209 |
| Total de eventos de deteccion | 6.604 |
| Frames con al menos una deteccion | 1.494 / 1.501 (99,5 %) |
| Media de detecciones por frame | 4,40 |
| Velocidad de procesamiento | 9,21 fps (162,9 s para un video de 60 s) |

Verificacion manual sobre 6 frames muestreados (`samples/frames/`):

| Metrica | Valor |
|---|---|
| Coches realmente visibles (suma de 6 frames) | 35 |
| Cajas dibujadas | 35 |
| Coches distintos con al menos una caja | 18 (51 % de los visibles) |
| Cajas extra (duplicados y sub-cajas diminutas) | 17 (49 % de todas las cajas) |
| Coches no detectados | 17 |

Controles:

| Control | Resultado |
|---|---|
| Video en gris uniforme (125 frames, sin vehiculos) | 0 detecciones |
| Video de ruido aleatorio (25 frames) | 0 detecciones |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, COCO mAP, etc.) en la informacion disponible.

## Requisitos de hardware

- CPU suficiente: el autor reporta 9,21 fps en su maquina para frames de 640x480, es decir, mas lento que tiempo real.
- No requiere GPU; no hay soporte CUDA documentado en el repositorio.
- VRAM estimada: no aplica (no hay pesos neuronales que cargar en memoria de video).
- GPU recomendadas: no aplica.
- Cabe en cualquier equipo consumer capaz de ejecutar OpenCV y numpy.
- Opciones de despliegue: ejecucion directa con Python (`python vehicle_detector.py`), importacion como modulo o integracion en el Flask original. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de componente.
- Latencia y throughput: 9,21 fps medidos; ~163 s para un clip de 60 s.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / entrada | Rendimiento | Licencia |
|---|---|---|---|---|---|
| Noor-Khan/vehicle-detection-and-counting | Cascada Haar (OpenCV) | no disponible (XML preentrenados) | Video, frames 640x480 | 51 % de coches visibles detectados; 49 % de cajas erroneas; 9,21 fps en CPU | no disponible |
| YOLOv8 / YOLO11 (Ultralytics) | CNN detector | 3M-68M segun variante | Imagenes/video a resolucion configurable | mAP COCO alto; tiempo real en GPU | AGPL-3.0 (variantes abiertas) |
| SSD MobileNet (TensorFlow) | CNN detector | ~2M-6M | Imagenes 300x300 o 320x320 | mAP moderado; tiempo real en CPU/GPU | Apache 2.0 |
| Detectores clasicos Viola-Jones de OpenCV (cascadas genericas) | Cascada Haar | no disponible | Imagenes en grises | Similar al modelo evaluado; sin tracking | Licencia de OpenCV (Apache 2.0 para el codigo; los XML tienen origen variable) |

La comparativa con YOLO y SSD es cualitativa: no se dispone en la informacion proporcionada de resultados de estos modelos sobre el mismo video de muestra, por lo que no se ofrecen cifras comparables de mAP.

## Limitaciones y advertencias

- El total de 6.604 no es un conteo de vehiculos: sin tracking, un coche visible durante 100 frames se cuenta unas 100 veces. La media de 4,40 detecciones por frame es la cifra comparable.
- Aproximadamente la mitad de los coches visibles no se detectan y cerca de la mitad de las cajas son duplicados o falsos positivos diminutos sobre rejillas, parabrisas y marcas viales, consecuencia de `minNeighbors=1`.
- Las 209 detecciones de autobus no estan verificadas: no habia ningun autobus en los 6 frames muestreados, por lo que probablemente corresponden a la cascada de autobus disparando sobre frontales de coche. No deben citarse como conteo de autobuses.
- Los vehiculos lejanos, pequenos o parcialmente ocultos se pierden con mayor frecuencia.
- Solo funciona razonablemente con vistas frontales o traseras; las vistas laterales, la noche y la lluvia degradan el rendimiento.
- Mas lento que tiempo real en CPU (9,21 fps para 640x480).
- Licencia no disponible: no se especifica permiso de uso comercial ni la procedencia de los ficheros XML de cascada, lo que supone un riesgo legal para produccion.
- No hay datos de sesgo, idiomas ni alucinacion porque el componente no procesa texto ni genera contenido; el riesgo equivalente es el falso positivo y el falso negativo en deteccion.
- El autor recomienda explicitamente migrar a YOLO para mejorar la precision.
- El video de muestra es una escena de autopista del repositorio original y no contiene datos personales.

## Enlaces

- Hugging Face: https://huggingface.co/Noor-Khan/vehicle-detection-and-counting
- Repositorio original (Flask): https://github.com/NoorullahZamindar-007/Vehicle-Detection-and-Counting
- OpenCV (libreria base): https://opencv.org/
- Documentacion de `detectMultiScale` en OpenCV: https://docs.opencv.org/
