# JustViping/team-qh-005-wathba-yolov8n-pose-round2

## Resumen

Wathba YOLOv8n-pose round 2 es un modelo de estimacion de pose humana derivado de Xenova/yolov8n-pose, afinado por el equipo JustViping para el prototipo de fisioterapia Wathba durante el hackathon Qai × Hugging Face celebrado en Doha en noviembre de 2026. El modelo detecta puntos clave corporales (keypoints) sobre imagenes de ejercicio fisico, con enfasis en la cadena articular cadera-rodilla-tobillo, y se distribuye en formato PyTorch (`best.pt`) y ONNX, incluida una variante cuantizada. Su relevancia es acotada: es un artefacto de investigacion de un hackathon, no un producto clinico, y el propio equipo decidio no integrarlo en la aplicacion final.

La arquitectura subyacente es YOLOv8n-pose, un detector de un solo paso con cabeza de keypoints, en su variante "nano" (la mas pequena de la familia YOLOv8). El afinamiento de la segunda ronda descongelo el backbone, entreno 100 epocas con tasa de aprendizaje 0,0003 sobre 1.264 fotos de ejercicio del dataset MPII Human Pose y optimizo la precision de las articulaciones de la pierna medida como PCKh@0.5. El resultado en el conjunto de test bloqueado (328 fotos) es del 60,3 % en cadera, rodilla y tobillo, frente al 51,1 % del modelo original, pero con una perdida notable de robustez en video real del dominio objetivo.

La ficha debe leerse con cautela: el modelo mejora en fotos estaticas de ejercicio generico y empeora en el metraje propio del equipo (perdida de seguimiento en el 21-28 % de los fotogramas frente al 0-2 % de la ronda 1). Se publica como evidencia de un proceso experimental, no como componente listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOv8n-pose (detector de un solo paso con cabeza de keypoints, variante nano) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | ONNX cuantizado (`model_quantized.onnx`); esquema de cuantizacion no especificado |
| Idiomas soportados | no aplica (modelo de vision) |
| Licencia | AGPL-3.0 (heredada de Ultralytics YOLOv8) |
| Formato de pesos | PyTorch (`best.pt`), ONNX (`model.onnx`), ONNX cuantizado (`model_quantized.onnx`) |
| Entrada / salida | Tensor de imagen; salida `output0` con forma `[1, 56, 8400]` |
| Tamano del repositorio | 0.1 GB |
| Modelo base | Xenova/yolov8n-pose |
| Dataset de entrenamiento | Voxel51/MPII_Human_Pose_Dataset (1.264 fotos de ejercicio) |

## Arquitectura y entrenamiento

El modelo parte de Xenova/yolov8n-pose, una exportacion del YOLOv8n-pose de Ultralytics. YOLOv8 es una familia de detectores ancla-libres con asignacion dinamica de etiquetas y una cabeza desacoplada; la variante "pose" anade una rama que predice keypoints sobre cada persona detectada. La salida `[1, 56, 8400]` corresponde a 8.400 predicciones candidatas, cada una con 4 coordenadas de caja, 1 puntuacion de objeto y 17 keypoints (x, y, visibilidad), consistente con el esquema COCO de 17 puntos.

El entrenamiento de la segunda ronda descongelo el backbone y ejecuto 100 epocas con tasa de aprendizaje 0,0003 (la ronda 1 mantuvo el backbone congelado, 50 epocas y 0,0008). Se compararon dos ejecuciones: la A, solo con 1.264 fotos de ejercicio, y la B, con 1.264 fotos de ejercicio mas 3.540 de deporte. La seleccion se hizo exclusivamente sobre 150 fotos de validacion (PCKh@0.5 de pierna: 60,0 % en A frente a 57,1 % en B), con la regla de aceptacion (`pass_rule.json`) fijada antes de entrenar y el conjunto de test bloqueado hasta una unica evaluacion final. No se documenta uso de RLHF ni tecnicas de alineacion, por tratarse de un modelo de vision supervisado.

## Capacidades

