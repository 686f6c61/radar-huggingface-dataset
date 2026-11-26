# pakutoma/jasmine-conversion

## Resumen

Jasmine Conversion es un conjunto de recursos para el reranking de la conversión kana-kanji (KKC) en el IME japonés Jasmine, una aplicación de teclado para Android desarrollada por pakutoma. No se trata de un modelo de lenguaje neuronal, sino de un sistema estadístico compuesto por tablas de n-gramas altamente comprimidas y un modelo LightGBM (LambdaRank) que reordena las candidaturas generadas por la retícula de Mozc, procesándolas de izquierda a derecha. El objetivo es mejorar la precisión de la conversión de entrada japonesa sin ejecutar un LLM en el dispositivo durante la inferencia.

El paquete se distribuye en tres variantes de capacidad (1 GB, 5 GB y 10 GB), construidas a partir del corpus japonés de FineWeb-2 y apoyadas en diccionarios como Mozc, SudachiDict y mecab-ipadic-neologd. Cada variante incluye tablas binarias listas para desplegar, el modelo `model.txt` de LightGBM con 149 características y sumas de verificación SHA256. La relevancia actual reside en que ofrece una alternativa ligera y determinista a los rerankers neuronales (como zenz) en un dominio, la conversión kana-kanji, donde la latencia y el consumo de memoria en dispositivos móviles son críticos.

