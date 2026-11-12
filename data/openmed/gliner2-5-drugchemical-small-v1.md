# OpenMed/GLiNER2.5-DrugChemical-Small-v1

## Resumen

GLiNER2.5-DrugChemical-Small-v1 es un modelo extractor de entidades nombradas (NER) especializado en la identificacion de farmacos y compuestos quimicos en texto biomedico en ingles. Lo desarrolla OpenMed, un proyecto que publica modelos abiertos para procesamiento de lenguaje clinico y biomedico ejecutables en hardware propio. El modelo parte de `fastino/gliner2.5-small-v1` y ha sido afinado sobre el corpus MedMentions para una unica etiqueta: `chemical or drug`.

La relevancia practica del modelo reside en su tamano reducido (73,9 millones de parametros, repositorio de 0,3 GB) y en que puede ejecutarse en CPU, lo que lo hace adecuado para pipelines de extraccion de informacion en entornos con recursos limitados o con requisitos de privacidad que impiden enviar texto clinico a servicios externos. Devuelve cada mencion con offsets de caracteres exactos y una puntuacion de confianza, lo que facilita la trazabilidad y la integracion en sistemas de anotacion.

Arquitectura GLiNER2 (modelo de extraccion de spans guiado por prompt, no un transformer generativo), contexto de entrenamiento y evaluacion de 600 caracteres por fragmento, licencia Apache-2.0 y soporte exclusivo de ingles. Su F1 declarado en 200 abstracts reservados de MedMentions es de 67,43 con umbral 0,4.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GLiNER2 (extractor de spans zero-shot guiado por prompt), base `fastino/gliner2.5-small-v1` |
| Parametros totales | 73.881.879 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible como contexto de transformer; ventana de entrenamiento y evaluacion de 600 caracteres por fragmento (`max_length=150`) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Tarea | token-classification (extraccion de menciones con offsets) |
| Etiqueta entrenada | `chemical or drug` |
| Umbral por defecto | 0,4 (`confidence_threshold`) |
| Salida | `text`, `start`, `end`, `score` |
| Libreria | openmed (extra `openmed[gliner2]`, OpenMed 3.2 o superior) |
| Tamano del repositorio | 0,3 GB |

## Arquitectura y entrenamiento

El modelo se basa en GLiNER2, una familia de extractores de entidades que formulan la tarea como busqueda de spans condicionada por una etiqueta textual (en este caso, el prompt literal `chemical or drug`). A diferencia de los transformers generativos, el modelo no produce texto libre: localiza subcadenas en el documento de entrada y asigna a cada una una puntuacion de confianza. El checkpoint de partida es `fastino/gliner2.5-small-v1`, con 73,9 millones de parametros.

El afinamiento se realizo sobre 800 abstracts de MedMentions, con las 20 categorias semanticas del grupo Chemicals & Drugs de UMLS mapeadas a una unica etiqueta. Los umbrales se calibraron sobre otros 200 abstracts y la evaluacion final se hizo sobre 200 abstracts adicionales, con modelo, umbrales y codigo de scoring congelados antes de medir. La decodificacion empleada en la evaluacion propone spans desde 0,05 y conserva los que superan 0,4. No se documentan en la informacion disponible detalles sobre RLHF, DPO ni composicion completa del dataset de preentrenamiento del modelo base.

## Capacidades

- Extraccion de menciones de farmacos y compuestos quimicos en texto biomedico en ingles, con offsets de caracteres exactos y puntuacion de confianza por mencion.
- Extraccion guiada por etiqueta: la etiqueta `chemical or drug` es el prompt de entrenamiento y debe mantenerse tal cual.
- Procesamiento de abstracts completos: la funcion `analyze_text` divide el texto en frases y devuelve offsets sobre el texto original.
- Procesamiento por lotes: el modelo se carga una vez y permanece en cache, permitiendo invocaciones en bucle sobre muchos textos.
- Ejecucion en CPU y en GPU (mediante `OpenMedConfig(device="cuda")`).
- Control de granularidad de spans: la opcion `use_medical_tokenizer=False` conserva los limites de span del modelo en lugar de fusionar spans contiguos de la misma etiqueta.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision, tool calling ni capacidades de agente; es exclusivamente un extractor de entidades.

## Casos de uso

- Anonimizacion y enmascarado de farmacos en textos clinicos: el modelo devuelve offsets exactos que permiten sustituir cada mencion por un token generico antes de compartir notas o abstracts, sin enviar datos a servicios externos.
- Construccion de bases de datos farmacologicas a partir de literatura: procesar lotes de abstracts de PubMed y agregar las menciones extraidas con sus confianzas para alimentar un indice de compuestos y farmacos por articulo.
- Enriquecimiento de historiales de farmacovigilancia: detectar farmacos citados en informes de reacciones adversas para vincularlos a codigos de ontologias como UMLS o RxNorm en una etapa posterior.
- Preanotacion para revisores humanos: generar candidatos con offsets y scores para que anotadores clinicos validen o corrijan, reduciendo el coste de crear corpus etiquetados.
- Filtrado y triaje documental: marcar articulos que mencionan compuestos quimicos concretos antes de un analisis mas costoso, aprovechando que el modelo corre en CPU y puede desplegarse a gran escala.
- Integracion en pipelines de la OpenMed SDK: usar el modelo junto con otros extractores de la misma familia (misma base, misma fuente MedMentions, una etiqueta cada uno) para construir un pipeline NER multimodal sobre texto biomedico.
- Extraccion en entornos con restricciones de privacidad: al ejecutarse localmente y con licencia Apache-2.0, puede desplegarse dentro de infraestructura hospitalaria sin salida de datos.

