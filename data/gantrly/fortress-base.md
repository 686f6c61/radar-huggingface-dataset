# gantrly/fortress-base

## Resumen

Fortress-Base v1 es un clasificador de seguridad para LLM desarrollado por gantrly, afinado a partir de `microsoft/deberta-v3-base`. Su funcion es detectar en una sola pasada dos tipos de riesgo: inyeccion de prompt (directa o inyectada en documentos, correos y salidas de herramientas) y peticiones de contenido danino. Es el hermano mayor de Fortress-XS, con el que comparte filosofia de diseno pero al que supera en deteccion de ataques ocultos en texto no conversacional.

El modelo se distribuye como ONNX cuantizado a INT8 (308 MB) y esta pensado para ejecutarse en CPU sin dependencia de torch, lo que lo hace adecuado como capa de guardarrail en pipelines de inferencia. Forma parte del proyecto Mobius Guard, un cortafuegos de LLM de codigo abierto, aunque puede usarse de forma autonoma.

Su relevancia actual radica en el auge de agentes que leen correo, documentos y respuestas de herramientas: los ataques de inyeccion indirecta son un vector real y los clasificadores conversacionales genericos los detectan mal. Fortress-Base incorpora marcas de rol (usuario frente a herramienta) y umbrales por rol, lo que reduce falsos positivos sobre mensajes legitimos de desarrolladores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DeBERTa-v3-base, finetune) |
| Parametros totales | 184.423.682 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (evaluado a 128 y 512 tokens) |
| Tipos de cuantizacion | INT8 ONNX (distribucion principal); safetensors en el repo |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (INT8), safetensors |

## Arquitectura y entrenamiento

Fortress-Base es un ajuste fino de `microsoft/deberta-v3-base`, un encoder transformer con atencion desenredada (disentangled attention) y embeddings de posicion relativos. El modelo produce dos cabeceras de clasificacion sobre una unica pasada: `attack` (inyeccion de prompt o jailbreak, directo u oculto en documentos, correos o salidas de herramientas) y `harmful` (peticion de contenido danino). Cada texto se procesa acompanado de una marca de rol (usuario o herramienta) al frente, y cada rol dispone de su propio umbral de decision, de modo que un documento no puede hacerse pasar por un turno del usuario.

El entrenamiento combina un corpus amplio de conjuntos de datos de seguridad y de conversacion, entre ellos HackAPrompt, Lakera MOSSCAP, Gandalf, CTF SATML24, WildJailbreak, Salad-Data, JBB-Behaviors, WildChat-1M y 4.8M, Browsesafe++, Nemotron RL Agentic Indirect Prompt Injection, tool-response-injections, Aegis AI Content Safety 2.0, PHTest, CoCoNot, Glaive Function Calling v2, Hermes Function Calling v1, ToolACE, When2Call, Toucan-1.5M, Magicoder, self-oss-instruct, CodeFeedback, OpenCodeInstruct y ultrachat_200k. El autor declara que solo se emplearon fuentes cuya licencia lo permite. No se detalla en la informacion disponible el numero de tokens, la composicion exacta ni si hubo RLHF o DPO; los datos de evaluacion publicados corresponden a mitades de test reservadas, puntuadas una sola vez tras la seleccion del modelo.

## Capacidades

- Clasificacion binaria de inyeccion de prompt y jailbreak, tanto directa como indirecta (inyectada en documentos, correos o salidas de herramientas).
- Clasificacion binaria de peticiones de contenido danino en la misma pasada.
- Conciencia de rol: distingue texto de usuario de texto de herramienta y aplica umbrales independientes.
- Deteccion de ataques ofuscados: base64, letras espaciadas, leetspeak, caracteres invisibles y letras homografas.
- Ejecucion en CPU sin torch, con pesos ONNX INT8 y latencias declaradas de 104 ms a 128 tokens y 525 ms a 512 tokens en 4 hilos.
- Integracion como opt-in en Mobius Guard y uso autonomo como clasificador de texto.
- No soporta generacion de texto, tool calling, vision, audio ni razonamiento multi-paso: es exclusivamente un clasificador.

