# arthrod/gliner-ettin-32m-ptbr-pii-full-3x-v1

## Resumen

El modelo arthrod/gliner-ettin-32m-ptbr-pii-full-3x-v1 es un ajuste fino de la libreria GLiNER sobre el encoder jhu-clsp/ettin-encoder-32m (aproximadamente 32 millones de parametros), especializado en la deteccion de informacion personal identificable (PII) en portugues de Brasil. Lo publica el usuario arthrod en HuggingFace bajo licencia Apache 2.0 y forma parte de una familia de modelos entrenados con la misma receta de perdida sobre la misma GPU (MI300X), variando unicamente el encoder, el subconjunto de entrenamiento, el tamano de lote y el presupuesto de pasos.

El problema que resuelve es concreto: extraer entidades sensibles (CPF, RG, PIS, nombres, direcciones, telefono, correo, tarjeta de credito, fecha de nacimiento) de texto en portugues brasileno para tareas de cumplimiento de la LGPD (Lei Geral de Protecao de Dados). Al ser un modelo de etiquetado a nivel de token y no un modelo generativo, su huella de computo es minima y puede ejecutarse en CPU o en GPUs de gama baja.

Es relevante ahora porque es el miembro mas pequeno de su familia y esta pensado para escenarios donde el tamano del modelo pesa mas que la precision: alcanza 0,6326 de F1 estricto en la fuente de validacion cruzada PT-BR, por detras de ettin-68m full-3x (0,7076) y de mmBERT-small full-3x (0,7678) con el mismo protocolo de evaluacion. Su contexto maximo no esta documentado en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GLiNER sobre encoder transformer bidireccional (jhu-clsp/ettin-encoder-32m); etiquetado de spans/entidades a nivel de token |
| Parametros totales | ~32 millones |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo distribuye pesos PyTorch) |
| Idiomas soportados | portugues (PT-BR), ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | pytorch_model.bin (PyTorch); no se distribuyen pesos safetensors ni GGUF |

## Arquitectura y entrenamiento

Se trata de un modelo GLiNER, es decir, un encoder transformer bidireccional con una cabeza de clasificacion de entidades que puntua candidatos de span contra representaciones de las etiquetas proporcionadas en tiempo de inferencia. Esto permite definir dinamicamente la lista de etiquetas (nombres, CPF, RG, PIS, telefono, correo, tarjeta, campos de direccion, fecha de nacimiento) sin reentrenar el modelo. El encoder base es jhu-clsp/ettin-encoder-32m, con aproximadamente 32 millones de parametros, y la libreria de referencia es gliner==0.2.25, la version con la que se entreno.

El ajuste fino uso el conjunto de entrenamiento completo de aproximadamente 984.000 muestras (data/splits/train.jsonl, no publicado), durante 69.000 pasos, con validacion sobre val_5k.jsonl (5.000 filas) y seleccion de modelo sobre holdout_5k_original (5.000 filas, proporcional entre 11 fuentes). El holdout se separo antes de construir el split de entrenamiento, por lo que el autor declara ausencia de fuga de datos. El conjunto se compone de fuentes publicas de PII y de spam, entre ellas nvidia/Nemotron-PII (la lista completa de fuentes aparece truncada en la informacion disponible). No se documentan detalles sobre RLHF, DPO ni sobre la composicion exacta del dataset mas alla de lo indicado.

El repositorio conserva 20 checkpoints completos (cada 3.450 pasos, con optimizer.pt, scheduler.pt y rng_state.pth) mas el checkpoint liberado como version final, checkpoint-65550, cuyo pytorch_model.bin es identico byte a byte al de la raiz del repositorio. Tambien incluye eval_holdout_strict_f1.parquet con el F1 estricto por fuente de holdout extraido de checkpoint-69000/trainer_state.json.

## Capacidades

- Extraccion de entidades nombradas (NER) zero-shot o guiada por etiquetas definidas por el usuario en tiempo de inferencia.
- Deteccion de PII especifica de Brasil: CPF, RG, PIS, nombre, apellido, segundo nombre, telefono, correo electronico, tarjeta de credito y fecha de nacimiento.
- Extraccion de direcciones desglosadas: calle, numero, barrio, ciudad, estado, abreviatura de estado, codigo postal y direccion completa.
- Etiquetado a nivel de token con puntuacion de confianza por entidad, lo que permite ajustar el umbral de decision (el ejemplo oficial usa threshold=0.3).
- Generalizacion cruzada entre fuentes: el autor declara haber probado el modelo sobre corpus de PII en ingles/multilingue y sobre texto de spam, ademas del holdout en portugues.
- Capacidad multilingue limitada a portugues (PT-BR) e ingles.
- No es un modelo generativo: no soporta generacion de texto, tool calling, function calling, agentes, razonamiento multi-paso ni modos de pensamiento. Tampoco tiene capacidades de vision ni de audio.

