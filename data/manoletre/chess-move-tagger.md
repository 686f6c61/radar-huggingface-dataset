# manoletre/chess-move-tagger

## Resumen

Chess-move-tagger (v3.3) es un modelo de clasificación de tokens (token classification) especializado en el análisis de texto sobre ajedrez, desarrollado por manoletre a partir del modelo base LiquidAI/LFM2.5-Encoder-230M, un encoder compacto de la familia LFM de Liquid AI. El modelo lee texto en lenguaje natural sobre ajedrez (notación SAN, UCI, algebraica larga o prosa como "the queen slides to h8") y extrae entidades con spans exactos de caracteres: jugadas, piezas, casillas, diagonales y regiones del tablero, además de afirmaciones verificables (jaque, mate, gana material, ataques, evaluaciones).

Su caso de uso original es servir como proceso reward para RL sobre un LLM que juega al ajedrez: en lugar de recompensar solo la jugada final, permite premiar reflexiones que contienen ajedrez verdadero. Es importante destacar que el modelo solo detecta; la verificación de las afirmaciones contra el tablero se hace con código determinista (python-chess o chess.js). Con 229,7 millones de parámetros y una exportación ONNX cuantizada a 4 bits, es lo bastante ligero para ejecutarse directamente en el navegador, lo que lo hace relevante para pipelines de verificación de razonamiento ajedrecístico a bajo coste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder LFM2.5 (basado en LiquidAI/LFM2.5-Encoder-230M) con capa lineal de salida sobre cada token, dividida en cinco cabezas de clasificación |
| Parametros totales | 229.730.084 |
| Parametros activos | no disponible (no es MoE; todos los parámetros son activos) |
| Longitud de contexto | 512 tokens (longitud máxima de entrada) |
| Tipos de cuantizacion | ONNX cuantizado a 4 bits (además de pesos en precisión completa en safetensors) |
| Idiomas soportados | Inglés (texto ajedrecístico en inglés) |
| Licencia | LFM Open License v1.0 (lfm1.0, tipo "other" en HuggingFace) |
| Formato de pesos | safetensors y ONNX (exportación 4 bits en tres partes) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de LiquidAI/LFM2.5-Encoder-230M (revisión `0b649ad`), un encoder de la familia LFM (Liquid Foundation Models) de Liquid AI. Sobre el encoder se añade una capa lineal de salida aplicada a cada token, dividida en cinco cabezas de clasificación: una cabeza de menciones con esquema BIO (MOVE, PIECE, SQUARE, FILE, RANK, DIAGONAL, REGION), una cabeza de línea sobre los spans de jugada (NEW, NEXT, ALT), una cabeza de postura sobre los spans de jugada (CHOSEN, REJECTED, CONSIDERED), una cabeza de marco temporal sobre piezas y afirmaciones (NOW, AFTER) y una cabeza de afirmaciones con BIO (CHECK, MATE, WINS, ATTACKS, FLIGHT, EVAL).

Los datos y reglas de etiquetado están publicados en el repositorio de GitHub del proyecto, junto con las curvas de entrenamiento en el archivo `training_history.json` del repositorio de HuggingFace. No se ha publicado información sobre el número de tokens de entrenamiento, la composición detallada del dataset ni el uso de técnicas como RLHF o DPO. La innovación principal no es arquitectónica sino funcional: combinar detección neuronal de entidades y afirmaciones con verificación determinista externa (python-chess / chess.js), un patrón típico de verificador híbrido para reward modeling.

## Capacidades

- Detección de jugadas de ajedrez en texto, en notación SAN, UCI, algebraica larga o prosa en inglés, con spans exactos de caracteres.
- Clasificación de cada jugada según su función en la línea: NEW (desde la posición actual), NEXT (tras la jugada previa) o ALT (respuesta alternativa a la jugada previa).
- Clasificación de la postura del texto hacia cada jugada: elegida (CHOSEN), rechazada (REJECTED) o solo considerada (CONSIDERED).
- Detección de piezas, casillas, columnas, filas, diagonales y regiones del tablero (centro, flanco de rey, etc.).
- Detección de afirmaciones verificables: jaque, mate, gana material, ataques/cubre, casillas a las que el rey puede o no ir (flight) y evaluaciones.
- Etiquetado del marco temporal de piezas y afirmaciones: NOW (posición actual) o AFTER (tras la jugada discutida).
- Salida estructurada con etiquetas por token, apta para verificación posterior con código determinista (python-chess, chess.js).
- Ejecución en navegador mediante la exportación ONNX de 4 bits con onnxruntime-web.

## Casos de uso

- Proceso reward para RL de LLMs ajedrecísticos: etiqueta las reflexiones del modelo jugador y permite recompensar razonamientos con ajedrez verdadero, no solo la jugada final correcta; es el caso de uso para el que fue construido.
- Verificación de razonamiento ajedrecístico en pipelines de evaluación: las afirmaciones detectadas (jaque, mate, ataques, vuelo del rey) se validan de forma determinista con python-chess, permitiendo auditar automáticamente explicaciones generadas por LLMs.
- Minería de texto ajedrecístico: extracción estructurada de jugadas y variantes de libros, artículos, comentarios de partidas o transcripciones para construir datasets de entrenamiento o bases de datos de aperturas.
- Análisis de comentarios de partidas en directo: clasificar qué jugadas el comentarista propone, descarta o considera, útil para estudios de estilo o para reconstruir líneas de análisis a partir de prosa.
- Herramientas educativas de ajedrez: resaltar en un interfaz web qué jugadas y afirmaciones menciona un texto didáctico, comprobando en el tablero si son correctas; la demo en navegador con ONNX 4 bits facilita este despliegue sin servidor.
- Moderación o control de calidad de contenido ajedrecístico generado por LLMs: detectar afirmaciones falsas (por ejemplo, un mate inexistente) antes de publicar contenido generado automáticamente.
- Construcción de datasets etiquetados de prosa ajedrecística: los spans exactos de caracteres facilitan la anotación y el alineamiento texto-tablero para investigación posterior.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card, medidos sobre reflexiones reales de held-out:

| Métrica | PyTorch | ONNX 4 bits |
|---|---|---|
| F1 menciones (BIO) | 0,987 | 0,986 |
| F1 afirmaciones (BIO) | 0,939 | 0,939 |
| Accuracy línea (NEW/NEXT/ALT) | 0,995 | no disponible |
| Accuracy postura (CHOSEN/REJECTED/CONSIDERED) | 0,996 | no disponible |
| Accuracy marco (NOW/AFTER) | 0,989 | no disponible |

Punto débil declarado: ante formulaciones no vistas (probe de nuevas redacciones), las afirmaciones de mate y jaque se detectan el 73 % y el 82 % de las veces respectivamente. No se han publicado comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja. Con ~230 M de parámetros, el modelo en precisión completa ocupa aproximadamente 0,9 GB (coherente con el tamaño del repo de 1,1 GB); la versión ONNX 4 bits es sustancialmente menor. No se han publicado cifras exactas de VRAM.
- GPU recomendadas: no requiere GPU dedicada; cualquier GPU moderna es suficiente. Puede ejecutarse en CPU sin problema dado su tamaño.
- Consumer GPU: cabe con holgura en cualquier GPU de consumo (RTX 3060, RTX 4090 o inferiores); de hecho, la demo oficial funciona en el navegador del usuario mediante onnxruntime-web con el export ONNX de 4 bits, sin GPU.
- Opciones de despliegue: PyTorch con los pesos safetensors (usando las clases `ChessTagger` y `verify` del repositorio de GitHub), ONNX Runtime (incluido onnxruntime-web en navegador), y en principio compatible con el ecosistema HuggingFace de token classification. No se menciona soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible. Al ser un encoder de 230 M con entrada máxima de 512 tokens, la latencia esperada es de milisegundos por texto en GPU y baja en CPU, pero no hay medidas publicadas.

## Comparativa con modelos similares

No existen modelos comparables publicados específicamente para esta tarea (etiquetado de jugadas y afirmaciones ajedrecísticas con spans y verificación determinista). Como referencia de contexto, se compara con su modelo base y con la categoría general:

| Modelo | Parametros | Tarea | Contexto | Licencia |
|---|---|---|---|---|
| manoletre/chess-move-tagger | 229,7 M | Token classification ajedrecística (5 cabezas) | 512 tokens | LFM Open License v1.0 |
| LiquidAI/LFM2.5-Encoder-230M (base) | ~230 M | Encoder de propósito general | no disponible | LFM Open License v1.0 |
| BERT-base / DeBERTa-v3-base (referencia de categoría) | 110 M / 86 M | Token classification general | 512 tokens | Apache 2.0 / MIT |

El chess-move-tagger no compite en benchmarks generales: su valor está en el etiquetado estructurado específico de dominio y en la verificación híbrida con python-chess, algo que los encoders genéricos no ofrecen sin un fine-tuning equivalente.

## Limitaciones y advertencias

- Rendimiento degradado ante redacciones no vistas: en un probe de nuevas formulaciones, las afirmaciones de mate y jaque solo se detectan el 73 % y el 82 % de las veces, respectivamente. Es el punto débil declarado por el autor.
- El modelo solo detecta, no verifica: las afirmaciones extraídas deben comprobarse siempre con código determinista (python-chess o chess.js). Usar las detecciones sin verificación anula la garantía de corrección del diseño.
- Restringido al inglés: el modelo está etiquetado solo para texto ajedrecístico en inglés; su comportamiento con prosa en castellano u otros idiomas no está evaluado.
- Contexto limitado a 512 tokens: textos más largos requerirán segmentación, con el consiguiente riesgo de perder referencias cruzadas entre segmentos.
- Licencia LFM Open License v1.0: es una licencia de tipo "other" derivada del modelo base de Liquid AI; conviene revisar los términos del archivo LICENSE antes de cualquier uso comercial, ya que puede incluir restricciones.
- Proyecto de autor individual con 0 descargas registradas en el momento de la ficha: madurez, mantenimiento y cobertura de bugs no contrastados por una comunidad amplia.
- Sesgos: no se ha publicado ningún análisis de sesgos; al ser un modelo de dominio cerrado (notación y vocabulario ajedrecístico), el riesgo principal es el error de detección antes descrito, no el sesgo social.
- Riesgo de alucinación: como encoder clasificador con esquema BIO, no genera texto libre, por lo que el riesgo de alucinación en el sentido habitual es bajo; el riesgo relevante son los falsos positivos y negativos de las cabezas de detección, especialmente en afirmaciones de mate y jaque con redacciones nuevas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/manoletre/chess-move-tagger
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-Encoder-230M
- Código, datos y reglas de etiquetado: https://github.com/manoletre/chess-moves-from-text
- Demo en navegador: https://manoletre.com/chess/tagger
- Proyecto general: https://manoletre.com/chess
