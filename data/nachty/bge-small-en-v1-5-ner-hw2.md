# nachty/bge-small-en-v1.5-ner-hw2

## Resumen

bge-small-en-v1.5-ner-hw2 es un modelo de reconocimiento de entidades nombradas (NER) obtenido por ajuste fino del encoder BAAI/bge-small-en-v1.5, publicado por el usuario nachty en HuggingFace. Se trata, por tanto, de una adaptación de un modelo de embeddings de texto de la familia BGE v1.5 (arquitectura tipo BERT, ~33 millones de parámetros, orientada originalmente a recuperación densa y similitud semántica en inglés) reconvertida a la tarea de etiquetado de tokens mediante `token-classification`.

El modelo resuelve la extracción de entidades sobre texto: dado un fragmento de entrada, devuelve una etiqueta BIO/IOB por token. Con 33.215.625 parámetros y un repositorio de 0,3 GB, es un modelo muy ligero que puede ejecutarse en CPU o en cualquier GPU consumer. Su relevancia práctica es la de un componente de extracción de información barato y rápido para pipelines de NLP, aunque su documentación es prácticamente inexistente y no se especifica qué conjunto de datos ni qué esquema de etiquetas se usó para el ajuste.

El modelo se publica con licencia MIT, lo que permite uso comercial sin restricciones relevantes, pero no cuenta con descargas ni valoraciones en el momento de la consulta y su model card está generada automáticamente por el `Trainer` de HuggingFace, con secciones sin rellenar ("More information needed"). Esto limita seriamente su uso en producción sin una validación previa por parte del integrador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo BERT (encoder, heredada de BAAI/bge-small-en-v1.5) |
| Parametros totales | 33.215.625 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 512 tokens (heredado del modelo base; no se explicita en la model card) |
| Tipos de cuantizacion | no disponible en la model card; al ser un encoder de 33 M de parametros admite fp32, fp16/bf16 e int8 sin dificultad |
| Idiomas soportados | no disponible en la model card; el modelo base BAAI/bge-small-en-v1.5 esta entrenado para ingles |
| Licencia | MIT |
| Formato de pesos | safetensors (tag del repositorio); el repositorio tambien suele incluir config.json y tokenizer.json de la libreria transformers |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base BAAI/bge-small-en-v1.5: un encoder transformer de tipo BERT con ~33 M de parametros y embeddings de baja dimensionalidad, diseñado originalmente para recuperacion densa en ingles. El ajuste fino sustituye la cabeza de representacion por una cabeza de clasificacion de tokens (`token-classification`), que produce una distribucion de probabilidad por token sobre el conjunto de etiquetas de entidades del dataset de entrenamiento.

Los hiperparametros declarados en la model card son: learning rate 2e-05, batch de entrenamiento y de evaluacion de 16, semilla 42, optimizador AdamW con betas (0,9; 0,999) y epsilon 1e-08, scheduler lineal, 10 epocas y precision mixta nativa (Native AMP). El entrenamiento registro 625 pasos por epoca (6.250 pasos totales), lo que implica un conjunto de entrenamiento de aproximadamente 10.000 ejemplos. No se especifica el dataset utilizado, su composicion, el esquema de etiquetas ni si hubo fases posteriores de RLHF, DPO o ajuste adicional; la model card indica explicitamente "unknown dataset" y deja las secciones de datos y usos previstos sin completar. El ajuste se realizo con transformers 4.51.3, PyTorch 2.6.0+cu124, Datasets 4.8.5 y Tokenizers 0.21.4.

## Capacidades

- Etiquetado de tokens (NER): clasifica cada token de la entrada segun el esquema de entidades aprendido durante el ajuste.
- Extraccion de informacion estructurada a partir de texto no estructurado, siempre que la entidad buscada pertenezca al esquema de etiquetas del entrenamiento.
- Inferencia muy rapida y con huella de memoria minima (33 M de parametros), apta para procesamiento por lotes de alto volumen.
- Compatible con el pipeline `token-classification` de transformers y con `endpoints_compatible`, por lo que puede servirse mediante HuggingFace Inference Endpoints.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (es un encoder discriminativo, no un modelo generativo).
- Capacidades multilingues: no disponibles; el modelo base esta orientado a ingles.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.
- Generacion de texto, codigo o matematicas: no disponible (no es un modelo generativo).

