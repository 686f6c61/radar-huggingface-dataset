# Serqan/MotionSmith-Mocap-Runtime

## Resumen

MotionSmith Mocap Runtime no es un modelo de IA entrenado, sino un paquete de software empaquetado y distribuido a traves de Hugging Face. Se trata de un runtime para Windows x64 que da soporte a la extension MotionSmith Mocap de Blender, orientado a captura de movimiento (motion capture) a partir de video. El autor es Serqan, y la licencia es un compendio de licencias de componentes (`motionsmith-component-licenses`) que combina codigo propietario de MotionSmith AI con dependencias de terceros.

El paquete incluye un entorno Python 3.12.10 aislado (sin necesidad de instalacion de Python en el sistema), PyTorch 2.11.0 compilado contra CUDA 12.8, el worker de captura de MotionSmith y una configuracion de captura basada en el detector YOLOX COCO de Megvii. El runtime en si no contiene pesos de modelo: el directorio `weights/` solo incluye un fichero de configuracion, y los pesos (NVIDIA GEM-X, NVIDIA SOMA-X y el detector YOLOX) deben descargarse por separado desde sus proveedores oficiales.

Su relevancia es practica mas que de investigacion: resuelve el problema de empaquetar y aislar un pipeline de captura de movimiento basado en modelos de vision y reconstruccion corporal dentro de Blender, evitando que las importaciones pesadas de PyTorch se ejecuten en el hilo de la aplicacion anfitriona. El repositorio ocupa 3,1 GB y esta etiquetado como `region:us`, con cero descargas y cero likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No es un modelo neuronal; es un runtime de software (worker de captura + dependencias Python/PyTorch). El pipeline subyacente usa GEM-X, SOMA-X y YOLOX COCO |
| Parametros totales | No disponible (no aplica: no se distribuyen pesos de modelo) |
| Parametros activos | No disponible (no aplica) |
| Longitud de contexto | No disponible (no aplica) |
| Tipos de cuantizacion | No disponible (no aplica) |
| Idiomas soportados | No disponible (no aplica; el runtime es una aplicacion, no un modelo linguistico) |
| Licencia | `motionsmith-component-licenses` (licencia mixta: codigo de MotionSmith AI propietario, componentes de terceros con sus propias licencias) |
| Formato de pesos | No disponible (no se incluyen pesos; el archivo distribuido es un ZIP de Windows x64 de 3.141.367.826 bytes) |

## Arquitectura y entrenamiento

El paquete no entrena ningun modelo. Su funcion es orquestar un pipeline de captura de movimiento compuesto por tres piezas externas: el modelo GEM-X de NVIDIA (estimacion de cuerpo y movimiento, con ficheros `body_s240000.ckpt`, `vitpose.pth` y `motion_native77_e774_s292175.ckpt`), los assets de geometria SOMA-X de NVIDIA (version nativa v0.3.3) y el detector de personas YOLOX COCO de Megvii (`yolox_x.onnx`). El worker de MotionSmith ejecuta la inferencia en un proceso separado del de Blender, de modo que las importaciones pesadas de PyTorch y CUDA no bloquean la interfaz del editor.

La validacion declarada por el autor se realizo sobre Windows con una RTX 5070 Ti y los prerrequisitos externos de FFmpeg y drivers: se extrajo el archivo en una ruta con espacios, se verifico la importacion de Python y paquetes con variables `PYTHONHOME`/`PYTHONPATH` invalidadas deliberadamente, se ejecuto una captura real de 60 fotogramas a 30 fps con el flujo GEM -> Contact/IK -> SOMA77 BVH y se comprobo la lectura de 78 joints con transformaciones finitas y rotaciones correctas. El propio autor advierte que no es una certificacion de maquina limpia ni de todas las GPU.

## Capacidades

- Captura de movimiento corporal a partir de video, mediante el pipeline GEM-X + SOMA-X, con salida en formato BVH (78 joints verificados).
- Deteccion de personas en imagen con YOLOX COCO (`yolox_x.onnx`), con configuracion por defecto que evita el detector Human-Art por su caracter no comercial.
- Ejecucion aislada del worker de captura en un proceso separado de Blender, con reserva compartida de GPU gestionada por MotionSmith.
- Entorno Python 3.12.10 autocontenido para Windows x64, sin dependencia de una instalacion de Python del sistema.
- Soporte de ejecucion local y offline una vez instalados los assets de modelo.
- Integracion como backend de la extension MotionSmith Mocap para Blender mediante configuracion de Runtime Root y Backend folder.
- No incluye capacidades de generacion de texto, razonamiento, codigo, vision general, tool calling ni agentes: es un componente de captura de movimiento.

## Casos de uso

