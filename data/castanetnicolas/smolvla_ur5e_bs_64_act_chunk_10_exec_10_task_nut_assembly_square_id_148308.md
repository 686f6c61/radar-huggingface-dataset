# castanetnicolas/smolvla_UR5e_BS_64_Act_Chunk_10_Exec_10_TASK_nut_assembly_square_ID_148308

## Resumen

SmolVLA es un modelo de vision-lenguaje-accion (VLA) compacto que combina un backbone de vision-lenguaje preentrenado con un modulo generador de acciones, disenado para tareas de manipulacion robotica con coste computacional reducido. Este repositorio concreto, publicado por el usuario `castanetnicolas`, es un ajuste fino del modelo base `lerobot/smolvla_base` para una unica tarea de pick-and-place: coger una tuerca cuadrada y colocarla sobre una clavija cuadrada. El modelo tiene aproximadamente 450 millones de parametros (450.046.176) y un tamano de repositorio de 0,9 GB.

El modelo resuelve el problema de generar comandos de accion continuos a partir de observaciones multimodales (estado del robot e imagenes de camara). Se entrena mediante aprendizaje por imitacion sobre un dataset de demostraciones teleoperadas y se ejecuta con la libreria LeRobot de Hugging Face. Su relevancia radica en que demuestra que politicas VLA utiles pueden caber en hardware de consumo, en contraste con alternativas de varios miles de millones de parametros.

