# fragilov/lumohub-imu-burst-1dcnn

## Resumen

LumoHub IMU Burst 1D-CNN (`LumoBurst1DCNN`) es una red neuronal convolucional unidimensional de extremo a extremo disenada para ejecutarse directamente sobre un microcontrolador ESP32-S3 dentro del proyecto LumoHub. Su funcion es clasificar rafagas de 3 segundos de datos IMU de 6 ejes (30 muestras x 6 canales a 10 Hz) recibidas por BLE desde un wearable de muneca, con el objetivo de eliminar falsas alertas en la deteccion de caidas. El modelo distingue cinco clases: actividad cotidiana, falso positivo por golpe en la muneca, caida del dispositivo, caida leve con recuperacion y caida critica con inmovilidad.

Se trata de un modelo TinyML extremadamente compacto: 5.325 parametros (21.300 bytes en Flash) y 58.368 MACs por inferencia, lo que permite inferencia local sin dependencias en el ESP32-S3. La arquitectura combina dos capas Conv1D con pooling dual (global average y global max) y una cabeza fully connected de dos capas que produce 5 logits.

Es relevante en el contexto de sistemas wearables de bajo consumo y teleasistencia, donde reducir la tasa de falsas alarmas es tan critico como mantener alta la sensibilidad a caidas reales. El autor reporta un 98,38% de accuracy y un 99,33% de sensibilidad binaria a caidas en un conjunto de test de 4.500 muestras, con tasas de falsa alarma del 0,11% y 0,00% para las clases de shock y caida del dispositivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN 1D (2 capas Conv1D + pooling dual + MLP) |
| Parametros totales | 5.325 (21.300 bytes en Flash) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrada fija de 30 muestras x 6 canales) |
| Tipos de cuantizacion | no disponible (pesos exportados como C99 foldado) |
| Idiomas soportados | no disponible (modelo de sensores, sin procesamiento de lenguaje) |
| Licencia | MIT |
| Formato de pesos | Cabecera C (`lumo_hub_cnn_model.h`) con pesos foldados |
| Entrada | Tensor `[30, 6]` normalizado (ax/8g, ay/8g, az/8g, gx/250dps, gy/250dps, gz/250dps) |
| Salida | 5 clases (softmax sobre logits) |
| Coste computacional | 58.368 MACs por inferencia |
| Hardware objetivo | ESP32-S3 (LumoHub) |
| Sensor origen | MPU6050 (stream BLE `0x03`) |

## Arquitectura y entrenamiento

La red procesa una secuencia de 30 muestras temporales con 6 canales (acelerometro de 3 ejes normalizado a +/-8g y giroscopio de 3 ejes normalizado a +/-250 dps). El backbone consta de una primera convolucion `Conv1D(6->24, k=5)` seguida de ReLU y `MaxPool(2)`, y una segunda `Conv1D(24->32, k=3)` con ReLU y `MaxPool(3)`. Sobre las activaciones se aplica un pooling dual que concatena `GlobalAvgPool1D` y `GlobalMaxPool1D`, produciendo un vector de 64 dimensiones. La cabeza es un MLP `Linear(64->32) + ReLU + Linear(32->5)` que emite los logits de las cinco clases.

El modelo esta disenado para inferencia embebida: los pesos se exportan foldados como C99 en `lumo_hub_cnn_model.h` y se ejecutan mediante `lumo_imu_ai.c` sin dependencias externas. No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion exacta del dataset, ni si se emplearon tecnicas de aumento de datos o regularizacion mas alla de lo descrito. La model card reporta evaluacion sobre un split de test retenido de 4.500 muestras, pero no detalla el proceso de entrenamiento ni hiperparametros.

## Capacidades

- Clasificacion de rafagas IMU de 6 ejes en 5 clases discretas: `NORMAL_ADL`, `WRIST_SHOCK_FALSE_ALERT`, `DEVICE_DROP_OFF_WRIST`, `SOFT_FALL_RECOVERING` y `CRITICAL_FALL_IMMOBILE`.
- Deteccion binaria de caidas (agrupando clases 3 y 4) con sensibilidad reportada del 99,33%.
- Discriminacion de falsos positivos por golpes en la muneca sin colapso corporal (tasa de falsa alarma del 0,11%).
- Deteccion de caida o desabrochado del dispositivo (tasa de falsa alarma del 0,00%).
- Inferencia local en ESP32-S3 sin conexion a servicios externos.
- Tolerancia a ruido de sensor elevado (2x): accuracy del 98,44% en el test de estres.
- No soporta tool calling, agentes, razonamiento multi-paso, vision, audio ni capacidades multilingues; es un clasificador de series temporales de proposito especifico.

## Casos de uso

