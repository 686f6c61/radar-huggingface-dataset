# ftaz/chess-gpt-uci-square

## Resumen

chess-gpt-uci-square es un modelo GPT de 50,6 millones de parámetros desarrollado por el usuario ftaz (wezn) que juega al ajedrez prediciendo directamente el siguiente movimiento como una secuencia de tokens. No incorpora búsqueda ni función de evaluación: cada jugada se genera con un único forward pass, lo que lo convierte en un experimento de modelado de lenguaje aplicado al dominio del ajedrez en lugar de un motor de ajedrez convencional basado en alpha-beta o MCTS.

Es el modelo C de una familia de tres entrenados con datos y procedimiento idénticos, diferenciándose únicamente en el tokenizador: el modelo A usa caracteres de PGN (vocabulario de 34), el modelo B usa movimientos UCI completos (vocabulario de 1971) y este modelo C usa casillas UCI individuales más la pieza de promoción (vocabulario de 71). Esta variante concreta es la que obtiene una mayor tasa de movimientos legales sobre partidas humanas retenidas (99,71%), aunque su Elo estimado es el más bajo de los tres (1.792).

El modelo se entrenó sobre 35 millones de partidas de Lichess (ritmo rapid y superior, todas las categorías de rating) y se publica bajo licencia MIT con pesos en formato safetensors. Su relevancia es principalmente divulgativa y de investigación: sirve como referencia para estudiar cómo el diseño del tokenizador afecta a la calidad de las jugadas generadas por un transformer pequeño, y como ejemplo reproducible de entrenamiento de un GPT desde cero sobre un corpus de ajedrez.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (16 capas, 8 cabezas, anchura 512, embeddings atados) |
| Parametros totales | 50.634.752 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 384 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el dominio es notacion de ajedrez, no lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | safetensors (pesos); config.json con arquitectura y tokenizador |
| Tokenizador | uci-square: una casilla (+ pieza de promocion), vocabulario 71 |
| Tamano del repo | 0,2 GB |
| Libreria | PyTorch |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 16 capas, 8 cabezas de atencion y anchura 512, con embeddings atados entre entrada y salida y una ventana de contexto de 384 tokens. Cada movimiento se representa como una secuencia de tokens de casilla de origen y destino (por ejemplo, `g1` seguido de `f3`), mas un token adicional para la pieza de promocion cuando corresponde. El vocabulario resultante es de 71 simbolos. No hay busqueda, evaluacion material ni heuristica ajedrecistica: la jugada es la salida directa de una unica pasada por el modelo.

El entrenamiento utilizo 35 millones de partidas de Lichess de ritmo rapid o superior, con todas las categorias de rating, y cada partida se vio una sola vez (una sola epoca). Se completaron 76.110 pasos de entrenamiento en una unica GPU NVIDIA GB10. La perdida de validacion por movimiento reportada es de 1,604. No se menciona en la informacion disponible el uso de RLHF, DPO ni tecnicas de alineacion adicionales; el objetivo es puramente de modelado de lenguaje sobre secuencias de jugadas.

## Capacidades

- Generacion de movimientos de ajedrez legales: 99,71% de movimientos legales sobre partidas humanas retenidas, la tasa mas alta de los tres modelos de la familia.
- Prediccion autoregresiva de secuencias de casillas UCI, incluida la gestion de promociones mediante token adicional.
- Ranking de movimientos legales con probabilidades asociadas, accesible a traves de la API de evaluacion del repositorio (`rank_legal_moves`).
- Juego sin busqueda: una unica pasada por movimiento, lo que permite inferencia en CPU.
- No dispone de tool calling, function calling, capacidades de agente ni razonamiento multi-paso.
- No dispone de capacidades multimodales, vision ni audio.
- No es un modelo multilingue en sentido estricto; su vocabulario esta limitado a la notacion de ajedrez.

## Casos de uso

