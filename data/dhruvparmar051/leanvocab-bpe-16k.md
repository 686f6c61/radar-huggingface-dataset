# DhruvParmar051/leanvocab-bpe-16k

## Resumen

leanvocab-bpe-16k es un checkpoint de investigación publicado por DhruvParmar051: un encoder con forma de BERT (6 capas, dimensión oculta 384, 12 cabezas de atención) preentrenado desde cero con modelado de lenguaje enmascarado (MLM) sobre 2,00 GB de texto de FineWeb-Edu. Su particularidad es el vocabulario: 16.000 tokens Byte-level BPE, frente a los 30.522 del BERT original, lo que reduce el bloque de embeddings y deja el encoder en 16,89 millones de parámetros (17,06 millones contando la cabeza MLM).

Forma parte de leanvocab, un estudio controlado que pregunta si un tokenizador de 8k-16k tokens puede alcanzar calidad de sentence embeddings a menos de 0,5 puntos MTEB-avg de un encoder con forma de MiniLM que usa el vocabulario de BERT, liberando entre un 25% y un 38% de los parámetros sin penalizar la latencia de extremo a extremo. Todas las variantes del estudio comparten corpus, bytes de texto por paso de optimizador, forma del modelo, optimizador, schedule, enmascaramiento y semilla, de modo que el tokenizador es la única variable.

Es relevante ahora porque cuantifica con una métrica comparable entre tokenizadores (bits por byte sobre texto retenido, no pérdida por token) el coste real de reducir vocabulario. El checkpoint, sin embargo, es solo la fase de preentrenamiento: no ha pasado por el fine-tuning contrastivo que produciría embeddings de frase útiles, por lo que no debe usarse en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (6 capas, hidden 384, 12 cabezas, FFN 1536, 256 posiciones, embeddings atados a la capa de salida MLM) |
| Parametros totales | 17.055.232 (encoder + cabeza MLM); encoder solo: 16,89 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 posiciones |
| Tipos de cuantizacion | no disponible (el autor no publica variantes cuantizadas) |
| Idiomas soportados | en (inglés, sin distinción de mayúsculas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 0,1 GB) |

## Arquitectura y entrenamiento

El modelo es un encoder transformer denso de 6 capas con atención multi-cabeza estándar, dimensión oculta 384 y FFN de 1536, con embeddings de token atados a la matriz de salida de la cabeza MLM. El vocabulario es Byte-level BPE de 16.000 tokens, lo que reduce el bloque de embeddings frente al control de 30.522 tokens (22,47 M de parámetros en el encoder). La longitud de secuencia es de 256 posiciones con empaquetado de frases completas al estilo RoBERTa.

El preentrenamiento usa FineWeb-Edu `sample-10BT` en una revisión fijada, normalizado NFC y deduplicado exacto con BLAKE2b-128, con un split retenido congelado antes de entrenar. El presupuesto es de 2,00 GB de texto por variante en una sola pasada, 6.527 pasos, con batching por bytes iguales (unos 307,3 kB de texto crudo por paso, es decir, 256 secuencias en 2 micro-lotes) para que ninguna variante reciba más texto que otra. El objetivo es MLM al 15% con esquema 80/10/10 mask/random/keep y 38 predicciones fijas por secuencia para mantener una forma estática en el grafo compilado. Optimizador AdamW con lr 0,0005, betas (0,9, 0,98), weight decay 0,01 (no aplicado a sesgos ni LayerNorm), clipping de gradiente 1,0, warmup lineal sobre el 6% de los pasos y decaimiento lineal posterior. La evaluación es bits por byte sobre 10 MB retenidos con máscaras fijadas por semilla 1234 cada 500 pasos. Todo el entrenamiento se ejecutó en un Apple M5 Pro de 48 GB mediante MLX, con un tiempo de reloj de 1,79 h.

## Capacidades

- Relleno de máscaras (fill-mask) sobre texto en inglés: es la única tarea para la que se ha entrenado de forma directa.
- Representaciones contextuales de token a partir de las cuales se puede hacer mean-pooling, aunque sin objetivo a nivel de frase.
- Tokenizador Byte-level BPE de 16.000 tokens con compresión medida de 4,568 bytes/token y fertilidad de 1,354 tokens/palabra sobre texto retenido.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de modo thinking, visión ni audio.
- Capacidad multilingüe: no disponible (entrenado solo con texto educativo en inglés).
- No hay pooler ni cabeza de sentence embeddings entrenada.

## Casos de uso

- Reproducción del estudio leanvocab: ejecutar de nuevo el pipeline de MLM con el mismo corpus, presupuesto de bytes y semilla para verificar los bits por byte reportados (1,1613 en retenido) y la comparación frente al control de 30.522 tokens.
- Comparación controlada de tokenizadores: usar este checkpoint junto a `bpe-8k`, `bert-orig` y `factorized-bert-orig` para aislar el efecto del tamaño de vocabulario manteniendo fija la receta y el cómputo.
- Punto de partida para fine-tuning en Apple Silicon: el checkpoint está entrenado con MLX en un M5 Pro, por lo que sirve como base para experimentos de ajuste en hardware de Apple con presupuesto reducido.
- Estudio de eficiencia de embeddings: medir cuántos parámetros se liberan al pasar de 30.522 a 16.000 tokens (25% del encoder) y cómo se traduce en bits por byte frente a otras estrategias de ahorro como la factorización de embeddings.
- Docencia y prototipado de tokenizadores: analizar la fertilidad (1,354 tokens/palabra) y la compresión (4,568 bytes/token) de un vocabulario de 16k sobre texto educativo frente a alternativas de 8k y 30k.
- Evaluación de estabilidad de recetas a pequeña escala: comprobar si el orden de las variantes se mantiene al variar la semilla o el presupuesto, dado que el autor advierte que las diferencias por debajo de unas centésimas de bit por byte no son distinguibles del ruido con una sola semilla.

