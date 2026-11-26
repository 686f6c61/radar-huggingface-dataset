# AnesNT2026/Genisi-5-Aether

## Resumen
Genisi 5 Aether es un modelo multimodal de razonamiento e instrucciones de 9.410 millones de parametros (clase 10B) desarrollado por AnesNT AI Research, un laboratorio radicado en la provincia de Batna (Argelia) y liderado por Anes Kameche. Se distribuye con pesos abiertos bajo licencia Apache 2.0 y se registra bajo la clase de arquitectura propia `genisi_5_aether` (`Genisi5AetherForConditionalGeneration`), con un backbone de texto de 32 capas y un codificador visual de 27 capas para entradas de imagen y video.

El modelo esta disenado para ejecutarse en una sola GPU de 16-24 GB de VRAM y ofrece dos modos operativos: un modo por defecto de baja latencia y un modo con razonamiento explicito (``) que emite cadenas de razonamiento paso a paso antes de la respuesta final. Su propuesta diferencial es el soporte nativo de dariya argelina (`arq`), arabe estandar, ingles y frances, junto con capacidades de codificacion agentica y uso de herramientas.

La relevancia actual del modelo radica en su ventana de contexto nativa de 262.144 posiciones (256K) y en la publicacion de resultados en benchmarks de agentes, SWE y computer use comparados con modelos frontera, un ejercicio poco habitual en lanzamientos de este tamano. No obstante, debe tenerse en cuenta que varios de los modelos de referencia citados en la model card no son verificables de forma independiente.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | `genisi_5_aether` (`Genisi5AetherForConditionalGeneration`), transformer multimodal con backbone de texto y codificador visual |
| Parametros totales | 9.653.104.368 (segun safetensors); la model card declara 9.409.813.744 (9,41B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 posiciones (256K nativo, techo RoPE) |
| Tipos de cuantizacion | BF16 en pesos oficiales; el autor menciona QLoRA 4-bit NF4 para el ajuste, no se documentan GGUF/AWQ/GPTQ oficiales |
| Idiomas soportados | arabe (`ar`), ingles (`en`), frances (`fr`), chino (`zh`); dariya argelina (`arq`) declarada en la model card |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16, 4 shards, ~19,3 GB segun model card; el repo ocupa 67,5 GB) |

Configuracion del backbone de texto: 32 capas, hidden size 4.096, intermediate size 12.288, vocabulario de 248.320 tokens. Codificador visual: 27 capas, hidden size 1.152, intermediate size 4.304.

## Arquitectura y entrenamiento
La arquitectura es un transformer multimodal con un modulo de texto y un codificador visual separado que acepta imagenes y video. El ajuste se realizo mediante QLoRA en dos etapas con cuantizacion 4-bit NF4, rango `r=32`, `lora_alpha=64`, fusionando 128 matrices de pesos en BF16. La model card reporta una perdida final de SFT de 0,0013 (99,87 % de convergencia sobre tokens del asistente), una cifra que conviene interpretar con cautela porque no se acompana de curvas de validacion ni de detalles del dataset.

