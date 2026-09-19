# Demondiablo/medgemma-4b-it-int4-rtn-w4a16

## Resumen

Demondiablo/medgemma-4b-it-int4-rtn-w4a16 es una version cuantizada a 4 bits del modelo medico multimodal google/medgemma-4b-it, publicada por el usuario Demondiablo. Se trata de un checkpoint de solo pesos en INT4 generado con llm-compressor y empaquetado en formato compressed-tensors, lo que reduce el tamano de los pesos de aproximadamente 8,6 GB en bfloat16 a unos 3,6 GB. El modelo conserva la torre de vision y el proyector multimodal, por lo que mantiene la capacidad de procesar entradas de imagen y texto (pipeline image-text-to-text).

El modelo base pertenece a la familia Gemma 3 (etiqueta gemma3) y cuenta con 4.300.079.472 parametros, orientados a tareas de salud y medicina. La cuantizacion W4A16 mantiene las activaciones en bfloat16 y solo comprime los pesos, buscando preservar la fidelidad clinica en componentes sensibles como lm_head, embed_tokens y la parte de vision.

Su relevancia actual radica en que permite desplegar un modelo medico multimodal de 4B en hardware mas modesto mediante vLLM, que soporta de forma nativa checkpoints compressed-tensors W4A16. No obstante, se trata de un artefacto publicado por un autor individual, sin resultados de benchmarks verificables en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal de la familia Gemma 3 (decoder de texto con torre de vision); modelo base google/medgemma-4b-it |
| Parametros totales | 4.300.079.472 (4,3 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el ejemplo de despliegue con vLLM configura max_model_len=4096) |
| Tipos de cuantizacion | INT4 RTN W4A16: pesos int4 simetricos con escalado por grupo (group_size=128); activaciones sin cuantizar en bfloat16. Componentes preservados en BF16: lm_head, embed_tokens, multi_modal_projector y torre de vision |
| Idiomas soportados | No disponibles |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base google/medgemma-4b-it, un transformer multimodal orientado a dominio medico con componentes de vision y de texto. Esta publicacion no reentrena el modelo: aplica una cuantizacion de solo pesos posterior al entrenamiento (PTQ) sobre el checkpoint ya instruido (IT). El algoritmo empleado es Round-To-Nearest (RTN) sin datos de calibracion (data-free), con esquema W4A16: pesos en enteros de 4 bits simetricos con escalado por grupo de tamano 128, y activaciones en bfloat16 sin cuantizar.

Para preservar la fidelidad clinica, el proceso mantiene en precision nativa BF16 el lm_head, los embed_tokens, el proyector multimodal y los componentes de la torre de vision. La cuantizacion y evaluacion se realizaron en una NVIDIA RTX PRO 6000 Blackwell Server Edition con 98 GB de VRAM. El repositorio incluye un archivo recipe.yaml con la receta reproducible de LLM Compressor y un archivo de configuracion con los parametros de arquitectura y el bloque quantization_config. No se documentan en la informacion disponible detalles sobre el dataset de entrenamiento del modelo base, el numero de tokens ni si hubo fases de RLHF o DPO.

## Capacidades

- Generacion de texto conversacional orientada a dominio medico y sanitario (etiquetas medical, healthcare, conversational).
- Procesamiento conjunto de imagen y texto (pipeline image-text-to-text), con la torre de vision preservada en BF16.
- Extraccion de informacion clinica estructurada; el ejemplo de la model card muestra extraccion de medicaciones a partir de una lista de prescripciones.
- Generacion de salidas en formato JSON estructurado, segun el ejemplo de extraccion de farmacos incluido por el autor.
- Conversacion multi-turno mediante la interfaz de chat de vLLM (llm.chat).
- Despliegue acelerado con vLLM gracias al soporte nativo de checkpoints compressed-tensors W4A16.
- Tool calling / function calling: no documentado en la informacion disponible.
- Uso en agentes y razonamiento multi-paso: no documentado en la informacion disponible.
- Capacidades multilingues: no disponibles.
- Modo thinking explicito: no documentado en la informacion disponible.
- Entrada de audio: no documentada (aunque el repositorio incluye un JSON de extracciones sobre transcripciones, no se confirma soporte de audio).

## Casos de uso

