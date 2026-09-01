# rsu/Reversi-Transformer-1

## Resumen

El modelo `rsu/Reversi-Transformer-1` es un sistema de inteligencia artificial para jugar a Reversi (también conocido como Othello), desarrollado por el usuario rsu (rsu-Suba). A diferencia de los enfoques tradicionales basados en redes neuronales convolucionales (CNN), este modelo emplea una arquitectura Transformer con mezcla de expertos (Mixture-of-Experts, MoE) para la toma de decisiones sobre el tablero. Con solo 1,68 millones de parámetros y un tamaño de 20,6 MB, demuestra que los Transformers pueden competir eficazmente con modelos CNN mucho más grandes en tareas de juegos de tablero, logrando una tasa de victoria del 63% frente a un modelo ResNet CNN de 63 millones de parámetros.

El modelo procesa el estado del tablero como una secuencia de 64 tokens (una por casilla), incorpora embeddings de posición y movimiento, y utiliza un mecanismo de enrutamiento dinámico basado en softmax para combinar las salidas de múltiples expertos en atención y en redes feed-forward. Está entrenado mediante aprendizaje por refuerzo autojugado (self-play) con simulaciones de Monte Carlo Tree Search (MCTS), lo que le permite aprender estrategias de juego sin supervisión externa. Su relevancia radica en que ofrece una alternativa ligera y eficiente a los modelos CNN para juegos de tablero, abriendo la puerta a despliegues en entornos con recursos limitados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con Mixture-of-Experts (MoE) |
| Parametros totales | 1,68 millones |
| Parametros activos | no disponible (2 expertos MHA y 2 expertos FFN, sin desglose de activos por token) |
| Longitud de contexto | 64 tokens (representación del tablero 8x8) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de juego, no de lenguaje) |
| Licencia | MIT |
| Formato de pesos | H5 (TensorFlow) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura Transformer pura, sin capas convolucionales. La entrada es un tensor de forma `(8, 8, 2)` que codifica las piedras propias y del oponente, que se convierte en 64 tokens (uno por casilla). Cada token se proyecta a una dimensión de embedding de 128 y se le añaden embeddings de token, fila, columna y movimiento. La pila principal consta de 4 bloques denominados `DynamicAssembly`, cada uno de los cuales contiene un pool compartido de 2 expertos de atención multi-cabeza (MHA) y 2 expertos de red feed-forward (FFN). En cada paso de iteración, la representación del tablero (obtenida mediante mean-pooling) se combina con un embedding de paso y se pasa a un router que produce una distribución de probabilidad sobre los expertos. Todos los expertos se evalúan y sus salidas se combinan ponderadamente según las probabilidades del router, con 2 pasos de enrutamiento iterativo. La normalización es Pre-LN LayerNorm y la activación de las FFN es GELU.

El entrenamiento se realizó con datos de autojuego generados por un modelo CNN previo de Othello. Se generaron 10.000 partidas completas usando MCTS con 600 simulaciones por movimiento, un tamaño de lote de 100 y una constante PUCT de 2,3. El modelo se optimizó con AdamW (clipnorm 1,0, weight decay 0,05, learning rate 6,0e-5) con un scheduler ReduceLROnPlateau, un tamaño de lote de 256 y 75 épocas. La función de pérdida combina la predicción de política (distribución sobre 64 movimientos) y la predicción de valor (resultado estimado en el rango [-1, 1]).

## Capacidades

- Juego de Reversi/Othello: el modelo predice la distribución de probabilidad sobre los 64 movimientos posibles (policy head) y estima la tasa de victoria esperada (value head).
- Toma de decisiones basada en el estado del tablero: procesa la configuración actual de piedras propias y del oponente para generar una jugada.
- Aprendizaje por refuerzo autojugado: el modelo ha sido entrenado mediante self-play con MCTS, lo que le permite adaptarse a diferentes estilos de juego.
- Eficiencia computacional: con solo 1,68 millones de parámetros, es adecuado para ejecutarse en CPU o dispositivos con recursos limitados.
- No tiene capacidades de lenguaje natural, visión o procesamiento de texto; está especializado exclusivamente en el juego de Reversi.

## Casos de uso

