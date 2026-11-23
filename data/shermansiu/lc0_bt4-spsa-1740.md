# shermansiu/lc0_BT4-spsa-1740

## Resumen

Lc0 BT4-spsa-1740 es una red neuronal de política y valor (policy/value network) para ajedrez, diseñada para su uso con el motor Leela Chess Zero (lc0). El modelo ha sido convertido y publicado en formato PyTorch/safetensors por el usuario shermansiu a partir de la red original `BT4-1740.pb.gz` distribuida por el proyecto Leela Chess Zero. Emplea la arquitectura Chessformer, un transformer unificado para modelado de ajedrez descrito en el paper de Monroe y Chalmers (arXiv:2409.12272) y en la publicación posterior en ICLR 2026.

El modelo cuenta con aproximadamente 206 millones de parámetros y se distribuye como un checkpoint de 1,2 GB que incluye tanto los tensores decodificados en float32 como el protobuf original de lc0 y los ficheros de procedencia. Su función es evaluar posiciones de ajedrez: dada una posición, produce una distribución de probabilidad sobre movimientos legales (política) y una estimación del valor de la posición. No es un modelo de lenguaje ni un modelo generativo de propósito general.

Su relevancia radica en que facilita el uso de redes de ajedrez de última generación en entornos Python/PyTorch sin necesidad de manipular protobufs de lc0, integrándose a través del pipeline `Lc0Pipeline` de la librería ChessNets. Está pensado para investigadores y desarrolladores que trabajan en ajedrez por computadora, análisis de motores o entrenamiento de agentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Chessformer (transformer para ajedrez, red policy/value de lc0) |
| Parametros totales | 205.983.980 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica como ventana de texto; procesa posiciones de tablero) |
| Tipos de cuantizacion | no disponible (pesos publicados en float32; sin variantes GGUF/cuantizadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | GPL-3.0-or-later |
| Formato de pesos | safetensors (float32) + protobuf original `model.pb.gz` |

## Arquitectura y entrenamiento

El modelo utiliza la arquitectura Chessformer, una familia de transformers adaptada al dominio del ajedrez en la que las piezas y casillas se representan como tokens y la atención modela las relaciones entre ellas. Se trata de una red de política y valor: la cabeza de política produce una distribución sobre movimientos legales y la cabeza de valor estima la evaluación de la posición. El checkpoint deriva de la red `BT4-1740` del proyecto Leela Chess Zero, cuyo nombre sugiere el uso de "big transformers" y el paso de entrenamiento 1740; el sufijo "spsa" hace referencia al algoritmo de optimización SPSA empleado habitualmente en el ajuste de parámetros de lc0.

La información disponible no detalla el volumen de tokens de entrenamiento ni la composición exacta del dataset, más allá de que proviene del pipeline de autoaprendizaje de Leela Chess Zero. La conversión a safetensors decodificó las capas de pesos del protobuf, que usaban codificación `LINEAR16`, a tensores float32; el autor advierte que esta conversión no puede recuperar la precisión ya perdida en la codificación de origen. El repositorio incluye `config.json` con la arquitectura materializada, `provenance.json` con hashes de origen y conversión, y la configuración de entrenamiento original.

## Capacidades

- Evaluación de posiciones de ajedrez mediante política (probabilidades sobre movimientos legales) y valor (evaluación de la posición).
- Generación de movimientos candidatos con sus probabilidades asociadas.
- Integración con búsqueda de árbol (MCTS) a través del motor lc0 para obtener fuerza de juego real.
- Uso programático en Python mediante el pipeline `Lc0Pipeline` de ChessNets.
- No soporta tool calling, function calling, agentes multi-paso ni razonamiento en lenguaje natural.
- No tiene capacidades multilingües, de visión ni de audio.
- No dispone de modo "thinking" ni decodificación especulativa.

## Casos de uso

- Análisis de partidas y posiciones: el modelo evalúa posiciones concretas y devuelve probabilidades de movimiento, útil para herramientas de análisis ajedrecístico que necesiten una red en PyTorch sin depender del binario de lc0.
- Entrenamiento de agentes de ajedrez: sirve como red de política/valor preentrenada para inicializar o comparar agentes en experimentos de aprendizaje por refuerzo.
- Investigación en arquitecturas transformer para dominios estructurados: permite reproducir y estudiar la arquitectura Chessformer con pesos reales de lc0.
- Benchmarks de motores: puede emplearse como referencia para medir fuerza de juego frente a otras redes de lc0 o motores clásicos, combinándolo con búsqueda MCTS.
- Generación de datasets etiquetados: las evaluaciones de política y valor pueden usarse para anotar posiciones en corpus de ajedrez.
- Docencia y divulgación: facilita demostraciones de cómo un transformer aprende representaciones de tablero, al estar disponible en formato estándar PyTorch.
- Integración en pipelines de análisis por lotes: al ser safetensors float32, puede cargarse en GPU para procesar grandes volúmenes de posiciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,8-1 GB en float32 para los 206 M de parámetros, más overhead de activaciones y del pipeline; en la práctica, menos de 2 GB en la mayoría de configuraciones.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM; RTX 3060, RTX 4090, A100 o H100 son suficientes y de sobra.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna (GTX 1650 en adelante).
- Opciones de despliegue: pipeline `Lc0Pipeline` de ChessNets sobre PyTorch; el protobuf original puede usarse con el motor lc0 estándar.
- Latencia y throughput: no disponibles en la información proporcionada; dependen del hardware y de si se combina con búsqueda MCTS.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Lc0 BT4-spsa-1740 | 205.983.980 | no aplica | no disponible | GPL-3.0-or-later | Hugging Face (safetensors + protobuf) |
| Otras redes lc0 (BT4, T80, etc.) | variable | no aplica | no disponible | GPL-3.0 | storage.lczero.org |
| Stockfish NNUE | no disponible | no aplica | no disponible | GPL-3.0 | GitHub oficial |
| AlphaZero (referencia) | no disponible | no aplica | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo en la información proporcionada; la comparación se limita a parámetros, licencia y formato de distribución.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no responde preguntas ni soporta conversación.
- La fuerza de juego depende de la red de origen y de la configuración de búsqueda; el modelo por sí solo no garantiza un nivel de juego determinado.
- La conversión desde `LINEAR16` a float32 no recupera precisión perdida en la codificación original.
- Las salidas (probabilidades y valores) no deben interpretarse como garantías de corrección ni usarse para decisiones de alto riesgo.
- Licencia GPL-3.0-or-later: impone obligaciones de copyleft para uso y distribución; revisar compatibilidad antes de integrar en productos propietarios.
- No se documentan sesgos específicos, pero al derivar de autoaprendizaje de lc0 puede heredar las limitaciones y sesgos del pipeline de entrenamiento original.
- Riesgo de alucinación no aplica en el sentido habitual, pero las evaluaciones pueden ser imprecisas en posiciones atípicas o fuera de la distribución de entrenamiento.
- Idiomas y contexto de texto no disponibles por no ser un modelo lingüístico.

## Enlaces

- Hugging Face: https://huggingface.co/shermansiu/lc0_BT4-spsa-1740
- Red original en lc0: https://storage.lczero.org/files/networks-contrib/big-transformers/BT4-1740.pb.gz
- Proyecto Leela Chess Zero: https://lczero.org/
- Licencia lc0 (referencia): https://github.com/LeelaChessZero/lc0/blob/01cc532648d9391e43bc006ca8ead7d966b9cc1b/README.md?plain=1#L184-L211
- Paper arXiv: https://arxiv.org/abs/2409.12272
- Paper Chessformer ICLR 2026: https://proceedings.iclr.cc/paper_files/paper/2026/file/3d167db04a90885ad5208fe8b273668b-Paper-Conference.pdf
- Librería ChessNets: no disponible (referenciada en la model card como `chessnets.pipelines.lc0`)
