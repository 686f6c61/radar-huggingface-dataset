# castanetnicolas/ACT_UR5e_BS_64_Act_Chunk_10_Exec_10_TASK_nut_assembly_square_PIXELS__ID_146341

## Resumen

ACT (Action Chunking with Transformers) aplicado a robótica es un método de aprendizaje por imitación que predice secuencias cortas de acciones (chunks) en lugar de un único paso. Este repositorio concreto, publicado por el usuario castanetnicolas, contiene una política entrenada con LeRobot para la tarea de ensamblaje "Pick up the square nut and place it on the square peg" (recoger la tuerca cuadrada y colocarla sobre la clavija cuadrada). El modelo consume observaciones de estado (9 dimensiones) y dos flujos de imagen RGB de 84x84 píxeles, y produce acciones de 7 dimensiones.

El modelo tiene 51.580.551 parámetros totales (~51,6 M) en formato safetensors, con un tamaño de repositorio de 0,2 GB. Se entrenó sobre el dataset castanetnicolas/robomimic_square_ph_image84, compuesto por 200 episodios y 30.154 fotogramas a 20 FPS. La política sigue el esquema de chunking de acciones con 10 pasos de acción y 10 pasos de ejecución, según se deduce del identificador del repositorio.

La relevancia de esta ficha es doble: por un lado documenta una política de robótica concreta y reproducible vía LeRobot; por otro, sirve como ejemplo de la familia ACT, cuyo paper (arXiv:2304.13705) es una referencia habitual en manipulación robótica con aprendizaje por imitación. Existe una discrepancia entre el identificador del repositorio (que menciona UR5e) y la model card (que declara `panda` como tipo de robot), por lo que conviene verificar la plataforma objetivo antes de desplegarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer para Action Chunking (ACT), con codificador visual tipo ResNet sobre dos imagenes RGB |
| Parametros totales | 51.580.551 (~51,6 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje); horizonte de accion en chunks de 10 pasos |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible / no aplica (no es un modelo de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria lerobot) |

## Arquitectura y entrenamiento

La arquitectura es la de ACT (Action Chunking with Transformers): un modelo de aprendizaje por imitacion que, dada una observacion visual y de estado, predice un bloque de acciones futuras (chunk) en lugar de una sola accion inmediata. La politica consume `observation.state` con forma (9,), `observation.images.agentview` con forma (3, 84, 84) y `observation.images.robot0_eye_in_hand` con forma (3, 84, 84), y emite una accion de forma (7,). El identificador del repositorio indica Act_Chunk_10 y Exec_10, lo que sugiere un horizonte de prediccion de 10 pasos con ejecucion de 10 pasos.

El entrenamiento se realizo con LeRobot 0.6.1 durante 120.000 pasos, con batch size de 64, optimizador AdamW, learning rate de 1e-5 y semilla 1000. El dataset de entrenamiento es castanetnicolas/robomimic_square_ph_image84, con 200 episodios, 30.154 fotogramas y una tasa de 20 FPS, orientado a la tarea "Pick up the square nut and place it on the square peg". No se especifica en la informacion disponible si hubo fases de RLHF o DPO, ni la composicion detallada del dataset mas alla de estos metadatos.

## Capacidades

- Manipulacion robotica por imitacion: genera acciones de 7 grados de libertad a partir de observaciones visuales y de estado.
- Percepcion visual multimodal: procesa simultaneamente una vista externa (`agentview`) y una vista de muneca (`robot0_eye_in_hand`) a 84x84 píxeles.
- Prediccion de chunks de acciones: emite bloques de acciones temporales que reducen la frecuencia de inferencia y mejoran la estabilidad frente a politicas paso a paso.
- Ejecucion de una tarea especifica de ensamblaje: colocacion de una tuerca cuadrada sobre una clavija cuadrada.
- Integracion con el ecosistema LeRobot: entrenamiento, rollout y evaluacion estandarizados mediante la CLI `lerobot-*`.
- No dispone de capacidades de lenguaje natural, generacion de texto, codigo, matematicas, tool calling ni razonamiento multi-paso simbolico; no es un modelo de proposito general.

## Casos de uso

