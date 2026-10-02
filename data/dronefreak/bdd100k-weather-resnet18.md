# dronefreak/bdd100k-weather-resnet18

## Resumen

El modelo `dronefreak/bdd100k-weather-resnet18` es un clasificador de imagenes de escenas de conduccion que predice la condicion meteorologica a partir de una unica fotografia de carretera. Se trata de un ResNet-18 (11,2 millones de parametros) afinado sobre el conjunto BDD100K Weather Classification, una tarea no oficial derivada del campo `attributes.weather` de las anotaciones de BDD100K. La salida es una de siete clases: `clear`, `partly cloudy`, `overcast`, `rainy`, `snowy`, `foggy` y `unknown`.

Lo publica el usuario `dronefreak` como parte de BDD100K-Toolkit, una herramienta orientada a preparar el dataset, entrenar modelos sobre el y evaluarlos con las mismas metricas y los mismos splits. El checkpoint esta implementado con la libreria `timm` sobre PyTorch y se distribuye bajo licencia Apache-2.0, lo que permite uso comercial sin restricciones adicionales.

Su relevancia practica esta en dos frentes. Por un lado, sirve como etiquetador automatico de clima para curar y filtrar datasets de conduccion autonomo, y como modulo de enrutado condicional en pipelines de percepcion (activar deslluvia o desempanado solo cuando hace falta). Por otro, es un baseline reproducible y ligero (repo de 0,1 GB) que cabe en hardware de gama media y en dispositivos de borde. Conviene tener presente desde el principio que la clase `foggy` no se clasifica correctamente en el split de evaluacion, con 13 imagenes y 0% de recall.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet-18 (CNN con conexiones residuales; implementacion `resnet18` de `timm`) |
| Parametros totales | 11,2 millones |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (clasificacion de imagenes; entrada fija de 224 x 224 px) |
| Tipos de cuantizacion | no disponible; el repositorio solo publica pesos en precision completa. Es cuantizable a int8/fp16 con herramientas estandar (ONNX Runtime, TensorRT, OpenVINO), pero el autor no reporta resultados de esas variantes |
| Idiomas soportados | no aplica (modelo de vision; no procesa texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | checkpoint PyTorch `.pt` (`best.pt`) con las claves `model_name`, `state_dict`, `class_names`, `imgsz`, `mean` y `std`. No se publican safetensors, ONNX ni GGUF |
| Tarea | Clasificacion de imagen multiclase (7 clases) |
| Clases | `clear`, `partly cloudy`, `overcast`, `rainy`, `snowy`, `foggy`, `unknown` |
| Framework | PyTorch + `timm` (`torch.load(..., weights_only=True)` compatible) |
| Preprocesado | Redimensionado a 224 x 224, `ToTensor`, normalizacion con la media y desviacion tipica almacenadas en el propio checkpoint |
| Tamano del repositorio | 0,1 GB |
| Dataset de entrenamiento | `dronefreak/BDD100K-Weather-Classification` (derivado de BDD100K) |

## Arquitectura y entrenamiento

La red es un ResNet-18 estandar, es decir, una CNN de 18 capas con bloques residuales que mitigan el problema de desvanecimiento del gradiente mediante conexiones de identidad. No incorpora atencion, mecanismos de mezcla de expertos ni componentes de estado (SSM); es una arquitectura puramente convolucional, con una capa final de clasificacion reconfigurada al numero de clases del dataset (`num_classes` se toma del propio checkpoint). Con 11,2 M de parametros y una entrada de 224 x 224 px, el coste computacional es bajo comparado con los transformers de vision habituales.

El ajuste fino se realizo con los siguientes hiperparametros declarados en la model card: batch size 128, resolucion de imagen 224, un maximo de 50 epocas, entrenamiento detenido en la epoca 19 y mejor checkpoint en la epoca 9, seleccionado por macro F1 sobre el split de validacion, con paciencia de early stopping de 10 epocas. El optimizador, el learning rate, el esquema de decaimiento y las tecnicas de aumento de datos no estan disponibles: ese bloque de la model card aparece truncado en la informacion proporcionada. No se menciona ningun uso de RLHF, DPO ni ajuste por preferencias, algo que no aplica a un clasificador de imagen.

La tarea se construye extrayendo el campo `attributes.weather` de BDD100K y mapeandolo a siete categorias, siguiendo el dataset de Kaggle con el mismo nombre. La model card aclara explicitamente que se trata de una tarea no oficial, lo que implica que la particion train/valid/test, los criterios de mapeo de etiquetas y el tratamiento de los casos ambiguos (la clase `unknown`) son decisiones del autor y no un estandar del benchmark original.

## Capacidades

- Clasificacion de imagen multiclase en siete categorias meteorologicas a partir de una fotografia de escena de conduccion.
- Reconocimiento robusto de condiciones frecuentes en BDD100K: `clear` (F1 91,27%), `snowy` (78,09%), `rainy` (74,55%), `unknown` (73,29%), `overcast` (67,58%) y `partly cloudy` (65,35%).
- Salida de probabilidades por clase (softmax), util para umbralizar decisiones o encadenar con un segundo modulo.
- Inferencia sobre imagenes individuales, con preprocesado reproducible integrado en el checkpoint (media, desviacion tipica y tamano de entrada).
- Uso como etiquetador automatico para anotar o filtrar grandes volumenes de fotogramas de video de conduccion.
- Capacidad de servir como extractor de caracteristicas convolucionales (backbone), ya que el `state_dict` de ResNet-18 es reutilizable para otras cabezas.
- Sin soporte de tool calling, function calling, agentes, razonamiento multi-paso, texto, audio ni video nativo: el modelo procesa una unica imagen y devuelve una etiqueta.

## Casos de uso

- Etiquetado y curacion de datasets de conduccion autonomo: dado un conjunto de fotogramas extraidos de video, el modelo asigna la condicion meteorologica a cada imagen, lo que permite construir subconjuntos equilibrados por clima o descartar escenas poco representadas antes de entrenar un detector.
- Evaluacion de robustez de modelos de percepcion: aplicando el clasificador como etiquetador auxiliar, se puede desagregar la precision de un detector de objetos por condicion meteorologica y detectar degradaciones que las metricas agregadas ocultan.
- Enrutado condicional en pipelines ADAS: si la etiqueta es `rainy` o `snowy`, el sistema puede activar modulos especificos de mejora de imagen, ajustar umbrales de deteccion o reducir la velocidad recomendada. Con 224 x 224 px y 11,2 M de parametros, el coste de ejecutar este clasificador en cada fotograma es minimo.
- Monitorizacion de flotas y logistica: a partir de las camaras ya instaladas en los vehiculos, clasificar las condiciones de la via para generar informes de riesgo por tramo horario, planificar mantenimiento o avisar de cambios bruscos de visibilidad.
- Control de calidad en anotacion: verificar que las etiquetas meteorologicas de un dataset externo son coherentes con el contenido de la imagen, marcando discrepancias para revision humana.
- Inferencia en dispositivo de borde: por su tamano, es viable en plataformas embebidas (Jetson, SoC con acelerador de vision) para preprocesado local, evitando enviar video a la nube.
- Investigacion academica y docencia: sirve como baseline reproducible de bajo coste para comparar backbone convolucionales, estrategias de aumento de datos o funciones de perdida en una tarea de clima de siete clases.
- Sistema de alerta de niebla: solo como componente auxiliar y nunca como unico sensor, dado que el modelo no detecta la clase `foggy` de forma fiable (recall 0% en el split de evaluacion).

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el split `test` (10.000 imagenes) del dataset BDD100K Weather Classification. Los valores estan marcados como no verificados (`verified: false`) en el model-index.

| Metrica | Valor |
|---|---|
| Top-1 accuracy | 82,19% |
| Top-5 accuracy | 99,85% |
| Macro F1 | 64,30% |
| Balanced accuracy | 62,97% |
| Macro precision | 66,08% |
| Macro recall | 62,97% |

Desglose por clase en el mismo split:

| Clase | Precision | Recall | F1 | Imagenes de test |
|---|---|---|---|---|
| clear | 89,68% | 92,93% | 91,27% | 5346 |
| foggy | 0,00% | 0,00% | 0,00% | 13 |
| overcast | 67,44% | 67,72% | 67,58% | 1239 |
| partly cloudy | 68,19% | 62,74% | 65,35% | 738 |
| rainy | 83,90% | 67,07% | 74,55% | 738 |
| snowy | 83,33% | 73,47% | 78,09% | 769 |
| unknown | 70,06% | 76,84% | 73,29% | 1157 |

No se han publicado resultados de benchmarks en la informacion disponible para tareas distintas de esta clasificacion (no hay ImageNet, MMLU, HumanEval ni similares).

## Requisitos de hardware

- Tamano de los pesos (estimacion a partir de 11,2 M de parametros): unos 45 MB en fp32, unos 22 MB en fp16 y unos 11 MB en int8.
- VRAM para inferencia: por debajo de 1 GB en fp32 con batch 1 e incluyendo el contexto de CUDA (estimacion). El entrenamiento declarado con batch 128 a 224 x 224 px requiere del orden de 2-4 GB en fp32 con precision mixta (estimacion, no confirmada por el autor).
- GPU recomendadas: cualquier GPU con 2 GB o mas. Funciona sin problemas en RTX 3050, RTX 3060, RTX 4060, RTX 4090, T4, L4, A10, L40S. En A100 o H100 es claramente sobredimensionado para un modelo de este tamano.
- Cabe en GPU de consumo: si, en practicamente todas las GPU dedicadas de los ultimos diez anos, e incluso en iGPU integradas para inferencia puntual.
- Edge y CPU: viable en CPU x86 moderna (latencia no medida) y en plataformas embebidas tipo Jetson Nano, Jetson Orin o Raspberry Pi 5 con un runtime optimizado. La latencia y el throughput concretos no estan disponibles en la informacion proporcionada.
- Opciones de despliegue: PyTorch + `timm` como ruta de referencia (script de uso incluido en la model card), exportacion a TorchScript, ONNX Runtime, TensorRT, OpenVINO, y servidores de inferencia como Triton Inference Server o TorchServe. No aplica llama.cpp, Ollama ni GGUF, ya que no es un modelo de lenguaje.

## Comparativa con modelos similares

Todos los modelos de la tabla pertenecen al mismo model zoo del autor, evaluados sobre el mismo split `test` con las mismas metricas. No se dispone de datos de parametros, licencia ni contexto de las alternativas en la informacion proporcionada.

| Modelo | Top-1 | Macro F1 | Balanced accuracy | Macro precision | Parametros | Licencia |
|---|---|---|---|---|---|---|
| convnext_atto | 83,00% | 67,44% | 65,25% | 81,38% | no disponible | no disponible |
| efficientvit_b0 | 82,79% | 65,10% | 63,62% | 67,11% | no disponible | no disponible |
| resnet18 (este modelo) | 82,19% | 64,30% | 62,97% | 66,08% | 11,2 M | Apache-2.0 |
| mobilenetv4_conv_small | 82,16% | 66,51% | 64,37% | 80,44% | no disponible | no disponible |
| yolo26n-cls | 82,04% | 64,09% | 62,46% | 66,57% | no disponible | no disponible |
| yolo11n-cls | 81,32% | 62,91% | 61,19% | 65,68% | no disponible | no disponible |
| yolov8n-cls | 81,22% | 63,07% | 61,42% | 65,52% | no disponible | no disponible |

Lectura de la comparativa: la diferencia entre el mejor y el peor modelo del zoo en Top-1 es de solo 1,78 puntos porcentuales, mientras que en macro precision el rango es mucho mayor (de 65,52% a 81,38%), lo que indica que la eleccion del backbone afecta sobre todo al equilibrio entre clases, no a la precision global. `convnext_atto` y `mobilenetv4_conv_small` superan al ResNet-18 en casi todas las metricas macro pese a ser modelos mas pequenos, por lo que este checkpoint es una opcion razonable pero no la optima del zoo.

Como referencia externa, el repositorio oficial `SysCV/bdd100k-models` incluye una configuracion de etiquetado meteorologico con ResNet-18 (`resnet18_4x_weather_tag_bdd100k`), pero no se dispone de sus cifras de rendimiento en la informacion proporcionada.

## Limitaciones y advertencias

- La clase `foggy` no se clasifica correctamente: 0% de precision, recall y F1 sobre las 13 imagenes de test de esa clase. El propio autor recomienda tratarla como no soportada. Cualquier uso que dependa de detectar niebla es inseguro.
- Desequilibrio severo de clases: `clear` concentra 5346 de las 10.000 imagenes de test (53,5%), mientras que `foggy` tiene 13 (0,13%). Las metricas macro bajas (F1 64,30%) reflejan este problema; la Top-1 de 82,19% es enganosamente alta porque esta dominada por la clase mayoritaria.
- Confusion entre condiciones visualmente proximas: `partly cloudy` (recall 62,74%) y `overcast` (67,72%) son las clases mas dificiles, y `rainy` pierde un tercio de sus positivos (recall 67,07%).
- Metricas no verificadas: los valores del model-index tienen `verified: false`, es decir, proceden del autor y no han sido reproducidos por un tercero independiente.
- Ambiguedad del split de evaluacion: segun una publicacion del propio autor referida a sus zoos de BDD100K, el conjunto que se denomina `test` corresponde al split de validacion oficial de BDD100K. Conviene confirmarlo antes de comparar cifras con otros trabajos que usen la particion oficial.
- Etiquetas derivadas de un campo de atributos de BDD100K, no de un benchmark meteorologico oficial: la taxonomia, el mapeo y el tratamiento de la clase `unknown` son decisiones del autor, lo que limita la comparabilidad con otros estudios.
- Modelo puramente visual y monocuadro: no usa informacion temporal ni datos de sensores, de modo que una imagen aislada con poca senal visual (noche sin iluminacion, tuneles, camaras sucias o sobreexpuestas) puede etiquetarse de forma erronea.
- Riesgo de alucinacion en el sentido de falsos positivos seguros de si mismos: la salida softmax puede dar alta confianza en clases incorrectas, especialmente en dominios distintos de BDD100K (otras camaras, paises, montajes o resoluciones). Es imprescindible validar el umbral de confianza con datos propios antes de usarlo en produccion.
- Sesgos geograficos y de captura: BDD100K se grabo fundamentalmente en Estados Unidos, con la distribucion de camaras, iluminacion y climatologia propia de ese entorno. El rendimiento en otras regiones no esta medido.
- Uso en sistemas de seguridad critica: este modelo no debe emplearse como fuente unica de decision en frenado, control de velocidad ni avisos de visibilidad, dado el fallo total en `foggy` y el desequilibrio de clases.
- Licencia Apache-2.0: permite uso comercial, modificacion y redistribucion manteniendo el aviso de licencia y el fichero de cambios. No se imponen restricciones de campo de uso, pero el dataset BDD100K subyacente tiene sus propias condiciones, que deben revisarse por separado.
- Adopcion practica: 0 descargas y 0 likes en el momento de la consulta, sin publicacion cientifica asociada, lo que reduce la validacion externa disponible.
- Los detalles de optimizacion (optimizador, learning rate, aumentos de datos) no estan disponibles, lo que dificulta reproducir exactamente el entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dronefreak/bdd100k-weather-resnet18
- Dataset de entrenamiento: https://huggingface.co/datasets/dronefreak/BDD100K-Weather-Classification
- Repositorio BDD100K-Toolkit: https://github.com/dronefreak/bdd100k-toolkit
- Publicacion del autor sobre los zoos de BDD100K: https://huggingface.co/posts/dronefreak/988753800362571
- Coleccion de modelos de deteccion de objetos BDD100K del mismo autor: https://huggingface.co/collections/dronefreak/bdd100k-object-detection-model-zoo
- Model zoo oficial de BDD100K (SysCV): https://github.com/SysCV/bdd100k-models
- Configuracion oficial de etiquetado meteorologico con ResNet-18: https://github.com/SysCV/bdd100k-models/blob/main/tagging/configs/weather/resnet18_4x_weather_tag_bdd100k.py
- BDD100K en la plataforma de Ultralytics: https://platform.ultralytics.com/ultralytics/datasets/bdd100k
- Paper de ResNet (Deep Residual Learning for Image Recognition): https://arxiv.org/abs/1512.03385
- Paper de BDD100K: https://arxiv.org/abs/1805.04687
- Enlace al paper de referencia de `timm`: no disponible en la informacion proporcionada
- Dataset de Kaggle con el mismo nombre mencionado en la model card: no disponible en la informacion proporcionada
