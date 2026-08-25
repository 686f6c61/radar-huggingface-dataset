# skblv/yolov12m-cholect50-instruments

## Resumen

El modelo `skblv/yolov12m-cholect50-instruments` es un detector de objetos basado en YOLOv12-m, entrenado específicamente para el reconocimiento de los seis instrumentos quirúrgicos presentes en el dataset CholecT50, una colección de vídeos de colecistectomía laparoscópica. Desarrollado por el usuario `skblv` en el marco de un leaderboard de comprensión de vídeo quirúrgico, el modelo se evalúa como un clasificador multi-etiqueta: un instrumento se considera presente si el detector predice al menos una caja para su clase. Está distribuido bajo licencia AGPL-3.0 y su propósito es servir como línea base de investigación, no como dispositivo médico.

El modelo se publica en HuggingFace con el pipeline de `object-detection` y la librería Ultralytics, lo que facilita su uso con las herramientas estándar de YOLO. Aunque no se proporcionan detalles sobre el número de parámetros o la arquitectura interna, la documentación de Ultralytics indica que YOLOv12 es una arquitectura centrada en la atención, lo que la distingue de las generaciones anteriores. La evaluación reportada en la model card muestra un exact match del 81.37% y un micro-F1 del 92.37% sobre el conjunto de validación de CholecT50, con intervalos de confianza al 95%. Dado su pequeño tamaño (0.0 GB en el repositorio), se trata de un modelo ligero, adecuado para experimentos y aplicaciones en entornos con recursos limitados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | YOLOv12-m (attention-centric) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, no aplica) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo de visión, no lingüístico) |
| Licencia | AGPL-3.0 |
| Formato de pesos | no disponible (posiblemente Ultralytics .pt) |

## Arquitectura y entrenamiento

YOLOv12 es una evolución de la familia YOLO que incorpora mecanismos de atención centrados en la arquitectura, mejorando la precisión y eficiencia respecto a versiones anteriores. El modelo concreto `yolov12m` es la variante de tamaño medio, entrenada de manera supervisada para detectar los seis instrumentos quirúrgicos de la tarea de reconocimiento de instrumentos del dataset CholecT50. La evaluación se realiza como presencia multi-etiqueta: para cada frame o vídeo, se determina si un instrumento está presente si el detector emite al menos una caja de predicción para su clase. No se han publicado detalles sobre el conjunto de entrenamiento específico (número de imágenes, épocas, técnicas de aumento) ni sobre el uso de técnicas como RLHF o DPO, ya que no se mencionan en la información proporcionada.

## Capacidades

- Detección de objetos en imágenes y vídeos quirúrgicos, concretamente de instrumentos laparoscópicos (grasper, bipolar, hook, scissors, clipper, irrigator) en escenarios de colecistectomía.
- Clasificación multi-etiqueta: dado un frame, el modelo puede indicar qué instrumentos están presentes, incluso si aparecen simultáneamente.
- Inferencia en tiempo real gracias a la arquitectura YOLOv12, adecuada para aplicaciones de análisis de vídeo quirúrgico.
- No soporta tool calling, razonamiento de agentes ni capacidades lingüísticas, al ser un modelo de visión puro.

## Casos de uso

- **Análisis de vídeo quirúrgico para investigación**: el modelo permite extraer automáticamente la presencia de instrumentos en grabaciones de colecistectomía, facilitando estudios sobre técnicas quirúrgicas y correlaciones con resultados clínicos.
- **Formación y evaluación de cirujanos**: durante la práctica, se puede monitorizar en tiempo real qué instrumentos usa el cirujano y comparar su actuación con protocolos establecidos, sirviendo como herramienta de retroalimentación.
- **Sistemas de asistencia en quirófano**: integrado en un pipeline de visión por computadora, el modelo puede alertar al equipo si un instrumento no esperado aparece en el campo quirúrgico, mejorando la seguridad.
- **Revisión y anotación automática de vídeos**: permite etiquetar automáticamente los instrumentos presentes en cada frame, reduciendo el trabajo manual de anotación para crear nuevos datasets.
- **Monitorización de la fase quirúrgica**: la presencia y secuencia de instrumentos puede correlacionarse con la fase de la operación (disección, corte, etc.), ayudando a segmentar el vídeo en etapas.
- **Investigación en visión computacional médica**: como modelo de referencia, sirve para comparar nuevas arquitecturas o técnicas de detección en dominios quirúrgicos, dado su tamaño reducido y fácil reproducción.