## Benchmarks y rendimiento

| Variante | Vocabulario | Params encoder | Bits/byte retenido | vs control | Precisión MLM | Tiempo de reloj |
|---|---:|---:|---:|---:|---:|---:|
| `bpe-16k` (este modelo) | 16.000 | 16,89 M (0,75x) | 1,1613 | -0,0318 | 37,6% | 1,79 h |
| `bert-orig` (control) | 30.522 | 22,47 M (1,00x) | 1,1931 | - | 35,5% | 2,51 h |
| `bpe-8k` | 8.000 | 13,82 M (0,62x) | 1,1992 | +0,0060 | 38,1% | 1,70 h |
| `factorized-bert-orig` | 30.522 | 14,64 M (0,65x) | 1,8467 | +0,6536 | 14,7% | 1,67 h |

No se han publicado resultados de MTEB ni de otras tareas de sentence embeddings en la información disponible; el autor indica explícitamente que esa fase no se ha ejecutado.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (17,06 M de parámetros, unos 68 MB de pesos) y del orden de decenas de MB en fp16 o int8; el repo completo ocupa 0,1 GB.
- GPU recomendadas: cualquier GPU consumer moderna sirve; el modelo es trivial en términos de memoria. El entrenamiento original se hizo en CPU/GPU unificada de un Apple M5 Pro de 48 GB.
- Cabe en cualquier GPU consumer, incluida una GTX 1650 o una iGPU con suficiente memoria compartida; también en CPU.
- Opciones de despliegue: transformers (librería declarada), y por tamaño es compatible con llama.cpp u Ollama si se convierte a GGUF, aunque el autor no publica esas variantes. El pipeline declarado es fill-mask y el modelo figura como endpoints_compatible.
- Latencia y throughput: no disponibles de forma desagregada; el autor solo reporta el tiempo de entrenamiento (1,79 h para 6.527 pasos en un M5 Pro).

## Comparativa con modelos similares

| Modelo | Params encoder | Vocabulario | Contexto | Bits/byte retenido | Licencia | Disponibilidad |
|---|---:|---:|---:|---:|---|---|
| `leanvocab-bpe-16k` | 16,89 M | 16.000 | 256 | 1,1613 | Apache 2.0 | Hugging Face |
| `leanvocab-bpe-8k` | 13,82 M | 8.000 | 256 | 1,1992 | Apache 2.0 | Hugging Face |
| `leanvocab-bert-orig` (control) | 22,47 M | 30.522 | 256 | 1,1931 | Apache 2.0 | Hugging Face |
| `leanvocab-factorized-bert-orig` | 14,64 M | 30.522 | 256 | 1,8467 | Apache 2.0 | Hugging Face |

Las cuatro variantes comparten receta, corpus y semilla, por lo que la comparación es directa dentro del estudio. Frente a encoders de producción como MiniLM (mismo shape de referencia citado por el autor), no hay datos MTEB publicados en la información disponible para establecer una comparación de calidad.

## Limitaciones y advertencias

- Checkpoint de investigación, no un modelo terminado: no ha pasado por el fine-tuning contrastivo ni por la fase MTEB, por lo que no produce sentence embeddings útiles.
- Semilla única: todas las variantes se entrenaron una sola vez con semilla 0; diferencias por debajo de unas centésimas de bit por byte no son distinguibles del ruido.
- Presupuesto pequeño: 2 GB de texto y una sola pasada están muy lejos de un preentrenamiento de producción; la precisión MLM del 37,6% lo refleja y el orden de las variantes puede cambiar con escala.
- Bits por byte no es MTEB: la afirmación del estudio es sobre calidad de sentence embeddings y esa fase no se ha ejecutado.
- Sin pooler ni objetivo a nivel de frase: el mean-pooling de los estados ocultos devuelve algo, pero nada se entrenó para que sea bueno.
- Solo inglés y solo texto web educativo: se espera mal comportamiento en otros idiomas, en distinciones de mayúsculas y en dominios distintos de páginas web educativas.
- Sesgos del corpus: FineWeb-Edu es texto web filtrado y arrastra sus sesgos a este checkpoint.
- Riesgo de alucinación: no aplica en el sentido generativo, pero el modelo puede producir rellenos de máscara plausibles y factualmente incorrectos.
- Licencia Apache 2.0: permite uso comercial, pero el autor desaconseja explícitamente cualquier uso en producción.
- No usar sus números como veredicto sobre la hipótesis del estudio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DhruvParmar051/leanvocab-bpe-16k
- Repositorio del estudio leanvocab: https://github.com/DhruvParmar051/leanvocab
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Paper de FineWeb-Edu: no disponible en la información proporcionada
- Blog o demo del autor: no disponible en la información proporcionada
