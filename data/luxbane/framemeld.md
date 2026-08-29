# Luxbane/FrameMeld

## Resumen

FrameMeld no es un modelo de inteligencia artificial en el sentido habitual, sino una aplicación de escritorio para Windows que integra el modelo de interpolación de fotogramas RIFE con codificación acelerada por hardware. Desarrollada por Luxbane, esta herramienta permite aumentar la tasa de fotogramas de un vídeo (por ejemplo, de 24 a 60 fps) mediante interpolación neuronal, y codificar el resultado directamente a AV1, HEVC o H.264 usando los codificadores de hardware de NVIDIA, AMD o Intel, sin necesidad de extraer fotogramas manualmente ni de manejar varias utilidades por separado.

La relevancia actual del proyecto reside en que unifica en una única interfaz gráfica dos tecnologías que normalmente requieren configuraciones complejas: la interpolación de vídeo con RIFE (tanto en su variante CUDA como NCNN/Vulkan) y la codificación final con FFmpeg mediante NVENC, AMF o QSV. El repositorio de HuggingFace aloja el código fuente y los archivos de runtime necesarios, aunque el propio modelo de interpolación RIFE no está incluido en el repositorio; se descarga automáticamente en el primer arranque desde fuentes externas. El tamaño del repositorio es de 1,3 GB, correspondiente en su mayoría a los archivos de runtime empaquetados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Aplicacion de escritorio (Python + PySide6) que integra el modelo de interpolacion RIFE (CUDA o NCNN/Vulkan) y FFmpeg para codificacion |
| Parametros totales | no disponible (el modelo RIFE subyacente no se distribuye en este repositorio) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (procesamiento de video, no texto) |
| Tipos de cuantizacion | no disponible (los pesos de RIFE se gestionan internamente por el motor de interpolacion) |
| Idiomas soportados | no disponible (interfaz grafica en ingles; no se documentan otros idiomas) |
| Licencia | GPL-3.0 (repositorio y codigo fuente); los componentes de terceros (RIFE, FFmpeg, PyTorch) tienen sus propias licencias, detalladas en THIRD_PARTY_LICENSES.md |
| Formato de pesos | no aplica (el repositorio contiene codigo fuente, scripts de build y archivos de runtime empaquetados en .7z; no incluye pesos de red neuronal) |

## Arquitectura y entrenamiento

FrameMeld es una aplicacion de escritorio que actua como envoltorio de dos componentes independientes: el modelo de interpolacion de fotogramas RIFE y FFmpeg. RIFE (Real-Time Intermediate Flow Estimation) es un modelo de red neuronal convolucional disenado para estimar flujo optico y generar fotogramas intermedios entre dos imagenes consecutivas. La aplicacion permite elegir entre dos implementaciones de RIFE: la version CUDA, exclusiva para GPUs NVIDIA y la mas rapida, y la version NCNN, que funciona en GPUs de cualquier fabricante a traves de Vulkan. El entrenamiento de RIFE no esta documentado en este repositorio; se trata de un modelo publicado originalmente por el proyecto RIFE (github.com/hzwer/Practical-RIFE) y cuyos pesos se descargan en el primer arranque desde fuentes externas.

