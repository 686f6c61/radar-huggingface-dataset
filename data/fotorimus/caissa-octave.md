# fotorimus/caissa-octave

## Resumen

Caïssa-2 — OCTAVE es un proyecto de ajedrez por computadora desarrollado por el usuario fotorimus, presentado como una evolución arquitectónica de su predecesor Caïssa-1. El modelo no es un LLM generativo al uso, sino una red neuronal de política y valor para ajedrez que sustituye el cuello de botella conceptual de ocho dimensiones de Caïssa-1 por un tronco latente libre de 256 dimensiones, manteniendo la cabeza de conceptos como tarea auxiliar en lugar de como estado oculto. Se distribuye como repositorio de código Python (numpy + python-chess), no como pesos preentrenados.

La propuesta técnica se articula en cuatro pasos: apertura del tronco, búsqueda PUCT/MCTS sobre el campo de política y valor, destilación por autojuego desde un "jugador de retícula" (lattice player) y memoria geométrica mediante un índice de conceptos de 9 flotantes con recuperación k-NN como prior de búsqueda. El repositorio tiene 0 GB y 0 descargas en el momento de la consulta, lo que indica que se trata de un proyecto de investigación incipiente sin artefactos publicados.

Es relevante para investigadores interesados en arquitecturas de ajedrez interpretables, en la separación entre representación y medición conceptual, y en técnicas de explicabilidad de búsqueda (el motor explica qué ramas descartó y por qué, en términos de ejes conceptuales). No debe confundirse con un modelo de lenguaje: no hay tokenizador, ni vocabulario, ni generación de texto libre.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Red neuronal feedforward con tronco latente libre (256-D) y cabeza de conceptos auxiliar; búsqueda PUCT/MCTS acoplada |
| Parámetros totales | no disponible (depende de las dimensiones de las matrices Wt, Wp, Wc; no se publican recuentos) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; opera sobre posiciones de ajedrez codificadas en 832-D) |
| Tipos de cuantización | no disponible (implementación en numpy, sin pesos cuantizados publicados) |
| Idiomas soportados | no aplica (modelo específico de ajedrez) |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (repositorio de código fuente Python; no se publican safetensors ni GGUF) |

## Arquitectura y entrenamiento

Caïssa-2 abandona el diseño de "garganta" de Caïssa-1, donde el vector de conceptos de 8 dimensiones era el propio estado oculto y limitaba la capacidad de la política a ocho números. En su lugar, el tronco es una capa ReLU de 256 dimensiones (`h = relu(Wt @ board)`) sobre la codificación de tablero de 832 dimensiones heredada de Caïssa-1; la política se calcula directamente desde el tronco (`softmax(Wp @ h)`) y la cabeza de conceptos (`tanh(Wc @ h + bc)`) pasa a ser una tarea auxiliar que mide ocho ejes conceptuales sin restringir la representación. Se conserva la máscara de legalidad de 4096 dimensiones.

El entrenamiento se basa en destilación por autojuego: la red imita al "jugador de retícula", un agente que combina campo (prior + valor), búsqueda PUCT con poda por guardián conceptual y recuperación desde memoria. La memoria se implementa como un índice geométrico de 9 flotantes con recuperación k-NN que actúa como prior en la búsqueda. No se especifican en la información disponible el número de tokens, la composición del dataset ni si hubo RLHF o DPO; el autor indica que todo el experimento es reproducible desde una semilla y se ejecuta sin GPU, sin motor de ajedrez externo y sin red, usando exclusivamente numpy y python-chess.

## Capacidades

- Evaluación de posiciones de ajedrez mediante política y valor sobre la codificación de 832-D.
- Búsqueda PUCT/MCTS con prior de red, valor y poda por guardián conceptual (derivada de la cabeza de conceptos más evaluación estática de intercambio, SEE).
- Explicabilidad de búsqueda: `LatticePlayer.explain(board)` devuelve el movimiento elegido, los conteos de visitas y, para cada rama descartada, una razón expresada en ejes conceptuales (por ejemplo, caída de seguridad del rey con z-score respecto a hermanos).
- Medición de ocho ejes conceptuales mediante la cabeza auxiliar, comparables contra un extractor de referencia (métrica concept MAE).
- Memoria geométrica con recuperación k-NN como prior de búsqueda.
- Destilación por autojuego desde el jugador de retícula.
- No soporta tool calling, function calling, agentes multi-paso genéricos, visión, audio ni generación de texto: es un modelo específico de dominio ajedrecístico.

## Casos de uso

