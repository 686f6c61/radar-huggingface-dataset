# Convergent-ch/Arkonium-0.9

## Resumen
Arkonium 0.9 es un motor de ajedrez neuronal desarrollado por Convergent-ch, entrenado desde inicialización aleatoria (no es un fine-tune) y pensado para integrarse dentro de una búsqueda Monte Carlo tree search (MCTS) con PUCT, al estilo de AlphaZero y Leela Chess Zero. Forma parte de la línea Arkon (Arkon 0.1 hasta Arkon-AoM 1.0 Maximum), pero introduce arquitectura, datos y búsqueda nuevos. Con 25.234.441 parámetros, es un modelo compacto que cabe en 101 MB en safetensors y que prioriza la eficiencia de inferencia sobre el tamaño.

La red es un ResNet con squeeze-and-excitation de 20 bloques y 256 canales, con una cabeza de política basada en atención from-square x to-square sobre 4.096 movimientos más 72 subpromociones, y una cabeza de valor que estima la puntuación esperada para el lado que mueve. La búsqueda usa PUCT MCTS con evaluación por lotes en GPU (32 posiciones, CUDA graphs), alcanzando entre 1.800 y 2.200 visitas por segundo en una RTX 3060 Ti y unas 130 por segundo en CPU.

Su relevancia actual es doble: por un lado, demuestra que un motor neuronal pequeño entrenado con supervisión sobre evaluaciones de Stockfish (no con self-play) puede alcanzar un nivel estimado de 2910 en la escala `UCI_Elo` de Stockfish 18 con solo 0,5 s por jugada; por otro, todo el pipeline (entrenamiento en una sola RTX 3060 Ti durante unas 6,5 horas y licencia Apache 2.0) lo convierte en una referencia práctica para quien quiera experimentar con motores de ajedrez neuronales sin grandes recursos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ResNet con squeeze-and-excitation, 20 bloques x 256 canales; búsqueda PUCT MCTS |
| Parámetros totales | 25.234.441 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada tablero de ajedrez) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`arkonium-0.9.safetensors`, 101 MB) + `config.json` |

## Arquitectura y entrenamiento
La red neuronal es un ResNet con módulos squeeze-and-excitation de 20 bloques y 256 canales. La cabeza de política emplea atención from-square x to-square que cubre 4.096 movimientos posibles más 72 subpromociones; la cabeza de valor devuelve la puntuación esperada para el lado que mueve. Sobre esta red se ejecuta una búsqueda PUCT MCTS con evaluación por lotes en GPU (32 posiciones simultáneas y CUDA graphs), lo que permite entre 1.800 y 2.200 visitas por segundo en una RTX 3060 Ti y alrededor de 130 por segundo en CPU.

El entrenamiento se realizó sobre 55.559.925 posiciones extraídas de tres de los veinte ficheros (0, 6 y 13) de la base de datos de evaluaciones de Lichess (`Lichess/chess-position-evaluations`, CC0), evaluadas por usuarios con Stockfish, a menudo a profundidad 40 o más. Para cada posición se usa la evaluación más profunda con hasta cinco variantes principales: el objetivo de política son los primeros movimientos de esas variantes ponderados por su diferencia en centipeones (softmax con temperatura de 60 cp), y el objetivo de valor es la puntuación esperada de la mejor línea según la fórmula de probabilidad de victoria de Lichess (mate = 1). El modelo aprende por tanto de evaluaciones de Stockfish y no mediante self-play. El run consistió en una pasada sobre los datos (54.062 pasos de 1.024 posiciones) con AdamW, learning rate 2e-3 y schedule warm-up/stable/decay, en bf16 sobre una sola RTX 3060 Ti durante unas 6,5 horas. En 200.000 posiciones retenidas, la primera elección de la red coincide con el mejor movimiento de Stockfish en el 51,8 % de los casos y el error cuadrático medio de valor es 0,0387 en la escala [-1, 1].

## Capacidades
- Evaluación de posiciones de ajedrez: devuelve política sobre 4.096 movimientos más 72 subpromociones y valor esperado para el lado que mueve.
- Búsqueda MCTS con PUCT integrada: el motor combina la red con búsqueda de árbol para seleccionar jugadas.
- Interfaz UCI: puede usarse en GUIs de ajedrez como Cute Chess, Arena o BanksiaGUI.
- Juego en terminal mediante `play.py`, tanto con blancas como con negras.
- Evaluación por lotes en GPU con CUDA graphs para acelerar la búsqueda.
- Resolución de puzzles tácticos de Lichess con y sin búsqueda (desde 55,5 % sin búsqueda hasta 90,4 % con 1.600 visitas por jugada).
- No soporta tool calling, function calling, agentes multi-paso, visión, audio ni capacidades multilingües: es un motor de ajedrez, no un modelo de lenguaje.

