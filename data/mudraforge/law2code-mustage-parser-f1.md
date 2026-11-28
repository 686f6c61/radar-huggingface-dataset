# MudraForge/law2code-MuStage-Parser-F1

## Resumen

MudraForge MuStage Parser F1 (identificador `law2code-MuStage-Parser-F1`) es un motor de parsing estatutario multi-etapa publicado por MudraForge, orientado a infraestructura de cumplimiento normativo en finanzas corporativas, derecho comercial y banca. No es un LLM generativo: es un pipeline de tres micro-especialistas neuronales de token classification que extraen entidades estructuradas (importes, tasas, fechas, plazos, citas legislativas, modales deónticos y umbrales) del texto legal en inglés y las emiten en un esquema JSON de dos capas.

La arquitectura es deliberadamente minimalista: tres modelos de aproximadamente 283K, 230K y 304K parámetros, cada uno con 124K de codificación, que se combinan mediante un árbitro determinista de consenso en dos fases ("Two-Phase Collaborative Consensus Arbitrator") con inmunidad estructural de nivel 1 y prioridad léxica. El paquete binario completo ocupa 6,5 MB, lo que permite ejecución en CPU y en hardware de borde con un consumo de VRAM inferior a 180 MB.

Su relevancia radica en la propuesta de "law2code": sustituir la generación libre por extracción determinista y verificable, sin expresiones regulares ni diccionarios de clases abiertas, para producir representaciones susceptibles de compilarse a AST o a reglas ejecutables. El modelo está etiquetado como `stage1a`, lo que sugiere que forma parte de un pipeline mayor. La licencia es Apache 2.0 y solo declara soporte de inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de tres micro-especialistas neuronales de token classification (S1A-M1, S1A-M2, S1A-M3) con arbitro determinista de consenso en dos fases |
| Parametros totales | 817K aproximados (283K + 230K + 304K); cada especialista con 124K de codificacion |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible; los checkpoints se distribuyen en formato `.pt` |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | Checkpoints PyTorch (`.pt`): `stage1_micro_qty_term_pure_v1.pt`, `stage1_micro_xref_pure_v1.pt`, `stage1_micro_op_pure_v1.pt`; tamano total del paquete 6,5 MB |

## Arquitectura y entrenamiento

El sistema se compone de tres especialistas independientes que procesan el mismo texto estatutario en paralelo. S1A-M1 (283K parámetros) cubre cantidades, techos y suelos monetarios, tasas fijas y flotantes, fechas de calendario, duraciones, cardinales y términos definidos estatutarios. S1A-M2 (230K parámetros) se encarga de referencias cruzadas legislativas, citas multinivel de secciones y anclas estructurales de subcláusulas. S1A-M3 (304K parámetros) identifica operadores legales ejecutables: modales deónticos (`shall`, `may`, `must`), comparadores de umbral (`within`, `after`, `more than`), excepciones (`unless`, `provided that`) y definiciones, mapeados a 18 opcodes estatutarios canónicos.

Las salidas de los tres especialistas se resuelven en un árbitro de consenso en dos fases con inmunidad estructural de nivel 1 y prioridad léxica, que decide qué spans se reclaman como hojas estatutarias y cuáles se difieren a un pool de sub-hojas. El autor declara explícitamente cero expresiones regulares y cero codificación dura de diccionarios de clase abierta. No se han publicado en la información disponible detalles sobre el corpus de entrenamiento (número de tokens, composición, procedimiento de anotación) ni sobre si hubo ajuste fino supervisado, RLHF o DPO.

## Capacidades

- Extracción de entidades estatutarias estructuradas mediante token classification: `MONEY`, `RATE`, `DATE`, `DURATION`, `COUNT`, `DEFINED_TERM`.
- Detección de referencias cruzadas legislativas y coordenadas normativas (`XREF`), incluidas citas multinivel de secciones.
- Identificación de modales deónticos y operadores legales ejecutables con 18 opcodes canónicos (`OP`).
- Detección de comparadores de umbral y cláusulas de excepción (`unless`, `provided that`).
- Emisión de un esquema dual: `out_record["leaves"]` con hojas reclamadas y `out_record["sub_spans"]` con el pool diferido de sub-hojas marcadas como `PENDING_CLAIM`.
- Clasificación de funtores de condición relacional (`if`, `where`, `or`, `and`, `nor`, `no`, `from`) para compilación posterior de condiciones y ensamblaje de AST.
- Ejecución en CPU (x86_64 y ARM64) y en GPU CUDA.
- No soporta generación de texto, razonamiento libre, código, matemáticas ni visión. No se documenta soporte de tool calling ni de agentes.

## Casos de uso

