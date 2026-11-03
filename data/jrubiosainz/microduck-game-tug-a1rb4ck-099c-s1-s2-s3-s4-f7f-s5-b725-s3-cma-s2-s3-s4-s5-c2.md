# jrubiosainz/microduck-game-tug-a1rb4ck-099c-s1-s2-s3-s4-f7f-s5-b725-s3-cma-s2-s3-s4-s5-c2

## Resumen

`microduck-game-tug-a1rb4ck-099c-s1-s2-s3-s4-f7f-s5-b725-s3-cma-s2-s3-s4-s5-c2` es una política de control para el juego Tug of War (tira y afloja) de la Microduck Arena, un entorno de competición de robótica mantenido por Pollen Robotics en HuggingFace Spaces. Lo publica el usuario `jrubiosainz` como una modificación de su propia entrada anterior, que a su vez deriva de la política `microduck-tug` del autor `a1rb4Ck`. No es un modelo de lenguaje: es un artefacto de inferencia en formato ONNX que contiene una red neuronal y una tabla de búsqueda (lookup) que la envuelve.

La modificación es quirúrgica y de alcance muy limitado. El autor sustituye 129 filas de la tabla `L` —la capa más externa del archivo, que almacena acciones discretas asociadas a observaciones— por filas obtenidas mediante una búsqueda con CMA-ES separable sobre desplazamientos de acción, aplicada a los bouts de clasificación de las semillas 2, 3, 4 y 5. No se ha reentrenado ninguna red ni se ha modificado ningún peso: el grafo, la red subyacente a `L` y el resto de inicializadores son idénticos byte a byte a los de la entrada original.

Su relevancia es acotada pero concreta: documenta una técnica de optimización de políticas por búsqueda directa sobre tablas de memoria (memory-based policies) en un entorno de competición con semillas fijas, y muestra cómo pequeñas perturbaciones acotadas (entre 0,0030 y 0,16 en valor absoluto) sobre acciones memorizadas mejoran la puntuación de un bout concreto sin tocar el modelo base. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal (no especificada en la model card) envuelta por una tabla de búsqueda `L` de 508 filas; artefacto ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (observación de 61 valores por paso, según la model card) |
| Tipos de cuantizacion | no disponible (el artefacto se distribuye como `policy.onnx`) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`policy.onnx`) |

## Arquitectura y entrenamiento

La política combina una red neuronal (cuyos detalles de capas y tamaños no se documentan en la model card) con una tabla de búsqueda `L` que actúa como capa más externa. `L` contiene 508 filas; cada fila almacena una observación y la acción asociada. En tiempo de inferencia, si los primeros 48 de los 61 valores de observación coinciden con una fila almacenada dentro de una tolerancia de 1e-7, `L` devuelve directamente la acción memorizada; en caso contrario, la respuesta la produce la red subyacente. Este diseño híbrido permite memorizar trayectorias concretas sin sacrificar la generalización de la red.

No hubo entrenamiento en esta modificación. El autor ejecutó una búsqueda CMA-ES separable sobre desplazamientos de acción, con interpolación lineal por tramos entre nudos espaciados aproximadamente 3,1 pasos de política para la semilla 2, 2 para la semilla 3, 2,1 para la semilla 4 y 3 para la semilla 5. La búsqueda maximizó la puntuación del bout contra un pato de referencia congelado, usando el runner de Tug de la Arena sobre dos máquinas x86_64. Los desplazamientos resultantes están acotados en valor absoluto a 0,16 (semilla 2), 0,016 (semilla 3), 0,13 (semilla 4) y 0,0030 (semilla 5). Las filas nuevas almacenan la observación alcanzada en cada paso y la acción resultante de sumar el desplazamiento a la acción original.

## Capacidades

- Control de política para el juego Tug of War de la Microduck Arena: genera acciones a partir de observaciones de 61 valores.
- Memoria de trayectorias mediante tabla de búsqueda con coincidencia exacta (tolerancia 1e-7) sobre los primeros 48 valores de observación.
- Generalización fuera de la tabla mediante la red neuronal subyacente.
- Ejecución en formato ONNX, apta para inferencia en CPU x86_64 (el autor la validó en dos máquinas x86_64).
- No soporta tool calling, function calling, agentes multi-paso, razonamiento en lenguaje natural, visión, audio ni capacidades multilingües: es una política de robótica, no un modelo generativo.

## Casos de uso

- Competición en la Microduck Arena: la política se sube como entrada al espacio de HuggingFace y se evalúa en los bouts de clasificación de las semillas 1 a 5, donde el autor reporta puntuaciones de replay entre 165,647 y 167,426 cm.
- Investigación en optimización de políticas memorizadas: sirve como caso de estudio de búsqueda CMA-ES sobre tablas de lookup en lugar de sobre pesos, con desplazamientos acotados y evaluación contra un oponente congelado.
- Reproducción de experimentos de la Arena: el archivo `NOTICE` documenta fila a fila qué se eliminó y qué se añadió, lo que permite auditar y replicar la modificación sobre la política base `a1rb4Ck/microduck-tug`.
- Benchmarking de técnicas de búsqueda directa: comparar el rendimiento de la búsqueda separable por semilla (distintos espaciados de nudos y cotas de desplazamiento) frente a la política original.
- Docencia en robótica de competición: ejemplo mínimo de cómo una capa de memoria discreta puede convivir con una red neuronal en un pipeline ONNX de control.
- Integración en pipelines de evaluación automatizada: el runner de Tug de la Arena puede ejecutar esta política contra oponentes de referencia para medir mejoras incrementales.

