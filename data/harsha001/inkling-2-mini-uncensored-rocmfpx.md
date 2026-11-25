# Harsha001/Inkling-2-Mini-Uncensored-ROCmFPX

## Resumen

Inkling 2 Mini Uncensored ROCmFPX es una cuantización GGUF del modelo Inkling 2 Mini de Thinking Machines, adaptada específicamente para GPUs AMD (Vulkan y ROCm) mediante los formatos de pesos propietarios del fork ROCmFPX. El modelo original es un transformer con arquitectura de mezcla de expertos (MoE) de 26.065.943.137 parámetros totales, 24 capas y 128 expertos por capa con 8 activos por token (aproximadamente 3.1B parámetros activos por pasada de capa). Es un modelo "looped": las capas 6 a 17 se ejecutan tres veces por token, de modo que cada token atraviesa 48 capas efectivas.

La versión publicada por Harsha001 incorpora el edit de "uncensoring" de AtomicChat, un LoRA de rango 1 aplicado sobre la salida de atención y los expertos enrutados de las 24 capas, además del embedding de tokens, que elimina la dirección de rechazo de cada capa. Según las mediciones de AtomicChat, el modelo resultante no rechaza peticiones dañinas en inglés ni ruso (el original rechazaba entre el 91% y el 100%) y mantiene un 79,15% en MMLU frente al 80,65% del original.

La relevancia de esta ficha es doble: por un lado, documenta un MoE de 26B con solo ~3.1B activos, eficiente en inferencia; por otro, muestra un caso práctico de cuantización de baja precisión orientada a hardware AMD consumer (Strix Halo, Radeon 8060S) con formatos ROCmFPX que no son compatibles con llama.cpp estándar. El repo ocupa 106,4 GB y contiene tres archivos GGUF de 26,9 GB, 21,6 GB y 15,5 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con capas recurrentes (looped): 24 capas, capas 6-17 ejecutadas 3 veces por token (48 pasadas efectivas) |
| Parametros totales | 26.065.943.137 |
| Parametros activos | ~3.1B por pasada de capa (128 expertos por capa, 8 activos por token) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0_ROCMFPX (8 bits), Q6_K_ROCMFPX (expertos 6 bits, resto 8 bits), Q4_0_ROCMFP4_STRIX_O8 (expertos ROCmFP4, resto 8 bits) |
| Idiomas soportados | no disponible (la model card menciona pruebas en inglés y ruso del edit de uncensoring) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF con formatos ROCmFPX (requiere el fork ROCmFPX de llama.cpp) |
| Tamano del repo | 106,4 GB |
| Modelo base | thinkingmachines/Inkling-2-Mini y AtomicChat/Inkling-2-Mini-Uncensored-GGUF |
| Modalidad | Solo texto (sin encoder de visión ni drafter de predicción multi-token) |

## Arquitectura y entrenamiento

El modelo original de Thinking Machines emplea una arquitectura MoE con 24 capas y 128 expertos por capa, de los cuales 8 se activan por token. La innovación estructural principal es el esquema "looped": las capas 6 a 17 se reutilizan tres veces por token, lo que eleva el cómputo efectivo a 48 capas sin incrementar el número de parámetros. Con 26,1B parámetros totales pero solo ~3,1B activos por pasada de capa, el coste de inferencia se aproxima al de un modelo denso de 3B, mientras que la capacidad de representación se acerca a la de un 26B.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo original. El edit de uncensoring de AtomicChat es un LoRA de rango 1 aplicado sobre la salida de atención y los expertos enrutados de las 24 capas, más el embedding de tokens; en esta publicación se fusiona a fuerza 1 en el checkpoint original en precisión completa. Los archivos publicados son cuantizaciones de ese modelo fusionado, no el modelo completo en precisión nativa. El fork ROCmFPX añade formatos de pesos propios (ROCMIQ2_XXS de 2,06 bits por peso y ROCMIQ1_S de 1,56 bits por peso) aunque esta ficha no incluye archivos ROCmIQ: el autor indica que los modelos MoE como este aún están en verificación para esos formatos.

## Capacidades

