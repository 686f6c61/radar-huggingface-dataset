# Chaenn/smolvla_policy_so101_multitask_test_pnp0908_stack0908_raw

## Resumen

SmolVLA es un modelo compacto de vision-lenguaje-accion (VLA) desarrollado por Hugging Face que combina un backbone vision-lenguaje con un modulo de generacion de acciones, disenado para ejecutar tareas de manipulacion robotica en hardware de consumo. Esta ficha corresponde a un *fine-tuning* concreto: la politica `Chaenn/smolvla_policy_so101_multitask_test_pnp0908_stack0908_raw`, publicada por el usuario Chaenn sobre el modelo base `lerobot/smolvla_base` y entrenada con la libreria LeRobot. El problema que resuelve es el control de un brazo robotico SO-101 (`so_follower`) a partir de observaciones multimodales en tiempo real: estado de las articulaciones y hasta cuatro flujos de imagen.

La politica tiene 450.046.176 parametros (~450 M) y un repositorio de 0,9 GB en formato safetensors. Consume `observation.state` (vector de 6 dimensiones) y cuatro entradas visuales (tres camaras de 3x256x256 y una de 3x480x640), y produce un vector de accion de 6 dimensiones, que corresponde a las seis articulaciones del robot. Fue ajustada sobre un unico dataset de demostraciones teleoperadas de 1265 episodios y 2.248.810 fotogramas a 30 FPS, con dos tareas: colocar cinco cubos dentro de un limite negro y apilarlos formando una torre.

Su relevancia actual radica en que demuestra el flujo completo de *imitation learning* de LeRobot: un modelo pequeno que cabe en GPU de consumo, con licencia Apache 2.0, reproducible con unos pocos comandos de CLI y reutilizable como punto de partida para politicas propias. Ahora bien, se trata de un experimento de entrenamiento (cero descargas, cero *likes* en el momento de redactar esta ficha) y el propio autor no ha publicado resultados de evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje-accion (VLA) compacta, derivada de SmolVLA (transformer con backbone vision-lenguaje y modulo de accion) |
| Parametros totales | 450.046.176 (~450 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica; consume ventanas de observacion multimodal en tiempo real (no es un modelo de lenguaje conversacional) |
| Tipos de cuantizacion | No disponible; pesos distribuidos en safetensors, sin variantes GGUF, AWQ o GPTQ publicadas |
| Idiomas soportados | No disponible; las instrucciones de tarea son cadenas de texto en ingles en los ejemplos de la model card |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria `lerobot`) |
| Tamano del repositorio | 0,9 GB |
| Modelo base | `lerobot/smolvla_base` (fine-tuning) |
| Entradas | `observation.state` (6,); `observation.images.camera1` (3x256x256); `observation.images.camera2` (3x256x256); `observation.images.camera3` (3x256x256); `observation.images.empty_camera_0` (3x480x640) |
| Salidas | `action` (6,) |
| Robot objetivo | `so_follower` (SO-101) |
| Frecuencia de datos de entrenamiento | 30 FPS |
| Libreria | LeRobot 0.6.2 |

## Arquitectura y entrenamiento

SmolVLA, la arquitectura en la que se basa esta politica, se describe en el paper arXiv:2506.01844 como un modelo de vision-lenguaje-accion compacto y eficiente, con rendimiento competitivo a un coste computacional reducido y capacidad de despliegue en hardware de consumo. La model card de este repositorio no detalla la composicion interna del backbone ni el numero de tokens de preentrenamiento del modelo base; toda la informacion arquitectonica disponible se limita a la referencia al paper y al hecho de que se trata de una politica que mapea observaciones multimodales (estado + imagenes) a acciones continuas.

El *fine-tuning* concreto se realizo con LeRobot 0.6.2 sobre el dataset `Chaenn/so101_multitask_test_pnp0908_stack0908_raw`, que contiene 1265 episodios y 2.248.810 fotogramas a 30 FPS repartidos entre dos tareas de manipulacion con cinco cubos. La configuracion de entrenamiento fue: 281.250 pasos, tamano de lote 16, optimizador AdamW, tasa de aprendizaje 0,0001 y semilla 1000. No se documenta el uso de RLHF, DPO ni ninguna fase de ajuste por preferencias, lo cual es coherente con el paradigma de *imitation learning*: la politica aprende por clonacion de comportamiento a partir de demostraciones teleoperadas.

