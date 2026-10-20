# shivrajgurjar/Arjuna-V1-1.58bit

## Resumen

Arjuna-V1 (`shivrajgurjar/Arjuna-V1-1.58bit`) es un modelo fundacional multimodal publicado por el desarrollador independiente Shivraj Gurjar bajo licencia Apache-2.0. Segun su model card, se trata de un modelo **denso de 27.800 millones de parametros** construido sobre una columna vertebral hibrida de 64 capas que combina 48 capas de Gated DeltaNet (atencion lineal con estado recurrente de tamano constante) con 16 capas de atencion completa agrupada (GQA), en proporcion 3:1. Incorpora ademas una torre de vision para entrada imagen-texto y una cabeza nativa de Multi-Token Prediction (MTP) para decodificacion especulativa.

El problema que aborda es el coste de memoria de contexto largo: al mantener estado recurrente O(1) en 48 de las 64 capas, la cache KV solo crece en 16 capas, lo que permite declarar 262.144 tokens de contexto nativo y hasta 1.048.576 tokens mediante factores YaRN mRoPE precalculados. Los pesos se distribuyen cuantizados en AutoRound W4A16 INT4 (grupo de 128, pesos int32 empaquetados y escalas FP16), con un footprint declarado de 17,41 GiB, lo que lo situa en el rango de una unica GPU de 24 GB o dos T4 de 15 GB.

Su relevancia actual es la combinacion de tres tecnicas poco frecuentes en un mismo checkpoint: backbone hibrido lineal/atencion completa, cuantizacion W4A16 calibrada y cabecera especulativa MTP empaquetada junto a los pesos. No obstante, el repositorio no incluye resultados de benchmarks, no documenta los datos de entrenamiento y no cuenta con validacion independiente (0 descargas y 0 likes en el momento de la consulta), por lo que debe tratarse como material de evaluacion, no como modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido: 64 capas, 48 capas Gated DeltaNet (`linear_attn`, estado recurrente O(1)) + 16 capas de atencion completa con GQA (24 cabezas Q / 4 cabezas KV, `head_dim` = 256), en capas 3, 7, 11, ..., 63; incluye torre de vision y cabeza MTP |
| Parametros totales | 27,8 B segun la model card; el recuento de safetensors del repositorio indica 6.386.704.112 (ver nota de discrepancia en limitaciones) |
| Parametros activos | No aplica: modelo denso (sin MoE, sin poda de neuronas) |
| Longitud de contexto | 262.144 tokens nativos; extensible a 1.048.576 tokens con YaRN mRoPE precalculado |
| Tipos de cuantizacion | AutoRound W4A16 INT4 (`group_size` = 128, pesos int32 empaquetados + escalas FP16) en 407 matrices lineales; FP16 nativo en proyecciones recurrentes de Gated DeltaNet, torre de vision, embeddings y LayerNorms |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | `safetensors` (8 shards `model-0000X-of-00008` + `arjuna_accelerators.safetensors`); 2.013 tensores, 17,41 GiB |
| Tokens de salida maximos | 65.536 (declarado) |
| Cabecera especulativa | MTP nativa, 29 tensores (`mtp.*`, shard 8, 0,28 GiB) |
| Extras de inferencia | YaRN 1M, rotadores Walsh-Hadamard H128/H256 para KV4, controlador SEVTC de "thinking" |
| Requiere `trust_remote_code` | Si |

## Arquitectura y entrenamiento

La arquitectura es un hibrido explicito entre atencion lineal y atencion completa. Las 48 capas Gated DeltaNet mantienen un estado recurrente de tamano fijo (72,0 MB en total para las 48 capas, segun la model card) que no crece con la longitud de secuencia; las 16 capas de atencion completa, intercaladas cada cuatro capas, usan GQA con solo 4 cabezas KV de dimension 256, lo que reduce drasticamente la cache KV frente a un transformer clasico de 64 capas. El modelo conserva las 64 capas y los 17.408 intermedios SwiGLU por capa sin promediado de expertos ni poda de neuronas.

El esquema de cuantizacion combina AutoRound W4A16 en las 407 matrices lineales de MLP y atencion con un conjunto de tecnicas de calibracion propietarias declaradas por el autor: Quantization-Bias Spectral Compensation (QBSC) y Subnormal/Overflow Spectral Guard (SOSG) para las partes en FP16. Se incluye una cabeza MTP de 29 tensores para verificacion paralela de multiples tokens, con un speedup declarado de 3,6x a 4,4x, y un fichero auxiliar con frecuencias YaRN para 1M de contexto, matrices ortogonales de Walsh-Hadamard y umbrales del controlador SEVTC.

