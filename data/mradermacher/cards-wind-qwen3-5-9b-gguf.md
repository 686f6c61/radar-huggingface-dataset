# mradermacher/CARDS-Wind-Qwen3.5-9B-GGUF

## Resumen

`mradermacher/CARDS-Wind-Qwen3.5-9B-GGUF` es un conjunto de cuantizaciones GGUF estáticas generadas por mradermacher a partir del modelo `iRanadheer/CARDS-Wind-Qwen3.5-9B`, un modelo de 8.953.803.264 parámetros (aproximadamente 9B) etiquetado como conversacional y en inglés. El repositorio no contiene pesos originales en safetensors, sino 14 ficheros GGUF con distintos niveles de compresión (desde Q2_K de 3,9 GB hasta f16 de 18,0 GB) más dos ficheros `mmproj` (proyector multimodal) en Q8_0 y f16, lo que apunta a que el modelo base incorpora capacidad de visión.

El interés practico de esta publicacion es de infraestructura mas que de investigacion: permite ejecutar un modelo de ~9B en hardware de consumo mediante llama.cpp u Ollama, con opciones que van desde los 3,9 GB del Q2_K hasta los 9,6 GB del Q8_0. Sin embargo, la informacion disponible es muy limitada: no hay model card del autor original, no se declara licencia, no se especifica la longitud de contexto, la arquitectura concreta ni los datos de entrenamiento, y no se han publicado resultados de benchmarks. El modelo base presenta una adopcion muy baja (173 descargas y 1 like en el repo cuantizado), lo que implica ausencia de validacion por parte de la comunidad.

Por tanto, esta ficha debe leerse como una evaluacion de las caracteristicas verificables del paquete GGUF (tamanos, tipos de cuantizacion, formato) y no como una validacion de la calidad del modelo subyacente, sobre el que la informacion publica es insuficiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el nombre indica que deriva de la familia Qwen3.5; no se documenta la arquitectura en la informacion proporcionada) |
| Parametros totales | 8.953.803.264 (~8,95B), dato real de safetensors del modelo base |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | mmproj-Q8_0, mmproj-f16, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | ingles (`en`) segun los metadatos del repositorio |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estaticas; no se incluyen safetensors en este repo) |
| Tamano del repositorio | 83,0 GB (suma de todas las cuantizaciones) |
| Modelo base | iRanadheer/CARDS-Wind-Qwen3.5-9B |
| Autoria de la cuantizacion | mradermacher |
| Descargas / likes | 173 / 1 |
| Fecha de creacion / actualizacion | 2026-04-28 / 2026-10-18 |

Tabla de ficheros disponibles, ordenada por tamano:

| Fichero | Tipo | Tamano (GB) | Nota del autor |
|---|---|---|---|
| CARDS-Wind-Qwen3.5-9B.mmproj-Q8_0.gguf | mmproj-Q8_0 | 0,7 | suplemento multimodal |
| CARDS-Wind-Qwen3.5-9B.mmproj-f16.gguf | mmproj-f16 | 1,0 | suplemento multimodal |
| CARDS-Wind-Qwen3.5-9B.Q2_K.gguf | Q2_K | 3,9 | — |
| CARDS-Wind-Qwen3.5-9B.Q3_K_S.gguf | Q3_K_S | 4,4 | — |
| CARDS-Wind-Qwen3.5-9B.Q3_K_M.gguf | Q3_K_M | 4,7 | calidad inferior |
| CARDS-Wind-Qwen3.5-9B.Q3_K_L.gguf | Q3_K_L | 5,0 | — |
| CARDS-Wind-Qwen3.5-9B.IQ4_XS.gguf | IQ4_XS | 5,3 | — |
| CARDS-Wind-Qwen3.5-9B.Q4_K_S.gguf | Q4_K_S | 5,5 | rapido, recomendado |
| CARDS-Wind-Qwen3.5-9B.Q4_K_M.gguf | Q4_K_M | 5,7 | rapido, recomendado |
| CARDS-Wind-Qwen3.5-9B.Q5_K_S.gguf | Q5_K_S | 6,4 | — |
| CARDS-Wind-Qwen3.5-9B.Q5_K_M.gguf | Q5_K_M | 6,6 | — |
| CARDS-Wind-Qwen3.5-9B.Q6_K.gguf | Q6_K | 7,5 | muy buena calidad |
| CARDS-Wind-Qwen3.5-9B.Q8_0.gguf | Q8_0 | 9,6 | rapido, mejor calidad |
| CARDS-Wind-Qwen3.5-9B.f16.gguf | f16 | 18,0 | 16 bpw, sobredimensionado |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo base en los materiales proporcionados. El identificador `CARDS-Wind-Qwen3.5-9B` sugiere que se trata de un derivado o ajuste de la familia Qwen3.5, y el recuento de parametros (8.953.803.264) es coherente con un transformer decoder-only de ~9B, pero ni la model card original ni los metadatos del repo cuantizado confirman tipo de atencion, uso de MoE, atencion lineal o cualquier otra innovacion arquitectonica. Tampoco se documenta la longitud de contexto nativa, dato critico para planificar despliegues.

