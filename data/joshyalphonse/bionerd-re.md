# joshyalphonse/bionerd-re

## Resumen

bionerd-re es un modelo de clasificacion de secuencias (text-classification) especializado en extraccion de relaciones biomedicas con tipado, desarrollado por el usuario joshyalphonse como parte del proyecto BioNERD. Se construye mediante fine-tuning de microsoft/BiomedNLP-BiomedBERT-base-uncased-abstract-fulltext sobre el split de entrenamiento del corpus BioRED, empleando la formulacion de marcadores de entidad (entity markers). El resultado es un clasificador que, dadas dos entidades anotadas en el texto, predice el tipo de relacion que las une entre ocho categorias mas la clase "None".

El modelo resuelve un problema concreto de la mineria de literatura cientifica: transformar pares de entidades reconocidas (farmacos, genes, enfermedades, variantes) en relaciones semanticamente tipadas, un paso imprescindible en pipelines de construccion de grafos de conocimiento biomedicos, curacion de bases de datos y respuesta a preguntas sobre literatura. La arquitectura es un transformer encoder tipo BERT con 109.492.233 parametros, tamano coherente con la familia BERT-base de la que hereda, y una ventana de 512 tokens.

Su relevancia radica en que reutiliza un modelo base ya adaptado al dominio (BiomedBERT, entrenado sobre resumenes completos de PubMed) y lo especializa en una tarea downstream concreta, con licencia MIT tanto en el modelo base como en el derivado, lo que facilita su integracion en aplicaciones comerciales. El repositorio incluye pesos en safetensors y la etiqueta gguf, ademas de hashes sha256 publicados para verificacion de integridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (base BiomedBERT) |
| Parametros totales | 109.492.233 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens (maximo usado durante el entrenamiento) |
| Tipos de cuantizacion | safetensors en precision completa; repositorio etiquetado con gguf |
| Idiomas soportados | no disponible (el modelo base y el corpus BioRED son en ingles biomedico) |
| Licencia | MIT |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

Se trata de un transformer encoder bidireccional de la familia BERT, inicializado desde microsoft/BiomedNLP-BiomedBERT-base-uncased-abstract-fulltext, un modelo base entrenado sobre texto biomedico en ingles (resumenes de PubMed y texto completo de PMC). Sobre esa base se anade una cabeza de clasificacion de secuencias que opera sobre la representacion de los marcadores de entidad. La entrada esperada es el texto con las dos entidades delimitadas por los tokens especiales `[E1] ... [/E1]` y `[E2] ... [/E2]`, que estan incorporados en el tokenizador. La clasificacion se realiza sobre el par de entidades marcado de este modo, una estrategia habitual en extraccion de relaciones.

El entrenamiento se realizo sobre el split Train del corpus BioRED, con semilla 13, learning rate 2e-5, tamano de batch 16, hasta 5 epocas y longitud maxima de 512 tokens, empleando una proporcion de 2 negativos por cada positivo. Se selecciono la mejor epoca segun la metrica typed F1 sobre el split de desarrollo de BioRED. El autor declara explicitamente que no reclama ninguna cifra de exactitud en la model card y remite a las etiquetas medidas mostradas en el catalogo de la aplicacion BioNERD. La tarea es de clasificacion multiclase con nueve etiquetas: `0 = None` seguida de los ocho tipos de BioRED (Association, Positive_Correlation, Negative_Correlation, Bind, Cotreatment, Comparison, Drug_Interaction, Conversion). No se documentan en la informacion disponible fases de RLHF, DPO ni otras tecnicas de alineacion, algo coherente con una tarea de clasificacion supervisada.

## Capacidades

- Extraccion de relaciones tipadas entre pares de entidades biomedicas, con nueve etiquetas de salida (ocho tipos de relacion mas la clase None).
- Manejo de las categorias especificas de BioRED: asociacion, correlacion positiva, correlacion negativa, union (bind), cotratamiento, comparacion, interaccion farmacologica y conversion.
- Procesamiento de texto con marcadores de entidad explicitos `[E1]`/`[/E1]` y `[E2]`/`[/E2]`, integrados en el tokenizador.
- Clasificacion de secuencias con ventana de hasta 512 tokens por ejemplo.
- Dominio especializado en literatura biomedica en ingles (farmacos, genes, enfermedades, variantes, entre otros).
- No se documenta soporte de tool calling, function calling, uso agentico, capacidades multimodales ni modo de razonamiento explicito en la informacion disponible.

## Casos de uso

