# qvx-o/QeyPoint-Face

## Resumen

QeyPoint Face es un modelo de deteccion de puntos faciales (facial landmarks) desarrollado por el usuario qvx-o bajo el sello Qarvexium, publicado en HuggingFace. Se trata de un detector de 106 keypoints faciales disenado para inferencia en tiempo real tanto en CPU como en GPU, con un backbone tipo U-Net encoder-decoder con bloques residuales y una etapa final de soft-argmax espacial para obtener precision subpixel. El modelo resuelve el problema clasico de la alineacion y el seguimiento facial en aplicaciones de vision por computador.

Con solo 3.090.634 parametros (aproximadamente 12 MB de pesos), el modelo esta pensado para entornos con recursos limitados: alcanza entre 15 y 30 FPS en CPU y mas de 60 FPS en GPUs modernas, con una latencia inferior a 50 ms por fotograma en GPU. Incorpora deteccion automatica de rostro mediante cascadas Haar de OpenCV y un mecanismo de suavizado temporal para estabilizar el seguimiento en video.

Es relevante por su combinacion de ligereza, numero elevado de keypoints (106) y licencia MIT permisiva, lo que lo hace apto para integracion en pipelines de produccion, aplicaciones moviles o sistemas de analisis facial en tiempo real sin coste de licencia. El repositorio registra muy poca actividad publica (0 descargas y 0 likes en el momento de la consulta), por lo que debe considerarse un modelo de nicho y poco validado por la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | U-Net encoder-decoder con bloques residuales; activaciones GELU; soft-argmax espacial |
| Parametros totales | 3.090.634 (aproximadamente 12 MB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision por computador) |
| Tipos de cuantizacion | no disponible (no se documentan cuantizaciones oficiales) |
| Idiomas soportados | no aplica (modelo de vision; los idiomas no son relevantes) |
| Licencia | MIT |
| Formato de pesos | no disponible (pesos PyTorch; se desconoce si se distribuyen como .pt, .pth o safetensors) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura de tipo U-Net encoder-decoder con bloques residuales. Recibe imagenes RGB de 256x256 pixeles y produce mapas de calor (heatmaps) de 64x64 con 106 canales, uno por cada landmark. La prediccion final de coordenadas se obtiene mediante un soft-argmax espacial, que permite localizacion subpixel y suele aportar mayor estabilidad que una regresion directa de coordenadas. Todas las activaciones son GELU.

La canalizacion completa incluye deteccion automatica de rostro con cascadas Haar de OpenCV como paso previo (con parametros de padding horizontal del 20 % y vertical del 25 %), un modo de captura unica y un modo de streaming con suavizado temporal configurable (factor por defecto 0,65) y redeteccion cada N fotogramas (por defecto cada 5). Los 106 puntos siguen una convencion estandar que cubre contorno facial (0-32), cejas (33-42), nariz (43-53), ojos (54-63), boca exterior e interior (64-89) y puntos interiores del rostro (90-105).

No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens o imagenes utilizadas, la composicion de los datos ni si se aplicaron tecnicas de refinamiento como RLHF o DPO (no aplicables en este dominio). No se documenta ninguna innovacion mas alla del soft-argmax espacial y el suavizado temporal.

## Capacidades

- Deteccion de 106 puntos faciales con coordenadas (x, y) en pixeles y una puntuacion de confianza por punto en el rango [0, 1].
- Deteccion automatica del rostro mediante cascadas Haar de OpenCV, con caja delimitadora (x, y, ancho, alto).
- Inferencia en tiempo real en CPU y GPU.
- Modo de captura unica (single-shot) desde camara o desde un fotograma dado.
- Modo de streaming continuo con suavizado temporal para seguimiento de video estable.
- Soporte de GPU cuando hay CUDA disponible, con deteccion automatica de dispositivo.
- No dispone de capacidades de generacion de texto, razonamiento, codigo, matematicas, vision general ni audio. No soporta tool calling ni comportamiento de agente.
- No es un modelo multilingue en el sentido linguistico: procesa imagenes, no texto.

## Casos de uso

