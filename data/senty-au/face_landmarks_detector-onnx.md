# senty-au/face_landmarks_detector-ONNX

## Resumen

face_landmarks_detector-ONNX es la conversión a ONNX del detector de landmarks faciales de MediaPipe Face Landmarker de Google, publicada por el usuario senty-au. No es un modelo entrenado desde cero: los pesos son los de Google, sin modificar, y lo único que cambia es el contenedor, de TFLite a ONNX. Predice 478 landmarks faciales en 3D (los 468 puntos del face mesh más 10 puntos de iris) dentro de un recorte cuadrado centrado en una cara.

El modelo resuelve el problema de ejecutar la malla facial de MediaPipe fuera de su ecosistema nativo: al estar en ONNX, funciona con cualquier runtime de onnxruntime, incluido CPU, sin necesidad de instalar MediaPipe ni TensorFlow Lite. La inferencia cuesta entre 5 y 15 ms por pasada en la CPU de un portátil (Intel Core Ultra 9 185H, onnxruntime 1.30), lo que permite tiempo real en hardware modesto.

Su relevancia práctica está en la fidelidad de la conversión: se verificó contra el TFLite original en tres fotografías, con una diferencia absoluta máxima de 0,00024 px en los landmarks y de 2,2e-5 en el logit de presencia facial. El repositorio contiene únicamente el detector de landmarks; no incluye el detector de caras ni el modelo de blendshapes del bundle de MediaPipe.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal del MediaPipe Face Landmarker de Google; la model card no detalla la topología interna (no disponible) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de visión con entrada de imagen fija) |
| Tipos de cuantizacion | no disponible (el bundle original de MediaPipe es float16; el ONNX convertido recibe entradas float32) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | Apache-2.0 (misma que el modelo original; pesos © Google LLC) |
| Formato de pesos | ONNX (`onnx/model.onnx`, archivo único) |
| Tarea | keypoint-detection (landmarks faciales) |
| Entrada | `input_12`: float32 [1, 256, 256, 3], NHWC, RGB, valores en [0, 1] |
| Salidas | `Identity` [1, 1, 1, 1434] (478 × x,y,z en píxeles del recorte, 0..256); `Identity_1` [1, 1, 1, 1] (logit de presencia facial); `Identity_2` [1, 1] (salida auxiliar del grafo original) |
| Puntos predichos | 478 (468 de malla facial + 10 de iris) |
| Resolucion de entrada | 256 × 256 píxeles, recorte cuadrado |
| Tamano del repo | figura como 0.0 GB (redondeo de HuggingFace); tamano real no disponible |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna ni el proceso de entrenamiento, porque este repositorio no entrena nada: parte de `face_landmarks_detector.tflite`, extraído del bundle versionado `face_landmarker.task` de MediaPipe (bundle sha256 `64184e229b263107bc2b804c6625db1341ff2bb731874b0bcc2fe6544e0bc9ff`, TFLite interno sha256 `c7d54204ce0448474c7f3fa9af494787c0965cbdd6f20fc72867e43046bd43d5`), y lo convierte con `tf2onnx==1.17.0` en opset 17. No se aportan datos sobre número de tokens, composición del dataset ni si hubo RLHF o DPO, ya que no aplica a un modelo de visión de este tipo.

La única innovación técnica reseñable es la propia conversión y su verificación numérica: los resultados se compararon contra el modelo TFLite ejecutado en TensorFlow Lite sobre tres fotografías, con una desviación máxima de 0,00024 px en los landmarks y 2,2e-5 en el logit de presencia. El sha256 del ONNX resultante es `7d6e82dee82a1dca5fbddb282b3cc74571833a530de317fc22ae325c3358beeb`. El modelo opera sobre un recorte cuadrado de una sola cara, idealmente rotado para que los ojos queden nivelados; el autor recomienda refinar el recorte una o dos veces a partir de los propios puntos de la primera pasada (caja derivada de los puntos, roll derivado de la línea de los ojos), que es el mecanismo de seguimiento que usa MediaPipe entre fotogramas.

## Capacidades

