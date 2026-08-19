# Datdanboi25/Charles-the-Chess-Bot

## Resumen

Charles the Chess Bot es un modelo de redes neuronales diseñado específicamente para la selección de movimientos de ajedrez, creado por Datdanboi25 (Dan P) para la competición de modelos de ajedrez organizada por EnderChef. Con 32,5 millones de parámetros, el modelo combina un codificador de tablero con un decisor de movimientos que utiliza atención bidireccional para contextualizar las transiciones legales. Su autor lo describe como un diseño "0 shot" concebido en unos 20 minutos sin iteraciones posteriores, lo que explica sus limitaciones evidentes.

El modelo alcanza aproximadamente 2000 Elo, habiendo sido entrenado en tres fases: aprendizaje supervisado con partidas humanas de torneo, destilación de conocimiento desde Stockfish y entrenamiento on-policy contra Stockfish. A diferencia de los motores tradicionales que realizan búsqueda exhaustiva, Charles selecciona el movimiento que "le parece correcto" basándose únicamente en la representación del tablero actual, priorizando la velocidad de decisión sobre la profundidad de cálculo.

Su relevancia radica en demostrar un enfoque arquitectónico alternativo para el ajedrez, basado en la resta de embeddings de estados sucesores para representar transiciones, y en su capacidad para jugar a nivel de maestro con una fracción mínima de los parámetros de otros sistemas neuronales de ajedrez.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Board Encoder (6 capas transformer bidireccional) + Move Decider (12 capas transformer bidireccional) con scoring por producto escalar |
| Parametros totales | 32.537.088 |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no aplicable (modelo de vision de tablero, no de texto) |
| Tipos de cuantizacion | no disponible (pesos en BF16) |
| Idiomas soportados | no aplicable (notacion de ajedrez, independiente del idioma) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Charles utiliza una arquitectura de dos componentes. El Board Encoder procesa el tablero como una secuencia de 64 fichas, cada una compuesta por la suma de un embedding de pieza (vocabulario de 13 IDs) y un embedding posicional aprendido de 64x384. Se anade un token de resumen y se procesa con 6 capas transformer bidireccionales con atencion de 6 cabezas de 64 dimensiones y FFN SwiGLU de 1.040 unidades ocultas. El Move Decider recibe el embedding del tablero actual y los embeddings de los tableros sucesores (uno por movimiento legal, tipicamente unos 20), calcula embeddings de transicion por resta, y los contextualiza con 12 capas transformer adicionales. Finalmente, el embedding original del tablero se proyecta como query y los embeddings de movimientos contextualizados como claves, comparandose con productos escalares normalizados RMSNorm para producir un logit por movimiento legal. El movimiento de mayor puntuacion se selecciona de forma greedy.

El entrenamiento se realizo en tres fases: (1) aprendizaje supervisado sobre posiciones de torneos humanos con el movimiento registrado como objetivo, alcanzando 1300-1400 Elo; (2) destilacion de Stockfish a profundidad 12 con temperatura de profesor 30, alcanzando 1700-1800 Elo; (3) entrenamiento on-policy donde el modelo genera partidas completas contra Stockfish (oponente a profundidad 8, profesor a profundidad 10), minimizando el error cuadratico entre la probabilidad del modelo y la de Stockfish para el movimiento seleccionado, con optimizador Muon para pesos matriciales y AdamW para el resto. Esta fase final alcanzo aproximadamente 2000 Elo. Los pesos publicados corresponden al checkpoint `step-0010000.pt` de la fase on-policy.

## Capacidades

- Seleccion de movimientos de ajedrez legales basada en la representacion del tablero actual
- Evaluacion de posiciones mediante embeddings de transicion (resta de embeddings de tableros sucesores)
- Juego a nivel aproximado de 2000 Elo (maestro nacional)
- Velocidad de decision elevada al no realizar busqueda exhaustiva
- Soporte para posiciones arbitrarias mediante notacion FEN (el espacio de HuggingFace permite cargar posiciones personalizadas)
- Capacidad de jugar tanto con blancas como con negras
- Generacion de partidas completas on-policy durante el entrenamiento

## Casos de uso

