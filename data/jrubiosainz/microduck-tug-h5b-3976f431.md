# jrubiosainz/microduck-tug-h5b-3976f431

## Resumen

Microduck-tug-h5b-3976f431 es una política de control para robótica de simulación publicada por el usuario jrubiosainz en HuggingFace, orientada al entorno competitivo Microduck Arena, concretamente a la modalidad Tug of War (tira y afloja). No se trata de un modelo de lenguaje ni de un transformer generativo: es un grafo ONNX de pequeño tamaño (1.094.720 bytes) que produce acciones de control a partir de observaciones del simulador. Su interés es acotado y muy específico: sirve como entrada de referencia en una competición de simulación y como ejemplo de técnica de *overlay* sobre una política existente.

El modelo se construye sobre la política `jrubiosainz/microduck-tug-quicksilver-v14-h2-63aab429` (revisión `d8ec37ed`, SHA-256 `63aab429…`), cuyo grafo se preserva íntegro. La modificación consiste en añadir una tabla de búsqueda (*lookup*) de 346 filas con prefijo de inicializador `search6_`, que compara los primeros 48 valores de observación con tolerancia 1e-7 y, en caso de coincidencia, emite una acción almacenada; en caso contrario, delega en el grafo heredado. El autor declara explícitamente que no ha entrenado pesos nuevos.