- Detección de 478 landmarks faciales en 3D (x, y, z) expresados en píxeles del recorte de 256 × 256.
- Malla facial de 468 puntos más 10 puntos de iris (índices 468-472 y 473-477), lo que habilita seguimiento ocular básico.
- Índices relevantes documentados: 33 y 263 (esquinas de los ojos), 13 y 14 (labios internos), además de los grupos de iris.
- Salida de presencia facial como logit (`Identity_1`); aplicando sigmoid, MediaPipe mantiene la cara por encima de aproximadamente 0,5.
- Ejecución en CPU sin GPU y sin dependencias de MediaPipe ni TensorFlow en tiempo de inferencia.
- Refinamiento iterativo del recorte para mejorar la precisión y permitir seguimiento entre fotogramas de vídeo.
- No soporta tool calling ni function calling: no es un modelo de lenguaje.
- No tiene capacidades de agente, razonamiento multi-paso, generación de texto, código ni matemáticas.
- No tiene capacidades multilingües ni de audio: solo procesa imágenes.
- No incluye estimación de blendshapes ni clasificación de expresiones.

## Casos de uso

- Efectos y filtros de realidad aumentada en tiempo real: con 5-15 ms por pasada en CPU, el modelo puede animar mallas faciales en aplicaciones de escritorio, móviles o web (vía onnxruntime Web) sin depender de MediaPipe ni de una GPU.
- Seguimiento de mirada y análisis de atención: los 10 puntos de iris permiten calcular la dirección de la mirada dentro del recorte, útil en estudios de usabilidad o en sistemas de detección de distracción al volante.
- Rigging y animación de avatares: los índices de esquinas de ojos (33/263) y labios (13/14) sirven para mapear la malla a un rig facial 2D o 3D en herramientas de animación y VTubing.
- Alineación previa a reconocimiento facial: la línea de los ojos derivada de los puntos permite calcular el ángulo de roll y normalizar la cara antes de pasarla a un modelo de embeddings faciales.
- Asistencia artística y dibujo automatizado: el repositorio `painter` ya lo usa para dibujar ojos, cejas y labios en páginas para colorear a partir de una fotografía.
- Análisis de vídeo con seguimiento entre fotogramas: refinando el recorte con los puntos del fotograma anterior se obtiene una trayectoria facial estable, adecuada para telemetría de expresiones en entrevistas o estudios de comportamiento.
- Procesado local con privacidad: al ejecutarse en CPU y en local, permite analizar rostros sin enviar imágenes a servicios externos, relevante en entornos sanitarios o con requisitos de protección de datos.
- Preprocesado en pipelines ONNX existentes: se puede insertar como primer nodo de un grafo mayor (por ejemplo, detección de landmarks seguida de un clasificador de expresión o de fatiga) sin añadir un runtime distinto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas tipo MMLU, HumanEval o GSM8K, que además no aplican a un modelo de keypoint detection. Lo único verificable son los datos de equivalencia numérica y latencia:

| Comprobacion | Resultado |
|---|---|
| Diferencia absoluta maxima en landmarks (ONNX vs TFLite, 3 fotografias) | 0,00024 px |
| Diferencia absoluta maxima en el logit de presencia facial | 2,2e-5 |
| Latencia por pasada (CPU Intel Core Ultra 9 185H, onnxruntime 1.30) | 5-15 ms |
| Fidelidad de pesos | pesos de Google sin modificar; solo cambia el formato |

## Requisitos de hardware

- VRAM: no aplica en la configuración documentada, que usa `CPUExecutionProvider`; la inferencia se realiza en memoria del sistema.
- El tamaño exacto del grafo no está publicado, por lo que no puede darse una cifra de VRAM verificada para ejecución en GPU. Por la latencia medida en CPU y el hecho de que solo procesa una imagen de 256 × 256 en una pasada, es previsible que quepa holgadamente en menos de 1 GB, pero se trata de una estimación, no de un dato publicado.
- GPU recomendadas: ninguna en particular; cualquier GPU compatible con onnxruntime serviría, pero el modelo está pensado para CPU. Funciona en equipos sin GPU dedicada y en portátiles de gama media.
- Cabe en cualquier GPU de consumo (RTX 3060, RTX 4090, etc.) y, sobre todo, en CPU sin aceleración.
- Opciones de despliegue: onnxruntime con cualquier execution provider (CPUExecutionProvider, CUDAExecutionProvider, DirectML, etc.), en Python, C++, C#, Java o Web. No requiere vLLM, TGI, llama.cpp ni Ollama, que no son aplicables a este tipo de modelo.
- Latencia y throughput: 5-15 ms por pasada en la CPU indicada, lo que equivale en cómputo puro a entre 66 y 200 pasadas por segundo, sin contar el preprocesado del recorte (recorte, escalado y normalización) ni el postprocesado.
- El coste real en un sistema de seguimiento en vídeo incluye, además de la inferencia, el recorte y el refinamiento iterativo del encuadre, que puede duplicar o triplicar el tiempo por fotograma si se hacen dos pasadas.

