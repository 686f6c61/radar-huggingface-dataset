# jrubiosainz/microduck-game-tug-a1rb4ck-099c-s1-s2-s3-s4-f7f-s5

## Resumen

`microduck-game-tug-a1rb4ck-099c-s1-s2-s3-s4-f7f-s5` es una política de control para el entorno de robótica simulado Tug of War de la Microduck Arena, publicada por el usuario jrubiosainz en Hugging Face. No es un modelo de lenguaje: se trata de un grafo ONNX (`policy.onnx`) que implementa una política de reinforcement learning para un robot tipo pato (MicroDuck) que debe tirar de una cuerda en un entorno competitivo. La política se construye sobre el modelo base `a1rb4Ck/microduck-tug` y se distribuye con licencia Apache 2.0.

El modelo es una variante de "merge" que combina filas de tablas de búsqueda (lookup tables) de distintas revisiones del trabajo de a1rb4Ck. En concreto, sustituye ocho filas de la capa más externa `L` (filas 433-440) de la entrada previa del autor, que jugaban el final del combate de la semilla 5, por las filas 500-507 de la revisión `f7f7705b` de a1rb4Ck. El resto del fichero (500 filas de `L`, la red subyacente y el resto de inicializadores) permanece idéntico byte a byte.

La relevancia es acotada: se trata de una entrada de competición para un benchmark de robótica lúdico-competitivo (Microduck Arena), sin entrenamiento ni búsqueda adicional en esta modificación. Su interés es documental y de reproducibilidad dentro de la comunidad de la arena, no como modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política híbrida: tabla de búsqueda `L` (508 filas) como capa externa + red neuronal subyacente (ONNX) |
| Parametros totales | no disponible (el repo ocupa 0.0 GB; no se declara recuento) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (observación de 61 valores por paso) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`policy.onnx`) |

## Arquitectura y entrenamiento

La política combina una capa de decisión basada en búsqueda con una red neuronal. La capa externa `L` contiene 508 filas: cada fila almacena una observación (los primeros 48 de los 61 valores de observación) y una acción. Si la observación actual coincide con una fila almacenada dentro de una tolerancia de 1e-7, se ejecuta la acción guardada; en caso contrario, la red subyacente responde. La red por debajo de `L` es idéntica byte a byte a la del modelo `microduck-heist` de a1rb4Ck, que a su vez se basa en el walker de juicenv.

No hubo entrenamiento ni búsqueda para esta modificación concreta. El autor lo declara explícitamente: solo se sustituyeron ocho filas de `L` (433-440) por las filas 500-507 de la revisión `f7f7705b` de a1rb4Ck, que cubren los pasos 61 a 68 del combate de la semilla 5. Como la fila 433 ya almacenaba la observación de la fila 500 del modelo de a1rb4Ck, cambian las observaciones de las filas 434-440 y las acciones de las filas 433-440. Las otras 500 filas proceden de la entrada previa del autor y conservan su orden, de modo que los combates de las semillas 1 a 4 siguen siendo los de dicha entrada.

## Capacidades

- Control de un robot MicroDuck en el entorno Tug of War de la Microduck Arena.
- Toma de decisiones por paso a partir de un vector de observación de 61 valores.
- Ejecución de acciones almacenadas por coincidencia exacta (tolerancia 1e-7) sobre los primeros 48 valores de observación.
- Generalización a observaciones no memorizadas mediante la red neuronal subyacente.
- Comportamiento específico por semilla: las semillas 1 a 4 usan las filas de la entrada previa del autor; la semilla 5 usa las filas de la revisión `f7f7705b` de a1rb4Ck a partir del paso 61.
- No dispone de tool calling, agentes, capacidades multilingües ni modos de razonamiento: no es un modelo de lenguaje.

## Casos de uso

- Competición en la Microduck Arena: el modelo se presenta como entrada en la categoría Tug of War y se evalúa con el runner oficial de la arena, que mide la distancia en centímetros y los pits ganados.
- Reproducción de resultados: permite reproducir los combates de las semillas 1 a 5 con las métricas declaradas en la model card (por ejemplo, 167.15307235717773 cm en la semilla 5).
- Estudio de merges de políticas: sirve como ejemplo documentado de combinación de filas de lookup tables entre revisiones de un mismo modelo base, con trazabilidad de qué filas provienen de qué revisión.
- Análisis de robustez por semilla: al conservar las filas de las semillas 1 a 4 y sustituir solo las de la semilla 5, permite aislar el efecto de un cambio localizado en el comportamiento final del combate.
- Base para nuevas variantes: al estar liberado bajo Apache 2.0 y en formato ONNX, otros participantes pueden partir de este fichero para experimentar con sustituciones de filas adicionales.
- Docencia y divulgación: ilustra cómo una política de RL puede combinar memorización (tabla) y generalización (red) en un entorno de control de bajo dimensionalidad.

## Benchmarks y rendimiento

Resultados declarados en la model card para los combates de las semillas 1 a 5, comparando la entrada previa del autor (`099ced00`) con este fichero:

| Semilla | Filas de | Acciones iguales a `099ced00` hasta el paso | `099ced00` (cm) | Este fichero (cm) |
|---|---|---|---|---|
| 1 | entrada del autor | 89 | 165.88658690452576 | 165.88760018348694 |
| 2 | entrada del autor | 48 | 165.82584381103516 | 165.97312092781067 |
| 3 | entrada del autor | 150 | 165.59808254241943 | 165.59937596321106 |
| 4 | entrada del autor | 85 | 166.53864979743958 | 166.5420114994049 |
| 5 | `f7f7705b` de a1rb4Ck | 61 | 167.13708639144897 | 167.15307235717773 |

