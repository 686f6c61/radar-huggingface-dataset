# mukti-sys/cortex-1-large

## Resumen

Cortex-1 Large es un modelo encoder de 421 millones de parametros desarrollado por mukti-sys, fine-tuneado a partir de answerdotai/ModernBERT-large, que no genera texto ni codigo de forma autorregresiva: funciona como un motor de decision y ranking de opciones de un solo paso hacia delante (forward pass). Su tarea es actuar como "system 1" rapido dentro de agentes de codigo autonomos, evaluando propuestas tecnicas, candidates de arquitectura y barreras de seguridad antes de que el agente ejecute una accion.

El modelo resuelve un problema concreto en pipelines agenticos: la necesidad de un gate barato y de baja latencia que decida si una accion propuesta (por ejemplo, un cambio de esquema en base de datos o un diff de codigo) es segura, peligrosa o cual es la mejor entre varias alternativas. Frente a un LLM generativo, Cortex-1 reduce el coste a una unica pasada sobre el contexto, con una latencia reportada de aproximadamente 32,8 ms en una GPU NVIDIA RTX 5050 Laptop (8 GB GDDR7, arquitectura Blackwell sm_120).

Es relevante ahora porque la mayoria de los harnesses de agentes (Cursor, Google Antigravity u otros) delegan las decisiones de gating en el propio LLM generativo, lo que es lento y caro. Cortex-1 propone separar esa funcion en un clasificador dedicado con ranking dinamico de entre 2 y 5 opciones arbitrarias, sin limite fijo de clases, y con licencia Apache 2.0. Publica buenos resultados en triaje de CWE de ciberseguridad (95,2%) y en gating de pull requests (93,66% Top-1), aunque con un rendimiento mucho mas modesto (~49,5%) en identificacion de causa raiz en condiciones de carrera distribuidas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer (backbone ModernBERT-large) con cabeza de 2 capas TransformerEncoder y pooling dinamico de tokens marcadores ([MASK]) mediante torch.gather |
| Parametros totales | 421M |
| Parametros activos | no aplica (arquitectura densa, no es MoE) |
| Longitud de contexto | no disponible en la ficha del modelo; el backbone ModernBERT-large admite hasta 8192 tokens |
| Tipos de cuantizacion | no disponible (entrenamiento en bfloat16 con AdamW de 8 bits; no se documentan pesos cuantizados publicados) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (model.safetensors), requiere codigo propio del framework Cortex (laya.common.DecisionModel, build_sequence) |

## Arquitectura y entrenamiento

Cortex-1 Large no es un modelo generativo: es un encoder de clasificacion construido sobre ModernBERT-large (28 capas, dimension oculta de 1024, 421M de parametros). Sobre el backbone se anade una cabeza de dos capas TransformerEncoder y un mecanismo de pooling dinamico de tokens marcadores que usa `torch.gather` sobre posiciones `[MASK]` insertadas en la secuencia de entrada. Este diseno permite comparar de 2 a 5 opciones candidatas arbitrarias sin fijar de antemano un numero de clases, devolviendo una distribucion de probabilidad (softmax) sobre las opciones presentes en la consulta.

El entrenamiento se realizo en precision mixta bfloat16 con optimizador AdamW de 8 bits y gradient checkpointing. No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO; dado que es un clasificador, lo esperable seria aprendizaje supervisado sobre pares contexto/pregunta/opciones etiquetados, pero esto no se confirma en la model card. Si se documenta el esquema de entrada: un contexto mas una pregunta estructurada con criterios y opciones, tokenizados junto a marcadores que la cabeza usa para agregar informacion.

No se describen innovaciones como decodificacion especulativa ni atencion lineal. La innovacion principal es el uso de un encoder no autorregresivo como "prefrontal cortex" de agentes, es decir, sustituir una llamada generativa de gating por una unica pasada de inferencia.

## Capacidades

