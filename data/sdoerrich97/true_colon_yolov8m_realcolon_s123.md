# sdoerrich97/true_colon_yolov8m_realcolon_s123

## Resumen

TRUE-Colon YOLOv8-M es un detector de objetos de una sola clase (`lesion`) diseñado para la detección de pólipos en secuencias de colonoscopia. Ha sido desarrollado por la Cátedra de Aprendizaje Automático Explicable de la Universidad Otto-Friedrich de Bamberg y se publica como parte del protocolo de evaluación TRUE-Colon, presentado en el taller EndoLINA de MICCAI 2026. El modelo está entrenado sobre el conjunto de datos REAL-Colon, compuesto por 60 procedimientos de colonoscopia completos y sin editar, con división a nivel de paciente y un 86,47 % de fotogramas sin lesión.

Este checkpoint corresponde a una de las tres semillas (seed 123) utilizadas en el estudio; los autores advierten explícitamente de que reportar una única semilla de forma aislada sobreestimaría la precisión del sistema, por lo que los resultados agregados se presentan en el artículo asociado. La arquitectura es YOLOv8-M con entrada de 640 × 640 píxeles, inicializada con pesos preentrenados en COCO y ajustada durante 100 épocas con SGD. El modelo se distribuye bajo licencia AGPL-3.0, lo que implica obligaciones de copyleft si se integra en productos comerciales.

La relevancia de este modelo radica en que aborda la brecha entre la precisión de localización medida con métricas clásicas (como mAP) y el comportamiento real en vídeo completo, donde la tasa de falsas alarmas y la variabilidad entre procedimientos son críticas. El protocolo TRUE-Colon propone un punto de operación con umbral de confianza tau* = 0,06 para lograr una tasa de falsos positivos por fotograma del 4-5 %, y enfatiza que la evaluación debe hacerse con su metodología, no solo con COCO mAP.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOv8-M (Ultralytics) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de vision) |
| Licencia | AGPL-3.0 |
| Formato de pesos | PyTorch (.pt) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura YOLOv8-M, un detector de una etapa con backbone CSPDarknet y cabeza de detección anclada, tal como se implementa en la librería Ultralytics (versión 8.3.232). La entrada es una imagen RGB de 640 × 640 píxeles y la salida es una única clase (`lesion`). El entrenamiento se realizó sobre el conjunto REAL-Colon, que contiene 60 procedimientos completos de colonoscopia procedentes de 4 instituciones, con división a nivel de paciente. La configuración de entrenamiento incluye un tamaño de lote de 208, optimizador SGD (resuelto automáticamente por Ultralytics al superar las 10 000 iteraciones) con tasa de aprendizaje inicial 0,01, momento 0,9 y decaimiento de peso 5e-4, junto con un programa de 100 épocas, early stopping con paciencia 10 y un warm-up de 3 épocas. La inicialización parte de pesos preentrenados en COCO, tal como los distribuye Ultralytics. No se aplicaron técnicas de aumento de datos específicas más allá de los valores por defecto del framework, y no se menciona el uso de RLHF, DPO u otros métodos de alineación, ya que se trata de un modelo de visión supervisado.

## Capacidades

- Detección de objetos de una sola clase (`lesion`) en imágenes individuales de colonoscopia.
- Inferencia a 640 × 640 píxeles con tiempos de procesamiento adecuados para vídeo en tiempo real (el paper reporta rendimiento en condiciones de procedimiento completo).
- Funciona como componente de sistemas de detección asistida por computadora (CADe) en entornos de investigación.
- Integración con el paquete `true-colon` para evaluación bajo el protocolo TRUE-Colon (métricas de localización y tasa de falsas alarmas).
- No incluye modelado temporal: cada fotograma se puntúa de forma independiente.
- No soporta tool calling, agentes ni procesamiento multimodal más allá de imágenes.

## Casos de uso

