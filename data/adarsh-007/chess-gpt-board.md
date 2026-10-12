# adarsh-007/chess-gpt-board

## Resumen

Chess GPT board es una familia de dos transformadores pequeños (31,46M y 17,49M parámetros) entrenados desde cero en PyTorch por el usuario adarsh-007 para predecir el movimiento que jugaría un humano en una posición dada de ajedrez. El modelo no recibe las reglas del juego ni realiza búsqueda alguna: una única pasada hacia delante produce una distribución softmax sobre los 1.968 movimientos UCI posibles. Se entrenó sobre 3.001.840 partidas humanas de la base de datos abierta de Lichess (mayo de 2016), un total de 224,5M de jugadas.

La relevancia del proyecto es doble. Por un lado, es un ejercicio de imitación de comportamiento humano más que de juego óptimo: el objetivo no es ganar a Stockfish, sino modelar la distribución de jugadas de jugadores reales en distintos tramos de Elo. Por otro, sirve como demostración reproducible de entrenamiento from scratch con un presupuesto mínimo: el modelo de 31,46M alcanza un 50,8% de acierto top-1 sobre posiciones retenidas y un Elo ajustado de 1558 (IC 95%: 1528-1589) en la escala `UCI_Elo` de Stockfish 18, sin search.

Arquitectónicamente es un encoder tipo BERT: bloques pre-LayerNorm sin máscara causal, embeddings posicionales aprendidos y atención fusionada `scaled_dot_product_attention`. Cada posición se serializa como una secuencia fija de 81 tokens con vocabulario de entrada de 2.012 símbolos, y la salida es un softmax sobre el espacio completo de movimientos legales del ajedrez.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder pre-LayerNorm, sin mascara causal, con `scaled_dot_product_attention` fusionada |
| Parametros totales | 31.463.264 (variante 30M) y 17.487.732 (variante 16M), incluyendo la cabeza legal |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 81 tokens por posicion (4 de enroque, 1 de al paso, 1 de resultado, 2 de Elo, 64 casillas y 8 jugadas previas) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (no procesa lenguaje natural; solo notacion de ajedrez) |
| Licencia | MIT |
| Formato de pesos | no disponible (repositorio PyTorch de 0,2 GB; no se especifica safetensors ni GGUF) |
| Vocabulario de entrada | 2.012 tokens (44 de estado de tablero + `<no_move>` + 1.968 movimientos UCI para el historial) |
| Espacio de salida | 1.968 movimientos UCI (todos los que pueden existir en ajedrez) |
| Configuracion 30M | `n_emb` 512, 8 cabezas, 9 capas, head size 64, FF 512 -> 2048 -> 512 |
| Configuracion 16M | `n_emb` 396, 6 cabezas, 8 capas, head size 66, FF 396 -> 1584 -> 396 |
| Condicionamiento | Token de resultado (`<me_wins>`/`<me_loses>`/`<draw>`) y dos tokens de Elo (rango 800-2400, en cubos de 200) |

## Arquitectura y entrenamiento

El modelo tokeniza la posición desde el punto de vista del bando que mueve: cuando le toca a las negras, el tablero se refleja para que el modelo juegue siempre "hacia arriba" con las piezas en mayúscula, y su respuesta se vuelve a reflejar. La secuencia de entrada combina derechos de enroque, columna de captura al paso, resultado de la partida, estimación de Elo de ambos jugadores, las 64 casillas en orden a8-h1 y las últimas 8 jugadas en formato UCI. El token `<cls>` en la posición 0 es el que se usa para leer la distribución de movimientos, igual que en BERT.

El entrenamiento usó la base de datos abierta de Lichess de mayo de 2016 (6.225.957 partidas valoradas). Se filtraron las partidas bullet (definición de Lichess: base + 40 x incremento < 180 s), las que no terminaron de forma normal (sin pérdidas por tiempo ni abandonos, para que el token de resultado refleje el tablero) y las partidas muy cortas, quedando 3.001.840 partidas y 224,5M de jugadas. El split es 90/10 por partida y en orden temporal. Las posiciones de entrenamiento se generan al vuelo replicando partidas y tomando plies aleatorios, de modo que las ~189M posiciones de entrenamiento no se almacenan.

Ambos tamaños usan AdamW con betas (0.9, 0.95) y batch de 256 posiciones, con autocast bf16 y pesos en fp32, y dropout 0 porque ninguna posición se ve dos veces. El 30M usa warmup de 2.000 pasos, LR constante de 3e-4 y decaimiento hasta 3e-5 durante 280.000 pasos (decay desde el paso 245.000), tras ver 71,7M posiciones. El 16M usa warmup de 2.000 pasos, LR constante de 4e-4 y decaimiento hasta 4e-5 durante 150.000 pasos (decay desde el 130.000), tras ver 38,4M posiciones. No se menciona RLHF ni DPO: es entrenamiento supervisado puro de imitación.

## Capacidades

