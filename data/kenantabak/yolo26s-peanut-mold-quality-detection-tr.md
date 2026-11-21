# kenantabak/yolo26s-peanut-mold-quality-detection-tr

## Resumen

`yolo26s-peanut-mold-quality-detection-tr` es un modelo de deteccion de objetos entrenado por Kenan Tabak sobre la plataforma EVREN (SSYZ) para inspeccion de calidad en la industria alimentaria. Detecta y clasifica cacahuetes (yer fıstığı) en dos clases: con moho (`with mold`) y sin moho (`without mold`), sobre imagenes de 640 × 640 px. El modelo se distribuye como pesos Ultralytics con arquitectura `yolo26s` (variante Small de YOLO26) y un tamano de fichero de 18,4 MB.

El caso de uso central es el control de calidad en banda de produccion y el descarte optico: separar grano sano de grano contaminado por hongos, un paso critico por el riesgo de aflatoxinas en la cadena alimentaria. El autor declara metricas muy altas en el conjunto de validacion (99,50 % mAP@50, 99,99 % de precision y 100 % de recall), si bien estas cifras no estan verificadas de forma independiente y el propio model-index registra un mAP@50-95 de 0,00 que contradice la tabla de la model card.

Es relevante ahora por dos motivos: por un lado, ejemplifica el patron de modelos de vision muy especializados (dos clases, un dominio concreto) que se entrenan en minutos sobre GPUs de datacenter y se despliegan en entornos industriales de bajo coste; por otro, ilustra la confusion habitual entre la licencia de los pesos (CC BY 4.0) y la del framework que los genera (Ultralytics AGPL-3.0), un punto que condiciona el uso comercial en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO26 Small (`yolo26s`, Ultralytics) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada 640 × 640 px) |
| Tipos de cuantizacion | no disponible (se distribuyen pesos PyTorch `best.pt`, ONNX `best.onnx` y TFLite `best.tflite`) |
| Idiomas soportados | tr, en (etiquetas y documentacion; el modelo no procesa texto) |
| Licencia | CC BY 4.0 (pesos); framework Ultralytics bajo AGPL-3.0 |
| Formato de pesos | PyTorch (`best.pt`), ONNX (`best.onnx`), TFLite (`best.tflite`) |

## Arquitectura y entrenamiento

Se trata de un detector de objetos de la familia YOLO, en concreto la variante Small de YOLO26 de Ultralytics, una arquitectura de deteccion en una sola etapa (one-stage) con backbone convolucional y cabeza de prediccion densa. El modelo trabaja sobre imagenes redimensionadas a 640 × 640 px y produce cajas delimitadoras con etiqueta de clase y puntuacion de confianza para las dos clases definidas (`with mold` y `without mold`).

El entrenamiento se realizo sobre el dataset propietario de EVREN `Yer Fıstığı Küf ve Kalite Kontrol Tespiti (2 Sınıf)` (version v1.0), con optimizador en modo `auto` (Cosine LR) y AMP activado, durante 50 epocas. El autor declara un coste de 0,049 GPU-horas sobre 1× NVIDIA H200 o A100, lo que indica un entrenamiento muy corto y un dataset de tamano reducido. No se documenta composicion del dataset, numero de imagenes, tecnicas de aumento de datos ni proceso de validacion cruzada. Tampoco hay informacion sobre destilacion, decodificacion especulativa ni innovaciones de atencion; es un fine-tuning estandar del framework Ultralytics.

## Capacidades

- Deteccion de objetos en imagenes RGB con dos clases: `with mold` (cacahuete con moho) y `without mold` (cacahuete sano).
- Salida de cajas delimitadoras con coordenadas, clase y confianza, apta para logica de descarte o conteo.
- Inferencia en tiempo real sobre imagenes individuales o flujos de video mediante la API de Ultralytics (`model.predict`).
- Exportacion a ONNX y TFLite, lo que permite despliegue en entornos edge y en dispositivos con aceleracion limitada.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generacion de texto.
- Capacidad multilingue limitada a etiquetas y documentacion en turco e ingles; el modelo no procesa lenguaje.
- No dispone de modo thinking, vision generativa, audio ni ninguna capacidad multimodal mas alla de la deteccion visual.

