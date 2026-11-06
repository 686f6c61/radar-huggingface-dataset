# mahiyama/sae-splade-ja-30m

## Resumen

`sae-splade-ja-30m` es un modelo de recuperación dispersa aprendida (learned sparse retrieval, tipo SPLADE) para japonés, desarrollado por el usuario mahiyama y publicado en Hugging Face. Se construye sobre el encoder `sbintuitions/modernbert-ja-30m` y proyecta el texto a un espacio disperso de 65.536 dimensiones compartido con su modelo hermano `mahiyama/sae-splade-ja-310m`. Su función no es generar texto, sino producir representaciones vectoriales dispersas para motores de búsqueda y sistemas de recuperación de información.

El modelo está diseñado específicamente para una recuperación asimétrica: las consultas se codifican con este modelo de 30M (rápido, apto para CPU) y los documentos se indexan con el modelo de 310M. De este modo se reutiliza el índice ya construido con el modelo grande y solo se paga el coste de codificar la consulta en cada búsqueda, que resulta aproximadamente seis veces más rápido en CPU que con el modelo de 310M.

Su relevancia actual radica en que ofrece una alternativa de recuperación dispersa de bajo coste para japonés, con una pérdida media de solo 1,87 puntos de nDCG@10 respecto al uso del modelo de 310M para consultas, y con licencia MIT que permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (ModernBERT) + SAETopKPooling (encoder SAE Top-K y max-pooling) |
| Parametros totales | 36.705.536 (aproximadamente 37M en el modelo base; la model card indica ~54M incluyendo la capa de salida) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens de entrada máxima (entrenado con hasta 1.024 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | japonés (ja) |
| Licencia | MIT |
| Formato de pesos | safetensors; exportación ONNX disponible en `mahiyama/sae-splade-ja-30m-onnx` |
| Dimension de salida | 65.536 (espacio SAE compartido con sae-splade-ja-310m) |
| Similitud | producto escalar (inner product) |
| Framework | sentence-transformers SparseEncoder (verificado con 6.2.0) |
| Modelo base | sbintuitions/modernbert-ja-30m |
| Encoder de documentos previsto | mahiyama/sae-splade-ja-310m |

## Arquitectura y entrenamiento

El modelo parte del encoder `modernbert-ja-30m`, cuya última capa oculta (256 dimensiones) se proyecta linealmente a 768 dimensiones y se pasa por el encoder de un autoencoder disperso (SAE) de 65.536 características, cuyos pesos permanecen congelados durante el entrenamiento. En los pesos publicados, la proyección lineal se ha fusionado con el encoder del SAE en una única matriz de 65.536 × 256. Sobre la salida se aplica una selección Top-K por token (se conservan las 16 características de mayor valor) seguida de max-pooling sobre toda la secuencia, de forma idéntica al modelo de 310M.

El entrenamiento busca alinear la representación de consultas de este modelo pequeño con el espacio de características del SAE aprendido por `sae-splade-ja-310m`, de modo que consultas y documentos sean comparables mediante producto escalar aunque se codifiquen con modelos distintos. Los conjuntos de datos empleados incluyen `mahiyama/auto-wiki-qa`, `mqa-ja`, `mmarco-ja`, `miracl-retrieval`, `mrtydi`, `quiz-works`, `quiz-no-mori`, `amagasaki-qna`, `kosodate-faq-pairs-ja`, `anlp-meeting-retrieval`, `sbintuitions/JMTEB`, `AmazonScience/mintaka` y `wikimedia/wikipedia`. No se detalla en la información disponible el número de tokens de entrenamiento ni si se aplicaron técnicas de RLHF o DPO (no procede en un modelo de recuperación).

En inferencia, por defecto se limitan las dimensiones no nulas a las 40 mayores para consultas y las 400 mayores para documentos (configurable mediante los atributos `query_top_k` y `document_top_k` de la capa `SAETopKPooling`; un valor de 0 desactiva el límite).

## Capacidades

- Codificación de consultas en vectores dispersos de 65.536 dimensiones para recuperación de información en japonés.
- Recuperación asimétrica: consultas con este modelo y documentos con `sae-splade-ja-310m`, compartiendo el mismo espacio de características.
- Codificación de documentos con `encode_document`, aunque con una caída notable de precisión respecto al uso del modelo de 310M.
- Búsqueda léxico-semántica dispersa: las dimensiones activas corresponden a características interpretables aprendidas por un SAE, lo que permite combinar coincidencia de términos y semántica.
- Entrada de hasta 8.192 tokens, adecuada para documentos largos en la indexación.
- Compatible con `text-embeddings-inference` y con endpoints compatibles según los tags del repositorio.
- Exportación ONNX para inferencia acelerada en CPU.
- No soporta tool calling, agentes, visión, audio ni generación de texto: es exclusivamente un encoder de recuperación.

## Casos de uso

- Motor de búsqueda documental en japonés con índice preexistente: si ya se dispone de un índice construido con `sae-splade-ja-310m`, este modelo permite codificar las consultas en CPU con un coste aproximadamente seis veces menor, sin reindexar.
- Búsqueda en atención al cliente sobre FAQ y bases de conocimiento: los conjuntos de entrenamiento incluyen FAQ municipales (`amagasaki-qna`, `kosodate-faq-pairs-ja`), por lo que el modelo está ajustado a pares pregunta-respuesta reales de servicios públicos.
- Recuperación en pipelines RAG de bajo coste: al codificar solo la consulta en línea, se puede desplegar en servidores sin GPU y reservar los recursos de cómputo para el modelo generador.
- Búsqueda académica y de documentación técnica: los buenos resultados en las tareas NLP Journal (títulos, abstracts e introducciones) lo hacen adecuado para recuperar artículos científicos por título o resumen.
- Sistemas de búsqueda con latencia estricta: la codificación de consultas en CPU con ONNX permite respuestas en milisegundos en entornos sin acelerador hardware.
- Filtrado y reordenación en dos etapas: usar este modelo como primera etapa de recuperación dispersa y un cross-encoder denso como reordenador posterior, aprovechando el bajo coste de la etapa inicial.
- Búsqueda multilingüe limitada al japonés dentro de corpus mixtos: útil en organizaciones con documentación mayoritariamente japonesa que necesitan un componente de recuperación especializado.

## Benchmarks y rendimiento

Resultados de nDCG@10 en las 11 tareas de recuperación de JMTEB v2 lite. Las columnas indican «encoder de consulta / encoder de documento»: 30m es este modelo y 310m es `sae-splade-ja-310m`.

| Tarea | 30m / 310m | 310m / 310m | 30m / 30m |
|---|---:|---:|---:|
| JaqketRetrievalLite | 75,11 | 79,72 | 51,33 |
| MrTyDiJaRetrievalLite | 52,84 | 55,66 | 26,57 |
| JaGovFaqsRetrieval | 73,59 | 76,47 | 64,32 |
| NLPJournalTitleAbsRetrieval.V2 | 97,45 | 97,58 | 96,79 |
| NLPJournalTitleIntroRetrieval.V2 | 96,81 | 97,48 | 96,38 |
| NLPJournalAbsIntroRetrieval.V2 | 99,00 | 99,25 | 99,20 |
| NLPJournalAbsArticleRetrieval.V2 | 99,66 | 99,66 | 99,56 |
| JaCWIRRetrievalLite | 78,63 | 82,37 | 68,50 |
| MIRACLJaRetrievalLite | 66,98 | 68,99 | 28,80 |
| MintakaRetrieval | 20,96 | 22,70 | 17,97 |
| MultiLongDocRetrieval | 47,26 | 48,95 | 48,70 |
| Media | 73,48 | 75,35 | 63,46 |
| Dimensiones no nulas medias (consulta / documento) | 40,0 / 301,1 | 40,0 / 301,1 | 40,0 / 189,4 |

La diferencia media frente a 310m / 310m es de −1,87 puntos (intervalo de confianza del 95 %: [−2,20, −1,53]) para 30m / 310m y de −11,88 puntos ([−12,44, −11,32]) para 30m / 30m. Las mayores caídas en el modo 30m / 30m se dan en MIRACL, Mr.TyDi y JAQKET.

Comparación en las 7 tareas comunes entre JMTEB v2 lite y JMTEB v2 (medias de nDCG@10, condiciones de medición heterogéneas entre modelos):

| Modelo | Método | Media 7 tareas |
|---|---|---:|
| cl-nagoya/ruri-v3-130m | Dense | 78,40 |
| mahiyama/sae-splade-ja-310m | Sparse | 77,44 |
| cl-nagoya/ruri-v3-70m | Dense | 77,01 |
| cl-nagoya/ruri-v3-30m | Dense | 76,80 |

## Requisitos de hardware

- El modelo tiene aproximadamente 37M de parámetros en safetensors (36,7M) y un tamaño de repositorio de 0,2 GB, por lo que cabe holgadamente en cualquier GPU consumer e incluso en memoria de CPU.
- VRAM estimada: por debajo de 1 GB en fp32 para los pesos; la activación depende de la longitud de entrada (hasta 8.192 tokens). No se publican cifras oficiales de VRAM.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; el modelo está pensado para ejecutarse en CPU.
- Cabe en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) y en portátiles sin GPU dedicada.
- Opciones de despliegue: sentence-transformers 6.2.0 o superior con `SparseEncoder`, `text-embeddings-inference` (según tags del repo), ONNX Runtime mediante `mahiyama/sae-splade-ja-30m-onnx`, y llama.cpp/Ollama no aplican (no es un modelo generativo).
- Latencia y throughput: la model card indica que la codificación de consultas en CPU es aproximadamente 6 veces más rápida que con `sae-splade-ja-310m`; no se publican cifras absolutas de latencia ni de throughput.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Método | Media 7 tareas JMTEB | Licencia |
|---|---|---:|---|---:|---|
| mahiyama/sae-splade-ja-30m | ~37M (54M con capa de salida) | 8.192 | Sparse (SAE-SPLADE) | no disponible en las 7 tareas (73,48 en 11 tareas) | MIT |
| mahiyama/sae-splade-ja-310m | no disponible | no disponible | Sparse (SAE-SPLADE) | 77,44 | MIT |
| cl-nagoya/ruri-v3-30m | no disponible | no disponible | Dense | 76,80 | no disponible |
| cl-nagoya/ruri-v3-70m | no disponible | no disponible | Dense | 77,01 | no disponible |
| cl-nagoya/ruri-v3-130m | no disponible | no disponible | Dense | 78,40 | no disponible |

