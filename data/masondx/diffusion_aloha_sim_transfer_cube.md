# masondx/diffusion_aloha_sim_transfer_cube

## Resumen

El modelo `masondx/diffusion_aloha_sim_transfer_cube` es una política de control robótico basada en Diffusion Policy, entrenada con el framework LeRobot de Hugging Face. Está diseñada para la tarea de manipulación bimanual "recoger el cubo con el brazo derecho y transferirlo al brazo izquierdo" en el entorno de simulación ALOHA. El modelo emplea un proceso generativo de difusión para producir trayectorias de acción suaves y multi-paso, una técnica especialmente adecuada para tareas de manipulación con contacto.

Desarrollado por el usuario masondx, este modelo se publica bajo licencia Apache 2.0 y se distribuye en formato safetensors. Con 263 millones de parámetros y un tamaño de repositorio de 1,1 GB, representa un ejemplo de aplicación de Diffusion Policy a la robótica de imitación. Su relevancia radica en que permite reproducir y estudiar el comportamiento de este tipo de políticas en un entorno simulado estandarizado, facilitando la investigación en aprendizaje por imitación y transferencia sim-to-real.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (red de difusión para control visuomotor) |
| Parametros totales | 263.450.374 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de robótica, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo implementa Diffusion Policy, un enfoque que trata el control visuomotor como un proceso generativo de difusión. En lugar de predecir directamente una acción, el modelo genera iterativamente una secuencia de acciones a partir de ruido, condicionado por observaciones visuales y del estado del robot. Esta arquitectura permite producir trayectorias suaves y coherentes, lo que resulta beneficioso en tareas que requieren contacto físico y coordinación bimanual.

El entrenamiento se realizó con el dataset `lerobot/aloha_sim_transfer_cube_human`, que contiene 50 episodios y 20 000 fotogramas a 50 FPS, capturados con una cámara superior (`top`) en el robot ALOHA. La configuración de entrenamiento incluye 100 000 pasos, tamaño de lote 8, optimizador Adam con tasa de aprendizaje 0,0001 y semilla 1000, utilizando la versión 0.6.2 de LeRobot. No se especifica el uso de técnicas como RLHF o DPO, ya que se trata de aprendizaje por imitación supervisado.

## Capacidades

- Control visuomotor: el modelo recibe imágenes de una cámara superior (resolución 480×640) y el estado del robot (14 dimensiones), y produce acciones de 14 dimensiones para los brazos del robot ALOHA.
- Generación de trayectorias de acción: gracias a la difusión, genera secuencias de acciones multi-paso, lo que mejora la suavidad y la robustez en tareas de manipulación.
- Manipulación bimanual: está entrenado específicamente para la transferencia de un cubo entre dos brazos, una tarea que requiere coordinación y control fino.
- Aprendizaje por imitación: el modelo se entrena a partir de demostraciones humanas, por lo que no requiere ingeniería de recompensas ni interacción con el entorno durante el entrenamiento.
- Integración con LeRobot: se puede cargar y ejecutar directamente mediante las herramientas de LeRobot, tanto para inferencia como para reentrenamiento.
- No soporta tool calling, agentes ni razonamiento multi-paso en el sentido de los modelos de lenguaje; su ámbito es exclusivamente el control robótico.

## Casos de uso

