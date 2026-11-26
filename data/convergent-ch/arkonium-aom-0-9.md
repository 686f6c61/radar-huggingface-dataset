# Convergent-ch/Arkonium-AoM-0.9

## Resumen

Arkonium-AoM 0.9 es un motor de ajedrez neuronal desarrollado por Convergent-ch que implementa una arquitectura de "Army of Models" (AoM) sobre el modelo base Arkonium 0.9. Se trata de un sistema de mezcla de expertos especializados donde un divisor enruta cada posición a uno de ocho cabezales especialistas: seis por tipo de pieza (peón, caballo, alfil, torre, dama, rey), uno para posiciones de mate y otro para finales. El tronco compartido (Arkonium 0.9, 20 bloques residuales de 256 canales) permanece congelado, y solo los especialistas y el divisor fueron entrenados.

El modelo resuelve el problema de la especialización en la evaluación de posiciones de ajedrez, permitiendo que cada tipo de pieza tenga su propio cabezal de política y valor, mientras que las posiciones ya decididas o de final se derivan a especialistas dedicados. La búsqueda emplea PUCT Monte Carlo Tree Search, la misma que en Arkonium 0.9, y el modelo se distribuye con soporte para el protocolo UCI.

Con 44,47 millones de parámetros totales (25,23 M del tronco congelado y 19,24 M de especialistas), Arkonium-AoM 0.9 es relevante porque explora una vía de escalado cualitativo en motores de ajedrez neuronales: en lugar de aumentar el tronco, añade capacidad especializada. Los resultados muestran que con el mismo número de visitas iguala a Arkonium 0.9, mejora la resolución de puzzles difíciles, pero requiere aproximadamente 1,5 veces más cómputo por posición, lo que lo hace más débil en partidas con reloj.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red residual (20 bloques x 256 canales) con mezcla de expertos: tronco congelado + divisor + 6 especialistas por pieza + especialista de mate + especialista de finales; búsqueda PUCT MCTS |
| Parametros totales | 44.471.665 (25.234.441 tronco + 19.237.224 especialistas) |
| Parametros activos | no disponible (no es MoE denso con activación selectiva por token; el enrutado es por posición y tipo de pieza) |
| Longitud de contexto | no disponible (no aplica; el estado es el tablero de ajedrez) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (librería pytorch; tamaño del repo 0,2 GB) |

## Arquitectura y entrenamiento

La arquitectura se compone de un tronco compartido congelado (Arkonium 0.9, 20 bloques residuales de 256 canales) y un conjunto de cabezales especialistas inicializados a partir de ese tronco. Un divisor de entrada, implementado como un cabezal pequeño sobre el tronco, predice qué tipo de pieza juega el mejor movimiento, partiendo de la estimación propia del tronco y aprendiendo una corrección. Cada uno de los seis especialistas por pieza añade un bloque residual extra más un cabezal de movimientos que solo clasifica los movimientos de su propio tipo de pieza. Los especialistas de mate y de finales disponen de su propia copia de los últimos 4 bloques residuales más cabezales de política y valor. El enrutado combina las salidas: la ruta de pieza (aproximadamente el 78 % de las posiciones) calcula P(movimiento) = P_divisor(tipo de pieza) × P_especialista(movimiento | tipo de pieza), con el valor tomado del tronco; la ruta de mate (aproximadamente el 10 %) usa el especialista de mate; y la ruta de final (aproximadamente el 12 %) usa el especialista de finales.

El entrenamiento utilizó los mismos 55,6 millones de posiciones de Lichess con evaluaciones de Stockfish que Arkonium 0.9 (dataset `Lichess/chess-position-evaluations`, CC0). Solo se entrenaron los especialistas y el divisor, manteniendo el tronco congelado. La ejecución consistió en 20.000 pasos de 1.024 posiciones (20,5 millones de posiciones) en una única RTX 3060 Ti durante aproximadamente 1,6 horas, con AdamW, tasa de aprendizaje 3e-4 y decaimiento coseno. Las funciones de pérdida fueron: entropía cruzada sobre el tipo de pieza de los movimientos candidatos de Stockfish para el divisor; entropía cruzada sobre los movimientos del tipo de pieza correspondiente, ponderada por la fracción del objetivo que recae en ese tipo, para los especialistas de pieza; y entropía cruzada de política más entropía cruzada de valor para los especialistas de mate y finales. Antes del entrenamiento se verificó numéricamente que el conjunto calcula exactamente la misma política y valor que Arkonium 0.9, de modo que el entrenamiento solo puede añadir capacidad.

