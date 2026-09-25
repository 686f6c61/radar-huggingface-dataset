# beaunix/dentex-ai

## Resumen

DentexAI (repositorio `beaunix/dentex-ai`) es un repositorio de HuggingFace que aloja dos modelos de vision por computador orientados a odontologia, construidos sobre la arquitectura Ultralytics YOLO11. No se trata de un modelo de lenguaje: son redes convolucionales de deteccion de objetos y segmentacion de instancias entrenadas para trabajar sobre radiografias panoramicas dentales. Concretamente, el repositorio publica `dentex-fdi-numbering` (segmentacion de instancias con numeracion FDI de 35 clases) y `dentex-lesion-detection` (deteccion de lesiones dentales).

Estos dos modelos forman la capa de percepcion de un agente odontologico llamado DentexAI, que segun la model card alimenta un backend multi-herramienta con RAG sobre PubMedBERT. Es decir, la parte de vision identifica dientes y patologias sobre la imagen, y esa informacion se pasa a un componente de lenguaje para generar asistencia clinica. El autor del repositorio es `beaunix` (GitHub `BeauBryanDev`), y el modelo base declarado es `Ultralytics/YOLO11`.

La relevancia del repositorio es doble. Por un lado, ofrece pesos ya entrenados para una tarea de nicho (numeracion FDI automatica) con un mAP50 reportado de 0.99, lo que lo hace directamente utilizable. Por otro, la licencia es AGPL-3.0, heredada de Ultralytics, lo que condiciona fuertemente su uso en productos propietarios. El tamano del repositorio es de aproximadamente 0.1 GB y no registra descargas ni valoraciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ultralytics YOLO11 (red convolucional para deteccion de objetos y segmentacion de instancias) |
| Parametros totales | no disponible (no se especifica la variante n/s/m/l/x) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | exportacion a ONNX incluida; no se documentan esquemas de cuantizacion concretos (INT8/FP16) |
| Idiomas soportados | no aplica (modelo de vision, sin procesamiento de lenguaje) |
| Licencia | AGPL-3.0 |
| Formato de pesos | PyTorch (`.pt`) y ONNX (`.onnx`) |
| Tarea | Segmentacion de instancias (FDI) y deteccion de objetos (lesiones) |
| Entrada | Imagenes de radiografias panoramicas dentales |
| Numero de clases | 35 (T11–T48, Bridge, Crown, Implant) en el modelo de numeracion FDI; no disponible en el de lesiones |
| Modelos incluidos | `dentex-fdi-numbering.{pt,onnx}`, `dentex-lesion-detection.{pt,onnx}` |
| Tamano del repositorio | ~0.1 GB |
| Libreria | ultralytics |
| Modelo base | Ultralytics/YOLO11 |

## Arquitectura y entrenamiento

Ambos modelos emplean la arquitectura YOLO11 de Ultralytics. En el caso de la numeracion FDI, la cabeza de red corresponde a segmentacion de instancias, lo que permite obtener la mascara de cada diente ademas de su caja delimitadora y su etiqueta FDI. El modelo de deteccion de lesiones utiliza deteccion de objetos clasica. No se detalla en la model card el numero de parametros, la resolucion de entrada, el numero de epocas ni el esquema de aumento de datos empleado, por lo que estos datos figuran como no disponibles.

En cuanto a los datos de entrenamiento, el modelo de numeracion FDI se entreno con el dataset *FDI_numbering* publicado por Md Anas en Roboflow Universe bajo licencia CC BY 4.0 (35 clases: T11–T48, Bridge, Crown, Implant). El modelo de deteccion de lesiones se entreno a partir de un archivo de dataset obtenido en Mendeley Data; el autor reconoce explicitamente en la model card que no pudo relocalizar el registro original de Mendeley y que la unica referencia superviviente es un proyecto demo de Roboflow Universe ya eliminado («dental-disease-detection-hpn1d/demo-wjml3», CC BY 4.0, descargado el 2025-03-13). Esto supone un problema de trazabilidad de datos relevante para cualquier uso en produccion.

No se documentan innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal ni similares), ya que no aplican a esta familia de modelos. No hay evidencia de un pipeline de RLHF/DPO: son modelos de vision supervisados de forma convencional.

## Capacidades

