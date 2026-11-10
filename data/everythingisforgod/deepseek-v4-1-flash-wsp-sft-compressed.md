# EverythingIsForGod/DeepSeek-V4.1-Flash-WSP-SFT-Compressed

## Resumen

DeepSeek-V4.1-Flash-WSP-SFT-Compressed es una edicion estructuralmente comprimida y afinada mediante SFT del checkpoint `deepseek-ai/DeepSeek-V4.1-Flash`, un modelo MoE de 552.000 millones de parametros. El autor, identificado en Hugging Face como EverythingIsForGod, aplica una combinacion de poda de capas del backbone Causal Encoder-Decoder (CED), destilacion de expertos MoE guiada por dominio y ajuste supervisado multiepoca para especializar el modelo en ingenieria de software, diseno de sistemas distribuidos, seguridad de redes y pentesting etico.

El resultado es un checkpoint de 7,37 GiB (`model0-mp1.safetensors`) que reduce drasticamente el peso original de 475,24 GiB, manteniendo 8 de las 40 capas del backbone CED original y 24 de los 384 expertos enrutados por capa (4 activos por token). El modelo se distribuye con un motor de inferencia portable en PyTorch puro que sustituye los kernels `tilelang` especificos de Hopper/Blackwell por implementaciones compatibles con CPU y GPU de consumo.

La relevancia de esta ficha radica en que documenta un experimento de compresion agresiva sobre un modelo frontera, con licencia MIT y orientado a casos de uso de ciberseguridad y desarrollo. No obstante, la ausencia de benchmarks publicados y de datos de evaluacion independiente obliga a tratar sus capacidades declaradas con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Encoder-Decoder (CED) con capas MoE; transformer con backbone CED |
| Parametros totales | 552B en el modelo base; el checkpoint comprimido no declara recuento de parametros resultante (no disponible) |
| Parametros activos | 4 expertos enrutados activos por token sobre 24 retenidos por capa (no se declara el total de parametros activos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se distribuye en safetensors; el motor portable opera en PyTorch) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (`model0-mp1.safetensors`, 7,37 GiB) |

## Arquitectura y entrenamiento

El modelo parte de un backbone Causal Encoder-Decoder (CED) de 40 capas con mezcla de expertos. La compresion estructural retiene 8 capas ancla (`[0, 1, 2, 8, 20, 28, 36, 39]`), preservando las capas de entrada, salida y las fuentes de KV/Index. En la capa MoE, se clasifican los 384 expertos enrutados de cada capa mediante el router `sqrtsoftplus` frente a embeddings de tokens de curriculos de ingenieria de software, diseno de sistemas, seguridad de redes, CEH, pentesting y bug bounty. Se conservan los 24 expertos mas afines a esos dominios y se pliega la afinidad de enrutamiento de los expertos descartados en el experto retenido mas cercano. Adicionalmente se aplica una mejora de subespacio principal mediante SVD de bajo rango sobre `attn.wo_a.weight`.

El ajuste supervisado se realizo durante 8 epocas con AdamW, Cosine Annealing LR y LoRA de rango 16, sobre un corpus que cubre estructuras concurrentes seguras en C/Rust/Python, rate limiters atomicos con Redis Lua, arquitecturas idempotentes, validacion BGP RPKI/ROA, TCP SYN Cookies, TLS 1.3 1-RTT con PFS, deteccion y endurecimiento de Active Directory (Kerberoasting, Pass-the-Hash, Golden Ticket), prevencion de SSRF (CWE-918) con DNS rebinding, bloqueo TOCTOU (CWE-362), verificacion JWT/OAuth, aislamiento multi-tenant BOLA/IDOR, endurecimiento XXE y limites de complejidad de consultas GraphQL. La progresion de perdida de entropia cruzada va de 14,1267 en la epoca 1 a 6,0728 en la epoca 8, con perplejidad final de 433,87. El motor de inferencia portable en PyTorch puro sustituye los kernels `tilelang` limitados a Hopper/Blackwell, lo que permite ejecucion en CPU y GPU de consumo.

## Capacidades

- Generacion de texto conversacional y de codigo en el pipeline `text-generation`.
- Razonamiento especializado en ingenieria de software: estructuras concurrentes seguras frente a bloqueos y desbordamientos en C, Rust y Python.
- Diseno de sistemas distribuidos: rate limiters con Redis Lua, arquitecturas idempotentes y patrones de consistencia.
- Seguridad de redes: validacion BGP RPKI/ROA, DAI y DHCP Snooping en capa 2, TCP SYN Cookies en capa 4, TLS 1.3 1-RTT con PFS.
- Deteccion y endurecimiento de Active Directory: Kerberoasting, Pass-the-Hash y Golden Ticket.
- Pentesting etico y auditoria de bug bounty: SSRF (CWE-918), TOCTOU (CWE-362), JWT/OAuth, BOLA/IDOR, XXE y limites de complejidad GraphQL.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Capacidades especiales (modo thinking, vision, audio): no disponible en la informacion proporcionada.

