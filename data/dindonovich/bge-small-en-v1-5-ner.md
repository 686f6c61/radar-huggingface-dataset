# DinDonovich/bge-small-en-v1.5-ner

## Resumen

bge-small-en-v1.5-ner es un modelo de reconocimiento de entidades nombradas (NER) obtenido por ajuste fino supervisado del modelo de embeddings BAAI/bge-small-en-v1.5. Lo publica el usuario DinDonovich en Hugging Face y se distribuye con licencia MIT. La tarea declarada en el pipeline es `token-classification`, es decir, clasificacion por token para extraer spans de entidades, no generacion de texto ni produccion de embeddings (aunque el backbone subyacente sea un encoder de embeddings).

El modelo parte de un backbone BERT de 33.215.625 parametros (33,2 M), con un peso en disco de aproximadamente 0,1 GB en el repositorio. Es, por tanto, un modelo muy ligero: cabe holgadamente en CPU y en cualquier GPU consumer, lo que lo hace apto para tareas de extraccion de informacion de alto volumen y bajo coste computacional.

La relevancia de esta ficha es acotada y conviene ser explicito: se trata de un modelo con 0 descargas y 0 likes en el momento de la consulta, sin model card completada (el autor deja secciones como "Model description", "Training and evaluation data" y "Intended uses & limitations" con el texto "More information needed"), y con el `model-index` vacio. No hay resultados de benchmarks publicados, solo metricas de evaluacion interna generadas por el Trainer. Debe tratarse, en consecuencia, como un artefacto experimental y no como un modelo listo para produccion sin validacion adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (encoder transformer, tarea `token-classification`); backbone base BAAI/bge-small-en-v1.5 |
| Parametros totales | 33.215.625 (33,2 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se documentan cuantizaciones publicadas) |
| Idiomas soportados | no disponible para el ajuste fino; el modelo base BAAI/bge-small-en-v1.5 esta descrito como modelo de embeddings de ingles |
| Licencia | MIT |
| Formato de pesos | safetensors (tambien compatible con `transformers`; el repo incluye tags de TensorBoard) |

Datos adicionales del repositorio: creado y actualizado el 2026-10-08, tamano del repo 0,1 GB, 0 descargas, 0 likes, tag `endpoints_compatible`, region `us`. Entorno de entrenamiento declarado: Transformers 5.18.0, PyTorch 2.11.0+cu130, Datasets 4.8.5, Tokenizers 0.23.2.

## Arquitectura y entrenamiento

La arquitectura es un transformer tipo BERT (el tag del repositorio es explicitamente `bert`) al que se le ha anadido una cabeza de clasificacion por token. El backbone es BAAI/bge-small-en-v1.5, un modelo de embeddings de frases de 384 dimensiones desarrollado por BAAI (Beijing Academy of Artificial Intelligence) dentro de la familia BGE, entrenado originalmente con aprendizaje contrastivo. Aqui ese backbone se reaprovecha para etiquetado de secuencias, no para similitud semantica.

El ajuste fino se realizo con el Trainer de Hugging Face. Hiperparametros declarados: `learning_rate` 2e-05, `train_batch_size` 8, `eval_batch_size` 8, semilla 42, optimizador AdamW (`ADAMW_TORCH_FUSED`) con betas (0.9, 0.999) y epsilon 1e-08, scheduler lineal y 10 epocas configuradas. La tabla de resultados de entrenamiento registra 6 epocas evaluadas (pasos 1250 a 7500, en incrementos de 1250). A partir del producto de pasos por batch (1250 x 8) se puede inferir un orden de magnitud de unas 10.000 muestras de entrenamiento por epoca, si bien el autor no declara ni el dataset ni su composicion ("on an unknown dataset"). No se documenta el esquema de etiquetas (que tipos de entidad reconoce), ni si hubo RLHF, DPO u otra fase posterior: en un fine-tune de clasificacion por token no serian aplicables de forma estandar, pero tampoco se confirma ningun detalle adicional.

No se declara ninguna innovacion tecnica especifica: ni decodificacion especulativa, ni atencion lineal, ni destilacion, ni mezcla de expertos. El valor del modelo reside unicamente en el ajuste fino sobre un backbone pequeno y en el bajo coste de inferencia resultante.

## Capacidades

- Reconocimiento de entidades nombradas (NER) sobre texto: el pipeline declarado es `token-classification`, lo que implica asignar una etiqueta a cada token o subtoken de la secuencia de entrada.
- Extraccion de spans de entidades para poblar estructuras de datos (el conjunto concreto de tipos de entidad no esta declarado en la informacion disponible).
- Procesamiento por lotes de documentos a bajo coste: 33,2 M de parametros permiten throughput alto en hardware modesto.
- Integracion con el ecosistema `transformers` mediante `AutoModelForTokenClassification` y `pipeline("token-classification")`.
- Compatibilidad declarada con Hugging Face Inference Endpoints (tag `endpoints_compatible`).
- Capacidades multilingues: no disponible. El modelo base esta orientado al ingles; no se declara el idioma del ajuste fino.
- Tool calling / function calling: no soportado ni declarado (no es un modelo generativo ni de instrucciones).
- Modo de razonamiento (thinking mode), vision o audio: no soportado ni declarado.
- Generacion de texto libre: no soportado. El head de clasificacion por token no produce texto.

