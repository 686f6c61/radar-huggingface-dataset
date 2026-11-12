# DhruvParmar051/leanvocab-bpe-8k

## Resumen

leanvocab-bpe-8k es un checkpoint de investigación publicado por DhruvParmar051 dentro del proyecto leanvocab, un estudio controlado que investiga si un tokenizador con vocabulario reducido (8.000 a 16.000 tokens) puede mantener la calidad de un encoder tipo MiniLM con el vocabulario estándar de BERT (30.522 tokens). El modelo es un encoder BERT de 6 capas, 384 dimensiones ocultas y 12 cabezas de atención, preentrenado desde cero con masked language modelling sobre 2,00 GB de texto de FineWeb-Edu, usando un vocabulario byte-level BPE de 8.000 tokens.

La relevancia del checkpoint es metodológica: todos los brazos del estudio comparten corpus, bytes de texto por paso de optimizador, forma del modelo, optimizador, schedule, enmascaramiento y semilla, de modo que el tokenizador es la única variable que cambia. El modelo cuenta con 13,98 millones de parámetros en `model.safetensors` (encoder más cabeza MLM) y 13,82 millones en el encoder, un 38% menos que el control con vocabulario BERT completo.

Se trata explícitamente de un checkpoint de investigación, no de un modelo de embeddings terminado. Solo ha pasado por la fase de preentrenamiento MLM; el ajuste contrastivo que produciría embeddings de frase útiles no se ha ejecutado, y la evaluación MTEB está deliberadamente sin tocar. El autor advierte que no debe usarse en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT (6 capas, hidden 384, 12 cabezas, FFN 1536, 256 posiciones) |
| Parámetros totales | 13.975.232 (encoder + cabeza MLM) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 posiciones |
| Tipos de cuantización | no disponible (entrenado y publicado en MLX/transformers sin variantes GGUF publicadas) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); entrenado con MLX |
| Vocabulario | 8.000 tokens, byte-level BPE |
| Parámetros del encoder | 13,82M (0,62x respecto al control BERT) |
| Objetivo | Masked language modelling (fill-mask) |
| Dataset | HuggingFaceFW/fineweb-edu (sample-10BT, revisión fijada) |
| Tamaño del repo | 0,1 GB |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de tipo BERT con 6 capas, dimensión oculta 384, 12 cabezas de atención, FFN de 1536 y 256 posiciones de contexto. Los embeddings están atados a la capa de salida MLM. La innovación principal no está en la arquitectura sino en el tokenizador: un vocabulario byte-level BPE de 8.000 tokens que reduce el bloque de embeddings y, por tanto, el total de parámetros del encoder en un 38% frente a un control con vocabulario de 30.522 tokens.

El entrenamiento usó FineWeb-Edu `sample-10BT` en una revisión fijada, normalizado NFC y deduplicado exactamente con BLAKE2b-128, con un split de validación congelado antes del entrenamiento. El presupuesto fue de 2,00 GB de texto por brazo en una sola pasada, longitud de secuencia 256 con empaquetado de frases completas estilo RoBERTa. El batching se hizo por bytes iguales: cada paso consume unos 307,3 kB de texto crudo (256 secuencias en 2 micro-lotes), de modo que los brazos no reciben cantidades distintas de texto. El objetivo fue MLM al 15% de enmascaramiento con esquema 80/10/10 (mask/random/keep) y 38 predicciones fijas por secuencia para mantener una forma estática en el grafo compilado. Optimizador AdamW con lr 0,0005, betas (0,9, 0,98), weight decay 0,01 (no aplicado a sesgos ni LayerNorm), clipping de gradiente 1,0, warmup lineal sobre el 6% de los pasos y decaimiento lineal posterior. Entrenamiento en una Apple M5 Pro de 48 GB mediante MLX, con 6.478 pasos y 1,70 h de reloj de pared. La evaluación se hizo con bits por byte sobre 10 MB de held-out con máscaras fijadas por semilla 1234, cada 500 pasos.

## Capacidades

- Relleno de máscaras (fill-mask) en inglés: predice tokens enmascarados en una secuencia, que es la única tarea para la que fue entrenado.
- Representaciones contextuales de token: produce estados ocultos de 384 dimensiones por token; el mean-pooling de estos estados da algo, pero nada fue entrenado para que sea bueno como embedding de frase.
- Compresión de texto medible: 4,177 bytes/token y fertilidad 1,481 tokens/palabra sobre texto held-out.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües: solo inglés, sin distinción de mayúsculas (uncased).
- No dispone de thinking mode, visión ni audio.
- No incluye pooler ni objetivo a nivel de frase.

## Casos de uso

