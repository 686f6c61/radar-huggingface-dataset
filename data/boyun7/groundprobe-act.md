# Boyun7/GroundProbe-ACT

## Resumen

GroundProbe-ACT es un conjunto de dos políticas de imitación basadas en ACT (Action Chunking with Transformers) publicadas por el usuario Boyun7 para una tarea concreta de manipulación: recoger el bloque rojo de la izquierda y depositarlo en la papelera (instrucción T1). Ambas se entrenaron sobre una única celda del dataset GroundProbe (`quest_l2_cubes_pilot`, complejidad `clean`) con un Franka Panda simulado en NVIDIA Isaac Lab-Arena.

El objetivo declarado por el autor no es competir en capacidad general, sino servir de referencia reproducible: demostrar que las demostraciones del benchmark y el circuito de evaluación en bucle cerrado permiten aprender la habilidad, y ofrecer un punto de partida a quien incorpore una política nueva. La model card insiste en que ACT no recibe entrada de lenguaje, por lo que estos checkpoints no son una línea base de *grounding*.

La arquitectura sigue el diseño canónico de ACT: backbone ResNet-18 sobre dos cámaras de 240×240, 4 capas de encoder y 7 de decoder, tamaño oculto 512, feed-forward 3200 y 8 cabezas, con un VAE condicional y un chunk de 50 acciones. Se publican dos variantes según la codificación de acción: delta pose en 7 dimensiones sobre la pose del TCP y objetivos articulares absolutos en 8 dimensiones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): transformer encoder-decoder con VAE condicional y backbone ResNet-18 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; se consulta la política con la observación actual y devuelve un chunk de 50 acciones |
| Tipos de cuantizacion | no disponible (solo se publican checkpoints en el formato de entrenamiento, sin variantes cuantizadas) |
| Idiomas soportados | no aplica (la política no procesa entrada de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | checkpoint PyTorch (`.ckpt`) acompañado de `config.json` y `dataset_stats.pkl` |
| Backbone visual | ResNet-18 |
| Entradas de vision | `third_camera` y `wrist_camera`, ambas a 240×240 |
| Espacio de accion | delta pose 7-D sobre el TCP (`delta_pose/`) y articulaciones absolutas 8-D (`joint/`) |
| Tamano de chunk | 50 acciones |
| Dataset de entrenamiento | `Boyun7/GroundProbe-dataset`, celda `quest_l2_cubes_pilot` |
| Entorno de evaluacion | Franka Panda simulado en NVIDIA Isaac Lab-Arena |
| Tamano del repositorio | 0,7 GB (los dos checkpoints juntos) |

## Arquitectura y entrenamiento

ACT es una política de imitación con arquitectura transformer encoder-decoder que incorpora un VAE condicional para modelar la multimodalidad de las demostraciones humanas y que predice bloques de acciones (chunks) en lugar de acciones individuales, lo que reduce el error de composición acumulado en horizontes largos. En esta implementación el encoder visual es una ResNet-18 que procesa dos vistas (cámara de terceros y cámara de muñeca) a 240×240; el transformer tiene 4 capas de encoder y 7 de decoder, tamaño oculto 512, dimensión feed-forward 3200, 8 cabezas de atención y dropout 0,1. La decodificación latente se regulariza con un peso KL de 10.

El entrenamiento usó AdamW con tasa de aprendizaje 1e-5 (también 1e-5 para el backbone) y weight decay 1e-4, con tamaño de lote 8, sobre 45 episodios de entrenamiento y 5 de validación. La validación se ejecutaba cada 10 épocas y el entrenamiento se detenía tras 300 épocas sin mejora. Las dos variantes alcanzaron su mejor época en 510 (`delta_pose`) y 230 (`joint`). El autor no documenta el número total de tokens ni pasos de gradiente, ni si hubo fases de RLHF o DPO (no aplica a una política de imitación de este tipo).

## Capacidades

- Manipulación robótica de tipo *pick-and-place*: recoger el bloque rojo de la izquierda y colocarlo en la papelera en el escenario simulado de la celda `quest_l2_cubes_pilot`.
- Control continuo en bucle cerrado: la política se reconsulta tras ejecutar 25 de cada 50 acciones del chunk, lo que permite corrección durante la tarea.
- Percepción visual desde dos cámaras simultáneas (tercera persona y muñeca) a resolución 240×240.
- Soporte de dos espacios de acción alternativos: delta pose de 7-D sobre el TCP y objetivos articulares absolutos de 8-D (7 articulaciones más apertura total de la pinza).
- Ejecución sobre el embodiment Franka Panda dentro de NVIDIA Isaac Lab-Arena, con la tasa de control definida en `config.json`.
- Integración con el arnés de evaluación del repositorio mediante `ACTAdapter` en `script/policy_adapters.py`, que lee `config.json` y `dataset_stats.pkl`.

No dispone de tool calling, function calling, razonamiento multi-paso simbólico, modo *thinking*, capacidades de audio, ni ningún tipo de procesamiento de lenguaje natural: la model card es explícita al señalar que ACT no tiene entrada de lenguaje.

## Casos de uso

- Línea base de referencia en el benchmark GroundProbe: sirve para verificar que una celda concreta (demostraciones, escenas y arnés de evaluación) es aprendible antes de invertir esfuerzo en una política nueva, tal y como declara el autor.
- Puesta en marcha de una política nueva: al comparar contra el 85% (delta pose) y el 80% (joint) en los 20 layouts de entrenamiento, un desarrollador puede detectar rápidamente errores en su propio pipeline de datos, normalización o adaptador de política.
- Validación de un pipeline de evaluación en bucle cerrado: el criterio de éxito (objetivo dentro de la papelera durante 30 pasos de control consecutivos, con un máximo de 1000 pasos) y el horizonte de ejecución de 25 acciones permiten probar de extremo a extremo el arnés `script/eval_policy` sin entrenar nada.
- Estudio de codificaciones de acción: los dos checkpoints aislados (delta pose frente a articulaciones absolutas) permiten comparar el efecto de la representación de la acción sobre el éxito en la misma tarea y el mismo conjunto de layouts.
- Análisis de generalización fuera de distribución: el modelo es útil como caso de estudio de sobreajuste con pocos datos, ya que pasa del 80% en los layouts de entrenamiento al 40% en los 5 layouts de validación y al 25% en 20 layouts fuera del rango de semillas de recolección.
- Punto de partida para *fine-tuning*: con licencia Apache 2.0 y pesos PyTorch, se puede reentrenar sobre demostraciones adicionales de la misma celda o de celdas vecinas para medir cuántos episodios extra hacen falta para recuperar el rendimiento fuera de distribución.
- Docencia y reproducción de resultados en robótica con aprendizaje por imitación: el par checkpoint + estadísticas de normalización + semillas de layout permite reproducir la evaluación de forma determinista en Isaac Lab.
- Integración en un lazo de control simulado para pruebas de estrés: variando la escena (`--scene cubes`), el número de episodios (`--eval-episodes`) o el horizonte de ejecución (`--exec-horizon`) se puede medir la robustez de la política ante cambios de configuración.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de lenguaje (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ni son aplicables a este tipo de modelo. El autor sí publica evaluaciones en bucle cerrado bajo el criterio de éxito del benchmark (objetivo dentro de la papelera durante 30 pasos de control consecutivos, máximo de 1000 pasos, ejecutando las primeras 25 acciones de cada chunk de 50 antes de reconsultar):

| Politica | Layouts de evaluacion | Exito | Wilson 95% |
|---|---|---:|---|
| delta pose | los 20 layouts de las demostraciones de entrenamiento | 17/20 (85%) | [64%, 95%] |
| joint | los 20 layouts de las demostraciones de entrenamiento | 16/20 (80%) | [58%, 92%] |
| joint | los 5 layouts de validacion reservados | 2/5 (40%) | [12%, 77%] |
| joint | 20 layouts fuera del rango de semillas de recoleccion | 5/20 (25%) | [11%, 47%] |

El propio autor señala que, con solo 50 demostraciones de una única celda, la caída de rendimiento en layouts no vistos es esperable.

## Requisitos de hardware

- VRAM para la política: no disponible de forma oficial. Como estimación orientativa, el repositorio completo ocupa 0,7 GB para dos checkpoints, lo que sitúa el orden de magnitud en decenas de millones de parámetros y un peso por checkpoint de unos cientos de megabytes en precisión de entrenamiento; la inferencia de la red en sí cabe holgadamente en cualquier GPU con más de 2 GB de VRAM.
- La carga real de hardware proviene del simulador: NVIDIA Isaac Lab-Arena requiere una GPU con soporte de trazado de rayos para el renderizado de las dos cámaras a 240×240, por lo que se recomienda una RTX de generación 20 o superior con al menos 8 GB de VRAM (por ejemplo RTX 3060 12 GB, RTX 4070, RTX 4090). Para lotes de evaluación grandes o escenas más complejas, A100 o H100 con 40-80 GB resultan más cómodas.
- GPU de consumo: sí, cabe en GPU de consumo (RTX 3060 12 GB o superior) siempre que el simulador pueda ejecutarse con `--headless`, tal y como muestra el ejemplo de invocación del autor.
- Opciones de despliegue: no aplica vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje. El despliegue se realiza con PyTorch e Isaac Lab a través de `script.eval_policy`, cargando el checkpoint con `ACTAdapter`:
  `python -m script.eval_policy --policy ACT --scene cubes --ckpt act_ckpt/joint/policy_best.ckpt --eval-episodes 20 --exec-horizon 25 --headless --out eval_out/act_joint --environment l2_spatial_tasks.examples.manipulation.l2_spatial_env:L2SpatialEnv --enable_cameras l2_spatial_env --embodiment franka --enable_cameras True`
- Latencia y throughput: no disponible. El único dato operativo publicado es el horizonte de ejecución (25 acciones por consulta a la política) y la tasa de control, que se lee desde `config.json` pero no se explicita en la model card.

## Comparativa con modelos similares

No se dispone de datos verificables de parámetros, contexto ni rendimiento de los modelos alternativos en la información proporcionada; la model card no incluye comparaciones con terceros. La comparación posible es de categoría:

| Modelo | Categoria | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| GroundProbe-ACT (`delta_pose`) | ACT, manipulacion pick-and-place simulada | no disponible | no aplica (chunk de 50 acciones) | 85% en layouts de entrenamiento | Apache 2.0 | HuggingFace, 0 descargas, 0 likes |
| GroundProbe-ACT (`joint`) | ACT, manipulacion pick-and-place simulada | no disponible | no aplica (chunk de 50 acciones) | 80% en entrenamiento, 40% en validacion, 25% fuera de distribucion | Apache 2.0 | HuggingFace, 0 descargas, 0 likes |
| ACT original (Zhao et al., 2023) | misma familia de arquitectura | no disponible | no aplica | no disponible en esta fuente | no disponible en esta fuente | repositorio publico, no detallado aqui |
| Politicas de difusion para manipulacion (Diffusion Policy) | familia alternativa de imitacion | no disponible | no disponible | no disponible en esta fuente | no disponible en esta fuente | no disponible en esta fuente |
| Modelos VLA con entrada de lenguaje (tipo OpenVLA) | vision-lenguaje-accion | no disponible | no disponible | no disponible en esta fuente | no disponible en esta fuente | no disponible en esta fuente |

Nota: los modelos VLA con lenguaje no son comparables en la misma tarea de *grounding*, precisamente porque GroundProbe-ACT carece de entrada lingüística, tal y como advierte el autor.

## Limitaciones y advertencias

- No acepta instrucciones en lenguaje natural. La model card lo remarca: ACT no tiene entrada de lenguaje, por lo que estos checkpoints no deben usarse como línea base de *grounding* ni para evaluar seguimiento de instrucciones.
- Sobreajuste claro a la distribución de entrenamiento: con 50 demostraciones de una única celda, el éxito cae del 80% en los layouts de entrenamiento al 40% en los 5 layouts de validación y al 25% en 20 layouts fuera del rango de semillas de recolección. Los intervalos de Wilson son anchos, con límites inferiores de 12% y 11% respectivamente.
- Especialización extrema: una sola tarea (instrucción T1), una sola celda (`quest_l2_cubes_pilot`), una sola complejidad (`clean`) y un único embodiment (Franka Panda).
- Validación exclusivamente en simulación (NVIDIA Isaac Lab-Arena). No hay evidencia de transferencia a un robot real (*sim-to-real*) en la información disponible.
- Dependencia fuerte de la configuración de percepción: dos cámaras concretas (`third_camera`, `wrist_camera`) a 240×240. Cualquier cambio de montaje, resolución o calibración respecto a la recogida de datos puede degradar el rendimiento y no se documenta su robustez frente a ello.
- La normalización es inseparable del checkpoint: `dataset_stats.pkl` forma parte del artefacto. Cargar los pesos sin esas estadísticas produce resultados inválidos.
- La ruta del dataset en `config.json` es relativa a la raíz del repositorio (`dataset/quest_l2_cubes_pilot`); es necesario descargar el dataset en esa ubicación antes de evaluar.
- Riesgo de alucinación: no aplica en el sentido de los modelos de lenguaje, pero sí existe el equivalente en políticas de imitación, que es la ejecución de trayectorias plausibles pero incorrectas cuando la observación cae fuera de la distribución de demostraciones. Los resultados del 25% en layouts alejados son evidencia directa de ese fallo.
- Sesgos conocidos del dataset: 50 demostraciones de una única celda implican un sesgo hacia las posiciones, colores y disposiciones presentes en los layouts de recogida; no se documenta ninguna evaluación de equidad ni de diversidad de escenas.
- Licencia Apache 2.0 para pesos, código y dataset, lo que permite uso comercial. Sin embargo, la evaluación depende de NVIDIA Isaac Lab e Isaac Sim, cuyas licencias son independientes y no se rigen por Apache 2.0.
- Adopción nula verificable: 0 descargas y 0 likes en el momento de la consulta, sin validación independiente por parte de la comunidad.
- El repositorio se creó y actualizó en septiembre de 2026 según los metadatos de HuggingFace; conviene comprobar si existe una versión posterior antes de fijar el artefacto en un pipeline.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Boyun7/GroundProbe-ACT
- Dataset de demostraciones GroundProbe: https://huggingface.co/datasets/Boyun7/GroundProbe-dataset
- Codigo, escenas y arnes de evaluacion: https://github.com/AndersonYu7/Benchmark
- Referencia citada en la model card para el adaptador de politica: `script/policy_adapters.py` (`ACTAdapter`) dentro del repositorio anterior
- La busqueda web realizada no devolvio ningun enlace relevante para este modelo: los resultados obtenidos correspondian a sitios no relacionados (Zhihu y Google Maps). No se dispone de paper, blog ni demo adicionales en la informacion proporcionada.
