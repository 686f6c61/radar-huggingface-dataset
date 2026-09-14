# CogSciMikkel/da_dacy_medium_trf

## Resumen

`da_dacy_medium_trf` es el pipeline de tamano medio del marco DaCy (Danish Language Processing Framework), desarrollado por Johana Mayerová, Mikkel Krøjer Svendsen y Kenneth Enevoldsen dentro del Centre for Humanities Computing. No es un modelo generativo: es un pipeline de anotacion linguistica para danes construido sobre spaCy 3.8, con un encoder transformer como componente base (`vesteinn/ScandiBERT-no-faroese`) seguido de tagger, morphologizer, lematizador entrenable, parser de dependencias y reconocedor de entidades nombradas (NER).

Resuelve el problema del preprocesado y la anotacion linguistica de corpus en danes: POS tagging, morfologia, lematizacion, parsing de dependencias, segmentacion de frases y NER en una sola pasada, con 218 etiquetas repartidas en cuatro componentes. Es relevante porque el danes es un idioma con recursos limitados en comparacion con el ingles, y este pipeline ofrece anotacion de nivel de produccion bajo licencia Apache-2.0.

El modelo se distribuye como pipeline spaCy (1,0 GB de repositorio) y declara metricas de NER con F-score de 0,8603 y precision de 0,8386, ademas de exactitudes superiores al 98% en POS, XPOS y morfologia. El numero de parametros totales, la longitud de contexto efectiva y las opciones de cuantizacion no estan documentados en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (base `vesteinn/ScandiBERT-no-faroese`) integrado como componente `transformer` de spaCy, con cabezas de clasificacion de tokens para tagger, morphologizer, lematizador, parser y NER |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio distribuye el pipeline spaCy sin variantes cuantizadas documentadas) |
| Idiomas soportados | danes (`da`) |
| Licencia | Apache-2.0 |
| Formato de pesos | pipeline spaCy >=3.8.14,<3.9.0 (directorio con `config.cfg`, `meta.json` y pesos binarios del transformer y de los componentes) |

Datos adicionales del pipeline:

| Campo | Valor |
|---|---|
| Nombre | `da_dacy_medium_trf` |
| Version | 0.2.9 |
| Libreria | spaCy |
| Pipeline por defecto | `transformer`, `tagger`, `morphologizer`, `trainable_lemmatizer`, `parser`, `ner` |
| Vectores estaticos | 0 claves, 0 vectores unicos (0 dimensiones) |
| Numero de etiquetas | 218 etiquetas en 4 componentes |
| Tamano del repositorio | 1,0 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es un pipeline de spaCy en el que el componente `transformer` actua como extractor de caracteristicas contextuales para el resto de componentes. El encoder subyacente es `vesteinn/ScandiBERT-no-faroese`, un modelo preentrenado para lenguas escandinavas (sin feroes). Sobre el se anaden un tagger (18 etiquetas XPOS incluida `Polarity=Neg`), un morphologizer con rasgos universales (UFeats), un lematizador entrenable, un parser de dependencias y un NER. No se documentan en la informacion disponible ni el numero de tokens de entrenamiento, ni si hubo fases de RLHF/DPO (algo poco habitual en modelos discriminativos de este tipo), ni innovaciones tecnicas adicionales.

Los datos de entrenamiento declarados son cuatro fuentes: el corpus UD Danish DDT v2.18 (dependencias y morfologia), DaNE (entidades nombradas en danes), DaCoref y el conjunto `johanamayer/cdt_ddt_union`, ademas del corpus de Universal Dependencies referenciado en los tags. Al tratarse de un modelo discriminativo de etiquetado de tokens, el entrenamiento es supervisado sobre anotaciones linguisticas, no generativo.

## Capacidades

