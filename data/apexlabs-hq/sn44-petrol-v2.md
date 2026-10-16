# apexlabs-hq/sn44-petrol-v2

## Resumen

sn44-petrol-v2 es un detector de objetos en formato ONNX publicado por el usuario apexlabs-hq en Hugging Face. El modelo esta especializado en la deteccion de elementos propios de una estacion de servicio (gasolinera): surtidores de combustible (petrol pump), mangueras (petrol hose), marquesina o cubierta (roof canopy) y panel de precios (price board). Se sirve como modelo end-to-end mediante el script `miner.py` sobre el runtime onnxruntime, lo que lo situa en el contexto de los mineros de la subred 44 (TurboVision / Score) de Bittensor.

No se trata de un modelo de lenguaje, sino de un detector visual de proposito especifico. El modelo card no aporta informacion sobre arquitectura interna (backbone), numero de parametros, datos de entrenamiento ni licencia; unicamente describe la configuracion de inferencia (tamano de imagen de 736 px, umbrales de confianza por clase, supresion de duplicados entre clases con IoU 0.9 y hash SHA-256 de los pesos).

Su relevancia es acotada y practica: forma parte de una familia de artefactos ONNX ligeros orientados a tareas de vision concretas dentro de un pipeline de mineria descentralizada, donde el objetivo es replicar el comportamiento de un modelo de referencia (`manak0/Detect-petrol-station-1-0`) con la maxima fidelidad posible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Detector de objetos end-to-end en ONNX (backbone no especificado) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de vision) |
| Licencia | no disponible |
| Formato de pesos | ONNX |

Datos adicionales de inferencia declarados en el model card:

| Parametro de inferencia | Valor |
|---|---|
| Tamano de imagen (imgsz) | 736 px |
| Umbral de confianza global | 0.12 |
| Umbral de confianza por clase | clase 0: 0.25; clase 1: 0.2; clase 2: 0.25; clase 3: 0.25 |
| Supresion de duplicados entre clases (IoU) | 0.9 |
| Margen de rescate por clase bajo el suelo | clase 0: 0.02; clase 1: 0.02; clase 2: 0.02; clase 3: 0.02 |
| Hash SHA-256 de los pesos | 9b1adb805e88b6bcc8021bb0efa4fc3fc3fa590b7ef461373128690ee8dcd680 |
| Clases detectadas | petrol pump, petrol hose, roof canopy, price board |

Tamano del repositorio reportado por Hugging Face: 0.0 GB (no se indica un peso concreto del artefacto).

## Arquitectura y entrenamiento

El model card describe un detector end-to-end exportado a ONNX y servido con onnxruntime a traves de `miner.py`. No se especifica la arquitectura interna (si es una YOLO, un DETR, un modelo basado en anchor o anchor-free, ni el backbone empleado). Tampoco se detalla el conjunto de datos de entrenamiento, el numero de imagenes, el numero de tokens o parametros, ni si se aplicaron tecnicas de aumento de datos o destilacion.

La unica informacion tecnica disponible se refiere a la configuracion de post-procesado: umbrales de confianza por clase, un mecanismo de supresion de duplicados entre clases con IoU 0.9 y un margen de rescate por clase bajo el umbral (rescue margin) de 0.02. Estos parametros sugieren un pipeline de deteccion con etapas de filtrado fino para evitar solapamientos entre clases con objetos proximos (por ejemplo, surtidor y manguera).

El contexto de la busqueda web indica que este tipo de artefactos forma parte de la subred 44 de Bittensor (Score / TurboVision), donde se publican modelos de vision destilados y ligeros, en algunos casos de aproximadamente 19 MB, orientados a tareas de deteccion. Sin embargo, no se aportan datos de entrenamiento verificables para esta version concreta.

## Capacidades

- Deteccion de objetos en imagenes, restringida a cuatro clases: surtidor de combustible, manguera, marquesina y panel de precios.
- Inferencia end-to-end mediante ONNX y onnxruntime, sin dependencia de frameworks de aprendizaje profundo completos.
- Post-procesado configurable con umbrales de confianza globales y por clase.
- Supresion de duplicados entre clases mediante umbral de IoU (0.9).
- Margen de rescate por clase para recuperar detecciones marginales por debajo del umbral.
- No soporta tool calling ni function calling.
- No dispone de capacidades de agentes ni de razonamiento multi-paso.
- No es un modelo multilingue ni de generacion de texto.
- No dispone de modo de razonamiento (thinking mode), vision multimodal generativa, audio ni otras capacidades especiales.

## Casos de uso

