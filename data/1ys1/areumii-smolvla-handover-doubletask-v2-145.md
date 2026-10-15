# 1ys1/areumii-smolvla-handover-doubletask-v2-145

## Resumen

El modelo `1ys1/areumii-smolvla-handover-doubletask-v2-145` es un ajuste fino de SmolVLA, un modelo compacto de visión-lenguaje-acción (VLA) orientado a robótica, desarrollado por el usuario 1ys1 y publicado en Hugging Face bajo licencia Apache 2.0. Parte del checkpoint base `lerobot/smolvla_base` y se ha entrenado con LeRobot 0.6.1 sobre un dataset propio de 145 episodios y 92 066 fotogramas grabados a 30 FPS.

El modelo resuelve una tarea de manipulación concreta: coger un objeto (denominado "eclipse" o una botella rosa, según la variante de la instrucción) y depositarlo en una caja. Está especializado en un robot de tipo `areumii` con tres cámaras (head, left_wrist, right_wrist) y un estado proprioceptivo de 6 dimensiones, y produce un vector de acción de 16 dimensiones. Su relevancia radica en que los modelos VLA de este tamaño pueden ejecutarse en hardware de consumo, lo que abarata el despliegue de políticas visuomotoras en laboratorios y talleres pequeños.

Con 450 046 176 parámetros (aproximadamente 450 M) y un repositorio de 0,9 GB, es un modelo de política robótica, no un modelo de lenguaje conversacional: no tiene ventana de contexto declarada ni soporte multilingüe documentado. No se han publicado resultados de evaluación en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje-accion (VLA) compacta, basada en SmolVLA (paper arXiv:2506.01844) |
| Parametros totales | 450.046.176 (aproximadamente 450 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de politica robotica; no declara ventana de contexto) |
| Tipos de cuantizacion | no disponible (no se publican variantes cuantizadas) |
| Idiomas soportados | no disponible (las instrucciones del dataset estan en ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria lerobot) |

Datos adicionales de la ficha: tipo de robot `areumii`, camaras `head`, `left_wrist` y `right_wrist`; entradas `observation.state` de forma (6,) y tres imagenes de (3, 256, 256); salida `action` de forma (16,); tamano del repositorio 0,9 GB; modelo base `lerobot/smolvla_base`.

## Arquitectura y entrenamiento

SmolVLA es, segun el articulo referenciado (arXiv:2506.01844), un modelo de vision-lenguaje-accion compacto que combina un codificador visual-lenguaje con un experto de accion, disenado para obtener un rendimiento competitivo con un coste computacional reducido y poder desplegarse en hardware de consumo. En este ajuste concreto, el modelo consume tres flujos de imagen a 256x256 pixeles mas el estado articular, y emite directamente un vector de accion de 16 dimensiones, siguiendo el paradigma de imitacion de politicas de LeRobot.

El ajuste fino se realizo sobre el dataset `1ys1/areumii-smolvla-handover-doubletask-v2-145`, compuesto por 145 episodios, 92 066 fotogramas a 30 FPS y dos tareas de recogida y colocacion en caja. La configuracion de entrenamiento declarada es: 30 000 pasos, tamano de lote 8, optimizador AdamW, tasa de aprendizaje 0,0001, semilla 1000 y LeRobot 0.6.1. No se especifica en la informacion disponible si hubo etapas de RLHF, DPO u otro ajuste por preferencias, ni la composicion exacta del preentrenamiento del modelo base.

## Capacidades

- Generacion de acciones motoras continuas: produce un vector de 16 dimensiones a partir de observaciones visuales y de estado, sin intermediacion de texto.
- Percepcion visual multimodal: procesa simultaneamente tres camaras RGB de 256x256 (cabeza y dos munecas), lo que permite razonar sobre la posicion relativa de objeto, pinza y caja.
- Seguimiento de instrucciones de tarea en lenguaje natural: el dataset incluye dos consignas ("Pick up the eclipse and place it in the box." y "Pick up the pink bottle and place it in the box."), que se pasan por el parametro `--task` en la CLI de LeRobot.
- Ejecucion de politicas visuomotoras de extremo a extremo (end-to-end) sin planificacion simbolica intermedia.
- Despliegue en hardware de consumo, segun la descripcion del modelo base SmolVLA.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, razonamiento textual ni capacidades de audio. Estas capacidades no estan disponibles en la informacion proporcionada.

## Casos de uso

- Recogida y colocacion en linea de produccion robotizada: el modelo ejecuta la secuencia completa de aproximacion, agarre y deposito en caja a partir de las tres camaras, lo que permite sustituir scripts de control escritos a mano por una politica aprendida en un robot `areumii`.
- Transferencia de objetos (handover) en celdas colaborativas: con las camaras de muneca puede estimar el punto de agarre del objeto que le entrega un operario humano y depositarlo en un contenedor fijo.
- Recoleccion de datos para imitacion: sirve como politica de arranque para grabar demostraciones adicionales y ampliar el dataset, reduciendo el coste de etiquetado manual en nuevos objetos o posiciones.
- Prototipado rapido en laboratorio: al caber en GPU de consumo, un equipo de investigacion puede iterar sobre variantes de politica sin reservar nodos con A100 o H100.
- Automatizacion de tareas de clasificacion simple de piezas: cambiando la instruccion de tarea y reentrenando con pocos episodios, el mismo pipeline de LeRobot permite distinguir entre dos objetos (eclipse frente a botella rosa) y depositarlos en la misma caja.
- Validacion de pipelines de aprendizaje por imitacion: el par modelo+dataset de 145 episodios es util como referencia reproducible para medir el efecto de cambios en el numero de camaras, la tasa de fotogramas o el numero de pasos de entrenamiento.
- Demostraciones docentes de robotica con IA: su tamano reducido y su licencia Apache 2.0 lo hacen apto para cursos practicos de VLA sin necesidad de infraestructura dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card indica explicitamente: "No evaluation results have been provided for this policy yet." No se dispone de tasas de exito por tarea, numero de ensayos ni condiciones de evaluacion. No se deben extrapolar cifras del articulo de SmolVLA a este ajuste concreto, ya que corresponden al modelo base y a otros conjuntos de datos.

