# diffbot/MiMo-V2.6-Flash-MOPD-FP8KV-W4A8-2x-RTX-PRO-6000

## Resumen

Este repositorio no contiene los pesos del modelo, sino una receta de despliegue (runtime quantization + parches de vLLM + kernels CUDA) para ejecutar MiMo-V2.6-Flash-MOPD de Xiaomi sobre dos tarjetas RTX PRO 6000 Blackwell (sm_120, 96 GB cada una, PCIe sin NVLink) con vLLM en tensor-parallel 2. El checkpoint base es un modelo omnímodo de arquitectura Mixture of Experts con 309B parámetros totales y 15B activos, expertos en MXFP4 y capas densas en FP8, capaz de aceptar texto, imagen, vídeo y audio como entrada.

El problema que resuelve es de eficiencia de servicio: el autor reporta 2,1× la velocidad de decodificación y 1,6× la de prefill respecto a la imagen stock de vLLM sobre el mismo hardware, manteniendo contexto de 256K y los cuatro modos de entrada activos. El checkpoint MOPD (liberado por Xiaomi el 27 de septiembre de 2026) está orientado a mitigar la repetición en llamadas a herramientas dentro de entornos de agentes, y comparte configuración y drafter DFlash con la variante Flash-RL, por lo que la receta lo sirve sin cambios.

La relevancia actual reside en que demuestra que un MoE omnímodo de 309B puede servirse con latencias de producción en dos GPUs de 96 GB sin NVLink, combinando cuantización FP8 de la caché KV, MoE en W4A8-FP8 sobre Marlin, decodificación especulativa con DFlash y kernels de atención personalizados para sm_120. El repositorio acumula 12 likes y 0 descargas en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) transformer omnímodo (any-to-any), con atención DiffKV y 9 capas globales |
| Parametros totales | 309B |
| Parametros activos | 15B |
| Longitud de contexto | 256K (262K en la receta base) |
| Tipos de cuantizacion | MXFP4 (expertos), FP8 (capas densas), W4A8-FP8 (runtime, Marlin), FP8 E4M3 KV cache, bf16 KV (stock) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | Checkpoint oficial en MXFP4 + FP8 (no redistribuido en este repositorio); la receta aplica cuantización en runtime |
| Parametros del repositorio | Receta de despliegue: imagen, launcher, parches de vLLM, kernels CUDA, tests y scripts de benchmark |
| Hardware objetivo | 2× NVIDIA RTX PRO 6000 Blackwell (sm_120), 96 GB por tarjeta, PCIe, sin NVLink |
| Paralelismo | Tensor-parallel 2 (TP2) |

## Arquitectura y entrenamiento

El modelo base es un transformer Mixture of Experts de 309B parámetros totales y 15B activos, con expertos cuantizados en MXFP4 y capas densas en FP8. Incorpora atención DiffKV con 9 capas globales, sobre las que esta receta aplica un kernel CUDA de prefill específico que rinde 1,34× el kernel Triton equivalente. La pila de decodificación especulativa usa un drafter DFlash con 3 tokens de borrador (frente a los 7 de la configuración de referencia). Es un modelo omnímodo nativo: acepta entradas de texto, imagen, vídeo y audio.

Sobre el entrenamiento no se detalla en la información disponible el número de tokens, la composición del dataset ni si hubo fases de RLHF o DPO; el sufijo MOPD indica que el checkpoint está orientado a tareas de agentes autónomos, concretamente a reducir la repetición en llamadas a herramientas. La innovación destacable de este repositorio es de despliegue, no de entrenamiento: caché KV en FP8 (E4M3) para las capas DiffKV (vLLM stock solo admite bf16 ahí, lo que duplica el pool de KV), MoE W4A8-FP8 sobre Marlin con `VLLM_MARLIN_INPUT_DTYPE=fp8` (+15 % de prefill sin pérdida de calidad), tres correcciones al kernel Triton DiffKV de vLLM (split-KV para el paso de verificación especulativa, tiles de prefill anchos y K/V en fp8), un kernel CUDA de atención de prefill para las 9 capas globales, y un kernel de decodificación MoE de lote pequeño sobre el layout FP4 de b12x (opt-in, supera a Marlin entre 8 y 32 tokens enrutados). También se incluye un loader de QKV exacto que evita la recuantización por rango que aplica vLLM por debajo de TP4.

