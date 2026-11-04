# jrubiosainz/microduck-tug-h3-bd6717b3

## Resumen

Microduck Tug of War - h3 (identificador `bd6717b3`) es una política de control para robótica simulada publicada por el usuario jrubiosainz en HuggingFace, concebida como entrada para la competición **Microduck Arena Tug of War**. No se trata de un modelo de lenguaje ni de un transformer generativo: es una red neuronal exportada a ONNX que actúa como política de control dentro de un entorno de simulación física, y que se distribuye bajo la librería `microduck` con `pipeline_tag: robotics`.

El modelo no ha sido entrenado desde cero por el autor. Se construye como un *finetune* (en realidad, una modificación estructural sin reentrenamiento) sobre `jrubiosainz/microduck-tug-quicksilver-v14-h2-63aab429`, en la revisión `d8ec37ed`. Sobre el grafo heredado se añade una tabla de búsqueda (*lookup*) de 360 filas que memoriza las acciones exactas registradas en los cinco combates oficiales de clasificación de la Arena, de modo que si la observación entrante coincide con una de las almacenadas (comparando los primeros 48 valores con tolerancia 1e-7), el modelo reproduce la acción guardada; en caso contrario, delega en el grafo original.

Su relevancia es, por tanto, acotada y muy específica: documenta una técnica de *replay* exacto sobre un simulador determinista y sirve como ejemplo de ingeniería de grafos ONNX y de evaluación reproducible en entornos de competición. El repositorio ocupa 0.0 GB según los metadatos, con un fichero de política de 1.098.920 bytes. No hay información sobre arquitectura interna, parámetros, contexto ni idiomas, ya que no son conceptos aplicables a este tipo de artefacto.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de política exportada a ONNX (grafo heredado de `microduck-tug-quicksilver-v14-h2`) con tabla de búsqueda `search6_` de 360 filas añadida |
| Parametros totales | no disponible (pesos heredados byte-idénticos; tamaño del fichero de política: 1.098.920 bytes) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; la observación se compara sobre los primeros 48 valores) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica) |
| Licencia | Apache-2.0 solo para las contribuciones heredadas, según `NOTICE`; no se añade licencia propia y no cubre el modelo combinado completo |
| Formato de pesos | ONNX (librería `microduck`) |

## Arquitectura y entrenamiento

El artefacto es un grafo ONNX cuya totalidad procede de `jrubiosainz/microduck-tug-quicksilver-v14-h2-63aab429` (revisión `d8ec37ed`, SHA-256 de política `63aab429…`, 989.948 bytes). Todos los inicializadores heredados son byte-idénticos y todos los nodos heredados se mantienen sin cambios, salvo el nodo que produce la salida del grafo, que ahora escribe en `search6_fallback` y alimenta la nueva tabla de búsqueda. La modificación se realizó con la función `overlay()` de `search_race.py` de HlibPlakhtii (SHA-256 `2003778b…`), con prefijo de inicializador `search6_`.

No hubo entrenamiento: el autor declara explícitamente que no se entrenaron ni modificaron pesos de red, ni se alteraron física, árbitro, servidor o datos de clasificación. La tabla añadida contiene las grabaciones completas de los cinco combates oficiales de clasificación (semillas 1 a 5, con 101, 58, 72, 60 y 69 filas respectivamente, hasta un total de 360), generadas con la física sin modificar de la Arena en x86_64 Linux. En una comprobación nativa con 12 combates de copa de semillas con hash (ambos lados, 3 oponentes), el candidato y la red sin modificar produjeron el mismo resultado y trazas bit a bit idénticas en todos los casos.

## Capacidades

- Control de política en simulación para la prueba Tug of War de Microduck Arena, con salida de acción discreta (comando `vx -0.3` elegido por el evaluador en la repetición nativa).
- Reproducción exacta (*replay*) de los cinco combates oficiales de clasificación declarados, bit a bit, cuando la observación coincide con las filas almacenadas.
- Fallback al grafo heredado cuando no hay coincidencia en la tabla, preservando el comportamiento original de la política base.
- Comparación de observaciones con tolerancia de coma flotante de 1e-7 sobre los primeros 48 valores.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, multilingüismo, visión, audio ni modo *thinking*: no es un modelo de lenguaje.
- No es un controlador de locomoción general ni una política para robot físico.

## Casos de uso

- Replay determinista en competiciones de simulación: sirve para reproducir exactamente los combates registrados en la Arena y verificar resultados de clasificación sin depender de la variabilidad del servidor.
- Auditoría de evaluaciones: al comparar la traza nativa con la pública, permite comprobar que un resultado de leaderboard es reproducible bit a bit bajo la misma física y versión del runner.
- Estudio de técnicas de *overlay* en grafos ONNX: el repositorio documenta cómo añadir una tabla de búsqueda a un grafo existente sin reentrenar, útil como referencia de ingeniería para investigadores que trabajen con modelos exportados.
- Docencia sobre evaluación reproducible: ejemplo concreto de cómo una modificación *in-sample* mejora la puntuación en semillas conocidas (de 166,4286 a 166,5360 cm en la semilla 3; de 166,8750 a 166,8968 cm en la semilla 4) sin generalizar.
- Pruebas de regresión de simuladores: los 12 combates de copa con trazas bit-idénticas sirven como conjunto de verificación para detectar cambios no intencionados en la física o en el runner.
- Referencia de buenas prácticas de licenciamiento: el fichero `NOTICE` y la separación entre Apache-2.0 heredada y modelo combinado ilustran cómo documentar procedencia en artefactos derivados.

