# mradermacher/Mistral-Small-3.2-24B-Instruct-2506-ARA-heretic-GGUF

## Resumen

Mistral-Small-3.2-24B-Instruct-2506-ARA-heretic-GGUF es una cuantizacion estatica en formato GGUF del modelo richardyoung/Mistral-Small-3.2-24B-Instruct-2506-ARA-heretic, publicada por mradermacher. El modelo subyacente deriva de Mistral-Small-3.2-24B-Instruct-2506, un transformer denso de 23.572 millones de parametros desarrollado por Mistral AI, que fue sometido a un proceso de "abliteration" (eliminacion de la direccion de rechazo en el espacio de activaciones) por richardyoung para producir una variante "heretic" o "uncensored". Este repositorio no aporta pesos nuevos: solo ofrece conversiones a GGUF con distintas cuantizaciones para inferencia local eficiente.

La relevancia practica del artefacto es que permite ejecutar un modelo de 24B en hardware de consumo mediante llama.cpp, Ollama o LM Studio, con tamanos que van desde 9,0 GB (Q2_K) hasta 25,2 GB (Q8_0), y con un suplemento multimodal (mmproj) para las capacidades de vision heredadas del modelo base. Al estar cuantizado estaticamente (no imatrix), la calidad por bit es inferior a la de las variantes i1 del mismo autor, pero la reproducibilidad es total al no depender de calibracion.

El modelo conserva el soporte multilingue del original (24 idiomas declarados, incluidos espanol, catalan-adyacente como el gallego no listado, arabe, hindi, bengali y nepalí), la ventana de contexto de Mistral Small 3.2 y el formato conversacional con roles system/user/assistant. La licencia declarada es Apache-2.0, aunque el autor original etiqueta tambien openrail++ en los tags, lo que conviene verificar antes de uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (decoder-only), basado en Mistral-Small-3.2-24B-Instruct-2506 |
| Parametros totales | 23.572.403.200 (23,57 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Mistral Small 3.2) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; mmproj Q8_0 y f16 |
| Idiomas soportados | en, fr, de, es, pt, it, ja, ko, ru, zh, ar, fa, id, ms, ne, pl, ro, sr, sv, tr, uk, vi, hi, bn (24) |
| Licencia | apache-2.0 (tags incluyen openrail++) |
| Formato de pesos | GGUF (estaticos); repo original en safetensors |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer decoder-only denso de 24B parametros de la familia Mistral Small 3.2, entrenado por Mistral AI sobre un corpus multilingue propietario no detallado publicamente, con fases de instruccion (SFT) y preferencia (posiblemente DPO) para el checkpoint -Instruct-2506. La innovacion clave de esta variante no esta en el entrenamiento original sino en el post-procesado: richardyoung aplico tecnicas de abliteration (proyeccion ortogonal de la direccion de rechazo en capas residuales) para reducir la tendencia del modelo a rechazar peticiones, dando lugar al checkpoint "ARA-heretic".

mradermacher realizo una cuantizacion estatica (quantize_version 2, output_tensor_quantised 1, convert_type hf) sin imatrix, lo que significa que los factores de escala se derivan de los pesos originales sin calibracion con dataset. Esto hace el proceso reproducible bit a bit, a costa de una perplejidad ligeramente superior frente a las variantes i1 (weighted/imatrix) publicadas en el repositorio hermano. El suplemento mmproj (Q8_0 o f16) preserva el proyector multimodal del modelo base, permitiendo entrada de imagenes en llama.cpp.

## Capacidades

- Generacion de texto conversacional multi-turno en 24 idiomas, con calidad especialmente cuidada en ingles, frances, aleman, espanol, italiano y portugues.
- Razonamiento de proposito general: matematicas, logica, analisis de texto y sintesis.
- Generacion y revision de codigo en lenguajes habituales (Python, JavaScript, C++, Rust, etc.), heredada del modelo Instruct.
- Capacidades multimodales de vision (descripcion de imagenes, OCR basico, VQA) mediante el suplemento mmproj.
- Modo "uncensored": menor tasa de rechazos en prompts sensibles, util para investigacion sobre seguridad y alineacion.
- Soporte de conversacion con system prompt y plantilla de chat Mistral.
- No se documenta explicitamente soporte de tool calling nativo ni modo thinking en la informacion proporcionada.

## Casos de uso

