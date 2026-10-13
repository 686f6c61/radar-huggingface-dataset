# Koraniel/bge-small-conll2003-ner

## Resumen

`Koraniel/bge-small-conll2003-ner` es un modelo de reconocimiento de entidades nombradas (NER) obtenido por *fine-tuning* de `BAAI/bge-small-en-v1.5`, un encoder tipo BERT de 33.215.625 parámetros. El autor publica los pesos en HuggingFace bajo licencia MIT y tarea `token-classification`. El modelo resuelve la extracción de entidades en texto en inglés mediante etiquetado BIO a nivel de token, no generación de texto.

Se trata de un modelo muy pequeno (0,1 GB de repositorio) que hereda la arquitectura del modelo base: un transformer encoder con un limite posicional de 512 tokens. El entrenamiento se realizo durante 5 epocas con AdamW fused, learning rate 2e-5, batch de 16 y precision mixta nativa, alcanzando en el conjunto de evaluacion una F1 de 0,8922, precision de 0,8733, recall de 0,9120 y accuracy de 0,9795.

Su relevancia es practica mas que innovadora: ofrece una alternativa ligera y desplegable en CPU para tareas de extraccion de entidades, con metricas de evaluacion declaradas y una licencia permisiva. Conviene tener en cuenta que la model card esta autogenerada, no declara el dataset de entrenamiento (aunque el nombre del modelo apunta a CoNLL-2003) y el modelo acumula 0 descargas y 0 likes en el momento de redactar esta ficha, por lo que carece de validacion comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (heredada de `BAAI/bge-small-en-v1.5`) |
| Parametros totales | 33.215.625 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens (limite posicional del modelo base; no declarado de forma explicita en la model card) |
| Tipos de cuantizacion | no disponible en la model card; pesos publicados en FP32, cuantizables a FP16/INT8 mediante ONNX Runtime o herramientas de PyTorch |
| Idiomas soportados | no declarado; el identificador del modelo referencia el corpus CoNLL-2003, que es en ingles |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Tarea (pipeline) | token-classification |
| Modelo base | `BAAI/bge-small-en-v1.5` |
| Tamano del repositorio | 0,1 GB |
| Entidades cubiertas | no declarado en la model card; por el corpus de referencia (CoNLL-2003) se asume PER, ORG, LOC y MISC |
| Autor | Koraniel |
| Fecha de creacion | 2026-10-13 |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de tipo BERT con 12 capas y 384 dimensiones ocultas, resultado de adaptar `BAAI/bge-small-en-v1.5` (originalmente un modelo de embeddings orientado a recuperacion) a una cabeza de clasificacion de tokens. Se anade una capa de clasificacion sobre las representaciones contextuales del encoder y se entrena con etiquetado BIO para NER. No es un modelo generativo ni incorpora decodificacion especulativa, atencion lineal ni mecanismos MoE.

El procedimiento de entrenamiento declarado en la model card incluye: learning rate 2e-5, batch de entrenamiento 16, batch de evaluacion 32, semilla 42, optimizador ADAMW_TORCH_FUSED con betas (0,9; 0,999) y epsilon 1e-8, scheduler lineal, 5 epocas y precision mixta nativa (AMP). No se documenta el numero de tokens de entrenamiento, la composicion del dataset (la model card indica "unknown dataset"), ni si hubo etapas de RLHF o DPO (no aplicables a una tarea discriminativa de etiquetado). La evolucion de la perdida de validacion fue 0,1746 en la epoca 1 y 0,0884 en la epoca 5, sin senales de sobreajuste marcado en las metricas reportadas.

## Capacidades

