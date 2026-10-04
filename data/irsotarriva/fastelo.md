# irsotarriva/fastelo

## Resumen

fastelo es un sistema de ajedrez compuesto por tres transformadores pequenos (aproximadamente 7 millones de parametros cada uno) disenados para jugar con un nivel humano ajustable y para estimar el nivel de un jugador humano. Lo desarrolla el usuario irsotarriva y se publica en HuggingFace bajo licencia GPL-3.0. El problema que resuelve es doble: por un lado, generar jugadas que imiten el comportamiento humano a una fuerza concreta (no que jueguen lo mejor posible); por otro, leer una partida jugada y deducir el Elo de ambos jugadores con una desviacion estandar asociada.

El sistema consta de un actor (distribucion de jugadas condicionada por la posicion, el Elo propio y el Elo del rival), un modelo fuerte (la version previa del actor destilada de Leela Chess Zero, que se mezcla para objetivos por encima de unos 2100) y un critico (transformador causal que estima el Elo tras cada jugada). Cada red usa un transformador pequeno: 64 tokens de casilla mas 3 tokens de contexto, dimension d=256 y 8 capas en el caso del actor y del modelo fuerte.

Es relevante ahora porque aborda un nicho poco cubierto frente a los motores de fuerza maxima: la reproduccion fiel de la conducta humana en ajedrez, con calibracion explicita contra datos reales de Lichess y una estimacion de incertidumbre en la prediccion de Elo. Su tamano reducido permite inferencia en hardware modesto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (actor y fuerte: encoder con 64 tokens de casilla + 3 de contexto, d=256, 8 capas; critico: transformer causal sobre las jugadas de la partida) |
| Parametros totales | 6,93M por red en actor y strong; 6,96M en critic (tres redes, ~20,8M en total) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible como tokens de lenguaje; entrada del actor de 67 tokens (64 casillas + 3 de contexto); el critico lee la partida jugada a jugada |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje; opera sobre posiciones de ajedrez) |
| Licencia | GPL-3.0 |
| Formato de pesos | safetensors (actor.safetensors, strong.safetensors, critic.safetensors) y calibration.json |

## Arquitectura y entrenamiento

El actor y el modelo fuerte comparten un transformador estudiante de 64 tokens de casilla mas 3 tokens de contexto, con d=256 y 8 capas. El entrenamiento se hizo en fases. Primero, destilacion: el estudiante aprendio la politica y la salida de victoria/tablas/derrota de la red de Leela Chess Zero T1-256x10-distilled-swa-2432500 sobre 300 millones de posiciones extraidas de partidas reales de Lichess (nunca de autojuego de motor, para conservar la variedad de posiciones humanas). Despues, fase humana: partiendo de ese estudiante, el actor se entreno sobre 500 millones de posiciones de partidas valoradas de ritmo rapido y clasico de Lichess (agosto a noviembre de 2025; 42,7 millones de partidas tras filtrar bots, ratings provisionales y partidas abandonadas), condicionado por el rating del jugador que mueve y el del rival.

El critico es un transformador causal sobre las jugadas de una partida que predice una gaussiana (media, sigma) sobre el rating de cada jugador tras cada jugada, entrenado con la log-verosimilitud negativa gaussiana y ponderando por igual todas las bandas de rating para evitar que las estimaciones se contraigan hacia 1500. La calibracion final no implica entrenamiento: sobre 30.000 posiciones reservadas analizadas con Stockfish se ajustaron la temperatura, la proporcion del modelo fuerte y una pequena correccion de la entrada de Elo, de modo que la perdida de puntuacion esperada por jugada de la politica iguale a la de los humanos en cada banda de rating.

## Capacidades

