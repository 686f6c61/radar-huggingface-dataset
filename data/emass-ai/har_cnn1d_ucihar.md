# emass-ai/har_cnn1d_ucihar

## Resumen

`har_cnn1d_ucihar` es una red neuronal convolucional unidimensional (1D-CNN) de muy pequeno tamano (15.670 parametros, 62,4 KB en coma flotante) desarrollada por emass-ai para reconocer seis actividades humanas (caminar, subir escaleras, bajar escaleras, sentado, de pie y tumbado) a partir de las senales inerciales de 9 canales de un telefono movil. El modelo opera sobre ventanas de 128 muestras a 50 Hz (2,56 s con 50 % de solapamiento) procedentes del dataset publico UCI HAR (Human Activity Recognition Using Smartphones) y esta pensado para su despliegue en microcontroladores y aceleradores de aprendizaje profundo de muy bajo consumo.

El modelo se distribuye como un unico fichero ONNX acompanado de los conjuntos de calibracion y evaluacion, y esta preparado para compilarse con ECS-Compiler (la pipeline de IA de ECS-Studio) y ejecutarse en la placa ECS-DoT EVB con su acelerador DLA. Segun la model card, la version int8 compilada alcanza una latencia de 1,81 ms por inferencia y ocupa 40,4 KB de libreria, con una precision identica a la del modelo en coma flotante sobre el conjunto de evaluacion de 200 muestras (95,50 %).

