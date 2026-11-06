# jrubiosainz/microduck-game-tug-a1rb4ck-copy

## Resumen

`jrubiosainz/microduck-game-tug-a1rb4ck-copy` es una copia byte a byte de la política `a1rb4Ck/microduck-tug`, publicada por el usuario jrubiosainz para participar en la Microduck Arena de Pollen Robotics, una competición de robots simulados en la modalidad de tira y afloja (tug of war). No es un modelo de lenguaje ni un modelo fundacional: es un grafo ONNX que implementa una política de control por búsqueda tabular, sin parámetros entrenables en el sentido habitual, y el autor declara explícitamente que no ha entrenado, buscado ni editado nada.

El interés técnico del artefacto es doble. Por un lado, documenta con precisión forense la cadena de derivación de políticas en la Arena: cada capa es una tabla de búsqueda (`lookup`) superpuesta a un grafo base común, con inicializadores idénticos byte a byte. Por otro, ejemplifica un caso poco habitual en Hugging Face: un repositorio cuyo propósito es registrar una entrada de competición idéntica a otra, con crédito completo al autor original y sin reclamación de mejora alguna.

El resultado esperado es un empate exacto a 165,4581367969513 cm con la política original, y como entrada posterior, la Arena la clasificará por detrás de la de a1rb4Ck. La licencia es Apache 2.0, la misma que eligió el autor original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Grafo ONNX determinista con 10 capas de búsqueda tabular superpuestas a una red base (82 nodos, 55 inicializadores) |
| Parametros totales | no disponible (el repositorio ocupa 0,0 GB; el modelo es una política tabular, no una red densa con recuento de parámetros publicado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; la observación de entrada tiene 61 valores, de los cuales los 48 primeros se comparan contra las filas almacenadas |
| Tipos de cuantizacion | no aplica (el fichero es un ONNX de política; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`policy.onnx`) |

## Arquitectura y entrenamiento

La política es un grafo ONNX de 82 nodos cuyos inicializadores provienen íntegramente de `jrubiosainz/microduck-game-tug-remix14`, con 55 tensores idénticos byte a byte, incluidos los 10 tensores `jc_*` de comparación cabeza a cabeza. Sobre ese grafo se apilan diez capas de búsqueda (`L`, `search9` hasta `search2` y `search`), cada una con la misma regla: si los primeros 48 de los 61 valores de observación coinciden con una fila almacenada dentro de una tolerancia de 1e-7, se ejecuta la acción guardada en esa fila; en caso contrario, se delega en la capa inferior. El desplazamiento `hy_vx_shift` es cero.

La capa más externa, `L`, contiene 507 filas. De ellas, 390 ya estaban cubiertas por las búsquedas de tab-v2 y 117 son nuevas; 4 de las 390 almacenan una acción distinta de la que tab-v2 ejecutaba en esa misma observación. Por debajo, `search9` aporta 102 filas sobre tab-v1. No hay entrenamiento, ajuste fino ni búsqueda: el autor lo describe como copia byte a byte del fichero de a1rb4Ck en la revisión `3a2eb4e2`, el mismo que jugó su partida calificada `01M6724VVWB1C5T22HXGBJ`.

La cadena de derivación declarada es: remix14 (base del grafo) → quicksilver-v13 → tab-v1 → tab-v2 → microduck-tug (a1rb4Ck) → esta copia. Los créditos incluyen a rumezhak, littlebeanhp, HlibPlakhtii, anhalu, greecree, almuli, juicenv, AndoShy y Pollen Robotics.

## Capacidades

- Control de un duck simulado en la modalidad de tira y afloja de la Microduck Arena.
- Política determinista: para una observación de 61 valores, devuelve siempre la misma acción.
- Coincidencia exacta con tab-v2 fuera de las filas almacenadas en `L`, verificada bit a bit en onnxruntime.
- Ejecución en onnxruntime sin dependencias de entrenamiento ni de GPU.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto.
- No tiene capacidades multilingües ni procesa lenguaje natural.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Participación en la Microduck Arena: el fichero se registra como entrada de la competición y compite en el cuadro semanal con el duck de jrubiosainz, con el camino cabeza a cabeza heredado de remix14.
- Reproducibilidad de resultados: al ser byte a byte el fichero de a1rb4Ck, permite verificar que la Arena puntúa igual dos ficheros idénticos (165,4581367969513 cm en ambos casos).
- Auditoría de linaje de políticas: sirve como caso de estudio para comprobar la cadena de inicializadores y nodos entre remix14, quicksilver-v13, tab-v1, tab-v2 y microduck-tug.
- Docencia sobre evaluación en competiciones: ilustra cómo se resuelve un empate (la entrada anterior queda por delante) y por qué una copia exacta no mejora el marcador.
- Pruebas de integración de ONNX: el par de ficheros idénticos permite validar pipelines de inferencia que deben producir salidas idénticas bit a bit.
- Referencia de licenciamiento: ejemplo de reutilización de un modelo Apache 2.0 con atribución completa y sin modificaciones, útil como plantilla de buenas prácticas en repos derivados.

## Benchmarks y rendimiento

Resultados de la partida calificada de a1rb4Ck (`01M6724VVWB1C5T22HXGBJ`, runner 5, comando del evento, vx −0,3) contra el duck de referencia, con la partida de tab-v2 (`01M66WDHY7FKHNDEDXWNHY`) al lado:

| Semilla | Resultado | Tiempo | Terreno (cm) | Partida de tab-v2 (cm) |
|---|---|---|---|---|
| 1 | pit ganado | 1,52 s | 165,5436098575592 | 164,98435139656067 |
| 2 | pit ganado | 1,08 s | 165,80397486686707 | 165,12246131896973 |
| 3 | pit ganado | 2,74 s | 165,11904001235962 | 165,04912972450256 |
| 4 | pit ganado | 1,44 s | 165,82356691360474 | 165,82080125808716 |
| 5 | pit ganado | 0,86 s | 165,00049233436584 | 165,00049233436584 |
| **Media** | 5 de 5 pits ganados | | **165,4581367969513** | 165,1954472064972 |

El autor no ejecutó simulación propia de esta copia y no reclama rendimiento propio; se espera un empate exacto con la entrada original y, por ser posterior, una clasificación por detrás de ella.

## Requisitos de hardware

- VRAM estimada: no aplica; el fichero es un ONNX de política tabular y el repositorio ocupa 0,0 GB.
- GPU recomendadas: no se requieren; la inferencia se ejecuta en onnxruntime sobre CPU.
- Cabe en cualquier GPU consumer y en CPU sin problema.
- Opciones de despliegue: onnxruntime; el runner de la Microduck Arena de Pollen Robotics.
- Latencia y throughput: no disponibles como métricas del modelo; los tiempos de partida registrados oscilan entre 0,86 s y 2,74 s por semilla en el runner del evento.

## Comparativa con modelos similares

| Modelo | Tipo | Contexto / entrada | Resultado en Arena | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `jrubiosainz/microduck-game-tug-a1rb4ck-copy` | Copia byte a byte de microduck-tug | 61 valores de observación | 165,4581367969513 cm (esperado, empate) | Apache 2.0 | Hugging Face |
| `a1rb4Ck/microduck-tug` | Política original con lookup `L` | 61 valores de observación | 165,4581367969513 cm (5 de 5 pits) | Apache 2.0 | Hugging Face |
| `rumezhak/microduck-tug-tab-v2` | Política con lookup `search9` | 61 valores de observación | 165,1954472064972 cm | no disponible en la información proporcionada | Hugging Face |
| `jrubiosainz/microduck-game-tug-remix14` | Grafo base de la cadena | 61 valores de observación | no disponible | no disponible en la información proporcionada | Hugging Face |

## Limitaciones y advertencias

- No aporta ninguna mejora: es una copia exacta y, como entrada posterior, la Arena la clasificará por detrás de la de a1rb4Ck en caso de empate.
- El autor no ha ejecutado simulación propia; el resultado de 165,4581367969513 cm es una expectativa basada en la identidad byte a byte, no una medición de esta copia.
- El repositorio no incluye `manifest.json`, igual que el original.
- La política es determinista y tabular: fuera de las observaciones almacenadas en sus diez capas de búsqueda, se limita a replicar el comportamiento del grafo base.
- No procesa lenguaje natural, no tiene capacidades de razonamiento general y no es reutilizable fuera del dominio de la Microduck Arena.
- Riesgo de alucinación: no aplica en el sentido habitual, pero sí existe riesgo de comportamiento indefinido ante observaciones fuera de distribución no cubiertas por las tablas.
- Licencia Apache 2.0: permite uso comercial y modificación con atribución; el autor mantiene los créditos completos a la cadena de derivación.
- El Hub puede etiquetar el repositorio como derivado de su modelo base; el autor aclara que es una copia, no un ajuste fino.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jrubiosainz/microduck-game-tug-a1rb4ck-copy
- Modelo base (a1rb4Ck/microduck-tug): https://huggingface.co/a1rb4Ck/microduck-tug
- Revisión del fichero original: https://huggingface.co/a1rb4Ck/microduck-tug/tree/3a2eb4e2a40073be336d00b7ca1898dc52dee352
- rumezhak/microduck-tug-tab-v2: https://huggingface.co/rumezhak/microduck-tug-tab-v2
- littlebeanhp/microduck-tug-tab-v1: https://huggingface.co/littlebeanhp/microduck-tug-tab-v1
- HlibPlakhtii/microduck-tug-quicksilver-v13: https://huggingface.co/HlibPlakhtii/microduck-tug-quicksilver-v13
- jrubiosainz/microduck-game-tug-remix14: https://huggingface.co/jrubiosainz/microduck-game-tug-remix14
- Microduck Arena (Space): https://huggingface.co/spaces/pollen-robotics/microduck-arena
- Repositorio MicroDuck de Pollen Robotics: https://github.com/pollen-robotics/microduck
