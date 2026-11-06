# isilicon/mango-nanbeige-cyber-q4km

## Resumen

Mango Nanbeige Cyber Q4_K_M es un artefacto GGUF preservado por el usuario isilicon (colección Mango) a partir del modelo FRENCHFAKER/Nanbeige4.3-33B-cybersec-abliterated-GGUF. No es un modelo entrenado desde cero, sino una cuantización Q4_K_M (20,05 GB) de un derivado "abliterated" del Nanbeige 4.3 33B, orientado a tareas de ciberseguridad y sin los rechazos típicos de los modelos alineados. El repositorio funciona como espejo de preservación con verificación de integridad (SHA-256) y evaluación documentada.

El modelo subyacente es un transformer denso de 33.118.977.024 parámetros (~33B), con licencia Apache 2.0 declarada y soporte declarado de inglés y francés. La relevancia de esta ficha es doble: por un lado, documenta un artefacto de la escena de modelos "uncensored" con fines de investigación en seguridad; por otro, ilustra el patrón de preservación con trazabilidad criptográfica que aplica la colección Mango.

Es importante subrayar que este candidato concreto está marcado como "preserved candidate · quality ungraded": no dispone de puntuación de calidad Mango propia para estos bytes exactos. Los resultados publicados corresponden a otra configuración (Q6_K de DealignAI) y no son transferibles a este Q4_K_M.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Nanbeige 4.3); detalles internos no disponibles |
| Parametros totales | 33.118.977.024 (~33B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en la informacion proporcionada (el ejemplo de carga usa --ctx-size 32768, no confirmado como maximo) |
| Tipos de cuantizacion | Q4_K_M (unico archivo publicado) |
| Idiomas soportados | Ingles, frances (declarados) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |
| Tamano del artefacto | 20,05 GB / 18,67 GiB |
| Revision de pesos fijada | e94d7c786ebc669a426d093542daacabcfe62559 |
| SHA-256 (prefijo) | b6362c62677b3221... |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del Nanbeige 4.3 33B mas alla de que se trata de un transformer denso de ~33B parametros. El pipeline declarado es text-generation y el modelo base es un derivado "abliterated" (modificacion que elimina direcciones de rechazo en el espacio de activaciones) especializado en ciberseguridad por FRENCHFAKER. No se han publicado en esta informacion datos sobre numero de tokens de entrenamiento, composicion del dataset, ni si hubo RLHF/DPO.

La contribucion tecnica del repositorio no es el entrenamiento sino la preservacion: se mantienen los bytes originales del GGUF sin recompresion, con manifiesto de origen (SOURCE_MANIFEST.json), estado de espejo (MIRROR_STATUS.json) y estado de model card (MODEL_CARD_STATUS.json). La cuantizacion Q4_K_M reduce el peso a ~20 GB, lo que la hace viable en GPUs de consumo con suficiente VRAM o en configuraciones con offload a CPU.

## Capacidades

- Generacion de texto conversacional multi-turno (pipeline text-generation, tag conversational).
- Especializacion declarada en ciberseguridad por el linaje del modelo base (cybersec-abliterated).
- Comportamiento "abliterated": ausencia de rechazos por defecto en contenido sensible, orientado a investigacion.
- Soporte declarado de ingles y frances.
- Compatibilidad con plantillas de chat via --jinja en llama.cpp (segun el ejemplo de carga del autor).
- Soporte de tool calling: la evaluacion Mango cubre tareas de texto y herramientas, aunque este candidato concreto no tiene puntuacion propia publicada.
- Capacidades multimodales (imagen/audio) o de decodificacion especulativa: no confirmadas para este artefacto; el autor advierte que no se ha validado el techo de contexto completo ni rutas opcionales.

## Casos de uso

- Investigacion en seguridad ofensiva y análisis de vulnerabilidades: el linaje cybersec-abliterated permite explorar escenarios de threat modeling y red teaming sin los rechazos de modelos alineados, siempre dentro de un marco legal y etico.
- Analisis de malware y explicacion de tecnicas de ataque: util para formar a analistas SOC en la comprension de TTPs, con la advertencia de que las salidas deben validarse manualmente.
- Generacion de documentacion tecnica de seguridad en ingles y frances: redaccion de politicas, runbooks y guias de hardening aprovechando el soporte bilingue declarado.
- Asistente de laboratorio CTF: ayuda a razonar sobre retos de explotacion y criptografia en entornos controlados, con contexto suficiente para pegar fragmentos de codigo y trazas.
- Evaluacion comparativa de cuantizaciones: como artefacto Q4_K_M preservado con hash verificado, sirve para medir la degradacion de calidad frente al Q6_K de DealignAI en pipelines de evaluacion reproducibles.
- Despliegue local en estaciones de trabajo con GPU de consumo: al ocupar ~20 GB en Q4_K_M, es viable en GPUs de 24 GB con contexto moderado, util para pruebas offline sin depender de APIs.
- Traduccion tecnica EN-FR en dominios de seguridad: el par de idiomas declarado cubre la localizacion de informes y avisos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks propios para este artefacto exacto en la informacion disponible. El autor indica explicitamente que este candidato esta "quality ungraded". Como referencia de una configuracion distinta (no transferible), se cita:

| Configuracion medida | Puntuacion ponderada | Carga de trabajo minima |
|---|---|---|
| Nanbeige 4.3 33B · Q6_K · DealignAI (otra configuracion) | 67,46 | 175,31 |
| Este artefacto (Q4_K_M, FRENCHFAKER) | No disponible (sin puntuacion propia) | No disponible |

El autor advierte que cambiar cuantizacion, linaje de modificacion, motor o tokenizador puede alterar el resultado, por lo que el 67,46 no debe atribuirse a este Q4_K_M.

## Requisitos de hardware

- VRAM estimada para inferencia: ~20 GB solo para pesos en Q4_K_M; anadir KV cache (con --cache-type-k q8_0 y --cache-type-v q8_0 segun el ejemplo) y memoria de trabajo.
- GPU recomendadas: RTX 4090 (24 GB) o superior para contexto moderado sin offload; A100 40/80 GB, H100 o L40S para contextos largos y mayor throughput.
- Cabe en GPU de consumo: si, en tarjetas de 24 GB (RTX 3090/4090) con contexto limitado; en 16 GB requeriria offload parcial a CPU y penalizacion de velocidad.
- Opciones de despliegue: llama.cpp / llama-server (comando de carga proporcionado por el autor), y en general runtimes compatibles con GGUF (Ollama, LM Studio, llama-cpp-python). vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones; verificar compatibilidad.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- El autor advierte que el tamano en disco (20,05 GB) no equivale a la VRAM necesaria; el runtime, KV cache y memoria de trabajo suman requisitos propios.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Estado de evaluacion |
|---|---|---|---|---|---|
| Mango Nanbeige Cyber Q4_K_M (este) | ~33B | No disponible | Q4_K_M | Apache 2.0 | Preservado, sin puntuacion propia |
| Nanbeige 4.3 33B Q6_K · DealignAI | ~33B | No disponible | Q6_K | Apache 2.0 (declarada) | Puntuacion Mango 67,46 |
| Modelos de ~30B alineados (familia Qwen/Llama) | ~30-34B | No disponible en esta ficha | Multiples | Varía | No disponible |

La comparacion directa con alternativas alineadas no puede establecerse con rigor porque la informacion proporcionada no incluye sus resultados en la misma suite Mango. La unica comparacion documentada es interna a la coleccion (Q4_K_M frente a Q6_K de distinto linaje).

## Limitaciones y advertencias

- Modelo "abliterated": elimina rechazos de seguridad, lo que implica riesgo alto de generar contenido danino si se usa sin salvaguardas. Uso recomendado solo en investigacion controlada y con supervision humana.
- Riesgo de alucinacion: no evaluado para este artefacto; sin benchmarks propios no hay evidencia de fiabilidad en tareas factuales.
- Sesgos conocidos: no documentados en la informacion proporcionada; el linaje de datos de entrenamiento del Nanbeige base no se detalla.
- Idiomas: solo ingles y frances declarados; el rendimiento en castellano no esta garantizado.
- Contexto: el techo real no esta confirmado; el --ctx-size 32768 del ejemplo es una configuracion de carga, no una validacion de calidad a esa longitud.
- Calidad no graduada: no se puede inferir la puntuacion de este Q4_K_M a partir del Q6_K de DealignAI; son linajes y cuantizaciones distintos.
- Licencia Apache 2.0 declarada por el preservador, pero la cadena de procedencia (base Nanbeige, modificacion FRENCHFAKER) conviene verificarla antes de uso comercial.
- Artefacto de preservacion: el mantenimiento y soporte dependen de la coleccion Mango, no del autor original; las descargas son muy bajas (58), lo que limita la validacion comunitaria.
- No se ha validado el soporte multimodal ni rutas de decodificacion especulativa; habilitarlas requiere preflight propio.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/isilicon/mango-nanbeige-cyber-q4km
- Modelo base: https://huggingface.co/FRENCHFAKER/Nanbeige4.3-33B-cybersec-abliterated-GGUF
- Configuracion comparada Q6_K DealignAI: https://huggingface.co/isilicon/mango-nanbeige43-33b-uncensored-q6k
- Coleccion Mango: https://huggingface.co/collections/isilicon/mango-tested-models-and-preservation-mirrors-6ae3b73994c895ab42e360d2
- Resultados de evaluacion Mango: https://huggingface.co/datasets/isilicon/mango-evaluation-results
- Estudio de esfuerzo Qwen (referenciado): https://huggingface.co/isilicon/mango-qwen38-27b-uncensored-mlx4#qwen-medium-versus-xhigh
- Comunidad Discord: https://discord.gg/5n5YDbQCMy
- Manifiesto de origen: https://huggingface.co/isilicon/mango-nanbeige-cyber-q4km/blob/main/SOURCE_MANIFEST.json
- Estado del espejo: https://huggingface.co/isilicon/mango-nanbeige-cyber-q4km/blob/main/MIRROR_STATUS.json
- Metodologia de benchmark: https://huggingface.co/isilicon/mango-nanbeige-cyber-q4km/blob/main/BENCHMARK_METHODOLOGY.md
