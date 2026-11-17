# AILHERME/coffee-vision-sentinel-yolo11n

## Resumen

Coffee Vision Sentinel (YOLOv11 Nano) es un modelo de deteccion de objetos desarrollado por AILHERME, orientado al sector del agronegocio del cafe. Integra en un unico modelo ultraligero dos tareas: la evaluacion del punto de maduracion de los frutos del cafe y el diagnostico precoz de enfermedades foliares. Se distribuye en tres formatos (PyTorch, ONNX y TFLite) para cubrir despliegues en servidor y en dispositivos moviles.

Tecnicamente se trata de una instancia de YOLO11 en su variante Nano, la mas pequena de la familia Ultralytics, reentrenada sobre un dataset especifico de cafeicultura con nueve clases (cinco de fruto y cuatro de hoja). El modelo resuelve un problema practico del sector: la inspeccion manual de maduracion y sanidad del cafetal es lenta y subjetiva, y este modelo la automatiza en el borde con un artefacto de pocos megas.

Es relevante ahora porque demuestra el patron de especializacion de modelos de vision ultraligeros para dominios verticales concretos (agricultura de precision) con licencia Apache 2.0, lo que permite uso comercial sin restricciones. El repositorio es de muy reciente creacion y cuenta con cero descargas, por lo que debe considerarse un modelo emergente sin validacion externa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO11 (Ultralytics), variante Nano, deteccion de objetos |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | no disponible (se distribuyen pesos nativos, ONNX y TFLite; no se detallan niveles de cuantizacion) |
| Idiomas soportados | no disponible (etiquetas de clase en portugues e ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`best.pt`, 5.5 MB), ONNX (`model.onnx`, 10.8 MB), TFLite (`model.tflite`, 10.7 MB) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura YOLO11 en su variante Nano, una red de deteccion de objetos de una sola etapa (single-stage) con backbone convolucional y cabeza de prediccion densa. No es un transformer ni un modelo MoE: es una CNN de deteccion optimizada para latencia baja y bajo consumo de memoria. El tamano de los pesos PyTorch (5.5 MB) es coherente con la variante Nano de Ultralytics.

El conjunto de validacion reportado por el autor consta de 247 imagenes y 2.016 instancias, con nueve clases: cinco de fruto (`cherry_dry`, `cherry_overripe`, `cherry_ripe`, `cherry_unripe`, `cherry_semiripe`) y cuatro de hoja (`leaf_miner`, `leaf_phoma`, `leaf_rust`, `leaf_cercospora`). No se especifican en la informacion disponible el numero de imagenes de entrenamiento, la composicion del dataset, las tecnicas de aumento de datos ni si se aplico alguna estrategia de ajuste fino especifica. Tampoco se documentan innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, etc.), que no aplican a este tipo de modelo.

## Capacidades

- Deteccion de objetos multiclase en imagenes de cafetales: frutos en cinco estados de maduracion y hojas con cuatro tipos de afeccion.
- Clasificacion del punto de maduracion del fruto: seco/pasa, sobremaduro, maduro/cereja, verde/imaturo y verde-cana/pinton.
- Diagnostico de enfermedades foliares: bicho minero, mancha de Phoma, roya del cafeto y cercosporiosis.
- Inferencia en el borde: el artefacto TFLite (10.7 MB) permite ejecucion offline en Android e iOS.
- Inferencia en servidor y web mediante ONNX (10.8 MB).
- Integracion con el ecosistema Ultralytics (carga directa desde Hugging Face, `predict`, `show`).
- No dispone de tool calling, capacidades de agente, razonamiento multi-paso ni procesamiento de lenguaje natural.
- No dispone de modo thinking, vision general ni audio: es exclusivamente un detector de objetos de dominio.

## Casos de uso

- **Monitorizacion de maduracion en campo:** captura de imagenes de ramos de cafe con un movil o dron y ejecucion del modelo TFLite para estimar la distribucion de estados de maduracion antes de la cosecha, lo que permite planificar la recoleccion selectiva.
- **Diagnostico temprano de roya y cercosporiosis:** procesamiento de fotografias de hojas en campo para detectar senales de `leaf_rust` y `leaf_cercospora`. Dado que estas clases tienen el rendimiento mas bajo, debe usarse como alerta temprana supervisada, no como diagnostico definitivo.
- **Aplicacion de agroquimicos dirigida:** integracion del modelo ONNX en un sistema de vision embarcado en pulverizadores para localizar hojas afectadas y reducir la aplicacion a las zonas con presencia de enfermedad.
- **Trazabilidad y control de calidad en beneficio:** uso en la linea de postcosecha para clasificar lotes por proporcion de frutos verdes, maduros y sobremaduros a partir de imagenes de tolvas o cintas.
- **Aplicacion movil offline para el agricultor:** despliegue del TFLite en una app Android/iOS que funcione sin conectividad en fincas remotas, con inferencia local a partir de la camara del dispositivo.
- **Generacion de datasets y anotacion asistida:** uso del modelo como preetiquetador en pipelines de anotacion para ampliar el dataset con nuevas imagenes y reentrenar el modelo con mas datos.
- **Investigacion agronomica:** extraccion de metricas cuantitativas de maduracion y sanidad foliar en parcelas experimentales para estudios de fenologia del cafe.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre un conjunto de test de 247 imagenes y 2.016 instancias:

