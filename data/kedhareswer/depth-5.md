# Kedhareswer/depth-5

## Resumen

depth 5 es un evaluador de ajedrez del tipo NNUE (efficiently updatable neural network) entrenado desde cero por el desarrollador Kedhareswer y publicado bajo licencia MIT. No es un modelo de lenguaje: es una red neuronal pequena (4,79 MB de pesos) que se ejecuta exclusivamente en CPU mediante NumPy y que se integra en un motor de busqueda alfa-beta para jugar al ajedrez. Su relevancia radica en que demuestra que una red de apenas unos megabytes, entrenada de forma independiente y con inferencia en Python puro, puede superar a modelos de lenguaje de gran escala en tareas de evaluacion de posiciones y resolucion de puzzles de ajedrez.

El modelo se distribuye como un artefacto binario (`artifacts/chess_nnue/chess.nnue`) dentro del repositorio de Hugging Face, acompanado del paquete Python `chess_nnue`, informes de benchmarks y tests. La busqueda que lo rodea esta limitada por tiempo, no por profundidad: el nombre "depth 5" es una etiqueta, y en el control de tiempo de referencia (60 s + 0,6 s por jugada) alcanza de media entre 5,2 y 5,8 plies.

El autor reporta resultados notables frente a LLMs en dos benchmarks publicos: una puntuacion de 2446 (intervalo del 95%: 2288-2666) en la escala ChessBench LLM, y un 96,6% de acierto en los 1.000 puzzles de Kagi, frente al 84,8% del mejor LLM de esa tabla (GPT-4.5). Frente a Stockfish con fuerza calibrada, el autor estima unos 2110 Elo (2044-2178) en la escala CCRL. Estos datos proceden de la model card y no han sido verificados de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | NNUE (efficiently updatable neural network) para evaluacion de posiciones de ajedrez, integrada en un motor de busqueda alfa-beta |
| Parametros totales | no disponible (pesos de 4,79 MB; numero de parametros no declarado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; la "entrada" es una posicion de ajedrez) |
| Tipos de cuantizacion | no disponible (pesos binarios propietarios del formato `.nnue`; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica (modelo de ajedrez, no linguistico) |
| Licencia | MIT |
| Formato de pesos | `.nnue` (artefacto binario propio); codigo en Python/NumPy |

## Arquitectura y entrenamiento

El modelo es un evaluador NNUE, el diseno que emplean los motores de ajedrez modernos para estimar la ventaja de una posicion de forma rapida y actualizable incrementalmente. La red se entrena desde cero y se combina con un motor de busqueda alfa-beta propio; el autor describe una ablation que separa la contribucion de la red (evaluacion) de la de la busqueda. El conjunto de datos de entrenamiento declarado es `Lichess/chess-position-evaluations`, un dataset publico de evaluaciones de posiciones de Lichess.

La innovacion tecnica principal no esta en la arquitectura sino en el entorno de ejecucion: inferencia en CPU con NumPy puro, sin GPU ni frameworks de deep learning pesados. El autor documenta de forma explicita una regresion: a 3 s por jugada en Python, la red es entre 2 y 3 veces mas lenta que una tabla de piece-square, de modo que la misma busqueda alcanza profundidad 5 en lugar de 8; la red juzga mejor cada posicion, pero la profundidad de busqueda compensa. El autor senala que la solucion es de velocidad (una compilacion en Rust/WASM de los mismos pesos buscaria unas 50 veces mas posiciones por segundo), no un cambio de red.

## Capacidades

- Evaluacion de posiciones de ajedrez: estima la ventaja de una posicion para alimentar la busqueda alfa-beta.
- Juego completo de ajedrez: combinado con el motor de busqueda, juega partidas con control de tiempo.
- Resolucion de puzzles tacticos de ajedrez (mate en N, combinaciones), incluyendo la linea completa de solucion.
- Ejecucion en CPU exclusivamente, sin dependencia de GPU.
- Integracion como paquete Python (`chess_nnue`) y como bot de Lichess.
- No soporta tool calling, agentes, razonamiento multi-paso en lenguaje natural, vision ni audio: no es un modelo de lenguaje.

## Casos de uso

- Analisis de posiciones en ajedrez: el evaluador puntua posiciones concretas para motores de analisis o herramientas de entrenamiento, con inferencia en CPU y bajo consumo de recursos.
- Motor de ajedrez embebido en aplicaciones de escritorio: al pesar 4,79 MB y ejecutarse en NumPy, puede integrarse en apps sin GPU ni dependencias pesadas.
- Bot de ajedrez en Lichess: el autor lo opera como bot (`@paddyoaktree`) en la plataforma, gestionando partidas online con control de tiempo.
- Resolucion automatica de puzzles tacticos: con un 90,4% de acierto en puzzles de Lichess retenidos (linea completa), sirve para generar o validar soluciones de puzzles.
- Benchmarking de LLMs en ajedrez: la escala ChessBench LLM y los puzzles de Kagi permiten comparar modelos de lenguaje contra un motor pequeno y determinista como referencia.
- Investigacion en NNUE y busqueda: el codigo y los informes de ablation permiten estudiar el equilibrio entre calidad de evaluacion y profundidad de busqueda en Python.
- Educacion y experimentacion: al ser MIT y estar entrenado desde cero, sirve como base reproducible para quien quiera aprender a construir un motor NNUE.

## Benchmarks y rendimiento

Datos reportados por el autor en la model card (no verificados de forma independiente).

Escala ChessBench LLM (partidas contra anclas fijas):

| Oponente | Partidas | Ganadas | Perdidas | Tablas |
|---|---:|---:|---:|---:|
| random mover (400) | 100 | 100 | 0 | 0 |
| Maia 1100 (1628) | 100 | 97 | 0 | 3 |
| Maia 1900 (1816) | 100 | 96 | 0 | 4 |
| Rating (maxima verosimilitud, 95%) | 300 | | | 2446 (2288-2666) |

Puzzles de Kagi (1.000 puzzles de Lichess, primer movimiento con coincidencia exacta):

| Jugador | Resueltos | Rating ajustado (Glicko-2) |
|---|---:|---:|
| depth 5 | 96,6% (966) | 2221 |
| gpt-4.5-preview | 84,8% | 1866 |
| gpt-4.1 | 57,9% | 1345 |
| gpt-4o | 53,6% | 1321 |
| claude-3-opus | 7,2% | 521 |

Contra niveles calibrados de Stockfish 19 (`UCI_LimitStrength`, 60 s + 0,6 s):

| Oponente | Partidas | Ganadas | Perdidas | Tablas | Puntuacion |
|---|---:|---:|---:|---:|---:|
| Stockfish UCI_Elo 1800 | 50 | 32 | 14 | 4 | 68% |
| Stockfish UCI_Elo 2100 | 50 | 21 | 19 | 10 | 52% |
| Stockfish UCI_Elo 2400 | 50 | 7 | 24 | 19 | 33% |
| Rating (95%) | 150 | | | | 2110 (2044-2178) |

Puzzles de Lichess (linea completa de solucion):

| Conjunto | Puzzles | depth 5 | Modelo de ajedrez de Puzzle Arena |
|---|---:|---:|---:|
| Puzzles retenidos de Lichess | 3.000 | 90,4% | 58,7% |
| Puzzles diarios de Lichess | 297 | 90,2% | 30,0% |

Por rating de puzzle (conjunto retenido): menos de 1500: 98,8%; 1500-2000: 90,4%; 2000+: 62,6%.

Ablation (contra `local/engine-4`, ambos a 3 s por jugada):

| Evaluacion + busqueda | Partidas | V / D / E | Elo vs engine-4 (95%) | Nodos/s | Profundidad media |
|---|---:|---|---:|---:|---:|
| eval antigua + busqueda antigua | 50 | 12 / 16 / 22 | -28 (-102 a +44) | 40k | 4,7 |
| eval NN + busqueda antigua | 50 | 24 / 21 / 5 | +21 (-71 a +116) | 13k | 3,6 |
| eval antigua + busqueda nueva | 50 | 34 / 6 / 10 | +220 (+134 a +341) | 28k | 8,2 |
| depth 5: eval NN + busqueda nueva | 100 | 55 / 38 / 7 | +60 (-6 a +129) | 9k | 5,2 |

Cara a cara, depth 5 contra eval antigua + busqueda nueva (60 s + 0,6 s): 15 victorias, 18 derrotas y 4 tablas en 37 partidas (Elo -28, 95%: -141 a +78), serie detenida antes de las 60 partidas previstas.

## Requisitos de hardware

- VRAM: no requiere GPU; inferencia exclusivamente en CPU con NumPy.
- Memoria: los pesos ocupan 4,79 MB, por lo que el modelo cabe en cualquier equipo con Python y NumPy.
- GPU recomendadas: ninguna; no aplica.
- Cabe en hardware de consumo: si, en cualquier CPU moderna, incluidos portatiles de gama baja.
- Despliegue: paquete Python `chess_nnue`; el autor menciona una posible compilacion en Rust/WASM para acelerar la busqueda (hasta 50 veces mas posiciones por segundo segun el autor).
- Rendimiento: unos 9k nodos/s y profundidad media 5,2 a 3 s por jugada en Python; la red evalua 2-3 veces mas lento que una tabla de piece-square.

## Comparativa con modelos similares

| Modelo | Tipo | Tamano | Licencia | Contexto / entrada | Rendimiento reportado |
|---|---|---|---|---|---|
| depth 5 | NNUE + busqueda alfa-beta | 4,79 MB | MIT | posicion de ajedrez | 2446 ChessBench; 96,6% puzzles Kagi; 2110 Elo CCRL |
| Stockfish 19 (fuerza calibrada) | motor clasico + NNUE | no disponible | GPL | posicion de ajedrez | niveles calibrados 1800-2400 UCI_Elo |
| `local/engine-4` (LLM Chess Arena) | motor clasico (material + piece-square) | no disponible | no disponible | posicion de ajedrez | referencia de ablation; +220 Elo con busqueda nueva |
| Gemini 3.1 Pro (ChessBench) | LLM | no disponible | propietaria | texto | 2144 en ChessBench LLM |

La comparacion con LLMs es la mas relevante en la model card: en ChessBench, depth 5 (2446) supera a Gemini 3.1 Pro (2144) y a GPT-6 Astra (1975), aunque los intervalos de confianza se solapan. En puzzles de Kagi, su 96,6% supera ampliamente a GPT-4.5 (84,8%).

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no responde preguntas ni soporta tool calling, agentes o vision.
- La evaluacion de fuerza en ChessBench es una extrapolacion: depth 5 nunca perdio contra las anclas, por lo que el rating descansa en 7 tablas contra oponentes muy inferiores y el intervalo es amplio (2288-2666).
- No se jugo contra la ancla mas fuerte de ChessBench (Eubos, 2357).
- Las escalas ChessBench (Lichess Classical) y CCRL no son comparables: 2446 y 2110 no deben interpretarse como equivalentes.
- Regresion documentada: en Python, la red es 2-3 veces mas lenta que una tabla de piece-square, lo que reduce la profundidad de busqueda (5 frente a 8) y puede compensar la mejora de evaluacion; el cara a cara contra eval antigua + busqueda nueva no mostro un ganador claro.
- La tabla de Kagi es de abril de 2025 y no incluye modelos mas recientes.
- Los benchmarks fueron ejecutados por el autor con otros procesos compartiendo CPU, lo que reduce los nodos/s de ambos bandos.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validacion independiente de la comunidad.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantias ni soporte.
- Riesgo de alucinacion: no aplica en el sentido linguistico, pero el motor puede fallar en posiciones tacticas fuera de su rango de profundidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kedhareswer/depth-5
- Tablero interactivo: https://kedhareswer-puzzle-arena.hf.space/depth5
- Puzzle Arena Space: https://huggingface.co/spaces/Kedhareswer/puzzle-arena
- Bot de Lichess: https://lichess.org/@/paddyoaktree
- Codigo fuente: https://github.com/Kedhareswer/ML-AI (`reasoning_harness/`)
- ChessBench LLM: https://chessbenchllm.onrender.com
- Benchmarks de puzzles de Kagi: https://github.com/kagisearch/llm-chess-puzzles
- Dataset de entrenamiento: https://huggingface.co/datasets/Lichess/chess-position-evaluations
