# jrubiosainz/microduck-game-tug-a1rb4ck-099c-s1-s2-s3-s4-f7f-s5-b725-s3-cma-s2-s3-s4-s5

## Resumen

Este repositorio contiene una política de control para el entorno "Tug of War" de la Microduck Arena, un banco de pruebas de robótica ligera orientado a la competición entre agentes. No es un modelo de lenguaje ni un sistema generativo: es un artefacto de inferencia (`policy.onnx`) que encapsula una política de reinforcement learning modificada mediante búsqueda evolutiva sobre episodios concretos. Lo publica el usuario jrubiosainz como entrada derivada de la política original de a1rb4Ck (`microduck-tug`), con licencia Apache 2.0.

El modelo base es `a1rb4Ck/microduck-tug`, y esta variante se construye por fusión (relación `merge` declarada en la model card). La modificación es quirúrgica: se sustituyen 129 filas de la tabla de búsqueda más externa (`L`, de 508 filas) que gobierna las acciones en los episodios de rating de las semillas 2, 3, 4 y 5, reemplazándolas por filas obtenidas mediante una búsqueda CMA-ES separable sobre desplazamientos de acción. El resto del grafo y los pesos de la red subyacente son idénticos byte a byte a los de la política original.

La relevancia es acotada pero clara para quien trabaja en robótica y RL: ilustra una técnica de ajuste fino por sustitución de tabla de consulta (lookup) sin reentrenamiento, con métricas de rendimiento declaradas por el autor en centímetros de avance en el entorno de competición. El repositorio ocupa 0.0 GB y no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Red neuronal con tabla de consulta externa (`L`, 508 filas) sobre una red subyacente; exportada a ONNX |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; observación de 61 valores por paso) |
| Tipos de cuantización | no disponible (artefacto ONNX de política de control) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`policy.onnx`) |

## Arquitectura y entrenamiento

La política combina una tabla de consulta externa `L` de 508 filas con una red neuronal subyacente. En cada paso, si los primeros 48 de los 61 valores de observación coinciden con una fila almacenada con tolerancia de 1e-7, `L` emite la acción almacenada; en caso contrario, responde la red inferior. Esta arquitectura híbrida permite memorizar trayectorias de episodios concretos sin alterar el comportamiento general del controlador.

El proceso de construcción no implicó entrenamiento ni modificación de pesos. Para cada semilla modificada (2, 3, 4 y 5) se ejecutó una búsqueda CMA-ES separable sobre desplazamientos de acción, con interpolación lineal por tramos entre nudos espaciados aproximadamente 3.1, 2, 2.1 y 3 pasos de política respectivamente. La búsqueda maximizaba la puntuación del episodio contra el pato de referencia congelado, usando el runner de Tug de la Arena en dos máquinas x86_64. Los desplazamientos absolutos máximos fueron de 0.16, 0.014, 0.12 y 0.0030 según la semilla. Las filas añadidas almacenan la observación alcanzada y la acción resultante (acción original más desplazamiento).

## Capacidades

- Control de política para el entorno Tug of War de la Microduck Arena, con acciones deterministas por consulta de tabla y respaldo de red.
- Ejecución de episodios de rating en las semillas 1 a 5, con la semilla 1 sin modificar respecto a la entrada de referencia.
- Inferencia vía ONNX, apta para despliegue en entornos de simulación y competición.
- No soporta tool calling, function calling, agentes multi-paso ni razonamiento simbólico: es una política de control de bajo nivel.
- Sin capacidades multilingües, de visión, audio ni generación de texto.
- Sin modo de razonamiento (thinking mode) ni decodificación especulativa.

## Casos de uso

- Competición en la Microduck Arena: la política se carga como `policy.onnx` en el runner de Tug para disputar episodios de rating en las semillas 1 a 5, aprovechando las filas de tabla ajustadas para maximizar la puntuación en centímetros.
- Investigación en ajuste por búsqueda evolutiva: sirve como caso de estudio de sustitución de filas de lookup con CMA-ES separable sin reentrenamiento, útil para analizar cuánto rendimiento se gana con cambios acotados en la tabla.
- Evaluación comparativa de políticas derivadas: al conservar el grafo y los pesos originales byte a byte, permite aislar el efecto de las 129 filas modificadas frente a `a1rb4Ck/microduck-tug` en las mismas condiciones de simulación.
- Reproducción de resultados declarados: el autor publica una tabla de replay con puntuaciones por semilla (por ejemplo, 165.98 cm en semilla 2 y 167.43 cm en semilla 5), lo que facilita verificar la reproducibilidad del artefacto en dos máquinas x86_64.
- Docencia en RL aplicado a robótica: ejemplo compacto de política híbrida tabla-red para explicar memorización de trayectorias y búsqueda de parámetros en espacios de acción.
- Integración en pipelines de simulación: al ser un archivo ONNX autocontenido, puede cargarse en herramientas de inferencia ONNX Runtime para pruebas automatizadas de control.

