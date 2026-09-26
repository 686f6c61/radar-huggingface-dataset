# Elpapudex/Ner-full

## Resumen

Ner-full es un modelo de reconocimiento de entidades nombradas (NER) publicado en HuggingFace por el usuario Elpapudex. Se trata de un ajuste fino completo de `bert-base-uncased` sobre el corpus `lhoestq/conll2003`, con 108.898.569 parámetros (unos 109 millones) y pesos en formato safetensors dentro de un repositorio de 0,4 GB. El modelo pertenece a la familia de transformers encoder-only de tipo BERT, por lo que su tarea es la clasificación de tokens con esquema BIO, no la generación de texto.

El problema que resuelve es la extracción de entidades nombradas en texto periodístico en inglés, con una métrica principal declarada de F1 a nivel de entidad de 0,9315 sobre el conjunto de evaluación. Por su tamaño, es un candidato claro para despliegues de bajo coste: cabe en CPU, en cualquier GPU de consumo e incluso en entornos con menos de 1 GB de VRAM en cuantización de 8 bits.

Su relevancia es limitada pero concreta: sirve como base de referencia reproducible (semilla 42, hiperparámetros documentados) para experimentos de NER, y como componente de preprocesado en pipelines de indexación, búsqueda o anonimización. Conviene señalar que el repositorio acumula 0 descargas y 0 likes, no declara licencia ni pipeline, y no cuenta con validación independiente por parte de la comunidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder bidireccional (BERT) con cabeza de clasificación de tokens |
| Parámetros totales | 108.898.569 |
| Parámetros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible (no especificada en la model card) |
| Tipos de cuantización | No disponible en el repositorio; los pesos se distribuyen en safetensors (0,4 GB) y admiten cuantización externa a int8/int4 |
| Idiomas soportados | Inglés (`en`) |
| Licencia | No disponible |
| Formato de pesos | safetensors |
| Tarea declarada | No disponible en el campo `pipeline`; por la model card, etiquetado de tokens (NER) |
| Modelo base | `bert-base-uncased` |
| Dataset de entrenamiento | `lhoestq/conll2003` |
| Esquema de etiquetado | BIO, con etiquetado del primer subtoken y máscara `-100` para subtokens de continuación y tokens especiales |

## Arquitectura y entrenamiento

La arquitectura es la de `bert-base-uncased`: un encoder transformer bidireccional con atención completa. Sobre él se añade una cabeza de clasificación de tokens para la tarea de NER. El entrenamiento fue un ajuste fino completo (`"method": "full"`), con los 108.898.569 parámetros entrenables, es decir, sin congelar el cuerpo del modelo ni aplicar adaptadores de bajo rango.

Los hiperparámetros documentados son tasas de aprendizaje discriminativas (`head_lr` = 1e-3 para la cabeza, `body_lr` = 2e-5 para el cuerpo), semilla 42 y 3 épocas, con un tiempo total de entrenamiento de 309,33 segundos. La estrategia de tokenización y etiquetado sigue el esquema BIO con etiquetado del primer subtoken de cada palabra y máscara de pérdida `-100` en los subtokens de continuación y tokens especiales, lo que evita penalizar predicciones redundantes. No se menciona en la información disponible ningún uso de RLHF, DPO ni técnicas de decodificación especulativa, algo por otra parte esperable en un modelo discriminativo de clasificación.

## Capacidades

- Reconocimiento y clasificación de entidades nombradas a nivel de token en texto en inglés, siguiendo el esquema BIO.
- Extracción de entidades en textos del dominio periodístico (`newswire`), que es el dominio del corpus de entrenamiento.
- Inferencia rápida y económica: la model card reporta 401,199 muestras por segundo y 3,21 pasos por segundo en la fase de evaluación, con un tiempo de ejecución de 8,1007 segundos y un hardware no especificado.
- No soporta generación de texto: es un modelo encoder-only orientado a etiquetado, no un modelo de lenguaje causal.
- No soporta `tool calling` ni `function calling`.
- No soporta flujos de agentes ni razonamiento multi-paso; su salida es una secuencia de etiquetas por token.
- Capacidades multilingües: no. El modelo está declarado únicamente para inglés.
- Capacidades de visión, audio o modo de razonamiento (`thinking`): no disponibles.

