# scienceverse/bibr-statement-tagger-v1

## Resumen

`bibr-statement-tagger-v1` es un clasificador de bloques de texto científico desarrollado por el proyecto scienceverse, orientado a la etapa `post_parse` del pipeline de extracción documental bibr. Su función concreta es identificar, dentro de un artículo científico ya parseado, qué bloques corresponden a declaraciones de integridad y secciones afines: conflicto de intereses (COI), financiación, ética, disponibilidad de datos, contribuciones de autoría, agradecimientos y material suplementario. No es un modelo generativo, sino un encoder con siete cabezas sigmoideas que emite una probabilidad independiente por tipo.

Técnicamente se apoya en el encoder `sentence-transformers/all-MiniLM-L6-v2` (un transformer de ~22 M de parámetros) con un pooling de media enmascarada y una capa lineal de 7 salidas. El modelo recibe un par de secuencias (los primeros 200 caracteres del bloque anterior y el texto del bloque actual) truncado a 192 tokens, y se distribuye en formato ONNX fp32 (opset 17, ~90 MB) con paridad numérica frente a PyTorch de 6e-8. Se entrenó sobre 922.468 filas derivadas de 44.869 artículos PMC en vista JATS y 5.165 PDF procesados por bibr.

Su relevancia es práctica: automatiza la extracción de metadatos de integridad científica que tradicionalmente se hacían con reglas heurísticas o revisión manual, con mejoras medidas frente a `rtransparent` y frente a las reglas internas de bibr en varios cohortes (por ejemplo, 0,984 de recall en COI de psychsci frente a 0,729 de rtransparent). Está publicado bajo licencia Apache 2.0 y pensado para ejecutarse en CPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (all-MiniLM-L6-v2) + masked mean pool + capa lineal con 7 salidas sigmoideas |
| Parametros totales | No disponible (el encoder base MiniLM-L6 tiene ~22,7 M; el total del modelo no se declara) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 192 tokens de entrada (par de secuencias: 200 caracteres del bloque anterior + texto del bloque) |
| Tipos de cuantizacion | No disponible (solo se distribuye ONNX fp32) |
| Idiomas soportados | Inglés principal; 448 artículos de entrenamiento no ingleses (de, fr, zh, pt, es, ru, ko, pl) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX fp32 (opset 17), `onnx/model.onnx`; tokenizer en `onnx/tokenizer.json`; configuración en `bibr_model.json` y `onnx/bibr_onnx.json` |

## Arquitectura y entrenamiento

El modelo sigue un esquema de clasificación multi-etiqueta por bloque: el encoder MiniLM-L6 genera embeddings de las dos secuencias de entrada (contexto previo y bloque actual), se aplica un pooling de media con máscara y una capa lineal produce siete logits independientes que pasan por sigmoide. Cada tipo tiene su propio umbral, ajustado sobre el conjunto de desarrollo en vista PDF. Los bloques adyacentes clasificados con el mismo tipo se fusionan en una única declaración mediante `statements/join.py`. La entrada se define de forma dependiente del parser: en las páginas 1-2 un bloque es una región de layout; en el resto, un grupo de líneas de la capa de texto tal como bibr los extrae.

El entrenamiento combina dos vistas. La vista JATS procede de 44.869 artículos PMC (39.580 train, 2.154 dev, 2.244 test, 891 test_journal) con 1,71 M de filas de bloque; los positivos se derivan del marcado JATS (`sec-type`, `fn-type`, `ack`, `funding-statement`, encabezados en cinco idiomas), con muestreo de negativos duros y exclusión de bloques ambiguos. La vista PDF cubre 5.165 artículos procesados por bibr (4.518 train, 243 dev, 256 test, 148 test_journal), proyectando las declaraciones JATS sobre los bloques PDF mediante contención de 3-gramas de palabras (recuperación del 94-98 % por tipo, salvo supplementary con 46 %). En total, 922.468 filas de entrenamiento (400.000 de la muestra JATS + 174.156 filas PDF × 3). Solo se usaron artículos con licencias CC BY, CC BY-SA o CC0, con un registro de exclusiones que garantiza que ningún conjunto de evaluación se filtró al entrenamiento. No se menciona RLHF ni DPO: es un clasificador supervisado, no un modelo generativo.

## Capacidades

- Clasificación multi-etiqueta de bloques científicos en siete tipos: conflicto de intereses, financiación, ética, disponibilidad de datos, contribuciones de autoría, agradecimientos y material suplementario.
- Detección sobre dos vistas de extracción distintas: layout de PDF (páginas 1-2) y grupos de líneas de la capa de texto.
- Fusión de bloques adyacentes del mismo tipo en una declaración única.
- Umbrales por tipo calibrados sobre el conjunto de desarrollo en vista PDF.
- Manejo limitado de texto no inglés (entrenado con 448 artículos en de, fr, zh, pt, es, ru, ko, pl), aunque el rendimiento en estos idiomas no está evaluado de forma robusta.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking: es un clasificador, no un modelo de lenguaje generativo.
- Ejecución en CPU con latencia de milisegundos por bloque, lo que permite integrarlo en pipelines de procesamiento masivo.