## Benchmarks y rendimiento

El autor declara puntuaciones de episodios de rating en centímetros para cada semilla, comparando su entrada previa con el replay de este archivo. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, por no tratarse de un modelo de lenguaje.

| Semilla | Paso de búsqueda | Filas eliminadas | Filas añadidas | Run calificado de la entrada (cm) | Replay de este archivo (cm) |
|---|---|---|---|---|---|
| 1 | sin cambios | ninguna | ninguna | 165.88760018348694 | 165.88760018348694 |
| 2 | 35 | 124-136, 441-447, 484-507 | 464-507 | 165.97312092781067 | 165.98230600357056 |
| 3 | 137 | 274-286, 460-471 | 379-403 | 165.62923192977905 | 165.64450860023499 |
| 4 | 77 | 364-371, 448-459 | 404-423 | 166.5420114994049 | 166.55961275100708 |
| 5 | 29 | 401-440 | 424-463 | 167.15307235717773 | 167.42557883262634 |

Como referencia, el autor cita el run calificado de la política base de a1rb4Ck en la revisión `099ced00`: 166.19724988937378 cm con 5 de 5 pits ganados.

## Requisitos de hardware

- VRAM estimada: no disponible; el repositorio ocupa 0.0 GB y el artefacto es un archivo ONNX de política de control, no un modelo de lenguaje.
- GPU recomendadas: no disponible; la inferencia puede ejecutarse en CPU, dado que el autor realizó las búsquedas en dos máquinas x86_64.
- Compatibilidad con GPU de consumo: no disponible; no se especifican requisitos de aceleración.
- Opciones de despliegue: ONNX Runtime u otro runtime compatible con ONNX; el runner de Tug de la Microduck Arena.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (jrubiosainz) | no disponible | no aplica | 165.98 cm (semilla 2), 167.43 cm (semilla 5) en replay | Apache 2.0 | HuggingFace |
| a1rb4Ck/microduck-tug (rev. 099ced00) | no disponible | no aplica | 166.19724988937378 cm, 5/5 pits | Apache 2.0 | HuggingFace |
| a1rb4Ck/microduck-tug (rev. f7f7705b) | no disponible | no aplica | 166.22851252555847 cm, 5/5 pits | Apache 2.0 | HuggingFace |
| a1rb4Ck/microduck-heist | no disponible | no aplica | no disponible | no disponible | HuggingFace |

## Limitaciones y advertencias

- El artefacto no es un modelo de lenguaje: no debe evaluarse con benchmarks de NLP ni usarse para generación de texto, código o razonamiento.
- Las puntuaciones declaradas provienen de episodios de rating concretos y de un replay del propio autor; no hay validación independiente en la información disponible.
- La modificación se limita a 129 filas de la tabla `L`; el comportamiento fuera de las trayectorias memorizadas depende íntegramente de la red subyacente original.
- Riesgo de sobreajuste a las semillas 2, 3, 4 y 5: los desplazamientos se ajustaron contra el pato de referencia congelado, por lo que la generalización a otros oponentes o condiciones no está documentada.
- Sin datos sobre sesgos, alucinación o limitaciones idiomáticas, al no ser un modelo generativo.
- Licencia Apache 2.0 permite uso comercial, pero se debe conservar el aviso de atribución a a1rb4Ck y a las revisiones citadas en la model card.
- El repositorio no registra descargas ni likes, y la fecha de creación (2026-11-03) es posterior a la consulta, lo que conviene verificar antes de usarlo en producción.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/jrubiosainz/microduck-game-tug-a1rb4ck-099c-s1-s2-s3-s4-f7f-s5-b725-s3-cma-s2-s3-s4-s5)
- [Modelo base: a1rb4Ck/microduck-tug](https://huggingface.co/a1rb4Ck/microduck-tug)
- [Microduck Arena (Space)](https://huggingface.co/spaces/pollen-robotics/microduck-arena)
- [Perfil de a1rb4Ck](https://huggingface.co/a1rb4Ck)
