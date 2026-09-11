# KissTheHabit/yolov8n-table-yolo

## Resumen

yolov8n-table-yolo es un detector de objetos YOLOv8n ajustado mediante fine-tuning para reconocer siete clases de menaje y superficie de mesa: `plate`, `cup`, `fork`, `spoon`, `knife`, `napkin` y `drawer`. Lo publica el usuario KissTheHabit (The Hidden Canopy LLC) como parte del stack OMNI-Q_Weird_Stuff_Machine, donde cumple la funcion de "ojos" del sistema. El repositorio no incluye pipeline de NLP ni generacion de texto: es exclusivamente un modelo de vision por computador para deteccion en una etapa.

El modelo parte de un checkpoint previo del mismo autor, KissTheHabit/yolov8n-hituav-thermal-finetune, y se reentrena sobre un dataset propio construido a partir de COCO train2017 y LVIS v1 train, con deduplicacion perceptual (dHash) contra una version anterior. El repositorio distribuye dos juegos de pesos: `yolov8n-table-yolo-ftv2.pt` (91 epocas, mAP50 0.324 sobre 15.906 imagenes) y `yolov8n-table-yolo-ft50-v1.pt` (35 epocas, mAP50 0.172 sobre 2.723 imagenes).

Su relevancia actual es doble. Por un lado, es un ejemplo de detector especializado de bajo coste computacional pensado para despliegue en el borde. Por otro, el autor publica evidencia de cuantizacion extrema poco habitual: round-trips de solo pesos (weight-only) a traves de codecs MXFP4, NVINT2 y MXFP2, con el resultado de que la deteccion colapsa a 4 bits o menos, lo que convierte al repositorio en un caso documentado de los limites de la cuantizacion post-entrenamiento en tareas densas de deteccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOv8n (detector de objetos en una etapa, familia Ultralytics YOLOv8, variante nano); no se detalla la topologia interna en la model card |
| Parametros totales | no indicado en la model card; la documentacion publica de Ultralytics situa YOLOv8n en torno a 3,2 M de parametros |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision); entrenado y evaluado con `imgsz=640` |
| Tipos de cuantizacion | FP32 (entrenamiento e inferencia de referencia); se documenta evidencia de codec en MXFP4, MXFP8, NVINT2 y MXFP2, pero no se publican pesos en esos formatos |
| Idiomas soportados | no aplica (modelo de vision); las etiquetas de clase estan en ingles |
| Licencia | `other` — source-available, The Hidden Canopy LLC |
| Formato de pesos | `.pt` (PyTorch, cargable con la libreria `ultralytics`) |

Otros datos del repositorio: pipeline declarado `object-detection`, 0 descargas, 0 likes, tamano de repositorio reportado 0.0 GB, creado el 2026-09-11 y actualizado ese mismo dia.

## Arquitectura y entrenamiento

La base es YOLOv8n, la variante nano de la familia YOLOv8 de Ultralytics: un detector en una etapa que predice cajas delimitadoras, clase y confianza en una sola pasada sobre la imagen. La model card no describe la topologia de la red (backbone, cuello ni cabeza) ni los hiperparametros de la funcion de perdida, por lo que la informacion arquitectonica disponible se limita a la identificacion del checkpoint base.

El entrenamiento se realizo sobre un checkpoint ya ajustado a un dominio distinto (termografia HIT-UAV), no sobre pesos COCO originales. La receta documentada es: 50 epocas con paciencia 10 (parada efectiva en la 35) para `ft50-v1`, red completamente descongelada, batch 32, `imgsz=640`, ultralytics 8.4.146 y una RTX 3090. El segundo checkpoint, `ftv2`, alcanzo 91 epocas con parada temprana desde un maximo de 100. Los datos son de origen COCO train2017 y LVIS v1 train (con muestreo tipo Open Images en la version v1), deduplicados con dHash contra el conjunto v1; el repositorio redistribuye unicamente los pesos, no las imagenes.

La innovacion tecnica destacable no esta en el entrenamiento sino en la evidencia de cuantizacion publicada. Sobre el split de validacion de table_yolo_v2 (1.604 imagenes), el mAP50 pasa de 0.324 en FP32 a 0.078 en MXFP4 y a aproximadamente 0 en NVINT2 y MXFP2, pese a que los cosenos de round-trip del codec son iguales o superiores a 0.99. El autor concluye que la cuantizacion ingenua solo de pesos colapsa la deteccion a 4 bits o menos y que el siguiente paso es QAT o cuantizacion que preserve la cabeza del detector.

## Capacidades

