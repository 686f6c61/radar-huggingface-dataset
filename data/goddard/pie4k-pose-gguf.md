# Goddard/pie4k-pose-gguf

## Resumen

PIE4K pose networks (GGUF) es un paquete de conversiones a formato GGUF de las redes neuronales de deteccion de personas y estimacion de pose de cuerpo completo utilizadas por el servicio PoseService de PIE4K. No se trata de un modelo de lenguaje, sino de un conjunto de cuatro redes de vision por computador empaquetadas para el runtime ggml propio de PIE4K (`libpie4k_posenet`). El autor, Goddard, las ha convertido desde los ficheros ONNX originales que PIE4K ejecutaba previamente con ONNX Runtime, eliminando la dependencia de dicha libreria.

El repositorio contiene dos detectores de personas (YOLOX-L y YOLOv10-M) y dos estimadores de pose de cuerpo completo con 133 keypoints (DWPose-L y ViTPose-H). La pareja por defecto es YOLOX-L con DWPose-L, mientras que YOLOv10-M con ViTPose-H constituye la alternativa basada en ViTPose. Los pesos provienen de `yzd-v/DWPose` y de `Wan-AI/Wan2.2-Animate-14B`, ambos bajo licencia Apache 2.0.

Es relevante para desarrolladores que trabajen con pipelines de animacion de personajes o analisis de movimiento, ya que ofrece un formato ligero y portable (GGUF) para inferencia de pose sin depender de ONNX Runtime. El modelo total declarado en safetensors es de 33.591.402 parametros, aunque el repositorio ocupa 1,7 GB debido a que incluye cuatro redes independientes con distintos tamanos de pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Redes CNN (YOLOX-L, YOLOv10-M) y transformer ViT (DWPose-L, ViTPose-H) para deteccion y estimacion de pose |
| Parametros totales | 33.591.402 (dato safetensors del repositorio agregado) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de vision, no de texto) |
| Tipos de cuantizacion | Pesos en el formato original de cada ONNX; ViTPose-H con MatMul en fp16; no se documentan otras cuantizaciones |
| Idiomas soportados | No disponible (modelo de vision, sin procesamiento de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (ggml), convertidos desde ONNX |

## Arquitectura y entrenamiento

El paquete agrupa cuatro redes con arquitecturas distintas. YOLOX-L y YOLOv10-M son detectores de objetos tipo CNN con entrada NCHW de 1x3x640x640, encargados de localizar personas en la imagen. DWPose-L (`dw-ll_ucoco_384`) es una red de estimacion de pose de cuerpo completo con 133 keypoints y entrada 1x3x384x288. ViTPose-H (`vitpose_h_wholebody`) es un transformer de vision con 133 keypoints y entrada 1x3x256x192, con los pesos de las capas MatMul en fp16 para reducir el tamano del fichero.

No se dispone de informacion sobre el proceso de entrenamiento original (numero de tokens, composicion del dataset, uso de RLHF o DPO) en la informacion proporcionada. La unica innovacion tecnica documentada es el proceso de conversion: los ficheros ONNX se transforman a GGUF mediante `tools/pose/convert_pose_onnx.py`, con opciones especificas como `--cut /model.23/Concat_5_output_0 --tail yolov10` para YOLOv10-M y `--f16` para ViTPose-H. Los ficheros resultantes estan pensados exclusivamente para el cargador de grafos ggml de PIE4K y no son compatibles con llama.cpp.

## Capacidades

- Deteccion de personas en imagenes mediante YOLOX-L o YOLOv10-M, con entrada de 640x640.
- Estimacion de pose de cuerpo completo con 133 keypoints (incluye cuerpo, manos y rostro) mediante DWPose-L o ViTPose-H.
- Ejecucion en el runtime ggml propio de PIE4K (`libpie4k_posenet`), sin dependencia de ONNX Runtime.
- Seleccion configurable de la pareja detector/estimador mediante el fichero `pie4k.cfg`.
- Verificacion de integridad de los ficheros mediante sha256 documentado para cada red.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues, al ser un modelo puramente de vision.

## Casos de uso

- Animacion de personajes: el pipeline puede extraer keypoints de cuerpo completo de un video o imagen y alimentar modelos de animacion como Wan2.2-Animate-14B, del que provienen parte de los pesos, para generar movimientos coherentes.
- Analisis de movimiento deportivo: la estimacion de 133 keypoints permite calcular angulos articulares y trayectorias en secuencias de video para evaluacion tecnica.
- Motion capture de bajo coste: con una sola camara y las redes YOLOX-L + DWPose-L se puede reconstruir el esqueleto de un sujeto sin equipamiento especializado.
- Preprocesamiento para pipelines de vision: la deteccion de personas con YOLOv10-M sirve como etapa previa para recortar regiones de interes antes de tareas de reconocimiento o segmentacion.
- Integracion en aplicaciones de escritorio o edge: el formato GGUF y el runtime ggml permiten desplegar la inferencia en entornos sin ONNX Runtime, reduciendo dependencias.
- Investigacion en estimacion de pose: la disponibilidad de dos parejas (DWPose y ViTPose) permite comparar el comportamiento de ambas arquitecturas sobre el mismo conjunto de imagenes.
- Automatizacion de analisis de video: el servicio PoseService puede procesar lotes de fotogramas para generar datos de keypoints destinados a entrenamiento de modelos de animacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia orientativa, los ficheros individuales ocupan entre 61 MB (YOLOv10-M) y 1,29 GB (ViTPose-H), por lo que la huella de memoria en inferencia sera del orden de cientos de MB a pocos GB segun la pareja seleccionada.
- GPU recomendadas: no especificadas por el autor. Al ser redes de vision de tamano moderado, caben previsiblemente en GPUs consumer, aunque no se confirma en la documentacion.
- Compatibilidad con GPU consumer: probable para las parejas mas ligeras (YOLOX-L + DWPose-L), no confirmada oficialmente.
- Opciones de despliegue: exclusivamente el runtime ggml de PIE4K (`libpie4k_posenet`). No es compatible con llama.cpp, vLLM, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Keypoints | Formato | Licencia |
|---|---|---|---|---|---|
| PIE4K pose networks (este) | Detector + estimador de pose | 33,6 M (agregado) | 133 | GGUF | Apache 2.0 |
| yzd-v/DWPose (original) | Detector + estimador de pose | No disponible | 133 | ONNX | Apache 2.0 |
| Wan-AI/Wan2.2-Animate-14B (pose2d) | Estimador de pose | No disponible | 133 | ONNX | Apache 2.0 |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona y no soporta conversacion ni tool calling.
- Los ficheros GGUF estan disenados exclusivamente para el cargador de grafos ggml de PIE4K; no funcionan con llama.cpp ni con otras herramientas GGUF estandar.
- La calidad de la estimacion de pose depende del detector previo; oclusiones severas o personas de muy pequeno tamano pueden degradar los resultados.
- No se documentan sesgos especificos, pero al ser modelos de vision entrenados con datasets no descritos, pueden existir sesgos demograficos o de contexto no evaluados.
- La licencia Apache 2.0 permite uso comercial, pero se remite a las paginas originales de `yzd-v/DWPose` y `Wan-AI/Wan2.2-Animate-14B` para los terminos exactos.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en produccion ni validacion externa.
- No se especifican requisitos de hardware ni latencias, lo que dificulta la planificacion de despliegues.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Goddard/pie4k-pose-gguf
- Modelo base DWPose: https://huggingface.co/yzd-v/DWPose
- Modelo base Wan2.2-Animate-14B: https://huggingface.co/Wan-AI/Wan2.2-Animate-14B
