# ftaz/chess-gpt-uci-square

## Resumen

chess-gpt-uci-square (identificado como modelo "C") es un transformer decoder-only de 50,6 millones de parámetros desarrollado por el usuario ftaz (wezn) que juega al ajedrez prediciendo directamente el siguiente token de movimiento, sin búsqueda ni función de evaluación: un único forward pass por jugada. Forma parte de una familia de tres modelos entrenados de forma idéntica que solo difieren en el tokenizador; en este caso, cada token representa una casilla (más la pieza de promoción cuando aplica), de ahí el vocabulario de 71 entradas.

El modelo se entrenó sobre 35 millones de partidas de Lichess (ritmo rapid y más lento, todos los niveles), cada una vista una sola vez, durante 76.110 pasos sobre una única NVIDIA GB10. Con 16 capas, 8 cabezas, anchura 512 y contexto de 384 tokens, es un experimento de investigación sobre tokenización en dominios estructurados más que un motor de ajedrez de producción.

Su relevancia actual es metodológica: permite comparar empíricamente cómo afecta la granularidad del tokenizador (carácter PGN, movimiento UCI completo o casilla UCI) al rendimiento en un dominio con reglas estrictas, con licencia MIT y pesos en safetensors de acceso libre.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (16 capas, 8 cabezas, anchura 512, embeddings atados) |
| Parámetros totales | 50.634.752 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 384 tokens |
| Tipos de cuantización | no disponible (solo se publican pesos safetensors en precisión original) |
| Idiomas soportados | no disponible (el modelo no procesa lenguaje natural; emite notación de ajedrez) |
| Licencia | MIT |
| Formato de pesos | safetensors (config.json con arquitectura y tokenizador) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only estándar con 16 capas, 8 cabezas de atención, dimensión de modelo 512 y embeddings atados entre entrada y salida. La particularidad está en el tokenizador `uci-square`: cada token codifica una casilla del tablero (más un token adicional para la pieza de promoción), lo que da un vocabulario de 71 entradas. La partida se serializa como una secuencia de casillas y el modelo predice la siguiente casilla; la legalidad del movimiento se comprueba a posteriori en el código de inferencia.

El entrenamiento usó 35 millones de partidas de Lichess de ritmo rapid o superior, con todas las franjas de rating, y cada partida se vio una sola vez (sin repetición de épocas). Se realizaron 76.110 pasos sobre una única NVIDIA GB10. La pérdida de validación por movimiento reportada es 1,604. No se documenta en la información disponible el uso de RLHF, DPO ni ajuste por preferencias; el entrenamiento es de modelado de lenguaje autorregresivo sobre movimientos.

## Capacidades

- Generación de movimientos de ajedrez legales en un único forward pass, sin búsqueda ni evaluación explícita.
- Predicción token a token de casillas de origen y destino (y pieza de promoción cuando corresponde).
- Ranking de movimientos legales con probabilidades asociadas mediante `rank_legal_moves` en el código de referencia.
- Juego desde cualquier posición representable en la ventana de 384 tokens de contexto (suficiente para partidas completas en notación UCI por casillas).
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso explícito ni modo "thinking".
- No tiene capacidades de visión, audio ni procesamiento de lenguaje natural.
- No es multilingüe en sentido convencional: su "lenguaje" es la notación de ajedrez.

## Casos de uso

- Investigación sobre tokenización: comparar el rendimiento de los tres tokenizadores (pgn-char, uci-move, uci-square) en un dominio con reglas formales permite aislar el efecto de la granularidad del vocabulario en la calidad del modelo.
- Generación de posiciones de entrenamiento y aumento de datos: el modelo puede producir partidas plausibles a nivel humano (~1.792 Elo estimado) para alimentar pipelines de datos de ajedrez o entrenar modelos de evaluación.
- Análisis de estilo y aperturas: al predecir movimientos con probabilidades, sirve para estudiar distribuciones de jugadas por posición y comparar con bases de datos humanas.
- Benchmark de eficiencia en inferencia: con 50,6 M de parámetros y un solo forward pass por jugada, es un caso de referencia para medir latencia en CPU y GPU en tareas de decisión secuencial.
- Enseñanza y divulgación: ejemplo didáctico de cómo un transformer pequeño aprende un dominio estructurado sin búsqueda, útil en cursos de machine learning.
- Prototipado de agentes de ajedrez ligeros: integrable vía la librería `chessgpt` en scripts de análisis o bots de bajo coste computacional donde no se requiere fuerza de motor.

