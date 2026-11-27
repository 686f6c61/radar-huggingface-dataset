# chrisw-shadow/cloud_thread_nut_dit_hil_flowmatching_v5

## Resumen

`cloud_thread_nut_dit_hil_flowmatching_v5` es una política robótica de imitación entrenada con LeRobot sobre la arquitectura Multi-Task Diffusion Transformer (DiT), publicada por el usuario `chrisw-shadow`. No es un modelo de lenguaje: es un controlador visuomotor que consume el estado articular del robot y tres cámaras (una fija y dos en las muñecas) y emite un vector de acción de 21 dimensiones. Su única tarea entrenada es "grasp the nut and then thread it onto the upwards facing bolt", es decir, coger una tuerca y enroscarla en un perno orientado hacia arriba.

El modelo tiene 238.312.213 parámetros en formato safetensors (el repositorio ocupa 1,0 GB) y emplea un objetivo de flow matching, según indica el sufijo del nombre y la propia model card, que documenta soporte para objetivos de difusión y flow matching. La arquitectura DiT con condicionamiento texto+visión está descrita en el paper arXiv:2507.05331, que la presenta como una extensión de Diffusion Policy con un transformer de difusión grande capaz de alcanzar alta destreza con unos 450M de parámetros.

Es relevante ahora porque forma parte del ecosistema LeRobot de Hugging Face para aprendizaje por imitación en robots reales, e ilustra el flujo completo de entrenamiento con datos teleoperados (175 episodios, 116.462 frames a 50 FPS) y despliegue mediante `lerobot-rollout`. Su utilidad práctica es acotada: es una política de tarea única para un robot UR10e con pinza Dexee, sin resultados de evaluación publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Multi-Task Diffusion Transformer (DiT) con condicionamiento texto + vision; objetivo flow matching |
| Parametros totales | 238.312.213 (safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; politica visuomotora) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (condicionamiento por instruccion en texto, idioma no especificado) |
| Licencia | no disponible (la model card indica "More Information Needed") |
| Formato de pesos | safetensors (libreria `lerobot`) |
| Tipo de robot | `ur10e_dexee` |
| Camaras | `fixed`, `wrist_1`, `wrist_2` (3, 480, 640) |
| Entrada de estado | `observation.state`, shape (39,) |
| Salida de accion | `action`, shape (21,) |
| Tamano del repositorio | 1,0 GB |
| Version de LeRobot | 0.7.0 |

## Arquitectura y entrenamiento

La política se basa en Multi-Task Diffusion Transformer, una extensión de Diffusion Policy que sustituye el backbone convolucional habitual por un Diffusion Transformer con condicionamiento conjunto de texto e imágenes. El modelo soporta tanto objetivos de difusión como de flow matching; esta instancia concreta se entrenó con flow matching, según el nombre del repositorio y la descripción de la model card. La entrada combina un vector de estado de 39 dimensiones con tres flujos de imagen RGB de 480x640 (cámara fija y dos cámaras de muñeca) y produce un vector de acción de 21 dimensiones, coherente con un brazo UR10e de 6 ejes más una pinza Dexee multi-dedo.

El entrenamiento se realizó con LeRobot 0.7.0 sobre el dataset `chrisw-shadow/nut_5_hil_merged_subset_rel`: 175 episodios, 116.462 frames a 50 FPS, con una única tarea de enroscado de tuerca. La configuración reportada es de 70.000 pasos, batch size 64, optimizador Adam, learning rate 2e-05 y semilla 1000. El sufijo "hil" del nombre sugiere intervención humana en el bucle (human-in-the-loop) durante la recogida de datos, aunque la model card no detalla el protocolo de mezcla de datos autónomos y teleoperados. No se documentan innovaciones adicionales como decodificación especulativa ni atención lineal, ni el número total de tokens de entrenamiento.

## Capacidades

- Control visuomotor de tarea única: generar trayectorias de acción de 21 dimensiones para un UR10e con pinza Dexee a partir de observaciones de estado y tres cámaras.
- Condicionamiento por instrucción en lenguaje natural: la tarea se pasa como texto ("grasp the nut and then thread it onto the upwards facing bolt"), lo que en principio permite reutilizar el mismo backbone para otras tareas si se reentrena.
- Aprendizaje por imitación multi-tarea (a nivel de arquitectura): el paper subyacente describe condicionamiento texto+visión para multi-task robot learning, aunque esta instancia concreta solo se entrenó con una tarea.
- Generación de acciones por flow matching, con muestreo iterativo de trayectorias de acción.
- Integración nativa con el ecosistema LeRobot: entrenamiento con `lerobot-train` y despliegue con `lerobot-rollout`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso en texto, visión general, audio ni modo thinking: no es un modelo de lenguaje.

## Casos de uso

