# brian564237/act-test

## Resumen

`brian564237/act-test` es un modelo de robótica basado en Action Chunking with Transformers (ACT), un método de aprendizaje por imitación que predice secuencias cortas de acciones en lugar de pasos individuales. Ha sido entrenado con la librería LeRobot de Hugging Face y está pensado para controlar un robot manipulador tipo `so_follower` en una tarea de recogida y colocación de objetos. El modelo consume una imagen de cámara de 480x640 píxeles y el estado propioceptivo del robot (6 dimensiones) y produce un vector de acción de 6 dimensiones. Con 51,7 millones de parámetros, es un modelo compacto diseñado para ejecutarse en tiempo real en entornos de robótica.

Su relevancia radica en que ACT es uno de los métodos de aprendizaje por imitación más utilizados en robótica gracias a su capacidad para predecir chunks de acciones, lo que reduce la acumulación de errores durante la ejecución. Este modelo concreto está entrenado con 50 episodios teleoperados y publicado bajo licencia Apache 2.0, lo que permite su uso y modificación tanto en investigación como en aplicaciones comerciales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Action Chunking with Transformers (ACT) |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica a este tipo de modelo) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de robótica) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es un modelo de aprendizaje por imitación que combina un transformer con un mecanismo de atención temporal para predecir un chunk de acciones futuras (por ejemplo, 10 o 50 pasos) en lugar de una sola acción. Esto reduce la propagación de errores en tareas de manipulación de largo horizonte. El modelo consume una imagen RGB de 480x640 píxeles y un vector de estado de 6 dimensiones, y genera un vector de acción de 6 dimensiones.

El entrenamiento se realizó con 50 episodios teleoperados (14.027 frames a 30 FPS) de la tarea "Pick up the object and place it in the target area". Se usaron 1.000 pasos de entrenamiento con batch size de 2, optimizador AdamW, learning rate de 1e-5 y semilla 1000. El dataset es de origen local y no se han publicado detalles sobre su composición. No se menciona el uso de técnicas como RLHF o DPO; se trata de aprendizaje por imitación puro.

## Capacidades

- Generación de acciones de control para robótica: predice secuencias de acciones de 6 dimensiones para un robot `so_follower`.
- Percepción visual: procesa imágenes RGB de 480x640 píxeles para guiar la manipulación.
- Aprendizaje por imitación: reproduce comportamientos teleoperados con alta fidelidad en la tarea entrenada.
- Tarea específica: recogida y colocación de objetos en un área objetivo.
- Integración con LeRobot: compatible con el pipeline de entrenamiento, evaluación y despliegue de la librería.
- No soporta tool calling ni funciones de agente: es un modelo puramente de control robótico.

## Casos de uso

- Automatización de pick-and-place en líneas de montaje: el modelo puede ejecutar la tarea de recoger un objeto y colocarlo en una zona determinada, sustituyendo la programación manual de trayectorias.
- Prototipado rápido de políticas robóticas: permite entrenar y desplegar una política de manipulación con solo 50 episodios de teleoperación, lo que acelera la validación de conceptos en laboratorio.
- Investigación en aprendizaje por imitación: sirve como modelo de referencia para comparar variantes de ACT o métodos alternativos en la misma tarea.
- Robótica educativa: puede integrarse en cursos de robótica para demostrar el flujo de trabajo de LeRobot (captura de datos, entrenamiento, despliegue).
- Evaluación de robustez en entornos controlados: el modelo puede usarse para probar la resistencia de la política ante perturbaciones de iluminación o posición del objeto.
- Base para fine-tuning en tareas similares: al estar publicado con pesos safetensors, es posible ajustarlo con nuevos datos para adaptarlo a variaciones de la tarea original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que "no se han proporcionado resultados de evaluación para esta política". No se disponen de métricas de éxito en robot real ni en simulador.

## Requisitos de hardware

- VRAM estimada: no disponible. El modelo tiene 51,7M de parámetros, por lo que en FP32 ocupa aproximadamente 207 MB de memoria, y en FP16 unos 104 MB. En la práctica, la inferencia requiere además espacio para las activaciones y la entrada de imagen.
- GPU recomendadas: no se especifica. Dado su tamaño, debería ejecutarse en cualquier GPU moderna con al menos 4 GB de VRAM, como una RTX 3050 o superior.
- Compatibilidad con GPU de consumo: sí, el tamaño del modelo lo permite.
- Opciones de despliegue: LeRobot ofrece los comandos `lerobot-rollout` para ejecutar la política en el robot, con soporte para dispositivos CUDA.
- Latencia y throughput: no disponibles. Depende del hardware y de la resolución de imagen (480x640 a 30 FPS).

## Comparativa con modelos similares

No se ha publicado una comparativa con otros modelos en la información disponible. No obstante, existen otros modelos ACT entrenados con LeRobot en Hugging Face (por ejemplo, `Denryy/act_test_model` o `aractiingi/act_test_V3`) que probablemente tienen arquitectura y parámetros similares, pero no se dispone de datos comparativos de rendimiento.

## Limitaciones y advertencias

- El modelo ha sido entrenado con solo 50 episódios, por lo que su generalización a posiciones de objeto, iluminación o superficies diferentes puede ser limitada.
- No hay resultados de evaluación en robot real, por lo que el rendimiento real no está verificado.
- La tarea está restringida a "recoger el objeto y colocarlo en el área objetivo"; no es apto para tareas fuera de ese ámbito sin reentrenamiento.
- El dataset es de origen local y no se ha publicado, lo que limita la reproducibilidad del entrenamiento.
- No se han documentado sesgos o riesgos de alucinación, pero en robótica los errores de predicción pueden causar movimientos inseguros; se recomienda supervisión durante el despliegue.
- Licencia Apache 2.0 permite uso comercial, pero se deben respetar las condiciones de la licencia y citar las fuentes (ver enlaces).
- El modelo depende de la librería LeRobot y de la configuración específica del robot `so_follower`; no es portable directamente a otros robots sin ajustes.

## Enlaces

- [Hugging Face: brian564237/act-test](https://huggingface.co/brian564237/act-test)
- [Paper ACT (arXiv:2304.13705)](https://huggingface.co/papers/2304.13705)
- [LeRobot GitHub](https://github.com/huggingface/lerobot)
- [Documentación LeRobot ACT](https://huggingface.co/docs/lerobot/main/en/act)
- [Guía de instalación LeRobot](https://huggingface.co/docs/lerobot/main/en/installation)
- [Guía de hardware LeRobot](https://huggingface.co/docs/lerobot/main/en/hardware_guide)
- [Guía de despliegue LeRobot](https://huggingface.co/docs/lerobot/main/en/inference)
