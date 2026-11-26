# MirilAI/WALDO41-YOLOv26

## Resumen

WALDO 4.1 · YOLOv26 es una familia de detectores de objetos orientada a imagen aérea (drones, aeronaves y satélite), desarrollada por MirilAI. El modelo localiza doce clases de objetos —vehículos ligeros, personas, bicicletas, autobuses, camiones, embarcaciones, edificios, postes de servicios, contenedores marítimos, tanques de almacenamiento, excavadoras y paneles solares— incluyendo objetos de tan solo unos pocos píxeles. Se distribuye en cuatro tamanos (N, S, M, L) y su metrica principal es AP small, es decir, el rendimiento sobre objetos de hasta 32 px.

La familia se basa en la arquitectura YOLOv26, entrenada desde cero con un harness propio de MirilAI y sin etapa NMS: la red selecciona directamente sus cajas finales. El modelo mas pequeno (N) tiene 2,4 M de parametros y 6,6 GFLOPs a 640 px, mientras que el mayor (L) alcanza 54,7 M de parametros y 148,8 GFLOPs. Todos los tamanos se publican como checkpoint propio, checkpoint compatible con Ultralytics y ONNX, bajo licencia MIT.

Su relevancia radica en la combinacion de deteccion de objetos pequenos en imagenes aereas con un coste computacional reducido: segun la model card, los modelos YOLOv26 corren mas rapido en lote que los YOLOv8 equivalentes de MirilAI (por ejemplo, 1,18 ms frente a 1,32 ms por imagen en A100 para el tamano S) con entre el 54 % y el 73 % del computo, a costa de una pequena perdida de AP small (entre 0,006 y 0,023 puntos).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOv26 (familia YOLO, deteccion de objetos, sin NMS) |
| Parametros totales | N: 2,4 M; S: 9,4 M; M: 26,0 M; L: 54,7 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | no disponible (se distribuyen pesos FP32/FP16 en .pt y ONNX) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | .pt (checkpoint propio), .pt (Ultralytics), .onnx |

## Arquitectura y entrenamiento

La familia sigue la arquitectura YOLOv26, un detector de objetos de una sola etapa con seleccion de cajas integrada en la red (sin paso NMS posterior). Los cuatro tamanos comparten diseno y se diferencian en profundidad y anchura: N (2,4 M parametros, 6,6 GFLOPs a 640 px), S (9,4 M, 24,4 GFLOPs), M (26,0 M, 69,2 GFLOPs) y L (54,7 M, 148,8 GFLOPs). Los modelos se entrenaron desde cero con el harness propio de MirilAI, partiendo de pesos aleatorios en lugar de pesos preentrenados, lo que la model card senala como causa de la ligera brecha de AP small frente a sus YOLOv8.

El entrenamiento incorpora Obnubilated, una libreria de aumento de datos propia. A partir de la forma 3D estimada de cada foto de entrenamiento se generan recortes con iluminacion nueva (desde luz de amanecer baja hasta cielo cubierto, con sombras coherentes con edificios y arboles), niebla y calima que aumentan con la distancia, y defectos de camara (exposicion, ruido de sensor, desenfoque, compresion JPEG, perdida de resolucion, aberracion cromatica). Las cajas no se mueven: solo cambia la apariencia de la escena. Aproximadamente la mitad de las muestras recibe una nueva variacion en cada epoca y el aumento se desactiva en las ultimas 10 epocas para terminar el entrenamiento con imagenes reales. No se especifican en la informacion disponible el numero de tokens ni la composicion exacta del dataset de entrenamiento.

## Capacidades

- Deteccion de objetos en imagen aerea con doce clases: vehiculos ligeros, personas, bicicletas, autobuses, camiones, embarcaciones, edificios, postes de servicios, contenedores maritimos, tanques de almacenamiento, excavadoras y paneles solares.
- Deteccion de objetos pequenos, con AP small como metrica principal (objetos de hasta 32 px).
- Seleccion de cajas finales sin NMS integrada en la red.
- Robustez a condiciones de iluminacion, niebla, calima y defectos de camara aprendida mediante el aumento Obnubilated (herramienta de entrenamiento; en inferencia no se aplica).
- Exportacion a ONNX para despliegue en runtimes no PyTorch.
- Compatibilidad con el ecosistema Ultralytics mediante checkpoints estandar.
- No dispone de tool calling, agentes, razonamiento multi-paso ni capacidades de lenguaje o audio: es un modelo puramente de vision.