Un detalle relevante para la reproducibilidad es que las claves de observacion incluyen una camara denominada `empty_camera_0` con resolucion 480x640, distinta de las tres camaras de 256x256. Cualquier despliegue debe declarar entradas con exactamente esos nombres y formas, porque el modelo ha aprendido a asociar cada flujo visual a una clave concreta.

## Capacidades

- Control de manipulacion robotica de 6 grados de libertad: genera comandos de accion continuos a partir de observaciones de estado articular.
- Percepcion visual multimodal: procesa simultaneamente cuatro entradas de imagen (tres de 256x256 y una de 480x640).
- Ejecucion de tareas descritas en lenguaje natural mediante el parametro `--task`, por ejemplo "Pick and place each of the five cubes inside the black boundary." o "Stack the five cubes into one tower inside the black boundary."
- Naturaleza multitarea: la misma politica ha sido entrenada para dos comportamientos distintos (recoger y colocar, y apilar), seleccionables en tiempo de ejecucion.
- Aprendizaje por imitacion a partir de demostraciones teleoperadas, sin necesidad de recompensas ni simulador.
- Integracion con el ecosistema LeRobot: comandos `lerobot-rollout` para inferencia y `lerobot-train` para reentrenamiento.
- No soporta *tool calling*, *function calling*, razonamiento multi-paso simbolico ni generacion de texto general: es una politica de control, no un asistente conversacional.
- No se documentan capacidades de audio, vision de proposito general ni soporte multilingue.

## Casos de uso

- Automatizacion de *pick and place* en linea de montaje: la politica puede recoger piezas y depositarlas dentro de una region delimitada, replicando exactamente la tarea de entrenamiento sobre el brazo SO-101 con dos camaras sincronizadas a 30 FPS.
- Apilado de objetos para validacion de manipulacion fina: el segundo comportamiento entrenado (formar una torre con cinco cubos) sirve como prueba de control fino y de estabilidad de la politica en tareas de precision.
- Banco de pruebas de investigacion en *imitation learning*: al ser un modelo pequeno con licencia Apache 2.0 y flujo de entrenamiento reproducible, es util para comparar variantes de dataset, tasa de aprendizaje o configuracion de camaras sin necesidad de un clúster.
- Base para *fine-tuning* especifico de dominio: partiendo de `lerobot/smolvla_base` y de este ajuste, un equipo puede reentrenar con sus propias demostraciones para una tarea nueva en lugar de empezar desde cero.
- Clasificacion y *kitting* de piezas pequenas: la combinacion de vision de alta resolucion (480x640) y estado articular permite distinguir objetos y colocarlos en posiciones concretas dentro de una zona acotada.
- Robotica educativa y docencia: el SO-101 es una plataforma de bajo coste, y este modelo demuestra el ciclo completo (grabar datos, entrenar, desplegar) en un curso o taller practico.
- Recogida y reubicacion de objetos en almacen de laboratorio: tareas de *bin picking* sencillas donde el objeto no cambia de forma y el entorno esta controlado.
- Evaluacion de generalizacion entre robots del mismo tipo: util para medir cuanto se degrada una politica entrenada en un montaje concreto al trasladarla a otra unidad SO-101 o a condiciones de iluminacion diferentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye explicitamente la frase "_No evaluation results have been provided for this policy yet_", sin tabla de exitos por tarea ni numero de ensayos. Tampoco se proporcionan datos de latencia, *throughput* ni tasa de exito en robot real.

## Requisitos de hardware

