# kenantabak/yolo26s-uav-aerial-vehicle-detection-tr

## Resumen

`yolo26s-uav-aerial-vehicle-detection-tr` es un modelo de detección de objetos basado en la arquitectura YOLO26S de Ultralytics, publicado por Kenan Tabak en la plataforma EVREN (SSYZ). Está especializado en la detección de dos clases —`Car` y `Truck`— sobre imágenes aéreas y de dron (UAV) en vista cenital, un dominio donde los objetos son pequeños, densos y aparecen con orientaciones arbitrarias. El modelo se distribuye como pesos PyTorch (`.pt`) de 19,4 MB y se carga mediante la librería `ultralytics`.

El modelo se entrenó durante 60 épocas a resolución 640×640 sobre un conjunto de 1.403 imágenes con 6.639 cajas delimitadoras, con aumentación adaptada a la vista aérea (volteos horizontal y vertical, rotaciones de hasta 15 grados y desactivación del `erasing` para no destruir objetos pequeños). Alcanza un mAP@50 del 82,21 % y un mAP@50-95 del 49,89 % según los datos declarados por el autor, con un rendimiento notablemente superior en la clase `Car` (mAP@50 del 90,98 %) que en `Truck` (73,51 %).

Su relevancia práctica es acotada pero clara: es un detector ligero y desplegable en hardware modesto para tareas de conteo de tráfico aéreo, vigilancia de intersecciones y monitorización de flotas de vehículos pesados desde dron. No es un modelo de propósito general ni un modelo de lenguaje, sino un checkpoint de visión por computador de dominio específico, con licencia CC BY 4.0 sobre los pesos y AGPL-3.0 heredada del framework Ultralytics.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO26S (Ultralytics, familia YOLO, detector de una etapa) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de imagen 640×640) |
| Tipos de cuantizacion | no disponible (se distribuyen pesos `.pt` en precisión completa; cuantización a INT8/FP16 posible vía exportación de Ultralytics, no documentada por el autor) |
| Idiomas soportados | tr, en (etiquetas de clase y documentación; el modelo no procesa texto) |
| Licencia | CC BY 4.0 para los pesos; AGPL-3.0 para el framework Ultralytics |
| Formato de pesos | PyTorch `.pt` (19,4 MB) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura YOLO26S de Ultralytics, un detector de objetos de una sola etapa basado en redes convolucionales con un backbone de extracción de características y una cabeza de detección que predice cajas y clases directamente. La resolución de entrada es de 640×640 píxeles. No se dispone de información detallada sobre el número de parámetros, la composición exacta del backbone ni innovaciones internas específicas de la variante `s` (small) en la información proporcionada.

El entrenamiento se realizó durante 60 épocas sobre el conjunto `Hava Görüntüsünden Araç Tespiti (2 Sınıf)` (clasificado como Grade A, 100/100 en la plataforma EVREN), compuesto por 1.403 imágenes y 6.639 cajas delimitadoras. La aumentación incluyó `fliplr=0.5`, `flipud=0.5`, `degrees=15.0` y `erasing=0.0`, una configuración pensada para preservar objetos pequeños en vista cenital. El coste de entrenamiento reportado es de 0,99 CR (0,099 h). No se documenta uso de RLHF, DPO ni técnicas de alineación, algo esperable en un detector de objetos. Tampoco se detalla la composición del dataset más allá del recuento de imágenes y cajas.

## Capacidades

- Detección de objetos en imágenes aéreas y de dron en vista cenital, limitada a dos clases: `Car` y `Truck`.
- Localización de cajas delimitadoras con puntuaciones de confianza por clase.
- Robustez a rotaciones y volteos gracias a la aumentación de entrenamiento (`fliplr`, `flipud`, `degrees=15`).
- Conservación de objetos pequeños en escenas densas (configuración `erasing=0.0`).
- Inferencia mediante la API de Ultralytics (`YOLO(...).predict(...)`) con parámetros ajustables de confianza (`conf`), IoU (`iou`) y tamaño de imagen (`imgsz`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni procesamiento de lenguaje natural.
- No dispone de modo de razonamiento (thinking), visión general, audio ni capacidades multimodales más allá de la imagen de entrada.

## Casos de uso

- **Conteo de tráfico desde dron:** el modelo permite contar vehículos en imágenes capturadas por UAV en vuelo cenital, diferenciando entre turismos y camiones. Su resolución de 640×640 y su ligereza (19,4 MB) facilitan la ejecución a bordo o en estaciones base con hardware modesto.
- **Vigilancia de intersecciones y cruces:** con un mAP@50 del 90,98 % en la clase `Car`, es adecuado para monitorizar la ocupación de intersecciones y detectar acumulación de vehículos en tiempo casi real sobre imágenes aéreas.
- **Monitorización de flotas de vehículos pesados:** la clase `Truck` permite inventariar y localizar camiones en zonas industriales, aparcamientos o rutas logísticas vistas desde el aire, aunque con menor fiabilidad que la clase `Car` (mAP@50 del 73,51 %).
- **Análisis de aparcamientos y estacionamientos:** detección de plazas ocupadas por turismos o camiones en imágenes cenitales de parking, útil para sistemas de gestión de ocupación.
- **Auditoría de imágenes satelitales o de dron en pipelines de datos:** integración en procesos batch que necesitan etiquetar automáticamente grandes volúmenes de imágenes aéreas con cajas de vehículos, aprovechando la API de Ultralytics.
- **Prototipado rápido en investigación UAV:** al ser un checkpoint pequeño y con licencia permisiva sobre los pesos, sirve como línea base para experimentos de detección de vehículos en vista aérea antes de escalar a modelos mayores o datasets propios.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente, `verified: false`). Dataset: `Hava Görüntüsünden Araç Tespiti (2 Sınıf)` (tipo `evren-grade-a`).

