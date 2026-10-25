# phungthanhtu/snli-UnitedSynT5-gtr-base-efl-synth

## Resumen

`snli-UnitedSynT5-gtr-base-efl-synth` es un clasificador de inferencia de lenguaje natural (NLI) publicado por el usuario `phungthanhtu` en HuggingFace. No es un modelo generativo, sino un cabezal de clasificación construido sobre el encoder `sentence-transformers/gtr-t5-base` (aproximadamente 110,5 millones de parámetros totales): se aplica mean-pooling sobre las representaciones del encoder y se pasa el vector resultante por tres capas fully-connected con activación GeLU y dropout 0,1.

El modelo reproduce el pipeline *UnitedSynT5* descrito en el paper arXiv:2412.09263 y está entrenado para la tarea EFL (entailment como clasificador binario), con un conjunto de datos compuesto por SNLI más aproximadamente 113.000 ejemplos sintéticos generados con FLAN-T5 y posteriormente limpiados. El autor reporta un macro-F1 de 0,8599 sobre el test de SNLI.

Su relevancia es acotada pero concreta: sirve como referencia reproducible para investigar el uso de datos sintéticos en tareas de NLI y como componente ligero de verificación de pares premisa-hipótesis. Es un artefacto de investigación con 0 descargas y 0 likes en el momento de la consulta, con arquitectura personalizada (`t5_nli.py`) y sin licencia declarada, lo que condiciona seriamente su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder T5 (`gtr-t5-base`) + mean-pooling + 3 capas FC (GeLU, dropout 0,1); clase `T5NLI` definida en `t5_nli.py` |
| Parametros totales | 110.515.202 (dato real de safetensors) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | No se distribuyen versiones cuantizadas; los pesos se publican en safetensors y habria que convertirlos con herramientas de transformers (no verificado) |
| Idiomas soportados | No declarados en la model card; el entrenamiento usa SNLI, corpus en ingles, por lo que el uso esperado es en ingles |
| Licencia | No disponible |
| Formato de pesos | safetensors (tamano del repo: 0,4 GB) |

## Arquitectura y entrenamiento

La arquitectura no es un transformer generativo completo: se toma el encoder de `gtr-t5-base` (variante de T5-base orientada a embeddings de frases), se agregan las representaciones de token mediante mean-pooling y se alimenta un cabezal de tres capas fully-connected con GeLU y dropout 0,1. La salida se interpreta como logits de clasificacion para la tarea EFL. Al tratarse de una arquitectura personalizada incluida en el propio repositorio (`t5_nli.py`), no se carga con `AutoModelForSequenceClassification` estandar, sino importando la clase `T5NLI`.

El entrenamiento combina SNLI con aproximadamente 113.000 ejemplos sinteticos generados por FLAN-T5 y filtrados/limpiados antes de su uso. La model card no detalla el numero total de tokens vistos, la composicion exacta del dataset, la mezcla entre datos reales y sinteticos ni si hubo etapas de RLHF o DPO; para un clasificador supervisado de este tipo lo esperable es entrenamiento supervisado con entropia cruzada, pero ese extremo no se explicita. La innovacion tecnica declarada es precisamente la receta de aumento de datos sinteticos del pipeline UnitedSynT5, no cambios en el mecanismo de atencion.

## Capacidades

- Clasificacion de pares premisa-hipotesis (NLI) en modalidad binaria EFL.
- Deteccion de implicacion y contradiccion mediante la construccion de tres hipotesis con la plantilla `"... This is <label>."` y seleccion de la etiqueta con mayor `P(true)`.
- Uso como clasificador zero-shot / few-shot por via de entailment (formulacion EFL), sin reentrenamiento.
- Extraccion de embeddings de frase a traves del encoder subyacente `gtr-t5-base` (capacidad heredada del backbone, no evaluada en esta ficha).
- No soporta generacion de texto, tool calling, function calling, agentes, vision, audio ni modos de razonamiento explicito.
- Capacidades multilingues: no declaradas.

## Casos de uso

- **Verificacion de fidelidad en resumenes automaticos**: dado un documento y una frase del resumen, comprobar si la frase queda implicada por el texto fuente; el modelo actua como detector de afirmaciones no respaldadas en pipelines de evaluacion.
- **Deteccion de contradicciones en bases de conocimiento**: comparar pares de afirmaciones extraidas de articulos o fichas de producto para marcar inconsistencias antes de publicar.
- **Filtrado de alucinaciones en sistemas RAG**: pasar cada frase de la respuesta generada junto con el pasaje recuperado y descartar o marcar las que el clasificador no considere implicadas.
- **Etiquetado asistido de datasets NLI**: pre-anotar pares con el modelo y reservar la revision humana para los casos de baja confianza; util por su tamano reducido (0,4 GB) y su coste de inferencia bajo.
- **Clasificacion zero-shot por entailment (EFL)**: definir las categorias de un problema como hipotesis y usar el modelo para enrutar tickets o textos cortos sin entrenamiento adicional, aceptando el coste de tres pasadas por ejemplo.
- **Reranking de pasajes en recuperacion de informacion**: reordenar los candidatos de un retriever evaluando la implicacion entre la consulta reformulada como premisa y cada pasaje como hipotesis.
- **Investigacion sobre datos sinteticos**: servir de punto de partida reproducible para estudiar el impacto de 113.000 ejemplos sinteticos de FLAN-T5 en el rendimiento de NLI frente a un modelo entrenado solo con SNLI.

