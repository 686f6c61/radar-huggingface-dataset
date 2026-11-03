# inkoziev/smolvla-so101-sim-v8a

## Resumen

smolvla-so101-sim-v8a es un modelo de vision-lenguaje-accion (VLA) obtenido por ajuste fino de lerobot/smolvla_base, publicado por el usuario inkoziev. Su proposito es controlar un brazo robotico SO-101 para agarrar un objeto concreto designado mediante texto, usando unicamente un par estereo rectificado (640x360 por ojo) y los angulos articulares como observacion. El modelo debe inferir por si mismo el punto de vista de la camara a partir de las imagenes, ya que no recibe informacion explicita de la pose de la camara.

Se trata de un experimento acotado: entrenado exclusivamente con datos de simulacion (dataset inkoziev/so101-sim-grasp-v8a), 40.000 pasos con tamano de lote 64 durante unas 16 horas en una RTX 3090, y evaluado con re-planificacion cada 10 pasos. Con 450 millones de parametros, es un modelo manejable en hardware de consumo, pensado para investigacion en manipulacion robotica y no para produccion general.

Su relevancia radica en la transferencia sim-a-real en robots de bajo coste: demuestra un flujo completo (simulador, generacion de datos, entrenamiento y ejecucion en brazo real) documentado en el repositorio so101-lab. No obstante, solo maneja un objeto y no fue entrenado con distractores, por lo que su alcance practico es limitado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje-accion (SmolVLA), basada en lerobot/smolvla_base |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors) |
| Idiomas soportados | no disponible (las instrucciones de tarea son en ingles, segun los ejemplos de la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria lerobot) |

## Arquitectura y entrenamiento

El modelo parte de lerobot/smolvla_base, un VLA de tipo SmolVLA que combina un codificador visual y de lenguaje con un cabezal de accion que emite objetivos articulares. En esta variante concreta, la entrada visual son dos imagenes estereo rectificadas (`observation.images.camera1` y `camera2`, 640x360, sin distorsion, ejes paralelos y punto principal centrado); `camera3` queda vacia (`empty_cameras=1`). La entrada de estado son 6 valores de angulos articulares, sin ninguna informacion de la pose de la camara, de modo que el modelo debe inferir el punto de vista a partir de las propias imagenes. La salida son 6 objetivos articulares: cinco articulaciones del brazo en grados (angulos URDF, 0 = centro del rango) y la pinza con 0 = cerrada y 100 = abierta.

El ajuste fino se realizo con LeRobot 0.6.0 sobre el dataset simulado inkoziev/so101-sim-grasp-v8a, que incluye aleatorizacion de escena, camara y servos. Se entrenaron 40.000 pasos con lote de 64 durante aproximadamente 16 horas en una RTX 3090. Se trata de una unica ejecucion de entrenamiento, sin busqueda de hiperparametros, y la evaluacion se hizo con re-planificacion cada 10 pasos (`n_action_steps = 10`). No se detalla en la informacion disponible si hubo RLHF, DPO ni el volumen exacto de tokens o episodios del dataset.

## Capacidades

- Control de manipulacion robotica: genera objetivos articulares para un brazo SO-101 a partir de observaciones visuales y de estado.
- Percepcion estereo: procesa un par estereo rectificado de 640x360 por ojo.
- Seguimiento de instrucciones en lenguaje natural: acepta ordenes como "pick up the blue cube" o "grasp the red ball".
- Agarre de un objeto designado: selecciona y agarra el objeto nombrado en la instruccion.
- Inferencia implicita del punto de vista: deduce la posicion de la camara sin recibirla como entrada.
- Control de pinza: emite apertura y cierre en escala 0–100.
- No dispone de tool calling, function calling, modo de razonamiento explicito, vision general, audio ni capacidades de agente multi-paso mas alla del bucle de re-planificacion cada 10 pasos.

## Casos de uso

