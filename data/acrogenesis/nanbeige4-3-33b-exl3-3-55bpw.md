# acrogenesis/Nanbeige4.3-33B-EXL3-3.55bpw

## Resumen

Nanbeige4.3-33B-EXL3-3.55bpw es una cuantización EXL3 (ExLlamaV3) a 3,55 bits por peso del modelo Nanbeige4.3-33B, publicado por el usuario acrogenesis en Hugging Face. Se trata de un espejo byte a byte de la cuantización original de ProCreations: el equipo Nanbeige creó el modelo base y ProCreations produjo la cuantización, mientras que acrogenesis aporta presets de inferencia para RTX 5090, lanzadores y mediciones de rendimiento verificadas. El modelo es un LLM conversacional de generación de texto orientado a inglés y chino, con licencia Apache-2.0.

Su relevancia actual radica en la documentación de rendimiento medida sobre una única RTX 5090 de 32 GB: alcanza unos 115 tok/s de salida con decodificación especulativa mediante el drafter DFlash2 y contextos de hasta 180.224 tokens con KV en Q4, o hasta 480.256 tokens con KV en 2 bits sin drafter. La ventana de contexto nativa del modelo base es de 524.288 tokens (512K), según se desprende de las pruebas documentadas.

Cabe señalar una discrepancia importante: aunque el nombre indica 33B, el recuento real de parámetros en los ficheros safetensors de este repositorio cuantizado es de 8.468.585.472 parámetros almacenados (esperable en un cuantizado a 3,55 bpw, donde los pesos ocupan mucho menos que en FP16). El tamaño del modelo completo en FP16 y las especificaciones exactas de la arquitectura del modelo base no están disponibles en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama (transformer decoder, según tags de Hugging Face); detalles completos no disponibles |
| Parametros totales | 8.468.585.472 (parámetros almacenados en la versión cuantizada a 3,55 bpw; el modelo base se denomina 33B) |
| Parametros activos | No disponible (no se indica si es MoE) |
| Longitud de contexto | 524.288 tokens (512K) nativa según las pruebas del kit; verificado hasta 480.256 tokens con KV en 2 bits y 180.224 con KV Q4 + drafter en una RTX 5090 |
| Tipos de cuantizacion | EXL3 3,55 bpw (esta revisión); KV en FP16, Q4 o 2 bits según preset |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | Apache-2.0 (pesos originales y derivados) |
| Formato de pesos | Safetensors (cuantización EXL3 para ExLlamaV3) |

## Arquitectura y entrenamiento

El modelo base, Nanbeige4.3-33B, es un transformer decoder de la familia de arquitecturas Llama, según los metadatos de Hugging Face. Este repositorio no contiene los pesos originales sino una cuantización EXL3 a 3,55 bits por peso, un formato de cuantización del motor ExLlamaV3 (versión 1.6.5 en las mediciones) que permite ejecutar modelos grandes en GPUs de consumo con pérdida mínima de calidad. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF/DPO en el modelo base.

La innovación destacable de esta ficha no está en la arquitectura del modelo sino en el despliegue: el kit de acrogenesis emplea decodificación especulativa con el drafter ProCreations/Nanbeige4.3-33B-DFlash2 (descargado por separado), lo que permite mantener ~115 tok/s de salida incluso con contextos de 180K tokens, frente a los ~70 tok/s sin drafter. Los presets combinan KV en FP16 para contextos cortos (8.192 tokens) y KV en Q4 para contextos largos (180.224 tokens).

## Capacidades

- Generación de texto conversacional (pipeline text-generation, tag conversational).
- Soporte de inglés y chino.
- Ventana de contexto extremadamente larga (hasta 512K tokens nativa; verificado 480K con KV en 2 bits), adecuada para procesar documentos extensos.
- Recuperación de información exacta en contextos casi llenos: en la prueba near-full con 179.705 tokens de entrada recuperó correctamente tres pares clave/valor situados cerca del 2%, 50% y 94% del input.
- Compatibilidad con el ecosistema ExLlamaV3, con presets listos para RTX 5090.
- No hay información sobre tool calling, capacidades de agentes, visión, audio ni modo de razonamiento (thinking) en la documentación disponible.

## Casos de uso

