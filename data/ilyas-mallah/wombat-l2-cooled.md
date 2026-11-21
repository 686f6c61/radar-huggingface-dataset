# ilyas-mallah/wombat-l2-cooled

## Resumen

Wombat L2 (cooled) es una red de política para ajedrez de 5.596.077 parámetros desarrollada por ilyas-mallah. El modelo reutiliza dos bloques transformer con pesos compartidos aplicados de forma recurrente durante un número configurable de pasos (T) por posición, un esquema de test-time compute que permite gastar más cómputo en la inferencia sin aumentar el número de parámetros. Es un artefacto de investigación de un proyecto pausado, no un motor de ajedrez de producción.

El interés técnico reside en la pregunta que explora: si aplicar más pasos del mismo núcleo recurrente mejora la calidad de juego con pesos idénticos. Los resultados muestran que la mejora satura en la profundidad entrenada (8 pasos con gradiente, hasta 8 pasos de prefijo sin gradiente) y decae más allá. La precisión de Lichess alcanza su máximo en T = 12 y cae en T = 32, y el estado oculto converge a un punto fijo en puzzles difíciles en lugar de simular líneas de jugadas.

El modelo usa entradas con características calculadas a mano (ataques, clavadas, rayos X e intercambios) además de los 64 tokens de casilla y un token de estado, y produce logits de movimiento por casilla sobre un códec de 4.672 acciones, junto con valores de posición y por movimiento como distribuciones de 64 bins. Está publicado bajo licencia Apache-2.0 con pesos en safetensors y un checkpoint en formato PyTorch.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer recurrente (2 bloques con pesos compartidos: RMSNorm, atención, SwiGLU), sin step embedding |
| Parámetros totales | 5.596.077 (float32) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrada fija: 64 tokens de casilla + 1 token de estado) |
| Tipos de cuantización | no disponible (pesos en float32; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (modelo específico de ajedrez, sin capacidades de lenguaje natural) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`) y PyTorch (`wombat-l2-cooled.pt`), más `config.json` |
| Anchura / cabezas / anchura MLP | 384 / 8 / 1.536 |
| Códec de acciones | 4.672 acciones por casilla |
| Checkpoint | Paso 115.000 (100.000 de un schedule de 400.000 + 15.000 de cooldown de LR), pesos EMA (decay 0,999) |
| Pasos recurrentes (T) | Configurable vía opción UCI `ReasoningSteps`; por defecto 8 |

## Arquitectura y entrenamiento

El núcleo es un transformer recurrente de dos bloques con pesos compartidos que se aplican T veces sobre la misma representación de posición. La entrada combina 64 tokens de casilla (tablero orientado al lado que mueve) más un token de estado, enriquecidos con características de ajedrez calculadas a mano: ataques, clavadas, rayos X e intercambios. La salida son logits de movimiento por casilla sobre un códec de 4.672 acciones y valores de posición y por movimiento modelados como distribuciones de 64 bins.

El entrenamiento usó posiciones de la base de evaluación de Lichess: Stockfish 19 puntuó cada movimiento legal en 10.092.005 posiciones (4,0 millones a 50.000 nodos y 6,1 millones a 20.000 nodos), con un cuarto de cada batch compuesto por posiciones de puzzles de Lichess. El objetivo de política es una distribución suave sobre todos los movimientos legales, `exp(-(W_best - W_i) / 4)` sobre las probabilidades de victoria de Stockfish. Se entrenó con batch de 128, AdamW a LR 5e-4 con weight decay 0,05, en bf16 con CUDA graphs, sobre una RTX 5090 de 32 GB alquilada desde el 24 de septiembre de 2026. Cada batch ejecuta un prefijo aleatorio sin gradiente de 0 a 8 pasos y después 8 pasos con gradiente; la partición de datos se hace por hash de la posición, excluyendo los conjuntos de evaluación.

## Capacidades

- Juego de ajedrez mediante política directa: genera un movimiento por posición a partir de una pasada de T pasos recurrentes, sin búsqueda.
- Test-time compute ajustable: la opción UCI `ReasoningSteps` controla T, permitiendo intercambiar latencia por calidad dentro de los límites observados.
- Evaluación de posición y de movimiento: produce valores como distribuciones de 64 bins, útiles para análisis de posiciones.
- Integración como motor UCI: se ejecuta mediante `wombat uci --checkpoint wombat-l2-cooled.pt` y responde a comandos estándar de motor.
- No dispone de tool calling, function calling, capacidades de agente, multilingüismo, visión ni audio.
- No aprende ajedrez desde los bits del tablero de forma pura: depende de características de ajedrez precalculadas.

## Casos de uso

- Investigación sobre test-time compute en transformers recurrentes: replicar el experimento de variar T y medir la saturación de calidad con pesos congelados, usando los scripts del repositorio y el checkpoint publicado.
- Análisis de posiciones sin búsqueda: obtener valores de posición y por movimiento como distribuciones para estudiar correlaciones con evaluaciones de Stockfish en conjuntos de datos propios.
- Generación de etiquetas de política para destilación o imitación: usar las distribuciones suaves de movimiento como objetivo para entrenar redes más pequeñas o para aumentar datos de ajedrez.
- Evaluación comparativa de arquitecturas recurrentes frente a redes feed-forward de tamaño similar en tareas de ajedrez, con métricas de precisión de Lichess y tasa de errores graves.
- Estudio de la dinámica del estado oculto: el análisis incluido en el repositorio muestra convergencia a punto fijo en puzzles difíciles, lo que permite investigar cuándo y por qué el bucle deja de aportar información.
- Prototipado de motores UCI ligeros: por su tamaño (5,6 millones de parámetros), cabe en GPUs de consumo y sirve para probar integraciones de motor en herramientas de análisis o interfaces de ajedrez, aceptando su nivel de juego limitado.
- Validación de pipelines de datos de ajedrez: usar el modelo como referencia débil para comprobar la corrección de features (ataques, clavadas, rayos X, intercambios) y del códec de 4.672 acciones.

## Benchmarks y rendimiento

Partidas contra Stockfish 19 a 50.000 nodos por movimiento y nivel UCI_Elo fijado; 100 partidas emparejadas por nivel, modelo a T = 8.

| Nivel Stockfish (UCI_Elo) | Wombat L2 (cooled) | ChessBench 9M |
|---|---|---|
| 1320 | 0,890 (88 victorias, 2 tablas, 10 derrotas) | 0,995 |
| 1500 | 0,645 | 0,995 |
| 1700 | 0,365 | 0,960 |
| 2000 | 0,250 | 0,865 |
| 2300 | 0,180 | 0,705 |
| 2600 | 0,030 | 0,515 |
| Fuerza completa | 0,000 | 0,010 |

Otras métricas publicadas:

| Prueba | Wombat L2 (cooled) | ChessBench 9M |
|---|---|---|
| Puzzles del split de test (10.000, solo si todos los movimientos son correctos) | 80,8% a T = 32 | 87,4% |
| Precisión de Lichess en 2.000 posiciones juzgadas por Stockfish | 88,8 a T = 12 | 93,3 |
| Tasa de movimientos con pérdida ≥ 20 puntos de probabilidad de victoria (42.242 posiciones de ChessBench) | 2,14% a T = 8 | 0,38% |

Autopartidas (300 partidas, un checkpoint, una semilla, 150 aperturas): T = 64 frente a T = 1 puntuó 0,928; T = 64 frente a T = 8 puntuó 0,305; T = 8 frente a T = 1 puntuó 0,968. El test registrado (100 Elo en 1.000 partidas emparejadas en dos semillas) quedó sin jugar.

## Requisitos de hardware

- VRAM estimada para inferencia: unos 22 MB en float32 para los 5.596.077 parámetros, más el estado intermedio de 65 tokens y los búferes de activación; en la práctica, el consumo lo dominan el runtime de PyTorch y CUDA, no los pesos.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA; el entrenamiento se hizo en una RTX 5090 de 32 GB, pero la inferencia es holgada en GPUs de consumo como RTX 3060, RTX 4060 o RTX 4090.
- Cabe en GPU de consumo: sí, con margen amplio.
- Opciones de despliegue: el paquete `wombat` del repositorio (instalación con `pip install -e .` y ejecución como motor UCI); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles; dependen de T (`ReasoningSteps`) y del hardware, sin cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Rendimiento (niveles UCI_Elo 1320–2600) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Wombat L2 (cooled) | 5,6 M | 65 tokens fijos, T pasos recurrentes | 0,890 / 0,645 / 0,365 / 0,250 / 0,180 / 0,030 | Apache-2.0 | Pesos en Hugging Face |
| ChessBench 9M (DeepMind) | 9 M | Tablero, red feed-forward | 0,995 / 0,995 / 0,960 / 0,865 / 0,705 / 0,515 | no disponible en la información | Referencia publicada en ChessBench |
| Stockfish 19 (referencia de etiquetas) | no disponible | Motor con búsqueda, 50.000 nodos | Fuerza completa como adversario | GPL-3.0 | Programa separado, no incluido |

## Limitaciones y advertencias

- No es un motor fuerte: pierde 0,030 contra Stockfish 19 a UCI_Elo 2600 y 0,000 a fuerza completa; queda por debajo de ChessBench 9M en todas las métricas publicadas.
- Más pasos recurrentes no mejoran indefinidamente: la precisión de Lichess toca techo en T = 12 y cae en T = 32; el estado oculto converge a un punto fijo en puzzles difíciles y no simula cálculo sobre líneas de jugadas.
- No incorpora búsqueda: el movimiento sale de una única pasada de T pasos sobre la posición.
- Depende de características de ajedrez calculadas a mano, por lo que no aprende ajedrez desde los bits del tablero; errores en esas features afectan directamente a la calidad.
- Tasa de errores graves superior a la referencia: pierde 20 o más puntos de probabilidad de victoria en 2,14% de movimientos (T = 8) frente al 0,38% de ChessBench 9M.
- El test de escalado registrado (100 Elo en 1.000 partidas emparejadas en dos semillas) no se jugó; los resultados de autopartidas provienen de 300 partidas en una sola semilla y aperturas, por lo que son indicativos y no confirmatorios.
- Los anclajes UCI_Elo de Stockfish no son consistentes bajo límite de nodos; deben compararse puntuaciones por nivel, no ratings implícitos.
- Proyecto pausado y artefacto de investigación con 0 descargas y 0 likes en el momento del registro; sin garantía de mantenimiento.
- Licencia Apache-2.0 para pesos y código; las posiciones de entrenamiento provienen de bases de Lichess (CC0) y las etiquetas de Stockfish 19 (GPL-3.0, ejecutado como programa separado), con detalles en `THIRD_PARTY.md`.
- Sin soporte de lenguaje natural ni multilingüismo; no apto para aplicaciones de texto, agentes o tool calling.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ilyas-mallah/wombat-l2-cooled
- Repositorio del proyecto (registro de investigación, plan y análisis): https://github.com/ilyas-mallah/wombat
- Análisis de pasos de pensamiento (`docs/thinking-steps-analysis-l2.md`): https://github.com/ilyas-mallah/wombat/blob/main/docs/thinking-steps-analysis-l2.md
- Plan de evaluación (`docs/plan.md`): https://github.com/ilyas-mallah/wombat/blob/main/docs/plan.md
- Licencias de terceros (`THIRD_PARTY.md`): https://github.com/ilyas-mallah/wombat/blob/main/THIRD_PARTY.md
- ChessBench (DeepMind), referencia comparativa: https://github.com/google-deepmind/searchless_chess
