# Myungkyu/rldx_robodojo_vanilla_b128_60k

## Resumen

`rldx_robodojo_vanilla_b128_60k` es un modelo de visión-lenguaje-acción (VLA) para robótica, publicado por el usuario Myungkyu en Hugging Face. Se trata de un ajuste fino del modelo base RLWRLD/RLDX-1-PT sobre el conjunto de datos RoboDojo-Benchmark/RoboDojo, en la configuración de co-entrenamiento en simulación (35 tareas x 100 episodios, robot dual ARX X5, exportación oficial de LeRobot). La model card lo describe explícitamente como un "vanilla baseline", es decir, una referencia de partida sin modificaciones metodológicas adicionales, útil para comparar contra variantes posteriores.

El modelo recibe tres vistas de cámara (cabeza y muñecas izquierda y derecha), un estado articular de 14 dimensiones y la instrucción de la tarea en lenguaje natural, y produce como salida objetivos articulares absolutos de 14 dimensiones con un horizonte de acción de 50 pasos. El backbone es RLDX-1-PT con configuración de vídeo de longitud 4 y stride 2. El ajuste fino se realizó con enmascaramiento de ruido en la dimensión de padding (`action_noise_mask_dim=14`) y dropout de estado de 0.5, batch de 128 y 60.000 pasos de optimizador.

Con 6.912.896.320 parámetros (aproximadamente 6,9 mil millones) y un repositorio de 55,3 GB en safetensors, es un modelo de tamaño medio orientado a investigación en manipulación robótica más que a despliegue generalista de texto. Su relevancia actual radica en que sirve como línea base reproducible dentro del ecosistema RoboDojo/RLDX para evaluar políticas VLA en tareas de manipulación bimanual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RLDX-1-PT (VLA; video length 4 / stride 2, tres vistas de cámara, horizonte de acción 50) |
| Parametros totales | 6.912.896.320 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (instrucciones de tarea en lenguaje natural; idioma no especificado) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo base | RLWRLD/RLDX-1-PT |
| Dataset de ajuste | RoboDojo-Benchmark/RoboDojo (35 tareas x 100 episodios, dual ARX X5) |
| Entradas | Imágenes head + left/right wrist, estado articular 14-d, instrucción de tarea |
| Salidas | Objetivos articulares absolutos 14-d |
| Batch / pasos | 128 / 60.000 |
| Checkpoints intermedios | step-15000, step-30000, step-45000 |
| Tamaño del repo | 55,3 GB |

## Arquitectura y entrenamiento

El modelo parte de RLWRLD/RLDX-1-PT, un backbone VLA que combina procesamiento de vídeo (longitud 4, stride 2) con tres flujos de cámara y una cabeza de acción con horizonte de 50 pasos. La entrada fusiona percepción visual multi-vista, propriocepción (estado articular de 14 dimensiones) e instrucción en lenguaje natural; la salida son comandos articulares absolutos de 14 dimensiones, adecuados para control de un robot bimanual ARX X5.

El ajuste fino se ejecutó sobre RoboDojo en configuración de co-entrenamiento en simulación, con 35 tareas y 100 episodios por tarea, exportación oficial de LeRobot. Se aplicaron dos técnicas de regularización descritas en la model card: enmascaramiento de ruido en la dimensión de padding (`action_noise_mask_dim=14`) y dropout de estado con probabilidad 0.5. El entrenamiento usó batch de 128 durante 60.000 pasos; el checkpoint final no incluye el estado del optimizador. Se publican además checkpoints intermedios en los pasos 15.000, 30.000 y 45.000. El código de referencia es RLWRLD/RLDX en el commit `myungkyu/jitter-patch 21f674b4`. No se detalla en la información disponible la composición exacta del dataset, el número de tokens ni si hubo etapas de RLHF o DPO.

## Capacidades

- Generación de acciones robóticas de manipulación: produce objetivos articulares absolutos de 14 dimensiones para un robot bimanual ARX X5.
- Percepción visual multi-vista: procesa simultáneamente imágenes de cámara de cabeza y de muñecas izquierda y derecha.
- Condicionamiento por instrucción en lenguaje natural: la tarea se especifica mediante texto.
- Fusión de propriocepción: incorpora el estado articular de 14 dimensiones como entrada.
- Planificación con horizonte de acción de 50 pasos.
- Entrenado en 35 tareas de simulación del benchmark RoboDojo.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión generalista, audio ni modo de razonamiento explícito.

