# KaanAydinli/logicdrawer-yolo26s

## Resumen

LogicDrawer YOLO26s es un detector de objetos especializado en simbolos de puertas logicas presentes en esquematicos y dibujos de circuitos digitales, tanto manuscritos como impresos. Lo publica el usuario KaanAydinli en Hugging Face bajo licencia AGPL-3.0 y esta construido sobre la arquitectura YOLO26s de Ultralytics, entrenada desde inicializacion aleatoria (sin pesos preentrenados) sobre un dataset propio de 1.495 imagenes en escala de grises.

El modelo resuelve un problema muy concreto: convertir una imagen de un circuito en detecciones etiquetadas de siete tipos de puerta (AND, NAND, NOR, NOT, OR, XNOR, XOR), lo que permite despues reconstruir el grafo logico o la netlist. Frente a un detector generico de COCO, aqui las clases y el dominio estan cerrados, lo que se traduce en metricas altas en su propio conjunto de prueba (mAP@0.5 de 0,961 y mAP@0.5:0.95 de 0,659) con un coste computacional muy bajo: 9,95 M de parametros y 22,8 GFLOPs a 640 px.

Su relevancia practica esta en el coste de despliegue: se entrena en 1,26 horas en una GPU de portatil de 6 GB (RTX 4050 Laptop), infiere a 6,8 ms por imagen con batch 16 en fp16 en ese mismo hardware y se exporta a ONNX con salida directa sin NMS. Es, por tanto, un candidato para digitalizacion de apuntes, correccion automatica de practicas y preprocesado en herramientas de captura de esquematicos, siempre teniendo en cuenta las obligaciones de la licencia AGPL-3.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO26s (Ultralytics); deteccion end-to-end sin NMS, regresion directa de cajas |
| Parametros totales | 9,95 M (fusionado: 9,47 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada fija de imagen 640 x 640) |
| Tipos de cuantizacion | no disponible (la model card solo menciona AMP fp16 en entrenamiento e inferencia fp16; los pesos distribuidos no se presentan cuantizados) |
| Idiomas soportados | no disponible (modelo de vision; el etiquetado es de clases, no linguistico) |
| Licencia | AGPL-3.0 |
| Formato de pesos | PyTorch (`logicdrawer_yolo26s.pt`) y ONNX (`logicdrawer_yolo26s.onnx`, opset 18) |
| Tarea | object-detection (7 clases: AND, NAND, NOR, NOT, OR, XNOR, XOR) |
| Entrada | 640 px, contenido en escala de grises en 3 canales; letterbox con relleno gris (114) |
| Salida ONNX | `output0` float32 `[1, 300, 6]` -> `x1, y1, x2, y2, confianza, class_id` |
| FLOPs | 22,8 GFLOPs a 640 (fusionado: 20,8) |
| Tamano del repositorio | 0,1 GB |
| Libreria | ultralytics (requiere >= 8.4.146 para soporte de YOLO26) |

## Arquitectura y entrenamiento

Se trata de un detector YOLO26s de Ultralytics, una CNN de deteccion de una sola etapa. La innovacion relevante de esta version es que elimina la supresion no maxima (NMS): el cabezal predice directamente las cajas finales, de modo que el grafo exportado a ONNX ya devuelve detecciones ordenadas por confianza en un tensor de `[1, 300, 6]`. Esto simplifica el despliegue (no hay paso posterior de NMS que replicar en el runtime) y acota el numero maximo de detecciones por imagen a 300.

El entrenamiento se hizo desde inicializacion aleatoria (`pretrained=False`) con la receta `yolo26s.yaml`: 640 px de resolucion, batch 16, 400 epocas planificadas con paciencia de early stopping de 100, AMP fp16, semilla 0 y modo determinista. El optimizador es MuSGD (Muon para pesos de convolucion y matrices, SGD con Nesterov para el resto), con lr0 0,01 y decaimiento lineal, momento 0,9, weight decay 5e-4 y 3 epocas de warmup. Las ganancias de perdida son box 7,5, cls 0,5 y dfl 1,5. La aumentacion incluye mosaic 1.0, escala ±0,5, traslacion 0,1, rotacion ±5 grados, volteo horizontal 0,5 y brillo (hsv_v) 0,4, con tono y saturacion a 0 por trabajar en grises; no se uso mixup, cutmix ni copy-paste. El entrenamiento paro en la epoca 235 (mejor checkpoint en la 135) tras 1,26 horas en una RTX 4050 Laptop de 6 GB.

Los datos son 1.495 imagenes en escala de grises con lado mayor de 640 px, divididas en 1.047 / 224 / 224 (train / valid / test) y con 16.868 cajas anotadas. El conjunto mezcla fotos de movil de circuitos dibujados a mano con esquematicos escaneados y renderizados; las fotos manuscritas representan aproximadamente el 8 % de las imagenes de entrenamiento. La model card indica que las estadisticas por clase, por fuente y por tamano de caja estan en `dataset_stats.json`.

## Capacidades

