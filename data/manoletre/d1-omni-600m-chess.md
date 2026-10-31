# manoletre/d1-omni-600M-chess

## Resumen

d1-omni-600M-chess es un modelo de decisión especializado en ajedrez, creado por el usuario manoletre a partir de [LiquidAI/d1-omni-600M](https://huggingface.co/LiquidAI/d1-omni-600M). A diferencia de un LLM conversacional, este modelo no genera texto: puntúa una lista de opciones. Formulado como "¿cuál es la mejor jugada?" sobre las jugadas legales actúa como cabezal de política (policy), y formulado como "¿de qué buena es la posición?" sobre diez niveles de probabilidad de victoria actúa como cabezal de evaluación (value head).

Su relevancia radica en demostrar que un modelo pequeño (380,7 millones de parámetros reales en pesos) puede jugar al ajedrez a nivel competitivo combinando imitación de un motor fuerte con aprendizaje por refuerzo de datos frescos: con una búsqueda de 4 plies y anchura 3 encima (unos 0,3 segundos por jugada en una A100), supera a Stockfish limitado a 1700 Elo en el 62,5 % de las partidas. Además, se distribuye una versión ONNX cuantizada a 4 bits (339 MB) que permite ejecutarlo directamente en el navegador, con una demo jugable disponible en manoletre.com/chess/d1.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (d1-omni) usado como modelo de decision (choice/score); solo se emplean el tronco de texto y la cabeza de decision |
| Parametros totales | 380.732.161 (dato real de safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp32 (safetensors), ONNX con MatMuls weight-only de 4 bits (bloque 32) y tabla de embeddings fp16 |
| Idiomas soportados | no disponible (el modelo no genera texto; las instrucciones del prompt estan en ingles) |
| Licencia | LFM Open License v1.0 (lfm1.0, licencia "other") |
| Formato de pesos | safetensors y ONNX (model_q4.onnx, 339 MB); tamano del repo: 2,8 GB |

## Arquitectura y entrenamiento

El modelo parte de d1-omni-600M de LiquidAI, un transformer multimodal cuyo tronco de texto se ha ajustado finamente (fine-tuning completo) junto con la cabeza de decision; las torres de vision y audio permanecen intactas. La entrada es una descripcion textual del tablero (FEN, listado de piezas por tipo y casilla en orden a1–h8, y hasta las 3 ultimas jugadas en notacion UCI). Para la pregunta de jugada, cada opcion legal en UCI se presenta como una opcion con descripcion vacia y el modelo puntua cada una; para la pregunta de evaluacion, puntua diez niveles de probabilidad de victoria, y la expectativa se calcula como Σ p_i · (10i + 5).

El entrenamiento uso una perdida KL contra la distribucion de jugadas de Stockfish (MultiPV 8, profundidad 12, softmax sobre win% con τ = 4) en tres fases: (1) arranque en caliente con SFT sobre ~300.000 posiciones ya etiquetadas (partidas de Lichess, partidas DAgger de d1-3B y puzzles); (2) DAgger durante 11 rondas, jugando contra una escalera de oponentes y etiquetando con Stockfish las posiciones alcanzadas (perdida por jugada de 6,67 a 2,86; puzzles 28,2 %); (3) SFT con datos frescos durante 9 rondas (este checkpoint es la ronda 9), con ~118.000 posiciones nuevas por ronda de la base de datos de evaluacion de Lichess (rebalanceadas a la mezcla de material de partidas reales) mas ~60.000 posiciones de partidas estandar nuevas, con replay y puzzles, sin repetir ninguna posicion (perdida 2,86 → 2,23; puzzles 28,2 % → 42,1 % sin busqueda). El autor indica que la metrica seguia mejorando al terminar la ejecucion.

## Capacidades

- Politica de ajedrez: dada una posicion y la lista de jugadas legales en UCI, puntua cada jugada en una sola pasada hacia adelante.
- Cabezal de valor: evalua una posicion en diez niveles de probabilidad de victoria, util como funcion de evaluacion en arboles de busqueda.
- Integracion con busqueda: el autor documenta un esquema de busqueda de 4 plies con anchura 3 (top 3 de la politica por ply) usando el value head en las hojas.
- Salida determinista y estructurada: no genera texto libre, lo que elimina el riesgo de alucinaciones verbales y simplifica la integracion en pipelines.
- Ejecucion en navegador: exportacion ONNX cuantizada a 4 bits con interfaz definida (ids, pad, marker_pos, marker_mask, qtype) para inferencia local sin servidor.
- No soporta tool calling, agentes, ni capacidades de texto, vision o audio: es un modelo de decision de proposito unico (ajedrez).

## Casos de uso

- Oponente de ajedrez en el navegador: gracias al export ONNX de 339 MB con cuantizacion de 4 bits, el modelo corre enteramente en el cliente; la demo en manoletre.com/chess/d1 lo demuestra, sin necesidad de GPU ni backend.
- Motor de analisis ligero: el value head ofrece una evaluacion de posicion en una sola pasada, util como heuristica rapida en herramientas de analisis para aficionados donde Stockfish completo seria excesivo.
- Cabezal de politica/valor en motores hibridos: puede integrarse como red de evaluacion en un framework tipo MCTS o alpha-beta, sustituyendo o complementando redes neuronales mas pesadas, con ~0,3 s por jugada en busqueda de 4 plies sobre A100.
- Investigacion en aprendizaje por imitacion y DAgger: el README documenta con detalle el pipeline (SFT, DAgger con escalera de oponentes, SFT con datos frescos), lo que lo hace util como referencia reproducible para estudios de destilacion de conocimiento de un experto (Stockfish) a un modelo pequeño.
- Baseline para investigacion en modelos de decision: al ser un caso de uso cerrado y medible (puzzles de Lichess, Elo contra Stockfish), sirve de banco de pruebas para comparar arquitecturas de decision sobre el mismo modelo base.
- Educacion y entrenamiento de jugadores de nivel medio: con fuerza estimada en torno a 1700 Elo con busqueda, es adecuado como sparring para jugadores intermedios, ajustando la profundidad de busqueda para modular la dificultad.
- Generacion de datos etiquetados: dado que etiqueta posiciones con distribuciones de probabilidad, puede usarse para anotar masivamente bases de datos de posiciones de ajedrez a bajo coste computacional.

## Benchmarks y rendimiento

Datos publicados por el autor: 1.000 puzzles de Lichess retenidos (porcentaje resueltos hasta el final) y 40 partidas por oponente desde posiciones equilibradas tras la jugada 5 (puntuacion %; sf-N = Stockfish limitado a N Elo).

| Modo | Puzzles | sf-1320 | sf-1500 | sf-1700 | sf-2000 |
|---|---|---|---|---|---|
| Politica (una pasada) | 42,1 % | 61,3 | 18,8 | 12,5 | 5,0 |
| Busqueda 4-ply, anchura 3 (~0,3 s/jugada en A100) | 58,9 % | 87,5 | 78,8 | 62,5 | 35,0 |

El modelo base sin entrenar resuelve el 1,9 % de los puzzles. La version ONNX cuantizada coincide con la fp32 en la jugada elegida el 91,4 % de las veces y resuelve el 40,5 % de los puzzles (fp32: 42,1 %), con una diferencia media de 1,9 puntos en win%.

No se han publicado resultados de benchmarks genericos (MMLU, HumanEval, GSM8K, etc.) ni comparaciones con otros motores de ajedrez neuronales; no procede dada la naturaleza del modelo.

## Requisitos de hardware

- Inferencia PyTorch en fp32: con ~380,7 millones de parametros, el modelo ocupa aproximadamente 1,5 GB de memoria; cabe comodamente en cualquier GPU moderna e incluso en CPU, aunque sin cifras de latencia publicadas para esta modalidad.
- Inferencia ONNX cuantizada (4 bits, 339 MB): disenada para ejecutarse en el navegador en hardware de consumo sin GPU dedicada; no se han publicado cifras de latencia en navegador.
- Busqueda de 4 plies con anchura 3: ~0,3 segundos por jugada en una NVIDIA A100 (dato del autor). No hay mediciones en otras GPUs.
- No se requieren GPUs de gama datacenter para jugar o analizar; una RTX 3060 o superior, o una GPU integrada, son suficientes para la version ONNX.
- Despliegue: el modelo no usa el stack estandar de LLMs (no aplica vLLM, TGI, llama.cpp ni Ollama). Se carga via transformers con trust_remote_code=True sobre el modelo base LiquidAI/d1-omni-600M, o via ONNX Runtime (incluido onnxruntime-web para navegador) con los metadatos de onnx/chess.json.
- Throughput: no disponible mas alla del dato de 0,3 s/jugada con busqueda en A100; en modo politica pura es una sola pasada hacia adelante por posicion.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Rendimiento destacable | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| d1-omni-600M-chess | 380,7 M (real) | Politica + value head de ajedrez | 62,5 % vs Stockfish 1700 Elo (busqueda 4-ply) | LFM Open License v1.0 | HuggingFace, ONNX para navegador |
| LiquidAI/d1-omni-600M (base) | ~600 M (nominal) | Modelo de decision multimodal general | 1,9 % de puzzles de ajedrez sin entrenar | LFM Open License v1.0 | HuggingFace |
| Leela Chess Zero (Lc0) | Red residual ~40 bloques (decenas de millones, segun red) | Politica + value para ajedrez via MCTS | Superhumano con hardware GPU y busqueda amplia | Open source (varias redes) | Codigo abierto, redes descargables |
| Stockfish (referencia, no neuronal puro) | no aplica (motor clasico + NNUE) | Motor de ajedrez | >3500 Elo con hardware modesto | GPL v3 | Codigo abierto, binarios para todo |

Frente a Leela Chess Zero, d1-omni-600M-chess es mucho mas ligero y ejecutable en navegador, pero muy inferior en fuerza absoluta. Frente a Stockfish, es orders of magnitude mas debil (35 % vs 2000 Elo incluso con busqueda), pero demuestra la viabilidad de reutilizar modelos de decision genericos para tareas de juego. No hay otras variantes fine-tuned del modelo base d1-omni para ajedrez publicadas; comparaciones adicionales no disponibles.

## Limitaciones y advertencias

- Sesgo posicional: el propio autor advierte que d1 tiene "una ligera position bias" y recomienda barajar aleatoriamente el orden de las opciones de jugada en el prompt para mitigarlo.
- Fuerza limitada: incluso con busqueda, pierde el 65 % de las partidas contra Stockfish a 2000 Elo; no es apto como oponente para jugadores avanzados ni como motor de analisis de nivel magisterial.
- Degradacion por cuantizacion: la version ONNX de 4 bits elige una jugada distinta a la fp32 el 8,6 % de las veces y resuelve 1,6 puntos porcentuales menos de puzzles; en evaluaciones de posicion la diferencia media es de 1,9 puntos de win%.
- Dominio cerrado: el modelo solo entiende el formato de prompt de ajedrez documentado (FEN + listado de piezas + ultimas jugadas); cualquier desviacion del formato degrada el rendimiento de forma impredecible.
- Sin soporte de variantes de ajedrez documentadas: no hay evidencia de que funcione con chess960, ajedrez con incrementos especiales u otras variantes; las posiciones deben ser legales y el formato FEN debe provenir de python-chess.
- Licencia: se distribuye bajo LFM Open License v1.0 (licencia "other"), derivada del modelo base de LiquidAI. Con 0 descargas registradas y un solo like, es un proyecto personal sin comunidad de mantenimiento; el autor indica que el entrenamiento seguia mejorando al cortarse la ejecucion, por lo que este checkpoint no representa el techo del metodo.
- Riesgo de alucinacion: no aplica en el sentido de LLMs (no genera texto), pero las evaluaciones del value head pueden ser imprecisas en posiciones atipicas o fuera de la distribucion de entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/manoletre/d1-omni-600M-chess
- Modelo base: https://huggingface.co/LiquidAI/d1-omni-600M
- Demo jugable en navegador: https://manoletre.com/chess/d1
- Explicacion del entrenamiento: https://manoletre.com/chess
- Licencia del modelo: https://huggingface.co/manoletre/d1-omni-600M-chess/blob/main/LICENSE
