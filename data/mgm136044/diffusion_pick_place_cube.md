# mgm136044/diffusion_pick_place_cube

## Resumen

`mgm136044/diffusion_pick_place_cube` es una política de control visuomotor entrenada con el método Diffusion Policy y publicada en el Hub mediante la librería LeRobot de Hugging Face. No es un modelo de lenguaje: es una política robótica de imitación que transforma observaciones (estado articular de 6 dimensiones y dos cámaras RGB de 480x640) en trayectorias de acción de 6 dimensiones. El autor es el usuario `mgm136044` y la licencia es Apache 2.0.

El modelo resuelve una tarea concreta de manipulación: "Pick and place the cube" (coger y colocar un cubo). Se entrenó sobre un dataset propio de 50 episodios y 19.137 fotogramas a 25 FPS, capturados con un robot `so_follower` (el seguidor del brazo SO-100/SO-101 de LeRobot) equipado con dos cámaras, una cenital (`overhead`) y otra en la muñeca (`wrist`). La arquitectura Diffusion Policy trata el control como un proceso generativo de difusión, lo que produce trayectorias multimodales y suaves, especialmente útiles en manipulación con contacto rico.

Su relevancia es acotada pero clara: sirve como ejemplo reproducible de entrenamiento de una política de imitación de extremo a extremo con LeRobot 0.6.0 y como punto de partida para quien quiera replicar el pipeline en hardware SO follower. El repositorio pesa 1,1 GB y contiene 277.840.246 parámetros en safetensors. No hay resultados de evaluación publicados ni descargas registradas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (modelo generativo de difusión para control visuomotor) |
| Parametros totales | 277.840.246 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (política robótica; ventana de observación definida por la configuración de entrenamiento, no disponible) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo robótico, no lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Librería | LeRobot 0.6.0 |
| Tipo de robot | `so_follower` |
| Cámaras | `overhead`, `wrist` (3x480x640 cada una) |
| Entrada de estado | `observation.state` con forma (6,) |
| Salida de acción | `action` con forma (6,) |
| Dataset de entrenamiento | `mgm136044/pick-place-cube_20261008_100203` (50 episodios, 19.137 fotogramas, 25 FPS) |
| Tarea | "Pick and place the cube" |
| Pasos de entrenamiento | 100.000 |
| Batch size | 8 |
| Optimizador | Adam |
| Learning rate | 0,0001 |
| Semilla | 1000 |
| Tamaño del repo | 1,1 GB |

## Arquitectura y entrenamiento

La política sigue el método Diffusion Policy (Chi et al., 2023), que formula el control visuomotor como un proceso de difusión generativo: en lugar de predecir una única acción de forma determinista, el modelo aprende a generar secuencias de acciones mediante un proceso iterativo de eliminación de ruido. Esto permite representar distribuciones multimodales de comportamiento (por ejemplo, aproximarse al cubo por la izquierda o por la derecha) y produce trayectorias más suaves que los enfoques de regresión directa. La implementación concreta corresponde al tipo `diffusion` de LeRobot, que combina un codificador visual para las dos cámaras con un backbone de difusión condicionado por el estado articular y las imágenes.

El entrenamiento se realizó por imitación supervisada sobre 50 episodios teleoperados (19.137 fotogramas a 25 FPS) durante 100.000 pasos con batch size 8, optimizador Adam y learning rate 1e-4, semilla 1000, usando LeRobot 0.6.0. No se documenta uso de RLHF, DPO ni refinamiento por refuerzo; es aprendizaje por imitación puro. Tampoco se especifican la composición exacta del dataset más allá de la tarea, ni aumentos de datos, ni la arquitectura interna del backbone de difusión (número de pasos de denoising, tipo de scheduler, dimensión latente), datos que no están disponibles en la información proporcionada.

## Capacidades

- Control visuomotor de manipulación: genera acciones de 6 grados de libertad a partir de dos vistas RGB y del estado articular.
- Ejecución de una tarea concreta: coger y colocar un cubo ("Pick and place the cube").
- Generación de trayectorias multimodales y suaves gracias al proceso de difusión, adecuado para manipulación con contacto.
- Inferencia en tiempo real sobre el robot `so_follower` mediante el comando `lerobot-rollout`.
- Reentrenamiento y ajuste con el pipeline `lerobot-train` sobre datasets propios en formato LeRobot.
- No soporta tool calling, function calling, razonamiento multi-paso simbólico ni capacidades lingüísticas: no es un modelo de lenguaje.
- No dispone de modo thinking, visión general, audio ni procesamiento de lenguaje natural.

## Casos de uso

