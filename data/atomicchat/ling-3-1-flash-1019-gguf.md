# AtomicChat/Ling-3.1-flash-1019-GGUF

## Resumen

Este repositorio contiene una cuantización GGUF de **Ling 3.1 flash 1019**, un modelo de lenguaje de gran escala desarrollado por inclusionAI, realizada por el equipo de AtomicChat. Ling 3.1 flash 1019 es un modelo conversacional de arquitectura Mixture of Experts (MoE) con unos 564.000 millones de parámetros totales (572 GB en safetensors según los metadatos del repo, de los cuales unos 24.000 millones están activos por token) y una ventana de contexto de 262.144 tokens. Su rasgo más distintivo es su atención híbrida: 63 de sus 72 capas usan Kimi Delta Attention (atención lineal con estado de tamaño fijo) y solo 9 capas mantienen atención comprimida tipo multi-head latent attention, lo que reduce drásticamente el coste de memoria del KV cache en contextos largos.

La cuantización de AtomicChat, etiquetada `AD-IQ2_M`, emplea un esquema "Atomic Dynamic": los expertos enrutados (el 97 % de los pesos) se cuantizan en formato de muy bajo bit (3,17 bits por peso de media), mientras que la atención, el experto compartido, el router, las capas densas y el bloque de predicción multi-token se mantienen en q8_0 o superior. El archivo incluye además la cabeza de predicción multi-token (MTP), que puede usarse como modelo borrador para decodificación especulativa en llama.cpp con tasas de aceptación medidas del 57 al 69 %.

Es relevante ahora porque permite ejecutar localmente, con llama.cpp, uno de los modelos abiertos más grandes disponibles, aprovechando su atención lineal para mantener conversaciones largas con una huella de memoria de contexto muy baja (unos 10 KB por token). Requiere, eso sí, hardware de gama muy alta: alrededor de 256 GB de VRAM o memoria unificada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE transformer con atención híbrida (63 capas Kimi Delta Attention lineal + 9 capas multi-head latent attention) |
| Parametros totales | 572.120.680.768 (safetensors); unos 564B activables según la model card |
| Parametros activos | Aproximadamente 24B por token (8 expertos enrutados + 1 experto compartido de 512 disponibles en 68 capas MoE; las 4 primeras capas son densas) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | AD-IQ2_M (Atomic Dynamic, 3,17 bits por peso de media; expertos en IQ2, resto en q8_0 o superior) |
| Idiomas no disponibles (la cuantización se calibró con un corpus de 30 lenguas, pero la lista oficial no está publicada) | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (6 shards de hasta 45 GB; repo de 226,8 GB) |

## Arquitectura y entrenamiento

Ling 3.1 flash 1019 es un transformer MoE con 72 capas: las 4 primeras son densas y las 68 restantes contienen 512 expertos enrutados cada una, de los cuales se activan 8 expertos enrutados más 1 experto compartido por token, lo que da unos 24B de parámetros activos sobre 564B totales. A esto se suma un bloque de predicción multi-token (MTP) de 8B parámetros, pensado para acelerar la inferencia mediante decodificación especulativa. La atención es híbrida: 63 capas emplean Kimi Delta Attention, una variante de atención lineal con estado de tamaño fijo que elimina el crecimiento del KV cache, y 9 capas usan multi-head latent attention comprimida. El tamaño oculto es 4096 y el vocabulario, 157.184 tokens.

Sobre el entrenamiento del modelo base no se han publicado detalles en la información disponible (número de tokens, composición del dataset ni uso de RLHF/DPO). En cuanto a la cuantización: AtomicChat partió del release FP8 de inclusionAI (revisión `dddfee4b`), lo convirtió a BF16 y lo cuantizó con llama.cpp b11571 usando una matriz de importancia (imatrix) calculada sobre 5,5 millones de tokens del corpus `ling3-moe` (con thinking activado y desactivado, tool calls, 30 lenguas, código y documentos largos de hasta 32k tokens), renderizados a través de la plantilla de chat del modelo. La matriz no se recalculó para este checkpoint específico, ya que comparte arquitectura, configuración y plantilla con Ling 3.1 flash.

## Capacidades

- Generación de texto conversacional, con modo de razonamiento ("thinking") activado por defecto y conmutable mediante `enable_thinking` en la plantilla de chat.
- Generación de código (la cuantización se verificó completando texto y código en llama-server).
- Soporte de tool calling / function calling, incluido en el corpus de calibración de la imatrix y gestionado por la plantilla de chat integrada (`--jinja`).
- Contexto muy largo (262.144 tokens) con coste de memoria de contexto bajo gracias a la atención lineal: unos 0,5 GB por conversación más ~10 KB por token.
- Decodificación especulativa mediante la cabeza MTP integrada (`--spec-type draft-mtp`), con aceptación medida del 57 al 69 % de los tokens borradores.
- Cobertura multilingüe implícita en la calibración (30 lenguas en el corpus de la imatrix), aunque la lista oficial de idiomas soportados no está disponible.
- Capacidades de visión, audio u otras modalidades: no disponible en la información proporcionada.

## Casos de uso

- Asistentes conversacionales autoalojados con razonamiento: el modo thinking activado por defecto permite encadenar pasos de razonamiento antes de responder, adecuado para asistentes de análisis o consultoría técnica que se ejecuten íntegramente en local.
- Procesamiento de documentos largos: con 262.144 tokens de contexto y un coste de solo ~10 KB por token en memoria, es viable resumir, extraer datos o hacer preguntas sobre contratos, informes o bases de código extensas sin el consumo de KV cache de un transformer clásico.
- Agentes con tool calling: la plantilla de chat integrada soporta llamadas a herramientas, lo que permite construir agentes multi-paso que consulten APIs, busquen información o ejecuten funciones en pipelines de automatización.
- Generación y revisión de código en entornos offline: su tamaño activo de 24B parámetros y su calibración con código lo hacen apto para completar, refactorizar y explicar código en estaciones de trabajo con memoria unificada de gama alta.
- Inferencia de alto throughput con decodificación especulativa: la cabeza MTP integrada y aceptada entre el 57 y el 69 % de los tokens borradores permite acelerar la generación en servidores llama.cpp sin necesidad de un modelo draft separado.
- Despliegue multiusuario en servidor: `llama-server` con contexto de 32k tokens y atención lineal permite servir varias sesiones simultáneas con overhead de contexto reducido (~0,5 GB por conversación).
- Investigación sobre cuantización extrema de MoE: el esquema Atomic Dynamic (expertos a ~2 bits, componentes sensibles a q8_0) y las métricas publicadas sirven como referencia reproducible para estudios de compresión de modelos gigantes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica únicamente que la cuantización no ha sido medida contra el modelo BF16 (aunque la misma disposición en el checkpoint anterior sí tiene KL divergence y top-1 agreement publicados en `AtomicChat/Ling-3.1-flash-GGUF`), que el archivo ocupa 3,17 bits por peso de media, y que se verificó que carga en llama-server y completa texto y código. La tasa de aceptación del MTP medida por AtomicChat es del 57 al 69 % de los tokens borradores.

## Requisitos de hardware

