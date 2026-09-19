# SeonghoonYu/RACE2_vlabench

## Resumen

RACE2\_vlabench es un repositorio de artefactos de investigación publicado por el usuario SeonghoonYu en HuggingFace. No contiene un modelo nuevo entrenado desde cero, sino el conjunto de checkpoints, datos y utilidades resultantes de los experimentos RACE2 (transition-aware fine-tuning) sobre el modelo base pi0.5, evaluados en las tareas primitivas del benchmark de manipulación robótica VLABench. El repositorio ocupa 263,9 GB e incluye tanto los pesos de cada ejecución como los datos de demostración y las etiquetas de transición de fase generadas.

El elemento diferencial del trabajo es el enfoque "transition-aware": el ajuste fino incorpora información sobre los límites entre fases de una tarea (por ejemplo, aproximarse, agarrar, colocar), etiquetados automáticamente mediante dos procedimientos distintos: CPS (fronteras de fase de referencia, 4,49 transiciones por episodio) y PELT (3,81 transiciones por episodio). Junto a los checkpoints de RACE2 se publican las líneas base PlainFT, una reproducción de ACoT-VLA, el checkpoint teacher oficial de pi0.5 sobre VLABench y una batería de ablaciones a horizonte de acción H20.

Es relevante ahora porque permite reproducir y auditar de forma completa una comparativa de métodos de ajuste fino de modelos visión-lenguaje-acción (VLA) en robotización, incluyendo los datos crudos en formato LeRobot v2.0, los pesos en safetensors, las estadísticas de normalización y las configuraciones de entrenamiento. La licencia declarada es MIT, aunque el repositorio no documenta el número de parámetros, la longitud de contexto ni los idiomas soportados del modelo base.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo visión-lenguaje-acción (VLA) basado en pi0.5; la arquitectura interna del backbone no se detalla en la model card |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que la arquitectura sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se distribuyen los pesos en el formato original; no se listan variantes cuantizadas) |
| Idiomas soportados | no disponible |
| Licencia | MIT (declarada en la model card y en los tags del repositorio) |
| Formato de pesos | safetensors (tag del repositorio); los checkpoints de la reproducción ACoT-VLA se distribuyen en JAX/orbax |
| Pipeline declarado | robotics |
| Tamaño del repositorio | 263,9 GB |
| Horizonte de acción (H) | 10, 15, 20, 25, 30 y 35 pasos, según la carpeta de checkpoint |
| Pasos de entrenamiento | 40.000 por ejecución |
| Formato de los datos | LeRobot v2.0 (esquema equivalente a `SeonghoonYu/vlabench_primitive_ft_lerobot_224`) |
| Volumen de datos publicados | 5.000 demostraciones expertas (500 por tarea, 10 tareas) |
| Descargas / likes | 0 / 0 |
| Fechas del repositorio | Creado el 2026-09-10, actualizado el 2026-09-18 |

## Arquitectura y entrenamiento

El repositorio parte de pi0.5, un modelo visión-lenguaje-acción (VLA) que se emplea como teacher oficial sobre VLABench (`teacher_official/`). Sobre esa base se aplica el método RACE2, descrito como "transition-aware fine-tuning": el ajuste fino condiciona el aprendizaje en los límites de transición entre fases de la tarea, de modo que la política no solo imita trayectorias, sino que también recibe señal sobre cuándo cambia la fase de ejecución. La model card no especifica el número de tokens de entrenamiento ni la composición exacta del dataset más allá de las demostraciones expertas generadas en simulador, ni detalla si se emplearon etapas de RLHF o DPO; en el pipeline robótico esto se sustituye por aprendizaje por imitación sobre demostraciones.