## Casos de uso

- Extraccion de entidades en pipelines de procesamiento documental: el modelo puede etiquetar personas, organizaciones y ubicaciones en lotes de documentos, con la advertencia de que el esquema concreto de etiquetas no esta documentado y debe verificarse antes de integrarlo.
- Enriquecimiento de indices de busqueda: aplicar NER antes de indexar permite construir facetas por entidad y mejorar la recuperacion en corpus textuales en ingles.
- Preprocesado para sistemas RAG: identificar entidades en la consulta del usuario para filtrar o reordenar fragmentos recuperados antes de pasarlos a un modelo generativo.
- Moderacion y anonimizacion de datos: la deteccion de tokens de tipo persona permite enmascarar informacion personal identificable antes de almacenar o compartir textos (previa validacion del rendimiento real en el dominio objetivo).
- Analisis de opiniones y monitorizacion de marca: extraer nombres de productos, empresas y lugares de resenas o menciones en redes para alimentar cuadros de mando.
- Clasificacion y enrutado de tickets de soporte: combinar las entidades detectadas con reglas para asignar incidencias al equipo correspondiente.
- Componente de bajo coste en edge o CPU: con 0,3 GB de repositorio, puede desplegarse en contenedores pequenos o en entornos sin GPU para tareas de etiquetado a gran escala.
- Etiquetado asistido (pre-anotacion): generar propuestas de etiquetas que un anotador humano revisa, reduciendo el coste de construir nuevos corpus anotados.

## Benchmarks y rendimiento

El `model-index` del repositorio declara una lista de resultados vacia (`results: []`), por lo que no hay benchmarks publicados comparables con otros modelos. Los unicos datos numericos disponibles son los de la tabla de entrenamiento recogida en la model card, medidos sobre el conjunto de evaluacion del propio autor:

| Epoca | Paso | Validation loss | Precision | Recall | F1 | Accuracy |
|---|---|---|---|---|---|---|
| 1.0 | 625 | 0.1781 | 0.7658 | 0.8118 | 0.7882 | 0.9616 |
| 2.0 | 1250 | 0.1118 | 0.8646 | 0.8953 | 0.8797 | 0.9766 |
| 3.0 | 1875 | 0.0936 | 0.8664 | 0.9095 | 0.8874 | 0.9782 |
| 4.0 | 2500 | 0.0859 | 0.8892 | 0.9184 | 0.9036 | 0.9806 |
| 5.0 | 3125 | 0.0848 | 0.8934 | 0.9221 | 0.9075 | 0.9805 |
| 6.0 | 3750 | 0.0828 | 0.8973 | 0.9222 | 0.9096 | 0.9817 |
| 7.0 | 4375 | 0.0899 | 0.8906 | 0.9244 | 0.9072 | 0.9809 |
| 8.0 | 5000 | 0.0910 | 0.9022 | 0.9258 | 0.9139 | 0.9819 |

El mejor F1 reportado es 0,9139 con precision 0,9022 y recall 0,9258 (epoca 8). No hay resultados sobre MMLU, HumanEval, GSM8K ni sobre benchmarks estandar de NER como CoNLL-2003 o WNUT-17, y tampoco se identifica el conjunto de evaluacion empleado. La comparacion con modelos de referencia no es posible con los datos disponibles.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,13 GB en fp32 y 0,07 GB en fp16/bf16 para los pesos; con activaciones y overhead de runtime, menos de 1 GB en cualquier configuracion realista.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente (GTX 1050 Ti, RTX 3060, RTX 4090, T4, A10, L4, A100, H100). El modelo esta muy por debajo de la capacidad de todas ellas.
- Cabe en GPU consumer: si, en practicamente todas las GPU consumer de los ultimos diez anos, y tambien en CPU. No requiere acelerador dedicado.
- Opciones de despliegue: pipeline `token-classification` de transformers (PyTorch o TensorFlow), exportacion a ONNX Runtime para inferencia en CPU, TorchScript, y HuggingFace Inference Endpoints (el repositorio incluye el tag `endpoints_compatible`). vLLM y TGI no soportan de forma estandar la tarea de clasificacion de tokens, por lo que no son opciones adecuadas; llama.cpp y Ollama tampoco estan orientados a este tipo de cabeza de clasificacion.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Por el tamano del modelo (33 M de parametros, entradas de hasta 512 tokens), es razonable esperar latencias de milisegundos por lote en GPU y decenas de milisegundos en CPU, pero son estimaciones no verificadas y deben medirse en el entorno objetivo.

