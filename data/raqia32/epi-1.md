# Raqia32/epi-1

## Resumen

raqIA EPI-1 es un detector de objetos especializado en equipamiento de protección individual (EPI) en entornos industriales, publicado por raqIA (raqia.ia.br) bajo licencia Apache-2.0. El modelo distingue tres clases: `capacete`, `sem_capacete` y `colete`, es decir, casco puesto, cabeza sin casco y chaleco. Está pensado para el suelo de fábrica brasileño (depósito y línea de producción), y su documentación está íntegramente en portugués de Brasil, algo poco habitual en este nicho.

Técnicamente es un detector basado en la arquitectura RF-DETR, en su variante nano, exportado a ONNX (114 MB en FP32). Se entrenó durante 20 épocas sobre el dataset público jhboyo/ppe-dataset (15.500 imágenes, 60.991 objetos), en una única RTX 3060 de 12 GB durante aproximadamente 3 horas y 30 minutos. Su relevancia principal es doble: por un lado, la licencia Apache-2.0 evita el copyleft AGPL-3.0 que arrastran la mayoría de detectores de EPI basados en Ultralytics YOLO; por otro, el autor publica métricas de validación y un apartado explícito de limitaciones.

Los números declarados en la model card son mAP50 de 0,938, mAP50:95 de 0,677, precisión de 0,912 y recall de 0,888, medidos sobre el split de validación del dataset de entrenamiento. El propio autor advierte que la tarea es más sencilla que la de los detectores comparables (3 clases frente a 10-19, sin guantes, botas ni mascarillas), por lo que la comparación directa de cifras no es concluyente. No se especifican datos como el número de parámetros, la composición exacta del dataset ni la resolución de entrada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RF-DETR, variante nano (detector de objetos basado en transformer, familia DETR); exportado a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de visión; no procesa texto) |
| Tipos de cuantizacion | no disponible; el repositorio distribuye el modelo en ONNX FP32 (114 MB) |
| Idiomas soportados | portugués de Brasil (documentación y nombres de clase); el modelo opera sobre imagen, no sobre texto |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`epi-1.onnx`); los tags del repositorio incluyen también PyTorch (`pt`) |
| Tarea | object-detection |
| Clases detectadas | `capacete`, `sem_capacete`, `colete` |
| Resolucion de entrada | no disponible |
| Tamano del repositorio | 0,2 GB |
| Fecha de publicacion | 2026-10-07 (última actualización: 2026-10-08) |

## Arquitectura y entrenamiento

La model card indica que la base es RF-DETR, una arquitectura de detección de objetos de tipo transformer (familia DETR), elegida expresamente por su licencia Apache-2.0 y por evitar el copyleft de AGPL-3.0 que afecta a los detectores Ultralytics YOLO. La variante utilizada es la nano. No se detallan en la información disponible el backbone, el número de parámetros, la resolución de entrada ni la estrategia de aumento de datos.

El entrenamiento se realizó sobre el dataset público jhboyo/ppe-dataset (15.500 imágenes y 60.991 objetos anotados), convertido de formato YOLO a COCO, durante 20 épocas en una RTX 3060 de 12 GB, con un tiempo aproximado de 3 horas y 30 minutos. El pipeline reproducible que documenta el autor consta de cuatro pasos: `download_dataset.py`, `yolo_to_coco.py`, `train.py --size nano --epochs 20` y `export_onnx.py`. No se menciona ningún proceso de ajuste por preferencias (RLHF, DPO) ni técnicas de decodificación especulativa, que en cualquier caso no aplican a esta tarea.

## Capacidades

- Detección de objetos en imágenes y vídeo sobre tres clases: casco puesto (`capacete`), persona sin casco (`sem_capacete`) y chaleco (`colete`).
- Salida de cajas delimitadoras con clase asociada, apta para dibujado de anotaciones (la demo del repositorio marca en verde el EPI detectado y en rojo la persona sin casco).
- Inferencia sobre vídeo, según declara el autor ("imagens e vídeo"), aunque no se publican métricas específicas de seguimiento temporal entre fotogramas ni identificadores de persona.
- Ejecución en formato ONNX, lo que permite despliegue con ONNX Runtime y exportación a otros runtimes compatibles.
- Uso comercial y modificación sin restricciones derivadas del copyleft, al ser Apache-2.0.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo puramente perceptivo.
- No detecta guantes, botas ni gafas en esta versión (v1 limitada a casco y chaleco).
- No procesa texto ni mantiene conversación; las capacidades multilingües no son aplicables.

