# Elmerfudge/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF

## Resumen

Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF es una distribucion cuantizada en GGUF del modelo multimodal Qwen/Qwen3.8-27B, publicada por el usuario Elmerfudge (los enlaces de descarga de la model card apuntan al espacio de nombres HauhauCS). Se trata de un modelo denso de 27 000 millones de parametros con codificador de vision, 64 capas y una arquitectura hibrida que combina 48 capas Gated DeltaNet con 16 capas de atencion con compuertas. El problema que resuelve es doble: por un lado ofrece pesos listos para ejecucion local en llama.cpp y LM Studio, y por otro aplica un perfil de "descensura" agresivo que elimina los rechazos del modelo base.

La innovacion principal de esta release es FastMTP, un sidecar de decodificacion especulativa de 32K que se apoya en la cabeza MTP/NextN nativa del modelo base y que, segun el autor, acelera la generacion hasta 3,02x en documentos y 1,93x en razonamiento frente a no usar MTP, y hasta un 35,2% y un 21,1% mas respecto al MTP embebido estandar. El modelo conserva las capacidades de texto, razonamiento, agenticas, imagen y video del original, y se distribuye con contexto nativo de 262 144 tokens, extensible hasta 1 000 000.

Es relevante ahora porque combina tres piezas poco frecuentes en un mismo paquete GGUF: contexto muy largo, vision integrada mediante un proyector BF16 independiente y aceleracion especulativa integrada, todo bajo licencia Apache 2.0. La contrapartida es que se trata de una publicacion recien creada (12 de septiembre de 2026), sin descargas ni validacion externa, con una discrepancia no aclarada entre la denominacion de 27B y el recuento de parametros reportado en safetensors, y sin benchmarks publicados mas alla de las cifras relativas de velocidad del propio autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso causal hibrido con codificador de vision: 48 capas Gated DeltaNet + 16 capas de atencion con compuertas (64 capas de lenguaje) |
| Parametros totales | 27 000 millones segun la especificacion del modelo base; el dato de safetensors asociado al repo indica 1.863.907.840 (~1,86 mil millones), discrepancia no aclarada por el autor |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262 144 tokens nativos; extensible hasta 1 000 000 |
| Tipos de cuantizacion | Q8_K_P (9,21 BPW, 31,46 GB), Q8_0 (8,50 BPW), Q6_K_P (7,59 BPW, 25,92 GB), Q6_K (6,60 BPW), Q5_K_P (5,92 BPW, 20,22 GB), Q5_K_M (5,70 BPW), Q4_K_P (5,25 BPW, 17,92 GB), Q4_K_M (4,88 BPW), IQ4_XS (4,60 BPW, 15,71 GB), Q3_K_P (3,93 BPW, 13,44 GB), Q3_K_M (3,90 BPW), IQ3_M (3,74 BPW, 12,79 GB), IQ3_XS (3,56 BPW, 12,18 GB), Q2_K_P (3,12 BPW, 10,68 GB), IQ2_M (3,02 BPW, 10,32 GB) |
| Idiomas soportados | Ingles (en), chino (zh) y multilingue |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (texto cuantizado); proyector de vision mmproj en BF16 (931 MB) y sidecar FastMTP-32K (903 MB) |

Otros datos de arquitectura declarados por el autor: hidden size 5 120, FFN size 17 408 y vocabulario con padding de 248 320 tokens. Tamano total del repositorio: 172,5 GB.

## Arquitectura y entrenamiento

La arquitectura es un transformer causal denso con una mezcla de capas: 48 capas Gated DeltaNet (mecanismo de estado recurrente con compuertas) y 16 capas de atencion con compuertas, sobre 64 capas de lenguaje con hidden size 5 120 y FFN de 17 408. Incorpora un codificador de vision que se activa cargando el proyector mmproj en BF16 y que aporta entrada de imagen y video. Mantiene la cabeza MTP/NextN nativa del modelo base, lo que permite decodificacion especulativa multi-token dentro del propio modelo, y anade el sidecar HauhauCS FastMTP con perfil de 32K.

No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens, la composicion de los datos ni sobre si hubo RLHF, DPO u otra fase de alineamiento: el autor indica explicitamente que "no hay cambios en datasets ni en capacidades previstas" respecto a Qwen3.8-27B. La unica modificacion declarada es el perfil de "descensura" Aggressive, orientado a respuestas directas sin comportamiento de rechazo y con preambulo minimo en prompts dificiles. La innovacion tecnica destacable es FastMTP: un perfil de aceleracion distribuido como archivo independiente que, segun el autor, funciona con todos los cuantizadores de la linea y esta cualificado a maxima ventana nativa. Los cuantizadores K_P ("Perfect") son perfiles de cuantizacion personalizados que preservan calidad de forma selectiva con un sobrecoste de tamano del 5-15% respecto al cuantizador base, manteniendo compatibilidad GGUF estandar.

## Capacidades