## Capacidades

- Evaluación de posiciones de ajedrez y selección de movimientos mediante búsqueda PUCT MCTS.
- Enrutado especializado por tipo de pieza: cada especialista (peón, caballo, alfil, torre, dama, rey) clasifica únicamente los movimientos de su propio tipo.
- Detección y resolución de posiciones de mate mediante un especialista dedicado (valor del tronco en valor absoluto ≥ 0,95).
- Juego de finales mediante un especialista dedicado (material no de peón de ambos bandos sumando 12 o menos).
- Soporte del protocolo UCI para integración en interfaces y gestores de torneos de ajedrez.
- Resolución de puzzles de ajedrez, con mejor rendimiento que Arkonium 0.9 en puzzles de rating 2400 o superior.
- No dispone de capacidades de lenguaje natural, visión, audio, tool calling ni razonamiento multi-paso fuera del ámbito del ajedrez.

## Casos de uso

- Análisis de partidas con motor UCI: el modelo puede integrarse en cualquier GUI de ajedrez compatible con UCI (Arena, Cute Chess, BanksiaGUI) para analizar posiciones y sugerir movimientos, aprovechando la búsqueda MCTS y los especialistas por pieza.
- Entrenamiento de jugadores en finales: el especialista de finales, activado cuando el material no de peón suma 12 o menos, ofrece evaluaciones específicas para este tipo de posiciones, útil en sesiones de estudio de técnica de finales.
- Resolución de puzzles de táctica: con 887/1050 puzzles resueltos a 400 visitas (frente a 874/1050 de Arkonium 0.9), es adecuado para plataformas de entrenamiento táctico que necesiten verificar soluciones en posiciones difíciles de rating 2400+.
- Investigación en arquitecturas de mezcla de expertos para ajedrez: el diseño de tronco congelado más especialistas por tipo de pieza y divisor aprendido sirve como banco de pruebas para estudiar enrutado y especialización en dominios de juego.
- Motores de análisis en entornos con GPU modesta: al ejecutarse en una RTX 3060 Ti con aproximadamente 1.400 visitas por segundo, puede desplegarse en estaciones de trabajo con GPUs de consumo para análisis no crítico con reloj.
- Generación de datasets de evaluación: las salidas de política y valor de los especialistas pueden utilizarse para etiquetar posiciones o comparar la calidad de evaluaciones entre rutas (pieza, mate, final) en estudios de destilación o ajuste.

## Benchmarks y rendimiento

Posiciones retenidas (200.000 posiciones no usadas en entrenamiento, mismo split que Arkonium 0.9):

| Ruta | Posiciones | Top-1 Arkonium 0.9 | Top-1 AoM | MSE valor Arkonium 0.9 | MSE valor AoM |
|---|---:|---:|---:|---:|---:|
| Todas | 200.000 | 51,82 % | 51,90 % | 0,0387 | 0,0385 |
| Pieza | 155.590 | 50,75 % | 50,82 % | 0,0358 | 0,0358 |
| Mate | 19.722 | 60,47 % | 60,57 % | 0,0025 | 0,0026 |
| Final | 24.688 | 51,64 % | 51,83 % | 0,0860 | 0,0845 |

Enfrentamiento directo contra Arkonium 0.9 (60 partidas por ajuste, aperturas filtradas con Stockfish a profundidad 18 y ventaja máxima de 0,8 peones, cada apertura jugada con ambos colores):

| Ajuste | Victorias AoM | Tablas | Derrotas AoM | Puntuación | Diferencia Elo (IC 95 %) |
|---|---:|---:|---:|---:|---:|
| 400 visitas por movimiento | 16 | 27 | 17 | 29,5 : 30,5 | -6 (-58 a +47) |
| 0,5 s por movimiento | 4 | 28 | 28 | 18 : 42 | -147 (-207 a -95) |

Velocidad en RTX 3060 Ti: aproximadamente 1.400 visitas por segundo para el AoM frente a aproximadamente 2.100 de Arkonium 0.9. En el enfrentamiento a 0,5 s, tres partidas compartían GPU simultáneamente, lo que amplió la diferencia.

Rating estimado (escala `UCI_Elo` de Stockfish 18, 0,5 s por movimiento):

| Motor | Rating | Método |
|---|---:|---|
| Arkonium 0.9 | 2910 (IC 95 %: 2827-2990) | medido: 96 partidas contra Stockfish 18 a niveles fijos de `UCI_Elo` |
| Arkonium-AoM 0.9 | aproximadamente 2780 | estimado a partir del enfrentamiento a 0,5 s |

