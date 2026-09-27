# MichaelYitzchak/uav-symptom-minilm

## Resumen

Uav-symptom-minilm es un modelo de embeddings de frases (sentence transformer) obtenido mediante fine-tuning de `sentence-transformers/all-MiniLM-L6-v2` sobre los vuelos de entrenamiento del dataset `Bashifu/uav-fault-symptom-reports`. Lo publica el usuario MichaelYitzchak en HuggingFace y su objetivo es que los informes de síntomas correspondientes a un mismo tipo de fallo de un vehiculo aereo no tripulado (UAV) queden proximos en el espacio de embeddings, de modo que puedan recuperarse y clasificarse por similitud semantica.

El problema que aborda es el triaje automatico de informes de averia en UAV: dado un texto de sintomas, encontrar los fallos mas probables mediante busqueda vectorial o clasificacion kNN. El modelo tiene 22.713.216 parametros (heredados del backbone MiniLM-L6) y se entreno con BatchAllTripletLoss (distancia coseno, margen 0,25, 3 epocas). No es un modelo generativo: solo produce representaciones vectoriales.

Su relevancia actual es acotada y muy especifica: se trata de un fine-tune de nicho, entrenado con datos sinteticos y desplegado en una aplicacion concreta segun su autor, con una mejora documentada de precision@3 macro sobre el modelo base en varias particiones de evaluacion. No debe usarse para diagnostico de aeronaves reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo BERT (MiniLM-L6, 6 capas, destilado del backbone de all-MiniLM-L6-v2); encoder de frases |
| Parametros totales | 22.713.216 |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Libreria | sentence-transformers |
| Tamano del repositorio | 0,1 GB |
| Modelo base | sentence-transformers/all-MiniLM-L6-v2 |
| Dataset de entrenamiento | Bashifu/uav-fault-symptom-reports (solo vuelos de entrenamiento; huella de split `bf752fbcbe4059a8…`) |
| Fecha de creacion | 2026-09-27 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo parte de `all-MiniLM-L6-v2`, un encoder transformer de 6 capas que genera embeddings de frases de 384 dimensiones y que el autor reutiliza sin cambios estructurales. El entrenamiento consiste en un fine-tuning con la funcion de perdida BatchAllTripletLoss con distancia coseno y margen 0,25 durante 3 epocas, aplicada exclusivamente a los vuelos de entrenamiento del dataset `Bashifu/uav-fault-symptom-reports`. No se documenta el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si hubo etapas de RLHF o DPO (no disponibles). La huella de split indicada (`bf752fbcbe4059a8…`) sugiere una particion determinista del dataset para garantizar reproducibilidad.

El autor fijo de antemano una regla de decision: desplegar el modelo solo si la validacion mejoraba al menos 0,01 en precision@3 macro. La mejora observada en validacion (de 0,719 a 0,775, es decir +0,056) cumplio el criterio y el modelo quedo marcado como desplegado en la aplicacion. No se documentan innovaciones tecnicas adicionales como decodificacion especulativa, atencion lineal o mecanismos hibridos (no disponibles).

## Capacidades

- Generacion de embeddings de frases para similitud semantica y recuperacion densa.
- Busqueda semantica de informes de sintomas de fallo de UAV: dado un texto libre, recuperar los fallos mas proximos.
- Clasificacion por vecino mas cercano (kNN) sobre la clase de fallo, evaluada con precision@3 macro.
- Agrupamiento (clustering) de informes similares para deduplicacion o taxonomia de fallos.
- Soporte de tool calling / function calling: no aplicable (no es un modelo generativo ni conversacional).
- Soporte de agentes y razonamiento multi-paso: no aplicable.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Capacidades especiales: ninguna documentada; no dispone de modo thinking, vision ni audio.

## Casos de uso

- Triaje de informes de averia de UAV: introducir la descripcion de sintomas de un vuelo y recuperar por similitud coseno los fallos historicos mas parecidos, usando el modelo como motor de busqueda vectorial sobre el dataset de referencia.
- Clasificacion automatica de tickets de mantenimiento: calcular el embedding del informe y asignar la clase de fallo mediante kNN sobre un conjunto etiquetado, apoyandose en la mejora de precision@3 macro documentada (0,582 en test con todos los informes).
- Deduplicacion de informes de fallo: agrupar registros cuyo embedding supera un umbral de similitud para consolidar incidencias repetidas en un unico caso de mantenimiento.
- Construccion de taxonomias de sintomas: aplicar clustering sobre los embeddings para descubrir agrupaciones naturales de sintomas y revisar la cobertura de la taxonomia existente.
- Recuperacion aumentada (RAG) sobre documentacion tecnica: usar el modelo como recuperador en un pipeline de consulta-respuesta que alimente a un LLM generativo con los informes de sintomas mas relevantes.
- Enrutado de incidencias a especialistas: clasificar el informe por subsistema afectado y dirigirlo al equipo o procedimiento adecuado segun la clase recuperada.
- Filtrado de sintomas anomalos: detectar informes cuyo embedding queda lejos de todos los clusters conocidos para marcar casos que requieren revision manual.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card (metrica: precision@3 macro sobre la clase de fallo):

| Macro fault precision@3 | Base (all-MiniLM-L6-v2) | Fine-tuned |
|---|---|---|
| Validacion, informe unico (seleccion) | 0,719 | 0,775 |
| Test, informe unico | 0,765 | 0,819 |
| Test, todos los informes | 0,532 | 0,582 |
| Split de desafio (challenge), informe unico | 0,572 | 0,625 |
| Descripciones manuscritas | 0,488 | 0,429 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible; ademas, al tratarse de un modelo de embeddings, esas metricas generativas no serian aplicables.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de 22.713.216 parametros): aproximadamente 91 MB en fp32, 45 MB en fp16 y 23 MB en int8, sin contar el overhead del runtime y las activaciones del lote.
- GPU recomendadas: cualquier GPU moderna sirve; el modelo es lo bastante pequeno para ejecutarse en GTX 1650, RTX 3060, RTX 4090, A100 o H100, aunque estas ultimas estan sobredimensionadas para su tamano.
- Cabe en GPU de consumo: si, en cualquier GPU consumer con al menos 1 GB de VRAM; tambien es viable en CPU para cargas moderadas.
- Opciones de despliegue: sentence-transformers (nativo), HuggingFace Transformers, Text Embeddings Inference (TEI), vLLM (modelos de embeddings), ONNX Runtime, TensorRT o FastEmbed. Formatos GGUF/Ollama no estan documentados para este modelo.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Por tamano (22,7 M de parametros) es un encoder ligero apto para inferencia por lotes en CPU, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Uso previsto |
|---|---|---|---|---|
| MichaelYitzchak/uav-symptom-minilm | 22.713.216 | no disponible | no disponible | Recuperacion/clasificacion de sintomas de fallo de UAV |
| sentence-transformers/all-MiniLM-L6-v2 | 22.713.216 (mismo backbone) | no disponible | no disponible en la informacion proporcionada | Embeddings de frases genericos |
| Modelos de embeddings de proposito general de tamano similar | no disponible | no disponible | no disponible | Similitud semantica general |

Frente al modelo base, el fine-tune mejora la precision@3 macro en validacion, test (informe unico y todos los informes) y en el split de desafio, pero empeora en descripciones manuscritas (de 0,488 a 0,429). No se dispone de datos verificados de otras alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- El autor indica explicitamente que el modelo se entreno con datos sinteticos y que no debe usarse para aeronaves reales.
- Degrada en descripciones manuscritas: la precision@3 macro baja de 0,488 (base) a 0,429 (fine-tuned), lo que sugiere peor generalizacion ante texto no sintetico o redactado por personas.
- El rendimiento cae cuando se evaluan todos los informes en lugar de uno solo (0,582 frente a 0,819 en test), un escenario mas cercano a produccion con multiples informes por caso.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido; hay que contactar con el autor antes de integrarlo en un producto.
- Idiomas soportados no disponibles: se desconoce si funciona fuera del idioma de los datos de entrenamiento.
- Es un modelo de embeddings, no generativo: no produce texto, no soporta tool calling ni razonamiento multi-paso.
- Riesgo de sobreajuste al vocabulario y la distribucion del dataset `Bashifu/uav-fault-symptom-reports`; puede transferir mal a otros dominios o taxonomias de fallo.
- Sesgos conocidos: no documentados; al derivar de datos sinteticos, hereda las suposiciones de generacion del dataset.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si puede devolver vecinos irrelevantes con alta similitud coseno si el umbral de recuperacion no se calibra.
- Repositorio con 0 descargas y 0 likes: minima validacion externa de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MichaelYitzchak/uav-symptom-minilm
- Modelo base: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2
- Dataset de entrenamiento: https://huggingface.co/datasets/Bashifu/uav-fault-symptom-reports
- Paper, blog, repositorio o demo adicionales: no disponibles en la informacion proporcionada.