## Casos de uso

- Extracción automatizada de declaraciones de conflicto de intereses en repositorios de artículos: el modelo puede procesar cada bloque del artículo y emitir la probabilidad de COI, con umbrales calibrados que en el cohorte psychsci alcanzan un recall de 0,984. Es adecuado porque sustituye reglas heurísticas con una mejora medida frente a `rtransparent` (0,729) y frente a las reglas de bibr (0,891).
- Auditoría de financiación en revisiones sistemáticas: permite localizar la sección de financiación en lotes grandes de PDF, con un recall de 0,833 en psychsci y 0,677 para las reglas de bibr. Encaja en pipelines que ya usan bibr porque consume directamente sus bloques.
- Enriquecimiento de metadatos en repositorios institucionales: añadir campos de disponibilidad de datos, ética y contribuciones de autoría a registros que solo tienen el PDF, ejecutando el tagger sobre los bloques extraídos y fusionando los adyacentes.
- Verificación de integridad editorial en flujos de publicación: detectar artículos que declaran o no declaran COI, financiación o ética antes de la publicación, con coste de CPU de ~1 s por artículo (~300 bloques).
- Construcción de corpus anotados para investigación en metadatos científicos: usar las predicciones como etiquetas débiles o preanotaciones para revisión humana, dado que el modelo corre en CPU y no requiere GPU.
- Detección de material suplementario en repositorios: aunque es el tipo más débil (recuperación de proyección del 46 %), puede servir como señal complementaria combinada con reglas de enlaces y nombres de fichero.
- Integración en herramientas de reproducibilidad: alimentar un panel que muestre, por artículo, qué declaraciones de integridad están presentes y con qué confianza, usando las probabilidades por tipo y los umbrales calibrados.

## Benchmarks y rendimiento

| Conjunto | Métrica | Valor | Comparativa / notas |
|---|---|---|---|
| silver paired PDF view (398) | text_f1_macro | 0,908 | vs. brazo entrenado solo con JATS: 0,835; vs. reglas: 0,741 |
| silver paired JATS view (398) | text_f1_macro | 0,953 | — |
| silver PDF test (256) | block_f1_macro | 0,861 | — |
| silver PDF test_journal (148) | block_f1_macro | 0,825 | — |
| statements gold (97 papers, 262 statements) | found_pooled | 0,908 (IC 95 % [0,868, 0,943]) | vs. bibr 0.8.0 full: 0,744; vs. reglas: 0,844 |
| Metacheck psychsci COI (247) | found | 0,984 (IC 95 % [0,968, 0,996]) | vs. rtransparent: 0,729; vs. bibr full 12.2: 0,891 |
| Metacheck psychsci funding (247, 192 con financiación) | found | 0,833 (IC 95 % [0,781, 0,883]) | vs. rtransparent: 0,542; vs. bibr full 12.2: 0,677 |
| Metacheck MDPI COI (249) | found | 0,855 (IC 95 % [0,807, 0,900]) | vs. rtransparent: 0,876 |
| Metacheck economics COI (249, 68 con COI) | found | 0,750 (IC 95 % [0,643, 0,842]) | peor que las reglas; vs. rtransparent: 0,853 |
| gate192 pipeline completo (65 papers con acknowledgment gold) | sec.type:acknowledgment:presence | 0,857 | shipped: 0,696; diferencia +0,161 (IC 95 % [0,071, 0,259]); 9 papers mejor, ninguno peor |
| gate192 pipeline completo (54 papers con author-contribution gold) | sec.type:author_contributions:presence | 0,900 | shipped: 0,700; diferencia +0,200 (IC 95 % [0,098, 0,314]); 10 papers mejor, ninguno peor |
| gate192 pipeline completo (99 papers con discussion gold) | sec.type:discussion:unigram_precision | 0,747 | shipped: 0,737; diferencia +0,010 (IC 95 % [0,003, 0,019]) |
| gate192 pipeline completo (60 papers con heading gold) | header.detect | 0,851 | shipped: 0,856; diferencia −0,005 (IC 95 % [−0,008, −0,003]); 12 papers con un falso encabezado peor |
| gate192 y audience_eval200 pipeline completo (190 y 198 papers) | core fields (title, authors, abstract, doi, abstained) | idéntico | ningún campo de front-matter difiere |

## Requisitos de hardware

