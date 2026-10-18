# janihal/LFM2.5-230M-Chess-oQ8

## Resumen

LFM2.5-230M-Chess-oQ8 es una cuantización de 8 bits en formato MLX del modelo mlabonne/LFM2.5-230M-Chess (conocido como ChessLFM), un motor de ajedrez de 230 millones de parámetros con interfaz de modelo de lenguaje. El modelo original lo desarrolló Maxime Labonne partiendo de LiquidAI/LFM2.5-230M-Base mediante destilación de Stockfish, y esta versión la publica el usuario janihal usando la herramienta oQ (oMLX), con el objetivo de permitir inferencia local rápida en Apple Silicon reduciendo el uso de memoria aproximadamente a la mitad respecto a bf16.

La particularidad del modelo es su esquema de tokenización: cada movimiento legal de ajedrez es un único token del vocabulario (se añadieron 2.106 identificadores de movimiento y valor a partir del índice 64402), y la posición se codifica como un prompt fijo de 80 tokens construido desde un FEN. El modelo predice primero su propia probabilidad de victoria (64 tokens `<v:k>`) y después un token de movimiento, lo que permite jugar con una pasada directa o acoplarlo a una búsqueda superficial.

Esta ficha describe la variante cuantizada, que solo cambia la precisión y el formato de almacenamiento de los pesos: no es un modelo conversacional, requiere Apple Silicon con `mlx-lm` y está pensada para integrarse en aplicaciones de ajedrez, análisis de posiciones y experimentación con modelos de dominio específico de muy bajo coste computacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM2 (híbrida de convolución y atención), 14 capas, vocabulario de 66.508 tokens |
| Parametros totales | 230.688.512 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (el prompt de posición es fijo de 80 tokens) |
| Tipos de cuantizacion | 8 bits afín (affine), group size 64, generada con oQ/oMLX |
| Idiomas soportados | en (inglés; el modelo no es conversacional, la interfaz es notación de ajedrez) |
| Licencia | LFM Open License v1.0 (heredada del modelo base; campo `license: other`, `license_name: lfm1.0`) |
| Formato de pesos | MLX safetensors (fichero único), ~245 MB en disco frente a ~461 MB en bf16 |

## Arquitectura y entrenamiento

La arquitectura es LFM2, un transformer híbrido que combina capas convolucionales con capas de atención en 14 capas, con un vocabulario de 66.508 tokens. Sobre esa base, el modelo original fue ajustado con destilación de Stockfish: la cabeza de lenguaje se reutiliza para emitir 64 tokens de valor (`<v:k>`, estimación de probabilidad de victoria) y tokens de movimiento (`<m:...>`), de modo que cada jugada es un único token. La inferencia típica consiste en construir el prompt de 80 tokens desde un FEN, leer los logits del último token, tomar el argmax sobre los 64 tokens de valor, añadir ese token más `<|bestmove|>`, volver a ejecutar y enmascarar los logits a los movimientos legales antes del argmax final.

No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset de destilación ni el uso de RLHF o DPO en el modelo original; la model card remite a la ficha original de mlabonne/LFM2.5-230M-Chess para esos detalles. La innovación destacable es el esquema de tokenización por movimiento, que reduce el problema de generación de jugadas a una clasificación sobre un conjunto pequeño de tokens y permite integrar una estimación de valor en el mismo paso de decodificación. Esta variante cuantizada no altera la arquitectura ni el tokenizador: `token_ids.json` se copia sin cambios del repositorio original y los parámetros de cuantización quedan registrados en `config.json`.

## Capacidades

- Predicción de movimientos legales de ajedrez a partir de una posición en formato FEN, con cada jugada representada como un token único.
- Estimación de probabilidad de victoria mediante 64 tokens de valor, lo que permite usar el modelo como evaluador de posiciones además de como generador de jugadas.
- Juego a aproximadamente 2004 Elo cuando se acopla a una búsqueda superficial de profundidad 3, y aproximadamente 1500 Elo con la política directa en una sola pasada.
- Integración con búsqueda externa: la máscara de legalidad y la selección de movimientos permiten conectarlo a un buscador propio (alpha-beta, MCTS) que use el modelo como política y evaluador.
- Ejecución local en Apple Silicon con `mlx-lm`, sin necesidad de GPU dedicada ni de servicios en la nube.
- No soporta tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido; tampoco es un modelo de chat multi-turno.
- Capacidad multilingüe: no disponible; el modelo está etiquetado únicamente para inglés y su interfaz real es notación de ajedrez.

