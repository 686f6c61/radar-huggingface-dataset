# sdoerrich97/true_colon_yolov8m_realcolon_s0

## Resumen

TRUE-Colon YOLOv8-M es un detector de objetos de una sola clase (`lesion`) entrenado sobre el conjunto de datos REAL-Colon, compuesto por 60 procedimientos completos de colonoscopia sin editar. El modelo ha sido desarrollado por la Cátedra de Aprendizaje Automático Explicable de la Universidad Otto-Friedrich de Bamberg (Alemania) y se publica como parte del protocolo de evaluación TRUE-Colon, presentado en el taller EndoLINA de MICCAI 2026. Su propósito principal es servir como referencia reproducible para la investigación en detección automática de pólipos y para el estudio de metodologías de evaluación en sistemas de detección asistida por vídeo.

Arquitectónicamente se basa en YOLOv8-M, con una entrada de 640×640 píxeles y un único backbone convolutional. El modelo se entrenó con un split a nivel de paciente, donde el 86,47 % de los fotogramas de entrenamiento no contienen lesiones, lo que refleja la distribución real de las colonoscopias. Se trata de una de las tres semillas (seed 0) utilizadas en el estudio; los autores advierten que reportar una única semilla de forma aislada sobreestimaría la precisión del sistema, por lo que los resultados agregados se presentan en el artículo asociado.

La relevancia de este modelo radica en que aborda una limitación conocida de los sistemas de detección de pólipos: la mayoría de los benchmarks se basan en métricas de localización (mAP) que no predicen el comportamiento en condiciones clínicas reales. TRUE-Colon propone un protocolo de evaluación que simula el uso en procedimientos completos, y este checkpoint actúa como línea base reproducible para futuras comparaciones. No está destinado a uso clínico.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOv8-M (Ultralytics) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision por imagenes) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (procesa imagenes, no texto) |
| Licencia | AGPL-3.0 |
| Formato de pesos | .pt (Ultralytics) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura YOLOv8-M, un detector de una etapa basado en redes neuronales convolucionales. El backbone extrae características multiescala y la cabeza de detección predice cajas delimitadoras y puntuaciones de confianza para una única clase (`lesion`). La entrada es de 640×640 píxeles.

El entrenamiento se realizó sobre el conjunto REAL-Colon, que incluye 60 procedimientos completos de colonoscopia de 4 instituciones. Se utilizó un split a nivel de paciente, con un 86,47 % de fotogramas sin lesión en el conjunto de entrenamiento. La configuración de entrenamiento registrada es la siguiente: batch size de 208, optimizador SGD (resuelto automáticamente por Ultralytics a partir de `optimizer=auto`, ya que el número de iteraciones supera las 10 000), tasa de aprendizaje inicial 0,01, momento 0,9, weight decay 5e-4, 100 épocas con early stopping (paciencia 10) y 3 épocas de calentamiento. La inicialización partió de pesos preentrenados en COCO, tal como los distribuye Ultralytics, y se usó la versión 8.3.232 de la librería.

No se reportan innovaciones arquitectónicas específicas más allá de la configuración estándar de YOLOv8. El modelo se entrena fotograma a fotograma, sin modelado temporal.

## Capacidades

- Detección de lesiones (pólipos) en imágenes de colonoscopia, devolviendo cajas delimitadoras y confianza.
- Inferencia sobre fotogramas individuales; no incorpora información temporal entre fotogramas.
- Compatible con el ecosistema Ultralytics: se puede cargar con `YOLO()` y usar `model.predict()`.
- Integración con el paquete de evaluación `true-colon` para reproducir el protocolo de benchmark.
- Capacidad de ajuste fino sobre otros conjuntos de datos de endoscopia, dado que es un modelo de visión genérico preentrenado en COCO.
- No soporta tool calling, agentes, ni procesamiento de lenguaje; es exclusivamente un detector visual.

## Casos de uso

