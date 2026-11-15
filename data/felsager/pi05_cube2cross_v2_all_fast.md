# felsager/pi05_cube2cross_v2_all_fast

## Resumen

`felsager/pi05_cube2cross_v2_all_fast` es una política robótica de tipo VLA (Vision-Language-Action) obtenida por ajuste fino del modelo base `lerobot/pi05_base`, que a su vez es la implementación en LeRobot de π₀.₅. El autor, felsager, la ha entrenado sobre un conjunto de datos propio de manipulación bimanual con un brazo UR5e y una mano equipada (`ur5e_hand_e`), con dos cámaras (vista superior y de muñeca) y un espacio de acciones de 10 dimensiones. El modelo resuelve una tarea concreta de pick-and-place: coger un cubo de color (azul, verde, amarillo o rojo) y colocarlo sobre una cruz roja.

La arquitectura subyacente combina un VLM preentrenado (System 2) con un experto de acciones basado en flow matching (System 1), siguiendo el diseño de FineART-VLA descrito en la model card: el modelo predice primero la siguiente subtarea en lenguaje y luego la ejecuta con el experto de acciones, usando aislamiento de conocimiento para proteger el VLM preentrenado. El checkpoint tiene 4.143.404.816 parámetros (≈4,14 mil millones) en formato safetensors, con un repositorio de 27 GB.

Es relevante ahora porque ejemplifica el flujo actual de fine-tuning de VLAs sobre LeRobot con datasets pequeños y bien anotados, y porque permite reproducir el pipeline completo (grabación, entrenamiento y despliegue en robot real) con la CLI de LeRobot 0.6.2. No obstante, se trata de un modelo de nicho, con cero descargas y cero likes en el momento de la consulta, sin resultados de evaluación publicados y limitado a una única tarea y morfología de robot.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA basada en π₀.₅ (FineART-VLA): VLM preentrenado como System 2 con cabeza de lenguaje entrenada + experto de acciones con flow matching como System 1 |
| Parametros totales | 4.143.404.816 (≈4,14 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo orientado a robótica; las tareas se especifican en inglés) |
| Licencia | gemma |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

El modelo sigue el diseño de FineART-VLA descrito en la model card: una política extremo a extremo que extiende π₀.₅ con una cabeza de lenguaje entrenada. El sistema se divide en dos componentes: un System 2 que predice la siguiente subtarea en lenguaje y un System 1, un experto de acciones basado en flow matching que ejecuta dicha subtarea. El entrenamiento emplea aislamiento de conocimiento (*knowledge insulation*) para preservar las capacidades del VLM preentrenado durante el ajuste. El modelo parte de `lerobot/pi05_base` y se ajusta sobre el dataset bimanual densamente anotado en subtareas de FineART, según la descripción genérica de la model card.

El ajuste fino concreto de este repositorio se realizó sobre el dataset `felsager/vla_cubes_cross_v2`: 1.000 episodios, 493.474 fotogramas a 30 FPS, con cuatro tareas de pick-and-place (cubo azul, verde, amarillo o rojo sobre la cruz roja). La configuración de entrenamiento fue de 30.000 pasos, batch size 16, optimizador AdamW, learning rate 5e-05, semilla 0 y LeRobot 0.6.2. El robot es un `ur5e_hand_e` con cámaras `top` y `wrist`; la observación incluye el estado (10,) y dos imágenes de (3, 480, 640), y la salida es una acción de (10,). No se detalla la composición completa del dataset ni si hubo RLHF/DPO.

## Capacidades

- Manipulación robótica pick-and-place: coger un cubo de color (azul, verde, amarillo o rojo) y colocarlo sobre una cruz roja, a partir de observaciones visuales y de estado.
- Política visuomotora extremo a extremo: consume `observation.state` (10,) y dos imágenes RGB de 480×640 (vistas `top` y `wrist`) y produce acciones de 10 dimensiones.
- Razonamiento en lenguaje de subtareas (System 2): según el diseño FineART-VLA, predice la siguiente subtarea en lenguaje antes de ejecutarla con el experto de acciones.
- Ejecución con flow matching (System 1): genera trayectorias de acción continuas mediante un experto de acciones entrenado.
- Especificación de tarea en lenguaje natural mediante el parámetro `--task` de la CLI de LeRobot (por ejemplo, "pick up the blue cube and place it on the red cross.").
- Integración con el ecosistema LeRobot: entrenamiento con `lerobot-train` y despliegue con `lerobot-rollout`.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, visión general, audio ni modo thinking más allá del bucle subtarea-acción descrito.

## Casos de uso

