# apexlabs-hq/sn44-petrol-v5

## Resumen

`apexlabs-hq/sn44-petrol-v5` es un detector de objetos en formato ONNX publicado por el usuario apexlabs-hq. No es un modelo de lenguaje: es un detector visual de extremo a extremo (end-to-end) pensado para localizar cuatro elementos propios de una estación de servicio: surtidores de combustible (petrol pump), mangueras (petrol hose), marquesina o cubierta (roof canopy) y panel de precios (price board). El modelo se sirve mediante un script llamado `miner.py` usando onnxruntime, según indica la model card.

El repositorio tiene un tamaño de 0.0 GB y cero descargas y cero likes en el momento de la consulta, lo que ungiere que los pesos no están efectivamente alojados en el repo o que se trata de un artefacto de despliegue interno más que de una publicación abierta para la comunidad. La model card no declara arquitectura base, número de parámetros, licencia, idiomas ni pipeline, y tampoco se ha publicado ningún resultado de benchmarks.

Su relevancia es, por tanto, acotada: resulta útil como referencia de configuración de inferencia (resolución de entrada de 736 píxeles, umbrales de confianza por clase, supresión de duplicados entre clases con IoU 0.9 y un margen de rescate por clase) y como ejemplo de detector ONNX de dominio muy específico integrado en un pipeline tipo subred (el prefijo "sn44" del identificador sugiere la subred 44 de Bittensor, extremo no confirmado por el autor).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Detector de objetos ONNX de extremo a extremo (familia no especificada; no disponible) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje); resolución de entrada: imgsz 736 |
| Tipos de cuantizacion | no disponible (solo se publica el grafo ONNX; no se listan variantes cuantizadas) |
| Idiomas soportados | no disponible (las clases están etiquetadas en inglés) |
| Licencia | no disponible |
| Formato de pesos | ONNX (sha256 `9b1adb805e88b6bcc8021bb0efa4fc3fc3fa590b7ef461373128690ee8dcd680`) |

Parámetros de inferencia declarados por el autor:

| Parametro | Valor |
|---|---|
| Clases | petrol pump (0), petrol hose (1), roof canopy (2), price board (3) |
| Umbral de confianza global | 0.12 |
| Umbrales por clase | {0: 0.25, 1: 0.20, 2: 0.25, 3: 0.25} |
| Supresión de duplicados entre clases (IoU) | 0.90 |
| Margen de rescate por debajo del umbral | {0: 0.02, 1: 0.02, 2: 0.02, 3: 0.02} |
| Runtime | onnxruntime, servido por `miner.py` |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna. La model card únicamente describe el artefacto como un "ONNX end-to-end detector", es decir, un grafo que recibe la imagen y devuelve las detecciones ya post-procesadas (sin necesidad de NMS externo en el pipeline del usuario, dado que el autor especifica una supresión de duplicados entre clases con IoU 0.9 gestionada en el propio flujo de inferencia). El nombre del modelo lo presenta como "Detector for `manak0/Detect-petrol-station-1-0`", lo que indica que se trata de una conversión o destilación de un detector previo de otro autor, no de un entrenamiento desde cero descrito públicamente.

No se han publicado datos sobre volumen de entrenamiento, composición del dataset, resolución nativa de las anotaciones, técnicas de aumento de datos ni si hubo ajuste fino supervisado adicional. Tampoco se documenta ninguna innovación técnica más allá de los parámetros de post-proceso (umbrales por clase y margen de rescate, una estrategia habitual para recuperar detecciones de clases con pocas instancias o baja confianza). Cualquier afirmación sobre la arquitectura base (por ejemplo, YOLO, RT-DETR o similar) sería especulativa y no se incluye aquí.

## Capacidades

- Detección de objetos en imágenes dentro de un dominio cerrado de cuatro clases: surtidor de combustible, manguera, marquesina y panel de precios.
- Inferencia de extremo a extremo en ONNX Runtime, sin dependencias de frameworks de deep learning pesados.
- Post-proceso configurable por clase: umbrales independientes (0.25, 0.20, 0.25, 0.25) y margen de rescate de 0.02 por debajo del umbral.
- Supresión de duplicados entre clases con IoU 0.9, pensada para evitar que un mismo objeto se etiquete simultáneamente como surtidor y como manguera, por ejemplo.
- Resolución de entrada fija de 736 píxeles (imgsz 736), adecuada para objetos medianos y pequeños en imágenes de escenas urbanas.
- No soporta tool calling, agentes, generación de texto, razonamiento multi-paso, visión descriptiva (VQA), audio ni capacidades multilingües. Es exclusivamente un detector.
- No se documenta soporte de batch, dynamic shapes ni entrada de vídeo; no disponible.

## Casos de uso

