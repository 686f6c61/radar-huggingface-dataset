# RDTvlokip/RDTChess

## Resumen

RDTChess es un modelo de red neuronal convolucional residual (ResNet) de 10,92 millones de parámetros diseñado exclusivamente para jugar al ajedrez mediante una única pasada hacia adelante, sin búsqueda de árbol, sin MCTS y sin libro de aperturas. Lo desarrolla el autor independiente RDTvlokip, que lo entrenó desde cero por imitación supervisada (behavioral cloning) sobre 5 497 103 partidas humanas de Lichess con jugadores de 1800+ Elo, lo que supone aproximadamente 400,6 millones de posiciones. El entrenamiento se realizó en una única GPU GTX 1080 Ti, lo que demuestra que un modelo compacto puede aprender a jugar a nivel decente sin recurrir a búsqueda explícita.

El modelo se publica bajo licencia Apache-2.0 en formato PyTorch, y su principal interés radica en su tamaño reducido, su rapidez de inferencia y su capacidad para predecir movimientos humanos con una precisión notable (51,7 % de acuerdo top-1). Aunque no es un modelo de lenguaje, su arquitectura de doble cabeza (política y valor) lo hace útil para tareas de análisis posicional, resolución táctica y generación de partidas sintéticas. El autor advierte explícitamente que los resultados provienen de una única ejecución con una sola semilla, por lo que deben interpretarse como un cuaderno de laboratorio más que como un benchmark consolidado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red residual (ResNet) con cabezas de política y valor |
| Parametros totales | 10,92 millones |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (procesa posiciones de ajedrez, no texto) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | En (aunque el modelo no es lingüístico) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch checkpoint (fichero .pt) |

## Arquitectura y entrenamiento

RDTChess es una red residual (ResNet) con dos salidas: una cabeza de política que produce una distribución de probabilidad sobre los movimientos legales y una cabeza de valor que estima la evaluación posicional. La entrada es una representación de la posición de ajedrez (presumiblemente un tensor de características, aunque la model card no detalla el encoding exacto). El modelo se entrena mediante imitación supervisada (behavioral cloning) sobre partidas humanas de Lichess con rating 1800+ Elo, usando como objetivo los movimientos reales jugados por los humanos. No se emplea refuerzo, búsqueda ni auto-juego; el aprendizaje es puramente por imitación.

El entrenamiento se realizó desde cero en una única GPU NVIDIA GTX 1080 Ti, con un total de aproximadamente 400,6 millones de posiciones extraídas de 5,5 millones de partidas. El autor indica que se trata de una única ejecución con una sola semilla, y que aunque las direcciones de los resultados son consistentes entre tres métricas independientes, las magnitudes no están validadas con múltiples semillas. No se menciona el uso de RLHF, DPO ni otras técnicas de ajuste fino; el modelo es el resultado directo del behavioral cloning.

## Capacidades

- Generación de movimientos de ajedrez en una sola pasada hacia adelante, sin búsqueda ni MCTS.
- Predicción de movimientos humanos: acuerdo top-1 del 51,7 % en partidas de Lichess con jugadores 1800+ Elo (split de validación).
- Resolución táctica de puzzles: acierta el primer movimiento de la solución en el 57,8 % de los casos y la línea completa en el 38,3 %.
- Evaluación posicional mediante la cabeza de valor (aunque no se publican métricas específicas de precisión de valor).
- Juego contra motores alpha-beta: obtiene un 88,7 % de victorias contra minimax de profundidad 1 y un 59,5 % contra minimax de profundidad 2 (300 partidas por oponente, seed 4242, límite de 300 movimientos).
- Rapidez de inferencia: al no requerir búsqueda, el modelo produce un movimiento en una única pasada, lo que lo hace adecuado para aplicaciones en tiempo real.
- No soporta tool calling, agentes ni razonamiento multi-paso fuera del contexto ajedrecístico; no es un modelo de lenguaje.

## Casos de uso

- Motor de análisis en tiempo real para plataformas de ajedrez: gracias a su inferencia de una sola pasada, puede evaluar posiciones y sugerir movimientos al instante, incluso en hardware modesto. Es adecuado para integrarse en aplicaciones de entrenamiento o análisis de partidas.
- Entrenamiento de jugadores humanos: el modelo, al imitar el estilo de jugadores de 1800+ Elo, puede generar explicaciones de movimientos típicos y ayudar a los estudiantes a comprender patrones posicionales y tácticos.
- Componente de un motor híbrido: combinado con un algoritmo de búsqueda (por ejemplo, alpha-beta o MCTS), RDTChess puede usarse como red de política o valor para guiar la poda y la evaluación, reduciendo la profundidad de búsqueda necesaria.
- Generación de partidas sintéticas para datasets: su capacidad para producir movimientos plausibles permite crear colecciones de partidas con estilo humano, útiles para entrenar otros modelos o para aumentar datos de entrenamiento.
- Bot para plataformas de ajedrez en línea: el autor ya ha desplegado un bot en Lichess (RDTChessBot), lo que demuestra su uso práctico como oponente automatizado en partidas rápidas.
- Investigación en imitación de comportamiento humano en juegos: al ser un modelo pequeño y entrenado solo con clonación de comportamiento, sirve como banco de pruebas para estudiar la transferencia de estilos de juego, la influencia del nivel de Elo y los límites de los modelos sin búsqueda.

