# Arisp/chess-moves-1000-1300

## Resumen

chess-moves-1000-1300 es un transformer decoder-only de 52,6 millones de parámetros desarrollado por el usuario Arisp, especializado en la generación de partidas de ajedrez a nivel de movimiento individual. Se trata del gemelo a nivel de jugada de chess-pgn-1000-1300: comparte arquitectura, datos y receta de entrenamiento con ese modelo, pero opera sobre un vocabulario de 1.972 tokens que codifican movimientos UCI en lugar de caracteres de notación algebraica. El modelo se entrenó exclusivamente con partidas de Lichess en las que ambos jugadores tenían un Elo entre 1000 y 1300, y nunca se le proporcionó un tablero ni las reglas del ajedrez: aprende la legalidad de los movimientos a partir de las propias partidas.

La relevancia de este modelo es fundamentalmente metodológica y de investigación: demuestra que un transformer de escala reducida puede aprender la estructura del ajedrez (legalidad, fases de la partida, patrones de apertura y medio juego) a partir de secuencias de movimientos, sin conocimiento previo del dominio. Forma pareja con chess-moves-2400plus, del que solo difiere en el rango de Elo de las partidas de entrenamiento, lo que permite estudiar cómo la calidad de los datos afecta al comportamiento del modelo con una arquitectura y un entrenamiento idénticos.

El modelo tiene un contexto de 184 movimientos, suficiente para albergar aproximadamente 2,9 partidas de esta banda por ventana, y se distribuye bajo licencia MIT con pesos en formato safetensors. No está pensado como motor de ajedrez, sino como modelo de lenguaje especializado que imita el juego humano de una franja de nivel concreta, incluyendo sus errores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (16 capas, d=512, 8 cabezas, MLPs ReLU, posiciones aprendidas) |
| Parametros totales | 52.552.704 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 184 movimientos |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin versiones GGUF publicadas) |
| Idiomas soportados | no disponible (dominio especifico: notacion UCI de ajedrez) |
| Licencia | MIT |
| Formato de pesos | safetensors (model.safetensors) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 16 capas con dimensión oculta 512, 8 cabezas de atención, MLPs con activación ReLU y embeddings posicionales aprendidos. El vocabulario comprende 1.972 tokens: 1.792 pares desde-hasta que una dama o un caballo podrían realizar (el enroque se codifica como e1g1, etc.), 176 promociones, el token `;` que marca el inicio de partida y los tres resultados posibles (`1-0`, `0-1`, `1/2-1/2`). Una partida se representa como `; e2e4 e7e5 g1f3 ... 1-0`. No se aplica enmascaramiento: el modelo predice sobre los 1.972 tokens y aprende la legalidad de los movimientos a partir de las partidas.

El entrenamiento utilizó exactamente las mismas partidas que chess-pgn-1000-1300, en el mismo orden: 10.000.000 de partidas de entrenamiento y 5.000 reservadas para validación, todas de Lichess con ambos jugadores entre 1000 y 1300 de Elo, tiempo base mayor o igual a 180 segundos y tablas incluidas. La conversión de SAN a movimientos produjo una media de 61,1 movimientos por partida de entrenamiento (610,6 millones de movimientos en total). El entrenamiento base empleó entropía cruzada next-token sobre ventanas que comienzan al inicio de una partida, con 128 ventanas de 184 movimientos (23.552 tokens) por paso, AdamW (0,9/0,95, weight decay 0,1), learning rate 2e-4 tras 2.000 pasos de warmup con decaimiento coseno hasta 2e-5 a lo largo de 200.000 pasos, precisión bf16 y una GPU B200. Se aplicó parada temprana tras 16 evaluaciones sin mejora contadas después de la primera época, sin que se activara. Posteriormente se ejecutaron tres etapas de fine-tuning, cada una partiendo de los mejores pesos de la etapa anterior con un optimizador nuevo y parada temprana: pico de learning rate 5e-5, luego 2e-5 y finalmente 1e-5 tras 20.000 pasos de warmup.

Los resultados de pérdida en validación (nats por movimiento) fueron: base 1,5376 tras 199.000 pasos; ft1 1,5358 tras 500 pasos; ft2 1,5343 tras 1.000 pasos; ft3 1,5311 tras 12.000 pasos. El checkpoint publicado corresponde a la etapa ft3, con 212.500 pasos de optimizador acumulados en su trayectoria (frente a los 213.500 de chess-moves-2400plus).

## Capacidades

- Generación de partidas de ajedrez completas movimiento a movimiento en notación UCI, desde el token de inicio de partida hasta el resultado.
- Predicción del siguiente movimiento dada una secuencia de movimientos previos, sin acceso al tablero ni a las reglas.
- Aprendizaje implícito de la legalidad de movimientos: el modelo predice sobre los 1.972 tokens y solo el 1,7% de las muestras resultan ilegales en posiciones de la banda 1000-1300.
- Modelado de partidas humanas de nivel principiante-intermedio (Elo 1000-1300), incluyendo errores característicos de esa franja.
- Generación de resultados de partida (victoria de blancas, victoria de negras o tablas) como tokens de vocabulario.
- Capacidad de manejar aproximadamente 2,9 partidas por ventana de contexto, lo que permite concatenar partidas en una misma secuencia.
- No dispone de tool calling, function calling, capacidades de agente, visión, audio, modo thinking ni soporte multilingüe general.

## Casos de uso

