# larc-iu/topdown_biaffine-rstdt-coarse

## Resumen

`larc-iu/topdown_biaffine-rstdt-coarse` es un parser de discurso RST (Rhetorical Structure Theory) de tipo top-down biaffine, publicado por el grupo LARC-IU y entrenado con la librería Dipo. No es un modelo generativo: es un modelo discriminativo especializado en análisis de discurso que, dada una segmentación en unidades de discurso elementales (EDU), predice la estructura arbórea y las relaciones retóricas entre segmentos. Se construye sobre el encoder SpanBERT-base-cased (arquitectura transformer, ~110 M de parámetros) y reimplementa el baseline presentado en Kobayashi et al. (Findings of EMNLP 2022).

El modelo se ha afinado sobre el RST Discourse Treebank (RST-DT), el corpus de referencia en inglés para parsing RST, compuesto por 385 artículos del Wall Street Journal. La particularidad de esta variante es que colapsa el inventario original de 111 etiquetas de relación en 18 categorías gruesas (coarse), lo que reduce la complejidad del espacio de etiquetas a costa de granularidad semántica.

Su relevancia es acotada pero clara: cubre una tarea de nicho (parsing discursivo) con métricas publicadas y una integración directa en la librería Dipo, lo que lo hace útil como componente de pipelines de análisis textual, evaluación de coherencia o investigación en discurso. No está pensado para generación de texto, tool calling ni despliegue conversacional.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (SpanBERT-base-cased) con cabeza de parsing top-down biaffine |
| Parámetros totales | ~110 M (heredados de SpanBERT-base-cased; no confirmado explícitamente en la model card) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (depende de la longitud de documento y de la segmentación en EDU) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Inglés (corpus RST-DT en inglés; no se declaran otros idiomas) |
| Licencia | No disponible |
| Formato de pesos | Pesos compatibles con la librería `dipo` (formato exacto no disponible; repo de 1,5 GB) |

## Arquitectura y entrenamiento

El modelo sigue el esquema de parsing top-down con atención biaffine descrito en Kobayashi et al. (2022): un encoder SpanBERT-base-cased produce representaciones contextuales de las EDU y una cabeza biaffine puntúa emparejamientos entre segmentos para construir el árbol de forma descendente, prediciendo simultáneamente la estructura (span, nuclearidad) y la relación retórica. El entrenamiento se realiza con la librería Dipo sobre los splits train/dev/test de RST-DT.

Los datos de entrenamiento son los 385 artículos del WSJ del RST-DT, con el inventario de relaciones mapeado de 111 etiquetas originales a 18 categorías gruesas: `attribution`, `background`, `cause`, `comparison`, `condition`, `contrast`, `elaboration`, `enablement`, `evaluation`, `explanation`, `joint`, `manner-means`, `same-unit`, `summary`, `temporal`, `textual-organization`, `topic-change` y `topic-comment`. La configuración completa de entrenamiento (rutas de datos, lista de `relation_types` con nuclearidad y mapa de relaciones) está publicada en la model card. El modelo requiere segmentación gold en EDU: la entrada debe ser un fichero RS3/RS4, no texto plano.

## Capacidades

- Parsing de discurso RST: predice el árbol retórico completo (spans, nuclearidad y relaciones) a partir de un documento con EDU pre-segmentadas.
- Clasificación de relaciones retóricas en 18 categorías gruesas, con distinción entre relaciones mononuclear (`rst`) y multinuclear (`multinuc`).
- Predicción de nuclearidad (núcleo vs. satélite) dentro de cada relación.
- Integración programática mediante `TopdownBiaffineParser.from_pretrained` y CLI (`python -m dipo topdown_biaffine predict`).
- Entrada restringida a formatos RS3/RS4 con segmentación gold; no realiza segmentación de EDU por sí mismo.
- No soporta generación de texto, tool calling, agentes, visión ni audio.

## Casos de uso

