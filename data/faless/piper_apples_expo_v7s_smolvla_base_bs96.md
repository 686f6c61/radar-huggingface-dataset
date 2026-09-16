# Faless/piper_apples_expo_v7s_smolvla_base_bs96

## Resumen

Faless/piper_apples_expo_v7s_smolvla_base_bs96 es una politica robotica de vision-lenguaje-accion (VLA) publicada en Hugging Face por el usuario Faless. Se trata de un ajuste fino (fine-tuning) del modelo base lerobot/smolvla_base, entrenado con el framework LeRobot sobre el dataset Faless/piper_apples_expo_v7s para una unica tarea de manipulacion: recoger manzanas rojas una a una y depositarlas en una cesta verde.

El checkpoint tiene 450.046.176 parametros (aproximadamente 450 M) y ocupa 0,9 GB en el repositorio, lo que lo situa en la categoria de VLA compactos que, segun la model card, pueden desplegarse en hardware de consumo. Consume dos imagenes RGB de 256x256 px (camaras ego y front), un vector de estado de 8 dimensiones y produce un vector de accion de 7 dimensiones, todo bajo licencia Apache 2.0.

Su interes practico es que documenta el flujo completo de entrenamiento y publicacion de una politica VLA de bajo coste con LeRobot: 919 episodios y 1.251.545 fotogramas grabados a 30 FPS (unas 11,6 horas de demostraciones), 55.000 pasos de entrenamiento con batch de 96. Sirve como referencia reproducible y como punto de partida para reentrenar tareas de picking similares sobre el robot Piper.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) de la familia SmolVLA; el detalle interno de capas no esta disponible en la informacion proporcionada |
| Parametros totales | 450.046.176 (≈450 M) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible (es una politica de control por observacion, no un modelo de texto con ventana declarada) |
| Tipos de cuantizacion | no disponible; solo se publican pesos sin cuantizar |
| Idiomas soportados | no disponible (los tags del Hub no declaran idiomas; la instruccion de tarea del ejemplo esta en ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria lerobot) |
| Modelo base | lerobot/smolvla_base (ajuste fino completo) |
| Tipo de robot | piper_full |
| Camaras | ego, front |
| Entradas | observation.state (8,), observation.images.camera1 (3, 256, 256), observation.images.camera2 (3, 256, 256) |
| Salidas | action (7,) |
| Tamano del repositorio | 0,9 GB |
| Pipeline declarado | robotics |
| Fecha de creacion registrada en el Hub | 2026-09-16 |

## Arquitectura y entrenamiento

La model card define SmolVLA como un modelo compacto y eficiente de vision-lenguaje-accion que alcanza rendimiento competitivo con un coste computacional reducido y puede desplegarse en hardware de consumo. El checkpoint aqui descrito hereda esa arquitectura del modelo base lerobot/smolvla_base y se ha ajustado de forma completa (los 450 M de parametros). La informacion proporcionada no detalla la composicion interna (codificador visual, backbone de lenguaje, modulo de acciones, numero de capas ni mecanismo de generacion de acciones); esos detalles remiten al paper arXiv:2506.01844 y a la documentacion de LeRobot.

El entrenamiento se realizo con LeRobot 0.6.2 sobre 919 episodios de demostraciones teleoperadas de una sola tarea, con 1.251.545 fotogramas a 30 FPS (aproximadamente 11,6 horas de datos). La configuracion registrada es de 55.000 pasos, batch de 96, optimizador AdamW, learning rate 1e-4 y semilla 1000. De esos datos se deduce que se presentaron unos 5,28 millones de fotogramas al modelo, lo que equivale a unas 4,2 pasadas sobre el dataset completo (calculo aproximado realizado a partir de las cifras de la model card). No se documenta uso de RLHF, DPO ni tecnicas de refuerzo; el regimen es aprendizaje supervisado por imitacion sobre las acciones registradas.

