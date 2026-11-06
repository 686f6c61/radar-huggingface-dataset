# jrubiosainz/microduck-game-tug-a1rb4ck-099c-s1-s2-s3-s4

## Resumen

`microduck-game-tug-a1rb4ck-099c-s1-s2-s3-s4` es una política de control para el evento Tug of War de la Microduck Arena, un entorno de competición de robótica de código abierto mantenido por Pollen Robotics. Lo publica el usuario de Hugging Face jrubiosainz y deriva directamente de la política `a1rb4Ck/microduck-tug` en su revisión `099ced00`, publicada bajo licencia Apache 2.0. No se trata de un modelo de lenguaje: es un artefacto de inferencia en formato ONNX que encapsula una política de reinforcement learning para un robot tipo MicroDuck.

La modificación es quirúrgica y de naturaleza tabular. El fichero original contiene una capa de búsqueda externa, denominada `L`, con 508 filas que memorizan observaciones y acciones; si los primeros 48 de los 61 valores de observación coinciden con una fila almacenada con tolerancia 1e-7, se devuelve la acción guardada y, en caso contrario, responde la red neuronal subyacente. Esta variante sustituye 67 filas de `L` por filas obtenidas mediante búsqueda CMA-ES sobre los episodios de las semillas 1, 2, 3 y 4. El grafo, la red por debajo de `L` y el resto de inicializadores son idénticos byte a byte al fichero del autor original.

Su relevancia es acotada pero concreta: documenta una técnica de mejora de políticas mediante edición de tablas de búsqueda sin reentrenamiento de pesos, y sirve como entrada reproducible para la Arena. El repositorio ocupa 0,0 GB, no tiene descargas ni likes, y no incluye `manifest.json`, igual que el repositorio del que deriva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de RL con capa de búsqueda tabular `L` (508 filas) sobre red neuronal preentrenada; exportada como grafo ONNX |
| Parametros totales | no disponible (no se documenta el recuento; el peso está en el grafo ONNX de la red subyacente) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible; la observación de entrada es un vector de 61 valores, de los cuales los 48 primeros alimentan la búsqueda en `L` |
| Tipos de cuantizacion | no disponible; se distribuye como `policy.onnx` |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`policy.onnx`) |

## Arquitectura y entrenamiento

La política combina dos mecanismos en cascada. El primero es una tabla de búsqueda `L` de 508 filas que actúa como capa externa: compara los 48 primeros componentes del vector de observación de 61 dimensiones contra sus filas almacenadas y, si hay coincidencia dentro de 1e-7, emite la acción asociada. El segundo es una red neuronal preentrenada que responde cuando no hay coincidencia; según la model card, esa red es byte-idéntica a la del modelo `a1rb4Ck/microduck-heist`, construida a su vez sobre el walker de juicenv. No se ha entrenado ni modificado ningún peso de red en esta variante.

La modificación consiste en eliminar las filas 89-100, 149-179, 330-341 y 427-438 (indexadas desde 0) de `L` y añadir 67 filas nuevas al final, preservando el orden del resto. Las filas añadidas provienen de una búsqueda CMA-ES ejecutada sobre la parte final de las acciones de un episodio contra el pato de referencia congelado, usando el runner de Tug of War de la Arena en una máquina x86_64. Para la semilla 2, el punto de partida es el episodio de la semilla 2 de la entrada anterior `game-tug-a1rb4ck-s3-s5` (que a su vez reproduce el episodio de la revisión `3a2eb4e2` del autor original) hasta el paso 55; para las semillas 1, 3 y 4, el punto de partida es el propio episodio del autor original hasta los pasos 89, 150 y 85 respectivamente.

## Capacidades

