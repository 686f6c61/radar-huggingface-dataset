# dronefreak/bdd100k-yolo11s

## Resumen

YOLO11s finetuneado sobre BDD100K es un detector de objetos de la familia YOLO11 de Ultralytics, especializado en escenas de conduccion. Lo publica el usuario dronefreak como parte de DetectionBench, un marco de trabajo orientado a comparar detectores modernos con recetas de entrenamiento y metricas de evaluacion identicas sobre varios datasets del mundo real. El checkpoint parte de Ultralytics/YOLO11 en su variante "s" (small) y se ha reentrenado sobre el dataset BDD100K, un benchmark clasico de conduccion autonoma con clases como coche, camion, autobus, persona, motorista, bicicleta, semaforo y senal de trafico.

El modelo resuelve una tarea concreta: deteccion de objetos en imagenes de trafico rodado con un presupuesto computacional reducido. Con 9,46 millones de parametros y 21,7 GFLOPs a 640 px, es un detector pensado para inferencia en tiempo real sobre hardware modesto, lo que lo hace relevante para prototipos de percepcion en vehiculos, sistemas de videovigilancia de trafico o analisis offline de grandes volumenes de imagenes.

La relevancia actual del checkpoint no esta tanto en la innovacion arquitectonica (YOLO11 es una arquitectura consolidada) como en su valor como referencia reproducible: forma parte de un zoo de modelos evaluados con el mismo pipeline, lo que permite comparar de forma justa su rendimiento frente a alternativas como YOLOv8s, YOLOv10s, YOLO26s o RF-DETR Nano. La licencia AGPL-3.0 y el hecho de que las metricas no esten verificadas por un tercero son factores a tener en cuenta antes de llevarlo a produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO11 (CNN, deteccion de objetos en una etapa) |
| Parametros totales | 9.461.646 (9,46 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en safetensors y best.pt; no se documentan cuantizaciones oficiales) |
| Idiomas soportados | no disponible (no es un modelo linguistico) |
| Licencia | AGPL-3.0 |
| Formato de pesos | safetensors y best.pt (PyTorch, libreria ultralytics) |

## Arquitectura y entrenamiento

La arquitectura es YOLO11 en su variante small: un detector de una etapa basado en redes convolucionales, con backbone y cuello de agregacion de caracteristicas multicapa y una cabeza de deteccion que predice cajas y clases directamente. El modelo base es Ultralytics/YOLO11, y este checkpoint es un finetune sobre BDD100K. El dato de FLOPs declarado por el autor es de 21,7 GFLOPs a 640 px, coherente con la variante "s" de la familia.

El entrenamiento se ha realizado dentro del marco DetectionBench, que impone una receta de entrenamiento y un pipeline de evaluacion comunes (`detectionbench-evaluate`) para todos los modelos del zoo. No se detalla en la informacion disponible el numero de tokens, la composicion exacta del dataset ni si se aplicaron tecnicas de aumento de datos especificas mas alla de las habituales en Ultralytics. Tampoco se documentan fases de RLHF o DPO, algo que no aplica a un detector de objetos. La innovacion tecnica destacable es la reproducibilidad: todos los modelos del zoo se entrenan y evaluan con la misma receta, lo que permite comparaciones homogeneas.

## Capacidades