## Capacidades

- Generacion de acciones de manipulacion continua de 7 dimensiones a partir de dos vistas de camara y del estado del robot (8 dimensiones).
- Ejecucion de la tarea concreta para la que fue entrenado: "Pick the red apples one by one and place them into the green basket".
- Condicionamiento por instruccion de tarea en lenguaje natural (parametro `--task` en el rollout).
- Percepcion visual desde dos camaras simultaneas a 256x256 px, con captura de ejemplo a 30 FPS.
- Control de un robot Piper (`piper_full`) mediante el comando `lerobot-rollout`.
- Reentrenamiento sobre nuevos datasets de la misma tarea o de tareas similares mediante `lerobot-train` partiendo de este checkpoint o del modelo base.
- Tool calling / function calling: no aplica (no es un modelo de lenguaje conversacional).
- Agentes y razonamiento multi-paso: no aplica en el sentido de agentes de texto; es una politica reactiva paso a paso.
- Capacidades multilingues: no disponibles ni documentadas.
- Modo pensamiento, audio u otras modalidades: no disponibles.

## Casos de uso

- Recoleccion robotica selectiva en entorno controlado: la politica esta entrenada especificamente para coger manzanas rojas y depositarlas en una cesta verde, por lo que puede emplearse directamente en celulas de laboratorio con objetos y disposicion similares a los del dataset.
- Prueba de concepto de pipelines VLA con LeRobot: sirve para validar de extremo a extremo el flujo `lerobot-train` y `lerobot-rollout` en un robot Piper sin partir de cero.
- Base para ajustes finos adicionales: al ser un fine-tuning de `lerobot/smolvla_base`, puede reentrenarse con nuevos episodios para variar posiciones de objetos, iluminacion o utillaje manteniendo la misma tarea.
- Investigacion sobre VLA compactos: con 450 M de parametros y 0,9 GB de pesos, permite experimentar con politicas VLA en una unica GPU de consumo y comparar coste frente a modelos de mayor tamano.
- Generacion de rollouts para analisis de datos: ejecutar la politica varias veces (`--duration` fijo) para medir tasa de exito propia y detectar fallos de agarre o de aproximacion.
- Demostraciones y formacion: usar el rollout grabado como material de referencia para operarios o para explicar el funcionamiento de la imitacion en robotica.
- Integracion en lineas de clasificacion o empaquetado en laboratorio: la salida de 7 dimensiones (posicion y orientacion mas pinza) es compatible con tareas de pick-and-place acotadas, siempre que el entorno se mantenga dentro de la distribucion de entrenamiento.
- Evaluacion comparativa de politicas: como checkpoint de referencia frente a otros ajustes sobre el mismo dataset (`Faless/piper_apples_expo_v7s`).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de esta politica incluye explicitamente la nota "_No evaluation results have been provided for this policy yet_", y la tabla de evaluacion en robot real (tarea, intentos, exitos, tasa de exito) esta vacia. Tampoco se proporcionan metricas de perdida de entrenamiento, tasas de exito ni comparaciones con otros checkpoints. No se deben asumir cifras de rendimiento no publicadas.

## Requisitos de hardware

