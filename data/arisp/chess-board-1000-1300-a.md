# Arisp/chess-board-1000-1300-a

## Resumen

chess-board-1000-1300-a es un transformer de 22,2 millones de parámetros desarrollado por Arisp que predice el movimiento que jugaría un humano con una puntuación de ajedrez de entre 1000 y 1300 en Lichess, a partir del estado actual del tablero. Se trata de un modelo de imitación de comportamiento entrenado exclusivamente con partidas humanas reales, sin búsqueda, sin etiquetas de motor y sin máscara de legalidad en la salida. Forma parte de una familia de modelos de la misma arquitectura entrenados por bandas de nivel, y es la contraparte de baja calificación de chess-board-2400plus-a.

El modelo recibe el tablero como 64 tokens de casilla desde la perspectiva del jugador al que le toca mover (para las negras, el tablero se refleja y se intercambian los colores) y produce dos salidas: una cabeza de movimiento que puntúa un vocabulario fijo de 1.968 movimientos mediante un mecanismo de consulta-clave entre casillas de origen y destino, y una cabeza de resultado que estima victoria, tablas o derrota para el bando que mueve. Su relevancia actual reside en el interés por la interpretabilidad de redes neuronales en ajedrez: el autor publica análisis de look-ahead (capacidad de anticipar jugadas futuras) siguiendo la metodología de Jenner et al. (2024) sobre Leela Chess Zero, lo que convierte al modelo en una herramienta útil para estudiar cómo representan el ajedrez las redes pequeñas entrenadas solo por imitación.

