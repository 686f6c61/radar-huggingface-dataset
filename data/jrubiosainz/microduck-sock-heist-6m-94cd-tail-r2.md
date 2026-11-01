# jrubiosainz/microduck-sock-heist-6m-94cd-tail-r2

## Resumen

Microduck Sock Heist 6m 94cd tail r2 es una política de control para robótica basada en tablas de búsqueda (*lookup tables*), publicada por el usuario jrubiosainz como revisión de una entrada previa para el entorno Microduck Arena. No es un modelo de lenguaje ni una red neuronal profunda entrenada de forma convencional: es un artefacto ONNX que contiene una política de control tabular derivada de la entrada `a1rb4Ck/microduck-heist` (commit `94cd2cf`), a su vez construida sobre el *walker* de juicenv. El modelo resuelve una tarea concreta de locomoción y sincronización temporal en un simulador: cruzar cuando el semáforo está en verde y congelarse cuando el gigante mira, dentro del entorno Sock Heist de Microduck Arena.

La relevancia de esta ficha es acotada y debe interpretarse con rigor: se trata de un artefacto experimental de un repositorio de 0,0 GB con cero descargas y cero *likes* en el momento de la consulta, publicado como entrada de un *benchmark* comunitario de simulación. Su interés técnico reside en el método de optimización (ventanas CMA-ES por paso sobre CPU x86) y en la trazabilidad de licencias, no en capacidades generales de IA.

La revisión r2 modifica únicamente 134 de las 1901 filas de las tablas `L_obs` y `L_act`, manteniendo idénticos el grafo, los tensores y el resto de inicializadores respecto al origen 94cd. La evaluación reportada es local, en muestra y exclusivamente sobre simulador.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política de control tabular (lookup tables `L_obs` y `L_act`) exportada como grafo ONNX; no es un transformer ni una red neuronal entrenada de forma convencional |
| Parámetros totales | No disponible (el artefacto es una tabla de 1901 filas, no un modelo con pesos densos parametrizados) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (no aplica; la política opera por paso de control) |
| Tipos de cuantización | No disponible (no se documentan cuantizaciones; el artefacto se distribuye como ONNX de precisión nativa) |
| Idiomas soportados | No disponible (no es un modelo de lenguaje) |
| Licencia | Apache-2.0 (declarada por el autor upstream a1rb4Ck; el publicador advierte que no garantiza que todos los componentes incorporados estén cubiertos) |
| Formato de pesos | ONNX (`policy.onnx`, 1.365.211 bytes, SHA256 `cb1450dafacec87cfe8c6cdb1362bb2c7500317c9a173b09157c558f41c85c90`) |

## Arquitectura y entrenamiento

El artefacto es un grafo ONNX que implementa una política de control mediante dos tablas de búsqueda, `L_obs` (observación) y `L_act` (acción). No hay atención, capas lineales densas ni mecanismo de mezcla de expertos: la política mapea observaciones discretizadas a acciones indexando filas de tabla. El grafo, las formas de los tensores y todos los inicializadores salvo las filas modificadas son idénticos a los del origen `94cd`. El repositorio no incluye `manifest.json`, igual que el origen.

El "entrenamiento" de esta revisión consistió en búsqueda por ventanas CMA-ES sobre CPU x86: ventanas de 32 pasos de control para la semilla 3 y de 52 pasos para la semilla 4. La búsqueda de la semilla 4 se orientó a un cruce antes del segundo periodo de vigilancia, no a la meta posterior al semáforo rojo. Las observaciones x86 registradas se usaron como nuevas claves de tabla. Se conservan los cambios de la revisión r1 en las semillas 1 y 5; la semilla 2 no se modificó. No se copiaron filas ni pesos de la entrada posterior 906d. Las filas alteradas, con indexación basada en cero sobre el origen, son: semilla 1, 358-373; semilla 3, 1039-1072; semilla 4, 1331-1382 y 1450-1465; semilla 5, 1884-1899.

## Capacidades

- Control de locomoción y temporización en el entorno Sock Heist de Microduck Arena: avanzar con semáforo verde y detenerse ante la mirada del gigante.
- Ejecución sobre cinco tablas horarias oficiales (semillas 1 a 5) con resultados de finalización reportados.
- Inferencia vía runtime ONNX en CPU x86, sin requisito de GPU documentado.
- Enmascaramiento de la orden de velocidad: la tabla oculta el comando de velocidad, según la model card.
- No soporta *tool calling*, *function calling*, razonamiento multi-paso, agentes, visión, audio ni capacidades multilingües.
- No es un modelo generativo: no produce texto ni código.

## Casos de uso