Los datos de entrenamiento consisten en 5.000 demostraciones expertas recién generadas (500 por tarea, formato LeRobot v2.0), acompañadas de dos conjuntos de etiquetas de frontera de fase: `labels/vlabench_phase_cps.npz` (fronteras de referencia, 4,49 por episodio) y `labels/vlabench_phase_pelt.npz` (etiquetas PELT sobre los mismos episodios, 3,81 por episodio). El conjunto original de 5.000 episodios con etiquetas PELT se publica por separado como `SeonghoonYu/vlabench_primitive_ft_lerobot_224`. Cada ejecución se entrena durante 40.000 pasos con un horizonte de acción H concreto, y el repositorio incluye ablaciones a H20 sobre el cabezal de acción (`actionhead`), el jitter, las características de transición (`notf`), el punto de cambio por velocidad (`speedcp`), el uso exclusivo de temporización (`timing_only`) y el cabezal del VLM (`vlmhead`). Para cargar los checkpoints de H25 y H30–H35 se proporcionan superposiciones (overlays) de openpi con configuraciones, recursos de CPS y un punto de entrada de serving.

## Capacidades

- Ejecución de políticas de manipulación robótica sobre las tareas primitivas de VLABench, con horizontes de acción configurables entre 10 y 35 pasos.
- Modelado explícito de transiciones de fase dentro de una tarea, apoyado en etiquetas CPS y PELT por episodio.
- Generación de bloques de acción (action chunks) a partir de observaciones, en el marco de un modelo VLA de tipo pi0.5.
- Punto de partida para ajuste fino propio: el repositorio incluye el teacher oficial, la línea base PlainFT y las ejecuciones RACE2 por horizonte.
- Capacidad de ablación controlada de componentes de entrenamiento (cabezal de acción, jitter, características de transición, temporización, cabezal del VLM).
- Serving reproducible mediante los overlays de openpi (`h25_support/`, `h30_h35_support/`), que incluyen configuraciones, recursos CPS y entrypoint.
- Soporte de tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso en lenguaje: no documentado en la información disponible.
- Capacidades multilingües: no documentadas en la información disponible.
- Capacidades especiales (modo thinking, visión, audio): no documentadas; el pipeline declarado es exclusivamente `robotics`.

## Casos de uso

- Reproducción de experimentos de ajuste fino VLA: descargando selectivamente las carpetas de checkpoint con `snapshot_download` y `allow_patterns`, un laboratorio puede reentrenar o evaluar RACE2 frente a PlainFT bajo las mismas condiciones declaradas (40.000 pasos, mismo H).
- Evaluación de métodos de detección de cambios de fase: el repositorio incluye etiquetas CPS (4,49 por episodio) y PELT (3,81 por episodio) sobre los mismos episodios, lo que permite comparar el efecto de cada criterio de segmentación en la calidad de la política.
- Estudio del horizonte de acción: las carpetas `h{10,15,20,25,30,35}_40k` y `plainft_h{10,15,20,25,30}_40k` permiten medir cómo varía el comportamiento del modelo al predecir bloques de acción más largos o más cortos.
- Análisis de ablaciones: las ejecuciones `abl_*_h20_40k` (actionhead, nojitter, notf, speedcp, timing_only, vlmhead) sirven para aislar la contribución de cada componente del entrenamiento consciente de transiciones.
- Generación y reutilización de datos de demostración: las 5.000 demostraciones expertas en LeRobot v2.0 con horizonte de imagen 224 pueden reutilizarse para entrenar otras políticas de manipulación o para aumentar un dataset propio.
- Punto de partida para políticas propias en simulación: el teacher oficial de pi0.5 sobre VLABench actúa como referencia contra la que medir cualquier ajuste posterior antes de considerar transferencia a un robot real.
- Despliegue de un servidor de inferencia robótica: los overlays de openpi de H25 y H30–H35 incluyen configuraciones y entrypoint de serving, lo que facilita levantar una instancia de evaluación sin reconstruir el pipeline desde cero.
- Docencia y divulgación técnica: el repositorio es un ejemplo completo de extremo a extremo (datos, etiquetas, pesos, configuraciones, ablaciones y procedencia) para explicar cómo se entrena y evalúa una política VLA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card describe los artefactos (checkpoints, datos y etiquetas) y las carpetas de ablación, pero no incluye tablas con tasas de éxito, MMLU, HumanEval, GSM8K ni ninguna otra métrica cuantitativa comparable.

## Requisitos de hardware

