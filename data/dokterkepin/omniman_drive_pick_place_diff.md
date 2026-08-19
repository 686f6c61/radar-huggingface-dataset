# dokterkepin/omniman_drive_pick_place_diff

## Resumen

El modelo `omniman_drive_pick_place_diff` es una politica de control visuomotor basada en Diffusion Policy, desarrollada por dokterkepin y entrenada con el framework LeRobot de Hugging Face. Esta disenada para el robot OmniMan, un manipulador movil omnidireccional con base de ruedas mecanum, brazo de 6 grados de libertad y pinza, que opera bajo ROS 2 Humble. El modelo resuelve tareas de pick-and-place (recoger y colocar objetos) mediante la generacion de trayectorias de accion suaves y multi-paso.

La arquitectura Diffusion Policy, propuesta en el paper 2303.04137, trata el control visuomotor como un proceso generativo de difusion, lo que le permite producir trayectorias de accion continuas y robustas, especialmente adecuadas para manipulacion con contacto. El modelo cuenta con 263 millones de parametros y se distribuye bajo licencia Apache 2.0, lo que facilita su uso comercial y su integracion en proyectos de robotica.

La relevancia de este modelo radica en que demuestra la aplicacion de tecnicas de difusion generativa al control robotico en un robot real, combinando el ecosistema LeRobot con ROS 2 para el desarrollo de aplicaciones de IA fisica (physical AI).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (control visuomotor generativo por difusion) |
| Parametros totales | 263.013.737 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de control robotico, no un LLM) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato estandar de LeRobot) |

## Arquitectura y entrenamiento

El modelo implementa Diffusion Policy, una arquitectura que trata el control visuomotor como un proceso generativo de difusion. En lugar de predecir directamente una accion, el modelo genera iterativamente una trayectoria de acciones completa condicionada a las observaciones del robot (imagenes y estado del actuador). Este enfoque produce trayectorias suaves y multi-paso que resultan especialmente eficaces en tareas de manipulacion con contacto, donde los metodos tradicionales de control tienden a fallar.

El entrenamiento se realizo con el framework LeRobot de Hugging Face, utilizando el dataset `dokterkepin/omniman_drive_pick_place`. Los detalles especificos del dataset (numero de episodios, composicion, etc.) no estan disponibles en la informacion proporcionada. El modelo se publico en el Hub de Hugging Face el 18 de agosto de 2026.

## Capacidades

- Control visuomotor para manipulacion robotica: genera trayectorias de accion multi-paso a partir de observaciones visuales y de estado.
- Tareas de pick-and-place: recoger objetos y colocarlos en posiciones objetivo, la tarea para la que fue entrenado.
- Manipulacion con contacto: la arquitectura de difusion produce acciones suaves y robustas en tareas que requieren contacto fisico.
- Integracion con ROS 2: el modelo se integra en el ecosistema ROS 2 Humble del robot OmniMan, permitiendo su uso en aplicaciones de robotica real.
- Compatibilidad con LeRobot: se puede cargar, evaluar y reentrenar con las herramientas estandar de LeRobot.
- Movilidad omnidireccional: al estar disenado para el robot OmniMan, el modelo tiene en cuenta la base de ruedas mecanum, lo que permite navegacion y manipulacion en entornos amplios.

## Casos de uso

- Automatizacion de almacenes: el robot OmniMan puede desplazarse de forma omnidireccional entre estanterias, recoger productos y colocarlos en contenedores de envio. El modelo genera trayectorias suaves que evitan danar objetos fragiles durante la manipulacion.

- Lineas de ensamblaje industrial: el modelo puede encargarse de tareas de recoger y colocar componentes en posiciones precisas, reduciendo la necesidad de brazos roboticos fijos y permitiendo una mayor flexibilidad en la distribucion de la planta.

- Logistica hospitalaria: el robot puede transportar y colocar suministros medicos, farmacos o equipos en ubicaciones designadas dentro de un hospital, aprovechando su base movil y su capacidad de manipulacion.

- Investigacion en robotica: el modelo sirve como punto de partida para investigadores que trabajan con LeRobot y Diffusion Policy, permitiendo estudiar el comportamiento de politicas de difusion en robots moviles con manipulador.

- Automatizacion de laboratorios: el robot puede recoger muestras, tubos de ensayo o placas de Petri y colocarlos en equipos de analisis, liberando tiempo de los investigadores para tareas de mayor valor.

- Domotica y asistencia en el hogar: aunque el robot OmniMan es un prototipo de investigacion, el modelo demuestra el potencial de las politicas de difusion para tareas domesticas como recoger objetos del suelo o colocar platos en un lavavajillas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo se presenta como una politica entrenada para una tarea especifica de pick-and-place, sin metricas cuantitativas de exito, tasa de completado o tiempo de ejecucion.

## Requisitos de hardware

- El modelo esta disenado para ejecutarse en el robot OmniMan, que utiliza una base de ruedas mecanum con motores CyberGear, un brazo de 6 grados de libertad, pinza con servos Dynamixel y un RPLidar para SLAM y navegacion.
- Los requisitos especificos de VRAM y GPU para inferencia no estan disponibles en la informacion proporcionada.
- Al tratarse de un modelo de 263 millones de parametros, es probable que pueda ejecutarse en una GPU de gama media o incluso en el ordenador embarcado del robot, aunque no se proporcionan datos concretos.
- El despliegue se realiza tipicamente a traves del ecosistema LeRobot, con scripts de evaluacion e inferencia como los proporcionados en la documentacion de LeRobot.
- La integracion con ROS 2 Humble sugiere que el modelo se ejecuta en un sistema con ROS 2, posiblemente en un mini PC o NUC embarcado en el robot.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Tarea | Licencia |
|---|---|---|---|---|
| omniman_drive_pick_place_diff | Diffusion Policy | 263 M | Pick-and-place movil | Apache 2.0 |
| ACT (Action Chunking with Transformers) | Transformer | no disponible | Manipulacion robotica | no disponible |
| OpenVLA | VLA (Vision-Language-Action) | no disponible | Manipulacion robotica | no disponible |

No se dispone de datos de rendimiento comparativos entre estos modelos en la informacion proporcionada. La comparativa se limita a aspectos arquitectonicos y de licencia.

## Limitaciones y advertencias

- El modelo esta entrenado especificamente para la tarea de pick-and-place en el robot OmniMan; su generalizacion a otras tareas u otros robots no esta garantizada.
- No se han publicado metricas de exito ni evaluaciones cuantitativas, por lo que su rendimiento en entornos reales no esta validado.
- Al ser una politica de difusion, la inferencia puede ser mas lenta que metodos de prediccion directa, lo que podria afectar a aplicaciones en tiempo real.
- El dataset de entrenamiento no esta documentado en detalle (numero de episodios, variedad de objetos, entornos), lo que limita la comprension de sus capacidades y limitaciones.
- No se dispone de informacion sobre sesgos o comportamientos no deseados en entornos no vistos durante el entrenamiento.
- Aunque la licencia Apache 2.0 permite uso comercial, el robot OmniMan es un prototipo de investigacion y su disponibilidad comercial es limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dokterkepin/omniman_drive_pick_place_diff
- Dataset de entrenamiento: https://huggingface.co/datasets/dokterkepin/omniman_drive_pick_place
- Repositorio del robot OmniMan (ROS 2): https://github.com/dokterkepin/nxp_omniman_ws
- Herramientas de IA fisica (LeRobot + ROS 2): https://github.com/dokterkepin/nxp_omniman_ws/blob/main/physical_ai_tools/README.md
- Paper de Diffusion Policy: https://huggingface.co/papers/2303.04137
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
