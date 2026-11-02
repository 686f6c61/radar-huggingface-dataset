# palmpalm/my_smolvla_training

## Resumen

`palmpalm/my_smolvla_training` es un ajuste fino (fine-tuning) del modelo vision-lenguaje-accion (VLA) SmolVLA, desarrollado sobre la base `lerobot/smolvla_base` y publicado por el usuario `palmpalm` a traves de la libreria LeRobot de Hugging Face. SmolVLA, descrito en el paper arXiv 2506.01844, es un modelo compacto y eficiente que combina percepcion visual, comprension de instrucciones en lenguaje natural y generacion de acciones motoras para control de robots, con el objetivo de ser desplegable en hardware de consumo.

Este checkpoint concreto ha sido entrenado especificamente para la tarea "Place parts in tray" (colocar piezas en una bandeja) sobre un robot `so_follower` con dos camaras (muneca y vista superior), usando un dataset de 100 episodios y 58.714 fotogramas a 30 FPS. Con 450 millones de parametros, el modelo aprende una politica de imitacion que mapea observaciones (estado articular de 6 dimensiones e imagenes de 256x256) a acciones de 6 dimensiones.

Es relevante porque demuestra el flujo completo de entrenamiento de politicas roboticas con LeRobot: desde la grabacion de datos hasta el despliegue en robot real, con una licencia permisiva Apache 2.0 y un tamano que permite inferencia en GPU de consumo. No obstante, es un modelo de nicho, sin evaluacion publicada y con cero descargas, lo que lo situa como un artefacto experimental mas que como un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en transformer, segun SmolVLA (arXiv 2506.01844) |
| Parametros totales | 450.046.176 (aproximadamente 450 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de politica robotica, no de texto) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/AWQ) |
| Idiomas soportados | no disponible (las instrucciones de tarea se proporcionan en texto; el modelo card no especifica cobertura linguistica) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria `lerobot`) |
| Tamano del repositorio | 0,9 GB |
| Tipo de robot | `so_follower` |
| Camaras | `wrist`, `top` (3 entradas visuales de 3x256x256) |
| Entrada de estado | `observation.state` de forma (6,) |
| Salida de accion | `action` de forma (6,) |
| Modelo base | `lerobot/smolvla_base` |
| Dataset de entrenamiento | `palmpalm/Place_parts_in_tray` (100 episodios, 58.714 fotogramas, 30 FPS) |
| Version de LeRobot | 0.6.2 |

## Arquitectura y entrenamiento

SmolVLA es un modelo vision-lenguaje-accion que integra un codificador visual, un codificador de lenguaje y un decodificador de acciones en una unica politica entrenada por imitacion. El modelo consume observaciones multimodales (imagenes de camaras y estado articular del robot) junto con una instruccion de tarea en lenguaje natural, y produce directamente un vector de acciones de control. La arquitectura esta disenada para ser compacta y eficiente, de modo que pueda ejecutarse en hardware de consumo, en contraste con VLA de mayor tamano como OpenVLA o RT-2.

El entrenamiento de este checkpoint se realizo mediante ajuste fino supervisado del modelo base `lerobot/smolvla_base` sobre el dataset `palmpalm/Place_parts_in_tray`. La configuracion reportada incluye 20.000 pasos de entrenamiento, batch size de 32, optimizador AdamW con learning rate 0,0001 y semilla 1000. No se documenta en la model card el uso de RLHF, DPO ni tecnicas de refuerzo; se trata de aprendizaje por imitacion (behavior cloning). El dataset contiene 100 episodios de demostracion de la tarea "Place parts in tray" grabados a 30 FPS con dos camaras.

## Capacidades

- Control robotico por imitacion: genera acciones de 6 dimensiones para un robot `so_follower` a partir de observaciones visuales y de estado articular.
- Percepcion visual multimodal: procesa simultaneamente tres flujos de imagen de 256x256 (camara de muneca y camara superior, segun la configuracion declarada).
- Condicionamiento por instruccion en lenguaje natural: la tarea se especifica mediante un prompt de texto (por ejemplo, "Place parts in tray").
- Ejecucion de tareas de manipulacion: el modelo esta especializado en colocar piezas en una bandeja.
- Integracion con el ecosistema LeRobot: compatible con las herramientas `lerobot-rollout` y `lerobot-train`.
- No se documentan capacidades de tool calling, razonamiento multi-paso, agentes, vision general, audio ni modo thinking; es un modelo de politica robotica, no un LLM de proposito general.

