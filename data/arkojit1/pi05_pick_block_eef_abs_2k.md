# arkojit1/pi05_pick_block_eef_abs_2k

## Resumen

`arkojit1/pi05_pick_block_eef_abs_2k` es un ajuste fino del modelo vision-lenguaje-acción π₀.₅ (`lerobot/pi05_base`) para una única tarea de manipulación robótica: coger un bloque con un brazo Franka. Lo publica el usuario arkojit1 dentro del ecosistema LeRobot de Hugging Face, con 4.143.404.816 parámetros (~4,14 mil millones) y pesos en safetensors que ocupan 9,4 GB en el repositorio.

La particularidad técnica de esta versión es que se ha entrenado con acciones **absolutas**: cada acción predicha es la posición del efector final que debe alcanzarse en el fotograma siguiente, más un objetivo binario de pinza. La model card avisa explícitamente de que no es intercambiable con su versión hermana de acciones delta (`arkojit1/pi05_pick_block_eef_delta`), ya que la semántica de la salida cambia por completo aunque la arquitectura sea idéntica.

Es relevante como ejemplo reproducible de flujo completo de imitación con LeRobot: se parte de un dataset pequeño de teleoperación (35 episodios, una sola tarea), se congela el backbone visual y de lenguaje y se entrena solo el *action expert* con pérdida de flow matching. El resultado es un checkpoint intermedio (paso 2.000, ~63 épocas) que sirve más como material de investigación y comparación de variantes de espacio de acciones que como política lista para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje-acción (VLA) derivada de π₀.₅: codificador visual SigLIP y backbone de lenguaje Gemma-2B congelados, más un *action expert* entrenable con objetivo de flow matching |
| Parametros totales | 4.143.404.816 (~4,14 mil millones) |
| Parametros activos | no aplica (no es un modelo de mezcla de expertos) |
| Longitud de contexto | no disponible (no se documenta ventana de contexto en tokens; la política usa chunks de 50 acciones) |
| Tipos de cuantizacion | no disponible (el repositorio publica pesos en safetensors sin cuantizar) |
| Idiomas soportados | no disponible (modelo especializado en una única tarea robótica; no se documentan capacidades de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería `lerobot`) |
| Modelo base | `lerobot/pi05_base` |
| Dataset de entrenamiento | copia local reconstruida de `Ameyapores/pick_block_eef_delta` (35 episodios Franka, 1 tarea, 2 cámaras de 224x224: `cam0` y `cam2`, estado de 4 dimensiones) |
| Espacio de acciones | `[x, y, z, gripper]` en forma absoluta (posición del efector final a alcanzar en el siguiente fotograma) |
| Tamano del repositorio | 9,4 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo sigue el esquema VLA de π₀.₅: dos torres congeladas (SigLIP para percepción visual y Gemma-2B para el condicionamiento de lenguaje) alimentan un *action expert* que genera trayectorias de acción mediante flow matching. En este ajuste fino solo se entrena ese experto de acciones (`train_expert_only=true`), lo que reduce de forma drástica el coste de cómputo y el número de parámetros actualizables frente a un ajuste completo.

El entrenamiento se hizo con LeRobot (`--policy.type=pi05`) sobre una copia reconstruida localmente del dataset `Ameyapores/pick_block_eef_delta`: 35 episodios de teleoperación con un Franka, una única tarea y dos cámaras de 224x224 (`cam0` y `cam2`); la tercera ranura de imagen de π₀.₅ se rellena con `empty_cameras=1`. Se usó batch global de 256 (32 por GPU en 8 AMD Instinct MI300X), precisión bf16, LR pico de 2,5e-5 con decaimiento coseno anclado a 4.000 pasos (warmup de 133 pasos, suelo de 2,5e-6), normalización por cuantiles (q01–q99) tanto de estado como de acción y las transformaciones de imagen de LeRobot sobre los fotogramas de entrenamiento. El `chunk_size` y `n_action_steps` son 50/50, de modo que la política predice y ejecuta bloques de 50 acciones antes de replanificar.