Su relevancia no reside en el rendimiento bruto (es un clasificador de series temporales de dominio muy acotado), sino en que constituye un ejemplo verificado de extremo a extremo del flujo TinyML: entrenamiento, cuantizacion int8, compilacion para un acelerador concreto y validacion en hardware fisico con coincidencia exacta entre la salida de la placa y ONNX Runtime. Es, por tanto, una referencia util para quien disena pipelines de inferencia embebida, no un modelo de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN 1D: entrada [1,9,1,128] -> Conv(9->16, k=(1,5), s=(1,2)) + BN + ReLU -> Conv(16->32, k=(1,5), s=2) + BN + ReLU -> Conv(32->48, k=(1,5), s=2) + BN + ReLU -> Flatten(768) -> Linear(768->6) |
| Parametros totales | 15.670 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; ventana fija de 128 muestras temporales (9 canales) |
| Tipos de cuantizacion | int8 (cuantizacion para el DLA de la ECS-DoT EVB); pesos en float32 en el ONNX original |
| Idiomas soportados | no disponible (modelo de clasificacion de series temporales, sin componente de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (mas ficheros NPZ de calibracion y evaluacion); libreria compilada `libdla.a` para la placa |

## Arquitectura y entrenamiento

La arquitectura es una CNN 1D puramente convolucional y de complejidad muy baja: tres bloques Conv-BN-ReLU con stride 2 en el eje temporal, que reducen la dimension de 128 a 16 pasos, seguidos de un aplanado a 768 caracteristicas y una capa lineal que proyecta a las 6 clases. Los filtros se entrenan con estandarizacion de pesos (zero-mean / weight-standardised), una tecnica que facilita la cuantizacion int8 posterior al mantener las activaciones y los pesos en rangos controlados. La salida es un vector de 6 logits; el softmax se aplica opcionalmente en CPU.

El entrenamiento utiliza el split oficial subject-wise de UCI HAR: 7.352 ventanas de entrenamiento de 21 sujetos y 2.947 ventanas de test de 9 sujetos, con preprocesado fijo (acelerometro en g, giroscopio en rad/s, filtrado paso bajo previo) y normalizacion por canal con medias y desviaciones tipicas calculadas sobre el conjunto de entrenamiento. No se documenta en la informacion disponible el uso de RLHF, DPO ni tecnicas de aumento de datos; la model card se limita a describir la compilacion con ECS-Compiler 0.6.0 (ECS-Studio 1.140.0) y la verificacion en placa con huella de build `55b14550ba2e`.

## Capacidades

- Clasificacion de actividades humanas en 6 clases a partir de 9 canales inerciales (aceleracion corporal xyz, giroscopio corporal xyz y aceleracion total xyz) sobre ventanas de 128 muestras a 50 Hz.
- Inferencia en hardware embebido: el modelo compilado ejecuta las 7 capas en el DLA de la ECS-DoT EVB (0 capas en CPU).
- Cuantizacion int8 con calibracion sobre un conjunto de entrenamiento dedicado, manteniendo la precision del modelo float (95,50 % en ambas variantes sobre las 200 muestras de evaluacion).
- Reproducibilidad verificada: la salida de la placa coincide con ONNX Runtime en 200 de 200 muestras, con similitud coseno igual o superior a 0,9990 en las muestras reales ejecutadas.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision, tool calling, capacidades de agente ni soporte multilingue.

## Casos de uso

- Monitorizacion de actividad fisica en wearables: el modelo clasifica ventanas de 2,56 s de senales IMU de un telefono o pulsera, lo que permite contar pasos, detectar cambios de postura y estimar el tiempo dedicado a cada actividad con una latencia de 1,81 ms por ventana en la ECS-DoT EVB.
- Deteccion de caidas y posturas de riesgo en personas mayores: la clase `LAYING` junto con la secuencia de transiciones permite identificar tumbamientos prolongados; la ventana corta y la baja latencia hacen viable un bucle de inferencia continuo en un dispositivo alimentado por bateria.
- Clasificacion de actividades en dispositivos portatiles de bajo consumo: al ocupar 40,4 KB de libreria compilada y 62,4 KB en float, el modelo cabe en microcontroladores con memoria limitada y evita enviar las senales crudas a la nube.
- Etiquetado automatico de datos IMU para investigacion: el modelo sirve como anotador preliminar de grandes grabaciones de acelerometro y giroscopio, reduciendo el coste del etiquetado manual previo a estudios de comportamiento.
- Validacion de pipelines TinyML: es un banco de pruebas reproducible para verificar que la cadena ONNX -> cuantizacion int8 -> compilacion DLA -> placa produce resultados equivalentes al modelo float, util para equipos que evaluan ECS-Compiler o aceleradores similares.
- Control contextual en interfaces adaptativas: reconocer si el usuario camina, esta sentado o de pie permite ajustar el comportamiento de una aplicacion movil (por ejemplo, cambiar el modo de notificaciones o la frecuencia de muestreo de sensores) sin coste de computo apreciable.
- Prototipado de sistemas de rehabilitacion: la distincion entre subir y bajar escaleras frente a caminar en llano aporta informacion granular sobre el esfuerzo locomotor que puede registrarse de forma continua en sesiones de seguimiento.

## Benchmarks y rendimiento

| Metrica | Valor | Condiciones |
|---|---|---|
| Precision top-1 en UCI HAR (split oficial) | 93,59 % | Modelo float, ONNX Runtime, 2.947 ventanas de test de 9 sujetos |
| Precision en conjunto de evaluacion de 200 muestras | 95,50 % (int8 en placa) frente a 95,50 % (float) | ECS-DoT EVB, DLA |
| Coincidencia placa vs ONNX Runtime | 200 de 200 muestras | ECS-DoT EVB |
| Similitud coseno en muestras reales | >= 0,9990 | 3 muestras ejecutadas en placa |
| Tiempo de inferencia | 1,81 ms | int8, ECS-DoT a 50 MHz, mediana de 204 ejecuciones de `dla_infer()` |
| Tamano de libreria compilada | 40,4 KB (`libdla.a`) | 7 capas en DLA, 0 en CPU |
| Tamano del modelo float | 62,4 KB | ONNX |

No se han publicado en la informacion disponible comparaciones con otros modelos sobre el mismo dataset.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el sentido convencional; el modelo float ocupa 62,4 KB y la libreria compilada int8 40,4 KB, por lo que cabe en la memoria interna de un microcontrolador.
- GPU recomendadas: ninguna; el destino es el acelerador DLA de la ECS-DoT EVB. Para ejecucion en servidor basta CPU con ONNX Runtime.
- Cabe en GPU consumer: si, trivialmente, aunque no es su proposito; cualquier GPU moderna ejecutaria el modelo con latencias despreciables.
- Opciones de despliegue: ONNX Runtime (referencia float), ECS-Compiler / ECS-Studio 1.140.0 o superior para compilar a la ECS-DoT EVB, y cualquier runtime compatible con ONNX para validacion en CPU.
- Latencia y throughput: 1,81 ms por inferencia en la ECS-DoT EVB a 50 MHz (mediana de 204 ejecuciones). No se documenta throughput en otras plataformas.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Precision (UCI HAR) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `har_cnn1d_ucihar` (emass-ai) | 15.670 | 9 x 128, 50 Hz | 93,59 % (float, split oficial) | Apache 2.0 | ONNX + NPZ en Hugging Face |
| Modelos clasicos sobre caracteristicas UCI HAR (SVM, random forest) | no disponible | 561 caracteristicas precalculadas | no disponible en esta ficha | variable | amplia, implementaciones multiples |
| Redes profundas genericas para HAR (CNN/LSTM sobre IMU) | no disponible | ventanas IMU variables | no disponible en esta ficha | variable | variable |

No se dispone en la informacion proporcionada de resultados comparativos con alternativas concretas sobre el mismo split, por lo que la comparativa se limita a categorias de enfoque y no a cifras verificadas.

## Limitaciones y advertencias

- Dominio muy acotado: solo reconoce 6 actividades de UCI HAR con el preprocesado exacto del dataset (50 Hz, ventanas de 128 muestras, filtrado paso bajo previo, normalizacion por canal con medias y desviaciones concretas). Cambios en la colocacion del sensor, en la frecuencia de muestreo o en el filtrado degradaran la precision.
- No es un producto: la model card indica explicitamente que se proporciona para evaluar y validar ECS-Compiler y la ECS-DoT, y que no ha sido probado para ningun uso final concreto.
- Dependencia de hardware: la version verificada esta compilada para el DLA de la ECS-DoT EVB con ECS-Studio 1.140.0 y ECS-Compiler 0.6.0; reproducir el resultado requiere mantener la configuracion por defecto y la huella de build indicada.
- Riesgo de confusion entre clases cineticamente similares (por ejemplo, `SITTING` frente a `STANDING`, o `WALKING` frente a `WALKING_UPSTAIRS`), inherente a la ventana corta y a la ambiguedad de las senales inerciales.
- Sesgos demograficos y de dispositivo: el dataset UCI HAR procede de 30 sujetos voluntarios con un telefono concreto colocado en la cintura; el modelo puede generalizar peor a otras poblaciones, morfologias, dispositivos o posiciones del sensor.
- Sin capacidades de lenguaje, vision ni razonamiento: no debe emplearse en tareas de NLP, generacion de codigo o agentes.
- Licencia: el modelo se distribuye bajo Apache 2.0, pero los datos de entrenamiento conservan su propia licencia (CC BY 4.0), que debe respetarse en cualquier redistribucion o uso derivado.
- Alucinacion: no aplica en el sentido de generacion de texto, pero existe el riesgo equivalente de predicciones erroneas con alta confianza en ventanas ambiguas o fuera de distribucion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/emass-ai/har_cnn1d_ucihar
- ONNX del modelo: https://huggingface.co/emass-ai/har_cnn1d_ucihar/resolve/main/har_cnn1d_ucihar.onnx?download=true
- Conjunto de calibracion: https://huggingface.co/emass-ai/har_cnn1d_ucihar/resolve/main/har_cnn1d_ucihar_train.npz?download=true
- Conjunto de evaluacion: https://huggingface.co/emass-ai/har_cnn1d_ucihar/resolve/main/har_cnn1d_ucihar_test.npz?download=true
- Muestras reales ejecutadas en placa: https://huggingface.co/emass-ai/har_cnn1d_ucihar/resolve/main/sample_input.npz?download=true
- Licencia: https://huggingface.co/emass-ai/har_cnn1d_ucihar/resolve/main/LICENSE?download=true
- Dataset UCI HAR (UCI ML Repository id 240): https://archive.ics.uci.edu/dataset/240/human+activity+recognition+using+smartphones
- Referencia bibliografica del dataset: Anguita, D., Ghio, A., Oneto, L., Parra, X., Reyes-Ortiz, J.L. (2013). A Public Domain Dataset for Human Activity Recognition Using Smartphones. ESANN 2013, Brujas, Belgica.
