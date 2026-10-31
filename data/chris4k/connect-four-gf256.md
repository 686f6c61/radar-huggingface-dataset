# Chris4K/connect-four-gf256

## Resumen

Connect-four-gf256 es un modelo experimental de IA para juegos desarrollado por Christof Ckal (Chris4K) que aprende a jugar Conecta 4 mediante aritmética entera sobre el cuerpo finito GF(2⁸). Su rasgo distintivo es que el tronco de la red no utiliza multiplicaciones-acumulaciones en coma flotante: en su lugar combina operaciones XOR, consultas a tablas S-box aprendidas y sumas enteras. Se trata de un proyecto de investigación con doble propósito: demostrar que una arquitectura basada en aritmética entera puede aprender una política de juego, y medir con honestidad la brecha entre imitar a un profesor (acuerdo del 59,6 % en entrenamiento) y jugar bien de verdad (pierde frente a heurísticas simples de 1 y 2 niveles de profundidad).

El modelo tiene 8.422.496 parámetros (32,3 MB), se ejecuta íntegramente en CPU y está implementado en PyTorch bajo licencia MIT. Aunque su utilidad práctica como jugador es limitada —pierde contra un minimax básico—, resulta relevante como caso de estudio en supervisión por imitación de políticas de búsqueda, evaluación rigurosa de modelos de juego y exploración de alternativas sin coma flotante al transformer convencional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tronco GF(2⁸) entero (XOR + S-box + sumas enteras) con read-out float32 |
| Parametros totales | 8.422.496 (32,3 MB) |
| Parametros activos | no disponible (no es MoE; todos los parámetros se usan en cada pasada) |
| Longitud de contexto | 192 (lags: 0-10, 20) |
| Tipos de cuantizacion | no disponible (el tronco es aritmética entera nativa; el read-out es float32) |
| Idiomas soportados | no aplicable (modelo de juego, no de lenguaje) |
| Licencia | MIT |
| Formato de pesos | PyTorch (repositorio de 0,0 GB publicado; dataset en repositorio aparte) |

## Arquitectura y entrenamiento

El pipeline es: tablero → transcripción en bytes (formato v2, 10 bytes por jugada) → tronco GF(256) → read-out float32 → logits sobre 7 columnas. El tronco consta de 3 capas con dimensión d=32, 12 lags temporales (0 a 10 y 20) y contexto de 192. La descomposición de parámetros es: embeddings 8.192, coeficientes 288, tablas S-box 24.576, wiring 576, read-out 8.388.608 y bias 256. Es importante el scoping honesto del autor: el tronco no tiene operaciones MAC en coma flotante, pero el read-out float32 concentra el 99,6 % de los parámetros, por lo que el modelo completo no es un programa "cero FLOPs".

El entrenamiento es supervisado por imitación: cada jugada de cada partida se etiqueta con el movimiento elegido por un profesor de búsqueda negamax con poda alfa-beta (99,0 % de las etiquetas, one-hot) y, en el 1,0 % restante, por un solver exacto acotado (max_empty=7) que devuelve conjuntos de empate multietiqueta. El corpus consta de 320.000 partidas sintéticas generadas por el profesor jugando contra sí mismo, más un holdout de 4.000 partidas disjuntas por tablero. La configuración de entrenamiento incluye batch 16 y seed 32. Cabe destacar que el corpus publicado es una versión reparada: una versión anterior tenía un campo corrupto final en el 39,5 % de las filas.

## Capacidades

- Selección de columna en Conecta 4: produce logits sobre las 7 columnas y distribuye sus jugadas por todas ellas (recuerdo no nulo por columna en holdout: [39, 55, 94, 175, 78, 48, 23]).
- Lectura real del tablero: no es una política degenerada constante; responde a la configuración del tablero.
- Inferencia exclusivamente en CPU, sin necesidad de GPU.
- Derrota a un jugador aleatorio (85,2 %) y a una política de columna central (90,5 %) en enfrentamientos directos.
- No disponible: tool calling, agentes, capacidades multimodales o procesamiento de lenguaje natural.

## Casos de uso

- Docencia de aprendizaje supervisado por imitación: el repositorio publica corpus, objetivos por jugada y holdout disjunto, ideal para ejercicios de entrenamiento y evaluación de políticas.
- Investigación en aritmética entera sin coma flotante: sirve como base para experimentar con troncos GF(2⁸), tablas S-box aprendidas y su sustituibilidad por MACs float.
- Estudio de la brecha imitación-rendimiento: el proyecto documenta explícitamente que un 59,6 % de acuerdo con el profesor no implica fuerza de juego, un material excelente para cursos de evaluación de modelos.
- Benchmark educativo de IA para juegos: puede usarse como oponente de referencia débil (entre aleatorio y heurística 1-ply) en torneos de prácticas.
- Demo interactiva desplegable en CPU: gracias a su tamaño (32,3 MB) y ejecución en CPU, puede servirse en servidores modestos con aislamiento por sesión, como hace la demo oficial en c4.tensorgarten.de.
- Análisis de calidad de datos: el caso de la corpus corrupta (126.537 filas reparadas) es un ejemplo real de validación de integridad de datos con checksums SHA256.

