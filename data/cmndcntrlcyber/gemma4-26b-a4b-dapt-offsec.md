# cmndcntrlcyber/gemma4-26b-a4b-dapt-offsec

## Resumen

`cmndcntrlcyber/gemma4-26b-a4b-dapt-offsec` es un ajuste fino del modelo `google/gemma-4-26B-A4B-it`, publicado por el usuario cmndcntrlcyber en HuggingFace. Segun la informacion disponible, se ha entrenado con aprendizaje supervisado (SFT) utilizando la libreria TRL, y el sufijo del nombre sugiere una adaptacion de dominio orientada a seguridad ofensiva ("offsec") y a preentrenamiento adaptativo de dominio ("dapt"), si bien el autor no documenta explicitamente ni el dataset ni la metodologia en la model card.

El modelo base pertenece, por nomenclatura, a una familia con arquitectura de mezcla de expertos (MoE): el identificador "26B-A4B" indica 26 mil millones de parametros totales y aproximadamente 4 mil millones de parametros activos por token. Esta designacion procede del nombre del modelo base y no esta confirmada por documentacion adicional en la informacion proporcionada.

El interes de esta ficha es limitado pero honesto: se trata de un checkpoint con cero descargas y cero "likes" en el momento de la consulta, sin benchmarks publicados, sin licencia explicita y con un README que no detalla hiperparametros ni composicion del dataset. El repositorio ocupa unicamente 0,6 GB, un tamano incompatible con los pesos completos en bf16 de un modelo de 26B de parametros (que rondarian los 52 GB), lo que sugiere que contiene adaptadores o un checkpoint parcial, aunque esto no se confirma en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible. El nombre del modelo base ("A4B") apunta a una arquitectura de mezcla de expertos (MoE), no confirmado |
| Parametros totales | No disponible. La nomenclatura del modelo base indica 26B; no confirmado por documentacion |
| Parametros activos | No disponible. La nomenclatura del modelo base indica ~4B; no confirmado por documentacion |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el repositorio no incluye pesos GGUF ni variantes cuantizadas; solo safetensors) |
| Idiomas soportados | No disponible |
| Licencia | No disponible. El campo aparece como marcador de posicion ("licence: license") en la model card |
| Formato de pesos | safetensors (libreria transformers) |
| Tamano del repositorio | 0,6 GB |
| Modelo base | google/gemma-4-26B-A4B-it |
| Metodo de entrenamiento | SFT (supervised fine-tuning) con TRL |
| Version de TRL | 1.3.0 |
| Version de Transformers | 5.7.0 |
| Version de PyTorch | 2.11.0+cu128 |
| Version de Datasets | 4.8.5 |
| Version de Tokenizers | 0.22.2 |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-10 |
| Ultima actualizacion | 2026-09-10 |

## Arquitectura y entrenamiento

La informacion proporcionada no describe la arquitectura interna del modelo. El unico dato estructural es el nombre del modelo base, `google/gemma-4-26B-A4B-it`, cuya convencion de nomenclatura (total-activos) es habitual en modelos de mezcla de expertos con enrutado disperso, donde solo una fraccion de los parametros se activa por token. Cualquier afirmacion mas concreta sobre numero de expertos, top-k de enrutado, atencion, ventana de contexto o tipo de normalizacion seria una invencion y por tanto no se incluye.

Respecto al entrenamiento, la model card confirma que se trata de un ajuste supervisado realizado con TRL sobre el modelo base instruct. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, si hubo etapas de RLHF o DPO posteriores, ni los hiperparametros (tasa de aprendizaje, tamano de lote, epocas, estrategia de enmascarado de perdida). La seccion "Training procedure" de la model card esta practicamente vacia. El unico indicio del dominio de especializacion es el sufijo "offsec" del nombre del repositorio, que apunta a seguridad ofensiva, pero no hay ninguna descripcion del corpus utilizado.

