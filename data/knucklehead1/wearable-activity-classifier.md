# KnuckleHead1/wearable-activity-classifier

## Resumen
El modelo `wearable-activity-classifier` es un clasificador de actividades físicas basado en una red neuronal convolucional unidimensional (1D CNN), desarrollado por el usuario KnuckleHead1. Su función es clasificar secuencias de 100 pasos de una señal univariada de sensor wearable (por ejemplo, un acelerómetro) en tres clases: estacionario, caminando y corriendo. El modelo está diseñado con fines educativos y de demostración, no para uso en producción.

Con solo 12.451 parámetros, la arquitectura es extremadamente ligera y se entrena en aproximadamente 1,5 segundos sobre un conjunto de datos sintético de 600 muestras. A pesar de su simplicidad, alcanza una precisión del 100% en el conjunto de prueba, lo que refleja la naturaleza controlada y simplificada de los datos. Su relevancia radica en ilustrar cómo las CNN 1D pueden extraer patrones temporales locales en series de tiempo, sirviendo como punto de partida para proyectos de reconocimiento de actividad humana (HAR) más complejos.

## Especificaciones técnicas
| Parametro | Valor |
|---|---|
| Arquitectura | 1D CNN (Conv1D + MaxPooling1D + Flatten + Dense) |
| Parametros totales | 12.451 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 100 pasos (secuencia de entrada fija) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | no disponible (librería Keras, probablemente .h5 o .keras) |

## Arquitectura y entrenamiento
La arquitectura es una red convolucional 1D con una capa `Conv1D` de 16 filtros y kernel de tamaño 5, seguida de `MaxPooling1D` con pool de 2, una capa `Flatten`, una capa densa de 16 neuronas con activación ReLU y una capa de salida densa de 3 neuronas con softmax. La entrada es un tensor de forma `(100, 1)`, correspondiente a 100 pasos temporales de una única característica.

El entrenamiento se realizó sobre un conjunto de datos sintético de 600 secuencias (200 por clase), con particiones fijas de entrenamiento, validación y prueba (semilla 42). Se utilizó el optimizador Adam, la función de pérdida `sparse_categorical_crossentropy`, 6 épocas y un tamaño de lote de 32. El modelo alcanzó una precisión del 100% en el conjunto de prueba, con un tiempo de entrenamiento de aproximadamente 1,5 segundos. No se emplearon técnicas avanzadas como RLHF, DPO ni decodificación especulativa, ya que se trata de un clasificador supervisado estándar.

## Capacidades
- Clasificación de series temporales univariadas de 100 pasos en tres clases: estacionario, caminando y corriendo.
- Extracción de patrones locales periódicos (picos y frecuencias de paso) mediante filtros convolucionales 1D.
- Inferencia extremadamente rápida y ligera, apta para ejecución en CPU sin GPU.
- No soporta generación de texto, tool calling, agentes, visión ni capacidades multilingües.
- Funciona únicamente con secuencias de longitud fija (100 timesteps) y una sola característica.

## Casos de uso
- Material didáctico en cursos de deep learning: el modelo sirve para demostrar cómo una CNN 1D procesa series temporales y compara su rendimiento con arquitecturas RNN o LSTM en un problema de clasificación sencillo.
- Prototipo de reconocimiento de actividad humana (HAR) en entornos controlados: puede integrarse en una demo que reciba datos de un sensor simulado y prediga la actividad en tiempo real.
- Prueba de concepto para pipelines de clasificación de señales: útil para validar flujos de preprocesamiento, entrenamiento y evaluación antes de escalar a modelos más complejos.
- Benchmark educativo: permite comparar la precisión y velocidad de entrenamiento de diferentes arquitecturas (CNN, RNN, LSTM, híbridas) sobre el mismo conjunto de datos sintético.
- Ejemplo de despliegue ligero en dispositivos embebidos: al tener solo 12.451 parámetros, puede ejecutarse en microcontroladores o Raspberry Pi para experimentos de IoT.
- Base para experimentos de aumento de datos o regularización: al ser un modelo pequeño y rápido, es ideal para probar técnicas de mejora de generalización sin coste computacional significativo.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks comparativos en la información disponible. La model card reporta una precisión del 100% en el conjunto de prueba, pero este resultado corresponde a un dataset sintético simplificado y no debe interpretarse como rendimiento en datos reales. El tiempo de entrenamiento es de ~1,5 segundos en hardware no especificado.

## Requisitos de hardware
- VRAM estimada: no requiere VRAM, ya que el modelo es extremadamente pequeño (12.451 parámetros) y puede ejecutarse en CPU.
- GPU recomendada: ninguna; cualquier CPU moderna es suficiente.
- Compatibilidad con GPU de consumo: sí, pero innecesario; el modelo corre en cualquier hardware.
- Opciones de despliegue: al ser un modelo Keras, puede exportarse a TensorFlow Lite o convertirse a ONNX para inferencia en edge. También puede ejecutarse con Keras directamente o mediante TensorFlow Serving.
- Latencia y throughput: no se proporcionan datos, pero dada la simplicidad, la inferencia es del orden de microsegundos en CPU.

## Comparativa con modelos similares
No se dispone de información detallada sobre modelos comparables en la misma categoría. Existen otros repositorios en Hugging Face con nombres similares, como `muzammil-khan/wearable-activity-classifier`, pero no se han encontrado especificaciones técnicas públicas para establecer una comparación rigurosa. En el ámbito académico, los modelos de HAR suelen emplear arquitecturas LSTM o CNN-LSTM con múltiples ejes de sensores, pero no se dispone de datos concretos para comparar.

## Limitaciones y advertencias
- Entrenado exclusivamente con datos sintéticos simplificados, por lo que su rendimiento en datos reales de sensores no está garantizado.
- Utiliza una única característica (señal univariada), mientras que los sensores reales suelen proporcionar datos triaxiales (acelerómetro y giroscopio).
- Longitud de secuencia fija de 100 pasos; no admite secuencias de longitud variable.
- No apto para aplicaciones de salud, seguridad o diagnóstico médico.
- La precisión del 100% en el conjunto de prueba es un artefacto de la simplicidad del dataset y no debe considerarse representativa de un problema real.
- Licencia MIT permite uso comercial, pero el modelo no está diseñado para producción.

## Enlaces
- [Hugging Face - KnuckleHead1/wearable-activity-classifier](https://huggingface.co/KnuckleHead1/wearable-activity-classifier)
- [Hugging Face - muzammil-khan/wearable-activity-classifier](https://huggingface.co/muzammil-khan/wearable-activity-classifier)
- [GitHub - priyanshu015211/human-behavior-classification](https://github.com/priyanshu015211/human-behavior-classification)
- [GitHub - syncora-ai/Fitness-Health-Tracking-Dataset](https://github.com/syncora-ai/Fitness-Health-Tracking-Dataset)
- [Artículo: Machine learning models for wearable-based human activity recognition](https://www.sciencedirect.com/science/article/pii/S0925231225015838)
- [Artículo: Deep learning based human activity recognition (HAR) using wearable sensors](https://www.sciencedirect.com/science/article/pii/S2667096821000392)
