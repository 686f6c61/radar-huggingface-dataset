# castanetnicolas/ACT_UR5e_BS_64_Act_Chunk_20_Exec_20_TASK_pick_place_can_PIXELS__ID_146339

## Resumen

ACT_UR5e_BS_64_Act_Chunk_20_Exec_20 es una política de robótica basada en ACT (Action Chunking with Transformers), un método de aprendizaje por imitación que predice fragmentos cortos de acciones (action chunks) en lugar de pasos individuales. El modelo lo publica el usuario castanetnicolas en Hugging Face y se ha entrenado y subido con LeRobot, la librería de Hugging Face para aprendizaje automático en robótica del mundo real. Está especializado en una única tarea de manipulación: coger una lata y colocarla en la papelera correspondiente, a partir de demostraciones teleoperadas.

Técnicamente es un transformer de aproximadamente 51,6 millones de parámetros que consume el estado del robot (9 dimensiones) y dos flujos de imagen RGB de 84x84 píxeles (vista general y vista de la pinza), y produce un vector de acción de 7 dimensiones. Aunque el nombre del repositorio hace referencia a un robot UR5e, la model card declara como tipo de robot `panda`, una discrepancia que conviene verificar antes de desplegarlo. La ventana de acción y el horizonte de ejecución parecen ser de 20 pasos según el nombre del repositorio (Act_Chunk_20_Exec_20), aunque este extremo no se confirma explícitamente en la documentación.

Su relevancia es la de un ejemplo práctico y reproducible de política ACT entrenada con LeRobot, útil para quien quiera replicar el flujo de trabajo de imitación, comparar configuraciones (por ejemplo, frente a la variante Act_Chunk_50_Exec_50 del mismo autor) o servir de punto de partida para políticas propias. El modelo no ha publicado resultados de evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (ACT, Action Chunking with Transformers) |
| Parametros totales | 51.590.791 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (el nombre del repo sugiere chunk de accion de 20 pasos y ejecucion de 20) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | no aplica (politica de robotica; no procesa lenguaje natural) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que combina un codificador visual y un transformer que predice secuencias de acciones (chunks) en lugar de una sola acción por paso. Esto reduce el problema de horizonte y mitiga la acumulacion de errores y el comportamiento poco natural de las políticas paso a paso. La política recibe como entradas `observation.state` (shape `(9,)`), `observation.images.agentview` (shape `(3, 84, 84)`) y `observation.images.robot0_eye_in_hand` (shape `(3, 84, 84)`), y emite `action` (shape `(7,)`).

El entrenamiento se realizó sobre el dataset `castanetnicolas/robomimic_can_ph_image84`, con 200 episodios, 23.207 fotogramas, tasa de 20 FPS y la tarea "Pick up the can and place it in the matching bin". La configuración documentada es de 120.000 pasos de entrenamiento, batch size 64, optimizador AdamW, learning rate 1e-05, semilla 1000 y LeRobot 0.6.1. No se detallan innovaciones adicionales de arquitectura más alla del propio esquema ACT ni el uso de RLHF o DPO (no aplica en este dominio).

## Capacidades

- Control de manipulacion robotica para una tarea concreta: coger una lata y colocarla en la papelera correspondiente.
- Aprendizaje por imitacion a partir de demostraciones teleoperadas.
- Prediccion de chunks de acciones (segun el nombre del repo, chunk de 20 pasos y ejecucion de 20), en lugar de acciones paso a paso.
- Percepcion visual por dos camaras: vista general (`agentview`) y vista en la pinza (`robot0_eye_in_hand`), ambas RGB a 84x84.
- Integracion con el estado del robot de 9 dimensiones como entrada adicional.
- Ejecucion mediante `lerobot-rollout` con estrategia `base`.
- No dispone de tool calling, agentes, razonamiento multi-paso simbolico ni capacidades multilingues: es una política de control, no un modelo de lenguaje.

## Casos de uso

- Automatizacion de pick-and-place de latas: el modelo ejecuta la secuencia de coger una lata y depositarla en la papelera correspondiente, tarea para la que fue entrenado especificamente.
- Banco de pruebas para investigacion en imitacion: sirve como referencia reproducible para comparar variantes de ACT y configuraciones de chunk/ejecucion sin tener que entrenar desde cero.
- Base para fine-tuning en robotica: al ser una política pequena y con licencia Apache 2.0, se puede reutilizar como punto de partida y reentrenar sobre un dataset propio con `lerobot-train`.
- Evaluacion de pipelines de LeRobot: util para validar la instalacion, el formateo de observaciones y el bucle de control a 20 FPS en un entorno real o simulado.
- Demostraciones y docencia: ejemplo didactico de politica de manipulacion basada en vision con dos camaras y estado del robot.
- Comparacion de configuraciones de ejecucion: permite contrastar el efecto de distintos horizontes de chunk ejecutando esta politica frente a la variante Act_Chunk_50_Exec_50 del mismo autor.
- Prototipado rapido en laboratorio: al caber en una GPU de consumo, se puede desplegar en un puesto de trabajo sin infraestructura dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card indica que no se han proporcionado resultados de evaluacion para esta politica ("No evaluation results have been provided for this policy yet").

