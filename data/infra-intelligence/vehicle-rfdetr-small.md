# infra-intelligence/vehicle-rfdetr-small

## Resumen

Vehicle RF-DETR Small es un modelo de detección de objetos especializado en vehículos circulando por carreteras japonesas, publicado por infra-intelligence (モデルラボ / インフラインテリジェンス). Parte de los pesos públicos de RF-DETR Small preentrenados en COCO (Apache-2.0, proyecto de Roboflow) y los reentrena para una taxonomía de 9 clases orientada a los estudios de aforo de tráfico que se realizan en Japón: turismo, furgoneta, kei truck, camión ligero, camión medio/pesado, tráiler, autobús, motocicleta y vehículo especial. El objetivo no es solo localizar vehículos, sino clasificarlos por aspecto para poder agregar los recuentos a las categorías oficiales de los censos de tráfico (4 y 2 divisiones).

El modelo resuelve un problema muy concreto de ingeniería civil y planificación viaria: contar vehículos por tipo a partir de imágenes de carretera o de cámaras fijas. Para ello el repositorio no incluye solo los pesos, sino también el código de recuento (`counting/`) con dos modos: conteo por línea de cruce con dirección, y conteo por puertas (gates) en intersecciones con flujos de entrada, salida y matriz origen-destino, apoyándose en los trackers ByteTrack y OC-SORT de Roboflow.

Es relevante ahora por tres motivos: es un modelo pequeño con artefacto ONNX de 512×512 píxeles listo para producción, el autor documenta la evaluación en un conjunto de test de una región distinta a la de entrenamiento (no solo validación), y la licencia Apache-2.0 con atribución de datos está resuelta de forma explícita en `NOTICE` y `ATTRIBUTION.csv`. El repositorio completo ocupa 0,2 GB.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de detección (RF-DETR Small, familia DETR de Roboflow), con cabecera de consultas que emite detecciones en una sola pasada |
| Parametros totales | no disponible en la información proporcionada |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; entrada de imagen 512×512 RGB, tamaño fijo |
| Tipos de cuantizacion | no disponible; se distribuye en fp32 (PyTorch `.pth` y ONNX) |
| Idiomas soportados | ja, en (etiquetas de metadatos; el modelo no procesa texto) |
| Licencia | apache-2.0 (pesos y código); datos de entrenamiento CC BY-SA 4.0 con atribución obligatoria vía `NOTICE` y `ATTRIBUTION.csv` |
| Formato de pesos | `.pth` (PyTorch, cargable con rfdetr 1.11.2 y `torch.load(weights_only=True)`) y `.onnx` (opset 17, entrada 512×512 fija) |
| Entrada | tensor `image` de `[1, 3, 512, 512]`, RGB, float32 en rango 0–255; reescalado a cuadrado sin preservar relación de aspecto (`cv2.INTER_LINEAR`); normalización interna |
| Salida | `dets6` de `[1, 300, 6]`; cada fila `[x1, y1, x2, y2, score, class_id]` con coordenadas normalizadas 0–1 |
| Umbral recomendado | 0,45 |
| Clases | 9: `car`, `van`, `kei_truck`, `small_truck`, `large_truck`, `trailer`, `bus`, `motorcycle`, `special_vehicle` |
| NMS | No necesaria en la salida ONNX (una clase por consulta); en la ruta PyTorch `predict` puede duplicar cajas, se recomienda NMS agnóstica de clase con umbral 0,7 |
| Tamaño del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

La base es RF-DETR Small, un detector de la familia DETR (transformers de detección con consultas aprendidas) publicado por Roboflow con pesos preentrenados en COCO bajo Apache-2.0. La model card no detalla el backbone, el número de parámetros ni la configuración interna del transformer; esa información no está disponible en la documentación proporcionada. El ajuste realizado por infra-intelligence fija la entrada en 512×512 y la salida en 300 consultas con 6 valores por consulta, emitiendo una única clase por caja, lo que elimina la necesidad de NMS en la ruta ONNX.