## Capacidades

- Generación de texto en modo any-to-any con entrada de texto, imagen, vídeo y audio.
- Razonamiento matemático: el checkpoint obtiene 98,5 % en GSM8K-200 en la configuración por defecto.
- Llamadas a herramientas (tool calling) y flujos de agente multi-paso; el checkpoint MOPD está específicamente orientado a evitar la repetición en llamadas a herramientas.
- Despliegue multiagente: soporta fan-out de 20 agentes concurrentes con caché KV en CPU.
- Contexto largo: ventana de 256K tokens con pool de KV de 479K tokens en FP8 con todos los codificadores cargados.
- Recuperación de información en contexto largo: pasa pruebas de aguja (needle) a 4,6K, 29K y 336K tokens.
- Capacidades omnímodas verificadas: probes de imagen, vídeo y audio superados en la configuración por defecto.
- Servicio concurrente: mantiene decodificación plana desde 2K hasta 46K de contexto y 131 tok/s a 180K.

## Casos de uso

- Agentes autónomos con uso intensivo de herramientas: el checkpoint MOPD está diseñado para reducir la repetición en llamadas a funciones dentro de harnesses de agentes, lo que lo hace adecuado para bucles de razonamiento multi-paso con tool calling encadenado.
- Fan-out multiagente: la receta mide 20 agentes × 3 turnos de ≈40K tokens sobre 8 slots en 76,8 s, gracias al tier de KV en CPU; sirve para orquestadores que atienden a muchos agentes concurrentes sobre el mismo modelo.
- Atención al cliente omnicanal: al aceptar texto, imagen, audio y vídeo, un mismo endpoint puede procesar capturas de pantalla, notas de voz o clips de vídeo del usuario junto al texto de la conversación, con contexto de 256K para hilos largos.
- Análisis de documentos extensos y RAG: el pool de KV de 479K tokens en FP8 permite mantener en memoria bases documentales amplias, útil para consulta sobre contratos, informes técnicos o expedientes.
- Asistentes con memoria larga y verificación: la decodificación especulativa con DFlash y el split-KV en verificación mantienen la velocidad de decodificación (≈180-193 tok/s a 46K en un stream), adecuada para respuestas largas con contexto persistente.
- Extracción y comprensión de vídeo/audio para pipelines de contenido: transcripción, resumen y etiquetado combinando las cuatro modalidades de entrada, aprovechando el prefill de 10.177 tok/s a 46K.
- Evaluación de razonamiento y matemáticas: con 98,5 % en GSM8K-200 es viable como modelo de referencia para tareas de resolución de problemas paso a paso en entornos de producción controlados.

## Benchmarks y rendimiento

Datos medidos en dos RTX PRO 6000 Blackwell Max-Q a 300 W, PCIe, TP2, con una carga de 20 agentes y prompts de ≈46K tokens con ratio prefill:decode de 61:1. La tabla de ablación se midió sobre Flash-RL; MOPD está dentro del ruido en todas las filas replicadas.

