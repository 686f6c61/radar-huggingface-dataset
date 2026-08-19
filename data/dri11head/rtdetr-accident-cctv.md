# dri11heaD/rtdetr-accident-cctv

## Resumen

El modelo `dri11heaD/rtdetr-accident-cctv` es un detector de objetos especializado en la detección de accidentes de tráfico en secuencias de vídeo procedentes de cámaras CCTV. Se trata de un ajuste fino (fine-tuning) del modelo base `PekingU/rtdetr_r18vd`, desarrollado por el usuario `dri11heaD` y publicado en Hugging Face bajo licencia Apache-2.0. El modelo emplea la arquitectura RT-DETR (Real-Time Detection Transformer) con un backbone ResNet-18, lo que lo hace ligero y adecuado para inferencia en tiempo real en entornos de vigilancia.

El modelo resuelve el problema de la detección automática de incidentes viales en vídeo, una tarea crítica para sistemas de respuesta rápida y monitorización de infraestructuras urbanas. Con aproximadamente 20,1 millones de parámetros, su tamaño reducido permite su despliegue en hardware modesto, incluyendo GPUs de consumo y dispositivos perimetrales. La relevancia actual radica en la creciente demanda de soluciones de visión por computador para ciudades inteligentes y seguridad vial, donde la detección temprana de accidentes puede reducir los tiempos de respuesta de los servicios de emergencia.

La model card indica que el entrenamiento se realizó sobre un dataset no especificado (etiquetado como "None"), con 12 épocas y un esquema de aprendizaje con tasa de 5e-5 y scheduler coseno. Los resultados de evaluación muestran un mAP de 0,3966 y un mAP50 de 0,5632, con un rendimiento notablemente mejor en la clase "Accident" (mAP 0,5535) que en la clase "Non-accident" (mAP 0,2396).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RT-DETR (Real-Time Detection Transformer) con backbone ResNet-18 |
| Parametros totales | 20.109.528 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no aplica (modelo de vision, no procesa texto) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors) |
| Idiomas soportados | no aplica (modelo de vision) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

RT-DETR es un detector de objetos basado en transformer que elimina la necesidad de NMS (supresión no máxima) gracias a su mecanismo de consultas de detección. El modelo base `PekingU/rtdetr_r18vd` utiliza un backbone ResNet-18 para extraer características visuales, seguidas de un encoder-decoder transformer que predice cajas y clases directamente. Esta arquitectura está diseñada para ofrecer un equilibrio entre precisión y velocidad, siendo especialmente adecuada para aplicaciones en tiempo real.

El ajuste fino se realizó sobre un dataset no especificado en la model card (campo "None"). Se emplearon 12 épocas con un tamaño de lote de 8, tasa de aprendizaje inicial de 5e-5, optimizador AdamW con betas (0.9, 0.999), scheduler coseno con 300 pasos de calentamiento y entrenamiento con precisión mixta (AMP). El proceso generó un modelo con una pérdida final de validación de 7,3092. No se menciona el uso de técnicas como RLHF o DPO, ya que no es un modelo de lenguaje.

## Capacidades

- Detección de objetos en imágenes y vídeo, específicamente orientada a la identificación de accidentes de tráfico en secuencias de CCTV.
- Clasificación binaria de escenas en dos categorías: "Accident" y "Non-accident".
- Inferencia en tiempo real gracias a la arquitectura RT-DETR, que no requiere NMS y es eficiente computacionalmente.
- Soporte para procesamiento de vídeo por tramos (frame a frame) o de imágenes individuales.
- Compatible con el ecosistema Hugging Face Transformers, lo que facilita su integración en pipelines existentes.
- No dispone de capacidades de tool calling, generación de texto, razonamiento multimodal ni soporte de agentes, al ser un modelo puramente visual.

## Casos de uso

- Vigilancia de carreteras y autopistas: el modelo puede analizar en tiempo real las imágenes de cámaras de tráfico para detectar colisiones o incidentes, permitiendo alertar a los centros de control de tráfico de forma automática.
- Sistemas de respuesta a emergencias: integrado en plataformas de gestión de incidentes, puede reducir el tiempo de notificación a servicios de ambulancias o policía, mejorando los tiempos de llegada.
- Monitorización de intersecciones urbanas: desplegado en nodos de cámaras municipales, ayuda a identificar accidentes en cruces concurridos, facilitando la gestión del tráfico y la prevención de atascos secundarios.
- Análisis forense de vídeo: permite revisar grabaciones históricas de CCTV para localizar automáticamente momentos de accidente, ahorrando horas de revisión manual a investigadores.
- Seguros y gestión de siniestros: las aseguradoras pueden usar el modelo para verificar reclamaciones analizando vídeos de accidentes, agilizando la tramitación de partes.
- Investigación académica en visión por computador: sirve como punto de partida para experimentos sobre detección de anomalías en escenas de tráfico, dado su tamaño reducido y facilidad de ajuste.

