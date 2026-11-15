# Akdenizz/bunner-b1-preview

## Resumen

Bunner B1 Preview es un motor de ajedrez neuronal de 18,5 millones de parámetros entrenado desde cero por el desarrollador independiente Akdenizz y publicado bajo licencia MIT. A diferencia de los grandes modelos de lenguaje, no procesa texto: recibe una representación tensorial del tablero (19 planos de 8x8) y emite una distribución de probabilidad sobre 4096 movimientos codificados como pares casilla de origen y casilla de destino. Su arquitectura es una red convolucional residual de 12 bloques con 256 filtros, inspirada en el linaje de AlphaZero y Leela Chess Zero, pero con un diseño mucho más compacto.

El modelo se presenta como una versión preliminar ("preview") y su único dato de rendimiento publicado es una precisión top-1 del 38,54 % sobre un conjunto de pruebas de puzzles de Lichess. Esa métrica mide la coincidencia con el movimiento considerado correcto en el puzzle, no la fuerza de juego en partidas, por lo que no equivale a una estimación Elo. El repositorio ocupa 0,1 GB e incluye los pesos en formato PyTorch (`bunner_b1_preview.pt`, 74,2 MB) y un `config.json` con los hiperparámetros de la red.

Su relevancia es acotada pero clara: sirve como pieza educativa y como base reproducible para experimentar con motores de ajedrez neuronales ligeros, ya que el código de inferencia cabe en unas pocas decenas de líneas y se ejecuta en CPU o en cualquier GPU consumer. No compite con Stockfish ni con redes de Lc0 de gran tamaño, y carece de cabeza de valor, lo que limita su uso en búsqueda alfa-beta o MCTS convencional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN residual (12 bloques RSE, 256 filtros), entrada 19x8x8, salida 4096 |
| Parametros totales | 18,5 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (entrada fija de 19x8x8) |
| Tipos de cuantizacion | no disponible (solo pesos PyTorch en fp32) |
| Idiomas soportados | no aplica (modelo de ajedrez, sin procesamiento de lenguaje) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`bunner_b1_preview.pt`) + `config.json` |

## Arquitectura y entrenamiento

La red sigue un esquema de política pura. Un *stem* convolucional de 3x3 transforma los 19 planos de entrada en 256 canales, seguido de 12 bloques residuales denominados RSE, cada uno con dos convoluciones 3x3 con BatchNorm y conexiones residuales con activación ReLU. La cabeza de política reduce con una convolución 1x1 a 32 canales, aplana la rejilla 8x8 (2048 dimensiones), pasa por una capa densa a 256 unidades y termina en una proyección lineal a 4096 salidas, una por cada par origen-destino posible en el tablero.

La codificación del tablero usa 12 planos para las piezas (6 tipos por 2 colores) y un plano adicional para el turno, lo que da 13 planos efectivos; el tensor declarado es de 19 planos, de modo que los planos restantes no están documentados en la información disponible. No se especifican el volumen de datos de entrenamiento, la composición del dataset, ni si hubo ajuste con refuerzo, destilación desde otro motor o supervisión a partir de partidas humanas. Tampoco se documenta ninguna innovación técnica adicional como decodificación especulativa o atención lineal; el diseño es una CNN residual convencional orientada a política.

## Capacidades

- Predicción de movimiento: dada una posición legal, devuelve una puntuación para cada uno de los 4096 pares origen-destino y permite seleccionar el movimiento legal con mayor puntuación.
- Evaluación de política en una sola pasada: no requiere búsqueda para emitir una recomendación, lo que permite inferencia de baja latencia.
- Integración con `python-chess` para la generación de movimientos legales y la validación de la salida.
- Ejecución en CPU y GPU mediante PyTorch estándar, sin dependencias de kernels especializados.
- No dispone de cabeza de valor, por lo que no estima la probabilidad de victoria de una posición.
- No soporta *tool calling*, agentes, razonamiento multi-paso ni capacidades multilingües; su dominio es exclusivamente el ajedrez.
- No incluye modo de razonamiento explícito, visión, audio ni generación de texto.

## Casos de uso