- Inventario automatizado de estaciones de servicio: el detector puede procesar imagenes capturadas por camaras o drones para identificar surtidores, mangueras, marquesinas y paneles de precios, lo que permite mantener un censo actualizado de los elementos presentes en cada instalacion.
- Verificacion de mantenimiento de surtidores y mangueras: integrado en un pipeline de revision periodica de imagenes, el modelo puede senalar la presencia de mangueras o surtidores para priorizar inspecciones fisicas.
- Monitorizacion de paneles de precios: la deteccion de la clase `price board` permite localizar los carteles de precios en la imagen, paso previo a un OCR que extraiga las tarifas.
- Analisis de infraestructura en imagenes aereas o de satelite: la clase `roof canopy` facilita la localizacion de marquesinas, util para estudios de ocupacion o de planificacion urbana.
- Automatizacion de tareas de anotacion: el modelo puede usarse como pre-anotador para generar cajas candidatas sobre grandes volumenes de imagenes, acelerando el etiquetado manual posterior por parte de anotadores humanos.
- Auditoria de fidelidad de modelos destilados: dado su contexto en la subred 44 de Bittensor, sirve como artefacto de referencia para verificar que un minero reproduce el comportamiento del detector original `manak0/Detect-petrol-station-1-0`.
- Procesamiento en el borde (edge): al ser un modelo ONNX ligero servido por onnxruntime, puede desplegarse en dispositivos sin GPU dedicada para tareas de deteccion en tiempo casi real sobre flujos de imagen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al tratarse de un detector ONNX de pequeno tamano (el modelo similar `bittensor-miner-apex/sn44-petrol` ocupa 9.88 MB), es probable que la huella de memoria sea reducida, pero no se aporta una cifra verificada para esta version.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada por el autor; por el formato ONNX y el tamano reducido, es plausible su ejecucion en CPU, pero no se especifica.
- Opciones de despliegue: onnxruntime a traves de `miner.py`, segun el model card. No se documentan otras alternativas (no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Clases | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| apexlabs-hq/sn44-petrol-v2 | Detector de objetos | petrol pump, petrol hose, roof canopy, price board | ONNX | no disponible | Hugging Face |
| bittensor-miner-apex/sn44-petrol | Detector de objetos | no disponible en la informacion | ONNX | no disponible | Hugging Face (9.88 MB) |
| manak0/Detect-petrol-station-1-0 | Detector de objetos (referencia) | no disponible en la informacion | no disponible | no disponible | Hugging Face (mencionado como origen) |

No se dispone de datos de rendimiento (mAP, precision, recall) que permitan una comparacion cuantitativa entre estos modelos.

## Limitaciones y advertencias

- El model card no declara licencia, por lo que se desconoce si su uso comercial esta permitido.
- No se especifican los datos de entrenamiento, lo que impide evaluar sesgos o cobertura de dominios (interiores, exteriores, distintas condiciones de iluminacion, paises, etc.).
- El modelo esta restringido a cuatro clases muy especificas; no generaliza a otros objetos ni a tareas de vision distintas.
- Riesgo de alucinacion de detecciones (falsos positivos) derivado de umbrales de confianza bajos (0.12 global, con valores por clase entre 0.2 y 0.25) que priman el recall sobre la precision.
- El mecanismo de rescate por clase (margen 0.02) puede incrementar los falsos positivos en imagenes con objetos similares.
- No se documenta el rendimiento en imagenes nocturnas, con mala iluminacion, oclusiones severas o resoluciones distintas de 736 px.
- No hay informacion sobre el numero de parametros ni sobre la arquitectura, lo que dificulta estimar costes de despliegue y ajuste.
- Al formar parte de un pipeline de mineria de la subred 44 de Bittensor, su comportamiento puede estar condicionado por los requisitos del sistema de recompensas y no por una evaluacion independiente de calidad.
- La ausencia de benchmarks publicos impide garantizar su calidad frente a detectores genericos ampliamente validados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/apexlabs-hq/sn44-petrol-v2
- Modelo similar (bittensor-miner-apex/sn44-petrol): https://huggingface.co/bittensor-miner-apex/sn44-petrol
- Repositorio de archivos del modelo similar: https://huggingface.co/bittensor-miner-apex/sn44-petrol/tree/main
- Modelo de referencia (manak0/Detect-petrol-station-1-0): https://huggingface.co/manak0/Detect-petrol-station-1-0
- Articulo sobre la subred 44 de Bittensor (Score): https://genfinity.io/2026/06/18/bittensor-subnet-44-score-sn44-19mb-vision-model-beats-frontier-ai/
- Biblioteca de modelos YOLO y ONNX (contexto general): https://mossymodels.com/
