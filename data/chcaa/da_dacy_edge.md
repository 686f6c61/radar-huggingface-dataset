# chcaa/da_dacy_edge

## Resumen

DaCy edge (`chcaa/da_dacy_edge`, versión 0.3.0) es un pipeline de procesamiento de lenguaje natural para danés desarrollado por el Centre for Humanities Computing de la Universidad de Aarhus (autores: Johana Mayerova, Mikkel Krøjer Svendsen y Kenneth Enevoldsen). No es un modelo generativo ni un LLM: es un pipeline de anotación lingüística construido sobre spaCy (versión >=3.8.14,<3.9.0) que resuelve tokenización, etiquetado morfológico, análisis de dependencias, lematización, segmentación de frases y reconocimiento de entidades nombradas en una sola pasada. La variante "edge" está entrenada explícitamente para inferencia eficiente en CPU.

El modelo forma parte del ecosistema DaCy, un framework danés que agrupa pipelines de estado del arte y utilidades para analizar el comportamiento de dichos pipelines. La relevancia de esta ficha es acotada: se trata de un modelo especializado en una única lengua (danés), con licencia Apache-2.0 permisiva y un tamaño de repositorio de 0.0 GB, lo que lo hace desplegable en entornos sin GPU. Sus métricas declaradas se sitúan en un rango de F1 0.7256 en NER (DaNE) y exactitudes entre 0.93 y 0.95 en tareas morfosintácticas sobre UD Danish DDT.

El repositorio tiene 0 descargas y 0 "likes" en HuggingFace, y su fecha de creación registrada (2026-09-16) es posterior a la fecha habitual de publicación de DaCy, por lo que conviene tratar esos metadatos con cautela. Al no disponer de vectores estáticos (0 claves, 0 vectores únicos), toda la representación depende del encoder `tok2vec` compartido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline spaCy basado en `tok2vec` (encoder contextual compartido) con componentes `morphologizer`, `parser`, `lemmatizer`, `attribute_ruler`, `ner` y `senter` (este último no incluido en el pipeline por defecto) |
| Parametros totales | no disponible |
| Longitud de contexto | no aplica en el sentido de ventana de atención (no es un modelo generativo); el límite práctico lo fija el parámetro `nlp.max_length` de spaCy, cuyo valor no se especifica en la model card |
| Tipos de cuantizacion | no disponible; se distribuye en formato nativo de spaCy, sin versiones GGUF, ONNX o cuantizadas documentadas |
| Idiomas soportados | danes (codigo `da`) |
| Licencia | Apache-2.0 |
| Formato de pesos | formato nativo de spaCy (thinc); tamano del repositorio 0.0 GB |
| Version del modelo | 0.3.0 |
| Compatibilidad spaCy | >=3.8.14,<3.9.0 |
| Vectores estaticos | 0 claves, 0 vectores unicos (0 dimensiones) |
| Etiquetas | 200 etiquetas repartidas en 3 componentes (`morphologizer`, `parser`, `ner`) |
| Fuentes de datos | UD Danish DDT v2.18, DaNE, DaCoref |
| Pipeline de inferencia | `token-classification` |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura estándar de spaCy: un encoder `tok2vec` que genera representaciones contextuales compartidas para el resto de componentes. Sobre esa representación se montan los componentes de etiquetado: `morphologizer` (lema, POS y rasgos morfológicos universales), `parser` (árbol de dependencias y segmentación de frases en el pipeline por defecto), `lemmatizer`, `attribute_ruler` y `ner` (reconocimiento de entidades nombradas). El componente `senter` está disponible en el paquete pero no forma parte del pipeline por defecto, ya que el `parser` cubre la segmentación oracional. El esquema de etiquetas incluye 200 clases en 3 componentes, con etiquetas del tipo `Definite=Def|Gender=Com|Number=Sing|POS=NOUN` o `Mood=Ind|POS=AUX|Tense=Pres|VerbForm=Fin|Voice=Act`.

El entrenamiento combina tres corpus anotados: UD Danish DDT v2.18 (dependencias, morfología y lemas; Johannsen, Martínez Alonso y Plank), DaNE (entidades nombradas en danés; Hvingelby et al.) y DaCoref (Buch-Kromann). La model card no indica el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas de ajuste como RLHF o DPO (habitualmente no aplicables a pipelines de análisis lingüístico). Tampoco se documenta ninguna innovación técnica específica más allá del objetivo declarado de eficiencia en CPU. Todos los resultados del `model-index` figuran con `verified: false`, es decir, son declaraciones del autor no verificadas de forma independiente.

