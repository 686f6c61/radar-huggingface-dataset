# burguty/dl2-hw-02

## Resumen

dl2-hw-02 es un modelo de clasificación de tokens (token-classification) publicado por el usuario burguty en HuggingFace, obtenido mediante fine-tuning supervisado de BAAI/bge-small-en-v1.5. Se trata de un derivado de un modelo de embeddings de recuperación (retrieval) reconvertido a una tarea de etiquetado secuencial, probablemente reconocimiento de entidades u otro etiquetado a nivel de token. Con 33.215.625 parámetros, es un modelo compacto de la familia BERT-small, adecuado para inferencia en CPU y GPU de gama baja.

El modelo se entrenó durante 10 épocas con AdamW, learning rate 2e-05, batch de 16 y semilla 42, sobre un dataset que el autor no documenta ("unknown dataset"). La model card reporta métricas de evaluación: precision 0,9066, recall 0,9258, F1 0,9161, accuracy 0,9823 y loss 0,1050. No se especifican las etiquetas, el número de clases ni el dominio de aplicación.

Su relevancia práctica es limitada por el momento: cuenta con 0 descargas y 0 likes, la model card está generada automáticamente por el Trainer y el autor no ha documentado el dataset, el etiquetado ni los usos previstos. El nombre "dl2-hw-02" sugiere un ejercicio académico, no un artefacto listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT-small (heredada de BAAI/bge-small-en-v1.5), con cabeza de clasificacion de tokens |
| Parametros totales | 33.215.625 (dato real de safetensors) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens (heredada del modelo base; no confirmada por el autor) |
| Tipos de cuantizacion | No disponible (no se publican variantes GGUF, AWQ, GPTQ ni FP8) |
| Idiomas soportados | No disponible oficialmente; el modelo base BAAI/bge-small-en-v1.5 es solo ingles |
| Licencia | MIT |
| Formato de pesos | Safetensors (libreria transformers; repo de 2,3 GB) |

## Arquitectura y entrenamiento

La arquitectura es la de BAAI/bge-small-en-v1.5, un transformer encoder de tipo BERT-small con representaciones densas orientadas a recuperacion semantica, al que se le ha sustituido o anadido una cabeza de clasificacion por token para resolver una tarea de etiquetado secuencial. No hay innovaciones arquitectonicas propias: no se emplea MoE, ni atencion lineal, ni decodificacion especulativa, ni modos de razonamiento.

El entrenamiento se realizo con el Trainer de HuggingFace (tag generated_from_trainer) sobre un dataset no identificado, con 10 epocas completas a 626 pasos por epoca (6260 pasos totales), learning rate 2e-05 con scheduler lineal, AdamW (betas 0,9/0,999, epsilon 1e-08), batch de entrenamiento y evaluacion de 16 y semilla 42. La loss de entrenamiento bajo hasta 0,0023 en la primera epoca, mientras que la validation loss se estabilizo en 0,1050 en la epoca 4, sin que se documenten mas epocas. No se menciona uso de RLHF, DPO ni ningun tipo de alineacion posterior. Entorno: Transformers 4.50.0, PyTorch 2.11.0+cu128, Datasets 3.4.1, Tokenizers 0.21.4.

## Capacidades

- Etiquetado de secuencias a nivel de token: la tarea declarada en el pipeline es token-classification, tipicamente usada para NER, chunking sintactico, POS tagging o etiquetado de spans personalizado.
- Clasificacion de entidades o spans en texto de entrada de hasta 512 tokens.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingue; el modelo base subyacente esta entrenado solo en ingles.
- No dispone de modo "thinking", vision, audio ni generacion de texto libre.
- Al derivar de un modelo de embeddings de recuperacion (bge-small-en-v1.5), conserva representaciones contextuales de calidad para textos cortos en ingles, pero esto no esta validado como capacidad del fine-tuning.

## Casos de uso

- Extraccion de entidades nombradas en ingles: si el etiquetado del dataset de entrenamiento corresponde a personas, organizaciones o localizaciones, el modelo puede usarse para poblar bases de datos a partir de textos cortos, con F1 de 0,9161 sobre el conjunto de evaluacion del autor.
- Preprocesado de pipelines de NLP: etiquetar tokens de forma masiva antes de indexar documentos en un sistema de busqueda o RAG, aprovechando que el modelo es pequeno y rapido en CPU.
- Anonimizacion de datos personales: si las clases incluyen identificadores personales, podria usarse para enmascarar PII antes de almacenar logs, aunque esto requiere verificar el etiquetado real.
- Prototipado academico y docencia: al ser un ejercicio de fine-tuning con licencia MIT, sirve como referencia para comparar hiperparametros y curvas de entrenamiento en asignaturas de deep learning.
- Clasificacion de fragmentos en dominios verticales: sin reentrenamiento, solo si el dominio coincide con el dataset original; de lo contrario habria que hacer fine-tuning sobre la misma base.
- Filtrado de contenido o moderacion token a token: viable tecnicamente por tamano y coste, pero solo si las etiquetas del modelo cubren las categorias de interes, dato que no se ha publicado.
- Inferencia en el borde (edge): con ~66 MB en FP16 cabe en dispositivos con recursos muy limitados, lo que permite etiquetado local sin enviar texto a la nube, siempre que el idioma de entrada sea el soportado.

## Benchmarks y rendimiento

El model-index del autor esta vacio (no hay resultados declarados en el campo `results`). Los unicos datos disponibles son las metricas de la seccion de evaluacion de la model card, correspondientes al conjunto de evaluacion usado durante el entrenamiento:

