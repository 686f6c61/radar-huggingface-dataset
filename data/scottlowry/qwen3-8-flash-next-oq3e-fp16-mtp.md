# scottlowry/Qwen3.8-Flash-Next-oQ3e-fp16-mtp

## Resumen

Qwen3.8-Flash-Next-oQ3e-fp16-mtp es una cuantización mixta de precisión del modelo Qwen3.8-Flash-Next, publicada por el usuario scottlowry en Hugging Face. El checkpoint conserva 180.000 millones de parámetros lógicos repartidos entre el modelo de lenguaje (125.744B), una tabla de embeddings N-gram de gran tamaño (51.200B), un codificador visual (0.449B) y una cabeza MTP (multi-token prediction) de 2.607B. El resultado ocupa 93,5 GB en disco gracias a una mezcla de cuantizaciones afines de 3, 4 y 8 bits con un promedio efectivo de 4,154 bits por peso.

La relevancia de esta ficha es doble. Por un lado, documenta una técnica de cuantización mixta (oQ, de oMLX) que asigna precisión de forma selectiva: el 67,1% de los pesos quedan en 3 bits, mientras que la tabla N-gram se mantiene en 4 bits y las capas sensibles (visión, MTP y algunas proyecciones) suben a 8 o 16 bits. Por otro, el formato es MLX, es decir, está pensado para ejecutarse en Apple Silicon, no en GPUs NVIDIA. Esto lo convierte en una pieza interesante para quienes quieran correr un modelo de 180B en un Mac con memoria unificada grande.

No se dispone de información sobre el modelo base original (autoría, licencia, idiomas, contexto) más allá de lo que revela el nombre y el checkpoint. Todo lo que sigue se basa exclusivamente en los datos del repositorio y de la model card; cualquier dato ausente se marca como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con cabeza MTP (multi-token prediction) y codificador visual; detalles del bloque no disponibles |
| Parametros totales | 180.000.000.000 (180B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta: affine 3-bit g64, affine 4-bit g64, affine 8-bit g64, affine 8-bit g128, N-gram affine 4-bit g32, FP16, FP32; promedio 4,154 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX), repo de 93,5 GB |

Desglose de almacenamiento por componente:

| Componente | Pesos logicos | Almacenamiento |
|---|---|---|
| Modelo de lenguaje | 125,744B | 58,159 GB / 54,165 GiB |
| Embedding N-gram | 51,200B | 32,000 GB / 29,802 GiB |
| Vision | 0,449B | 1,796 GB / 1,672 GiB |
| Cabeza MTP | 2,607B | 1,513 GB / 1,409 GiB |
| Total | 180,000B | 93,468 GB / 87,049 GiB |

## Arquitectura y entrenamiento

El checkpoint es una cuantización, no un entrenamiento nuevo. La arquitectura subyacente es un transformer con un codificador visual (0,449B de pesos) y una cabeza MTP de 2,607B parámetros, lo que sugiere capacidades multimodales (visión) y decodificación multi-token especulativa. La presencia de una tabla de embeddings N-gram de 51,2B parámetros (el 28,4% de los pesos lógicos) es un rasgo poco habitual y apunta a un mecanismo de memoria o recuperación basada en n-gramas integrado en el modelo, no a un simple embedding de tokens.

La cuantización se realizó con oQ (oMLX v0.7.4.dev1) en precisión mixta. La distribución es deliberada: el 67,1% de los pesos (120,796B) va en affine 3-bit con grupo 64, lo que reduce drásticamente el tamaño; la tabla N-gram se mantiene en 4-bit con grupo 32 (5,0 bits/peso efectivos) para preservar la calidad de recuperación; y las capas de visión (FP32), la cabeza MTP y algunas proyecciones suben a 8-bit o FP16. El resultado es un promedio de 3,818 bits/peso excluyendo la tabla N-gram, o 4,154 bits/peso contando todo el checkpoint. No hay información sobre datos de entrenamiento, tokens vistos ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento: el modelo base es un LLM de 125,7B parámetros en el componente de lenguaje, por lo que se espera capacidad de generación, razonamiento y respuesta a instrucciones; no hay evaluación publicada que lo confirme.
- Visión: incluye un codificador visual de 0,449B parámetros en FP32, lo que indica soporte de entrada de imágenes.
- Decodificación multi-token (MTP): la cabeza de 2,607B parámetros sugiere generación especulativa de varios tokens por paso, orientada a mejorar el throughput.
- Memoria N-gram: la tabla de 51,2B parámetros podría actuar como mecanismo de recuperación o sesgo sobre secuencias frecuentes; su función exacta no está documentada.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Modo thinking: no disponible.