## Benchmarks y rendimiento

Resultados publicados por el autor: 600 partidas por brazo (3 seeds) contra el checkpoint liberado.

| Oponente | Tasa de victoria del modelo | Veredicto |
|---|---:|---|
| Jugador aleatorio | 85,2 % | lo supera |
| Política de columna central | 90,5 % | lo supera |
| Heurística 1-ply | 37,2 % | pierde |
| Lookahead 2-ply | 24,3 % | pierde |
| Minimax | 41,8 % | pierde |

Curva de convergencia (acuerdo con el profesor y resultados de partida):

| Step | Acuerdo (train) | Holdout disjunto | vs heurística 1-ply | vs aleatorio |
|---:|---:|---:|---:|---:|
| 0 | 16,3 % | 11,9 % | 9-39 | 36-12 |
| 2000 | 40,2 % | 27,9 % | 10-38 | 37-11 |
| 6000 | 50,9 % | 36,7 % | 15-33 | 38-10 |
| 10000 | 56,0 % | 40,8 % | 19-29 | 37-11 |
| 14000 | 57,5 % | 38,1 % | 23-25 | 44-4 |
| 18000 | 59,6 % | 41,0 % | 16-32 | 41-7 |
| 26000 | 58,7 % | 39,1 % | 15-33 | 38-10 |
| 30000 | 59,4 % | 42,0 % | 18-30 | 38-10 |
| 34000 | 58,5 % | 41,8 % | 14-34 | 43-5 |

No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K), lo cual es esperable dado que no es un modelo de lenguaje.

## Requisitos de hardware

- Inferencia exclusivamente en CPU; no requiere GPU ni VRAM.
- Tamaño del modelo: 32,3 MB, trivialmente ejecutable en cualquier máquina moderna, incluidos portátiles y contenedores ligeros.
- Cabe con holgura en cualquier hardware; no hay requisitos de GPU dedicada (no aplicable a RTX 4090, A100, etc.).
- Despliegue: la demo oficial se sirve en CPU con aislamiento por sesión; el modelo se integra en PyTorch y puede empaquetarse en un Space de Hugging Face (la demo oficial enmarca un servidor externo con verificación de origen).
- Latencia y throughput: no disponible (aunque el tamaño reducido y la ejecución en CPU sugieren latencias bajas para inferencia por jugada).

## Comparativa con modelos similares

Comparativa con otras aproximaciones de IA para Conecta 4 (según datos del propio repositorio):

| Modelo / oponente | Enfoque | Fuerza frente al modelo | Notas |
|---|---|---|---|
| Chris4K/connect-four-gf256 | Red GF(256) entera, 8,4 M parámetros, imitación de búsqueda | — | 85,2 % vs aleatorio; pierde vs heurísticas |
| Minimax clásico | Búsqueda alfa-beta determinista | 58,2 % de victorias sobre el modelo | No necesita entrenamiento; supera al modelo |
| Lookahead 2-ply | Búsqueda superficial | 75,7 % de victorias sobre el modelo | Regla simple que supera al modelo |
| Heurística 1-ply | Comprobación "ganar ahora / bloquear ahora" | 62,8 % de victorias sobre el modelo | Tres líneas de código; supera al modelo |

No existen otros modelos neuronales comparables publicados en la información disponible; la comparación relevante es precisamente contra reglas de búsqueda clásicas, que superan al modelo pese a su simplicidad.

## Limitaciones y advertencias

- Fuerza de juego limitada: pierde contra una heurística de 1 nivel y contra minimax; no debe usarse como oponente competitivo serio.
- Brecha imitación-rendimiento: el 59,6 % de acuerdo con el profesor en entrenamiento y el 41,0 % en holdout no se traducen en fuerza de juego, algo que el propio autor documenta como hallazgo central.
- El profesor es una política de búsqueda acotada, no una prueba de optimalidad: ninguna etiqueta debe interpretarse como "conjunto de movimientos óptimos", pese a que Conecta 4 es un juego resuelto.
- Dependencia del read-out float32: el 99,6 % de los parámetros está en el read-out, por lo que la narrativa "sin FLOPs" solo aplica al tronco.
- Calidad de datos: el corpus anterior contenía un 39,5 % de filas corruptas; conviene verificar los SHA256SUMS si se usa el dataset.
- Licencia MIT sin restricciones para uso comercial, aunque al ser un proyecto de investigación con 0 descargas, no hay comunidad ni soporte consolidados.
- No disponible: evaluación de sesgos (no aplicable), soporte multilingüe (no aplicable) ni garantías de mantenimiento a largo plazo.

## Enlaces

- Modelo: https://huggingface.co/Chris4K/connect-four-gf256
- Dataset: https://huggingface.co/datasets/Chris4K/connect-four-gf256
- Demo jugable (servidor en vivo): https://c4.tensorgarten.de
- Hugging Face Space (interfaz estática): https://huggingface.co/spaces/Chris4K/connect-four-gf256
- Paper o repositorio de código fuente: no disponible (el código se menciona como `src/c4/exact_solver.py` dentro del repositorio, sin URL independiente publicada)
