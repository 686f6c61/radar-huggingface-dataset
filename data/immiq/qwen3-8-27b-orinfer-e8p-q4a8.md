# immiq/Qwen3.8-27B-Orinfer-E8P-Q4A8

## Resumen

Qwen3.8-27B-Orinfer-E8P-Q4A8 es una cuantización de alta fidelidad del modelo multimodal Qwen/Qwen3.8-27B, publicada por el usuario immiq y optimizada específicamente para el acelerador NVIDIA Jetson AGX Orin de 64 GB (arquitectura CUDA SM87). No se trata de un modelo nuevo, sino de una redistribución de pesos cuantizados en formato mixto E8P-Q4 (pesos) y W8/INT8 (activaciones y proyecciones), acompañada de un paquete de ejecución propio denominado Orinfer v0.2.0, escrito en Rust y distribuido vía GitHub Releases.

El problema que resuelve es concreto: ejecutar un modelo de lenguaje y visión de 27 000 millones de parámetros con una ventana de contexto de 262 144 tokens en hardware de borde con memoria unificada limitada. El repositorio ocupa 31,8 GB, pero los pesos desplegados en GPU suman 16 518 393 824 bytes, lo que equivale a unos 4,757 bits por parámetro registrado. La cuantización se realizó directamente desde los pesos BF16 originales mediante rotaciones E8P, GPTQ con Hessiano y destilación de logits de extremo a extremo sobre las 64 capas del transformer.

