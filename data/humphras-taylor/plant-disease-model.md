# Humphras-Taylor/plant-disease-model

## Resumen

El modelo `Humphras-Taylor/plant-disease-model` es un clasificador de imágenes basado en la arquitectura MobileNetV2, publicado en Hugging Face bajo el pipeline `image-classification`. Con 2.306.662 parámetros totales, se trata de un modelo muy compacto orientado, por su nombre y arquitectura, a la detección de enfermedades en plantas a partir de imágenes. Su reducido tamaño lo hace candidato a despliegues en dispositivos con recursos limitados, aunque no se dispone de documentación que confirme el dominio exacto, el conjunto de datos de entrenamiento ni las clases de salida.

La model card del autor está generada automáticamente por la plataforma y no contiene información sustantiva: no se especifican desarrollador, licencia, idiomas, datos de entrenamiento, hiperparámetros ni resultados de evaluación. Todos los campos aparecen como `[More Information Needed]`. Esto limita severamente cualquier evaluación rigurosa del modelo y obliga a tratar cualquier uso en producción con cautela extrema.

La relevancia actual del modelo es marginal: registra cero descargas y cero likes, se publicó en noviembre de 2026 y no cuenta con documentación técnica ni benchmarks. Su interés reside únicamente en el hecho de ser un ejemplo de fine-tuning de MobileNetV2 para una tarea agroalimentaria concreta, potencialmente útil como base para experimentación, pero sin garantías de calidad ni de procedencia de los datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MobileNetV2 (CNN, según tag `mobilenet_v2`) |
| Parametros totales | 2.306.662 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de texto) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | no disponible (modelo de clasificación de imágenes) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura corresponde a MobileNetV2, una red neuronal convolucional diseñada para clasificación de imágenes eficiente en dispositivos móviles. Introducida por Sandler et al. en 2018, emplea bloques residuales invertidos con conexiones lineales de cuello de botella (*inverted residuals* y *linear bottlenecks*), lo que reduce el coste computacional y el número de parámetros manteniendo una precisión razonable. El tag `arxiv:1910.09700` presente en el repositorio corresponde al artículo de Lacoste et al. sobre estimación de emisiones de carbono en aprendizaje automático, no a un paper propio del modelo, por lo que no aporta información sobre su entrenamiento.

No se dispone de información sobre el conjunto de datos de entrenamiento, el número de imágenes, las clases de salida, el régimen de entrenamiento (precisión, épocas, optimizador), ni sobre si se aplicó aumento de datos o técnicas de regularización. Tampoco hay constancia de fine-tuning a partir de pesos preentrenados en ImageNet ni de validación cruzada. La ausencia total de documentación impide verificar la calidad del ajuste o la representatividad del dataset.

## Capacidades

- Clasificación de imágenes (pipeline `image-classification`), presumiblemente orientada a la detección de enfermedades en plantas según el identificador del modelo.
- Inferencia sobre imágenes individuales mediante la librería `transformers`.
- Compatible con endpoints de Hugging Face (tag `endpoints_compatible`).
- No se ha documentado soporte de tool calling, function calling ni razonamiento multi-paso.
- No se ha documentado capacidad multilingüe (es un modelo de visión).
- No se ha documentado capacidad de generación de texto, código, matemáticas, visión general, audio ni modo de pensamiento.
- No se dispone de información sobre las etiquetas concretas que produce el clasificador.

## Casos de uso

