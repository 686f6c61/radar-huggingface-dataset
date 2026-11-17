# emass-ai/hand_gesture_kp

## Resumen

`emass-ai/hand_gesture_kp` es un clasificador de gestos de mano de muy pequeno tamano (TinyML) desarrollado por emass-ai. A partir de los 21 puntos clave (keypoints) que devuelve un detector de manos como MediaPipe Hands, el modelo clasifica la postura en una de tres clases: mano abierta (`Open`), puno cerrado (`Close`) y dedo apuntando (`Pointer`). No es un modelo de lenguaje ni un modelo generativo: es una red neuronal densa (MLP) de 1.103 parametros que resuelve una tarea de clasificacion tabular sobre coordenadas 2D.

El modelo esta pensado como referencia de validacion para la cadena de herramientas de emass-ai: se compila con ECS-Compiler dentro de ECS-Studio 1.140.0 y se ejecuta en la placa ECS-DoT EVB, una plataforma de inferencia en el borde con acelerador DLA. El resultado publicado esta verificado fisicamente en hardware, con una latencia de inferencia medida de 711 microsegundos y una huella de libreria compilada de 25,6 KB en int8.

Su relevancia es acotada pero concreta: demuestra un flujo completo de cuantizacion int8, despliegue en microcontrolador y paridad numerica entre ONNX Runtime y el acelerador, con un modelo de 5,6 KB en float que alcanza un 96,63% de accuracy top-1 en el conjunto de test del dataset de referencia. No es un modelo para produccion general, sino una pieza de evaluacion de la plataforma ECS.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP: Linear 42→20 → ReLU → Linear 20→10 → ReLU → Linear 10→3 → Softmax |
| Parametros totales | 1.103 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada fija de 42 valores float32) |
| Tipos de cuantizacion | int8 (compilacion para DLA); pesos float en ONNX |
| Idiomas soportados | no aplica (no procesa texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`keypoint_classifier.onnx`); conjuntos de calibracion y evaluacion en NPZ |

## Arquitectura y entrenamiento

La red es un perceptron multicapa completamente conectado con dos capas ocultas de 20 y 10 neuronas y una capa de salida de 3 neuronas con activacion softmax. La entrada `input_1` tiene forma `[1, 42]` en float32: 21 keypoints de mano con sus coordenadas (x, y). El preprocesado consiste en expresar las coordenadas relativas a la muneca (keypoint 0), aplanarlas y dividirlas por el mayor valor absoluto para que queden en el rango −1 a 1. La salida `Identity` es un vector `[1, 3]` con las probabilidades de las clases `Open`, `Close` y `Pointer`.

El entrenamiento se realizo sobre el dataset de keypoints del proyecto `hand-gesture-recognition-mediapipe` de kinivi (licencia Apache-2.0). No se detalla en la informacion disponible el numero de tokens ni de muestras de entrenamiento, ni si se aplicaron tecnicas de regularizacion o aumento de datos. La innovacion tecnica destacable no esta en la arquitectura, sino en el pipeline de despliegue: compilacion con ECS-Compiler (motor 0.6.0) que reparte 5 capas en el acelerador DLA y 1 en la CPU, cuantizacion int8 usando el conjunto `keypoint_classifier_train.npz`, y verificacion de paridad numerica contra ONNX Runtime con similitud coseno igual o superior a 0,9999 en las muestras reales.

## Capacidades

- Clasificacion de gestos de mano en tres clases discretas: mano abierta, puno cerrado y dedo apuntando.
- Consumo de keypoints 2D de 21 puntos por mano, tipicamente producidos por MediaPipe Hands u otro detector de landmarks.
- Inferencia en microcontrolador con cuantizacion int8 y aceleracion parcial en DLA.
- No soporta generacion de texto, razonamiento, codigo, matematicas, vision directa sobre imagenes, tool calling, agentes, capacidades multilingues ni modo thinking.
- No procesa audio ni video: solo recibe el vector de coordenadas ya extraido por un detector externo.

## Casos de uso

