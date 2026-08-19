# sdoerrich97/true_colon_yolov8m_realcolon_s42

## Resumen

TRUE-Colon es un modelo de detección de objetos basado en YOLOv8-M, desarrollado por la Cátedra de Aprendizaje Automático Explicable de la Universidad Otto-Friedrich de Bamberg. Está entrenado específicamente para la detección de lesiones (pólipos) en imágenes de colonoscopia, utilizando el conjunto de datos REAL-Colon, que comprende 60 procedimientos completos y sin editar de colonoscopia. El modelo se publica como parte del protocolo de evaluación TRUE-Colon, presentado en el taller EndoLINA de MICCAI 2026, cuyo objetivo es exponer una asimetría de transferencia consistente en la detección de pólipos en tiempo real.

El modelo emplea la arquitectura YOLOv8 en su variante media (M), con una entrada de 640×640 píxeles y una única clase de detección (`lesion`). Se trata de un detector de una sola clase, entrenado con un split a nivel de paciente que incluye un 86,47 % de fotogramas sin lesiones. El checkpoint publicado corresponde a una de las tres semillas (seed 42) utilizadas en el estudio; los autores advierten explícitamente de que reportar una sola semilla de forma aislada sobreestimaría la precisión, por lo que los resultados agregados se presentan en el artículo asociado.

La relevancia de este modelo radica en su uso como referencia para la evaluación de métodos de detección de pólipos bajo condiciones realistas de procedimiento completo, donde la precisión de localización por sí sola no predice el comportamiento en despliegue. No está destinado a uso clínico ni a la toma de decisiones médicas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOv8-M (Ultralytics) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de visión) |
| Licencia | AGPL-3.0 |
| Formato de pesos | PyTorch (`.pt`), vía Ultralytics |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura YOLOv8, un detector de objetos de una sola etapa que utiliza una red troncal (backbone) con convoluciones estándar y una cabeza de detección acoplada. La entrada se fija a 640×640 píxeles y la salida es una única clase (`lesion`). El entrenamiento se realizó sobre el conjunto REAL-Colon, que incluye 60 procedimientos completos de colonoscopia procedentes de 4 instituciones, con un split a nivel de paciente para evitar la fuga de datos entre entrenamiento y prueba.

El proceso de entrenamiento utilizó un optimizador SGD (resuelto automáticamente por Ultralytics a partir de `optimizer=auto`, dado que el número de iteraciones supera las 10 000), con una tasa de aprendizaje inicial de 0,01, momento de 0,9 y decaimiento de peso de 5e-4. Se emplearon 100 épocas con parada temprana (patience 10) y un calentamiento de 3 épocas. El modelo se inicializó con pesos preentrenados en COCO, tal y como los distribuye Ultralytics, y se usó la versión 8.3.232 de la librería. El tamaño de lote fue de 208. No se mencionan técnicas adicionales como aumentación específica o estrategias de equilibrio de clases más allá de la composición natural del conjunto de datos.

## Capacidades

- Detección de objetos en imágenes de colonoscopia, específicamente la clase `lesion` (pólipos).
- Inferencia por fotograma individual; no incorpora modelado temporal ni seguimiento entre fotogramas.
- Funciona con imágenes de entrada de 640×640 píxeles.
- Integración sencilla con el ecosistema Ultralytics (carga mediante `YOLO` y predicción con `model.predict`).
- Compatible con el paquete de evaluación `true-colon` para reproducir el protocolo TRUE-Colon.
- No soporta generación de texto, tool calling, razonamiento multi-paso ni otras capacidades propias de modelos de lenguaje.

## Casos de uso

- Investigación en detección de pólipos: el modelo sirve como referencia para comparar nuevos algoritmos de detección bajo el protocolo TRUE-Colon, que evalúa el rendimiento en procedimientos completos y no solo en métricas de localización.
- Evaluación de metodologías de vídeo-CAD: permite estudiar cómo la precisión de localización se traduce (o no) en un comportamiento clínico útil, dado que el protocolo mide tasas de falsas alertas y otros indicadores operativos.
- Reproducción de experimentos académicos: al publicarse la semilla 42, los investigadores pueden reproducir los resultados del artículo y verificar la variabilidad entre semillas si obtienen las otras dos.
- Desarrollo de pipelines de detección en tiempo real: al ser un modelo ligero (YOLOv8-M), puede integrarse en sistemas de procesamiento de vídeo para pruebas de concepto en entornos de investigación.
- Comparación de arquitecturas: sirve como baseline para evaluar variantes de YOLOv8 u otros detectores en el dominio de la endoscopia.
- Formación y docencia: útil para demostrar la aplicación de detección de objetos en imágenes médicas y los desafíos de la evaluación realista en este ámbito.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que el artículo reporta tablas de resultados completas, pero no se reproducen aquí. Se menciona un punto de operación recomendado de `tau* = 0.06` sobre REAL-Colon, que apunta a una tasa de falsos positivos a nivel de fotograma del 4-5 %, pero no se proporcionan valores numéricos de métricas como mAP o sensibilidad en esta ficha.

## Requisitos de hardware

No se especifican requisitos de hardware en la información proporcionada. Dado que se trata de un modelo YOLOv8-M, es razonable esperar que pueda ejecutarse en GPUs de consumo medio, pero no se dispone de datos concretos sobre VRAM, latencia o throughput. Para un despliegue en producción, se recomienda consultar las guías de Ultralytics y las características del hardware objetivo.

## Comparativa con modelos similares

No se dispone de información comparativa en la model card. No se mencionan otros modelos de detección de pólipos ni se ofrecen datos de rendimiento relativos. Por tanto, no se puede establecer una comparativa objetiva con alternativas como otros detectores YOLO, RT-DETR u otros modelos específicos del dominio.

## Limitaciones y advertencias

- El modelo no es un dispositivo médico y no debe utilizarse para la toma de decisiones clínicas. El propio artículo concluye que el rendimiento en condiciones realistas de procedimiento completo sigue siendo insuficiente para un despliegue clínico fiable.
- Entrenado únicamente con 60 procedimientos de 4 instituciones; el cambio de hardware endoscópico, modo de imagen o población de pacientes puede degradar el rendimiento.
- La precisión en lesiones pequeñas es casi nula; la detección se domina por lesiones medianas y grandes.
- Dos subtipos histológicos (SSL y TSA) solo aparecen en el conjunto de prueba, y las lesiones sésiles serradas presentan las mayores tasas de fallo de detección.
- El modelo opera a nivel de fotograma, sin modelado temporal; cada imagen se puntúa de forma independiente, lo que puede provocar inestabilidad en secuencias de vídeo.
- La licencia AGPL-3.0 impone obligaciones de divulgación de código fuente si se utiliza en un producto o servicio, lo que puede ser restrictivo para uso comercial cerrado.
- No se proporcionan métricas de rendimiento detalladas en esta ficha; cualquier afirmación sobre precisión debe basarse en el artículo original.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sdoerrich97/true_colon_yolov8m_realcolon_s42
- Artículo (arXiv): https://arxiv.org/abs/2608.13711
- Repositorio GitHub: https://github.com/sdoerrich97/true-colon
- Paquete de protocolo en PyPI: https://pypi.org/project/true-colon/
