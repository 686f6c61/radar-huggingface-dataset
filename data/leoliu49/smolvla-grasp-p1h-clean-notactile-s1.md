# leoliu49/smolvla-grasp-p1h-clean-notactile-s1

## Resumen

`leoliu49/smolvla-grasp-p1h-clean-notactile-s1` es un ajuste fino de tipo vision-language-action (VLA) construido sobre `lerobot/smolvla_base` y publicado en el Hub con la libreria LeRobot. El modelo resuelve una tarea concreta de robotica: la prediccion de acciones de agarre (grasping) a partir de observaciones visuales y, presumiblemente, instrucciones en lenguaje natural, usando el dataset `leoliu49/grasp_p1h_clean` como corpus de entrenamiento.

Con 450.046.176 parametros (~450 M), se situa en la categoria de VLA compactos: la model card destaca que SmolVLA "alcanza un rendimiento competitivo con costes computacionales reducidos y puede desplegarse en hardware de consumo". Es relevante porque demuestra que una politica de manipulacion puede entrenarse y ejecutarse sin clústeres de GPU, a diferencia de alternativas de 3-7 mil millones de parametros.

El nombre del repositorio indica que se trata de una variante sin entrada tactil (`notactile`) y con una semilla concreta (`s1`), lo que sugiere que forma parte de un estudio comparativo o de ablacion frente a versiones con tacto. El repositorio no incluye resultados de evaluacion, ni descripcion del dataset, ni hiperparametros de entrenamiento, y a fecha de la consulta registra 0 descargas y 0 likes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA); detalles internos no disponibles (referencia: paper SmolVLA, arXiv:2506.01844) |
| Parametros totales | 450.046.176 (~450 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el repo contiene pesos en safetensors; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Libreria | LeRobot (`lerobot`) |
| Modelo base | `lerobot/smolvla_base` |
| Dataset de ajuste | `leoliu49/grasp_p1h_clean` |
| Tarea (pipeline tag) | robotics |
| Tamano del repositorio | 0,9 GB |
| Fecha de creacion | 2026-09-25 |

## Arquitectura y entrenamiento

La informacion disponible confirma que el modelo pertenece a la familia SmolVLA, descrita por sus autores como un modelo compacto de vision-lenguaje-accion que logra rendimiento competitivo con costes computacionales reducidos y es desplegable en hardware de consumo. La model card no detalla el backbone de vision, el componente de lenguaje, la cabeza de prediccion de acciones ni el objetivo de entrenamiento (por ejemplo, si se emplea flow matching o regresion directa); estos datos deben consultarse en el paper arXiv:2506.01844.

En cuanto al entrenamiento, se trata de un ajuste fino supervisado (fine-tune) del checkpoint `lerobot/smolvla_base` sobre el dataset `leoliu49/grasp_p1h_clean`, ejecutado con el flujo de trabajo de LeRobot. No se especifican en la informacion proporcionada el numero de episodios, el numero de tokens o frames de entrenamiento, la composicion del dataset, la presencia de RLHF/DPO ni las innovaciones tecnicas concretas de esta variante. El sufijo `notactile` del nombre apunta a que la politica no consume senales tactiles, y `s1` a una semilla de entrenamiento, lo que sugiere un diseno experimental orientado a ablaciones.

## Capacidades

- Generacion de acciones de robot para tareas de agarre y manipulacion a partir de observaciones visuales, en el marco de una politica VLA.
- Integracion con el ecosistema LeRobot para entrenamiento (`lerobot-train`) y evaluacion o inferencia (`lerobot-record`).
- Ejecucion de politicas en robots tipo seguidor, segun el flujo documentado con `--robot.type=so100_follower`.
- Aprendizaje por imitacion a partir de demostraciones recogidas en el dataset `leoliu49/grasp_p1h_clean`.
- Despliegue previsto en hardware de consumo, segun la descripcion de la familia SmolVLA.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, vision generalista, audio ni modo de pensamiento (thinking). El modelo esta especializado en control robotico, no en tareas de proposito general.

## Casos de uso

- Agarre de objetos en linea de laboratorio: la politica genera acciones de agarre a partir de la imagen de la escena, adecuada para experimentos repetitivos de pick-and-place donde se necesita una politica ligera que quepa en una sola GPU.
- Recogida de datos y evaluacion estandarizada: mediante `lerobot-record` con `--episodes=N` se pueden grabar episodios de evaluacion con prefijo `eval_` y comparar la politica frente a otras variantes del mismo estudio.
- Ablacion cientifica sobre sensado tactil: al ser la variante `notactile`, sirve como linea base para medir la contribucion de la informacion tactil frente a variantes equivalentes que si la utilizan.
- Prototipado rapido en robotica de bajo coste: el flujo documentado con robot `so100_follower` y el tamano de 450 M lo hacen viable en montajes de hardware asequible.
- Investigacion en aprendizaje por imitacion: punto de partida para fine-tuning posterior sobre datasets propios, dado que el modelo base y la receta de entrenamiento son publicos y con licencia Apache 2.0.
- Despliegue en el borde (edge): una politica de 0,9 GB de pesos permite inferencia local en estaciones con GPU de gama media o en modulo embebido, sin dependencia de servicios en la nube.
- Docencia y divulgacion: ejemplo reproducible de VLA compacto para cursos de robotica y aprendizaje automatico, con comandos de entrenamiento y evaluacion documentados por LeRobot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tablas de exito de tarea (success rate), tasas de agarre ni comparaciones cuantitativas con otras politicas. Cualquier cifra de rendimiento deberia obtenerse replicando la evaluacion con `lerobot-record` sobre el entorno de entrenamiento o consultando el paper de SmolVLA (arXiv:2506.01844), que describe el modelo base y no esta variante concreta.

## Requisitos de hardware

- VRAM estimada para pesos: aproximadamente 0,9 GB en bfloat16/fp16 (450 M parametros x 2 bytes) y aproximadamente 1,8 GB en fp32. La VRAM total de inferencia debe sumar activaciones del codificador visual y buffers de imagen, por lo que se recomienda prever al menos 2-4 GB; este calculo es una estimacion derivada del numero de parametros, no una medicion publicada.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM. Cabe con holgura en RTX 3060, RTX 4060, RTX 4090, A100 y H100; en estas ultimas el limite practico sera la frecuencia de control, no la memoria.
- GPU de consumo: si, es uno de los supuestos de diseno de la familia SmolVLA segun la model card.
- Opciones de despliegue: LeRobot es el framework documentado (`lerobot-train` para entrenamiento y `lerobot-record` para evaluacion/inferencia). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje y no a politicas VLA con cabeza de acciones.
- Latencia y throughput: no disponibles. No se publican mediciones de frecuencia de control (Hz) ni de tiempo de inferencia por paso para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `leoliu49/smolvla-grasp-p1h-clean-notactile-s1` | 450 M | No disponible | No disponible | Apache 2.0 | HuggingFace, ajuste fino sobre tarea de agarre |
| `lerobot/smolvla_base` (modelo base) | Familia SmolVLA, tamano no verificado en esta busqueda | No disponible | No disponible | No disponible en la informacion proporcionada | HuggingFace |
| Otros VLA de la misma categoria (OpenVLA, pi0, entre otros) | No disponible en la informacion proporcionada | No disponible | No disponible | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada |

No se dispone de datos verificados de rendimiento, contexto ni licencia de los modelos alternativos dentro de la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa fiable. La unica comparacion defendible es la diferencia de escala: 450 M parametros frente a las familias VLA de varios miles de millones, con la ventaja de despliegue en hardware de consumo que la model card atribuye explicitamente a SmolVLA.

## Limitaciones y advertencias

- Especializacion estrecha: es un ajuste fino sobre un unico dataset de agarre (`grasp_p1h_clean`). Fuera de esa distribucion de tareas, objetos, iluminacion y camaras, el comportamiento esperado es degradado.
- Ausencia de evaluacion publicada: no hay success rate, curvas de entrenamiento ni comparacion con la variante con tacto; no se puede afirmar que supere a la linea base.
- Sesgos del dataset: al no describirse la composicion de `grasp_p1h_clean`, se desconocen sesgos de posicion, tipo de objeto, color, material o configuracion de camara que la politica puede haber interiorizado.
- Riesgo de fallo en ejecucion fisica: en robotica, un error de prediccion se traduce en colisiones o danos materiales. Se recomienda validar en entorno simulado o con limites de par y paradas de seguridad antes de operar cerca de personas.
- Idiomas e instrucciones: no se documenta que lenguas acepta el modelo ni si requiere instrucciones textuales o solo vision.
- Contexto: se desconoce la longitud de contexto y el numero de frames de historial que consume la politica, dato critico para disenar el bucle de control.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificacion, con obligacion de conservar avisos de licencia y sin garantia. Debe verificarse ademas la licencia del modelo base `lerobot/smolvla_base` y del dataset de entrenamiento antes de un despliegue comercial.
- Reproducibilidad: no se publican hiperparametros, semilla completa de entrenamiento ni version de LeRobot; la semilla `s1` del nombre no basta para reproducir el resultado.
- Madurez: 0 descargas y 0 likes en el momento de la consulta, sin documentacion adicional mas alla de la plantilla de LeRobot. No debe tratarse como un artefacto listo para produccion sin auditoria propia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/leoliu49/smolvla-grasp-p1h-clean-notactile-s1
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/leoliu49/grasp_p1h_clean
- Paper de SmolVLA (referencia de la model card): https://huggingface.co/papers/2506.01844
- Version arXiv del paper: https://arxiv.org/abs/2506.01844
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de entrenamiento de politicas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
