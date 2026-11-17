# emass-ai/wisdm_locomotion_mlp_watch

## Resumen

`wisdm_locomotion_mlp_watch` es un clasificador de actividades de locomocion para relojes inteligentes desarrollado por emass-ai. No es un modelo de lenguaje: se trata de un perceptron multicapa (MLP) puro de cuatro capas lineales con activaciones ReLU que opera sobre 76 caracteristicas estadisticas y espectrales extraidas de una ventana de 128 muestras del acelerometro de tres ejes de un smartwatch (20 Hz, 6,4 segundos). Clasifica cinco actividades: caminar, trotar, subir escaleras, estar sentado y estar de pie.

El modelo es relevante por su orientacion a TinyML y a la computacion en el borde: con solo 20.357 parametros y 80,4 KB en coma flotante, se compila a int8 mediante ECS-Compiler (ECS-Studio 1.140.0) y se ejecuta integramente en la unidad DLA de una placa ECS-DoT, con un tiempo de inferencia medido de 1,06 ms y una libreria compilada de 45,1 KB. La extraccion de caracteristicas se realiza en el host o microcontrolador, y solo las capas Gemm se despliegan en el acelerador.

Su interes practico reside en que es un ejemplo verificado de extremo a extremo de un pipeline de despliegue TinyML: incluye el modelo ONNX, los conjuntos de calibracion y evaluacion, y resultados de validacion sobre hardware fisico con cuantizacion int8, lo que permite reproducir el flujo completo con la toolchain del fabricante. La precision top-1 reportada es del 83,43 % en evaluacion independiente del sujeto (sujetos no vistos en entrenamiento).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP: input [1,76] -> Linear(76->128) ReLU -> Linear(128->64) ReLU -> Linear(64->32) ReLU -> Linear(32->5) |
| Parametros totales | 20.357 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (ventana fija de 128 muestras a 20 Hz = 6,4 s) |
| Tipos de cuantizacion | int8 (calibracion incluida en `wisdm_locomotion_mlp_watch_train.npz`); pesos originales en float32 |
| Idiomas soportados | no aplica (modelo de clasificacion de sensores, no linguistico) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`wisdm_locomotion_mlp_watch.onnx`); compilado a libreria `libdla.a` para ECS-DoT |

## Arquitectura y entrenamiento

La arquitectura es un MLP de cuatro capas densas con ReLU entre ellas y salida de 5 clases, sin mecanismos de atencion ni recurrencia. La entrada no son senales crudas, sino 76 caracteristicas calculadas sobre una ventana de 128 muestras de los ejes x, y, z y la magnitud del acelerometro (en m/s²). El vector de caracteristicas incluye, por cada una de las cuatro senales: media, desviacion tipica, minimo, maximo, mediana, desviacion absoluta media, percentiles 25 y 75 (32 valores); cruces por cero de la senal sin media (4); media del valor absoluto de la primera diferencia (4); correlaciones de Pearson x-y, x-z e y-z (3); energia espectral de la rFFT por bandas de bins (32); y el bin de maxima energia del espectro de magnitud (1). Posteriormente se aplica una transformacion `v = sign(f)·log1p(|f|)` y un escalado `clip((v-mean)/std, -6, 6)` con media y desviacion proporcionadas en el repositorio.

El entrenamiento utiliza el WISDM Smartphone and Smartwatch Activity and Biometrics Dataset (acelerometro del reloj, UCI id 507, licencia CC BY 4.0), con una particion independiente del sujeto: sujetos 1600-1638 (39) para entrenamiento (20.456 ventanas) y 1639-1650 (12) para test (6.680 ventanas). No se documenta en la informacion disponible el uso de RLHF, DPO ni tecnicas de aumento de datos. La innovacion tecnica destacable no esta en el modelo en si, sino en el flujo de compilacion: las 7 capas se mapean a la DLA y el resultado se valida contra ONNX Runtime sobre hardware real.

## Capacidades

- Clasificacion de cinco actividades de locomocion a partir del acelerometro de un smartwatch: `walking`, `jogging`, `stairs`, `sitting`, `standing`.
- Inferencia en el borde sobre la DLA de ECS-DoT, con 7 capas en el acelerador y 0 en CPU.
- Cuantizacion int8 con calibracion reproducible mediante el conjunto de calibracion incluido.
- Generalizacion independiente del sujeto: el conjunto de test contiene sujetos no vistos en entrenamiento.
- Extraccion de caracteristicas estadisticas y espectrales (dominio de frecuencia mediante rFFT) calculada en host o MCU.
- No soporta tool calling, agentes, razonamiento multi-paso, vision, audio ni capacidades multilingues; es un clasificador de sensores puro.

## Casos de uso

- Monitorizacion de actividad en wearables: integrado en un smartwatch o pulsera, el modelo clasifica en tiempo real la actividad del usuario a partir de ventanas de 6,4 s del acelerometro, con 1,06 ms de inferencia por ventana en la DLA, lo que permite un consumo energetico muy bajo.
- Seguimiento de fitness y gasto calorico: la distincion entre caminar, trotar y subir escaleras permite estimar el tipo de esfuerzo y alimentar algoritmos de calculo de calorias o de carga de entrenamiento.
- Deteccion de sedentarismo: las clases `sitting` y `standing` permiten generar avisos de inactividad prolongada en aplicaciones de salud laboral o bienestar.
- Rehabilitacion y seguimiento clinico: el modelo puede registrar patrones de marcha y cambios posturales en pacientes, aprovechando que la evaluacion es independiente del sujeto, lo que reduce el sesgo por usuario.
- Validacion de toolchains TinyML: sirve como referencia reproducible para evaluar ECS-Compiler y la placa ECS-DoT, comparando la salida int8 del hardware con ONNX Runtime (coincidencia en 199 de 200 muestras).
- Investigacion en reconocimiento de actividades: al incluir el codigo de referencia de las caracteristicas y los conjuntos de calibracion y evaluacion, es util como linea base para comparar arquitecturas o tecnicas de extraccion de caracteristicas en WISDM.
- Prototipado de dispositivos de bajo consumo: con 45,1 KB de libreria compilada, encaja en microcontroladores con memoria muy limitada para pruebas de concepto de wearables.

