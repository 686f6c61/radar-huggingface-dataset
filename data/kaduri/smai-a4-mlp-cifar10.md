# kaduri/smai-a4-mlp-cifar10

## Resumen

`kaduri/smai-a4-mlp-cifar10` es un perceptrón multicapa (MLP) entrenado desde cero para clasificar imágenes del conjunto CIFAR-10 en 10 categorías. No es un modelo de lenguaje ni un modelo fundacional: se trata de la entrega de la pregunta 1 del Assignment 4 de la asignatura SMAI, publicada en HuggingFace con la librería `numpy` y pesos serializados en formato `.npz`. El repositorio ocupa 0,0 GB y acumula 0 descargas y 1 like en el momento de la consulta.

La arquitectura es una red totalmente conectada de cuatro capas con anchuras [3072, 512, 256, 10], activación ReLU en las capas ocultas y salida lineal (logits) optimizada con entropía cruzada. El recuento declarado es de 1.707.274 parámetros, coherente con las dimensiones indicadas. Se entrenó con SGD plano (learning rate 0,05, batch de 64, 100 épocas, etiquetas verdaderas con p = 0 y semilla 1018), alcanzando una precisión de entrenamiento de 1,0000 y una precisión de test de 0,5466.

Su relevancia es exclusivamente docente y de referencia: sirve como línea base reproducible de clasificación de imágenes de bajo coste computacional, como ejemplo de implementación de forward pass en NumPy puro y como material de comparación frente a arquitecturas convolucionales. No debe evaluarse como un modelo de propósito general ni utilizarse en producción para tareas distintas de la clasificación de imágenes de 32×32 píxeles con la distribución de CIFAR-10.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Perceptrón multicapa (MLP) totalmente conectado, 4 capas: [3072, 512, 256, 10]; ReLU en capas ocultas, salida identidad (logits) |
| Parámetros totales | 1.707.274 (1.573.376 en capa 1, 131.328 en capa 2, 2.570 en capa 3) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (no es un modelo de secuencias; la entrada es un vector fijo de 3072 dimensiones) |
| Tipos de cuantización | No disponible (pesos en coma flotante dentro de `.npz`; no se documentan variantes cuantizadas) |
| Idiomas soportados | No disponible (no procesa texto; las clases de salida son las 10 categorías de CIFAR-10) |
| Licencia | MIT |
| Formato de pesos | NumPy `.npz` (`weights.npz` con arrays `weights_i` de forma (entradas, salidas) y `biases_i`); preprocesado en `preprocessing.npz` |

## Arquitectura y entrenamiento

La red es un MLP secuencial sin conexiones residuales ni normalización interna: la entrada son los 3072 valores de una imagen de 32×32×3 aplanada, seguidos de dos capas ocultas de 512 y 256 unidades con ReLU y una capa de salida de 10 logits sin softmax explícito (la softmax se aplica implícitamente en la pérdida de entropía cruzada). El pipeline de preprocesado, documentado en el propio repositorio, aplana la imagen, divide entre 255 y estandariza cada píxel con la media y la desviación típica calculadas sobre la partición de entrenamiento, parámetros que se distribuyen en `preprocessing.npz` para garantizar la reproducibilidad de la inferencia.

El entrenamiento emplea SGD plano con learning rate 0,05, tamaño de lote 64 y 100 épocas, sobre etiquetas verdaderas (p = 0, es decir, sin ruido de etiquetas) y con semilla 1018. No se menciona aumento de datos, regularización (weight decay, dropout) ni búsqueda de hiperparámetros, ni tampoco fases de ajuste fino con RLHF/DPO, que no aplican a este tipo de modelo. La combinación de precisión de entrenamiento 1,0000 y precisión de test 0,5466 indica un ajuste completo al conjunto de entrenamiento y una capacidad de generalización limitada, coherente con un MLP sin convoluciones sobre CIFAR-10. No se documenta el número exacto de tokens, muestras ni la partición concreta utilizada más allá de la referencia a las particiones estándar de CIFAR-10 para el cálculo de media y desviación.

## Capacidades

- Clasificación de imágenes de 32×32 píxeles y 3 canales en una de las 10 clases de CIFAR-10 (avión, automóvil, pájaro, gato, ciervo, perro, rana, caballo, barco, camión).
- Cálculo de logits por clase, lo que permite obtener puntuaciones y, aplicando softmax, distribuciones de probabilidad.
- Inferencia en CPU sin dependencias de frameworks de deep learning: solo requiere NumPy y los archivos `.npz`.
- Reproducibilidad determinista del preprocesado mediante `preprocessing.npz` (media y desviación típica por píxel).
- No soporta tool calling ni function calling.
- No soporta agentes, razonamiento multi-paso ni planificación.
- No tiene capacidades multilingües ni procesamiento de texto, audio o vídeo.
- No dispone de modo "thinking", decodificación especulativa ni atención de ningún tipo.

## Casos de uso

