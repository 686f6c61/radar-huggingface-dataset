# go234/smolvla_pick-cube

## Resumen

SmolVLA es un modelo compacto de vision-lenguaje-acción (VLA) desarrollado por Hugging Face dentro del ecosistema LeRobot, diseñado para control robótico mediante imitación con un coste computacional reducido. Este repositorio concreto, `go234/smolvla_pick-cube`, es un ajuste fino del modelo base `lerobot/smolvla_base` sobre un conjunto de datos propio de 50 episodios y 24.423 fotogramas a 30 FPS, orientado a la tarea específica de coger un cubo y depositarlo en una caja.

El modelo consume observaciones multimodales (el estado del robot de 6 dimensiones y tres cámaras RGB de 256x256) y produce un vector de acción de 6 dimensiones, siguiendo el paradigma de política de imitación extremo a extremo. Con 450 millones de parámetros y un peso en repositorio de 0,9 GB, está pensado para ejecutarse en hardware de consumo, lo que lo hace accesible para laboratorios y desarrolladores que no disponen de clústeres de GPU.

Su relevancia radica en que demuestra el flujo completo de LeRobot: grabación de datos con un robot `so_follower`, entrenamiento de una política VLA y despliegue mediante `lerobot-rollout`. Es un ejemplo práctico y reproducible de cómo adaptar un modelo fundacional de robótica a una tarea concreta con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje-acción (VLA) compacta, según SmolVLA (arXiv:2506.01844) |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es una arquitectura de visión-lenguaje-acción que combina un codificador visual, un modelo de lenguaje compacto y un cabezal de acciones para generar comandos motores directamente a partir de observaciones e instrucciones en lenguaje natural. El modelo base `lerobot/smolvla_base` se ha preentrenado sobre datos robóticos diversos y este repositorio lo ajusta mediante aprendizaje por imitación supervisado sobre el dataset `go234/cube-box_20261013_041703`.

El ajuste fino se realizó durante 20.000 pasos con un tamaño de lote de 8, optimizador AdamW, tasa de aprendizaje 0,0001 y semilla 1000, usando LeRobot 0.6.0. El dataset de entrenamiento contiene 50 episodios y 24.423 fotogramas a 30 FPS de un robot `so_follower` con tres cámaras (`cam1`, `cam2`, `cam3`), todos ellos correspondientes a la tarea "Pick up the cube and put it in the box". No se dispone de información sobre el número de tokens de entrenamiento del modelo base ni sobre si se emplearon técnicas de RLHF o DPO.

## Capacidades

- Generación de acciones robóticas de 6 dimensiones a partir de observaciones visuales y de estado del robot.
- Percepción visual multimodal mediante tres cámaras RGB de 256x256 píxeles.
- Condicionamiento por instrucción en lenguaje natural (la tarea se pasa como texto al ejecutar la política).
- Control de robots del tipo `so_follower` en tareas de manipulación pick-and-place.
- Aprendizaje por imitación extremo a extremo: no requiere ingeniería manual de controladores.
- Ejecución en hardware de consumo gracias a su tamaño compacto de 450 millones de parámetros.
- No se ha documentado soporte de tool calling, function calling, agentes multi-paso ni capacidades multilingües en la información disponible.

## Casos de uso

- Manipulación pick-and-place en laboratorio: el modelo ejecuta la secuencia de coger un cubo y colocarlo en una caja, sirviendo como referencia reproducible para validar un montaje de robot `so_follower` con tres cámaras.
- Docencia e investigación en robótica: permite ilustrar el ciclo completo de imitación (grabación, entrenamiento, despliegue) con un coste de cómputo bajo y en una sola GPU de consumo.
- Prototipado rápido de políticas VLA: al partir de `lerobot/smolvla_base`, un equipo puede ajustar el modelo a una nueva tarea con un dataset pequeño (50 episodios) y desplegarlo en minutos.
- Benchmark interno de infraestructura robótica: sirve para medir latencia y fiabilidad de un pipeline LeRobot antes de escalar a tareas más complejas.
- Automatización de tareas de clasificación de objetos: con datos adicionales, la misma arquitectura puede adaptarse a tareas de recogida y depósito en entornos controlados.
- Demostraciones y validación de hardware: útil para comprobar que cámaras, brazos y calibración funcionan correctamente antes de invertir en datasets mayores.
- Base para experimentos de generalización: permite estudiar cómo se comporta una política VLA compacta ante cambios de posición, iluminación o distracciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 450 millones de parámetros en safetensors, el peso ronda los 0,9 GB, por lo que en fp32 necesitaría aproximadamente 1,8 GB y en fp16 alrededor de 0,9 GB, a lo que hay que sumar el coste de los codificadores visuales y las activaciones.
- GPU recomendadas: no disponible; por el tamaño del modelo, es razonable esperar que funcione en GPU de consumo, pero el fabricante no lo especifica.
- Cabe en GPU de consumo: probablemente sí, dado el tamaño, aunque no hay confirmación oficial.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para ejecución y `lerobot-train` para entrenamiento). No se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política robótica.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| go234/smolvla_pick-cube | 450.046.176 | no disponible | Pick-and-place con `so_follower` | apache-2.0 | Hugging Face |
| lerobot/smolvla_base | no disponible | no disponible | Política VLA base para ajuste fino | no disponible | Hugging Face |
| Otras políticas LeRobot (ACT, Diffusion Policy) | no disponible | no disponible | Imitación robótica | no disponible | Hugging Face / GitHub |

La comparación con alternativas concretas no está disponible en la información proporcionada; el modelo base `lerobot/smolvla_base` es la referencia natural, ya que este repositorio es un ajuste fino del mismo.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para la tarea "Pick up the cube and put it in the box" con un robot `so_follower` y tres cámaras concretas; no generalizará a otras tareas sin reentrenamiento.
- No se han publicado resultados de evaluación en robot real, por lo que se desconoce su tasa de éxito.
- El dataset de entrenamiento es muy pequeño (50 episodios), lo que aumenta el riesgo de sobreajuste y de baja robustez ante cambios de iluminación, posición de objetos o distracciones.
- No hay información sobre sesgos, alucinaciones ni comportamiento fuera de distribución; en robótica, los fallos pueden causar daños físicos, por lo que se recomienda supervisión humana.
- La licencia apache-2.0 permite uso comercial, pero el modelo base y el dataset pueden tener condiciones adicionales que no se detallan.
- No se especifican idiomas soportados ni capacidades de contexto largo; el condicionamiento por lenguaje se limita a la instrucción de la tarea.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que no ha sido validado por la comunidad.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/go234/smolvla_pick-cube)
- [Modelo base lerobot/smolvla_base](https://huggingface.co/lerobot/smolvla_base)
- [Paper SmolVLA (arXiv:2506.01844)](https://huggingface.co/papers/2506.01844)
- [Dataset de entrenamiento](https://huggingface.co/datasets/go234/cube-box_20261013_041703)
- [Guía de LeRobot para SmolVLA](https://huggingface.co/docs/lerobot/main/en/smolvla)
- [Documentación de LeRobot](https://huggingface.co/docs/lerobot/index)
- [Repositorio LeRobot en GitHub](https://github.com/huggingface/lerobot)
- [Documentación de inferencia y rollout](https://huggingface.co/docs/lerobot/main/en/inference)
- [Visualizador del dataset](https://huggingface.co/spaces/lerobot/visualize_dataset?path=go234/cube-box_20261013_041703)
