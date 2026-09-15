# NexusDwin/sailswarm-yolo-thermal

## Resumen

NexusDwin/sailswarm-yolo-thermal es un detector de objetos térmicos basado en YOLOv8n, publicado por el proyecto SailSwarm (Universidad de Konstanz, Cluster of Excellence in Collective Behaviour) como resultado negativo documentado. El modelo opera sobre el frame de una cámara térmica FLIR Lepton 3.0 (160 x 120 px, paleta inferno invertida a intensidad) e iba destinado al módulo de detección de obstáculos del vehículo de superficie no tripulado (USV) SailSwarm. Cubre seis clases: `boat`, `buoy`, `duck`, `other`, `person` y `structure`.

El repositorio agrupa tres checkpoints: un preentrenamiento sobre LLVIP (15.488 pares nocturnos RGB/LWIR) y MassMIND (2.916 frames LWIR de puerto) reescalados a 160 px, un fine-tune sobre 773 frames térmicos del espacio de Konstanz y un control entrenado desde el checkpoint de COCO. La evaluación sobre una ventana nocturna reservada (20:41 a 21:00 del 2026-09-08, 74 frames, 54 cajas) arroja un recall máximo de 0,35 con precisión 0,84 en el mejor punto de operación, por debajo del umbral exigido a un votante térmico dentro del sistema de detección.

Su relevancia es metodológica más que de producto: fija una línea base reproducible, cuantifica la ganancia real del preentrenamiento externo (unos +0,20 de recall frente a COCO con la misma precisión) y documenta que el cuello de botella son los objetivos de 3 a 6 px en un frame AGC-normalizado con pocos cientos de frames etiquetados, no la cantidad de etiquetas del mismo tipo. Los autores no lo han desplegado ni lo han usado en el envío a ICRA 2027.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOv8n (Ultralytics), detector de objetos de una etapa basado en CNN |
| Parametros totales | no disponible en la model card (la variante nano estándar de YOLOv8 ronda los 3,2 millones de parámetros) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de visión); entrada de 160 x 120 px del sensor FLIR Lepton 3.0 |
| Tipos de cuantizacion | no disponible; los checkpoints se publican en `.pt` (PyTorch) y la model card no documenta ninguna cuantización |
| Idiomas soportados | no aplica (modelo de detección de objetos, sin capacidades de lenguaje) |
| Licencia | other (Ultralytics YOLOv8 bajo AGPL-3.0; los pesos derivados de MassMIND heredan los términos CC BY-NC-SA) |
| Formato de pesos | `.pt` (checkpoints de PyTorch / Ultralytics) |
| Clases detectadas | boat, buoy, duck, other, person, structure |
| Resolucion de entrada | 160 x 120 px en producción (FLIR Lepton 3.0, paleta inferno invertida a intensidad); entrenamiento a 640 px |
| Variantes publicadas | 3 checkpoints: pretrain externo, fine-tune térmico y control desde COCO |
| Fecha de entrenamiento | 2026-09-12 y 2026-09-13 |
| Tamano del repositorio | 0,0 GB |
| Descargas / likes | 0 / 0 en el momento de la consulta |

## Arquitectura y entrenamiento

La base es YOLOv8n, la variante nano del detector de una etapa de Ultralytics: backbone convolucional con bloques C2f, neck de tipo PAN-FPN y cabeza de detección anclaje-libre. El pipeline se ejecuta a 640 px durante el entrenamiento, aunque la inferencia real ocurre sobre frames de 160 x 120 px reescalados, lo que provoca que los objetivos de persona y embarcación queden en 3 a 6 px. El preentrenamiento parte de LLVIP (15.488 pares nocturnos RGB/LWIR con cajas de persona) más MassMIND (2.916 frames LWIR de entorno portuario, con cajas derivadas de las máscaras de instancia), ambos reescalados a 160 px para igualar la escala del objetivo al sensor Lepton: 30 épocas a 640 px, con mAP50 de validación 0,747 sobre esos datos externos de baja resolución.

El fine-tune principal (`yolov8n_konstanz_thermal_ft2_best.pt`) se ejecuta durante 150 épocas a 640 px sobre 773 frames térmicos del espacio de Konstanz: auditorías del 2026-08-26 y 2026-09-08 deformadas al frame Lepton más 100 cajas dibujadas directamente sobre la imagen térmica. Se publica un control (`yolov8n_konstanz_thermal_ft2_cocoinit_best.pt`) con idéntico fine-tune partiendo del checkpoint de COCO. No se documenta RLHF, DPO ni decodificación especulativa, al no tratarse de un modelo generativo. El mAP de validación durante el entrenamiento de los fine-tunes es cercano a cero porque el split interno es el conjunto térmico minúsculo; la métrica válida es la evaluación auditada sobre la ventana nocturna reservada. La receta y la evaluación están en `scripts/gpu_finetune/train_yolo.py` y `scripts/eval/thermal_gt_eval.py`.

## Capacidades

- Detección de objetos en infrarrojo lejano (LWIR) nocturno sobre frames de 160 x 120 px, con seis clases: `boat`, `buoy`, `duck`, `other`, `person` y `structure`.
- Punto de operación de alta precisión y bajo recall: 0,84 de precisión con 0,11 falsos positivos por frame a confianza 0,10, lo que lo hace apto como votante conservador dentro de un ensemble.
- Detección de personas y embarcaciones en escenas nocturnas sin luz visible (la imagen RGB correspondiente a la ventana evaluada está en negro).
- Capacidad de servir como inicialización para fine-tuning posterior sobre nuevos frames térmicos anotados.
- No dispone de generación de texto, razonamiento, código, matemáticas ni visión generalista más allá de la detección de cajas.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No es un modelo de agentes ni mantiene estado conversacional.
- No tiene capacidades multilingües ni de audio.
- No se documenta modo "thinking", salida de texto ni etiquetado semántico más allá de las seis clases.

## Casos de uso

- Votante térmico de alta precisión en un sistema de detección multimodal: combinado con un detector clásico de blobs calientes (recall 0,77, precisión 0,17) o con el detector RGB, el modelo aporta confirmaciones limpias con 0,11 falsos positivos por frame y reduce el número de falsas alarmas del sistema.
- Navegación nocturna de USV en aguas interiores: el modelo procesa directamente el frame de 160 x 120 de la Lepton 3.0, un coste computacional compatible con una caja de obstáculos embarcada, aunque su recall de 0,35 obliga a mantener un detector de respaldo.
- Preetiquetado y anotación asistida de nuevas auditorías térmicas: con confianza alta y precisión 0,84, sus detecciones pueden usarse como propuestas iniciales para revisión humana, acelerando la construcción del conjunto térmico puro que los autores identifican como cuello de botella.
- Punto de partida para fine-tuning en campañas futuras: los pesos `yolov8n_konstanz_thermal_ft2_best.pt` están pensados para arrancar la siguiente ronda (sesión nocturna con objetivos a 3-8 m y unas 500 auditorías puramente térmicas) sin partir de cero.
- Investigación sobre detección LWIR de baja resolución: el repositorio permite reproducir la comparación entre inicialización externa (LLVIP+MassMIND) y COCO en condiciones de pocos píxeles por objetivo, útil para estudiar el efecto del reescalado y de las etiquetas en el dominio térmico.
- Auditoría de datos y control de calidad del dataset: el control entrenado desde COCO sirve como referencia para aislar cuánto del rendimiento proviene del preentrenamiento externo y cuánto de las etiquetas térmicas específicas.
- Vigilancia marítima de proximidad en puerto y dársena: el modelo se ha preentrenado con MassMIND, un corpus LWIR portuario, por lo que es directamente aplicable a escenas de muelle con embarcaciones y estructuras.
- Búsqueda de personas en el agua durante operaciones nocturnas: la clase `person` está entrenada con LLVIP y con cajas térmicas directas, con la salvedad del recall limitado a distancia.

## Benchmarks y rendimiento

Evaluación sobre la ventana nocturna reservada (20:41 a 21:00 del 2026-09-08, 74 frames, 54 cajas, RGB en negro):

| Inicialización | conf | Recall (person / boat) | Precisión | FP por frame |
|---|---|---|---|---|
| Pretrain LLVIP+MassMIND baja resolución | 0,25 | 0,11 (3/39, 3/15) | 1,00 | 0,00 |
| Pretrain LLVIP+MassMIND baja resolución | 0,10 | 0,35 (13/39, 6/15) | 0,84 | 0,11 |
| COCO | 0,10 | 0,15 (6/39, 2/15) | 0,88 | 0,01 |
| Detector clásico de blobs calientes (referencia, 101 frames nocturnos) | no disponible | 0,77 | 0,17 | 3,3 |

Datos adicionales de rendimiento:

| Métrica | Valor |
|---|---|
| mAP50 del preentrenamiento sobre datos externos de baja resolución | 0,747 |
| mAP de validación durante el fine-tune | cercano a cero (el split interno es el conjunto térmico minúsculo) |
| Efecto del preentrenamiento externo | aproximadamente +0,20 de recall frente a COCO a igual precisión |
| Efecto de las 100 cajas dibujadas sobre térmico | recall nocturno de 0,10 a 0,35 a precisión 0,84 |

Los recuentos por clase están en `runs/thermal_det_eval_*.json` y las curvas de entrenamiento en `runs/*/results.csv`. No se han publicado resultados de benchmarks genéricos de lenguaje (MMLU, HumanEval, GSM8K) porque no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM de inferencia: no publicada en la model card; por el tamaño de la variante nano de YOLOv8 cabe holgadamente por debajo de 1 GB en FP32 (estimación, no confirmada por los autores).
- GPU recomendadas: no especificadas. Por tamaño, cualquier GPU de consumo reciente es suficiente; el entrenamiento publicado se ejecutó con scripts de GPU (`scripts/gpu_finetune/train_yolo.py`), sin detallar el modelo de tarjeta.
- Cabe en GPU de consumo: sí, con margen amplio, dado que el modelo es la variante nano. También es viable en CPU y en aceleradores de borde del tipo Jetson, aunque esto no está validado en la model card.
- Opciones de despliegue: inferencia con Ultralytics sobre PyTorch (`.pt`). La exportación a ONNX, TensorRT, OpenVINO o TFLite es posible a través del propio framework Ultralytics, pero no está documentada en el repositorio. No aplican vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles. En producción la entrada real es de 160 x 120 px, muy inferior a los 640 px usados en entrenamiento, lo que reduce el coste por frame pero también explica el bajo recall.

## Comparativa con modelos similares

| Alternativa | Tipo | Inicialización | Recall nocturno | Precisión | FP por frame | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| sailswarm-yolo-thermal (ft2) | YOLOv8n | LLVIP+MassMIND baja resolución + fine-tune térmico | 0,35 | 0,84 | 0,11 | AGPL-3.0 + CC BY-NC-SA | HuggingFace |
| sailswarm-yolo-thermal (control) | YOLOv8n | COCO + mismo fine-tune térmico | 0,15 | 0,88 | 0,01 | AGPL-3.0 + CC BY-NC-SA | HuggingFace |
| Detector clásico de blobs calientes | Umbral sobre píxeles calientes | no aplica | 0,77 | 0,17 | 3,3 | no disponible | interno del proyecto SailSwarm |
| YOLOv8n estándar de Ultralytics | YOLOv8n | COCO | no disponible para este dominio | no disponible | no disponible | AGPL-3.0 | Repositorio y pesos públicos de Ultralytics |

En la información disponible no se identifican otros modelos públicos comparables específicamente en detección LWIR marítima sobre frames de 160 x 120 px: no disponible. Los corpus LLVIP y MassMIND son conjuntos de datos, no modelos, y se usan aquí como fuente de preentrenamiento.

## Limitaciones y advertencias

- Recall insuficiente para producción como detector único: 0,35 en el mejor punto de operación (confianza 0,10), frente a 0,77 del detector clásico de blobs calientes. Los propios autores indican que no supera la puerta de recall exigida a un votante térmico.
- Objetivos de 3 a 6 px en un frame AGC-normalizado de 160 x 120: la causa principal del fallo, según la model card, es la escala y la anotación puramente térmica insuficiente, no la falta de más etiquetas del mismo tipo.
- Conjunto de etiquetado muy reducido: 773 frames térmicos de fine-tune, de los cuales solo 100 cajas están dibujadas directamente sobre la imagen térmica.
- El mAP de validación durante el entrenamiento de los fine-tunes es cercano a cero por un split interno mal dimensionado, por lo que esa métrica no debe usarse para decidir entre checkpoints.
- Dominio restringido a escenas nocturnas: la ventana de evaluación tiene la imagen RGB en negro, de modo que el comportamiento en condiciones diurnas o de iluminación mixta no está caracterizado.
- Sesgos de dominio: el preentrenamiento proviene de LLVIP (peatones) y MassMIND (puerto), por lo que el rendimiento sobre otras clases (`duck`, `buoy`, `other`, `structure`) no está cuantificado en la tabla de evaluación publicada.
- Riesgo de falsos negativos alto y, por tanto, de alucinación por omisión en tareas de seguridad: no debe usarse como único sistema de evasión de obstáculos.
- Licencia restrictiva: YOLOv8 es AGPL-3.0 y los pesos derivados de MassMIND heredan los términos CC BY-NC-SA, lo que impide el uso comercial sin revisar ambas licencias. La licencia declarada en el repositorio es `other`.
- Modelo publicado como resultado negativo, no desplegado y no utilizado en el envío a ICRA 2027: no hay garantía de mantenimiento ni de soporte.
- Sin datos publicados sobre cuantización, latencia, throughput ni consumo energético en la plataforma de destino.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/NexusDwin/sailswarm-yolo-thermal
- Repositorio relacionado citado en la model card: `SailSwarm-ObstacleDetection` (documento `docs/history/2026-09-12_night_retrain_aime.md`, secciones 9 y 10); no se proporciona URL en la información disponible.
- Recetas y scripts citados: `scripts/gpu_finetune/train_yolo.py`, `scripts/eval/thermal_gt_eval.py`; rutas internas del proyecto, sin URL pública en la información disponible.
- Framework base: Ultralytics YOLOv8, https://github.com/ultralytics/ultralytics (licencia AGPL-3.0).
- Conjunto de datos LLVIP (Jia et al., 2021): referencia bibliográfica sin URL en la información disponible.
- Conjunto de datos MassMIND (Nirgudkar et al., 2023, CC BY-NC-SA): referencia bibliográfica sin URL en la información disponible.
- Modelo de clases relacionado: https://huggingface.co/NexusDwin/sailswarm-yolo-audited (citado como origen de la lista de clases).
- La búsqueda web realizada no devolvió resultados relevantes para este modelo: únicamente páginas de ayuda de Gmail y resultados de Zhihu, sin relación con el contenido de la ficha.