## Casos de uso

- Anonimizacion de documentos internos en empresas brasilenas: el modelo localiza CPF, RG, PIS, direcciones y telefonos en contratos, nominas o correos, y un proceso posterior puede enmascararlos antes de almacenarlos o compartirlos.
- Cumplimiento de la LGPD en pipelines de datos: preprocesado de logs, tickets de soporte y formularios para detectar y suprimir datos personales antes de que lleguen a un data lake o a un proveedor externo.
- Filtrado previo en sistemas de atencion al cliente: clasificacion automatica de conversaciones que contienen datos sensibles para derivarlas a un flujo con controles reforzados de acceso.
- Deteccion de PII en corpus de entrenamiento: barrido previo sobre datasets en portugues para eliminar identificadores antes de usarlos en el entrenamiento de otros modelos.
- Redaccion de documentos legales y judiciales: marcado de nombres, direcciones y numeros de documento para generar versiones publicas censuradas de expedientes.
- Analisis de correo no deseado y phishing: el autor indica que el modelo se probo sobre corpus de spam y phishing sin PII, lo que permite usarlo como paso de enriquecimiento en filtros de correo.
- Despliegue en el borde o en entornos con CPU: al tener unos 32 millones de parametros, puede ejecutarse en servidores sin GPU o en contenedores con presupuesto de memoria muy ajustado, como servicio de redaccion previa a otros sistemas.
- Etiquetado asistido para anotadores humanos: generacion de preanotaciones de PII que un revisor humano corrige, reduciendo el coste de construir corpus anotados.

## Benchmarks y rendimiento

Los unicos datos de rendimiento publicados en la informacion disponible son los del protocolo de F1 estricto sobre la fuente de holdout PT-BR, comparados dentro de la propia familia de modelos del autor.

| Modelo | Encoder | F1 estricto (holdout PT-BR) | Pasos | Conjunto de entrenamiento |
|---|---|---|---|---|
| gliner-ettin-32m-ptbr-pii-full-3x-v1 (este) | ettin-encoder-32m | 0,6326 | 69.000 | completo (~984k filas) |
| gliner-ettin-68m-ptbr-pii-full-3x-v1 | ettin-encoder-68m | 0,7076 | 69.000 | completo (~984k filas) |
| gliner-mmbert-small-ptbr-pii-full-3x-v1 | mmBERT-small | 0,7678 | 69.000 | completo + 2k filas de Ritapolis |
| gliner-ettin-68m-ptbr-pii-top50k-v1 | ettin-encoder-68m | no disponible | 11.700 | subconjunto curado de 50k |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que no son aplicables a un modelo de clasificacion de tokens. Para el modelo gliner-opf-ptbr-pii-v1 el autor afirma el mejor F1 parcial en el conjunto de validacion en distribucion y el menor numero de falsos positivos sobre texto sin PII, pero no se proporcionan cifras concretas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. Con ~32 millones de parametros, los pesos en FP32 ocupan del orden de 128 MB y en FP16 del orden de 64 MB, a lo que hay que sumar activaciones y tokenizador; en la practica cabe en menos de 1 GB de memoria.
- GPU recomendadas: no se especifican. Cualquier GPU con al menos unos pocos GB de VRAM es suficiente; tambien es viable en CPU.
- Cabe en GPU de consumo: si, con amplio margen, en cualquier GPU de consumo moderna (RTX 3060, RTX 4090, etc.), e incluso en hardware integrado o en CPU.
- Opciones de despliegue: la libreria documentada es gliner==0.2.25 sobre PyTorch, cargando el modelo con GLiNER.from_pretrained. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI; al no ser un modelo generativo, esas rutas de despliegue no son las previstas. Se puede descargar un checkpoint concreto con huggingface_hub.snapshot_download ignorando optimizer.pt, scheduler.pt y rng_state.pth.
- Latencia y throughput estimados: no disponibles.
- Almacenamiento: el repositorio ocupa 8,4 GB porque incluye 20 checkpoints completos con estados de optimizador; el conjunto de pesos util para inferencia es una fraccion minima de ese tamano.

## Comparativa con modelos similares

