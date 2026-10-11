# mathemagicianz/Slackfish

## Resumen

SlackFish es un conjunto de evaluadores de posicion para ajedrez publicados en HuggingFace bajo el identificador `mathemagicianz/Slackfish`. No es un modelo de lenguaje: son transformadores pequenos que reciben una representacion de un tablero de ajedrez (64 tokens de casilla mas el estado de enroque y el turno) y predicen la evaluacion de Stockfish desde la perspectiva de las blancas, en centipeones. El motor SlackFish, alojado en GitHub, usa esas puntuaciones dentro de una busqueda alfa-beta con busqueda de quietud (quiescence search).

El repositorio agrupa varias variantes con dos tamanos principalmente: 3,25M y 6,41M de parametros. La mas fuerte, `SlackFishV-T2-W-Lichess-6.41M`, se entreno con 409,8M de posiciones procedentes del dataset Chess Evaluations de Kaggle y de la base de datos de evaluaciones de Lichess (profundidad >= 20) durante una epoca. Los bots de SlackFish descargan el modelo automaticamente desde este repositorio cuando se define `SLACKFISH_HF_REPO=mathemagicianz/slackfish`.

Su relevancia es practica: demuestra que una red de apenas 6,41M de parametros puede aproximar la evaluacion de un motor de referencia con un error absoluto medio de 114 centipeones en partidas y alcanzar unos 2255 ± 80 Elo en la escala `UCI_Elo` de Stockfish 19 a profundidad 3. Es un caso de estudio util sobre destilacion de evaluacion de motores en modelos diminutos que caben en cualquier GPU consumer o incluso en CPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (procesa 64 tokens de casilla mas estado de enroque y turno) |
| Parametros totales | 6,41M (variantes T2) y 3,25M (variantes T1) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrada fija de 64 tokens de casilla + enroque + turno) |
| Tipos de cuantizacion | no disponible (el repositorio publica pesos completos en safetensors, sin versiones cuantizadas) |
| Idiomas soportados | no aplica (el modelo opera sobre posiciones de ajedrez, no sobre texto) |
| Licencia | no disponible (los datos de entrenamiento son MIT y CC0) |
| Formato de pesos | safetensors (`model.safetensors`) acompanado de `config.json` con clase de modelo, tamano, escala de puntuacion y resumen de entrenamiento |

Variantes publicadas en el repositorio:

| Carpeta | Nombre de bot | Parametros | Datos de entrenamiento | Val MAE (partidas / aleatorias / tacticas, cp) |
|---|---|---|---|---|
| SlackFishV-T2-W-Lichess-6.41M | `t2-w-lichess-6.41m` (el mas fuerte) | 6,41M | 409,8M posiciones: Chess Evaluations de Kaggle + base de evaluaciones de Lichess (profundidad >= 20), 1 epoca | 114 / 155 / 293 |
| SlackFishV-T2-W-All-6.41M | `t2-w-all-6.41m` | 6,41M | 16,3M posiciones con tacticas, 8 epocas | 142 / 171 / 356 |
| SlackFishV-T2-W-6.41M | `t2-w-6.41m` | 6,41M | 13,7M posiciones, 8 epocas | 128 / 167 / 630 |
| SlackFishV-T2-6.41M | `t2-6.41m` | 6,41M | 13,7M posiciones, objetivo en centipeones, 6 epocas | no disponible |
| SlackFishV-T1-3.25M | `t1-3.25m` | 3,25M | 13,7M posiciones, objetivo en centipeones, 10 epocas | no disponible |
| SlackFishV-T1-alpha | `t1-alpha` | 3,25M | 2M posiciones, 3 epocas | no disponible |

## Arquitectura y entrenamiento

Se trata de un transformer pequeno orientado a una tarea de regresion escalar. La entrada es una secuencia de 64 tokens, uno por casilla del tablero, mas informacion adicional de estado (derechos de enroque y lado al que le toca mover). La salida es una unica puntuacion en centipeones que aproxima la evaluacion de Stockfish desde el punto de vista de las blancas. El motor que lo consume no juega directamente con la salida de la red: realiza busqueda alfa-beta con busqueda de quietud sobre esas evaluaciones, de modo que la red actua como funcion de evaluacion y la busqueda aporta la tactica.

Los detalles de entrenamiento disponibles en la model card son los de la tabla anterior. La variante mas fuerte (`t2-w-lichess-6.41m`) uso 409,8M de posiciones combinando el dataset Chess Evaluations de Kaggle (licencia MIT) y la base de datos de evaluaciones de Lichess (CC0), filtrando esta ultima a profundidad >= 20, y se entreno durante una sola epoca. Las variantes `-W-All` y `-W` usan volumenes mucho menores (16,3M y 13,7M de posiciones) con 8 epocas. No se documenta en la informacion disponible el uso de RLHF, DPO ni tecnicas de decodificacion especulativa, atencion lineal o arquitecturas hibridas; para el rango de 3,25M a 6,41M de parametros, tampoco se detallan el numero de capas, dimensiones ocultas ni cabezas de atencion, mas alla de lo que contiene cada `config.json`.

