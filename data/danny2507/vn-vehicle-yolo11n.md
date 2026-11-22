# danny2507/vn-vehicle-yolo11n

## Resumen

YOLO11n-VN es un detector de objetos basado en la arquitectura YOLO11n de Ultralytics, ajustado específicamente para la detección de vehículos en tráfico urbano de Vietnam. Lo desarrolla el usuario danny2507 y se distribuye con licencia Apache 2.0. El modelo resuelve el problema de la detección y conteo de vehículos en escenarios de tráfico denso, con especial énfasis en motocicletas, que son el vehículo dominante en las ciudades vietnamitas y que los detectores genéricos tienden a infradetectar en condiciones de oclusión y alta densidad.

Se trata de un modelo muy ligero: 2.590.620 parámetros (~2,6 M) y 6,5 GFLOPs, lo que lo hace apto para despliegue en tiempo real sobre hardware modesto, incluidos dispositivos de borde. Se entrenó sobre un conjunto de 62.485 imágenes que combina secuencias CCTV de Ciudad Ho Chi Minh (condiciones de sol, lluvia, noche y niebla), el dataset UVH-26 y aumentaciones sintéticas de clima adverso. La resolución de entrenamiento es de 1024 × 1024, con inferencia soportada entre 640 y 1280 píxeles.

