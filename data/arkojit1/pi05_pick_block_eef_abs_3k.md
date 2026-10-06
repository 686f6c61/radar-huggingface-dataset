# arkojit1/pi05_pick_block_eef_abs_3k

## Resumen

`arkojit1/pi05_pick_block_eef_abs_3k` es un checkpoint de ajuste fino del modelo visión-lenguaje-acción π₀.₅ (`lerobot/pi05_base`) para una única tarea robótica: coger un bloque con un brazo Franka. Lo publica el usuario arkojit1 dentro del ecosistema LeRobot y se distribuye en formato safetensors con 4.143.404.816 parámetros totales (aproximadamente 4,14 mil millones) y un repositorio de 9,4 GB.

El modelo parte del checkpoint base de π₀.₅ y se ha reentrenado sobre una copia reconstruida localmente del conjunto de datos `Ameyapores/pick_block_eef_delta`, compuesto por 35 episodios de Franka, una sola tarea, dos cámaras de 224×224 (`cam0` y `cam2`) y un estado de 4 dimensiones. La particularidad principal es que las acciones se han reformulado en forma absoluta: en lugar de predecir incrementos `[dx, dy, dz, gripper]`, el modelo predice la posición absoluta del efector final en el siguiente fotograma más el objetivo binario del gripper. Esto lo hace no intercambiable con el modelo hermano de acciones delta.

Se trata del checkpoint del paso 3.000 (unas 94 épocas) de una misma ejecución de entrenamiento, publicado explícitamente para comparar el efecto de la longitud de entrenamiento. El propio autor advierte que este checkpoint ya ha superado el mejor punto de la ejecución (pasos 600 y 1.100) y presenta sobreajuste: la pérdida de evaluación es 0,0770 frente al mejor valor de 0,0633. Es, por tanto, un artefacto de investigación y comparación, no un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje-accion (VLA) π₀.₅: codificador visual SigLIP + backbone de lenguaje Gemma-2B congelados y un experto de accion entrenable, con objetivo de flow matching |
| Parametros totales | 4.143.404.816 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el repositorio se distribuye en safetensors, presumiblemente bf16) |
| Idiomas soportados | No disponible (modelo de robotica; no se documenta soporte linguistico) |
| Licencia | No disponible |
| Formato de pesos | safetensors (libreria `lerobot`) |

## Arquitectura y entrenamiento

π₀.₅ es una politica visión-lenguaje-acción que combina un codificador de imágenes SigLIP y un modelo de lenguaje Gemma-2B, ambos congelados durante este ajuste fino, con un experto de acción que es el único módulo entrenable (`train_expert_only=true`). La generación de acciones se entrena con una pérdida de flow matching, y el modelo produce secuencias de acciones con `chunk_size` de 50 y `n_action_steps` de 50. La entrada consta de dos cámaras reales de 224×224 (`cam0` y `cam2`); la tercera ranura de imagen de π₀.₅ se rellena con una cámara vacía (`empty_cameras=1`). El estado de observación es de 4 dimensiones.

El ajuste fino se realizó sobre una copia reconstruida localmente de `Ameyapores/pick_block_eef_delta` (35 episodios, 1 tarea). Las acciones originales del conjunto de datos son deltas `[dx, dy, dz, gripper]`, y este modelo se reentrenó sobre su forma absoluta, definida como `action[t] = [state_x[t] + dx[t], state_y[t] + dy[t], state_z[t] + dz[t], gripper[t]]`. La normalización es por cuantiles (q01–q99) tanto en estado como en acción, con un rango de entrenamiento estrecho: x entre 0,528 y 0,559, y entre 0,056 y 0,068, z entre 0,145 y 0,311.

