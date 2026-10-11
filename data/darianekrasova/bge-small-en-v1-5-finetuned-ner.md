# DariaNekrasova/bge-small-en-v1.5-finetuned-ner

## Resumen

El modelo `DariaNekrasova/bge-small-en-v1.5-finetuned-ner` es un ajuste fino del encoder `BAAI/bge-small-en-v1.5` para reconocimiento de entidades nombradas (NER), publicado en Hugging Face por la usuaria DariaNekrasova bajo licencia MIT. Se distribuye como clasificador de tokens (`token-classification`) con pesos en safetensors y 33.215.625 parametros, lo que lo situa en la gama ligera: el repositorio ocupa 0,1 GB y puede ejecutarse en CPU o en cualquier GPU de consumo.

El punto de partida es un encoder tipo BERT de la familia BGE v1.5, al que se anade una cabeza de clasificacion por token. La model card no documenta el conjunto de datos de entrenamiento ("unknown dataset"), el esquema de etiquetas ni los idiomas soportados, por lo que se trata de un artefacto con trazabilidad limitada, generado automaticamente por el `Trainer` de Transformers.

Su interes es practico: con las metricas declaradas por el autor en su conjunto de evaluacion (F1 0,9118, precision 0,8997, recall 0,9243, exactitud 0,9815) es un candidato razonable para extraccion de entidades en entornos con recursos escasos, siempre que se valide el etiquetado contra un corpus propio antes de usarlo en produccion. El modelo acumula 0 descargas y 0 "likes", por lo que carece de validacion externa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (familia BERT/BGE v1.5) con cabeza de clasificacion de tokens |
| Parametros totales | 33.215.625 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible en la informacion proporcionada; el repositorio solo incluye safetensors |
| Idiomas soportados | No disponible (el modelo base es de proposito general con foco en ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria transformers) |
| Tarea (pipeline) | token-classification (NER) |
| Modelo base | BAAI/bge-small-en-v1.5 |
| Tamano del repositorio | 0,1 GB |
| Fecha de creacion / actualizacion | 2026-10-11 / 2026-10-11 |

## Arquitectura y entrenamiento

Se trata de un ajuste fino supervisado de un encoder bidirectional sobre una tarea de etiquetado por token. El modelo base, `BAAI/bge-small-en-v1.5`, es un encoder de la familia BGE v1.5 orientado a embeddings de texto; aqui se sustituye la cabeza de representacion por una capa de clasificacion que emite una etiqueta por token. El resultado son 33,2 M de parametros, sin componentes generativos ni decoder.

Los hiperparametros documentados en la model card son: learning rate 2e-05, batch de entrenamiento y evaluacion de 8, 10 epocas configuradas, scheduler lineal, optimizador AdamW (betas 0,9/0,999, epsilon 1e-08) con los argumentos por defecto, y semilla 42. El entrenamiento se ejecuto con Transformers 4.50.0, PyTorch 2.11.0+cu128, Datasets 4.8.5 y Tokenizers 0.21.1. No se especifica composicion del dataset, numero de tokens de entrenamiento, ni si hubo fases de RLHF/DPO (poco habituales en un clasificador de este tipo). Tampoco se publica la matriz de confusion ni el numero de etiquetas del esquema NER. La tabla de entrenamiento se corta en la epoca 7 pese a declarar 10 epocas, y las metricas de cabecera de la model card coinciden con esa fila.

## Capacidades

- Reconocimiento de entidades nombradas: clasificacion por token sobre texto de entrada, con la salida en el esquema de etiquetas definido por el autor (no documentado).
- Clasificacion de secuencias a nivel de token, no generacion de texto: no produce lenguaje, solo etiquetas.
- Soporte de tool calling / function calling: no disponible (no es un modelo generativo ni conversacional).
- Soporte de agentes y razonamiento multi-paso: no disponible; el modelo no tiene capacidad de planificacion ni de llamada a herramientas.
- Capacidades multilingues: no declaradas. El modelo base esta orientado a texto en ingles; el comportamiento en castellano no esta verificado.
- Capacidad especial: ninguna documentada (sin modo "thinking", vision ni audio).
- Inferencia muy ligera: 33,2 M de parametros permiten lotes grandes en CPU y latencias bajas en GPU pequeñas.

