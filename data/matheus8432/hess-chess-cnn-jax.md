# Matheus8432/hess-chess-cnn-jax

## Resumen

Hess Chess CNN (JAX/Flax) es un modelo neuronal especializado en la evaluación de posiciones de ajedrez, desarrollado por Matheus Covre de Queiroz (usuario Matheus8432) en el contexto de su proyecto de fin de grado titulado *Inteligência artificial aplicada ao xadrez: arquiteturas neurais e uma arena interativa*. El modelo implementa una CNN residual en JAX/Flax que transforma una posición de ajedrez en 19 planos espaciales de entrada y predice, mediante dos cabezas de política independientes, logits para las 64 casillas de origen y las 64 casillas de destino de una jugada.

La relevancia del modelo es acotada pero específica: se trata de un artefacto reproducible y ligero (0,1 GB de repositorio) pensado para integrarse en la arena web del proyecto Hess, que permite jugar partidas completas contra distintos modelos desde el navegador. No es un modelo de lenguaje general ni un motor de ajedrez de fuerza competitiva; su valor reside en la arquitectura didáctica y en la reproducibilidad del pipeline de inferencia con Python 3.12 y `uv`. No se dispone de licencia declarada, idiomas soportados ni resultados de fuerza medidos (Elo), lo que limita su uso en producción sin evaluación adicional.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | CNN residual (residual CNN) con 16 bloques residuales y 256 canales |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrada fija de 70 tokens de posición y 19 planos espaciales) |
| Tipos de cuantización | no disponible (checkpoint Flax en `model.msgpack`) |
| Idiomas soportados | no disponible (dominio específico de ajedrez, sin procesamiento de lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | Flax checkpoint serializado en `model.msgpack` |

## Arquitectura y entrenamiento

El modelo es una CNN residual que codifica la posición mediante 19 planos espaciales (representación tipo AlphaZero, con planos para cada tipo de pieza de cada bando, historial de repeticiones, enroques, etc.) y 70 tokens de posición. El tronco convolutional emplea 256 canales y 16 bloques residuales. La salida se divide en tres cabezas: dos cabezas de política que producen logits independientes para las 64 casillas de origen y las 64 casillas de destino, y una cabeza de valor escalar. La selección de jugada en el ejemplo de inferencia puntúa cada movimiento legal sumando los logits de origen y destino correspondientes, sin búsqueda de árbol.

El entrenamiento es supervisado sobre posiciones extraídas de hasta 100 000 partidas por fuente. Las fuentes citadas en la model card son `games.csv` (atribuido a Kaggle, sin URL documentada) y `dataset_500k_elite.csv`, generado con jugadas de apertura aleatorias y Stockfish a profundidades 1–5. No se documenta número total de tokens de entrenamiento, composición exacta del dataset, ni uso de RLHF/DPO (no aplica a este dominio). No se reporta ninguna innovación técnica destacable como decodificación especulativa o atención lineal.

## Capacidades

- Evaluación de posiciones de ajedrez y predicción de jugadas en notación UCI (por ejemplo, `e2e4`).
- Puntuación de movimientos legales mediante suma de logits de origen y destino.
- Cabeza de valor escalar que estima la bondad de la posición (no utilizada en el ejemplo de selección de jugada).
- Integración con `python-chess` para la generación y validación de jugadas legales.
- Inferencia reproducible en CPU mediante script `inference.py`.
- Integración en arena web local (FastAPI + `uvicorn`) para jugar partidas completas contra el modelo.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, multilingüismo ni modalidades distintas del tablero de ajedrez.

## Casos de uso

- **Análisis de posiciones en un pipeline de ajedrez**: el modelo puntúa cada movimiento legal de una posición FEN dada y devuelve la mejor jugada en UCI, útil para generar anotaciones automáticas o sugerencias en herramientas de estudio.
- **Arena de juego local contra modelos**: la arena Hess permite seleccionar el modelo CNN JAX y jugar partidas completas desde el navegador, sirviendo como banco de pruebas comparativo entre arquitecturas del proyecto.
- **Generación de datasets etiquetados de ajedrez**: al puntuar posiciones de forma determinista en CPU, el modelo puede usarse para etiquetar corpus de posiciones con jugadas sugeridas y valores escalares.
- **Docencia e investigación en arquitecturas neuronales para ajedrez**: la combinación de 19 planos, 16 bloques residuales y cabezas desacopladas de origen/destino constituye un ejemplo reproducible para estudiar representaciones tipo AlphaZero en JAX/Flax.
- **Prototipado de motores ligeros sin búsqueda**: dado que puntúa una única posición sin búsqueda futura, es adecuado como componente base de un motor de jugada inmediata para demos interactivas de baja latencia.
- **Validación de pipelines de inferencia Flax**: el checkpoint `model.msgpack` y el script `inference.py` permiten verificar de extremo a extremo el flujo de carga de pesos, preprocesado de FEN y decodificación de jugadas en entornos Python 3.12.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que la fuerza de juego y el Elo permanecen sin medir, y que la verificación se limitó a comprobar la legalidad de movimientos en inferencia CPU sobre varias posiciones.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repositorio completo ocupa 0,1 GB, por lo que el checkpoint cabe holgadamente en GPUs de consumo y probablemente en memoria unificada de Apple Silicon.
- GPU recomendadas: no disponible; la model card documenta verificación en CPU, no en GPU.
- ¿Cabe en consumer GPU? Sí, por el tamaño del artefacto (0,1 GB), aunque no se especifica el consumo de memoria en runtime.
- Opciones de despliegue: inferencia directa con Python 3.12 y `inference.py`; arena web local con `uvicorn` y FastAPI (`hess.web_app:app`); descarga de pesos vía `huggingface_hub`.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Representación | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hess Chess CNN (JAX/Flax) | no disponible | no disponible (entrada fija de 70 tokens y 19 planos) | 19 planos, 256 canales, 16 bloques residuales | no disponible | Hugging Face (0 descargas, 0 likes) |
| Alternativas tipo AlphaZero (p. ej., Leela Chess Zero) | no disponible en esta ficha | no aplica | Redes residuales con planos e historial | no disponible | no disponible |
| Motores clásicos con búsqueda (Stockfish) | no aplica | no aplica | Búsqueda alfa-beta con evaluación heurística | no disponible | no disponible |

No se dispone de datos suficientes para establecer una comparativa numérica fiable con alternativas de la misma categoría; los modelos citados se incluyen solo como referencia conceptual.

## Limitaciones y advertencias

- Fuerza de juego y Elo sin medir; no hay evidencia de rendimiento competitivo frente a motores clásicos o redes AlphaZero entrenadas a gran escala.
- Selección de jugada sin búsqueda: la política puntúa una única posición y no explora líneas futuras, lo que limita la calidad táctica.
- Las cabezas de origen y destino asignan la misma puntuación a elecciones de promoción con casillas idénticas, por lo que la elección de pieza de promoción no se resuelve de forma diferenciada.
- Los desempates entre movimientos se resuelven según el orden devuelto por `python-chess`, introduciendo un sesgo determinista no aprendido.
- Dataset de entrenamiento parcialmente no documentado: la URL exacta del dataset de Kaggle no está registrada y la composición de `dataset_500k_elite.csv` depende de Stockfish a profundidades 1–5.
- Licencia no disponible: no se puede confirmar el uso comercial ni la redistribución de pesos.
- Idiomas y contexto no aplicables: el modelo no procesa lenguaje natural, por lo que no debe evaluarse con métricas de LLM.
- Riesgo de alucinación no aplica en sentido estricto, pero la política puede producir puntuaciones no calibradas para posiciones fuera de la distribución de entrenamiento.
- Repositorio GitHub de la arena con acceso restringido en el momento de la publicación, lo que dificulta la reproducción independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Matheus8432/hess-chess-cnn-jax
- Repositorio de la arena Hess (acceso restringido): https://github.com/matheusCovre/xadrez_tcc#jogar
- Guía de instalación de uv: https://docs.astral.sh/uv/getting-started/installation/