## Casos de uso

- Revision de codigo concurrente en produccion: el modelo puede analizar estructuras de bloqueo y desbordamiento en C, Rust y Python, y proponer alternativas seguras, gracias al SFT especifico sobre concurrencia segura.
- Auditoria de seguridad de APIs web: se emplearia para identificar SSRF con DNS rebinding, condiciones de carrera TOCTOU, fallos de verificacion JWT/OAuth y aislamiento multi-tenant BOLA/IDOR en revisiones de codigo y diseno.
- Endurecimiento de infraestructura de red: el modelo puede generar y revisar configuraciones de BGP RPKI/ROA, DAI, DHCP Snooping, TCP SYN Cookies y TLS 1.3 con PFS en entornos de produccion.
- Deteccion de ataques en Active Directory: se usaria para redactar reglas de deteccion y guias de endurecimiento frente a Kerberoasting, Pass-the-Hash y Golden Ticket en auditorias de identidad.
- Diseno de sistemas distribuidos idempotentes: el modelo puede proponer arquitecturas con rate limiters atomicos en Redis Lua y patrones idempotentes para servicios expuestos a reintentos.
- Formacion y laboratorios de ciberseguridad: dado su ajuste sobre curriculos CEH y bug bounty, puede emplearse como asistente en entornos controlados de aprendizaje y resolucion de retos.
- Despliegue en hardware de consumo: el motor PyTorch portable y el checkpoint de 7,37 GiB permiten ejecutar el modelo en CPU y GPU de consumo, lo que facilita prototipado local sin infraestructura Hopper/Blackwell.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica de entrenamiento reportada es la progresion de perdida y perplejidad del SFT:

| Epoca | Cross-Entropy Loss | Perplejidad |
|---|---|---|
| 1 | 14,1267 | 1.365.029,08 |
| 2 | 10,4454 | 34.386,74 |
| 3 | 8,2925 | 3.993,97 |
| 4 | 7,3276 | 1.521,73 |
| 5 | 6,7505 | 854,49 |
| 6 | 6,3308 | 561,59 |
| 7 | 6,1397 | 463,90 |
| 8 | 6,0728 | 433,87 |

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint pesa 7,37 GiB en safetensors; en precision completa de los pesos almacenados requiere al menos ese espacio, mas overhead de activaciones y KV cache no cuantificado (no disponible).
- GPU recomendadas: no disponible en la informacion proporcionada; el autor indica compatibilidad con GPU de consumo al sustituir los kernels `tilelang` por PyTorch portable.
- Cabe en GPU de consumo: si, segun el autor, al eliminar la dependencia de kernels Hopper/Blackwell; no se especifican modelos concretos.
- Opciones de despliegue: motor propio `run_deepseek_v41.py` con `torch`, `safetensors` y `tokenizers`; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-WSP-SFT-Compressed | 552B en base; comprimido a 7,37 GiB | no disponible | MIT | Hugging Face | Version comprimida y SFT del base |
| deepseek-ai/DeepSeek-V4.1-Flash | 552B | no disponible | no disponible en esta ficha | Hugging Face | Modelo base original, 475,24 GiB |
| Alternativas de mismo tamano | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de modelos comparables en la informacion proporcionada |

## Limitaciones y advertencias

- No se han publicado benchmarks ni evaluaciones independientes; las capacidades declaradas provienen unicamente de la model card del autor.
- La compresion de 40 a 8 capas y de 384 a 24 expertos por capa implica una perdida sustancial de capacidad respecto al modelo base de 552B; el rendimiento en tareas fuera del dominio de SFT puede degradarse de forma significativa.
- La perplejidad final de 433,87 sigue siendo elevada en terminos absolutos, lo que sugiere un ajuste limitado incluso en el dominio objetivo.
- Riesgo de alucinacion en contenido tecnico de seguridad: el modelo puede generar configuraciones o recomendaciones plausibles pero incorrectas, peligrosas en entornos de produccion.
- Sesgos conocidos: no disponible; no se documenta evaluacion de sesgos.
- Idiomas soportados: no disponible; el SFT se describe en ingles tecnico, por lo que el rendimiento en castellano no esta garantizado.
- Restricciones de licencia: licencia MIT, que permite uso comercial, pero el modelo base y los datos de entrenamiento pueden tener condiciones adicionales no reflejadas en esta ficha.
- El uso en ciberseguridad ofensiva debe limitarse a entornos autorizados; el autor lo enmarca en pentesting etico y bug bounty.
- El checkpoint tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion de la comunidad.
- El motor de inferencia es un script propio (`run_deepseek_v41.py`) no estandarizado; la integracion con ecosistemas como vLLM o TGI no esta soportada segun la informacion disponible.

## Enlaces

- Hugging Face: https://huggingface.co/EverythingIsForGod/DeepSeek-V4.1-Flash-WSP-SFT-Compressed
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash
