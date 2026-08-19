# legacyaravind/shannons-gambit

## Resumen

Shannon's Gambit es un sistema de inteligencia artificial para ajedrez desarrollado por aravinds-kannappan, que combina múltiples agentes de aprendizaje por refuerzo con una red neuronal residual multi-cabeza. El sistema enruta cada posición a un agente especializado: finales exactos resueltos mediante iteración de valor (MDP), regímenes de bajo material con PPO y DQN, y apertura/medio juego con una red estilo AlphaZero-lite entrenada sobre partidas reales de Lichess. Su relevancia radica en demostrar un enfoque híbrido que integra métodos exactos, RL on-policy/off-policy y aprendizaje supervisado, coordinados por un router de fases.

La red principal, servida en este repositorio, es el jugador general de tablero completo y actúa como bootstrap para el self-play. Procesa 18 planos de 8x8 como entrada y produce policy logits sobre 4672 movimientos, un valor escalar en [-1, 1], logits de resultado (win/draw/loss) y una estimación de rating Elo estandarizado. El repositorio incluye el modelo entrenado, el checkpoint ladder (`ladder.json`) y el handler para Inference Endpoint, con un tamaño total de 62 GB. La licencia es Apache-2.0.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal residual multi-cabeza (estilo AlphaZero-lite) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (entrada de tablero 18x8x8) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (notación de ajedrez estándar) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch (`.pt`) |

## Arquitectura y entrenamiento

La red principal es una red neuronal convolucional residual con múltiples cabezas de salida, similar a las empleadas en AlphaZero. La entrada consiste en 18 canales de 8x8 que codifican el estado del tablero (piezas propias, piezas del oponente, repeticiones, enroque, etc.). Las cabezas de salida son: política (distribución sobre 4672 movimientos legales), valor (escalar en [-1, 1]), WDL (probabilidades de victoria, derrota y tablas) y rating (Elo estandarizado). El entrenamiento supervisado se realizó sobre partidas reales de Lichess durante 15 épocas, alcanzando una precisión de política de 0.966, precisión WDL de 0.9903 y un error absoluto medio de 21.1 Elo.

El sistema completo integra además agentes de refuerzo: un agente MDP que resuelve finales exactos (KRvK, KQvK) mediante iteración de valor, un agente PPO actor-crítico on-policy y un agente DQN off-policy con potential-based shaping para regímenes de bajo material. Un router de fases (`agents/router.py`) decide qué agente actúa según el material restante. El entrenamiento continúa mediante self-play, y las nuevas generaciones se versionan de vuelta al repositorio. Stockfish se utiliza únicamente como benchmark calibrado (con `UCI_LimitStrength` y `UCI_Elo`) para ajustar un Elo mediante Bradley-Terry MLE, nunca como generador de movimientos.

## Capacidades

- Generación de movimientos legales de ajedrez con distribución de política sobre 4672 movimientos.
- Predicción de valor posicional (escalar en [-1, 1]) y probabilidades de resultado (WDL).
- Estimación de rating Elo del jugador a partir de la posición.
- Juego completo de partidas de ajedrez, delegando en agentes especializados según la fase.
- Integración mediante API REST (FastAPI) con endpoints `/move`, `/predict`, `/watch-move`, `/ladder` y `/calibrate`.
- Compatibilidad con Inference Endpoint de Hugging Face mediante el handler `handler.py` que acepta FEN como entrada.
- Entrenamiento continuo por self-play con versionado de nuevas generaciones.

## Casos de uso

- Análisis de partidas de ajedrez: dado un FEN, el modelo devuelve el mejor movimiento, valor posicional, probabilidades de resultado y rating estimado, útil para herramientas de análisis y estudio.
- Entrenamiento de jugadores: permite generar partidas de práctica contra un oponente con nivel calibrado, ajustable mediante el benchmark de Stockfish.
- Integración en plataformas de ajedrez online: el endpoint `/move` puede conectarse a un frontend para ofrecer un oponente automático o un asistente de sugerencias en tiempo real.
- Investigación en RL multi-agente: el sistema sirve como banco de pruebas para estudiar la coordinación entre agentes exactos (MDP), on-policy (PPO) y off-policy (DQN) mediante un router de fases.
- Benchmarking de motores de ajedrez: el evaluador `eval/benchmark.py` permite medir el rendimiento de otros motores contra agentes con Elo calibrado, reportando centipawn loss y acuerdo top-1.
- Generación de datos de entrenamiento: el self-play continuo puede producir partidas etiquetadas con valor y WDL, útiles para entrenar otros modelos o validar teorías de evaluación posicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks comparativos con otros motores en la información disponible. El autor reporta las métricas finales del entrenamiento supervisado de la red, que se muestran a continuación. Estas métricas no son comparables con benchmarks estándar de motores de ajedrez (como Elo absoluto o test suites), y el Elo solo es significativo tras la calibración con Stockfish.

