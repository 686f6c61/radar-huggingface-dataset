# domino14/macondo-value-nets

## Resumen

Macondo value nets es un conjunto de tres redes neuronales de valor (value networks) desarrolladas por domino14 para el motor de juegos de tablero tipo crucigrama (Scrabble y similares) [Macondo](https://github.com/domino14/macondo). Dada una posición resultante de un movimiento candidato, cada red predice la probabilidad de que el jugador que realizó ese movimiento acabe ganando la partida. El bot `FAST_ML_BOT` de Macondo evalúa los 50 mejores movimientos según equity estática con la red y juega el de mayor probabilidad de victoria prevista, sin búsqueda hacia adelante.

Es relevante porque un único pase hacia adelante por candidato iguala el rendimiento de una simulación Monte Carlo de 2 plies, con un coste computacional mucho menor. Los modelos están distribuidos en formato ONNX dentro de un repositorio organizado como model repository de Triton, con variantes para los léxicos NWL23 (inglés) y CSW24 (Collins). El repositorio pesa unos 0,1 GB y la licencia es GPL-3.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (red de valor para juego de tablero) |
| Parametros totales | 9,6M (`macondo-tf`, `macondo-tf-csw`); 3,7M (`macondo-tf-selfplay`) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplicable (entrada estructurada: tablero 15x15 + escalares) |
| Tipos de cuantizacion | no disponible (solo pesos ONNX en fp32) |
| Idiomas soportados | no aplicable (léxicos NWL23 y CSW24 para Scrabble en inglés) |
| Licencia | GPL-3.0 |
| Formato de pesos | ONNX (repositorio con estructura de Triton Inference Server) |

Variantes disponibles:

| Modelo | Léxico | Arquitectura | Parametros |
|---|---|---|---|
| `macondo-tf` (por defecto) | NWL23 y otros léxicos ingleses | 12 capas × 256, 8 cabezas | 9,6M |
| `macondo-tf-csw` | CSW24 (Collins) | 12 capas × 256, 8 cabezas | 9,6M |
| `macondo-tf-selfplay` | NWL23 | 8 capas × 192, 6 cabezas | 3,7M |

## Arquitectura y entrenamiento

Las tres redes son transformadores que procesan una representación estructurada de la posición: un tensor `board` de tipo float32 con forma `[batch, 85, 15, 15]` (85 planos: 26 por letra en el tablero, 1 para fichas comodín, 26 horizontales y 26 verticales de cross-checks, 4 para casillas de premio vacías y 2 de historial), y un vector `scalars` de 72 dimensiones float32 con información como la reserva del jugador, fichas no vistas, puntuación del movimiento candidato, balance vocales/consonantes y ventaja en el marcador. Las salidas incluyen el valor principal (`value`, P(victoria) − P(derrota) en [−1, 1]) y cabezas auxiliares: cambio previsto de spread, probabilidad de bingo del rival y su puntuación siguiente prevista.

El entrenamiento se realizó desde cero sobre partidas de autojuego de HastyBot: 81M de partidas para `macondo-tf` y `macondo-tf-csw`, y 54M para el predecesor de `macondo-tf-selfplay`. Se hicieron seis pasadas sobre las partidas, extrayendo en cada una un turno aleatorio fresco por partida. La pérdida es entropía cruzada de win/draw/loss en la cabeza principal, más las cabezas auxiliares y cuatro cabezas "espaciales" por casilla usadas solo en entrenamiento. El optimizador fue AdamW con tasa de aprendizaje 3e-4 y decaimiento coseno. `macondo-tf-selfplay` es el modelo de 54M de partidas afinado con 3M de partidas propias, mezcladas al 50 % con partidas de HastyBot.

## Capacidades

- Predicción del resultado de una posición de Scrabble: probabilidad de victoria, derrota y empate para el jugador que movió, en un único pase hacia adelante.
- Predicción del cambio de spread (diferencia de puntos) hasta el final de la partida, escalado como tanh(puntos / 130).
- Predicción de la probabilidad de que el rival haga un bingo en su siguiente turno.
- Predicción de la puntuación siguiente del rival en puntos.
- Selección de movimientos sin búsqueda: el bot `FAST_ML_BOT` puntúa los 50 mejores candidatos por equity estática y elige el de mayor P(win) prevista.
- Soporte de múltiples léxicos ingleses: NWL23 (variante por defecto) y CSW24 (Collins).
- Ejecución en CPU mediante ONNX Runtime o en GPU mediante Triton con motores TensorRT.
- No es un modelo de lenguaje: no genera texto, no soporta tool calling ni capacidades multilingues.

## Casos de uso

- Bot de Scrabble de nivel competitivo sin búsqueda profunda: integrando las redes en Macondo, un bot juega movimientos con un 58,4 % de victorias frente a HastyBot con un solo pase de red por candidato, ideal para aplicaciones donde la latencia importa.
- Evaluación rápida de posiciones en análisis de partidas: un analista puede etiquetar miles de posiciones con su probabilidad de victoria para estudiar errores de juego en partidas humanas.
- Entrenamiento por autojuego de motores: las redes sirven como evaluador barato dentro de bucles de self-play o MCTS, sustituyendo simulaciones Monte Carlo superficiales.
- Investigación en IA de juegos de tablero: la receta completa de entrenamiento está publicada (`pytorch/TRAINING.md`), lo que permite replicar el enfoque para otros léxicos o alfabetos.
- Servicios de juego en línea: desplegable con Triton Inference Server y TensorRT en GPU para atender muchos jugadores concurrentes con evaluaciones por movimiento de bajo coste.
- Comparación de estrategias y ablations: las tres variantes (base, Collins, self-play) permiten estudiar el efecto del léxico y del fine-tuning con partidas propias sobre el rendimiento.

## Benchmarks y rendimiento

Resultados publicados en la model card (100.000 pares de partidas con robas idénticas y asientos intercambiados; empates cuentan como medio; ± es el intervalo del 95 %):

| Modelo | vs HastyBot | Head to head |
|---|---|---|
| `macondo-tf` | 58,42 % ± 0,18 | Gana a la red 8×192 en las mismas partidas 50,64 % ± 0,16 |
| `macondo-tf-csw` | 58,55 % ± 0,18 | Gana a la red 8×192 en las mismas partidas 50,37 % ± 0,16 |
| `macondo-tf-selfplay` | 57,07 % ± 0,18 | Gana a su predecesor de 54M de partidas 50,37 % ± 0,16 |

Comparativa frente a simulación Monte Carlo (5.000 pares en NWL23):

| Enfrentamiento | Win rate | Spread |
|---|---|---|
| `macondo-tf` vs simulación 2-ply | 49,94 % ± 0,78 | −0,6 por partida |
| Simulación 2-ply vs HastyBot (referencia) | 58,62 % ± 1,61 | no disponible |
| Simulación 5-ply vs HastyBot (referencia) | 62,80 % ± 1,58 | no disponible |

La conclusión de los autores: un pase hacia adelante por candidato iguala a una simulación de 2 plies, pero las redes no sustituyen a simulaciones profundas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; los modelos son muy pequeños (3,7M y 9,6M de parámetros, repo total de 0,1 GB), por lo que el consumo de memoria es marginal en GPU moderna.
- GPU recomendadas: no disponible; para TensorRT/Triton los motores deben compilarse en la propia máquina y son específicos de cada GPU y versión de TensorRT, por lo que cualquier GPU compatible con TensorRT debería servir.
- Consumer GPU: dado el tamaño minúsculo de los modelos, cualquier GPU de consumo es más que suficiente; además, Macondo puede ejecutar las redes directamente en CPU a través de ONNX Runtime sin GPU.
- Opciones de despliegue: ONNX Runtime en CPU (`MACONDO_TRITON_USE_TRITON=false` con `MACONDO_ONNXRUNTIME_LIB` apuntando a libonnxruntime), o Triton Inference Server con motores TensorRT construidos localmente (`pytorch/fetch-models.sh` y `pytorch/build-engines.sh` desde un checkout de Macondo).
- Latencia y throughput: no disponible; el diseño (un pase hacia adelante por movimiento candidato frente a cientos de simulaciones) sugiere una latencia por evaluación muy baja, pero no hay cifras publicadas.

## Comparativa con modelos similares

No existen alternativas públicas ampliamente adoptadas de redes de valor para Scrabble con datos comparables publicados; la referencia de comparación es el propio ecosistema de Macondo:

| Modelo | Tipo | Parametros | Win rate vs HastyBot | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `macondo-tf` | Red de valor (transformer) | 9,6M | 58,42 % ± 0,18 | GPL-3.0 | ONNX público en HuggingFace |
| `macondo-tf-selfplay` | Red de valor (transformer) | 3,7M | 57,07 % ± 0,18 | GPL-3.0 | ONNX público en HuggingFace |
| HastyBot | Equity estática (sin ML) | no aplicable | referencia (baseline) | GPL-3.0 (parte de Macondo) | Incluido en Macondo |
| Simulación Monte Carlo 2-ply de Macondo | Búsqueda por simulación | no aplicable | 58,62 % ± 1,61 vs HastyBot | GPL-3.0 (parte de Macondo) | Incluido en Macondo |

## Limitaciones y advertencias

- Licencia GPL-3.0: cualquier obra derivada que distribuya los modelos debe hacerlo bajo la misma licencia, lo que puede restringir su integración en productos propietarios.
- Las redes no sustituyen a una simulación profunda: la simulación de 5 plies supera a HastyBot un 62,80 % ± 1,58, frente al 58,42 % de la red; para máxima fuerza de juego sigue siendo preferible la búsqueda con simulación.
- Cobertura limitada al inglés: los tres modelos están entrenados con léxicos ingleses (NWL23 y CSW24); usarlos con otros idiomas o alfabetos requiere reentrenar con la receta publicada.
- Los modelos dependen del formato exacto de entrada de Macondo (`game/mllayout.go` y `game/mlhelper.go`); construir las features a mano es propenso a errores y la vía recomendada es el propio código de features de Macondo.
- Los motores TensorRT no se publican: cada usuario debe compilarlos para su GPU y versión de TensorRT concreta.
- Macondo fija un commit concreto de este repositorio por versión; usar siempre la última revisión puede desincronizar los modelos del comportamiento probado del motor.
- Riesgo de alucinación, sesgos lingüísticos y restricciones de idioma de LLMs no aplican: no es un modelo de lenguaje.
- Métricas de comunidad prácticamente nulas (0 descargas, 1 like en el momento de la ficha), lo que sugiere una base de usuarios muy reducida.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/domino14/macondo-value-nets
- Repositorio del motor Macondo: https://github.com/domino14/macondo
- Guia de entrenamiento: https://github.com/domino14/macondo/blob/master/pytorch/TRAINING.md
- Registro de entrenamientos y partidas: https://github.com/domino14/macondo/blob/master/pytorch/RUNS.md
- Triton Inference Server: https://github.com/triton-inference-server/server
