# avewright/chess-transformer-270m-squares64

## Resumen

chess-transformer-270m-squares64 es una red neuronal de política y valor para ajedrez de 268,55 millones de parámetros, desarrollada por el usuario avewright y publicada en HuggingFace bajo licencia MIT. No es un modelo de lenguaje: no procesa ni genera texto natural, sino que recibe posiciones de ajedrez y produce una distribución de probabilidad sobre jugadas legales (cabeza de política espacial con vocabulario compacto de 1968 movimientos) junto con una estimación de resultado a tres bandas (victoria, tablas, derrota). Su relevancia es de nicho: se trata de un experimento de escalado en anchura de un modelo predecesor de 99M parámetros del mismo autor, con una arquitectura recurrente con pesos compartidos por "bancos" de capas.

La innovación arquitectónica principal es que la atención se restringe exclusivamente a las 64 casillas del tablero, en lugar de operar sobre una secuencia de tokens que incluya información de turno, enroque o captura al paso. Esa información de estado se inyecta mediante FiLM (modulación de características) con inicialización a cero sobre el flujo de casillas. El tronco es recurrente: un prefijo de 4 capas, un banco de 7 módulos de capa desenrollados 3 veces (21 pasos) y un sufijo de 4 capas, lo que da una profundidad efectiva de 29 con solo 15 módulos de capa únicos. El ancho es de 1216 dimensiones con 16 cabezas de atención y una dimensión de encoder de 256.

El checkpoint publicado corresponde al paso 43000 de preentrenamiento y el propio autor lo describe explícitamente como un snapshot intermedio, no como un reemplazo del modelo de 99M, que sigue siendo más fuerte en enfrentamientos directos. El repositorio ocupa 1,1 GB e incluye el peso `latest.pt`, la configuración de arquitectura y los ficheros JSON con las evaluaciones de fuerza. No tiene descargas ni valoraciones en el momento de redactar esta ficha y no se ha publicado información sobre benchmarks estándar ni sobre cuantizaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer recurrente (banco de capas desenrolladas) con atención restringida a las 64 casillas del tablero; información de estado vía FiLM |
| Parametros totales | 268,55 M |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica: no hay ventana de tokens; la atención opera únicamente sobre las 64 casillas del tablero |
| Tipos de cuantizacion | No disponible (solo se publica `latest.pt`; no se documentan variantes cuantizadas) |
| Idiomas soportados | No disponible / no aplica: el modelo no procesa lenguaje natural |
| Licencia | MIT |
| Formato de pesos | PyTorch (`.pt` con `model_state_dict`, `config`, `arch` y `steps`) |

Especificaciones adicionales declaradas por el autor:

| Parametro | Valor |
|---|---|
| Dimension oculta / cabezas | 1216 d / 16 cabezas |
| Dimension del encoder | 256 |
| Tronco | Prefijo 4 + banco 7x3 desenrollados + sufijo 4 |
| Profundidad efectiva | 29 (15 modulos de capa unicos) |
| Embeddings de pieza | Fusionados pieza x color (13) |
| Cabeza de politica | Espacial, vocabulario compacto de 1968 movimientos |
| Cabeza de valor | 3 vias (WDL: victoria / tablas / derrota) |
| Gradient recurrentes | Gradientes del banco divididos entre 3 tras el backward |
| Paso de preentrenamiento | 43000 |
| Tamano del repositorio | 1,1 GB |

## Arquitectura y entrenamiento

La arquitectura es un transformer recurrente con compartición de pesos por tramos. El tronco se divide en un prefijo de 4 capas, un banco de 7 módulos de capa que se desenrolla 3 veces (equivalente a 21 pasos de profundidad) y un sufijo de 4 capas, lo que resulta en una profundidad efectiva de 29 usando solo 15 módulos de capa distintos. La atención se calcula exclusivamente sobre las 64 casillas del tablero (matriz 64x64), lo que reduce drásticamente el coste cuadrático respecto a una secuencia de tokens ampliada. Los embeddings fusionan pieza y color en 13 categorías. El turno, los derechos de enroque y la captura al paso se inyectan como modulación FiLM sobre el flujo de casillas, con inicialización a cero, en lugar de ocupar posiciones adicionales en la secuencia. Durante el backward, los gradientes correspondientes al banco se dividen entre 3 para compensar el desenrollado.

Los datos de entrenamiento son etiquetas suaves (soft labels) con el vocabulario compacto de 1968 movimientos y optimización Polar-NorMuon. La mezcla en este snapshot combina mayoritariamente Lichess MultiPV con Syzygy, más un pequeño porcentaje de corrección: el dataset `chess-soft-100m-disagreements` representaba el 8% del batch. Los flujos posteriores basados en SF19 ECO y en puzzles no estaban incluidos en este checkpoint. Este modelo es una inicialización desde cero: el autor indica explícitamente que no es una copia ni una expansión de los pesos del modelo de 99M. La configuración completa vive en `model_config.json` bajo la clase `Squares64RecurrentConfig`.

