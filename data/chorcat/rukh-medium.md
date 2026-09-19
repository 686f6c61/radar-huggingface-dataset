# chorcat/rukh-medium

## Resumen

chorcat/rukh-medium es un decoder GPT escrito desde cero que juega al ajedrez prediciendo el siguiente movimiento de una partida expresada en notacion UCI. Lo publica el autor chorcat como la etapa `medium-greedy` de Rukh, un curso que construye un modelo de lenguaje de ajedrez de principio a fin. Tiene 115.120.128 parametros, un vocabulario fijo de 2030 tokens y una ventana de contexto de 200 movimientos, lo que lo situa en la categoria de modelos muy pequenos y de proposito especifico.

El problema que resuelve no es conversacion general, sino modelar la secuencia de movimientos de una partida: lee `<bos> <w1800> <b1800> e2e4 e7e5 g1f3 ... <1-0> <eos>` y predice el siguiente token, que corresponde a una jugada legal en formato UCI. Es relevante ahora como ejemplo reproducible de entrenamiento end-to-end de un transformer pequeno sobre un dominio cerrado y formal, con metricas de legalidad, puzzles y Elo estimado publicadas de forma transparente, incluidas las barras de aceptacion que el modelo no alcanza.

La arquitectura es un transformer decoder-only con la cabeza de modelado de lenguaje atada al embedding de tokens, entrenado sobre 5,9 millones de partidas y distribuido en safetensors y ONNX (fp32, fp16 e int8). Su licencia Apache 2.0 y su tamano lo hacen desplegable incluso en navegador mediante WebGPU o WASM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT) con cabeza LM atada al embedding de tokens |
| Parametros totales | 115.120.128 (safetensors); la receta de entrenamiento registra 114.966.528 |
| Longitud de contexto | 200 movimientos (`block = 200`) |
| Tipos de cuantizacion | fp32, fp16 e int8 (archivos ONNX); no se distribuye GGUF |
| Idiomas soportados | en (etiqueta declarada); en la practica el modelo opera sobre notacion UCI de ajedrez |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (model.safetensors), ONNX (model.onnx, model-fp16.onnx, model-int8.onnx) y tokenizer/vocab.json |
| Vocabulario | 2030 tokens fijos, enumeracion no aprendida |
| Tamano del repo | 1,3 GB |
| Libreria | rukh |

## Arquitectura y entrenamiento

Se trata de un transformer decoder-only autorregresivo de proposito especifico. La cabeza de modelado de lenguaje esta atada al embedding de tokens, de modo que el archivo de pesos contiene `tokens.weight` y no `lm_head.weight`: ambos son el mismo tensor. Tras cargar el checkpoint hay que volver a atarlos (`model.lm_head.weight = model.tokens.weight`); la libreria `rukh` lo hace en el constructor. El vocabulario es una enumeracion fija que se distribuye en `tokenizer/vocab.json`, no aprendida de los datos. Los dos primeros tokens de cada secuencia son los bins de 100 puntos de Elo de blancas y negras, y los movimientos se codifican como cadenas UCI (`e2e4`, `e7e8q`, y el enroque como el movimiento de dos casillas del rey, `e1g1`).

La receta de entrenamiento publicada incluye `batch_size = 32`, `betas = [0.9, 0.95]`, `block = 200`, `lr = 0.00045`, `max_steps = 20000`, `grad_accum = 8`, `grad_clip = 1.0`, `precision = bf16`, `seed = 42` y `compile = True`, con evaluacion cada 500 pasos sobre 50 batches y checkpoint cada 1000 pasos. El corpus son 5,9 millones de partidas (dataset `chorcat/rukh-games-1800`). El propio autor atribuye el techo de rendimiento al corpus y no a la capacidad: la etapa `medium` triplica los parametros sobre los mismos datos y solo gana 84 puntos de Elo, con intervalos solapados. No se documenta uso de RLHF ni de DPO; el ajuste es puramente de modelado de lenguaje sobre secuencias de partidas.

## Capacidades

