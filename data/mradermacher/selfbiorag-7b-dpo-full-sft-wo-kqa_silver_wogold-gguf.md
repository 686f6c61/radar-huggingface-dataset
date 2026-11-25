# mradermacher/selfbiorag-7b-dpo-full-sft-wo-kqa_silver_wogold-GGUF

## Resumen

SelfBioRAG-7B-DPO-full-SFT-wo-kqa_silver_wogold es un modelo de lenguaje de 6.738.546.688 parametros (aproximadamente 7B) derivado del modelo base Minbyul/selfbiorag-7b-dpo-full-sft-wo-kqa_silver_wogold. La version aqui documentada es una cuantizacion GGUF estatica producida por mradermacher, un conocido cuantizador de la comunidad de Hugging Face, a partir de los pesos originales en formato transformers. El modelo original fue entrenado mediante un pipeline de alignment-handbook y TRL que combina SFT (supervised fine-tuning) y DPO (direct preference optimization) sobre el dataset HuggingFaceH4/ultrafeedback_binarized.

El nombre del modelo sugiere un origen vinculado a SelfBioRAG, un proyecto de generacion aumentada por recuperacion (RAG) orientado al dominio biomedico, aunque la model card disponible no documenta explicitamente la composicion del dataset de entrenamiento ni el proceso de filtrado. La variante "wo-kqa_silver_wogold" indica que el entrenamiento se realizo sin ciertos subconjuntos de datos (probablemente preguntas-respuestas de conocimiento y ejemplos "silver"/"gold"), lo que sugiere una ablacion experimental para evaluar el impacto de esos datos.

La relevancia de esta ficha radica en que permite ejecutar el modelo en hardware de consumo mediante cuantizacion GGUF (desde 2,6 GB en Q2_K hasta 13,6 GB en f16), algo imposible con los pesos originales en precision completa. Esta pensado para desarrolladores que quieran experimentar con un modelo afinado para dominio biomedico y RAG sin necesidad de GPUs de datacenter.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de un modelo 7B, detalles no disponibles) |
| Parametros totales | 6.738.546.688 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estaticas); pesos originales en safetensors/transformers |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer decoder-only de aproximadamente 7B parametros, aunque la model card no especifica la familia exacta (Llama, Mistral, Qwen u otra). El modelo original fue entrenado en dos fases: primero un supervised fine-tuning (SFT) completo y despues un ajuste por preferencias con DPO (Direct Preference Optimization), usando las herramientas de alignment-handbook y TRL. El dataset de preferencias empleado es HuggingFaceH4/ultrafeedback_binarized, un corpus estandar de pares de respuestas preferidas/rechazadas ampliamente usado en la comunidad.

El sufijo "wo-kqa_silver_wogold" del nombre indica que el entrenamiento excluyo determinados subconjuntos de datos (probablemente preguntas de conocimiento biomedico y ejemplos etiquetados como "silver" y "gold"), lo que apunta a un experimento de ablacion. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion exacta del dataset de SFT ni si se aplicaron tecnicas adicionales como RLHF con recompensa aprendida. Tampoco hay datos sobre innovaciones arquitectonicas especificas (atencion lineal, decodificacion especulativa, etc.).

## Capacidades

- Generacion de texto en ingles con ajuste por preferencias (DPO), lo que tiende a producir respuestas mas alineadas con las preferencias humanas que el modelo base.
- Razonamiento y respuesta a preguntas, presumiblemente orientado al dominio biomedico por el nombre del proyecto SelfBioRAG, aunque no hay documentacion que lo confirme.
- Soporte de conversacion multi-turno (formato chat no documentado explicitamente en la model card).
- Capacidad de servir como generador en pipelines RAG (retrieval-augmented generation), dado el origen del nombre del modelo.
- No hay evidencia documentada de soporte de tool calling, function calling, agentes, vision, audio ni modo "thinking".
- Capacidades multilingues limitadas al ingles segun el campo `language` de la model card.

## Casos de uso

