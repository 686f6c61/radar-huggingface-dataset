# HyeonseokE/smolvla_rq2_stack_2_cubes_cap_1000_10fps

## Resumen

smolvla_rq2_stack_2_cubes_cap_1000_10fps es una política visión-lenguaje-acción (VLA) para control robótico publicada por el usuario HyeonseokE en Hugging Face. Se trata de un ajuste fino del modelo base `lerobot/smolvla_base`, que implementa el método SmolVLA descrito en el artículo arXiv:2506.01844: una política compacta y eficiente, pensada para ejecutarse en hardware de consumo. Cuenta con 450.046.176 parámetros (~450 M), un repositorio de 0,9 GB, pesos en formato safetensors y licencia Apache 2.0.

El problema que resuelve es concreto: generar comandos de acción de 6 dimensiones para un brazo robótico SO-101 (tipo `so101_follower`) a partir de tres vistas de cámara de 256×256 píxeles, el estado de las articulaciones y una instrucción de tarea en lenguaje natural. La única tarea entrenada es "Stack the green block on the red block" (apilar el bloque verde sobre el rojo), a partir de un dataset de 100 episodios y 35.697 fotogramas grabados a 10 FPS.

Su interés radica en servir como punto de partida reproducible para experimentos de aprendizaje por imitación con LeRobot 0.6.0 y para comprobar hasta qué punto una política VLA de menos de 500 M de parámetros puede ejecutar manipulación real en hardware asequible. En el momento de redactar esta ficha el repositorio acumula 0 descargas y 0 valoraciones, y no se han publicado resultados de evaluación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Visión-lenguaje-acción (VLA) basada en SmolVLA (arXiv:2506.01844), ajustada desde `lerobot/smolvla_base`. Detalle de capas, mecanismos de atención y uso de flow matching: no disponible |
| Parámetros totales | 450.046.176 (~450 M), dato real de los safetensors |
| Parámetros activos | No aplica: no es un modelo de mezcla de expertos (MoE) |
| Longitud de contexto | no disponible. La entrada no es una secuencia de tokens arbitraria: 3 imágenes de 256×256 px, un vector de estado de 6 dimensiones y una instrucción textual de tarea |
| Tipos de cuantización | no disponible. No se publican versiones cuantizadas (GGUF, int8, int4) |
| Idiomas soportados | no disponible. La instrucción de tarea del dataset de entrenamiento está en inglés ("Stack the green block on the red block") |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |
| Tamaño del repositorio | 0,9 GB |
| Tipo de robot | `so101_follower` (brazo SO-101) |
| Cámaras declaradas | `top`, `left_wrist` |
| Entradas | `observation.state` (6,); `observation.images.camera1/2/3` (3, 256, 256) |
| Salidas | `action` (6,); `action.radian_urdf0` (6,) |
| Fecha de publicación | 2026-09-15 (última actualización: 2026-09-15) |

## Arquitectura y entrenamiento

La ficha del autor describe SmolVLA como un modelo visión-lenguaje-acción compacto que alcanza rendimiento competitivo con un coste computacional reducido y que puede desplegarse en hardware de consumo. En la práctica, esta política consume tres flujos visuales de 256×256 píxeles procedentes de dos cámaras (`top` y `left_wrist`), un vector de estado articular de 6 dimensiones y una instrucción de tarea, y produce dos tensores de acción de 6 dimensiones (`action` y `action.radian_urdf0`), que son los comandos enviados al brazo SO-101. No se documentan en la información disponible ni la topología interna exacta, ni el tipo de decodificación de acciones, ni si se emplea decodificación especulativa o atención lineal.

El entrenamiento consiste en un ajuste fino supervisado sobre el modelo base `lerobot/smolvla_base` usando el dataset `HyeonseokE/rq2_stack_2_cubes_cap_100_10fps`: 100 episodios, 35.697 fotogramas, 10 FPS y una única instrucción de tarea. La configuración declarada es la siguiente: 27.850 pasos, tamaño de lote 64, optimizador AdamW, tasa de aprendizaje 0,0001, semilla 1000 y LeRobot 0.6.0. No se indica si hubo RLHF, DPO u otra fase de ajuste por preferencias, ni la composición detallada del dataset más allá de la tarea y las estadísticas citadas.

