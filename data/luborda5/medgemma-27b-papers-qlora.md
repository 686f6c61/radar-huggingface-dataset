# luborda5/medgemma-27b-papers-qlora

## Resumen

medgemma-27b-papers-qlora es un ajuste publicado por el usuario luborda5 sobre MedGemma 27B multimodal, la familia de modelos médicos de Google derivada de Gemma 3. El repositorio contiene pesos en safetensors con 27.432.406.640 parámetros y un tamano total de 54,9 GB, lo que corresponde a una distribución en precision completa (bfloat16) y no a un adaptador LoRA aislado. El nombre del modelo sugiere un ajuste fino con QLoRA sobre un corpus de articulos cientificos, aunque la model card no documenta el procedimiento, el dataset ni los hiperparametros empleados.

Se trata de un modelo multimodal de tipo image-text-to-text: combina un encoder de imagen SigLIP preentrenado con datos medicos (radiografias de torax, dermatologia, oftalmologia e histopatologia) con un LLM basado en Gemma 3 27B. Su interes practico esta en el area de generacion de informes radiologicos, comprension de imagenes clinicas y tareas de clasificacion o recuperacion semantica sobre imagenes medicas, todo ello en ingles.

La relevancia de esta ficha es limitada y conviene ser explicito: el repositorio acumula 0 descargas y 0 likes en el momento de la consulta, fue creado y actualizado el mismo dia (16 de septiembre de 2026) y no publica resultados de benchmarks propios. Ademas, la model card reproduce literalmente la documentacion de MedGemma de Google, por lo que las especificaciones descritas corresponden al modelo base y no a este ajuste concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only multimodal (Gemma 3) con encoder de imagen SigLIP |
| Parametros totales | 27.432.406.640 (segun safetensors) |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | No se incluyen pesos cuantizados en el repositorio (solo safetensors); el sufijo "qlora" apunta a cuantizacion de 4 bits durante el ajuste, sin confirmar |
| Idiomas soportados | en (ingles) |
| Licencia | health-ai-developer-foundations (license: other), con acceso restringido mediante aceptacion de terminos |
| Formato de pesos | safetensors (compatible con transformers) |
| Modelo base | google/gemma-3-27b-pt (segun etiqueta base_model) |
| Pipeline declarado | image-text-to-text |
| Tamano del repositorio | 54,9 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de MedGemma 27B multimodal: un encoder de imagen SigLIP especificamente preentrenado con datos medicos desidentificados (radiografias de torax, imagenes de dermatologia y oftalmologia, y cortes de histopatologia) acoplado a un componente LLM derivado de Gemma 3 27B. El LLM se entreno sobre datos medicos diversos: texto medico, pares de pregunta-respuesta clinicos, datos de historia clinica electronica en formato FHIR (solo en la variante multimodal de 27B), imagenes de radiologia, parches de histopatologia e imagenes de oftalmologia y dermatologia. La variante multimodal de 27B se distribuye unicamente en version instruction-tuned.

En cuanto a este repositorio concreto, no se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, la aplicacion de RLHF o DPO, ni sobre innovaciones tecnicas especificas del ajuste. El nombre del modelo indica el uso de QLoRA y sugiere un corpus de articulos cientificos, pero la model card no detalla ni el corpus ni la configuracion del adaptador, y tampoco aclara si los pesos publicados son un merge del adaptador con el modelo base o un checkpoint completo.

## Capacidades

- Generacion de texto medico en ingles sobre cuestiones clinicas y resumen de documentacion sanitaria.
- Comprension de imagen y texto (image-text-to-text): interpretacion de radiografias de torax, imagenes de dermatologia, fondo de ojo y cortes histopatologicos.
- Generacion de informes radiologicos a partir de imagenes, una de las tareas declaradas en las etiquetas del repositorio.
- Extraccion de embeddings medicos y extraccion de caracteristicas de imagen (image-feature-extraction).
- Clasificacion de imagenes medicas, incluida la clasificacion zero-shot.
- Recuperacion semantica de imagenes medicas (content-based image retrieval) mediante representaciones vectoriales.
- Uso conversacional multi-turno, segun la etiqueta conversational y el pipeline declarado.
- Soporte de tool calling o function calling: no disponible en la informacion proporcionada.
- Capacidades de agente o razonamiento multi-paso explicitas: no disponible en la informacion proporcionada.
- Capacidades multilingues: no; el modelo esta declarado unicamente para ingles.
- Modo de razonamiento explicito (thinking mode), audio o video: no disponible en la informacion proporcionada.

