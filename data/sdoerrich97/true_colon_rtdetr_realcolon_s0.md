# sdoerrich97/true_colon_rtdetr_realcolon_s0

## Resumen

TRUE-Colon es un protocolo de evaluación y un conjunto de modelos de detección de pólipos en colonoscopia desarrollado por la Cátedra de Aprendizaje Automático Explicable de la Universidad Otto-Friedrich de Bamberg. Este modelo concreto, `sdoerrich97/true_colon_rtdetr_realcolon_s0`, es un detector de objetos RT-DETR entrenado sobre el dataset REAL-Colon, compuesto por 60 procedimientos de colonoscopia completos y sin editar. Se trata de una de las tres semillas (seed 0) utilizadas en el estudio, y su propósito es servir para reproducir y extender el benchmark TRUE-Colon, que expone una asimetría de transferencia consistente en la detección de pólipos en tiempo real.

El modelo es un detector de una sola clase (`lesion`) con entrada de 640×640 píxeles, basado en la arquitectura RT-DETR (Real-Time Detection Transformer) e implementado con Ultralytics. Está preentrenado en COCO y afinado en REAL-Colon con una división a nivel de paciente. La relevancia actual del modelo radica en que aborda la brecha entre la precisión de localización medida con métricas clásicas (mAP) y el comportamiento real en procedimientos completos, proponiendo un protocolo de evaluación más realista. No obstante, el propio artículo concluye que el rendimiento bajo condiciones realistas de procedimiento completo sigue siendo insuficiente para un despliegue clínico fiable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RT-DETR (Real-Time Detection Transformer) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (deteccion de objetos) |
| Tipos de cuantizacion | no especificado |
| Idiomas soportados | no aplica (vision por computador) |
| Licencia | AGPL-3.0 |
| Formato de pesos | PyTorch .pt (Ultralytics) |

## Arquitectura y entrenamiento

RT-DETR es un detector de objetos basado en transformer que combina un backbone convolucional con un decoder de consultas (queries) para predecir cajas y clases de forma directa, sin necesidad de anclas ni NMS. En este caso, el backbone es RT-DETR tal como lo distribuye Ultralytics, y el modelo se inicializa con pesos preentrenados en COCO. La entrada es de 640×640 píxeles y la salida es una única clase `lesion`.

El entrenamiento se realizó sobre el dataset REAL-Colon, que incluye 60 procedimientos de colonoscopia completos de 4 instituciones. Se aplicó una división a nivel de paciente, y el 86,47% de los fotogramas de entrenamiento no contenían lesiones, lo que refleja la distribución real de los procedimientos. La configuración de entrenamiento registrada incluye: batch size de 66, optimizador SGD (resuelto de `optimizer=auto` al superar las 10.000 iteraciones) con learning rate inicial de 0,01, momentum de 0,9 y weight decay de 5e-4. Se entrenó durante 100 épocas con early stopping de paciencia 10 y un warm-up de 3 épocas. La versión de Ultralytics utilizada fue la 8.3.232. El modelo se entrenó con tres semillas diferentes; esta es la semilla 0, y el artículo agrega los resultados de las tres.

## Capacidades

- Detección de lesiones (pólipos) en imágenes de colonoscopia, con una única clase `lesion`.
- Entrada de imagen de 640×640 píxeles, salida de cajas delimitadoras con confianza.
- Inferencia en tiempo real gracias a la arquitectura RT-DETR, diseñada para aplicaciones de baja latencia.
- Capacidad de ser evaluado con el protocolo TRUE-Colon, que considera métricas orientadas al comportamiento en procedimientos completos, no solo mAP.
- No incluye capacidades de tool calling, generación de texto, razonamiento multimodal ni otras tareas propias de modelos de lenguaje.

## Casos de uso

