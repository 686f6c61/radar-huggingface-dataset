# select-ai/fire-smoke-detection

## Resumen

El modelo `select-ai/fire-smoke-detection` es un detector de objetos YOLO26L afinado para la deteccion binaria de fuego (clase 0) y humo (clase 1) en fotogramas de video, orientado a vigilancia CCTV y sistemas de alerta temprana. Lo publica el usuario `select-ai` en Hugging Face con la libreria `ultralytics`, y parte del modelo base YOLO26L de Ultralytics preentrenado en COCO. La model card lo identifica como version `v1`, con estado `experimental` y visibilidad de repositorio marcada como interna, con fecha de referencia 2026-07-29.

Su relevancia practica esta en que aborda una limitacion concreta de los detectores de humo tradicionales (sensores puntuales con cobertura local, respuesta retardada y sin contexto visual): el modelo aporta cajas delimitadoras, etiqueta de clase y puntuacion de confianza por region detectada, lo que permite localizar el foco, estimar su tamano relativo y seguir su propagacion en el encuadre de la camara. La model card declara un 84 % de exactitud en deteccion de fuego y un 68 % en deteccion de humo sobre los conjuntos de evaluacion de referencia.

Tecnicamente es un detector puro, no un modelo generativo: 26.179.428 parametros entrenables, 392 capas, 93,1 GFLOPs de complejidad computacional y entrada de 960 x 960 pixeles. No dispone de ventana de contexto, capacidades multilingues, generacion de texto ni tool calling, por lo que su evaluacion debe centrarse en metricas de deteccion y no en benchmarks de LLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO26L (detector de objetos de una etapa) con backbone de bloques C3k2 y modulos de atencion C2PSA; cuello FPN con fusion multi-escala y cabezas de deteccion en P3, P4 y P5 |
| Parametros totales | 26.179.428 parametros entrenables |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de deteccion de objetos, no generativo) |
| Tipos de cuantizacion | No disponible; la model card solo referencia `models/best.pt` sin variantes cuantizadas |
| Idiomas soportados | No aplica (el modelo no procesa texto) |
| Licencia | No disponible |
| Formato de pesos | PyTorch (`.pt`, fichero `best.pt`); tamano del repositorio 0,2 GB |
| Capas | 392 |
| GFLOPs | 93,1 |
| Clases | 2 (0: fuego, 1: humo) |
| Resolucion de entrada | 960 x 960 (redimensionado con preservacion de relacion de aspecto), formato BGR |
| Umbral de confianza por defecto | 0,25 |
| Umbral IoU para NMS | 0,7 |
| Maximo de detecciones por imagen | 300 |
| Libreria | `ultralytics` >= 8.4.104 |
| Entorno de ejecucion | Python 3.12+, PyTorch >= 2.13.0 con CUDA 13.0, OpenCV >= 4.11.0, NumPy >= 1.26.4 |
| Descargas / likes en Hugging Face | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es un detector YOLO26L de una etapa. El backbone combina bloques C3k2 con modulos de atencion C2PSA; el cuello es una FPN (Feature Pyramid Network) con fusion multi-escala y la cabeza realiza deteccion en tres niveles (P3, P4, P5), lo que permite cubrir objetos de distinto tamano dentro del mismo fotograma. La salida son coordenadas de caja `(x1, y1, x2, y2)` en el espacio de la imagen original, la etiqueta de clase y una puntuacion de confianza entre 0,0 y 1,0. Segun la model card, el sistema es de extremo a extremo y no incorpora ingenieria de caracteristicas manual.

El modelo parte de YOLO26L (Ultralytics) preentrenado en COCO y se afina para las dos clases de interes. Las unicas aumentaciones de entrenamiento documentadas son el volteo horizontal aleatorio con probabilidad 0,5 y la aumentacion Mosaic con probabilidad 1,0. No se especifican en la informacion disponible el numero de imagenes de entrenamiento, la composicion del dataset, el numero de epocas, el optimizador, la tasa de aprendizaje, ni procesos de RLHF o DPO (que, por otra parte, no son de aplicacion a un detector de objetos). Durante la ejecucion se menciona el uso de precision mixta (AMP). El repositorio se publica con fecha de creacion y actualizacion 2026-09-22.

## Capacidades