La innovación relevante de este checkpoint no está en la arquitectura, sino en el espacio de acciones: frente al dataset original, donde la acción es `[dx, dy, dz, gripper]` (delta del estado en t+1), aquí se entrena con `action[t] = [state_x[t] + dx[t], state_y[t] + dy[t], state_z[t] + dz[t], gripper[t]]`. Es decir, el modelo predice directamente la posición absoluta del efector final en el siguiente fotograma, en las mismas unidades y marco que `observation.state[:3]`. Este checkpoint corresponde al paso 2.000 (~63 épocas) de la misma ejecución que `arkojit1/pi05_pick_block_eef_abs` (paso 1.100), con una pérdida de evaluación en datos reservados de 0,0645 frente al mejor valor de la ejecución, 0,0633 (pasos 600 y 1.100). A partir del paso ~2.000 la pérdida de evaluación sube de forma sostenida, señal de sobreajuste.

## Capacidades

- Generación de comandos de acción para un brazo Franka en una tarea concreta de *pick and place* de un bloque.
- Control visomotor a partir de dos cámaras de 224x224 (`cam0` y `cam2`) y un estado propioceptivo de 4 dimensiones (posición del efector final y estado de la pinza).
- Predicción de posiciones absolutas del efector final, con salida de pinza binaria (0/1).
- Planificación en bloques: genera 50 acciones por inferencia y las ejecuta como chunk abierto antes de volver a planificar.
- Aprendizaje por imitación a partir de un dataset reducido (35 episodios, una tarea), sin recompensas ni RLHF documentados.
- No se documenta soporte de *tool calling*, function calling, razonamiento multi-paso, agentes, capacidades multilingües ni modos de pensamiento. Es una política robótica de una sola tarea, no un asistente generalista.

## Casos de uso

- Manipulación de laboratorio con Franka: el modelo ejecuta la secuencia de aproximación, agarre y colocación de un bloque usando las dos cámaras disponibles y devolviendo posiciones absolutas del efector final, lo que simplifica la integración con el controlador del robot al no requerir acumular deltas.
- Reproducción de experimentos de imitación con LeRobot: sirve para replicar el flujo completo (grabación de teleoperación, entrenamiento con `--policy.type=pi05`, evaluación con episodios reservados) y comparar el efecto del tamaño del dataset.
- Estudio comparativo de espacios de acción: al existir la variante hermana con acciones delta, permite medir en el mismo robot y con el mismo dataset si conviene predecir posiciones absolutas o incrementos, algo relevante para el diseño de políticas futuras.
- Base para nuevos ajustes finos: el *action expert* entrenable y los backbones congelados hacen viable adaptar el modelo a otra tarea de manipulación con pocos episodios adicionales, reutilizando el mismo pipeline de LeRobot.
- Validación de hardware de entrenamiento e inferencia: el modelo se entrenó en 8 AMD Instinct MI300X y su tamaño permite comprobar el rendimiento de inferencia en GPUs de consumo y profesionales dentro de un mismo robot.
- Docencia y formación en robótica: por su tamaño (4,14B), su licencia no especificada y su naturaleza de checkpoint intermedio, es un caso útil para explicar flow matching aplicado a políticas VLA y el efecto del sobreajuste en datasets pequeños.
- Pruebas de integración con el controlador del Franka: al devolver posiciones absolutas en el mismo marco que `observation.state[:3]`, se puede conectar directamente a un bucle de control cartesiano sin capa de acumulación de deltas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna tasa de éxito de tarea. El único número aportado es la pérdida de evaluación, que es una métrica del objetivo de entrenamiento y no una medida de éxito:

| Metrica | Valor | Nota |
|---|---|---|
| Pérdida de evaluación (flow matching) | 0,0645 | Sobre 4 episodios reservados (los últimos 4 de 35); paso 2.000 |
| Mejor pérdida de la ejecución | 0,0633 | Pasos 600 y 1.100 |
| Épocas | ~63 | Equivalente al paso 2.000 |
| Tasa de éxito de tarea | no disponible | No publicada |
| Comparación con la variante delta | no comparable | Objetivo y escala distintos según la model card |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 8,3 GB solo para los pesos (4,14B × 2 bytes), más activaciones, buffers de imagen y la caché del *action expert*; en la práctica se recomienda reservar entre 10 y 14 GB. El repositorio completo ocupa 9,4 GB.
- GPU recomendadas: cualquier GPU con 16 GB o más de memoria. Entrenado originalmente en 8 AMD Instinct MI300X (192 GB HBM3 por tarjeta) con batch de 32 por GPU; la inferencia no requiere ese hardware.
- Cabe en GPU de consumo: sí en RTX 4090 o RTX 3090 (24 GB) con margen amplio, y en RTX 4080 / 4070 Ti Super (16 GB) de forma ajustada. En tarjetas de 12 GB o menos se necesitaría cuantización, que no está documentada para este modelo.
- Opciones de despliegue: `lerobot` con PyTorch, cargando la política mediante `PI05Policy.from_pretrained("arkojit1/pi05_pick_block_eef_abs_2k")`. vLLM, llama.cpp, Ollama y TGI no son aplicables: no se trata de un modelo de lenguaje servible por esos motores, sino de una política robótica con salida de acciones.
- Latencia y throughput: no disponibles. La única referencia de temporización es el chunking de 50 acciones por inferencia (`chunk_size=50`, `n_action_steps=50`), que amortigua el coste de cada *forward* sobre 50 pasos de control, pero no se publican mediciones de latencia en el robot.

