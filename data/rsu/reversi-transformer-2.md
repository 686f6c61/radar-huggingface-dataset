# rsu/Reversi-Transformer-2

## Resumen

Reversi-Transformer-2 es un modelo de inteligencia artificial para jugar a Reversi (también conocido como Othello) desarrollado por el usuario rsu. A diferencia de los enfoques tradicionales basados en redes convolucionales (CNN), este modelo emplea una arquitectura Transformer con mezcla de expertos (Mixture-of-Experts, MoE) para tomar decisiones sobre el tablero de 8x8. El modelo predice tanto la política (distribución de probabilidad sobre los 64 movimientos posibles) como el valor de la posición (probabilidad de victoria y diferencia de piedras esperada).

El modelo se presenta en dos variantes: el modelo normal `M2.keras` con 1,98 millones de parámetros y el modelo pequeño `M2_small.keras` con 756 mil parámetros. Ambos comparten la misma arquitectura base, diferenciándose en el número de bloques, dimensiones de embedding y número de expertos. El modelo fue entrenado mediante auto-juego (self-play) con 30.000 partidas generadas por el modelo predecesor Reversi-Transformer-1, utilizando Monte Carlo Tree Search (MCTS) con 256 simulaciones. Su relevancia radica en demostrar la aplicabilidad de arquitecturas modernas de Transformer con MoE a dominios de juegos de mesa, ofreciendo una alternativa eficiente y ligera a los enfoques clásicos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con Mixture-of-Experts (MHA experts + FFN experts) |
| Parametros totales | 1,98M (M2) / 756K (M2_small) |
| Parametros activos | no disponible (routing top-k, no se especifica el número de activos por token) |
| Longitud de contexto | 64 tokens (representación del tablero 8x8) |
| Tipos de cuantizacion | no disponible (modelo en formato Keras, sin cuantización publicada) |
| Idiomas soportados | no aplica (modelo de juego, no de lenguaje) |
| Licencia | MIT |
| Formato de pesos | .keras (formato nativo de Keras/TensorFlow) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura Transformer con bloques denominados "DynamicAssembly". Cada bloque contiene un conjunto de expertos de atención multi-cabeza (MHA) y un conjunto de expertos de red feed-forward (FFN) con activación SwiGLU. El enrutamiento se realiza mediante routers independientes que seleccionan el experto más relevante (top-1) basándose en la representación media del tablero combinada con una incrustación de paso. Se aplica una pérdida auxiliar de balanceo de carga durante el entrenamiento para garantizar una utilización uniforme de los expertos.

La entrada es un tensor de dimensiones (8, 8, 3) que codifica las piedras propias, las del oponente y los movimientos legales. Esta representación se convierte en 64 tokens, a los que se añaden incrustaciones de token, fila, columna y movimiento. La salida se divide en dos cabezas: una cabeza de política que predice la distribución sobre los 64 movimientos, y una cabeza de valor que utiliza atención con pooling para estimar la tasa de victoria y la diferencia de piedras, ambas en el rango [-1, 1].

El entrenamiento se realizó con datos de auto-juego generados por Reversi-Transformer-1, utilizando MCTS con 256 simulaciones, tamaño de lote 8 y constante PUCT de 2,5. Se generaron 30.000 partidas. El modelo se optimizó con AdamW (clipnorm 1.0, weight decay 0.01), tasa de aprendizaje inicial 2e-4 con programación WarmupCosineDecay (2 épocas de calentamiento), tamaño de lote 512 y 30 épocas.

## Capacidades

- Predicción de movimientos legales: genera una distribución de probabilidad sobre las 64 posiciones del tablero, indicando los movimientos más prometedores.
- Evaluación de posición: estima la tasa de victoria esperada (win rate) y la diferencia de piedras final (score difference) en el rango [-1, 1].
- Juego autónomo: puede jugar partidas completas de Reversi sin intervención humana, seleccionando movimientos según la política aprendida.
- Análisis de partidas: permite evaluar posiciones intermedias y proporcionar una valoración cuantitativa de la ventaja de cada jugador.
- Adaptabilidad a diferentes niveles de juego: la variante pequeña (M2_small) ofrece una opción más ligera con menor coste computacional, adecuada para entornos con recursos limitados.
- Integración con TensorFlow/Keras: al ser un modelo Keras estándar, puede cargarse y utilizarse fácilmente en pipelines existentes de TensorFlow.

## Casos de uso

