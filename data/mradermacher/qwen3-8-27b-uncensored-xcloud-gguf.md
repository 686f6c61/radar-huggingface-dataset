# mradermacher/Qwen3.8-27B-Uncensored-xCloud-GGUF

## Resumen

Qwen3.8-27B-Uncensored-xCloud-GGUF es una cuantizacion estatica en formato GGUF del modelo xCloudinfo/Qwen3.8-27B-Uncensored-xCloud, un modelo de lenguaje de 27.320.697.856 parametros (aproximadamente 27,3 mil millones) derivado de la familia Qwen y modificado mediante tecnicas de "abliteration" para eliminar los mecanismos de rechazo y censura del modelo original. El trabajo de cuantizacion lo firma mradermacher, un conocido publicador de cuantizaciones GGUF en Hugging Face, mientras que el modelo base lo desarrolla xCloudinfo.

El modelo esta pensado para inferencia local en hardware de consumo y semiprofesional: el repositorio incluye cuantizaciones desde Q2_K (11,0 GB) hasta Q8_0 (29,1 GB), ademas de dos ficheros mmproj (Q8_0 de 0,7 GB y f16 de 1,0 GB) que indican soporte multimodal, es decir, capacidad de procesar imagenes junto a texto. La licencia declarada es Apache 2.0 y los idiomas soportados segun la model card son chino (zh) e ingles (en).

Su relevancia actual reside en dos factores: por un lado, ofrece un modelo de ~27B en formato GGUF listo para llama.cpp, Ollama o LM Studio sin necesidad de infraestructura de GPU de datacenter; por otro, la variante "uncensored/abliterated" atrae a quienes necesitan un modelo sin rechazos por defecto para investigacion sobre seguridad, generacion de contenido creativo adulto o evaluacion de sesgos, aceptando el coste de alineamiento reducido. El numero de descargas (200) y de likes (0) indica un modelo de nicho con adopcion temprana.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen, segun tag "qwen3.5"); detalles exactos no disponibles |
| Parametros totales | 27.320.697.856 (~27,3 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; mmproj Q8_0 y f16 |
| Idiomas soportados | chino (zh), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); modelo base en safetensors |
| Tamano del repositorio | 190,8 GB |
| Modelo base | xCloudinfo/Qwen3.8-27B-Uncensored-xCloud |
| Modalidad | Texto e imagen (presencia de ficheros mmproj) |
| Libreria declarada | transformers |
| Etiquetas | uncensored, abliterated, qwen3.5, xCloudinfo, endpoints_compatible |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base mas alla de su pertenencia a la familia Qwen (etiqueta "qwen3.5") y de su naturaleza de transformer decoder-only con aproximadamente 27,3 mil millones de parametros. No se especifican el numero de capas, la dimension oculta, el numero de cabezas de atencion ni si emplea atencion lineal, decodificacion especulativa u otras optimizaciones. Tampoco se documenta la longitud de contexto nativa, un dato critico que en la familia Qwen suele situarse en decenas de miles de tokens, pero que aqui no puede confirmarse.

Respecto al entrenamiento, la model card no aporta informacion sobre el volumen de tokens, la composicion del dataset, ni si se aplicaron fases de RLHF, DPO o similares. Lo que si se deduce de las etiquetas es que el modelo ha pasado por un proceso de "abliteration": una tecnica de edicion de pesos que identifica y suprime las direcciones de activacion asociadas a la negativa a responder, reduciendo el alineamiento de seguridad sin reentrenar desde cero. Esta intervencion suele degradar ligeramente capacidades generales y puede desestabilizar el comportamiento en tareas que dependen de rechazos calibrados.

La cuantizacion la realiza mradermacher con su pipeline habitual (convert_type hf, quantize_version 2, output_tensor_quantised 1). El repositorio incluye cuantizaciones estaticas; las cuantizaciones ponderadas con imatrix se publican en un repositorio separado (sufijo i1). La presencia de ficheros mmproj confirma que el modelo base incorpora un proyector multimodal para entrada de imagenes, aunque no se detalla el codificador visual empleado.

## Capacidades

- Generacion de texto conversacional multi-turno en chino e ingles.
- Procesamiento de imagenes: los ficheros mmproj (Q8_0 y f16) permiten entrada multimodal en llama.cpp y derivados.
- Modo "uncensored": responde sin los rechazos por defecto del modelo alineado original, lo que amplia el rango de prompts atendidos.
- Razonamiento y generacion de codigo: capacidades heredadas de la familia Qwen, aunque sin benchmarks publicados que las cuantifiquen en esta variante.
- Compatibilidad con endpoints: la etiqueta endpoints_compatible sugiere integracion con APIs compatibles con OpenAI en plataformas de despliegue.
- Soporte de tool calling y function calling: no confirmado en la informacion disponible.
- Capacidades de agente y razonamiento multi-paso: no confirmadas en la informacion disponible.
- Capacidades de audio: no disponibles.

## Casos de uso