- Análisis de coherencia en textos académicos o periodísticos: el parser devuelve la estructura retórica de un documento RS3 y permite medir la organización discursiva (por ejemplo, proporción de relaciones `elaboration` frente a `contrast`) en estudios de escritura.
- Investigación en lingüística computacional: reproduce el baseline de Kobayashi et al. (2022) sobre RST-DT para experimentos comparativos de parsing discursivo con inventario grueso de relaciones.
- Evaluación de resúmenes automáticos: la estructura RST predicha puede usarse como señal auxiliar para comprobar si un resumen preserva las relaciones nucleares del documento fuente.
- Preprocesado para pipelines de extracción de información: las relaciones `cause`, `condition` o `temporal` permiten enriquecer grafos de conocimiento con vínculos discursivos entre cláusulas.
- Análisis de argumentación: las etiquetas `contrast`, `evaluation` y `topic-comment` sirven para localizar movimientos argumentativos en corpus de opinión ya segmentados en EDU.
- Docencia y anotación asistida: el parser genera un árbol RST de referencia que un anotador humano puede corregir en herramientas compatibles con RS3, acelerando el etiquetado de nuevos corpus.
- Componente en sistemas de evaluación de traducción o generación: comparar la estructura discursiva del texto fuente y del texto generado como métrica complementaria a BLEU/ROUGE.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre RST-DT con inventario de 18 relaciones:

| Split | span_f1 | nuc_f1 | rel_f1 | full_f1 |
|---|---|---|---|---|
| dev | 0,7576 | 0,6422 | 0,5383 | 0,5210 |
| test | 0,7552 | 0,6330 | 0,5257 | 0,5135 |

No se han publicado en la información disponible resultados comparativos frente a otros parsers en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 2 GB en fp32 para un modelo de ~110 M de parámetros más la cabeza biaffine; el repo ocupa 1,5 GB en disco.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; A100 o H100 no aportan ventaja significativa por el tamaño reducido del modelo.
- Cabe holgadamente en GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en CPU para documentos individuales.
- Opciones de despliegue: la librería `dipo` (instalable con `pip install dipo`) es la vía oficial, tanto por API como por CLI. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos generativos.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Encoder | Relaciones | full_f1 (test) | Licencia |
|---|---|---|---|---|---|
| larc-iu/topdown_biaffine-rstdt-coarse | Top-down biaffine (Dipo) | SpanBERT-base | 18 (coarse) | 0,5135 | No disponible |
| Baseline Kobayashi et al. (2022) | Top-down biaffine | No disponible en la información | Inventario fino | No disponible en la información | No disponible |
| Otros parsers RST en Dipo | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone en la información proporcionada de datos de rendimiento de alternativas comparables para establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Requiere segmentación gold en EDU: la entrada debe ser un fichero RS3/RS4; no acepta texto plano ni realiza segmentación automática.
- Entrenado exclusivamente en inglés (RST-DT, WSJ); no hay evidencia de generalización a otros idiomas ni a dominios distintos del periodístico.
- El inventario grueso de 18 relaciones pierde granularidad respecto al etiquetado fino original (111 etiquetas), lo que puede ser inadecuado para análisis que requieran distinciones sutiles.
- Corpus de entrenamiento pequeño (385 documentos), con riesgo de sobreajuste al estilo del WSJ y baja robustez ante dominios divergentes.
- Licencia no declarada: no se puede asumir uso comercial sin verificar los términos con el autor y con las licencias de SpanBERT y RST-DT (este último distribuido por LDC bajo condiciones propias).
- Métricas moderadas: full_f1 de 0,51 en test implica que aproximadamente la mitad de las estructuras completas no se predicen correctamente, por lo que no es apto como anotador autónomo sin revisión humana.
- Sin información sobre sesgos específicos, calibración ni comportamiento ante documentos largos; la longitud de contexto efectiva no está documentada.
- No es un modelo generativo: no debe evaluarse con expectativas de chatbot, razonamiento o generación de código.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/larc-iu/topdown_biaffine-rstdt-coarse
- Repositorio Dipo: https://github.com/larc-iu/dipo
- Paper del parser reimplementado (Kobayashi et al., Findings of EMNLP 2022): https://aclanthology.org/2022.findings-emnlp.501/
- Paper de Dipo (Gessler y Zeldes, arXiv:2610.17658): https://arxiv.org/abs/2610.17658
- Encoder base SpanBERT: https://huggingface.co/SpanBERT/spanbert-base-cased
- Corpus RST-DT (LDC2002T07): https://catalog.ldc.upenn.edu/LDC2002T07