| Modelo | Parametros | Encoder | F1 estricto (holdout PT-BR) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gliner-ettin-32m-ptbr-pii-full-3x-v1 | ~32 M | ettin-encoder-32m | 0,6326 | Apache 2.0 | HuggingFace (13 descargas, 0 likes) |
| gliner-ettin-68m-ptbr-pii-full-3x-v1 | ~68 M | ettin-encoder-68m | 0,7076 | no disponible en la informacion proporcionada | HuggingFace |
| gliner-mmbert-small-ptbr-pii-full-3x-v1 | no disponible | mmBERT-small | 0,7678 | no disponible en la informacion proporcionada | HuggingFace |
| gliner-ettin-68m-ptbr-pii-top50k-v1 | ~68 M | ettin-encoder-68m | no disponible | no disponible en la informacion proporcionada | HuggingFace |
| gliner-opf-ptbr-pii-v1 | no disponible | OpenAI Privacy Filter (no es GLiNER) | mejor F1 parcial en validacion en distribucion; menor numero de falsos positivos en texto sin PII (sin cifras) | no disponible en la informacion proporcionada | HuggingFace |

La eleccion dentro de la familia es un compromiso explicito entre tamano y precision: este modelo es el mas pequeno y el menos preciso de los tres evaluados con el mismo protocolo. El autor recomienda escogerlo solo cuando el tamano del modelo importe mas que la exactitud.

## Limitaciones y advertencias

- Precision inferior a la de sus hermanos de familia: 0,6326 de F1 estricto frente a 0,7076 de ettin-68m y 0,7678 de mmBERT-small bajo el mismo protocolo.
- Falsos positivos sobre texto sin PII: el autor senala que el ajuste de OpenAI Privacy Filter presenta muchos menos falsos positivos en texto de spam y phishing sin datos personales, lo que sugiere que este modelo puede marcar entidades inexistentes en ese tipo de contenido. No se aportan cifras.
- Cobertura idiomatica limitada a portugues (PT-BR) e ingles. El rendimiento en otras variantes del portugues o en textos con mezcla de idiomas no esta documentado.
- Ambito restringido a las etiquetas para las que fue entrenado; el comportamiento con etiquetas nuevas definidas por el usuario no esta cuantificado en la informacion disponible.
- Umbral de decision sensible: el ejemplo oficial usa threshold=0.3, lo que favorece el recall a costa de la precision; en produccion conviene calibrarlo sobre datos propios.
- Longitud de contexto no documentada, lo que impide garantizar el comportamiento en documentos largos sin trocearlos previamente.
- El conjunto de entrenamiento no esta publicado y la lista de fuentes aparece truncada en la model card, lo que limita la reproducibilidad y la auditoria del sesgo.
- El autor declara que el holdout se separo antes de construir el split de entrenamiento (sin fuga de datos), pero esta afirmacion no es verificable externamente al no publicarse los splits.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de spans mal delimitados o etiquetados incorrectamente.
- Licencia Apache 2.0, que permite uso comercial y modificacion con atribucion y conservacion del aviso de licencia; conviene revisar las licencias de los corpus de origen, no detalladas en la informacion disponible.
- El modelo declara soporte para escenarios LGPD, pero no constituye por si solo una garantia de cumplimiento normativo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/arthrod/gliner-ettin-32m-ptbr-pii-full-3x-v1
- Modelo base: https://huggingface.co/jhu-clsp/ettin-encoder-32m
- Hermano ettin-68m full-3x: https://huggingface.co/arthrod/gliner-ettin-68m-ptbr-pii-full-3x-v1
- Hermano ettin-68m top50k (ablacion): https://huggingface.co/arthrod/gliner-ettin-68m-ptbr-pii-top50k-v1
- Hermano mmBERT-small full-3x: https://huggingface.co/arthrod/gliner-mmbert-small-ptbr-pii-full-3x-v1
- Ajuste de OpenAI Privacy Filter: https://huggingface.co/arthrod/gliner-opf-ptbr-pii-v1
- Dataset de benchmark: https://huggingface.co/datasets/arthrod/gliner-opf-ptbr-pii-bench-v1
- Demo Gradio (modelo Privacy Filter): https://huggingface.co/spaces/arthrod/gliner-opf-ptbr-pii-demo
- Barrido anterior de evaluacion (18 modelos x 9 conjuntos): https://huggingface.co/datasets/arthrod/gliner_eval_folder
- Datos de revision y comparacion GLiNER PII: https://huggingface.co/datasets/arthrod/gliner_review_comparison
- Dataset de referencia usado en el entrenamiento: https://huggingface.co/datasets/nvidia/Nemotron-PII
- DOI del modelo: https://doi.org/10.57967/hf/8519
- Libreria GLiNER: version 0.2.25 (referenciada en la model card; no se proporciona URL en la informacion disponible)