- Análisis táctico de posiciones concretas: cargar una FEN con `python-chess`, codificar el tablero y consultar la política para obtener los movimientos mejor puntuados; útil como segunda opinión rápida en un visor de partidas.
- Generación de movimientos en un motor propio de investigación: sirve como política inicial en un bucle MCTS o alfa-beta de juguete, siempre que se añada una función de evaluación externa, ya que el modelo no incorpora cabeza de valor.
- Etiquetado y filtrado de puzzles de Lichess: dado que se publicó una precisión top-1 del 38,54 % sobre puzzles, puede usarse para priorizar o descartar candidatos en un pipeline de curación de ejercicios tácticos.
- Docencia y divulgación: el código de inferencia completo y el tamaño reducido (74,2 MB) permiten explicar en una sesión cómo se representa un tablero como tensor y cómo una CNN residual produce una distribución de movimientos.
- Pruebas de integración en aplicaciones de ajedrez: validar el flujo FEN → tensor → índices de movimiento → UCI en un backend Python antes de sustituir el modelo por uno mayor.
- Benchmark de referencia para modelos pequeños: al ser un motor de 18,5 M de parámetros entrenado desde cero, sirve como línea base para medir mejoras de arquitectura o de datos en experimentos propios.
- Inferencia en hardware modesto: al caber en CPU y en GPU consumer, permite desplegar un recomendador de movimientos en entornos sin acelerador dedicado.

## Benchmarks y rendimiento

| Metrica | Valor | Conjunto |
|---|---|---|
| Precisión top-1 | 38,54 % | Puzzles de Lichess |

No se han publicado resultados de benchmarks en la informacion disponible más allá de la precisión top-1 indicada. No hay datos de Elo, de rendimiento en partidas, de comparación con Stockfish o Leela Chess Zero, ni de latencia o throughput medidos.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en fp32 para los 18,5 M de parámetros (74,2 MB de pesos) más las activaciones de una entrada 19x8x8; en la práctica, cualquier GPU con 2 GB o más es suficiente.
- GPU recomendadas: no se requiere una GPU concreta; funciona en RTX 3060, RTX 4090, A100 o H100 sin aprovechar su capacidad. La inferencia es viable en CPU.
- GPU consumer: sí, cabe en cualquier GPU consumer moderna e incluso en hardware integrado, dado el tamaño del modelo y de la entrada.
- Despliegue: PyTorch nativo con `huggingface_hub` para la descarga; no hay soporte documentado para vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada / salida | Cabeza de valor | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Bunner B1 Preview | 18,5 M | 19x8x8 / 4096 movimientos | No | MIT | Hugging Face |
| Leela Chess Zero (redes pequeñas, p. ej. T-net) | del orden de millones a decenas de millones | Planos de tablero / política y valor | Sí | GPL y otras según la red | Sitios de Lc0 |
| AlphaZero (referencia) | no disponible públicamente en detalle | Planos de tablero / política y valor | Sí | No pública | No pública |

La comparación cuantitativa con Leela Chess Zero no está disponible en la información proporcionada: no hay datos de Elo ni de precisión comparables entre ambos. La diferencia estructural principal es que Bunner B1 Preview carece de cabeza de valor y de historial de movimientos como entrada, lo que restringe su uso en búsqueda frente a las redes de Lc0. No se dispone de datos de otros motores neuronales pequeños directamente comparables.

## Limitaciones y advertencias

- Solo política: al no incluir cabeza de valor, no puede evaluar posiciones de forma estática ni alimentar correctamente un MCTS o alfa-beta sin una función de evaluación adicional.
- Métrica limitada: el 38,54 % de precisión top-1 sobre puzzles de Lichess no es una medida de fuerza de juego; no debe interpretarse como un Elo ni compararse con motores consolidados.
- Versión preliminar: el propio nombre ("preview") y la ausencia de documentación sobre datos de entrenamiento impiden garantizar comportamiento estable fuera de la distribución de pruebas.
- Entrada sin historial: la codificación descrita no incluye derechos de enroque, casilla de captura al paso ni contador de repeticiones, lo que puede producir recomendaciones ilegales o incorrectas en posiciones con esas reglas activas; el ejemplo del autor filtra por movimientos legales, pero no corrige la evaluación.
- Ambigüedad en la codificación: el tensor declarado es de 19 planos mientras que el código de ejemplo rellena 13; el uso de los planos restantes no está documentado.
- Riesgo de alucinación en sentido figurado: la red puede asignar alta probabilidad a movimientos que pierden material, ya que no hay señal de valor que lo penalice.
- Idiomas: no aplica, pero conviene subrayar que no procesa texto ni instrucciones en lenguaje natural.
- Licencia MIT: permite uso comercial y modificación con atribución; no se documentan restricciones adicionales, pero tampoco garantías de idoneidad.
- Sin soporte comunitario: 0 descargas y 0 likes en el momento de la consulta, sin issues ni documentación más allá de la model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Akdenizz/bunner-b1-preview
- Pesos: https://huggingface.co/Akdenizz/bunner-b1-preview/blob/main/bunner_b1_preview.pt
- Configuración: https://huggingface.co/Akdenizz/bunner-b1-preview/blob/main/config.json
- `python-chess` (dependencia del ejemplo de inferencia): https://python-chess.readthedocs.io/
- Puzzles de Lichess (origen declarado del conjunto de evaluación): https://lichess.org/training
