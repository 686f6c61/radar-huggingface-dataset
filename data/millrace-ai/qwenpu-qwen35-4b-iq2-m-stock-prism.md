# millrace-ai/qwenpu-qwen35-4b-iq2-m-stock-prism

## Resumen

Este repositorio no es un modelo de lenguaje convencional, sino un checkpoint de investigación que empaqueta en un único archivo GGUF los pesos del modelo Qwen3.5-4B (cuantizados en UD-IQ2_M por Unsloth) junto con un circuito RISC-V RV32 con extensiones vectoriales denominado QwenPU. Lo publica millrace-ai como artefacto de reproducibilidad para un preimpreso sobre ejecución de circuitos dentro del bloque MTP de un modelo de lenguaje. El objetivo es demostrar que un circuito huésped (el modelo de juguete stories260K de Karpathy) puede ejecutarse dentro de la arquitectura del modelo anfitrión, retransmitiendo sus acciones y peticiones de caché a través de las APIs MTP del runtime.

El checkpoint declara una arquitectura `qwen35`, con anchura oculta de 2.560, 32 bloques de lenguaje más un bloque MTP que aloja el circuito, y una longitud de contexto declarada de 262.144 tokens en la cabecera del GGUF. El archivo final ocupa 5.121.315.968 bytes (unos 5,1 GB) y contiene 444 tensores con 11.840.714.242 elementos contados por el Hub, cifra que incluye relleno de ceros y el circuito compilado; los elementos reales del GGUF base son 4.205.751.296.

Su relevancia es acotada pero específica: sirve como evidencia reproducible de una técnica de co-diseño hardware/software (ejecución de un intérprete RISC-V dentro de un transformer) y como banco de pruebas para las APIs MTP de Prism b12128. No está pensado como modelo de propósito general para producción, y su validación está atada a una build concreta del runtime en Windows con CUDA 12.4.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer `qwen35` (32 bloques de lenguaje + 1 bloque MTP con circuito QwenPU RV32/vectorial) |
| Parametros totales | 11.840.714.242 elementos de tensor GGUF (incluye relleno y circuito); 4.205.751.296 elementos en el GGUF base de lenguaje |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens declarados en la cabecera del GGUF |
| Tipos de cuantizacion | UD-IQ2_M (Unsloth Dynamic IQ2_M) para los pesos de lenguaje; PQ2_0 para el embedding de acciones del circuito; tipos propios preservados en los tensores del circuito |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (archivo `Qwen3.5-4B-UD-IQ2_M-QwenPU-Stock-Prism.gguf`, 5.121.315.968 bytes, SHA-256 `d2f72c076264d28ec5e4a2d4d31a2834b8f32e09053a681b904b489c227ba519`) |

Otros datos técnicos: anchura oculta 2.560, 36.352 filas de FFN por bloque, 444 tensores totales, 18 tensores de circuito añadidos, 426 extensiones de tensor originales preservadas byte a byte. El exportador rellena con ceros las FFN de lenguaje de 9.216 a 36.352 filas para igualar la anchura compartida de FFN.

## Arquitectura y entrenamiento

El modelo base es Qwen3.5-4B de Alibaba Cloud, un transformer denso de aproximadamente 4B parámetros, cuantizado por Unsloth a UD-IQ2_M (una cuantización dinámica de 2 bits con mezcla de precisión por capa). Sobre esa base, millrace-ai añade un bloque MTP que contiene el circuito QwenPU: una máquina RISC-V RV32 con unidad vectorial, con su propio embedding de acciones en formato PQ2_0 y 18 tensores adicionales. El circuito no se entrena; se compila y se empaqueta junto a los pesos, y el bloque MTP del modelo ejecuta sus operaciones.

No hay información sobre datos de entrenamiento, número de tokens, composición del dataset ni procesos de RLHF/DPO en la información proporcionada. La innovación técnica destacable es la integración: el launcher carga el huésped y retransmite las acciones seleccionadas y peticiones de caché del circuito a través de las APIs MTP existentes en Prism b12128, de modo que el bloque MTP del modelo ejecuta el circuito. El checkpoint requiere soporte para tipos de tensor mixtos (incluido PQ2_0) y para las APIs de feedback y caché MTP para poder portarse.

## Capacidades

