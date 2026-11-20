# ipsilondev/mediapipe-object-detector

## Resumen

`ipsilondev/mediapipe-object-detector` es un repositorio espejo de un unico artefacto de Google: el modelo de deteccion de objetos EfficientDet-Lite0 en formato TensorFlow Lite con cuantizacion int8, publicado originalmente por Google LLC bajo licencia Apache-2.0. El autor del repositorio no ha realizado ninguna conversion, cuantizacion ni modificacion: se trata de una copia byte a byte del fichero oficial alojado en `storage.googleapis.com/mediapipe-models`, con el objetivo de que las aplicaciones puedan fijarlo por commit (por ejemplo, como submódulo git) y garantizar la reproducibilidad de la build.

El modelo resuelve deteccion de objetos en images: recibe tensores de 320x320 pixeles y devuelve cajas delimitadoras con etiquetas de las 80 clases del dataset COCO, que van embebidas en el propio fichero TFLite como `labels.txt`. Esta pensado para ejecutarse mediante las MediaPipe Tasks nativas de Android (`com.google.mediapipe:tasks-vision`), no en runtimes web, y su tamano de 4.602.795 bytes (aproximadamente 4,4 MiB) lo hace adecuado para inferencia en dispositivo.

La relevancia de este repositorio es de tipo operativo mas que de investigacion: no aporta un modelo nuevo ni pesos entrenados por el autor, sino un punto de anclaje versionado para pipelines de CI/CD y apps Android que necesitan una dependencia binaria estable. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamano reportado de 0.0 GB (los ficheros se almacenan como objetos LFS/Xet).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EfficientDet-Lite0 (detector de objetos de una etapa, familia EfficientDet) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | int8 (unico artefacto publicado) |
| Idiomas soportados | no disponible (las etiquetas de clase estan en ingles, derivadas de COCO) |
| Licencia | Apache-2.0 (Google LLC) |
| Formato de pesos | TensorFlow Lite (`.tflite`), 4.602.795 bytes, SHA-256 `0720bf247bd76e6594ea28fa9c6f7c5242be774818997dbbeffc4da460c723bb` |

## Arquitectura y entrenamiento

EfficientDet-Lite0 es una variante compacta de la familia EfficientDet, que combina un backbone tipo EfficientNet con un modulo de agregacion de caracteristicas bidireccional (BiFPN) y cabezas de clasificacion y regresion de cajas. La version "Lite0" es la de menor coste computacional de la familia y esta disenada para moviles y dispositivos embebidos. La entrada es un tensor de 320x320 pixeles y la salida cubre 80 clases del dataset COCO.

No se dispone de informacion sobre el numero de tokens o imagenes de entrenamiento, la composicion exacta del dataset, ni si se aplicaron tecnicas de destilacion, aumento de datos o ajuste fino posteriores. El autor indica explicitamente que no ha realizado conversion, cuantizacion ni ningun otro cambio sobre el fichero original de Google; la cuantizacion int8 es la publicada por Google en el bucket oficial. La unica innovacion tecnica reseñable es la propia del formato: un grafo TFLite cuantizado int8 que permite inferencia de baja latencia en CPU/GPU movil mediante el runtime de MediaPipe.

## Capacidades

- Deteccion de objetos en imagenes con cajas delimitadoras y etiquetas de clase.
- Clasificacion sobre 80 categorias del dataset COCO (persona, vehiculo, animales, objetos cotidianos, etc.).
- Etiquetas embebidas en el propio fichero TFLite como `labels.txt`, sin necesidad de fichero auxiliar.
- Entrada fija de 320x320 pixeles, adecuada para preprocesado en dispositivo.
- Ejecucion nativa en Android mediante `com.google.mediapipe:tasks-vision` y la API `ObjectDetector`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues: es exclusivamente un modelo de vision por computador.
- No dispone de modo "thinking", vision multimodal generativa, audio ni generacion de texto.

## Casos de uso

