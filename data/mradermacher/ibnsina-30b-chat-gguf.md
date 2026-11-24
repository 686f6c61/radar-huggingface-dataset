# mradermacher/ibnsina-30b-chat-GGUF

## Resumen

ibnsina-30b-chat es un modelo de lenguaje conversacional de aproximadamente 30.500 millones de parametros, desarrollado por ibnsina-llm y publicado bajo licencia Apache 2.0. Esta orientado a conversacion e instrucciones, con soporte nativo para persa (farsi) e ingles, y se construye sobre una arquitectura de tipo MoE identificada en las etiquetas del repositorio como qwen3_moe, lo que sugiere un diseno derivado de la familia Qwen3 con mezcla de expertos. El modelo base es ibnsina-llm/ibnsina-30b-chat.

La ficha que nos ocupa corresponde a la version cuantizada en formato GGUF publicada por mradermacher, un conocido distribuidor de cuantizaciones para llama.cpp. El repositorio ofrece un abanico completo de cuantizaciones estaticas, desde Q2_K (11,4 GB) hasta Q8_0 (32,6 GB), lo que permite ejecutar el modelo en hardware muy diverso, desde GPUs de consumo con 12-16 GB de VRAM hasta estaciones de trabajo con GPUs profesionales.

Su relevancia actual radica en dos factores: por un lado, cubre el nicho de modelos conversacionales de calidad para persa, un idioma con relativamente poca cobertura en el ecosistema open source; por otro, al estar disponible en GGUF y con licencia permisiva, puede desplegarse en local mediante llama.cpp u Ollama sin depender de infraestructura en la nube. La informacion publica sobre arquitectura detallada, contexto y benchmarks es, no obstante, muy limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), etiquetada como qwen3_moe; detalles internos no disponibles |
| Parametros totales | 30.532.122.624 (segun safetensors del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (estaticas); variantes imatrix en repositorio aparte |
| Idiomas soportados | Persa (fa) e ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado); el modelo base original presumiblemente en safetensors |

## Arquitectura y entrenamiento

La informacion disponible indica que el modelo emplea una arquitectura de mezcla de expertos (MoE) con nomenclatura qwen3_moe, lo que apunta a un diseno inspirado en Qwen3-MoE: capas de atencion completas combinadas con capas de atencion lineal, y un router que activa un subconjunto de expertos por token. Sin embargo, no se han publicado en la informacion disponible detalles sobre el numero de expertos, el numero de expertos activos por token, la dimension de las capas ni el mecanismo exacto de atencion.

Tampoco hay datos publicados sobre el corpus de entrenamiento (numero de tokens, composicion del dataset, proporcion de persa frente a ingles), ni sobre si se aplicaron tecnicas de alineacion como RLHF, DPO o instruction tuning supervisado mas alla de la etiqueta "instruction-tuned" y "chat" del repositorio. La unica innovacion tecnica documentada de forma indirecta es la propia cuantizacion GGUF, que incluye variantes con importance matrix (imatrix) para mejorar la calidad en cuantizaciones agresivas.

## Capacidades

- Generacion de texto conversacional multi-turno en persa e ingles, con formato de chat e instrucciones.
- Razonamiento general y respuesta a preguntas, segun la etiqueta "instruction-tuned".
- Generacion de codigo: no confirmado explicitamente en la informacion disponible, aunque es habitual en modelos derivados de Qwen3.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues limitadas a persa e ingles segun los metadatos; no se documentan otros idiomas.
- Capacidades especiales (modo thinking, vision, audio): no disponibles en la informacion proporcionada.
- Compatibilidad con endpoints: la etiqueta endpoints_compatible sugiere integracion con APIs compatibles con OpenAI, aunque no se detalla el mecanismo.

## Casos de uso

