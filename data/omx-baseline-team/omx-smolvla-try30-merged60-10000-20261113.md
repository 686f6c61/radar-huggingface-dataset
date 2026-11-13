# omx-baseline-team/omx-smolvla-try30-merged60-10000-20261113

## Resumen

OMX SmolVLA try30 merged60 es un ajuste fino (fine-tuning) del modelo base `lerobot/smolvla_base`, un modelo de vision-lenguaje-accion (VLA) orientado a control robótico. Lo desarrolla el equipo `omx-baseline-team` como parte de una colección de experimentos de robótica (denominada try30) y está pensado para ejecutar una tarea concreta de manipulación: mover un objeto rojo a una casilla marcada con una cruz. El modelo se distribuye a través de la librería LeRobot y solo incluye los ficheros necesarios para inferencia, no para reentrenamiento.

Arquitectónicamente hereda la estructura de SmolVLA: un codificador visual congelado (basado en la familia SmolVLM2) más un "action expert" entrenado, que es la única parte que se ha ajustado en este fine-tuning. El modelo tiene 450.046.176 parámetros totales (unos 450 millones) y un tamaño de repositorio de 1,8 GB en formato `safetensors`. El entrenamiento se realizó sobre 60 episodios (17.819 frames) procedentes de dos subconjuntos de 30 episodios cada uno, con 10.000 pasos de optimización.

Su relevancia es acotada y muy específica: no es un modelo de propósito general, sino una política robótica de un solo cometido, entrenada para un robot y una configuración de cámaras determinados. Resulta útil como referencia para quienes trabajan con SmolVLA y LeRobot y quieren ver un ejemplo de fine-tuning del action expert con datos propios, así como para reproducir el pipeline de despliegue. No se han publicado datos de licencia ni de idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje-accion (VLA) basada en SmolVLA: codificador visual congelado (SmolVLM2) + action expert entrenado |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el autor indica entrenamiento en fp32; no se documentan cuantizaciones) |
| Idiomas soportados | no disponible (la tarea se especifica en ingles mediante texto) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo base | lerobot/smolvla_base (rev 5e8d12a6e2975b0e5e5fce7c8caf47c371d257b6) |
| Libreria | lerobot 0.6.1 |
| Tamano del repositorio | 1,8 GB |
| Tarea entrenada | "Move the red object to the square marked with a cross." |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura SmolVLA, un VLA que combina un codificador visual de la familia SmolVLM2 (congelado durante el fine-tuning) con un módulo de predicción de acciones ("action expert") que es el único componente entrenado. En este ajuste se mantuvo el codificador visual congelado y se entrenó únicamente el action expert en precisión fp32. El modelo base es `lerobot/smolvla_base`, sobre el que se aplica un fine-tuning supervisado con pares observación-acción.

Los datos de entrenamiento provienen de la colección try30 del equipo (fecha 2026-11-12), compuesta por dos subconjuntos: `omx_1_4_try30` (30 episodios de la esquina inferior izquierda a la superior izquierda) y `omx_2_4_try30` (30 episodios de la esquina inferior derecha a la superior izquierda), que suman 60 episodios y 17.819 frames, todos usados para entrenamiento. La configuración fue: batch de 16, 10.000 pasos, optimizador AdamW con learning rate 1e-4 (warmup de 1.000 pasos y decaimiento coseno hasta 2,5e-6), grad clipping de 10 y semilla 1000, usando LeRobot 0.6.1. Se añadió un texto de tarea explícito porque el dataset original tenía la tarea vacía. No se documenta el uso de RLHF, DPO ni otras técnicas de alineación.

## Capacidades

- Control robótico de manipulación: genera acciones (trayectorias del brazo y pinza) a partir de observaciones visuales y de la instrucción textual de la tarea.
- Percepción visual multi-cámara: consume dos vistas de cámara (`observation.images.top` y `observation.images.wrist`), aunque en esta colección sus significados están intercambiados respecto a los nombres (ver advertencias).
- Condicionamiento por instrucción en lenguaje natural: la tarea se pasa como texto y debe coincidir exactamente con la usada en entrenamiento.
- Ejecución en tiempo real con inferencia RTC (real-time chunking): el comando de ejemplo usa `--inference.type=rtc` con `execution_horizon=10` y `queue_threshold=40`.
- No se documentan capacidades de generación de texto, razonamiento general, código, matemáticas, tool calling, agentes ni multimodalidad más allá de la percepción visual para control.

## Casos de uso