- Generación de texto conversacional multi-turno, con formato de chat Inkling parseado en el fork ROCmFPX (con `--jinja` el "thinking" se devuelve separado de la respuesta).
- Razonamiento y respuesta a instrucciones, heredado del modelo base Inkling 2 Mini.
- Soporte de tool calling / function calling: el parser del fork ROCmFPX procesa las llamadas a herramientas del formato Inkling.
- Modo "thinking" separado de la respuesta final (visible como campo distinto al usar `--jinja`).
- Capacidades multilingües: no documentadas en la información disponible; las pruebas del edit de uncensoring se hicieron en inglés y ruso.
- Sin capacidades de visión: el encoder visual del modelo original no está incluido en esta publicación.
- Sin drafter de predicción multi-token: no se incluye decodificación especulativa.
- Comportamiento "uncensored": responde a peticiones que el modelo original rechaza, por eliminación de la dirección de rechazo en cada capa.

## Casos de uso

- Inferencia local en GPUs AMD consumer: el archivo Q4_0 de 15,5 GB cabe en GPUs AMD de 24 GB y en Strix Halo (Radeon 8060S) con espacio para contexto largo, lo que permite ejecutar un MoE de 26B en hardware integrado.
- Estaciones de trabajo con Strix Halo: el Q8_0 de 26,9 GB aprovecha los 32 GB de memoria unificada de las APU Strix Halo para obtener la máxima calidad de cuantización sin GPU dedicada.
- Despliegue con Vulkan o ROCm: el fork ROCmFPX permite usar backend Vulkan (portable en GPUs AMD) o ROCm (rendimiento nativo en CDNA/RDNA), útil en entornos donde no hay CUDA.
- Asistentes conversacionales sin filtros de rechazo: para investigación sobre alineación, evaluación de sesgos o generación de contenido creativo sin restricciones, con la advertencia de responsabilidad que indica el autor.
- Pipelines de agentes con tool calling: el parser Inkling del fork permite integrar el modelo en flujos de agentes que requieren llamadas a funciones y separación entre razonamiento y respuesta.
- Evaluación comparativa de cuantizaciones: los tres archivos publicados (Q8, Q6_K, Q4) con métricas de perplejidad y KL documentadas permiten medir el impacto de la precisión en un MoE sobre hardware AMD.
- Prototipado de bajo coste: con ~3,1B parámetros activos por pasada, el throughput es superior al de un denso de 26B, adecuado para iteración rápida en local.

## Benchmarks y rendimiento

Datos de calidad de cuantización publicados por el autor (perplejidad sobre wikitext-2, 40 fragmentos de 512 tokens, CPU; KL frente al modelo fusionado en precisión completa; "same top token" = coincidencia del token más probable con la referencia):

| Build | Tamano | Perplejidad | KL a referencia | Same top token |
|---|---:|---:|---:|---:|
| Referencia fusionada (no publicada) | 50,5 GB | 6,775 | — | — |
| Modelo original (no publicado) | 22,9 GB | 6,743 | — | — |
| Q8_0_ROCMFPX | 26,9 GB | 6,758 | 0,0039 | 97,4% |
| Q6_K_ROCMFPX | 21,6 GB | 6,777 | 0,0046 | 96,9% |
| Q4_0_ROCMFP4_STRIX_O8 | 15,5 GB | 6,799 | 0,0119 | 95,2% |

El autor indica que el coste de cuantización es equivalente al de los archivos censurados previos (Q8 0,0039; 4 bits 0,0120 frente a su propia referencia) y que el edit de uncensoring eleva la perplejidad de wikitext en torno al 0,5% (6,743 → 6,775).

Resultados del edit de uncensoring de AtomicChat citados en la model card: 0 rechazos en sus prompts dañinos de prueba en inglés y ruso (el original rechazaba entre el 91% y el 100%), 0 rechazos en los prompts seguros de XSTest (el original rechazaba el 4%), y MMLU 79,15% frente a 80,65% del original.

Datos de rendimiento del formato ROCmIQ (modelo denso de 4B de prueba, Strix Halo con Vulkan, no de este modelo):

| Build 2-bit | Tamano | Perplejidad | Prompt tok/s | Generación tok/s |
|---|---:|---:|---:|---:|
| stock IQ2_XXS | 1,33 GB | 96,7 | 1846 | 95,4 |
| ROCMIQ2_XXS | 1,35 GB | 49,6 | 1734 | 88,7 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) para esta cuantización concreta más allá de los datos de MMLU del edit de AtomicChat.