- Deteccion de simbolos de puertas logicas en imagenes de circuitos, con siete clases cerradas: AND, NAND, NOR, NOT, OR, XNOR y XOR.
- Funciona sobre dibujos manuscritos fotografiados con movil y sobre esquematicos escaneados o renderizados, segun la composicion declarada del dataset.
- Inferencia end-to-end sin NMS: la salida ONNX ya viene filtrada por confianza (top 300) y con la clase asignada.
- Ejecucion en CPU o GPU mediante ONNX Runtime, o en PyTorch mediante la API de Ultralytics.
- Robustez declarada frente a rotaciones leves y cambios de brillo por la aumentacion aplicada en entrenamiento (rotacion ±5 grados, hsv_v 0,4, escala ±0,5).
- No dispone de tool calling, function calling, agentes, razonamiento multi-paso, capacidades multilingues, vision general (mas alla del dominio de puertas logicas), audio ni modo "thinking": es exclusivamente un detector de objetos de dominio especifico.
- No se declaran capacidades de deteccion de lineas, texto (etiquetas de pines) ni de puertas fuera de las siete clases listadas.

## Casos de uso

- Digitalizacion de apuntes de electronica digital: el estudiante fotografia su cuaderno y el detector localiza cada puerta; combinado con un extractor de lineas, se puede reconstruir la netlist sin redibujar el circuito a mano.
- Asistencia a la captura de esquematicos en herramientas EDA: a partir de un PDF escaneado de un diagrama antiguo, el modelo marca las puertas y sus posiciones, reduciendo el trabajo manual de reintroduccion en KiCad, Altium o similar.
- Correccion automatica de practicas y examenes: en un examen de diseno logico, el detector cuenta y clasifica las puertas usadas y permite comprobar si el alumno ha empleado el numero y tipo de puertas pedidos.
- Recuperacion de documentacion tecnica heredada: digitalizacion de planos en papel de equipos en mantenimiento, extrayendo la topologia logica para documentacion de servicio o para migracion a HDL.
- Herramientas educativas interactivas del tipo "dibuja y simula": el alumno dibuja un circuito en un lienzo, el modelo detecta las puertas y el sistema simula la funcion logica resultante en tiempo real; los 6,8 ms por imagen lo hacen viable en interaccion continua.
- Control de calidad de generacion de esquematicos: verificar automaticamente que un diagrama renderizado contiene exactamente las puertas esperadas, como paso de validacion en un pipeline de publicacion tecnica.
- Preprocesado en pipelines de vision de documentos tecnicos: usar el modelo como primer modulo (deteccion de nodos) seguido de un modulo de deteccion de conexiones y un reconstuctor de grafo.
- Aplicaciones moviles o de borde: al ser un modelo de 9,95 M de parametros y disponer de exportacion ONNX sin NMS, se puede ejecutar en dispositivos modestos sin depender de una GPU de servidor.

## Benchmarks y rendimiento

Resultados declarados por el autor para `best.pt` a 640 px. La model card advierte que los conjuntos de validacion y prueba tienen la misma mezcla de fuentes que el de entrenamiento. Los valores del model-index figuran como no verificados (`verified: false`).

| Split | Imagenes | Cajas | Precision | Recall | mAP50 | mAP75 | mAP50-95 |
|---|---|---|---|---|---|---|---|
| valid | 224 | 2.954 | 0,952 | 0,980 | 0,990 | 0,842 | 0,699 |
| test | 224 | 2.723 | 0,915 | 0,960 | 0,961 | 0,785 | 0,659 |

AP por clase en el conjunto de prueba (datos parciales, tal como aparecen en la informacion disponible):

| Clase | AP50 | AP50-95 |
|---|---|---|
| AND | 0,975 | 0,716 |
| OR | 0,964 | 0,627 |
| NAND, NOR, NOT, XNOR, XOR | no disponible | no disponible |

No se han publicado resultados de benchmarks comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- Los pesos son muy ligeros: 9,95 M de parametros (unos 40 MB en fp32 y unos 20 MB en fp16); el repositorio completo ocupa 0,1 GB.
- Entrenamiento declarado: 1,26 horas en una NVIDIA RTX 4050 Laptop de 6 GB. Cualquier GPU consumer con 6 GB o mas es suficiente para reentrenar con este dataset.
- Inferencia declarada: 6,8 ms por imagen con batch 16 en fp16 sobre la misma RTX 4050 Laptop. Cabe en GPU consumer de gama de entrada (serie RTX 40/30, entre otras) y no requiere A100 ni H100.
- VRAM exacta para inferencia: no disponible en la informacion proporcionada; el unico dato es que el autor entrena e infiere en una GPU de 6 GB, por lo que el modelo y el batch indicado caben en ese presupuesto.
- La salida es un tensor fijo de 300 detecciones por imagen, lo que acota memoria de salida y simplifica el postprocesado.
- Despliegue confirmado: API Python de Ultralytics (PyTorch) y ONNX Runtime (opset 18, entrada `1x3x640x640`). El repositorio solo distribuye `.pt` y `.onnx`; no se documentan en la informacion disponible otras rutas como TensorRT, OpenVINO, CoreML o TFLite, aunque Ultralytics ofrece utilidades de exportacion que habria que verificar por separado.
- Flujo de trabajo recomendado: convertir la imagen a escala de grises (`convert("L").convert("RGB")`), aplicar letterbox a 640 x 640 con relleno gris 114 y normalizar a [0, 1] para la ruta ONNX.

