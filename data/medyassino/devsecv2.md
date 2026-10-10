# Medyassino/devSECV2

## Resumen

devSECV2 es un modelo de clasificacion de texto de tipo binario desarrollado por Mohamed Yassine Bouneb (usuario Medyassino en HuggingFace). Se trata de un fine-tuning de Medyassino/secopv2, a su vez basado en la arquitectura ModernBERT, con aproximadamente 149,6 millones de parametros (en torno a 0,1B) y publicado bajo licencia Apache 2.0. El modelo resuelve una tarea muy concreta: decidir si dos fragmentos de texto son "Diferentes" o "Equivalentes", etiquetas que en la model card aparecen en frances.

Su relevancia es acotada pero clara dentro del nicho DevSecOps: la comparacion semantica de pares de textos (por ejemplo, fragmentos de configuracion, politicas de seguridad o descripciones de vulnerabilidades) es una operacion habitual en pipelines de analisis estatico y de deteccion de duplicados. Al estar basado en ModernBERT, un encoder eficiente con atencion optimizada, el coste de inferencia es bajo en comparacion con modelos generativos del mismo rango de parametros.

El modelo declara soporte para frances e ingles, y su uso esta pensado para integracion mediante la libreria transformers con la pipeline de text-classification. No publica datos sobre la composicion del dataset de entrenamiento ni sobre la longitud de contexto efectiva, y su model card esta parcialmente sin completar, por lo que debe evaluarse con cautela antes de llevarlo a produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer, tarea de clasificacion de secuencias) |
| Parametros totales | 149.606.402 |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible (no se especifica en la model card) |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos en safetensors) |
| Idiomas soportados | fr, en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Tarea (pipeline) | text-classification |
| Numero de clases | 2 (Diferent / Equivalent) |
| Modelo base | Medyassino/secopv2 |
| Tamano del repositorio | 0,6 GB |
| Libreria | transformers |

## Arquitectura y entrenamiento

La arquitectura es un encoder transformer de la familia ModernBERT, reutilizada desde el modelo base Medyassino/secopv2. Sobre esa base se ha realizado un fine-tuning para una tarea de clasificacion binaria con dos etiquetas: "Diferent" (diferente) y "Equivalent" (equivalente). El modelo tiene una cabeza de clasificacion sobre el encoder y no incorpora decodificacion generativa: su salida es una etiqueta con su puntuacion de confianza, no texto libre.

Los datos de entrenamiento no estan documentados: la model card deja los campos de dataset como "<a completar: noms HF / Kaggle>" y no indica numero de tokens, composicion ni proporciones de cada clase mas alla del conjunto de evaluacion. Si se especifican los hiperparametros principales: 8 epocas de entrenamiento y ejecucion en Google Colab sobre una GPU T4 (el valor aparece entre corchetes en la model card, por lo que no esta confirmado de forma explicita). No se menciona uso de RLHF, DPO ni tecnicas de alineacion, algo esperable en un clasificador. Tampoco se documenta el formato exacto de entrada (par de textos, separador, longitud maxima), que la propia model card marca como pendiente de completar; el ejemplo de uso sugiere concatenar los dos textos con un separador `[SEP]`.

## Capacidades

- Clasificacion binaria de pares de texto en dos clases: "Diferent" y "Equivalent".
- Comparacion semantica orientada a deteccion de equivalencias o discrepancias entre fragmentos.
- Ejecucion como pipeline de text-classification de transformers, con salida de etiqueta y score.
- Multilinguee limitado a frances e ingles segun los metadatos declarados.
- Compatible con Text Embeddings Inference (tag text-embeddings-inference) y con endpoints gestionados (tag endpoints_compatible).
- No dispone de generacion de texto, razonamiento multi-paso, tool calling, function calling, capacidades de agente, vision ni audio.
- No se documenta modo "thinking" ni capacidades especiales adicionales.

## Casos de uso

- Deteccion de duplicados en repositorios de politicas de seguridad: comparar pares de reglas o fragmentos YAML para marcar como "Equivalent" aquellas que expresan la misma condicion y reducir revision manual.
- Analisis de cambios en infraestructura como codigo (IaC): dado un diff entre dos versiones de un manifiesto, clasificar si el cambio es funcionalmente equivalente o materialmente distinto antes de aprobar un despliegue.
- Triaje de hallazgos de escaneo de vulnerabilidades: comparar descripciones de dos avisos para decidir si apuntan al mismo problema y agrupar incidencias duplicadas en la cola de trabajo.
- Verificacion de traducciones o adaptaciones de documentacion tecnica en entornos fr/en: comprobar si dos enunciados en idiomas distintos son equivalentes a efectos de cumplimiento.
- Prefiltrado en pipelines de revision de configuraciones de seguridad: descartar candidatos equivalentes antes de aplicar una comparacion exacta o un analisis mas costoso, reduciendo el volumen que llega a revision humana.
- Control de calidad de respuestas en un asistente interno de DevSecOps: validar que la respuesta generada por otro modelo no contradice la politica de referencia, comparando ambos textos.
- Normalizacion de tickets de soporte tecnico: agrupar incidencias descritas con palabras distintas pero con la misma causa raiz.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index (no verificados, `verified: false`), sobre un conjunto de evaluacion de 2.000 ejemplos (1.140 "Diferent", 860 "Equivalent"):

| Metrica | Valor |
|---|---|
| Accuracy | 0,9035 |
| F1 macro | 0,9019 |
| Eval loss | 0,5926 |

Desglose por clase:

| Clase | Precision | Recall | F1 | Support |
|---|---|---|---|---|
| Diferent | 0,9247 | 0,9044 | 0,9144 | 1140 |
| Equivalent | 0,8768 | 0,9023 | 0,8894 | 860 |
| Accuracy global | | | 0,9035 | 2000 |
| Macro avg | 0,9007 | 0,9034 | 0,9019 | 2000 |
| Weighted avg | 0,9041 | 0,9035 | 0,9037 | 2000 |

No se han publicado comparaciones con otros modelos ni otros benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible; estos no son aplicables a un clasificador de este tipo.

## Requisitos de hardware

- VRAM estimada: con 149,6 millones de parametros, aproximadamente 0,6 GB en fp32, 0,3 GB en fp16/bf16 y alrededor de 0,15 GB en int8. El repositorio ocupa 0,6 GB.
- Cabe sin problema en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en GPUs con 4 GB o menos de VRAM. Es viable tambien en CPU para cargas moderadas.
- GPU recomendadas segun carga: T4 o L4 para lotes pequenos y despliegues economicos; A10G, L40S, A100 o H100 solo tendrian sentido si se agrupan grandes volumenes por lote.
- Hardware de entrenamiento declarado: Google Colab con GPU T4.
- Opciones de despliegue: pipeline de transformers (referencia en la model card), Text Embeddings Inference (tag text-embeddings-inference) y endpoints compatibles (tag endpoints_compatible). No se publican pesos GGUF, por lo que llama.cpp u Ollama no son aplicables de forma directa sin conversion.
- Latencia y throughput: no disponibles; dependen del hardware, del tamano de lote y de la longitud de las secuencias, que no esta documentada.

## Comparativa con modelos similares

No se dispone de resultados de benchmarks de alternativas en la informacion proporcionada, por lo que la comparacion cuantitativa se limita al modelo base:

| Modelo | Parametros | Tarea | Contexto | Licencia | Metricas publicadas |
|---|---|---|---|---|---|
| Medyassino/devSECV2 | 149.606.402 | Clasificacion binaria (Diferent / Equivalent) | no disponible | apache-2.0 | Accuracy 0,9035; F1 macro 0,9019 |
| Medyassino/secopv2 (modelo base) | no disponible | no disponible | no disponible | no disponible | no disponible |
| Otras alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La clase "Equivalent" se predice peor que "Diferent": precision de 0,8768 frente a 0,9247, segun los propios datos del autor. Esto implica una tasa de falsos positivos mayor en esa clase.
- La model card advierte de que el rendimiento solo esta garantizado sobre datos proximos a los de entrenamiento; no hay informacion sobre la composicion ni la procedencia del dataset.
- No debe usarse como unico criterio de decision en contextos de seguridad critica: el autor recomienda validacion humana.
- El formato exacto de entrada (par de textos, separador, longitud maxima) no esta documentado y aparece como pendiente en la model card; un formato distinto al del entrenamiento puede degradar gravemente los resultados.
- Riesgo de alucinacion no aplicable en sentido generativo (el modelo solo emite etiquetas), pero si existe riesgo de clasificacion erronea con confianza alta.
- Cobertura linguistica limitada a frances e ingles; no se declara soporte de castellano.
- Licencia Apache 2.0: permite uso comercial, modificacion y redistribucion, con obligacion de conservar el aviso de licencia y de atribucion.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, y la card esta incompleta: se trata de un artefacto sin validacion externa ni reproducibilidad documentada.
- No se publican pesos cuantizados ni versiones GGUF, lo que limita su despliegue en entornos de inferencia en CPU o edge sin conversion previa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Medyassino/devSECV2
- Modelo base: https://huggingface.co/Medyassino/secopv2
- Perfil del autor: https://huggingface.co/Medyassino
- Las busquedas web realizadas no han devuelto resultados relevantes sobre este modelo (papers, blogs, repos o demos); los resultados obtenidos no guardan relacion con el modelo y se han descartado.
