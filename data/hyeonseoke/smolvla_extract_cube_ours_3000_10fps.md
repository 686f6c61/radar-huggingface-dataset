# HyeonseokE/smolvla_extract_cube_ours_3000_10fps

## Resumen

SmolVLA es un modelo de política vision-language-action (VLA) compacto y eficiente desarrollado por Hugging Face, diseñado para el control de robots mediante aprendizaje por imitación. Esta variante concreta, `smolvla_extract_cube_ours_3000_10fps`, es un fine-tuning del modelo base `lerobot/smolvla_base` realizado por HyeonseokE. El modelo está entrenado para ejecutar la tarea "extraer el cubo del bolsillo y colocarlo sobre el marcador objetivo" a partir de observaciones de estado y de tres cámaras. Su arquitectura combina visión, lenguaje y acción, lo que permite generar comandos de control en tiempo real con un coste computacional reducido, apto para hardware de consumo.

El modelo tiene un total de 450.046.176 parámetros y se distribuye en formato safetensors, con licencia Apache 2.0. Está pensado para integrarse en el ecosistema LeRobot, ofreciendo una solución práctica para tareas de manipulación robótica en entornos controlados. Al tratarse de un fine-tuning específico, su relevancia radica en demostrar cómo un modelo VLA compacto puede adaptarse a una tarea concreta con un número reducido de episodios de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (SmolVLA) |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo VLA compacto basado en arquitecturas transformer, disenado para consumir observaciones multimodales (estado del robot e imagenes de camaras) y producir acciones de control de baja dimensionalidad. En esta version fine-tuned, el modelo recibe como entrada un vector de estado de 6 dimensiones y tres imagenes RGB de 256x256 píxeles, correspondientes a las camaras `top` y `left_wrist` (la tercera camara no se especifica en la documentacion). La salida es un vector de accion de 6 dimensiones, ademas de una representacion alternativa `action.radian_urdf0`.

El entrenamiento se realizo mediante fine-tuning del modelo base `lerobot/smolvla_base` utilizando el dataset `HyeonseokE/extract_cube_ours_10fps`, compuesto por 100 episodios y 31.555 fotogramas a 10 FPS. La configuracion de entrenamiento incluye 24.650 pasos, batch size de 64, optimizador AdamW, learning rate de 0,0001 y semilla 3000. Se uso la version 0.6.0 de LeRobot. No se menciona el uso de tecnicas de alineacion como RLHF o DPO; se trata de un entrenamiento supervisado de aprendizaje por imitacion.

## Capacidades

- Control de un brazo robotico tipo `so101_follower` mediante la generacion de acciones de 6 dimensiones a partir de entradas visuales y de estado.
- Procesamiento de tres flujos de imagenes simultaneos a resolucion 256x256, lo que permite integrar vision multiple en la toma de decisiones.
- Ejecucion de tareas de manipulacion de objetos con supervision minima, gracias al aprendizaje por imitacion sobre demostraciones humanas.
- Soporte de inferencia en tiempo real a traves de la CLI de LeRobot, con capacidad de ejecutar la politica durante una duracion especificada o de forma indefinida.
- Integracion nativa con el ecosistema LeRobot para entrenamiento, evaluacion y despliegue en robots reales.
- Generacion de acciones directamente en el espacio de articulaciones del robot, sin necesidad de postprocesamiento adicional.

## Casos de uso