- Generacion de jugadas de ajedrez imitando a un humano de un Elo objetivo, condicionada por la posicion, el Elo propio y el Elo del rival.
- Ajuste de fuerza mediante calibracion (temperatura, mezcla del modelo fuerte y correccion del Elo de entrada) para objetivos de 700 a 2300 segun la tabla publicada.
- Estimacion del Elo de ambos jugadores a partir de una partida, con desviacion estandar tras cada jugada (critico).
- Modelo fuerte destilado de Leela Chess Zero, mezclado para objetivos por encima de aproximadamente 2100.
- Analisis por fases de la partida mediante datos sinteticos evaluados en escalera de 40 partidas (apertura, medio juego, final).
- No soporta tool calling, function calling, agentes, razonamiento multietapa ni capacidades multilingues: es un modelo especifico de ajedrez.

## Casos de uso

- Entrenamiento de jugadores humanos: un club o una plataforma puede ofrecer un rival que juega a la fuerza exacta del alumno (por ejemplo, 1300 Elo) en lugar de un motor de fuerza maxima, gracias a la calibracion por banda.
- Bancos de pruebas de estilo humano en investigacion: comparar la similitud de jugadas con humanos (top-1 del 53,9% en partidas reservadas) frente a motores clasicos.
- Estimacion de rating en plataformas de ajedrez: el critico puede proponer un Elo provisional con su intervalo a partir de pocas partidas, leyendo la partida jugada a jugada.
- Deteccion de heterogeneidad de nivel: uso del critico sobre jugadores sinteticos con fuerza distinta por fase para analizar en que fase de la partida se concentra la fuerza.
- Simulacion de partidas para analisis estadistico: generar muchas partidas a un Elo fijo para estudiar aperturas repetidas o patrones de error humanos.
- Educacion y divulgacion: el Space de demostracion permite interactuar con la politica calibrada sin infraestructura propia.
- Anotacion automatica de partidas: combinar actor y critico para comentar por que una jugada es tipica de un nivel determinado.

## Benchmarks y rendimiento

Coincidencia top-1 con la jugada humana en partidas reservadas: 53,9%. La correlacion entre la banda de rating y la entrada de Elo que maximiza la probabilidad de las jugadas humanas es 0,998. La fuerza bruta crece con la entrada de Elo hasta aproximadamente 2400 y despues se estanca; con calibracion, la calidad de jugada iguala a la humana de 600 a unos 2400, y queda dentro de aproximadamente un error estandar en 2400-2600.

Ajustes calibrados publicados:

| Objetivo | Elo de entrada | Temperatura | Proporcion strong |
|---|---|---|---|
| 700 | 696 | 0,93 | 0,00 |
| 900 | 919 | 0,93 | 0,00 |
| 1100 | 1084 | 0,93 | 0,00 |
| 1300 | 1286 | 0,93 | 0,00 |
| 1500 | 1517 | 0,93 | 0,00 |
| 1700 | 1639 | 0,89 | 0,00 |
| 1900 | 2017 | 0,75 | 0,00 |
| 2100 | 2032 | 0,61 | 0,00 |
| 2300 | 2300 | 0,47 | 0,10 |

Critico sobre partidas humanas reservadas (mezcla natural de ratings):

| Rating real | Partidas | Sesgo (estimacion - real) | Error absoluto medio | Dentro de +-1 sigma |
|---|---|---|---|---|
| 400-600 | 23 | +170 | 181 | 52% |
| 600-800 | 121 | +145 | 182 | 64% |
| 800-1000 | 354 | +62 | 154 | 77% |
| 1000-1200 | 664 | +37 | 196 | 68% |
| 1200-1400 | 970 | +39 | 205 | 68% |
| 1400-1600 | 1256 | +15 | 199 | 68% |
| 1600-1800 | 1257 | -20 | 192 | 68% |
| 1800-2000 | 953 | -65 | 178 | 70% |
| 2000-2200 | 323 | -102 | 177 | 69% |
| 2200-2400 | 63 | -140 | 167 | 75% |

