# hojayfa-sir/european-green-crab-detection

## Resumen

El modelo `hojayfa-sir/european-green-crab-detection` es un detector de objetos basado en RF-DETR Medium, ajustado por Abu Hojayfa para identificar tres especies de cangrejo: cangrejo verde europeo (especie invasora), Rock Crab y Jonah Crab. Parte del checkpoint `Roboflow/rf-detr-medium`, que combina un backbone DINOv2 con ventana (`dinov2_windowed_small`) con un decoder de tipo transformer para deteccion en tiempo real, y se ha reentrenado sobre un dataset COCO propio agregado a partir de cinco fuentes abiertas.

El problema que resuelve es la clasificacion y localizacion automatica de especies de cangrejo en imagenes subacuaticas, un caso de uso directo en biologia marina y en el control de especies invasoras. El autor lo orienta explicitamente a aplicaciones de tipo MATE ROV, es decir, vehiculos subacuaticos operados por remoto que necesitan identificar fauna en tiempo real.

La relevancia actual viene de su rendimiento declarado sobre el dataset de validacion (mAP@50 de 99,22 y mAP@50-95 de 86,00), poco habitual en dominios de imagenes submarinas con iluminacion y turbidez variables. Se distribuye con licencia Apache 2.0 y pesos en formato PyTorch (`.pth`), con un repositorio de 0,3 GB, lo que facilita su despliegue en equipos modestos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RF-DETR (detector transformer en tiempo real) con backbone DINOv2 windowed small (`dinov2_windowed_small`) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada de 576x576 pixeles) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (tarea de vision, sin procesamiento de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`.pth`, fichero `european-green-crab-detection.pth`) |
| Resolucion de entrada | 576x576 pixeles |
| Tarea | Deteccion de objetos (`object-detection`) |
| Clases | 3 (European Green Crab, Rock Crab, Jonah Crab) |
| Libreria | `rfdetr` |
| Tamano del repositorio | 0,3 GB |
| Fecha de creacion / actualizacion | 13-09-2026 / 19-09-2026 |

## Arquitectura y entrenamiento

RF-DETR es una familia de detectores que sustituye el clasico emparejamiento denso de anchors por un decoder transformer con asignacion de predicciones, manteniendo latencias propias de modelos en tiempo real. La variante Medium empleada aqui usa el backbone `dinov2_windowed_small`, que aplica atencion ventaneada sobre caracteristicas autosupervisadas de DINOv2, y procesa imagenes redimensionadas con relleno blanco a 576x576 pixeles.

El ajuste fino se realizo durante 15 epocas, alcanzando la mejor precision de cajas en la epoca 5 y convergiendo de forma temprana (early stopping con paciencia de 10 epocas y delta minimo de 0,001). Se uso el optimizador AdamW con lr=1e-4 en el decoder, lr_encoder=1,5e-4 y weight_decay=1e-4, batch de 4 con 4 pasos de acumulacion (tamano efectivo 16), sobre un entorno GPU de Kaggle durante aproximadamente 12 horas. No se menciona RLHF, DPO ni tecnicas de alineacion, ya que no aplican a un detector.

El dataset se construyo agregando cinco conjuntos abiertos en formato COCO: 2.889 imagenes base con 6.630 objetos anotados (2,3 anotaciones por imagen de media; 2.405 imagenes con un solo objeto, 120 con entre 2 y 5 objetos y 447 escenas multiobjeto). El 81,8 % de las imagenes son de resolucion media, con mediana de 386x342. Sobre esa base se aplico un pipeline de aumento 5x con auto-orientacion, redimensionado con relleno blanco, rotaciones aleatorias de -15 a +15 grados, distorsiones fotometricas de brillo y exposicion de mas/menos 15 %, ruido de pixel de hasta el 2 % y desenfoque direccional de movimiento de 20 px a 45 grados, dando un total de 10.977 imagenes (10.110 de entrenamiento, 578 de validacion y 289 de test).