- Deteccion de caidas en wearables de muneca para personas mayores: el modelo clasifica rafagas de 3 segundos recibidas por BLE y distingue caidas criticas con inmovilidad de caidas leves con recuperacion, permitiendo escalar la alerta solo cuando procede.
- Reduccion de falsas alarmas en teleasistencia: la clase `WRIST_SHOCK_FALSE_ALERT` filtra golpes cotidianos (aplaudir, golpear una mesa) que en sistemas basados solo en umbral de aceleracion dispararian alertas innecesarias.
- Deteccion de manipulacion o retirada del dispositivo: la clase `DEVICE_DROP_OFF_WRIST` identifica cuando el wearable se ha desabrochado o caido a una superficie rigida, lo que permite notificar perdida de monitorizacion.
- Monitorizacion de actividad diaria (ADL): la clase `NORMAL_ADL` permite registrar patrones de marcha, sedestacion y transiciones posturales sin necesidad de procesamiento en la nube.
- Sistemas de alerta con conectividad BLE intermitente: el modelo mantiene un 93,60% de accuracy con un 10% de perdida de paquetes BLE y un 85,18% con un 25%, lo que lo hace viable en enlaces inalambricos degradados.
- Prototipado TinyML en ESP32-S3: al exportarse como cabecera C99 foldada, se integra en firmware sin runtime de ML, util para productos de bajo coste y bajo consumo.
- Investigacion en deteccion de caidas: la taxonomia de 5 clases y los resultados de estres con ruido y perdida de paquetes sirven como linea base reproducible para comparar nuevos clasificadores.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre split de test retenido (N = 4.500):

| Metrica | Valor |
|---|---|
| Accuracy | 98,38% |
| Macro F1 | 98,38% |
| Tasa de falsa alarma por shock en muneca | 0,11% |
| Tasa de falsa alarma por caida del dispositivo | 0,00% |
| Sensibilidad binaria a caidas (clases 3 y 4) | 99,33% |

Test de estres ante perdida de paquetes BLE y ruido de sensor:

| Escenario | Accuracy | Macro F1 |
|---|---|---|
| BLE limpio 10 Hz (0% perdida) | 98,38% | 98,38% |
| Perdida de paquetes BLE 10% | 93,60% | 93,62% |
| Perdida de paquetes BLE 25% | 85,18% | 85,28% |
| Perdida de paquetes BLE 40% | 75,16% | 75,40% |
| Ruido de sensor alto (2x) | 98,44% | 98,44% |

No se han publicado resultados comparativos con otros modelos de deteccion de caidas en la informacion disponible.

## Requisitos de hardware

- Inferencia en microcontrolador ESP32-S3; el modelo ocupa 21.300 bytes en Flash y requiere 58.368 MACs por inferencia, por lo que no necesita GPU ni acelerador dedicado.
- No aplica VRAM: el despliegue es sobre memoria interna del ESP32-S3 (Flash para pesos y RAM para activaciones).
- Cabe en cualquier ESP32-S3 con al menos ~21 KB de Flash libres para los pesos; el resto del firmware (BLE, drivers MPU6050) determina el consumo total.
- Despliegue mediante firmware C99 propietario del proyecto (`lumo_imu_ai.c` + `lumo_hub_cnn_model.h`); no se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este modelo.
- No se dispone de datos de latencia o throughput medidos; por el coste computacional (58.368 MACs) se espera una inferencia del orden de milisegundos en el ESP32-S3, pero no se confirma en la informacion disponible.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. Como referencia cualitativa, los clasificadores de deteccion de caidas basados en umbrales o en modelos clasicos (SVM, random forest) sobre caracteristicas manuales son las alternativas habituales, pero no se aportan datos de rendimiento de dichos sistemas en esta ficha.

| Modelo | Parametros | Contexto/entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LumoHub IMU Burst 1D-CNN | 5.325 | [30, 6] IMU | 98,38% accuracy (test propio) | MIT | Hugging Face |
| Alternativas de deteccion de caidas | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo de proposito especifico para IMU de muneca a 10 Hz; no es un modelo de lenguaje ni procesa texto, imagen o audio.
- Los resultados de benchmarks provienen del split de test del propio autor; no se dispone de validacion externa ni de replicacion independiente.
- El rendimiento cae de forma notable con perdida de paquetes BLE: 85,18% de accuracy al 25% de perdida y 75,16% al 40%, lo que puede ser insuficiente en enlaces muy degradados.
- La sensibilidad a caidas se ha medido agrupando las clases 3 y 4; no se detalla el rendimiento por clase individual ni la matriz de confusion completa.
- No se documentan sesgos demograficos, de complexion corporal o de patron de movimiento; la generalizacion a poblaciones distintas de la del dataset de entrenamiento es desconocida.
- No se detalla la composicion del dataset de entrenamiento, el numero de sujetos, ni si hubo separacion por sujeto entre train y test, lo que afecta a la estimacion real de generalizacion.
- Riesgo de confusion entre caidas leves con recuperacion y actividad normal si el patron de colapso postural es atipico; no se aportan datos al respecto.
- Licencia MIT: permite uso comercial, modificacion y redistribucion con atribucion; no se identifican restricciones adicionales en la informacion disponible.
- El modelo asume normalizacion concreta (+/-8g y +/-250 dps) y una frecuencia de muestreo de 10 Hz; desviaciones en el pipeline de sensores pueden degradar el rendimiento.

## Enlaces

- Hugging Face: https://huggingface.co/fragilov/lumohub-imu-burst-1dcnn
