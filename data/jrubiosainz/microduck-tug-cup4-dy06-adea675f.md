# jrubiosainz/microduck-tug-cup4-dy06-adea675f

## Resumen

Microduck-tug-cup4-dy06-adea675f es una política de control para robótica (pipeline `robotics`) publicada por el usuario jrubiosainz en Hugging Face, concebida como entrada para la competición de simulación Microduck Arena Tug of War. No es un modelo de lenguaje: se trata de una política preentrenada en formato ONNX, de aproximadamente 1 MB (1.045.628 bytes), identificada por el SHA-256 exacto `adea675fd0c225fb26f3c795586b935399de4d8ce7256989608ddf40171b2b73`. La model card insiste en que su uso es exclusivamente de simulación.

La relevancia del artefacto es metodológica dentro del ecosistema Microduck: se construye sobre la entrada previa tug-cup3-tn1-022349cb (nunca publicada, conservada como ficheros `TN1-*`) desplazando dos inicializadores de su red de respaldo: la media del normalizador de observaciones (61 valores) y el sesgo de la última capa (14 valores). El grafo, todas las tablas de búsqueda y el resto de inicializadores permanecen intactos. Los desplazamientos provienen de búsquedas CMA-ES propias sobre enfrentamientos directos contra entradas públicas fijadas.

El resultado declarado es una réplica bit a bit de la política base sobre los cinco semillas del tablero oficial, con una puntuación de referencia de 168,97830843925476 y cinco `pit_won`. La ficha documenta un artefacto de investigación reproducible y muy especializado, no un modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal con tablas de búsqueda (lookup tables) sobre observación cruda y red de respaldo; exportada a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; política de control por observación) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica; no procesa lenguaje) |
| Licencia | no disponible; la model card declara explícitamente «No blanket licence is asserted» |
| Formato de pesos | ONNX (política de 1.045.628 bytes, SHA-256 `adea675f...71b2b73`) |
| Libreria | microduck |
| Pipeline | robotics |
| Tamano del repo | 0,0 GB |
| Modelo base | merge de jrubiosainz/microduck-tug-cup3-p10g-3a94031b, GinDuck/microduck-tug-norris-p10c, jrubiosainz/microduck-tug-cup3-h9-29a9ef4a y SSH111111/microduck-tug-p10 |

## Arquitectura y entrenamiento

La política combina un mecanismo de tablas de búsqueda que leen la observación cruda con una red de respaldo que actúa únicamente cuando ninguna fila de tabla coincide. Sobre la base tug-cup3-tn1-022349cb —que a su vez es la entrada P10G con las filas de búsqueda de `TN1-table-patch.json`, tomadas de GinDuck/microduck-tug-norris-p10c— se han desplazado dos inicializadores: la media del normalizador de observaciones (61 valores) y el sesgo de la última capa (14 valores). El grafo y el resto de inicializadores son idénticos a los de la política base.

No se documenta un proceso de entrenamiento convencional con dataset de tokens ni RLHF/DPO. Los desplazamientos de inicializadores se obtuvieron mediante búsquedas CMA-ES sobre enfrentamientos directos contra entradas públicas fijadas de Tug of War, y se recogen en `CUP4-offsets.json` con créditos en `NOTICE`. La model card aporta además una verificación de reproducibilidad: replay local exacto en x86 con el evaluador oficial (runner-5), ejecutado dos veces en procesos separados, con resultado idéntico bit a bit.

## Capacidades

- Control de política para la competición de simulación Microduck Arena Tug of War.
- Selección de acción determinista mediante coincidencia exacta de filas en tablas de búsqueda sobre la observación cruda.
- Fallback mediante red neuronal cuando ninguna fila de tabla coincide con la observación.
- Reproducibilidad bit a bit verificada frente a la política base en los cinco semillas del tablero.
- Ejecución en formato ONNX mediante la librería `microduck`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Evaluación reproducible en Microduck Arena: la política puede cargarse con el evaluador oficial y replicar exactamente la puntuación declarada (168,97830843925476) en los cinco semillas del tablero, lo que permite auditar resultados de competición.
- Investigación sobre búsqueda de hiperparámetros: sirve como caso de estudio de optimización CMA-ES aplicada a inicializadores concretos (media del normalizador y sesgo de la última capa) manteniendo el grafo intacto.
- Análisis de robustez de tablas de búsqueda: permite estudiar qué fracción de observaciones cae en filas de tabla y cuándo interviene la red de respaldo, útil para diseñar políticas híbridas.
- Reproducción de experimentos en x86: el fichero `x86-replay-receipt.json` documenta la réplica bit a bit de entradas propias (H9 y tug-cup3-tn1-e5005d50) frente a sus resultados públicos, lo que facilita validaciones cruzadas en investigación.
- Comparación de entradas de competición: las puntuaciones por semilla publicadas permiten contrastar esta entrada con GinDuck Tug Norris y con la propia H9 en igualdad de condiciones.
- Docencia y divulgación sobre políticas de control en simulación: el tamaño reducido (1 MB) y el formato ONNX simplifican la ejecución en entornos de laboratorio.
- Integración en pipelines de evaluación automatizada: al ser un artefacto ONNX pequeño, puede incorporarse en baterías de tests de regresión de competiciones de robótica simulada.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (puntuación del evaluador oficial por semilla):

