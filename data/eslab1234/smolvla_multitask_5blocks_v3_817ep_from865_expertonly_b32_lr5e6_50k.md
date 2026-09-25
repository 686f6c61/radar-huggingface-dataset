# eslab1234/smolvla_multitask_5blocks_v3_817ep_from865_expertonly_b32_lr5e6_50k

## Resumen

SmolVLA es un modelo vision-lenguaje-acción (VLA) compacto desarrollado por Hugging Face, disenado para controlar robots manipuladores a partir de instrucciones en lenguaje natural. Este repositorio concreto, `eslab1234/smolvla_multitask_5blocks_v3_817ep_from865_expertonly_b32_lr5e6_50k`, no es el modelo base, sino un *fine-tuning* de `lerobot/smolvla_base` realizado por el usuario `eslab1234` sobre un dataset propio de manipulación con un brazo `so_follower` y dos cámaras (`top` y `wrist`). El modelo tiene 450.046.176 parámetros y se distribuye bajo licencia Apache 2.0.

El modelo resuelve una tarea muy concreta de robótica de imitación: recoger cinco bloques (rojo, amarillo, madera, verde y azul) en secuencia y, o bien colocarlos cada uno en su posición objetivo, o bien apilarlos uno encima de otro. La entrada es el estado del robot (vector de 6 dimensiones) más dos imágenes RGB de 480x640, y la salida es un *chunk* de acciones de 6 dimensiones. Es relevante ahora porque demuestra que un VLA de menos de 500 millones de parámetros puede entrenarse y desplegarse en hardware de consumo, algo que los VLA de gran escala (típicamente miles de millones de parámetros) no permiten.

La model card es explícitamente una plantilla generada por LeRobot y no incluye resultados de evaluación, benchmarks, ni detalles sobre cuantizaciones o idiomas. Cualquier dato no listado a continuación debe considerarse no disponible en la información proporcionada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA: VLM compacto preentrenado + *action expert* entrenado con *flow matching* (modelo vision-lenguaje-acción) |
| Parametros totales | 450.046.176 (dato real de los pesos safetensors) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se especifica en la model card) |
| Idiomas soportados | no disponible (las instrucciones de entrenamiento están en inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería `lerobot`; precisión no especificada) |

Datos adicionales del repositorio y de la configuración de entrenamiento:

| Parametro | Valor |
|---|---|
| Modelo base | `lerobot/smolvla_base` (fine-tuning) |
| Tipo de robot | `so_follower` |
| Camaras | `top`, `wrist` |
| Entrada `observation.state` | STATE, forma `(6,)` |
| Entrada `observation.images.top` | VISUAL, forma `(3, 480, 640)` |
| Entrada `observation.images.wrist` | VISUAL, forma `(3, 480, 640)` |
| Salida `action` | ACTION, forma `(6,)` |
| Dataset | `eslab1234/multitask_5blocks_v3_817ep_trimmed_merged` |
| Episodios / frames / FPS | 817 / 972.241 / 30 FPS |
| Pasos de entrenamiento | 50.000 |
| Batch size | 32 |
| Optimizador | adamw |
| Learning rate | 5e-06 |
| Seed | 1000 |
| Versión de LeRobot | 0.5.2 |
| Tamaño del repositorio | 1,2 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

SmolVLA, descrito en el artículo arXiv:2506.01844, es un VLA ligero compuesto por un VLM preentrenado compacto y un *action expert* entrenado con *flow matching*. Dado un conjunto de imágenes y una instrucción de tarea en lenguaje natural, el modelo genera un *chunk* de acciones (varias acciones futuras de una sola pasada), lo que reduce la frecuencia de inferencia necesaria para bucle de control. La motivación del artículo es que los VLA existentes suelen ser masivos y caros de desplegar, mientras que SmolVLA busca un equilibrio entre capacidad y coste computacional para poder ejecutarse en hardware de consumo.

En este checkpoint concreto, el entrenamiento consistió en 50.000 pasos con batch size 32, optimizador AdamW y un *learning rate* muy bajo (5e-06), partiendo de `lerobot/smolvla_base`. El dataset contiene 817 episodios y 972.241 frames a 30 FPS de dos variantes de la misma tarea multietapa, lo que lo convierte en un ajuste de imitación multi-tarea sobre un único entorno. El nombre del repositorio (`from865`, `expertonly`) sugiere, como interpretación del identificador y no como dato confirmado en la model card, que el ajuste continuó desde un checkpoint previo (865) y que únicamente se entrenó el *action expert* manteniendo congelado el VLM; la model card no detalla esta decisión ni la composición exacta del dataset. No hay información sobre RLHF, DPO ni sobre innovaciones adicionales (decodificación especulativa, atención lineal, etc.).