Puzzles de Lichess (1.050 puzzles, 150 por banda de 400 puntos de rating, 400 visitas):

| Rating del puzzle | Arkonium 0.9 | AoM |
|---|---:|---:|
| 400-799 | 150/150 | 150/150 |
| 800-1199 | 149/150 | 149/150 |
| 1200-1599 | 147/150 | 147/150 |
| 1600-1999 | 147/150 | 147/150 |
| 2000-2399 | no disponible en la información proporcionada | no disponible en la información proporcionada |
| 2400+ | no disponible en la información proporcionada | no disponible en la información proporcionada |

Total de puzzles resueltos a 400 visitas: 887/1050 para el AoM frente a 874/1050 para Arkonium 0.9, con la mejora concentrada en puzzles de rating 2400 o superior.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el tamaño del repositorio es de 0,2 GB y el modelo tiene 44,47 M de parámetros, por lo que cabe holgadamente en GPUs de consumo.
- GPU de referencia en el entrenamiento y las mediciones: una única RTX 3060 Ti (8 GB de VRAM).
- Cabe en GPUs de consumo: sí, al menos en RTX 3060 Ti; no se han publicado requisitos para otras GPUs.
- Opciones de despliegue: el modelo se distribuye como pesos PyTorch y expone el protocolo UCI; no se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a un motor de ajedrez).
- Latencia y throughput: aproximadamente 1.400 visitas por segundo en RTX 3060 Ti para el AoM, frente a aproximadamente 2.100 de Arkonium 0.9; requiere aproximadamente 1,5 veces el cómputo por posición que Arkonium 0.9.

## Comparativa con modelos similares

| Modelo | Parámetros | Arquitectura | Rating estimado (UCI_Elo, 0,5 s) | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| Arkonium-AoM 0.9 | 44,47 M (25,23 M tronco congelado + 19,24 M especialistas) | Residual + mezcla de expertos por tipo de pieza, mate y finales; PUCT MCTS | ~2780 (estimado) | Apache 2.0 | Hugging Face |
| Arkonium 0.9 | no disponible en la información proporcionada (tronco de 20 bloques x 256 canales) | Residual; PUCT MCTS | 2910 (medido) | no disponible en la información proporcionada | Hugging Face |
| Stockfish 18 | no disponible (motor alfa-beta clásico) | Búsqueda alfa-beta con evaluación tradicional/neuronal | escala de referencia `UCI_Elo` | no disponible en la información proporcionada | distribución estándar de Stockfish |

No se dispone de datos en la información proporcionada sobre otros motores neuronales comparables (por ejemplo, Leela Chess Zero o variantes de AlphaZero) para ampliar la comparativa.

## Limitaciones y advertencias

- Con el mismo tiempo de reflexión es claramente más débil que Arkonium 0.9: 18 : 42 a 0,5 s por movimiento, con una diferencia de -147 Elo (IC 95 %: -207 a -95) en ese ajuste.
- Requiere aproximadamente 1,5 veces el cómputo por posición que Arkonium 0.9, lo que penaliza su uso en partidas con reloj o en entornos con recursos limitados.
- El rating de ~2780 es una estimación derivada del enfrentamiento a 0,5 s contra Arkonium 0.9, no una medición directa contra Stockfish; la propia model card advierte que la diferencia real podría ser algo menor en una GPU con una sola partida.
- Las ganancias en posiciones retenidas son pequeñas (Top-1 del 51,82 % al 51,90 % en el conjunto completo), porque los especialistas aprenden de los mismos datos que el tronco ya había visto.
- En la ruta de mate el error de valor empeora ligeramente (MSE de 0,0025 a 0,0026).
- No es un modelo de lenguaje: no soporta idiomas naturales, tool calling, agentes ni razonamiento multi-paso fuera del ajedrez.
- No se han publicado datos sobre sesgos, riesgo de alucinación en el sentido de los LLM, cuantizaciones disponibles ni restricciones adicionales de la licencia Apache 2.0 más allá de las estándar.
- La información sobre el rendimiento en puzzles de rating 2000-2399 y 2400+ está incompleta en la documentación proporcionada; solo se indica el total agregado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Convergent-ch/Arkonium-AoM-0.9
- Modelo base Arkonium 0.9: https://huggingface.co/Convergent-ch/Arkonium-0.9
- Dataset de entrenamiento: https://huggingface.co/datasets/Lichess/chess-position-evaluations