## Benchmarks y rendimiento

| Benchmark | Metrica | Resultado |
|---|---|---|
| SNLI (test) | macro-F1 | 0,8599 |

No se han publicado resultados de benchmarks adicionales (MNLI, HANS, adversarial NLI, etc.) en la informacion disponible. Tampoco se proporcionan comparaciones directas con otros modelos del paper UnitedSynT5, por lo que no es posible contextualizar el 0,8599 frente a alternativas sin recurrir a datos externos no verificados aqui.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, los 110,5 M de parametros ocupan aproximadamente 0,44 GB, por lo que con activaciones y tokenizador el consumo se situa en torno a 1 GB; en fp16/bf16 baja a unos 0,22 GB de pesos y en int8 a unos 0,11 GB (estimaciones calculadas a partir del numero de parametros, no medidas publicadas).
- GPU recomendadas: cualquier GPU consumer moderna es suficiente (RTX 3060, RTX 4060, RTX 4090); tambien funciona en CPU para lotes pequenos y, por su tamano, en GPUs de portatil con 4-6 GB de VRAM.
- Cabe holgadamente en GPU consumer e incluso en entornos sin GPU; no requiere A100 ni H100.
- Opciones de despliegue: `transformers` con la clase `T5NLI` del repositorio (unica via documentada). Al usar una arquitectura personalizada, no hay soporte confirmado en vLLM, TGI, llama.cpp u Ollama, y no se publican pesos GGUF.
- Latencia y throughput estimados: no disponibles. Notese que la formulacion EFL requiere tres pasadas por ejemplo (una por etiqueta candidata), lo que triplica el coste respecto a un clasificador binario convencional.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `phungthanhtu/snli-UnitedSynT5-gtr-base-efl-synth` | 110,5 M | no disponible | SNLI test macro-F1 0,8599 | no disponible | HuggingFace, arquitectura custom |
| `facebook/bart-large-mnli` | no disponible en la informacion consultada | no disponible | no disponible | no disponible | HuggingFace, transformers estandar |
| `MoritzLaurer/DeBERTa-v3-base-mnli-fever-anli` | no disponible en la informacion consultada | no disponible | no disponible | no disponible | HuggingFace, transformers estandar |
| `roberta-large-mnli` | no disponible en la informacion consultada | no disponible | no disponible | no disponible | HuggingFace, transformers estandar |

La busqueda web realizada no ha devuelto informacion tecnica relevante sobre estos modelos (los resultados obtenidos no guardan relacion con la consulta), por lo que no se dispone de cifras verificables para una comparacion cuantitativa. A nivel cualitativo, la diferencia principal es operativa: los alternativos citados son clases estandar de `transformers` con soporte directo en pipelines y servidores de inferencia, mientras que este modelo exige cargar codigo del repositorio y aplicar la logica EFL de tres hipotesis en el codigo de aplicacion.

## Limitaciones y advertencias

- **Licencia no declarada**: sin licencia explicita no se puede asumir permiso de uso comercial; hay que contactar con el autor antes de cualquier despliegue productivo.
- **Arquitectura personalizada**: requiere `t5_nli.py` y `sys.path.append(".")`; no funciona con `AutoModel` estandar y no esta soportada por servidores de inferencia habituales.
- **Sesgos de SNLI**: SNLI es un corpus de descripciones de imagenes con sesgos de solapamiento lexico documentados; un macro-F1 de 0,8599 en el test del mismo corpus sobrestima el rendimiento en dominios reales.
- **Solo ingles y solo dominio de descripciones**: no se declaran idiomas ni se ha evaluado en otros dominios (legal, medico, tecnico).
- **Tarea binaria**: la formulacion EFL maneja dos etiquetas; para clasificacion multiclase hay que construir una hipotesis por clase y asumir un coste lineal en el numero de categorias.
- **Riesgo de alucinacion**: aunque es un clasificador y no genera texto, puede producir falsos positivos de implicacion, especialmente con premisas cortas o con alta superposicion lexica.
- **Datos sinteticos**: el 100 % de los ejemplos adicionales procede de FLAN-T5; los sesgos y errores del generador pueden haberse transferido al clasificador pese al proceso de limpieza declarado.
- **Sin validacion externa**: 0 descargas y 0 likes en el momento de la consulta, sin model card extendida sobre sesgos, limitaciones o evaluacion fuera de SNLI.
- **Sin cuantizaciones publicadas**: cualquier despliegue en formatos GGUF/ONNX requeriria conversion y validacion propias.

## Enlaces

- HuggingFace: https://huggingface.co/phungthanhtu/snli-UnitedSynT5-gtr-base-efl-synth
- Paper de referencia (UnitedSynT5): https://arxiv.org/abs/2412.09263
- Encoder base: https://huggingface.co/sentence-transformers/gtr-t5-base
- Resultados de busqueda web: no se han encontrado enlaces tecnicos relevantes; las consultas devolvieron unicamente resultados sin relacion con el modelo.