- Segmentacion de instancias con numeracion FDI de dientes en radiografias panoramicas, cubriendo 35 clases (T11–T48 y las anotaciones Bridge, Crown e Implant).
- Deteccion de lesiones dentales como tarea de deteccion de objetos.
- Inferencia tanto en PyTorch (`.pt`), lo que permite reentrenamiento o ajuste fino, como en ONNX Runtime (solo inferencia).
- Integracion con la libreria `ultralytics` mediante `YOLO("modelo.pt").predict(...)`.
- Salida apta para alimentar un backend de agente: las detecciones y numeraciones se usan como entrada a un sistema RAG sobre PubMedBERT y a un conjunto de herramientas del agente DentexAI.
- No dispone de capacidades de generacion de texto, razonamiento, codigo, matematicas, tool calling, agentes ni procesamiento multilingue; esas funciones residen en otros componentes del sistema, no en estos modelos de vision.
- No incluye capacidades de vision generativa ni multimodalidad en sentido amplio: solo deteccion y segmentacion sobre imagenes de entrada.

## Casos de uso

- Triaje automatico en clinicas dentales: dado un panoramico, el modelo de numeracion FDI etiqueta cada diente y el de lesiones marca posibles patologias, de modo que el odontologo recibe una imagen anotada antes de revisarla manualmente. El mAP50 de 0.99 en numeracion lo hace fiable para esta tarea.
- Generacion de informes asistida: la salida estructurada (diente + hallazgo) puede alimentar el componente PubMedBERT del agente DentexAI para redactar borradores de informe clinico con referencias bibliograficas.
- Control de calidad de tratamientos: identificacion automatica de clases Bridge, Crown e Implant permite auditar si el trabajo protesico documentado coincide con lo visible en la radiografia de seguimiento.
- Seguimiento longitudinal de pacientes: al numerar consistentemente los dientes entre radiografias de distintas fechas, se pueden comparar hallazgos por diente a lo largo del tiempo y detectar cambios en lesiones.
- Cribado y priorizacion en campanas de salud oral: procesado por lotes de panoramicas para clasificar casos sospechosos y priorizar la revision por especialistas en entornos con recursos limitados.
- Herramienta docente en facultades de odontologia: la anotacion automatica con numeracion FDI sirve como apoyo para que estudiantes verifiquen su propia identificacion de dientes y lesiones.
- Integracion en software de gestion de clinicas o visores DICOM: los pesos ONNX permiten incorporar la inferencia en un servicio backend ligero sin necesidad de GPU dedicada, anotando imagenes al cargarlas.
- Preanotacion para anotadores humanos: al exportar detecciones y mascaras como punto de partida, se reduce el coste de construir nuevos datasets odontologicos etiquetados.

## Benchmarks y rendimiento

Los unicos datos publicados en la model card son los siguientes. No se aportan cifras de precision, recall, mAP50-95 ni curvas de entrenamiento.

| Modelo | Tarea | Metrica | Valor |
|---|---|---|---|
| dentex-fdi-numbering | Segmentacion de instancias (numeracion FDI, 35 clases) | mAP50 | 0.99 |
| dentex-lesion-detection | Deteccion de objetos (lesiones dentales) | mAP50 | 0.617 |

No se han publicado resultados comparativos frente a otros modelos (MMLU, HumanEval, GSM8K y similares no aplican a un modelo de vision). Tampoco se incluyen comparaciones con las soluciones del DENTEX Challenge 2023.

## Requisitos de hardware

