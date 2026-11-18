# Hasnain1241/detr-fineTuned-v6-ours

## Resumen

RF-DETR Large fine-tuned v6 es un modelo de deteccion de objetos derivado de los pesos COCO de RF-DETR Large, ajustado por el usuario Hasnain1241 para una unica clase: `swimmer` (nadador). El modelo esta pensado para detectar personas nadando en imagenes procedentes de camaras de piscina, un escenario con retos particulares (cabezas y cuerpos parcialmente sumergidos, reflejos en el agua, oclusiones por salpicaduras y angulos de camara elevados). La relevancia practica del modelo es acotada: es un ajuste fino de nicho, con cero descargas y cero likes en el momento de la consulta, y su interes principal es como referencia para pipelines de deteccion en entornos acuaticos.

El ajuste se ha realizado sobre 632 frames de entrenamiento, 133 de validacion y 200 de test, procedentes de nueve camaras y divididos por tiempo para evitar fuga de informacion entre conjuntos. El autor reporta una mejora sustancial frente a un modelo "ready-made" de referencia en el conjunto de test: mAP50 de 0,9292 frente a 0,4658, y mAP50-95 de 0,5286 frente a 0,23. Estos numeros, sin embargo, proceden exclusivamente de la model card del autor y no han sido verificados de forma independiente.

