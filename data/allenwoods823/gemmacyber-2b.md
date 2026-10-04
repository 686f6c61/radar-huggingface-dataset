# allenwoods823/GemmaCyber-2B

## Resumen

GemmaCyber-2B es un ajuste fino (fine-tune) del modelo Gemma 2B de Google orientado especificamente a tareas de ciberseguridad. Lo desarrolla el usuario de HuggingFace allenwoods823 y se distribuye como un adaptador LoRA/PEFT, no como un modelo completo fusionado, lo que reduce drasticamente su tamano de almacenamiento (el repositorio ocupa aproximadamente 0,1 GB). El modelo base sobre el que se aplica es google/gemma-2b, un transformer causal de 2.000 millones de parametros con una ventana de contexto de 8.192 tokens.

El objetivo declarado por el autor es ofrecer un modelo compacto y accesible para aprendizaje, investigacion y flujos de trabajo de seguridad defensiva. Entre las areas de aplicacion mencionadas estan la educacion en ciberseguridad, la explicacion de conceptos de seguridad, el analisis de logs, la respuesta a incidentes y las discusiones sobre codigo seguro. Es relevante ahora porque permite desplegar un asistente especializado en seguridad sobre hardware modesto, reutilizando el tokenizador y la arquitectura de Gemma 2B sin necesidad de entrenar desde cero.

La ficha tecnica del adaptador indica un rango LoRA de 8, un alpha de 16 y un dropout de 0,05, aplicado sobre los modulos de atencion y de la MLP del modelo base. La model card no documenta el volumen de datos de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de alineacion como RLHF o DPO.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (decoder-only) con adaptador LoRA/PEFT |
| Parametros totales | 2.000 millones (modelo base google/gemma-2b) mas adaptador LoRA de rango 8 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base Gemma 2B usa 8.192 tokens) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (el adaptador se distribuye en safetensors sin cuantizar) |
| Idiomas soportados | Ingles (en) |
| Licencia | No disponible (sujeta ademas a los terminos de uso de Gemma de Google) |
| Formato de pesos | Safetensors (adaptador LoRA; requiere el modelo base google/gemma-2b) |

## Arquitectura y entrenamiento

GemmaCyber-2B no es un modelo independiente, sino un adaptador PEFT sobre google/gemma-2b. El modelo base es un transformer causal decoder-only de 2.000 millones de parametros. El ajuste se realizo con LoRA (r = 8, lora_alpha = 16, lora_dropout = 0,05, bias = none, task_type = CAUSAL_LM), y los modulos objetivo del adaptador son q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj y down_proj, es decir, las proyecciones de atencion y las capas de la MLP en todas las capas del transformer.

No se especifica en la model card el numero de tokens de entrenamiento, la composicion del dataset de ciberseguridad utilizado, ni si hubo fases de RLHF, DPO u otra alineacion posterior al ajuste supervisado. Tampoco se documentan innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, etc.). La unica innovacion relevante es el propio uso de LoRA para mantener el adaptador ligero y facil de compartir, con la ventaja de poder mantener el modelo base separado y reutilizarlo.

## Capacidades

- Generacion de texto en ingles sobre temas de ciberseguridad: explicacion de conceptos, definiciones y respuestas a preguntas tecnicas.
- Educacion en seguridad: explicacion de diferencias entre autenticacion y autorizacion, funcionamiento de cortafuegos, impacto de vulnerabilidades como el desbordamiento de buffer.
- Analisis de logs: el autor propone prompts para analizar logs de seguridad e identificar actividad sospechosa.
- Respuesta a incidentes: generacion de listas de comprobacion para investigar servidores Linux potencialmente comprometidos.
- Codigo seguro: discusion de practicas de desarrollo seguro, por ejemplo prevencion de inyeccion SQL.
- Analisis de vulnerabilidades y conceptos de seguridad de red (SIEM, superficie de ataque).
- Documentacion de seguridad: ayuda para redactar o estructurar documentacion tecnica.
- No se documenta soporte de tool calling, function calling, uso agentico, razonamiento multi-paso explicito ni modo de pensamiento (thinking mode).
- Capacidades multimodales: no disponibles (el modelo es exclusivamente de texto).
- Capacidades multilingues: limitadas al ingles segun la model card.

## Casos de uso

