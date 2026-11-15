# apexlabs-hq/sn44-dirtiness-v26

## Resumen

`apexlabs-hq/sn44-dirtiness-v26` es un detector de objetos basado en un modelo YOLO exportado a formato ONNX, publicado por el usuario `apexlabs-hq`. No se trata de un modelo de lenguaje generativo ni de un modelo fundacional, sino de un artefacto de inferencia especializado en la deteccion de suciedad en imagenes de habitaciones. Concretamente, identifica cinco clases de incidencias: derrames de liquido, papeleras, basura dispersa, moho y manchas.

El modelo se sirve mediante `miner.py` usando `onnxruntime`, lo que lo vincula a un pipeline de mineria concreto (probablemente asociado al subnet 44 de Bittensor, dado el prefijo `sn44` del identificador). La model card es extremadamente escueta: solo documenta las clases, el tamano de entrada (`imgsz: 736`), los umbrales de confianza por clase y el hash SHA-256 de los pesos. No se especifica arquitectura base, numero de parametros, licencia ni composicion del dataset de entrenamiento.

El repositorio tiene un tamano de 0.0 GB y cero descargas y likes en el momento de la consulta, lo que sugiere un artefacto recien publicado o de uso interno. Su relevancia es acotada: es un componente de un sistema mayor de deteccion de limpieza, no un modelo de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO (detector de objetos) exportado a ONNX; version concreta no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | no disponible (el artefacto es ONNX; no se documentan variantes) |
| Idiomas soportados | no disponible (modelo de vision, no procesa texto) |
| Licencia | no disponible |
| Formato de pesos | ONNX |

Parametros adicionales documentados en la model card:

| Parametro | Valor |
|---|---|
| Clases | liquid spillage, bin, litter, mould, stain |
| Tamano de entrada (imgsz) | 736 |
| Umbral de confianza global | 0.05 |
| Umbrales por clase | {0: 0.35, 1: 0.4, 2: 0.45, 3: 0.25, 4: 0.2} |
| Supresion de duplicados entre clases | [(0, 3, 0.3), (0, 4, 0.3), (3, 4, 0.3)] |
| SHA-256 de pesos | `682efac786360db2d66a014fe019933dc06121c3fec6dc4ddee72a81094d689b` |
| Runtime de inferencia | onnxruntime via `miner.py` |

## Arquitectura y entrenamiento

La model card indica que es un detector ONNX servido por `miner.py` con onnxruntime, y el tamano de entrada de 736 pixeles es coherente con la familia YOLO (que admite tamanos multiples de 32). Sin embargo, no se especifica la variante concreta (YOLOv5, YOLOv8, YOLO11, etc.), el numero de parametros ni la resolucion nativa de entrenamiento.

No hay informacion sobre el dataset de entrenamiento: ni numero de imagenes, ni composicion, ni tecnicas de aumento de datos, ni si se uso transfer learning desde pesos preentrenados. Tampoco se documentan procesos de RLHF, DPO ni tecnicas de destilacion. La unica innovacion tecnica observable es la configuracion de supresion de duplicados entre clases (pares `(0,3)`, `(0,4)` y `(3,4)` con umbral 0.3), que evita que un mismo objeto se detecte simultaneamente como "derrame de liquido" y "moho" o "mancha", clases visualmente solapadas.

## Capacidades

- Deteccion de objetos en imagenes de interiores con cinco clases: derrames de liquido, papeleras, basura, moho y manchas.
- Inferencia via ONNX Runtime, lo que permite despliegue en CPU y GPU con el runtime estandar.
- Umbrales de confianza diferenciados por clase, calibrados para equilibrar precision y recall en cada categoria.
- Supresion de duplicados entre clases visualmente confundibles (liquido/moho, liquido/mancha, moho/mancha).
- Entrada de imagen fija a 736 pixeles.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues (es un modelo puramente visual).

## Casos de uso

- Auditoria automatizada de limpieza en hoteleria: el detector puede procesar fotos de habitaciones tomadas por el personal o por camaras fijas para verificar que no quedan derrames, basura ni manchas antes de dar la habitacion por lista, usando los umbrales por clase para reducir falsos positivos en cada tipo de incidencia.
- Inspeccion de instalaciones sanitarias: la clase `mould` con umbral 0.25 (el mas bajo) prioriza el recall en la deteccion de moho, adecuado para entornos donde un falso negativo tiene coste sanitario alto (banos, cocinas industriales, hospitales).
- Control de calidad en alquiler vacacional: integrado en una app movil, el modelo permite al huesped o al propietario subir una foto y obtener un veredicto objetivo sobre el estado de limpieza, con la clase `bin` (umbral 0.4) para verificar que las papeleras estan vacias o presentes.
- Mantenimiento predictivo de espacios publicos: procesamiento por lotes de imagenes de oficinas, aulas o vestuarios para priorizar rutas de limpieza segun la densidad de incidencias detectadas.
- Pipeline de mineria en Bittensor (subnet 44): el modelo esta disenado para ser servido por `miner.py` en un contexto de mineria descentralizada, donde los mineros compiten por ofrecer detecciones correctas sobre imagenes de evaluacion.
- Verificacion post-limpieza en industria alimentaria: la deteccion de `stain` y `liquid spillage` permite documentar con evidencia visual el cumplimiento de protocolos APPCC tras cada turno de limpieza.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible. Al ser un modelo ONNX de deteccion con entrada 736x736, es probable que quepa en GPUs consumer de gama baja, pero no se documenta el tamano de los pesos ni el consumo medido.
- GPU recomendadas: no disponible. Cualquier GPU compatible con onnxruntime (CUDA o TensorRT) o incluso CPU puede ejecutar el modelo, pero no hay datos de latencia.
- Cabe en consumer GPU: previsiblemente si, dado el formato ONNX y el tamano reducido tipico de los detectores YOLO, pero no se confirma en la documentacion.
- Opciones de despliegue: onnxruntime (documentado); otras opciones como TensorRT, OpenVINO o vLLM no aplican o no estan documentadas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Clases | Entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| apexlabs-hq/sn44-dirtiness-v26 | Detector YOLO ONNX | 5 (suciedad) | 736 | no disponible | Hugging Face |
| manako/Detect-room-dirtiness-detection | Detector (referenciado como base) | no disponible | no disponible | no disponible | Hugging Face |
| YOLOv8/YOLO11 (Ultralytics) | Detector generico | 80 (COCO) | configurable | AGPL-3.0 / comercial | GitHub, Hugging Face |

La comparativa con detectores genericos no es directa: este modelo esta especializado en cinco clases de suciedad y no cubre las 80 clases de COCO. El modelo `manako/Detect-room-dirtiness-detection` aparece referenciado en la model card como el detector al que sirve este artefacto, pero no se dispone de sus especificaciones.

## Limitaciones y advertencias

- Modelo card practicamente vacia: no se documenta licencia, dataset, arquitectura base ni metricas, lo que impide evaluar su calidad de forma rigurosa.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido. Contactar con el autor antes de cualquier despliegue en produccion.
- Riesgo de falsos positivos y negativos sin cuantificar: los umbrales por clase estan calibrados para un contexto concreto (probablemente el pipeline de mineria) y pueden no generalizar a otras condiciones de iluminacion, camara o tipo de habitacion.
- Clases visualmente solapadas: la supresion de duplicados entre liquido/moho/mancha mitiga pero no elimina la ambiguedad; una mancha oscura puede clasificarse como moho o como derrame segun el umbral.
- Entrada fija a 736 pixeles: imagenes de muy alta resolucion requeriran redimensionado, con posible perdida de detalle en incidencias pequenas (moho incipiente, manchas finas).
- Sin informacion sobre sesgos: no se conoce la distribucion del dataset de entrenamiento, por lo que no se puede evaluar el sesgo por tipo de superficie, iluminacion o region geografica.
- Repositorio con 0 descargas y 0.0 GB: el artefacto puede estar incompleto o ser de acceso restringido; verificar la integridad de los pesos con el SHA-256 documentado.
- Dependencia de `miner.py`: el modelo esta disenado para un runtime concreto; su uso fuera de ese pipeline requiere adaptar el preprocesado y postprocesado (umbrales, NMS entre clases).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/apexlabs-hq/sn44-dirtiness-v26
- Modelo base referenciado: https://huggingface.co/manako/Detect-room-dirtiness-detection
- onnxruntime (runtime de inferencia): https://onnxruntime.ai/
- Repositorio de Ultralytics YOLO (familia probable de la arquitectura): https://github.com/ultralytics/ultralytics
