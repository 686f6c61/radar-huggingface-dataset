# Loria-MosAIk/regen-webnlg-t2g-ce

## Resumen

ReGen T2G.CE for WebNLG es un modelo de generación de texto a grafo (text-to-graph) obtenido por ajuste fino supervisado del modelo base google-t5/t5-large. Convierte texto en inglés en tripletas sujeto-relación-objeto siguiendo la configuración T2G.CE descrita por Dognin et al. (2021) en el artículo original de ReGen, utilizando entrenamiento con entropía cruzada en lugar de aprendizaje por refuerzo. Lo publica la organización Loria-MosAIk como reproducción del modelo base de texto a datos empleado en el artículo XQDT (Efimov-Zhang et al., 2026).

El modelo resuelve una tarea estructurada y acotada: la extracción de grafos de conocimiento a partir de descripciones textuales, evaluada sobre el corpus WebNLG 2020 en inglés. Con 737.642.496 parámetros y arquitectura transformer encoder-decoder T5, no está pensado como modelo de propósito general sino como componente especializado dentro de pipelines de generación aumentada por grafo, validación de datos o evaluación de métricas de alineación texto-datos.

Su relevancia actual radica en que sirve como referencia reproducible y con predicciones guardadas para investigaciones sobre métricas de alineación semántica, y porque el checkpoint alcanza un F1 Exact de 71,07 sobre las 2.155 instancias de test en inglés de WebNLG 2020, un valor cercano al 72,3 reportado en el artículo original de ReGen. La licencia del modelo no está declarada de forma explícita y los datos de ajuste fino se distribuyen bajo CC BY-NC-SA 4.0.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (T5) |
| Parametros totales | 737.642.496 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; admite cuantizacion estándar de transformers, no documentada por el autor) |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible (el modelo base T5-large es Apache-2.0; los datos WebNLG de ajuste fino son CC BY-NC-SA 4.0) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino completo de google-t5/t5-large, un transformer encoder-decoder denso de 737 millones de parámetros con mecanismo de atención estándar. La tarea se formula como generación texto-a-texto con el prefijo "Text to Graph:" y la salida se serializa con marcadores explícitos `__subject__`, `__predicate__` y `__object__` para delimitar cada tripleta. El autor indica que el ejemplo de uso antepone un token de padding para replicar el data loader de ReGen.

El entrenamiento sigue la configuración T2G.CE de Dognin et al. (2021), es decir, ajuste fino supervisado con pérdida de entropía cruzada sobre el corpus WebNLG 2020 en inglés, sin etapa de aprendizaje por refuerzo. No se documentan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni detalles sobre decodificación especulativa u otras optimizaciones. La decodificación recomendada es beam search con cinco haces y longitud máxima de 256 tokens.

## Capacidades

- Generación de grafos de conocimiento: transforma texto en inglés en tripletas sujeto-relación-objeto serializadas con marcadores `__subject__`, `__predicate__` y `__object__`.
- Extracción de múltiples tripletas por pasada: una sola frase puede producir varias relaciones, como se observa en el ejemplo de la model card con `birthPlace` y `birthYear`.
- Generación texto-a-texto condicionada por prefijo: requiere el prefijo "Text to Graph:" para activar la tarea.
- Decodificación por beam search: el autor valida el checkpoint con cinco haces.
- Integración con el ecosistema transformers: compatible con `T5ForConditionalGeneration` y `T5Tokenizer` (con `legacy=True`).
- Compatibilidad declarada con text-generation-inference y endpoints compatibles, según las etiquetas del repositorio.
- No se documentan capacidades de tool calling, razonamiento multi-paso, agentes, visión, audio ni modo de pensamiento.

## Casos de uso

- Construcción de grafos de conocimiento a partir de corpus textuales: el modelo extrae tripletas de descripciones en inglés que después pueden cargarse en una base de datos RDF o en un grafo de propiedades, aprovechando su especialización en el esquema de WebNLG.
- Validación de pipelines de generación de datos: al ser una reproducción con predicciones guardadas sobre 2.155 ejemplos de test, sirve como línea base reproducible para comparar métricas de alineación texto-grafo en investigación.
- Evaluación de métricas de similitud semántica: el artículo XQDT lo emplea como modelo base de texto a datos, por lo que encaja en flujos que necesitan pares texto-grafo de referencia para medir alineación.
- Enriquecimiento de entidades en bases de datos editoriales: dado un párrafo biográfico, el modelo devuelve relaciones como lugar y año de nacimiento, útiles para completar fichas estructuradas.
- Preprocesamiento para sistemas de pregunta-respuesta sobre grafos: las tripletas generadas pueden alimentar un motor de consultas SPARQL o un índice de entidades sin necesidad de anotación manual.
- Prototipado de extracción de relaciones en dominios acotados: con 737 millones de parámetros y pesos safetensors, puede desplegarse en una GPU de gama alta para experimentos de investigación sin infraestructura de gran escala.
- Generación de datos sintéticos para ajuste de modelos más pequeños: las tripletas producidas pueden usarse como etiquetas débiles en corpus no anotados en inglés.

