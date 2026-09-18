# Hlatar/Geoscan_pioneer_base_drone_detection_finetuned

## Resumen

Geoscan_pioneer_base_drone_detection_finetuned es un modelo de deteccion de objetos especializado en la localizacion de drones en imagenes. Lo publica el usuario Hlatar dentro del proyecto CVproject, un repositorio orientado a seguimiento estereo y reconstruccion de trayectorias 3D, donde este detector actua como el primer eslabon del pipeline de vision. Se trata de un ajuste fino del checkpoint YOLO11x de Ultralytics, entrenado a partir de pesos previos de doguilmak, sobre un dataset propio de una unica clase: `drone`.

El modelo resuelve un problema acotado y concreto: dada una imagen o un flujo de video, devolver cajas delimitadoras con la posicion y la confianza de cada dron detectado. Al derivar de YOLO11x, hereda la arquitectura de deteccion en tiempo real de la familia YOLO11, adecuada para inferencia en GPU de consumo y para integracion en sistemas de videovigilancia, seguridad de espacios aereos o seguimiento multi-camara.

Es relevante ahora porque los modelos de deteccion de drones publicos y bien documentados siguen siendo escasos, y este checkpoint declara de forma explicita su procedencia, hiperparametros de entrenamiento y metricas de validacion, ademas de publicarse bajo licencia MIT, lo que facilita su reutilizacion comercial y su auditoria tecnica. No obstante, el repositorio es muy reciente, con cero descargas y cero interacciones, y la model card no detalla la composicion del dataset ni el numero de imagenes empleadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Deteccion de objetos basada en la familia YOLO11 de Ultralytics (modelo base `yolo11x`) |
| Parametros totales | No disponible en la informacion proporcionada |
| Parametros activos | No aplica (no es un modelo Mixture of Experts) |
| Longitud de contexto | No aplica (modelo de vision, no procesa secuencias de texto) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada; se distribuye como checkpoint de entrenamiento en punto flotante |
| Idiomas soportados | `en` (etiqueta declarada en el repositorio); al ser un detector visual, no depende de idioma para la inferencia, pero las clases y la documentacion estan en ingles |
| Licencia | MIT |
| Formato de pesos | Checkpoint de Ultralytics/PyTorch (`.pt`, `best.pt`) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del checkpoint `yolo11x`, la variante de mayor capacidad de la familia YOLO11 de Ultralytics, que emplea una red de deteccion monocromatica a multiples escalas con cabeza anchor-free (predictor de centro y tamano sin anclas). La tarea se resuelve como deteccion single-class: una sola etiqueta, `drone`, y ninguna otra categoria.

El entrenamiento se hizo por continuacion desde los pesos previos de doguilmak (`Drone-Detection-YOLOv11x`), sobre un dataset propio no descrito en detalle. Los hiperparametros declarados son: 50 epocas completas sin disparo de early stopping (con `patience=100`), tamano de imagen 640, batch 8, optimizador seleccionado automaticamente por Ultralytics, `lr0=0.01`, `lrf=0.01`, momentum 0.937, weight decay 0.0005, tres epocas de warmup, precisión mixta activada (`amp: true`), semilla 0 y modo determinista. El tiempo total de entrenamiento fue de aproximadamente 1360 segundos. No se menciona uso de RLHF, DPO ni tecnicas de alineacion, algo esperable en un modelo de vision.

## Capacidades

- Deteccion de drones en imagenes estaticas con salida de cajas delimitadoras, clase y puntuacion de confianza.
- Inferencia sobre video y flujos en directo mediante `model.predict(source=0, stream=True)`, lo que permite procesar camaras en tiempo real.
- Deteccion single-class: solo reconoce la clase `drone`; no distingue modelos, tamanos ni tipos de dron.
- Integracion directa en el pipeline de CVproject para seguimiento estereo y reconstruccion de trayectorias 3D a partir de detecciones en multiples vistas.
- Parametro de umbral de confianza configurable en inferencia (por ejemplo `conf=0.25`).
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso, vision generativa, audio ni modo de pensamiento: es un detector puro.
- No presenta capacidades multilingues ni de generacion de texto.

## Casos de uso

- Seguimiento estereo y reconstruccion 3D: este es el caso de uso original del modelo dentro de CVproject; las detecciones alimentan un pipeline de vision por computador con dos camaras para estimar la posicion tridimensional del dron y su trayectoria.
- Vigilancia perimetral de espacios aereos restringidos: el detector puede ejecutarse sobre el flujo de una camara fija para emitir alertas cuando aparece un dron en zonas prohibidas, como aeropuertos, recintos penitenciarios o infraestructuras criticas.
- Contador y registro de sobrevuelos: procesando video grabado, el modelo permite contar cuantos drones aparecen y en que franjas horarias, util para informes de incidencias en eventos multitudinarios.
- Automatizacion de la edicion de video aereo: deteccion automatica de tomas en las que aparece un dron ajeno a la grabacion para su recorte o etiquetado posterior.
- Prototipado de sistemas anti-dron: el modelo sirve como modulo de percepcion en pruebas de concepto de sistemas de deteccion temprana, dejando la clasificacion o la respuesta a otros componentes.
- Analisis forense de material audiovisual: busqueda de fragmentos con presencia de drones en grandes volumenes de video, como apoyo a investigaciones o a la verificacion de denuncias.
- Investigacion academica en vision artificial: al publicarse bajo MIT y con metricas de validacion declaradas, es util como linea base reproducible en trabajos de deteccion de objetos de una sola clase.
- Robotica y navegacion asistida: integrado en un bucle de control, puede aportar la posicion relativa de un dron respecto a una plataforma movil equipada con camara.