Es importante senalar que no se trata de un modelo de lenguaje de proposito general: no genera texto, no responde a instrucciones abiertas y solo produce acciones para el robot y la tarea para los que fue entrenado. La model card declara el tipo de robot como `panda`, con camaras `agentview` y `robot0_eye_in_hand`, aunque el nombre del repositorio incluye `UR5e`, lo que supone una discrepancia que conviene verificar antes de desplegarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA); ajuste fino de SmolVLA, basado en transformer con backbone de vision-lenguaje y modulo de generacion de acciones |
| Parametros totales | 450.046.176 (~450 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos distribuidos en safetensors; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible / no aplica (politica robotica de una sola tarea, no un modelo de texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Libreria | lerobot |
| Pipeline | robotics |
| Modelo base | lerobot/smolvla_base |
| Tamano del repositorio | 0,9 GB |

## Arquitectura y entrenamiento

SmolVLA es un modelo de vision-lenguaje-accion que combina un backbone de vision-lenguaje preentrenado con un experto de acciones. La entrada del modelo combina tres imagenes de camara con resolucion 3x256x256 y un vector de estado del robot de dimension 6, y produce un vector de accion de dimension 7. Los detalles internos de la arquitectura (numero de capas, mecanismo de atencion o estrategia de generacion de acciones) no se detallan en la informacion proporcionada; el articulo de referencia es arXiv:2506.01844, que describe el metodo general.

El ajuste fino se realizo sobre el dataset `castanetnicolas/robomimic_square_ph_image84`, compuesto por 200 episodios (30.154 fotogramas a 20 FPS) de la tarea "Pick up the square nut and place it on the square peg". La configuracion de entrenamiento declarada es: 40.000 pasos, batch size 64, optimizador AdamW, tasa de aprendizaje 1e-4, semilla 1000 y LeRobot 0.6.1. El nombre del repositorio sugiere action chunking con tamano 10 y ejecucion de 10 pasos por chunk. No se especifica en la informacion disponible si hubo RLHF, DPO u otras fases de post-entrenamiento.

## Capacidades

- Generacion de acciones de robot: produce un vector de accion de dimension 7 a partir de observaciones, adecuado para control de manipuladores.
- Percepcion visual multimodal: consume tres flujos de imagen de 3x256x256 (camaras de vista general y de muneca).
- Fusion de estado y vision: integra el estado articular o de efector de dimension 6 con las imagenes para condicionar la accion.
- Ejecucion de una tarea especifica: coger una tuerca cuadrada y colocarla sobre una clavija cuadrada (pick-and-place de precision).
- Inferencia en hardware de consumo: el modelo base esta disenado para desplegarse en equipos asequibles.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso de tipo agente ni planificacion simbolica.
- No es un modelo conversacional: no procesa lenguaje natural abierto salvo, en su caso, la cadena de tarea usada como condicionamiento en LeRobot.

## Casos de uso

- Investigacion en aprendizaje por imitacion: usar este ajuste fino como referencia reproducible para estudiar como se comporta SmolVLA en una tarea de pick-and-place concreta, partiendo de un checkpoint ya entrenado.
- Base para nuevos ajustes finos: servir como punto de partida para transferir la politica a variantes de la misma tarea (posiciones u objetos ligeramente distintos), dado que parte de `lerobot/smolvla_base`.
- Prototipado de ensamblaje de precision: la tarea de insertar una tuerca en una clavija es representativa de operaciones de ajuste fino en linea de montaje, por lo que el checkpoint sirve para validar hardware y camaras antes de escalar.
- Banco de pruebas de LeRobot: el repositorio incluye el comando `lerobot-rollout` listo para ejecutar, lo que lo hace util para validar la cadena de instalacion, calibracion de robot y captura de camaras.
- Evaluacion de despliegue en hardware de consumo: con 450 M de parametros, permite comprobar el rendimiento de inferencia de una politica VLA en una GPU de gama media o incluso en CPU.
- Automatizacion de pick-and-place de un solo objeto: en entornos controlados con iluminacion y posiciones estables, puede integrarse como controlador de bajo nivel para la tarea de ensamblaje de tuerca cuadrada.
- Educacion y demostraciones: util para ensenar el flujo completo de teleoperacion, grabacion de datos y entrenamiento de politicas en cursos de robotica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card indica explicitamente: "_No evaluation results have been provided for this policy yet._" No existen tasas de exito, numero de ensayos ni metricas de tarea reportadas para este ajuste fino.

## Requisitos de hardware

- VRAM estimada para inferencia: en precision fp32 el modelo ocupa aproximadamente 1,8 GB de pesos; en fp16/bf16, alrededor de 0,9 GB. Sumando activaciones e imagenes, cabe holgadamente en GPUs con 4-8 GB de VRAM.
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM; se espera funcionamiento fluido en RTX 3060, RTX 4060, RTX 4090, A100 o H100. La model card del modelo base afirma que esta pensado para hardware de consumo.
- Compatibilidad con GPU de consumo: si, es uno de los puntos fuertes de SmolVLA por su tamano de 450 M de parametros. Tambien es plausible su ejecucion en CPU para pruebas, aunque no se documentan latencias.
- Opciones de despliegue: LeRobot (comando `lerobot-rollout`) como via principal; el formato safetensors es compatible con PyTorch. No se documenta soporte especifico para vLLM, llama.cpp, Ollama o TGI, ya que no es un modelo de texto.
- Latencia y throughput estimados: no disponible. Dependen del robot, la frecuencia de control y el hardware; el dataset esta grabado a 20 FPS, lo que sugiere una frecuencia de control del orden de decenas de hercios, pero no se confirma.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este ajuste (smolvla nut assembly) | ~450 M | no disponible | Pick-and-place de tuerca cuadrada | Apache 2.0 | Hugging Face (0 descargas) |
| lerobot/smolvla_base | ~450 M | no disponible | Politica VLA general, ajustable | Apache 2.0 | Hugging Face |
| OpenVLA | ~7 B | no disponible en esta ficha | Manipulacion generalista | Licencia propia (ver repositorio) | Hugging Face |
| pi0 (Physical Intelligence) | ~3,3 B | no disponible en esta ficha | Manipulacion generalista | Licencia propia | Repositorio del autor |

Los datos de OpenVLA y pi0 corresponden a informacion publica de sus respectivos proyectos y no se han verificado contra la informacion proporcionada en esta busqueda; se incluyen solo como referencia de categoria. El competidor mas directo y del que si hay datos confirmados es el propio `lerobot/smolvla_base`, del que este modelo es un ajuste fino especializado.

## Limitaciones y advertencias

- Modelo de tarea unica: solo esta entrenado para "Pick up the square nut and place it on the square peg"; no generaliza a otras tareas sin reentrenamiento.
- Sin resultados de evaluacion: no hay evidencia publicada de tasa de exito, robustez ni repetibilidad, por lo que no deberia desplegarse en produccion sin una validacion propia.
- Discrepancia de robot: el nombre del repositorio menciona `UR5e`, pero la model card declara `panda`. Es imprescindible confirmar el robot y las camaras reales antes de usarlo.
- Desajuste en la interfaz de observaciones: la model card describe camaras `agentview` y `robot0_eye_in_hand`, pero la tabla de entradas lista `camera1`, `camera2` y `camera3`. Los nombres de las claves de observacion deben coincidir exactamente con los del entrenamiento.
- Dimension de estado y accion: estado de 6 dimensiones y accion de 7 dimensiones; un robot con otra cinematica no es compatible directamente.
- Sesgos y alucinacion: al ser un modelo de control, el riesgo no es "alucinar" texto, sino producir acciones incorrectas o inseguras ante objetos, iluminacion o posiciones fuera de distribucion. Se recomienda supervision humana y limites de seguridad en el robot.
- Idiomas: no aplica; no hay soporte multilingue de lenguaje natural.
- Licencia: Apache 2.0 permite uso comercial, pero el autor original del metodo y de los datos debe citarse segun lo indicado en la model card.
- Datos de entrenamiento limitados: 200 episodios y 30.154 fotogramas en una sola tarea; la diversidad es escasa, lo que reduce la robustez ante variaciones.
- Fecha de creacion futura: el repositorio figura como creado el 2026-10-07, dato que conviene tratar con cautela.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/castanetnicolas/smolvla_UR5e_BS_64_Act_Chunk_10_Exec_10_TASK_nut_assembly_square_ID_148308
- Dataset de entrenamiento: https://huggingface.co/datasets/castanetnicolas/robomimic_square_ph_image84
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=castanetnicolas/robomimic_square_ph_image84
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Articulo SmolVLA (arXiv:2506.01844): https://huggingface.co/papers/2506.01844
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia SmolVLA de LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Documentacion de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
- Guia de aprendizaje por imitacion: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
