# arkojit1/pi05_pick_block_eef_abs_4k

## Resumen

`arkojit1/pi05_pick_block_eef_abs_4k` es un checkpoint de ajuste fino del modelo de vision-lenguaje-accion π₀.₅ (`lerobot/pi05_base`) para una tarea de manipulacion robotica con un brazo Franka. El modelo fue entrenado sobre una copia reconstruida localmente del dataset `Ameyapores/pick_block_eef_delta` (35 episodios, una sola tarea, dos camaras de 224×224) y publica las acciones en forma absoluta: cada accion predicha es la posicion del efector final a alcanzar en el siguiente fotograma, mas el objetivo binario del gripper.

El autor lo publica como el checkpoint del paso 4.000 (~126 epocas) de una misma ejecucion de entrenamiento, con el objetivo declarado de permitir comparaciones entre distintas longitudes de entrenamiento. Segun la propia model card, este checkpoint esta sobreajustado: la perdida de evaluacion en el conjunto retenido es 0,0828, mientras que el mejor valor de la ejecucion fue 0,0633 en los pasos 600 y 1.100.

Se trata de un modelo de investigacion con proposito comparativo, no de un sistema listo para produccion. Su relevancia radica en documentar el comportamiento de π₀.₅ bajo ajuste fino con pocos datos, con solo el experto de accion entrenable (SigLIP y Gemma-2B congelados) y normalizacion por cuantiles, y en explicitar el espacio de acciones para evitar errores de despliegue respecto de su modelo hermano de acciones delta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje-accion π₀.₅ (backbone SigLIP + Gemma-2B congelados y experto de accion entrenable, generacion por flow matching) |
| Parametros totales | 4.143.404.816 (~4,14 B, segun safetensors) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible; usa chunk_size / n_action_steps de 50/50 |
| Tipos de cuantizacion | no disponible (pesos en safetensors, entrenamiento en bf16) |
| Idiomas soportados | no disponible (politica robotica de una unica tarea, sin condicionamiento de lenguaje descrito) |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria `lerobot`) |

## Arquitectura y entrenamiento

El modelo parte de `lerobot/pi05_base`, la implementacion de π₀.₅ en LeRobot, que combina un codificador visual SigLIP y un modelo de lenguaje Gemma-2B congelados junto con un experto de accion entrenable que genera secuencias de acciones mediante flow matching. En este ajuste fino se activa `train_expert_only=true`, de modo que unicamente se entrena el experto de accion. La entrada consta de dos imagenes de 224×224 (`cam0` y `cam2`) y un estado de 4 dimensiones; la tercera ranura de imagen de π₀.₅ se rellena con `empty_cameras=1`.

El entrenamiento se realizo sobre una copia local reconstruida del dataset `Ameyapores/pick_block_eef_delta` (35 episodios de un brazo Franka, una tarea), con batch global de 256 (32 por GPU en 8 aceleradores AMD MI300X), learning rate pico de 2,5e-5 con decaimiento coseno anclado a 4.000 pasos, calentamiento de 133 pasos, suelo de 2,5e-6 y precision bf16. La normalizacion es por cuantiles (q01–q99) sobre estado y accion, con aumentos de imagen de LeRobot. El espacio de acciones del dataset original es delta `[dx, dy, dz, gripper]`, pero este modelo se entreno sobre la forma absoluta `action[t] = [state_x[t] + dx[t], state_y[t] + dy[t], state_z[t] + dz[t], gripper[t]]`, de manera que cada accion predicha es la posicion objetivo del efector final en el siguiente fotograma. El split de evaluacion retiene los ultimos 4 de los 35 episodios.

## Capacidades