## Capacidades

- Tokenización, lematización, etiquetado POS (UPOS) y análisis de rasgos morfológicos (UFeats) para danés.
- Análisis de dependencias sintácticas etiquetadas (LAS) y no etiquetadas (UAS).
- Segmentación de frases mediante el componente `parser` (y `senter` como alternativa disponible).
- Reconocimiento de entidades nombradas en danés, con etiquetas propias de DaNE.
- Anotación morfológica con 200 etiquetas repartidas entre `morphologizer`, `parser` y `ner`.
- Inferencia eficiente en CPU, sin necesidad de GPU ni de `spacy-transformers`.
- Integración nativa en el ecosistema spaCy (pipelines, `Doc`, `Span`, serialización estándar) y en el framework DaCy.
- No soporta generación de texto, razonamiento, código, matemáticas, visión, audio ni tool calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso.
- Multilingüismo: únicamente danés (`da`); no se documentan capacidades en otras lenguas.

## Casos de uso

- Anotación lingüística de corpus daneses: el pipeline procesa textos completos y devuelve lemas, POS, rasgos morfológicos y árboles de dependencias listos para su explotación en investigación lingüística o humanidades digitales, sin coste de GPU.
- Extracción de entidades en documentos daneses: detección de personas, organizaciones y lugares en archivos, actas o correspondencia, con una F1 declarada de 0.7256 sobre DaNE para estimar el volumen de revisión manual necesaria.
- Preprocesado para búsqueda y recuperación de información: lematización y normalización de términos en danés para construir índices invertidos o motores de búsqueda internos con `Elasticsearch`/`OpenSearch`.
- Enriquecimiento de datos tabulares o registros administrativos: etiquetado morfosintáctico de campos de texto libre en danés para análisis estadístico o clustering posterior.
- Análisis de opiniones y reseñas en danés: segmentación de frases y dependencias para extraer pares sujeto-predicado en encuestas o comentarios, aprovechando la eficiencia en CPU para volúmenes altos.
- Integración en servicios de bajo consumo: al ejecutarse en CPU y con repositorio de 0.0 GB, es viable desplegarlo en contenedores pequeños, funciones serverless o dispositivos sin acelerador.
- Construcción de anotadores automáticos previos a revisión humana: generación de preanotaciones para herramientas como `prodigy` o `INCEpTION` en proyectos de anotación daneses.
- Análisis de estructura de dependencias en textos legales o administrativos daneses: extracción de relaciones sujeto-verbo-objeto para resumir o clasificar cláusulas.

## Benchmarks y rendimiento

Resultados declarados por el autor en el `model-index` de la model card (ninguno verificado de forma independiente):

| Tarea | Metrica | Dataset (split) | Valor |
|---|---|---|---|
| NER | Precision | DaNE (test) | 0.7440 |
| NER | Recall | DaNE (test) | 0.7081 |
| NER | F Score | DaNE (test) | 0.7256 |
| POS | UPOS Accuracy | UD Danish DDT (test, `da_ddt`) | 0.9453 |
| MORPH | UFeats Accuracy | UD Danish DDT (test, `da_ddt`) | 0.9338 |
| LEMMA | Lemma Accuracy | UD Danish DDT (test, `da_ddt`) | 0.9427 |
| Dependencias no etiquetadas | UAS | UD Danish DDT (test, `da_ddt`) | 0.8101 |
| Dependencias etiquetadas | LAS | UD Danish DDT (test, `da_ddt`) | 0.7606 |
| Segmentacion de frases | Sentences F-Score | UD Danish DDT (test, `da_ddt`) | 0.9456 |

No se han publicado en la información disponible resultados de benchmarks comparativos frente a otros pipelines daneses.

## Requisitos de hardware