| Ajuste de entrenamiento | Valor |
|---|---|
| Pasos | 27.850 |
| Tamaño de lote | 64 |
| Optimizador | AdamW |
| Tasa de aprendizaje | 0,0001 |
| Semilla | 1000 |
| Versión de LeRobot | 0.6.0 |
| Episodios del dataset | 100 |
| Fotogramas del dataset | 35.697 |
| Frecuencia de grabación | 10 FPS |
| Tarea | "Stack the green block on the red block." |

## Capacidades

- Generación de acciones de control de 6 dimensiones para un brazo robótico SO-101 a partir de observaciones multimodales (imagen, estado articular y lenguaje).
- Ejecución de una tarea de manipulación concreta: apilar un bloque verde sobre un bloque rojo.
- Fusión de tres vistas visuales (cámara superior y muñeca izquierda más una tercera entrada visual declarada) con el estado del robot.
- Condicionamiento por instrucción de tarea en lenguaje natural: la política acepta un texto de tarea, aunque solo se ha entrenado con uno.
- Producción de dos representaciones de acción en paralelo (`action` y `action.radian_urdf0`), lo que permite trabajar con la representación articular o con la parametrización URDF.
- No dispone de generación de texto, razonamiento simbólico, código, matemáticas ni visión descriptiva: es una política de control, no un modelo de lenguaje.
- No soporta tool calling ni function calling, ni orquestación de agentes multi-paso, ni modo "thinking".
- Soporte multilingüe: no disponible; no hay evidencia de instrucciones en otros idiomas distintos del inglés empleado en el dataset.

## Casos de uso

- Apilado de bloques con SO-101: es el escenario exacto para el que se entrenó la política; se ejecuta con `lerobot-rollout` sobre un `so101_follower` y la instrucción "Stack the green block on the red block", reproduciendo la distribución de posiciones y colores del dataset.
- Punto de partida para ajuste fino en nuevas tareas: al derivar de `lerobot/smolvla_base`, puede reentrenarse con `lerobot-train` sobre un dataset propio de demostraciones para tareas distintas (otras piezas, otros contenedores, otras posiciones).
- Reproducción de experimentos de aprendizaje por imitación: permite replicar un pipeline completo de LeRobot 0.6.0 (grabación, entrenamiento y despliegue) con una configuración documentada paso a paso.
- Evaluación comparativa de políticas VLA en hardware asequible: con ~450 M de parámetros, sirve como referencia de bajo coste frente a políticas de miles de millones de parámetros en estudios de compromiso entre precisión y recursos.
- Docencia en robótica: el par brazo SO-101 más esta política ofrece un caso de estudio autocontenido sobre imitación, calibración de cámaras y despliegue de modelos en el borde.
- Investigación en generalización de dominio: al conocerse las condiciones de recogida (100 episodios a 10 FPS), es un banco de pruebas para medir la degradación al variar iluminación, posición inicial de los objetos o disposición de las cámaras.
- Automatización de pick-and-place en laboratorio: siempre que los objetos, la iluminación y las cámaras coincidan con las condiciones de entrenamiento, puede integrarse como controlador de una celda sencilla de apilado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La sección de evaluación de la model card está vacía y solo contiene la indicación de que todavía no se han proporcionado resultados para esta política. No se dispone de tasas de éxito en robot real, comparativas con otras políticas ni métricas de simulación.

## Requisitos de hardware

