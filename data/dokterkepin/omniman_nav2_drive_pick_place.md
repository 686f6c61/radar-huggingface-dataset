# dokterkepin/omniman_nav2_drive_pick_place

## Resumen

El modelo `dokterkepin/omniman_nav2_drive_pick_place` es una política de control robótico basada en Action Chunking with Transformers (ACT), desarrollada por Kevin Chang (dokterkepin) y publicada bajo licencia Apache-2.0. Está entrenada con el framework LeRobot de Hugging Face y el dataset `dokterkepin/omniman_nav2_drive_pick_place`, que recoge demostraciones teleoperadas de un manipulador móvil omnidireccional con base mecanum, brazo de 6 grados de libertad y pinza, en tareas de navegación, conducción y pick-and-place.

El modelo resuelve el problema de control de robots mediante aprendizaje por imitación: en lugar de predecir una única acción por paso, ACT predice secuencias cortas de acciones (chunks), lo que mejora la estabilidad y la tasa de éxito en tareas de manipulación. Con 51,7 millones de parámetros, es un modelo compacto que puede ejecutarse en hardware de consumo, lo que lo hace relevante para investigación y prototipado en robótica móvil.

La relevancia actual radica en que combina navegación (Nav2) con manipulación en un mismo pipeline, un caso de uso creciente en robótica de servicio y automatización logística. Al estar integrado con ROS 2 Humble y LeRobot, ofrece un flujo de trabajo reproducible para entrenar y desplegar políticas en robots reales o simulados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Action Chunking with Transformers, ACT) |
| Parametros totales | 51.676.876 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizacion publicada) |
| Idiomas soportados | no disponible (modelo de control robotico, sin procesamiento de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura ACT (Action Chunking with Transformers), presentada en el paper arXiv:2304.13705. ACT es un metodo de aprendizaje por imitacion que, dado un estado observado (imagenes y/o estados del robot), predice un chunk de acciones futuras de longitud fija en lugar de una sola accion. Esto reduce el error de acumulacion y permite movimientos mas suaves y coherentes. La arquitectura se basa en un transformer encoder-decoder, donde el encoder procesa las observaciones y el decoder genera la secuencia de acciones.

El entrenamiento se realizo con el framework LeRobot, utilizando el dataset `dokterkepin/omniman_nav2_drive_pick_place`, que contiene demostraciones teleoperadas de un robot movil omnidireccional con brazo de 6 DOF y pinza. No se dispone de informacion detallada sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas como RLHF o DPO. El modelo se entrena mediante comportamiento clonado (behavior cloning) sobre las demostraciones, sin refuerzo posterior.

## Capacidades

- Control de manipulador movil: el modelo integra navegacion (Nav2) y manipulacion (pick and place) en una unica politica.
- Prediccion de chunks de acciones: genera secuencias de acciones de corta duracion, lo que mejora la estabilidad del movimiento.
- Aprendizaje por imitacion: reproduce comportamientos teleoperados, incluyendo la conduccion de la base mecanum y la operacion del brazo y la pinza.
- Integracion con ROS 2 y LeRobot: compatible con el ecosistema de desarrollo de robots de Hugging Face, permitiendo entrenamiento y evaluacion reproducibles.
- No incluye capacidades de lenguaje, vision generalista, tool calling ni razonamiento simbolico; es una politica puramente motora.

## Casos de uso

- Automatizacion de almacenes: el robot puede navegar hasta una estanteria, recoger objetos y colocarlos en una ubicacion designada, replicando tareas de picking y placing en entornos logisticos.
- Investigacion en aprendizaje por imitacion: sirve como punto de partida para estudiar tecnicas de ACT, comparacion de politicas o transferencia de simulacion a real.
- Prototipado de robots de servicio: permite desplegar rapidamente una politica de navegacion y manipulacion en un robot con base omnidireccional, por ejemplo en entornos de oficina o hospitalarios.
- Educacion en robotica: al ser un modelo compacto y con licencia permisiva, puede usarse en cursos de robotica y aprendizaje automatico para ilustrar el entrenamiento de politicas con LeRobot.
- Desarrollo de sistemas de pick-and-place en simulacion: el modelo puede evaluarse en Gazebo con ROS 2 Humble, como se muestra en el video de demostracion, para validar algoritmos antes de pasar a hardware real.
- Integracion en pipelines de robotica fisica: gracias a la interfaz `physical_ai_tools` del repositorio `nxp_omniman_ws`, el modelo puede conectarse a un robot real con ROS 2, facilitando la experimentacion en entornos fisicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni metricas de tasa de exito en tareas de manipulacion. El autor no proporciona comparaciones cuantitativas con otros modelos en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 51,7 millones de parametros, la inferencia requiere menos de 1 GB de VRAM en precision FP32, y significativamente menos en cuantizaciones (aunque no se publican cuantizaciones oficiales).
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM es suficiente, incluyendo NVIDIA GTX 1650, RTX 3050, RTX 4060, etc. Tambien puede ejecutarse en CPU para pruebas lentas.
- Compatibilidad con GPU de consumo: si, cabe en cualquier GPU consumer actual.
- Opciones de despliegue: LeRobot soporta inferencia local con PyTorch; tambien puede integrarse en ROS 2 mediante el repositorio `nxp_omniman_ws`. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponible. Depende del hardware y del tamaño de chunk configurado.

## Comparativa con modelos similares

No se dispone de datos publicados de otros modelos comparables en el mismo repositorio o dataset. Sin embargo, el modelo pertenece a la familia de politicas ACT de LeRobot, que incluye variantes como `dokterkepin/omniman_drive_pick_place_diff` (basada en Diffusion Policy) y `dokterkepin/omniman_drive_pick_place_v2`. Estas alternativas difieren en la arquitectura (ACT vs. Diffusion Policy) pero comparten el mismo dominio de tarea. No hay datos cuantitativos de rendimiento relativo.

| Modelo | Arquitectura | Parametros | Contexto | Licencia |
|---|---|---|---|---|
| omniman_nav2_drive_pick_place (este) | ACT | 51,7 M | no disponible | Apache-2.0 |
| omniman_drive_pick_place_diff | Diffusion Policy | no disponible | no disponible | Apache-2.0 |
| omniman_drive_pick_place_v2 | ACT | no disponible | no disponible | Apache-2.0 |

## Limitaciones y advertencias

- Sesgos conocidos: al ser un modelo entrenado con demostraciones de un unico robot y un unico operador, puede no generalizar a otros robots, configuraciones de camara o estilos de teleoperacion.
- Riesgo de alucinacion: no aplica en el sentido de generacion de texto, pero la politica puede producir acciones incorrectas o inseguras si las observaciones difieren de las del entrenamiento.
- Limitaciones de contexto: no se especifica la longitud de contexto; el modelo procesa observaciones de imagen y estado, no texto.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el modelo depende de LeRobot y ROS 2, cuyas licencias deben revisarse por separado.
- Caveat para produccion: el modelo no incluye mecanismos de seguridad ni validacion de acciones; en despliegues reales se recomienda supervisar las salidas y limitar la velocidad del robot.
- Idioma: no aplica, el modelo no procesa lenguaje.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dokterkepin/omniman_nav2_drive_pick_place
- Perfil del autor: https://huggingface.co/dokterkepin
- Repositorio del robot (ROS 2): https://github.com/dokterkepin/nxp_omniman_ws
- Documentacion de herramientas de IA fisica: https://github.com/dokterkepin/nxp_omniman_ws/blob/main/physical_ai_tools/README.md
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Video de demostracion: https://www.youtube.com/watch?v=TIKgCyKnUOc