## Casos de uso

- Monitorizacion de trafico y aparcamiento en imagenes de satelite o dron: el modelo detecta vehiculos ligeros, autobuses y camiones en escenas cenitales, y su AP small de 0,371 a 0,468 permite contar unidades pequenas en imagenes de alta resolucion.
- Inspeccion de infraestructuras energeticas: deteccion de paneles solares, postes de servicios y tanques de almacenamiento en vuelos de dron, con el tamano M (0,455 AP small) como equilibrio entre precision y coste.
- Gestion de puertos y logistica: localizacion de contenedores maritimos y embarcaciones en imagenes portuarias, usando el tamano L cuando la prioridad es maxima recall sobre objetos pequenos.
- Seguridad y vigilancia de obra: deteccion de excavadoras, personas y vehiculos en imagenes aereas de obras, con el tamano N (6,6 GFLOPs, 0,70 ms por imagen en A100) para procesamiento en tiempo casi real a gran escala.
- Analisis urbanistico y catastral: identificacion de edificios y personas en ortofotos, aprovechando la robustez a cambios de iluminacion y haze aprendida con Obnubilated.
- Procesamiento por lotes en pipelines de teledeteccion: exportacion ONNX e inferencia en lote (por ejemplo, 1,18 ms por imagen con el tamano S en A100 FP16, batch 32) para clasificar grandes volumenes de teselas satelitales.
- Despliegue en edge sobre dron: el tamano N, con 2,4 M de parametros y 6,6 GFLOPs, es adecuado para inferencia a bordo con presupuesto energetico limitado, aunque no se detallan requisitos de VRAM en la informacion disponible.

## Benchmarks y rendimiento

Resultados sobre el conjunto de validacion congelado WALDO 4.0 (710 imagenes), con un unico evaluador para todos los modelos. Tiempos medidos en A100, FP16, batch 32, en caliente (modelo cargado, sin arranque), incluyendo seleccion de cajas; mediana de 200 ejecuciones cronometradas tras 30 no cronometradas.

| Metrica | N | S | M | L |
|---|---:|---:|---:|---:|
| AP small (objetos hasta 32 px) | 0,371 | 0,414 | 0,455 | 0,468 |
| mAP50-95 (todos los objetos) | 0,437 | 0,482 | 0,519 | 0,518 |
| GFLOPs a 640 px | 6,6 | 24,4 | 69,2 | 148,8 |
| Parametros | 2,4 M | 9,4 M | 26,0 M | 54,7 M |
| A100 ms por imagen (caliente) | 0,70 | 1,18 | 2,23 | 3,45 |
| YOLOv8 de MirilAI del mismo tamano, ms | 1,32 | 1,71 | 2,53 | 3,54 |

Comparacion con los YOLOv8 de MirilAI (entrenados con Obnubilated): los YOLOv8 obtienen entre 0,006 y 0,023 puntos mas de AP small al mismo tamano, pero los YOLOv26 logran resultados cercanos con el 54 %-73 % del computo y menor latencia en lote. No se han publicado en la informacion disponible resultados frente a benchmarks externos como MMLU, HumanEval o GSM8K, que no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada.
- GPU de referencia para las mediciones publicadas: NVIDIA A100 con FP16 y batch 32.
- Los tamanos N y S (2,4 M y 9,4 M de parametros, 6,6 y 24,4 GFLOPs) son candidatos razonables para GPU de consumo, pero no se publican requisitos de VRAM ni pruebas en RTX 4090 u otras tarjetas consumer.
- Opciones de despliegue: PyTorch (checkpoint propio o Ultralytics) y ONNX Runtime; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un detector de objetos.
- Latencia publicada: 0,70 ms (N), 1,18 ms (S), 2,23 ms (M) y 3,45 ms (L) por imagen en A100 FP16, batch 32, en caliente. No se publica throughput agregado ni latencia en otras GPU.

## Comparativa con modelos similares

