# glannuzel/put-red-cube-in-green-box_act_close08

## Resumen

`glannuzel/put-red-cube-in-green-box_act_close08` es una política de imitación (policy) entrenada con el algoritmo Action Chunking with Transformers (ACT) sobre el framework LeRobot de Hugging Face. No es un modelo de lenguaje: es un controlador visual-motor diseñado para que un brazo robótico concreto, denominado `grabette`, ejecute la tarea de manipulación "put-red-cube-in-green-box" (introducir un cubo rojo en una caja verde). El modelo aprende directamente de demostraciones teleoperadas y predice secuencias cortas de acciones en lugar de pasos individuales, lo que reduce el error de composición acumulado típico de las políticas paso a paso.

El modelo tiene 51.594.888 parámetros (unos 51,6 millones) y un tamaño de repositorio de 0,2 GB, lo que lo sitúa en el rango de políticas ligeras que pueden ejecutarse en tiempo real sobre hardware modesto. Consume una imagen RGB de 486x648 píxeles procedente de una única cámara (`cam0`) y un vector de estado de 2 dimensiones, y produce un vector de acción de 8 dimensiones. Se entrenó durante 80.000 pasos con batch de 16 y tasa de aprendizaje 1e-5 sobre un dataset de 177 episodios y 31.496 fotogramas a 30 FPS.

Su relevancia es acotada pero concreta: sirve como ejemplo reproducible de un pipeline completo de aprendizaje por imitación en robótica con LeRobot, desde la grabación del dataset hasta el despliegue con `lerobot-rollout`. Es un artefacto de investigación y experimentación, no un modelo de propósito general, y su utilidad está ligada a la morfología exacta del robot y a la tarea para la que fue entrenado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), política de imitación con codificador visual y decodificador transformer de acciones |
| Parametros totales | 51.594.888 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica; consume una observación por paso) |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin cuantización documentada) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que combina un backbone visual (codificador de imágenes) con un transformer que predice *chunks* de acciones, es decir, bloques de varias acciones futuras en una sola pasada. Esta predicción por trozos mitiga el problema de acumulación de errores de las políticas que predicen una acción por paso y, según el paper original (arXiv:2304.13705), suele alcanzar tasas de éxito elevadas con datos teleoperados. La entrada del modelo son las observaciones `observation.images.cam0` (tensor VISUAL de forma `(3, 486, 648)`) y `observation.state` (tensor STATE de forma `(2,)`); la salida es `action` con forma `(8,)`.

El entrenamiento se realizó con LeRobot 0.6.1 sobre el dataset `glannuzel/put-red-cube-in-green-box_act_graspproj`, compuesto por 177 episodios y 31.496 fotogramas grabados a 30 FPS de la tarea "put-red-cube-in-green-box". La configuración reportada es de 80.000 pasos de entrenamiento, batch size 16, optimizador AdamW, learning rate 1e-5 y semilla 1000. No se documenta en la model card el uso de RLHF, DPO ni ninguna fase de ajuste posterior al entrenamiento supervisado por imitación, ni se detalla la composición exacta del dataset más allá del número de episodios y fotogramas.

## Capacidades

- Control visuomotor de un brazo robótico para la tarea específica de colocar un cubo rojo en una caja verde.
- Predicción de chunks de acción (8 dimensiones por paso) a partir de una imagen RGB y un estado de 2 dimensiones.
- Aprendizaje por imitación a partir de demostraciones teleoperadas, sin necesidad de recompensas explícitas.
- Ejecución en tiempo real mediante `lerobot-rollout` con la estrategia `base`.
- Integración con el ecosistema LeRobot para entrenamiento, evaluación y despliegue.
- No soporta tool calling, function calling, razonamiento multi-paso simbólico, capacidades multilingües ni modos de "thinking": no es un modelo de lenguaje.
- No dispone de capacidades de visión general más allá del codificador visual entrenado para esta tarea concreta.

## Casos de uso