La relevancia es, por tanto, metodológica y de competición, no de aplicación general. El propio autor advierte que no es un controlador de locomoción general ni una política para robot físico, y que se trata de un *replay* in-sample de cinco arranques de simulación declarados. Cualquier evaluación de sus capacidades debe hacerse con ese marco en mente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Grafo ONNX de política de control (no transformer); grafo heredado más tabla de búsqueda `search6_` de 346 filas |
| Parámetros totales | no disponible (pesos en fichero de 1.094.720 bytes; recuento de parámetros no publicado) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; observación de entrada comparada en sus primeros 48 valores |
| Tipos de cuantizacion | no disponible (formato ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (modelo de control robótico, sin procesamiento de lenguaje) |
| Licencia | no disponible (el autor indica que no asume licencia sobre las obras acreditadas y remite a los hechos de licencia de cada repositorio fijado) |
| Formato de pesos | ONNX (grafo con inicializadores; política de 1.094.720 bytes) |

## Arquitectura y entrenamiento

La arquitectura es un grafo ONNX de política de control heredado de `microduck-tug-quicksilver-v14-h2` (revisión `d8ec37ed`, SHA-256 `63aab429c8c06e9ec389bd3d54c520e3d9f7057719dcba780c47904ddaa33fb5`, 989.948 bytes). El autor preserva todos los inicializadores heredados byte a byte y todos los nodos heredados sin cambios, salvo el nodo que produce la salida del grafo, que ahora escribe `search6_fallback` y alimenta la nueva tabla de búsqueda. La tabla se añadió con la función `overlay()` de `search_race.py` de HlibPlakhtii (SHA-256 `2003778b…`), con prefijo de inicializador `search6_` y 346 filas.

No hubo entrenamiento de pesos: el autor afirma explícitamente que no se entrenaron ni modificaron pesos de red, ni física, ni árbitro, ni servidor, ni datos de clasificación. Las filas de la tabla son grabaciones completas de los cinco combates oficiales de clasificación, realizadas con la física sin modificar de la Arena en Linux x86_64. Las semillas 1-4 provienen de búsquedas propias ejecutando `search_tug.py` de HlibPlakhtii (SHA-256 `6bcbfde1…`, sin modificar y no redistribuido); cada grabación arranca con filas de una tabla pública y continúa con filas registradas nativamente del combate encontrado. La semilla 5 es la grabación de la ejecución pública de replay. La innovación técnica, por tanto, no es arquitectónica sino de *memorización selectiva*: un mecanismo de coincidencia exacta sobre observaciones que sustituye la decisión de la red por una acción grabada cuando el estado coincide.

## Capacidades

- Control de política en el simulador Microduck Arena, modalidad Tug of War, para los cinco arranques de simulación declarados (semillas oficiales 1-5).
- Coincidencia de observaciones: compara los primeros 48 valores de observación con tolerancia 1e-7 y, en caso de coincidencia, emite la acción almacenada en la tabla.
- *Fallback* al grafo heredado: si no hay coincidencia, la política base `microduck-tug-quicksilver-v14-h2` decide la acción.
- Reproducción bit a bit de la ejecución pública `01M6KKCH7V68ZWJP66CBHK` en la semilla 5.
- No soporta *tool calling*, ni function calling, ni agentes multi-paso, ni razonamiento, ni generación de texto, ni visión, ni audio, ni capacidades multilingües.
- No es un controlador de locomoción general ni una política para robot físico.

## Casos de uso

- Replay de referencia en la Arena: usar el modelo para reproducir de forma determinista la ejecución pública `01M6KKCH7V68ZWJP66CBHK` en la semilla 5, gracias a que la tabla contiene la grabación completa de esa ejecución y el autor verifica la reproducción bit a bit.
- Evaluación comparativa de políticas Tug of War: emplear las puntuaciones nativas declaradas (media de 167,5034737586975 cm con cinco victorias por pozo) como línea base frente a otras políticas del mismo entorno, teniendo en cuenta que las semillas 1-4 no tienen resultado público en la Arena.
- Estudio de técnicas de *overlay*: analizar cómo la función `overlay()` de `search_race.py` permite añadir una tabla de búsqueda sobre un grafo ONNX existente sin alterar inicializadores ni nodos heredados, como caso didáctico de modificación no destructiva de políticas.
- Verificación de reproducibilidad en simulación: comprobar la sensibilidad del replay exacto a la reproducción en coma flotante, comparando trazas nativas con las de la Arena, tal como el autor hace en su comprobación de 12 combates de copa con semillas hasheadas.
- Integración en pipelines de evaluación de la Arena: cargar el grafo ONNX con la librería `microduck` y el *pipeline* `robotics` para ejecutar los cinco arranques declarados dentro de un banco de pruebas automatizado.
- Auditoría de procedencia de datos: inspeccionar las 346 filas y sus rangos (k0-k64, k65-k134, k135-k206, k207-k276, k277-k345) para rastrear qué filas provienen de tablas públicas de HlibPlakhtii y greecree y cuáles de búsquedas propias (`w2h5_s1c`, `w2h5_s2a`, `w2h5_s3a`, `w2h5_s4b`).

## Benchmarks y rendimiento

Resultados nativos declarados por el autor (evaluación nativa con árbol fijado de Arena 0.7.0, runner 5, comando `vx -0.3` elegido por el evaluador). No son el resultado oficial de la Arena salvo donde se indica.

| Semilla | Filas | Origen de la tabla | Puntuación nativa (cm) | Tiempo (s) | Resultado público en Arena |
|---|---|---|---|---|---|
| 1 | 65 | k0-k64; filas 0-39 de HlibPlakhtii v16 `fd237b1e` + 25 propias (`w2h5_s1c`) | 166,8207347393036 | 0,8 | No disponible |
| 2 | 70 | k65-k134; filas 65-116 de greecree v9 `cb4f2e75` + 18 propias (`w2h5_s2a`) | 168,9721643924713 | 0,9 | No disponible |
| 3 | 72 | k135-k206; filas 135-188 de greecree v9 `cb4f2e75` + 18 propias (`w2h5_s3a`) | 166,5897011756897 | 0,94 | No disponible |
| 4 | 70 | k207-k276; filas 207-250 de greecree v9 `cb4f2e75` + 26 propias (`w2h5_s4b`) | 167,6494598388672 | 0,9 | No disponible |
| 5 | 69 | k277-k345; ejecución pública `01M6KKCH7V68ZWJP66CBHK` | 167,48530864715576 | no disponible | Sí, reproducida bit a bit |

Media nativa declarada: 167,5034737586975 cm con cinco victorias por pozo. La política base `jrubiosainz/microduck-tug-quicksilver-v14-h2-63aab429` obtiene 166,6911780834198 cm en la misma llamada, igual a su resultado público en la Arena. Frente a esa ejecución, las semillas mejoran así: semilla 1 de 165,88760018348694 a 166,8207347393036 cm; semilla 2 de 166,77944660186768 a 168,9721643924713 cm; semilla 3 de 166,4285659790039 a 166,5897011756897 cm; semilla 4 de 166,87496900558472 a 167,6494598388672 cm.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, y no procede aplicarlos a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el fichero de política ocupa 1.094.720 bytes (aproximadamente 1,04 MiB en disco), por lo que la huella de memoria es muy reducida y no se publican cifras de VRAM.
- GPU recomendadas: no disponibles. El autor documenta ejecuciones en Linux x86_64 con la física sin modificar de la Arena; no se especifica hardware gráfico.
- Compatibilidad con GPU de consumo: no disponible. Por el tamaño del grafo es plausible que quepa en cualquier GPU de consumo, pero no hay dato publicado que lo confirme.
- Opciones de despliegue: librería `microduck` con *pipeline* `robotics` y formato ONNX; el autor menciona el árbol fijado de Arena 0.7.0 y el runner 5. No se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: los tiempos nativos declarados por combate son 0,8 s (semilla 1), 0,9 s (semilla 2), 0,94 s (semilla 3) y 0,9 s (semilla 4); para la semilla 5 no se publica tiempo. No se publica throughput.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jrubiosainz/microduck-tug-h5b-3976f431 (este) | no disponible (1.094.720 bytes) | no aplica; 48 valores de observación | Media nativa 167,5034737586975 cm; semilla 5 reproduce ejecución pública `01M6KKCH7V68ZWJP66CBHK` | no disponible | HuggingFace, 0 descargas, 0 likes |
| jrubiosainz/microduck-tug-quicksilver-v14-h2-63aab429 (base) | no disponible (989.948 bytes) | no aplica | 166,6911780834198 cm en la misma llamada, igual a su resultado público | no disponible | HuggingFace |
| HlibPlakhtii/microduck-tug-quicksilver-v16 | no disponible | no aplica | no disponible | no disponible | HuggingFace (revisión `fd237b1e`) |
| greecree/microduck-tug-of-war-tug-super-v9 | no disponible | no aplica | no disponible | no disponible | HuggingFace (revisión `cb4f2e75`) |

## Limitaciones y advertencias

- Replay in-sample: la tabla contiene las grabaciones de los cinco arranques de simulación declarados, por lo que el rendimiento fuera de esos estados depende únicamente del grafo heredado y no de la tabla.
- Sensibilidad a coma flotante: el autor advierte que la reproducción exacta es sensible a la reproducción en coma flotante; la coincidencia exige tolerancia 1e-7 en los primeros 48 valores de observación.
- Resultados no oficiales: las semillas 1, 2, 3 y 4 no tienen resultado público en la Arena; sus puntuaciones son resultados nativos propios del autor, no validados por la clasificación pública.
- Sin entrenamiento propio: el autor declara que no entrenó la red; el modelo es una política pública con una tabla de búsqueda añadida.
- No es un controlador general: no es un controlador de locomoción general ni una política para robot físico; el autor prohíbe explícitamente ejecutarlo en un robot real.
- Solo simulación: la model card indica que es una entrada para la Microduck Arena, para simulación únicamente.
- Licencia incierta: no se declara licencia; el autor indica que no asume licencia sobre las obras acreditadas (HlibPlakhtii, greecree, Pollen Robotics y los autores de los avisos preservados) y remite a los hechos de licencia de cada repositorio fijado. Esto supone un riesgo para uso comercial.
- Procedencia mixta de datos: parte de las filas provienen de tablas públicas de terceros (HlibPlakhtii v16 y greecree v9), lo que condiciona la redistribución.
- Sesgos y alucinación: no aplica en el sentido habitual de modelos de lenguaje; el riesgo equivalente es la coincidencia espuria de observaciones o la dependencia excesiva de estados memorizados.
- Idiomas: no disponible; el modelo no procesa lenguaje.
- Madurez: repositorio de 0,0 GB, 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el 2026-11-05.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jrubiosainz/microduck-tug-h5b-3976f431
- Modelo base: https://huggingface.co/jrubiosainz/microduck-tug-quicksilver-v14-h2-63aab429/tree/d8ec37ed882a33231aa8da0da07b75cb7e21608b
- HlibPlakhtii/microduck-tug-quicksilver-v16 (revisión `fd237b1e`): https://huggingface.co/HlibPlakhtii/microduck-tug-quicksilver-v16/tree/fd237b1e35708ec3610e5bb336eeab37d0d4962c
- HlibPlakhtii/microduck-tug-quicksilver-v14 (origen de `search_race.py`): https://huggingface.co/HlibPlakhtii/microduck-tug-quicksilver-v14/tree/a2f41160287beb86c23e287030a69f4e2226180f
- greecree/microduck-tug-of-war-tug-super-v9 (revisión `cb4f2e75`): https://huggingface.co/greecree/microduck-tug-of-war-tug-super-v9/tree/cb4f2e7534999b240bb5d6e652e3af80b97bb33a