## Casos de uso

- Monitorización de cumplimiento de EPI en línea de producción: con cámaras fijas sobre el puesto de trabajo, el modelo detecta en cada fotograma si la persona lleva casco y chaleco, y permite disparar una alerta cuando aparece la clase `sem_capacete`. Es adecuado porque las tres clases coinciden exactamente con los EPI obligatorios más habituales en planta.
- Vigilancia en tiempo real en almacén o depósito: al ser un modelo ONNX de 114 MB, puede ejecutarse sobre un equipo de borde junto a la cámara y enviar eventos a un panel de control sin depender de la nube.
- Auditoría posterior de grabaciones: procesado por lotes de vídeo archivado para cuantificar la tasa de incumplimiento por turno, zona o línea, generando informes de seguridad laboral con evidencia visual.
- Control de acceso a zonas de riesgo: integración en el flujo de apertura de puertas o tornos, de modo que el acceso se autorice solo si la detección confirma casco y chaleco en el encuadre.
- Supervisión de subcontratas y visitas en obra industrial: verificación rápida de que el personal externo cumple los requisitos mínimos antes de entrar a la zona operativa.
- Automatización de reportes de seguridad (EHS): alimentar un sistema interno con las detecciones para calcular indicadores de cumplimiento por periodo, reduciendo la revisión manual de imágenes.
- Sustitución de detectores YOLO en productos comerciales: para equipos que ya tienen un detector Ultralytics AGPL-3.0 y quieren cerrar el código, este modelo ofrece una alternativa Apache-2.0 con el mismo tipo de salida (cajas y clases).
- Prueba de concepto o docencia en visión por computador: el pipeline completo (dataset público, conversión a COCO, entrenamiento, exportación ONNX) es reproducible en una GPU de 12 GB en pocas horas.

## Benchmarks y rendimiento

Métricas declaradas por el autor, medidas en el split de validación del dataset (imágenes no vistas en entrenamiento):

| Metrica | Valor |
|---|---|
| mAP50 | 0,938 |
| mAP50:95 | 0,677 |
| Precision | 0,912 |
| Recall | 0,888 |
| Tamano del modelo | 114 MB (ONNX, FP32) |
| Hardware de entrenamiento | RTX 3060 12 GB, ~3 h 30, 20 épocas |

Comparativa publicada en la propia model card frente a otros detectores de EPI de HuggingFace (cifras tomadas de los model cards de cada proyecto):

| Modelo | mAP50 | Precision | Recall | Licencia |
|---|---|---|---|---|
| Hansung-Cho/yolov8-ppe-detection | 0,744 | 0,831 | 0,685 | AGPL-3.0 |
| killuminati1/construction-ppe-yolov8 | ~0,76 | ~0,81 | ~0,72 | AGPL-3.0 |
| Hexmon/vyra-yolo-ppe-detection | no publicado | — | — | AGPL-3.0 |
| melihuzunoglu/ppe-detection | no publicado | — | — | AGPL-3.0 |
| raqIA EPI-1 | 0,938 | 0,912 | 0,888 | Apache-2.0 |

Advertencia del propio autor: los modelos comparados se evalúan sobre datasets más difíciles, con 10-19 clases (incluyendo guantes, botas y mascarillas), mientras que EPI-1 solo cubre 3 clases, por lo que la comparación de cifras no es homogénea. No se han publicado resultados de benchmarks independientes (COCO, LVIS u otros) en la información disponible.

## Requisitos de hardware

