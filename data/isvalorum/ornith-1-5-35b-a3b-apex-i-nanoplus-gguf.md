# IsValorum/Ornith-1.5-35B-A3B-APEX-I-NanoPlus-GGUF

## Resumen

Ornith-1.5-35B-A3B es un modelo de lenguaje de arquitectura Mixture-of-Experts (MoE) desarrollado por ornith-ai, con 34.660.610.688 parametros totales y aproximadamente 3.000 millones de parametros activos por token (la designacion A3B del nombre). Esta ficha documenta la cuantizacion GGUF APEX-I-NanoPlus publicada por IsValorum, una build artesanal orientada a reducir el peso del modelo hasta unos 12,55 GB en disco (11,69 GiB en memoria) manteniendo calidad equivalente a un Q4_K_M/Q4_K_L estandar. El modelo base es multimodal (image-text-to-text) y esta orientado a razonamiento, codigo y flujos agenticos.

La relevancia de esta publicacion concreta reside en su estrategia de cuantizacion selectiva: los tensores de enrutamiento de expertos (`gate_inp`, `gate_shexp`) se conservan en F32 sin comprimir, la cabeza de salida se protege en Q6_K, las compuertas de atencion en Q8_0 y solo se aplica compresion agresiva de 2 bits a tensores redundantes. Segun la model card, esto permite desplegar un MoE de 35B en GPUs de consumo con 16 GB de VRAM, apoyandose en streaming desde RAM del sistema.

