# arcee-ai/Trinity-Large-Thinking

## Resumen

Trinity-Large-Thinking es la variante optimizada para razonamiento de la familia Trinity Large de Arcee AI. Se trata de un modelo de lenguaje de tipo Mixture-of-Experts (MoE) disperso con aproximadamente 398.000 millones de parametros totales y unos 13.000 millones de parametros activos por token, construido sobre Trinity-Large-Base y sometido a un post-entrenamiento orientado a cadenas de pensamiento extendidas y aprendizaje por refuerzo agentico.

El modelo genera trazas de razonamiento explicitas envueltas en bloques `` antes de emitir la respuesta final, y esta disenado de forma prioritaria para flujos de trabajo con herramientas, planificacion multi-paso y bucles agenticos. Su contexto extendido alcanza los 512.000 tokens tras la extension, lo que permite mantener cadenas de razonamiento largas a lo largo de muchos pasos de agente sin perder coherencia.

Es relevante ahora porque combina un rendimiento agentico de primer nivel (94,7% en Tau2-Telecom, 91,9% en PinchBench, 98,2% en LiveCodeBench segun la model card) con una licencia OpenMDW-1.1 y disponibilidad via OpenRouter, lo que lo posiciona como alternativa abierta a modelos propietarios de razonamiento en escenarios de agentes y tool calling.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sparse MoE (AfmoeForCausalLM) |
| Parametros totales | ~398.635.286.016 (~398B) |
| Parametros activos | ~13B por token |
| Longitud de contexto | 512k tras extension (8.192 en preentrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, es, fr, de, it, pt, ru, ar, hi, ko, zh |
| Licencia | openmdw-1.1 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Trinity-Large-Thinking emplea una arquitectura transformer de tipo Mixture-of-Experts disperso (AfmoeForCausalLM) con 256 expertos (uno de ellos compartido) y 4 expertos activos por token, lo que supone una estrategia de enrutamiento 4-de-256 con una dispersidad del 1,56%. La red incluye 6 capas densas. El modelo base se preentreno con 17 billones de tokens (Trinity-Large-Base, con anneals de mid-training); el checkpoint TrueBase corresponde a un preentrenamiento de 10 billones de tokens en fase pre-anneal. La longitud de contexto original de preentrenamiento es de 8.192 tokens, extendida posteriormente hasta 512k.

Sobre el modelo base se aplico un post-entrenamiento especifico para razonamiento: cadenas de pensamiento extendidas y aprendizaje por refuerzo orientado a tareas agenticas. El modelo genera trazas internas en bloques `<think>...</think>` que deben conservarse en el contexto en conversaciones multi-turno y bucles de agente; el chat template lee el campo `reasoning_content` y lo reenvuelve en las etiquetas correspondientes durante la tokenizacion. La model card no detalla la composicion exacta del dataset de post-entrenamiento ni los metodos de alineacion (RLHF/DPO) mas alla de la mencion al RL agentico.

## Capacidades

- Generacion de texto conversacional con trazas de razonamiento explicitas en bloques `<think>...</think>`.
- Razonamiento extendido (chain-of-thought) integrado de forma nativa.
- Tool calling y function calling, con soporte de estructuras de llamadas a herramientas en la respuesta.
- Diseno agentico: planificacion multi-paso y bucles de agente con preservacion de razonamiento entre pasos.
- Compatibilidad con frameworks de agentes como OpenClaw y Hermes Agent.
- Razonamiento matematico (AIME25: 96,3).
- Capacidades de codigo y resolucion de problemas de ingenieria de software (LiveCodeBench: 98,2; SWE-bench Verified: 63,2).
- Soporte multilingue en 11 idiomas: ingles, espanol, frances, aleman, italiano, portugues, ruso, arabe, hindi, coreano y chino.
- Modo thinking con separacion de `reasoning_content` y `content` en la API servida con vLLM.

## Casos de uso

- Agentes de atencion al cliente con tool calling: el modelo puede encadenar busquedas, consultas a APIs y respuestas finales conservando el razonamiento entre pasos, gracias a su contexto de 512k tokens y a su rendimiento en Tau2-Airline (88,0) y Tau2-Telecom (94,7).
- Automatizacion de flujos de reservas y operaciones: integrado como backbone de un agente (OpenClaw, Hermes Agent o propio), gestiona llamadas a funciones como `search_flights` con argumentos estructurados y filtros (por ejemplo, precio maximo), tal como muestra el ejemplo de la model card.
- Generacion y revision de codigo en pipelines de CI/CD: con LiveCodeBench de 98,2 y SWE-bench Verified de 63,2, es adecuado para tareas de resolucion de issues y generacion de parches en repositorios, siempre que se gestione el contexto de razonamiento.
- Asistentes de investigacion y analisis multi-paso: la ventana de 512k permite mantener documentos largos y cadenas de razonamiento prolongadas en tareas de sintesis y verificacion.
- Razonamiento matematico y cientifico asistido: AIME25 de 96,3 y GPQA-Diamond de 76,3 lo hacen util para tutoria y resolucion de problemas complejos con traza explicita.
- Despliegue multilingue en produccion: cubre 11 idiomas, lo que permite atender mercados en espanol, frances, aleman, portugues, arabe, hindi, coreano y chino con un unico modelo.
- Evaluacion de agentes y benchmarking interno: sirve como referencia abierta para comparar pipelines agenticos frente a modelos propietarios mediante OpenRouter.

## Benchmarks y rendimiento

| Benchmark | Trinity-Large-Thinking | Opus-4.6 | GLM-5 | MiniMax-M2.7 | Kimi-K2.5 |
|---|---:|---:|---:|---:|---:|
| IFBench | 52,3 | 53,1 | 72,3 | **75,7** | 70,2 |
| GPQA-Diamond | 76,3 | **89,2** | 81,6 | 86,2 | 86,9 |
| Tau2-Airline | **88,0** | 82,0 | 80,5 | 80,0 | 80,0 |
| Tau2-Telecom | 94,7 | 92,1 | **98,2** | 84,8 | 95,9 |
| PinchBench | 91,9 | **93,3** | 86,4 | 89,8 | 84,8 |
| AIME25 | 96,3 | **99,8** | 93,3 | 80,0 | 96,3 |
| BCFLv4 | 70,1 | **77,0** | 70,8 | 70,6 | 68,3 |
| MMLU-Pro | 83,4 | **89,1** | 85,8 | 80,8 | 87,1 |
| SWE-bench Verified* | 63,2 | **75,6** | 72,8 | 75,4 | 70,8 |

\* Todos los modelos evaluados en mini-swe-agent-v2.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con ~398B parametros totales y ~13B activos, la huella de pesos en precision completa es muy elevada (el repositorio ocupa 797,3 GB), por lo que se requiere cuantizacion y/o paralelismo multi-GPU.
- GPU recomendadas: no disponible en la model card; por el tamano, se orienta a despliegues multi-GPU de clase datacenter (A100, H100) con paralelismo tensorial.
- Encaje en GPU consumer: no disponible; el tamano total hace inviable un despliegue monolitico en GPU consumer sin cuantizacion agresiva y offloading, dato no confirmado por el autor.
- Opciones de despliegue: transformers (libreria declarada), vLLM (la model card documenta el campo `reasoning_content` en la respuesta servida con vLLM), OpenRouter (API sin configuracion) y chat.arcee.ai para pruebas.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento destacado |
|---|---|---|---|---|---|
| Trinity-Large-Thinking | ~398B totales / ~13B activos (MoE) | 512k | openmdw-1.1 | Hugging Face, OpenRouter | Tau2-Telecom 94,7; PinchBench 91,9; LiveCodeBench 98,2 |
| GLM-5 | no disponible | no disponible | no disponible | no disponible | IFBench 72,3; Tau2-Telecom 98,2; GPQA-Diamond 81,6 |
| MiniMax-M2.7 | no disponible | no disponible | no disponible | no disponible | IFBench 75,7; GPQA-Diamond 86,2; SWE-bench 75,4 |
| Kimi-K2.5 | no disponible | no disponible | no disponible | no disponible | GPQA-Diamond 86,9; Tau2-Telecom 95,9; MMLU-Pro 87,1 |
| Opus-4.6 (referencia propietaria) | no disponible | no disponible | propietaria | API | GPQA-Diamond 89,2; AIME25 99,8; SWE-bench 75,6 |

Los datos de parametros, contexto y licencia de los modelos comparados no se detallan en la informacion disponible; solo se dispone de sus resultados de benchmark segun la model card.

## Limitaciones y advertencias

- Riesgo de alucinacion: no se documenta una evaluacion especifica de factualidad; como modelo generativo, mantiene riesgo de fabricar datos, especialmente en tareas sin tool calling.
- Dependencia del razonamiento en contexto: si se eliminan los tokens de `<think>...</think>` del historial, el rendimiento en multi-turno y en bucles agenticos se degrada; la model card advierte explicitamente de no truncar el razonamiento en turnos recientes.
- Gestion de contexto: con 512k tokens, el coste de atencion y memoria es elevado; si hay que truncar, se recomienda eliminar turnos antiguos completos en lugar de recortar el razonamiento.
- Licencia OpenMDW-1.1: es una licencia "other" con nombre especifico; deben revisarse los terminos del archivo LICENSE antes de uso comercial, ya que la model card no detalla restricciones adicionales.
- Idiomas: aunque declara 11 idiomas, no se aportan metricas de rendimiento por idioma; el rendimiento fuera del ingles puede ser desigual.
- Benchmarks limitados: no se publican resultados de MMLU general, HumanEval clasico ni evaluaciones de seguridad/toxicity en la informacion disponible.
- Despliegue: el tamano del repositorio (797,3 GB) y la falta de datos de cuantizacion publicados complican la puesta en produccion sin infraestructura multi-GPU.
- Sesgos: no se documentan analisis de sesgo en la model card.

## Enlaces

- Hugging Face: https://huggingface.co/arcee-ai/Trinity-Large-Thinking
- Modelo base: https://huggingface.co/arcee-ai/Trinity-Large-Base
- Variante Preview: https://huggingface.co/arcee-ai/Trinity-Large-Preview
- Variante TrueBase: https://huggingface.co/arcee-ai/Trinity-Large-TrueBase
- Informe tecnico (arXiv): https://arxiv.org/abs/2602.17004
- Demo de chat: http://chat.arcee.ai/
- OpenRouter: https://openrouter.ai/
- OpenClaw: https://github.com/openclaw
- Hermes Agent: https://github.com/NousResearch/hermes-agent
- Graficas de benchmarks: https://huggingface.co/arcee-ai/Trinity-Large-Thinking/resolve/main/All_charts.jpg