## Requisitos de hardware

- VRAM estimada para inferencia: muy reducida. Con 51,6 millones de parametros, aproximadamente 206 MB en FP32 y unos 103 MB en FP16, sin contar el codificador visual ni el coste de activaciones.
- GPU recomendadas: cualquier GPU moderna con al menos 4-6 GB de VRAM es suficiente; una RTX 3060, RTX 4070 o RTX 4090 funcionan sin problema. Para despliegues en servidor, una A100 o H100 sobredimensionan ampliamente la tarea.
- Compatibilidad con GPU de consumo: si, cabe con holgura en practicamente cualquier GPU de consumo actual e incluso es viable en CPU para pruebas.
- Opciones de despliegue: LeRobot con `lerobot-rollout` es la via documentada. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a una politica de control).
- Latencia y throughput: no disponibles de forma oficial. La tasa del dataset es de 20 FPS, por lo que el bucle de control debe poder inferir a esa frecuencia o superior para operar en tiempo real; no se publican mediciones de latencia.

## Comparativa con modelos similares

No se dispone de datos de rendimiento publicados para esta politica ni para las alternativas, por lo que la comparacion se limita a caracteristicas estructurales.

| Modelo | Tipo | Parametros | Tarea | Licencia | Notas |
|---|---|---|---|---|---|
| Este modelo (ACT_UR5e_BS_64_Act_Chunk_20_Exec_20_TASK_pick_place_can) | ACT (transformer) | 51,6 M | Pick and place de lata | apache-2.0 | Sin resultados de evaluacion publicados; robot declarado `panda` |
| castanetnicolas/ACT_UR5e_BS_64_Act_Chunk_50_Exec_50 | ACT (transformer) | no disponible | Pick and place (misma familia) | no disponible | Variante con chunk y ejecucion de 50 segun el nombre |
| Diffusion Policy (referencia de la literatura) | Policy de difusion | no disponible | Manipulacion robotica | no disponible | Alternativa habitual a ACT en imitacion; sin datos comparativos en la informacion disponible |

## Limitaciones y advertencias

- Es una politica especializada en una unica tarea; no generaliza a otras tareas ni objetos fuera de su distribucion de entrenamiento.
- Discrepancia entre el nombre del repositorio (UR5e) y la model card (tipo de robot `panda`); hay que verificar la plataforma real antes de desplegar.
- No se han publicado resultados de evaluacion, por lo que la tasa de exito real es desconocida.
- Sensibilidad esperada a cambios de iluminacion, posicion de objetos, distractores y variaciones de camara no vistas durante el entrenamiento (comportamiento tipico de politicas de imitacion; no confirmado por el autor).
- Riesgo de acumulacion de errores y de comportamientos inseguros en ejecucion de larga duracion; se recomienda supervision y limites de seguridad en el robot.
- Requiere que los nombres y la configuracion de camaras coincidan exactamente con las claves de observacion con las que se entreno (`agentview` y `robot0_eye_in_hand`).
- Entrenado a partir de datos teleoperados; puede heredar sesgos presentes en las demostraciones.
- Licencia Apache 2.0: permite uso comercial y modificacion, con las obligaciones habituales de atribucion; conviene revisar los terminos del dataset asociado.
- Cero descargas y cero "likes" en el momento de redactar esta ficha, lo que indica que es un modelo reciente y sin validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/castanetnicolas/ACT_UR5e_BS_64_Act_Chunk_20_Exec_20_TASK_pick_place_can_PIXELS__ID_146339
- Dataset de entrenamiento: https://huggingface.co/datasets/castanetnicolas/robomimic_can_ph_image84
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=castanetnicolas/robomimic_can_ph_image84
- Paper de ACT (Action Chunking with Transformers): https://huggingface.co/papers/2304.13705
- Variante Act_Chunk_50_Exec_50 del mismo autor: https://huggingface.co/castanetnicolas/ACT_UR5e_BS_64_Act_Chunk_50_Exec_50
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