## Capacidades

- Generación de jugadas de ajedrez legales mediante argmax de la política con máscara de legalidad (sin búsqueda).
- Evaluación de posición a tres bandas (victoria / tablas / derrota) mediante la cabeza WDL.
- Recuperación de las mejores jugadas alternativas por posición a través del campo `info["top_moves"]` de la API de inferencia.
- Inferencia tanto en CPU como en GPU (`device="cpu"` o `"cuda"` en el ejemplo del autor).
- Representación interna de estado de partida completo: turno, derechos de enroque y disponibilidad de captura al paso tratados como señales FiLM.
- Cálculo de atención sobre las 64 casillas, lo que permite procesar cualquier posición legal de ajedrez, incluidas fases de final.
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso explícito, visión, audio ni procesamiento de lenguaje natural.
- No dispone de modo "thinking" ni de decodificación especulativa documentada.

## Casos de uso

- Motor de ajedrez sin búsqueda: el modelo permite obtener una jugada directamente del argmax de la política, sin MCTS, libro de aperturas ni tablas de Syzygy, lo que reduce el coste computacional por jugada a una única pasada forward. Es adecuado como motor ligero o como componente de evaluación rápida.
- Anotación automática de partidas: combinando la cabeza WDL con las jugadas alternativas de `top_moves`, un pipeline puede etiquetar momentos críticos de una partida (dónde la evaluación cambia de signo) sin necesidad de ejecutar un motor con búsqueda profunda.
- Generación de datos de entrenamiento y destilación: la política con etiquetas suaves puede actuar como profesor para generar distribuciones de probabilidad sobre jugadas que alimenten modelos más pequeños o datasets de investigación, dado que el propio autor ya emplea esta técnica en su pipeline.
- Investigación en arquitecturas recurrentes con compartición de pesos: el modelo es un caso de estudio aislado (dominio cerrado, sin lenguaje) para medir el efecto del desenrollado de bancos de capas y de la compartición de pesos sobre la calidad de la representación.
- Tutor o asistente de ajedrez en aplicaciones educativas: la API devuelve la jugada recomendada junto con la estimación WDL, lo que permite construir una interfaz que explique el estado de la posición sin depender de un motor externo.
- Bot de ajedrez en servidores sin GPU: el ejemplo oficial admite `device="cpu"` y el checkpoint en fp32 ocupa aproximadamente 1,08 GB, por lo que puede desplegarse en máquinas modestas o en contenedores sin acelerador.
- Comparación de eficiencia frente a modelos de la misma familia: sirve como punto de referencia para medir cuánta fuerza adicional aportan 170M parámetros extra frente al modelo de 99M bajo el mismo protocolo de evaluación sin búsqueda.
- Análisis específico de finales: al haberse entrenado en parte con etiquetas suaves de Syzygy, el modelo puede emplearse en experimentos sobre reconocimiento de posiciones de final, siempre con validación externa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible; además, esos benchmarks no son aplicables a un modelo de política de ajedrez. Lo que sí se documenta son enfrentamientos directos y una escalera contra Stockfish 17.1, todos con política greedy sin búsqueda, sin libro y sin Syzygy:

| Enfrentamiento | Resultado | Condiciones |
|---|---|---|
| vs exp270 paso 48000 | 13,5–6,5 (a favor del 270M paso 43000) | 20 partidas, 10 aperturas x ambos colores |
| vs chess-transformer-100m-squares64 | 6–14 (a favor del 99M) | Mismo protocolo |
| vs Stockfish 17.1 `UCI_Elo` | ~2050 estimado | 8 partidas por nivel, escalera 1600–2200; el autor lo califica de ruidoso |