| Configuracion | Prefill 46K, 1 stream (tok/s) | TTFT 46K | Decode 46K, 1 stream | 46K, 4 streams: prefill / decode | 100K, 4 streams: prefill / decode | Fan-out 20 agentes | GSM8K-200 |
|---|---:|---:|---:|---:|---:|---:|---:|
| Base (imagen stock) | 6.230 | 7,4 s | 87-94 | 12.588 / 263 | – | 346 s | 98,0 % |
| + split-KV para el paso de verificación | 6.130 | 7,5 s | 156-164 | 12.340 / 335 | – | 344 s | 98,5 % |
| + 3 tokens de borrador en lugar de 7 | 6.160 | 7,4 s | 168-175 | 12.320 / 386 | – | – | – |
| + tiles de prefill anchos, tier KV en CPU | 8.460 | 5,4 s | 158-175 | 16.873 / 385 | – | 97,9 s | 98,5 % |
| + todos los modos de entrada, cache KV FP8 | 8.210 | 5,6 s | 180-188 | 16.413 / 397 | – | 92,0 s | 98,5 % |
| + un programa por verificación completa | 8.337 | 5,5 s | 187-191 | 16.608 / 412 | 13.334 / 348 | 92,3 s | 99,0 % |
| + MoE W4A8-FP8 (Marlin) | 9.532 | 4,8 s | 184-199 | 18.964 / 411 | 14.757 / 367 | 80,7 s | 98,5 % |
| + kernel CUDA de atención de prefill (por defecto) | 10.177 | 4,5 s | 189-193 | 20.514 / 416 | 16.840 / 366 | 76,8 s | 98,0 % |

Comparación directa Flash-RL frente a MOPD con la misma sesión y ajustes:

| Metrica | Flash-RL | MOPD |
|---|---:|---:|
| Prefill 46K / TTFT | 10,0-10,2K / 4,5-4,6 s | 10,1K / 4,5-4,6 s |
| Decode 46K, 1 stream | 184-185 | 180-182 |
| 46K, 4 streams: prefill / decode | 20,6K / 419 | 20,2K / 430 |
| Fan-out 20 agentes | 75,5 s | 77,1 s |
| GSM8K-200 | 97,5 % | 98,5 % |
| Needle 4,6K/29K, tool calls, imagen/vídeo/audio | pasa | pasa |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, etc.) en la información disponible.

## Requisitos de hardware

- VRAM: 2× 96 GB = 192 GB en dos RTX PRO 6000 Blackwell Max-Q (sm_120). El checkpoint oficial en MXFP4 + FP8 ocupa de forma que no admite una sola tarjeta de 96 GB según la receta publicada.
- Configuración de referencia: dos tarjetas por PCIe sin NVLink, tensor-parallel 2; las reducciones de 32 MB están limitadas por el ancho de PCIe, con NCCL en el suelo del enlace.
- No cabe en GPU de consumo: una RTX 4090 (24 GB) o similar no puede alojar 309B parámetros ni siquiera con la cuantización aplicada.
- Despliegue: vLLM sobre una imagen personalizada (`vllm/vllm-openai:mimo-v26-x86_64-cu130` como base stock), con parches propios, kernels CUDA para sm_120 y compilación específica. Se incluye launcher (`serve.sh`), parches, tests y scripts de benchmark en `recipe/`.
- Alternativas de despliegue como llama.cpp, Ollama o TGI no están contempladas en la receta.
- Pool de KV: 479K tokens en FP8 con todos los codificadores cargados (la receta base baja a 293K con chunks de prefill de 8192 tokens).
- Throughput: 10.177 tok/s de prefill a 46K en un stream con TTFT de 4,5 s; 189-193 tok/s de decode a 46K; 20.514 / 416 tok/s con 4 streams a 46K; 16.840 / 366 tok/s a 100K.
- Degradación con contexto: la decodificación se mantiene plana de 2K a 46K y cae a 131 tok/s a 180K.
- Fan-out medido: 20 agentes × 3 turnos (≈40K tokens cada uno) sobre 8 slots en 76,8 s.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiMo-V2.6-Flash-MOPD (este checkpoint) | 309B / 15B | 256K | texto, imagen, vídeo, audio | MIT | Receta de despliegue en este repositorio; pesos en XiaomiMiMo/MiMo-V2.6-Flash-MOPD |
| MiMo-V2.6-Flash-RL | 309B / 15B | 256K | texto, imagen, vídeo, audio | MIT | Receta análoga en diffbot/MiMo-V2.6-Flash-RL-FP8KV-W4A8-2x-RTX-PRO-6000 |
| MiMo-V2.6-Pro | no disponible | no disponible | multimodal | no disponible | Modelo más capaz de la serie según Xiaomi |
| MiMo-V2.6-Pro-MOPD | no disponible | no disponible | multimodal | no disponible | Variante MOPD del Pro, publicada junto al Flash-MOPD |

