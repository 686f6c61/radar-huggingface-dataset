# samanthalhy/so100_act_strawberry_2

## Resumen

El modelo `samanthalhy/so100_act_strawberry_2` es una política de control robótico desarrollada por Samantha Lee (samanthalhy) mediante aprendizaje por imitación. Utiliza la arquitectura ACT (Action Chunking with Transformers), descrita en el paper arxiv:2304.13705, que predice fragmentos de acciones en lugar de pasos individuales, lo que mejora la estabilidad y precisión en tareas de manipulación. El modelo está entrenado con LeRobot, la biblioteca de aprendizaje por imitación de Hugging Face, y está diseñado para controlar un brazo robótico de 6 grados de libertad SO100 (so100_follower).

La tarea objetivo es dar forma a fresas para formar una estructura cohesiva, a partir de demostraciones teleoperadas registradas con tres cámaras (frontal, superior y de mano). El modelo tiene 51.668.614 parámetros y un tamaño de repositorio de 0.2 GB, lo que lo hace ligero y apto para experimentación en hardware de consumo. Publicado con licencia Apache 2.0, es un recurso abierto para la comunidad de robótica que busca reutilizar políticas preentrenadas o entrenar las suyas propias con LeRobot.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parámetros totales | 51.668.614 |
| Parámetros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

Nota: al tratarse de un modelo de política robótica, los conceptos de "longitud de contexto" e "idiomas soportados" no son directamente aplicables.

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación basado en transformers, que aprende a generar acciones a partir de observaciones visuales y de estado. La política está compuesta por un codificador y un decodificador: el codificador procesa las imágenes de las tres cámaras (front, top, hand) y el estado del robot, mientras que el decodificador produce un fragmento de acciones (action chunk) de 6 dimensiones que se ejecuta de forma secuencial. Este enfoque reduce la acumulación de errores típica de los métodos que predicen una sola acción.

El entrenamiento se realizó con el dataset `samanthalhy/so100_strawberry_2`, compuesto por 50 episodios teleoperados y 70.492 fotogramas a 30 FPS. La configuración de entrenamiento incluye 100.000 pasos, tamaño de lote 8, optimizador AdamW, tasa de aprendizaje 1e-5 y semilla 1000, con la versión 0.6.2 de LeRobot. El modelo se entrenó para la tarea específica de dar forma a todas las fresas para formar una estructura altamente cohesiva. No se mencionan técnicas de RLHF, DPO ni decodificación especulativa; es un modelo de imitación supervisada.

## Capacidades

- Control de un brazo robótico SO100 de 6 grados de libertad, generando acciones continuas de 6 dimensiones.
- Percepción visual multicámara: usa tres entradas de imagen (480x640) de las cámaras frontal, superior y de mano.
- Predicción de acciones por fragmentos (action chunking), lo que permite ejecutar movimientos suaves y coordinados.
- Aprendizaje por imitación a partir de demostraciones humanas teleoperadas, sin necesidad de programar trayectorias manualmente.
- Entrenamiento y despliegue integrados con LeRobot, lo que facilita la reproducción, el fine-tuning y el uso en otros robots compatibles.
- No soporta tool calling, function calling, razonamiento simbólico ni generación de texto: es un modelo de control motor, no un modelo de lenguaje.

## Casos de uso

- Manipulación de objetos blandos en investigación: el modelo demuestra que se puede aprender a dar forma a fresas, lo que puede adaptarse a tareas de amasado, moldeado o manipulación de alimentos en laboratorios de robótica.
- Prototipado de políticas por imitación: sirve como referencia para entrenar nuevas políticas ACT con LeRobot, usando el mismo pipeline y comparando el rendimiento con este modelo preentrenado.
- Automatización de tareas de pick-and-place en entornos de mesa: con la configuración de tres cámaras, el modelo puede usarse para recoger y colocar objetos en posiciones concretas tras reentrenarlo con un dataset adecuado.
- Robots educativos: al ser ligero (0.2 GB) y de código abierto, puede ejecutarse en plataformas SO100 de bajo coste para enseñar aprendizaje por imitación en cursos de robótica.
- Benchmark de políticas de control: permite evaluar la robustez del action chunking frente a métodos de control punto a punto en tareas con objetos deformables.
- Desarrollo de asistentes robóticos de cocina: la capacidad de manipular frutas y verduras sugiere aplicaciones en preparación automatizada de alimentos, siempre que se cuente con un entorno controlado y datos suficientes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del autor indica explícitamente que no se han proporcionado resultados de evaluación para esta política. Por tanto, se desconoce la tasa de éxito en el robot real y no es posible comparar numéricamente su rendimiento con otros modelos.

## Requisitos de hardware

- No se han publicado requisitos oficiales de hardware para este modelo.
- Con 51.668.614 parámetros y un peso de 0.2 GB en safetensors, el modelo es pequeño y puede almacenarse en cualquier equipo con pocos recursos.
- La carga de las imágenes de 480x640 de tres cámaras durante la inferencia puede requerir una GPU con suficiente memoria para los tensores de entrada; no se dispone de una cifra exacta de VRAM.
- Se puede ejecutar en GPU de consumo (por ejemplo, una RTX 3060 o superior) para obtener respuestas en tiempo real, aunque no hay datos oficiales que lo confirmen.
- El despliegue se realiza mediante la biblioteca LeRobot, usando el comando `lerobot-rollout` con la configuración `--strategy.type=base` y `--policy.path=samanthalhy/so100_act_strawberry_2`.
- No aplican motores de inferencia para modelos de lenguaje como vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa completa. El modelo pertenece a la familia de políticas ACT, que comparten la misma arquitectura transformer encoder-decoder y la estrategia de action chunking. En HuggingFace existen otros modelos del mismo autor (por ejemplo, `samanthalhy/so100_act_herding_3` o `eval_so100_herding_3_v1_act`), pero no se han encontrado especificaciones técnicas ni resultados de benchmarks que permitan establecer una comparación rigurosa.

## Limitaciones y advertencias

- No hay resultados de evaluación en el robot real, por lo que la tasa de éxito y la robustez del modelo son desconocidas.
- El modelo fue entrenado con un dataset pequeño (50 episodios, 70.492 fotogramas) y para una tarea muy concreta; puede no generalizar a objetos, posiciones o condiciones de iluminación distintas sin reentrenamiento.
- Depende de la configuración exacta de las cámaras (frontal, superior, de mano) y de la calibración del robot SO100; si se usan cámaras o resoluciones diferentes, el rendimiento puede degradarse.
- No es un modelo de lenguaje: no soporta entradas de texto, tool calling ni razonamiento de alto nivel.
- La licencia Apache 2.0 permite el uso comercial, pero el usuario es responsable de validar el rendimiento del modelo en su propio entorno.
- Se recomienda verificar el estado del repositorio en HuggingFace, ya que el modelo puede haber sido actualizado o reentrenado con posterioridad a los datos disponibles.

## Enlaces

- Página del modelo en HuggingFace: https://huggingface.co/samanthalhy/so100_act_strawberry_2
- Dataset de entrenamiento: https://huggingface.co/datasets/samanthalhy/so100_strawberry_2
- Paper de ACT (Action Chunking with Transformers): https://huggingface.co/papers/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Visualización del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=samanthalhy/so100_strawberry_2
