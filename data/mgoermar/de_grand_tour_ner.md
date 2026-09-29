# mgoermar/de_grand_tour_ner

## Resumen

de_grand_tour_ner es un modelo de reconocimiento de entidades nombradas (NER) para aleman, publicado en HuggingFace por Maximilian Görmar (usuario mgoermar), vinculado a la Herzog August Bibliothek (HAB). Se distribuye como pipeline de spaCy (libreria `spacy`, versiones >=3.7.5,<3.8.0) y resuelve la tarea de token-classification, etiquetando entidades de tipo LOC (localizacion), MISC (miscelanea), ORG (organizacion) y PER (persona).

El modelo sigue la arquitectura estandar de spaCy basada en `tok2vec` (embeddings y red convolucional sobre tokens) seguida del componente `ner`, sin transformer subyacente declarado. Incorpora vectores estaticos de 300 dimensiones con 500.000 claves (500.000 vectores unicos). El repositorio ocupa 1,2 GB, tamano coherente con el almacenamiento de dichos vectores.

Es relevante para flujos de procesamiento de lenguaje natural en aleman que necesiten extraccion de entidades sobre texto, con un equilibrio orientado al recall (recall 83,54 frente a precision 67,79, F1 74,84). El modelo es de version 0.0.1, con licencia MIT y, en el momento de la consulta, sin descargas ni likes registrados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | pipeline spaCy: `tok2vec` + `ner` |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa documentos completos; spaCy limita por longitud de texto, no por ventana fija de tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | aleman (de) |
| Licencia | MIT |
| Formato de pesos | modelo spaCy (directorio de modelo con configuracion y binarios propios de spaCy; no safetensors ni GGUF) |
| Version del modelo | 0.0.1 |
| Etiquetas NER | LOC, MISC, ORG, PER |
| Vectores | 500.000 claves, 500.000 vectores unicos, 300 dimensiones |
| Componentes del pipeline | tok2vec, ner |
| Compatibilidad spaCy | >=3.7.5,<3.8.0 |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura por defecto de spaCy para NER: un componente `tok2vec` que produce representaciones contextuales a nivel de token (mediante embeddings y capas convolucionales) y un componente `ner` que clasifica cada token en una de las cuatro etiquetas definidas (LOC, MISC, ORG, PER). No se declara el uso de un transformer preentrenado como backbone; el pipeline listado se limita a `tok2vec` y `ner`, lo que situa al modelo en la familia de modelos estadisticos clasicos de spaCy. Los vectores estaticos asociados son de 300 dimensiones con 500.000 entradas.

No se especifican en la informacion disponible los datos de entrenamiento: la model card indica `Sources: n/a`, por lo que se desconoce el corpus utilizado, el numero de tokens de entrenamiento, su composicion o si se aplicaron tecnicas de ajuste como RLHF o DPO (no aplicables habitualmente a este tipo de modelos). Las unicas cifras de entrenamiento declaradas son las perdidas finales: `TOK2VEC_LOSS` de 10177,99 y `NER_LOSS` de 642590,05, que reflejan el estado del ajuste pero no permiten reconstruir el proceso. El nombre "de_grand_tour_ner" sugiere un dominio o corpus concreto ("Grand Tour"), pero dicho extremo no se confirma en la informacion proporcionada.

## Capacidades

- Reconocimiento de entidades nombradas en aleman sobre cuatro categorias: LOC (localizacion), MISC (miscelanea), ORG (organizacion) y PER (persona).
- Etiquetado a nivel de token (token-classification) sobre texto en aleman.
- Procesamiento de documentos completos dentro del pipeline de spaCy, sin una ventana de contexto fija declarada.
- Uso de vectores estaticos de 300 dimensiones, lo que aporta informacion lexica adicional a las representaciones de token.
- Integracion directa en el ecosistema spaCy (carga como pipeline `ner` y acceso a `doc.ents`).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (modelo especializado en NER, no generativo).
- Capacidades multilingues: no (solo aleman).
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