- Deteccion de objetos en fotogramas de video o imagenes sueltas para dos clases: fuego (clase 0) y humo (clase 1).
- Salida estructurada por deteccion: identificador, caja `box_xyxy`, nombre de clase y `class_id`.
- Deteccion multiple por fotograma, con un maximo configurable de 300 detecciones.
- Deteccion multi-escala (P3, P4, P5) para objetos de tamanos dispares.
- Post-procesado integrado con Non-Maximum Suppression a IoU 0,7 y filtrado por umbral de confianza (0,25 por defecto, ajustable entre 0,15 y 0,60 segun la prioridad de precision o exhaustividad).
- Anotacion visual de fotogramas con cajas codificadas por color (rojo para fuego, gris para humo) y superposicion de etiqueta y confianza.
- Procesado por lotes de video mediante el script `scripts/run.py`, con parametros de video, modelo, confianza, tamano de imagen y directorio de salida.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, tool calling, soporte de agentes, capacidades multilingues, modo de pensamiento, audio ni vision general (no es un modelo vision-lenguaje).

## Casos de uso

- Vigilancia CCTV en plantas industriales y fabricas: ejecutando el detector sobre el flujo continuo de camaras fijas con `CONF_THRESHOLD` entre 0,15 y 0,20 para maximizar la exhaustividad y captar conatos de incendio, aceptando un mayor numero de falsos positivos a cambio de reducir el tiempo de reaccion.
- Deteccion temprana en edificios publicos (colegios, hospitales, centros comerciales): el modelo aporta contexto visual que un sensor puntual no da, de modo que el operador puede ver donde se origina el humo y hacia donde se propaga dentro del encuadre.
- Monitorizacion de incendios forestales con camaras fijas o torres de vigilancia: la deteccion de humo (clase 1) permite alertar antes de que exista llama visible, aunque el rendimiento declarado para humo es notablemente inferior al de fuego (68 % frente a 84 %).
- Deteccion de fuego en carreteras, por ejemplo incendios de vehiculos o vegetacion junto a la calzada, integrando el script de inferencia en el circuito cerrado de television de tuneles y autopistas.
- Control de aforo y seguridad en conciertos y eventos multitudinarios: el modelo figura explicitamente entre los usos previstos de la model card, y su procesamiento por fotograma encaja con camaras de recinto con iluminacion variable.
- Filtrado y verificacion de falsos positivos: con umbrales de 0,35 a 0,50 el sistema se orienta a minimizar detecciones espurias provocadas por reflejos, luces o superficies que imitan el aspecto del fuego, util para reducir la carga de la sala de control.
- Analisis forense posterior a un incidente: procesado por lotes de grabaciones almacenadas para reconstruir la evolucion temporal de las detecciones y su localizacion en el encuadre.
- Integracion en sistemas de alerta temprana: la salida JSON por deteccion (`detection_id`, `box_xyxy`, `class`, `class_id`) puede consumirse desde un sistema de gestion de alarmas, si bien la model card no documenta una API de servicio ni un modo servidor.

## Benchmarks y rendimiento

La model card solo publica dos valores de exactitud sobre sus conjuntos de evaluacion de referencia. No se detallan la identidad ni el tamano de dichos conjuntos, ni metricas habituales de deteccion como mAP, precision, recall o curvas precision-exhaustividad, por lo que no es posible contrastar el resultado ni compararlo con otros modelos sin inventar datos.

| Metrica | Valor | Notas |
|---|---|---|
| Exactitud en deteccion de fuego (clase 0) | 84 % | Conjunto de evaluacion no especificado |
| Exactitud en deteccion de humo (clase 1) | 68 % | Conjunto de evaluacion no especificado |
| mAP@0.5 / mAP@0.5:0.95 | No disponible | No publicado en la informacion proporcionada |
| Precision / recall por clase | No disponible | No publicado en la informacion proporcionada |
| Latencia / FPS | No disponible | Solo se indica que se probo en una NVIDIA L4 |
| Comparacion con otros detectores | No disponible | No se aportan resultados comparativos |

## Requisitos de hardware