- VRAM estimada para los pesos (cálculo a partir de 450 M de parámetros): ~1,8 GB en fp32 y ~0,9 GB en fp16/bf16 (coherente con el tamaño de repositorio de 0,9 GB, lo que sugiere pesos almacenados a ~2 bytes por parámetro).
- VRAM estimada para inferencia completa, incluidas activaciones de tres imágenes de 256×256: en torno a 1,5-2 GB en bf16 y 2,5-3 GB en fp32. Son estimaciones derivadas del número de parámetros, no cifras oficiales.
- GPU recomendadas: cualquier GPU de consumo con al menos 4 GB de VRAM (por ejemplo, RTX 3050, RTX 4060, RTX 3060). También es viable la inferencia en CPU para pruebas de baja frecuencia.
- Cabe en GPU de consumo de forma holgada, que es precisamente el objetivo declarado de SmolVLA.
- Opciones de despliegue: LeRobot mediante el comando `lerobot-rollout` con `--policy.path=HyeonseokE/smolvla_rq2_stack_2_cubes_cap_1000_10fps`; entrenamiento o reajuste con `lerobot-train`. Servidores de inferencia de lenguaje como vLLM o TGI no aplican a este tipo de política, y no se publican pesos GGUF para llama.cpp u Ollama.
- Latencia y throughput: no disponible. Como referencia operativa, el dataset de entrenamiento se grabó a 10 FPS, por lo que el bucle de control debería sostener al menos esa frecuencia para reproducir el comportamiento aprendido.

## Comparativa con modelos similares

| Modelo | Parámetros | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este modelo | 450 M (450.046.176) | VLA ajustado para una única tarea de apilado con SO-101 | Apache 2.0 | Hugging Face, librería `lerobot` |
| `lerobot/smolvla_base` | Del mismo orden (~450 M), al ser el modelo base del que deriva este ajuste | VLA preentrenado para manipulación, ajustable a tareas concretas | Consultar su ficha | Hugging Face |
| OpenVLA | ~7 B | VLA de propósito general con backbone de tipo Llama-2-7B y codificadores visuales | Licencia abierta, consultar | Hugging Face / GitHub |
| Octo | no disponible | Política transformer generalista para manipulación entrenada sobre datos abiertos | Consultar | GitHub / Hugging Face |

Los datos de los modelos alternativos no proceden de la información proporcionada en esta ficha, sino de conocimiento general sobre el estado del arte; deben verificarse en sus fuentes originales antes de usarse en una comparación formal.

## Limitaciones y advertencias

- Especialización extrema: la política se ha entrenado con una sola tarea y un único dataset de 100 episodios; fuera de "apilar el bloque verde sobre el rojo" no hay evidencia de comportamiento útil.
- Sin métricas de evaluación: no se ha publicado ninguna tasa de éxito en robot real, por lo que se desconoce su fiabilidad práctica.
- Dependencia del montaje: las entradas esperadas son tres cámaras declaradas como `top` y `left_wrist` (más una tercera entrada visual) y un robot `so101_follower`. Cambios en la calibración, la resolución, la exposición o la posición de las cámaras invalidan el comportamiento aprendido.
- Sensibilidad al dominio: variaciones de iluminación, color de los objetos, fondo, posición inicial o presencia de distractores pueden degradar el rendimiento, ya que no se documenta aumento de datos ni variabilidad controlada.
- Riesgo de alucinación trasladado al dominio motor: no existe generación de texto que pueda ser falsa, pero sí acciones erráticas, inseguras o no previstas cuando la observación se aleja de la distribución de entrenamiento. Debe operarse con límites de par, parada de emergencia y espacio de trabajo despejado.
- Idiomas: no hay soporte multilingüe documentado; la única instrucción empleada está en inglés.
- Sesgos: no documentados por el autor. Al proceder de demostraciones humanas, la política reproduce los sesgos de trayectoria y de colocación de los operarios que grabaron los 100 episodios.
- Licencia: Apache 2.0 permite uso comercial de estos pesos, pero conviene verificar por separado la licencia del modelo base `lerobot/smolvla_base`, la de LeRobot y las condiciones de uso del hardware SO-101.
- Madurez: 0 descargas y 0 valoraciones; no ha pasado por validación de la comunidad. El nombre del repositorio sugiere que forma parte de una serie de experimentos (rq2), aunque la model card no documenta ese contexto.
- Aviso de seguridad física: cualquier despliegue sobre hardware real exige supervisión, protocolos de parada y verificación previa en un entorno controlado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HyeonseokE/smolvla_rq2_stack_2_cubes_cap_1000_10fps
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/HyeonseokE/rq2_stack_2_cubes_cap_100_10fps
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=HyeonseokE/rq2_stack_2_cubes_cap_100_10fps
- Artículo SmolVLA (arXiv:2506.01844): https://huggingface.co/papers/2506.01844
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento de políticas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
