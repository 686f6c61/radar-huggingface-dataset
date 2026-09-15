# ghkim-rlwrld/shell-game-pi05

## Resumen

`ghkim-rlwrld/shell-game-pi05` es un repositorio de HuggingFace que aloja tres políticas robóticas de la familia pi05 (π0.5, modelos visión-lenguaje-acción) ajustadas sobre el conjunto de datos de robot real denominado *shell_game*. Cada política resuelve la misma tarea de manipulación con un único brazo de 7 grados de libertad más pinza, empleando tres cámaras estéreo como entrada sensorial y una frecuencia de control medida de 9,26 Hz. El conjunto de entrenamiento consta de 45 episodios.

El repositorio no contiene un modelo único, sino tres variantes que difieren en la representación del espacio de acciones y en el condicionamiento por lenguaje: una con acciones absolutas y una frase de tarea global, otra con acciones delta sobre el efector final (xyz + rot6d + gripper) y frase global, y una tercera también con delta EEF pero con etiquetas de subtarea por paso. La rotación se codifica como rot6d en lugar de rpy porque el *roll* presenta discontinuidades al cruzar ±π (269 discontinuidades en los 45 episodios), que se reducen a cero tras la conversión (desviación estándar de 3,08 a 0,039).

La relevancia de esta publicación es acotada y muy específica: se trata de *checkpoints* de inferencia para reproducción de una tarea concreta, no de un modelo general. El autor indica de forma explícita que todavía no se ha ejecutado ninguna evaluación contra estos *checkpoints*, por lo que no existen métricas de éxito. El tamaño del repositorio es de 37,3 GB y no se declara licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | pi05 (π0.5), política visión-lenguaje-acción (VLA); detalles de arquitectura no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no aplica / no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el condicionamiento de lenguaje es en inglés en la model card: "one global task sentence") |
| Licencia | no disponible |
| Formato de pesos | directorios `params/` y `assets/`; formato exacto de serialización no especificado |
| Espacio de acciones | absoluto o delta EEF (xyz + rot6d + gripper), según variante |
| Entradas sensoriales | 3 cámaras estéreo |
| Grados de libertad | 7-DoF (brazo único) + pinza |
| Frecuencia de control | 9,26 Hz (medida) |
| Datos de entrenamiento | conjunto *shell_game*, 45 episodios de robot real |
| Evaluacion | ninguna ejecutada (según el autor) |

Variantes incluidas en el repositorio:

| Run | Espacio de acciones | Lenguaje |
|---|---|---|
| `shell-game-global-pi05-...` | absoluto | una frase de tarea global |
| `shell-game-eef-pi05-...` | delta EEF (xyz + rot6d + gripper) | una frase de tarea global |
| `shell-game-eef-subtask-pi05-...` | delta EEF | etiqueta de subtarea por paso |

## Arquitectura y entrenamiento

La información disponible describe tres políticas pi05 entrenadas mediante aprendizaje por imitación sobre el conjunto *shell_game*. El autor no detalla la arquitectura interna más allá de la familia pi05 (π0.5), propia de los modelos visión-lenguaje-acción que combinan un *backbone* visual y de lenguaje con un cabezal de acciones. Tampoco se especifican el número de tokens de entrenamiento, la composición exacta del dataset más allá del número de episodios, ni si se aplicaron etapas de RLHF, DPO u optimización similar.

El detalle técnico más relevante documentado es la tokenización de la rotación. El autor justifica el uso de rot6d frente a rpy señalando que el *roll* se envuelve en ±π y genera 269 discontinuidades a lo largo de los 45 episodios; al desenrollar y convertir a rot6d el número de discontinuidades pasa a 0, con una reducción de la desviación estándar de 3,08 a 0,039. Cada directorio de variante contiene únicamente `params/` y `assets/` correspondientes al paso final; los estados de entrenamiento (`train_state/`, con los momentos del optimizador, 31 GB por paso) no se han subido de forma deliberada, de modo que estos *checkpoints* sirven para inferencia pero no permiten reanudar el entrenamiento. El directorio `assets/` incluye las estadísticas de normalización y es imprescindible para obtener acciones correctas.

## Capacidades

- Generación de acciones de manipulación robótica para un brazo de 7-DoF con pinza.
- Control en espacio absoluto (variante `global`) o en espacio delta sobre el efector final con representación xyz + rot6d + gripper (variantes `eef` y `eef-subtask`).
- Condicionamiento por lenguaje: ejecución de una tarea descrita por una frase global o guiado paso a paso mediante etiquetas de subtarea.
- Percepción visual a partir de tres cámaras estéreo.
- Ejecución a una frecuencia de control medida de 9,26 Hz.
- No se documentan capacidades de *tool calling*, razonamiento multi-paso genérico, matemáticas, código, visión general, audio ni modo de razonamiento explícito. Se trata de una política robótica de propósito específico, no de un asistente conversacional.

## Casos de uso

