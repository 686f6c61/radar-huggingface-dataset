# avewright/chess-moe

## Resumen

Chess MoE es un modelo de política para ajedrez desarrollado por el usuario avewright y publicado en HuggingFace bajo licencia MIT. Se trata de un mixture-of-experts con entrenamiento conjunto (Switch MoE) compuesto por cinco expertos especializados de 99 millones de parámetros cada uno —denominados incumbent, puzzle, endgame, opening y middlegame— más un router MLP de 257.221 parámetros. El modelo emplea una arquitectura de transformer recurrente según las etiquetas del repositorio, con un vocabulario compacto de 1968 símbolos y dispatch por argmax duro sobre los expertos.

El checkpoint publicado (latest.pt) corresponde al paso 550 de entrenamiento, con una pérdida de entrenamiento de aproximadamente 2,4342 y una entropía cruzada de validación en el conjunto "hard" de 1,2483. El autor reporta una estimación de 2028 UCI_Elo obtenida con política greedy sin búsqueda (argmax con máscara de jugadas legales), sin libro de aperturas, sin tablas Syzygy y sin MCTS, medida contra Stockfish 19 con UCI_LimitStrength y UCI_Elo.

Su relevancia radica en dos aspectos: por un lado, explora el enrutado por especialidad de fase de partida dentro de un motor de ajedrez; por otro, no es un modelo de lenguaje, sino una política pura que se carga mediante la librería chess_inference. El repositorio ocupa 4,0 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-experts (Switch MoE) sobre transformer recurrente, con router MLP y dispatch por argmax duro |
| Parametros totales | Aproximadamente 495,3 M (5 expertos de 99 M = 495 M, mas 257.221 del router); no se especifica el coste de embeddings ni de otras capas |
| Parametros activos | Aproximadamente 99,3 M por paso (1 experto de 99 M mas el router de 257.221); deducido del dispatch por argmax duro, no confirmado explicitamente por el autor |
| Longitud de contexto | no disponible (el modelo es una politica de ajedrez, no un modelo de lenguaje; no se documenta ventana de contexto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible; opera sobre un vocabulario compacto de 1968 simbolos de ajedrez, no sobre lenguaje natural |
| Licencia | MIT |
| Formato de pesos | PyTorch (.pt): latest.pt (bundle completo), router.pt, experts/<nombre>.pt |

## Arquitectura y entrenamiento

La arquitectura combina un esquema mixture-of-experts de tipo Switch con cinco especialistas de 99 M de parámetros cada uno: incumbent, puzzle, endgame, opening y middlegame. El router es un MLP con LayerNorm cuya topología es 736→256→256→5, con aproximadamente 257.221 parámetros, y realiza un dispatch por argmax duro (selecciona un único experto por paso). Según la model card, si la compuerta selecciona el experto incumbent, se reutiliza su codificación en lugar de recalcularla. El modelo se etiqueta como transformer recurrente y usa un vocabulario compacto de 1968 símbolos, activado mediante la variable de entorno MOVE_VOCAB_VERSION=compact.

El checkpoint publicado corresponde al paso 550, con fecha del 14 de septiembre de 2026, y presenta una pérdida de entrenamiento de aproximadamente 2,4342 y una entropía cruzada de validación "hard" de 1,2483. No se especifica en la información disponible el volumen de tokens o posiciones de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de ajuste como RLHF o DPO; el modelo se etiqueta como política (policy), lo que sugiere entrenamiento supervisado sobre acciones. El autor indica que este bundle no es un reemplazo directo de los repositorios independientes de cada especialista, que se mantienen como versiones pre-entrenamiento conjunto.

## Capacidades

- Generación de jugadas de ajedrez mediante política greedy sin búsqueda: argmax con máscara de jugadas legales.
- Selección dinámica de especialista por fase: apertura (opening), medio juego (middlegame), final (endgame), problemas (puzzle) e incumbent.
- Juego completo de partida sin libro de aperturas, sin tablas Syzygy y sin MCTS.
- Evaluación de fuerza relativa frente a motores UCI con limitación de Elo (Stockfish 19 con UCI_LimitStrength).
- Carga modular: es posible cargar el bundle completo (latest.pt), solo el router (router.pt) o cada experto por separado (experts/<nombre>.pt).
- Capacidad de razonamiento multi-paso: no disponible en la información proporcionada; no se documenta ningún modo de pensamiento extendido ni búsqueda interna.
- Tool calling / function calling: no disponible; el modelo no es un LLM y no expone interfaz de herramientas.
- Capacidades multilingües: no aplicable, el modelo no procesa lenguaje natural.
- Capacidades especiales: dispatch por argmax duro con reutilización de la codificación del experto incumbent; vocabulario compacto de 1968 símbolos.

## Casos de uso

- Motor de ajedrez integrado en aplicación de escritorio o web: el modelo carga con load_checkpoint y devuelve jugadas con get_model_move, por lo que puede actuar como oponente o analizador en una interfaz de partida sin necesidad de infraestructura de búsqueda.
- Análisis de finales: el experto endgame permite evaluar posiciones de final, un escenario donde los motores clásicos dependen de tablas Syzygy que este modelo no utiliza.
- Resolución de problemas de táctica: el experto puzzle está orientado a posiciones de problema, útil para generar ejercicios de táctica o validar soluciones en plataformas de entrenamiento.
- Preparación de aperturas: el experto opening puede emplearse para explorar líneas iniciales dentro del vocabulario compacto, sin depender de un libro de aperturas externo.
- Investigación sobre enrutado MoE: al exponer el router por separado (router.pt) y las cinco cabezas de experto, permite estudiar cómo se distribuye la selección de especialista por fase de partida.
- Evaluación comparativa de motores: la metodología del autor (partidas contra Stockfish con UCI_Elo limitado, movetime de 0,05 s y tope de 160 jugadas) sirve como protocolo reproducible para medir fuerza relativa de políticas sin búsqueda.
- Docencia y divulgación: un motor de 495 M de parámetros que cabe en GPU de consumo permite demostrar conceptos de MoE aplicados a ajedrez en entornos académicos.
- Generación de datos sintéticos de partidas: al ser una política determinista y barata de ejecutar, puede producir partidas etiquetadas para otros pipelines de entrenamiento.

## Benchmarks y rendimiento

| Benchmark | Resultado | Detalle |
|---|---|---|
| UCI_Elo estimado | 2028 | Estimación logística a partir de 32 partidas; no equivale a Elo FIDE ni Lichess |
| Partidas contra Stockfish 19 (UCI_Elo 2050) | 0,469 | 32 partidas: 10 victorias, 10 tablas, 12 derrotas; 1 partida contada como tablas por tope de 160 jugadas |
| Pérdida de entrenamiento | ~2,4342 | Paso 550 del entrenamiento |
| Entropía cruzada de validación (hard) | ~1,2483 | Paso 550 del entrenamiento |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que el modelo no es un modelo de lenguaje. La única línea base adicional son los repositorios independientes de cada especialista (incumbent, puzzle, endgame, opening, middlegame), para los que no se aportan cifras en esta ficha.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,0 GB en fp32 (495,3 M de parámetros), en torno a 1,0 GB en fp16 y unos 0,5 GB en int8. Son estimaciones calculadas a partir del recuento de parámetros, no datos publicados por el autor. No se documentan tipos de cuantización soportados.
- Tamaño del repositorio: 4,0 GB, lo que sugiere que incluye el bundle completo más los ficheros de router y expertos individuales, además del log de entrenamiento.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño, cualquier GPU con al menos 4-6 GB de VRAM debería ser suficiente para inferencia en precisión reducida.
- GPU de consumo: previsiblemente compatible con RTX 3060, RTX 4060 y superiores; el autor carga el modelo con device="cuda" en sus ejemplos, pero no publica una tabla de compatibilidad.
- Opciones de despliegue: librería propia chess_inference (load_checkpoint, get_model_move) con MOVE_VOCAB_VERSION=compact. No aplican vLLM, llama.cpp, Ollama ni TGI, al no tratarse de un modelo de lenguaje.
- Latencia y throughput: no disponibles. La política es greedy y sin búsqueda, por lo que cada jugada requiere una única pasada hacia delante, pero no se publican mediciones de tiempo por jugada ni de posiciones por segundo.

## Comparativa con modelos similares

| Modelo | Categoria | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Chess MoE (avewright) | Politica de ajedrez con MoE | ~495,3 M totales, ~99,3 M activos | no disponible | 2028 UCI_Elo estimado; 0,469 frente a SF 2050 en 32 partidas | MIT | HuggingFace, 0 descargas |
| Leela Chess Zero (Lc0) | Motor neuronal con MCTS | no disponible en la informacion proporcionada | no disponible | no disponible en la informacion proporcionada | GPL y otras segun componente | Publico, ampliamente desplegado |
| Maia-2 | Red neuronal de estilo humano | no disponible en la informacion proporcionada | no disponible | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | Publico |
| Stockfish 19 | Motor clasico con NNUE | no disponible en la informacion proporcionada | no disponible | Referencia usada como rival con Elo limitado a 2050 | GPLv3 | Publico |

La comparación cuantitativa con alternativas no es posible con los datos disponibles: la información proporcionada solo incluye cifras del propio Chess MoE. Cabe destacar que la estimación de 2028 UCI_Elo corresponde a un motor limitado por software (Stockfish con UCI_LimitStrength) y no es directamente comparable con el Elo de motores completos en listas de referencia.

## Limitaciones y advertencias

- La estimación de Elo procede de solo 32 partidas contra un único rival con Elo limitado, con margen de error amplio; el propio autor advierte que no es Elo FIDE ni Lichess.
- Una de las 32 partidas se contabilizó como tablas por alcanzar el tope de 160 jugadas, lo que introduce un sesgo en la puntuación.
- El modelo es una política greedy sin búsqueda: no incorpora MCTS, libro de aperturas ni tablas Syzygy, por lo que su fuerza en finales teóricos y aperturas conocidas puede ser limitada.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero la política puede seleccionar jugadas legales de baja calidad sin ningún mecanismo de verificación posterior.
- No es un modelo de lenguaje: no procesa ni genera texto, no soporta tool calling ni agentes, y no tiene capacidades multilingües.
- La ventana de contexto, los idiomas soportados y los tipos de cuantización no están documentados.
- No se documentan sesgos, composición del dataset de entrenamiento ni proceso de filtrado de datos.
- Licencia MIT: permite uso comercial y modificación, pero se desconoce la procedencia de los datos de entrenamiento, lo que puede afectar a la seguridad jurídica en producción.
- El bundle no es un reemplazo directo de los repositorios independientes de cada especialista, que el autor mantiene como versiones pre-entrenamiento conjunto.
- El repositorio registra 0 descargas y 0 likes, por lo que no existe validación externa de los resultados publicados.
- No se especifican requisitos de hardware ni métricas de latencia, lo que dificulta planificar un despliegue en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/avewright/chess-moe
- Documentación de carga: la model card referencia la librería chess_inference (load_checkpoint, get_model_move) con MOVE_VOCAB_VERSION=compact; no se proporciona URL del repositorio de la librería.
- Ficheros incluidos en el repositorio: latest.pt, router.pt, experts/<nombre>.pt, router_config.json, train.log, elo_eval.json (si está presente).
- No se han encontrado en la búsqueda web enlaces relevantes al modelo, a artículos técnicos, papers o demos asociados; los resultados devueltos corresponden a textos digitalizados sin relación con el proyecto.
