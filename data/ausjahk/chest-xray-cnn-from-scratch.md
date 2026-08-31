# ausjahk/chest-xray-cnn-from-scratch

## Resumen

El modelo `ausjahk/chest-xray-cnn-from-scratch` es un clasificador de imágenes médicas desarrollado por el usuario ausjahk, diseñado para detectar neumonía en radiografías de tórax. Se trata de una red neuronal convolucional (CNN) entrenada completamente desde cero, sin utilizar pesos preentrenados ni transferencia de aprendizaje, sobre el conjunto de datos público de Kaggle Chest X-Ray Pneumonia. El modelo resuelve un problema de clasificación binaria (NORMAL vs. PNEUMONIA) y está pensado como un ejercicio de implementación didáctica más que como una herramienta clínica lista para producción.

La arquitectura es una CNN compacta de 4 bloques convolucionales con filtros crecientes (16→32→64→128), normalización por lotes, ReLU y max pooling, seguida de una cabeza fully connected de 256 neuronas y una salida de 2 clases. El modelo tiene aproximadamente 2,2 millones de parámetros y acepta imágenes RGB de 128×128 píxeles. Su relevancia actual radica en su simplicidad y en que demuestra un pipeline completo de entrenamiento de visión por computador en el ámbito médico, aunque su rendimiento (69,39% de precisión en test) es limitado y no apto para uso clínico real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN convolucional (4 bloques Conv+BN+ReLU+MaxPool) |
| Parametros totales | 2.195.842 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de texto) |
| Licencia | no disponible |
| Formato de pesos | no disponible (probablemente .pt o .safetensors, no especificado) |

## Arquitectura y entrenamiento

La arquitectura es una CNN clásica para clasificación de imágenes, compuesta por 4 bloques convolucionales. Cada bloque incluye una capa convolucional con un número creciente de filtros (16, 32, 64 y 128), seguida de normalización por lotes (BatchNorm), activación ReLU y una capa de max pooling. Tras los bloques convolucionales, un clasificador fully connected con 256 neuronas y una capa de salida de 2 unidades (con softmax implícito) produce la probabilidad de cada clase. La entrada es una imagen RGB de 128×128 píxeles.

El entrenamiento se realizó desde cero, sin transferencia de aprendizaje, sobre el dataset de Kaggle Chest X-Ray Pneumonia, que contiene 5.216 imágenes de entrenamiento y 624 de test, con dos clases: NORMAL y PNEUMONIA. Se utilizó el optimizador Adam con una tasa de aprendizaje de 0,001, función de pérdida de entropía cruzada y se entrenó durante 5 épocas. No se mencionan técnicas de aumento de datos, regularización adicional ni ajuste de hiperparámetros. La precisión final en el conjunto de test fue del 69,39%, un valor moderado que sugiere un modelo subentrenado o con capacidad insuficiente para la tarea.

## Capacidades

- Clasificación binaria de imágenes de rayos X de tórax: distingue entre NORMAL y PNEUMONIA.
- Procesamiento de imágenes RGB de 128×128 píxeles.
- Inferencia rápida debido al bajo número de parámetros (2,2 M), lo que permite ejecución en CPU o GPUs de gama baja.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües, al ser un modelo puramente visual.
- No incluye modo de pensamiento (thinking mode) ni capacidades de visión más allá de la clasificación de imágenes.

## Casos de uso

