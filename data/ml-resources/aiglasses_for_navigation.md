# ml-resources/AIGlasses_for_navigation

## Resumen

AIGlasses_for_navigation es un sistema de navegacion asistida para personas con discapacidad visual, publicado originalmente por el usuario archifancy en ModelScope y replicado en HuggingFace por la cuenta ml-resources. No se trata de un modelo de lenguaje con pesos propios, sino de una aplicacion completa que orquesta varios modelos de vision por computador (segmentacion YOLO, deteccion de vocabulario abierto YOLO-E, seguimiento ByteTrack, deteccion de manos MediaPipe) junto con servicios en la nube de Alibaba (ASR Paraformer y dialogo multimodal Qwen-Omni-Turbo) para ofrecer navegacion por lineas de guia podotactil, asistencia en cruces de peatones, busqueda de objetos y conversacion por voz en tiempo real.

El repositorio de HuggingFace ocupa 0,7 GB y contiene tanto los pesos de los detectores (yolo-seg.pt, yoloe-11l-seg.pt, shoppingbest5.pt, trafficlight.pt, hand_landmarker.task) como el codigo de la aplicacion, con licencia MIT. La creacion y la ultima actualizacion del repositorio datan del 15 de octubre de 2026, y en el momento de redactar esta ficha acumula 0 descargas y 0 likes, por lo que se trata de una publicacion reciente y sin traccion medida.

Su relevancia actual es la de un ejemplo de referencia de sistema multimodal embebido (cliente ESP32-CAM mas servidor FastAPI con WebSocket) que combina modelos locales ligeros con APIs comerciales en la nube. Es importante senalar que el propio autor advierte en la model card que el proyecto es solo para aprendizaje e intercambio, y pide explicitamente que no se use directamente con personas con discapacidad visual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No es un modelo unico: pipeline multimodal compuesto por YOLO de segmentacion (linea podotactil), YOLO-E de deteccion de vocabulario abierto, ByteTrack para seguimiento, MediaPipe Hand Landmarker, ASR en nube (DashScope Paraformer) y LLM multimodal en nube (Qwen-Omni-Turbo) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (depende del servicio Qwen-Omni-Turbo, no especificado en la documentacion) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible; la interfaz, los mensajes de voz y los prompts estan en chino |
| Licencia | MIT |
| Formato de pesos | PyTorch `.pt` para los modelos YOLO y `.task` para MediaPipe; no se incluyen safetensors ni GGUF |
| Tamano del repositorio | 0,7 GB |
| Componentes de vision | `yolo-seg.pt` (~50 MB), `yoloe-11l-seg.pt` (~80 MB), `shoppingbest5.pt` (~30 MB), `trafficlight.pt` (~20 MB), `hand_landmarker.task` (~15 MB) |
| Dependencias externas | Clave de API de Alibaba Cloud DashScope (obligatoria para ASR y dialogo) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El sistema se organiza en cuatro capas: una capa cliente (ESP32-CAM, navegador y movil conectados por WebSocket), un servicio principal FastAPI (`app_main.py`) que gestiona rutas WebSocket, distribucion de flujo de audio y video y estado, una capa de aplicacion con los modulos de ASR, cliente Omni y reproduccion de audio, y una capa de coordinacion de navegacion (`navigation_master.py`) implementada como maquina de estados con los modos IDLE, CHAT, BLINDPATH_NAV, CROSSING, TRAFFIC_LIGHT e ITEM_SEARCH. Cada modo activa filtros de instrucciones distintos, de manera que las ordenes irrelevantes se descartan segun el contexto.

En el plano tecnico destacan varios detalles: la deteccion de linea podotactil se estabiliza con flujo optico de Lucas-Kanade para reducir el parpadeo de la mascara de segmentacion; la busqueda de objetos combina deteccion de vocabulario abierto con seguimiento ByteTrack y deteccion de manos de MediaPipe para guiar la mano del usuario hacia el objeto y confirmar el agarre; la deteccion de semaforos se basa en color y forma; y la fusion de datos IMU procedentes del ESP32 alimenta una visualizacion 3D con Three.js. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si los detectores fueron reentrenados o son pesos preentrenados de terceros. No se documenta uso de RLHF ni DPO, ya que la parte conversacional se delega integramente en una API externa.

## Capacidades

