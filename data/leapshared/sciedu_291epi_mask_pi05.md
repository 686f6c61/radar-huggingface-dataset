# leapshared/SciEdu_291epi_mask_pi05

## Resumen

SciEdu_291epi_mask_pi05 es un policy de robótica de tipo Vision-Language-Action (VLA) publicado por el usuario leapshared en HuggingFace. Se trata de un fine-tuning del modelo base lerobot/pi05_base (π₀.₅ de Physical Intelligence), adaptado a tareas concretas de manipulación bimanual en un entorno de experimentos de laboratorio educativo. El modelo aprende a ejecutar secuencias motoras a partir de observaciones visuales y de estado del robot, y no es un modelo de lenguaje general: su salida es un vector de acciones.

π₀.₅ es la evolución de π₀ orientada a la generalización en entornos y situaciones no vistos durante el entrenamiento, según indica el propio autor en la model card. La implementación disponible en este repositorio proviene del ecosistema LeRobot de HuggingFace, adaptada desde el repositorio OpenPI de Physical Intelligence. El modelo tiene unos 4.143 millones de parámetros (4,14B) y se distribuye bajo licencia Apache-2.0.

Este fine-tuning concreto se ha entrenado sobre el dataset leapshared/SciEdu_291epi_mask, compuesto por 291 episodios y 597.322 fotogramas grabados a 30 FPS, con tareas como clasificación de hojas, reacciones redox y experimentos con un electroscopio. Es relevante para quien trabaje en imitación robótica, automatización de laboratorio o investigación en VLA, ya que demuestra el flujo completo de fine-tuning de π₀.₅ en LeRobot sobre un robot bimanual de tipo OpenArm.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en π₀.₅ (pi05); detalles internos no disponibles en la informacion proporcionada |
| Parametros totales | 4.143.404.816 (≈4,14B) |
| Parametros activos | no aplica (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; pesos distribuidos en safetensors |
| Idiomas soportados | no disponible (modelo orientado a tareas de manipulacion, no a generacion de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Biblioteca | lerobot |
| Pipeline | robotics |
| Modelo base | lerobot/pi05_base |
| Tipo de robot | bi_openarm_follower |
| Entradas | observation.state (16,); observation.images.follower_d455f (3, 480, 640); observation.images.left_wrist (3, 480, 640); observation.images.right_wrist (3, 480, 640) |
| Salidas | action (16,) |
| Descargas | 0 |
| Likes | 0 |
| Tamano del repositorio | 165,7 GB |

## Arquitectura y entrenamiento

La model card identifica el modelo como π₀.₅ (Pi05), un modelo Vision-Language-Action de Physical Intelligence concebido para generalizar a entornos y situaciones que no aparecen durante el entrenamiento, y que evoluciona el modelo π₀ anterior. La implementación en este repositorio deriva del repositorio OpenPI de código abierto y se integra en LeRobot. La informacion proporcionada no detalla el tipo concreto de backbone, el mecanismo de atencion ni el componente de generacion de acciones, por lo que esos extremos quedan como no disponibles.

El entrenamiento de este fine-tuning se realizó sobre el dataset leapshared/SciEdu_291epi_mask, con 291 episodios y 597.322 fotogramas a 30 FPS. La configuración de entrenamiento registrada es: 50.000 pasos, batch size 32, optimizador AdamW, learning rate 2,5e-5, semilla 42 y version de LeRobot 0.6.1. No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion detallada del dataset ni si se emplearon tecnicas de RLHF o DPO, algo poco habitual en este tipo de politicas de imitacion.

## Capacidades

- Generacion de acciones de manipulacion bimanual: produce un vector de accion de dimension 16 a partir del estado del robot y de tres flujos de video.
- Percepcion visual multi-camara: consume tres imagenes simultaneas a 480x640 (camara frontal follower_d455f y dos camaras de muneca, izquierda y derecha).
- Ejecucion de tareas de laboratorio concretas aprendidas por imitacion: clasificacion de hojas y experimentos de reaccion redox y electroscopio.
- Control de robot bimanual: disenado para el robot bi_openarm_follower.
- Condicionamiento por tarea en lenguaje: las ordenes de tarea se pasan como cadena (por ejemplo, "Do the leaf sorting experiment. put the leaf on the right side").
- Despliegue en tiempo real mediante el comando lerobot-rollout con estrategia base.
- Tool calling / function calling: no disponible (no es un modelo de lenguaje orientado a agentes).
- Capacidades multilingues: no disponibles.
- Modo de razonamiento explicito o thinking mode: no disponible.

## Casos de uso

- Automatizacion de practicas de laboratorio educativo: el policy reproduce paso a paso experimentos como la reaccion redox (levantar la placa metalica, moverla sobre la disolucion, introducirla y retirarla) controlando un robot bimanual, lo que permite estandarizar demostraciones sin intervencion humana constante.
- Investigacion en imitacion robótica: sirve como punto de partida reproducible para estudiar el fine-tuning de π₀.₅ sobre datasets pequenos (291 episodios) y evaluar la transferencia de tareas de laboratorio con LeRobot 0.6.1.
- Demostraciones divulgativas de VLA: ejecutar la clasificacion de hojas con el comando lerobot-rollout permite mostrar en ferias o aulas como un VLA traduce ordenes en lenguaje y video en movimientos reales.
- Recogida de datos por teleoperacion y reentrenamiento: al estar integrado en LeRobot, el modelo puede usarse como politica inicial y luego refinarse con nuevos episodios grabados con el mismo robot y las mismas camaras.
- Benchmarking interno de politicas bimanuales: comparar el rendimiento de este fine-tuning frente a otros checkpoints entrenados sobre SciEdu_291epi_mask permite medir el efecto de cambios en datos o hiperparametros.
- Prototipado de flujos de laboratorio quimico o fisico: la tarea del electroscopio (frotar la placa, acercarla y alejarla del electroscopio, senalar la lamina metalica) ilustra como automatizar gestos precisos y repetitivos en un banco de laboratorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de exito (success rate), ni comparaciones con otros checkpoints, ni resultados de evaluaciones tipo MMLU, HumanEval o GSM8K, que ademas no aplican a un modelo de accion robótica.

## Requisitos de hardware

- VRAM estimada para inferencia: con 4,14B parametros, aproximadamente 8-9 GB en bf16/fp16 y en torno a 16-17 GB en fp32 (estimaciones a partir del numero de parametros; no confirmadas por el autor).
- Repositorio: 165,7 GB en disco, previsiblemente por la inclusion de multiples checkpoints; conviene verificar los ficheros realmente necesarios antes de descargar.
- GPU recomendadas: no especificadas en la informacion disponible. Por tamano, una GPU con 16 GB o mas de VRAM (RTX 4080/4090, A100, H100) deberia bastar para inferencia en bf16.
- Cabida en GPU de consumo: probable en tarjetas con 16 GB o mas de VRAM en precision reducida; no confirmado por el autor.
- Opciones de despliegue: lerobot-rollout con strategy.type=base (unico metodo documentado en la model card). No se documentan vLLM, llama.cpp, Ollama ni TGI, que no son adecuados para un policy de accion.
- Latencia y throughput: no disponibles. La ejecucion esta ligada al bucle de control del robot y a las camaras a 30 FPS, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| leapshared/SciEdu_291epi_mask_pi05 | ≈4,14B | no disponible | VLA bimanual (laboratorio educativo) | apache-2.0 | HuggingFace, 0 descargas |
| lerobot/pi05_base (modelo base) | no disponible en la informacion | no disponible | VLA generalista π₀.₅ | no disponible en la informacion | HuggingFace |
| π₀ (pi0) de Physical Intelligence | no disponible en la informacion | no disponible | VLA generalista | no disponible en la informacion | repositorio OpenPI |

No se dispone de datos suficientes en la informacion proporcionada para comparar parametros, contexto o rendimiento con alternativas como OpenVLA u otras politicas VLA. Cualquier comparacion cuantitativa adicional queda como no disponible.

## Limitaciones y advertencias

- Es un policy de accion, no un modelo de lenguaje: no genera texto ni responde a preguntas; su salida es un vector de accion de dimension 16.
- Fuerte acoplamiento al hardware: entrenado especificamente para el robot bi_openarm_follower y las camaras follower_d455f, left_wrist y right_wrist. Los nombres e indices de camara deben coincidir exactamente con las claves de observacion del entrenamiento o el modelo no funcionara.
- Dominio muy restringido: solo cubre las tareas del dataset SciEdu_291epi_mask (clasificacion de hojas, reaccion redox, electroscopio) y la postura de reposo. Fuera de esas tareas no hay garantia de comportamiento correcto.
- Riesgo de fallo por cambio de entorno: al ser un fine-tuning sobre 291 episodios, la variacion de iluminacion, posicion de objetos o disposicion del banco puede degradar el rendimiento; no se publican metricas de robustez.
- Alucinacion: no aplica en el sentido de generacion de texto, pero si existe el riesgo de que el modelo ejecute movimientos no previstos ante entradas fuera de distribucion.
- Sin datos de sesgo ni evaluacion de seguridad: la model card no documenta analisis de sesgos ni protocolos de seguridad fisica, algo critico en manipulacion robótica.
- Licencia: Apache-2.0, que permite uso comercial; conviene revisar igualmente las condiciones del modelo base pi05_base y del repositorio OpenPI por posibles restricciones adicionales.
- Estado del repositorio: 0 descargas y 0 likes, sin evidencia publica de validacion por terceros.
- Sin cuantizaciones publicadas ni documentacion de despliegue fuera de LeRobot.
- Fecha de publicacion registrada en 2026-10-13, posterior a la de la mayoria de recursos de referencia; verificar la vigencia de los enlaces antes de usarlos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/leapshared/SciEdu_291epi_mask_pi05
- Dataset de entrenamiento: https://huggingface.co/datasets/leapshared/SciEdu_291epi_mask
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Blog de π₀.₅ (Pi05) de Physical Intelligence: https://www.physicalintelligence.company/blog/pi05
- Repositorio OpenPI: https://github.com/Physical-Intelligence/openpi
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de pi05 en LeRobot: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=leapshared/SciEdu_291epi_mask
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de grabacion y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de la CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