- Prediccion de movimiento humano: dada una posicion y un contexto (resultado y Elo), devuelve una distribucion de probabilidad sobre los 1.968 movimientos UCI posibles.
- Juego sin busqueda: una sola pasada hacia delante produce la jugada; no hay MCTS, alpha-beta ni rollouts.
- Condicionamiento por Elo y resultado: el usuario elige en tiempo de inferencia el token de resultado y los cubos de Elo de ambos bandos, lo que permite generar jugadas "como las de una partida ganada entre jugadores de X rating".
- Manejo implicito de reglas: nunca se le ensenaron las reglas, pero su movimiento mas probable solo es ilegal en el 0,05% de las posiciones de test.
- Deteccion de jaque: el rendimiento sube hasta el 73,6% de top-1 (variante 30M) en posiciones donde el jugador esta en jaque.
- Rendimiento en finales: 59,8% de top-1 en posiciones con 10 o menos piezas (variante 30M).
- Capacidades multilingues: no aplica, el modelo no procesa lenguaje natural.
- Tool calling, function calling, agentes, vision, audio, thinking mode: no soportados.

## Casos de uso

- Analisis de estilo por nivel de Elo: ajustando los tokens de Elo a 800, 1400 o 2200, el modelo genera la jugada tipica de cada franja, lo que permite estudiar como cambia la eleccion de jugada con la fuerza del jugador.
- Generacion de partidas sinteticas para datasets de ajedrez: hacer que dos instancias del modelo jueguen entre si con Elo y resultado condicionados produce partidas con una distribucion de errores mas humana que la de un motor, utiles para aumentar datos de entrenamiento de otros modelos.
- Deteccion de trampas y analisis anticheat: comparar la probabilidad que el modelo asigna a la jugada realmente jugada por un usuario permite puntuar lo "humano" de una partida y detectar desviaciones anormales respecto al comportamiento esperado en su franja de Elo.
- Benchmark de imitacion de comportamiento: sirve como linea base ligera (31M parametros, sin search) para investigar cuanto de la eleccion humana de jugada se explica solo con patrones de tablero e historial reciente.
- Ensenanza y ajedrez educativo: la Space de demostracion permite jugar contra el modelo y observar en que tipo de posiciones falla, util para ilustrar conceptos de apertura, medio juego y final con ejemplos de errores realistas.
- Investigacion en representacion de tableros: el esquema de tokenizacion de 81 tokens (estado, Elo, resultado y 8 jugadas) es reutilizable como entrada para otros experimentos de transformers sobre ajedrez.
- Generacion de problemas y posiciones de practica: muestrear jugadas del modelo en finales concretos permite crear ejercicios donde el error es plausible para un humano y no una jugada de motor.
- Simulacion de oponentes para entrenamiento humano: al no usar search y ser extremadamente ligero, puede ejecutarse como rival en aplicaciones locales o web con latencia muy baja.

## Benchmarks y rendimiento

Posiciones retenidas (muestra fija de 200.000 posiciones de validacion):

| Modelo | Val loss | Top-1 | Top-5 | Probabilidad en movimientos ilegales |
|---|---|---|---|---|
| 30M, fin de LR constante (paso 245k) | 1,828 | 47,6% | 85,0% | 7,0% |
| 30M, tras decaimiento (paso 280k) | 1,635 | 50,8% | 87,7% | 5,1% |
| 16M, fin de LR constante (paso 130k) | 1,889 | 46,1% | 83,8% | 7,1% |
| 16M, tras decaimiento (paso 150k) | 1,689 | 49,9% | 86,9% | 5,9% |

Desglose por fase de partida (15.000 posiciones de test):

| Grupo | Posiciones | 30M top-1 | 30M masa ilegal | 16M top-1 | 16M masa ilegal |
|---|---|---|---|---|---|
| Todas | 15.000 | 51,3% | 5,2% | 50,1% | 6,0% |
| Jugadas 1-10 | 4.945 | 50,7% | 0,8% | 50,3% | 0,9% |
| Jugadas 11-20 | 4.744 | 49,7% | 4,5% | 48,0% | 5,3% |
| Jugadas 21-30 | 2.906 | 51,7% | 8,7% | 50,8% | 10,3% |
| Jugadas 31+ | 2.405 | 55,1% | 11,2% | 53,0% | 12,7% |
| En jaque | 1.030 | 73,6% | 3,1% | 71,0% | 4,2% |
| Final (10 piezas o menos) | 776 | 59,8% | 10,2% | 56,6% | 11,0% |

Partidas contra Stockfish 18 (0,1 s por jugada, 200 partidas por nivel, 600 partidas por modelo):

| `UCI_Elo` de Stockfish | 30M V / T / D | Puntuacion 30M | 16M V / T / D | Puntuacion 16M |
|---|---|---|---|---|
| 1320 | 142 / 17 / 41 | 75,2% | 119 / 41 / 40 | 69,8% |
| 1500 | 96 / 31 / 73 | 55,8% | 71 / 32 / 97 | 43,5% |
| 1700 | 54 / 43 / 103 | 37,8% | 45 / 37 / 118 | 31,8% |
| Elo ajustado | 1558 (IC 95% 1528-1589) | | 1492 (IC 95% 1462-1522) | |

