# mradermacher/Signal-3.8-27B-GGUF

## Resumen

Signal-3.8-27B-GGUF es la versión cuantizada en formato GGUF del modelo agentionai/Signal-3.8-27B, publicada por el usuario mradermacher, conocido por distribuir cuantizaciones estáticas de modelos abiertos. No se trata por tanto de un modelo entrenado desde cero, sino de una conversión del checkpoint original (convert_type: hf, quantize_version 2) a una batería de cuantizaciones de llama.cpp que van desde Q2_K (11,0 GB) hasta Q8_0 (29,1 GB), además de dos ficheros mmproj (Q8_0 y f16) que actúan como suplemento multimodal.

El modelo base declara 27.320.697.856 parámetros reales en safetensors (aproximadamente 27,3 mil millones), etiquetas que lo sitúan en la familia Qwen3.8 (qwen3.8, qwen3.8-27b) y un enfoque explícito en eficiencia de tokens: los tags token-efficient, efficient-thinking y terse apuntan a un modelo orientado a razonamiento conciso, es decir, a reducir el número de tokens de pensamiento sin perder calidad de respuesta. Está publicado bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

Su relevancia práctica es doble: por un lado, permite ejecutar un modelo de 27B en hardware de consumo mediante cuantizaciones de 4 bits; por otro, el énfasis en "pensamiento eficiente" responde a un problema real de coste en producción, donde los modos de razonamiento extendido disparan la factura de inferencia. La información disponible no incluye, sin embargo, detalles sobre contexto máximo, composición del dataset ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (los tags apuntan a la familia Qwen3.8; el README de la cuantizacion no detalla la arquitectura) |
| Parametros totales | 27.320.697.856 (27,3B) |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K (11,0 GB), Q3_K_S (12,4 GB), Q3_K_M (13,6 GB), Q3_K_L (14,7 GB), IQ4_XS (15,5 GB), Q4_K_S (15,9 GB), Q4_K_M (16,9 GB), Q5_K_S (19,1 GB), Q5_K_M (19,6 GB), Q6_K (22,5 GB), Q8_0 (29,1 GB); sin cuantizaciones ponderadas/imatrix. Ademas: mmproj-Q8_0 (0,7 GB) y mmproj-f16 (1,0 GB) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (repo original en safetensors; repo total de 190,8 GB) |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo base agentionai/Signal-3.8-27B. Las etiquetas de la model card (qwen3.8, qwen3.8-27b) sugieren que deriva de la familia Qwen 3.8 en su variante de 27B, pero no se confirma si se trata de un transformer denso, de una arquitectura MoE o de un diseno hibrido, ni se especifica el numero de capas, cabezas de atencion o dimension del embedding. El recuento de parametros (27,32B) es consistente con un modelo denso de ese orden de magnitud.

Tampoco hay datos sobre el entrenamiento: no se indica el numero de tokens vistos, la composicion del dataset, ni si hubo fases de RLHF, DPO o ajuste por instrucciones. Los unicos indicios son las etiquetas token-efficient, efficient-thinking y terse, que describen un comportamiento esperado (razonamiento abreviado, respuestas concisas) mas que un detalle de arquitectura. La presencia de ficheros mmproj en el repositorio GGUF indica que el modelo base incorpora algun tipo de proyector multimodal (vision o audio) que se conserva en la cuantizacion, aunque la model card no lo documenta explicitamente.

El trabajo de mradermacher se limita a la conversion y cuantizacion: el pipeline declara convert_type: hf y quantize_version 2, con output_tensor_quantised: 1, y no incluye cuantizaciones ponderadas con imatrix en el momento de la publicacion.

## Capacidades