- VRAM o memoria unificada estimada: 256 GB para el archivo AD-IQ2_M (226,8 GB en disco) más margen para el contexto.
- GPU recomendadas: no hay GPUs convencionales con 256 GB de VRAM; el perfil de uso natural son Mac Studio con 256 GB de memoria unificada (la model card sugiere elevar el límite con `sudo sysctl iogpu.wired_limit_mb=240000`) o servidores multi-GPU (por ejemplo, 4x A100/H100 80 GB, aunque esta combinación no está medida en la documentación).
- No cabe en GPUs de consumo (RTX 4090, RTX 5090, etc.): el archivo solo ya supera con mucho sus 24-32 GB de VRAM.
- Memoria de contexto: unos 0,5 GB por conversación más ~10 KB por token, muy por debajo de un transformer denso equivalente.
- Despliegue: llama.cpp build b11571 o superior con soporte `bailingmoe3` (llama-server, CLI). No se documenta compatibilidad con vLLM, TGI u Ollama para esta cuantización.
- Comandos de referencia: `llama-server -hf AtomicChat/Ling-3.1-flash-1019-GGUF:AD-IQ2_M -ngl 99 -c 32768 --jinja`, añadiendo `--spec-type draft-mtp` para usar la cabeza MTP.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Ling 3.1 flash 1019 (AD-IQ2_M, este repo) | 564B / ~24B (MoE) | 262.144 | MIT | GGUF, llama.cpp b11571+ |
| Ling 3.1 flash (checkpoint anterior, AtomicChat) | Misma arquitectura | 262.144 | MIT | GGUF con más cuantizaciones y métricas KL/top-1 publicadas |
| Modelos densos de escala comparable (p. ej. Llama 405B) | ~405B / 405B | ~128k | Licencia comunitaria | Requieren mucho más hardware por token activo; no hay datos de rendimiento comparativo publicados en la información disponible |

Nota: no hay datos de rendimiento medidos que permitan una comparativa numérica; la ventaja diferencial documentada de este modelo es la atención híbrida lineal (coste de contexto de ~10 KB/token) y la MTP integrada para decodificación especulativa.

## Limitaciones y advertencias

- La cuantización AD-IQ2_M no ha sido evaluada contra el modelo BF16: la calidad exacta de esta variante no está medida, solo se verificó que carga y completa texto y código.
- La matriz de importancia se calculó para el checkpoint Ling 3.1 flash anterior, no para esta revisión 1019, aunque compartan arquitectura y plantilla.
- A 3,17 bits por peso de media, los expertos enrutados (97 % de los pesos) están cuantizados en formato de muy bajo bit, lo que puede degradar la fidelidad en tareas sensibles; no hay KL divergence publicado para este archivo concreto.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Riesgo de alucinación: inherente a todo LLM; no hay datos específicos publicados para este modelo.
- Idiomas: la lista oficial de idiomas soportados no está disponible; la calibración cubrió 30 lenguas, pero eso no garantiza rendimiento uniforme.
- Requisitos de hardware muy exigentes: 256 GB de memoria lo sitúan fuera del alcance de la mayoría de estaciones de trabajo y GPUs de consumo.
- El modo thinking está activado por defecto y no se desactiva con un system prompt: hay que pasar `enable_thinking: false` explícitamente en la plantilla o en la petición.
- Licencia MIT: sin restricciones para uso comercial, tanto del modelo base como de la cuantización.
- Requiere llama.cpp b11571 o superior con soporte de arquitectura `bailingmoe3`; versiones anteriores no cargarán el archivo.

## Enlaces

- Repositorio de la cuantización: https://huggingface.co/AtomicChat/Ling-3.1-flash-1019-GGUF
- Modelo base: https://huggingface.co/inclusionAI/Ling-3.1-flash-1019
- Cuantizaciones del checkpoint anterior con métricas: https://huggingface.co/AtomicChat/Ling-3.1-flash-GGUF
- Corpus de calibración: https://huggingface.co/datasets/AtomicChat/calib-corpora
- Métricas de la imatrix y layouts: https://huggingface.co/datasets/AtomicChat/Ling-3.1-flash-1019-GGUF-metrics
- Atomic Chat: https://atomic.chat/
- GitHub de Atomic Chat: https://github.com/AtomicBot-ai/Atomic-Chat
- Discord: https://discord.gg/8wGSsvmg4V
- X (Twitter): https://x.com/atomic_chat_hq
- Paper del modelo base: no disponible
