# saimuralipr/smai-a4-mlp

## Resumen

SMAI A4 MLP es un perceptrón multicapa (MLP) de tres capas desarrollado por el usuario saimuralipr como entrega de la asignación 4 del curso SMAI (Monsoon 2026) del IIIT Hyderabad. El modelo resuelve una tarea de clasificación de imágenes sobre el conjunto CIFAR-10, tomando imágenes RGB de 32x32 píxeles aplanadas a un vector de 3072 dimensiones y asignándolas a una de las 10 clases del dataset. Su arquitectura es deliberadamente simple: dos capas ocultas con activación ReLU de 128 y 64 neuronas respectivamente, y una capa de salida de 10 unidades con softmax.

No se trata de un modelo de lenguaje ni de un modelo fundacional: es un artefacto académico que serializa los pesos entrenados en formato `.npz` junto con las especificaciones de la arquitectura. Su relevancia es, por tanto, didáctica y de reproducibilidad dentro del contexto del curso, no de producción. El repositorio ocupa 0.0 GB, no registra descargas ni interacciones, y está publicado bajo licencia MIT.

El modelo alcanza un 47,73 % de precisión en test con implementación NumPy y un 47,17 % con PyTorch, lo que lo sitúa muy por debajo de los modelos convolucionales modernos sobre CIFAR-10, pero resulta coherente con la capacidad de un MLP sin sesgo inductivo convolucional entrenado sobre 36.000 imágenes.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Perceptrón multicapa (MLP) denso: 3072 -> 128 -> 64 -> 10 |
| Parámetros totales | 402.250 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (clasificación de imágenes, entrada fija de 3072 dimensiones) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | `.npz` (NumPy serializado) |

## Arquitectura y entrenamiento

La red es un MLP totalmente conectado con tres transformaciones lineales: una primera capa que proyecta la imagen aplanada de 3072 dimensiones a 128, una segunda de 128 a 64 y una capa de salida de 64 a 10. Las dos capas ocultas aplican activación ReLU y la salida se entrena con entropía cruzada sobre softmax. El recuento total de parámetros es de 402.250, coherente con la suma de matrices y sesgos de dichas capas.

El preprocesamiento aplica estandarización por canal calculada exclusivamente sobre las 36.000 imágenes de entrenamiento, con medias `[0.4914, 0.4822, 0.4465]` y desviaciones típicas `[0.2470, 0.2435, 0.2616]` (píxeles normalizados a `[0, 1]` antes del escalado). El dataset se divide de forma estratificada en 36.000 imágenes de entrenamiento, 12.000 de validación y 12.000 de test. La model card no especifica optimizador, número de épocas, tasa de aprendizaje ni técnicas de regularización, por lo que esos detalles no están disponibles.

## Capacidades

- Clasificación de imágenes RGB de 32x32 píxeles en las 10 clases de CIFAR-10 (avión, automóvil, pájaro, gato, ciervo, perro, rana, caballo, barco, camión).
- Inferencia determinista mediante NumPy o PyTorch, con los mismos pesos serializados.
- Reproducción de resultados académicos: precisión de validación del 48,35 %, precisión de test del 47,73 % (NumPy) y 47,17 % (PyTorch), y macro F1 de 0,4749.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, ni capacidades multilingües.
- No dispone de modo thinking, visión general, audio ni generación de texto.

## Casos de uso