Como innovacion tecnica, lo unico reseñable es el uso de la infraestructura HF Jobs (etiqueta `hf_jobs`) para lanzar el entrenamiento, y la compatibilidad declarada con endpoints gestionados (`endpoints_compatible`).

## Capacidades

- Generacion de texto conversacional multi-turno a traves de la API de `transformers`, tal como muestra el ejemplo de la model card con `pipeline("text-generation")`.
- Razonamiento y respuesta a preguntas de caracter general heredadas del modelo base instruct (Gemma 4 26B A4B it).
- Especializacion presumible en contenido de seguridad ofensiva por el ajuste de dominio, no documentada ni verificada mediante evaluacion alguna.
- No hay informacion disponible sobre soporte de tool calling o function calling.
- No hay informacion disponible sobre capacidades de agente o razonamiento multi-paso.
- No hay informacion disponible sobre cobertura multilingue.
- No hay informacion disponible sobre modos especiales (thinking mode, vision, audio) ni sobre si el modelo base los conserva tras el ajuste.

## Casos de uso

- Analisis y triage de alertas de seguridad: un analista SOC podria usar el modelo para resumir y priorizar alertas de SIEM, aprovechando la adaptacion de dominio si esta realmente ha especializado el vocabulario de seguridad ofensiva.
- Revision de codigo orientada a vulnerabilidades: integrado en un pipeline de CI/CD, el modelo podria generar comentarios sobre patrones de codigo inseguro (inyeccion, deserializacion no segura, uso incorrecto de criptografia) en revisiones de pull requests.
- Redaccion asistida de informes de pentest: dado el enfoque "offsec", encaja en la generacion de borradores de hallazgos, descripciones de impacto y recomendaciones de remediacion, siempre con revision humana.
- Formacion y laboratorios tipo CTF: generacion de explicaciones paso a paso sobre tecnicas y mitigaciones para entornos de entrenamiento controlados y con proposito educativo.
- Enriquecimiento de inteligencia de amenazas: resumen y normalizacion de informes no estructurados (advisories, CVE, notas de analistas) a un formato consistente.
- Asistente conversacional interno para equipos de seguridad: dado el ejemplo de uso conversacional de la model card, puede desplegarse como chatbot autohospedado para consultas de normativa, procedimientos internos o dudas tecnicas del equipo.
- Generacion de texto general: al derivar de un modelo instruct, puede emplearse en tareas genericas de redaccion, resumen y pregunta-respuesta, aunque no hay evaluacion que cuantifique cuanto se ha degradado esta capacidad tras el ajuste de dominio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye tablas de MMLU, HumanEval, GSM8K, MT-Bench ni de evaluaciones especificas de seguridad (por ejemplo, CyberSecEval o benchmarks de captura de bandera). Tampoco se aportan metricas de perdida de validacion ni comparaciones frente al modelo base, por lo que no es posible determinar si el ajuste mejora o degrada el rendimiento respecto a `google/gemma-4-26B-A4B-it`.

## Requisitos de hardware

Todas las cifras de esta seccion son estimaciones derivadas del tamano declarado en el nombre del modelo base (26B totales, ~4B activos) y no de mediciones realizadas sobre este checkpoint concreto.

- Pesos en bf16/fp16: aproximadamente 52 GB, mas activaciones y cache KV. Requiere al menos una GPU de 80 GB (H100, A100 80 GB, o similares) o dos GPU de 40 GB con tensor parallelism.
- Pesos en FP8: aproximadamente 26 GB, viable en una GPU de 40 GB o en una H100 80 GB con margen amplio.
- Cuantizacion de 4 bits (GPTQ, AWQ, bitsandbytes NF4): aproximadamente 14-16 GB, lo que permitiria ejecucion en una RTX 4090 (24 GB) o RTX 5090 (32 GB). En GPU de 16 GB el margen es muy ajustado y probablemente insuficiente con contexto largo.
- Es importante notar que el repositorio ocupa solo 0,6 GB, por lo que es muy probable que no contenga los pesos completos del modelo de 26B. En ese caso, sera necesario descargar por separado el modelo base `google/gemma-4-26B-A4B-it` y aplicar los adaptadores, con el coste de almacenamiento y VRAM asociado al modelo completo.
- Opciones de despliegue: `transformers` (confirmado por la model card y los tags), TGI y vLLM si la arquitectura MoE del modelo base esta soportada por esas herramientas, llama.cpp/Ollama solo si se generan pesos GGUF, que no se incluyen en el repositorio.
- No se dispone de datos de latencia, tiempo hasta el primer token ni throughput (tokens por segundo) para este checkpoint.