## Casos de uso

- Generacion asistida de informes radiologicos: el modelo puede tomar una radiografia de torax como entrada y producir un borrador de informe en ingles, tarea para la que el encoder SigLIP medico aporta representaciones especificas de imagen clinica. Requiere revision por un radiologo antes de cualquier uso real.
- Triage dermatologico preliminar: ante una imagen de piel, el modelo puede generar una descripcion de hallazgos y candidatos diagnosticos que sirvan como segunda opinion en un flujo de derivacion, siempre con validacion clinica posterior.
- Cribado de fondo de ojo: uso como extractor de caracteristicas o clasificador zero-shot para identificar imagenes retinanas relevantes dentro de un repositorio, reduciendo el volumen que debe revisar un especialista.
- Recuperacion semantica de imagenes medicas: los embeddings del modelo permiten indexar y buscar por similitud en colecciones de radiografias, patologia o dermatologia, por ejemplo para construir conjuntos de casos similares a uno dado.
- Anotacion y preetiquetado de datos medicos: generacion de descripciones y etiquetas iniciales sobre imagenes no anotadas, que despues se corrigen manualmente, acelerando la construccion de datasets de entrenamiento.
- Resumen y consulta de literatura medica: dado el ajuste aparente sobre articulos cientificos, encaja en tareas de sintesis de publicaciones y respuesta a preguntas sobre contenido biomedico, con verificacion de fuentes obligatoria.
- Asistencia conversacional a profesionales: chat multi-turno en ingles para resolver dudas puntuales sobre terminologia, protocolos o hallazgos descritos, como apoyo documental y nunca como sustituto del criterio clinico.
- Investigacion en modelos de vision-lenguaje medicos: el checkpoint sirve como punto de partida para experimentos academicos de ajuste fino, comparacion de estrategias QLoRA o evaluacion de sesgos en modelos medicos multimodales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio reproduce la documentacion de MedGemma de Google, que menciona evaluaciones en benchmarks clinicamente relevantes, pero no incluye cifras concretas para este ajuste ni para el modelo base en el material proporcionado. No se dispone, por tanto, de valores de MMLU, HumanEval, GSM8K ni de metricas medicas especificas (por ejemplo, MXE, MedQA o CheXpert).

## Requisitos de hardware

- VRAM estimada en bfloat16: alrededor de 55 GB solo para pesos (27,43 mil millones de parametros a 2 bytes), mas la cache KV y el encoder de vision; en la practica, por encima de 60 GB en funcion de la longitud de contexto.
- VRAM estimada en cuantizacion de 4 bits: aproximadamente 15-17 GB para pesos, mas overhead de cache KV y del encoder SigLIP.
- GPU recomendadas en precision completa: A100 80 GB, H100 80 GB o dos GPU de 48 GB (A6000, L40S) con paralelismo de tensor.
- GPU consumer: no cabe en una unica GPU de 24 GB en bfloat16; con cuantizacion de 4 bits si es viable en RTX 3090 o RTX 4090 de 24 GB, aunque con margen ajustado si se procesan imagenes y contextos largos.
- Opciones de despliegue: transformers (libreria declarada, requiere version 4.50.0 o superior para Gemma 3), text-generation-inference y endpoints compatibles segun las etiquetas del repositorio. El repositorio no incluye pesos GGUF, por lo que llama.cpp u Ollama exigirian una conversion previa. vLLM es una alternativa habitual para servir modelos Gemma 3, aunque no se cita en la informacion disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Modalidad | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| luborda5/medgemma-27b-papers-qlora | 27.432.406.640 | Imagen-texto (image-text-to-text) | No disponible | health-ai-developer-foundations | Repositorio publico con acceso restringido; 0 descargas, 0 likes |
| google/medgemma-27b-it (multimodal) | 27B | Imagen-texto | No disponible | health-ai-developer-foundations | Coleccion oficial de Google en HuggingFace |
| google/medgemma-27b-text-it | 27B | Solo texto | No disponible | health-ai-developer-foundations | Coleccion oficial de Google en HuggingFace |
| google/medgemma-4b-it | 4B | Imagen-texto y texto | No disponible | health-ai-developer-foundations | Coleccion oficial de Google en HuggingFace |
| google/gemma-3-27b-pt | 27B | Imagen-texto | No disponible | Terminos de Gemma | Repositorio publico de Google |