- Prediccion del siguiente movimiento en notacion UCI a partir de una partida parcial, incluyendo los bins de Elo de ambos bandos.
- Generacion de partidas completas de forma autoregresiva, con tokens de terminacion `<1-0>`, `<0-1>` y `<eos>`.
- Legalidad de movimientos sin mascara del 99,4 % en argmax y 99,4 % en muestreo con temperatura 0.05 y top-k 1.
- Acierto de siguiente movimiento del 52,9 % en top-1 y del 80,9 % en top-3.
- Resolucion de puzzles: 23,9 % global, con 37,6 % en la banda 1000-1500, 24,0 % en 1500-2000 y 10,2 % en 2000+.
- Capacidad estimada de juego: Elo 1091 (IC 95 % 990-1194).
- No soporta tool calling ni function calling, no es un modelo de agentes y no tiene modo de razonamiento explicito ni capacidades de vision o audio.
- No es multilingue ni de proposito general: fuera de la notacion UCI de ajedrez no ofrece capacidades utiles.

## Casos de uso

- Motor de ajedrez ligero en navegador: los archivos `model-fp16.onnx` (WebGPU) y `model-int8.onnx` (WASM) permiten ejecutar la inferencia en el cliente sin backend, como hace la demo oficial con la mascara de legalidad activada.
- Analisis de estilo y prediccion de jugadas: dado un historial de partida y los bins de Elo, el modelo puede predecir la continuacion mas probable y compararla con la jugada realmente jugada para estudiar desviaciones.
- Clasificacion aproximada de nivel de juego: los tokens de cabecera reflejan bins de 100 puntos de Elo, por lo que el modelo se puede emplear en experimentos de estimacion de fuerza a partir de secuencias de movimientos.
- Material didactico para el curso Rukh: sirve como etapa intermedia reproducible (`medium-greedy`) para ilustrar el entrenamiento de un transformer de ajedrez de principio a fin, con barras de aceptacion y resultados publicados.
- Banco de pruebas de cuantizacion: `onnx/parity.json` documenta la fidelidad de cada exportacion (fp32 y fp16 al 100 % de coincidencia de jugada; int8 al 96,5 %), lo que lo convierte en un caso practico para medir el impacto de int8 en tareas discretas.
- Generacion de partidas sinteticas: con la mascara de legalidad activada puede producir secuencias de movimientos completas para aumentar datos de entrenamiento o probar pipelines de tokenizacion UCI.
- Demos interactivas de bajo coste: el modelo cabe en CPU y en navegador, por lo que es adecuado para prototipos de interfaces de juego sin infraestructura GPU.

## Benchmarks y rendimiento

Medido con `rukh eval --suite full` el 2026-09-19.

| Metrica | Valor |
|---|---|
| Legalidad sin mascara, argmax | 99,4 % |
| Legalidad sin mascara, muestreado (T=0.05, top-k 1) | 99,4 % |
| Acierto de siguiente movimiento, top-1 | 52,9 % |
| Acierto de siguiente movimiento, top-3 | 80,9 % |
| Puzzles resueltos | 23,9 % |
| Elo estimado | 1091 (IC 95 % 990-1194) |

Puzzles por banda de dificultad:

| Banda | Resueltos |
|---|---|
| 1000-1500 | 37,6 % |
| 1500-2000 | 24,0 % |
| 2000+ | 10,2 % |

Barras de aceptacion fijadas en `GOAL.md` antes del entrenamiento:

| Barra | Objetivo | Medido | Veredicto |
|---|---|---|---|
| Legalidad sin mascara, argmax | al menos 99 % | 99,4 % | cumplida |
| Elo estimado | al menos 1200 | 1091 (IC 95 % 990-1194) | no cumplida |

Fidelidad de las exportaciones ONNX frente al checkpoint de PyTorch sobre 1000 posiciones de validacion, comparando la jugada argmax:

| Archivo | Misma jugada que PyTorch | Peor deriva de logits |
|---|---|---|
| `model.onnx` (fp32) | 100,0 % | 1,88e-05 |
| `model-fp16.onnx` (fp16) | 100,0 % | 0,0115 |
| `model-int8.onnx` (int8) | 96,5 % | 1,94 |

La barra autoimpuesta de paridad era del 99,9 %; `model-int8.onnx` no la alcanza y elige una jugada distinta en el 3,5 % de las posiciones (aproximadamente una de cada 29). Nota del autor: el intervalo de Elo cubre solo el ruido de muestreo, los cuatro escalones `skill-*` son anclas nominales de Skill Level y no ratings medidos, Stockfish juega a 0,1 s por movimiento, y 4 de 160 partidas alcanzaron el limite de contexto y se adjudicaron en lugar de puntuarse como tablas.

