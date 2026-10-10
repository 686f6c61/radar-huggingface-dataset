# morz1k3/hw02-bge-ner

## Resumen

hw02-bge-ner es un modelo de clasificación de tokens (token classification) publicado por el usuario morz1k3 en HuggingFace, obtenido mediante fine-tuning del encoder BAAI/bge-small-en-v1.5. Con 33.215.625 parámetros, es un transformer encoder-only de tipo BERT, de tamano pequeno y pensado para tareas de etiquetado a nivel de token, presumiblemente reconocimiento de entidades nombradas (NER) a juzgar por el sufijo del nombre. Su relevancia practica es limitada: el repositorio acumula 0 descargas y 0 likes, y la propia model card no documenta el dataset, la taxonomia de entidades ni los usos previstos.

El modelo declara metricas de evaluacion razonables sobre un conjunto no identificado (F1 0.8985, precision 0.8797, recall 0.9180, accuracy 0.9799) tras seis epochs de entrenamiento, pero no publica ningun resultado en benchmarks estandar (MMLU, CoNLL-2003, etc.). El model-index del repositorio esta vacio, por lo que no hay comparacion reproducible con alternativas.

En la practica, debe considerarse un artefacto de tipo academico o de ejercicio (el prefijo "hw02" sugiere una tarea de curso) mas que un componente listo para produccion. Su licencia MIT y su formato safetensors lo hacen tecnicamente reutilizable, pero la ausencia de informacion sobre datos de entrenamiento, idioma y esquema de etiquetas obliga a validarlo y documentarlo antes de cualquier despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only tipo BERT (tag `bert`), derivado de BAAI/bge-small-en-v1.5 |
| Parametros totales | 33.215.625 |
| Longitud de contexto | 512 tokens (valor habitual del modelo base; no confirmado en la informacion proporcionada) |
| Tipos de cuantizacion | No disponible. El repositorio solo incluye pesos en safetensors (precision original, presumiblemente FP32); no se publican variantes GGUF, INT8 ni AWQ/GPTQ |
| Idiomas soportados | No disponible. El modelo base BAAI/bge-small-en-v1.5 es de proposito general con foco en ingles |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Pipeline | token-classification |
| Libreria | transformers |
| Tamano del repositorio | 0.1 GB |
| Modelo base | BAAI/bge-small-en-v1.5 |
| Fecha de creacion | 2026-10-09 (segun metadatos de HuggingFace) |
| Ultima actualizacion | 2026-10-09 (segun metadatos de HuggingFace) |

## Arquitectura y entrenamiento

La arquitectura es la de BAAI/bge-small-en-v1.5, un encoder transformer de tipo BERT con cabeza de clasificacion de tokens anadida durante el fine-tuning. Con 33,2 millones de parametros, se situa en el rango "small": suficiente para tareas de etiquetado secuencial con recursos muy modestos, pero con menor capacidad de representacion que los encoders base (110 M) o large (340 M). No se describe ninguna innovacion tecnica: no hay atencion lineal, decodificacion especulativa, mezcla de expertos ni componentes híbridos.

El entrenamiento se realizo con los siguientes hiperparametros declarados: learning rate 2e-05, batch de 16 tanto en entrenamiento como en evaluacion, semilla 42, optimizador AdamW con betas (0.9, 0.999) y epsilon 1e-08, scheduler lineal y 6 epochs, lo que suma 3750 pasos (625 por epoch, equivalentes a unos 10.000 ejemplos por epoch si no se aplico acumulacion de gradientes). No hay informacion sobre el dataset empleado ("unknown dataset" en la model card), la composicion de los datos, el esquema de etiquetas ni si se aplicaron tecnicas de alineacion como RLHF o DPO, que no son habituales en modelos discriminativos de este tipo. Las versiones de framework declaradas son Transformers 4.50.0, PyTorch 2.11.0+cu128, Datasets 3.4.1 y Tokenizers 0.21.4.

## Capacidades

- Clasificacion de tokens a nivel de secuencia, orientada a reconocimiento de entidades nombradas (NER) y tareas equivalentes de etiquetado (POS tagging, chunking, deteccion de PII), siempre que se defina un esquema de etiquetas compatible.
- Salida de logits por token y etiqueta; no genera texto libre ni mantiene decodificacion autorregresiva.
- No dispone de soporte documentado de tool calling ni function calling.
- No dispone de capacidades agenticas ni de razonamiento multi-paso: es un modelo discriminativo de una sola pasada.
- Capacidades multilingues: no disponibles. Al derivar de un modelo base con foco en ingles, el comportamiento fuera del ingles no esta garantizado ni evaluado.
- No hay modo "thinking", vision, audio ni ninguna capacidad multimodal.
- No se documenta la lista de etiquetas (id2label) entrenadas, por lo que la semantica exacta de las salidas debe inspeccionarse en el `config.json` del repositorio.