- Clasificacion y decision en una sola pasada (non-autoregressive), sin generacion de texto libre.
- Ranking dinamico de opciones: compara entre 2 y 5 candidatas arbitrarias en la misma consulta.
- Gating de seguridad en acciones de agente: aprobar o detener ejecuciones potencialmente peligrosas.
- Triaje de seguridad: clasificacion de CWEs y bloqueadores de seguridad en codigo.
- Diagnostico de codigo y evaluacion de riesgo de diffs.
- Triaje de runtimes de AI/ML.
- Seleccion de arquitectura y de estrategias tecnicas (por ejemplo, comparar politicas de cache).
- Soporte de tool calling: si, como componente de gating previo a la llamada a herramienta, no como emisor de llamadas.
- Soporte de agentes y razonamiento multi-paso: actua como gate rapido dentro de un bucle agentico, no como planificador autonomo.
- Capacidades multilingues: no, solo ingles.
- Capacidades especiales: ninguna modalidad adicional (no vision ni audio); el modo de operacion es una pasada de clasificacion a baja latencia.

## Casos de uso

- Gating de seguridad en agentes de codigo autonomos: antes de que el agente aplique un cambio en el repositorio, Cortex-1 puntua el diff y decide si se aprueba o se detiene. Es adecuado porque su especificidad reportada en paradas de peligro es del 100% (71/71) sin falsos positivos de aprobacion en los PR evaluados.
- Seleccion de estrategia de cache o de persistencia: dado un contexto de requisitos (por ejemplo, API de alto trafico que cachea permisos de usuario), el modelo puntua opciones como JWT en cliente, Redis con TTL de 15 minutos o consulta directa a PostgreSQL. Encaja porque el ranking es dinamico y no requiere reentrenar para nuevas alternativas.
- Triaje de vulnerabilidades en pipelines de seguridad: clasificacion de hallazgos CWE para priorizar que se escala a revision humana. Su 95,2% en triaje CWE (300/315) lo hace util como primer filtro barato antes de un analisis mas caro.
- Autopilot gating en revision de pull requests: preclasificacion de PRs multiarchivo para decidir aprobacion automatica o bloqueo. El 93,66% Top-1 (399/426) y el 100% de sensibilidad y especificidad en el conjunto evaluado apuntan a este uso como el mas maduro.
- Triaje de incidencias en runtimes de AI/ML: clasificar errores de ejecucion de modelos y frameworks para enrutarlos al equipo o al runbook correspondiente; reporta 99,4% (164/165) en este conjunto.
- Enrutamiento de tareas en un harness agentico: usar la salida de probabilidad como senal para decidir si la tarea se resuelve con una herramienta rapida o si requiere escalar a un LLM generativo, reduciendo coste por token.
- Puntuacion de riesgo en CI/CD: integrado como paso previo al merge, puede marcar cambios que toquen migraciones masivas o restricciones de claves foraneas, tal como ilustra el ejemplo de la model card.

## Benchmarks y rendimiento

| Conjunto / metrica | Cortex-1 Large | Referencia comparable |
|---|---|---|
| Top-1 accuracy global (benchmark industrial, held-out) | 82,32% (IC 95% Wilson: 79,30%-84,98%) | TypeSafe Jev publicado: 72,70% (margen +9,62%, p < 0,001) |
| Triaje de runtime AI/ML | 99,4% (164/165) | no disponible |
| Triaje de CWE de ciberseguridad | 95,2% (300/315) | no disponible |
| Gating de PR de desarrollador, Top-1 | 93,66% (399/426) | no disponible |
| Gating de PR, sensibilidad (acciones seguras) | 100,0% (71/71) | no disponible |
| Gating de PR, especificidad (paradas peligrosas) | 100,0% (71/71), FP = 0 | no disponible |
| Identificacion de causa raiz en condiciones de carrera distribuidas (tipo SWE-bench Verified) | ~49,5% | no disponible |
| Latencia de inferencia | ~32,8 ms en RTX 5050 Laptop (8 GB GDDR7, sm_120) | no disponible |

No se han publicado en la informacion disponible otros benchmarks estandar (MMLU, HumanEval, GSM8K), lo cual es coherente con que el modelo no sea generativo.

## Requisitos de hardware

