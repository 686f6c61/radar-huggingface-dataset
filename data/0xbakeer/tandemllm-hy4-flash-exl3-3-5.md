# 0xBakeer/TandemLLM-Hy4-flash-EXL3-3.5

## Resumen

TandemLLM-Hy4-flash-EXL3-3.5 es una cuantizacion EXL3 de 3,56 bits por peso (en promedio sobre las capas cuantizadas) del modelo Hy4-flash de Tencent. Lo publica el usuario 0xBakeer bajo el paraguas del proyecto TandemLLM, que mantiene su propio motor de inferencia (TandemEngine) para servir estos pesos. El checkpoint resultante ocupa 112,4 GB y se ha convertido desde el original en BF16 (`tencent/Hy4-flash`, revision `d88c9dfd`) con exllamav3 1.6.7 y un parche que anade soporte para la arquitectura y para las tablas Engram.

El modelo base es un transformer mixto de 42 capas: una capa densa y 41 capas mixture-of-experts con 512 expertos enrutados por capa (16 activos por token) mas un experto compartido. Segun la model card de Tencent, el modelo declara 220B parametros, de los cuales 63,5B estan en las tablas Engram y 11,3B se activan por token de texto. Incorpora ademas un drafter DFly2 de 5 capas embebido para decodificacion especulativa y lee hasta 1.048.576 tokens de contexto (TandemEngine sirve hasta 262.144).

La relevancia de esta ficha es practica: permite ejecutar un MoE de gran tamano en una unica maquina con 128 GB de memoria unificada (DGX Spark GB10) a velocidades de 22-28 tok/s, algo impensable con el checkpoint BF16 completo. Es, sin embargo, un artefacto muy especializado: requiere un motor no estandar, un parche sobre exllamav3 y una licencia propia de Tencent, por lo que su adopcion en produccion exige validacion cuidadosa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido: 1 capa densa + 41 capas MoE, con tablas Engram en 4 capas y drafter DFly2 de 5 capas |
| Parametros totales | 35.651.457.334 en el checkpoint safetensors (el modelo base declara 220B, 63,5B en tablas Engram) |
| Parametros activos | 11,3B por token de texto (modelo base) |
| Longitud de contexto | 1.048.576 tokens en el modelo base; 262.144 servidos por TandemEngine |
| Tipos de cuantizacion | EXL3 3,56 bits/peso promedio; expertos enrutados e indexer a 3,5 bits; atencion, expertos compartidos, proyecciones latentes y densas, cabeza de salida y torre de vision a 5 bits; MLPs del drafter a 3 bits; tablas Engram a 5 bits; embeddings, norms y proyecciones Engram en BF16; router en fp16 |
| Idiomas soportados | no disponible |
| Licencia | tencent-hy-license (license: other) |
| Formato de pesos | safetensors (EXL3, libreria exllamav3) |

## Arquitectura y entrenamiento

El modelo base Hy4-flash de Tencent combina una capa densa inicial con 41 capas de mezcla de expertos. Cada capa MoE contiene 512 expertos enrutados, de los que se activan 16 por token, mas un experto compartido. Cuatro de las capas anaden filas provenientes de tablas Engram: una busqueda hasheada sobre los dos y tres ultimos tokens con aproximadamente 165 millones de filas de 96 valores cada una, lo que constituye una forma de memoria asociativa discreta integrada en el forward. El modelo incluye tambien una torre de vision (cuantizada a 5 bits en este pack) y un drafter DFly2 de 5 capas para decodificacion especulativa.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en la informacion proporcionada. La model card del pack se centra en el proceso de cuantizacion: conversion desde BF16 con exllamav3 1.6.7 y un parche anadido en `convert/` que implementa la arquitectura y la carga de tablas Engram, pero que no incluye generador. La evaluacion de calidad se hizo contra un forward sin cache del checkpoint original con logits en fp16, sobre 16 filas de 2.048 tokens (32.768 posiciones) en dos conjuntos: wikitext-2 dentro de una plantilla de chat y conversaciones de UltraChat.

## Capacidades

- Generacion de texto y conversacion multi-turno con plantilla de chat propia y modo "thinking" desactivable.
- Razonamiento y codigo: la model card documenta su uso como agente de programacion en opencode generando paginas 3D animadas en HTML/JS.
- Capacidades de vision por la torre de vision incluida en el checkpoint (cuantizada a 5 bits).
- Decodificacion especulativa con el drafter DFly2 embebido, ademas de lookup en TandemEngine y seleccion de tamano de bloque mediante StairCut.
- Memoria asociativa via tablas Engram sobre los ultimos dos y tres tokens.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo de razonamiento de esfuerzo configurable (`xhigh` en los ejemplos documentados).

## Casos de uso