- Deteccion de objetos en 7 clases cerradas: `plate`, `cup`, `fork`, `spoon`, `knife`, `napkin`, `drawer`.
- Salida por instancia con caja delimitadora, clase y puntuacion de confianza, en el formato estandar de Ultralytics.
- Inferencia sobre imagen individual mediante `YOLO(...).predict(...)`; admite tambien lotes, video y flujo de camara por la API de Ultralytics, aunque no esta documentado en la model card.
- Orientado a despliegue en el borde: el tag `edge` y el tamano nano apuntan a dispositivos con recursos limitados.
- Compatibilidad con cuantizacion de pesos mediante codecs MXFP/NVINT, con la salvedad del colapso de precision descrito mas arriba.
- No soporta tool calling ni function calling: no es un modelo de lenguaje.
- No soporta agentes ni razonamiento multi-paso: son capacidades fuera de su alcance.
- No tiene capacidades multilingues ni procesamiento de lenguaje natural.
- No se documentan capacidades de segmentacion de instancias, estimacion de pose, clasificacion de imagen completa ni vision-lenguaje en la informacion disponible.

## Casos de uso

- Control de inventario de menaje en hosteleria: contar existencias de platos, vasos y cubiertos por estacion de trabajo a partir de una camara cenital. Las siete clases del modelo cubren directamente el inventario basico de una mesa y el despliegue nano permite ejecutarlo en el propio puesto sin depender de un servidor central.
- Automatizacion de retirada de bandejas y vajilla en restauracion de colectividades: un brazo robotico o una cinta transportadora puede localizar cada pieza sobre la bandeja y planificar la recogida. La clase `napkin` y `drawer` permiten distinguir residuos de papel y cajones abiertos dentro de la misma escena.
- Verificacion de calidad en lavado industrial de vajilla: tras el ciclo de lavado, el detector comprueba que el juego de cubiertos esta completo y que ninguna pieza ha quedado retenida en la cesta, usando umbrales de confianza ajustados a la baja para maximizar el recuerdo (recall).
- Analitica de consumo en comedores y hospitales: registrar que tipo de menaje se usa en cada bandeja devuelta permite estimar ratios de uso y planificar reposiciones. El mAP50 de 0.324 obliga a operar en un regimen de agregacion estadistica, no de conteo pieza a pieza exacto.
- Preanotacion de datasets de menaje: el modelo puede generar cajas candidatas sobre imagenes nuevas para que un anotador humano las corrija, reduciendo el coste de construir un corpus propio. La receta de entrenamiento documentada (checkpoint base, batch, epocas, `imgsz`) sirve como punto de partida reproducible para ese fine-tuning.
- Deteccion de cajones abiertos en entornos domesticos o de oficina: la clase `drawer` permite integrarlo en sistemas de seguridad o de ahorro energetico que avisen si un cajon queda abierto, con integracion sencilla mediante ONNX Runtime en un dispositivo embebido.
- Investigacion sobre cuantizacion en deteccion: el repositorio publica la curva completa FP32 -> MXFP4 -> NVINT2/MXFP2 con cosenos de round-trip altos y mAP50 derrumbado, lo que lo convierte en un banco de pruebas util para comparar tecnicas de QAT o cuantizacion con preservacion de cabeza frente a la cuantizacion post-entrenamiento ingenua.
- Sistemas de vision para inventario de cocina en dark kitchens: combinado con un contador de eventos, permite estimar la tasa de consumo de menaje desechable y reutilizable por turno, siempre que el sesgo de falsos positivos se calibre con datos del propio local.

## Benchmarks y rendimiento

La model card solo publica mAP50 de validacion. No hay resultados de MMLU, HumanEval, GSM8K ni de ningun benchmark de lenguaje, porque el modelo no realiza esas tareas.

| Checkpoint | Dataset de validacion | Imagenes de entrenamiento | Epocas | mAP50 |
|---|---|---|---|---|
| `yolov8n-table-yolo-ftv2.pt` | table_yolo_v2 (COCO train2017 + LVIS v1 train, deduplicado frente a v1) | 15.906 | 91 (parada temprana desde 100) | 0.324 |
| `yolov8n-table-yolo-ft50-v1.pt` | table_yolo_v1 (COCO/LVIS/Open Images) | 2.723 | 35 (parada temprana desde 50) | 0.172 |

Evidencia de cuantizacion sobre `ftv2`, medida en el split de validacion de table_yolo_v2 (1.604 imagenes), experimento `yolo_2bit_map_20260911_071815`:

| Precision de pesos | mAP50 |
|---|---|
| FP32 | 0.324 |
| MXFP4 | 0.078 |
| NVINT2 | aproximadamente 0 |
| MXFP2 | aproximadamente 0 |

No se han publicado resultados de benchmarks frente a modelos de terceros en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: las cifras concretas no estan publicadas. Para un detector nano a `imgsz=640`, el peso de los parametros es de unos pocos megabytes y el consumo lo domina el mapa de activaciones; en la practica suele bastar con 1-2 GB en FP32 y por debajo de 1 GB con TensorRT en FP16, pero son estimaciones, no datos medidos por el autor.
- GPU de entrenamiento documentada: una RTX 3090 para ambos checkpoints publicados.
- GPU recomendadas para inferencia: cualquier GPU CUDA moderna es sobredimensionada; una RTX 3060, RTX 4090 o un acelerador de borde tipo Jetson Orin son opciones proporcionadas al tamano del modelo.
- Cabe en GPU de consumo: si, con amplio margen. Tambien es viable en CPU, en iGPU y en aceleradores dedicados de baja potencia, aunque no se han publicado latencias medidas.
- Opciones de despliegue: la via documentada es Python con la libreria `ultralytics`. Al ser un modelo de vision, tambien son aplicables las exportaciones habituales de Ultralytics a ONNX, TensorRT, OpenVINO, TFLite, NCNN y CoreML, aunque ninguna se menciona en la model card. No aplican vLLM, llama.cpp, Ollama ni TGI, que son runtimes para modelos de lenguaje.
- Latencia y throughput: no disponible. La model card no incluye mediciones de FPS, latencia por imagen ni rendimiento por lote.