## Comparativa con modelos similares

La información disponible solo permite comparar con las variantes de la propia familia MediaPipe, ya que no se aportan datos de alternativas como las soluciones de InsightFace u otros detectores de landmarks.

| Modelo | Puntos | Formato | Requiere MediaPipe | Licencia |
|---|---|---|---|---|
| face_landmarks_detector-ONNX (este) | 478 (468 malla + 10 iris) | ONNX | no (onnxruntime) | Apache-2.0 |
| MediaPipe Face Landmarker original | 478 (468 malla + 10 iris) | TFLite dentro del bundle `.task` | si | Apache-2.0 |
| MediaPipe Face Mesh | 468 (solo malla, sin iris) | TFLite | si | Apache-2.0 |

Frente al Face Landmarker original, este repositorio ofrece el mismo resultado numérico con un formato portable y sin dependencias de MediaPipe; a cambio, no incluye los modelos auxiliares del bundle (detector de caras y blendshapes) ni el pipeline completo de recorte. Frente al Face Mesh de 468 puntos, añade los 10 puntos de iris, lo que habilita usos de seguimiento ocular que la versión clásica no cubre. No hay datos de benchmarks que permitan comparar precisión con detectores alternativos de terceros.

## Limitaciones y advertencias

- El repositorio contiene solo el detector de landmarks: hay que aportar el recorte cuadrado de la cara desde un detector externo o desde los puntos del fotograma anterior.
- Es sensible a la calidad del recorte y al ángulo de roll; se recomienda refinar el encuadre una o dos veces, con el coste de latencia adicional que ello implica.
- Está diseñado para una sola cara por inferencia; no gestiona varias caras en la misma imagen de forma nativa.
- La coordenada z de los landmarks es relativa y se expresa en píxeles del recorte, no es una medida métrica de profundidad ni sirve para reconstrucción 3D calibrada.
- Las formas declaradas en la model card son de batch 1 (`[1, 256, 256, 3]` y salidas con dimensión de lote 1); no se documenta si el grafo admite lotes mayores.
- No se documentan sesgos, composición del dataset de entrenamiento ni cobertura demográfica; al ser un modelo de Google sin datos publicados en esta ficha, el sesgo potencial es desconocido.
- No se han publicado benchmarks ni validación por terceros. El repositorio tiene 0 descargas y 0 likes, por lo que no hay evidencia comunitaria de uso en producción.
- Riesgo de falsos positivos: en un recorte sin cara el modelo puede devolver una malla plausible; debe usarse siempre el logit de presencia (`Identity_1` con sigmoid) para descartar detecciones.
- El tamaño del repositorio figura como 0.0 GB, lo que puede indicar un redondeo o que el archivo de pesos no está subido; conviene verificar la presencia de `onnx/model.onnx` antes de integrarlo.
- Licencia Apache-2.0, la misma que el modelo original, lo que en principio permite uso comercial; los pesos son © Google LLC y este repositorio solo cambia el formato, por lo que conviene revisar los términos aplicables de MediaPipe para el modelo subyacente.
- El uso en contextos clínicos o de evaluación psicológica no está respaldado por ninguna validación publicada en la información disponible.

## Enlaces

- HuggingFace: https://huggingface.co/senty-au/face_landmarks_detector-ONNX
- MediaPipe Face Landmarker (modelo original y su model card): https://ai.google.dev/edge/mediapipe/solutions/vision/face_landmarker
- Bundle original de MediaPipe: https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task
- Proyecto que usa esta conversión: https://github.com/Rusya13/painter
- tf2onnx 1.17.0: mencionado como herramienta de conversión en la model card, sin URL proporcionada en la información disponible.
- La búsqueda web realizada no devolvió enlaces relevantes sobre este modelo; los resultados obtenidos correspondían a sitios sin relación con el tema.
