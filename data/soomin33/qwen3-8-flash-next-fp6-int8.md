# Soomin33/Qwen3.8-Flash-Next-FP6-INT8

## Resumen

El modelo Soomin33/Qwen3.8-Flash-Next-FP6-INT8 es una cuantización de segunda generación (v2) del modelo Qwen3.8-Flash-Next, desarrollado por el usuario independiente Soomin33 a partir del checkpoint oficial Qwen/Qwen3.8-Flash-Next-FP8. El modelo original, creado por Alibaba Qwen, es un sistema de mezcla de expertos (MoE) de 125 mil millones de parámetros activos por token de 6 mil millones, complementado con una tabla de embeddings n-gram de 51 mil millones de parámetros, alcanzando un total de aproximadamente 180 mil millones. Esta versión cuantizada reduce el peso total a unos 98 mil millones de parámetros almacenados en safetensors, utilizando precisión fp6 e2m3 para los expertos enrutados, int8 simétrico para las proyecciones densas y bf16 para el resto, con la tabla n-gram servida como sidecar fp8 desde la RAM del host.

La relevancia de este modelo radica en que permite ejecutar un modelo de 180 mil millones de parámetros con contexto completo de 262 144 tokens en solo dos GPU de 64 GB (concretamente NVIDIA CMP 170HX), sin cuantizar la caché KV ni los estados recurrentes. El autor reporta una velocidad de decodificación de 61 tokens por segundo en una sola secuencia y una tasa de prefill de más de 1100 tokens por segundo, convirtiéndolo en el build público más rápido conocido para hardware sm80/CMP. Esta cuantización está pensada para entornos de producción con restricciones de memoria, sacrificando algo de precisión a cambio de una latencia y un rendimiento muy superiores a los del checkpoint fp8 original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrida con atención GDN + QSA (Qwen4 experimental), embeddings n-gram |
| Parametros totales | 97 971 601 299 (pesos safetensors); 180 B incluyendo tabla n-gram (51 B) y 125 B del modelo principal |
| Parametros activos | 6 B por token (modelo principal); 48 expertos enrutados de 512 dimensiones |
| Longitud de contexto | 262 144 tokens por petición |
| Tipos de cuantizacion | fp6 e2m3 (expertos enrutados, grupo 64), int8 simétrico (embeddings, lm_head, proyecciones densas, grupo 32 con escalas fp16), bf16 (resto), tabla n-gram en fp8 e4m3 |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-license-1.0 (licencia comunitaria de Qwen) |
| Formato de pesos | safetensors (shards de ~97,63 GiB en disco) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next introduce una arquitectura experimental denominada Qwen4, que combina atención GDN (Gated Delta Network) con atención QSA (Query-Selective Attention) en un diseño híbrido. GDN funciona como un mecanismo de estado recurrente que permite comprimir información de largo alcance, mientras que QSA aplica atención selectiva sobre consultas relevantes, reduciendo el coste computacional. El modelo emplea 48 expertos enrutados (MoE) con 6 mil millones de parámetros activos por token, más un conjunto de expertos compartidos. Además, incorpora una tabla de embeddings n-gram de 51 mil millones de parámetros (PLE, probablemente "Positional Linear Embedding" o similar), que se sirve como sidecar en fp8 desde la RAM del host para evitar consumir VRAM.

El entrenamiento del modelo original se realizó con aproximadamente un noveno del coste de Qwen3.7-Plus, según la documentación oficial, manteniendo o mejorando capacidades en tareas de código y ofimática. No se dispone de información detallada sobre el dataset ni sobre el uso de RLHF o DPO en esta cuantización. La cuantización aquí presentada se deriva del checkpoint oficial FP8 (de grano fino, bloque 128), no de los pesos bf16 originales, y los tensores listados como bf16 heredan valores de ese checkpoint. El autor aplica un proceso de codificación int8 sobre la versión v1 (fp6) para producir esta v2, con un script en CPU que tarda aproximadamente 15 minutos y genera un manifiesto con los errores medidos por tensor.

## Capacidades

