# nassimjp/Raon-1-mini

## Resumen

Raon-1 mini es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado desde cero por KRAFTON AI, presentado como parte de la familia abierta Raon. Con 28.800 millones de parámetros totales y 4.300 millones activos por token, el modelo está disenado especificamente para destacar en conversacion en coreano y en tareas agénticas, aunque tambien cubre ingles y otros idiomas. Se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

La arquitectura es hibrida: combina 18 capas de atencion lineal Raon Delta Attention (RDA) con 7 capas de atencion completa (Gated MLA), sobre un total de 25 capas. Esta disposicion reduce drasticamente el coste de la cache KV en contextos largos, ya que solo las capas MLA mantienen cache (aproximadamente 8 KiB por token en BF16). El modelo soporta de forma nativa hasta 262.144 tokens de contexto y emplea codificacion posicional NoPE.

Su relevancia actual radica en tres factores: un modo de razonamiento configurable con seis niveles de esfuerzo, soporte de tool calling para flujos agénticos, y eficiencia de memoria que permite inferencia con contexto completo de 256K en tan solo 20 GiB de VRAM mediante cuantizacion NVFP4. Ademas, se ofrece un modelo draft DFlash2 para decodificacion especulativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE hibrida (18 capas Raon Delta Attention + 7 capas Gated MLA) |
| Parametros totales | 28,8 B |
| Parametros activos | 4,3 B (6 expertos enrutados + 1 compartido de 128 totales) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | MXFP8, NVFP4 (BF16 como formato base) |
| Idiomas soportados | Coreano, ingles, japones, chino, espanol, frances y tailandes |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers, custom_code) |

Otros datos tecnicos: 25 capas, hidden size de 2.560, 40 cabezas de atencion (dimension 128 para RDA; 192 QK / 128 V para Gated MLA), rango LoRA de query/KV de 576/512 en Gated MLA, tamano intermedio de experto de 1.088, FFN denso de la primera capa de 12.032, funcion de activacion SiTU-GLU, conexiones residuales Raon-mHC con 4 streams, vocabulario de 259.840 tokens y LM head no atado (untied).

## Arquitectura y entrenamiento

Raon-1 mini emplea una arquitectura transformer MoE hibrida con dos innovaciones propias. La primera, Raon Delta Attention (RDA), desacopla las compuertas de borrado y escritura de Kimi Delta Attention, lo que segun el autor mejora el rendimiento en contexto largo respecto a KDA. La segunda, Raon-mHC, reduce el coste computacional de las manifold-constrained hyper-connections (mHC) de DeepSeek, acelerando el entrenamiento. El layout hibrido mantiene estado de tamano fijo en 18 de las 25 capas, de modo que solo las 7 capas MLA conservan cache KV, lo que abarata enormemente la inferencia con contextos de cientos de miles de tokens.

El modelo fue entrenado desde cero por KRAFTON AI sobre un corpus multilingue que incluye coreano, ingles, japones, chino, espanol, frances y tailandes. La model card no detalla el numero exacto de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF o DPO. El modo de razonamiento integrado admite seis niveles de esfuerzo (`none`, `low`, `medium`, `high`, `xhigh`, `max`) seleccionables por peticion, y se proporciona un modelo draft DFlash2 para decodificacion especulativa.

## Capacidades

- Generacion de texto conversacional multi-turno, con rendimiento destacado en coreano.
- Razonamiento integrado con seis niveles de esfuerzo configurables por peticion.
- Razonamiento matematico y cientifico de alto nivel (resultados en AIME 2026, HMMT Feb 2026 y GPQA Diamond).
- Tool calling / function calling para flujos agénticos.
- Ejecucion de agentes con soporte declarado para Hermes Agent, Pi y OpenCode.
- Busqueda y navegacion multi-turno (evaluado en BrowseComp Plus).
- Capacidades multilingues en siete idiomas.
- Contexto largo nativo de hasta 262.144 tokens.
- Decodificacion especulativa mediante el draft model DFlash2.
- Inferencia eficiente en memoria con formatos MXFP8 y NVFP4.

## Casos de uso

- Atencion al cliente en coreano: el modelo puede gestionar conversaciones multi-turno prolongadas gracias a sus 262.144 tokens de contexto y a su entrenamiento especifico en conversacion coreana, manteniendo coherencia a lo largo de sesiones extensas.
- Agentes autonomos con tool calling: integrable en frameworks como Hermes Agent, Pi u OpenCode para construir asistentes que ejecutan herramientas, consultan APIs y completan tareas de varios pasos.
- Razonamiento matematico y cientifico asistido: con niveles de esfuerzo `high` o `max` resulta adecuado para resolucion de problemas de competicion, verificacion de derivaciones y analisis tecnico.
- Busqueda aumentada y sintesis de informacion: su rendimiento en BrowseComp Plus lo hace util para pipelines de research que combinan recuperacion web con sintesis multi-turno.
- Despliegue en hardware limitado: con cuantizacion NVFP4 permite servir contexto completo de 256K en 20 GiB de VRAM, habilitando inferencia en GPUs de gama alta para consumidores o en nodos modestos.
- Generacion de codigo y tareas de ingenieria de software: evaluado en SWE-Verified, puede integrarse en asistentes de desarrollo y pipelines de CI/CD que requieran razonamiento sobre repositorios.
- Traduccion y atencion multilingue: cubre espanol, frances, tailandes, japones y chino ademas de coreano e ingles, util para productos con base de usuarios internacional.
- Aceleracion de inferencia en produccion: el draft model DFlash2 permite decodificacion especulativa para reducir latencia en servicios de alta concurrencia.