| Semilla | Esta entrada | tug-cup3-tn1-022349cb (replay x86) | GinDuck Tug Norris (tablero) | H9 (tablero) |
|---|---|---|---|---|
| 1 | 169,04311776161194 | 169,04311776161194 | 169,04293298721313 | 169,04293298721313 |
| 2 | 169,0845549106598 | 169,0845549106598 | 169,0845549106598 | 169,0845549106598 |
| 3 | 168,75625848770142 | 168,75625848770142 | 168,7562346458435 | 168,7562346458435 |
| 4 | 169,45894360542297 | 169,45894360542297 | 169,4589078426361 | 169,45884823799133 |
| 5 | 168,54866743087769 | 168,54866743087769 | 168,54861974716187 | 168,5486078262329 |

Puntuación de referencia agregada: 168,97830843925476 (`0x1.51f4e4d800000p+7`), con cinco `pit_won`. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ya que no aplican a este tipo de artefacto.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el artefacto ocupa aproximadamente 1 MB, por lo que la huella de memoria es mínima.
- GPU recomendadas: no disponibles; la model card solo documenta replay en host x86 con el evaluador oficial (runner-5), sin requisitos de GPU especificados.
- Compatibilidad con GPU de consumo: no disponible como dato explícito; por tamaño, el artefacto no debería presentar restricciones relevantes de memoria.
- Opciones de despliegue: librería `microduck` con pesos ONNX; el evaluador oficial de Microduck Arena.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Tamano | Puntuacion de referencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| microduck-tug-cup4-dy06-adea675f (esta entrada) | Política ONNX para Tug of War | 1.045.628 bytes | 168,97830843925476 (5 semillas) | No disponible (sin licencia global) | Pública en HF |
| jrubiosainz/microduck-tug-cup3-p10g-3a94031b | Política base (P10G) | no disponible | no disponible | no disponible | Pública en HF |
| GinDuck/microduck-tug-norris-p10c | Política de referencia (Tug Norris) | no disponible | 169,04293298721313 (semilla 1), 169,0845549106598 (semilla 2) | no disponible | Pública en HF |
| jrubiosainz/microduck-tug-cup3-h9-29a9ef4a (H9) | Política propia | no disponible | 169,04293298721313 (semilla 1), 168,5486078262329 (semilla 5) | no disponible | Pública en HF |

## Limitaciones y advertencias

- Uso exclusivamente de simulación: la model card declara «Simulation only»; no debe emplearse en sistemas físicos sin validación adicional.
- Licencia no disponible: el autor afirma explícitamente que no se concede una licencia global («No blanket licence is asserted»), lo que impide asumir derechos de uso comercial.
- Dependencia de tablas de búsqueda: fuera de las filas de tabla, la política recurre a una red de respaldo cuyos inicializadores han sido desplazados; el comportamiento en observaciones no vistas no está caracterizado en la información disponible.
- Riesgo de sobreajuste a las semillas evaluadas: los resultados publicados corresponden a cinco semillas concretas del tablero y a un replay en x86; no se documenta generalización a otras condiciones.
- Créditos y procedencia: el artefacto incorpora material de terceros (GinDuck, SSH111111, Suraj Phanindra, nootxlm), con ficheros `UPSTREAM-*` y avisos en `NOTICE`; es responsabilidad del usuario revisar dichos avisos.
- Ausencia de datos de sesgo, alucinación o idioma: no aplican en el sentido habitual, pero tampoco se documentan evaluaciones de robustez fuera del entorno de competición.
- Sin métricas de latencia ni throughput: no es posible estimar comportamiento en producción a partir de la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jrubiosainz/microduck-tug-cup4-dy06-adea675f
- Modelo base P10G: https://huggingface.co/jrubiosainz/microduck-tug-cup3-p10g-3a94031b
- Modelo base Tug Norris: https://huggingface.co/GinDuck/microduck-tug-norris-p10c
- Modelo base H9: https://huggingface.co/jrubiosainz/microduck-tug-cup3-h9-29a9ef4a
- Modelo base SSH111111 Tug P10: https://huggingface.co/SSH111111/microduck-tug-p10
