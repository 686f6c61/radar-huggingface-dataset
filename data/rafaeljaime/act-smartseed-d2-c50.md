# RafaelJaime/act-smartseed-d2-c50

## Resumen

`act-smartseed-d2-c50` es una política de imitación visomotora entrenada con el método Action Chunking with Transformers (ACT), publicada en HuggingFace Hub por el usuario RafaelJaime mediante la librería LeRobot. No es un modelo de lenguaje: es un controlador neuronal que recibe el estado articular de un brazo robótico SO-101 (`so_follower`, vector de 6 dimensiones) y dos imágenes de 480x640 píxeles procedentes de una cámara cenital (`top`) y otra en la muñeca (`wrist`), y devuelve un vector de acción de 6 dimensiones. Su única tarea entrenada es "grasp the seed below the gripper" (agarrar la semilla situada bajo la pinza).

El modelo tiene 51.617.414 parámetros (pesos en safetensors, repositorio de 2,5 GB) y se entrenó sobre el dataset `RafaelJaime/smartseed-grasp-d2-clean`, compuesto por 91 episodios teleoperados y 25.742 fotogramas a 30 FPS. La configuración de entrenamiento reportada es de 40.000 pasos, batch de 32, optimizador AdamW, tasa de aprendizaje 1e-5 y semilla 1000, sobre LeRobot 0.6.2.

Su relevancia es acotada pero clara: sirve como referencia reproducible de un pipeline completo de aprendizaje por imitación (grabación con teleoperación, entrenamiento con `lerobot-train`, despliegue con `lerobot-rollout`) en un robot de bajo coste, en el contexto de la hackathon robotekin-hackathon con el tag BraboRobots. No se han publicado resultados de evaluación en robot real, por lo que su tasa de éxito es desconocida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con módulo de chunking de acciones; política de imitación visomotora |
| Parametros totales | 51.617.414 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica: no es un modelo de lenguaje; consume una observación (estado de 6 dimensiones + 2 imágenes 3x480x640) por paso de control. El tamano del chunk de acciones no se indica en la informacion disponible |
| Tipos de cuantizacion | No disponible; solo se publican pesos safetensors sin variantes cuantizadas (no hay GGUF ni cuantizaciones de 8/4 bits) |
| Idiomas soportados | No aplica al modelo (su salida son acciones). La instrucción de tarea usada en entrenamiento esta en ingles: "grasp the seed below the gripper" |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (formato de LeRobot); repositorio de 2,5 GB |

Otras especificaciones relevantes:

| Parametro | Valor |
|---|---|
| Tipo de robot | `so_follower` (SO-101) |
| Camaras | `top`, `wrist` (3x480x640 cada una, 30 FPS) |
| Entrada `observation.state` | STATE, shape (6,) |
| Salida `action` | ACTION, shape (6,) |
| Pipeline | robotics |
| Libreria | lerobot (version de entrenamiento 0.6.2) |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers, paper arXiv 2304.13705) es un método de aprendizaje por imitación que, en lugar de predecir una acción por paso, predice un bloque (chunk) de acciones futuras a partir de la observación actual. La formulación original combina un codificador de observaciones con un transformer encoder-decoder y una variable latente de estilo CVAE, de modo que el modelo captura la multimodalidad de las demostraciones humanas (varias formas válidas de resolver la misma tarea) y reduce el error de acumulación que aparece en el control paso a paso. El resultado es un controlador que puede ejecutar chunks completos entre inferencias, lo que baja la frecuencia de cómputo necesaria en el bucle de control.

En este caso concreto no se detallan innovaciones adicionales ni variaciones sobre el método original. Los datos de entrenamiento provienen exclusivamente del dataset `RafaelJaime/smartseed-grasp-d2-clean`: 91 episodios, 25.742 fotogramas a 30 FPS, una única tarea y una única morfología de robot y disposición de cámaras. Es, por tanto, un ajuste de imitación supervisada sobre datos teleoperados, sin indicios de RLHF, DPO ni fases de refuerzo. La configuración declarada es de 40.000 pasos de entrenamiento con batch 32, AdamW, learning rate 1e-5 y semilla 1000. El autor no documenta aumentos de datos, composición de escenas, variabilidad de posiciones de la semilla ni condiciones de iluminación.

