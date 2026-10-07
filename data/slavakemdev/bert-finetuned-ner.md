# SlavaKemDev/bert-finetuned-ner

## Resumen

bert-finetuned-ner es un modelo de clasificacion de tokens (reconocimiento de entidades nombradas, NER) publicado por el usuario SlavaKemDev en HuggingFace. Se trata de un fine-tuning del encoder BAAI/bge-small-en-v1.5, un transformer de tipo BERT con 33.215.625 parametros, orientado a la tarea de token-classification. El repositorio ocupa 0,1 GB y distribuye los pesos en formato safetensors bajo licencia MIT.

El modelo se genero automaticamente con la clase Trainer de HuggingFace, por lo que la model card es un artefacto autogenerado: no documenta el dataset de entrenamiento, el esquema de etiquetas ni los idiomas soportados. Los unicos datos de rendimiento disponibles son los de la particion de evaluacion declarada por el autor: perdida 0,0802, precision 0,9002, recall 0,9260, F1 0,9129 y accuracy 0,9817 tras 10 epocas.

Su relevancia practica es limitada por ahora: acumula 0 descargas y 0 likes, y la ausencia de documentacion sobre el corpus y las etiquetas impide garantizar su comportamiento en produccion. Resulta util, en cambio, como ejemplo reproducible de fine-tuning de un encoder pequeno para NER y como punto de partida barato en computo para tareas de extraccion de entidades en ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (fine-tuning de BAAI/bge-small-en-v1.5) |
| Parametros totales | 33.215.625 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens (valor tipico de la arquitectura del modelo base; no confirmado en la model card) |
| Tipos de cuantizacion | no disponible; el repositorio solo distribuye pesos en safetensors (fp32) |
| Idiomas soportados | no disponible en la model card; el modelo base BAAI/bge-small-en-v1.5 esta orientado al ingles |
| Licencia | MIT |
| Formato de pesos | safetensors (carga via transformers / PyTorch) |

## Arquitectura y entrenamiento

La arquitectura corresponde a un encoder transformer de tipo BERT, heredada integramente del modelo base BAAI/bge-small-en-v1.5, al que se le ha anadido una cabeza de clasificacion de tokens. Con 33,2 millones de parametros, se situa en la gama "small" de la familia BERT: es un modelo denso, sin mecanismos de atencion dispersa, MoE ni estado recurrente. El unico cambio respecto al modelo base es la capa de salida, adaptada al numero de etiquetas del corpus de entrenamiento (no declarado).

El entrenamiento se realizo con la libreria Transformers 4.51.3 (PyTorch 2.11.0+cu128, Datasets 4.8.5, Tokenizers 0.21.4) durante 10 epocas, con learning rate 2e-5, batch de 16 tanto en entrenamiento como en evaluacion, optimizador AdamW (betas 0,9/0,999, epsilon 1e-8), scheduler lineal y semilla 42. La model card no especifica el dataset, su composicion, el numero de tokens vistos ni si hubo fases de RLHF o DPO, algo esperable en un modelo de clasificacion de entidades. La perdida de entrenamiento descendio de 0,4806 en la primera epoca a 0,0287 en la decima, mientras la perdida de validacion toco minimo en la sexta epoca (0,0782) y se mantuvo plana en ~0,08, lo que sugiere un ajuste estable sin sobreajuste acusado.

## Capacidades

- Reconocimiento de entidades nombradas (NER) sobre texto: el pipeline declarado es `token-classification`.
- Etiquetado a nivel de token, no generacion de texto: el modelo no produce lenguaje natural ni respuestas conversacionales.
- No soporta tool calling ni function calling.
- No dispone de modo de razonamiento explicito (thinking mode), agentes ni razonamiento multi-paso.
- No tiene capacidades multimodales (vision, audio) ni de generacion de codigo.
- Cobertura multilingue: no documentada; el modelo base esta entrenado principalmente en ingles.
- Esquema de etiquetas: no documentado en la model card, por lo que se desconoce que tipos de entidad reconoce (persona, organizacion, lugar, fecha, etc.).
- Compatible con endpoints de inferencia de HuggingFace segun los tags del repositorio (`endpoints_compatible`).