- Extraccion de entidades en corpus alemanes de investigacion: el modelo permite obtener personas, organizaciones y lugares de forma automatica sobre grandes volumenes de texto aleman, integrándose en pipelines de spaCy para su posterior analisis.
- Enriquecimiento de metadatos en bibliotecas y archivos: dado el contexto del autor (HAB), puede emplearse para detectar nombres de personas y lugares en registros bibliograficos o descripciones documentales en aleman.
- Analisis de noticias y prensa en aleman: extraccion de ORG y PER para construir grafos de menciones, seguimiento de entidades y analisis de cobertura mediatica.
- Preprocesamiento para sistemas de informacion: identificacion de entidades como paso previo a indexacion, busqueda semantica o desambiguacion en aleman.
- Anonimizacion o seudonimizacion asistida: deteccion de PER y ORG para localizar datos potencialmente sensibles en textos alemanes antes de su tratamiento.
- Monitorizacion de menciones de marca: extraccion de ORG y LOC para seguimiento de apariciones de empresas o lugares en fuentes textuales en aleman.
- Construccion de bases de conocimiento: alimentar una KB con relaciones inferidas a partir de entidades detectadas en documentos alemanes.
- Anotacion asistida (preanotacion): generar etiquetas preliminares que revisores humanos corrigen, reduciendo el esfuerzo de anotacion manual en proyectos de corpus alemanes.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados):

| Metrica | Valor |
|---|---|
| NER Precision | 67,79 |
| NER Recall | 83,54 |
| NER F Score | 74,84 |
| TOK2VEC_LOSS | 10177,99 |
| NER_LOSS | 642590,05 |

No se han publicado en la informacion disponible resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, GermEval, etc.) ni comparaciones con otros modelos.

## Requisitos de hardware

- Inferencia en CPU: la arquitectura basada en `tok2vec` + `ner` de spaCy esta disenada para ejecutarse en CPU, sin necesidad de GPU.
- VRAM estimada: no disponible; al no emplear transformer ni GPU, la carga relevante es de memoria RAM, no de VRAM. El repositorio de 1,2 GB (principalmente vectores) condiciona el consumo de memoria al cargar el modelo.
- GPU recomendadas: no aplica; no se declara soporte ni necesidad de GPU (A100, H100, RTX 4090 no requeridas).
- Compatibilidad con GPU de consumo: no aplica / no disponible.
- Opciones de despliegue: carga directa mediante spaCy (`spacy.load`) en Python; uso dentro del ecosistema spaCy. No se declara soporte especifico para vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de resultados de benchmarks comparables en la informacion proporcionada. A continuacion se indican alternativas de la misma categoria (NER en aleman) y los campos conocidos; los datos de rendimiento de los modelos alternativos no se incluyen por no estar disponibles en la informacion facilitada.

| Modelo | Tarea | Idioma | Licencia | Formato / libreria | Parametros | Contexto | Rendimiento |
|---|---|---|---|---|---|---|---|
| de_grand_tour_ner (este modelo) | NER (token-classification) | aleman | MIT | modelo spaCy | no disponible | no disponible | F1 74,84 (declarado) |
| Alternativas NER en aleman de spaCy | NER | aleman | no disponible | modelo spaCy | no disponible | no disponible | no disponible |
| Alternativas NER basadas en transformer (multilingues o alemanas) | NER | varios / aleman | no disponible | safetensors | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Precision relativamente baja (67,79) en comparacion con el recall (83,54): el modelo tiende a generar falsos positivos, lo que puede requerir postprocesado o umbrales de confianza.
- Sesgos conocidos: no disponible; no se documenta analisis de sesgos en la informacion proporcionada.
- Riesgo de alucinacion: no aplica en el sentido generativo (no produce texto libre); el riesgo se limita a errores de clasificacion (entidades mal etiquetadas o inventadas por confusion del modelo).
- Limitacion de idioma: el modelo solo soporta aleman; su uso sobre otros idiomas no esta garantizado.
- Limitacion de contexto: no se declara una ventana de contexto; el comportamiento sobre documentos muy largos depende de los limites de spaCy y no esta documentado.
- Dominio: el corpus de entrenamiento no se especifica (`Sources: n/a`), por lo que se desconoce su rendimiento fuera del dominio para el que fue entrenado (posiblemente asociado a "Grand Tour").
- Licencia MIT: permite uso comercial y modificacion, sujeto a la conservacion del aviso de copyright y licencia; no se declaran restricciones adicionales.
- Estado del modelo: version 0.0.1, sin descargas ni likes, y con resultados no verificados (`verified: false`); debe validarse en el dominio objetivo antes de usarlo en produccion.
- Compatibilidad restringida a spaCy >=3.7.5,<3.8.0; versiones fuera de ese rango pueden no cargar el modelo correctamente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mgoermar/de_grand_tour_ner
- Pagina del autor (Maximilian Görmar, Herzog August Bibliothek): https://www.hab.de/author/maximilian-goermar/
- Documentacion de spaCy: https://spacy.io/
