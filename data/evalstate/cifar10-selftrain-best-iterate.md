# evalstate/cifar10-selftrain-best-iterate

## Resumen

El modelo `evalstate/cifar10-selftrain-best-iterate` es un clasificador de imágenes para el dataset CIFAR-10, desarrollado por el autor evalstate como parte de una investigación sobre el equilibrio entre denoising y olvido en el autoentrenamiento (self-training) y la autodestilación (self-distillation). Se trata de una red convolucional media (MediumCNN) con aproximadamente 1,56 millones de parámetros, entrenada desde cero sobre pseudoetiquetas generadas por un modelo maestro (iteración 1) en un subconjunto disjunto de CIFAR-10 (n=5000, linaje eta=0.4).

La relevancia de este modelo radica en que representa el punto óptimo de una trayectoria de autodestilación, donde se minimiza el error de test antes de que el fenómeno de "olvido de señal" domine. Según la model card, este iterado alcanza una precisión del 60,91% en el conjunto de test, superando al profesor inicial (58,22%). El trabajo se apoya en el artículo de Wu, Yang y Sun (arXiv:2602.14029) sobre el trade-off denoising-vs-forgetting, y se distribuye bajo licencia Apache-2.0.

Aunque se trata de un modelo pequeño y con un rendimiento modesto en términos absolutos, su interés es principalmente investigador: sirve para estudiar dinámicas de autoentrenamiento, generación de pseudoetiquetas y la evolución de la precisión a lo largo de iteraciones sucesivas. No está pensado para uso en producción, sino como herramienta de análisis y reproducción de resultados académicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MediumCNN (red convolucional media, sin especificación detallada de capas) |
| Parametros totales | ~1,56 millones |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no aplica (modelo de visión, sin contexto secuencial) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de visión, no lingüístico) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch (checkpoint nativo, formato no especificado; probablemente .bin o .pt) |

## Arquitectura y entrenamiento

La arquitectura es una MediumCNN, una red neuronal convolucional de tamaño intermedio diseñada específicamente para CIFAR-10. No se detallan las capas concretas en la información disponible, pero por el número de parámetros (1,56M) se trata de una red relativamente compacta, típica para experimentos de investigación en este dataset.

El entrenamiento sigue un esquema de autoentrenamiento (self-training) con autodestilación. Se parte de un modelo profesor (iteración t=0) que genera pseudoetiquetas sobre un subconjunto de CIFAR-10 (n=5000, con un factor eta=0.4 que probablemente controla la proporción de muestras o la confianza de las etiquetas). Estas pseudoetiquetas se utilizan para entrenar desde cero un modelo alumno (iteración t=1), y así sucesivamente. El modelo aquí presentado es la iteración t=2, que según la curva de error en forma de U representa el mínimo de error de test antes de que el olvido de señal comience a dominar.

El proceso reproduce el trade-off entre denoising (la capacidad de las pseudoetiquetas de limpiar el ruido de las etiquetas originales) y el olvido (la pérdida de información útil cuando las pseudoetiquetas se degradan). No se menciona el uso de RLHF ni DPO; el entrenamiento es supervisado con pseudoetiquetas duras. El número total de tokens o épocas no está disponible.

## Capacidades

- Clasificación de imágenes en 10 clases del dataset CIFAR-10 (avión, automóvil, pájaro, gato, ciervo, perro, rana, caballo, barco, camión).
- Generación de pseudoetiquetas: al ser un iterado de un proceso de autodestilación, puede utilizarse como profesor para generar pseudoetiquetas en nuevas muestras, aunque su precisión limitada condiciona la calidad de estas.
- Análisis de dinámicas de autoentrenamiento: permite estudiar cómo evoluciona la precisión y la confianza media a lo largo de iteraciones de autodestilación.
- Estimación de incertidumbre: la confianza media top-1 reportada (0.832) puede servir como referencia para calibrar modelos similares.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades lingüísticas, al ser un modelo puramente visual.

## Casos de uso

- Investigación en autoentrenamiento y autodestilación: el modelo sirve como punto de referencia para reproducir el trade-off denoising-vs-forgetting descrito en el paper de Wu et al. (arXiv:2602.14029). Se puede cargar en PyTorch y evaluar su precisión en CIFAR-10 para verificar la curva de error.
- Estudio de pseudoetiquetas: al ser un iterado intermedio, permite analizar cómo las pseudoetiquetas generadas por un profesor afectan al aprendizaje del alumno, comparando la precisión entre iteraciones.
- Benchmark de modelos pequeños: con solo 1,56M de parámetros, puede utilizarse como baseline en experimentos que comparen arquitecturas compactas para CIFAR-10.
- Docencia y aprendizaje: su tamaño reducido lo hace ideal para demostrar conceptos de autoentrenamiento, destilación y evaluación de modelos de visión en entornos educativos o tutoriales.
- Calibración de confianza: la métrica de confianza media (0.832) puede emplearse para estudiar la relación entre precisión y confianza en clasificadores entrenados con pseudoetiquetas.
- Reproducción de experimentos: investigadores pueden descargar el checkpoint y reproducir los resultados reportados (60,91% de precisión) para validar metodologías o extender el análisis a otros datasets.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible más allá de los reportados en la model card. La siguiente tabla resume las métricas proporcionadas:

