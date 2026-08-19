# sdoerrich97/true_colon_yolov11m_realcolon_s123

## Resumen

TRUE-Colon YOLOv11-M es un detector de objetos de una sola clase (`lesion`) diseñado para la detección de pólipos en secuencias de colonoscopia. Ha sido desarrollado por la Cátedra de Aprendizaje Automático Explicable de la Universidad Otto-Friedrich de Bamberg y se publica como parte del protocolo de evaluación TRUE-Colon, presentado en el taller EndoLINA de MICCAI 2026. El modelo se entrenó sobre el conjunto de datos REAL-Colon, compuesto por 60 procedimientos de colonoscopia completos y sin editar, con división por paciente y una proporción del 86,47 % de fotogramas sin lesión en el entrenamiento.

Este checkpoint corresponde a una de las tres semillas utilizadas en el estudio; los autores advierten explícitamente de que reportar una única semilla de forma aislada sobrestimaría la precisión real, por lo que los resultados agregados se presentan en el artículo asociado. La arquitectura es YOLOv11-M (tamaño medio) con entrada de 640×640 píxeles, inicializada con pesos preentrenados en COCO y ajustada con SGD durante 100 épocas. Su relevancia radica en que aborda la brecha entre la precisión de localización medida con métricas clásicas (como COCO mAP) y el comportamiento real en vídeo completo, un problema crítico para la adopción clínica de sistemas de detección asistida por ordenador.

La licencia es AGPL-3.0, heredada de Ultralytics, lo que implica obligaciones de divulgación de código fuente si se utiliza en un producto comercial. El modelo no está validado para uso clínico y el propio artículo concluye que su rendimiento en condiciones realistas sigue siendo insuficiente para un despliegue clínico fiable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO11 (backbone YOLO11, cabeza de detección de una clase) |
| Parametros totales | No disponible (el modelo YOLO11-M de Ultralytics tiene aproximadamente 20 M, pero no se confirma en la ficha) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No aplica (modelo de visión, entrada de imagen 640×640) |
| Tipos de cuantizacion | No disponible (se distribuye como pesos `.pt` de Ultralytics; no se especifican cuantizaciones) |
| Idiomas soportados | No disponible (no es un modelo de lenguaje) |
| Licencia | AGPL-3.0 |
| Formato de pesos | `.pt` (PyTorch / Ultralytics) |

## Arquitectura y entrenamiento

El modelo utiliza la arquitectura YOLO11, un detector de objetos de una etapa basado en redes neuronales convolucionales, con un backbone YOLO11 y una cabeza de detección que predice cajas delimitadoras y puntuaciones de clase. En este caso, solo hay una clase (`lesion`), por lo que la salida es una única probabilidad por propuesta. La entrada es una imagen de 640×640 píxeles, y el modelo se inicializa con pesos preentrenados en COCO, tal y como los distribuye Ultralytics.

El entrenamiento se realizó sobre el conjunto REAL-Colon, que incluye 60 procedimientos completos de colonoscopia de 4 instituciones. La división se hizo a nivel de paciente, y el 86,47 % de los fotogramas de entrenamiento no contenían lesiones, lo que refleja la distribución real de los procedimientos. Los hiperparámetros registrados son: batch size 208, optimizador SGD (resuelto a partir de `optimizer=auto` en Ultralytics, con `lr0=0.01`, `momentum=0.9` y `weight decay=5e-4`), 100 épocas, early stopping con paciencia 10 y un calentamiento de 3 épocas. La versión de Ultralytics utilizada fue la 8.3.232.

No se mencionan innovaciones arquitectónicas más allá de las propias de YOLO11. El modelo opera a nivel de fotograma, sin ningún mecanismo temporal que aproveche la correlación entre frames consecutivos.

## Capacidades

- Detección de objetos en imágenes: identifica lesiones (pólipos) en fotogramas de colonoscopia, devolviendo cajas delimitadoras y puntuaciones de confianza.
- Procesamiento de imágenes de endoscopia: entrenado específicamente con vídeos de colonoscopia reales, incluyendo fotogramas sin lesiones.
- Inferencia a alta velocidad: al ser un modelo YOLO11-M, es adecuado para aplicaciones en tiempo real (aunque no se proporcionan cifras de FPS).
- Integración con el ecosistema Ultralytics: se puede usar con la API de YOLO para entrenamiento, validación y exportación a otros formatos (ONNX, TensorRT, etc.).
- Compatibilidad con el protocolo TRUE-Colon: el checkpoint está diseñado para ser evaluado con el paquete `true_colon` de PyPI, que implementa métricas de evaluación orientadas a vídeo completo.