- Análisis de documentos muy largos: con hasta 480.256 tokens de contexto verificado, puede procesar informes, contratos o bases de código enteras en una sola pasada; la prueba near-full recuperó datos exactos repartidos por todo el contexto.
- Chatbot local de alto rendimiento: ~115 tok/s de salida en una RTX 5090 con drafter DFlash2 permite respuestas fluidas en tiempo real sin depender de APIs externas.
- Resumen de contextos extensos en local: el preset "max" acepta ficheros de prompt completos (run-max.sh --prompt-file) para resumir o extraer información de documentos de cientos de miles de tokens.
- Asistencia bilingüe inglés-chino: soporte oficial de ambos idiomas, útil para equipos que trabajan con documentación técnica en chino.
- Experimentación con cuantización extrema y KV cache comprimida: el kit publica presets, límites y evidencia cruda, ideal para investigar el impacto de KV en Q4/2 bits sobre la calidad.
- Inferencia privada en estación de trabajo: al ejecutarse íntegramente en una GPU de consumo de 32 GB, es adecuado para entornos donde los datos no pueden salir de la máquina local.
- Benchmarking reproducible: el repositorio nanbeige-exl3-kit incluye un harness de benchmarks con resultados publicados y verificados en LocalMaxxing.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible para esta cuantización. Sí se han publicado mediciones de rendimiento medidas en una RTX 5090 (32 GB, Ryzen 9 9950X3D, ~128 GB RAM, ExLlamaV3 1.6.5, torch 2.13.0+cu132, medidas el 2026-10-26):

| Preset/prueba | Entrada/salida real | Contexto | KV | Draft | Salida (tok/s) | Prefill (tok/s) | TTFT |
|---|---:|---:|---|---|---:|---:|---:|
| Fast, mediana de 3 | 2.842 / 2.048 | 8.192 | FP16 | DFlash2 sparse16K | 116,92 | 3.130,03 | 926 ms |
| Máximo actual con DFlash2, mediana de 3 | 2.842 / 2.048 | 180.224 | Q4 target/draft | DFlash2 sparse16K | 115,14 | 3.239,42 | 896 ms |
| Near-full actual con DFlash2, 1 petición | 179.705 / 256 | 180.224 | Q4 target/draft | DFlash2 sparse16K | 23,41 | 1.073,82 | 167,40 s |
| Máximo histórico sin draft, mediana de 3 | 2.842 / 2.048 | 480.256 | 2 bits | Off | 70,42 | 3.156,91 | 917 ms |
| Near-full histórico sin draft, 1 petición | 479.744 / 256 | 480.256 | 2 bits | Off | 23,20 | 478,90 | 1.001,82 s |

Medición adicional: suite de 5 prompts x 3 semillas con ~89-103 tokens de entrada y 384 de salida, KV FP16 de 8K, DFlash2 sparse16K y temperatura 0,6: 103,40 tok/s (mediana) / 101,77 tok/s (agrupada). Las pruebas near-full pasaron las comprobaciones de recuperación exacta, pero una prueba con 344.064 tokens y KV Q2 solo recuperó dos de tres valores. El reporte completo con evidencia está publicado en LocalMaxxing.

## Requisitos de hardware

- VRAM estimada: el modelo cuantizado a 3,55 bpw ocupa unos 17 GB en disco; con KV FP16 de 8K cabe holgadamente en una GPU de 32 GB. Con contexto de 180.224 tokens y KV Q4 (target y draft) se ocupó casi toda una RTX 5090 de 32 GB, dejando solo 1.017 MiB libres. El intento de 196.608 tokens con KV Q4 provocó OOM en la carga de trabajo de 2.048 tokens de salida.
- GPU recomendada: RTX 5090 de 32 GB (hardware sobre el que se han medido todos los resultados). GPUs NVIDIA de 24 GB probablemente no alcancen los contextos largos documentados; no hay mediciones en otras GPUs.
- Consumer GPU: sí, diseñado y verificado específicamente para RTX 5090 (32 GB) como GPU única de escritorio.
- Despliegue: ExLlamaV3 1.6.5 (motor nativo) mediante el kit nanbeige-exl3-kit (setup.sh, run-fast.sh, run-max.sh). Requiere Linux con NVIDIA y Python 3.12 para la wheel probada. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI; el formato EXL3 es específico de ExLlamaV3.
- Rendimiento esperado: ~115-117 tok/s de salida y ~3.100-3.240 tok/s de prefill con contextos de 8K-180K y drafter; ~23 tok/s de salida con contextos casi llenos; TTFT de ~0,9 s en contextos cortos y hasta ~167 s (con DFlash2) o ~1.002 s (sin draft, 480K) con contextos casi llenos.
- Requisito adicional: el drafter DFlash2 se descarga por separado y el kit reusa las revisiones fijadas (pinned) del target y el drafter en la caché de Hugging Face.