- Construccion de grafos de conocimiento biomedicos: dado un corpus de articulos con entidades ya reconocidas por un NER, el modelo etiqueta cada par de entidades con su tipo de relacion y permite poblar un grafo con aristas semanticamente tipadas.
- Curacion de bases de datos de interacciones farmaco-farmaco: el modelo distingue Drug_Interaction frente a Cotreatment o Comparison, lo que ayuda a priorizar candidatos antes de la revision manual por expertos.
- Enriquecimiento de pipelines de extraccion de literatura en farmaceutica: integrado tras un reconocedor de entidades, aporta la capa de relaciones que convierte menciones sueltas en afirmaciones verificables.
- Analisis de asociaciones gen-enfermedad: la clase Association y las correlaciones positiva y negativa permiten clasificar si un gen se asocia, correlaciona positivamente o negativamente con un fenotipo descrito en el texto.
- Busqueda semantica sobre literatura cientifica: indexar relaciones tipadas permite responder consultas del tipo "que farmacos se han comparado con X" apoyandose en la etiqueta Comparison.
- Deteccion de relaciones de union (Bind) en biologia molecular: util para extraer interacciones de union entre proteinas u otras entidades a partir de resumenes.
- Preanotacion para anotadores humanos en proyectos de curacion: el modelo genera etiquetas candidatas que reducen el esfuerzo de anotacion manual, dado su bajo coste computacional (109 millones de parametros).
- Filtrado de negativos en corpus grandes: con la clase None y la estrategia de negativos del entrenamiento, sirve para descartar pares de entidades sin relacion antes de etapas mas caras.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se reclama ninguna cifra de exactitud y que las metricas medidas se muestran en el catalogo de la aplicacion BioNERD, sin incluirlas en el repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 109.492.233 parametros, aproximadamente 0,44 GB en fp32 y del orden de 0,22 GB en fp16 o bf16, sin contar activaciones ni el overhead del runtime.
- Cabe holgadamente en cualquier GPU de consumo: RTX 3060, RTX 4070, RTX 4090 y similares, e incluso en CPU para cargas por lotes moderadas.
- GPU de datacenter (A100, H100) solo necesarias si se busca throughput muy alto con batching grande; no son un requisito por tamano de modelo.
- Opciones de despliegue: transformers con PyTorch, text-embeddings-inference (etiqueta presente en el repositorio), vLLM y Text Generation Inference no son el encuadre habitual para un clasificador de secuencias, pero llama.cpp y Ollama pueden emplear la variante GGUF si se necesita ejecucion en CPU o entornos ligeros.
- Latencia y throughput estimados: no disponible en la informacion proporcionada; en la practica dependera del hardware, del batch y de la longitud de las secuencias procesadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| joshyalphonse/bionerd-re | 109.492.233 | 512 tokens | Clasificacion de relaciones tipadas BioRED | MIT | HuggingFace |
| microsoft/BiomedNLP-BiomedBERT-base-uncased-abstract-fulltext | ~110 M (no confirmado en la informacion) | no disponible | Modelo base de dominio biomedico (masked LM) | MIT | HuggingFace |
| Otros sistemas de extraccion de relaciones sobre BioRED | no disponible | no disponible | Extraccion de relaciones | no disponible | no disponible |

El unico comparable directo del que se dispone de informacion es el modelo base BiomedBERT, del que bionerd-re es un fine-tuning especializado. No se dispone de datos de rendimiento de alternativas comparables en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- El autor no publica cifras de exactitud ni de F1 en la model card; cualquier evaluacion de calidad debe realizarse sobre el propio artefacto antes de llevarlo a produccion.
- Sesgos conocidos: no disponibles en la informacion proporcionada; al entrenarse sobre el corpus BioRED, heredara los sesgos de cobertura y anotacion de dicho corpus.
- Riesgo de alucinacion: la tarea es de clasificacion, no generativa, por lo que no produce texto libre; el riesgo se traslada a falsos positivos de relacion o a la asignacion de un tipo incorrecto.
- Limitaciones de contexto: la ventana efectiva es de 512 tokens, por lo que relaciones cuyos argumentos aparezcan muy separados en documentos largos pueden quedar fuera de alcance.
- Limitaciones de idioma: el modelo base y el corpus de entrenamiento son en ingles biomedico; se desconoce su comportamiento en otros idiomas.
- La prediccion depende de que las entidades esten correctamente delimitadas con los marcadores `[E1]`/`[E2]`; un preprocesado incorrecto degradara las salidas.
- Restricciones de licencia: licencia MIT, permisiva para uso comercial, siempre que se conserve el aviso de copyright correspondiente.
- Estado de adopcion muy bajo (24 descargas y 0 likes en el momento de la consulta), lo que implica poca validacion externa y ausencia de una comunidad que reporte incidencias.
- El repositorio incluye hashes sha256 de config.json, model.safetensors, tokenizer_config.json y tokenizer.json, que conviene verificar para garantizar la integridad de los pesos descargados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/joshyalphonse/bionerd-re
- Modelo base: https://huggingface.co/microsoft/BiomedNLP-BiomedBERT-base-uncased-abstract-fulltext
