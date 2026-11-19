# ipsilondev/face-recon-commercial

## Resumen

Face Recognition Suite es un conjunto de tres modelos ONNX publicados por el desarrollador ipsilondev bajo licencia Apache 2.0, orientados a deteccion y reconocimiento facial en dispositivo. No se trata de un modelo de lenguaje ni de un transformer generativo, sino de una suite de vision por computador compuesta por dos detectores BlazeFace (variantes frontal y trasera) y un extractor de embeddings faciales SFace de 128 dimensiones. El paquete esta pensado para aplicaciones moviles y visores web, concretamente para la app Android Shoot2Drive y su galeria web.

La relevancia de esta publicacion reside en su caracter "commercial-friendly": todos los componentes derivan de proyectos upstream con licencia Apache 2.0 (MediaPipe BlazeFace de Google y OpenCV Zoo SFace), lo que permite su uso comercial sin las restricciones de licencias no comerciales habituales en modelos de reconocimiento facial. Los pesos son binarios ONNX ligeros (440 KB, 603 KB y 38,7 MB respectivamente), lo que facilita su despliegue en entornos con recursos limitados.

El repositorio tiene un tamano de 0.0 GB (redondeado), no registra descargas ni likes en el momento de la consulta, y fue creado y actualizado el 18 de noviembre de 2026. La model card documenta con detalle las fuentes, hashes SHA256 y umbrales de similitud coseno medidos sobre LFW, lo que aporta trazabilidad tecnica poco habitual en repositorios de este tipo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN: BlazeFace (deteccion) + SFace con perdida Sigmoid-Constrained Hypersphere (reconocimiento) |
| Parametros totales | no disponible (pesos: 440.781 B, 603.172 B y 38.696.353 B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelos de vision, no de texto) |
| Tipos de cuantizacion | no disponible (se distribuyen pesos ONNX en float32) |
| Idiomas soportados | no aplica (vision; sin soporte linguistico) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |

Detalle por fichero:

| Fichero | Tamano | Entrada | Salida | Proposito |
|---|---|---|---|---|
| `blazeface_front.onnx` | 440.781 B | float32 `[1,128,128,3]` RGB NHWC, normalizado `(x-127.5)/127.5` | no disponible | Deteccion facial, camara frontal (corto alcance) |
| `blazeface_back.onnx` | 603.172 B | float32 `[1,256,256,3]` RGB NHWC, normalizado `(x-127.5)/127.5` | no disponible | Deteccion facial, camara trasera (largo alcance) |
| `sface.onnx` | 38.696.353 B | float32 `[1,3,112,112]` RGB NCHW, pixeles 0..255 sin prenormalizar | float32 `[1,128]` (`fc1`) | Embedding facial de 128 dimensiones |

## Arquitectura y entrenamiento

La suite combina dos etapas clasicas de un pipeline de reconocimiento facial. La primera es deteccion: dos redes BlazeFace de MediaPipe (Google), una para corto alcance a 128x128 y otra para largo alcance a 256x256, convertidas a ONNX por Katsuya Hyodo (PINTO0309 Model Zoo, entrada `030_BlazeFace`). La segunda es reconocimiento: SFace, el modelo de OpenCV Zoo (`face_recognition_sface_2021dec.onnx`, renombrado sin modificar bytes), que genera un embedding de 128 dimensiones a partir de un recorte facial alineado al template estandar ArcFace de 112x112.

SFace se entrena con la perdida Sigmoid-Constrained Hypersphere descrita por Zhong et al. (IEEE TIP 2021), disenada para mejorar la robustez del reconocimiento facial. El grafo de `sface.onnx` normaliza internamente los pixeles, por lo que la entrada debe ser RGB en rango 0..255 sin prenormalizar. El pipeline medido por el autor (BlazeFace mas alineamiento de 4 puntos) alcanza un 99.45% ± 0.32 en LFW sobre 6000 pares con validacion cruzada de 10 folds. No se dispone de informacion sobre el volumen o composicion exacta de los datasets de entrenamiento originales en la documentacion proporcionada.

## Capacidades

- Deteccion de rostros en imagenes RGB, con dos variantes optimizadas para corto y largo alcance.
- Extraccion de embeddings faciales de 128 dimensiones para comparacion por similitud coseno.
- Verificacion e identificacion facial mediante umbrales de similitud calibrados por tasa de falsos positivos (FAR).
- Alineamiento facial al template ArcFace 112x112 dentro del pipeline de preprocesado.
- Inferencia en dispositivo (on-device) gracias al formato ONNX y al reducido tamano de los pesos.
- Integracion en aplicaciones Android y visores de galeria web (caso de uso declarado: Shoot2Drive).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades linguisticas: es una suite puramente de vision.

## Casos de uso

