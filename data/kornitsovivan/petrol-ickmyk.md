# kornitsovivan/petrol-ickmyk

## Resumen

`petrol-ickmyk` es un modelo de deteccion de objetos publicado por el usuario kornitsovivan en Hugging Face. Segun su model card, detecta cuatro clases especificas de un entorno de estacion de servicio: surtidor de gasolina (petrol pump), manguera (petrol hose), marquesina (roof canopy) y panel de precios (price board). El repositorio se distribuye en formato ONNX e incluye un script de inferencia (`miner.py`) y un fichero de configuracion de despliegue (`chute_config.yml`).

Se trata de un modelo de nicho, con cero descargas y cero likes en el momento de la consulta, y un tamano de repositorio de 0.0 GB (lo que sugiere pesos de pocos megabytes o que el contenido no se ha cuantificado de forma fiable). No se especifica arquitectura base, numero de parametros, resolucion de entrada ni procedencia de los datos de entrenamiento.

Por su pipeline (`object-detection`) y su empaquetado ONNX, el modelo esta pensado para inferencia ligera en produccion mas que para uso general. La relevancia es limitada fuera del caso concreto de monitorizacion de estaciones de servicio, y la informacion publica disponible es muy escasa: la ficha se completa indicando explicitamente los datos no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (red de deteccion de objetos exportada a ONNX; no se especifica la familia) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | no disponible (solo se distribuye `weights.onnx`; no se indica precision FP32/FP16/INT8) |
| Idiomas soportados | no disponible (modelo de vision; sin capacidades linguisticas) |
| Licencia | AGPL-3.0 |
| Formato de pesos | ONNX (`weights.onnx`) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo. El unico dato tecnico es que se distribuye como grafo ONNX (`weights.onnx`) para deteccion de objetos, con cuatro clases de salida: `petrol pump`, `petrol hose`, `roof canopy` y `price board`. No se indica si deriva de una familia conocida (YOLO, RT-DETR, Faster R-CNN, etc.), ni la resolucion de entrada, ni el numero de parametros.

Tampoco se documentan los datos de entrenamiento: no hay informacion sobre numero de imagenes, composicion del dataset, tecnicas de aumento de datos, proceso de anotacion ni si hubo ajuste fino desde un modelo preentrenado. No consta el uso de RLHF, DPO ni tecnicas equivalentes, algo esperable en un detector visual. La unica innovacion operativa visible es el empaquetado: el autor incluye `miner.py` con una API `Miner(path).predict_batch(batch_images, offset, n_keypoints)` y un `chute_config.yml` que describe la imagen de servicio, lo que sugiere un flujo de despliegue contenedorizado con procesamiento por lotes y un parametro de keypoints.

## Capacidades

- Deteccion de objetos en imagenes para cuatro clases: surtidor de gasolina, manguera, marquesina y panel de precios.
- Inferencia por lotes mediante `predict_batch(batch_images, offset, n_keypoints)`.
- Salida con keypoints (el parametro `n_keypoints` en la API de inferencia sugiere puntos clave asociados a las detecciones, aunque no se detalla su semantica).
- Ejecucion via runtime ONNX, lo que permite desplegarlo en CPU o GPU sin depender de frameworks de entrenamiento.
- No soporta generacion de texto, razonamiento, codigo, matematicas, tool calling, agentes ni capacidades multilingues.
- No se documentan modos especiales (thinking, vision general, audio).

## Casos de uso

- Monitorizacion de estaciones de servicio: el modelo puede procesar imagenes de camaras fijas para verificar la presencia y ubicacion de surtidores, mangueras, marquesinas y paneles de precios, util para inventario visual automatizado.
- Control de cumplimiento de imagen corporativa: detectar si la marquesina y el panel de precios estan presentes y correctamente visibles en la toma, como parte de auditorias periodicas de franquicias.
- Deteccion de incidencias en mangueras: localizar mangueras en la imagen para un posterior analisis de estado (por ejemplo, mangueras caidas o mal recogidas) combinando la deteccion con un clasificador aguas abajo.
- Automatizacion de inventario de activos: inventariar surtidores y elementos de la estacion a partir de barridos fotograficos o video, reduciendo la revision manual.
- Analisis de imagenes de satelite o dron: identificar marquesinas y paneles de precios en imagenes aereas para estudios de cobertura o planificacion de red de estaciones.
- Preprocesado para OCR de precios: usar la deteccion de `price board` como etapa de localizacion antes de aplicar un OCR que lea los precios, mejorando la precision al recortar la region relevante.
- Despliegue en edge: al ser un ONNX ligero y con script de inferencia por lotes, puede ejecutarse en dispositivos con recursos limitados en la propia estacion, sin enviar imagenes a la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; al no conocerse el numero de parametros ni la resolucion de entrada, no puede estimarse con rigor. El tamano de repositorio indicado (0.0 GB) sugiere un modelo pequeno, probablemente inferior a unos cientos de MB.
- GPU recomendadas: no disponible. Por el formato ONNX, es compatible con cualquier GPU con soporte de ONNX Runtime (CUDA o TensorRT), pero no se especifican modelos concretos.
- Viabilidad en GPU de consumo: probablemente si, dado el empaquetado ONNX y el tamano reducido del repositorio, aunque no hay confirmacion del autor.
- Opciones de despliegue: ONNX Runtime (CPU/GPU), y potencialmente TensorRT u OpenVINO mediante conversion desde ONNX. El autor incluye `chute_config.yml` como configuracion de imagen de servicio, lo que apunta a un despliegue contenedorizado propio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se conocen modelos comparables en la informacion proporcionada, y el caracter especifico de las clases (entorno de estacion de servicio) dificulta una comparacion directa con detectores genericos.

## Limitaciones y advertencias

- Informacion publica muy escasa: sin datos de arquitectura, parametros, dataset ni metricas, es imposible evaluar su calidad de forma objetiva.
- Riesgo de sobreajuste al dominio: al estar entrenado (presumiblemente) solo con imagenes de estaciones de servicio, su rendimiento fuera de ese contexto es incierto.
- Sin validacion externa: cero descargas y cero likes; no hay evidencia de uso en produccion ni informes de terceros.
- Licencia AGPL-3.0: es una licencia copyleft fuerte. El uso comercial es posible, pero si se ofrece el modelo como servicio en red o se distribuye una obra derivada, puede exigirse la liberacion del codigo fuente bajo la misma licencia. Conviene revisarlo con asesoria legal antes de integrarlo en un producto propietario.
- Sin informacion sobre sesgos: no se documenta la distribucion del dataset de entrenamiento, por lo que pueden existir sesgos geograficos, de iluminacion o de tipo de estacion.
- Riesgo de falsos positivos y negativos: sin metricas (mAP, precision, recall) no puede acotarse el error en produccion.
- Sin soporte linguistico ni de texto: no es un modelo de lenguaje y no debe usarse para tareas conversacionales o de generacion.
- Semantica de `n_keypoints` no documentada: el uso de keypoints en la API de inferencia requiere inspeccionar `miner.py` para entender el formato de salida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kornitsovivan/petrol-ickmyk
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la informacion proporcionada.