- Investigación en detección de pólipos: el modelo permite reproducir los experimentos del artículo TRUE-Colon y comparar metodologías de evaluación en video-colonoscopia.
- Desarrollo de benchmarks de detección en endoscopia: al estar entrenado sobre procedimientos completos, sirve como referencia para evaluar otros detectores bajo condiciones realistas.
- Estudio de la asimetría de transferencia: el modelo se utiliza para analizar por qué la precisión de localización no predice el comportamiento en despliegue, un problema clave en CADe (computer-aided detection).
- Formación y docencia: puede emplearse en cursos de visión por computador médica para ilustrar el entrenamiento de detectores de objetos con datos desbalanceados (86% de fotogramas sin lesión).
- Evaluación de protocolos de validación: al estar disponible con su protocolo asociado, permite contrastar métricas clásicas (mAP) frente a métricas orientadas a la práctica clínica.
- Investigación sobre sesgos en datos médicos: el modelo evidencia sesgos hacia lesiones grandes y medianas, y una precisión casi nula en lesiones pequeñas, lo que lo hace útil para estudiar limitaciones de los datos de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que el rendimiento debe evaluarse con el protocolo TRUE-Colon en lugar de solo COCO mAP, y que el artículo reporta esta arquitectura en un punto de operación de falsas alertas coincidente con `tau* = 0.30`, apuntando a una tasa de falsos positivos a nivel de fotograma del 4-5%. Sin embargo, no se proporcionan cifras numéricas concretas en la información accesible. Se recomienda consultar el artículo (arXiv:2608.13711) para las tablas de resultados completas.

## Requisitos de hardware

- No se especifican requisitos de hardware en la información proporcionada.
- Al tratarse de un modelo RT-DETR de tamaño pequeño (el repositorio ocupa 0,1 GB), es probable que pueda ejecutarse en GPUs de consumo con al menos 4-6 GB de VRAM, pero esta estimación no está confirmada por el autor.
- El modelo se carga mediante la librería Ultralytics (`YOLO(weights)`), por lo que puede desplegarse con las herramientas habituales de esa librería (inferencia en CPU o GPU, exportación a TensorRT, ONNX, etc.).
- No se dispone de datos de latencia o throughput medidos.

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos en la misma tarea dentro de la documentación proporcionada. El artículo TRUE-Colon probablemente incluya comparaciones con otros detectores (como YOLO o Faster R-CNN), pero no se detallan en la model card. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Este modelo no es un dispositivo médico y no debe utilizarse para la toma de decisiones clínicas. El propio artículo concluye que el rendimiento bajo condiciones realistas de procedimiento completo es insuficiente para un despliegue clínico fiable.
- No ha sido validado prospectivamente ni aprobado por ningún organismo regulador.
- Entrenado con 60 procedimientos de 4 instituciones; los cambios en el hardware endoscópico, el modo de imagen o la población pueden degradar el rendimiento.
- La detección se ve dominada por lesiones grandes y medianas; la precisión promedio en lesiones pequeñas es casi nula.
- Dos subtipos histológicos (SSL y TSA) aparecen solo en el conjunto de prueba, y las lesiones sésiles serradas presentan las tasas de fallo más altas.
- El modelo opera a nivel de fotograma, sin modelado temporal: cada fotograma se puntúa de forma independiente, lo que limita su uso en vídeo continuo.
- La licencia AGPL-3.0 (heredada de Ultralytics) impone obligaciones de divulgación del código fuente si se utiliza en un producto o servicio. No es la licencia MIT del paquete de evaluación `true_colon`.
- No se proporcionan datos sobre sesgos demográficos o de población específicos más allá de la procedencia institucional de los datos.

## Enlaces

- HuggingFace: https://huggingface.co/sdoerrich97/true_colon_rtdetr_realcolon_s0
- Paper (arXiv): https://arxiv.org/abs/2608.13711
- Repositorio GitHub: https://github.com/sdoerrich97/true-colon
- Paquete de protocolo en PyPI: https://pypi.org/project/true-colon/
