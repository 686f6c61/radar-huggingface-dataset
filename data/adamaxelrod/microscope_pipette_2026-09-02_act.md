# AdamAxelrod/microscope_pipette_2026-09-02_act

## Resumen

Este modelo es una política de aprendizaje por imitación basada en Action Chunking with Transformers (ACT), entrenada para controlar un brazo robótico Meca500 en la tarea de mover una pipeta bajo un microscopio. El modelo fue desarrollado por AdamAxelrod y publicado en HuggingFace bajo licencia Apache 2.0, utilizando el framework LeRobot de HuggingFace para su entrenamiento y despliegue.

La arquitectura ACT, propuesta en el paper arXiv:2304.13705, predice secuencias de acciones (action chunks) en lugar de acciones individuales, lo que mejora la estabilidad y precisión del control robótico en tareas de manipulación fina. El modelo procesa tres flujos visuales simultáneos (cámara cenital, cámara de muñeca y cámara de microscopio) junto con el estado del robot (posición de las articulaciones), y genera comandos de acción de 7 dimensiones.

Con aproximadamente 51,7 millones de parámetros, este modelo es relativamente ligero en comparación con los grandes modelos de lenguaje, pero está especializado en una tarea robótica concreta. Su relevancia radica en que demuestra la aplicación práctica de técnicas de aprendizaje por imitación en entornos de laboratorio, donde la precisión micrométrica es crítica. El modelo fue entrenado con 50 episodios teleoperados que suman 26.455 fotogramas a 20 FPS.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 51.669.639 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica, modelo de vision-accion) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es una arquitectura basada en transformers diseñada especificamente para aprendizaje por imitacion en robotica. A diferencia de los metodos que predicen una sola accion por paso de tiempo, ACT predice un "chunk" o secuencia de acciones futuras, lo que reduce la acumulacion de errores y mejora la coherencia del movimiento. El modelo utiliza un codificador de vision para procesar las imagenes de las tres camaras y un codificador de estado para la informacion proprioceptiva del robot, fusionando ambas modalidades para generar los comandos de accion.

El entrenamiento se realizo con el framework LeRobot version 0.5.2, utilizando el optimizador AdamW con una tasa de aprendizaje de 1e-05, batch size de 8 y 100.000 pasos de entrenamiento. El dataset de entrenamiento, disponible en HuggingFace como AdamAxelrod/microscope_pipette_2026-09-02, contiene 50 episodios de teleoperacion con 26.455 fotogramas a 20 FPS, todos etiquetados con la tarea "move_pipette_under_microscope". No se menciona el uso de RLHF, DPO u otras tecnicas de refinamiento post-entrenamiento; se trata de un entrenamiento puramente supervisado de imitacion.

## Capacidades

- Control robotico de precision: genera comandos de accion de 7 dimensiones para el brazo Meca500, permitiendo movimientos finos de una pipeta bajo un microscopio.
- Fusion de multiples modalidades visuales: procesa simultaneamente tres flujos de camara (cenital, muñeca y microscopio) con resoluciones de 480x640 y 360x640 pixeles.
- Integracion estado-imagen: combina informacion visual con el estado de las articulaciones del robot (6 dimensiones) para tomar decisiones de control.
- Prediccion por chunks: genera secuencias de acciones en lugar de acciones individuales, mejorando la suavidad y estabilidad del movimiento.
- Ejecucion en tiempo real: disenado para inferencia a 20 FPS, compatible con los requisitos de control robotico en vivo.
- Reproducibilidad: entrenado con semilla fija (seed 1000) y configuracion documentada, facilitando la replicacion de resultados.

## Casos de uso

- Automatizacion de laboratorios biologicos: el modelo puede posicionar automaticamente pipetas bajo microscopios para tareas de dispensacion de liquidos, reduciendo la intervencion manual y mejorando la repetibilidad.
- Preparacion de muestras para microscopia: en entornos de investigacion, el robot puede colocar muestras en la posicion optima para su observacion, liberando tiempo del personal cientifico.
- Manipulacion de instrumentos de precision: la arquitectura ACT con prediccion por chunks es adecuada para tareas que requieren movimientos suaves y precisos, como la alineacion de instrumentos bajo magnificacion.
- Investigacion en aprendizaje por imitacion: sirve como punto de partida para experimentos con el framework LeRobot, permitiendo a otros investigadores reproducir y extender los resultados.
- Pruebas de robustez en robotica: al estar entrenado con datos teleoperados, puede evaluarse la transferencia de politicas de imitacion a entornos con variaciones en iluminacion o posicion de objetos.
- Desarrollo de sistemas de teleoperacion asistida: el modelo puede integrarse en sistemas donde el robot ejecuta la tarea de forma autonoma tras una demostracion inicial del operador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no hay resultados de evaluacion: "No evaluation results have been provided for this policy yet". No se proporcionan metricas de exito en tareas reales ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Dado el tamano del modelo (51,7 millones de parametros), se estima que cabria en GPUs con 4-8 GB de VRAM en precision FP32, aunque no se confirma oficialmente.
- GPU recomendadas: no se especifican modelos concretos. Por el tamano del modelo, una GPU de gama media como RTX 3060 o superior seria suficiente para inferencia.
- Compatibilidad con consumer GPU: probablemente si, dado el reducido numero de parametros, aunque no se confirma en la documentacion.
- Opciones de despliegue: el modelo se integra con el framework LeRobot, que soporta inferencia en GPU via PyTorch. Los comandos de rollout se ejecutan con `lerobot-rollout` y requieren el robot Meca500 conectado.
- Latencia y throughput: no disponibles. El modelo fue entrenado con datos a 20 FPS, lo que sugiere que la inferencia debe completarse en menos de 50 ms por paso para operar en tiempo real.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa con otros modelos de la misma categoria. El campo de politicas de aprendizaje por imitacion para robotica es amplio, con alternativas como Diffusion Policy o Behavior Transformers, pero no se han encontrado datos comparables en la informacion proporcionada. La comparativa queda pendiente de futuras evaluaciones publicadas.

## Limitaciones y advertencias

- Sin resultados de evaluacion: no se ha verificado la tasa de exito del modelo en el robot real, por lo que su rendimiento efectivo es desconocido.
- Especializacion limitada: el modelo esta entrenado exclusivamente para la tarea "move_pipette_under_microscope" con el robot Meca500; no es generalizable a otras tareas o robots sin reentrenamiento.
- Dependencia del setup de camaras: las tres camaras (cenital, muñeca y microscopio) deben estar configuradas exactamente como en el entrenamiento; cambios en angulos, iluminacion o resolucion pueden degradar el rendimiento.
- Dataset reducido: 50 episodios es un volumen limitado para aprendizaje por imitacion, lo que puede afectar la robustez ante variaciones en el entorno.
- Sin soporte de idiomas: al ser un modelo de control robotico, no procesa lenguaje natural ni tiene capacidades conversacionales.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero el usuario debe verificar que el hardware y el dataset asociado cumplen con las restricciones aplicables.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AdamAxelrod/microscope_pipette_2026-09-02_act
- Dataset de entrenamiento: https://huggingface.co/datasets/AdamAxelrod/microscope_pipette_2026-09-02
- Dataset general (mismo autor): https://huggingface.co/datasets/AdamAxelrod/microscope_pipette
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Framework LeRobot: https://github.com/huggingface/lerobot
- Documentacion de LeRobot ACT: https://huggingface.co/docs/lerobot/main/en/act
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware de LeRobot: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Referencia de comandos CLI de LeRobot: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de rollout: https://huggingface.co/docs/lerobot/main/en/inference
