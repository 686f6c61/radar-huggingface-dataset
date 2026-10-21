# Luni/Qwen3.8-Flash-Coder-CYBER-Heretic-EXL3-3.50bpw

## Resumen

Este repositorio contiene una cuantizacion EXL3 (ExLlamaV3) de 3,50 bits por peso del modelo Luni/Qwen3.8-Flash-Coder-CYBER-Heretic, un derivado de la familia Qwen orientado a programacion y a tareas de ciberseguridad ofensiva/defensiva sin censura. El autor es el usuario de HuggingFace «Luni» y la publicacion es una conversion de pesos, no un entrenamiento nuevo: no se anaden datos ni se modifica el comportamiento del modelo base, solo se reduce la precision de los pesos para hacerlo viable en GPUs de consumo.

El dato mas relevante es el recuento real de parametros del safetensors: 10.791.904.640 (~10,79 mil millones). Con ese tamano, la cuantizacion deja los pesos en aproximadamente 19,5 GB, lo que permite mantener el modelo completo en VRAM en tarjetas de 24 GB (RTX 3090, RTX 4090) y de 32 GB (RTX 5090), algo imposible con los pesos originales en FP16. El autor recomienda una ventana de 64k tokens usando cache KV en FP8.

La ficha resulta de interes ahora por dos motivos: primero, porque demuestra el flujo habitual de publicacion de cuantizaciones de bajo bit para modelos de ~11B en hardware de consumo; segundo, porque el proposito declarado (analisis binario, descompilacion y analisis de exploits sin restricciones de rechazo) implica riesgos de uso que conviene evaluar antes de desplegarlo. La model card es extremadamente escueta: no documenta idiomas, datos de entrenamiento, contexto nativo ni resultados de evaluacion.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (el tag `qwen4_exp_text` sugiere familia Qwen; no se confirma tipo de transformer ni si es MoE) |
| Parámetros totales | 10.791.904.640 (~10,79 B), dato real de safetensors |
| Parámetros activos | no disponible (no se confirma que sea un modelo MoE) |
| Longitud de contexto | 64k recomendado por el autor con cache KV en FP8; contexto nativo del modelo base no disponible |
| Tipos de cuantización | EXL3 a 3,50 bpw (pesos ~19,5 GB); no se publican variantes GGUF ni otras precisiones en este repo |
| Idiomas soportados | no disponible (la model card no los documenta) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors en formato EXL3 para ExLlamaV3; tamano del repo 21,6 GB |

## Arquitectura y entrenamiento

No hay informacion sobre la arquitectura interna en la informacion proporcionada. El tag `qwen4_exp_text` apunta a un modelo de texto de la familia Qwen, y el sufijo «Coder» indica especializacion en codigo, pero ni la model card del repositorio ni la informacion disponible detallan numero de capas, dimension del modelo, tipo de atencion, uso de MoE ni estrategia de posicionamiento. Tampoco se especifica si el modelo base emplea modos de razonamiento explicito. Cualquier afirmacion al respecto seria especulativa.

Al tratarse de una cuantizacion, este repositorio no incluye entrenamiento: los pesos proceden de Luni/Qwen3.8-Flash-Coder-CYBER-Heretic, y el proceso aplicado es una conversion a EXL3 de 3,50 bpw. No se documentan los datos de entrenamiento del modelo base, el numero de tokens, la composicion del dataset, ni si hubo RLHF, DPO u otro ajuste por preferencias. El termino «Heretic» en el nombre se asocia en la practica a ajustes orientados a reducir los rechazos del modelo (estilo abliteration o fine-tuning sin censura), pero no se aporta ninguna ficha tecnica que lo confirme ni que describa el metodo.

## Capacidades

- Generacion de texto y conversacion multi-turno con plantilla de chat (pipeline `text-generation`, tag `conversational`), segun los metadatos del repo.
- Generacion y asistencia en codigo, heredada del sufijo «Coder» del modelo base; sin datos de evaluacion que la cuantifiquen.
- Analisis de seguridad y ciberseguridad: el autor declara como proposito el analisis binario, la descompilacion y el analisis de exploits, con un ajuste orientado a no rechazar este tipo de peticiones.
- Razonamiento multi-paso y soporte de agentes: no disponible en la informacion proporcionada; no se confirma soporte de tool calling ni function calling.
- Capacidades multilingues: no disponible; no se documentan idiomas.
- Capacidades multimodales (vision, audio): no disponibles; el tag `qwen4_exp_text` indica texto.
- Modo de razonamiento explicito o «thinking»: no disponible.
- Ejecucion local en GPU de consumo mediante ExLlamaV3, con residencia completa en VRAM segun el autor.

## Casos de uso

- Analisis de binarios en laboratorio: el modelo puede recibir pseudocodigo o fragmentos de desensamblado y generar hipotesis sobre la logica del programa (funciones criptograficas, rutinas de empaquetado, comprobaciones antidebug), gracias al ajuste especifico declarado para analisis binario. Uso adecuado sobre muestras propias o con autorizacion.
- Apoyo a la descompilacion: traduccion de salida de descompiladores (Ghidra, IDA, Binary Ninja) a pseudocodigo C mas legible y anotacion de estructuras y tipos, aprovechando la especializacion en codigo del modelo base.
- Triaje de malware y redaccion de informes tecnicos: resumir el comportamiento observado de una muestra, clasificar indicadores y generar borradores de informe para el equipo de respuesta a incidentes, con revision humana obligatoria.
- Analisis de exploits en entorno controlado: explicar el mecanismo de una prueba de concepto, identificar mitigaciones aplicables (ASLR, DEP, CFI) y proponer parches, en el contexto de un programa de divulgacion responsable.
- Formacion y CTFs: generar retos, explicar tecnicas de explotacion en un entorno de laboratorio aislado y servir de tutor para equipos de seguridad en formacion, donde el comportamiento sin rechazos resulta util para no interrumpir el flujo pedagogico.
- Asistente de codigo en local sin salida a Internet: al ejecutarse integramente en una RTX 3090/4090/5090 con ExLlamaV3, permite autocompletado, refactorizacion y explicacion de codigo en entornos con requisitos de confidencialidad (codigo propietario, redes aisladas).
- Automatizacion de revision de codigo con foco en seguridad: deteccion de patrones peligrosos (desbordamientos, uso de funciones inseguras, validacion de entradas) en diffs y pull requests, integrado en un pipeline de CI mediante una API compatible con OpenAI servida por TabbyAPI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K, MBPP, SWE-bench ni ninguna otra evaluacion, y tampoco se aportan mediciones de perplexity de la cuantizacion frente al modelo original en FP16.