## Casos de uso

- Extracción de entidades en prensa y agencias de noticias: el modelo está entrenado sobre CoNLL-2003, un corpus de `newswire`, por lo que es directamente aplicable a la detección de personas, organizaciones, localizaciones y miscelánea en teletipos y artículos periodísticos en inglés, con un F1 a nivel de entidad de 0,9315 como referencia.
- Preprocesado para pipelines RAG: las entidades detectadas pueden usarse como metadatos para filtrar, agrupar o enlazar documentos antes de indexarlos en un motor vectorial, mejorando la precisión de la recuperación en dominios con muchas menciones a organizaciones o lugares.
- Anonimización y seudonimización de textos en inglés: al etiquetar nombres de persona, el modelo permite enmascararlos o sustituirlos antes de almacenar o compartir el texto. Debe tratarse como una ayuda al cumplimiento normativo, no como un sistema certificado de detección de datos personales, dado su recall de 0,9379 (aproximadamente un 6 % de entidades no detectadas).
- Preanotación en proyectos de etiquetado (human-in-the-loop): el modelo genera una primera pasada de etiquetas BIO que los anotadores humanos corrigen, reduciendo el coste por documento. Su throughput de 401 muestras por segundo permite procesar corpus grandes rápidamente.
- Enriquecimiento de buscadores internos: indexar las entidades extraídas como campos facetados (por ejemplo, filtrar artículos por organización mencionada) sin necesidad de un modelo generativo ni de infraestructura GPU.
- Análisis de menciones de marcas y competidores: la detección sistemática de entidades de tipo organización en prensa y boletines permite construir series temporales de menciones y estudios de reputación con coste computacional mínimo.
- Referencia académica y línea base en investigación: al ser un ajuste reproducible de `bert-base-uncased` con semilla e hiperparámetros documentados, resulta útil como punto de comparación de bajo coste frente a arquitecturas más grandes o enfoques de ajuste eficiente de parámetros.
- Procesamiento en el borde o en CPU: con aproximadamente 0,44 GB de pesos en fp32, puede ejecutarse en un servidor sin GPU o en un portátil, lo que facilita prototipos y despliegues en entornos con recursos limitados.

## Benchmarks y rendimiento

Resultados declarados en la model card (métricas de evaluación; el conjunto y el hardware no se detallan más allá del nombre del dataset):

| Métrica | Valor |
|---|---|
| F1 a nivel de entidad (métrica principal) | 0,9315 |
| Precisión | 0,9252 |
| Recall | 0,9379 |
| Precisión a nivel de token | 0,9869 |
| Pérdida | 0,0940 |
| Época | 3,0 |
| Método de ajuste | `full` (todos los parámetros entrenables) |
| Parámetros entrenables | 108.898.569 |
| Tiempo total de entrenamiento | 309,33 s |
| Tiempo de ejecución (evaluación) | 8,1007 s |
| Muestras por segundo | 401,199 |
| Pasos por segundo | 3,21 |

No se han publicado en la información disponible resultados comparativos frente a otros modelos (MMLU, HumanEval, GSM8K u otros) ni cifras desglosadas por tipo de entidad. Tampoco se especifica el hardware empleado ni el `split` exacto sobre el que se calcularon las métricas.

## Requisitos de hardware

