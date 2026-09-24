# Shiki42/q4a-place-dual-shoes-sequential-pi05-e694-step10000

## Resumen

Este repositorio contiene un checkpoint de inferencia de una política robótica entrenada con el framework CTR, correspondiente al experimento E694 (run formal E694-R001) en el paso 10000. El modelo se etiqueta como `pi05`, lo que lo sitúa en la familia de políticas vision-language-action (VLA) pi0.5, y el autor referencia explícitamente el repositorio OpenPI mediante el commit `e9ba7b7732a3e66e4bd87d6d3429f7cef6352ead`. La tarea objetivo es `place-dual-shoes-sequential`, es decir, la colocación secuencial de dos zapatos sobre el benchmark de manipulación RoboTwin.

El entrenamiento se realizó sobre el brazo de datos Q4-A Sequential, con episodios equilibrados entre orden izquierda-primero y derecha-primero, y con IdleMask desactivado. Esto apunta a un interés concreto: que la política aprenda a resolver la tarea en ambos órdenes de actuación sin introducir un sesgo de secuenciación, un problema habitual en tareas de manipulación bimanual con subtareas dependientes.

Su relevancia es doble. Por un lado, es un artefacto de investigación reproducible: la model card publica los hashes de revisión del dataset, del código CTR, del código OpenPI y de la normalización, además de un fichero `SHA256SUMS`. Por otro, incluye una evaluación independiente (E717-R001) sobre 100 escenas congeladas con una tasa de éxito reportada de 44/100, aunque la auditoría de dicho resultado está pendiente. No se dispone de licencia, idiomas ni especificaciones de arquitectura detalladas en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiquetada como `pi05`; política VLA de la familia pi0.5, referenciada contra OpenPI) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio contiene parámetros de inferencia y assets; no se especifica el formato) |
| Tamano del repositorio | 6,3 GB |
| Tarea | `place-dual-shoes-sequential` (RoboTwin) |
| Paso de entrenamiento | 10000 |
| Experimento | E694 (run E694-R001) |
| Dataset de entrenamiento | Brazo Q4-A Sequential, episodios equilibrados izquierda-primero / derecha-primero, revision `02332c47367cf3adf70c9ddbd821d72b41b1327a` |
| IdleMask | Desactivado |
| Commit CTR | `5c351756627c05a4d2ea36431fe0c404b6b7545d` |
| Commit OpenPI | `e9ba7b7732a3e66e4bd87d6d3429f7cef6352ead` |
| SHA-256 de normalizacion | `3e8063201a5ac65366a633f92a5334f1d82793849217ceff482e2359e8ee5b2a` |
| Pipeline | robotics |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo. La etiqueta `pi05` junto con la referencia al commit de OpenPI indica que se trata de un checkpoint derivado del stack de entrenamiento e inferencia OpenPI para políticas pi0.5, es decir, una política que mapea observaciones visuales y estado del robot a acciones, en lugar de un modelo de lenguaje general. No se especifican en la model card el número de parámetros, el codificador visual, el mecanismo de generación de acciones (por ejemplo, flow matching o difusión) ni la longitud del horizonte de acción.

En cuanto al entrenamiento, los datos son el brazo Q4-A Sequential con episodios equilibrados entre orden izquierda-primero y derecha-primero, y con IdleMask desactivado. El equilibrio de órdenes sugiere que se buscó evitar que la política colapse a una única secuencia de colocación, un aspecto crítico en tareas donde el éxito depende de coordinar dos objetos. El repositorio publica únicamente los parámetros de inferencia y los assets; el estado del optimizador y del cargador de datos queda excluido. La reproducibilidad se ancla mediante hashes de revisión del dataset, del código CTR y OpenPI, más el SHA-256 de la normalización, que debe usarse sin modificar para la inferencia.

## Capacidades

- Control robótico para la tarea `place-dual-shoes-sequential` en el entorno RoboTwin.
- Ejecución de secuencias de manipulación de dos objetos con dos posibles órdenes de actuación (izquierda-primero y derecha-primero).
- Inferencia de acciones a partir de observaciones, en el marco de una política VLA de tipo pi0.5.
- Ejecución de una política entrenada específicamente para una tarea y un brazo de datos concretos, sin capacidades generales declaradas.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (modelo orientado a control motor, no a texto).
- Capacidades especiales (modo thinking, visión, audio): no disponible; no se documenta ningún modo de razonamiento explícito ni procesado de audio.
- Reproducibilidad verificable mediante hashes y `SHA256SUMS`, lo que permite validar la integridad del payload publicado.

## Casos de uso

- Colocación secuencial de dos zapatos en simulación RoboTwin: el modelo recibe observaciones del entorno y genera acciones para completar la tarea en el orden correcto, que es exactamente el escenario para el que fue entrenado.
- Evaluación comparativa de políticas VLA en RoboTwin: sirve como línea base reproducible (44/100 éxitos en 100 escenas congeladas reportados por E717-R001) frente a otros checkpoints del mismo benchmark.
- Investigación sobre sesgo de orden en manipulación bimanual: al haberse entrenado con episodios equilibrados izquierda-primero y derecha-primero, permite estudiar si la política generaliza a ambos órdenes o colapsa a uno.
- Punto de partida para fine-tuning en tareas relacionadas: al publicarse solo parámetros de inferencia, es adecuado como inicialización para reentrenar con nuevos brazos de datos o nuevas tareas de colocación.
- Validación de pipelines de entrenamiento OpenPI/CTR: los hashes de commit y de normalización permiten reproducir exactamente la configuración y comprobar la integridad del resultado.
- Generación de rollouts para aumento de datos: los episodios generados por la política pueden utilizarse para análisis de fallos, minería de casos límite o entrenamiento posterior.
- Auditoría de resultados de evaluación: dado que la evaluación E717 está pendiente de auditoría, el checkpoint es un caso de estudio útil para revisar protocolos de evaluación en simulación robótica.
- Pruebas de transferencia sim-to-real: como política entrenada en simulación con un 44 % de éxito reportado, permite medir la brecha al trasladar la política a un robot físico, asumiendo que el entorno real replique la configuración del benchmark.

