# nishsm/swingtrace

## Resumen

Swingtrace es un modelo de deteccion de objetos basado en YOLO11, desarrollado por el usuario nishsm y publicado en Hugging Face. Su proposito concreto es detectar y seguir la cabeza y el varilla (shaft) del palo de golf a lo largo de un swing, lo que lo convierte en una herramienta de vision por computador orientada a analitica deportiva. El modelo parte de los pesos de Ultralytics/YOLO11, presumiblemente en su variante mediana (la model card lo etiqueta como swingtrace-yolo11m), y se ha afinado sobre un conjunto de datos de seguimiento de palos de golf alojado en Roboflow Universe.

La relevancia de este modelo es acotada pero clara: cubre una tarea de nicho (deteccion de la cabeza y el eje del palo durante el swing) que los detectores genericos no resuelven bien, y lo hace sobre una arquitectura YOLO11 ampliamente soportada por el ecosistema Ultralytics. Esto permite integrarlo en pipelines de analisis de video deportivo con herramientas estandar. El acceso esta restringido (gated), por lo que es necesario aceptar las condiciones en Hugging Face antes de descargarlo. La licencia es AGPL-3.0, lo que tiene implicaciones importantes para uso comercial.

No se dispone de informacion sobre el numero de parametros, la longitud de contexto (no aplica a un detector) ni los idiomas soportados, ya que se trata de un modelo de vision y no de un modelo de lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO11 (detector de objetos de una etapa, familia Ultralytics) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | no disponible (formato nativo Ultralytics; exportable a ONNX/TensorRT segun el ecosistema YOLO, no confirmado en la informacion) |
| Idiomas soportados | no aplica (modelo de vision) |
| Licencia | AGPL-3.0 |
| Formato de pesos | pesos Ultralytics (libreria `ultralytics`); tamano del repo 0.0 GB segun Hugging Face |
| Modelo base | Ultralytics/YOLO11 (finetune) |
| Tarea | object-detection |
| Acceso | restringido (gated) |

## Arquitectura y entrenamiento

Swingtrace es un finetune de YOLO11, la familia de detectores de una etapa de Ultralytics. YOLO11 emplea una backbone convolucional con modulos de atencion y un cabezal de deteccion que predice cajas y clases directamente en una sola pasada, lo que le confiere baja latencia en inferencia. La variante concreta parece ser la mediana (yolo11m) segun la denominacion del model-index, aunque el numero exacto de parametros no se especifica en la informacion disponible.

El entrenamiento se realizo sobre un conjunto de datos de seguimiento de palos de golf publicado en Roboflow Universe (golf-club-tracking). No se detalla el numero de imagenes, la composicion del dataset, si hubo aumento de datos ni si se aplicaron tecnicas de destilacion o ajuste fino adicional. Tampoco se documenta el numero de epocas ni la resolucion de entrada. Las etiquetas del modelo (club-head-detection, club-shaft-detection, swing-path) sugieren que se anotan la cabeza del palo, el eje y posiblemente la trayectoria del swing, aunque la informacion disponible no confirma cuantas clases exactas detecta.

## Capacidades

- Deteccion de la cabeza del palo de golf (club head) en fotogramas de video.
- Deteccion del eje o varilla del palo (club shaft).
- Seguimiento del palo a lo largo del swing (golf-club-tracking), lo que permite reconstruir la trayectoria.
- Analisis de la trayectoria del swing (swing-path) a partir de las detecciones.
- Deteccion de objetos en imagenes y video mediante la libreria `ultralytics`.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues: es un modelo puramente visual.
- No dispone de modo thinking, vision generativa, audio ni otras capacidades de modelos fundacionales.

## Casos de uso