## Casos de uso

- Motor de ajedrez embebido en una aplicación de escritorio para macOS: el modelo ocupa unos 245 MB en disco y puede cargarse con `mlx-lm` en memoria unificada, lo que permite distribuir un motor de ~2000 Elo dentro de una app sin dependencias externas.
- Análisis de posiciones en un visor de partidas: para cada FEN se obtiene una estimación de probabilidad de victoria y una jugada candidata, lo que sirve para anotar partidas con evaluación automática sin llamar a un servicio en la nube.
- Herramienta didáctica de ajedrez: el par (evaluación, mejor jugada) permite explicar al alumno si la posición está mejor o peor y cuál es la continuación sugerida, con la posibilidad de contrastar la sugerencia con un motor clásico.
- Generación de datos de entrenamiento: al ser un modelo pequeño y rápido, puede producir grandes volúmenes de pares posición-jugada para preentrenar o aumentar datasets de ajedrez, filtrando después por legalidad y calidad.
- Evaluación comparativa de cuantizaciones: sirve como banco de pruebas para medir la degradación de un motor de dominio específico al pasar de bf16 a 8 bits afín con group size 64, comparando la jugada elegida y el valor estimado frente al modelo original.
- Prototipado de pipelines de inferencia en MLX: el código de ejemplo (carga del modelo, lectura de logits, enmascarado de movimientos legales) es un caso mínimo y reproducible para validar despliegues en Apple Silicon antes de escalar a modelos mayores.
- Análisis por lotes de bases de datos de partidas: procesar miles de posiciones para etiquetar errores graves o momentos críticos, ya que el coste por inferencia es muy bajo al tratarse de 230M de parámetros.
- Investigación sobre tokenización de dominio: permite estudiar cómo un vocabulario ampliado con 2.106 tokens específicos de ajedrez afecta a la precisión y a la latencia frente a la generación de jugadas en texto libre.

## Benchmarks y rendimiento

Los únicos datos de rendimiento disponibles en la información proporcionada son las estimaciones de Elo del modelo original, heredadas por esta cuantización:

| Metrica | Resultado |
|---|---|
| Elo con busqueda de profundidad 3 | ~2004 |
| Elo con politica directa (una pasada) | ~1500 |
| Parametros | 230.688.512 |
| Tamano en disco (esta variante) | ~245 MB (8 bits) frente a ~461 MB en bf16 |

No se han publicado resultados de benchmarks en la información disponible para MMLU, HumanEval, GSM8K ni para evaluaciones de ajedrez estandarizadas adicionales. Tampoco se han publicado mediciones de Elo específicas de esta variante cuantizada, por lo que la posible pérdida de rendimiento respecto al modelo en bf16 no está cuantificada.

## Requisitos de hardware

- Inferencia exclusivamente en Apple Silicon (M1 o posterior), ya que el formato es MLX safetensors y la librería requerida es `mlx-lm`; no hay pesos GGUF ni safetensors estándar en este repositorio.
- VRAM/memoria unificada estimada: por debajo de 1 GB en total, dado que los pesos ocupan ~245 MB y el prompt es de 80 tokens; cabe holgadamente en cualquier Mac con 8 GB de memoria unificada.
- GPU recomendadas: no aplica en el sentido habitual (A100, H100, RTX 4090); el modelo no se ejecuta con CUDA en este formato. Para uso en GPU NVIDIA habría que recurrir al modelo original en bf16 o a la variante ONNX.
- Despliegue: `mlx-lm` sobre MLX; no se proporcionan recetas para vLLM, llama.cpp, Ollama ni TGI en este repositorio.
- Latencia y throughput: no disponible. Al tratarse de 14 capas y 230M de parámetros, se espera una latencia muy baja por posición en Apple Silicon, pero no hay cifras publicadas en la información disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Memoria en disco | Elo | Licencia |
|---|---|---|---|---|---|
| janihal/LFM2.5-230M-Chess-oQ8 | 230,7 M | MLX safetensors, 8 bits afín g64 | ~245 MB | no disponible para la variante cuantizada | LFM Open License v1.0 |
| mlabonne/LFM2.5-230M-Chess | 230,7 M | safetensors bf16 | ~461 MB | ~2004 con profundidad 3; ~1500 en una pasada | LFM Open License v1.0 |
| mlabonne/LFM2.5-230M-Chess-ONNX | 230,7 M | ONNX | no disponible | no disponible | no disponible en la información |
| LiquidAI/LFM2.5-230M-Base | ~230 M | safetensors | no disponible | no aplica (modelo base sin ajuste de ajedrez) | no disponible en la información |