- Extracción de importes y tasas en contratos y normativa bancaria: el especialista S1A-M1 aísla techos, suelos, tasas fijas y flotantes con sus etiquetas canónicas, lo que permite alimentar sistemas de cálculo de capital regulatorio sin post-procesado manual.
- Normalización de plazos y fechas en cláusulas de cumplimiento: S1A-M1 extrae duraciones y fechas de calendario, útiles para generar calendarios de vencimiento automáticos a partir de textos como "within a period of thirty days".
- Resolución de referencias cruzadas en corpus legislativos: S1A-M2 identifica citas multinivel de secciones y anclas estructurales, lo que facilita construir grafos de dependencias normativas entre artículos y subcláusulas.
- Detección de obligaciones y permisos para motores de reglas: S1A-M3 clasifica modales deónticos y umbrales en opcodes, lo que permite compilar cláusulas a reglas ejecutables en sistemas de gestión de políticas internas.
- Preprocesado para pipelines de "law2code": el esquema dual `leaves`/`sub_spans` está pensado para alimentar etapas posteriores de compilación de AST y de condiciones, reduciendo el trabajo de un LLM generativo aguas abajo.
- Despliegue en entornos de borde o air-gapped: con menos de 180 MB de VRAM y 6,5 MB de pesos, el modelo puede ejecutarse en CPU dentro de infraestructuras on-premise con requisitos estrictos de confidencialidad documental.
- Auditoría y anotación asistida de contratos: la salida estructurada y determinista facilita la revisión humana y la trazabilidad de cada span extraído, algo que un modelo generativo no ofrece de forma nativa.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K ni métricas de NER como F1 por etiqueta). Solo se documentan métricas de latencia y throughput:

| Perfil de hardware | Modo de procesamiento | Latencia por provisión | Throughput |
|---|---|---|---|
| GPU NVIDIA (CUDA) | Forward pass neuronal puro (M1 + M2 + M3) | 124,0 ms | ~8,0 provisiones/s |
| GPU NVIDIA (CUDA) | Pipeline completo extremo a extremo | 338,4 ms | ~3,0 provisiones/s |
| CPU (x86_64 / ARM64) | Pipeline completo extremo a extremo | 422,8 ms | ~2,4 provisiones/s |

No se han publicado resultados de benchmarks de calidad en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 180 MB en ejecución de producción, según el autor.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA; el reducido tamaño no exige modelos de gama alta (A100, H100 o RTX 4090 son sobredimensionadas para este fin).
- Cabe en cualquier GPU de consumo e incluso en CPU x86_64 o ARM64 sin acelerador.
- Opciones de despliegue: el autor proporciona un paquete Python (`modular_pipeline.MudraForgeModularPipeline`) que carga los checkpoints `.pt` directamente con `device="cuda"` o `device="cpu"`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: 124,0 ms por provisión en GPU (forward pass puro), 338,4 ms en GPU con pipeline completo y 422,8 ms en CPU; throughput de ~8,0, ~3,0 y ~2,4 provisiones por segundo respectivamente.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Los pipelines de parsing legal y token classification de entidades jurídicas (por ejemplo, modelos tipo Legal-BERT para NER legal) podrían ser alternativas conceptuales, pero no se han aportado datos de parámetros, contexto ni rendimiento que permitan una comparación rigurosa.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| MudraForge MuStage Parser F1 | ~817K (3 especialistas) | No disponible | Apache 2.0 | Hugging Face |
| Alternativas de NER legal | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Cobertura lingüística restringida al inglés; no se declara soporte de castellano ni de otros idiomas.
- No es un modelo generativo: no puede redactar, resumir ni responder preguntas; solo etiqueta spans.
- El modelo está etiquetado como `stage1a` y depende de etapas posteriores del pipeline para la compilación de condiciones y AST; su utilidad aislada es limitada.
- No se han publicado métricas de calidad (precisión, recall, F1 por etiqueta) ni detalles del corpus de entrenamiento, lo que impide evaluar su robustez en dominios distintos al de entrenamiento.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí riesgo de falsos positivos y negativos en la delimitación de spans, sin umbrales de confianza documentados.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.
- Aunque la licencia es Apache 2.0 y permite uso comercial, no se documentan garantías de exactitud legal; el uso en producción regulatoria requiere validación humana.
- El tamaño del repo figura como 0.0 GB, lo que puede indicar que los pesos no están efectivamente alojados en el repositorio o que la información de tamaño no está actualizada.

## Enlaces

- Hugging Face: https://huggingface.co/MudraForge/law2code-MuStage-Parser-F1
- No se han encontrado otros enlaces (papers, blogs, repositorios o demos) en la información disponible.
