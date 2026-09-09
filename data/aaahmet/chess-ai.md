# aaahmet/chess-ai

## Resumen

El modelo `aaahmet/chess-ai` es un motor de ajedrez basado en una red neuronal convolucional profunda desarrollado por Ahmet Dedeler. Se entrenó mediante aprendizaje supervisado sobre posiciones extraídas de partidas de nivel de maestro de Lichess. El proyecto está disponible con licencia MIT y se distribuye como un repositorio PyTorch que incluye el modelo preentrenado, los checkpoints de entrenamiento y los scripts de codificación del tablero y selección de movimiento.

El modelo resuelve la tarea de evaluar posiciones de ajedrez y sugerir movimientos, asignando probabilidades a un conjunto de 4,352 representaciones de movimientos legales y emitiendo una puntuación de valor entre -1 (ventaja negra) y +1 (ventaja blanca). Su relevancia radica en que es un modelo de tamaño reducido, fácil de ejecutar en CPU o en dispositivos con aceleración Apple Silicon, lo que lo hace apto para aplicaciones de análisis de partidas, entrenamiento de ajedrez y experimentación en entornos de aprendizaje por refuerzo. La arquitectura es una red residual de 3 bloques con 128 filtros convolucionales, sin ventana de contexto textual, ya que la entrada es un tensor de tablero de 8×8×18.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet convolucional con 3 bloques residuales de 128 filtros y cabezas duales de política y valor |
| Parametros totales | no disponible (el checkpoint de pesos `best_model.pth` pesa 119 MB, lo que sugiere una escala de ~30 millones en FP32) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (entrada de estado de tablero 8×8×18, no texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Inglés (código y documentación; el modelo no procesa lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | PyTorch `.pth` (`best_model.pth` y checkpoints de épocas) |
| Tamaño del checkpoint | 119 MB (`best_model.pth`) |
| Número de movimientos representados | 4,352 |

## Arquitectura y entrenamiento

El modelo utiliza una representación del estado del tablero como un tensor de 8×8×18, compuesto por 12 planos de piezas (6 tipos de piezas para cada color) y 6 planos de estado auxiliar: derechos de enroque, disponibilidad de captura al paso y turno activo. La red neuronal, definida en `model.py` como `ChessNet`, tiene 3 bloques residuales con 128 filtros convolucionales por bloque. Incluye dos cabezas de salida: la cabeza de política genera probabilidades para 4,352 representaciones de movimientos legales, mientras que la cabeza de valor produce una evaluación escalar de la posición entre -1 y +1. No se utilizó aprendizaje por refuerzo en el entrenamiento inicial; el entrenamiento es puramente supervisado con pérdida de entropía cruzada para la política y error cuadrático medio para el valor. El optimizador fue Adam con programación de tasa de aprendizaje y el framework fue PyTorch con soporte para CUDA y MPS (Apple Silicon). El conjunto de datos tiene un tamaño de aproximadamente 100,000 a 200,000 posiciones extraídas de partidas humanas de Lichess, y se guardaron checkpoints de progresión de las 10 épocas de entrenamiento.

## Capacidades

- Generación de probabilidades de movimiento sobre 4,352 representaciones legales de jugadas.
- Evaluación de posiciones con una puntuación continua en el intervalo [-1, +1].
- Inferencia local mediante PyTorch, con soporte explícito para aceleración por CUDA y Apple Silicon (MPS).
- Carga directa del modelo con `best_model.pth` para inferencia o reentrenamiento.
- Inclusión de scripts `board_encoder.py` y `play_engine.py` para convertir posiciones y seleccionar movimientos de forma autónoma.
- Sus tags en HuggingFace incluyen `reinforcement-learning`, lo que indica que el modelo puede adaptarse como base para esquemas de aprendizaje por refuerzo en ajedrez, aunque el entrenamiento publicado es supervisado.
- No es un modelo de lenguaje: no genera texto, no admite tool calling ni conversaciones multimodales. Su entrada y salida son estrictamente tableros y evaluaciones de ajedrez.

## Casos de uso

- Aplicación de análisis de partidas: se puede usar `board_encoder.py` para convertir cualquier posición FEN en el tensor de entrada, cargar `best_model.pth` y obtener la evaluación de la posición y los movimientos con mayor probabilidad. Al ser un modelo pequeño, la inferencia se ejecuta rápidamente en CPU, lo que permite integrarlo en herramientas de análisis de escritorio o web sin necesidad de GPU.
- Oponente de entrenamiento en aplicaciones de ajedrez: con `play_engine.py` el modelo puede seleccionar jugadas automáticamente, creando un rival de nivel aficionado que funciona sin conexión. El peso de 119 MB y el soporte MPS facilitan su ejecución en portátiles con Apple Silicon o en sistemas embebidos de bajo consumo.
- Detección de errores tácticos en partidas de estudiantes: al comparar la jugada humana con la evaluación del modelo, se pueden identificar pérdidas de ventaja o movimientos que reducen la puntuación de posición, lo que resulta útil en plataformas de entrenamiento y análisis de errores.
- Investigación en representación de tablero y arquitecturas de política-valor: el tensor 8×8×18 es un diseño clásico y simple; el modelo puede servir como referencia experimental en estudios sobre redes residuales convolucionales aplicadas a juegos de tablero.
- Generación de puzzles de táctica: la cabeza de política puede priorizar movimientos candidatos en posiciones tácticas, y la cabeza de valor permite verificar si una secuencia concreta mejora la posición. Esto se puede integrar en generadores automáticos de ejercicios de ajedrez.
- Entrenamiento de agentes de refuerzo: al ser un modelo de política y valor, puede utilizarse como componente inicial para un agente que aprende mediante auto-juego (self-play) u otras técnicas de RL, reutilizando la representación del tablero y las cabezas de salida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible oficialmente. El checkpoint de pesos pesa 119 MB, por lo que la carga completa en memoria es del orden de cientos de MB; en FP32 puede ejecutarse sin necesidad de GPU dedicada.
- GPU recomendadas: no disponible. El framework PyTorch con CUDA permite utilizar GPUs NVIDIA, mientras que MPS da soporte a Apple Silicon; no se especifican requisitos mínimos.
- Cabe en GPU de consumo: probablemente sí, al ser un modelo pequeño, aunque no se han publicado métricas de VRAM ni requisitos oficiales.
- Opciones de despliegue: carga directa en PyTorch (`torch.load("best_model.pth")`), con ejecución en CPU, CUDA o MPS. No se proporcionan scripts integrados con vLLM, TGI, Ollama ni llama.cpp.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni especificaciones completas que permitan una comparación rigurosa con motores de ajedrez de red neuronal como Leela Chess Zero o AlphaZero. El modelo presenta una arquitectura claramente más pequeña (3 bloques residuales) que esos sistemas, pero al no existir benchmarks publicados no se puede cuantificar su fuerza de juego.

## Limitaciones y advertencias

- Sin benchmarks publicados: se desconoce la fuerza real del modelo frente a motores tradicionales o redes neuronales de mayor escala.
- Conjunto de entrenamiento reducido (100,000–200,000 posiciones) y solo 10 épocas de entrenamiento; la generalización puede ser limitada en posiciones complejas o poco frecuentes.
- Al ser un modelo pequeño (3 bloques residuales), su evaluación de posiciones probablemente sea menos precisa que motores clásicos como Stockfish o redes mucho mayores como Leela Chess Zero.
- No se documenta en la model card si `play_engine.py` utiliza búsqueda (MCTS o minimax); el rendimiento en partidas depende completamente de esa lógica externa, no solo de la red.
- La licencia MIT permite uso comercial, pero los datos de entrenamiento provienen de Lichess; conviene revisar las condiciones de uso de los datos de Lichess antes de desplegar el modelo en un producto comercial.
- El proyecto se encuentra en una fase temprana: el repositorio de HuggingFace registra 0 descargas y 0 likes, y la documentación disponible es básica, por lo que puede haber errores o falta de mantenimiento.
- No se ofrecen ficheros de cuantización ni versiones optimizadas para inferencia en producción; el modelo solo se distribuye en formato `.pth` de PyTorch.
- El espacio de movimientos está fijado a 4,352 representaciones, un diseño estándar en motores de ajedrez basados en redes neuronales, pero debe validarse que cubra todos los movimientos legales posibles en las posiciones de interés.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/aaahmet/chess-ai
- Repositorio GitHub del autor: https://github.com/Ahmet-Dedeler/chess-ai