## Comparativa con modelos similares

| Característica | Nanbeige4.3-33B-EXL3 3.55bpw (esta ficha) | ProCreations/Nanbeige4.3-33B-EXL3 (origen) | Nanbeige/Nanbeige4.3-33B (base) |
|---|---|---|---|
| Formato | EXL3 3,55 bpw (safetensors) | EXL3 3,55 bpw (safetensors) | Pesos originales (no disponible el formato exacto) |
| Tamaño en disco | 17,0 GB | No disponible | No disponible |
| Contexto | Hasta 480K verificado con KV 2 bits | No disponible | 524.288 tokens (512K) según pruebas |
| Drafter DFlash2 | Sí (presets del kit) | No disponible | No disponible |
| Licencia | Apache-2.0 | Apache-2.0 (derivado) | Apache-2.0 |
| Evidencia de rendimiento | Mediciones publicadas en RTX 5090 | No disponible | No disponible |

No se conocen modelos comparables de terceros (por ejemplo otros 33B con contexto 512K cuantizados a ~3,5 bpw) con datos suficientes en la información disponible.

## Limitaciones y advertencias

- Discrepancia de nomenclatura: el nombre indica 33B pero el recuento real de parámetros en los safetensors de esta cuantización es de 8,47 mil millones; esto es esperable por la cuantización, pero conviene verificar las specs del modelo base antes de planificar despliegues.
- La ventana completa de 524.288 tokens no fue ejecutada en las pruebas; el máximo verificado es de 480.256 tokens con KV en 2 bits, y a 344.064 tokens con KV Q2 se perdió una de tres comprobaciones de recuperación.
- La calidad de la KV cache en Q4 y 2 bits no está ampliamente evaluada: las comprobaciones de recuperación son casos aislados, no una evaluación exhaustiva; el propio autor lo advierte explícitamente.
- Riesgo de alucinación: no hay datos publicados sobre tasas de alucinación ni benchmarks de calidad para esta cuantización; las afirmaciones de calidad del modelo base pertenecen al editor upstream y no fueron reproducidas por el autor del espejo.
- Idiomas limitados a inglés y chino según los metadatos; el rendimiento en otros idiomas no está documentado.
- El formato EXL3 solo funciona con ExLlamaV3; no es compatible con vLLM, llama.cpp, Ollama o TGI sin conversión.
- La wheel probada requiere Linux, NVIDIA y Python 3.12; en otras configuraciones puede requerir compilación o no funcionar.
- Licencia Apache-2.0: sin restricciones relevantes para uso comercial, aunque deben conservarse el LICENSE y NOTICE originales, algo que este espejo ya garantiza.
- Sesgos conocidos: no disponible en la información proporcionada.

## Enlaces

- Repositorio de la ficha: https://huggingface.co/acrogenesis/Nanbeige4.3-33B-EXL3-3.55bpw
- Modelo base: https://huggingface.co/Nanbeige/Nanbeige4.3-33B
- Cuantización original de ProCreations (revisión espejada): https://huggingface.co/ProCreations/Nanbeige4.3-33B-EXL3/tree/56a23706262458b23ba7dde5ba1eea053a109544
- Drafter DFlash2: https://huggingface.co/ProCreations/Nanbeige4.3-33B-DFlash2/tree/4b7c7f8509d5286b7264db096d764b4a163d74f4
- Kit de inferencia y benchmarks: https://github.com/acrogenesis/nanbeige-exl3-kit
- Motor ExLlamaV3 1.6.5: https://github.com/turboderp-org/exllamav3/tree/v1.6.5
- Reporte de rendimiento medido (LocalMaxxing): https://www.localmaxxing.com/en/models/acrogenesis/Nanbeige4.3-33B-EXL3-3.55bpw/reports/cmvpehkhi0264ng01auzavjoo