- Analisis biomecanico del swing: procesar video de un jugador y extraer la posicion de la cabeza y el eje del palo en cada fotograma para calcular el plano del swing y detectar desviaciones.
- Entrenadores y academias de golf: integrar el modelo en una aplicacion que muestre al alumno la trayectoria de su palo superpuesta al video, con retroalimentacion visual inmediata.
- Evaluacion de equipamiento: comparar la trazada del swing con distintos palos o configuraciones para estudios de ajuste (fitting) de material.
- Retransmision deportiva aumentada: generar graficos en tiempo real sobre el video de un torneo mostrando la estela del palo durante el golpe.
- Investigacion en vision deportiva: usar el modelo como extractor de caracteristicas para estudios de reconocimiento de accion o de calidad del swing.
- Control de calidad de contenido: filtrar o etiquetar automaticamente clips de golf en plataformas de video segun si contienen un swing detectable.
- Aplicaciones moviles de practica: desplegar el modelo en el dispositivo (exportado a ONNX o similar) para dar feedback sin conexion, dado que YOLO11 es ligero.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index (no verificados):

| Metrica | Valor |
|---|---|
| Precision | 0.93 |
| Recall | 0.849 |
| mAP@50 | 0.918 |
| mAP@50-95 | 0.674 |

Dataset de evaluacion: golf-club-tracking (validation split, Roboflow Universe). No se han publicado otros resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precision al no conocerse el numero de parametros; para una variante mediana de YOLO11 en FP16 se situa tipicamente en el rango de 1-2 GB, pero este dato no esta confirmado en la informacion.
- GPU recomendadas: cualquier GPU moderna con soporte CUDA; para entrenamiento o lotes grandes, A100 o H100; para inferencia en tiempo real, RTX 4090, RTX 3090 o superiores.
- Cabe en GPU de consumo: probablemente si, dado que YOLO11 es una familia de detectores ligeros, aunque el dato exacto no se especifica.
- Opciones de despliegue: libreria `ultralytics` (PyTorch); exportacion a ONNX, TensorRT u otros formatos segun el ecosistema Ultralytics, no confirmada en la informacion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tarea | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| swingtrace (nishsm) | Deteccion de palo de golf | no disponible | no aplica | AGPL-3.0 | Hugging Face (gated) |
| YOLO11 (Ultralytics) | Deteccion de objetos generica | no disponible | no aplica | AGPL-3.0 | Ultralytics / Hugging Face |
| YOLOv8 (Ultralytics) | Deteccion de objetos generica | no disponible | no aplica | AGPL-3.0 | Ultralytics / Hugging Face |

No se dispone de datos de rendimiento comparables entre estos modelos en la informacion proporcionada. La comparativa se limita a categoria y licencia.

## Limitaciones y advertencias

- El modelo esta especializado en palos de golf; su rendimiento fuera de ese dominio no esta documentado y probablemente sea deficiente.
- Los resultados de benchmarks son declarados por el autor y no estan verificados (`verified: false`).
- No se documentan sesgos conocidos, pero al entrenarse sobre un dataset de Roboflow Universe puede heredar sesgos de ese conjunto (iluminacion, angulos de camara, tipos de palo).
- Riesgo de alucinacion: como detector, puede producir falsos positivos en escenas con objetos alargados similares a un palo.
- No hay informacion sobre el numero de imagenes de entrenamiento ni la diversidad del dataset, lo que limita la evaluacion de su robustez.
- Licencia AGPL-3.0: el uso en servicios en red puede obligar a liberar el codigo fuente derivado; es una restriccion relevante para produccion comercial.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face antes de la descarga, lo que anade friccion a la integracion automatizada.
- No aplica soporte multilingue ni de texto; es exclusivamente un modelo de vision.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nishsm/swingtrace
- Modelo base: https://huggingface.co/Ultralytics/YOLO11
- Dataset de referencia (golf-club-tracking, Roboflow Universe): no disponible el enlace directo en la informacion proporcionada
- Documentacion de Ultralytics: no disponible en la informacion proporcionada
- Paper de YOLO11: no disponible en la informacion proporcionada