Notas del propio autor: las cifras de Elo estan en la escala `UCI_Elo` de Stockfish, calibrada contra motores en controles de tiempo mas largos, y no son ratings de Lichess ni de FIDE. El intervalo solo cubre el ruido entre partidas.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en cualquier precision. Los 31,46M parametros ocupan aproximadamente 126 MB en fp32 y unos 63 MB en bf16, mas el coste de activaciones (secuencia de 81 tokens, batch pequeno).
- GPU recomendadas: cualquier GPU CUDA, incluida una GTX 1050 Ti o una GPU integrada reciente. Una RTX 4090, A100 o H100 estan sobredimensionadas para este modelo.
- Cabe en GPU de consumo: si, con enorme margen, en cualquier GPU de consumo y en la mayoria de CPUs modernas.
- Opciones de despliegue: PyTorch nativo (es la unica via documentada). No es compatible con vLLM, llama.cpp, Ollama o TGI, ya que no es un modelo causal de lenguaje con tokenizador de texto. La exportacion a ONNX o TorchScript no esta documentada.
- Latencia y throughput estimados: no disponibles. La model card solo indica que el entrenamiento uso batch de 256 posiciones y bf16 autocast, y que la inferencia es una unica pasada hacia delante sin search, lo que en la practica implica latencias de milisegundos incluso en CPU.
- Demo publica: existe un Space en Hugging Face para jugar contra el modelo, que confirma que el coste de despliegue es bajo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Top-1 (movimiento humano) | Elo (escala Stockfish `UCI_Elo`) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| chess-gpt-board 30M | 31,46M | 81 tokens | 50,8% | 1558 (1528-1589) | MIT | Hugging Face |
| chess-gpt-board 16M | 17,49M | 81 tokens | 49,9% | 1492 (1462-1522) | MIT | Hugging Face |
| Otros modelos de prediccion de movimiento humano (por ejemplo, la familia Maia) | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |
| Motores clasicos (Stockfish 18) | no disponible | no disponible | no aplica (optimizan juego, no imitacion) | usado como referencia de calibracion | no disponible | no disponible |

En la informacion proporcionada no hay datos de benchmarks de modelos externos comparables, por lo que la unica comparacion cuantitativa posible es entre las dos variantes del propio repositorio. Los resultados de la busqueda web no contienen informacion relevante sobre modelos de ajedrez: los enlaces devueltos corresponden a personas y canales no relacionados con este proyecto.

## Limitaciones y advertencias

- Sesgo de datos: todo el entrenamiento proviene de partidas valoradas de Lichess de mayo de 2016, lo que sesga el estilo hacia la poblacion de esa plataforma, ese periodo y ese formato. No se documentan partidas de otros servidores ni de otras decadas.
- Sesgo de resultado: el token de resultado condiciona la generacion. Si se configura `<me_wins>` en una posicion perdida, el modelo producira jugadas coherentes con una partida que se gana, no con la realidad del tablero.
- Alucinacion estructural: el modelo no conoce las reglas y dedica entre un 0,8% y un 12,7% de su masa de probabilidad a movimientos ilegales segun la fase de la partida. Su movimiento mas probable es ilegal en el 0,05% de las posiciones de test, lo que obliga a filtrar por legalidad en cualquier uso en produccion.
- Filtrado de datos: se excluyeron partidas bullet, partidas con final por tiempo o abandono y partidas muy cortas, de modo que el modelo no modela el comportamiento humano bajo esas condiciones.
- Sin busqueda: el autor lo presenta explicitamente como un modelo sin search. Cualquier comparacion con motores de ajedrez mide imitacion humana, no fuerza de juego.
- Idiomas: no aplica; el modelo no procesa lenguaje natural, por lo que no hay capacidades multilingues que evaluar.
- Licencia: MIT, permisiva para uso comercial, pero la model card no incluye clausulas sobre responsabilidad ni sobre el uso de los pesos derivados.
- Formato de pesos y cuantizacion: no documentados. No hay confirmacion de que los pesos esten en safetensors ni de que existan versiones cuantizadas, lo que complica la integracion en pipelines estandar.
- Madurez del proyecto: 0 descargas y 1 "like" en el momento de la consulta, con repositorio creado y actualizado el 12 de octubre de 2026. El propio README esta truncado en la seccion "How it got here", por lo que falta informacion sobre las cinco familias de modelos entrenadas.
- Idiomas y tokenizacion: al no ser un modelo de lenguaje, no puede integrarse en frameworks de servido de LLM habituales; requiere codigo de preprocesado propio para convertir FEN y jugadas a la secuencia de 81 tokens.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/adarsh-007/chess-gpt-board
- Demo interactiva (Space): https://huggingface.co/spaces/adarsh-007/chess-gpt
- Base de datos de Lichess (CC0), origen de los datos de entrenamiento: https://database.lichess.org/
- Perfil del autor en Hugging Face: https://huggingface.co/adarsh-007
- Paper, blog o repositorio adicional: no disponible en la informacion proporcionada. Los resultados de la busqueda web no contienen enlaces relacionados con este modelo de ajedrez.
