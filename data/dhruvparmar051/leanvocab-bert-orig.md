# DhruvParmar051/leanvocab-bert-orig

## Resumen

leanvocab-bert-orig es un checkpoint de investigación publicado por DhruvParmar051 dentro del proyecto leanvocab, un estudio controlado sobre el impacto del tamaño del vocabulario en la calidad de encoders tipo BERT. Se trata de un encoder de 6 capas y 384 dimensiones ocultas, entrenado desde cero con masked language modelling sobre 2 GB de texto de FineWeb-Edu, usando el vocabulario WordPiece original de bert-base-uncased (30.522 tokens). Es el brazo de control del estudio: sirve como referencia contra la que se comparan variantes con vocabularios reducidos (8k y 16k BPE) y una variante con embeddings factorizados.

El modelo resuelve un problema metodológico concreto: aislar el efecto del tokenizador manteniendo constantes corpus, bytes de texto por paso de optimización, forma del modelo, optimizador, schedule, enmascaramiento y semilla. Para ello introduce una métrica de evaluación, los bits por byte sobre texto retenido, que permite comparar tokenizadores distintos sin que el número de tokens por frase sesgue la comparación.

Es relevante ahora como material reproducible para investigadores que estudien eficiencia de vocabulario y embedding, y como punto de partida para fine-tuning en Apple Silicon (el entrenamiento se hizo en un M5 Pro en 2,51 horas). No es un modelo de producción ni un modelo de embeddings terminado: solo ha pasado por pretraining MLM y carece de la fase de fine-tuning contrastivo que lo haría útil para similitud semántica.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (6 capas, hidden 384, 12 cabezas, FFN 1536, 256 posiciones) |
| Parametros totales | 22.646.202 en `model.safetensors` (encoder + cabeza MLM); 22,47 M en el encoder |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 posiciones |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (texto web educativo, uncased) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

Encoder transformer puro con 6 capas, dimensión oculta 384, 12 cabezas de atención, FFN de 1536 y 256 posiciones de contexto. Los embeddings están atados a la capa de salida del MLM. El vocabulario es el WordPiece original de bert-base-uncased con 30.522 tokens, lo que concentra una parte importante de los parámetros en la matriz de embeddings (22,47 M totales en el encoder).

El entrenamiento usó FineWeb-Edu `sample-10BT` en una revisión fijada, normalizado NFC y deduplicado exactamente con BLAKE2b-128, con un split retenido congelado antes del entrenamiento. Presupuesto: 2 GB de texto por brazo, una sola pasada, 6.505 pasos, longitud de secuencia 256 con empaquetado de frases completo estilo RoBERTa. El batching se hizo por bytes iguales: cada paso consume unos 307,3 kB de texto crudo en lugar de un número fijo de tokens, de modo que los brazos no reciben cantidades distintas de texto. Objetivo MLM al 15% de enmascaramiento con esquema 80/10/10 (mask/random/keep) y 38 predicciones fijas por secuencia para mantener una forma estática en el grafo compilado. Optimizador AdamW con lr 0,0005, betas (0,9, 0,98), weight decay 0,01 (no aplicado a biases ni LayerNorm), clipping de gradiente 1,0, warmup lineal sobre el 6% de los pasos y decaimiento lineal posterior. Evaluación cada 500 pasos con bits por byte sobre 10 MB retenidos y máscaras fijadas por la semilla 1234. Tiempo de pared: 2,51 horas en un M5 Pro.

La innovación metodológica destacable es la métrica de bits por byte: mide la pérdida MLM por byte de texto crudo en lugar de por token, lo que hace comparables tokenizadores con distinta fertilidad. Sobre texto retenido, este checkpoint logra 4,726 bytes/token y una fertilidad de 1,309 tokens/palabra.

## Capacidades

- Relleno de máscaras (fill-mask) en inglés: predice tokens enmascarados en una secuencia, que es la única tarea para la que fue entrenado.
- Representaciones contextuales de token a nivel de encoder; no hay pooler ni objetivo a nivel de frase.
- Compresión de texto medible: permite evaluar bits por byte y fertilidad de tokenizador sobre corpus en inglés.
- Reproducción de experimentos: sirve como brazo de control en estudios de tokenización bajo presupuesto de cómputo fijo.
- Punto de partida para fine-tuning propio, especialmente en Apple Silicon.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- Capacidad multilingüe: no disponible; solo inglés.

## Casos de uso

