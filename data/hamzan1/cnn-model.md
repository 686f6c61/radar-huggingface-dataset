# hamzaN1/CNN-Model

## Resumen

El modelo `hamzaN1/CNN-Model` es una red neuronal convolucional unidimensional (CNN 1D) diseñada para clasificar secuencias cortas de datos de sensores portátiles (wearables) en tres actividades físicas: **Stationary** (quieto), **Walking** (caminando) y **Running** (corriendo). Fue desarrollado por el usuario `hamzaN1` como parte de un laboratorio educativo de deep learning en grupo, en el que se compararon cuatro arquitecturas (CNN, SimpleRNN, LSTM y CNN+LSTM) sobre un mismo conjunto de datos fijo.

El modelo es extremadamente ligero, con solo 49.475 parámetros, y está implementado con Keras/TensorFlow. Su propósito principal es demostrar conceptos de clasificación de series temporales en un entorno académico, no servir como sistema de monitorización de salud o fitness en producción. A pesar de su simplicidad, alcanza una precisión perfecta (1.000) en el conjunto de test del dataset fijo utilizado, lo que lo convierte en un ejemplo didáctico interesante para entender el comportamiento de las CNN en datos secuenciales.

La relevancia de este modelo radica en su carácter educativo: permite comparar el rendimiento de distintas arquitecturas recurrentes y convolucionales en una tarea de clasificación de sensores, con un coste computacional mínimo y un código reproducible. No es un modelo de lenguaje ni un sistema de IA generativa, sino un clasificador especializado en señales temporales de un solo canal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN 1D (Conv1D + MaxPooling1D + Flatten + Dense) |
| Parametros totales | 49.475 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (ventana fija de 100 pasos temporales) |
| Tipos de cuantizacion | no disponible (modelo Keras en formato .h5) |
| Idiomas soportados | no aplica (modelo de clasificacion numerica) |
| Licencia | MIT |
| Formato de pesos | .h5 (weights) |

## Arquitectura y entrenamiento

La arquitectura es una CNN 1D secuencial con la siguiente composición: una capa `Conv1D` con 32 filtros y kernel de tamaño 5, activación ReLU, seguida de una capa de `MaxPooling1D` con pool de tamaño 2, una capa `Flatten`, una capa densa de 32 neuronas con ReLU y una capa de salida densa de 3 neuronas con softmax. La entrada es una secuencia de 100 pasos temporales con un único canal de sensor.

El entrenamiento se realizó sobre un dataset fijo llamado `Wearable_Activity_Dataset` (release con split de semilla 42), con 600 secuencias de entrenamiento, 150 de validación y 150 de test. El conjunto de entrenamiento está perfectamente balanceado (200 muestras por clase). Se usó el optimizador Adam con learning rate por defecto, pérdida sparse categorical crossentropy, 6 épocas y batch size de 32. La misma configuración se aplicó a los cuatro modelos del laboratorio para garantizar una comparación justa. No se menciona el uso de técnicas como RLHF, DPO o aumentación de datos.

## Capacidades

- Clasificación de secuencias de sensores de un solo canal en tres clases: Stationary, Walking y Running.
- Procesamiento de ventanas temporales fijas de 100 pasos.
- Inferencia extremadamente rápida y ligera (49.475 parámetros), apta para ejecución en CPU o incluso en dispositivos embebidos.
- No soporta generación de texto, razonamiento, código, visión ni tool calling, al ser un modelo puramente clasificador.
- No tiene capacidades multilingües ni de agentes.
- No dispone de modo de pensamiento (thinking mode) ni procesamiento de audio o vídeo.

## Casos de uso

- **Demostración educativa en cursos de deep learning**: el modelo sirve para ilustrar cómo una CNN 1D puede procesar series temporales y comparar su rendimiento con arquitecturas recurrentes (RNN, LSTM) en un laboratorio académico.
- **Prototipado rápido de clasificación de actividad física**: investigadores o estudiantes pueden usar el modelo como punto de partida para experimentar con datos de sensores inerciales (acelerómetros, giroscopios) antes de escalar a modelos más complejos.
- **Prueba de concepto de pipelines de datos de wearables**: el modelo puede integrarse en un flujo de datos simulado para validar la ingesta, preprocesado y evaluación de señales de sensores en tiempo real.
- **Benchmark de referencia en tareas de clasificación de series temporales**: al ser un modelo pequeño y con precisión perfecta en su dataset, puede usarse como baseline en comparativas de arquitecturas para la misma tarea.
- **Ejemplo de despliegue en entornos con recursos limitados**: su tamaño reducido permite probar su inferencia en Raspberry Pi, microcontroladores o servicios serverless sin necesidad de GPU.
- **Material de estudio para entender overfitting y generalización**: dado que el dataset es sintético/fijo y el modelo alcanza un 100% de precisión, es útil para analizar los riesgos de sobreajuste y la falta de robustez ante datos reales.

