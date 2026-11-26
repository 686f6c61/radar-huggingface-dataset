# mradermacher/Qwen3.8-27B-Fable-Distill-Heretic-ara-GGUF

## Resumen

Qwen3.8-27B-Fable-Distill-Heretic-ara-GGUF es una distribucion de cuantizaciones GGUF del modelo armand0e/Qwen3.8-27B-Fable-Distill-Heretic-ara, publicada por mradermacher. No se trata de un modelo entrenado desde cero, sino de una conversion y cuantizacion estatica del checkpoint original en formato Hugging Face, orientada a inferencia local con llama.cpp y derivados. El modelo de partida declara 27.320.697.856 parametros (unos 27,3 mil millones) y pertenece a la familia Qwen3.8, segun la nomenclatura del autor, con un proceso de destilacion sobre Fable y un tratamiento "heretic/abliterated" que elimina las capas de rechazo del modelo original.

La relevancia de esta ficha radica en que permite ejecutar un modelo de ~27B en hardware de consumo mediante cuantizaciones de 11 a 29 GB, incluyendo un suplemento multimodal mmproj (proyector de vision) en Q8_0 y f16. El repositorio ocupa 190,8 GB e incluye 13 archivos GGUF, entre ellos Q2_K, Q3_K_S/M/L, IQ4_XS, Q4_K_S/M, Q5_K_S/M, Q6_K y Q8_0. La model card original esta practicamente vacia: no documenta dataset de entrenamiento, contexto, benchmarks ni licencia, por lo que buena parte de las especificaciones tecnicas queda como "no disponible".

El interes practico es acotado y muy especifico: desarrolladores que necesitan un modelo conversacional sin restricciones de rechazo, con soporte de imagenes via mmproj, desplegable en una sola GPU consumer o en CPU con llama.cpp. El precio es una trazabilidad muy baja: no hay informacion sobre el proceso de destilacion, el dataset de "abliteracion" ni las condiciones de uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.8, segun nomenclatura del autor); detalles de atencion no disponibles |
| Parametros totales | 27.320.697.856 (~27,3B) |
| Parametros activos | no disponible (no hay indicios de MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; mmproj Q8_0 y f16 |
| Idiomas soportados | en (declarado en la model card) |
| Licencia | no disponible |
| Formato de pesos | GGUF (estaticos); checkpoint base en safetensors/HF |
| Repositorio | 190,8 GB, 13 archivos GGUF |
| Cuantizaciones imatrix | disponibles en mradermacher/Qwen3.8-27B-Fable-Distill-Heretic-ara-i1-GGUF |
| Multimodal | si, mediante proyector mmproj (Q8_0: 0,7 GB; f16: 1,0 GB) |
| Etiquetas | heretic, uncensored, decensored, abliterated, ara, conversational, endpoints_compatible |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de que se trata de un transformer decoder-only de la familia Qwen3.8 con aproximadamente 27,3 mil millones de parametros. El nombre del checkpoint base (Fable-Distill-Heretic-ara) sugiere tres etapas: destilacion desde un modelo "Fable" no identificado, un proceso de "abliteracion" o "heretic" que elimina direcciones de rechazo en el espacio de activaciones, y un ajuste adicional etiquetado "ara". Ninguno de estos pasos esta documentado con numero de tokens, composicion del dataset, uso de RLHF/DPO ni hiperparametros.

La presencia de archivos mmproj indica que el modelo incorpora un proyector multimodal para entrada de imagenes, probablemente heredado del modelo base. No hay informacion sobre atencion lineal, decodificacion especulativa, GQA ni estrategias de RoPE. Todas estas incognitas son relevantes para produccion: sin conocer la ventana de contexto real ni el tokenizador exacto, no se puede garantizar el comportamiento en conversaciones largas o en tareas de recuperacion.

## Capacidades

- Generacion de texto conversacional multi-turno, segun la etiqueta "conversational".
- Procesamiento de imagenes mediante el proyector mmproj incluido en el repositorio.
- Comportamiento sin rechazo ("uncensored", "decensored", "abliterated"): responde a prompts que el modelo original rechazaria.
- Compatibilidad con endpoints (etiqueta "endpoints_compatible"), lo que sugiere uso via APIs compatibles con OpenAI en plataformas de inferencia.
- Capacidad multilingue limitada al ingles segun la model card; no se declara soporte de castellano.
- Tool calling, function calling y razonamiento multi-paso: no disponibles como capacidades documentadas.
- Modo thinking explicito: no disponible.
- Audio: no disponible.

## Casos de uso

- Investigacion sobre alineacion y abliteracion: comparar las respuestas del modelo heretic con las del checkpoint original para estudiar que comportamientos se eliminan al aplicar la direccion de rechazo, usando las cuantizaciones Q8_0 para maximizar fidelidad.
- Despliegue local en estaciones de trabajo: con Q4_K_M (16,9 GB) cabe en una RTX 4090 de 24 GB o en una RTX 3090, permitiendo prototipos conversacionales sin depender de servicios en la nube.
- Analisis de imagenes en entornos offline: el mmproj Q8_0 (0,7 GB) permite describir capturas de pantalla, diagramas o fotografias en pipelines locales con llama.cpp, util para auditoria de documentos escaneados.
- Generacion creativa sin filtros: escritura de ficcion, guiones o dialogos donde el modelo original aplicaria rechazos, con Q5_K_M (19,6 GB) para equilibrar calidad y VRAM.
- Evaluacion de cuantizaciones: usar los 11 niveles publicados para medir la degradacion de perplejidad en tareas concretas y elegir el punto optimo entre Q3_K_M (13,6 GB) y Q6_K (22,5 GB).
- Red teaming interno: generar prompts adversarios y estudiar respuestas sin rechazo en un entorno controlado, aprovechando el formato GGUF para aislar la inferencia en maquinas sin red.
- Prototipado de asistentes conversacionales en CPU: con Q2_K (11,0 GB) o Q3_K_S (12,4 GB) el modelo puede correr en equipos con 16 GB de RAM via llama.cpp, aunque con calidad reducida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K, MT-Bench ni metricas de perplejidad para las cuantizaciones. Tampoco hay comparaciones con el checkpoint base ni con modelos de tamano similar.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + overhead de contexto, aproximada): Q2_K ~12 GB, Q3_K_S ~13,5 GB, Q3_K_M ~14,7 GB, Q3_K_L ~15,8 GB, IQ4_XS ~16,6 GB, Q4_K_S ~17 GB, Q4_K_M ~18 GB, Q5_K_S ~20,2 GB, Q5_K_M ~20,7 GB, Q6_K ~23,6 GB, Q8_0 ~30,2 GB. Anadir ~1 GB si se usa mmproj f16.
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M y Q5_K_M; RTX 3090 o RTX 4080 para Q4_K_S; A100 40 GB o H100 para Q6_K y Q8_0 con contexto largo; A10G 24 GB para Q4_K_M en servicios cloud.
- Cabe en GPU consumer: si, en RTX 4090/3090 con Q4_K_M o inferiores; en GPUs de 16 GB (RTX 4060 Ti, RTX 4070 Ti Super) solo con Q2_K o Q3_K_S y contexto recortado.
- Despliegue: llama.cpp, Ollama (importando el GGUF), LM Studio, koboldcpp y servidores compatibles con la API de OpenAI. vLLM y TGI no soportan GGUF de forma nativa para este formato, por lo que requeririan el checkpoint base en safetensors.
- Latencia y throughput: no disponibles; dependen de la GPU y del nivel de cuantizacion. Como referencia orientativa, un modelo denso de ~27B en Q4_K_M sobre RTX 4090 suele situarse en decenas de tokens por segundo, pero no hay mediciones publicadas para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-Fable-Distill-Heretic-ara (este) | ~27,3B | no disponible | no disponible | GGUF, safetensors | Destilado, abliterated, multimodal via mmproj |
| Qwen2.5-32B-Instruct (referencia de tamano) | 32,5B | 32.768 tokens (ampliable) | Apache 2.0 | safetensors, GGUF | Modelo oficial con benchmarks publicados |
| Gemma-2-27B-it (referencia de tamano) | 27B | 8.192 tokens | Gemma Terms | safetensors, GGUF | Contexto corto, licencia restringida |
| Yi-34B-Chat (referencia de tamano) | 34B | 4.096 tokens | Apache 2.0 (con condiciones) | safetensors, GGUF | Menor contexto nativo |

