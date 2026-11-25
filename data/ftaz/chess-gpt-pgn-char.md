# ftaz/chess-gpt-pgn-char

## Resumen

chess-gpt-pgn-char es un modelo de lenguaje decoder-only de 50,9 millones de parámetros desarrollado por el usuario ftaz (repositorio wezn) que juega al ajedrez prediciendo directamente el siguiente token de una partida en notación algebraica abreviada (SAN). No incorpora búsqueda ni función de evaluación: cada jugada se produce en un único forward pass, lo que lo convierte en un experimento controlado sobre cuánto conocimiento ajedrecístico puede comprimirse en un transformer pequeño sin árbol de búsqueda.

Forma parte de una familia de tres modelos entrenados de forma idéntica que solo difieren en el tokenizador: este modelo A usa tokenización por carácter sobre el texto PGN (vocabulario de 34 tokens), mientras que B usa movimientos UCI completos (1971 tokens) y C usa casillas UCI (71 tokens). El modelo A obtiene el mejor Elo estimado de los tres (1940 en escala Lichess), lo que resulta relevante para estudiar cómo la granularidad del tokenizador afecta al rendimiento en dominios estructurados.

El modelo se entrenó sobre 35 millones de partidas de Lichess (ritmo rapid o más lento, todos los niveles) durante 206.934 pasos en una única NVIDIA GB10. Es un artefacto de investigación reproducible, con licencia MIT, pensado para quienes quieran estudiar tokenización, modelado de secuencias estructuradas o generación de jugadas sin motor de ajedrez.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (16 capas, 8 cabezas, anchura 512, embeddings atados) |
| Parametros totales | 50.924.544 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors; el repo no documenta cuantizaciones) |
| Idiomas soportados | no disponible (el dominio es notación PGN/SAN, no lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | safetensors (model.safetensors) + config.json |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only estándar de 16 capas, 8 cabezas de atención y dimensión de modelo 512, con embeddings de entrada y salida atados, y una ventana de contexto de 1024 tokens. La tokenización es por carácter sobre el texto PGN en formato SAN (por ejemplo, `1.e4 e5 2.Nf3`), con un vocabulario de solo 34 tokens. La generación de una jugada consiste en decodificar secuencialmente los caracteres que la componen, sin búsqueda ni evaluación explícita de posiciones.

El entrenamiento utilizó 35 millones de partidas de Lichess (ritmo rapid y más lento, todas las categorías de rating), cada una vista una sola vez, durante 206.934 pasos sobre una única GPU NVIDIA GB10. La pérdida de validación por jugada reportada es de 1,564. No se documenta en la información disponible el uso de RLHF, DPO ni ninguna fase de ajuste posterior; el objetivo es únicamente el modelado de lenguaje autorregresivo sobre secuencias PGN.

## Capacidades

- Generación de jugadas de ajedrez legales en notación SAN a partir de una posición dada, mediante predicción autorregresiva carácter a carácter.
- Ranking de jugadas legales con probabilidades asociadas (el código de referencia expone `rank_legal_moves`).
- Juego completo de partidas sin motor de búsqueda: una pasada hacia delante por jugada.
- Alta tasa de legalidad: 99,74 % de jugadas legales sobre partidas humanas de validación.
- No dispone de tool calling, function calling ni soporte de agentes.
- No dispone de modo de razonamiento explícito (thinking), visión ni audio.
- No hay capacidades multilingües en lenguaje natural documentadas; el "idioma" del modelo es la notación PGN.

## Casos de uso

- Investigación sobre tokenización en dominios estructurados: comparar este modelo A (carácter) con B (movimiento UCI) y C (casilla UCI) permite aislar el efecto del tokenizador sobre el rendimiento final en una misma tarea, con arquitectura y datos idénticos.
- Generación de partidas sintéticas para aumento de datos: el modelo puede producir secuencias PGN plausibles para alimentar pipelines de entrenamiento de otros modelos o de motores de evaluación, dado su bajo coste computacional.
- Baseline ligero en evaluación de ajedrez: sirve como referencia de "modelo sin búsqueda" frente a motores clásicos o modelos mayores, útil en estudios comparativos de fuerza de juego.
- Análisis de modelado de secuencias largas estructuradas: con contexto de 1024 tokens (suficiente para varias decenas de jugadas en SAN), permite estudiar degradación de la calidad a medida que crece la partida.
- Enseñanza y divulgación técnica: el repo y el blog asociados documentan el proceso completo de entrenamiento en una sola GPU, lo que lo convierte en un caso práctico para cursos de ML aplicado.
- Prototipado de interfaces de ajedrez: integrable en aplicaciones ligeras de análisis o entrenamiento que requieran un oponente o generador de jugadas sin dependencia de Stockfish, ejecutable en CPU según el ejemplo de la model card.

## Benchmarks y rendimiento

| Metrica | A (pgn-char) | B (uci-move) | C (uci-square) |
|---|---|---|---|
| Elo estimado (escala Lichess, autojuego puntuado por Stockfish) | 1.940 | 1.908 | 1.792 |
| Jugadas legales en partidas humanas de validación | 99,74 % | 99,77 % | 99,84 % |
| Pérdida media en centipeones | 56 | 58 | 61 |

Los valores de Elo son estimaciones derivadas de autojuego puntuado por Stockfish, no resultados de partidas con rating oficial; la model card remite al write-up para la metodología. No se han publicado resultados de benchmarks estándar de LLM (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: en torno a 0,2 GB de pesos (50,9 M de parámetros), más overhead de activaciones y contexto; cabe holgadamente en cualquier GPU consumer.
- VRAM estimada en fp16/bf16: aproximadamente 0,1 GB de pesos.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de memoria libre; el modelo se ha validado en CPU según el ejemplo de la model card. Una RTX 4090 o A100 está sobredimensionada para este modelo.
- Cabe en GPU consumer: sí, en todas las GPU modernas, incluidas integradas con suficiente memoria compartida.
- Opciones de despliegue: el código de referencia es el paquete `chessgpt` del repositorio github.com/wezn/chess-gpt (con `uv`); al ser un transformer PyTorch estándar con safetensors, puede cargarse con transformers o convertirse a GGUF para llama.cpp, aunque estas rutas no están documentadas oficialmente.
- Latencia y throughput: no disponibles de forma explícita; por el tamaño (50,9 M de parámetros y una pasada por jugada) se espera latencia de milisegundos en GPU y decenas de milisegundos en CPU, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tokenizador | Elo estimado | Licencia |
|---|---|---|---|---|---|
| chess-gpt-pgn-char (A) | 50,9 M | 1024 | carácter PGN (34) | 1.940 | MIT |
| chess-gpt-uci-move (B) | no disponible en la información | no disponible | movimiento UCI (1971) | 1.908 | MIT |
| chess-gpt-uci-square (C) | no disponible en la información | no disponible | casilla UCI (71) | 1.792 | MIT |
| Stockfish (motor clásico) | no aplica (motor con búsqueda) | no aplica | no aplica | muy superior (no comparable directamente) | GPL |

La comparación relevante es interna a la familia A/B/C, ya que los tres comparten arquitectura, datos y protocolo de entrenamiento. Frente a motores clásicos como Stockfish, la diferencia de fuerza es enorme y la comparación no es significativa: el interés del modelo es metodológico, no competitivo. No se dispone de datos de otros modelos neuronales de ajedrez en la información proporcionada para ampliar la comparativa.

## Limitaciones y advertencias

- Fuerza de juego limitada: Elo estimado de 1940 en escala Lichess, insuficiente para uso competitivo serio y muy por debajo de motores clásicos.
- Sin búsqueda ni evaluación: comete errores tácticos que un motor detectaría de inmediato; la calidad depende enteramente de la distribución de partidas de Lichess.
- Sesgo de datos: entrenado solo con partidas de Lichess de ritmo rapid o más lento, lo que puede infrarepresentar estilos de juego de otros contextos (torneos clásicos, blitz, variantes).
- Riesgo de jugadas ilegales: aunque la tasa de legalidad es del 99,74 %, no es del 100 %; en producción es necesario validar cada jugada contra las reglas y filtrar o re-muestrear las ilegales.
- Elo estimado, no medido: los valores provienen de autojuego puntuado por Stockfish, no de partidas con rating oficial; deben tratarse como indicativos.
- Contexto limitado a 1024 tokens: en SAN, esto restringe la longitud de partida manejable antes de degradar la coherencia.
- Sin documentación de cuantizaciones ni de formatos alternativos: la integración en stacks como llama.cpp u Ollama requeriría conversión manual no soportada oficialmente.
- Licencia MIT: permisiva para uso comercial, pero sin garantías; conviene citar el trabajo original y revisar las condiciones de los datos de Lichess subyacentes.
- Sin datos de sesgos lingüísticos ni de alucinación en lenguaje natural: el modelo no está pensado para texto libre y no debe usarse fuera del dominio PGN.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ftaz/chess-gpt-pgn-char
- Modelo B (uci-move): https://huggingface.co/ftaz/chess-gpt-uci-move
- Modelo C (uci-square): https://huggingface.co/ftaz/chess-gpt-uci-square
- Write-up: https://blog.wezn.dev/chess-gpt/
- Código: https://github.com/wezn/chess-gpt
- Dataset: https://huggingface.co/datasets/lichess/standard-chess-games
