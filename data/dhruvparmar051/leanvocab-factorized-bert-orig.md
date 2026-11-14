# DhruvParmar051/leanvocab-factorized-bert-orig

## Resumen

`leanvocab-factorized-bert-orig` es un checkpoint de investigación publicado por DhruvParmar051 como parte del proyecto [leanvocab](https://github.com/DhruvParmar051/leanvocab). Se trata de un encoder con forma de BERT (6 capas, dimensión oculta 384, 12 cabezas de atención, FFN de 1536) preentrenado desde cero con modelado de lenguaje enmascarado (MLM) sobre 2,00 GB de texto de FineWeb-Edu. Su particularidad es que emplea el vocabulario WordPiece original de `bert-base-uncased` (30.522 tokens) pero con embeddings factorizados, de modo que el bloque de embeddings ocupa muchos menos parámetros que en el control equivalente.

El modelo forma parte de un estudio controlado que pregunta si un tokenizador con vocabulario reducido (8k-16k) puede alcanzar la calidad de un encoder tipo MiniLM con vocabulario BERT completo dentro de 0,5 puntos de MTEB-avg, liberando entre el 25% y el 38% de los parámetros y sin penalizar la latencia extremo a extremo. Esta variante concreta es el brazo de referencia de embeddings factorizados: mantiene el vocabulario grande pero reduce el coste del bloque de embeddings mediante factorización.

Es importante subrayar que se trata de un checkpoint de investigación, no de un modelo terminado. Solo ha pasado por el preentrenamiento MLM con un presupuesto pequeño (2 GB, una pasada, 6.505 pasos, 1,67 h en un Apple M5 Pro) y no se ha ejecutado la fase de ajuste contrastivo que produciría embeddings de frase útiles. Con 14.716.474 parámetros totales en `model.safetensors` (incluyendo la cabeza MLM) y licencia Apache 2.0, está pensado para reproducir o extender el estudio, no para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (6 capas, hidden 384, 12 cabezas, FFN 1536, 256 posiciones) con embeddings factorizados y pesos atados a la capa de salida MLM |
| Parametros totales | 14.716.474 (encoder + cabeza MLM en `model.safetensors`); 14,64 M en el encoder |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | no disponible (el repo solo publica safetensors en precisión de entrenamiento) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería MLX) |

## Arquitectura y entrenamiento

La arquitectura es un encoder Transformer tipo BERT de 6 capas con dimensión oculta 384, 12 cabezas de atención, FFN de 1536 y 256 posiciones de contexto. La innovación del brazo es la factorización del bloque de embeddings: en lugar de una matriz de embedding de 30.522 × 384, se descompone en dos matrices de menor rango, lo que reduce el recuento de parámetros del encoder de 22,47 M (control `bert-orig`) a 14,64 M, un 35% menos. Los embeddings están atados a la capa de salida del MLM.

El entrenamiento usa FineWeb-Edu `sample-10BT` en una revisión fijada, normalizado NFC y deduplicado exactamente con BLAKE2b-128, con un split de validación congelado antes de entrenar. El presupuesto es de 2,00 GB de texto por brazo en una sola pasada, longitud de secuencia 256 con empaquetado de frases completas estilo RoBERTa, y un esquema de batching por bytes iguales: cada paso consume unos 307,3 kB de texto crudo (256 secuencias en 2 micro-lotes) en lugar de un número fijo de tokens, de modo que los distintos brazos reciben la misma cantidad de texto. El objetivo es MLM al 15% de enmascaramiento con proporción 80/10/10 mask/random/keep y 38 predicciones fijas por secuencia para mantener una forma estática en el grafo compilado. El optimizador es AdamW con lr 0,0005, betas (0,9, 0,98), weight decay 0,01 (no aplicado a sesgos ni LayerNorm), clipping de gradiente 1,0 y warmup lineal del 6% de los pasos seguido de decaimiento lineal. La evaluación usa bits por byte sobre 10 MB de held-out con máscaras fijadas por semilla 1234 cada 500 pasos.

## Capacidades

- Relleno de máscaras (`fill-mask`) en inglés: es la tarea para la que se entrenó el modelo (MLM).
- Extracción de representaciones contextuales de tokens y frases en inglés, útil como base para fine-tuning posterior.
- Compresión de texto medible en bits por byte sobre texto held-out (1,8467 en este brazo).
- No soporta tool calling ni function calling: no hay entrenamiento para ello.
- No soporta agentes ni razonamiento multi-paso: es un encoder, no un modelo generativo de instrucciones.
- No tiene modo "thinking", visión ni audio.
- Multilingüismo limitado al inglés; el vocabulario es `bert-base-uncased` y el corpus es FineWeb-Edu en inglés.
- No produce embeddings de frase de calidad por sí solo: no hay pooler ni objetivo a nivel de frase, y la fase contrastiva no se ha ejecutado.

## Casos de uso

