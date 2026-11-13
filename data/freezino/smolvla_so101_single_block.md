# freezino/smolvla_so101_single_block

## Resumen

SmolVLA es un modelo compacto de tipo vision-language-action (VLA) desarrollado por Hugging Face, disenado para controlar robots manipuladores a partir de observaciones visuales y de estado, generando acciones motoras directamente. Este repositorio concreto, `freezino/smolvla_so101_single_block`, es un ajuste fino de SmolVLA realizado por el usuario freezino sobre el robot SO-101 (seguidor), entrenado para una unica tarea de manipulacion: recoger un bloque y depositarlo en una caja.

El modelo resuelve el problema de la politica de imitacion (imitation learning) en robotica de bajo coste: aprende a mapear dos o tres camaras y el estado de las articulaciones a comandos de accion de 6 dimensiones, sin necesidad de un modelo de lenguaje de gran tamano ni de infraestructura de GPU de datacenter. Con aproximadamente 450 millones de parametros y un tamano de repositorio de 0,9 GB, esta pensado para ejecutarse en hardware de consumo.

Es relevante ahora porque SmolVLA (paper arXiv:2506.01844) demuestra que un VLA compacto puede ser competitivo en tareas de manipulacion reales a un coste computacional reducido, y este repositorio es un ejemplo practico de despliegue sobre el brazo SO-101 dentro del ecosistema LeRobot. La licencia y los idiomas no estan declarados en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) compacto, implementado en LeRobot |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (no aplica como modelo de lenguaje; ventana de observacion multimodal) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (las instrucciones de tarea se pasan como texto, p. ej. "Pick up the block and put it in the box.") |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria lerobot) |

## Arquitectura y entrenamiento

SmolVLA es un modelo vision-language-action que combina un codificador visual y de lenguaje con un decodificador de acciones, siguiendo el diseno descrito en el paper arXiv:2506.01844. La politica consume tres entradas visuales de 256x256 (tres camaras) y un vector de estado de 6 dimensiones (`observation.state`), y produce un vector de accion de 6 dimensiones (`action`). El modelo se entrena mediante imitation learning supervisado sobre demostraciones de teleoperacion.

El ajuste fino de este repositorio se entreno sobre el dataset `freezino/so101_single_block`, con 50 episodios, 12.188 frames a 30 FPS y la tarea unica "Pick up the block and put it in the box.". La configuracion de entrenamiento fue: 20.000 pasos, batch size 64, optimizador AdamW, learning rate 0,0001, semilla 1000 y LeRobot 0.6.2. No se documenta el uso de RLHF, DPO ni tecnicas de decodificacion especulativa en la informacion disponible.

## Capacidades

- Generacion de acciones motoras de 6 dimensiones para control de un brazo robotico SO-101 (seguidor).
- Percepcion visual multimodal a partir de tres camaras simultaneas (`camera1`, `camera2`, `camera3`) con resolucion 256x256.
- Condicionamiento por instruccion de tarea en lenguaje natural (por ejemplo, "Pick up the block and put it in the box.").
- Ejecucion de una tarea de manipulacion concreta: recoger un bloque y colocarlo en una caja.
- Integracion nativa con el ecosistema LeRobot (entrenamiento, rollout e inferencia).
- No se documentan capacidades de tool calling, agentes multi-paso, razonamiento general ni generacion de texto libre.

## Casos de uso

- Manipulacion pick-and-place en laboratorio: el modelo ejecuta la tarea de recoger un bloque y depositarlo en una caja sobre el brazo SO-101, sirviendo como base para experimentos de imitation learning de bajo coste.
- Prototipado rapido de politicas roboticas: al estar entrenado con LeRobot 0.6.2 y pesos safetensors, permite iterar sobre el pipeline `lerobot-train` y `lerobot-rollout` en pocas horas.
- Educacion y docencia en robotica: su tamano (0,9 GB) y su naturaleza compacta lo hacen adecuado para demostraciones en aulas con hardware de consumo.
- Benchmark de referencia para nuevos datasets: sirve como politica baseline contra la que comparar reentrenamientos sobre el mismo dataset `so101_single_block`.
- Validacion de hardware SO-101: permite comprobar la calibracion de camaras y articulaciones ejecutando una tarea conocida y verificando el exito del pick-and-place.
- Investigacion en VLAs compactos: punto de partida para estudiar el efecto de cambios en el dataset, el numero de pasos o el learning rate sobre el exito de la tarea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 450 millones de parametros y pesos safetensors, la huella en memoria es del orden de 1-2 GB en precision completa, aunque no se confirma en la informacion.
- GPU recomendadas: no disponibles. SmolVLA se describe como desplegable en hardware de consumo, pero no se listan modelos concretos.
- Cabe en GPU de consumo: segun la descripcion del paper ("consumer-grade hardware"), si, aunque no se especifican modelos.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para inferencia, `lerobot-train` para reentrenamiento). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un VLA de robotica.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| smolvla_so101_single_block (este) | 450 M | VLA (LeRobot) | no disponible | no disponible | Hugging Face |
| SmolVLA base (Hugging Face) | no disponible | VLA | no disponible | no disponible | Hugging Face / LeRobot |
| Alternativas VLA de mayor tamano (p. ej. familias tipo OpenVLA) | no disponible | VLA | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada para establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- Entrenado para una unica tarea ("Pick up the block and put it in the box.") y un unico robot (SO-101 seguidor); no generaliza a otras tareas sin reentrenamiento.
- Requiere que las camaras y sus nombres coincidan exactamente con los usados en entrenamiento (`camera1`, `camera2`, `camera3`).
- No hay resultados de evaluacion publicados, por lo que se desconoce la tasa de exito real en el robot.
- Dataset muy reducido (50 episodios, 12.188 frames), lo que aumenta el riesgo de sobreajuste y baja robustez ante cambios de posicion, iluminacion o distractores.
- Licencia no declarada: no se puede confirmar el uso comercial.
- Idiomas no declarados; el condicionamiento por lenguaje natural esta limitado a la instruccion de entrenamiento.
- Riesgo de alucinacion en el sentido de generar acciones no validas o inseguras fuera de la distribucion de entrenamiento; requiere supervision humana en el robot.
- No se documentan sesgos especificos, pero al ser un modelo de robotica no aplica el concepto habitual de sesgo linguistico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/freezino/smolvla_so101_single_block
- Dataset de entrenamiento: https://huggingface.co/datasets/freezino/so101_single_block
- Paper SmolVLA: https://huggingface.co/papers/2506.01844
- Guia LeRobot SmolVLA: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentacion LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=freezino/so101_single_block
- Documentacion de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
