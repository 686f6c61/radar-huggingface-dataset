# pedrodcarvalho/florasense-plant-health-tflite

## Resumen

FloraSense Plant Health Score (TFLite) es un modelo de regresión tabular de muy pequeno tamano desarrollado por Pedro Domitti de Carvalho como parte de su trabajo de fin de grado (TCC) en Ingenieria Informatica en la PUC-Campinas. El modelo estima una puntuacion de salud vegetal (aproximadamente en el rango 0-100) a partir de cuatro lecturas de sensores ambientales: temperatura, humedad, luminosidad y humedad del suelo.

Se trata de un perceptron multicapa (MLP) sencillo implementado en Keras y convertido a TensorFlow Lite, con un tamano de apenas 11,6 KB en formato float32. Su proposito es ejecutarse en microcontroladores (concretamente ESP32) mediante TensorFlow Lite for Microcontrollers, dentro del sistema IoT de monitorizacion de plantas FloraSense.

Su relevancia es acotada pero clara: ejemplifica el paradigma TinyML aplicado a agricultura de precision y domotica vegetal, donde la inferencia ocurre en el dispositivo sin conexion a la nube. No es un modelo de lenguaje ni un modelo generativo; es una herramienta de regresion especifica y de dominio muy restringido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP secuencial (Dense 64 ReLU → Dense 32 ReLU → Dense 1 lineal) |
| Parametros totales | no disponible (modelo de ~11,6 KB en float32) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada fija de 4 caracteristicas) |
| Tipos de cuantizacion | float32 (sin cuantizacion en la conversion) |
| Idiomas soportados | no aplica (modelo numerico, sin procesamiento de lenguaje) |
| Licencia | MIT |
| Formato de pesos | .tflite, .h (array de bytes C), .keras |

## Arquitectura y entrenamiento

El modelo es una red neuronal densa de tres capas: `Dense(64, relu)` → `Dense(32, relu)` → `Dense(1)` con activacion lineal en la salida. Se entreno con perdida MSE y optimizador Adam durante 20 epocas, con una particion 80/20 entre entrenamiento y validacion. El conjunto de datos consta de 1.000 muestras de lecturas de sensores junto con su puntuacion de salud asociada, recogidas en el repositorio fuente del proyecto.

La entrada es un vector `float32[1, 4]` estandarizado con un `StandardScaler` de scikit-learn ajustado sobre los datos de entrenamiento. Las medias y desviaciones tipicas son: temperatura (25,058 °C, 2,936), humedad (60,708 %, 9,970), luminosidad (19.859,787 lux, 3.020,656) y humedad del suelo (45,088 %, 14,744). La conversion a TFLite se realizo con `tf.lite.TFLiteConverter.from_keras_model` sin aplicar cuantizacion. El MSE de validacion final fue de aproximadamente 258,6, lo que equivale a un RMSE de unos 16 puntos de puntuacion.

## Capacidades

- Regresion tabular: estima una puntuacion de salud vegetal a partir de cuatro variables ambientales.
- Inferencia en dispositivo: disenado para ejecutarse en microcontroladores (ESP32) mediante TFLite Micro.
- Huella minima: el modelo ocupa aproximadamente 11,6 KB, adecuado para entornos con memoria muy limitada.
- Estandarizacion integrable: incluye el escalador en formatos pickle y JSON para replicar el preprocesado.
- Sin soporte de tool calling, agentes, razonamiento multi-paso, vision, audio ni capacidades multilingues.
- No es un modelo generativo: no produce texto ni mantiene conversaciones.

## Casos de uso

- Monitorizacion de plantas en hogares: el modelo se ejecuta en un ESP32 conectado a sensores de temperatura, humedad, luz y humedad del suelo, y calcula localmente una puntuacion de salud sin depender de la nube.
- Agricultura de precision de bajo coste: despliegue en nodos sensores distribuidos en campo para obtener indicadores de salud del cultivo y activar alertas de riego o iluminacion.
- Sistemas de riego automatizado: la puntuacion de salud puede usarse como senal de entrada para umbrales que disparen el riego cuando el indicador cae por debajo de un valor configurado.
- Prototipos educativos de TinyML: sirve como ejemplo completo de pipeline Keras → TFLite → TFLite Micro para cursos y talleres de aprendizaje automatico embebido.
- Investigacion en IoT agricola: base para experimentos de inferencia en el borde con restricciones severas de memoria y energia.
- Integracion en invernaderos: combinado con otros sensores, permite un seguimiento continuo del estado de las plantas con latencia minima y sin conectividad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento reportado es el MSE de validacion de aproximadamente 258,6 (RMSE ≈ 16 puntos de puntuacion) sobre el conjunto de validacion del propio dataset de entrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia: practicamente nula; el modelo ocupa ~11,6 KB y puede ejecutarse en RAM de microcontrolador.
- GPU recomendadas: no aplica; no requiere GPU.
- Cabe en cualquier GPU de consumo e incluso en microcontroladores como el ESP32.
- Opciones de despliegue: TensorFlow Lite (Python, C++), TFLite Micro (ESP32 y otros MCU), TensorFlow/Keras para la version original.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por el tamano del modelo se espera una latencia de orden de microsegundos a milisegundos en MCU, pero no se aportan cifras concretas.

## Comparativa con modelos similares

No disponible. No se han proporcionado modelos comparables en la informacion recibida, y se trata de un modelo de regresion tabular especifico de dominio sin equivalentes publicos conocidos en el mismo repositorio o ecosistema.

## Limitaciones y advertencias

- Conjunto de datos muy pequeno (1.000 muestras) y arquitectura simple; la puntuacion debe tratarse como un indicador, no como un diagnostico.
- No es especifico de especie: el escalador y la puntuacion reflejan los rangos de los datos de entrenamiento; lecturas fuera de esos rangos extrapolan mal.
- El suelo (pH y nivel de nutrientes) existe en el dataset pero no se usa como entrada del modelo.
- Sin cuantizacion: el modelo se distribuye en float32, lo que limita su uso en MCU con recursos extremadamente ajustados si se requiere menor huella.
- Sesgos conocidos: no documentados, pero el modelo hereda los sesgos de su conjunto de datos de entrenamiento, de origen y alcance no detallados.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de predicciones poco fiables fuera de la distribucion de entrenamiento.
- Licencia MIT: permite uso comercial y modificacion con atribucion; no se identifican restricciones adicionales.
- Para produccion: validar el modelo con datos del entorno real antes de usarlo como unica senal de decision agronomica.

## Enlaces

- HuggingFace: https://huggingface.co/pedrodcarvalho/florasense-plant-health-tflite
- Codigo fuente: https://github.com/pedrodcarvalho/flora-sense