- Deteccion de personas y estimacion de pose multijugador en imagenes (17 keypoints por persona).
- Localizacion de articulaciones de la pierna (cadera, rodilla, tobillo) con precision medida en PCKh@0.5.
- Estimacion de la cadena cadera-tobillo, con R² de 0,883 y error medio de 0,34 cabezas en el subconjunto de 297 personas detectadas por los tres modelos comparados.
- Inferencia en formato ONNX, apta para despliegue en entornos sin PyTorch.
- Variante cuantizada para reducir requisitos de computo (con perdida de 0,7 puntos en personas detectadas frente a la ronda 1).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues.
- No hay garantia de precision en puntos faciales: MPII no incluye etiquetas de cara y el modelo no reclama exactitud en esa region.

## Casos de uso

- Analisis de forma en ejercicios de fisioterapia: el modelo puede extraer keypoints de cadera, rodilla y tobillo en fotogramas de video de sentadillas para calcular angulos articulares, si bien la perdida de seguimiento observada en metraje real limita su uso directo sin un tracker auxiliar.
- Prototipado rapido de pipelines de pose: al ofrecer pesos PyTorch y ONNX con la misma forma de salida que el modelo original, permite sustituir el detector en un pipeline existente sin cambiar el codigo de post-proceso.
- Evaluacion comparativa de estrategias de fine-tuning: sirve como referencia documentada de como afecta descongelar el backbone y ampliar epocas a la precision por articulacion y a la robustez en video.
- Despliegue en entornos con recursos limitados: la variante ONNX cuantizada y el tamano nano del modelo permiten inferencia en CPU o GPUs de gama baja para demos y pruebas de concepto.
- Investigacion sobre sesgo de dominio en pose estimation: el contraste entre mejora en fotos de ejercicio generico y degradacion en video de sentadillas del propio equipo es un caso de estudio util para quien disene conjuntos de validacion.
- Educacion y experimentacion con Ultralytics: el repositorio incluye el modelo en tres formatos, lo que facilita su uso en cursos y talleres sobre vision por computador.
- No se recomienda su uso en aplicaciones clinicas, diagnostico ni seguimiento de pacientes reales sin validacion adicional.

## Benchmarks y rendimiento

Resultados sobre 328 fotos de test bloqueadas de 436 personas, con tipos de actividad excluidos del entrenamiento:

| Medida | Original | Ronda 1 | Ronda 2 |
|---|---|---|---|
| PCKh@0.5 cadera, rodilla y tobillo | 51,1 % | 55,9 % | 60,3 % |
| Personas encontradas | 88,3 % | 90,8 % | 90,4 % |
| Articulaciones de pierna usables en la app | 50,0 % | 55,3 % | 59,7 % |
| Personas encontradas, modelo cuantizado | 85,6 % | 90,4 % | 89,7 % |
| R² cadera-tobillo (297 personas) | 0,848 | 0,822 | 0,883 |
| Error medio cadera-tobillo (cabezas) | 0,42 | 0,39 | 0,34 |

Validacion interna (150 fotos):

| Ejecucion | Fotos de entrenamiento | PCKh@0.5 de pierna |
|---|---|---|
| A (ganadora) | 1.264 de ejercicio | 60,0 % |
| B | 1.264 de ejercicio + 3.540 de deporte | 57,1 % |
| Modelo original | ninguna | 47,4 % |

Prueba sobre metraje propio (4 videos de sentadillas, 1.401 fotogramas; porcentaje de fotogramas con la persona seguida):

| Modelo | Seguimiento normal | Solo YOLO |
|---|---|---|
| Original | 99,0 % | 98,9 % |
| Ronda 1 | 98,4 % | 95,9 % |
| Ronda 2 (A) | 94,1 % | 87,6 % |
| Ejecucion B | 92,9 % | 83,5 % |