- Reproducción de la tarea *shell game* en robot real: los tres *checkpoints* permiten desplegar la política sobre un brazo de 7-DoF con pinza y tres cámaras estéreo, replicando la configuración exacta del entrenamiento, requisito indispensable dada la dependencia de las estadísticas de normalización en `assets/`.
- Investigación en representación de acciones: comparar directamente acciones absolutas frente a delta EEF (xyz + rot6d + gripper) sobre el mismo conjunto de datos y con la misma política base, útil para estudiar estabilidad de la tokenización de rotaciones.
- Estudio de condicionamiento por subtareas: la variante `eef-subtask` permite analizar si las etiquetas por paso mejoran el seguimiento de instrucciones frente a una única frase global, dentro del mismo régimen de datos.
- Aprendizaje por imitación con pocos datos: el conjunto de 45 episodios sirve como caso de estudio de ajuste de políticas VLA con presupuestos de datos muy reducidos.
- Análisis de preprocesado de rotaciones: la conversión documentada de rpy a rot6d es un ejemplo reproducible para quienes trabajan con discontinuidades en el *roll* y quieren evitar artefactos en la señal de acción.
- Base para *fine-tuning* posterior: al ser *checkpoints* de inferencia de una política ya entrenada, pueden servir como punto de partida para reajustes sobre tareas de manipulación similares, siempre que se disponga del *pipeline* de entrenamiento compatible.
- Evaluación comparativa de políticas VLA en laboratorio: los tres *runs* permiten montar un banco de pruebas controlado con una única plataforma física y un único dataset, aislando el efecto del espacio de acciones y del lenguaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que no se ha ejecutado ninguna evaluación contra estos *checkpoints* ("No evaluation has been run against these checkpoints yet"). Por tanto no hay tasas de éxito, métricas de error de acción ni comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- VRAM para inferencia: no declarada por el autor. El repositorio completo ocupa 37,3 GB e incluye tres *checkpoints* más sus `assets/`; asumiendo pesos en precisión de 16 bits, cada *checkpoint* de la familia π0.5 se situaría en el orden de 6-8 GB, por lo que cabría en GPU de consumo con 12 GB o más. Estas cifras son estimaciones a partir del tamaño del repositorio y no un dato confirmado.
- GPU recomendadas: no disponibles. Para una política VLA de esta familia y este tamaño estimado, una GPU con 16-24 GB (RTX 4090, L40S, A10) sería suficiente para una sola instancia en bf16; no se puede confirmar sin especificación del autor.
- Cabe en GPU de consumo: probablemente sí para una instancia única en bf16, condicionado a la estimación anterior; no confirmado.
- Opciones de despliegue: no disponibles. El formato de directorios `params/` + `assets/` es coherente con *checkpoints* de la familia openpi de Physical Intelligence, pero el autor no documenta el *runtime* de inferencia ni integraciones con vLLM, llama.cpp, Ollama o TGI (estas herramientas están orientadas a modelos de lenguaje y no a políticas robóticas).
- Latencia y throughput: no disponibles. El único dato temporal es la frecuencia de control medida del dataset, 9,26 Hz, que corresponde a la teleoperación/registro durante la recogida de datos y no a la latencia de inferencia de la política.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para comparar. Se puede contrastar estructuralmente las tres variantes entre sí, pero no con políticas externas, al no haber métricas publicadas.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| shell-game-global-pi05 | no disponible | no disponible | sin evaluar | no disponible | HuggingFace, 0 descargas |
| shell-game-eef-pi05 | no disponible | no disponible | sin evaluar | no disponible | HuggingFace, 0 descargas |
| shell-game-eef-subtask-pi05 | no disponible | no disponible | sin evaluar | no disponible | HuggingFace, 0 descargas |
| Otras políticas VLA (π0, OpenVLA, etc.) | no disponible | no disponible | no disponible | no disponible | no disponible |

Comparativa con alternativas externas: no disponible.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay evidencia publicada de que las políticas funcionen, ni en simulación ni en robot real.
- Especialización extrema: entrenadas sobre un único conjunto de 45 episodios de una tarea concreta (*shell game*), por lo que la generalización a otras tareas, objetos o entornos es limitada por construcción.
- Configuración de hardware rígida: requieren brazo de 7-DoF con pinza y tres cámaras estéreo; cualquier desviación de esa configuración invalida las estadísticas de normalización.
- Dependencia de `assets/`: si se omiten las estadísticas de normalización, las acciones resultantes serán incorrectas.
- No reanudables para entrenamiento: al no incluirse `train_state/`, no es posible continuar el entrenamiento desde estos *checkpoints*.
- Licencia no especificada: sin licencia declarada, el uso comercial queda en un limbo legal y no debería asumirse permitido.
- Idiomas: el condicionamiento por lenguaje se documenta en inglés; no hay soporte multilingüe declarado.
- Sesgos: no documentados, pero un dataset de 45 episodios de una plataforma física concreta puede incorporar sesgos de posición, iluminación, fondo y dinámica del robot.
- Riesgo de fallo silencioso: en políticas de imitación, el modo de error típico es la deriva de acción o el bloqueo, sin señal de incertidumbre.
- Trazabilidad: 0 descargas y 0 *likes* en el momento de la consulta; no hay validación por parte de la comunidad ni *papers* asociados en la información disponible.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/ghkim-rlwrld/shell-game-pi05
- No se han encontrado en la información proporcionada otros enlaces (papers, blogs, repositorios de código ni demos).