Frente a motores de ajedrez clásicos como Stockfish, la comparación no es homogénea en la información disponible: Stockfish no es un modelo de lenguaje, su fuerza depende de la profundidad y el tiempo de búsqueda, y no se aportan cifras comparativas directas en esta ficha.

## Limitaciones y advertencias

- No es un modelo de chat: no debe usarse con plantillas conversacionales ni esperar respuestas en lenguaje natural. Requiere construir el prompt de 80 tokens desde un FEN y leer logits directamente.
- Solo genera movimientos legales si se aplica el enmascarado de logits sobre los tokens `<m:...>`; sin esa máscara puede emitir jugadas ilegales.
- La estimación de valor procede de destilación de Stockfish y puede estar mal calibrada en posiciones atípicas, de finales poco representados o con material desequilibrado.
- La cuantización a 8 bits afín con group size 64 puede alterar la elección de jugada y la probabilidad de victoria respecto al modelo en bf16; no se han publicado mediciones de esa degradación.
- Riesgo de alucinación en el sentido de evaluaciones o jugadas plausibles pero incorrectas: al ser un modelo de 230M de parámetros y una sola pasada, su precisión táctica es limitada sin búsqueda externa (~1500 Elo en política directa).
- Idiomas: etiquetado únicamente para inglés y sin capacidades multilingües declaradas; no es apto para tareas de texto general.
- Dependencia de plataforma: el formato MLX limita la ejecución a Apple Silicon, lo que excluye servidores Linux con GPU NVIDIA sin conversión previa.
- Licencia: LFM Open License v1.0, heredada del modelo base. Es una licencia con condiciones específicas (el campo de HuggingFace indica `license: other`); antes de un uso comercial hay que revisar el fichero LICENSE del repositorio, ya que en la información disponible no se detallan los términos.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado en octubre de 2026; no hay evidencia de uso en producción ni validación independiente de esta cuantización concreta.
- La búsqueda web realizada no devolvió resultados técnicos relevantes sobre el modelo (solo páginas de inicio de sesión de Gmail), por lo que no se ha podido contrastar información adicional externa a HuggingFace.

## Enlaces

- Modelo cuantizado en HuggingFace: https://huggingface.co/janihal/LFM2.5-230M-Chess-oQ8
- Modelo original ChessLFM: https://huggingface.co/mlabonne/LFM2.5-230M-Chess
- Modelo base de Liquid AI: https://huggingface.co/LiquidAI/LFM2.5-230M-Base
- Variante ONNX: https://huggingface.co/mlabonne/LFM2.5-230M-Chess-ONNX
- Articulo de Maxime Labonne: https://maximelabonne.substack.com/p/chesslfm-2000-elo-in-230m-params
- Demo en HuggingFace Spaces: https://hf.co/spaces/mlabonne/ChessLFM
- Herramienta de cuantización oQ/oMLX: https://github.com/jundot/omlx
- Librería MLX: https://github.com/ml-explore/mlx
- Librería mlx-lm: https://github.com/ml-explore/mlx-lm
- Fichero de licencia: https://huggingface.co/janihal/LFM2.5-230M-Chess-oQ8/blob/main/LICENSE
- No se encontraron otros enlaces relevantes en la busqueda web realizada.
