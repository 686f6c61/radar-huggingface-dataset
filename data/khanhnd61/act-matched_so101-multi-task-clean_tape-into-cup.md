# khanhnd61/act-matched_so101-multi-task-clean_tape-into-cup

## Resumen

El modelo `khanhnd61/act-matched_so101-multi-task-clean_tape-into-cup` es una politica de robótica basada en ACT (Action Chunking with Transformers), un método de aprendizaje por imitación que predice fragmentos cortos de acciones en lugar de pasos individuales. Lo publica el usuario khanhnd61 en Hugging Face y se ha entrenado con LeRobot, la librería de aprendizaje automático para robótica real de Hugging Face. No es un modelo de lenguaje: es un controlador visomotor que consume el estado de las articulaciones y dos cámaras y devuelve comandos de actuación.

El problema que resuelve es concreto: controlar un brazo robótico SO-101 (tipo `so_follower`) en tres tareas de manipulación de pick-and-place ("Put the tape into the box", "Put the tape into the cup", "Put the cup into the box") a partir de 44 episodios de teleoperación y 15.317 fotogramas grabados a 30 FPS. Su relevancia actual es la de servir como punto de partida reproducible para quien quiera replicar el flujo completo de LeRobot (grabar datos, entrenar una politica ACT, desplegarla en hardware real) con un modelo pequeño que cabe en una GPU de consumo.

El modelo tiene 76.438.278 parámetros en formato safetensors y un repositorio de 0,3 GB. La entrada son estado articular de dimensión 6 y dos imágenes RGB de 480x640 (`front` y `wrist`); la salida es un vector de acción de dimensión 6. Licencia Apache 2.0, sin resultados de evaluación publicados y con 0 descargas y 0 likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): transformador con encoder de observaciones, CVAE y decoder de acciones, según el paper arXiv:2304.13705 |
| Parametros totales | 76.438.278 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (la politica opera sobre la ventana de observación actual y predice un chunk de acciones; el tamano del chunk no se especifica en la model card) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible / no aplica: el modelo no procesa lenguaje, solo estado articular e imágenes. Las tareas se invocan mediante etiquetas de texto en la CLI de LeRobot, no como entrada al modelo |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |
| Tipo de robot | `so_follower` (SO-101) |
| Camaras de entrada | `front`, `wrist` (3, 480, 640) |
| Entrada de estado | `observation.state`, shape (6,) |
| Salida | `action`, shape (6,) |
| Tamano del repositorio | 0,3 GB |
| Pipeline declarado | robotics |
| Version de LeRobot | 0.6.1 |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que combina un transformador con un autoencoder variacional condicional (CVAE). El encoder procesa las observaciones (estado articular y las dos imágenes) y el decoder genera un chunk de acciones futuras de una sola pasada, lo que reduce el problema de horizonte y mitiga la acumulación de error típica de las politicas que predicen un único paso. El componente CVAE modela la variabilidad de las demostraciones humanas durante el entrenamiento y se usa para capturar la multimodalidad de las trayectorias de teleoperación.

El entrenamiento se ha realizado con LeRobot 0.6.1 sobre el dataset `khanhnd61/so101-multi-task-clean`: 44 episodios, 15.317 fotogramas a 30 FPS, tres tareas de manipulación. La configuración declarada es 5.230 pasos de entrenamiento, batch size 8, optimizador AdamW, learning rate 1e-05 y semilla 1000. No se documenta el uso de RLHF, DPO ni ningún otro ajuste por preferencias, ni el número total de tokens o muestras efectivas más allá de esos pasos y del tamano del dataset. Tampoco se especifica el tamano del chunk de acciones, la resolución interna de procesamiento de imagen ni si se aplicaron aumentos de datos.

## Capacidades