Frente a la ronda 1, la precision de pierna sube 4,4 puntos (intervalo del 95 %: +2,1 a +6,6), las personas encontradas bajan 0,5 puntos (dentro del limite de 1 punto) y la velocidad cae un 3 % (dentro del limite del 10 %). En el metraje propio, la ronda 2 pierde la persona en el 21-28 % de los fotogramas frente al 0-2 % de la ronda 1.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; por el tamano nano del modelo y el repositorio de 0,1 GB, es esperable un consumo bajo, del orden de cientos de MB a 1-2 GB segun lote y backend, aunque el autor no publica cifras.
- GPU recomendadas: no disponibles en la informacion proporcionada; el modelo nano es compatible con GPUs de consumo y con CPU.
- Cabe en GPU de consumo: si, por el perfil de un YOLOv8n; no se especifican modelos concretos.
- Opciones de despliegue: Ultralytics (libreria declarada), ONNX Runtime para los ficheros `.onnx` y `.onnx` cuantizado; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de vision.
- Latencia y throughput: no disponibles; solo se indica que la ronda 2 es un 3 % mas lenta que la ronda 1 en el entorno de evaluacion del equipo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | PCKh@0.5 pierna (test) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Wathba YOLOv8n-pose round 2 | no disponible (nano) | imagen, salida `[1, 56, 8400]` | 60,3 % | AGPL-3.0 | Hugging Face |
| Xenova/yolov8n-pose (original) | no disponible (nano) | imagen, salida `[1, 56, 8400]` | 51,1 % | AGPL-3.0 | Hugging Face |
| Wathba round 1 (no publicado como repo independiente en la informacion disponible) | no disponible | imagen | 55,9 % | AGPL-3.0 | no disponible |
| YOLOv8-pose de Ultralytics (familia) | variantes n/s/m/l/x | imagen | no disponible | AGPL-3.0 | GitHub / Ultralytics |

No se dispone de datos de benchmarks de otras familias de pose estimation (por ejemplo, MediaPipe o RTMPose) en la informacion proporcionada, por lo que no se incluyen comparaciones con ellas.

## Limitaciones y advertencias

- No es un dispositivo medico ni esta validado clinicamente; el autor lo declara explicitamente.
- El conjunto de test son fotos de ejercicio generico, no pacientes con lesion de ligamento cruzado anterior ni metraje de rehabilitacion.
- Las mismas 328 fotos de test se usaron en la ronda 1 y en la ronda 2, por lo que ya se han empleado dos veces (nunca para entrenar ni para elegir entre ejecuciones).
- Frente a la ronda 1, 118 fotos mejoraron, 148 quedaron igual y 62 empeoraron.
- Solo se evaluo la ejecucion ganadora; no hay resultado de test para la ejecucion B.
- MPII no tiene etiquetas faciales: los puntos de cara provienen de predicciones confiadas del modelo original y no se reclama precision en esa region.
- En metraje propio del equipo, la ronda 2 pierde el seguimiento de la persona en el 21-28 % de los fotogramas (frente al 0-2 % de la ronda 1); la causa no se conoce y el modelo no se integro en la aplicacion.
- La prueba en video cubre solo 4 videos y mide si se encuentra a la persona, no la precision articular.
- La cuantizacion reduce en 0,7 puntos las personas detectadas frente a la ronda 1, sin que ese criterio formara parte de la regla de aceptacion.
- Licencia de pesos AGPL-3.0, heredada de Ultralytics: impone obligaciones de copyleft en servicios en red.
- Los datos de entrenamiento (anotaciones de MPII Human Pose) son solo para investigacion y no permiten uso comercial, ya que los autores no poseen los derechos de las imagenes.
- Riesgo de alucinacion no aplica en el sentido de generacion de texto, pero si existe riesgo de predicciones de keypoints erroneas con alta confianza en dominios no vistos.
- No hay informacion sobre sesgos demograficos ni sobre el rendimiento por genero, edad, complexion o condicion fisica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JustViping/team-qh-005-wathba-yolov8n-pose-round2
- Repositorio de la ronda 1: https://huggingface.co/JustViping/team-qh-005-wathba-yolov8n-pose/tree/main
- Aplicacion Wathba: https://huggingface.co/spaces/JustViping/team-qh-005-wathba-app
- Blog del proyecto: https://huggingface.co/spaces/JustViping/wathba-blog
- Modelo base: https://huggingface.co/Xenova/yolov8n-pose
- Dataset MPII Human Pose (Voxel51): https://huggingface.co/datasets/Voxel51/MPII_Human_Pose_Dataset
- Repositorio de referencia YOLOv8-pose: https://github.com/Sadat75/ultralytics_yolov8_pose