El autor advierte expresamente que estas cifras no son Elo FIDE ni Elo de Lichess, y que el modelo de 99M sigue siendo más fuerte en el mismo protocolo porque acumula más entrenamiento por parámetro y dispone de un fine-tuning con el dataset de desacuerdos.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1,08 GB solo de pesos, más activaciones y overhead; en la práctica alrededor de 2 GB.
- VRAM estimada en fp16/bf16: aproximadamente 538 MB de pesos, con overhead típico por debajo de 1,5 GB.
- VRAM estimada en int8: aproximadamente 269 MB de pesos, aunque no se publica ninguna cuantización oficial.
- Cabe holgadamente en GPU de consumo: RTX 3060 12 GB, RTX 4060, RTX 4090, así como en GPUs de portátil con 4 GB o más.
- Inferencia en CPU soportada explícitamente por el ejemplo del autor (`device="cpu"`), viable en máquinas sin acelerador.
- GPU de centro de datos (A100, H100) no son necesarias para inferencia; solo tendrían sentido para entrenamiento o evaluación masiva por lotes.
- Opciones de despliegue: PyTorch con el código propio del repositorio (`chess_inference.py`, `chess_squares64.py`) y `python-chess` para la representación del tablero. Es imprescindible definir `MOVE_VOCAB_VERSION=compact`.
- vLLM, TGI, llama.cpp, Ollama y similares no son aplicables: la arquitectura es específica del dominio (atención 64x64, cabeza de política con vocabulario de 1968 movimientos) y no sigue la interfaz de un modelo generativo de texto. No se documenta exportación a ONNX ni a TorchScript.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Atencion / contexto | Fuerza (sin busqueda) | Licencia | Estado |
|---|---|---|---|---|---|
| chess-transformer-270m-squares64 | 268,55 M | 64x64 casillas | ~2050 UCI_Elo estimado; pierde 6–14 contra el 99M | MIT | Publico (snapshot paso 43000) |
| chess-transformer-100m-squares64 | ~99 M | 64x64 casillas | Gana 14–6 al 270M en el mismo protocolo | MIT | Publico |
| exp270 paso 48000 | ~270 M (misma familia) | 64x64 casillas | Pierde 6,5–13,5 contra el paso 43000 | No disponible | No publicado como checkpoint independiente |
| Stockfish 17.1 | No disponible | No disponible | Referencia de la escalera `UCI_Elo` 1600–2200 | GPL (fuera del alcance de esta ficha) | Publico |

No se dispone de información sobre otros modelos de ajedrez comparables en la documentación proporcionada; la comparativa se limita a los modelos de la misma familia publicados por el autor y a la referencia de Stockfish empleada en la escalera de evaluación.

## Limitaciones y advertencias

- Es un snapshot intermedio de preentrenamiento (paso 43000), no el mejor modelo de su autor. El propio autor indica que el modelo público de 99M es más fuerte y que este 270M no lo reemplaza.
- La estimación de ~2050 Elo procede de una escalera ruidosa (8 partidas por nivel, rango 1600–2200) y no equivale a Elo FIDE ni a Elo de Lichess.
- El modelo juega sin búsqueda, sin libro de aperturas, sin tablas de Syzygy y sin MCTS, por lo que su fuerza es muy inferior a la de un motor convencional con búsqueda.
- Requiere código propietario del repositorio y un vocabulario compacto concreto (`MOVE_VOCAB_VERSION=compact`, 1968 movimientos). No es plug-and-play con librerías estándar de ajedrez ni con otros vocabularios de movimientos.
- El vocabulario compacto de 1968 movimientos es incompatible con checkpoints que usen un vocabulario distinto.
- Este checkpoint no incluye los flujos de datos SF19 ECO ni de puzzles, incorporados en fases posteriores de entrenamiento.
- Sesgo de datos: la mezcla dominante es Lichess MultiPV más Syzygy, con un 8% del dataset de desacuerdos; esto puede sesgar el estilo de juego hacia las preferencias de esas fuentes y hacia posiciones de final bien cubiertas por tablas.
- La política puede producir jugadas débiles o no óptimas aunque sean legales; la máscara de legalidad evita jugadas ilegales, pero no errores estratégicos. En terminología de modelos generativos, el riesgo de "alucinación" se traduce aquí en evaluación y elección de jugada incorrectas.
- No procesa lenguaje natural ni soporta instrucciones textuales: la entrada es siempre una posición de ajedrez y la salida una distribución sobre movimientos.
- El modelo tiene 0 descargas y 0 likes en el momento de redactar esta ficha, por lo que no existe validación independiente por parte de la comunidad.
- La licencia MIT permite uso comercial y modificación sin restricciones de copyleft, pero se ofrece sin garantías de ningún tipo.
- La fecha de creación (2026-09-10) y de última actualización (2026-09-10) distan apenas 20 segundos, lo que sugiere una subida sin revisiones posteriores del repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/avewright/chess-transformer-270m-squares64
- Modelo predecesor de 99M: https://huggingface.co/avewright/chess-transformer-100m-squares64
- Dataset de etiquetas suaves MultiPV de Lichess: https://huggingface.co/datasets/avewright/chess-soft-multipv-lichess
- Dataset de etiquetas suaves de Syzygy: https://huggingface.co/datasets/avewright/chess-soft-syzygy
- Dataset de desacuerdos del modelo de 100M: https://huggingface.co/datasets/avewright/chess-soft-100m-disagreements
- No se han encontrado enlaces adicionales relevantes (papers, blogs o demos) en los resultados de búsqueda web disponibles.
