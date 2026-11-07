# JustViping/team-qh-005-wathba-yolov8n-pose

## Resumen

Wathba YOLOv8n-pose es un ajuste fino (fine-tune) del modelo de estimación de pose YOLOv8n-pose de Ultralytics, desarrollado por el usuario JustViping en el marco del hackathon Qai × Hugging Face celebrado en Doha en noviembre de 2026. El modelo se entrenó específicamente para detectar personas y localizar articulaciones de las piernas (cadera, rodilla y tobillo) en fotografías reales de ejercicios físicos, con el objetivo de servir como componente de selección de persona y respaldo del modelo MoveNet dentro de Wathba, un prototipo de fisioterapia basado en navegador.

El problema que aborda es concreto: en una aplicación de fisioterapia que evalúa la postura del paciente mediante visión por computador, la detección fiable de la persona y de sus articulaciones inferiores es crítica. El modelo base YOLOv8n-pose, entrenado sobre MPII Human Pose, rendía de forma insuficiente en fotografías de ejercicios de resistencia, calistenia y estiramientos. Este fine-tune mejora la precisión de las articulaciones de la pierna en 4,9 puntos porcentuales (PCKh@0,5 de 51,1% a 55,9%) y la tasa de personas detectadas en 2,5 puntos, manteniendo el mismo coste de inferencia en CPU (100 ms por imagen).

Se trata de un modelo muy pequeño (variante "n" de YOLOv8, la más ligera de la familia), orientado a inferencia en navegador mediante exportación a ONNX, con una salida de forma `[1, 56, 8400]`. No es un modelo de lenguaje ni un modelo multimodal generativo: es un detector de keypoints de una sola etapa, y su relevancia radica en demostrar un flujo completo de fine-tuning, evaluación con regla de aceptación predefinida y despliegue web para un caso de uso sanitario concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOv8n-pose (detector de keypoints de una etapa, CNN, familia Ultralytics YOLOv8) |
| Parametros totales | no disponible (variante "nano" de YOLOv8-pose; el repo ocupa 0.0 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada de imagen 640×640) |
| Tipos de cuantizacion | ONNX cuantizado (`model_quantized.onnx`) además de pesos completos (`best.pt`, `model.onnx`) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | AGPL-3.0 (pesos, heredada de Ultralytics YOLOv8) |
| Formato de pesos | PyTorch (`best.pt`), ONNX (`model.onnx`, `model_quantized.onnx`) |

## Arquitectura y entrenamiento

El modelo es un fine-tune del checkpoint `Xenova/yolov8n-pose`, es decir, la variante nano de YOLOv8-pose ya convertida a formatos compatibles con el ecosistema Transformers.js/ONNX. YOLOv8-pose es un detector de una etapa que predice simultáneamente cajas delimitadoras de personas y un conjunto de keypoints asociados; la salida `output0` con forma `[1, 56, 8400]` es coherente con la codificación estándar de YOLOv8-pose (4 coordenadas de caja + 1 puntuación de persona + 17 keypoints × 3 valores de x, y, confianza, distribuidos en 8400 anclas).

El entrenamiento se realizó sobre 1.264 imágenes de entrenamiento y 150 de validación extraídas de la categoría "conditioning exercise" del dataset MPII Human Pose. Las actividades de validación (ejercicio en casa, pilates) se reservaron por tipo para evitar fuga de información. El preprocesado estira las imágenes a 640×640 para replicar exactamente la entrada de la aplicación Wathba, y las personas sin etiquetar se enmascararon usando el modelo previo para localizarlas. La configuración fue de 50 épocas en una instancia `a10g-small`, optimizador AdamW con tasa de aprendizaje 0,0008 y backbone congelado (`freeze=10`). El autor documenta que la regla de aceptación se escribió en `pass_rule.json` antes de iniciar el entrenamiento y que el modelo la superó.

## Capacidades

