# Arisp/chess-board-2400plus-b

## Resumen

chess-board-2400plus-b es un transformer de 22,4 millones de parámetros desarrollado por Arisp que predice el movimiento que jugaría un humano con una puntuación Elo de 2400 o superior, tomando como entrada únicamente la posición actual del tablero. A diferencia de los motores de ajedrez clásicos, no realiza búsqueda ni utiliza etiquetas de motor: se entrena exclusivamente por imitación de las jugadas humanas registradas en partidas de Lichess donde ambos jugadores superaban los 2400 puntos de Elo.

El modelo forma parte de un par de variantes entrenadas con la misma receta. Esta variante B incorpora una cabeza de movimiento, una cabeza de resultado y dos cabezas auxiliares que predicen la respuesta del oponente y la jugada de seguimiento del propio jugador. La variante A, más sencilla, solo incluye las cabezas de movimiento y resultado. Ambas son versiones con entrada de tablero de los modelos de secuencia de movimientos del repositorio Memorize del mismo autor.

Su relevancia radica en su enfoque de interpretabilidad: el autor evalúa el modelo con las pruebas de look-ahead propuestas por Jenner et al. (2024) sobre el modelo Leela Chess Zero, demostrando que un transformer de solo 22M de parámetros entrenado por imitación desarrolla representaciones internas que anticipan jugadas futuras. El modelo se distribuye con licencia MIT y pesos en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con stem convolucional (3 convoluciones 3x3) y 12 bloques pre-LayerNorm, d=384, 6 cabezas, MLP ReLU (x4), sin máscara de atención |
| Parametros totales | 22.446.927 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrada de tablero de 64 tokens, uno por casilla; sin ventana de contexto secuencial) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo específico de ajedrez, sin capacidades lingüísticas) |
| Licencia | MIT |
| Formato de pesos | safetensors (repo de 0,1 GB) |

## Arquitectura y entrenamiento

La entrada se construye desde la perspectiva del bando que mueve (para las negras el tablero se refleja y los colores se intercambian): un código de pieza por casilla, más los derechos de enroque, la casilla de captura al paso, el contador de repeticiones y las casillas del movimiento anterior, todo ello embebido y sumado a cada token de casilla. El stem aplica tres convoluciones 3x3 sobre el tablero de 8x8 y genera un embedding aprendido por casilla. El cuerpo son 12 bloques transformer pre-LayerNorm con dimensión 384, 6 cabezas y MLP ReLU con factor de expansión x4, sin máscara de atención.

La cabeza de movimiento es de tipo origen-destino: cada casilla produce una query y una key, y el logit de un movimiento es el producto de la query de la casilla de origen por la key de la casilla de destino, más un término de promoción. Se puntúa sobre un vocabulario fijo de 1.968 movimientos en el marco del jugador que mueve. La cabeza de resultado predice victoria, tablas o derrota para el bando que mueve a partir de la media de los tokens finales. La pérdida combina entropía cruzada de movimiento (peso 1,0) con resultado (0,3), respuesta (0,3) y jugada de seguimiento (0,3).

El entrenamiento usó 10 millones de partidas estándar valoradas de Lichess entre marzo de 2023 y junio de 2025, con ambos jugadores por encima de 2400 y un tiempo inicial de reloj de al menos 180 segundos. Se reservaron 5.000 partidas para evaluación (las más recientes). Cada época muestrea 16 posiciones aleatorias de cada partida de entrenamiento, lo que supone 160 millones de posiciones por época. Se usó AdamW (betas 0,9/0,95, weight decay 0,1), batch de 2.048 posiciones, bf16 y una NVIDIA B200. El entrenamiento total fue de 5 épocas (389.900 pasos, aproximadamente 800 millones de posiciones): 2 épocas con schedule coseno (pico 1e-3, 2.000 pasos de warmup) y 3 épocas adicionales continuando desde los pesos y el estado del optimizador guardados (re-warmup a 5e-4, coseno hasta 1e-5).

## Capacidades