## Benchmarks y rendimiento

| Metrica | Valor | Contexto |
|---|---|---|
| Precision top-1 (float, ONNX Runtime) | 83,43 % | Test independiente del sujeto, 6.680 ventanas |
| Precision top-1 (int8, placa ECS-DoT) | 79,00 % | Conjunto de evaluacion de 200 muestras |
| Precision top-1 (float, mismas 200 muestras) | 79,50 % | ONNX Runtime |
| Tiempo de inferencia | 1,06 ms | Mediana de 204 ejecuciones de `dla_infer()` en ECS-DoT a 50 MHz |
| Tamano de libreria compilada | 45,1 KB | `libdla.a`, 7 capas en DLA, 0 en CPU |
| Tamano del modelo en float | 80,4 KB | Pesos float32 |
| Coincidencia con ONNX Runtime | 199/200 muestras | Similitud coseno >= 0,9993 en las 3 muestras reales |

No se han publicado resultados comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- Inferencia objetivo en la placa ECS-DoT EVB (DLA a 50 MHz), no en GPU de escritorio.
- VRAM estimada para GPU: no aplica; el modelo ocupa 80,4 KB en float y 45,1 KB compilado, por lo que cabe en cualquier microcontrolador con esa memoria disponible.
- GPU recomendadas: no aplica para despliegue; para entrenamiento o evaluacion con ONNX Runtime basta CPU.
- Cabe en hardware consumer y en microcontroladores: el modelo esta disenado explicitamente para TinyML.
- Opciones de despliegue: ECS-Compiler (ECS-Studio 1.140.0 o posterior) para la placa ECS-DoT; ONNX Runtime para evaluacion en host.
- Latencia: 1,06 ms por inferencia en ECS-DoT a 50 MHz (mediana de 204 ejecuciones). Throughput no disponible.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la informacion proporcionada. Como referencia cualitativa, el modelo se situaria frente a otros clasificadores de actividad wearable (por ejemplo, CNN sobre senales crudas o modelos basados en arboles), pero no se han publicado resultados comparativos que permitan una tabla rigurosa.

| Modelo | Parametros | Contexto/entrada | Precision | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| wisdm_locomotion_mlp_watch | 20.357 | Ventana de 128 muestras (6,4 s) | 83,43 % top-1 | Apache 2.0 | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El propio autor indica que el modelo se proporciona para evaluar y validar ECS-Compiler y la placa ECS-DoT; no es un producto y no ha sido probado para un uso final concreto.
- La precision cae del 83,43 % (float) al 79,00 % (int8) en el conjunto de 200 muestras, una perdida de aproximadamente 4,4 puntos porcentuales por cuantizacion.
- Solo cubre cinco actividades y depende de un protocolo de captura muy especifico (20 Hz, ventana de 128 muestras, acelerometro de muneca); cambios en la frecuencia de muestreo, la colocacion del sensor o el dispositivo pueden degradar el rendimiento.
- La evaluacion independiente del sujeto se limita a 12 sujetos de test del dataset WISDM; la generalizacion a poblaciones, dispositivos o condiciones de uso distintas no esta validada.
- Riesgo de confusion entre clases posturales estaticas (`sitting` frente a `standing`) y entre intensidades de marcha, no cuantificado en la informacion disponible.
- La extraccion de caracteristicas debe replicarse exactamente (orden, transformacion logaritmica y normalizacion con media y desviacion concretas); cualquier desviacion invalida la calibracion int8.
- Licencia Apache 2.0 para el modelo; los datos de entrenamiento conservan su propia licencia (CC BY 4.0), que debe respetarse en caso de redistribucion.
- No se documentan sesgos demograficos del dataset ni analisis de equidad por edad, sexo o complexion fisica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/emass-ai/wisdm_locomotion_mlp_watch
- Modelo ONNX: https://huggingface.co/emass-ai/wisdm_locomotion_mlp_watch/resolve/main/wisdm_locomotion_mlp_watch.onnx?download=true
- Conjunto de calibracion: https://huggingface.co/emass-ai/wisdm_locomotion_mlp_watch/resolve/main/wisdm_locomotion_mlp_watch_train.npz?download=true
- Conjunto de evaluacion: https://huggingface.co/emass-ai/wisdm_locomotion_mlp_watch/resolve/main/wisdm_locomotion_mlp_watch_test.npz?download=true
- Muestras reales ejecutadas en placa: https://huggingface.co/emass-ai/wisdm_locomotion_mlp_watch/resolve/main/sample_input.npz?download=true
- Licencia: https://huggingface.co/emass-ai/wisdm_locomotion_mlp_watch/resolve/main/LICENSE?download=true
- Dataset WISDM (UCI id 507): https://archive.ics.uci.edu/dataset/507/wisdm+smartphone+and+smartwatch+activity+and+biometrics+dataset
- DOI del dataset: https://doi.org/10.24432/C5HK59
