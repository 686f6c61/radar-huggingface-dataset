# Intel/motion-detection

## Resumen

Motion Detection de Intel no es un modelo de IA generativa ni una red neuronal: es un caso de uso de analitica de video publicado en Hugging Face bajo el identificador `Intel/motion-detection`, implementado con sustraccion de fondo clasica mediante el algoritmo MOG2 (Mixture of Gaussians 2) de OpenCV. Su proposito es detectar regiones en movimiento en un flujo de video sin cargar ningun peso neuronal, agrupando los pixeles de primer plano en cajas delimitadoras.

El repositorio esta pensado para el stack de Intel DLStreamer 2026.3.0 RC1 junto con OpenVINO GenAI 2026.5.0.0.dev20261030, y esta orientado a despliegues de analitica en el borde (edge AI), con escenarios tipicos de videovigilancia urbana y metropolitana: activacion de camaras inactivas, monitorizacion perimetral fuera de horario, reduccion de ancho de banda grabando solo fotogramas con movimiento y pre-filtrado barato delante de pipelines de deteccion neuronal como YOLO26.

Su relevancia actual es practica: demuestra que para la tarea de "algo ha cambiado en el encuadre" la vision por computador clasica sigue siendo la opcion mas eficiente en CPU, y sirve como puerta de entrada de bajo coste para pipelines de deteccion mas caros. El repositorio es minimo (0.0 GB), con licencia MIT, documentacion en ingles y ejemplos en Python tanto en OpenCV puro como sobre el stack GStreamer de DLStreamer.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sustraccion de fondo clasica (OpenCV MOG2, mezcla adaptativa de gaussianas); no es una red neuronal |
| Parametros totales | no disponible (no aplicable: no hay pesos) |
| Parametros activos | no disponible (no aplicable) |
| Longitud de contexto | no disponible (no aplicable; procesa fotograma a fotograma) |
| Tipos de cuantizacion | no disponible (no aplicable; la model card indica "Supported Precisions: Not applicable") |
| Idiomas soportados | en (documentacion y ejemplos) |
| Licencia | MIT |
| Formato de pesos | no disponible (no hay pesos; el repositorio contiene scripts Python y un video de ejemplo) |

## Arquitectura y entrenamiento

No hay arquitectura de aprendizaje profundo ni fase de entrenamiento. El pipeline aplica `cv2.createBackgroundSubtractorMOG2` con `history=200`, `varThreshold=25` y `detectShadows=True` sobre cada fotograma: el modelo estadistico de fondo se aprende en linea a partir de la propia secuencia de video. Posteriormente se umbraliza la mascara (se descartan las sombras, marcadas con valor 127, conservando solo el primer plano fuerte con valor 255), se aplica una apertura morfologica con un kernel de 3x3 para eliminar ruido y se extraen contornos con `cv2.findContours`, descartando los blobs con area inferior a 500 pixeles para reducir falsos positivos.

La variante DLStreamer sustituye la captura de OpenCV por la pila de decodificacion GStreamer (`decodebin3 ! videoconvert`) con salida por `appsink`, manteniendo la misma logica de sustraccion de fondo. El repositorio no incluye exportacion ni cuantizacion de modelo; el script `export_and_quantize.sh` unicamente descarga `test_video.mp4`. Como innovacion destacable, la model card propone explicitamente el uso de OpenCV UMat (`cv2.UMat(frame)`) para acelerar por GPU mediante la API transparente de OpenCV en sistemas con GPU Intel con soporte OpenCL, y descarta el NPU por no tratarse de una carga neuronal.

## Capacidades

- Deteccion de movimiento generico en video: identifica regiones de primer plano en movimiento sin clasificar el objeto.
- Sustraccion de fondo adaptativa con MOG2, con supresion de sombras y filtrado morfologico de ruido.
- Agrupacion de pixeles de movimiento en cajas delimitadoras mediante contornos y umbral de area minima configurable.
- Salida anotada en video (`output_opencv.mp4`) con cajas, texto de estado ("Motion Detected" / "No Motion") y contador de regiones por fotograma.
- Registro por consola de una linea por fotograma con el numero de regiones de movimiento detectadas.
- Integracion con DLStreamer/GStreamer para decodificacion de video en pipelines de Intel.
- Aceleracion opcional por GPU Intel via OpenCV UMat/OpenCL; ejecucion en CPU por defecto.
- No soporta tool calling, function calling, razonamiento multi-paso, capacidades multilingues, vision semantica, audio ni modos de pensamiento: no es un modelo de lenguaje.

## Casos de uso

