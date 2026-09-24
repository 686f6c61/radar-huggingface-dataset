# Infin8-AI/laya

## Resumen

Laya es una familia de modelos de decisión de tipo «System 1», no autoregresivos, desarrollados por Infin8-AI (Infin8 Information Technologies) y publicados bajo licencia Apache 2.0. A diferencia de un LLM generativo, Laya no produce texto: recibe un estado (un texto, un correo, un ticket, una cadena JSON) y un conjunto de preguntas tipadas, y devuelve respuestas tipadas acompañadas de probabilidades calibradas, todo ello en una única pasada hacia delante. El repositorio `Infin8-AI/laya` contiene el checkpoint en inglés, construido sobre un encoder ModernBERT-large con 421.293.830 parámetros y 512 tokens de contexto.

La propuesta de valor es doble. Por un lado, la velocidad: la model card declara alrededor de 33 ms por decisión, y fuentes externas citan 21 ms, lo que lo sitúa en el rango de latencia de un clasificador, no de un generador. Por otro, la calibración: el modelo se entrena con aprendizaje por refuerzo contra reglas de puntuación estrictamente propias (RLCD, *reinforcement learning with calibrated decisions*), de forma que la única manera de maximizar la recompensa es reportar probabilidades honestas. Al no generar lenguaje, no hay salida que parsear ni texto que alucinar.

La familia incluye dos checkpoints adicionales alojados como subcarpetas: uno multilingüe sobre backbone mmBERT-base (322M parámetros, contexto de 1024 ampliable a 8k, más de 100 idiomas y aproximadamente 2,2 veces más rápido) y uno especializado en los cuatro flujos de trabajo de decisiones tipadas (ModernBERT-large, 421M, contexto 1024, 0,766 de accuracy declarada). El modelo se posiciona explícitamente como alternativa open source a TypeSafe Jev, una solución propietaria del mismo nicho, y su relevancia actual radica en cubrir clasificación, enrutado, puntuación de riesgo, guardrails y moderación con coste y latencia de un encoder, sin depender de APIs externas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder no autoregresivo; checkpoint raiz sobre ModernBERT-large, checkpoint multilingue sobre mmBERT-base |
| Parametros totales | 421.293.830 (checkpoint raiz, dato real de safetensors); 322M en el checkpoint multilingue |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens en el checkpoint raiz; 1024 tokens (ampliable hasta 8k) en el checkpoint multilingue y en el de decisiones tipadas |
| Tipos de cuantizacion | no disponible (pesos en bf16; existe exportacion a ONNX, sin cuantizaciones publicadas tipo GGUF/AWQ/GPTQ) |
| Idiomas soportados | mas de 100 idiomas segun la model card (la comparativa grafica cita 51 idiomas); metadatos de HuggingFace: no disponible |
| Licencia | apache-2.0 (uso comercial permitido) |
| Formato de pesos | safetensors (libreria transformers); exportacion ONNX disponible |
| Tamano del repositorio | 2,4 GB (incluye los tres checkpoints) |
| Pipeline declarado | text-classification |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-23 |

## Arquitectura y entrenamiento

Laya es un encoder transformer no autoregresivo. El checkpoint raiz parte de ModernBERT-large, con 421M de parametros y una ventana de 512 tokens, orientado a texto en ingles, guardrails y triaje de correo. El checkpoint multilingue sustituye el backbone por mmBERT-base (322M) y eleva el contexto a 1024 tokens, ampliable a 8k, con aproximadamente 2,2 veces mas velocidad. El tercer checkpoint vuelve a ModernBERT-large con contexto de 1024 y esta especializado en los cuatro flujos de decisiones tipadas. La interfaz no es de generacion libre: el consumidor define preguntas con un tipo (`choice`, `score`, y una variante de criterios que la model card denomina `nou`) y un diccionario o lista de criterios, y el modelo devuelve la etiqueta o la puntuacion junto con su probabilidad.

El entrenamiento se realiza con aprendizaje por refuerzo contra reglas de puntuacion estrictamente propias (RLCD). Este diseno hace que la funcion de recompensa solo se maximice reportando probabilidades bien calibradas, en lugar de maximizar la verosimilitud de una secuencia de texto. La model card no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases adicionales de ajuste supervisado. Tampoco se documentan innovaciones de decodificacion especulativa ni atencion lineal, dado que el modelo no decodifica.

La capa de software que acompana a los checkpoints (version 0.3.11) aporta elementos tecnicos relevantes: carga aproximadamente diez veces mas rapida al evitar la inicializacion aleatoria de pesos, puntuacion por lotes con `predict_batch`, lotes enrutados que agrupan peticiones por checkpoint y conjunto de preguntas, hooks de prediccion para auditar, trazar, redactar o cachear decisiones, una ruta rapida opcional en GPU con TileLang que coincide con el forward estandar en bf16 dentro del redondeo, soporte de `torch.compile`, ejecucion sobre ONNX Runtime, deteccion de idioma y de escritura en sub-milisegundos, y un `Router` que mantiene dos checkpoints residentes y despacha automaticamente al optimo.

