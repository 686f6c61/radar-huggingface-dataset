# Kaz55/act-bluev2-cable170-330-270ep-ac60-100k

## Resumen

Kaz55/act-bluev2-cable170-330-270ep-ac60-100k es un checkpoint intermedio de una politica de robotica basada en ACT (Action Chunking with Transformers) publicada por el usuario Kaz55 en Hugging Face mediante la libreria LeRobot. El modelo aprende una tarea de manipulacion de cables sobre un brazo Universal Robots UR5e equipado con dos sensores tactiles GelSight y dos camaras RealSense, y transforma observaciones visuales y tactiles en comandos motores. No es un modelo de lenguaje: no genera texto ni conversa, sino trayectorias de acciones.

El checkpoint corresponde al paso 100.000 de un entrenamiento planificado de 300.000 pasos, del que el autor libera una instantanea cada 100.000 pasos para comparar directamente el efecto de entrenar durante mas tiempo. Cuenta con 51.668.634 parametros en formato safetensors y ocupa 0,2 GB de repositorio. La politica usa un chunk de 60 acciones, batch de 8 y semilla 1000, y descarta deliberadamente las observaciones de velocidad y esfuerzo aunque esten presentes en el dataset.

Su relevancia es acotada pero concreta: se trata de material de investigacion reproducible para estudiar el escalado de pasos de entrenamiento en politicas de imitacion con entrada tactil, un area con pocos checkpoints publicos y con frecuencia sin evaluacion estandarizada. El autor advierte que la perdida sigue descendiendo mas alla de los 100.000 pasos y que la eleccion de la politica final requiere evaluacion sobre el robot real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), politica visomotora encoder-decoder con action chunking |
| Parametros totales | 51.668.634 |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no aplica como contexto de lenguaje; horizonte de accion (chunk_size) = 60 acciones, n_action_steps = 60 |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de robotica, sin entrada ni salida de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Libreria | LeRobot |
| Pipeline | robotics |
| Tarea | manipulacion de cables (cable170_330_270ep) |
| Robot | Universal Robots UR5e |
| Sensores | 2x GelSight a 500x375 (resolucion nativa), 2x RealSense a 640x480 |
| Dataset de entrenamiento | Kaz55/dg5f_ur5e_bluev2_cable170_330_270ep |
| Pasos de entrenamiento | 100.000 (de una run de 300.000) |
| Batch / semilla | 8 / 1000 |
| Observaciones excluidas | observation.velocity, observation.effort |
| Tamano del repositorio | 0,2 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-12 |

## Arquitectura y entrenamiento

ACT es una politica de imitacion de tipo transformer con encoder y decoder que predice un bloque de acciones futuras en lugar de una unica accion por paso de inferencia. En este checkpoint el bloque es de 60 acciones (chunk_size=60) y se ejecutan las 60 antes de volver a evaluar la politica (n_action_steps=60), lo que reduce la frecuencia de inferencia necesaria durante el control y suaviza la ejecucion. La entrada combina cuatro flujos sensoriales: dos imagenes tactiles GelSight a resolucion nativa 500x375 y dos imagenes RGB de RealSense a 640x480. No se dispone de informacion sobre el numero de capas, dimensiones de embedding ni mecanismo de atencion concretos de esta implementacion.

El entrenamiento se realizo con la libreria LeRobot sobre el dataset dg5f_ur5e_bluev2_cable170_330_270ep, con batch de 8, semilla 1000 y 100.000 pasos. Las observaciones de velocidad y esfuerzo de las articulaciones existen en el dataset pero se excluyen de forma deliberada, en coherencia con el resto de runs de la misma serie de barridos. No hay informacion sobre el numero total de transiciones, la composicion exacta del dataset ni el uso de RLHF o DPO, que en cualquier caso no son habituales en este tipo de politicas. El autor senala que la perdida de entrenamiento sigue bajando bastante mas alla de los 100.000 pasos: en una run anterior de 200.000 pasos se observo una mejora de aproximadamente el 25 % entre los 100.000 y los 200.000, por lo que los checkpoints posteriores no son redundantes.

## Capacidades

- Prediccion de secuencias de acciones motoras para un brazo UR5e, en bloques de 60 acciones.
- Manipulacion de cables, una tarea de contacto rico y estado deformable.
- Fusion multimodal de vision RGB (2x RealSense 640x480) y tactile sensing (2x GelSight 500x375).
- Ejecucion de politicas de imitacion entrenadas por clonacion de comportamiento sobre demostraciones.
- Reentrenamiento y fine-tuning con LeRobot sobre datasets propios en el mismo formato.
- No soporta generacion de texto, razonamiento simbólico, codigo ni matematicas.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso en el sentido de los modelos de lenguaje.
- No tiene capacidades multilingues ni procesamiento de lenguaje natural.
- No se declara modo de razonamiento (thinking mode), vision-language, audio ni ninguna capacidad especial adicional.

## Casos de uso

