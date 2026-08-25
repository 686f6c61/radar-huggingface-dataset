# Kaz55/act-cable3sizes-90ep-4cam-ac60

## Resumen

El modelo `Kaz55/act-cable3sizes-90ep-4cam-ac60` es una política de aprendizaje por imitación basada en Action Chunking with Transformers (ACT), entrenada con el framework LeRobot de Hugging Face. Está diseñada para controlar un brazo robótico UR5e en tareas de manipulación de cables de tres tamaños distintos, utilizando cuatro cámaras como entrada visual. El modelo fue desarrollado por el usuario Kaz55 y publicado bajo licencia Apache-2.0.

ACT es un método de aprendizaje por imitación que predice secuencias de acciones (chunks) en lugar de pasos individuales, lo que mejora la estabilidad y la tasa de éxito en tareas de manipulación complejas. Este modelo concreto ha sido entrenado durante 90 épocas sobre un dataset de teleoperación específico (`Kaz55/dg5f_ur5e_cable3sizes_90ep`), con un tamaño de chunk de 60 pasos y entrada de 4 cámaras. Con aproximadamente 51,7 millones de parámetros, es un modelo compacto que puede ejecutarse en hardware de consumo.

La relevancia de este modelo radica en su aplicación práctica en robótica de manipulación: demuestra cómo un transformer relativamente pequeño puede aprender políticas robustas para tareas de ensamblaje o inserción de cables, un problema común en automatización industrial. Al estar publicado con pesos abiertos y licencia permisiva, permite a investigadores y desarrolladores reproducir y adaptar la política a sus propios entornos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) - transformer con encoder de vision |
| Parametros totales | 51.668.634 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; procesa imagenes y estados del robot) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizacion publicada) |
| Idiomas soportados | no disponible (modelo de robotica, no linguistico) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura ACT descrita en el paper [Action Chunking with Transformers](https://huggingface.co/papers/2304.13705). ACT combina un encoder de vision (tipicamente ResNet) que procesa las imagenes de las camaras, con un transformer que predice una secuencia de acciones futuras (chunk) en lugar de una sola accion. El entrenamiento se realiza mediante aprendizaje por imitacion a partir de demostraciones teleoperadas, utilizando una funcion de perdida que combina error cuadratico medio y loss de entropia cruzada para las acciones discretas.

En este caso concreto, el modelo fue entrenado con el framework LeRobot sobre el dataset `Kaz55/dg5f_ur5e_cable3sizes_90ep`, que contiene 90 episodios de teleoperacion de un brazo UR5e manipulando cables de tres tamanos diferentes. La configuracion incluye 4 camaras como entrada visual y un tamaño de chunk de 60 pasos de accion. No se dispone de informacion detallada sobre el numero total de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO (no aplicables a este tipo de modelo). El entrenamiento se realizo durante 90 epocas, como indica el nombre del repositorio.

## Capacidades

- Control robotico por imitacion: el modelo genera comandos de articulacion (posiciones de las articulaciones del UR5e) a partir de observaciones visuales y del estado del robot.
- Manipulacion de cables: entrenado especificamente para manejar cables de tres tamanos distintos, incluyendo tareas de agarre, insercion o colocacion.
- Entrada multimodal: procesa simultaneamente imagenes de 4 camaras y el estado del efector final.
- Prediccion por chunks: genera secuencias de 60 pasos de accion, lo que reduce la acumulacion de errores y mejora la suavidad del movimiento.
- Integracion con LeRobot: compatible con el ecosistema de LeRobot para entrenamiento, evaluacion y despliegue en robots reales o simulados.
- No es un modelo de lenguaje: no genera texto, no soporta tool calling, ni razonamiento conversacional.

## Casos de uso

- Automatizacion de ensamblaje de cables en fabricacion: el modelo puede controlar un brazo UR5e para insertar o conectar cables de diferentes grosores en conectores, reduciendo la intervencion manual en lineas de produccion.
- Investigacion en aprendizaje por imitacion: sirve como punto de partida para estudiar la transferencia de politicas entre diferentes tamanos de objetos o configuraciones de camaras.
- Prototipado rapido de tareas de manipulacion: gracias a su tamano compacto (51M parametros), puede entrenarse y desplegarse rapidamente en laboratorios con recursos limitados.
- Robotica educativa: permite a estudiantes y desarrolladores experimentar con politicas ACT en plataformas como SO-100 o UR5e, siguiendo los tutoriales de LeRobot.
- Evaluacion de robustez visual: al usar 4 camaras, es util para probar como la politica responde a cambios de iluminacion, oclusiones o puntos de vista alternativos.
- Benchmark de manipulacion deformable: los cables son objetos deformables, por lo que este modelo puede usarse como referencia para comparar metodos de manipulacion de objetos no rigidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de tasas de exito, metricas de error ni comparaciones con otros modelos en el repositorio de HuggingFace ni en los resultados de busqueda web.

## Requisitos de hardware

- VRAM estimada: al tratarse de un modelo de 51,7 millones de parametros, la inferencia requiere menos de 1 GB de VRAM en precision FP32. Con cuantizacion (no publicada) podria reducirse aun mas.
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM es suficiente. Ejemplos: NVIDIA GTX 1650, RTX 3060, RTX 4090, o incluso inferencia en CPU para pruebas lentas.
- Compatibilidad con GPU de consumo: si, cabe en cualquier GPU consumer actual.
- Opciones de despliegue: el modelo se integra con LeRobot, que soporta inferencia en PyTorch. Puede ejecutarse con `lerobot-record` para evaluacion en robots reales. No se menciona soporte para vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no se dispone de datos publicados. Dado el tamano del modelo, la inferencia deberia ser de pocos milisegundos por paso en una GPU moderna, pero depende del hardware y del numero de camaras procesadas.

## Comparativa con modelos similares

No se dispone de informacion suficiente para realizar una comparativa rigurosa con otros modelos. El propio autor ha publicado variantes del mismo modelo con diferentes configuraciones (por ejemplo, `Kaz55/act-newcable-combined-4cam-chunk90` o `Kaz55/act-newcablev3-4cam`), pero no se han encontrado datos de rendimiento comparativo. En la categoria de politicas ACT para robotica, existen otros modelos publicados en el Hub de HuggingFace bajo el ecosistema LeRobot, pero sin datos de benchmarks publicos no es posible establecer una comparacion objetiva.

## Limitaciones y advertencias

- Sesgos del dataset: el modelo fue entrenado exclusivamente con demostraciones teleoperadas de un UR5e manipulando cables de tres tamanos. No generalizara a otros robots, otros objetos o configuraciones de camaras muy diferentes sin reentrenamiento.
- Riesgo de alucinacion: al ser un modelo de control motor, no genera texto, pero puede producir acciones incorrectas o inseguras si las observaciones se alejan de la distribucion de entrenamiento. Es imprescindible validar la politica en entornos controlados antes de usarla en produccion.
- Limitaciones de contexto: el modelo procesa un numero fijo de camaras (4) y un estado del robot. No soporta entradas de longitud variable ni informacion linguistica.
- Restricciones de licencia: la licencia Apache-2.0 permite uso comercial, modificacion y redistribucion, pero no incluye garantias. El usuario es responsable de la seguridad en aplicaciones roboticas.
- Caveat de produccion: la politica no incluye mecanismos de seguridad como deteccion de colisiones o parada de emergencia. Debe integrarse con un sistema de control de seguridad en cualquier despliegue real.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/Kaz55/act-cable3sizes-90ep-4cam-ac60)
- [Paper de ACT (Action Chunking with Transformers)](https://huggingface.co/papers/2304.13705)
- [Documentacion de LeRobot](https://huggingface.co/docs/lerobot/index)
- [Repositorio de LeRobot en GitHub](https://github.com/huggingface/lerobot)
- [Dataset de entrenamiento](https://huggingface.co/datasets/Kaz55/dg5f_ur5e_cable3sizes_90ep)
- [Variante del modelo con chunk 90](https://huggingface.co/Kaz55/act-newcable-combined-4cam-chunk90)
- [Variante del modelo newcablev3](https://huggingface.co/Kaz55/act-newcablev3-4cam)
