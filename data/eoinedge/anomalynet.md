# eoinedge/AnomalyNet

## Resumen

AnomalyNet es un clasificador binario de series temporales publicado por el autor eoinedge en HuggingFace. Se trata de un perceptron multicapa (MLP) de solo 842 parametros que recibe una ventana de 32 muestras consecutivas de temperatura (3,2 segundos a 10 Hz) y devuelve dos logits: ventana normal o ventana con anomalia. Su proposito no es competir con modelos generativos, sino servir como "segundo cerebro" embebido en un PLC: un modelo diminuto que corre en el propio microcontrolador, junto a la logica de control, y que solo comparte una variable (`p(anomaly)`) con el resto del sistema.

El modelo se distribuye en formatos especificamente orientados al borde: un state dict de PyTorch en fp32, programas de ExecuTorch (fp32 de 5,5 KB e int8 de 3,6 KB con kernels CMSIS para Cortex-M0+, M4, M33 y M7) y equivalentes en TensorFlow Lite y TensorFlow Lite Micro. Esta orientado a deteccion de anomalias industriales en senales de sensores, con cuatro tipos inyectados en el entrenamiento: picos, caidas de senal (dropout), rampas descontroladas y rafagas de ruido.

Es relevante ahora porque ejemplifica una linea concreta de la IA open source: modelos de menos de un kilobyte de pesos que se despliegan en microcontroladores Cortex-M sin conexion a la nube, con latencias de milisegundos y licencia Apache-2.0. La model card declara 99,62 % de exactitud sobre un conjunto de test sintetico, aunque estos resultados no estan verificados de forma independiente.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Perceptron multicapa (MLP) denso: fc1 32->24 con ReLU, fc2 24->2; salida de 2 logits con softmax opcional |
| Parametros totales | 842 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica: ventana fija de 32 muestras consecutivas (3,2 s a 10 Hz) |
| Tipos de cuantizacion | fp32 e int8 (int8 generado con el cuantizador Cortex-M de ExecuTorch) |
| Idiomas soportados | no aplica (modelo tabular/series temporales, no procesa lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch state dict (`.pt`), ExecuTorch (`.pte`), TensorFlow Lite (`.tflite`); no hay safetensors ni GGUF |
| Entrada | tensor `(1, 32)` de tipo float; temperatura en grados Celsius normalizada como `(t - 50) / 20` |
| Salida | 2 logits `[normal, anomalia]`; `p(anomaly)` tras softmax |
| Tamano de los artefactos | 5,5 KB (ExecuTorch fp32) y 3,6 KB (ExecuTorch int8) |
| Frecuencia de muestreo asumida | 10 Hz (3,2 s por ventana) |
| Repositorio | 0,0 GB, 0 descargas y 0 likes en el momento de la consulta; creado el 2026-10-11 |

## Arquitectura y entrenamiento

La arquitectura es un MLP minimo de dos capas: `fc1` proyecta las 32 muestras de entrada a 24 unidades ocultas con activacion ReLU, y `fc2` proyecta esas 24 unidades a 2 logits que se interpretan como clase normal y clase anomalia. El preprocesado es parte contractual del modelo: la entrada debe ser temperatura en Celsius normalizada con los desplazamientos y escalas definidos en `anomaly_net.py`. No hay mecanismos de atencion, capas recurrentes ni convoluciones; el modelo no modela dependencias temporales explicitas mas alla de la ventana fija de 32 muestras.

El entrenamiento se realizo exclusivamente con datos sinteticos. El generador incluido en `train/train_anomaly.py` del repositorio UNO Q simula un lazo de calefaccion en torno a 50 grados centigrados con deriva lenta y ruido de sensor, e inyecta cuatro tipos de anomalia: picos, dropout de sensor, rampas descontroladas y rafagas de ruido. El mismo generador produjo el conjunto de datos publicado `eoinedge/heater-anomaly-windows`. El entrenamiento uso optimizador Adam y entropia cruzada, con unos cientos de epocas ejecutadas en CPU en menos de un minuto. La model card no menciona RLHF, DPO ni tecnicas de alineacion, algo coherente con un clasificador tabular.

La innovacion destacable no esta en la arquitectura, sino en la cadena de despliegue: exportacion a ExecuTorch con kernels portables fp32 y con cuantizacion int8 especifica para CMSIS en Cortex-M0+, M4, M33 y M7, mas una gemela en Keras para generar los `.tflite` de TensorFlow Lite Micro. Se incluye tambien `test_vectors.h` con una ventana normal y otra anomala junto a los logits de referencia, lo que facilita la validacion en hardware sin necesidad de reconstruir el pipeline.

## Capacidades

- Clasificacion binaria de ventanas de temperatura: distingue entre ventana normal y ventana que contiene una anomalia.
- Deteccion de cuatro patrones de fallo concretos en la senal: picos puntuales, caidas o dropouts de sensor, rampas descontroladas y rafagas de ruido.
- Inferencia en microcontroladores Cortex-M sin sistema operativo de proposito general, con soporte para Zephyr y ExecuTorch.
- Ejecucion en tiempo real a 10 Hz: la ventana de 3,2 s se puede solapar o procesar de forma continua segun la logica de adquisicion.
- Integracion como tarea paralela junto a una tarea de scan de logica de escalera (ladder logic) en un PLC, comunicadas por una unica variable compartida.
- Salida probabilistica (`p(anomaly)`) que permite fijar umbrales de decision adaptados a la tolerancia a falsos positivos del proceso.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision, audio, tool calling ni capacidad de agente; no es un modelo de lenguaje.

## Casos de uso

- Deteccion de anomalias en lazos de calefaccion industriales: el modelo se ejecuta en el propio PLC o en el microcontrolador que acompana al controlador, analizando ventanas de 3,2 s de la senal de temperatura y activando una alarma cuando `p(anomaly)` supera un umbral. Es adecuado porque no requiere conectividad ni enviar datos de proceso a la nube.
- Monitorizacion predictiva de sensores de temperatura en maquinaria: una rafaga de ruido o un dropout sostenido suelen preceder a un fallo de sensor; el modelo identifica esos patrones con precisión declarada del 100 % sobre el conjunto sintetico, lo que permite programar mantenimiento antes de que la medida deje de ser fiable.
- Arquitectura de "doble cerebro" PLC + SoC Linux: en los demos UNO Q y OPTA, el modelo corre en el Cortex-M junto a la tarea de control y publica `p(anomaly)` hacia el lado Linux, que se encarga de la visualizacion o del registro. El reparto es adecuado porque el modelo cabe en 3,6 KB y consume 1,6 ms por inferencia en un STM32U585 a 160 MHz.
- Deteccion de derivas lentas en procesos termicos: la rampa descontrolada es uno de los cuatro tipos de anomalia entrenados, de modo que el modelo puede señalar una deriva antes de que la variable salga del rango operativo definido por el controlador.
- Filtrado en el borde para reducir trafico: en instalaciones con muchos sensores y conectividad limitada, el modelo puede evaluar las ventanas localmente y transmitir solo aquellas marcadas como anomalas, reduciendo el ancho de banda y el coste de almacenamiento.
- Validacion de cadenas de adquisicion: al detectar picos y dropouts, el modelo sirve para auditar la calidad de la senal de un sensor recien instalado o de un canal de adquisicion sospechoso, sin herramientas externas de analisis.
- Prototipado y docencia en TinyML: al incluir pesos fp32 e int8, programas ExecuTorch por familia de Cortex-M, equivalentes TFLite, vectores de test con logits de referencia y licencia Apache-2.0, es un ejemplo util para cursos y talleres de despliegue en microcontrolador (micro:bit v2, Thingy:91, LAUNCHXL-CC1352P1).
- Autotest en firmware: `test_vectors.h` permite incorporar una comprobacion de regresion en el arranque del dispositivo para verificar que el runtime de inferencia produce los logits esperados tras una actualizacion de firmware.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card sobre el split de test de `eoinedge/heater-anomaly-windows` (4.000 ventanas sinteticas, 50 % de anomalias). Ninguno de los valores esta verificado de forma independiente en la informacion disponible.

| Métrica | Valor |
|---|---|
| Exactitud (accuracy) | 99,62 % |
| Precision | 100 % |
| Recall | 99,25 % |
| Parametros | 842 |

Latencias de inferencia declaradas en la model card (fp32):

| Plataforma | Reloj | Latencia |
|---|---|---|
| STM32U585 | 160 MHz | 1,6 ms |
| nRF52833 | 64 MHz | 4,3 ms |
| nRF9160 | 64 MHz | 4,0 ms |

No se han publicado en la informacion disponible resultados en benchmarks estandar de NLP o de codigo (MMLU, HumanEval, GSM8K u otros), ya que el modelo no aborda esas tareas.

## Requisitos de hardware

- VRAM: no aplica. El modelo no esta pensado para GPU; el artefacto ExecuTorch int8 ocupa 3,6 KB y el fp32 5,5 KB, por lo que reside en flash del microcontrolador y opera sobre un buffer de 32 floats mas los pesos en SRAM.
- GPU recomendadas: ninguna. El entrenamiento descrito se completo en CPU en menos de un minuto.
- Cabe en cualquier GPU de consumo e incluso en CPU de escritorio sin requisitos relevantes; el objetivo real de despliegue son microcontroladores Cortex-M.
- Microcontroladores objetivo segun los artefactos publicados: familias Cortex-M0+, M4, M33 y M7 (por ejemplo STM32U585, nRF52833, nRF9160, micro:bit v2, Thingy:91, LAUNCHXL-CC1352P1).
- Opciones de despliegue: ExecuTorch (fp32 portable e int8 con cuantizador CMSIS Cortex-M), TensorFlow Lite y TensorFlow Lite Micro, sobre Zephyr o bare metal; tambien se puede ejecutar el state dict fp32 con PyTorch en el lado Linux para comparacion o validacion.
- Latencia declarada: 1,6 ms por ventana en STM32U585 a 160 MHz, 4,3 ms en nRF52833 a 64 MHz y 4,0 ms en nRF9160 a 64 MHz. Para una ventana de 3,2 s a 10 Hz, esto supone un margen de varios ordenes de magnitud respecto al periodo de muestreo.
- Throughput: no disponible de forma explicita; se puede estimar a partir de la latencia (del orden de cientos de inferencias por segundo en STM32U585, muy por encima de las 10 Hz necesarias).
- Entrenamiento: no requiere GPU. Reproducible en CPU a partir del generador sintetico incluido en `train/train_anomaly.py`.

## Comparativa con modelos similares

No se han proporcionado modelos comparables en la informacion disponible. La model card no incluye una comparativa frente a otras propuestas de deteccion de anomalias (por ejemplo autoencoders, Isolation Forest o redes recurrentes ligeras) ni datos de terceros sobre el mismo conjunto de test. La unica comparacion referenciada es de runtime, no de modelo: el repositorio `executorch-vs-tflm-benchmarks` compara el rendimiento de ExecuTorch frente a TensorFlow Lite Micro en el mismo hardware.

| Criterio | AnomalyNet | Alternativas |
|---|---|---|
| Parametros | 842 | no disponible |
| Contexto / ventana | 32 muestras (3,2 s a 10 Hz) | no disponible |
| Exactitud en tarea | 99,62 % (autor, no verificado) | no disponible |
| Licencia | Apache-2.0 | no disponible |
| Formatos de despliegue | ExecuTorch, TFLite, TFLite Micro | no disponible |

## Limitaciones y advertencias

- Entrenamiento exclusivamente sintetico: el generador simula un lazo de calefaccion en torno a 50 grados Celsius con deriva lenta y ruido, mas cuatro tipos de anomalia. La precision en una planta real dependera de la similitud entre el proceso fisico y el generador; no se han publicado validaciones con datos reales.
- Sesgo de dominio claro: el modelo esta ajustado a una variable (temperatura), una frecuencia de muestreo (10 Hz), una ventana fija y unos rangos concretos. Reutilizarlo en otro proceso exige regenerar datos y reentrenar, no solo reexportar.
- Dependencia del preprocesado: si no se aplica la normalizacion `(t - 50) / 20`, las predicciones dejan de ser validas. El despliegue debe replicar exactamente esas constantes.
- Clasificacion binaria sin diagnostico: el modelo indica si la ventana es anomala, pero no distingue cual de los cuatro tipos ha ocurrido. Para diagnostico haria falta una cabeza adicional o un modelo distinto.
- Riesgo de falsos negativos: el recall declarado es 99,25 %, es decir, aproximadamente 7 de cada 1.000 ventanas anomalas del conjunto sintetico podrian no detectarse. En un lazo de seguridad real esto exige umbrales conservadores y redundancia con otras protecciones.
- Riesgo de falsos positivos: la precision declarada es del 100 % sobre el conjunto de test, un valor que en la practica suele degradarse al cambiar la distribucion de datos; conviene calibrar el umbral con datos del proceso objetivo.
- Resultados no verificados: la model card marca las metricas con `verified: false`. No hay evaluacion independiente ni particion de test reproducible mas alla del propio dataset publicado por el autor.
- Idiomas y capacidades de lenguaje: no aplica. El modelo no procesa texto ni mantiene conversaciones, por lo que no existen capacidades multilingues, tool calling ni comportamiento de agente.
- Licencia: Apache-2.0 permite uso comercial, modificacion y redistribucion, con obligacion de conservar los avisos de copyright y licencia y de indicar los cambios; incluye concesion de patentes. La licencia del conjunto de datos `eoinedge/heater-anomaly-windows` no se detalla en la informacion disponible.
- Fechas del repositorio: las marcas temporales de creacion y actualizacion del repositorio (2026-10-11) son posteriores a la fecha habitual de consulta y no se corresponden con ningun dato adicional; conviene tratarlas con cautela. El repositorio figura con 0 descargas y 0 likes, por lo que no hay evidencia de uso en produccion.
- Advertencia sobre la busqueda web: los resultados de la busqueda realizada no contienen informacion tecnica relevante sobre el modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/eoinedge/AnomalyNet
- Conjunto de datos: https://huggingface.co/datasets/eoinedge/heater-anomaly-windows
- Repositorio UNO Q (generador de datos y entrenamiento): https://github.com/eoinjordan/executorch-zephyr-arduino-uno-q
- Repositorio OPTA (despliegue junto a logica de escalera en PLC): https://github.com/eoinjordan/executorch-zephyr-arduino-opta
- Benchmarks ExecuTorch frente a TFLM: https://github.com/eoinjordan/executorch-vs-tflm-benchmarks
- Articulo de contexto sobre IA para sistemas de control industrial: https://www.edgeimpulse.com/blog/transform-industrial-control-systems-with-ai-anomaly-detection-made-easy/