## Benchmarks y rendimiento

La model card proporciona resultados de evaluación en el conjunto de test del dataset fijo, comparando las cuatro arquitecturas del laboratorio:

| Modelo | Precisión en test | Parámetros | Tiempo de entrenamiento (s) |
|---|---|---|---|
| CNN (este modelo) | 1.000 | 49.475 | 2.81 |
| SimpleRNN | 0.580 | 1.187 | 4.77 |
| LSTM | 0.693 | 4.451 | 7.12 |
| CNN+LSTM (híbrido) | 1.000 | 8.611 | 6.35 |

No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GSM8K, ya que el modelo no es un LLM. La precisión perfecta en test debe interpretarse con cautela, pues el dataset es pequeño y sintético, y el modelo no ha sido evaluado en datos reales de sensores.

## Requisitos de hardware

- **VRAM estimada**: no requiere VRAM dedicada; el modelo tiene solo 49.475 parámetros, lo que ocupa menos de 1 MB en memoria.
- **GPU recomendadas**: ninguna en particular; puede ejecutarse en CPU sin problemas. Si se desea usar GPU, cualquier GPU moderna (incluso integradas) es suficiente.
- **Compatibilidad con GPU de consumo**: sí, cualquier GPU de consumo (RTX 2060, GTX 1650, etc.) ejecuta el modelo con latencia despreciable.
- **Opciones de despliegue**: al ser un modelo Keras, puede servirse con TensorFlow Serving, o exportarse a TensorFlow Lite para dispositivos móviles/embebidos. También puede usarse con frameworks como ONNX Runtime si se convierte el modelo.
- **Latencia y throughput**: no se han publicado mediciones oficiales, pero dada la simplicidad de la arquitectura, la inferencia de una secuencia de 100 pasos debería completarse en menos de 1 milisegundo en CPU moderna.

## Comparativa con modelos similares

La comparativa más relevante es con las otras arquitecturas del mismo laboratorio, ya que se entrenaron con el mismo dataset y configuración:

| Modelo | Parámetros | Precisión en test | Tiempo entrenamiento (s) | Licencia |
|---|---|---|---|---|
| CNN (este modelo) | 49.475 | 1.000 | 2.81 | MIT |
| SimpleRNN | 1.187 | 0.580 | 4.77 | MIT |
| LSTM | 4.451 | 0.693 | 7.12 | MIT |
| CNN+LSTM (híbrido) | 8.611 | 1.000 | 6.35 | MIT |

La CNN supera claramente a las variantes recurrentes simples en precisión y tiempo de entrenamiento, aunque con más parámetros que SimpleRNN y LSTM. El híbrido CNN+LSTM iguala la precisión de la CNN pura con menos parámetros, pero tarda más en entrenar. No se dispone de comparativas con otros modelos externos de clasificación de series temporales en la información proporcionada.

## Limitaciones y advertencias

- **Dataset sintético y pequeño**: el modelo se entrenó con un dataset fijo y aparentemente sintético, por lo que su precisión del 100% no se generalizará a datos reales de sensores con ruido, deriva del sensor o variaciones en la colocación del dispositivo.
- **Solo 6 épocas de entrenamiento**: las arquitecturas recurrentes (SimpleRNN y LSTM) probablemente no convergieron, lo que subestima su rendimiento real. La CNN, al converger rápido, se beneficia de esta configuración.
- **Longitud de secuencia fija**: el modelo solo acepta entradas de exactamente 100 pasos temporales; no está preparado para secuencias más largas o de longitud variable.
- **Un solo canal de sensor**: la arquitectura asume una única señal de entrada, lo que limita su aplicabilidad a datos multimodales (acelerómetro + giroscopio, etc.).
- **Uso no productivo**: la model card indica explícitamente que no está destinado a monitorización de salud o fitness en producción.
- **Licencia MIT**: permite uso comercial y modificación, pero el autor no ofrece garantías sobre el rendimiento en entornos reales.

## Enlaces

- [HuggingFace - hamzaN1/CNN-Model](https://huggingface.co/hamzaN1/CNN-Model)
- [GitHub - Hamza-Maa/Simple-CNN-model](https://github.com/Hamza-Maa/Simple-CNN-model) (repositorio relacionado, posiblemente del mismo autor)
