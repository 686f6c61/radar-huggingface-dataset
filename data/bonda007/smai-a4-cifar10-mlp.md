# bonda007/smai-a4-cifar10-mlp

## Resumen

`smai-a4-cifar10-mlp` es un perceptrón multicapa (MLP) entrenado desde cero para clasificar imágenes del conjunto de datos CIFAR-10. Lo publica el usuario `bonda007` como parte de la asignación 4 (pregunta 1) de la asignatura SMAI, y no debe confundirse con un modelo de lenguaje: es un clasificador de imágenes de 10 clases con una arquitectura totalmente conectada y sin capas convolucionales.

La red transforma cada imagen de 32x32 píxeles RGB aplanada en un vector de 3072 dimensiones y la hace pasar por dos capas ocultas (128 y 64 neuronas, activación ReLU) hasta una capa de salida de 10 logits que se entrenan con entropía cruzada softmax. Se entrenó con SGD plano durante 100 épocas sobre las 50.000 imágenes de entrenamiento de CIFAR-10.

Su relevancia es fundamentalmente didáctica: sirve como referencia base para comparar con arquitecturas convolucionales y para ilustrar el efecto del sobreajuste, ya que la brecha entre precisión de entrenamiento (91,26 %) y de test (46,40 %) es muy acusada. No está pensado para uso en producción ni para despliegue como servicio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Perceptrón multicapa (MLP) totalmente conectado, 3072 -> 128 -> 64 -> 10 |
| Parametros totales | no disponible (calculable a partir de las formas: 3072x128 + 128 + 128x64 + 64 + 64x10 + 10 = 402.826) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (clasificador de imágenes, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en `model.npz` en precisión nativa, presumiblemente float32) |
| Idiomas soportados | no aplica |
| Licencia | no disponible |
| Formato de pesos | NumPy `.npz` (`model.npz`), más `preprocessing.npz` y `config.json` |

## Arquitectura y entrenamiento

La arquitectura es un MLP clásico con dos capas ocultas de 128 y 64 neuronas y activación ReLU, sin activación en la capa de salida (10 logits optimizados con softmax y entropía cruzada). Las matrices de pesos se guardan con forma `(n_in, n_out)`, junto con los sesgos, bajo las claves `W0`, `b0`, `W1`, `b1`, etc. El preprocesado es determinista: carga de CIFAR-10 como `uint8` de forma (32, 32, 3), aplanado a 3072 con orden altura-anchura-canal, normalización a [0, 1] dividiendo por 255 y estandarización por columna con la media y la desviación típica calculadas sobre las 50.000 imágenes de entrenamiento (las desviaciones de 0 se sustituyen por 1).

El entrenamiento se realizó en PyTorch con SGD plano, tasa de aprendizaje 0,05, tamaño de lote 64 y 100 épocas sobre las 50.000 imágenes de entrenamiento con sus etiquetas verdaderas (p = 0, es decir, sin técnicas de regularización como dropout o label smoothing), con semilla 11018. No se menciona aumento de datos, weight decay, momentum ni parada temprana. El resultado final es una precisión de entrenamiento de 0,9126 y de test de 0,4640 sobre las 10.000 imágenes de test.

## Capacidades

- Clasificación de imágenes de CIFAR-10 en 10 categorías (avión, automóvil, pájaro, gato, ciervo, perro, rana, caballo, barco y camión).
- Entrada exclusivamente de imágenes de 32x32 píxeles RGB; no acepta otras resoluciones sin un remuestreo previo externo.
- Inferencia mediante la librería NumPy de la libreta de la asignación (`model.load_from("model.npz")`), no mediante frameworks de inferencia estándar.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo de razonamiento, visión general, audio ni otras capacidades especiales más allá de la clasificación.

## Casos de uso