No se dispone de informacion sobre el numero de parametros, la longitud de contexto (no aplica en deteccion), los idiomas soportados ni los formatos de pesos mas alla del checkpoint `.pth` mencionado. El repositorio ocupa aproximadamente 0,2 GB y la licencia declarada es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RF-DETR Large (detector DETR basado en transformer, segun el autor) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision para deteccion) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica a la tarea) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.pth` (`checkpoint_best_total.pth`) |
| Clases | 1 (`swimmer`) |
| Resolucion de entrada | "default" de RF-DETR Large (valor no especificado en la model card) |
| Tamano del repositorio | ~0,2 GB |

## Arquitectura y entrenamiento

El modelo parte de los pesos preentrenados en COCO de RF-DETR Large. RF-DETR es una familia de detectores basados en la formulacion DETR (Detection Transformer), que combina un backbone de extraccion de caracteristicas con un decoder transformer que produce predicciones de cajas y clases de forma conjunta, eliminando la necesidad de anclas y de supresion no maxima en el postprocesado. La model card no detalla la variante exacta del backbone ni el numero de capas del decoder.

El ajuste fino se realizo sobre un conjunto propio de frames etiquetados manualmente, capturados por nueve camaras de piscina y organizados en tres conjuntos de video (set-4, set-5 y set-6, etiquetas v4). La particion es 632 frames de entrenamiento, 133 de validacion y 200 de test, divididos por tiempo para reducir el riesgo de que frames casi identicos aparezcan en train y test. La configuracion de entrenamiento reportada es: 80 epocas con early stopping activado, batch efectivo de 16 (batch 2 con acumulacion de gradientes 8), learning rate 0,0001 y resolucion por defecto del modelo base. No se menciona el uso de RLHF, DPO ni tecnicas de aumento de datos especificas.

## Capacidades

- Deteccion de objetos de una unica clase (`swimmer`) en imagenes de camaras de piscina.
- Localizacion de cajas delimitadoras con puntuaciones de confianza, evaluables a distintos umbrales de IoU.
- Funcionamiento en escenas con multiples nadadores simultaneos (el conjunto de test contiene 180 cajas en 200 frames, es decir, menos de un nadador por frame de media, aunque el rango por frame no se especifica).
- Generalizacion a nueve camaras distintas segun el autor, con metricas desglosadas por camara y por conjunto de video en `results/metrics_per_camera.csv` y `results/metrics_per_set.csv`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues: es un modelo puramente visual de deteccion.
- No dispone de modo "thinking", vision generativa, audio ni ninguna otra capacidad multimodal mas alla de la deteccion.

## Casos de uso

- Monitorizacion de seguridad en piscinas: el modelo puede detectar nadadores en frames de camaras fijas y alimentar un sistema de alertas cuando un nadador permanece inmobil durante un tiempo umbral, aprovechando la deteccion por frame a resolucion nativa de RF-DETR Large.
- Analisis de ocupacion de vasos: contar nadadores por frame y agregar por intervalos de tiempo para estimar aforo y patrones horarios, usando las cajas detectadas y su puntuacion de confianza.
- Analisis deportivo de entrenamientos: seguir la posicion de un nadador a lo largo de una secuencia de video para calcular trayectorias y tiempos de cruce de carriles, con la limitacion de que el modelo no asigna identidad persistente entre frames.
- Control de acceso a zonas restringidas del vaso: detectar la presencia de nadadores en areas delimitadas (por ejemplo, calles de competicion fuera de horario) mediante el filtrado espacial de las cajas detectadas.
- Generacion de datasets anotados: usar el modelo como pre-etiquetador para acelerar el etiquetado manual de nuevos frames, dado el salto de mAP50 reportado frente al modelo "ready-made" (0,9292 frente a 0,4658).
- Investigacion en vision subacuatica: servir como linea base reproducible para experimentos de deteccion en dominios con refraccion, turbidez y oclusiones parciales, con la ventaja de una licencia Apache 2.0 permisiva.
- Integracion en sistemas de videovigilancia existentes: el checkpoint `.pth` se carga con la API de `rfdetr` (`RFDETRLarge(pretrain_weights="checkpoint_best_total.pth")`), lo que facilita su incorporacion en pipelines Python ya construidos sobre esa libreria.

## Benchmarks y rendimiento

Resultados reportados por el autor en 200 frames de test (180 cajas, nunca usados en entrenamiento). Precision y recall calculados a IoU 0,5:

| Modelo | mAP50 | mAP50-95 | Precision@0,3 | Recall@0,3 | F1@0,3 | Precision@0,5 | Recall@0,5 | F1@0,5 |
|---|---|---|---|---|---|---|---|---|
| ready-made | 0,4658 | 0,23 | 0,352 | 0,528 | 0,422 | 0,817 | 0,272 | 0,408 |
| ours v4 | 0,8767 | 0,4404 | 0,872 | 0,833 | 0,852 | 0,942 | 0,717 | 0,814 |
| ours v5 | 0,9103 | 0,4838 | 0,878 | 0,878 | 0,878 | 0,969 | 0,694 | 0,809 |
| ours v6 | 0,9292 | 0,5286 | 0,933 | 0,928 | 0,93 | 0,943 | 0,911 | 0,927 |

No se han publicado resultados de benchmarks estandar (COCO, LVIS, etc.) en la informacion disponible, ni comparaciones con otros detectores de la misma categoria mas alla del modelo "ready-made" sin identificar.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El autor no publica el numero de parametros de RF-DETR Large ni mediciones de memoria.
- GPU recomendadas: no disponible. Al tratarse de un detector transformer de tamano "Large", es previsible que requiera GPU dedicada, pero no hay datos confirmados en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no confirmada. No se indica si cabe en una RTX 4090, RTX 3090 u otras tarjetas consumer.
- Opciones de despliegue: la unica via documentada es la libreria `rfdetr` de Python, cargando el checkpoint `.pth`. No se mencionan exportaciones a ONNX, TensorRT, vLLM, llama.cpp, Ollama ni TGI (estas ultimas no aplican a un detector visual).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | mAP50 (test del autor) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RF-DETR Large v6 (este) | no disponible | no aplica | 0,9292 | Apache 2.0 | Hugging Face, 0 descargas |
| Modelo "ready-made" (sin identificar) | no disponible | no aplica | 0,4658 | no disponible | no disponible |
| Ours v5 (version anterior del autor) | no disponible | no aplica | 0,9103 | Apache 2.0 | no disponible publicamente en la informacion |
| Ours v4 (version anterior del autor) | no disponible | no aplica | 0,8767 | Apache 2.0 | no disponible publicamente en la informacion |

No se dispone de comparaciones con otros detectores genericos (YOLO, DINO, Grounding DINO) en la informacion proporcionada.

## Limitaciones y advertencias

- Dominio muy restringido: el modelo solo detecta la clase `swimmer` y fue entrenado con frames de nueve camaras de piscina concretas. Su rendimiento fuera de esa distribucion (otras piscinas, iluminacion, angulos o calidades de video) no esta documentado.
- Volumen de datos limitado: 632 frames de entrenamiento es un conjunto pequeno, lo que aumenta el riesgo de sobreajuste a las camaras y condiciones especificas del autor.
- Metricas no verificadas: todos los numeros de la tabla de benchmarks proceden de la model card del autor; no hay evaluacion independiente ni conjunto de test publico.
- Sin informacion sobre sesgos: no se documentan sesgos demograficos, de genero, tono de piel ni de complexion corporal en la deteccion de nadadores, un aspecto relevante en un modelo que detecta personas.
- Riesgo de falsos negativos en condiciones dificiles: cuerpos sumergidos, salpicaduras, reflejos y oclusiones pueden degradar la deteccion; el propio autor reporta mAP50-95 de 0,5286, sustancialmente inferior al mAP50, lo que indica imprecision en la localizacion fina de las cajas.
- Sin soporte de identidad: el modelo detecta instancias por frame pero no asocia identidades entre frames, por lo que no sirve directamente para seguimiento de nadadores individuales sin un tracker externo.
- Licencia Apache 2.0: permite uso comercial y modificacion con atribucion, pero el autor no ofrece garantias ni soporte; el modelo se distribuye "tal cual".
- Repositorio sin traccion: cero descargas y cero likes en el momento de la consulta, y creado en noviembre de 2026 segun los metadatos, lo que sugiere escasa validacion por parte de la comunidad.
- Advertencia de seguridad: un sistema de alertas basado en este modelo no debe sustituir la supervision humana en entornos de vigilancia de piscinas, dado el riesgo de falsos negativos en situaciones criticas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hasnain1241/detr-fineTuned-v6-ours
- Repositorio de RF-DETR (libreria de carga del checkpoint): no disponible en la informacion proporcionada
- Paper de RF-DETR: no disponible en la informacion proporcionada
- Resultados por camara (`results/metrics_per_camera.csv`): referenciado en la model card, no enlazado
- Resultados por conjunto de video (`results/metrics_per_set.csv`): referenciado en la model card, no enlazado
