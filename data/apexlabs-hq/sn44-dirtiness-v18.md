# apexlabs-hq/sn44-dirtiness-v18

## Resumen

`apexlabs-hq/sn44-dirtiness-v18` es un detector de objetos exportado a formato ONNX, disenado para identificar suciedad y desperfectos en imagenes de habitaciones. El modelo deriva del detector `manako/Detect-room-dirtiness-detection` y se sirve de extremo a extremo mediante `miner.py` sobre el runtime de onnxruntime, lo que sugiere un uso orientado a inferencia ligera y despliegue directo sin framework de deep learning adicional.

El modelo resuelve una tarea de vision por computador muy concreta: la deteccion de cinco clases de suciedad (derrame de liquido, papelera, basura, moho y mancha) sobre imagenes redimensionadas a 736 pixeles. Su relevancia es limitada fuera de ese nicho: el repositorio no incluye model card tecnica, no declara licencia ni idiomas, y no cuenta con descargas ni interacciones en Hugging Face en el momento de la consulta.

No se dispone de informacion sobre la arquitectura interna (backbone, numero de parametros, estrategia de deteccion), el conjunto de entrenamiento ni el rendimiento medido. La ficha se limita, por tanto, a los datos verificables publicados por el autor en el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (detector de objetos exportado a ONNX) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (tarea de vision, sin procesamiento de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX |
| Resolucion de entrada | 736 x 736 (imgsz) |
| Clases detectadas | 5: liquid spillage, bin, litter, mould, stain |
| Umbral de confianza | 0.05 global; 0.7 por clase (clases 0-4) |
| SHA256 de pesos | `a5d8b23941f36c19acc233c5430d260f279cf1985f57a47d7be5a474337471c1` |
| Runtime de inferencia | onnxruntime (via `miner.py`) |
| Tamano del repositorio | 0.0 GB (segun Hugging Face) |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura interna del modelo: se desconoce si emplea un backbone CNN tipo YOLO, un transformer de deteccion (DETR y variantes) u otra familia. El unico dato estructural verificable es que se distribuye como grafo ONNX y que se ejecuta con onnxruntime, lo que implica que la inferencia no requiere PyTorch ni TensorFlow en produccion.

Tampoco hay datos sobre el dataset de entrenamiento (numero de imagenes, composicion por clase, procedencia), sobre el proceso de anotacion ni sobre si se aplicaron tecnicas de aumento de datos o destilacion desde el modelo original `manako/Detect-room-dirtiness-detection`. La model card unicamente documenta la configuracion de inferencia (resolucion 736, umbrales de confianza por clase y hash de los pesos), sin detallar hiperparametros de entrenamiento ni innovaciones tecnicas.

## Capacidades

- Deteccion de objetos en imagenes con cinco clases especificas de suciedad: derrame de liquido, papelera, basura, moho y mancha.
- Inferencia end-to-end en formato ONNX mediante onnxruntime, sin dependencia de frameworks de entrenamiento.
- Umbrales de confianza configurables por clase (0.7 por defecto en las cinco clases), lo que permite ajustar precision y recall por categoria.
- Procesamiento de imagenes a resolucion fija de 736 x 736 pixeles.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, tool calling, capacidades de agente ni multimodalidad mas alla de la vision.
- No se documentan capacidades multilingues ni procesamiento de lenguaje natural.

## Casos de uso

- Inspeccion automatizada de habitaciones de alquiler vacacional: el detector puede procesar fotografias de check-out para identificar derrames, basura o manchas y activar protocolos de limpieza antes de la siguiente reserva.
- Control de calidad en limpieza de oficinas y espacios comerciales: integrado en una app movil, permite al personal fotografiar una sala y obtener una lista de incidencias detectadas (papeleras llenas, moho en esquinas, manchas en moqueta).
- Auditoria de estado en alojamientos turisticos: comparar imagenes de entrada y salida para documentar danos y respaldar reclamaciones o cargos por limpieza.
- Mantenimiento preventivo en instalaciones: deteccion de moho en banos o zonas humedas para priorizar intervenciones antes de que el problema se extienda.
- Triaje en flujos de gestion de incidencias: clasificar automaticamente tickets con foto adjunta segun el tipo de suciedad detectada y enrutarlos al equipo o proveedor adecuado.
- Despliegue en dispositivos de borde: al ser un modelo ONNX ejecutable con onnxruntime, puede correr en mini-PC o dispositivos sin GPU dedicada dentro de un sistema de camaras fijas en interiores.
- Prototipado rapido en pipelines de vision: servir como componente de deteccion dentro de un sistema mayor (por ejemplo, un bot de Telegram o una API interna) gracias a la simplicidad de su runtime.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de mAP, precision, recall, latencia ni comparaciones con otros detectores.

## Requisitos de hardware

- VRAM estimada: no disponible; al ser un modelo ONNX de deteccion y con un repositorio de 0.0 GB, es probable que quepa en GPU consumer de gama baja, pero no hay datos que lo confirmen.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU consumer: no confirmada; el uso de onnxruntime permite ejecucion en CPU, lo que sugiere que el modelo puede funcionar sin GPU dedicada.
- Opciones de despliegue: onnxruntime (documentado por el autor mediante `miner.py`); otras opciones como vLLM, llama.cpp, Ollama o TGI no aplican a un detector de vision.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada modelos comparables de la misma categoria (deteccion de suciedad en interiores) con datos verificables de parametros, contexto o rendimiento.

## Limitaciones y advertencias

- Ausencia total de model card tecnica: no se documentan arquitectura, datos de entrenamiento, metricas ni proceso de validacion, lo que impide evaluar su calidad de forma objetiva.
- Licencia no declarada: no es posible determinar si el uso comercial esta permitido; en produccion seria necesario contactar con el autor o asumir el riesgo legal.
- Cero descargas y cero likes en Hugging Face: no hay evidencia de uso real ni de validacion por parte de la comunidad.
- El repositorio reporta 0.0 GB de tamano, lo que resulta inconsistente con un modelo ONNX funcional; conviene verificar la integridad de los archivos antes de desplegarlo.
- Umbral de confianza global muy bajo (0.05) con umbrales por clase de 0.7: la configuracion es poco convencional y puede generar falsos positivos o descartar detecciones validas segun como se apliquen ambos umbrales.
- Dominio muy restringido: solo cinco clases de suciedad en interiores; no generaliza a otras tareas de vision.
- Riesgo de sesgo desconocido: al no documentarse el dataset, no se puede evaluar el sesgo por tipo de superficie, iluminacion, geografia o mobiliario.
- Sin soporte de idiomas ni texto: no apto para tareas de lenguaje.
- Fecha de creacion futura (2026-11-03) en los metadatos de Hugging Face, lo que sugiere posible manipulacion de metadatos o un error del autor; conviene tratarlo con cautela.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/apexlabs-hq/sn44-dirtiness-v18
- Modelo de origen: https://huggingface.co/manako/Detect-room-dirtiness-detection