- Tamaño total del repositorio: 263,9 GB, repartidos entre múltiples checkpoints (teacher, PlainFT, RACE2, ACoT-VLA y ablaciones) y datos. Se recomienda descarga selectiva con `allow_patterns` en lugar de clonar el repositorio completo.
- VRAM estimada para inferencia: no disponible. Depende del número de parámetros y de la precisión de los pesos de cada checkpoint, dato que la model card no publica.
- GPU recomendadas: no disponible. No se especifica hardware de referencia ni en el entrenamiento ni en la evaluación.
- Encaje en GPU de consumo: no se puede determinar con la información disponible; requiere inspeccionar el tamaño de un único checkpoint y su precisión.
- Opciones de despliegue: overlays de openpi para los checkpoints H25 y H30–H35 (configuraciones, recursos CPS y entrypoint de serving); checkpoints de ACoT-VLA en JAX/orbax con su propio README; datos en formato LeRobot v2.0.
- Latencia y throughput: no disponibles.
- Almacenamiento: prever espacio en disco acorde al subconjunto descargado; las estadísticas de normalización se distribuyen en la carpeta `assets/` de cada ejecución.

## Comparativa con modelos similares

La información disponible no permite comparar con modelos externos, pero sí con los artefactos incluidos en el propio repositorio, que constituyen la comparativa natural del trabajo.

| Modelo o ejecución | Método | Horizonte de acción | Pasos | Formato | Licencia |
|---|---|---|---|---|---|
| RACE2 (`h*_40k`) | Transition-aware fine-tuning de pi0.5 | 10, 15, 20, 25, 30, 35 | 40.000 | safetensors | MIT (repo) |
| PlainFT (`plainft_h*_40k`) | Ajuste fino plano, línea base | 10, 15, 20, 25, 30 | 40.000 | safetensors | MIT (repo) |
| ACoT-VLA (`acot_h*_40k`) | Reproducción del método ACoT-VLA | 10, 20 | 40.000 | JAX/orbax | MIT (repo) |
| Teacher oficial (`teacher_official`) | pi0.5 entrenado en VLABench | no disponible | no disponible | safetensors | MIT (repo) |
| Ablaciones (`abl_*_h20_40k`) | Variantes de RACE2 sin un componente | 20 | 40.000 | safetensors | MIT (repo) |

## Limitaciones y advertencias

- Repositorio con 0 descargas y 0 likes: no hay evidencia externa de validación ni de reproducibilidad independiente.
- La model card no especifica el número de parámetros, la longitud de contexto, los idiomas soportados ni los requisitos de hardware, lo que dificulta planificar el despliegue.
- El ámbito de evaluación se limita a las tareas primitivas de VLABench (10 tareas, 500 demostraciones por tarea); no hay evidencia de generalización fuera de ese conjunto.
- Los datos de entrenamiento proceden de un simulador, por lo que existe una brecha sim-to-real no cuantificada en la información disponible.
- Las etiquetas de transición se generan automáticamente (CPS como referencia y PELT como detección sobre los mismos episodios) y pueden contener errores, especialmente con 3,81 frente a 4,49 transiciones por episodio.
- La licencia MIT se declara sobre el repositorio de artefactos; conviene verificar por separado las condiciones del modelo base pi0.5 y las del benchmark y los datos de VLABench antes de un uso comercial.
- Riesgo de alucinación y sesgos: no evaluado ni documentado en la información disponible.
- No es un modelo de propósito general: no hay soporte documentado de generación de texto, código, matemáticas, tool calling, agentes ni multimodalidad conversacional.
- Uso en robótica real: cualquier despliegue físico exige validación de seguridad independiente, dado que no se documentan protocolos de parada, límites de fuerza ni evaluación de fallos.
- Las fechas de creación y actualización del repositorio (septiembre de 2026) resultan atípicas y conviene confirmarlas en la página de HuggingFace.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/SeonghoonYu/RACE2_vlabench
- Código del proyecto: https://github.com/Seonghoon-Yu/VLABench
- Dataset original de 5.000 episodios con etiquetas PELT: https://huggingface.co/SeonghoonYu/vlabench_primitive_ft_lerobot_224
- README de los datos de fase: `data/vlabench_phase_5000/README.md` (ruta interna del repositorio)
- README de la reproducción ACoT-VLA: carpeta `acot_h{10,20}_40k/` (ruta interna del repositorio)
- Búsqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos por la búsqueda no guardan relación con RACE2, VLABench ni pi0.5.
