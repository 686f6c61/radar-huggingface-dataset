# ktsp/dl2-hw2

## Resumen

dl2-hw2 es un modelo de clasificacion de tokens (token classification) publicado por el usuario ktsp en HuggingFace. Se trata de un ajuste fino (fine-tune) del modelo BAAI/bge-small-en-v1.5, un encoder tipo BERT de aproximadamente 33,2 millones de parametros, al que se ha anadido una cabeza de clasificacion por token. El repositorio ocupa 0,1 GB y los pesos estan en formato safetensors, listos para cargarse con la libreria transformers.

El modelo no es generativo: no produce texto libre ni mantiene conversaciones, sino que asigna una etiqueta a cada token de una secuencia de entrada. Su utilidad practica depende por completo del conjunto de etiquetas con el que fue entrenado, que no se especifica en la model card (el campo "Training and evaluation data" aparece como "More information needed"). Esto limita seriamente su reutilizacion directa por parte de terceros, ya que sin conocer el mapeo id2label resulta dificil interpretar las predicciones.

La relevancia de esta ficha es limitada y de caracter tecnico: se trata de un artefacto con 0 descargas y 0 "likes", con una model card autogenerada por el Trainer de HuggingFace y sin documentacion sustantiva. Su interes esta en servir como referencia de un fine-tune pequeno y eficiente (33 M de parametros) sobre un encoder de recuperacion, con metricas de evaluacion declaradas (F1 0,9156 y accuracy 0,9824) y un procedimiento de entrenamiento reproducible a partir de los hiperparametros publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (transformer encoder bidireccional) con cabeza de clasificacion de tokens |
| Parametros totales | 33.215.625 (dato real de los pesos safetensors) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible (solo se publican pesos originales; sin variantes GGUF, GPTQ o AWQ) |
| Idiomas soportados | no disponible (el modelo base, BAAI/bge-small-en-v1.5, esta orientado a ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria transformers) |
| Tarea (pipeline) | token-classification |
| Modelo base | BAAI/bge-small-en-v1.5 (fine-tune) |
| Tamano del repositorio | 0,1 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-10-07 (segun metadatos del repositorio) |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder de tipo BERT, heredado del modelo base BAAI/bge-small-en-v1.5, con una cabeza de clasificacion de tokens anadida para la tarea de etiquetado de secuencias. No hay innovaciones tecnicas declaradas: ni atencion lineal, ni decodificacion especulativa, ni componentes MoE o SSM. El modelo base esta disenado originalmente para recuperacion de informacion (embeddings de frases), por lo que reutilizarlo como extractor de caracteristicas token a token es una eleccion poco convencional, aunque valida para tareas de etiquetado ligero.

El entrenamiento se realizo con el Trainer de HuggingFace durante 10 epocas completas, con 1.250 pasos por epoca (12.500 pasos en total con el learning rate programado), learning rate 2e-05, batch de entrenamiento y evaluacion de 8, semilla 42, optimizador AdamW con betas (0,9 / 0,999) y epsilon 1e-08 en su variante fused, y planificador de learning rate lineal. No se documenta el conjunto de datos utilizado (la model card lo describe como "an unknown dataset"), ni su tamano, composicion, idioma o dominio, ni si hubo una etapa de RLHF o DPO (lo cual es esperable que no la haya, dado que no es un modelo generativo). Tampoco se declara el numero de etiquetas ni el esquema de etiquetado. Las versiones de framework utilizadas fueron Transformers 5.18.0, PyTorch 2.11.0+cu130, Datasets 4.8.5 y Tokenizers 0.23.2.

## Capacidades

- Clasificacion de tokens (sequence labeling): asigna una etiqueta a cada token de la entrada. El conjunto concreto de etiquetas no se documenta en la informacion disponible.
- Extraccion de entidades y spans: adecuado para tareas de tipo NER, POS tagging o chunking sintactico, siempre que se conozca el mapeo de etiquetas del modelo.
- Codificacion contextual bidireccional: al derivar de un encoder BERT, produce representaciones contextuales por token que pueden reutilizarse como features en etapas posteriores.
- Inferencia muy ligera: 33,2 M de parametros permiten ejecucion en CPU con latencias de milisegundos en secuencias cortas.
- No dispone de generacion de texto, razonamiento, codigo, matematicas ni capacidades multimodales (vision o audio).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Capacidades multilingues: no disponibles en la informacion proporcionada; el modelo base esta orientado a ingles.
- No dispone de modo "thinking" ni de ninguna capacidad especial declarada.

## Casos de uso