La comparación no es estrictamente homogénea: las cifras de los modelos ruri-v3 provienen de sus propias condiciones de evaluación (prefijos de entrada, longitud máxima), mientras que las de los modelos sae-splade corresponden a la configuración descrita en la model card.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en japonés; no soporta otros idiomas.
- No es un modelo generativo: no produce texto, no razona y no admite tool calling ni uso como agente.
- El uso previsto es asimétrico: codificar documentos con este modelo reduce la precisión media en 11,88 puntos frente a usar `sae-splade-ja-310m`, con caídas especialmente graves en MIRACL, Mr.TyDi y JAQKET.
- La pérdida media de 1,87 puntos respecto al uso del modelo de 310M para consultas debe evaluarse en el dominio concreto antes de adoptarlo en producción.
- El límite por defecto de 40 dimensiones para consultas y 400 para documentos reduce el recall; desactivarlo aumenta el coste de cómputo y almacenamiento.
- El rendimiento en MintakaRetrieval es bajo (20,96), lo que sugiere limitaciones en preguntas complejas o de tipo multihop.
- Riesgo de alucinación no aplica directamente al no generar texto, pero la recuperación puede devolver documentos irrelevantes en dominios alejados de los datos de entrenamiento.
- La licencia MIT permite uso comercial sin restricciones, pero el modelo base `sbintuitions/modernbert-ja-30m` debe verificarse por separado.
- El modelo fue entrenado con hasta 1.024 tokens aunque acepta 8.192; el comportamiento más allá de la longitud de entrenamiento puede degradarse.
- No se han publicado datos sobre sesgos, robustez ante consultas adversarias ni evaluación fuera de JMTEB.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mahiyama/sae-splade-ja-30m
- Modelo de documentos asociado: https://huggingface.co/mahiyama/sae-splade-ja-310m
- Exportación ONNX: https://huggingface.co/mahiyama/sae-splade-ja-30m-onnx
- Modelo base: https://huggingface.co/sbintuitions/modernbert-ja-30m
- Resultados de referencia ruri-v3-130m: https://github.com/embeddings-benchmark/results/tree/e3579e8b72e1fd443f5aa580606f7249d1d3b406/results/cl-nagoya__ruri-v3-130m
- Resultados de referencia ruri-v3-70m: https://github.com/embeddings-benchmark/results/tree/e3579e8b72e1fd443f5aa580606f7249d1d3b406/results/cl-nagoya__ruri-v3-70m
- Resultados de referencia ruri-v3-30m: https://github.com/embeddings-benchmark/results/tree/e3579e8b72e1fd443f5aa580606f7249d1d3b406/results/cl-nagoya__ruri-v3-30m
- Paper de referencia SPLADE (arXiv:2004.05665): https://arxiv.org/abs/2004.05665