- Investigacion en transferencia sim-a-real: entrenar en simulacion y desplegar en un SO-101 real para medir la brecha de rendimiento; el modelo esta disenado exactamente para este flujo y el repositorio so101-lab incluye el runner para el brazo real.
- Generacion de datos sinteticos y validacion de pipelines: sirve como referencia para comprobar que un pipeline de LeRobot 0.6.0, simulador y evaluacion cerrada funciona de extremo a extremo antes de escalar a tareas mas complejas.
- Agarre de objeto unico en entornos controlados: en una celda de laboratorio con un solo objeto y sin distractores, el modelo puede ejecutar la orden de agarre con re-planificacion cada 10 pasos.
- Docencia y prototipado en robotica de bajo coste: con 450 millones de parametros y 0,9 GB de repositorio, es viable entrenar y ejecutar variantes en una unica GPU de consumo como la RTX 3090 usada por el autor.
- Estudio de robustez ante cambios de camara y servos: al no recibir la pose de la camara, permite analizar como afectan la colocacion de las camaras y el comportamiento de los servos a la precision del agarre.
- Base para ajustes finos con distractores: aunque no fue entrenado con distractores, puede servir como punto de partida para experimentos que anadan objetos adicionales o nuevas instrucciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. La model card remite a los resultados en bucle cerrado en simulacion (puntos de vista dentro del rango de entrenamiento y no vistos) y en el brazo real al registro de investigacion del repositorio so101-lab, sin cifras en la ficha.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 450 millones de parametros, en precision completa (fp32) los pesos ocupan aproximadamente 1,8 GB, y en fp16/bf16 alrededor de 0,9 GB, a lo que hay que sumar el codificador visual y el estado de inferencia.
- GPU recomendadas: el autor entreno en una RTX 3090; para inferencia son suficientes GPU de consumo con al menos 4–8 GB de VRAM, aunque no se confirma oficialmente.
- Cabe en GPU de consumo: si, previsiblemente en tarjetas tipo RTX 3060/4060 o superiores, segun el tamano del modelo; no hay validacion publicada.
- Opciones de despliegue: libreria LeRobot (formato nativo del modelo); no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son adecuados para un VLA de robotica.
- Latencia y throughput: no disponibles. La evaluacion usa re-planificacion cada 10 pasos (`n_action_steps = 10`).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| smolvla-so101-sim-v8a | 450.046.176 | no disponible | VLA afinado para SO-101 | apache-2.0 | HuggingFace (inkoziev) |
| lerobot/smolvla_base | no disponible en la informacion | no disponible | VLA base | no disponible en la informacion | HuggingFace (lerobot) |
| Otros VLA de robotica | no disponible | no disponible | no disponible | no disponible | no disponible |

Solo se dispone de datos del modelo base; no se han identificado en la informacion proporcionada alternativas comparables con cifras verificables.

## Limitaciones y advertencias

- Entrenado exclusivamente con datos de simulacion: la precision en el brazo real depende de la colocacion de las camaras, del comportamiento de los servos y de diferencias de apariencia.
- Maneja un unico objeto y no fue entrenado con distractores, por lo que no es fiable en escenas con varios objetos.
- Una sola ejecucion de entrenamiento sin busqueda de hiperparametros: no hay garantia de que la configuracion sea optima.
- Requiere una configuracion estereo muy concreta (par rectificado, 640x360, ejes paralelos, punto principal centrado) y dejar `camera3` vacia; desviarse de ella degrada el rendimiento.
- Las instrucciones de tarea deben seguir el formato del entrenamiento (por ejemplo, "pick up the blue cube"); no se documenta soporte multilingue.
- Riesgo de alucinacion y de acciones incorrectas inherente a los modelos VLA; requiere supervision y limites de seguridad en el robot real.
- Licencia apache-2.0: permite uso comercial, pero el autor no ofrece garantias y el modelo esta pensado para investigacion.
- No se documentan sesgos especificos ni evaluaciones de seguridad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/inkoziev/smolvla-so101-sim-v8a
- Dataset de entrenamiento: https://huggingface.co/datasets/inkoziev/so101-sim-grasp-v8a
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Repositorio de codigo (simulador, generacion de datos, entrenamiento y evaluacion): https://github.com/Koziev/so101-lab
