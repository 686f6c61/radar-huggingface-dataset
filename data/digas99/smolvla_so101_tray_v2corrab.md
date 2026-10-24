# digas99/smolvla_so101_tray_v2corrAB

## Resumen

`digas99/smolvla_so101_tray_v2corrAB` es un ajuste fino completo del modelo base `lerobot/smolvla_base` (SmolVLA, 450 millones de parametros) para controlar un brazo robotico LeRobot SO-101 en una tarea concreta de pick-and-place: mover objetos entre una mesa y una bandeja transparente, en ambas direcciones. Lo desarrolla Diogo Correia (usuario `digas99`) y se publica bajo licencia Apache-2.0 con pesos en safetensors dentro de la libreria LeRobot.

El modelo resuelve un problema muy especifico de robotica de imitacion: no es un modelo de lenguaje general, sino una politica visuo-lenguaje-accion (VLA) que recibe dos imagenes de camara a 640x480, el estado articular de 6 grados de libertad y una de dos cadenas de tarea fijas, y devuelve acciones articulares. Su interes tecnico esta en el regimen de entrenamiento: parte de un VLM con el backbone reducido a 16 capas, se ajusta por completo (VLM, codificador visual y experto de accion) durante 30.000 pasos con *flow matching*, y anade al conjunto de demostraciones todos los clips de correccion humana grabados hasta la fecha, incluidos casos en los que el objeto queda apoyado contra la pared lejana de la bandeja.

La relevancia ahora es metodologica: es un experimento controlado sobre como las intervenciones correctivas de un operador (que empiezan exactamente en el estado donde fallo una politica anterior y terminan en la suelta del objeto) mejoran una politica pequena que cabe en una unica GPU de 24 GB. El autor publica ademas el modelo de control `smolvla_so101_tray_v2corr` (solo correcciones mesa-bandera) para aislar el efecto de las correcciones en la direccion inversa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA tipo SmolVLA: backbone VLM (16 capas) + codificador visual + experto de accion, entrenado con *flow matching* |
| Parametros totales | 450.046.176 (segun safetensors) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el modelo no usa contexto textual largo; recibe una de dos cadenas de tarea fijas y un horizonte de acciones; la verificacion del autor evalua el primer paso y el paso 50 del chunk) |
| Tipos de cuantizacion | no disponible (el autor solo documenta bf16 con autocast y pesos maestros fp32 para el VLM durante el entrenamiento; no se publican pesos cuantizados) |
| Idiomas soportados | no disponible; no es un modelo linguistico general, solo interpreta dos instrucciones en ingles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (libreria `lerobot`); repositorio de 53,3 GB por los checkpoints intermedios |

## Arquitectura y entrenamiento

SmolVLA combina un backbone de modelo vision-lenguaje con un codificador de imagenes y un "experto de accion" que genera trayectorias articulares mediante *flow matching*; la perdida reportada es MSE de *flow matching*. En este ajuste se entrena todo: VLM, codificador visual y experto de accion, partiendo de `lerobot/smolvla_base` con el backbone reducido a 16 capas tal como viene en la configuracion base. La entrada son dos camaras (una superior fija y otra en la muneca del gripper) a 640x480, el estado articular de 6 DOF y una instruccion de tarea; los nombres de camara se remapean en entrenamiento (`observation.images.top -> camera1`, `observation.images.wrist -> camera2`) y la inferencia debe aplicar el mismo remapeo.

El entrenamiento son 30.000 pasos con batch 16 (unas 4,8 epocas sobre el conjunto), LR 5e-05 con decaimiento coseno, bf16 con autocast y pesos maestros fp32 para el VLM, aumentos de imagen por defecto de LeRobot, sobre una sola NVIDIA L4 de 24 GB a ~1,2 s por paso. El conjunto de datos es `digas99/so101_tray_train_v2corrAB`: unas 370 episodios y ~100.000 fotogramas a 30 fps, formato LeRobot v3.0, `robot_type: so_follower`. Incluye 135 episodios de demostracion mesa-bandera mas 73 clips de correccion, y 90 episodios bandera-mesa mas correcciones en ambas direcciones de la bandeja, incluidos clips especificos donde el objeto esta contra la pared lejana y el operador gira la muneca y lo aparta antes de agarrarlo. La politica es agnostica a la clase de objeto: nunca recibe el nombre del objeto, y cada demostracion empieza con el gripper a unos 10 cm sobre el objetivo (colocado por un segmentador externo en tiempo de ejecucion) y termina justo tras la suelta.

## Capacidades

