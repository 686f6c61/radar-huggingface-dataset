# qualcomm/YoloV5-Face

## Resumen

YoloV5-Face (identificador `qualcomm/YoloV5-Face`) es un detector facial ligero de clase única basado en YOLOv5, distribuido por Qualcomm dentro de su catálogo Qualcomm AI Hub Models. No es un modelo de lenguaje: se trata de un modelo de visión por computador con pipeline de `object-detection` que localiza caras en imágenes de 640x640 píxeles y, por cada cara detectada, predice además 5 puntos de referencia faciales (ojo izquierdo, ojo derecho, nariz, comisura izquierda de la boca y comisura derecha de la boca). La implementación de referencia procede del repositorio `deepcam-cn/yolov5-face`, y Qualcomm publica en este repositorio los ficheros preexportados y optimizados para ejecutarse en la NPU de sus plataformas (Snapdragon y Dragonwing).

El modelo es extremadamente compacto: 1,87 millones de parámetros, un checkpoint `yolov5n-face.pt` de 7,21 MB en coma flotante y 3,68 MB en cuantización w8a16. El backbone descrito por el autor combina bloques StemBlock y ShuffleV2Block sobre la arquitectura YOLOv5, y el entrenamiento se realizó sobre el dataset WiderFace.

Su relevancia es de tipo práctico: cubre el caso de uso de detección facial en tiempo real en el propio dispositivo (*on-device*) con latencias de 2,2 ms a 50 ms según chipset, runtime y precisión, sin necesidad de enviar imágenes a la nube. Es, por tanto, una pieza de preprocesado para *pipelines* de análisis facial, fotografía computacional o automoción, más que un modelo generativo. Conviene señalar que la licencia GPL-3.0 y las restricciones de distribución de los *assets* condicionan su uso comercial directo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOv5 con backbone compuesto por StemBlock y ShuffleV2Block; cabeza de detección de una sola clase (cara) con regresión de 5 landmarks faciales |
| Parametros totales | 1,87 M |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de imagen de 640x640 píxeles) |
| Tipos de cuantizacion | float (coma flotante) y w8a16 (pesos de 8 bits, activaciones de 16 bits), tanto en runtime ONNX como QNN_DLC |
| Idiomas soportados | no disponible (modelo de visión, no procesa texto) |
| Licencia | GPL-3.0 |
| Formato de pesos | PyTorch (checkpoint `yolov5n-face.pt`); exportable a ONNX y QNN_DLC mediante Qualcomm AI Hub Models |

Datos adicionales declarados por el autor: resolución de entrada 640x640, tamaño del modelo 7,21 MB en float y 3,68 MB en w8a16, y dataset de entrenamiento WiderFace. El repositorio de HuggingFace no contiene *assets* preexportados: por restricciones de licencia, el autor indica que hay que compilar y exportar el modelo uno mismo.

## Arquitectura y entrenamiento

Se trata de un detector de objetos de una etapa (*single-stage*) tipo YOLOv5, en su variante "Nano" (`yolov5n-face.pt`). La model card describe el backbone como una combinación de StemBlock y ShuffleV2Block, un diseño orientado a reducir coste computacional manteniendo capacidad de representación, coherente con el objetivo de ejecución en NPU móvil. La cabeza de detección es de clase única (solo "cara") y añade a la regresión de cajas la predicción de 5 puntos faciales, lo que permite alinear rostros en etapas posteriores de un *pipeline* (por ejemplo, antes de un modelo de reconocimiento facial).

El entrenamiento se realizó sobre WiderFace, el conjunto de referencia habitual para detección de caras en escenas no controladas. La información disponible no detalla el número de tokens o imágenes vistas, la composición exacta del dataset, ni si hubo fases de ajuste fino con RLHF/DPO (no aplicable en este tipo de modelo) o *data augmentation* específica. Tampoco se documentan innovaciones de decodificación especulativa ni mecanismos de atención lineal. La aportación diferencial de esta ficha no es algorítmica, sino de despliegue: el modelo se compila y perfila con Qualcomm AI Hub Workbench para ejecutarse íntegramente en la NPU (todos los perfiles publicados indican "NPU" como unidad de cómputo principal).

## Capacidades