- Control de robot MicroDuck en el evento Tug of War de la Microduck Arena, con política determinista expresada como grafo ONNX.
- Memorización y reproducción exacta de trayectorias de acción mediante la tabla `L`, con fallback a la red neuronal cuando la observación no coincide.
- Generalización limitada a observaciones no vistas a través de la red subyacente heredada del modelo base.
- Ejecución en CPU x86_64 sin requisitos de GPU, según la metodología de evaluación descrita por el autor.
- No soporta tool calling, function calling, razonamiento multi-paso, generación de texto, visión, audio ni capacidades multilingües: es una política de control motriz, no un modelo generativo.
- No incluye modo thinking ni decodificación especulativa.

## Casos de uso

- Competición en la Microduck Arena: la política se carga como `policy.onnx` en el runner de Tug of War y compite contra el pato de referencia con el comando del evento (vx −0,3); es su uso previsto y el único documentado por el autor.
- Investigación en optimización de políticas tabulares: sirve como caso de estudio de mejora de rendimiento mediante sustitución de filas de una capa de búsqueda con búsqueda CMA-ES, sin reentrenar la red, útil para estudiar métodos híbridos memoria-red.
- Reproducción de experimentos de RL en robótica: el autor documenta la función de evaluación (`arena.evaluate.evaluate` de la Arena 0.7.0) y los pasos de coincidencia por semilla, lo que permite replicar los resultados en una máquina x86_64.
- Benchmarking de técnicas de edición de políticas: al conservar la red byte-idéntica al modelo base, permite aislar el efecto de la edición tabular frente a cambios de pesos en comparaciones controladas.
- Docencia en sistemas de control con memoria explícita: la separación entre tabla de búsqueda y red de respaldo ilustra de forma tangible arquitecturas híbridas de memoria y generalización en robótica de bajo coste.
- Base para futuras entradas de la Arena: el propio autor la presenta como extensión de `game-tug-a1rb4ck-099c-s2`, de modo que sirve como punto de partida para nuevas ediciones de semillas adicionales.

## Benchmarks y rendimiento

Los únicos datos publicados son las puntuaciones de replay del propio autor con la función de evaluación de la Arena 0.7.0, comparando su fichero con el del autor original por semilla:

| Semilla | Coincidencia con el fichero original hasta el paso | Puntuación original (cm) | Puntuación de este fichero (cm) |
|---|---|---|---|
| 1 | 89 | 165,88658690452576 | 165,88760018348694 |
| 2 | 48 | 165,82584381103516 | 165,97312092781067 |
| 3 | 150 | 165,59808254241943 | 165,59937596321106 |
| 4 | 85 | 166,53864979743958 | 166,5420114994049 |

La semilla 5 puntúa exactamente igual que el fichero original en el replay del autor. Como referencia, la model card cita la ejecución valorada del modelo base (`01M6C7BQG0VKY44AZ3S7EY`) con 166,19724988937378 cm y 5 de 5 pits ganados. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) porque no aplican a este tipo de artefacto.

## Requisitos de hardware

- Inferencia en CPU x86_64: el autor ejecuta la evaluación en una máquina virtual x86_64, sin mención de GPU.
- VRAM estimada: no disponible; el repositorio ocupa 0,0 GB y el grafo ONNX es de tamaño reducido, por lo que la inferencia cabe holgadamente en memoria de sistema convencional.
- GPU recomendadas: no disponible; no se documenta aceleración por GPU.
- Compatibilidad con GPU de consumo: previsiblemente sí por el reducido tamaño del grafo, aunque no está documentado explícitamente.
- Opciones de despliegue: ONNX Runtime es el runtime implícito por el formato; el runner de Tug of War de la Microduck Arena es el entorno de ejecución previsto. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento (cm, media de semillas publicadas) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `jrubiosainz/microduck-game-tug-a1rb4ck-099c-s1-s2-s3-s4` (este) | no disponible | vector de observación de 61 valores | 165,89 / 165,97 / 165,60 / 166,54 (semillas 1-4) | Apache 2.0 | Hugging Face, 0 descargas |
| `a1rb4Ck/microduck-tug` (base, rev. `099ced00`) | no disponible | vector de observación de 61 valores | 165,89 / 165,83 / 165,60 / 166,54 (semillas 1-4); 166,20 en ejecución valorada | Apache 2.0 | Hugging Face |
| `jrubiosainz/microduck-game-tug-a1rb4ck-099c-s2` (entrada previa) | no disponible | vector de observación de 61 valores | modifica solo la semilla 2 | Apache 2.0 | Hugging Face |
| `rumezhak/microduck-tug-tab-v2` (rev. `b63e3587`) | no disponible | vector de observación de 61 valores | 165,1954472064972 en ejecución valorada | no disponible en la información proporcionada | Hugging Face |

