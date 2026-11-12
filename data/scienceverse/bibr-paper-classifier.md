# scienceverse/bibr-paper-classifier

## Resumen

`bibr-paper-classifier` es un modelo de clasificación de artículos científicos desarrollado por el proyecto scienceverse para la etapa `extract/core metadata` del pipeline bibr. No es un modelo generativo: es un encoder de tipo sentence-transformers construido sobre `all-MiniLM-L6-v2` al que se le añade una cabeza de pooling con tres salidas lineales (OECD L1 con 6 clases, OECD L2 con 32 clases y tipo de artículo con 7 clases). Su función es recibir título y abstract (máximo 256 tokens) y devolver la categorización temática y tipológica del paper.

El modelo se distribuye en formato ONNX fp32 (opset 17) de 90 MB, con paridad frente a la implementación en PyTorch de 1,5e-6 de diferencia absoluta máxima en logits. Sustituye a la versión anterior del mismo identificador (`scienceverse/bibr-paper-classifier` en la revisión 6046171) y se carga en bibr mediante la variable de configuración `ML_PAPER_CLASSIFIER_MODEL_ID` en la ruta rápida por defecto.

Su relevancia es acotada pero concreta: ofrece un clasificador ligero, determinista y desplegable en CPU para metadatos de literatura científica, con métricas publicadas sobre conjuntos de test separados por revista y con un registro de exclusiones documentado. No está pensado para uso general ni para generación de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer (sentence-transformers/all-MiniLM-L6-v2) + mean pooling + tres cabezas lineales (OECD L1 6 clases, OECD L2 32 clases, paper type 7 clases) |
| Parametros totales | 22.730.541 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 256 tokens (título + abstract) |
| Tipos de cuantizacion | no disponible (distribución en ONNX fp32) |
| Idiomas soportados | Entrenamiento mayoritariamente en inglés (24.590 filas de 24.796); presencia residual de de (43), es (17), fr (60), pt (38), ru (5), zh (43) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX fp32 (opset 17), tokenizer.json, bibr_model.json, bibr_onnx.json |

## Arquitectura y entrenamiento

El modelo es un encoder `all-MiniLM-L6-v2` inicializado desde el checkpoint anterior del mismo proyecto, sobre el que se aplica mean pooling y se conectan tres cabezas lineales independientes: OECD L1 (6 clases), OECD L2 (32 clases) y tipo de artículo (7 clases). La entrada es la concatenación de título y abstract truncada a 256 tokens. La exportación a ONNX fp32 (opset 17) mantiene paridad numérica con PyTorch con una diferencia máxima absoluta de logits de 1,5e-6.

El conjunto de entrenamiento contiene 24.796 filas: 16.796 de PMC con tipo de artículo asignado y 8.000 de arXiv usadas solo para destilación. El dev tiene 3.646 filas y el test 8.304, cada uno con 1.000 filas de arXiv. Tras el registro y el split se conservan 47.201 papers PMC etiquetados, con separación por revista (journal-disjoint) mediante hash con sal fija (195) sobre `corpus-split-v1`. Las etiquetas de tipo de artículo se derivan de JATS article-type, tipos de publicación MEDLINE y reglas sobre el título; las cabezas OECD no reciben etiquetas duras. Solo se emplean licencias CC BY, CC BY-SA y CC0 (23.714 / 528 / 554 filas de train). El conjunto `empirical` está limitado empíricamente a 9.000 papers y `retraction` cuenta con solo 19 filas de train. Todos los conjuntos de evaluación del registro de exclusiones (`exclusions-b8`, sha256 `b7ec1d94d0915498`) quedaron fuera del entrenamiento.

## Capacidades

