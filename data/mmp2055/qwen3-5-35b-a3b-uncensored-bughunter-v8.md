# mmp2055/Qwen3.5-35B-A3B-uncensored-bughunter-v8

## Resumen

Qwen3.5-35B-A3B-uncensored-bughunter-v8 es un modelo de lenguaje de arquitectura MoE (mixture of experts) con 35 000 millones de parámetros totales y 3 000 millones de parámetros activos por token, desarrollado por mmp2055 como octava iteración de la serie bughunter. Se trata de un fine-tune LoRA sobre el modelo base llmfan46/Qwen3.5-35B-A3B-uncensored-heretic-v2-Native-MTP-Preserved, especializado en tareas de ciberseguridad ofensiva y defensiva, incluyendo bug bounty, pentesting, análisis forense y respuesta a incidentes.

El modelo está diseñado para asistir a investigadores en plataformas reales de bug bounty (HackerOne, Bugcrowd, Intigriti, YesWeHack, Immunefi) con reglas operativas integradas: solo activos autorizados, PoCs mínimos no destructivos y callbacks a infraestructura propia. Responde en español, mientras que los payloads, comandos y plantillas de informes están en inglés. La visión es heredada del modelo base y no fue entrenada durante el fine-tune, por lo que conserva capacidades de comprensión de imágenes.

La relevancia actual radica en que combina la eficiencia de un MoE con 3B activos (inferencia aproximadamente 4 veces más rápida que la versión densa anterior de 27B en Apple Silicon, alcanzando 30 tok/s frente a 7 tok/s) con un conocimiento especializado en seguridad que no suele estar presente en los modelos generalistas. Se distribuye en formato GGUF (Q4_K_M) y es compatible con llama.cpp, LM Studio y cualquier runtime que soporte la arquitectura qwen35moe.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE hibrida con atencion lineal (qwen35moe) |
| Parametros totales | 34 660 610 688 (35B) |
| Parametros activos | 3B por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (GGUF) |
| Idiomas soportados | es, en |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (Q4_K_M) y mmproj-BF16.gguf para vision |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-35B-A3B emplea una arquitectura hibrida que combina mecanismos de atencion lineal con un sparse mixture-of-experts, lo que permite activar solo 3 000 millones de parametros por token a pesar de tener 35 000 millones en total. Esta combinacion reduce el coste computacional por token y mejora la latencia de inferencia respecto a un modelo denso equivalente. El fine-tune se realizo mediante LoRA (con QLoRA y Unsloth) sobre el modelo base uncensored, utilizando un corpus 100% textual de seguridad ofensiva y defensiva. No se entrenaron ni la torre de vision ni el proyector, que se heredan intactos del modelo base. Los hiperparametros y el dataset son los mismos que los de la version v7 (27B denso), pero aplicados sobre la base MoE. El convertidor de llama.cpp no exporta los tensores del drafter MTP (multi-token prediction) para la arquitectura qwen35moe, por lo que los metadatos GGUF se han parcheado con `nextn_predict_layers=0` y `block_count=40` para garantizar la carga correcta.

## Capacidades