Flash-RL y Flash-MOPD comparten configuración y drafter DFlash, con rendimiento equivalente dentro del ruido; la diferencia es el objetivo de entrenamiento frente a la repetición en tool calling. El Pro ofrece mayor capacidad según el fabricante, sin datos técnicos disponibles en la información consultada.

## Limitaciones y advertencias

- La información no especifica idiomas soportados; no se puede garantizar cobertura multilingüe más allá de lo observado en los benchmarks, que son en inglés.
- No se detallan sesgos conocidos ni la composición del dataset de entrenamiento.
- Riesgo de alucinación inherente a modelos de esta escala, no cuantificado en la información disponible.
- El repositorio no redistribuye los pesos: hay que descargar el checkpoint oficial de Xiaomi por separado, con sus propios términos.
- La licencia del repositorio es MIT, pero conviene verificar los términos del checkpoint base para uso comercial.
- La receta está fuertemente acoplada a hardware sm_120 (Blackwell) y a versiones concretas de vLLM (0.6.18/0.7.0); no es portable a arquitecturas anteriores sin reescribir los kernels.
- El autor documenta varios intentos medidos que no funcionaron en este hardware: MoE MXFP4 de b12x en solitario (−45 % de decode con 4 streams), MTP en lugar de DFlash, chunks de prefill de 8192 tokens (reduce el pool KV de 479K a 293K), all-reduce personalizado o FlashInfer (limitado por PCIe), kernels fusionados SM120 192×128 de FlashInfer, FP8 QKᵀ (−8 % de tiempo pero 7× el error) y 2 CTAs/SM (spills).
- El loader fusionado FP8-QKV de vLLM recuantizaba pesos por rango por debajo de TP4; esta receta lo corrige, pero `VLLM_MIMO_EXACT_QKV=0` restaura el comportamiento antiguo, lo que puede degradar calidad de forma sutil.
- Los números de benchmark se midieron sobre Flash-RL en una carga concreta (20 agentes, 46K tokens, ratio 61:1) y con un proceso lateral de ≈2,5 GB/GPU residente; otras cargas pueden diferir.
- 0 descargas registradas en el momento de la consulta, lo que limita la validación independiente de la receta.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/diffbot/MiMo-V2.6-Flash-MOPD-FP8KV-W4A8-2x-RTX-PRO-6000
- Checkpoint base: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Flash-MOPD
- Checkpoint alternativo Flash-RL: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Flash-RL
- Receta análoga para Flash-RL: https://huggingface.co/diffbot/MiMo-V2.6-Flash-RL-FP8KV-W4A8-2x-RTX-PRO-6000
- Discusión en HuggingFace: https://huggingface.co/diffbot/MiMo-V2.6-Flash-RL-FP8KV-W4A8-2x-RTX-PRO-6000/discussions/1
- Página oficial de la serie MiMo-V2.6: https://mimo.xiaomi.com/mimo-v2-6
- Modelo MiMo-V2.6-Flash en Xiaomi: https://mimo.mi.com/models/en-US/mimo-v2.6-flash
- Cobertura de la liberación de MOPD: https://localmodelwatch.tsuchitsuchi.com/en/2026/09/28/xiaomi-mimo-v2-6-mopd-models/
- Parche de vLLM citado (#874, local-inference-lab): https://github.com/local-inference-lab/vllm/pull/874