- Deteccion de objetos en imagenes de escenas de conduccion: coche, camion, autobus, tren, persona, motorista, moto, bicicleta, semaforo y senal de trafico.
- Prediccion de cajas delimitadoras con puntuaciones de confianza por clase.
- Inferencia en tiempo real gracias a su tamano reducido (9,46 M de parametros, 21,7 GFLOPs a 640 px).
- Integracion nativa con la libreria `ultralytics`, incluyendo carga desde Hugging Face y ejecucion con `model.predict`.
- Soporte de tool calling / function calling: no aplica (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingues: no aplica.
- Capacidades especiales: no se documentan modos de pensamiento, vision adicional ni audio.

## Casos de uso

- Percepcion en prototipos de conduccion autonoma: el modelo detecta vehiculos, peatones y semaforos en imagenes de camara frontal, y su bajo coste computacional permite integrarlo en bucles de inferencia en tiempo real sobre hardware embebido o GPU de gama media.
- Analisis de trafico urbano a partir de grabaciones: procesar videos de camaras de trafico para contar vehiculos por clase y estimar ocupacion de carriles, aprovechando la deteccion de coche, camion, autobus y moto.
- Auditoria de infraestructura vial: detectar semaforos y senales de trafico en imagenes georreferenciadas para inventariar y mantener el estado de la senalizacion.
- Sistemas de alerta de peatones y ciclistas: usar las detecciones de persona, rider y bike para generar avisos en aplicaciones de seguridad vial o en sistemas ADAS de bajo coste.
- Preetiquetado de datasets de conduccion: emplear el modelo como generador de etiquetas iniciales en un pipeline de anotacion semi-automatica, reduciendo el coste de etiquetar nuevas imagenes de trafico.
- Benchmarking y seleccion de detectores: servir como referencia reproducible dentro de DetectionBench para comparar variantes de YOLO y otros detectores con la misma receta de entrenamiento antes de elegir un modelo para produccion.
- Analisis offline de grandes volumenes de imagenes: procesar lotes de imagenes de trafico en servidores sin GPU de altas prestaciones, dado el reducido numero de parametros y FLOPs del modelo.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el split de test de BDD100K, con el pipeline `detectionbench-evaluate`. No estan verificados por un tercero.

| Metrica | Valor (%) |
|---|---|
| mAP@50 | 57,63 |
| mAP@50-95 | 33,10 |
| Precision | 74,31 |
| Recall | 52,42 |
| F1 | 61,48 |
| Parametros | 9,5 M |
| FLOPs | 21,7 B (a 640 px) |

Rendimiento por clase (mAP@50 / mAP@50-95):

| Clase | mAP@50 | mAP@50-95 |
|---|---|---|
| person | 68,04 | 35,42 |
| rider | 48,69 | 25,05 |
| car | 82,48 | 51,56 |
| truck | 67,33 | 49,54 |
| bus | 66,07 | 51,25 |
| train | 0,20 | 0,12 |
| motor | 48,18 | 24,03 |
| bike | 52,33 | 26,59 |
| traffic light | 69,56 | 27,52 |

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 9,46 M de parametros, el modelo ocupa del orden de decenas de MB en precision FP32 y menos en FP16. No se dispone de cifras oficiales de VRAM.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el modelo esta pensado para hardware modesto. GPU de datacenter como A100 o H100 no son necesarias para inferencia individual, aunque pueden aprovecharse para procesar lotes grandes.
- Cabe en GPU consumer: si, practicamente en cualquier GPU consumer actual e incluso en CPU para inferencia por lotes pequenos.
- Opciones de despliegue: libreria `ultralytics` (PyTorch), exportacion a formatos soportados por Ultralytics (ONNX, TensorRT, entre otros) y carga directa desde Hugging Face con `hf_hub_download`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a un detector de objetos.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

Comparativa dentro del zoo de BDD100K de DetectionBench (metricas declaradas por el autor, no verificadas):

| Modelo | mAP@50 | mAP@50-95 | Precision | Recall |
|---|---|---|---|---|
| YOLO26m | 61,55 | 35,88 | 77,04 | 56,05 |
| YOLOv10m | 61,13 | 35,63 | 76,78 | 55,65 |
| YOLO11m | 61,10 | 35,57 | 66,78 | 55,61 |
| YOLOv8m | 60,89 | 35,47 | 66,52 | 55,42 |
| YOLO26s | 58,76 | 33,86 | 75,49 | 53,07 |
| YOLOv8s | 57,93 | 33,25 | 75,38 | 51,63 |
| YOLOv10s | 57,64 | 33,34 | 75,02 | 52,12 |
| **YOLO11s (este modelo)** | **57,63** | **33,10** | **74,31** | **52,42** |
| RF-DETR Nano | 56,90 | 31,58 | 80,68 | 64,78 |
| YOLO26n | 52,25 | 29,23 | 72,56 | 46,87 |
| YOLOv9t | 52,04 | 29,46 | 71,34 | 46,72 |
| YOLOv10n | 51,95 | 29,31 | 71,58 | 46,62 |
| YOLOv8n | 51,67 | 29,09 | 70,95 | 46,59 |
| YOLO11n | 51,63 | 29,06 | 71,68 | 46,34 |

En su segmento de tamano, YOLO11s queda practicamente empatado con YOLOv10s y YOLOv8s, por detras de YOLO26s, y muy por debajo de las variantes "m" en mAP, a cambio de un coste computacional menor. RF-DETR Nano, con menor mAP@50, presenta mayor precision y recall, lo que puede ser relevante segun el equilibrio deseado entre falsos positivos y falsos negativos.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo se entrena exclusivamente con BDD100K, por lo que su rendimiento puede degradarse en condiciones de iluminacion, clima, geografia o tipo de camara distintas a las del dataset. No se documentan analisis de sesgo.
- Riesgo de alucinacion: como todo detector, puede producir falsos positivos con alta confianza, especialmente en clases poco representadas (la clase train obtiene un mAP@50 de solo 0,20, lo que indica un rendimiento practicamente nulo).
- Limitaciones de contexto o idioma: no aplica en el sentido linguistico, pero la cobertura de clases esta limitada a las diez clases de BDD100K; no detecta otras categorias de objetos.
- Restricciones de licencia: AGPL-3.0 impone obligaciones copyleft fuertes; el uso comercial en productos propietarios requiere revisar el cumplimiento o negociar una licencia alternativa con Ultralytics, titular de la licencia del modelo base.
- Metricas no verificadas: los resultados del model-index estan marcados como `verified: false`; conviene reproducirlos con el pipeline de DetectionBench antes de tomar decisiones de produccion.
- Caveat de produccion: el checkpoint se distribuye principalmente como `best.pt` para la libreria `ultralytics`; aunque el repo contiene safetensors, no se documentan conversiones oficiales a otros formatos de despliegue.
- El modelo no es un modelo de lenguaje: no soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dronefreak/bdd100k-yolo11s
- Repositorio DetectionBench: https://github.com/dronefreak/DetectionBench
- Modelo base YOLO11: https://huggingface.co/Ultralytics/YOLO11
- Paper de referencia (arxiv:2410.17725): https://arxiv.org/abs/2410.17725
- Dataset BDD100K en Hugging Face: https://huggingface.co/datasets/dronefreak/BDD100K
- Demo banner (video): https://huggingface.co/dronefreak/bdd100k-yolo11s/resolve/main/assets/demo_banner.mp4
- Poster del demo: https://huggingface.co/dronefreak/bdd100k-yolo11s/resolve/main/assets/demo_banner_poster.jpg