- Generación de acciones de control visomotor: dado el estado articular (6 dimensiones) y las imágenes de las cámaras frontal y de muneca, produce un vector de acción de 6 dimensiones para el brazo SO-101.
- Aprendizaje por imitación multi-tarea: una sola politica cubre tres tareas ("Put the tape into the box", "Put the tape into the cup", "Put the cup into the box"), condicionada por el enunciado de la tarea.
- Ejecución a 30 FPS, coherente con la frecuencia de grabación del dataset de entrenamiento.
- No dispone de generación de texto, razonamiento simbolico, código, matemáticas ni visión general: sus cámaras son sensores de control, no entradas de comprensión visual abierta.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso en el sentido de los LLM; su única forma de planificación es la predicción de chunks de acción.
- No tiene capacidades multilingües ni procesamiento de lenguaje natural.
- No dispone de modo de razonamiento explícito ("thinking mode"), audio ni otras modalidades.

## Casos de uso

- Replicación de un pipeline completo de aprendizaje por imitación: sirve como referencia funcional para validar la instalación de LeRobot 0.6.1, la calibración del SO-101 y el comando `lerobot-rollout`, comparando el comportamiento obtenido con el de una politica entrenada por uno mismo.
- Automatización de pick-and-place en laboratorio: colocar cinta y vasos en sus receptáculos en una celda de ensayo, con las tres tareas cubiertas por el mismo checkpoint y sin necesidad de reentrenar por tarea.
- Benchmark interno de hardware robótico: al ser un modelo de 76M parámetros y 0,3 GB, permite medir latencia de inferencia y throughput en distintas GPU o incluso en CPU, aislando el efecto del hardware en el lazo de control a 30 FPS.
- Recogida de datos y control remoto supervisado: uso del modelo como politica base durante sesiones de teleoperación, comparando las acciones propuestas por la politica con las del operador para detectar desviaciones de calibración.
- Docencia y prototipado en robótica: ejemplo autocontenido de ACT con dataset pequeno (44 episodios) para explicar action chunking, CVAE y el formato de dataset de LeRobot.
- Punto de partida para fine-tuning: reentrenar con `lerobot-train --policy.type=act` sobre un dataset propio de tareas similares, usando este checkpoint como inicialización o como linea base de comparación.
- Pruebas de robustez y análisis de fallos: evaluar la degradación de la politica ante cambios de iluminación, posición de objetos o distracciones, ya que el autor no ha publicado ninguna tabla de éxito y ese análisis queda abierto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye la sección de evaluación con la indicación explicita de que todavía no se han proporcionado resultados para esta politica, y la plantilla de tabla de tareas (trials, successes, success rate) aparece sin rellenar. El paper de ACT (arXiv:2304.13705) reporta tasas de éxito para el método general, pero esos números corresponden a los experimentos originales de los autores y no a este checkpoint concreto, por lo que no se trasladan a esta ficha.

## Requisitos de hardware

- VRAM estimada para inferencia: no especificada por el autor. Como referencia de orden de magnitud, 76,4 millones de parámetros en fp32 ocupan aproximadamente 0,3 GB de pesos, por lo que la huella es muy inferior a la de cualquier LLM de tamano medio.
- GPU recomendadas: no disponibles en la documentación. El flujo de LeRobot permite `--policy.device=cuda`; dada la magnitud del modelo, cualquier GPU con soporte CUDA moderna es suficiente.
- Compatibilidad con GPU de consumo: previsiblemente si, incluidas GPU de gama media y baja, ya que el cuello de botella principal es el procesamiento de dos flujos de imagen a 480x640 y 30 FPS, no el tamano de la red.
- Ejecución en CPU: no descartable por tamano de pesos, pero no hay datos publicados de latencia; el requisito de 30 FPS hace que la CPU sea un objetivo exigente para el preprocesamiento de imagen.
- Opciones de despliegue: LeRobot, mediante `lerobot-rollout` con `--policy.path=khanhnd61/act-matched_so101-multi-task-clean_tape-into-cup`, y entrenamiento/reentrenamiento con `lerobot-train --policy.type=act`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de politica.
- Latencia y throughput estimados: no disponibles. El único dato objetivo es que el dataset se grabó a 30 FPS, lo que marca la frecuencia de control esperada.
- Requisitos de hardware físico: brazo `so_follower` (SO-101) con dos cámaras configuradas obligatoriamente como `front` y `wrist`, con nombres que deben coincidir con las claves de observación usadas en el entrenamiento.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / chunk | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| act-matched_so101-multi-task-clean_tape-into-cup (este modelo) | ACT (imitación, transformer + CVAE) | 76.438.278 | Chunk de acciones, tamano no disponible | apache-2.0 | Hugging Face, 0 descargas |
| ACT original (Zhao et al., arXiv:2304.13705) | ACT | No disponible | No disponible | No disponible en la informacion proporcionada | Paper y código de referencia |
| Diffusion Policy (Chi et al.) | Politica generativa por difusión | No disponible | No disponible | No disponible en la informacion proporcionada | Publicación académica |
| SmolVLA (Hugging Face) | VLA con componente de lenguaje | No disponible | No disponible | No disponible en la informacion proporcionada | Ecosistema LeRobot |

