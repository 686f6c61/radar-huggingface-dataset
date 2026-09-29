# AxionML/Inkling-Small-NVFP4

## Resumen

AxionML/Inkling-Small-NVFP4 es un espejo (mirror) del checkpoint cuantizado en NVFP4 de thinkingmachines/Inkling-Small, un modelo fundacional multimodal de tipo mixture-of-experts con 276.000 millones de parametros totales y 12.000 millones activos por token. La cuantizacion la realizo Thinking Machines con NVIDIA Model Optimizer; AxionML se limita a redistribuir el mismo contenido (revision `b6a99534467840620d411e4cd4ad5819b2610d9c`) para facilitar su servicio con SGLang y vLLM.

El modelo acepta entradas de texto, imagen y audio (WAV de 16 kHz) y esta orientado a tareas agenticas y de razonamiento: su model card reporta resultados destacados en SWE-bench Verified (80,2), GPQA Diamond (89,5) y MCP Atlas (79,6). La relevancia de esta variante concreta es el formato NVFP4 con grupo de 16 elementos y escalas FP8 (E4M3), que reduce el checkpoint a unos 171 GB manteniendo en BF16 la atencion, los routers y los codificadores de vision y audio.

Se distribuye bajo licencia Apache 2.0, con la salvedad de la Acceptable Use Policy de Thinking Machines. No se han publicado datos sobre longitud de contexto, idiomas soportados ni evaluaciones especificas del checkpoint cuantizado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder-only multimodal MoE de 42 capas con atencion hibrida local/global |
| Parametros totales | 276B segun la model card del modelo base; el recuento de safetensors del repositorio es 156.032.140.138 |
| Parametros activos | 12B (MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 con grupo de 16 y escalas FP8 (E4M3); atencion, routers y codificadores de vision/audio en BF16; KV cache sin cuantizar |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0, sujeta a la Acceptable Use Policy de Thinking Machines |
| Formato de pesos | safetensors (tamano del repositorio: 170,8 GB) |
| Expertos | 256 enrutados (6 activos) + 2 compartidos |
| Entrada | Texto, imagen y audio (WAV de 16 kHz) |
| Tamano del checkpoint | ~171 GB |

## Arquitectura y entrenamiento

Inkling-Small es un transformer decoder-only de 42 capas con arquitectura MoE dispersa: 256 expertos enrutados de los que se activan 6 por token, mas 2 expertos compartidos. Emplea un esquema de atencion hibrida que combina capas de atencion local y global, y es nativamente multimodal: procesa texto, imagen y audio. La model card del espejo menciona modulos especificos de codificacion de vision y audio, que en esta version cuantizada permanecen en BF16.

Sobre el entrenamiento no se dispone de informacion en los materiales consultados: no hay datos sobre numero de tokens, composicion del dataset, fases de RLHF o DPO, ni innovaciones de decodificacion. Tampoco se documenta el proceso de calibracion de la cuantizacion NVFP4 mas alla de la descripcion del formato. Segun la descripcion de terceros recogida en Lambda.ai a proposito de la familia Inkling, el modelo mapearia texto, imagenes, video y audio a una representacion compartida procesada por el mismo tronco; esta afirmacion corresponde al modelo de mayor tamano y no se detalla para Inkling-Small en la informacion disponible.

El formato NVFP4 combina un codebook E2M1 de 4 bits con escalas FP8 (E4M3) por micro-bloques de 16 elementos, lo que permite escalas fraccionarias en lugar de potencias de dos y explota los multiplicadores FP4 nativos de los Tensor Cores Blackwell con acumulacion en FP32.

## Capacidades

- Generacion de texto y razonamiento complejo, con resultados publicados en GPQA Diamond y HLE.
- Generacion y edicion de codigo, con enfasis en tareas de ingenieria de software real (SWE-bench Verified y SWE-bench Pro).
- Ejecucion de tareas en terminal y entornos de linea de comandos (Terminal-Bench 2.1).
- Razonamiento cientifico y computacional (SciCode).
- Uso de herramientas y function calling, con soporte documentado de MCP (MCP Atlas) y Toolathlon.
- Navegacion web y busqueda con contexto (BrowseComp).
- Entrada multimodal: texto, imagen y audio en formato WAV de 16 kHz.
- Capacidad agentica multi-paso, reflejada en los benchmarks de tareas con herramientas.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Resolucion automatica de issues en repositorios: el modelo puede leer un repositorio, localizar el fallo, editarlo y validarlo, un escenario directamente alineado con su resultado de 80,2 en SWE-bench Verified.
- Agentes de terminal y automatizacion de infraestructura: ejecucion de comandos, diagnostico de errores y reparacion de scripts, apoyandose en su rendimiento en Terminal-Bench 2.1.
- Asistentes de atencion al cliente multimodales: al aceptar imagen y audio ademas de texto, puede gestionar consultas con capturas de pantalla, fotos de producto o notas de voz.
- Analisis de documentos escaneados y facturas: extraccion y razonamiento sobre texto e imagen en un mismo paso, sin pipeline OCR separado.
- Agentes conectados a herramientas empresariales mediante MCP: orquestacion de llamadas a APIs y sistemas internos en flujos multi-paso.
- Investigacion y sintesis web: navegacion con contexto largo para recopilar y resumir informacion de multiples fuentes.
- Copiloto de codigo en CI/CD: revision de pull requests, generacion de tests y triaje de fallos de build integrado en el pipeline.
- Transcripcion y analisis de audio en 16 kHz: notas de reunion, dictado tecnico o clasificacion de llamadas.
- Servicio de inferencia de alto rendimiento en FP4: despliegue con SGLang o vLLM para reducir coste por token frente al checkpoint BF16.

## Benchmarks y rendimiento

Los siguientes resultados corresponden al modelo base en precision completa (thinkingmachines/Inkling-Small), no al checkpoint NVFP4. No se han publicado evaluaciones del modelo cuantizado en la informacion disponible.

| Benchmark | Inkling-Small |
|---|---|
| SWE-bench Verified | 80,2 |
| SWE-bench Pro (Public) | 55,9 |
| Terminal-Bench 2.1 (mejor harness) | 64,7 |
| SciCode | 48,7 |
| GDPval-AA v2 | 1269 |
| MCP Atlas (public) | 79,6 |
| BrowseComp (con contexto) | 77,4 |
| Toolathlon Verified | 54,4 |
| GPQA Diamond | 89,5 |
| HLE (solo texto) | 31,6 |
| HLE (con herramientas) | 47,8 |

## Requisitos de hardware

- Pesos en disco: ~171 GB en formato NVFP4 con safetensors.
- VRAM estimada para inferencia: en torno a 166-171 GB solo para pesos, mas la cache KV (no cuantizada) y activaciones, que crecen con la longitud de contexto y el numero de peticiones concurrentes.
- Configuracion de referencia de los autores: tensor parallel 4, es decir 4 GPUs de 80 GB (H100/H200, 320 GB agregados) cubren pesos y margen para cache KV.
- GPU Blackwell recomendadas: B200/GB200 (192 GB por GPU); 2 unidades permiten alojar el modelo con holgura. La aceleracion nativa de FP4 requiere Tensor Cores Blackwell, por lo que en Hopper u otras arquitecturas la ventaja de rendimiento del formato se pierde aunque el checkpoint siga cargandose.
- GPU de consumo: no cabe en una unica GPU de consumo. En una RTX 5090 (32 GB) habria que repartir el modelo entre al menos 6 unidades, una configuracion poco practica.
- Opciones de despliegue: SGLang (`python3 -m sglang.launch_server --model-path AxionML/Inkling-Small-NVFP4 --tp 4 --trust-remote-code`), vLLM (`vllm serve` con `--tensor-parallel-size 4 --trust-remote-code`) y TokenSpeed. Los tres requieren `trust-remote-code`.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AxionML/Inkling-Small-NVFP4 | 276B totales / 12B activos (156B en safetensors) | no disponible | NVFP4 grupo 16 | Apache 2.0 + AUP | Espejo en HuggingFace |
| thinkingmachines/Inkling-Small-NVFP4 | 276B totales / 12B activos | no disponible | NVFP4 grupo 16 | Apache 2.0 + AUP | Repositorio original de la cuantizacion |
| thinkingmachines/Inkling-Small | 276B totales / 12B activos | no disponible | BF16 (sin cuantizar) | Apache 2.0 + AUP | Modelo base en HuggingFace |
| thinkingmachines/Inkling-NVFP4 | no disponible | no disponible | NVFP4 | no disponible | Version de mayor tamano de la familia Inkling |

## Limitaciones y advertencias

- Sesgos y contenido toxico: la model card advierte de que el modelo base se entreno con datos que pueden contener lenguaje toxico y sesgos sociales, heredados por la version cuantizada.
- Alucinacion: no se documentan tasas especificas, pero el propio aviso del autor senala que puede generar contenido inexacto, sesgado u ofensivo.
- Ausencia de evaluaciones del checkpoint cuantizado: los benchmarks publicados son del modelo en precision completa; no hay datos que cuantifiquen la degradacion introducida por NVFP4.
- Discrepancia de parametros: el recuento de safetensors (156.032.140.138) no coincide con los 276B declarados en la model card; conviene tratar la cifra de almacenamiento y la de arquitectura como magnitudes distintas.
- Idiomas y contexto: no se declara la lista de idiomas soportados ni la longitud de contexto, lo que impide validar de antemano casos de uso con requisitos largos de contexto o idiomas concretos.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero queda sujeto a la Acceptable Use Policy de Thinking Machines, que anade condiciones de uso aceptable.
- Dependencia de hardware Blackwell: el formato NVFP4 solo se aprovecha de forma nativa en GPUs Blackwell; en otras plataformas el coste de descompresion puede anular la ventaja.
- Requiere `trust-remote-code`: tanto SGLang como vLLM necesitan ejecutar codigo remoto del repositorio, lo que implica revisar la procedencia del checkpoint antes de llevarlo a produccion.
- Naturaleza del repositorio: es un espejo sin modificaciones; cualquier problema de calidad, seguridad o soporte debe dirigirse al repositorio original de Thinking Machines.

## Enlaces

- Repositorio espejo: https://huggingface.co/AxionML/Inkling-Small-NVFP4
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-Small
- Cuantizacion original NVFP4: https://huggingface.co/thinkingmachines/Inkling-Small-NVFP4
- Modelo de mayor tamano de la familia: https://huggingface.co/thinkingmachines/Inkling-NVFP4
- Politica de uso aceptable: https://thinkingmachines.ai/model-acceptable-use-policy
- NVIDIA Model Optimizer: https://github.com/NVIDIA/Model-Optimizer
- Receta de SGLang: https://docs.sglang.io/cookbook/autoregressive/ThinkingMachines/Inkling-Small
- Receta de vLLM: https://recipes.vllm.ai/thinkingmachines/Inkling-Small
- Receta de TokenSpeed: https://lightseek.org/tokenspeed/recipes/models#Inkling
- Ficha en Lambda.ai: https://lambda.ai/inference-models/thinkingmachines/inkling-nvfp4
- Ficha en FriendliAI: https://friendli.ai/models/winterthurquants/Inkling-Small-NVFP4
- Ficha en LLM Explorer: https://llm-explorer.com/model/thinkingmachines%2FInkling-Small-NVFP4,1WT9XZ7GG1EOlVZVuZRQOg