- Docencia de fundamentos de deep learning: el modelo sirve para ilustrar el forward pass, la función de pérdida de entropía cruzada y el efecto del sobreajuste, con una implementación mínima en NumPy que los alumnos pueden leer y modificar línea a línea.
- Línea base de referencia en experimentos de visión por computador: al ser un MLP sin convoluciones, proporciona un punto de comparación (54,66 % de accuracy en test) frente al que medir la mejora de arquitecturas convolucionales o basadas en transformers sobre CIFAR-10.
- Validación de pipelines de preprocesado: los parámetros de estandarización en `preprocessing.npz` permiten comprobar que una implementación propia de aplanado, escalado y normalización reproduce exactamente los resultados del autor.
- Pruebas de infraestructura de inferencia: con 1,7 millones de parámetros y ~6,8 MB en coma flotante de 32 bits, el modelo es útil como caso de prueba trivial para verificar el despliegue de servicios de inferencia en CPU o en entornos sin GPU antes de pasar a modelos mayores.
- Experimentos de reproducibilidad y auditoría: la semilla 1018, el learning rate y el tamaño de lote documentados permiten intentar replicar el entrenamiento y analizar la variabilidad de resultados entre ejecuciones.
- Demostraciones educativas interactivas: clasificación de imágenes CIFAR-10 en un cuaderno o una aplicación web ligera, sin necesidad de acelerador hardware ni de descargar pesos de gran tamaño.
- Comparación de estrategias de regularización: dado el sobreajuste observado (1,0000 en entrenamiento frente a 0,5466 en test), el modelo es un banco de pruebas para evaluar dropout, weight decay o aumento de datos sobre la misma arquitectura.

## Benchmarks y rendimiento

Los únicos resultados publicados en la información disponible son las métricas de entrenamiento y test del propio autor:

| Métrica | Valor |
|---|---|
| Precisión final en entrenamiento | 1,0000 |
| Precisión final en test | 0,5466 |
| Conjunto de evaluación | CIFAR-10 (partición de test estándar) |
| Loss | Entropía cruzada (valor numérico no disponible) |

No se han publicado resultados de benchmarks en la información disponible para MMLU, HumanEval, GSM8K ni otras métricas de modelos de lenguaje, que no aplican a este modelo. Tampoco se proporcionan comparaciones con otros modelos de la misma tarea dentro del repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: 0 GB; el modelo está pensado para ejecutarse en CPU. Los pesos ocupan aproximadamente 6,8 MB en coma flotante de 32 bits (1.707.274 parámetros × 4 bytes).
- GPU recomendadas: no requiere GPU. Cualquier GPU es sobredimensionada para esta carga.
- Cabe en cualquier GPU de consumo y en cualquier CPU moderna; también en entornos sin aceleración hardware, contenedores ligeros y dispositivos de bajo consumo.
- Opciones de despliegue: no aplican vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje. El despliegue se realiza cargando los `.npz` con NumPy y ejecutando el forward pass en Python; puede envolverse en FastAPI, Flask o un script de línea de comandos.
- Latencia y throughput estimados: no disponibles. La model card no publica mediciones de tiempo de inferencia ni de muestras por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Rendimiento en CIFAR-10 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kaduri/smai-a4-mlp-cifar10 | 1.707.274 | Vector de 3072 dimensiones (32×32×3) | 0,5466 en test (publicado) | MIT | HuggingFace (`kaduri/smai-a4-mlp-cifar10`) |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos verificables sobre otros modelos de la misma categoría (MLP docentes sobre CIFAR-10) en la información proporcionada, por lo que no se establece una comparación cuantitativa. Cualquier cifra de accuracy de terceros sobre CIFAR-10 requeriría consultar sus respectivas model cards, que no forman parte de esta búsqueda.

## Limitaciones y advertencias

- El modelo solo clasifica imágenes de 32×32 píxeles con la distribución de CIFAR-10; no es un modelo de propósito general y no puede adaptarse a otras resoluciones o dominios sin reentrenamiento.
- Sobreajuste severo: precisión de 1,0000 en entrenamiento frente a 0,5466 en test, lo que implica una brecha de generalización de más de 45 puntos porcentuales.
- No se documentan análisis de sesgos por clase ni matrices de confusión, por lo que se desconoce si el rendimiento es homogéneo entre las 10 categorías.
- Riesgo de alucinación no aplica en el sentido habitual (no genera texto), pero sí existe riesgo de predicciones erróneas con alta confianza en clases visualmente próximas (por ejemplo, gato frente a perro).
- La model card no especifica la partición exacta de entrenamiento/test ni el número de muestras utilizadas, lo que limita la reproducibilidad completa del experimento.
- La licencia MIT permite uso comercial y modificación, pero no se detallan las condiciones de la licencia del conjunto de datos CIFAR-10 subyacente; conviene verificar los términos del dataset antes de un uso comercial.
- El repositorio no incluye código de inferencia ni de entrenamiento, solo los pesos y los parámetros de preprocesado, por lo que es necesario implementar el forward pass para utilizarlo.
- El tamaño del repositorio se reporta como 0,0 GB, dato probablemente redondeado; conviene verificar los archivos reales antes de integrarlo en un pipeline automatizado.
- Ausencia total de soporte para texto, tool calling, agentes y razonamiento multi-paso: no es sustituible por un LLM en ninguna tarea de ese tipo.

## Enlaces

- HuggingFace: https://huggingface.co/kaduri/smai-a4-mlp-cifar10
- Paper: no disponible
- Blog o documentación del autor: no disponible
- Repositorio de código: no disponible
- Demo: no disponible
- Nota: los resultados de la búsqueda web realizada no contienen enlaces relevantes para este modelo; los únicos resultados obtenidos tratan sobre el videojuego Saints Row IV y no guardan relación con el repositorio.
