# LamportRobotics/imago-pack-can

## Resumen

LamportRobotics/imago-pack-can es un paquete de dos redes neuronales pequenas que resuelven una tarea de manipulacion robotica concreta: introducir una lata en un contenedor (tote) usando el brazo derecho del humanoide Imago, en simulacion, a partir de la propia camara del robot. El modelo lo desarrolla LamportRobotics y se publica bajo licencia Apache 2.0. No es un modelo de lenguaje ni un modelo fundacional: es una politica de control entrenada por clonacion de comportamiento (behavior cloning) sobre demostraciones generadas por un controlador scriptado.

La arquitectura se divide en dos modulos complementarios. El primero, `pack_can.onnx`, es la politica de actuacion ("la mano"): un perceptron multicapa de 3 capas de 512 neuronas que recibe la posicion de 14 articulaciones y la posicion de la lata en el mundo, y emite los siguientes 25 objetivos articulares. El segundo, `eye.onnx`, es el modulo de percepcion ("el ojo"): una red convolucional de 4 capas con keypoints de soft-argmax espacial seguida de un MLP que estima la posicion 3D de la lata a partir de una imagen RGB de 128x128 y del estado articular.

Su relevancia es acotada pero clara para quien investiga en robotica de simulacion: demuestra que separar percepcion y control (mirar una vez al inicio, ejecutar la politica sobre esa estimacion) supera a aprender directamente de pixeles a acciones sobre los mismos datos (99/100 frente a 36/100 en la tarea). Todo el material es autocontenido en ONNX con la normalizacion embebida, lo que permite ejecutarlo en `onnxruntime` sin dependencias adicionales. No hay pesos de lenguaje, contexto de tokens ni capacidades generativas: las fichas de especificaciones se adaptan a esa realidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dos redes: MLP 3x512 (politica `pack_can`) y CNN de 4 capas + soft-argmax espacial + MLP (percepcion `eye`) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; horizonte de accion de 25 pasos a 20 ms) |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX flotante y checkpoints PyTorch) |
| Idiomas soportados | no aplica (modelo de robotica, sin entrada/salida de texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`pack_can.onnx`, `eye.onnx`) y PyTorch (`pack_can.pt`, `eye.pt`) |

Especificaciones adicionales de las entradas y salidas:

| Modulo | Entrada | Salida | Frecuencia |
|---|---|---|---|
| `pack_can` (mano) | `obs` [B, 17]: 14 posiciones articulares (rad) + x, y, z de la lata (m, marco mundial) | `targets` [B, 25, 14]: objetivos articulares (rad) separados 20 ms | 50 Hz (se ejecutan los 10 primeros de cada chunk y se vuelve a consultar) |
| `eye` (ojo) | `image` [B, 128, 128, 3] RGB 0..255 + `state` [B, 14] posiciones articulares (rad) | `can_xyz` [B, 3]: posicion de la lata (m, marco mundial) | una sola vez al inicio de la tarea |

Articulaciones (en orden): waist_yaw, right_shoulder_pitch, right_shoulder_roll, right_shoulder_yaw, right_elbow, right_wrist_roll, right_wrist_flex, right_wrist_dev, right_index, right_middle, right_ring, right_little, right_thumb_swing, right_thumb.

## Arquitectura y entrenamiento

La politica `pack_can` es un MLP de tres capas de 512 neuronas que mapea un vector de 17 dimensiones (estado articular mas posicion de la lata) a un chunk de 25 objetivos articulares. En ejecucion se aplica control por chunks: se ejecutan los 10 primeros objetivos a 50 Hz y se vuelve a consultar la red, lo que reduce la acumulacion de error y estabiliza la accion. La normalizacion esta embebida dentro del grafo ONNX, de modo que la entrada y la salida son directamente las magnitudes fisicas (radianes y metros).

El modulo `eye` es una red convolucional de cuatro capas que procesa la imagen de la camara del visor a 128x128 RGB y extrae keypoints mediante soft-argmax espacial; esos keypoints se combinan con el estado articular de 14 dimensiones (necesario porque la camara gira con la cintura) en un MLP que regresa la posicion 3D de la lata en el marco mundial. El entrenamiento es clonacion de comportamiento supervisada sobre demostraciones scriptadas: 980 demostraciones para la mano y 980 para el ojo. El autor indica que se probo primero a aprender objetivos directamente desde pixeles sobre los mismos datos, con un resultado de 36/100 latas empaquetadas, frente a 99/100 con la separacion percepcion-control finalmente publicada. El modelo opera exclusivamente en simulacion (MuJoCo); no se ha ejecutado en hardware.

## Capacidades

- Control de manipulacion de un brazo humanoide de 7 grados de libertad mas mano de cinco dedos (6 articulaciones) para la tarea de introducir una lata en un contenedor.
- Percepcion visual monocular: estimacion de la posicion 3D de un objeto (lata) a partir de una imagen RGB de 128x128 y del estado articular.
- Generacion de trayectorias articulares en chunks de 25 pasos con ejecucion a 50 Hz.
- Inferencia autocontenida en `onnxruntime` (normalizacion incluida en el grafo, sin preprocesado externo).
- No soporta tool calling ni function calling (no es un modelo de lenguaje).
- No soporta agentes ni razonamiento multi-paso en el sentido de los LLM; su "razonamiento" es la politica de control.
- Sin capacidades multilingues, de vision general, audio ni thinking mode.
- Especifica a la tarea y al robot: no generaliza a otros objetos, otras tareas ni otras morfologias sin reentrenamiento.

## Casos de uso