- Control por gestos en dispositivos embebidos: integrar el modelo en un microcontrolador junto a un detector de landmarks para activar funciones (por ejemplo, abrir una aplicacion con la mano abierta) sin depender de la nube, gracias a su huella de 25,6 KB y 711 µs de latencia.
- Validacion de la cadena ECS-Compiler: usar el modelo como caso de prueba reproducible para verificar que la cuantizacion int8 y el reparto DLA/CPU producen la misma prediccion que ONNX Runtime antes de desplegar modelos propios.
- Interfaces de accesibilidad: traduccion de gestos basicos a comandos de sistema (confirmar, cancelar, senalar) en entornos de bajo consumo energetico.
- Robotica educativa y prototipado: comandos discretos para brazos o vehiculos didacticos a partir de gestos reconocidos en la placa ECS-DoT EVB.
- Pruebas de regresion de hardware: comparar la salida de la placa con la referencia float en cada nueva version del compilador usando el conjunto de evaluacion de 200 muestras.
- Demostraciones de TinyML: ejemplo docente de un pipeline completo de entrenamiento, cuantizacion y despliegue en un acelerador de borde con medicion de latencia real.
- Preprocesado en sistemas de interaccion hombre-maquina: filtro rapido de gestos antes de enviar senales a un modelo mayor en un dispositivo con mas recursos.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Accuracy top-1 (float, ONNX Runtime) | 96,63% en split de test retenido (889 muestras) |
| Accuracy top-1 (int8, placa ECS-DoT EVB) | 99,50% en conjunto de evaluacion de 200 muestras |
| Accuracy top-1 (float, mismas 200 muestras) | 99,50% |
| Coincidencia con ONNX Runtime en placa | 200 de 200 muestras |
| Similitud coseno en muestras reales | ≥ 0,9999 |
| Tiempo de inferencia en placa | 711 µs (mediana de 204 ejecuciones, ECS-DoT a 50 MHz) |
| Tamano de libreria compilada (`libdla.a`) | 25,6 KB |
| Tamano del modelo float | 5,6 KB |

No se han publicado comparaciones con otros modelos de clasificacion de gestos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo esta disenado para ejecutarse en microcontrolador, no en GPU.
- GPU recomendadas: no aplica. El destino es la placa ECS-DoT EVB con acelerador DLA a 50 MHz.
- Cabe en GPU de consumo: si, pero es irrelevante; el modelo ocupa 5,6 KB en float y 25,6 KB como libreria compilada int8.
- Opciones de despliegue: ECS-Compiler dentro de ECS-Studio 1.140.0 o superior (flujo oficial verificado); ONNX Runtime para ejecucion float en host; no se documentan soportes para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: 711 µs por llamada a `dla_infer()` en la ECS-DoT EVB; el throughput no se especifica, pero a partir de la latencia mediana se situa en torno a 1.400 inferencias por segundo en el peor caso teorico, sin contabilizar el preprocesado de keypoints.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Clases | Licencia | Despliegue verificado |
|---|---|---|---|---|---|
| emass-ai/hand_gesture_kp | 1.103 | 21 keypoints (42 valores) | 3 | Apache-2.0 | ECS-DoT EVB (int8) |
| Clasificador de referencia de hand-gesture-recognition-mediapipe | no disponible | 21 keypoints (42 valores) | configurable | Apache-2.0 | PC (Python/TF Lite) |
| Otros clasificadores TinyML de gestos | no disponible | variable | variable | variable | no disponible |

La informacion disponible no permite una comparacion cuantitativa con alternativas equivalentes; solo se conoce el modelo de referencia del proyecto del que procede el dataset.

## Limitaciones y advertencias

- El propio autor indica que el modelo se proporciona para evaluar y validar ECS-Compiler y la ECS-DoT, que no es un producto y que no se ha probado para un uso final concreto.
- Solo distingue tres clases (`Open`, `Close`, `Pointer`); cualquier otro gesto se forzara a una de ellas.
- Depende por completo de la calidad del detector de keypoints externo: errores en los 21 puntos se propagan directamente a la clasificacion.
- La accuracy de 96,63% corresponde al split de test del dataset de origen; no hay garantia de generalizacion a otras camaras, condiciones de iluminacion, morfologias de mano o poblaciones no representadas.
- El resultado int8 de 99,50% se mide sobre solo 200 muestras, por lo que la comparacion con el 96,63% del test completo no es directamente equivalente.
- Riesgo de sesgo por la composicion del dataset de entrenamiento, no documentada en la informacion disponible.
- La licencia Apache-2.0 permite uso comercial del modelo, pero el dataset de origen mantiene su propia licencia Apache-2.0 y debe respetarse por separado.
- No hay informacion sobre calibracion de confianza ni sobre comportamiento ante entradas fuera de distribucion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/emass-ai/hand_gesture_kp
- Modelo ONNX: https://huggingface.co/emass-ai/hand_gesture_kp/resolve/main/keypoint_classifier.onnx?download=true
- Conjunto de calibracion: https://huggingface.co/emass-ai/hand_gesture_kp/resolve/main/keypoint_classifier_train.npz?download=true
- Conjunto de evaluacion: https://huggingface.co/emass-ai/hand_gesture_kp/resolve/main/keypoint_classifier_test.npz?download=true
- Muestras reales ejecutadas en placa: https://huggingface.co/emass-ai/hand_gesture_kp/resolve/main/sample_input.npz?download=true
- Licencia: https://huggingface.co/emass-ai/hand_gesture_kp/resolve/main/LICENSE?download=true
- Dataset y proyecto de origen: https://github.com/kinivi/hand-gesture-recognition-mediapipe