- Extraccion de entidades en documentos corporativos: se puede aplicar sobre contratos, facturas o informes para etiquetar spans de interes (fechas, importes, nombres de organizacion), siempre que el esquema de etiquetas del modelo coincida con el dominio de destino. Su tamano reducido permite procesar lotes grandes en CPU sin coste elevado.
- Deteccion y anonimizacion de datos personales (PII): el modelo puede marcar tokens correspondientes a nombres, direcciones o identificadores en textos antes de almacenarlos o enviarlos a terceros. La tarea es exactamente de etiquetado por token, aunque requiere verificar que el conjunto de etiquetas entrenado incluya las categorias de PII relevantes.
- Preprocesado para pipelines de busqueda: etiquetar tokens en consultas y documentos para extraer palabras clave y spans relevantes que alimenten un indice invertido o un motor de recuperacion, reduciendo el ruido en la fase de ranking.
- Analisis de resenas y voz del cliente: extraer atributos de producto (marca, modelo, caracteristica mencionada) de resenas en texto plano para agregarlos en dashboards de producto, aprovechando que el modelo es lo bastante pequeno como para ejecutarse en streaming sobre volumenes altos.
- Etiquetado linguistico en pipelines de PLN: POS tagging o chunking como etapa previa a un analizador sintactico o a un sistema de reglas, sustituyendo herramientas basadas en diccionarios cuando se dispone de datos etiquetados del dominio.
- Enrutado y clasificacion de tickets de soporte: identificar spans concretos (producto, version, codigo de error) dentro de un ticket para enrutarlo al equipo adecuado o activar reglas automaticas, integrándolo como microservicio detras de una API.
- Filtrado previo en moderacion de contenido: marcar tokens concretos de una publicacion para que un modelo mayor o una revision humana tomen la decision final, reduciendo el coste computacional de la primera pasada.
- Anotacion asistida (pre-etiquetado): usar el modelo para generar propuestas de etiquetas que despues revise un anotador humano, acelerando la creacion de nuevos datasets de NER especificos del dominio.

## Benchmarks y rendimiento

La model card declara resultados sobre un conjunto de evaluacion cuyo nombre, tamano y composicion no se especifican. El array model-index del autor esta vacio, por lo que las unicas cifras disponibles son las del informe de entrenamiento del Trainer.

| Metrica | Valor en la evaluacion final (epoca 10) |
|---|---|
| Loss | 0,0871 |
| Precision | 0,9057 |
| Recall | 0,9258 |
| F1 | 0,9156 |
| Accuracy | 0,9824 |

Evolucion durante el entrenamiento:

| Epoca | Paso | Training loss | Validation loss | Precision | Recall | F1 | Accuracy |
|---|---|---|---|---|---|---|---|
| 1 | 1250 | 0,1446 | 0,1313 | 0,8043 | 0,8718 | 0,8367 | 0,9699 |
| 2 | 2500 | 0,0854 | 0,0932 | 0,8789 | 0,9063 | 0,8924 | 0,9785 |
| 3 | 3750 | 0,0516 | 0,0844 | 0,8810 | 0,9145 | 0,8974 | 0,9792 |
| 4 | 5000 | 0,0379 | 0,0886 | 0,8905 | 0,9263 | 0,9080 | 0,9800 |
| 5 | 6250 | 0,0222 | 0,0818 | 0,8981 | 0,9253 | 0,9115 | 0,9817 |
| 6 | 7500 | 0,0236 | 0,0822 | 0,8981 | 0,9251 | 0,9114 | 0,9816 |
| 7 | 8750 | 0,0340 | 0,0843 | 0,8993 | 0,9243 | 0,9116 | 0,9815 |
| 8 | 10000 | 0,0116 | 0,0840 | 0,9092 | 0,9246 | 0,9168 | 0,9826 |
| 9 | 11250 | 0,0137 | 0,0855 | 0,9033 | 0,9261 | 0,9146 | 0,9821 |
| 10 | 12500 | 0,0196 | 0,0871 | 0,9057 | 0,9258 | 0,9156 | 0,9824 |

El mejor F1 se alcanza en la epoca 8 (0,9168) y a partir de ahi la mejora se estanca, con un ligero aumento de la validation loss en las dos ultimas epocas. No hay comparacion con otros modelos publicada por el autor, ni resultados sobre benchmarks estandar (MMLU, GLUE, CoNLL-2003, etc.).

## Requisitos de hardware

