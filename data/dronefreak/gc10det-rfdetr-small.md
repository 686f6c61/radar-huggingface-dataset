# dronefreak/gc10det-rfdetr-small

## Resumen

gc10det-rfdetr-small es un detector de objetos RF-DETR Small afinado por el usuario dronefreak sobre el conjunto de datos GC10-DET, un benchmark de defectos superficiales en superficies metalicas. El modelo parte de Roboflow/rf-detr-small, un detector en tiempo real de la familia DETR con backbone DINOv2, y se ha entrenado y evaluado dentro del framework DetectionBench, que aplica recetas de entrenamiento y metricas de evaluacion identicas a varios detectores modernos para permitir comparaciones reproducibles.

El problema que resuelve es concreto: la inspeccion visual automatizada de defectos en chapa y productos metalicos (arrugas, inclusiones, manchas de aceite y agua, poros de punzonado, lineas de soldadura, etc.). El modelo distingue diez clases de defecto y alcanza un mAP@50 del 76,07 % y un mAP@50-95 del 42,51 % en el split de test, con 32,1 millones de parametros.

Su relevancia actual es doble. Por un lado, publica una comparativa abierta frente a alternativas de la misma categoria (RF-DETR Medium y Nano, YOLO26 y YOLO11/v8 en varios tamanos) bajo un protocolo comun. Por otro, al liberarse bajo licencia Apache-2.0 y con un peso de repositorio de solo 0,1 GB, es un candidato viable para control de calidad en produccion y para despliegue en hardware de gama media o en el borde.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de deteccion de la familia DETR (RF-DETR), con backbone DINOv2 preentrenado |
| Parametros totales | 32,1 M |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision; la entrada es una imagen) |
| Tipos de cuantizacion | no disponible (la model card no documenta variantes cuantizadas) |
| Idiomas soportados | no aplica (no es un modelo de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (se descarga mediante huggingface_hub y se carga con la libreria rfdetr; la model card no especifica la extension del checkpoint) |
| Tarea | Deteccion de objetos (object-detection) |
| Framework / libreria | rfdetr (PyTorch) |
| Modelo base | Roboflow/rf-detr-small |
| Dataset de entrenamiento | dronefreak/GC10-DET (licencia CC-BY-4.0) |
| Numero de clases | 10 |
| Clases | crease, crescent_gap, inclusion, oil_spot, punching_hole, rolled_pit, silk_spot, waist_folding, water_spot, welding_line |
| FLOPs | no disponible (no publicados por el autor original del modelo base) |
| Tamano del repositorio | 0,1 GB |
| Fecha de publicacion | 27 de septiembre de 2026 |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de RF-DETR Small, un detector de objetos en tiempo real de la familia DETR desarrollado por Roboflow. La familia RF-DETR combina un backbone DINOv2 preentrenado con un cabezal de deteccion transformer, y se distribuye en variantes Nano, Small, Medium y Large bajo licencia Apache-2.0 (las variantes XL y 2XLarge quedan fuera de esa licencia). El checkpoint aqui descrito conserva la arquitectura del modelo base; el autor solo ha ajustado los pesos sobre el nuevo dominio. El recuento oficial es de 32,1 millones de parametros y los FLOPs no estan publicados.

El entrenamiento se ha realizado sobre GC10-DET, un benchmark de inspeccion industrial de superficies metalicas con diez clases de defecto. El autor enmarca el trabajo en DetectionBench, un framework que entrena y evalua distintos detectores con recetas identicas para que las cifras sean comparables entre modelos. No se detallan en la informacion disponible el numero de imagenes utilizado, la resolucion de entrada, el numero de epocas, el optimizador, el esquema de aumento de datos ni si se aplicaron tecnicas de ajuste fino selectivo; tampoco se documenta el uso de RLHF/DPO (no aplicable a un detector) ni innovaciones tecnicas adicionales mas alla de las propias de RF-DETR.

Como detalle metodologico relevante, la evaluacion se ha hecho con las metricas de deteccion de la libreria Supervision de Roboflow, que reporta mAP, precision y recall pero no genera imagenes de curvas PR, curvas F1 ni matrices de confusion como hace el validador de Ultralytics. El propio autor lo advierte en la model card, y las metricas aparecen marcadas como no verificadas (`verified: false`) en el model-index.

## Capacidades

- Deteccion de objetos en imagenes: devuelve cajas delimitadoras con clase y puntuacion de confianza para diez tipos de defecto superficial.
- Clasificacion de defectos industriales concretos: crease, crescent_gap, inclusion, oil_spot, punching_hole, rolled_pit, silk_spot, waist_folding, water_spot y welding_line.
- Deteccion en tiempo real: el diseno RF-DETR esta orientado a inferencia de baja latencia, apto para lineas de produccion.
- Rendimiento fuerte en clases bien definidas: rolled_pit alcanza 100,0 mAP@50 y welding_line 99,45 mAP@50, lo que indica deteccion fiable de esos patrones.
- Capacidad de servir como componente dentro de un pipeline mas amplio (preprocesado de imagen, postprocesado con Supervision, registro de resultados en base de datos).
- No dispone de generacion de texto, razonamiento, codigo ni matematicas.
- No soporta tool calling, function calling ni uso como agente multi-paso.
- No tiene capacidades multilingues ni de vision-lenguaje: no genera descripciones textuales de las imagenes.
- No incorpora modo thinking, ni procesamiento de audio, ni segmentacion (solo deteccion).
- No se documentan capacidades de deteccion abierta (open-vocabulary): las clases estan fijadas al conjunto de entrenamiento.

## Casos de uso

- Control de calidad en linea de produccion siderurgica: el modelo se integra tras una camara industrial y marca en cada pieza las cajas de los defectos detectados, permitiendo descartar o reclasificar unidades en tiempo real sin intervencion humana.
- Deteccion de defectos criticos de alta fiabilidad: para las clases con mejor rendimiento (welding_line, rolled_pit, crescent_gap), el detector puede usarse como filtro automatico con umbral de confianza alto, dejando las piezas dudosas a revision manual.
- Triaje y priorizacion de imagenes en auditoria retrospectiva: procesar lotes historicos de fotografias de chapa para localizar defectos recurrentes y estimar su frecuencia por proveedor, turno o linea de produccion.
- Despliegue en el borde (edge) cerca de la linea: con 32,1 M de parametros y 0,1 GB de repositorio, cabe en dispositivos tipo NVIDIA Jetson o mini-PC con GPU integrada, evitando enviar imagenes a la nube.
- Generacion de anotaciones asistida: usar las salidas del modelo como preetiquetado para acelerar la revision humana y construir conjuntos de datos de reentrenamiento (active learning).
- Monitorizacion de mantenimiento predictivo: patrones como rolled_pit o inclusion suelen correlacionar con desgaste de rodillos o problemas en el proceso; un recuento continuo por clase permite disparar alertas de mantenimiento.
- Comparacion y seleccion de detectores en un proyecto industrial: al compartir protocolo con la tabla GC10-DET Model Zoo, sirve como referencia para decidir entre RF-DETR y alternativas YOLO segun el equilibrio precision/recall que exija la aplicacion.
- Integracion en pipelines de vision existentes: el modelo se carga con `hf_hub_download` y la libreria `rfdetr`, y sus salidas se pueden consumir con Supervision para dibujar cajas, contar detecciones o registrar metricas en un servicio interno.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el split de test de GC10-DET (no verificados, `verified: false`):

| Metrica | Valor (%) |
|---|---|
| mAP@50 | 76,07 |
| mAP@50-95 | 42,51 |
| Precision | 87,86 |
| Recall | 65,03 |
| F1 | 74,74 |
| Parametros | 32,1 M |

Comparativa publicada por el autor dentro del model zoo de GC10-DET (mismo protocolo de entrenamiento y evaluacion):

| Modelo | mAP@50 | mAP@50-95 | Precision | Recall |
|---|---|---|---|---|
| RF-DETR Small (este modelo) | 76,07 | 42,51 | 87,86 | 65,03 |
| RF-DETR Medium | 75,93 | 41,93 | 78,25 | 67,76 |
| YOLO26s | 75,77 | 38,15 | 77,16 | 74,07 |
| YOLO26n | 74,25 | 38,31 | 80,5 | 67,99 |
| YOLO26m | 73,97 | 36,94 | 75,7 | 68,19 |
| YOLOv8n | 73,25 | 38,74 | 67,99 | 70,87 |
| YOLO11s | 72,54 | 35,07 | 72,39 | 66,8 |
| YOLOv8s | 72,54 | 37,79 | 78,54 | 65,23 |
| YOLOv8m | 71,88 | 38,8 | 69,77 | 70,84 |
| YOLO11n | 70,44 | 40,09 | 78,93 | 62,64 |
| RF-DETR Nano | 70,17 | 38,06 | 77,08 | 71,04 |

Rendimiento por clase de este modelo:

| Clase | mAP@50 | mAP@50-95 |
|---|---|---|
| crease | 25,05 | 12,4 |
| crescent_gap | 97,66 | 60,76 |
| inclusion | 37,42 | 9,83 |
| oil_spot | 69,72 | 26,69 |
| punching_hole | 85,23 | 47,21 |
| rolled_pit | 100,0 | 70,0 |
| silk_spot | 67,2 | 29,15 |
| waist_folding | 88,36 | 55,35 |
| water_spot | 90,57 | 59,33 |
| welding_line | 99,45 | 54,41 |

No se han publicado resultados de benchmarks adicionales (por ejemplo COCO, o latencia/throughput medidos de forma independiente) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para los pesos: unos 128 MB en fp32 (32,1 M de parametros) y unos 64 MB en fp16. Con activaciones y buffers de inferencia, el consumo total tipico de un detector de este tamano se mantiene en el rango de 1-2 GB para lotes pequenos, aunque el autor no publica cifras medidas.
- Cabe con holgura en GPU de consumo: RTX 3060, RTX 4060, RTX 4070 o superiores, e incluso en GPUs de portatil con 4-6 GB de VRAM.
- GPU de datacenter (A100, H100, L40S) no son necesarias para inferencia; solo tendrian sentido para reentrenamiento a gran escala o para servir muchas camaras en paralelo.
- Despliegue en el borde: por tamano, es candidato razonable para NVIDIA Jetson (Orin Nano, Orin NX, AGX Orin) y para aceleradores de inferencia similares, siempre que la resolucion de entrada se mantenga moderada.
- Opciones de despliegue: la libreria oficial `rfdetr` (PyTorch) es la via documentada; el ecosistema RF-DETR de Roboflow publica utilidades de exportacion que permiten llevar el modelo a otros runtimes, y el postprocesado puede hacerse con Supervision. No se documentan en la model card soportes especificos de vLLM, llama.cpp, Ollama o TGI (no aplicables a un detector).
- Latencia y throughput: no disponibles. El autor no publica medidas de latencia ni FPS para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | mAP@50 (GC10-DET) | mAP@50-95 (GC10-DET) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| gc10det-rfdetr-small | 32,1 M | no aplica | 76,07 | 42,51 | Apache-2.0 | HuggingFace (este repo) |
| RF-DETR Medium (fine-tune GC10-DET) | no disponible | no aplica | 75,93 | 41,93 | Apache-2.0 (modelo base) | HuggingFace |
| RF-DETR Nano (fine-tune GC10-DET) | no disponible | no aplica | 70,17 | 38,06 | Apache-2.0 (modelo base) | HuggingFace |
| YOLO26s (fine-tune GC10-DET) | no disponible | no aplica | 75,77 | 38,15 | no disponible en la informacion proporcionada | HuggingFace / Ultralytics |
| YOLOv8n (fine-tune GC10-DET) | no disponible | no aplica | 73,25 | 38,74 | no disponible en la informacion proporcionada | HuggingFace / Ultralytics |

Observaciones de la comparativa: RF-DETR Small obtiene el mejor mAP@50 y el mejor mAP@50-95 de toda la tabla publicada, con la precision mas alta (87,86 %), pero su recall (65,03 %) queda por debajo de YOLO26s (74,07 %), YOLOv8n (70,87 %) y RF-DETR Nano (71,04 %). Es decir, tiende a producir menos falsos positivos a costa de mas falsos negativos. No se dispone del numero de parametros de las alternativas YOLO ni de sus licencias dentro de la informacion proporcionada.

## Limitaciones y advertencias

- Recall moderado (65,03 %): en un escenario de control de calidad, una parte relevante de los defectos reales podria no detectarse. Requiere definir un umbral de confianza bajo si se prioriza no dejar pasar defectos, asumiendo mas falsos positivos.
- Rendimiento muy desigual por clase: `inclusion` (9,83 mAP@50-95) y `crease` (12,4 mAP@50-95) son claramente debiles, mientras que `rolled_pit` llega a 70,0. No es un modelo homogeneo entre clases.
- Metricas no verificadas: el model-index las marca como `verified: false` y proceden del propio autor. No hay evaluacion independiente ni comparacion contra otros checkpoints en el mismo split.
- Especializacion de dominio: entrenado exclusivamente en GC10-DET (superficies metalicas). No se debe esperar buen rendimiento en otros materiales, iluminaciones o tipos de defecto sin reentrenamiento.
- Sin analisis de robustez documentado: no hay datos sobre sensibilidad a cambios de iluminacion, oclusion, resolucion, angulo de camara, reflejos o ruido, factores criticos en planta.
- Cajas negras de reproducibilidad: la informacion disponible no detalla hiperparametros, resolucion de entrada, numero de epocas, composicion exacta del dataset ni esquema de aumentos, lo que dificulta reproducir el resultado.
- Riesgo de alucinacion en el sentido de detecciones espurias: con precision del 87,86 %, alrededor de una de cada ocho detecciones positivas es falsa. En clases con bajo mAP como `inclusion` o `crease`, el riesgo de falsos positivos es comparativamente mayor.
- Sin herramientas de diagnostico: las metricas se calcularon con Supervision, que no genera curvas PR/F1 ni matrices de confusion, por lo que el autor no ofrece ese material para analisis de errores.
- Adopcion minima: 0 descargas y 0 likes en el momento de redactar la ficha, sin validacion por parte de la comunidad.
- Licencia del modelo Apache-2.0: permite uso comercial y modificacion con obligacion de conservar avisos de licencia. Conviene comprobar aparte la licencia de las variantes XL y 2XLarge de RF-DETR (PML 1.0), aunque no afectan a este checkpoint Small.
- Licencia del dataset: GC10-DET se distribuye bajo CC-BY-4.0, lo que exige atribucion si se redistribuye el conjunto de datos o trabajos derivados del mismo.
- Idiomas: no aplica, pero conviene tener claro que el modelo no genera ninguna salida textual y no puede integrarse en flujos que esperen lenguaje natural sin un componente adicional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dronefreak/gc10det-rfdetr-small
- Dataset GC10-DET: https://huggingface.co/datasets/dronefreak/GC10-DET
- Model card del dataset (README): https://huggingface.co/datasets/dronefreak/GC10-DET/blob/main/README.md
- Repositorio DetectionBench: https://github.com/dronefreak/DetectionBench
- Modulo de dataset GC10-DET en DetectionBench: https://github.com/dronefreak/DetectionBench/blob/main/src/detectionbench/datasets/gc10det.py
- Modelo base RF-DETR Small: https://huggingface.co/Roboflow/rf-detr-small
- Repositorio RF-DETR de Roboflow: https://github.com/roboflow/rf-detr
- Documentacion de RF-DETR: https://rfdetr.roboflow.com/latest/
- Libreria Supervision: https://github.com/roboflow/supervision
- Modelo relacionado del mismo autor (ExDark): https://huggingface.co/dronefreak/exdark-rfdetr-small
- Paper de DINOv2 (arXiv:2304.07193): https://arxiv.org/abs/2304.07193
- Paper referenciado en los tags (arXiv:2511.09554): https://arxiv.org/abs/2511.09554
- Paper referenciado en los tags (arXiv:2410.17725): https://arxiv.org/abs/2410.17725
- Paper referenciado en los tags (arXiv:2606.03748): https://arxiv.org/abs/2606.03748
