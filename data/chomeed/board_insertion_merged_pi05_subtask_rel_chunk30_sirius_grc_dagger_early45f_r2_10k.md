# chomeed/board_insertion_merged_pi05_subtask_rel_chunk30_sirius_grc_dagger_early45f_R2_10k

## Resumen

Este repositorio contiene un checkpoint de política robótica basado en pi0.5 (pi05), el modelo vision-language-action (VLA) de Physical Intelligence implementado en LeRobot, especializado en la tarea de inserción de placas ("board insertion") sobre el banco Hyundai DUET. Lo desarrolla el usuario chomeed y se distribuye como fine-tune del modelo base `lerobot/pi05_base`, entrenado sobre el dataset propio `chomeed/hyundai_duet_task1`. No es un modelo de lenguaje general: es una política de control que mapea observaciones multimodales (tres cámaras más un vector de estado de 18 dimensiones) a secuencias de acciones de 8 dimensiones.

La particularidad del modelo es la predicción explícita de subtareas de alto nivel: el componente VLM genera primero una subtarea en lenguaje natural ("grasp the board with the right hand", "turn the head to the center", "insert the board into the control module") y el experto de acciones condiciona su salida sobre ella. El entrenamiento incorpora un esquema de muestreo por clases (SIRIUS) que pondera de forma fija demostraciones humanas, intervenciones, frames previos a intervención y rollouts autónomos, con el objetivo de corregir el desbalanceo típico de los datasets de imitación con DAgger.