- Navegacion por linea podotactil con deteccion de obstaculos, planificacion de evitacion y aviso anticipado de giros cerrados.
- Asistencia en cruces: deteccion de paso de cebra y de su orientacion, alineacion guiada con el centro del paso y reconocimiento del estado del semaforo con aviso de via libre.
- Busqueda de objetos por voz ("buscar una lata de refresco"), con deteccion de vocabulario abierto y seguimiento en tiempo real.
- Guia manual para el agarre del objeto mediante deteccion de manos y verificacion del gesto de presion.
- Reconocimiento automatico de voz en tiempo real mediante DashScope Paraformer.
- Dialogo multimodal (imagen mas texto) con salida de voz mediante Qwen-Omni-Turbo.
- Clasificacion automatica de la intencion del usuario en ordenes de navegacion, busqueda o conversacion.
- Contexto conversacional multi-turno y filtrado de instrucciones segun el modo activo.
- Retransmision de video en directo por WebSocket con varios clientes simultaneos y panel de estado con FPS e informacion de deteccion.
- Grabacion sincronizada de audio y video con marca de tiempo.
- Fusion de datos IMU del ESP32 y representacion 3D de la orientacion del dispositivo.
- Mezcla de varias fuentes de audio (voz del sistema, respuesta de la IA y sonido ambiente).
- No se documentan capacidades de generacion de codigo, matematicas ni tool calling como tales.

## Casos de uso

- Navegacion asistida en interiores y exteriores: el sistema procesa el flujo de la camara a baja latencia y emite ordenes de "izquierda", "derecha" o "sigue recto" basadas en la mascara de segmentacion estabilizada por flujo optico, lo que resulta adecuado para recorridos con linea podotactil continua.
- Asistencia en pasos de peatones: el modo CROSSING detecta la cebra, guia la alineacion con su centro y espera la deteccion de semaforo en verde antes de autorizar el avance, cubriendo el escenario de mayor riesgo de un desplazamiento urbano autonomo.
- Localizacion de objetos personales: mediante una orden de voz, el modulo de busqueda activa deteccion de vocabulario abierto y ByteTrack para dirigir la mano del usuario hasta el objeto, util en domicilios y comercios.
- Desarrollo de prototipos de vision wearable: al estar liberado bajo MIT, sirve como base para equipos de investigacion que quieran sustituir el ESP32-CAM por otro hardware o cambiar los detectores por versiones propias.
- Plataforma de ensayo de arquitecturas cliente-servidor en tiempo real: el uso de FastAPI con WebSocket para audio, video e IMU concurrentes es un ejemplo reutilizable en otros proyectos de teleoperacion o telemetria.
- Interfaz conversacional por voz manos libres: la combinacion de ASR en nube con un LLM multimodal permite construir asistentes de voz contextuales en espanol u otros idiomas cambiando la configuracion del servicio, aunque la interfaz actual es en chino.
- Demo educativa de maquina de estados para robotica asistiva: los seis modos y su logica de filtrado de instrucciones son material didactico para cursos de sistemas embebidos y vision artificial.
- Investigacion sobre accesibilidad: permite medir latencias y tasas de error de un pipeline con modelos locales y APIs en nube en condiciones de movilidad real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de precision, recall, IoU, WER del ASR ni latencias medidas para ninguno de los modulos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. Los pesos suman aproximadamente 195 MB en total (unos 50 MB para la segmentacion de linea podotactil, 80 MB para YOLO-E, 30 MB para reconocimiento de objetos, 20 MB para semaforos y 15 MB para manos), por lo que la huella de memoria de los detectores es reducida, aunque no se documenta el consumo real en ejecucion.
- GPU recomendada por el autor: NVIDIA con CUDA 11.8 o superior, RTX 3060 o superior.
- CPU: Intel i5 o superior, con recomendacion de i7/i9.
- Memoria RAM: 8 GB minimo, 16 GB recomendado.
- Almacenamiento: 10 GB de espacio libre.
- Compatibilidad con GPU de consumo: si, el autor situa la RTX 3060 como referencia minima; no se mencionan A100 ni H100.
- Sistemas operativos soportados: Windows 10/11, Linux Ubuntu 20.04 o superior, macOS 10.15 o superior.
- Entornos de ejecucion: aplicacion Python propia con FastAPI y Uvicorn; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que el modelo conversacional se consume como API remota.
- Requisitos de software: Python 3.9 a 3.11, CUDA 11.8 o superior para aceleracion por GPU, navegador Chrome 90+, Firefox 88+ o Edge 90+ para la consola de monitorizacion.
- Hardware cliente opcional: ESP32-CAM u otra camara compatible con WebSocket, microfono y altavoz o auriculares.
- Latencia y throughput estimados: no disponibles. Dependen de la red y del servicio DashScope, no cuantificados en la documentacion.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados para este sistema en la informacion proporcionada. La tabla siguiente recoge unicamente los componentes individuales identificados en la model card, con los datos disponibles, sin metricas de rendimiento.