- Verificacion de identidad en apps moviles: el pipeline BlazeFace + SFace permite comparar un selfie con una foto de referencia en el propio dispositivo, sin enviar imagenes a un servidor, gracias a los 38,7 MB del extractor de embeddings.
- Busqueda facial en galerias fotograficas: indexar embeddings de 128 dimensiones y recuperar fotos de la misma persona mediante similitud coseno, con umbrales ajustables (FAR 1e-3 a 0.364, FAR 1e-4 a 0.421, FAR 1e-5 a 0.472).
- Control de acceso fisico: integrar `sface.onnx` en un lector de tarjetas o terminal con camara para autenticacion biometrica local, usando el umbral FAR 1e-5 si se requiere baja tasa de falsos positivos.
- Etiquetado automatico de fotos en aplicaciones de gestion de imagenes: deteccion con BlazeFace (variante trasera para fotos de grupo a mayor distancia) y agrupamiento por embeddings.
- Analitica de presencia en retail o eventos: conteo y seguimiento de rostros con `blazeface_back.onnx` a 256x256 para escenas con personas a distancia media, sin almacenar identificadores.
- Prototipado rapido en Python con ONNX Runtime: validar pipelines de reconocimiento facial con licencia permisiva antes de invertir en modelos propietarios, dado que toda la suite es Apache 2.0.
- Moderacion o censura automatica de rostros: deteccion con BlazeFace para localizar caras y desenfoque previo a la publicacion de imagenes.

## Benchmarks y rendimiento

| Metrica | Valor | Condiciones |
|---|---|---|
| Precision en LFW | 99.45% ± 0.32 | 6000 pares, validacion cruzada de 10 folds, pipeline BlazeFace + alineamiento de 4 puntos |
| Umbral coseno FAR 1e-3 | 0.364 | Todos los pares de distinta identidad en LFW |
| Umbral coseno FAR 1e-4 | 0.421 | Todos los pares de distinta identidad en LFW |
| Umbral coseno FAR 1e-5 | 0.472 | Todos los pares de distinta identidad en LFW |

No se han publicado resultados de latencia, throughput ni benchmarks comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en total para los tres modelos en float32; `blazeface_front.onnx` (440 KB) y `blazeface_back.onnx` (603 KB) son practicamente despreciables, y `sface.onnx` (38,7 MB) requiere muy poca memoria.
- GPU recomendadas: no requiere GPU dedicada; esta disenado para CPU movil y ejecucion on-device. Cualquier GPU consumer (incluidas GTX 1050 o integradas) es mas que suficiente.
- Cabe en cualquier GPU consumer y en la mayoria de dispositivos Android de gama media.
- Opciones de despliegue: ONNX Runtime (movil y escritorio), OpenCV DNN, TensorFlow Lite mediante conversion, y frameworks moviles compatibles con ONNX.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros / tamano | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Face Recognition Suite (esta ficha) | 440 KB + 603 KB + 38,7 MB | no aplica | 99.45% LFW | Apache 2.0 | Hugging Face, ONNX |
| OpenCV Zoo SFace (upstream) | 38,7 MB (`sface.onnx`) | no aplica | no disponible en la informacion | Apache 2.0 | GitHub OpenCV Zoo |
| MediaPipe BlazeFace (upstream) | 440 KB / 603 KB | no aplica | no disponible en la informacion | Apache 2.0 | MediaPipe / PINTO0309 Model Zoo |
| ArcFace (referencia, no incluido) | no disponible | no aplica | no disponible en la informacion | varía segun implementacion | multiple |

La comparativa se limita a los componentes upstream de los que deriva la suite, ya que no se dispone de datos de benchmarks de alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo solo realiza deteccion y extraccion de embeddings; no incluye clasificacion de identidad, base de datos ni logica de matching, que debe implementar el usuario.
- Riesgo de sesgo demografico: los modelos de reconocimiento facial entrenados con datasets no balanceados pueden presentar peor rendimiento en determinados grupos etnicos, de genero o edad; no se documenta la composicion de los datos de entrenamiento.
- El umbral de similitud debe calibrarse por aplicacion; los valores publicados (0.364 a 0.472) proceden de LFW y pueden no transferirse a dominios con iluminacion, angulos o resoluciones distintas.
- La precision reportada (99.45% en LFW) corresponde al pipeline completo del autor, no al extractor aislado; resultados en otros datasets pueden diferir.
- No se documentan limitaciones de contexto ni de idioma porque el modelo no procesa texto.
- Licencia Apache 2.0 permite uso comercial, pero se debe conservar la atribucion a OpenCV Zoo, los autores de SFace, Google LLC (MediaPipe) y Katsuya Hyodo (PINTO0309) segun la model card.
- El repositorio no registra descargas ni likes y fue creado recientemente; no hay evidencia de mantenimiento a largo plazo.
- El uso de reconocimiento facial esta sujeto a normativa de proteccion de datos (RGPD en la UE), que exige base legal y evaluacion de impacto para datos biometricos.

## Enlaces

- Hugging Face: https://huggingface.co/ipsilondev/face-recon-commercial
- OpenCV Zoo SFace: https://github.com/opencv/opencv_zoo/tree/main/models/face_recognition_sface
- Fichero SFace fijado (SHA256 `0ba9fbfa01b5270c96627c4ef784da859931e02f04419c829e83484087c34e79`): https://github.com/opencv/opencv_zoo/raw/ba91a3b91d00d76e86540d4013f944bd6b514e39/models/face_recognition_sface/face_recognition_sface_2021dec.onnx
- Paper SFace (Zhong et al., IEEE TIP 2021): no disponible como enlace directo en la informacion proporcionada
- PINTO0309 Model Zoo (conversion BlazeFace ONNX): https://github.com/PINTO0309/PINTO_model_zoo
- MediaPipe BlazeFace (Google): https://github.com/google-ai-edge/mediapipe
