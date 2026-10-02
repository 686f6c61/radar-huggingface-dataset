# dronefreak/bdd100k-period-mobilenetv4_conv_small

## Resumen

El modelo `dronefreak/bdd100k-period-mobilenetv4_conv_small` es un clasificador de imagenes convolucional obtenido por ajuste fino (*fine-tuning*) de MobileNetV4 conv small sobre la tarea de clasificacion del periodo del dia (momento de la jornada) del dataset BDD100K. Lo publica el usuario de HuggingFace `dronefreak` como parte de BDD100K-Toolkit, una herramienta de preparacion de datos, entrenamiento y evaluacion sobre BDD100K. La tarea es no oficial y consta de cuatro clases: `daytime`, `night`, `dawn or dusk` y `unknown`, derivadas del campo `attributes.timeofday` de cada imagen de BDD100K.

Se trata de un modelo pequeno: 2,5 millones de parametros y entrada de 224x224 px, pensado para inferencia en tiempo real o en dispositivos con recursos limitados mas que para maxima precision. Su relevancia practica esta en que resuelve una subtarea auxiliar muy util en pipelines de conduccion autonoma: etiquetar automaticamente la iluminacion de la escena para activar modos de vision nocturna, umbrales de deteccion distintos o registrar metadatos de condiciones de captura.

El checkpoint se distribuye en formato PyTorch (`best.pt`) y es cargable directamente con `timm`, con licencia Apache-2.0. En el split de test de 10 000 imagenes declara una exactitud Top-1 del 93,57 % y un F1 macro del 80,22 %, con un rendimiento notablemente peor en la clase `dawn or dusk` (F1 57,93 %).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MobileNetV4 conv small (CNN de la familia MobileNetV4, adaptada a clasificacion de imagenes) |
| Parametros totales | 2,5 M (segun la model card) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada fija de 224x224 px) |
| Tipos de cuantizacion | no disponible (solo se publica el checkpoint PyTorch en precision completa; no hay versiones cuantizadas declaradas) |
| Idiomas soportados | no aplica / no disponible (tarea de clasificacion visual, sin etiquetas de idioma) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch (`.pt`); `best.pt` contiene `state_dict`, `model_name`, `class_names`, `imgsz`, `mean` y `std` |
| Tarea | image-classification (4 clases de periodo del dia) |
| Clases | `daytime`, `night`, `dawn or dusk`, `unknown` |
| Tamano de entrada | 224x224 px |
| Framework | timm (PyTorch) |
| Dataset de ajuste | dronefreak/BDD100K-Period-Classification (derivado de BDD100K) |
| Fecha de publicacion | 2026-10-01 (segun HuggingFace) |
| Tamano del repositorio | 0,0 GB (segun HuggingFace) |

## Arquitectura y entrenamiento

MobileNetV4 conv small es una red neuronal convolucional pura (sin atencion) disenada para eficiencia en dispositivos moviles y de borde, descrita en el articulo arXiv:2404.10518. Sobre esa base se anadio una cabeza de clasificacion con tantas salidas como clases tenga el checkpoint (`len(ckpt["class_names"])`), y se ajusto sobre el subconjunto de clasificacion de periodo del dia derivado de BDD100K (arXiv:1805.04687).

Los ajustes de entrenamiento declarados son: hasta 50 epocas con parada temprana de paciencia 10, 21 epocas efectivamente entrenadas y mejor epoca en la 11; `best.pt` se selecciona por F1 macro sobre el split de validacion; batch size 128; imagenes redimensionadas a 224 px; optimizador resuelto automaticamente a AdamW con learning rate maximo 3e-04; y pesos promediados con EMA. No se documentan tecnicas adicionales como decodificacion especulativa, atencion lineal ni destilacion, ni el numero total de imagenes de entrenamiento mas alla del split de test (10 000 imagenes).

## Capacidades

- Clasificacion de imagenes en cuatro clases de periodo del dia: `daytime`, `night`, `dawn or dusk` y `unknown`.
- Inferencia de una sola etiqueta por imagen con probabilidades por clase (softmax sobre la salida del modelo).
- Extraccion de caracteristicas visuales de escenas de conduccion (la red base es reutilizable con `timm.create_model` cambiando `num_classes`).
- Ejecucion sobre CPU, GPU o aceleradores de borde, dado su tamano reducido (2,5 M de parametros, 224x224 px).
- Integracion con el ecosistema PyTorch/timm y con BDD100K-Toolkit para entrenamiento y evaluacion reproducibles.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes ni generacion de texto: es un clasificador de vision, no un modelo de lenguaje.
- No tiene capacidades multilingues, de audio ni de video nativas; el procesamiento de video se haria aplicando el modelo fotograma a fotograma.

