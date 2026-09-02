# heyunzhenwhat/smolvla_so101-single-transfer-100ep-2x

## Resumen

SmolVLA es un modelo compacto de visión-lenguaje-acción (VLA) desarrollado por Hugging Face, diseñado para tareas de robótica con un coste computacional reducido y capacidad de despliegue en hardware de consumo. Este repositorio concreto, `heyunzhenwhat/smolvla_so101-single-transfer-100ep-2x`, es un fine-tune del modelo base `lerobot/smolvla_base` realizado por el usuario heyunzhenwhat para una tarea específica de manipulación: mover una cinta a una zona marcada en el lado derecho. El modelo está entrenado con el framework LeRobot y se distribuye bajo licencia Apache-2.0.

Con 450 millones de parámetros, el modelo procesa tres vistas de cámara (256x256 píxeles) junto con el estado del robot (6 dimensiones) para generar acciones de 6 dimensiones. La arquitectura SmolVLA, descrita en el paper arXiv 2506.01844, combina un codificador visual, un codificador de lenguaje y un experto de acción, optimizado para entrenamiento en una sola GPU y ejecución en GPUs de consumo o incluso CPU. Este fine-tune específico se ha entrenado sobre un dataset de 100 episodios con 29.127 frames a 30 FPS, durante 20.000 pasos con batch size 64 y learning rate 0.0001.

La relevancia de este modelo radica en que demuestra cómo un VLA de tamaño reducido puede adaptarse a una tarea robótica concreta mediante fine-tuning, manteniendo la eficiencia computacional que lo hace accesible para laboratorios con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action) |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo de vision-lenguaje-accion que combina un codificador visual (procesa multiples vistas de camara), un codificador de lenguaje (interpreta instrucciones en lenguaje natural) y un experto de accion que genera comandos motores. La arquitectura esta disenada para ser eficiente: se entrena en una sola GPU y puede ejecutarse en GPUs de consumo o incluso CPU. El paper original introduce un stack de inferencia asincrona que desacopla la percepcion y la prediccion de acciones de la ejecucion, permitiendo mayores tasas de control con generacion de acciones por bloques.

Este fine-tune parte del modelo base `lerobot/smolvla_base` y se entrena sobre el dataset `heyunzhenwhat/so101-single-transfer-100ep` con 100 episodios (29.127 frames a 30 FPS) que contienen la tarea "Move the tape into the taped area on the right". La configuracion de entrenamiento incluye 20.000 pasos, batch size 64, optimizador AdamW con learning rate 0.0001 y semilla 1000, todo ello bajo la version 0.6.1 de LeRobot. No se especifican tecnicas adicionales como RLHF o DPO; el entrenamiento es de aprendizaje por imitacion supervisado.

## Capacidades

- Generacion de acciones de robot (6 dimensiones) a partir de observaciones visuales y estado del robot.
- Procesamiento de multiples vistas de camara (tres camaras: overhead, wrist y una tercera no especificada en el README, aunque la tabla de inputs muestra tres imagenes).
- Interpretacion de instrucciones en lenguaje natural (la tarea se expresa como texto).
- Ejecucion de tareas de manipulacion especificas: mover un objeto (cinta) a una zona objetivo.
- Inferencia en tiempo real con latencia reducida gracias al diseno eficiente de SmolVLA.
- No se documentan capacidades de tool calling, agentes autonomos ni razonamiento multi-paso mas alla de la tarea de control.

## Casos de uso

- Automatizacion de tareas de pick-and-place en entornos controlados: el modelo puede ejecutar la tarea de transferencia de cinta en un robot SO-101, util para pruebas de laboratorio y demostraciones de aprendizaje por imitacion.
- Investigacion en aprendizaje por imitacion: sirve como punto de partida para estudiar como un VLA compacto se adapta a tareas concretas con pocos datos (100 episodios).
- Desarrollo de pipelines de robotica con LeRobot: integrable en el ecosistema LeRobot para entrenar, evaluar y desplegar politicas de control.
- Prototipado rapido de aplicaciones roboticas: al ser un fine-tune ligero, puede desplegarse en hardware de consumo para validar conceptos antes de escalar a modelos mayores.
- Benchmarking de eficiencia: permite comparar el rendimiento de SmolVLA frente a otros VLA en tareas de manipulacion con requisitos computacionales limitados.
- Educacion y formacion: util para ensenar conceptos de robotica basada en aprendizaje, ya que el codigo y la configuracion estan abiertos y documentados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente: "No evaluation results have been provided for this policy yet". No se proporcionan metricas de exito en tareas reales ni comparaciones con otros modelos.

## Requisitos de hardware

- SmolVLA esta disenado para entrenarse en una sola GPU y desplegarse en GPUs de consumo o incluso CPU, segun el paper. Sin embargo, no se especifican requisitos exactos de VRAM para este fine-tune concreto.
- Con 450 millones de parametros, se estima que la inferencia puede caber en GPUs con 8-12 GB de VRAM en precision FP16, aunque no hay datos confirmados.
- No se indican GPUs recomendadas especificas. Dado el tamano del modelo, una RTX 3060 o superior podria ser suficiente para inferencia, pero es una estimacion no confirmada.
- Opciones de despliegue: el modelo se integra con LeRobot y puede ejecutarse mediante el comando `lerobot-rollout`. Tambien es compatible con herramientas de inferencia como vLLM o llama.cpp si se convierten los pesos, aunque no se documenta.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para comparar con otros modelos. Como referencia, el modelo base `lerobot/smolvla_base` es la alternativa principal, y se pueden considerar otros VLA como OpenVLA (7B parametros) o RT-2 (mucho mayor), pero no se dispone de comparativas directas en este repositorio. La tabla siguiente resume las diferencias estructurales conocidas:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este fine-tune | 450M | no disponible | Apache-2.0 | HuggingFace |
| smolvla_base | 450M (estimado) | no disponible | Apache-2.0 | HuggingFace |
| OpenVLA | 7B | no disponible | MIT | HuggingFace |

## Limitaciones y advertencias

- Modelo especializado: solo ejecuta la tarea para la que fue entrenado (mover cinta a una zona). No generaliza a otras tareas sin re-entrenamiento.
- Sesgos del dataset: los datos provienen de un unico robot (SO-101) y configuracion de camaras; el rendimiento puede degradarse con otras configuraciones hardware o de iluminacion.
- Riesgo de alucinacion en acciones: como todo modelo de aprendizaje por imitacion, puede generar acciones incorrectas si la observacion difiere del dominio de entrenamiento.
- Sin evaluacion publica: no hay resultados de exito en robot real, por lo que el rendimiento real es incierto.
- Limitaciones de contexto: no se especifica la longitud de contexto del lenguaje, aunque en tareas roboticas suele ser corto (instrucciones simples).
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero se debe mantener la atribucion y aviso de licencia.
- Dependencia de LeRobot: el modelo requiere el ecosistema LeRobot para su ejecucion; no es un modelo autonomo de lenguaje.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/heyunzhenwhat/smolvla_so101-single-transfer-100ep-2x
- Paper SmolVLA: https://arxiv.org/abs/2506.01844
- Documentacion LeRobot SmolVLA: https://huggingface.co/docs/lerobot/main/en/smolvla
- Repositorio LeRobot en GitHub: https://github.com/huggingface/lerobot
- Dataset utilizado: https://huggingface.co/datasets/heyunzhenwhat/so101-single-transfer-100ep