## Casos de uso

- Inspeccion en banda de produccion: el modelo se integra en una camara industrial sobre la cinta transportadora y evalua cada fotograma a 640 × 640 px, emitiendo cajas para que un actuador neumatico expulse el grano marcado como `with mold`. Su tamano de 18,4 MB y su exportacion a ONNX o TFLite facilitan el despliegue en PCs industriales sin GPU dedicada.
- Descarte optico en planta de envasado: combinado con un sistema de vision multiespectral o RGB de alta velocidad, el modelo filtra lotes antes del envasado y reduce el riesgo de aflatoxinas en producto final.
- Control de calidad en recepcion de materia prima: se ejecuta sobre fotos de muestras de cada lote entrante y se agrega el porcentaje de grano contaminado como criterio de aceptacion o rechazo del proveedor.
- Monitorizacion en almacen: camaras fijas sobre silos o palets permiten detectar proliferacion de moho durante el almacenamiento y disparar alertas tempranas.
- Investigacion agronomica: permite anotar automaticamente grandes volumenes de imagenes de ensayos de variedades de cacahuete y comparar la incidencia de moho entre tratamientos o condiciones de secado.
- Docencia y prototipado en vision artificial: al ser un fine-tuning de YOLO26 con dos clases y pesos ligeros, sirve como ejemplo reproducible de pipeline completo (dataset, entrenamiento, exportacion y despliegue) en cursos de vision por computador.
- Verificacion en laboratorio: como pre-filtro para priorizar muestras que un tecnico revisara manualmente, reduciendo el tiempo de inspeccion visual.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card y en el model-index. No verificados de forma independiente.

| Metrica | Valor declarado | Nota |
|---|---|---|
| mAP@50 (%) | 99,50 | Coincide en model-index y model card |
| mAP@50-95 (%) | 91,25 (model card) / 0,00 (model-index) | Discrepancia no resuelta entre ambas fuentes |
| Precision (%) | 99,99 | Solo en la model card |
| Recall (%) | 100,00 | Solo en la model card |
| F1 (%) | 100,00 | Coincide en model-index y model card |
| Mejor epoca | 50 / 50 | Entrenamiento completo sin early stopping |

Rendimiento por clase (validacion, segun el autor):

| Clase | AP@50 | Precision | Recall | F1 |
|---|---:|---:|---:|---:|
| `with mold` | 99,50 % | 99,99 % | 100,00 % | 99,99 % |
| `without mold` | 99,50 % | 100,00 % | 100,00 % | 100,00 % |

No se han publicado comparaciones con otros detectores (YOLOv8, YOLO11, Faster R-CNN, DETR) sobre el mismo dataset en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; por el tamano de pesos (18,4 MB) y la arquitectura Small de YOLO26, es previsible que quepa holgadamente en GPUs de consumo, aunque el dato no esta publicado.
- GPU recomendadas: el autor cita NVIDIA H200 o A100 para el entrenamiento (0,049 GPU-horas). Para inferencia no se especifica hardware.
- GPU de consumo: muy probablemente compatible con RTX 3060, RTX 4060, RTX 4090 y similares, asi como con inferencia en CPU, dado el reducido tamano del modelo. Dato no confirmado por el autor.
- Opciones de despliegue: Ultralytics (PyTorch `best.pt`), ONNX Runtime (`best.onnx`), TensorFlow Lite (`best.tflite`). No se documenta soporte explicito para vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de vision de este tipo.
- Latencia y throughput: no disponibles. No se publican FPS ni tiempos de inferencia por imagen.

## Comparativa con modelos similares

No se dispone de comparaciones publicadas por el autor con otros detectores sobre el mismo dataset. Como referencia categorica (misma tarea, deteccion de objetos en una etapa), se pueden considerar las siguientes alternativas genericas, sin datos de rendimiento especificos para este dominio:

| Modelo | Parametros | Contexto / entrada | Rendimiento en este dataset | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `yolo26s-peanut-mold-quality-detection-tr` | no disponible | 640 × 640 px | 99,50 % mAP@50 (declarado) | CC BY 4.0 (pesos) / AGPL-3.0 (framework) | Hugging Face |
| YOLO11s (Ultralytics) | no disponible | 640 × 640 px | no evaluado | AGPL-3.0 | Ultralytics / Hugging Face |
| YOLOv8s (Ultralytics) | no disponible | 640 × 640 px | no evaluado | AGPL-3.0 | Ultralytics / Hugging Face |
| Faster R-CNN ResNet-50 (torchvision) | no disponible | variable | no evaluado | BSD-3-Clause | torchvision |

La comparativa real solo puede establecerse entrenando cada alternativa sobre el mismo dataset de EVREN, algo que no se ha publicado.

## Limitaciones y advertencias

- Metricas no verificadas: los valores de la model card (99,99 % de precision, 100 % de recall) proceden unicamente del autor y no se han reproducido de forma independiente. El model-index registra un mAP@50-95 de 0,00, en contradiccion con el 91,25 % de la model card, lo que obliga a tratar las cifras con cautela.
- Dataset no publico: el conjunto de entrenamiento reside en la plataforma EVREN y no se documenta su tamano, composicion ni procedimiento de anotacion, lo que impide evaluar la representatividad y el riesgo de sobreajuste.
- Entrenamiento muy corto (0,049 GPU-horas, 50 epocas) y mejor epoca en la ultima: sugiere que el modelo podria no haber convergido plenamente o que el dataset es muy sencillo; no hay validacion cruzada ni conjunto de test independiente.
- Dominio muy estrecho: solo detecta dos clases de cacahuete en condiciones de iluminacion y camara presumiblemente controladas. No es un detector generico y probablemente fallara en otras semillas, otros frutos o imagenes de campo sin preprocesado.
- Riesgo de falsos negativos en produccion: aunque el recall declarado es del 100 %, en un contexto alimentario un solo falso negativo (grano con moho no detectado) puede tener consecuencias sanitarias y regulatorias; se recomienda umbral de confianza conservador y validacion con muestras reales.
- Sesgos desconocidos: no se documenta la distribucion de variedades de cacahuete, origenes, condiciones de iluminacion ni tipos de moho del dataset, por lo que se desconoce el sesgo del modelo.
- Licencia dual a tener en cuenta: los pesos se publican bajo CC BY 4.0, pero el framework Ultralytics es AGPL-3.0. El uso comercial de pesos derivados de Ultralytics puede quedar sujeto a las condiciones de la AGPL o requerir licencia comercial de Ultralytics; conviene revisarlo con asesoria legal antes de desplegar en produccion.
- Sin soporte de texto, agentes ni razonamiento: no es un modelo de lenguaje y no debe evaluarse con los criterios de un LLM.
- Fecha de creacion futura (2026-11-21) en los metadatos de Hugging Face: conviene verificar la integridad y procedencia del repositorio antes de confiar en el.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso en produccion ni de validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kenantabak/yolo26s-peanut-mold-quality-detection-tr
- Pagina del modelo en EVREN: https://evren.ssyz.org.tr/models/u19979974710e/yer-fistigi-kuf-ve-kalite
- Dataset de entrenamiento en EVREN: https://evren.ssyz.org.tr/datasets/u19979974710e/yer-fistigi-kuf-ve-kalite-kontrol-tespiti-2-sinif
- Perfil del autor en EVREN: https://evren.ssyz.org.tr/profile/u19979974710e
- Catalogo de datasets de vision por computador en turco: https://huggingface.co/datasets/kenantabak/evren-turkish-computer-vision-316-datasets
- Framework Ultralytics (YOLO): https://github.com/ultralytics/ultralytics
- Documentacion de Ultralytics: https://docs.ultralytics.com