- Automatizacion de ensamblaje en linea de produccion: la politica puede controlar el brazo robotico para recoger una tuerca y colocarla sobre una clavija, replicando la tarea del dataset de entrenamiento con las mismas condiciones de camara y robot.
- Base para fine-tuning en tareas de ensamblaje similares: al estar entrenada con LeRobot, se puede reentrenar sobre nuevos datasets de manipulacion mediante `lerobot-train` cambiando `--policy.type=act` y el `--dataset.repo_id`.
- Banco de pruebas para investigacion en aprendizaje por imitacion: sirve como referencia reproducible para comparar el efecto del tamano de chunk (10 vs 20 vs 5) frente a otras variantes publicadas por el mismo autor.
- Evaluacion de pipelines de teleoperacion: permite validar la captura de datos (camaras, FPS, estado) antes de escalar a tareas mas complejas.
- Prototipado en simulacion o gemelo digital: la politica con entradas de imagen 84x84 y estado de 9 dimensiones puede integrarse en entornos tipo robomimic o MuJoCo (existe un modelo UR5e en mujoco_menagerie) para pruebas previas al despliegue fisico.
- Docencia y formacion en robotica: ejemplo completo y autocontenido de ACT con instrucciones de reproduccion, apropiado para cursos de aprendizaje automatico aplicado a robotica.
- Validacion de estrategias de ejecucion (exec=10): util para medir la estabilidad y la tasa de exito al reejecutar chunks completos frente a reejecuciones mas frecuentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente: "_No evaluation results have been provided for this policy yet._" No debe asumirse ninguna tasa de exito ni comparacion cuantitativa con otras politicas.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja. Con 51,6 M de parametros, en FP32 el peso ocupa aproximadamente 0,2 GB y en FP16 alrededor de 0,1 GB; sumando activaciones y el codificador visual, la huella realista es de menos de 1 GB. La cuantizacion no esta documentada, por lo que estos valores son estimaciones a partir del numero de parametros.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente. No requiere A100 ni H100. Una RTX 4090, RTX 3090, RTX 3060 o incluso GPUs integradas modernas pueden ejecutarla sin problemas.
- Inferencia en CPU: es viable dado el tamano reducido, aunque la latencia dependera del hardware y de la frecuencia de control requerida por el robot.
- Caber en GPU de consumo: si, cabe holgadamente en cualquier GPU de consumo reciente e incluso en modelos con poca VRAM.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--policy.path`), que carga los pesos desde el Hub. El modelo esta en formato safetensors y libreria lerobot; no se documentan conversiones a GGUF ni soporte de vLLM, TGI, llama.cpp u Ollama (habitualmente no aplicables a politicas roboticas de este tipo).
- Latencia y throughput estimados: no disponible. Depende del hardware objetivo y de la frecuencia de control del robot (el dataset se capturo a 20 FPS, lo que sugiere ese orden de frecuencia de operacion).

## Comparativa con modelos similares

No hay resultados de benchmarks publicados que permitan una comparacion cuantitativa. Se comparan a continuacion variantes de la misma familia, todas del autor castanetnicolas y basadas en ACT, con datos limitados a lo disponible.

| Modelo | Parametros | Contexto / chunk | Licencia | Disponibilidad |
|---|---|---|---|---|
| ACT_UR5e_BS_64_Act_Chunk_10_Exec_10 (este) | 51.580.551 | chunk 10 / exec 10 (segun ID) | apache-2.0 | Hub (0 descargas, 0 likes) |
| ACT_UR5e_BS_64_Act_Chunk_20_Exec_20 | no disponible | chunk 20 / exec 20 (segun ID) | no disponible | Hub |
| ACT_UR5e_BS_32_Act_Chunk_5_Exec_5 | no disponible | chunk 5 / exec 5 (segun ID) | no disponible | Hub |
| Diffusion Policy / SmolVLA / otras politicas LeRobot | no disponible | no disponible | no disponible | no disponible |

Los datos de parametros, licencia y contexto de las variantes comparadas no se han podido confirmar en la informacion proporcionada; por tanto, la comparacion es orientativa y debe verificarse en cada repositorio.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no se ha publicado ninguna tasa de exito, numero de ensayos ni condiciones de prueba. No hay evidencia empirica de que la politica funcione correctamente.
- Ambiguedad de plataforma robotica: el identificador del repositorio menciona UR5e, mientras que la model card declara `panda` como robot y camaras `agentview` y `robot0_eye_in_hand`. Esta discrepancia puede provocar fallos de despliegue si no se ajustan los nombres de camaras y el tipo de robot.
- Idiomas: el modelo no procesa lenguaje; "idiomas soportados" no aplica. No debe confundirse con un LLM.
- Sobreespecializacion: la politica se ha entrenado unicamente para la tarea "Pick up the square nut and place it on the square peg"; no generaliza a otras tareas sin reentrenamiento o fine-tuning.
- Sensibilidad al dominio visual: al usar imagenes de 84x84 píxeles, es probable que sea sensible a cambios de iluminacion, posiciones de objeto, distracciones, o diferencias entre robots del mismo tipo. La model card advierte de estos factores como relevantes en la evaluacion.
- Riesgo de alucinacion: no aplica en el sentido de generacion de texto, pero si puede producir trayectorias de accion incorrectas o inseguras si la observacion difiere del dominio de entrenamiento.
- Restricciones de licencia: apache-2.0 permite uso comercial y modificacion con atribucion; conviene revisar los terminos del dataset subyacente (castanetnicolas/robomimic_square_ph_image84) antes de uso en produccion.
- Caveats de produccion: sin evaluacion, sin cuantizacion documentada y sin soporte declarado para servidores de inferencia estandar, el modelo es mas adecuado como material de investigacion o prototipo que como componente de un sistema industrial sin validacion adicional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/castanetnicolas/ACT_UR5e_BS_64_Act_Chunk_10_Exec_10_TASK_nut_assembly_square_PIXELS__ID_146341
- Dataset de entrenamiento: https://huggingface.co/datasets/castanetnicolas/robomimic_square_ph_image84
- Paper de ACT (Action Chunking with Transformers): https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Variante Chunk 20 / Exec 20: https://huggingface.co/castanetnicolas/ACT_UR5e_BS_64_Act_Chunk_20_Exec_20
- Variante Chunk 5 / Exec 5: https://huggingface.co/castanetnicolas/ACT_UR5e_BS_32_Act_Chunk_5_Exec_5
- Repositorio ACT para UR5: https://github.com/ripl/ACT_for_ur5
- Modelo UR5e en MuJoCo Menagerie: https://github.com/google-deepmind/mujoco_menagerie/blob/main/universal_robots_ur5e/README.md
