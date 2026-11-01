# 1ys1/areumii-pi0-handover-doubletask-v2-145

## Resumen

`1ys1/areumii-pi0-handover-doubletask-v2-145` es un fine-tuning del modelo fundacional de robotica π₀ (Pi0) de Physical Intelligence, adaptado mediante la libreria LeRobot de Hugging Face para el robot `areumii`. Se trata de una politica Vision-Language-Action (VLA) generalista que recibe imagenes de tres camaras (cabeza y dos munecas), el estado articular del robot y una instruccion en lenguaje natural, y produce directamente un vector de 16 acciones motoras. El modelo resuelve el problema del control robotico por imitacion: en lugar de programar trayectorias, se aprende una politica que mapea percepcion y lenguaje a acciones.

El modelo tiene 4.028.019.472 parametros (aproximadamente 4 mil millones) y se distribuye en formato safetensors con un tamano de repositorio de 8,9 GB. Ha sido entrenado sobre el dataset `1ys1/areumii-smolvla-handover-doubletask-v2-145`, compuesto por 145 episodios y 92.066 fotogramas a 30 FPS, para dos tareas concretas de recogida y colocacion de objetos en una caja.

Su relevancia actual radica en que demuestra el flujo completo de fine-tuning de un modelo VLA fundacional sobre un robot de bajo coste y un dataset pequeno, algo que hasta hace poco requeria infraestructura de laboratorio. La licencia Apache 2.0 y la integracion con LeRobot facilitan su reproduccion y despliegue en entornos de investigacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA), basada en π₀ de Physical Intelligence (implementacion LeRobot adaptada de OpenPI) |
| Parametros totales | 4.028.019.472 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (las instrucciones de tarea estan en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Libreria | lerobot |
| Modelo base | lerobot/pi0_base |
| Tipo de robot | areumii |
| Camaras de entrada | head (3, 480, 640), left_wrist (3, 180, 320), right_wrist (3, 180, 320) |
| Entrada de estado | observation.state, vector de 16 dimensiones |
| Salida de accion | action, vector de 16 dimensiones |
| Dataset de entrenamiento | 1ys1/areumii-smolvla-handover-doubletask-v2-145 (145 episodios, 92.066 fotogramas, 30 FPS) |
| Pasos de entrenamiento | 20.000 |
| Batch size | 4 |
| Optimizador | AdamW |
| Learning rate | 2,5e-05 |
| Semilla | 1000 |
| Version de LeRobot | 0.6.1 |

## Arquitectura y entrenamiento

El modelo es una politica VLA derivada de π₀, el modelo fundacional de robotica de Physical Intelligence. La implementacion utilizada es la de LeRobot, adaptada del repositorio OpenPI. La arquitectura combina un codificador visual que procesa las imagenes de las tres camaras con un codificador de lenguaje que interpreta la instruccion de tarea, y un decodificador de acciones que genera el vector de 16 dimensiones que controla el robot. No se dispone en la informacion proporcionada de detalles sobre el numero de capas, dimensiones ocultas ni mecanismos de atencion especificos.

El entrenamiento se realizo por imitacion supervisada (behavior cloning) sobre 145 episodios teleoperados, con 20.000 pasos, batch size de 4, AdamW con learning rate 2,5e-05 y semilla 1000. No se menciona el uso de RLHF, DPO ni tecnicas de refuerzo. Las dos tareas del dataset son "Pick up the eclipse and place it in the box" y "Pick up the pink bottle and place it in the box", ambas en ingles. No se especifica el numero total de tokens ni la composicion completa del dataset mas alla de los episodios y fotogramas indicados.

## Capacidades

- Control robotico por imitacion: genera acciones de 16 dimensiones a partir de observaciones visuales y de estado articular.
- Percepcion multimodal: procesa simultaneamente tres flujos de imagen (camara frontal y dos camaras de muneca) con resoluciones distintas.
- Comprension de instrucciones en lenguaje natural: acepta tareas descritas en texto (en ingles en el dataset de entrenamiento).
- Ejecucion de tareas pick-and-place: entrenado especificamente para recoger un objeto ("eclipse" y "pink bottle") y depositarlo en una caja.
- Integracion con LeRobot: soporta el flujo `lerobot-rollout` para ejecucion en robot real y `lerobot-train` para reentrenamiento.
- No se dispone de informacion sobre tool calling, function calling, razonamiento multi-paso, modo thinking, vision general (fuera del contexto robotico) ni capacidades de audio.

## Casos de uso

- Automatizacion de tareas pick-and-place en laboratorio: el modelo ejecuta las dos tareas entrenadas sobre el robot areumii mediante `lerobot-rollout`, permitiendo validar rapido el pipeline de imitacion antes de escalar a mas objetos o posiciones.
- Base para fine-tuning con nuevos objetos: al partir de `lerobot/pi0_base` y estar ya adaptado al robot areumii, sirve como punto de partida para entrenar nuevas tareas con datasets pequenos (del orden de 100-200 episodios), reduciendo el coste frente a entrenar desde el modelo fundacional.
- Investigacion en aprendizaje por imitacion: permite reproducir experimentos de behavior cloning con un VLA de 4 mil millones de parametros en hardware de laboratorio, comparando hiperparametros (pasos, learning rate, batch size) sobre una tarea controlada.
- Prototipado de manipulacion con multiples camaras: el uso de camara frontal y dos camaras de muneca sirve para estudiar como la fusion de vistas mejora la precision en tareas de agarre y deposito.
- Evaluacion de robustez ante variaciones de posicion y iluminacion: al ser una politica entrenada con 145 episodios, es util para medir la degradacion del exito cuando cambian las condiciones respecto al dataset original.
- Docencia y formacion en robotica: el flujo completo (grabacion de datos, entrenamiento con LeRobot, despliegue con `lerobot-rollout`) es replicable en cursos practicos con un robot areumii y camaras OpenCV estandar.
- Benchmark interno de politicas VLA: sirve como referencia base para comparar nuevas politicas sobre las mismas dos tareas y el mismo robot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se han proporcionado resultados de evaluacion para esta politica ("No evaluation results have been provided for this policy yet"), por lo que no existen tasas de exito medidas en robot real.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Con 4.028.019.472 parametros y pesos en safetensors de 8,9 GB, en precision de 16 bits se necesitarian aproximadamente 8 GB solo para los pesos, mas el coste de activaciones y buffers de imagen; en FP32 serian unos 16 GB.
- GPU recomendadas: no disponible. Por tamano, una GPU con 16-24 GB de VRAM (por ejemplo, RTX 4090, A100 40 GB, H100) seria el rango habitual para un modelo de este tamano, pero no se confirma en la informacion.
- Cabe en GPU de consumo: no confirmado. El tamano de pesos (8,9 GB) sugiere que podria caber en GPUs consumer de 12-16 GB o superiores, pero no hay datos oficiales.
- Opciones de despliegue: LeRobot, mediante los comandos `lerobot-rollout` (ejecucion) y `lerobot-train` (entrenamiento), con `--policy.device=cuda`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a una politica robotica de este tipo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| 1ys1/areumii-pi0-handover-doubletask-v2-145 | 4.028.019.472 | no disponible | Apache 2.0 | Hugging Face, 21 descargas | Fine-tuning de π₀ para robot areumii, 2 tareas |
| lerobot/pi0_base | no disponible | no disponible | no disponible | Hugging Face | Modelo base fundacional de π₀ en LeRobot, generalista |
| π₀ de Physical Intelligence (OpenPI) | no disponible | no disponible | no disponible | OpenPI (repositorio abierto) | Implementacion original del modelo fundacional |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Entrenado exclusivamente para dos tareas concretas ("Pick up the eclipse and place it in the box" y "Pick up the pink bottle and place it in the box"); no generaliza a otras instrucciones sin reentrenamiento.
- Dataset pequeno (145 episodios, 92.066 fotogramas): alta probabilidad de sobreajuste a posiciones, iluminacion y objetos del entorno de grabacion.
- Sin resultados de evaluacion publicados: no hay evidencia medida de tasa de exito en robot real.
- Dependencia del hardware especifico: el modelo espera el robot areumii y tres camaras con nombres y resoluciones concretas (`head`, `left_wrist`, `right_wrist`); cambiar la configuracion requiere adaptar las claves de observacion.
- Instrucciones de tarea en ingles: no se documenta soporte multilingue.
- Riesgo de alucinacion en el sentido de acciones incorrectas o inseguras: como toda politica de imitacion, puede producir trayectorias no vistas si el estado de entrada se sale de la distribucion de entrenamiento.
- Sesgos: no documentados, pero el comportamiento queda limitado a la distribucion del dataset de teleoperacion.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base `lerobot/pi0_base` y la implementacion de π₀ pueden tener condiciones adicionales que deben verificarse antes de un despliegue productivo.
- No se dispone de informacion sobre cuantizacion, por lo que el despliegue en hardware limitado no esta validado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/1ys1/areumii-pi0-handover-doubletask-v2-145
- Dataset de entrenamiento: https://huggingface.co/datasets/1ys1/areumii-smolvla-handover-doubletask-v2-145
- Visualizacion del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=1ys1/areumii-smolvla-handover-doubletask-v2-145
- Modelo base: https://huggingface.co/lerobot/pi0_base
- Blog de π₀ (Physical Intelligence): https://www.physicalintelligence.company/blog/pi0
- Guia de LeRobot para pi0: https://huggingface.co/docs/lerobot/main/en/pi0
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
- Repositorio LeRobot: https://github.com/huggingface/lerobot