- Captura de movimiento para animacion en Blender: el usuario graba video de un interprete y el runtime produce un BVH de 78 joints que puede importarse como animacion esqueletica, evitando el coste de un estudio de mocap dedicado.
- Previsualizacion rapida de animaciones: al ejecutarse en un worker separado, permite iterar sobre tomas sin bloquear la interfaz de Blender durante la inferencia.
- Produccion de animacion independiente: al no requerir Python del sistema y funcionar offline, encaja en estaciones de trabajo Windows x64 con GPU NVIDIA consumer, como la RTX 5070 Ti usada en la validacion.
- Integracion en pipelines de postproduccion: la salida BVH es un formato estandar que puede procesarse con herramientas DCC convencionales para retargeting y edicion.
- Entornos con requisitos de aislamiento: el empaquetado autocontenido y la ausencia de descargas automaticas de modelos facilitan el despliegue en maquinas con politicas restrictivas de red.
- Investigacion en vision por computador aplicada: sirve como entorno reproducible para probar los modelos GEM-X y SOMA-X de NVIDIA sobre video propio, sustituyendo los pesos por los oficiales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica de validacion declarada es funcional: una captura de 60 fotogramas a 30 fps completada con exito en una RTX 5070 Ti, con lectura de 78 joints en BVH.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Depende de los pesos externos de GEM-X, SOMA-X y YOLOX, que no se distribuyen en el paquete.
- GPU recomendadas: no disponible de forma oficial; la validacion se realizo en una NVIDIA RTX 5070 Ti con CUDA 12.8.
- Compatibilidad con GPU consumer: el autor valida explicitamente una GPU consumer (RTX 5070 Ti), pero advierte que no es una certificacion para todas las GPU.
- Driver: se requiere un driver NVIDIA compatible con CUDA 12.8.
- Software adicional obligatorio: FFmpeg disponible en `PATH` y Microsoft Visual C++ x64 Runtime.
- Opciones de despliegue: extraccion del ZIP en una carpeta escribible fuera de AppData y configuracion de Runtime Root y Backend folder en las preferencias de MotionSmith Mocap. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles; solo se conoce la validacion de 60 fotogramas a 30 fps sin cifras de tiempo.

## Comparativa con modelos similares

| Aspecto | MotionSmith Mocap Runtime | NVIDIA GEM-X (pesos) | NVIDIA SOMA-X (assets) |
|---|---|---|---|
| Tipo | Runtime de software empaquetado | Modelo de estimacion de cuerpo/movimiento | Assets de geometria y esqueleto |
| Parametros | No aplica | No disponible | No aplica |
| Contexto | No aplica | No disponible | No aplica |
| Licencia | Mixta, propietaria + terceros | Terminos del proveedor (NVIDIA) | Terminos del proveedor (NVIDIA) |
| Disponibilidad | ZIP Windows x64 en Hugging Face | Hugging Face (nvidia/GEM-X) | Hugging Face (nvidia/SOMA-X) |

No se dispone de informacion sobre alternativas de runtime equivalentes para mocap en Blender, por lo que la comparativa se limita a los componentes que el propio paquete integra.

## Limitaciones y advertencias

- No es un modelo entrenado: cualquier evaluacion de calidad, sesgos o alucinacion debe hacerse sobre los pesos externos de GEM-X, SOMA-X y YOLOX, no sobre este repositorio.
- El runtime no descarga modelos automaticamente; sin instalar manualmente los assets en `weights/` y `soma/`, el pipeline no funciona.
- Requiere Windows x64 exclusivamente; no se documenta soporte para Linux ni macOS.
- Depende de CUDA 12.8 y de un driver NVIDIA compatible; no se garantiza funcionamiento en GPU AMD o Intel.
- La validacion se realizo en una unica GPU (RTX 5070 Ti) y no constituye una certificacion de maquina limpia ni de todas las GPU.
- Licencia mixta y restrictiva: el codigo de MotionSmith AI es propietario con todos los derechos reservados, y los componentes de terceros conservan sus propias licencias; el archivo no concede licencia sobre los pesos obtenidos por separado.
- La configuracion por defecto evita el detector Human-Art por su caracter no comercial, lo que puede limitar la deteccion en escenarios no cubiertos por COCO.
- No se incluyen FFmpeg, Blender, footage ni proyectos de usuario; su ausencia puede impedir la ejecucion si no se instalan aparte.
- El repositorio presenta cero descargas y cero likes, sin historial de uso comunitario que permita contrastar la validacion del autor.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Serqan/MotionSmith-Mocap-Runtime
- Descarga del runtime 1.0.0 Windows x64: https://huggingface.co/Serqan/MotionSmith-Mocap-Runtime/resolve/main/MotionSmith-Mocap-Runtime-1.0.0-windows-x64.zip?download=true
- Seccion de licencias de la model card: https://huggingface.co/Serqan/MotionSmith-Mocap-Runtime/blob/main/README.md#licensing
- NVIDIA GEM-X: https://huggingface.co/nvidia/GEM-X
- NVIDIA SOMA-X: https://huggingface.co/nvidia/SOMA-X
- Megvii YOLOX: https://github.com/Megvii-BaseDetection/YOLOX