- Detección de caras de clase única en imágenes de 640x640 píxeles, con salida de cajas delimitadoras y puntuaciones de confianza.
- Predicción de 5 landmarks faciales por cara: ojo izquierdo, ojo derecho, nariz, comisura izquierda de la boca y comisura derecha de la boca.
- Ejecución en tiempo real en NPU de dispositivos Qualcomm, con latencias medidas entre 2,203 ms y 50,308 ms según plataforma.
- Funcionamiento en dos precisiones (float y w8a16) y dos runtimes (ONNX y QNN_DLC) para adaptar el equilibrio precisión/latencia.
- Exportación con formas de entrada y pesos personalizados (por ejemplo, checkpoints ajustados) mediante la librería Qualcomm AI Hub Models.
- No dispone de generación de texto, razonamiento, código, matemáticas, visión general (captioning/VQA), *tool calling*, *function calling*, soporte de agentes, razonamiento multi-paso ni capacidades multilingües: es un detector facial especializado.
- No se documentan capacidades de seguimiento temporal (*tracking*) ni de estimación de pose completa; los landmarks se limitan a los 5 puntos indicados.

## Casos de uso

- Preprocesado de reconocimiento facial: el detector localiza la cara y sus 5 landmarks, lo que permite alinear y recortar el rostro antes de pasarlo a un modelo de *embedding* facial; su latencia de pocos milisegundos lo hace apto para *pipelines* en cascada en el dispositivo.
- Autenticación y desbloqueo facial en móvil: al ejecutarse en la NPU con 1-275 MB de memoria pico según configuración, puede integrarse en flujos de verificación facial local sin enviar la imagen a un servidor.
- Fotografía computacional: selección automática del punto de enfoque, medición de exposición y estabilización guiada por la posición de los ojos o de la cara en la escena.
- Sistemas de monitorización del conductor (DMS): detección de la cara y de los ojos a alta frecuencia (hasta ~450 inferencias/s en el mejor perfil QNN_DLC publicado) para alimentar lógica de detección de somnolencia o distracción, siempre que la normativa aplicable lo permita.
- Encuadre automático en videollamada y retransmisión: recorte y recentrado dinámico del sujeto a partir de la caja facial y de los landmarks, en tiempo real y en el propio dispositivo.
- Análisis de aforo y *retail analytics*: conteo y presencia de personas mediante detección facial, con la advertencia legal correspondiente sobre tratamiento de datos biométricos.
- Etiquetado y curado de datasets de imagen: generación automática de anotaciones faciales (cajas más landmarks) para entrenar modelos posteriores, con revisión humana del resultado.
- Automoción y robótica embebida: el modelo está perfilado sobre plataformas Qualcomm SA8775P, SA8650P, SA8255P y SA7255P, habituales en entornos de automoción, lo que permite integrarlo en módulos de percepción de cabina.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de precisión (mAP sobre WiderFace u otros) en la información disponible. Los únicos datos de rendimiento facilitados por el autor son medidas de latencia y memoria pico por plataforma, todas con la NPU como unidad de cómputo principal y runtime ONNX o QNN_DLC.

Runtime ONNX, precisión float:

| Chipset | Tiempo de inferencia (ms) | Memoria pico (MB) |
|---|---|---|
| Snapdragon X2 Elite | 6,203 | 9 - 9 |
| Snapdragon X Elite | 13,752 | 9 - 9 |
| Snapdragon 8 Gen 3 Mobile | 7,522 | 10 - 223 |
| Snapdragon 8 Gen 1 Mobile | 26,283 | 8 - 242 |
| Qualcomm Dragonwing IQ-8275 | 11,12 | 6 - 9 |
| Qualcomm Dragonwing QCS8550 (Proxy) | 13,074 | 6 - 124 |
| Qualcomm QCS8450 | 26,283 | 8 - 242 |
| Qualcomm Dragonwing IQ-9075 | 14,41 | 6 - 8 |
| Qualcomm Dragonwing IQ-X7181 | 13,752 | 9 - 9 |
| Qualcomm Dragonwing Q-8750 | 6,461 | 3 - 193 |
| Snapdragon 8 Elite Mobile | 6,461 | 3 - 193 |
| Snapdragon 8 Elite Gen 5 Mobile | 5,95 | 3 - 197 |

Runtime ONNX, precisión w8a16:

| Chipset | Tiempo de inferencia (ms) | Memoria pico (MB) |
|---|---|---|
| Snapdragon X2 Elite | 6,189 | 4 - 4 |
| Snapdragon X Elite | 14,571 | 4 - 4 |
| Snapdragon 8 Gen 3 Mobile | 7,979 | 4 - 271 |
| Snapdragon 8 Gen 1 Mobile | 16,502 | 4 - 267 |
| Qualcomm Dragonwing QCS6490 | 35,893 | 3 - 6 |
| Qualcomm Dragonwing IQ-8275 | 10,82 | 3 - 7 |
| Qualcomm Dragonwing QCS8550 (Proxy) | 13,924 | 3 - 137 |
| Qualcomm QCS8450 | 16,502 | 4 - 267 |
| Qualcomm Dragonwing IQ-9075 | 15,075 | 3 - 6 |
| Qualcomm Dragonwing IQ-X7181 | 14,571 | 4 - 4 |
| Qualcomm Dragonwing Q-6690 | 50,308 | 4 - 275 |
| Qualcomm Dragonwing Q-7790 | 16,303 | 4 - 277 |
| Qualcomm Dragonwing Q-8750 | 6,595 | 2 - 235 |
| Snapdragon 8 Elite Mobile | 6,595 | 2 - 235 |
| Snapdragon 8 Elite Gen 5 Mobile | 6,024 | 1 - 240 |
| Snapdragon 7 Gen 4 Mobile | 16,303 | 4 - 277 |

Runtime QNN_DLC, precisión float (tabla truncada en la información disponible):

| Chipset | Tiempo de inferencia (ms) | Memoria pico (MB) |
|---|---|---|
| Snapdragon X2 Elite | 2,372 | 5 - 5 |
| Snapdragon X Elite | 4,654 | 5 - 5 |
| Snapdragon 8 Gen 3 Mobile | 2,88 | 5 - 91 |
| Snapdragon 8 Gen 1 Mobile | 8,303 | 2 - 103 |
| Qualcomm Dragonwing IQ-8275 | 5,027 | 5 - 13 |
| Qualcomm Dragonwing QCS8550 (Proxy) | 4,048 | 4 - 7 |
| Qualcomm SA8775P | 5,473 | 0 - 65 |
| Qualcomm SA8650P | 5,473 | 0 - 65 |
| Qualcomm SA8255P | 5,473 | 0 - 65 |
| Qualcomm QCS8450 | 8,303 | 2 - 103 |
| Qualcomm Dragonwing IQ-9075 | 5,179 | 5 - 12 |
| Qualcomm Dragonwing IQ-X7181 | 4,654 | 5 - 5 |
| Qualcomm Dragonwing Q-8750 | 2,203 | 5 - 72 |
| Qualcomm SA7255P | 12,807 | 0 - 62 |

Observaciones derivadas de estos datos: el runtime QNN_DLC es aproximadamente 2,5 veces más rápido que ONNX en el mismo chipset (por ejemplo, 2,203 ms frente a 6,461 ms en Q-8750 en float), y la cuantización w8a16 no reduce de forma sistemática la latencia en ONNX (mejora en X2 Elite y 8 Gen 1, empeora en 8 Gen 3 y X Elite), aunque sí disminuye la memoria pico en varios perfiles. El mejor tiempo publicado, 2,203 ms, equivale a unas 450 inferencias por segundo, siempre en NPU y sin contabilizar el preprocesado de imagen ni el postprocesado NMS.

## Requisitos de hardware

- VRAM para inferencia: no se publican requisitos de VRAM en GPU. Como referencia de tamaño, el modelo ocupa 7,21 MB en float y 3,68 MB en w8a16, por lo que no es un factor limitante en ningún acelerador moderno.
- Memoria pico medida en NPU: desde 1 MB (8 Elite Gen 5, w8a16, ONNX) hasta 277 MB (Dragonwing Q-7790 y Snapdragon 7 Gen 4, w8a16, ONNX), según plataforma y configuración.
- GPU recomendadas: no disponibles. El modelo está perfilado exclusivamente para NPU de plataformas Qualcomm (Snapdragon y Dragonwing), no para A100, H100 ni RTX 4090.
- Cabe en hardware de consumo: sí, en el sentido de que está diseñado para móviles, portátiles y plataformas embebidas Qualcomm. No hay datos publicados de ejecución en GPU de consumo NVIDIA o AMD.
- Opciones de despliegue documentadas: Qualcomm AI Hub Models (librería Python para compilar y exportar), Qualcomm AI Hub Workbench (perfilado y evaluación en dispositivo alojado), runtimes ONNX y QNN_DLC, y checkpoints PyTorch como origen.
- Latencia y throughput: latencias publicadas de 2,203 ms a 50,308 ms por inferencia según chipset, runtime y precisión; el rango de 2-3 ms en QNN_DLC float sobre las plataformas más recientes implica un throughput teórico cercano a 400-450 inferencias/s.
- Ejecución en CPU: no hay tiempos publicados. Dado el tamaño del modelo, es razonable esperar que funcione en CPU, pero sin cifras oficiales no puede afirmarse su viabilidad en tiempo real.