- Generación de texto conversacional y de larga forma con contexto completo de 262 144 tokens.
- Razonamiento multi-paso y resolución de tareas complejas, gracias a la arquitectura híbrida GDN+QSA que mantiene un estado recurrente eficiente.
- Generación de código y soporte de tareas de programación, según las capacidades reportadas del modelo base (superior a Qwen3.7-Plus en coding y office tasks).
- Soporte de tool calling y function calling, aunque no se detalla explícitamente en la model card, es una capacidad estándar de la familia Qwen.
- Capacidades multilingües probablemente presentes, aunque no se especifican en la documentación disponible.
- Soporte de decodificación especulativa con MTP (Multi-Token Prediction), con una longitud de aceptación media de 1,78 tokens, lo que contribuye a la alta velocidad de decodificación.
- Procesamiento de imágenes y texto (según la mención de "GPU image preprocessing" en la sección de estabilidad), aunque no se detalla el soporte multimodal específico.

## Casos de uso

- Servicio de atención al cliente automatizada: el modelo puede mantener conversaciones multi-turno con contexto largo (hasta 262 144 tokens) sin degradación de velocidad, lo que permite gestionar historiales completos de interacción con clientes en tiempo real.
- Generación de código en producción: con soporte de tool calling y una velocidad de decodificación de 61 tok/s, puede integrarse en pipelines de CI/CD para autocompletar, revisar o generar código en repositorios grandes.
- Análisis de documentos extensos: la ventana de contexto completa permite procesar libros técnicos, informes anuales o expedientes legales completos en una sola pasada, con prefill de más de 1100 tok/s.
- Asistentes de razonamiento para investigación: el modelo puede encadenar pasos de razonamiento y consultar fuentes externas mediante tool calling, útil para tareas de síntesis de literatura o generación de hipótesis.
- Agentes autónomos multi-turno: la estabilidad mejorada bajo tráfico de agente (según la model card) lo hace adecuado para sistemas que requieren múltiples llamadas secuenciales sin reinicios, como orquestadores de tareas.
- Despliegue en hardware de segunda mano o de bajo coste: al caber en dos GPU CMP 170HX de 64 GB (≈5000 € en 2026), es viable para startups o laboratorios con presupuesto limitado que necesiten un modelo de 180 B sin recurrir a clústeres de 8 GPUs.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible para esta cuantización específica. La model card se centra en métricas de rendimiento de inferencia, no en calidad de salida. Los datos medidos por el autor (2026-09-02) son:

| Metrica | Valor |
|---|---|
| Decodificación single-stream (estado estacionario) | 60,9 tok/s mediana, 63,3 tok/s mejor caso |
| Decodificación incluyendo TTFT (respuestas de 400 tokens) | 56–58 tok/s |
| Decodificación agregada (1 / 2 / 3 streams) | ≈61 / 85 / 101 tok/s |
| Prefill end-to-end (prompt de 53k tokens) | 1126 tok/s (47,5 s) |
| TTFT (prompt corto) | ≈0,3 s |
| Coste de contexto largo | no medible: misma velocidad a 209k que a 500 tokens |
| KV pool (3 slots) | 425 024 tokens |

Estas cifras se obtuvieron en el hardware de referencia (2× CMP 170HX, sin NVLink, PCIe gen2 x4). El autor estima que en hardware con PCIe 4.0 x16 (como A100 PCIe) el prefill podría alcanzar ≈3000 tok/s, limitado por el GEMM de expertos.

## Requisitos de hardware

- VRAM necesaria: 2× 64 GB (61 GB por tarjeta en uso, 4,8 GB libres tras la captura de grafos). No cabe en GPUs de consumo (RTX 4090, etc.) de 24 GB.
- GPUs recomendadas: NVIDIA CMP 170HX (GA100, sm80, 64 GB HBM2e) en la configuración de referencia; también funcionaría en A100 80GB o H100 80GB, aunque con mayor ancho de banda y posiblemente mejor rendimiento.
- Interconnect: sin NVLink ni P2P en la configuración de prueba; el tráfico entre tarjetas pasa por la RAM del host. Se recomienda PCIe 4.0 o superior para prefill eficiente.
- Memoria host: 96 GB DDR5 (92 GiB utilizables), de los cuales ≈48 GiB quedan fijados por la tabla n-gram sidecar.
- Software: NVIDIA driver 610.43, CUDA 13.3, PyTorch 2.13, Triton 3.7.1, NCCL 2.29.7, y un fork de SGLang llamado `fp6-stable` incluido en `patches/`.
- Opciones de despliegue: SGLang (fork específico), posiblemente vLLM si se adapta, aunque no se menciona. llama.cpp no es compatible con este formato de pesos.
- Latencia y throughput: 61 tok/s single-stream, ≈101 tok/s agregado con 3 streams; TTFT de 0,3 s para prompts cortos.

