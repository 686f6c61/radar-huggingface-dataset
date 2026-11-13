# chomeed/task2_foveavla_subtask_rel_chunk50_rtc6-21_jitter0.05_bs64_1112_5k

## Resumen

`task2_foveavla_subtask_rel_chunk50_rtc6-21_jitter0.05_bs64_1112_5k` es un checkpoint de política robótica (vision-language-action, VLA) publicado por el usuario `chomeed` en Hugging Face. Se trata de un ajuste fino de `lerobot/pi05_base` (la base pi0.5 de LeRobot) sobre el dataset `chomeed/first_cable_insertion_uncased`, orientado a una tarea concreta de inserción de cable en un módulo de control con un brazo robótico de la plataforma Hyundai Duet. El modelo combina el backbone VLM de pi0.5 con la extensión FoveaVLA, que añade predicción de subtareas de alto nivel y foveación (recortes atencionales por cámara).

La arquitectura es un transformer VLA con un "action expert" que genera chunks de acciones de 10 dimensiones (longitud 50, 30 pasos ejecutables) condicionado por el texto de la subtarea predicha por el VLM. La innovación principal es el uso de *training-time RTC* (real-time chunking, Black et al. 2025): durante el entrenamiento se simulan retardos de inferencia de 6 a 21 pasos para que el modelo aprenda a arrancar un chunk con un prefijo de acciones ya ejecutadas. Esto lo hace adecuado para control en tiempo real a 30 Hz.