- Automatización de una celda de pick-and-place de laboratorio: el modelo controla el robot `grabette` para recoger un cubo rojo y depositarlo en una caja verde, replicando la tarea demostrada en los 177 episodios de entrenamiento. Es adecuado porque la política está entrenada exactamente para esa secuencia y morfología.
- Prototipado rápido de pipelines de aprendizaje por imitación: sirve como referencia para validar la instalación de LeRobot, la calibración de cámaras y el flujo `lerobot-train` → `lerobot-rollout` antes de entrenar políticas propias.
- Docencia y experimentación en robótica: permite ilustrar el funcionamiento de ACT con un caso reproducible y de licencia permisiva (Apache 2.0), útil en cursos y talleres.
- Benchmark interno de infraestructura de inferencia robótica: al ser un modelo pequeño (51,6 M de parámetros, 0,2 GB), permite medir latencia y throughput de un stack LeRobot en hardware concreto sin grandes requisitos de cómputo.
- Base para *fine-tuning* en tareas de manipulación similares: partiendo de esta política se puede reentrenar con un dataset propio de otra tarea de pick-and-place sobre el mismo robot, aprovechando el codificador visual ya ajustado.
- Evaluación de robustez frente a variaciones de iluminación y posición de objetos: al estar entrenado con una sola cámara y una tarea fija, sirve para estudiar experimentalmente cómo degrada el rendimiento ante cambios de dominio, siempre que se documenten los resultados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No se reportan tasas de éxito en robot real, número de ensayos ni condiciones de evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,6 M de parámetros en safetensors el modelo ocupa aproximadamente 0,2 GB en disco, por lo que la inferencia en FP32 requiere del orden de unos pocos cientos de MB de memoria, aunque no se documenta la cifra exacta.
- GPU recomendadas: no especificadas por el autor. Por tamaño, cualquier GPU consumer moderna (por ejemplo, RTX 3060 o superior) debería poder ejecutar la política; no se confirma compatibilidad con modelos concretos.
- Cabe en GPU consumer: previsiblemente sí, dado el tamaño del modelo, aunque no hay confirmación oficial ni lista de GPUs validadas.
- Opciones de despliegue: LeRobot, mediante el comando `lerobot-rollout` con `--strategy.type=base` y `--policy.path=glannuzel/put-red-cube-in-green-box_act_close08`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de política).
- Latencia y throughput estimados: no disponibles. El dataset se grabó a 30 FPS y el despliegue se plantea en tiempo real, pero no se publican mediciones de latencia.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otras políticas ACT, Diffusion Policy, VQ-BeT u otras alternativas de la misma categoría, ni datos de rendimiento que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Es una política específica para un robot (`grabette`) y una tarea ("put-red-cube-in-green-box"); no generaliza a otros robots, tareas u objetos sin reentrenamiento.
- Depende de una única cámara (`cam0`) con resolución 486x648 y de un estado de 2 dimensiones; cambios en la configuración de sensores invalidan el modelo.
- No hay evaluación publicada en robot real: se desconoce la tasa de éxito, la robustez ante variaciones de iluminación, posición de objetos o distracciones.
- Riesgo de sobreajuste al dataset de 177 episodios y 31.496 fotogramas, con posibles fallos fuera de la distribución de demostraciones.
- No es un modelo de lenguaje: no tiene sesgos lingüísticos ni capacidad de generar texto, pero puede heredar sesgos de las demostraciones teleoperadas (por ejemplo, trayectorias particulares del operador).
- Licencia Apache 2.0: permite uso comercial y modificación, pero el usuario debe verificar el cumplimiento de las licencias de las dependencias (LeRobot, librerías de robótica) y de los datos de entrenamiento.
- Para producción en robótica real es imprescindible añadir capas de seguridad (paradas de emergencia, límites de par, validación de acciones) que la model card no contempla.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin señales de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/glannuzel/put-red-cube-in-green-box_act_close08
- Dataset de entrenamiento: https://huggingface.co/datasets/glannuzel/put-red-cube-in-green-box_act_graspproj
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=glannuzel/put-red-cube-in-green-box_act_graspproj
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guía de grabación y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