## Casos de uso

- Extraccion de entidades en documentos empresariales: el modelo puede procesar bloques de hasta 512 tokens para identificar nombres, organizaciones o localizaciones en contratos, informes o correos, siempre que se valide antes el esquema de etiquetas real.
- Anonimizacion y enmascarado de datos personales: aplicable como paso previo a pipelines de cumplimiento (RGPD) para detectar y sustituir menciones a personas u organizaciones en textos en ingles, con revision humana obligatoria dado que F1 es 0,9129 y no 1,0.
- Preprocesado para busqueda y analitica: enriquecer indices de Elasticsearch u OpenSearch con metadatos de entidades extraidas, mejorando filtros facetados sin recurrir a modelos grandes.
- Parsing de curriculos y perfiles profesionales: extraccion de nombres de empresas, titulaciones y puestos a partir de texto libre, integrándose como microservicio detras de una API REST.
- Enrutado de tickets de soporte: detectar el producto, la organizacion o la ubicacion mencionados en un ticket para asignarlo automaticamente al equipo correspondiente.
- Etiquetado asistido en anotacion de corpus: emplear el modelo como preanotador en herramientas tipo Label Studio o Prodigy para reducir el trabajo manual de los anotadores, con reentrenamiento posterior.
- Procesamiento de registros y logs: identificar entidades relevantes en lineas de traza o mensajes de error para agrupar incidentes por componente afectado.
- Despliegue en entornos con recursos muy limitados: al ocupar aproximadamente 133 MB en fp32, cabe en CPU, dispositivos edge o contenedores pequenos donde un LLM no es viable.

## Benchmarks y rendimiento

El `model-index` del repositorio no declara ningun resultado (`results: []`). Los unicos datos disponibles son los de la particion de evaluacion reportados en la model card, medidas con precision, recall, F1 y accuracy. No se especifica el dataset, por lo que no es posible compararlos con cifras publicas de CoNLL-2003, OntoNotes u otros corpus estandar.

| Metrica | Valor final (epoca 10) |
|---|---|
| Loss | 0,0802 |
| Precision | 0,9002 |
| Recall | 0,9260 |
| F1 | 0,9129 |
| Accuracy | 0,9817 |

Evolucion durante el entrenamiento (particion de evaluacion):

| Epoca | Step | Validation loss | Precision | Recall | F1 | Accuracy |
|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| 1,0 | 625 | 0,1772 | 0,7692 | 0,8174 | 0,7926 | 0,9623 |
| 2,0 | 1250 | 0,1126 | 0,8626 | 0,8920 | 0,8770 | 0,9764 |
| 3,0 | 1875 | 0,0920 | 0,8615 | 0,9079 | 0,8841 | 0,9779 |
| 4,0 | 2500 | 0,0836 | 0,8834 | 0,9155 | 0,8992 | 0,9806 |
| 5,0 | 3125 | 0,0830 | 0,8883 | 0,9199 | 0,9038 | 0,9807 |
| 6,0 | 3750 | 0,0782 | 0,8897 | 0,9216 | 0,9053 | 0,9811 |
| 7,0 | 4375 | 0,0792 | 0,8925 | 0,9254 | 0,9087 | 0,9812 |
| 8,0 | 5000 | 0,0808 | 0,8987 | 0,9231 | 0,9108 | 0,9816 |
| 9,0 | 5625 | 0,0799 | 0,8988 | 0,9254 | 0,9119 | 0,9817 |
| 10,0 | 6250 | 0,0802 | 0,9002 | 0,9260 | 0,9129 | 0,9817 |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 133 MB en fp32, unos 66 MB en fp16/bf16 y unos 33 MB en int8. El tamano del repositorio (0,1 GB) es coherente con estas cifras.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente (GTX 1050 Ti, RTX 3060, RTX 4090, T4, A10, A100, H100). El modelo esta sobredimensionado para el hardware disponible en la practica.
- Cabe en GPU de consumo: si, en todas las GPU consumer modernas e incluso en iGPU y en CPU. Tambien es viable en dispositivos edge tipo Raspberry Pi 4/5 o Jetson Nano.
- Opciones de despliegue: pipeline `token-classification` de transformers, HuggingFace Inference Endpoints (el repo incluye el tag `endpoints_compatible`), optimizacion con Optimum y exportacion a ONNX Runtime para inferencia en CPU. No se distribuyen pesos GGUF, por lo que llama.cpp u Ollama no son opciones directas para esta cabeza de clasificacion.
- Latencia y throughput estimados: no disponible. No hay mediciones publicadas en la informacion proporcionada.