No se especifica el numero de tokens de entrenamiento, la composicion del corpus ni si se aplicaron tecnicas de RLHF o DPO. El autor menciona que los conjuntos de evaluacion (`google/IFEval`, `PatronusAI/few-word-do-trick-traces` y canarios de seguridad de MAPS EVALS DATA) fueron excluidos estrictamente del entrenamiento. Tampoco se documentan innovaciones como decodificacion especulativa o atencion lineal; el unico mecanismo destacable declarado es el modo de razonamiento explicito con etiquetas ``, orientado a matematicas, ingenieria de software, finanzas, medicina clinica y ciberseguridad.
- Comprension de imagenes y video a traves del codificador visual (`image-text-to-text`).
- Codificacion agentica y tareas de repositorio a escala (SWE), segun los benchmarks declarados.
- Uso de herramientas y function calling implicitos en las evaluaciones de agentes (Terminal-Bench, Agents' Last Exam, AutomationBench).
- Computer use y automatizacion de escritorio (OSWorld-2.1, Vending-Bench 2).
- Razonamiento sobre grafos y contexto largo (GraphWalks 256k).
- Modo por defecto de baja latencia para chat y traduccion.

## Casos de uso
- Atencion al cliente en el Magreb: el modelo puede gestionar conversaciones multi-turno en dariya argelina, arabe estandar y frances con una unica implementacion, lo que reduce la necesidad de modelos separados por idioma en mercados bilingues.
- Generacion y revision de codigo en produccion: su soporte declarado de razonamiento agentico y contexto de 256K permite analizar repositorios completos y proponer parches en pipelines de CI/CD, aunque los resultados en SWE-sweep (2,1 % en modo por defecto, 4,5 % con thinking) aconsejan usarlo como asistente y no como sustituto de revision humana.
- Automatizacion de escritorio y RPA: las puntuaciones en OSWorld-2.1 (53,0 % por defecto, 75,0 % con thinking) lo hacen viable para prototipos de agentes que operan interfaces graficas en entornos controlados.
- Analisis de documentos financieros y legales: el modo thinking alcanza un 72,0 % en Vals Index v2.2, por lo que puede emplearse para extraccion y sintesis de contratos o informes, siempre con verificacion posterior.
- Transcripcion y descripcion de imagenes medicas o tecnicas: el codificador visual de 27 capas permite tareas de image-text-to-text como captioning, VQA o inspeccion de capturas en flujos de soporte.
- Traduccion y localizacion arabe-frances-ingles: el vocabulario de 248.320 tokens y el entrenamiento multilingue lo hacen adecuado para localizar documentacion o contenido de producto en la region.
- Prototipado en una sola GPU: con 9,41B parametros en BF16 cabe en GPUs de 24 GB, lo que permite a equipos pequenos desplegar un modelo multimodal propio sin infraestructura de centro de datos.

## Benchmarks y rendimiento
La model card publica la siguiente comparativa. Los modelos de referencia citados (Gemini 4 Carbon, Claude Opus 5.5, Gemini 4 Argon, Claude Fable 5.1, Kimi K3.1 Pro) no son verificables de forma independiente en la informacion disponible y deben tomarse como referencia declarada por el autor.

| Benchmark | Genisi 5 Aether Default (9,41B) | Genisi 5 Aether with Thinking (9,41B) |
|---|---|---|
| AA Intelligence Index v5.0 | 35 | 52 |
| Vals Index v2.2 (finanzas y derecho) | 55,0 % | 72,0 % |
| SWE-sweep (SWE a escala de repo) | 2,1 % | 4,5 % |
| FrontierSWE 2 | 38,5 % | 58,0 % |
| Terminal-Bench 4.0 (AA) | 41,0 % | 59,5 % |
| Agents' Last Exam v1.1 | 46,5 % | 68,0 % |
| OSWorld-2.1 (computer use) | 53,0 % | 75,0 % |
| AutomationBench | 28,0 % | 46,0 % |
| Vending-Bench 2 ($) | 4.600 | 9.800 |
| GraphWalks 256k (F1) | no disponible (tabla truncada) | no disponible (tabla truncada) |

No se han publicado resultados de MMLU, HumanEval ni GSM8K en la informacion disponible.

## Requisitos de hardware
- VRAM estimada en BF16: aproximadamente 19,3 GB para los pesos, mas overhead de activaciones y KV cache; se recomienda un minimo de 24 GB para contexto corto.
- VRAM en cuantizacion 4-bit (no oficial, estimada): en torno a 6-8 GB de pesos, aunque no se distribuyen pesos GGUF/AWQ/GPTQ oficiales.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090/A6000 de 24 GB para BF16; GPUs de 16 GB solo con cuantizacion no oficial.
- Cabe en GPU de consumo: si, en RTX 4090, RTX 3090 y A6000 de 24 GB en BF16; en GPUs de 16 GB requiere cuantizacion.
- Opciones de despliegue: `transformers` con `custom_code` (clase `Genisi5AetherForConditionalGeneration`); vLLM, TGI, llama.cpp u Ollama no estan documentados como soportados en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares
| Modelo | Parametros | Contexto | Licencia | Multimodal | Notas |
|---|---|---|---|---|---|
| Genisi 5 Aether | 9,41B (declarado) | 256K | Apache 2.0 | Si (imagen y video) | Modo thinking, dariya argelina |
| Qwen2.5-VL-7B | 7B | 128K | Apache 2.0 | Si | Referencia consolidada en vision-lenguaje |
| Llama 3.2 11B Vision | 11B | 128K | Llama Community License | Si | Restricciones de uso comercial |
| Gemma 3 12B | 12B | 128K | Gemma Terms | Si | Requiere aceptacion de terminos |

La comparativa con Qwen2.5-VL-7B, Llama 3.2 11B Vision y Gemma 3 12B se ofrece por categoria y tamano; no se dispone de resultados de benchmarks cruzados en la informacion proporcionada.

## Limitaciones y advertencias
- Los benchmarks publicados comparan con modelos frontera no verificables y no incluyen MMLU, HumanEval ni GSM8K, lo que dificulta una evaluacion independiente.
- La cifra de perdida SFT (0,0013) no va acompanada de validacion, composicion del dataset ni numero de tokens, por lo que no es interpretable como medida de calidad.
- Existe una discrepancia entre el recuento de parametros de la model card (9.409.813.744) y el de safetensors (9.653.104.368); conviene verificar antes de dimensionar infraestructura.
- El tamano del repositorio (67,5 GB) es muy superior al de los pesos BF16 declarados (19,3 GB), lo que sugiere artefactos adicionales no documentados.
- El soporte de dariya argelina es una declaracion del autor sin evaluacion publica especifica.
- Riesgo de alucinacion inherente a modelos de 10B, especialmente en modo thinking con cadenas de razonamiento largas y en tareas de codigo donde las puntuaciones SWE son bajas.
- La licencia Apache 2.0 permite uso comercial, pero el modelo depende de `custom_code` propio, lo que puede complicar la integracion con frameworks estandar.
- No hay pesos cuantizados oficiales ni soporte documentado en vLLM, llama.cpp u Ollama, lo que limita el despliegue en produccion.
- El modelo tiene 0 likes y 254 descargas, sin validacion de la comunidad ni evaluaciones de terceros.

## Enlaces
- Hugging Face: https://huggingface.co/AnesNT2026/Genisi-5-Aether
- Web oficial de AnesNT AI Research: https://genisi.web.app
- Chat en vivo: https://genisi.web.app/chat
