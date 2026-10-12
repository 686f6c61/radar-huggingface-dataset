# glebustim/bert-finetuned-ner

## Resumen

bert-finetuned-ner es un modelo de clasificacion de tokens (token classification) publicado por el usuario glebustim en HuggingFace, obtenido mediante fine-tuning supervisado de BAAI/bge-small-en-v1.5, un encoder tipo BERT de aproximadamente 33 millones de parametros. El modelo resuelve tareas de reconocimiento de entidades nombradas (NER): recibe una secuencia de texto y devuelve una etiqueta por token, lo que permite extraer personas, organizaciones, lugares u otras categorias definidas por el dataset de entrenamiento.

La relevancia de esta ficha es acotada y conviene ser explicito: se trata de un artefacto derivado de un entrenamiento automatico con la libreria Trainer de transformers. La model card no documenta el dataset utilizado ("unknown dataset"), ni el conjunto de etiquetas, ni el idioma de los datos, y el model-index no contiene resultados declarados. El repositorio registra 0 descargas y 0 likes en el momento de la consulta.

El unico dato de rendimiento fiable es la tabla de evaluacion incluida en la propia model card: F1 de 0,9063, precision de 0,8909, recall de 0,9222 y accuracy de 0,9814 en el conjunto de evaluacion, tras 10 epocas de entrenamiento con learning rate 2e-5 y batch de 16. La licencia MIT facilita su reutilizacion comercial, pero la falta de documentacion sobre datos y etiquetas limita seriamente su uso en produccion sin una validacion previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (heredada del modelo base BAAI/bge-small-en-v1.5); tarea de token classification |
| Parametros totales | 33.215.625 (dato real de safetensors, incluye el cabezal de clasificacion) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no especificada en la model card; el modelo base BAAI/bge-small-en-v1.5 emplea una longitud maxima de secuencia de 512 tokens |
| Tipos de cuantizacion | no disponible en la model card; al ser un encoder de 33 M de parametros admite fp16, int8 y ONNX con herramientas estandar (no documentado por el autor) |
| Idiomas soportados | no disponible; el modelo base es de ingles, pero no se especifica el idioma del dataset de ajuste |
| Licencia | MIT |
| Formato de pesos | safetensors (repo de 0,1 GB), compatible con la libreria transformers |
| Pipeline | token-classification |
| Modelo base | BAAI/bge-small-en-v1.5 (fine-tune) |
| Dataset de entrenamiento | no disponible ("unknown dataset" segun la model card) |
| Numero de etiquetas | no disponible |

## Arquitectura y entrenamiento

El modelo es un encoder BERT de tipo "small" (familia BAAI BGE, aproximadamente 33 M de parametros) al que se ha anadido un cabezal de clasificacion por token. No incorpora atencion lineal, decodificacion especulativa ni mecanismos MoE o SSM: es un transformer denso bidireccional estandar orientado a representaciones contextuales, reutilizado aqui para etiquetado secuencial en lugar de para embeddings o generacion. Al derivar de un modelo de embeddings de recuperacion, la cabeza de clasificacion se ha entrenado desde cero durante el fine-tuning.

El entrenamiento se realizo con el Trainer de transformers siguiendo hiperparametros explicitos: 10 epocas, learning rate 2e-5, batch de entrenamiento y evaluacion de 16, semilla 42, optimizador AdamW (variante fused, betas 0,9/0,999, epsilon 1e-8) y scheduler lineal. No se documenta el volumen de tokens, la composicion del dataset, ni si hubo fases de RLHF o DPO (no aplica en un modelo discriminativo de este tipo). El entrenamiento se detuvo de forma efectiva en la epoca 6 segun la tabla publicada: el mejor F1 se alcanza en la epoca 5 (0,9073) y la mejor perdida de validacion en la epoca 6 (0,1587), sin que la model card aclare el criterio de seleccion del checkpoint final. Versiones declaradas: transformers 5.16.1, PyTorch 2.11.0+cu128, datasets 4.8.5 y tokenizers 0.23.1.

## Capacidades

