# AmareshHebbar/FlipAware_all_MiniLM_L6_v2_smoke

## Resumen

FlipAware_all_MiniLM_L6_v2_smoke es un ajuste fino (fine-tuning) de sentence-transformers/all-MiniLM-L6-v2 orientado a un problema concreto de los modelos de embeddings: distinguir frases que son superficialmente parecidas pero semanticamente opuestas o distintas (por ejemplo, "el farmaco es seguro para ninos" frente a "el farmaco no es seguro para ninos"). Lo desarrolla AmareshHebbar como parte del proyecto FlipAware, un banco de pruebas con triples de ancla, parafrasis y trampa (look-alike) que mide si el embedding coloca la parafrasis correcta mas cerca del ancla que la trampa.

El modelo mantiene la arquitectura, la dimensionalidad (384) y las interfaces del modelo base, por lo que se presenta como sustituto directo en pipelines de recuperacion y similitud semantica. Incorpora vectores Matryoshka (384, 256, 128 y 64 dimensiones) y admite cuantizacion int8 y binaria. Esta entrenado solo en ingles y publicado con licencia Apache 2.0.

La relevancia practica es doble: por un lado, aborda un fallo conocido de los embedders en dominios sensibles como salud, legal o financiero, donde la negacion o el intercambio de roles cambia el significado; por otro lado, los resultados publicados muestran que el ajuste no mejora la precision en trampas (66,7 frente a 66,7) y degrada la recuperacion general (nDCG@10 en NanoBEIR de 51,2 a 47,8), por lo que debe evaluarse con cautela antes de usarlo en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer BERT (MiniLM-L6), encoder de frases |
| Parametros totales | 22.713.216 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 128 tokens (max_length de entrenamiento) |
| Tipos de cuantizacion | float32/float16, int8, binaria (1 bit por dimension); dimensiones Matryoshka 384, 256, 128 y 64 |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria sentence-transformers) |

## Arquitectura y entrenamiento

El modelo parte de sentence-transformers/all-MiniLM-L6-v2, un encoder BERT miniaturizado de 6 capas y 22,7 millones de parametros que produce embeddings de 384 dimensiones. El ajuste no altera la arquitectura ni el tamano del vector: es un fine-tuning sobre el mismo backbone, por lo que la inferencia y la integracion con sentence-transformers y Text Embeddings Inference son identicas a las del modelo base.

El entrenamiento usa el dataset FlipAware_Triples_smoke, compuesto por triples de ancla, parafrasis y trampa que cubren ocho tipos de trampa (intercambio de entidad, hedge, negacion, numeros, intercambio de rol, alcance, orden temporal), complementado con pares de recuperacion de Natural Questions para evitar la degradacion de la busqueda general. La funcion de perdida es CachedMultipleNegativesRankingLoss dentro de MatryoshkaLoss, con la trampa como negativo duro, mas una guarda CosineSimilarityLoss que empuja las similitudes de pares generales hacia las puntuaciones del modelo base. Los hiperparametros son 1 epoca, batch 32 (mini batch 16), learning rate 2e-05, max length 128, precision fp16, sin LoRA, sobre una Tesla T4 con 0,05 horas de GPU en total.

## Capacidades

- Generacion de embeddings de frases y pasajes para similitud semantica y recuperacion (retrieval).
- Distincion de pares con negacion, hedge, intercambio de entidad, numeros, intercambio de rol, alcance y orden temporal, segun los tipos de trampa evaluados.
- Vectores Matryoshka: truncado a 256, 128 y 64 dimensiones sin reentrenar.
- Cuantizacion int8 y binaria para reducir huella de almacenamiento.
- Compatible con el pipeline sentence-similarity de Hugging Face y con Text Embeddings Inference (endpoints compatibles).
- Sustituto directo del modelo base: misma arquitectura, mismo tamano de vector y mismos prompts.
- Solo ingles; no se documentan capacidades multilingues, tool calling, agentes ni modos de razonamiento.

## Casos de uso