## Casos de uso

- Extraccion de entidades en documentos: aplicar el modelo sobre parrafos tokenizados para recuperar personas, organizaciones, lugares o fechas, siempre que se verifique primero el esquema de etiquetas con el que fue entrenado.
- Enriquecimiento de bases de datos y catalogos: procesar lotes de textos (informes, tickets, correos) para poblar campos estructurados y habilitar busquedas por entidad.
- Anonimizacion y deteccion de PII en logs: dada su velocidad potencial en CPU, encaja en pipelines previos al almacenamiento que sustituyan nombres o identificadores por marcadores.
- Preprocesado para RAG: extraer entidades y metadatos de los chunks antes de indexarlos en un almacen vectorial, mejorando el filtrado por metadatos en la recuperacion.
- Moderacion y triaje de contenido: clasificar tokens sensibles o entidades de riesgo en colas de revision humana, con umbral de confianza ajustable.
- Prototipado academico y experimentacion: por tamano (33 M de parametros) y licencia MIT, sirve como punto de partida barato para comparar estrategias de fine-tuning sobre BERT small.
- Servicio de etiquetado en tiempo real en el borde: al caber en menos de 1 GB en FP32 y en decenas de MB en INT8, es viable en contenedores pequenos o incluso en dispositivos con CPU, siempre que la latencia medida cumpla el SLA.
- Todos estos escenarios requieren validacion previa: no hay documentacion sobre el dataset de entrenamiento ni evaluacion sobre un benchmark publico que respalde el rendimiento fuera del conjunto de evaluacion privado.

## Benchmarks y rendimiento

El model-index oficial del repositorio no contiene resultados (`results: []`). No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K, CoNLL-2003, GLUE u otros) en la informacion disponible.

Las unicas cifras existentes son las de evaluacion interna sobre un conjunto no identificado, tambien declaradas por el autor:

| Metrica (conjunto de evaluacion, dataset no identificado) | Valor |
|---|---|
| Loss | 0.0855 |
| Precision | 0.8797 |
| Recall | 0.9180 |
| F1 | 0.8985 |
| Accuracy | 0.9799 |

Evolucion por epoch:

| Training loss | Epoch | Step | Validation loss | Precision | Recall | F1 | Accuracy |
|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| 0.4829 | 1.0 | 625 | 0.1813 | 0.7643 | 0.8125 | 0.7877 | 0.9613 |
| 0.1761 | 2.0 | 1250 | 0.1164 | 0.8577 | 0.8879 | 0.8726 | 0.9758 |
| 0.1207 | 3.0 | 1875 | 0.0968 | 0.8544 | 0.9076 | 0.8802 | 0.9769 |
| 0.0750 | 4.0 | 2500 | 0.0882 | 0.8776 | 0.9132 | 0.8950 | 0.9800 |
| 0.0640 | 5.0 | 3125 | 0.0861 | 0.8807 | 0.9165 | 0.8982 | 0.9798 |
| 0.0553 | 6.0 | 3750 | 0.0855 | 0.8797 | 0.9180 | 0.8985 | 0.9799 |

Lectura de los datos: la mejora se concentra en las tres primeras epochs y se aplana a partir de la cuarta; la separacion entre perdida de entrenamiento (0.0553) y de validacion (0.0855) sugiere un sobreajuste leve, no critico, coherente con un dataset pequeno. La accuracy es poco informativa en tareas de etiquetado con clases desbalanceadas (la clase mayoritaria suele ser "O"), por lo que el F1 de 0.8985 es la referencia relevante, siempre condicionada al desconocimiento del conjunto de evaluacion.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,13 GB en FP32 (133 MB de pesos), unos 0,07 GB en FP16/BF16 y unos 0,03 GB en INT8, mas activaciones y buffers, que a 512 tokens son del orden de decenas de megabytes. En la practica, el modelo opera con comodidad por debajo de 1 GB.
- GPU recomendadas: cualquiera con al menos 2 GB de VRAM. Una RTX 3060, RTX 4090, T4 o L4 estan sobredimensionadas para este modelo; A100 o H100 solo tendrian sentido por agregacion de peticiones en lote, no por requisitos de memoria.
- Cabe en GPU de consumo: si, en cualquier GPU de consumo moderna e incluso en graficas integradas con soporte CUDA/ROCm. Tambien es viable en CPU pura.
- Opciones de despliegue: pipeline `token-classification` de Transformers, exportacion a ONNX con Optimum y ejecucion con ONNX Runtime, TorchScript, o un servicio propio con FastAPI y batching dinamico. El repositorio esta marcado como `endpoints_compatible`, por lo que puede desplegarse en Hugging Face Inference Endpoints. vLLM, llama.cpp y Ollama no son opciones aplicables: estan orientadas a modelos generativos y no cubren clasificacion de tokens, y no se publican pesos en formato GGUF.
- Latencia y throughput: no disponible. No se publican mediciones. Dado el tamano (33,2 M de parametros), cualquier cifra concreta de latencia o tokens por segundo debe obtenerse midiendo sobre el hardware objetivo; el modelo no incluye ninguna optimizacion declarada (cuantizacion, destilacion o kernel especifico).

