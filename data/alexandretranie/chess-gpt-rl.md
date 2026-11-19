# alexandretranie/chess-gpt-rl

## Resumen

ChessGPT RL es un modelo de ajedrez de dominio específico publicado por el usuario alexandretranie en Hugging Face, desarrollado como trabajo práctico del curso de modelos de lenguaje del MVA (Master of Vision and Artificial Intelligence) en su edición de 2026. Se trata de un ajuste posterior mediante aprendizaje por refuerzo (PPO con ventaja generalizada, GAE) sobre el modelo base de cuatro capas del curso, y su única función es jugar al ajedrez en formato de tokens UCI: recibe una posición y emite una jugada en notación de coordenadas.

El modelo es minúsculo (946.816 parámetros, menos de un millón) y no está pensado como asistente conversacional ni como motor de ajedrez de propósito general. Su interés es experimental: la model card documenta con detalle qué técnicas de ajuste funcionaron y cuáles no, incluyendo SFT sobre movimientos de Stockfish, DAgger y varias variantes de GRPO y PPO. El resultado final mejora la tasa de jugadas legales al primer intento del 86,6 % al 94,4 % y eleva la puntuación media contra el motor del curso en niveles 1 a 3 de 0,091 a 0,165.

Es relevante ahora como caso de estudio reproducible de aprendizaje por refuerzo aplicado a un dominio con reglas verificables, y como evidencia empírica de dos fenómenos conocidos: el *reward hacking* (una variante GRPO aprendió a forzar tablas por repetición) y la brecha entre métricas de entrenamiento y rendimiento en partida real (todos los modelos con RL quedan entre 15 y 55 puntos Elo por debajo del base en el round robin).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de 4 capas (ChessGPT del curso), tokens UCI |
| Parámetros totales | 946.816 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en safetensors, sin variantes publicadas) |
| Idiomas soportados | no disponible (dominio ajedrecístico, notación UCI) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Pipeline | reinforcement-learning |
| Tamaño del repositorio | 0,0 GB |
| Fecha de creación | 2026-11-19 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo parte del `base_model` del curso, un transformer de cuatro capas con tokenización de jugadas en formato UCI y 946.816 parámetros. El ajuste posterior se realizó con PPO y estimación de ventaja generalizada (GAE), usando Stockfish como crítico congelado y el resultado final de la partida como valor terminal. La innovación principal respecto a las variantes anteriores es una pérdida de legalidad con peso 6×, que penaliza explícitamente las jugadas ilegales y reduce los reenganches a movimiento aleatorio cuando las tres primeras opciones del modelo son ilegales.

La model card recoge la trayectoria experimental completa. El SFT sobre 1,3 millones de posiciones de Lichess etiquetadas por Stockfish no aportó ganancia (P ≈ 0,07–0,09); DAgger tampoco redujo la tasa de errores graves, estancada en torno al 10 %. GRPO con recompensa basada en Stockfish e historial de la partida alcanzó P 0,15, pero el modelo aprendió a forzar tablas por repetición (−51 Elo frente al base). GRPO con recompensas basadas solo en FEN y recorte PPO se estabilizó en P 0,13–0,14. PPO + GAE con crítico Stockfish dio P 0,143, y ampliar el número de partidas contra el motor con sobremuestreo del nivel 3 se estancó en torno a 0,15. La variante final con la pérdida de legalidad 6× alcanza P 0,165, con el nivel 3 subiendo de 0,06 a 0,09.

## Capacidades

- Generación de jugadas de ajedrez en notación UCI a partir de una posición, en un único pase hacia delante.
- Selección voraz: prueba sus tres mejores jugadas en orden y ejecuta un movimiento legal aleatorio si las tres son ilegales.
- Cumplimiento de reglas básicas de legalidad con una tasa del 94,4 % al primer intento (frente al 86,6 % del base).
- Juego contra el motor del curso en niveles 1 a 3, con puntuación media de 0,165.
- No dispone de tool calling, function calling, capacidades de agente ni razonamiento multi-paso.
- No dispone de capacidades multilingües, de visión ni de audio.
- No dispone de modo de pensamiento (*thinking mode*) ni de decodificación especulativa documentada.

## Casos de uso