La relevancia actual radica en que demuestra que es viable llevar modelos multimodales de gran contexto a plataformas embebidas con pérdida de calidad medida y acotada (KL global de 0,03915 frente al profesor BF16, Top-1 del 92,28 % en casos retenidos). La licencia Apache 2.0 del modelo base se mantiene, y el soporte declarado de idiomas es chino e inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 64 capas (48 GDN + 16 Full Attention), con capa MTP nativa; codificador de visión incluido |
| Parametros totales | 27 000 millones (modelo base Qwen3.8-27B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262 144 tokens |
| Tipos de cuantizacion | Pesos E8P-Q4 (uint32), proyecciones out_proj/o_proj y MTP en W8-GPTQ (int8), activaciones INT8, escalas FP16, KV cache INT8, estado GDN persistente FP32; ~4,757 bits por parámetro desplegado |
| Idiomas soportados | zh, en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (12 shards semánticos, 16,52 GB almacenados) + cache/model.json con descriptor de layouts |

## Arquitectura y entrenamiento

El modelo base es un transformer de 64 capas que combina 48 capas GDN (Gated Delta Network, atención lineal recurrente) con 16 capas de atención completa, e incorpora una capa MTP (Multi-Token Prediction) nativa para decodificación especulativa. Sobre esa arquitectura, esta versión aplica un pipeline de cuantización en cuatro fases: primero, rotaciones óptimas por bloque de 128 con signos ajustados para minimizar el error de cuantización de activaciones INT8 antes de cada proyección (k5120, k17408); segundo, LDLQ con Hessiano de rango completo sobre 65 536 tokens y bloques de 8 con métrica de Mahalanobis, más dos barridos de descenso coordinado cíclico (beam 6/12) y pulido de escalas FP16 a 3 ULP, aplicado a las 64 capas y a lm_head, con GPTQ W8 para out_proj y o_proj; tercero, destilación de logits KL de extremo a extremo sobre las 64 capas con SGD de Nesterov y parada temprana sobre validación FP16 exacta, que congela los codewords discretos y optimiza únicamente las escalas continuas FP16 y los pesos RMSNorm (aproximadamente el 0,017 % de los parámetros); cuarto, recalibración de las 8 proyecciones W8 de la capa MTP 0 sobre las activaciones ya refinadas del tronco.

Los pesos del codificador de visión y el embedding de tokens W8 permanecen byte-exactos respecto al original. No se especifican en la información disponible el volumen de tokens de preentrenamiento del modelo base ni si hubo RLHF o DPO en su construcción. La verificación de integridad cubre el paquete de ejecución SM87, los digests del frontend, los layouts físicos de los safetensors y los SHA-256 de los 1 568 tensores.

## Capacidades

- Generación de texto conversacional multi-turno con plantilla de chat nativa.
- Comprensión de imágenes y de múltiples imágenes en una misma petición (pipeline image-text-to-text).
- Modo de razonamiento (thinking) controlable mediante `enable_thinking`; la salida de razonamiento se expone en el campo `reasoning_content`.
- Traducción entre idiomas, con recomendación explícita de desactivar el modo thinking para estas peticiones.
- Razonamiento matemático y generación de código, evaluados de forma específica en el conjunto retenido.
- Decodificación especulativa nativa mediante MTP con hasta 3 borradores adaptativos.
- Servicio compatible con OpenAI Chat Completions (`/v1/chat/completions`), streaming SSE y APIs compatibles con Ollama.
- Procesamiento por lotes continuo (continuous batching) y caché de prefijo.
- Inferencia offline reanudable sobre ficheros JSONL mediante `orinfer batch`.
- Capacidades de agente y código evaluadas en el conjunto retenido (categoría Agent/Code).
- Idiomas: chino e inglés declarados; el resto no está soportado oficialmente.

## Casos de uso

- Asistente conversacional en dispositivo de borde: el modelo puede mantener diálogos multi-turno con hasta 262 144 tokens de contexto directamente en un Jetson AGX Orin 64GB, sin depender de la nube, gracias a la KV cache INT8 y al estado GDN en FP32.
- Análisis de documentos e imágenes en campo: al aceptar múltiples imágenes por petición mediante `image_url`, resulta adecuado para inspección de planos, lectura de formularios o verificación visual en entornos sin conectividad.
- Traducción automática chino-inglés: con `enable_thinking: false` se obtiene latencia baja y salida directa, aprovechando que el par zh/en es el soportado oficialmente.
- Generación de código asistida en estaciones de trabajo aisladas: la categoría Agent/Code del conjunto retenido muestra una KL de 0,2264 frente al profesor BF16, lo que permite usar el modelo para autocompletado y refactorización local sin exponer el código a servicios externos.
- Razonamiento matemático y tutoría técnica: la KL en matemáticas es de 0,0142, la más baja de todas las categorías evaluadas, lo que lo hace apto para resolución de problemas paso a paso con modo thinking.
- Procesamiento por lotes de registros: `orinfer batch` con JSONL reanudable permite ejecutar clasificación, extracción o resumen sobre grandes volúmenes de documentos de forma offline y tolerante a interrupciones.
- Backend de agentes con tool calling sobre API compatible con OpenAI: el soporte de streaming SSE y de batching continuo permite integrarlo en orquestadores existentes sin adaptadores propietarios.
- Despliegue en flotas de robótica móvil: el consumo de 16,52 GB de pesos deja margen en los 64 GB unificados del Orin para el resto del stack (percepción, planificación) y ofrece 33,64 tok/s en decodificación individual con MTP.

## Benchmarks y rendimiento

Calidad frente al profesor BF16, medida sobre 23 casos estrictamente retenidos (5 063 posiciones) en inglés, chino, traducción, contexto largo, agente/código y matemáticas:

| Checkpoint (16,52 GB, SM87) | KL global ↓ | KL ex-Agent ↓ | Top-1 ↑ | Flips de alta confianza ↓ | KL Agent/Code ↓ | KL Math ↓ | KL MTP ↓ / Top-1 ↑ |
|---|---|---|---|---|---|---|---|
| v0.2.0 baseline (solo pesos) | 0,06218 | 0,05482 | 89,77 % | 62 / 2900 | 0,3462 | 0,0328 | 0,08993 / 85,89 % |
| E8P-Q4-HQ + destilación E2E | 0,03915 (-37,0 %) | 0,03429 (-37,4 %) | 92,28 % (+2,51 pp) | 44 / 2900 | 0,2264 (-34,6 %) | 0,0142 (-56,6 %) | 0,05717 (-36,4 %) / 89,44 % (+3,55 pp) |

Rendimiento medido en Jetson AGX Orin 64GB el 2026-10-21 (tok/s; arranque en segundos):

| Prefill 512 | Prefill 8K | Decode individual con MTP | Decode con 8 peticiones | Máx. peticiones / decode | Serve → API (s) | Serve → primera salida (s) |
|---|---|---|---|---|---|---|
| 658,87 | 598,46 | 33,64 | 67,56 | 64 / 135,89 | 6,68 | 7,05 |

Las pruebas individuales usan MTP adaptativo con hasta 3 borradores, 512 u 8 192 tokens de entrada y 257 tokens de salida fijos; las multipetición desactivan MTP automáticamente y emplean 256 tokens de entrada y 65 de salida por petición. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/ memoria unificada: 16 518 393 824 bytes de pesos en GPU (16,52 GB almacenados en 12 shards), más KV cache INT8 y estado GDN FP32 proporcionales al contexto utilizado.
- Plataforma objetivo: NVIDIA Jetson AGX Orin 64GB con arquitectura CUDA SM87. El paquete de ejecución está compilado exclusivamente para SM87.
- GPU de escritorio: no disponible; no se declara compatibilidad con A100, H100 ni RTX 4090, y el paquete `.so`/cubins distribuido es aarch64.
- Cabe en GPU de consumo: no confirmado. El único hardware validado es el Jetson AGX Orin 64GB.
- Despliegue: CLI `orinfer` v0.2.0 (Rust, aarch64) con subcomandos `package install`, `validate-model` y `serve`; APIs OpenAI Chat Completions y compatibles con Ollama en `[::]:8088`; modo `orinfer batch` para JSONL. No se menciona soporte de vLLM, llama.cpp, Ollama nativo ni TGI.
- Latencia y throughput: prefill de 658,87 tok/s con 512 tokens y 598,46 tok/s con 8K; decodificación de 33,64 tok/s en petición única y 67,56 tok/s con 8 peticiones concurrentes; hasta 64 peticiones simultáneas con 135,89 tok/s agregados; arranque del servicio en 6,68 s y primera salida en 7,05 s.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Plataforma |
|---|---|---|---|---|---|
| Qwen3.8-27B-Orinfer-E8P-Q4A8 (esta ficha) | 27 000 M | 262 144 | E8P-Q4 + W8/INT8 mixta | Apache 2.0 | Jetson AGX Orin 64GB (SM87) |
| Qwen/Qwen3.8-27B (base) | 27 000 M | 262 144 | BF16 original | Apache 2.0 | GPU con suficiente memoria; no cabe en Orin a BF16 |
| Baseline v0.2.0 weight-only (mismo autor) | 27 000 M | 262 144 | Solo pesos, sin destilación E2E | Apache 2.0 | Jetson AGX Orin 64GB (SM87) |

Frente al modelo base BF16, esta versión reduce el espacio de pesos a 16,52 GB y mantiene un Top-1 del 92,28 % respecto al profesor, a costa de una KL global de 0,03915. Frente al baseline weight-only del mismo autor, la destilación E2E mejora la KL un 37,0 % y reduce los flips de alta confianza de 62 a 44 sobre 2 900 posiciones, sin coste de velocidad según el autor. No se dispone de comparaciones con otras familias de modelos del mismo tamaño en la información proporcionada.

## Limitaciones y advertencias

- Idiomas: solo chino e inglés declarados; el rendimiento en castellano u otras lenguas no está evaluado ni garantizado.
- La cuantización introduce desviaciones medibles: KL global de 0,03915 y 44 flips de alta confianza sobre 2 900 posiciones frente al profesor BF16; en Agent/Code la KL es de 0,2264, la categoría con mayor degradación.
- Riesgo de alucinación inherente al modelo base; no se documentan evaluaciones de veracidad en la información disponible.
- Dependencia estricta del paquete de ejecución Orinfer v0.2.0 con digest `1337e1d3...62a52` y de la arquitectura SM87; no es portable a otras GPU sin recompilación no documentada.
- El repositorio de Hugging Face no incluye el binario `.so` ni los cubins; hay que descargarlos desde GitHub Releases y verificar los SHA-256.
- El rendimiento medido corresponde a una única plataforma (Jetson AGX Orin 64GB) y a una fecha concreta; no hay datos de latencia en otros entornos.
- El modo thinking debe desactivarse explícitamente para traducción, según indica el autor; de lo contrario, la latencia y el formato de salida cambian.
- Licencia Apache 2.0 heredada del modelo base, que permite uso comercial, pero conviene verificar las condiciones del modelo Qwen3.8-27B original y de las dependencias del runtime.
- El modelo tiene un volumen muy bajo de adopción (30 descargas, 1 like) y una sola versión publicada; no hay evidencia comunitaria de robustez en producción.
- La ventana de 262 144 tokens es teórica: la memoria disponible para KV cache en el Orin condiciona el contexto real alcanzable.

## Enlaces

- Hugging Face: https://huggingface.co/immiq/Qwen3.8-27B-Orinfer-E8P-Q4A8
- Model card en chino: https://huggingface.co/immiq/Qwen3.8-27B-Orinfer-E8P-Q4A8/blob/main/README_zh.md
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B/tree/1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0
- ModelScope: https://modelscope.cn/models/iammiq/Qwen3.8-27B-Orinfer-E8P-Q4A8
- Release de Orinfer v0.2.0: https://github.com/iMMIQ/orinfer/releases/tag/v0.2.0
- Guía de servicio: https://github.com/iMMIQ/orinfer/blob/v0.2.0/docs/serving.md
- Repositorio Orinfer: https://github.com/iMMIQ/orinfer
