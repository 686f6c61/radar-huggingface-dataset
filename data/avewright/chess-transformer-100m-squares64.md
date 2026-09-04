# avewright/chess-transformer-100m-squares64

## Resumen

El modelo `avewright/chess-transformer-100m-squares64` es un transformer recurrente de ajedrez con aproximadamente 99 millones de parámetros, desarrollado por el autor `avewright`. Está diseñado para generar movimientos de ajedrez y evaluar posiciones mediante una arquitectura que atiende exclusivamente a las 64 casillas del tablero, en lugar de tratar la partida como una secuencia de tokens. Esta aproximación permite que el modelo procese la información espacial del tablero de forma más directa, incorporando el turno, el enroque y la captura al paso mediante capas FiLM.

La arquitectura combina capas de prefijo y sufijo con un banco de desenrollados recurrentes, alcanzando una profundidad efectiva de 29 capas. El modelo utiliza un vocabulario compacto de 1968 movimientos y ha sido entrenado con una mezcla de datos de Lichess (soft MultiPV) y tablas de finales Syzygy. Está disponible bajo licencia MIT, lo que permite su uso comercial y académico sin restricciones significativas. Su relevancia radica en ser una propuesta experimental de arquitectura eficiente para dominios con estructura espacial, como el ajedrez, y en ofrecer un checkpoint abierto para la investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer recurrente (Squares64Recurrent) con atención sobre 64 casillas y FiLM para turno/enroque/EP |
| Parametros totales | 98,97 millones (~99M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (la atención se aplica a las 64 casillas del tablero) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (modelo específico de ajedrez, no de lenguaje) |
| Licencia | MIT |
| Formato de pesos | PyTorch (checkpoint `.pt`) |

## Arquitectura y entrenamiento

La arquitectura `Squares64Recurrent` es un transformer que opera sobre las 64 casillas del tablero. El estado de la partida se codifica mediante embeddings de casillas aprendidos, y la información de turno, enroque y captura al paso se inyecta mediante capas FiLM. El tronco del modelo se compone de 4 capas de prefijo, un banco de 7 capas recurrentes con 3 desenrollados cada una, y 4 capas de sufijo, lo que resulta en una profundidad efectiva de 29 capas. La configuración incluye `encoder_dim` de 256, `hidden_dim` de 736, 8 cabezas de atención, `ffn_ratio` de 4, `dropout` de 0.05, `use_swiglu` activado y `use_qk_norm` activado. La cabeza de política tiene una dimensión de 384, y la cabeza de valor predice 3 clases.

Los datos de entrenamiento no están detallados en la información disponible. Sin embargo, el autor menciona una mezcla de "Soft MultiPV" (probablemente posiciones de Lichess con etiquetas MultiPV suavizadas) y tablas de finales Syzygy. El checkpoint `latest.pt` corresponde al paso 12500, actualizado el 2026-09-04. No se especifica si se utilizó RLHF o DPO; el modelo parece entrenado mediante aprendizaje supervisado con etiquetas de movimientos y valores. El vocabulario de movimientos es compacto (`MOVE_VOCAB_VERSION=compact`), con 1968 entradas.

## Capacidades

- Generación de movimientos de ajedrez mediante una cabeza de política de 384 dimensiones.
- Evaluación de posiciones a través de una cabeza de valor con 3 clases.
- Atención espacial sobre las 64 casillas, en lugar de procesar la partida como una secuencia de tokens.
- Inyección de metadatos de posición (turno, enroque, captura al paso) mediante capas FiLM.
- Arquitectura recurrente con desenrollados, que permite una profundidad efectiva de 29 capas con menos parámetros.
- Conocimiento de finales de ajedrez gracias a la mezcla de tablas Syzygy durante el entrenamiento.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no aplica.

## Casos de uso

- Análisis de partidas en tiempo real: el modelo, con solo 99M de parámetros, puede ejecutarse con baja latencia en aplicaciones de análisis en vivo, sugiriendo movimientos y evaluando posiciones mientras se juega.
- Estudio de finales: gracias al entrenamiento con tablas Syzygy, el modelo puede ofrecer sugerencias precisas en finales, integrándose en herramientas de entrenamiento específicas.
- Generación de aperturas: puede proponer movimientos en la fase de apertura, combinado con bases de datos de aperturas para asistir a jugadores en preparación.
- Investigación en arquitecturas eficientes: sirve como referencia para estudiar transformers recurrentes con atención sobre casillas y comparar su rendimiento con modelos basados en secuencias.
- Educación ajedrecística: puede utilizarse para generar ejercicios tácticos y puzzles, proporcionando retroalimentación automática sobre la calidad de los movimientos.
- Aplicaciones de entretenimiento con recursos limitados: su tamaño compacto permite ejecutarlo en dispositivos con poca memoria, como aplicaciones móviles o sistemas embebidos, para ofrecer un oponente de ajedrez.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible oficialmente. Con ~99M parámetros, en FP32 ocuparía aproximadamente 400 MB, y en FP16 unos 200 MB, por lo que cabría en cualquier GPU con más de 1 GB de VRAM.
- GPU recomendadas: no disponible. Dado el tamaño, una GPU como la RTX 3050 o superior sería suficiente para inferencia.
- Compatibilidad con GPU de consumo: sí, cualquier GPU moderna con al menos 2 GB de VRAM debería poder ejecutarlo.
- Opciones de despliegue: PyTorch, utilizando el módulo `chess_inference.load_checkpoint` mencionado en el repositorio de GitHub. No hay soporte oficial para vLLM, llama.cpp u otros runtimes.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| avewright/chess-transformer-100m-squares64 | ~99M | Transformer recurrente (Squares64) | 64 casillas | MIT | HuggingFace |
| avewright/chess-transformer-437m-ft3h | ~437M | Transformer (probablemente similar) | No disponible | No disponible | HuggingFace |

No se han encontrado otros modelos comparables en la búsqueda realizada. El modelo de 437M es del mismo autor y podría ofrecer mayor capacidad, pero no se dispone de información detallada sobre su arquitectura ni rendimiento.

## Limitaciones y advertencias

- Sesgos conocidos: no se han publicado evaluaciones de sesgos. Al ser un modelo de ajedrez, los sesgos podrían manifestarse en preferencias por ciertos estilos de juego según los datos de entrenamiento.
- Riesgo de alucinación: puede generar movimientos subóptimos o ilegales si la posición no está bien representada en los datos de entrenamiento.
- Limitaciones de contexto: el modelo solo atiende a las 64 casillas; no procesa texto ni otro tipo de información contextual.
- Restricciones de licencia: la licencia MIT permite uso comercial, modificación y distribución sin restricciones significativas.
- Caveat importante: con solo 99M parámetros, su rendimiento puede ser inferior al de motores de ajedrez tradicionales como Stockfish. El vocabulario compacto de 1968 movimientos puede limitar la expresividad en posiciones complejas.
- No se han proporcionado benchmarks ni métricas de rendimiento, por lo que no es posible validar su calidad frente a otros modelos.

## Enlaces

- HuggingFace: https://huggingface.co/avewright/chess-transformer-100m-squares64
- GitHub: https://github.com/avewright/transform
- Modelo relacionado: https://huggingface.co/avewright/chess-transformer-437m-ft3h