- Generacion aumentada por recuperacion en dominio biomedico: el modelo puede actuar como generador final en un pipeline RAG que recupere articulos o guias clinicas y le pase el contexto para sintetizar respuestas. Su nombre y origen lo orientan a este escenario, aunque la calidad real debe validarse.
- Experimentacion con alignment y DPO: util para investigadores que quieran comparar el efecto de excluir subconjuntos de datos (kqa, silver, gold) en el comportamiento final del modelo frente a la variante completa.
- Despliegue en hardware de consumo: con cuantizaciones Q4_K_M (4,2 GB) o Q5_K_M (4,9 GB) puede ejecutarse en GPUs consumer de 8 GB o incluso en CPU con llama.cpp, lo que facilita prototipado local.
- Chatbot de dominio acotado en ingles: para asistentes conversacionales especializados donde se controle el contexto recuperado y se requiera baja latencia en local.
- Evaluacion de cuantizaciones: el amplio catalogo de quants (desde Q2_K hasta f16) permite estudiar la degradacion de calidad frente al modelo original en tareas de generacion biomedica.
- Fine-tuning posterior o destilacion: los pesos originales en transformers (no solo los GGUF) pueden servir como punto de partida para ajustes adicionales con TRL.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto): Q2_K ~2,6 GB; Q3_K_M ~3,4 GB; Q4_K_M ~4,2 GB; Q5_K_M ~4,9 GB; Q6_K ~5,6 GB; Q8_0 ~7,3 GB; f16 ~13,6 GB.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4090 24 GB para cuantizaciones altas; A100/H100 solo necesarias para f16 con contextos largos o serving de alta concurrencia.
- Cabe en GPU consumer: si, en la mayoria de tarjetas con 8 GB o mas usando Q4_K_M o inferiores; las cuantizaciones Q2_K y Q3_K_S pueden caber en 4-6 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; los pesos originales en transformers pueden servirse con vLLM o TGI (aunque esta ficha solo cubre los GGUF).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| selfbiorag-7b-dpo-full-sft-wo-kqa_silver_wogold (este) | 6,74B | no disponible | no disponible | GGUF, safetensors | Afinado SFT+DPO, dominio biomedico/RAG, solo ingles |
| Minbyul/selfbiorag-7b-dpo-full-sft-wo-kqa_silver_wogold | ~7B | no disponible | no disponible | safetensors | Modelo base sin cuantizar del que deriva esta ficha |
| Mistral-7B-Instruct-v0.2 | 7,24B | 32k | Apache 2.0 | safetensors, GGUF | Referencia generalista 7B con licencia permisiva y contexto amplio |
| Llama-3.1-8B-Instruct | 8,03B | 128k | Llama 3.1 Community License | safetensors, GGUF | Alternativa generalista con contexto muy superior y licencia con restricciones |

La comparativa es aproximada: no hay datos publicos de rendimiento de este modelo que permitan una comparacion cuantitativa con las alternativas. La principal diferencia frente a Mistral-7B-Instruct y Llama-3.1-8B-Instruct es la especializacion (presuntamente biomedica) y la ausencia de informacion sobre licencia, lo que supone un riesgo para uso comercial frente a alternativas con licencias claras.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido; debe contactarse con el autor original antes de desplegar en produccion.
- Solo soporta ingles segun la model card; el rendimiento en castellano u otros idiomas no esta documentado y probablemente sea deficiente.
- Riesgo de alucinacion: como todo modelo 7B afinado con DPO, puede generar afirmaciones plausibles pero falsas, especialmente critico en dominio biomedico.
- La model card no documenta sesgos conocidos, composicion del dataset de SFT ni procesos de filtrado, lo que dificulta evaluar riesgos de sesgo.
- Longitud de contexto no documentada: no se puede planificar su uso en RAG con contextos largos sin validacion empirica.
- El modelo es una ablacion ("wo-kqa_silver_wogold"), por lo que podria tener un rendimiento inferior a la variante completa en tareas de conocimiento biomedico.
- Las cuantizaciones de baja precision (Q2_K, Q3_K_S) degradan notablemente la calidad; para produccion se recomienda Q4_K_M o superior.
- No hay evidencia de soporte de tool calling ni de modo agente; no debe asumirse su disponibilidad.
- El repositorio GGUF ocupa 59,6 GB en total por incluir todas las cuantizaciones; conviene descargar solo el archivo necesario.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/selfbiorag-7b-dpo-full-sft-wo-kqa_silver_wogold-GGUF
- Modelo base (pesos originales): https://huggingface.co/Minbyul/selfbiorag-7b-dpo-full-sft-wo-kqa_silver_wogold
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#selfbiorag-7b-dpo-full-sft-wo-kqa_silver_wogold-GGUF
- Dataset de preferencias usado en DPO: https://huggingface.co/datasets/HuggingFaceH4/ultrafeedback_binarized
- Alignment Handbook (framework de entrenamiento): https://github.com/huggingface/alignment-handbook
- TRL (framework de RLHF/DPO): https://github.com/huggingface/trl
- Guia de uso de GGUF (README de referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