- Activacion de camaras inactivas: el detector se ejecuta de forma continua y barata en CPU y solo despierta analiticas mas pesadas (por ejemplo, un pipeline YOLO26) cuando hay movimiento, reduciendo el consumo computacional global.
- Monitorizacion perimetral y fuera de horario: cualquier movimiento en un area restringida genera una alerta, sin necesidad de identificar el tipo de objeto ni de mantener un detector neuronal en ejecucion.
- Reduccion de ancho de banda: se graba o se transmite unicamente los fotogramas que contienen movimiento, lo que disminuye el almacenamiento y el trafico en despliegues con muchas camaras.
- Pre-filtrado delante de deteccion neuronal: la comprobacion barata de movimiento actua como puerta de un pipeline caro de deteccion, evitando inferencias innecesarias en fotogramas estaticos.
- Analitica de metro y transporte urbano: deteccion de presencia de personas o vehiculos en andenes y accesos como senal de actividad, sin clasificacion de clases.
- Procesamiento en el borde con hardware Intel: despliegue en equipos con CPU Intel y, opcionalmente, GPU Intel via OpenCL, integrado en la pila DLStreamer 2026.3.0 RC1.
- Prototipado rapido de pipelines de video: los scripts de ejemplo sirven como base para validar captura, decodificacion, procesamiento y escritura de video antes de incorporar modelos neuronales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card unicamente remite a una matriz de validacion de dispositivos (`DEVICE_SUPPORT_MATRIX.md`) con resultados medidos en CPU, GPU y NPU, pero no incluye cifras en el contenido proporcionado. Tampoco se ofrecen datos de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplicable; no hay pesos ni inferencia neuronal. El consumo de memoria es el del buffer de video y las estructuras de OpenCV.
- GPU recomendadas: no aplicable como requisito; se puede habilitar aceleracion opcional con OpenCV UMat en sistemas con GPU Intel con soporte OpenCL.
- Cabe en cualquier GPU de consumo: si, en el sentido de que no requiere GPU; el caso de uso esta disenado para CPU.
- NPU: explicitamente no aplicable, ya que la sustraccion de fondo no es una carga neuronal.
- Opciones de despliegue: scripts Python con OpenCV; variante con DLStreamer/GStreamer (`decodebin3 ! videoconvert` + `appsink`); stack objetivo DLStreamer 2026.3.0 RC1 con OpenVINO GenAI 2026.5.0.0.dev20261030 y OpenVINO Runtime 2026.5.0.dev20261030.
- Requisitos de software: Python 3.11 o superior, OpenVINO y DLStreamer instalados, entorno virtual creado con `--system-site-packages` para acceder a los paquetes del sistema.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Aspecto | Intel/motion-detection | Detector neuronal (p. ej. YOLO26, citado en la model card) | Modelos de segmentacion de video con IA |
|---|---|---|---|
| Tipo | Vision clasica (MOG2, OpenCV) | Red neuronal de deteccion de objetos | Red neuronal de segmentacion |
| Parametros | No aplicable | No disponible en la informacion | No disponible en la informacion |
| Contexto | No aplicable (fotograma a fotograma) | No aplicable | No aplicable |
| Que aporta | "Algo se mueve" (region generica) | Que objeto se mueve (persona, vehiculo, etc.) | Mascaras por instancia |
| Coste computacional | Muy bajo, CPU | Alto, requiere acelerador | Muy alto, requiere acelerador |
| Licencia | MIT | No disponible en la informacion | No disponible en la informacion |
| Disponibilidad | Repositorio Hugging Face de Intel | No disponible en la informacion | No disponible en la informacion |

La propia model card establece la comparacion funcional: un detector neuronal como YOLO26 es la opcion cuando se necesita saber que se mueve, mientras que la sustraccion de fondo clasica es la opcion mas eficiente y fiable para disparar ante "algo ha cambiado en el fotograma".

## Limitaciones y advertencias

- No identifica clases de objetos: solo detecta regiones de primer plano en movimiento; no distingue personas, vehiculos ni animales.
- Sensible a cambios de iluminacion, sombras fuertes, camaras con movimiento, vegetacion o reflejos, que pueden generar falsos positivos pese a la supresion de sombras y al filtro de area minima de 500 pixeles.
- Requiere un periodo de adaptacion del fondo: los objetos estaticos durante mucho tiempo se incorporan al fondo y dejan de detectarse; los objetos que se detienen tambien pueden perderse.
- El umbral de area (`MIN_AREA = 500`) y los parametros de MOG2 (`history=200`, `varThreshold=25`) son valores de ejemplo y deben ajustarse por escenario.
- Dependencia de un stack en fase de desarrollo: DLStreamer 2026.3.0 RC1 y OpenVINO 2026.5.0.0.dev20261030 son versiones candidatas, no una release estable, con riesgo de cambios de API.
- Documentacion y ejemplos unicamente en ingles.
- No aplicable a NPU; la aceleracion por GPU depende de OpenCL en GPU Intel.
- Riesgo de alucinacion: no aplicable, al no ser un modelo generativo.
- Licencia MIT: permisiva para uso comercial, con obligacion de conservar el aviso de copyright y la licencia; conviene revisar los terminos de las dependencias (OpenCV, OpenVINO, DLStreamer) por separado.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Intel/motion-detection
- Instalacion de OpenVINO: https://docs.openvino.ai/2026/get-started/install-openvino.html
- Guia de instalacion de Intel DLStreamer (Ubuntu): https://docs.openedgeplatform.intel.com/dev/edge-ai-libraries/dlstreamer/get_started/install/install_guide_ubuntu.html
- Pagina corporativa de Intel: https://www.intel.com/content/www/us/en/homepage.html
- Centro de descargas de Intel (drivers y software): https://www.intel.fr/content/www/fr/fr/download-center/home.html