- Motor de juego para aplicaciones de Reversi: el modelo puede integrarse en aplicaciones de escritorio, web o móviles para ofrecer un oponente de IA. Su pequeño tamaño permite ejecutarlo en tiempo real incluso en dispositivos de gama baja.
- Investigación en arquitecturas Transformer para juegos de tablero: sirve como punto de partida para estudiar cómo los mecanismos MoE y el enrutamiento dinámico afectan al rendimiento en dominios con espacios de estado discretos.
- Comparación de algoritmos de aprendizaje por refuerzo: al estar entrenado con MCTS y self-play, puede utilizarse como referencia para evaluar otros métodos de entrenamiento en entornos de juego.
- Enseñanza de conceptos de IA: su código y documentación son accesibles, lo que lo convierte en un recurso didáctico para explicar Transformers, MoE y aprendizaje por refuerzo en cursos universitarios.
- Desarrollo de agentes autónomos para juegos de estrategia: aunque está especializado en Reversi, su arquitectura puede adaptarse a otros juegos de tablero con representación similar, sirviendo como base para experimentos.
- Benchmarking de eficiencia de modelos: al comparar su rendimiento (63% de victorias frente a un CNN de 63M parámetros) con el de otros modelos, se pueden analizar las ventajas de las arquitecturas Transformer en términos de relación parámetros-rendimiento.

## Benchmarks y rendimiento

El autor proporciona resultados de evaluación frente a un oponente aleatorio y frente al modelo CNN previo (ResNet de 63 millones de parámetros). No se han publicado resultados en benchmarks estándar como MMLU o HumanEval, ya que el modelo no está diseñado para tareas de lenguaje.

| Enfrentamiento | Tasa de victoria | Piedras finales medias |
|---|---|---|
| vs. oponente aleatorio | 100% (100/100 partidas) | 58 |
| vs. modelo CNN previo (63M) | 63% (63/100 partidas) | 47 |

Estos datos indican que el modelo es claramente superior al azar y supera a un modelo CNN mucho más grande en la mayoría de las partidas, aunque con un margen moderado.

## Requisitos de hardware

- VRAM estimada: no requiere GPU; el modelo tiene solo 1,68 millones de parámetros (20,6 MB), por lo que puede ejecutarse en CPU sin problemas.
- GPU recomendadas: no necesarias; cualquier CPU moderna es suficiente. Si se desea acelerar la inferencia, una GPU de gama baja (por ejemplo, NVIDIA GTX 1050) sería más que suficiente.
- Compatibilidad con hardware de consumo: sí, cabe en cualquier ordenador personal, Raspberry Pi o incluso en dispositivos móviles con TensorFlow Lite.
- Opciones de despliegue: el modelo se carga con TensorFlow/Keras mediante `tf.keras.models.load_model`. Puede integrarse en aplicaciones Python, servidores web o convertirse a TensorFlow Lite para entornos embebidos.
- Latencia y throughput: no se han publicado mediciones oficiales, pero dado el tamaño del modelo, la inferencia en CPU debería ser del orden de milisegundos por movimiento.

## Comparativa con modelos similares

No se dispone de información sobre otros modelos Transformer específicos para Reversi en la información proporcionada. La comparación más relevante es con el modelo CNN previo utilizado como referencia en el entrenamiento:

| Modelo | Arquitectura | Parámetros | Tasa de victoria vs. aleatorio | Tasa de victoria vs. CNN previo |
|---|---|---|---|---|
| Reversi-Transformer-1 | Transformer + MoE | 1,68M | 100% | 63% |
| ResNet CNN (modelo previo) | CNN | 63M | no disponible | - |

El modelo Transformer logra un rendimiento superior al CNN con 37 veces menos parámetros, lo que sugiere una mayor eficiencia paramétrica. No se han encontrado otros modelos comparables en la búsqueda web.

## Limitaciones y advertencias

- El modelo está especializado exclusivamente en Reversi/Othello; no puede procesar lenguaje natural ni realizar otras tareas.
- No se han documentado sesgos específicos, pero al estar entrenado con datos de autojuego de un modelo CNN, podría heredar ciertos sesgos estratégicos de ese modelo.
- Riesgo de alucinación: no aplica, ya que no genera texto.
- Limitaciones de contexto: la ventana de contexto es fija (64 tokens), correspondiente al tablero; no admite entradas de mayor tamaño.
- Restricciones de licencia: la licencia MIT permite uso comercial y modificación, pero el autor no ofrece garantías sobre el rendimiento en entornos de producción.
- Caveat para producción: el modelo fue entrenado con 10.000 partidas autogeneradas, lo que puede limitar su robustez frente a estrategias no vistas durante el entrenamiento. Se recomienda validar su comportamiento en escenarios reales antes de un despliegue crítico.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rsu/Reversi-Transformer-1
- Repositorio GitHub (ReversiGPT): https://github.com/rsu-Suba/ReversiGPT
- Código del modelo (transformer_TF.py): https://github.com/rsu-Suba/ReversiGPT/blob/main/AI/models/transformer_TF.py
