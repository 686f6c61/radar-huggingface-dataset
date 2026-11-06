# Box2005/cifar10-ioc-nn

## Resumen

CIFAR-10 IOC-NN es una implementación en PyTorch de un perceptrón multicapa (MLP) diseñado bajo una restricción de convexidad parcial, publicado por el usuario Box2005 en Hugging Face. El modelo resuelve la tarea de clasificación de imágenes del conjunto CIFAR-10 (10 clases, imágenes de 32x32x3 píxeles) y su interés técnico radica en la restricción arquitectónica: la primera capa es libre, pero todas las capas posteriores mantienen pesos no negativos, lo que convierte al modelo, para una representación fija de la primera capa, en un clasificador convexo respecto a esas activaciones intermedias.

El modelo es extremadamente pequeño (402.250 parámetros) y no es un modelo de lenguaje: no genera texto, no soporta tool calling ni tiene ventana de contexto en el sentido habitual. Se trata de un artefacto de investigación educativa o experimental sobre redes con restricciones de convexidad, empaquetado como un `state_dict` de PyTorch. Su relevancia es limitada fuera de ese nicho: sirve como ejemplo reproducible de cómo imponer no negatividad en los pesos y evaluar el coste en precisión frente a un MLP sin restricciones.

La información disponible es escasa: el repositorio tiene 0 GB, sin descargas ni likes, sin licencia declarada, sin idiomas declarados y sin pipeline asignado. La model card proporciona la arquitectura, el recuento de parámetros, el procedimiento de preprocesado y una única métrica de precisión en test (0,4841).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MLP (perceptrón multicapa) fully connected: 3072 → 128 → 64 → 10; ELU en las dos capas ocultas, sin activación en la salida (logits) |
| Parámetros totales | 402.250 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de clasificación de imágenes, entrada fija de 3072 valores) |
| Tipos de cuantización | no disponible (pesos en PyTorch `state_dict`, presumiblemente float32) |
| Idiomas soportados | no disponible (no es un modelo lingüístico) |
| Licencia | no disponible |
| Formato de pesos | `model_ioc_p0.pt` (PyTorch `state_dict`), más `preprocessing.npz` con media y desviación típica del conjunto de entrenamiento |

## Arquitectura y entrenamiento

La red es un MLP de tres capas lineales con 3072 entradas (imagen 32x32x3 aplanada), dos capas ocultas de 128 y 64 neuronas con activación ELU, y una capa de salida de 10 logits sin activación. La innovación declarada es la restricción de convexidad: la primera capa no tiene restricciones, pero los pesos de todas las capas posteriores se mantienen no negativos. Según la model card, tras cada paso del optimizador los valores negativos se sustituyen por `exp(w - 5)`, una reparametrización suave que empuja los pesos hacia valores positivos pequeños en lugar de recortarlos a cero. Esto preserva la diferenciabilidad y evita que los pesos queden bloqueados exactamente en 0.

El preprocesado consiste en aplanar la imagen a 3072 valores, dividir entre 255 y estandarizar cada columna con la media y la desviación típica del conjunto de entrenamiento, almacenadas en `preprocessing.npz` (las columnas con desviación 0 usan 1). No se especifican en la información disponible el número de épocas, el optimizador, la tasa de aprendizaje, el tamaño de batch, la composición exacta del dataset más allá de CIFAR-10, ni si hubo aumentación de datos. Tampoco se documenta ningún proceso de RLHF, DPO ni similar, algo esperable en un clasificador de imágenes.

## Capacidades

- Clasificación de imágenes de CIFAR-10 en 10 clases (avión, automóvil, pájaro, gato, ciervo, perro, rana, caballo, barco, camión).
- Entrada fija de 32x32x3 píxeles; no admite resoluciones distintas sin reentrenamiento o adaptación.
- Salida en forma de logits de 10 dimensiones; requiere aplicar softmax para obtener probabilidades.
- Propiedad de convexidad parcial: para una primera capa fija, la función de decisión respecto a las activaciones intermedias es convexa, lo que facilita análisis teóricos de optimalidad.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo thinking, visión general (solo clasificación de imágenes de 32x32), audio ni otras modalidades.

## Casos de uso

