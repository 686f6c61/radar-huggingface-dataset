# Fresh-butter/smai-a4-ioc-nn

## Resumen

SMAI Assignment 4 — IOC-NN es un modelo neuronal de clasificación de imágenes desarrollado por el usuario Fresh-butter en el contexto de una asignación académica (SMAI, probablemente "Statistical Methods for Artificial Intelligence"). Se trata de un perceptrón multicapa completamente conectado diseñado para clasificar las 10 clases del conjunto de datos CIFAR-10, con una restricción arquitectónica poco habitual: las capas ocultas y de salida tienen pesos no negativos, lo que convierte la red en una función convexa respecto a la entrada (input-output convex, IOC).

El modelo no es un transformer ni un modelo de lenguaje: es una red densa de 3072 entradas (imágenes de 32×32×3 aplanadas), tres capas ocultas de 512, 256 y 128 neuronas con activación ELU, y una capa de salida de 10 logits. La restricción de convexidad se impone reemplazando los pesos negativos por exp(w − 5) tras cada actualización, de modo que la salida es convexa en la entrada. Se entrenó con SGD plano sobre las 50.000 imágenes de entrenamiento de CIFAR-10, logrando una precisión de entrenamiento de 0,8179 y una precisión de test de 0,4890.

Su relevancia es fundamentalmente didáctica: ilustra cómo imponer restricciones estructurales (convexidad) afecta a la capacidad de ajuste y a la generalización en un problema de visión por computador estándar. No está pensado para producción ni para uso comercial, y la información pública disponible es mínima (sin licencia declarada, sin idiomas, sin pipeline definido).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Perceptrón multicapa (MLP) totalmente conectado: 3072 → 512 → 256 → 128 → 10, activación ELU en capas ocultas, salida lineal (10 logits) |
| Parametros totales | No disponible (calculable a partir de las dimensiones: aproximadamente 1,77 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de clasificación de imágenes, entrada fija de 3072 valores) |
| Tipos de cuantizacion | No disponible (pesos en formato NumPy `.npz`, sin versiones cuantizadas publicadas) |
| Idiomas soportados | No disponible (no es un modelo de lenguaje) |
| Licencia | No disponible |
| Formato de pesos | NumPy `.npz` (`weights.npz` con `W0, b0, W1, b1, ...`; `W` con forma (inputs, outputs)) |

## Arquitectura y entrenamiento

La arquitectura es un MLP de cuatro capas con activación ELU en las capas ocultas y salida lineal de 10 logits, entrenado con pérdida de entropía cruzada tras softmax. La innovación principal es la restricción de convexidad: los pesos de las capas 2, 3 y 4 (y presumiblemente la de salida) se fuerzan a ser no negativos reemplazando cualquier peso negativo por exp(w − 5) después de cada actualización. La primera capa y todos los sesgos quedan sin restringir. Esto convierte la función aprendida en convexa respecto a la entrada, una propiedad útil para garantizar unicidad de mínimos y mejorar la interpretabilidad, a costa de reducir la expresividad del modelo.

El preprocesado consiste en aplanar la imagen 32×32×3 en orden row-major con canales al final (3072 valores), dividir por 255 y estandarizar cada columna con la media y desviación típica calculadas sobre las 50.000 imágenes de entrenamiento de CIFAR-10 (guardadas en `preprocessing.npz`). El entrenamiento usó SGD plano con learning rate 0,05, tamaño de lote 64, 100 épocas y semilla 11030, sobre las etiquetas verdaderas de CIFAR-10 (p = 0, es decir, sin label smoothing ni mezcla). No se menciona uso de RLHF, DPO ni aumento de datos.

## Capacidades

- Clasificación de imágenes de CIFAR-10 en 10 clases (avión, automóvil, pájaro, gato, ciervo, perro, rana, caballo, barco, camión).
- Entrada fija de 3072 valores correspondientes a imágenes de 32×32 píxeles en color (RGB).
- Salida de 10 logits que, tras softmax, permiten obtener probabilidades por clase.
- Propiedad de convexidad input-output: la salida es convexa respecto a la entrada, lo que facilita análisis teóricos de optimalidad.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües.
- No dispone de modo "thinking", visión general (solo clasificación de imágenes de 32×32), audio ni generación de texto.

## Casos de uso