- Busqueda documental en dominios sensibles (salud, legal, financiero): el modelo se entrena especificamente para que una consulta como "is the drug safe for kids" no recupere un pasaje que dice "the drug is not safe for children under 12"; util en recuperacion aumentada (RAG) donde la negacion invierte el significado.
- Deduplicacion y agrupacion de textos con matices: al distinguir parafrasis de trampas, sirve para clustering de incidencias o tickets donde frases casi identicas tienen consecuencias distintas.
- Filtrado de candidatos en sistemas de preguntas y respuestas: como primera etapa de ranking, descartando pasajes que comparten entidades y numeros pero difieren en rol o alcance.
- Sustituto directo en pipelines existentes de all-MiniLM-L6-v2: al mantener 384 dimensiones y la misma API de sentence-transformers, se puede probar en un entorno controlado reindexando el corpus y comparando metricas.
- Despliegue en entornos con recursos limitados: con 22,7 millones de parametros y vectores de 64 dimensiones o cuantizacion binaria, cabe en CPU y en GPUs de consumo para indexacion a gran escala.
- Evaluacion comparativa de embedders: el modelo y su leaderboard asociado permiten medir la robustez frente a trampas de otros embedders abiertos en las mismas pruebas.

## Benchmarks y rendimiento

Datos publicados en la model card (precision en trampas = proporcion de triples donde la parafrasis verdadera puntua mas cerca del ancla que la trampa; media sobre 1 semilla):

| Test | Filas | Base | Tuned |
|---|---|---|---|
| Trap test (mismo generador, frases reservadas) | 15 | 66,7 | 66,7 ± 0,0 |
| Cross generator test (otra familia de modelos) | 38 | 81,6 | 81,6 ± 0,0 |
| Passage retrieval traps (pairwise) | 5 | 80,0 | 80,0 ± 0,0 |
| Passage retrieval traps (recall@1) | 5 | 80,0 | 80,0 ± 0,0 |
| NevIR negation retrieval (pairwise) | 300 | 6,3 | 7,3 ± 0,0 |
| NanoBEIR nDCG@10 (recuperacion general) | no disponible | 51,2 | 47,8 ± 0,0 |

Precision por tipo de trampa:

| Tipo de trampa | Base | Tuned |
|---|---|---|
| entity swap | 50,0 | 50,0 ± 0,0 |
| hedge | 100,0 | 100,0 ± 0,0 |
| negation | 100,0 | 100,0 ± 0,0 |
| numbers | 100,0 | 100,0 ± 0,0 |
| role swap | 33,3 | 33,3 ± 0,0 |
| scope | 0,0 | 0,0 ± 0,0 |
| time order | 50,0 | 50,0 ± 0,0 |

Vectores cortos y cuantizados (trap test):

| Vector | Base | Tuned |
|---|---|---|
| 384 dims float | 66,7 | 66,7 ± 0,0 |
| 256 dims float | 66,7 | 66,7 ± 0,0 |
| 128 dims float | 66,7 | 66,7 ± 0,0 |
| 64 dims float | 66,7 | 66,7 ± 0,0 |
| int8 | 66,7 | 66,7 ± 0,0 |
| binaria (1 bit por dimension) | 60,0 | 66,7 ± 0,0 |

Intervalos de confianza (bootstrap pareado, mejor semilla frente al base): la ganancia en trap test es +0,0 (intervalo 95 % de +0,0 a +0,0; probabilidad de no ser mejor del 100 %) y en cross generator +0,0 (mismo intervalo; 100 %). El veredicto del autor es "GOOD", con +0,0 puntos en trampas, -3,4 puntos en nDCG@10 y +0,0 en cross generator.

## Requisitos de hardware

