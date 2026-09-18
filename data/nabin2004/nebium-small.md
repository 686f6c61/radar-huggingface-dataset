# nabin2004/nebium-small

## Resumen

Nebium-Small es un modelo de lenguaje causal de 117 millones de parametros desarrollado por Nabin Oli (usuario nabin2004) y publicado en Hugging Face bajo licencia MIT. No es un modelo de proposito general: esta entrenado especificamente para prediccion autorregresiva de la siguiente jugada de ajedrez, trabajando sobre secuencias en notacion UCI (por ejemplo, "e2e4 e7e5 g1f3") en lugar de texto en lenguaje natural. Se apoya en un tokenizador BPE propio de 5000 tokens entrenado sobre plies UCI, derivado del dataset nabin2004/nebium-lichess-uci.

Arquitectonicamente es un transformer decoder-only convencional con primitivas modernas: 12 capas, dimension oculta de 768, 12 cabezas de atencion, contexto maximo de 1024 tokens, RoPE con theta 10000 para posiciones, activacion SwiGLU y RMSNorm en configuracion pre-normalizacion. El propio autor situa el presupuesto optimo de entrenamiento segun el marco Chinchilla en aproximadamente 2.300 millones de tokens (unas 46 millones de trayectorias de partidas de 50 jugadas), aunque la model card no confirma explicitamente que se haya alcanzado ese horizonte.