- Generacion de trayectorias de manipulacion para una tarea concreta de recogida de bloque (pick block) con un brazo Franka.
- Prediccion de acciones en espacio absoluto de posicion del efector final (`x`, `y`, `z`) mas objetivo binario de gripper (0/1).
- Generacion de secuencias de accion por trozos (action chunking) de 50 pasos por inferencia (`chunk_size = 50`, `n_action_steps = 50`).
- Consumo de dos flujos visuales de 224×224 (`cam0`, `cam2`) y de un estado de 4 dimensiones.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues.
- No se documenta modo de pensamiento (thinking mode), vision general, audio ni otras capacidades fuera de la politica de accion.

## Casos de uso

- Reproduccion y comparacion de experimentos de ajuste fino de π₀.₅: sirve como punto de referencia junto a los checkpoints hermanos (`_2k`, `_3k`) y a `arkojit1/pi05_pick_block_eef_abs` (paso 1.100) para estudiar la evolucion de la perdida de evaluacion segun la longitud del entrenamiento.
- Estudio del sobreajuste en politicas roboticas: al publicarse un checkpoint con perdida de evaluacion 0,0828 frente al mejor 0,0633, permite analizar la divergencia entre perdida de entrenamiento y de evaluacion en regimen de pocos datos.
- Investigacion sobre normalizacion y representacion de acciones: la comparacion directa con `arkojit1/pi05_pick_block_eef_delta` permite medir el efecto de usar acciones absolutas frente a delta con el mismo dataset de origen.
- Integracion en un pipeline de LeRobot: el modelo se carga con `PI05Policy.from_pretrained(...)` y se usa dentro del ecosistema LeRobot para ejecutar la politica en un entorno compatible con el formato del dataset.
- Demostraciones y docencia de flujo de trabajo VLA: ejemplifica el ciclo completo de ajuste fino de un modelo vision-lenguaje-accion sobre una tarea de manipulacion con Franka.
- Pruebas de extrapolacion y limites de dominio: dado que la region de entrenamiento es estrecha (x 0,528–0,559; y 0,056–0,068; z 0,145–0,311), sirve para evaluar el comportamiento fuera de esa region, donde las predicciones son extrapolacion.
- Base para transfer learning a tareas de pick-and-place similares: puede usarse como inicializacion para reajustes sobre tareas relacionadas con el mismo brazo y configuracion de camaras.

## Benchmarks y rendimiento

No se han publicado tasas de exito de tarea ni resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El unico dato de rendimiento es la perdida de evaluacion (flow matching) sobre los 4 episodios retenidos, que no constituye una tasa de exito de tarea.

| Metrica | Valor | Contexto |
|---|---|---|
| Perdida de evaluacion (paso 4.000) | 0,0828 | 4 episodios retenidos de 35 |
| Mejor perdida de evaluacion de la ejecucion | 0,0633 | Pasos 600 y 1.100 |
| Epocas | ~126 | Paso 4.000 |
| Perdida de entrenamiento | en descenso continuo mientras sube la de evaluacion (sobreajuste) | Segun model card |

La model card advierte explicitamente de que esta perdida de evaluacion no es una tasa de exito de tarea y no es comparable con la del modelo de acciones delta, por usar un objetivo y una escala distintos.

## Requisitos de hardware

- VRAM estimada para inferencia (estimaciones basadas en 4,14 B de parametros, no publicadas por el autor): ~8,3 GB solo para pesos en bf16; con activaciones, codificacion visual de dos imagenes de 224×224 y buffers del experto de accion, del orden de 10–14 GB en bf16.
- GPU recomendadas: el entrenamiento se realizo en 8 AMD MI300X. Para inferencia bf16, cabe en GPUs con 24 GB o mas, como RTX 3090, RTX 4090 o A100 de 40 GB; las GPUs de 16 GB podrian resultar justas y exigir reduccion de precision o de resolucion.
- Cabe en GPU de consumo: si, previsiblemente en RTX 3090 y RTX 4090 (24 GB) en bf16; en tarjetas de 16 GB dependeria de la implementacion y no esta confirmado.
- Opciones de despliegue: la via documentada es LeRobot (`from lerobot.policies.pi05.modeling_pi05 import PI05Policy`), cargando el `PI05Policy.from_pretrained`. No se documenta soporte en vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje y no a politicas de accion.
- Latencia y throughput estimados: no disponibles. El uso de action chunking con 50 pasos por inferencia reduce la frecuencia de llamadas al modelo, pero no se publican cifras de latencia ni de frecuencia de control.

