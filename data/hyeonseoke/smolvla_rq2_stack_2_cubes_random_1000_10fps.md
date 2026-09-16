# HyeonseokE/smolvla_rq2_stack_2_cubes_random_1000_10fps

## Resumen

`HyeonseokE/smolvla_rq2_stack_2_cubes_random_1000_10fps` es una política robótica de tipo vision-language-action (VLA) publicada en Hugging Face por el usuario HyeonseokE, obtenida mediante fine-tuning de `lerobot/smolvla_base` con la librería LeRobot 0.6.0. El modelo resuelve una tarea de manipulación muy concreta: apilar un bloque verde sobre un bloque rojo ("Stack the green block on the red block.") con un brazo robótico SO-101 (`so101_follower`) y dos cámaras (`top` y `left_wrist`).

SmolVLA, el método en el que se basa (arXiv:2506.01844), se presenta como un modelo compacto y eficiente que alcanza rendimiento competitivo con un coste computacional reducido y puede desplegarse en hardware de consumo. Esta política concreta tiene 450.046.176 parámetros (~450 M) y un repositorio de 0,9 GB, lo que la sitúa en el rango de modelos que caben holgadamente en una GPU de gama media.

Su relevancia es la de un artefacto de investigación reproducible: documenta el dataset exacto (100 episodios, 35.978 fotogramas, 10 FPS), la configuración de entrenamiento (28.100 pasos, batch 64, AdamW, lr 1e-4, semilla 1000) y el procedimiento de ejecución con `lerobot-rollout`. No incluye, en cambio, resultados de evaluación en robot real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) compacto; fine-tune de `lerobot/smolvla_base` (metodo SmolVLA, arXiv:2506.01844) |
| Parametros totales | 450.046.176 (~450 M), dato real de los safetensors |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos distribuidos en safetensors) |
| Idiomas soportados | no disponible; la tarea se especifica como cadena de texto en ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Libreria | lerobot 0.6.0 |
| Pipeline | robotics |
| Tipo de robot | `so101_follower` |
| Camaras | `top`, `left_wrist` |
| Entradas | `observation.state` (6,); `observation.images.camera1/2/3` (3, 256, 256) |
| Salidas | `action` (6,); `action.radian_urdf0` (6,) |
| Tarea entrenada | "Stack the green block on the red block." |
| Tamano del repositorio | 0,9 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-16 |
| Dataset de entrenamiento | `HyeonseokE/rq2_stack_2_cubes_random_100_10fps` |

## Arquitectura y entrenamiento

La política es un modelo vision-language-action, es decir, un transformer que consume observaciones multimodales (estado articular de 6 dimensiones más tres entradas visuales de 3x256x256) y produce directamente un vector de acción de 6 dimensiones. Se trata de un fine-tune completo de `lerobot/smolvla_base`, no de un adaptador, y conserva por tanto la arquitectura del modelo base descrito en el artículo SmolVLA. El recuento real de parámetros es de 450.046.176.

El entrenamiento se realizó por imitación supervisada sobre el dataset `HyeonseokE/rq2_stack_2_cubes_random_100_10fps`: 100 episodios, 35.978 fotogramas capturados a 10 FPS, con la instrucción de apilar el bloque verde sobre el rojo. La configuración registrada es de 28.100 pasos, batch de 64, optimizador AdamW, tasa de aprendizaje 0,0001 y semilla 1000, ejecutada con LeRobot 0.6.0. La model card no documenta el uso de RLHF ni de DPO, ni detalla la composición del dataset más allá de los episodios y fotogramas indicados.

## Capacidades

- Generación de acciones de control de 6 grados de libertad a partir de observación visual y estado articular (`observation.state` de 6 dimensiones).
- Ejecución de una tarea de manipulación específica: apilar un bloque verde sobre uno rojo.
- Procesamiento de tres flujos de imagen simultáneos a 256x256 píxeles (aunque el modelo se declara entrenado con las cámaras `top` y `left_wrist`).
- Condicionamiento por instrucción en lenguaje natural: la tarea se pasa como cadena de texto (`--task="Stack the green block on the red block."`).
- Salida dual de acción: vector `action` y su representación `action.radian_urdf0`, ambas de 6 componentes.
- Integración con el ecosistema LeRobot: ejecución con `lerobot-rollout` y reentrenamiento con `lerobot-train`.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión general, audio ni modo de razonamiento explícito; se trata de una política de control, no de un asistente conversacional.

## Casos de uso