## Requisitos de hardware

- VRAM estimada para inferencia: ~19,5 GB solo de pesos; el autor declara residencia completa en VRAM en GPUs de 24 GB y 32 GB, lo que deja poco margen (unos 4,5 GB en una 4090) para cache KV, overhead de contexto y buffers de computo.
- Contexto: 64k tokens recomendado por el autor usando cache KV en FP8; con cache en FP16 o contextos mayores el modelo puede no caber en 24 GB. El calculo exacto de memoria por token no se publica.
- GPU recomendadas por el autor: RTX 3090 (24 GB), RTX 4090 (24 GB) y RTX 5090 (32 GB). Para mayor margen de contexto y concurrencia, una GPU de 32 GB o superior resulta preferible, aunque no se documentan pruebas en A100/H100.
- Cabe en GPU de consumo: si, en la clase de 24 GB y 32 GB segun el autor; no se garantiza en tarjetas de 16 GB o menos.
- Opciones de despliegue: ExLlamaV3 es el motor nativo del formato EXL3 (servidores tipo TabbyAPI o interfaces compatibles con la API de OpenAI). No es cargable en vLLM, TGI, llama.cpp ni Ollama sin una conversion previa a otro formato, que este repositorio no proporciona.
- Latencia y throughput: no disponibles; no se aportan mediciones de tokens por segundo ni de latencia por peticion.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización / formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este repositorio (EXL3 3.50 bpw) | 10,79 B | 64k recomendado (nativo no disponible) | EXL3 3,50 bpw, ~19,5 GB, EXL3/ExLlamaV3 | apache-2.0 | HuggingFace, 0 descargas y 0 likes en el momento de la consulta |
| Luni/Qwen3.8-Flash-Coder-CYBER-Heretic (modelo base) | no disponible | no disponible | no disponible (presumiblemente precision completa, sin confirmar) | no disponible en la informacion | HuggingFace |
| Otras cuantizaciones o modelos coder de ~10-14 B | no disponible | no disponible | no disponible | no disponible | No se han encontrado alternativas documentadas en la informacion disponible |

No se dispone de datos de rendimiento que permitan una comparacion cuantitativa con modelos de la misma categoria; la comparativa se limita a parametros, formato y licencia.

## Limitaciones y advertencias

- Modelo sin censura por diseno: el ajuste «Heretic» busca eliminar los rechazos, por lo que puede producir contenido operativo de ciberseguridad ofensiva ante peticiones directas. Requiere politicas de uso, registro de peticiones y supervision humana antes de cualquier despliegue.
- Riesgo juridico y de cumplimiento: el uso de tecnicas de explotacion o analisis de software de terceros sin autorizacion puede infringir normativa penal y de propiedad intelectual; la licencia del repositorio no otorga permiso sobre el software analizado.
- Perdida de calidad por cuantizacion: 3,50 bpw es una precision agresiva; cabe esperar degradacion en tareas de razonamiento largo y generacion de codigo complejo frente a los pesos en FP16, aunque no se publica ninguna medicion que la cuantifique.
- Alucinacion: sin datos de evaluacion y con una model card minima, no hay evidencia que respalde la fiabilidad de las respuestas; en dominios tecnicos (direcciones, opcodes, APIs) el riesgo de invencion es alto y la verificacion manual es obligatoria.
- Limitaciones de contexto e idioma: la recomendacion de 64k depende de cache KV en FP8 y de disponer de VRAM suficiente; no se documenta el contexto nativo ni el soporte real de castellano, que puede ser inferior al de ingles.
- Ambiguedad de licencia: el repo declara apache-2.0, pero no se documenta la licencia del modelo base ni si se heredan condiciones adicionales; antes de un uso comercial conviene verificar la ficha del modelo original.
- Portabilidad limitada: el formato EXL3 solo se carga en ExLlamaV3, lo que descarta despliegues estandarizados en vLLM, TGI u Ollama; migrar a otro motor exige reconvertir desde el modelo base.
- Procedencia no verificada: el repositorio tiene 0 descargas y 0 likes, fue creado y actualizado con segundos de diferencia, y no incluye informacion sobre el proceso de cuantizacion (calibracion, dataset, tolerancias). No hay garantia de integridad mas alla de los propios safetensors.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Luni/Qwen3.8-Flash-Coder-CYBER-Heretic-EXL3-3.50bpw
- Modelo base: https://huggingface.co/Luni/Qwen3.8-Flash-Coder-CYBER-Heretic
- Resultados de la busqueda web: no se ha encontrado ningun enlace relevante sobre este modelo; los resultados devueltos correspondian a entidades no relacionadas (Lunii, Lumni, un canal de YouTube) y se descartan por no aportar informacion tecnica. No se dispone de paper, blog, repositorio de codigo ni demo asociados al modelo.
