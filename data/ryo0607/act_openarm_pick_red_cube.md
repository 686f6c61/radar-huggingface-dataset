# ryo0607/act_openarm_pick_red_cube

## Resumen

`ryo0607/act_openarm_pick_red_cube` es una política de robótica entrenada con imitación mediante el método ACT (Action Chunking with Transformers), publicado por Zhao et al. en 2023 (arXiv:2304.13705). No es un modelo de lenguaje: es un controlador visomotor que consume el estado de un robot bimanual y tres flujos de cámara, y produce directamente una acción de 16 dimensiones. El autor la ha entrenado y publicado con LeRobot 0.6.2 sobre un robot de tipo `bi_openarm_follower` con tres cámaras (`left_wrist`, `front`, `right_wrist`).

El modelo resuelve una única tarea concreta: "Pick up the red cube and place it on the green dish". Se entrenó con 98 episodios y 75.359 fotogramas a 30 FPS de teleoperación, durante 20.000 pasos con optimizador AdamW, batch de 8 y learning rate de 1e-5. El resultado es un checkpoint de unos 51,7 millones de parámetros (51.689.104 exactos según los pesos en safetensors) y 0,2 GB de repositorio, con licencia Apache 2.0.

Su relevancia es la de un ejemplo reproducible de *behaviour cloning* de bajo coste: cabe en cualquier GPU de consumo, se ejecuta con el CLI `lerobot-rollout` y sirve como punto de partida para quien quiera replicar el flujo completo de LeRobot (grabar teleoperación, entrenar ACT, desplegar en hardware real) o hacer fine-tuning sobre una tarea de pick-and-place propia. Hay que subrayar que el modelo no publica resultados de evaluación en robot real y acumula 0 descargas y 0 likes, por lo que no existe validación externa de su tasa de éxito.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): transformer encoder-decoder con CVAE y extractores visuales convolucionales |
| Parametros totales | 51.689.104 (aproximadamente 51,7 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible. No es un modelo de contexto textual; la entrada es una observación por paso (estado de 16 dimensiones y tres imágenes de 3x480x640) |
| Tipos de cuantizacion | No disponible. Pesos distribuidos en safetensors, presumiblemente fp32 |
| Idiomas soportados | No aplica / no disponible. No procesa lenguaje natural como tarea principal |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repositorio gestionado por la libreria `lerobot`) |
| Tipo de robot | `bi_openarm_follower` (bimanual) |
| Camaras requeridas | `left_wrist`, `front`, `right_wrist` (3 x 480 x 640, 30 FPS) |
| Entrada `observation.state` | STATE, forma `(16,)` |
| Salida `action` | ACTION, forma `(16,)` |
| Dataset de entrenamiento | nkmurst/openarm_teleop_udp_d435_..._merged_pick_red_cube (98 episodios, 75.359 fotogramas, 30 FPS) |
| Version de LeRobot | 0.6.2 |
| Tamano del repositorio | 0,2 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

ACT, la arquitectura de este checkpoint, es un método de aprendizaje por imitación que predice *chunks* de acciones (varios pasos futuros de una sola vez) en lugar de una acción por paso. La formulación original combina un transformer encoder-decoder con un autoencoder variacional condicional (CVAE): la rama de estilo codifica la secuencia de acciones de la demostración durante el entrenamiento, y en inferencia se usa el prior (o el estilo medio) junto con las observaciones para decodificar una secuencia de acciones. Las imágenes se procesan con backbones convolucionales tipo ResNet y se concatenan con el estado propioceptivo antes de entrar al transformer. La predicción en bloques se combina habitualmente con *temporal ensembling* para suavizar las transiciones entre chunks. La model card no detalla la configuración interna (dimensión del modelo, número de capas, tamaño del chunk), por lo que esos valores concretos quedan como no disponibles.

El entrenamiento se realizó con el pipeline de LeRobot sobre el dataset `nkmurst/openarm_teleop_udp_d435_20260914_153326_150633_20260916_150242_140511_merged_pick_red_cube`, una mezcla de episodios de teleoperación con ese robot y esas tres cámaras. La configuración declarada es: 20.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-5, semilla 1000. No se menciona en la información disponible ningún uso de RLHF, DPO, refuerzo ni *reward modeling*: se trata de *behaviour cloning* puro sobre demostraciones humanas. Tampoco se documentan aumentos de datos, *dropout* específico ni recetas de regularización distintas de las del entrenamiento estándar de ACT.

## Capacidades

