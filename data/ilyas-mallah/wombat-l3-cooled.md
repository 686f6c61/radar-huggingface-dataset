# ilyas-mallah/wombat-l3-cooled

## Resumen

Wombat L3 (cooled) es un checkpoint de investigación de un motor de ajedrez neuronal desarrollado por ilyas-mallah dentro del proyecto Wombat, un registro de experimentos público alojado en GitHub. No es un modelo de lenguaje: se trata de una red recurrente tipo transformer de 5.596.077 parámetros entrenada para evaluar posiciones de ajedrez y resolver puzzles. Este checkpoint concreto (L3) es el segundo de la serie de ejecuciones largas y comparte arquitectura exacta con L2, diferenciándose únicamente en el volumen de datos de entrenamiento: 24,9 millones de posiciones etiquetadas frente a los 10,1 millones de L2.

El modelo emplea dos bloques transformer con pesos compartidos aplicados de forma recurrente (T = 8 pasos por defecto), una anchura de 384, 8 cabezas de atención y una MLP de 1.536 unidades. La innovación conceptual es el uso de cómputo en tiempo de inferencia (test-time compute) mediante la variación del número de pasos recurrentes, lo que permite al modelo "pensar" más o menos profundo según el presupuesto disponible. El entrenamiento se realizó sobre un único RTX 5090 alquilado, con etiquetas generadas por Stockfish 19 a 20.000 nodos.

