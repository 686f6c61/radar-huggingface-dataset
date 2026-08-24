# schronn/policy_baseline

## Resumen

`schronn/policy_baseline` es un modelo de política robótica basado en SmolVLA, un modelo de visión-lenguaje-acción (VLA) compacto y eficiente diseñado para ejecutarse en hardware de consumo. Desarrollado por el usuario schronn y entrenado con el framework LeRobot de HuggingFace, este modelo se ha ajustado específicamente sobre el dataset `schronn/pouring_blue_v3`, orientado a tareas de vertido de líquidos con robots manipuladores.

El modelo parte de `lerobot/smolvla_base` y hereda su arquitectura: un transformer multimodal que procesa observaciones visuales e instrucciones en lenguaje natural para generar acciones motoras continuas. Con aproximadamente 450 millones de parámetros y un tamaño de repositorio de 1,2 GB, representa una opción viable para despliegue en GPU de gama media. Su relevancia radica en la creciente demanda de políticas robóticas que puedan entrenarse y ejecutarse localmente sin depender de infraestructura de servidores de alto coste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action transformer) |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de SmolVLA, aproximadamente 32k tokens) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, cuantizacion no documentada) |
| Idiomas soportados | no disponible (modelo entrenado para control robotico, no para generacion de texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo VLA que combina un codificador visual, un codificador de lenguaje y un decodificador de acciones en una arquitectura transformer unificada. A diferencia de modelos VLA mas grandes como OpenVLA (7B parametros) o RT-2, SmolVLA esta disenado para ser compacto y eficiente, permitiendo inferencia en tiempo real en hardware de consumo. El modelo base fue preentrenado con datos de manipulacion robotica a gran escala y posteriormente ajustado con el dataset `schronn/pouring_blue_v3` mediante el framework LeRobot.

El entrenamiento se realizo con la libreria LeRobot, que implementa el pipeline completo de recopilacion de datos, entrenamiento y evaluacion. El dataset de ajuste contiene episodios de vertido de liquidos capturados con un robot SO-100, incluyendo observaciones visuales de camaras y comandos de actuacion. No se dispone de informacion detallada sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO, ya que la model card no proporciona estos datos.

## Capacidades

- Control robotico de manipulacion: genera comandos de actuacion continua (posicion, velocidad o esfuerzo) a partir de observaciones visuales e instrucciones de lenguaje natural.
- Seguimiento de instrucciones en lenguaje natural: interpreta comandos como "vierte el liquido en el recipiente azul" y los traduce en secuencias de acciones motoras.
- Generalizacion visual: procesa imagenes de camaras RGB para percibir el estado de la escena y los objetos involucrados en la tarea.
- Aprendizaje por imitacion: la politica se entrena mediante demostraciones, lo que permite adaptarla a nuevas tareas con relativamente pocos datos.
- Inferencia en tiempo real: gracias a su tamano compacto, puede ejecutarse a frecuencias de control adecuadas para robotica en hardware de consumo.
- Integracion con LeRobot: compatible con el ecosistema de LeRobot para entrenamiento, evaluacion y despliegue en robots reales.

## Casos de uso

- Automatizacion de tareas de laboratorio: el modelo puede controlar un brazo robotico para verter liquidos en tubos de ensayo o placas de cultivo, reduciendo la intervencion humana en protocolos repetitivos.
- Investigacion en robotica de manipulacion: sirve como punto de partida para investigadores que estudian aprendizaje por imitacion, generalizacion de politicas o transferencia sim2real, gracias a su licencia permisiva y su tamano manejable.
- Prototipado rapido de politicas robotica: con LeRobot, un desarrollador puede recopilar demostraciones con un robot SO-100, ajustar el modelo y desplegarlo en horas, acelerando el ciclo de iteracion.
- Educacion en robotica y aprendizaje por refuerzo: al ejecutarse en GPU de consumo, es adecuado para cursos universitarios o talleres donde los estudiantes necesitan experimentar con VLA sin acceso a clusters de GPU.
- Tareas domesticas asistidas: en entornos de investigacion sobre robotica asistencial, el modelo puede adaptarse para verter bebidas o ingredientes en cocinas controladas.
- Benchmarking de VLA compactos: al ser un ajuste de SmolVLA sobre una tarea especifica, permite comparar el rendimiento de arquitecturas compactas frente a modelos mas grandes en tareas de manipulacion concretas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de exito, tasas de acierto ni comparaciones con otros modelos en la tarea de vertido. Para evaluar el rendimiento, seria necesario ejecutar el modelo en el robot SO-100 siguiendo el procedimiento de evaluacion de LeRobot documentado en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: con 450M parametros en precision FP32, el modelo ocupa aproximadamente 1,8 GB en memoria. Con cuantizacion a FP16 o int8, el uso de VRAM se reduce a ~0,9 GB o ~0,45 GB respectivamente, aunque no se documentan cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM deberia ser suficiente para inferencia en FP16. Tarjetas como NVIDIA GTX 1650, RTX 3050, RTX 4060 o superiores son adecuadas. Para entrenamiento, se recomienda al menos 8 GB de VRAM (RTX 3070, RTX 4070, etc.).
- Compatibilidad con GPU de consumo: si, el modelo esta disenado especificamente para hardware de consumo, siendo este uno de los objetivos principales de SmolVLA.
- Opciones de despliegue: LeRobot proporciona scripts de evaluacion e inferencia. Tambien es posible exportar el modelo a otros formatos como ONNX o TensorRT para optimizacion, aunque no esta documentado en la model card.
- Latencia y throughput: no disponible. La latencia dependera del hardware, la resolucion de las imagenes de entrada y la frecuencia de control requerida por el robot.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Hardware objetivo |
|---|---|---|---|---|
| schronn/policy_baseline (SmolVLA) | 450M | ~32k tokens | Apache 2.0 | GPU de consumo |
| OpenVLA | 7B | 32k tokens | MIT | GPU profesional (24GB+ VRAM) |
| RT-2 (Google) | 55B | 32k tokens | Propietaria | No disponible publicamente |
| Pi0 (Physical Intelligence) | 3B | no disponible | Propietaria | No disponible publicamente |

SmolVLA destaca frente a OpenVLA por su tamano drasticamente menor (450M vs 7B), lo que permite ejecutarlo en GPU de gama media y con menor latencia. Sin embargo, OpenVLA tiene un rendimiento superior en tareas de manipulacion generales debido a su mayor capacidad y a un preentrenamiento mas extenso. RT-2 y Pi0 no son accesibles publicamente, lo que limita su comparabilidad.

## Limitaciones y advertencias

- Sesgos de datos: el modelo se ha ajustado exclusivamente sobre el dataset `schronn/pouring_blue_v3`, que probablemente contiene un unico entorno, un unico robot (SO-100) y un numero limitado de variaciones de la tarea. La generalizacion a otros entornos, robots o tareas sera limitada.
- Riesgo de alucinacion de acciones: como cualquier politica de aprendizaje por imitacion, el modelo puede generar acciones incorrectas o inseguras ante observaciones fuera de la distribucion de entrenamiento. Es imprescindible supervisar al robot durante la evaluacion.
- Limitaciones de contexto visual: la resolucion y el angulo de las camaras utilizadas en el dataset condicionan el rendimiento. Cambios en la iluminacion, la posicion de la camara o los objetos pueden degradar significativamente la precision.
- Sin soporte de tool calling ni agentes: al ser un modelo de politica robotica, no es adecuado para tareas de generacion de texto, razonamiento o interaccion con APIs. Su unica funcion es convertir observaciones en acciones motoras.
- Documentacion incompleta: la model card no especifica hiperparametros de entrenamiento, composicion del dataset, ni resultados de evaluacion, lo que dificulta la reproducibilidad y la comparacion objetiva.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero el modelo se distribuye sin garantias. El usuario es responsable de evaluar la seguridad del modelo en su aplicacion concreta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/schronn/policy_baseline
- Perfil del autor: https://huggingface.co/schronn
- Dataset de entrenamiento: https://huggingface.co/datasets/schronn/pouring_blue_v3
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de entrenamiento de LeRobot: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