| Metrica | Valor |
|---|---|
| mAP@50 (%) | 82,21 |
| mAP@50-95 (%) | 49,89 |
| F1 Score (%) | 75,55 |
| Precision (%) | 76,89 |
| Recall (%) | 77,11 |
| Mejor epoca / coste | 60/60 · 0,99 CR (0,099 h) |

Desglose por clase:

| Clase | mAP@50 (%) | Precision (%) | Recall (%) | F1 (%) |
|---|---|---|---|---|
| `Car` | 90,98 | 95,20 | 75,25 | 84,06 |
| `Truck` | 73,51 | 59,04 | 77,57 | 67,05 |

No se han publicado en la información disponible resultados comparativos con otros modelos sobre el mismo dataset.

## Requisitos de hardware

- **VRAM estimada para inferencia:** no disponible de forma explícita. Para un modelo de 19,4 MB en FP32, la huella de memoria es muy reducida (del orden de cientos de MB incluyendo activaciones a 640×640), pero el autor no publica cifras.
- **GPU recomendadas:** cualquier GPU con soporte CUDA es suficiente; el tamaño del modelo no exige aceleradores de gama alta. GPU de datacenter como A100 o H100 no son necesarias para este checkpoint.
- **Compatibilidad con GPU de consumo:** sí, cabe holgadamente en cualquier GPU de consumo moderna (por ejemplo, RTX 4090, RTX 3060 o similares) e incluso en CPU para inferencia por lotes pequeños.
- **Opciones de despliegue:** la vía documentada es la librería `ultralytics` en Python. No se documentan exportaciones a ONNX, TensorRT, OpenVINO ni integraciones con vLLM, llama.cpp, Ollama o TGI (estas últimas no aplican a un detector de objetos).
- **Latencia y throughput:** no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone en la información proporcionada de resultados de benchmarks de modelos comparables sobre el mismo dataset, por lo que no es posible establecer una comparación cuantitativa fiable. Cualitativamente, el modelo se sitúa en la categoría de detectores YOLO de tamaño `s` (small) especializados en vista aérea, frente a alternativas genéricas como YOLOv8/YOLO11 preentrenados en COCO (que incluyen clases `car` y `truck` pero no están optimizados para vista cenital) o detectores específicos de UAV. No se aportan datos de parámetros, contexto ni rendimiento de estas alternativas en la información disponible.

| Modelo | Parametros | Contexto/entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `yolo26s-uav-aerial-vehicle-detection-tr` | no disponible | 640×640 | mAP@50 82,21 % (dataset propio) | CC BY 4.0 (pesos) / AGPL-3.0 (framework) | Hugging Face |
| YOLOv8/YOLO11 preentrenados COCO | no disponible | 640×640 | no comparable (otro dataset) | AGPL-3.0 | Ultralytics |
| Detectores UAV especializados | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- **Dominio muy restringido:** solo detecta dos clases (`Car` y `Truck`); no reconoce peatones, motocicletas, autobuses ni otros vehículos.
- **Sesgo hacia la clase `Car`:** el rendimiento en `Truck` es notablemente inferior (mAP@50 del 73,51 % frente al 90,98 % en `Car`), con una precisión del 59,04 % que implica una tasa apreciable de falsos positivos en esa clase.
- **Dataset pequeño:** 1.403 imágenes y 6.639 cajas es un volumen reducido, lo que limita la generalización a condiciones de iluminación, altitud, sensor o geografía distintas de las del conjunto de entrenamiento.
- **Riesgo de alucinación:** como todo detector, puede generar falsos positivos en escenas con objetos similares a vehículos (contenedores, sombras, estructuras) o en imágenes de baja resolución.
- **Métricas no verificadas:** los resultados de la model card están marcados como `verified: false`; no han sido validados de forma independiente.
- **Licencia:** los pesos se distribuyen bajo CC BY 4.0 (requiere atribución), pero el framework Ultralytics es AGPL-3.0, lo que impone obligaciones de copyleft sobre el código que lo integra en determinados escenarios de uso comercial o SaaS. Es necesario revisar la compatibilidad antes de un despliegue en producción.
- **Sin información sobre cuantización ni exportación:** no se documentan formatos optimizados (ONNX, TensorRT) ni cifras de latencia, lo que dificulta planificar un despliegue de alto throughput.
- **Idiomas:** las etiquetas y la documentación están en turco e inglés; el modelo no procesa texto.

## Enlaces

- Hugging Face: https://huggingface.co/kenantabak/yolo26s-uav-aerial-vehicle-detection-tr
- Página del modelo en EVREN: https://evren.ssyz.org.tr/models/u19979974710e/hava-ve-iha-goruntulerinden-otomobil-ve-kamyon-tespiti-2-sinif
- Dataset de entrenamiento en EVREN: https://evren.ssyz.org.tr/datasets/u19979974710e/hava-goruntusunden-arac-tespiti-2-sinif
- Perfil del autor en EVREN: https://evren.ssyz.org.tr/profile/u19979974710e
- Catálogo de datasets de visión por computador en HF: https://huggingface.co/datasets/kenantabak/evren-turkish-computer-vision-316-datasets
