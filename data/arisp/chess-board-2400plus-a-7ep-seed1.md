# Arisp/chess-board-2400plus-a-7ep-seed1

## Resumen

El modelo `chess-board-2400plus-a-7ep-seed1`, desarrollado por Arisp (AriSpiesberger), es un transformer de 22,2 millones de parámetros que predice el movimiento que jugaría un humano con una puntuación Elo de 2400 o superior a partir de la posición actual del tablero. Se trata de un modelo de imitación pura: no incorpora búsqueda, no usa etiquetas de motor y no aplica máscara de legalidad en la salida. El tablero se codifica como 64 tokens de casilla desde el punto de vista del bando que mueve, y el modelo dispone de dos cabezas: una de movimiento (origen-destino) y otra de resultado (victoria, tablas o derrota).

El modelo se entrenó exclusivamente con partidas de Lichess de jugadores con Elo 2400 o superior, con un total de 10 millones de partidas de entrenamiento y 5.000 de validación. Este checkpoint corresponde a la semilla 1 de un par de semillas entrenadas con idénticos ajustes y datos, concebidas como línea base para medir la variación entre semillas. Forma parte de un proyecto más amplio de modelos de secuencia de movimientos del mismo autor, adaptados aquí a entrada de tablero.

Su relevancia radica en el enfoque de interpretabilidad y modelado del comportamiento humano en ajedrez de alto nivel: en lugar de maximizar la fuerza de juego mediante búsqueda o destilación de motores, el modelo aprende la distribución de movimientos humanos y una estimación del resultado. Es un artefacto de investigación de 0,1 GB, licencia MIT y entrenado en una única NVIDIA B200, lo que lo hace fácilmente reproducible y desplegable en hardware modesto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder pre-LayerNorm con stem convolucional (3 convoluciones 3x3) sobre tablero 8x8; 12 bloques, d=384, 6 cabezas, MLP ReLU x4, sin máscara |
| Parámetros totales | 22.246.727 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 64 tokens de casilla (tablero fijo 8x8); no aplica contexto variable |
| Tipos de cuantización | no disponible (pesos en safetensors; el autor no publica variantes cuantizadas) |
| Idiomas soportados | no disponible (modelo específico de ajedrez; no procesa lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | safetensors (también se distribuye `config.json`, `bt_model.py`, `bt_data.py`, `move_tokens.py`) |

## Arquitectura y entrenamiento

La entrada se construye desde la perspectiva del bando que mueve: para las negras el tablero se refleja y se intercambian los colores. Cada casilla recibe un código de pieza, y a cada token de casilla se le suman embeddings de derechos de enroque, casilla de captura al paso, contador de repeticiones y las casillas del movimiento anterior. El stem aplica tres convoluciones 3x3 sobre el tablero 8x8 seguido de un embedding aprendido por casilla; el cuerpo son 12 bloques transformer pre-LayerNorm con d=384, 6 cabezas y MLP ReLU con factor de expansión 4, sin máscara de atención (el tablero es un grafo completamente conectado de 64 nodos).

La cabeza de movimiento es de tipo origen-destino: cada casilla emite una query y una key, y el logit de un movimiento es el producto escalar query de origen por key de destino, más un término de promoción. Se puntúa sobre un vocabulario fijo de 1.968 movimientos en el marco del jugador. La cabeza de resultado (victoria, tablas o derrota para el bando que mueve) se obtiene de la media de los tokens finales. La pérdida combina entropía cruzada de movimiento (peso 1,0) y de resultado (peso 0,3). El entrenamiento usó AdamW (betas 0,9/0,95, weight decay 0,1), batch de 2.048 posiciones, precisión bf16 y una NVIDIA B200, con 7 épocas bajo un único schedule coseno (pico 0,001, 2.000 pasos de warmup, hasta 1e-5): 545.860 pasos y aproximadamente 1.118 millones de posiciones. Cada época extrae 16 posiciones aleatorias por partida de entrenamiento (159,7 millones de posiciones por época). Los datos son partidas estándar valoradas de Lichess de marzo de 2023 a junio de 2025, con ambos jugadores por encima de 2400 y reloj inicial de al menos 180 segundos; se conservan las tablas y se excluyen las partidas origen de puzles de los conjuntos de evaluación.

## Capacidades

- Predicción del movimiento humano más probable en una posición dada, sobre un vocabulario fijo de 1.968 movimientos en el marco del jugador.
- Estimación del resultado de la partida (victoria, tablas o derrota) para el bando que mueve a partir de la posición actual.
- Codificación de información de estado completa: piezas, derechos de enroque, casilla de captura al paso, repeticiones y movimiento anterior.
- Manejo de la perspectiva del jugador: reflexión e intercambio de colores automáticos para las negras.
- Inferencia sin búsqueda ni máscara de legalidad; el filtrado de movimientos legales se realiza externamente con `python-chess`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües.
- No dispone de modo de pensamiento (thinking mode) ni decodificación especulativa.

## Casos de uso

- Análisis de estilo humano en ajedrez de élite: dado un tablero, obtener la distribución de movimientos probables de un jugador de 2400+ y compararla con la jugada realmente realizada para estudiar desviaciones de estilo.
- Detección de jugadas atípicas o sospechosas: comparar la probabilidad asignada por el modelo a un movimiento concreto con la distribución esperada para ese nivel, como señal auxiliar en la revisión de partidas.
- Etiquetado y aumento de datos para investigación: generar movimientos plausibles a nivel humano sobre posiciones existentes para construir datasets sintéticos de estilo 2400+.
- Estudio de interpretabilidad: al ser un modelo pequeño con atención sin máscara sobre 64 tokens, permite analizar qué casillas contribuyen a la query/key de un movimiento y a la predicción de resultado.
- Línea base en experimentos de imitación: comparar arquitecturas o regímenes de entrenamiento contra este checkpoint y su semilla gemela para cuantificar la varianza entre semillas.
- Evaluación de modelos de ajedrez centrados en humanidad: medir la correlación entre la probabilidad del modelo y la frecuencia real de jugadas en partidas de validación, como métrica complementaria a la fuerza de juego de motores.
- Docencia y divulgación: ilustrar cómo un transformer pequeño codifica el estado de un juego de información perfecta y aprende una política de imitación sin búsqueda.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| Pérdida de movimiento en validación (5.000 partidas retenidas) | 1,1965 |
| Top-1 (la jugada jugada es la más probable) | 59,0% |
| Entropía cruzada de resultado | 0,8601 |
| Pérdida de movimiento por época (1 a 7) | 1,3917 / 1,3656 / 1,3365 / 1,3058 / 1,2660 / 1,2249 / 1,1965 |

No se han publicado en la información disponible resultados comparativos con otros modelos en MMLU, HumanEval, GSM8K ni en métricas de ajedrez frente a motores o a otros modelos de imitación.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 45 MB en fp32 (22,2 M de parámetros x 4 bytes) y aproximadamente 22 MB en bf16/fp16; el repositorio completo ocupa 0,1 GB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente; el entrenamiento se realizó en una NVIDIA B200, pero la inferencia es trivial.
- Cabe en cualquier GPU de consumo (GTX 1050, RTX 3060, RTX 4090, etc.) e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: el autor proporciona código PyTorch directo (`bt_model.py`, `bt_data.py`) con `safetensors` y `python-chess`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, y al no ser un modelo de lenguaje estas herramientas no son aplicables directamente.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño (22 M de parámetros y 64 tokens de entrada) se espera una latencia de milisegundos por posición en GPU moderna, aunque no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| chess-board-2400plus-a-7ep-seed1 (este) | 22,2 M | 64 tokens de casilla | Imitación de movimientos 2400+ y resultado | MIT | Hugging Face |
| chess-board-2400plus-a-7ep-seed0 | no disponible | 64 tokens de casilla | Imitación de movimientos 2400+ y resultado | MIT | Hugging Face |
| Modelos de secuencia de movimientos del proyecto Memorize (`chess_beyond/transcend/boardtf/`) | no disponible | no disponible | Imitación de movimientos a partir de secuencia | no disponible | GitHub |

La comparación con motores de ajedrez (Stockfish, Leela Chess Zero) no es pertinente: este modelo no busca ni maximiza fuerza de juego, sino que modela la distribución de movimientos humanos. No se dispone de datos de benchmarks frente a otros modelos de imitación en la información proporcionada.

## Limitaciones y advertencias

- Modelo de imitación, no de juego óptimo: no incorpora búsqueda y no aplica máscara de legalidad, por lo que puede asignar probabilidad a movimientos ilegales; es responsabilidad del usuario filtrar con `python-chess`.
- Sesgo de datos: entrenado solo con partidas de Lichess con ambos jugadores por encima de 2400 y reloj inicial de al menos 180 segundos; el comportamiento fuera de ese régimen (partidas rápidas, niveles inferiores, otras plataformas) puede degradarse.
- Riesgo de sobreajuste al estilo de la comunidad de Lichess y a la ventana temporal marzo 2023 - junio 2025.
- La estimación de resultado es una predicción probabilística, no una evaluación de motor; no debe usarse como sustituto de un análisis de fuerza.
- Variación entre semillas: este checkpoint es la semilla 1 de un par; las diferencias con la semilla 0 son parte del objeto de estudio y deben tenerse en cuenta al comparar resultados.
- Restricciones de licencia: MIT permite uso comercial, pero el modelo se distribuye sin garantías y con código de inferencia específico que el usuario debe integrar.
- No procesa lenguaje natural ni otros idiomas; las filas de idiomas y cuantización figuran como no disponibles.
- No se han publicado evaluaciones completas (comparación con el gemelo, partidas, puzles, tests de look-ahead); el autor indica que se añadirán a la model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Arisp/chess-board-2400plus-a-7ep-seed1
- Semilla gemela: https://huggingface.co/Arisp/chess-board-2400plus-a-7ep-seed0
- Repositorio del proyecto Memorize: https://github.com/AriSpiesberger/Memorize
- Ruta de los modelos de secuencia de movimientos: `chess_beyond/transcend/boardtf/` (dentro del repositorio anterior)