- Investigación en aprendizaje por imitación: el modelo sirve como punto de partida para estudiar el comportamiento de Diffusion Policy en tareas de manipulación, comparando con otras arquitecturas como ACT.
- Transferencia sim-to-real: aunque entrenado en simulación, puede utilizarse como referencia para evaluar estrategias de adaptación a entornos reales con el robot ALOHA.
- Desarrollo de políticas bimanuales: la tarea de transferencia de cubo es un banco de pruebas estándar para algoritmos de control bimanual; este modelo permite validar nuevas ideas en un entorno reproducible.
- Benchmarking de frameworks de robótica: al estar integrado con LeRobot, facilita la comparación de rendimiento entre diferentes políticas y configuraciones de entrenamiento.
- Educación y formación: sirve como ejemplo didáctico para enseñar conceptos de diffusion models aplicados a robótica, con un pipeline completo de entrenamiento e inferencia documentado.
- Reproducción de experimentos: investigadores pueden replicar los resultados del paper de Diffusion Policy en el entorno ALOHA, utilizando este modelo como implementación de referencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política. No se dispone de métricas como tasa de éxito en la tarea de transferencia de cubo, ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- No se especifican requisitos oficiales de hardware en la documentación del modelo.
- Dado el tamaño de 263 millones de parámetros y el tipo de arquitectura (red de difusión con entradas visuales), se estima que puede ejecutarse en GPUs con al menos 8 GB de VRAM, aunque no hay confirmación oficial.
- El framework LeRobot recomienda el uso de GPU NVIDIA con CUDA para entrenamiento e inferencia; modelos de este tamaño suelen caber en tarjetas como RTX 3060, RTX 4070 o superiores.
- Para el despliegue, se utiliza el propio ecosistema LeRobot, que incluye scripts de rollout y entrenamiento. No se mencionan opciones como vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- La latencia y el throughput dependen del hardware y de la configuración de difusión (número de pasos de denoising), pero no se proporcionan datos concretos.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| masondx/diffusion_aloha_sim_transfer_cube | Diffusion Policy | 263M | no aplica | Apache 2.0 | Hugging Face |
| lerobot/act_aloha_sim_transfer_cube_human | ACT (Action Chunking with Transformers) | no disponible | no aplica | Apache 2.0 | Hugging Face |
| Otros modelos de Diffusion Policy en LeRobot | Diffusion Policy | variable | no aplica | Apache 2.0 | Hugging Face |

Ambos modelos están entrenados sobre el mismo dataset y entorno, pero utilizan arquitecturas distintas: ACT se basa en transformers con chunking de acciones, mientras que el modelo evaluado emplea difusión. No se dispone de comparativas de rendimiento publicadas entre ellos.

## Limitaciones y advertencias

- No se han publicado resultados de evaluación, por lo que se desconoce la tasa de éxito real en la tarea. Un issue en el repositorio de LeRobot sugiere que la política de difusión puede presentar baja precisión en este entorno concreto, con errores de posicionamiento del efector final.
- El modelo está entrenado exclusivamente en simulación con un dataset de 50 episodios, lo que limita su generalización a variaciones de la tarea o a entornos reales sin adaptación adicional.
- Depende de la configuración específica de cámaras y del robot ALOHA; cualquier cambio en la disposición de sensores o en la cinemática del robot puede degradar el rendimiento.
- Al ser un modelo de robótica, no tiene capacidades de lenguaje ni de razonamiento simbólico; su uso se limita al control de bajo nivel.
- La licencia Apache 2.0 permite uso comercial, pero el modelo se distribuye sin garantías y sin resultados de validación, por lo que cualquier despliegue en producción requiere una evaluación exhaustiva previa.
- No se proporcionan datos sobre sesgos o alucinaciones, ya que estos conceptos no aplican directamente a un modelo de control robótico.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/masondx/diffusion_aloha_sim_transfer_cube)
- [Paper de Diffusion Policy (arXiv:2303.04137)](https://huggingface.co/papers/2303.04137)
- [Dataset de entrenamiento](https://huggingface.co/datasets/lerobot/aloha_sim_transfer_cube_human)
- [Modelo ACT comparable](https://huggingface.co/lerobot/act_aloha_sim_transfer_cube_human)
- [Repositorio de LeRobot](https://github.com/huggingface/lerobot)
- [Documentación de LeRobot](https://huggingface.co/docs/lerobot/index)
- [Issue sobre baja precisión en LeRobot](https://github.com/huggingface/lerobot/issues/502)