| Componente | Funcion | Tamano de pesos | Licencia | Datos de rendimiento |
|---|---|---|---|---|
| yolo-seg.pt | Segmentacion de linea podotactil | ~50 MB | no disponible (heredada del proyecto, MIT en el repositorio) | no disponible |
| yoloe-11l-seg.pt | Deteccion de vocabulario abierto | ~80 MB | no disponible | no disponible |
| shoppingbest5.pt | Reconocimiento de objetos | ~30 MB | no disponible | no disponible |
| trafficlight.pt | Deteccion de semaforos | ~20 MB | no disponible | no disponible |
| hand_landmarker.task | Deteccion de manos (MediaPipe) | ~15 MB | Apache 2.0 (MediaPipe, segun la documentacion de Google) | no disponible |
| Qwen-Omni-Turbo | Dialogo multimodal y salida de voz | API remota | propietaria (Alibaba Cloud) | no disponible |
| DashScope Paraformer | Reconocimiento automatico de voz | API remota | propietaria (Alibaba Cloud) | no disponible |

## Limitaciones y advertencias

- El propio autor indica en la model card que el proyecto es unicamente para aprendizaje e intercambio y pide explicitamente que no se use directamente con personas con discapacidad visual. Es un aviso critico dado el caracter de seguridad del dominio.
- Dependencia obligatoria de una clave de API de Alibaba Cloud DashScope: sin ella no funcionan ni el reconocimiento de voz ni el dialogo, lo que introduce dependencia de red, coste por uso, latencia variable y envio de audio e imagenes a un servicio de terceros.
- Repositorio espejo no oficial: el contenido procede de archifancy en ModelScope y la cuenta que lo publica declara no ser un lanzamiento oficial de los autores originales.
- Los enlaces de descarga de varios pesos (`yolo-seg.pt`, `yoloe-11l-seg.pt`, `shoppingbest5.pt`, `trafficlight.pt`) aparecen como "待补充" (pendiente de completar) en la documentacion original, lo que puede impedir la reproduccion completa del sistema.
- Interfaz, mensajes de voz y prompts en chino: no se documenta soporte multilingue ni localizacion.
- Sin benchmarks ni evaluacion publicada: no hay datos de precision, recall ni tasas de error para ningun modulo, lo que impide estimar su fiabilidad en condiciones reales.
- Riesgo de alucinacion en la parte conversacional: al delegar el dialogo en un LLM multimodal externo, las respuestas pueden ser incorrectas o inventadas, un riesgo especialmente sensible si se confunden con instrucciones de navegacion.
- Riesgo de fallo silencioso en vision: la deteccion de semaforos basada en color y forma es sensible a condiciones de iluminacion adversas, oclusiones y variaciones regionales de la senalizacion, sin que se documenten pruebas en estos escenarios.
- Licencia MIT en el repositorio, lo que en principio permite uso comercial del codigo, pero las condiciones de los pesos de terceros (YOLO, YOLO-E, MediaPipe) y del servicio en nube deben verificarse por separado antes de un despliegue productivo.
- Cero descargas y cero likes en HuggingFace: no existe validacion externa ni comunidad que haya reportado resultados.
- Proyecto sin actualizaciones registradas despues de la fecha de creacion del espejo (15 de octubre de 2026).

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/ml-resources/AIGlasses_for_navigation
- Modelo original en ModelScope: https://www.modelscope.cn/models/archifancy/AIGlasses_for_navigation
- Codigo fuente en GitHub: https://github.com/AI-FanGe/OpenAIglasses_for_Navigation.git
- Consola de Alibaba Cloud DashScope (clave de API): https://dashscope.console.aliyun.com/
- Modelos de MediaPipe Hand Landmarker: https://developers.google.com/mediapipe/solutions/vision/hand_landmarker#models
- Guia de instalacion de NVIDIA CUDA Toolkit: https://developer.nvidia.com/cuda-downloads
- Las busquedas web realizadas no han devuelto resultados relevantes sobre este sistema; los resultados obtenidos correspondian a otros significados de la sigla "ML" y no se han incluido.