- Reproducción del estudio leanvocab: sirve para replicar o extender la comparación de tokenizadores bajo un presupuesto de cómputo fijo, ya que comparte receta exacta con los brazos `bpe-16k`, `bert-orig` y `factorized-bert-orig`.
- Punto de partida para fine-tuning en Apple silicon: el checkpoint se entrenó con MLX en una M5 Pro, por lo que es un arranque realista para experimentos de ajuste en hardware de Apple.
- Investigación sobre tamaño de vocabulario: permite medir el impacto de un vocabulario de 8.000 tokens frente a 16.000 y 30.522 en bits por byte y precisión MLM bajo condiciones controladas.
- Estudio de factorización de embeddings: como brazo de comparación frente a `factorized-bert-orig`, ayuda a analizar si el ahorro de parámetros por vocabulario pequeño se comporta distinto al ahorro por factorización.
- Docencia y divulgación: un encoder pequeño (13,98M parámetros, 0,1 GB) es adecuado para explicar pipelines MLM, tokenización BPE y evaluación por bits por byte sin requerir infraestructura grande.
- Pruebas de infraestructura de inferencia: por su tamaño reducido cabe en cualquier GPU consumer y sirve para validar pipelines de transformers, endpoints compatibles o despliegues MLX antes de pasar a modelos mayores.

## Benchmarks y rendimiento

| Brazo | Vocabulario | Params encoder | Bits/byte held-out | vs control | Precisión MLM | Reloj |
|---|---:|---:|---:|---:|---:|---:|
| `bpe-16k` | 16.000 | 16,89M (0,75x) | 1,1613 | -0,0318 | 37,6% | 1,79 h |
| `bert-orig` (control) | 30.522 | 22,47M (1,00x) | 1,1931 | - | 35,5% | 2,51 h |
| `bpe-8k` (este modelo) | 8.000 | 13,82M (0,62x) | 1,1992 | +0,0060 | 38,1% | 1,70 h |
| `factorized-bert-orig` | 30.522 | 14,64M (0,65x) | 1,8467 | +0,6536 | 14,7% | 1,67 h |

Lectura de los datos según el autor: `bpe-16k` superó al control en 0,032 bits/byte con un 25% menos de parámetros y un 29% menos de tiempo; `bpe-8k` quedó a 0,006 bits/byte del control con un 38% menos de parámetros, una diferencia que una sola semilla no permite separar del ruido; `factorized-bert-orig` empeoró 0,654 bits/byte pese a ahorrar un 35% de parámetros. No hay resultados MTEB ni de embeddings de frase, porque esas fases no se han ejecutado.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (13,98M parámetros, unos 56 MB de pesos) más activaciones; cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria; también CPU y Apple silicon.
- Cabe en GPU consumer: sí, en todas las RTX y en iGPU modernas; el entrenamiento original se hizo en una Apple M5 Pro de 48 GB vía MLX.
- Opciones de despliegue: transformers (librería declarada), MLX para Apple silicon, y endpoints compatibles (`endpoints_compatible` en los tags). No se han publicado pesos GGUF, por lo que llama.cpp y Ollama no están disponibles de forma directa.
- Latencia y throughput: no disponibles en la información proporcionada; el dato de reloj (1,70 h para 6.478 pasos de entrenamiento en M5 Pro) no es extrapolable a inferencia.

## Comparativa con modelos similares

| Modelo | Params encoder | Vocabulario | Contexto | Bits/byte held-out | Licencia | Disponibilidad |
|---|---|---:|---:|---:|---|---|
| leanvocab-bpe-8k | 13,82M | 8.000 | 256 | 1,1992 | Apache 2.0 | Hugging Face |
| leanvocab-bpe-16k | 16,89M | 16.000 | 256 | 1,1613 | Apache 2.0 | Hugging Face (mismo proyecto) |
| leanvocab-bert-orig (control) | 22,47M | 30.522 | 256 | 1,1931 | Apache 2.0 | Hugging Face (mismo proyecto) |
| leanvocab-factorized-bert-orig | 14,64M | 30.522 | 256 | 1,8467 | Apache 2.0 | Hugging Face (mismo proyecto) |

La comparación con MiniLM u otros encoders de embeddings de frase no está disponible en la información proporcionada, ya que el estudio no ha ejecutado la fase contrastiva ni MTEB.

## Limitaciones y advertencias

- Checkpoint de investigación: no debe usarse en producción bajo ninguna circunstancia, según el propio autor.
- Una sola semilla (seed 0): las diferencias menores que unas centésimas de bit por byte no se distinguen del ruido.
- Presupuesto pequeño: 2 GB de texto y una sola pasada están muy lejos de un preentrenamiento de producción; la precisión MLM del 38,1% lo refleja y el orden de los brazos puede cambiar con escala.
- Bits por byte no es MTEB: la afirmación del estudio es sobre calidad de embeddings de frase, que requiere ajuste contrastivo y evaluación MTEB, fases no ejecutadas.
- Sin pooler ni objetivo a nivel de frase: el mean-pooling de los estados ocultos no fue entrenado para ser un buen embedding.
- Solo inglés y uncased: comportamiento pobre esperable en otros idiomas, en distinciones de mayúsculas y en dominios distintos de páginas web educativas.
- Sesgos heredados del corpus: FineWeb-Edu es texto web filtrado y arrastra sus sesgos al checkpoint.
- Licencia Apache 2.0 permite uso comercial, pero la limitación técnica (no es un modelo terminado) lo desaconseja en cualquier caso.
- Riesgo de alucinación: no evaluado en la información disponible; como modelo MLM no genera texto libre, pero sus predicciones de máscara pueden ser incorrectas sin calibración.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DhruvParmar051/leanvocab-bpe-8k
- Repositorio del proyecto leanvocab: https://github.com/DhruvParmar051/leanvocab
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