- Reconocimiento de entidades nombradas (NER) sobre texto: asigna una etiqueta a cada token de la secuencia de entrada.
- Clasificacion de tokens generica, siempre que las etiquetas coincidan con las del dataset de ajuste (desconocido).
- Ejecucion como pipeline `token-classification` de transformers, con salida de entidades agregadas (texto, tipo, offsets y score).
- Inferencia muy ligera: 33 M de parametros permiten ejecucion en CPU con latencias de milisegundos.
- No realiza generacion de texto: no es un modelo causal ni instruccional.
- No soporta tool calling ni function calling.
- No implementa modos de agente, planificacion ni razonamiento multi-paso.
- No dispone de capacidades multimodales (sin vision, audio ni OCR) ni modo "thinking".
- Capacidades multilingues: no disponibles; el modelo base es de ingles y el idioma del dataset de ajuste no se especifica.

## Casos de uso

- Extraccion de entidades en documentos administrativos: el modelo puede etiquetar campos clave (nombres, organismos, localizaciones) en contratos o expedientes escaneados y pasados por OCR, siempre que se valide que el esquema de etiquetas coincide con el del entrenamiento, hoy desconocido.
- Anonimizacion y cumplimiento del RGPD: deteccion de menciones de personas y organizaciones en textos internos para su enmascaramiento antes de almacenamiento o comparticion. La ventaja principal es que puede ejecutarse on-premise en CPU, sin enviar datos a terceros.
- Enriquecimiento de bases de conocimiento: procesado por lotes de articulos, actas o informes para poblar grafos de entidades y relaciones en pipelines de datos internos.
- Preprocesado para busqueda y recuperacion: indexacion de documentos con etiquetas de entidad que mejoren filtros y facetas, combinando el encoder BGE subyacente con la salida de clasificacion.
- Clasificacion de tickets de soporte: deteccion de nombres de producto, cliente o sistema mencionados en incidencias para enrutado automatico. Requiere validar previamente el conjunto de etiquetas del modelo.
- Procesamiento por lotes en servidores modestos: al ocupar menos de 0,15 GB en fp32, permite ejecutar NER de alta frecuencia en instancias sin GPU o compartir GPU con otros servicios.
- Base para experimentos academicos de NER: punto de partida reproducible (semilla 42, hiperparametros publicados) para comparar estrategias de fine-tuning en dominios concretos, reentrenando el cabezal con un dataset documentado.
- Deteccion de entidades en registros de logs o trazas de aplicaciones: extraccion de identificadores y componentes citados en texto libre para correlacionar incidencias.

## Benchmarks y rendimiento

El model-index del autor no contiene resultados (`results: []`). La unica evaluacion disponible es la incluida en el cuerpo de la model card, correspondiente al conjunto de evaluacion del dataset de entrenamiento (no identificado) y sin comparacion con otros modelos:

| Metrica | Valor (epoca final publicada) |
|---|---|
| Loss | 0,1587 |
| Precision | 0,8909 |
| Recall | 0,9222 |
| F1 | 0,9063 |
| Accuracy | 0,9814 |

Evolucion durante el entrenamiento, tal como figura en la model card:

| Epoca | Paso | Validation loss | Precision | Recall | F1 | Accuracy |
|---|---|---|---|---|---|---|
| 1.0 | 625 | 0,3528 | 0,7730 | 0,8223 | 0,7969 | 0,9629 |
| 2.0 | 1250 | 0,2244 | 0,8615 | 0,8933 | 0,8771 | 0,9763 |
| 3.0 | 1875 | 0,1831 | 0,8656 | 0,9093 | 0,8869 | 0,9785 |
| 4.0 | 2500 | 0,1691 | 0,8847 | 0,9172 | 0,9007 | 0,9806 |
| 5.0 | 3125 | 0,1673 | 0,8939 | 0,9212 | 0,9073 | 0,9810 |
| 6.0 | 3750 | 0,1587 | 0,8909 | 0,9222 | 0,9063 | 0,9814 |

Nota metodologica: las cifras de la tabla de entrenamiento se cortan en la epoca 6 mientras que la cabecera indica 10 epocas; no se documenta si las epocas 7 a 10 se ejecutaron, si se descartaron por sobreajuste o si la tabla esta truncada. No hay resultados de MMLU, HumanEval, GSM8K ni de benchmarks de NER estandar (CoNLL-2003, OntoNotes), ya que no son aplicables o no fueron publicados.

## Requisitos de hardware