## Casos de uso

- Extraccion de entidades en documentos corporativos: deteccion de nombres de persona, organizacion y lugar en contratos o informes para poblar indices de busqueda; el tamano reducido permite procesar millones de documentos en CPU sin GPU dedicada.
- Anonimizado de datos personales (PII): al ser un clasificador de tokens, puede usarse como paso previo a un enmascarado de nombres propios en registros clinicos o legales; requiere validar el esquema de etiquetas frente a los tipos de entidad realmente necesarios.
- Enriquecimiento de tickets de soporte y CRM: extraer entidades de conversaciones y volcarlas a campos estructurados para enrutado automatico o analitica, con coste de inferencia bajo frente a un LLM generativo.
- Pre-anotacion para equipos de etiquetado humano: generar propuestas de etiquetas que despues se revisan en herramientas tipo Label Studio o Prodigy, reduciendo el tiempo de anotacion.
- Filtrado y moderacion de contenido: deteccion de entidades concretas (por ejemplo, nombres de personas o marcas) para aplicar reglas de bloqueo o marcado antes de publicar.
- Analisis de corpus periodisticos o academicos: extraccion de redes de actores y organizaciones a escala de corpus completo, aprovechando el bajo coste por documento.
- Despliegue on-premise o en el borde: su tamano permite empaquetarlo en contenedores pequenos o incluso en entornos sin GPU, algo inviable con modelos de cientos de millones de parametros.
- Componente en pipelines RAG: identificar entidades en la consulta del usuario para filtrar metadatos antes de la recuperacion, siempre que se documente el esquema de etiquetas empleado.

## Benchmarks y rendimiento

Resultados declarados por el autor en el conjunto de evaluacion (unico dato disponible; se desconoce el dataset, el numero de ejemplos y el esquema de etiquetas):

| Metrica | Valor |
|---|---|
| Loss | 0,0845 |
| Precision | 0,8997 |
| Recall | 0,9243 |
| F1 | 0,9118 |
| Accuracy | 0,9815 |

Evolucion por epoca reportada en la model card:

| Epoca | Step | Validation loss | Precision | Recall | F1 | Accuracy |
|---|---|---|---|---|---|---|
| 1,0 | 1250 | 0,1313 | 0,8043 | 0,8718 | 0,8367 | 0,9699 |
| 2,0 | 2500 | 0,0932 | 0,8795 | 0,9066 | 0,8928 | 0,9785 |
| 3,0 | 3750 | 0,0844 | 0,8812 | 0,9147 | 0,8976 | 0,9793 |
| 4,0 | 5000 | 0,0885 | 0,8905 | 0,9263 | 0,9080 | 0,9800 |
| 5,0 | 6250 | 0,0817 | 0,8985 | 0,9254 | 0,9118 | 0,9817 |
| 6,0 | 7500 | 0,0822 | 0,8991 | 0,9253 | 0,9120 | 0,9816 |
| 7,0 | 8750 | 0,0845 | 0,8997 | 0,9243 | 0,9118 | 0,9815 |

