# musakhan10/Wearable-Activity-Classifier

## Resumen

El modelo `musakhan10/Wearable-Activity-Classifier` es un clasificador de series temporales diseñado para distinguir entre tres estados de actividad física a partir de una secuencia de 100 pasos de una única característica de sensor: **estacionario**, **caminando** o **corriendo**. Ha sido desarrollado por Musa Khan como parte de un ejercicio educativo, empleando una arquitectura híbrida CNN+LSTM que combina la extracción de patrones locales mediante capas convolucionales 1D con el modelado de dependencias temporales a largo plazo mediante una LSTM.

El modelo es extremadamente ligero, con solo 6.450 parámetros, y acepta entradas de forma `(100, 1)`. Se entrenó con señales sintéticas generadas en un cuaderno de clase, no con datos reales de wearables, por lo que su utilidad es principalmente didáctica. A pesar de su simplicidad, alcanza una precisión de test del 97,5 % en el conjunto sintético, lo que demuestra la viabilidad del enfoque para tareas de clasificación de actividad en entornos controlados.

Su relevancia actual radica en que ejemplifica un pipeline completo de clasificación de series temporales con Keras, y sirve como punto de partida para quienes exploran el reconocimiento de actividad humana (HAR) en dispositivos de bajo consumo. No obstante, no está pensado para uso en producción ni para aplicaciones sanitarias o de seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN 1D + LSTM (híbrida) |
| Parametros totales | 6.450 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 100 pasos temporales (secuencia de entrada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | no disponible (modelo Keras, probablemente `.h5` o `.keras`) |

## Arquitectura y entrenamiento

La arquitectura combina una capa convolucional 1D (Conv1D) que extrae patrones locales cortos, como la forma de un solo paso, y reduce la longitud de la secuencia. A continuación, una capa `MaxPooling1D` condensa aún más las características fuertes, y finalmente una LSTM procesa la secuencia resultante para modelar transiciones a largo plazo entre actividades. Esta combinación permite capturar tanto la morfología de cada paso como la dinámica global del movimiento.

El entrenamiento se realizó con datos sintéticos generados en un cuaderno de Google Colab, diseñados específicamente para fines docentes. No se especifica el número de muestras ni la composición exacta del dataset, pero se indica que no es un benchmark real de wearables. El tiempo de entrenamiento reportado es de 45 segundos en la ejecución del autor, y la precisión de test alcanzó el 97,5 %. No se menciona el uso de técnicas como RLHF o DPO, ya que no es un modelo generativo.

## Capacidades

- Clasificación de series temporales de una sola característica en tres clases: estacionario, caminando y corriendo.
- Procesamiento de secuencias de longitud fija de 100 pasos.
- Extracción de características locales mediante convolución 1D y modelado de dependencias temporales mediante LSTM.
- Inferencia extremadamente rápida y ligera, apta para entornos con recursos muy limitados.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multimodales, al ser un modelo discriminativo especializado.

## Casos de uso

- **Educación y aprendizaje de HAR**: el modelo sirve como ejemplo práctico para estudiantes que quieran entender cómo combinar CNN y LSTM en problemas de clasificación de series temporales. Se puede ejecutar en Colab o en local con Keras para experimentar con hiperparámetros.
- **Prototipado rápido de clasificadores de actividad**: dado su tamaño reducido, puede integrarse en un pipeline de prueba para validar la viabilidad de un enfoque antes de escalar a modelos más complejos.
- **Demostración de despliegue en dispositivos edge**: con solo 6.450 parámetros, el modelo puede convertirse a TensorFlow Lite y ejecutarse en microcontroladores o wearables de gama baja, aunque no se ha validado en hardware real.
- **Generación de datos sintéticos para pruebas**: el propio proceso de entrenamiento con señales sintéticas puede replicarse para crear datasets artificiales que permitan probar otros algoritmos de clasificación sin necesidad de recopilar datos reales.
- **Comparación de arquitecturas**: al ser un modelo pequeño y rápido de entrenar, es útil para comparar el rendimiento de CNN+LSTM frente a otras arquitecturas (LSTM pura, CNN pura, transformadores) en la misma tarea.
- **Enseñanza de técnicas de regularización y pooling**: el uso de `MaxPooling1D` entre la CNN y la LSTM es un ejemplo didáctico de cómo reducir la longitud de secuencia para mejorar la eficiencia del entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato reportado es una precisión de test del 97,5 % sobre el conjunto sintético, pero no se proporcionan métricas adicionales (F1, recall, matriz de confusión) ni comparaciones con otros modelos. No se dispone de resultados en benchmarks estándar como MMLU, HumanEval o GSM8K, ya que no es un modelo de lenguaje.

## Requisitos de hardware

- **VRAM estimada**: inferior a 1 GB; el modelo tiene solo 6.450 parámetros, por lo que cabe en cualquier GPU moderna e incluso en CPU.
- **GPU recomendadas**: no requiere GPU; puede ejecutarse en CPU sin problemas. Cualquier GPU con al menos 1 GB de VRAM sería más que suficiente.
- **Compatibilidad con consumer GPU**: sí, funciona en cualquier GPU de consumo (GTX 1050, RTX 3060, etc.) y también en CPU.
- **Opciones de despliegue**: Keras (entrenamiento e inferencia), TensorFlow Lite para dispositivos móviles o edge, o conversión a ONNX para otros runtimes.
- **Latencia y throughput**: no se dispone de mediciones oficiales, pero dada la simplicidad del modelo, la inferencia debería completarse en menos de 1 milisegundo en hardware moderno.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa cuantitativa con otros modelos de clasificación de actividad. Existen alternativas en el ecosistema, como modelos LSTM puros o CNN puros para HAR, pero no se han encontrado datos públicos de rendimiento comparables. Se recomienda consultar benchmarks específicos de HAR (por ejemplo, los basados en el dataset UCI HAR) para evaluar modelos más robustos.

## Limitaciones y advertencias

- **Datos sintéticos**: el modelo se entrenó exclusivamente con señales generadas artificialmente, por lo que su rendimiento en datos reales de sensores será previsiblemente inferior.
- **Una sola característica**: la entrada es un único valor por paso temporal, lo que limita su capacidad para capturar la riqueza de datos de acelerómetros o giroscopios multicanal.
- **Sin validación en usuarios reales**: no se ha probado con diferentes dispositivos, colocaciones del sensor ni poblaciones diversas.
- **No apto para producción**: el autor indica explícitamente que no está destinado a uso sanitario, de seguridad ni de producción.
- **Licencia no especificada**: al no disponer de licencia, no se puede garantizar el uso comercial sin consultar al autor.
- **Alcance limitado**: solo clasifica tres actividades y no maneja transiciones complejas ni actividades intermedias.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/musakhan10/Wearable-Activity-Classifier)
- No se han encontrado otros enlaces oficiales (paper, repositorio, demo) en la información disponible.