## Comparativa con modelos similares

No hay comparativas publicadas en la informacion disponible. Como referencia cualitativa:

- Detectores genericos de la familia Ultralytics (por ejemplo YOLOv8s o YOLO11s entrenados en COCO): son alternativas reutilizables para deteccion general de 80 clases, pero no reconocen puertas logicas sin un reentrenamiento especifico. No se dispone de sus parametros ni de sus metricas aplicadas al dataset LogicDrawer en la informacion proporcionada. Ese reentrenamiento seria el competidor directo de este modelo.
- Detectores de simbolos de diagramas (deteccion de componentes de esquematicos electronicos): existen trabajos y modelos orientados a simbolos de componentes (resistencias, condensadores, transistores), pero no se dispone de datos de parametros, contexto ni rendimiento en esta informacion.
- Modelos de segmentacion o vision-lenguaje aplicados a esquematicos: podrian abordar la tarea sin entrenamiento especifico, pero con coste computacional muy superior y sin metricas comparables disponibles aqui.

En resumen: la comparativa cuantitativa con alternativas no esta disponible; la ventaja verificable de este modelo es su tamano (9,95 M de parametros), su coste de entrenamiento (1,26 h en 6 GB) y la ausencia de NMS en la ruta ONNX.

## Limitaciones y advertencias

- Cobertura de clases cerrada: solo detecta siete tipos de puerta. No reconoce buffers, puertas tri-state, AOI/OAI, biestables, multiplexores ni cualquier otro simbolo, y tampoco texto de etiquetas o lineas de conexion.
- Localizacion menos precisa que la clasificacion: el mAP50:95 en test es 0,659 y el mAP75 0,785, frente a un mAP50 de 0,961. Para reconstruir topologias que dependan de la posicion exacta de pines o de la alineacion de cables, el ajuste de caja puede ser insuficiente.
- Desbalance de fuentes: las fotos de circuitos manuscritos representan solo alrededor del 8 % de las imagenes de entrenamiento, por lo que el rendimiento en ese subdominio podria ser inferior al agregado. El autor no desglosa metricas por fuente.
- Riesgo de sesgo de dominio: validacion y prueba comparten la mezcla de fuentes del entrenamiento (fotos de movil, escaneos y renders). Los resultados no garantizan generalizacion a estilos de dibujo, iluminacion, papel, rotaciones fuertes o resoluciones distintas de las vistas en entrenamiento.
- Metricas no verificadas de forma independiente: el model-index marca los resultados como `verified: false`; son cifras declaradas por el autor.
- Limite de 300 detecciones por imagen: la forma de salida ONNX `[1, 300, 6]` implica que un circuito con mas de 300 puertas perdera detecciones.
- Preprocesado obligatorio: la entrada debe convertirse a escala de grises y aplicar letterbox con relleno 114. Omitir el letterbox o la conversion degrada las detecciones, ya que el entrenamiento se hizo en grises y con esa canonica.
- Dependencia de version: el `.pt` requiere una version de ultralytics con soporte de YOLO26 (8.4.x, >= 8.4.146). Con versiones anteriores la carga fallara.
- Riesgo de alucinacion: como todo detector, puede producir falsos positivos en trazos que se parezcan a una puerta (por ejemplo, cruces de lineas o anotaciones manuscritas); se recomienda umbral de confianza >= 0,25 y validacion posterior.
- Licencia AGPL-3.0: es copyleft con obligaciones de red. Ofrecer el modelo como servicio en linea obliga a poner a disposicion el codigo fuente correspondiente bajo la misma licencia; para productos propietarios hay que evaluar una licencia comercial alternativa o sustituir el modelo. Conviene revisar las implicaciones antes de integrarlo en produccion.
- Cero traccion comunitaria en el momento de la publicacion: 0 descargas y 0 likes, sin retroalimentacion externa ni incidencias documentadas.
- Fechas de metadatos anomales: el repositorio figura como creado el 2026-09-11, dato que conviene verificar antes de citarlo.

## Enlaces

- Hugging Face (modelo): https://huggingface.co/KaanAydinli/logicdrawer-yolo26s
- Pesos PyTorch: `logicdrawer_yolo26s.pt` (en el repositorio de Hugging Face)
- Pesos ONNX (opset 18): `logicdrawer_yolo26s.onnx` (en el repositorio de Hugging Face)
- Estadisticas del dataset: `dataset_stats.json` (en el repositorio de Hugging Face)
- Argumentos de entrenamiento: `training_args.yaml` (en el repositorio de Hugging Face)
- Ultralytics (framework): https://github.com/ultralytics/ultralytics
- No se han encontrado papers, blogs ni demos adicionales en los resultados de busqueda web disponibles: los enlaces devueltos corresponden a Telegram (telegram.org, desktop.telegram.org, promote.telegram.org) y no guardan relacion con el modelo.