- Seguimiento facial en tiempo real para videollamadas o retransmisiones: el modo `stream_from_cam` con suavizado temporal (0,65 por defecto) mantiene los 106 puntos estables entre fotogramas, adecuado para aplicaciones de video en directo.
- Animacion de avatares y filtros faciales: los keypoints de ojos, boca, cejas y contorno permiten mapear expresiones y movimientos de cabeza sobre un avatar, gracias a la granularidad de 106 puntos y a la baja latencia (<50 ms en GPU).
- Analisis de expresiones y emociones: las regiones de ojos, cejas y boca (indices 54-89) permiten alimentar clasificadores de emociones o de atencion en investigacion de comportamiento.
- Sistemas de biometria y verificacion de vivacidad: la deteccion de puntos y micro-movimientos faciales puede combinarse con verificacion de identidad o deteccion de prueba de vida en autenticacion.
- Monitorizacion de fatiga o somnolencia en conductores: el seguimiento ocular y de parpados (puntos 54-63) permite estimar frecuencia de parpadeo y apertura ocular en sistemas embebidos, dado que corre en CPU a 15-30 FPS.
- Accesibilidad e interaccion sin manos: control de cursor o interfaces mediante movimientos de cabeza y mirada para usuarios con movilidad reducida, aprovechando la precision subpixel del soft-argmax.
- Preprocesado en pipelines de reconocimiento facial: alineacion de rostros antes de un modelo de reconocimiento, normalizando la pose a partir de los keypoints detectados.
- Telemedicina y fisioterapia facial: medicion de simetria y rango de movimiento facial mediante seguimiento de landmarks en secuencias de video.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (tipo MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Los unicos datos de rendimiento facilitados por el autor son de velocidad de inferencia:

| Metrica | Valor |
|---|---|
| FPS en CPU | 15-30 (depende del procesador) |
| FPS en GPU | mas de 60 en GPUs modernas |
| Latencia en GPU | inferior a 50 ms por fotograma |
| Tamano del modelo | aproximadamente 12 MB |
| Numero de parametros | 3.090.634 |

No se proporcionan metricas de precision (por ejemplo NME, error medio de landmarks) ni evaluaciones sobre conjuntos de datos publicos.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja. Con pesos en FP32 el modelo ocupa aproximadamente 12 MB; la memoria total necesaria incluye activaciones de un tensor de entrada 256x256 y mapas de salida 64x64x106, por lo que cabe holgadamente en menos de 1 GB de VRAM. Una estimacion conservadora seria entre 0,5 y 1 GB segun el tamano de lote.
- GPU recomendadas: cualquier GPU con soporte CUDA es suficiente. El autor solo menciona "GPUs modernas" para superar los 60 FPS; no desglosa por modelo concreto. No requiere A100, H100 ni similares para funcionar, aunque pueden usarse sin problema.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo (por ejemplo, serie RTX 20/30/40), e incluso puede ejecutarse en CPU a velocidad utilizable (15-30 FPS).
- Opciones de despliegue: el modelo se distribuye como libreria PyTorch con el paquete propio `QeyP` (clase `QeyPointDetector`). Requiere Python 3.7+, PyTorch 1.9+, OpenCV 4.x y NumPy. Soporta ejecucion en CPU y en GPU con CUDA (index de PyTorch con CUDA 11.8 en el ejemplo del autor). No se documenta soporte oficial para vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a modelos de lenguaje y no aplicables a este modelo de vision). No se confirma exportacion a ONNX o TensorRT.
- Latencia y throughput estimados: inferior a 50 ms por fotograma en GPU (mas de 60 FPS) y 15-30 FPS en CPU, segun datos del propio autor.

## Comparativa con modelos similares

| Modelo | Puntos faciales | Parametros | Licencia | Disponibilidad |
|---|---|---|---|---|
| QeyPoint Face | 106 | 3.090.634 | MIT | HuggingFace (qvx-o/QeyPoint-Face) |
| MediaPipe Face Mesh (Google) | 468 (hasta 478 con iris) | no disponible | Apache 2.0 (aproximado, verificar) | MediaPipe / Google |
| Dlib shape predictor (68 puntos) | 68 | no disponible | Boost Software License (aproximado, verificar) | dlib.net |

Nota: los datos de MediaPipe Face Mesh y dlib se incluyen como referencia de categoria conocida; los valores de parametros y licencias deben verificarse en sus fuentes oficiales, ya que no se han extraido de la informacion proporcionada para este modelo. No se dispone de datos de rendimiento comparativos de QeyPoint Face frente a estas alternativas.

## Limitaciones y advertencias

- El modelo depende de las cascadas Haar de OpenCV para la deteccion inicial del rostro; esta etapa es menos robusta que los detectores basados en redes neuronales ante variaciones de iluminacion, pose o escala.
- Segun el propio autor, la deteccion puede fallar con poses extremas u oclusiones; el rendimiento optimo se da con rostros frontales o casi frontales.
- Requiere OpenCV 4.x y no es compatible con OpenCV 5.x debido a cambios en la API, lo que puede suponer un problema de mantenimiento a futuro.
- No se documentan sesgos especificos ni evaluacion de equidad por etnia, edad o genero; un modelo de landmarks puede degradarse en grupos subrepresentados en los datos de entrenamiento (dataset desconocido).
- Riesgo de falsos positivos o detecciones imprecisas con baja confianza: la salida incluye puntuacion de confianza por punto, que conviene filtrar en produccion.
- No se especifica el idioma ni la region, aunque al ser un modelo de vision resulta irrelevante.
- Licencia MIT: permite uso comercial, modificacion y redistribucion con atribucion y sin garantia. Es una licencia permisiva, sin restricciones comerciales conocidas.
- Caveat de disponibilidad: el repositorio tiene 0 descargas y 0 likes, sin validacion externa ni benchmarks publicos, por lo que se recomienda evaluacion propia antes de usarlo en produccion.
- La fecha de creacion registrada (2026-10-03) es posterior a la fecha habitual de consulta; conviene verificar la vigencia y autenticidad del repositorio.

## Enlaces

- HuggingFace: https://huggingface.co/qvx-o/QeyPoint-Face
- No se han encontrado en la informacion disponible otros enlaces a papers, blogs, repositorios o demos.