- Investigacion sobre alineamiento y seguridad: el modelo permite estudiar como varia la tasa de rechazo y la calidad de respuesta tras la abliteracion, comparando directamente con el modelo base alineado en experimentos controlados.
- Generacion creativa sin restricciones: escritura de ficcion adulta, terror o narrativa con violencia explicita, donde los modelos alineados suelen declinar; el modo uncensored evita interrupciones del flujo creativo.
- Inferencia local en estaciones de trabajo: con la cuantizacion Q4_K_M (16,9 GB) cabe en una GPU de 24 GB como la RTX 4090, permitiendo prototipado offline sin costes de API.
- Procesamiento de documentos con imagenes: gracias a los ficheros mmproj, puede extraer y comentar contenido de capturas, diagramas o documentos escaneados en flujos de trabajo con llama.cpp.
- Evaluacion de sesgos y robustez: util para medir como la supresion de direcciones de rechazo afecta a la toxicidad, la veracidad y la coherencia en distintos dominios.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse en local con pesos Apache 2.0, permite tratar datos sensibles sin enviarlos a servicios externos, siempre que se asuma la ausencia de filtros de seguridad.
- Traduccion y asistencia bilingue chino-ingles: uso como asistente de redaccion o traduccion en pares zh-en, los dos idiomas declarados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada segun cuantizacion (solo pesos): Q2_K ~11,0 GB; Q3_K_S ~12,4 GB; Q3_K_M ~13,6 GB; Q3_K_L ~14,7 GB; IQ4_XS ~15,5 GB; Q4_K_S ~15,9 GB; Q4_K_M ~16,9 GB; Q5_K_S ~19,1 GB; Q5_K_M ~19,6 GB; Q6_K ~22,5 GB; Q8_0 ~29,1 GB.
- Añadir entre 0,7 GB y 1,0 GB adicionales si se activa la entrada multimodal con mmproj.
- Reservar VRAM extra para el contexto KV cache; el modelo no documenta su longitud de contexto, por lo que el consumo por token debe medirse empiricamente.
- GPU de consumo: Q4_K_M cabe en una RTX 4090 (24 GB) o RTX 3090 (24 GB); Q5 y Q6 requieren 24 GB con margen ajustado; Q8_0 necesita 32 GB o mas (RTX 5090, A6000) o reparto entre GPU y CPU.
- GPU profesionales: A100 40/80 GB y H100 permiten Q8_0 con contexto amplio y mayor throughput.
- Despliegue: llama.cpp, Ollama, LM Studio, koboldcpp y servidores compatibles con GGUF; vLLM y TGI no soportan GGUF de forma nativa para este formato.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-Uncensored-xCloud (este) | ~27,3 B | no disponible | Apache 2.0 | GGUF, safetensors | Variante abliterated, multimodal via mmproj, zh/en |
| Modelo base xCloudinfo/Qwen3.8-27B-Uncensored-xCloud | ~27,3 B | no disponible | Apache 2.0 | safetensors | Mismo modelo sin cuantizar; referencia para comparar degradacion por cuantizacion |
| Qwen2.5-32B-Instruct (referencia de familia) | ~32,5 B | 131.072 tokens | Apache 2.0 | safetensors, GGUF | Alineado, sin abliteration; comparacion de tamano y licencia, no de esta variante concreta |
| Gemma 2 27B Instruct (referencia de tamano) | ~27 B | 8.192 tokens | Gemma license | safetensors, GGUF | Tamano comparable, licencia mas restrictiva y contexto menor |

Las cifras de modelos de referencia corresponden a especificaciones publicas ampliamente conocidas; los datos del modelo base xCloudinfo no estan disponibles mas alla de lo indicado.

## Limitaciones y advertencias

- Modelo abliterated: la supresion de rechazos elimina buena parte de las salvaguardas, por lo que puede generar contenido danino, ilegal o sexualmente explicito sin aviso. No es apto para aplicaciones orientadas al publico general sin filtros externos.
- Riesgo elevado de alucinacion: la edicion de pesos para reducir rechazos puede afectar a la calibracion; sin benchmarks publicados no hay evidencia de su fiabilidad factual.
- Idiomas limitados: solo chino e ingles declarados; el rendimiento en castellano no esta verificado y probablemente sea inferior.
- Contexto desconocido: la ausencia de documentacion sobre la ventana de contexto impide planificar aplicaciones de contexto largo con garantias.
- Sin benchmarks: no hay datos de MMLU, HumanEval, GSM8K ni evaluaciones de seguridad, lo que dificulta comparar su calidad real frente al modelo base alineado.
- Licencia Apache 2.0: permite uso comercial, pero el usuario asume toda la responsabilidad legal sobre el contenido generado, incluido el que infrinja normativas locales.
- Adopcion muy baja (200 descargas, 0 likes): poca validacion comunitaria, mayor probabilidad de fallos no documentados.
- Repositorio de 190,8 GB: la descarga completa es costosa; conviene bajar solo la cuantizacion necesaria.
- Degradacion por cuantizacion: las variantes Q2_K y Q3 pueden perder calidad notable; se recomienda Q4_K_M o superior para uso serio.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Qwen3.8-27B-Uncensored-xCloud-GGUF
- Modelo base: https://huggingface.co/xCloudinfo/Qwen3.8-27B-Uncensored-xCloud
- Cuantizaciones imatrix (i1): https://huggingface.co/mradermacher/Qwen3.8-27B-Uncensored-xCloud-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Qwen3.8-27B-Uncensored-xCloud-GGUF
- Guia de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafica comparativa de cuantizaciones de ikawrakow: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