- Automatizacion de tareas de pick-and-place en entornos industriales: el modelo puede ejecutar secuencias de extraccion y colocacion de objetos en posiciones marcadas, reduciendo la necesidad de programacion explicita por cada tarea.
- Investigacion en aprendizaje por imitacion: sirve como referencia para estudiar como un modelo VLA compacto se adapta a una tarea concreta a partir de un dataset reducido (100 episodios).
- Despliegue de robots en laboratorios: la tarea de extraer un cubo de un bolsillo y colocarlo en un marcador es tipica en entornos de ensayos controlados, donde se requiere precision y repetibilidad.
- Prototipado rapido de politicas roboticas: gracias a su integracion con LeRobot, permite entrenar y evaluar nuevas tareas con poco esfuerzo de infraestructura.
- Robots de asistencia en almacenes: el modelo puede adaptarse a tareas de recogida y deposito de objetos en ubicaciones predefinidas, siempre que se disponga de las camaras adecuadas.
- Educacion y demostraciones: por su tamano reducido, es adecuado para ejecutar demos de control robotico en equipos de consumo, facilitando la ensenanza de conceptos de VLA y aprendizaje por imitacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se han proporcionado resultados de evaluacion para esta politica.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Dado que el modelo tiene 450 millones de parametros, se puede estimar que en precision FP16 ocupa aproximadamente 0,9 GB de memoria, pero el consumo real dependera del numero de camaras, la resolucion y el batch.
- GPU recomendadas: no especificadas por el autor. Al tratarse de un modelo compacto, es probable que funcione en GPUs de consumo, pero no hay datos oficiales.
- Compatibilidad con GPU de consumo: no confirmada oficialmente, aunque el objetivo declarado de SmolVLA es poder ejecutarse en hardware de consumo.
- Opciones de despliegue: el modelo se ejecuta mediante LeRobot, utilizando el comando `lerobot-rollout` con `--policy.path=HyeonseokE/smolvla_extract_cube_ours_3000_10fps`. No se mencionan otras plataformas como vLLM, llama.cpp u Ollama.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Dataset | Seed | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HyeonseokE/smolvla_extract_cube_ours_3000_10fps | 450.046.176 | extract_cube_ours_10fps | 3000 | apache-2.0 | HuggingFace |
| HyeonseokE/smolvla_extract_cube_cap_3000_10fps | no disponible | extract_cube_cap_10fps | 3000 | apache-2.0 | HuggingFace |
| HyeonseokE/smolvla_extract_cube_cap_2000_10fps | no disponible | extract_cube_cap_10fps | 2000 | apache-2.0 | HuggingFace |

Los tres modelos son fine-tunings del mismo base `lerobot/smolvla_base`, con la misma arquitectura y licencia. Las diferencias radican en el dataset utilizado (`ours` frente a `cap`) y en la semilla de entrenamiento. No se disponen de datos comparativos de rendimiento entre ellos.

## Limitaciones y advertencias

- No se han publicado resultados de evaluacion sobre el robot real, por lo que el rendimiento en produccion no esta verificado.
- El modelo esta especializado en una tarea concreta ("extraer el cubo del bolsillo y colocarlo sobre el marcador") y puede fallar en escenarios con variaciones significativas de iluminacion, posiciones de objetos o distracciones.
- Depende de una configuracion especifica de camaras (`top` y `left_wrist`); si se cambian las camaras o sus parametros, la politica puede degradarse.
- La entrada de imagenes esta limitada a resolucion 256x256 y a tres flujos visuales; no admite otros formatos sin reentrenamiento.
- No se especifican los idiomas soportados ni la longitud de contexto, lo que sugiere que el componente de lenguaje puede ser minimo o no estar documentado para este fine-tuning.
- El riesgo de alucinacion se manifiesta en la generacion de acciones incorrectas o no deseadas, especialmente fuera de la distribucion de entrenamiento.
- La licencia Apache 2.0 permite uso comercial, pero es responsabilidad del usuario verificar el cumplimiento de las condiciones de la licencia y de los derechos de terceros sobre los datasets.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/HyeonseokE/smolvla_extract_cube_ours_3000_10fps
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentacion de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentacion general de LeRobot: https://huggingface.co/docs/lerobot/index
- Dataset de entrenamiento: https://huggingface.co/datasets/HyeonseokE/extract_cube_ours_10fps
- Modelo base: https://huggingface.co/lerobot/smolvla_base
