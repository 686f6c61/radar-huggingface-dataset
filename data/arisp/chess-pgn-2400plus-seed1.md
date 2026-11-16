# Arisp/chess-pgn-2400plus-seed1

## Resumen

chess-pgn-2400plus-seed1 es un modelo de lenguaje de caracteres (character-level) especializado en notación PGN de ajedrez, desarrollado por el usuario Arisp y publicado en Hugging Face bajo licencia MIT. Se trata de un transformer de 51 millones de parámetros entrenado para predecir el siguiente carácter en secuencias PGN, lo que le permite generar partidas de ajedrez completas en formato estándar. El modelo se entrenó sobre 10 millones de partidas de Lichess en las que ambos jugadores tenían una puntuación Elo de 2400 o superior.

Este checkpoint concreto es una réplica de control del modelo principal `chess-pgn-2400plus` (referido como S en su documentación): comparte arquitectura, datos y ficheros, pero se entrenó desde una semilla aleatoria distinta (seed 1 frente a seed 0 de S). Su propósito no es superar a S, sino servir de referencia para medir la variabilidad intrínseca del entrenamiento: cualquier diferencia observada entre S y otro modelo solo es significativa si supera la diferencia entre S y este seed1. Adicionalmente, el schedule de learning rate difiere (una única cosine de 250.000 pasos frente a la receta con reinicios de S).

