# skunda/piper_act_40k

## Resumen

El modelo `skunda/piper_act_40k` es una política de control robótico basada en el método Action Chunking with Transformers (ACT), desarrollada por el usuario skunda y entrenada con la librería LeRobot de Hugging Face. ACT es una técnica de aprendizaje por imitación que predice secuencias de acciones (chunks) en lugar de pasos individuales, lo que permite al robot ejecutar tareas de manipulación con mayor fluidez y precisión. Este modelo concreto está especializado en la tarea de recoger un cubo rojo y colocarlo en un contenedor azul, utilizando un brazo robótico Agilex Piper de 7 grados de libertad.

El modelo cuenta con 51,67 millones de parámetros y acepta entradas multimodales: el estado del robot (7 dimensiones) y tres imágenes de cámaras (muñeca, extrínseca y cenital) de 480x640 píxeles. Fue entrenado sobre un dataset propio de 21 episodios teleoperados con 37.397 fotogramas a 30 FPS. Su relevancia radica en ser un ejemplo práctico de aplicación de ACT en un robot real, con un tamaño compacto que lo hace viable para despliegue en hardware de gama media. La licencia Apache 2.0 permite su uso comercial y modificación sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking Transformer) |
| Parametros totales | 51.670.663 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de robótica, no de texto) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura ACT (Action Chunking Transformer), descrita en el paper arXiv:2304.13705. ACT combina un codificador de visión (para procesar las tres imágenes de entrada) con un transformer que predice un chunk de acciones futuras (en este caso, vectores de 7 dimensiones correspondientes a las articulaciones del brazo). El entrenamiento se realizó mediante aprendizaje por imitación sobre datos teleoperados, utilizando el framework LeRobot en su versión 0.6.2. La configuración de entrenamiento incluyó 10.000 pasos, batch size de 4, optimizador AdamW con learning rate de 1e-5 y semilla 1000. El dataset de entrenamiento, `skunda/manualdata_20epredcube_picknplace`, contiene 21 episodios de la tarea "pick up the red block and place in blue bin", con un total de 37.397 fotogramas a 30 FPS. No se menciona el uso de RLHF, DPO ni otras técnicas de refinamiento posteriores al aprendizaje supervisado.

## Capacidades

- Control de brazo robótico de 7 grados de libertad (Agilex Piper) mediante predicción de chunks de acciones.
- Percepción visual multimodal: procesa simultáneamente tres cámaras (muñeca, extrínseca y cenital) con resolución 480x640.
- Ejecución de tareas de pick-and-place: recoger un objeto (cubo rojo) y depositarlo en una ubicación objetivo (contenedor azul).
- Aprendizaje por imitación: la política replica comportamientos demostrados por teleoperación.
- Inferencia en tiempo real: al ser un modelo compacto (51,7M parámetros), es adecuado para control en bucle cerrado con latencias bajas.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües, al ser un modelo puramente robótico.

## Casos de uso

- Automatización de tareas de manipulación en entornos industriales: el modelo puede integrarse en líneas de montaje para realizar operaciones repetitivas de recogida y colocación de piezas, gracias a su capacidad de predecir secuencias de acciones completas.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar la transferencia de políticas ACT entre diferentes robots o entornos, dado su tamaño reducido y su entrenamiento reproducible con LeRobot.
- Prototipado rápido de aplicaciones robóticas: desarrolladores pueden usar este modelo como base para adaptar la tarea a otros objetos o configuraciones, reentrenando con datasets propios.
- Demostraciones educativas en robótica: su simplicidad y la disponibilidad del código de entrenamiento lo hacen útil para enseñar conceptos de aprendizaje por refuerzo e imitación en cursos universitarios.
- Despliegue en robots de bajo coste: al requerir pocos recursos computacionales, puede ejecutarse en GPUs de gama media, facilitando su uso en laboratorios con presupuesto limitado.
- Benchmarking de algoritmos de control: investigadores pueden comparar el rendimiento de ACT frente a otros métodos (por ejemplo, Diffusion Policy) utilizando este modelo como referencia en la misma tarea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real. No hay datos de éxito en tareas, ni comparaciones con otros modelos.

## Requisitos de hardware

- No se dispone de requisitos oficiales de hardware publicados por el autor.
- Dado el tamaño del modelo (51,7M parámetros) y la entrada de imágenes de 480x640, se estima que la inferencia puede ejecutarse en GPUs con al menos 4 GB de VRAM, aunque esta cifra es una estimación razonable basada en el tamaño del modelo y no en mediciones confirmadas.
- El entrenamiento se realizó con batch size 4, lo que sugiere que una GPU con 8-12 GB de VRAM (por ejemplo, RTX 3070/3080) sería suficiente para reentrenar, aunque no hay confirmación oficial.
- Para despliegue, LeRobot ofrece soporte para inferencia en CPU y GPU, y el modelo puede ejecutarse mediante los scripts `lerobot-rollout` y `lerobot-train` del ecosistema LeRobot.
- No se han reportado latencias ni throughput específicos.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos de la misma categoría. Existen otros repositorios en Hugging Face con políticas ACT para el brazo Piper (por ejemplo, `aloyalplayer/piper-act-grasp-model` o `intuitioncore/piper_act_test`), pero no se han publicado métricas de rendimiento ni especificaciones detalladas que permitan una comparación objetiva. El modelo base ACT (paper arXiv:2304.13705) es el referente metodológico, pero no se dispone de una implementación de referencia con la que comparar directamente.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para una tarea muy específica (recoger un cubo rojo y colocarlo en un contenedor azul) con un dataset de solo 21 episodios. Su capacidad de generalización a otras tareas, objetos o posiciones es muy limitada.
- No se han publicado resultados de evaluación en robot real, por lo que se desconoce su tasa de éxito real y su robustez ante variaciones de iluminación, posición de objetos o distracciones.
- El dataset de entrenamiento es pequeño y probablemente presenta sesgos hacia las condiciones específicas de captura (posición de cámaras, fondo, etc.). El modelo puede fallar si se modifica el entorno.
- Al ser un modelo de robótica, no tiene capacidades de lenguaje ni de razonamiento simbólico; no debe utilizarse para tareas de procesamiento de texto.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento del modelo en entornos de producción.
- No se especifican requisitos de hardware oficiales, por lo que el despliegue en sistemas con recursos limitados podría requerir pruebas adicionales.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/skunda/piper_act_40k)
- [Paper de ACT (arXiv:2304.13705)](https://huggingface.co/papers/2304.13705)
- [Dataset de entrenamiento](https://huggingface.co/datasets/skunda/manualdata_20epredcube_picknplace)
- [Repositorio de LeRobot](https://github.com/huggingface/lerobot)
- [Guía de ACT en LeRobot](https://huggingface.co/docs/lerobot/main/en/act)
- [Repositorio GitHub Piper-ACT (zhitaoqiu)](https://github.com/zhitaoqiu/Piper-ACT)
- [Repositorio GitHub piper_act (ingyu0808)](https://github.com/ingyu0808/piper_act)