Su relevancia es estrictamente investigadora: el propio autor lo describe como un artefacto de un proyecto pausado y no como un motor fuerte. En juego real está empatado con L2 (diferencia de +0,029 por partida con intervalo de confianza que cruza cero), por lo que el checkpoint de referencia para resultados principales sigue siendo L2. Resulta útil como caso de estudio de escalado de datos en redes recurrentes pequeñas y de evaluación rigurosa con intervalos de confianza pareados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer recurrente con pesos compartidos (2 bloques, T = 8 pasos por defecto) |
| Parametros totales | 5.596.077 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de contexto textual; procesa posiciones de ajedrez) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`), PyTorch (`wombat-l3-cooled.pt`), `config.json` |

Especificaciones adicionales: anchura 384, 8 cabezas de atención, MLP de 1.536, checkpoint en el paso 115.000 (100.000 pasos más 15.000 de cooldown) con pesos EMA.

## Arquitectura y entrenamiento

La red es un transformer recurrente de profundidad efectiva variable: dos bloques transformer con pesos compartidos que se aplican iterativamente T veces sobre la misma representación. El valor por defecto es T = 8, pero el diseño permite ajustar T en inferencia (se reportan evaluaciones a T = 1, T = 8, T = 16 y T = 64), lo que constituye el mecanismo de cómputo en tiempo de test. La arquitectura es idéntica a la de L2; L3 solo cambia el conjunto de datos y el número de pasos de entrenamiento.

El entrenamiento utilizó 24,9 millones de posiciones etiquetadas: las 10.092.005 de L2 más los primeros 14,8 millones de un segundo corpus derivado de registros de evaluación posteriores de Lichess, etiquetados por Stockfish 19 a 20.000 nodos. Una cuarta parte de cada lote está compuesta por posiciones de puzzles de Lichess. El cómputo se realizó en un único RTX 5090 alquilado. No se menciona uso de RLHF ni DPO; el aprendizaje es supervisado sobre etiquetas de motor.

## Capacidades

- Evaluación de posiciones de ajedrez: produce una valoración de la posición (win-chance) a partir del estado del tablero.
- Resolución de puzzles tácticos de ajedrez: 81,1% de acierto en el benchmark de 10.000 puzzles a T = 16.
- Cómputo adaptativo en inferencia: el número de pasos recurrentes T es ajustable, permitiendo intercambiar latencia por precisión (T = 1, 8, 16, 64).
- Juego de partidas completas vía UCI: se ha enfrentado a Stockfish 19 a 50.000 nodos y a UCI_Elo 1700 en 800 partidas por configuración.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso textual, visión, audio ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- Investigación sobre escalado de datos en redes recurrentes pequeñas: comparar L2 (10,1 M posiciones) con L3 (24,9 M) permite estudiar el retorno marginal de añadir datos en una arquitectura de 5,6 M de parámetros con cómputo recurrente fijo.
- Estudio de cómputo en tiempo de test: el barrido de T (1, 8, 16, 64) sobre el mismo checkpoint ofrece un banco de pruebas controlado para medir cómo escala la precisión con el esfuerzo de inferencia en ajedrez.
- Reproducción de experimentos de ajedrez neuronal: al ser Apache-2.0 y publicar código, configuración y pesos en tres formatos, sirve para replicar pipelines de etiquetado con Stockfish y evaluación con ChessBench.
- Evaluación de metodología estadística: el uso de intervalos de confianza pareados sobre aperturas emparejadas (400 aperturas, 800 partidas) es un ejemplo práctico de cómo detectar que una ventaja aparente (+0,065 por partida en las primeras 200 aperturas) era en gran parte azar.
- Docencia sobre motores de ajedrez ligeros: con 5,6 M de parámetros y pesos en safetensors, es adecuado para diseccionar el flujo de un motor neuronal sin la complejidad de redes de decenas de millones de parámetros.
- Análisis de colas de error: el modelo reporta la tasa de movimientos con pérdida de 20 o más puntos de win-chance (2,01% a T = 8), útil para estudiar la distribución de errores graves en motores pequeños frente a referencias como ChessBench 9M (0,38%).

## Benchmarks y rendimiento

| Benchmark | Wombat L3 | Wombat L2 | ChessBench 9M |
|---|---|---|---|
| Puzzles de Lichess (10.000, T = 16) | 81,1% | 80,8% | no disponible |
| Posiciones de ChessBench, movimientos con pérdida >= 20 win-chance pts (T = 8) | 2,01% (IC 1,88-2,15) | 2,14% | 0,38% |

Resultados de juego (L3 frente a L2, 400 aperturas pareadas, 800 partidas por configuración):

| Enfrentamiento | Diferencia por partida (L3 - L2) | IC 95% |
|---|---|---|
| Stockfish 19 a 50.000 nodos y UCI_Elo 1700 | +0,029 | -0,019 a +0,078 |

Presupuesto de pensamiento (partidas jugadas solo con L2, 300 partidas por configuración, una semilla):

| Comparación | Puntuación |
|---|---|
| T = 64 frente a T = 1 | 0,928 |
| T = 64 frente a T = 8 | 0,305 |
| T = 8 frente a T = 1 | 0,968 |

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 5,6 M de parámetros en fp32 los pesos ocupan aproximadamente 22 MB, más el estado de activaciones de la red recurrente.
- GPU recomendadas: cualquier GPU consumer moderna es sobrada. El entrenamiento se realizó en un único RTX 5090; la inferencia cabe en GPUs de gama baja e incluso en CPU.
- Cabe en cualquier GPU consumer, incluidas integradas, y en CPU sin problema.
- Opciones de despliegue: PyTorch nativo cargando `wombat-l3-cooled.pt` (el formato que espera el código del repositorio) o `model.safetensors`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada. El coste de inferencia escala linealmente con T (8 pasos por defecto, hasta 64 en las pruebas de presupuesto).

## Comparativa con modelos similares

| Modelo | Parámetros | Arquitectura | Datos de entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Wombat L3 (cooled) | 5,6 M | Transformer recurrente, T configurable | 24,9 M posiciones | Apache-2.0 | Hugging Face |
| Wombat L2 (cooled) | 5,6 M | Transformer recurrente, T configurable | 10,1 M posiciones | Apache-2.0 | Hugging Face (checkpoint de referencia) |
| ChessBench 9M | ~9 M (según nombre) | no disponible | no disponible | no disponible | referencia externa citada en la model card |

L3 no supera a L2 de forma estadísticamente significativa en juego, y queda por detrás de ChessBench 9M en la cola de errores (2,01% frente a 0,38%). No se dispone de datos de otros motores neuronales comparables en la información proporcionada.

## Limitaciones y advertencias

- Artefacto de investigación de un proyecto pausado: el autor lo describe explícitamente como no un motor fuerte.
- El beneficio de más pasos de entrenamiento está limitado por la profundidad entrenada; no hay búsqueda (no es un motor alfa-beta ni MCTS).
- Queda por detrás de ChessBench 9M en todas las medidas reportadas.
- La ventaja inicial observada frente a L2 (+0,065 por partida en las primeras 200 aperturas) se diluyó con la muestra completa (+0,029 con IC que cruza cero): riesgo de conclusiones prematuras con muestras pequeñas.
- La prueba de presupuesto de pensamiento se jugó solo con L2, 300 partidas por configuración y una sola semilla; el test registrado (100 Elo sobre 1.000 partidas pareadas en dos semillas) sigue abierto.
- La escalera completa de niveles de 1320 a 2600 se ejecutó para L2, no para L3.
- Sin capacidades de lenguaje, visión ni audio; no apto para tareas de NLP.
- Licencia Apache-2.0 permite uso comercial de pesos y código, pero las etiquetas provienen de Stockfish 19 (GPL-3.0, ejecutado como programa separado); `THIRD_PARTY.md` en el repositorio detalla las licencias de terceros.
- Riesgo de alucinación y sesgos: no aplica en el sentido de modelos de lenguaje; en ajedrez el equivalente son errores de evaluación graves, medidos en la cola de error del 2,01%.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ilyas-mallah/wombat-l3-cooled
- Repositorio del proyecto: https://github.com/ilyas-mallah/wombat
- Documento de plan y resultados: `docs/plan.md` en el repositorio
- Licencias de terceros: `THIRD_PARTY.md` en el repositorio
- Bases de datos de Lichess (CC0): https://database.lichess.org/
- Stockfish (GPL-3.0): https://stockfishchess.org/
