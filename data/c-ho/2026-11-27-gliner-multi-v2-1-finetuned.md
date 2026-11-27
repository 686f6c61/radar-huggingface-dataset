# c-ho/2026-11-27-gliner-multi-v2.1-finetuned

## Resumen

El modelo `c-ho/2026-11-27-gliner-multi-v2.1-finetuned` es un ajuste fino del modelo de reconocimiento de entidades nombradas (NER) `urchade/gliner_multi-v2.1`, publicado por el usuario `c-ho` en Hugging Face. GLiNER es una familia de modelos de arquitectura transformer disenada para NER de tipo cero disparo (zero-shot) mediante la proyeccion conjunta de etiquetas de entidad y tokens de texto en un mismo espacio latente, lo que permite detectar categorias no vistas durante el entrenamiento. Este ajuste concreto especializa el modelo base sobre un corpus anotado de terminologia linguistica.

El ajuste se ha realizado sobre el dataset `c-ho/2026-10-13_ub_opus_bll_ner_annotation_2`, compuesto por 16 655 muestras de entrenamiento y 4 165 de test, con etiquetas propias del dominio linguistico (fenomenos morfosintacticos, fonologicos, lexicos, etc.). El resultado es un modelo de clasificacion de tokens orientado a la extraccion de terminos y fenomenos linguisticos en textos, presumiblemente de caracter academico o linguistico.

La relevancia de esta ficha es limitada: se trata de un ajuste fino de autor individual, sin licencia declarada, sin idiomas declarados y con un rendimiento modesto (F1 micro de 0,3979 sobre el conjunto de test). Es util como referencia para quienes trabajen con GLiNER en dominios linguisticos especializados, pero no debe considerarse un modelo de proposito general ni un sustituto del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo GLiNER (encoder de texto + proyeccion de etiquetas para NER zero-shot); detalles exactos del encoder no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el modelo base GLiNER multi-v2.1 trabaja por ventanas; el ajuste usa ventanas de texto, pero el tamano no se especifica) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles (el modelo base es multilingue, pero este ajuste no declara idiomas) |
| Licencia | no disponible |
| Formato de pesos | no disponible (libreria `gliner`, pesos PyTorch; tamano del repo 1,2 GB) |

## Arquitectura y entrenamiento

El modelo se basa en `urchade/gliner_multi-v2.1`, un modelo de NER zero-shot de la familia GLiNER. La innovacion principal de GLiNER es que, en lugar de clasificar tokens contra un conjunto fijo de etiquetas, proyecta tanto las etiquetas de entidad (en lenguaje natural) como los tokens del texto en un espacio comun, permitiendo detectar entidades de categorias arbitrarias definidas en tiempo de inferencia. El ajuste fino conserva esta arquitectura y adapta los pesos al dominio linguistico del dataset de anotacion.

El entrenamiento se realizo durante 15 epocas con un learning rate de 2e-05 (1e-05 para el resto de parametros), weight decay de 0,01, warmup ratio de 0,1, scheduler lineal, batch efectivo de 256 (batch de 8 por dispositivo con acumulacion de 16), precision bf16 y 2 GPUs. Se uso una funcion de perdida focal con alpha 0,5 y gamma 2. El mejor checkpoint fue el de la epoca 8 (checkpoint-528), con F1 de 0,3979; a partir de ahi el eval loss empezo a subir (de 1,4355 en la epoca 8 a 1,6478 en la 14), lo que indica sobreajuste. El dataset de entrenamiento contiene 16 655 muestras y el de test 4 165 ventanas; no se descartaron entidades en los limites de ventana ni entidades mas largas que el ancho maximo.

## Capacidades