- Reproducción de experimentos del paper TRUE-Colon: el checkpoint permite replicar los resultados de la semilla 123 y comparar con las otras dos semillas, siempre que se utilice el protocolo de evaluación oficial (`true_colon`).
- Investigación en metodología de evaluación para detección de pólipos en vídeo: el modelo sirve como referencia para estudiar cómo la precisión de localización (mAP) se relaciona con la tasa de falsas alarmas en procedimientos completos.
- Desarrollo de sistemas CADe en fase de investigación: puede integrarse en pipelines de análisis de vídeo endoscópico para probar estrategias de post-procesado temporal o fusión de fotogramas.
- Formación y docencia en visión por computador aplicada a imagen médica: su tamaño reducido (0,1 GB) y su integración con Ultralytics lo hacen adecuado para prácticas universitarias.
- Comparación de arquitecturas de detección en el dominio endoscópico: al ser un YOLOv8-M, puede utilizarse como baseline frente a otros detectores (RT-DETR, etc.) en el mismo conjunto de datos.
- Validación de hipótesis sobre transferencia de dominios: el paper documenta una asimetría de transferencia consistente; este modelo permite reproducir esos análisis en entornos de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card remite al artículo (arXiv:2608.13711) para las tablas completas de resultados y advierte explícitamente de que los valores por semilla no se reproducen en la tarjeta porque no son la cantidad que reporta el estudio. Se menciona que la precisión media en lesiones pequeñas es casi nula y que los subtipos histológicos SSL y TSA solo aparecen en el conjunto de test, con las mayores tasas de fallo en lesiones sésiles serradas.

## Requisitos de hardware

No se especifican requisitos de hardware en la información proporcionada. El modelo se distribuye en formato .pt y se ejecuta con la librería Ultralytics; dado su tamaño (0,1 GB), es plausible que pueda ejecutarse en GPUs de consumo medio (por ejemplo, RTX 3060 o superiores), pero no se dispone de datos oficiales sobre VRAM, latencia o throughput. Para despliegue en producción, se recomienda consultar la documentación de Ultralytics sobre exportación a ONNX, TensorRT o CoreML, así como las guías de optimización para inferencia en tiempo real.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros modelos de detección de pólipos (por ejemplo, otros YOLO, RT-DETR o detectores específicos de endoscopia). Se recomienda consultar el artículo para ver la comparativa con la literatura existente.

## Limitaciones y advertencias

- No es un dispositivo médico: la model card es explícita en que no debe utilizarse para decisiones clínicas y que el rendimiento en condiciones reales de procedimiento completo es insuficiente para un despliegue clínico fiable.
- Sesgo de datos: entrenado en 60 procedimientos de 4 instituciones; el hardware endoscópico, el modo de imagen y la población de pacientes pueden degradar el rendimiento fuera de ese ámbito.
- Rendimiento pobre en lesiones pequeñas: la precisión media en lesiones pequeñas es casi nula.
- Subtipos histológicos infrarrepresentados: los subtipos SSL y TSA solo aparecen en el conjunto de test, y las lesiones sésiles serradas presentan las mayores tasas de fallo.
- Sin modelado temporal: cada fotograma se evalúa de forma independiente, lo que limita su uso en vídeo sin post-procesado.
- Licencia AGPL-3.0: el uso en productos comerciales implica obligaciones de copyleft (publicación del código fuente), a diferencia de la licencia MIT del paquete de evaluación `true-colon`.
- Variabilidad entre semillas: este checkpoint es una de tres semillas; reportar solo esta semilla puede sobreestimar la precisión del sistema.

## Enlaces

- [HuggingFace - sdoerrich97/true_colon_yolov8m_realcolon_s123](https://huggingface.co/sdoerrich97/true_colon_yolov8m_realcolon_s123)
- [Artículo arXiv - 2608.13711](https://arxiv.org/abs/2608.13711)
- [Repositorio GitHub - sdoerrich97/true-colon](https://github.com/sdoerrich97/true-colon)
- [Paquete PyPI - true-colon](https://pypi.org/project/true-colon/)
