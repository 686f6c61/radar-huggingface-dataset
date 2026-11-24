# kornitsovivan/max3

## Resumen

`kornitsovivan/max3` es un detector de objetos publicado en Hugging Face por el usuario kornitsovivan, distribuido en formato ONNX y orientado a la deteccion de elementos propios de una estacion de servicio: surtidor de combustible (petrol pump), manguera (petrol hose), marquesina (roof canopy) y panel de precios (price board). No se trata de un modelo de lenguaje, sino de un modelo de vision por computador para deteccion de objetos, con pipeline declarado `object-detection`.

La model card es extremadamente escueta: unicamente enumera las cuatro clases detectables y los tres ficheros que componen el repositorio (`weights.onnx` con la red, `miner.py` con el codigo de inferencia y `chute_config.yml` con la configuracion de servicio). No se especifica la arquitectura subyacente, el numero de parametros, el tamano de entrada ni el conjunto de datos de entrenamiento.

El modelo es relevante por su caracter de nicho: la deteccion automatica de elementos de estaciones de servicio tiene aplicaciones en inventario, mantenimiento y analisis de precios. Sin embargo, la ausencia de documentacion tecnica y su tamano de repositorio practicamente nulo (0.0 GB reportados) hacen imprescindible inspeccionar los artefactos antes de cualquier uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (red exportada a ONNX; no se especifica la familia) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | no disponible (solo se publica `weights.onnx`, sin variantes cuantizadas) |
| Idiomas soportados | no disponible (no aplica a la tarea de deteccion) |
| Licencia | AGPL-3.0 |
| Formato de pesos | ONNX (`weights.onnx`) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna de la red: la model card no indica si se trata de un detector de una etapa (tipo YOLO o SSD) o de dos etapas (tipo Faster R-CNN), ni el backbone empleado, ni la resolucion de entrada esperada. El unico dato tecnico es que los pesos se distribuyen en formato ONNX, lo que implica que la red fue exportada desde algun framework de entrenamiento (probablemente PyTorch) y es ejecutable mediante ONNX Runtime.

Tampoco se documentan los datos de entrenamiento: no se indica el numero de imagenes, la procedencia del dataset, si hubo aumento de datos, ni el regimen de entrenamiento. La unica informacion sobre las clases es la lista de cuatro categorias (petrol pump, petrol hose, roof canopy, price board). La API de inferencia expuesta en `miner.py` (`Miner(path).predict_batch(batch_images, offset, n_keypoints)`) sugiere procesamiento por lotes y un parametro `n_keypoints`, lo que podria indicar que la salida incluye puntos clave ademas de cajas delimitadoras, pero esto no se confirma en la documentacion.

## Capacidades

- Deteccion de objetos en imagenes para cuatro clases especificas: surtidor de combustible, manguera de combustible, marquesina y panel de precios.
- Inferencia por lotes mediante `predict_batch(batch_images, offset, n_keypoints)`.
- Posible salida con puntos clave (keypoints) ademas de cajas delimitadoras, a juzgar por el parametro `n_keypoints` de la API, aunque no esta documentado.
- Ejecucion via ONNX Runtime, lo que permite desplegarlo en CPU y GPU sin dependencia de frameworks de entrenamiento.
- No soporta generacion de texto, razonamiento, codigo, tool calling, agentes ni capacidades multilingues: es exclusivamente un modelo de vision.
- No se documentan capacidades de segmentacion, clasificacion multi-etiqueta ni deteccion de clases fuera de las cuatro enumeradas.

## Casos de uso

- Inventario automatizado de estaciones de servicio: procesar imagenes de camaras fijas para contar surtidores y mangueras presentes en cada instalacion, usando la inferencia por lotes de `predict_batch` para cubrir varias capturas por pasada.
- Monitorizacion de mantenimiento: detectar mangueras (petrol hose) en imagenes para verificar su presencia y estado aparente, integrando el detector en un pipeline de revision periodica de instalaciones.
- Analisis competitivo de precios: localizar paneles de precios (price board) en imagenes de estaciones para recortar la region y enviarla a un OCR posterior, aprovechando la deteccion de esa clase concreta.
- Verificacion de marquesinas: comprobar la presencia o ausencia de marquesina (roof canopy) en imagenes aereas o terrestres para auditorias de imagen de marca de una red de estaciones.
- Anotacion asistida de datasets: usar el modelo como pre-etiquetador sobre imagenes nuevas para acelerar el etiquetado manual de las cuatro clases, dado que la API devuelve detecciones por lote.
- Control de calidad en despliegues de vision: servir el modelo con la configuracion `chute_config.yml` incluida y usarlo como componente de un servicio de inferencia ONNX para validar el funcionamiento del pipeline antes de sustituirlo por un detector propio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al no conocerse el numero de parametros ni la resolucion de entrada, no es posible estimarla.
- GPU recomendadas: no disponible por la misma razon; cualquier GPU con soporte de ONNX Runtime (CUDA o TensorRT) podria ejecutarlo si el modelo es de tamano moderado.
- Compatibilidad con GPU de consumo: no confirmada; el repo reporta 0.0 GB de tamano, lo que sugiere un artefacto muy pequeno, pero no se puede verificar sin descargar `weights.onnx`.
- Opciones de despliegue: ONNX Runtime (CPU o GPU), y servidores compatibles con ONNX como Triton Inference Server; la configuracion `chute_config.yml` apunta a un despliegue tipo servicio de imagen.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tarea | Clases | Formato | Licencia | Documentacion |
|---|---|---|---|---|---|
| kornitsovivan/max3 | Deteccion de objetos | 4 (estacion de servicio) | ONNX | AGPL-3.0 | Minima (solo model card escueta) |
| YOLOv8 (Ultralytics) | Deteccion de objetos | 80 (COCO) o personalizadas | PyTorch, ONNX, TensorRT | AGPL-3.0 | Extensa |
| RT-DETR (Peking University) | Deteccion de objetos | 80 (COCO) o personalizadas | PyTorch, ONNX | Apache-2.0 | Extensa |
| Faster R-CNN (torchvision) | Deteccion de objetos | 80 (COCO) o personalizadas | PyTorch | BSD-3-Clause | Extensa |

La comparacion con detectores genericos es solo orientativa: max3 esta especializado en cuatro clases de un dominio muy concreto y no se han publicado metricas que permitan comparar su precision con la de esos modelos.

## Limitaciones y advertencias

- Ausencia total de documentacion tecnica: no se conocen arquitectura, parametros, resolucion de entrada ni procedencia de los datos, lo que impide evaluar su calidad de forma rigurosa.
- Riesgo de sobreajuste al dominio de entrenamiento: al tratarse de un detector entrenado para cuatro clases muy especificas, es probable que falle ante variaciones de iluminacion, angulo o paises con instalaciones diferentes.
- Riesgo de falsos positivos y negativos no cuantificado: sin benchmarks ni conjunto de validacion publicado, no hay forma de estimar su precision o recall.
- Licencia AGPL-3.0: el uso comercial es posible, pero cualquier servicio en red que utilice el modelo obliga a liberar el codigo fuente del servicio bajo la misma licencia; es una restriccion relevante para productos propietarios.
- Sin garantias de mantenimiento: el repositorio tiene 0 descargas y 0 likes, y no hay evidencia de soporte o actualizaciones.
- El parametro `n_keypoints` de la API no esta documentado, por lo que el formato exacto de salida debe verificarse inspeccionando `miner.py` antes de integrarlo.
- No apto para tareas fuera de la deteccion de las cuatro clases enumeradas; no debe emplearse como modelo de lenguaje ni para vision general.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kornitsovivan/max3