| Metrica | Valor |
|---|---|
| Pérdida de política (loss_policy) | 0.2169 |
| Pérdida de valor (loss_value) | 0.0305 |
| Pérdida WDL (loss_wdl) | 0.0295 |
| Pérdida de rating (loss_rating) | 0.0312 |
| Precisión de política (policy_acc) | 0.966 |
| Precisión WDL (wdl_acc) | 0.9903 |
| Error absoluto medio de rating (rating_mae_elo) | 21.1 |
| Épocas | 15 |

## Requisitos de hardware

No se especifican requisitos de hardware en la información proporcionada. El repositorio ocupa 62 GB, lo que sugiere que el modelo es de tamaño considerable, pero no se indica el número de parámetros ni la VRAM necesaria. Al ser una red convolucional residual (no un transformer), es probable que pueda ejecutarse en GPUs de consumo medio (p. ej., RTX 3060 o superior) con suficiente memoria, pero no hay datos confirmados. Para el self-play continuo, el autor advierte que en CPU gratuita el proceso es lento y que ráfagas de GPU aceleran el entrenamiento. Las opciones de despliegue incluyen un Space de Hugging Face con Docker y FastAPI, así como Inference Endpoints de Hugging Face. No se mencionan herramientas como vLLM u Ollama, dado que no es un modelo de lenguaje.

## Comparativa con modelos similares

No hay modelos directamente comparables en el sentido de sistemas de ajedrez con arquitectura multi-agente y calibración Elo. Se puede comparar cualitativamente con otros motores de ajedrez basados en redes neuronales:

| Modelo | Arquitectura | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|
| Shannon's Gambit | CNN residual multi-cabeza + agentes RL (MDP, PPO, DQN) | Supervisado + self-play + RL | Apache-2.0 | Código abierto en GitHub y Hugging Face |
| AlphaZero | CNN residual | Self-play con RL | Propietario | No disponible públicamente |
| Leela Chess Zero | CNN residual (estilo AlphaZero) | Self-play distribuido | GPL-3.0 | Código abierto |
| Stockfish | Búsqueda alfa-beta clásica | Evaluación heurística + ajuste | GPL-3.0 | Código abierto |

Shannon's Gambit se diferencia por su enfoque híbrido (agentes especializados por fase) y por usar Stockfish solo como benchmark, no como jugador. No se dispone de comparaciones numéricas de rendimiento con estos sistemas.

## Limitaciones y advertencias

- Los agentes MDP, PPO y reward son especialistas en finales (validados contra tablas exactas), mientras que la red neuronal solo cubre aperturas y medio juego. El router de fases es crítico para evitar errores en transiciones.
- El Elo reportado solo es significativo tras ser anclado con el benchmark de Stockfish; sin esa calibración, las estimaciones de rating pueden ser engañosas.
- El entrenamiento supervisado se realizó sobre partidas de Lichess, lo que puede introducir sesgos hacia estilos de juego populares en esa plataforma.
- El self-play en CPU gratuita es lento y puede generar una escalada de Elo poco fiable si no se calibra adecuadamente.
- No se proporcionan métricas de robustez frente a posiciones tácticas complejas o finales de largo alcance; la red puede fallar en situaciones fuera de su distribución de entrenamiento.
- La licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en producción ni soporte técnico.
- El repositorio no incluye documentación sobre el tamaño del modelo en parámetros, lo que dificulta estimar requisitos de hardware precisos.

## Enlaces

- Hugging Face: [legacyaravind/shannons-gambit](https://huggingface.co/legacyaravind/shannons-gambit)
- Repositorio GitHub: [aravinds-kannappan/Chess-Gambit-RL](https://github.com/aravinds-kannappan/Chess-Gambit-RL)
- Space de Hugging Face (no se proporciona URL directa en la información, pero se menciona que existe)