## Benchmarks y rendimiento

Los resultados de evaluación declarados por el autor en la model card son los siguientes (métricas COCO estándar):

| Metrica | Valor |
|---|---|
| Loss (validacion) | 7,3092 |
| mAP | 0,3966 |
| mAP 50 | 0,5632 |
| mAP 75 | 0,4384 |
| mAP Small | 0,0078 |
| mAP Medium | 0,3845 |
| mAP Large | 0,4380 |
| mAR 1 | 0,4148 |
| mAR 10 | 0,6538 |
| mAR 100 | 0,7869 |
| mAR Small | 0,3633 |
| mAR Medium | 0,7854 |
| mAR Large | 0,7864 |
| mAP Accident | 0,5535 |
| mAR 100 Accident | 0,8302 |
| mAP Non-accident | 0,2396 |
| mAR 100 Non-accident | 0,7437 |

No se han publicado resultados comparativos con otros modelos en la información disponible. El modelo-index de Hugging Face está vacío, por lo que no hay benchmarks oficiales adicionales.

## Requisitos de hardware

- Al tratarse de un modelo de aproximadamente 20 millones de parámetros, la VRAM necesaria para inferencia es reducida. Con precisión FP32, el peso ocupa unos 80 MB, por lo que cualquier GPU con al menos 2 GB de VRAM puede ejecutarlo sin problemas.
- Es viable su ejecución en GPUs de consumo como NVIDIA GTX 1050 Ti, RTX 2060, RTX 3060 o superiores. También puede ejecutarse en CPU, aunque con menor rendimiento en tiempo real.
- Para despliegue en producción, se recomienda usar el pipeline de `transformers` con PyTorch, o exportar a ONNX para aceleración con TensorRT o OpenVINO.
- No se dispone de datos de latencia o throughput específicos para este modelo, pero la arquitectura RT-DETR r18vd está diseñada para alcanzar velocidades de decenas de FPS en GPUs modernas.
- Opciones de despliegue: Hugging Face Inference Endpoints, servicios gestionados, o integración en aplicaciones propias mediante la librería `transformers`.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa cuantitativa con otros modelos de detección de accidentes en CCTV. Sin embargo, se puede contextualizar frente a alternativas genéricas de detección de objetos:

| Modelo | Parametros | Arquitectura | mAP (COCO) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rtdetr-accident-cctv (este) | 20,1 M | RT-DETR r18vd | 0,3966 (en su dataset) | Apache-2.0 | Hugging Face |
| YOLOv8n | 3,2 M | CNN | ~0,37 (COCO) | AGPL-3.0 | Ultralytics |
| DETR (ResNet-50) | 41 M | Transformer | ~0,42 (COCO) | Apache-2.0 | Hugging Face |

Nota: los valores de mAP para YOLOv8n y DETR corresponden a benchmarks públicos en COCO, no a la tarea específica de accidentes. La comparación directa no es posible sin evaluar todos los modelos en el mismo dataset de accidentes.

## Limitaciones y advertencias

- El dataset de entrenamiento no está documentado, lo que impide conocer la distribución de clases, el número de imágenes o la procedencia de los datos. Esto dificulta evaluar la generalización del modelo a entornos distintos de los de entrenamiento.
- El rendimiento en objetos pequeños es muy bajo (mAP Small de 0,0078), lo que limita su utilidad en escenas donde los accidentes aparecen a gran distancia o con baja resolución.
- La clase "Non-accident" presenta un mAP notablemente inferior (0,2396) a la clase "Accident" (0,5535), lo que sugiere un desequilibrio en el conjunto de datos o dificultades para distinguir escenas sin incidentes.
- No se han publicado análisis de sesgos ni pruebas de robustez ante condiciones adversas (clima, iluminación, oclusiones). Es probable que el modelo herede sesgos del dataset de entrenamiento, que no se especifica.
- La licencia Apache-2.0 permite uso comercial, pero el usuario debe verificar que los datos de entrenamiento no tengan restricciones adicionales, ya que no se han revelado.
- Al ser un modelo de visión sin capacidades de razonamiento contextual, puede generar falsos positivos en escenas con vehículos detenidos o maniobras bruscas que no constituyan accidentes.
- No se proporcionan pesos cuantizados (GGUF, ONNX, etc.), por lo que el despliegue en dispositivos muy limitados requerirá conversión manual.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dri11heaD/rtdetr-accident-cctv
- Documentación de RT-DETR en Transformers: https://huggingface.co/docs/transformers/model_doc/rt_detr
- Documentación de RT-DETR (versión anterior): https://huggingface.co/docs/transformers/v4.53.3/model_doc/rt_detr
- Modelo base: https://huggingface.co/PekingU/rtdetr_r18vd
- Repositorio de referencia sobre detección de accidentes en CCTV (no afiliado): https://github.com/Shivaay2003/ACCIDENT-DETECTION-FROM-CCTV-FOOTAGE
