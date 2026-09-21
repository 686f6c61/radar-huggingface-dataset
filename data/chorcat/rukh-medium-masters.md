# chorcat/rukh-medium-masters

## Resumen

`chorcat/rukh-medium-masters` es un decoder GPT escrito desde cero que juega al ajedrez prediciendo la siguiente jugada de una partida expresada en notación UCI. Lo publica el usuario chorcat como la etapa `medium-masters` de Rukh, un curso que construye un modelo de lenguaje de ajedrez de principio a fin. Tiene 115.120.128 parámetros, un vocabulario fijo de 2030 tokens y una ventana de contexto de 200 movimientos, y no deriva de ningún modelo preentrenado: la arquitectura y el entrenamiento son propios.

El interés de la ficha no está en la fuerza de juego, sino en que es un caso de estudio reproducible y completamente abierto: un transformer decoder-only pequeño, con tokenizador determinista (enumeración fija, no aprendida), entrenado sobre un corpus de partidas propio y evaluado con criterios publicados de antemano en el `GOAL.md` del proyecto. La model card reporta 99,7 % de legalidad sin máscara en argmax y un Elo estimado de 1583 (IC 95 % 1525-1641), lo que supera los dos umbrales que el proyecto se había fijado (≥99 % de legalidad y ≥1200 Elo).