- VRAM estimada para inferencia: partiendo de 450 M de parametros, el peso ocupa aproximadamente 1,8 GB en fp32 y 0,9 GB en fp16/bf16 (coincide con el tamano del repositorio, 0,9 GB). Habria que anadir el coste de activaciones del *encoder* visual para cuatro flujos de imagen, por lo que una estimacion razonable de uso total en bf16 es del orden de 2 a 3 GB. Los pesos distribuidos no son una cuantizacion de baja precision declarada, sino el checkpoint del modelo.
- GPU recomendadas: por tamano, cualquier GPU con 4 GB o mas de VRAM es suficiente; se espera un funcionamiento comodo en RTX 3060, RTX 4060, RTX 4090, A100 o H100, aunque no se publican mediciones especificas en ninguna de ellas.
- Cabe en GPU de consumo: si, es uno de los objetivos de diseno de SmolVLA segun la propia model card ("can be deployed on consumer-grade hardware"). Es plausible su ejecucion en CPU, aunque sin datos publicados de latencia.
- Restriccion temporal: los datos de entrenamiento estan capturados a 30 FPS, de modo que la politica debe producir acciones con una cadencia compatible con ese ritmo para un control fluido; no se publican mediciones de milisegundos por inferencia.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para ejecutar y `lerobot-train` para reentrenar), con soporte de `--policy.device=cuda`. No se documenta soporte oficial en esta model card para vLLM, llama.cpp, Ollama o TGI, que estan orientados a modelos de lenguaje y no a politicas de accion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Licencia | Disponibilidad | Comentario |
|---|---|---|---|---|---|
| Esta politica (SmolVLA ajustado, Chaenn) | ~450 M | VLA multitarea para SO-101 | Apache 2.0 | Hugging Face, via LeRobot | Dos tareas concretas, sin resultados de evaluacion publicados |
| `lerobot/smolvla_base` | ~450 M (segun el modelo base referenciado) | VLA preentrenado | No disponible en la informacion proporcionada | Hugging Face | Modelo base del ajuste; punto de partida para *fine-tuning* |
| Otras politicas VLA de mayor tamano (por ejemplo OpenVLA o familia pi) | No disponible en la informacion proporcionada | VLA | No disponible | No disponible | Requieren comparaciones verificadas con datos publicos; no se dispone de cifras en la informacion proporcionada |

No se dispone en la informacion proporcionada de resultados comparativos de rendimiento entre esta politica y alternativas de la misma categoria.

## Limitaciones y advertencias

- Ausencia total de evaluacion: la model card declara que no hay resultados de exito en robot real, por lo que se desconoce la tasa de acierto de las dos tareas entrenadas.
- Riesgo de sobreajuste al montaje concreto: el entrenamiento usa un unico dataset con cinco cubos y un limite negro; cambios de posicion de objetos, iluminacion, fondo o distracciones pueden degradar el comportamiento de forma no cuantificada.
- Dependencia estricta de las claves de observacion: el despliegue debe proporcionar `observation.state`, `observation.images.camera1`, `camera2`, `camera3` y `empty_camera_0` con las formas exactas del entrenamiento. Un nombre de camara distinto impide la inferencia correcta.
- Dependencia del hardware: la politica esta entrenada para el robot `so_follower` (SO-101) con seis articulaciones; no es portable directamente a otros brazos o a robots con distinto numero de grados de libertad.
- Sesgos de los datos de demostracion: al tratarse de clonacion de comportamiento a partir de teleoperacion humana, la politica hereda las trayectorias, los tiempos y los sesgos del operador que grabo los episodios, sin mecanismo de correccion por preferencias.
- Riesgo de alucinacion en el sentido de acciones no validas: no existe un verificador de seguridad de movimiento; una accion erronea se ejecuta directamente en el robot. Se recomienda limitar velocidades y usar parada de emergencia.
- Ambito linguistico limitado: las instrucciones de tarea aparecen en ingles en los ejemplos; no se documenta soporte multilingue ni un tokenizador adaptado al castellano.
- Idoneidad comercial: la licencia Apache 2.0 permite uso comercial con atribucion, pero la ausencia de evaluacion y el estado experimental del repositorio hacen recomendable una validacion exhaustiva antes de cualquier despliegue en produccion.
- Estado del repositorio: cero descargas y cero *likes* en el momento de redactar esta ficha, sin historial de uso por terceros que permita contrastar su comportamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Chaenn/smolvla_policy_so101_multitask_test_pnp0908_stack0908_raw
- Dataset de entrenamiento: https://huggingface.co/datasets/Chaenn/so101_multitask_test_pnp0908_stack0908_raw
- Visualizacion del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Chaenn/so101_multitask_test_pnp0908_stack0908_raw
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Guia de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia: https://huggingface.co/docs/lerobot/main/en/inference

Nota: la busqueda web realizada no ha devuelto enlaces relevantes sobre este modelo; los resultados obtenidos correspondian a mapas de transporte y no guardan relacion con la ficha.