Los hiperparámetros documentados son: lote global de 256 (32 por GPU en 8 aceleradores MI300X), tasa de aprendizaje máxima de 2,5e-5 con decaimiento coseno fijado a 4.000 pasos (calentamiento de 133 pasos) y suelo de 2,5e-6, precisión bf16, aumento de datos con las transformaciones de imagen de LeRobot sobre los fotogramas de entrenamiento y partición de evaluación con los últimos 4 de los 35 episodios reservados. Este checkpoint corresponde al paso 3.000 (unas 94 épocas) y su pérdida de evaluación es 0,0770, frente al mejor valor de la ejecución de 0,0633 en los pasos 600 y 1.100.

## Capacidades

- Generacion de acciones roboticas: produce trayectorias de efector final en coordenadas absolutas (x, y, z) mas el objetivo binario del gripper (0/1) para un brazo Franka.
- Control visomotor de una unica tarea: recoger un bloque, a partir de dos vistas de camara de 224×224 mas el estado de 4 dimensiones.
- Prediccion por trozos: emite secuencias de 50 acciones por inferencia (`chunk_size=50`, `n_action_steps=50`).
- Percepcion visual multimodal: integra dos flujos de imagen simultaneos mediante el codificador SigLIP.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues.
- No se documenta modo de razonamiento explicito (thinking mode), audio ni vision de proposito general fuera del pipeline de robotica.

## Casos de uso

