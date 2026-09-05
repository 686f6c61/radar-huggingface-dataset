# princejoshi-12/yolov8-spitting-detection-bus-stand

## Resumen

El modelo `princejoshi-12/yolov8-spitting-detection-bus-stand` es un detector de objetos basado en la arquitectura YOLOv8, desarrollado por el usuario princejoshi-12. Su propósito es identificar la acción de escupir en el contexto de paradas de autobús, lo que lo convierte en una herramienta potencial para sistemas de vigilancia y control de higiene en espacios públicos. El modelo se publica bajo licencia Apache-2.0 y está alojado en HuggingFace, aunque la model card no incluye información técnica adicional.

Se trata de un modelo de visión por computadora, no de lenguaje, por lo que carece de capacidades de generación de texto, razonamiento simbólico o tool calling. Al estar basado en YOLOv8, se espera que ofrezca inferencia en tiempo real, pero no se han publicado detalles sobre la variante exacta (nano, small, medium, large o extra large), el conjunto de datos de entrenamiento ni las métricas de rendimiento. La relevancia del modelo radica en su aplicación directa a la vigilancia sanitaria en transporte público, un ámbito con demanda creciente tras la pandemia de COVID-19.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOv8 (red neuronal convolucional de deteccion de objetos) |
| Parametros totales | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura YOLOv8, una red neuronal convolucional de detección de objetos en una sola etapa, desarrollada por Ultralytics. YOLOv8 es conocida por su equilibrio entre velocidad y precisión, y se utiliza habitualmente en aplicaciones de visión en tiempo real. No se ha publicado información específica sobre el proceso de entrenamiento de este modelo: se desconoce el conjunto de datos utilizado, el número de épocas, la resolución de entrada o si se aplicaron técnicas de aumento de datos. La model card del repositorio de HuggingFace está vacía, limitándose a declarar la licencia Apache-2.0, por lo que no es posible confirmar ninguna innovación técnica aplicada a este caso concreto.

## Capacidades

- Detección de objetos en imágenes y vídeo, específicamente la acción de escupir.
- Inferencia en tiempo real, característica inherente a la arquitectura YOLOv8.
- Posible integración en sistemas de videovigilancia y alerta automática.
- No soporta tool calling, function calling ni razonamiento multi-step, al tratarse de un modelo de visión.
- No tiene capacidades multilingües ni de generación de texto.
- No se han documentado capacidades adicionales como seguimiento de objetos o análisis de secuencias temporales.

## Casos de uso

- Vigilancia en paradas de autobús: el modelo puede analizar el vídeo de cámaras de seguridad y alertar a los operadores cuando detecta a una persona escupiendo, permitiendo una respuesta inmediata del personal de limpieza o seguridad.
- Control de higiene en transporte público: integrado en sistemas de videovigilancia de autobuses y estaciones, ayuda a identificar comportamientos insalubres y a mantener estándares de limpieza.
- Monitorización de espacios públicos: los ayuntamientos pueden desplegar el modelo en cámaras urbanas para detectar infracciones de limpieza y, en su caso, aplicar sanciones o campañas de concienciación.
- Automatización de alertas en sistemas de seguridad: el modelo puede conectarse a un sistema de gestión de vídeo (VMS) para enviar notificaciones en tiempo real a los responsables, reduciendo la necesidad de supervisión humana continua.
- Investigación de incidentes: el modelo puede etiquetar automáticamente los eventos de escupir en las grabaciones, facilitando la revisión posterior y la generación de informes.
- Análisis de comportamiento en entornos urbanos: permite estudiar la frecuencia y localización de estos actos para planificar medidas de higiene y asignar recursos de limpieza.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el modelo no especifica la variante de YOLOv8 utilizada (n, s, m, l o x), por lo que no se puede estimar con precisión.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: el modelo, al ser YOLOv8, puede desplegarse mediante Ultralytics, ONNX Runtime, TensorRT, OpenCV DNN o en soluciones como Roboflow, aunque no se ha confirmado la disponibilidad de pesos en estos formatos.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no se han documentado, pero al estar entrenado en un conjunto de datos no especificado, el modelo puede presentar sesgos relacionados con la distribución de los datos de entrenamiento.
- Riesgo de falsos positivos: la detección de la acción de escupir puede confundirse con otros gestos como toser, comer o hablar, lo que puede generar alertas erróneas en producción.
- Limitaciones de contexto o idioma: no aplica, al ser un modelo de visión por computadora.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero requiere incluir el aviso de licencia y las atribuciones correspondientes en cualquier distribución.
- Caveat para producción: no se han publicado métricas de rendimiento ni validación externa, por lo que no se puede garantizar su fiabilidad en entornos reales sin una evaluación previa exhaustiva.

## Enlaces

- HuggingFace: https://huggingface.co/princejoshi-12/yolov8-spitting-detection-bus-stand
- Proyecto similar de detección de escupir en GitHub: https://github.com/bilalkazii/spit-detection-system
- Repositorio oficial de Ultralytics YOLO: https://github.com/ultralytics/ultralytics