- No se especifica la variante YOLO11 utilizada (n, s, m, l o x), por lo que no es posible dar cifras exactas de VRAM. La familia YOLO11 es, en general, ligera dentro de la deteccion de objetos.
- VRAM estimada para inferencia: para variantes pequenas de la familia YOLO11 suele bastar con 1-2 GB en FP16, aunque este dato no esta confirmado para estos pesos concretos y debe considerarse orientativo.
- GPU recomendadas: una GPU consumer moderna (por ejemplo, RTX 3060, RTX 4060, RTX 4090) deberia ser mas que suficiente para la inferencia; tambien es viable ejecutar en CPU con ONNX Runtime, con mayor latencia.
- Cabe en GPU de consumo: muy probablemente si, dado el tamano del repositorio (~0.1 GB) y la familia de modelos, pero la variante exacta no esta documentada.
- Opciones de despliegue: Ultralytics (PyTorch, permite inferencia y reentrenamiento), ONNX Runtime (solo inferencia), y cualquier runtime compatible con ONNX (TensorRT, OpenVINO) mediante conversion adicional.
- Latencia y throughput: no disponible; no se aportan mediciones en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Tarea | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DentexAI (este repositorio) | Numeracion FDI + deteccion de lesiones | no disponible (variante YOLO11 sin especificar) | no aplica | AGPL-3.0 | pesos `.pt` y `.onnx` en HuggingFace |
| Ultralytics YOLO11 (modelo base) | Deteccion/segmentacion generica | 2.6M–56M segun variante n–x | no aplica | AGPL-3.0 | pesos publicos de Ultralytics |
| Frameworks del DENTEX Challenge 2023 (por ejemplo, `awerdich/dentexmodel`, `ibrahimethemhamamci/DENTEX`) | Enumeracion dental + diagnostico en panoramicos | no disponible | no aplica | no disponible en la informacion recogida | repositorios de codigo en GitHub |
| YOLOv8 ajustado para caries y lesiones periapicales (referencia de LinkedIn) | Deteccion de caries, caries profunda, lesiones periapicales y dientes impactados | no disponible | no aplica | no disponible | no disponible |

La comparacion directa con soluciones del DENTEX Challenge o con otros modelos odontologicos no puede hacerse con rigor porque no se dispone de metricas homogeneas de esos sistemas en la informacion recogida.

## Limitaciones y advertencias

- Licencia AGPL-3.0: el uso en un producto o servicio propietario obliga a liberar el codigo fuente bajo la misma licencia o a adquirir una licencia comercial de Ultralytics. El autor indica explicitamente que no se compro licencia Enterprise.
- Trazabilidad de datos deficiente en el modelo de deteccion de lesiones: el autor reconoce no recordar ni poder relocalizar el origen exacto del dataset de Mendeley. Esto compromete la reproducibilidad y puede plantear dudas sobre los derechos de uso de los datos de entrenamiento.
- Rendimiento limitado en deteccion de lesiones: un mAP50 de 0.617 es notablemente inferior al 0.99 del modelo de numeracion, por lo que las detecciones de lesiones deben tratarse como sugerencias y no como diagnostico.
- Riesgo de falsos negativos y falsos positivos clinicos: como cualquier modelo de vision medico, puede fallar en casos atipicos, imagenes de baja calidad, artefactos o anatomias poco representadas en el conjunto de entrenamiento.
- Sesgos potenciales derivados de los datasets: al proceder de fuentes de Roboflow y Mendeley con composicion demografica y de equipos desconocida, puede haber sesgos hacia ciertos tipos de radiografia, equipos o poblaciones.
- Ambito de entrada limitado: esta disenado para radiografias panoramicas dentales; no es adecuado para otras modalidades de imagen sin reentrenamiento.
- Sin capacidades de lenguaje: no genera texto ni razona; cualquier funcionalidad conversacional depende de otros componentes (PubMedBERT RAG y backend multi-herramienta) que no forman parte de este repositorio.
- Advertencia regulatoria: un sistema de deteccion de lesiones dentales con fines clinicos puede considerarse producto sanitario en muchas jurisdicciones (por ejemplo, marcado CE o aprobacion FDA), y este repositorio no aporta evidencia regulatoria alguna.
- Sin mantenimiento ni adopcion visible: cero descargas y cero valoraciones en HuggingFace en el momento de la consulta, y modelos creados y actualizados con pocos minutos de diferencia, lo que sugiere una publicacion inicial sin rodaje.
- No se documentan resoluciones de entrada, preprocesado de imagen ni umbrales de confianza recomendados, lo que dificulta reproducir exactamente las cifras de mAP reportadas.

## Enlaces

- HuggingFace: https://huggingface.co/beaunix/dentex-ai
- Repositorio del proyecto en GitHub: https://github.com/BeauBryanDev/dentex-ai/tree/master
- Ultralytics (arquitectura y tooling YOLO): https://github.com/ultralytics/ultralytics
- Dataset FDI_numbering en Roboflow Universe (Md Anas): https://universe.roboflow.com/md-anas-wwi89/fdi_numbering
- Dentex Challenge 2023 (referencia): https://github.com/awerdich/dentexmodel
- DENTEX (MICCAI 2023, Dental Enumeration): https://github.com/ibrahimethemhamamci/DENTEX
- DentX (plataforma comercial de IA dental, no relacionada directamente): https://dentx.ai/
