# ETS2LA/ets2-yolo26n

## Resumen

ets2-yolo26n es un detector de objetos de una sola etapa obtenido por ajuste fino (fine-tuning) del modelo base Ultralytics/YOLO26 en su variante nano, publicado por el proyecto ETS2LA. El modelo está especializado en el dominio visual del simulador Euro Truck Simulator 2 (ETS2): coches, autobuses, camiones, semáforos, farolas, señales, postes, líneas de carril, troncos de árbol, pilares de puente, conos y delineadores de tráfico. Su propósito es servir como componente de percepción en ETS2LA, un proyecto de conducción autónoma para los simuladores de camiones de SCS Software.

El entrenamiento se realizó sobre 2000 imágenes del conjunto de datos ETS2LA/ets2-object-detection-2k, con 14 clases anotadas, y los pesos se distribuyen en formato ONNX, lo que facilita su integración en tiempo real dentro de la aplicación de escritorio del proyecto. Se trata, por tanto, de un modelo de visión por computador de escala reducida y propósito muy específico, no de un modelo de lenguaje: no tiene ventana de contexto textual ni capacidades generativas.

Su relevancia es acotada pero clara para la comunidad de modding y simulación: ofrece una alternativa ligera y de licencia MIT (frente a la AGPL-3.0 habitual de Ultralytics) para tareas de detección en un dominio muy concreto donde los modelos preentrenados en COCO rinden peor. En el momento de la consulta el repositorio registra 0 descargas y 0 likes, y declara un tamaño de 0,0 GB, por lo que debe considerarse una publicación reciente y de adopción aún nula.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Detector de objetos de una etapa de la familia YOLO26 (Ultralytics), variante nano; red convolucional con cabeza de deteccion densa |
| Parametros totales | no disponible (el autor no publica el recuento; el sufijo "n" corresponde a la escala nano de Ultralytics) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; modelo de vision sin contexto textual. Entrada: imagen (resolucion de inferencia no disponible) |
| Tipos de cuantizacion | exportacion en ONNX; el tag del repositorio indica "quantized", pero no se detalla el esquema (FP16/INT8) ni se publican variantes alternativas |
| Idiomas soportados | no aplica / no disponible (no procesa texto) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Tarea | Deteccion de objetos (object detection) |
| Numero de clases | 14 |
| Dataset de entrenamiento | ETS2LA/ets2-object-detection-2k (2000 imagenes de ETS2) |
| Modelo base | Ultralytics/YOLO26 |
| Descargas / likes | 0 / 0 en el momento de la consulta |
| Fecha de creacion | 2026-10-27 |

Clases detectadas, en el orden de indices publicado por el autor:

| Indice | Clase |
|---|---|
| 0 | car |
| 1 | bus |
| 2 | truck |
| 3 | stoplight |
| 4 | streetlamp |
| 5 | sign |
| 6 | short post |
| 7 | long pole |
| 8 | curved pole |
| 9 | lane line |
| 10 | tree trunk |
| 11 | bridge pier |
| 12 | traffic cone |
| 13 | traffic delineator |

## Arquitectura y entrenamiento

La arquitectura corresponde a YOLO26 en su variante nano, un detector de una sola etapa con extraccion de caracteristicas convolucional y prediccion directa de cajas y clases en una unica pasada. El autor no documenta en la model card ni el numero de parametros, ni la resolucion de entrada, ni el numero de epocas, ni la estrategia de aumento de datos; tampoco indica si el ajuste fino congelo el backbone o reentreno la totalidad de la red. Lo unico verificable es que parte de los pesos de Ultralytics/YOLO26 y que se ha reentrenado sobre 2000 imagenes del simulador.

El conjunto de datos ETS2LA/ets2-object-detection-2k aporta las 14 clases del dominio: tres tipos de vehiculo, cuatro clases de mobiliario viario vertical (farola, senal, poste corto, poste largo, poste curvo), tres clases estructurales del entorno (tronco, pilar de puente), la linea de carril y dos elementos de balizamiento (cono y delineador). No se documenta la composicion por clase, el balance del dataset, el proceso de anotacion ni si hubo validacion cruzada. Tampoco se menciona ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal, destilacion) mas alla del propio ajuste fino.