## Benchmarks y rendimiento

Metricas de validacion declaradas por el autor en la epoca 50:

| Metrica | Valor |
|---|---|
| Precision (B) | 0.9335 |
| Recall (B) | 0.9286 |
| mAP@50 (B) | 0.9640 |
| mAP@50-95 (B) | 0.5916 |

Mejores valores observados durante el entrenamiento:

| Metrica | Valor | Epoca |
|---|---|---|
| mAP@50 | ~0.9664 | 36 |
| mAP@50-95 | ~0.5916 | 50 |
| Precision | ~0.9669 | 33 |
| Recall | ~0.9396 | 36 |

Perdidas en la ultima epoca:

| Perdida | Entrenamiento | Validacion |
|---|---|---|
| box_loss | 0.9916 | 1.4363 |
| cls_loss | 0.5046 | 0.6149 |
| dfl_loss | 1.0960 | 1.3429 |

No se han publicado resultados comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Al tratarse de un checkpoint YOLO11x en punto flotante, se trata de un modelo compacto y cabe con holgura en GPUs de consumo, aunque no se declaran cifras concretas.
- GPU recomendadas: no disponibles en la informacion proporcionada. El autor indica que el entrenamiento se ejecuto en GPU con `device: auto`, sin especificar el modelo concreto.
- Viabilidad en GPU de consumo: previsiblemente si, al ser un detector de una sola clase derivado de una familia disenada para inferencia en tiempo real, pero no hay confirmacion explicita en la ficha.
- Opciones de despliegue: el uso documentado es la libreria `ultralytics` en Python, tanto sobre ficheros de imagen como sobre camaras y streams. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI, que ademas no aplican a un modelo de deteccion visual.
- Latencia y throughput: no disponibles en la informacion proporcionada. El unico dato temporal es el de entrenamiento (aproximadamente 1360 segundos para 50 epocas), que no es extrapolable a inferencia.

## Comparativa con modelos similares

| Modelo | Tarea | Clases | Licencia | Metricas publicadas | Disponibilidad |
|---|---|---|---|---|---|
| Geoscan_pioneer_base_drone_detection_finetuned | Deteccion de objetos | 1 (`drone`) | MIT | mAP@50 0.9640, mAP@50-95 0.5916 | HuggingFace, 0 descargas |
| `yolo11x` (Ultralytics, modelo base) | Deteccion de objetos | 80 (COCO) | AGPL-3.0 / licencia comercial | No disponible en la informacion proporcionada | Repositorio oficial de Ultralytics |
| `doguilmak/Drone-Detection-YOLOv11x` | Deteccion de objetos | No disponible | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | HuggingFace (origen de los pesos de partida) |

No se dispone de datos de parametros, contexto ni rendimiento comparado de las alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo single-class: solo detecta la clase `drone`; no distingue tipos, modelos ni tamanos, y no detecta ningun otro objeto.
- Dataset no documentado: la model card indica unicamente "custom, single class" sin numero de imagenes, procedencia, resolucion ni metodo de etiquetado, lo que impide evaluar su cobertura y sus sesgos.
- Riesgo de sobreajuste al dominio de captura: al no describirse el dataset, es probable que el rendimiento caiga en condiciones distintas de iluminacion, fondo, distancia o tipo de camara respecto a las usadas en el entrenamiento.
- Falsos positivos plausibles: objetos con silueta similar a un dron (pajaros, cometas, farolas, drones de juguete o helicopteros) pueden activar detecciones, dado el caracter de una sola clase.
- Sesgos conocidos: no se declaran analisis de sesgo ni evaluacion por subgrupos; no hay informacion sobre equilibrio de clases en el dataset mas alla de tratarse de una unica clase.
- Alucinacion: en un detector se manifiesta como falsas detecciones con alta confianza; no hay estudios de calibracion publicados.
- Limitaciones de idioma: irrelevantes para la tarea, pero la documentacion y las etiquetas estan en ingles.
- Restricciones de licencia: el modelo se publica bajo MIT, pero el modelo base `yolo11x` de Ultralytics se distribuye bajo AGPL-3.0 o licencia comercial; conviene revisar la compatibilidad antes de un uso comercial o de redistribucion, dado que la licencia MIT declarada por el autor del ajuste no elimina las obligaciones derivadas del modelo original.
- Idiomas: la etiqueta de idioma es `en`; el modelo no procesa texto de ningun tipo.
- Madurez: repositorio con 0 descargas y 0 interacciones, creado y actualizado el mismo dia, sin validacion independiente por parte de terceros.
- Rendimiento en produccion: no se han publicado pruebas de latencia, throughput ni estabilidad en despliegues reales.
- El proyecto CVproject del que forma parte esta orientado a seguimiento estereo; el modelo por si solo no realiza reconstruccion 3D ni seguimiento multi-objeto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Hlatar/Geoscan_pioneer_base_drone_detection_finetuned
- Repositorio CVproject: https://github.com/Hlatar/CVproject
- Pesos previos de partida (doguilmak, Drone-Detection-YOLOv11x): https://huggingface.co/doguilmak/Drone-Detection-YOLOv11x/tree/main
- Resultados de busqueda web: no se ha encontrado ningun enlace relevante al modelo; las busquedas devolvieron unicamente paginas de un hotel sin relacion con el contenido solicitado.
- Documentacion de Ultralytics (framework utilizado, segun la libreria declarada): no disponible en la informacion proporcionada.