- Motor de ajedrez para aplicaciones web: el espacio de HuggingFace demuestra su integracion en interfaces de juego donde el usuario puede hacer clic en el tablero o escribir movimientos, con soporte para posiciones FEN personalizadas. Su velocidad de respuesta lo hace adecuado para experiencias de juego fluidas.
- Analisis rapido de posiciones: al evaluar unicamente el tablero actual sin busqueda profunda, puede proporcionar sugerencias de movimiento casi instantaneas, util para herramientas de analisis casual donde la profundidad no es critica.
- Entrenamiento de jugadores aficionados: con un nivel de ~2000 Elo, es un sparring adecuado para jugadores de club que buscan oponentes de nivel medio-alto sin la dureza de motores profesionales.
- Generacion de datasets de partidas: su capacidad para generar partidas completas contra Stockfish puede utilizarse para crear corpus de entrenamiento para otros modelos o sistemas.
- Investigacion en arquitecturas de aprendizaje por refuerzo: su diseno de resta de embeddings de transicion y el uso de Muon como optimizador ofrecen un caso de estudio para arquitecturas alternativas en dominios de juego.
- Herramienta educativa de ajedrez: al jugar de forma "intuitiva" sin busqueda profunda, sus movimientos pueden ser mas explicables para estudiantes que los de motores tradicionales, ilustrando conceptos posicionales basicos.
- Benchmark de eficiencia: con solo 32,5 millones de parametros, sirve como referencia de rendimiento para modelos pequenos en dominios de juego, comparando velocidad y nivel de juego frente a arquitecturas mucho mayores.

## Benchmarks y rendimiento

El modelo no presenta benchmarks tradicionales de LLM (MMLU, HumanEval, GSM8K) al no ser un modelo de lenguaje. Su metrica de rendimiento principal es el Elo, reportado por el autor durante las fases de entrenamiento:

| Fase de entrenamiento | Elo aproximado |
|---|---|
| Supervisado (fase 1) | 1300-1400 |
| Destilacion Stockfish (fase 2) | 1700-1800 |
| On-policy (fase 3) | ~2000 |

No se han publicado resultados comparativos formales contra otros motores en la informacion disponible.

## Requisitos de hardware

- Con 32,5 millones de parametros, el modelo ocupa aproximadamente 65 MB en BF16 (0,4 GB el repositorio completo con pesos en safetensors).
- Inferencia viable en CPU: la carga computacional principal son dos transformers de 6 y 12 capas con 384 dimensiones, ejecutables en hardware sin GPU.
- Cabe en cualquier GPU consumer: incluso una GPU integrada o una GTX 1650 con 4 GB de VRAM es mas que suficiente.
- La velocidad de decision es alta al no requerir busqueda de arbol, aunque el codificador procesa el tablero y cada sucesor legal (tipicamente 20), lo que implica 21 pases por el Board Encoder por movimiento.
- Opciones de despliegue: el espacio de HuggingFace (hugging-apps/charles-the-chess-bot) demuestra su funcionamiento en entornos web; no se documentan opciones especificas como vLLM u Ollama al no ser un modelo de texto.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Nivel de juego | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Charles the Chess Bot | Red neuronal (transformer bidireccional) | 32,5 M | ~2000 Elo | no disponible | HuggingFace (safetensors) |
| Stockfish | Motor clasico con busqueda alpha-beta | no aplicable | >3500 Elo | GPLv3 | Codigo abierto |
| Leela Chess Zero | Red neuronal (CNN residual) | ~40 M (red tipica) | >3000 Elo | GPLv3 | Codigo abierto |
| Maia Chess | Red neuronal (CNN) | ~270 M | ~1500-1900 Elo segun variante | MIT | Codigo abierto |

Charles se diferencia de Stockfish por no realizar busqueda, de Leela por su arquitectura transformer en lugar de CNN residual, y de Maia por su enfoque en jugadas de torneo en lugar de replicar el estilo humano.

## Limitaciones y advertencias

- Nivel de juego limitado a ~2000 Elo, muy por debajo de motores profesionales como Stockfish o Leela Chess Zero.
- El autor reconoce fallos de diseno evidentes, incluyendo la ausencia de embeddings posicionales estaticos combinados con RoPE (solo embeddings absolutos aprendidos).
- No realiza planificacion a futuro: el autor indica que "no se preocupa por el futuro" y selecciona movimientos basandose unicamente en el tablero actual.
- Sin entrenamiento de self-play, que el autor menciona como una mejora pendiente por falta de tiempo.
- La resta lineal de embeddings como representacion de transicion puede ser insuficiente para capturar relaciones complejas entre posiciones.
- Licencia no especificada: no se puede determinar si el modelo es utilizable en aplicaciones comerciales sin consultar al autor.
- Capacidad limitada del modelo (32,5 M parametros) para generalizar a posiciones muy diferentes de las de entrenamiento.
- Sin soporte para variantes de ajedrez (960, rapidas, etc.) mas alla del ajedrez estandar con notacion legal.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Datdanboi25/Charles-the-Chess-Bot
- Espacio de juego en HuggingFace: https://huggingface.co/spaces/hugging-apps/charles-the-chess-bot
- Perfil del autor en HuggingFace: https://huggingface.co/Datdanboi25
