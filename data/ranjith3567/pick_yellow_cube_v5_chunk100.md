# ranjith3567/pick_yellow_cube_v5_chunk100

## Resumen

`pick_yellow_cube_v5_chunk100` es una política de robótica entrenada con LeRobot que implementa la arquitectura SmolVLA, un modelo compacto de visión-lenguaje-acción (VLA) presentado en el paper arXiv:2506.01844. Lo publica el usuario ranjith3567 y resuelve una tarea de manipulación muy concreta: coger un bloque amarillo y depositarlo en una caja marrón. No es un modelo de propósito general, sino un checkpoint de imitación entrenado sobre un único dataset de demostraciones teleoperadas con un robot `so_follower` y varias cámaras.

El modelo tiene 450.046.176 parámetros (aproximadamente 0,45 B) en formato safetensors, con un tamaño de repositorio de 0,9 GB. Consume observaciones de estado (vector de 6 dimensiones) y cuatro flujos visuales (tres cámaras a 256×256 y una a 480×640) y produce un vector de acción de 6 dimensiones. La relevancia de este tipo de checkpoint es práctica: SmolVLA está diseñado para ejecutarse en hardware de consumo, lo que permite desplegar políticas VLA sin clústeres de GPU.

El interés para desarrolladores e investigadores es doble. Por un lado, sirve como ejemplo reproducible de un pipeline completo de LeRobot (grabación de datos, entrenamiento con `lerobot-train`, despliegue con `lerobot-rollout`). Por otro, ilustra las limitaciones típicas de las políticas de imitación de un solo task: generalización estrecha, dependencia de la configuración exacta de cámaras y ausencia de evaluación publicada. La licencia no está declarada y no hay resultados de benchmarks ni métricas de éxito en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action, transformer compacto; detalles internos no disponibles en la informacion proporcionada) |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (modelo de robótica, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card indica "[More Information Needed]") |
| Formato de pesos | safetensors (libreria lerobot) |
| Entradas | `observation.state` (6,), `observation.images.camera1/2/3` (3, 256, 256), `observation.images.empty_camera_0` (3, 480, 640) |
| Salidas | `action` (6,) |
| Tipo de robot | `so_follower` |
| Camaras | Top, Side |
| Tamano del repositorio | 0,9 GB |
| Version de LeRobot | 0.6.2 |

## Arquitectura y entrenamiento

SmolVLA es un modelo de visión-lenguaje-acción compacto que combina percepción visual, instrucciones en lenguaje natural y generación de acciones motoras en un único transformer. La model card no detalla la composición interna (número de capas, dimensión oculta, mecanismo de fusión visión-lenguaje), por lo que esos datos deben consultarse en el paper arXiv:2506.01844. El checkpoint aquí descrito consume tres cámaras de 256×256 y una cuarta de 480×640, además de un vector de estado de 6 dimensiones, y emite comandos de acción de 6 dimensiones compatibles con el robot `so_follower`.

El entrenamiento se realizó con LeRobot 0.6.2 sobre el dataset `ranjith3567/pick_yellow_cube_v5_20261105_191046`, compuesto por 100 episodios y 63.143 fotogramas a 30 FPS de la tarea "pick the yellow block and place it in brown box". La configuración fue de 100.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-4 y semilla 1000. No se indica en la información disponible si hubo RLHF, DPO ni ninguna fase de ajuste posterior a la imitación supervisada; el pipeline descrito es de imitation learning puro. El sufijo `chunk100` del nombre sugiere una configuración de *action chunking* con horizonte 100, aunque este extremo no se confirma explícitamente en la model card.

## Capacidades

- Manipulación robótica de una tarea específica: coger un bloque amarillo y colocarlo en una caja marrón.
- Percepción visual multi-cámara: procesa simultáneamente tres vistas de 256×256 y una de 480×640.
- Condicionamiento por instrucción en lenguaje natural: acepta el task string "pick the yellow block and place it in brown box".
- Generación de acciones de 6 dimensiones para un robot `so_follower` (típicamente brazo de 6 grados de libertad).
- Ejecución autónoma en bucle mediante `lerobot-rollout` con estrategia `base`.
- Entrenamiento y reentrenamiento reproducibles con `lerobot-train` y `--policy.type=smolvla`.
- No se documentan capacidades de tool calling, agentes multi-paso, razonamiento general, matemáticas, código ni procesamiento de audio; no es un modelo de lenguaje de propósito general.

## Casos de uso

