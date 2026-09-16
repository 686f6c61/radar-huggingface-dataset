# CyanMonkey/Test-S1

## Resumen

CyanMonkey/Test-S1 es una red neuronal de ajedrez publicada por el usuario CyanMonkey en Hugging Face. No se trata de un modelo de lenguaje: es un motor de ajedrez basado en una ResNet de 10 bloques y 128 canales, con 44.983.457 parámetros, que produce de forma simultánea una distribución de política sobre 20.480 movimientos legales y una estimación de probabilidad de victoria en el rango [-1, 1].

El entrenamiento se dividió en dos fases: aprendizaje supervisado sobre partidas de Lichess de 1800+ Elo y, después, aprendizaje por refuerzo mediante autojuego. La entrada es una representación de 19 planos de 8x8 (12 planos de piezas, turno, enroques, captura al paso y reloj de movimientos) y la salida de política emplea una codificación plana del movimiento: (from_square * 64 + to_square) * 5 + promotion_type.

La relevancia del modelo es, a día de hoy, limitada y experimental: el repositorio acumula 0 descargas y 0 likes, ocupa 0,2 GB, fue creado y actualizado el mismo día (16 de septiembre de 2026) y no publica resultados de benchmarks ni Elo final. Su interés principal es como referencia técnica para quien investigue arquitecturas ResNet pequeñas aplicadas a ajedrez o pipelines de autojuego con PyTorch.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet de 10 bloques y 128 canales (backbone convolucional) con dos cabezas: política (20480 logits) y valor (probabilidad de victoria en [-1, 1]) |
| Parametros totales | 44.983.457 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (no es un modelo de lenguaje; la entrada es un tablero de 8x8 con 19 planos) |
| Tipos de cuantizacion | No disponible (el autor solo publica pesos en safetensors y no documenta cuantizaciones) |
| Idiomas soportados | No aplica (no procesa lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | safetensors (según las etiquetas del repositorio y el tamaño del mismo, 0,2 GB) |

## Arquitectura y entrenamiento

La red sigue un esquema tipo AlphaZero simplificado. El backbone es una ResNet de 10 bloques con 128 canales por bloque. Sobre las características extraídas se sitúan dos cabezas: una cabeza de política que emite 20.480 logits, correspondientes al vocabulario completo de movimientos codificados como (from_square * 64 + to_square) * 5 + promotion_type, y una cabeza de valor que devuelve una probabilidad de victoria normalizada en el intervalo [-1, 1]. La codificación del tablero usa 19 planos de entrada de 8x8: 12 planos de piezas (6 tipos × 2 colores), más planos para el turno, los derechos de enroque, la captura al paso y el reloj de movimientos.

El entrenamiento se describe en dos fases. La fase 1 es aprendizaje supervisado sobre partidas de Lichess de jugadores con 1800+ Elo, lo que sitúa la política inicial en un nivel de juego Intermedio-alto. La fase 2 es aprendizaje por refuerzo mediante autojuego. No se especifican en la información disponible el número de tokens ni de posiciones usadas, la composición exacta del dataset, el algoritmo de RL concreto (por ejemplo, PPO o MCTS guiado), ni si se aplicaron etapas de ajuste con preferencias humanas. Tampoco se documenta ninguna innovación técnica adicional (decodificación especulativa, atención lineal u otras), ya que no se trata de un transformer.

## Capacidades

- Evaluación posicional de ajedrez: genera una estimación de probabilidad de victoria por posición en el rango [-1, 1].
- Selección de movimientos: produce una distribución sobre 20.480 movimientos codificados, lo que permite elegir jugada por muestreo o por argmax.
- Análisis de partidas: la combinación de política y valor permite puntuar posiciones y detectar desviaciones respecto al movimiento preferido por la red.
- Aprendizaje por refuerzo: la arquitectura está preparada para autojuego (fase 2 declarada por el autor).
- Inferencia en PyTorch: los pesos se distribuyen en safetensors y el pipeline declarado en Hugging Face es reinforcement-learning.
- Capacidades no documentadas: no hay información sobre soporte de tool calling, function calling, uso como agente, modo de razonamiento explícito, multimodalidad o cualquier otra capacidad propia de modelos de lenguaje. Tampoco se documenta soporte del protocolo UCI ni scripts de inferencia.

## Casos de uso

- Análisis de partidas en una interfaz de ajedrez: el modelo puede emplearse para evaluar posiciones y señalar jugadas que se alejan de la política aprendida, útil para revisión post-partida, siempre que el integrador escriba el adaptador de inferencia correspondiente, ya que el repositorio no documenta soporte UCI.
- Etiquetado de datasets de ajedrez: dado que devuelve simultáneamente política y valor, sirve para anotar posiciones con una estimación de probabilidad de victoria y con el movimiento preferido, alimentando pipelines de entrenamiento posteriores.
- Investigación en aprendizaje por refuerzo: el modelo es un punto de partida reproducible para experimentar con autojuego sobre una red pequeña (44,98 M de parámetros) y comparar variantes de arquitectura o de esquema de recompensa.
- Ajuste fino sobre un repertorio propio: al ser una ResNet compacta con licencia MIT, es viable reentrenar las cabezas o el backbone sobre partidas de un club o de un jugador concreto para sesgar el estilo de juego.
- Motor embebido u offline: con 44,98 M de parámetros, los pesos ocupan aproximadamente 180 MB en float32 y unos 90 MB en float16, de modo que el modelo puede ejecutarse en CPU o en GPU integrada sin conexión, por ejemplo en aplicaciones de escritorio o móviles.
- Banco de pruebas de arquitecturas: por su tamaño contenido y su naturaleza autocontenida, resulta útil como baseline en estudios que comparen ResNets de distinta profundidad o número de canales aplicadas a ajedrez.
- Docencia y divulgación: permite ilustrar de forma práctica cómo se codifica un tablero en planos, cómo se codifica un movimiento en un índice plano y cómo se combinan cabezas de política y valor en un mismo modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye Elo estimado, ni resultados frente a motores de referencia (Stockfish, Leela Chess Zero u otros), ni métricas de precisión de la política sobre conjuntos de validación, ni tasas de acierto de la cabeza de valor. Tampoco hay información sobre latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no publicada por el autor. Como referencia aritmética basada en el número de parámetros, los pesos ocupan aproximadamente 180 MB en float32, unos 90 MB en float16/bfloat16 y unos 45 MB en int8 (aunque el autor no publica versiones cuantizadas).
- GPU recomendadas: no disponible. Por tamaño, cualquier GPU con al menos 1 GB de memoria libre es suficiente; no se requiere A100, H100 ni tarjetas de gama alta.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU de consumo e incluso en GPU integrada, dado el reducido tamaño del modelo. No hay mediciones publicadas que lo confirmen.
- Opciones de despliegue: el repositorio solo ofrece pesos en safetensors para PyTorch. No se documenta compatibilidad con vLLM, llama.cpp, Ollama, TGI ni con formatos GGUF, que en cualquier caso están orientados a modelos de lenguaje y no aplicarían a esta arquitectura. La exportación a ONNX o TorchScript no está documentada.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de datos verificables en la información proporcionada para construir una comparativa numérica con alternativas de la misma categoría (redes de ajedrez tipo AlphaZero o Leela Chess Zero, o evaluadores NNUE integrados en motores como Stockfish). La model card no publica parámetros de referencia, contexto, rendimiento ni resultados de enfrentamientos.

| Modelo | Parámetros | Entrada | Licencia | Rendimiento publicado |
|---|---|---|---|---|
| CyanMonkey/Test-S1 | 44.983.457 | Tablero 8x8, 19 planos | MIT | No disponible |
| Leela Chess Zero (redes neuronales) | No disponible | No disponible | No disponible | No disponible |
| Stockfish (evaluador NNUE) | No disponible | No disponible | No disponible | No disponible |
| AlphaZero (referencia publicada) | No disponible | No disponible | No disponible | No disponible |

Únicamente puede afirmarse que Test-S1 pertenece a la familia de redes con cabezas de política y valor entrenadas por autojuego, y que su licencia MIT es más permisiva que la de algunos proyectos de motores de ajedrez con licencias copyleft.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay Elo final, ni resultados contra otros motores, ni métricas de validación, por lo que se desconoce su nivel real de juego tras la fase de autojuego.
- Validación comunitaria nula: 0 descargas y 0 likes en el momento de la consulta, sin issues ni discusiones públicas que permitan contrastar el comportamiento del modelo.
- Estado experimental: el propio nombre del repositorio ("Test-S1") y el hecho de que se creara y actualizara el mismo día apuntan a un artefacto de prueba más que a un modelo mantenido.
- Sesgo de datos: la fase supervisada se apoya en partidas de Lichess de 1800+ Elo, de modo que la política hereda el estilo, las aperturas y los sesgos de esa población de jugadores y de esa plataforma.
- Riesgo de mala generalización: no se documenta el rendimiento en posiciones de finales, tablas teóricas, posiciones poco frecuentes o reglas especiales, donde una red entrenada principalmente con partidas de nivel intermedio puede degradarse.
- Política de movimientos restringida al vocabulario codificado: la codificación (from_square * 64 + to_square) * 5 + promotion_type cubre los movimientos del juego estándar, pero no se documenta cómo se gestionan movimientos ilegales en la salida, por lo que el integrador debe aplicar una máscara de legalidad.
- Ausencia de soporte documentado: no hay scripts de inferencia, adaptador UCI ni instrucciones de uso, lo que incrementa el coste de integración.
- Licencia MIT: permite uso comercial y modificación con atribución y conservación del aviso de copyright, pero no ofrece garantías; al no existir documentación adicional del autor, no hay condiciones específicas más allá del texto estándar de MIT.
- Fechas del repositorio: la fecha de creación registrada es el 16 de septiembre de 2026, dato que conviene verificar antes de citarlo.
- Riesgo de alucinación: no aplica en el sentido habitual, ya que el modelo no genera lenguaje natural; el riesgo equivalente es una evaluación de posición errónea o sobreconfiada, sin métricas publicadas de calibración.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CyanMonkey/Test-S1
- Resultados de la búsqueda web: no se encontraron enlaces relevantes. La única referencia devuelta fue la página de inicio de sesión de WhatsApp Web (https://web.whatsapp.com/), sin relación con el modelo.
- Paper, blog, repositorio de código o demo: no disponibles en la información proporcionada.