- Generacion de texto conversacional: el repositorio esta etiquetado como conversational y endpoints_compatible, lo que apunta a uso directo en APIs compatibles con OpenAI.
- Razonamiento eficiente en tokens: los tags token-efficient, efficient-thinking y terse describen un modo de razonamiento que prioriza respuestas breves frente a cadenas de pensamiento largas.
- Multimodalidad potencial: la existencia de ficheros mmproj-Q8_0 y mmproj-f16 sugiere soporte de entrada visual en el modelo base, aunque no se especifica oficialmente en la informacion disponible.
- Uso con llama.cpp y derivados: al distribuirse en GGUF, es compatible con el ecosistema de inferencia local (Ollama, LM Studio, KoboldCpp, text-generation-webui).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada, aunque el tag agentionai apunta a un orientado a agentes.
- Capacidades multilingues: limitadas al ingles segun el campo language de la model card.
- Capacidades especiales (modo thinking explicito, audio, etc.): no disponible.

## Casos de uso

- Asistentes conversacionales en local: el modelo puede desplegarse en un equipo con GPU de 16-24 GB usando Q4_K_M (16,9 GB), lo que permite construir un chatbot privado sin enviar datos a servicios externos. El enfasis en respuestas concisas reduce el coste por interaccion.
- Generacion de codigo asistida en el IDE: con Q5_K_M o Q6_K se mantiene buena fidelidad de pesos para autocompletado y explicacion de fragmentos; la naturaleza "terse" del modelo encaja bien en sugerencias cortas dentro del editor.
- Despliegue en servidores sin GPU dedicada: la cuantizacion Q2_K (11,0 GB) permite ejecutar el modelo en CPU con RAM suficiente o en GPUs de gama media, util para entornos de desarrollo o demos internas.
- Procesamiento de documentos con entrada visual: si se confirma el soporte multimodal a traves de los ficheros mmproj, el modelo podria usarse para extraer informacion de capturas, diagramas o formularios escaneados junto al texto.
- Investigacion sobre eficiencia de razonamiento: al estar etiquetado como efficient-thinking, es un candidato para experimentos que midan relacion calidad/coste en tokens frente a modelos con cadenas de pensamiento largas.
- Fine-tuning y experimentacion: la licencia Apache 2.0 y el formato GGUF (o el checkpoint base en safetensors) permiten adaptaciones posteriores y publicacion de derivados sin obligaciones de copyleft.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece once niveles de cuantizacion estatica, lo que facilita estudios de degradacion por bits en un mismo modelo de 27B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio cuantizado no incluye cifras de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, y la busqueda web realizada no ha devuelto resultados relacionados con el modelo (los resultados obtenidos corresponden a un establecimiento hostelero en Suiza, sin relacion alguna). No se dispone tampoco de datos de perplejidad por cuantizacion para este modelo concreto, mas alla del grafico generico de comparacion de tipos de cuantizacion enlazado en el README de mradermacher.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + cache KV + overhead, valores orientativos calculados a partir del tamano de cada fichero GGUF):
  - Q2_K (11,0 GB): ~12-14 GB.
  - Q3_K_M (13,6 GB): ~15-17 GB.
  - IQ4_XS (15,5 GB): ~17-19 GB.
  - Q4_K_M (16,9 GB): ~19-21 GB.
  - Q5_K_M (19,6 GB): ~22-24 GB.
  - Q6_K (22,5 GB): ~25-27 GB.
  - Q8_0 (29,1 GB): ~32-35 GB.