- **Automatización de pick-and-place en laboratorio**: el modelo ejecuta el ciclo completo de detección, aproximación, agarre y depósito del bloque amarillo en la caja marrón, adecuado para prototipos de investigación en manipulación con el robot `so_follower`.
- **Reproducción de experimentos de imitation learning**: sirve como checkpoint de referencia para comparar configuraciones de SmolVLA (por ejemplo, frente a la variante `chunk25` del mismo autor) en condiciones controladas de laboratorio.
- **Base para fine-tuning en tareas similares**: partiendo de este checkpoint y del pipeline `lerobot-train`, se puede adaptar a nuevas variantes de pick-and-place con un dataset propio de pocos centenares de episodios.
- **Validación de pipelines de LeRobot en CI**: el par `lerobot-rollout`/`lerobot-train` permite montar pruebas de humo de extremo a extremo (carga del checkpoint, inferencia con cámaras simuladas) antes de desplegar políticas en robots reales.
- **Docencia y formación en robótica de imitación**: el modelo y su dataset asociado (100 episodios, 63.143 fotogramas) constituyen un ejemplo completo y de tamaño manejable para explicar el ciclo teleoperación-entrenamiento-despliegue.
- **Despliegue en hardware de consumo**: al ser un SmolVLA de ~0,45 B de parámetros y 0,9 GB de pesos, es viable ejecutarlo en una estación de trabajo con GPU de gama media para demostraciones y ferias, sin infraestructura de centro de datos.
- **Generación de datos sintéticos de evaluación**: las trayectorias generadas por la política pueden usarse como referencia para comparar controladores clásicos frente a políticas aprendidas en la misma tarea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una sección de evaluación vacía con el texto "No evaluation results have been provided for this policy yet", por lo que no existen tasas de éxito, métricas de precisión de agarre ni comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 450 M de parámetros en safetensors (fp32/fp16) el peso ronda 0,9-1,8 GB, por lo que en la práctica cabría en GPU de consumo con 4-8 GB de VRAM, aunque este cálculo no está confirmado por el autor.
- GPU recomendadas: no especificadas por el autor; SmolVLA se presenta en su paper como desplegable en hardware de consumo, lo que incluye tarjetas tipo RTX 3060/4060/4090.
- Cabe en GPU de consumo: sí, según la premisa de SmolVLA; no hay medición publicada para este checkpoint concreto.
- Opciones de despliegue: `lerobot-rollout` (estrategia `base`) para ejecución en robot; `lerobot-train` para reentrenamiento. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles. La captura de datos se realizó a 30 FPS, pero no se indica la frecuencia de inferencia alcanzada en despliegue.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Contexto / entradas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `ranjith3567/pick_yellow_cube_v5_chunk100` | 450.046.176 | Pick-and-place de bloque amarillo | Estado (6,) + 4 flujos de imagen | no disponible | Hugging Face, 0 descargas |
| `ranjith3567/pick_yellow_cube_v5_chunk25` | ~0,5 B (según búsqueda web) | Misma tarea, distinto horizonte de chunking | no disponible | no disponible | Hugging Face |
| SmolVLA base (paper arXiv:2506.01844) | no disponible en la informacion proporcionada | VLA generalista compacto | multimodal visión-lenguaje-acción | no disponible | Paper y código LeRobot |

La comparación cuantitativa de rendimiento entre estos checkpoints no es posible con la información disponible: ninguno de ellos publica tasas de éxito ni benchmarks. La diferencia documentada entre `chunk100` y `chunk25` es únicamente el horizonte de action chunking sugerido por el nombre.

## Limitaciones y advertencias

- **Generalización muy estrecha**: la política está entrenada para una única tarea y un único montaje; cambios en la posición de la caja, la iluminación, el color del bloque o el tipo de robot pueden degradar el comportamiento sin aviso.
- **Dependencia de la configuración de cámaras**: los nombres e índices de cámara deben coincidir exactamente con las claves de observación del entrenamiento (`camera1`, `camera2`, `camera3`, `empty_camera_0`); un desajuste provoca fallos de inferencia.
- **Ausencia de evaluación**: no hay tasa de éxito publicada, por lo que no se puede estimar la fiabilidad en producción.
- **Licencia no declarada**: la model card indica "[More Information Needed]"; no se puede asumir uso comercial permitido.
- **Sesgos y alucinación**: en el contexto robótico, el riesgo equivalente es la ejecución de acciones no seguras o fuera de distribución; no hay análisis de fallos publicado.
- **Idiomas**: no se declara soporte multilingüe; la instrucción de tarea está en inglés y el modelo no es un LLM conversacional.
- **Madurez**: 0 descargas y 0 likes en el momento de la consulta, creado el 2026-11-08; es un artefacto de investigación sin validación externa.
- **Caveat de producción**: al ser una política de imitación sin mecanismos de seguridad explícitos, requiere paradas de emergencia y límites de par/velocidad en el robot anfitrión.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ranjith3567/pick_yellow_cube_v5_chunk100
- Dataset de entrenamiento: https://huggingface.co/datasets/ranjith3567/pick_yellow_cube_v5_20261105_191046
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=ranjith3567/pick_yellow_cube_v5_20261105_191046
- Paper SmolVLA: https://huggingface.co/papers/2506.01844
- Guía SmolVLA de LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Checkpoint hermano con chunking 25: https://huggingface.co/ranjith3567/pick_yellow_cube_v5_chunk25
- Dataset previo del mismo autor: https://huggingface.co/datasets/ranjith3567/pick_Yellow_cube_20261009_203921
