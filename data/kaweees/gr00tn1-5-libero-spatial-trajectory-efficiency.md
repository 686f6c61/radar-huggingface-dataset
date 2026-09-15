# kaweees/gr00tn1.5-libero-spatial-trajectory-efficiency

## Resumen

kaweees/gr00tn1.5-libero-spatial-trajectory-efficiency es un repositorio de experimentos de ajuste fino sobre el modelo fundacional de robótica nvidia/GR00T-N1.5-3B. No es un modelo nuevo, sino una colección de checkpoints que estudia cómo varía el rendimiento de una política de visión-lenguaje-acción (VLA) en función del número de trayectorias de demostración disponibles en el escenario LIBERO Spatial. El autor entrena cinco variantes con presupuestos de 5, 10, 15, 25 y 50 trayectorias totales, semilla 42, subconjuntos anidados idénticos y bases oficiales de NVIDIA fijadas por revisión.

El resultado central es una curva de eficiencia de datos: con 5 trayectorias la mejor política no logra ningún éxito en 20 intentos de la tarea 0 de LIBERO Spatial; con 10 alcanza 1/20; con 25 sube a 14/20 y con 50 llega a 18/20. Esto apunta a un umbral por debajo del cual la política no adquiere la habilidad y a una mejora pronunciada a partir de unas 25 demostraciones.

El repositorio ocupa 34,8 GB, distribuye los pesos en safetensors y no declara licencia, idiomas, pipeline ni resultados de benchmarks estándar. Su interés es metodológico: protocolo de parada reproducible, evaluación por época y verificación de carga offline de cada checkpoint.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política de visión-lenguaje-acción (VLA) derivada del modelo base nvidia/GR00T-N1.5-3B; el repositorio no detalla la arquitectura interna |
| Parámetros totales | Aproximadamente 3 000 millones, según la denominación del modelo base (GR00T-N1.5-3B); no confirmado en la información del repositorio |
| Parámetros activos | No aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo base | nvidia/GR00T-N1.5-3B |
| Tamaño del repositorio | 34,8 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El repositorio contiene cinco ejecuciones de ajuste fino independientes sobre nvidia/GR00T-N1.5-3B, cada una con un presupuesto de trayectorias distinto (5, 10, 15, 25 y 50). Todos los presupuestos usan semilla 42 y subconjuntos anidados idénticos entre versiones, de modo que el conjunto de 5 trayectorias está contenido en el de 10, y así sucesivamente. Cada época se evalúa con 20 rollouts de la tarea 0 de LIBERO Spatial, y el criterio de parada es detener la ejecución cuando dos épocas consecutivas no mejoran estrictamente el mejor número de éxitos (los empates cuentan como no mejora). No hay tope fijo de épocas. Las ejecuciones completadas se conservan y se omiten en relanzamientos.

Los checkpoints se organizan en carpetas `n1.5/trajectories-NNN/epoch-EEE/` e incluyen pesos, configuraciones, procesadores, estadísticas de normalización de Spatial, mapeos de embodiment, código de ejecución, manifiestos de entrenamiento, evaluaciones y una verificación independiente de carga offline. El estado del optimizador se excluye explícitamente, y las copias locales se eliminan tras la verificación. Los artefactos previos al experimento y su historial se eliminaron a petición del propietario; el archivo `history_cleanup.json` mapea los checkpoints verificados a la revisión retenida con hashes idénticos.

## Capacidades

- Generación de acciones motoras para manipulación robótica: es una política VLA, no un modelo de lenguaje conversacional.
- Ejecución de tareas de manipulación en el entorno de simulación LIBERO Spatial, condicionada por la observación y por el objetivo de la tarea.
- Aprendizaje por imitación a partir de trayectorias de demostración, con sensibilidad medible al número de demostraciones.
- Evaluación reproducible de eficiencia de datos: subconjuntos anidados y semilla fija permiten atribuir las diferencias al presupuesto de trayectorias.
- Trazabilidad de artefactos: manifiestos de entrenamiento, evaluaciones y verificación de carga offline por checkpoint.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Modo de razonamiento explícito (thinking), visión o audio como capacidades declaradas: no disponibles en la información del repositorio.

## Casos de uso

- Estudio de eficiencia de datos en políticas VLA: el repositorio ofrece una curva completa de éxito frente al número de demostraciones, útil para estimar cuántas trayectorias necesita un equipo antes de invertir en teleoperación.
- Calibración del presupuesto de demostraciones en un proyecto nuevo: los datos indican que por debajo de 25 trayectorias el rendimiento en la tarea evaluada es prácticamente nulo (0/20 y 1/20), lo que sirve para dimensionar la fase de recogida de datos.
- Reproducción de experimentos: semilla fija, subconjuntos anidados y bases de NVIDIA fijadas por revisión permiten repetir las ejecuciones y auditar los resultados.
- Punto de partida para ajustes finos adicionales: los checkpoints de la carpeta `trajectories-050` son el candidato natural para seguir entrenando o para transferir a otras tareas de manipulación.
- Análisis de curvas de aprendizaje y parada temprana: los checkpoints por época (3, 5, 6 y 8 épocas verificadas) permiten estudiar el criterio de parada basado en dos épocas sin mejora estricta.
- Docencia e investigación en robótica: el repositorio ilustra un protocolo completo de experimentación con verificación offline, reutilizable como plantilla metodológica.
- Selección de checkpoint para despliegue en simulación: las evaluaciones por época permiten elegir la política con mejor tasa de éxito antes de exportar a un entorno de ejecución.
- Validación de infraestructura de carga: los artefactos incluyen verificación independiente de carga offline, útiles para comprobar pipelines de despliegue de políticas VLA.

## Benchmarks y rendimiento