No hay resultados comparativos con otros modelos en la informacion disponible, y el campo `model-index` de la model card esta vacio. No se han publicado resultados en benchmarks publicos estandar (CoNLL-2003, OntoNotes, MultiNERD u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en fp32: aproximadamente 133 MB solo para pesos (33.215.625 x 4 bytes), mas activaciones; en la practica, por debajo de 1 GB.
- VRAM estimada en fp16/bf16: aproximadamente 66 MB de pesos.
- VRAM estimada con cuantizacion dinamica int8: aproximadamente 33 MB de pesos.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; una T4, RTX 3060 o superior ofrece un margen amplio. Modelos como A100 o H100 no aportan ventaja significativa por el tamano del modelo.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo y tambien en CPU moderna (inferencia viable sin acelerador).
- Opciones de despliegue: `transformers` con `pipeline("token-classification")` es la via directa; exportacion a ONNX Runtime o TorchScript es habitual para reducir latencia; no se documenta soporte especifico en vLLM, TGI, llama.cpp u Ollama para esta tarea (estas herramientas estan orientadas a generacion o embeddings).
- Latencia y throughput: no disponible. Como referencia estructural, un encoder de 33 M de parametros suele procesar lotes de decenas de secuencias por segundo en CPU y varios cientos en GPU, pero no hay mediciones publicadas para este modelo concreto.

## Comparativa con modelos similares

Los datos de los modelos alternativos corresponden a documentacion publica de sus repositorios y no se han verificado en esta ficha; las metricas de NER de los modelos comparados no estan disponibles en la informacion proporcionada.

| Modelo | Parametros | Contexto | Tarea | Licencia | F1 declarado |
|---|---|---|---|---|---|
| bge-small-en-v1.5-finetuned-ner (este modelo) | 33,2 M | No disponible | NER | MIT | 0,9118 (evaluacion propia, dataset no documentado) |
| BAAI/bge-small-en-v1.5 (modelo base) | 33,2 M | No disponible en esta ficha | Embeddings de texto | MIT | No aplica |
| BAAI/bge-base-en-v1.5 | No disponible en esta ficha (segun documentacion publica, en torno a 109 M) | No disponible en esta ficha | Embeddings de texto | MIT | No aplica |
| dslim/bert-base-NER | No disponible en esta ficha (segun documentacion publica, en torno a 110 M) | No disponible en esta ficha | NER (CoNLL-2003) | No disponible en esta ficha | No disponible en la informacion proporcionada |

No se dispone de comparativas de rendimiento verificables ni de otros ajustes NER de la familia BGE-small documentados en la informacion proporcionada.

## Limitaciones y advertencias

- Dataset de entrenamiento desconocido: no se puede saber que tipos de entidad reconoce ni con que distribucion de dominios, lo que invalida cualquier uso directo sin evaluacion previa.
- Esquema de etiquetas no publicado: se desconoce si usa BIO, BILOU u otro formato y cuantos tipos de entidad maneja; integrarlo exige inspeccionar `config.json` y el mapeo `id2label`.
- Idiomas no declarados: el modelo base esta orientado a ingles; el rendimiento en castellano u otras lenguas no esta verificado y probablemente sea inferior.
- Metricas sin contexto experimental: se desconoce el tamano y la procedencia del conjunto de evaluacion, por lo que los valores de F1, precision y recall no son extrapolables a produccion.
- Senales de sobreajuste: la perdida de validacion alcanza su minimo en la epoca 5 (0,0817) y sube despues (0,0845 en la epoca 7), mientras la perdida de entrenamiento sigue bajando (0,0281 en la epoca 7); el checkpoint final no es el de mejor F1 (0,9120 en la epoca 6 frente a 0,9118 en la epoca 7).
- Sesgos: al desconocerse el corpus de entrenamiento, no se puede evaluar el sesgo en nombres propios, geografia, genero o variantes dialectales; es esperable que herede los sesgos del modelo base.
- Riesgo de falsos positivos y negativos: es un clasificador, no un generador, por lo que no "alucina" texto, pero puede asignar entidades incorrectas con alta confianza, especialmente fuera del dominio de entrenamiento.
- Sin validacion de la comunidad: 0 descargas y 0 "likes" en el momento de la consulta, sin issues ni discusiones publicas.
- Model card incompleta: generada automaticamente y con secciones marcadas como "More information needed"; el campo `model-index` no contiene resultados.
- Fechas atipicas: creacion y actualizacion declaradas en 2026-10-11, poco coherentes con el estado del repositorio; conviene verificar la procedencia del artefacto.
- Licencia: MIT permite uso comercial y modificacion, pero conviene confirmar que el modelo base y los datos de ajuste no imponen restricciones adicionales; al no documentarse el dataset, esta comprobacion no es posible con la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DariaNekrasova/bge-small-en-v1.5-finetuned-ner
- Modelo base BAAI/bge-small-en-v1.5: https://huggingface.co/BAAI/bge-small-en-v1.5
- Paper de la familia BGE (C-Pack: Packed Resources For General Chinese Embeddings): https://arxiv.org/abs/2309.07597
- Documentacion de Transformers sobre token classification: https://huggingface.co/docs/transformers/tasks/token_classification
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos corresponden a paginas sobre simbolos de linea Unicode y no guardan relacion con esta ficha.
