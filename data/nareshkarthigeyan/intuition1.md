# nareshkarthigeyan/intuition1

## Resumen

Intuition1 es un motor de ajedrez basado en un transformer estándar de PyTorch, desarrollado por nareshkarthigeyan como proyecto de investigación en aprendizaje por refuerzo. El modelo recibe como entrada una representación de 64 tokens del tablero (una por casilla) y produce una distribución de probabilidad sobre 4.096 clases de movimiento posibles, lo que le permite predecir el siguiente movimiento sin realizar búsqueda explícita. Se entrena mediante destilación de Stockfish: cada posición se etiqueta con el mejor movimiento del motor (objetivo de política) y su evaluación (objetivo de valor), siguiendo un esquema similar a AlphaZero pero con un transformer en lugar de una red convolucional.

El proyecto incluye un ecosistema completo: scripts de preparación de datos, entrenamiento, evaluación contra bots aleatorios y Stockfish con profundidad limitada, exportación de partidas en PGN y generación de animaciones GIF/WebM/MP4, además de un playground web en Flask para jugar contra el modelo e inspeccionar sus capas internas. Con un tamaño de repositorio de 0,4 GB, es un modelo compacto pensado para experimentación y aprendizaje, no para competir con motores de élite. Su relevancia radica en demostrar que un transformer puede aprender a jugar ajedrez de forma razonable mediante destilación, sin necesidad de búsqueda en árbol.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TransformerEncoder (PyTorch) con cabezas de política y valor |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 64 tokens (representación del tablero) |
| Tipos de cuantizacion | no disponible (checkpoint en punto flotante) |
| Idiomas soportados | no aplica (modelo de ajedrez, no de lenguaje) |
| Licencia | MIT |
| Formato de pesos | checkpoint.pt (PyTorch) |

## Arquitectura y entrenamiento

El modelo utiliza una arquitectura de transformer estándar con un encoder (PyTorch TransformerEncoder) que procesa una secuencia de 64 tokens, cada uno representando una casilla del tablero de ajedrez. La salida del encoder alimenta dos cabezas: una cabeza de política que produce una distribución sobre 4.096 clases de movimiento (combinaciones origen-destino) y una cabeza de valor que estima la evaluación de la posición para el lado al que le toca mover, en el rango [-1, 1]. En inferencia, las predicciones se enmascaran para restringirlas a movimientos legales mediante la librería python-chess.

El entrenamiento se realiza por destilación: el dataset se construye a partir de partidas PGN, y cada posición se etiqueta con el mejor movimiento de Stockfish (a profundidad 15 por defecto) como objetivo de política, y con la evaluación de Stockfish como objetivo de valor. La pérdida combina la entropía cruzada de la política con el error cuadrático medio del valor, en un esquema inspirado en AlphaZero. No se utiliza RLHF ni DPO; el aprendizaje es supervisado a partir de las etiquetas del profesor. El script `prepare_dataset.py` permite ajustar la profundidad o el tiempo de cálculo de Stockfish, y `run_train.py` entrena el modelo desde los arrays NumPy cacheados.

## Capacidades

- Predicción de movimientos legales de ajedrez a partir de una posición dada, con enmascaramiento automático de movimientos ilegales.
- Evaluación de posiciones: la cabeza de valor estima la ventaja del bando al que le toca mover.
- Juego autónomo contra un humano (modo terminal o playground web) o contra otros bots.
- Integración con Stockfish en modo híbrido: permite enrutar jugadas entre el transformer y Stockfish con una proporción configurable (50-70%).
- Exportación de partidas en formato PGN y generación de animaciones GIF, WebM y MP4 para visualización.
- Inspección de activaciones por capa del encoder mediante una "lente de logits" enmascarada, útil para análisis de interpretabilidad.
- Entrenamiento y evaluación reproducibles mediante scripts CLI, con soporte para sanity checks de sobreajuste.

## Casos de uso