- Detección de personas en imágenes: localiza cajas delimitadoras de personas con umbral de persona 0,5 y NMS 0,5, configuración idéntica a la de la aplicación de destino.
- Estimación de keypoints de pose humana: 17 puntos clave por persona según el esquema de YOLOv8-pose, con especial atención a las articulaciones de cadera, rodilla y tobillo.
- Selección de la persona principal: en Wathba el modelo encuentra y selecciona a la persona relevante de la escena, mientras MoveNet realiza el seguimiento continuo.
- Inferencia en navegador: exportación ONNX y ONNX cuantizado pensadas para ejecutarse en el cliente web, con un coste medido de 100 ms por imagen en CPU.
- Funcionamiento como respaldo de MoveNet: actúa como modelo secundario cuando el seguimiento principal falla o necesita reanclaje.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es exclusivamente un modelo de visión para detección de pose.

## Casos de uso

- Aplicación de fisioterapia asistida por webcam: el modelo detecta a la persona y sus articulaciones inferiores en cada fotograma clave, permitiendo a Wathba evaluar la alineación de cadera, rodilla y tobillo durante ejercicios guiados. Su ventana de 640×640 y sus 100 ms en CPU lo hacen viable en un navegador sin GPU.
- Corrección postural en ejercicios de resistencia: en sesiones de entrenamiento con pesas, el modelo localiza las piernas para comprobar ángulos articulares y detectar desviaciones, aprovechando su entrenamiento específico en la categoría "conditioning exercise" de MPII.
- Seguimiento de rutinas de calistenia y estiramientos: las actividades de validación reservadas por tipo (ejercicio en casa, pilates) demuestran capacidad de generalización a rutinas no vistas durante el entrenamiento.
- Respaldo de seguimiento en tiempo real: integrado junto a MoveNet, el modelo reancla la detección cuando el tracker principal pierde la persona, mejorando la robustez del pipeline de la aplicación.
- Prototipado rápido de aplicaciones de visión en el navegador: al estar exportado a ONNX y ONNX cuantizado, puede desplegarse con Transformers.js o runtime ONNX Web sin infraestructura de servidor.
- Investigación en estimación de pose con datasets pequeños: el repositorio incluye `split.json`, `pass_rule.json`, `results.csv` y los JSON de evaluación previa y posterior, lo que permite reproducir el experimento y auditar la metodología.
- Evaluación comparativa de modelos ligeros de pose: sirve como referencia de hasta dónde llega un YOLOv8n-pose ajustado frente a MoveNet en un dominio concreto como el ejercicio físico.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre 328 fotos de 436 personas, con tipos de actividad excluidos del entrenamiento (entrenamiento de resistencia, calistenia y estiramientos suaves), entrada estirada a 640×640, umbral de persona 0,5 y NMS 0,5:

| Medida | Modelo previo | Este modelo | Cambio |
|---|---|---|---|
| PCKh@0,5 de cadera, rodilla y tobillo | 51,1% | 55,9% | +4,9 pts (IC 95%: +2,1 a +7,7) |
| Personas encontradas | 88,3% | 90,8% | +2,5 pts |
| Articulaciones de pierna usables en la app (confianza ≥ 0,5) | 50,0% | 55,3% | +5,3 pts |
| Tiempo de CPU por imagen | 100 ms | 100 ms | sin cambio |
| Personas encontradas, modelo cuantizado | 85,6% | 90,4% | +4,8 pts |

El autor reporta además una métrica que empeoró: sobre la distancia predicha frente a la real de cadera a tobillo (301 personas detectadas por ambos modelos), el error medio mejoró de 0,44 a 0,42 longitudes de cabeza, pero el R² cayó de 0,793 a 0,755; el nuevo modelo fue más preciso en 166 de las 301 personas, pero acumuló 7 fallos por encima de tres longitudes de cabeza frente a 4 del modelo previo. No se han publicado resultados en benchmarks estándar (COCO, MPII completo) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño del repositorio (0,0 GB) y la variante nano, el modelo es del orden de pocos megabytes en ONNX cuantizado, por lo que cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: el autor validó el entrenamiento en una instancia `a10g-small`; para inferencia basta CPU, GPU integrada o cualquier GPU dedicada moderna (RTX 3060 en adelante) sin requisitos especiales.
- Cabe en GPU consumer: sí, en cualquier GPU consumer; el caso de uso principal es la inferencia en navegador sin GPU dedicada.
- Opciones de despliegue: Ultralytics (pesos `best.pt`), ONNX Runtime, ONNX Runtime Web / Transformers.js para navegador, y cualquier runtime compatible con ONNX. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: 100 ms por imagen en CPU según la medición del autor; no se reporta throughput en GPU.

