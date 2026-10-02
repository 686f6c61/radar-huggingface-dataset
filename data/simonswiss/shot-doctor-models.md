# simonswiss/shot-doctor-models

## Resumen

Shot Doctor models es un repositorio de pesos publicado por el desarrollador Simon Vrachliotis (usuario `simonswiss`) que agrupa dos modelos de estimacion de pose pensados para ejecutarse integramente en el navegador. No se trata de un modelo de lenguaje ni de un modelo fundacional nuevo: es un paquete de artefactos de inferencia listos para consumir desde una CDN, empleados por la aplicacion Shot Doctor (shotdoctor.xyz) para analizar tiros en salto de baloncesto a partir de video.

El repositorio contiene dos archivos. El primero es `rtmw-m.onnx`, una conversion a fp16 del checkpoint `rtmw-dw-l-m_simcc-cocktail14_270e-256x192` de la familia RTMW (OpenMMLab MMPose, distribuido a traves de rtmlib), capaz de estimar 133 keypoints de cuerpo completo en orden COCO-WholeBody con una entrada RGB de 256 x 192 pixeles. El segundo es `pose_landmarker_full.task`, el Pose Landmarker (variante full) de Google MediaPipe, incluido sin modificaciones.

La relevancia de esta publicacion es de tipo practico mas que cientifico: demuestra un patron de despliegue de modelos de vision en el cliente, con pesos anclados a un commit concreto y ejecutados sobre WebGPU mediante ONNX Runtime Web 1.30. Para desarrolladores que necesiten estimacion de pose de cuerpo completo sin enviar video a un servidor, el repositorio es un ejemplo directamente reutilizable y con licencia Apache-2.0 en ambos artefactos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Estimacion de pose por deteccion de keypoints; familia RTMPose/RTMW con cabeza SimCC (deducible de las salidas `simcc_x` / `simcc_y`). El backbone concreto no se documenta en la model card |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo de mezcla de expertos) |
| Longitud de contexto | no aplica (modelo de vision; la entrada es una imagen de 256 x 192 pixeles) |
| Tipos de cuantizacion | Pesos del ONNX en fp16 (entradas y salidas se mantienen en fp32); el Pose Landmarker se distribuye como bundle `.task`. No se documentan otras cuantizaciones (int8, etc.) |
| Idiomas soportados | no aplica (no procesa texto) |
| Licencia | Apache-2.0 (ambos artefactos) |
| Formato de pesos | ONNX (`rtmw-m.onnx`, fp16) y MediaPipe task bundle (`pose_landmarker_full.task`) |

## Arquitectura y entrenamiento

`rtmw-m.onnx` deriva de RTMW, la variante whole-body de la familia RTMPose de OpenMMLab, cuyo rasgo mas identificable es la cabeza SimCC: en lugar de mapas de calor 2D, el modelo produce dos distribuciones 1D independientes por eje, `simcc_x` de forma `[N, 133, 384]` y `simcc_y` de forma `[N, 133, 512]`. La coordenada del keypoint en pixeles de entrada se obtiene como el argmax de cada eje dividido entre 2, y la puntuacion de confianza como la media de los dos maximos. Los 133 keypoints cubren cuerpo, pies, cara y manos en orden COCO-WholeBody. La entrada es un tensor float32 `[N, 3, 256, 192]` en RGB, normalizado con media `(123.675, 116.28, 103.53)` y desviacion tipica `(58.395, 57.12, 57.375)`, donde la caja de la persona se ha rellenado con un factor 1.25 y ajustado a una relacion de aspecto 3:4.

El nombre del checkpoint de origen, `rtmw-dw-l-m_simcc-cocktail14_270e-256x192`, sugiere entrenamiento con cabeza SimCC sobre el agregado de 14 conjuntos de datos conocido como cocktail14, durante 270 epocas, con resolucion 256 x 192. La model card no detalla composicion del dataset, numero de tokens ni si hubo ajuste por refuerzo, preferencias o destilacion; esa informacion es no disponible. La unica transformacion aplicada por el autor es la conversion de pesos a fp16 conservando los tipos de entrada y salida en fp32, realizada con `onnxconverter_common.float16.convert_float_to_float16(m, keep_io_types=True)`. El segundo artefacto, `pose_landmarker_full.task`, es el modelo de MediaPipe de Google sin cambios.