- Recogida de bloques en laboratorio: el modelo genera la posicion absoluta objetivo del efector final, lo que simplifica la integracion con un controlador que opera directamente en coordenadas cartesianas, sin necesidad de acumular deltas.
- Reproduccion de politicas en el simulador o banco de pruebas de LeRobot: al cargarse con `PI05Policy.from_pretrained`, sirve como referencia para comparar checkpoints de distinta longitud de entrenamiento sobre la misma tarea.
- Estudio del sobreajuste en politicas VLA: al ser el paso 3.000 de una ejecucion con mejor punto en los pasos 600 y 1.100, permite analizar empiricamente la degradacion de la generalizacion con el numero de epocas.
- Comparacion absoluto frente a delta: junto con `arkojit1/pi05_pick_block_eef_delta`, permite evaluar en igualdad de condiciones si la formulacion absoluta o la incremental es mas adecuada para una tarea de pick-and-place.
- Base para nuevos ajustes finos en tareas de manipulacion similares: al partir de `lerobot/pi05_base` con el experto de accion entrenable, sirve como punto de partida para datasets propios de Franka.
- Validacion de pipelines de datos de robotica: util para verificar que la reconstruccion local del dataset, la normalizacion por cuantiles y el rellenado de la tercera camara producen resultados coherentes.
- Docencia e investigacion en VLA: ejemplo reproducible de ajuste fino de π₀.₅ con recursos documentados (8×MI300X, lote 256, bf16) para cursos o replicaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (tasas de exito, MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El unico dato numerico de evaluacion es la perdida de flow matching sobre los 4 episodios reservados, que no equivale a una tasa de exito.

| Metrica | Valor | Notas |
|---|---|---|
| Perdida de evaluacion (flow matching) | 0,0770 | Paso 3.000; 4 episodios reservados |
| Mejor perdida de evaluacion de la ejecucion | 0,0633 | Pasos 600 / 1.100 |
| Epocas aproximadas | 94 | Paso 3.000 |
| Lote global | 256 | 32 por GPU en 8 MI300X |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: en torno a 8,3 GB solo para pesos (4,14 mil millones de parametros). En fp32 ascenderia a unos 16,6 GB.
- Cabe en GPU de consumo: si, previsiblemente en tarjetas con 12 GB o mas (RTX 3060 12 GB, RTX 4070 Ti, RTX 4080, RTX 4090), siempre que el resto del pipeline (codificador SigLIP, buffers de imagen de 224×224 y colas de observacion) no dispare el consumo. No hay mediciones publicadas.
- GPU de datacenter: el entrenamiento se realizo en 8 AMD MI300X; para inferencia son suficientes A100, H100 o L40S.
- Opciones de despliegue: la libreria soportada es LeRobot (`lerobot.policies.pi05.modeling_pi05.PI05Policy`). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que en cualquier caso no aplican a un modelo de politica robotica.
- Latencia y throughput: no disponibles. El modelo emite 50 acciones por inferencia, por lo que la frecuencia de control efectiva depende del tiempo de paso hacia delante y del bucle de ejecucion.

## Comparativa con modelos similares

| Modelo | Parametros | Formulacion de accion | Datos | Perdida de evaluacion | Licencia |
|---|---|---|---|---|---|
| `arkojit1/pi05_pick_block_eef_abs_3k` (este) | 4.143.404.816 | Absoluta (posicion a alcanzar) | 35 episodios Franka, 1 tarea | 0,0770 (paso 3.000) | No disponible |
| `arkojit1/pi05_pick_block_eef_abs` | No disponible | Absoluta | Mismo conjunto | Mejor de la ejecucion: 0,0633 | No disponible |
| `arkojit1/pi05_pick_block_eef_delta` | No disponible | Delta `[dx, dy, dz, gripper]` | Mismo conjunto | No comparable (objetivo y escala distintos) | No disponible |
| `lerobot/pi05_base` | No disponible | Generica (modelo base) | Preentrenamiento original | No disponible | No disponible |

Variantes adicionales del mismo run: checkpoints `_2k` y `_4k`. Las perdidas de evaluacion de los modelos abs y delta no son comparables entre si porque el objetivo y la escala de la accion difieren.

## Limitaciones y advertencias

- Sobreajuste declarado por el autor: es el paso 3.000, con perdida de evaluacion 0,0770 frente al mejor 0,0633 obtenido en los pasos 600 y 1.100. La perdida de entrenamiento sigue bajando mientras la de evaluacion sube.
- La perdida de evaluacion se calcula sobre solo 4 episodios reservados y es una metrica del objetivo de entrenamiento, no una tasa de exito en la tarea. No debe interpretarse como rendimiento real de la politica.
- No es intercambiable con `arkojit1/pi05_pick_block_eef_delta`: este modelo espera y produce acciones absolutas, no incrementos. Mezclarlos rompe el control.
- Rango de entrenamiento muy estrecho: x 0,528–0,559, y 0,056–0,068, z 0,145–0,311. Cualquier objetivo fuera de esa region es extrapolacion y la fiabilidad no esta garantizada.
- Especializacion extrema: una unica tarea, un unico robot (Franka), dos camaras concretas (`cam0`/`cam2`), la tercera ranura rellenada con camara vacia (`empty_cameras=1`) y estado de 4 dimensiones. No es un modelo generalista.
- El conjunto de datos reconstruido no esta publicado y `train_config.json` hace referencia a su ruta local, lo que dificulta la reproducibilidad exacta del entrenamiento.
- Licencia no especificada: no se puede confirmar la legalidad del uso comercial ni las condiciones de redistribucion.
- Riesgo de alucinacion y de desviacion del objetivo propio de los modelos generativos de acciones, agravado por el sobreajuste y por el reducido tamano del conjunto de entrenamiento (35 episodios).
- No hay datos publicados sobre sesgos, comportamiento multilingue ni robustez ante cambios de iluminacion, camara o posicion inicial del bloque.
- Fecha de creacion inusual en la ficha de HuggingFace (2026-10-06), lo que sugiere que la marca temporal debe tratarse con cautela.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/arkojit1/pi05_pick_block_eef_abs_3k
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de origen: https://huggingface.co/datasets/Ameyapores/pick_block_eef_delta
- Checkpoint hermano de acciones delta: https://huggingface.co/arkojit1/pi05_pick_block_eef_delta
- Checkpoint hermano de acciones absolutas (paso 1.100): https://huggingface.co/arkojit1/pi05_pick_block_eef_abs
- Variantes adicionales de la misma ejecucion: `arkojit1/pi05_pick_block_eef_abs_2k` y `arkojit1/pi05_pick_block_eef_abs_4k` (segun la model card)