No se dispone de datos comparativos de parámetros, contexto ni rendimiento para las alternativas dentro de la información proporcionada; la comparación queda por tanto limitada a la categoria metodológica (politicas de imitación para brazos de bajo coste entrenadas con LeRobot).

## Limitaciones y advertencias

- Ausencia total de evaluación: el autor no ha publicado ninguna tasa de éxito, número de ensayos ni condiciones de prueba, por lo que no hay evidencia cuantitativa de que la politica funcione de forma fiable en el mundo real.
- Dataset muy pequeno: 44 episodios y 15.317 fotogramas para tres tareas, lo que limita la cobertura de posiciones, orientaciones y condiciones de iluminación y favorece el sobreajuste al entorno de grabación.
- Fuerte dependencia del montaje: cambios en la posición de las cámaras, la iluminación, la mesa, los objetos, la calibración del brazo o el uso de otro robot del mismo tipo pueden degradar el comportamiento sin aviso.
- Ambigüedad entre el nombre del repositorio y las tareas: el identificador menciona "tape-into-cup", mientras que la model card lista tres tareas; conviene verificar con `--task` cuál se está invocando y si el checkpoint responde a las tres.
- Requisitos de entrada estrictos: las claves de observación (`observation.state`, `observation.images.front`, `observation.images.wrist`) y las resoluciones deben coincidir exactamente con las del entrenamiento.
- Sin capacidades de lenguaje ni generalización semántica: no se pueden dar instrucciones en lenguaje natural al modelo; el texto de la tarea solo actúa como etiqueta de condicionamiento en el flujo de LeRobot.
- Riesgo de fallo silencioso en producción: al no existir modo de razonamiento ni señales de confianza, la politica puede generar acciones incorrectas sin indicar incertidumbre. En robótica real esto implica riesgo físico, por lo que se recomienda operar con parada de emergencia, limites de par y supervisión humana.
- Sesgos: no se ha documentado ningún análisis de sesgo; en el contexto robótico, el sesgo relevante es el de las demostraciones de teleoperación (estilo, velocidad y preferencias del operador que grabó los datos).
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; el uso en producción queda bajo responsabilidad de quien lo despliega.
- El modelo referencia el paper de ACT y la librería LeRobot para su cita; conviene respetar ambas atribuciones.
- Los resultados de la búsqueda web realizada no aportan información técnica relevante sobre este modelo: los enlaces recuperados corresponden a foros de jardinería y no guardan relación con el repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/khanhnd61/act-matched_so101-multi-task-clean_tape-into-cup
- Dataset de entrenamiento: https://huggingface.co/datasets/khanhnd61/so101-multi-task-clean
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=khanhnd61/so101-multi-task-clean
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento de politicas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia y despliegue: https://huggingface.co/docs/lerobot/main/en/inference