## Benchmarks y rendimiento

Los siguientes resultados son los declarados por el autor en la model card (model-index). No se han verificado de forma independiente y provienen de una única ejecución con una sola semilla.

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| Predicción de movimiento humano (behavioral cloning) | Lichess julio 2026, partidas estándar, ambos jugadores 1800+ Elo, split held-out | Acuerdo top-1 | 51,7 % |
| Resolución táctica (una sola pasada, sin búsqueda) | Base de puzzles de Lichess, 23 845 puzzles muestreados por longitud de solución y banda de rating | Primer movimiento de la solución | 57,8 % |
| Resolución táctica (una sola pasada, sin búsqueda) | Ídem | Línea completa de la solución | 38,3 % |
| Resolución táctica (una sola pasada, sin búsqueda) | Ídem | Movimiento tranquilo de entrada, rating 2400+ | 32,8 % |
| Juego contra minimax alpha-beta | 300 partidas por oponente, seed 4242, límite de 300 movimientos | Tasa de victoria vs minimax profundidad 1 | 88,7 % |
| Juego contra minimax alpha-beta | Ídem | Tasa de victoria vs minimax profundidad 2 | 59,5 % |

No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- Inferencia: el modelo tiene solo 10,92 millones de parámetros, por lo que cabe en cualquier GPU moderna (incluso integradas) y también en CPU con latencia razonable. No se especifica la VRAM mínima, pero es previsiblemente inferior a 1 GB.
- Entrenamiento: el autor utilizó una única GPU NVIDIA GTX 1080 Ti (11 GB VRAM), lo que indica que el entrenamiento es viable en hardware de consumo de gama media.
- Despliegue: al ser un modelo PyTorch estándar, puede exportarse a ONNX o TorchScript para producción. No se mencionan integraciones con vLLM, llama.cpp u Ollama, que son específicas para modelos de lenguaje.
- Latencia y throughput: no disponibles, pero al ser una única pasada de una red pequeña, la latencia por movimiento debería ser del orden de milisegundos en GPU y decenas de milisegundos en CPU.

## Comparativa con modelos similares

No se proporcionan comparativas directas en la información disponible. Sin embargo, se pueden citar alternativas conocidas en el dominio del ajedrez neuronal:

| Modelo | Parametros | Enfoque | Busqueda | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RDTChess | 10,92 M | Behavioral cloning, ResNet | Sin búsqueda | Apache-2.0 | HuggingFace |
| Maia Chess | ~100 M (aprox.) | Behavioral cloning, red convolucional | Sin búsqueda (predicción de movimientos humanos) | CC-BY-NC (aprox.) | GitHub / web |
| Leela Chess Zero | ~40 M (aprox.) | Red residual + MCTS, entrenamiento por auto-juego | MCTS | GPL-3.0 | GitHub |
| Stockfish | No neuronal (clásico) | Evaluación heurística + alpha-beta | Búsqueda profunda | GPL-3.0 | GitHub |

RDTChess se distingue por su tamaño extremadamente reducido y su entrenamiento puramente por imitación, sin refuerzo ni búsqueda. Comparado con Maia, que también imita a humanos, RDTChess es significativamente más pequeño y no se centra en predecir el movimiento humano exacto sino en jugar partidas completas. Frente a Leela Chess Zero, que usa MCTS y auto-juego, RDTChess es mucho más ligero pero también más débil en fuerza de juego absoluta.

## Limitaciones y advertencias

- Resultados de una única ejecución: todos los números provienen de una sola semilla y una sola ejecución de entrenamiento; no hay validación multi-seed, por lo que las magnitudes pueden variar.
- Sin búsqueda: el modelo no realiza búsqueda de árbol, por lo que su fuerza de juego está limitada frente a motores que combinan red neuronal con búsqueda (p. ej., Leela Chess Zero o Stockfish con red neuronal).
- Sesgo de los datos de entrenamiento: al imitar solo partidas de jugadores con 1800+ Elo, el modelo puede no representar estilos de juego de niveles inferiores o superiores.
- No es un modelo de lenguaje: no soporta procesamiento de texto, tool calling ni razonamiento general; su única función es el ajedrez.
- Posibles movimientos ilegales: no se especifica si la cabeza de política garantiza la legalidad de los movimientos generados; en caso contrario, sería necesario un filtro de legalidad en producción.
- Licencia Apache-2.0: permite uso comercial y modificación, pero el autor no ofrece garantías sobre el rendimiento ni soporte.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RDTvlokip/RDTChess
- Bot en Lichess: https://lichess.org/@/RDTChessBot
- Repositorio de código: no disponible
- Paper o documentación técnica: no disponible