## Comparativa con modelos similares

No se dispone de resultados de benchmarks publicados en la informacion proporcionada, por lo que la comparacion se limita a caracteristicas objetivas. Los valores de tamano y contexto de los modelos alternativos son los declarados habitualmente por sus autores y deben verificarse en sus repositorios.

| Modelo | Parametros | Contexto max. | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nachty/bge-small-en-v1.5-ner-hw2 | 33,2 M | 512 tokens (heredado del base) | token-classification (NER) | MIT | publico, 0 descargas |
| dslim/bert-base-NER | ~108 M | 512 tokens | token-classification (NER, esquema CoNLL) | MIT | publico, muy extendido |
| Jean-Baptiste/roberta-large-ner-english | ~355 M | 512 tokens | token-classification (NER) | MIT | publico, ampliamente usado |
| BAAI/bge-small-en-v1.5 (modelo base) | 33,2 M | 512 tokens | embeddings / similitud semantica | MIT | publico, muy descargado |

El modelo aqui descrito es el mas pequeno de la comparativa y el unico sin esquema de etiquetas documentado ni benchmarks publicos, lo que dificulta justificar su eleccion frente a alternativas consolidadas salvo que se valide empiricamente en el dominio de interes.

## Limitaciones y advertencias

- Documentacion practicamente inexistente: la model card esta generada automaticamente y las secciones de descripcion, usos previstos, datos de entrenamiento y limitaciones dicen "More information needed".
- Dataset de entrenamiento desconocido ("unknown dataset"), por lo que se desconoce el dominio, el idioma exacto de los datos y el esquema de etiquetas (tipos de entidad) que el modelo produce.
- El conjunto de evaluacion tampoco esta identificado; las metricas de la model card (F1 0,9139) no son verificables ni comparables con benchmarks publicos.
- Riesgo de alucinacion en el sentido de falsos positivos de entidad: al ser un clasificador de tokens, puede etiquetar como entidad fragmentos que no lo son, especialmente fuera de la distribucion de entrenamiento.
- Sesgos: no se han documentado analisis de sesgo. Como modelo derivado de un encoder entrenado sobre corpus web en ingles, es previsible que herede sesgos de genero, nacionalidad y origen de esos datos, pero no hay mediciones publicadas.
- Limitaciones de idioma: el modelo base BAAI/bge-small-en-v1.5 esta orientado al ingles; el rendimiento en castellano u otros idiomas no esta documentado y no deberia asumirse.
- Limitacion de contexto: al derivar de un modelo con 512 posiciones, las entradas largas deben fragmentarse con solapamiento, lo que introduce complejidad adicional en el postprocesado de entidades que cruzan fronteras de fragmento.
- Licencia MIT: permite uso comercial, modificacion y redistribucion con atribucion y sin garantia. No es una restriccion relevante, pero el autor no ofrece ninguna garantia de idoneidad.
- Advertencia para produccion: el modelo tiene 0 descargas y 0 valoraciones, sin historial de uso. No deberia desplegarse en un sistema critico sin una evaluacion propia sobre datos representativos del caso de uso real, incluyendo la comprobacion del esquema de etiquetas que emite.
- Ausencia de soporte para generacion, tool calling o agentes: cualquier arquitectura que lo integre debe tratar la salida como una secuencia de etiquetas, no como texto generado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nachty/bge-small-en-v1.5-ner-hw2
- Modelo base: https://huggingface.co/BAAI/bge-small-en-v1.5
- Paper de la familia BGE (BAAI General Embedding): no disponible en la informacion proporcionada.
- Repositorio de codigo del autor: no disponible.
- Demos o espacios asociados: no disponible.
- Nota sobre la busqueda web: los resultados devueltos por la busqueda no contienen informacion relevante sobre el modelo (son paginas de contenido para adultos sin relacion con el proyecto), por lo que no se incluyen como fuentes.
