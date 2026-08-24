# dokterkepin/omniman_drive_pick_place_smolvla_v2

## Resumen

SmolVLA es un modelo compacto de vision-lenguaje-accion (VLA) desarrollado por Hugging Face que logra un rendimiento competitivo con un coste computacional reducido, permitiendo su despliegue en hardware de consumo. Este checkpoint concreto, `dokterkepin/omniman_drive_pick_place_smolvla_v2`, es un fine-tuning del modelo base `lerobot/smolvla_base` realizado por Kevin Chang (dokterkepin) sobre el dataset `dokterkepin/omniman_drive_pick_place`, que recoge episodios de la tarea de pick-and-place con el robot movil OmniMan.

El modelo cuenta con 450.046.218 parametros (~450M) y se distribuye en formato safetensors con licencia Apache 2.0. Esta entrenado con el framework LeRobot y esta orientado a la manipulacion robotica movil, concretamente a la tarea de recoger y colocar objetos con un manipulador omnidireccional de 6 grados de libertad montado sobre una base de ruedas mecanum.

La relevancia de este modelo radica en que demuestra como un VLA compacto puede adaptarse mediante fine-tuning a tareas roboticas especificas, manteniendo la viabilidad de ejecucion en hardware asequible, lo que facilita la investigacion y el desarrollo de politicas roboticas en entornos academicos y de pequena escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en SmolVLA |
| Parametros totales | 450.046.218 (~450M) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo vision-lenguaje-accion (VLA) compacto y eficiente que integra percepcion visual, comprension de instrucciones en lenguaje natural y generacion de comandos de accion para robots. Su diseno busca lograr un rendimiento competitivo con un coste computacional reducido, permitiendo su ejecucion en hardware de consumo. El checkpoint se referencia en el paper arxiv:2506.01844.

Este checkpoint es un fine-tuning del modelo base `lerobot/smolvla_base` realizado con el framework LeRobot sobre el dataset `dokterkepin/omniman_drive_pick_place`. El dataset recoge episodios de la tarea de pick-and-place con el robot OmniMan, un manipulador movil omnidireccional con base de ruedas mecanum, brazo de 6 grados de libertad con pinza, motores CyberGear, servos Dynamixel y un RPLidar para SLAM y navegacion, operando bajo ROS 2 Humble.

Los detalles especificos del entrenamiento (numero de tokens, composicion del dataset, uso de RLHF/DPO, etc.) no estan disponibles en la informacion proporcionada.

## Capacidades

- Manipulacion pick-and-place: el modelo esta especializado en la tarea de recoger objetos y colocarlos en una posicion determinada con el robot OmniMan.
- Integracion vision-lenguaje-accion: procesa informacion visual y comandos en lenguaje natural para generar acciones roboticas.
- Manipulacion movil: al estar entrenado sobre el robot OmniMan, el modelo opera sobre una base movil omnidireccional, no solo un brazo fijo.
- Fine-tuning sobre tarea especifica: al ser un checkpoint ajustado, esta optimizado para el escenario concreto de pick-and-place del dataset de entrenamiento.
- Compatibilidad con LeRobot: se integra con el ecosistema LeRobot de Hugging Face para entrenamiento, evaluacion e inferencia.

## Casos de uso

- Investigacion en manipulacion robotica movil: el modelo puede utilizarse como punto de partida para experimentos de aprendizaje por imitacion en robots moviles con base omnidireccional, permitiendo a investigadores reproducir y extender los resultados del fine-tuning.
- Desarrollo de politicas de pick-and-place en entornos de laboratorio: adecuado para probar algoritmos de manipulacion en escenarios controlados con el robot OmniMan, gracias a su tamano compacto que permite iterar rapidamente.
- Evaluacion de VLAs compactos en hardware de consumo: sirve como caso de estudio para medir el rendimiento de modelos VLA de ~450M de parametros en GPUs de gama media, validando la viabilidad de este tipo de modelos fuera de centros de datos.
- Benchmarking de fine-tuning con LeRobot: puede emplearse como referencia para comparar estrategias de fine-tuning de SmolVLA sobre distintos datasets roboticos, evaluando la transferencia de capacidades.
- Prototipado de aplicaciones de robotica asistiva: la tarea de pick-and-place es fundamental en escenarios de asistencia (recoger objetos, organizar espacios), y este modelo ofrece una base ligera para prototipar dichas aplicaciones.
- Educacion y formacion en robotica con IA: al ser un modelo pequeno con licencia permisiva (Apache 2.0), es adecuado para cursos y talleres donde los estudiantes puedan experimentar con VLAs sin necesidad de infraestructura costosa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El modelo tiene ~450M de parametros, lo que en precision FP32 ocuparia aproximadamente 1,8 GB en memoria, y en FP16 alrededor de 0,9 GB. Estos valores son estimaciones derivadas del numero de parametros; los requisitos exactos de VRAM no estan especificados en la informacion proporcionada.
- SmolVLA esta disenado para ejecutarse en hardware de consumo, lo que sugiere compatibilidad con GPUs de gama media como RTX 3060, RTX 4060 o superiores, aunque no se proporcionan datos concretos de VRAM.
- El despliegue se realiza tipicamente a traves del framework LeRobot, que soporta inferencia con PyTorch. No se mencionan opciones de despliegue con vLLM, llama.cpp u Ollama, ya que estos estan orientados a modelos de lenguaje generativo y no a politicas roboticas.
- No se dispone de datos de latencia o throughput para este checkpoint especifico.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| dokterkepin/omniman_drive_pick_place_smolvla_v2 | ~450M | no disponible | Apache 2.0 | Fine-tuning de SmolVLA para pick-and-place con OmniMan |
| lerobot/smolvla_base | no disponible | no disponible | no disponible | Modelo base de SmolVLA, sin fine-tuning especifico |
| dokterkepin/omniman_drive_pick_place_diff | 0.3B | no disponible | no disponible | Otra variante del mismo autor para la misma tarea |

Nota: los datos de los modelos comparados provienen de la informacion disponible en HuggingFace y pueden estar incompletos. No se dispone de datos de rendimiento comparativos.

## Limitaciones y advertencias

- El modelo esta especializado en la tarea de pick-and-place con el robot OmniMan; su generalizacion a otros robots o tareas no esta garantizada y probablemente requiera fine-tuning adicional.
- No se dispone de informacion sobre los idiomas soportados, por lo que el rendimiento en lenguajes distintos del idioma de entrenamiento es desconocido.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que no ha sido validado ampliamente por la comunidad.
- No se han publicado benchmarks, por lo que el rendimiento real del modelo en tareas estandarizadas es desconocido.
- Al ser un modelo de politica robotica, no es adecuado para tareas de generacion de texto general o chatbot; su uso esta restringido a la generacion de acciones para el robot.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar la procedencia y licencia del dataset de entrenamiento antes de un despliegue en produccion.
- El modelo depende del ecosistema LeRobot para su ejecucion; no es un modelo autocontenido que pueda cargarse con librerias estandar de transformers.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dokterkepin/omniman_drive_pick_place_smolvla_v2
- Dataset de entrenamiento: https://huggingface.co/dokterkepin/omniman_drive_pick_place
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio del robot OmniMan: https://github.com/dokterkepin/nxp_omniman_ws
- Perfil del autor: https://huggingface.co/dokterkepin