## Requisitos de hardware

- Huella de pesos: alrededor de 0,9 GB en el repositorio; en precision bf16 los pesos ocupan del orden de 0,9 GB y en fp32 en torno a 1,8 GB (estimacion a partir del recuento de parametros de 450 M).
- VRAM estimada para inferencia: no disponible de forma oficial; con tres camaras de 256x256 y el estado de 6 dimensiones, se espera que quepa holgadamente en GPUs con 4 GB o mas de VRAM, aunque el fabricante no publica cifras.
- GPU recomendadas: cualquier GPU NVIDIA moderna con soporte CUDA es suficiente por tamano; el modelo base SmolVLA esta pensado para hardware de consumo segun su descripcion. No se especifican modelos concretos en la informacion disponible.
- Cabe en GPU de consumo: si, previsiblemente en gamas como RTX 3060, 4060, 4070 o 4090, dado el tamano del modelo; no hay confirmacion oficial en la ficha.
- Opciones de despliegue: LeRobot mediante el comando `lerobot-rollout` con `--policy.path=1ys1/areumii-smolvla-handover-doubletask-v2-145`. Entrenamiento y ajuste con `lerobot-train` partiendo de `lerobot/smolvla_base`. No procede el uso de vLLM, llama.cpp, Ollama o TGI, ya que no es un modelo de lenguaje con pesos GGUF.
- Latencia y throughput: no disponibles. El dataset de entrenamiento se grabo a 30 FPS, pero no se documenta la tasa de control alcanzable en inferencia ni el tiempo por paso.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| 1ys1/areumii-smolvla-handover-doubletask-v2-145 | 450 M | no disponible | apache-2.0 | Hugging Face, 0 descargas, 0 likes | Ajuste fino para robot `areumii` con dos tareas |
| lerobot/smolvla_base | 450 M (modelo base del anterior) | no disponible | no disponible en la informacion proporcionada | Hugging Face (repo de LeRobot) | Punto de partida del ajuste fino; requiere datos propios para tareas concretas |
| 1ys1/areumii-smolvla-handover-bottle-v2-99 | no disponible | no disponible | no disponible | Hugging Face | Variante del mismo autor centrada en el manejo de botella |
| OpenVLA, pi0 y otros VLA | no disponible | no disponible | no disponible | no disponible | No se incluyen datos de estos modelos en la informacion proporcionada |

No se dispone de cifras de rendimiento comparado para ninguno de los modelos de la tabla, por lo que la comparacion se limita a parametros, licencia y disponibilidad.

## Limitaciones y advertencias

- Cero evaluaciones publicadas: no hay tasas de exito ni condiciones de prueba, por lo que no se puede garantizar que la politica funcione fuera de la distribucion de los 145 episodios de entrenamiento.
- Altamente especializado: solo cubre las tareas "Pick up the eclipse and place it in the box." y "Pick up the pink bottle and place it in the box." sobre un robot `areumii` con una configuracion concreta de camaras; cualquier cambio de objeto, iluminacion, posicion o robot puede degradar el comportamiento.
- Sensibilidad a la configuracion de sensores: los nombres y las resoluciones de camara deben coincidir con las claves de observacion del entrenamiento (tres camaras a 256x256 y estado de 6 dimensiones); un desajuste provoca fallos de ejecucion o acciones invalidas.
- Riesgo de alucinacion motora: como toda politica de imitacion, puede generar trayectorias plausibles pero incorrectas ante situaciones no vistas, con riesgo de colision o de dano al objeto.
- Idiomas: no hay soporte multilingue declarado; las unicas instrucciones documentadas estan en ingles.
- Contexto: no se declara ventana de contexto; el modelo no mantiene historial conversacional ni memoria de episodios previos mas alla de la observacion actual.
- Licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantias y el modelo base `lerobot/smolvla_base` puede tener condiciones propias que conviene revisar.
- Datos y sesgos: no se documenta la diversidad de operadores, posiciones de objeto ni condiciones de iluminacion del dataset, por lo que no es posible evaluar sesgos sistematicos de la politica.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/1ys1/areumii-smolvla-handover-doubletask-v2-145
- Dataset de entrenamiento: https://huggingface.co/datasets/1ys1/areumii-smolvla-handover-doubletask-v2-145
- Visualizador del dataset (LeRobot Spaces): https://huggingface.co/spaces/lerobot/visualize_dataset?path=1ys1/areumii-smolvla-handover-doubletask-v2-145
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Articulo de SmolVLA: https://huggingface.co/papers/2506.01844
- Guia de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Variante del mismo autor: https://huggingface.co/1ys1/areumii-smolvla-handover-bottle-v2-99
- Proyecto AReuMii-VLA: https://github.com/happpps/AReuMii-VLA
- Fork de LeRobot con SmolVLA: https://github.com/zyqdragon/lerobot_smolvla
- Ficha del dataset original en DataCombats: https://www.datacombats.com/datasets/1ys1/areumii-handover_v1_20260916_193502