- Clasificación de tipo de artículo científico en 7 clases: case-study, commentary, empirical, erratum, meta-analysis, retraction y review.
- Clasificación temática jerárquica OECD en dos niveles: L1 (6 clases) y L2 (32 clases).
- Procesamiento de título y abstract de hasta 256 tokens.
- Inferencia determinista en CPU o GPU mediante runtime ONNX.
- Integración directa en el pipeline bibr a través de `ML_PAPER_CLASSIFIER_MODEL_ID`.
- Manejo residual de abstracts en alemán, español, francés, portugués, ruso y chino (rendimiento significativamente inferior al inglés).
- No soporta tool calling, agentes, generación de texto, visión ni audio.

## Casos de uso

- Enriquecimiento de metadatos en repositorios científicos: dado un título y un abstract, asignar automáticamente tipo de artículo y categorías OECD L1/L2 para indexación y filtrado en bases de datos tipo PMC u OpenAlex.
- Filtrado previo en pipelines de revisión sistemática: descartar o priorizar comentarios, erratas y retracciones antes de la lectura manual, apoyándose en la alta recall observada en erratum (0,972) y meta-analysis (0,973).
- Detección de retracciones en flujos editoriales: aunque el modelo tiene solo 19 filas de entrenamiento para esa clase, la recall reportada sobre el gold es de 0,90, lo que permite usarlo como señal de alerta temprana combinada con otras fuentes.
- Clasificación temática para recomendadores de literatura: usar las salidas OECD L1 y L2 para agrupar papers por área y alimentar sistemas de recomendación o clustering.
- Preprocesado en pipelines de extracción de conocimiento: etiquetar el corpus antes de aplicar extracción de entidades o relaciones, aprovechando que el modelo corre en CPU con un ONNX de 90 MB.
- Moderación y curación de colecciones editoriales: separar empíricos de reviews y comentarios en envíos a revistas, con la ventaja de que el modelo es determinista y auditable.
- Clasificación multilingüe de abstracts: uso en corpus con mezcla de idiomas, asumiendo el descenso de macro-F1 a 0,66 en la porción no inglesa.

## Benchmarks y rendimiento

| Conjunto | Métrica | Valor | Modelo anterior (shipped) | Diferencia |
|---|---|---|---|---|
| PMC journal-disjoint test (7304) | paper_type_macro_f1 | 0,864 | 0,495 | +0,369 (IC95 % [0,342; 0,394]) |
| PMC journal-disjoint test (7304) | paper_type_accuracy | 0,952 | 0,919 | +0,033 |
| PMC test, class-capped a 300 | paper_type_macro_f1 | 0,919 | 0,500 | +0,419 |
| PMC test, 5 clases emitibles por la cabeza shipped | paper_type_macro_f1 | 0,858 | 0,599 | +0,259 |
| PMC test, meta-analysis fusionado con review | paper_type_macro_f1 | 0,859 | 0,596 | +0,263 |
| PMC in-journal test (2255) | paper_type_macro_f1 | 0,862 | 0,435 | +0,427 |
| Filas no inglesas de conjuntos PMC no-train | paper_type_macro_f1 | 0,660 | 0,299 | +0,361 |
| 10.000 filas held-out | l1_top1_agreement con shipped | 0,973 | — | — |
| 10.000 filas held-out | l2_top1_agreement con shipped | 0,940 | — | — |
| OpenAlex-topic sample (6000) | l1_accuracy | 0,710 | 0,713 | -0,003 |
| OpenAlex-topic sample (6000) | l2_accuracy | 0,547 | 0,553 | -0,006 |
| arXiv test proxy labels (2000) | l1_accuracy | 0,864 | 0,863 | +0,001 |
| arXiv test proxy labels (2000) | l2_accuracy | 0,768 | 0,773 | -0,005 |
| paper-type gold v1, todos (362) | accuracy | 0,768 | 0,442 | +0,326 (IC95 % [0,268; 0,387]) |
| paper-type gold v1, todos (362) | macro_f1 | 0,822 | 0,290 | +0,532 |
| paper-type gold v1, PMC (270) | accuracy | 0,837 | 0,459 | +0,378 (IC95 % [0,304; 0,448]) |
| paper-type gold v1, OpenAlex no-PMC (92) | accuracy | 0,565 | 0,391 | +0,174 (IC95 % [0,076; 0,283]) |