## Casos de uso

- Línea base reproducible en investigación VLA: sirve como referencia "vanilla" contra la que comparar variantes metodológicas sobre el mismo dataset RoboDojo, gracias a sus checkpoints intermedios y a la configuración documentada.
- Evaluación de políticas de manipulación bimanual en simulación: el modelo está entrenado para el robot dual ARX X5 con exportación LeRobot, lo que facilita integrarlo en pipelines de evaluación estándar del ecosistema.
- Estudio de robustez ante dropout de estado: al haberse entrenado con `state_dropout=0.5`, es útil para analizar el comportamiento cuando la propriocepción es parcial o ruidosa.
- Ablación de enmascaramiento de ruido en acciones: la configuración `action_noise_mask_dim=14` permite estudiar el efecto del enmascaramiento en dimensiones de padding sobre el aprendizaje de políticas.
- Análisis de trayectorias de entrenamiento: los checkpoints en 15.000, 30.000 y 45.000 pasos permiten estudiar la evolución del rendimiento a lo largo del ajuste fino.
- Transferencia a tareas de laboratorio: como punto de partida para ajuste fino adicional sobre tareas específicas de manipulación con instrucciones en lenguaje natural.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; como referencia orientativa, un modelo de ~6,9 mil millones de parámetros en precisión completa requiere del orden de decenas de GB, pero no se confirma el formato ni la precisión de despliegue.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; el tamaño del repositorio (55,3 GB) sugiere que la inferencia en GPU de consumo requeriría cuantización, cuyos formatos no se documentan.
- Opciones de despliegue: no se especifican (vLLM, llama.cpp, Ollama o TGI no aparecen en la información); el código de referencia es RLWRLD/RLDX en el commit indicado.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Base | Licencia | Notas |
|---|---|---|---|---|---|
| Myungkyu/rldx_robodojo_vanilla_b128_60k | 6.912.896.320 | no disponible | RLWRLD/RLDX-1-PT | no disponible | Baseline vanilla sobre RoboDojo |
| Myungkyu/rldx2_rldx_robodojo_vanilla_b128_60k | no disponible | no disponible | RLDX-1-PT (misma configuración descrita) | no disponible | Variante del mismo autor con idéntica arquitectura y ajuste según la información disponible |
| RLWRLD/RLDX-1-PT | no disponible | no disponible | — | no disponible | Modelo base preentrenado sobre el que se ajusta este checkpoint |

No se dispone de datos de benchmarks ni de especificaciones detalladas de modelos alternativos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Orientado exclusivamente a robótica: no es un modelo de propósito general para texto, código o visión generalista.
- Entrenado en simulación (RoboDojo): el rendimiento en el mundo real no está documentado y puede degradarse por la brecha sim-to-real.
- Específico de hardware: las salidas de 14 dimensiones están pensadas para un robot dual ARX X5; no es directamente portable a otras morfologías sin reentrenamiento.
- Licencia no disponible: no se puede confirmar el uso comercial ni las restricciones de redistribución.
- Idiomas no especificados: se desconoce el alcance lingüístico de las instrucciones de tarea.
- Riesgo de alucinación y de acciones inseguras en entornos físicos: no se documentan evaluaciones de seguridad.
- Sesgos: no se documentan sesgos conocidos, pero el dataset limitado a 35 tareas restringe la generalización.
- Checkpoint final sin estado del optimizador: no permite reanudar el entrenamiento exactamente desde ese punto.
- Sin benchmarks publicados: no hay evidencia cuantitativa de rendimiento frente a alternativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Myungkyu/rldx_robodojo_vanilla_b128_60k
- Variante relacionada: https://huggingface.co/Myungkyu/rldx2_rldx_robodojo_vanilla_b128_60k
- Modelo base: https://huggingface.co/RLWRLD/RLDX-1-PT
- Dataset: https://huggingface.co/datasets/RoboDojo-Benchmark/RoboDojo
