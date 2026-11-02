# ftaz/chess-gpt-uci-move

## Resumen

chess-gpt-uci-move es un modelo de lenguaje decoder-only de tipo GPT con 51,5 millones de parametros, desarrollado por el autor independiente ftaz, que juega al ajedrez prediciendo directamente el siguiente movimiento como un token. No incorpora busqueda (search) ni funcion de evaluacion: cada jugada se genera con un unico forward pass, lo que lo convierte en un experimento controlado sobre como la tokenizacion afecta al rendimiento de un transformer en un dominio estructurado como el ajedrez.

Forma parte de una familia de tres modelos entrenados con datos y procedimiento identicos que solo difieren en el tokenizador: el modelo A usa caracteres de notacion PGN (vocabulario de 34), el modelo B usa movimientos UCI completos como `g1f3` (vocabulario de 1971) y el modelo C usa casillas UCI individuales mas pieza de promocion (vocabulario de 71). Este modelo es el B. La relevancia actual es metodologica: permite aislar el efecto del diseno del vocabulario en tareas de generacion con restricciones duras (legalidad de movimientos) y sirve como referencia para quien quiera construir motores neuronales ligeros o estudiar tokenizacion en dominios no linguisticos.

El modelo se entreno con 35 millones de partidas de Lichess (ritmos rapid y superiores, todos los niveles de rating) y alcanza una perdida de validacion de 1,626 por movimiento, con un 99,45 % de movimientos legales en partidas humanas no vistas y un Elo estimado de 1.908 en escala Lichess a partir de self-play evaluado con Stockfish.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT), 16 capas, 8 cabezas, ancho 512, embeddings atados |
| Parametros totales | 52.482.048 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 192 tokens |
| Tipos de cuantizacion | No disponible (el autor solo publica pesos en safetensors; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | No disponible (el modelo opera sobre notacion de ajedrez, no sobre lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors`) y `config.json` con arquitectura y tokenizador |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only clasico de 16 capas, 8 cabezas de atencion y dimension de modelo 512, con embeddings de entrada y salida atados. El contexto maximo es de 192 tokens, suficiente para representar una partida completa en el tokenizador de movimientos UCI, ya que una partida tipica ronda los 80-120 movimientos y el limite de 192 cubre partidas largas. El vocabulario del tokenizador `uci-move` es de 1971 entradas, una por cada movimiento legal posible en notacion UCI (origen-destino mas pieza de promocion cuando corresponde). La generacion es autoregresiva y restringida: en cada paso se elige el siguiente movimiento entre los tokens legales de la posicion actual.

El entrenamiento uso 35 millones de partidas de Lichess de ritmo rapid o superior, con todos los niveles de rating, y cada partida se vio una sola vez (una epoca). El proceso consto de 38.147 pasos sobre una unica GPU NVIDIA GB10. No se documenta en la informacion disponible el uso de RLHF, DPO ni ajuste por preferencias; el objetivo es exclusivamente de modelado de lenguaje sobre secuencias de movimientos. La innovacion principal no es arquitectonica sino experimental: la comparacion controlada entre tres tokenizadores del mismo dominio, con metricas de legalidad, perdida de centipeones y Elo estimado, permite medir el impacto del diseno del vocabulario en un transformer pequeno.

## Capacidades

- Generacion de movimientos de ajedrez en notacion UCI a partir de la secuencia de movimientos previos de la partida.
- Generacion autoregresiva de partidas completas sin busqueda ni evaluacion explicita; una pasada hacia delante por jugada.
- Ranking de movimientos legales con probabilidades asociadas mediante `rank_legal_moves`, util para analisis y para integracion con heuristicas externas.
- Cumplimiento de la legalidad de movimientos en el 99,45 % de los casos sobre partidas humanas no vistas; el resto requiere enmascarado de movimientos ilegales o reintento.
- Juego en modo self-play, empleado por el autor para estimar la fuerza del modelo.
- No dispone de tool calling, function calling, capacidades de agente, vision, audio ni modo de razonamiento explicito.
- No esta entrenado para conversacion ni para lenguaje natural; su dominio es exclusivamente la notacion de ajedrez.

## Casos de uso

- Motor de ajedrez ligero en dispositivos con pocos recursos: con 51,5 millones de parametros y pesos de aproximadamente 0,2 GB, el modelo puede ejecutarse en CPU o en GPU de gama baja para generar jugadas en milisegundos, adecuado para aplicaciones moviles o embebidas donde no cabe un motor neuronal mayor.
- Generacion de partidas sinteticas para aumento de datos: el modelo puede producir partidas completas de nivel intermedio (Elo estimado de 1.908) que sirvan para preentrenar modelos de ajedrez mas grandes o para aumentar datasets de entrenamiento con partidas plausibles.
- Analisis de estilo y aperturas: al predecir el movimiento mas probable de un jugador humano promedio de Lichess, permite estudiar sesgos de apertura y patrones de juego agregados en el dataset de 35 millones de partidas.
- Baseline de investigacion en tokenizacion: sirve como referencia reproducible (junto con los modelos A y C) para medir como el vocabulario afecta a la perdida, la legalidad y la fuerza en tareas de generacion con restricciones duras.
- Prototipado de interfaces de ajedrez: integrado mediante la libreria `chess` de Python y el paquete `chessgpt`, permite construir rapidamente demos de tablero con sugerencias de jugadas y ranking de alternativas.
- Evaluacion comparativa de motores neuronales sin busqueda: util para aislar la contribucion de la red frente a la busqueda en estudios sobre fuerza de juego, ya que cada jugada cuesta exactamente un forward pass.
- Filtrado de partidas en pipelines de datos: el ranking de movimientos legales puede emplearse para detectar jugadas anomalas o errores de transcripcion en bases de datos de partidas.

## Benchmarks y rendimiento

| Metrica | Modelo A (`pgn-char`) | Modelo B (`uci-move`, este) | Modelo C (`uci-square`) |
|---|---|---|---|
| Elo estimado (escala Lichess, self-play evaluado con Stockfish) | 1.940 | 1.908 | 1.792 |
| Movimientos legales en partidas humanas no vistas | 99,75 % | 99,45 % | 99,71 % |
| Perdida media de centipeones | 56 | 58 | 61 |
| Perdida de validacion por movimiento | No disponible | 1,626 | No disponible |

Las cifras de Elo son estimaciones derivadas de self-play puntuado con Stockfish, no resultados de partidas con rating oficial. El autor documenta la metodologia en su write-up. No se publican resultados de benchmarks estandar de lenguaje (MMLU, HumanEval, GSM8K) porque el modelo no esta orientado a esas tareas.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp32): aproximadamente 0,21 GB de pesos mas activaciones; cabe holgadamente en cualquier GPU con 1 GB o mas.
- VRAM estimada en fp16/bf16: aproximadamente 0,11 GB de pesos; ejecutable en GPUs integradas y en CPU.
- GPU recomendadas: cualquier GPU moderna sirve; el autor entreno en una NVIDIA GB10 y el ejemplo de uso apunta a `device="cpu"`. Para lotes grandes o self-play masivo, una RTX 4090 o una A100 estan sobredimensionadas pero permiten paralelizar muchas partidas.
- Cabe en GPU de consumo: si, en cualquier modelo con al menos 1 GB de VRAM, incluidas GTX 1050, RTX 3050 o iGPU con memoria compartida.
- Opciones de despliegue: el autor proporciona el repositorio `github.com/wezn/chess-gpt` con el paquete `chessgpt` y el cargador `ModelPlayer`, que funciona en CPU y GPU. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI; el modelo no sigue el formato conversacional de esos servidores.
- Latencia y throughput: no disponibles de forma oficial. Por el tamano (16 capas, ancho 512, contexto 192) se espera latencia de milisegundos por jugada en CPU moderna y por debajo del milisegundo en GPU, pero son estimaciones no verificadas en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Fuerza | Licencia |
|---|---|---|---|---|---|
| chess-gpt-uci-move (este) | 51,5 M | 192 tokens | GPT sin busqueda, tokenizador UCI por movimiento | Elo estimado 1.908 | MIT |
| chess-gpt-pgn-char (A, mismo autor) | 51,5 M aprox. | 192 tokens | GPT sin busqueda, tokenizador PGN por caracter | Elo estimado 1.940 | MIT |
| chess-gpt-uci-square (C, mismo autor) | 51,5 M aprox. | 192 tokens | GPT sin busqueda, tokenizador UCI por casilla | Elo estimado 1.792 | MIT |
| Motores clasicos tipo Stockfish | No aplica (motor alfa-beta) | No aplica | Busqueda con evaluacion heuristica | Muy superior a 2.500 Elo | GPL |

La comparacion mas informativa es interna a la familia del autor, ya que los tres modelos comparten datos y procedimiento y solo cambian el tokenizador. Frente a motores clasicos como Stockfish, la diferencia de enfoque es total: este modelo no usa busqueda y su fuerza es ordenes de magnitud menor, pero su coste computacional por jugada tambien es minimo. No se dispone de datos publicados de otros modelos neuronales de ajedrez del mismo tamano en la informacion proporcionada.

## Limitaciones y advertencias

- Fuerza limitada: el Elo estimado de 1.908 es una estimacion por self-play, no un rating oficial, y queda muy por debajo de motores de club y de motores clasicos.
- Sin busqueda ni evaluacion: el modelo no calcula lineas ni valora posiciones; comete errores tacticos que un motor con busqueda evitria.
- Tasa de ilegalidad no nula: el 0,55 % de movimientos ilegales en partidas no vistas obliga a enmascarar movimientos ilegales o reintentar en produccion.
- Contexto corto (192 tokens): las partidas que excedan ese numero de movimientos no pueden representarse completas; es necesario truncar o reiniciar el contexto.
- Dominio restringido: no comprende lenguaje natural, no responde a instrucciones y no soporta tool calling ni agentes.
- Sesgos del dataset: entrenado con partidas de Lichess de ritmo rapid o superior, lo que puede infrarepresentar estilos de juego muy rapidos, partidas de torneo oficial o jugadores de niveles extremos.
- Riesgo de alucinacion en el sentido de movimientos plausibles pero incorrectos: el modelo puede preferir jugadas legales pero tacticamente malas, especialmente en posiciones poco frecuentes en el dataset.
- Licencia MIT: permite uso comercial y modificacion con atribucion; no se documentan restricciones adicionales.
- Caveat de produccion: al ser un modelo de investigacion con cero descargas y cero likes en el momento de la consulta, carece de validacion externa y de soporte de la comunidad; conviene evaluarlo en el caso de uso concreto antes de desplegarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ftaz/chess-gpt-uci-move
- Modelo A (tokenizador PGN por caracter): https://huggingface.co/ftaz/chess-gpt-pgn-char
- Modelo C (tokenizador UCI por casilla): https://huggingface.co/ftaz/chess-gpt-uci-square
- Write-up del autor: https://blog.wezn.dev/chess-gpt/
- Codigo fuente: https://github.com/wezn/chess-gpt
- Dataset de entrenamiento: https://huggingface.co/datasets/lichess/standard-chess-games