- Formacion y concienciacion en ciberseguridad: el modelo puede responder en ingles a preguntas conceptuales sobre autenticacion, autorizacion, cortafuegos o SIEM, sirviendo como asistente de estudio para equipos junior.
- Analisis asistido de logs: introduciendo un fragmento de log en el prompt, el modelo puede generar una interpretacion en lenguaje natural de posibles indicios de actividad sospechosa, util como primera pasada antes de la revision humana.
- Soporte en respuesta a incidentes: generar listas de comprobacion y pasos de triaje al investigar un servidor Linux comprometido, acelerando la fase inicial de contencion.
- Revision de codigo seguro: discutir patrones de vulnerabilidad como inyeccion SQL o desbordamiento de buffer y proponer mitigaciones defensivas en conversaciones tecnicas.
- Documentacion tecnica de seguridad: redactar borradores de politicas, procedimientos o notas tecnicas sobre controles de seguridad.
- Laboratorios CTF y entornos de aprendizaje: asistir en la comprension de conceptos detras de retos de seguridad, sin sustituir la practica directa.
- Prototipado rapido en hardware limitado: al ser un adaptador sobre un modelo de 2B, puede desplegarse en GPUs de consumo para demos internas o pruebas de concepto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K, CyberMetric, Cybench ni ninguna otra evaluacion cuantitativa, ni comparaciones con modelos similares.

## Requisitos de hardware

- El adaptador en si ocupa aproximadamente 0,1 GB, pero la inferencia requiere cargar el modelo base google/gemma-2b completo.
- Gemma 2B en precision completa (fp32) requiere en torno a 8 GB de VRAM; en fp16/bf16, alrededor de 4-5 GB; en cuantizacion de 8 bits, unos 2-3 GB; en 4 bits, en torno a 1,5-2 GB. Estas cifras son estimaciones para el modelo base de 2B, no datos publicados en la model card.
- Cabe en GPUs de consumo como RTX 3060 (12 GB), RTX 4060 Ti (16 GB), RTX 4070/4080/4090, e incluso en GPUs con 6-8 GB si se aplica cuantizacion.
- GPU recomendadas para mayor comodidad: RTX 3090, RTX 4090, A10, L4, A100 o H100 (estas ultimas claramente sobredimensionadas para un modelo de 2B).
- Opciones de despliegue: Transformers con PEFT (metodo documentado por el autor), vLLM, TGI o llama.cpp/Ollama si se fusiona el adaptador y se convierte a GGUF (esto ultimo no esta documentado en la model card).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GemmaCyber-2B | 2B (base) + adaptador LoRA | No disponible (base Gemma 2B: 8.192 tokens) | Ciberseguridad (LoRA sobre Gemma 2B) | No disponible | HuggingFace, adaptador PEFT |
| google/gemma-2b | 2B | 8.192 tokens | Modelo generalista | Terminos de uso de Gemma | HuggingFace |
| Gemma-2-2B (version posterior de Google) | 2B | 8.192 tokens | Modelo generalista | Terminos de uso de Gemma | HuggingFace |

No se dispone de datos de rendimiento publicados que permitan una comparacion cuantitativa con alternativas especializadas en ciberseguridad de tamano similar. La comparativa se limita por tanto a caracteristicas estructurales.

## Limitaciones y advertencias

- Al ser un ajuste fino de un modelo de 2.000 millones de parametros, su conocimiento factual y su capacidad de razonamiento son limitados en comparacion con modelos de mayor tamano; existe un riesgo alto de alucinacion, especialmente en detalles tecnicos precisos (versiones, CVE, comandos).
- No esta destinado a uso ofensivo: el autor lo orienta explicitamente a seguridad defensiva, educacion e investigacion. Un uso indebido podria generar contenido danino, aunque la model card no incluye guardarrailes documentados.
- Solo soporta ingles segun la informacion de HuggingFace; no se ha documentado rendimiento en castellano ni en otros idiomas.
- La licencia no esta indicada en la informacion disponible, lo que supone una incertidumbre importante para uso comercial. Ademas, al derivar de Gemma, se heredan los terminos de uso de Gemma de Google, que deben revisarse antes de cualquier despliegue productivo.
- No hay datos publicados sobre el dataset de entrenamiento, por lo que no se pueden evaluar sesgos especificos ni la calidad de la supervision.
- El repositorio tiene 0 descargas y 0 likes, y fue creado en octubre de 2026; no hay evidencia de validacion por parte de la comunidad ni de mantenimiento continuado.
- La fecha de creacion indicada (2026-10-03) es posterior a la del conocimiento habitual sobre modelos Gemma, lo que conviene verificar antes de considerarlo un artefacto consolidado.
- No se documenta soporte para tool calling, agentes ni cuantizacion; cualquier uso en produccion requerira validacion adicional de robustez, latencia y calidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/allenwoods823/GemmaCyber-2B
- Modelo base: https://huggingface.co/google/gemma-2b
- Terminos de uso de Gemma: https://ai.google.dev/gemma/terms
- Documentacion de PEFT: https://huggingface.co/docs/peft
- Documentacion de Transformers: https://huggingface.co/docs/transformers