## Capacidades

- Deteccion de objetos en imagenes del simulador ETS2 con 14 clases cerradas, incluyendo vehiculos (coche, autobus, camion) y elementos de infraestructura viaria.
- Localizacion de marcas viales y elementos de balizamiento (linea de carril, cono, delineador), insumo tipico para logica de mantenimiento de carril y deteccion de zonas de obras.
- Reconocimiento de semaforos y senales, util para reglas de circulacion dentro de la simulacion.
- Deteccion de obstaculos estructurales del entorno (troncos, pilares de puente, postes) que pueden alimentar logicas de evasion o de evaluacion de riesgo.
- Inferencia via ONNX Runtime, lo que permite ejecucion en CPU o GPU sin dependencia del framework de entrenamiento.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generacion de texto: es exclusivamente un modelo de vision.
- No dispone de capacidades multilingues, de audio ni de modo "thinking".

## Casos de uso

- Percepcion del asistente de conduccion de ETS2LA: el modelo se ejecuta sobre los fotogramas capturados del simulador y entrega cajas de vehiculos, carriles y obstaculos que alimentan el control de volante y velocidad del plugin.
- Mantenimiento de carril: la clase "lane line" permite estimar el trazado del carril y calcular el error lateral respecto al centro, con la ventaja de que el modelo fue entrenado con la camara y la iluminacion propias de ETS2 en lugar de con imagenes reales.
- Frenado de emergencia simulado: la deteccion de coches, camiones y autobuses en los fotogramas previos permite estimar distancia relativa y disparar una politica de desaceleracion dentro del bucle de control.
- Cumplimiento de senalizacion en la simulacion: las clases "stoplight" y "sign" posibilitan que un agente autonomo detenga el vehiculo ante un semaforo en rojo o adapte la velocidad a una senal, evaluando el comportamiento del agente en escenarios de test.
- Navegacion en zonas de obras: la deteccion conjunta de "traffic cone" y "traffic delineator" permite trazar el pasillo de circulacion temporal y validar que el agente respeta el desvio.
- Pre-etiquetado y ampliacion del dataset: al ser un ONNX ligero, puede usarse para generar pseudo-etiquetas sobre nuevos fotogramas de ETS2 y acelerar la anotacion manual antes de un reentrenamiento.
- Evaluacion comparativa de detectores en dominio especifico: sirve como referencia de linea base para medir cuanto mejora un modelo generico preentrenado en COCO frente a uno ajustado con imagenes del simulador.
- Integracion en herramientas de analisis de partidas: procesado offline de grabaciones para extraer estadisticas de objetos avistados (numero de senales, conos, vehiculos) sin intervencion manual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye mAP, precision/recall por clase, curvas PR, latencia ni comparaciones con otros detectores en la model card. Tampoco se especifican la resolucion de entrada ni el umbral de confianza empleados, datos imprescindibles para reproducir cualquier metrica.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Por la designacion nano del modelo base y el formato ONNX, es esperable que el uso de memoria sea muy reducido (del orden de cientos de MB o menos en FP32), pero esta cifra es una estimacion cualitativa y no un dato publicado.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente en la practica para un detector de escala nano (gama RTX 30/40, o incluso iGPU); el autor no publica requisitos minimos ni GPUs validadas.
- Cabe en GPU consumer: si, con alta probabilidad, dado el sufijo nano y la exportacion ONNX; no hay confirmacion oficial.
- Opciones de despliegue: ONNX Runtime (CPU o con proveedores CUDA/TensorRT/DirectML), y conversion adicional a TensorRT o OpenVINO. No se documenta soporte directo en vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de vision de este tipo.
- Latencia y throughput: no disponibles. No se publican FPS, tiempo por inferencia ni pruebas sobre hardware concreto.