- Reconocimiento de entidades nombradas en texto en ingles mediante clasificacion de tokens (etiquetado BIO).
- Extraccion de entidades de tipo persona, organizacion, localizacion y miscelanea, segun el esquema del corpus CoNLL-2003 (no confirmado explicitamente en la model card).
- Procesamiento por secuencias de hasta 512 tokens; no soporta ventanas de contexto largas.
- Inferencia eficiente en CPU y GPU de gama baja por su tamano reducido.
- No soporta generacion de texto: es un modelo exclusivamente de encoding y clasificacion.
- No dispone de tool calling ni function calling.
- No esta orientado a agentes ni a razonamiento multi-paso.
- No se declara soporte multilingue; el modelo base y el corpus de referencia son en ingles.
- No incorpora modo "thinking", vision, audio ni otras modalidades.

## Casos de uso

- Extraccion de entidades en pipelines de documentos: el modelo puede procesar texto plano y devolver entidades etiquetadas para alimentar bases de datos estructuradas, aprovechando su bajo coste de inferencia y su F1 de 0,8922 en evaluacion.
- Preprocesamiento para RAG y grafos de conocimiento: las entidades extraidas (personas, organizaciones, localizaciones) sirven para construir indices o relaciones en un grafo antes de pasar los fragmentos a un modelo generativo.
- Deteccion de datos personales y anonimizacion: permite localizar nombres de personas y organizaciones en textos para su enmascaramiento previo a almacenamiento o comparticion, con la limitacion de que solo cubre el conjunto de entidades del corpus de entrenamiento.
- Indexado y busqueda en corpus periodisticos o legales: al etiquetar consistentemente personas y organizaciones, facilita filtros y consultas estructuradas sobre grandes volumenes de texto.
- Enriquecimiento de registros en CRM: extraccion de organizaciones y localizaciones de correos o notas de clientes para completar campos de forma automatica en tiempo real.
- Analisis de noticias financieras: identificacion de empresas y lugares mencionados para alimentar alertas o paneles de seguimiento.
- Etiquetado en tiempo real en entornos con recursos limitados: al ocupar menos de 1 GB de VRAM en FP32 y funcionar en CPU, puede desplegarse en dispositivos de borde o en contenedores sin GPU para tareas de clasificacion continua.

## Benchmarks y rendimiento

El bloque `model-index` de la model card esta vacio (`"results": []`), por lo que no se declaran resultados en benchmarks estandar como MMLU, HumanEval o GSM8K (no aplicables a un modelo de NER). Los unicos datos disponibles son las metricas del conjunto de evaluacion reportadas por el autor:

| Metrica | Valor |
|---|---|
| Loss (evaluacion) | 0,0884 |
| Precision | 0,8733 |
| Recall | 0,9120 |
| F1 | 0,8922 |
| Accuracy | 0,9795 |

Evolucion por epoca declarada en la model card:

| Epoca | Step | Validation loss | Precision | Recall | F1 | Accuracy |
|---|---|---|---|---|---|---|
| 1.0 | 626 | 0,1746 | 0,7825 | 0,8314 | 0,8062 | 0,9630 |
| 2.0 | 1252 | 0,1125 | 0,8539 | 0,8925 | 0,8728 | 0,9750 |
| 3.0 | 1878 | 0,0987 | 0,8514 | 0,9022 | 0,8761 | 0,9768 |
| 4.0 | 2504 | 0,0903 | 0,8751 | 0,9090 | 0,8917 | 0,9791 |
| 5.0 | 3130 | 0,0884 | 0,8733 | 0,9120 | 0,8922 | 0,9795 |