- Docencia y reproducción de prácticas: sirve como referencia para comparar implementaciones NumPy frente a PyTorch sobre los mismos pesos y verificar discrepancias numéricas en la inferencia.
- Baseline de clasificación en CIFAR-10: útil como punto de partida mínimo contra el que medir la mejora de arquitecturas convolucionales o transformers de visión en el mismo conjunto de datos.
- Estudio de preprocesamiento: permite analizar el impacto de la estandarización por canal calculada solo sobre entrenamiento, replicando exactamente las medias y desviaciones documentadas.
- Experimentos de ablación de arquitectura: al ser un MLP de tamaño reducido (402.250 parámetros), es viable entrenarlo desde cero en CPU o GPU modesta para probar variaciones de profundidad o anchura.
- Validación de pipelines de serialización: el formato `.npz` y la API `Model.load_from(path)` permiten probar flujos de carga de pesos entre frameworks.
- Ejercicios de evaluación de métricas: el macro F1 de 0,4749 y las precisiones publicadas permiten practicar el cálculo y la interpretación de métricas en clasificación multiclase desbalanceada o difícil.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| Precisión de validación | 48,35 % |
| Precisión de test (NumPy) | 47,73 % |
| Precisión de test (PyTorch) | 47,17 % |
| Macro F1 | 0,4749 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que el modelo no es un modelo de lenguaje. Tampoco se proporcionan comparaciones con otras arquitecturas sobre CIFAR-10.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 10 MB para los pesos en precisión de 32 bits (402.250 parámetros x 4 bytes ≈ 1,6 MB, más buffers de activación).
- GPU recomendadas: no requiere GPU; cualquier CPU moderna ejecuta la inferencia en milisegundos.
- Cabe en cualquier GPU de consumo, incluida una GTX 1050 o una iGPU integrada; también en Raspberry Pi y entornos embebidos.
- Opciones de despliegue: no se documentan servidores de inferencia (vLLM, TGI, llama.cpp u Ollama no aplican). El uso previsto es carga directa con NumPy (`np.load`) o la API `Model.load_from(path)` del repositorio del curso.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo se espera un coste despreciable por muestra.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Precisión CIFAR-10 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SMAI A4 MLP (este modelo) | 402.250 | 3072 (32x32x3) | 47,73 % (test, NumPy) | MIT | HuggingFace |
| LeNet-5 (referencia clásica) | ~60.000 | 32x32x1 | ~70 % (entrenamiento completo) | no disponible | implementaciones públicas |
| ResNet-18 (referencia) | ~11,2 M | 32x32x3 | ~93-95 % (entrenamiento completo) | no disponible | implementaciones públicas |
| ViT pequeño (referencia) | variable | 32x32x3 con parches | ~90 %+ (con aumentos) | no disponible | implementaciones públicas |

Las cifras de los modelos de referencia son orientativas y no provienen de la información del repositorio; se incluyen únicamente para contextualizar la escala del MLP. El repositorio no ofrece comparaciones propias.

## Limitaciones y advertencias

- El modelo es un artefacto académico de una asignatura; no está pensado para uso en producción ni para tareas fuera de CIFAR-10.
- Precisión limitada: ~47,7 % en test, muy por debajo de arquitecturas convolucionales o transformers de visión sobre el mismo dataset.
- Sin sesgo inductivo convolucional: el aplanado de la imagen pierde estructura espacial, lo que explica en parte su bajo rendimiento.
- No es un modelo de lenguaje: no procesa texto, no soporta instrucciones, ni tool calling, ni agentes.
- No se documentan sesgos específicos ni análisis de subgrupos; al entrenarse sobre CIFAR-10, hereda los sesgos y desequilibrios de ese dataset.
- Riesgo de alucinación no aplicable (no genera texto), pero sí de sobreconfianza en clases ambiguas por la naturaleza del softmax.
- La model card no detalla hiperparámetros de entrenamiento, optimizador, épocas ni aumentos de datos, lo que limita la reproducibilidad exacta.
- Licencia MIT: permite uso comercial y modificación, pero el modelo no tiene valor comercial práctico dada su precisión y alcance.
- El repositorio no registra descargas ni interacciones, por lo que no hay evidencia de validación por parte de terceros.

## Enlaces

- HuggingFace: https://huggingface.co/saimuralipr/smai-a4-mlp
- Repositorio del curso SMAI (referenciado en la model card como `Model.load_from(path)`): no disponible como URL explícita en la información proporcionada.
- Paper o blog asociado: no disponible.
- Demo: no disponible.
