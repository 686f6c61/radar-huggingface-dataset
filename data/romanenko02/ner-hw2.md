# romanenko02/ner-hw2

## Resumen

`romanenko02/ner-hw2` es un modelo de clasificación de tokens (token classification) especializado en reconocimiento de entidades nombradas (NER), publicado por el usuario Nikita Romanenko en Hugging Face. Se trata de un ajuste fino (fine-tuning) del modelo de embeddings `BAAI/bge-small-en-v1.5`, un transformer tipo BERT de 33.215.625 parámetros, sobre un conjunto de datos que la propia model card no identifica ("unknown dataset").

El modelo resuelve la tarea clásica de etiquetado secuencial: asignar a cada token de entrada una categoría de entidad (persona, organización, localización u otras, según el esquema de etiquetas empleado, que no se documenta). Su relevancia práctica es limitada: se trata de un artefacto académico (el sufijo `hw2` sugiere una segunda práctica de asignatura), con cero descargas y cero valoraciones en el momento de redactar esta ficha, y sin documentación sobre datos de entrenamiento, esquema de etiquetas o idioma.

Técnicamente es un modelo compacto y ligero (33 M de parámetros, repositorio de 0,1 GB) que puede ejecutarse en CPU o en cualquier GPU consumer. Los resultados declarados por el autor en el conjunto de evaluación son razonables (F1 de 0,9268, precisión de 0,9188, recall de 0,9349 y accuracy de 0,9836), pero al desconocerse el corpus de evaluación no es posible contextualizarlos frente a referencias estándar como CoNLL-2003.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (familia BGE, derivada de Retromae/BERT; etiquetada como `bert` en el repositorio) |
| Parametros totales | 33.215.625 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens (configuración heredada de `BAAI/bge-small-en-v1.5`) |
| Tipos de cuantizacion | No disponible (solo se publican pesos en safetensors; no hay variantes GGUF, GPTQ ni AWQ) |
| Idiomas soportados | No disponible (la model card no especifica idiomas; el modelo base está entrenado predominantemente en inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Modelo base | BAAI/bge-small-en-v1.5 |
| Tarea (pipeline) | token-classification |
| Modelo de entrenamiento | `generated_from_trainer` (Trainer de Hugging Face) |
| Tamano del repositorio | 0,1 GB |
| Fecha de creacion | 2026-10-08 |
| Fecha de ultima actualizacion | 2026-10-08 |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base `BAAI/bge-small-en-v1.5`: un transformer encoder de tipo BERT con 12 capas, dimensión oculta de 384 y una cabeza de clasificación de tokens superpuesta (33,2 M de parámetros totales, coherentes con el tamaño del checkpoint publicado). No hay innovaciones arquitectónicas propias: no se emplean mecanismos de atención lineal, decodificación especulativa ni capas MoE, dado que el modelo no es generativo y produce una etiqueta por token de entrada.

Respecto al entrenamiento, la model card generada automáticamente indica que se usó el `Trainer` de Hugging Face con AdamW fused (betas 0,9/0,999, epsilon 1e-08), learning rate de 5e-05, scheduler lineal, tamaño de batch de 8 (tanto en entrenamiento como en evaluación), semilla 42 y 15 épocas, con un total de 18.780 pasos. No se especifica el número de tokens de entrenamiento, la composición del dataset, el esquema de etiquetas ni si se aplicaron técnicas de alineación como RLHF o DPO (no aplicables en un modelo discriminativo de este tipo). Las versiones de framework declaradas son Transformers 5.19.0, PyTorch 2.11.0+cu128, Datasets 5.1.0 y Tokenizers 0.23.2.

## Capacidades

- Etiquetado de tokens para reconocimiento de entidades nombradas (NER): clasifica cada token de una secuencia de entrada en una categoría de entidad definida por el esquema de entrenamiento.
- Inferencia discriminativa de secuencia completa: devuelve logits y etiquetas por token, aprovechando el encoder bidireccional del modelo base.
- Longitud de entrada de hasta 512 tokens, adecuada para párrafos, titulares, abstracts y documentos cortos.
- Ejecución sobre el pipeline `token-classification` de Transformers y compatible con la infraestructura de Inference Endpoints (`endpoints_compatible`).
- No dispone de generación de texto, razonamiento multi-paso, matemáticas, código ni capacidades multimodales.
- No soporta tool calling ni function calling: es un modelo de clasificación, no un LLM generativo.
- No se documenta soporte multilingüe explícito ni un conjunto de etiquetas concreto.
- No dispone de modo "thinking", visión, audio ni ninguna capacidad especial declarada.

## Casos de uso

- Extracción de entidades en texto corto: indexar nombres de personas, organizaciones y localizaciones en artículos, informes o correos para alimentar bases de datos estructuradas, siempre que el esquema de etiquetas del modelo coincida con el dominio objetivo.
- Preprocesado para pipelines RAG: extraer entidades de los fragmentos de documento antes de la indexación vectorial, de modo que las consultas puedan filtrarse por entidad además de por similitud semántica.
- Anonimización y detección de datos personales: localizar posibles identificadores directos (nombres, organizaciones) en textos antes de almacenarlos o compartirlos, con la advertencia de que no hay garantía de cobertura de todas las categorías de PII.
- Enriquecimiento de registros en CRM: etiquetar automáticamente menciones de empresas, productos o ubicaciones en notas de contacto y tickets, para poblar campos estructurados sin intervención manual.
- Enrutado de tickets de soporte: identificar la organización o el producto mencionado en la primera línea del ticket y dirigirlo al equipo correspondiente, con latencias de milisegundos por petición gracias al tamaño reducido del modelo.
- Análisis de noticias y monitorización de medios: extraer entidades de titulares y sumarios para construir grafos de coocurrencia o alertas temáticas sobre fuentes concretas.
- Etiquetado de corpus académicos: usar el modelo como anotador automático o asistente de preanotación en proyectos de investigación en PLN, revisando después las etiquetas de forma manual.

## Benchmarks y rendimiento

Resultados declarados por el autor en el conjunto de evaluación (no se especifica el corpus ni el esquema de etiquetas):

| Metrica | Valor |
|---|---|
| Loss | 0,1126 |
| Precision | 0,9188 |
| Recall | 0,9349 |
| F1 | 0,9268 |
| Accuracy | 0,9836 |

Evolución durante el entrenamiento (extracto completo de la model card):

| Epoca | Paso | Validation loss | Precision | Recall | F1 | Accuracy |
|---|---|---|---|---|---|---|
| 1,0 | 1252 | 0,0880 | 0,8771 | 0,9042 | 0,8905 | 0,9783 |
| 2,0 | 2504 | 0,0908 | 0,8907 | 0,9152 | 0,9028 | 0,9790 |
| 3,0 | 3756 | 0,0889 | 0,9048 | 0,9194 | 0,9120 | 0,9805 |
| 4,0 | 5008 | 0,0828 | 0,8966 | 0,9300 | 0,9130 | 0,9815 |
| 5,0 | 6260 | 0,0842 | 0,9059 | 0,9280 | 0,9168 | 0,9823 |
| 6,0 | 7512 | 0,0958 | 0,9084 | 0,9194 | 0,9139 | 0,9824 |
| 7,0 | 8764 | 0,0993 | 0,9119 | 0,9337 | 0,9227 | 0,9829 |
| 8,0 | 10016 | 0,1005 | 0,9137 | 0,9315 | 0,9225 | 0,9822 |
| 9,0 | 11268 | 0,1019 | 0,9073 | 0,9307 | 0,9188 | 0,9817 |
| 10,0 | 12520 | 0,1027 | 0,9184 | 0,9297 | 0,9240 | 0,9835 |
| 11,0 | 13772 | 0,1092 | 0,9134 | 0,9298 | 0,9215 | 0,9830 |
| 12,0 | 15024 | 0,1124 | 0,9139 | 0,9286 | 0,9212 | 0,9830 |
| 13,0 | 16276 | 0,1150 | 0,9199 | 0,9334 | 0,9266 | 0,9837 |
| 14,0 | 17528 | 0,1125 | 0,9207 | 0,9355 | 0,9280 | 0,9838 |
| 15,0 | 18780 | 0,1126 | 0,9188 | 0,9349 | 0,9268 | 0,9836 |

El bloque `model-index` de la model card está vacío (`results: []`), por lo que no hay benchmarks oficiales adicionales. No se han publicado comparaciones con CoNLL-2003, OntoNotes ni ningún otro corpus de referencia en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB. En float32 el checkpoint ocupa aproximadamente 133 MB; en float16, unos 66 MB.
- GPU recomendadas: cualquier GPU con más de 1 GB de VRAM es suficiente, incluidas GTX 1050 Ti, RTX 3060, RTX 4090, A100 o H100. No requiere aceleradores de gama alta.
- Cabe holgadamente en GPU consumer, e incluso en GPU integradas y en CPU. La inferencia en CPU es viable para cargas moderadas dada la ventana de 512 tokens y los 33 M de parámetros.
- Opciones de despliegue: pipeline `token-classification` de Transformers, Hugging Face Inference Endpoints (el repositorio está marcado como `endpoints_compatible`), exportación a ONNX Runtime o TorchScript para reducir latencia. vLLM no soporta de forma nativa token classification de encoders BERT; llama.cpp y Ollama no son aplicables porque no existen pesos GGUF ni el modelo es generativo.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones de latencia ni de tokens por segundo en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Rendimiento publicado |
|---|---|---|---|---|---|
| romanenko02/ner-hw2 | 33,2 M | 512 tokens | NER (token classification) | MIT | F1 0,9268, precision 0,9188, recall 0,9349 (evaluación propia, corpus no especificado) |
| BAAI/bge-small-en-v1.5 | 33,2 M | 512 tokens | Embeddings de texto (retrieval) | MIT | No aplicable a NER; benchmarks MTEB publicados por BAAI, no disponibles en esta búsqueda |
| DogeSavior/dl2_ner_hw2 | ~33 M (mismo modelo base) | 512 tokens | NER (token classification) | No disponible | No disponible |
| dslim/bert-base-NER | 110 M | 512 tokens | NER (CoNLL-2003) | MIT | F1 cercano a 0,925 en CoNLL-2003 según referencias públicas del repositorio |

La comparación directa con `dslim/bert-base-NER` no es concluyente, ya que este último reporta resultados sobre un corpus público estándar, mientras que `ner-hw2` evalúa sobre un conjunto no identificado. La única alternativa estrictamente comparable (mismo modelo base y mismo pipeline) es `DogeSavior/dl2_ner_hw2`, que tampoco documenta su dataset.

## Limitaciones y advertencias

- Dataset de entrenamiento desconocido: la model card indica explícitamente "unknown dataset". Se desconoce el dominio, el idioma y el esquema de etiquetas, por lo que no se puede garantizar qué entidades reconoce el modelo.
- Corpus de evaluación no identificado: las métricas de F1, precisión y recall no son comparables con las de modelos evaluados sobre CoNLL-2003, OntoNotes u otros benchmarks públicos.
- Riesgo de alucinación y de falsos positivos: al ser un clasificador, puede asignar etiquetas de entidad a tokens que no corresponden a ninguna entidad real, especialmente fuera del dominio de entrenamiento.
- Idiomas no declarados: no hay confirmación de soporte multilingüe ni de castellano. El modelo base está entrenado principalmente en inglés, por lo que el uso en otros idiomas es especulativo.
- Sesgos no evaluados: no se ha publicado ningún análisis de sesgo demográfico, geográfico o de género. Al derivarse de un corpus no documentado, los sesgos del dataset de ajuste son desconocidos.
- Sin límite práctico de contexto más allá de los 512 tokens: las entradas más largas deben truncarse o dividirse, con la consiguiente pérdida de entidades en los bordes de los fragmentos.
- Licencia MIT: permite uso comercial, modificación y redistribución manteniendo el aviso de copyright, sin restricciones específicas adicionales.
- Madurez del artefacto: cero descargas, cero valoraciones y repositorio creado y actualizado el mismo día, lo que apunta a un ejercicio académico sin mantenimiento posterior. No se recomienda su uso en producción sin una validación exhaustiva sobre datos propios.
- Ausencia total de documentación de uso previsto ("Intended uses & limitations: More information needed"), lo que impide verificar la idoneidad para casos concretos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/romanenko02/ner-hw2
- Modelo base: https://huggingface.co/BAAI/bge-small-en-v1.5
- Perfil del autor: https://huggingface.co/romanenko02/datasets
- Modelo similar con el mismo base: https://huggingface.co/DogeSavior/dl2_ner_hw2
- Los resultados de la búsqueda web no contienen material relacionado con este modelo: los enlaces encontrados (documentos de Scribd sobre UNet y SimCLR, y un modelo de clasificación de imágenes de Roboflow) corresponden a otros proyectos sin conexión con `ner-hw2`.
- No se han encontrado papers, blogs, repositorios de código ni demos asociados a este modelo en la información disponible.
