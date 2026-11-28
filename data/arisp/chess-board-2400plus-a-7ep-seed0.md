# Arisp/chess-board-2400plus-a-7ep-seed0

## Resumen

`chess-board-2400plus-a-7ep-seed0` es un transformer de 22 millones de parámetros desarrollado por Arisp que predice el movimiento que jugaría un humano con Elo 2400 o superior a partir de la posición actual del tablero de ajedrez. El modelo se entrena exclusivamente por imitación de movimientos humanos reales extraídos de partidas de Lichess, sin búsqueda, sin etiquetas de motor y sin máscara de legalidad, lo que lo convierte en una herramienta orientada al modelado del comportamiento humano en ajedrez más que a la fuerza de juego.

La arquitectura procesa el tablero como 64 tokens (uno por casilla) desde la perspectiva del lado que mueve, con un stem convolucional de tres capas 3x3 seguido de 12 bloques transformer pre-LayerNorm con dimensión 384 y 6 cabezas. Dispone de dos cabezas: una de movimiento con vocabulario fijo de 1.968 movimientos (source-destination con término de promoción) y otra de resultado (victoria, tablas, derrota para el lado que mueve). Se publica junto a un segundo seed con ajustes idénticos para estudiar la variación entre inicializaciones.

El interés del modelo reside en su enfoque de interpretabilidad y en su escala de entrenamiento: 10 millones de partidas de Lichess entre marzo de 2023 y junio de 2025, con 159,7 millones de posiciones muestreadas por época y 7 épocas completas (~1.118 millones de posiciones vistas). Es un caso de estudio útil para investigación en imitación de ajedrez humano, análisis de estilo de juego y comparación con modelos de secuencia de movimientos del mismo autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con stem convolucional (3 convoluciones 3x3) sobre tablero 8x8; 12 bloques pre-LayerNorm, d=384, 6 cabezas, MLP ReLU x4, sin máscara |
| Parámetros totales | 22.246.727 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (entrada fija de 64 tokens de casilla) |
| Tipos de cuantización | No disponible (pesos publicados en safetensors sin cuantización oficial) |
| Idiomas soportados | No disponible (modelo específico de ajedrez, sin procesamiento de lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | safetensors (con `config.json` y código Python: `bt_model.py`, `bt_data.py`, `move_tokens.py`) |

## Arquitectura y entrenamiento

El modelo recibe el tablero como 64 tokens de casilla desde la perspectiva del lado que mueve (para negras el tablero se refleja y se intercambian los colores). Cada casilla incorpora un código de pieza, y a todos los tokens se les suma la información de estado: derechos de enroque, casilla de al paso, contador de repeticiones y casillas del movimiento anterior, todo embebido. Un stem de tres convoluciones 3x3 sobre el tablero 8x8 extrae características locales antes de proyectar a la dimensión del cuerpo transformer de 12 bloques (d=384, 6 cabezas, MLP ReLU con factor 4, sin máscara de atención).

La cabeza de movimiento implementa un mecanismo source-destination: cada casilla produce una query y una key, y el logit de un movimiento es el producto escalar entre la query de la casilla origen y la key de la casilla destino, más un término de promoción, evaluado sobre un vocabulario fijo de 1.968 movimientos en el marco del que mueve. La cabeza de resultado produce win/draw/loss para el lado que mueve a partir de la media de los tokens finales. La pérdida combina entropía cruzada de movimiento (peso 1,0) y de resultado (peso 0,3). Se entrenó con AdamW (betas 0,9/0,95, weight decay 0,1), batch de 2.048 posiciones, bf16 y una NVIDIA B200, durante 7 épocas con schedule coseno (pico 0,001, 2.000 pasos de warmup, mínimo 1e-05), totalizando 545.860 pasos y ~1.118 millones de posiciones. Los datos provienen de partidas estándar valoradas de Lichess (marzo 2023 a junio 2025) con ambos jugadores por encima de 2400 y reloj inicial de al menos 180 segundos: 10 millones de partidas de entrenamiento y 5.000 de held-out (las más recientes), excluyendo partidas origen de puzles de Lichess en los conjuntos de evaluación.

## Capacidades

- Predicción del movimiento más probable de un jugador humano de Elo 2400+ dada la posición actual del tablero.
- Evaluación de resultado esperado (victoria, tablas, derrota) para el lado que mueve.
- Modelado de estilo humano sin búsqueda ni etiquetas de motor, útil para análisis de comportamiento.
- Manejo de información contextual de la posición: derechos de enroque, casilla de al paso, repeticiones y último movimiento.
- Inferencia directa en CPU o GPU con PyTorch, sin dependencias de servidores de inferencia especializados.
- No tiene tool calling, function calling, capacidades de agente, multilingüismo ni modalidades distintas del tablero de ajedrez.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Análisis de estilo de juego humano: dado un tablero, el modelo estima qué movimiento elegiría un jugador de 2400+ y con qué probabilidad, útil para estudiar patrones de decisión en ajedrez de alto nivel.
- Comparación seed-to-seed: al existir `seed1` con ajustes idénticos, permite medir la variabilidad de la predicción debida únicamente a la inicialización y al orden de datos, un caso práctico para investigación en reproducibilidad.
- Generación de datasets sintéticos de movimientos plausibles: se puede usar para producir jugadas con distribución similar a la humana en posiciones dadas, útil para aumentar datos en estudios de ajedrez.
- Detección de anomalías o trampas: comparando la probabilidad asignada por el modelo a los movimientos jugados por un humano frente a los de un motor, se puede construir una señal de "humanidad" del movimiento.
- Evaluación de posiciones y estimación de resultado: la cabeza de resultado proporciona una probabilidad win/draw/loss para el lado que mueve, aprovechable en análisis post-mortem de partidas.
- Investigación en interpretabilidad: al ser un transformer pequeño (22M) con atención sin máscara sobre 64 tokens, es adecuado para estudiar qué casillas atiende el modelo al decidir un movimiento.
- Baseline para modelos de ajedrez basados en secuencia de movimientos: sirve como referencia de entrada por tablero frente a los modelos de secuencia del repositorio `AriSpiesberger/Memorize`.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| Move loss (held-out, 5.000 partidas) | 1,1975 |
| Top-1 accuracy (movimiento jugado = movimiento predicho) | 58,9% |
| Result cross-entropy (held-out) | 0,8615 |
| Held-out move loss por época (1 a 7) | 1,3988 / 1,3617 / 1,3370 / 1,3054 / 1,2691 / 1,2240 / 1,1972 |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (22,2M parámetros, ~89 MB de pesos), por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM; funciona también en CPU para inferencia individual.
- Cabe en GPU consumer: sí, en cualquier RTX, GTX o integrada con soporte PyTorch.
- Opciones de despliegue: PyTorch nativo con `safetensors` y `python-chess`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada; el tamaño del modelo sugiere inferencia en milisegundos por posición en GPU moderna.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|
| chess-board-2400plus-a-7ep-seed0 | 22,2M | 64 tokens de casilla | Imitación de movimientos humanos 2400+ | MIT |
| chess-board-2400plus-a-7ep-seed1 | 22,2M | 64 tokens de casilla | Idéntico, distinto seed | MIT |
| Modelos de secuencia de movimientos de `AriSpiesberger/Memorize` | No disponible | No disponible | Imitación sobre secuencia de movimientos | No disponible |
| Motores de ajedrez clásicos (Stockfish, etc.) | No aplica | No aplica | Búsqueda con evaluación | Varía (GPL, etc.) |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El modelo imita movimientos humanos de jugadores de 2400+, no juega al nivel de un motor: no realiza búsqueda y su fuerza de juego no debe asumirse superior a la de los humanos que imita.
- No aplica máscara de legalidad: puede asignar probabilidad a movimientos ilegales, por lo que el usuario debe filtrar con `board.legal_moves` antes de elegir un movimiento.
- Sesgos derivados de los datos: entrenado solo con partidas de Lichess de jugadores 2400+ con reloj inicial de al menos 180 segundos entre marzo de 2023 y junio de 2025; el comportamiento puede no generalizar a otras plataformas, formatos rápidos o niveles inferiores.
- Riesgo de sobreajuste a estilos concretos de la población de Lichess en ese rango de Elo y periodo temporal.
- No soporta procesamiento de lenguaje natural ni otros idiomas; las etiquetas de idioma no están disponibles porque no aplica.
- Licencia MIT permite uso comercial, pero el modelo se distribuye sin garantías y el autor no documenta evaluación completa (comparación con el gemelo, partidas, puzles y tests de look-ahead pendientes de publicar).
- No se documentan cuantizaciones oficiales; el usuario debe generarlas por su cuenta si las necesita.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en producción ni validación externa.

## Enlaces

- Hugging Face: https://huggingface.co/Arisp/chess-board-2400plus-a-7ep-seed0
- Modelo gemelo (seed 1): https://huggingface.co/Arisp/chess-board-2400plus-a-7ep-seed1
- Repositorio del autor: https://github.com/AriSpiesberger/Memorize
- Código de modelos de tablero: `chess_beyond/transcend/boardtf/` dentro del repositorio anterior