## Benchmarks y rendimiento

Los datos disponibles son resultados de la competición, no benchmarks estándar de ML. Se presentan tal cual:

| Semilla oficial | Filas | Filas de tabla | Política registrada | Puntuación (cm) |
|---|---|---|---|---|
| 1 | 101 | k0-k100 | quicksilver-v14-h2 `d8ec37ed` | 165,88760018348694 |
| 2 | 58 | k101-k158 | quicksilver-v14-h2 `d8ec37ed` | 166,77944660186768 |
| 3 | 72 | k159-k230 | greecree/tug-super-v8 `af686868` | 166,53597950935364 |
| 4 | 60 | k231-k290 | greecree/tug-super-v8 `af686868` | 166,89677238464355 |
| 5 | 69 | k291-k359 | quicksilver-v14-h2 `d8ec37ed` | 167,48530864715576 |

Repetición nativa (Arena 0.7.0, runner 5, comando `vx -0.3`): media de **166,7170214653015 cm** con cinco victorias por foso. La política base `quicksilver-v14-h2` obtiene 166,6911780834198 cm en la misma llamada. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, y no serían aplicables a este artefacto.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el fichero de política pesa 1.098.920 bytes (~1,1 MB), por lo que la huella de memoria es mínima y cabe en cualquier GPU, CPU o incluso en entornos embebidos.
- GPU recomendadas: no se especifican; cualquier GPU con soporte ONNX Runtime es suficiente. No se requiere A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: sí, con margen amplio, dado el tamaño del grafo.
- Opciones de despliegue: ONNX Runtime (formato nativo del artefacto) y el runner de Microduck Arena 0.7.0 con árbol fijado (*pinned tree*). No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. El coste dominante es la comparación de 48 valores frente a 360 filas, más la inferencia del grafo heredado en caso de fallback.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Entrenamiento propio | Modificación | Licencia | Puntuación nativa (cm) |
|---|---|---|---|---|---|---|
| `jrubiosainz/microduck-tug-h3-bd6717b3` (este) | Política ONNX + lookup | no disponible | No | Overlay de 360 filas | Apache-2.0 parcial (heredada) | 166,7170 |
| `jrubiosainz/microduck-tug-quicksilver-v14-h2-63aab429` | Política ONNX | no disponible | No disponible | Ninguna | Apache-2.0 | 166,6912 |
| `greecree/microduck-tug-of-war-tug-super-v8` | Política de simulación | no disponible | No disponible | Ninguna | no disponible | no disponible (solo se usan sus grabaciones de las semillas 3 y 4) |

La comparación se limita a los artefactos citados en la documentación. No hay datos públicos de parámetros, contexto ni rendimiento general para estos modelos, por lo que la comparativa se reduce a la puntuación en la prueba Tug of War y a la naturaleza de la modificación.

## Limitaciones y advertencias

- **Replay in-sample**: la mejora procede de memorizar las cinco semillas declaradas; no hay evidencia de generalización a semillas no vistas. El propio autor lo califica de *in-sample replay*.
- **Sensibilidad a coma flotante**: la reproducción exacta depende de la reproducibilidad de la aritmética de coma flotante; cambios de plataforma, compilador o versión del runner pueden romper la coincidencia.
- **Sin entrenamiento**: no se entrenaron ni modificaron pesos; el modelo no aporta capacidad nueva más allá de la tabla añadida.
- **No es un controlador general**: no debe usarse como política de locomoción general ni ejecutarse en un robot físico, advertencia explícita del autor.
- **Licencia ambigua para uso comercial**: Apache-2.0 se aplica solo a las contribuciones heredadas según `NOTICE`, no al modelo combinado; el autor no añade licencia propia, por lo que el uso comercial del artefacto completo queda sin cobertura clara.
- **Procedencia múltiple**: incorpora material de greecree, HlibPlakhtii y Pollen Robotics, con obligaciones de atribución descritas en `NOTICE`.
- **Sin datos de sesgo, alucinación o idioma**: no aplican conceptos de sesgo lingüístico, pero tampoco hay evaluación de robustez frente a perturbaciones de la observación más allá de la tolerancia de 1e-7.
- **Metadatos incompletos**: el repositorio declara 0 descargas y 0 likes, tamaño de 0.0 GB y ausencia de licencia e idiomas en los tags de HuggingFace.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jrubiosainz/microduck-tug-h3-bd6717b3
- Modelo base: https://huggingface.co/jrubiosainz/microduck-tug-quicksilver-v14-h2-63aab429/tree/d8ec37ed882a33231aa8da0da07b75cb7e21608b
- Repositorio de HlibPlakhtii (código `search_race.py`): https://huggingface.co/HlibPlakhtii/microduck-tug-quicksilver-v14/tree/a2f41160287beb86c23e287030a69f4e2226180f
- Repositorio de greecree (grabaciones de las semillas 3 y 4): https://huggingface.co/greecree/microduck-tug-of-war-tug-super-v8/tree/af68686876537cfcfea691126d108fb7ba585fe9
- Paper, blog o demo adicionales: no disponibles en la información proporcionada.
