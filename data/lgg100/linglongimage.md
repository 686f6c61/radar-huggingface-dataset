# LGG100/linglongimage

## Resumen

LGG100/linglongimage es una imagen Docker que empaqueta el sistema de retargeting de movimiento (motion retargeting) en tiempo real denominado LingLong 2.0, desarrollado por el autor LGG100 en el contexto de la competición OpenLoong（大师赛第一期·赛题一·复赛）. El sistema toma una señal de vídeo RGB monoculo (por ejemplo, una webcam o un fichero de vídeo) y la transforma en movimiento articulado para el robot humanoide LingLong 2.0, usando su modelo cinemático URDF oficial.

No se trata de un modelo de lenguaje ni de un modelo multimodal conversacional, sino de un pipeline de percepción y retargeting robótico distribuido como contenedor. La imagen está construida específicamente para GPUs NVIDIA RTX 50xx (arquitectura Blackwell, sm_120), sobre una base CUDA 12.8 y torch 2.7.1+cu128, e incluye los pesos de modelo ya integrados en el propio contenedor.

Su relevancia radica en que agrupa en un único artefacto reproducible varios componentes de percepción de última generación (reconstrucción 3D corporal, estimación de pose y estimación de geometría monocular) junto con el modelo del robot, reduciendo la fricción de despliegue para experimentación en robótica humanoide. Es un artefacto muy reciente y con nula tracción en el momento de redactar esta ficha (0 descargas, 0 likes).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sistema de motion retargeting monocular; pipeline compuesto por SAM 3D Body (backbone DINOv3), YOLO11m-pose, MoGe-2 ViT-S y el modelo URDF+meshes de LingLong 2.0 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica a este tipo de sistema) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | sam-license (license: other), enlace a LICENSE_SAM en el repo |
| Formato de pesos | Pesos incluidos dentro de la imagen Docker (linglong-live.tar); formato de fichero no especificado |
| Tamano del repositorio | 8,7 GB |
| Pipeline declarado | robotics |
| Requisitos de host | Linux, GPU NVIDIA (>= 8 GB), nvidia-container-toolkit |
| Stack CUDA / PyTorch | CUDA 12.8, torch 2.7.1+cu128 |
| GPU objetivo | NVIDIA RTX 50xx (Blackwell, sm_120) |
| Fecha de creacion / actualizacion | 2026-10-11 |

## Arquitectura y entrenamiento

La informacion disponible no describe el entrenamiento de un modelo propio. La imagen empaqueta un sistema de inferencia que combina varios modelos preentrenados de terceros: SAM 3D Body (`facebook/sam-3d-body-dinov3`) para la reconstruccion 3D del cuerpo, YOLO11m-pose de Ultralytics para la deteccion y estimacion de keypoints 2D, y MoGe-2 ViT-S (`Ruicheng/moge-2-vits-normal`) para la estimacion de geometria monocular. Sobre esa base, el sistema realiza el retargeting hacia el modelo cinematico (URDF y meshes) de LingLong 2.0, que se incluye sin modificar tal como se publico en la competicion.

No se proporcionan datos sobre el numero de tokens, composicion de dataset, ni procesos de alineacion tipo RLHF/DPO, ya que no aplica a este tipo de sistema. Tampoco se detalla la innovacion algorítmica concreta del retargeting (resolucion de cinematica inversa, compensacion de proporciones, filtrado temporal, etc.), mas alla de que el pipeline es monoculo y opera en tiempo real.

## Capacidades

- Captura de movimiento sin marcadores (markerless) a partir de una unica camara RGB monoculo.
- Reconstruccion 3D de cuerpo humano mediante SAM 3D Body.
- Estimacion de pose y keypoints 2D/3D mediante YOLO11m-pose y MoGe-2.
- Retargeting del movimiento humano capturado al modelo cinematico del robot humanoide LingLong 2.0.
- Entrada desde webcam en directo (`--source 0`) o desde fichero de video.
- Modo con ventana grafica (requiere X11) y modo headless.
- Grabacion de la salida en video (`--record`) y registro de datos en CSV (`--log`).
- Distribucion autocontenida: pesos de modelo incluidos en la imagen, sin descargas adicionales en tiempo de ejecucion.
- Cache de compilacion de kernels de GPU en el volumen `linglong_cache` para acelerar arranques posteriores.
- No se documentan capacidades de generacion de texto, razonamiento, codigo, tool calling ni agentes.

## Casos de uso

