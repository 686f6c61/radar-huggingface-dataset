# Arisp/chess-pgn-2400plus-rl

## Resumen

chess-pgn-2400plus-rl es un ajuste fino del modelo Arisp/chess-pgn-2400plus, un transformer a nivel de carácter entrenado exclusivamente con partidas de Lichess de jugadores con rating 2400 o superior. El desarrollador, Arisp, aplica aquí una fase de aprendizaje por refuerzo offline basada en imitación ponderada por resultado: en lugar de aprender de todas las jugadas humanas por igual, el modelo recibe gradiente únicamente sobre las jugadas del ganador de cada partida decisiva. El resultado es un modelo que juega aproximadamente 120-180 puntos Glicko-2 por encima de su base sin abandonar las líneas humanas.

El modelo resuelve un problema concreto: cómo mejorar la fuerza de juego de un modelo de imitación de partidas humanas sin recurrir a self-play, a un motor de ajedrez ni a rollouts. La innovación está en el método de entrenamiento, no en la arquitectura: se mantiene idéntica a la del modelo base, con unos 51 millones de parámetros y una ventana de contexto de 1.024 caracteres sobre notación PGN.

Es relevante para investigadores interesados en RLHF ligero y en métodos de preferencia sin motor, así como para desarrolladores que quieran un generador de jugadas humanas de nivel maestro sin dependencias de Stockfish en tiempo de inferencia. La licencia MIT y el formato safetensors facilitan su integración.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer a nivel de carácter (character-level), decodificador autorregresivo sobre PGN |
| Parametros totales | 50.997.248 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 caracteres (según limitaciones declaradas por el autor) |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin cuantizaciones publicadas) |
| Idiomas soportados | no aplica; entrada y salida en notación PGN (SAN) |
| Licencia | MIT |
| Formato de pesos | safetensors (pytorch) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer a nivel de carácter que procesa la secuencia PGN completa (números de jugada, jugadas en SAN y resultado) y predice el siguiente carácter. No hay tokenizador de ajedrez ni representación de tablero en la entrada; el modelo infiere la posición exclusivamente a partir del historial de jugadas. El repositorio incluye `pgn_model.py` con las clases `PGNTransformer` y `generate_moves`, y un `config.json` con el bloque `architecture` que parametriza el modelo.

El ajuste fino se realizó sobre las mismas 4.058.368 partidas del conjunto de entrenamiento original, filtradas para excluir las que terminaron por tiempo, abandono o infracción de reglas. En cada partida decisiva el modelo adopta el papel del ganador y solo las jugadas del ganador reciben pérdida (entropía cruzada por carácter sobre cada jugada); las jugadas del perdedor y los números de jugada actúan como contexto. En tablas, el modelo asume un bando aleatorio con peso 0,5. Se añade un término KL de 0,1 entre la política del modelo y la del modelo base en los mismos caracteres para mantener proximidad a la distribución humana. Optimizador AdamW, learning rate 1e-05, 256 partidas por paso, una sola pasada. No hay self-play, ni motor, ni rollouts. La consecuencia estructural es que el modelo solo puede desplazar probabilidad hacia jugadas que algún humano jugó realmente: no puede descubrir jugadas nuevas, solo reweightar las existentes hacia las que ganaron.

## Capacidades

- Generación de jugadas de ajedrez en notación SAN a partir de un historial PGN, de forma autorregresiva carácter a carácter.
- Juego completo de partidas: el script `generate_moves` acepta una lista de tableros `chess.Board` y devuelve la jugada elegida, con reintentos si la primera propuesta es ilegal.
- Control de temperatura de muestreo (0.001, 0.01, 0.1, 1 evaluados en la model card), lo que permite desde juego casi determinista hasta variabilidad alta.
- Estilo de juego humano de banda 2400+: la evaluación de human-likeness reporta 54,1% de top-1, 79,1% de top-3 y 89,3% de top-5 coincidencia con la jugada humana en posiciones reservadas.
- No soporta tool calling, function calling, agentes multi-paso, visión, audio ni capacidades multilingües: es un modelo de dominio único.
- No incorpora modo de razonamiento explícito ni cadena de pensamiento; la "decisión" es la distribución de siguiente carácter.

## Casos de uso

- Generación de partidas de entrenamiento con estilo humano: el modelo produce partidas plausibles de nivel maestro que pueden usarse como datos sintéticos para entrenar otros modelos o para aumentar datasets de ajedrez, ya que su distribución se mantiene anclada a las líneas humanas por el término KL.
- Análisis de estilo y preparación de aperturas: al muestrear con temperaturas bajas se obtienen las jugadas más probables de la banda 2400+, útil para estudiar qué líneas eligen jugadores fuertes en posiciones concretas.
- Benchmark de métodos de RL ligero: sirve como referencia reproducible para comparar variantes de imitación ponderada por resultado frente a imitación estándar, con métricas de Glicko-2 y de human-likeness ya publicadas.
- Generación de puzzles y posiciones de práctica: las partidas generadas pueden filtrarse para extraer posiciones tácticas, aprovechando que el modelo juega líneas humanas con errores incluidos.
- Componente en pipelines de análisis de PGN: integrado en herramientas que necesiten completar o continuar una partida desde un historial dado, sin dependencia de Stockfish ni de binarios externos.
- Investigación en alineación sin motor: caso de estudio de cómo una señal de recompensa escasa (solo el resultado de la partida) puede mejorar la fuerza de juego manteniendo la fidelidad a la distribución humana, replicable con el script `rl_pgn_games.py` del repositorio del autor.