- Investigación en arquitecturas de ajedrez interpretables: el modelo permite comparar directamente el diseño de cuello de botella (Caïssa-1) frente al tronco libre con cabeza auxiliar (Caïssa-2), con una prueba automatizada (`tests/test_step1_throat.py`) que verifica la diferencia arquitectónica.
- Análisis de explicabilidad de motores: `LatticePlayer.explain` produce razones en términos de ejes conceptuales para ramas descartadas, útil para estudiar por qué un motor prefiere un movimiento sobre otro en posiciones tácticas.
- Reproducción de experimentos sin hardware especializado: al ejecutarse solo con numpy y python-chess, cualquier investigador puede reproducir el pipeline completo (entrenamiento de ambas arquitecturas, arena y cierre del bucle) desde una semilla, sin GPU ni motor externo.
- Evaluación comparativa de políticas en corpus tácticos: el CLI de evaluación mide tasa de errores graves (blunder rate por SEE ≥ 2 peones), top-1 frente al profesor, MAE conceptual y legalidad sobre un corpus reservado de posiciones tácticas.
- Estudio de memoria como geometría: el índice de 9 flotantes y la recuperación k-NN permiten experimentar con priors de búsqueda basados en similitud conceptual en lugar de en tablas de aperturas o finales.
- Docencia y formación en búsqueda PUCT/MCTS: el código de `src/caissa2/search/puct.py` sirve como implementación de referencia didáctica de PUCT con poda por guardián y explicaciones a nivel de eje.
- Base para extensiones de autojuego: el bucle de destilación en `src/caissa2/selfplay/` puede adaptarse para estudiar cómo la señal de entrenamiento derivada del propio juego afecta a la calidad de la política.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card define cuatro métricas (blunder rate, top-1, concept MAE y legalidad) y describe el protocolo de medición sobre un corpus táctico reservado, pero no incluye valores numéricos de resultados.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el autor indica explícitamente que el proyecto se ejecuta sin GPU ("No GPU, no engine, no network").
- GPU recomendadas: no aplica; la implementación es numpy + python-chess sobre CPU.
- Compatibilidad con GPU de consumo: no aplica en la implementación publicada; no se distribuyen pesos que puedan cargarse en una GPU.
- Opciones de despliegue: ejecución directa del paquete Python (`pip install -e ".[dev]"`) y del CLI `python -m caissa2.eval.cli --out reports/octave.json`; no hay integración con vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles; dependen del tamaño de las matrices y de la configuración de búsqueda, que no se publican.

## Comparativa con modelos similares

| Modelo | Tipo | Tronco / capacidad | Búsqueda | Explicabilidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Caïssa-2 — OCTAVE | Red de política/valor para ajedrez | Tronco libre de 256-D + cabeza conceptual auxiliar | PUCT/MCTS con guardián y memoria k-NN | Razones por eje conceptual en ramas descartadas | Apache-2.0 | Repositorio de código, 0 GB, 0 descargas |
| Caïssa-1 | Red de política/valor para ajedrez | Cuello de botella conceptual de 8-D como estado oculto | No especificado en la información disponible | No especificado | No disponible | Proyecto predecesor en GitHub |
| Stockfish / Leela Chess Zero | Motores de ajedrez | Redes específicas (LCZero) o evaluación clásica (Stockfish) | MCTS (LCZero) o alpha-beta (Stockfish) | Limitada (líneas principales, sin razones por eje) | GPL (Stockfish) / no disponible (LCZero) | Ampliamente desplegados |

La comparación con motores de producción como Stockfish o Leela Chess Zero es cualitativa: Caïssa-2 no publica fuerza de juego (Elo) ni resultados de benchmarks, por lo que no es posible situarlo en una escala de rendimiento frente a ellos.

## Limitaciones y advertencias

- Proyecto incipiente: 0 descargas, 0 likes y repositorio de 0 GB en el momento de la consulta; no hay artefactos de pesos publicados, solo código.
- Dominio estrictamente ajedrecístico: no es un modelo de lenguaje y no puede usarse para generación de texto, código, visión ni tareas generales.
- Sin datos de fuerza de juego: no se publican Elo, resultados de arena ni comparaciones cuantitativas con motores establecidos.
- Métricas definidas solo sobre corpus tácticos: el propio autor advierte que en posiciones tranquilas todos los modelos puntúan 0 % y la métrica no mide nada, lo que limita la evaluación global.
- Riesgo de sobreajuste al profesor: la destilación imita al jugador de retícula, de modo que la calidad final está acotada por la del profesor y por la cobertura del corpus de autojuego.
- Dependencia de la codificación heredada: la codificación de 832-D, la máscara de 4096-D y los ocho ejes conceptuales provienen de Caïssa-1; sus sesgos de representación se arrastran al nuevo modelo.
- Licencia Apache-2.0 permite uso comercial, pero al no haber pesos ni modelo entrenado distribuido, el uso comercial requeriría entrenar el modelo por cuenta propia.
- Sin información sobre sesgos, alucinación o limitaciones idiomáticas en el sentido habitual de los LLM; no aplica, pero tampoco hay auditoría publicada de comportamiento del motor en posiciones de tablas, finales o aperturas teóricas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fotorimus/caissa-octave
- Repositorio del predecesor Caïssa-1: https://github.com/feromirdanton-ui/caissa
- Documento de paradigma citado en la model card: `docs/PARADIGM.md` (ruta interna del repositorio, sin URL pública disponible)
- No se han encontrado en la información disponible enlaces a papers, blogs, demos ni repositorios adicionales de Caïssa-2.