- Generación de texto conversacional heredada de Qwen3.5-4B (pipeline `text-generation`, tag `conversational`).
- Ejecución de un huésped RISC-V RV32 con extensiones vectoriales dentro del bloque MTP (circuito QwenPU).
- Retransmisión de acciones y peticiones de caché del circuito mediante las APIs MTP del runtime.
- Handoff de estado de texto entre el circuito huésped y el checkpoint Qwen original (verificado en las pruebas).
- Caché firmada F16 para el contexto del huésped (hasta 65.536 celdas en la ventana acotada probada).
- Compatibilidad con endpoints (`endpoints_compatible` en los tags).
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo thinking en la información disponible.

## Casos de uso

- Reproducción de investigación: ejecutar el preimpreso de millrace.ai y sus artefactos fijados para validar la ejecución de un circuito RISC-V dentro de un transformer, usando el GGUF y el runtime Prism b12128 exactos.
- Verificación de correctitud de runtime: comparar retirements arquitectónicos y escrituras ordenadas del huésped contra una referencia de CPU (se documentan 37.080 retirements y 55.375 escrituras en la verificación completa).
- Banco de pruebas de APIs MTP: validar implementaciones de feedback y caché MTP en runtimes derivados de llama.cpp, comprobando el handoff de estado entre circuito y modelo de lenguaje.
- Desarrollo de técnicas de co-diseño hardware/software: usar el checkpoint como donante de circuito para construir otros checkpoints combinados (el propio autor lo usa como donante en Bonsai 4B).
- Docencia y demostración: mostrar de forma tangible cómo un modelo de lenguaje puede alojar un intérprete de instrucciones y ejecutar un programa guest (stories260K) que imprime "Once upon a".
- Pruebas de cuantización extrema: evaluar el comportamiento de UD-IQ2_M con relleno de FFN y tipos de tensor mixtos en un pipeline real de inferencia en GPU.
- Validación de memoria en GPUs antiguas: medir consumo de VRAM y RAM con un presupuesto conocido (5,73 GiB de VRAM dedicada y 5,72 GiB de RAM en las capturas documentadas) en una GTX 1080.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Los datos de rendimiento publicados son de validación del circuito y tiempos de ejecución:

| Prueba | Resultado |
|---|---|
| Control solo de relleno | Coincidencia bit a bit con los logits, KV y estado recurrente originales de UD-IQ2_M en historiales seriales y por lotes hasta 64 tokens |
| Fixtures escalares y vectoriales | 316 retirements y 307 escrituras ordenadas coincidentes con la referencia de CPU |
| Prefijo original stories260K | 2.578 retirements y 2.760 escrituras ordenadas exactas |
| Ventana de historia acotada | 82.090 decodificaciones en 518,78 s (158,2 decodificaciones/s) |
| Verificación completa de tres tokens | 37.080 retirements arquitectónicos y 55.375 escrituras del huésped coincidentes; 8 h 13 min 40 s de captura incluyendo setup; 170,7 decodificaciones/s en el bucle posterior a la siembra |
| Operaciones VMAT verificadas | 726 |
| Pico de memoria (ventana de historia) | 5,73 GiB VRAM dedicada de proceso, 84 MiB VRAM compartida, 7,29 GiB VRAM de dispositivo, 5,72 GiB RAM de proceso |
| Pico de memoria (verificación completa) | 5,73 GiB VRAM dedicada, 84 MiB compartida, 6,72 GiB VRAM de dispositivo, 5,72 GiB RAM |
| Celdas vivas en ventana acotada | 55.720 en un contexto huésped F16 de 65.536 celdas |

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 5,7-7,3 GiB de VRAM de dispositivo según las capturas documentadas con UD-IQ2_M y el circuito cargado.
- RAM de proceso: aproximadamente 5,72 GiB de working set.
- GPU validadas: GTX 1080 (Pascal, la única documentada explícitamente en las pruebas). No se documentan pruebas en A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: sí, al menos en GTX 1080 con 8 GB. El tamaño del archivo (5,1 GB) y el pico de VRAM medido lo permiten en GPUs de 8 GB o más.
- Opciones de despliegue: exclusivamente el runtime Prism b12128 para Windows con CUDA 12.4 (build `d7b28968306207fd176e7ff10796ccb6be607865`), con los dos archivos ZIP oficiales (aplicación y runtime CUDA) extraídos en el mismo directorio. No se documenta compatibilidad con vLLM, llama.cpp estándar, Ollama ni TGI; el propio autor indica que portarlo requiere soporte para tipos de tensor mixtos (PQ2_0) y las APIs MTP.
- Latencia y throughput: 158,2 decodificaciones/s en la ventana de historia acotada y 170,7 decodificaciones/s en el bucle posterior a la siembra, medidos en GTX 1080.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Propósito |
|---|---|---|---|---|---|
| millrace-ai/qwenpu-qwen35-4b-iq2-m-stock-prism | 4,2B elementos base (11,8B contando relleno y circuito) | 262.144 tokens | GGUF UD-IQ2_M + circuito | Apache 2.0 | Checkpoint de investigación con circuito RISC-V embebido |
| unsloth/Qwen3.5-4B-GGUF | ~4B | no disponible en la información | GGUF (incluye UD-IQ2_M) | Apache 2.0 (heredada) | Modelo de lenguaje cuantizado de propósito general |
| millrace-ai/qwenpu-bonsai-4b-stock-prism | no disponible | no disponible | GGUF + circuito | no disponible en la información | Checkpoint hermano, donante del circuito QwenPU |