- Etiquetado de partes de la oracion (POS/UPOS) y de etiquetas XPOS con exactitud declarada de 0,9848 y 0,9840 respectivamente.
- Analisis morfologico de rasgos universales (UFeats) con exactitud declarada de 0,9828.
- Lematizacion entrenable con exactitud declarada de 0,9662.
- Analisis sintactico de dependencias: UAS 0,8958 y LAS 0,8664.
- Segmentacion de frases con F-score declarado de 0,9767.
- Reconocimiento de entidades nombradas en danes con precision 0,8386, recall 0,8832 y F-score 0,8603.
- Procesamiento por lotes de documentos (`nlp.pipe`) y extraccion de atributos linguisticos por token mediante la API de spaCy.
- No dispone de generacion de texto, razonamiento, codigo, matematicas ni vision.
- No dispone de tool calling, function calling ni capacidades de agente o razonamiento multi-paso.
- Capacidad multilingue: ninguna; el modelo esta entrenado y evaluado unicamente para danes.
- No dispone de vectores estaticos de palabras (0 vectores unicos), por lo que el lexico se representa solo de forma contextual a traves del transformer.

## Casos de uso

- Preprocesado de corpus academicos en danes: el pipeline devuelve en una sola llamada POS, morfologia, lemas, dependencias, frases y entidades, lo que permite construir corpus anotados de forma reproducible para linguistica de corpus o humanidades digitales.
- Analisis de opiniones y encuestas danesas: la extraccion de entidades y la lematizacion permiten agregar menciones de organizaciones, personas y lugares en respuestas abiertas, filtrando por categorias gramaticales como sustantivos propios.
- Indexacion y busqueda semantica en danes: los lemas y las dependencias generados pueden alimentar indices invertidos o motores de busqueda que necesiten normalizacion morfologica del danes.
- Procesado de documentos legales o administrativos daneses: la segmentacion de frases (F-score 0,9767) y el parsing de dependencias son utiles para dividir expedientes y extraer relaciones entre entidades en textos largos troceados en unidades oracionales.
- Extraccion de informacion en pipelines de datos: el modelo puede integrarse como etapa previa a un sistema de extraccion de relaciones o de resolucion de entidades, aportando la capa morfosintactica sobre la que operar.
- Monitorizacion de medios daneses: deteccion de personas, organizaciones y ubicaciones en flujos de noticias para cuantificar cobertura o construir grafos de coocurrencia de entidades.
- Aumentacion de datos para entrenar otros modelos en danes: las anotaciones de lemas, POS y dependencias pueden servir como pseudoetiquetas o como supervision auxiliar en tareas posteriores.
- Evaluacion y auditoria de pipelines de PLN daneses: DaCy incluye pruebas de sesgo y robustez documentadas en su repositorio, por lo que el modelo sirve como linea base comparable frente a otras alternativas.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index (todos marcados como `verified: false`, es decir, no verificados de forma independiente):

| Tarea | Metrica | Valor |
|---|---|---|
| NER | Precision | 0,8386 |
| NER | Recall | 0,8832 |
| NER | F-score | 0,8603 |
| TAG | XPOS accuracy | 0,9840 |
| POS | UPOS accuracy | 0,9848 |
| MORPH | UFeats accuracy | 0,9828 |
| LEMMA | Lemma accuracy | 0,9662 |
| UNLABELED_DEPENDENCIES | UAS (F-score) | 0,8958 |
| LABELED_DEPENDENCIES | LAS (F-score) | 0,8664 |
| SENTS | Sentences F-score | 0,9767 |

