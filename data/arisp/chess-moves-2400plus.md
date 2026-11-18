# Arisp/chess-moves-2400plus

## Resumen

chess-moves-2400plus es un modelo de lenguaje especializado en ajedrez desarrollado por el usuario Arisp, concebido como el gemelo a nivel de jugada de su modelo hermano chess-pgn-2400plus. Se trata de un transformer decoder-only de 52,6 millones de parametros entrenado exclusivamente sobre partidas de Lichess en las que ambos jugadores tenian una puntuacion de 2400 o superior, lo que lo situa en la franja de ajedrez humano fuerte. A diferencia de su gemelo, que trabaja a nivel de caracter sobre notacion SAN, este modelo opera con un token por jugada en notacion UCI, lo que reduce la longitud de secuencia necesaria para cubrir una partida completa.

El modelo nunca ve un tablero ni recibe las reglas del ajedrez de forma explicita: aprende la legalidad de las jugadas de forma implicita a partir de los datos. Su espacio de vocabulario cubre las 1.792 parejas origen-destino posibles para dama o caballo, 176 promociones y tres tokens especiales (inicio de partida y los tres resultados posibles), sumando 1.972 tokens. Es relevante como caso de estudio de modelado de secuencias en un dominio con reglas estrictas y como herramienta de investigacion sobre prediccion de jugadas humanas, no como motor de ajedrez.

Con una ventana de contexto de 184 jugadas y un entrenamiento de 213.500 pasos de optimizador sobre 10 millones de partidas, el modelo alcanza una perdida held-out de 1,3682 nats por token en su checkpoint final. Su licencia MIT y su reducido tamano lo hacen accesible para experimentacion en CPU y GPU de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (16 capas, d=512, 8 cabezas, MLP con ReLU, posiciones aprendidas) |
| Parametros totales | 52.552.704 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 184 jugadas |
| Tipos de cuantizacion | no disponible (pesos en safetensors, presumiblemente fp32/bf16) |
| Idiomas soportados | no disponible (dominio especifico: notacion UCI de ajedrez) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 16 capas con dimension de modelo 512, 8 cabezas de atencion, MLPs con activacion ReLU y embeddings posicionales aprendidos. La diferencia clave respecto a su gemelo a nivel de caracter reside en las capas de embedding y de salida: mientras que el modelo de caracteres cubre 33 tokens, este cubre 1.972, lo que explica el ligero incremento de parametros (52,6 millones frente a los 51 millones del modelo de caracteres). El contexto de 184 jugadas equivale, en numero de partidas por ventana, al contexto de 1.024 caracteres del modelo hermano, de modo que cada paso de entrenamiento ve aproximadamente 270 partidas.

El entrenamiento sigue la misma receta que el modelo de caracteres: entropia cruzada next-token sobre ventanas que comienzan siempre al inicio de una partida, 128 ventanas por paso, AdamW con betas 0,9/0,95 y weight decay 0,1, learning rate 2e-4 tras 2.000 pasos de warmup con decaimiento coseno hasta 2e-5 a lo largo de 200.000 pasos, en bf16 y sobre una unica H100. Posteriormente se aplican tres etapas de fine-tuning, cada una partiendo de los mejores pesos de la anterior con un optimizador nuevo y detencion temprana: peak lr 5e-5, 2e-5 y 1e-5 tras 20.000 pasos de warmup. El checkpoint publicado corresponde a la tercera etapa (`moves-2400+-ft3`) con 213.500 pasos de optimizador acumulados. Los datos son exactamente las mismas partidas que el modelo de caracteres, en el mismo orden: 10.000.000 de partidas de entrenamiento y 5.000 reservadas, extraidas de Lichess entre marzo de 2023 y junio de 2025, con ambos jugadores a 2400 o mas, tiempo base de al menos 180 segundos y tablas conservadas. La media es de 88,4 jugadas por partida.

## Capacidades

- Prediccion de la siguiente jugada en notacion UCI a partir del historial de jugadas de la partida.
- Generacion de partidas completas desde el token de inicio `;` hasta un token de resultado (`1-0`, `0-1`, `1/2-1/2`).
- Aprendizaje implicito de legalidad de jugadas: el modelo predice sobre los 1.972 tokens sin mascara y aprende que jugadas son legales a partir de las partidas, no de las reglas.
- Modelado del estilo de juego humano en la franja 2400+, incluyendo errores propios de ese nivel.
- Estimacion de la sorpresa (log-probabilidad) de una jugada jugada por un humano, util para analisis de partidas.
- Prediccion del resultado de la partida a partir del historial de jugadas.
- Generacion con temperatura (incluida decodificacion greedy con temperatura 0,0) y remuestreo de hasta 5 intentos cuando la jugada predicha es ilegal.
- No dispone de tool calling, capacidades multimodales, vision, audio ni soporte multilingue general.

## Casos de uso