## Comparativa con modelos similares

| Modelo | Tarea | Parametros | Entrada / contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ETS2LA/ets2-yolo26n | Deteccion de objetos, 14 clases de ETS2 | no disponible | Imagen; resolucion no disponible | MIT | HuggingFace (ONNX) |
| Ultralytics/YOLO26 (nano) | Deteccion de objetos generica (COCO) | no disponible | Imagen | AGPL-3.0 por defecto en Ultralytics | HuggingFace / Ultralytics |
| Ultralytics YOLO11n | Deteccion de objetos generica (COCO) | ~2,6 M (documentacion publica de Ultralytics) | Imagen | AGPL-3.0 por defecto | Ultralytics |
| Ultralytics YOLOv8n | Deteccion de objetos generica (COCO) | ~3,2 M (documentacion publica de Ultralytics) | Imagen | AGPL-3.0 por defecto | Ultralytics |

Nota: las cifras de parametros de los modelos comparativos proceden de la documentacion publica de Ultralytics y no de la informacion recuperada en esta busqueda; conviene verificarlas antes de citarlas. La ventaja diferencial de ets2-yolo26n no es el rendimiento bruto, sino la especializacion en 14 clases del dominio ETS2 (que no existen en COCO) y una licencia MIT que evita las obligaciones de la AGPL-3.0.

## Limitaciones y advertencias

- Dominio cerrado: solo detecta las 14 clases listadas. Cualquier objeto relevante fuera de esa lista (peatones, animales, vehiculos aereos) es invisible para el modelo.
- Dataset muy pequeno: 2000 imagenes es un volumen bajo para 14 clases; es esperable un rendimiento desigual entre clases frecuentes (coche, carril) y minoritarias (pilar de puente, autobus).
- Sin metricas publicadas: no hay forma de evaluar la calidad real del modelo antes de desplegarlo; se recomienda construir un conjunto de validacion propio a partir de capturas no vistas.
- Riesgo de sobreajuste al simulador: horarios, climatologia, mods graficos y mapas distintos de los del dataset original pueden degradar la deteccion. No se documenta ningun proceso de aumento de datos que mitigue este efecto.
- Riesgo de alucinacion: como todo detector, puede producir falsos positivos con confianza alta ante texturas o geometrias similares (por ejemplo, confundir un poste con una senal). No se indican umbrales de confianza calibrados.
- Sin idiomas ni contexto: el modelo no procesa texto; no puede usarse para tareas de VLM, descripcion de escenas ni respuesta a preguntas.
- Licencia del modelo base: Ultralytics distribuye YOLO26 bajo AGPL-3.0 por defecto (con opcion de licencia comercial). Aunque este derivado se publica como MIT, redistribuir pesos derivados de un modelo AGPL puede entrar en conflicto con esa licencia; conviene revisar el caso con detalle antes de un uso comercial.
- Repositorio practicamente vacio en metricas de adopcion (0 descargas, 0 likes, 0,0 GB declarados) y ausencia de model card detallada: no hay garantia de mantenimiento, soporte ni de que los pesos esten efectivamente subidos en el momento de la consulta.
- Sin informacion sobre sesgos: no se documenta el efecto de la iluminacion nocturna, la lluvia o las condiciones de baja visibilidad del simulador, que son habituales en ETS2.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ETS2LA/ets2-yolo26n
- Dataset de entrenamiento: https://huggingface.co/datasets/ETS2LA/ets2-object-detection-2k
- Modelo base: https://huggingface.co/Ultralytics/YOLO26
- Sitio oficial del proyecto ETS2LA: https://ets2la.com/
- Repositorio en GitHub: https://github.com/ETS2LA/ETS2LA
- Releases del proyecto: https://github.com/ETS2LA/ETS2LA/releases
- Ficha en SourceForge: https://sourceforge.net/projects/ets2la/
- Documentacion de bienvenida y soporte: https://ets2la.com/welcome.md