- VRAM estimada en fp32: aproximadamente 133 MB solo para los pesos, mas activaciones y batch; en la practica menos de 1 GB para lotes pequenos.
- VRAM estimada en fp16/bf16: aproximadamente 66 MB de pesos.
- VRAM estimada en int8: aproximadamente 33 MB de pesos (requiere cuantizacion manual; no se publican checkpoints cuantizados).
- GPU recomendadas: cualquier GPU con 2 GB o mas de memoria, incluidas GTX 1650, RTX 3060, RTX 4090, T4, L4, A10G, A100 y H100. En ningun caso el modelo es el factor limitante de memoria.
- Cabe holgadamente en GPU de consumo: si, en cualquier GPU consumer moderna, e incluso en iGPU o en CPU pura con latencias aceptables para secuencias cortas.
- Opciones de despliegue: pipeline de transformers, serializacion con TorchScript, exportacion a ONNX Runtime, y HuggingFace Inference Endpoints (el repositorio esta marcado como endpoints_compatible). No es compatible con llama.cpp, Ollama o vLLM en su modo generativo habitual, al no ser un modelo causal de generacion de texto.
- Latencia y throughput estimados: no disponibles. Al tratarse de 33 M de parametros y secuencias cortas, se espera un throughput alto en GPU y varios cientos de inferencias por segundo en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ktsp/dl2-hw2 | 33,2 M | Clasificacion de tokens | no disponible | MIT | HuggingFace, 0 descargas |
| BAAI/bge-small-en-v1.5 (modelo base) | ~33 M | Embeddings de frases / recuperacion | no disponible en esta ficha | MIT declarada en su propio repositorio | HuggingFace, ampliamente utilizado |
| dslim/bert-base-NER | ~110 M | NER (PER, ORG, LOC, MISC) | no disponible en esta ficha | MIT | HuggingFace, muy utilizado |

La comparacion cuantitativa de rendimiento no es posible: no hay resultados de dl2-hw2 sobre benchmarks estandar, y las cifras declaradas corresponden a un conjunto de evaluacion propio sin descripcion. Frente al modelo base, dl2-hw2 anade una cabeza de clasificacion de tokens, lo que cambia por completo el uso previsto (el base genera embeddings, no etiquetas). Frente a dslim/bert-base-NER, dl2-hw2 es aproximadamente tres veces mas pequeno y por tanto mas barato de servir, pero carece de un esquema de etiquetas documentado y publico, que es precisamente la ventaja de bert-base-NER.

## Limitaciones y advertencias

- Conjunto de datos de entrenamiento desconocido: la model card indica explicitamente "an unknown dataset" y deja sin completar las secciones de descripcion, usos previstos y datos de evaluacion.
- Esquema de etiquetas no documentado: sin conocer el mapeo id2label del config.json, las predicciones no son interpretables ni reutilizables. No se puede asumir que las etiquetas coincidan con un esquema estandar de NER.
- Model card autogenerada: el propio texto reconoce que fue generada automaticamente por el Trainer y que deberia revisarse y completarse, lo que no se ha hecho.
- Riesgo de sobreajuste a un dominio concreto: el F1 se estanca a partir de la epoca 8 y la validation loss repunta ligeramente en las dos ultimas, senal habitual de ajuste fino prolongado sobre un dataset pequeno.
- Alucinacion: no aplica en el sentido generativo, ya que el modelo no produce texto libre; el riesgo equivalente es la asignacion erronea de etiquetas en tokens ambiguos.
- Sesgos: no disponibles. No hay evaluacion de sesgos ni documentacion sobre la composicion del dataset.
- Idiomas: no disponibles. El modelo base esta orientado a ingles, por lo que es razonable esperar un rendimiento pobre en castellano u otros idiomas, aunque esto no se confirma en la informacion proporcionada.
- Longitud de contexto: no disponible en la informacion proporcionada; conviene consultar el config.json del modelo para conocer el max_position_embeddings efectivo.
- Uso comercial: la licencia declarada es MIT, que permite uso comercial. Aun asi, conviene verificar los terminos del modelo base BAAI/bge-small-en-v1.5 antes de desplegarlo en produccion.
- Reproducibilidad en produccion: al no documentarse el dataset ni el mapeo de etiquetas, no es posible reproducir el entrenamiento ni auditar el comportamiento del modelo.
- Metadatos anomales: la fecha de creacion declarada (2026-10-07) es posterior a la fecha actual, lo que sugiere un reloj mal configurado o un error en los metadatos del repositorio.
- Ausencia de validacion externa: 0 descargas y 0 "likes" implican que no hay evidencia de uso en la comunidad ni informes independientes de rendimiento.
- No apto para tareas generativas: no debe emplearse para chat, resumen, traduccion ni generacion de codigo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ktsp/dl2-hw2
- Modelo base BAAI/bge-small-en-v1.5: https://huggingface.co/BAAI/bge-small-en-v1.5
- Paper, blog o repositorio del autor: no disponible
- Demo o espacio asociado: no disponible
- Datos de entrenamiento o evaluacion: no disponibles
