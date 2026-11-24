# Matheus8432/hess-chess-cnn-pytorch

## Resumen

Hess Chess CNN (PyTorch) es una red neuronal convolucional residual diseñada específicamente para jugar al ajedrez, desarrollada por Matheus Covre de Queiroz como parte del proyecto Hess, descrito en su trabajo *Inteligência artificial aplicada ao xadrez: arquiteturas neurais e uma arena interativa*. El modelo representa la posición mediante 19 planos espaciales y procesa 70 tokens de posición a través de 256 canales y 16 bloques residuales, prediciendo logits independientes para las 64 casillas de origen y las 64 casillas de destino.

El modelo resuelve el problema de selección de jugada en ajedrez mediante una arquitectura de dos cabezas de política (origen y destino) complementada con una cabeza escalar de valor. A diferencia de aproximaciones tipo AlphaZero que requieren búsqueda en árbol, esta CNN puntúa directamente posiciones individuales sin explorar movimientos futuros, lo que la hace computacionalmente ligera pero limita su fuerza de juego.

Es relevante como ejemplo didáctico de aplicación de deep learning al ajedrez y como componente base para experimentos de IA en juegos de tablero. Con 19.063.490 parámetros y un tamaño de repositorio de 0,1 GB, es un modelo compacto que puede ejecutarse en CPU. No obstante, su fuerza de juego (Elo) no ha sido medida y el proyecto se encuentra en una fase inicial, con cero descargas y sin licencia especificada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | CNN residual (residual CNN) |
| Parámetros totales | 19.063.490 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrada de 70 tokens de posición y 19 planos espaciales) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (con conversión documentada a .pth para PyTorch) |

## Arquitectura y entrenamiento

La arquitectura es una red neuronal convolucional residual que representa la posición de ajedrez mediante 19 planos espaciales de 8x8. La red utiliza 256 canales y 16 bloques residuales, y procesa 70 tokens de posición. La salida se compone de dos cabezas de política que predicen logits separados para las 64 casillas de origen y las 64 casillas de destino, más una cabeza escalar de valor. La puntuación de una jugada legal se calcula sumando los logits de su casilla de origen y de destino.

El entrenamiento fue supervisado, utilizando posiciones extraídas de hasta 100.000 partidas por fuente. Las fuentes documentadas son `games.csv` (atribuido a Kaggle en las notas del proyecto, aunque la URL exacta no está documentada) y `dataset_500k_elite.csv`, generado con movimientos de apertura aleatorios y Stockfish a profundidades 1–5. No se documenta el uso de RLHF ni DPO. El ejemplo de inferencia utiliza únicamente las dos cabezas de política, aunque el modelo también dispone de la cabeza de valor.

## Capacidades

- Predicción de jugadas de ajedrez en notación UCI (por ejemplo, `e2e4`) a partir de una posición en formato FEN.
- Puntuación de movimientos legales mediante la suma de logits de origen y destino.
- Detección de fin de partida (el script de inferencia informa si el juego ha terminado).
- Evaluación escalar de posiciones mediante la cabeza de valor.
- Inferencia en CPU verificada para movimientos legales en varias posiciones.
- No soporta tool calling, function calling, agentes, razonamiento multi-step, capacidades multilingües ni visión.
- No dispone de modo de pensamiento (thinking mode) ni búsqueda en árbol: puntúa una posición individual sin explorar movimientos futuros.

## Casos de uso

- **Motor de ajedrez didáctico**: el modelo puede integrarse en entornos educativos para ilustrar cómo una CNN aprende a seleccionar jugadas a partir de representaciones de tablero, gracias a su arquitectura compacta y ejecución en CPU.
- **Arena interactiva en navegador**: el proyecto Hess incluye una arena web local que permite seleccionar el modelo y jugar una partida completa en el navegador, adecuada para demostraciones y pruebas de concepto.
- **Generación de datasets de ajedrez**: la cabeza de valor y las cabezas de política pueden emplearse para etiquetar posiciones con puntuaciones, útil en pipelines de aumento de datos para otros modelos.
- **Prototipado de arquitecturas de game AI**: con 19 millones de parámetros y formato safetensors, sirve como base para experimentar con variantes de CNN residual aplicadas a juegos de tablero.
- **Evaluación comparativa de representaciones**: los 19 planos espaciales y los 70 tokens de posición permiten estudiar el impacto de distintas codificaciones de estado en el rendimiento de la red.
- **Análisis de jugadas legales**: el script de inferencia puede puntuar movimientos legales en una posición dada, lo que permite construir herramientas de análisis estático sin búsqueda.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La fuerza de juego y el Elo del modelo permanecen sin medir según la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 (19 millones de parámetros, aproximadamente 76 MB de pesos), aunque no se especifica oficialmente.
- GPU recomendadas: no disponible; el modelo está verificado para inferencia en CPU.
- Cabe en cualquier GPU consumer (RTX 4090, RTX 3060, etc.) e incluso en CPU sin GPU dedicada.
- Opciones de despliegue: PyTorch nativo (script `inference.py`), conversión a `.pth` para la arena Hess, y carga mediante `safetensors`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hess Chess CNN (PyTorch) | 19.063.490 | no disponible | CNN residual, sin búsqueda | no disponible | Hugging Face |
| AlphaZero (referencia) | no disponible | no disponible | MCTS + red neuronal | no disponible | No público |
| Leela Chess Zero | no disponible | no disponible | MCTS + red neuronal | GPL | Público |
| Stockfish NNUE | no disponible | no disponible | Evaluación NNUE + búsqueda alfa-beta | GPL | Público |

No se dispone de datos de rendimiento comparativo (Elo, precisión de jugadas) para establecer una comparación cuantitativa con estas alternativas.

## Limitaciones y advertencias

- La fuerza de juego (Elo) no ha sido medida; no hay evidencia cuantitativa de su nivel competitivo.
- La política puntúa una posición individual sin búsqueda de movimientos futuros, lo que limita su calidad de juego frente a motores con búsqueda.
- Las cabezas de origen y destino asignan la misma puntuación a opciones de promoción con casillas idénticas, lo que puede producir ambigüedad en la selección de pieza de promoción.
- La selección de movimientos rompe empates según el orden devuelto por python-chess, lo que introduce un sesgo determinista no controlado.
- La licencia no está especificada, lo que impide determinar si el uso comercial está permitido.
- No se documentan sesgos conocidos ni riesgos de alucinación en el sentido de modelos de lenguaje, pero al ser un modelo de política entrenado con datos de Stockfish a profundidades 1–5, puede heredar sesgos de esas partidas.
- El repositorio GitHub del proyecto requiere acceso actualmente, lo que dificulta la reproducibilidad completa.
- El modelo no soporta idiomas, tool calling ni capacidades de agente; su alcance se limita a la selección de jugadas de ajedrez.

## Enlaces

- [Hugging Face: Matheus8432/hess-chess-cnn-pytorch](https://huggingface.co/Matheus8432/hess-chess-cnn-pytorch)
- [Repositorio GitHub del proyecto Hess (acceso restringido)](https://github.com/matheusCovre/xadrez_tcc#jogar)
- [Guía de instalación de uv](https://docs.astral.sh/uv/getting-started/installation/)
