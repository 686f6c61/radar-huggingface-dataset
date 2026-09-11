# Settlers-Lab/CataNET-Pose-Small-v1.0

# CataNET-Pose-Small v1.0 (Settlers-Lab)

## Resumen

CataNET-Pose-Small v1.0 es un modelo de deteccion de keypoints (pose estimation) publicado por Settlers-Lab y especializado en el reconocimiento de tableros del juego de mesa Catan. Deriva de Ultralytics YOLO26 en su variante Small y se distribuye en formato ONNX, con un repositorio de aproximadamente 0,1 GB. Su funcion es localizar puntos clave sobre una imagen de un tablero fisico, lo que permite digitalizar el estado de la partida a partir de una fotografia.

El modelo se ha entrenado sobre el dataset sintetico Settlers-Lab/CataNET-Pose-Synth-v1.0, tambien del mismo autor, lo que sitúa el proyecto en la linea de trabajo de sintetico-a-real para vision por computador aplicada a juegos de mesa. Frente a un detector de objetos generico, un modelo de keypoints aporta la geometria necesaria para reconstruir la rejilla hexagonal del tablero y su orientacion, no solo la presencia de piezas.

Es relevante ahora por tres motivos: la licencia MIT declarada facilita su reutilizacion, el formato ONNX simplifica el despliegue en entornos de produccion heterogeneos y la etiqueta Small sugiere un coste de inferencia bajo, apto para dispositivos de borde. Como contrapartida, el repositorio no incluye resultados de benchmarks, ni ficha de evaluacion, ni documentacion sobre resolucion de entrada o numero de keypoints, y acumula cero descargas y cero valoraciones en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Detector de keypoints de una sola etapa derivado de Ultralytics YOLO26, variante Small |
| Parametros totales | no disponible (la etiqueta Small identifica una de las variantes de tamano de la familia YOLO26, pero el autor no publica el recuento exacto) |
| Parametros activos | no aplica (no es un modelo de mezcla de expertos) |
| Longitud de contexto | no aplica (modelo de vision; no procesa secuencias de texto) |
| Tipos de cuantizacion | no disponible. El repositorio publica pesos en ONNX; el autor no documenta variantes cuantizadas (FP16, INT8) ni su precision asociada |
| Idiomas soportados | en (etiqueta declarada por el autor; el modelo es de vision y no procesa lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | ONNX (etiqueta onnx). No se documentan safetensors, GGUF ni otros formatos |
| Tamano del repositorio | 0,1 GB |
| Tarea declarada (pipeline) | keypoint-detection |
| Modelo base | Ultralytics/YOLO26 |
| Dataset de entrenamiento | Settlers-Lab/CataNET-Pose-Synth-v1.0 |
| Fecha de publicacion | 11 de septiembre de 2026 |
| Descargas / valoraciones | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura corresponde a un detector de keypoints de una sola etapa, heredada de la familia Ultralytics YOLO26. Este tipo de red predice simultaneamente las cajas de los objetos y las coordenadas de los puntos clave asociados en una unica pasada hacia delante, sin una etapa de propuesta de regiones. La variante Small se situa en la franja baja de la escala de tamanos de la familia, lo que prioriza la latencia y el consumo de memoria sobre la capacidad bruta del modelo. Los pesos se exportan a ONNX, lo que permite ejecutar la inferencia con ONNX Runtime tanto en CPU como en GPU.

El entrenamiento se ha realizado sobre CataNET-Pose-Synth-v1.0, un dataset sintetico generado por el propio autor. No se dispone de informacion sobre el numero de imagenes, la resolucion de entrenamiento, el numero de keypoints anotados, la composicion del dataset, el numero de epocas, la funcion de perdida ni el proceso de aumento de datos. Tampoco se documenta el uso de tecnicas de ajuste por preferencias humanas (RLHF o DPO), algo que no tiene sentido en un modelo de vision de este tipo. El autor etiqueta el modelo base como cuantizado en el repositorio, pero no detalla el esquema de cuantizacion aplicado.

## Capacidades

- Deteccion de keypoints sobre imagenes de tableros de Catan: el modelo recibe una imagen y devuelve coordenadas de puntos clave, presumiblemente asociados a la geometria del tablero hexagonal y a las piezas.
- Estimacion de pose en el sentido de vision por computador (localizacion de puntos de interes), no de pose humana.
- Inferencia en formato ONNX, ejecutable con ONNX Runtime, con soporte de ejecucion en CPU y GPU.
- No dispone de generacion de texto ni de capacidades de lenguaje natural, pese a la etiqueta de idioma "en".
- No soporta tool calling ni function calling.
- No esta disenado para flujos de agentes ni para razonamiento multi-paso.
- No incorpora modo de razonamiento explicito (thinking mode), vision multimodal general, audio ni generacion de imagenes.
- Capacidades multilingues: no aplica; el modelo no procesa texto.
- No se documenta soporte de deteccion de objetos genericos, segmentacion, clasificacion ni OCR.

## Casos de uso

- Digitalizacion de partidas de Catan: a partir de una fotografia cenital del tablero, el modelo extrae los puntos clave que permiten reconstruir la posicion de los hexagonos, los vertices y las aristas, y con ello el estado completo de la partida en formato digital.
- Asistentes roboticos de mesa: un brazo robotico puede usar las coordenadas de los keypoints para localizar y manipular piezas o cartas sobre el tablero, siempre que se disponga de una calibracion entre la camara y el sistema de coordenadas del robot.
- Realidad aumentada: superponer informacion contextual (probabilidades, recursos disponibles, rutas de expansion) sobre la imagen del tablero en tiempo real requiere una estimacion de la geometria del tablero, que es exactamente la salida de este modelo.
- Arbitraje y validacion de reglas: una aplicacion puede comparar el estado detectado con las reglas del juego para senalar colocaciones invalidas, calzadas mal resueltas o robos de recursos no permitidos.
- Analisis post-partida y entrenamiento de jugadores: registrar la evolucion del tablero fotograma a fotograma permite reconstruir la partida completa y generar estadisticas de produccion, expansion y comercio por jugador.
- Inventario y control de componentes: verificar que una caja de Catan contiene todas las piezas y los hexagonos esperados mediante fotografias, util en logistica de segunda mano o en control de calidad de fabricacion.
- Investigacion en transferencia sintetico-a-real: el modelo sirve como banco de pruebas para medir la brecha de dominio entre un dataset sintetico y fotografias reales de tableros bajo condiciones de iluminacion y perspectiva variables.
- Integracion en aplicaciones moviles: con un modelo de la variante Small en ONNX, es viable ejecutar la inferencia en el propio dispositivo sin enviar imagenes a un servidor, lo que reduce latencia y evita problemas de privacidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El repositorio no incluye metricas de validacion (mAP, OKS, PCK, error medio de keypoints), ni comparaciones con el modelo base Ultralytics/YOLO26, ni resultados de evaluacion sobre imagenes reales frente al dataset sintetico de entrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma confirmada por el autor. Como referencia orientativa, un detector de la franja Small de la familia YOLO en resoluciones tipicas de 640x640 suele requerir menos de 1 GB de VRAM en FP16, y el repositorio completo ocupa solo 0,1 GB. Estas cifras son estimaciones de orden de magnitud, no mediciones del modelo publicado.
- GPU recomendadas: cualquier GPU con soporte CUDA y al menos 4 GB de memoria es suficiente en la practica. Una NVIDIA RTX 3060, RTX 4060, RTX 4090, A100 o H100 pueden ejecutar el modelo sin limitaciones de memoria apreciables.
- Compatibilidad con GPU de consumo: si, cabe holgadamente en cualquier GPU de consumo de los ultimos ocho anos. Tambien es viable la inferencia en CPU con ONNX Runtime, aunque con mayor latencia.
- Opciones de despliegue: ONNX Runtime (CPU y GPU) es la via natural dado el formato de los pesos. No se documenta soporte oficial para vLLM, llama.cpp, Ollama o TGI, que son herramientas orientadas a modelos de lenguaje. Para pipelines de vision, el camino esperado es exportar el modelo a TensorRT, OpenVINO o Core ML a partir del ONNX.
- Latencia y throughput estimados: no disponibles. El autor no publica mediciones de latencia ni de imagenes por segundo en ningun hardware.

## Comparativa con modelos similares

No existen alternativas publicas equivalentes centradas en el reconocimiento de tableros de Catan, por lo que la comparacion se establece con la familia de origen y con detectores de keypoints genericos de Ultralytics.

| Modelo | Dominio | Tarea | Parametros | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| CataNET-Pose-Small v1.0 | Catan | Keypoints de tablero | no disponible | ONNX | MIT (declarada) | HuggingFace, 0 descargas |
| Ultralytics YOLO26 | Generico | Deteccion y pose | no disponible en la informacion proporcionada | PyTorch y exportaciones | AGPL-3.0 en la distribucion estandar de Ultralytics | Repositorio oficial de Ultralytics |
| Ultralytics YOLOv8-pose | Pose humana | Keypoints de persona | no disponible en la informacion proporcionada | PyTorch y exportaciones | AGPL-3.0 en la distribucion estandar de Ultralytics | Ampliamente desplegado |
| Ultralytics YOLO11-pose | Pose humana | Keypoints de persona | no disponible en la informacion proporcionada | PyTorch y exportaciones | AGPL-3.0 en la distribucion estandar de Ultralytics | Ampliamente desplegado |

La diferencia principal no es de arquitectura sino de dominio: CataNET-Pose-Small esta ajustado a un unico tipo de escena, el tablero de Catan, mientras que los modelos de pose de Ultralytics resuelven keypoints de personas. Un modelo de pose humana no es directamente sustituible para esta tarea sin reentrenamiento.

## Limitaciones y advertencias

- Entrenamiento exclusivamente sintetico: al proceder de CataNET-Pose-Synth-v1.0, es probable una brecha de dominio frente a fotografias reales con iluminacion irregular, reflejos, oclusiones parciales o perspectivas oblicuas. El autor no publica evaluacion sobre datos reales.
- Ambito cerrado: el modelo esta especializado en Catan. No se espera que generalice a otros juegos de mesa ni a otros dominios de keypoints.
- Ausencia total de benchmarks: sin metricas de validacion no es posible estimar la precision real ni fijar umbrales de confianza defendibles en produccion.
- Documentacion incompleta: se desconoce el numero de keypoints, la resolucion de entrada esperada, el significado de cada punto clave, los umbrales de confianza y el esquema de cuantizacion mencionado en las etiquetas.
- Riesgo de alucinacion en sentido amplio: como cualquier detector, puede producir detecciones espurias en imagenes fuera de distribucion. La magnitud de este riesgo no esta cuantificada.
- Sesgos: no se documenta la composicion del dataset sintetico, por lo que no se puede evaluar si existen sesgos de iluminacion, estilo grafico o disposicion del tablero.
- Idioma: la etiqueta "en" no tiene efecto practico, ya que el modelo no procesa texto. No hay soporte multilingue porque no hay componente linguistico.
- Restricciones de licencia: el autor declara MIT, lo que permitiria uso comercial. Sin embargo, el modelo deriva de Ultralytics YOLO26, cuya distribucion estandar se publica bajo AGPL-3.0. Conviene verificar con Ultralytics si los pesos derivados de YOLO26 quedan sujetos a obligaciones AGPL o si es necesaria una licencia empresarial antes de un despliegue comercial o de ofrecer el modelo como servicio.
- Madurez: cero descargas y cero valoraciones implican ausencia de validacion independiente por parte de la comunidad.
- Fecha de publicacion inusual: el repositorio figura creado y actualizado el 11 de septiembre de 2026, dato a verificar si se va a citar.
- Verificacion recomendada antes de produccion: medir OKS o error de keypoints sobre un conjunto propio de fotografias reales, y comprobar el comportamiento con el tablero parcialmente ocluido o con piezas fuera de la rejilla.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Settlers-Lab/CataNET-Pose-Small-v1.0
- Dataset de entrenamiento: https://huggingface.co/datasets/Settlers-Lab/CataNET-Pose-Synth-v1.0
- Modelo base Ultralytics YOLO26: https://huggingface.co/Ultralytics/YOLO26
- Repositorio de Ultralytics: https://github.com/ultralytics/ultralytics
- Perfil del autor en HuggingFace: https://huggingface.co/Settlers-Lab

Nota sobre la busqueda web: los resultados obtenidos corresponden a la serie de videojuegos The Settlers de Ubisoft (thesettlersonline.fr, ubisoft.com, fr.wikipedia.org y en.wikipedia.org) y no guardan ninguna relacion con Settlers-Lab ni con el modelo CataNET-Pose-Small v1.0. No se ha encontrado informacion adicional relevante sobre este modelo fuera de su ficha en HuggingFace.