La comparación se limita a políticas del mismo evento Tug of War de la Microduck Arena; no hay modelos de lenguaje comparables porque el artefacto no lo es.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al ser una política de control determinista, el riesgo de sesgo se traslada a comportamientos concretos en el entorno físico, no evaluados en la model card.
- Riesgo de alucinación: no aplica en el sentido generativo, pero la tabla `L` puede reproducir acciones memorizadas inadecuadas si la observación coincide dentro de 1e-7 con una fila almacenada en un contexto distinto al del episodio original.
- Limitación de generalización: la mejora es específica de las semillas 1-4 y del pato de referencia congelado; no hay evidencia de transferencia a otras semillas, variantes del entorno o rivales distintos.
- Dependencia del entorno: los resultados se obtuvieron con la función de evaluación de la Arena 0.7.0 y el runner de Tug of War; cambios de versión pueden alterar las puntuaciones.
- Ausencia de `manifest.json`: igual que el repositorio base, lo que puede complicar la integración con herramientas que lo esperen.
- Licencia: Apache 2.0 permite uso comercial, pero se heredan las obligaciones de atribución de la cadena de modelos base citada en los créditos (a1rb4Ck, rumezhak, littlebeanhp, HlibPlakhtii, juicenv, Pollen Robotics y otros).
- Caveat de producción: el modelo no ha sido validado fuera del replay del autor; no hay descargas ni evaluaciones independientes que confirmen los resultados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jrubiosainz/microduck-game-tug-a1rb4ck-099c-s1-s2-s3-s4
- Modelo base: https://huggingface.co/a1rb4Ck/microduck-tug/tree/099ced00f425f1634045cd3f92505a8d78f3df52
- Revisión anterior del modelo base: https://huggingface.co/a1rb4Ck/microduck-tug/tree/3a2eb4e2a40073be336d00b7ca1898dc52dee352
- Red subyacente (microduck-heist): https://huggingface.co/a1rb4Ck/microduck-heist/tree/906d1efd4e1597c6f122f063b399effbf55a7f0e
- Entrada previa del autor (semilla 2): https://huggingface.co/jrubiosainz/microduck-game-tug-a1rb4ck-099c-s2/tree/4500bb4dc796d4d11c199d7524b70537bb816a39
- Entrada previa del autor (s3-s5): https://huggingface.co/jrubiosainz/microduck-game-tug-a1rb4ck-s3-s5/tree/b455d6f5b3216370c97a827b714219b79d9eb365
- Serie remix del autor: https://huggingface.co/jrubiosainz/microduck-game-tug-remix14/tree/eb5255080a1988a24ed611d89aa97e6150587cbe
- Microduck Arena (Space): https://huggingface.co/spaces/pollen-robotics/microduck-arena
- Repositorio MicroDuck: https://github.com/pollen-robotics/microduck
- Modelo tab-v2 de rumezhak: https://huggingface.co/rumezhak/microduck-tug-tab-v2/tree/b63e35875647a44ef33ab65acf44f167a24b72d4
- Modelo tab-v1 de littlebeanhp: https://huggingface.co/littlebeanhp/microduck-tug-tab-v1/tree/f444e12fe6e8e530d50dc7b00ae069f13138cd9b
- Modelo quicksilver-v13 de HlibPlakhtii: https://huggingface.co/HlibPlakhtii/microduck-tug-quicksilver-v13/tree/c95e086aa23d229bf334447a1ea646db51af652c