## Comparativa con modelos similares

| Modelo | Tipo | Tamano | Contexto/entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Wathba YOLOv8n-pose (este modelo) | YOLOv8n-pose fine-tuneado | variante nano | imagen 640×640 | PCKh@0,5 piernas 55,9% en su conjunto de test | AGPL-3.0 | Hugging Face |
| YOLOv8n-pose base (Xenova) | YOLOv8n-pose | variante nano | imagen 640×640 | PCKh@0,5 piernas 51,1% en el mismo test | AGPL-3.0 | Hugging Face |
| YOLOv8s-pose | YOLOv8-pose variante small | mayor que nano | imagen 640×640 | no disponible en la información | AGPL-3.0 | Ultralytics Platform |
| YOLOv8x-pose | YOLOv8-pose variante extra-large | mucho mayor que nano | imagen 640×640 | no disponible en la información | AGPL-3.0 | Ultralytics Platform |

No se dispone de datos de benchmarks comparables para las variantes small y extra-large en la información proporcionada; la comparación directa solo es posible frente al modelo base, sobre el que este fine-tune mejora 4,9 puntos de PCKh@0,5 en articulaciones de pierna con idéntico coste de CPU.

## Limitaciones y advertencias

- No es un dispositivo médico ni está validado clínicamente; el propio autor lo advierte de forma explícita.
- Las fotos de test son fotografías generales de ejercicio, no pacientes con lesión de ligamento cruzado anterior ni grabaciones de rehabilitación reales.
- El modelo no se ha probado todavía con el material audiovisual propio de Wathba.
- La evaluación usa una única partición fija de 328 fotos, por lo que las diferencias pequeñas pueden ser ruido estadístico.
- MPII no incluye etiquetas faciales: los puntos de la cara provienen de predicciones confiadas del modelo previo, por lo que no se hace ninguna afirmación sobre la precisión facial.
- La licencia de los pesos es AGPL-3.0, heredada de Ultralytics YOLOv8, lo que impone obligaciones de copyleft sobre el código que los utilice en red.
- Las anotaciones de MPII Human Pose son solo para investigación y no permiten uso comercial, ya que los autores no poseen los derechos de las imágenes; debe revisarse este punto antes de cualquier uso comercial del modelo.
- Riesgo de sesgo y alucinación: no se documentan análisis de sesgo demográfico ni de robustez ante condiciones de iluminación, oclusión o diversidad corporal; como todo detector de pose, puede producir falsos positivos y keypoints erróneos con confianza alta.
- No se especifican idiomas soportados porque el modelo no procesa texto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JustViping/team-qh-005-wathba-yolov8n-pose
- Demo de la aplicación Wathba: https://huggingface.co/spaces/JustViping/team-qh-005-wathba-app
- Blog del proyecto Wathba: https://huggingface.co/spaces/JustViping/wathba-blog
- Modelo base: https://huggingface.co/Xenova/yolov8n-pose
- Dataset MPII Human Pose (Voxel51): https://huggingface.co/datasets/Voxel51/MPII_Human_Pose_Dataset
- YOLOv8x Pose en Ultralytics Platform: https://platform.ultralytics.com/wasp-beaver/yolov8/yolov8x-pose
- YOLOv8s Pose en Ultralytics Platform: https://platform.ultralytics.com/a-qaq/yolov8/yolov8s-pose
- Proyecto doctoral de Carla Marina Baptista Ribeiro (Universidad de Gante): https://research.ugent.be/web/result/project/14a1c950-b736-11f1-94a9-01e29ca2d42c/team/en