- Investigacion sobre alineacion y seguridad: comparar respuestas del modelo heretic frente al Instruct original permite estudiar como la abliteration altera la tasa de rechazos y la calidad general, usando las cuantizaciones Q4_K_M como referencia reproducible.
- Despliegue local en estaciones de trabajo: con Q4_K_M (14,4 GB) cabe en GPUs de 16-24 GB y permite prototipado rapido sin depender de APIs externas, manteniendo 24 idiomas.
- Generacion de codigo en entornos offline: el modelo puede integrarse en editores o pipelines locales via llama.cpp u Ollama para autocompletado, refactorizacion y explicacion de fragmentos, con Q5_K_M (16,9 GB) como compromiso calidad/velocidad.
- Atencion al cliente multilingue en infraestructura propia: la ventana de contexto del modelo base y el soporte de 24 idiomas permiten gestionar conversaciones multi-turno en espanol, arabe o hindi sin salir del perimetro del cliente.
- Procesamiento documental con vision: usando mmproj f16 o Q8_0, el modelo puede describir capturas, extraer texto de imagenes y responder preguntas sobre diagramas en flujos de digitalizacion.
- Analisis de textos largos y resumenes: cuantizaciones Q6_K o Q8_0 preservan mejor la coherencia en contextos extensos, adecuadas para resumen de informes tecnicos o legales.
- Experimentacion creativa sin restricciones: la variante heretic es util para generacion de ficcion, guiones o contenido creativo donde el modelo original rechazaria prompts.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de mradermacher no incluye metricas de MMLU, HumanEval, GSM8K ni comparativas numericas; solo referencias cualitativas a la calidad relativa de cada cuantizacion (Q4_K_S y Q4_K_M marcadas como "fast, recommended"; Q8_0 como "fast, best quality"; Q3_K_M como "lower quality").

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin KV cache): Q2_K ~9,0 GB; Q3_K_S ~10,5 GB; IQ4_XS ~13,0 GB; Q4_K_M ~14,4 GB; Q5_K_M ~16,9 GB; Q6_K ~19,4 GB; Q8_0 ~25,2 GB. Sumar 0,6-1,0 GB adicionales si se usa mmproj.
- GPUs recomendadas: RTX 4090 (24 GB) para Q4_K_M o Q5_K_M con contexto moderado; RTX 3090 (24 GB) equivalente; A100 40/80 GB o H100 para Q8_0 y contextos largos; RTX 4060 Ti 16 GB para Q3_K_M o IQ4_XS.
- Cabe en GPU de consumo: si, en RTX 4090/3090 (Q4-Q5), RTX 4060 Ti 16 GB (Q3-Q4), y en GPUs de 12 GB solo con Q2_K o Q3_K_S y contexto recortado.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp, text-generation-webui; vLLM y TGI no admiten GGUF de forma nativa (requieren conversion a safetensors o uso de variantes AWQ/GPTQ).
- Latencia y throughput: no disponibles en la informacion proporcionada; dependen fuertemente de la GPU y del backend.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Mistral-Small-3.2-24B-Instruct-2506-ARA-heretic-GGUF (este) | 23,57 B | no disponible | apache-2.0 | GGUF (multiples quants) | Variante abliterated, cuantizacion estatica |
| richardyoung/Mistral-Small-3.2-24B-Instruct-2506-ARA-heretic | 23,57 B | no disponible | apache-2.0 | safetensors | Modelo origen sin cuantizar |
| mradermacher/Mistral-Small-3.2-24B-Instruct-2506-ARA-heretic-i1-GGUF | 23,57 B | no disponible | apache-2.0 | GGUF imatrix | Cuantizacion calibrada, mayor calidad por bit |
| Mistral-Small-3.2-24B-Instruct-2506 (original) | 23,57 B | no disponible | Apache-2.0 | safetensors | Modelo oficial con alineacion intacta |

## Limitaciones y advertencias

- La abliteration reduce la tasa de rechazos, pero no elimina sesgos: el modelo puede reproducir sesgos de genero, raza, religion o nacionalidad presentes en los datos de entrenamiento originales.
- Riesgo elevado de alucinacion en tareas factuales, especialmente en cuantizaciones bajas (Q2_K, Q3_K_S) donde la perplejidad aumenta de forma notable.
- La cuantizacion estatica sin imatrix degrada mas la calidad que las variantes i1 del mismo autor; para produccion se recomienda Q4_K_M o superior, o directamente el checkpoint safetensors.
- La licencia apache-2.0 convive con tags openrail++ en el repositorio original; conviene verificar la licencia efectiva del modelo base antes de uso comercial, ya que la abliteration puede afectar la interpretacion de los terminos de uso.
- El modelo "uncensored" puede generar contenido sensible, ofensivo o legalmente restringido segun jurisdiccion; no es apto para aplicaciones orientadas a usuarios finales sin filtros adicionales.
- La ventana de contexto exacta no se documenta en la informacion proporcionada; debe confirmarse contra la model card del modelo base Mistral Small 3.2 antes de disenar flujos con documentos largos.
- El soporte de tool calling y modo thinking no esta confirmado en esta variante; verificar empiricamente antes de integrar en agentes.
- El repositorio ocupa 162,8 GB por incluir todas las cuantizaciones; descargar solo el archivo GGUF necesario y el mmproj si se requiere vision.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Mistral-Small-3.2-24B-Instruct-2506-ARA-heretic-GGUF
- Modelo base (safetensors): https://huggingface.co/richardyoung/Mistral-Small-3.2-24B-Instruct-2506-ARA-heretic
- Variante imatrix del mismo autor: https://huggingface.co/mradermacher/Mistral-Small-3.2-24B-Instruct-2506-ARA-heretic-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Mistral-Small-3.2-24B-Instruct-2506-ARA-heretic-GGUF
- FAQ y peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Grafico comparativo de perplejidad por quant (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