## Capacidades

- Control visomotor de un brazo SO-101 para una tarea de agarre ("grasp the seed below the gripper") a partir de estado articular y dos vistas de cámara.
- Predicción de chunks de acciones, lo que permite ejecutar varios pasos de control entre inferencias.
- Fusión de información multimodal: concatena el estado propioceptivo de 6 dimensiones con características visuales de cámara cenital y de muñeca.
- Aprendizaje por imitación a partir de demostraciones teleoperadas, sin recompensa explícita ni ingeniería de entorno.
- Integración nativa con el ecosistema LeRobot: entrenamiento con `lerobot-train`, ejecución con `lerobot-rollout` y publicación en el Hub.
- Reentrenamiento y ajuste fino sobre nuevos datasets con `--policy.type=act`, útil como base para otras tareas de agarre.
- No soporta tool calling, function calling, razonamiento multi-paso simbólico, ni generación de texto, código, matemáticas, visión general o audio. No dispone de modo "thinking" ni de comprensión de instrucciones en lenguaje natural: la tarea es fija y viene dada por el entrenamiento.

## Casos de uso

- Manipulación de semillas en laboratorio agrotecnológico: la política ejecuta el agarre de una semilla colocada bajo la pinza con un SO-101 y dos cámaras, adecuada para prototipos de siembra automatizada o clasificación de semillas en pequeña escala.
- Base de referencia para experimentos de aprendizaje por imitación: al estar entrenada con LeRobot 0.6.2 y una configuración documentada (40.000 pasos, lr 1e-5, batch 32), sirve como línea base reproducible frente a nuevos checkpoints ACT sobre el mismo dataset.
- Validación de pipelines de teleoperación y calibración: permite comprobar de extremo a extremo que la grabación de episodios, la calibración de las cámaras `top` y `wrist` y el bucle de control a 30 FPS funcionan antes de invertir tiempo en grabar más datos.
- Ajuste fino para nuevas tareas de agarre: partiendo de estos pesos, `lerobot-train --policy.type=act` permite reentrenar con un dataset propio de otra semilla, objeto o posición, reduciendo el número de pasos necesarios frente a un entrenamiento desde cero.
- Docencia y divulgación en robótica: ejemplo completo y de tamano reducido (51,6 M de parámetros) para explicar chunking de acciones, CVAE y evaluación en robot real en cursos o talleres.
- Despliegue en hardware de borde: por su tamano, es viable en una GPU integrada o en una Jetson junto al robot, sin depender de servidores externos, para demos en ferias o laboratorios con conectividad limitada.
- Pruebas de robustez y análisis de fallos: al no haber evaluación publicada, el modelo es útil para que terceros midan tasa de éxito y modos de fallo (por ejemplo, sensibilidad a la iluminación o a la posición inicial de la semilla) y contribuyan esos datos al repositorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye la sección de evaluación vacía, con la nota explícita de que no se han proporcionado resultados para esta política. No hay tasa de éxito, número de ensayos ni comparación con otros checkpoints.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja. Con 51,6 M de parámetros, los pesos ocupan aproximadamente 207 MB en FP32 y unos 103 MB en BF16. Sumando buffers de las dos imágenes de 3x480x640 y del grafo de inferencia, se puede asumir un uso del orden de 1-2 GB de VRAM; la cifra exacta no esta disponible en la informacion proporcionada.
- GPU recomendadas: cualquier GPU con al menos 4 GB es suficiente. Una RTX 4090, A100 o H100 estan sobredimensionadas para este modelo; una RTX 3060, RTX 4060, una GPU integrada moderna o una Jetson Orin son opciones proporcionadas.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo de los ultimos anos, e incluso es viable la inferencia en CPU para demos a baja frecuencia.
- Opciones de despliegue: `lerobot-rollout` (estrategia `base`) es la via documentada por el autor. No se publican instrucciones para vLLM, TGI, llama.cpp u Ollama, que no aplican a este tipo de política. El despliegue requiere el paquete `lerobot`, acceso al puerto del robot y dos camaras OpenCV a 640x480 y 30 FPS.
- Latencia y throughput: no hay mediciones publicadas. El bucle de captura esta fijado a 30 FPS y el chunking de acciones reduce el numero de inferencias necesarias por segundo, pero la latencia real por chunk no se documenta.
- Requisitos adicionales: los nombres de las camaras deben coincidir exactamente con las claves de observacion del entrenamiento (`observation.images.top` y `observation.images.wrist`), y el robot debe ser un `so_follower` calibrado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| act-smartseed-d2-c50 (este modelo) | 51.617.414 | No aplica (politica visomotora) | Sin evaluacion publicada | apache-2.0 | HuggingFace Hub, libreria lerobot |
| Diffusion Policy (implementacion LeRobot) | No disponible en la informacion proporcionada | No aplica | No disponible | No verificada en la informacion disponible | Disponible en LeRobot |
| SmolVLA (LeRobot) | No disponible en la informacion proporcionada | No aplica | No disponible | No verificada en la informacion disponible | Disponible en LeRobot |
| Otros checkpoints ACT de LeRobot | No disponible en la informacion proporcionada | No aplica | No disponible | Depende del autor | HuggingFace Hub |