- Pesos: el repositorio ocupa 0,9 GB, coherente con 450 M de parametros almacenados en 16 bits. En fp32 los pesos ocuparian aproximadamente 1,8 GB (estimacion).
- VRAM estimada para inferencia: del orden de 2 a 4 GB en fp16/bf16, sumando pesos, activaciones de los dos codificadores de imagen de 256x256 y el estado interno de la politica (estimacion, no publicada por el autor).
- GPU recomendadas: cualquier GPU de consumo con 6 GB o mas de VRAM deberia ser suficiente segun esa estimacion (RTX 3060, RTX 4060, RTX 4070, RTX 4090). No hay cifras oficiales para A100, H100 u otras GPU de centro de datos.
- Inferencia en CPU: no documentada; la frecuencia de control a 30 FPS que sugiere el ejemplo de rollout puede no alcanzarse sin aceleracion por GPU.
- Opciones de despliegue: LeRobot mediante `lerobot-rollout` (PyTorch), y entrenamiento con `lerobot-train`. vLLM, TGI, Ollama, llama.cpp y formatos GGUF no son aplicables a este tipo de politica.
- Latencia y throughput: no disponibles. El ejemplo de rollout configura camaras OpenCV a 640x480 y 30 FPS, y `--duration=60` para una ejecucion de 60 segundos.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Faless/piper_apples_expo_v7s_smolvla_base_bs96 | 450.046.176 | 2 imagenes 256x256 + estado (8,) | Picking de manzanas con robot Piper | apache-2.0 | Publico en Hugging Face |
| lerobot/smolvla_base | no confirmado en la informacion proporcionada (misma familia SmolVLA) | multimodal, orientado a robotica | VLA generalista de proposito base | no disponible en la informacion proporcionada | Publico en Hugging Face |

Otras alternativas de la misma categoria (VLA para control robotico) que podrian servir de comparacion son OpenVLA, pi0 y GR00T N1, entre otras. No se dispone en la informacion proporcionada de sus cifras de parametros, contexto, rendimiento, licencia o disponibilidad verificadas, por lo que no se incluyen datos numericos para evitar afirmaciones no contrastadas. La comparacion relevante y verificable en este caso es contra el modelo base y contra otros ajustes entrenados sobre el mismo dataset.

## Limitaciones y advertencias

- Politica especifica de tarea y de robot: esta entrenada exclusivamente para el robot `piper_full` con dos camaras (`ego`, `front`) y la instruccion de recoger manzanas rojas en una cesta verde. No es un modelo generalista y no se espera que funcione con otra morfologia, otro numero de camaras o nombres de claves de observacion distintos.
- Sin evaluacion publicada: no hay tasa de exito, numero de intentos ni condiciones de prueba, por lo que se desconoce su fiabilidad real en produccion.
- Riesgo de sobreajuste al entorno de grabacion: con 919 episodios de una sola tarea y aproximadamente 4,2 pasadas sobre el dataset, es probable que el rendimiento se degrade ante cambios de iluminacion, posicion de los objetos, fondo o presencia de distractores. No se documenta ninguna prueba de robustez.
- Riesgo de acciones incorrectas o inseguras: al ser una politica de control fisico, los fallos se traducen en movimientos reales del brazo. Se recomienda ejecutar con limites de par, parada de emergencia y supervision humana.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificacion, pero no se documenta la procedencia de las demostraciones ni si existen derechos de terceros sobre el dataset; conviene revisar la licencia del dataset y del modelo base antes de un uso comercial.
- Idiomas: no se declara soporte multilingue; la instruccion de tarea de referencia esta en ingles y no esta claro el comportamiento con instrucciones en castellano u otros idiomas.
- Ausencia de cuantizaciones oficiales: no se publican versiones cuantizadas ni compatibilidad declarada con motores de inferencia de LLM.
- Falta de validacion por la comunidad: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin senales externas de calidad.
- Datos incompletos en el repo: la fecha de creacion registrada (2026-09-16) y la ausencia de resultados de evaluacion dificultan trazar la version exacta del entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Faless/piper_apples_expo_v7s_smolvla_base_bs96
- Dataset de entrenamiento: https://huggingface.co/datasets/Faless/piper_apples_expo_v7s
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Faless/piper_apples_expo_v7s
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Paper de SmolVLA (arXiv:2506.01844): https://huggingface.co/papers/2506.01844
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion de datos y entrenamiento de politicas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference

Nota: las busquedas web realizadas no devolvieron resultados relevantes sobre este modelo; unicamente aparecieron hilos de foros de MSDN ajenos por completo al ambito de la robotica y de los modelos VLA.
