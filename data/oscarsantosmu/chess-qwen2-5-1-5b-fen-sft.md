# OscarSantosMu/chess-qwen2.5-1.5b-fen-sft

## Resumen

`chess-qwen2.5-1.5b-fen-sft` es un adaptador LoRA de PEFT entrenado mediante supervisión fina (SFT) sobre el modelo base `Qwen/Qwen2.5-1.5B-Instruct`. Lo desarrolla el usuario OscarSantosMu y su propósito es especializar un modelo conversacional pequeño en la selección de jugadas de ajedrez: recibe una posición en notación FEN y devuelve una única jugada en notación UCI (por ejemplo, `e2e4` o `a7a8q`). No se trata de un modelo completo, sino de un delta de pesos que debe cargarse junto al modelo base.

El interés del proyecto es metodológico: explora hasta qué punto un transformer denso de 1.500 millones de parámetros, ajustado con LoRA sobre unas 20.000 muestras (según el identificador del experimento `e002_q25_1p5b_fen_20k_sft_s42`), puede aprender a mapear posiciones a jugadas razonables sin un motor de búsqueda explícito. Es un artefacto de investigación, no un motor de ajedrez competitivo, y el propio autor advierte de que no garantiza legalidad ni optimalidad de las jugadas.

El repositorio se publicó en noviembre de 2026, no registra descargas ni interacciones, y no incluye datos de entrenamiento, métricas de evaluación ni hiperparámetros detallados. La información disponible es, por tanto, escasa y proviene casi exclusivamente de la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) con adaptador LoRA (PEFT) |
| Parametros totales | 1.500 millones en el modelo base; el adaptador LoRA añade un número no especificado |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible en la ficha (heredada del modelo base Qwen2.5-1.5B-Instruct) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantización depende del modelo base) |
| Idiomas soportados | no disponible (la tarea es específica de ajedrez; entrada FEN y salida UCI) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador LoRA de PEFT) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `Qwen/Qwen2.5-1.5B-Instruct`, un transformer decoder-only denso de 1.500 millones de parámetros. El ajuste se realizó con LoRA mediante SFT, según indica la model card, sobre un conjunto de datos cuyo tamaño se infiere del identificador del experimento (`20k`), aunque la composición, la procedencia de las posiciones y el origen de las jugadas objetivo no se detallan. El repositorio no incluye los datos de entrenamiento ni los hiperparámetros (rango de LoRA, alpha, tasa de aprendizaje, número de épocas), que el autor remite a un repositorio de GitHub no enlazado en la información disponible.

La innovación técnica es la representación de la tarea: la entrada es una posición FEN sin lista explícita de jugadas legales, y la salida debe ser exactamente una jugada en UCI. El prompt emplea la plantilla de chat estándar de Qwen con una instrucción de sistema específica que exige la jugada sin explicaciones ni puntuación adicional. El autor insiste en que la función `prompt_text()` con `variant="fen"` de `examples/task.py` debe reproducirse en inferencia para mantener la misma serialización, el mismo orden de jugadas legales y la misma instrucción de sistema usados en entrenamiento.

## Capacidades

