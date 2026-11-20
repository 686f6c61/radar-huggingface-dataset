# it-roth/cambodia-traffic-yolov8

## Resumen

cambodia-traffic-yolov8 es un modelo de deteccion de objetos basado en la arquitectura YOLOv8 Nano, ajustado por Leng Saroth (usuario `it-roth`) en el marco de un proyecto de fin de grado de la BELTEI International University (Phnom Penh, Camboya), bajo la supervision del Dr. Chen Sovann. El modelo esta disenado especificamente para vigilancia de trafico urbano en Phnom Penh y para la verificacion del cumplimiento del Sub-Decreto n.o 39 del Gobierno Real de Camboya sobre multas de trafico, en particular el uso obligatorio del casco (articulo 8) y la prohibicion de sobrecarga de pasajeros en motocicletas (articulo 44).

Se trata de un detector de 8 clases que distingue entre motoristas con casco y sin casco, ademas de motocicletas, auto-rickshaws (PassApp/Bajaj), remorques tradicionales jemer, coches, camiones y autobuses. El autor declara un mAP@0.5 de 0,995 para la clase `rider_no_helmet`, un tamano de pesos de 6,23 MB (`best.pt`) y una latencia de aproximadamente 24 ms en CPU y 4 ms en GPU.

Su relevancia radica en la especializacion regional: la mayoria de detectores de trafico genericos no contemplan vehiculos tipicos del sudeste asiatico como el remorque o el auto-rickshaw, ni la tarea concreta de verificacion de casco. No obstante, el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el modelo no ha sido verificado de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOv8 Nano (detector de objetos, una etapa) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en formato PyTorch `.pt`; exportable a otros formatos via Ultralytics) |
| Idiomas soportados | km, en (etiquetas y documentacion) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`best.pt`), 6,23 MB |

## Arquitectura y entrenamiento

El modelo parte de YOLOv8 Nano, la variante mas pequena de la familia YOLOv8 de Ultralytics: un detector de una sola etapa con backbone CSP y cabeza de deteccion desacoplada, optimizado para inferencia de baja latencia. El ajuste fino se realizo sobre un dataset propio denominado "Cambodian Road & Helmet Dataset (Phnom Penh)", de tipo custom, con 8 clases orientadas al trafico camboyano.

La model card no detalla el numero de imagenes de entrenamiento, la composicion del dataset, el numero de epocas, el optimizador ni si se aplicaron tecnicas de aumento de datos. Tampoco se documenta ningun proceso de RLHF/DPO (no aplicable a un detector) ni innovaciones tecnicas mas alla del ajuste fino supervisado estandar de Ultralytics. El modelo se presenta como parte de un proyecto academico de grado, no como un artefacto con validacion industrial.

## Capacidades

- Deteccion de objetos en imagenes y video en tiempo real (pipeline `object-detection`).
- Clasificacion de 8 clases: `rider_with_helmet`, `rider_no_helmet`, `motorcycle`, `auto_rickshaw`, `remorque`, `car`, `truck`, `bus`.
- Verificacion de cumplimiento normativo: identificacion de motoristas sin casco (articulo 8 del Sub-Decreto n.o 39) y potencial deteccion de sobrecarga de pasajeros (articulo 44).
- Reconocimiento de vehiculos especificos del contexto camboyano (auto-rickshaw PassApp/Bajaj y remorque tradicional jemer).
- Inferencia sobre imagenes sueltas o flujos de video mediante `model.predict(source=...)` de Ultralytics, con umbral de confianza configurable.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades de lenguaje; es exclusivamente un modelo de vision por computador.
- Capacidades multilingues limitadas a etiquetas y documentacion en jemer e ingles; no procesa texto.

## Casos de uso

- Vigilancia de cumplimiento del casco en Phnom Penh: el modelo detecta `rider_no_helmet` en flujos de camara de trafico y permite generar alertas o evidencias para la policia de trafico, gracias a su inferencia de ~4 ms en GPU.
- Analisis de infracciones de sobrecarga: la deteccion conjunta de `motorcycle` y multiples `rider_*` permite construir heuristicas para el articulo 44 del Sub-Decreto n.o 39.
- Monitorizacion de flujo vehicular urbano: el conteo por clase (`car`, `truck`, `bus`, `auto_rickshaw`, `remorque`) sirve para estudios de movilidad y planificacion de semaforos en ciudades camboyanas.
- Despliegue en dispositivos de borde: con 6,23 MB de pesos y ~24 ms en CPU, el modelo puede ejecutarse en mini-PC o camaras IP con capacidad de computo limitada en intersecciones sin GPU dedicada.
- Proyectos academicos y de smart city: base para investigaciones en universidades camboyanas sobre vision artificial aplicada a trafico, dado su licencia MIT y su caracter documentado como capstone.
- Auditoria retroactiva de grabaciones: procesamiento por lotes de video almacenado para extraer estadisticas de infracciones y alimentar dashboards de seguridad vial.
- Prototipado rapido en pipelines Ultralytics: integracion en notebooks o scripts existentes sin dependencias adicionales mas alla de `ultralytics`.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados de forma independiente):