El checkpoint corresponde a 5.000 actualizaciones de optimizador de un total de 30.000 (paso 10.000 de bucle), con una pérdida de entrenamiento de 0,204. Tiene 4.145.527.568 parámetros (aproximadamente 4,15 mil millones) y un tamaño de repositorio de 16,6 GB. Es un modelo muy especializado, de nicho, no un modelo de propósito general: solo tiene sentido para reproducir o continuar el entrenamiento de esta tarea concreta de manipulación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) basada en pi0.5 con extensión FoveaVLA y action expert; transformer con predicción de subtareas y foveación |
| Parámetros totales | 4.145.527.568 (~4,15 B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (el modelo opera sobre observaciones de 6 cámaras y estado de 25-D; no se especifica ventana de tokens) |
| Tipos de cuantización | no disponible (pesos en safetensors; se usa bf16 autocast en entrenamiento) |
| Idiomas soportados | no disponible (las subtareas de entrenamiento están en inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

El modelo parte de `lerobot/pi05_base` y se ajusta con el framework LeRobot 0.6.2, concretamente con la política `pi05_foveavla_subtask` del repositorio `HDR-SRL/lerobot_foveavla` (rama `subtask-rtc`). La arquitectura es un VLA con dos componentes acoplados: un VLM que primero escribe la subtarea actual tras el prompt (por ejemplo, "grasp the cable with the right hand", "turn the head to the center", "insert the cable into the control module") y un action expert que condiciona la generación del chunk de acciones sobre esa subtarea. Además, tras la respuesta, se predicen 4 slots de caja por cámara (zed_mini, d405_left, d405_right) para el instante t+8, con 4 clases sobre 1024 bins; el action expert no ve estas cajas.

La entrada consiste en 6 cámaras (d405_left, d405_right, zed_mini, fovea_zed_mini, fovea_d405_left, fovea_d405_right) y un estado de 25 dimensiones. La salida es un chunk de acciones de 10 dimensiones con `n_action_steps=30`. Las acciones del brazo son relativas al estado actual (`use_relative_actions=true`), mientras que tres comandos de mano se mantienen absolutos (`right_thumb_joint1`, `right_index_joint2`, `right_index_joint3`). La normalización usa las estadísticas de la rama `rel_chunk50` del dataset, con cuantiles exactos de estado sobre todas las frames; las etiquetas de subtarea están en la rama `foveavla_subtask_early45f`.

El entrenamiento usó batch efectivo de 64 (32 por GPU en una B200 con acumulación de gradiente 2), AdamW con lr pico 2,5e-05, warmup de 2000 pasos y decaimiento coseno hasta 2,5e-06. Se usó bf16 con pesos maestros en fp32 y gradient checkpointing. La innovación clave es el *training-time RTC*: cada muestra recibe un retardo de inferencia simulado d, con probabilidad 0,1 de d=0 (primer chunk sin prefijo) y, en caso contrario, uniforme en [6, 21] pasos (200-700 ms a 30 Hz); las primeras d acciones entran limpias en el action expert (flow time 0) y quedan fuera de la pérdida de flow. Adicionalmente, en la fase de inserción se aplica *crop jitter* de hasta el 5 % del ancho y alto de la ventana de recorte, para que el modelo vea recortes imperfectos como los que él mismo predice.

## Capacidades

- Generación de chunks de acciones robóticas de 10 dimensiones (longitud 50, 30 ejecutables) para control de brazo y mano.
- Predicción de subtareas de alto nivel en lenguaje natural que condicionan la política de bajo nivel.
- Foveación: predicción de cajas de recorte por cámara (zed_mini, d405_left, d405_right) y uso de vistas recortadas como entrada atencional.
- Soporte de control en tiempo real con prefijo de acciones ya ejecutadas (RTC entrenado), con retardos de 6 a 21 pasos.
- Procesamiento multimodal: 6 flujos de cámara RGB más estado propioceptivo de 25 dimensiones.
- No se documentan capacidades de tool calling, agentes multi-paso, matemáticas, código ni visión general; el modelo está especializado en una única tarea de manipulación.
- Capacidades multilingües: no documentadas; las subtareas de entrenamiento están en inglés.

## Casos de uso

- Inserción de cable en módulo de control: es el caso principal para el que se entrenó. El modelo predice la subtarea ("insert the cable into the control module"), genera el chunk de acciones relativas y usa la caja foveal de la consulta anterior para recortar la vista de la cámara. Es adecuado porque el entrenamiento incluye exactamente esta fase con *crop jitter* y RTC.
- Investigación en VLA con foveación: sirve como checkpoint de referencia para estudiar cómo la atención selectiva por recortes afecta al rendimiento en manipulación fina, comparándolo con la base pi0.5 sin FoveaVLA.
- Estudio de real-time chunking: permite reproducir experimentos de RTC con retardos de 6 a 21 pasos y medir el efecto del prefijo limpio en la estabilidad del control a 30 Hz.
- Aprendizaje por imitación con etiquetas de subtarea: útil para analizar el efecto de la pérdida auxiliar de subtarea (0,1 × CE) y de la pérdida de caja (0,1 × CE en fase de inserción) sobre la política de bajo nivel.
- Reproducción de experimentos con la plataforma Hyundai Duet: el modelo está calibrado para la configuración de 6 cámaras y estado de 25-D de esa plataforma, por lo que sirve para replicar resultados del run de Weights & Biases asociado.
- Punto de partida para ajuste fino en tareas de inserción similares: al estar entrenado con acciones relativas y RTC, puede servir como inicialización para otras tareas de ensamblaje con la misma morfología, aunque requeriría reentrenamiento con el dataset adecuado.
- Docencia y divulgación sobre VLA: como ejemplo completo de pipeline LeRobot con política personalizada, procesadores pre/post y proveedores en vivo de caja y subtarea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento aportado es la pérdida de entrenamiento en el paso del checkpoint: 0,204 (5.000 actualizaciones de 30.000, paso 10.000 de bucle). No se proporcionan métricas de éxito en tarea, tasas de inserción, latencias medidas ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con 4,15 B parámetros, en bf16 los pesos ocupan aproximadamente 8,3 GB; en fp32, unos 16,6 GB. A esto hay que sumar el estado de las 6 cámaras y las activaciones del action expert, por lo que un despliegue realista en bf16 requeriría del orden de 12-16 GB de VRAM, aunque esta cifra es una estimación y no un dato publicado.
- GPU recomendadas: el entrenamiento se realizó en una NVIDIA B200. Para inferencia, GPUs con al menos 16-24 GB de VRAM (A100, H100, L40S, RTX 4090) son opciones razonables; no se documentan pruebas en consumer GPU.
- ¿Cabe en consumer GPU? Probablemente en RTX 4090 (24 GB) en bf16, pero no está verificado en la información disponible.
- Opciones de despliegue: la librería `lerobot` con la política `PI05FoveaVLASubtaskPolicy` del paquete `lerobot_policy_pi05_foveavla` (instalable desde `git+https://github.com/HDR-SRL/lerobot_foveavla@subtask-rtc`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no son adecuados para este tipo de política VLA.
- Latencia y throughput: el modelo está diseñado para control a 30 Hz y el RTC cubre retardos de 200-700 ms (6-21 pasos). No se publican latencias medidas ni throughput.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| task2_foveavla_subtask_rel_chunk50_rtc6-21_jitter0.05_bs64_1112_5k | ~4,15 B | no disponible | Inserción de cable (Hyundai Duet) | no disponible | Hugging Face, 0 descargas |
| lerobot/pi05_base | no disponible en la información | no disponible | VLA base generalista | no disponible | Hugging Face (modelo base) |
| FoveaVLA (variantes del repo HDR-SRL/lerobot_foveavla) | no disponible | no disponible | VLA con foveación | no disponible | GitHub (rama `subtask-rtc`) |

No se dispone de datos de benchmarks ni de especificaciones completas de los modelos comparables en la información proporcionada, por lo que la comparación cuantitativa de rendimiento no está disponible.

## Limitaciones y advertencias

- Modelo altamente especializado: entrenado únicamente para la tarea de inserción de cable en el módulo de control con la plataforma Hyundai Duet; no es un modelo de propósito general.
- Checkpoint intermedio: solo 5.000 de 30.000 actualizaciones de optimizador; el entrenamiento no está completado y el rendimiento puede ser inferior al de un checkpoint final.
- Licencia no disponible: no se puede confirmar el uso comercial; hay que contactar con el autor antes de cualquier despliegue en producción.
- Idiomas no disponibles: las subtareas están en inglés y no se documenta soporte multilingüe.
- Dependencia de la versión de LeRobot: el RTC requiere LeRobot 0.6.2 (per-token flow time); la 0.6.1 no lo soporta.
- Dependencia de la configuración hardware: requiere exactamente 6 cámaras con los nombres especificados y un estado de 25-D; no funcionará con otra morfología sin reentrenamiento.
- Riesgo de alucinación en la subtarea: el VLM puede predecir una subtarea incorrecta, lo que condiciona erróneamente al action expert; no se documentan mecanismos de verificación.
- Recortes foveales imperfectos: el modelo fue entrenado con *crop jitter* del 5 %, pero recortes muy alejados de la distribución de entrenamiento pueden degradar el control.
- Sin métricas de éxito publicadas: no hay evidencia cuantitativa de tasa de inserción ni de robustez ante perturbaciones.
- Sesgos: no documentados; al ser un modelo de robótica entrenado con un dataset propio, los sesgos de la política están ligados a la distribución de demostraciones.
- Sin soporte documentado para cuantización: no se indican pesos GGUF ni recetas de cuantización de 4 u 8 bits.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chomeed/task2_foveavla_subtask_rel_chunk50_rtc6-21_jitter0.05_bs64_1112_5k
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/chomeed/first_cable_insertion_uncased
- Repositorio del framework FoveaVLA: https://github.com/HDR-SRL/lerobot_foveavla/tree/subtask-rtc
- Run de entrenamiento en Weights & Biases: https://wandb.ai/meeroro56/hyundai_duet/runs/wk74j3bv
- Paper de RTC (Black et al. 2025): https://arxiv.org/abs/2512.05964
