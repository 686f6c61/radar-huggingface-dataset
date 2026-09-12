# moebiusT7/gemma-4-12b-mobius-custom

## Resumen

`moebiusT7/gemma-4-12b-mobius-custom` es un modelo de generacion de texto publicado por el usuario moebiusT7 que envuelve un LM causal de arquitectura Gemma-2 (que el autor denomina comercialmente "Gemma-4") con dos capas de gobernanza locales y agnosticas al modelo. Los pesos base derivan de `google/gemma-2-9b-it`, fueron cuantizados a NF4 de 4 bits con bitsandbytes y el repositorio declara 11.959.730.224 parametros totales en formato safetensors, con un tamano de repo de 7,7 GB.

El problema que aborda no es la calidad generativa en si, sino el control de que puede responder el modelo y que puede leer. La primera capa (MMV, answer entitlement) decide antes de generar si el turno es "respondible tal como esta formulado"; los turnos inseguros o inadmisibles se rechazan y los infraespecificados se difieren. La segunda (RCGov, context governance) depura el contexto recuperado (RAG) antes de que el modelo lo vea, eliminando secretos, inyecciones obvias y contenido de autoridad no verificada, y produce un "Clean Context Pack".

Es relevante ahora por dos motivos: propone un patron de gobernanza en el borde de la inferencia (local-first, sin llamadas adicionales a modelos) orientado a despliegues RAG con requisitos de cumplimiento, y lo hace bajo licencia AGPL-3.0 con patentes pendientes sobre MMV y RCGov, lo que condiciona su uso comercial. El autor publica una variante alternativa, `gemma-4-12b-mobius-custom-c1`, sobre el GGUF QAT q4_0 oficial de Google con llama.cpp, entre 3 y 4 veces mas rapida por llamada segun sus mediciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only, arquitectura Gemma-2 (denominada "Gemma-4" por el autor) |
| Parametros totales | 11.959.730.224 (~11,96 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NF4 de 4 bits (bitsandbytes), autogenerada desde pesos bf16 del modelo base |
| Idiomas soportados | no disponible |
| Licencia | AGPL-3.0 (patentes pendientes sobre MMV y RCGov, MOBIUS LLC) |
| Formato de pesos | safetensors (cuantizados a 4 bits), `trust_remote_code` requerido para cargar `pipeline.py` |
| Modelo base | google/gemma-2-9b-it |
| Tamano del repositorio | 7,7 GB |
| Pipeline declarado | text-generation (los tags incluyen `image-text-to-text` y `gemma4_unified`, sin documentacion que lo respalde) |

## Arquitectura y entrenamiento

No se documenta un entrenamiento propio: el modelo reutiliza los pesos de `google/gemma-2-9b-it` y anade una capa de software sobre la generacion. La unica transformacion sobre los pesos es la cuantizacion a NF4 de 4 bits con bitsandbytes a partir de los pesos bf16. No hay informacion sobre tokens de entrenamiento, composicion del dataset, RLHF, DPO ni ninguna innovacion en el preentrenamiento o el ajuste fino. La innovacion declarada es de infraestructura de inferencia, no de modelo.

La arquitectura funcional es un pipeline con dos etapas previas a la generacion. MMV (answer entitlement) clasifica cada turno en `answer`, `verify`, `ask` o `abstain` mediante un router heuristico en Python puro; solo los turnos con "derecho a respuesta" llegan al LM. RCGov inspecciona el contexto recuperado con deteccion basada en regex, entropia y analisis lexico (sin llamadas a modelos adicionales), descarta secretos y contenido con autoridad no acreditada, y entrega un Clean Context Pack. Existe ademas un guardia de inyeccion a nivel de pipeline, descrito explicitamente por el autor como defensa en profundidad y no como una defensa robusta, porque el detector propio de RCGov es estrecho. El presupuesto de latencia anadido objetivo es inferior a 2,5 s sobre la generacion vainilla. La salida no es una cadena sino un diccionario con `route`, `reason_code`, `entitled`, `text`, `governed` y `context_empty`.

## Capacidades

- Generacion de texto conversacional sobre pesos Gemma-2 9B IT: el modelo base aporta razonamiento, codigo, matematicas y comprension multilingue, aunque no se documentan idiomas soportados.
- Gobernanza de answer entitlement (MMV): rechaza turnos inadmisibles antes de generar (ruta `abstain`) y difiere turnos infraespecificados (ruta `ask`), sin aplicar questioning reflexivo.
- Gobernanza de contexto RAG (RCGov): escaneo de secretos, evaluacion de procedencia y autoridad, y generacion de un Clean Context Pack que el modelo lee en lugar del contexto crudo.
- Perfiles de gobernanza configurables: `Conservative`, `Balanced`, `Aggressive` y `Research`.
- Guardia de inyeccion de prompt en el contexto recuperado (nivel de pipeline).
- Salida estructurada con trazabilidad: ruta, codigo de razon, indicador de entitlement y metadatos de la ejecucion de RCGov.
- Integracion con `transformers` mediante `pipeline()` y `trust_remote_code=True`, compatible con despliegue en vLLM y SGLang segun el autor.
- No se documenta soporte de tool calling, function calling, uso de agentes, vision, audio ni modo de razonamiento explicito. Los tags `image-text-to-text` no estan respaldados por la model card.

## Casos de uso

- Atencion al cliente sobre documentacion corporativa (RAG): RCGov depura los fragmentos recuperados antes de que el modelo los lea, de modo que un documento interno con credenciales filtradas o con instrucciones incrustadas no llegue nunca al contexto efectivo.
- Cumplimiento y gestion de solicitudes reguladas: MMV rechaza antes de generar los turnos inadmisibles, lo que permite registrar una denegacion con codigo de razon (`SAFETY_INADMISSIBLE`) en lugar de depender de un refusal generado por el modelo.
- Asistentes internos con requisitos de trazabilidad: la salida en diccionario con `route`, `reason_code` y metadatos de gobernanza permite auditar por que se respondio, se verifico o se rechazo cada turno.
- Defensa contra inyeccion de prompt en pipelines RAG: el guardia a nivel de pipeline descarta contexto con intentos de anulacion de instrucciones o secuestro de rol antes de la gobernanza; util como capa adicional, no como defensa unica.
- Despliegue local-first con requisitos de soberania de datos: al ser inferencia local sobre pesos abiertos y gobernanza basada en heuristicas sin llamadas externas, el contenido no sale del entorno del operador.
- Clarificacion de consultas ambiguas en formularios o buscadores: la ruta `ask` deriva los turnos sin restricciones suficientes en lugar de forzar una respuesta especulativa, encajando con un bucle externo de preguntas de aclaracion.
- Filtrado previo en pipelines de generacion aumentada: la etapa de gobernanza se puede usar como preprocesador que marca que contexto es apto y cual se descarta antes de invocar un modelo mayor o mas costoso.
- Prototipado de politicas de gobernanza: los cuatro perfiles permiten comparar el comportamiento conservador frente al agresivo en un mismo corpus sin reentrenar nada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La model card unicamente reporta mediciones internas de calidad de gobernanza sobre sondas propias, con 3 semillas, cuyo formato de agregacion no se explica en detalle:

| Sonda | Resultado declarado |
|---|---|
| Premisa falsa (4 preguntas, 3 semillas) | 0/12 fabricaciones |
| Alto riesgo (3 preguntas, 3 semillas) | 9/9 |
| Corpus enrutado (37 elementos) | 63/15/33 |
| Consultas bien especificadas (20, 3 semillas) | 60/60 |

Latencia por llamada medida por el autor en una RTX 5070 Ti:

| Modelo | Segundos por llamada | Chat de alto riesgo |
|---|---|---|
| Este modelo (transformers, NF4) | 31 s (55 s cuando el LM se ejecuta) | 41 s |
| gemma-4-12b-mobius-custom-c1 (llama.cpp, GGUF q4_0) | 7,6 s | 13,1 s |

El autor afirma que la calidad de gobernanza medida es identica entre ambos artefactos y que la diferencia es de runtime y velocidad.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo pesa 7,7 GB en NF4 de 4 bits, por lo que se necesitan aproximadamente 8-10 GB de VRAM para los pesos mas el margen de activaciones y cache KV. Valor estimado a partir del tamano del repositorio, no publicado por el autor.
- GPU de consumo: el autor ha medido el modelo en una RTX 5070 Ti (16 GB), de modo que cabe en tarjetas consumer de 16 GB o mas. En GPUs de 12 GB el margen es ajustado y depende de la longitud de contexto.
- GPU profesionales: no se documenta soporte verificado en A100, H100 u otras; al ser un modelo de ~12 B, cualquiera de ellas lo ejecuta con holgura.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (obligatorio, para cargar `pipeline.py`), y segun el autor tambien vLLM y SGLang. La variante C1 esta pensada para llama.cpp `llama-server`. No se mencionan Ollama ni TGI.
- Latencia: 31 s por llamada en RTX 5070 Ti (55 s cuando el LM interviene) y 41 s en chat de alto riesgo. Es un perfil de latencia propio de uso por lotes o asincrono, no de chat interactivo.
- Rendimiento comparado: la variante C1 sobre GGUF q4_0 declara 7,6 s y 13,1 s por llamada en la misma GPU, entre 3 y 4 veces mas rapida (7 veces cuando el LM de este modelo se ejecuta).

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion / runtime | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|---|
| gemma-4-12b-mobius-custom | ~11,96 B | NF4 4 bits, transformers (vLLM/SGLang) | no disponible | AGPL-3.0, patentes pendientes | HuggingFace, 104 descargas, 0 likes | Capa MMV + RCGov; 31 s por llamada |
| gemma-4-12b-mobius-custom-c1 | no disponible | GGUF q4_0 oficial de Google (QAT), llama.cpp | no disponible | no disponible en la informacion | HuggingFace | Misma calidad de gobernanza declarada; 7,6 s por llamada |
| google/gemma-2-9b-it | 9 B | bf16 e IT, cuantizaciones habituales | no disponible | licencia Gemma de Google | HuggingFace | Modelo base; sin capa de gobernanza; respuestas directas sin entitlement ni depuracion de contexto |

No se dispone de datos de rendimiento en tareas estandar que permitan una comparacion cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- El detector de inyeccion propio de RCGov es, segun el propio autor, estrecho; el guardia de nivel de pipeline se presenta como defensa en profundidad y no como una defensa robusta contra inyeccion de prompt.
- El modelo no hace questioning reflexivo: los turnos infraespecificados se difieren con un mensaje fijo en lugar de generar preguntas de aclaracion, que el autor delega en un bucle externo (INFINITY).
- Riesgo de alucinacion del LM subyacente: la capa de gobernanza controla que se responde y que se lee, no verifica la veracidad de la respuesta generada. Las metricas de "0/12 fabricaciones" corresponden a sondas propias del autor, no a una evaluacion independiente.
- No hay informacion sobre sesgos, composicion del dataset de entrenamiento ni evaluaciones de robustez; al reutilizar pesos de Gemma-2 9B IT, hereda los sesgos y limitaciones de ese modelo.
- Idiomas soportados no documentados; no se puede asumir cobertura multilingue mas alla de la del modelo base.
- Longitud de contexto no documentada.
- Licencia AGPL-3.0 con patentes pendientes sobre MMV y RCGov (MOBIUS LLC): el uso comercial en servicios en red exige cumplir las obligaciones de copyleft de la AGPL y evaluar el riesgo de patente, algo que conviene revisar con asesoria legal antes de desplegar en produccion.
- La discrepancia entre los tags (`image-text-to-text`, `gemma4_unified`) y el pipeline declarado (`text-generation`) no esta explicada; no debe asumirse capacidad multimodal.
- El nombre "Gemma-4" no corresponde a una arquitectura oficial de Google: los pesos derivan de `google/gemma-2-9b-it`.
- El numero de parametros reportado (11,96 B) es superior al del modelo base (9 B); no se documenta el motivo.
- Latencia elevada para uso interactivo (31-55 s por llamada en una RTX 5070 Ti).
- Adopcion muy baja (104 descargas, 0 likes) y sin evaluacion de terceros; conviene tratarlo como artefacto experimental.
- No hay datos de entrenamiento, evaluacion estandar ni garantias de reproducibilidad mas alla de las mediciones del autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/moebiusT7/gemma-4-12b-mobius-custom
- Variante C1 (GGUF q4_0, llama.cpp): https://huggingface.co/moebiusT7/gemma-4-12b-mobius-custom-c1
- Modelo base: https://huggingface.co/google/gemma-2-9b-it
- MOBIUS INFINITY (MMV, answer entitlement): https://github.com/mobius-style/infinity
- Mobius Reflective Context Governor (RCGov): https://github.com/mobius-style/rcgov
- Resultados de busqueda web: no se ha encontrado ningun resultado relevante sobre el modelo, sus autores o su documentacion tecnica; las busquedas devolvieron unicamente resultados no relacionados.