Sobre jugadores sinteticos con fuerza distinta por fase, evaluados en una escalera de 40 partidas contra bots calibrados: la estimacion del critico a 40 partidas correlaciona 0,978 con el rating basado en resultados, con error absoluto medio de 77 Elo. Reparto de cada fase en el rating, resultados frente a critico: apertura 20% frente a 47%, medio juego 64% frente a 44%, final 17% frente a 9%.

## Requisitos de hardware

- VRAM estimada por red (aproximadamente 7M de parametros): en FP32 unos 28 MB, en FP16 unos 14 MB, en INT8 unos 7 MB y en INT4 unos 3,5 MB. Las tres redes juntas no llegan a 100 MB en FP32.
- GPU recomendadas: cualquier GPU moderna sirve; no se requiere A100, H100 ni RTX 4090, ya que el modelo es de escala minima. Una GTX 1050, una iGPU reciente o incluso CPU son suficientes.
- Cabe en cualquier GPU de consumo y en hardware de bajo consumo (por ejemplo, placas tipo Raspberry Pi), dado el tamano.
- Opciones de despliegue: PyTorch, ya que el repositorio y el Space aportan el codigo (fastelo.play con CalibratedPolicy y CriticEstimator). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje.
- Latencia y throughput: no disponible en la informacion proporcionada; por el tamano de red se espera una latencia por jugada de milisegundos en GPU y de decenas de milisegundos en CPU.

## Comparativa con modelos similares

| Modelo | Enfoque | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fastelo | Ajedrez humano condicionado por Elo + critico de rating | ~7M por red (tres redes) | 67 tokens de entrada en el actor; partida completa en el critico | GPL-3.0 | HuggingFace y Space de demo |
| Maia Chess | Redes de ajedrez humano por brackets de rating | no disponible | no disponible | no disponible | Publico |
| Leela Chess Zero | Motor de fuerza maxima (red T1 como profesor) | no disponible | no disponible | GPL-3.0 | Publico |

fastelo se diferencia de los motores clasicos por condicionar la politica al Elo propio y del rival en una sola red, e incorpora la estimacion de rating con incertidumbre como componente aparte. Los datos concretos de parametros, contexto y licencia de las alternativas no estan en la informacion disponible.

## Limitaciones y advertencias

- No alcanza fuerza por encima de aproximadamente 2400-2500; cerca del techo la politica es en gran medida el modelo fuerte jugado casi a su mejor jugada, lo que resulta menos humano.
- El critico esta calibrado para partidas de ritmo rapido; las estimaciones sobre partidas sin control de tiempo o de ritmo blitz no estan calibradas.
- Una sola partida produce un margen de error de aproximadamente +-200 Elo; hacen falta varias partidas para una estimacion ajustada.
- Los ratings estan en la escala de rapid de Lichess, no en la escala FIDE.
- Sesgos observados en el critico: sobreestima sistematicamente a los jugadores de rating bajo (sesgo de +170 en la banda 400-600) y subestima a los altos (-140 en 2200-2400); la cobertura de +-1 sigma ronda el 52-77%.
- El critico reparte el peso de las fases de forma distinta a los resultados reales (apertura 47% frente a 20% real), lo que puede distorsionar el diagnostico por fases.
- Licencia GPL-3.0: condiciona el uso comercial y la redistribucion; conviene revisar las obligaciones de copyleft antes de integrarlo en un producto propietario.
- Datos, profesor y herramienta de analisis: Lichess (CC0), Leela Chess Zero (GPL-3.0) y Stockfish (GPL-3.0). La red de Leela no se redistribuye, pero los pesos derivados pueden heredar obligaciones de licencia.
- Riesgo de alucinacion en el sentido de prediccion de rating: el critico puede dar estimaciones con intervalos amplios en pocas partidas; no debe usarse como medida definitiva.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/irsotarriva/fastelo
- Space de demostracion: https://huggingface.co/spaces/irsotarriva/fastelo
- Base de datos abierta de Lichess: https://database.lichess.org/
- Leela Chess Zero: https://lczero.org/
- Stockfish: https://stockfishchess.org/
