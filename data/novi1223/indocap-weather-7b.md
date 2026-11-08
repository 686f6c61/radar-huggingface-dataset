# novi1223/IndoCAP-Weather-7B

## Resumen

IndoCAP-Weather-7B es un adaptador LoRA de dominio especifico para alertas meteorologicas y gestion de emergencias en Indonesia, desarrollado por el usuario novi1223 y publicado bajo licencia Apache 2.0. Se construye sobre el modelo base Qwen/Qwen2.5-7B-Instruct mediante QLoRA con cuantizacion 4-bit NF4, y su proposito declarado es corregir tres fallos tipicos de los LLM generalistas en la gestion de desastres en un pais archipelagico: la fabricacion de alertas inexistentes (alucinacion espacial), la confusion entre subdistritos homonimos de distintas provincias y los errores al interpretar mensajes Common Alerting Protocol (CAP XML) con multiples poligonos y ciclos de vida operativos.

El modelo se presenta como una "foundation model" de alerta temprana adaptada al dominio, entrenada sobre 46 payloads CAP XML reales de BMKG (12 provincias) y el gazetteer nacional de Kemendagri con 7.817 entidades. Su propuesta diferencial no es la generacion de pronosticos meteorologicos, sino la verificacion y el razonamiento espacial sobre alertas oficiales ya emitidas, con abstencion epistemica cuando la informacion es ambigua y rechazo explicito de alertas para regiones sin aviso activo.

Es relevante ahora porque los organismos de gestion de desastres (BNPB, BPBD regionales) necesitan asistentes que no inventen emergencias y que entiendan el formato CAP, y porque el autor afirma que el modelo supera a alternativas de mayor tamano en su benchmark especifico. Conviene senalar que el repositorio tiene cero descargas y cero likes en el momento de la consulta, y que el benchmark es propio y no ha sido replicado de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-7B-Instruct) con adaptador LoRA (PEFT) |
| Parametros totales | 7,6B (modelo base); el adaptador LoRA ocupa 0,2 GB en el repositorio |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada de Qwen2.5-7B-Instruct, valor no confirmado en la model card) |
| Tipos de cuantizacion | Entrenamiento en 4-bit NF4 con doble cuantizacion; inferencia documentada en 4-bit NF4; otras cuantizaciones (GGUF, AWQ, GPTQ) no disponibles |
| Idiomas soportados | Indonesio (id) e ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere el modelo base por separado |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA sobre Qwen2.5-7B-Instruct, un transformer decoder-only de 7,6 mil millones de parametros. El ajuste se realizo con QLoRA en 4-bit NormalFloat4 (NF4) con doble cuantizacion, rango r=16, alpha=32 y dropout de 0,05, aplicado a todas las proyecciones lineales del transformer (q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj, down_proj). Esto implica que el adaptador modifica la atencion y el MLP en todas las capas, no solo en un subconjunto.

El corpus de dominio declarado es pequeno y muy especifico: 46 payloads CAP XML reales de BMKG cubriendo 12 provincias y el gazetteer nacional de Kemendagri con 7.817 entidades. No se detalla el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si hubo fases de RLHF o DPO adicionales. La model card no describe innovaciones arquitectonicas propias (no hay atencion lineal, decodificacion especulativa ni modo de razonamiento explicito): la contribucion es la adaptacion de dominio y el protocolo de evaluacion IndoCAP-Bench v2.0.

## Capacidades

- Razonamiento espacial sobre divisiones administrativas de Indonesia: provincias, kabupaten/kota y kecamatan, incluyendo resolucion de homonimos entre provincias.
- Verificacion de alertas meteorologicas activas y rechazo de alertas inexistentes (comportamiento anti-alucinacion, metrica Q_NEG).
- Abstencion epistemica ante consultas ambiguas o con informacion insuficiente (metrica Q_INDET).
- Parseo e interpretacion de mensajes Common Alerting Protocol (CAP XML): multiples poligonos geograficos, descripciones multi-area y estados operativos ACTIVE, SUPERSEDED y EXPIRED.
- Generacion de texto conversacional en indonesio e ingles con plantilla de chat compatible con Qwen2.5.
- Soporte de instrucciones mediante rol de sistema (system prompt) para fijar el rol de asistente oficial BMKG.
- Tool calling y function calling: no documentado en la informacion proporcionada.
- Capacidades de agente multi-paso: no documentadas.
- Vision y audio: no disponibles.
- Modo thinking explicito: no disponible.

## Casos de uso

- Verificacion de alertas para centros de operaciones de emergencia (Pusdalops BPBD): el modelo responde si existe un aviso activo para un kecamatan concreto consultando el estado CAP, y se abstiene cuando la consulta es ambigua en lugar de inventar una alerta.
- Atencion ciudadana en canales de mensajeria: un bot que responde en indonesio a preguntas del tipo "hay alerta para mi distrito" con respuestas acotadas al estado oficial, reduciendo el riesgo de difundir falsas emergencias.
- Validacion de payloads CAP antes de su publicacion: comprobacion de coherencia entre areas geograficas, poligonos multiples y ciclos de vida (ACTIVE, SUPERSEDED, EXPIRED) en la cadena de emision de avisos.
- Desambiguacion de toponimos homonimos: cuando un operador escribe solo el nombre del kecamatan, el modelo identifica la provincia y pide aclaracion si hay colision, usando el gazetteer de Kemendagri.
- Formacion de personal de proteccion civil: simulaciones de consulta con casos dificiles (jerga local, abreviaturas, errores tipograficos) donde el modelo debe decidir entre alertar, abstenerse o rechazar.
- Despliegue en estaciones de trabajo de borde: con un footprint de VRAM de aproximadamente 4,65 GB en 4-bit, puede ejecutarse en GPU de consumo (RTX 3060/4060) en oficinas regionales con conectividad limitada.
- Normalizacion de informes multi-area: resumir un CAP con varias areas afectadas en una descripcion operativa para briefing de turno.