- Predicción del movimiento más probable de un jugador de 2400+ de Elo a partir de la posición del tablero.
- Predicción del resultado de la partida (victoria, tablas o derrota) para el bando que mueve, con calibración medida (ECE de 0,0227).
- Predicción auxiliar de la respuesta del oponente (top-1 de 0,4554 en held-out).
- Predicción auxiliar de la jugada de seguimiento del propio jugador tras la respuesta (top-1 de 0,3034 en held-out).
- Manejo de todas las reglas del ajedrez estándar: enroques, capturas al paso, promociones y repeticiones (la entrada incluye derechos de enroque, casilla al paso y contador de repeticiones).
- Representación interna de look-ahead: las pruebas de probing y patching muestran que el modelo codifica información sobre la tercera jugada de una línea de puzzle antes de jugarla.
- Sin capacidades de lenguaje natural, visión, audio, tool calling ni razonamiento multi-paso fuera del ámbito del ajedrez.

## Casos de uso

- Análisis de estilo humano en preparación de partidas: dado un tablero, el modelo devuelve la distribución de probabilidad sobre los movimientos legales que un jugador de 2400+ elegiría, lo que permite estudiar qué jugadas son "humanamente probables" frente a las que solo un motor elegiría.
- Entrenamiento de jugadores y estudio de repertorios: comparar la jugada propia con la distribución del modelo para detectar desviaciones respecto al estilo de un jugador de 2400+ y ajustar el repertorio de aperturas.
- Generación de oponentes sintéticos de nivel 2400+ para entrenamiento o evaluación de otros sistemas: el modelo puede jugar de forma greedy (top-1 legal) y su rating en la escala Maia-2 es de 2390 ± 74.
- Investigación en interpretabilidad de redes neuronales aplicadas a ajedrez: el modelo reproduce el protocolo de look-ahead de Jenner et al. (2024) con resultados publicados, lo que lo convierte en una base ligera (22M de parámetros) para estudiar circuitos internos y atención.
- Evaluación de calibración de modelos de resultado: la cabeza de resultado, con ECE de 0,0227, permite estudiar la calibración de probabilidades de victoria en función de la posición y del bando.
- Benchmarking de modelos de imitación de ajedrez: sirve como referencia de comparación frente a modelos de secuencia de movimientos (el "twin" del propio autor) y frente a Maia-2 o Maia-3 en tareas de predicción de jugadas humanas.
- Análisis de resolución de puzzles: con un 71,2 % de puzzles resueltos en el primer movimiento y un 70,1 % de líneas completas sobre 22.517 puzzles de Lichess, puede usarse como componente en pipelines de evaluación de razonamiento táctico.

## Benchmarks y rendimiento

Resultados en las 5.000 partidas reservadas. "Twin" es el modelo de secuencia de movimientos entrenado con las mismas partidas, comparado sobre las mismas posiciones (plies 0-182, su ventana de contexto).

| Metrica | Este modelo (twin) |
|---|---|
| Pérdida de movimiento, plies 0-182 | 1,1838 (1,3798) |
| Top-1 (la jugada jugada es la principal), plies 0-182 | 0,5943 (0,5445) |
| Pérdida de movimiento / top-1, todos los plies | 1,1909 / 0,5920 |
| Entropía cruzada de resultado (baseline de frecuencia; por ply y color) | 0,8594 (1,0531; 1,0243) |
| Error de calibración de resultado (ECE) | 0,0227 |
| Probabilidad en movimientos ilegales (twin con tokens especiales) | 0,0006 (0,0158) |
| Movimiento principal ilegal (raw) | 0,0000 |
| Puntuación contra Lichess nivel 1 / 3 / 5 (twin) | 0,990 (0,985) / 0,990 (0,915) / 0,955 (0,485) |
| Rating, escala Maia-2 (twin) | 2390 ± 74 (1953) |
| Puntuación contra el twin | 0,890 |

Cabezas auxiliares (held-out): top-1 de respuesta (pérdida) 0,4554 (1,7174); top-1 de jugada de seguimiento (pérdida) 0,3034 (2,5365).

Look-ahead (Jenner et al., 2024), sobre puzzles de Lichess. "Common": puzzles que este modelo resuelve; "failed": los que no resuelve.

| Metrica | Valor |
|---|---|
| Puzzles resueltos, primer movimiento / línea completa (22.517 puzzles) | 0,712 / 0,701 |
| Patching de la casilla objetivo del 3.er movimiento: caída de log-odds frente a otras casillas (common) | L5/12: 2,21 vs 0,64 otras (1.º: 2,08; n=1883) |
| Probe para la casilla objetivo del 3.er movimiento (common) | 0,912 vs 0,334 con inicialización aleatoria (mejor capa 11) |
| Atención objetivo del 1.er movimiento -> objetivo del 3.er movimiento, tasa de top-key (common) | 0,846 (L10H4), anulándola 2,65 vs 0,11 en todas las demás entradas |
| Patching (failed) | L9/12: 0,28 vs 0,16 otras (1.º: 0,38; n=3010) |
| Probe (failed) | 0,687 vs 0,119 con inicialización aleatoria (mejor capa 10) |

