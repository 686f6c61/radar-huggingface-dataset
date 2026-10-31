# darioooooo0o/Qwen3.6-35B-A3B-TinyKV-GGUF

## Resumen

Qwen3.6-35B-A3B-TinyKV-GGUF es una colección de cuantizaciones GGUF del modelo Qwen3.6-35B-A3B-TinyKV, publicado por el usuario darioooooo0o en Hugging Face. El modelo base es una modificación de Qwen3.6-35B-A3B en la que se reduce el tamaño de la caché KV en 2,5 veces mediante reentrenamiento por destilación de sus 10 capas de atención completa. El resultado es un modelo MoE de 35,5 mil millones de parámetros totales (con aproximadamente 3 mil millones activos por token) que mantiene un contexto nativo de 262k tokens pero consume mucha menos memoria de caché, lo que permite contextos largos en GPUs de consumo.

La relevancia de esta ficha radica en el problema que resuelve: los modelos de contexto muy largo suelen ser inviables en hardware doméstico por el coste de la caché KV. Con TinyKV, un contexto de 128k tokens ocupa 1,07 GB de caché f16 frente a los 2,68 GB del modelo original, y con caché cuantizada q4_0 baja a 0,30 GB. Esto permite ejecutar el modelo a contexto completo (262k) en GPUs de 8 GB usando descarga parcial de expertos a RAM del sistema.

Cabe destacar que se trata de un modelo comunitario (no oficial de Alibaba/Qwen) y que requiere una rama especial de llama.cpp (`riceharvest/llama.cpp@tinykv`); las versiones estándar de llama.cpp, Ollama y LM Studio no soportan su formato de caché comprimida compartida.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE transformer híbrido (atención completa + Gated DeltaNet) |
| Parámetros totales | 35.502.629.248 (~35,5B) |
| Parámetros activos | ~3B por token |
| Longitud de contexto | 262.144 tokens (262k) |
| Tipos de cuantización | Q8_0, Q6_K, Q5_K_M, Q4_K_M, MXFP4_MOE, IQ4_XS, Q3_K_M, IQ2_M (imatrix) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (modelo base en safetensors) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.6-35B-A3B, un MoE con 35,5B de parámetros totales y unos 3B activos por token. La innovación principal de la variante TinyKV es la compresión de la caché KV: se reentrenaron únicamente sus 10 capas de atención completa mediante destilación (distillation) para producir una caché 2,5 veces más pequeña, con un layout comprimido y compartido entre capas. El resto del modelo es una arquitectura híbrida que combina esas capas de atención completa con capas Gated DeltaNet (capas recurrentes lineales), las cuales añaden un estado recurrente fijo de ~60 MB por secuencia, independiente de la longitud del contexto.

El modelo fue entrenado con su caché redondeada al formato NVFP4, un formato de 4 bits cercano a q4_0, lo que explica que la caché cuantizada a q4_0 degrade mínimamente la calidad. No se ha publicado información sobre el número de tokens de preentrenamiento, la composición del dataset ni el uso de RLHF/DPO en la documentación disponible.

## Capacidades

- Generación de texto conversacional (pipeline text-generation, tag conversational).
- Razonamiento con modo de thinking activado (verificado en el sanity check del autor).
- Generación de código (el sanity check incluye una función Python correcta).
- Aritmética básica correcta según las pruebas del autor.
- Tool calling / function calling (verificado una llamada de herramienta correcta en el sanity check).
- Contexto muy largo: 262k tokens nativos, con pruebas de recuperación de agujas (needle tests) a 30k y 130k tokens.
- Multilingüe: el sanity check demuestra fluidez en neerlandés; la lista completa de idiomas no está disponible.
- Este repositorio es solo texto; no incluye proyector de visión.

## Casos de uso

- Análisis de documentos extensos: con 262k tokens de contexto y una caché de solo 0,30 GB (q4_0) a 128k, cabe analizar libros, contratos o bases de código completas en una GPU de 24 GB.
- Chat local privado en GPUs de consumo: la variante IQ2_M con caché q8_0 funciona a contexto completo de 262k en tarjetas de 8 GB, ideal para asistentes locales sin conexión.
- Asistentes con memoria de sesión muy larga: el estado recurrente fijo de ~60 MB de las capas Gated DeltaNet permite mantener sesiones largas sin crecimiento de memoria por token.
- Agentes con tool calling: el modelo soporta llamadas a herramientas verificadas, útil para pipelines de agentes locales con llama-server.
- RAG sobre corpus grandes: los needle tests a 130k tokens (7-8 de 8 aciertos en Q4_K_M) indican recuperación fiable en contextos largos sin necesidad de chunking agresivo.
- Procesamiento por lotes de textos largos en hardware modesto: la descarga de expertos a RAM del sistema (`--n-cpu-moe`) permite servir el modelo completo en máquinas sin GPU de gama alta, a cambio de velocidad limitada por el ancho de banda de la RAM.
- Servidores de inferencia autoalojados: llama-server con soporte Vulkan, SYCL o CUDA permite desplegar en GPUs no NVIDIA (se ha probado en Intel Arc Pro B70).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los únicos datos medidos son pruebas internas del autor:

| Prueba | TinyKV Q8_0 | TinyKV Q4_K_M | Stock Q8_0 (referencia) |
|---|---|---|---|
| Perplejidad vs PyTorch (f16 cache) | 0,047 | 0,082 | 0,077 |
| Perplejidad vs PyTorch (q4_0 cache) | 0,057 | 0,088 | 0,084 |
| Needle test 30k (q4_0 cache) | 24/24 | 24/24 | 24/24 |
| Needle test 130k (q4_0 cache) | 8/8 | 7/8 | 6/8 |

Estos datos sugieren que TinyKV no solo conserva, sino que ligeramente mejora la recuperación en contexto largo respecto al modelo original en las pruebas del autor.

## Requisitos de hardware

- VRAM estimada (pesos + caché f16 + buffers + ~0,8 GB de overhead):
  - Q4_K_M a 262k de contexto: ~24 GB (el modelo stock solo llega a 118k en la misma GPU).
  - MXFP4_MOE o IQ4_XS a 262k: ~24 GB.
  - Q8_0 a 262k: ~48 GB.
  - IQ2_M a 262k: ~16 GB (el stock requiere ~24 GB o caché cuantizada).
- Con caché q8_0 (`-ctk q8_0 -ctv q8_0`): Q4_K_M a 262k baja a ~223k en 24 GB para el stock, mientras TinyKV alcanza los 262k completos.
- GPUs de consumo: una RTX 4090 (24 GB) ejecuta Q4_K_M, MXFP4_MOE o IQ4_XS a contexto completo. Con `--n-cpu-moe 99`, una GPU de 8 GB ejecuta Q8_0 a 262k (requiere ~35 GB de RAM del sistema para los expertos; Q4_K_M requiere ~20 GB).
- GPUs probadas: Intel Arc Pro B70 vía Vulkan (sanity check con MXFP4_MOE). Compatible con CUDA, Vulkan y SYCL, además de CPU pura.
- Despliegue: exclusivamente la rama `tinykv` de llama.cpp (llama-server y llama-cli). No compatible con llama.cpp estándar, Ollama ni LM Studio. No hay información sobre vLLM o TGI.
- Es imprescindible usar `-fa on`: sin flash attention, llama.cpp rellena la caché V y se pierde parte del ahorro.
- Velocidad de decodificación con expertos en RAM: limitada por el ancho de banda de memoria del sistema, al leerse ~3B de parámetros activos por token. No se publican cifras de tokens/segundo.

## Comparativa con modelos similares

| Característica | Qwen3.6-35B-A3B-TinyKV (este) | Qwen3.6-35B-A3B (stock) | Modelos MoE ~30B alternativos |
|---|---|---|---|
| Parámetros totales | 35,5B | 35,5B | no disponible |
| Parámetros activos | ~3B | ~3B | no disponible |
| Contexto | 262k | 262k | no disponible |
| Caché KV a 128k (f16) | 1,07 GB | 2,68 GB | no disponible |
| Contexto completo en 24 GB (Q4_K_M) | Sí | No (118k) | no disponible |
| Licencia | Apache 2.0 | Apache 2.0 | no disponible |
| Compatibilidad de software | llama.cpp rama tinykv | llama.cpp, Ollama, LM Studio | no disponible |

La principal diferencia frente al modelo stock es la eficiencia de memoria en contexto largo, al precio de requerir software especializado. No se dispone de datos para comparar con otros modelos MoE de tamaño similar (por ejemplo, variantes Qwen3 oficiales u otros MoE comunitarios) en la información proporcionada.

## Limitaciones y advertencias

- Compatibilidad de software muy restringida: solo funciona con la rama `tinykv` de llama.cpp; Ollama, LM Studio y llama.cpp estándar rechazan los ficheros.
- Modelo comunitario no oficial: no procede de Alibaba/Qwen, por lo que la procedencia del reentrenamiento por destilación no puede verificarse de forma independiente.
- Sin benchmarks estándar publicados: la calidad general respecto al modelo original solo está avalada por pruebas internas del autor (perplejidad y needle tests).
- Repositorio de 184,9 GB: la descarga completa es considerable; conviene descargar solo los quants necesarios.
- Riesgo de alucinación: no evaluado; al tratarse de un modelo base modificado con destilación parcial, el comportamiento puede desviarse del original en tareas no cubiertas por las pruebas del autor.
- Idiomas soportados no documentados formalmente; solo hay evidencia anecdótica de inglés y neerlandés.
- Sin capacidades de visión en este repositorio (solo texto).
- Sesgos conocidos: no disponible.
- Licencia Apache 2.0: permite uso comercial sin restricciones destacables más allá de la atribución y aviso de licencia.
- En configuraciones con expertos en RAM, el throughput depende del ancho de banda de la memoria del sistema y puede ser bajo para uso interactivo.

## Enlaces

- Repositorio GGUF: https://huggingface.co/darioooooo0o/Qwen3.6-35B-A3B-TinyKV-GGUF
- Modelo base: https://huggingface.co/darioooooo0o/Qwen3.6-35B-A3B-TinyKV
- Rama de llama.cpp requerida: https://github.com/riceharvest/llama.cpp/tree/tinykv
