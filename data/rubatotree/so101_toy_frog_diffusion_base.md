# rubatotree/so101_toy_frog_diffusion_base

## Resumen

El modelo `rubatotree/so101_toy_frog_diffusion_base` es una política de control visuomotor basada en Diffusion Policy, entrenada con el framework LeRobot para ejecutar la tarea "Grab the toy frog into the cup" (agarrar una rana de juguete y depositarla en un vaso) con un robot manipulador tipo `so_follower` (SO-101). Desarrollado por el usuario rubatotree, este modelo trata el control como un proceso generativo de difusión: en lugar de predecir una única acción, genera una trayectoria completa de acciones multi-paso, lo que resulta especialmente eficaz en tareas de manipulación con contacto.

El modelo consume observaciones de estado (6 dimensiones) y dos flujos de imagen (cámaras frontal y lateral a 480x640 píxeles) y produce acciones de 6 dimensiones. Con aproximadamente 277,8 millones de parámetros y una licencia Apache-2.0, es un ejemplo práctico de aplicación de Diffusion Policy en robótica real, publicado en el Hub de HuggingFace con el pipeline `robotics`. Su relevancia radica en que demuestra un flujo completo de entrenamiento e inferencia reproducible mediante LeRobot, con código y dataset asociados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (visuomotor control como proceso generativo de difusion) |
| Parametros totales | 277.840.246 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de control, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo no linguistico) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo implementa Diffusion Policy, descrita en el paper arXiv:2303.04137. Esta arquitectura trata el problema de control visuomotor como un proceso de denoising generativo: dado un estado observado (posición del robot) y las imágenes de las cámaras, el modelo genera iterativamente una secuencia de acciones que maximiza la probabilidad de éxito de la tarea. A diferencia de los métodos de predicción directa, la difusión produce trayectorias suaves y coherentes, lo que mejora el rendimiento en tareas que requieren contacto físico y movimientos precisos.

El entrenamiento se realizó con LeRobot (versión 0.6.1) sobre un dataset propio (`rubatotree/toy-frog-1_20260810_162412`) compuesto por 50 episodios y 15.014 frames a 30 FPS. La configuración de entrenamiento incluye 100.000 pasos, batch size de 8, optimizador Adam con learning rate 0,0001 y semilla 1000. No se menciona el uso de RLHF ni DPO; el entrenamiento es de imitación pura (behavior cloning) sobre demostraciones humanas. No se reportan innovaciones técnicas adicionales más allá de la propia arquitectura de difusión.

## Capacidades

- Control visuomotor de 6 grados de libertad para el robot SO-101, generando acciones de 6 dimensiones.
- Generación de trayectorias de acción multi-paso mediante difusión, adecuadas para manipulación con contacto.
- Procesamiento de dos cámaras simultáneas (frontal y lateral) con resolución 480x640, fusionando información visual y estado propioceptivo.
- Inferencia en tiempo real a 30 FPS, compatible con el pipeline de LeRobot para despliegue en robot real.
- Entrenado específicamente para la tarea de agarrar un objeto (rana de juguete) y colocarlo en un recipiente.
- No soporta tool calling, agentes ni razonamiento simbólico; es un modelo puramente motor.

## Casos de uso

- Automatización de tareas de pick-and-place en entornos controlados: el modelo puede ejecutar la tarea de agarrar un objeto pequeño y depositarlo en un contenedor, replicando el comportamiento aprendido en el dataset. Es adecuado para líneas de montaje o laboratorios de robótica.
- Investigación en imitación learning: sirve como punto de partida para estudiar Diffusion Policy en hardware real, comparando su rendimiento con otros métodos (ACT, etc.) usando el mismo robot y dataset.
- Desarrollo de nuevas tareas por transferencia: aunque está entrenado para una tarea concreta, puede servir como base para fine-tuning con datasets adicionales de tareas similares, reduciendo el tiempo de entrenamiento.
- Validación de pipelines de LeRobot: el modelo y su dataset asociado permiten probar el flujo completo de registro de datos, entrenamiento y rollout en un robot SO-101, siendo útil para equipos que adoptan LeRobot.
- Demostraciones educativas en robótica: su tamaño moderado (277M parámetros) y licencia Apache-2.0 facilitan su uso en cursos o talleres sobre aprendizaje por imitación y control generativo.
- Benchmarking de políticas de difusión: al estar publicado con métricas de entrenamiento y dataset, permite reproducir experimentos y comparar configuraciones de hiperparámetros en la misma tarea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real ("No evaluation results have been provided for this policy yet"). No hay datos de tasa de éxito, número de ensayos ni comparativas con otros modelos.

## Requisitos de hardware

- No se proporcionan especificaciones oficiales de hardware en la documentación del modelo.
- Dado el tamaño del modelo (277,8 millones de parámetros) y la entrada de dos imágenes de 480x640, se estima que una GPU con al menos 8 GB de VRAM sería suficiente para inferencia en tiempo real, aunque este dato no está confirmado por el autor.
- El entrenamiento (100.000 pasos con batch size 8) probablemente requiera una GPU con 16-24 GB de VRAM, pero no hay confirmación oficial.
- El despliegue se realiza mediante el framework LeRobot, que soporta inferencia en GPU (CUDA) y también en CPU para pruebas de baja velocidad.
- No se mencionan opciones de despliegue con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje; el entorno recomendado es LeRobot con su CLI (`lerobot-rollout`).
- La latencia y el throughput no están documentados; dependerán de la GPU utilizada y de la resolución de las cámaras.

## Comparativa con modelos similares

No se dispone de información sobre otros modelos de la misma categoría (políticas de difusión para el robot SO-101) con los que comparar directamente. El campo de políticas visuomotoras basadas en difusión incluye alternativas como ACT (Action Chunking with Transformers) o modelos de comportamiento clonado clásicos, pero no hay datos públicos de rendimiento de este modelo frente a ellos en la misma tarea. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para la tarea "Grab the toy frog into the cup" y no generaliza a otras tareas sin reentrenamiento o fine-tuning.
- Depende críticamente de la configuración de cámaras y del robot SO-101; cualquier cambio en la posición de las cámaras, iluminación o calibración del robot puede degradar el rendimiento.
- No se han reportado evaluaciones en robot real, por lo que el rendimiento real en producción es desconocido.
- El dataset de entrenamiento es pequeño (50 episodios) y probablemente capturado en un único entorno, lo que puede introducir sesgos de escena y limitar la robustez ante variaciones.
- Al ser un modelo de imitación, puede presentar alucinaciones de acciones (trayectorias irreales) si las observaciones difieren mucho de las del entrenamiento.
- La licencia Apache-2.0 permite uso comercial, pero el modelo no incluye garantías de seguridad para operación autónoma en entornos no controlados.
- No se proporcionan pesos cuantizados ni formatos alternativos; solo safetensors.

## Enlaces

- Repositorio del modelo en HuggingFace: https://huggingface.co/rubatotree/so101_toy_frog_diffusion_base
- Paper de Diffusion Policy: https://huggingface.co/papers/2303.04137
- Dataset de entrenamiento: https://huggingface.co/datasets/rubatotree/toy-frog-1_20260810_162412
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio de LeRobot en GitHub: https://github.com/huggingface/lerobot