## Casos de uso
- Análisis de partidas y posiciones: el motor puede evaluar posiciones concretas y proponer jugadas con una estimación de valor, adecuado para revisar partidas propias o de terceros con una ventana de búsqueda configurable en visitas.
- Entrenamiento de jugadores de club: con 0,5 s por jugada y un nivel estimado de 2910 en la escala `UCI_Elo`, sirve como sparring de alta exigencia en sesiones de práctica, ejecutándose en una GPU de consumo.
- Integración en GUIs de ajedrez: gracias a la interfaz UCI, se puede cargar en Cute Chess, Arena o BanksiaGUI para torneos locales, análisis interactivo o comparación con otros motores.
- Resolución automática de puzzles tácticos: con 1.600 visitas por jugada resuelve el 90,4 % del conjunto de 1.050 puzzles de Lichess empleado en la model card, útil para generar datasets etiquetados o validar posiciones tácticas.
- Investigación en motores neuronales: al ser un modelo pequeño (25,2 M de parámetros), entrenado en una sola RTX 3060 Ti en 6,5 horas y con licencia Apache 2.0, es una base práctica para experimentar con arquitecturas, objetivos de entrenamiento o estrategias de búsqueda.
- Benchmarking de hardware para ajedrez neuronal: sus cifras de visitas por segundo (1.800-2.200 en RTX 3060 Ti, ~130 en CPU) permiten comparar el rendimiento de distintas GPU o configuraciones de despliegue en una carga realista.
- Generación de datos de entrenamiento: la política y el valor del modelo pueden usarse para etiquetar posiciones y construir datasets propios de ajedrez, dado que aprende de evaluaciones de Stockfish y produce distribuciones sobre movimientos.

## Benchmarks y rendimiento

Resultados contra Stockfish 18 con fuerza limitada (`UCI_LimitStrength`, Threads 1, Hash 16 MB, 0,5 s por jugada, aperturas emparejadas, máximo 200 plies tras la apertura, 96 partidas, 3 no terminadas excluidas):

| Ajuste Stockfish (`UCI_Elo`) | Victorias | Tablas | Derrotas | Sin terminar |
|---:|---:|---:|---:|---:|
| 1800 | 12 | 0 | 0 | 0 |
| 2000 | 12 | 0 | 0 | 0 |
| 2200 | 11 | 0 | 1 | 0 |
| 2400 | 8 | 3 | 1 | 0 |
| 2600 | 9 | 3 | 0 | 0 |
| 2800 | 7 | 3 | 0 | 2 |
| 3000 | 3 | 2 | 6 | 1 |
| 3190 (máximo) | 0 | 5 | 7 | 0 |

Estimación: **2910 en la escala `UCI_Elo` de Stockfish (intervalo del 95 %: 2827-2990)**. Comparación con motores anteriores de la línea, mismo protocolo:

| Motor | Estimación |
|---|---:|
| Arkon 1.0 Maximum | 1574 |
| Arkon-AoM 1.0 Maximum | 1941 |
| Arkonium 0.9 | 2910 |

Enfrentamiento directo contra Arkon-AoM 1.0 Maximum (20 partidas, 0,1 s por jugada, 10 aperturas emparejadas, misma RTX 3060 Ti, cinco partidas en paralelo): Arkonium 0.9 logró 16 victorias, 4 tablas y 0 derrotas (18:2); las 16 victorias terminaron en mate. Tiempo medio de pensamiento de 97 ms por jugada para Arkonium y 89 ms para Arkon-AoM; la jugada más larga de Arkonium bajo carga fue de 229 ms.

Puzzles de Lichess (1.050 puzzles, 150 por banda de 400 puntos, popularidad ≥ 80 y ≥ 500 partidas, semilla fija; se exige encontrar todos los movimientos de la solución, o un mate inmediato alternativo):

| Rating del puzzle | Solo red (sin búsqueda) | Búsqueda, 400 visitas/jugada | Búsqueda, 1.600 visitas/jugada |
|---|---:|---:|---:|
| 400-799 | 147/150 | 150/150 | 150/150 |
| 800-1199 | 133/150 | 149/150 | 150/150 |
| 1200-1599 | 116/150 | 147/150 | 148/150 |
| 1600-1999 | 96/150 | 147/150 | 148/150 |
| 2000-2399 | 58/150 | 129/150 | 138/150 |
| 2400-2799 | 28/150 | 104/150 | 125/150 |
| 2800+ | 5/150 | 48/150 | 90/150 |
| **Total** | **583/1050 (55,5 %)** | **874/1050 (83,2 %)** | **949/1050 (90,4 %)** |

