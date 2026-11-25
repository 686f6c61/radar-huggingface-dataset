# ftaz/chess-gpt-uci-move

## Resumen

chess-gpt-uci-move es un modelo GPT de 51,5 millones de parámetros entrenado para jugar al ajedrez prediciendo directamente el siguiente movimiento. Lo desarrolla el autor independiente ftaz (wezn) y se publica bajo licencia MIT en Hugging Face. Su particularidad es que no incorpora búsqueda ni función de evaluación: genera cada jugada con un único forward pass, lo que lo convierte en un caso de estudio interesante sobre hasta qué punto un transformer decoder-only puede internalizar la política de juego a partir de partidas humanas.

El modelo forma parte de una familia de tres variantes entrenadas de forma idéntica que solo difieren en el tokenizador: la variante A tokeniza el PGN carácter a carácter (vocabulario de 34), la variante B tokeniza movimientos UCI completos como `g1f3` (vocabulario de 1971) y la variante C tokeniza casillas (vocabulario de 71). Esta ficha cubre la variante B, que según el autor alcanza un Elo estimado de 1908 en escala Lichess y un 99,77 % de movimientos legales sobre partidas humanas reservadas.

Es relevante ahora por dos motivos: por un lado, demuestra que un modelo de apenas 50 millones de parámetros, entrenado en una sola GPU NVIDIA GB10, puede producir ajedrez de nivel de club sin motor de búsqueda; por otro, ofrece un banco de pruebas limpio para estudiar cómo el tokenizador afecta al rendimiento en tareas de generación estructurada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, 16 capas, 8 cabezas, anchura 512, embeddings atados |
| Parámetros totales | 52.482.048 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 192 tokens |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (dominio específico de ajedrez, notación UCI) |
| Licencia | MIT |
| Formato de pesos | safetensors (pesos) y config.json (arquitectura y tokenizador) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 16 capas, 8 cabezas de atención y dimensión de modelo 512, con embeddings de entrada y salida atados. La tarea es de modelado de lenguaje autorregresivo sobre secuencias de movimientos en notación UCI, donde cada token corresponde a una jugada completa (por ejemplo, `g1f3`) más un token especial de promoción cuando aplica. El vocabulario resultante es de 1971 tokens. El contexto de 192 tokens permite condicionar la predicción sobre un historial de partida relativamente largo.

El entrenamiento se realizó sobre 35 millones de partidas de Lichess (ritmo rapid o más lento, todas las categorías de rating), cada una vista una sola vez, durante 38.147 pasos en una única GPU NVIDIA GB10. No se menciona en la información disponible el uso de RLHF, DPO ni ajuste por preferencias; el objetivo es puramente de máxima verosimilitud sobre movimientos humanos. La pérdida de validación por movimiento reportada es de 1,626. No se documentan innovaciones como decodificación especulativa o atención lineal.

## Capacidades

- Generación de movimientos de ajedrez en notación UCI a partir del historial de la partida, sin búsqueda ni evaluación explícita.
- Predicción de movimientos legales con alta fiabilidad: 99,77 % sobre partidas humanas reservadas.
- Ranking de movimientos legales con probabilidades asociadas (la API del repositorio expone `rank_legal_moves`).
- Juego autónomo completo en partidas de ajedrez estándar, incluyendo promociones.
- Estimación de calidad de jugada mediante la probabilidad asignada a cada movimiento candidato.
- No dispone de tool calling, function calling, capacidades de agente, multilingüismo general, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Análisis de política de juego humana: el modelo aprende la distribución de movimientos de jugadores reales de Lichess, por lo que puede usarse para estudiar qué jugadas son más probables en cada nivel y apertura, comparando con bases de datos.
- Generación de partidas sintéticas para aumento de datos: al muestrear movimientos según las probabilidades del modelo se obtienen partidas plausibles y legales que pueden servir para entrenar otros sistemas o para pruebas de carga de motores de ajedrez.
- Motor de referencia ligero en entornos con recursos mínimos: con 51,5 millones de parámetros y pesos en safetensors de unos 0,2 GB, puede ejecutarse en CPU para tareas de demostración, docencia o tests de integración donde no se requiere fuerza de juego alta.
- Evaluación de tokenizadores en generación estructurada: al ser una de tres variantes idénticas salvo por el tokenizador, sirve como banco de pruebas controlado para medir el impacto del esquema de tokenización en la precisión de secuencias válidas.
- Detección de errores de legalidad en pipelines de ajedrez: la alta tasa de movimientos legales permite usar el modelo como validador probabilístico o como generador de candidatos que luego se filtran con una librería como python-chess.
- Estudio de escalado en dominios cerrados: con un presupuesto de entrenamiento documentado (38.147 pasos en una GB10), es un punto de referencia para investigar cuánta capacidad de juego se obtiene sin búsqueda a distintas escalas.

