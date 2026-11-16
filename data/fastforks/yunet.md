# fastforks/yunet

## Resumen

YuNet es un detector de rostros anchor-free con cinco puntos faciales de referencia, publicado por Wu et al. en *Machine Intelligence Research* (2023) y desarrollado originalmente en el repositorio libfacedetection de Shiqi Yu. Con tan solo 75 000 parametros, es la red que hay detras de `FaceDetectorYN` de OpenCV (OpenCV Zoo `face_detection_yunet`), lo que lo convierte en uno de los detectores faciales mas desplegados del ecosistema de vision por computador. Esta ficha cubre la distribucion `fastforks/yunet`, un contenedor de model card que no aloja pesos propios: descarga los checkpoints de los autores y los verifica contra hashes SHA-256.

El modelo resuelve deteccion de rostros y localizacion de cinco landmarks (ojos, nariz y comisuras de la boca) en una sola pasada, con un backbone depthwise-separable, una FPN top-down minima y cabezas por celda de clase, objectness, caja y landmarks sobre los mapas de stride 8, 16 y 32. Acepta la imagen completa a su tamano nativo, rellenada a multiplos de 32, replicando el protocolo de evaluacion sobre WIDER FACE de los autores.

Su relevancia actual es la eficiencia extrema: infiere una imagen de 1080x1920 en 2,0-3,0 ms en una RTX 5060 Ti con un pico de memoria de 84-96 MiB, y mantiene AP de caja facial de 0,894/0,883/0,810 (easy/medium/hard) en WIDER FACE val para la variante `yunet-n`. La licencia BSD-3-Clause permite uso comercial. Nota importante: pese a la etiqueta `pipeline_tag: keypoint-detection` y a los tags de pose, la red es un detector facial con landmarks, no un estimador de pose corporal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN anchor-free con backbone depthwise-separable, FPN top-down minima y cabezas por celda (clase, objectness, caja, landmarks) en strides 8/16/32 |
| Parametros totales | 75 000 (aproximadamente, segun Wu et al. 2023) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada de cualquier H x W >= 32, relleno a multiplo de 32) |
| Tipos de cuantizacion | fp32 y fp16 documentados; TensorRT fp16; otras cuantizaciones no disponibles |
| Idiomas soportados | no aplica (modelo de vision) |
| Licencia | BSD-3-Clause (codigo y pesos, uso comercial permitido) |
| Formato de pesos | `.pth` (PyTorch) de los autores, verificados por SHA-256; exportacion a ONNX y engine TensorRT documentada |

## Arquitectura y entrenamiento

YuNet es una red convolucional puramente feed-forward, sin componentes transformer ni mecanismos de atencion. El backbone usa convoluciones depthwise-separables para reducir el coste computacional, seguido de una FPN top-down muy ligera que fusiona los mapas de stride 8, 16 y 32. Sobre cada nivel, cabezas por celda predicen clase, objectness, offsets de caja y cinco landmarks faciales. El modelo es anchor-free y procesa la imagen completa sin redimensionar, con padding a multiplos de 32. La API `module()` exporta unicamente los mapas crudos por nivel; la decodificacion y el NMS quedan fuera del grafo exportado.

El entrenamiento se realizo desde cero sobre WIDER FACE (32 000 imagenes, 394 000 rostros etiquetados), usando las anotaciones de cinco landmarks de SCRFD (labelv2). No se documenta en la informacion disponible el uso de RLHF, DPO ni tecnicas de alineacion, algo esperable en un detector de vision. La innovacion tecnica principal es la relacion precision/tamano: 75k parametros con AP cercano a 0,89 en WIDER FACE easy, y latencias sub-3 ms en GPU consumer. La distribucion fastforks anade backends `portable` y `kernels`, con paridad numerica verificada frente al codigo original (max |diff| <= 0,001 en CPU fp32; error absoluto medio <= 0,1 y p99 <= 0,3 en GPU fp16 sobre los keypoints).

## Capacidades

- Deteccion de rostros con cajas delimitadoras y scores de confianza por rostro.
- Localizacion de cinco landmarks faciales (keypoints) por rostro detectado.
- Procesamiento de imagenes a resolucion nativa sin redimensionado, con padding a multiplos de 32.
- Entrada de un unico RGB con una caja por persona; salida de keypoints, `keypoint_scores`, `boxes` y `scores`.
- Dos variantes de capacidad: `yunet-n` (mayor precision) y `yunet-s` (menor coste).
- Backends `portable` (PyTorch) y `kernels` (kernel optimizado), con exportacion a ONNX y TensorRT.
- Soporte de fp16 en GPU y fp32 en CPU con paridad verificada frente al codigo original.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues: es un modelo de vision puro.