- Docencia y aprendizaje sobre restricciones arquitectónicas: el modelo sirve para demostrar en un curso de aprendizaje automático cómo la imposición de pesos no negativos afecta a la capacidad de ajuste (precisión de entrenamiento 0,8179 frente a test 0,4890) y a la generalización.
- Experimentos de convexidad en redes neuronales: investigadores pueden usar este modelo como referencia para estudiar propiedades de funciones convexas input-output y comparar con MLPs sin restricción.
- Clasificación de imágenes de bajo coste computacional: al ser un MLP de aproximadamente 1,77 M de parámetros, puede ejecutarse en CPU para tareas de clasificación rápida de parches de 32×32 en entornos con recursos limitados.
- Reproducción de resultados académicos: el repositorio incluye pesos (`weights.npz`) y parámetros de preprocesado (`preprocessing.npz`), lo que permite reproducir exactamente la precisión de test de 0,4890 sobre CIFAR-10.
- Prototipado de pipelines de preprocesado de imágenes: el flujo de aplanado, normalización y estandarización por columna puede reutilizarse como plantilla en otros proyectos de clasificación con MLP.
- Análisis de sensibilidad a la inicialización y semilla: al estar entrenado con semilla fija 11030 y SGD plano, es útil para estudiar variabilidad de resultados en entrenamientos controlados.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Precisión de entrenamiento (CIFAR-10, 50.000 imágenes) | 0,8179 |
| Precisión de test (CIFAR-10, 10.000 imágenes) | 0,4890 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ya que el modelo no es un modelo de lenguaje ni un modelo de propósito general.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MB en precisión float32 (aproximadamente 1,77 M de parámetros × 4 bytes ≈ 7 MB de pesos, más buffers de activación y preprocesado).
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM; no requiere GPU dedicada. Funciona en CPU sin problemas.
- Cabe en cualquier GPU de consumo (GTX 1050, RTX 3050, RTX 4090, etc.) y en hardware integrado.
- Opciones de despliegue: al estar en formato NumPy `.npz`, requiere un script propio en Python con NumPy para cargar pesos y ejecutar el forward pass (logits = h @ W + b). No hay soporte nativo para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño del modelo, la inferencia en CPU debería ser del orden de milisegundos por imagen, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Precisión en CIFAR-10 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SMAI IOC-NN (este modelo) | ~1,77 M | Imagen 32×32×3 (3072 valores) | 0,4890 (test) | No disponible | HuggingFace (`Fresh-butter/smai-a4-ioc-nn`) |
| MLP estándar sin restricción de convexidad | Similar (~1,77 M) | Imagen 32×32×3 | No disponible en la información proporcionada | No disponible | No disponible |
| CNN pequeña para CIFAR-10 (p. ej., arquitecturas tipo VGG reducido) | Variable (0,1–1 M) | Imagen 32×32×3 | No disponible en la información proporcionada | No disponible | No disponible |

No se dispone de datos comparativos publicados en la información proporcionada para establecer una comparación cuantitativa con alternativas concretas.

## Limitaciones y advertencias

- Precisión de test limitada (0,4890), muy por debajo de lo habitual en CIFAR-10 con arquitecturas convolucionales, lo que refleja la pérdida de expresividad por la restricción de convexidad.
- Sesgos conocidos: no se han documentado sesgos específicos, pero al entrenarse solo con CIFAR-10 hereda los sesgos de ese conjunto (posibles desequilibrios de clase y sesgos de representación de las imágenes).
- Riesgo de alucinación: no aplica en el sentido de modelos generativos, pero el modelo puede producir clasificaciones erróneas con alta confianza en imágenes fuera de distribución.
- Limitaciones de contexto o idioma: no es un modelo de lenguaje; no procesa texto ni tiene ventana de contexto. Solo acepta imágenes de 32×32×3 con el preprocesado exacto especificado.
- Restricciones de licencia para uso comercial: la licencia no está declarada, por lo que no se puede asumir permiso para uso comercial sin consultar al autor.
- Caveats para producción: el formato de pesos es NumPy `.npz`, no hay pipeline de HuggingFace definido, no hay versiones cuantizadas ni soporte en frameworks de inferencia estándar. El repositorio tiene 0 descargas y 0 likes, y un tamaño de 0,0 GB, lo que sugiere que los artefactos podrían no estar completamente subidos o ser de muy pequeño tamaño.
- El modelo está vinculado a una asignatura académica (SMAI Assignment 4), por lo que su mantenimiento y soporte no están garantizados.

## Enlaces

- HuggingFace: https://huggingface.co/Fresh-butter/smai-a4-ioc-nn
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información disponible.