- Investigación sobre aprendizaje de reglas sin supervisión: el modelo permite estudiar cómo un transformer aprende la legalidad del ajedrez únicamente a partir de secuencias de movimientos, sin tablero ni reglas explícitas, comparando su tasa de movimientos ilegales (1,7%) con la de modelos entrenados con conocimiento del dominio.
- Estudio comparativo de calidad de datos: al compartir arquitectura, tokenizador, contexto, optimizador y schedule con chess-moves-2400plus, permite aislar el efecto del rango de Elo de las partidas de entrenamiento sobre el comportamiento del modelo (52,3% frente a 40,8% de acierto en la banda 1000-1300 y 2400+ respectivamente).
- Generación de datos sintéticos de ajedrez de nivel principiante: útil para aumentar datasets de partidas de baja/media calidad o para entrenar modelos de predicción de movimientos humanos en esa franja de Elo.
- Análisis de estilo de juego por nivel: el modelo imita los patrones de la banda 1000-1300, incluidos los errores, lo que permite estudiar qué tipos de imprecisiones son características de ese nivel frente a jugadores más fuertes.
- Benchmark de modelos de lenguaje de dominio específico: sirve como referencia de un transformer pequeño (52,6M parámetros) entrenado en un dominio cerrado, útil para comparar estrategias de tokenización (movimiento frente a carácter) y de entrenamiento.
- Educación y divulgación: permite ilustrar cómo se comporta un modelo generativo que solo ha visto secuencias de movimientos, mostrando sus aciertos y sus alucinaciones (movimientos ilegales) en charlas o materiales docentes sobre IA y ajedrez.
- Reproducción de experimentos: la receta de entrenamiento está documentada con detalle (pasos, learning rates, tamaño de batch, parada temprana), lo que facilita replicar el experimento en otros rangos de Elo o dominios.

## Benchmarks y rendimiento

Los únicos datos publicados en la model card son métricas de acierto de movimiento y tasa de ilegalidad sobre posiciones reservadas (1.000 posiciones de cada banda, eligiendo el mejor movimiento legal):

| Metrica | 1000-1300 games | 2400+ games |
|---|---|---|
| Acierto del movimiento predicho (top move = movimiento jugado) | 52,3% | 40,8% |
| chess-pgn-1000-1300 (referencia) | 52,1% | 41,1% |
| Probabilidad sobre movimientos ilegales (T=1, una muestra) | 1,7% | 2,2% |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ya que el modelo está especializado en ajedrez y no en tareas de lenguaje general.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,2 GB en fp32 (52,6M parámetros × 4 bytes), alrededor de 0,1 GB en bf16/fp16. El tamaño del repositorio es de 0,2 GB.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el modelo se ha ejecutado en CPU según el ejemplo de la model card (`dev="cpu"`). Para lotes grandes, una RTX 4090, A100 o H100 ofrecerían throughput muy alto, aunque el modelo es tan pequeño que la latencia vendrá dominada por el bucle de generación y la validación de legalidad con python-chess.
- Cabe holgadamente en cualquier GPU consumer, incluida una GTX 1650 o una iGPU con suficiente memoria compartida.
- Opciones de despliegue: PyTorch con safetensors y el código del repositorio (`pgn_model.py`, `move_tokens.py`); no se han publicado versiones GGUF, por lo que llama.cpp u Ollama no son directamente aplicables sin conversión. vLLM y TGI no están soportados de forma nativa para esta arquitectura personalizada.
- Latencia y throughput estimados: no disponibles en la información proporcionada. El proceso de generación incluye hasta 5 reintentos en caso de movimiento ilegal, lo que añade coste variable por jugada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Acierto 1000-1300 |
|---|---|---|---|---|---|
| chess-moves-1000-1300 | 52,6M | 184 movimientos | Movimiento UCI, banda 1000-1300 | MIT | 52,3% |
| chess-pgn-1000-1300 | no disponible | no disponible | Carácter SAN, banda 1000-1300 | MIT | 52,1% |
| chess-moves-2400plus | 52,6M (misma arquitectura) | 184 movimientos | Movimiento UCI, banda 2400+ | MIT | 40,8% (en 2400+) |

La comparación más directa es con chess-pgn-1000-1300, su gemelo a nivel de carácter: ambos alcanzan un acierto prácticamente idéntico (52,3% frente a 52,1%) sobre las mismas posiciones, lo que sugiere que la tokenización por movimiento no degrada el rendimiento y reduce la longitud de secuencia. Frente a chess-moves-2400plus, la única diferencia son las partidas de entrenamiento, lo que convierte a ambos en un par controlado para estudiar el efecto de la calidad de los datos.

## Limitaciones y advertencias

- El modelo conoce la posición únicamente a través del historial de movimientos; no tiene representación explícita del tablero ni de las reglas.
- Puede predecir movimientos ilegales (1,7% en la banda 1000-1300, 2,2% en 2400+); el código de ejemplo los re-muestrea hasta 5 intentos, devolviendo `None` si todos fallan.
- Las partidas de más de 184 movimientos no caben en su contexto (el 0,18% de las partidas reservadas superan esa longitud).
- Juega como un humano de la banda 1000-1300, con errores incluidos; no es un motor de ajedrez y no debe usarse para análisis de alto nivel ni para juego competitivo.
- No se han documentado sesgos específicos más allá del sesgo inherente a los datos de Lichess de esa franja de Elo (estilos de juego, aperturas populares en la plataforma, distribución de resultados).
- No hay información sobre rendimiento en idiomas distintos del dominio del ajedrez; el vocabulario está cerrado a movimientos y resultados.
- Licencia MIT: permite uso comercial y modificación, pero no se ofrece garantía alguna sobre el comportamiento del modelo.
- El modelo no soporta tool calling, agentes ni instrucciones en lenguaje natural; su interfaz es exclusivamente secuencial sobre tokens de movimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Arisp/chess-moves-1000-1300
- Modelo gemelo a nivel de carácter: https://huggingface.co/Arisp/chess-pgn-1000-1300
- Modelo de la banda 2400+: https://huggingface.co/Arisp/chess-moves-2400plus
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la información proporcionada.