- VRAM estimada para inferencia: en bfloat16 o float16, aproximadamente 0,85-0,9 GB solo para pesos, mas activaciones y cache; en float32, alrededor de 1,7 GB. Con 2 GB de VRAM dedicada deberia ser suficiente en la mayoria de configuraciones.
- GPU recomendadas: cualquiera con soporte de bfloat16 o fp16. El autor reporta medidas en una NVIDIA RTX 5050 Laptop (8 GB GDDR7, sm_120). Funciona igualmente en RTX 4090, A100, H100 o GPUs integradas modernas; no necesita VRAM de clase datacenter.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer reciente (RTX 3060 en adelante, e incluso GPUs de 4-8 GB) y tambien en CPU para lotes pequenos, aunque la latencia de 32,8 ms es una medida en GPU.
- Opciones de despliegue: no se documentan integraciones con vLLM, TGI, llama.cpp u Ollama; al ser un encoder con cabeza personalizada y pooling por marcadores, el despliegue pasa por cargar `model.safetensors` con safetensors y usar el codigo del framework Cortex (`laya.common.DecisionModel`, `build_sequence`) sobre el tokenizer de ModernBERT-large.
- Latencia y throughput estimados: el autor reporta ~32,8 ms por pasada en la GPU citada; no se publican cifras de throughput en lote ni de latencia en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Cortex-1 Large | 421M | no disponible (backbone hasta 8192) | Encoder clasificador no autorregresivo, ranking dinamico | 82,32% Top-1 industrial; 93,66% gating PR; ~49,5% en carreras distribuidas | Apache 2.0 | HuggingFace, requiere codigo propio |
| ModernBERT-large (base) | 421M | 8192 tokens | Encoder base | No entrenado para esta tarea; no comparable directamente | Apache 2.0 | HuggingFace, transformers estandar |
| TypeSafe Jev | no disponible | no disponible | Clasificador de gating | 72,70% Top-1 publicado | no disponible | no disponible |
| Clasificadores encoder genericos (por ejemplo, DeBERTa-v3-large) | ~304M-435M | 512-1024 tokens tipicamente | Encoder de clasificacion | No comparable: no existe version entrenada para gating agentico con ranking dinamico | MIT / Apache segun variante | HuggingFace |

No se dispone de informacion suficiente para comparar con otras alternativas especificas de gating agentico mas alla de TypeSafe Jev, citada por el propio autor.

## Limitaciones y advertencias

- No es un LLM generativo: es un encoder clasificador. No escribe texto conversacional ni genera codigo de forma autorregresiva, por lo que no puede usarse como sustituto de un modelo de lenguaje.
- Rendimiento bajo en causas raiz complejas: ~49,5% en identificacion de causa raiz de condiciones de carrera multihilo en bases de codigo distribuidas grandes (por ejemplo, SWE-bench Verified). No es fiable como diagnostico profundo.
- Solo ingles: el modelo no soporta otros idiomas, lo que limita su uso en entornos hispanohablantes sin traduccion previa.
- Riesgo de alucinacion: al no generar texto, el riesgo clasico no aplica, pero si existe riesgo de calibracion erronea en las probabilidades de ranking, especialmente con opciones fuera de la distribucion de entrenamiento.
- Sesgos: no se documenta analisis de sesgos en la informacion disponible. Al estar entrenado sobre datos de codigo, puede heredar sesgos de estilo y practicas de los repositorios de origen.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, con obligacion de conservar avisos de licencia. El backbone ModernBERT-large mantiene su propia licencia Apache 2.0.
- Dependencia de codigo no publicado en el repositorio de HuggingFace: el ejemplo de uso importa `laya.common`, un paquete del framework Cortex que no figura como dependencia estandar ni esta descrito en la ficha. Sin ese codigo, los pesos no son cargables con `AutoModelForSequenceClassification`.
- El tamano del repositorio figura como 0,0 GB, lo que sugiere que los pesos pueden no estar efectivamente subidos o no son accesibles; conviene verificar `model.safetensors` antes de planificar un despliegue.
- Modelo con 0 descargas y 1 like en el momento de la consulta: las cifras de benchmark no han sido reproducidas de forma independiente por la comunidad.
- Las metricas de 100% de sensibilidad y especificidad corresponden a conjuntos held-out de 71 ejemplos por clase; no deben extrapolarse como garantia de seguridad en produccion.
- No hay informacion sobre el dataset de entrenamiento, su procedencia ni su tamano, lo que dificulta auditar el comportamiento fuera de los dominios evaluados (IA/ML, ciberseguridad, codigo).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mukti-sys/cortex-1-large
- Modelo base: https://huggingface.co/answerdotai/ModernBERT-large
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Resultados de la busqueda web: no se han encontrado enlaces relevantes al modelo. Las busquedas devuelven unicamente resultados sobre el concepto espiritual "mukti" y sobre la marca de cosmetica Mukti Organics, sin relacion con mukti-sys ni con Cortex-1. No se dispone de paper, blog tecnico, repositorio de codigo ni demo publicos en la informacion proporcionada.