La arquitectura de la aplicacion en si es sencilla: una interfaz PySide6 que gestiona el flujo de trabajo (seleccion de video, eleccion de motor de interpolacion, configuracion del codificador y de la calidad) y lanza los procesos externos de RIFE y FFmpeg. La extraccion de fotogramas se acelera por hardware (NVDEC en NVIDIA, DirectX en otras GPUs) para reducir la carga de CPU. El codigo fuente se compila con PyInstaller y no incluye los binarios de FFmpeg ni los modelos; estos se descargan bajo demanda en el primer uso y se almacenan en `%LOCALAPPDATA%\FrameMeld\runtime\`.

## Capacidades

- Interpolacion de fotogramas de video mediante RIFE, con dos motores intercambiables: RIFE CUDA (NVIDIA, maxima velocidad) y RIFE NCNN (NVIDIA, AMD e Intel via Vulkan).
- Codificacion del resultado directamente a AV1, HEVC o H.264 utilizando codificadores de hardware: NVENC (NVIDIA), AMF (AMD), QSV (Intel) o codificacion por software (SVT-AV1, x265, x264).
- Deteccion automatica de la GPU instalada y desactivacion de las opciones de codificador no soportadas por el hardware.
- Presets especificos por fabricante: p1 a p7 para NVENC, speed/balanced/quality para AMF, y veryfast a veryslow para QSV y software.
- Control de calidad mediante CQ/CRF configurable.
- Extraccion de fotogramas acelerada por hardware (NVDEC en NVIDIA, DirectX en el resto).
- Previsualizacion automatica de informacion del video (resolucion, fps, numero de fotogramas, duracion) al seleccionar el archivo de entrada.
- Generacion automatica de nombre de archivo de salida basado en el formato `{name} {fps}fps.{ext}`.
- Gestion de descargas de runtime en el primer arranque, con descarga independiente de FFmpeg y del motor de interpolacion elegido.
- Limpieza automatica de archivos temporales tras finalizar o cancelar un proceso.

## Casos de uso

- Conversion de video a 60 fps para reproduccion fluida: el usuario selecciona un video de 24 o 30 fps, elige RIFE CUDA (si tiene GPU NVIDIA) y codifica a 60 fps con NVENC en formato HEVC. Adecuado para contenido de cine o animacion donde se busca una reproduccion mas suave.
- Creacion de slow motion de alta calidad: al interpolar entre fotogramas, se puede generar una secuencia a 120 o 240 fps sin artefactos visibles, ideal para videos deportivos o de naturaleza. FrameMeld permite configurar el fps de salida y el codificador, produciendo archivos listos para edicion.
- Restauracion de video antiguo: videos grabados a baja tasa de fotogramas (por ejemplo, 15 fps) pueden interpolarse a 30 o 60 fps, mejorando la percepcion de movimiento en material de archivo.
- Produccion de contenido para plataformas con requisitos de fps especificos: por ejemplo, subir video a 60 fps a YouTube o Twitch. La codificacion directa a AV1 con NVENC (RTX 40+) o AMF reduce el tamano del archivo manteniendo calidad.
- Automatizacion de flujos de trabajo de postproduccion: al ser una herramienta con interfaz grafica y parametros configurables, puede integrarse en pipelines de generacion de contenido donde se necesita un paso de interpolacion consistente, aunque no dispone de interfaz de linea de comandos para integracion total.
- Evaluacion comparativa de codificadores y motores de interpolacion: gracias a la posibilidad de cambiar entre CUDA y NCNN, y entre NVENC, AMF, QSV y software, el usuario puede medir el rendimiento y la calidad de cada combinacion en su hardware especifico, util para decidir la configuracion optima en entornos de produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La aplicacion no incluye metricas de rendimiento propias ni comparativas con otras herramientas de interpolacion. El rendimiento dependera en gran medida de la GPU utilizada, del motor de interpolacion elegido (CUDA suele ser mas rapido que NCNN en GPUs NVIDIA) y del codificador seleccionado (NVENC y AMF ofrecen mayor velocidad que la codificacion por software).

## Requisitos de hardware

- GPU con soporte de codificacion por hardware para el codigo de destino: NVIDIA NVENC (AV1 requiere RTX 40-series o posterior; HEVC/H.264 funcionan en generaciones anteriores), AMD AMF (AV1/HEVC/H.264), Intel QSV (AV1/HEVC/H.264).
- Para interpolacion con RIFE CUDA se requiere una GPU NVIDIA con soporte CUDA. Para RIFE NCNN se admite cualquier GPU con Vulkan (NVIDIA, AMD, Intel).
- Sin hardware de codificacion, se puede usar codificacion por software (SVT-AV1, x265, x264) en cualquier CPU, aunque el proceso sera mas lento.
- La aplicacion esta disenada para Windows (el build genera FrameMeld.exe); no se menciona soporte para Linux o macOS.
- VRAM estimada: no disponible en la documentacion. Depende de la resolucion del video y del modelo RIFE concreto; para resoluciones 1080p, una GPU con 4 GB de VRAM deberia ser suficiente, pero no esta confirmado.
- Opciones de despliegue: aplicacion de escritorio con instalador; no se ofrece servicio web ni API.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados por el autor contra otras herramientas. Como referencia, existen alternativas en el mismo espacio funcional:

| Herramienta | Enfoque | Motor de interpolacion | Codificacion | Licencia |
|---|---|---|---|---|
| FrameMeld | GUI de escritorio | RIFE (CUDA/NCNN) | NVENC, AMF, QSV, software (AV1/HEVC/H.264) | GPL-3.0 |
| Flowframes | GUI de escritorio | RIFE, otras | Depende de configuracion externa | Gratuita, codigo cerrado |
| RIFE (proyecto original) | Linea de comandos / scripts | RIFE | Depende de FFmpeg | MIT (para el codigo) |

La principal diferencia es que FrameMeld integra la codificacion por hardware directamente, mientras que Flowframes suele requerir configurar FFmpeg por separado. No se han encontrado datos de rendimiento comparativos entre ambas.

## Limitaciones y advertencias

- Aplicacion exclusiva para Windows; no hay version para Linux o macOS.
- La licencia GPL-3.0 del repositorio implica que cualquier uso o modificacion del codigo fuente debe mantener la misma licencia y publicar los cambios si se distribuye. Para uso comercial cerrado, esto puede ser una restriccion.
- Los componentes de terceros (RIFE, FFmpeg, PyTorch) tienen sus propias licencias, que deben revisarse en THIRD_PARTY_LICENSES.md antes de redistribuir la aplicacion.
- La descarga de runtime en el primer arranque requiere conexion a internet; en entornos aislados, la instalacion manual de FFmpeg y del modelo RIFE puede ser compleja.
- La interpolacion de fotogramas puede producir artefactos visuales en escenas con movimiento rapido, desenfoque de movimiento extremo o cambios bruscos de iluminacion; la calidad depende del contenido y de la configuracion elegida.
- No se documentan limites de resolucion o duracion de video; videos muy largos o de alta resolucion pueden requerir gran cantidad de VRAM y tiempo de procesamiento.
- El repositorio de HuggingFace no contiene el modelo RIFE en si, solo la aplicacion; los pesos se descargan de fuentes externas, por lo que la reproducibilidad del entorno depende de la disponibilidad de esos recursos.
- No se proporcionan metricas de rendimiento ni benchmarks oficiales, por lo que es dificil predecir tiempos de procesamiento en hardware concreto.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Luxbane/FrameMeld
- Repositorio en GitHub: https://github.com/Luxbane/FrameMeld
- Pagina de releases en GitHub: https://github.com/Luxbane/FrameMeld/releases/latest
- Pagina en itch.io: https://luxbane.itch.io/framemeld
- Proyecto RIFE original: https://github.com/hzwer/Practical-RIFE
- Matriz de soporte de codificacion NVIDIA: https://developer.nvidia.com/video-encode-and-decode-gpu-support-matrix-new