## Capacidades

- Deteccion de 133 keypoints de cuerpo completo (cuerpo, pies, cara y manos) en orden COCO-WholeBody con `rtmw-m.onnx`.
- Decodificacion SimCC que devuelve, ademas de la coordenada, una puntuacion de confianza por keypoint (media de los dos maximos por eje).
- Procesamiento de una persona por recorte delimitador: la entrada corresponde a la caja de una persona, por lo que el repositorio no incluye un detector de personas ni seguimiento multi-persona.
- Estimacion de pose alternativa mediante el Pose Landmarker de MediaPipe, en formato `.task`, para los flujos en los que se prefiera el modelo de Google.
- Ejecucion en el navegador del cliente sobre WebGPU con ONNX Runtime Web 1.30, sin backend de inferencia propio.
- Analisis cinematico orientado a la aplicacion original: evaluacion del gesto de tiro en salto de baloncesto.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision general, tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues: ninguna de estas funciones aplica a un modelo de keypoints.

## Casos de uso

- Analisis de tiro de baloncesto en el navegador: es el caso original de Shot Doctor. El modelo recibe el recorte de la persona durante el salto y devuelve la posicion de munecas, codos, hombros y pies, lo que permite calcular angulos articulares fotograma a fotograma sin subir el video a un servidor.
- Correccion postural en tiempo real con webcam: al ejecutarse sobre WebGPU en ONNX Runtime Web, permite comparar la pose del usuario con una pose de referencia y emitir avisos inmediatos sin coste de servidor ni transferencia de imagen.
- Ergonomia y prevencion de riesgos laborales: la deteccion de los 133 keypoints, incluidos manos y pies, permite estimar posturas de trabajo y detectar flexiones mantenidas de tronco o cuello a partir de grabaciones de camaras de seguridad o de una webcam de puesto.
- Rehabilitacion y fisioterapia: el seguimiento de extremidades completas (manos y pies incluidos) sirve para medir rangos de movimiento en ejercicios pautados y comprobar la adherencia del paciente a partir de video domestico.
- Captura de movimiento ligera para animacion: extrayendo keypoints de video y aplicandoles un solucionador de cinematica inversa se obtiene una captura de movimiento de bajo coste para prototipos de animacion o previsualizacion.
- Interaccion persona-ordenador sin contacto: al cubrir cara y manos, el modelo habilita interfaces por gestos y control de puntero en quioscos, pantallas publicas o entornos sanitarios donde no conviene tocar el dispositivo.
- Analisis deportivo generico: la estimacion de pose con puntuacion de confianza por keypoint permite calcular velocidades angulares, tiempos de vuelo y simetria entre lado izquierdo y derecho en saltos, lanzamientos o carreras.
- Educacion fisica y entrenamiento asistido: integrado en una aplicacion web, el modelo puede dar retroalimentacion cuantitativa al alumno (por ejemplo, angulo del codo en el momento de la suelta) sin infraestructura de GPU en el servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye valores de AP sobre COCO-WholeBody ni de ningun otro conjunto, y tampoco se aportan mediciones de latencia o de frames por segundo. No se dispone de datos comparativos de error de keypoint entre `rtmw-m.onnx` y `pose_landmarker_full.task`.

## Requisitos de hardware

- Tamano del repositorio completo: 0,1 GB, incluyendo ambos artefactos.
- El diseno apunta a inferencia en el cliente: el modelo esta pensado para ejecutarse en el navegador del usuario final mediante ONNX Runtime Web 1.30 sobre WebGPU, por lo que no requiere GPU de servidor.
- VRAM estimada: no disponible de forma oficial. Dado el tamano del artefacto y la resolucion fija de entrada de 256 x 192, la huella es reducida y cabe sin problema en cualquier GPU de consumo con WebGPU habilitado, pero no se publican cifras exactas.
- GPU de escritorio: cualquier GPU integrada o dedicada con soporte WebGPU en el navegador; no se documentan pruebas especificas en A100, H100 ni RTX 4090.
- Opciones de despliegue fuera del navegador: las librerias compatibles son `onnxruntime` (CPU) y `onnxruntime-gpu` (CUDA) para el ONNX, y el runtime de MediaPipe para el bundle `.task`. Para inferencia en servidor existen alternativas equivalentes al checkpoint original en OpenMMLab MMPose y rtmlib.
- Latencia y throughput: no disponible. No se publican mediciones de milisegundos por fotograma ni de FPS.
- En dispositivos moviles, el Pose Landmarker de MediaPipe esta disenado para ejecucion en dispositivo, aunque la model card no detalla el rendimiento del bundle incluido en este repositorio.