- Generación de acciones de control continuo de 16 dimensiones para un robot bimanual `bi_openarm_follower`, a partir de estado propioceptivo e imágenes.
- Percepción visomotora con tres cámaras simultáneas (muñeca izquierda, frontal y muñeca derecha), lo que permite cierto grado de razonamiento espacial sobre la escena.
- Ejecución de la tarea de pick-and-place "Pick up the red cube and place it on the green dish", condicionada por el prompt de tarea que espera el CLI de LeRobot.
- Predicción de bloques de acciones (*action chunking*), lo que reduce el error de acumulación respecto a políticas que predicen un único paso.
- Ejecución de rollouts autónomos en bucle, con o sin grabación de episodios, mediante `lerobot-rollout`.
- Capacidad de servir como base para *fine-tuning* con `lerobot-train` sobre datasets propios del mismo tipo de robot.
- No dispone de *tool calling*, *function calling*, soporte de agentes, capacidades multilingües, generación de texto, código, matemáticas, visión general (VQA), audio ni modo de razonamiento explícito. No es un modelo fundacional ni un VLA.

## Casos de uso

- Replicación de la tarea de pick-and-place en un `bi_openarm_follower`: el caso de uso directo. Se lanza `lerobot-rollout` apuntando a este repositorio y al puerto del robot, con las tres cámaras configuradas a 640x480 y 30 FPS, y la política ejecuta la tarea de forma autónoma durante el tiempo indicado en `--duration`.
- Fine-tuning sobre una tarea propia de manipulación bimanual: partiendo de este checkpoint, `lerobot-train` con `--policy.type=act` permite reentrenar con un dataset nuevo del mismo robot, aprovechando los pesos ya ajustados a la distribución visual de cámaras de muñeca y frontal.
- Banco de pruebas reproducible del stack LeRobot: sirve para validar de extremo a extremo la instalación, la calibración de hardware, la configuración UDP de las cámaras D435 y el pipeline de inferencia antes de invertir horas de grabación y entrenamiento.
- Docencia y formación en aprendizaje por imitación: con 0,2 GB y 51,7 M de parámetros, es un ejemplo manejable para explicar *action chunking*, CVAE y el bucle de teleoperación, y para inspeccionar los safetensors sin necesidad de clústeres.
- Investigación en evaluación de robustez: al ser una política de una sola tarea y entorno fijo, es un sujeto adecuado para medir sensibilidad a cambios de iluminación, posición de objetos, distractores o recolocación de cámaras.
- Recolección de datos y *DAgger*: desplegar la política con `lerobot-rollout --strategy.type=base` permite observar sus fallos y corregirlos mediante teleoperación, alimentando un dataset iterativo de mejora.
- Punto de partida para comparativas de arquitecturas: se puede contrastar el mismo dataset (98 episodios, 75.359 fotogramas) entrenando alternativas como Diffusion Policy o VQ-BeT con idéntica receta y comparar tasas de éxito en el mismo robot.
- Integración en una celda de laboratorio como demostrador de automatización: el modelo puede cerrar el ciclo percepción-acción a 30 FPS sobre hardware modesto, útil para prototipos de clasificación de piezas antes de invertir en una solución industrial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye explícitamente la línea "_No evaluation results have been provided for this policy yet._" y la sección de evaluación queda sin tabla de ensayos, éxitos ni tasa de éxito. No se han encontrado tampoco datos de latencia, frecuencia efectiva de control ni consumo de VRAM medidos para este checkpoint concreto.

## Requisitos de hardware

- VRAM estimada para inferencia: no publicada. Con 51,7 M de parámetros, los pesos en fp32 ocupan aproximadamente 207 MB; en fp16, unos 103 MB. Sumando activaciones de tres imágenes de 480x640 y el estado, una estimación prudente se sitúa por debajo de 2-4 GB de VRAM para inferencia a batch 1, aunque no hay medición oficial.
- Cabe con holgura en GPU de consumo: cualquier tarjeta con 4 GB o más (GTX 1650, RTX 3050, RTX 3060, RTX 4060) debería ser suficiente; una RTX 3090 o RTX 4090 deja un margen enorme y permite grabar vídeo o ejecutar varios procesos en paralelo.
- GPU de datacenter (A100, H100) no son necesarias para inferencia; solo tendrían sentido para reentrenar el modelo sobre datasets mucho mayores.
- Es plausible ejecutarlo en CPU para pruebas de humo, pero no hay datos de frecuencia alcanzable; para control en tiempo real se recomienda GPU.
- Opciones de despliegue: el CLI de LeRobot (`lerobot-rollout`) es la vía documentada. No se menciona soporte para vLLM, llama.cpp, Ollama, TGI ni TensorRT, que además no aplican a una política de robótica como esta.
- Latencia y throughput: no disponibles. La metodología ACT recurre habitualmente a *temporal ensembling* para convertir chunks discretos en comandos continuos, lo que desacopla la frecuencia de inferencia de la frecuencia de control (30 FPS), pero no se ha publicado ninguna cifra para este checkpoint.

## Comparativa con modelos similares

Comparativa cualitativa con alternativas de la misma categoría (políticas de imitación para manipulación). Los datos de los modelos de terceros provienen de sus propias fichas públicas y pueden variar según configuración.