- **Prototipado educativo**: sirve como ejemplo práctico para estudiantes que aprenden a construir y entrenar CNNs desde cero en el dominio médico. Su código y arquitectura son fáciles de replicar y modificar.
- **Investigación académica**: puede utilizarse como baseline en estudios comparativos de clasificación de neumonía, aunque su baja precisión limita su utilidad como referencia sólida.
- **Demostración de pipeline de visión por computador**: integrable en flujos de trabajo de Hugging Face para ilustrar el proceso de carga, inferencia y evaluación de un modelo de clasificación de imágenes.
- **Pruebas de concepto en entornos controlados**: en contextos donde no se requiera precisión clínica, puede servir para validar la viabilidad de un sistema de detección automática de neumonía con recursos mínimos.
- **Entrenamiento de modelos ligeros en dispositivos edge**: al tener solo 2,2 M de parámetros, podría adaptarse a entornos con restricciones de memoria, aunque su rendimiento actual no lo hace recomendable para producción.
- **Análisis de errores y mejora incremental**: los desarrolladores pueden usar este modelo como punto de partida para experimentar con arquitecturas más profundas, aumento de datos o transferencia de aprendizaje, comparando resultados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento proporcionado por el autor es la precisión en el conjunto de test:

| Metrica | Valor |
|---|---|
| Precisión en test | 69,39% |

No se dispone de métricas adicionales como sensibilidad, especificidad, AUC-ROC ni comparaciones con otros modelos. Este valor es bajo para una tarea de clasificación médica, donde se esperan precisiones superiores al 90% en sistemas bien entrenados.

## Requisitos de hardware

- **VRAM estimada**: al ser un modelo de 2,2 M de parámetros, la inferencia requiere menos de 100 MB de VRAM en FP32. Incluso en CPU es viable.
- **GPU recomendadas**: cualquier GPU con al menos 2 GB de VRAM es suficiente. Modelos como NVIDIA GTX 1050, RTX 2060 o superiores funcionan sin problemas. También puede ejecutarse en CPU para inferencia por lotes pequeños.
- **Compatibilidad con GPU de consumo**: sí, cabe en cualquier GPU de consumo actual, incluidas las integradas de portátiles.
- **Opciones de despliegue**: al ser un modelo de PyTorch, puede servirse con TorchServe, o exportarse a ONNX para usar con ONNX Runtime. También es posible cargarlo directamente en un pipeline de Hugging Face Transformers (aunque no es un modelo de texto) o usarlo con la librería `transformers` si se adapta. No se menciona compatibilidad con vLLM, llama.cpp u Ollama, que son específicos para modelos de lenguaje.
- **Latencia y throughput**: no se dispone de datos medidos, pero por el tamaño del modelo, la inferencia en GPU debería ser del orden de milisegundos por imagen. En CPU, podría rondar los 10-50 ms por imagen dependiendo del hardware.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Existen otros clasificadores de neumonía basados en CNNs (por ejemplo, usando ResNet o VGG preentrenados), pero no se han incluido datos concretos en la búsqueda. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- **Precisión baja**: el 69,39% de precisión en test es insuficiente para uso clínico. Un sistema de detección de neumonía debe superar el 90% para ser considerado fiable.
- **Entrenamiento limitado**: solo 5 épocas, sin aumento de datos ni regularización, lo que probablemente provoca underfitting. El modelo no ha aprendido características suficientemente discriminativas.
- **Sesgos potenciales**: el dataset de Kaggle puede tener desequilibrios de clases o variaciones en la calidad de las imágenes, lo que puede introducir sesgos no documentados.
- **Riesgo de alucinación**: al ser un modelo de visión, no genera texto, pero puede producir clasificaciones erróneas con alta confianza, lo que es peligroso en entornos médicos.
- **Licencia no especificada**: no se indica la licencia del modelo, lo que impide conocer las restricciones de uso comercial o redistribución.
- **Sin validación clínica**: no ha sido evaluado por profesionales médicos ni aprobado por organismos reguladores. No debe utilizarse como herramienta de diagnóstico.
- **Formato de pesos desconocido**: no se especifica si los pesos están en formato safetensors, .pt u otro, lo que puede dificultar su integración en ciertos entornos.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/ausjahk/chest-xray-cnn-from-scratch)
- [Dataset Kaggle Chest X-Ray Pneumonia](https://www.kaggle.com/datasets/paultimothymooney/chest-xray-pneumonia)