La comparacion es aproximada: no hay datos de rendimiento del modelo heretic, y los modelos de referencia pertenecen a generaciones y familias distintas. La ventaja diferencial de este checkpoint es la ausencia de rechazos y la disponibilidad inmediata en 11 cuantizaciones GGUF; la desventaja es la falta de licencia, benchmarks y documentacion de contexto.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar el uso comercial; tratar como no apto para produccion hasta verificar el checkpoint base armand0e/Qwen3.8-27B-Fable-Distill-Heretic-ara.
- Trazabilidad nula: no se documenta el dataset de destilacion, el proceso de abliteracion ni el ajuste "ara"; imposible auditar sesgos de origen.
- Modelo "uncensored/abliterated": eliminara rechazos de seguridad, lo que implica riesgo de generar contenido danino, ilegal o NSFW; requiere moderacion externa en cualquier despliegue publico.
- Riesgo de alucinacion elevado por la destilacion y por la falta de evaluacion publicada; no hay benchmarks que permitan estimar su fiabilidad.
- Contexto desconocido: sin ventana documentada, no se recomienda para tareas de contexto largo, RAG con muchos documentos ni conversaciones extensas.
- Idiomas: solo ingles declarado; el rendimiento en castellano no esta verificado y probablemente sea inferior.
- Cuantizaciones bajas (Q2_K, Q3_K_S) degradan notablemente la calidad; la propia model card marca Q3_K_M como "lower quality".
- El repositorio pesa 190,8 GB; descargar solo el archivo GGUF necesario, no el repo completo.
- Sin pipeline declarado y con solo 244 descargas y 1 like: comunidad minima, sin garantias de mantenimiento.
- El suplemento mmproj es necesario para vision; sin el, el modelo funciona solo como texto.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Qwen3.8-27B-Fable-Distill-Heretic-ara-GGUF
- Modelo base: https://huggingface.co/armand0e/Qwen3.8-27B-Fable-Distill-Heretic-ara
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Qwen3.8-27B-Fable-Distill-Heretic-ara-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Qwen3.8-27B-Fable-Distill-Heretic-ara-GGUF
- Guia de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de perplejidad por tipo de cuantizacion: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
- nethype GmbH: https://www.nethype.de/