## Requisitos de hardware

- VRAM estimada para inferencia (calculo a partir del numero de parametros, no publicado por el autor): aproximadamente 460 MB en fp32, 230 MB en fp16 y 115 MB en int8, mas el coste del cache KV, minimo dado el contexto de 200 tokens.
- GPU recomendadas: cualquier GPU moderna con aceleracion de inferencia es suficiente; no se requiere A100 ni H100. Tambien funciona en CPU y en navegador (WebGPU con el archivo fp16, WASM con el int8).
- Cabe holgadamente en GPU de consumo: RTX 3060, RTX 4090 y practicamente cualquier GPU con mas de 1 GB de memoria libre.
- Opciones de despliegue: ONNX Runtime (WebGPU o WASM), PyTorch con la libreria `rukh` y la demo oficial. No hay soporte publicado para vLLM, llama.cpp, Ollama ni TGI; el tokenizador es propio (2030 tokens fijos) y la salida ONNX devuelve solo los logits del ultimo paso, forma `(batch, vocab)`.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de latencia por jugada.

## Comparativa con modelos similares

No se han publicado en la informacion disponible datos comparativos contra otros modelos de ajedrez con cifras verificables. La model card menciona que el modelo se mide contra un "trabajo de referencia" entrenado con 16 millones de partidas (frente a los 5,9 millones de este), pero no se identifica ni se aportan sus metricas, por lo que no se puede construir una tabla de comparacion con datos.

| Modelo | Parametros | Contexto | Elo estimado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| chorcat/rukh-medium | 115.120.128 | 200 movimientos | 1091 (IC 95 % 990-1194) | apache-2.0 | safetensors y ONNX en HuggingFace |
| Trabajo de referencia citado (sin identificar) | no disponible | no disponible | no disponible | no disponible | no disponible |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La barra de Elo de 1200 fijada por el proyecto no se cumple: el resultado medido es 1091 (IC 95 % 990-1194).
- El techo de rendimiento parece venir del corpus (5,9 millones de partidas) y no de la capacidad: la etapa `medium` triplica parametros sobre los mismos datos y solo gana 84 puntos de Elo, con intervalos solapados.
- Sin la mascara de legalidad, el modelo genera movimientos ilegales en aproximadamente el 0,6 % de las posiciones en argmax y en muestreo. La demo aplica la mascara antes de muestrear, por lo que nunca juega una jugada ilegal, pero el modelo desnudo si puede hacerlo.
- El archivo int8 no alcanza la barra de paridad del 99,9 %: difiere del modelo PyTorch en el 3,5 % de las posiciones. Un dispositivo que cargue el fallback WASM int8 juega un modelo mediblemente distinto al de la tabla de resultados.
- Contexto limitado a 200 movimientos: 4 de las 160 partidas de evaluacion alcanzaron el limite y tuvieron que adjudicarse.
- El intervalo de Elo cubre unicamente ruido de muestreo; los anclajes `skill-*` son niveles nominales, no ratings medidos, y el rival (Stockfish a 0,1 s por movimiento) esta lejos de la calibracion de `UCI_Elo`.
- Modelo de dominio cerrado: no es un asistente de proposito general, no soporta tool calling ni razonamiento multi-paso, y no tiene capacidades multilingues fuera de la notacion UCI.
- Riesgo de sesgo heredado del corpus: las partidas de ajedrez estan sesgadas por la distribucion de niveles, aperturas y epocas presentes en los datos de origen.
- Licencia Apache 2.0: permite uso comercial, pero no se ofrece ninguna garantia sobre la calidad de juego ni sobre la legalidad de las jugadas generadas sin mascara.
- El modelo fue publicado con 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion externa de los resultados publicados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/chorcat/rukh-medium
- Repositorio del proyecto Rukh: https://github.com/borja-glez/rukh
- Demo interactiva (etapa medium-greedy): https://rukh.borjaglez.com/?stage=medium-greedy
- Documentacion del proceso de construccion: https://lab.rukh.borjaglez.com
- Dataset de partidas: https://huggingface.co/datasets/chorcat/rukh-games-1800
- Dataset del tokenizador: https://huggingface.co/datasets/chorcat/rukh-tokenizer