## Casos de uso

- Cortafuegos de entrada en asistentes conversacionales: clasificar cada mensaje del usuario antes de enviarlo al LLM principal, bloqueando jailbreaks directos (100% de deteccion en Gandalf segun la model card) con un coste de unos 100 ms por mensaje en CPU.
- Proteccion frente a inyeccion indirecta en agentes que leen documentos: aplicar el modelo a cada fragmento recuperado en un pipeline RAG antes de insertarlo en el contexto, donde alcanza un 70.5% de deteccion en BIPIA frente al 12.9% de Fortress-XS.
- Filtrado de correo en agentes de bandeja de entrada: clasificar el cuerpo de los correos con marca de rol "herramienta" para detectar instrucciones maliciosas embebidas; en LLMail-Inject detecta el 68.5% de las inyecciones adaptativas.
- Moderacion de solicitudes daninas en plataformas de chat: usar la cabecera `harmful` para bloquear peticiones de contenido peligroso antes de que lleguen al modelo generativo, con umbral calibrado al 1% de falsos positivos sobre mensajes ordinarios.
- Guardarrail en herramientas de desarrollo asistido: filtrar mensajes reales de desarrolladores con solo un 6.0% de bloqueos erroneos (frente al 10.6% de Fortress-XS), lo que lo hace viable en entornos tecnicos donde el texto se parece a ataques.
- Normalizacion y deteccion de texto ofuscado: detectar ataques con caracteres invisibles (77.1%) o letras homografas (75.3%) sin penalizar texto legitimo con espaciado o leetspeak (3.4% y 3.0% de bloqueos erroneos).
- Clasificacion de salidas de herramientas en agentes multi-paso: revisar la respuesta de APIs y funciones antes de realimentarla al modelo, cubriendo el vector de tool-response injection.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre mitades de test reservadas, con umbral fijado al 1% de falsos positivos por rol. Intervalos al 95% remuestreados por cluster de textos casi duplicados.

| Familia de ataque (n) | Fortress-XS | Fortress-Base |
|---|---:|---:|
| LLMail-Inject, inyecciones en correos, adaptativas (10.613) | 47.4 (42.4-52.4) | 68.5 (64.8-71.8) |
| LLMail-Inject, muestra del suite (1.656) | 41.6 (35.1-47.9) | 67.6 (62.6-72.2) |
| BIPIA, inyecciones dentro de documentos (6.273) | 12.9 (8.0-18.0) | 70.5 (62.1-78.1) |
| BIPIA, suite (59) | 16.9 (9.5-28.5) | 42.4 (30.6-55.1) |
| Gandalf, inyeccion directa (482) | 99.6 | 100.0 |
| deepset (135) | 40.0 | 51.1 |
| jackhhao jailbreaks (309) | 86.4 | 88.3 |
| SPML, chatbots con system prompt (6.265) | 34.1 | 39.5 |
| Ofuscado: base64 (494) | 100.0 | 100.0 |
| Ofuscado: letras espaciadas (494) | 99.6 | 77.3 |
| Ofuscado: leetspeak (494) | 92.1 | 77.7 |
| Ofuscado: caracteres invisibles (494) | 69.2 | 77.1 |
| Ofuscado: letras homografas (494) | 66.6 | 75.3 |

Texto inofensivo bloqueado (%):