## Benchmarks y rendimiento

Evaluacion declarada por el autor sobre 200 abstracts reservados de MedMentions (1.858 menciones anotadas manualmente; coincidencia de span exacto):

| Modelo | Umbral | Precision | Recall | F1 |
|---|---:|---:|---:|---:|
| **GLiNER2.5-DrugChemical-Small-v1** (este modelo) | 0,4 | 65,55 | 69,43 | **67,43** |
| `fastino/gliner2.5-small-v1` (antes del afinamiento) | 0,5 | 40,39 | 51,02 | 45,09 |
| Este modelo, al mismo umbral que el base | 0,5 | no disponible | no disponible | 66,81 |

El autor declara una mejora de +22,34 puntos de F1 atribuida al afinamiento (IC 95%: +19,27 a +25,93, bootstrap pareado sobre los 200 abstracts con 2.000 remuestreos). Advertencia del propio autor: todos los abstracts provienen de la particion oficial de entrenamiento de MedMentions y no se uso el conjunto de test oficial, por lo que estas cifras no son comparables con resultados publicados de MedMentions.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precision completa (73,9 millones de parametros); el modelo esta disenado para ejecutarse en CPU.
- GPU recomendadas: no se especifican; cualquier GPU con al menos 1 GB de memoria es suficiente, y el modelo funciona sin GPU.
- Cabe en cualquier GPU de consumo e incluso en entornos sin GPU dedicada.
- Opciones de despliegue: SDK `openmed` (`pip install -U "openmed[gliner2]"`, version 3.2 o superior). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | F1 (MedMentions, 200 abstracts) | Licencia | Notas |
|---|---|---:|---:|---|---|
| GLiNER2.5-DrugChemical-Small-v1 | 73,9 M | 600 caracteres por fragmento | 67,43 (umbral 0,4) | Apache-2.0 | Afinado por OpenMed, una etiqueta |
| `fastino/gliner2.5-small-v1` | no disponible | no disponible | 45,09 (umbral 0,5) | no disponible | Modelo base sin afinamiento |
| Otros modelos de la familia OpenMed GLiNER2.5 Small | no disponible | no disponible | no disponible | Apache-2.0 (segun la model card) | Misma base y fuente, una etiqueta distinta cada uno |

No se dispone de datos para comparar con alternativas de otras familias (por ejemplo, modelos BERT para NER biomedico) en la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta ingles; no hay evidencia de rendimiento en castellano ni en otros idiomas.
- Especifico de una unica etiqueta (`chemical or drug`); no extrae enfermedades, genes, proteinas ni otras entidades sin un afinamiento adicional.
- El F1 de 67,43 implica una tasa de error sustancial: aproximadamente uno de cada tres spans anotados no se recupera o se recupera con limites incorrectos, ya que la evaluacion exige coincidencia exacta de span.
- Las cifras de benchmark no son comparables con resultados publicados de MedMentions: se evaluo sobre abstracts de la particion de entrenamiento oficial, no sobre el test oficial.
- Riesgo de falsos positivos en terminos quimicos generales o nombres de sustancias que aparecen en contextos no farmacologicos; el ejemplo de la model card incluye `glucose` e `insulin` como menciones validas, lo que indica una nocion amplia de "chemical or drug".
- La ventana de entrenamiento y evaluacion es de 600 caracteres por fragmento; textos mas largos dependen del troceado por frases de `analyze_text`, que puede partir menciones en los limites.
- Los umbrales (0,05 de propuesta y 0,4 de confianza) estan calibrados para el benchmark declarado; en produccion conviene ajustarlos segun la tolerancia a falsos positivos.
- Licencia Apache-2.0: permite uso comercial, pero el autor no ofrece garantias sobre el modelo; para uso clinico real es necesaria validacion externa.
- El modelo no genera texto ni razona: no debe emplearse como asistente conversacional ni para responder preguntas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OpenMed/GLiNER2.5-DrugChemical-Small-v1
- Modelo base: https://huggingface.co/fastino/gliner2.5-small-v1
- Organizacion OpenMed en Hugging Face: https://huggingface.co/OpenMed
- SDK OpenMed en GitHub: https://github.com/maziyarpanahi/openmed
- Paquete OpenMed en PyPI: https://pypi.org/project/openmed/
- Perfil de OpenMed en X: https://x.com/OpenMed_AI
- Dataset MedMentions: https://huggingface.co/datasets/bigbio/medmentions
- Paper GLiNER2 (arxiv:2508.01630): https://arxiv.org/abs/2508.01630
- Paper adicional citado (arxiv:2507.18546): https://arxiv.org/abs/2507.18546