- Investigacion en manipulacion de cables: el modelo esta entrenado especificamente sobre una tarea de cable, por lo que sirve como punto de partida reproducible para estudiar estrategias de agarre y guiado sobre objetos deformables.
- Estudio del escalado de pasos de entrenamiento: al existir checkpoints a 100k, 200k y 300k de la misma run, permite medir la curva de mejora de la politica en funcion del numero de pasos con un protocolo controlado.
- Fine-tuning con datos propios: una celda UR5e con GelSight y RealSense puede reutilizar este checkpoint y reentrenar con LeRobot sobre demostraciones propias de otra tarea, aprovechando las representaciones visuales y tactiles ya aprendidas.
- Desarrollo de politicas tactiles: es un banco de pruebas para evaluar cuanto aporta la entrada GelSight frente a la vision RGB en tareas de contacto, ya que el modelo consume ambos canales de forma explicita.
- Comparacion de algoritmos en LeRobot: sirve como referencia ACT frente a otras politicas de la misma libreria (por ejemplo Diffusion Policy o SmolVLA) en un pipeline identico de datos y evaluacion.
- Docencia y divulgacion tecnica: el tamano reducido del checkpoint (0,2 GB) permite reproducir el ciclo completo de carga, inferencia y evaluacion en un laboratorio con hardware modesto.
- Base para destilacion o despliegue en tiempo real: el bajo numero de parametros y el chunk de 60 acciones lo hacen candidato para prototipos de control a alta frecuencia en hardware de gama media.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye tasas de exito, curvas de evaluacion en robot ni comparaciones cuantitativas con otras politicas; unicamente menciona que la perdida de entrenamiento sigue descendiendo mas alla de los 100.000 pasos y que la eleccion de la politica final todavia requiere evaluacion sobre el robot real.

## Requisitos de hardware

- VRAM estimada para los pesos: aproximadamente 207 MB en fp32 y 103 MB en fp16/bf16, calculada a partir de los 51.668.634 parametros.
- VRAM total necesaria: no disponible. Hay que sumar activaciones, buffers de las cuatro camaras (2x GelSight 500x375 y 2x RealSense 640x480) y el runtime de PyTorch, por lo que la cifra real sera superior a la de los pesos.
- GPU recomendadas: no hay recomendaciones publicadas. Por tamano, cabe holgadamente en GPUs de consumo como RTX 3060, RTX 4060, RTX 4070 o superiores; no requiere A100 ni H100.
- Cabe en GPU de consumo: si, previsiblemente en cualquier GPU con 8 GB o mas de VRAM, aunque la cifra exacta depende del pipeline de vision y del backend de inferencia.
- Opciones de despliegue: LeRobot (libreria declarada) sobre PyTorch. vLLM, llama.cpp, Ollama y TGI no son aplicables porque no es un modelo de lenguaje.
- Latencia y throughput: no disponible. El uso de chunks de 60 acciones reduce la frecuencia de inferencia requerida respecto a politicas que predicen una accion por paso.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo de politica | Entradas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (ACT, Kaz55) | 51,67 M | ACT con chunk de 60 acciones | 2x RGB + 2x GelSight | no disponible | Hugging Face, 0 descargas |
| ACT original (ALOHA, Zhao et al.) | no disponible | ACT | Camaras RGB | no disponible | Codigo y pesos publicos del trabajo original |
| Diffusion Policy | no disponible | Politica generativa por difusion | RGB (y opcionalmente otras) | no disponible | Implementaciones open source |
| SmolVLA | ~450 M (segun su model card publica) | Vision-language-action | RGB + instruccion en lenguaje | no disponible | Hugging Face (lerobot/smolvla_base) |

No hay datos publicados que permitan comparar el rendimiento de este checkpoint con el de las alternativas en una misma tarea. La comparacion solo es posible a nivel de categoria, entradas sensoriales, orden de magnitud de parametros y disponibilidad.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no responde a instrucciones en lenguaje natural y no soporta tool calling ni agentes. Las filas de idiomas de esta ficha no aplican.
- Es un checkpoint intermedio. El propio autor indica que la perdida sigue bajando despues de 100.000 pasos y que una run previa de 200.000 mejoro aproximadamente un 25 % respecto a 100.000, por lo que es probable que los checkpoints de 200k y 300k sean superiores.
- No hay evaluacion sobre robot publicada. El autor afirma explicitamente que la eleccion de la politica final necesita evaluacion en el robot real, de modo que no existe evidencia de tasa de exito.
- Sin licencia declarada: no se especifican condiciones de uso comercial, redistribucion ni modificacion. Usarlo en produccion implica riesgo legal; conviene contactar con el autor.
- Fuerte acoplamiento al dominio: entrenado para un UR5e con una configuracion concreta de sensores GelSight y RealSense y para una tarea de cable especifica. No se espera generalizacion a otros brazos, otras camaras u otras tareas sin reentrenamiento.
- Riesgo en estados fuera de distribucion: como toda politica de clonacion de comportamiento, puede fallar de forma silenciosa ante iluminacion, posiciones de cable o condiciones de contacto no representadas en el dataset.
- Excluye observation.velocity y observation.effort: si el entorno de despliegue difiere del dataset de entrenamiento, el comportamiento es incierto.
- Sin validacion por la comunidad: 0 descargas y 0 likes en el momento de la consulta, sin issues ni evaluaciones de terceros.
- No hay informacion sobre sesgos, composicion demografica del dataset, cuantizacion disponible ni idiomas, por lo que esos aspectos quedan como no disponibles en lugar de asumirse neutros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kaz55/act-bluev2-cable170-330-270ep-ac60-100k
- Dataset de entrenamiento: https://huggingface.co/datasets/Kaz55/dg5f_ur5e_bluev2_cable170_330_270ep
- Checkpoints hermanos de la misma run, citados en la model card: act-bluev2-cable170-330-270ep-ac60-200k y act-bluev2-cable170-330-270ep-ac60-300k (IDs tal y como aparecen en la model card; no se han verificado sus URL individuales)
- Libreria LeRobot: https://github.com/huggingface/lerobot
- Articulo original de ACT y ALOHA, "Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware": https://arxiv.org/abs/2304.13705
- Nota sobre la busqueda web: los resultados recuperados corresponden a paginas de ayuda de YouTube TV, premios de creadores de YouTube y foros sin relacion alguna con el modelo. No se ha encontrado informacion adicional relevante sobre este checkpoint.
