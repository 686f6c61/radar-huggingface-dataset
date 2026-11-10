# nuven-mira/yolo26s-serial-small-10-11-26

## Resumen

YOLO26s Serial Number Bounding Box es un modelo de deteccion de objetos derivado de YOLO26s (variante small de Ultralytics) y ajustado por el usuario nuven-mira para localizar el numero de serie impreso en fotografias de contadores electricos industriales. El modelo devuelve una unica caja delimitadora por numero de serie, pensada para ser recortada y enviada a un paso posterior de OCR. No realiza reconocimiento de caracteres por si mismo: su tarea es exclusivamente de localizacion (una clase, `serial_number`).

Se trata de un fine-tuning sobre el checkpoint `yolo26s.pt` preentrenado en COCO, con 9.948.638 parametros y 22,7 GFLOPs, entrenado a 640 px sobre el dataset `nuven-mira/serial-number-bbox-v1.0` (8.695 imagenes de campo de 480x640 y 8.696 cajas anotadas manualmente en Label Studio). El resultado en el split de test (870 imagenes no vistas) es mAP50 = 0,9748 y mAP50-95 = 0,7980, con un umbral de confianza recomendado de 0,39 que maximiza F1 (0,9713).

Su relevancia practica esta en el nicho industrial: automatiza el preprocesado de lecturas de contadores (recorte del numero de serie) antes de un motor OCR, con latencia de 10,7 ms/imagen en una RTX 3050 y un peso de solo 20,3 MB en FP32, lo que permite despliegue en el borde. La licencia CC BY 4.0 facilita su uso comercial con atribucion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO26s (Ultralytics, 260 capas), detector de una etapa |
| Parametros totales | 9.948.638 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada de imagen a 640 px) |
| Tipos de cuantizacion | no disponible (pesos publicados en FP32; no se documentan variantes INT8/FP16) |
| Idiomas soportados | no disponible (no procesa texto; los digitos del numero de serie son el objeto detectado) |
| Licencia | CC BY 4.0 |
| Formato de pesos | `.pt` (PyTorch, Ultralytics), 20,3 MB en FP32 |

## Arquitectura y entrenamiento

El modelo es un detector YOLO26 en variante small: red convolucional de una etapa con 260 capas, 9,95 M de parametros y 22,7 GFLOPs, que predice cajas delimitadoras y una unica clase (`serial_number`). Se parte del checkpoint `yolo26s.pt` preentrenado en COCO y se realiza fine-tuning supervisado con el framework Ultralytics 8.4.184 sobre PyTorch 2.11.0+cu128, en Python 3.10.12.

El dataset de entrenamiento contiene 8.695 fotos de campo de contadores electricos (480x640) con 8.696 cajas anotadas manualmente. El autor creo un split determinista 80/10/10 con semilla 42 (6.956/869/870 imagenes; 6.957/869/870 cajas) mediante `split_dataset.py`, forzando duplicados byte-identicos al mismo split (no se encontraron duplicados). Los hiperparametros principales fueron: 100 epocas con early stopping (paciencia 30, parada en la epoca 91, mejor epoca 61), `imgsz=640`, `batch=16`, `workers=2`, `seed=42`, `deterministic=True`, optimizador MuSGD automatico con lr=0,01 y momentum 0,9, AMP activado y cache desactivado. El entrenamiento completo tardo aproximadamente 4,3 h en una unica NVIDIA RTX 3050 de 8 GB, con una interrupcion reanudada desde `last.pt` con `resume=True`. No se documenta uso de RLHF/DPO ni tecnicas de decodificacion especulativa, al no ser un modelo generativo de texto.

## Capacidades