## Casos de uso

- Preetiquetado de datasets de conduccion: dado un conjunto de imagenes sin anotar, el modelo asigna la etiqueta de periodo del dia de forma automatica con un 93,57 % de Top-1, reduciendo el coste de anotacion manual antes de una revision humana.
- Modos adaptativos en sistemas ADAS: cambiar umbrales de deteccion, exposicion de camara o estrategias de fusion de sensores segun si la escena es de dia o de noche, usando la clase predicha como senal de conmutacion.
- Filtrado y muestreo de datasets: seleccionar subconjuntos equilibrados por condicion de iluminacion para entrenar otros modelos (deteccion, segmentacion) o para auditar la cobertura de un dataset propio.
- Indexado y busqueda de archivos de video: etiquetar clips grabados por flotas de vehiculos con el periodo del dia para permitir busquedas del tipo "todos los clips nocturnos de la ruta X" sin intervencion manual.
- Control de calidad en pipelines de grabacion: detectar automaticamente imagenes con condiciones anomalas o inclasificables (clase `unknown`) que podrian indicar fallos de camara, oclusiones o iluminacion mixta.
- Analitica de trafico y urbanismo: agregar la distribucion dia/noche de miles de imagenes de camaras urbanas para estudiar patrones de movilidad, iluminacion publica o siniestralidad por franja horaria.
- Componente auxiliar en modelos multimodales o de conduccion: aportar contexto temporal a un sistema mayor que combine deteccion de objetos y prediccion de trayectorias, aprovechando su bajo coste computacional.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el split `test` (10 000 imagenes). Los valores no estan verificados de forma independiente (`verified: false`).

| Metrica | Valor |
|---|---|
| Top-1 accuracy (test) | 93,57 % |
| F1 macro (test) | 80,22 % |
| Precision macro (test) | 86,06 % |
| Recall macro / balanced accuracy (test) | 76,22 % |

Desglose por clase:

| Clase | Precision | Recall | F1 | Imagenes de test |
|---|---|---|---|---|
| dawn or dusk | 69,35 % | 49,74 % | 57,93 % | 778 |
| daytime | 92,90 % | 96,50 % | 94,66 % | 5258 |
| night | 97,98 % | 98,63 % | 98,30 % | 3929 |
| unknown | 84,00 % | 60,00 % | 70,00 % | 35 |

Comparativa publicada por el autor, con todos los modelos evaluados sobre el mismo split `test` y ordenados por Top-1:

| Modelo | Top-1 | F1 macro | Balanced accuracy | Precision macro |
|---|---|---|---|---|
| convnext_atto | 93,95 % | 80,75 % | 76,82 % | 86,39 % |
| yolo11n-cls | 93,79 % | 80,13 % | 75,19 % | 88,20 % |
| efficientvit_b0 | 93,71 % | 80,98 % | 77,14 % | 86,44 % |
| yolo26n-cls | 93,61 % | 80,41 % | 77,72 % | 83,88 % |
| **mobilenetv4_conv_small** | **93,57 %** | **80,22 %** | **76,22 %** | **86,06 %** |
| yolov8n-cls | 93,56 % | 80,85 % | 76,26 % | 87,87 % |
| resnet18 | 93,32 % | 80,50 % | 76,72 % | 85,87 % |

## Requisitos de hardware

- Pesos: aproximadamente 10 MB en FP32 y 5 MB en FP16 para 2,5 M de parametros (calculo aritmetico a partir del dato de la model card; el peso real de `best.pt` no se publica).
- VRAM estimada para inferencia: por debajo de 1 GB en FP32 con batch 1 e imagenes de 224x224 px (estimacion; no declarada por el autor).
- GPU recomendadas: cualquier GPU es suficiente, incluidas integradas. Cabe holgadamente en GTX 1050/1650, RTX 3050/3060/4090, A100, H100 y similares; el modelo no requiere aceleradores de gama alta.
- Si cabe en GPU de consumo: si, en todas las generaciones recientes y en muchas integradas; tambien es viable en CPU y en hardware de borde (Raspberry Pi, Jetson, telefonos).
- Opciones de despliegue: inferencia nativa con PyTorch + timm, tal como muestra el ejemplo de la model card. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo. La exportacion a ONNX, TorchScript, TensorRT o TFLite es tecnicamente posible en modelos timm, pero no esta verificada ni documentada por el autor.
- Requisitos de entrenamiento: el ajuste fino se hizo con batch 128 e imagenes de 224 px durante 21 epocas, pero no se especifica el hardware utilizado.
- Latencia y throughput: no disponible (no se publican mediciones de latencia ni de imagenes por segundo).

## Comparativa con modelos similares