## Casos de uso

- Automatizacion de tareas de pick-and-place en linea de montaje: el modelo puede ejecutar la secuencia de recoger piezas y depositarlas en una bandeja, entrenado especificamente para esa tarea con 100 demostraciones.
- Prototipado rapido de politicas roboticas con LeRobot: sirve como punto de partida para equipos que quieran validar el flujo completo de grabacion de datos, entrenamiento y despliegue en un robot `so_follower`.
- Investigacion en aprendizaje por imitacion: util como referencia de ajuste fino de SmolVLA sobre un dataset pequeno (100 episodios) para estudiar el efecto del numero de demostraciones en el exito de la tarea.
- Benchmarking de hardware de consumo para VLA: con 450 M de parametros y 0,9 GB de pesos, permite medir latencia y throughput de politicas VLA en GPUs de gama media.
- Educacion y formacion en robotica: adecuado para cursos practicos donde los estudiantes entrenan y despliegan una politica VLA real en un robot de bajo coste.
- Base para ajuste fino en tareas similares: al estar bajo Apache 2.0, puede reentrenarse sobre nuevos datasets de tareas de manipulacion sin restricciones de licencia.
- Validacion de pipelines de datos: permite comprobar la calidad de un dataset de demostraciones (episodios, FPS, sincronizacion de camaras) antes de escalar a tareas mas complejas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se han proporcionado resultados de evaluacion para esta politica ("No evaluation results have been provided for this policy yet").

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1-2 GB en precision FP32 (0,9 GB de pesos) y menos de 1 GB en FP16/BF16; el consumo real depende de los buffers de las camaras y del runtime de LeRobot.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; se espera funcionamiento en RTX 3060, RTX 4060, RTX 4090, A100 y H100, aunque no se documentan cifras oficiales.
- Cabe en GPU de consumo: si, dado el tamano de 450 M de parametros y el peso del repositorio de 0,9 GB.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para ejecucion en robot, `lerobot-train` para reentrenamiento); no se documenta soporte oficial para vLLM, llama.cpp, Ollama o TGI, al tratarse de una politica robotica y no de un LLM de texto.
- Latencia y throughput estimados: no disponibles; dependen del robot, de la frecuencia de captura (30 FPS en el dataset) y del hardware de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `palmpalm/my_smolvla_training` | ~450 M | VLA (politica robotica) | no aplica | Apache 2.0 | Hugging Face (0 descargas) |
| `lerobot/smolvla_base` | ~450 M (no confirmado en la informacion) | VLA (modelo base) | no aplica | no disponible en la informacion | Hugging Face |
| OpenVLA | no disponible en la informacion | VLA | no aplica | no disponible en la informacion | no disponible en la informacion |
| RT-2 | no disponible en la informacion | VLA | no aplica | no disponible en la informacion | no disponible en la informacion |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada; la comparativa se limita a aspectos estructurales y de licencia.

## Limitaciones y advertencias

- Especializacion extrema: el modelo solo ha sido entrenado para la tarea "Place parts in tray" y no generaliza a otras tareas sin reentrenamiento.
- Sin evaluacion publicada: no hay tasas de exito ni resultados de robot real, por lo que se desconoce su fiabilidad en produccion.
- Dependencia del hardware: entrenado para un robot `so_follower` con dos camaras concretas; cambios de robot, camaras, iluminacion o posicion de objetos pueden degradar el rendimiento.
- Riesgo de sobreajuste: con solo 100 episodios de entrenamiento, la politica puede memorizar posiciones y condiciones especificas del entorno de grabacion.
- Sin datos sobre sesgos: no se documentan sesgos conocidos, pero al ser un modelo de percepcion visual puede heredar sesgos de los datos de demostracion.
- Riesgo de alucinacion en el sentido de acciones incorrectas: como politica de imitacion, puede generar trayectorias no validas ante observaciones fuera de distribucion.
- Idiomas: no se especifica cobertura linguistica; el condicionamiento por texto se limita probablemente al idioma de las instrucciones del dataset.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias ni soporte; la responsabilidad de validacion recae en el integrador.
- Madurez: cero descargas y cero likes en el momento de la consulta, lo que sugiere un artefacto experimental sin validacion comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/palmpalm/my_smolvla_training
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/palmpalm/Place_parts_in_tray
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=palmpalm/Place_parts_in_tray
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de grabacion y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