- Entrenamiento: RTX 3060 de 12 GB, 20 épocas, aproximadamente 3 h 30 min (dato declarado por el autor).
- VRAM de inferencia: no publicada. Como referencia, los pesos en FP32 ocupan 114 MB, por lo que los pesos caben en cualquier GPU con más de 1 GB de memoria; el consumo total depende de la resolución de entrada y del tamaño de lote, datos no disponibles.
- GPU recomendadas: no especificadas. Por tamaño del modelo, es viable en cualquier GPU de consumo reciente (RTX 3050, 3060, 4060, 4090) y previsiblemente en aceleradores de borde tipo Jetson; no requiere A100 ni H100.
- Ejecución en CPU: factible para procesamiento por lotes o baja cadencia de fotogramas, aunque no se publican cifras de latencia.
- Opciones de despliegue: ONNX Runtime, que es el runtime documentado en el repositorio (`infer.py --model epi-1.onnx`); al ser ONNX, también es exportable a TensorRT, OpenVINO o DirectML, aunque estas rutas no se documentan en la model card. vLLM, llama.cpp, Ollama y TGI no aplican a un modelo de detección.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Clases | mAP50 | Precision | Recall | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| raqIA EPI-1 | 3 (casco, sin casco, chaleco) | 0,938 | 0,912 | 0,888 | Apache-2.0 | HuggingFace, ONNX |
| Hansung-Cho/yolov8-ppe-detection | no disponible en la informacion (dataset mas amplio) | 0,744 | 0,831 | 0,685 | AGPL-3.0 | HuggingFace |
| killuminati1/construction-ppe-yolov8 | no disponible | ~0,76 | ~0,81 | ~0,72 | AGPL-3.0 | HuggingFace |
| Hexmon/vyra-yolo-ppe-detection | no disponible | no publicado | — | — | AGPL-3.0 | HuggingFace |

La diferencia estructural más relevante no es la métrica, sino la licencia: los detectores basados en Ultralytics YOLO obligan a liberar el código del producto que los integra si se distribuye, mientras que EPI-1 es Apache-2.0 de extremo a extremo. A cambio, EPI-1 cubre menos clases y se entrena sobre un dataset de menor dificultad.

## Limitaciones y advertencias

- Es un detector visual: acredita la presencia de EPI en la imagen, no certifica conformidad con la normativa brasileña NR (NR-6 ni similares). No debe usarse como sustituto de una auditoría de seguridad.
- El entrenamiento se hizo con imágenes públicas de internet, no con imágenes de la planta del usuario. El propio autor exige una ronda de validación sobre el vídeo del cliente antes de confiar en el modelo.
- Distancia máxima fiable: la persona debe ocupar al menos aproximadamente el 3 % de la altura del fotograma.
- Los fallos de detección (alrededor del 11 % según el recall declarado) se concentran en personas pequeñas al fondo del encuadre o parcialmente ocluidas.
- No detecta guantes, botas ni gafas de protección en esta versión.
- Al proceder de un dataset de imágenes de internet, puede arrastrar sesgos de composición (iluminación, tipo de indumentaria, demografía, tipo de instalación) no documentados en la model card.
- Riesgo de falsos positivos y falsos negativos no caracterizado por escenario; la precisión y el recall declarados son agregados sobre un único split de validación.
- Los nombres de clase y la documentación están en portugués de Brasil; integrarlo en un sistema en otro idioma requiere mapear las etiquetas.
- No hay datos publicados sobre número de parámetros, resolución de entrada, composición del dataset de entrenamiento, latencia ni throughput, lo que dificulta el dimensionamiento previo de un despliegue.
- Licencia Apache-2.0: permite uso comercial, modificación y redistribución; la restricción práctica principal es la obligación de conservar los avisos de licencia y atribución.
- El repositorio registra 0 descargas y 0 likes, por lo que no existe validación comunitaria independiente de las métricas declaradas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Raqia32/epi-1
- Dataset de entrenamiento: https://huggingface.co/datasets/jhboyo/ppe-dataset
- Sitio del autor: https://raqia.ia.br
- Arquitectura base RF-DETR (mencionada en la model card, sin enlace proporcionado en la información disponible)
- No se han encontrado enlaces adicionales relevantes en la búsqueda web: los resultados devueltos corresponden a documentación sobre operadores del lenguaje SAS y no guardan relación con este modelo.