## Casos de uso

- **Deteccion facial en tiempo real en video**: con 2,0-3,0 ms por frame a 1080x1920 en una RTX 5060 Ti, el modelo puede procesar multiples streams de camara a 30 fps o mas dentro de un pipeline de videovigilancia o analitica retail, usando `boxes` y `scores` para el conteo y seguimiento de personas.
- **Preprocesado para reconocimiento facial**: los cinco landmarks permiten alinear y recortar rostros antes de pasarlos a un modelo de embeddings (ArcFace, FaceNet). El coste de 75k parametros hace viable ejecutar la deteccion en el mismo dispositivo que el reconocedor.
- **Integracion en aplicaciones OpenCV existentes**: al ser la red detras de `FaceDetectorYN`, se puede sustituir o validar el detector de OpenCV Zoo con estos checkpoints verificados por SHA-256, manteniendo el mismo protocolo de evaluacion (score 0,02, NMS IoU 0,45).
- **Despliegue en edge y dispositivos embebidos**: el pico de memoria de 84-96 MiB y el tamano de pesos minimo permiten ejecutarlo en GPUs de gama baja o en CPU via exportacion ONNX, por ejemplo en kioscos interactivos o camaras IP con computo limitado.
- **Anonimizacion y moderacion de contenido**: deteccion de rostros para difuminar caras en imagenes y videos antes de su publicacion, o para filtrar contenido en plataformas UGC, con licencia BSD-3-Clause que permite uso comercial sin restricciones de atribucion mas alla de la propia licencia.
- **Control de calidad en captura biometrica**: verificacion de que un rostro esta presente, centrado y con landmarks visibles antes de disparar una captura en apps de onboarding digital o verificacion de identidad.
- **Procesamiento por lotes de imagenes de alta resolucion**: el modelo ha sido probado hasta 3000x4000 con 0,5 GiB de pico, lo que permite procesar fotografia de alta resolucion sin redimensionar y detectar rostros pequenos que se perderian con downscaling.

## Benchmarks y rendimiento

Precision en WIDER FACE val (cada cuarta imagen, 807 imagenes; AP a IoU 0,5 con score 0,02 y NMS IoU 0,45):

| Variante | Dataset | Original fp32 | portable | kernels |
|---|---|---|---|---|
| `yunet-n` | WIDER FACE val, AP easy / medium / hard | 0,894 / 0,883 / 0,810 | 0,893 / 0,883 / 0,810 | 0,894 / 0,883 / 0,810 |
| `yunet-s` | WIDER FACE val, AP easy / medium / hard | 0,885 / 0,868 / 0,764 | 0,885 / 0,868 / 0,764 | 0,885 / 0,868 / 0,764 |

Latencia y memoria en pose sintetica 1080x1920 (RTX 5060 Ti 16 GB, sm_120):

| Variante | Original (ms) | portable (ms) | kernels (ms) | Aceleracion kernels vs original | Pico memoria portable (MiB) | Pico memoria kernels (MiB) |
|---|---|---|---|---|---|---|
| `yunet-n` | 6,04 | 2,95 | 2,22 | 2,7x | 96 / 124 | 84 / 104 |
| `yunet-s` | 5,55 | 2,67 | 2,00 | 2,8x | 96 / 124 | 84 / 104 |

Optimizaciones adicionales a 1080x1920:

| Variante | portable | torch.compile | TensorRT fp16 (solo red) | Preparacion compile (primera llamada) | Preparacion ONNX + engine |
|---|---|---|---|---|---|
| `yunet-n` | 2,95 ms | 1,79 ms | 0,794 ms | 8,40 s | 12,1 s |
| `yunet-s` | 2,67 ms | 1,65 ms | 0,680 ms | 7,92 s | 13,4 s |

Paridad con el codigo original: en CPU fp32, max |diff| <= 0,001; en GPU fp16, error absoluto medio <= 0,1 y p99 <= 0,3 sobre los keypoints. Mediciones del 2026-11-14 con torch 2.14.1+cu130 y fastforks f104019b.

## Requisitos de hardware