No se dispone de datos de rendimiento comparado entre estas variantes en la informacion proporcionada, por lo que la comparacion se limita a parametros, modalidad, licencia y disponibilidad.

## Limitaciones y advertencias

- Ausencia total de evaluacion publicada: no hay benchmarks, ni validacion clinica, ni comparacion con el modelo base MedGemma 27B. No es posible afirmar que el ajuste mejore al modelo original.
- Senales de escasa validacion por la comunidad: 0 descargas y 0 likes, con creacion y ultima actualizacion el mismo dia, lo que indica un artefacto sin rodaje ni revision externa.
- Riesgo de alucinacion elevado en dominio medico: la generacion de hallazgos o diagnosticos plausibles pero incorrectos es especialmente peligrosa en contextos clinicos.
- Sesgos potenciales: los derivados de los datos de entrenamiento del modelo base (poblaciones, equipos de imagen, protocolos de adquisicion y practicas clinicas sobrerrepresentadas), no documentados en este repositorio.
- Idioma: soporte declarado unicamente en ingles, lo que limita su uso directo en entornos en castellano sin traduccion o ajuste adicional.
- Restricciones de licencia: se aplica la licencia health-ai-developer-foundations con acceso restringido y aceptacion de terminos; su uso comercial y clinico esta sujeto a dichos terminos y no se detalla en la informacion disponible. Deben respetarse tambien las condiciones del modelo base Gemma 3.
- Ambiguedad sobre el contenido del repositorio: no se especifica si los safetensors de 54,9 GB son pesos completos fusionados o un adaptador, ni que datos exactos de ajuste se emplearon.
- La model card reproduce la documentacion de MedGemma de Google: las capacidades descritas corresponden al modelo base y no garantizan el comportamiento de este checkpoint.
- Uso previsto: investigacion y prototipado; no debe emplearse como dispositivo medico ni en decisiones clinicas sin validacion regulatoria y supervision profesional.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/luborda5/medgemma-27b-papers-qlora
- Modelo base en HuggingFace: https://huggingface.co/google/gemma-3-27b-pt
- Documentacion de MedGemma (Google): https://developers.google.com/health-ai-developer-foundations/medgemma
- Terminos de uso de Health AI Developer Foundations: https://developers.google.com/health-ai-developer-foundations/terms
- Model card de MedSigLIP: https://developers.google.com/health-ai-developer-foundations/medsiglip/model-card
- MedGemma en Google Cloud Model Garden: https://console.cloud.google.com/vertex-ai/publishers/google/model-garden/medgemma
- Coleccion de modelos MedGemma en HuggingFace: https://huggingface.co/collections/google/medgemma-release-680aade845f90bec6a3f60c4
- Coleccion de aplicaciones de concepto MedGemma: https://huggingface.co/collections/google/medgemma-concept-apps-686ea036adb6d51416b0928a
- Repositorio GitHub de MedGemma: https://github.com/google-health/medgemma
- Notebook de inicio rapido: https://github.com/google-health/medgemma/blob/main/notebooks/quick_start_with_hugging_face.ipynb
- Notebook de ajuste fino: https://github.com/google-health/medgemma/blob/main/notebooks/fine_tune_with_hugging_face.ipynb
- Documentacion de Gemma 3: https://ai.google.dev/gemma/docs/core
- Informe tecnico de MedGemma: https://arxiv.org/abs/2507.05201
- Articulo de SigLIP: https://arxiv.org/abs/2303.15343
- Referencias arXiv adicionales incluidas en las etiquetas del repositorio (titulos no verificados en la informacion disponible): https://arxiv.org/abs/2405.03162, https://arxiv.org/abs/2106.14463, https://arxiv.org/abs/2412.03555, https://arxiv.org/abs/2501.19393, https://arxiv.org/abs/2009.13081, https://arxiv.org/abs/2102.09542, https://arxiv.org/abs/2411.15640, https://arxiv.org/abs/2404.05590, https://arxiv.org/abs/2501.18362
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo; los resultados obtenidos correspondian a noticias no relacionadas con el ambito de la ficha.