## Benchmarks y rendimiento

Datos publicados en la model card, evaluados con `chess_beyond/transcend/pgn/eval.py` del repositorio AriSpiesberger/Memorize. Glicko-2 sobre niveles 1, 3 y 5 de Stockfish de Lichess (Fairy-Stockfish), 100 partidas por nivel desde 50 aperturas; intervalo del 95% aproximado de ±74.

| Temperatura | chess-pgn-2400plus | chess-pgn-2400plus-rl | Cambio |
|---|---|---|---|
| 0.001 | 1790 | 1909 | +119 |
| 0.01 | 1778 | 1933 | +155 |
| 0.1 | 1735 | 1913 | +178 |
| 1 | 1278 | 1425 | +147 |

Puzzles de Lichess con su historial de partida, 2.000 por rating (1050, 2400, 2600, 2800), rating de puzzle:

| Temperatura | chess-pgn-2400plus | chess-pgn-2400plus-rl |
|---|---|---|
| 0.001 | 1192 | 1262 |
| 0.01 | 1189 | 1264 |
| 0.1 | 1186 | 1259 |
| 1 | 1021 | 1070 |

Human-likeness sobre posiciones reservadas de la banda, temperatura 0.001:

| Modelo | top-1 | top-3 | top-5 | Pérdida vs mejor jugada (Stockfish, profundidad 12) |
|---|---|---|---|---|
| chess-pgn-2400plus | 53,6% | 79,1% | 89,7% | 5,94% |
| chess-pgn-2400plus-rl | 54,1% | 79,1% | 89,3% | 6,03% |

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 100 MB en fp32 para los 51 millones de parámetros, más el estado del tablero y el historial; cabe holgadamente en cualquier GPU consumer y en CPU.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU. Cualquier GPU con al menos 1 GB de VRAM es suficiente. Para lotes grandes de generación, una RTX 3060 o superior acelera el proceso.
- Cabe en consumer GPU: sí, en todas las GPU actuales e incluso en sistemas embebidos con suficiente memoria.
- Opciones de despliegue: el repositorio proporciona carga directa con `safetensors.torch.load_file` y `huggingface_hub.snapshot_download`, con `dev="cpu"` o GPU. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, y al no ser un modelo de lenguaje estándar no son aplicables directamente.
- Latencia y throughput: no disponibles en la información proporcionada. La generación es carácter a carácter con reintentos ante jugadas ilegales (hasta 5 intentos según el ejemplo de uso).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Fuerza estimada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| chess-pgn-2400plus-rl | 50.997.248 | 1.024 caracteres | Glicko-2 ~1909-1933 | MIT | HuggingFace |
| chess-pgn-2400plus (base) | no disponible en la información | 1.024 caracteres | Glicko-2 ~1735-1790 | MIT | HuggingFace |
| Motores de ajedrez clásicos (Stockfish, Leela) | no disponible | no aplica | Muy superior a 2400 | GPL / otras | Binarios |

No se dispone de datos de otros modelos de ajedrez a nivel de carácter comparables en la información proporcionada. La comparación principal es con su propio modelo base, del que mejora entre 119 y 178 puntos Glicko-2 según temperatura, a costa de una pérdida de human-likeness marginal (top-1 sube 0,5 puntos, top-5 baja 0,4 puntos y la pérdida frente a la mejor jugada pasa de 5,94% a 6,03%).

## Limitaciones y advertencias

- El modelo conoce la posición solo por el historial de jugadas; no recibe el tablero y puede ocasionalmente proponer jugadas ilegales. El código de ejemplo reintenta hasta 5 veces y devuelve `None` si todas fallan.
- A partir de la jugada 80-100 aproximadamente, la partida deja de caber en la ventana de 1.024 caracteres y el modelo pierde contexto.
- Juega como un jugador fuerte de su banda, con errores incluidos; no es un motor y no debe usarse como sustituto de Stockfish para análisis de precisión.
- No puede aprender jugadas que ningún humano haya jugado: el método solo reweighta la distribución existente, lo que limita su techo de fuerza.
- Riesgo de alucinación en el sentido de generar secuencias PGN sintácticamente válidas pero ilegales o incoherentes, especialmente con temperaturas altas.
- Sesgos derivados del corpus: solo partidas de Lichess de jugadores 2400+, lo que sesga el estilo hacia esa población y plataforma; no se documentan sesgos adicionales.
- Licencia MIT: permite uso comercial sin restricciones declaradas, pero conviene verificar la procedencia del corpus de Lichess y las condiciones de uso de sus datos.
- El repositorio tiene 0 descargas y 0 likes en el momento de la ficha, sin validación independiente por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Arisp/chess-pgn-2400plus-rl
- Modelo base: https://huggingface.co/Arisp/chess-pgn-2400plus
- Repositorio de código (scripts de entrenamiento y evaluación): https://github.com/AriSpiesberger/Memorize