- VRAM estimada para inferencia: no publicada. Como referencia de orden de magnitud, 26,2 M de parametros ocupan aproximadamente 105 MB en FP32 y 52 MB en FP16, pero el consumo real lo dominan las activaciones a 960 x 960; para lote 1 cabe esperar un rango de pocos gigabytes, estimacion que no esta confirmada por el autor y debe validarse en el hardware objetivo.
- GPU recomendadas: el autor indica que el modelo se probo en una NVIDIA L4 con 24 GB de VRAM, con CUDA Toolkit >= 13.0 y PyTorch con soporte CUDA. No se mencionan otras GPU.
- Viabilidad en GPU de consumo: no documentada de forma explicita. Dado el tamano del modelo (26,2 M de parametros, 93,1 GFLOPs por fotograma a 960 x 960), es razonable esperar que quepa en tarjetas de consumo de gama media y alta con suficiente VRAM (por ejemplo, RTX 3060 de 12 GB, RTX 4060 Ti, RTX 4090), pero se trata de una inferencia no confirmada por el autor.
- Opciones de despliegue: la model card solo documenta el script Python `scripts/run.py` sobre el fichero `best.pt` con la libreria Ultralytics. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a un detector de objetos), ni exportaciones a ONNX, TensorRT u OpenVINO.
- Latencia y throughput: no disponibles. El autor califica el sistema como apto para monitorizacion en tiempo real y menciona el uso de precision mixta (AMP), pero no aporta cifras de FPS ni de latencia por fotograma.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye resultados de otros detectores de fuego y humo ni metricas comparables (mAP, precision, recall) de alternativas de la misma categoria. El unico punto de referencia citado es el modelo base YOLO26L preentrenado en COCO, del que no se detallan parametros, contexto ni metricas en esta ficha.

| Modelo | Parametros | Entrada | Metricas publicadas | Licencia |
|---|---|---|---|---|
| `select-ai/fire-smoke-detection` (YOLO26L afinado) | 26.179.428 | 960 x 960 | 84 % exactitud en fuego, 68 % en humo | No disponible |
| YOLO26L preentrenado en COCO (modelo base) | No disponible en la informacion proporcionada | No disponible | No disponible | No disponible |
| Alternativas de deteccion de fuego y humo | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- El rendimiento se degrada en fuegos muy pequenos (menos de 20 pixeles), con humo denso que oscurece la camara, en condiciones de iluminacion extrema (deslumbramiento por sol directo u oscuridad total) y ante superficies reflectantes que imitan el aspecto del fuego.
- El modelo no esta disenado para fondos complejos, grabaciones subacuaticas o aereas, ni para imagen termica. La model card se interrumpe en este punto, por lo que la lista de limitaciones del autor puede estar incompleta.
- Asimetria clara entre clases: la exactitud declarada para humo (68 %) es 16 puntos inferior a la de fuego (84 %), algo critico cuando la deteccion temprana de humo es precisamente el escenario de mayor valor.
- Riesgo de falsos positivos por reflejos, luces y objetos con apariencia similar a la llama; el propio autor recomienda subir el umbral de confianza a 0,35-0,50 en zonas de mucho trafico visual para mitigarlo.
- No se documentan sesgos del conjunto de datos, ni su composicion, procedencia geografica, condiciones de captura o balance entre clases; por tanto, no es posible evaluar la generalizacion a dominios distintos de los de entrenamiento.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido. Es un bloqueo relevante para cualquier despliegue en produccion.
- El modelo se marca como `experimental` y `v1`, con visibilidad de repositorio declarada como interna pese a estar publicado en Hugging Face; conviene tratar esta version como no estable.
- Un fallo del detector en un sistema de seguridad contra incendios puede tener consecuencias graves. El modelo debe usarse como capa de apoyo a los sistemas certificados de deteccion, nunca como sustituto de estos, y su salida requiere supervision humana.
- La model card no documenta estrategias de calibracion, verificacion temporal entre fotogramas ni umbrales por clase, lo que dificulta fijar una politica de alarmas sin trabajo adicional de ajuste.
- La informacion disponible no incluye resultados de benchmarks estandar, ni analisis de latencia, ni estudios de caso en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/select-ai/fire-smoke-detection
- La busqueda web realizada no devolvio ningun enlace relevante sobre este modelo. Los resultados obtenidos correspondian a la documentacion del elemento HTML `<select>` en MDN, a una agencia de viajes, a una distribuidora de material electrico y a definiciones de diccionario del termino "select", por lo que no se incluyen como referencias.
- No se han encontrado en la informacion proporcionada enlaces a papers, blogs tecnicos, repositorios de codigo ni demos del modelo.