- Reproducción del estudio leanvocab: cargar este checkpoint como control y comparar bits por byte contra los brazos `bpe-8k`, `bpe-16k` y `factorized-bert-orig` con el mismo corpus y receta, para verificar los resultados publicados.
- Investigación sobre tamaño de vocabulario: usar el modelo como referencia fija mientras se varía únicamente el tokenizador, aprovechando que el batching por bytes iguales elimina la confusión entre número de tokens y cantidad de texto.
- Fine-tuning de embeddings de frases: partir de estos pesos y añadir la fase contrastiva que falta (por ejemplo con pares de frases y una función de pérdida tipo MultipleNegativesRankingLoss) para obtener un encoder de similitud semántica de bajo coste.
- Experimentación en Apple Silicon: la receta completa cabe en un portátil con M5 Pro (2,51 h por brazo), lo que permite iterar sobre tokenizadores o hiperparámetros sin acceso a GPU de datacenter.
- Evaluación de tokenizadores: usar el modelo para medir fertilidad y bytes por token sobre dominios concretos antes de decidir el vocabulario de un encoder propio.
- Docencia y divulgación: ejemplo autocontenido de pipeline MLM completo (deduplicación, split retenido, empaquetado de secuencias, evaluación por bits por byte) con artefactos pequeños y reproducibles.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card, todos con semilla 0 y receta idéntica:

| Brazo | Vocabulario | Params encoder | Bits/byte retenido | Diferencia vs control | Precisión MLM | Tiempo de pared |
|---|---:|---:|---:|---:|---:|---:|
| `bpe-16k` | 16.000 | 16,89 M (0,75x) | 1,1613 | -0,0318 | 37,6% | 1,79 h |
| `bert-orig` (control, este modelo) | 30.522 | 22,47 M (1,00x) | 1,1931 | referencia | 35,5% | 2,51 h |
| `bpe-8k` | 8.000 | 13,82 M (0,62x) | 1,1992 | +0,0060 | 38,1% | 1,70 h |
| `factorized-bert-orig` | 30.522 | 14,64 M (0,65x) | 1,8467 | +0,6536 | 14,7% | 1,67 h |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, MTEB) en la información disponible. El autor indica explícitamente que la fase MTEB no se ha ejecutado.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (22,65 M parámetros, unos 90 MB de pesos) más activaciones para secuencias de 256 tokens; cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU y en GPUs integradas. Cualquier RTX o Apple Silicon es más que suficiente.
- Cabe en consumer GPU: sí, en todas las del mercado actual, incluidas las de gama baja.
- Opciones de despliegue: transformers (librería nativa), y por formato safetensors es convertible a GGUF para llama.cpp u Ollama si se necesita, aunque no se documenta en la información disponible.
- Latencia y throughput: no disponible; el autor solo reporta tiempo de entrenamiento (2,51 h en un M5 Pro), no de inferencia.

## Comparativa con modelos similares

| Modelo | Params | Contexto | Vocabulario | Objetivo | Licencia | Disponibilidad |
|---|---:|---:|---:|---|---|---|
| leanvocab-bert-orig | 22,65 M | 256 | 30.522 WordPiece | MLM solo | Apache 2.0 | Hugging Face |
| leanvocab `bpe-16k` | ~17 M | 256 | 16.000 BPE | MLM solo | Apache 2.0 (mismo proyecto) | Hugging Face |
| leanvocab `bpe-8k` | ~14 M | 256 | 8.000 BPE | MLM solo | Apache 2.0 (mismo proyecto) | Hugging Face |
| MiniLM-shaped (referencia del estudio) | no disponible | no disponible | 30.522 | MLM + contrastivo | no disponible | no disponible |

Los tres primeros son brazos del mismo estudio con receta idéntica; la comparación relevante es la de la tabla de benchmarks. Frente a encoders de producción como all-MiniLM-L6-v2, este checkpoint carece de fine-tuning contrastivo y de pooler, por lo que no es directamente comparable en calidad de embeddings.

## Limitaciones y advertencias

- Checkpoint de investigación, no modelo final: no debe usarse en producción.
- Una sola semilla (seed 0); diferencias por debajo de unas centésimas de bit por byte no son distinguibles del ruido.
- Presupuesto de entrenamiento pequeño (2 GB, una pasada); la precisión MLM del 35,5% lo refleja y el orden entre brazos puede cambiar a mayor escala.
- Bits por byte no es MTEB: la afirmación del estudio sobre calidad de sentence embeddings requiere la fase contrastiva y la evaluación MTEB, que no se han ejecutado.
- Sin pooler ni objetivo a nivel de frase: el mean-pooling de los estados ocultos produce algo, pero nada se entrenó para que sea bueno.
- Solo inglés y solo texto web educativo (FineWeb-Edu), uncased; se espera mal comportamiento en otros idiomas, en distinciones de mayúsculas y en dominios alejados de páginas educativas.
- Sesgos del corpus: FineWeb-Edu es texto web filtrado y arrastra sus sesgos al checkpoint.
- Riesgo de alucinación: no aplica en el sentido generativo, pero las predicciones fill-mask pueden ser incorrectas o reflejar sesgos del corpus.
- Licencia Apache 2.0: permite uso comercial, pero el autor desaconseja explícitamente cualquier uso en producción en el estado actual.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DhruvParmar051/leanvocab-bert-orig
- Repositorio del proyecto leanvocab: https://github.com/DhruvParmar051/leanvocab
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
