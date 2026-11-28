# johanamayer/dacy_small

## Resumen

DaCy small (`da_dacy_small_trf`) es un pipeline de procesamiento del lenguaje natural para danés construido sobre spaCy y publicado por el Centre for Humanities Computing de la Universidad de Aarhus (autores: Johana Mayerova, Mikkel Krøjer Svendsen y Kenneth Enevoldsen). No es un modelo generativo, sino un pipeline discriminativo de etiquetado a nivel de token que resuelve de forma conjunta la tokenización, el etiquetado gramatical (POS/XPOS), el análisis morfológico, la lematización, el análisis de dependencias y el reconocimiento de entidades nombradas (NER).

Técnicamente se apoya en un encoder transformer pequeño, `jonfd/electra-small-nordic`, afinado para tareas de anotación lingüística sobre el árbol de dependencias UD Danish DDT v2.18, el corpus de entidades DaNE y el corpus de correferencia DaCoref. El resultado es un modelo de aproximadamente 0,2 GB de repositorio, con licencia Apache-2.0 y una huella de cómputo muy reducida, lo que lo hace apto para procesar grandes volúmenes de texto danés en CPU o en GPU de gama baja.

Su relevancia actual radica en que cubre una carencia habitual en el ecosistema open source: pipelines lingüísticos completos y de calidad para idiomas distintos del inglés. Frente a soluciones multilingües genéricas, un modelo especializado en danés como este ofrece etiquetas específicas del idioma (218 etiquetas repartidas en cuatro componentes) y un rendimiento medido sobre los benchmarks estándar de la lingüística computacional danesa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ELECTRA small, `jonfd/electra-small-nordic`) integrado en pipeline spaCy |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (spaCy procesa por segmentos; límite práctico del encoder ELECTRA small, no declarado) |
| Tipos de cuantizacion | no disponible (pesos spaCy; no se declaran variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | danés (`da`) |
| Licencia | Apache-2.0 |
| Formato de pesos | pesos spaCy (paquete de pipeline, repo de 0,2 GB); no se distribuye en safetensors ni GGUF |
| Version del pipeline | `da_dacy_small_trf` 1.0.0 |
| Requisito de spaCy | `>=3.8.14,<3.9.0` |
| Componentes | `transformer`, `tagger`, `morphologizer`, `trainable_lemmatizer`, `parser`, `ner` |
| Etiquetas | 218 etiquetas en 4 componentes |
| Vectores estaticos | 0 claves, 0 vectores (0 dimensiones) |
| Modelo base | `jonfd/electra-small-nordic` |
| Descargas en Hugging Face | 241 |
| Fecha de creacion / actualizacion | 2026-09-08 / 2026-09-23 |

## Arquitectura y entrenamiento

El pipeline combina un encoder transformer ELECTRA small de ámbito nórdico con seis componentes de spaCy ejecutados en secuencia: el componente `transformer` genera representaciones contextuales y, sobre ellas, `tagger` asigna la etiqueta XPOS, `morphologizer` predice los rasgos morfológicos universales (UFeats), `trainable_lemmatizer` produce el lema, `parser` construye el árbol de dependencias y `ner` detecta entidades nombradas. No se trata de un modelo generativo ni de un modelo de mezcla de expertos; es un sistema supervisado de etiquetado a nivel de token con una cabeza independiente por tarea.

El entrenamiento se realizó sobre tres fuentes declaradas: UD Danish DDT v2.18 (Johannsen, Martínez Alonso y Plank) para POS, morfología, lemas y dependencias; DaNE (Hvingelby et al.) para entidades nombradas; y DaCoref (Buch-Kromann) como corpus adicional de correferencia. El número exacto de tokens de entrenamiento, la composición detallada del dataset y el uso de técnicas como RLHF o DPO no están disponibles en la información proporcionada, y en cualquier caso resultan ajenos a un pipeline discriminativo de este tipo. La innovación destacable es la integración de todas las capas de anotación lingüística danesa en un único objeto spaCy serializable y reproducible.

## Capacidades

- Etiquetado gramatical (POS y XPOS) con inventario específico del danés, incluyendo etiquetas como `Polarity=Neg`.
- Análisis morfológico fino (UFeats): género, número, definitud, caso, tiempo, modo, voz, grado, tipo de pronombre, entre otros.
- Lematización entrenable para reducir formas flexionadas a su lema.
- Análisis de dependencias sintácticas (árbol de dependencias con etiquetas).
- Reconocimiento de entidades nombradas (NER) sobre texto danés.
- Segmentación de oraciones (componente de fronteras de frase evaluado con F-score).
- Procesamiento por lotes de grandes volúmenes de texto mediante `nlp.pipe` de spaCy.
- Integración con el ecosistema DaCy, que incluye pruebas de sesgo y robustez para pipelines daneses.
- No soporta tool calling, function calling, razonamiento multi-paso ni generación de texto: es un pipeline de anotación, no un LLM.
- Capacidad multilingüe limitada al danés; el encoder base es nórdico, pero el modelo está entrenado y evaluado únicamente en `da`.

## Casos de uso

- Enriquecimiento lingüístico de corpus: procesar millones de documentos daneses (noticias, actas, literatura) para obtener POS, lemas y dependencias antes de indexarlos en un motor de búsqueda o en un pipeline de análisis cuantitativo.
- Extracción de entidades en dominios administrativos: detectar personas, organizaciones y lugares en textos oficiales daneses para poblar bases de datos estructuradas o grafos de conocimiento.
- Preprocesamiento para otros modelos: generar lemas y dependencias que alimenten clasificadores, sistemas de extracción de relaciones o modelos de resumen que trabajen sobre representaciones lingüísticas limpias.
- Anonimización y revisión de privacidad: el NER permite localizar nombres de personas y organizaciones en documentos antes de su publicación o compartición, complementado con el corpus DaCoref para la resolución de menciones.
- Investigación lingüística y humanidades digitales: análisis diacrónico o estilístico de sintaxis y morfología danesa con etiquetas estables y reproducibles, apoyándose en las guías y pruebas de sesgo del proyecto DaCy.
- Búsqueda y recuperación de información en danés: la lematización y el etiquetado permiten construir índices con normalización morfológica, mejorando la coincidencia entre consultas y documentos frente a una búsqueda por cadena exacta.
- Moderación y análisis de contenido a escala: al caber en CPU, puede procesar flujos continuos de texto danés con latencia baja para tareas de clasificación posterior basadas en las anotaciones.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Tarea | Metrica | Valor | Dataset |
|---|---|---|---|
| NER | Precision | 0,8202 | DaNE (test) |
| NER | Recall | 0,8452 | DaNE (test) |
| NER | F-score | 0,8325 | DaNE (test) |
| TAG | XPOS accuracy | 0,9814 | UD Danish DDT (test) |
| POS | UPOS accuracy | 0,9808 | UD Danish DDT (test) |
| MORPH | UFeats accuracy | 0,9768 | UD Danish DDT (test) |
| LEMMA | Lemma accuracy | 0,9467 | UD Danish DDT (test) |
| Dependencias | UAS | 0,8835 | UD Danish DDT (test) |
| Dependencias | LAS | 0,8498 | UD Danish DDT (test) |
| Frases | Sentences F-score | 0,9483 | UD Danish DDT (test) |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; el repositorio ocupa 0,2 GB, por lo que la huella en memoria es del orden de cientos de MB en FP32 y menor si se ejecuta en CPU con las optimizaciones de spaCy.
- GPU recomendadas: cualquier GPU con al menos unos pocos GB de VRAM es suficiente; una RTX 3060, RTX 4090, T4, A10 o A100 pueden ejecutar el pipeline sin problemas, aunque el modelo está dimensionado para no necesitarlas.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna e incluso en iGPU con suficiente memoria compartida.
- Despliegue: spaCy (`>=3.8.14,<3.9.0`) es la vía nativa; también puede servirse mediante el ecosistema DaCy. No se distribuyen pesos en GGUF, por lo que llama.cpp u Ollama no aplican directamente; vLLM y TGI no son compatibles con pipelines spaCy.
- Latencia y throughput: no disponibles en la información proporcionada. Por el tamaño del encoder (ELECTRA small) y la ausencia de decodificación autorregresiva, se espera un throughput alto en CPU, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|---|
| `da_dacy_small_trf` (este) | Pipeline spaCy + ELECTRA small | no disponible | no disponible | da | Apache-2.0 | Pipeline completo: POS, morph, lemma, parser, NER |
| `da_dacy_large_trf` (DaCy) | Pipeline spaCy + transformer mayor | no disponible | no disponible | da | Apache-2.0 | Variante de mayor tamaño del mismo framework; métricas no disponibles en esta ficha |
| spaCy `da_core_news_sm/md/lg` | Pipeline spaCy con vectores estáticos | no disponible | no disponible | da | MIT | Sin componente transformer; menor precisión esperada en tareas contextuales |
| Modelos NER multilingües (p. ej. XLM-R fine-tuned) | Transformer encoder | cientos de millones | 512 tokens típicos | multilingüe | variable | Cobertura multilingüe pero sin parser ni lematizador específicos del danés |

La comparación cuantitativa con las alternativas no está disponible en la información proporcionada; los valores de esta tabla reflejan características estructurales, no resultados medidos.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en danés: no debe aplicarse a otros idiomas, ni siquiera a variedades cercanas como el sueco o el noruego, sin reentrenamiento.
- Es un pipeline discriminativo: no genera texto, no razona y no admite tool calling; usarlo como sustituto de un LLM produciría resultados inválidos.
- Riesgo de error en NER: el F-score de 0,8325 implica que aproximadamente una de cada seis entidades se pierde o se etiqueta mal; en dominios con nombres propios atípicos (fármacos, identificadores, jerga) la precisión puede degradarse.
- Dependencia de la versión de spaCy: el rango `>=3.8.14,<3.9.0` es estricto; actualizar spaCy fuera de ese rango puede romper la carga del pipeline.
- Sesgos: el autor no documenta sesgos específicos en la información disponible; el proyecto DaCy incluye pruebas de sesgo y robustez, pero sus resultados no se recogen aquí.
- Resultados no verificados: todas las métricas del model-index están marcadas como `verified: false`, es decir, declaradas por el autor sin validación independiente.
- Sin vectores estáticos: el pipeline declara 0 vectores, por lo que no aporta similitud léxica preentrenada más allá de las representaciones del transformer.
- Licencia Apache-2.0: permite uso comercial y modificación con atribución; conviene conservar el aviso de licencia y citar a los autores del framework DaCy.
- Fecha de creación futura (2026) en los metadatos de Hugging Face: conviene verificar la vigencia y el mantenimiento del repositorio antes de adoptarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/johanamayer/dacy_small
- Repositorio DaCy: https://github.com/centre-for-humanities-computing/DaCy
- Documentación DaCy: https://centre-for-humanities-computing.github.io/DaCy/
- Modelo base: https://huggingface.co/jonfd/electra-small-nordic
- UD Danish DDT v2.18: https://github.com/UniversalDependencies/UD_Danish-DDT
- Dataset DaNE: https://huggingface.co/datasets/alexandrainst/dane
- Dataset DaCoref: https://huggingface.co/datasets/alexandrainst/dacoref
- Dataset Universal Dependencies: https://huggingface.co/datasets/universal-dependencies/universal_dependencies
- Centre for Humanities Computing, Universidad de Aarhus: https://chc.au.dk/