No hay informacion disponible sobre el volumen de tokens de entrenamiento, la composicion del dataset, las fases de alineacion (RLHF, DPO u otras) ni el proceso de destilacion o inicializacion de pesos. La etiqueta `qwen3_5` sugiere una base de la familia Qwen, pero la model card no documenta la relacion exacta ni que pesos se reutilizaron.

## Capacidades

- Generacion de texto conversacional multi-turno mediante plantilla de chat (`apply_chat_template`).
- Entrada multimodal imagen-texto: pipeline declarado `image-text-to-text`, con torre de vision en FP16 (`visual.*` en el shard 5).
- Contexto largo: 262.144 tokens nativos y hasta 1.048.576 con YaRN, adecuado para documentos extensos o historiales largos.
- Razonamiento con modo "thinking" controlado por umbrales SEVTC (Spectral Entropy-Velocity Thinking Controller).
- Decodificacion especulativa nativa via cabeza MTP, con speedup declarado de 3,6x a 4,4x.
- Generacion de hasta 65.536 tokens de salida en una sola peticion.
- Inferencia cuantizada W4A16 con pesos empaquetados int32, pensada para GPUs con poca VRAM.
- Soporte de tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y multi-step reasoning orquestado: no documentado.
- Capacidades multilingues: no documentadas.
- Capacidades de audio o video: no documentadas.

## Casos de uso

- **Analisis de documentacion tecnica extensa**: con 262.144 tokens nativos se puede cargar un repositorio de manuales o un conjunto de especificaciones completo en una sola ventana y hacer preguntas cruzadas sin chunking, evitando la perdida de contexto entre fragmentos.
- **Procesamiento de facturas y formularios escaneados**: la torre de vision permite pasar imagenes junto al texto; el modelo puede extraer campos estructurados de documentos y devolver JSON, con la ventaja de que el coste de cache KV crece solo en 16 capas.
- **Atencion al cliente con historial largo**: conversaciones multi-turno con cientos de miles de tokens de historial acumulado (tickets, correos previos) caben en una sola ventana, lo que simplifica el pipeline al eliminar la recuperacion por similitud.
- **Revision de contratos y documentacion legal**: el contexto de 1M tokens con YaRN permite comparar clausulas entre varios contratos simultaneamente; requiere validacion humana por el riesgo de alucinacion en citas normativas.
- **Despliegue en hardware de gama baja para lotes**: el footprint declarado de 17,41 GiB permite ejecutar el modelo en 2x T4 de 15 GB o 1x GPU de 24 GB, habilitando tareas de resumen y clasificacion por lotes en infraestructura economica.
- **Investigacion en arquitecturas hibridas**: sirve como banco de pruebas para estudiar el equilibrio entre capas DeltaNet y capas de atencion completa, o para hacer fine-tuning con QLoRA sobre las matrices INT4 y evaluar la degradacion frente a un transformer denso equivalente.
- **Generacion de codigo en pipelines por lotes**: puede generar y revisar codigo en tareas por lotes (documentacion de funciones, migracion de fragmentos); no se debe asumir soporte de tool calling ni integracion agentica, ya que no esta documentado.
- **Prototipado de asistentes multimodales en local**: util para entornos con requisitos de soberania de datos donde no se puede enviar informacion a una API externa, dado que los pesos son descargables y la licencia es Apache-2.0.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no reporta MMLU, HumanEval, GSM8K, MMMU ni ninguna otra metrica de calidad; solo declara el speedup relativo de la decodificacion especulativa (3,6x - 4,4x), sin indicar la linea base, el hardware ni el conjunto de prompts empleado.

## Requisitos de hardware