## Capacidades

- Generación de acciones de control robótico: produce *chunks* de acciones de 6 grados de libertad a partir del estado del robot y de dos vistas de cámara.
- Comprensión de instrucciones en lenguaje natural: acepta la descripción textual de la tarea como condicionamiento (en inglés, según las tareas del dataset).
- Ejecución de tareas multietapa de largo horizonte: la secuencia completa implica recoger cinco bloques en un orden concreto y después colocarlos o apilarlos.
- Percepción visual dual: procesa simultáneamente una cámara cenital (`top`) y una cámara en la muñeca (`wrist`) a 480x640.
- Generalización entre dos variantes de tarea: colocación en posiciones objetivo individuales y apilado secuencial.
- *Tool calling* / *function calling*: no disponible (no es un modelo de lenguaje conversacional).
- Soporte de agentes y razonamiento multi-paso: no disponible en el sentido de agentes software; el equivalente aquí es la planificación implícita de una tarea multietapa.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo *thinking*, visión, audio): visión sí (dos cámaras); no se documenta ningún modo de razonamiento explícito ni audio.

## Casos de uso

- Manipulación pick-and-place en laboratorio: el modelo puede ejecutar la secuencia de recoger cinco bloques y depositarlos en sus posiciones objetivo, usando las dos cámaras para localizar cada pieza. Es adecuado porque fue entrenado exactamente sobre esa tarea con 817 episodios.
- Apilado de piezas pequeñas: la segunda variante entrenada permite apilar los bloques uno sobre otro, un caso representativo de tareas que requieren precisión espacial y realimentación visual continua.
- Punto de partida para *fine-tuning* propio: al ser un ajuste de `lerobot/smolvla_base` con licencia Apache 2.0, sirve como inicialización para nuevos datasets con el mismo robot y disposición de cámaras, reduciendo el coste frente a entrenar desde cero.
- Investigación en VLA de bajo coste: permite reproducir y comparar variantes de SmolVLA en un brazo `so_follower` con GPU de consumo, algo inviable con VLA de miles de millones de parámetros.
- Evaluación comparativa de checkpoints: el propio autor publica otros checkpoints de la misma familia (por ejemplo, `..._684ep_from795hil80k_vlmexpert_20k` y `..._795ep_hil_285k_from285k_add80k`), lo que facilita experimentos de ablación sobre número de episodios, tipo de entrenamiento y pasos.
- Prototipado educativo y *hackathons* de robótica: con 450M de parámetros y pesos en safetensors de 1,2 GB, el modelo se puede desplegar en estaciones de trabajo modestas para demostraciones de aprendizaje por imitación.
- Pruebas de robustez ante cambios de iluminación o de posición inicial de los objetos: al no haber resultados de evaluación publicados, usar este checkpoint como sujeto de pruebas para medir degradación bajo distribución distinta es un caso de uso legítimo y directo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye la sección de evaluación con la nota literal «No evaluation results have been provided for this policy yet», por lo que no existen tasas de éxito, números de *trials* ni métricas de simulación para este checkpoint. No se deben extrapolar los resultados del artículo SmolVLA al comportamiento de este ajuste concreto.

## Requisitos de hardware

- VRAM estimada para inferencia: con 450M de parámetros, los pesos ocupan aproximadamente 0,9 GB en bf16 y 1,8 GB en fp32; sumando activaciones de dos imágenes de 480x640 y el estado del robot, una estimación razonable es de 2 a 4 GB de VRAM en bf16 para batch 1. Es una estimación a partir del recuento de parámetros, no una cifra publicada por el autor.
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM debería ser suficiente; el artículo de SmolVLA destaca explícitamente el despliegue en hardware de consumo. No hay una lista oficial de GPU validadas para este checkpoint.
- Cabe en GPU de consumo: sí, previsiblemente en gamas como RTX 3060, RTX 4060, RTX 4090 o similares, aunque no hay confirmación publicada para este repositorio.
- Opciones de despliegue: la librería `lerobot`, mediante el comando `lerobot-rollout` con `--policy.path=<repo>` y `--strategy.type=base`. El entrenamiento se lanzó con `--policy.device=cuda`. No se documentan rutas de despliegue con vLLM, llama.cpp, Ollama o TGI, que además no son el formato esperado para una política robótica de LeRobot.
- Latencia y throughput: no disponibles. Como referencia operativa, el dataset y las cámaras están configurados a 30 FPS, por lo que la política necesita sostener ese ritmo de inferencia para un control fluido, pero no hay mediciones publicadas de latencia para este checkpoint.

## Comparativa con modelos similares

Solo se dispone de datos verificables de este checkpoint y de su modelo base. El resto de comparaciones se marcan como no disponibles por falta de información en las fuentes consultadas.