## Comparativa con modelos similares

| Modelo | Params totales | Params activos | Contexto | Licencia | Formato | Velocidad (single-stream) |
|---|---|---|---|---|---|---|
| Qwen3.8-Flash-Next (FP8 oficial) | 180 B (125+51) | 6 B | 262 144 | qwen-community-license-1.0 | FP8 | no disponible (probablemente más lento por mayor peso) |
| Soomin33 v1 (FP6) | 98 B (safetensors) | 6 B | 262 144 | qwen-community-license-1.0 | FP6+BF16 | 54–56 tok/s |
| Soomin33 v2 (FP6-INT8, este modelo) | 98 B (safetensors) | 6 B | 262 144 | qwen-community-license-1.0 | FP6+INT8+BF16 | 61 tok/s |

La v2 mejora la v1 en velocidad (+10 %) y en capacidad de KV pool (+45 %), manteniendo el mismo contexto. Frente al checkpoint FP8 oficial, esta cuantización reduce el tamaño en disco de 156 GB a ~98 GB y permite un despliegue en 2×64 GB, aunque requiere un fork de SGLang y hardware específico. No se dispone de comparativas con otros modelos MoE de tamaño similar (p. ej., Mixtral 8x22B o DeepSeek-V3) en la información disponible.

## Limitaciones y advertencias

- La cuantización fp6 e2m3 e int8 introduce una pérdida de precisión no cuantificada en términos de calidad de salida; el autor reporta errores RMS relativos en los tensores, pero no hay evaluaciones de benchmarks.
- El hardware de referencia (CMP 170HX) tiene limitaciones severas: sin NVLink, PCIe gen2 x4, sin soporte de formatos tensor-core fp8/fp6/int8. El rendimiento reportado es específico de esa configuración y puede variar en otros entornos.
- La estabilidad se ha logrado tras corregir múltiples fallos (MMU faults, contextos CUDA envenenados, OOM en logprobs). Aunque el autor afirma que no ha habido crashes desde las correcciones, el despliegue en producción requiere validación adicional.
- La tabla n-gram se sirve desde RAM del host fijada (≈48 GiB), lo que obliga a un host con al menos 96 GB de RAM y puede convertirse en cuello de botella si el ancho de banda PCIe es insuficiente.
- La licencia qwen-community-license-1.0 es una licencia comunitaria de Qwen; es necesario revisar sus términos exactos para uso comercial, aunque generalmente permite uso comercial con atribución y restricciones sobre redistribución.
- El modelo es experimental (tag `qwen4_exp`) y no hay garantía de soporte a largo plazo por parte de Alibaba ni del autor.
- No se especifican los idiomas soportados ni los sesgos potenciales; se recomienda realizar evaluaciones de sesgo antes de uso en producción.
- La velocidad de decodificación depende de la longitud de aceptación MTP (1,78 tokens de media); si el modelo falla en la predicción multi-token, el rendimiento podría degradarse.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Soomin33/Qwen3.8-Flash-Next-FP6-INT8
- Repositorio v1 (FP6): https://huggingface.co/Soomin33/Qwen3.8-Flash-Next-FP6
- Modelo base oficial (FP8): https://huggingface.co/Qwen/Qwen3.8-Flash-Next-FP8
- Modelo original (bf16): https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- GitHub oficial del modelo: https://github.com/QwenLM/Qwen3.8-Flash-Next/
- GitHub espejo con documentación: https://github.com/ai-integr8tor/QwenLM_Qwen3.8-Flash-Next
- Recetas de vLLM para el modelo: https://recipes.vllm.ai/Qwen/Qwen3.8-Flash-Next