El entrenamiento se hizo sobre imágenes de vía pública japonesas publicadas en Mapillary (CC BY-SA 4.0), con el conjunto de validación separado por bloques geográficos de 200 m × 200 m para evitar fuga de información entre imágenes cercanas: 468 imágenes y 1.488 cajas para validación, y 429 imágenes y 1.369 cajas para test, este último de una región distinta no usada ni en entrenamiento ni en validación y evaluado una sola vez con el umbral fijado previamente (0,45). No se documentan en la información disponible el número de tokens, la composición detallada del dataset, ni si hubo RLHF/DPO (no aplicable en detección) u otras técnicas de alineación. La innovación destacable es de producto más que de arquitectura: la taxonomía de 9 clases está diseñada para mapearse a las divisiones oficiales de los censos de tráfico japoneses, y el repositorio incluye la lógica de agregación, no solo el detector.

## Capacidades

- Detección de vehículos en imágenes RGB de 512×512 con 9 clases orientadas al tráfico rodado japonés.
- Distinción por aspecto entre turismo, furgoneta, kei truck, camión ligero (hasta 2 t), camión medio/pesado (4 t en adelante), tráiler, autobús, motocicleta y vehículo especial (maquinaria de obra, carretillas, quitanieves, tractor agrícola, vehículos de obra viaria).
- Detección tanto de vehículos en movimiento como estacionados.
- Recuento sobre vídeo: script `counting/count.py` con modo de línea de cruce (conteo por sentido) y modo de puertas en intersección (entrada, salida y matriz origen-destino por ramal).
- Seguimiento multiobjeto integrado mediante los trackers de Roboflow (ByteTrack, OC-SORT).
- Agregación automática de las 9 clases a las divisiones de 4 categorías y 2 categorías de los censos de tráfico, documentada en `config.json`.
- Ejecución en CPU y en GPU, con ejemplo de inferencia ONNX (`examples/predict_onnx.py`) y ruta PyTorch nativa vía `rfdetr`.
- No soporta tool calling, agentes, razonamiento multi-paso ni procesamiento de lenguaje: es exclusivamente un detector visual.

## Casos de uso

- Aforo de tráfico automatizado: desplegar el modelo sobre grabaciones de una cámara fija y usar `count.py --line` para contar vehículos que cruzan una línea, obteniendo totales por sentido y por tipo, con la ventaja de que el umbral 0,45 ofrece una precisión del 84,3 % y una exhaustividad del 75,2 % en el conjunto de test.
- Estudios de capacidad en intersecciones: con `--gates gates.json` se obtienen flujos de entrada y salida por ramal y la matriz origen-destino, útil para calibrar modelos de simulación de tráfico o revisar tiempos semafóricos.
- Planificación urbana y seguridad viaria: series temporales de composición del tráfico (proporción de camiones pesados, motocicletas, vehículos especiales) para decidir actuaciones sobre firme, señalización o carriles.
- Despliegue en borde: al distribuirse como ONNX de 512×512 y ocupar el repositorio completo 0,2 GB, puede ejecutarse en dispositivos con pocos recursos o en CPU, lo que permite procesar cámaras sin enviar vídeo a la nube.
- Análisis posterior de imágenes de Mapillary u otros levantamientos: inferencia por lotes sobre imágenes de vía pública para etiquetar y cuantificar el parque móvil de una zona.
- Monitorización de accesos a recintos industriales o logísticos: conteo de camiones ligeros frente a pesados y tráilers para dimensionar dársenas, turnos de carga o tiempos de espera.
- Detección de vehículos especiales en obra viaria: alertas cuando aparece maquinaria o vehículo de señalización en una zona monitorizada, gracias a la clase `special_vehicle`.

## Benchmarks y rendimiento

Validación (468 imágenes, 1.488 cajas, separación geográfica por bloques de 200 m; usada para fijar el umbral y elegir pesos):

| Métrica | Valor |
|---|---:|
| AP50 | 0,750 |
| AP50:95 | 0,612 |
| AP50:95 en objetos pequeños (menos de 32 px de lado) | 0,218 |
| Precisión (umbral 0,45) | 0,803 |
| Exhaustividad (umbral 0,45) | 0,749 (1.114/1.488) |
| F1 (umbral 0,45) | 0,775 |
| Precisión agnóstica de clase | 0,900 |
| Exhaustividad agnóstica de clase | 0,839 (1.248/1.488) |

