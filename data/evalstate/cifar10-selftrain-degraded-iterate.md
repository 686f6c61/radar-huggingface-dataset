# evalstate/cifar10-selftrain-degraded-iterate

## Resumen

El modelo `evalstate/cifar10-selftrain-degraded-iterate` es un clasificador de imágenes convolucional (MediumCNN) de aproximadamente 1,56 millones de parámetros, entrenado sobre el conjunto de datos CIFAR-10. Ha sido desarrollado por el usuario `evalstate` como parte de una investigación sobre auto-entrenamiento y auto-destilación, y representa la iteración final (generación t=9) de una trayectoria de entrenamiento que ilustra el equilibrio entre eliminación de ruido y olvido de señal, descrito en el artículo de Wu, Yang y Sun (arXiv:2602.14029).

El modelo se presenta como un ejemplo del régimen de olvido de señal: después del punto óptimo de parada (t=2), continuar el auto-entrenamiento con pseudo-etiquetas degrada progresivamente la precisión en el conjunto de prueba, mientras que la confianza media del modelo sigue aumentando, lo que produce una calibración deficiente. Con una precisión de prueba del 57,68 % frente al 60,91 % del mejor iterado (t=2), este modelo sirve como herramienta didáctica y de investigación para estudiar fenómenos de sobreconfianza y degradación en pipelines de auto-entrenamiento.

Es relevante ahora porque el auto-entrenamiento y la auto-destilación son técnicas ampliamente utilizadas en el aprendizaje semi-supervisado y en la generación de datos sintéticos, y comprender sus límites y riesgos (como el olvido de señal) es crucial para diseñar sistemas robustos. Aunque no está pensado para uso en producción, su licencia Apache-2.0 permite su uso libre en investigación y educación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MediumCNN (red neuronal convolucional) |
| Parametros totales | ~1,56 millones |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No aplica (entrada de imagen 32x32) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica (tarea de vision) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch (formato nativo, probablemente .pt o .pth) |

## Arquitectura y entrenamiento

La arquitectura es una MediumCNN, una red neuronal convolucional compacta diseñada para clasificación de imágenes de baja resolución como CIFAR-10 (32x32 píxeles). El modelo se entrena mediante un proceso de auto-entrenamiento iterativo: en cada generación, el modelo actual genera pseudo-etiquetas sobre el conjunto de entrenamiento (posiblemente con datos no etiquetados o con ruido), y estas pseudo-etiquetas se utilizan para entrenar la siguiente generación. Este proceso se repite hasta K=9 generaciones, donde la última iteración es la que se publica.

El entrenamiento se enmarca en el contexto de auto-destilación y denoising-forgetting, un fenómeno descrito en el paper arXiv:2602.14029. La idea es que el auto-entrenamiento puede eliminar ruido en las etiquetas iniciales, pero más allá de un cierto punto (t*=2), el modelo comienza a olvidar señal real y a sobreajustarse a sus propias predicciones erróneas, lo que degrada la precisión y aumenta la confianza de forma espuria. No se dispone de detalles sobre el número total de tokens (no aplica), la composición exacta del dataset o el uso de técnicas como RLHF o DPO, ya que no se mencionan en la información proporcionada.

## Capacidades

- Clasificación de imágenes en CIFAR-10 (10 clases: avión, automóvil, pájaro, gato, ciervo, perro, rana, caballo, barco, camión).
- Generación de pseudo-etiquetas durante el proceso de auto-entrenamiento (aunque esta capacidad no está expuesta en la interfaz del modelo, sino que es parte del pipeline de entrenamiento).
- No dispone de capacidades de generación de texto, tool calling, agentes, visión general (más allá de la clasificación), audio o modos de razonamiento.
- El modelo no es multimodal; solo procesa imágenes de 32x32 píxeles en formato RGB.

## Casos de uso

- Investigación sobre auto-entrenamiento y auto-destilación: el modelo permite reproducir y analizar el fenómeno de denoising-forgetting, sirviendo como punto de referencia para estudiar cuándo detener el auto-entrenamiento y cómo mitigar la degradación.
- Estudio de calibración y sobreconfianza: con una precisión del 57,68 % y una confianza media del 87,9 %, el modelo es un caso práctico para investigar la discrepancia entre confianza y exactitud, y para probar métodos de calibración (temperature scaling, etc.).
- Benchmark para técnicas de regularización: se puede utilizar como base para evaluar estrategias que eviten el olvido de señal, como early stopping, mezcla de pseudo-etiquetas con etiquetas reales, o pérdidas ponderadas.
- Educación en visión por computador: al ser un modelo pequeño y fácil de cargar en PyTorch, es útil en cursos que enseñan entrenamiento de CNNs, auto-supervisión y análisis de curvas de entrenamiento.
- Comparación con modelos entrenados convencionalmente: sirve como contraste para demostrar los riesgos del auto-entrenamiento sin control, comparando su rendimiento con un CNN entrenado con supervisión completa sobre CIFAR-10 (que típicamente supera el 90 % de precisión).
- Prueba de pipelines de MLOps: por su tamaño reducido y su formato PyTorch estándar, se puede integrar en pipelines de prueba para validar herramientas de despliegue, monitorización de drift o registro de experimentos, aunque no se recomienda para producción real.