Comparación: Leela T82 en su conjunto common obtiene patching 2,21 vs 0,48 y probe 95 % vs 42 %; Maia-3 23M @1900 obtiene 2,13 vs 0,41, 86 % vs 24 %, y resuelve el 46,9 % / 45,7 % de los mismos puzzles.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 22,4 millones de parámetros (aproximadamente 90 MB en fp32 y 45 MB en bf16); la inferencia cabe holgadamente en cualquier GPU consumer con más de 1 GB de VRAM.
- GPU recomendadas: cualquier GPU moderna es suficiente; el entrenamiento se realizó en una NVIDIA B200, pero la inferencia no requiere hardware de datacenter. Una RTX 4090, RTX 3090 o incluso una GPU integrada pueden ejecutar el modelo.
- Cabe en GPU consumer: sí, en cualquier GPU consumer actual e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: el modelo se carga con PyTorch y safetensors mediante el código incluido en el repositorio (`bt_model.py`, `bt_data.py`); requiere `torch`, `python-chess`, `numpy` y `safetensors`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, dado que no es un modelo de lenguaje.
- Latencia y throughput estimados: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| chess-board-2400plus-b | 22,4M | Tablero de 64 casillas (sin ventana secuencial) | Top-1 0,5943; rating Maia-2 2390 ± 74; 71,2 % de puzzles resueltos | MIT | Hugging Face |
| chess-board-2400plus-a | no disponible | Tablero de 64 casillas | no disponible (solo cabezas de movimiento y resultado) | MIT | Hugging Face |
| Twin (modelo de secuencia de movimientos del mismo autor) | no disponible | Secuencia de movimientos, plies 0-182 | Top-1 0,5445; rating Maia-2 1953; 48,5 % de puntuación contra Lichess nivel 5 | no disponible | Repositorio Memorize |
| Maia-3 23M @1900 | 23M | no disponible | Patching 2,13 vs 0,41; probe 86 % vs 24 %; 46,9 % / 45,7 % de los puzzles | no disponible | no disponible |
| Leela T82 | no disponible | no disponible | Patching 2,21 vs 0,48; probe 95 % vs 42 % | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo imita jugadores humanos de 2400+ de Lichess; no es un motor de ajedrez y no realiza búsqueda. Su fuerza de juego está limitada por la calidad de las jugadas humanas imitadas.
- No incluye máscara de movimientos legales en la inferencia: aunque la probabilidad en movimientos ilegales es muy baja (0,0006) y el movimiento principal raw nunca es ilegal en held-out, el usuario debe filtrar los movimientos legales con `python-chess` para garantizar jugadas válidas.
- La entrada requiere mantener la pila de movimientos del tablero (`chess.Board`) para proporcionar el movimiento anterior y el contador de repeticiones; sin esa información el rendimiento puede degradarse.
- El modelo está entrenado exclusivamente con partidas estándar valoradas de Lichess con ambos jugadores por encima de 2400 y reloj inicial de al menos 180 segundos; su comportamiento fuera de esa distribución (partidas rápidas, jugadores de menor nivel, variantes) no está documentado.
- No dispone de capacidades de lenguaje natural, visión ni tool calling; no es adecuado para tareas fuera del ajedrez.
- Los datos de sesgos, alucinación en el sentido lingüístico y limitaciones idiomáticas no aplican, pero no se documentan análisis de sesgo por estilo de juego, apertura o demografía de jugadores.
- La licencia MIT permite uso comercial, pero el modelo se distribuye sin garantías y el autor no documenta soporte ni mantenimiento.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en producción ni validación externa independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Arisp/chess-board-2400plus-b
- Variante A: https://huggingface.co/Arisp/chess-board-2400plus-a
- Repositorio Memorize (modelos de secuencia de movimientos): https://github.com/AriSpiesberger/Memorize
- Paper de referencia sobre look-ahead: Jenner et al., 2024, "Evidence of Learned Look-Ahead in a Chess-Playing Neural Network" (no se proporciona URL directa en la información disponible)
