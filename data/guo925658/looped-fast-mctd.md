# guo925658/looped-fast-mctd

## Resumen

`guo925658/looped-fast-mctd` es un archivo público de modelos de aprendizaje por refuerzo publicado por el usuario guo925658 en Hugging Face. No es un modelo de lenguaje: no genera texto ni procesa instrucciones. Contiene 26 modelos entrenados distintos repartidos en 44 checkpoints de estado completo (pesos, optimizador, scaler, sampler, estado RNG, configuración y contadores), agrupados en cuatro familias: baselines Fast-MCTD, Loop Flow v1 histórico, Elastic Loop v2 y pilotos de desarrollo Elastic v3.

El proyecto se enmarca en planificación con difusión sobre tareas de OGBench: navegación en laberintos con hormiga y con punto (antmaze-giant/large, pointmaze-giant/large/medium) y manipulación con cubos (cube-double-play, cube-triple-play). La evaluación principal se realiza en el paso 200000 (5000 en los pilotos de desarrollo v3) y se conserva el paso 200005 con fines de archivo y reanudación.

Su interés es fundamentalmente de reproducibilidad: el autor publica junto a los pesos el código fuente empaquetado, manifiestos de hashes SHA256 y guías de carga, y advierte de forma explícita de que las variantes históricas de Loop Flow no deben interpretarse como prueba de la eficacia de un método nuevo. El repositorio tiene 0 descargas y 0 «likes», la licencia no está declarada y el propio autor indica que la validación realizada cubre la carga de modelos, no una evaluación completa de extremo a extremo en otra máquina.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible. La nomenclatura del proyecto (Fast-MCTD, Loop Flow, Elastic Loop, refiner) apunta a un planificador con difusión y refinamiento iterativo, pero la model card no describe la arquitectura |
| Parámetros totales | No disponible |
| Parámetros activos | No aplica (no se describe una arquitectura de mezcla de expertos) |
| Longitud de contexto | No aplica / no disponible (no es un modelo de lenguaje; el horizonte de planificación depende de la tarea de OGBench) |
| Tipos de cuantización | No disponible. Se distribuyen checkpoints en precisión completa con estado de entrenamiento; no hay variantes cuantizadas |
| Idiomas soportados | en, zh (etiquetas y documentación). El modelo no procesa ni genera lenguaje natural |
| Licencia | No disponible |
| Formato de pesos | Checkpoints PyTorch personalizados dentro de archivos ZIP, con estado completo de entrenamiento; requieren `torch.load(..., map_location="cpu", weights_only=False)`. No se usa safetensors ni GGUF |
| Pipeline declarado | reinforcement-learning |
| Tamaño del repositorio | 1,3 GB (44 checkpoints, descarga individual por ZIP) |
| Entorno de referencia | Python 3.10 y Torch 2.5.1, con rueda de OGBench incluida en el bundle |
| Fecha de publicación | 2026-09-15 (creación y última actualización el mismo día) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna de las redes. Lo que sí se documenta es la organización de los entrenamientos. La familia 01 (Fast-MCTD baselines) contiene 7 modelos con entrenamiento completo; la familia 02 (Historical Loop Flow v1) contiene 6 modelos, descritos por el autor como variantes históricas, negativas o no evaluadas; la familia 03 (Elastic Loop v2) contiene 5 modelos con entrenamiento completo del «refiner» sobre baselines congelados; y la familia 04 (Elastic v3 development pilots) contiene 8 modelos que solo completaron un presupuesto piloto de 5000 pasos con warm-start, no un entrenamiento desde cero.

Los checkpoints conservan el estado íntegro de entrenamiento (modelo, optimizador, scaler, sampler, RNG, configuración y contadores), lo que permite reanudar o inspeccionar el proceso, y se mantienen byte a byte idénticos a los originales. Las configuraciones originales conservan rutas absolutas históricas por motivos de procedencia; el cargador incluido remapea las dependencias en memoria sin reescribir los bytes del checkpoint. Los modelos Elastic requieren descargar además sus archivos de dependencia (el baseline correspondiente y, para v3, el modelo de warm-start v2). No se especifican en la información disponible el número de tokens o de pasos de entorno, la composición del dataset de entrenamiento ni si se emplearon técnicas tipo RLHF o DPO (conceptos, por otra parte, propios del ajuste de modelos de lenguaje).