- Investigacion sobre tokenizacion en dominios estructurados: comparar este modelo con los modelos A (PGN por caracteres) y B (movimientos UCI completos) permite aislar el efecto del tokenizador sobre la calidad de las jugadas, manteniendo constantes arquitectura y datos.
- Generacion de jugadas en entornos con recursos muy limitados: con 50,6 millones de parametros y ejecucion en CPU segun la model card, puede integrarse en scripts de analisis por lotes o en dispositivos sin GPU.
- Creacion de datasets sinteticos de partidas: el modelo puede generar partidas completas autoregresivamente para aumentar corpus de entrenamiento de otros sistemas, aceptando la perdida de calidad frente a motores clasicos.
- Ensenanza y divulgacion de machine learning: el repositorio y el articulo asociado documentan el proceso completo (tokenizadores, entrenamiento, evaluacion con Stockfish), lo que lo hace util como caso de estudio reproducible en cursos y talleres.
- Evaluacion comparativa de estrategias de representacion: sirve como linea base para medir como afectan distintas representaciones de la accion (caracter, movimiento, casilla) al rendimiento de un transformer pequeno en un juego de mesa.
- Prototipado rapido de interfaces de ajedrez: la API `ModelPlayer` permite obtener la jugada del modelo y un ranking de candidatas con probabilidades, util para demos interactivas o para construir herramientas de analisis exploratorio.

## Benchmarks y rendimiento

Datos publicados en la model card y en el articulo del autor. Las cifras de Elo son estimaciones a partir de autopartidas puntuadas por Stockfish, no resultados de partidas con rating oficial.

| Metrica | Modelo A (pgn-char) | Modelo B (uci-move) | Modelo C (uci-square, este) |
|---|---|---|---|
| Elo (escala Lichess, estimado) | 1.940 | 1.908 | 1.792 |
| Movimientos legales en partidas humanas retenidas | 99,75% | 99,45% | 99,71% |
| Perdida media en centipeones | 56 | 58 | 61 |
| Perdida de validacion por movimiento | no disponible | no disponible | 1,604 |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precision completa (50,6 millones de parametros, aproximadamente 0,2 GB de pesos en safetensors); no se han publicado cifras de cuantizacion.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el modelo cabe holgadamente en tarjetas con 4 GB o mas, e incluso en CPU, como indica la model card.
- Cabe en GPU consumer: si, en cualquier GPU con al menos 2 GB de memoria; la model card demuestra ejecucion en CPU.
- Opciones de despliegue: el autor proporciona el repositorio `wezn/chess-gpt` con la clase `ModelPlayer` sobre PyTorch. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no disponibles. Al requerir un unico forward pass por movimiento y no emplear busqueda, la latencia esperada es baja, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tokenizador | Elo estimado | Licencia |
|---|---|---|---|---|---|
| chess-gpt-uci-square (este) | 50,6 M | 384 | uci-square (vocab 71) | 1.792 | MIT |
| chess-gpt-pgn-char (A) | no disponible | no disponible | pgn-char (vocab 34) | 1.940 | MIT |
| chess-gpt-uci-move (B) | no disponible | no disponible | uci-move (vocab 1971) | 1.908 | MIT |

No se dispone de datos sobre otros modelos comparables de la misma categoria (GPTs pequenos entrenados exclusivamente para jugar al ajedrez sin busqueda) en la informacion proporcionada.

## Limitaciones y advertencias

- Elo estimado de 1.792 en escala Lichess: claramente por debajo de motores clasicos como Stockfish y de los modelos A y B de la misma familia. No es adecuado para juego competitivo.
- Perdida media de 61 centipeones por movimiento, la mas alta de los tres modelos, lo que indica una calidad de jugada inferior pese a su mayor tasa de legalidad.
- Sin busqueda ni evaluacion: no puede planificar a largo plazo ni corregir errores tacticos mediante calculo.
- Riesgo de generar movimientos ilegales en el 0,29% de los casos sobre partidas humanas retenidas; en produccion es imprescindible validar la legalidad con una libreria como `python-chess`.
- Ventana de contexto de 384 tokens, suficiente para una partida pero limitada para analisis de variantes largas o comentarios.
- No se documentan sesgos especificos, pero el entrenamiento con partidas de Lichess de ritmo rapid o superior puede infrarrepresentar estilos de juego de niveles muy bajos o de otras plataformas.
- Licencia MIT: permite uso comercial y modificacion con atribucion, sin restricciones adicionales conocidas.
- No se han publicado datos sobre cuantizacion, latencia ni soporte en frameworks de despliegue estandar, lo que limita su uso en pipelines de produccion sin trabajo adicional de integracion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ftaz/chess-gpt-uci-square
- Modelo A (pgn-char): https://huggingface.co/ftaz/chess-gpt-pgn-char
- Modelo B (uci-move): https://huggingface.co/ftaz/chess-gpt-uci-move
- Articulo tecnico: https://blog.wezn.dev/chess-gpt/
- Codigo fuente: https://github.com/wezn/chess-gpt
- Dataset de entrenamiento: https://huggingface.co/datasets/lichess/standard-chess-games