Desglose por clase en validación (exhaustividad con umbral 0,45 y clase correcta):

| Clase | Cajas | AP50 | AP50:95 | Exhaustividad (clase correcta) | Exhaustividad (agnóstica) |
|---|---:|---:|---:|---:|---:|
| `car` | 818 | 0,881 | 0,710 | 0,819 | 0,847 |
| `van` | 176 | 0,713 | 0,626 | 0,591 | 0,875 |
| `kei_truck` | 37 | 0,733 | 0,608 | 0,649 | 0,811 |
| `small_truck` | 113 | 0,651 | 0,529 | 0,637 | 0,832 |
| `large_truck` | 182 | 0,741 | 0,584 | 0,714 | 0,802 |
| `trailer` | 36 | 0,643 | 0,556 | 0,500 | 0,778 |
| `bus` | 42 | 0,888 | 0,753 | 0,810 | 0,905 |
| `motorcycle` | 72 | 0,823 | 0,559 | 0,736 | 0,764 |
| `special_vehicle` | 12 | 0,679 | 0,579 | 0,750 | 0,833 |

Test (429 imágenes, 1.369 cajas, región no vista, evaluado una sola vez con umbral 0,45):

| Métrica | Valor |
|---|---:|
| AP50 | 0,642 |
| AP50:95 | 0,523 |
| AP50:95 en objetos pequeños (menos de 32 px de lado) | 0,134 |
| Precisión (umbral 0,45) | 0,843 |
| Exhaustividad (umbral 0,45) | 0,752 (1.029/1.369) |
| F1 (umbral 0,45) | 0,795 |
| Precisión agnóstica de clase | 0,920 |
| Exhaustividad agnóstica de clase | 0,820 (1.122/1.369) |

El desglose por clase del conjunto de test aparece truncado en la información disponible y no se reproduce. El autor documenta además una reproducción en CPU del artefacto publicado: AP50 de 0,750 (precisión 0,803, exhaustividad 0,749) con la ruta PyTorch y AP50 de 0,695 (precisión 0,805, exhaustividad 0,739) al evaluar la salida ONNX `dets6` como cajas de clase única (`eval/valid_reproduced.json`). No se han publicado comparaciones con otros detectores en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia de tamaño, el repositorio completo (`.pth` + `.onnx`) ocupa 0,2 GB, de modo que cada formato ronda los 0,1 GB en fp32; el autor ejecutó la validación completa en CPU, lo que indica que la inferencia no requiere GPU.
- GPU recomendadas: no disponibles en la documentación. Por el tamaño del artefacto, cualquier GPU consumer reciente es suficiente; no se han publicado mediciones de latencia ni de throughput por GPU.
- ¿Cabe en GPU consumer? Sí, según el tamaño del artefacto; no se especifican modelos concretos (RTX 3060, RTX 4090, etc.) ni cifras de rendimiento.
- Opciones de despliegue: ONNX Runtime (ejemplo incluido `examples/predict_onnx.py`), PyTorch con la librería `rfdetr` 1.11.2, y el pipeline de recuento con `trackers`, `supervision` y OpenCV. No se documenta soporte de vLLM, TGI, llama.cpp ni Ollama (no aplicables a un detector).
- Latencia y throughput: no disponibles. El cuello de botella práctico en el caso de uso de recuento es el tracker y la decodificación de vídeo, no el detector.
- Dependencias mínimas para ONNX: `onnxruntime`, `numpy`, `opencv-python`; para recuento en vídeo, además `rfdetr`, `trackers` y `supervision`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Clases | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| vehicle-rfdetr-small (este modelo) | no disponible | imagen 512×512 fija | 9 clases de tráfico japonés | AP50 0,750 (valid), 0,642 (test) | Apache-2.0 + atribución CC BY-SA 4.0 de los datos | HuggingFace, `.pth` y `.onnx` |
| RF-DETR Small (COCO, modelo base) | no disponible | imagen (resolución no indicada en la información) | 80 clases COCO genéricas | no disponible en la información proporcionada | Apache-2.0 | GitHub de Roboflow |
| Detectores genéricos tipo YOLO u otros DETR | no disponible | no disponible | clases COCO, sin taxonomía de tráfico japonés | no disponible en la información proporcionada | no disponible | no disponible |