## Capacidades

- Planificación y control en entornos de OGBench: navegación en antmaze (giant, large) y pointmaze (giant, large, medium), y manipulación en cube-double-play y cube-triple-play.
- Planificación basada en difusión, según las etiquetas del repositorio y la organización de los entrenamientos en torno a un componente de refinamiento.
- Refinamiento iterativo sobre un baseline congelado en la familia Elastic Loop v2 (entrenamiento completo del refiner).
- Warm-start de pilotos de refinamiento en la familia Elastic v3 (5000 pasos).
- Reanudación de entrenamiento desde checkpoints con estado completo (optimizador, scaler, sampler y RNG incluidos).
- Carga estricta en CPU verificada para los 44 checkpoints con el código incluido; soporte de ejecución en GPU mediante `device="cuda"`.
- No soporta generación de texto, razonamiento en lenguaje natural, código, matemáticas, visión, tool calling ni function calling.
- No soporta agentes conversacionales ni razonamiento multi-paso en el sentido de los modelos de lenguaje; su «multi-paso» es la planificación secuencial dentro del MDP.
- Capacidades multilingües: no aplica. Las etiquetas en/zh describen la documentación.

## Casos de uso

- Reproducción de experimentos de planificación basada en difusión: el bundle incluye código fuente, manifiesto de hashes y guía de inicio rápido, de modo que un grupo de investigación puede cargar los checkpoints del paso 200000 y contrastar resultados con el protocolo descrito en `docs/full11_protocol.md`.
- Estudio de refinadores sobre políticas congeladas: la familia Elastic Loop v2 permite analizar si un refiner entrenado sobre un baseline fijo mejora el comportamiento sin reentrenar el modelo base.
- Comparación de variantes de planificación: las cuatro familias (baseline, Loop Flow v1, Elastic v2, Elastic v3) permiten estudiar el efecto de distintas variantes, teniendo en cuenta la advertencia del autor sobre las variantes históricas.
- Investigación en navegación de largo horizonte: las tareas antmaze-giant y pointmaze-giant son entornos de laberinto extenso, adecuados para medir degradación de la planificación con horizontes largos.
- Manipulación robótica de precisión: cube-double-play y cube-triple-play sirven como banco de pruebas para estrategias de planificación en tareas de apilado con múltiples objetos.
- Reanudación y auditoría de entrenamientos: al conservarse el estado completo, los checkpoints permiten retomar una ejecución o inspeccionar el estado del optimizador y del sampler para depurar curvas de aprendizaje.
- Punto de partida para reimplementaciones: el código empaquetado y el manifiesto de procedencia sirven como base para reimplementar Fast-MCTD en otro framework, aunque el propio autor advierte de que mover el archivo no hace portátil la CLI de evaluación nativa.
- Docencia y divulgación técnica: el conjunto, con 26 modelos y cuatro familias claramente separadas, es útil para ilustrar un flujo de trabajo experimental con controles negativos explícitos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numéricos en la información disponible. La model card remite a `docs/EXPERIMENT_SUMMARY_ZH.md` para las métricas históricas y a `docs/full11_protocol.md` para el protocolo de evaluación, pero no reproduce cifras. Tampoco se aportan datos de éxito por tarea ni comparaciones cuantitativas con otros planificadores.