## Capacidades

- Clasificacion de texto por eleccion cerrada entre criterios definidos por el usuario, con probabilidades calibradas por etiqueta.
- Puntuacion ordinal sobre escalas definidas en la pregunta (por ejemplo, urgencia de una peticion en tres niveles).
- Decisiones tipadas de cuatro flujos de trabajo especificos en el checkpoint `laya-typed-decisions`, con 0,766 de accuracy declarada.
- Enrutado de peticiones: el `Router` detecta idioma y escritura y despacha al checkpoint optimo en una sola pasada.
- Guardrails y moderacion: uso declarado en las etiquetas del modelo para filtrado previo y control de contenido.
- Soporte multilingue de mas de 100 idiomas en el checkpoint multilingue, incluido texto CJK con nombres de marca en alfabeto latino, portugues de Brasil y bengali y azerbaiyano romanizados.
- Procesamiento de estados heterogeneos: texto plano, correo electronico, ticket o JSON.
- Puntuacion por lotes de multiples estados y preguntas en pasadas compartidas.
- Hooks de prediccion para auditoria, trazabilidad, redaccion, cacheado o control de resultados.
- Integraciones de despliegue: servidor HTTP compatible con Jev autoalojado, CLI `laya`, servidor MCP opcional, paquetes para LangChain y LangGraph y paquete TypeScript `laya-ts` para Node y navegador.
- No soporta generacion de texto, tool calling ni razonamiento multi-paso con agentes: el modelo decide, no conversa.

## Casos de uso

- Triaje de tickets de soporte: con una pregunta de tipo `choice` sobre el departamento responsable (facturacion, tecnico, ventas, otros) y otra de tipo `score` sobre urgencia, el modelo clasifica cada ticket entrante en una sola pasada de decenas de milisegundos, lo que permite procesar colas de miles de tickets por minuto en una GPU de gama media.
- Enrutado previo a un LLM generativo: Laya decide si una peticion requiere un modelo grande, cual, y con que prioridad; al resolver la mayoria de casos triviales con un encoder de 421M se reduce el coste por token de la capa generativa.
- Guardrails y moderacion de contenido: clasificacion binaria o multietiqueta de entradas de usuario antes de pasarlas a un sistema generativo, con probabilidad calibrada que permite fijar un umbral de rechazo ajustable en produccion.
- Deteccion de riesgo de abandono en correos de cliente: el estado es el cuerpo del correo y las preguntas son un score de riesgo de churn y una eleccion de accion recomendada; el resultado alimenta un CRM o un sistema de alertas.
- Procesamiento de formularios y JSON en pipelines ETL: con estados en formato JSON estructurado, el modelo clasifica registros por tipo, validez o categoria sin necesidad de escribir reglas heuristicas ni prompts.
- Clasificacion de documentos y cumplimiento: etiquetado de comunicaciones internas o financieras por categoria regulatoria, con trazabilidad mediante hooks de prediccion que registran cada decision y su probabilidad asociada.
- Priorizacion de incidencias en operaciones: puntuacion de severidad sobre logs o alertas en texto para ordenar la cola de trabajo de un equipo de guardia.
- Soporte multilingue de atencion al cliente: con el checkpoint multilingue, clasificacion de correos en decenas de idiomas sin traducir previamente, manteniendo la coherencia de etiquetas entre idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible en el sentido habitual (no hay cifras de MMLU, HumanEval, GSM8K ni similares, y no proceden para un modelo que no genera texto). Los unicos datos numericos explicitos son los siguientes:

| Metrica | Valor | Fuente |
|---|---|---|
| Accuracy en los cuatro flujos de decisiones tipadas | 0,766 | Model card (checkpoint `laya-typed-decisions`) |
| Latencia por decision (forward unico) | ~33 ms | Model card |
| Latencia por decision | ~21 ms | Fuente externa (brainfunctioncollapse.com) |
| Mejora de velocidad del checkpoint multilingue frente al raiz | ~2,2x | Model card |
| Tiempo de carga en CPU (`laya.load()`) | ~22 s a ~2 s en la version 0.3.11 | Model card |
| Idiomas evaluados en la comparativa | 51 idiomas | Model card (grafica comparativa) |