## Benchmarks y rendimiento

La evaluación se realizó sobre el conjunto de validación completo de CholecT50, reportando intervalos de confianza al 95% (bootstrap). No se han publicado comparaciones con otros modelos en la información disponible.

| Métrica | Valor (IC 95%) |
|---|---|
| Exact match (coincidencia exacta) | 81.37% (80.87–81.92) |
| Micro-averaged F1 | 92.37% (92.11–92.60) |

## Requisitos de hardware

- No se proporcionan requisitos específicos de VRAM ni de GPU en la documentación del modelo.
- Al ser un modelo YOLOv12-m (tamaño medio) y dado el pequeño tamaño del repositorio (0.0 GB), se espera que pueda ejecutarse en GPUs de consumo medio (por ejemplo, RTX 3060 o superior) con inferencia en tiempo real, aunque esto no está confirmado por el autor.
- El modelo se integra con la librería Ultralytics, que soporta tanto CPU como GPU (CUDA), y puede desplegarse en plataformas como vLLM o TGI solo si se convierte a formatos compatibles, aunque no se indican pesos en GGUF u otros formatos.
- Para un uso en producción, se recomienda probar la latencia en el hardware objetivo, ya que no se publican datos de throughput.

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos de detección de instrumentos quirúrgicos en el mismo conjunto de datos. No obstante, se puede mencionar que existen otros enfoques basados en redes tipo R-CNN o YOLO para CholecT50, pero sin datos numéricos no es posible realizar una comparación objetiva. La comparativa queda pendiente de la publicación de resultados por parte del autor.

## Limitaciones y advertencias

- **Uso exclusivo de investigación**: la model card indica explícitamente que es una línea base de investigación y no un dispositivo médico. No debe utilizarse para diagnóstico o decisiones clínicas sin validación adicional.
- **Dominio restringido**: el modelo se ha entrenado con el dataset CholecT50, que contiene únicamente vídeos de colecistectomía laparoscópica. Su rendimiento en otros tipos de cirugía o con otros instrumentos no está garantizado y puede degradarse significativamente.
- **Riesgo de falsos negativos y positivos**: como cualquier detector, puede fallar en condiciones de baja iluminación, oclusión o variaciones de la cámara, lo que afecta a la métrica de exact match.
- **Licencia AGPL-3.0**: esta licencia exige que cualquier uso o modificación del código fuente se publique bajo la misma licencia, lo que puede ser una restricción para proyectos propietarios o de uso comercial cerrado.
- **Formato de pesos no documentado**: no se especifica el formato de pesos (safetensors, GGUF, etc.), lo que puede dificultar su integración en entornos no compatibles con Ultralytics.
- **Sesgos del dataset**: el dataset CholecT50 proviene de un entorno quirúrgico específico (hospitales franceses), por lo que el modelo puede no generalizar a otros equipos o técnicas quirúrgicas.

## Enlaces

- [HuggingFace: skblv/yolov12m-cholect50-instruments](https://huggingface.co/skblv/yolov12m-cholect50-instruments)
- [Leaderboard de comprensión de vídeo quirúrgico (SDSC × Chicago Booth)](https://github.com/skblv/neurosurgery-video-eval-website)
- [Documentación de YOLOv12 de Ultralytics](https://docs.ultralytics.com/models/yolo12)
- [Dataset CholecT50 - CAMMA (Université de Strasbourg)](https://camma.unistra.fr/datasets/)
- [Referencia de CholecT50 en EmergentMind](https://www.emergentmind.com/topics/cholect50)
- [Dataset CholecT50 en Roboflow Universe](https://universe.roboflow.com/computer-vision-gflxc/cholect50/dataset/4)