Su relevancia es acotada pero clara: demuestra el uso de un transformer causal pequeno y de coste minimo en un dominio simbolico y cerrado, donde el espacio de salida es discreto y verificable. Se distribuye como pesos PyTorch (`model.pt`) junto a un repositorio GGUF companero para ejecucion cuantizada, lo que permite desplegarlo en hardware muy modesto. El modelo no registra descargas ni likes en el momento de la consulta, por lo que carece de validacion independiente por parte de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal (denso) |
| Parametros totales | 117 millones |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | GGUF disponible en repositorio companero (nabin2004/nebium-small-gguf); niveles concretos no disponibles |
| Idiomas soportados | en (la salida real es notacion UCI de ajedrez, no lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | PyTorch binario (`model.pt`, state dictionary); GGUF en repositorio separado |
| Dimension oculta (d_model) | 768 |
| Cabezas de atencion | 12 |
| Capas del transformer | 12 |
| Tamano de vocabulario | 5000 (BPE sobre plies UCI) |
| Embeddings posicionales | RoPE, theta = 10000 |
| Funcion de activacion | SwiGLU |
| Normalizacion | RMSNorm (pre-normalizacion) |
| Mecanismo de atencion | Atencion causal de producto escalar escalada |
| Learning rate base | 3e-4 (decaimiento coseno con warmup lineal) |
| Weight decay | 0,1 |
| Tamano del repositorio | 0,1 GB |
| Fecha de creacion | 18 de septiembre de 2026 |

## Arquitectura y entrenamiento

Nebium-Small sigue el diseno clasico de un transformer decoder-only con atencion causal de producto escalar escalada, pero incorpora las primitivas habituales en modelos recientes: normalizacion RMSNorm aplicada antes de cada subcapa, activacion SwiGLU en las capas feed-forward y embeddings posicionales rotatorios (RoPE) con theta 10000 en lugar de embeddings posicionales aprendidos. Con 12 capas y d_model = 768, el reparto de parametros es el tipico de esta escala, y el vocabulario se reduce a 5000 tokens BPE entrenados especificamente sobre plies en notacion UCI, lo que concentra toda la capacidad del modelo en el dominio del ajedrez y reduce drasticamente el tamano de la capa de embedding y de la proyeccion de salida.

En cuanto al entrenamiento, la model card documenta un learning rate base de 3e-4 con decaimiento coseno y warmup lineal, y un weight decay de 0,1. El autor enmarca el calculo del presupuesto de datos en las leyes de escalado de Hoffmann et al. (2022), con los coeficientes E = 1,69, A = 406,4, B = 410,7, alpha = 0,34 y beta = 0,28, y estima un presupuesto optimo en computo de unos 2.300 millones de tokens (aproximadamente 20 veces el numero de parametros). No se documenta en la informacion disponible el numero real de tokens consumidos, la composicion exacta del dataset mas alla de su origen en Lichess, ni si se aplicaron etapas de ajuste por preferencias (RLHF, DPO) o instrucciones. Tampoco se describe ninguna innovacion tecnica adicional como decodificacion especulativa, atencion lineal o mecanismos hibridos SSM.

## Capacidades

- Generacion autorregresiva de continuaciones de partidas en notacion UCI, condicionada por un prompt de plies previos.
- Prediccion de la siguiente jugada con control de temperatura mediante el parametro `temperature` de `model.generate()`.
- Modelado de probabilidad de secuencias de jugadas, util para puntuar o comparar lineas.
- Aprendizaje de patrones de apertura y medio juego derivados del corpus de Lichess empleado en el entrenamiento.
- Tokenizacion especifica de ajedrez mediante la clase `ChessTokenizer` y un vocabulario BPE de 5000 tokens.
- Ejecucion local con pesos PyTorch o mediante artefactos GGUF para llama.cpp u Ollama.
- No dispone de soporte de tool calling ni de function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso orquestado.
- No dispone de modo "thinking", vision, audio ni entrada multimodal.
- No es un modelo multilingue: su unico idioma declarado es el ingles de la model card, pero su salida practica es notacion UCI, sin generacion de lenguaje natural.
- No esta ajustado por instrucciones, por lo que no responde a peticiones conversacionales.

## Casos de uso

- Analisis de partidas asistido por modelo: dado el historial de plies de una partida, el modelo genera la continuacion mas probable, lo que permite comparar la jugada realmente disputada con la prediccion y detectar desviaciones o errores en fases concretas.
- Anotacion automatica de bases de datos de Lichess: procesar ficheros PGN en lote y enriquecer cada posicion con la probabilidad asignada a la jugada jugada y a sus alternativas, generando etiquetas de calidad de jugada a bajo coste.
- Entrenamiento de jugadores: al modelar el estilo de un corpus real de Lichess, las continuaciones generadas pueden emplearse como referencia de jugadas humanamente plausibles, complementaria a la de un motor de fuerza superior.
- Generacion de datos sinteticos para ajedrez: producir trayectorias de partidas con `max_new_tokens` controlado para aumentar datasets de entrenamiento de otros sistemas de ajedrez o para pruebas de carga de pipelines, dado el bajo coste por token de un modelo de 117M.
- Bot ligero embebido: con 117 millones de parametros y contexto de 1024 tokens, el modelo cabe en dispositivos de gama baja o incluso en CPU, lo que permite integrarlo en un cliente de ajedrez local sin dependencia de servicios en la nube.
- Filtrado y curacion de corpus: puntuar secuencias UCI con la log-verosimilitud que asigna el modelo para descartar partidas corruptas, truncadas o con notacion inconsistente antes de incorporarlas a un dataset mayor.
- Investigacion en escalado sobre dominios simbolicos: el modelo sirve como punto de partida reproducible para estudiar como se comportan las leyes de escalado Chinchilla en un espacio de salida discreto y verificable como el ajedrez, con un coste de entrenamiento y de inferencia muy contenido.
- Herramientas educativas de analisis tactico: integrar el modelo en una interfaz que muestre la siguiente jugada prevista y permita al usuario contrastarla con la suya, aprovechando que el contexto de 1024 tokens cubre partidas completas de longitud habitual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye el marco teorico de escalado (coeficientes de Hoffmann et al. 2022 y presupuesto optimo estimado de 2.300 millones de tokens) y especificaciones de arquitectura, pero no reporta valores de MMLU, HumanEval, GSM8K ni de metricas especificas de ajedrez como precision de siguiente jugada, tasa de jugadas legales, perplexity sobre un conjunto de validacion o Elo estimado.

## Requisitos de hardware

- VRAM estimada para los pesos, calculada a partir de los 117 millones de parametros: aproximadamente 468 MB en fp32, 234 MB en fp16/bf16, 117 MB en int8 y unos 58 MB en int4.
- La memoria adicional para activaciones es reducida: con 12 capas, d_model 768 y contexto maximo de 1024 tokens, el pico de memoria de inferencia queda muy por debajo de las decenas de megas de pesos en el caso de lotes pequenos.
- Cabe sin problema en GPU de consumo: cualquier tarjeta con 4 GB o mas (GTX 1650, RTX 3050, RTX 3060, RTX 4060, RTX 4090) es suficiente incluso en fp32. El modelo tambien es viable en CPU para inferencia interactiva, dado su tamano.
- GPU de datacenter como A100 o H100 no son necesarias; solo tendrian sentido para servir muchas peticiones concurrentes o para reentrenamiento.
- Opciones de despliegue: carga directa en PyTorch mediante el codigo del repositorio GitHub (clases `Nebium` y `ChessTokenizer`), y ejecucion cuantizada mediante el repositorio GGUF companero con llama.cpp u Ollama. La integracion con vLLM o TGI no esta documentada y no se puede confirmar, ya que el modelo no expone una interfaz estandar de `transformers`.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Datos verificados en la informacion disponible |
|---|---|---|---|---|---|
| Nebium-Small | 117M | 1024 tokens | Prediccion de siguiente jugada en UCI | MIT | Si (model card) |
| Maia Chess (variantes por nivel) | no disponible | no disponible | Prediccion de jugadas con estilo humano por nivel de Elo | no disponible | No |
| Leela Chess Zero | no disponible | no disponible | Motor de ajedrez basado en red neuronal y busqueda MCTS | no disponible | No |
| Stockfish con red NNUE | no disponible | no disponible | Motor de ajedrez de fuerza maxima con evaluacion NNUE | no disponible | No |

La informacion proporcionada no incluye datos verificados de parametros, contexto, rendimiento ni licencia de los modelos alternativos citados, que se mencionan unicamente por pertenecer al mismo espacio de problema (prediccion de jugadas y ajedrez asistido por redes neuronales). La diferencia cualitativa verificable es que Nebium-Small es un transformer causal puro sin busqueda, mientras que Leela Chess Zero y Stockfish combinan red neuronal con algoritmos de busqueda para maximizar fuerza de juego. No se dispone de una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- Modelo de dominio cerrado: no es un asistente conversacional ni un modelo de proposito general, y no responde a instrucciones en lenguaje natural.
- Riesgo de jugadas ilegales: la model card no documenta ninguna mascara de legalidad ni verificacion de movimientos durante la decodificacion, por lo que las continuaciones generadas pueden ser invalidas y deben validarse con un tablero antes de usarse.
- Alucinacion: en un espacio de notacion discreta, el equivalente a la alucinacion es la generacion de secuencias UCI sintacticamente plausibles pero ilegales o incoherentes con la posicion; no se han publicado metricas de tasa de legalidad.
- Limitacion de contexto: 1024 tokens acotan la longitud de la partida o secuencia que el modelo puede condicionar, y el BPE sobre UCI puede fragmentar algunos tokens, reduciendo el numero efectivo de plies representables.
- Idioma y formato: fuera de la notacion UCI el modelo no tiene capacidad de generar texto util; no debe esperarse soporte multilingue.
- Sesgos de datos: el entrenamiento se apoya en un corpus derivado de Lichess, por lo que las predicciones reflejan el estilo, el rango de niveles y las aperturas predominantes en esa plataforma. La model card no detalla la composicion del dataset ni un analisis de sesgos.
- Sin ajuste por preferencias: no se documenta RLHF ni DPO, lo que refuerza que el modelo imita la distribucion del corpus en lugar de optimizar una nocion de calidad de jugada.
- Incertidumbre sobre el entrenamiento: no se confirma si se alcanzo el presupuesto optimo de 2.300 millones de tokens, ni el numero real de tokens vistos.
- Integracion: el uso requiere el codigo del repositorio GitHub (`src.models.transformer.nebium`, `src.data.tokenizer`), ya que no se distribuye con una configuracion estandar de la libreria `transformers`.
- Rendimiento no validado: cero descargas y cero likes en el momento de la consulta, sin benchmarks publicados ni evaluacion independiente.
- Licencia: MIT, permisiva, permite uso comercial, modificacion y redistribucion con atribucion; no se documentan restricciones adicionales ni clausulas de uso aceptable.
- Consideracion practica en produccion: al no existir evaluacion de fuerza de juego, no debe presentarse como sustituto de un motor de ajedrez en contextos donde la calidad de la jugada sea critica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nabin2004/nebium-small
- Repositorio GGUF companero: https://huggingface.co/nabin2004/nebium-small-gguf
- Codigo fuente del framework: https://github.com/nabin2004/nebium
- Dataset de entrenamiento declarado: https://huggingface.co/datasets/nabin2004/nebium-lichess-uci
- Referencia de leyes de escalado citada en la model card: Hoffmann et al. (2022), "Training Compute-Optimal Large Language Models" (mencionada como base del analisis Chinchilla; no se proporciona URL en la informacion disponible)
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo; los enlaces obtenidos correspondian a paginas de soporte de Microsoft y no guardan relacion con Nebium-Small.