Recall por clase en paper-type gold v1: case-study 0,732, commentary 0,698, empirical 0,755, erratum 0,972, meta-analysis 0,973, retraction 0,900, review 0,649.

## Requisitos de hardware

- El modelo se distribuye como ONNX fp32 de 90 MB; en memoria de trabajo ocupa aproximadamente 0,1 GB, por lo que cabe holgadamente en cualquier CPU moderna.
- No requiere GPU dedicada; puede ejecutarse en CPU con latencias de milisegundos por muestra.
- Compatible con cualquier GPU consumer (RTX 3060, RTX 4090, etc.) si se desea aceleración, aunque el cuello de botella no es el cómputo.
- Despliegue mediante runtime ONNX (onnxruntime, onnxruntime-gpu) o a través del pipeline bibr, que lo carga vía `ML_PAPER_CLASSIFIER_MODEL_ID`.
- El repositorio ocupa 0,8 GB, aunque los ficheros de inferencia suman unos 91 MB (model.onnx 90,5 MB + tokenizer 0,7 MB).
- Throughput y latencia exactos no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| scienceverse/bibr-paper-classifier (este) | 22,7 M | 256 tokens | Clasificación paper type + OECD L1/L2 | Apache 2.0 | Hugging Face, ONNX |
| scienceverse/bibr-paper-classifier @ 6046171 (versión previa) | no disponible | 256 tokens | Clasificación paper type + OECD | Apache 2.0 | Hugging Face |
| all-MiniLM-L6-v2 (encoder base) | ~22,7 M | 256 tokens | Embeddings de frases | Apache 2.0 | Hugging Face |

La comparación directa con otros clasificadores de literatura científica (p. ej. SciBERT o SPECTER) no está disponible en la información proporcionada; el autor solo reporta comparaciones internas contra la versión previa del propio modelo.

## Limitaciones y advertencias

- El modelo está entrenado mayoritariamente en inglés; el rendimiento en otros idiomas cae a un macro-F1 de 0,66 en la porción no inglesa, con intervalos amplios por tamaño muestral reducido.
- Fuera de PMC el modelo no mejora a la versión anterior: en OpenAlex no-PMC el accuracy es -0,054 (IC95 % -0,109; 0,000) y el macro-F1 -0,050 (IC95 % -0,111; -0,010).
- La clase `retraction` tiene solo 19 filas de entrenamiento y el test PMC journal-disjoint no contiene ninguna, por lo que su evaluación depende exclusivamente del gold.
- Las etiquetas derivadas (JATS + MEDLINE) coinciden con el gold en el 86 % de los papers PMC muestreados; cuando MEDLINE no aporta información y la etiqueta proviene solo de JATS, la coincidencia baja al 75 %.
- La clase `empirical` está limitada empíricamente a 9.000 papers de entrenamiento.
- El gold de paper-type ya se ha usado en dos rondas de evaluación; una tercera revisión dejaría de ser un test limpio, por lo que el autor advierte que nuevos datos deben ir a un gold nuevo.
- El modelo no genera texto ni soporta instrucciones; es exclusivamente un clasificador.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre rendimiento fuera de los dominios evaluados (PMC, OpenAlex, arXiv).
- Riesgo de alucinación no aplica en sentido generativo, pero sí de clasificación errónea en clases con pocas muestras (commentary recall 0,698, review recall 0,649).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/scienceverse/bibr-paper-classifier
- Repositorio bibr (referenciado en la model card): no disponible como URL explícita en la información proporcionada
- Encoder base: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2
- Paper o blog del autor: no disponible en la información proporcionada
- Demo: no disponible en la información proporcionada
