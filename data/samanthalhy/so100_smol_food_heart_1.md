# samanthalhy/so100_smol_food_heart_1

## Resumen

El modelo `samanthalhy/so100_smol_food_heart_1` es un policy de robótica basado en SmolVLA, un modelo visión-lenguaje-acción (VLA) compacto y eficiente desarrollado por Hugging Face. Ha sido fine-tuning del modelo base `lerobot/smolvla_base` sobre el dataset `samanthalhy/so100_food_heart_1`, que contiene demostraciones de manipulación con un brazo robótico SO-100. El objetivo es ejecutar tareas de recogida y colocación de objetos (en este caso, piezas con forma de corazón) mediante aprendizaje por imitación.

Con 450 millones de parámetros, este modelo está diseñado para desplegarse en hardware de consumo, lo que lo hace accesible para laboratorios de investigación y entornos educativos. Su relevancia radica en demostrar que un VLA compacto puede alcanzar un rendimiento competitivo en tareas robóticas específicas con un coste computacional reducido, siguiendo la filosofía de la familia Smol de Hugging Face.

El modelo se distribuye bajo licencia Apache 2.0 y se integra con el ecosistema LeRobot, lo que facilita su uso en pipelines de entrenamiento, evaluación e inferencia robótica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action) |
| Parametros totales | 450.046.212 (450M) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors) |
| Idiomas soportados | no disponible (modelo de accion robotica, no de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo de vision-lenguaje-accion que combina un codificador visual, un modelo de lenguaje y una cabeza de accion para generar comandos motores a partir de observaciones visuales y, opcionalmente, instrucciones en lenguaje natural. El modelo base `lerobot/smolvla_base` ha sido disenado para ser eficiente en terminos de parametros y computo, permitiendo su ejecucion en GPUs de consumo.

El fine-tuning se ha realizado con el framework LeRobot sobre el dataset `samanthalhy/so100_food_heart_1`, que contiene episodios de demostracion de un brazo SO-100 realizando tareas de manipulacion de objetos. No se dispone de informacion detallada sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni el uso de tecnicas como RLHF o DPO. El entrenamiento se ha llevado a cabo mediante aprendizaje por imitacion supervisado, siguiendo el flujo estandar de LeRobot.

## Capacidades

- Generacion de acciones motoras (posiciones de articulaciones, velocidades, etc.) a partir de imagenes de camara y, potencialmente, instrucciones de lenguaje.
- Control de un brazo robotico SO-100 para tareas de manipulacion como recoger, mover y colocar objetos.
- Ejecucion de politicas aprendidas por imitacion, con capacidad de generalizacion limitada a variaciones del entorno de entrenamiento.
- Integracion con el ecosistema LeRobot para entrenamiento, evaluacion y despliegue en robots reales o simulados.
- No incluye capacidades de generacion de texto, razonamiento general, tool calling ni agentes autonomos; es un modelo especializado en control motor.

## Casos de uso

- Automatizacion de tareas de recogida y colocacion en entornos de cocina: el modelo puede controlar un brazo SO-100 para manipular alimentos u objetos pequenos, reduciendo la intervencion humana en procesos repetitivos.
- Investigacion en aprendizaje por imitacion: sirve como punto de partida para estudiar como un VLA compacto se comporta en tareas especificas, permitiendo comparar con modelos mas grandes.
- Educacion en robotica: al ser ligero y ejecutable en hardware de consumo, es adecuado para laboratorios docentes donde se ensenan conceptos de control robotico y aprendizaje automatico.
- Prototipado rapido de politicas: gracias a LeRobot, se puede entrenar y evaluar rapidamente en nuevos datasets, acelerando el desarrollo de soluciones para tareas de manipulacion concretas.
- Benchmarking de VLA en hardware limitado: permite medir el rendimiento de un modelo de 450M en tareas reales, contrastando con alternativas mas pesadas.
- Despliegue en robots de bajo coste: el brazo SO-100 es un robot asequible, y este modelo ofrece una politica funcional que puede integrarse en sistemas de automatizacion a pequeña escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- No se dispone de datos oficiales sobre VRAM, GPU recomendadas o latencia.
- Dado el tamano de 450M de parametros, se estima que el modelo puede ejecutarse en GPUs con al menos 2-4 GB de VRAM en precision FP16, aunque no se ha verificado.
- El despliegue puede realizarse mediante LeRobot, que soporta inferencia en GPU (CUDA) y posiblemente en CPU para pruebas.
- No se han documentado opciones de cuantizacion especificas ni integraciones con vLLM, llama.cpp u Ollama, ya que el modelo no es de lenguaje generativo.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa con otros modelos VLA (como OpenVLA, RT-2 o modelos de la familia SmolVLA) en terminos de rendimiento, contexto o licencia. Los datos de parametros y arquitectura son los unicos disponibles, y no hay resultados de benchmarks publicados.

## Limitaciones y advertencias

- El modelo esta especializado en la tarea concreta del dataset de entrenamiento (manipulacion de objetos con forma de corazon) y puede no generalizar a otros objetos, entornos o configuraciones del robot.
- No se han documentado sesgos especificos, pero al ser un modelo de control motor, su comportamiento depende criticamente de la calidad y diversidad de las demostraciones de entrenamiento.
- Riesgo de alucinacion no aplica en el sentido de generacion de texto, pero puede producir acciones incorrectas o inseguras si las observaciones difieren de las del entrenamiento.
- La licencia Apache 2.0 permite uso comercial, pero el modelo no incluye garantias de seguridad para aplicaciones en entornos reales sin validacion adicional.
- No se proporcionan datos sobre latencia, throughput ni requisitos de hardware, por lo que el despliegue en produccion requiere pruebas previas.
- El modelo depende del ecosistema LeRobot; su uso fuera de este framework puede requerir adaptaciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/samanthalhy/so100_smol_food_heart_1
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Dataset de entrenamiento: https://huggingface.co/datasets/samanthalhy/so100_food_heart_1
- Perfil del autor: https://huggingface.co/samanthalhy