Es relevante ahora como referencia para quien quiera entender el ciclo completo de un LM de dominio cerrado: tokenización, entrenamiento, exportación a ONNX (fp32, fp16 e int8), despliegue en navegador con WebGPU o WASM y una metodología de calibración de Elo que el propio autor documenta, incluidas las correcciones de ratings anteriores. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el demo público sirve las etapas `tiny` y `small`, no esta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | GPT decoder (transformer decoder-only) escrito desde cero, con la cabeza de modelado de lenguaje atada al embedding de tokens |
| Parámetros totales | 115.120.128 |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 200 movimientos (tokens) |
| Tipos de cuantización | fp32, fp16 e int8 (los tres exportados a ONNX); pesos originales en la precisión del checkpoint safetensors |
| Idiomas soportados | `en` (etiqueta de la model card); el modelo no genera lenguaje natural, solo notación UCI y tokens de cabecera |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`) y ONNX (`model.onnx`, `model-fp16.onnx`, `model-int8.onnx`) |
| Vocabulario | 2030 tokens fijos, enumerados a mano; se distribuye en `tokenizer/vocab.json` |
| Tamaño del repositorio | 1,3 GB |
| Librería | `rukh` |

## Arquitectura y entrenamiento

La model card describe explícitamente un decoder GPT implementado desde cero, no un ajuste de un modelo existente. El vocabulario es una enumeración fija de 2030 tokens que no se aprende de los datos: cubre las jugadas en formato UCI (`e2e4`, `e7e8q`) y los enroques codificados como el movimiento de dos casillas del rey (`e1g1`), además de tokens estructurales como `<bos>`, `<eos>`, los resultados de la partida (`<1-0>`) y los dos tokens de cabecera. No se dispone de datos sobre número de capas, cabezas de atención, dimensión del modelo, tipo de positional encoding ni función de activación.

La entrada es una secuencia con esta forma: `<bos> <w1800> <b1800> e2e4 e7e5 g1f3 ... <1-0> <eos>`. Los tokens `<w...>` y `<b...>` son los bins de 100 Elo de las piezas blancas y negras, de modo que el modelo condiciona la predicción de jugadas al nivel de los jugadores. Los datos de entrenamiento proceden de los datasets `chorcat/rukh-games-1800` y `chorcat/rukh-tokenizer`. No se especifica en la información disponible el número de tokens de entrenamiento, la composición exacta del corpus, ni si hubo etapas de RLHF o DPO (lo probable en un LM de movimientos legales es entrenamiento supervisado sobre partidas, pero no está documentado en la model card).

El detalle técnico destacable es la gestión de los pesos: la cabeza de modelado de lenguaje está atada al embedding de tokens, por lo que el fichero safetensors contiene `tokens.weight` y no `lm_head.weight`. Hay que volver a atarlos tras cargar (`model.lm_head.weight = model.tokens.weight`); la librería `rukh` lo hace en el constructor. La exportación ONNX devuelve únicamente los logits del último paso con forma `(batch, vocab)`, lo que reduce el tensor de salida en un factor de doscientos respecto a devolver toda la secuencia.

## Capacidades

- Predicción de la siguiente jugada de una partida en notación UCI, condicionada por los bins de Elo de ambos bandos.
- Generación de partidas completas token a token, desde `<bos>` hasta el token de resultado y `<eos>`.
- Legalidad alta sin máscara: el 99,7 % de las posiciones de validación tienen como token más probable una jugada legal en argmax, y el mismo valor con muestreo (T=0,05, top-k 1).
- Acierto de la jugada siguiente: 54,9 % en top-1 y 82,3 % en top-3 sobre el conjunto de validación.
- Resolución de puzzles de ajedrez: 38,0 % global, con desglose por bandas de dificultad (58,1 % en 1000-1500, 38,7 % en 1500-2000, 17,1 % en 2000+).
- Inferencia en navegador: los pesos ONNX fp16 están pensados para WebGPU y los int8 para el fallback en WebAssembly.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso. No tiene visión, audio ni modo de pensamiento. No genera lenguaje natural ni procesa FEN directamente: la única interfaz es la secuencia de tokens descrita.

## Casos de uso

- Análisis de partidas en un pipeline propio: dado un historial de jugadas en UCI, el modelo devuelve la distribución sobre la siguiente jugada, lo que permite compararla con la jugada realmente jugada y medir el desvío en cada posición.
- Entrenador de ajedrez en el navegador: los ONNX fp16 (WebGPU) e int8 (WASM) permiten ejecutar la inferencia en el cliente sin backend, con el mismo esquema de enmascarado de jugadas ilegales que usa el demo del proyecto.
- Generación de partidas sintéticas para aumento de datos o pruebas de estrés: se puede muestrear desde `<bos>` con los tokens de cabecera deseados y obtener partidas etiquetadas por banda de Elo.
- Calibración y comparación de motores: el propio autor usa el modelo como sujeto de una escalera de enfrentamientos contra ocho oponentes de Stockfish a 0,1 s por jugada y 40 partidas por pareja con colores alternos, un protocolo reutilizable para medir cualquier otro modelo de ajedrez.
- Estudio de estilo y nivel de juego: los tokens de cabecera `<w...>` y `<b...>` permiten condicionar la predicción por banda de 100 Elo, útil para analizar si una jugada humana se parece más al repertorio de un nivel u otro.
- Material docente para construir un LM de dominio cerrado: el repositorio, el dataset de partidas, el tokenizador y el blog del proyecto cubren tokenización, entrenamiento, exportación y evaluación de extremo a extremo.
- Prototipado ligero en dispositivos con pocos recursos: con 115 M de parámetros y ~230 MB en fp16 o ~115 MB en int8, la inferencia cabe en CPU o en GPUs integradas, lo que lo hace apto para demos educativas y pruebas de concepto sin infraestructura dedicada.

## Benchmarks y rendimiento

Evaluado con `rukh eval --suite full` el 2026-09-20, según la model card:

| Métrica | Valor |
|---|---|
| Legalidad sin máscara, argmax | 99,7 % |
| Legalidad sin máscara, muestreo (T=0,05, top-k 1) | 99,7 % |
| Top-1 siguiente jugada | 54,9 % |
| Top-3 siguiente jugada | 82,3 % |
| Puzzles resueltos | 38,0 % |
| Elo estimado | 1583 (IC 95 % 1525-1641) |

Puzzles resueltos por banda de dificultad:

| Banda | Resueltos |
|---|---|
| 1000-1500 | 58,1 % |
| 1500-2000 | 38,7 % |
| 2000+ | 17,1 % |

Umbrales de aceptación fijados en `GOAL.md` antes del entrenamiento:

| Umbral | Objetivo | Medido | Veredicto |
|---|---|---|---|
| Legalidad sin máscara, argmax | ≥99 % | 99,7 % | Cumplido |
| Elo estimado | ≥1200 | 1583 (IC 95 % 1525-1641) | Cumplido |

Paridad de los ficheros ONNX frente al checkpoint de PyTorch, medida sobre 1000 posiciones de validación comparando la jugada argmax (el objetivo del proyecto era 99,9 %):

| Fichero | Misma jugada que PyTorch | Peor deriva de logits |
|---|---|---|
| `model.onnx` (fp32) | 100,0 % | 1,91e-05 |
| `model-fp16.onnx` (fp16) | 100,0 % | 0,0139 |
| `model-int8.onnx` (int8) | 96,2 % | 2,98 |

Advertencias metodológicas que la propia model card señala: el intervalo de Elo solo cubre ruido de muestreo, ya que cuatro de los ocho rivales son anclas nominales de `Skill Level` y no ratings medidos, y Stockfish juega a 0,1 s por jugada, muy por debajo de las condiciones para las que está calibrado `UCI_Elo`. Además, 1 de las 160 partidas alcanzó el límite de contexto y se adjudicó en lugar de puntuarse como tablas. La model card corrige ratings anteriores (1007 para `small`, 1091 para `medium`, 64 para `tiny`) que, según explica, estaban mal calculados por etiquetar a mano cuatro rivales de Stockfish entre 428 y 581 Elo por debajo de su fuerza real. La comprobación interna del método da +179 Elo de `uci-1500` sobre `uci-1320` frente a un nominal de +180.

No se han publicado resultados de benchmarks de propósito general (MMLU, HumanEval, GSM8K u otros) en la información disponible, y no serían aplicables: el modelo solo produce tokens de ajedrez.

## Requisitos de hardware

- Tamaño de los pesos según precisión, estimado a partir de los 115.120.128 parámetros: ~460 MB en fp32, ~230 MB en fp16 y ~115 MB en int8.
- VRAM estimada para inferencia: por debajo de 1 GB con fp16 o int8, y en torno a 1-2 GB contando el runtime y las activaciones. El coste de la caché KV es muy reducido por la ventana de solo 200 tokens y un vocabulario de 2030 entradas.
- Cabe en cualquier GPU de consumo con al menos 2 GB de memoria (por ejemplo GTX 1050/1650 o superiores, RTX 3050 y superiores). También es viable en CPU, y el demo del proyecto lo ejecuta en el navegador.
- GPU recomendadas para producción: no se especifican en la información disponible; dado el tamaño, una A100, H100 o RTX 4090 estarían enormemente sobredimensionadas para una sola secuencia, y tendrían sentido solo para servir lotes muy grandes.
- Opciones de despliegue documentadas: la librería `rukh` sobre PyTorch, y ONNX Runtime con `model-fp16.onnx` para WebGPU y `model-int8.onnx` para WASM. El grafo ONNX devuelve únicamente los logits del último paso, forma `(batch, vocab)`.
- No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en la información disponible; la arquitectura es propia y la librería asociada es `rukh`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos verificados sobre modelos comparables en la información proporcionada. Como referencia cualitativa de categoría:

| Modelo | Tipo | Parámetros | Contexto | Fuerza | Licencia |
|---|---|---|---|---|---|
| chorcat/rukh-medium-masters | Decoder GPT propio sobre tokens UCI | 115,12 M | 200 movimientos | Elo 1583 (IC 95 % 1525-1641) | Apache 2.0 |
| Maia Chess (variantes por banda de Elo) | Red neuronal orientada a imitar el juego humano | no disponible | no disponible | no disponible | no disponible |
| Leela Chess Zero | Motor neuronal con búsqueda MCTS | no disponible | no disponible | Muy superior (compite en la élite de TCEC) | no disponible |
| Stockfish | Motor alfa-beta con evaluación NNUE | no disponible | no disponible | Muy superior (referencia de la escala usada en la evaluación) | no disponible |

Los campos marcados como "no disponible" no proceden de la información suministrada y no se han podido verificar. La diferencia funcional relevante es que este modelo no incorpora búsqueda: predice directamente la siguiente jugada, mientras que Leela Chess Zero y Stockfish combinan la evaluación con una búsqueda que eleva su fuerza muy por encima de la de un predictor puro de 115 M de parámetros.

## Limitaciones y advertencias

- Fuerza de juego limitada: un Elo estimado de 1583 queda muy lejos de cualquier motor de análisis moderno. No es apto como sustituto de Stockfish o Leela en análisis serio.
- Sesgos de los datos: el corpus son partidas etiquetadas en torno a las bandas de 1800 Elo (`rukh-games-1800`), por lo que el repertorio y el estilo estarán sesgados hacia ese nivel y hacia las fuentes de las que procedan las partidas. No se documenta la procedencia ni la distribución geográfica o temporal del dataset.
- Riesgo de jugadas ilegales sin enmascarado: el 0,3 % de las posiciones de validación tienen un token no legal como argmax. En producción hay que enmascarar las jugadas ilegales antes de muestrear, como hace el demo. Ten en cuenta que la model card dice que el valor muestreado es siempre el menor de los dos, pero en esta medición ambos coinciden en el 99,7 %.
- Límite de contexto real: 200 movimientos. En la propia evaluación, 1 de cada 160 partidas lo agotó y tuvo que adjudicarse. Las partidas largas o los estudios con historial extenso se truncarán.
- Cuantización int8 por debajo del umbral: `model-int8.onnx` coincide con PyTorch en el 96,2 % de las posiciones, frente al 99,9 % que el proyecto se había fijado, con una deriva de logits de hasta 2,98. Es aceptable para un fallback de demostración, no para reproducir exactamente las métricas de la model card.
- Interfaz muy restringida: solo entrada y salida de tokens UCI más los tokens de cabecera. No acepta FEN, no explica jugadas y no genera lenguaje natural, pese a la etiqueta `text-generation` y al idioma `en`.
- Sin datos sobre alineación: no se documenta RLHF, DPO ni filtrado de contenido. El riesgo de alucinación en el sentido habitual no aplica (no hay texto libre), pero sí el de producir secuencias de jugadas plausibles y no legales o incoherentes si se muestrea sin máscara.
- Licencia Apache 2.0 en los pesos, lo que permite uso comercial siempre que se conserve el aviso de licencia y se indique el origen. No se documenta la licencia del dataset de partidas subyacente, un punto a revisar antes de un uso comercial.
- Validación externa escasa: 0 descargas y 0 likes en el repositorio en el momento de la consulta, y el demo público no sirve esta etapa. Conviene validar las métricas por cuenta propia antes de depender de ellas.
- Metodología de Elo con reservas reconocidas por el propio autor: anclas nominales en lugar de ratings medidos en la mitad de los rivales, condiciones de 0,1 s por jugada y compresión conocida de `UCI_Elo` en los escalones altos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/chorcat/rukh-medium-masters
- Repositorio del proyecto Rukh: https://github.com/borja-glez/rukh
- Demo pública (sirve las etapas `tiny` y `small`): https://rukh.borjaglez.com
- Blog técnico con el proceso de construcción: https://lab.rukh.borjaglez.com
- Dataset de partidas: https://huggingface.co/datasets/chorcat/rukh-games-1800
- Dataset del tokenizador: https://huggingface.co/datasets/chorcat/rukh-tokenizer
- La búsqueda web realizada no devolvió resultados relevantes sobre este modelo: los enlaces obtenidos corresponden a hilos de foro sin relación con el proyecto (disputas de suscripción de Amazon Prime).