## Benchmarks y rendimiento

| Métrica | A (pgn-char) | B (uci-move) | C (uci-square) |
|---|---|---|---|
| Elo estimado (escala Lichess, autojuego puntuado por Stockfish) | 1.940 | 1.908 | 1.792 |
| Movimientos legales en partidas humanas reservadas | 99,74 % | 99,77 % | 99,84 % |
| Pérdida media de centipeones | 56 | 58 | 61 |

Los valores de Elo son estimaciones derivadas de autojuego puntuado por Stockfish, no resultados de partidas con rating oficial. La pérdida de validación por movimiento de la variante B es 1,626. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (unos 210 MB de pesos) y aproximadamente 100 MB en fp16; con overhead de activaciones y contexto de 192 tokens, cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria; el autor entrenó en una NVIDIA GB10 y la inferencia de referencia funciona en CPU.
- Cabe en GPU consumer: sí, en cualquier modelo desde una GTX 1050 o integrada moderna; también en Raspberry Pi y entornos similares.
- Opciones de despliegue: el repositorio oficial usa PyTorch con la librería `chessgpt`; al ser un transformer estándar con safetensors, es convertible a GGUF para llama.cpp u Ollama, aunque no se documenta una conversión oficial.
- Latencia y throughput: no disponibles de forma oficial; por el tamaño, se espera del orden de milisegundos por movimiento en CPU y submilisegundo en GPU, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| chess-gpt-uci-move (B) | 51,5 M | 192 tokens | GPT sin búsqueda, token UCI | MIT | Hugging Face |
| chess-gpt-pgn-char (A) | ~51,5 M | 192 tokens | GPT sin búsqueda, carácter PGN | MIT | Hugging Face |
| chess-gpt-uci-square (C) | ~51,5 M | 192 tokens | GPT sin búsqueda, casilla UCI | MIT | Hugging Face |
| Motores clásicos (Stockfish, etc.) | no aplica | no aplica | Búsqueda alfa-beta + evaluación | GPL u otras | Amplia |

No se dispone en la información proporcionada de comparaciones con otros modelos neuronales de ajedrez de tamaño similar, por lo que la comparativa se limita a las variantes de la misma familia y a los motores clásicos de búsqueda.

## Limitaciones y advertencias

- El Elo de 1.908 es una estimación por autojuego puntuado con Stockfish, no un rating oficial; el rendimiento real en partidas con control de tiempo puede diferir.
- Al no usar búsqueda, el modelo es vulnerable a errores tácticos que un motor clásico evitaría; la pérdida media de 58 centipeones lo sitúa lejos de motores de club fuerte.
- La ventana de contexto de 192 tokens limita la memoria de la partida; en partidas muy largas puede perder información relevante del historial.
- El modelo está entrenado exclusivamente con partidas de Lichess de ritmo rapid o superior, por lo que puede reproducir sesgos de estilo y nivel de esa población, incluyendo aperturas sobrerrepresentadas.
- Riesgo de movimientos ilegales residual: aunque la tasa es del 99,77 %, en producción debe validarse siempre con una librería de reglas como python-chess antes de aplicar la jugada.
- No se documentan capacidades multilingües ni de propósito general; el modelo no es adecuado para generación de texto fuera del dominio del ajedrez.
- La licencia MIT permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento del modelo ni sobre los datos de entrenamiento subyacentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ftaz/chess-gpt-uci-move
- Variante A (pgn-char): https://huggingface.co/ftaz/chess-gpt-pgn-char
- Variante C (uci-square): https://huggingface.co/ftaz/chess-gpt-uci-square
- Artículo del autor: https://blog.wezn.dev/chess-gpt/
- Código: https://github.com/wezn/chess-gpt
- Dataset: https://huggingface.co/datasets/lichess/standard-chess-games