## Comparativa con modelos similares

Los datos de la columna de este modelo provienen de la informacion proporcionada. Los datos de los modelos alternativos no forman parte de la informacion suministrada y se marcan como "no disponible" cuando no se pueden verificar con la misma fuente.

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SlavaKemDev/bert-finetuned-ner | 33,2 M | 512 tokens (segun arquitectura base) | Token classification (NER) | MIT | HuggingFace, 0 descargas |
| BAAI/bge-small-en-v1.5 (modelo base) | 33 M (aproximado) | 512 tokens | Embeddings de texto / recuperacion | MIT | HuggingFace, ampliamente usado |
| Modelos NER genericos basados en BERT-base | no disponible en la informacion proporcionada | no disponible | Token classification (NER) | no disponible | no disponible |
| Modelos NER basados en RoBERTa | no disponible en la informacion proporcionada | no disponible | Token classification (NER) | no disponible | no disponible |

La comparativa cuantitativa con alternativas equivalentes no puede realizarse con rigor porque la model card no identifica el corpus de evaluacion ni el esquema de etiquetas, lo que impide equiparar las metricas declaradas con las de otros modelos NER publicos.

## Limitaciones y advertencias

- Dataset de entrenamiento no documentado: la model card indica explicitamente "unknown dataset". Se desconoce la composicion, el dominio y el esquema de etiquetas, lo que invalida cualquier afirmacion sobre que entidades reconoce realmente.
- Sin benchmarks en el `model-index`: el campo `results` esta vacio. Las unicas metricas provienen del texto de la model card y no son verificables ni comparables con corpus estandar.
- Riesgo de alucinacion: no aplica en el sentido generativo (el modelo no produce texto libre), pero si existe riesgo de falsos positivos y falsos negativos en el etiquetado, con un F1 de 0,9129 que implica aproximadamente un 9 % de error combinado.
- Sesgos: heredados del modelo base y del corpus de fine-tuning, ambos no documentados. Un encoder entrenado mayoritariamente en ingles puede degradarse notablemente con texto en castellano u otros idiomas.
- Limitacion de contexto: 512 tokens por pasada. Los documentos largos requieren troceado con solapamiento, lo que puede partir entidades en los limites de fragmento.
- Idioma: no hay declaracion de idiomas soportados; el modelo base esta orientado al ingles. No se recomienda su uso en produccion con texto en castellano sin una evaluacion previa.
- Licencia: MIT, permisiva y compatible con uso comercial, pero sin garantias por parte del autor.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta. No hay evidencia de uso en produccion ni de validacion por terceros.
- Model card incompleta: las secciones "Model description", "Intended uses & limitations" y "Training and evaluation data" contienen unicamente "More information needed". Antes de cualquier despliegue hay que reconstruir esa documentacion y validar el modelo sobre un conjunto propio.
- Fechas del repositorio: creado y actualizado con una diferencia de unos 10 minutos, lo que apunta a un experimento puntual mas que a un modelo mantenido.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SlavaKemDev/bert-finetuned-ner
- Modelo base BAAI/bge-small-en-v1.5: https://huggingface.co/BAAI/bge-small-en-v1.5
- No se han encontrado otros enlaces (papers, blogs, repositorios o demos) en la informacion disponible.
