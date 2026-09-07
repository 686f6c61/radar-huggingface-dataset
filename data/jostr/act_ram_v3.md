# JoSTR/act_ram_v3

## Resumen

El modelo JoSTR/act_ram_v3 es una política robótica de aprendizaje por imitación basada en el método ACT (Action Chunking with Transformers). Ha sido desarrollado por JoSTR y entrenado con el framework LeRobot de Hugging Face para controlar un robot de doble brazo (Dual_xArm7) en una tarea concreta: desbloquear una memoria RAM y retirarla de su zócalo. El modelo consume imágenes de tres cámaras y el estado de la articulación del robot, y predice secuencias de acciones en bloques, en lugar de pasos individuales.

La arquitectura es un transformer de tipo ACT, con un total de 51.689.104 parámetros. El contexto y la ventana de observación no están documentados explícitamente, aunque la política está diseñada para procesar secuencias de frames a 30 FPS. El modelo está publicado con licencia Apache 2.0 y pesos en formato safetensors, listo para usarse con LeRobot.

Este modelo es relevante en el ámbito de la robótica de manipulación, ya que demuestra la aplicación de ACT en una tarea de precisión con un robot dual. Su tamaño reducido y su integración nativa con LeRobot lo hacen accesible para investigadores y desarrolladores que quieran replicar o extender la política a tareas similares.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Action Chunking with Transformers, ACT) |
| Parametros totales | 51.689.104 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (modelo de politica robotica, no de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura del modelo es ACT (Action Chunking with Transformers), un método de aprendizaje por imitación que predice bloques de acciones (action chunks) en lugar de pasos individuales. Esto reduce el error de composición durante la ejecución de la política, lo que resulta en un comportamiento más estable y robusto en tareas de manipulación. El modelo procesa observaciones multimodales: un vector de estado del robot de 16 dimensiones y tres imágenes RGB de 480x640 píxeles (cámara cenital y dos cámaras en las muñecas derecha e izquierda). La salida es un vector de acción de 16 dimensiones.

El entrenamiento se realizó con el framework LeRobot (versión 0.6.2) sobre el dataset JoSTR/rm_ram_20260831_145557, compuesto por 100 episodios y 151.691 frames a 30 FPS, con la tarea "Unlock the RAM-Stick and remove it". La configuración de entrenamiento incluye 100.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-5 y seed 1000. No se han documentado técnicas de RLHF o DPO, ya que se trata de un modelo de aprendizaje por imitación supervisado.

## Capacidades

- Genera acciones de control para un robot de doble brazo (Dual_xArm7), prediciendo bloques de acciones de 16 dimensiones.
- Procesa información visual de tres cámaras simultáneas (top_down, wrist_right, wrist_left) a resolución 480x640.
- Ejecuta la tarea específica de desbloquear y retirar una memoria RAM de su zócalo.
- Integra el estado del robot como entrada adicional para la predicción de acciones.
- Está preparado para su uso con el framework LeRobot, tanto para inferencia (`lerobot-rollout`) como para re-entrenamiento (`lerobot-train`).
- No dispone de capacidades de tool calling, agentes conversacionales, ni soporte multilingüe, al tratarse de un modelo de política robótica.

## Casos de uso

- Automatización de ensamblaje de componentes electrónicos: el modelo puede utilizarse en líneas de producción donde sea necesario extraer o insertar componentes tipo RAM. Su predicción por bloques de acciones permite movimientos precisos y repetibles.
- Investigación en aprendizaje por imitación: sirve como modelo de referencia para estudiar el comportamiento de ACT en tareas de manipulación fina, especialmente con robots de doble brazo.
- Robótica de laboratorio: puede desplegarse en entornos de laboratorio para automatizar la manipulación de muestras o componentes en placas, reduciendo la intervención humana.
- Reentrenamiento para nuevas tareas: la base ACT y el dataset asociado permiten fine-tuning para tareas similares, como inserción de conectores o extracción de otros componentes, siempre que se disponga de datos teleoperados.
- Benchmark de manipulación: el modelo puede utilizarse como caso de estudio en evaluaciones comparativas de políticas robóticas, analizando éxito y precisión en la tarea de desbloqueo y extracción.
- Educación y demostraciones: por su tamaño reducido y su integración con LeRobot, es adecuado para cursos y talleres de robótica donde se quiera mostrar el flujo completo de entrenamiento e inferencia de una política real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible. Dado el tamaño del modelo (51.689.104 parámetros), la carga de pesos es ligera, pero el procesamiento de tres imágenes de 480x640 puede ser el factor limitante.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: probablemente sí, dado el tamaño reducido del modelo, aunque no hay datos oficiales de pruebas.
- Opciones de despliegue: el modelo está pensado para ejecutarse con LeRobot mediante `lerobot-rollout` en un robot real. También puede integrarse en pipelines de Hugging Face.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible.

## Limitaciones y advertencias

- La política está entrenada exclusivamente para una tarea específica ("Unlock the RAM-Stick and remove it") y un robot concreto (Dual_xArm7). No generaliza a otros robots ni a otras tareas sin reentrenamiento.
- No se han proporcionado resultados de evaluación en robot real, por lo que se desconoce la tasa de éxito.
- El dataset de entrenamiento consta de 100 episodios, lo que puede limitar la robustez frente a variaciones de posición, iluminación o distracciones.
- El modelo no soporta idiomas ni interacción textual, por lo que no es aplicable en contextos de procesamiento de lenguaje natural.
- Aunque la licencia Apache 2.0 permite uso comercial, es necesario cumplir con los términos de la licencia y atribuir adecuadamente.
- El uso en producción requiere un robot compatible con las especificaciones de hardware y una integración cuidadosa con el sistema de control.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JoSTR/act_ram_v3
- Dataset de entrenamiento: https://huggingface.co/datasets/JoSTR/rm_ram_20260831_145557
- Paper de ACT: https://huggingface.co/papers/2304.13705
- LeRobot (framework): https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