## Benchmarks y rendimiento

| Benchmark | Metrica | Resultado |
|---|---|---|
| WebNLG 2020 test en inglés (2.155 ejemplos) | Exact precision | 70,35 |
| WebNLG 2020 test en inglés (2.155 ejemplos) | Exact recall | 72,18 |
| WebNLG 2020 test en inglés (2.155 ejemplos) | Exact F1 | 71,07 |
| ReGen original, configuración CE (Dognin et al., 2021, tabla 2) | Exact F1 | 72,3 |
| Guía de entrenamiento de IBM (ejecución de ejemplo) | Exact F1 | 70,11 |

Los resultados del checkpoint se obtuvieron con decodificación de cinco haces. No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de otras tareas generales.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 3 GB solo para pesos (737 millones de parámetros), más memoria para activaciones y beam search; en la práctica se recomienda al menos 6-8 GB.
- VRAM estimada en fp16/bf16: alrededor de 1,5 GB para pesos, con margen adicional para el decoder y los cinco haces.
- GPU recomendadas: A100, H100 o L40S para despliegue con concurrencia; RTX 4090, RTX 3090 o RTX A6000 para inferencia individual.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más de VRAM en fp16, incluidas RTX 3060 Ti, RTX 4060 Ti y superiores.
- Opciones de despliegue: transformers con `T5ForConditionalGeneration`, text-generation-inference (según etiquetas del repositorio), endpoints compatibles de Hugging Face y servidores propios basados en PyTorch.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Exact F1 (WebNLG) | Licencia |
|---|---|---|---|---|---|
| Loria-MosAIk/regen-webnlg-t2g-ce | 737.642.496 | no disponible | Text-to-graph WebNLG | 71,07 | no disponible |
| ReGen T2G.CE original (Dognin et al., 2021) | ~737 M (T5-large) | no disponible | Text-to-graph WebNLG | 72,3 | no disponible |
| google-t5/t5-large | 737.642.496 | no disponible | Texto a texto general | no aplica (no ajustado a la tarea) | Apache-2.0 |

La comparación se limita a estas referencias porque la información disponible no incluye otros modelos text-to-graph comparables con resultados publicados en el mismo protocolo de evaluación.

## Limitaciones y advertencias

- Solo soporta inglés: el corpus y el tokenizador están orientados a WebNLG en inglés, por lo que el rendimiento en otros idiomas no está validado.
- Especialización estrecha: está ajustado exclusivamente a la tarea text-to-graph con el esquema de marcadores de ReGen; fuera de ese formato o de dominios alejados de WebNLG el rendimiento puede degradarse.
- Riesgo de alucinación de relaciones: como modelo generativo, puede producir tripletas con predicados o entidades no presentes en el texto de entrada; no se documentan mecanismos de verificación internos.
- Licencia del modelo no declarada: aunque el modelo base T5-large es Apache-2.0, el autor no especifica la licencia del checkpoint, y los datos WebNLG de ajuste fino son CC BY-NC-SA 4.0, lo que puede restringir el uso comercial.
- Dependencia de un prefijo y de un token de padding inicial: el uso incorrecto del prefijo "Text to Graph:" o la omisión del padding puede alterar las salidas.
- Longitud de contexto no documentada: no se especifica el máximo de tokens de entrada, lo que obliga a validar empíricamente textos largos.
- Sin datos de sesgo: no se han publicado análisis de sesgos demográficos o geográficos del checkpoint.
- Madurez limitada: 61 descargas y ninguna marca de "like" en el momento de la consulta, sin señales de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Loria-MosAIk/regen-webnlg-t2g-ce
- Archivos del repositorio: https://huggingface.co/Loria-MosAIk/regen-webnlg-t2g-ce/tree/main
- Modelo base T5-large: https://huggingface.co/google-t5/t5-large
- Artículo original de ReGen (Dognin et al., 2021): https://aclanthology.org/2021.emnlp-main.83/
- PDF de ReGen: https://aclanthology.org/2021.emnlp-main.83.pdf
- Preprint de ReGen en arXiv: https://arxiv.org/abs/2108.12472
- Repositorio de reproducción (bt5-regen-text-to-graph): https://github.com/guihuzhang/bt5-regen-text-to-graph
- Guía de entrenamiento de IBM ReGen: https://github.com/IBM/regen/blob/main/docs/train_t2g_webnlg.md
- Artículo XQDT (Efimov-Zhang et al., 2026): https://aclanthology.org/2026.emnlp-main.397/
- Página del paper XQDT en Hugging Face: https://huggingface.co/papers/2608.29948
- Licencia CC BY-NC-SA 4.0 de los datos WebNLG: https://creativecommons.org/licenses/by-nc-sa/4.0/