- Atencion al cliente en persa: el modelo puede gestionar conversaciones multi-turno en farsi, un idioma con escasa cobertura en modelos abiertos, adecuado para empresas que atienden a usuarios iranies o de la diaspora. La ventana de contexto exacta no esta documentada, por lo que conviene validar la longitud maxima antes de desplegar.
- Asistentes conversacionales bilingues persa-ingles: util para organizaciones que necesitan un unico modelo que alterne entre ambos idiomas sin cambiar de sistema, reduciendo la complejidad de despliegue.
- Despliegue en local con privacidad de datos: al estar disponible en GGUF y licencia Apache 2.0, puede ejecutarse en servidores propios o estaciones de trabajo sin enviar datos a terceros, lo que encaja en sectores regulados.
- Prototipado rapido en hardware de consumo: la cuantizacion Q4_K_M (18,7 GB) o IQ4_XS (16,7 GB) permite probar el modelo en una RTX 4090 o en una configuracion con dos GPUs de 12 GB, ideal para evaluar su calidad antes de invertir en infraestructura mayor.
- Traduccion y adaptacion de contenido entre persa e ingles: el modelo puede emplearse para borradores de traduccion o reescritura de textos en ambos idiomas, siempre con revision humana dado el riesgo de alucinacion.
- Educacion y tutoria en persa: generacion de explicaciones, resumenes y material didactico en farsi para plataformas educativas locales, con la ventaja de que el modelo puede ejecutarse on-premise en universidades con recursos limitados.
- Investigacion en PLN para persa: sirve como linea base o modelo de referencia en experimentos academicos sobre procesamiento del lenguaje natural en farsi, gracias a su licencia permisiva y a la disponibilidad de multiples cuantizaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos mas overhead de contexto y cache KV):
  - Q2_K: aproximadamente 11,4 GB de pesos; viable en GPUs de 16 GB.
  - IQ4_XS: 16,7 GB; requiere 20-24 GB de VRAM para contexto moderado.
  - Q4_K_M: 18,7 GB; recomendada para RTX 4090 (24 GB) o A6000.
  - Q5_K_M: 21,8 GB; al limite de una RTX 4090 con contexto corto.
  - Q6_K: 25,2 GB; requiere 32 GB o mas, p. ej. A100 40 GB o dos GPUs de 24 GB.
  - Q8_0: 32,6 GB; requiere A100 40 GB, H100 o configuraciones multi-GPU.
- GPU recomendadas: RTX 4090 (24 GB) para cuantizaciones Q4 y Q5 con contexto limitado; A100 40/80 GB o H100 para Q6/Q8 y contextos largos; configuraciones multi-GPU consumer para cuantizaciones intermedias.
- Cabe en GPU de consumo: si, en cuantizaciones Q2_K a Q4_K_M con 16-24 GB de VRAM; las cuantizaciones superiores requieren hardware profesional o multi-GPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; el modelo base puede servirse con vLLM o TGI si se dispone de los pesos sin cuantizar.
- Latencia y throughput: no disponibles en la informacion proporcionada; dependeran del hardware, la cuantizacion y el backend.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| ibnsina-30b-chat (GGUF) | ~30,5 B (MoE) | no disponible | fa, en | Apache 2.0 | GGUF |
| Qwen3-30B-A3B | ~30 B totales, ~3 B activos | 32.768 tokens (ampliable) | multilingue amplio | Apache 2.0 | safetensors, GGUF |
| Gemma 3 27B | ~27 B | 128.000 tokens | multilingue amplio | Gemma license | safetensors, GGUF |
| Mistral Small 3 (24B) | ~24 B | 32.000 tokens | multilingue | Apache 2.0 | safetensors, GGUF |

La comparativa se ofrece como referencia de categoria; no se dispone de datos de rendimiento del modelo ibnsina que permitan una comparacion cuantitativa. La principal diferencia frente a Qwen3-30B-A3B, Gemma 3 27B y Mistral Small 3 es su especializacion en persa, frente al enfoque multilingue mas amplio de los alternativas.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible; como todo modelo entrenado con datos web, es probable que herede sesgos de genero, religion y geopolitica, especialmente en el contexto irani.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad; en tareas de traduccion o atencion al cliente conviene implementar verificacion humana o retrieval augmentation.
- Limitaciones de contexto e idioma: solo se declaran persa e ingles; el rendimiento en castellano u otros idiomas no esta garantizado y probablemente sea deficiente. La longitud de contexto no esta documentada, lo que impide planificar casos de uso con documentos largos.
- Restricciones de licencia: Apache 2.0 permite uso comercial sin restricciones adicionales, pero el modelo base podria tener condiciones propias no reflejadas en la ficha del GGUF; conviene revisar el repositorio original.
- Caveats para produccion: la informacion sobre parametros activos, contexto y benchmarks es inexistente, lo que dificulta estimar coste y rendimiento; se recomienda una evaluacion propia antes de desplegar. Las cuantizaciones Q2_K y Q3_K_M estan marcadas por el autor como de menor calidad.
- El modelo tiene muy pocas descargas (359) y ningun "like", lo que sugiere una validacion comunitaria limitada.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/ibnsina-30b-chat-GGUF
- Modelo base: https://huggingface.co/ibnsina-llm/ibnsina-30b-chat
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/ibnsina-30b-chat-i1-GGUF
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#ibnsina-30b-chat-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