- Automatización de pick-and-place en laboratorio: el modelo controla un brazo SO-101 para apilar bloques, una tarea habitual en celdas de ensamblaje de baja complejidad donde no se justifica un sistema de planificación clásico.
- Punto de partida para fine-tuning de tareas de apilado: al derivar de `lerobot/smolvla_base`, sirve como inicialización para variantes con otros objetos, alturas o colores, reutilizando el pipeline `lerobot-train`.
- Reproducción de experimentos de aprendizaje por imitación: la semilla (1000), el número de pasos y el dataset están documentados, lo que permite replicar el entrenamiento y comparar con otras semillas o tasas de aprendizaje.
- Evaluación comparativa de políticas VLA: al tener 450 M de parámetros y 0,9 GB de pesos, se puede desplegar junto a otras políticas en una misma GPU para comparar tasas de éxito y latencia en la misma celda robótica.
- Docencia y prototipado en robótica: el modelo cabe en hardware de consumo, según la propia descripción de SmolVLA, lo que facilita montar demostraciones de VLA en aulas o laboratorios con presupuesto limitado.
- Pruebas de robustez frente a aleatoriedad de posiciones: el dataset se llama "random", de modo que el modelo es apropiado para medir cómo degrada su tasa de éxito cuando se varían las posiciones iniciales de los bloques.
- Validación de cadenas de captura a 10 FPS: permite comprobar si la infraestructura de cámaras y el bucle de control sostienen la frecuencia con la que se grabó el dataset de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye un apartado de evaluación con la anotación explícita de que todavía no se han proporcionado resultados (`No evaluation results have been provided for this policy yet`), sin tabla de ensayos, éxitos ni tasa de éxito. La búsqueda web asociada no devolvió resultados técnicos relevantes sobre este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculo a partir de los 450.046.176 parámetros, no confirmado por el autor): unos 0,9 GB solo para pesos en fp16/bf16, aproximadamente 1,8 GB en fp32 y en torno a 0,45 GB en int8, sin contar activaciones ni los búferes de las tres cámaras de 3x256x256.
- Presupuesto realista: con pesos en media precisión y activaciones de visión, el consumo esperado se sitúa en el rango de 2 a 4 GB de VRAM, cifra orientativa que debe validarse en la práctica porque el autor no publica mediciones.
- La descripción de SmolVLA indica que el modelo puede desplegarse en hardware de consumo; el autor no especifica modelos de GPU concretos.
- Cabe en GPU de consumo, incluidas tarjetas con 8-12 GB de VRAM; no se dispone de confirmación de funcionamiento en CPU ni en GPUs integradas.
- Despliegue mediante LeRobot: `lerobot-rollout` para ejecución sobre el robot y `lerobot-train` para reentrenamiento, con `--policy.device=cuda`. No se documenta soporte de vLLM, TGI, llama.cpp ni Ollama para este artefacto.
- Latencia y throughput: no disponibles. Como referencia indirecta, el dataset de entrenamiento se grabó a 10 FPS, por lo que la política está pensada para operar en torno a 10 Hz (unos 100 ms por paso de control); esta cifra es una inferencia a partir de la frecuencia del dataset, no una medición publicada.
- Requisitos adicionales de sistema: un brazo SO-101 calibrado y dos cámaras configuradas en LeRobot con los nombres de observación con los que se entrenó la política.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `HyeonseokE/smolvla_rq2_stack_2_cubes_random_1000_10fps` | 450.046.176 | no disponible | sin resultados de evaluación publicados | Apache 2.0 | Hugging Face (0 descargas) |
| `lerobot/smolvla_base` | no disponible en la información proporcionada; es el modelo base del que deriva este fine-tune | no disponible | no disponible | no disponible en la información proporcionada | Hugging Face |
| Otras políticas de robótica del ecosistema LeRobot (ACT, Diffusion Policy, pi0) | no disponible | no disponible | no disponible | no disponible | no disponible en la información proporcionada |

No se dispone de datos verificables de benchmarks ni de especificaciones de modelos alternativos en la información proporcionada, por lo que la comparación cuantitativa no es posible.

## Limitaciones y advertencias

- No hay resultados de evaluación en robot real: se desconoce la tasa de éxito de la tarea, por lo que no debe asumirse un rendimiento concreto en producción.
- Especialización extrema: el modelo solo ha sido entrenado para la tarea "Stack the green block on the red block."; fuera de ella no ofrece garantías.
- Dependencia del hardware: está atado a un robot `so101_follower` y a cámaras concretas; cambiar de brazo, de cinemática o de montaje de cámara invalida la política.
- Inconsistencia documental: la model card declara las cámaras `top` y `left_wrist`, mientras que la tabla de entradas lista `observation.images.camera1`, `camera2` y `camera3`. Los nombres de las cámaras deben coincidir con las claves de observación del entrenamiento antes de lanzar `lerobot-rollout`.
- Generalización limitada: el dataset contiene 100 episodios y 35.978 fotogramas de una única tarea; se espera degradación ante posiciones nuevas, cambios de iluminación, objetos distintos o elementos distractores.
- Sobreajuste a la frecuencia de captura: el entrenamiento se hizo con datos a 10 FPS; ejecutar el bucle de control a otra frecuencia puede afectar al comportamiento.
- Idiomas no declarados: la única instrucción documentada está en inglés; no se especifica soporte multilingüe.
- Riesgo de alucinación en el sentido clásico no aplica, pero sí existe riesgo de acciones erráticas o inseguras cuando la observación se sale de la distribución de entrenamiento; se recomienda operar con límites de par, parada de emergencia y espacio de trabajo despejado.
- Licencia Apache 2.0: permite uso comercial y modificación, siempre que se conserve el aviso de licencia y se indique los cambios. No se detectan restricciones adicionales en la información proporcionada, pero conviene revisar también la licencia del modelo base `lerobot/smolvla_base`.
- Procedencia del artefacto: cero descargas y cero likes en el momento de la consulta, sin validación externa conocida; debe tratarse como un experimento de investigación, no como un componente validado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HyeonseokE/smolvla_rq2_stack_2_cubes_random_1000_10fps
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/HyeonseokE/rq2_stack_2_cubes_random_100_10fps
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=HyeonseokE/rq2_stack_2_cubes_random_100_10fps
- Articulo de SmolVLA: https://huggingface.co/papers/2506.01844 (arXiv:2506.01844)
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guia de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Nota sobre la busqueda web: no se encontraron enlaces tecnicos relevantes sobre este modelo; los resultados devueltos correspondian a paginas de YouTube sin relacion con la ficha.