| Metrica | Tarea | Dataset | Valor |
|---|---|---|---|
| mAP@0.5 (No-Helmet Detection) | Traffic Safety & Helmet Law Enforcement | Cambodian Road & Helmet Dataset (Phnom Penh) | 0,995 |

El autor tambien declara una velocidad de inferencia de aproximadamente 24 ms en CPU y 4 ms en GPU, y un tamano de pesos de 6,23 MB. No se han publicado resultados para otras clases, otros umbrales (mAP@0.5:0.95) ni comparaciones con modelos de referencia en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB para inferencia en FP32 con YOLOv8 Nano; el modelo cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con CUDA, desde una GTX 1650 o RTX 3050 hasta A100/H100; el cuello de botella no sera la VRAM sino el pipeline de video.
- Cabe en GPU consumer: si, en practicamente todas las GPU modernas (RTX 20/30/40, GTX 16, e incluso iGPU con soporte adecuado).
- CPU: viable para inferencia en tiempo casi real segun el autor (~24 ms por imagen), adecuado para despliegues en borde.
- Opciones de despliegue: Ultralytics (PyTorch), exportacion a ONNX, TensorRT, OpenVINO o TFLite mediante las utilidades de Ultralytics; no se documenta soporte nativo para vLLM, llama.cpp, Ollama o TGI (no aplicables a un detector de vision).
- Latencia y throughput: ~4 ms/imagen en GPU y ~24 ms/imagen en CPU segun el autor; el throughput real dependera del hardware y de la resolucion de entrada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| cambodia-traffic-yolov8 | YOLOv8 Nano | no disponible | no aplica | mAP@0.5 0,995 (no verificado) | MIT | Hugging Face |
| YOLOv8n (Ultralytics, base) | YOLOv8 Nano | no disponible | no aplica | COCO mAP@0.5:0.95 ~37,3 (referencia publica) | AGPL-3.0 | Ultralytics |
| YOLOv5n (Ultralytics) | YOLOv5 Nano | no disponible | no aplica | COCO mAP@0.5:0.95 ~28,0 (referencia publica) | AGPL-3.0 | Ultralytics |
| Detectores de trafico genericos | YOLO/SSD/Faster R-CNN | variable | no aplica | variable | variable | variable |

La comparativa directa es limitada: no existen en la informacion proporcionada modelos publicos especializados en trafico camboyano con los que contrastar. Los valores de COCO de YOLOv8n y YOLOv5n son referencias publicas de los repositorios originales, no mediciones de este modelo.

## Limitaciones y advertencias

- El mAP@0.5 de 0,995 declarado por el autor no ha sido verificado de forma independiente (`verified: false` en la model-index) y procede de un unico dataset propio; es probable que no se generalice a otras ciudades, camaras o condiciones de iluminacion.
- No se documenta el tamano ni la diversidad del dataset de entrenamiento, por lo que se desconoce el riesgo de sobreajuste a escenas concretas de Phnom Penh.
- Sesgos potenciales derivados de la recogida de datos en una unica region: posible peor rendimiento con vehiculos, matricula o indumentaria no representados.
- Riesgo de falsos positivos y negativos en condiciones adversas (lluvia, noche, oclusion, angulos de camara no vistos durante el entrenamiento), no cuantificado.
- Modelo exclusivamente de vision: no procesa lenguaje, no soporta tool calling ni razonamiento, y su "soporte de idiomas" se limita a etiquetas y documentacion.
- Uso comercial permitido por la licencia MIT, pero conviene revisar las implicaciones legales de la vigilancia automatica de infracciones (privacidad, proteccion de datos, validez probatoria) antes de un despliegue en produccion.
- Proyecto academico con 0 descargas y 0 likes: no hay evidencia de uso en produccion ni de mantenimiento continuado.
- La deteccion de infracciones no sustituye la validacion humana; cualquier sancion derivada deberia ser revisada por un agente de trafico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/it-roth/cambodia-traffic-yolov8
- BELTEI International University: https://www.beltei.edu.kh
- Ultralytics (framework YOLOv8): https://github.com/ultralytics/ultralytics
- Documentacion de Ultralytics: https://docs.ultralytics.com