Todos los modelos de la tabla siguiente fueron evaluados por el autor sobre el mismo split `test` de 10 000 imagenes. Los datos de parametros y licencia de los alternativas no se proporcionan en la informacion disponible.

| Modelo | Parametros | Top-1 | F1 macro | Balanced accuracy | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| mobilenetv4_conv_small (este modelo) | 2,5 M | 93,57 % | 80,22 % | 76,22 % | Apache-2.0 | HuggingFace (timm) |
| convnext_atto | no disponible | 93,95 % | 80,75 % | 76,82 % | no disponible | referenciado en la comparativa del autor |
| efficientvit_b0 | no disponible | 93,71 % | 80,98 % | 77,14 % | no disponible | referenciado en la comparativa del autor |
| yolo11n-cls | no disponible | 93,79 % | 80,13 % | 75,19 % | no disponible | referenciado en la comparativa del autor |
| yolov8n-cls | no disponible | 93,56 % | 80,85 % | 76,26 % | no disponible | referenciado en la comparativa del autor |
| resnet18 | no disponible | 93,32 % | 80,50 % | 76,72 % | no disponible | referenciado en la comparativa del autor |

La diferencia entre los siete modelos es inferior a 0,6 puntos de Top-1, dentro del ruido esperable en esta tarea. La ventaja diferencial de MobileNetV4 conv small es su huella de parametros reducida; su desventaja es que la clase minoritaria `dawn or dusk` queda muy por debajo de las alternativas en recall.

## Limitaciones y advertencias

- Fuerte desequilibrio entre clases: `daytime` y `night` concentran 9187 de las 10 000 imagenes de test, mientras que `unknown` solo tiene 35. Las metricas agregadas (Top-1 93,57 %) estan dominadas por las dos clases mayoritarias.
- Rendimiento pobre en `dawn or dusk`: recall del 49,74 % y F1 del 57,93 %, es decir, la mitad de las imagenes de amanecer/atardecer se clasifican mal, presumiblemente hacia `daytime` o `night`. Es la clase mas relevante en condiciones de iluminacion dificil.
- La clase `unknown` esta infrarrepresentada (35 imagenes) y su evaluacion es estadisticamente poco fiable.
- Riesgo de alucinacion en el sentido de clasificaciones erroneas con alta confianza: como todo clasificador, no expresa incertidumbre calibrada y no hay datos de calibracion publicados.
- Los resultados no estan verificados de forma independiente (`verified: false` en el model-index); son cifras declaradas por el autor y reproducibles solo a traves de BDD100K-Toolkit.
- Generalizacion geografica y de dominio limitada: BDD100K se recopilo principalmente en Estados Unidos, por lo que el comportamiento en otras regiones, condiciones meteorologicas o tipos de camara no esta documentado.
- La tarea es no oficial y sigue el dataset de Kaggle del mismo nombre; no forma parte de las tareas canonicas de BDD100K, lo que dificulta la comparacion con literatura previa.
- Licencia Apache-2.0 permite uso comercial del modelo, pero el dataset de origen (BDD100K) tiene sus propias condiciones de uso sobre las imagenes, que hay que respetar al redistribuir datos o modelos derivados.
- El repositorio figura con 0,0 GB y 0 descargas en el momento de la consulta, lo que sugiere un uso muy limitado y poca validacion por parte de la comunidad; conviene tratar los pesos con cautela en produccion.
- El split denominado `test` en BDD100K-Toolkit corresponde, segun una publicacion del propio autor, al conjunto de validacion oficial de BDD100K; es un detalle relevante para interpretar las cifras frente a otros trabajos.
- Sin soporte de texto, agentes ni razonamiento: cualquier descripcion textual de la escena debe generarse con otro modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dronefreak/bdd100k-period-mobilenetv4_conv_small
- Dataset de clasificacion: https://huggingface.co/datasets/dronefreak/BDD100K-Period-Classification
- Repositorio fuente BDD100K-Toolkit: https://github.com/dronefreak/bdd100k-toolkit
- Publicacion del autor sobre el model zoo de BDD100K: https://huggingface.co/posts/dronefreak/988753800362571
- Modelo relacionado del mismo autor (deteccion): https://huggingface.co/dronefreak/bdd100k-yolo26s
- Articulo de MobileNetV4: https://arxiv.org/abs/2404.10518
- Articulo de BDD100K: https://arxiv.org/abs/1805.04687
- Model zoo oficial de BDD100K: https://github.com/SysCV/bdd100k-models
- Sitio de Berkeley DeepDrive: http://bdd-data.berkeley.edu/
- Reimplementacion de MobileNetV4 en PyTorch: https://github.com/jiaowoguanren0615/MobileNetV4