El sistema logra una precisión de coincidencia exacta del 60,45 % (1 GB), 63,50 % (5 GB) y 64,68 % (10 GB) sobre un conjunto público de 2.200 preguntas, superando a zenz-v3.2-small Q5_K_M (58,95 %) con un modelo que no requiere inferencia neuronal. El repositorio ocupa 16,5 GB en total y se publica bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Reranker estadístico: tablas de n-gramas comprimidas (estilo tongrams) + LightGBM LambdaRank |
| Parametros totales | No disponible (modelo GBDT con 149 características; no aplica recuento de parámetros neuronales) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (opera sobre candidaturas de la retícula Mozc, no sobre secuencias de tokens de contexto libre) |
| Tipos de cuantizacion | No disponible (compresión propia: Front-Coding, Elias-Fano, Partitioned Elias-Fano, Canonical Huffman, int8 y nf4 para Word2Vec) |
| Idiomas soportados | Japonés (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | Tablas binarias propietarias (`vocab.fc`, `*.off.ef`, `*.child.ef`, `*.base.ef`, `*.id.pef`, `*.cnt`), vectores Word2Vec (`vec_in.nf4`, `vec_in.scale`, `vec_sym.weight`) y `model.txt` (LightGBM) |

## Arquitectura y entrenamiento

El sistema no emplea una arquitectura transformer ni SSM. Se compone de dos capas: por un lado, cuatro tipos de tablas estadísticas de alta densidad comprimidas (n-gramas de palabras, n-gramas de caracteres, n-gramas de palabras de contenido y Word2Vec simétrico comprimido en un solo vector); por otro, un modelo LightGBM con objetivo LambdaRank que reordena las candidaturas de la retícula Mozc de izquierda a derecha. Las tablas se construyeron a partir del subconjunto japonés de FineWeb-2 (ODC-By 1.0), con apoyo léxico de Mozc (BSD 3-Clause), SudachiDict (Apache 2.0) y mecab-ipadic-neologd (Apache 2.0).

La innovación técnica principal es la compresión extrema de las estructuras de n-gramas: codificación Elias-Fano para columnas de punteros, Partitioned Elias-Fano para identificadores de segmento con renumeración de contextos, Huffman canónico separado para recuentos (con LUT independiente por nivel, `count_mode=log8`) y Front-Coding con permutación de 21 bits para el vocabulario y unigramas. Los vectores de palabras usan compresión simétrica única (`w2v_which=sym`), reconstruyendo `vec_out = vec_in ⊙ vec_sym.sign` en tiempo de ejecución. La variante de 1 GB emplea `256d svdp5_nf4` sobre las 900.000 palabras más frecuentes (118,8 MB), mientras que las de 5 GB y 10 GB usan `256d int8` sobre el vocabulario completo de 1.441.386 palabras (374,8 MB). No se documenta uso de RLHF ni DPO, al no ser un modelo generativo.

## Capacidades

- Conversión kana-kanji (KKC) mediante reranking de candidaturas de la retícula Mozc.
- Mejora de la precisión en la selección de homófonos (conjunto `fwajimee_homophones`).
- Funcionamiento completamente offline y determinista, sin inferencia de LLM en el dispositivo.
- Tres perfiles de capacidad (1 GB, 5 GB, 10 GB) con precisión creciente.
- Verificación de paridad entre la implementación Android/Kotlin y la implementación de referencia en Go (3.200/3.200 preguntas coincidentes en cada variante, 9.600 en total).
- No soporta tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.
- Capacidad multilingüe limitada al japonés.

## Casos de uso

- Teclado japonés en Android: integración directa en Jasmine para reordenar las candidaturas de conversión en tiempo real sin consumo de GPU ni de NPU, gracias a las tablas comprimidas y al modelo GBDT.
- Dispositivos de gama baja o sin acelerador neuronal: la variante de 1 GB (0,992 GB) permite ofrecer reranking de calidad (60,45 %) en terminales con almacenamiento y memoria limitados.
- Aplicaciones de escritorio o servidores de IME: la variante de 10 GB (9,968 GB) maximiza la precisión (64,68 %) en entornos con más recursos, manteniendo inferencia puramente CPU.
- Investigación en conversión kana-kanji: el paquete sirve como referencia reproducible con particiones públicas (`ajimee`, `bench1000`, `fwajimee_homophones`, `natrand`) y resultados documentados en `eval_summary.json`.
- Sistemas de entrada embebidos o de bajo consumo: al no requerir un LLM en inferencia, el consumo energético y la latencia son predecibles y adecuados para entornos con batería limitada.
- Evaluación comparativa de rerankers: permite contrastar enfoques estadísticos (n-gramas + GBDT) frente a rerankers neuronales como zenz en las mismas particiones de prueba.
- Despliegue en pipelines de CI para IME: la paridad verificada entre Kotlin y Go facilita pruebas de regresión reproducibles en integración continua.

## Benchmarks y rendimiento

Resultados de coincidencia exacta sobre las particiones indicadas (Jasmine con `Linf, tau=0` y paquete real; zenz con `llama-server` en V100, decodificación voraz y `MAX_TOKENS=128`):

| Modelo (tamaño) | Público 3 sets (2.200) | `ajimee` (200) | `bench1000` (1.000) | `fwajimee_h` (1.000) | `natrand` (1.000) | Total 4 sets (3.200) |
|---|---:|---:|---:|---:|---:|---:|
| Mozc sin reranking (baseline) | 394 (17,91 %) | 112 | 210 | 72 | 786 | 1.180 |
| `zenz-v3.2-xsmall Q5_K_M` (20,0 MB, solo generación) | 1.046 (47,55 %) | 141 | 299 | 606 | — | — |
| `zenz-v3.2-small Q5_K_M` (70,4 MB, solo generación) | 1.297 (58,95 %) | 170 | 396 | 731 | — | — |
| Jasmine `1GB` (0,992 GB) | 1.330 (60,45 %) | 170 | 422 | 738 | 865 | 2.195 |
| Jasmine `5GB` (4,999 GB) | 1.397 (63,50 %) | 177 | 453 | 767 | 864 | 2.261 |
| Jasmine `10GB` (9,968 GB) | 1.423 (64,68 %) | 177 | 468 | 778 | 859 | 2.282 |

## Requisitos de hardware

- Almacenamiento: 0,992 GB (1 GB), 4,999 GB (5 GB) o 9,968 GB (10 GB) según la variante; el repositorio completo ocupa 16,5 GB.
- Memoria: no se documenta un requisito mínimo de RAM; las tablas se leen directamente desde el paquete en disco y la inferencia se ejecuta en CPU.
- GPU: no se requiere GPU; el sistema no emplea inferencia neuronal.
- GPU de consumo: no aplica.
- Despliegue: integración nativa en la aplicación Jasmine para Android (Kotlin) mediante `tools/kkc_b_push.sh`, y una implementación de referencia en Go que lee el paquete directamente. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: no se publican cifras concretas de latencia o throughput en la información disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Tamaño | Precisión (público 2.200) | Licencia | Despliegue |
|---|---|---:|---:|---|---|
| Jasmine `1GB` | N-gramas + LightGBM | 0,992 GB | 60,45 % | Apache 2.0 | CPU, Android/Kotlin, Go |
| Jasmine `5GB` | N-gramas + LightGBM | 4,999 GB | 63,50 % | Apache 2.0 | CPU, Android/Kotlin, Go |
| Jasmine `10GB` | N-gramas + LightGBM | 9,968 GB | 64,68 % | Apache 2.0 | CPU, Android/Kotlin, Go |
| `zenz-v3.2-xsmall Q5_K_M` | LLM generativo | 20,0 MB | 47,55 % | No disponible | `llama-server` (GPU) |
| `zenz-v3.2-small Q5_K_M` | LLM generativo | 70,4 MB | 58,95 % | No disponible | `llama-server` (GPU) |
| Mozc sin reranking | Baseline | — | 17,91 % | BSD 3-Clause | CPU |

Las variantes de Jasmine superan en precisión a zenz-v3.2-small a costa de un mayor tamaño en disco, pero sin necesidad de GPU ni de inferencia generativa. La licencia de zenz no se especifica en la información proporcionada.

## Limitaciones y advertencias

- Dominio restringido: solo realiza conversión kana-kanji en japonés; no es un modelo de propósito general ni generativo.
- Dependencia de la retícula Mozc: el reranking opera sobre las candidaturas que genera Mozc, por lo que su calidad está acotada por dicha retícula.
- Tamaño considerable: incluso la variante mínima ocupa cerca de 1 GB, y la de 10 GB puede ser inviable en dispositivos con almacenamiento limitado.
- Sesgos: al derivarse de FineWeb-2, puede heredar sesgos de dominio y de frecuencia del corpus web; no se documenta un análisis específico de sesgos.
- Riesgo de error en homófonos poco frecuentes o vocabulario fuera del corpus; la precisión no es del 100 % (máximo 64,68 % en el conjunto público).
- Sin datos de benchmarks de latencia o consumo energético en la información disponible.
- Licencia Apache 2.0 permite uso comercial, pero debe respetarse el archivo `NOTICE` y las licencias de las fuentes (Mozc BSD 3-Clause, SudachiDict Apache 2.0, mecab-ipadic-neologd Apache 2.0, FineWeb-2 ODC-By 1.0).
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica escasa validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/pakutoma/jasmine-conversion
- Repositorio Jasmine (IME para Android): https://github.com/pakutoma/jasmine
- Corpus FineWeb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Mozc: https://github.com/google/mozc
- SudachiDict: https://github.com/WorksApplications/SudachiDict
- mecab-ipadic-neologd: https://github.com/neologd/mecab-ipadic-neologd
