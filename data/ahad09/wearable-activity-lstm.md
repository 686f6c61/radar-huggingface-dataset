# Ahad09/wearable-activity-lstm

## Resumen

El modelo `Ahad09/wearable-activity-lstm` es un clasificador de secuencias temporales desarrollado con Keras, diseñado para reconocer tres actividades físicas (estacionario, caminar y correr) a partir de una secuencia de 100 pasos de una única característica de sensor. Fue creado por el usuario Ahad09 como parte de un ejercicio educativo de clasificación de series temporales, y su objetivo principal es demostrar el comportamiento de una red LSTM frente a otras arquitecturas recurrentes y convolucionales en un contexto de aprendizaje.

El modelo emplea una arquitectura LSTM con 4.451 parámetros, lo que lo convierte en un sistema extremadamente ligero, entrenable en segundos y desplegable en cualquier dispositivo, incluso sin GPU. Su relevancia actual radica en que sirve como ejemplo didáctico de cómo una red recurrente con memoria gated puede manejar secuencias de longitud moderada con un coste computacional mínimo, en contraste con arquitecturas más pesadas. No obstante, hay que subrayar que los datos de entrenamiento son sintéticos y simplificados, por lo que el modelo no está pensado para uso en producción ni para aplicaciones sanitarias o de seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LSTM (una capa recurrente con salida densa) |
| Parametros totales | 4.451 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 100 pasos temporales (secuencia de entrada) |
| Tipos de cuantizacion | no disponible (modelo Keras en precisión float32 por defecto) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | no disponible (probablemente formato Keras HDF5, no confirmado) |

## Arquitectura y entrenamiento

El modelo es una red LSTM (Long Short-Term Memory) de una sola capa, que recibe una secuencia de 100 valores numéricos (una única característica de sensor) y produce una salida de clasificación entre tres clases: estacionario, caminar y correr. La arquitectura completa incluye una capa LSTM seguida de una capa densa con activación softmax para la salida multiclase. El número total de parámetros es de 4.451, lo que indica una capa LSTM con un número reducido de unidades ocultas (probablemente entre 8 y 16).

Los datos de entrenamiento son señales sintéticas generadas en un cuaderno de clase, diseñadas específicamente para fines pedagógicos y no procedentes de un conjunto de datos real de sensores portátiles. No se especifica el número de muestras ni la composición exacta del dataset. El entrenamiento se realizó en un tiempo de 5,4 segundos, lo que confirma la ligereza del modelo. No se menciona el uso de técnicas como RLHF, DPO o regularización avanzada; se trata de un entrenamiento supervisado estándar con retropropagación.

## Capacidades

- Clasificación de secuencias temporales de una sola variable en tres categorías: estacionario, caminar y correr.
- Manejo de secuencias de longitud fija de 100 pasos gracias a la memoria gated de la LSTM, que permite capturar dependencias temporales a medio plazo.
- Inferencia extremadamente rápida y con requisitos mínimos de memoria, apta para ejecución en CPU.
- Capacidad de aprendizaje con pocos parámetros, lo que reduce el riesgo de sobreajuste en datasets pequeños (aunque en este caso los datos son sintéticos).
- No soporta tool calling, agentes, visión, audio ni procesamiento de lenguaje natural, ya que es un modelo puramente numérico para series temporales.

## Casos de uso