| Conjunto inofensivo (n) | Fortress-XS | Fortress-Base |
|---|---:|---:|
| Mensajes ordinarios, oasst1 test (7.975) | 1.0 | 0.9 |
| Mensajes reales de desarrolladores, WildChat (2.301) | 10.6 | 6.0 |
| Salidas de herramientas inofensivas, reservadas (299) | 2.0 | 3.0 |
| Documentos BIPIA limpios (95) | 4.2 | 0.0 |
| Correos inofensivos LLMail-Inject (81) | 0.0 | 0.0 |
| NotInject: texto inofensivo con palabras gatillo (171) | 6.4 | 8.2 |
| Texto inofensivo espaciado (493) | 93.3 | 3.4 |
| Texto inofensivo en leetspeak (493) | 74.6 | 3.0 |
| Texto inofensivo con caracteres invisibles (493) | 13.6 | 3.0 (dato truncado en la fuente) |

## Requisitos de hardware

- Inferencia en CPU: modelo ONNX INT8 de 308 MB; 104 ms a 128 tokens y 525 ms a 512 tokens con 4 hilos (2.9x el coste de Fortress-XS).
- No requiere GPU ni torch; puede ejecutarse en cualquier maquina con ONNX Runtime.
- VRAM estimada en GPU: no disponible; por tamano (184 M de parametros, INT8) cabria holgadamente en cualquier GPU consumer, pero no se publican cifras.
- Despliegue: ONNX Runtime como via principal; integracion nativa en Mobius Guard; el tag `text-embeddings-inference` y `endpoints_compatible` sugiere compatibilidad con TEI y endpoints gestionados, aunque no se detalla configuracion.
- Throughput: no disponible mas alla de las latencias por peticion citadas.

## Comparativa con modelos similares

| Modelo | Base | Parametros | Contexto | Deteccion BIPIA | Deteccion LLMail | Falsos positivos devs | Licencia |
|---|---|---:|---|---:|---:|---:|---|
| Fortress-Base v1 | DeBERTa-v3-base | 184 M | no disponible | 70.5% | 68.5% | 6.0% | Apache-2.0 |
| Fortress-XS v1 | DeBERTa-v3-xsmall | no disponible (81 MB INT8) | no disponible | 12.9% | 47.4% | 10.6% | Apache-2.0 |

No se dispone en la informacion proporcionada de datos de otros clasificadores de inyeccion de prompt comparables (por ejemplo, modelos de guardarrail de terceros) medidos sobre los mismos conjuntos, por lo que la comparativa se limita a las dos variantes de la familia Fortress.

## Limitaciones y advertencias

- Solo ingles: el modelo declara `en` como unico idioma; el rendimiento en otros idiomas no esta caracterizado.
- Deteccion imperfecta: en el conjunto BIPIA completo detecta el 70.5%, lo que deja pasar cerca del 30% de inyecciones en documentos; no debe usarse como unico control de seguridad.
- Falsos positivos no nulos: bloquea el 6.0% de mensajes reales de desarrolladores y el 8.2% de textos inofensivos con palabras gatillo (NotInject).
- Peor rendimiento que Fortress-XS en ataques con letras espaciadas (77.3% frente a 99.6%) y leetspeak (77.7% frente a 92.1%), aunque con muchos menos falsos positivos en ese tipo de texto.
- Coste 2.9x superior a Fortress-XS en CPU; en escenarios de baja latencia o maquinas pequenas puede no ser adecuado.
- Riesgo de alucinacion no aplica (es un clasificador), pero si de clasificacion erronea en dominios no representados en el entrenamiento.
- Licencia Apache-2.0 permite uso comercial; el autor afirma que los datos de entrenamiento tienen licencias compatibles, aunque no se ofrece un desglose por fuente.
- Los numeros publicados provienen de una unica evaluacion sobre mitades de test reservadas; no hay validacion externa independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gantrly/fortress-base
- Modelo hermano Fortress-XS: https://huggingface.co/gantrly/fortress-xs
- Proyecto Mobius Guard: https://github.com/gantrly/mobius-guard
- Modelo base: https://huggingface.co/microsoft/deberta-v3-base
- Paper DeBERTa-v3: https://arxiv.org/abs/2111.09543