- Pick-and-place en laboratorio con UR5e: ejecutar la tarea de colocar cubos de color sobre una cruz roja en un entorno controlado, usando `lerobot-rollout` con `--strategy.type=base` y la tarea indicada en `--task`. Es adecuado porque el modelo está entrenado exactamente para esa morfología y esas cuatro variantes de tarea.
- Reproducción de experimentos de VLA: servir como referencia para comparar el ajuste fino de π₀.₅ sobre datasets pequeños (1.000 episodios, ~493k fotogramas) y validar pipelines de imitación con LeRobot 0.6.2.
- Generación de datos sintéticos o aumentados: usar la política como generador de trayectorias en simulación o en un banco de pruebas para alimentar posteriores ciclos de entrenamiento.
- Base para nuevos ajustes finos: partir de este checkpoint para adaptarlo a tareas de pick-and-place con otros objetos o posiciones, reentrenando con `lerobot-train` sobre un dataset propio.
- Docencia y demostraciones de robótica de imitación: ilustrar el ciclo completo grabación-calibración-entrenamiento-despliegue con hardware asequible y cámaras OpenCV.
- Pruebas de integración de hardware: validar la cadena de comunicación con el UR5e y la mano equipada, la sincronización de las cámaras `top` y `wrist` a 30 FPS y la latencia del bucle de control antes de invertir en datasets mayores.
- Evaluación comparativa de políticas: medir tasas de éxito por tarea (azul, verde, amarillo, rojo) frente a otros checkpoints derivados de `pi05_base` en el mismo montaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye la sección de evaluación vacía y declara explícitamente: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Con 4,14 mil millones de parámetros, en FP16 el peso ronda los 8,3 GB; en BF16/FP16 con overhead de activaciones y dos cámaras de 480×640 conviene reservar al menos 12-16 GB, aunque el dato no está confirmado por el autor.
- GPU recomendadas: no disponible. Por tamaño, una RTX 4090 (24 GB), L40S (48 GB), A100 (40/80 GB) o H100 (80 GB) son candidatas razonables, pero no hay validación publicada.
- ¿Cabe en GPU de consumo? Probablemente sí en tarjetas de 16-24 GB (RTX 4080/4090, RTX 3090) en FP16, y en 8-12 GB con cuantización, aunque no se documentan tipos de cuantización soportados.
- Opciones de despliegue: LeRobot 0.6.2 mediante `lerobot-rollout` (estrategia `base`) y entrenamiento con `lerobot-train`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no son adecuados para una política robótica de este tipo.
- Latencia y throughput: no disponibles. El bucle de control debe operar a la frecuencia del dataset (30 FPS), pero no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `felsager/pi05_cube2cross_v2_all_fast` | 4,14 mil millones | no disponible | Pick-and-place de cubos sobre cruz (UR5e) | gemma | Hugging Face, 0 descargas |
| `lerobot/pi05_base` | no disponible en la información | no disponible | Política VLA base π₀.₅ | no disponible en la información | Hugging Face (modelo base) |
| FineART-VLA (Scale AI + Hugging Face) | no disponible en la información | no disponible | Política bimanual con subtareas en lenguaje | no disponible en la información | Referenciado en la model card |
| Otros checkpoints derivados de `pi05_base` | variable | no disponible | Tareas de manipulación específicas | variable | Hugging Face |

No se dispone de datos de rendimiento comparables (tasas de éxito, latencia) para ninguno de los modelos de la tabla en la información proporcionada.

## Limitaciones y advertencias

- Modelo de nicho: entrenado para un único robot (`ur5e_hand_e`), dos cámaras concretas (`top`, `wrist`) y cuatro tareas de pick-and-place; no generaliza a otras morfologías, objetos o disposiciones sin reentrenamiento.
- Sin evaluación publicada: no hay tasas de éxito ni pruebas en robot real reportadas, por lo que el rendimiento en producción es desconocido.
- Riesgo de sobreajuste al dataset: 1.000 episodios y 30.000 pasos sobre una tarea muy repetitiva; es probable que sea sensible a cambios de iluminación, posiciones de objetos, distractores o calibración de cámaras.
- Licencia `gemma`: impone las condiciones de la licencia Gemma, que incluyen restricciones de uso (por ejemplo, políticas de uso aceptable) y obligaciones de atribución; conviene revisarlas antes de cualquier uso comercial.
- Idiomas: no se documentan; las tareas del dataset están en inglés y el modelo no está pensado para interacción multilingüe general.
- Sin datos de cuantización ni de contexto: no se puede planificar el despliegue en hardware limitado con garantías.
- Riesgo de alucinación en el componente de lenguaje (System 2): puede predecir subtareas incorrectas o inconsistentes con el estado visual, lo que se traduce en fallos de manipulación.
- Sesgos: no documentados por el autor; al ser un modelo entrenado con datos propios y sintéticos/controlados, los sesgos relevantes serían de dominio (colores, posiciones, objetos del dataset) más que sociales.
- Repositorio de 27 GB: el despliegue requiere almacenamiento y ancho de banda considerables; conviene verificar la integridad de los safetensors antes de usarlos.
- Cero descargas y cero likes: no hay evidencia de uso comunitario ni de validación independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/felsager/pi05_cube2cross_v2_all_fast
- Dataset de entrenamiento: https://huggingface.co/datasets/felsager/vla_cubes_cross_v2
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=felsager/vla_cubes_cross_v2
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía FineART-VLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/fineart_vla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento de políticas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de la CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