- Despliegue de un MoE de gran tamano en hardware de una sola maquina: con 112,4 GB de pesos y 128 GB de memoria unificada en un DGX Spark GB10, el pack permite servir el modelo sin cluster ni sharding, a 22,75-23,05 tok/s en modo simple y 27,70-28,08 tok/s con DFly2 mas lookup.
- Agente de programacion autonomo: la model card documenta su uso en opencode con esfuerzo de razonamiento `xhigh` y hasta 32.768 tokens de respuesta por turno, generando paginas web 3D interactivas completas desde un prompt en lenguaje natural.
- Generacion de codigo front-end y prototipado visual: la combinacion de torre de vision y generacion de codigo permite iterar sobre artefactos HTML/JS/CSS a partir de descripciones o referencias visuales.
- Asistentes conversacionales de contexto largo: con 262.144 tokens servidos por TandemEngine y 1.048.576 en el modelo base, es adecuado para conversaciones con historial extenso o documentos largos insertados en el prompt (la prueba de velocidad usa un prompt de 3.565 tokens).
- Experimentacion en cuantizacion e investigacion de inferencia: el pack incluye resultados reproducibles de KL y top-1 frente al modelo sin cuantizar (`quality/kl2-chat2048.json`, `quality/kl2-conv2048.json`), utiles para estudiar el impacto de EXL3 a 3,56 bits en arquitecturas MoE con Engram.
- Evaluacion comparativa de cuantizaciones: el autor publica dos packs (3,56 y 3,08 bits) con metricas de calidad y tamano, lo que permite medir el compromiso entre huella de memoria (8,65 GiB de diferencia) y fidelidad al modelo original.
- Procesamiento por lotes en local con memoria unificada: aunque no se han medido escenarios con mas de una peticion simultanea, el modelo cabe integramente en el DGX Spark y puede servir como backend de tareas batch sin GPU dedicada de gran VRAM.

## Benchmarks y rendimiento

Calidad frente al modelo sin cuantizar (referencia: forward sin cache del checkpoint `d88c9dfd`, logits en fp16; 16 filas de 2.048 tokens por conjunto):

| Conjunto | KL media | KL mediana | top-1 | top-5 | Perplejidad referencia | Perplejidad pack |
|---|---|---|---|---|---|---|
| chat2048 (wikitext-2, filas 70-85, plantilla chat, thinking off) | 0,0653 | 0,0187 | 90,54 % | 99,58 % | 8,12 | 8,32 |
| conv2048 (UltraChat test, 16 conversaciones, thinking off) | 0,0729 | 0,0033 | 93,75 % | 99,42 % | 7,42 | 7,45 |

Suelo metodologico del autor: dos forwards correctos no coinciden exactamente; su forward frente al codigo transformers en FP32 dio KL 0,0031 y top-1 98,68 %, y el codigo en BF16 frente a si mismo en FP32 dio KL 0,0045 y top-1 97,95 %. En conv2048, la mitad de las posiciones estan por debajo de KL 0,0033 y el peor 1 % supera 1,23.

Comparativa entre packs EXL3 del mismo autor:

| Pack | Bits | Descarga (GB) | KL chat2048 | top-1 chat2048 | KL conv2048 | top-1 conv2048 |
|---|---|---|---|---|---|---|
| EXL3 3.5 (este) | 3,56 | 112,4 | 0,065 | 90,5 % | 0,073 | 93,8 % |
| EXL3 3.0 | 3,08 | 103,1 | 0,099 | 88,5 % | 0,111 | 92,1 % |

Rendimiento en un DGX Spark (GB10, 128 GB) con TandemEngine, ruta `/v1/chat/completions` con streaming, una peticion a la vez, prompt de 3.565 tokens, 600 tokens greedy, ventana completa de 262.144 tokens:

| Modo | tok/s peticion 1 | tok/s peticion 2 |
|---|---|---|
| Simple | 22,75 | 23,05 |
| DFly2 + lookup | 27,70 | 28,08 |