Referencias de las ejecuciones valoradas citadas en la model card:

| Modelo | Ejecución | Resultado (cm) | Pits ganados |
|---|---|---|---|
| a1rb4Ck/microduck-tug `099ced00` | 01M6C7BQG0VKY44AZ3S7EY | 166.19724988937378 | 5 de 5 |
| a1rb4Ck/microduck-tug `f7f7705b` | 01M6CD51792XQJ8T1QGPBM | 166.22851252555847 | 5 de 5 |
| rumezhak/microduck-tug-tab-v2 `b63e3587` | 01M66WDHY7FKHNDEDXWNHY | 165.1954472064972 | no disponible |
| a1rb4Ck/microduck-tug `3a2eb4e2` | 01M6724VVWB1C5T22HXGBJ | 165.4581367969513 | no disponible |
| jrubiosainz entrada previa | 01M6CC3QNRA8RCJ1SF1XP8 | 166.2278389930725 | 5 de 5 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) porque el modelo no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada: no disponible; el repositorio ocupa 0.0 GB y el único artefacto es `policy.onnx`, por lo que la inferencia es muy ligera.
- GPU recomendadas: no se especifican; al ser un grafo ONNX de una política de control de baja dimensionalidad, puede ejecutarse en CPU.
- Compatibilidad con GPU de consumo: previsiblemente sí en cualquier GPU de consumo, aunque no se declara oficialmente.
- Opciones de despliegue: ONNX Runtime (formato nativo); el runner oficial de la Microduck Arena de Pollen Robotics.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Base | Modificación | Licencia | Resultado declarado (cm) |
|---|---|---|---|---|
| Este modelo (jrubiosainz) | a1rb4Ck/microduck-tug `099ced00` | 8 filas de `L` sustituidas por `f7f7705b` | Apache 2.0 | 167.15307235717773 (semilla 5) |
| jrubiosainz/game-tug-a1rb4ck-099c-s1-s2-s3-s4 | a1rb4Ck/microduck-tug `099ced00` | 67 filas de `L` sustituidas por búsqueda propia (semillas 1-4) | Apache 2.0 | 166.2278389930725 |
| a1rb4Ck/microduck-tug `099ced00` | — | política original | Apache 2.0 | 166.19724988937378 |
| a1rb4Ck/microduck-tug `f7f7705b` | — | revisión posterior | Apache 2.0 | 166.22851252555847 |
| rumezhak/microduck-tug-tab-v2 | — | base de la serie tab | no disponible | 165.1954472064972 |

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona en lenguaje natural y no soporta tool calling ni agentes.
- El alcance es exclusivamente el entorno Tug of War de la Microduck Arena; fuera de ese entorno la política no tiene utilidad.
- La capa `L` depende de coincidencias exactas de observación con tolerancia 1e-7; pequeñas variaciones numéricas pueden hacer que la red subyacente responda en lugar de la tabla.
- El rendimiento está fuertemente condicionado por la semilla: los resultados declarados son específicos de las semillas 1 a 5 y no garantizan comportamiento equivalente en otras.
- No se realizó entrenamiento ni búsqueda para esta modificación, por lo que no hay garantía de mejora sistemática frente a las revisiones de origen.
- El repositorio no incluye `manifest.json`, igual que el modelo de a1rb4Ck en el que se basa.
- Licencia Apache 2.0: permite uso comercial y modificaciones, pero exige conservar los avisos de atribución correspondientes a la cadena de modelos base y colaboradores citados.
- La model card no documenta sesgos, riesgos de alucinación ni limitaciones idiomáticas porque no aplican a un modelo de control.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jrubiosainz/microduck-game-tug-a1rb4ck-099c-s1-s2-s3-s4-f7f-s5
- Modelo base: https://huggingface.co/a1rb4Ck/microduck-tug
- Revisión `099ced00` del modelo base: https://huggingface.co/a1rb4Ck/microduck-tug/tree/099ced00f425f1634045cd3f92505a8d78f3df52
- Revisión `f7f7705b` del modelo base: https://huggingface.co/a1rb4Ck/microduck-tug/tree/f7f7705b
- Revisión `3a2eb4e2` del modelo base: https://huggingface.co/a1rb4Ck/microduck-tug/tree/3a2eb4e2a40073be336d00b7ca1898dc52dee352
- microduck-heist de a1rb4Ck: https://huggingface.co/a1rb4Ck/microduck-heist/tree/906d1efd4e1597c6f122f063b399effbf55a7f0e
- rumezhak/microduck-tug-tab-v2: https://huggingface.co/rumezhak/microduck-tug-tab-v2/tree/b63e35875647a44ef33ab65acf44f167a24b72d4
- littlebeanhp/microduck-tug-tab-v1: https://huggingface.co/littlebeanhp/microduck-tug-tab-v1/tree/f444e12fe6e8e530d50dc7b00ae069f13138cd9b
- Entrada previa del autor: https://huggingface.co/jrubiosainz/game-tug-a1rb4ck-099c-s1-s2-s3-s4
- Microduck Arena (Space): https://huggingface.co/spaces/pollen-robotics/microduck-arena
- Repositorio MicroDuck de Pollen Robotics: https://github.com/pollen-robotics/microduck