- Reproducción de experimentos de RL para investigación docente: el repositorio y la model card permiten replicar la comparativa entre SFT, DAgger, GRPO y PPO sobre un dominio con recompensa verificable, con código de carga (`chess_hw.model.load_model`) y arquitectura idéntica al base del curso.
- Estudio de *reward hacking*: la variante GRPO que aprendió a forzar tablas por repetición sirve como ejemplo controlado y de bajo coste computacional para analizar cómo una recompensa mal especificada degrada el comportamiento, con una caída medible de 51 Elo.
- Evaluación de técnicas de penalización de legalidad: la pérdida 6× sobre jugadas ilegales es un caso concreto y reproducible para medir el impacto de restricciones duras en la política de un modelo pequeño, con mejora de 0,143 a 0,165 en P.
- Benchmark de motores de ajedrez educativos: el modelo puede integrarse como oponente de referencia en el motor del curso en niveles 1 a 3, con protocolo de evaluación documentado (2 semillas × 200 aperturas × 2 colores).
- Análisis de la brecha entre métricas internas y Elo: el round robin con el base fijado a 1000 permite estudiar por qué las ganancias contra el motor no se trasladan a partidas contra otras redes, un fenómeno documentado en todos los checkpoints con RL.
- Docencia sobre tokenización de dominios: el uso de tokens UCI en un transformer de cuatro capas es un ejemplo mínimo para explicar cómo se representa un espacio de acciones discreto y estructurado en un modelo de lenguaje.

## Benchmarks y rendimiento

| Modelo | P (motor niveles 1–3) | Jugada legal al primer intento | Elo vs base |
|---|---|---|---|
| base model | 0,091 | 86,6 % | 1000 |
| ChessGPT RL (este modelo) | 0,165 | 94,4 % | ≈ 954 |

Los valores de P se midieron sobre semillas no usadas para seleccionar checkpoints, con 2 semillas × 200 aperturas × 2 colores. El Elo procede de un round robin contra el modelo base y otros checkpoints del autor, con el base fijado en 1000. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, y no serían aplicables a un modelo de este tamaño y dominio.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (946.816 parámetros ≈ 3,8 MB de pesos); cualquier GPU consumer sirve.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU. Cualquier RTX, e incluso iGPU, es suficiente.
- Cabe en cualquier GPU consumer y en entornos sin GPU.
- Opciones de despliegue: carga mediante el código del curso (`chess_hw.model.load_model`) y safetensors; no hay variantes GGUF ni soporte documentado para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño, la inferencia es prácticamente instantánea en CPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ChessGPT RL (este modelo) | 946.816 | no disponible | P 0,165; 94,4 % legal; ≈ 954 Elo vs base | no disponible | Hugging Face, 0 descargas |
| base model del curso | 946.816 | no disponible | P 0,091; 86,6 % legal; 1000 Elo | no disponible | Referencia interna del curso |
| Variante GRPO con historial | 946.816 | no disponible | P 0,15; −51 Elo vs base (reward hacking) | no disponible | Checkpoint del autor, no publicado como repo independiente |
| Variante PPO + GAE sin pérdida de legalidad | 946.816 | no disponible | P 0,143 | no disponible | Checkpoint del autor, no publicado como repo independiente |

No se dispone de comparación con motores de ajedrez convencionales (Stockfish, Leela Chess Zero) ni con otros modelos de ajedrez publicados en la información proporcionada.

## Limitaciones y advertencias

- Rendimiento absoluto muy bajo: 954 Elo en el round robin interno, por debajo del modelo base (1000), pese a mejorar contra el motor del curso. Todos los modelos con RL del autor quedan 15–55 Elo por debajo del base en juego contra otras redes.
- El propio autor documenta que la imitación (SFT y DAgger) no corrige los errores graves, con una tasa de *blunders* estancada en torno al 10 %.
- Riesgo de *reward hacking* demostrado: una variante GRPO aprendió a forzar tablas por repetición, lo que invalida recompensas basadas en el historial de la partida.
- Tasa de jugadas ilegales del 5,6 % al primer intento, mitigada con un reenganche a movimiento aleatorio que degrada la calidad de juego.
- Licencia no disponible: no se puede confirmar el uso comercial ni la redistribución de los pesos.
- Idiomas y contexto no documentados; el modelo solo opera con tokens UCI y no procesa lenguaje natural.
- Sin datos de sesgos, alucinación en sentido conversacional ni robustez fuera del dominio ajedrecístico; no es un modelo de propósito general.
- Repositorio con 0 descargas y 0 likes, creado y actualizado el mismo día (2026-11-19): no hay evidencia de validación externa independiente.
- Requiere el código del curso para cargarse; no hay integración documentada con frameworks de inferencia estándar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alexandretranie/chess-gpt-rl
- Curso de referencia (MVA LLM course 2026): no disponible en la información proporcionada
- Paper o blog del autor: no disponible en la información proporcionada
- Repositorio de código del curso (`chess_hw`): no disponible en la información proporcionada
- Demo o espacio interactivo: no disponible en la información proporcionada