- Inventario de estaciones de servicio a partir de imágenes de Street View o cartografía colaborativa: el detector localiza marquesinas y surtidores para verificar la existencia y la posición de una estación antes de darla de alta en una base de datos geoespacial.
- Extracción de paneles de precios para monitorización de competencia: la clase "price board" permite recortar la región del panel y enviarla a un OCR posterior que lea los precios de carburante.
- Auditoría de señalización y cobertura: la clase "roof canopy" sirve para comprobar si una estación cuenta con cubierta, dato relevante en estudios de infraestructura energética o de imagen de marca.
- Detección de mangueras y surtidores para control de calidad visual en inspecciones: un pipeline que procese fotos enviadas por operarios puede marcar automáticamente los elementos y priorizar la revisión humana.
- Preprocesado para anonimización o censura selectiva: al delimitar surtidores y paneles de precios, se pueden difuminar zonas con información sensible (precios, matrículas adyacentes) antes de publicar imágenes.
- Filtrado de datasets: dado su coste de inferencia bajo (ONNX, entrada de 736 px), es adecuado para descartar imágenes que no contienen una estación de servicio y reducir el volumen de datos que se etiqueta manualmente.
- Módulo componente en un pipeline de subred tipo Bittensor: el diseño (script `miner.py`, hash de pesos verificado) encaja con un rol de minero que responde a peticiones de detección en un entorno distribuido; el identificador "sn44" apunta en esa dirección, aunque no está confirmado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye mAP, precisión, recall, F1 ni curvas precision-recall por clase, ni comparaciones con otros detectores. Tampoco se han encontrado métricas en la búsqueda web.

## Requisitos de hardware

- VRAM estimada: no disponible. El repositorio ocupa 0.0 GB y no se publica el número de parámetros ni el tamaño real del archivo ONNX.
- Como referencia genérica del orden de magnitud: un detector de una etapa con entrada de 736 px suele requerir por debajo de 2 GB de VRAM en FP32 y ejecutarse en CPU con latencias del orden de decenas de milisegundos por imagen; estas cifras son una estimación general y no un dato publicado por el autor.
- GPU recomendadas: no disponible. Al ser un modelo ONNX, puede ejecutarse con los execution providers de ONNX Runtime (CUDA, TensorRT, DirectML, CoreML, OpenVINO), pero el autor no valida ninguno de ellos explícitamente.
- Cabe en GPU consumer: previsiblemente sí, en cualquier GPU con 2 GB o más de memoria, pero no está confirmado por el autor.
- Opciones de despliegue: ONNX Runtime vía `miner.py` es el único método documentado. Alternativas técnicas posibles sin validar por el autor: ONNX Runtime Server, Triton Inference Server con backend ONNX, o conversión a TensorRT. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI (no aplican a un detector visual).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

La comparación es limitada porque se desconocen los parámetros y las métricas de este modelo. Se incluyen alternativas de la misma categoría (detección de objetos genérica o de dominio, exportables a ONNX) con datos públicos conocidos.

| Modelo | Parámetros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| apexlabs-hq/sn44-petrol-v5 | no disponible | imgsz 736, 4 clases | no disponible | no disponible | ONNX en HF (repo de 0.0 GB) |
| YOLOv8 / YOLO11 (Ultralytics) | 3 M - 68 M según variante | 640 px por defecto, configurable | mAP COCO publicado por el autor | AGPL-3.0 (o licencia comercial) | Pesos y exportación ONNX pública |
| RT-DETR (Baidu/PaddleDetection) | 20 M - 76 M según variante | 640 px por defecto | mAP COCO publicado por el autor | Apache-2.0 | Pesos y exportación ONNX pública |
| GroundingDINO | no disponible con precisión en esta ficha | texto + imagen, open-set | zero-shot, sin clases fijas | Apache-2.0 | Pesos públicos |

Diferencias clave: este modelo está especializado en cuatro clases de un dominio muy concreto, mientras que las alternativas son de propósito general y requerirían ajuste fino para igualar la especialización. A cambio, las alternativas ofrecen licencia, métricas y trazabilidad de las que aquí se carece.

## Limitaciones y advertencias

- Licencia no declarada: no puede asumirse uso comercial permitido. Es un bloqueante para producción hasta que el autor aclare los términos.
- Repositorio de 0.0 GB: los pesos podrían no estar efectivamente alojados en HuggingFace, en cuyo caso el modelo no es descargable desde el enlace público.
- Cero descargas y cero likes, con creación y actualización separadas por unos ocho minutos: no hay evidencia de uso ni de validación por terceros.
- Ausencia total de métricas: no se puede evaluar la precisión real del detector, ni estimar su tasa de falsos positivos y falsos negativos en dominio.
- Dominio cerrado de cuatro clases: cualquier objeto fuera de esa lista se ignorará o se forzará a una de las cuatro categorías.
- Dependencia de la resolución de entrada (736 px): los objetos muy pequeños o las imágenes muy degradadas pueden quedar por debajo del umbral.
- Umbral global bajo (0.12) combinado con márgenes de rescate: configuración orientada a maximizar recall, con riesgo de aumentar los falsos positivos si el modelo se aplica fuera de su distribución de entrenamiento.
- Sin información sobre sesgos: no se conoce la distribución geográfica del dataset de entrenamiento, por lo que el rendimiento puede degradarse en estaciones con diseños no representados (por ejemplo, distintas regiones o cadenas).
- Riesgo de alucinación en sentido estricto no aplica (no genera texto), pero sí de detecciones espurias con confianza baja.
- Sin soporte declarado de idiomas: las etiquetas están en inglés y no se documenta localización.
- Los resultados de la búsqueda web realizada no contienen ningún material técnico relacionado con este modelo; no se han podido contrastar datos con fuentes externas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/apexlabs-hq/sn44-petrol-v5
- Modelo de referencia citado en la model card: `manak0/Detect-petrol-station-1-0` (no se ha podido verificar su URL en la búsqueda realizada)
- Paper, blog, repositorio de código o demo: no disponible
- La búsqueda web no devolvió enlaces relevantes sobre este modelo; los resultados obtenidos no guardan relación con el contenido técnico de la ficha y se han descartado.