Excluyendo las 11 posiciones iniciales que también aparecen en los datos de entrenamiento: 577/1039 (55,5 %) sin búsqueda, 866/1039 (83,3 %) con 400 visitas y 940/1039 (90,5 %) con 1.600 visitas.

## Requisitos de hardware
- VRAM estimada para inferencia: el peso en safetensors ocupa 101 MB; con overhead de PyTorch y lotes de 32 posiciones la huella es reducida, aunque no se publica una cifra exacta de VRAM.
- GPU recomendadas: RTX 3060 Ti (referencia usada por el autor, 1.800-2.200 visitas/s). Se recomienda encarecidamente una GPU CUDA; en CPU el motor es mucho más débil (~130 visitas/s).
- Cabe en GPU de consumo: sí, la RTX 3060 Ti es la referencia del autor; cualquier GPU consumer con soporte CUDA y suficiente VRAM para el lote de evaluación debería funcionar.
- Opciones de despliegue: el repositorio incluye `play.py` para jugar en terminal y soporte de interfaz UCI para GUIs de ajedrez (Cute Chess, Arena, BanksiaGUI). Requiere Python 3.10+ y las dependencias de `requirements.txt`, con PyTorch CUDA instalado previamente desde pytorch.org. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplican a este tipo de modelo).
- Latencia y throughput: 1.800-2.200 visitas/s en RTX 3060 Ti y ~130 visitas/s en CPU; en el duelo directo, 97 ms de media por jugada con 0,1 s por jugada y cinco partidas en paralelo, con un máximo de 229 ms bajo carga.

## Comparativa con modelos similares

| Modelo | Parámetros | Búsqueda | Nivel estimado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Arkonium 0.9 | 25,2 M | PUCT MCTS, lotes GPU | 2910 (`UCI_Elo` Stockfish) | Apache 2.0 | Hugging Face |
| Arkon 1.0 Maximum | no disponible | no disponible (CPU) | 1574 (`UCI_Elo` Stockfish) | no disponible | línea Arkon de Convergent |
| Arkon-AoM 1.0 Maximum | no disponible | no disponible (CPU) | 1941 (`UCI_Elo` Stockfish) | no disponible | línea Arkon de Convergent |
| Leela Chess Zero | no disponible | MCTS | no disponible en la información | no disponible | proyecto abierto |
| Stockfish 18 (referencia) | no disponible | alpha-beta | escala `UCI_Elo` hasta 3190 | no disponible | motor de referencia |

Las cifras de Arkon 1.0 Maximum y Arkon-AoM 1.0 Maximum se midieron con el mismo protocolo que Arkonium 0.9, pero con los motores Arkon en CPU, mientras que Arkonium buscó en una RTX 3060 Ti; la comparación no es estrictamente equivalente en hardware. No se dispone de datos de benchmarks de Leela Chess Zero ni de Stockfish 18 en la información proporcionada.

## Limitaciones y advertencias
- Las estimaciones de nivel no son ratings FIDE ni de Lichess: son estimaciones en la escala `UCI_Elo` de Stockfish, calibrada por Stockfish contra listas de motores a controles de tiempo más largos; aquí ambas partes jugaron a 0,5 s por jugada.
- Muestras pequeñas: 12 partidas por ajuste de `UCI_Elo` y 20 partidas en el duelo directo; el intervalo del 95 % (2827-2990) refleja esa incertidumbre.
- El motor depende fuertemente de la GPU: en CPU es mucho más débil (~130 visitas/s frente a 1.800-2.200 en RTX 3060 Ti), por lo que el nivel estimado no es representativo de un despliegue sin CUDA.
- Aprende de evaluaciones de Stockfish, no de self-play: hereda los sesgos y errores de esas evaluaciones y de la cobertura de la base de datos de Lichess (solo tres de los veinte ficheros).
- Fuga de datos en la evaluación de puzzles: 11 de las 1.050 posiciones iniciales aparecen en los datos de entrenamiento; los resultados sin ellas se publican, pero conviene tenerlo en cuenta al interpretar las cifras.
- No es un modelo de lenguaje: no soporta tool calling, agentes, visión, audio ni capacidades multilingües; cualquier uso fuera del ajedrez no está contemplado.
- Licencia Apache 2.0: permite uso comercial, pero se debe conservar el aviso de licencia y atribución correspondiente.
- No se documentan tipos de cuantización ni requisitos exactos de VRAM; para producción conviene medir la huella real con el lote de evaluación configurado.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/Convergent-ch/Arkonium-0.9
- Dataset de entrenamiento: https://huggingface.co/datasets/Lichess/chess-position-evaluations
- Resultados del duelo directo: `results/duel-arkon-aom.json` (incluido en el repositorio del modelo)
- PyTorch con CUDA: https://pytorch.org