El modelo base declara soporte para 13 idiomas (incluido el castellano), licencia MIT y un pipeline multimodal con vision. La cuantizacion conserva esa licencia. No se dispone de informacion detallada sobre la composicion del dataset de entrenamiento ni sobre el proceso de alineacion del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) sobre transformer, 40 capas en el backbone; familia Qwen3.5-MoE segun tags (`qwen35moe`, `qwen3_5_moe`, `qwen3.6`) |
| Parametros totales | 34.660.610.688 (34,66B) |
| Parametros activos | Aproximadamente 3B (designacion A3B; cifra exacta no disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF APEX-I-NanoPlus (aproximadamente 2,90 BPW); mezcla de F32 (routers), Q6_K (output head), Q8_0 (attention gates), IQ3_XXS (ffn_down_exps) y 2 bits en tensores redundantes |
| Idiomas soportados | en, zh, es, fr, de, pt, it, ru, ja, ko, vi, th, ar |
| Licencia | MIT |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base es un transformer con capas MoE, identificado en los tags como perteneciente a la familia Qwen3.5-MoE (`qwen35moe`, `qwen3_5_moe`, `qwen3.6`) y con un backbone de 40 capas segun la model card de la cuantizacion. La designacion A3B indica que, pese a sus casi 35.000 millones de parametros totales, solo se activa un subconjunto reducido (del orden de 3.000 millones) por token, lo que reduce el coste computacional de inferencia frente a un modelo denso del mismo tamano. El pipeline declarado es image-text-to-text, por lo que incorpora capacidades de vision ademas de generacion de texto.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni sobre si se aplicaron tecnicas de RLHF, DPO u otras etapas de alineacion en el modelo base. La innovacion tecnica documentada corresponde a la cuantizacion: la build APEX-I-NanoPlus aplica una politica tensor a tensor que preserva integridad en los componentes sensibles (enrutamiento de expertos en F32, cabeza de salida en Q6_K, compuertas de atencion en Q8_0, proyeccion residual de bajada de los expertos en IQ3_XXS) y reserva la compresion de 2 bits para tensores redundantes. Segun el autor, esto evita la deriva de enrutamiento y los fallos de sintaxis tipicos de las cuantizaciones sub-3-bit genericas. La release omite un companero MTP (multi-token prediction) para priorizar el backbone de 40 capas dentro del presupuesto de 12-13 GB.

## Capacidades

- Generacion de texto conversacional multi-turno.
- Razonamiento explicito (tag `reasoning` en el modelo base).
- Generacion y comprension de codigo, con orientacion a tareas de ingenieria de software (tag `swe-bench`).
- Capacidades agenticas y flujos de multiples pasos (tag `agentic`).
- Vision e inferencia image-text-to-text (pipeline declarado).
- Soporte multilingue en 13 idiomas: ingles, chino, castellano, frances, aleman, portugues, italiano, ruso, japones, coreano, vietnamita, tailandes y arabe.
- Plantilla de chat endurecida para uso agentico, incluida en la model card de la cuantizacion.
- Compatibilidad con endpoints (tag `endpoints_compatible`) y con llama.cpp.
- Soporte de tool calling / function calling: no confirmado explicitamente en la informacion disponible.

## Casos de uso

- Asistentes de codigo en local: el modelo puede generar y revisar codigo en un equipo con 16 GB de VRAM gracias al streaming desde RAM del sistema, adecuado para desarrolladores que no quieren enviar codigo propietario a APIs externas.
- Agentes de ingenieria de software: con la plantilla de chat agentica incluida y su orientacion a SWE-bench, puede integrarse en pipelines que resuelven issues, aplican parches y ejecutan tareas de varios pasos sobre repositorios.
- Razonamiento con contexto largo en hardware de consumo: la ventana de contexto del modelo base (no disponible) combinada con el bajo peso de la cuantizacion permite mantener conversaciones o documentos extensos en memoria en GPUs de 16 GB.
- Procesamiento de documentos con imagenes: al ser image-text-to-text, puede extraer y razonar sobre informacion de capturas, diagramas o formularios escaneados en flujos de digitalizacion.
- Atencion al cliente multilingue: cubre 13 idiomas, incluido el castellano, y puede gestionar conversaciones multi-turno en despliegues autoalojados con llama-server exponiendo una API compatible con OpenAI.
- Analisis de codigo en CI/CD: puede integrarse como paso de revision automatizada o generacion de tests en pipelines, ejecutandose en infraestructura propia con llama.cpp y evitando dependencias de terceros.
- Investigacion y prototipado de modelos MoE: su huella de 12,55 GB facilita experimentar con un MoE de 35B en estaciones de trabajo sin GPUs de datacenter.

## Benchmarks y rendimiento

| Metrica | APEX-I-NanoPlus (actual) | APEX-I-MiniPlus V2.1 | BF16 base |
|---|---|---|---|
| Tamano en disco | 12,55 GB | 15,23 GB | aprox. 71,0 GB |
| Huella en memoria | 11,69 GiB | 14,18 GiB | aprox. 66,2 GiB |
| BPW medio | aprox. 2,90 | 3,43 | 16,00 |
| Perplejidad WikiText-2 | 8,0913 ± 0,22535 | 7,6370 ± 0,21010 | aprox. 7,58 (referencia) |
| Delta PPL vs. BF16 | +0,5113 (+6,75%) | +0,0570 (+0,75%) | 0,000 |
| ARC-Challenge (0-shot, 1.172 preguntas) | aprox. 95,71% | no disponible | no disponible |
| Equivalencia de calidad | Q4_K_M / Q4_K_L | Q5_K_L (rozando Q6_K) | linea base |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar del modelo base. Los datos de ARC-Challenge y WikiText-2 corresponden a mediciones del autor de la cuantizacion sobre el GGUF final.

## Requisitos de hardware

- VRAM estimada: aproximadamente 11,69 GiB de huella en memoria para el modelo completo; con overhead de contexto y KV cache, un despliegue comodo requiere 16 GB de VRAM, con streaming parcial desde RAM del sistema.
- GPU recomendadas: RTX 4090 (24 GB), RTX 4080 (16 GB), RTX 4070 Ti Super (16 GB), A100 y H100 para despliegues de mayor throughput; el autor posiciona la build explicitamente para GPUs de 16 GB.
- Cabe en GPU de consumo: si, en tarjetas de 16 GB o superiores, con soporte de offload a RAM del sistema para el resto del modelo y el contexto.
- Opciones de despliegue: llama.cpp (`llama-cli` y `llama-server` con API compatible con OpenAI, documentados en la model card); otros motores como vLLM, TGI u Ollama no se mencionan en la informacion disponible.
- Latencia y throughput: no disponibles. Al ser un MoE con aproximadamente 3B de parametros activos, el coste por token es inferior al de un modelo denso de 35B, pero no se aportan cifras medidas.
- Nota de calidad: la model card advierte sobre la necesidad de ajustar la penalizacion por repeticion en generacion de codigo para evitar intercambio de caracteres.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion / tamano | Licencia | Notas |
|---|---|---|---|---|---|
| Ornith-1.5-35B-A3B APEX-I-NanoPlus (esta ficha) | 34,66B totales, aprox. 3B activos | no disponible | GGUF, 12,55 GB, aprox. 2,90 BPW | MIT | PPL WikiText-2 8,0913; ARC-Challenge aprox. 95,71% |
| Ornith-1.5-35B-A3B APEX-I-MiniPlus V2.1 | 34,66B totales, aprox. 3B activos | no disponible | GGUF, 15,23 GB, 3,43 BPW | MIT | PPL WikiText-2 7,6370; orientado a ingenieria de software |
| Qwen3.6-35B-A3B-MTP APEX-I-NanoPlus | no disponible | no disponible | GGUF, aprox. 13,0 GB, 2,93 BPW | no disponible | Mismo autor de cuantizacion; incluye MTP |
| Occamy-1.0 APEX-I-NanoPlus | no disponible | no disponible | GGUF, aprox. 13,0 GB | no disponible | Mismo autor; orientado a investigacion profunda y multimodal |

Las alternativas listadas provienen de la propia model card del autor de la cuantizacion. No se dispone de datos de benchmarks comparativos frente a modelos de otros desarrolladores (por ejemplo, Qwen3 MoE oficiales o Llama 3.3) en la informacion proporcionada.

## Limitaciones y advertencias

- Perdida de calidad medible: la perplejidad en WikiText-2 aumenta un 6,75% respecto a BF16, superior al 0,75% de la variante MiniPlus; no es adecuada para tareas que exijan maxima fidelidad de lenguaje.
- La compresion de 2 bits en tensores redundantes puede degradar la coherencia en generacion larga o en dominios poco representados, aunque el autor afirma que la proteccion de routers y cabeza de salida mitiga los fallos graves.
- La model card advierte de un problema de intercambio de caracteres en generacion de codigo si no se ajusta la penalizacion por repeticion; requiere configuracion cuidadosa en produccion.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se documentan evaluaciones de factualidad.
- Sesgos conocidos: no disponibles; no se aporta informacion sobre la composicion del dataset ni sobre evaluaciones de sesgo del modelo base.
- Longitud de contexto no disponible: no se puede garantizar el comportamiento en ventanas muy largas sin verificacion empirica.
- El modelo base pertenece a la familia Qwen3.5-MoE segun los tags, pero no se confirma oficialmente la relacion ni se detalla el proceso de entrenamiento.
- Licencia MIT permite uso comercial, pero la cuantizacion es una build de terceros (IsValorum) sin garantias de soporte; conviene validar el comportamiento en el caso de uso concreto antes de desplegar.
- La release omite el componente MTP, por lo que no se beneficia de decodificacion multi-token especulativa.

## Enlaces

- Repositorio Hugging Face de esta cuantizacion: https://huggingface.co/IsValorum/Ornith-1.5-35B-A3B-APEX-I-NanoPlus-GGUF
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Variante MiniPlus V2.1: https://huggingface.co/IsValorum/Ornith-1.5-35B-A3B-APEX-I-MiniPlus-V2.1-GGUF
- Qwen3.6-35B-A3B-MTP APEX-I-NanoPlus: https://huggingface.co/IsValorum/Qwen3.6-35B-A3B-MTP-APEX-I-NanoPlus-GGUF
- Occamy-1.0 APEX-I-NanoPlus: https://huggingface.co/IsValorum/Occamy-1.0-APEX-I-NanoPlus-GGUF
- Apoyo al autor de la cuantizacion: https://ko-fi.com/isvalorum