- Análisis de partidas de ajedrez: el modelo puede evaluar posiciones y sugerir movimientos, sirviendo como herramienta didáctica para jugadores aficionados que quieran entender alternativas tácticas.
- Generación de partidas de entrenamiento: al jugar contra sí mismo o contra bots, se pueden exportar partidas en PGN para alimentar otros sistemas o crear bases de datos de aperturas.
- Investigación en aprendizaje por refuerzo: el proyecto sirve como banco de pruebas para estudiar destilación de políticas, arquitecturas transformer en dominios de tablero y técnicas de enmascaramiento de salida.
- Demostración de ajedrez sin búsqueda: permite comparar el rendimiento de un modelo puramente neuronal frente a motores clásicos con búsqueda, evaluando el Elo estimado en partidas contra Stockfish de baja profundidad.
- Enseñanza de conceptos de IA: el playground Flask y la lente de logits facilitan la visualización de cómo un transformer procesa información posicional, útil en cursos de machine learning.
- Creación de contenido audiovisual: la generación automática de GIFs y vídeos de partidas puede emplearse para ilustrar artículos, tutoriales o publicaciones en redes sociales sobre ajedrez e IA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El evaluador `evaluate_elo.py` ejecuta 20 partidas contra un bot aleatorio y 20 contra Stockfish a profundidad 1, y produce una estimación de Elo, pero no se han compartido los valores numéricos en la documentación pública.

## Requisitos de hardware

- El tamaño del repositorio (0,4 GB) sugiere un modelo pequeño, probablemente con menos de 10 millones de parámetros, aunque el dato exacto no está disponible.
- Inferencia en CPU: viable para jugar partidas en tiempo real, dado el bajo coste computacional de un transformer pequeño con 64 tokens de entrada.
- Inferencia en GPU: cualquier GPU consumer (por ejemplo, RTX 3060 o superior) sería más que suficiente; incluso una GPU integrada podría manejar el modelo.
- VRAM estimada: menos de 1 GB para el checkpoint en punto flotante de 32 bits; con cuantización (no disponible) sería aún menor.
- Despliegue: el proyecto incluye un servidor Flask para el playground web; también puede ejecutarse como script CLI (`play.py`). No se menciona soporte para vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia: no se proporcionan datos, pero para un transformer de este tamaño, la inferencia debería ser de milisegundos en CPU moderna.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Fuerza de juego | Licencia |
|---|---|---|---|---|---|
| Intuition1 | Transformer sin búsqueda | no disponible | 64 tokens | Baja (solo supera a bot aleatorio) | MIT |
| Leela Chess Zero | Red residual con búsqueda MCTS | ~40M (red típica) | 64x8x8 (tablero) | Nivel de gran maestro | GPL-3.0 |
| Stockfish | Motor clásico con búsqueda alfa-beta | no aplica | no aplica | Nivel de campeón mundial | GPL-3.0 |

Intuition1 no es comparable en fuerza a Leela Chess Zero o Stockfish; su propósito es experimental. Leela Chess Zero utiliza una arquitectura de red residual convolucional y búsqueda Monte Carlo, mientras que Stockfish emplea búsqueda alfa-beta con evaluaciones heurísticas. Intuition1 se distingue por su simplicidad (transformer puro sin búsqueda) y su licencia permisiva MIT.

## Limitaciones y advertencias

- Fuerza de juego limitada: al no usar búsqueda, el modelo es significativamente más débil que motores tradicionales; solo se ha validado contra un bot aleatorio y Stockfish a profundidad 1.
- Datos de entrenamiento no especificados: no se indica el volumen ni la procedencia de las partidas PGN utilizadas, lo que puede introducir sesgos en el estilo de juego.
- Riesgo de alucinación en movimientos: aunque se enmascaran los movimientos ilegales, la política puede sugerir jugadas estratégicamente pobres en posiciones complejas.
- Sin soporte multilingüe ni capacidades de lenguaje: es un modelo puramente de ajedrez, no apto para tareas de NLP.
- Dependencia de Stockfish para el etiquetado: la calidad del entrenamiento depende de la precisión del profesor; si Stockfish no está instalado, la destilación no puede ejecutarse.
- Documentación incompleta: no se publican métricas de rendimiento, número de parámetros ni detalles de arquitectura (capas, dimensiones), lo que dificulta la reproducibilidad externa.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantías ni soporte; el proyecto parece ser un trabajo individual de investigación.

## Enlaces

- [Hugging Face: nareshkarthigeyan/intuition1](https://huggingface.co/nareshkarthigeyan/intuition1)
- [LinkedIn: "Intuition1" - mi creación - el motor de ajedrez sin búsqueda](https://www.linkedin.com/posts/nareshkarthigeyan_4n-intuition1-my-brainchild-the-activity-7479853000124141568-RPZb)
- [LinkedIn: Entrenando el motor de ajedrez Intuition con Transformers y secuencias de ajedrez](https://www.linkedin.com/posts/nareshkarthigeyan_2n-to-follow-up-on-my-process-on-training-activity-7479013735341363200-uGXS)