Respecto al entrenamiento, no hay informacion sobre volumen de tokens, composicion del dataset, fases de preentrenamiento, SFT, RLHF o DPO, ni sobre el proceso de alineacion. El autor de la cuantizacion solo indica que se trata de "static quants" del modelo `iRanadheer/CARDS-Wind-Qwen3.5-9B`, generados con `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`. Se senala explicitamente que no hay cuantizaciones ponderadas con imatrix disponibles en el momento de la publicacion, lo que implica que estas cuantizaciones estaticas renuncian a la mejora de calidad tipica de los quants con imatrix en niveles bajos (Q2, Q3, IQ).

Un dato tecnico relevante y verificable es la inclusion de ficheros `mmproj` (proyector multimodal) en Q8_0 y f16, lo que indica que el modelo base incorpora un codificador visual y puede procesar imagenes ademas de texto. Esta capacidad no se describe en ningun texto de la informacion disponible y solo se infiere de la estructura de ficheros.

## Capacidades

- Generacion de texto conversacional: el repo esta etiquetado como `conversational`, lo que indica un ajuste orientado a dialogo multi-turno.
- Procesamiento multimodal (vision) probable: la presencia de ficheros `mmproj` en Q8_0 y f16 indica que el modelo base incluye un proyector visual; la capacidad concreta (describir imagenes, OCR, VQA) no esta documentada.
- Multilingue: no. Los metadatos declaran unicamente `en` (ingles).
- Razonamiento y codigo: no disponible; no se han publicado evaluaciones ni descripcion de capacidades.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo thinking explicito: no disponible.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` indica que el repo puede servirse mediante los endpoints de Hugging Face (por ejemplo, a traves de Inference Endpoints con llama.cpp), aunque no se detalla configuracion.
- Audio: no disponible.

## Casos de uso

Los siguientes casos se derivan de las caracteristicas verificables del paquete (9B, GGUF, ingles, posible vision) y de la etiqueta conversacional. Dado que no hay benchmarks ni model card del modelo base, cada caso requiere una validacion previa con datos propios.

- Asistente conversacional autoalojado en ingles: un modelo de ~9B en Q4_K_M (5,7 GB) cabe en una GPU de 12 GB o en una workstation con CPU y 16 GB de RAM, lo que permite desplegar un chatbot interno sin coste por token ni salida de datos a terceros.
- Procesamiento por lotes de documentacion en ingles: tareas de resumen, extraccion de entidades o clasificacion sobre textos en ingles, ejecutadas con llama.cpp en CPU o GPU, aprovechando el bajo coste de las cuantizaciones Q4_K_S e IQ4_XS.
- Prototipado de pipelines multimodales: los ficheros `mmproj` permiten experimentar con entrada de imagen acompanada de texto (por ejemplo, descripcion de capturas o extraccion de datos de documentos escaneados) usando llama.cpp con soporte de vision; la calidad debe medirse empiricamente.
- Entornos sin conectividad o con requisitos de soberania del dato: el formato GGUF es ejecutable en local en portatiles con GPU de consumo, lo que encaja en escenarios de defensa, sanidad o industria donde el texto no puede salir de la red interna.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece 12 niveles de cuantizacion del mismo modelo, lo que permite medir la degradacion de perplejidad y de calidad de respuesta entre Q2_K (3,9 GB) y Q8_0 (9,6 GB) sobre un conjunto de prueba propio.
- Base para ajuste fino o destilacion posteriores: al tratarse de un modelo de ~9B con pesos publicados en el repo original, puede servir como punto de partida para fine-tuning en ingles; conviene verificar la licencia antes de cualquier uso derivado.
- Generacion asistida en herramientas de escritorio: integracion en editores o asistentes locales mediante `llama-cpp-python` u Ollama, con el modelo en Q4_K_M como compromiso entre tamano y calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

No hay datos de MMLU, HumanEval, GSM8K, MMMU ni de ninguna otra evaluacion, ni en la model card del repo cuantizado ni en los metadatos. Tampoco se han publicado mediciones de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente el tamano del fichero GGUF mas el KV cache. Como referencia, Q4_K_M ocupa 5,7 GB de pesos; con contexto moderado el consumo total se situa en el entorno de 7-9 GB. Q8_0 ocupa 9,6 GB y f16 18,0 GB. El KV cache exacto no puede calcularse porque se desconoce la longitud de contexto y el numero de capas/KV heads.
- Si se usa la capacidad multimodal, hay que sumar el proyector: 0,7 GB (mmproj-Q8_0) o 1,0 GB (mmproj-f16).
- GPU de consumo: Q4_K_M (5,7 GB) cabe en RTX 4060 Ti 16 GB, RTX 4070 Ti Super 16 GB, RTX 4080 16 GB, RTX 4090 24 GB y en GPUs de 8-12 GB con contexto reducido y offload parcial. Q2_K (3,9 GB) y Q3_K_S (4,4 GB) caben en GPUs de 6-8 GB.
- GPU de centro de datos: A100 40/80 GB, H100 80 GB y L40S 48 GB permiten cargar f16 con contexto amplio y batched inference; para Q8_0 basta una A10G 24 GB o una L4 24 GB.
- CPU: las cuantizaciones Q4_K_M e IQ4_XS son viables en CPU con 16 GB de RAM (con velocidad de decodificacion baja, tipicamente por debajo de la decodificacion en GPU; no se dispone de mediciones para este modelo).
- Opciones de despliegue: llama.cpp (referencia para GGUF), Ollama, LM Studio, koboldcpp, `llama-cpp-python`. vLLM ofrece soporte experimental de GGUF pero con limitaciones; TGI no soporta GGUF de forma nativa. Para maxima fidelidad de pesos, usar el repo original en safetensors con vLLM o TGI.
- Latencia y throughput: no disponibles. No se han publicado mediciones para este modelo en ninguna configuracion de hardware.

## Comparativa con modelos similares

No se dispone de datos verificados del modelo evaluado (contexto, licencia, benchmarks) ni de resultados de busqueda relevantes que permitan una comparacion rigurosa. La siguiente tabla incluye alternativas de tamano equivalente con datos de sus fichas publicas, que no proceden de la informacion proporcionada en esta consulta y deben verificarse antes de usarse en una decision:

| Modelo | Parametros | Contexto | Licencia | Formato disponible | Notas |
|---|---|---|---|---|---|
| CARDS-Wind-Qwen3.5-9B (este repo) | 8,95B | no disponible | no disponible | GGUF (12 quants + mmproj) | 173 descargas, 1 like; sin benchmarks publicados |
| Qwen3-8B | ~8,2B | 32k nativo, extensible | Apache-2.0 | safetensors, GGUF | Datos de la ficha publica de Qwen; verificar |
| Llama 3.1 8B Instruct | ~8,03B | 128k | Llama 3.1 Community License | safetensors, GGUF | Datos de la ficha publica de Meta; verificar |
| Mistral 7B Instruct v0.3 | ~7,25B | 32k | Apache-2.0 | safetensors, GGUF | Datos de la ficha publica de Mistral; verificar |

La comparacion relevante en este caso es de disponibilidad y soporte: frente a las alternativas citadas, este repositorio carece de licencia declarada, de contexto documentado y de cualquier evaluacion publicada, lo que lo sitúa en desventaja para uso en produccion.

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explicita no se puede asumir permiso de uso comercial, modificacion ni redistribucion. Es un bloqueante para cualquier despliegue en produccion.
- Ausencia de model card del modelo base: no se documentan datos de entrenamiento, proceso de alineacion ni composicion del dataset, por lo que no es posible evaluar sesgos ni procedencia de los datos.
- Riesgo de alucinacion: no cuantificado. Al no existir evaluaciones publicadas, no hay base para estimar la tasa de alucinacion en tareas factuales.
- Limitacion idiomatica: los metadatos declaran solo ingles. El rendimiento en castellano es desconocido y probablemente deficiente; no debe asumirse capacidad multilingue.
- Longitud de contexto desconocida: impide dimensionar el KV cache, planificar el troceado de documentos y estimar costes de memoria. Es un riesgo operativo directo.
- Cuantizaciones estaticas sin imatrix: el propio autor indica que no hay quants ponderados con imatrix. En niveles bajos (Q2_K, Q3_K_S) la perdida de calidad puede ser notable respecto a un quant imatrix del mismo tamano.
- Validacion comunitaria practicamente nula: 173 descargas y 1 like. No hay evidencia de uso en produccion ni informes de terceros.
- Capacidad multimodal no documentada: los ficheros `mmproj` existen, pero no se especifica que tareas visuales soporta el modelo ni con que calidad. El soporte de vision en llama.cpp requiere compilaciones y clientes compatibles.
- Fecha de creacion futura respecto a los modelos de referencia habituales (2026-04-28): conviene confirmar la procedencia y el linaje exacto del modelo base antes de adoptarlo.
- Sin garantias de mantenimiento: el repo se actualizo por ultima vez el 2026-10-18 y no hay compromiso de soporte.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/CARDS-Wind-Qwen3.5-9B-GGUF
- Modelo base: https://huggingface.co/iRanadheer/CARDS-Wind-Qwen3.5-9B
- Pagina de descargas del autor para este modelo: https://hf.tst.eu/model#CARDS-Wind-Qwen3.5-9B-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de tipos de cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Analisis de cuantizaciones de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Preguntas frecuentes y solicitudes de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
- Web del autor (nethype GmbH): https://www.nethype.de/
- Paper, blog o demo oficiales: no disponibles en la informacion proporcionada.