## Comparativa con modelos similares

| Modelo | Parametros | Espacio de acciones | Entrenamiento | Pérdida de evaluación | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `arkojit1/pi05_pick_block_eef_abs_2k` | 4,14B | Absoluta `[x, y, z, gripper]` | Paso 2.000, ~63 épocas, solo *action expert* | 0,0645 | no disponible | Hugging Face |
| `arkojit1/pi05_pick_block_eef_abs` | no disponible | Absoluta | Paso 1.100 de la misma ejecución | 0,0633 en el mejor punto de la ejecución | no disponible | Hugging Face |
| `arkojit1/pi05_pick_block_eef_delta` | no disponible | Delta `[dx, dy, dz, gripper]` | Mismo dataset en su forma original | no comparable (objetivo distinto) | no disponible | Hugging Face |
| `lerobot/pi05_base` | no disponible | no aplica (modelo base) | Preentrenamiento generalista π₀.₅ | no disponible | no disponible | Hugging Face |

## Limitaciones y advertencias

- Espacio de acciones no intercambiable: la salida es posición absoluta del efector final, no un delta. Cargar este checkpoint en un pipeline que espere acciones delta, o al revés, produce comandos incorrectos y riesgo físico en el robot.
- Región de entrenamiento muy estrecha: los objetivos absolutos de entrenamiento cubren x 0,528–0,559, y 0,056–0,068, z 0,145–0,311. Cualquier objetivo fuera de ese rango es extrapolación y la model card advierte de ello explícitamente.
- Una sola tarea y un solo robot: 35 episodios de un Franka ejecutando una tarea de *pick and place*. No hay evidencia de generalización a otras tareas, objetos o morfologías.
- Sobreajuste documentado: a partir del paso ~2.000 la pérdida de evaluación sube de forma sostenida; este checkpoint es el último antes de ese deterioro y no es el mejor de la ejecución.
- La pérdida de evaluación (0,0645) no es una tasa de éxito de tarea. No se han publicado evaluaciones en robot real ni en simulador, por lo que se desconoce si la política completa la tarea de forma fiable.
- Dataset no publicado: la copia reconstruida del dataset no se ha liberado y `train_config.json` apunta a una ruta local, lo que dificulta la reproducibilidad exacta del ajuste.
- Licencia no disponible: al no especificarse, no hay garantía de uso comercial y conviene aclararlo con el autor antes de cualquier despliegue productivo.
- Dependencia de las cámaras y del estado: el modelo espera dos cámaras de 224x224 (`cam0`, `cam2`) y un estado de 4 dimensiones en el mismo formato que el dataset de origen; cualquier cambio de calibración, resolución o montaje puede degradar las predicciones.
- Riesgo operativo: al ser una política de control motor, un error de predicción no es una alucinación textual sin consecuencias, sino un movimiento físico. Cualquier uso en robot real necesita límites de seguridad, parada de emergencia y validación supervisada.
- Sin información sobre sesgos demográficos ni de lenguaje: no es un modelo generativo de texto, por lo que esas categorías no aplican, pero tampoco hay análisis de sesgos en la percepción visual.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/arkojit1/pi05_pick_block_eef_abs_2k
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Variante con acciones delta: https://huggingface.co/arkojit1/pi05_pick_block_eef_delta
- Variante con acciones absolutas (paso 1.100): https://huggingface.co/arkojit1/pi05_pick_block_eef_abs
- Dataset de origen: https://huggingface.co/datasets/Ameyapores/pick_block_eef_delta
- Repositorio de LeRobot (librería utilizada para entrenamiento e inferencia): https://github.com/huggingface/lerobot
- Paper o blog técnico de π₀.₅: no disponible en la información proporcionada