## Benchmarks y rendimiento

La model card reporta puntuaciones de bouts de clasificación (en centímetros) para la entrada del autor y para el replay de este archivo, por semilla:

| Semilla | Paso de búsqueda | Filas eliminadas | Filas añadidas | Run clasificado de la entrada (cm) | Replay de este archivo (cm) |
|---|---|---|---|---|---|
| 1 | sin cambios | ninguna | ninguna | 165,88760018348694 | 165,88760018348694 |
| 2 | 35 | 124-136, 441-447, 484-507 | 464-507 | 165,97312092781067 | 165,98230600357056 |
| 3 | 137 | 274-286, 460-471 | 379-403 | 165,62923192977905 | 165,64732789993286 |
| 4 | 77 | 364-371, 448-459 | 404-423 | 166,5420114994049 | 166,56256318092346 |
| 5 | 29 | 401-440 | 424-463 | 167,15307235717773 | 167,42557883262634 |

Como referencia, la model card cita los runs clasificados de las políticas base de `a1rb4Ck`: 166,19724988937378 cm (5 de 5 pits ganados) para la revisión `099ced00`, 166,22851252555847 cm (5 de 5 pits ganados) para `f7f7705b` y 165,4581367969513 cm para la revisión anterior `3a2eb4e2`. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) porque no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada: no disponible; el artefacto es un archivo ONNX de una política de control y el tamaño del repositorio figura como 0.0 GB.
- GPU recomendadas: no se especifican; el autor validó la búsqueda y el replay en dos máquinas x86_64, lo que sugiere inferencia en CPU.
- Compatibilidad con GPU de consumo: no disponible; por el tamaño del artefacto es probable que quepa en cualquier GPU de consumo, pero no hay dato confirmado.
- Opciones de despliegue: ONNX Runtime (formato nativo del artefacto); el runner de Tug de la Microduck Arena para evaluación en competición.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Puntuación clasificada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (`jrubiosainz/microduck-game-tug-...-c2`) | no disponible | no disponible | 165,65-167,43 cm (replay por semilla) | Apache 2.0 | HuggingFace |
| `a1rb4Ck/microduck-tug` (rev. `099ced00`) | no disponible | no disponible | 166,19724988937378 cm | Apache 2.0 | HuggingFace |
| `a1rb4Ck/microduck-tug` (rev. `f7f7705b`) | no disponible | no disponible | 166,22851252555847 cm | Apache 2.0 | HuggingFace |
| `a1rb4Ck/microduck-tug` (rev. `3a2eb4e2`) | no disponible | no disponible | 165,4581367969513 cm | Apache 2.0 | HuggingFace |

## Limitaciones y advertencias

- La modificación está sobreajustada a las semillas 2, 3, 4 y 5 y a los bouts de clasificación concretos; no hay evidencia de mejora en otras semillas o condiciones.
- La tabla `L` solo se activa con coincidencia exacta (tolerancia 1e-7) sobre los primeros 48 valores de observación; pequeñas variaciones en la observación hacen que la política caiga en la red subyacente, que no ha sido modificada.
- No se ha realizado entrenamiento ni ajuste de pesos: la mejora procede exclusivamente de la sustitución de filas de lookup, con desplazamientos de acción acotados que pueden no generalizar.
- No es un modelo de lenguaje: no admite prompts, tool calling, agentes ni capacidades multilingües; cualquier uso fuera del entorno Tug de la Microduck Arena carece de soporte documentado.
- La model card no documenta sesgos, riesgos de alucinación ni comportamiento fuera de distribución; no hay información sobre robustez ante perturbaciones.
- El repositorio tiene 0 descargas y 0 likes, y el tamaño figura como 0.0 GB, lo que puede indicar que los pesos no están subidos o que el artefacto es muy pequeño; conviene verificar la integridad de `policy.onnx` antes de usarlo.
- La licencia Apache 2.0 permite uso comercial, pero la política depende de la política base de `a1rb4Ck` y de las condiciones de la Microduck Arena, que no se detallan en la información disponible.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/jrubiosainz/microduck-game-tug-a1rb4ck-099c-s1-s2-s3-s4-f7f-s5-b725-s3-cma-s2-s3-s4-s5-c2)
- [Microduck Arena (Pollen Robotics)](https://huggingface.co/spaces/pollen-robotics/microduck-arena)
- [Política base `a1rb4Ck/microduck-tug`](https://huggingface.co/a1rb4Ck/microduck-tug)
- [Perfil de `a1rb4Ck`](https://huggingface.co/a1rb4Ck)
- [Política `microduck-heist` de `a1rb4Ck`](https://huggingface.co/a1rb4Ck/microduck-heist)
- [Entrada anterior del autor (`game-tug-a1rb4ck-099c-s1-s2-s3-s4`)](https://huggingface.co/jrubiosainz)