- Teleoperacion de un robot humanoide LingLong 2.0: el sistema traduce en tiempo real el movimiento de un operador captado por webcam a las articulaciones del robot, lo que permite control por imitacion sin dispositivos de captura especializados.
- Captura de movimiento para animacion y grafismo: uso del pipeline monoculo para generar trayectorias articuladas a partir de video, exportables como video de salida y CSV para su posterior procesado.
- Investigacion en retargeting humanoide: banco de pruebas reproducible en Docker para evaluar algoritmos de retargeting sobre el URDF oficial de LingLong 2.0 sin necesidad de reconstruir el entorno.
- Generacion de datasets de movimiento: grabacion sistematica de pares entrada RGB / salida articulada (`--record` y `--log`) para entrenar o validar modelos de control.
- Demostraciones en competiciones de robotica: dado que proviene de la OpenLoong 大师赛, el contenedor sirve como entorno de referencia para replicar la solucion presentada en ese certamen.
- Validacion en laboratorio de bajo coste: al requerir solo una GPU con 8 GB de VRAM, permite montar un puesto de captura monocular en hardware de gama media-alta sin equipos de mocap dedicados.
- Despliegue headless en servidores: la ejecucion sin interfaz grafica facilita la integracion en nodos de computo remotos que procesan videos por lotes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma desglosada; el autor indica un minimo de 8 GB de memoria de GPU.
- GPU recomendadas: NVIDIA RTX 50xx (Blackwell, sm_120), que es el objetivo declarado de compilacion. Otras generaciones no estan confirmadas como compatibles.
- Cabe en GPU de consumo: si, segun el requisito de >= 8 GB, aunque la compatibilidad esta acotada a la arquitectura Blackwell segun la documentacion.
- Host: Linux con `nvidia-container-toolkit` instalado.
- Opciones de despliegue: Docker (`docker load` de `linglong-live.tar`), con soporte de `--gpus all`, `--ipc=host` y `--network host`. Para salida grafica requiere `xhost` y montaje de `/tmp/.X11-unix` y `/dev/video0`.
- Latencia y throughput: no disponibles. Se menciona que el primer frame compila kernels de GPU (con cache persistente en el volumen `linglong_cache`), lo que introduce una penalizacion inicial.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparables en la informacion proporcionada. Como referencia estructural, la imagen integra componentes de terceros que pueden consultarse por separado:

| Componente | Funcion en el pipeline | Licencia |
|---|---|---|
| SAM 3D Body (`facebook/sam-3d-body-dinov3`) | Reconstruccion 3D corporal | SAM License |
| YOLO11m-pose (Ultralytics) | Deteccion y pose 2D | AGPL-3.0 |
| MoGe-2 ViT-S (`Ruicheng/moge-2-vits-normal`) | Geometria monocular | no disponible en la informacion |
| LingLong 2.0 URDF + meshes | Modelo cinematico del robot | Lanzamiento oficial de competicion |

No se identifican en la informacion productos equivalentes de retargeting monocular para el mismo robot con los que establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, codigo ni razonamiento; cualquier expectativa en ese sentido es inaplicable.
- La licencia es `sam-license` (license: other) con fichero `LICENSE_SAM`; el uso comercial queda sujeto a los terminos de dicha licencia, no detallados en la informacion disponible.
- La imagen incluye material de terceros con licencias potencialmente incompatibles con uso comercial: YOLO11m-pose esta bajo AGPL-3.0, lo que puede imponer obligaciones de copyleft sobre el conjunto distribuido.
- La compatibilidad declarada se limita a GPUs RTX 50xx (Blackwell, sm_120) con CUDA 12.8; en otras arquitecturas puede no funcionar sin recompilacion.
- La primera ejecucion incurre en tiempo de compilacion de kernels, lo que afecta al arranque en frio.
- No se especifican idiomas soportados ni datos de sesgo; al operar sobre senales de video, el sesgo de los modelos de vision subyacentes (SAM 3D Body, YOLO11m-pose, MoGe-2) puede afectar a la precision segun condiciones de iluminacion, oclusiones o diversidad corporal.
- Riesgo de estimacion incorrecta de pose y, por extension, de retargeting erroneo en el robot; no se documentan mecanismos de seguridad fisica para la teleoperacion de hardware real.
- Repositorio sin descargas ni likes en el momento de redactar la ficha, lo que implica ausencia de validacion externa por parte de la comunidad.
- El repositorio tiene un tamano de 8,7 GB, lo que exige espacio en disco y ancho de banda considerables para su descarga.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/LGG100/linglongimage
- Licencia SAM: https://huggingface.co/LGG100/linglongimage/blob/main/LICENSE_SAM
- SAM 3D Body (componente): https://huggingface.co/facebook/sam-3d-body-dinov3
- MoGe-2 ViT-S (componente): https://huggingface.co/Ruicheng/moge-2-vits-normal
- YOLO11m-pose de Ultralytics (componente, AGPL-3.0): no se proporciona enlace en la informacion disponible
