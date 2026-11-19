# rajdeepmondal/gpt-from-first-principles-chess

## Resumen

El repositorio `rajdeepmondal/gpt-from-first-principles-chess` no contiene un unico modelo, sino cuatro checkpoints de GPT entrenados exclusivamente con notacion de partidas de ajedrez, sin reglas ni tablero, como material didactico del curso "GPT from first principles". El autor, rajdeepmondal, construye un GPT leccion a leccion y reutiliza el mismo codigo de generacion de texto cambiando unicamente el corpus de entrenamiento. Los modelos van desde 4,4 millones de parametros entrenados en la GPU de un portatil M4 hasta 76,3 millones entrenados durante 12 horas en una NVIDIA L40S.

El interes no es la competicion con motores de ajedrez, sino la demostracion empirica de que un transformer decoder-only de escala minima puede aprender sintaxis de ajedrez (legalidad de movimientos, estructura de partidas) solo a partir de secuencias de texto. El checkpoint `strong/` alcanza una estimacion de rating de 1.785 Elo en la escala de Stockfish, con un 98,7% de movimientos legales en posiciones no vistas para el modelo grande (`chess_big/`).

La relevancia actual es formativa y reproducible: los scripts de evaluacion, los datos (partidas de Lichess) y los resultados estan publicados, y el coste total de entrenamiento declarado es de 2,82 USD para `chess_big/` y 22,33 USD para `strong/`. La licencia Apache 2.0 permite reutilizacion comercial de los pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT), atención multi-cabeza con cabezas que comparten K/V (grouped-query attention), RoPE, RMSNorm, SwiGLU |
| Parametros totales | 4.488.448 (`chess/`, `chess_early/`); 13.226.880 (`chess_big/`); 76.286.080 (`strong/`) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens (`chess/`, `chess_big/`); no disponible para `strong/` |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el autor menciona entrenamiento en 16 bits, no cuantizaciones de inferencia) |
| Idiomas soportados | no disponible (el vocabulario es notacion de ajedrez, no lenguaje natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`), mas `shape.json` y `vocab.json`; checkpoints `.pt` (`chess.pt`) y logs JSON |

Detalles de configuracion por checkpoint:

| Checkpoint | Bloques | Anchura | Cabezas | Cabezas K/V | Vocabulario | Tokens de entrenamiento |
|---|---|---|---|---|---|---|
| `chess/` | 6 | 256 | 8 | 4 | 636 | 111.113.359 |
| `chess_big/` | 8 | 384 | 12 | 6 | 636 | 488.464.921 |
| `strong/` | 16 | 640 | 20 | 10 | 6.556 | 1.548.506.981 |

## Arquitectura y entrenamiento

Los modelos son transformers decoder-only con posiciones rotatorias (RoPE), RMSNorm y SwiGLU, con atencion de cabezas agrupadas (8 cabezas con 4 conjuntos de K/V en `chess/`, 12 con 6 en `chess_big/`, 20 con 10 en `strong/`). El vocabulario de `chess/` y `chess_big/` tiene 636 tokens (movimientos en notacion algebraica y marcas); en `strong/` es de 6.556 tokens, donde cada movimiento completo es un token unico y cada linea empieza con tres palabras: rating de blancas en centenas, rating de negras y resultado (por ejemplo `W23 B22 1-0`).

Datos de entrenamiento: `chess/` usa un mes de partidas valoradas de Lichess (marzo de 2014): 749.462 partidas leidas, 29 duplicados o casi duplicados descartados, 741.983 para entrenamiento y 7.450 reservadas. `chess_big/` amplia a cuatro meses (marzo a junio de 2014): 3.256.826 partidas y 488.464.921 tokens. `strong/` usa quince meses de partidas valoradas de Lichess (junio-septiembre de 2024 y noviembre de 2024-septiembre de 2025), filtrando a jugadores con rating >= 2.200, partidas no bullet y final marcado como normal por Lichess: 19.449.873 partidas leidas, 19.219.755 escritas y 1.548.506.981 tokens; se reservaron 193.852 partidas para validacion.

Entrenamiento: `chess/` durante 10.420 pasos a tasa maxima 0,001 en la GPU de un M4; `chess_big/` 69.103 pasos en 16 bits durante 91 minutos en una L40S (2,82 USD); `strong/` 443.470 pasos de 32 ventanas a tasa maxima 0,0005 en 16 bits, 2,3 pasadas sobre los datos, 12 horas de pasos en una L40S (16 horas de reloj, 22,33 USD). No se menciona RLHF, DPO ni ajuste por preferencias: el entrenamiento es exclusivamente de modelado de lenguaje autorregresivo sobre secuencias de movimientos.

## Capacidades

- Generacion de secuencias de movimientos de ajedrez en notacion algebraica a partir de un prefijo de partida.
- Prediccion de movimientos legales sin conocer las reglas: 95% de movimientos legales en posiciones no vistas (`chess_big/`: 987 de 1.000; `chess/`: 929 de 1.000).
- Generalizacion a posiciones no presentes en el corpus de entrenamiento (`chess/`: 737 de 808 posiciones no vistas).
- Codificacion implicita del estado del tablero: una sonda lineal sobre la salida del ultimo bloque identifica correctamente el 81,2% de las casillas, frente al 67,3% de la linea base de "pieza mas habitual por casilla".
- Condicionamiento por rating y resultado en `strong/` (prefijo `W23 B22 1-0`).
- No dispone de tool calling, function calling, capacidades de agente, vision, audio ni multilingueismo en lenguaje natural.
- No es un motor de ajedrez con busqueda: genera movimientos sin arbol de busqueda ni evaluacion explicita.

## Casos de uso

- Material didactico para cursos de IA: reproducir el entrenamiento paso a paso con los scripts `gpt/games.py`, `gpt/play.py`, `gpt/probe.py`, `gpt/gpu.py` y `gpt/strong.py`, y comparar checkpoints intermedios (`chess_early/` frente a `chess/`).
- Investigacion en interpretabilidad: usar la sonda lineal de `gpt/probe.py` para estudiar como un transformer pequeño representa el estado del tablero en sus activaciones internas (81,2% de acierto en casillas).
- Estudio de aprendizaje de gramaticas formales: analizar la tasa de legalidad (95-98,7%) como metrica de adquisicion de reglas implicitas a partir de datos secuenciales.
- Generacion de partidas sinteticas para aumentacion de datos: producir secuencias plausibles de movimientos para pruebas de pipelines de procesamiento de ajedrez, aceptando que la calidad de juego es limitada.
- Benchmark de referencia para modelos "from scratch": comparar arquitecturas o tecnicas de tokenizacion (636 frente a 6.556 tokens) sobre el mismo corpus de Lichess.
- Docencia de ingenieria de entrenamiento a bajo coste: replicar el pipeline completo por 2,82-22,33 USD en una sola GPU L40S, con trazabilidad de pasos, learning rate y tokens.
- Evaluacion de robustez frente a posiciones fuera de distribucion: usar el subconjunto de 808 posiciones no vistas para medir generalizacion.

## Benchmarks y rendimiento

Resultados publicados por el autor (intervalos de confianza al 95% cuando se indican):

| Metrica | `chess/` | `chess_big/` | `strong/` |
|---|---|---|---|
| Perdida en partidas no vistas | 1,317 nats/token | 1,014 nats/token | 1,447 nats/token (token = movimiento) |
| Movimientos legales (1.000 posiciones no vistas) | 929 (0,911-0,944); 884 con marcas correctas | 987 (0,978-0,993) | no disponible |
| Legales en 808 posiciones no vistas en entrenamiento | 737 (0,890-0,931) | no disponible | no disponible |
| Puntos vs. jugador aleatorio (200 partidas) | 0,92 (0,88-0,95) | 0,94 (0,91-0,96) | no disponible |
| Puntos vs. jugador de 1 jugada de profundidad (200 partidas) | 0,16 (0,11-0,21) | 0,89 (0,86-0,93) | no disponible |
| Puntos vs. si mismo en paso 2.500 (200 partidas) | 0,64 (0,60-0,68) | no disponible | no disponible |
| Puntos vs. `chess/` (200 partidas) | — | 0,86 (0,83-0,90) | no disponible |
| Rating (escala con aleatorio = 0) | +421 (378-465) | +775 (714-829) | no disponible |
| Puntos vs. Stockfish 1.320 (100 partidas) | no disponible | 0,23 (0,15-0,31) | no disponible |
| Puntos vs. Stockfish 1.400-2.600 (100 partidas por nivel) | no disponible | no disponible | 0,80 / 0,56 / 0,36 / 0,41 / 0,19 / 0,09 / 0,06 |
| Rating en escala Stockfish (700 partidas) | no disponible | no disponible | 1.785 (1.737-1.836) |
| Puntos vs. Stockfish 1.800 a 0,5 s/movimiento | no disponible | no disponible | 0,41 (0,32-0,50) |

No se han publicado resultados de benchmarks estandar de NLP (MMLU, HumanEval, GSM8K) en la informacion disponible; el modelo no esta orientado a esas tareas.

## Requisitos de hardware

- VRAM: los pesos en safetensors de `strong/` (76,3 M de parametros) ocupan del orden de 0,15 GB en fp16 y 0,3 GB en fp32; el repositorio completo son 0,4 GB. `chess/` y `chess_big/` caben holgadamente en cualquier GPU consumer.
- GPU: entrenamiento realizado en una NVIDIA L40S (`chess_big/`, `strong/`) y en la GPU integrada de un Apple M4 (`chess/`). La inferencia es viable en CPU, en iGPU y en cualquier GPU dedicada moderna.
- Cabe en GPU consumer: si, en cualquier RTX o equivalente; el cuello de botella es el contexto corto (256 tokens) y el vocabulario reducido, no la memoria.
- Despliegue: el autor proporciona scripts propios en Python (`gpt/play.py`, `gpt/strong.py`) que cargan `model.safetensors`, `shape.json` y `vocab.json`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y la tokenizacion especifica de ajedrez hace improbable su integracion directa sin adaptadores.
- Latencia y throughput: no disponibles. El coste declarado de entrenamiento es de 2,82 USD (`chess_big/`) y 22,33 USD (`strong/`) en una L40S.

## Comparativa con modelos similares

No hay una categoria estandar de "GPT de ajedrez from scratch" con la que comparar directamente. Alternativas cercanas:

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `gpt-from-first-principles-chess` (`strong/`) | 76,3 M | no disponible | GPT decoder-only sobre notacion de movimientos | Apache 2.0 | Hugging Face |
| `gpt-from-first-principles-chess` (`chess_big/`) | 13,2 M | 256 | Igual, corpus menor | Apache 2.0 | Hugging Face |
| Stockfish 17.1 | no aplica (motor con busqueda) | no aplica | Busqueda alfa-beta con evaluacion | GPLv3 | Distribucion publica |
| Leela Chess Zero | redes de gran tamano (millones a cientos de millones) | no aplica | Red neuronal + MCTS | GPLv3 | Distribucion publica |

La comparacion relevante es funcional: los GPT del repositorio no incorporan busqueda y su rating estimado (1.785 Elo en la escala de Stockfish para `strong/`) queda muy por debajo de motores convencionales, pero su coste de entrenamiento es de decenas de dolares y su codigo es didactico.

## Limitaciones y advertencias

- `chess/` es un jugador debil: pierde claramente contra un oponente de una jugada de profundidad (0,16 puntos en 200 partidas) y su rating estimado es de +421 sobre un jugador aleatorio.
- No hay busqueda ni evaluacion de posiciones: la calidad de juego esta acotada por la generacion autorregresiva.
- Contexto de 256 tokens: limita la longitud de partida que el modelo puede condicionar de una vez; no se documenta el contexto de `strong/`.
- Vocabulario especifico de ajedrez (636 o 6.556 tokens): el modelo no genera lenguaje natural ni codigo, pese a la etiqueta `text-generation`.
- Riesgo de movimientos ilegales: entre el 1,3% y el 5% de movimientos generados son ilegales segun el checkpoint y la posicion.
- Sesgo de datos: el corpus son partidas valoradas de Lichess, con filtros de rating y formato en `strong/`; el comportamiento fuera de esa distribucion (niveles bajos, bullet, variantes) no esta evaluado.
- La estimacion de rating depende del conjunto de rivales del ajuste (el propio autor lo senala: `chess/` pasa de +421 a +355 segun el ajuste).
- Licencia Apache 2.0: permite uso comercial, pero no se documentan garantias, sesgos ni evaluaciones de seguridad.
- Sin soporte declarado en runtimes estandar de inferencia (vLLM, llama.cpp, Ollama, TGI); requiere los scripts del curso.
- El repositorio incluye ficheros de validacion de 193.852 partidas (`strong_20*.val`), no solo pesos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rajdeepmondal/gpt-from-first-principles-chess
- Repositorio del curso: https://github.com/rajdeepmondaldotcom/gpt-from-first-principles
- Datos de partidas de Lichess en Hugging Face: no disponible (el autor los menciona como publicados por Lichess, sin enlace directo en la model card)
- Paper: no disponible
- Demo: no disponible