- Detección temprana de enfermedades foliares en cultivos: el modelo podría clasificar imágenes de hojas capturadas con un teléfono móvil e identificar la enfermedad presente, gracias a su reducido tamaño (2,3 M de parámetros) que permite inferencia en el propio dispositivo sin conexión.
- Aplicación móvil de asistencia agrícola: integrado en una app Android o iOS mediante conversión a TensorFlow Lite o ONNX, permitiría a agricultores obtener un diagnóstico preliminar en campo sin depender de conectividad.
- Triaje en sistemas de monitorización con drones: al ser un modelo ligero, podría ejecutarse a bordo de drones agrícolas para filtrar imágenes y enviar solo las sospechosas a un servidor central, reduciendo el ancho de banda necesario.
- Preprocesado en pipelines de inspección de invernaderos: como primer filtro para descartar imágenes sanas y derivar las potencialmente enfermas a un modelo de mayor capacidad o a un experto humano.
- Prototipado rápido en investigación agronómica: serviría como línea base para comparar con modelos más grandes en tareas de clasificación de patologías vegetales, siempre que se valide previamente su precisión.
- Educación y demostraciones técnicas: por su tamaño mínimo, es adecuado para talleres sobre fine-tuning de MobileNetV2 y despliegue de clasificadores de imágenes en entornos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MB en fp32 (2,3 M de parámetros × 4 bytes ≈ 9,2 MB de pesos, más activaciones y buffers), por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM; funciona en tarjetas integradas, Raspberry Pi (mediante TensorFlow Lite) y CPUs modernas.
- Cabe en GPU consumer: sí, en cualquier modelo (GTX 1050, RTX 3060, RTX 4090, etc.), así como en dispositivos móviles y embebidos.
- Opciones de despliegue: `transformers` (PyTorch), exportación a ONNX Runtime, TensorFlow Lite (previa conversión), y potencialmente `optimum` para optimización. No se han publicado pesos en GGUF para `llama.cpp`, ni variantes para vLLM o TGI (no aplicables a un modelo de visión de este tamaño).
- Latencia y throughput estimados: no disponibles. Por el tamaño del modelo, se espera latencia de milisegundos en GPU moderna y decenas de milisegundos en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Contexto/Entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Humphras-Taylor/plant-disease-model | 2,3 M | Clasificación de imágenes (presuntamente enfermedades de plantas) | Imagen (resolución no disponible) | no disponible | Hugging Face, 0 descargas |
| MobileNetV2 (ImageNet) | ~3,5 M | Clasificación de imágenes general (1000 clases) | Imagen 224×224 | Apache 2.0 (referencia original) | Ampliamente disponible en TensorFlow/Keras |
| ResNet-50 | ~25,6 M | Clasificación de imágenes general | Imagen 224×224 | Apache 2.0 (referencia original) | Ampliamente disponible |
| EfficientNet-B0 | ~5,3 M | Clasificación de imágenes general | Imagen 224×224 | Apache 2.0 (referencia original) | Ampliamente disponible |

La comparación es aproximada: no se dispone de datos de rendimiento del modelo evaluado, por lo que no puede establecerse una comparación cuantitativa con las alternativas. MobileNetV2, ResNet-50 y EfficientNet-B0 son arquitecturas de referencia con licencias permisivas y amplia documentación, a diferencia de este modelo, cuya licencia y procedencia se desconocen.

## Limitaciones y advertencias

- Ausencia total de documentación: la model card está autogenerada y no aporta información sobre datos, entrenamiento, evaluación ni uso previsto.
- Licencia no especificada: no puede confirmarse si el uso comercial está permitido; en la práctica, esto impide su adopción en producción sin aclaración previa del autor.
- Riesgo de sesgo desconocido: al no conocerse el dataset de entrenamiento, no puede evaluarse el sesgo respecto a especies de plantas, condiciones de iluminación, variedades regionales o calidad de imagen.
- Riesgo de alucinación/clasificación errónea: un clasificador de 2,3 M de parámetros sin validación publicada puede producir predicciones con alta confianza sobre clases incorrectas, especialmente en imágenes fuera de la distribución de entrenamiento.
- Sin benchmarks ni métricas: no hay forma de verificar precisión, recall, F1 ni matriz de confusión.
- Sin información sobre las clases de salida: se desconoce el número y la semántica de las etiquetas.
- Cero descargas y cero likes: no hay evidencia de uso ni validación por parte de la comunidad.
- Fecha de creación futura (2026-11-14): la marca temporal resulta anómala y sugiere posibles errores en los metadatos del repositorio.
- No apto para diagnóstico agronómico real sin validación independiente: cualquier uso en decisiones agrícolas debe acompañarse de verificación por expertos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Humphras-Taylor/plant-disease-model
- Artículo de MobileNetV2 (Sandler et al., 2018): https://arxiv.org/abs/1801.04381
- Artículo referenciado en el tag del repo (Lacoste et al., 2019, sobre emisiones de carbono): https://arxiv.org/abs/1910.09700
- Calculadora de impacto medioambiental ML CO2: https://mlco2.github.io/impact
- Documentación de `transformers` para image-classification: https://huggingface.co/docs/transformers/tasks/image_classification