- VRAM estimada para inferencia: 84-96 MiB de pico asignado (104-124 MiB reservado) a 1080x1920 en fp16; 0,5 GiB de pico a 3000x4000.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA; probado en RTX 5060 Ti 16 GB (sm_120). Por su tamano, funciona en GPUs de gama baja y en iGPU con CUDA.
- Cabe en cualquier GPU consumer actual e incluso en dispositivos con poca memoria; el cuello de botella es el ancho de banda y el numero de streams, no la VRAM.
- Opciones de despliegue: PyTorch (backend `portable`), kernel optimizado `fastforks/kernels`, exportacion ONNX y TensorRT fp16; tambien CPU en fp32.
- Latencia: 2,00-2,95 ms por imagen 1080x1920 en GPU (segun variante y backend); 0,68-0,79 ms con TensorRT fp16 solo red. Primera llamada del backend `kernels`: 0,06-0,07 s; carga del modelo: 0,57-1,91 s.
- Throughput estimado: a ~2,2 ms por frame, del orden de 450 imagenes/s en una sola RTX 5060 Ti con el backend `kernels` (calculo derivado de la latencia medida, no publicado como benchmark de throughput).

## Comparativa con modelos similares

| Modelo | Parametros | Enfoque | Precision WIDER FACE (easy) | Latencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| YuNet (`yunet-n`) | ~75k | CNN anchor-free, detector facial con 5 landmarks | 0,894 | 2,22 ms (kernels, 1080x1920) | BSD-3-Clause | Hugging Face (fastforks), libfacedetection, OpenCV Zoo |
| SCRFD | no disponible en la informacion | CNN anchor-based, detector facial con landmarks | no disponible en la informacion | no disponible en la informacion | no disponible en la informacion | no disponible en la informacion |
| RetinaFace | no disponible en la informacion | CNN multi-tarea, detector facial con landmarks | no disponible en la informacion | no disponible en la informacion | no disponible en la informacion | no disponible en la informacion |

Solo se dispone de datos verificados de YuNet en la informacion proporcionada; las cifras de los modelos alternativos no estan disponibles y no se inventan.

## Limitaciones y advertencias

- `module()` exporta unicamente los mapas crudos por nivel; la decodificacion y el NMS deben implementarse fuera del grafo exportado.
- No hay confianza por landmark: `keypoint_scores` repite el score del rostro, por lo que no se puede evaluar la fiabilidad individual de cada punto.
- La imagen no se redimensiona: rostros mucho mas pequenos que el umbral implicito del detector pueden no detectarse, y no hay multi-escala.
- Es un detector facial, no un estimador de pose corporal, pese a los tags `pose` y `pose-estimation` del repositorio.
- No dispone de capacidades de texto, razonamiento, tool calling ni agentes; cualquier uso en ese sentido es inadecuado.
- Riesgo de falsos positivos y de alucinacion de landmarks en rostros parcialmente ocluidos o de perfil; el NMS y el umbral de score son parametros criticos en produccion.
- Sesgos demograficos no documentados en la informacion disponible; el entrenamiento sobre WIDER FACE puede infrarepresentar determinados grupos y condiciones de iluminacion.
- La licencia BSD-3-Clause permite uso comercial, pero la model card advierte que es un paquete de uso de investigacion y recomienda revisar las cadenas de licencia antes de otros usos.
- El repositorio no aloja pesos: depende de enlaces externos a GitHub, con el riesgo de disponibilidad que ello implica; la verificacion SHA-256 es obligatoria.
- No apto para autenticacion biometrica de alta seguridad por si solo; debe combinarse con un reconocedor y pruebas de vivacidad.

## Enlaces

- Model card en Hugging Face: https://huggingface.co/fastforks/yunet
- Codigo de fastforks: https://github.com/kleinicke/fastforks
- Kernels del backend: https://huggingface.co/fastforks/kernels
- Card de definicion (hashes completos): https://github.com/kleinicke/fastforks/blob/main/src/fastforks/pose/models/yunet/card.toml
- Protocolo de benchmarks: https://github.com/kleinicke/fastforks/blob/main/docs/benchmarks.md
- Codigo original (libfacedetection.train, commit dca340aa082c): https://github.com/ShiqiYu/libfacedetection.train
- Pesos `yunet_n.pth`: https://github.com/ShiqiYu/libfacedetection.train/raw/dca340aa082c71081a68d17db8e58b33a58a914b/weights/yunet_n.pth
- Pesos `yunet_s.pth`: https://github.com/ShiqiYu/libfacedetection.train/raw/dca340aa082c71081a68d17db8e58b33a58a914b/weights/yunet_s.pth
- Licencia original: https://github.com/ShiqiYu/libfacedetection.train/blob/dca340aa082c71081a68d17db8e58b33a58a914b/LICENSE
- Paper de referencia: Wu et al., *Machine Intelligence Research*, 2023 (no se proporciona URL directa en la informacion disponible)