## Capacidades

- Evaluacion estatica de posiciones de ajedrez: asigna una puntuacion en centipeones a una posicion dada, imitando la evaluacion de Stockfish.
- Integracion como funcion de evaluacion en busqueda alfa-beta con quiescence search dentro del motor SlackFish.
- Descarga automatica por parte de los bots de SlackFish al detectar un modelo ausente, cuando se configura `SLACKFISH_HF_REPO=mathemagicianz/slackfish`.
- Dos regimenes de entrenamiento distintos: variantes con objetivo en centipeones y variantes `-W` (destiladas de evaluaciones de Stockfish/Lichess), lo que permite elegir entre fidelidad al motor de referencia y otros compromisos.
- Cobertura de posiciones tacticas: la variante `t2-w-all-6.41m` incluye tacticas en su dataset (16,3M posiciones), con MAE de 356 cp en el conjunto de tacticas.
- Capacidad de juego indirecta: combinada con la busqueda del motor, la variante `t2-w-lichess-6.41m` alcanza unos 2255 ± 80 Elo en la escala `UCI_Elo` de Stockfish 19 a profundidad 3.
- No dispone de generacion de texto, razonamiento simbolico general, tool calling, capacidades de agente, vision, audio ni soporte multilingue: su ambito es exclusivamente el ajedrez.

## Casos de uso

- Evaluacion de posiciones en analisis de partidas: dado un tablero (FEN o representacion interna), el modelo devuelve una puntuacion en centipeones que puede mostrarse en un analizador o interfaz web. Es adecuado porque reproduce la evaluacion de Stockfish con un MAE de 114 cp en posiciones de partida reales.
- Motor de ajedrez ligero embebible: integrado en SlackFish con alfa-beta y quiescence search, sirve como oponente en aplicaciones de escritorio, moviles o web donde no cabe un motor de decenas de megas con red NNUE grande.
- Generacion de etiquetas de evaluacion a gran escala: puede pre-evaluar lotes masivos de posiciones (por ejemplo, de partidas propias o de una base de datos) para filtrar posiciones interesantes antes de pasarlas a un analisis mas profundo con Stockfish. La variante de 6,41M de parametros procesa posiciones de forma muy barata.
- Deteccion de errores y clasificacion de jugadas: comparando la evaluacion del modelo antes y despues de una jugada se puede obtener una perdida en centipeones y etiquetar errores, imprecisiones y blunders en informes de entrenamiento o en herramientas de ensenanza.
- Ajuste de nivel de juego para principiantes: la escala `UCI_Elo` permite calibrar la fuerza del bot (por ejemplo, alrededor de 2255 Elo a profundidad 3) para crear oponentes de dificultad graduable en apps de aprendizaje.
- Investigacion sobre destilacion de evaluadores de motor: el repositorio ofrece seis variantes con distinto tamano (3,25M y 6,41M), distinto dataset y distinto numero de epocas, lo que permite estudiar el efecto del volumen de datos y de la epoca de entrenamiento en el MAE.
- Ordenacion de movimientos y poda en busqueda: usar la evaluacion de la red como heuristica barata para priorizar candidatos reduce el numero de nodos que hay que expandir en motores con presupuesto de tiempo limitado.
- Analisis de posiciones tacticas frente a posicionales: los MAE diferenciados por conjunto (partidas, aleatorias, tacticas) permiten elegir la variante mas adecuada segun el tipo de posicion que vaya a analizar la aplicacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible en el sentido habitual (MMLU, HumanEval, GSM8K u otros): el modelo no es un LLM. Los unicos datos de rendimiento disponibles son el error absoluto medio de validacion sobre tres conjuntos de posiciones y el resultado de enfrentamientos directos entre variantes.

| Variante | Val MAE partidas (cp) | Val MAE aleatorias (cp) | Val MAE tacticas (cp) |
|---|---|---|---|
| SlackFishV-T2-W-Lichess-6.41M | 114 | 155 | 293 |
| SlackFishV-T2-W-All-6.41M | 142 | 171 | 356 |
| SlackFishV-T2-W-6.41M | 128 | 167 | 630 |
| SlackFishV-T2-6.41M | no disponible | no disponible | no disponible |
| SlackFishV-T1-3.25M | no disponible | no disponible | no disponible |
| SlackFishV-T1-alpha | no disponible | no disponible | no disponible |

Enfrentamientos y fuerza de juego:

| Metrica | Valor |
|---|---|
| `t2-w-lichess-6.41m` contra `t2-w-6.41m` (profundidad 2) | 126 victorias de 128 partidas |
| Elo en escala `UCI_Elo` de Stockfish 19 (profundidad 3, Stockfish a 1 s por jugada) | 2255 ± 80 |