## Capacidades

- Deteccion de objetos con cajas delimitadoras sobre imagenes, en una sola pasada y con salida en formato de detecciones con umbral configurable.
- Clasificacion multi-especie con tres clases: cangrejo verde europeo, Rock Crab y Jonah Crab.
- Discriminacion entre especies morfologicamente similares, con matrices de confusion reportadas por el autor para validacion y test.
- Robustez declarada frente a condiciones de captura variables gracias al aumento de datos (rotacion, brillo, ruido de sensor y motion blur).
- Inferencia sobre imagenes individuales mediante `model.predict("imagen.jpg", threshold=0.50)`.
- Integracion con el ecosistema `rfdetr` y `huggingface_hub` para descarga de pesos y carga del modelo.
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso en lenguaje natural, vision-lenguaje, audio ni generacion de texto: es un detector puro, sin modulo de lenguaje.
- Capacidades multilingues: no aplica.

## Casos de uso

- Monitorizacion de especies invasoras: el detector identifica cangrejo verde europeo en imagenes de camaras fijas o trampas, lo que permite cuantificar su presencia y su expansion en un estuario o bahia sin revision manual de cada fotograma.
- Vehiculos subacuaticos tipo MATE ROV: el autor orienta el modelo explicitamente a este escenario, donde el ROV captura video del fondo y necesita clasificar cangrejos en tiempo real con una latencia compatible con el control del vehiculo.
- Censos de poblacion en biologia marina: procesado por lotes de imagenes de transectos para contar y localizar individuos por especie, generando series temporales comparables entre campanas.
- Pesca y control de capturas: clasificacion automatica de ejemplares en cubierta o en cintas de seleccion para separar especies objetivo de capturas accesorias y de especies protegidas o invasoras.
- Acuicultura y viveros: seguimiento de densidad y distribucion de individuos en tanques o jaulas, detectando agregaciones o cambios de comportamiento a partir de las detecciones.
- Investigacion ecologica reproducible: al estar entrenado sobre un dataset COCO agregado y documentado, sirve como linea base para comparar variantes de RF-DETR u otros detectores en el mismo dominio.
- Automatizacion de anotacion asistida: las detecciones con umbral alto pueden preanotar nuevas imagenes y reducir el coste de etiquetado manual en campanas futuras.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (metrica no verificada por terceros):

| Checkpoint | Split | mAP@50 | mAP@50-95 | mAP@75 |
|---|---|---|---|---|
| checkpoint_best_total | Validacion | 0,9922 | 0,8600 | 0,9348 |
| checkpoint_best_total | Test | 0,9834 | 0,8147 | 0,8910 |
| last_ema | Validacion | 0,9877 | 0,8558 | 0,9322 |
| last_ema | Test | 0,9786 | 0,8178 | 0,8879 |

No se han publicado en la informacion disponible resultados de benchmarks sobre conjuntos externos ni comparaciones con otros detectores bajo el mismo protocolo. Las matrices de confusion se evaluaron con umbral de confianza mayor o igual a 0,50 e IoU mayor o igual a 0,50, pero las cifras concretas no se incluyen en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Como referencia orientativa para un detector de este tamano con entrada de 576x576, el uso de memoria en precision FP16 suele situarse en el rango de 1 a 2 GB, aunque el dato exacto no esta publicado.
- GPU de entrenamiento empleada: entorno GPU de Kaggle, con un tiempo total de aproximadamente 12 horas para 15 epocas.
- GPU recomendadas: no disponibles de forma explicita. Por tamano del modelo (repo de 0,3 GB) y resolucion de entrada, es plausible su ejecucion en GPUs de gama media y alta, pero no hay cifras publicadas de latencia o throughput por modelo concreto.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible. El repositorio pequeno y la resolucion moderada apuntan a que podria caber en GPUs de consumo, pero el autor no lo verifica.
- Opciones de despliegue: la unica via documentada es la libreria `rfdetr` de Python, instalada con `pip install rfdetr huggingface_hub`, descargando los pesos con `hf_hub_download` y cargando `rfdetr.RFDETRMedium(pretrain_weights=weights)`. No se documentan exportaciones a ONNX, TensorRT, CoreML ni integraciones con Ollama, vLLM, TGI o llama.cpp, que en cualquier caso no aplican a un detector de vision.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Tarea | Parametros | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| european-green-crab-detection (este modelo) | Deteccion de 3 especies de cangrejo | no disponible | 576x576 px | Apache 2.0 | HuggingFace, libreria `rfdetr` |
| Roboflow/rf-detr-medium | Deteccion de objetos generica | no disponible | no disponible en la informacion proporcionada | no disponible | HuggingFace (modelo base) |
| Otros detectores en tiempo real (YOLO, DETR, RT-DETR) | Deteccion de objetos generica | no disponible | no disponible | no disponible | no disponible en la informacion proporcionada |

