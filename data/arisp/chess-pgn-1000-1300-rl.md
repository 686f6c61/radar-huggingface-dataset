# Arisp/chess-pgn-1000-1300-rl

## Resumen

chess-pgn-1000-1300-rl es un modelo de lenguaje a nivel de carácter especializado en ajedrez, desarrollado por Arisp (AriSpiesberger) como un ajuste fino del modelo base Arisp/chess-pgn-1000-1300. Se trata de un transformer de aproximadamente 51 millones de parámetros que genera notación PGN (Portable Game Notation) carácter a carácter, aprendiendo a predecir la secuencia de movimientos de una partida a partir de su historial. El modelo no utiliza un tablero interno ni un motor de ajedrez: toda la información posicional se infiere implícitamente del texto de los movimientos previos.

La relevancia de esta variante reside en su método de entrenamiento: un ajuste fino de imitación ponderada por resultado (outcome-weighted imitation) sobre partidas humanas reales de Lichess de jugadores con Elo entre 1000 y 1300. En lugar de aprender a jugar como un motor, el modelo aprende a reproducir los movimientos que ganaron partidas dentro de esa banda de nivel humano, manteniendo una distribución de juego plausible para ese segmento. Según la model card, esto produce una mejora sustancial en fuerza de juego medida contra Stockfish (de 1489 a 1671 de rating Glicko-2 a temperatura 0.001) sin degradar significativamente la similitud con el juego humano.

