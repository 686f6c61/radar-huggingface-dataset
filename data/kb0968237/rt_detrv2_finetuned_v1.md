# kb0968237/rt_detrv2_finetuned_v1

## Resumen

El modelo `kb0968237/rt_detrv2_finetuned_v1` es un detector de objetos basado en RT-DETRv2, desarrollado por el usuario kb0968237 mediante un proceso de fine-tuning sobre el modelo base `PekingU/rtdetr_v2_r50vd`. Este modelo hereda la arquitectura Real-Time Detection Transformer (RT-DETR) de segunda generación, que combina la precisión de los detectores basados en transformers con la velocidad necesaria para aplicaciones en tiempo real, posicionándose como una alternativa competitiva frente a las familias YOLO.

El modelo ha sido ajustado sobre un conjunto de datos no especificado en la documentación disponible, con métricas de evaluación que muestran un rendimiento notable en la detección de objetos en distintas categorías como contenedores, manos y brazos robóticos. Con aproximadamente 42,9 millones de parámetros, el modelo está optimizado para su despliegue en entornos de inferencia en tiempo real, siendo compatible con la librería transformers de Hugging Face y con formato de pesos safetensors. Su licencia Apache 2.0 permite un uso comercial sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RT-DETRv2 (Real-Time Detection Transformer) con backbone ResNet-50 |
| Parametros totales | 42.869.429 |
| Parametros activos | no disponible |
| Longitud de contexto | no aplicable (modelo de vision) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplicable (modelo de vision) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

RT-DETRv2 es un detector de objetos en tiempo real basado en la arquitectura Transformer, presentado como una mejora sobre RT-DETR (publicado en CVPR 2024). La arquitectura introduce un mecanismo de extracción de características multiescala selectiva, que permite al modelo procesar eficientemente diferentes resoluciones de imagen. Además, incorpora un operador de muestreo discreto que facilita el despliegue en un mayor rango de plataformas de hardware, incluyendo aquellas con soporte limitado para operadores de muestreo continuo. Las estrategias de entrenamiento incluyen la mejora dinámica de datos y el uso de hiperparámetros adaptativos a la escala, lo que contribuye a un equilibrio entre precisión y velocidad de inferencia.

El modelo fue fine-tuneado sobre el modelo base `PekingU/rtdetr_v2_r50vd` durante 10 épocas, con un tamaño de lote de 6, una tasa de aprendizaje de 0.0001 y el optimizador AdamW. El entrenamiento se realizó con precisión mixta (AMP). El conjunto de datos de entrenamiento no se ha especificado en la documentación del modelo, aunque las métricas de evaluación detalladas sugieren que incluye categorías como contenedores, manos y objetos relacionados con brazos robóticos.

## Capacidades

- **Detección de objetos en tiempo real**: el modelo es capaz de localizar y clasificar objetos en imágenes con una velocidad de procesamiento adecuada para aplicaciones en tiempo real.
- **Detección multiescala**: gracias a la arquitectura RT-DETRv2, el modelo maneja objetos de diferentes tamaños, aunque las métricas indican un rendimiento significativamente mejor en objetos grandes y medianos frente a los pequeños.
- **Clasificación de categorías específicas**: el fine-tuning ha optimizado el modelo para detectar clases concretas, como contenedores, manos, brazos robóticos y objetos de desecho.
- **Compatibilidad con el ecosistema Hugging Face**: se integra con la librería `transformers` y es compatible con pipelines de detección de objetos, lo que facilita su uso en proyectos Python.
- **Sin capacidades de lenguaje**: no se trata de un modelo multimodal; no procesa texto ni admite tool calling, agentes o razonamiento de lenguaje.

## Casos de uso

- **Detección de residuos en plantas de reciclaje**: el modelo puede integrarse en sistemas de visión por computador para clasificar y detectar objetos de basura en cintas transportadoras, mejorando la automatización de procesos de separación de residuos.
- **Robótica de manipulación**: dado que ha sido entrenado para detectar "brazos robóticos" y "manos", puede utilizarse en entornos industriales para guiar a robots en tareas de recogida y colocación de objetos.
- **Vigilancia y seguridad**: su capacidad de detección de objetos en tiempo real permite su uso en sistemas de videovigilancia para identificar objetos de interés en escenas de alta densidad.
- **Automatización de almacenes**: el modelo puede utilizarse en sistemas de gestión de inventario para detectar contenedores y cajas en estanterías o en tránsito, facilitando la logística y el control de stock.
- **Control de calidad en manufactura**: en líneas de producción, el modelo puede detectar defectos o la presencia/ausencia de componentes específicos (como piezas clasificadas como "trash" o "trash arm") en tiempo real.
- **Investigación académica**: al estar basado en una arquitectura puntera y ser de código abierto, sirve como base para experimentos de detección de objetos en entornos académicos, permitiendo a los investigadores reproducir resultados y probar nuevas técnicas de entrenamiento.

## Benchmarks y rendimiento

Los resultados de evaluación reportados por el autor del modelo (obtenidos del model-index de la model card) son los siguientes:

| Metrica | Valor |
|---|---|
| Loss | 9.1139 |
| mAP (0.5:0.95) | 0.4611 |
| mAP 50 | 0.6046 |
| mAP 75 | 0.5363 |
| mAP Small | 0.0028 |
| mAP Medium | 0.2985 |
| mAP Large | 0.4702 |
| mAR 1 | 0.4663 |
| mAR 10 | 0.7033 |
| mAR 100 | 0.733 |
| mAR Small | 0.3 |
| mAR Medium | 0.5601 |
| mAR Large | 0.7465 |