| Benchmark | Resultado |
|---|---|
| antmaze-giant-navigate-v0 | No disponible |
| antmaze-large-navigate-v0 | No disponible |
| cube-double-play-v0 | No disponible |
| cube-triple-play-v0 | No disponible |
| pointmaze-giant-navigate-v0 | No disponible |
| pointmaze-large-navigate-v0 | No disponible |
| pointmaze-medium-navigate-v0 | No disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio completo ocupa 1,3 GB e incluye estado de entrenamiento, pero no se publica el tamaño de cada modelo ni las necesidades en GPU.
- GPU recomendadas: no disponible. El cargador acepta `device="cuda"` en una GPU compatible, sin especificar modelos concretos.
- Carga en CPU: validada estrictamente para los 44 checkpoints con el código incluido, en Python 3.10 y Torch 2.5.1.
- Encaje en GPU de consumo: no disponible.
- Opciones de despliegue: no se contemplan servidores de inferencia tipo vLLM, TGI, llama.cpp u Ollama. La carga se realiza con el helper incluido (`python -m scripts.load_published_model`) o con `from scripts.load_published_model import load_model`, que devuelve `(model, config)`. Los distintos backends nativos deben cargarse en procesos de Python separados.
- Dependencias adicionales para evaluar: datasets oficiales de OGBench y, para Ant y Cube, los controladores DQL publicados por terceros.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos suficientes para una comparativa cuantitativa. La model card menciona dos piezas de referencia externas que no forman parte de este archivo, pero no aporta parámetros, contexto ni métricas de ninguna de ellas.

| Modelo | Categoría | Parámetros | Licencia | Disponibilidad |
|---|---|---|---|---|
| looped-fast-mctd (este archivo) | Planificación con difusión sobre OGBench | No disponible | No disponible | Pública en Hugging Face, 0 descargas |
| Fast-MCTD baseline | Planificador de referencia del propio proyecto | No disponible | No disponible | Incluido en la familia 01 del mismo archivo |
| Controladores DQL | Controladores para tareas Ant y Cube | No disponible | No disponible | Publicados por terceros; no forman parte de este archivo |
| Datasets y baselines de OGBench | Entornos y datos de evaluación | No aplica | No disponible | Requeridos para la evaluación completa |

## Limitaciones y advertencias

- Licencia no declarada: no hay autorización explícita de uso comercial ni condiciones de redistribución. Cualquier uso en producción debe aclararse antes con el autor.
- Carga insegura por diseño: los checkpoints requieren `torch.load(..., weights_only=False)` porque incluyen estado completo de entrenamiento. Esto implica riesgo de ejecución de código arbitrario; solo deben cargarse archivos de confianza.
- Validación limitada: el propio autor indica que el archivo valida la carga de modelos y no una evaluación completa de extremo a extremo en otra máquina.
- Variantes históricas no concluyentes: la familia Loop Flow v1 se describe como histórica, negativa o no evaluada, y no debe interpretarse como prueba de eficacia de un método nuevo.
- Pilotos v3 incompletos: los 8 modelos de Elastic v3 solo completaron 5000 pasos de warm-start, no un entrenamiento completo hasta 200000 pasos.
- Portabilidad limitada de la CLI de evaluación nativa: las comprobaciones de configuración original fallan si solo se mueve el archivo; hay que usar el cargador proporcionado y adaptar las rutas de evaluación de forma deliberada.
- Dependencias externas obligatorias: sin los datasets de OGBench y, para Ant y Cube, los controladores DQL, no es posible reproducir la evaluación completa.
- Sin tracción ni revisión comunitaria: 0 descargas y 0 «likes» en el momento de la consulta; no hay evidencia independiente de funcionamiento en terceros.
- Sin documentación en castellano: las guías y resúmenes están en inglés y chino.
- Sin datos de sesgo, robustez o generalización fuera de las tareas de OGBench cubiertas: no disponible.
- Riesgo de alucinación: no aplica en el sentido de los modelos de lenguaje, pero sí existe el riesgo equivalente de que el planificador produzca trayectorias inviables fuera de la distribución de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/guo925658/looped-fast-mctd
- Descarga del repositorio completo: `hf download guo925658/looped-fast-mctd --local-dir ./looped-fast-mctd-models`
- Documentación incluida en el bundle: `docs/quickstart.md`, `docs/hard_tasks.md`, `docs/full11_protocol.md`, `docs/EXPERIMENT_SUMMARY_ZH.md`
- Ficheros de procedencia incluidos: `manifest.json`, `source-manifest.json`, `VALIDATION.json`, `SHA256SUMS`, `source-and-guides.zip`
- Ejemplos de descarga individual por familia y tarea: patrón `01_fast_mctd_baselines__<run>__baseline.zip` en la sección «Model downloads» de la model card
- No se han encontrado en la búsqueda web enlaces externos relevantes a este modelo (los resultados devueltos corresponden a material de Pilates y no guardan relación con el contenido).