- GPU recomendadas: para Q4_K_M, una RTX 4090 (24 GB) o RTX 3090 (24 GB) resulta suficiente; para Q6_K y Q8_0 conviene una A100 40 GB, L40S (48 GB) o H100. Un A100 80 GB permite cargar el modelo en f16 (aproximadamente 54,6 GB de pesos) con contexto amplio.
- Cabe en GPU de consumo: si, con matices. Las cuantizaciones Q2_K a IQ4_XS caben en tarjetas de 12-16 GB (RTX 4070 Ti, RTX 4080, RTX 3080 Ti) y Q4_K_M en tarjetas de 24 GB. En Mac con memoria unificada, 32 GB permiten Q4_K_M y 64 GB permiten Q8_0.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp, text-generation-webui y cualquier runtime compatible con GGUF. Para servir el modelo como API, llama.cpp en modo servidor o vLLM con soporte GGUF; el tag endpoints_compatible sugiere compatibilidad con endpoints tipo OpenAI.
- Latencia y throughput estimados: no disponible. Dependera del backend, del ancho de banda de memoria y de la longitud de contexto efectiva.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento ni especificaciones de modelos alternativos de la misma categoria, por lo que no es posible establecer una comparacion con cifras verificables. Como referencia estructural, el unico elemento comparable dentro del propio repositorio es la relacion entre el checkpoint original (agentionai/Signal-3.8-27B, 27,32B parametros) y sus cuantizaciones:

| Version | Parametros | Tamano en disco | Licencia |
|---|---|---|---|
| agentionai/Signal-3.8-27B (base, safetensors) | 27.320.697.856 | repo original en safetensors (tamano no indicado) | apache-2.0 |
| mradermacher/Signal-3.8-27B-GGUF (Q4_K_M) | 27,3B (mismos pesos, 4 bits) | 16,9 GB | apache-2.0 |
| mradermacher/Signal-3.8-27B-GGUF (Q8_0) | 27,3B (mismos pesos, 8 bits) | 29,1 GB | apache-2.0 |

## Limitaciones y advertencias

- Idiomas: la model card declara unicamente ingles (en). El rendimiento en castellano u otros idiomas no esta documentado y no deberia asumirse.
- Ausencia de benchmarks: no hay ninguna evaluacion publicada en la informacion disponible, por lo que cualquier afirmacion sobre calidad relativa seria especulativa.
- Perdida por cuantizacion: las cuantizaciones de 2 y 3 bits (Q2_K, Q3_K_S, Q3_K_M, Q3_K_L) degradan notablemente la calidad. El propio README marca Q3_K_M como "lower quality" y recomienda Q4_K_S/Q4_K_M como opciones rapidas y Q6_K como muy buena calidad.
- Riesgo de alucinacion: no existe informacion sobre tasas de alucinacion, datos de alineacion o mecanismos de mitigacion. Como en cualquier modelo generativo, la verificacion de hechos en produccion es responsabilidad del integrador.
- Sesgos: no se documenta ninguna evaluacion de sesgos, toxicidad o comportamiento diferencial por subgrupos.
- Contexto e inferencia: se desconoce la longitud de contexto soportada; los valores habituales de la familia no deben tomarse como ciertos sin verificacion empirica.
- Licencia: Apache 2.0 permite uso comercial y modificacion, pero el repositorio cuantizado es un trabajo de terceros (mradermacher) sobre el checkpoint de agentionai; conviene revisar tambien la licencia del modelo base, que figura como Apache 2.0.
- Adopcion nula: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, y se creo y actualizo el 11 de septiembre de 2026. Es un artefacto muy reciente y sin validacion por parte de la comunidad.
- Multimodalidad no confirmada: los ficheros mmproj estan presentes, pero no hay documentacion oficial sobre el tipo de proyector ni sobre como usarlo.
- Sin cuantizaciones imatrix: el autor indica que no hay cuantizaciones ponderadas publicadas y que podrian no llegar a publicarse.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/mradermacher/Signal-3.8-27B-GGUF
- Modelo base: https://huggingface.co/agentionai/Signal-3.8-27B
- Pagina de resumen y lista de descargas de mradermacher: https://hf.tst.eu/model#Signal-3.8-27B-GGUF
- Grafico de perplejidad por tipo de cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- README de referencia de TheBloke sobre uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Peticiones de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- nethype GmbH (infraestructura del cuantizador): https://www.nethype.de/
- Paper, blog o demo oficial del modelo base: no disponible en la informacion proporcionada.