| Modelo | Enfoque | Parametros | Contexto / entradas | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `ryo0607/act_openarm_pick_red_cube` | ACT: transformer encoder-decoder con CVAE y *action chunking* | 51,7 M | 3 imágenes 3x480x640 + estado de 16 dimensiones | No disponible (sin evaluación publicada) | apache-2.0 | HuggingFace Hub, librería `lerobot` |
| ACT de referencia (Zhao et al., 2023) | Misma familia, configuración original del paper | No disponible en la información proporcionada | No disponible | Reportado en el paper sobre tareas ALOHA | No disponible | Paper y código público |
| Diffusion Policy (Chi et al., 2023) | Política generativa basada en difusión de acciones | No disponible en la información proporcionada | Observaciones visuales y propioceptivas | No disponible | No disponible | Repositorio público de los autores |
| VQ-BeT | Discretización vectorial de acciones y modelado autorregresivo | No disponible en la información proporcionada | Observaciones visuales y propioceptivas | No disponible | No disponible | Repositorio público de los autores |
| SmolVLA | VLA compacto basado en modelo de lenguaje visual | Aproximadamente 450 M según su ficha pública | Imágenes + instrucción en lenguaje natural | No disponible | No disponible | HuggingFace Hub |

La diferencia estructural clave es el alcance: este checkpoint es una política cerrada de una sola tarea sobre un robot concreto, mientras que un VLA como SmolVLA está pensado para generalizar a instrucciones en lenguaje natural, a costa de un orden de magnitud más de parámetros y de requisitos de hardware superiores.

## Limitaciones y advertencias

- Especialización extrema: el modelo ha sido entrenado para una única tarea ("Pick up the red cube and place it on the green dish") con un objeto y un destino concretos. No generaliza a otras tareas, objetos ni posiciones de destino.
- Dependencia del hardware: la política asume un robot `bi_openarm_follower` con exactamente tres cámaras en los nombres `left_wrist`, `front` y `right_wrist`, a 640x480 y 30 FPS. Cambiar la topología, el índice o la resolución de las cámaras invalida la política sin reentrenamiento.
- Riesgo de sobreajuste y *covariate shift*: con 98 episodios y 75.359 fotogramas de un único operador y entorno, es esperable que el rendimiento se degrade ante iluminación distinta, objetos desplazados, fondos nuevos o presencia de distractores. Es una propiedad conocida del *behaviour cloning*; no se ha cuantificado para este checkpoint.
- Ausencia total de validación: no hay resultados de evaluación en robot real, y el repositorio acumula 0 descargas y 0 likes. La tasa de éxito es desconocida y debe medirse antes de cualquier uso serio.
- No es un modelo de lenguaje: no tiene capacidades de generación de texto, código, matemáticas, razonamiento simbólico, *tool calling* ni multilingüismo. Cualquier expectativa en ese sentido es un malentendido de la categoría.
- Riesgo de alucinación en el sentido de acciones inconsistentes: al ser un modelo generativo de acciones, puede producir trayectorias plausibles pero incorrectas ante entradas fuera de distribución, con riesgo de colisiones o agarres fallidos. Se recomienda operar con límites de par, parada de emergencia y supervisión.
- Licencia: Apache 2.0 permite uso comercial y modificación, pero conviene verificar de forma independiente las condiciones del dataset de entrenamiento y de las dependencias (LeRobot), que pueden tener sus propios términos.
- Consistencia de metadatos: las fechas de creación y actualización del repositorio que figuran en el Hub (septiembre de 2026) y los sellos temporales del nombre del dataset son posteriores a la fecha de publicación de la metodología ACT; conviene verificar la procedencia y la versión real de los datos antes de reutilizarlos.
- No se documentan sesgos demográficos ni de otro tipo: no aplican sesgos lingüísticos, pero sí sesgos de entorno, de operador y de configuración física derivados de la recolección de datos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ryo0607/act_openarm_pick_red_cube
- Dataset de entrenamiento: https://huggingface.co/datasets/nkmurst/openarm_teleop_udp_d435_20260914_153326_150633_20260916_150242_140511_merged_pick_red_cube
- Visualizador del dataset (LeRobot Spaces): https://huggingface.co/spaces/lerobot/visualize_dataset?path=nkmurst/openarm_teleop_udp_d435_20260914_153326_150633_20260916_150242_140511_merged_pick_red_cube
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Documentación de inferencia / rollout: https://huggingface.co/docs/lerobot/main/en/inference

Nota: la búsqueda web realizada no devolvió resultados relevantes sobre este modelo ni sobre ACT; los únicos resultados obtenidos fueron páginas de un diccionario checo sin relación con el contenido. Por tanto, todos los enlaces anteriores proceden de la información de HuggingFace y de la documentación oficial de LeRobot.
