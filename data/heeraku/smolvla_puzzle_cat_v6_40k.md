# heeraku/smolvla_puzzle_cat_v6_40k

## Resumen

SmolVLA es un modelo compacto de tipo vision-language-action (VLA) desarrollado por Hugging Face, disenado para controlar robots manipuladores a partir de observaciones visuales y del estado del robot. Esta ficha concreta, `heeraku/smolvla_puzzle_cat_v6_40k`, es un fine-tuning de `lerobot/smolvla_base` realizado por el usuario heeraku sobre un dataset propio de tareas de manipulacion de cubos (puzzle-cat-v6), con 40.000 pasos de entrenamiento y un total de 450.046.176 parametros. El problema que resuelve es el control de politicas de robotica de extremo a extremo: dado un estado de articulaciones de 6 dimensiones y tres camaras de 256x256, predice una accion de 6 dimensiones.

El modelo es relevante porque demuestra el flujo tipico de LeRobot: partir de un VLA base preentrenado y adaptarlo con un dataset pequeno (475 episodios, 299.224 frames a 30 FPS) a una tarea concreta de pick-and-place y giro de cubos. Su tamano reducido (450M de parametros) permite desplegarlo en hardware de consumo, lo que lo hace util como referencia para quienes quieran reproducir el pipeline o adaptar el modelo a su propio robot.

La informacion disponible no incluye detalles sobre la composicion exacta del preentrenamiento del modelo base, los idiomas soportados ni resultados de benchmarks. La model card se limita a describir entradas, salidas, dataset y tareas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) compacta, segun el paper SmolVLA (arXiv:2506.01844) |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF u otras) |
| Idiomas soportados | no disponible (modelo de robotica, no de texto general) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria lerobot) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `lerobot/smolvla_base`, un VLA compacto presentado en el paper SmolVLA (arXiv:2506.01844). La arquitectura combina un codificador visual y un modelo de lenguaje para producir acciones de robot directamente a partir de observaciones multimodales. En esta version concreta, la politica consume `observation.state` de forma `(6,)` y tres imagenes de `(3, 256, 256)` (camaras `top` y `wrist`, con tres entradas visuales declaradas) y emite una accion de forma `(6,)`. El robot objetivo es `so_follower`.

El entrenamiento se realizo con LeRobot sobre el dataset `heeraku/puzzle-cat-v6`, compuesto por 475 episodios y 299.224 frames a 30 FPS. Las tareas cubren un repertorio amplio de pick-and-place y giros de 90 grados de cubos entre posiciones (mid-right, far-right, mid-left, far-left, top-right, top-left, bottom-right, bottom-left), con instrucciones en lenguaje natural del tipo "pick up the mid-right cube and place it in the top-right slot" o "turn the cube in the top-left slot counter-clockwise". No se dispone de informacion sobre el numero de tokens de preentrenamiento del modelo base, la composicion del dataset original ni si hubo RLHF o DPO.

## Capacidades

- Control de robot manipulador `so_follower` mediante prediccion de acciones de 6 dimensiones.
- Percepcion visual multimodal a partir de tres camaras de 256x256 (top y wrist).
- Ejecucion de tareas de pick-and-place entre ocho posiciones (top-left, top-right, bottom-left, bottom-right, mid-left, mid-right, far-left, far-right).
- Ejecucion de giros de 90 grados en sentido horario y antihorario sobre cubos en distintas posiciones.
- Composicion de tareas compuestas: recoger, girar 90 grados y colocar en otra posicion.
- Seguimiento de instrucciones en lenguaje natural en ingles para seleccionar la tarea.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso general ni multilingueismo.

## Casos de uso

- Automatizacion de pick-and-place en laboratorio: el modelo puede recoger un cubo de una posicion y colocarlo en otra siguiendo una instruccion en lenguaje natural, usando las tres camaras para localizar el objeto y el estado de articulaciones para planificar la accion.
- Manipulacion con giro de objetos: las tareas compuestas del dataset (recoger, girar 90 grados y colocar) permiten usar el modelo en escenarios de orientacion de piezas antes de insertarlas en un slot.
- Base para fine-tuning en robotica de bajo coste: al tener 450M de parametros y licencia Apache 2.0, sirve como punto de partida para adaptar un VLA a un robot SO-100/SO-101 con un dataset propio de pocos cientos de episodios.
- Investigacion en aprendizaje por imitacion: el modelo y el dataset asociado permiten reproducir experimentos de imitation learning con LeRobot y comparar hiperparametros (por ejemplo, 40k pasos frente a la variante de 5k del mismo autor).
- Prototipado de pipelines de robotica en hardware de consumo: su tamano reducido permite iterar en una estacion de trabajo con GPU consumer antes de desplegar en el robot.
- Evaluacion de generalizacion espacial: las 48 tareas del dataset (combinaciones de origen, destino y giro) permiten medir la capacidad del modelo de generalizar a combinaciones no vistas durante el entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 450M de parametros en safetensors, el peso en FP32 ronda 1,8 GB y en FP16 unos 0,9 GB, a lo que hay que sumar el codificador visual y los buffers de las tres camaras de 256x256.
- GPU recomendadas: no disponible; por tamano, cualquier GPU con al menos 4-8 GB de VRAM deberia ser suficiente, pero el autor no lo especifica.
- Cabe en GPU consumer: previsiblemente si, dado el tamano del modelo, aunque no hay confirmacion en la informacion proporcionada.
- Opciones de despliegue: LeRobot (libreria oficial, `lerobot`), con el flujo de evaluacion descrito en la guia de SmolVLA de Hugging Face. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| heeraku/smolvla_puzzle_cat_v6_40k | 450.046.176 | no disponible | Apache 2.0 | Hugging Face (14 descargas) |
| lerobot/smolvla_base | no disponible | no disponible | no disponible | Hugging Face (modelo base) |
| heeraku/smolvla_puzzle_cat_5k | no disponible | no disponible | no disponible | Hugging Face (variante del mismo autor) |

No se dispone de datos de rendimiento ni de benchmarks que permitan una comparacion cuantitativa con alternativas. La comparacion se limita a parametros, licencia y disponibilidad.

## Limitaciones y advertencias

- Modelo especializado en un unico entorno y robot (`so_follower`); no es un modelo de proposito general ni un chatbot.
- Entrenado exclusivamente sobre el dataset `heeraku/puzzle-cat-v6` (475 episodios), por lo que la generalizacion fuera de las posiciones y objetos de ese dataset es limitada.
- Las instrucciones de tarea estan en ingles y limitadas al vocabulario del dataset; no se documenta soporte multilingue.
- Riesgo de sobreajuste a las condiciones de iluminacion, camaras y mesa del dataset de entrenamiento.
- No se han publicado benchmarks ni evaluaciones independientes; el rendimiento real en el robot no esta cuantificado en la informacion disponible.
- Aunque la licencia es Apache 2.0, el uso comercial requeriria validar el comportamiento del modelo en el entorno de destino.
- El modelo base `lerobot/smolvla_base` tiene su propia licencia y condiciones, no detalladas en la informacion proporcionada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/heeraku/smolvla_puzzle_cat_v6_40k
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/heeraku/puzzle-cat-v6
- Variante del mismo autor: https://huggingface.co/heeraku/smolvla_puzzle_cat_5k
- Paper SmolVLA: https://huggingface.co/papers/2506.01844
- Guia de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