## Casos de uso

- Anonimizacion y enmascarado de datos personales (PII): el modelo puede etiquetar por token nombres, organizaciones o localizaciones en un pipeline de preprocesado de datos antes de almacenarlos o compartirlos. Su tamano reducido permite ejecutarlo en CPU dentro de la propia infraestructura, sin enviar datos a terceros.
- Enriquecimiento de indices de busqueda: extraer entidades de documentos antes de indexarlos para permitir filtrado facetado por organizacion, lugar o persona, alimentando motores de busqueda o sistemas RAG con metadatos estructurados.
- Curacion de datasets para entrenamiento: usar el modelo como etiquetador automatico (weak labeling) sobre grandes volumenes de texto no anotado, seguido de revision humana de una muestra, para acelerar la construccion de corpus NER.
- Extraccion de campos en correos y formularios: identificar entidades en comunicaciones entrantes y volcarlas a un CRM o a una cola de tickets, con validacion posterior por reglas.
- Analisis de documentos legales o financieros: localizar menciones a partes, entidades y ubicaciones en contratos o informes para generar resumenes estructurados o tablas de referencia.
- Triage de logs e incidencias: detectar identificadores de servicio, hosts o equipos citados en texto libre de tickets y post-mortems, y etiquetar automaticamente las incidencias.
- Preprocesado en pipelines de NLP mas grandes: actuar como etapa de extraccion previa a un modelo generativo, reduciendo el texto que se envia al modelo grande y bajando el coste por consulta.

Advertencia transversal: al no estar documentados el dataset, el esquema de etiquetas ni los idiomas, estos casos de uso son plantillas de aplicacion del pipeline, no garantias de calidad del modelo. Requieren validacion con datos propios antes de cualquier despliegue.

## Benchmarks y rendimiento

El `model-index` de la model card esta vacio: `{"name": "bge-small-en-v1.5-ner", "results": []}`. No se han publicado resultados de benchmarks externos (MMLU, HumanEval, GSM8K, CoNLL, etc.) en la informacion disponible. Los unicos datos numericos son las metricas de evaluacion internas generadas automaticamente por el Trainer de Hugging Face, que no especifican el conjunto de evaluacion ni el esquema de etiquetas.

Resultados finales declarados en el conjunto de evaluacion:

| Metrica | Valor |
|---|---|
| Loss | 0,0879 |
| Precision | 0,8966 |
| Recall | 0,9251 |
| F1 | 0,9106 |
| Accuracy | 0,9814 |

Evolucion durante el entrenamiento:

| Training loss | Epoca | Paso | Validation loss | Precision | Recall | F1 | Accuracy |
|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| 0,0512 | 1.0 | 1250 | 0,0972 | 0,8602 | 0,9120 | 0,8853 | 0,9765 |
| 0,0400 | 2.0 | 2500 | 0,0907 | 0,8958 | 0,9175 | 0,9066 | 0,9802 |
| 0,0410 | 3.0 | 3750 | 0,0845 | 0,8845 | 0,9162 | 0,9001 | 0,9804 |
| 0,0204 | 4.0 | 5000 | 0,0890 | 0,9046 | 0,9253 | 0,9148 | 0,9817 |
| 0,0192 | 5.0 | 6250 | 0,0878 | 0,8974 | 0,9258 | 0,9114 | 0,9818 |
| 0,0181 | 6.0 | 7500 | 0,0879 | 0,8966 | 0,9251 | 0,9106 | 0,9814 |

Nota metodologica: la `training loss` baja de forma monotona mientras la `validation loss` toca minimo en la epoca 3 (0,0845) y repunta ligeramente despues. El mejor F1 registrado es el de la epoca 4 (0,9148), no el de la ultima epoca evaluada (0,9106), lo que sugiere un inicio de sobreajuste a partir de la epoca 4-5. Las 10 epocas configuradas frente a las 6 registradas en la tabla no estan explicadas en la model card.

## Requisitos de hardware

- VRAM estimada para los pesos (calculada a partir de 33.215.625 parametros, solo pesos, sin activaciones ni memoria de runtime):
  - FP32: aproximadamente 133 MB.
  - FP16 / BF16: aproximadamente 66 MB.
  - INT8: aproximadamente 33 MB.
  - INT4: aproximadamente 17 MB.