- VRAM estimada: muy baja; con 22,7 millones de parametros, la inferencia en fp16 ocupa del orden de decenas de MB de pesos, y el cuello de botella es el tamano del lote y del corpus indexado, no el modelo.
- GPU recomendadas: cualquier GPU moderna sirve; el autor entreno en una Tesla T4. Para indexacion masiva son adecuadas A100, H100, L4 o RTX 4090; para lotes pequenos basta CPU.
- GPU de consumo: cabe holgadamente en cualquier GPU de consumo (RTX 3060, 4060, 4090) e incluso en CPU para cargas moderadas.
- Despliegue: sentence-transformers, Text Embeddings Inference (endpoints compatibles), y conversion a ONNX/GGUF segun el ecosistema habitual; no se documentan integraciones especificas con vLLM, llama.cpp ni Ollama en la informacion disponible.
- Latencia y throughput: no disponibles. El unico dato de computo es el entrenamiento (0,05 horas de GPU en Tesla T4 para todas las ejecuciones de este modelo base).

## Comparativa con modelos similares

| Modelo | Parametros | Dimensiones | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| FlipAware_all_MiniLM_L6_v2_smoke | 22,7 M | 384 (Matryoshka 256/128/64) | 128 tokens | Apache 2.0 | Ajuste especifico para trampas; nDCG@10 NanoBEIR 47,8 |
| sentence-transformers/all-MiniLM-L6-v2 | 22,7 M | 384 | 256 tokens (model card del base) | Apache 2.0 | Modelo base; nDCG@10 NanoBEIR 51,2 en la evaluacion del autor |
| Otros embedders abiertos del leaderboard FlipAware | no disponible | no disponible | no disponible | no disponible | La model card remite al FlipAware Leaderboard para la tabla completa |

No se dispone de resultados numericos de terceros en la informacion proporcionada; la comparacion con otros embedders abiertos queda remitida al leaderboard del proyecto.

## Limitaciones y advertencias

- El ajuste no mejora la precision en trampas en las pruebas publicadas (66,7 frente a 66,7 en trap test y 81,6 frente a 81,6 en cross generator) y empeora la recuperacion general: nDCG@10 en NanoBEIR baja de 51,2 a 47,8 (-3,4 puntos).
- El intervalo de confianza de la ganancia es +0,0 a +0,0 con un 100 % de probabilidad de no ser mejor que el base, segun el bootstrap pareado del autor.
- El tamaño de las pruebas es muy reducido (15, 38 y 5 filas en varias pruebas; 300 en NevIR), lo que limita la significacion estadistica.
- Los tipos de trampa con peor rendimiento son scope (0,0), role swap (33,3), entity swap (50,0) y time order (50,0), tanto en el base como en el ajustado.
- Los vectores generados no son compatibles con los del modelo base: es necesario reindexar el corpus tras el cambio.
- Solo ingles; no hay soporte multilingue documentado.
- Riesgo de alucinacion y sesgos: no se documentan evaluaciones de sesgo ni de robustez fuera del benchmark FlipAware; al ser un encoder de similitud, los sesgos del corpus de entrenamiento (Natural Questions y el dataset sintetico de triples) pueden reflejarse en los rankings.
- Licencia Apache 2.0 permite uso comercial, pero el modelo se distribuye como "smoke" (prueba de concepto) con 15 descargas y 0 likes; no hay evidencia de validacion en produccion.
- Longitud de contexto de 128 tokens en entrenamiento; textos mas largos se truncan y pueden perder el matiz que el modelo pretende capturar (la propia model card muestra que la precision cae con anclas de 18 a 22 palabras, hasta 33,3).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AmareshHebbar/FlipAware_all_MiniLM_L6_v2_smoke
- Dataset de entrenamiento: https://huggingface.co/datasets/AmareshHebbar/FlipAware_Triples_smoke
- Leaderboard FlipAware: https://huggingface.co/spaces/AmareshHebbar/FlipAware_Leaderboard_smoke
- Registros de ejecuciones: https://huggingface.co/datasets/AmareshHebbar/FlipAware_Runs_smoke
- TensorBoard: https://huggingface.co/spaces/AmareshHebbar/FlipAware_TensorBoard_smoke
- MLflow: https://huggingface.co/spaces/AmareshHebbar/FlipAware_MLflow_smoke
- Codigo en GitHub: https://github.com/amareshhebbar/flipaware
- Modelo base: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2