Su relevancia actual radica en la especialización: frente a detectores genéricos entrenados con datasets occidentales, este modelo incorpora la taxonomía y la distribución de clases del tráfico vietnamita (car, motorbike, bus, truck) y reporta métricas internas y externas (VisDrone2019-DET) que documentan su comportamiento en escenarios de alta densidad. Es un ejemplo de ajuste fino de un modelo pequeño para un dominio vertical concreto de smart city.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO11n (Ultralytics), detector de una etapa tipo CNN |
| Parametros totales | 2.590.620 (~2,6 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | FP16 en los pesos de despliegue (`*_deploy.pt`, 5,3 MB); no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible (modelo de visión; las etiquetas de clase están en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.pt` (PyTorch/Ultralytics); checkpoints completos de 26 MB y pesos de despliegue FP16 de 5,3 MB |
| Resolucion de entrada | 1024 × 1024 en entrenamiento; inferencia soportada de 640 a 1280 |
| Coste computacional | 6,5 GFLOPs |
| Clases | 4: car (0), motorbike (1), bus (2), truck (3) |
| Hardware de entrenamiento | NVIDIA A100-PCIE-40GB |
| Optimizador | AdamW (lr0=0.0002, cosine annealing) |
| Tamano del dataset | 62.485 imágenes de entrenamiento, 1.891 de validación |

## Arquitectura y entrenamiento

La arquitectura es YOLO11n, la variante nano de la familia YOLO11 de Ultralytics: un detector de objetos de una etapa con backbone y neck convolucionales y una cabeza de detección que predice cajas, objectness y clases en una sola pasada. Con 2,6 M de parámetros y 6,5 GFLOPs, está diseñado para inferencia de baja latencia. La resolución de entrenamiento es de 1024 × 1024, superior a la habitual de 640 en YOLO nano, lo que favorece la detección de objetos pequeños en escenas de tráfico aéreo o CCTV elevado.

El entrenamiento se realizó sobre 62.485 imágenes y 1.891 de validación, combinando flujos de vídeo CCTV de Ciudad Ho Chi Minh con condiciones meteorológicas diversas (sol, lluvia, noche, niebla) del conjunto VN2V-Weather, el dataset UVH-26 y aumentaciones sintéticas de clima adverso. Se usó AdamW con lr0=0.0002 y annealing coseno sobre una A100 de 40 GB. La model card documenta una innovación de entrenamiento relevante: la versión 2 aplica «close-mosaic» y entrenamiento a alta resolución, lo que reduce la pérdida de caja de 0,8627 a 0,6665 y mejora la precisión en el conjunto de desarrollo. No se documenta uso de RLHF ni de técnicas de decodificación especulativa, que no aplican a este tipo de modelo.

## Capacidades

- Detección de objetos en imágenes y vídeo con cuatro clases de vehículos: coche, motocicleta, autobús y camión.
- Conteo de vehículos mediante cruce de línea (line-crossing counting), según se describe en la model card.
- Funcionamiento en condiciones meteorológicas y de iluminación diversas: sol, lluvia, noche y niebla.
- Detección en escenas de tráfico denso y con oclusión, incluidas vistas aéreas o de cámara elevada (evaluado en VisDrone2019-DET).
- Inferencia configurable en resolución (640 a 1280) y en umbrales de confianza e IoU (`conf`, `iou`).
- Ejecución en GPU (`device=0`) o CPU (`device='cpu'`).
- Integración con el ecosistema Ultralytics: predicción, guardado de resultados anotados y acceso programático a cajas, clases y confianzas.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades de lenguaje; es exclusivamente un modelo de visión.

## Casos de uso

- Conteo de tráfico urbano en tiempo real: el modelo puede procesar flujos de CCTV a 1024 px y contar vehículos por cruce de línea, aprovechando su bajo coste (6,5 GFLOPs) para mantener throughput alto en una sola GPU.
- Gestión semafórica adaptativa: las detecciones por clase (especialmente motorbike, dominante en Vietnam) permiten estimar la densidad de cada carril y ajustar los tiempos de semáforo en función del flujo real.
- Analítica de movilidad para smart cities: agregación de detecciones a lo largo del día para generar series temporales de ocupación viaria y alimentar paneles de planificación urbana.
- Vigilancia de infraestructuras críticas: detección de autobuses y camiones en accesos restringidos o carriles reservados, con umbrales de confianza ajustables para reducir falsos positivos (la versión 2 reduce los falsos positivos por fotograma de 1,123 a 0,789).
- Despliegue en dispositivos de borde: con 2,6 M de parámetros y pesos FP16 de 5,3 MB, cabe en GPUs integradas o aceleradores de bajo consumo para cámaras inteligentes en intersecciones sin conectividad a la nube.
- Monitorización de condiciones adversas: al haberse entrenado con lluvia, noche y niebla, es adecuado para sistemas de alerta temprana de congestión o incidentes en esas condiciones, donde los detectores genéricos degradan su precisión.
- Auditoría y post-procesado de vídeo grabado: los informes de evaluación incluidos (`eval_v2_dev2048.json`, `eval_v2_test.json`, `visdrone_v2_report.json`) permiten reproducir y validar el comportamiento del modelo antes de integrarlo en producción.

## Benchmarks y rendimiento

Resultados reportados por el autor en validación interna y en conjuntos congelados:

| Metrica | Version 1 | Version 2 |
|---|---|---|
| mAP50 (validación) | 88,44 % | 88,91 % |
| mAP50-95 (validación) | 74,95 % | 75,43 % |
| Precisión (validación) | 83,74 % | 86,34 % |
| Pérdida de caja (train) | 0,8627 | 0,6665 |
| Precisión bruta Dev2048 | 62,26 % | 69,89 % |
| Precisión post-proceso Dev2048 | 66,72 % | 72,76 % |
| Falsos positivos por fotograma Dev2048 | 1,123 | 0,789 |
| Precisión bruta motorbike (test) | 69,42 % | 74,86 % |
| Recall global (test) | 91,10 % | 94,04 % |

Evaluación externa en VisDrone2019-DET (548 imágenes de tráfico denso aéreo, 21.926 vehículos anotados):

| Clase | Precisión @ conf=0,45 | Precisión @ conf=0,55 | Recall |
|---|---|---|---|
| Car | 94,8 % | 95,8 % | 36,5 % |
| Bus | 79,4 % | 85,7 % | 30,7 % |
| Global | 82,88 % | 86,10 % | 30,14 % |

No se han publicado comparaciones con otros modelos (por ejemplo, YOLO11n estándar o YOLOv8n) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB con pesos FP16 a 1024 px; el modelo es de 2,6 M de parámetros y 5,3 MB en FP16, por lo que la memoria dominante es la de las activaciones de la imagen de entrada.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; el modelo se entrenó en una A100-PCIE-40GB, pero para inferencia es sobredimensionada.
- Cabe en GPU de consumo: sí, en RTX 3060, RTX 4060, RTX 4090 y similares; también en GPUs integradas y aceleradores de borde con soporte PyTorch.
- Opciones de despliegue: Ultralytics (PyTorch), exportación a ONNX, TensorRT, OpenVINO o TFLite mediante las utilidades de Ultralytics; no se documentan integraciones específicas con vLLM, llama.cpp u Ollama, que no aplican a modelos de visión.
- Latencia y throughput: no se han publicado cifras concretas de latencia ni de FPS en la información disponible; el coste de 6,5 GFLOPs por imagen a 1024 px sitúa el modelo en el rango de tiempo real en GPUs modernas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| YOLO11n-VN (este modelo) | 2,6 M | 1024 × 1024 (640–1280) | mAP50 88,91 % (validación interna); precisión global 86,10 % en VisDrone @ conf=0,55 | Apache 2.0 | Hugging Face |
| YOLO11n (Ultralytics, base) | ~2,6 M | 640 × 640 por defecto | no disponible en esta ficha | AGPL-3.0 / comercial | Ultralytics |
| YOLOv8n (Ultralytics) | ~3,2 M | 640 × 640 por defecto | no disponible en esta ficha | AGPL-3.0 / comercial | Ultralytics |
| Detectores genéricos COCO (p. ej. Faster R-CNN) | decenas de millones | variable | no disponible en esta ficha | variable | múltiples |

La comparación cuantitativa con alternativas no está disponible en la información proporcionada; los datos de rendimiento de este modelo corresponden a su validación interna y a VisDrone, no a una comparación controlada con los modelos citados.

## Limitaciones y advertencias

- El modelo está especializado en el dominio del tráfico vietnamita; su rendimiento fuera de ese contexto (otras geografías, composición de vehículos distinta) no está documentado.
- El recall en VisDrone2019-DET es bajo (30,14 % global, 36,5 % en coches), lo que indica que en escenas aéreas de muy alta densidad puede omitir una fracción importante de vehículos; la precisión alta no compensa ese recall en aplicaciones de conteo exhaustivo.
- La precisión bruta en motorbike en el conjunto de test es del 74,86 % (supera el 90 % solo con conf=0,60), por lo que el umbral de confianza debe calibrarse según el caso de uso.
- Riesgo de falsos positivos en escenas complejas: la versión 2 reporta 0,789 falsos positivos por fotograma en Dev2048, un valor no nulo que requiere post-procesado en producción.
- No se documentan sesgos demográficos ni geográficos más allá del dominio de entrenamiento; la ausencia de datos al respecto impide evaluarlos.
- Licencia Apache 2.0: permite uso comercial, pero el modelo deriva de YOLO11 de Ultralytics, cuya licencia base es AGPL-3.0 con opción comercial; conviene verificar la compatibilidad antes de un despliegue comercial.
- No se documentan limitaciones de idioma porque el modelo no procesa texto; las etiquetas de clase están en inglés.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación comunitaria independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/danny2507/vn-vehicle-yolo11n
- Dataset de entrenamiento: https://huggingface.co/datasets/danny2507/vn-vehicle-yolo-a100
- Ultralytics (framework y arquitectura YOLO11): https://github.com/ultralytics/ultralytics
- Documentación de Ultralytics: https://docs.ultralytics.com
- VisDrone2019-DET (benchmark externo): https://github.com/VisDrone/VisDrone-Dataset