## Benchmarks y rendimiento

Los únicos datos de rendimiento disponibles son los proporcionados en la model card del autor, correspondientes al conjunto de prueba de CIFAR-10:

| Metrica | Valor |
|---|---|
| Precision en test (accuracy) | 57,68 % |
| Error en test | 42,32 % |
| Confianza media (top-1) | 0,879 |
| Mejor precision (t=2) | 60,91 % |

No se han publicado resultados en otros benchmarks (MMLU, HumanEval, etc.) porque el modelo no está diseñado para tareas de lenguaje o razonamiento general. La comparación con el mejor iterado (t=2) muestra una caída de 3,23 puntos porcentuales, lo que evidencia la degradación por olvido de señal.

## Requisitos de hardware

- VRAM estimada: el modelo tiene ~1,56 millones de parámetros. En float32 ocupa aproximadamente 6,2 MB, y en float16 unos 3,1 MB. Cualquier GPU con más de 1 GB de VRAM es suficiente; incluso una GPU integrada o una CPU pueden ejecutar la inferencia sin problemas.
- GPU recomendadas: no se requiere una GPU específica; cualquier modelo moderno (NVIDIA GTX 10xx o superior, o incluso Apple Silicon) es capaz de ejecutarlo. Para entrenamiento o fine-tuning, una GPU con 4 GB de VRAM es más que suficiente.
- Se puede ejecutar en CPU con una latencia de milisegundos por imagen (no hay datos exactos, pero por el tamaño es trivial).
- Opciones de despliegue: al ser un modelo PyTorch estándar, se puede cargar con `torch.load` o `torch.jit`. No se mencionan formatos como ONNX o TensorRT, pero se pueden convertir fácilmente. No es compatible con vLLM, llama.cpp u Ollama, ya que estos están orientados a modelos de lenguaje.
- Throughput: no se proporcionan datos, pero se estima que puede procesar cientos de imágenes por segundo en una GPU moderna.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos en el contexto de auto-entrenamiento degradado en CIFAR-10. Sin embargo, se puede comparar con un CNN típico entrenado con supervisión completa sobre CIFAR-10, que suele alcanzar precisiones superiores al 90 % con arquitecturas como ResNet-18 o VGG-16. La comparación directa no es posible sin datos de esos modelos en las mismas condiciones, por lo que se indica "no disponible".

## Limitaciones y advertencias

- Modelo de investigación: no está diseñado para uso en producción; su precisión es baja (57,68 %) y no es competitivo frente a clasificadores modernos de CIFAR-10.
- Sobreconfianza: la confianza media (0,879) es mucho mayor que la precisión real (0,5768), lo que indica una calibración deficiente. No debe utilizarse para tomar decisiones basadas en la probabilidad de salida.
- Solo CIFAR-10: el modelo solo puede clasificar las 10 clases de CIFAR-10 y no generaliza a otras imágenes o dominios.
- Degradación por auto-entrenamiento: el modelo es la última iteración de un proceso que ya ha pasado el punto óptimo; su uso como punto de partida para fine-tuning podría arrastrar errores sistemáticos.
- Licencia Apache-2.0: permite uso comercial, pero dado el bajo rendimiento y la naturaleza experimental, no se recomienda su uso en aplicaciones comerciales sin un análisis previo.
- No se dispone de información sobre sesgos específicos, pero al estar entrenado en CIFAR-10, hereda los sesgos de ese conjunto de datos (por ejemplo, categorías de objetos cotidianos, posible desbalance en ciertas clases).
- Riesgo de alucinación: no aplica, ya que no es un modelo generativo de texto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/evalstate/cifar10-selftrain-degraded-iterate
- Repositorio de scripts de entrenamiento del autor: https://huggingface.co/evalstate/training-scripts
- Paper referenciado (arXiv:2602.14029): no se ha encontrado un enlace directo, pero se cita en los tags del modelo.
- Tutorial oficial de PyTorch sobre CIFAR-10: https://docs.pytorch.org/tutorials/beginner/blitz/cifar10_tutorial.html
- Documentación de torchvision para CIFAR-10: https://docs.pytorch.org/vision/main/generated/torchvision.datasets.CIFAR10.html