La propia model card advierte que la escala `UCI_Elo` esta calibrada contra listas de rating de motores, no contra ratings humanos, por lo que no debe interpretarse como un Elo humano equivalente.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MB. Con 6,41M de parametros, los pesos en fp32 ocupan aproximadamente 25,6 MB y en fp16 unos 12,8 MB. El repositorio completo ocupa 0,1 GB e incluye las seis variantes.
- GPU recomendadas: cualquiera. El modelo cabe holgadamente en GPUs consumer (GTX 1650, RTX 3060, RTX 4090) y en GPUs de centro de datos (A100, H100), aunque estas ultimas estan sobredimensionadas para esta carga.
- Inferencia en CPU: plenamente viable dado el tamano. Es probable que la latencia por posicion en CPU sea del orden de milisegundos, aunque no se publican cifras concretas.
- Opciones de despliegue: los pesos se consumen mediante el motor SlackFish (GitHub del proyecto), que carga `model.safetensors` y `config.json`. No se documentan integraciones oficiales con vLLM, llama.cpp, Ollama ni TGI, y ninguna de ellas es aplicable de forma directa porque el modelo no es un LLM.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.
- Escalado: al ser una funcion de evaluacion de coste muy bajo, el cuello de botella en produccion suele estar en la busqueda alfa-beta del motor, no en la red.

## Comparativa con modelos similares

La informacion proporcionada no incluye otros evaluadores de ajedrez comparables con datos verificables, por lo que la siguiente tabla solo recoge referencias generales del ecosistema de motores y marca como "no disponible" cualquier valor que no pueda confirmarse con la informacion disponible.

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| SlackFishV-T2-W-Lichess-6.41M | Transformer evaluador | 6,41M | no disponible | MAE 114/155/293 cp; ~2255 ± 80 UCI_Elo a profundidad 3 | no disponible | HuggingFace `mathemagicianz/Slackfish` |
| SlackFishV-T1-3.25M | Transformer evaluador | 3,25M | no disponible | no disponible | no disponible | HuggingFace `mathemagicianz/Slackfish` |
| Stockfish (red NNUE) | Red neuronal de evaluacion dentro del motor | no disponible | no aplica | referencia de fuerza maxima en ajedrez de CPU | GPL-3.0 (dato externo a la ficha) | Distribucion oficial del motor |
| Leela Chess Zero | Red neuronal + MCTS | no disponible | no aplica | fuerza de referencia en ajedrez neuronal | GPL-3.0 (dato externo a la ficha) | Distribucion oficial del proyecto |

La diferencia funcional clave es que SlackFish se publica como evaluador autonomo reutilizable en safetensors, mientras que las redes de Stockfish y Leela estan integradas en sus respectivos motores y no se distribuyen como modelos independientes para consumo directo.

## Limitaciones y advertencias

- Ambito exclusivamente ajedrecistico: el modelo no procesa texto ni ninguna otra modalidad, y no admite instrucciones en lenguaje natural.
- Alucinacion en sentido estricto no aplica, pero si existe error de evaluacion: el MAE de 114 cp en posiciones de partida implica desviaciones de mas de un peon en muchos casos, y de 293 cp en posiciones tacticas con la variante Lichess.
- Las variantes con MAE alto en tacticas (`t2-w-6.41m`, 630 cp) son claramente inadecuadas para analisis de posiciones con material colgando o secuencias forcadas; en esos casos la busqueda del motor debe compensar la debilidad de la red.
- No hay informacion sobre sesgos, ya que no se trata de un modelo de lenguaje; el sesgo relevante seria el derivado de la distribucion de los datasets de entrenamiento (partidas y evaluaciones mayoritariamente de ciertos rangos y aperturas), que no se documenta.
- La calibracion Elo usa la escala `UCI_Elo` de Stockfish 19, calibrada contra listas de rating de motores y no contra jugadores humanos; no debe presentarse como fuerza equivalente a un humano de ese rating.
- Licencia del modelo no disponible: la model card no indica licencia de los pesos, por lo que no puede confirmarse la viabilidad de uso comercial sin consultar al autor. Los datos de entrenamiento si tienen licencias declaradas (MIT para Chess Evaluations de Kaggle y CC0 para la base de evaluaciones de Lichess).
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y las fechas de creacion y actualizacion son del 11 de octubre de 2026, lo que indica que es un artefacto reciente sin validacion externa por parte de la comunidad.
- No hay resultados de benchmarks independientes ni evaluaciones de terceros sobre la calidad del modelo en condiciones de produccion.
- Para la variante `t2-w-lichess-6.41m` se documento una sola epoca de entrenamiento sobre 409,8M de posiciones: no se detalla la receta completa (optimizador, learning rate, esquema de aumentado) en la informacion disponible.

## Enlaces

- HuggingFace: https://huggingface.co/mathemagicianz/Slackfish
- Repositorio del motor SlackFish: https://github.com/leungt30/slackfish
- Dataset Chess Evaluations en Kaggle (MIT): https://www.kaggle.com/datasets/ronakbadhe/chess-evaluations
- Base de datos de evaluaciones de Lichess (CC0): https://database.lichess.org/#evals