El modelo se distribuye con licencia MIT, en formato safetensors y con un tamaño de repositorio de 0,1 GB, lo que lo hace ejecutable en hardware modesto. No obstante, se trata de un modelo de investigación con cero descargas y cero likes en el momento de la consulta, sin pipeline declarado en Hugging Face y con documentación limitada a la model card del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con stem convolucional: 3 convoluciones 3x3 sobre el tablero 8x8, embedding aprendido por casilla y 12 bloques transformer pre-LayerNorm (d=384, 6 cabezas, MLP ReLU x4, sin máscara de atención) |
| Parametros totales | 22.246.727 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica en el sentido de tokens de texto: la entrada es un tablero de 64 casillas con metadatos (derechos de enroque, casilla de al paso, contador de repeticiones y casillas del movimiento anterior). Los análisis de resultados se reportan para plies 0-182 |
| Tipos de cuantizacion | No disponible (solo se distribuyen pesos safetensors en precisión original; el entrenamiento usó bf16) |
| Idiomas soportados | No disponible (modelo específico de ajedrez, sin capacidades de lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | safetensors (model.safetensors) con config.json |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder de 12 bloques con pre-LayerNorm, dimensión de modelo 384 y 6 cabezas de atención, sin máscara de atención, sobre una secuencia de 64 tokens (uno por casilla del tablero). Antes del cuerpo transformer hay un stem de tres convoluciones 3x3 que procesa el tablero 8x8 y un embedding aprendido por casilla. La información de estado de la partida (derechos de enroque, casilla de al paso, contador de repeticiones y casillas del movimiento anterior) se embebe y se suma a cada token de casilla. La cabeza de movimiento usa un esquema consulta-clave: cada casilla genera una query y una key, y el logit de un movimiento es el producto de la query de la casilla de origen por la key de la casilla de destino, más un término de promoción, evaluado sobre un vocabulario fijo de 1.968 movimientos en el marco del jugador que mueve. La cabeza de resultado produce win/draw/loss para el bando que mueve a partir de la media de los tokens finales.

El entrenamiento se realizó por imitación pura sobre 10 millones de partidas estándar de Lichess de junio de 2025 y parte de mayo de 2025, con ambos jugadores entre 1000 y 1300 de puntuación y tiempo inicial de reloj de al menos 180 segundos. Se reservaron 5.000 partidas para validación (las más recientes), se mantuvieron las tablas y se excluyeron las partidas que son fuente de puzles de Lichess en los conjuntos de evaluación. Cada época muestrea 16 posiciones aleatorias de cada partida de entrenamiento (157,5 millones de posiciones por época). La función de pérdida combina entropía cruzada de movimiento (peso 1,0) y de resultado (peso 0,3). Se usó AdamW (betas 0,9/0,95, weight decay 0,1), batch de 2.048 posiciones, bf16, una única GPU NVIDIA B200, y un único schedule coseno de 5 épocas (pico 0,001, 2.000 pasos de warmup, hasta 1e-05), totalizando 384.600 pasos y aproximadamente 788 millones de posiciones. La pérdida de validación de movimiento al final de cada época fue 1,5438, 1,5274, 1,5026, 1,4757 y 1,4568; se conservó el checkpoint con mejor pérdida de validación.

## Capacidades

- Predicción del movimiento humano: dado un tablero, devuelve una distribución de probabilidad sobre 1.968 movimientos en el marco del jugador que mueve.
- Predicción de resultado: estima win/draw/loss para el bando que mueve a partir de la posición.
- Modelado de nivel de juego: imita el estilo y la tasa de errores de jugadores de 1000-1300 de Lichess, no el juego óptimo.
- Manejo de estado de partida: incorpora derechos de enroque, casilla de al paso, repeticiones y casillas del movimiento anterior como entradas.
- Baja tasa de movimientos ilegales: 0,0005 de probabilidad asignada a movimientos ilegales y 0,0001 de que el movimiento más probable sea ilegal, pese a no usar máscara de legalidad durante el entrenamiento.
- Capacidades de interpretabilidad: el autor publica análisis de look-ahead con técnicas de patching y probing sobre los puzles de Lichess, comparables a los de Leela Chess Zero y Maia-3.
- Sin capacidades de lenguaje natural, visión, audio, tool calling ni agentes: es un modelo específico de ajedrez.

## Casos de uso

- Análisis de estilo por banda de nivel: comparar las distribuciones de movimiento del modelo con las de la contraparte de 2400+ para estudiar qué cambia entre niveles, usando las cabezas de movimiento y resultado sobre posiciones concretas.
- Generación de adversarios sintéticos de nivel intermedio: el modelo puede jugar partidas codiciosas (top-1 legal) contra otros motores o humanos para calibrar dificultad en entornos de entrenamiento, como muestran los resultados frente a los niveles 1, 3 y 5 de Stockfish de Lichess.
- Investigación en interpretabilidad: replicar los experimentos de patching y probing de Jenner et al. (2024) sobre un modelo pequeño entrenado solo por imitación, para estudiar si el look-ahead emerge sin búsqueda ni etiquetas de motor.
- Predicción de resultados para evaluación de posiciones: usar la cabeza de resultado (error de calibración ECE de 0,0127) como estimador de probabilidad de victoria en posiciones de partidas humanas de nivel 1000-1300.
- Detección de anomalías en partidas: comparar la probabilidad asignada por el modelo a los movimientos realmente jugados para identificar jugadas atípicas para el nivel declarado, con posible aplicación en análisis antifraude.
- Docencia y divulgación de ajedrez: mostrar a estudiantes qué movimientos son más probables en su nivel y cómo se desvía su juego del esperado, usando la distribución completa sobre movimientos legales.
- Benchmark de modelos de ajedrez: servir como referencia de imitación de bajo nivel en comparaciones con Maia-2, Maia-3 u otros modelos de predicción de movimiento humano.

## Benchmarks y rendimiento

Resultados de validación sobre las 5.000 partidas reservadas, comparados con el modelo "gemelo" de secuencia de movimientos entrenado con las mismas partidas:

| Metrica | Este modelo | Gemelo (secuencia) |
|---|---|---|
| Pérdida de movimiento, plies 0-182 | 1,4568 | 1,5323 |
| Top-1 (el movimiento jugado es el más probable), plies 0-182 | 0,5270 | 0,5120 |
| Pérdida de movimiento / top-1, todos los plies | 1,4568 / 0,5270 | No disponible |
| Entropía cruzada de resultado (baseline de frecuencia; por ply y color) | 0,7605 (0,8838; 0,8710) | No disponible |
| Error de calibración de resultado (ECE) | 0,0127 | No disponible |
| Probabilidad en movimientos ilegales (gemelo incl. tokens especiales) | 0,0005 (0,0162) | 0,0162 |
| Movimiento top bruto ilegal | 0,0001 | No disponible |
| Puntuación vs Lichess nivel 1 / 3 / 5 | 1,000 / 0,910 / 0,495 | 0,990 / 0,780 / 0,305 |
| Rating en escala Maia-2 | 1969 ± 74 | 1707 |
| Puntuación vs el gemelo | 0,645 | No disponible |

Resultados de look-ahead (Jenner et al., 2024) sobre puzles de Lichess:

| Metrica | Este modelo | Leela T82 (referencia) | Maia-3 23M @1900 (referencia) |
|---|---|---|---|
| Puzles resueltos, primer movimiento / línea completa (22.517 puzles) | 0,331 / 0,308 | No disponible | 46,9% / 45,7% de los mismos puzles |
| Patching de la casilla destino del 3.er movimiento: caída de log-odds (comunes) | L6/12: 0,43 vs 0,62 otros (1.º: 3,17; n=630) | 2,21 vs 0,48 | 2,13 vs 0,41 |
| Probe de la casilla destino del 3.er movimiento (comunes) | 0,812 vs 0,578 init aleatoria (mejor capa 9) | 95% vs 42% | 86% vs 24% |
| Atención destino 1.er movimiento -> destino 3.er movimiento, tasa top-key (comunes) | 0,323 (L9H2); anularla 0,18 vs 0,04 en el resto | No disponible | No disponible |
| Patching (fallidos) | L7/12: 0,17 vs 0,16 otros (1.º: 0,26; n=3038) | No disponible | No disponible |
| Probe (fallidos) | 0,729 vs 0,174 init aleatoria (mejor capa 7) | No disponible | No disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (22,2 millones de parámetros ocupan unos 89 MB en fp32 y unos 44 MB en bf16/fp16), más el overhead de activaciones de un tablero de 64 tokens, que es despreciable.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM; el modelo se entrenó en una NVIDIA B200, pero la inferencia cabe holgadamente en GPUs de consumo.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090, etc.) e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: el autor proporciona código Python basado en `torch`, `python-chess`, `numpy` y `safetensors`, cargando `bt_model.BoardTransformer` y `bt_data.encode_boards`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que además no aplican a un modelo de tablero.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño (22M de parámetros y 64 tokens de entrada) se espera una latencia de milisegundos por posición en GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Contexto / alcance | Rating (escala Maia-2) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| chess-board-1000-1300-a | 22,2M | Tablero (64 tokens) | Posición actual con metadatos | 1969 ± 74 | MIT | Hugging Face (0 descargas) |
| chess-board-2400plus-a | No disponible | Tablero (64 tokens) | Posición actual con metadatos | No disponible | No disponible | Hugging Face |
| Gemelo de secuencia de movimientos (misma banda) | No disponible | Secuencia de movimientos | Plies 0-182 | 1707 | No disponible | No disponible (referenciado en la model card) |
| Maia-3 23M @1900 | 23M | Tablero | No disponible | 1900 (por nombre) | No disponible | No disponible |