- Tamaño de pesos: aproximadamente 0,44 GB en fp32 (el repositorio ocupa 0,4 GB), unos 0,22 GB en fp16, unos 0,11 GB en int8 y unos 0,06 GB en int4.
- VRAM estimada para inferencia: entre 1 y 2 GB en fp32 contando activaciones y el runtime de PyTorch para lotes moderados; menos de 1 GB en int8.
- Cabe en cualquier GPU de consumo: GTX 1050/1650, RTX 2060, RTX 3060, RTX 4090, y también en iGPU o CPU. No requiere GPU dedicada.
- GPU recomendadas si se busca máximo throughput con lotes grandes: T4, A10, L4 o RTX 4090; el modelo es demasiado pequeño para aprovechar A100/H100 con lotes pequeños, donde el cuello de botella será el `host`.
- Opciones de despliegue: `transformers` mediante `pipeline("token-classification")`, exportación a ONNX Runtime o TorchScript para inferencia en CPU, y servidores de inferencia genéricos compatibles con modelos de clasificación. Herramientas orientadas a modelos generativos (llama.cpp, Ollama) no aplican, ya que no existen pesos GGUF y el modelo no es causal. El soporte en vLLM o TGI no está confirmado en la información disponible.
- Latencia y throughput: la model card reporta 401,199 muestras por segundo y 3,21 pasos por segundo durante la evaluación (8,1007 s de ejecución total), pero sin especificar el hardware, por lo que estas cifras no son extrapolables directamente a producción.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | F1 en CoNLL-2003 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Elpapudex/Ner-full | 108.898.569 | No disponible | 0,9315 (nivel de entidad, declarado por el autor) | No disponible | HuggingFace, 0 descargas |
| `bert-base-uncased` (base sin ajustar) | No disponible en la información proporcionada | No disponible | No disponible | No disponible | HuggingFace |
| Alternativas de la misma categoría (RoBERTa-base, DeBERTa-v3-base, DistilBERT) | No disponible en la información proporcionada | No disponible | No disponible | No disponible | HuggingFace |

No se ha proporcionado información comparativa con otros modelos de NER. La única referencia incluida en la model card es la sección 5.3 de Devlin et al. (`arXiv:1810.04805`), que describe el ajuste de BERT para NER, pero no se reproducen en la ficha los valores concretos de esa comparación.

## Limitaciones y advertencias

- Idioma: el modelo es exclusivamente para inglés; no hay evidencia de funcionamiento en castellano ni en otros idiomas.
- Dominio: entrenado sobre CoNLL-2003, un corpus de `newswire`. La propia model card advierte de que puede no generalizar bien a dominios especializados como el legal, el científico, el conversacional o el histórico.
- Formato de salida rígido: depende del esquema BIO y del etiquetado del primer subtoken, de modo que cualquier cambio en la tokenización o en el mapeo de etiquetas puede degradar los resultados.
- Licencia no especificada: no se declara licencia en el repositorio, lo que impide determinar con seguridad si el uso comercial está permitido. El modelo base `bert-base-uncased` se distribuye habitualmente bajo Apache 2.0, pero la información disponible no confirma la licencia del ajuste.
- Validación comunitaria nula: 0 descargas y 0 likes, sin revisiones independientes ni resultados replicados por terceros. El campo `pipeline` no está declarado, lo que puede provocar que la carga automática en HuggingFace no funcione como se espera.
- Tasa de error medible: con precisión 0,9252 y recall 0,9379, se puede esperar aproximadamente un 7 % de error a nivel de entidad. En tareas sensibles (anonimización, cumplimiento normativo) esto implica falsos negativos que dejan entidades sin detectar.
- Riesgo de alucinación: al ser un modelo extractivo no inventa texto, pero sí puede asignar etiquetas incorrectas a tokens ambiguos (por ejemplo, topónimos usados como nombres de organización) sin ninguna señal de confianza calibrada.
- Longitud de contexto no documentada: no se especifica en la model card, por lo que textos largos requerirán truncamiento o segmentación en ventanas, con el riesgo de partir entidades en los límites.
- Sesgos: no se han publicado análisis de sesgo demográfico, geográfico o de género. Dado que CoNLL-2003 procede de prensa en inglés de finales de los noventa, es probable que refleje los sesgos de cobertura de esa fuente, pero no hay datos que lo cuantifiquen.
- No apto para decisiones automatizadas de alto riesgo sin supervisión humana, ni como base de un sistema de generación de texto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Elpapudex/Ner-full
- Referencia de BERT (Devlin et al., sección 5.3): https://arxiv.org/abs/1810.04805
- Dataset de entrenamiento citado en la model card: `lhoestq/conll2003` (https://huggingface.co/datasets/lhoestq/conll2003)
- Modelo base citado en la model card: `bert-base-uncased` (https://huggingface.co/google-bert/bert-base-uncased)