No se han publicado en la informacion disponible resultados de benchmarks comparativos con otros modelos (MMLU, HumanEval, GSM8K u otros) porque no aplican a un modelo discriminativo de etiquetado de tokens.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 1,0 GB, por lo que la carga del pipeline completo requiere del orden de 2 a 4 GB de memoria en GPU contando pesos en fp32, activaciones y los componentes de spaCy (estimacion, no dato oficial).
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM es suficiente; una RTX 3060, RTX 4090, A100 o H100 estan sobredimensionadas para este modelo. El modelo tambien funciona en CPU, que suele ser la opcion habitual en spaCy para procesamiento por lotes.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo con 4 GB o mas (GTX 1650, RTX 3050, RTX 4060, entre otras).
- Opciones de despliegue: `spacy.load("da_dacy_medium_trf")` o carga desde el repositorio de HuggingFace con spaCy >=3.8.14,<3.9.0; el componente transformer se ejecuta via `spacy-transformers` con PyTorch en CPU o GPU. vLLM, llama.cpp, Ollama y TGI no aplican, ya que no es un modelo generativo.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | NER F-score | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `CogSciMikkel/da_dacy_medium_trf` (este modelo) | Pipeline spaCy con transformer | no disponible | no disponible | 0,8603 | Apache-2.0 | HuggingFace + repo DaCy |
| Variante small de DaCy | Pipeline spaCy (misma familia) | no disponible | no disponible | no disponible | no disponible | repo DaCy |
| Variante large de DaCy | Pipeline spaCy (misma familia) | no disponible | no disponible | no disponible | no disponible | repo DaCy |
| `vesteinn/ScandiBERT-no-faroese` | Encoder transformer preentrenado | no disponible | no disponible | no aplica (modelo base, sin fine-tuning de NER) | no disponible | HuggingFace |

La informacion disponible no incluye las metricas de las variantes small y large de DaCy ni de otros pipelines de PLN en danes, por lo que no es posible establecer una comparacion cuantitativa completa. Las alternativas naturales son las otras variantes de la propia familia DaCy (small y large), que cubren el mismo espacio de tareas con distintos compromisos de velocidad y precision.

## Limitaciones y advertencias

- Cobertura linguistica limitada al danes: no soporta otros idiomas, ni siquiera las otras lenguas escandinavas cubiertas por el modelo base ScandiBERT del que deriva.
- Es un modelo discriminativo de etiquetado de tokens: no genera texto, no razona y no puede usarse como asistente conversacional.
- Las metricas declaradas estan marcadas como `verified: false` en el model-index; no han sido verificadas de forma independiente.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de falsos positivos y falsos negativos en NER (precision 0,8386 implica que aproximadamente uno de cada seis positivos predichos puede ser incorrecto) y de errores de etiquetado en dominios alejados del corpus de entrenamiento.
- Sesgos conocidos: el repositorio de DaCy incluye pruebas de comportamiento sobre sesgos y robustez, pero la informacion disponible no detalla resultados concretos para este pipeline. Los sesgos de los corpus de origen (noticias, textos legales, literatura) pueden trasladarse al modelo.
- Sin vectores estaticos de palabras (0 dimensiones), lo que limita cualquier uso que dependa de similitud lexica directa.
- Licencia Apache-2.0 para el modelo, pero se recomienda revisar las condiciones de los corpus de entrenamiento de origen (UD Danish DDT, DaNE, DaCoref, `johanamayer/cdt_ddt_union`), que pueden tener licencias propias distintas y afectar a la redistribucion de datos derivados.
- Dependencia estricta de version: requiere spaCy >=3.8.14 y <3.9.0, lo que puede complicar la integracion en entornos con versiones distintas.
- El repositorio registra 0 descargas y 0 likes, sin adopcion comunitaria documentada, y no se dispone de informacion sobre mantenimiento futuro.
- En produccion conviene trocear los documentos porque la longitud de contexto efectiva no esta documentada y los pipelines de spaCy aplican limites internos de truncado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/CogSciMikkel/da_dacy_medium_trf
- Repositorio de DaCy (codigo, guias y reproduccion de resultados): https://github.com/centre-for-humanities-computing/DaCy
- Documentacion de DaCy: https://centre-for-humanities-computing.github.io/DaCy/
- Modelo base ScandiBERT-no-faroese: https://huggingface.co/vesteinn/ScandiBERT-no-faroese
- Corpus UD Danish DDT v2.18: https://github.com/UniversalDependencies/UD_Danish-DDT
- Dataset DaNE: https://huggingface.co/datasets/dane
- Dataset DaCoref: https://huggingface.co/datasets/alexandrainst/dacoref
- La busqueda web realizada no ha devuelto ningun resultado relevante sobre este modelo (los resultados obtenidos correspondian a contenidos no relacionados en chino y ruso).