## Comparativa con modelos similares

No hay datos de benchmarks publicados para este modelo, por lo que la comparacion de rendimiento no es posible. La tabla recoge caracteristicas estructurales; las cifras de los modelos alternativos proceden de sus fichas publicas y no equivalen a una evaluacion sobre un conjunto comun.

| Modelo | Parametros | Contexto | Licencia | Idioma principal | Tipo |
|---|---|---|---|---|---|
| morz1k3/hw02-bge-ner | 33,2 M | 512 (segun modelo base) | MIT | No disponible | Fine-tune de BGE-small para token classification |
| BAAI/bge-small-en-v1.5 (modelo base) | 33,2 M | 512 | MIT | Ingles | Encoder de embeddings de texto, no NER |
| dslim/bert-base-NER | ~108 M | 512 | MIT | Ingles | Encoder BERT fine-tuneado para NER (CoNLL-2003) |
| Jean-Baptiste/roberta-large-ner-english | ~355 M | 512 | No disponible | Ingles | Encoder RoBERTa large fine-tuneado para NER |

Consideraciones: frente a las alternativas, este modelo ofrece el menor coste computacional (una tercera parte de parametros que bert-base-NER y una decima parte que roberta-large-ner-english) a cambio de una capacidad de representacion menor y, sobre todo, de una documentacion y validacion mucho mas pobres. Si el requisito es un NER en ingles listo para produccion con historial de uso, las alternativas establecidas son opciones mas seguras; si el requisito es un prototipo minimo o un ejercicio academico, este modelo es suficiente.

## Limitaciones y advertencias

- Dataset de entrenamiento desconocido: la model card indica explicitamente "unknown dataset" y "More information needed" en las secciones de descripcion, usos previstos, limitaciones y datos. No es posible auditar la procedencia, el equilibrio de clases ni los posibles sesgos de los datos.
- Esquema de entidades no documentado: se desconoce que etiquetas aprende el modelo y en que formato. Sin inspeccionar el `config.json` y validar con ejemplos propios, cualquier uso en produccion es a ciegas.
- Riesgo de alucinacion no aplicable en el sentido generativo (el modelo no produce texto), pero si existe riesgo de falsos positivos y negativos en el etiquetado, con una precision de 0.8797 y un recall de 0.9180 medidos sobre un conjunto no identificado.
- Idiomas: no confirmados. El modelo base esta orientado al ingles; el rendimiento en castellano u otros idiomas no esta evaluado y probablemente sea pobre sin un fine-tuning especifico.
- Limite de contexto: presumiblemente 512 tokens, lo que obliga a fragmentar documentos largos y a gestionar entidades que cruzan fronteras de fragmento.
- Trazas de sobreajuste: la perdida de validacion (0.0855) es superior a la de entrenamiento (0.0553) al final del entrenamiento, lo que apunta a un dataset de tamano reducido y a una capacidad de generalizacion no verificada.
- Ausencia de adopcion: 0 descargas y 0 likes. No hay evidencia de uso en produccion ni de validacion por terceros.
- Licencia: MIT, permisiva y compatible con uso comercial, pero la licencia del artefacto no cubre los derechos sobre los datos de entrenamiento, que se desconocen. Si el dataset contuviera datos personales o material con licencia restrictiva, la responsabilidad recae en quien despliegue el modelo.
- Metadatos anomalos: las fechas de creacion y actualizacion (2026) son posteriores a la fecha actual de referencia, lo que refuerza la consideracion de artefacto no curado.
- Uso en produccion: no recomendado sin una evaluacion propia sobre un conjunto de validacion representativo del dominio objetivo, con especial atencion a la clase mayoritaria y a las metricas por entidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/morz1k3/hw02-bge-ner
- Modelo base: https://huggingface.co/BAAI/bge-small-en-v1.5
- Paper de BGE (BAAI General Embedding): no disponible en la informacion proporcionada
- Repositorio de codigo o demo: no disponible
- Resultados de la busqueda web: no se han encontrado enlaces relevantes al modelo. Las busquedas devolvieron unicamente paginas sobre la banda sonora de la pelicula "The Good Nurse" (2022), sin relacion con este repositorio.