- Evaluación de entradas en Microduck Arena: usar `policy.onnx` como participante en el *runner* oficial 0.7.0 para reproducir los tiempos reportados en las cinco tablas oficiales.
- Investigación de optimización por ventanas CMA-ES: emplear esta revisión como caso de estudio de búsqueda local sobre tablas de control con ventanas de 32 y 52 pasos en CPU x86.
- Reproducibilidad de artefactos: verificar el SHA256 del ONNX y comparar las 134 filas modificadas frente al origen `94cd` para auditar la trazabilidad de cambios.
- Docencia sobre control reactivo: ilustrar políticas tabulares de percepción-acción en robótica simulada sin dependencia de GPU.
- Pruebas de regresión de simuladores: comparar tiempos por semilla (5,51 s a 7,955 s) frente a revisiones previas para detectar cambios de comportamiento del simulador.
- Auditoría de licencias en artefactos derivados: analizar el `NOTICE` y la sección 4 de Apache-2.0 como ejemplo de cumplimiento en obras derivadas con procedencia parcialmente incierta.

## Benchmarks y rendimiento

Resultados reportados por el autor con el *runner* oficial Microduck Arena 0.7.0 en x86 a velocidad de comando `1.2` (resultados locales, en muestra, no constituyen una aceptación oficial de la Arena):

| Semilla | Resultado | Tiempo (s) |
|---|---|---|
| 1 | finalizado | 6,975 |
| 2 | finalizado | 7,390 |
| 3 | finalizado | 5,51 |
| 4 | finalizado | 5,62 |
| 5 | finalizado | 7,955 |
| Media | 5 de 5 finalizados | 6,69 |

No se han publicado resultados de benchmarks en la información disponible más allá de esta tabla.

## Requisitos de hardware

- Inferencia en CPU x86: el autor reporta evaluación y búsqueda CMA-ES en x86; el artefacto ONNX de 1.365.211 bytes es ejecutable sin GPU.
- VRAM estimada: no disponible; no se documenta uso de GPU.
- GPU recomendadas: no disponible; no se documenta ninguna.
- Compatibilidad con GPU de consumo: no disponible; el artefacto está pensado para CPU.
- Opciones de despliegue: runtime ONNX (por ejemplo, ONNX Runtime) y el *runner* oficial de Microduck Arena 0.7.0.
- Latencia y *throughput*: no disponibles; los tiempos de 5,51 s a 7,955 s corresponden a la duración de la tarea por semilla en el simulador, no a latencia de inferencia por paso.

## Comparativa con modelos similares

| Modelo | Tipo | Filas/tamaño | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| microduck-sock-heist-6m-94cd-tail-r2 (este) | Política tabular ONNX | 1901 filas; ONNX de 1.365.211 bytes | No aplica | 5/5 finalizados; media 6,69 s (local, en muestra) | Apache-2.0 (con reservas sobre componentes de terceros) | HuggingFace, 0 descargas |
| a1rb4Ck/microduck-heist @94cd | Política tabular ONNX (origen) | 1364.816 bytes | No aplica | No disponible en la información | Apache-2.0 declarada | HuggingFace |
| lphatnguyen/microduck-sock-heist-6m-v3 | Política tabular (posible componente upstream) | No disponible | No aplica | No disponible | Sin licencia declarada | HuggingFace |
| Entrada 906d (posterior) | Política tabular | No disponible | No aplica | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Resultados en muestra: la evaluación cubre solo las cinco tablas horarias oficiales; no se reclama generalización a otros inicios, tablas horarias ni máquinas.
- Solo simulador: la entrada no está validada para hardware físico.
- La tabla enmascara la orden de velocidad, lo que limita la interpretabilidad del control.
- Procedencia parcialmente incierta: el autor advierte que no ha establecido de forma independiente la procedencia ni la licencia de todos los componentes; el upstream de juicenv y el posible componente de lphatnguyen (sin licencia) no están cubiertos por la extensión de Apache-2.0.
- Riesgo de retirada: el autor se compromete a retirar la entrada si un autor upstream objeta.
- Sin `manifest.json`: igual que el origen, lo que puede dificultar la validación en pipelines que lo requieran.
- Cero tracción comunitaria: 0 descargas y 0 *likes* en la consulta; sin validación independiente.
- Sin datos de sesgo, alucinación o multilingüismo aplicables: no es un modelo de lenguaje.
- La model card indica que un asistente de IA ayudó a preparar la búsqueda, la publicación y la propia card.

## Enlaces

- HuggingFace: https://huggingface.co/jrubiosainz/microduck-sock-heist-6m-94cd-tail-r2
- Origen upstream: https://huggingface.co/a1rb4Ck/microduck-heist (commit `94cd2cfeb57a4ece561a3d320e233f442238cb81`)
- juicenv: https://huggingface.co/juicenv
- lphatnguyen / microduck-sock-heist-6m-v3: https://huggingface.co/lphatnguyen/microduck-sock-heist-6m-v3/tree/194c8a05d958c6e6337b0b27804f4f783697a1ce
- Pollen Robotics / MicroDuck: https://github.com/pollen-robotics/microduck
- Microduck Arena (Space): https://huggingface.co/spaces/pollen-robotics/microduck-arena
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0.txt