- Inferencia en CPU: 2,9-3,6 ms por bloque a batch 1 y 4,1-4,3 ms a batch 32, con 4 hilos fijados (512 bloques de test PDF, tokenización incluida; carga de host 9-11, no máquina ociosa). Bajo carga compartida más alta, 7-17 ms por bloque.
- Coste por artículo: ~300 bloques por paper, aproximadamente 1 s por artículo en CPU.
- VRAM estimada: no aplica en despliegue CPU; el modelo ONNX pesa ~90 MB en fp32, por lo que cabe holgadamente en cualquier GPU consumer (RTX 3060, RTX 4090) y en entornos sin GPU.
- GPU recomendadas: no se especifican; por tamaño, cualquier GPU con ≥1 GB de VRAM es suficiente. No se han publicado cifras de throughput en GPU.
- Despliegue: el formato nativo es ONNX (opset 17), ejecutable con ONNX Runtime. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que además no aplican a un clasificador de este tipo.
- Latencia y throughput: ~1 s por artículo en CPU de 4 hilos; escalable horizontalmente por ser stateless y ligero.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Enfoque | Rendimiento comparado |
|---|---|---|---|---|---|---|
| bibr-statement-tagger-v1 | Clasificador multi-etiqueta (ONNX) | No disponible (encoder MiniLM-L6 ~22,7 M) | 192 tokens | Apache 2.0 | Detección de 7 tipos de declaraciones de integridad en bloques científicos | COI psychsci 0,984; funding psychsci 0,833; economics COI 0,750 |
| rtransparent (reglas) | Reglas heurísticas | No aplica | No aplica | No disponible | Detección de transparencia en artículos | COI psychsci 0,729; funding psychsci 0,542; COI MDPI 0,876; COI economics 0,853 |
| bibr 0.8.0 / 12.2 (reglas internas) | Reglas del pipeline bibr | No aplica | No aplica | No disponible | Detección de declaraciones dentro de bibr | statements gold 0,744; COI psychsci 0,891; funding psychsci 0,677 |
| Modelos tipo SciBERT/BioBERT fine-tuned | Encoder clasificador | ~110 M | 512 tokens | Apache 2.0 / MIT (según variante) | Clasificación de secciones científicas | No disponible para esta tarea concreta |

La comparativa se limita a los sistemas evaluados en la model card (reglas de rtransparent y reglas internas de bibr). No se han publicado comparaciones con clasificadores neuronales alternativos de la misma tarea en la información disponible.

## Limitaciones y advertencias

- El scorer de validación gold no juzga declaraciones espurias sin capa de texto, por lo que las cifras gold son de naturaleza recall; la precisión solo se mide en los conjuntos silver y en los cohortes Metacheck.
- Las etiquetas silver provienen del marcado JATS: los párrafos de ética dentro de métodos y las declaraciones sin etiquetar son ambiguos y quedan fuera del entrenamiento y de la medición de precisión.
- El material suplementario es el tipo más débil: rara vez se imprime como declaración y la recuperación de la proyección es del 46 %.
- Los encabezados de página y pies repetidos constituyen el 9-13 % de los bloques PDF; el entrenamiento solo con JATS tipificó algunos como agradecimientos.
- En el cohorte de COI de economics de Metacheck las reglas de rtransparent encuentran más declaraciones (0,853 frente a 0,750); ese cohorte es texto GROBID, una vista sobre la que el tagger no se entrenó.
- psychsci y el gold de statements podrían haberse visto durante el desarrollo de las reglas de bibr; el filtro de encabezados de exportación se corrigió tras una primera inspección de los resultados gold.
- En el pipeline, una declaración sin encabezado propio recibe una sección nueva con un encabezado que bibr suministra ("Author contributions", "Acknowledgments"), lo que introduce falsos encabezados en 12 papers del conjunto de evaluación de headings.
- La porción de test no inglesa es pequeña (31 papers emparejados), por lo que el rendimiento multilingüe no está caracterizado con rigor.
- No se han publicado datos de sesgo demográfico, geográfico o lingüístico más allá de la composición del corpus.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las licencias de los artículos fuente (solo CC BY, CC BY-SA y CC0) si se redistribuyen datos derivados.
- El modelo depende del parser bibr: su entrada se define según los bloques que bibr extrae, por lo que su uso fuera de ese pipeline requiere replicar la segmentación.

## Enlaces

- Hugging Face: https://huggingface.co/scienceverse/bibr-statement-tagger-v1
- Repositorio del proyecto bibr (referenciado en la model card): no disponible como URL explícita
- Paper o blog de presentación: no disponible en la información proporcionada
- Demo: no disponible
- Registro de exclusiones y manifiesto de build: referenciados por hash (sha256 d8d427de3ea7b954), sin URL
- Split del corpus: corpus-split-v1, sha256 c6fc246571f435d7, sin URL