No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multimodales más allá de la entrada de imagen.

## Casos de uso

- Investigación en detección de pólipos: permite reproducir y extender los resultados del protocolo TRUE-Colon, comparando el rendimiento de diferentes arquitecturas bajo condiciones realistas de vídeo completo.
- Evaluación de metodologías de validación: al ser parte de un benchmark que mide la transferencia de rendimiento entre métricas de localización y comportamiento en despliegue, se puede usar para estudiar cómo afectan los puntos de operación (umbrales de confianza) a las tasas de falsos positivos.
- Desarrollo de sistemas de asistencia a la endoscopia: aunque no está validado clínicamente, sirve como punto de partida para investigar sistemas de detección en tiempo real que procesen vídeo de colonoscopia.
- Análisis de sesgos y limitaciones: los autores documentan que la precisión en lesiones pequeñas es casi nula y que ciertos subtipos histológicos (SSL, TSA) aparecen solo en el conjunto de test; esto permite estudiar la generalización a poblaciones y equipos distintos.
- Comparación de arquitecturas: al existir variantes del mismo modelo (por ejemplo, RT-DETR) y otras semillas, se puede utilizar para comparar el efecto de la arquitectura y la inicialización aleatoria en el rendimiento final.
- Formación y docencia: como ejemplo de aplicación de YOLO11 a un dominio médico específico, puede utilizarse en cursos de visión por computador y deep learning para ilustrar el entrenamiento de detectores con datos desbalanceados y vídeo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que el artículo asociado reporta resultados agregados de las tres semillas, pero no reproduce los números por semilla. Se menciona que el punto de operación evaluado es `tau* = 0.05`, con una tasa de falsos positivos objetivo del 4-5 %, pero no se proporcionan valores concretos de precisión, recall o mAP.

## Requisitos de hardware

No se proporcionan requisitos oficiales de hardware en la documentación. Sin embargo, al tratarse de un modelo YOLO11-M (tamaño medio), es razonable esperar que la inferencia pueda ejecutarse en GPUs de consumo con al menos 4-6 GB de VRAM en precisión FP16, y que sea compatible con herramientas de despliegue como Ultralytics, ONNX Runtime o TensorRT. No obstante, estos datos son orientativos y no están confirmados por los autores.

Para la evaluación bajo el protocolo TRUE-Colon, se recomienda disponer de una GPU con suficiente memoria para procesar vídeos completos de colonoscopia, aunque el modelo en sí es ligero. No se especifican latencias ni throughput.

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos en la documentación proporcionada. La model card menciona que existen otras variantes (por ejemplo, RT-DETR) y otras semillas del mismo modelo, pero no se ofrecen datos de rendimiento comparativo. Por tanto, no es posible elaborar una tabla comparativa fiable.

## Limitaciones y advertencias

- No es un dispositivo médico: no debe utilizarse para decisiones clínicas. El artículo concluye que el rendimiento en condiciones realistas es insuficiente para un despliegue clínico fiable.
- Entrenamiento limitado: solo 60 procedimientos de 4 instituciones, lo que limita la generalización a otros equipos de endoscopia, modos de imagen y poblaciones de pacientes.
- Detección deficiente de lesiones pequeñas: la precisión media en lesiones pequeñas es casi nula, lo que puede pasar por alto pólipos incipientes.
- Sesgo hacia lesiones medianas y grandes: el modelo está dominado por lesiones de tamaño medio y grande, y subtipos como SSL y TSA presentan altas tasas de fallo.
- Sin modelado temporal: cada fotograma se evalúa de forma independiente, ignorando la correlación temporal que podría mejorar la detección en vídeo.
- Licencia AGPL-3.0: el uso en productos comerciales conlleva la obligación de publicar el código fuente de la aplicación que utilice estos pesos. No es la licencia MIT del paquete de evaluación `true_colon`.
- Riesgo de sobreajuste a la distribución de REAL-Colon: la división por paciente y la proporción de fotogramas sin lesión reflejan un escenario concreto, pero no garantizan el comportamiento en otros entornos clínicos.

## Enlaces

- HuggingFace: https://huggingface.co/sdoerrich97/true_colon_yolov11m_realcolon_s123
- Artículo (arXiv): https://arxiv.org/abs/2608.13711
- Repositorio GitHub: https://github.com/sdoerrich97/true-colon
- Paquete de protocolo (PyPI): https://pypi.org/project/true-colon/