## Comparativa con modelos similares

No se dispone de datos comparativos con modelos de terceros en la informacion proporcionada. La unica comparacion posible es interna, entre los dos checkpoints del propio repositorio y su checkpoint base.

| Modelo | Dominio | Parametros | mAP50 publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| yolov8n-table-yolo (`ftv2`) | Menaje de mesa, 7 clases | no indicado (base YOLOv8n) | 0.324 en table_yolo_v2 | `other` (source-available, The Hidden Canopy LLC) | Pesos `.pt` en HuggingFace |
| yolov8n-table-yolo (`ft50-v1`) | Menaje de mesa, 7 clases | no indicado (base YOLOv8n) | 0.172 en table_yolo_v1 | `other` (source-available, The Hidden Canopy LLC) | Pesos `.pt` en HuggingFace |
| KissTheHabit/yolov8n-hituav-thermal-finetune | Termografia aerea, HIT-UAV | no indicado (base YOLOv8n) | no publicado en la informacion disponible | no disponible | Pesos `.pt` en HuggingFace |

No hay datos publicados que permitan situar este modelo frente a otros detectores de menaje o frente a versiones mayores de YOLOv8 (s, m, l, x).

## Limitaciones y advertencias

- Precision limitada: un mAP50 de 0.324 sobre el mejor checkpoint implica una tasa elevada de falsos positivos y falsos negativos. No es adecuado para conteos exactos ni para aplicaciones con requisito de precision alta sin una capa adicional de validacion.
- Colapso con cuantizacion agresiva: la cuantizacion post-entrenamiento solo de pesos degrada el mAP50 de 0.324 a 0.078 en MXFP4 y a practicamente cero en NVINT2 y MXFP2, pese a cosenos de round-trip superiores a 0.99. El propio autor indica que se necesita QAT o cuantizacion que preserve la cabeza del detector.
- Inconsistencia entre el mejor checkpoint y el ejemplo de uso: la tabla de pesos senala `yolov8n-table-yolo-ftv2.pt` como el mejor actual (mAP50 0.324), pero el fragmento de codigo de la model card carga `yolov8n-table-yolo-ft50-v1.pt` (mAP50 0.172). Conviene verificar cual se esta desplegando.
- Licencia no estandar: la licencia declarada es `other`, descrita como source-available por The Hidden Canopy LLC. No es una licencia open source reconocida, por lo que el uso comercial requiere revisar y aceptar los terminos del titular antes de integrarlo en produccion.
- Restricciones sobre los datos: las imagenes provienen de COCO, LVIS v1 y Open Images (anotaciones bajo CC-BY-4.0), pero el repositorio solo redistribuye pesos, no imagenes, porque las licencias upstream no conceden la redistribucion de las imagenes.
- Dominio cerrado y sesgo de origen: las siete clases son de menaje de mesa y cajones, con etiquetas en ingles. El modelo se entrena sobre imagenes de COCO y LVIS, con la distribucion de escenas, iluminacion y cultura material de esos corpus; su comportamiento en menaje no occidental o en condiciones de iluminacion no representadas es una incognita no medida.
- Sin analisis de sesgos publicado: no hay evaluacion de sesgo por genero, etnia, region ni condiciones de captura en la informacion disponible.
- Riesgo de alucinacion en sentido estricto no aplica (no genera texto), pero si existe el riesgo equivalente de detecciones espurias con confianza media sobre texturas que se parezcan a vajilla.
- Metadatos potencialmente incompletos: el repositorio figura con 0.0 GB de tamano, 0 descargas y 0 likes. Conviene verificar que los ficheros `.pt` se descargan correctamente antes de usarlos.
- Sin garantia de mantenimiento: la model card no documenta versionado, changelog ni compromiso de soporte.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/KissTheHabit/yolov8n-table-yolo
- Checkpoint base: https://huggingface.co/KissTheHabit/yolov8n-hituav-thermal-finetune
- Repositorio del proyecto OMNI-Q_Weird_Stuff_Machine: https://github.com/The-Hidden-Canopy/OMNI-Q_Weird_Stuff_Machine
- Recibo de datos del dataset v1 (dentro del repositorio anterior): `evidence/datasets/table_yolo_v1_20260910/`
- Evidencia de cuantizacion: experimento `yolo_2bit_map_20260911_071815` en el repositorio OMNI-Q
- La busqueda web realizada no devolvio ningun resultado relacionado con este modelo: los enlaces recuperados correspondian a catalogos de rodamientos de agujas sin conexion con el contenido de la ficha.