- Manipulación pick-and-place en laboratorio: el modelo ejecuta la tarea de mover un objeto rojo a una casilla marcada con una cruz, adecuado para validar pipelines de VLA en un banco de pruebas controlado.
- Reproducción de experimentos con SmolVLA: sirve como ejemplo de fine-tuning del action expert con datos propios y configuración documentada (manifest.json), útil para investigadores que replican el flujo de LeRobot.
- Base para nuevos fine-tunings: al ser un ajuste sobre `lerobot/smolvla_base`, puede emplearse como punto de partida para entrenar tareas similares con más episodios o distintas posiciones iniciales.
- Despliegue en robot físico OMX follower: el comando de ejemplo usa `--robot.type=omx_follower` con puerto serie y dos cámaras OpenCV, por lo que encaja en montajes de brazo robótico de bajo coste.
- Validación de configuración de cámaras y calibración: útil para comprobar que el `robot.id`, `use_degrees` y el mapeo de cámaras coinciden con los de la recogida de datos antes de entrenar modelos mayores.
- Pruebas de inferencia en tiempo real: con inferencia RTC y horizonte de ejecución corto, sirve para medir latencia y estabilidad del bucle de control en GPU o Apple Silicon MPS.
- Docencia y demostraciones: por su tamaño contenido (450 M parámetros, 1,8 GB) y su naturaleza offline, es manejable para demostrar conceptos de VLA en entornos académicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 450 M parámetros en fp32 el peso de los pesos ronda los 1,8 GB, por lo que se necesita al menos esa cantidad más el overhead de activaciones y del tokenizer de SmolVLM2. Una GPU con 8 GB o más debería ser suficiente en la práctica, aunque el autor no lo confirma.
- GPU recomendadas: el autor indica que se necesita una GPU NVIDIA (con `--policy.device=cuda`) o Apple Silicon con MPS. No especifica modelos concretos (A100, H100, RTX 4090, etc.).
- CPU: el autor advierte explícitamente de que la CPU es demasiado lenta para la inferencia.
- Opciones de despliegue: `lerobot-rollout` con la estrategia `base` y política `omx-baseline-team/omx-smolvla-try30-merged60-10000-20261113`; instalación mediante `pip install 'lerobot[smolvla,dataset]==0.6.1'` (av 15.x). No se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. El autor solo indica que la primera ejecución descarga el modelo (~1,8 GB) y el tokenizer de SmolVLM2.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| omx-smolvla-try30-merged60-10000-20261113 | 450 M | no disponible | Manipulacion pick-and-place (tarea unica) | no disponible | Hugging Face (LeRobot) |
| lerobot/smolvla_base | no disponible | no disponible | VLA base de proposito general para robotica | no disponible | Hugging Face (LeRobot) |
| Otros SmolVLA fine-tuned del equipo omx | no disponible | no disponible | Tareas de manipulacion especificas | no disponible | Hugging Face (LeRobot) |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de tarea única: solo se ha entrenado para "Move the red object to the square marked with a cross."; no generaliza a otras instrucciones ni objetos.
- Advertencia crítica de cámaras: en esta colección las claves están intercambiadas respecto a sus nombres. `observation.images.top` es la vista de la pinza (gripper) y `observation.images.wrist` es la vista cenital (overhead). En inferencia hay que configurar las cámaras exactamente igual que en la recogida y comprobarlo con la previsualización.
- `--rename_map` obligatorio y en dirección opuesta a modelos SmolVLA anteriores del equipo: aquí wrist/overhead -> camera1 y top/gripper -> camera2. No se debe copiar el comando de modelos previos.
- El texto de tarea (`--task`) debe coincidir exactamente con el usado en entrenamiento.
- La configuración del robot debe coincidir con la de recogida: mismo `robot.id` (mismo fichero de calibración) y mismo `use_degrees`.
- Solo probado en modo offline: el autor indica que aún no se ha ejecutado en el robot real. Recomienda una primera ejecución corta (10-30 s) con alguien listo para detener el robot.
- Licencia no disponible: no se puede confirmar el uso comercial ni las restricciones de redistribución.
- Idiomas no disponibles: la instrucción de tarea está en inglés y no se documenta soporte multilingüe.
- Riesgo de alucinación y sesgos: no evaluados ni documentados por el autor; al ser una política de control, el fallo se manifiesta como acciones incorrectas más que como texto inventado.
- Solo se suben ficheros de inferencia; no se distribuyen checkpoints para reentrenamiento.
- Dependencia de versiones concretas: LeRobot 0.6.1 y av 15.x.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/omx-baseline-team/omx-smolvla-try30-merged60-10000-20261113
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Repositorio de LeRobot: no disponible en la informacion proporcionada
- Paper de SmolVLA: no disponible en la informacion proporcionada
- Demo o blog del autor: no disponible en la informacion proporcionada
