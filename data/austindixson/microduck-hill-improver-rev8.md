# austindixson/microduck-hill-improver-rev8

## Resumen

`austindixson/microduck-hill-improver-rev8` es una política de control para robótica simulada publicada en HuggingFace, no un modelo de lenguaje. Se trata de un fichero ONNX (`policy.onnx`, 61 entradas y 14 salidas) que controla un MicroDuck —el robot cuadrúpedo de Pollen Robotics— dentro de la prueba "1.5 m Hill Climb" de la Microduck Arena, un entorno de competición completamente simulado. Lo firma austindixson (Austin Dixson, ingeniero de sistemas LLM según su perfil de GitHub) como un *remix* afinado de la política `jrubiosainz/microduck-game-hillclimber-remix9`.

El modelo no entrena una red nueva: la red neuronal del modelo base está congelada y lo que se modifica es una tabla de búsqueda por semilla (*branch table*) asociada al contador de pasos. La revisión 8 refina las filas 25-60 de la tabla `tk_T4` de la semilla 4 mediante una búsqueda aleatoria de base "hat" ejecutada en CPU, mejorando el tiempo de cruce de 0,73957 s a 0,73862 s. El resto de semillas quedan bit a bit idénticas al remix9.

Su relevancia es acotada y muy específica: documenta una técnica de ajuste fino sobre políticas ya entrenadas sin reentrenar pesos, y sirve como referencia reproducible para quien trabaje con la Arena, con optimización de controladores de bajo coste computacional o con despliegue de políticas ONNX en CPU. El autor advierte explícitamente de que es un artefacto solo para simulación y que no debe cargarse en un MicroDuck físico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de política (policy network) exportada a ONNX; arquitectura interna no detallada en la model card |
| Parametros totales | no disponible (el repositorio se redondea a 0,0 GB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; entrada fija `obs` de forma [1, 61] |
| Tipos de cuantizacion | no disponible (solo se distribuye el grafo ONNX sin indicar precisión de pesos) |
| Idiomas soportados | no aplica (modelo de control robótico, sin entrada ni salida de texto) |
| Licencia | ninguna declarada (el modelo base tampoco declara licencia) |
| Formato de pesos | ONNX (`policy.onnx`, sha256 `21b0511e105af5c15bf7b9f676bca38256b2100c630acfe3f879d7857aa21597`) + `manifest.json` (schema 2) |
| Entrada | `obs` [1, 61] |
| Salida | `actions` [1, 14] |
| Libreria / runtime | `microduck` (pipeline tag: robotics) |
| Modelo base | `jrubiosainz/microduck-game-hillclimber-remix9`, revision `2a57acfeb` |
| Relacion con el base | finetune (refinamiento de tabla, red congelada) |

## Arquitectura y entrenamiento

No hay una arquitectura de transformer ni de modelo generativo: es una política de control que mapea un vector de observación de 61 dimensiones a un vector de acción de 14 dimensiones, presumiblemente consignas articulares del MicroDuck en el simulador. La model card no especifica el número de capas, el tipo de capas ni el número de parámetros, y el repositorio ocupa 0,0 GB, lo que sitúa el artefacto en el orden de kilobytes o pocos megabytes.

El proceso de construcción no es un entrenamiento convencional. Se parte del remix9 de jrubiosainz, que a su vez se apoya en el método de "residual sobre contador de pasos" y en los remixes de tablas por semilla de DenRakEiw y dashi, con el MicroDuck, la Arena y el entrenamiento base de Pollen Robotics como origen de la línea. Sobre esa base, rev8 congela la red y aplica una búsqueda aleatoria de base "hat" en CPU libre sobre las filas 25-60 de la tabla `tk_T4` de la semilla 4. El resultado declarado es una mejora del tiempo de cruce de 0,73957 s a 0,73862 s en esa semilla, manteniendo el resto de semillas sin cambios bit a bit. El autor indica que la fuerza, el engranaje y la masa no se han tocado.

## Capacidades

- Control de locomoción del MicroDuck en la prueba "1.5 m Hill Climb" del simulador de la Microduck Arena.
- Inferencia determinista a partir de un vector de observación de 61 valores y emisión de 14 acciones por paso.
- Ejecución en CPU mediante ONNX Runtime, sin requisito de GPU ni de aceleradores.
- Especialización por semilla: la tabla de búsqueda mantiene ramas separadas para cada semilla de la Arena, con refinamiento independiente de la semilla 4.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso en el sentido de agentes LLM; su "multi-step" es control reactivo paso a paso dentro de la simulación.
- Sin capacidades multilingües, de visión, audio o generación de texto.
- Sin modo *thinking* ni decodificación especulativa.

## Casos de uso

- Referencia reproducible en la Arena: sirve para verificar que una instalación local del simulador y del comando `arena score` produce los tiempos publicados (0,740 / 0,745 / 0,740 / 0,740 / 0,740 s) antes de comparar otras políticas.
- Estudio de métodos de refinamiento sin reentrenamiento: el par de valores 0,73957 s → 0,73862 s en el cruce de la semilla 4 permite analizar cuánto margen aporta una búsqueda aleatoria sobre tablas de búsqueda con la red congelada.
- Prueba de regresión del simulador: al ser un artefacto con hashes y tiempos fijados, se puede usar como caso de prueba para detectar cambios de comportamiento entre versiones del motor de físicas o del sistema de puntuación.
- Base para destilación o para inicialización de políticas: al estar en ONNX y con red congelada, es un punto de partida barato para experimentos de *fine-tuning* de la parte tabular o para generar datos de trayectorias en el simulador.
- Docencia y divulgación en robótica simulada: un ejemplo mínimo (entrada de 61 valores, salida de 14) para explicar pipelines de observación-acción, evaluación por semillas y el papel del *seed* en benchmarks de control.
- Despliegue de referencia en CPU para pipelines ONNX: sirve para medir latencia y *throughput* de un modelo de política pequeño en infraestructura sin GPU y comparar con alternativas de runtime.
- Reproducibilidad de linaje: permite auditar la cadena de remixes (Pollen Robotics → DenRakEiw / dashi → jrubiosainz → austindixson) comparando ficheros y hashes entre revisiones.

## Benchmarks y rendimiento

Los únicos datos publicados son los tiempos de carrera en las semillas oficiales, puntuados con el comando `arena score` de la propia Arena sobre Linux x86-64. El autor indica que son cifras *in-sample*.

| Metrica | Resultado |
|---|---|
| Semilla 1 | 0,740 s |
| Semilla 2 | 0,745 s |
| Semilla 3 | 0,740 s |
| Semilla 4 | 0,740 s |
| Semilla 5 | 0,740 s |
| Media | 0,741 s |
| Cruce semilla 4 (remix9 → rev8) | 0,73957 s → 0,73862 s |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible; no son aplicables a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; por el tamaño del repositorio (0,0 GB) y la forma de entrada/salida (61 → 14), el modelo cabe holgadamente en memoria de cualquier equipo convencional.
- GPU recomendadas: ninguna necesaria; el autor ejecutó el proceso de búsqueda en "CPU libre" y la propia Arena se puntúa en x86-64 Linux.
- Cabe en GPU de consumo: sí, y también en CPU sin aceleración; no se requiere una GPU concreta.
- Opciones de despliegue: ONNX Runtime con la librería `microduck` y el `manifest.json` (schema 2); el flujo de evaluación es el comando `arena score` de la Microduck Arena. No hay soporte declarado para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput estimados: no disponibles; el autor no publica tiempos de inferencia por paso, solo tiempos de carrera de la política completa (media de 0,741 s por episodio en las semillas evaluadas).

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / E-S | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `austindixson/microduck-hill-improver-rev8` | Política ONNX para Hill Climb | no disponible | obs 61 → act 14 | Media 0,741 s (5 semillas, in-sample) | Ninguna declarada | HuggingFace |
| `jrubiosainz/microduck-game-hillclimber-remix9` (rev `2a57acfeb`) | Política base del remix | no disponible | obs 61 → act 14 (presumible, no confirmado) | no disponible | Ninguna declarada | HuggingFace |
| `austindixson/microduck-hill-improver-rev3` | Revisión previa del mismo linaje | no disponible | no disponible | no disponible | Ninguna declarada | HuggingFace |
| `austindixson/microduck-hill-improver` | Revisión inicial del mismo linaje | no disponible | no disponible | no disponible | Ninguna declarada | HuggingFace |

La información pública de las revisiones anteriores y del modelo base no incluye tiempos de carrera ni detalles de arquitectura, por lo que la comparación cuantitativa se limita al par remix9 → rev8 en el cruce de la semilla 4.

## Limitaciones y advertencias

- Solo simulación: el autor advierte explícitamente de que no debe cargarse en un MicroDuck físico. Los pesos y las tablas están ajustados al motor de físicas de la Arena y no se ha validado ninguna transferencia a hardware real.
- Métricas *in-sample*: los 0,741 s de media se obtienen sobre las mismas semillas usadas para el refinamiento, sin conjunto de validación independiente; el riesgo de sobreajuste a esas cinco semillas es alto.
- Ganancia marginal y muy localizada: la mejora afecta únicamente a las filas 25-60 de la tabla `tk_T4` de la semilla 4 (0,73957 s → 0,73862 s en el cruce); el resto de semillas son idénticas bit a bit al remix9, por lo que no hay mejora general declarada.
- Sin licencia: ni el modelo base ni este repositorio declaran licencia, lo que impide determinar los términos de uso comercial o de redistribución. Ante cualquier uso en producto hay que contactar con el autor.
- Sin idiomas, sin texto, sin tool calling: cualquier expectativa de uso como modelo de lenguaje, agente conversacional o modelo multimodal es inaplicable.
- Dependencia de la versión del simulador y del sistema de puntuación: los tiempos publicados se obtuvieron con el comando `arena score` sobre x86-64 Linux en una fecha concreta; cambios en el motor de físicas o en el método de medida pueden invalidar la comparación.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero sí existe riesgo de extrapolación indebida si se interpretan los tiempos como un rendimiento general del controlador en otras pruebas o terrenos.
- Trazabilidad del linaje: el modelo depende de trabajos previos (jrubiosainz, DenRakEiw, dashi, Pollen Robotics) cuyos términos de uso y licencias no se detallan; conviene revisarlos antes de redistribuir.
- Sesgos conocidos: no hay evaluación de sesgos publicada; al ser un controlador de simulación, el sesgo relevante sería el de las condiciones de entrenamiento (pendiente, fricción, masa) y no está documentado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/austindixson/microduck-hill-improver-rev8
- Modelo base: https://huggingface.co/jrubiosainz/microduck-game-hillclimber-remix9
- Microduck Arena (Space de Pollen Robotics): https://huggingface.co/spaces/pollen-robotics/microduck-arena
- Revisión previa rev3: https://huggingface.co/austindixson/microduck-hill-improver-rev3
- Revisión inicial: https://huggingface.co/austindixson/microduck-hill-improver
- Perfil de GitHub del autor: https://github.com/austindixson/
- Perfil de GitHub (README): https://github.com/austindixson/austindixson/tree/main
- Repositorios de DenRakEiw: https://huggingface.co/DenRakEiw
- Repositorios de dashi: https://huggingface.co/dashi
- Organización Pollen Robotics: https://huggingface.co/pollen-robotics