- Deteccion de objetos con una sola clase: localiza el numero de serie impreso en fotos de contadores electricos y devuelve una caja delimitadora por instancia.
- Salida en formato de bounding box lista para recorte y envio a un motor OCR externo (el modelo no transcribe digitos).
- Localizacion precisa: IoU medio de 0,8915 y error de centro medio de 2,29 px sobre los verdaderos positivos con confianza >= 0,39.
- Robustez por tamano de caja: recall entre 0,9587 y 0,9771 en los cuatro cuartiles de area del ground truth.
- Inferencia rapida: 10,7 ms/imagen (aproximadamente 93 FPS) en RTX 3050 con batch 1.
- Entrenamiento e inferencia reproducibles mediante la libreria Ultralytics y scripts documentados (`split_dataset.py`, `metrics_report.py`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision general, audio ni modo thinking: es un detector de vision especializado.

## Casos de uso

- Lectura automatizada de contadores electricos: el modelo recorta el numero de serie de cada foto de campo y lo entrega a un OCR; el umbral 0,39 maximiza F1 (0,9713) y reduce falsos positivos frente a umbrales mas bajos.
- Digitalizacion masiva de inventario industrial: procesar lotes de fotografias historicas de contadores para extraer la region del numero de serie antes de un pipeline OCR, con 93 FPS en una GPU de consumo.
- Control de calidad en fabricacion: verificar en linea que el numero de serie esta presente y correctamente impreso en cada unidad fotografiada, detectando ausencias o desplazamientos.
- Mantenimiento predictivo y trazabilidad: asociar cada lectura de contador a su numero de serie para auditar historicos de consumo por equipo.
- Despliegue en el borde: con 20,3 MB de pesos FP32 y 10,7 ms/imagen en RTX 3050, cabe en dispositivos con GPU modesta o en estaciones de inspeccion locales sin conexion.
- Preprocesado de datasets OCR: generar recortes etiquetados de numeros de serie para entrenar o evaluar motores de reconocimiento de caracteres en dominios industriales.
- Automatizacion de inspecciones con dron o camara movil: el recall del 97,2 % de imagenes con deteccion perfecta y el 3,0 % de imagenes con al menos un falso positivo lo hacen apto para capturas no controladas.

## Benchmarks y rendimiento

Resultados en el split de test (870 imagenes no vistas), emparejamiento TP/FP con IoU >= 0,5:

| Metrica | Valor |
|---|---|
| mAP50 | 0,9748 |
| mAP50-95 | 0,7980 |
| AP50 / AP75 / AP50-95 (COCO 101 puntos) | 0,9737 / 0,8323 / 0,7947 |
| Precision / Recall (val Ultralytics) | 0,9662 / 0,9678 |
| Confianza en F1 maximo | 0,39 |
| P / R / F1 a 0,39 | 0,9702 / 0,9724 / 0,9713 |
| TP / FP / FN a 0,39 | 846 / 26 / 24 |
| ECE (calibracion) | 0,1119 |
| Latencia (RTX 3050, batch 1) | 10,7 ms/imagen (~93 FPS) |

Umbral de operacion:

| Umbral | Precision | Recall | F1 | TP | FP | FN |
|---|---|---|---|---|---|---|
| 0,25 | 0,9230 | 0,9782 | 0,9498 | 851 | 71 | 19 |
| 0,50 | 0,9744 | 0,9621 | 0,9682 | 837 | 22 | 33 |
| 0,39 (F1 maximo) | 0,9702 | 0,9724 | 0,9713 | 846 | 26 | 24 |

Calidad de localizacion (846 TP con confianza >= 0,39):

| Metrica | Media | Mediana | p10 | p90 |
|---|---|---|---|---|
| IoU | 0,8915 | 0,9425 | 0,7171 | 0,9808 |
| Error de centro (px) | 2,29 | 0,86 | 0,26 | 4,38 |
| Error relativo de anchura | 2,9 % | 0,9 % | 0,1 % | 7,4 % |
| Error relativo de altura | 7,6 % | 3,5 % | 0,6 % | 21,4 % |

Robustez por cuartil de area del ground truth:

| Cuartil de area | GT | Recall |
|---|---|---|
| Q1 (menor, < 3610 px²) | 218 | 0,9771 |
| Q2 | 217 | 0,9770 |
| Q3 | 217 | 0,9770 |
| Q4 (mayor) | 218 | 0,9587 |

No se han publicado comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; con 9,95 M de parametros y pesos FP32 de 20,3 MB, la huella es minima (por debajo de 1 GB incluyendo activaciones a 640 px con batch pequeno).
- GPU recomendadas: el autor entreno e infirio en una NVIDIA RTX 3050 de 8 GB; cualquier GPU con al menos 4 GB de VRAM es suficiente para inferencia en batch 1.
- Cabe en GPU de consumo: si, incluidas RTX 3050, RTX 3060, RTX 4060 y superiores; tambien en CPU para inferencia no critica en latencia.
- Opciones de despliegue: Ultralytics (Python, CLI `yolo`), exportacion a ONNX, TensorRT y OpenVINO mediante el propio framework; no se documenta soporte nativo en vLLM, llama.cpp, Ollama ni TGI (no aplicables a un detector de vision).
- Latencia y throughput: 10,7 ms/imagen y aproximadamente 93 FPS en RTX 3050 con batch 1; no se publican mediciones en otras GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| YOLO26s Serial Number (este) | 9,95 M | imagen 640 px | mAP50 0,9748 / mAP50-95 0,7980 en test propio | CC BY 4.0 | Hugging Face (`.pt`) |
| YOLO26s base (COCO) | 9,95 M (referencia) | imagen 640 px | no disponible en esta ficha | no disponible | Ultralytics |
| Alternativas de deteccion de texto/numeros en contadores | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Dominio restringido: entrenado exclusivamente con fotos de contadores electricos (480x640); el rendimiento en otros productos, iluminaciones o camaras no esta validado.
- No realiza OCR: solo localiza la caja; la transcripcion de digitos requiere un motor externo y sus errores se suman al pipeline.
- Calibracion imperfecta: ECE de 0,1119, por lo que las confianzas no deben interpretarse como probabilidades exactas.
- Sesgo de anotacion: las cajas fueron anotadas manualmente en Label Studio por el autor; no se documenta auditoria inter-anotador ni diversidad geografica del dataset.
- Falsos positivos residuales: 3,0 % de imagenes con al menos un FP (0,03 FP/imagen) a confianza >= 0,25; subir el umbral a 0,50 reduce FP a 22 pero eleva FN a 33.
- Error relativo de altura de caja del 7,6 % de media (p90 21,4 %), superior al de anchura; conviene añadir margen al recorte antes del OCR.
- Licencia CC BY 4.0: permite uso comercial con atribucion; no se documentan restricciones adicionales, pero debe verificarse la atribucion al autor y al dataset.
- Sin datos de benchmarks frente a alternativas ni validacion en produccion a gran escala; el modelo tiene 0 descargas y 0 likes en el momento de la consulta.
- Idiomas y cuantizaciones no documentados; el repo tiene 0,0 GB de tamano reportado, por lo que conviene verificar la integridad de los pesos antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nuven-mira/yolo26s-serial-small-10-11-26
- Dataset: https://huggingface.co/datasets/nuven-mira/serial-number-bbox-v1.0
- Ultralytics (framework): https://github.com/ultralytics/ultralytics
- Manifiesto de split: `split_manifest.json` en el repositorio del modelo
- Scripts de entrenamiento y evaluacion (`split_dataset.py`, `metrics_report.py`): referenciados en la model card como parte de la carpeta de experimentos del repositorio de entrenamiento (enlace no disponible)