La informacion proporcionada no incluye resultados comparativos frente a otros detectores, por lo que no es posible establecer una comparacion cuantitativa de rendimiento. La unica referencia fiable es el modelo base declarado, `Roboflow/rf-detr-medium`, del que este checkpoint es un ajuste fino.

## Limitaciones y advertencias

- Ambito cerrado a tres clases de cangrejo: cualquier otro objeto o especie se ignorara o se confundira con una de las tres clases, con falsos positivos de fondo.
- Dominio de entrenamiento restringido a imagenes subacuaticas de resolucion media (mediana de 386x342) y a las cinco fuentes agregadas; el rendimiento puede degradarse con camaras, profundidades, turbidez o iluminacion distintas.
- Riesgo de confusion entre especies morfologicamente parecidas, especialmente entre Rock Crab y Jonah Crab; el autor reporta matrices de confusion con celdas fuera de la diagonal, aunque sin cifras en la informacion disponible.
- Caida de rendimiento entre validacion y test: mAP@50-95 pasa de 86,00 a 81,47 y mAP@75 de 93,48 a 89,10 en el mejor checkpoint, lo que indica cierta sensibilidad al cambio de distribucion.
- Las metricas estan declaradas por el autor y marcadas como no verificadas; no existe evaluacion independiente.
- Entrenamiento corto (15 epocas con convergencia en la epoca 5) y con aumentos agresivos: posible sobreajuste al pipeline de aumento concreto, que incluye relleno blanco y resolucion fija de 576x576.
- Sin datos publicados de sesgos, comportamiento en poblaciones desbalanceadas por especie ni analisis de subgrupos por condicion de captura.
- No hay informacion sobre cuantizacion ni sobre pesos en formatos distintos de PyTorch, lo que limita el despliegue en entornos edge sin conversion manual.
- Licencia Apache 2.0: permite uso comercial y modificacion con atribucion, pero conviene revisar las licencias de los cinco datasets de origen agregados, que la model card no detalla.
- No apto para tareas de lenguaje, razonamiento, agentes ni vision-lenguaje: cualquier expectativa de ese tipo queda fuera del alcance del modelo.
- El modelo tiene 0 descargas y 1 like en el momento de la consulta, por lo que carece de validacion por parte de la comunidad.
- La busqueda web realizada no devolvio ningun resultado relevante sobre el modelo, el dataset o RF-DETR; los resultados obtenidos trataban sobre futbol y no guardan relacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hojayfa-sir/european-green-crab-detection
- Dataset declarado: https://huggingface.co/datasets/hojayfa-sir/European_Green_Crab
- Modelo base: https://huggingface.co/Roboflow/rf-detr-medium
- Pagina del autor (perfil de HuggingFace): https://huggingface.co/hojayfa-sir
- Paper, blog o repositorio de RF-DETR: no disponible en la informacion proporcionada
- Demo o Space asociado: no disponible en la informacion proporcionada
- Resultados de busqueda web relevantes: ninguno (la busqueda no devolvio resultados relacionados con el modelo)