La model card incluye una imagen comparativa frente a TypeSafe Jev con ejes de accuracy, flujos de trabajo, idiomas, velocidad, calibracion y coste de enrutado, pero los valores numericos no estan disponibles en el texto proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos del checkpoint raiz (421M parametros) ocupan aproximadamente 0,85 GB en bf16 y alrededor de 1,7 GB en fp32; el checkpoint multilingue (322M) baja a unos 0,65 GB en bf16. El repositorio completo ocupa 2,4 GB en disco.
- Cabe holgadamente en GPU de consumo: cualquier tarjeta con 4 GB o mas de VRAM es suficiente (RTX 3060, RTX 4060, RTX 4090, Apple Silicon con MPS). Tambien es viable en CPU, con el coste de latencia correspondiente.
- GPU recomendadas para produccion: para alto throughput con lotes grandes, A100, H100 o L40S; para despliegue de baja latencia en un solo nodo, RTX 4090 o L4. No se dispone de cifras de throughput por GPU.
- Latencia declarada: aproximadamente 33 ms por decision en el checkpoint raiz y 21 ms en la fuente externa; el checkpoint multilingue es unas 2,2 veces mas rapido. El enrutado con checkpoints precargados se situa por debajo de 35 ms.
- Opciones de despliegue: libreria `transformers` (safetensors), ONNX Runtime mediante `laya.onnx_agent.ONNXAgent`, `torch.compile` con `Agent(compile=True)`, ruta rapida en GPU con TileLang mediante `laya.load(..., fast=True)`, servidor HTTP autoalojado compatible con Jev (`laya-serve`), CLI `laya`, servidor MCP opcional y despliegue en Node o navegador con `laya-ts`.
- Integraciones de orquestacion: LangChain y LangGraph mediante el extra `laya[langchain]`.
- No se documenta soporte para vLLM, TensorRT-LLM, llama.cpp, Ollama ni TGI, coherente con un modelo encoder no autoregresivo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Laya (checkpoint raiz, este repositorio) | 421M (ModernBERT-large) | 512 | Ingles principal | apache-2.0 | Guardrails y triaje de correo |
| Laya multilingual (`convaiinnovations/laya-multilingual`) | 322M (mmBERT-base) | 1024, hasta 8k | 100+ | apache-2.0 | ~2,2x mas rapido que el raiz |
| Laya typed-decisions (`convaiinnovations/laya-typed-decisions`) | 421M (ModernBERT-large) | 1024 | no disponible | apache-2.0 | 0,766 de accuracy en cuatro flujos |
| TypeSafe Jev | no disponible | no disponible | no disponible | propietaria (no open source) | Alternativa comercial; Laya se posiciona explicitamente como su sustituto abierto |

No se dispone de especificaciones tecnicas detalladas de TypeSafe Jev en la informacion proporcionada, por lo que la comparacion se limita a la posicion declarada por el autor. Tampoco se dispone de datos de otros modelos comparables de la misma categoria en la informacion disponible.

## Limitaciones y advertencias

- No genera texto: cualquier caso de uso que requiera redaccion, resumen o dialogo abierto queda fuera de su alcance por diseno.
- No soporta tool calling, function calling ni razonamiento multi-paso con agentes.
- La ventana de contexto del checkpoint raiz es de solo 512 tokens, lo que obliga a truncar correos, hilos de conversacion o documentos largos; el truncado conserva el turno mas reciente en listas de conversacion.
- La model card no documenta la composicion del dataset de entrenamiento, el numero de tokens, los idiomas exactos cubiertos ni los posibles sesgos, por lo que la evaluacion de sesgo queda pendiente en cada despliegue.
- La calibracion esta garantizada por el diseno de la recompensa sobre la distribucion de entrenamiento, pero no se han publicado estudios de calibracion fuera de distribucion (dominios muy especializados, jerga tecnica, idiomas de bajos recursos).
- Riesgo de alucinacion: por construccion no inventa texto, pero puede asignar probabilidades excesivamente altas a etiquetas incorrectas cuando el estado de entrada es ambiguo o cae fuera del dominio de entrenamiento.
- El modelo no esta validado por la comunidad: el repositorio presenta 0 descargas y 0 likes en el momento de la consulta, y no hay evaluaciones independientes publicadas.
- Existe una discrepancia entre el identificador del repositorio consultado (`Infin8-AI/laya`) y los identificadores citados en la propia model card (`convaiinnovations/laya` y subcarpetas), lo que conviene verificar antes de integrar los checkpoints en produccion.
- Los metadatos de HuggingFace no declaran idiomas soportados, mientras que la model card afirma mas de 100 y la grafica comparativa menciona 51; la cifra exacta debe comprobarse con una evaluacion propia.
- Aunque la licencia apache-2.0 permite uso comercial sin restricciones, el autor no ofrece garantias ni soporte, y no se documentan condiciones adicionales de atribucion mas alla de las habituales de Apache 2.0.
- La fecha de creacion del repositorio (2026-09-23) y la version de la libreria (0.3.11) indican que se trata de un proyecto reciente y en evolucion; conviene fijar versiones en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Infin8-AI/laya
- Checkpoint multilingue: https://huggingface.co/convaiinnovations/laya-multilingual
- Checkpoint de decisiones tipadas: https://huggingface.co/convaiinnovations/laya-typed-decisions
- Sitio oficial del proyecto: https://laya.convaiinnovations.com/
- Articulo de presentacion: https://brainfunctioncollapse.com/laya
- Repositorio de codigo y assets: https://github.com/NandhaKishorM/laya
- Paquete TypeScript: https://github.com/NandhaKishorM/laya/tree/main/laya-ts
- Perfil del autor en HuggingFace: https://huggingface.co/Infin8-AI/models
- Sitio corporativo: https://aiinfin8.com/
