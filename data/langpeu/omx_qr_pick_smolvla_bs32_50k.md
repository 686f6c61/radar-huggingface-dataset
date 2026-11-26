# langpeu/omx_qr_pick_smolvla_bs32_50k

## Resumen

`langpeu/omx_qr_pick_smolvla_bs32_50k` es una política robótica de tipo vision-language-action (VLA) obtenida por fine-tuning del modelo base `lerobot/smolvla_base`. La desarrolla el usuario `langpeu` y resuelve una tarea concreta de picking: un brazo robótico ROBOTIS OMX-AI debe recoger un cubo con código QR de una ranura numerada de una cuadrícula y depositarlo en una caja. El modelo recibe el estado articular (6 valores) y tres cámaras a 640×480, y emite objetivos de posición para las 6 articulaciones del brazo, incluida la pinza.

Técnicamente es un fine-tuning de SmolVLA, la familia de políticas VLA compactas de Hugging Face integradas en LeRobot, con 450.046.176 parámetros totales (unos 450 M) y pesos en formato safetensors. El repositorio ocupa 0,9 GB y se distribuye bajo licencia Apache 2.0. El entrenamiento se realizó con LeRobot 0.6.1 sobre una RTX 4080, con batch de 32 durante 50.000 pasos y una tasa de aprendizaje de 1e-4, partiendo de los 90 episodios del dataset `langpeu/omx_qr_pick_v1`.