| Metrica | Valor |
|---|---|
| Precisión en test (CIFAR-10) | 60,91% |
| Error en test | 39,09% |
| Confianza media top-1 | 0,832 |
| Precisión del profesor (t=0) | 58,22% |

No se dispone de comparaciones con otros modelos (p. ej., ResNet, VGG) ni de resultados en otros benchmarks como ImageNet. El modelo es específico para CIFAR-10 y su rendimiento es bajo en comparación con arquitecturas modernas (que superan el 90% de precisión en este dataset), pero su propósito no es la precisión máxima sino el estudio de dinámicas de autoentrenamiento.

## Requisitos de hardware

- VRAM estimada: el modelo tiene ~1,56M de parámetros. En float32, el checkpoint ocupa aproximadamente 6,24 MB, por lo que cabe holgadamente en cualquier GPU con al menos 1 GB de VRAM, e incluso en CPU.
- GPU recomendadas: cualquier GPU moderna (NVIDIA GTX 1050 o superior) es suficiente. No se requieren GPUs de alta gama como A100 o H100.
- Compatibilidad con GPU de consumo: sí, cualquier GPU de consumo (RTX 3060, RTX 4090, etc.) puede ejecutar el modelo sin problemas.
- Opciones de despliegue: al ser un checkpoint de PyTorch, puede cargarse directamente con `torch.load()` o mediante la API de HuggingFace Transformers (si se adapta). No se mencionan formatos como ONNX o TensorRT, pero al ser un modelo pequeño, la conversión es trivial.
- Latencia y throughput: no se dispone de datos medidos, pero dado el tamaño, la inferencia en lote sobre CIFAR-10 (10.000 imágenes) debería completarse en segundos en una GPU moderna, y en pocos minutos en CPU.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa cuantitativa con otros modelos de la misma categoría (clasificadores CIFAR-10 pequeños). Sin embargo, se puede contextualizar cualitativamente:

| Modelo | Parámetros | Precisión CIFAR-10 | Licencia | Disponibilidad |
|---|---|---|---|---|
| evalstate/cifar10-selftrain-best-iterate | 1,56M | 60,91% | Apache-2.0 | HuggingFace |
| ResNet-18 (típico) | ~11M | ~93% | MIT | Varios repos |
| VGG-16 (típico) | ~138M | ~93% | MIT | Varios repos |

La comparación muestra que este modelo tiene una precisión mucho menor que arquitecturas estándar, pero su interés no es la precisión sino el estudio del proceso de autoentrenamiento. No hay modelos comparables publicados con el mismo enfoque de autodestilación iterativa en la información disponible.

## Limitaciones y advertencias

- Precisión baja: con un 60,91% de acierto, el modelo no es adecuado para tareas de clasificación en producción donde se requiera alta exactitud.
- Sesgos y errores: al entrenarse sobre un subconjunto reducido (n=5000) y con pseudoetiquetas, puede presentar errores sistemáticos en ciertas clases. No se han analizado sesgos específicos.
- Riesgo de alucinación: no aplica, al ser un modelo discriminativo de visión, no generativo.
- Limitaciones de contexto: al ser un modelo de imagen, no procesa texto ni secuencias largas.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el modelo es de investigación y no se garantiza su idoneidad para aplicaciones reales.
- Dependencia del proceso de entrenamiento: el checkpoint es un iterado específico (t=2) de una trayectoria concreta; otros iterados pueden tener rendimiento diferente. No se proporcionan instrucciones de reproducción completas (hiperparámetros, épocas, etc.).
- Formato de pesos: no se especifica si el checkpoint está en formato safetensors o binario de PyTorch, lo que puede dificultar la carga en ciertos entornos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/evalstate/cifar10-selftrain-best-iterate
- Paper de referencia (Wu, Yang & Sun, arXiv:2602.14029): no disponible directamente en la información, pero se cita en la model card.
- Repositorio del autor: no se ha encontrado en la búsqueda web.
- Tutorial oficial de PyTorch sobre CIFAR-10 (contexto general): https://docs.pytorch.org/tutorials/beginner/blitz/cifar10_tutorial.html