No se especifica si el conjunto de evaluacion corresponde al split de test oficial de CoNLL-2003 ni si se aplico el preprocesado estandar (por ejemplo, conversion de tags o eliminacion de documentos), por lo que los valores no son directamente comparables con los publicados para otros modelos NER.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en FP32 (aproximadamente 133 MB para 33,2 M de parametros) y en torno a 66 MB en FP16; el pico real depende del tamano de batch y de la longitud de secuencia.
- Cabe en cualquier GPU de consumo, incluidas GTX 1050, GTX 1650, RTX 3060, RTX 4090, asi como en GPUs de centro de datos (A100, H100) donde el modelo quedaria infrautilizado.
- Funciona en CPU sin necesidad de GPU, lo que lo hace apto para contenedores ligeros y entornos de borde.
- Opciones de despliegue: `transformers` (pipeline de token-classification), ONNX Runtime para cuantizacion e inferencia acelerada, Hugging Face Inference Endpoints (el tag `endpoints_compatible` esta presente), TorchServe o un servicio FastAPI propio. No es un modelo adecuado para vLLM (orientado a generacion) ni para llama.cpp/Ollama.
- Latencia y throughput: no disponibles. Con un modelo de 33 M de parametros se espera latencia del orden de milisegundos por secuencia corta en GPU y decenas de milisegundos en CPU moderna, pero no hay mediciones publicadas en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | F1 en NER (CoNLL-2003) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `Koraniel/bge-small-conll2003-ner` | 33,2 M | 512 tokens | NER en ingles | 0,8922 (declarado por el autor en evaluacion) | MIT | HuggingFace (0 descargas, 0 likes) |
| `BAAI/bge-small-en-v1.5` | 33,2 M | 512 tokens | Embeddings / recuperacion | no aplica (no es un modelo NER) | MIT | HuggingFace, ampliamente usado |
| `dslim/bert-base-NER` | ~108 M | 512 tokens | NER en ingles (4 entidades) | no disponible en esta ficha (su autor declara un valor en torno a 0,91 en la model card, no verificado aqui) | MIT | HuggingFace |
| `Jean-Baptiste/roberta-large-ner-english` | ~355 M | 512 tokens | NER en ingles | no disponible en esta ficha | MIT | HuggingFace |

La comparacion cuantitativa rigurosa no es posible con la informacion proporcionada: los conjuntos de evaluacion, los esquemas de etiquetado y el preprocesado pueden diferir entre modelos. La ventaja principal de este modelo frente a alternativas mayores es su huella de memoria (33 M frente a 108 M o 355 M de parametros) y su capacidad de ejecucion en CPU.

## Limitaciones y advertencias

- Model card autogenerada con secciones sin completar ("More information needed") y dataset de entrenamiento indicado como desconocido; el autor no documenta la composicion de los datos.
- Cero descargas y cero likes en HuggingFace, por lo que no existe validacion de la comunidad ni pruebas independientes de robustez.
- Cobertura de entidades limitada al esquema del corpus de referencia (probablemente PER, ORG, LOC, MISC); no reconoce tipos adicionales como fechas, cantidades, productos o identificadores.
- Solo ingles: no se declara soporte para otros idiomas y el modelo base esta entrenado predominantemente en ingles.
- Limite de 512 tokens: documentos largos requieren fragmentacion manual, lo que puede partir entidades en los bordes y degradar el recall.
- Modelo exclusivamente extractivo: no puede usarse para generacion, resumen, pregunta-respuesta ni tareas de razonamiento.
- Riesgo de alucinacion bajo por su naturaleza clasificatoria, pero si existen errores de frontera y falsos positivos/negativos en entidades ambiguas; la precision de 0,8733 implica una tasa apreciable de etiquetas incorrectas.
- Sesgos: no se documenta ningun analisis de sesgo por genero, origen o dominio, y el modelo hereda los sesgos del corpus de entrenamiento y del modelo base.
- Licencia MIT: permite uso comercial, modificacion y redistribucion, siempre que se conserve el aviso de copyright y la licencia. No se imponen restricciones adicionales conocidas.
- Fecha de creacion en los metadatos (2026-10-13) posterior a la actualidad; conviene verificar la procedencia real del repositorio antes de usarlo en produccion.
- No se dispone de informacion sobre versionado, mantenimiento o soporte del autor.

## Enlaces

- Pagina del modelo en HuggingFace: https://huggingface.co/Koraniel/bge-small-conll2003-ner
- Modelo base `BAAI/bge-small-en-v1.5`: https://huggingface.co/BAAI/bge-small-en-v1.5
- No se han encontrado papers, blogs, repositorios ni demos asociados en la informacion disponible.