La relevancia del modelo es acotada pero clara para la comunidad de investigación en ajedrez y en modelos generativos: ofrece un punto de comparación reproducible para estudiar cuánto de lo que genera un modelo de ajedrez se debe al aprendizaje y cuánto al azar del proceso de entrenamiento. No es un motor de ajedrez ni pretende serlo; es un modelo de imitación de partidas humanas de alto nivel.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer character-level (PGNTransformer) |
| Parámetros totales | 50.997.248 (≈51 M) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 caracteres (ventana de entrenamiento) |
| Tipos de cuantización | no disponible (pesos en safetensors, presumiblemente fp32/bf16) |
| Idiomas soportados | no disponible (el modelo opera sobre notación PGN, no lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | safetensors (model.safetensors) + config.json |

## Arquitectura y entrenamiento

El modelo es un transformer a nivel de carácter que procesa secuencias PGN de 1.024 caracteres, cada una comenzando al inicio de una partida. El entrenamiento emplea entropía cruzada sobre el siguiente carácter, con 128 ventanas (131.072 caracteres) por paso, optimizador AdamW (betas 0,9/0,95, weight decay 0,1), precisión bf16 y una única NVIDIA B200. El learning rate es 0,0002 tras 2.000 pasos de warmup, con decaimiento cosine hasta 2e-05 a lo largo de 250.000 pasos, sin early stopping. El checkpoint publicado corresponde al mejor loss de validación, en el paso 242.500.

La diferencia respecto al modelo S no es solo la semilla: S usó un schedule cosine de 200.000 pasos seguido de tres reinicios cortos de fine-tuning, mientras que este modelo ejecutó una única cosine de 250.000 pasos. Por tanto, S y seed1 difieren tanto en inicialización como en schedule de learning rate. El conjunto de entrenamiento son 10 millones de partidas de Lichess con ambos jugadores por encima de 2400 Elo, y la evaluación se realizó sobre 5.000 partidas reservadas.

## Capacidades

- Generación de partidas de ajedrez completas en formato PGN carácter a carácter, imitando el estilo de jugadores de 2400+ Elo.
- Predicción del siguiente movimiento dado un historial de movimientos en notación algebraica estándar (SAN).
- Generación condicionada por temperatura (incluida temperatura 0,0 para decodificación determinista).
- Validación de legalidad mediante reintentos: la función `generate_moves` intenta hasta 5 veces producir un movimiento legal, devolviendo `None` si no lo consigue.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multimodales.
- No es multilingüe en el sentido convencional: su "vocabulario" son los caracteres que componen la notación PGN.

## Casos de uso

- Investigación sobre variabilidad de entrenamiento: comparar las partidas generadas por S y por seed1 permite estimar cuánta diferencia entre dos modelos es atribuible al azar de la semilla y el schedule, y cuánta a cambios reales de arquitectura o datos.
- Generación de partidas sintéticas de alto nivel para aumentar datasets de ajedrez: el modelo produce secuencias PGN plausibles de jugadores 2400+ que pueden usarse como datos aumentados en tareas de análisis o entrenamiento de modelos auxiliares.
- Estudio de estilos de juego: al imitar a jugadores de élite, permite analizar qué aperturas, estructuras y patrones tácticos emergen de forma consistente en las generaciones.
- Evaluación de modelos de lenguaje sobre dominios estructurados: sirve como caso de estudio de modelado character-level en un dominio con gramática estricta (PGN) y restricciones de legalidad.
- Reproducción de experimentos: al ser un checkpoint de control con receta documentada paso a paso, facilita la replicación de resultados en entornos de investigación con recursos limitados (51 M de parámetros, 0,2 GB de repo).
- Docencia y divulgación: un modelo pequeño y ligero que cabe en CPU permite ilustrar conceptos de modelado de secuencias, decodificación y evaluación con pérdida en bits por carácter en un dominio tangible como el ajedrez.

## Benchmarks y rendimiento

| Métrica | chess-pgn-2400plus-seed1 | chess-pgn-2400plus (S) |
|---|---|---|
| Loss de validación (bits por carácter) | 0,3566 | 0,3622 |
| Loss de validación (nats) | 0,2472 | 0,2511 |
| Partidas de validación | 5.000 | 5.000 |
| Paso del checkpoint | 242.500 | no disponible |

No se han publicado resultados de benchmarks de juego (Elo, precisión de movimientos legales, resolución de puzzles) en la información disponible. El autor indica explícitamente que el modelo "aún no ha sido evaluado en partidas ni en puzzles".

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (51 M de parámetros ≈ 204 MB de pesos), y del orden de 100-200 MB en bf16/fp16.
- GPU recomendadas: cualquier GPU moderna es suficiente; el autor entrenó en una NVIDIA B200, pero la inferencia no requiere hardware de datacenter.
- Cabe holgadamente en GPU de consumo (RTX 3060, RTX 4090, etc.) e incluso en CPU, como demuestra el ejemplo de uso con `dev="cpu"`.
- Opciones de despliegue: PyTorch nativo con `safetensors` y el módulo `pgn_model` incluido en el repo; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada; dado el tamaño, la generación carácter a carácter en CPU es viable pero secuencial.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| chess-pgn-2400plus-seed1 | ≈51 M | 1.024 caracteres | Character-level PGN, imitación 2400+ | MIT | Hugging Face |
| chess-pgn-2400plus (S) | ≈51 M | 1.024 caracteres | Character-level PGN, imitación 2400+ | MIT | Hugging Face |
| Motores de ajedrez clásicos (Stockfish, Leela) | no aplica | no aplica | Búsqueda + evaluación | GPL / varias | Amplia |

No se dispone de información sobre otros modelos comparables de generación de PGN en la documentación proporcionada. La comparación más directa es con S, del mismo autor, que comparte arquitectura y datos pero difiere en semilla y schedule de learning rate.

## Limitaciones y advertencias

- El modelo conoce la posición únicamente a partir del historial de movimientos; no tiene representación explícita del tablero.
- Ocasionalmente genera movimientos ilegales; la función de generación reintenta hasta 5 veces y puede devolver `None`.
- Más allá de los movimientos 80-100, la partida deja de caber en la ventana de 1.024 caracteres y el modelo pierde contexto.
- Imita a jugadores de 2400+, incluidos sus errores; no es un motor de ajedrez y no debe usarse como tal.
- No ha sido evaluado en partidas ni en puzzles, por lo que no hay evidencia de su fuerza de juego real.
- Riesgo de alucinación inherente al modelado generativo: puede producir secuencias PGN sintácticamente válidas pero incoherentes con la posición.
- No se documentan sesgos específicos ni limitaciones idiomáticas más allá de las propias del dominio.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantías ni soporte.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Arisp/chess-pgn-2400plus-seed1
- Modelo principal S: https://huggingface.co/Arisp/chess-pgn-2400plus