- Investigacion en clonacion de comportamiento: usar el par de redes como linea base reproducible para comparar estrategias de separacion percepcion-control frente a politicas end-to-end desde pixeles, con los mismos datos y el mismo simulador.
- Prototipado de pipelines de manipulacion en MuJoCo: integrar `eye.onnx` y `pack_can.onnx` en un bucle de simulacion para validar la cadena percepcion-planificacion-ejecucion antes de disenar un sistema propio.
- Estudio de control por chunks: emplear el esquema de ejecutar 10 de 25 objetivos a 50 Hz como referencia para analizar latencia, suavidad y robustez en politicas de imitacion.
- Benchmark de estimacion de pose de objeto: utilizar `eye.onnx` como modulo de regresion de posicion 3D con error conocido (0,8/1,5/0,6 mm en x/y/z sobre imagenes no vistas) para comparar con otros estimadores monoculares.
- Docencia en robotica: demostrar el ciclo completo de una tarea pick-and-place con un humanoide simulado de 1,50 m y 48 kg, con material autocontenido y ligero (repo de 0,0 GB).
- Despliegue en entornos de inferencia ONNX: validar latencia y portabilidad de redes pequenas en `onnxruntime` en CPU o GPU antes de trasladar el diseno a un robot real.
- Base para transferencia sim-a-real: partir de estas politicas para estudiar tecnicas de domain randomization o adaptacion antes de intentar llevarlas a hardware, dado que el autor confirma que nada se ha ejecutado fuera de simulacion.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre latas no vistas durante el entrenamiento:

| Configuracion | Ensayos | Experto (scriptado) | Politica |
|---|---|---|---|
| Mano, con posicion de la lata conocida | 100 | 99 | 100 |
| Ojo + mano, desde la camara | 100 | 99 | 99 |

Error del modulo `eye` en imagenes reservadas: 0,8 / 1,5 / 0,6 mm en x / y / z. Entrenamiento: 980 demostraciones para la mano y 980 para el ojo. No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K u otros) porque el modelo no es de lenguaje ni de codigo.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; no disponible el dato exacto, pero al tratarse de un MLP 3x512 y una CNN de 4 capas sobre 128x128, el consumo es del orden de decenas de MB, apto para CPU.
- GPU recomendadas: no se especifican; cualquier GPU consumer moderna (por ejemplo, RTX 3060 o superior) es sobrada, y la CPU es suficiente para la frecuencia de 50 Hz.
- Cabe en cualquier GPU consumer y en CPU; no requiere aceleradores de datacenter (A100, H100) para inferencia.
- Opciones de despliegue: `onnxruntime` (formato nativo de los pesos), y PyTorch para los checkpoints `.pt`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles de forma explicita; el diseno asume ejecucion a 50 Hz de la politica con reevaluacion cada 10 pasos (200 ms) y una unica inferencia del modulo visual al inicio de la tarea.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. Se puede senalar, a modo de referencia cualitativa, que la comparacion interna del autor es consigo mismo: politica end-to-end desde pixeles (36/100) frente a la separacion percepcion-control publicada (99/100). No hay datos de otros modelos de robotica (RT-1, RT-2, Diffusion Policy, ACT, etc.) en la informacion disponible, por lo que no se ofrece tabla comparativa con cifras.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LamportRobotics/imago-pack-can | no disponible | no aplica | 99/100 en tarea de empaquetado (simulacion) | Apache 2.0 | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Especifico de tarea y de robot: solo empaqueta latas con el brazo derecho del humanoide Imago en MuJoCo; no generaliza a otros objetos, tareas, morfologias ni escenas sin reentrenamiento.
- Solo simulacion: el autor declara explicitamente que nada se ha ejecutado en hardware; no hay evidencia de transferencia sim-a-real.
- Dependencia de la camara y del estado articular: el modulo `eye` necesita las posiciones articulares porque la camara gira con la cintura; un cambio de calibracion o de montaje invalida la politica.
- Error de percepcion acotado pero no nulo: 0,8/1,5/0,6 mm en x/y/z sobre imagenes reservadas; el fallo de estimacion puede propagarse a la ejecucion.
- Riesgo de alucinacion en el sentido de los LLM: no aplica, pero existe riesgo de acciones incorrectas fuera de la distribucion de entrenamiento (latas en posiciones no vistas, oclusiones, cambios de iluminacion).
- Sesgos conocidos: no documentados por el autor; el sesgo principal es el de las demostraciones scriptadas, que definen el estilo y los limites de la politica.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificacion con atribucion; conviene revisar los terminos de los datasets asociados (`imago_pack_can_1k`, `imago_pack_can_cam`, `imago_pack_can`) antes de reutilizar datos.
- Caveat de produccion: el repo tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion externa; el tamano reportado es 0,0 GB, lo que sugiere pesos muy pequenos pero sin confirmacion de integridad de los ficheros.
- Idiomas: no aplica; no hay procesamiento de lenguaje natural.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LamportRobotics/imago-pack-can
- Dataset `LamportRobotics/imago_pack_can_1k`: https://huggingface.co/datasets/LamportRobotics/imago_pack_can_1k
- Dataset `LamportRobotics/imago_pack_can_cam`: https://huggingface.co/datasets/LamportRobotics/imago_pack_can_cam
- Dataset `LamportRobotics/imago_pack_can`: https://huggingface.co/datasets/LamportRobotics/imago_pack_can
- Perfil del autor: https://huggingface.co/LamportRobotics
- Paper, blog o repositorio adicional: no disponible en la informacion proporcionada.