- Deteccion de objetos en tiempo real en apps Android: integracion via MediaPipe Tasks con `ObjectDetector`, usando el fichero fijado por commit para garantizar que la build de produccion siempre usa los mismos bytes verificables por SHA-256.
- Reproducibilidad de builds en CI/CD: al ser una copia byte a byte con hash documentado, permite validar en el pipeline que el artefacto descargado coincide con el esperado y detectar sustituciones o corrupciones.
- Prototipado rapido de funciones de vision en movil: sirve como baseline para validar flujos de captura de camara, preprocesado a 320x320 y postprocesado de cajas antes de invertir en un modelo propio.
- Moderacion o filtrado de contenido en dispositivo: deteccion de personas u objetos sensibles en imagenes capturadas localmente sin enviar datos a un servidor, aprovechando que el modelo corre en el terminal.
- Automatizacion de inventario o conteo de objetos: en aplicaciones de campo (logistica, retail) que necesitan contar elementos de las clases COCO en fotografias capturadas con el movil.
- Analisis offline en dispositivos sin conectividad: al ser un modelo de 4,4 MiB y ejecutarse en local, es viable en escenarios de borde donde no se puede depender de una API remota.
- Base para experimentos de cuantizacion o comparativas: util como referencia int8 oficial frente a variantes propias, ya que el SHA-256 permite certificar que la comparacion parte del mismo artefacto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Es un modelo TFLite int8 de 4,4 MiB pensado para CPU/GPU movil y aceleradores de borde; no se publican requisitos de VRAM para GPU de escritorio.
- GPU recomendadas: no disponible para el caso de escritorio. El caso de uso objetivo es Android con aceleracion por delegados de MediaPipe (CPU, GPU o NNAPI segun el dispositivo).
- Cabe en GPU de consumo: no disponible; el modelo esta disenado para ejecutarse en dispositivos moviles, no se documenta su comportamiento en GPUs de consumo tipo RTX.
- Opciones de despliegue: MediaPipe Tasks para Android (`com.google.mediapipe:tasks-vision`) es la via documentada por el autor. Otras vias (TensorFlow Lite Interpreter, vLLM, llama.cpp, Ollama, TGI) no estan soportadas ni documentadas en la informacion disponible; vLLM, llama.cpp, Ollama y TGI no aplican a un modelo de vision TFLite.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Entrada | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| efficientdet_lite0 int8 (este repo) | EfficientDet-Lite0 | 320x320 | int8 | Apache-2.0 | Espejo en HF + bucket oficial de Google |
| efficientdet_lite0 fp32 (oficial Google) | EfficientDet-Lite0 | 320x320 | fp32 | Apache-2.0 | Bucket oficial de Google |
| efficientdet_lite1 / lite2 (oficial Google) | EfficientDet-Lite1 / Lite2 | 320x320 (variantes) | int8 / fp32 | Apache-2.0 | Bucket oficial de Google |

No se dispone de datos de rendimiento comparativo (mAP, latencia) en la informacion proporcionada para establecer una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- No es un modelo entrenado por el autor: es un espejo sin modificaciones de un artefacto de Google LLC. Cualquier incidencia de precision debe reportarse contra el modelo original, no contra este repositorio.
- El repositorio tiene 0 descargas y 0 likes y fue creado y actualizado en la misma fecha (2026-11-20); no hay historial de mantenimiento que garantice actualizaciones futuras.
- Los ficheros se almacenan como objetos LFS/Xet: un `git clone` sin `git-lfs` produce punteros de unos 130 bytes en lugar de los bytes reales. Es obligatorio instalar git-lfs o ejecutar `git lfs pull`, y verificar el SHA-256 documentado.
- Solo se publica la variante int8 con entrada 320x320; no hay variantes fp32, otros tamanos de entrada ni otras familias (lite1, lite2) en este repositorio.
- El modelo esta limitado a las 80 clases de COCO; no detecta categorias fuera de ese conjunto y las etiquetas estan en ingles.
- No se documentan sesgos especificos, tasas de alucinacion (no aplica a deteccion) ni limites de contexto (no aplica). El riesgo principal es el propio de un detector COCO: falsos positivos y negativos en clases poco representadas y sensibilidad a condiciones de imagen (iluminacion, oclusion, escala).
- La licencia Apache-2.0 permite uso comercial, pero se recomienda conservar la atribucion a Google LLC y el aviso de licencia original.
- No debe usarse en runtimes web segun el autor; la integracion prevista es MediaPipe Tasks nativo en Android.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/ipsilondev/mediapipe-object-detector
- Fichero oficial de origen: https://storage.googleapis.com/mediapipe-models/object_detector/efficientdet_lite0/int8/latest/efficientdet_lite0.tflite
- Documentacion de MediaPipe Tasks (ObjectDetector): no disponible en la informacion proporcionada
- Paper o blog de EfficientDet: no disponible en la informacion proporcionada
- Repositorio de MediaPipe: no disponible en la informacion proporcionada