- Generacion de texto y razonamiento en el mismo rango de capacidades que el modelo base Qwen3.8-27B, segun el autor.
- Capacidades agenticas preservadas del modelo base, incluyendo flujos de varios pasos.
- Entrada multimodal de imagen y video mediante el proyector BF16 (pipeline declarado: image-text-to-text).
- Decodificacion especulativa integrada mediante la cabeza MTP/NextN nativa y el perfil FastMTP de 32K.
- Multilingue, con soporte declarado de ingles, chino y otros idiomas.
- Perfil "descensura agresivo": respuestas directas y sin rechazos en prompts dificiles; el autor afirma 0 rechazos en 465 pruebas.
- Contexto largo de 262 144 tokens nativos, extensible a 1 000 000.
- Soporte de tool calling / function calling: no documentado explicitamente en la informacion disponible.
- Modo de razonamiento explicito (thinking mode): no documentado explicitamente en la informacion disponible.
- Capacidades de audio: no disponibles.

## Casos de uso

- Analisis de documentos extensos: con 262 144 tokens de contexto nativo, el modelo puede procesar contratos, informes tecnicos o expedientes completos en una sola pasada sin necesidad de chunking agresivo, y el perfil FastMTP reduce el coste de generacion en tareas de resumen y extraccion.
- Procesamiento de imagenes y video en local: cargando el proyector mmproj en BF16, se pueden construir pipelines de descripcion de fotogramas, transcripcion visual, moderacion de contenido de video o indexado semantico de archivos multimedia sin enviar datos a servicios externos.
- Asistentes de investigacion con contexto largo: el modelo puede mantener conversaciones multi-turno sobre corpus tecnicos extensos, citando fragmentos concretos y manteniendo coherencia a lo largo de decenas de miles de tokens.
- Generacion de codigo y depuracion en local: con un cuantizador Q4_K_P de 17,92 GB cabe en una GPU de 24 GB, lo que permite integrarlo en entornos de desarrollo con requisitos de privacidad estrictos.
- Redaccion tecnica y creativa sin restricciones de estilo: el perfil Aggressive evita preambulos y rechazos, lo que resulta util en tareas de ficcion, guiones, analisis de temas sensibles o redaccion de contenido para dominios regulados donde el filtrado excesivo degrada la utilidad.
- Despliegue como servidor de inferencia local en llama.cpp: con el sidecar FastMTP y decodificacion especulativa se puede servir a varios usuarios desde una sola maquina con GPU profesional, reduciendo el coste por token respecto a la decodificacion estandar.
- Analisis forense o de seguridad sobre material no filtrado: el modelo no rechaza consultas sobre contenido sensible, lo que resulta relevante en investigacion de incidentes, analisis de amenazas o clasificacion de material reportado, siempre con las salvaguardas organizativas adecuadas.
- Evaluacion comparativa de cuantizaciones: los 15 perfiles publicados permiten estudiar el compromiso calidad/tamano en un mismo modelo, incluyendo los cuantizadores propietarios K_P frente a los K clasicos e IQ.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (ni MMLU, ni HumanEval, ni GSM8K, ni ninguna otra metrica de calidad). Las unicas cifras aportadas por el autor son relativas de velocidad y una afirmacion de tasa de rechazo, sin datos absolutos de tokens por segundo:

| Metrica declarada por el autor | Valor |
|---|---|
| Aceleracion de TG en documentos con FastMTP frente a no usar MTP | Hasta 3,02x |
| Aceleracion de TG en razonamiento con FastMTP frente a no usar MTP | Hasta 1,93x |
| TG en documentos con FastMTP frente a MTP embebido estandar | Hasta 35,2% mas |
| TG en razonamiento con FastMTP frente a MTP embebido estandar | Hasta 21,1% mas |
| Tasa de rechazo (suite propia de 465 pruebas) | 0/465 |

Estas cifras no estan verificadas de forma independiente y corresponden a mediciones del propio autor sobre hardware no especificado.

## Requisitos de hardware

Estimaciones basadas en el tamano de los archivos publicados (pesos unicamente, contexto corto; el KV cache crece con la longitud de contexto y no se ha publicado su tamano por token):

- Q8_K_P (31,46 GB): requiere GPU de 40-48 GB (A100 40 GB justo, A6000 48 GB, H100 80 GB) o reparto entre dos GPU. No cabe en ninguna consumer GPU actual.
- Q6_K_P (25,92 GB): cabe en RTX 5090 (32 GB), A100 40 GB, L40S 48 GB con margen limitado para contexto.
- Q5_K_P (20,22 GB): RTX 4090/3090 de 24 GB con contexto reducido; comodo en tarjetas de 32-48 GB.
- Q4_K_P (17,92 GB) e IQ4_XS (15,71 GB): opcion razonable para RTX 4090, RTX 3090, RTX 5080 de 16 GB (el segundo) y A100 40 GB.
- Q3_K_P (13,44 GB), IQ3_M (12,79 GB) e IQ3_XS (12,18 GB): viables en RTX 4080/4070 Ti Super de 16 GB y en tarjetas de 12 GB con contexto muy limitado.
- Q2_K_P (10,68 GB) e IQ2_M (10,32 GB): permiten ejecucion en GPU de 12 GB, con degradacion de calidad esperable.
- Sumar 931 MB si se usa entrada de imagen o video (proyector BF16) y 903 MB para el sidecar FastMTP-32K.
- Despliegue: llama.cpp, LM Studio y otros runtimes compatibles con GGUF segun el autor; tambien es habitual el uso via Ollama o koboldcpp. vLLM y TGI no estan documentados como soportados para estos archivos.
- Reparto CPU+GPU: los cuantizadores de menor tamano (Q2, IQ2, IQ3) permiten offload parcial a RAM, a costa de una caida notable de throughput.
- Latencia y throughput absolutos: no disponibles. Solo se conocen los multiplicadores relativos de FastMTP indicados en la seccion anterior.
- Requisito adicional: la decodificacion especulativa con FastMTP exige un runtime que soporte el sidecar; sin el, el modelo funciona en modo estandar apoyandose en la cabeza MTP embebida.