- Extraccion estructurada de medicaciones: a partir de texto clinico o transcripciones, el modelo puede devolver una lista normalizada de farmacos, dosis y pautas, tal como ilustra el ejemplo de la model card ("Extract medications: ..."). Es adecuado por su enfoque medico y su capacidad de generar JSON.
- Revision asistida de informes con imagen: al conservar la torre de vision y el proyector multimodal en BF16, puede procesar pares imagen-texto (por ejemplo, una radiografia con una pregunta asociada) para generar un borrador de descripcion, siempre con supervision profesional.
- Normalizacion de notas clinicas: uso en pipelines de historia clinica electronica para convertir texto libre en campos estructurados (diagnosticos, tratamientos, posologias) antes de su almacenamiento.
- Asistente conversacional sanitario de apoyo: gestion de dialogos multi-turno con pacientes o personal para aclarar sintomas o documentar consultas, apoyandose en la interfaz de chat del modelo.
- Clasificacion y triaje de texto clinico: categorizacion de consultas o informes por especialidad o urgencia en flujos de preprocesado, aprovechando el bajo coste de inferencia del checkpoint cuantizado.
- Prototipado e investigacion en NLP clinico: uso del checkpoint INT4 para experimentar con modelos medicos multimodales en entornos con VRAM limitada, sin necesidad de disponer de un acelerador de gama alta.
- Despliegue en servidores hospitalarios de recursos ajustados: inferencia con vLLM en GPUs de 12-16 GB, reduciendo el coste de infraestructura frente al modelo base en bfloat16.
- Generacion de resumenes de documentacion clinica: sintesis de informes extensos en resumenes breves para revision humana, con advertencia explicita de verificacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. La model card menciona que el repositorio incluye un archivo de resultados de evaluacion (medgemma-4b-it-int4-rtn-w4a16.json) con metricas y latencia de generacion, asi como un archivo de extracciones clinicas parseadas (extractions_medgemma-4b-it-int4-rtn-w4a16.json), pero no se proporcionan los valores concretos.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos INT4 suponen aproximadamente 2,2 GB (4,3 B parametros x 0,5 bytes), a los que se suman los componentes preservados en BF16. El checkpoint comprimido ocupa unos 3,6 GB y el repositorio 3,9 GB. Como estimacion orientativa, el modelo puede ejecutarse con un presupuesto de VRAM en el rango de 6 a 8 GB, incluyendo cache KV, aunque este dato no esta confirmado en la informacion disponible.
- GPU recomendadas: el autor realizo la cuantizacion y evaluacion en una NVIDIA RTX PRO 6000 Blackwell Server Edition (98 GB). Para inferencia no se requieren GPU de ese calibre.
- Compatibilidad con GPU de consumo: si, es probable que quepa en GPUs de consumo con 12-16 GB de VRAM (por ejemplo RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090) segun la estimacion anterior.
- Opciones de despliegue: vLLM (soporte nativo de compressed-tensors W4A16, recomendado por el autor), y text-generation-inference (etiqueta text-generation-inference). No se documenta soporte directo en llama.cpp u Ollama: el formato compressed-tensors requeriria conversion previa a GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Tamano de pesos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Demondiablo/medgemma-4b-it-int4-rtn-w4a16 | 4,3 B | INT4 RTN W4A16 (compressed-tensors) | ~3,6 GB | gemma | Hugging Face (autor individual) |
| google/medgemma-4b-it | 4,3 B | bfloat16 | ~8,6 GB | gemma | Hugging Face (Google) |
| google/gemma-3-4b-it | no disponible | bfloat16 | no disponible | gemma | Hugging Face (Google) |

La comparacion directa es con el modelo base google/medgemma-4b-it, del que esta publicacion es una version cuantizada: mismo numero de parametros, misma licencia y misma arquitectura, con aproximadamente la mitad de tamano en pesos a cambio de la posible perdida de precision asociada a la cuantizacion INT4. El resto de alternativas medicas comparables no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Riesgo de alucinacion: elevado en dominio medico, donde una respuesta incorrecta sobre dosis, diagnosticos o tratamientos puede causar dano. Requiere verificacion humana.
- La cuantizacion INT4 RTN data-free puede degradar la precision frente a esquemas con calibracion (por ejemplo GPTQ o AWQ); no se aportan metricas que cuantifiquen esa perdida.
- No es un dispositivo medico ni esta validado clinicamente; no debe usarse para diagnostico o decision terapeutica autonomos.
- Publicado por un autor individual, sin garantias de mantenimiento, soporte ni trazabilidad respecto al proceso de cuantizacion.
- Licencia Gemma: el uso esta sujeto a los Gemma Terms of Use, que imponen condiciones y usos prohibidos; hay que revisarlos antes de un uso comercial.
- Idiomas soportados y longitud de contexto no documentados; el ejemplo de despliegue limita max_model_len a 4096, sin confirmar el maximo real del modelo.
- Sesgos: se heredan los del modelo base google/medgemma-4b-it, no cuantificados en la informacion disponible.
- No se han publicado resultados de benchmarks verificables, por lo que el rendimiento real en tareas clinicas es desconocido.
- Compatibilidad de despliegue limitada al ecosistema compressed-tensors (vLLM/TGI); fuera de el puede requerir conversion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Demondiablo/medgemma-4b-it-int4-rtn-w4a16
- Modelo base: https://huggingface.co/google/medgemma-4b-it
- LLM Compressor (repositorio): https://github.com/vllm-project/llm-compressor
- compressed-tensors (repositorio): https://github.com/vllm-project/compressed-tensors

Nota: los resultados de busqueda web proporcionados no guardan relacion con este modelo y no se han incluido como enlaces relevantes.