- Docencia y experimentación sobre convexidad en redes neuronales: el modelo sirve como ejemplo mínimo y reproducible para estudiar cómo la restricción de no negatividad en capas ocultas afecta a la precisión y a la geometría del problema de optimización.
- Reproducción de resultados académicos: con 402.250 parámetros y un único checkpoint, permite replicar el experimento en una CPU convencional en segundos, útil para validar implementaciones de reparametrizaciones tipo `exp(w - 5)`.
- Baseline ligero para clasificación de imágenes de baja resolución: puede emplearse como referencia rápida en prototipos que trabajen con imágenes de 32x32, como sensores de bajo coste o datasets tipo CIFAR.
- Pruebas de pipelines de preprocesado: el archivo `preprocessing.npz` con media y desviación típica permite verificar la correcta estandarización por columna en flujos de datos de imagen.
- Análisis de robustez y calibración: al ser un modelo convexo en parte de su arquitectura, es un banco de pruebas para estudiar calibración de probabilidades y comportamiento fuera de distribución en clasificadores pequeños.
- Integración en entornos con recursos muy limitados: con menos de medio millón de parámetros, cabe en microcontroladores o dispositivos embebidos para tareas de clasificación de imágenes de 32x32, siempre que se acepte la precisión declarada de 0,4841.

## Benchmarks y rendimiento

| Benchmark | Resultado | Notas |
|---|---|---|
| CIFAR-10 test accuracy | 0,4841 | Único dato publicado en la model card; sin desglose por clase ni intervalo de confianza |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible. Tampoco se ofrecen comparaciones con modelos similares dentro de la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 10 MB en float32 (402.250 parámetros × 4 bytes ≈ 1,6 MB, más activaciones y overhead de PyTorch); en la práctica, cualquier GPU con más de 1 GB es suficiente.
- GPU recomendadas: no requiere GPU; funciona en CPU sin problema. Cualquier GPU consumer (GTX 1050, RTX 3050, RTX 4090) es sobrada.
- Cabe en cualquier GPU consumer y en la mayoría de dispositivos embebidos.
- Opciones de despliegue: PyTorch nativo (`torch.load`), exportación a ONNX o TorchScript para inferencia en producción, o conversión a TensorFlow Lite para microcontroladores.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño del modelo, se espera latencia de microsegundos a milisegundos por imagen en CPU moderna, pero no se ha publicado ninguna medición.

## Comparativa con modelos similares

| Modelo | Parámetros | Entrada | Precisión CIFAR-10 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CIFAR-10 IOC-NN (Box2005) | 402.250 | 32x32x3 | 0,4841 | no disponible | Hugging Face |
| MLP estándar equivalente (sin restricción) | ~402.250 | 32x32x3 | no disponible | no aplica | referencia teórica |
| ResNet-18 (referencia habitual en CIFAR-10) | ~11,2 M | 32x32x3 | no disponible en esta ficha | varía | ampliamente disponible |
| VGG-11 (referencia habitual en CIFAR-10) | ~132 M | 32x32x3 | no disponible en esta ficha | varía | ampliamente disponible |

No se dispone de datos de benchmarks comparativos publicados en la información proporcionada para establecer una comparación cuantitativa rigurosa con alternativas. Las filas de ResNet-18 y VGG-11 se incluyen solo como referencia de categoría y tamaño, no como comparación de rendimiento verificada.

## Limitaciones y advertencias

- Precisión limitada: 0,4841 en test sobre CIFAR-10, lejos de los clasificadores convolucionales modernos, que superan el 0,95 en la misma tarea.
- Sesgos conocidos: no documentados en la información disponible; al entrenarse sobre CIFAR-10, hereda los sesgos de composición y etiquetado de ese dataset.
- Riesgo de alucinación: no aplica en el sentido lingüístico, pero el modelo puede producir clasificaciones erróneas con alta confianza en imágenes fuera de distribución.
- Limitaciones de contexto o idioma: no aplica; la entrada es fija (32x32x3) y no procesa texto.
- Restricciones de licencia para uso comercial: la licencia no está declarada, por lo que no se puede asumir permiso de uso comercial; es necesario contactar con el autor.
- Caveats para producción: el repositorio tiene 0 descargas, 0 likes y 0 GB de tamaño declarado, lo que sugiere que los pesos podrían no estar efectivamente alojados o que el artefacto es mínimo; conviene verificar la integridad de `model_ioc_p0.pt` y `preprocessing.npz` antes de usarlo. No hay pipeline declarado ni documentación de versiones de PyTorch compatibles.
- La restricción de convexidad se aplica solo a partir de la segunda capa; no convierte al modelo completo en convexo respecto a la entrada original.

## Enlaces

- Hugging Face: https://huggingface.co/Box2005/cifar10-ioc-nn
- No se han encontrado otros enlaces (papers, blogs, repositorios o demos) en la información proporcionada.