- Reconocimiento de entidades nombradas (NER) zero-shot mediante etiquetas definidas en lenguaje natural.
- Extraccion de terminos y fenomenos linguisticos especializados: fenomenos morfosintacticos, fonologicos, lexicos, morfologicos, semanticos y sintacticos, entre otros.
- Clasificacion de tokens a nivel de entidad (span + etiqueta) con umbral de confianza configurable (por defecto 0,5 en la evaluacion).
- Capacidad multilingue heredada del modelo base `gliner_multi-v2.1` (no verificada ni declarada para este ajuste).
- No se declara soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision ni audio.
- No se declara modo de pensamiento (thinking mode) ni capacidades generativas: es un modelo discriminativo de etiquetado de tokens.

## Casos de uso

- Anotacion asistida de corpus linguisticos: el modelo puede pre-etiquetar textos academicos con categorias como "morphosyntactic phenomenon" o "phonological phenomenon", reduciendo el trabajo manual de anotadores; es adecuado por su especializacion en el dominio, aunque el F1 de 0,40 exige revision humana.
- Extraccion de terminologia en articulos de linguistica: permite localizar menciones a fenomenos del lenguaje (lexicos, semanticos, sintacticos) para construir indices tematicos o glosarios; util por la definicion de etiquetas en lenguaje natural.
- Construccion de bases de datos terminologicas: a partir de textos, el modelo extrae spans etiquetados que pueden normalizarse y volcarse a una base de conocimiento; la etiqueta configurable facilita adaptar el esquema.
- Preprocesamiento para pipelines de NLP: como paso previo a tareas de analisis de discurso o clasificacion, el modelo identifica menciones a fenomenos linguisticos que pueden alimentar caracteristicas adicionales.
- Investigacion en NER zero-shot: sirve como caso de estudio de ajuste fino de GLiNER sobre un dominio especializado, con metricas por etiqueta publicadas que permiten analizar que categorias funcionan mejor (p. ej., "syntactic phenomenon" con F1 0,6063 frente a "semantic phenomenon" con 0,0090).
- Filtrado y enriquecimiento de documentacion tecnica: en corpus de documentacion sobre lenguaje, el modelo puede marcar terminos relevantes para resaltado o navegacion; su naturaleza multilingue heredada (no verificada) permitiria aplicarlo a textos en varios idiomas.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados), sobre el split de test retenido (ultimo 20 % del train, 4 165 ventanas), con umbral 0,5 y coincidencia exacta de span y etiqueta:

| Metrica | Valor |
|---|---|
| Precision | 0,3663 |
| Recall | 0,4354 |
| F1 (micro) | 0,3979 |
| F1 (macro) | 0,2721 |

Rendimiento por etiqueta (seleccion de las mas relevantes por soporte):

| Etiqueta | Precision | Recall | F1 | Soporte |
|---|---|---|---|---|
| SyntacticPhenomenon | 0,6444 | 0,5725 | 0,6063 | 538 |
| MorphosyntacticPhenomenon | 0,4050 | 0,7825 | 0,5338 | 515 |
| PhonologicalPhenomenon | 0,4571 | 0,6188 | 0,5258 | 181 |
| LanguageResourceInformation | 0,3783 | 0,7441 | 0,5016 | 211 |
| LanguageRelatedTerm | 0,3708 | 0,7488 | 0,4960 | 410 |
| LexicalPhenomenon | 0,3092 | 0,5294 | 0,3904 | 153 |
| MorphologicalPhenomenon | 0,2680 | 0,6341 | 0,3768 | 41 |
| UnclassifiedLinguisticConcept | 1,0000 | 0,1667 | 0,2857 | 6 |
| AcademicDiscipline | 0,0909 | 0,6667 | 0,1600 | 6 |
| TOPNODE_DUMMY | 0,2159 | 0,1095 | 0,1453 | 694 |
| NEW_TAG | 0,1479 | 0,1197 | 0,1323 | 351 |
| GraphemicPhenomenon | 0,1111 | 0,1111 | 0,1111 | 9 |
| OtherLinguisticTerm | 0,2200 | 0,0482 | 0,0791 | 228 |
| SemanticPhenomenon | 0,0128 | 0,0069 | 0,0090 | 145 |
| AmbiguouslyDefinedConcept | 0,0000 | 0,0000 | 0,0000 | 15 |
| DiscoursePhenomenon | 0,0000 | 0,0000 | 0,0000 | 11 |