## Comparativa con modelos similares

La información proporcionada no incluye comparativas con otros modelos, y los resultados de la búsqueda web realizada no contenían datos técnicos relevantes, por lo que no se dispone de cifras verificables de alternativas. La siguiente tabla recoge únicamente lo que puede afirmarse y marca como "no disponible" todo aquello que no está documentado en la información recibida:

| Modelo | Tarea | Parametros | Entrada | Licencia | Datos comparativos |
|---|---|---|---|---|---|
| YoloV5-Face (Qualcomm) | Detección facial de clase única + 5 landmarks | 1,87 M | 640x640 | GPL-3.0 | Latencias en NPU Qualcomm (tablas anteriores); sin mAP publicado |
| YOLO5Face (implementación de referencia del paper arXiv:2105.12931) | Detección facial + 5 landmarks | no disponible | no disponible | no disponible | no disponible |
| RetinaFace | Detección facial + landmarks | no disponible | no disponible | no disponible | no disponible |
| SCRFD | Detección facial + landmarks | no disponible | no disponible | no disponible | no disponible |
| BlazeFace | Detección facial + landmarks orientada a móvil | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia GPL-3.0: es una licencia copyleft, lo que condiciona la integración en productos propietarios de código cerrado. Cualquier uso comercial debe revisarse con asesoría legal específica.
- Restricciones de distribución: el autor indica explícitamente que, por restricciones de licencia, no se pueden distribuir los *assets* preexportados del modelo; hay que compilar y exportar con las herramientas de Qualcomm.
- Sin métricas de precisión publicadas: no hay mAP ni curvas de detección sobre WiderFace en la información disponible, por lo que la calidad de detección no puede evaluarse con los datos aportados.
- Alcance limitado: detecta exclusivamente la clase "cara". No identifica personas, no estima edad, género o emoción, no hace seguimiento temporal y no reconoce identidades.
- Sin evaluación de sesgos documentada: no se publican análisis de rendimiento diferencial por tono de piel, edad, género, oclusiones, iluminación adversa o ángulos extremos. Es una comprobación imprescindible antes de desplegar en producción.
- Riesgo de falsos positivos y falsos negativos en escenas con caras pequeñas, muy ocluidas o en perfiles pronunciados; el postprocesado NMS no está documentado en la información recibida.
- Compatibilidad de hardware restringida: los perfiles de rendimiento están medidos exclusivamente sobre NPU Qualcomm. No hay datos de rendimiento en GPU NVIDIA/AMD ni en CPU.
- Implicaciones legales y de privacidad: cualquier despliegue que detecte caras procesa datos biométricos en el sentido del RGPD y puede requerir base jurídica, evaluación de impacto y medidas de minimización; en la UE existen restricciones adicionales sobre identificación biométrica en espacios públicos.
- Metadatos del repositorio: registra 0 descargas y 0 *likes*, y las fechas de creación y actualización indicadas son 2026-09-10, posteriores a la fecha de consulta habitual, lo que sugiere que el repositorio es reciente o que las marcas temporales deben interpretarse con cautela.
- La tabla de resultados QNN_DLC está truncada en la información disponible, por lo que las cifras presentadas para ese runtime no cubren todas las plataformas evaluadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/qualcomm/YoloV5-Face
- Librería Qualcomm AI Hub Models (YoloV5-Face, versión v0.62.1): https://github.com/qualcomm/ai-hub-models/blob/v0.62.1/src/qai_hub_models/models/yolov5_face
- Qualcomm AI Hub Workbench (compilación, perfilado y evaluación en dispositivo): https://workbench.aihub.qualcomm.com
- Registro en Qualcomm AI Hub: https://myaccount.qualcomm.com/signup
- Implementación de referencia YoloV5-Face: https://github.com/deepcam-cn/yolov5-face
- Paper asociado (tag `arxiv:2105.12931`, YOLO5Face): https://arxiv.org/abs/2105.12931
- La búsqueda web realizada no devolvió ningún resultado relevante para este modelo; los enlaces anteriores son los únicos disponibles en la información proporcionada.