## Benchmarks y rendimiento

La model card incluye resultados parciales. Los datos disponibles son:

| Benchmark | Raon-1 mini |
|---|---|
| AIME 2026 | 96,7 |
| HMMT Feb 2026 | 87,1 |
| GPQA Diamond | 86,0 |
| MultiChallenge | 64,9 |
| BrowseComp Plus | 55,9 |

El autor indica que Raon-1 mini lidera entre los modelos MoE comparados en MultiChallenge y BrowseComp Plus. La model card menciona comparaciones con Qwen3.6 35B-A3B, Gemma 4 26B-A4B, Flint (40B-A2.5B) e Inkling 2 Mini en los graficos de highlights (AA-Omniscience, GPQA Diamond, IFBench, MultiChallenge, BrowseComp Plus, SWE-Verified, GDPVal y Chatbot Korean interno), pero los valores numericos de esos modelos no estan disponibles en la informacion proporcionada. No se han publicado en la informacion disponible resultados de MMLU, HumanEval ni GSM8K.

## Requisitos de hardware

- VRAM estimada: en BF16, los 28,8 B de parametros requieren aproximadamente 58 GB solo para pesos; en MXFP8, alrededor de 29 GB; en NVFP4, unos 15 GB. El autor afirma que NVFP4 permite inferencia con contexto completo de 256K en 20 GiB de VRAM.
- GPU recomendadas: A100 80 GB o H100 para BF16 con contexto largo; A100 40 GB, L40S o RTX 6000 Ada para MXFP8; GPUs con 20-24 GB (RTX 4090, RTX 3090, L4) para NVFP4 con contexto completo.
- Cabe en GPU de consumo: si, en RTX 4090 o RTX 3090 con cuantizacion NVFP4 para contexto completo; en BF16 no cabe en GPUs de consumo.
- Opciones de despliegue: transformers (libreria declarada, con custom_code), vLLM y TGI como opciones habituales para modelos MoE; llama.cpp y Ollama no estan confirmados en la informacion disponible. El modelo requiere soporte de `custom_code` por parte del runtime.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

La model card cita como baselines Qwen3.6 35B-A3B, Gemma 4 26B-A4B, Flint (40B-A2.5B) e Inkling 2 Mini. Los datos de parametros y contexto de esos modelos no estan disponibles en la informacion proporcionada, por lo que la comparativa se limita a lo declarado por el autor.

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Raon-1 mini | 28,8 B totales / 4,3 B activos | 262.144 | Apache 2.0 | Lidera MultiChallenge y BrowseComp Plus segun el autor |
| Qwen3.6 35B-A3B | no disponible | no disponible | no disponible | Baseline citado por el autor |
| Gemma 4 26B-A4B | no disponible | no disponible | no disponible | Baseline citado por el autor |
| Flint (40B-A2.5B) | no disponible | no disponible | no disponible | Baseline citado por el autor |
| Inkling 2 Mini | no disponible | no disponible | no disponible | Baseline citado por el autor |

## Limitaciones y advertencias

- El modelo esta optimizado para coreano; el rendimiento en espanol, aunque soportado, no esta cuantificado en la informacion disponible.
- Riesgo de alucinacion inherente a los modelos generativos; no se documentan tasas especificas ni mitigaciones en la model card.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- El repositorio en Hugging Face (nassimjp/Raon-1-mini) registra 0 descargas y 0 likes, y la model card referencia rutas de KRAFTON; conviene verificar la procedencia y la integridad de los pesos antes de usarlos en produccion.
- Requiere `custom_code` y `trust_remote_code` en transformers, lo que implica ejecutar codigo del autor; auditar antes de desplegar.
- La licencia Apache 2.0 permite uso comercial sin restricciones adicionales, pero no se ofrece garantia alguna por parte del autor.
- El rendimiento en contexto largo puede degradarse mas alla de los 262.144 tokens; no se documenta comportamiento en extrapolacion.
- No se detallan los datos de entrenamiento, lo que dificulta evaluar sesgos de dominio, contaminacion de benchmarks o cumplimiento normativo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nassimjp/Raon-1-mini
- Repositorio de referencia del autor: https://huggingface.co/KRAFTON/Raon-1-mini
- Web de KRAFTON AI: https://krafton.ai/en/
- Organizacion en Hugging Face: https://huggingface.co/KRAFTON
- Playground: https://raon-console.krafton.ai/playground/guest
- X (Twitter): https://x.com/Krafton_AI
- Discord: https://discord.gg/sDG7mmZPnc
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
