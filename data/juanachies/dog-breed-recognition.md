# juanachies/dog-breed-recognition

## Resumen

`juanachies/dog-breed-recognition` es un repositorio de Hugging Face que contiene dos modelos de visión por computador entrenados para la clasificación de razas de perro: una ResNet-18 preentrenada en ImageNet y afinada para la tarea, y una CNN personalizada entrenada desde cero. Ambos están implementados en PyTorch y se distribuyen junto con el código de definición de arquitectura, preprocesado e inferencia alojado en un repositorio de GitHub externo.

El modelo resuelve una tarea de clasificación de imágenes cerrada sobre 70 razas de perro, empleando el dataset público "70 Dog Breeds Image Dataset". No se trata de un modelo de lenguaje ni de un modelo fundacional multimodal: es un conjunto de pesos de clasificación de imágenes de propósito específico, orientado a experimentación y demostración.

Su relevancia es limitada en el ecosistema actual: el repositorio no declara licencia, pipeline, idiomas ni métricas de evaluación, tiene cero descargas y cero likes, y su tamaño es de aproximadamente 0,1 GB. Resulta útil como referencia docente o como punto de partida para proyectos de clasificación de imágenes, pero no como componente de producción sin una evaluación adicional por parte del integrador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet-18 (preentrenada en ImageNet y afinada) y CNN personalizada entrenada desde cero |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | no disponible (se infiere PyTorch, no confirmado en la model card) |

## Arquitectura y entrenamiento

El repositorio incluye dos arquitecturas diferenciadas. La primera es una ResNet-18, red neuronal convolucional residual de 18 capas con conexiones skip, preentrenada en ImageNet y posteriormente afinada sobre el dataset de 70 razas de perro. La segunda es una CNN personalizada entrenada desde cero, sin especificar en la model card el número de capas, los filtros por capa ni la estrategia de regularización empleada.

No se documentan en la información disponible el número de épocas, el tamaño del conjunto de entrenamiento/validación/test, las técnicas de aumento de datos, la función de pérdida, el optimizador ni la resolución de entrada. Tampoco se indica si hubo ajuste fino completo o congelación de capas en la ResNet-18. El dataset empleado es el "70 Dog Breeds Image Dataset", de origen público, pero no se detalla su composición exacta ni su licencia en la model card.

## Capacidades

- Clasificación de imágenes de perros en 70 razas mediante la ResNet-18 afinada.
- Clasificación de imágenes de perros en 70 razas mediante la CNN personalizada entrenada desde cero.
- Comparación experimental entre transferencia de aprendizaje (ResNet-18 + ImageNet) y entrenamiento desde cero sobre el mismo dataset.
- Inferencia en PyTorch, con pipeline de preprocesado definido en el repositorio de GitHub asociado.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No dispone de capacidades multilingües, generación de texto, código, matemáticas, audio ni visión general más allá de la clasificación de razas.
- No se documenta modo thinking, visión multimodal ni otras capacidades especiales.

## Casos de uso

- Prototipado de clasificadores de imagen: sirve como base para validar un pipeline de entrenamiento y evaluación en PyTorch antes de escalar a un dataset propio de razas caninas.
- Aplicación educativa de transferencia de aprendizaje: la comparación entre ResNet-18 preentrenada y CNN desde cero permite ilustrar el impacto del preentrenamiento en ImageNet con un caso concreto.
- Demo de clasificación en una app web o móvil: los pesos, al ocupar aproximadamente 0,1 GB en el repositorio, se pueden integrar en un backend ligero para inferencia sobre imágenes subidas por el usuario.
- Filtrado o etiquetado semiautomático de imágenes en un archivo fotográfico: el modelo puede preetiquetar imágenes de perros con una de las 70 razas para revisión humana posterior.
- Base para fine-tuning sobre un subconjunto de razas: si el proyecto solo necesita distinguir entre 5 o 10 razas, la ResNet-18 afinada puede reentrenarse con un dataset más pequeño y específico.
- Benchmark interno de infraestructura de inferencia: al ser un modelo pequeño de clasificación, es útil para medir latencia y throughput de un entorno de despliegue (CPU, GPU, ONNX Runtime) antes de pasar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la model card. Para una ResNet-18 en FP32, el orden de magnitud habitual es inferior a 1 GB, pero no se confirma en la información proporcionada.
- GPU recomendadas: no disponibles. Por el tamaño típico de ResNet-18, cualquier GPU consumer moderna (por ejemplo, RTX 3060 o superior) debería ser suficiente, pero no se documenta.
- Compatibilidad con GPU consumer: probable por el tamaño del modelo (0,1 GB de repositorio), aunque no confirmada.
- Opciones de despliegue: PyTorch es el framework declarado. No se documentan exportaciones a ONNX, TorchScript, TensorRT ni integraciones con vLLM, llama.cpp, Ollama o TGI (estas últimas no aplican a un modelo de visión).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tarea | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| juanachies/dog-breed-recognition | Clasificación de 70 razas de perro | no disponible | no aplica | no disponible | Hugging Face, 0 descargas |
| ResNet-18 original (torchvision) | Clasificación ImageNet (1000 clases) | ~11,7 M | no aplica | BSD-3-Clause | Ampliamente disponible |
| Otros clasificadores de razas caninas en Hugging Face | Clasificación de razas | variable | no aplica | variable | variable |

No se dispone de datos de rendimiento del modelo evaluado que permitan una comparación cuantitativa con alternativas. La comparación con la ResNet-18 original de torchvision es estructural (misma arquitectura base), no de resultados.

## Limitaciones y advertencias

- La model card no declara licencia, lo que impide determinar si el uso comercial está permitido; debe contactarse con el autor antes de cualquier uso en producción.
- No se publican métricas de accuracy, precisión, recall ni matriz de confusión, por lo que se desconoce el rendimiento real del modelo.
- No se documenta la composición del dataset de entrenamiento ni su balance de clases, lo que impide evaluar sesgos por raza, iluminación, fondo o calidad de imagen.
- Riesgo de sobreajuste y de generalización deficiente fuera de la distribución del dataset de entrenamiento (por ejemplo, fotos de usuario con fondos no controlados).
- La CNN personalizada entrenada desde cero, sin datos de entrenamiento ni regularización documentados, es especialmente susceptible a sobreajuste.
- El modelo solo clasifica entre 70 razas; cualquier imagen que no sea de perro o que corresponda a una raza no incluida se forzará a una de las clases disponibles.
- No hay información sobre el pipeline de preprocesado en la model card; hay que consultar el repositorio de GitHub para conocer resolución de entrada y normalización.
- El repositorio tiene cero descargas y cero likes, lo que sugiere ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/juanachies/dog-breed-recognition
- Repositorio GitHub asociado: https://github.com/nicoomancini/tuia-dog-recognition-app/tree/main