La model card publica un único experimento de eficiencia de datos sobre la tarea 0 de LIBERO Spatial. Cada época se evalúa con 20 rollouts; la columna final recoge el mejor número de éxitos sobre 20 obtenido en la ejecución.

| Trayectorias | Estado | Épocas verificadas | Mejor resultado (éxitos / 20) |
|---:|---|---:|---:|
| 5 | Completada | 3 | 0 |
| 10 | Completada | 5 | 1 |
| 15 | En cola | 0 | — |
| 25 | Completada | 6 | 14 |
| 50 | Completada | 8 | 18 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, y no resultan directamente aplicables a una política de control robótico.

## Requisitos de hardware

- VRAM estimada para los pesos: alrededor de 6 GB en bf16/fp16 para un modelo de 3 000 millones de parámetros; es una estimación orientativa, no confirmada por el autor.
- VRAM estimada para inferencia VLA completa: no disponible. Además de los pesos hay que acomodar el codificador visual y el módulo de generación de acciones, por lo que en la práctica se recomienda una GPU con 16 GB o más.
- GPU recomendadas: no disponibles en la información del repositorio. Por tamaño, una RTX 4090 o RTX 3090 (24 GB) serían candidatas razonables para inferencia en bf16, pero no hay confirmación del autor ni pruebas publicadas.
- GPU de datacenter: no disponible. Para reentrenamiento con presupuestos grandes probablemente se requiera A100 o H100, sin datos publicados de consumo.
- Almacenamiento: el repositorio completo ocupa 34,8 GB, más el espacio adicional de las copias locales durante la verificación.
- Opciones de despliegue: no disponible. El repositorio incluye su propio código de ejecución; vLLM, llama.cpp, Ollama y TGI no aplican a una política de control robótico.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos verificados de los modelos alternativos en la información proporcionada; los campos no confirmados se marcan como no disponibles.

| Modelo | Parámetros | Contexto | Ámbito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este repositorio (kaweees) | ~3 000 M (heredados del base) | no disponible | Manipulación en LIBERO Spatial (ajuste fino) | no disponible | HuggingFace, 0 descargas |
| nvidia/GR00T-N1.5-3B | ~3 000 M | no disponible | Política VLA generalista de robótica | no disponible | HuggingFace (modelo base) |
| OpenVLA-7B | ~7 000 M | no disponible | Política VLA generalista de robótica | no disponible | HuggingFace |
| pi0 (Physical Intelligence) | no disponible | no disponible | Política VLA generalista de robótica | no disponible | no disponible |

La diferencia relevante frente al modelo base no es de arquitectura sino de especialización: este repositorio está ajustado para la tarea 0 de LIBERO Spatial y solo publica resultados en ese escenario.

## Limitaciones y advertencias

- Licencia no declarada: no puede confirmarse que el uso comercial esté permitido, ni las condiciones heredadas del modelo base.
- Evaluación muy acotada: los resultados se limitan a la tarea 0 de LIBERO Spatial, con 20 rollouts por época; no hay tasa de éxito agregada de las diez tareas del benchmark.
- Muestra de evaluación pequeña: con 20 rollouts, diferencias de uno o dos éxitos no son estadísticamente significativas, y el criterio de parada depende de esa misma medida ruidosa.
- Rendimiento inservible con pocos datos: 0/20 con 5 trayectorias y 1/20 con 10 desaconsejan cualquier uso en producción con presupuestos bajos de demostración.
- Ejecución incompleta: el presupuesto de 15 trayectorias quedó en cola con 0 épocas verificadas, por lo que la curva tiene un hueco entre 10 y 25.
- Estado del optimizador excluido: los checkpoints no permiten reanudar el entrenamiento tal cual, solo inferencia o reinicio del ajuste fino.
- Historial reescrito: los artefactos previos al experimento se eliminaron a petición del propietario; la trazabilidad depende del archivo `history_cleanup.json`.
- Sin validación por terceros: 0 descargas y 0 likes; no hay informes independientes de reproducibilidad.
- Sin datos de sesgo, robustez ni transferencia sim-to-real: no se ha evaluado el comportamiento en robot físico ni fuera del entorno de simulación.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero sí existe riesgo de ejecutar acciones incorrectas o inseguras en un robot real si se despliega sin validación previa.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/kaweees/gr00tn1.5-libero-spatial-trajectory-efficiency
- Checkpoint de 5 trayectorias: https://huggingface.co/kaweees/gr00tn1.5-libero-spatial-trajectory-efficiency/tree/main/n1.5/trajectories-005
- Checkpoint de 10 trayectorias: https://huggingface.co/kaweees/gr00tn1.5-libero-spatial-trajectory-efficiency/tree/main/n1.5/trajectories-010
- Checkpoint de 15 trayectorias: https://huggingface.co/kaweees/gr00tn1.5-libero-spatial-trajectory-efficiency/tree/main/n1.5/trajectories-015
- Checkpoint de 25 trayectorias: https://huggingface.co/kaweees/gr00tn1.5-libero-spatial-trajectory-efficiency/tree/main/n1.5/trajectories-025
- Checkpoint de 50 trayectorias: https://huggingface.co/kaweees/gr00tn1.5-libero-spatial-trajectory-efficiency/tree/main/n1.5/trajectories-050
- Mapa de limpieza de historial: https://huggingface.co/kaweees/gr00tn1.5-libero-spatial-trajectory-efficiency/blob/main/history_cleanup.json
- Modelo base: https://huggingface.co/nvidia/GR00T-N1.5-3B
- La búsqueda web realizada no devolvió enlaces relevantes sobre este modelo; los resultados obtenidos correspondían a anuncios de vehículos sin relación con el contenido de la ficha.
