# Harshavardhan89/smai-a4-q1-mlp-cifar10

## Resumen

`smai-a4-q1-mlp-cifar10` es un perceptrón multicapa (MLP) implementado en NumPy puro y entrenado sobre CIFAR-10, publicado por el usuario Harshavardhan89 como parte de la asignación 4 (pregunta 1) de un curso de SMAI (Statistical Methods for Artificial Intelligence). No es un modelo de lenguaje ni un modelo generativo: es un clasificador de imágenes de 10 clases que opera sobre píxeles crudos aplanados y devuelve logits. Su relevancia es exclusivamente didáctica, como referencia reproducible de un pipeline de entrenamiento básico con SGD y normalización por columna.

La arquitectura es una red densa de tres capas con tamaños [3072, 128, 64, 10], activación ReLU en las capas ocultas y salida lineal (logits sin softmax). Se entrenó con entropía cruzada softmax, SGD plano con learning rate 0.03, batch size 64 y 100 épocas, con semilla 2040, sobre las etiquetas limpias del conjunto oficial (p = 0, sin ruido de etiquetas). La precisión reportada en las 10.000 imágenes de test oficiales es 0,4693.

El repositorio pesa 0,0 GB (solo contiene los arrays de pesos y la configuración), no tiene descargas ni likes, y se distribuye bajo licencia MIT. No hay model card con información sobre idiomas, pipeline ni benchmarks más allá de la accuracy de test indicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP denso (perceptrón multicapa), capas [3072, 128, 64, 10], activación ReLU en capas ocultas, salida lineal (logits) |
| Parametros totales | 3072×128 + 128 + 128×64 + 64 + 64×10 + 10 = 401.802 (calculado a partir de las dimensiones indicadas) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de secuencia; entrada fija de 3072 valores) |
| Tipos de cuantizacion | no disponible (pesos en float64 dentro de `model.npz`) |
| Idiomas soportados | no disponible (clasificador de imágenes, sin capacidad lingüística) |
| Licencia | MIT |
| Formato de pesos | NumPy `.npz` (`model.npz`, `preprocessing.npz`) y `config.json` |

## Arquitectura y entrenamiento

La red es un MLP completamente conectado con tres transformaciones afines: 3072 → 128 → 64 → 10. Cada capa oculta aplica ReLU; la capa de salida no aplica activación y produce logits de 10 dimensiones (una por clase de CIFAR-10). Los pesos se almacenan como matrices `W{i}` de forma (n_in, n_out) y sesgos `b{i}` de forma (1, n_out), de modo que la inferencia es `h = h @ W + b` seguida de ReLU entre capas.

El entrenamiento usa softmax cross-entropy como función de pérdida y SGD plano con learning rate 0.03, batch size 64, 100 épocas y semilla 2040. No se aplican restricciones de peso ni regularización adicional según la model card. El preprocesado es fijo: aplanar la imagen 32×32×3 en orden H, W, C a 3072 valores, dividir por 255 y normalizar por columna con la media y desviación típica calculadas sobre las 50.000 imágenes del conjunto de entrenamiento oficial (guardadas en `preprocessing.npz` como float64). No hay datos sobre composición del dataset más allá de CIFAR-10 estándar, ni sobre RLHF, DPO ni aumentación de datos.

## Capacidades

- Clasificación de imágenes de CIFAR-10 en 10 clases (avión, automóvil, pájaro, gato, ciervo, perro, rana, caballo, barco, camión).
- Inferencia en NumPy puro, sin dependencias de frameworks de deep learning (PyTorch, TensorFlow, JAX).
- Reproducibilidad completa: pesos, preprocesado y configuración incluidos en el repositorio.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües ni de generación de texto.
- No tiene modo thinking, visión general, audio ni otras capacidades especiales.

## Casos de uso

- Docencia y prácticas de aprendizaje automático: sirve como referencia reproducible de un pipeline completo (carga de datos, normalización, SGD, evaluación) para estudiantes que implementan redes desde cero en NumPy.
- Baseline de clasificación en CIFAR-10: con una accuracy de 0,4693 en test, es un punto de comparación inferior a las CNN modernas pero útil para medir la mejora que aportan arquitecturas convolucionales.
- Verificación de pipelines de preprocesado: el par `preprocessing.npz` (media y desviación típica por columna) permite comprobar que una implementación de normalización coincide con la del autor antes de entrenar modelos propios.
- Reproducción de experimentos controlados: la semilla 2040, el learning rate y el batch size documentados permiten replicar exactamente el entrenamiento y estudiar la variabilidad de resultados con distintas semillas.
- Ejemplo educativo de inferencia sin framework: el snippet de carga en NumPy ilustra cómo servir un modelo sin dependencias pesadas, útil en entornos restringidos o embebidos.
- Estudio de limitaciones de los MLP en visión: al operar sobre píxeles aplanados, el modelo pierde la estructura espacial; sirve para demostrar empíricamente por qué las CNN superan a los MLP en imágenes.

## Benchmarks y rendimiento

| Benchmark | Resultado |
|---|---|
| CIFAR-10 test accuracy (10.000 imágenes oficiales) | 0,4693 |

No se han publicado otros resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: despreciable; el modelo ocupa unos pocos megabytes en memoria (401.802 parámetros en float64 ≈ 3,2 MB, más los arrays de preprocesado).
- GPU recomendadas: no requiere GPU; funciona en CPU sin problema.
- Cabe en cualquier GPU consumer y en CPU de gama baja.
- Opciones de despliegue: NumPy (único soportado según la model card); no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles; al ser un MLP de tres capas, la inferencia por imagen es del orden de microsegundos en CPU, pero no se han publicado medidas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento CIFAR-10 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| smai-a4-q1-mlp-cifar10 | 401.802 | no aplica (entrada fija 3072) | 0,4693 test accuracy | MIT | HuggingFace |
| MLP de referencia del curso SMAI | no disponible | no aplica | no disponible | no disponible | no disponible |
| CNN pequeña típica en CIFAR-10 | variable (cientos de miles a millones) | no aplica | típicamente > 0,70 | variable | múltiples repositorios |

No se dispone de información sobre otros modelos comparables publicados en la misma asignación o con especificaciones verificables en la información proporcionada.

## Limitaciones y advertencias

- Modelo puramente didáctico: no está pensado para uso en producción ni para tareas fuera de CIFAR-10.
- Sesgos conocidos: no documentados; al entrenar solo con CIFAR-10, hereda los sesgos de ese dataset (posibles desequilibrios de clase y sesgos de representación de las imágenes).
- Riesgo de alucinación: no aplica (no es un modelo generativo); el riesgo es de clasificación errónea, con una accuracy de test de 0,4693, es decir, aproximadamente la mitad de las imágenes se clasifican mal.
- Limitaciones de contexto o idioma: no aplica; la entrada es una imagen de 32×32×3 y la salida es una distribución sobre 10 clases.
- Restricciones de licencia: MIT permite uso comercial, pero el modelo no es adecuado para ello por su baja precisión y su ámbito restringido.
- Caveat importante para producción: los pesos están en float64 y el formato `.npz` requiere NumPy; no hay versiones cuantizadas ni exportaciones a ONNX u otros formatos.
- El repositorio tiene 0 descargas y 0 likes, sin mantenimiento documentado ni issues abiertos conocidos.

## Enlaces

- HuggingFace: https://huggingface.co/Harshavardhan89/smai-a4-q1-mlp-cifar10
- Dataset CIFAR-10 (referencia): https://www.cs.toronto.edu/~kriz/cifar.html
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la información proporcionada.
