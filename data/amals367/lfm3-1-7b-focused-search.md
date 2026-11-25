# AmaLS367/LFM3-1.7B-Focused-Search

## Resumen
LFM3-1.7B-Focused-Search es un ajuste fino (fine-tuning) del modelo base LiquidAI/LFM3-1.7B, desarrollado por el usuario AmaLS367 y publicado en Hugging Face. El modelo se presenta como un "agente de busqueda pequeno que deja de buscar cuando ha encontrado la respuesta". El problema que aborda es concreto: el modelo base LFM3-1.7B, cuando actua como agente de busqueda web, tiende a seguir consultando el motor de busqueda mucho mas de lo necesario una vez que la evidencia ya esta sobre la mesa. Este ajuste, entrenado con DPO (Direct Preference Optimization) y mediante LoRA sobre el modelo base, busca reducir ese numero de busquedas redundantes sin sacrificar la precision.

Arquitectura y tamano: el modelo conserva la arquitectura del LFM3 de LiquidAI (familia "Liquid", con codigo personalizado, segun las etiquetas del repositorio) y 1.728.801.536 parametros totales (aproximadamente 1,7 mil millones), con pesos en safetensors y un peso total del repositorio de 3,5 GB. El modelo esta orientado a ingles y a generacion de texto conversacional con uso de herramientas.