## Casos de uso

- Inferencia local en Apple Silicon de un modelo de 180B: el checkpoint está en formato MLX y ocupa 87 GiB, por lo que se puede cargar en un Mac Studio o MacBook Pro con memoria unificada de 128 GB o superior usando MLX. Es el caso de uso principal y el único que la model card respalda implícitamente.
- Experimentación con cuantización mixta: investigadores que quieran estudiar el impacto de asignar 3 bits a la mayoría de pesos y 8 bits a capas sensibles pueden usar este checkpoint como referencia reproducible con oQ.
- Investigación sobre decodificación especulativa: la cabeza MTP permite medir la ganancia de throughput de multi-token prediction frente a decodificación autoregresiva estándar en hardware Apple.
- Evaluación de mecanismos N-gram en LLMs: la tabla de 51,2B parámetros es un objeto de estudio poco común; útil para analizar cómo afecta la cuantización a 4 bits a la calidad de recuperación de n-gramas.
- Prototipado multimodal en local: el codificador visual permite probar pipelines de imagen+texto sin depender de APIs en la nube, siempre que el hardware tenga memoria suficiente.
- Benchmarking de cuantización extrema: comparar la perplejidad y la calidad de generación de este checkpoint (4,154 bits/peso) frente al modelo base en FP16 o BF16 para calibrar cuánto degrada la cuantización mixta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 87,049 GiB de pesos en disco; en carga se necesita al menos esa cantidad más overhead de activaciones y caché KV. Para contexto largo, prever 100-120 GB de memoria unificada.
- GPU recomendadas: el formato es MLX, por lo que el hardware objetivo es Apple Silicon (M1/M2/M3/M4 en variantes Max y Ultra). No está pensado para A100, H100 ni RTX 4090; no se ha validado en CUDA.
- ¿Cabe en consumer GPU? No en GPUs de consumo con 24 GB (RTX 4090) ni en una sola A100 de 80 GB. Requiere un Mac con 128 GB o más de memoria unificada, o un sistema multi-GPU si se convirtiera el formato.
- Opciones de despliegue: MLX (librería mlx), oMLX/oQ para carga de cuantizaciones mixtas. No se indica compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La cabeza MTP sugiere optimización de throughput, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-oQ3e-fp16-mtp | 180B (125,7B LM + 51,2B N-gram + 0,45B vision + 2,6B MTP) | no disponible | MLX safetensors, 4,154 bits/peso | no disponible | Cuantización mixta para Apple Silicon |
| Modelo base Qwen3.8-Flash-Next (FP16/BF16) | 180B | no disponible | no disponible | no disponible | Referencia de calidad; ocupa aproximadamente 360 GB en FP16 |
| Cuantizaciones GGUF de 3-4 bits de modelos 70B (p. ej. Llama 3.3 70B Q4_K_M) | ~70B | 128K en el caso de Llama 3.3 | GGUF | Llama 3.3 Community License | Alternativa más pequeña y compatible con llama.cpp, pero con menos parámetros |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas. La comparación anterior es estructural, no de calidad.

## Limitaciones y advertencias

- La cuantización a 3 bits en el 67,1% de los pesos puede degradar la calidad frente al modelo base; no hay evaluación publicada que cuantifique la pérdida.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo día (2026-11-11). No hay evidencia de validación por parte de la comunidad.
- La licencia no está disponible, lo que impide determinar si se permite uso comercial. No usar en producción sin aclarar la licencia del modelo base.
- El formato MLX limita el despliegue a Apple Silicon; no hay soporte documentado para CUDA, ROCm ni CPU.
- No se documentan idiomas soportados, longitud de contexto ni sesgos conocidos.
- Riesgo de alucinación: inherente a los LLM; sin benchmarks ni model card del base, no se puede acotar.
- La tabla N-gram de 51,2B parámetros consume 29,8 GiB (el 34% del checkpoint); si su función no es crítica para el caso de uso, el coste en memoria es elevado.
- El autor es un particular (scottlowry), no el equipo de Qwen; la trazabilidad del proceso de cuantización depende de la herramienta oQ/oMLX.

## Enlaces

- Hugging Face: https://huggingface.co/scottlowry/Qwen3.8-Flash-Next-oQ3e-fp16-mtp
- Herramienta de cuantización oQ (oMLX): https://github.com/jundot/omlx
- Modelo base Qwen3.8-Flash-Next: no disponible en la información proporcionada