## Benchmarks y rendimiento

| Benchmark / evaluacion | Metrica | Resultado | Notas |
|---|---|---|---|
| E717-R001 (RoboTwin) | Tasa de exito | 44/100 (44 %) | 100 escenas congeladas; auditoria pendiente |
| E694-R001 | Finalizacion del entrenamiento | Exit code 0 | Checkpoint del paso 10000 con recibo de verificacion |
| MMLU, HumanEval, GSM8K u otros | No aplica / no disponible | No disponible | No se han publicado resultados de benchmarks de lenguaje en la informacion disponible |

No se han publicado resultados de benchmarks adicionales en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no confirmada. El payload publicado es de 6,3 GB, lo que da una cota inferior del espacio necesario para los pesos; sin conocer la precisión ni el número de parámetros, no puede darse una cifra fiable de VRAM total (pesos más activaciones).
- GPU recomendadas: no disponible en la información proporcionada.
- Viabilidad en GPU de consumo: el tamaño del repositorio (6,3 GB) es compatible con GPUs de consumo de gama alta con 16-24 GB, como una RTX 4090 o RTX 3090, siempre que el formato de pesos publicado sea directamente cargable y las activaciones no exijan mucha memoria adicional. No hay confirmación por parte del autor.
- Opciones de despliegue: el modelo está pensado para el stack de inferencia OpenPI (commit `e9ba7b7732a3e66e4bd87d6d3429f7cef6352ead`) junto con el código CTR. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, que además no son aplicables de forma estándar a políticas de control robótico.
- Latencia y throughput: no disponible.
- Almacenamiento: el repositorio ocupa 6,3 GB; se recomienda verificar el fichero `SHA256SUMS` tras la descarga para garantizar que el payload es el publicado.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Tasa de exito en la tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Shiki42/q4a-place-dual-shoes-sequential-pi05-e694-step10000 | Checkpoint pi0.5 para RoboTwin | no disponible | no disponible | 44/100 (E717-R001, auditoria pendiente) | no disponible | HuggingFace |
| OpenPI pi0.5 (modelo base referenciado) | Politica VLA generalista para robotica | no disponible | no disponible | no disponible | no disponible | Repositorio OpenPI |
| Otros checkpoints Q4-A / pi0.5 del mismo autor | Checkpoint pi0.5 para RoboTwin | no disponible | no disponible | no disponible | no disponible | HuggingFace |
| Politicas baseline de RoboTwin (ACT, DP3, etc.) | Politicas de imitacion para manipulacion | no disponible | no disponible | no disponible | no disponible | Repositorios publicos |

No se dispone de datos comparativos cuantitativos en la información proporcionada; los valores numéricos de los modelos alternativos figuran como no disponibles.

## Limitaciones y advertencias

- Licencia no especificada en la model card. Antes de cualquier uso comercial es imprescindible contactar con el autor para aclarar los términos.
- El modelo es específico de una única tarea (`place-dual-shoes-sequential`) y de un único conjunto de datos (brazo Q4-A Sequential); no se declaran capacidades de propósito general.
- La evaluación principal reporta 44/100 éxitos y su auditoría está pendiente, por lo que la cifra debe tratarse como preliminar y no como un resultado validado de forma independiente.
- Entrenamiento en simulación (RoboTwin): existe una brecha sim-to-real no cuantificada en la información disponible. Trasladar la política a hardware físico puede degradar el rendimiento de forma significativa.
- No se documentan sesgos, comportamientos de fallo ni modos de error específicos. En políticas de manipulación esto es relevante, ya que los fallos pueden provocar colisiones o daños en el entorno real.
- Riesgo de alucinación: no aplica en el sentido de texto generado, pero sí existe el riesgo equivalente de que la política genere trayectorias plausibles pero incorrectas en escenas fuera de la distribución de entrenamiento.
- Limitaciones de contexto e idioma: no disponibles; no se documenta ventana de contexto ni soporte multilingüe.
- Restricciones de uso en producción: al desconocerse la licencia y al tratarse de un checkpoint de investigación con auditoría pendiente, no se recomienda su despliegue en entornos productivos sin una validación adicional.
- El repositorio excluye el estado del optimizador y del cargador de datos, por lo que no es posible reanudar el entrenamiento exactamente desde este artefacto.
- La inferencia debe usar los assets y la normalización incluidos sin modificar; alterar la normalización invalidaría la reproducibilidad garantizada por el hash publicado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Shiki42/q4a-place-dual-shoes-sequential-pi05-e694-step10000
- Repositorio OpenPI (referenciado por el commit `e9ba7b7732a3e66e4bd87d6d3429f7cef6352ead`): https://github.com/Physical-Intelligence/openpi
- Benchmark RoboTwin (entorno de evaluación de la tarea): https://robotwin-platform.github.io/
- Revision del dataset de entrenamiento: `02332c47367cf3adf70c9ddbd821d72b41b1327a`
- Commit del codigo CTR: `5c351756627c05a4d2ea36431fe0c404b6b7545d`
- SHA-256 de normalizacion: `3e8063201a5ac65366a633f92a5334f1d82793849217ceff482e2359e8ee5b2a`