| Modelo | Parametros | AP small | mAP50-95 | Latencia A100 (ms) | Licencia | Disponibilidad |
|---|---|---:|---:|---:|---|---|
| WALDO 4.1 YOLOv26 N | 2,4 M | 0,371 | 0,437 | 0,70 | MIT | HF (.pt, .onnx) |
| WALDO 4.1 YOLOv26 S | 9,4 M | 0,414 | 0,482 | 1,18 | MIT | HF (.pt, .onnx) |
| WALDO 4.1 YOLOv26 M | 26,0 M | 0,455 | 0,519 | 2,23 | MIT | HF (.pt, .onnx) |
| WALDO 4.1 YOLOv26 L | 54,7 M | 0,468 | 0,518 | 3,45 | MIT | HF (.pt, .onnx) |
| WALDO 4.0 YOLOv8 (mismo tamano, Obnubilated) | no detallado por tamano | 0,006-0,023 mas que YOLOv26 equivalente | no disponible | 1,32 / 1,71 / 2,53 / 3,54 (N/S/M/L) | no disponible en esta ficha | HF |

No se dispone en la informacion proporcionada de comparaciones con otros detectores de imagen aerea (por ejemplo, familias YOLO de terceros o modelos especificos de teledeteccion), por lo que esa comparativa se considera no disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible; al entrenarse sobre un dataset aereo concreto, el rendimiento puede degradarse en regiones, sensores o clases poco representadas.
- Riesgo de falsos positivos y negativos en objetos muy pequenos o parcialmente ocluidos; la metrica AP small de 0,371 en el tamano N indica margen de mejora en ese regimen.
- Los YOLOv26 rinden ligeramente por debajo de los YOLOv8 equivalentes de MirilAI en AP small (0,006-0,023 puntos) por haberse entrenado desde cero; la model card anticipa que WALDO 4.2 corrige esto con pesos preentrenados propios.
- Ambito limitado a doce clases de objetos y a imagen aerea; no es un modelo de lenguaje ni soporta tool calling, agentes o razonamiento multi-paso.
- El aumento Obnubilated es solo de entrenamiento; no debe aplicarse en inferencia.
- Licencia MIT: permite uso comercial, pero conviene verificar las condiciones de los datasets subyacentes, no detalladas en la informacion disponible.
- No se publican requisitos de VRAM, pruebas en GPU de consumo ni latencias fuera de A100, lo que dificulta planificar despliegues en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MirilAI/WALDO41-YOLOv26
- Familia YOLOv8 de MirilAI (WALDO 4.0): https://huggingface.co/MirilAI/WALDO40-YOLOv8
- Checkpoint Ultralytics N: https://huggingface.co/MirilAI/WALDO41-YOLOv26/resolve/main/ultralytics/waldo41-yolov26n-p2-obnubilated.pt
- Checkpoint Ultralytics S: https://huggingface.co/MirilAI/WALDO41-YOLOv26/resolve/main/ultralytics/waldo41-yolov26s-p2-obnubilated.pt
- Checkpoint Ultralytics M: https://huggingface.co/MirilAI/WALDO41-YOLOv26/resolve/main/ultralytics/waldo41-yolov26m-p2-obnubilated.pt
- Checkpoint Ultralytics L: https://huggingface.co/MirilAI/WALDO41-YOLOv26/resolve/main/ultralytics/waldo41-yolov26l-p2-obnubilated.pt
- ONNX N: https://huggingface.co/MirilAI/WALDO41-YOLOv26/resolve/main/onnx/waldo41-yolov26n-p2-obnubilated.onnx
- ONNX S: https://huggingface.co/MirilAI/WALDO41-YOLOv26/resolve/main/onnx/waldo41-yolov26s-p2-obnubilated.onnx
- ONNX M: https://huggingface.co/MirilAI/WALDO41-YOLOv26/resolve/main/onnx/waldo41-yolov26m-p2-obnubilated.onnx
- ONNX L: https://huggingface.co/MirilAI/WALDO41-YOLOv26/resolve/main/onnx/waldo41-yolov26l-p2-obnubilated.onnx
- Checkpoint propio N: https://huggingface.co/MirilAI/WALDO41-YOLOv26/resolve/main/weights/waldo41-yolov26n-p2-obnubilated.pt
- Checkpoint propio S: https://huggingface.co/MirilAI/WALDO41-YOLOv26/resolve/main/weights/waldo41-yolov26s-p2-obnubilated.pt
- Checkpoint propio M: https://huggingface.co/MirilAI/WALDO41-YOLOv26/resolve/main/weights/waldo41-yolov26m-p2-obnubilated.pt
- Checkpoint propio L: https://huggingface.co/MirilAI/WALDO41-YOLOv26/resolve/main/weights/waldo41-yolov26l-p2-obnubilated.pt