- Reproducción del estudio leanvocab: cargar este checkpoint como brazo `factorized-bert-orig` y comparar bits por byte frente a `bpe-16k`, `bpe-8k` y `bert-orig` bajo la misma receta, semilla y presupuesto de cómputo.
- Punto de partida para fine-tuning en Apple Silicon: al estar en formato MLX y pesar 0,1 GB, se puede ajustar en un M5 Pro para experimentos de clasificación o extracción de características en inglés.
- Investigación sobre tokenización: analizar cómo la factorización de embeddings afecta a la pérdida por byte frente a la reducción de vocabulario, manteniendo el resto de variables fijas.
- Evaluación de pipelines de preentrenamiento MLM a pequeña escala: servir de referencia para validar implementaciones de enmascaramiento 80/10/10, batching por bytes o evaluación bits/byte.
- Generación de representaciones para tareas downstream en inglés (clasificación de texto, NER) tras un fine-tuning supervisado, aprovechando su contexto de 256 tokens.
- Docencia y divulgación: ejemplo didáctico de encoder BERT pequeño con vocabulario grande y embeddings factorizados, útil para explicar el coste paramétrico del vocabulario.
- No se recomienda para atención al cliente, generación de código, agentes ni ningún escenario de producción, según las propias advertencias del autor.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card (todos con semilla 0, misma receta):

| Brazo | Vocab | Params encoder | Bits/byte held-out | vs control | Precisión MLM | Tiempo |
|---|---:|---:|---:|---:|---:|---:|
| `bpe-16k` | 16.000 | 16,89 M (0,75x) | 1,1613 | -0,0318 | 37,6% | 1,79 h |
| `bert-orig` (control) | 30.522 | 22,47 M (1,00x) | 1,1931 | - | 35,5% | 2,51 h |
| `bpe-8k` | 8.000 | 13,82 M (0,62x) | 1,1992 | +0,0060 | 38,1% | 1,70 h |
| `factorized-bert-orig` (este) | 30.522 | 14,64 M (0,65x) | 1,8467 | +0,6536 | 14,7% | 1,67 h |

Datos adicionales de este brazo: compresión de 4,726 bytes/token y fertilidad de 1,309 tokens/palabra sobre texto held-out. No hay resultados de MMLU, HumanEval, GSM8K ni MTEB; el autor indica explícitamente que la fase MTEB no se ha ejecutado.

## Requisitos de hardware

- VRAM estimada: el checkpoint pesa 0,1 GB en safetensors; la inferencia cabe holgadamente en cualquier GPU con más de 1 GB de memoria, e incluso en CPU.
- GPU recomendadas: no requiere GPU dedicada; está pensado para Apple Silicon (MLX). En GPU NVIDIA, cualquier tarjeta desde una GTX 1650 en adelante es suficiente; A100/H100 no aportan ventaja por el tamaño.
- Cabe en GPU de consumo: sí, en cualquier RTX o equivalente, y en Apple Silicon (M1/M2/M3/M4/M5) vía MLX.
- Opciones de despliegue: MLX (librería declarada en el repo); al ser un BERT estándar en safetensors, también podría cargarse con `transformers`/PyTorch tras conversión, aunque no se documenta oficialmente. No hay pesos GGUF publicados para llama.cpp/Ollama.
- Latencia y throughput: no disponibles de forma oficial. El autor reporta 1,67 h de entrenamiento en un M5 Pro para 6.505 pasos, lo que da una idea del orden de magnitud, pero no se publican cifras de inferencia.

## Comparativa con modelos similares

| Modelo | Params encoder | Contexto | Bits/byte held-out | Licencia | Disponibilidad |
|---|---:|---:|---:|---|---|
| `factorized-bert-orig` (este) | 14,64 M | 256 | 1,8467 | Apache 2.0 | Hugging Face (MLX) |
| `bert-orig` (control leanvocab) | 22,47 M | 256 | 1,1931 | Apache 2.0 | Hugging Face |
| `bpe-16k` (leanvocab) | 16,89 M | 256 | 1,1613 | Apache 2.0 | Hugging Face |
| `bpe-8k` (leanvocab) | 13,82 M | 256 | 1,1992 | Apache 2.0 | Hugging Face |

La comparación con modelos externos (MiniLM, DistilBERT, `bert-base-uncased`) no está disponible en la información proporcionada; el autor solo publica comparaciones internas entre los brazos del estudio.

## Limitaciones y advertencias

- Checkpoint de investigación: no usar en producción bajo ninguna circunstancia, según el propio autor.
- Una sola semilla (seed 0): diferencias menores de unas centésimas de bit por byte no son distinguibles del ruido.
- Presupuesto pequeño: 2 GB y una pasada están muy lejos de un preentrenamiento de producción; la precisión MLM del 14,7% lo refleja y el orden entre brazos puede cambiar con escala.
- Bits por byte no es MTEB: la afirmación del estudio es sobre calidad de embeddings de frase, y esa fase (ajuste contrastivo + MTEB) no se ha ejecutado.
- Sin pooler ni objetivo a nivel de frase: el mean-pooling de los estados ocultos da algo, pero nada se entrenó para que sea bueno.
- Solo inglés y solo texto web educativo: comportamiento pobre esperable en otros idiomas, en distinciones de mayúsculas/minúsculas (uncased) y en dominios distintos a FineWeb-Edu.
- Sesgos heredados del corpus FineWeb-Edu, que es texto web filtrado.
- Licencia Apache 2.0 permite uso comercial del código y pesos, pero eso no convierte al modelo en apto para producción dada su calidad.
- El rendimiento en este brazo es notablemente peor que el control (+0,6536 bits/byte) pese a ahorrar parámetros, lo que sugiere que la factorización de embeddings no sale gratis con esta receta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DhruvParmar051/leanvocab-factorized-bert-orig
- Repositorio del proyecto leanvocab: https://github.com/DhruvParmar051/leanvocab
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Perfil del autor: https://huggingface.co/DhruvParmar051