- Generacion de acciones articulares de 6 DOF para un brazo SO-101 a partir de dos vistas de camara y estado de las articulaciones.
- Ejecucion de dos tareas de pick-and-place en ambas direcciones: "Pick up the object and put it in the tray" y "Pick up the object from the tray and put it on the table".
- Manipulacion agnostica a la clase: no requiere etiqueta de objeto, solo la posicion inicial del gripper sobre el objetivo.
- Recuperacion de estados de fallo aprendidos de correcciones humanas (gripper cerrado sobre vacio, brazo aparcado sobre la bandeja con el gripper vacio, vacilaciones).
- Manipulacion en escenarios con vecinos en contacto, distractores y bandejas parcialmente llenas presentes en el entrenamiento.
- Caso especifico de objeto apoyado contra la pared de la bandeja: giro de muneca, empuje lateral y agarre posterior.
- No soporta *tool calling*, function calling, agentes, razonamiento multi-paso simbolico ni capacidades de audio o vision general: es una politica motora, no un asistente.

## Casos de uso

- Automatizacion de celda pick-and-place con SO-101: el modelo cubre el ciclo completo mesa-bandera y bandera-mesa con una sola politica de 450 M, lo que permite desplegarla en un robot de bajo coste sin infraestructura de inferencia grande.
- Investigacion en aprendizaje por imitacion con correcciones: sirve como referencia reproducible para medir cuanto aportan los clips de intervencion humana frente al modelo de control `smolvla_so101_tray_v2corr`, con la misma receta y el mismo numero de pasos.
- Generacion de datos sinteticos y sim-to-real: puede integrarse en pipelines como el tutorial de NVIDIA Isaac para SO-101, donde se entrena y valida en simulacion antes de pasar al brazo real, usando este checkpoint como punto de partida o comparativa.
- Clasificacion y separacion en bandejas transparentes: el entrenamiento incluye bandejas prellenadas y objetos con vecinos en contacto, util en tareas de carga/descarga de contenedores donde la transparencia degrada la percepcion de profundidad.
- Banco de pruebas de generalizacion: el autor reserva objetos no vistos para medir generalizacion, de modo que el modelo sirve para evaluar politicas agnosticas a la clase frente a politicas condicionadas por nombre de objeto.
- Prototipado rapido en laboratorio con una sola GPU: el ajuste completo cupo en una L4 de 24 GB a 1,2 s por paso, asi que un grupo puede reentrenar la politica sobre su propia banda y sus propios objetos en horas, no semanas.
- Recuperacion ante fallos en produccion: los clips de correccion permiten que la politica retome la tarea desde estados degradados, lo que reduce la necesidad de reiniciar el episodio cuando el gripper llega vacio o el objeto queda fuera del alcance de un agarre recto.
- Docencia y cursos de VLA: el par modelo + dataset + checkpoints intermedios cada 2.500 pasos hace viable reproducir el experimento completo en un curso practico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K ni metricas de robotica tipo success rate en un banco publico) en la informacion disponible. El autor solo publica la curva de perdida de entrenamiento y una verificacion offline de reproducibilidad:

| Paso | Perdida (MSE de flow matching) | LR |
|---|---|---|
| 100 | 0,422 | 2,6e-06 |
| 1K | 0,204 | 5,0e-05 |
| 11K | 0,083 | 3,5e-05 |
| 21K | 0,045 | 1,2e-05 |
| 30K | 0,036 | 2,5e-06 |

Verificacion offline sobre 6 fotogramas de 6 episodios (hasta 3 por tarea), con error en unidades articulares crudas (grados):

| Metrica | Valor |
|---|---|
| MAE por articulacion, primer paso | 1,6093 / 1,1516 / 2,7248 / 0,7509 / 2,7939 / 0,4798 |
| MAE por articulacion, paso 50 | 1,8476 / 2,0337 / 2,5771 / 1,6744 / 2,6726 / 1,2376 |
| MAE primer paso normalizado por desviacion tipica (media) | 0,048 |
| MAE paso 50 normalizado (media) | 0,072 |
| Salidas finitas | si |
| Latencia por chunk en cuda | 233,7 ms de mediana |
| Huella de verificacion (suma de predicciones del primer paso) | 223,22107 |