- Motor de IA para aplicaciones de Reversi: el modelo puede integrarse en aplicaciones de escritorio, web o móviles para proporcionar un oponente de IA. Su pequeño tamaño (40 MB) permite ejecutarlo en dispositivos con recursos limitados, como Raspberry Pi o smartphones.
- Herramienta de análisis para jugadores: los jugadores pueden usar el modelo para analizar partidas, obtener evaluaciones de posición y descubrir movimientos óptimos. La salida de valor (win rate y score difference) ofrece una métrica clara de la ventaja posicional.
- Entrenamiento de agentes de refuerzo: el modelo puede servir como oponente o como generador de datos de auto-juego para entrenar otros agentes, gracias a su capacidad de producir partidas de alta calidad con MCTS.
- Investigación en arquitecturas MoE: al ser un modelo pequeño y de código abierto, es un banco de pruebas ideal para estudiar el comportamiento de mezcla de expertos en dominios de juego, incluyendo el efecto del enrutamiento top-k y la pérdida de balanceo de carga.
- Demostración educativa: el modelo y su código asociado (disponible en GitHub) pueden utilizarse en cursos de aprendizaje automático para ilustrar la aplicación de Transformers a problemas no lingüísticos, así como el uso de MCTS y auto-juego.
- Benchmark de eficiencia: dado su tamaño reducido, puede emplearse para medir el rendimiento de frameworks de inferencia (TensorFlow, TFLite, etc.) en tareas de juego en tiempo real, comparando latencias y consumo de memoria.

## Benchmarks y rendimiento

La model card proporciona resultados de evaluación frente a un oponente aleatorio y frente al modelo predecesor Reversi-Transformer-1. No se han publicado comparaciones con otros modelos de Reversi.

| Métrica | vs Random | vs Reversi-Transformer-1 |
|---|---|---|
| Tasa de victoria | 100% (100/100 partidas) | 54% (54/100 partidas) |
| Piedras finales promedio | 59 | 38 |

Estos resultados indican que el modelo supera claramente al azar y muestra una ligera mejora sobre el modelo anterior, aunque con una ventaja modesta. No se dispone de datos de rendimiento en términos de latencia o throughput.

## Requisitos de hardware

- VRAM estimada: el modelo M2 ocupa 40,4 MB en float32, por lo que requiere menos de 1 GB de VRAM. El modelo M2_small ocupa 15,7 MB, aún menos.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente. Incluso puede ejecutarse en CPU sin problemas, dado el bajo número de parámetros.
- Compatibilidad con GPU de consumo: sí, cualquier GPU moderna (serie GTX 10xx o superior, RTX, etc.) puede ejecutar el modelo sin dificultad.
- Opciones de despliegue: al ser un modelo Keras, puede desplegarse con TensorFlow Serving, TFLite para dispositivos móviles, o mediante frameworks de inferencia como ONNX Runtime si se convierte. También puede ejecutarse en navegador con TensorFlow.js.
- Latencia y throughput: no se han publicado mediciones oficiales, pero dado el tamaño del modelo, se espera una inferencia en el orden de milisegundos en GPU y de decenas de milisegundos en CPU.

## Comparativa con modelos similares

No se dispone de información sobre otros modelos de Reversi basados en Transformer con los que comparar directamente. El único punto de referencia es el modelo predecesor Reversi-Transformer-1, que se utilizó para generar los datos de entrenamiento y como oponente en la evaluación. La comparativa con ese modelo se muestra en la sección de benchmarks. No se han encontrado otros modelos públicos de Reversi con arquitectura Transformer en la información disponible.

## Limitaciones y advertencias

- Especialización exclusiva en Reversi: el modelo no es generalista y no puede utilizarse para otras tareas fuera del juego de Reversi.
- Dependencia de la representación de entrada: el modelo espera una entrada específica de (8, 8, 3) con codificación de piedras propias, oponente y movimientos legales. Cualquier variación en la representación requeriría reentrenamiento.
- Rendimiento limitado frente a oponentes fuertes: aunque supera al azar y al modelo previo, su tasa de victoria del 54% contra el predecesor sugiere que no es un jugador de nivel experto. No se ha evaluado contra motores de Reversi de alto nivel.
- Sin soporte de lenguaje: al ser un modelo de juego, no procesa texto ni instrucciones en lenguaje natural.
- Formato de pesos propietario: los pesos se almacenan en formato .keras, que requiere TensorFlow/Keras para cargarse. No se proporcionan conversiones a otros formatos (por ejemplo, ONNX o GGUF).
- Fecha de creación futura: el modelo fue creado el 1 de septiembre de 2026, lo que puede indicar que es un proyecto reciente o experimental. Se recomienda verificar la estabilidad del código y la documentación antes de usarlo en producción.

## Enlaces

- HuggingFace: https://huggingface.co/rsu/Reversi-Transformer-2
- Repositorio GitHub: https://github.com/rsu-Suba/ReversiGPT
- Demo web: https://reversi-gpt.suba.pro/
- Modelo predecesor Reversi-Transformer-1: https://huggingface.co/rsu/Reversi-Transformer-1
