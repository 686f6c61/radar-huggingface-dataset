# ketiswp/mlcommons-MobileNetV1-0.25-VisualWakeWords-fp32-onnx

## Resumen

El modelo `ketiswp/mlcommons-MobileNetV1-0.25-VisualWakeWords-fp32-onnx` es una conversión a ONNX en precisión FP32 del modelo MobileNetV1 0.25 Visual Wake Words desarrollado por MLCommons. MobileNetV1 es una arquitectura de convoluciones separables por profundidad diseñada para aplicaciones de visión en dispositivos con recursos limitados, y el sufijo 0.25 indica un factor de anchura que reduce el número de canales al 25 % del modelo base, lo que lo hace especialmente ligero. El modelo está orientado a la tarea de Visual Wake Words, un benchmark que consiste en detectar la presencia de una persona en una imagen, un caso de uso típico en sistemas de cámaras inteligentes y asistentes de bajo consumo.

La relevancia de este modelo radica en su formato ONNX, que permite su ejecución con múltiples runtimes (ONNX Runtime, OpenVINO, etc.) en una amplia gama de plataformas, desde microcontroladores hasta CPUs de servidor. Al estar bajo licencia Apache-2.0, es libre para uso comercial y académico. La información disponible es limitada: la model card no incluye detalles sobre el tamaño de entrada, el número de parámetros o el conjunto de datos de entrenamiento, por lo que varias especificaciones quedan sin confirmar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MobileNetV1 (convoluciones separables por profundidad) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no aplicable (modelo de vision) |
| Tipos de cuantizacion | FP32 (esta version); existe una version INT8 en el mismo repositorio |
| Idiomas soportados | no disponible (no aplica, modelo de vision) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (safetensors no disponible) |

## Arquitectura y entrenamiento

MobileNetV1 emplea convoluciones separables por profundidad en lugar de convoluciones estándar, lo que reduce significativamente el número de operaciones y parámetros manteniendo una precisión razonable. El factor 0.25 indica que el ancho de la red se reduce al 25 %, es decir, el número de canales en cada capa es una cuarta parte del modelo base, lo que produce un modelo extremadamente compacto. El modelo está entrenado para la tarea Visual Wake Words, un benchmark del grupo MLCommons que consiste en clasificar si una imagen contiene o no a una persona (dos clases). El conjunto de datos original para esta tarea suele derivar del conjunto COCO, filtrado para la detección de personas, aunque no se ha confirmado en la documentación disponible.

No se han publicado detalles sobre el proceso de entrenamiento, el número de épocas, el tamaño del dataset o si se aplicaron técnicas de regularización específicas. La conversión a ONNX en FP32 no introduce cambios en la arquitectura, solo en el formato de pesos, lo que facilita la inferencia en entornos de producción con ONNX Runtime.

## Capacidades

- Clasificacion de imagenes binaria: detecta la presencia de una persona en una imagen (clase "persona" vs. "fondo").
- Inferencia de baja latencia: su tamaño reducido permite ejecutar el modelo en dispositivos con pocos recursos.
- Compatibilidad con runtime ONNX: funciona con ONNX Runtime, OpenVINO, TensorRT y otros.
- Precisión FP32: conserva la precisión original del modelo sin cuantización (la versión INT8 está disponible por separado).
- No soporta tool calling, generación de texto, razonamiento multi-paso ni otras capacidades fuera de la visión.
- Multilingüismo: no aplica, es un modelo de visión.

## Casos de uso

- Camaras inteligentes de seguridad: el modelo puede integrarse en dispositivos de borde para detectar la presencia de personas y activar alertas, gracias a su bajo consumo y a que se ejecuta en CPU o en aceleradores ligeros.
- Asistentes de despertar por vision: en dispositivos como altavoces inteligentes con cámara, el modelo puede activar el sistema cuando detecta que hay una persona delante, ahorrando energía cuando no hay actividad.
- Conteo de personas en espacios publicos: en combinación con un pipeline de captura de fotogramas, el modelo puede clasificar si hay o no personas en cada imagen y generar estadísticas de ocupación.
- Filtrado de imagenes en sistemas de almacenamiento: antes de guardar fotos, se puede usar el modelo para descartar imágenes sin personas, reduciendo el espacio de almacenamiento.
- Prototipado de aplicaciones de vision: al ser un modelo ONNX de un solo archivo y licencia permisiva, es adecuado para probar flujos de trabajo de clasificación de imágenes en entornos de desarrollo.
- Benchmarking de rendimiento en hardware embebido: el modelo es un candidato ideal para medir la latencia y el throughput de diferentes plataformas (Raspberry Pi, NVIDIA Jetson, CPUs x86) gracias a su pequeño tamaño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas como precisión, recall o F1 sobre Visual Wake Words. Tampoco se especifican comparaciones con otros modelos en el repositorio.

## Requisitos de hardware

- VRAM estimada: al ser un modelo FP32 de tamaño reducido, la memoria necesaria es muy baja. Con un tamaño de entrada típico de 128x128 píxeles (aunque no confirmado), la inferencia puede ejecutarse en memoria de CPU sin necesidad de GPU.
- GPU recomendadas: no se requiere GPU; funciona en CPU, y en GPUs de gama baja como una NVIDIA Jetson Nano o una GTX 1050 con amplio margen.
- En consumer GPU: sí, en cualquier GPU moderna cabe con holgura.
- Opciones de despliegue: ONNX Runtime, OpenVINO, llama.cpp (no relevante para visión), TGI (no relevante). Para despliegue en producción, ONNX Runtime es la opción natural.
- Latencia y throughput: no se han publicado datos específicos, pero por la arquitectura y el factor 0.25, se espera una latencia en CPU del orden de milisegundos para una sola imagen.

## Comparativa con modelos similares

No hay información suficiente para comparar directamente este modelo con otros de la misma categoría. No se conocen modelos comparables con el mismo propósito (Visual Wake Words) en el repositorio. Como referencia genérica, MobileNetV1 0.25-128 (de OpenVINO) es una variante similar, pero no se dispone de datos de rendimiento de este modelo concreto. Por tanto, no se puede realizar una comparativa fiable.

## Limitaciones y advertencias

- Sesgos conocidos: no se han documentado sesgos específicos, pero al ser un modelo entrenado probablemente con imágenes de COCO, puede tener un rendimiento inferior en entornos con condiciones de iluminación o demografía no representadas.
- Riesgo de alucinación: no aplica, es un modelo de clasificación, no de generación.
- Limitaciones de contexto o idioma: no aplica, es un modelo de visión.
- Restricciones de licencia: licencia Apache-2.0, permite uso comercial y modificación, pero se debe conservar el aviso de copyright.
- Caveat para producción: la precisión en la detección de personas puede no ser suficiente para aplicaciones críticas de seguridad; se recomienda validar con el conjunto de datos de uso real antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ketisinstance/mlcommons-MobileNetV1-0.25-VisualWakeWords-fp32-onnx
- Versión INT8 del modelo: https://huggingface.co/ketisinstance/mlcommons-MobileNetV1-0.25-VisualWakeWords-int8-onnx
- Repositorio original de MLCommons Tiny: https://github.com/mlcommons/tiny/tree/4addd0fa08d216e20637637874e084895f289da4/benchmark/training/visual_wake_words
- Paper de MobileNets (arXiv): https://arxiv.org/abs/1704.04861
