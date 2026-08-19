# sdoerrich97/true_colon_yolov11m_realcolon_s42

## Resumen

El modelo `sdoerrich97/true_colon_yolov11m_realcolon_s42` es un detector de objetos de una sola clase (`lesion`) basado en la arquitectura YOLOv11-M, entrenado por el grupo de Explainable Machine Learning de la Universidad Otto-Friedrich de Bamberg sobre el dataset REAL-Colon, compuesto por 60 procedimientos completos de colonoscopia sin editar. Este checkpoint corresponde a una de las tres semillas utilizadas en el estudio, y su propósito principal es servir como referencia reproducible para la investigación en detección de pólipos y para la evaluación de metodologías de vídeo en endoscopia.

El modelo se publica junto con el protocolo de evaluación TRUE-Colon, presentado en el taller EndoLINA de MICCAI 2026. Su relevancia radica en que aborda la brecha entre la precisión de localización medida con métricas clásicas (como COCO mAP) y el comportamiento real en procedimientos completos, donde la mayoría de los fotogramas no contienen lesiones. La arquitectura es YOLOv11-M con entrada de 640x640 píxeles, y el entrenamiento se realizó con un split a nivel de paciente, con un 86,47% de fotogramas sin lesiones. No se dispone de información sobre el número total de parámetros ni sobre la longitud de contexto, ya que se trata de un modelo de visión sin componente textual.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOv11-M (backbone YOLO11) |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no aplicable (modelo de visión) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplicable |
| Licencia | AGPL-3.0 (heredada de Ultralytics) |
| Formato de pesos | PyTorch (.pt) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura YOLOv11 en su variante M (media), un detector de una sola etapa basado en redes neuronales convolucionales. La entrada es una imagen de 640x640 píxeles y la salida es una única clase denominada `lesion`. El entrenamiento se realizó sobre el dataset REAL-Colon, que contiene 60 procedimientos completos de colonoscopia de 4 instituciones, con un split a nivel de paciente. Se utilizó inicialización con pesos preentrenados en COCO, optimizador SGD (resuelto automáticamente por Ultralytics al superar las 10.000 iteraciones) con tasa de aprendizaje inicial 0.01, momentum 0.9 y weight decay 5e-4. El entrenamiento duró 100 épocas con early stopping de paciencia 10 y un warm-up de 3 épocas. El batch size fue de 208 y la versión de Ultralytics empleada fue la 8.3.232. No se aplicaron técnicas de RLHF o DPO, al tratarse de un modelo de visión supervisado clásico. La innovación principal no reside en la arquitectura, sino en el protocolo de evaluación TRUE-Colon que lo acompaña, que mide el rendimiento en condiciones realistas de procedimiento completo.

## Capacidades

- Detección de lesiones (pólipos) en imágenes de colonoscopia, con una única clase `lesion`.
- Inferencia a nivel de fotograma, sin modelado temporal: cada imagen se evalúa de forma independiente.
- Entrenado con un alto porcentaje de fotogramas negativos (86,47%), lo que refleja la distribución real de los procedimientos.
- No soporta generación de texto, tool calling, agentes, razonamiento multi-paso ni capacidades multilingües, al ser un modelo puramente visual.
- No incluye modo de pensamiento (thinking mode) ni procesamiento de audio o vídeo secuencial.

## Casos de uso

- Investigación en detección de pólipos: el modelo puede utilizarse como línea base reproducible para estudios que comparen arquitecturas de detección en colonoscopia, gracias a su configuración de entrenamiento documentada y su semilla fija.
- Evaluación de metodologías de vídeo: permite reproducir el protocolo TRUE-Colon para medir la transferencia entre precisión de localización y comportamiento en procedimientos completos, útil para validar nuevas métricas.
- Desarrollo de sistemas de asistencia a la endoscopia en entornos de investigación: puede integrarse en pipelines de análisis de vídeo para estudiar la viabilidad de la detección en tiempo real, siempre fuera del ámbito clínico.
- Análisis de sesgos por subtipo histológico: al estar entrenado con datos de múltiples instituciones, sirve para investigar cómo varía el rendimiento según el tamaño de la lesión o el subtipo (SSL, TSA), como se menciona en las limitaciones.
- Benchmarking de hardware: al ser un modelo ligero (YOLOv11-M), puede emplearse para medir latencia y throughput en GPUs de consumo, orientando decisiones de despliegue en entornos de investigación.
- Formación y docencia: útil como ejemplo práctico de entrenamiento de un detector de objetos con Ultralytics en un dominio médico, incluyendo el manejo de datos desbalanceados y la evaluación con protocolos específicos.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. La model card indica que el rendimiento debe evaluarse con el protocolo TRUE-Colon en lugar de COCO mAP, y menciona un punto de operación de tau* = 0.05 para una tasa de falsos positivos objetivo del 4-5% en el dataset REAL-Colon. Los resultados completos se encuentran en el paper asociado (arXiv:2608.13711), pero no se reproducen en la ficha para evitar sobreestimar la precisión de una semilla individual.

## Requisitos de hardware

- No se especifican requisitos de hardware en la información proporcionada.
- Dado que se trata de un modelo YOLOv11-M con entrada de 640x640, se espera que sea ejecutable en GPUs de consumo (por ejemplo, RTX 3060 o superior) con al menos 8 GB de VRAM para inferencia, aunque este dato no está confirmado por el autor.
- Para despliegue, es compatible con el ecosistema Ultralytics, que permite exportar a formatos como ONNX, TensorRT o CoreML, y puede integrarse con servidores de inferencia como vLLM o TGI solo si se convierte adecuadamente, aunque no es el flujo habitual para modelos de visión.
- No se dispone de datos de latencia o throughput medidos.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros modelos de detección de pólipos ni con variantes de YOLO, y no se pueden extraer datos fiables sin acceso al paper completo.

## Limitaciones y advertencias

- No es un dispositivo médico: no debe utilizarse para decisiones clínicas. El propio paper concluye que el rendimiento en condiciones realistas es insuficiente para un despliegue clínico fiable.
- Entrenado únicamente en 60 procedimientos de 4 instituciones, por lo que el rendimiento puede degradarse con cambios en el hardware endoscópico, el modo de imagen o la población de pacientes.
- La precisión media en lesiones pequeñas es casi nula; la detección está dominada por lesiones medianas y grandes.
- Dos subtipos histológicos (SSL y TSA) solo aparecen en el conjunto de test, y las lesiones sésiles serradas presentan las tasas de fallo más altas.
- El modelo opera a nivel de fotograma, sin modelo temporal, por lo que no aprovecha la coherencia temporal del vídeo.
- Licencia AGPL-3.0: su uso en productos conlleva obligaciones de disponibilidad de código fuente, a diferencia de la licencia MIT del paquete de evaluación `true_colon`.
- No se han publicado métricas de sesgo o equidad más allá de las limitaciones mencionadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sdoerrich97/true_colon_yolov11m_realcolon_s42
- Paper (arXiv): https://arxiv.org/abs/2608.13711
- Repositorio GitHub: https://github.com/sdoerrich97/true-colon
- Paquete de protocolo en PyPI: https://pypi.org/project/true-colon/