## Comparativa con modelos similares

No se dispone de informacion verificable sobre modelos comparables en la documentacion proporcionada ni en los resultados de busqueda web (que no devolvieron contenido tecnico relevante). La unica referencia directa es el modelo base:

| Modelo | Parametros | Contexto | Licencia | Formato | Perfil |
|---|---|---|---|---|---|
| Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP | 27 000 millones (segun autor) | 262 144 tokens (hasta 1 000 000) | Apache 2.0 | GGUF + mmproj BF16 | Descensurado agresivo, MTP con FastMTP |
| Qwen/Qwen3.8-27B (modelo base) | 27 000 millones (segun autor) | No disponible | Apache 2.0 | No disponible en la informacion proporcionada | Alineado con rechazos estandar, MTP/NextN embebido |
| Alternativas de terceros de 27B con vision y contexto largo | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Discrepancia de parametros sin aclarar: el repo declara un modelo de 27B, pero el recuento de safetensors asociado indica 1.863.907.840 parametros. Conviene verificar el modelo antes de planificar despliegues.
- Ausencia de benchmarks de calidad: no hay MMLU, HumanEval ni ninguna otra metrica publicada. Las unicas cifras son relativas de velocidad y autodeclaradas.
- Sin validacion externa: 0 descargas y 0 likes en el momento de la consulta, creado el 12 de septiembre de 2026. No hay evidencia de terceros sobre calidad o estabilidad.
- Perfil descensurado: el ajuste Aggressive elimina los rechazos. El propio autor advierte que para trabajo agentico de contexto largo y criticidad de fiabilidad es preferible una variante Balanced cuando este disponible. No debe usarse como modelo de proposito general con usuarios finales sin filtros adicionales.
- Riesgo de alucinacion: no hay informacion especifica, pero se trata de un modelo de lenguaje de 27B sin datos de evaluacion de factualidad; se asume el riesgo habitual, agravado por la ausencia de rechazos.
- Filtrado de seguridad eliminado: puede generar contenido danino, ilegal o sensible sin aviso. Requiere controles organizativos externos en cualquier despliegue expuesto.
- Idiomas: solo ingles, chino y "multilingue" generico. No hay confirmacion de calidad en castellano; el rendimiento en espanol no esta documentado.
- Contexto declarado de hasta 1 000 000 de tokens: la extension mas alla de los 262 144 nativos depende de tecnicas de escalado no detalladas y no esta validada con datos.
- Enlaces de descarga inconsistentes: la ficha pertenece al usuario Elmerfudge, pero todos los ficheros apuntan a rutas del espacio HauhauCS. Conviene confirmar la procedencia antes de ejecutar los pesos.
- Incidencia de visualizacion en LM Studio: los cuantizadores K_P pueden aparecer con "?" en la columna de cuantizacion; el autor indica que es solo un problema de interfaz.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero se distribuye sin garantia y sin declaracion de conformidad con requisitos regulatorios (por ejemplo, la Ley de IA de la UE) mas alla de la obligacion de mantener el aviso de licencia.
- Decodificacion especulativa: los multiplicadores de FastMTP dependen del runtime, del hardware y del tipo de tarea; podrian no reproducirse fuera del entorno de medida del autor.
- Vision: requiere cargar el proyector mmproj por separado; sin el, el modelo no procesa imagenes ni video.

## Enlaces

- HuggingFace (ficha): https://huggingface.co/Elmerfudge/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Discord del autor: https://discord.gg/SZ5vacTXYf
- Descarga Q8_K_P: https://huggingface.co/HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF/resolve/main/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-Q8_K_P.gguf
- Descarga Q4_K_P: https://huggingface.co/HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF/resolve/main/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-Q4_K_P.gguf
- Proyector de vision BF16: https://huggingface.co/HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF/resolve/main/mmproj-Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-BF16.gguf
- Sidecar FastMTP-32K: https://huggingface.co/HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF/resolve/main/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-FastMTP-32K.gguf
- Paper, blog o repositorio tecnico: no disponible
- Demo o espacio de inferencia: no disponible