El modelo supera al gemelo de secuencia en pérdida de movimiento (1,4568 frente a 1,5323), top-1 (0,5270 frente a 0,5120), calibración de resultado y tasa de ilegales, y obtiene una puntuación de 0,645 frente a él en enfrentamiento directo. Frente a Maia-3 23M @1900, los datos de look-ahead publicados muestran que Maia-3 resuelve más puzles (46,9% / 45,7% frente a 33,1% / 30,8%) y tiene señales de patching y probing más fuertes, aunque se comparan sobre conjuntos parcialmente distintos.

## Limitaciones y advertencias

- Sesgos de datos: entrenado solo con partidas de Lichess de jugadores de 1000-1300 con reloj inicial de al menos 180 segundos; el comportamiento puede no generalizar a otras plataformas, formatos de tiempo, bandas de nivel o estilos de juego.
- No es un motor de ajedrez: imita errores humanos por diseño; no debe usarse para análisis de mejor jugada ni como sustituto de Stockfish o Leela.
- Riesgo de alucinación en el sentido de movimientos ilegales: aunque la probabilidad es muy baja (0,0005 en masa y 0,0001 en el top bruto), no es cero; en producción conviene filtrar siempre con una máscara de legalidad.
- Calibración de resultado: el ECE de 0,0127 es bajo en validación, pero la cabeza de resultado se entrenó con peso 0,3 y puede degradarse fuera de la distribución de partidas de Lichess de esa banda.
- Limitaciones de contexto: la entrada no incluye historial completo de la partida, solo el movimiento anterior y el contador de repeticiones; los análisis de look-ahead se limitan a plies 0-182.
- Idiomas: el modelo no procesa lenguaje natural; no tiene capacidades multilingües.
- Licencia MIT: permite uso comercial y modificación con atribución, pero el modelo se distribuye sin garantías y con documentación mínima.
- Madurez: cero descargas y cero likes en Hugging Face en el momento de la consulta, sin pipeline declarado y sin integraciones de despliegue estándar; el código de inferencia depende de módulos incluidos en el repositorio (`bt_model.py`, `bt_data.py`, `move_tokens.py`).
- Caveat para producción: al ser un modelo de investigación centrado en interpretabilidad, no hay garantías de soporte, versionado ni mantenimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Arisp/chess-board-1000-1300-a
- Modelo contraparte de alto nivel: https://huggingface.co/Arisp/chess-board-2400plus-a
- Repositorio del autor con los modelos de secuencia: https://github.com/AriSpiesberger/Memorize
- Paper de referencia sobre look-ahead (Jenner et al., 2024): no disponible en la información proporcionada (citado en la model card como *Evidence of Learned Look-Ahead in a Chess-Playing Neural Network*)
- Puzles de Lichess usados en evaluación: no disponible enlace directo en la información proporcionada
- Demo o space: no disponible
