# kornitsovivan/max1

## Resumen

max1 es un modelo de deteccion de objetos publicado por el usuario kornitsovivan en Hugging Face. Segun su model card, detecta cuatro clases especificas del dominio de estaciones de servicio: surtidor de combustible (petrol pump), manguera de combustible (petrol hose), marquesina (roof canopy) y panel de precios (price board). El repositorio incluye los pesos en formato ONNX, un script de inferencia en Python (`miner.py`) y un fichero de configuracion de servicio (`chute_config.yml`).

El modelo esta etiquetado con el pipeline `object-detection` y la licencia AGPL-3.0. No se especifica la arquitectura base, el tamano de entrada, el numero de parametros ni el conjunto de datos de entrenamiento en la informacion disponible. El repositorio figura con un tamano de 0.0 GB y cero descargas, lo que sugiere un artefacto reciente o de uso interno mas que un modelo consolidado de proposito general.

Su relevancia es acotada: se trata de un detector vertical para un caso de uso muy concreto (inspeccion o inventario de estaciones de servicio), no de un modelo fundacional. Para un desarrollador que necesite detectar estos elementos en imagenes de gasolineras puede ser un punto de partida util; para cualquier otra tarea de vision, las alternativas genericas son mas adecuadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (pesos en ONNX; no se indica la red base) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | no disponible (se distribuye un unico `weights.onnx`) |
| Idiomas soportados | no aplica (deteccion de objetos); etiquetas de clase en ingles |
| Licencia | AGPL-3.0 |
| Formato de pesos | ONNX (`weights.onnx`) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo. La model card solo indica que la red se distribuye como `weights.onnx`, un grafo ONNX exportado, sin especificar si se trata de una familia YOLO, un detector basado en transformer o una CNN clasica. Tampoco se documenta la resolucion de entrada, el numero de parametros ni las capas de salida.

Respecto al entrenamiento, no hay datos sobre el numero de imagenes, la composicion del dataset, el regimen de aumento de datos ni si se aplicaron tecnicas de destilacion o ajuste fino desde un modelo preentrenado. Las cuatro clases definidas (petrol pump, petrol hose, roof canopy, price board) indican un dataset de dominio muy especifico, probablemente recopilado para un unico despliegue. No se documentan innovaciones tecnicas.

## Capacidades

- Deteccion de objetos en imagenes limitada a cuatro clases: surtidor de combustible, manguera de combustible, marquesina y panel de precios.
- Inferencia por lotes mediante la API `Miner(path).predict_batch(batch_images, offset, n_keypoints)` del script `miner.py`.
- Salida de detecciones con keypoints, segun el parametro `n_keypoints` de la funcion de inferencia (el numero y significado de los keypoints no esta documentado).
- Despliegue como servicio mediante el fichero `chute_config.yml`, orientado a un entorno de serving tipo Chute.
- No soporta generacion de texto, razonamiento, codigo, matematicas, vision general, tool calling, agentes ni capacidades multilingues.
- No se documenta ningun modo especial (thinking, audio, video).

## Casos de uso

- Inventario de estaciones de servicio: procesar lotes de imagenes aereas o de calle para contar surtidores, mangueras, marquesinas y paneles de precios, usando `predict_batch` sobre el conjunto de imagenes del levantamiento.
- Auditoria de mantenimiento: detectar la presencia o ausencia de mangueras y surtidores en fotografias periodicas para priorizar inspecciones in situ; el modelo esta entrenado especificamente para estos elementos.
- Verificacion de cumplimiento de imagen de marca: comprobar la presencia y ubicacion del panel de precios y la marquesina en fotografias enviadas por franquiciados.
- Control de calidad de despliegues de carteleria: comparar imagenes antes y despues de una reforma para confirmar la instalacion de los elementos esperados.
- Etiquetado asistido de datasets: usar las detecciones como preanotaciones para construir un corpus mayor de imagenes de estaciones de servicio, revisando manualmente las salidas.
- Integracion en un servicio de vision interno: desplegar `weights.onnx` con el `chute_config.yml` proporcionado y exponer una API de deteccion para el resto de sistemas de la organizacion.
- Analisis de imagenes satelitales o de dron de instalaciones: localizar marquesinas y surtidores en ortofotos para tareas de inventario de activos, siempre que la resolucion y el punto de vista sean compatibles con los datos de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de precision (mAP, IoU), recall, latencia ni comparaciones con otros detectores.

## Requisitos de hardware

- VRAM estimada: no disponible; al no conocerse el tamano del modelo ni la resolucion de entrada, no es posible estimarla.
- GPU recomendadas: no disponible. Al tratarse de un grafo ONNX, puede ejecutarse en CPU o en GPU mediante ONNX Runtime, pero no se documenta el rendimiento en ninguna de las dos.
- Compatibilidad con GPU de consumo: probable en principio para cualquier detector ONNX de tamano moderado, pero no confirmada por el autor.
- Opciones de despliegue: ONNX Runtime (CPU o GPU) y el serving descrito en `chute_config.yml`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un detector de objetos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo, por lo que no es posible una comparacion cuantitativa. Como alternativas funcionales de deteccion de objetos de proposito general con pesos ONNX disponibles se pueden considerar las familias YOLO (YOLOv8, YOLO11) y DETR, pero no se dispone de informacion para comparar parametros, contexto ni precision con max1.

| Modelo | Parametros | Clases | Licencia | Formato |
|---|---|---|---|---|
| kornitsovivan/max1 | no disponible | 4 (dominio gasolineras) | AGPL-3.0 | ONNX |
| Alternativas genericas (YOLO, DETR) | no disponible en esta ficha | COCO u otras | variable | ONNX, PyTorch |

## Limitaciones y advertencias

- No se documenta la arquitectura, el tamano ni el dataset de entrenamiento, lo que impide evaluar la calidad del modelo antes de desplegarlo.
- El dominio esta restringido a cuatro clases de estaciones de servicio; el modelo no es util para deteccion de objetos general.
- No hay metricas publicadas de precision, recall ni mAP; el rendimiento real es desconocido.
- Riesgo de alucinacion de detecciones (falsos positivos) y de omisiones (falsos negativos) sin datos que permitan acotarlo.
- La licencia AGPL-3.0 impone obligaciones copyleft fuertes: el uso en un servicio en red puede obligar a liberar el codigo del servicio que lo integra. Es un caveat importante para uso comercial.
- El repositorio tiene cero descargas y cero likes, y un tamano declarado de 0.0 GB, lo que sugiere que los pesos podrian no estar efectivamente subidos o que el artefacto es de uso interno; conviene verificar la integridad del repositorio antes de integrarlo.
- El parametro `n_keypoints` de `predict_batch` no esta documentado; su semantica y valores validos deben deducirse leyendo `miner.py`.
- No se especifican los idiomas ni la procedencia de los datos, por lo que no puede evaluarse el sesgo geografico o de imagen del modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kornitsovivan/max1
- No se han encontrado en la busqueda web papers, blogs, repositorios ni demos adicionales asociados al modelo.
