# Arisp/chess-board-2400plus-a

## Resumen

`chess-board-2400plus-a` es un transformer de 22 millones de parámetros desarrollado por Arisp que predice el movimiento que jugaría un humano con una puntuación de 2400 o superior en Lichess, tomando como entrada únicamente la posición del tablero. A diferencia de los motores de ajedrez clásicos, no realiza búsqueda ni utiliza etiquetas de motor: se entrena exclusivamente por imitación de partidas humanas de alto nivel, lo que lo convierte en una herramienta de modelado del comportamiento humano en el ajedrez más que en un motor de juego óptimo.

El modelo forma parte de un par de variantes entrenadas con la misma receta. La variante A, descrita aquí, incluye una cabeza de movimiento y una cabeza de resultado (victoria, tablas o derrota para el bando que mueve). La variante B añade cabezas para la réplica del oponente y el movimiento de seguimiento. Ambos son versiones con entrada de tablero de los modelos de secuencia de movimientos del repositorio `AriSpiesberger/Memorize`.

Su relevancia actual reside en el interés por la interpretabilidad de redes neuronales en ajedrez: el modelo card documenta experimentos de *look-ahead* (capacidad de anticipar movimientos futuros) siguiendo la metodología de Jenner et al. (2024), con resultados que sugieren que el modelo aprende representaciones internas del tercer movimiento antes de jugarlo. Esto lo hace útil tanto para investigación en interpretabilidad como para aplicaciones de predicción de movimiento humano y análisis de partidas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con stem convolucional (3 convoluciones 3x3 sobre tablero 8x8), 12 bloques pre-LayerNorm, d=384, 6 cabezas, MLPs ReLU (x4), sin máscara |
| Parámetros totales | 22.246.727 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica en el sentido de tokens de texto; entrada fija de 64 tokens de casilla. En la comparación con el modelo gemelo se evalúan plies 0-182 |
| Tipos de cuantización | No disponible (pesos en safetensors, sin variantes GGUF ni cuantizadas publicadas) |
| Idiomas soportados | No disponible (modelo específico de ajedrez, sin capacidades de lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | safetensors (también incluye `config.json`, `bt_model.py`, `bt_data.py`, `move_tokens.py`) |

## Arquitectura y entrenamiento

La entrada se construye desde la perspectiva del bando que mueve: para las negras el tablero se refleja y los colores se intercambian. Cada casilla aporta un código de pieza, y los derechos de enroque, la casilla de captura al paso, el contador de repeticiones y las casillas del movimiento anterior se embeben y suman a cada token de casilla. El stem aplica tres convoluciones 3x3 sobre el tablero de 8x8 y después una embedding aprendida por casilla. El cuerpo son 12 bloques transformer pre-LayerNorm con d=384, 6 cabezas y MLPs ReLU con factor de expansión 4. La cabeza de movimiento es de tipo origen-destino: cada casilla produce una query y una key, y el logit de un movimiento es el producto de la query de la casilla de origen por la key de la casilla de destino, más un término de promoción, evaluado sobre un vocabulario fijo de 1.968 movimientos en el marco del que mueve. La cabeza de resultado (victoria, tablas o derrota) se obtiene de la media de los tokens finales.

El entrenamiento usa 10 millones de partidas estándar de Lichess entre marzo de 2023 y junio de 2025, con ambos jugadores por encima de 2400 y reloj inicial de al menos 180 segundos, más 5.000 partidas de validación (las más recientes). Cada época muestrea 16 posiciones aleatorias de cada partida de entrenamiento, lo que da 160 millones de posiciones por época. La pérdida combina entropía cruzada de movimiento (peso 1,0) y de resultado (peso 0,3). Se usa AdamW (betas 0,9/0,95, weight decay 0,1), batch de 2.048 posiciones, bf16 y una NVIDIA B200. El entrenamiento total fue de 5 épocas y 389.900 pasos (unos 800 millones de posiciones), con un primer tramo de 2 épocas con schedule coseno (pico 1e-3, 2.000 pasos de warmup) y tres épocas adicionales continuando desde los pesos y el estado del optimizador guardados (re-warmup a 5e-4, coseno hasta 1e-5).

## Capacidades

- Predicción del movimiento más probable de un jugador humano de 2400+ a partir de la posición del tablero, sin búsqueda ni etiquetas de motor.
- Cabeza de resultado que estima la probabilidad de victoria, tablas o derrota para el bando que mueve.
- Evaluación sobre un vocabulario fijo de 1.968 movimientos en el marco del que mueve, con término específico de promoción.
- Manejo de información de estado completa: derechos de enroque, casilla de captura al paso, repeticiones y movimiento anterior.
- Capacidad de generalización a posiciones de partidas no vistas (5.000 partidas de validación).
- Capacidad documentada de *look-ahead* implícito: los experimentos de probing y patching muestran que el modelo representa internamente el objetivo del tercer movimiento antes de jugarlo.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso genérico ni capacidades multilingües; es un modelo específico de ajedrez.

## Casos de uso

- Predicción de movimiento humano en análisis de partidas: dado un tablero, el modelo devuelve la distribución sobre movimientos legales, útil para comparar la jugada real de un jugador de 2400+ con la predicción y detectar desviaciones estilísticas o errores.
- Entrenamiento de modelos de ajedrez por imitación: sirve como referencia o punto de partida para recetas de imitación de alto nivel sin búsqueda, con una receta reproducible documentada (pérdidas, schedule, datos).
- Investigación en interpretabilidad: el modelo permite replicar y extender los experimentos de *look-ahead* de Jenner et al. (2024) sobre un transformer entrenado solo por imitación, con resultados de probing y patching ya publicados en la model card.
- Generación de datos sintéticos de estilo humano: las distribuciones de movimiento pueden usarse para aumentar datasets de partidas con jugadas plausibles de nivel 2400+.
- Evaluación comparativa de modelos de ajedrez: la cabeza de resultado y la calibración (ECE 0,0239) permiten medir la calidad de las estimaciones de resultado en posiciones de validación.
- Análisis de calibración y sesgos de predicción: la cabeza de resultado bien calibrada facilita estudiar cómo varía la estimación de resultado según el bando y la fase de la partida.
- Docencia y divulgación: visualizar qué movimientos considera probables un jugador de alto nivel en una posición concreta, con probabilidades sobre movimientos legales.

## Benchmarks y rendimiento

Resultados en las 5.000 partidas de validación. "Gemelo" es el modelo de secuencia de movimientos entrenado con las mismas partidas, comparado en las mismas posiciones (plies 0-182, su ventana de contexto).

| Métrica | Este modelo (gemelo) |
|---|---|
| Pérdida de movimiento, plies 0-182 | 1,1978 (1,3798) |
| Top-1 (el movimiento jugado es el más probable), plies 0-182 | 0,5896 (0,5445) |
| Pérdida de movimiento / top-1, todos los plies | 1,2047 / 0,5873 |
| Entropía cruzada de resultado (baseline de frecuencia; por ply y color) | 0,8620 (1,0531; 1,0243) |
| Error de calibración del resultado (ECE) | 0,0239 |
| Probabilidad sobre movimientos ilegales (gemelo incl. tokens especiales) | 0,0005 (0,0158) |
| Movimiento top en bruto ilegal | 0,0000 |
| Puntuación contra Lichess nivel 1 / 3 / 5 (gemelo) | 0,995 (0,985) / 1,000 (0,890) / 0,910 (0,440) |
| Rating, escala Maia-2 (gemelo) | 2366 ± 74 (1897) |
| Puntuación contra el gemelo | 0,825 |

Partidas jugadas con movimiento legal top codicioso, 50 aperturas de partidas de validación con ambos colores, 100 partidas por oponente. Los niveles son los de Stockfish de Lichess (Fairy-Stockfish).

Look-ahead (Jenner et al., 2024), sobre puzzles de Lichess:

| Métrica | Valor |
|---|---|
| Puzzles resueltos, primer movimiento / línea completa (22.517 puzzles) | 0,687 / 0,674 |
| Patching de la casilla objetivo del 3.er movimiento: caída de log-odds frente a otras casillas (comunes) | L3/12: 2,30 vs 0,58 otras (1.º 2,39; n=1736) |
| Probe de la casilla objetivo del 3.er movimiento (comunes) | 0,888 vs inicialización aleatoria 0,371 (mejor capa 10) |
| Atención objetivo 1.er movimiento -> objetivo 3.er movimiento, tasa de top-key (comunes) | 0,808 (L11H3), anulándola 1,48 vs 0,05 en el resto de entradas |
| Patching (fallidos) | L4/12: 0,28 vs 0,24 otras (1.º 0,32; n=3085) |
| Probe (fallidos) | 0,634 vs inicialización aleatoria 0,117 (mejor capa 9) |

Comparación indicada en la model card: Leela T82 en su conjunto común obtiene patching 2,21 vs 0,48 y probe 95% vs 42%; Maia-3 23M @1900 obtiene 2,13 vs 0,41, 86% vs 24%, y resuelve el 46,9% / 45,7% de los mismos puzzles.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 22,2 millones de parámetros; en fp32 ocupa aproximadamente 89 MB, en bf16 unos 45 MB. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM; el entrenamiento se realizó en una NVIDIA B200, pero la inferencia no requiere hardware de datacenter.
- Cabe en GPU consumer: sí, en cualquier tarjeta moderna (RTX 3060, RTX 4090, etc.) e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: el modelo se carga con PyTorch y safetensors mediante el código incluido en el repositorio (`bt_model.py`, `bt_data.py`). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, dado que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| chess-board-2400plus-a (este) | 22,2 M | Tablero (64 tokens de casilla) | Top-1 0,5896; rating Maia-2 2366 ± 74; resuelve 68,7% / 67,4% de puzzles | MIT | Hugging Face |
| chess-board-2400plus-b (gemelo del mismo autor) | No disponible | Tablero (64 tokens de casilla) | No disponible en la información proporcionada | MIT | Hugging Face |
| Modelo gemelo de secuencia de movimientos (mismo autor) | No disponible | Secuencia de movimientos, plies 0-182 | Top-1 0,5445; rating Maia-2 1897; pierde 0,825 contra este modelo | No disponible | Repositorio `AriSpiesberger/Memorize` |
| Maia-3 23M @1900 | 23 M | No disponible | 46,9% / 45,7% de los puzzles; patching 2,13 vs 0,41; probe 86% vs 24% | No disponible | No disponible en la información proporcionada |
| Leela T82 | No disponible | No disponible | Patching 2,21 vs 0,48; probe 95% vs 42% | No disponible | No disponible en la información proporcionada |

## Limitaciones y advertencias

- Modelo específico de ajedrez: no procesa lenguaje natural ni admite instrucciones, tool calling ni razonamiento genérico.
- Entrenado solo por imitación de jugadores de 2400+ en Lichess; no es un motor de ajedrez óptimo y su juego puede ser inferior al de motores con búsqueda.
- La predicción se limita a un vocabulario fijo de 1.968 movimientos; movimientos fuera de ese vocabulario no se puntúan directamente.
- El modelo asume la perspectiva del bando que mueve y requiere el historial de movimientos para calcular repeticiones y el movimiento anterior; un tablero sin pila de movimientos puede degradar la calidad de la predicción.
- Riesgo de alucinación en el sentido de movimientos plausibles pero incorrectos: aunque la probabilidad sobre movimientos ilegales es muy baja (0,0005), el top-1 solo acierta el 58,96% de las veces en plies 0-182.
- Sesgos derivados de los datos: solo partidas de Lichess con ambos jugadores por encima de 2400 y reloj inicial de al menos 180 segundos; el comportamiento en otros formatos (bullet, blitz corto) o en poblaciones de menor nivel no está validado.
- Calibración del resultado buena en promedio (ECE 0,0239), pero no se documentan análisis por fase de la partida ni por apertura concreta.
- Licencia MIT: permite uso comercial y modificación, pero no se especifican garantías ni limitaciones adicionales más allá de las estándar de la licencia.
- No se han publicado variantes cuantizadas ni integraciones con runtimes de inferencia optimizados, lo que limita el despliegue en entornos sin PyTorch.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Arisp/chess-board-2400plus-a
- Variante B: https://huggingface.co/Arisp/chess-board-2400plus-b
- Repositorio del autor (modelos de secuencia de movimientos, `chess_beyond/transcend/boardtf/`): https://github.com/AriSpiesberger/Memorize
- Paper de referencia sobre look-ahead: Jenner et al., 2024, *Evidence of Learned Look-Ahead in a Chess-Playing Neural Network* (no se proporciona URL directa en la información disponible)
