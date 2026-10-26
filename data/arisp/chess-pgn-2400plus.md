# Arisp/chess-pgn-2400plus

## Resumen

chess-pgn-2400plus es un transformer decoder-only de 51 millones de parámetros (50.997.248 exactos según los pesos en safetensors) que juega al ajedrez escribiendo directamente el movimiento en notación algebraica estándar (SAN) dentro de una línea de texto PGN. Lo desarrolla el usuario de HuggingFace Arisp y sigue la receta del artículo *Transcendence: Generative Models Can Outperform The Experts That Train Them* (Zhang et al., NeurIPS 2024): el modelo opera a nivel de carácter, con un vocabulario de 33 símbolos, y nunca recibe un tablero ni las reglas del juego. Aprende únicamente por imitación de partidas de Lichess en las que ambos jugadores tenían un Elo de 2400 o superior.

El modelo forma parte de un par entrenado con la misma receta en dos bandas de nivel: chess-pgn-1000-1300 y este chess-pgn-2400plus. El interés práctico y de investigación está en que permite estudiar hasta qué punto un modelo generativo pequeño puede aproximarse al comportamiento de jugadores expertos, y en que su carácter compacto (0,4 GB de repositorio) lo hace ejecutable en CPU.

La relevancia inmediata es doble: por un lado, es un banco de pruebas reproducible sobre el fenómeno de la "transcendencia" entre bandas de habilidad; por otro, su licencia MIT y su tamaño reducido lo convierten en una pieza viable para tareas de generación y análisis de PGN a pequeña escala, siempre asumiendo que no es un motor de ajedrez.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, 16 capas, d=512, 8 cabezas de atención, MLP con ReLU, posiciones aprendidas |
| Parámetros totales | 50.997.248 |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 1.024 caracteres PGN (no tokens BPE) |
| Tipos de cuantización | No disponible: el repositorio solo publica safetensors; no hay versiones GGUF, int8 ni int4 oficiales |
| Idiomas soportados | No disponible / no aplica: el modelo genera notación PGN (SAN) con un vocabulario de 33 caracteres, no lenguaje natural |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors`), cargable con PyTorch; código auxiliar `pgn_model.py` en el repositorio |
| Vocabulario | 33 caracteres (carácter a carácter, sin tokenizador BPE) |
| Formato de datos de entrada | Una partida por línea: `;` + movetext SAN + resultado, p. ej. `;1.e4 e5 2.Nf3 Nc6 ... 1-0` |
| Tamaño del repositorio | 0,4 GB |
| Fecha de creación en HuggingFace | 2026-10-25 (última actualización: 2026-10-26) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only convencional de 16 capas, dimensión de modelo 512, 8 cabezas de atención, MLP con activación ReLU y embeddings posicionales aprendidos, con una ventana de 1.024 caracteres. No hay atención lineal, decodificación especulativa ni mecanismos híbridos: la innovación no está en la arquitectura, sino en la representación del ajedrez como texto plano y en el régimen de entrenamiento. Cada ventana de 1.024 caracteres comienza en el inicio de una partida, de modo que el modelo ve la historia completa desde la primera jugada y aprende la distribución del siguiente carácter condicionada a todo el movetext previo.

Los datos proceden de partidas estándar valoradas de Lichess entre marzo de 2023 y junio de 2025 (28 meses), ordenadas de más reciente a más antigua, con ambos jugadores por encima de 2400 de Elo y un control de tiempo inicial de al menos 180 segundos. El conjunto de entrenamiento son 10.000.000 de partidas (4.820 millones de caracteres, 482 por partida de media) y se reservan 5.000 partidas retenidas (las más recientes) para evaluación; se conservan las tablas y se excluyen las partidas origen de puzles de Lichess usadas en los conjuntos de evaluación (22 descartadas).

El entrenamiento usa entropía cruzada por siguiente carácter con 128 ventanas (131.072 caracteres) por paso, AdamW (betas 0,9/0,95, weight decay 0,1), learning rate 2e-4 tras 2.000 pasos de calentamiento con decaimiento coseno hasta 2e-5 a lo largo de 200.000 pasos, en bf16 y sobre una única NVIDIA B200. Tras completar el ciclo principal (cuya pérdida retenida seguía mejorando en la última evaluación) se aplicaron tres etapas de ajuste fino con optimizador nuevo y parada temprana: pico 5e-5 (mejor a los 500 pasos), 2e-5 (mejor a los 1.000) y 1e-5 tras 20.000 pasos de calentamiento (mejor a los 18.500). En total, 220.000 pasos de optimizador en la ruta hasta este checkpoint (se ejecutaron 246.500), lo que equivale a unas 6,0 pasadas sobre los caracteres de entrenamiento. La pérdida retenida final es de 0,3622 bits por carácter.

## Capacidades

- Generación de movimientos de ajedrez en formato SAN dentro de líneas PGN, carácter a carácter, sin tablero ni validador de reglas interno.
- Continuación de partidas a partir del movetext previo, incluyendo la predicción del resultado final (`1-0`, `0-1`, `1/2-1/2`) como parte de la secuencia.
- Modelado de probabilidad del siguiente carácter, lo que permite calcular la sorpresa (log-probabilidad) de un movimiento concreto jugado en una partida real.
- Decodificación greedy (temperatura 0) y muestreo con temperatura; el autor recomienda muestrear en los reintentos cuando se busca legalidad.
- Generación de partidas completas de estilo 2400+, con aperturas y patrones propios de esa banda de nivel.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso explícito, visión ni audio.
- No procesa lenguaje natural: fuera del alfabeto PGN (33 caracteres) no hay capacidad de comprensión ni generación.
- Capacidad multilingüe: no aplica.

## Casos de uso

- Reproducción y extensión del experimento *Transcendence*: entrenar o evaluar modelos con la misma receta en distintas bandas de Elo (1000-1300 frente a 2400+) para medir cuánto se acercan los modelos generativos al experto que los entrena; este checkpoint es la referencia de la banda alta.
- Análisis de "sorpresa" de movimientos: calculando la log-probabilidad que el modelo asigna al movimiento realmente jugado se obtiene una métrica continua (en nats) para clasificar jugadas esperables frente a jugadas excepcionales, útil en herramientas de revisión de partidas o de detección de anomalías.
- Generación de PGN sintético para pruebas de software: pipelines de parseo, visores de tablero o bases de datos pueden alimentarse con partidas generadas con distribución realista de aperturas y resultados, sin depender de descargas de Lichess.
- Filtrado y priorización de corpus de partidas: puntuar automáticamente partidas por su verosimilitud bajo el modelo permite descartar registros corruptos o con formato atípico antes de ingerirlos en un pipeline de datos.
- Investigación sobre representación sin conocimiento de dominio: sirve como caso de estudio de cómo un modelo puramente secuencial internaliza reglas (legalidad del 99,7 % en greedy sobre posiciones 2400+) sin recibirlas explícitamente.
- Prototipado educativo y demos ligeras: con 51M de parámetros y ejecución en CPU, se puede integrar en cuadernos o demos interactivas que muestren generación de ajedrez a nivel de carácter sin infraestructura GPU.
- Evaluación comparativa de técnicas de decodificación restringida: al tener un índice de movimientos ilegales conocido (0,30 % greedy, 1,03 % con T=1), es un banco de pruebas natural para medir el efecto de correctores gramaticales o validadores SAN en la salida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K ni similares) en la información disponible; el modelo no es aplicable a esas tareas. Los resultados publicados por el autor son específicos de ajedrez:

| Métrica | Valor |
|---|---|
| Pérdida retenida (5.000 partidas) | 0,3622 bits por carácter |
| Coincidencia del movimiento top (greedy) con el jugado, partidas 2400+ (10.000 posiciones) | 53,3 % |
| Coincidencia del movimiento top (greedy) con el jugado, partidas 1000-1300 (10.000 posiciones) | 42,6 % |
| Sorpresa media del movimiento jugado, partidas 2400+ | 1,40 nats |
| Sorpresa media del movimiento jugado, partidas 1000-1300 | 1,99 nats |
| Movimientos ilegales, top greedy (3.000 posiciones por banda), 2400+ | 0,30 % |
| Movimientos ilegales, top greedy (3.000 posiciones por banda), 1000-1300 | 0,87 % |
| Movimientos ilegales, un movimiento muestreado con T=1, 2400+ | 1,03 % |
| Movimientos ilegales, un movimiento muestreado con T=1, 1000-1300 | 2,03 % |

## Requisitos de hardware

- Pesos: 50,997 M de parámetros implican aproximadamente 102 MB en bf16 y 204 MB en fp32; una conversión a int8 rondaría los 51 MB y a int4 los 25 MB (estimación aritmética, no hay cuantizaciones publicadas).
- Caché KV: con 16 capas, d=512 y 1.024 posiciones, el coste en bf16 es de decenas de MB (estimación derivada de la configuración; no publicada por el autor).
- GPU: cualquier GPU con 1-2 GB de VRAM es suficiente; el modelo se entrenó en una NVIDIA B200, pero para inferencia no necesita hardware de datacenter. Cabe holgadamente en RTX 4090, RTX 3090, RTX 4060, e incluso en iGPU y en CPU.
- Consumer GPU: sí, en cualquier GPU consumer moderna y en la mayoría de portátiles; el cuello de botella es la latencia de generación carácter a carácter, no la memoria.
- Despliegue: la vía soportada es PyTorch con `safetensors` y el código del repositorio (`PGNTransformer`, `generate_moves`), con opción de `torch.compile`. No hay soporte publicado para vLLM, llama.cpp, Ollama ni TGI: la arquitectura es personalizada y el vocabulario es de 33 caracteres, por lo que requeriría conversión y adaptación manual. Una exportación a ONNX es viable pero no está publicada.
- Latencia y throughput: no disponibles en la información proporcionada. Cualquier cifra dependerá del dispositivo y del esquema de reintentos, ya que `generate_moves` escribe caracteres hasta un espacio y devuelve `None` si cinco intentos consecutivos producen un movimiento ilegal.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Entrenamiento | Licencia | Métricas publicadas | Disponibilidad |
|---|---|---|---|---|---|---|
| chess-pgn-2400plus | 50.997.248 | 1.024 caracteres | 10 M partidas Lichess, ambos jugadores 2400+ | MIT | Pérdida 0,3622 bits/car.; acierto greedy 53,3 % (2400+); 0,30 % ilegales | safetensors en HuggingFace |
| chess-pgn-1000-1300 | No disponible en la información (misma receta, según la model card) | No disponible | Partidas Lichess de la banda 1000-1300, misma receta | MIT (según la model card del par) | No disponibles para ese checkpoint | safetensors en HuggingFace |
| Motores de ajedrez clásicos (Stockfish, Leela Chess Zero) | No disponible (arquitecturas y tamaños muy distintos) | No aplica | Búsqueda sobre árbol de variantes y/o redes neuronales + MCTS | GPL-3.0 (Stockfish) / varias | No comparable: siempre generan movimientos legales y juegan a un nivel muy superior | Binarios y pesos ampliamente disponibles |

La comparación relevante es interna al par de modelos del mismo autor: el checkpoint 2400+ reduce la sorpresa media del movimiento jugado de 1,99 a 1,40 nats y el porcentaje de ilegales en greedy de 0,87 % a 0,30 % respecto a las posiciones de la banda baja. Frente a motores, la categoría es distinta: este modelo imita, no busca, y no garantiza legalidad.

## Limitaciones y advertencias

- Movimientos ilegales: el modelo infiere la posición solo de la historia de movimientos y ocasionalmente escribe jugadas no legales (0,30 % en greedy y 1,03 % con muestreo T=1 sobre posiciones 2400+). Cualquier uso en producción requiere un validador externo y un bucle de reintentos.
- Límite de contexto: con 1.024 caracteres, a partir de las jugadas 80-100 aproximadamente el inicio de la partida deja de caber; el modelo pierde el conocimiento de la posición y su tasa de acierto se reduce a la mitad. El entrenamiento nunca muestra caracteres más allá de los primeros 1.024 de cada partida, así que no hay adaptación a secuencias más largas.
- Es un imitador, no un motor: reproduce también los errores de la banda 2400+, no calcula variantes ni tiene concepto de evaluación posicional.
- Sesgo de banda: entrenado exclusivamente con partidas de ambos jugadores por encima de 2400 de Elo y controles de tiempo inicial de al menos 180 segundos; el estilo y las aperturas reflejan ese subconjunto y no el ajedrez en general (ni bullet, ni partidas de nivel bajo, ni variantes).
- Formato rígido: vocabulario de 33 caracteres; no admite comentarios PGN, variantes entre paréntesis, anotaciones NAG ni cabeceras. Las entradas deben respetar el formato `;` + movetext SAN + resultado.
- Idiomas: no procesa lenguaje natural, por lo que no hay soporte multilingüe que evaluar.
- Riesgo de alucinación: en este dominio se manifiesta como movimientos ilegales y como continuaciones plausibles pero incorrectas; no debe usarse como fuente de verdad sobre partidas concretas.
- Licencia: los pesos se publican bajo MIT, lo que permite uso comercial y modificaciones con atribución. Conviene verificar por separado las condiciones de uso de los datos originales de Lichess, que la model card no detalla.
- Madurez: 0 descargas y 0 likes en el momento de la ficha, sin pipeline declarado ni resultados de terceros; trátese como un artefacto de investigación reciente, no como componente validado en producción.
- El código de ejemplo requiere añadir la ruta del snapshot a `sys.path` para importar `pgn_model`, lo que implica ejecutar código del repositorio; conviene revisarlo antes de integrarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Arisp/chess-pgn-2400plus
- Modelo hermano (banda 1000-1300): https://huggingface.co/Arisp/chess-pgn-1000-1300
- Artículo de referencia: Zhang et al., "Transcendence: Generative Models Can Outperform The Experts That Train Them", NeurIPS 2024 (sin URL en la información proporcionada)
- Repositorio de código, paper, demo o blog adicionales: no disponibles en la información proporcionada