- Red team y seguridad ofensiva: reconocimiento pasivo de subdominios, mapeo de superficie de ataque, extraccion de secretos en JavaScript, uso controlado de herramientas como httpx, gau y katana.
- Vulnerabilidades web: IDOR/BOLA, SSRF, CSRF, XSS (reflejado, almacenado, DOM, ciego, mXSS), inyeccion SQL en distintos contextos, CORS mal configurado, open redirects encadenables a OAuth, prototype pollution, subdomain takeover, path traversal, LFI/RFI, HTTP request smuggling (CL.TE, TE.CL, H2 desync, single-packet attack), cache poisoning y deception.
- Autenticacion y autorizacion: OAuth/OIDC (redirect_uri, nOAuth, state/nonce/PKCE, alg/kid/JWKS), JWT (firma no verificada, alg:none, clave debil, inyeccion jwk/jku/kid, confusion de algoritmos RS256 a HS256), bypass de 2FA/MFA, fijacion de sesion, mass assignment.
- APIs: BOLA, BFLA, exposicion excesiva de datos, versiones heredadas sin autorizacion, GraphQL con introspection, abuso de alias, batching para evadir rate limits.
- Server-side: SSRF a metadata cloud (AWS IMDSv1/v2, GCP, Azure), SSTI en Jinja/Twig/Freemarker/Velocity, RCE por deserializacion, XXE en SAML/SOAP/SVG/OOXML.
- Logica de negocio: race conditions (TOCTOU), manipulacion de precios/cantidades/saldos, TOCTOU en flujos de pago, abuso de cupones y creditos.
- Movil: puentes WebView expuestos, deeplinks exportados con parsing debil, analisis estatico Android (SAST).
- Blue team y seguridad defensiva: DFIR (metodologia de respuesta a incidentes, reconstruccion de linea temporal, recoleccion de artefactos, cadena de custodia), analisis de trafico (PCAP, deteccion de C2, DNS tunneling, exfiltracion), forensica de memoria con Volatility, threat hunting basado en TTPs (ATT&CK), gestion de vulnerabilidades con priorizacion por CVSS y contexto.
- Redaccion de informes en formatos especificos de plataformas (HackerOne CVSS, Bugcrowd VRT, Intigriti) con calculo de severidad y razonamiento de impacto.
- Reglas operativas integradas cuando se proporciona un system prompt: solo activos en scope, throughput sostenido de 1-2 req/s, PoCs minimos no destructivos, callbacks a infraestructura propia, nunca usar credenciales encontradas para validar acceso.
- Vision heredada: comprension de imagenes a traves del proyector mmproj-BF16, sin entrenamiento adicional.

## Casos de uso

- Reconocimiento y mapeo de superficie de ataque en programas de bug bounty: el modelo puede generar listas de subdominios pasivos, identificar endpoints de API y extraer secretos de JavaScript, manteniendo un ritmo de peticiones bajo para no violar los terminos del programa.
- Pruebas de penetracion web automatizadas: dado un objetivo en scope, el modelo sugiere vectores de ataque para IDOR, SSRF, XSS o SQLi, y propone PoCs minimos no destructivos como `SELECT version()` o `whoami` para confirmar la vulnerabilidad sin danar el sistema.
- Analisis de seguridad de APIs y GraphQL: el modelo puede enumerar consultas GraphQL con introspection, detectar BOLA/BFLA y recomendar tecnicas de batching para evadir rate limits durante pruebas autorizadas.
- Respuesta a incidentes y analisis forense: en un escenario de compromiso, el modelo asiste en la reconstruccion de la linea temporal, la recoleccion de artefactos y el analisis de memoria con Volatility, siguiendo la metodologia DFIR.
- Redaccion de informes de vulnerabilidades: el modelo genera informes en el formato exacto de cada plataforma (HackerOne, Bugcrowd, Intigriti), calcula la severidad CVSS y explica el impacto potencial, ahorrando tiempo al investigador.
- Entrenamiento y simulacion de equipos de seguridad: el modelo puede actuar como adversario simulado en ejercicios de red team, generando escenarios realistas de ataque y defensa para formacion de personal.
- Analisis de trafico de red y deteccion de C2: con capturas PCAP, el modelo identifica patrones de tunneling DNS, comunicaciones con servidores de mando y control, y posibles exfiltraciones de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El archivo GGUF Q4_K_M ocupa aproximadamente 20 GB, por lo que se necesita al menos 20 GB de RAM o VRAM para cargar el modelo completo.
- En Apple Silicon con memoria unificada se alcanzan unos 30 tok/s (frente a 7 tok/s de la version densa v7), lo que lo hace utilizable en equipos Mac con 32 GB o mas de RAM.
- En GPU, se recomienda una tarjeta con al menos 24 GB de VRAM (RTX 3090, RTX 4090, A5000) para inferencia comoda con el cuantizado Q4_K_M.
- El proyector de vision mmproj-BF16 anade unos 874 MB adicionales.
- Despliegue compatible con llama.cpp (build de agosto de 2026 o posterior para soporte de qwen35moe), LM Studio (desactivando Speculative Decoding manualmente) y cualquier runtime que soporte GGUF con arquitectura qwen35moe.
- No se dispone de datos de latencia o throughput en GPU dedicada.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato | Especializacion |
|---|---|---|---|---|---|---|
| Qwen3.5-35B-A3B-uncensored-bughunter-v8 | 35B | 3B | no disponible | Apache-2.0 | GGUF | Ciberseguridad ofensiva/defensiva |
| Qwen3.5-35B-A3B (base) | 35B | 3B | no disponible | Apache-2.0 | safetensors, GGUF | Generalista multimodal |
| Qwen3.8-27B-Uncensored-bughunter-v7 | 27B | 27B (denso) | no disponible | Apache-2.0 | GGUF | Ciberseguridad ofensiva/defensiva |