| Metrica | Valor |
|---|---|
| mAP50 general | 75,8 % |
| mAP50-95 general | 60,9 % |

Rendimiento por clase:

| Clase | Tipo | mAP50 | Recall |
|---|---|---|---|
| cherry_dry | Fruto | 95,8 % | 94,4 % |
| cherry_overripe | Fruto | 93,3 % | 92,0 % |
| cherry_ripe | Fruto | 91,5 % | 91,5 % |
| cherry_unripe | Fruto | 91,1 % | 93,3 % |
| cherry_semiripe | Fruto | 86,2 % | 87,0 % |
| leaf_miner | Hoja | 83,0 % | 84,7 % |
| leaf_phoma | Hoja | 56,7 % | 61,7 % |
| leaf_rust | Hoja | 46,9 % | 56,0 % |
| leaf_cercospora | Hoja | 37,6 % | 34,5 % |

No se han publicado comparaciones con otros modelos en la informacion disponible. La marcada diferencia entre clases de fruto (86-96 % mAP50) y clases de hoja (38-83 % mAP50) sugiere un desbalance en el dataset o una mayor dificultad visual de las lesiones foliares.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para el modelo PyTorch; el artefacto ONNX y el TFLite reducen aun mas el consumo, siendo aptos para dispositivos sin GPU dedicada.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) ejecuta el modelo con holgura; tambien es viable en CPU para lotes pequenos.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer e incluso en CPU y en moviles.
- Opciones de despliegue: Ultralytics (PyTorch), ONNX Runtime, TensorFlow Lite / Google LiteRT para Android e iOS.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | mAP50 | Licencia | Formatos |
|---|---|---|---|---|---|
| Coffee Vision Sentinel (YOLO11n) | no disponible (pesos de 5,5 MB) | no aplica | 75,8 % (test propio) | Apache 2.0 | PyTorch, ONNX, TFLite |
| YOLO11n (Ultralytics, COCO) | no disponible | no aplica | no disponible en esta informacion | AGPL-3.0 / Enterprise | PyTorch, ONNX, TFLite |
| YOLOv8n (Ultralytics, COCO) | no disponible | no aplica | no disponible en esta informacion | AGPL-3.0 / Enterprise | PyTorch, ONNX, TFLite |

No se dispone de comparaciones directas con otros modelos especializados en cafe publicadas en la informacion proporcionada. La comparativa con YOLO11n y YOLOv8n genericos es estructural (misma familia y tamano), no de rendimiento en este dominio.

## Limitaciones y advertencias

- **Rendimiento desigual por clase:** las clases foliares de roya (46,9 % mAP50) y cercosporiosis (37,6 % mAP50) tienen un rendimiento bajo, insuficiente para diagnosticos automatizados sin supervision humana.
- **Dataset de validacion pequeno:** 247 imagenes y 2.016 instancias; las metricas pueden no generalizar a otras variedades de cafe, condiciones de iluminacion o regiones geograficas.
- **Sin validacion externa:** cero descargas y cero likes en el momento de la ficha; no hay evidencia independiente de su rendimiento en produccion.
- **Riesgo de falsos negativos en enfermedades:** el recall bajo en cercosporiosis (34,5 %) implica que el modelo puede no detectar mas de la mitad de las hojas afectadas.
- **Sesgos de dominio:** el dataset no esta documentado; se desconoce su composicion geografica, variedades de cafe y condiciones de captura, lo que puede introducir sesgos hacia un entorno concreto.
- **Sin capacidades de lenguaje ni razonamiento:** no es un modelo multimodal ni de texto; cualquier tarea fuera de la deteccion de objetos en imagenes de cafe queda fuera de su alcance.
- **Licencia Apache 2.0:** permite uso comercial sin restricciones, pero conviene verificar las obligaciones de la licencia de Ultralytics en funcion del uso de sus herramientas de entrenamiento.
- **Idiomas:** no aplica; las etiquetas de clase estan en portugues e ingles.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AILHERME/coffee-vision-sentinel-yolo11n
- Pesos PyTorch: https://huggingface.co/AILHERME/coffee-vision-sentinel-yolo11n/resolve/main/best.pt
- Ultralytics (framework): https://github.com/ultralytics/ultralytics
- Documentacion de YOLO11: https://docs.ultralytics.com/models/yolo11/
- Google LiteRT (TFLite): https://ai.google.dev/edge/litert
- ONNX Runtime: https://onnxruntime.ai/