El modelo es de pequeño tamaño (0,2 GB en safetensors), licencia MIT y está pensado para investigación en modelado de ajedrez a nivel de carácter, análisis de estilos de juego humano y experimentos de aprendizaje por imitación, más que para uso como motor de ajedrez en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer a nivel de carácter (character-level) |
| Parámetros totales | 50.997.248 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 caracteres (según limitaciones declaradas) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (entrada/salida en notación PGN, no lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | safetensors (config.json + model.safetensors) |

## Arquitectura y entrenamiento

El modelo es un transformer a nivel de carácter que procesa la notación PGN como una secuencia de texto. No dispone de representación explícita del tablero ni de módulo de búsqueda: la posición se infiere únicamente del historial de movimientos codificado en caracteres. La arquitectura es idéntica a la del modelo base Arisp/chess-pgn-1000-1300; solo cambian los pesos tras el ajuste fino. El repositorio incluye el código de inferencia (`pgn_model.py` con las clases `PGNTransformer` y la función `generate_moves`) y un `config.json` con la configuración de arquitectura.

El entrenamiento consistió en imitación offline ponderada por resultado sobre 5.833.728 partidas del propio conjunto de entrenamiento del modelo base (partidas de Lichess de la banda 1000-1300 que terminaron de forma normal, excluyendo abandonos, tiempos agotados e infracciones de reglas), en una sola pasada. En cada partida decisiva, el modelo adopta el rol del ganador y solo los movimientos del ganador reciben pérdida (entropía cruzada por carácter sobre cada movimiento); los movimientos del perdedor y los números de jugada son solo contexto. En partidas tablas, el modelo adopta un bando aleatorio con peso 0,5. Se añade un término KL de 0,1 entre la política y la del modelo base en los mismos caracteres para mantener la proximidad a la distribución humana original. Optimizador AdamW con tasa de aprendizaje 1e-05 y 256 partidas por paso. No se empleó self-play, ni motor, ni rollouts. El resultado es un modelo que solo puede asignar probabilidad a movimientos que un humano jugó realmente, desplazando la distribución hacia los movimientos humanos que ganaron.

## Capacidades

- Generación de movimientos de ajedrez en notación PGN carácter a carácter, condicionada al historial de la partida.
- Juego de partidas completas desde la posición inicial mediante generación autoregresiva.
- Modelado de estilo de juego humano de la banda 1000-1300 de Lichess, incluyendo errores típicos de ese nivel.
- Capacidad de resolver puzzles de Lichess cuando se le proporciona el historial de la partida asociado al puzzle.
- Generación con control de temperatura (los resultados reportados cubren temperaturas 0.001, 0.01, 0.1 y 1).
- No soporta tool calling, function calling, agentes, visión, audio ni razonamiento multi-paso en el sentido convencional.
- Capacidades multilingües: no aplica; el modelo opera sobre notación PGN, no sobre lenguaje natural.

## Casos de uso

- Investigación en imitación ponderada por resultado: el modelo sirve como caso de estudio reproducible de aprendizaje por imitación offline sin self-play ni motores, útil para comparar con métodos de RL más costosos en dominios con recompensa escasa.
- Modelado de estilos de juego humano: al entrenarse exclusivamente con partidas de la banda 1000-1300, permite generar partidas con una distribución de errores y decisiones representativa de jugadores de ese nivel, útil para simulaciones de oponentes humanos.
- Generación de datasets sintéticos de ajedrez: se pueden producir partidas plausibles de nivel intermedio para aumentar corpus de entrenamiento de otros modelos o para pruebas de sistemas de análisis de partidas.
- Análisis de similitud con humanos: la métrica de coincidencia top-1/top-3/top-5 con el movimiento humano permite usarlo como referencia en estudios sobre cómo de "humano" es un modelo de ajedrez.
- Evaluación de puzzles: dado el historial de una partida de Lichess, el modelo puede proponer el movimiento del puzzle, con rendimiento reportado de 1307 de rating de puzzles a temperatura 0.001.
- Docencia y divulgación: permite ilustrar de forma tangible cómo un modelo de lenguaje pequeño puede aprender estructuras complejas (reglas del ajedrez implícitas) solo a partir de texto, con un coste computacional mínimo.
- Pruebas de robustez de pipelines PGN: al generar movimientos ocasionalmente ilegales, sirve para validar la tolerancia a errores de herramientas que consumen PGN.

## Benchmarks y rendimiento

Datos publicados en la model card, comparando el modelo con su base Arisp/chess-pgn-1000-1300 usando el mismo código de evaluación (`chess_beyond/transcend/pgn/eval.py` del repositorio AriSpiesberger/Memorize).

Partidas contra niveles de Stockfish de Lichess (1, 3, 5, 7 y 8; Fairy-Stockfish), 100 partidas por nivel desde 50 aperturas; rating Glicko-2 sobre los niveles calibrados 1, 3 y 5 (intervalo del 95%: aproximadamente ±74):

| Temperatura | chess-pgn-1000-1300 | chess-pgn-1000-1300-rl | Cambio |
|---|---|---|---|
| 0.001 | 1489 | 1671 | +182 |
| 0.01 | 1493 | 1564 | +71 |
| 0.1 | 1405 | 1556 | +151 |
| 1 | 996 | 1175 | +178 |

Puzzles de Lichess con su historial de partida (2.000 puzzles por rating en 1050, 2400, 2600 y 2800); rating de puzzles:

| Temperatura | chess-pgn-1000-1300 | chess-pgn-1000-1300-rl |
|---|---|---|
| 0.001 | 1212 | 1307 |
| 0.01 | 1209 | 1308 |
| 0.1 | 1213 | 1297 |
| 1 | 1024 | 1107 |

Similitud con humanos: posiciones reservadas de partidas de la banda, temperatura 0.001; frecuencia con la que el movimiento humano está en el top-1/3/5 del modelo y puntuación esperada perdida frente al mejor movimiento de Stockfish (profundidad 12):

| Modelo | top-1 | top-3 | top-5 | Pérdida vs mejor |
|---|---|---|---|---|
| chess-pgn-1000-1300 | 52,1% | 75,7% | 85,5% | 5,57% |
| chess-pgn-1000-1300-rl | 50,1% | 76,0% | 86,0% | 5,53% |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precisión completa (50,997 millones de parámetros en float32 ocupan aproximadamente 204 MB); el repositorio completo pesa 0,2 GB.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de memoria libre; el ejemplo de la model card ejecuta en CPU (`dev="cpu"`).
- Cabe holgadamente en GPU de consumo: GTX 1050 Ti, RTX 3050, RTX 4060, RTX 4090, así como en placas integradas y CPU.
- Opciones de despliegue: carga directa con PyTorch y safetensors mediante `snapshot_download` y `load_file`; el repositorio incluye el código de inferencia propio (`pgn_model.py`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, dado que el modelo no usa un tokenizador estándar de lenguaje natural.
- Latencia y throughput: no disponibles en la información proporcionada; dado el tamaño, se espera inferencia en tiempo real en CPU para una partida completa, aunque no se aportan cifras.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos comparables en la información proporcionada. Como referencia estructural, el modelo base Arisp/chess-pgn-1000-1300 comparte arquitectura, tamaño y licencia, y los resultados comparativos entre ambos se detallan en la sección de benchmarks. Otros modelos de ajedrez basados en transformers a nivel de carácter o de movimiento no se han evaluado en la información disponible, por lo que no se ofrece comparación con ellos.

| Modelo | Parámetros | Contexto | Licencia | Relación |
|---|---|---|---|---|
| Arisp/chess-pgn-1000-1300-rl | 50.997.248 | 1.024 caracteres | MIT | Este modelo |
| Arisp/chess-pgn-1000-1300 | no disponible | 1.024 caracteres | MIT | Modelo base; mismos archivos y arquitectura, pesos distintos |
| Otros modelos de ajedrez | no disponible | no disponible | no disponible | Sin datos de comparación en la información disponible |

## Limitaciones y advertencias

- El modelo conoce la posición únicamente a partir del historial de movimientos; no mantiene un estado de tablero explícito y ocasionalmente genera movimientos ilegales.
- A partir de aproximadamente el movimiento 80-100, la partida deja de caber en su contexto de 1.024 caracteres y la calidad de generación se degrada.
- Juega como un jugador fuerte de su banda (1000-1300), con los errores típicos de ese nivel; no es un motor de ajedrez y no debe usarse como tal.
- Al entrenarse solo con movimientos humanos de la banda, no puede generar movimientos que ningún humano haya jugado; su techo de fuerza está acotado por la distribución de entrenamiento.
- Riesgo de alucinación en forma de movimientos ilegales o secuencias PGN mal formadas; el código de ejemplo contempla hasta 5 intentos antes de devolver `None`.
- Sesgos derivados de la distribución de Lichess: estilos de apertura, ritmos de juego y niveles de la banda 1000-1300, no representativos de otros segmentos o de ajedrez de competición.
- Licencia MIT: permite uso comercial y modificación, pero no se ofrece garantía alguna sobre el comportamiento del modelo.
- No se documentan idiomas soportados ni capacidades de lenguaje natural; no es adecuado para tareas fuera de la generación de PGN.
- El modelo se publicó con 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria independiente de los resultados reportados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Arisp/chess-pgn-1000-1300-rl
- Modelo base: https://huggingface.co/Arisp/chess-pgn-1000-1300
- Repositorio de código (scripts de entrenamiento y evaluación): https://github.com/AriSpiesberger/Memorize
- Script de ajuste fino citado en la model card: `rl_pgn_games.py` (en el repositorio anterior)
- Script de evaluación citado en la model card: `chess_beyond/transcend/pgn/eval.py` (en el repositorio anterior)