- Selección de jugadas de ajedrez: dada una posición legal en FEN, genera una jugada en notación UCI.
- Salida restringida: el formato de entrenamiento fuerza una única jugada sin texto explicativo, lo que facilita el parseo automático.
- Conversación con plantilla de chat: hereda el formato de chat de Qwen2.5-Instruct, con instrucción de sistema y turno de usuario.
- Generación de texto general: al ser un adaptador sobre un modelo instruct, conserva parcialmente las capacidades del modelo base, aunque el ajuste está orientado a la tarea de ajedrez.
- Tool calling y function calling: no documentado para el adaptador; el modelo base Qwen2.5-Instruct lo soporta, pero el ajuste fino no lo menciona.
- Agentes y razonamiento multi-paso: no soportado de forma nativa; el modelo produce una jugada por turno y no incorpora búsqueda ni planificación.
- Capacidades multilingües: no documentadas para el adaptador.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Generación de jugadas en prototipos de ajedrez: integrar el adaptador en un script con `python-chess` para que, dada una posición, proponga una jugada candidata que luego se valide con la librería. Es adecuado porque la salida UCI es directamente parseable y la validación de legalidad es trivial.
- Baseline de investigación en modelos de lenguaje para ajedrez: servir como punto de comparación de bajo coste frente a enfoques con búsqueda o modelos mayores, ya que un adaptador LoRA sobre 1.5B se entrena y despliega con recursos modestos.
- Generación de datos sintéticos de ajedrez: producir jugadas candidatas para posiciones de un corpus y filtrarlas después con un motor o con `python-chess`, usando el modelo como generador barato en un pipeline de aumento de datos.
- Análisis de posiciones en herramientas educativas: mostrar una jugada sugerida junto a la posición FEN en una interfaz de aprendizaje, siempre con validación de legalidad y sin presentarla como jugada óptima.
- Evaluación de la brecha entre SFT y motores: medir cuántas jugadas propuestas son legales y cuántas coinciden con las de un motor de referencia, para cuantificar el valor del ajuste fino sin búsqueda.
- Despliegue en hardware de consumo: al cargar el modelo base en cuantización de 4 bits y el adaptador encima, puede ejecutarse en una GPU de consumo para demos interactivas de ajedrez, dado el tamaño reducido del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que las métricas de evaluación y los hiperparámetros detallados se añadirán cuando se consoliden los experimentos, y que la fuerza de juego no se ha establecido mediante evaluaciones estandarizadas de motores o competición.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 1.5B en fp16 requiere aproximadamente 3 GB de pesos; en cuantización de 8 bits, alrededor de 1,5-2 GB; en 4 bits, alrededor de 1-1,5 GB. El adaptador LoRA añade una cantidad marginal no especificada. Estas cifras son estimaciones por tamaño de parámetros, no datos publicados por el autor.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para fp16 con margen para el contexto; una RTX 3060, RTX 4060, RTX 4090, A100 o H100 son suficientes. El modelo es claramente sobredimensionado para A100/H100 en inferencia individual.
- Cabe en GPU de consumo: sí, en tarjetas con 6 GB o más en fp16 y en tarjetas con 4 GB en cuantización de 4 bits, siempre que se use un runtime que soporte cuantización del modelo base.
- Opciones de despliegue: `transformers` + `peft` es la vía documentada por el autor. Para servir el modelo fusionado, puede usarse vLLM o TGI tras fusionar el adaptador con el modelo base; llama.cpp y Ollama requerirían convertir el modelo fusionado a GGUF, algo no documentado en el repositorio.
- Latencia y throughput: no disponibles. Al ser un modelo de 1.5B, la latencia por jugada debería ser de decenas de milisegundos en GPU moderna, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| chess-qwen2.5-1.5b-fen-sft | 1.5B (base) + LoRA | no disponible | Jugada UCI desde FEN | no disponible | Hugging Face, 0 descargas |
| Qwen/Qwen2.5-1.5B-Instruct (base) | 1.5B | no disponible en la ficha | Generación de texto general | no disponible en la ficha | Hugging Face, ampliamente usado |
| Motores de ajedrez clásicos (Stockfish, Leela Chess Zero) | no aplica (no son LLM) | no aplica | Búsqueda y evaluación de jugadas | GPL u otras según el motor | Estándar de facto en ajedrez por computadora |

La comparación relevante es doble: frente al modelo base, el adaptador añade la tarea específica de ajedrez a costa de un ajuste fino no evaluado; frente a motores como Stockfish, el enfoque basado en LLM carece de búsqueda y no compite en fuerza de juego. No se dispone de datos de benchmarks para comparar rendimiento en ajedrez con otros adaptadores similares.

## Limitaciones y advertencias

- No garantiza jugadas legales: el autor advierte explícitamente de que el modelo no asegura legalidad ni optimalidad; toda salida debe validarse con `python-chess` o un motor.
- Fuerza de juego no establecida: no hay evaluaciones con motores estandarizados ni datos de Elo, por lo que no puede considerarse un motor de ajedrez.
- Dependencia estricta del formato de prompt: debe reproducirse la instrucción de sistema, la variante `fen` y la serialización de chat de `examples/task.py`; cualquier desviación degrada la calidad de la salida.
- Datos de entrenamiento no publicados: se desconoce la procedencia de las posiciones y de las jugadas objetivo, lo que impide auditar sesgos o calidad del etiquetado.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; conviene contactar con el autor antes de usarlo en producción.
- Riesgo de alucinación: al ser un modelo generativo sin restricción formal de legalidad, puede emitir jugadas ilegales o sintácticamente inválidas.
- Idiomas no documentados: la tarea es específica de ajedrez y no se han evaluado capacidades multilingües del adaptador.
- Madurez del proyecto: repositorio con 0 descargas, sin métricas ni hiperparámetros publicados, y con evaluación pendiente según el propio autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OscarSantosMu/chess-qwen2.5-1.5b-fen-sft
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Repositorio de GitHub del proyecto: no disponible en la información proporcionada (la model card lo menciona sin enlace)
- Paper o blog del autor: no disponible
- Demo: no disponible