La comparación con modelos de propósito general no es directa: este checkpoint añade un intérprete RISC-V y relleno de FFN que inflan el recuento de elementos, y su validación está atada a un runtime concreto. Frente al Qwen3.5-4B-GGUF de Unsloth, la diferencia principal es la presencia del circuito y del bloque MTP, no una mejora en capacidades de lenguaje.

## Limitaciones y advertencias

- No es un modelo para producción: es un checkpoint de investigación cuya validación es específica de Prism b12128 en Windows con CUDA 12.4.
- El recuento de 11,8B elementos del Hub incluye relleno de ceros y el circuito compilado; no debe interpretarse como tamaño efectivo del modelo de lenguaje.
- El relleno de FFN de 9.216 a 36.352 filas altera la geometría original de los tensores, aunque las 426 extensiones originales se preservan byte a byte.
- Requiere soporte de tipos de tensor mixtos (PQ2_0) y de las APIs de feedback y caché MTP; los runtimes estándar de llama.cpp no lo cargarán.
- No hay información sobre sesgos, riesgo de alucinación ni comportamiento multilingüe del modelo de lenguaje en la información proporcionada.
- Los idiomas soportados no están documentados.
- La licencia Apache 2.0 permite uso comercial del artefacto, pero el autor no ofrece garantías de correctitud fuera del entorno validado; el uso en producción sin validación propia es desaconsejable.
- El launcher comprueba hashes del GGUF, ELF, probe y DLLs del runtime, y se detiene en el retirement 2.578; no es un servidor de inferencia general.
- El contexto declarado de 262.144 tokens es una cabecera del GGUF; las pruebas documentadas solo cubren ventanas de 64 tokens y 65.536 celdas del huésped.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/millrace-ai/qwenpu-qwen35-4b-iq2-m-stock-prism
- Preimpreso v1 y artefactos de reproducción: https://research.millrace.ai/bonsai-qwenpu/
- GGUF base fijado (Unsloth Qwen3.5-4B UD-IQ2_M): https://huggingface.co/unsloth/Qwen3.5-4B-GGUF/blob/e87f176479d0855a907a41277aca2f8ee7a09523/Qwen3.5-4B-UD-IQ2_M.gguf
- Checkpoint donante del circuito (Bonsai 4B): https://huggingface.co/millrace-ai/qwenpu-bonsai-4b-stock-prism
- Evidencia de traza, handoff y recursos: https://github.com/tim-osterhus/qwenpu-bonsai/blob/d1bdc3f10e405494ee59f0f05262d2f476ac1204/results/forward/standard-layer/evidence-snapshot.json
- Repositorio qwenpu-bonsai: https://github.com/tim-osterhus/qwenpu-bonsai
- Runtime Prism b12128 (aplicación Windows CUDA 12.4): https://github.com/PrismML-Eng/llama.cpp/releases/download/prism-b12128-d7b2896/llama-prism-b12128-d7b2896-bin-win-cuda-12.4-x64.zip
- Runtime CUDA de Prism b12128: https://github.com/PrismML-Eng/llama.cpp/releases/download/prism-b12128-d7b2896/cudart-llama-bin-win-cuda-12.4-x64.zip
- Repositorio de Prism ML (llama.cpp): https://github.com/PrismML-Eng/llama.cpp