- Investigación en detección de pólipos: el modelo sirve como línea base reproducible para comparar nuevos algoritmos bajo el protocolo TRUE-Colon, que evalúa el rendimiento en procedimientos completos y no solo con mAP.
- Estudio de transferencia de dominio: al estar entrenado en datos de 4 instituciones, permite analizar cómo varía el rendimiento al aplicar el modelo a vídeos de otros centros o con diferente equipamiento endoscópico.
- Análisis de sesgos por tamaño de lesión: dado que la precisión en lesiones pequeñas es casi nula, puede usarse para investigar estrategias de mejora en detección de pólipos diminutos.
- Evaluación de protocolos de métricas: el modelo se puede emplear para comparar métricas de localización (mAP) frente a métricas de comportamiento a nivel de vídeo, como la tasa de falsas alertas.
- Desarrollo de sistemas CADe (computer-aided detection) en fase de investigación: aunque no es apto para uso clínico, sirve como componente de prueba en pipelines experimentales de asistencia a la colonoscopia.
- Formación y docencia: útil en cursos de visión por computador aplicada a imágenes médicas para ilustrar el entrenamiento de detectores con datos desbalanceados y la importancia de una evaluación realista.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card remite al artículo (arXiv:2608.13711) para las tablas completas de resultados, indicando que el rendimiento se reporta en un punto de operación de falsas alertas de tau* = 0,06 sobre REAL-Colon, con una tasa de falsos positivos objetivo del 4-5 %. No se proporcionan valores numéricos por semilla en la documentación accesible.

## Requisitos de hardware

- No se especifican requisitos de hardware en la documentación del modelo.
- El peso del repositorio es de 0,1 GB, lo que sugiere un modelo ligero (YOLOv8-M suele tener alrededor de 25 millones de parámetros, aunque este dato no se confirma en la ficha).
- De forma estimada, podría ejecutarse en GPUs de consumo con al menos 4 GB de VRAM, pero esta cifra no está confirmada por los autores.
- Para despliegue, se puede utilizar directamente con Ultralytics (Python) o exportar a otros formatos (ONNX, TensorRT) mediante las herramientas de la librería.
- No se indican opciones de servicio como vLLM u Ollama, que son específicas para modelos de lenguaje.

## Comparativa con modelos similares

No se proporciona en la documentación información comparativa con otros detectores de pólipos. Dado que el modelo se enmarca en un estudio metodológico, la comparación relevante se realiza contra otras arquitecturas (por ejemplo, RT-DETR, también mencionada en la model card) y contra el protocolo de evaluación, pero no se incluyen datos cuantitativos en esta ficha.

## Limitaciones y advertencias

- El modelo no es un dispositivo médico y no debe utilizarse para la toma de decisiones clínicas. El propio artículo concluye que el rendimiento en condiciones realistas de procedimiento completo es insuficiente para un despliegue clínico fiable.
- No ha sido validado prospectivamente ni aprobado por ninguna agencia reguladora.
- El rendimiento varía con el hardware endoscópico, el modo de imagen y la población de pacientes, ya que se entrenó con 60 procedimientos de 4 instituciones.
- La precisión en lesiones pequeñas es casi nula; la detección se domina por lesiones medianas y grandes.
- Dos subtipos histológicos (SSL y TSA) solo aparecen en el conjunto de prueba, y las lesiones sésiles serradas presentan las mayores tasas de omisión.
- El modelo procesa cada fotograma de forma independiente, sin modelado temporal, lo que limita su capacidad para aprovechar el contexto de vídeo.
- La licencia AGPL-3.0 (heredada de Ultralytics) impone obligaciones de distribución de código fuente si se integra en un producto. No es la licencia MIT del paquete de evaluación `true-colon`.
- No se dispone de información sobre cuantizaciones oficiales ni sobre el número exacto de parámetros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sdoerrich97/true_colon_yolov8m_realcolon_s0
- Artículo (arXiv): https://arxiv.org/abs/2608.13711
- Repositorio GitHub: https://github.com/sdoerrich97/true-colon
- Paquete de protocolo en PyPI: https://pypi.org/project/true-colon/