- GPU recomendadas: no se documentan requisitos especificos. Por tamano, cualquier GPU con al menos 1-2 GB de VRAM libre es suficiente, incluidas NVIDIA RTX 3060, RTX 4090, T4, A10, A100 o H100. En la practica, el modelo no justifica el uso de GPU de datacenter.
- Cabe en GPU consumer: si, en cualquier GPU consumer moderna, e incluso en GPUs integradas o en CPU. El cuello de botella real sera el preprocesado del tokenizador y el ancho de banda, no la VRAM.
- Opciones de despliegue: la unica confirmada por los metadatos es `transformers` (biblioteca declarada) con `AutoModelForTokenClassification`, y el tag `endpoints_compatible` para Hugging Face Inference Endpoints. Otros runtimes (ONNX Runtime, TensorRT, vLLM, TGI, Ollama, llama.cpp) no estan documentados para este modelo en la informacion disponible. Ollama y llama.cpp no son aplicables de forma directa, ya que no es un modelo generativo con pesos GGUF.
- Latencia y throughput estimados: no disponible. No se publican mediciones de latencia ni de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Metricas publicadas |
|---|---|---|---|---|---|
| DinDonovich/bge-small-en-v1.5-ner | 33,2 M | no disponible | Token classification (NER) | MIT | F1 0,9106; precision 0,8966; recall 0,9251; accuracy 0,9814 (evaluacion interna) |
| BAAI/bge-small-en-v1.5 (modelo base) | 33,4 M | no disponible | Feature extraction (embeddings de 384 dim.) | MIT | no disponible en la informacion proporcionada |
| Otras alternativas NER de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion directa con el modelo base no es homogenea: BAAI/bge-small-en-v1.5 es un modelo de embeddings para recuperacion densa y busqueda semantica, no un etiquetador de secuencias. El ajuste fino anade una cabeza de clasificacion por token, de modo que las metricas de ambos modelos no son comparables entre si. Sobre el modelo base, la documentacion consultada indica que la familia BGE v1.5 corrige la distribucion de similitudes respecto a v1 (entrenamiento contrastivo con temperatura 0,01 y similitudes concentradas en el intervalo [0,6, 1]), detalle relevante para entender el backbone pero no para evaluar el NER. No se dispone de datos de benchmarks de terceros para ninguna alternativa, por lo que la comparativa cuantitativa queda como no disponible.

## Limitaciones y advertencias

- Model card incompleta: el autor no documenta la descripcion del modelo, los usos previstos, las limitaciones ni los datos de entrenamiento ("More information needed" en las tres secciones). No se sabe que tipos de entidad detecta.
- Dataset de entrenamiento desconocido: la model card indica explicitamente "on an unknown dataset". No se puede evaluar la cobertura, el dominio, la calidad de las anotaciones ni el posible sesgo del corpus.
- Idiomas: no declarados. El modelo base es un modelo de embeddings de ingles, por lo que el ajuste fino probablemente opera sobre ingles, pero esto no esta confirmado y no deberia asumirse para otros idiomas.
- `model-index` vacio: no hay ningun resultado de benchmark verificable ni reproducible mas alla de las metricas internas del Trainer, que no especifican el conjunto de evaluacion.
- Riesgo de sobreajuste: la `validation loss` deja de mejorar tras la epoca 3 y el mejor F1 se alcanza en la epoca 4, no en la ultima. Las metricas finales pueden sobreestimar el rendimiento en datos fuera de distribucion.
- Riesgo de alucinacion de entidades: como cualquier clasificador de secuencias, puede etiquetar tokens que no son entidades (falsos positivos) o fragmentar entidades compuestas de forma incorrecta. El recall declarado (0,9251) es superior a la precision (0,8966), lo que apunta a una tendencia a etiquetar de mas.
- Adopcion nula: 0 descargas y 0 likes. No hay evidencia de uso en produccion ni de validacion por parte de terceros.
- Licencia MIT: permite uso comercial, modificacion y redistribucion con atribucion y sin garantia. Es la parte mas favorable de la ficha, pero la licencia no cubre la calidad ni la idoneidad del modelo.
- Ausencia de cuantizaciones publicadas: no hay pesos GGUF ni ONNX publicados en el repositorio, lo que limita el despliegue en entornos que dependan de esos formatos sin conversion previa.
- Fecha de publicacion inusual: los metadatos indican creacion y actualizacion el 2026-10-08, dato que conviene verificar antes de citarlo.
- Recomendacion para produccion: tratar el modelo como punto de partida experimental. Antes de desplegarlo, validar con un conjunto de evaluacion propio y anotado del dominio objetivo, y considerar el ajuste fino adicional o el uso de un modelo NER con documentacion completa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DinDonovich/bge-small-en-v1.5-ner
- Modelo base BAAI/bge-small-en-v1.5: https://huggingface.co/BAAI/bge-small-en-v1.5
- Modelo predecesor BAAI/bge-small-en: https://huggingface.co/BAAI/bge-small-en
- Ficha de descarga en SourceForge: https://sourceforge.net/projects/bge-small-en-v1-5/
- Ficha en AIMarketly: https://www.aimarketly.com/model/BAAI/bge-small-en-v1.5
- Repositorio espejo en GitHub: https://github.com/abis330/bge-small-en-v1.5/
- Paper, blog o demo especificos de bge-small-en-v1.5-ner: no disponible en la informacion proporcionada.