| Metrica | Valor |
|---|---|
| Loss | 0,1050 |
| Precision | 0,9066 |
| Recall | 0,9258 |
| F1 | 0,9161 |
| Accuracy | 0,9823 |

Curva de validacion reportada por el autor:

| Epoca | Paso | Validation loss | Precision | Recall | F1 | Accuracy |
|---|---|---|---|---|---|---|
| 1.0 | 626 | 0,1225 | 0,8930 | 0,9204 | 0,9065 | 0,9808 |
| 2.0 | 1252 | 0,1155 | 0,9059 | 0,9268 | 0,9162 | 0,9816 |
| 3.0 | 1878 | 0,1098 | 0,9011 | 0,9261 | 0,9134 | 0,9817 |
| 4.0 | 2504 | 0,1050 | 0,9066 | 0,9258 | 0,9161 | 0,9823 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de ningun benchmark estandar en la informacion disponible. Las metricas anteriores corresponden al propio conjunto de evaluacion del autor, cuyo origen y composicion se desconocen.

## Requisitos de hardware

- VRAM estimada para inferencia: unos 133 MB en FP32 y unos 66 MB en FP16. El modelo completo cabe en memoria de cualquier GPU moderna e incluso en CPU.
- GPU recomendadas: cualquier GPU con mas de 1 GB de VRAM; no requiere A100, H100 ni tarjetas de gama alta. Funciona sin problemas en GTX 1050, RTX 3050, RTX 4090 o inferencia en CPU.
- Cabe en GPU de consumo: si, en practicamente todas las GPU consumer de los ultimos diez anos, y tambien en Raspberry Pi o moviles si se exporta a ONNX.
- Opciones de despliegue: pipeline de Transformers (`token-classification`), ONNX Runtime o Optimum para exportacion, TorchScript, y servidores de inferencia genericos. vLLM y TGI estan orientados a generacion de texto y no cubren de forma nativa token-classification, por lo que no son la via recomendada. llama.cpp no soporta cabezas de clasificacion de tokens de forma estandar.
- Latencia y throughput: no disponibles. No hay datos publicados de tokens por segundo ni de latencia por peticion.
- Nota sobre el repo: el tamano del repositorio (2,3 GB) es desproporcionado para 33 millones de parametros y sugiere que contiene checkpoints intermedios, estados del optimizador o artefactos de TensorBoard. La descarga para inferencia puede reducirse usando solo los archivos de safetensors y configuracion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| burguty/dl2-hw-02 | 33,2 M | 512 tokens | Token classification | MIT | Publico en HuggingFace, 0 descargas |
| BAAI/bge-small-en-v1.5 | ~33 M | 512 tokens | Embeddings / retrieval | MIT | Publico en HuggingFace, ampliamente usado |
| Modelos NER genericos de la familia BERT-base o DistilBERT | No verificado en la informacion disponible | No verificado | Token classification / NER | No verificado | No verificado |

La comparacion relevante es con su propio modelo base: dl2-hw-02 anade una cabeza de clasificacion de tokens y reemplaza el objetivo de similitud contrastiva por una tarea supervisada de etiquetado, pero pierde la utilidad como modelo de embeddings. Frente a alternativas NER consolidadas de mayor tamano (BERT-base, DistilBERT), no hay datos publicados que permitan comparar rendimiento, ya que no se han evaluado sobre benchmarks comunes como CoNLL-2003.

## Limitaciones y advertencias

- La model card esta generada automaticamente y el autor no ha rellenado las secciones de descripcion, usos previstos, datos de entrenamiento ni limitaciones. Se desconoce por completo el dataset, el esquema de etiquetas y el numero de clases.
- Las metricas reportadas corresponden a un conjunto de evaluacion no identificado, por lo que no son extrapolables a dominios reales ni comparables con benchmarks publicos.
- Riesgo de sobreajuste: la loss de entrenamiento cae a 0,0023 mientras la de validacion se mantiene en 0,1050, con 10 epocas y un learning rate bajo. La curva solo se documenta hasta la epoca 4.
- Idiomas: el modelo base BAAI/bge-small-en-v1.5 esta entrenado exclusivamente en ingles. No hay evidencia de soporte de castellano ni de otros idiomas. El tag de idiomas del repositorio esta vacio.
- Longitud de contexto limitada a 512 tokens, lo que obliga a trocear documentos largos y puede romper entidades que crucen la frontera de los fragmentos.
- Sesgos: no se ha realizado ninguna evaluacion de sesgo y el dataset de entrenamiento es desconocido. El modelo puede reproducir sesgos presentes en datos no auditados.
- Alucinacion: en clasificacion de tokens el riesgo se manifiesta como etiquetas incorrectas o spans mal delimitados, no como texto inventado, pero el efecto en produccion es equivalente.
- Licencia MIT: permite uso comercial, modificacion y redistribucion con atribucion y sin garantia. No hay restricciones adicionales conocidas, pero el autor no ofrece ninguna garantia de idoneidad.
- Advertencia de produccion: con 0 descargas, 0 likes y ausencia total de documentacion, no es recomendable desplegarlo en un sistema productivo sin una evaluacion propia sobre datos del dominio objetivo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/burguty/dl2-hw-02
- Modelo base: https://huggingface.co/BAAI/bge-small-en-v1.5
- Paper del modelo base BGE (BAAI General Embedding): https://arxiv.org/abs/2309.07597

Nota: la busqueda web realizada no ha devuelto ningun resultado relevante sobre el modelo. Los enlaces obtenidos correspondian a sitios de contenido para adultos ajenos por completo al modelo, por lo que se han descartado. No se han encontrado papers, blogs, repositorios ni demos adicionales asociados a burguty/dl2-hw-02.