- Inferencia en CPU: el modelo está diseñado para ello, según declara la propia model card ("efficient CPU inference").
- VRAM estimada para GPU: no aplica; no se documenta uso de GPU ni requisitos de VRAM. No disponible una cifra de consumo de memoria RAM.
- GPU recomendadas: no disponible; no se requieren.
- Cabe en GPU de consumo: no procede, ya que no necesita GPU. El tamaño del repositorio es de 0.0 GB.
- Opciones de despliegue: spaCy (instalación estándar del paquete y carga del pipeline) y el framework DaCy. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no son aplicables a este tipo de modelo. Tampoco se documenta exportación a ONNX.
- Latencia y throughput estimados: no disponibles.
- Requisito de versión: spaCy >=3.8.14 y <3.9.0, lo que puede obligar a fijar la versión en el entorno de producción.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `chcaa/da_dacy_edge` | Pipeline spaCy (tok2vec) para danes | no disponible | no aplica | Apache-2.0 | HuggingFace, 0 descargas |
| DaCy medium / large / trf | Pipelines spaCy y transformer para danes | no disponible en la informacion proporcionada | no aplica | Apache-2.0 (segun el framework DaCy) | Repositorio DaCy; metricas no disponibles aqui |
| `da_core_news_*` (spaCy) | Pipeline spaCy para danes | no disponible en la informacion proporcionada | no aplica | MIT (segun spaCy) | Distribucion oficial de spaCy; comparacion numerica no disponible |
| Modelos DanLP basados en BERT | Modelos transformer para tareas danesas | no disponible en la informacion proporcionada | no disponible | Segun modelo concreto | DanLP; comparacion numerica no disponible |

La model card solo identifica la variante "edge" dentro de la familia DaCy; no incluye una comparativa con las variantes medium, large o trf, ni cifras de estos modelos alternativos.

## Limitaciones y advertencias

- Cobertura monolingüe: solo danés. No se debe esperar un comportamiento correcto en otras lenguas, incluido el castellano.
- NER con margen de mejora: la F1 declarada de 0.7256 sobre DaNE implica aproximadamente un 27 % de errores combinados, por lo que en producción conviene planificar revisión humana o umbrales de confianza.
- Riesgo de propagación de errores: un fallo en la tokenización o en el POS afecta en cascada al `parser`, al lematizador y al `ner`; no hay mecanismos de autocorrección.
- Alucinación: no aplica en el sentido generativo, ya que el modelo no produce texto libre, pero sí puede asignar etiquetas incorrectas con alta confianza.
- Sesgos: la model card menciona que el repositorio DaCy incluye pruebas de comportamiento sobre sesgos y robustez, pero no se publican resultados concretos para esta variante. No disponible.
- Métricas no verificadas: todas las cifras del `model-index` figuran con `verified: false`; no se aporta ningún informe de evaluación independiente.
- Adopción nula: 0 descargas y 0 "likes" en el momento de la consulta, lo que reduce la probabilidad de encontrar soporte de la comunidad o incidencias resueltas.
- Restricción de versión: requiere spaCy >=3.8.14,<3.9.0; actualizar spaCy puede romper la compatibilidad del pipeline.
- Licencia: Apache-2.0 permite uso comercial, modificación y redistribución, siempre que se conserve el aviso de licencia y se indiquen los cambios. No incluye garantías.
- Fecha de creación anómala: el repositorio figura como creado el 2026-09-16, lo que puede indicar un error de metadatos o una publicación programada; conviene confirmarlo antes de citarlo.
- Sin vectores estáticos: no hay representación de palabras fuera del encoder contextual, por lo que no se pueden usar similitudes léxicas basadas en vectores preentrenados con este paquete.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/chcaa/da_dacy_edge
- Repositorio DaCy (Centre for Humanities Computing, Universidad de Aarhus): https://github.com/centre-for-humanities-computing/DaCy
- Documentación de DaCy: https://centre-for-humanities-computing.github.io/DaCy/
- Dataset UD Danish DDT: https://github.com/UniversalDependencies/UD_Danish-DDT
- Dataset DaNE: https://huggingface.co/datasets/alexandrainst/dane
- Dataset DaCoref: https://huggingface.co/datasets/alexandrainst/dacoref
- Resultados de la búsqueda web: los enlaces devueltos corresponden a foros de soporte de Microsoft (Windows, Skype, Outlook, Microsoft Community) en turco, chino, francés e inglés, sin relación con el modelo. No se han encontrado enlaces relevantes adicionales en la búsqueda web proporcionada.
