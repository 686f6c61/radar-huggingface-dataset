# JuneoAI/Laplace-1-Vector

## Resumen

Laplace-1-Vector es un modelo de lenguaje de 4.112 millones de parametros (4,1B) desarrollado por JuneoAI, presentado como el miembro "edge" de la familia Laplace-1 de modelos de decision causal-intervencional. Su proposito no es la generacion de texto generalista, sino emitir juicios operativos sobre acciones de agentes: dado un estado de la organizacion, una cadena de autoridad y un conjunto de acciones candidatas, el modelo devuelve una distribucion sobre esas candidatas que se traduce en tres veredictos (proceder, devolver a una persona o bloquear). Se distribuye con licencia Apache-2.0 y pesos completos en BF16.

El modelo se construye como un fine-tuning de XHToken/Spark-X2.6-4B y esta disenado para ejecutarse en hardware propio de la organizacion (on-premises o on-device), de modo que los datos no abandonan la infraestructura del cliente. Segun la model card, ocupa el primer puesto en 7 de 8 benchmarks de decision frente a modelos de Perplexity, IBM, Liquid AI, Together AI, TokenRhythm y Shanghai AI Lab, y supera a IBM Granite Switch 4.1 8B en los 8 benchmarks pese a tener la mitad de parametros.

La relevancia actual del modelo radica en su enfoque: en lugar de competir en capacidad generativa, ataca el problema de la supervision de agentes autonomos conectados por A2A y MCP, donde no existe un mecanismo estandar que anticipe las consecuencias de una accion antes de ejecutarla. La innovacion declarada es aprender la distribucion interventional p(s' | do(a), s, C) a partir de un dataset propio (Decision Forge), algo que los datos publicos observacionales no capturan.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (fine-tuning de XHToken/Spark-X2.6-4B); requiere `custom_code` |
| Parametros totales | 4.112.079.360 (4,1B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en BF16) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (BF16, repositorio de 8,2 GB) |

## Arquitectura y entrenamiento

Laplace-1-Vector es un transformer causal derivado por fine-tuning de XHToken/Spark-X2.6-4B. La model card no detalla la composicion del dataset de entrenamiento, el numero de tokens utilizados ni si se aplicaron tecnicas de RLHF o DPO; unicamente indica que el juicio del modelo proviene de "Decision Forge", un conjunto de datos propio del proyecto publicado en el repositorio de GitHub Juneo-Lab/decision-forge. El objetivo declarado del entrenamiento es modelar la distribucion interventional p(s' | do(a), s, C): el siguiente estado de una organizacion tras una accion candidata, condicionado a la cadena de autoridad del agente.

La innovacion tecnica principal no reside en el bloque transformer sino en la interfaz de inferencia: el modelo expone dos primitivas. La primera es el scoring de candidatas, que lee una distribucion sobre las opciones exactas proporcionadas directamente de los logits del siguiente token, en un unico forward pass, sin muestreo ni parseo posterior. La segunda es la prediccion de resultados, que genera la siguiente observacion dado un conjunto de reglas de entorno, contexto y accion. Esta lectura directa de logits es lo que permite calificar cada accion a bajo coste. No se documentan mecanismos adicionales como decodificacion especulativa, atencion lineal o arquitecturas hibridas.

## Capacidades

- Toma de decisiones sobre acciones de agentes: clasifica cada accion candidata como proceder, devolver a una persona o bloquear.
- Scoring de candidatas en un solo forward pass mediante lectura de logits, sin muestreo ni parsing.
- Prediccion de consecuencias: genera la siguiente observacion de un entorno dadas sus reglas, el contexto y una accion.
- Razonamiento causal-interventional orientado a prever el efecto de una accion sobre el estado de una organizacion.
- Seleccion de siguiente accion y enrutamiento entre opciones predefinidas.
- Decisiones de control de acceso y escalado (casos de uso citados en la evaluacion: OrgAccess, escalado).
- Integracion en flujos de agentes con A2A y MCP, segun la motivacion de la model card.
- Ejecucion on-premises y on-device.
- Capacidades multilingues: no disponibles.
- Vision, audio y modo thinking: no disponibles.

## Casos de uso

- Supervision de agentes autonomos en produccion: colocado delante de cada llamada a herramienta de un agente, el modelo recibe el estado actual, la cadena de autoridad y la accion propuesta, y devuelve un veredicto de proceder, escalar o bloquear. Es adecuado porque la decision cuesta un unico forward pass sobre un modelo de 4B, lo que permite aplicarla a todas las acciones y no solo a una muestra.
- Control de acceso y permisos (OrgAccess): dado un estado organizativo y una solicitud de acceso, el modelo puntua las opciones de conceder, denegar o escalar a un responsable. La evaluacion publicada incluye este escenario entre los benchmarks donde el modelo queda a menos de 0,5 puntos del Laplace-1-Atlas de 27B.
- Enrutamiento de solicitudes y escalado a humanos: uso de la primitiva de scoring de candidatas para decidir a que cola, equipo o persona derivar una peticion, con la opcion de "devolver a una persona" integrada como candidata explicita.
- Previsualizacion de consecuencias antes de ejecutar una accion: mediante la primitiva de prediccion de resultados, el sistema genera la siguiente observacion esperada del entorno y la muestra al operador o la usa como comprobacion previa a la ejecucion.
- Despliegue en entornos con requisitos de soberania del dato: al ejecutarse on-premises u on-device con pesos Apache-2.0 y sin acceso restringido, encaja en organizaciones que no pueden enviar estados internos a APIs de terceros.
- Guardrail en pipelines de agentes conectados por MCP: interceptar llamadas a herramientas y aplicar el juicio del modelo como capa de seguridad antes de que la llamada salga del sistema.
- Evaluacion de decisiones organizativas en simulacion: usar la prediccion de estados siguientes para comparar el impacto de varias acciones candidatas sobre el estado de la organizacion antes de comprometerse con una.

## Benchmarks y rendimiento

Resultados publicados en la model card. Los guiones indican que el modelo comparable no reporta resultado en esa prueba.

| Benchmark | Laplace-1-Vector (4B) | Decider Flash v1.2 (4B, Perplexity) | Tev1-4B (Together AI) | NeoHorse-Jev-4B (TokenRhythm) | d1-3B (Liquid AI) | Granite Switch 4.1 (8B, IBM) | Intern-Decision-4B (Shanghai AI Lab) |
|---|---|---|---|---|---|---|---|
| JevBench | 89,0 | 89,0 | 83,2 | 78,5 | 84,3 | 82,2 | 88,5 |
| JEVal | 68,2 | 75,0 | 54,6 | 55,2 | 64,6 | 65,9 | 58,0 |
| When2Call | 83,1 | 76,8 | 62,0 | 58,0 | 80,4 | 57,1 | 69,5 |
| AgentDecisionBench L2 common | 89,6 | 85,8 | — | 63,9 | 54,8 | 67,9 | — |
| AgentDecisionBench L2 shift | 88,1 | 85,6 | — | 68,8 | 56,2 | 62,0 | — |
| Coherence | 85,2 | 83,2 | 75,2 | — | 74,3 | 72,6 | — |

La model card afirma que el modelo queda primero en 7 de 8 benchmarks (contando empates) y que supera a Granite Switch 4.1 8B en los 8 benchmarks por un margen de 2,3 a 26,1 puntos. El unico benchmark de la tabla donde no lidera es JEVal, con 68,2 frente a los 75,0 de Decider Flash v1.2. No se publican resultados de benchmarks generalistas (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 8,2 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda reservar entre 10 y 12 GB.
- VRAM estimada en cuantizacion de 8 bits: en torno a 4,5-5 GB de pesos; en 4 bits, en torno a 2,5-3 GB. Estas cifras son estimaciones por tamano y no estan confirmadas por el autor, que no publica artefactos cuantizados.
- GPU de datacenter: A100, H100 y equivalentes sin problema; el modelo es pequeno para estos aceleradores y el cuello de botella sera la latencia de red, no el computo.
- GPU de consumo: cabe en RTX 4090 (24 GB) y RTX 3090 (24 GB) en BF16; en tarjetas de 8-12 GB requerira cuantizacion.
- Despliegue: la libreria declarada es transformers y el modelo requiere `custom_code`, por lo que hay que confiar en el codigo remoto del repositorio o auditarlo. No se confirma soporte de vLLM, llama.cpp, Ollama o TGI en la informacion disponible; dado que no se publican GGUF, llama.cpp y Ollama no estan disponibles de forma directa.
- Latencia y throughput: no disponibles. La model card solo afirma que una decision es un unico forward pass, sin cifras de latencia ni tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Resultado destacado |
|---|---|---|---|---|---|
| Laplace-1-Vector | 4,1B | No disponible | Decision causal-interventional, edge | Apache-2.0 | 89,6 en AgentDecisionBench L2 common |
| Laplace-1-Atlas | 27,4B | No disponible | Decision causal-interventional, flagship | No disponible en la informacion | Referencia de la familia; Vector queda a menos de 0,5 puntos en COMPASS, OrgAccess y Coherence |
| Decider Flash v1.2 (Perplexity) | 4B | No disponible | Decision | No disponible | 75,0 en JEVal, 85,8 en AgentDecisionBench L2 common |
| Granite Switch 4.1 (IBM) | 8B | No disponible | Decision | No disponible | 82,2 en JevBench; superado por Vector en los 8 benchmarks |
| d1-3B (Liquid AI) | 3B | No disponible | Decision | No disponible | 84,3 en JevBench, 54,8 en AgentDecisionBench L2 common |

## Limitaciones y advertencias

- Modelo especializado: no es un modelo de proposito general. Su uso previsto es el scoring de candidatas y la prediccion de consecuencias; emplearlo como generador de texto abierto no es su diseno y no hay evaluacion publicada en esa direccion.
- Sesgos: no se documenta ninguna evaluacion de sesgos, toxicidad o equidad en la informacion disponible.
- Alucinacion: la primitiva de prediccion de resultados genera la siguiente observacion, por lo que puede producir consecuencias plausibles pero incorrectas; en un guardrail de seguridad esto es critico y exige validacion externa.
- Contexto e idiomas: la longitud de contexto y los idiomas soportados no estan publicados, lo que impide planificar su uso en conversaciones largas o en espanol sin pruebas previas.
- Dependencia de `custom_code`: la carga requiere ejecutar codigo remoto del repositorio con `trust_remote_code`, lo que introduce un riesgo de cadena de suministro en produccion.
- Madurez: el repositorio tiene 0 descargas y 2 likes en el momento de la consulta, y los benchmarks son autoinformados por el autor sin verificacion independiente; los conjuntos de evaluacion (JevBench, AgentDecisionBench, When2Call) no son estandar de la industria.
- Licencia: Apache-2.0 permite uso comercial sin restricciones adicionales, pero no hay garantias ni indemnizacion por parte del autor.
- Ausencia de cuantizaciones oficiales: no se publican GGUF ni AWQ/GPTQ, de modo que el despliegue en hardware limitado exige generarlas y validar que no degradan el scoring de logits.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JuneoAI/Laplace-1-Vector
- Modelo flagship de la familia: https://huggingface.co/JuneoAI/Laplace-1-Atlas
- Dataset Decision Forge: https://github.com/Juneo-Lab/decision-forge
- Modelo base: https://huggingface.co/XHToken/Spark-X2.6-4B
- Contacto comercial: business@juneo.ai