La comparacion cuantitativa no es posible con los datos disponibles: el autor no publica tasas de éxito ni comparaciones con otras políticas, y las alternativas citadas no incluyen fichas tecnicas en la informacion proporcionada. Cualitativamente, ACT se distingue por su bajo numero de parametros y su entrenamiento desde cero sobre datos propios, mientras que las alternativas basadas en modelos vision-lenguaje-accion (VLA) incorporan componentes preentrenados de mayor tamano y requieren mas recursos, a cambio de mayor capacidad de generalizacion y de seguimiento de instrucciones en lenguaje natural, extremo este no verificado en la informacion disponible.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay tasa de éxito publicada, ni numero de ensayos, ni descripcion de condiciones de prueba. Cualquier uso en produccion exige una evaluacion propia previa.
- Especializacion extrema: una sola tarea ("grasp the seed below the gripper"), un solo tipo de robot (`so_follower`) y una sola configuracion de camaras. No generaliza a otras tareas, objetos o morfologias sin reentrenamiento.
- Volumen de datos reducido: 91 episodios y 25.742 fotogramas implican riesgo alto de sobreajuste al entorno, posiciones e iluminacion de la grabacion. Se desconoce el comportamiento ante cambios de posicion de la semilla, fondos distintos o iluminacion variable.
- Sin comprension de lenguaje: la instruccion de tarea es fija y no condiciona la politica de forma semantica; no se puede reutilizar el modelo pidiendole otra tarea por texto.
- Dependencia de la configuracion de camaras: si los nombres, la resolucion (640x480), los indices o la colocacion fisica de las camaras no coinciden con el entrenamiento, el modelo producira acciones invalidas sin aviso.
- "Alucinacion" no aplica en el sentido de texto, pero si existe el equivalente en robótica: acciones plausibles pero incorrectas o inseguras ante situaciones fuera de distribucion, sin mecanismo de deteccion de incertidumbre documentado.
- Sesgos: no documentados. El dataset contiene una unica tarea y presumiblemente un unico operador humano, lo que puede transferir sesgos de estilo de teleoperacion (velocidad, fuerza de agarre, trayectorias).
- Riesgo fisico: es una politica de control real. No se documentan limites de par, paradas de emergencia ni validacion de seguridad; debe ejecutarse con el robot en espacio despejado y supervisión humana.
- Licencia: apache-2.0 permite uso comercial y modificacion con atribucion, pero la licencia del dataset `RafaelJaime/smartseed-grasp-d2-clean` no se detalla en la informacion proporcionada, lo que conviene verificar antes de un uso comercial.
- Versionado: entrenado con LeRobot 0.6.2; cambios de API o de formato en versiones posteriores pueden romper la carga del checkpoint.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso o validacion por terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RafaelJaime/act-smartseed-d2-c50
- Dataset de entrenamiento: https://huggingface.co/datasets/RafaelJaime/smartseed-grasp-d2-clean
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=RafaelJaime/smartseed-grasp-d2-clean
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference

Nota: la busqueda web asociada a esta ficha no devolvio ningun enlace relevante sobre el modelo; los resultados obtenidos eran contenido no relacionado con robótica ni con inteligencia artificial, por lo que se han descartado.