Su relevancia es la de un ejemplo práctico y reproducible de cómo adaptar un VLA pequeño a una tarea industrial de picking con instrucciones en lenguaje natural ("Pick up the cube in slot N and put it in the box"). No es un modelo de propósito general: es una política especializada para un robot, tres cámaras y una disposición física determinados, y el propio autor indica que los resultados aún no se han medido.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action), fine-tuning de `lerobot/smolvla_base` |
| Parámetros totales | 450.046.176 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible (no aplica como contexto de texto; ventana de observación basada en 3 cámaras 640×480 y estado de 6 articulaciones) |
| Tipos de cuantización | no disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | no disponible (las instrucciones de tarea del autor están en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Librería | LeRobot |
| Pipeline | robotics |
| Tamaño del repositorio | 0,9 GB |
| Dataset de entrenamiento | `langpeu/omx_qr_pick_v1` (episodios 0–89, 30 por ranura) |
| Entorno de entrenamiento | LeRobot 0.6.1, RTX 4080 |
| Hiperparámetros | batch 32, 50.000 pasos, lr 1e-4, action chunk 50 (`n_action_steps` 50) |
| Entradas | `observation.state` (6 articulaciones) + `camera1` (superior), `camera2` (muñeca), `camera3` (lateral), 640×480 |
| Salidas | 6 objetivos articulares: shoulder_pan, shoulder_lift, elbow_flex, wrist_flex, wrist_roll, gripper |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de SmolVLA, una política VLA que combina un codificador visual, un codificador de lenguaje para la instrucción de tarea y un decodificador de acciones que produce secuencias de comandos motores (action chunks). En este caso el chunk es de 50 pasos (`n_action_steps` 50), lo que permite emitir bloques de 50 acciones por inferencia en lugar de una acción por paso. La entrada combina el vector de estado articular de 6 dimensiones con tres flujos de cámara a 640×480 (vista superior, muñeca y lateral), y la salida son 6 objetivos articulares que incluyen la pinza.

El entrenamiento parte de `lerobot/smolvla_base` y se realiza sobre el dataset `langpeu/omx_qr_pick_v1`, que contiene 90 episodios (30 por cada una de las tres ranuras). Se usaron batch de 32 y 50.000 pasos con lr 1e-4 en LeRobot 0.6.1 sobre una RTX 4080. El autor indica explícitamente que esta versión se reentrenó aumentando batch y pasos respecto a un modelo anterior de 90 (referencia ambigua en la model card). No se documentan detalles sobre composición del dataset más allá del número de episodios, ni sobre uso de RLHF/DPO (poco habitual en políticas robóticas de imitación).

## Capacidades

- Control robótico de picking: genera comandos articulares para un brazo ROBOTIS OMX-AI de 6 grados de libertad (incluida pinza).
- Condicionamiento por instrucción en lenguaje natural: acepta instrucciones del tipo "Pick up the cube in slot 1/2/4 and put it in the box".
- Percepción multi-cámara: procesa tres vistas simultáneas a 640×480 (superior, muñeca y lateral).
- Generación de secuencias de acción (action chunking) de 50 pasos por inferencia.
- Integración con LeRobot: se carga como política mediante `--policy.path`.
- No dispone de capacidades de texto general, razonamiento, código, matemáticas, visión general, tool calling ni agentes; es exclusivamente una política de control motor.

## Casos de uso

- Automatización de picking en líneas de montaje: el modelo recoge un cubo identificado por ranura y lo deposita en una caja, replicando una operación de order picking en un banco de pruebas con brazo OMX-AI.
- Prototipado de células robóticas con LeRobot: sirve como punto de partida para equipos que quieran validar un pipeline VLA completo (dataset, entrenamiento, despliegue) sobre hardware asequible.
- Investigación en imitación robótica: permite estudiar el efecto de aumentar batch y pasos de entrenamiento (comparado con la variante de 90 episodios/entrenamiento previo) sobre una tarea de manipulación concreta.
- Clasificación y manipulación guiada por QR: al tratarse de cubos con código QR, puede integrarse en escenarios donde la identificación del objeto se hace por marcador visual y la política ejecuta el transporte.
- Benchmark interno de políticas VLA pequeñas: con 450 M de parámetros y 0,9 GB, es un candidato para comparar latencia y éxito frente a otros fine-tunings de SmolVLA en el mismo banco.
- Formación y demos: útil para demostrar flujos de trabajo de robótica con instrucciones en lenguaje natural en entornos educativos o ferias técnicas, siempre que se replique la disposición física de entrenamiento.
- Base para fine-tuning adicional: al estar bajo Apache 2.0 y sobre `smolvla_base`, puede reentrenarse con nuevos episodios para variantes de la tarea (otras ranuras, otros objetos).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que los resultados "아직 측정하지 않음" (aún no medidos). No se dispone de tasas de éxito, latencia ni throughput medidos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 450 M de parámetros en safetensors (aproximadamente 1,8 GB en fp32 o 0,9 GB en fp16/bf16, coherente con el tamaño del repo), la inferencia cabe holgadamente en GPUs de consumo.
- GPU de entrenamiento documentada: RTX 4080 (16 GB), suficiente para batch 32 durante 50.000 pasos según el autor.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para inferencia en precisión reducida; RTX 4080 o superior para reentrenamiento con hiperparámetros similares.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060/4060 y superiores; no hay cifras oficiales de VRAM mínima.
- Opciones de despliegue: LeRobot (carga vía `--policy.path=langpeu/omx_qr_pick_smolvla_bs32_50k`); no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI (no aplican a una política robótica de este tipo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Tipo | Contexto / entradas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `langpeu/omx_qr_pick_smolvla_bs32_50k` | 450 M | SmolVLA fine-tuned (picking QR) | 3 cámaras 640×480 + estado 6 articulaciones | Apache 2.0 | Hugging Face (0 descargas) |
| `lerobot/smolvla_base` | no disponible en la información | SmolVLA base | multimodal VLA general | no disponible en la información | Hugging Face (modelo base) |
| Variante previa del autor (90 episodios, menor batch/pasos) | no disponible | SmolVLA fine-tuned | misma tarea | no disponible | referenciada en la model card, sin identificador |

No se dispone de datos de rendimiento comparado (tasas de éxito, latencia) para ninguno de los modelos de la tabla, por lo que la comparación se limita a parámetros, entradas y licencia.

## Limitaciones y advertencias

- Especialización extrema: solo funciona para la tarea, el brazo (ROBOTIS OMX-AI), las tres cámaras y la disposición física exactas del entrenamiento; no generaliza a otros robots ni configuraciones.
- Dependencia de nombres y resolución: el autor exige que los nombres de robot y cámaras (`camera1`, `camera2`, `camera3`) y la resolución 640×480 coincidan con los del entrenamiento.
- Sin métricas de éxito publicadas: no hay evidencia cuantitativa de robustez ni de tasa de acierto; el propio autor indica que los resultados no se han medido.
- Dataset pequeño: 90 episodios (30 por ranura) y solo tres instrucciones de tarea; riesgo alto de sobreajuste a posiciones y condiciones de iluminación concretas.
- Idiomas: las instrucciones de tarea están en inglés; no se documenta soporte multilingüe.
- Alucinación / comportamiento errático: como política de imitación, puede generar trayectorias fuera de distribución ante objetos, posiciones o iluminación no vistas; requiere supervisión y parada de seguridad en producción.
- Licencia Apache 2.0: permite uso comercial, pero no exime de validar el comportamiento en el entorno real ni de cumplir normativa de seguridad robótica.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta; no hay comunidad que haya validado el modelo.
- Sin cuantizaciones publicadas ni soporte documentado de servidores de inferencia genéricos; el despliegue está ligado a LeRobot.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/langpeu/omx_qr_pick_smolvla_bs32_50k
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/langpeu/omx_qr_pick_v1
- LeRobot (librería): https://github.com/huggingface/lerobot