Tiempo hasta el primer token: 30,19 y 27,37 s en simple; 31,08 y 28,10 s con drafter. Arranque completo: 105,8 y 106,8 s, de los cuales 77,2 y 77,4 s corresponden a carga de pesos. Las cuatro respuestas fueron identicas token a token. No se midieron modo thinking activo, otros tipos de peticion ni concurrencia mayor que uno.

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria: 112,4 GB de pesos mas overhead de contexto; el autor lo sirve en un DGX Spark GB10 con 128 GB de memoria unificada y ventana de 262.144 tokens.
- GPU recomendadas: DGX Spark (GB10, 128 GB) es el unico hardware documentado. No cabe en GPUs consumer de 24 GB (RTX 4090) ni en 48 GB; requiere al menos ~113 GB de memoria, por lo que en GPUs discretas haria falta una H100 de 80 GB en configuracion multi-GPU o una H200/B200 de 141 GB o mas.
- Cabe en consumer GPU: no, con este pack. El pack de 3,0 bits (103,1 GB) tampoco cabe en consumer.
- Opciones de despliegue: TandemEngine (motor del autor, unico que carga estos packs en la practica); exllamav3 1.6.7 con el parche de `convert/` permite conversion y scoring, pero no incluye generador. vLLM, llama.cpp, Ollama y TGI no soportan esta arquitectura segun la informacion disponible.
- Latencia y throughput: 22,75-23,05 tok/s en simple y 27,70-28,08 tok/s con DFly2 mas lookup en DGX Spark, una peticion a la vez; primer token en ~27-31 s con prompt de 3.565 tokens; arranque en ~106 s (77 s de carga de pesos).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TandemLLM-Hy4-flash-EXL3-3.5 (este) | 220B declarados / 11,3B activos | 1.048.576 (262.144 en TandemEngine) | EXL3 3,56 bpw | tencent-hy-license | Hugging Face, requiere TandemEngine |
| TandemLLM-Hy4-flash-EXL3-3.0 | 220B declarados / 11,3B activos | 1.048.576 (262.144 en TandemEngine) | EXL3 3,08 bpw | tencent-hy-license | Hugging Face, requiere TandemEngine |
| Qwen3.8-Flash-Next (pack EXL3 publico, rama `3.05bpw_h5_ng5`) | no disponible | no disponible | EXL3 3,05 bpw | no disponible | Hugging Face, usado en la comparativa del autor con su propia capa MTP como drafter |

No se dispone de datos de rendimiento en benchmarks estandar para ninguna de las tres opciones en la informacion proporcionada; la unica comparacion publicada es cualitativa (generacion de una pagina 3D en opencode) y de calidad frente al modelo sin cuantizar.

## Limitaciones y advertencias

- Requiere TandemEngine o un exllamav3 parcheado: el exllamav3 estandar no carga estos packs porque no tiene codigo para la arquitectura ni para los ficheros de tablas Engram.
- El parche de `convert/` solo permite conversion y scoring, no generacion; el autor no lo publica como motor de inferencia.
- El checkpoint safetensors declara 35,65B parametros, mientras que la model card del base declara 220B (63,5B en tablas Engram): la discrepancia debe tenerse en cuenta al planificar memoria y al interpretar el tamano del modelo.
- Perdida de fidelidad medible: KL media de 0,065 y 0,073 frente al modelo sin cuantizar, con un peor 1 % de posiciones por encima de KL 1,23 en conv2048. No es un pack indistinguible del original.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; aplican los riesgos habituales de un LLM y los del modelo base.
- Sesgos: no documentados en la informacion proporcionada.
- Idiomas: no disponibles; no se puede confirmar cobertura multilingue.
- Licencia `tencent-hy-license`: es una licencia propia de Tencent, no una licencia open source estandar. Hay que revisar `LICENSE` antes de cualquier uso comercial; el modelo base es de terceros y la cuantizacion no altera los terminos.
- Rendimiento medido con una sola peticion concurrente: no hay datos de throughput con batching ni de latencia bajo carga.
- No se midio el modo thinking activo, que puede alterar tanto la calidad como los tiempos.
- El autor advierte que las metricas KL se obtuvieron con su propio forward, no con el stack de serving de Tencent, y que el suelo metodologico de la comparacion esta en KL 0,003-0,005.
- Repositorio con muy poca traccion (6 descargas, 1 like) y creado en noviembre de 2026: no hay validacion independiente de los resultados.
- El ejemplo comparativo con opencode se ejecuto con una build de TandemEngine anterior a la release 0.17.0 y sin conductor, memoria ni servidores MCP, por lo que no representa un entorno de agente completo.

## Enlaces

- Hugging Face (este pack): https://huggingface.co/0xBakeer/TandemLLM-Hy4-flash-EXL3-3.5
- Pack EXL3 3.0 del mismo autor: https://huggingface.co/0xBakeer/TandemLLM-Hy4-flash-EXL3-3.0
- Modelo base: https://huggingface.co/tencent/Hy4-flash
- TandemEngine: https://github.com/TandemLLM/TandemEngine
- opencode (agente de codigo usado en los ejemplos): https://opencode.ai
- Dataset de ejemplo (prompt de la gasolinera neon): https://huggingface.co/datasets (enlace incompleto en la informacion proporcionada)
- Resultados de calidad: `quality/kl2-chat2048.json` y `quality/kl2-conv2048.json` dentro del repositorio
- Script de calibracion del suelo metodologico: `quality/chain.txt` dentro del repositorio
- Parche de conversion: directorio `convert/` dentro del repositorio