## Requisitos de hardware

- VRAM estimada para inferencia: 15,5 GB (Q4_0 ROCmFP4), 21,6 GB (Q6_K) y 26,9 GB (Q8_0), según los tamaños de archivo publicados.
- GPUs recomendadas: Strix Halo (Radeon 8060S, memoria unificada de 32 GB), GPUs AMD de 24-32 GB; el autor menciona explícitamente "32 GB AMD GPUs" para el Q8 y "24 to 32 GB AMD GPUs" para el Q6_K.
- Cabe en GPU consumer AMD: sí, el Q4_0 en 24 GB y en Strix Halo; el Q8_0 requiere 32 GB.
- Backends: Vulkan y ROCm mediante el fork ROCmFPX de llama.cpp (rama `inkling2-mini`). No es compatible con llama.cpp estándar ni con los formatos GGUF convencionales.
- Latencia y throughput: no disponibles para este modelo concreto. El autor solo publica tok/s para un modelo denso de 4B de prueba con formatos ROCmIQ, no para este MoE.
- Opciones de despliegue: llama.cpp (fork ROCmFPX) con `llama-bench` y `llama-quantize`; no se documenta soporte en vLLM, TGI, Ollama ni otros motores.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Licencia | Formato / disponibilidad |
|---|---:|---:|---|---|---|
| Inkling 2 Mini Uncensored ROCmFPX (esta ficha) | 26,07B | ~3,1B por pasada | no disponible | Apache 2.0 | GGUF ROCmFPX (fork), solo AMD |
| Inkling 2 Mini (original, thinkingmachines) | 26,07B | ~3,1B por pasada | no disponible | no disponible en la información | Pesos originales, incluye visión y drafter |
| Inkling 2 Mini Uncensored GGUF (AtomicChat) | 26,07B | ~3,1B por pasada | no disponible | Apache 2.0 (según esta ficha) | GGUF estándar |
| Modelos MoE de ~3B activos comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks estándar ni de especificaciones de contexto para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Modelo "uncensored": responde a peticiones que el original rechaza; el autor declara explícitamente que la responsabilidad de uso recae en el usuario.
- El edit de uncensoring degrada ligeramente el rendimiento: MMLU baja de 80,65% a 79,15% y la perplejidad de wikitext sube ~0,5%.
- Solo texto: no incluye el encoder de visión ni el drafter de predicción multi-token del modelo original.
- Compatibilidad restringida: los pesos usan formatos ROCmFPX y requieren el fork de llama.cpp del autor; no funcionan en llama.cpp upstream, vLLM, TGI ni Ollama.
- Orientado a hardware AMD: no hay soporte documentado para CUDA/NVIDIA en esta publicación.
- Idiomas soportados no documentados; las pruebas del edit se limitaron a inglés y ruso.
- Longitud de contexto no disponible en la información proporcionada.
- Riesgo de alucinación inherente a modelos de lenguaje; no se han publicado evaluaciones específicas de factualidad para esta cuantización.
- Los archivos ROCmIQ de baja precisión (2,06 y 1,56 bits por peso) no están incluidos para este modelo MoE, que aún está en verificación.
- El repositorio ocupa 106,4 GB; la descarga completa no es necesaria si solo se usa un archivo.
- Los nombres de archivo empiezan por tipos estándar (Q8_0, Q6_K, Q4_0) solo para ordenar por anchura de bits; no son cuantizaciones GGUF estándar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Harsha001/Inkling-2-Mini-Uncensored-ROCmFPX
- Modelo base original: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Edit de uncensoring de AtomicChat: https://huggingface.co/AtomicChat/Inkling-2-Mini-Uncensored-GGUF
- Fork ROCmFPX (rama inkling2-mini): https://github.com/HarshaVardhan3002/ROCmFPX/tree/inkling2-mini
- Fork ROCmFPX (rama rocmfpx-sub2, formatos ROCmIQ): https://github.com/HarshaVardhan3002/ROCmFPX/tree/rocmfpx-sub2
- Repositorio ROCmFPX principal: https://github.com/HarshaVardhan3002/ROCmFPX