- Docencia y prácticas de aprendizaje automático: el modelo sirve como línea base reproducible para que estudiantes comparen un MLP con una CNN sobre el mismo conjunto de datos y observen la diferencia de precisión (46,40 % frente a valores típicos superiores al 70 % en CNN sencillas).
- Estudio del sobreajuste: la brecha entre precisión de entrenamiento (91,26 %) y de test (46,40 %) lo convierte en un ejemplo concreto para ilustrar la necesidad de regularización, aumento de datos o parada temprana.
- Verificación de pipelines de preprocesado: al incluir `preprocessing.npz` con la media y la desviación típica exactas del entrenamiento, permite comprobar que una implementación de estandarización reproduce los resultados publicados.
- Pruebas unitarias de librerías educativas: el formato `model.npz` con claves `W0`, `b0`, etc. y la comprobación de formas en `load_from` facilitan tests de carga de pesos y de validación de arquitecturas.
- Experimentos de cuantización o compresión a pequeña escala: con unos 400.000 parámetros, es un banco de pruebas ligero para medir el impacto de reducir precisión en un clasificador.
- Demostraciones de inferencia en CPU: al no requerir GPU ni frameworks pesados, puede ejecutarse en cualquier entorno con NumPy para mostrar el flujo completo de preprocesado, carga de pesos y predicción.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Precisión de entrenamiento (50.000 imágenes) | 0,9126 |
| Precisión de test (10.000 imágenes) | 0,4640 |

No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MB; los pesos ocupan aproximadamente 1,6 MB en float32 (402.826 parámetros x 4 bytes).
- GPU recomendadas: no requiere GPU; cualquier CPU es suficiente. En caso de usar GPU, cualquier tarjeta con más de 1 GB de memoria sirve.
- Cabe en cualquier GPU de consumo, incluida una GTX 1050 o una iGPU moderna, y también en Raspberry Pi.
- Opciones de despliegue: no hay soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje. El único camino documentado es la librería NumPy de la libreta de la asignación con `model.load_from("model.npz")`.
- Latencia y throughput: no disponibles; por el tamaño del modelo se espera un coste despreciable por imagen en CPU, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Precisión en CIFAR-10 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| smai-a4-cifar10-mlp | MLP 3072-128-64-10 | ~402.826 | 46,40 % (test) | no disponible | HuggingFace |
| CNN sencilla de referencia (p. ej. LeNet-5) | CNN | del orden de decenas de miles | típicamente > 70 % | variable | múltiples implementaciones |
| ResNet-18 adaptada a CIFAR-10 | CNN residual | ~11 millones | típicamente > 95 % | variable | torchvision y otros |
| Vision Transformer pequeño (ViT) | Transformer | variable según configuración | típicamente > 90 % con preentrenamiento | variable | múltiples implementaciones |

Los valores de precisión de los modelos comparables son orientativos y no proceden de la información proporcionada para este modelo; no se dispone de una comparación directa publicada por el autor.

## Limitaciones y advertencias

- Precisión de test baja (46,40 %) para CIFAR-10: no es adecuado para aplicaciones reales de clasificación de imágenes.
- Sobreajuste severo: 91,26 % en entrenamiento frente a 46,40 % en test, sin regularización documentada.
- Sin capas convolucionales: no aprovecha la estructura espacial de las imágenes, lo que explica en parte su rendimiento limitado.
- Entrada rígida: solo acepta imágenes de 32x32 píxeles RGB aplanadas en orden altura-anchura-canal; cualquier otra resolución o canal requiere preprocesado externo.
- Dependencia de la media y la desviación típica de `preprocessing.npz`: usar otra normalización degrada las predicciones de forma no cuantificada.
- Licencia no especificada: no se puede confirmar el uso comercial ni la redistribución; ante la ausencia de licencia, debe tratarse como no apto para producción.
- Sin información sobre sesgos: no se ha documentado ningún análisis de sesgo por clase ni de equilibrio del conjunto de datos más allá del CIFAR-10 estándar.
- Riesgo de alucinación no aplicable (no genera texto), pero sí de clasificaciones erróneas con alta confianza en clases visualmente próximas.
- Formato de pesos no estándar (`model.npz`): no es directamente cargable por PyTorch, TensorFlow ni ONNX sin conversión manual.
- Modelo creado en el contexto de una asignatura: no hay mantenimiento, versionado ni soporte previstos.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/bonda007/smai-a4-cifar10-mlp)
- [Conjunto de datos CIFAR-10 en HuggingFace (uoft-cs/cifar10)](https://huggingface.co/datasets/uoft-cs/cifar10)
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información disponible.