- Analisis de estilo humano en partidas de alto nivel: dado el historial de una partida, el modelo asigna probabilidades a cada jugada y permite cuantificar en que momentos un jugador de 2400+ se desvio de lo esperado, usando la sorpresa en nats como metrica.
- Prediccion de la jugada mas probable de un jugador de 2400+ en una posicion dada: util para construir lineas de referencia de ajedrez humano (no de motor) en estudios de preparacion o en analisis de repertorio.
- Generacion de partidas sinteticas con estilo de 2400+: el modelo puede muestrear partidas completas desde `;` hasta el resultado, lo que sirve para aumentar datos de entrenamiento de otros sistemas o para pruebas de carga en plataformas de ajedrez.
- Investigacion sobre aprendizaje de reglas implicitas: al no haber visto nunca las reglas ni un tablero, es un banco de pruebas para estudiar hasta que punto un transformer decoder-only infiere restricciones simbolicas a partir de secuencias.
- Estimacion del resultado de una partida en curso: el modelo predice el token de resultado al final de la secuencia, lo que permite construir un modelo probabilistico de resultado condicionado al historial de jugadas.
- Comparacion de arquitecturas de tokenizacion en dominios estructurados: al ser el gemelo exacto de chess-pgn-2400plus (mismos datos, misma receta, distinta tokenizacion), permite medir el efecto de la granularidad de token sobre la calidad del modelado (bits por partida, sorpresa de la jugada jugada, prediccion de resultado).
- Educacion y divulgacion: su tamano reducido (52,6 millones de parametros, 0,2 GB de repositorio) permite ejecutarlo en CPU y desplegarlo en entornos docentes para ilustrar el funcionamiento de un transformer sobre un dominio con reglas verificables.

## Benchmarks y rendimiento

Los unicos datos publicados en la model card son las perdidas held-out por etapa de entrenamiento y la comparacion directa con el modelo gemelo a nivel de caracter sobre las mismas 4.875 partidas reservadas (417.045 jugadas).

| Etapa | Mejor tras (pasos) | Perdida held-out (nats por token) |
|---|---|---|
| base | 199.500 | 1,3801 |
| -ft1 | 500 | 1,3767 |
| -ft2 | 1.000 | 1,3749 |
| -ft3 (checkpoint publicado) | 12.500 | 1,3682 |

| Metrica | chess-pgn-2400plus (caracteres) | chess-moves-2400plus (jugadas) |
|---|---|---|
| Bits por partida | 171,7 | 173,0 |
| Sorpresa de la jugada jugada (nats) | 1,3587 | 1,3728 |
| Resultado (nats) | 2,418 | 2,467 |
| Jugada top = jugada jugada | no disponible | 54,9% |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, lo que es esperable dado el dominio especializado del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: con 52,6 millones de parametros, los pesos en fp32 ocupan aproximadamente 210 MB y en bf16 unos 105 MB. La inferencia completa cabe holgadamente en cualquier GPU de consumo con 2 GB o mas de VRAM, y el ejemplo de la model card se ejecuta directamente en CPU (`dev="cpu"`).
- GPU recomendadas: cualquier GPU moderna es suficiente; una RTX 3060, RTX 4090, A100 o H100 no suponen cuello de botella por memoria. El entrenamiento original se hizo en una unica H100.
- Cabe en GPU de consumo: si, en practicamente todas las GPU de consumo actuales, e incluso en CPU.
- Opciones de despliegue: el modelo se carga con PyTorch y safetensors (`safetensors.torch.load_file`) usando la clase `PGNTransformer` incluida en el repositorio. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje general y no a este vocabulario de ajedrez.
- Latencia y throughput: no disponibles en la informacion proporcionada. La generacion incluye remuestreo de hasta 5 intentos cuando la jugada predicha es ilegal, lo que puede multiplicar el coste por jugada en funcion de la tasa de ilegalidad.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tokenizacion | Licencia | Bits por partida | Sorpresa jugada (nats) |
|---|---|---|---|---|---|---|
| chess-moves-2400plus | 52,6 M | 184 jugadas | 1 token por jugada UCI (1.972 tokens) | MIT | 173,0 | 1,3728 |
| chess-pgn-2400plus | ~51 M | 1.024 caracteres | 1 token por caracter SAN (33 tokens) | MIT | 171,7 | 1,3587 |
| Motores de ajedrez clasicos (Stockfish, Leela Chess Zero) | no disponible | no aplica | no aplica | GPL / MIT segun proyecto | no aplica | no aplica (no modelan juego humano) |

La comparativa relevante es con su gemelo a nivel de caracter, ya que comparten datos, receta y arquitectura. El modelo de jugadas obtiene peores metricas de compresion (173,0 frente a 171,7 bits por partida) y mayor sorpresa de la jugada jugada (1,3728 frente a 1,3587 nats), pero ofrece una representacion mas compacta de la partida y una interfaz directa sobre jugadas UCI. Frente a motores de ajedrez, la diferencia es de proposito: este modelo modela el comportamiento de jugadores humanos de 2400+, no busca la mejor jugada.

## Limitaciones y advertencias

- Conoce la posicion unicamente a traves del historial de jugadas; no tiene representacion explicita del tablero ni de las reglas.
- Puede predecir jugadas ilegales; el codigo de generacion las remuestrea hasta 5 intentos y devuelve `None` si los 5 fallan.
- Las partidas de mas de 184 jugadas (aproximadamente el 2% del conjunto) no caben en su contexto.
- Juega como un humano fuerte de su franja, con errores incluidos; no es un motor de ajedrez y no debe usarse como tal.
- Entrenado exclusivamente con partidas de Lichess con ambos jugadores a 2400+, tiempo base de al menos 180 segundos y tablas conservadas; puede no generalizar a otros ritmos, niveles o plataformas.
- No se documentan evaluaciones de sesgo, robustez ni comportamiento fuera de distribucion.
- La licencia MIT permite uso comercial, pero no se ofrecen garantias sobre la calidad o adecuacion del modelo para produccion.
- No dispone de soporte multilingue, tool calling, vision ni otras capacidades propias de modelos de lenguaje generales.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en la comunidad ni validacion externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Arisp/chess-moves-2400plus
- Modelo gemelo a nivel de caracter: https://huggingface.co/Arisp/chess-pgn-2400plus
- Repositorio de Lichess (origen de los datos): https://lichess.org