El checkpoint corresponde a la actualización de optimizador 10.000 de 10.000 (20.000 pasos de bucle con acumulación de gradiente 2) de una segunda ronda de entrenamiento (R2), partiendo de un checkpoint intermedio de 10k pasos. Con 4.143.404.816 parámetros y un repositorio de 16,6 GB, es un modelo pesado orientado a despliegue en hardware de gama alta (se entrenó con B200) y no a inferencia en GPUs de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA pi0.5 (VLM PaliGemma + experto de acciones con flow matching), plugin `pi05_subtask` |
| Parametros totales | 4.143.404.816 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el autor no documenta cuantizaciones) |
| Idiomas soportados | no disponible (las subtareas del dataset están en inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura pi0.5: un backbone VLM tipo PaliGemma que procesa el prompt (tarea, estado y, opcionalmente, la subtarea) junto con las imágenes de tres cámaras (d405_left, d405_right, zed_mini), y un experto de acciones que genera chunks de 30 pasos mediante flow matching a partir de un estado de 18 dimensiones. La salida es un vector de acción de 8 dimensiones expresado de forma relativa al estado actual (`use_relative_actions=true`), salvo `gripper_r_closed`, que se mantiene absoluto. La innovación del plugin es que el VLM escribe primero la subtarea tras el prompt (`Task: {task}, State: {state};\nSubtask: {subtask};\nAction:`) y el experto condiciona sobre ella; en inferencia la subtarea se decodifica de forma greedy con la cabeza LM de PaliGemma y los 10 pasos de flow se ejecutan sobre la caché que la contiene.

El entrenamiento se realizó con LeRobot 0.6.2 y el plugin `lerobot_policy_pi05_subtask` (más `lerobot_sirius`), con batch de 128 por actualización (64 por GPU en una B200 con acumulación 2), AdamW con lr pico 1e-05, warmup de 2000 pasos y decaimiento coseno hasta 2.5e-06 en 20.000 pasos de bucle (10.000 actualizaciones), precisión bf16 con pesos maestros fp32 y gradient checkpointing. La función de pérdida combina flow matching y 0,1 veces la entropía cruzada de subtarea (ratio CE/flow de 10x respecto a pi0.5). El muestreo SIRIUS fija proporciones por clase independientemente de su tamaño: 50% demostraciones humanas (197.783 frames, 42,8%), 40% frames de intervención (35.508, 7,7%), 0% frames previos a intervención (31.807, 6,9%) y 10% rollouts autónomos (196.627, 42,6%), con sobremuestreo 1,2x de los episodios 63-122 dentro de la clase demo. La normalización queda congelada a las estadísticas del checkpoint base, no a las del dataset de 276 episodios, y las imágenes se usan tal cual se almacenan (con recortes específicos por episodio, p. ej. caja 265,64,424,223 en episodios GRC). La pérdida de entrenamiento en este paso es 0,002.

## Capacidades

- Control robótico de manipulación: genera chunks de 30 acciones de 8 dimensiones para inserción de placas en un banco de pruebas concreto.
- Predicción explícita de subtareas de alto nivel en lenguaje natural, expuesta en `policy.last_subtask`.
- Percepción multimodal con tres cámaras (dos d405 y una zed_mini) más estado propioceptivo de 18 dimensiones.
- Condicionamiento por instrucción de tarea en lenguaje natural (prompt de tarea).
- Aprendizaje por imitación con DAgger: incorpora datos de intervención humana y de rollouts autónomos.
- Acciones relativas al estado actual, lo que facilita la generalización posicional dentro de la tarea.
- Tool calling / function calling: no disponible.
- Razonamiento multi-paso general o agentes de texto: no disponible (no es un modelo de propósito general).
- Capacidades multilingües: no disponibles; las subtareas están definidas en inglés.
- Modo thinking, visión general, audio: no disponibles.

## Casos de uso

- Automatización de inserción de placas en línea de montaje: el modelo ejecuta la secuencia completa (agarre con mano derecha, giro de cabeza al centro, inserción en el módulo de control) sobre el banco Hyundai DUET, con chunks de 30 acciones que permiten control continuo a partir de tres cámaras.
- Investigación en VLA con subtareas jerárquicas: sirve como referencia reproducible para estudiar cómo la predicción explícita de subtareas mejora la descomposición de tareas largas, ya que la subtarea decodificada es accesible en `policy.last_subtask` para análisis.
- Estudio de esquemas de muestreo en DAgger: el modelo documenta ratios fijos por clase (demo/intv/preintv/robot) y permite comparar el efecto del sobremuestreo de intervenciones frente a rollouts autónomos en la estabilidad de la política.
- Fine-tuning sobre nuevos bancos de prueba: al estar implementado como plugin de LeRobot y partir de `lerobot/pi05_base`, se puede reentrenar con el mismo pipeline (`build_init.py`, `lerobot_sirius`) para otras tareas de manipulación con cámaras y estado similares.
- Evaluación de robustez ante correcciones humanas: los frames de intervención y los 3 s previos permiten diseñar experimentos sobre cómo la política reacciona a errores y recuperaciones, útil para estudiar seguridad en manipulación.
- Base para destilación o cuantización orientada a despliegue en robot: con 4,1B parámetros y pesos safetensors, es un candidato para estudiar la viabilidad de llevar políticas VLA a hardware embarcado, aunque el autor no documenta cuantizaciones.
- Reproducción de experimentos con registro en W&B: el run público permite replicar curvas de pérdida y comparar con el checkpoint de 10k del que parte.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo reporta la pérdida de entrenamiento en el paso 10.000 (0,002) y el enlace al run de W&B; no hay tasas de éxito en la tarea ni comparaciones numéricas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 4,14B parámetros, en bf16/fp16 los pesos ocupan aproximadamente 8,3 GB; con overhead de activaciones, cámaras y caché del VLM, se recomienda al menos 16-24 GB de VRAM.
- GPU recomendadas: el entrenamiento se hizo en una B200; para inferencia se espera que funcione en A100 o H100 por margen, aunque el autor no lo documenta.
- ¿Cabe en GPU de consumo? Probablemente en RTX 4090 (24 GB) en bf16, pero no está verificado por el autor; en GPUs de 12 GB requeriría cuantización, que no está documentada.
- Opciones de despliegue: LeRobot con el plugin `lerobot_policy_pi05_subtask` (`pip install git+https://github.com/HDR-SRL/lerobot_policy_pi05_subtask`) y `PI05SubtaskPolicy.from_pretrained(...)`; no se documentan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de política.
- Latencia y throughput: no disponibles. El modelo ejecuta 10 pasos de flow por chunk de 30 acciones, pero no se publican tiempos por chunk ni frecuencia de control alcanzable.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (pi05_subtask fine-tune) | 4,14B | no disponible | Inserción de placas Hyundai DUET con subtareas | no disponible | Hugging Face (LeRobot) |
| `lerobot/pi05_base` | no disponible (base pi0.5) | no disponible | VLA general base para fine-tuning | no disponible | Hugging Face |
| `chomeed/board_insertion_merged_pi05_subtask_rel_chunk30_sirius_grc_dagger_early45f_10k` | no disponible | no disponible | Misma tarea, checkpoint previo (10k) | no disponible | Hugging Face |
| `chomeed/board_insertion_merged_pi05_rel_chunk30_sirius_grc_40k` | no disponible | no disponible | Variante sin subtareas, 40k | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparado entre estas variantes en la información proporcionada; la comparación se limita a linaje y configuración de entrenamiento.

## Limitaciones y advertencias

- Modelo altamente especializado: entrenado exclusivamente para la tarea de inserción de placas en el banco Hyundai DUET; no es un modelo de lenguaje ni un VLA de propósito general.
- Dependencia fuerte del preprocesado: la normalización está congelada a estadísticas del checkpoint base y las imágenes requieren los mismos recortes que el dataset (caja 265,64,424,223 en episodios GRC; 265,9,424,168 en yonsei). Un preprocesado distinto degrada la política.
- Licencia no disponible: no se puede confirmar el uso comercial; hay que contactar con el autor antes de cualquier despliegue en producción.
- Riesgo de alucinación en la subtarea: la subtarea se decodifica de forma greedy con la cabeza LM y puede ser incoherente con el estado real; el experto de acciones condiciona sobre ella, por lo que un error de subtarea puede propagarse a la ejecución.
- Sin benchmarks publicados: no hay tasas de éxito ni métricas de robustez; la única señal es la pérdida de entrenamiento (0,002), que no garantiza buen comportamiento en el robot.
- Sesgos del dataset: los ratios SIRIUS fijan el 40% de frames de intervención y solo el 10% de rollouts autónomos, lo que puede sobreajustar a las condiciones de las demostraciones humanas y a los episodios sobremuestreados (63-122).
- Idiomas: las subtareas y prompts están en inglés; no se documenta soporte multilingüe.
- Contexto: no se publica la longitud de contexto del VLM; el prompt incluye tarea, estado y subtarea, pero no se especifica el límite.
- Hardware: entrenado en B200; el despliegue en GPUs de consumo no está validado y no hay cuantizaciones oficiales.
- Repositorio de 16,6 GB: requiere espacio y ancho de banda considerables para descarga y almacenamiento.

## Enlaces

- Hugging Face: https://huggingface.co/chomeed/board_insertion_merged_pi05_subtask_rel_chunk30_sirius_grc_dagger_early45f_R2_10k
- Checkpoint previo (10k): https://huggingface.co/chomeed/board_insertion_merged_pi05_subtask_rel_chunk30_sirius_grc_dagger_early45f_10k
- Checkpoint base de normalización (40k): https://huggingface.co/chomeed/board_insertion_merged_pi05_rel_chunk30_sirius_grc_40k
- Dataset: https://huggingface.co/datasets/chomeed/hyundai_duet_task1
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Plugin LeRobot: https://github.com/HDR-SRL/lerobot_policy_pi05_subtask
- Run de entrenamiento (W&B): https://wandb.ai/meeroro56/hyundai_duet/runs/unb5tz06