No se han publicado resultados de benchmarks en la informacion disponible mas alla de los anteriores.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el tamano del repositorio es de 1,2 GB, lo que sugiere que el modelo en precision completa (probablemente bf16/fp16) ocupa del orden de 1,2 GB en disco. En FP32 seria aproximadamente el doble.
- GPU recomendadas: no disponibles. Por el tamano del repositorio, cabe en GPUs de consumo como RTX 3060 (12 GB), RTX 4070, RTX 4090, asi como en A100/H100 para despliegues de mayor volumen.
- Cabe en GPU de consumo: si, previsiblemente en cualquier GPU con 4 GB o mas de VRAM, dado el tamano del modelo (estimacion basada en el tamano del repo, no confirmada por el autor).
- Opciones de despliegue: la libreria oficial es `gliner` (PyTorch). No se declara soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| c-ho/2026-11-27-gliner-multi-v2.1-finetuned | no disponible | no disponible | F1 micro 0,3979 (test propio) | no disponible | Hugging Face |
| urchade/gliner_multi-v2.1 (modelo base) | no disponible | no disponible | no disponible en esta ficha | no disponible | Hugging Face |
| Otros modelos NER zero-shot (p. ej., GLiNER large, UniversalNER) | no disponible | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos suficientes en la informacion proporcionada para establecer una comparativa cuantitativa con alternativas. El unico punto de referencia objetivo es el propio modelo base, del que no se han incluido metricas en esta ficha.

## Limitaciones y advertencias

- Rendimiento modesto: F1 micro de 0,3979 y F1 macro de 0,2721 sobre el test retenido; varias etiquetas tienen F1 cercano a cero (SemanticPhenomenon 0,0090, AmbiguouslyDefinedConcept 0,0000, DiscoursePhenomenon 0,0000).
- Sobreajuste: el eval loss aumenta a partir de la epoca 8 (1,4355) hasta la 14 (1,6478), mientras el train loss baja de 8,11 a 0,97; el checkpoint seleccionado es el mejor en F1, pero el modelo muestra signs de sobreajuste.
- Desequilibrio por etiqueta: el rendimiento varia enormemente segun la categoria; las etiquetas con mayor soporte (SyntacticPhenomenon, MorphosyntacticPhenomenon) funcionan mejor que las minoritarias.
- Sesgos conocidos: no se declaran sesgos especificos; al entrenarse sobre un unico dataset de anotacion linguistica, el modelo puede heredar los sesgos de anotacion de dicho corpus.
- Riesgo de alucinacion: como modelo discriminativo de etiquetado, no genera texto libre, pero puede producir falsos positivos (precision baja en varias etiquetas) y spans incorrectos.
- Limitaciones de contexto e idioma: no se declaran idiomas soportados ni longitud de contexto; el modelo base es multilingue, pero este ajuste no lo confirma.
- Restricciones de licencia: la licencia no esta disponible, lo que impide determinar si se permite uso comercial; se recomienda contactar con el autor antes de usarlo en produccion.
- Caveat para produccion: el modelo es un ajuste fino de autor individual con 0 descargas y 0 likes en el momento de la ficha; no hay evidencia de validacion externa ni de mantenimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/c-ho/2026-11-27-gliner-multi-v2.1-finetuned
- Modelo base: https://huggingface.co/urchade/gliner_multi-v2.1
- Dataset de ajuste: https://huggingface.co/datasets/c-ho/2026-10-13_ub_opus_bll_ner_annotation_2
- Repositorio de la libreria GLiNER: no disponible en la informacion proporcionada
- Paper de GLiNER: no disponible en la informacion proporcionada
- Demo: no disponible en la informacion proporcionada