## Benchmarks y rendimiento

Resultados declarados por el autor en IndoCAP-Bench v2.0 (holdout de 38 consultas), sin replicacion independiente:

| Modelo | Parametros | Precision global | Recall Q_REL | Abstencion Q_INDET | Anti-alucinacion Q_NEG |
|---|---|---|---|---|---|
| IndoCAP-Weather-7B (autor) | 7,6B | 100,0% | 100,0% | 100,0% | 100,0% |
| DeepSeek-R1-Distill-7B | 7,6B | 47,37% | 76,47% | 50,00% | 13,33% |
| Qwen-2.5-14B-Instruct | 14,7B | 42,11% | 82,35% | 33,33% | 0,00% |
| Gemma-2-9B-it | 9,2B | 39,47% | 76,47% | 16,67% | 6,67% |
| Llama-3.1-8B-Instruct | 8,0B | 36,84% | 70,59% | 33,33% | 0,00% |
| Qwen-2.5-7B-Instruct (base) | 7,6B | 34,21% | 70,59% | 16,67% | 0,00% |

Bateria out-of-distribution (N=20 consultas con jerga, errores tipograficos y abreviaturas): 95,0% de precision segun el autor. El autor declara tests exactos de McNemar bilaterales con correccion de Holm-Bonferroni frente a 9 baselines (p <= 1,91e-6). No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 4,65 GB en 4-bit NF4, segun la model card.
- GPU de consumo compatibles segun el autor: NVIDIA RTX 3060 y RTX 4060; en la practica cualquier GPU con 6-8 GB o mas de VRAM.
- GPU de datacenter: A100, H100 o L40S para mayor throughput y contexto largo; no se aportan cifras de latencia ni de tokens por segundo.
- Despliegue: la model card solo documenta inferencia local con transformers, bitsandbytes y PEFT. No se mencionan vLLM, llama.cpp, Ollama ni TGI, y al ser un adaptador PEFT requiere fusion o carga dinamica sobre el modelo base.
- Almacenamiento: el adaptador ocupa 0,2 GB; el modelo base Qwen2.5-7B-Instruct debe descargarse aparte.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| IndoCAP-Weather-7B | 7,6B (adaptador) | No disponible | Alerta CAP y razonamiento espacial en Indonesia | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen-2.5-7B-Instruct (base) | 7,6B | No disponible en esta ficha | Asistente generalista multilingue | Apache 2.0 | Ampliamente disponible |
| Llama-3.1-8B-Instruct | 8,0B | No disponible en esta ficha | Asistente generalista | Licencia comunitaria Llama 3.1 | Ampliamente disponible |
| Gemma-2-9B-it | 9,2B | No disponible en esta ficha | Asistente generalista | Licencia Gemma | Ampliamente disponible |

La comparacion relevante es frente al modelo base: IndoCAP-Weather-7B no anade capacidades generales, sino que restringe el comportamiento hacia el dominio de alertas. Frente a sistemas de prediccion meteorologica con IA (por ejemplo, los enfoques de Microsoft Research o WeatherNext de Google DeepMind), la diferencia es de proposito: aquellos generan pronosticos probabilisticos a partir de datos atmosfericos, mientras que este modelo razona sobre avisos oficiales ya emitidos y su formato CAP.

## Limitaciones y advertencias

- No genera pronosticos meteorologicos: opera sobre alertas y metadatos CAP existentes; no sustituye a un modelo numerico de prediccion del tiempo.
- Corpus de entrenamiento muy reducido (46 payloads CAP de 12 provincias), lo que limita la cobertura geografica y la generalizacion a otras agencias emisoras o variantes de CAP.
- Benchmark propio (IndoCAP-Bench v2.0) con 38 consultas de holdout y resultados del 100%: muestra pequena y sin validacion independiente; el 100% en todas las metricas debe interpretarse con cautela.
- Riesgo de sobreajuste al formato y a la plantilla de sistema usada en el entrenamiento; el rendimiento puede degradarse fuera de ese esquema.
- Riesgo residual de alucinacion espacial fuera de las 7.817 entidades del gazetteer o ante toponimos nuevos o mal escritos.
- Idiomas limitados a indonesio e ingles; no se documenta soporte de otras lenguas locales (javanes, sundanés, etc.).
- El repositorio registra cero descargas y cero likes, y la model card incluye una cita a revistas sin DOI verificable: la procedencia academica no esta confirmada.
- El modelo base Qwen2.5-7B-Instruct conserva sus propios sesgos; la adaptacion de dominio no los elimina.
- En produccion, cualquier decision de emergencia debe validarse contra la fuente oficial BMKG; el modelo debe tratarse como herramienta de apoyo, no como autoridad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/novi1223/IndoCAP-Weather-7B
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Estudio de prediccion meteorologica con IA de Microsoft Research (contexto): https://www.unite.ai/microsoft-research-publishes-ai-weather-forecasting-study-in-nature/
- Weather Lab de Google DeepMind / WeatherNext (contexto): https://developers.google.com/weathernext/guides/weatherlab
