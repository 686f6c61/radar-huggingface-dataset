# samanthalhy/so100_smol_popcorn_2_gather

## Resumen

`samanthalhy/so100_smol_popcorn_2_gather` es un checkpoint de robotica basado en SmolVLA, un modelo compacto de vision-lenguaje-accion (VLA) desarrollado originalmente por Hugging Face y publicado en el paper arXiv:2506.01844. El modelo ha sido ajustado (fine-tuning) por el usuario samanthalhy sobre el checkpoint base `lerobot/smolvla_base` usando LeRobot, y esta especializado en una tarea concreta de manipulacion ("gather" de palomitas) ejecutada con un brazo robotico de la familia SO-100.

El modelo resuelve el problema de convertir observaciones visuales y una instruccion en lenguaje natural en acciones motoras continuas para un robot real de bajo coste. Con 450.046.212 parametros (~450 M) y un repositorio de 0,9 GB, es lo bastante pequeno para ejecutarse en hardware de consumo, lo que lo sitúa en la categoria de politicas de manipulacion desplegables en el borde (edge). La licencia Apache-2.0 facilita su reutilizacion, incluso comercial.

Es relevante ahora porque demuestra el flujo completo de LeRobot: recolectar un dataset propio (`samanthalhy/so100_popcorn_2_gather`), ajustar una politica VLA preentrenada y publicarla en el Hub en minutos, sin necesidad de clústeres de GPU. No obstante, se trata de un checkpoint de investigacion con cero descargas y cero likes en el momento de la consulta, y sin resultados de evaluacion publicados en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action); backbone de vision-lenguaje con modulo de generacion de acciones. Detalles internos exactos no disponibles en la informacion proporcionada |
| Parametros totales | 450.046.212 (~450 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; los pesos se distribuyen en safetensors sin receta de cuantizacion publicada |
| Idiomas soportados | no disponible (no es un modelo de lenguaje de proposito general; acepta instrucciones textuales, presumiblemente en ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (libreria `lerobot`) |

Metadatos adicionales: pipeline `robotics`, libreria `lerobot`, dataset de entrenamiento `samanthalhy/so100_popcorn_2_gather`, modelo base `lerobot/smolvla_base` (fine-tune), tamano del repositorio 0,9 GB, creado el 2026-09-24 y actualizado el 2026-09-24.

## Arquitectura y entrenamiento

SmolVLA es un modelo de vision-lenguaje-accion compacto: combina un backbone de vision-lenguaje preentrenado con un modulo especifico que emite acciones motoras continuas, de forma que el modelo consume imagenes de camara (y opcionalmente estado del robot) junto con una instruccion textual y produce comandos de control. La filosofia de diseno del paper es mantener un coste computacional reducido manteniendo un rendimiento competitivo frente a politicas VLA de mayor tamano, con la vista puesta en el despliegue en hardware de consumo.

El checkpoint aqui descrito no es el modelo base, sino un fine-tune: se ha entrenado sobre el dataset `samanthalhy/so100_popcorn_2_gather`, recogido presumiblemente mediante teleoperacion con un brazo SO-100, y se ha publicado con las herramientas de LeRobot. No se dispone en la informacion proporcionada de datos sobre numero de tokens o episodios de entrenamiento, composicion del dataset, resolucion de imagen, uso de RLHF/DPO ni innovaciones concretas adicionales (por ejemplo, decodificacion especulativa o inferencia asincrona) aplicadas a este checkpoint concreto.

## Capacidades

- Generacion de acciones motoras continuas para manipulacion robotica a partir de observaciones visuales.
- Interpretacion de instrucciones en lenguaje natural como condicionamiento de la tarea (politica condicionada por lenguaje).
- Ejecucion de una tarea especializada de recogida ("gather") de objetos tipo palomitas sobre un brazo SO-100 en configuracion *follower*.
- Inferencia en bucle cerrado con `lerobot-record`, incluyendo grabacion de episodios de evaluacion.
- Reentrenamiento y ajuste posterior mediante `lerobot-train` sobre nuevos datasets.
- Despliegue en hardware de consumo gracias al tamano reducido del modelo (~450 M de parametros).
- Soporte de tool calling / function calling: no aplica; no es un modelo de lenguaje conversacional.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Modo *thinking*, vision en sentido amplio, audio o generacion de texto libre: no disponibles; la salida del modelo son acciones de robot, no texto.

## Casos de uso

- Manipulacion de laboratorio con SO-100: el modelo puede controlar un brazo SO-100 *follower* para agrupar o recoger objetos ligeros sobre una superficie, replicando la tarea del dataset de entrenamiento. Es adecuado porque el fine-tune esta entrenado exactamente para esa configuracion de camara y robot.
- Reproduccion de experimentos de imitation learning: sirve como referencia para comparar una politica VLA compacta frente a politicas tipo ACT sobre el mismo dataset y hardware, en un entorno academico con presupuesto limitado.
- Prototipado rapido de politicas en el borde: con menos de 1 GB de pesos, el checkpoint puede desplegarse en una estacion de trabajo con una unica GPU de gama media o incluso en un dispositivo tipo Jetson, evitando depender de servidores de inferencia.
- Recogida automatizada de piezas pequenas en lineas de montaje de baja complejidad: el modelo traduce la observacion de la camara en trayectorias de pinza para reunir objetos dispersos, tarea repetitiva y de bajo riesgo.
- Generacion de datos de evaluacion: usando `lerobot-record` con el prefijo `eval_`, se pueden grabar episodios etiquetados para medir la tasa de exito de la politica y alimentar iteraciones posteriores del entrenamiento.
- Docencia en robotica e IA: el par dataset + politica publicados en el Hub permiten a estudiantes recorrer el ciclo completo (teleoperacion, entrenamiento, evaluacion) con coste de hardware minimo.
- Base para *fine-tuning* adicional en tareas relacionadas: al ser un checkpoint intermedio, puede servir de punto de partida para tareas de recogida o clasificacion de objetos con el mismo brazo, aprovechando el conocimiento aprendido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de evaluacion, tasas de exito ni comparaciones cuantitativas, y el repositorio registra 0 descargas y 0 likes en el momento de la consulta.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,9-1 GB en bf16/fp16 y en torno a 1,8 GB en fp32, partiendo de los 450 M de parametros y de un repositorio de 0,9 GB. Cifras orientativas, no publicadas por el autor.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU con 4 GB o mas de VRAM (por ejemplo GTX 1650, RTX 3060, RTX 4060, RTX 4090). Tambien es viable en dispositivos integrados tipo Jetson Orin o Raspberry Pi 5 con acelerador, aunque el rendimiento en CPU pura sera limitado.
- GPU recomendadas para entrenamiento: no disponible en la informacion proporcionada; el comando de entrenamiento de LeRobot usa `--policy.device=cuda`, por lo que se asume una GPU NVIDIA. Para reentrenar el modelo, una GPU de 8-16 GB de VRAM es un punto de partida razonable.
- Opciones de despliegue: scripts de LeRobot (`lerobot-train` para entrenamiento y `lerobot-record` para inferencia/evaluacion) sobre PyTorch. No hay soporte documentado en la informacion disponible para vLLM, llama.cpp, Ollama o TGI, ya que no es un modelo de generacion de texto.
- Latencia y throughput estimados: no disponibles. El paper del modelo base describe objetivos de eficiencia computacional, pero no se ofrecen cifras concretas para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| samanthalhy/so100_smol_popcorn_2_gather | ~450 M | no disponible | Apache-2.0 | Hugging Face (`lerobot`) | Fine-tune especializado en tarea de recogida con SO-100 |
| lerobot/smolvla_base | ~450 M (no confirmado en la informacion disponible) | no disponible | no disponible | Hugging Face (`lerobot`) | Checkpoint base del que deriva este modelo |
| lerobot/act (politica ACT de LeRobot) | no disponible | no disponible | no disponible | Hugging Face / GitHub de LeRobot | Alternativa clasica de imitation learning, mas ligera y sin componente de lenguaje |
| OpenVLA | no disponible en la informacion proporcionada | no disponible | no disponible | publico | Politica VLA de mayor tamano; no se dispone de datos verificados en esta busqueda |

No se dispone de resultados de rendimiento comparables entre estas opciones en la informacion proporcionada, por lo que la comparacion se limita a parametros, licencia y forma de distribucion.

## Limitaciones y advertencias

- Especializacion extrema: el modelo ha sido ajustado para una unica tarea ("popcorn_2_gather") con un brazo SO-100 concreto; fuera de esa configuracion de camara, iluminacion y robot, el comportamiento esperado es deficiente.
- Sin evaluacion publicada: no hay tasas de exito, curvas de aprendizaje ni comparaciones, y el repositorio tiene 0 descargas, por lo que no existe validacion externa.
- Riesgo de sobreajuste al entorno de recogida de datos: cambios en la posicion de la camara, el fondo o el tipo de objeto pueden degradar la politica de forma abrupta.
- Reproducibilidad del hardware: el despliegue requiere un SO-100/SO-101 y la cadena de LeRobot; no es un modelo que pueda probarse solo con texto.
- Sesgos y alucinacion en el sentido de los LLM no aplican directamente; el fallo tipico es una accion fisica incorrecta o insegura, no una respuesta inventada. Aun asi, la politica puede generalizar mal y ejecutar movimientos no previstos.
- Seguridad fisica: al controlar un brazo real, deben establecerse limites de par, paradas de emergencia y espacio de trabajo acotado antes de cualquier prueba.
- Licencia Apache-2.0: permite uso comercial y modificacion, pero el autor no ofrece garantias; conviene revisar tambien las condiciones del modelo base `lerobot/smolvla_base` y del dataset asociado.
- Idiomas y contexto: no hay informacion sobre el idioma de las instrucciones ni sobre la longitud de contexto manejada.
- Fechas de publicacion inusuales: el repositorio figura como creado y actualizado en 2026-09-24, dato que conviene verificar antes de citarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/samanthalhy/so100_smol_popcorn_2_gather
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/samanthalhy/so100_popcorn_2_gather
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de entrenamiento de politicas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Hardware SO-ARM100: https://github.com/TheRobotStudio/SO-ARM100
- Perfil del autor: https://huggingface.co/samanthalhy
- Checkpoint relacionado: https://huggingface.co/samanthalhy/so100_smol_popcorn_1