No hay resultados de tasa de exito en robot real publicados en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en bf16 ocupan unos 0,9 GB y en fp32 unos 1,8 GB; con el codificador visual y dos imagenes de 640x480 el pico realista estimado es de 2 a 4 GB (estimacion a partir del numero de parametros, no medida publicada).
- GPU recomendadas: el autor entreno en una NVIDIA L4 de 24 GB; para inferencia es suficiente una GPU de gama media. Cabe en consumer GPU como RTX 3060 12 GB, RTX 4060 Ti, RTX 4070 o superiores, y en GPUs de servidor A10, L4, A100 o H100 sin aprovechar su capacidad.
- Latencia medida: 233,7 ms de mediana por chunk en cuda, lo que equivale a unos 4,3 chunks por segundo (calculo derivado de la cifra anterior). No se publica latencia en CPU ni en otras GPU.
- Opciones de despliegue: la via documentada es LeRobot con `SmolVLAPolicy.from_pretrained(...)`; no se publican artefactos GGUF, ONNX, TensorRT ni integraciones con vLLM, llama.cpp, Ollama o TGI, y al ser una politica motora no encaja en esos servidores de texto.
- Almacenamiento: el repositorio ocupa 53,3 GB por los checkpoints cada 2.500 pasos; para desplegar solo hace falta el checkpoint final y conviene descargar selectivamente.
- Requisitos de integracion: dos camaras a 640x480 con los nombres remapeados a `camera1` y `camera2`, estado articular de 6 DOF, un segmentador externo agnostico a la clase que coloque el gripper a ~10 cm sobre el objetivo, y el mismo entorno de camaras usado en el entrenamiento.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Licencia | Disponibilidad |
|---|---|---|---|---|
| `digas99/smolvla_so101_tray_v2corrAB` | 450 M | 2 camaras 640x480 + estado 6 DOF + 1 de 2 instrucciones | Apache-2.0 | HuggingFace, 0 descargas |
| `digas99/smolvla_so101_tray_v2corr` | 450 M (mismo base) | mismo esquema, solo correcciones mesa-bandera | no disponible en la informacion | HuggingFace |
| `digas99/smolvla_so101_tray_v2` | 450 M (mismo base) | mismo esquema, sin clips de correccion | no disponible en la informacion | HuggingFace |
| `lerobot/smolvla_base` | 450 M | 2 camaras + estado + instruccion libre | no disponible en la informacion | HuggingFace |
| OpenVLA-7B | 7 B | 1 imagen + instruccion en lenguaje natural | no disponible en la informacion | HuggingFace |
| ACT (LeRobot) | no disponible | imagenes + estado | no disponible en la informacion | HuggingFace |

La comparacion relevante es interna a la familia: este checkpoint y `smolvla_so101_tray_v2corr` comparten receta y numero de pasos, de modo que la unica diferencia es el conjunto de clips de correccion, lo que lo convierte en un buen ablation study. Frente a OpenVLA-7B, la politica aqui descrita es 15 veces mas pequena y esta especializada en una tarea y un robot concretos, a costa de no generalizar a instrucciones arbitrarias. No se dispone de datos publicos de rendimiento comparado entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de proposito muy especifico: solo dos cadenas de tarea, un unico tipo de robot (SO-101, `so_follower`) y una unica celda de trabajo; no es un asistente conversacional ni un modelo de lenguaje.
- Dependencia de una condicion inicial concreta: la politica espera arrancar desde un hover a ~10 cm sobre el objeto con las mordazas giradas; empezar desde la pose de reposo esta fuera de distribucion y no se ha evaluado.
- Dependencia de infraestructura externa: necesita un segmentador agnostico a la clase que coloque el gripper y un remapeo exacto de nombres de camara; un fallo en cualquiera de los dos invalida la politica.
- Sesgo de dominio: nueve objetos domesticos, una iluminacion y una disposicion de camaras fijas; el propio autor reserva objetos no vistos para medir generalizacion, lo que implica que el rendimiento con clases nuevas no esta garantizado.
- Bandeja transparente: la transparencia complica la percepcion de profundidad y de bordes; los clips de la pared lejana existen precisamente porque el agarre recto falla en esa configuracion.
- Riesgo de alucinacion en sentido motor: puede ejecutar agarres al vacio o aproximaciones erroneas sin senal de confianza ni abstenccion; no hay umbral de seguridad ni detector de fallo publicado.
- Sin benchmarks de tasa de exito en robot real en la informacion disponible; la unica validacion es offline sobre 6 fotogramas de 6 episodios y debe reproducirse en la maquina de despliegue hasta el tercer decimal.
- Repositorio muy pesado (53,3 GB) por los 13 checkpoints intermedios; conviene descargar solo la carpeta del checkpoint final.
- Licencia Apache-2.0: permite uso comercial y modificacion, pero se distribuye sin garantias y sin evaluacion de seguridad fisica; cualquier despliegue sobre hardware real exige limites de par, paradas de emergencia y validacion propia.
- Modelo practicamente sin adopcion: 0 descargas y 0 me gusta en el momento de la consulta, y una sola persona mantenedora, lo que reduce la probabilidad de soporte o correcciones futuras.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/digas99/smolvla_so101_tray_v2corrAB
- Dataset de entrenamiento: https://huggingface.co/datasets/digas99/so101_tray_train_v2corrAB
- Perfil del autor: https://huggingface.co/digas99
- Modelo de control (solo correcciones mesa-bandera): https://huggingface.co/digas99/smolvla_so101_tray_v2
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Repositorio de generacion de datos y ajuste para SO-101: https://github.com/nourel123/SO101-smolVLA
- Pipeline de pick-and-place con SmolVLA y SO-101: https://github.com/RajatDandekar/SmolVLA_MRL2Bootcamp
- Tutorial sim-to-real de SO-101 con NVIDIA Isaac: https://docs.nvidia.com/learning/physical-ai/sim-to-real-so-101/latest/index.html