| Modelo | Parametros | Contexto / tarea | Licencia | Evaluacion publicada | Disponibilidad |
|---|---|---|---|---|---|
| `eslab1234/smolvla_multitask_5blocks_v3_817ep_from865_expertonly_b32_lr5e6_50k` | 450.046.176 | Tarea de 5 bloques, robot `so_follower`, 2 camaras 480x640 | apache-2.0 | No | Hugging Face, 0 descargas, 0 likes |
| `lerobot/smolvla_base` (modelo base) | no disponible | VLA generalista previo al ajuste | no disponible | no disponible | Hugging Face |
| `eslab1234/smolvla_multitask_5blocks_v3_684ep_from795hil80k_vlmexpert_20k` (checkpoint hermano) | no disponible | Misma familia de tareas, 684 episodios | no disponible | no disponible | Hugging Face |
| `eslab1234/smolvla_multitask_5blocks_v3_795ep_hil_285k_from285k_add80k` (checkpoint hermano) | no disponible | Misma familia de tareas, 795 episodios, con HIL | no disponible | no disponible | Hugging Face |

No se han proporcionado datos sobre alternativas de otros autores (por ejemplo, otros VLA de escala comparable) en la información disponible, por lo que no se incluye una comparación cruzada con ellos.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles. No hay análisis de sesgo para este checkpoint. Al estar entrenado en un único entorno, hereda cualquier sesgo de posición, iluminación o configuración de cámara presente en los 817 episodios.
- Riesgo de alucinación: no aplica en el sentido textual, pero existe el riesgo equivalente de generar acciones no válidas o fuera de distribución cuando la escena difiere de la del entrenamiento. Al ser un modelo físico, un fallo puede traducirse en colisiones o daños materiales.
- Limitaciones de contexto: la longitud de contexto no está documentada. La política espera exactamente las claves de observación con las que se entrenó (`observation.state`, `observation.images.top`, `observation.images.wrist`); si los nombres de cámara no coinciden, el *rollout* fallará.
- Limitaciones de idioma: las dos instrucciones de tarea del dataset están en inglés; no se documenta soporte multilingüe ni generalización a instrucciones nuevas fuera de esas dos formulaciones.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución, siempre que se conserven los avisos de copyright y licencia. No se especifican restricciones adicionales.
- Sin evaluación: no hay ninguna tasa de éxito publicada, ni número de ensayos, ni condiciones de prueba. No se puede asumir que el modelo funcione de forma fiable en producción.
- Especificidad de hardware: entrenado para el tipo de robot `so_follower` con dos cámaras concretas; no hay evidencia de transferencia a otros brazos, a otra cinemática o a una sola cámara.
- Riesgo de sobreajuste: 50.000 pasos con batch 32 sobre 817 episodios de dos tareas muy específicas puede producir un ajuste estrecho a las posiciones y objetos vistos, con degradación ante distractores o cambios de disposición.
- Madurez del repositorio: 0 descargas y 0 likes en el momento de la consulta, y una model card que es la plantilla por defecto de LeRobot sin rellenar en las secciones de evaluación y demo. No ha pasado por una validación externa.
- Seguridad física: cualquier despliegue en un robot real requiere protocolos de parada de emergencia, límites de par y supervisión humana, independientemente de la licencia permisiva.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/eslab1234/smolvla_multitask_5blocks_v3_817ep_from865_expertonly_b32_lr5e6_50k
- Dataset de entrenamiento: https://huggingface.co/datasets/eslab1234/multitask_5blocks_v3_817ep_trimmed_merged
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=eslab1234/multitask_5blocks_v3_817ep_trimmed_merged
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Artículo SmolVLA (arXiv, resumen): https://arxiv.org/abs/2506.01844
- Artículo SmolVLA (HTML completo): https://arxiv.org/html/2506.01844v1
- Página del paper en Hugging Face: https://huggingface.co/papers/2506.01844
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de inferencia y *rollout*: https://huggingface.co/docs/lerobot/main/en/inference
- Documentación de entrenamiento por imitación: https://huggingface.co/docs/lerobot/en/il_robots
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Checkpoint hermano (684 episodios, VLM expert, 20k): https://huggingface.co/eslab1234/smolvla_multitask_5blocks_v3_684ep_from795hil80k_vlmexpert_20k
- Checkpoint hermano (795 episodios, HIL, 285k + 80k): https://huggingface.co/eslab1234/smolvla_multitask_5blocks_v3_795ep_hil_285k_from285k_add80k
- Referencia técnica de terceros sobre el modelo SmolVLA: https://deepwiki.com/skr3178/SmolVLA/2-smolvla-model