La comparativa se limita a los modelos mencionados en la informacion disponible. El v8 ofrece una velocidad de inferencia aproximadamente 4 veces superior al v7 en Apple Silicon (30 tok/s frente a 7 tok/s) con calidad comparable en el 90% de los casos, segun el autor. El modelo base generalista no incluye el fine-tune de seguridad, por lo que carece de las reglas operativas y el conocimiento especializado en bug bounty.

## Limitaciones y advertencias

- Al ser un modelo "uncensored", puede generar contenido peligroso o ilegal si se usa sin las salvaguardas adecuadas. Las reglas operativas solo se activan cuando se proporciona un system prompt explicito; sin el, el modelo podria sugerir acciones no autorizadas.
- La vision es heredada del modelo base y no fue entrenada durante el fine-tune, por lo que su rendimiento en tareas de analisis de imagenes puede ser inferior al de un modelo especificamente entrenado para ello.
- El MTP (multi-token prediction) no se exporta en el GGUF debido a un bug conocido en el convertidor de llama.cpp. En LM Studio hay que desactivar manualmente Speculative Decoding para evitar errores de carga.
- No se han publicado benchmarks objetivos que permitan evaluar su rendimiento real en tareas de seguridad frente a otros modelos.
- La longitud de contexto no se ha especificado en la informacion disponible, lo que limita la planificacion de tareas que requieran ventanas largas.
- El modelo esta entrenado principalmente en espanol e ingles; su rendimiento en otros idiomas puede ser limitado.
- La licencia Apache-2.0 permite uso comercial, pero el caracter "uncensored" puede plantear problemas de responsabilidad legal si se utiliza en entornos de produccion sin control.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/mmp2055/Qwen3.5-35B-A3B-uncensored-bughunter-v8)
- [Modelo base llmfan46/Qwen3.5-35B-A3B-uncensored-heretic-v2-Native-MTP-Preserved](https://huggingface.co/llmfan46/Qwen3.5-35B-A3B-uncensored-heretic-v2-Native-MTP-Preserved)
- [Version v7 (27B denso)](https://huggingface.co/mmp2055/Qwen3.8-27B-Uncensored-bughunter-v7)
- [Guia de requisitos de hardware y despliegue local](https://localairig.com/models/qwen3-5-35b-uncensored-setup-guide/)
- [Pagina del modelo en Ollama](https://ollama.com/library/qwen3.5:35b-a3b)
- [Analisis tecnico de la serie Qwen3.5 2026](https://explore.n1n.ai/blog/qwen3-5-model-series-2026-guide-2026-02-25)
- [Demo de Qwen3.5-35B-A3B en Novita AI](https://novita.ai/models/llm/qwen-qwen3.5-35b-a3b)
