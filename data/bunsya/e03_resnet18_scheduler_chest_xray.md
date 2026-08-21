# Bunsya/E03_ResNet18_Scheduler_Chest_XRay

## Resumen

El modelo E03_ResNet18_Scheduler_Chest_XRay es un clasificador de imágenes médicas desarrollado por Bunsya como proyecto final de un bootcamp de ingeniería de IA. Su función es clasificar radiografías de tórax en dos categorías: NORMAL y PNEUMONIA, utilizando una arquitectura ResNet18 preentrenada en ImageNet con transferencia de aprendizaje y un programador de tasa de aprendizaje StepLR. El modelo se distribuye con licencia MIT y está pensado exclusivamente para fines educativos y experimentales, no para uso clínico.

La relevancia de este modelo radica en su simplicidad y reproducibilidad: demuestra un flujo completo de entrenamiento de visión por computadora aplicado a un problema médico real, con un rendimiento de test del 92,31% de precisión. Aunque no es un sistema de diagnóstico médico, sirve como referencia didáctica para desarrolladores que quieran entender cómo aplicar transfer learning a dominios especializados. El repositorio incluye los pesos entrenados en formato PyTorch (.pth) y un espacio de demostración en HuggingFace.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet18 (preentrenado en ImageNet) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (clasificación de imágenes, sin procesamiento de texto) |
| Licencia | MIT |
| Formato de pesos | PyTorch .pth |

## Arquitectura y entrenamiento

El modelo utiliza una ResNet18 estándar con pesos inicializados desde ImageNet. La capa fully connected final se reemplaza por una capa de clasificación binaria (2 clases). El entrenamiento se realizó con el optimizador Adam (tasa de aprendizaje inicial 0.0001), batch size de 32, y función de pérdida CrossEntropyLoss con pesos de clase para compensar el desequilibrio entre clases. Se aplicó un scheduler StepLR con step_size=2 y gamma=0.1, reduciendo la tasa de aprendizaje cada dos épocas. El entrenamiento duró 5 épocas, seleccionando el mejor modelo según la pérdida de validación.

No se especifica el dataset exacto utilizado, aunque por la naturaleza del problema (rayos X de tórax, neumonía) es probable que se trate del conjunto público "Chest X-Ray Images (Pneumonia)" de Kaggle, pero este dato no está confirmado en la información proporcionada. Tampoco se detalla el número total de imágenes ni la composición del split train/validation/test.

## Capacidades

- Clasificación binaria de radiografías de tórax en dos clases: NORMAL y PNEUMONIA.
- Inferencia sobre imágenes de entrada de tamaño fijo (el preprocesamiento no está documentado, pero se asume el estándar de ResNet: 224x224 píxeles).
- No soporta tool calling, function calling, ni capacidades de agente.
- No tiene capacidades multilingües ni de generación de texto.
- No incluye modo de razonamiento ni capacidades de visión general más allá de la clasificación de imágenes médicas.
- El modelo es puramente discriminativo: devuelve una probabilidad por clase.

## Casos de uso

- Demostración educativa de transfer learning: el modelo sirve como ejemplo práctico para estudiantes y desarrolladores que quieran aprender a adaptar una red preentrenada a una tarea de clasificación médica con pocos datos.
- Prototipo de detección de neumonía en entornos de investigación: puede utilizarse como baseline en proyectos académicos que exploren técnicas de aumento de datos, regularización o interpretabilidad (por ejemplo, Grad-CAM).
- Prueba de concepto para integración en aplicaciones de visualización de imágenes médicas: el modelo puede conectarse a una interfaz web (como el Space de HuggingFace) para demostrar un flujo de subida de imagen y predicción en tiempo real.
- Benchmark para comparar arquitecturas más complejas: al ser un modelo ligero y rápido, sirve como referencia de rendimiento frente a redes más profundas o con mecanismos de atención.
- Ejercicio de evaluación de sesgos y generalización: al estar entrenado en un dataset específico, permite estudiar cómo varía el rendimiento ante imágenes de otras fuentes o poblaciones.
- Material de partida para fine-tuning con más datos: los pesos .pth pueden servir como inicialización para un entrenamiento posterior con un dataset más amplio y diverso.

## Benchmarks y rendimiento

El autor proporciona los siguientes resultados sobre el conjunto de test:

| Metrica | Valor |
|---|---|
| Exactitud (accuracy) | 92,31% |
| F1 ponderado | 92,16% |
| F1 macro | 91,50% |

Reporte de clasificación por clase:

| Clase | Precision | Recall | F1-score |
|---|---|---|---|
| NORMAL | 0,9697 | 0,8205 | 0,8889 |
| PNEUMONIA | 0,9014 | 0,9846 | 0,9412 |

Matriz de confusión (valores absolutos):

| Real \ Predicho | NORMAL | PNEUMONIA |
|---|---|---|
| NORMAL | 192 | 42 |
| PNEUMONIA | 6 | 384 |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- Al ser una ResNet18, el modelo es ligero y puede ejecutarse en GPUs de consumo. No se proporcionan requisitos específicos en la documentación.
- Para inferencia en FP32, se estima que requiere menos de 1 GB de VRAM (aunque este dato no está confirmado por el autor).
- Es compatible con cualquier GPU moderna con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3060, etc.).
- Opciones de despliegue: al ser un modelo PyTorch, puede servirse con TorchServe, FastAPI, o integrarse en un Space de Gradio (como el demo oficial). También puede convertirse a ONNX para inferencia en CPU.
- No se dispone de datos de latencia o throughput medidos.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa cuantitativa con otros modelos de clasificación de rayos X de tórax. El autor no ha publicado comparaciones con alternativas como DenseNet, VGG16 o modelos específicos de imagen médica. Se puede indicar que, por su tamaño reducido, es comparable en coste computacional a otros modelos ResNet de la familia, pero no hay datos objetivos de rendimiento relativo.

## Limitaciones y advertencias

- El modelo está entrenado en un dataset específico de rayos X de tórax; su rendimiento puede no generalizar a imágenes de otros hospitales, dispositivos, poblaciones o protocolos de adquisición.
- No debe utilizarse como sistema de diagnóstico médico ni como sustituto de evaluación profesional. El propio autor lo declara explícitamente.
- La precisión por clase es asimétrica: la clase NORMAL tiene un recall bajo (82,05%), lo que implica que un 17,95% de los casos normales se clasifican erróneamente como neumonía. Esto puede generar falsos positivos en un contexto clínico.
- No se especifica el dataset de entrenamiento, por lo que no es posible evaluar posibles sesgos demográficos o de calidad de imagen.
- El modelo solo distingue entre NORMAL y PNEUMONIA; no cubre otras patologías torácicas.
- La licencia MIT permite uso comercial, pero el autor desaconseja su uso en producción médica sin validación externa y aprobación regulatoria.
- No se proporcionan pesos en formatos cuantizados (GGUF, ONNX, etc.), solo el archivo .pth original.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Bunsya/E03_ResNet18_Scheduler_Chest_XRay
- Demo en HuggingFace Spaces: https://huggingface.co/spaces/Bunsya/Chest-XRay-E03-Demo