- **Pesos**: 17,41 GiB en total (INT4 + FP16), distribuidos en 8 shards; el repositorio completo ocupa 19,0 GB.
- **Reparto declarado**: aproximadamente 8,71 GiB por GPU en configuracion de 2 GPUs.
- **GPU consumer**: cabe en una RTX 3090 o RTX 4090 de 24 GB, pero solo con contexto corto. La cache KV en FP16 para las 16 capas de atencion completa (4 cabezas KV, `head_dim` 256) ocupa unos 64 KiB por token: ~2 GiB a 32K tokens, ~16 GiB a 262K y ~64 GiB a 1M (estimacion propia a partir de la configuracion declarada, no publicada por el autor). Los 24 GB se agotan antes de llegar al contexto nativo.
- **Contexto largo (262K-1M)**: requiere A100 80 GB, H100 80 GB o configuraciones multi-GPU con tensor parallelism; no es viable en GPUs consumer para el rango completo.
- **GPU recomendadas por escenario**: 2x T4 15 GB o 1x L4/A10G 24 GB para contexto corto y lotes; A100/H100 para contexto largo o `max_new_tokens` elevados.
- **Opciones de despliegue**: la model card solo documenta `transformers` con `trust_remote_code=True` y `device_map="auto"`. No se confirma soporte de vLLM, llama.cpp, Ollama ni TGI, y no se publican pesos GGUF (solo safetensors).
- **Latencia y throughput absolutos**: no disponibles. El unico dato es el multiplicador relativo de la decodificacion especulativa MTP.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Arjuna-V1 | 27,8 B (declarado) / 6,39 B contados en safetensors | 262.144 nativo; 1.048.576 con YaRN | Apache-2.0 | Hibrido Gated DeltaNet + atencion completa, W4A16, MTP, vision; sin benchmarks publicados |
| Qwen3-32B | 32,8 B denso | 32.768 nativo; 131.072 con YaRN | Apache-2.0 | Transformer denso convencional, sin vision ni MTP; benchmarks publicados por el autor |
| Qwen2.5-VL-32B-Instruct | 32,8 B | 128.000 (aprox.) | Apache-2.0 | Alternativa multimodal con evaluaciones publicas en MMMU y tareas de documentos |
| Gemma 3 27B | 27 B denso | 128.000 | Gemma Terms of Use | Multimodal con licencia no Apache; requiere revision de terminos para uso comercial |

La comparacion de rendimiento no es posible: Arjuna-V1 no publica ninguna metrica de calidad y su recuento de parametros declarado no coincide con el de los safetensors, por lo que no se puede establecer una equivalencia fiable con las alternativas. En la dimension de contexto, Arjuna-V1 declara 2x el contexto nativo de Qwen3-32B, pero sin evaluaciones que confirmen la calidad de recuperacion a esa distancia.

## Limitaciones y advertencias

- **Ausencia total de benchmarks**: no hay MMLU, HumanEval, GSM8K, MMMU ni evaluaciones de contexto largo; cualquier afirmacion de rendimiento es una promesa del autor sin verificar.
- **Discrepancia en el recuento de parametros**: la model card declara 27,8 B, mientras que los metadatos de safetensors suman 6.386.704.112 parametros. La relacion (27,8 / 6,39 = 4,35) es coherente con que el recuento cuente cada tensor int32 empaquetado como un elemento en lugar de cuatro, pero el autor no lo aclara y no se puede confirmar sin inspeccionar los tensores.
- **Etiqueta "1.58bit" enganosa**: el nombre del repositorio sugiere precision de 1,58 bits, pero el esquema descrito es W4A16 (4 bits en pesos, 16 bits en activaciones y escalas). Conviene no tomar el nombre como especificacion tecnica.
- **Sin datos de entrenamiento**: se desconoce el corpus, el numero de tokens, el proceso de alineacion y los filtros aplicados; no se pueden evaluar sesgos de forma informada.
- **Idiomas no documentados**: no hay lista de idiomas soportados ni evaluaciones multilingues; el uso en castellano no esta verificado.
- **Riesgo de alucinacion**: no documentado ni mitigado de forma explicita; el modo "thinking" con umbrales SEVTC no sustituye a una evaluacion de factualidad.
- **Contexto extendido sin validar**: la extension a 1.048.576 tokens via YaRN suele degradar la calidad en tareas de recuperacion exacta; no hay pruebas publicadas de "needle in a haystack" a 262K ni a 1M.
- **Coste real de memoria superior al anunciado**: los 17,41 GiB son solo pesos; a contexto nativo la cache KV añade ~16 GiB estimados, lo que invalida el despliegue en 24 GB para contextos largos.
- **Dependencia de `trust_remote_code`**: obliga a ejecutar codigo del autor; auditar antes de usar en produccion.
- **Despliegue limitado**: sin GGUF ni integracion confirmada en vLLM/Ollama/TGI, el rendimiento en servidor no esta caracterizado.
- **Madurez del repositorio**: 0 descargas, 0 likes, autor individual y fechas de creacion/actualizacion registradas como 2026-10-20, posteriores a la fecha de consulta; sin evidencia de uso en produccion ni de revision por terceros.
- **Licencia**: Apache-2.0 permite uso comercial, pero al estar etiquetado como `qwen3_5` conviene verificar si los pesos derivan de un modelo con condiciones adicionales antes de redistribuir.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/shivrajgurjar/Arjuna-V1-1.58bit
- No se han encontrado en la busqueda web papers, blogs tecnicos, repositorios de codigo ni demos asociados a este modelo.