## Benchmarks y rendimiento

Datos publicados en la model card (media de los últimos 11 snapshots). Las cifras de Elo son estimaciones a partir de autopartidas puntuadas por Stockfish, no resultados de partidas con rating oficial.

| Métrica | A (pgn-char) | B (uci-move) | C (uci-square, este modelo) |
|---|---|---|---|
| Elo (escala Lichess, estimado) | 1.940 | 1.908 | 1.792 |
| Movimientos legales en partidas humanas reservadas | 99,74 % | 99,77 % | 99,84 % |
| Pérdida media en centipeones | 56 | 58 | 61 |
| Pérdida de validación por movimiento | no disponible | no disponible | 1,604 |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 (50,6 M de parámetros, ~0,2 GB de pesos); en FP16/BF16, ~0,1 GB.
- GPU recomendadas: cualquier GPU moderna sirve; el modelo se entrenó en una NVIDIA GB10, pero para inferencia basta una RTX 3060, RTX 4090, A100 o H100 sin aprovechar su capacidad.
- Cabe holgadamente en GPU de consumo e incluso en CPU; el ejemplo oficial usa `device="cpu"`.
- Opciones de despliegue: el código de referencia (`github.com/wezn/chess-gpt`, con `uv sync`) y la clase `ModelPlayer`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tokenizador | Parámetros | Contexto | Elo estimado | Licencia |
|---|---|---|---|---|---|
| chess-gpt-uci-square (C) | uci-square (71) | 50,6 M | 384 | 1.792 | MIT |
| chess-gpt-uci-move (B) | uci-move (1.971) | no disponible | no disponible | 1.908 | MIT |
| chess-gpt-pgn-char (A) | pgn-char (34) | no disponible | no disponible | 1.940 | MIT |

No se dispone en la información proporcionada de comparaciones con motores de ajedrez clásicos (Stockfish, Leela Chess Zero) ni con otros modelos neuronales de ajedrez de terceros.

## Limitaciones y advertencias

- Fuerza de juego modesta: ~1.792 Elo estimado, muy por debajo de motores convencionales y de jugadores de club avanzados.
- Las cifras de Elo son estimaciones por autopartidas puntuadas por Stockfish, no resultados de partidas con rating oficial.
- Sin búsqueda ni evaluación: comete errores tácticos que un motor con búsqueda evitaría; el 99,84 % de legalidad implica que un pequeño porcentaje de predicciones no son legales y deben filtrarse.
- Contexto limitado a 384 tokens, suficiente para partidas completas en notación por casillas pero restrictivo para análisis con historial extendido.
- No procesa lenguaje natural: no puede explicar jugadas ni interactuar en conversación.
- Riesgo de alucinación en forma de movimientos ilegales; el código de inferencia debe validar siempre con `python-chess`.
- Licencia MIT: permite uso comercial y modificación, pero no se documentan garantías ni sesgos evaluados.
- No hay información sobre sesgos de estilo (por ejemplo, sesgo hacia aperturas frecuentes en Lichess) ni sobre evaluación en posiciones de finales.
- Entrenado con partidas de Lichess de ritmo rapid o superior, lo que puede limitar su comportamiento en posiciones típicas de bullet o blitz.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ftaz/chess-gpt-uci-square
- Modelo A (pgn-char): https://huggingface.co/ftaz/chess-gpt-pgn-char
- Modelo B (uci-move): https://huggingface.co/ftaz/chess-gpt-uci-move
- Write-up del autor: https://blog.wezn.dev/chess-gpt/
- Código: https://github.com/wezn/chess-gpt
- Dataset: https://huggingface.co/datasets/lichess/standard-chess-games