- Demostración educativa de Diffusion Policy: sirve para ilustrar el pipeline completo de imitación (grabación de datos, entrenamiento y despliegue) con LeRobot sobre un brazo SO follower de bajo coste.
- Automatización de una celda de pick-and-place de laboratorio: el modelo ejecuta la tarea de coger y colocar un cubo en un entorno controlado con cámara cenital y de muñeca, útil para prototipos de clasificación o alimentación de piezas.
- Base para fine-tuning en tareas similares: al estar en formato LeRobot y con licencia Apache 2.0, se puede reentrenar con nuevos datasets de manipulación y reutilizar como punto de partida.
- Benchmark interno de hardware robótico: permite medir latencia de inferencia y estabilidad del control en un SO follower real antes de escalar a tareas más complejas.
- Investigación en imitación con pocos datos: con solo 50 episodios, es un caso de estudio de cuánto rendimiento se obtiene con datasets pequeños en Diffusion Policy.
- Integración en pipelines de evaluación reproducible: el comando `lerobot-rollout` con `--strategy.type=base` permite lanzar ejecuciones de duración fija y comparar comportamiento entre checkpoints.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real ("No evaluation results have been provided for this policy yet"), por lo que no hay tasas de éxito, ni comparaciones con otras políticas, ni métricas de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 277,8 M de parámetros en safetensors (aproximadamente 1,1 GB en fp32), la inferencia requiere del orden de 1 a 2 GB de VRAM en fp32 y menos de 1 GB en fp16, aunque esta estimación no está confirmada por el autor.
- GPU recomendadas: no especificadas. Dado el tamaño, cualquier GPU consumer con al menos 4 GB de VRAM debería poder ejecutar la política; se recomienda una RTX 3060 o superior para margen.
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU moderna con 4 GB o más de VRAM, aunque no hay confirmación oficial.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para inferencia, `lerobot-train` para entrenamiento); el resto de backends (vLLM, llama.cpp, Ollama, TGI) no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. La frecuencia de control está condicionada por el robot y las cámaras (los ejemplos de la model card usan cámaras a 30 FPS y el dataset se grabó a 25 FPS), pero no se publican cifras de latencia por paso de difusión.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto / observación | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `mgm136044/diffusion_pick_place_cube` | Diffusion Policy (LeRobot) | 277,8 M | Estado (6,) + 2 cámaras 480x640 | Apache 2.0 | Hugging Face |
| Políticas ACT de LeRobot | Action Chunking Transformer | no disponible | no disponible | Apache 2.0 (habitual en LeRobot) | Hugging Face / LeRobot |
| Políticas TDMPC / VQ-BeT de LeRobot | Otros métodos de imitación | no disponible | no disponible | Apache 2.0 (habitual en LeRobot) | Hugging Face / LeRobot |

No se dispone de datos de rendimiento comparativo entre estas políticas en la información proporcionada, por lo que la comparación se limita a tipo de método, licencia y disponibilidad. No se han encontrado benchmarks públicos que permitan contrastar tasas de éxito frente a alternativas.

## Limitaciones y advertencias

- Sin evaluación publicada: no hay tasas de éxito en robot real, por lo que se desconoce su fiabilidad fuera del dataset de entrenamiento.
- Sobreajuste probable a un entorno concreto: entrenada con 50 episodios de una única tarea, posición de cámara y robot; cambios de iluminación, posición de objetos, fondo o robot pueden degradar el comportamiento.
- Requiere hardware específico: robot `so_follower` y dos cámaras con los nombres `overhead` y `wrist`; los nombres e índices de cámara deben coincidir con las claves de observación del entrenamiento.
- Sin capacidades lingüísticas ni de razonamiento simbólico: no es apta para tareas de NLP, tool calling ni agentes conversacionales.
- Riesgo de alucinación en el sentido de acciones no válidas: como toda política de imitación, puede generar trayectorias fuera de distribución ante observaciones no vistas.
- Sesgos: no documentados; el dataset es de un único operador y una única tarea, lo que puede introducir sesgos de estilo de teleoperación.
- Licencia Apache 2.0 permite uso comercial, pero la responsabilidad sobre seguridad física en el robot recae en el integrador; no hay garantías del autor.
- Idiomas: no aplica; el campo de idiomas no está disponible porque el modelo no procesa texto.
- Repositorio con 0 descargas y 0 likes: ecosistema de validación comunitaria nulo, lo que refuerza la cautela antes de usarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mgm136044/diffusion_pick_place_cube
- Dataset de entrenamiento: https://huggingface.co/datasets/mgm136044/pick-place-cube_20261008_100203
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=mgm136044/pick-place-cube_20261008_100203
- Paper de Diffusion Policy: https://huggingface.co/papers/2303.04137
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guía de grabación y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