## Comparativa con modelos similares

| Modelo | Keypoints | Entrada | Formato | Licencia | Rendimiento publicado |
|---|---|---|---|---|---|
| `rtmw-m.onnx` (este repositorio) | 133 (cuerpo, pies, cara, manos) | 256 x 192 RGB | ONNX fp16, E/S fp32 | Apache-2.0 | no disponible |
| `pose_landmarker_full.task` (incluido en el mismo repositorio) | no disponible en la model card | no disponible en la model card | MediaPipe `.task` | Apache-2.0 | no disponible |
| Checkpoint original `rtmw-dw-l-m_simcc-cocktail14_270e-256x192` (OpenMMLab / rtmlib) | 133 | 256 x 192 | ONNX / PyTorch | Apache-2.0 | no disponible en la informacion proporcionada |

No se dispone de datos de rendimiento, parametros ni contexto de otras alternativas de la misma categoria dentro de la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa fiable con modelos como YOLO-pose u otras familias de estimacion de pose.

## Limitaciones y advertencias

- El repositorio no documenta sesgos ni la composicion de cocktail14; en la practica, como cualquier modelo entrenado con datos heterogeneos, puede degradarse ante tipos corporales, tonos de piel, ropa, iluminacion o condiciones de camara poco representados.
- El termino alucinacion no aplica, pero si el fenomeno equivalente: en oclusiones severas el modelo puede emitir keypoints con puntuaciones de confianza poco fiables. La puntuacion es la media de los dos maximos SimCC, no una probabilidad calibrada, y no debe interpretarse como tal.
- La resolucion de entrada es fija en 256 x 192. Sujetos lejanos o pequenos en el encuadre pierden precision, y manos, pies y puntos faciales son los grupos mas afectados.
- El modelo no incluye detector de personas: es necesario aportar el recorte delimitador ya ajustado (relleno 1.25x y relacion 3:4). Sin ese paso previo, no funciona correctamente.
- La conversion de pesos a fp16 puede introducir una perdida marginal de precision respecto al checkpoint original; se conservan entradas y salidas en fp32, pero no se publica ninguna evaluacion comparativa antes y despues de la conversion.
- Ambos artefactos son Apache-2.0, lo que permite uso comercial, pero conviene verificar las licencias de las dependencias de despliegue (ONNX Runtime y MediaPipe) y de la propia aplicacion Shot Doctor.
- El repositorio registra 0 descargas y 0 likes, y fue creado y actualizado el 1 de octubre de 2026 segun los metadatos, lo que lo situa como una publicacion reciente y sin validacion comunitaria independiente.
- No es un modelo de lenguaje: no procede evaluarlo por contexto, idiomas, tool calling ni razonamiento.
- No se documenta versionado semantico ni historial de cambios mas alla de la tabla de archivos de la model card; quien lo consuma desde una CDN deberia anclar a un commit, como hace el propio autor.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/simonswiss/shot-doctor-models
- Aplicacion Shot Doctor: https://www.shotdoctor.xyz
- OpenMMLab MMPose, proyectos RTMPose y RTMW: https://github.com/open-mmlab/mmpose/tree/main/projects/rtmpose
- rtmlib (origen del ONNX de RTMW): https://github.com/Tau-J/rtmlib
- MediaPipe Pose Landmarker (Google): https://ai.google.dev/edge/mediapipe/solutions/vision/pose_landmarker

Nota sobre la busqueda web: los resultados obtenidos (swiss-integrator.ai, mossymodels.com, un hilo de X del autor, dynamicvibe.net y artificialanalysis.ai) no aportan informacion tecnica contrastada sobre este modelo. El unico enlace adicional potencialmente relevante es el perfil del autor en X: https://x.com/simonswiss/status/2099638779648856505