## Comparativa con modelos similares

Comparativa a nivel de arquitectura y disponibilidad. Los datos de los modelos alternativos proceden de informacion publica de esos modelos; los de este checkpoint figuran como no disponibles cuando el autor no los documenta.

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cmndcntrlcyber/gemma4-26b-a4b-dapt-offsec | No disponible (nomenclatura: 26B) | No disponible (nomenclatura: ~4B) | No disponible | No disponible | Publico en HuggingFace, 0 descargas, 0 likes |
| google/gemma-4-26B-A4B-it (modelo base) | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | No disponible | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada |
| Qwen3-30B-A3B-Instruct | ~30,5B | ~3,3B | 128K | Apache-2.0 | Ampliamente desplegado, ecosistema maduro |
| Mixtral 8x7B Instruct | ~46,7B | ~12,9B | 32K | Apache-2.0 | Ampliamente desplegado, ecosistema maduro |

En rendimiento no es posible establecer comparacion alguna, ya que este checkpoint no publica ninguna metrica. La comparativa se limita por tanto a tamano y disponibilidad.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, ni comparacion con el modelo base, ni analisis de regresion de capacidades. No se puede afirmar que el ajuste mejore nada.
- Licencia no especificada: el campo de licencia de la model card contiene un marcador de posicion ("licence: license"). Ademas, los terminos de uso del modelo base (Gemma) imponen sus propias condiciones, que deben revisarse antes de cualquier uso comercial. Sin licencia clara, no se recomienda su uso en produccion.
- Riesgo de alucinacion: no cuantificado. En dominios de seguridad, una alucinacion puede traducirse en recomendaciones de remediacion incorrectas, comandos erroneos o referencias falsas a CVE, con impacto operativo real.
- Sesgos conocidos: no documentados por el autor. No hay informacion sobre la composicion del dataset de ajuste, por lo que no se puede evaluar el sesgo introducido por la especializacion en seguridad ofensiva.
- Idiomas: no se declara cobertura linguistica. No hay garantia de que el modelo mantenga un rendimiento correcto en castellano tras un ajuste de dominio cuyo corpus se desconoce.
- Contexto: se desconoce la ventana de contexto efectiva de este checkpoint y si el ajuste la ha modificado.
- Trazabilidad: el repositorio ocupa 0,6 GB, un tamano que no corresponde a los pesos completos de un modelo de 26B. Conviene verificar que contiene exactamente (adaptadores, pesos parciales o cuantizacion) antes de intentar cargarlo.
- Reproducibilidad: no se documentan hiperparametros, semillas ni el dataset, por lo que el resultado no es reproducible.
- Advertencia de uso: la especializacion en seguridad ofensiva debe emplearse en contextos autorizados (pentest con contrato, red team interno, investigacion, formacion). No se debe utilizar para generar exploits dirigidos a sistemas sin autorizacion explicita.
- Madurez: cero descargas y cero interacciones. Es un artefacto sin validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cmndcntrlcyber/gemma4-26b-a4b-dapt-offsec
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Repositorio de TRL: https://github.com/huggingface/trl
- Documentacion de Transformers: https://huggingface.co/docs/transformers
- No se han encontrado enlaces relevantes en la busqueda web: los resultados devueltos corresponden a paginas de estado de un servicio de intercambio de criptomonedas y no guardan relacion con el modelo.