## Comparativa con modelos similares

| Modelo | Parametros totales | Espacio de acciones | Perdida de evaluacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| arkojit1/pi05_pick_block_eef_abs_4k (paso 4.000) | 4,14 B | Absoluto (posicion efector + gripper) | 0,0828 (sobreajustado) | no disponible | HuggingFace |
| lerobot/pi05_base | no disponible | No aplica (modelo base) | no disponible | no disponible en la informacion | HuggingFace |
| arkojit1/pi05_pick_block_eef_abs (paso 1.100) | no disponible (misma ejecucion) | Absoluto | 0,0633 (mejor de la ejecucion) | no disponible | HuggingFace |
| arkojit1/pi05_pick_block_eef_delta | no disponible | Delta `[dx, dy, dz, gripper]` | no disponible / no comparable | no disponible | HuggingFace |

Los tres checkpoints ajustados pertenecen a la misma ejecucion de entrenamiento sobre el mismo dataset, por lo que la comparacion relevante es entre longitudes de entrenamiento y entre representaciones de accion (absoluta frente a delta). No se dispone de datos de licencia ni de rendimiento que permitan comparar con alternativas externas fuera de la familia π₀.₅.

## Limitaciones y advertencias

- Sobreajuste declarado: el checkpoint del paso 4.000 presenta perdida de evaluacion 0,0828 frente al mejor 0,0633 de la ejecucion, con perdida de entrenamiento en descenso continuo. No es el checkpoint optimo de la ejecucion.
- Espacio de acciones no intercambiable: las acciones son absolutas (posicion del efector final), no delta. No debe mezclarse con `arkojit1/pi05_pick_block_eef_delta`, que usa otro espacio de acciones.
- Region de entrenamiento muy estrecha: x 0,528–0,559; y 0,056–0,068; z 0,145–0,311. Cualquier objetivo fuera de esos rangos constituye extrapolacion y el comportamiento no esta garantizado.
- Normalizacion por cuantiles (q01–q99) sobre los objetivos absolutos: los valores fuera del rango de calibracion pueden generar acciones poco fiables.
- Dominio limitado: una sola tarea y 35 episodios de un unico brazo Franka con una configuracion concreta de camaras; la generalizacion a otras tareas, objetos, iluminacion o brazos no esta demostrada.
- Tercera entrada visual vacia (`empty_cameras=1`): la ranura de imagen no usada se rellena artificialmente, lo que debe replicarse en despliegue.
- Licencia no disponible: se desconoce si permite uso comercial, por lo que no deberia asumirse su empleo en produccion sin verificar la licencia.
- Riesgo de alucinacion y de deriva: como politica de accion, puede generar trayectorias incorrectas fuera de su distribucion de entrenamiento sin senal de confianza asociada.
- La perdida de evaluacion no equivale a tasa de exito de tarea: no hay validacion publicada de exito real en el robot.
- El dataset entrenado no esta publicado y `train_config.json` hace referencia a una ruta local, lo que dificulta la reproduccion exacta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/arkojit1/pi05_pick_block_eef_abs_4k
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de origen: https://huggingface.co/datasets/Ameyapores/pick_block_eef_delta
- Checkpoint hermano (paso 1.100, acciones absolutas): https://huggingface.co/arkojit1/pi05_pick_block_eef_abs
- Checkpoint hermano (acciones delta): https://huggingface.co/arkojit1/pi05_pick_block_eef_delta
- Libreria LeRobot: https://github.com/huggingface/lerobot