No se han proporcionado datos verificables de alternativas comparables (parámetros, contexto, métricas o licencia), por lo que la comparación cuantitativa con otros detectores se marca como no disponible. La diferencia funcional frente al RF-DETR Small original es la taxonomía: 9 clases alineadas con los censos de tráfico japoneses frente a las 80 clases genéricas de COCO.

## Limitaciones y advertencias

- El modelo no lee matrículas: la división oficial de los censos de tráfico se determina por placa, así que los recuentos por categoría son estimaciones basadas en la forma del vehículo, tal como advierte el propio autor.
- Frontera difusa entre `van` y turismo: las furgonetas de turismo (wagon) y los light van con forma de ranchera caen en `car`, lo que sobreestima el turismo y subestima el vehículo comercial ligero. Los camiones de 2 t de carrocería ancha pueden estar registrados como transporte pesado.
- Exhaustividad baja en clases minoritarias del conjunto de validación: `trailer` 0,500 y `van` 0,591 con clase correcta, frente a 0,819 de `car`; la clase `special_vehicle` solo tiene 12 cajas en validación, muestra insuficiente para conclusiones firmes.
- Objetos pequeños: AP50:95 de 0,218 en validación y 0,134 en test para vehículos de menos de 32 px de lado. Vehículos lejanos en cámaras elevadas son el punto débil del modelo.
- Caída de rendimiento fuera de dominio: AP50 baja de 0,750 en validación a 0,642 en test (región distinta), y la exhaustividad agnóstica de 0,839 a 0,820. En ubicaciones con geomología, iluminación o tipo de vía distintos a los de Mapillary hay que esperar degradación adicional y recalibrar el umbral.
- Sesgo geográfico y de dominio: el entrenamiento usa exclusivamente imágenes de vía pública japonesa de Mapillary (CC BY-SA 4.0). El comportamiento en otros países o en flotas con parque móvil distinto no está evaluado.
- Distorsión geométrica por el preprocesado: la imagen se estira a un cuadrado 512×512 sin preservar la relación de aspecto, lo que deforma objetos alargados; es un parámetro fijo del artefacto ONNX.
- Duplicados en la ruta PyTorch: `predict` puede devolver la misma caja con dos clases; para contar hay que aplicar NMS agnóstica de clase (`with_nms(threshold=0.7, class_agnostic=True)`). El ONNX ya emite una sola clase por consulta.
- Falsos positivos por reflejos y rotulación: el autor indica que no detecta coches pintados en anuncios o rotulados, ni reflejados en espejos de curva o cristales, pero no cuantifica la tasa de error en esos escenarios.
- Clases no soportadas: bicicletas, sillas de ruedas y carritos de bebé quedan fuera por diseño; no debe usarse para aforo de movilidad peatonal o ciclista.
- Licencia: pesos y código son Apache-2.0, pero los datos de entrenamiento son CC BY-SA 4.0 y el autor exige atribución mediante `NOTICE` y `ATTRIBUTION.csv`. Antes de un uso comercial conviene revisar las implicaciones de la cláusula share-alike sobre el dataset y conservar los ficheros de atribución en la redistribución.
- Madurez: el repositorio no registra descargas ni "likes" en el momento de la consulta, y el desglose de métricas por clase en test está incompleto en la model card; conviene validar localmente antes de integrarlo en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/infra-intelligence/vehicle-rfdetr-small
- Repositorio de RF-DETR (modelo base, Roboflow): https://github.com/roboflow/rf-detr
- Referencia arXiv indicada en los metadatos del modelo: arxiv:2511.09554 (título y contenido no disponibles en la información proporcionada)
- Documento de referencia sobre las divisiones del censo de tráfico (Prefectura de Fukui, 平成22年度道路交通センサスの解説): https://www.pref.fukui.lg.jp/doc/douken/census/h22census_d/fil/001.pdf
- La búsqueda web realizada no devolvió enlaces relevantes sobre el modelo; los resultados obtenidos eran definiciones de diccionario del prefijo «infra» y no se han incluido.