- Ensamblaje de roscado en línea de producción: la política ejecuta la secuencia coger tuerca y enroscarla en un perno vertical sobre un UR10e real, adecuada para tareas repetitivas de montaje donde el posicionamiento del perno está controlado.
- Investigación en aprendizaje por imitación: sirve como referencia reproducible de un pipeline completo LeRobot (dataset, entrenamiento DiT con flow matching, rollout) para comparar variantes de arquitectura o de objetivo de entrenamiento.
- Base para fine-tuning con human-in-the-loop: el dataset de origen incluye el sufijo `hil`, de modo que el modelo puede partirse como inicialización para nuevas rondas de corrección humana sobre la misma tarea.
- Benchmark interno de destreza fina: el enroscado de una tuerca exige alineación precisa y control de fuerza; la política permite medir la tasa de éxito de un DiT de ~238M parámetros en una tarea de contacto.
- Prototipado de celulas robotizadas con camaras multiples: la configuración de una cámara fija más dos de muñeca es un patrón habitual en manipulación; el modelo sirve para validar esa disposición de sensores antes de escalar a otras piezas.
- Docencia y demos de robotica con LeRobot: al ser un checkpoint pequeño (1,0 GB) y con comandos CLI documentados, es viable montar una demostración reproducible en laboratorio con hardware UR10e + Dexee.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una sección de evaluación vacía con el texto "No evaluation results have been provided for this policy yet", sin tabla de ensayos, éxitos ni tasas de éxito en robot real.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 238M parámetros en precisión completa (fp32) el peso ocupa aproximadamente 0,95 GB; en fp16/bf16, unos 0,48 GB. A ello hay que sumar la memoria de activaciones del transformer de difusión y de los tres flujos de imagen de 480x640.
- GPU recomendadas: no especificadas por el autor. Por tamaño, cualquier GPU con al menos 8-16 GB de VRAM debería acomodar el modelo; una RTX 4090 o una A100/H100 son holgadas para esta carga.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas consumer con 8 GB o más, aunque el requisito real depende del número de pasos de muestreo y del backend. No hay cifras publicadas.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--policy.path=chrisw-shadow/cloud_thread_nut_dit_hil_flowmatching_v5` y `--robot.type=ur10e_dexee`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a políticas robóticas.
- Latencia y throughput: no disponibles. La frecuencia de control efectiva depende del robot, del número de pasos de flow matching y del hardware; el dataset se grabó a 50 FPS, pero no se indica la tasa de inferencia alcanzada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `cloud_thread_nut_dit_hil_flowmatching_v5` (este) | 238.312.213 | estado (39,) + 3 imagenes 480x640 | Enroscado de tuerca en UR10e Dexee | no disponible | Hugging Face, 0 descargas |
| Diffusion Policy (baseline del paper) | no disponible | observaciones visuales y de estado | Politicas visuomotoras multi-tarea | no disponible | Referencia en arXiv:2507.05331 |
| Multi-Task DiT (~450M, segun paper) | ~450M | texto + vision | Multi-task robot learning | no disponible | Referencia en arXiv:2507.05331 |

No se dispone de datos de rendimiento comparativo (tasas de éxito, latencia) entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Tarea única: solo se entrenó para "grasp the nut and then thread it onto the upwards facing bolt"; no generaliza a otras piezas ni a otras orientaciones del perno sin reentrenamiento.
- Hardware específico: asume un UR10e con pinza Dexee y exactamente tres cámaras con los nombres `fixed`, `wrist_1` y `wrist_2`; cambiar la configuración de sensores o el robot invalida la política.
- Sin evaluación publicada: no hay tasas de éxito en robot real, por lo que se desconoce su robustez ante cambios de iluminación, posiciones de objeto o distracciones.
- Licencia no disponible: la model card marca la licencia como "More Information Needed", lo que impide confirmar si el uso comercial está permitido. No debe desplegarse en producción sin aclarar este punto.
- Riesgo de sobreajuste al dataset: 175 episodios y 116.462 frames de una sola tarea sugieren poca diversidad; es esperable un deterioro ante variaciones no vistas.
- Sin información sobre sesgos, alucinación o comportamiento fuera de distribución; en robótica, los fallos se traducen en colisiones o daños físicos, por lo que se requiere supervisión y paradas de emergencia.
- Idiomas y cuantizaciones no documentados; el condicionamiento textual usa una instrucción fija en inglés y no se especifica robustez ante paráfrasis.
- Repositorio sin descargas ni likes y creado y actualizado el mismo día (2026-11-27), sin historial de validación por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chrisw-shadow/cloud_thread_nut_dit_hil_flowmatching_v5
- Dataset de entrenamiento: https://huggingface.co/datasets/chrisw-shadow/nut_5_hil_merged_subset_rel
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=chrisw-shadow/nut_5_hil_merged_subset_rel
- Paper de Multi-Task Diffusion Transformer: https://huggingface.co/papers/2507.05331 (arXiv:2507.05331)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de multi_task_dit en LeRobot: https://huggingface.co/docs/lerobot/main/en/multi_task_dit
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