- VRAM estimada: inferior a 0,2 GB en fp32 (33,2 M de parametros, aproximadamente 133 MB de pesos) y del orden de 70 MB en fp16. El consumo real dependera del tamano de lote y de las activaciones.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM. Una RTX 4090, A100 o H100 estan enormemente sobredimensionadas para este modelo; su uso tendria sentido solo para servir un volumen muy alto de peticiones en paralelo.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna e incluso en iGPU y en CPU (x86 o ARM) con latencias de decenas de milisegundos por secuencia de 512 tokens.
- Opciones de despliegue: pipeline `token-classification` de transformers (PyTorch), exportacion a ONNX con Optimum y ejecucion con ONNX Runtime, TorchScript, o un microservicio propio (FastAPI, Triton) con batching dinamico. vLLM, llama.cpp y Ollama estan orientados a modelos generativos o de embeddings y no cubren token-classification de forma nativa; no se ha probado ni documentado su uso con este checkpoint.
- Latencia y throughput: no publicados. Como referencia orientativa, un encoder de 33 M de parametros procesa una secuencia de 512 tokens en el orden de unidades a pocas decenas de milisegundos en CPU y en el orden de pocos milisegundos en GPU, con throughput alto si se agrupa en lotes.

## Comparativa con modelos similares

No se dispone de datos de benchmark comparativos en la informacion proporcionada, y la model card no identifica el dataset de evaluacion, por lo que no es posible establecer una comparacion cuantitativa fiable con alternativas. Como referencia cualitativa, la categoria equivalente seria la de encoders BERT "small" ajustados para NER (por ejemplo, `dslim/bert-base-NER`, sobre BERT-base de 110 M de parametros, o `Jean-Baptiste/roberta-large-ner-english`, de mayor tamano).

| Modelo | Parametros | Contexto | Dataset de ajuste | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| glebustim/bert-finetuned-ner | 33,2 M | no confirmado (base: 512 tokens) | no disponible | MIT | HuggingFace (0 descargas) |
| dslim/bert-base-NER | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | no disponible |
| Jean-Baptiste/roberta-large-ner-english | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Dataset de entrenamiento no identificado: se desconoce el dominio, el idioma y el conjunto de etiquetas. Sin esa informacion, no es posible garantizar que el modelo detecte las entidades que necesita un caso de uso concreto.
- Resultados de evaluacion sin contexto: el F1 de 0,9063 procede de un conjunto de evaluacion del propio entrenamiento, no de un benchmark publico, y no es comparable con cifras de CoNLL-2003 u OntoNotes.
- Riesgo de alucinacion de entidades: como cualquier modelo discriminativo, puede asignar etiquetas de entidad a fragmentos de texto que no corresponden a entidades reales, especialmente con dominios distintos al de entrenamiento.
- Ambiguedad en la model card: la cabecera declara 10 epocas pero la tabla solo muestra 6; se desconoce que checkpoint esta efectivamente publicado y cual fue el criterio de seleccion. Esto impide reproducir exactamente el resultado declarado.
- Idiomas: no disponible. El modelo base BAAI/bge-small-en-v1.5 esta orientado al ingles; se desconoce el comportamiento en castellano y no hay evidencia de evaluacion multilingue.
- Contexto limitado: si se confirma la ventana de 512 tokens del modelo base, los documentos largos requeriran troceado, con riesgo de partir entidades y de perder coherencia entre fragmentos.
- Licencia MIT: permite uso comercial, modificacion y redistribucion con atribucion de la licencia. Conviene verificar las condiciones del modelo base BAAI/bge-small-en-v1.5 (tambien MIT) y del dataset de ajuste, que no se identifica.
- Madurez: 0 descargas y 0 likes, creado en octubre de 2026. No hay evidencia de uso en produccion, ni issues, ni mantenimiento posterior a la publicacion.
- Para produccion se recomienda obligatoriamente reentrenar o al menos reevaluar con un conjunto etiquetado propio y establecido antes de desplegar el modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/glebustim/bert-finetuned-ner
- Modelo base: https://huggingface.co/BAAI/bge-small-en-v1.5
- Paper de referencia de la familia BGE (modelo base, no citado en la model card): https://arxiv.org/abs/2309.07597
- Repositorio o demo adicionales: no disponible en la informacion proporcionada.