La relevancia del proyecto es doble: por un lado, es un experimento de eficiencia en agentes de busqueda de pequeno tamano, comparado explicitamente con Claude Haiku 5.5; por otro, documenta de forma inusualmente transparente sus debilidades (incluida una auditoria posterior al lanzamiento que detecto pares de entrenamiento problematicos). Es una version "intermediate" (v1) y el autor anuncia una siguiente version con pares verificados.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | LFM3 de LiquidAI (familia "Liquid", transformer con codigo personalizado; detalles internos no disponibles) |
| Parametros totales | 1.728.801.536 (aprox. 1,7 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32k tokens en la configuracion de evaluacion (llama-server con 32k de contexto); contexto maximo del modelo base no disponible |
| Tipos de cuantizacion | GGUF disponible en repositorio separado (AmaLS367/LFM3-1.7B-Focused-Search-GGUF); niveles concretos de cuantizacion no disponibles |
| Idiomas soportados | ingles (en) |
| Licencia | lfm1.0 (license: other, license_name: lfm1.0) |
| Formato de pesos | safetensors (transformers); GGUF en repositorio aparte |

## Arquitectura y entrenamiento
El modelo parte de LiquidAI/LFM3-1.7B, un modelo de la familia LFM3 de LiquidAI. Segun las etiquetas del repositorio, se trata de un modelo con `custom_code` y la etiqueta `liquid`, lo que indica que requiere codigo personalizado para cargarse en transformers. El ajuste se realizo mediante LoRA (etiqueta `lora`) y DPO (etiqueta `dpo`), con el objetivo de que el modelo responda en cuanto la evidencia aparezca en pantalla, en lugar de seguir encadenando busquedas.

El entrenamiento se orienta a un unico escenario: preguntas factoides en ingles resueltas con una herramienta `web_search` (BM25 sobre el volcado de Wikipedia de DPR, 21 millones de pasajes, devolviendo los 5 mejores pasajes por consulta). La evaluacion se hizo con 504 preguntas de 7 benchmarks de QA (NQ, TriviaQA, PopQA, Bamboogle como splits de test; HotpotQA, 2WikiMultihopQA y MuSiQue como splits de dev), 72 preguntas por split con semilla fija 0, y un harness agnostico al modelo (Claude Code 2.1.325 en modo headless). Los modelos LFM se sirvieron con llama.cpp b12000 (`llama-server --jinja`, API de mensajes de Anthropic, temperatura 0,6, top_p 0,95, contexto 32k). La precision fue evaluada por un juez LLM (Gemini 3.8 Flash via agy CLI). No se dispone de datos sobre el numero total de tokens de entrenamiento ni sobre la composicion exacta del dataset de DPO.

## Capacidades
- Generacion de texto conversacional en ingles, con soporte de formato de mensajes (chat).
- Uso de herramientas (tool use): el modelo esta entrenado para invocar una herramienta de busqueda web (`web_search`) y para decidir cuando detenerse.
- Comportamiento de agente de busqueda: encadena consultas, lee los pasajes devueltos y emite una respuesta final en el formato `Answer: <short answer>`.
- Razonamiento multi-paso limitado al bucle de busqueda (formular consulta, leer resultados, decidir si continuar o responder).
- No se documentan capacidades de vision, audio, codigo ni matematicas especificas mas alla de las del modelo base.
- No se documenta un modo "thinking" explicito.
- Capacidad multilingue no disponible: solo se declara ingles.

## Casos de uso
- Agente de busqueda web para preguntas factoides: el modelo esta entrenado para responder en cuanto la evidencia aparece en los resultados, reduciendo el numero medio de busquedas de 8,49 a 6,58 (mediana de 9 a 4) frente al modelo base. Adecuado para pipelines de QA sobre Wikipedia con BM25.
- Reduccion de coste en pipelines RAG con busqueda iterativa: al necesitar menos consultas por pregunta, baja el coste de llamadas al motor de busqueda y la latencia total en flujos donde cada busqueda tiene un coste.
- Prototipado de agentes de investigacion en local: con 1,7 B de parametros y version GGUF, puede desplegarse en hardware modesto para experimentar con bucles de busqueda antes de pasar a modelos mayores.
- Evaluacion comparativa de eficiencia de agentes: sirve como referencia de "cuantas busquedas necesita un modelo pequeno" frente a modelos como Claude Haiku 5.5, en el mismo harness (Claude Code headless).
- Generacion de respuestas cortas y verificables: el formato de salida `Answer: <short answer>` facilita la integracion en sistemas que necesitan respuestas concisas y evaluables por comparacion de cadenas.
- Sustitucion de modelos mayores en tareas de QA factoid en ingles con presupuesto de computo limitado, aceptando una precision inferior (0,629 frente a 0,665 de Haiku 5.5 en la evaluacion del autor).
- No es adecuado, segun la propia model card, para escenarios fuera del ingles o fuera de busqueda BM25 sobre Wikipedia sin revalidacion.

## Benchmarks y rendimiento
Evaluacion del autor: 504 preguntas (72 por split) de NQ, TriviaQA, PopQA, Bamboogle, HotpotQA, 2WikiMultihopQA y MuSiQue (FlashRAG_datasets), harness Claude Code 2.1.325 headless, herramienta `web_search` BM25 sobre Wikipedia DPR, limite de 12 llamadas, juez LLM Gemini 3.8 Flash.

| Metrica | LFM3-1.7B (base) | Este modelo | Claude Haiku 5.5 |
|---|---:|---:|---:|
| Precision (juez LLM) | 0,621 | 0,629 | 0,665 |
| Busquedas por pregunta, media | 8,49 | 6,58 | 2,15 |
| Busquedas por pregunta, mediana | 9 | 4 | 2 |
| Ejecuciones que agotan el limite de 12 busquedas | 45% | 33% | 0,6% |
| Preguntas donde la respuesta aparece en los resultados | 77% | 74% | 55% |
| Se detiene justo en la primera busqueda que encontro la respuesta | 18% | 39% | 64% |
| Busquedas despues de haber encontrado la respuesta | 5,28 | 3,27 | 0,74 |

Notas del autor: la diferencia de precision frente al base es +0,8 pp, con IC 95% [−2,0, +3,6] (bootstrap emparejado), dentro del ruido. En las ejecuciones que terminan antes del limite, este modelo necesita 3,3 busquedas por pregunta frente a 2,1 de Haiku 5.5 (excluye el tercio mas dificil de preguntas). Con coincidencia por palabra completa y exclusion de casos espurios, las cifras de "respuesta encontrada" pasan a 0,67 / 0,64 / 0,46 y las de "se detiene en el primer acierto" a 20% / 41% / 70%; las conclusiones no cambian.

## Requisitos de hardware
- VRAM estimada: no disponible de forma explicita. Con 1,728.801.536 parametros, en fp16 serian aproximadamente 3,4 GB de pesos; en cuantizaciones GGUF de 8 bits o 4 bits el requisito baja considerablemente, pero no se publican cifras oficiales.
- GPU recomendadas: no disponible. El autor no publica recomendaciones de GPU.
- Cabe en GPU de consumo: probable por tamano (1,7 B), pero no confirmado en la informacion disponible.
- Opciones de despliegue: llama.cpp (b12000, `llama-server --jinja`, API de mensajes de Anthropic) es el backend usado en la evaluacion; transformers con `custom_code` para los pesos safetensors; version GGUF publicada en repositorio separado. vLLM, Ollama y TGI no se mencionan.
- Latencia y throughput: no disponibles. La evaluacion reporta busquedas por pregunta, no latencia.

## Comparativa con modelos similares
| Modelo | Parametros | Contexto | Precision (misma eval.) | Busquedas/pregunta (media) | Licencia | Disponibilidad |
|---|---|---|---:|---:|---|---|
| LFM3-1.7B-Focused-Search | 1,7 B | 32k en eval. | 0,629 | 6,58 | lfm1.0 | Hugging Face + GGUF |
| LFM3-1.7B (base) | 1,7 B | no disponible | 0,621 | 8,49 | no disponible | Hugging Face (LiquidAI) |
| Claude Haiku 5.5 | no disponible | no disponible | 0,665 | 2,15 | propietaria | API de Anthropic |

La comparacion con Haiku 5.5 es la que establece el propio autor; no se dispone de comparaciones con otros modelos pequenos de busqueda (por ejemplo, variantes de Search-R1) en la informacion proporcionada.

## Limitaciones y advertencias
- Un 33% de las ejecuciones sigue agotando las 12 busquedas; el modelo no siempre detecta que ya tiene la respuesta.
- El modelo tambien se detiene antes cuando la respuesta no se ha encontrado: de 11,1 a 9,0 busquedas en esas preguntas, y la proporcion de preguntas con la respuesta en los resultados baja de 0,766 a 0,744.
- La precision no mejora: Haiku 5.5 sigue siendo +4,4 pp mas preciso frente al mismo base.
- Auditoria posterior al lanzamiento (2026-11-19) sobre 183 pares "post-hit": 140 (76,5%) confirmados, 32 con la cadena de respuesta solo en contexto no relacionado y 11 sin pasaje con la respuesta completa. Como el verificador pierde cerca de un tercio de la evidencia real, se estima que un 11-16% de los pares ensenaron al modelo a responder desde su propio conocimiento tras una busqueda que no contenia la respuesta. La proxima version usara solo pares verificados.
- La metrica "respuesta encontrada" es una coincidencia de cadenas simple y sobrecuenta (alias cortos dentro de otras palabras, respuestas ya presentes en la pregunta, busquedas posteriores al limite de 12 llamadas). El autor publica las cifras corregidas.
- Evaluado solo con una herramienta BM25 sobre Wikipedia y preguntas factoides en ingles; el comportamiento fuera de ese escenario no esta validado.
- Riesgo de alucinacion: el propio autor documenta que parte de los pares de entrenamiento pudieron reforzar respuestas sin evidencia; en produccion conviene verificar las respuestas contra los pasajes recuperados.
- Sesgos: no se documentan sesgos especificos; al entrenar sobre Wikipedia en ingles, hereda los sesgos y la cobertura de esa fuente.
- Licencia lfm1.0 (license: other): es necesario revisar el texto de la licencia (enlace LICENSE del repositorio) antes de uso comercial; no se detallan aqui las restricciones.
- Es una version "intermediate" (v1) con debilidades reconocidas; no debe tratarse como un modelo de produccion estable.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/AmaLS367/LFM3-1.7B-Focused-Search
- Version GGUF: https://huggingface.co/AmaLS367/LFM3-1.7B-Focused-Search-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Licencia: LICENSE (referenciada en la model card del repositorio)
- Dataset de evaluacion: https://huggingface.co/datasets/RUC-NLPIR/FlashRAG_datasets
- Harness de evaluacion: https://github.com/anthropics/claude-code
- llama.cpp (backend de inferencia usado): no disponible en la informacion proporcionada (se cita llama.cpp b12000 sin enlace)
- No se proporcionan enlaces a papers, blogs o demos adicionales en la informacion disponible.
