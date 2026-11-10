# nikilasriram/pets-convnext-sagemaker

## Resumen

El modelo `nikilasriram/pets-convnext-sagemaker` es un clasificador de imágenes de razas de perros y gatos (37 clases) desarrollado por el usuario de Hugging Face nikilasriram. Se trata de un fine-tuning de `facebook/convnext-tiny-224`, un transformer convolucional (ConvNeXt) de la familia Tiny, entrenado sobre el dataset Oxford-IIIT Pet. El modelo resuelve una tarea acotada de clasificación de imagen en 37 categorías y se ha publicado principalmente como demostración docente para una asignatura de computación distribuida, con el entrenamiento ejecutado en un job de Amazon SageMaker sobre una instancia ml.g6.xlarge.

La relevancia del modelo es limitada fuera de su contexto educativo: es un fine-tuning ligero (5 épocas, 219 segundos facturables, 1.480 imágenes de entrenamiento y 370 de validación) que alcanza un 93,2 % de accuracy en validación. No obstante, resulta útil como ejemplo reproducible de un pipeline de clasificación de imágenes desplegable en SageMaker, exportable a ONNX y compatible con Transformers.js, lo que permite ejecutarlo tanto en servidor como en navegador.

Arquitecturalmente es un ConvNeXt-Tiny con 27.848.581 parámetros, ventana de entrada de 224×224 píxeles y licencia CC BY-SA 4.0. No es un modelo generativo ni multimodal: su única salida es una distribución de probabilidad sobre las 37 razas del dataset Oxford-IIIT Pet.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ConvNeXt (transformer convolucional), variante Tiny, entrada 224×224 |
| Parametros totales | 27.848.581 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, sin contexto textual) |
| Tipos de cuantizacion | no disponible (el repo incluye pesos safetensors y ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (modelo de clasificación de imágenes, sin capacidades lingüísticas) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

El modelo parte de `facebook/convnext-tiny-224`, un ConvNeXt-Tiny preentrenado en ImageNet-1k. ConvNeXt es una arquitectura que moderniza las CNN tradicionales incorporando decisiones de diseño propias de los Vision Transformers (kernels grandes de 7×7, normalización LayerNorm, activación GELU, menos etapas con más canales por etapa y un stem tipo patchify). La variante Tiny tiene 27,8 M de parámetros y opera sobre entradas de 224×224 píxeles.

El fine-tuning se realizó sobre el dataset Oxford-IIIT Pet con un split estratificado 80/20 (1.480 imágenes de entrenamiento y 370 de validación), durante 5 épocas, en un job de SageMaker (`pets-pytorch-2026-11-10-18-16-14-787`) sobre instancia ml.g6.xlarge con 219 segundos facturables. La model card no detalla hiperparámetros como learning rate, optimizador, scheduler, aumento de datos ni técnica de regularización, por lo que esa información se considera no disponible. Tampoco se documenta el uso de RLHF, DPO ni técnicas de alineación, algo esperable en un clasificador supervisado. El resultado declarado es un 93,2 % de accuracy en validación.

## Capacidades

- Clasificación de imágenes en 37 razas de perro y gato del dataset Oxford-IIIT Pet.
- Salida de probabilidades por clase mediante el pipeline `image-classification` de Transformers.
- Inferencia en Python con `transformers.pipeline`.
- Exportación a ONNX incluida en el repositorio, lo que permite despliegue en runtimes ONNX.
- Compatibilidad declarada con Transformers.js, lo que habilita inferencia en navegador o en Node.js.
- Compatibilidad con endpoints de Hugging Face (`endpoints_compatible`) y despliegue en SageMaker.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, generación de texto, código, matemáticas, visión general más allá de la clasificación ni capacidades multilingües.

## Casos de uso

- Demo docente de pipeline MLOps: reproducción del flujo completo de entrenamiento en SageMaker (job, instancia ml.g6.xlarge, métricas de validación) como material de una asignatura de computación distribuida; el modelo sirve como artefacto final verificable.
- Clasificación de fotos de mascotas en aplicaciones de consumo: integración vía `transformers.pipeline` para etiquetar imágenes subidas por usuarios con una de las 37 razas, con un coste de inferencia bajo al tratarse de un modelo de 27,8 M de parámetros.
- Prototipado rápido en navegador: gracias a la exportación ONNX y la compatibilidad con Transformers.js, se puede ejecutar la clasificación en el cliente sin enviar imágenes a un servidor, útil para demos web o aplicaciones con requisitos de privacidad.
- Filtrado y organización de datasets de imágenes de animales: uso del clasificador para preetiquetar lotes de fotos y acelerar la anotación manual en proyectos de visión.
- Despliegue serverless en AWS: al estar entrenado y empaquetado para SageMaker, encaja en arquitecturas de inferencia gestionada con endpoints bajo demanda para cargas esporádicas.
- Base para fine-tuning adicional: al ser un checkpoint ConvNeXt-Tiny ya adaptado al dominio de mascotas, puede servir como punto de partida para clasificadores más específicos (por ejemplo, distinguir razas dentro de una sola especie o detectar condiciones visuales).

## Benchmarks y rendimiento

| Metrica | Valor | Contexto |
|---|---|---|
| Accuracy de validación | 93,2 % | Split 80/20 de Oxford-IIIT Pet, 370 imágenes de validación |
| Épocas de entrenamiento | 5 | Job de SageMaker |
| Tiempo facturable de entrenamiento | 219 s | Instancia ml.g6.xlarge |

No se han publicado resultados de benchmarks estándar (ImageNet, MMLU, HumanEval, GSM8K u otros) en la información disponible. La única métrica reportada es la accuracy de validación sobre el propio split del dataset Oxford-IIIT Pet.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: en torno a 110 MB para los pesos (27,8 M de parámetros × 4 bytes), más activaciones; cabe holgadamente en cualquier GPU consumer.
- VRAM estimada en FP16: aproximadamente 56 MB para los pesos.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; tarjetas como RTX 3060, RTX 4090, T4, A10G o A100 pueden ejecutar el modelo sin problemas. Para entrenamiento, una ml.g6.xlarge de SageMaker fue suficiente según la model card.
- Cabe en GPU consumer: sí, en cualquier GPU consumer moderna e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: `transformers` (PyTorch), ONNX Runtime, Transformers.js, endpoints de Hugging Face y Amazon SageMaker.
- Latencia y throughput: no disponibles en la información proporcionada. Por el tamaño del modelo y la resolución de entrada (224×224), se espera una latencia de milisegundos por imagen en GPU, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nikilasriram/pets-convnext-sagemaker | 27,8 M | Imagen 224×224 | Clasificación 37 razas | CC BY-SA 4.0 | Hugging Face, ONNX, SageMaker |
| facebook/convnext-tiny-224 | 28,6 M aprox. | Imagen 224×224 | Clasificación ImageNet-1k (1000 clases) | CC BY-NC 4.0 (según model card original) | Hugging Face |
| google/vit-base-patch16-224 | 86 M aprox. | Imagen 224×224 | Clasificación ImageNet-1k | Apache 2.0 | Hugging Face |
| timm/convnext-tiny.fb_in22k_ft_in1k | 28,6 M aprox. | Imagen 224×224 | Clasificación ImageNet-1k | Apache 2.0 (según timm) | Hugging Face, timm |

La comparación con alternativas de la misma categoría se limita a modelos de clasificación de imágenes de tamaño similar; no se dispone de otros fine-tunings públicos sobre Oxford-IIIT Pet en la información proporcionada para comparar accuracy directamente. Los datos de parámetros y licencias de los modelos alternativos son aproximados y deben verificarse en sus respectivas model cards.

## Limitaciones y advertencias

- Modelo de dominio muy restringido: solo clasifica las 37 razas de Oxford-IIIT Pet; cualquier imagen fuera de ese conjunto (otras especies, razas no incluidas, escenas generales) producirá una etiqueta forzada entre las 37 clases.
- Riesgo de alucinación en sentido amplio: al ser un clasificador, siempre devuelve una distribución de probabilidad; no indica "no sé" ni detecta imágenes fuera de distribución. Es necesario aplicar umbrales de confianza en producción.
- Sesgos del dataset: Oxford-IIIT Pet contiene un número variable de imágenes por raza y procede de una fuente concreta (Parkhi et al., CVPR 2012); el modelo puede rendir peor en razas con pocas muestras o en condiciones de iluminación, ángulo y fondo distintas a las del dataset.
- Entrenamiento ligero: 5 épocas y 1.480 imágenes de entrenamiento; la accuracy del 93,2 % corresponde a un split concreto y no garantiza generalización a otros conjuntos.
- Licencia CC BY-SA 4.0: permite uso comercial, pero obliga a atribuir y a compartir las obras derivadas bajo la misma licencia; conviene revisar las implicaciones para productos propietarios.
- Sin información sobre hiperparámetros, composición exacta del split ni semilla, lo que dificulta la reproducibilidad completa.
- No apto para tareas generativas, de razonamiento, multilingües ni de tool calling.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en producción ni validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nikilasriram/pets-convnext-sagemaker
- Modelo base: https://huggingface.co/facebook/convnext-tiny-224
- Dataset Oxford-IIIT Pet: https://www.robots.ox.ac.uk/~vgg/data/pets/
- Dataset en Hugging Face: https://huggingface.co/datasets/timm/oxford-iiit-pet
- Paper de referencia del dataset (Parkhi et al., CVPR 2012): https://www.robots.ox.ac.uk/~vgg/publications/2012/parkhi12a/parkhi12a.pdf
- Documentación de Transformers.js: https://huggingface.co/docs/transformers.js
- Documentación de Amazon SageMaker: https://docs.aws.amazon.com/sagemaker/
