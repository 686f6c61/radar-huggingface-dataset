# jrubiosainz/microduck-game-tug-a1rb4ck-s3-s5

## Resumen

`microduck-game-tug-a1rb4ck-s3-s5` es una política de control para el evento Tug of War de la Microduck Arena, la competición de robótica de Pollen Robotics. No es un modelo de lenguaje: es un grafo ONNX que mapea observaciones de 61 valores a acciones de control para un robot MicroDuck que debe arrastrar una carga contra un pato de referencia. El autor, jrubiosainz, parte del fichero de a1rb4Ck `microduck-tug` (revisión `3a2eb4e2`) y sustituye 36 filas de la tabla de búsqueda `L` que gobierna el comportamiento en los seeds 3 y 5.

La modificación es puramente de tabla: se eliminan 24 filas del seed 3 y 12 del seed 5, y se añaden otras tantas con observaciones y acciones obtenidas mediante CMA-ES sobre los episodios de esos mismos seeds. El grafo y el resto de inicializadores se mantienen byte a byte. El resultado es una mejora marginal en la puntuación media (165,4623 cm frente a 165,4581 cm del original), con 5 de 5 pits ganados.

Su relevancia es acotada y muy específica: sirve como ejemplo de optimización de políticas por búsqueda directa en tablas de lookup dentro de un pipeline de reinforcement learning competitivo, y como entrada en el ranking semanal de la Arena. La model card advierte explícitamente de que el resultado es in-sample y frágil, y de que no está pensado para un robot real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Grafo ONNX con tabla de búsqueda `L` (507 filas) como capa externa y red subyacente heredada de microduck-tug |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (observación de 61 valores por paso; los 48 primeros alimentan la búsqueda en `L`) |
| Tipos de cuantizacion | no disponible (pesos ONNX; el modelo base está etiquetado como quantized) |
| Idiomas soportados | no aplica (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`policy.onnx`) |

## Arquitectura y entrenamiento

El modelo es un grafo ONNX cuya primera capa es una tabla de lookup `L` de 507 filas. Cada fila almacena una observación y una acción; si los primeros 48 de los 61 valores de observación coinciden con una fila dentro de una tolerancia de 1e-7, se devuelve la acción almacenada. En caso contrario, la ejecución pasa al grafo subyacente, heredado sin cambios de `a1rb4Ck/microduck-tug`, que a su vez encadena los inicializadores de `rumezhak/microduck-tug-tab-v2`, `littlebeanhp/microduck-tug-tab-v1` y la serie quicksilver de HlibPlakhtii.

El entrenamiento de esta variante no incluye entrenamiento de pesos: no se ha entrenado ni modificado ninguna red. Las 36 filas añadidas provienen de búsquedas CMA-ES sobre las acciones de un episodio contra el pato de referencia congelado, ejecutadas con el runner de Tug of War de la Arena en una máquina x86_64, dentro de la serie `game-tug-remix` del autor. La modificación se limita a los seeds 3 y 5; el resto de seeds reproducen exactamente el comportamiento del fichero original.

## Capacidades

- Control de un robot MicroDuck en el evento Tug of War: genera acciones de tracción a partir de observaciones de 61 valores.
- Reproducción determinista de episodios almacenados: para los seeds 1 a 5, la tabla `L` devuelve acciones que replican los episodios registrados.
- Generalización limitada al grafo subyacente: cuando la observación no coincide con ninguna fila dentro de 1e-7, delega en la red heredada de microduck-tug.
- Ejecución en formato ONNX, apta para runtimes de inferencia estándar.
- Sin capacidades de generación de texto, razonamiento, código, matemáticas, visión, audio, tool calling ni agentes.

## Casos de uso

- Competición en la Microduck Arena: el fichero se publica como entrada del pato de jrubiosainz en la copa semanal de Tug of War, donde se enfrenta a las políticas de otros participantes.
- Reproducción de resultados de ranking: permite replicar los episodios de los seeds 1 a 5 contra el pato de referencia y verificar las puntuaciones declaradas (165,4623 cm de media).
- Estudio de optimización por búsqueda directa: sirve como caso práctico de sustitución de filas de una tabla de lookup mediante CMA-ES sin reentrenar la red, útil para investigar métodos de búsqueda en políticas híbridas tabla-red.
- Análisis de robustez de políticas con lookup: permite medir cómo de frágil es una política basada en coincidencia exacta de observaciones cuando cambian las condiciones de inicio o el oponente.
- Base para nuevas variantes: las filas añadidas y el procedimiento descrito pueden reutilizarse para construir otras versiones de la serie `game-tug-remix`.
- Docencia en robótica de competición: ejemplo compacto de pipeline completo (entrenamiento, evaluación contra referencia congelada, publicación en Hub) para cursos de reinforcement learning aplicado.

## Benchmarks y rendimiento

Evaluación del autor con la función de rating de la Arena 0.7.0 (`arena.evaluate.evaluate` para `tug-of-war`, comando vx −0,3, contra el pato de referencia), en una máquina virtual x86_64:

| Seed | Resultado | Tiempo | Terreno (cm) | Run original de a1rb4Ck (cm) |
|---|---|---|---|---|
| 1 | pit ganado | 1,52 s | 165,5436098575592 | 165,5436098575592 |
| 2 | pit ganado | 1,08 s | 165,80397486686707 | 165,80397486686707 |
| 3 | pit ganado | 2,74 s | 165,13981819152832 | 165,11904001235962 |
| 4 | pit ganado | 1,44 s | 165,82356691360474 | 165,82356691360474 |
| 5 | pit ganado | 0,86 s | 165,00052213668823 | 165,00049233436584 |
| **Media** | 5 de 5 pits ganados | | **165,4622983932495** | 165,4581367969513 |

El run original de referencia (`01M6724VVWB1C5T22HXGBJ`) obtuvo 165,4581367969513 cm con 5 de 5 pits ganados. La diferencia entre ambos es de aproximadamente 0,004 cm en la media.

## Requisitos de hardware

- VRAM estimada: no disponible; el repositorio ocupa 0,0 GB y el modelo es un grafo ONNX de tabla de lookup más red subyacente, por lo que la huella es mínima.
- GPU recomendadas: no se especifican; la inferencia puede ejecutarse en CPU.
- Cabe en cualquier GPU de consumo e incluso en CPU: el autor ejecutó la evaluación en una máquina virtual x86_64 sin GPU dedicada.
- Opciones de despliegue: ONNX Runtime (formato nativo del fichero), con el runner de Tug of War de la Microduck Arena.
- Latencia y throughput: los tiempos por episodio reportados van de 0,86 s (seed 5) a 2,74 s (seed 3) en la máquina de evaluación del autor.

## Comparativa con modelos similares

| Modelo | Base | Modificación | Puntuación media (cm) | Licencia |
|---|---|---|---|---|
| `jrubiosainz/microduck-game-tug-a1rb4ck-s3-s5` | a1rb4Ck/microduck-tug | 36 filas de `L` sustituidas (seeds 3 y 5) | 165,4623 | Apache 2.0 |
| `a1rb4Ck/microduck-tug` | rumezhak/microduck-tug-tab-v2 | Política original de referencia | 165,4581 | Apache 2.0 |
| `rumezhak/microduck-tug-tab-v2` | littlebeanhp/microduck-tug-tab-v1 | Base declarada por a1rb4Ck; lookup `search9` | 165,1954 | no disponible en la información proporcionada |
| `HlibPlakhtii/microduck-tug-quicksilver-v13` | serie quicksilver | Base declarada de tab-v1 | no disponible | no disponible en la información proporcionada |

## Limitaciones y advertencias

- Resultado in-sample: las puntuaciones dependen de que los cinco episodios de rating contra el pato de referencia congelado alcancen observaciones que coincidan con las filas almacenadas dentro de 1e-7. Cualquier diferencia de redondeo en coma flotante hace que la tabla deje de coincidir y responda el grafo subyacente.
- Fragilidad ante cambios de condición: la puntuación no dice nada sobre otros inicios, otros oponentes ni la copa; el propio autor lo advierte.
- No apto para un robot real: la model card incluye una sección explícita "Not for a real robot".
- Sin capacidades de lenguaje, visión ni razonamiento general; cualquier uso fuera del evento Tug of War de la Arena carece de sentido.
- Sin datos de sesgos, alucinación o cobertura idiomática: no aplica a este tipo de modelo.
- Licencia Apache 2.0 permite uso comercial, pero el modelo hereda inicializadores de varias políticas encadenadas cuyas licencias individuales no se detallan en la información disponible.
- Sin `manifest.json` en el repositorio, igual que en el repositorio base.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; sin validación independiente por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jrubiosainz/microduck-game-tug-a1rb4ck-s3-s5
- Modelo base: https://huggingface.co/a1rb4Ck/microduck-tug/tree/3a2eb4e2a40073be336d00b7ca1898dc52dee352
- Base de tab-v2: https://huggingface.co/rumezhak/microduck-tug-tab-v2/tree/b63e35875647a44ef33ab65acf44f167a24b72d4
- Base de tab-v1: https://huggingface.co/littlebeanhp/microduck-tug-tab-v1/tree/f444e12fe6e8e530d50dc7b00ae069f13138cd9b
- Base quicksilver-v13: https://huggingface.co/HlibPlakhtii/microduck-tug-quicksilver-v13/tree/c95e086aa23d229bf334447a1ea646db51af652c
- Serie game-tug-remix14: https://huggingface.co/jrubiosainz/microduck-game-tug-remix14/tree/eb5255080a1988a24ed611d89aa97e6150587cbe
- MicroDuck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Microduck Arena (Space): https://huggingface.co/spaces/pollen-robotics/microduck-arena
- Pollen Robotics en HuggingFace: https://huggingface.co/pollen-robotics