Estos resultados corresponden a la evaluación final tras las 10 épocas de entrenamiento. La tabla de resultados por época muestra una mejora progresiva hasta la época 5, con una ligera estabilización posterior. Las métricas desglosadas por clase (bin, hand, trash, trash arm, etc.) indican un rendimiento sólido en las categorías principales (p.ej., mAP bin: 0.7813, mAP trash arm: 0.8052) pero con una caída significativa en categorías negativas (mAP not bin: 0.1528, mAP not hand: 0.0014), lo que sugiere que el modelo es muy específico en su detección.

## Requisitos de hardware

- **VRAM estimada**: el modelo tiene aproximadamente 42,9 millones de parámetros y un tamaño de pesos de 0.2 GB. Para inferencia en FP32, se estima un uso de VRAM de al menos 0.5-1 GB, mientras que con cuantización a FP16 o INT8 se reduciría aún más.
- **GPU recomendadas**: cualquier GPU con al menos 2 GB de VRAM puede ejecutar el modelo sin problemas. Se recomienda una GPU de consumo como la NVIDIA GTX 1650 o superior para una inferencia fluida. Para aplicaciones en tiempo real con alta resolución de imagen, se recomienda una RTX 3060 o superior.
- **Compatibilidad con GPUs de consumo**: sí, el modelo cabe en la mayoría de las GPUs de consumo, incluidas las integradas en portátiles con al menos 4 GB de VRAM.
- **Opciones de despliegue**: al ser compatible con `transformers`, puede desplegarse mediante la API de Hugging Face, así como con librerías de inferencia como ONNX Runtime, TensorRT o el framework de despliegue de NVIDIA Triton. También se puede usar con vLLM para aplicaciones de alta concurrencia, aunque este es más común para LLMs.
- **Latencia y throughput**: no se han publicado datos de rendimiento específicos para este modelo, pero RT-DETRv2 está diseñado para alcanzar velocidades de inferencia superiores a 30 FPS en GPUs de gama media.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | mAP (COCO) | Licencia | Formato |
|---|---|---|---|---|---|
| **rt_detrv2_finetuned_v1** | 42,9 M | RT-DETRv2 (R50) | no disponible | Apache 2.0 | safetensors |
| **PekingU/rtdetr_v2_r50vd** | 42,9 M | RT-DETRv2 (R50) | 54,7 % | Apache 2.0 | safetensors |
| **YOLOv8m** | 25,9 M | CNN (CSPDarknet) | 50,2 % | AGPL-3.0 | PyTorch |
| **DETR ResNet-50** | 41,6 M | Transformer | 42,0 % | Apache 2.0 | PyTorch |

La comparación directa con el modelo base muestra que el fine-tuning específico ha adaptado el modelo a un dominio concreto, sacrificando el rendimiento general de COCO (54,7 % de mAP en el modelo base) para obtener un mejor rendimiento en las categorías objetivo. Frente a YOLOv8, el modelo ofrece una arquitectura basada en Transformer que puede resultar más flexible para ciertos escenarios, mientras que YOLOv8 sigue siendo más rápido y ampliamente desplegado en la industria. RT-DETR, por su parte, es una arquitectura más antigua y menos optimizada que RT-DETRv2.

## Limitaciones y advertencias

- **Dependencia del dataset de fine-tuning**: el modelo ha sido ajustado sobre un dataset desconocido, lo que limita su generalización a otras clases de objetos o dominios diferentes a los de su entrenamiento.
- **Rendimiento en objetos pequeños**: las métricas indican un rendimiento muy bajo en objetos pequeños (mAP Small: 0.0028), por lo que no es adecuado para escenarios donde se requiera detectar objetos de pequeño tamaño.
- **Rendimiento desequilibrado entre clases**: existe una gran disparidad en el rendimiento entre categorías (p.ej., "not hand" tiene mAP 0.0014), lo que sugiere que el modelo puede fallar en escenarios con clases no representadas adecuadamente.
- **Alucinación y falsos positivos**: como cualquier modelo de detección, existe riesgo de falsos positivos y negativos, especialmente en imágenes con oclusiones o iluminación compleja.
- **Documentación incompleta**: la model card no incluye información sobre el dataset de entrenamiento, el preprocesamiento de imágenes ni los parámetros de inferencia (como el umbral de confianza), lo que dificulta la reproducción exacta de los resultados.
- **Licencia**: aunque la licencia Apache 2.0 permite uso comercial, es necesario verificar que los datos de entrenamiento no tienen restricciones adicionales.
- **Modelo no multimodal**: no admite entrada de texto ni otras modalidades, limitando su uso en aplicaciones que requieran interacción con lenguaje.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/kb0968237/rt_detrv2_finetuned_v1)
- [Modelo base PekingU/rtdetr_v2_r50vd](https://huggingface.co/PekingU/rtdetr_v2_r50vd)
- [Documentación de RT-DETRv2 en Hugging Face](https://huggingface.co/docs/transformers/model_doc/rt_detr_v2)
- [Repositorio oficial de RT-DETR](https://github.com/lyuwenyu/RT-DETR)
- [Repositorio de RT-DETRv2](https://github.com/zheli-hub/RT-DETRv2)
- [Paper de RT-DETRv2 en arXiv](https://arxiv.org/abs/2407.17140)