- Demostración educativa en cursos de deep learning: el modelo sirve para ilustrar la diferencia entre LSTM, SimpleRNN y CNN en tareas de clasificación de secuencias, mostrando cómo la memoria gated mejora el rendimiento frente a una RNN básica.
- Prototipado rápido de sistemas de reconocimiento de actividad: aunque los datos son sintéticos, el flujo de trabajo (preprocesado, entrenamiento, evaluación) puede replicarse con datos reales de acelerómetros para validar la viabilidad de una solución ligera.
- Prueba de concepto para despliegue en dispositivos embebidos: al tener solo 4.451 parámetros, el modelo puede convertirse a TensorFlow Lite o similar y ejecutarse en microcontroladores o smartphones para evaluar la latencia y el consumo energético.
- Benchmark interno de arquitecturas recurrentes: los equipos de investigación pueden utilizar este modelo como referencia de coste computacional frente a otras arquitecturas más complejas en tareas de series temporales.
- Generación de datos sintéticos para pruebas de pipelines de MLOps: al ser un modelo pequeño y rápido de entrenar, puede integrarse en pipelines de CI/CD para verificar que el flujo de entrenamiento, registro y despliegue funciona correctamente.
- Ejemplo de comparación de métricas: el autor reporta una precisión de 0,913, lo que permite a los estudiantes analizar el equilibrio entre precisión y complejidad frente a un CNN que alcanza el 100% pero con 11 veces más parámetros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) porque este modelo no pertenece a la categoría de modelos de lenguaje o razonamiento general. La única métrica disponible es la precisión de prueba reportada por el autor:

| Metrica | Valor |
|---|---|
| Precisión en test | 0,913 (91,3%) |
| Tiempo de entrenamiento | 5,4 segundos |

El autor también menciona que un modelo CNN obtuvo una precisión del 100% con 49.475 parámetros, y un SimpleRNN obtuvo un 46,7% con un número de parámetros no especificado. Estos datos provienen de la model card y no han sido verificados de forma independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 MB (el modelo ocupa aproximadamente 18 KB en float32, por lo que cabe en cualquier memoria).
- GPU recomendada: ninguna, se ejecuta perfectamente en CPU. Cualquier procesador moderno es suficiente.
- Compatibilidad con GPU de consumo: sí, cualquier GPU (incluso integradas) puede ejecutarlo, aunque no es necesario.
- Opciones de despliegue: Keras, TensorFlow Lite, ONNX, o conversión a otros formatos. Al ser un modelo pequeño, también puede ejecutarse en navegador con TensorFlow.js.
- Latencia y throughput: no se han medido formalmente, pero dado el tamaño, la inferencia debería ser del orden de microsegundos en CPU y de milisegundos en dispositivos embebidos.

## Comparativa con modelos similares

No se dispone de una comparativa directa con otros modelos de la misma categoría en la información proporcionada. El autor menciona dos alternativas evaluadas en el mismo ejercicio:

| Modelo | Parámetros | Precisión en test | Observaciones |
|---|---|---|---|
| LSTM (este modelo) | 4.451 | 91,3% | Equilibrio entre precisión y eficiencia |
| CNN | 49.475 | 100% | Mayor precisión pero 11 veces más parámetros |
| SimpleRNN | no especificado | 46,7% | Rendimiento pobre en secuencias de 100 pasos |

No hay datos de otros modelos públicos de HAR (como CNN-LSTM o transformadores) que permitan una comparativa externa.

## Limitaciones y advertencias

- Datos de entrenamiento sintéticos y simplificados: el modelo no ha sido validado con datos reales de sensores, por lo que su rendimiento en condiciones reales es desconocido y probablemente deficiente.
- Una sola característica de sensor: los sistemas reales de reconocimiento de actividad suelen usar múltiples ejes (acelerómetro, giroscopio) y múltiples sensores; este modelo ignora esa complejidad.
- Sin pruebas con usuarios o dispositivos reales: no se ha evaluado la variabilidad entre personas, la colocación del sensor ni el ruido del mundo real.
- No apto para uso en salud, seguridad o producción: el autor lo declara explícitamente como un modelo educativo.
- Licencia no especificada: no se puede determinar si su uso comercial está permitido; se recomienda contactar al autor antes de cualquier uso fuera del ámbito académico.
- Riesgo de alucinación no aplica (no es un modelo generativo), pero sí existe riesgo de clasificaciones erróneas si se usa con datos fuera de la distribución sintética.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Ahad09/wearable-activity-lstm
- No se han encontrado otros enlaces oficiales (paper, repositorio, demo) en la información disponible.
