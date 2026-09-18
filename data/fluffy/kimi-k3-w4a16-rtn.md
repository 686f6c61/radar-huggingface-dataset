# Fluffy/Kimi-K3-W4A16-RTN

## Resumen

Kimi-K3-W4A16-RTN es una cuantización de solo pesos (weight-only) del modelo Kimi K3 de Moonshot AI, publicada por el usuario Fluffy en Hugging Face. El modelo base es un transformer de mezcla de expertos (MoE) con 2,8 billones de parámetros totales y unos 104.000 millones de parámetros activados por token. Esta compilación reencodea los expertos enrutados y las proyecciones de atención desde MXFP4/BF16 a tensores comprimidos int4/int8, de forma que K3 pueda cargarse y generar en una única GPU NVIDIA A100 de 80 GB, manteniendo los expertos enrutados en la RAM del host.

El problema que resuelve es de disponibilidad: no existía una compilación de K3 orientada a Ampere para vLLM y el modelo original no cabe en una sola A100. La cuantización es RTN (round-to-nearest) sin datos de calibración, servida por los kernels Marlin de vLLM, con activaciones en BF16 (W4A16 para atención y expertos enrutados, W8A16 para expertos compartidos).

Es relevante porque demuestra que un MoE de escala trillón puede ejecutarse en hardware de una sola GPU mediante offload a CPU, a costa de un rendimiento muy bajo: aproximadamente 1 token/s y una carga de modelo de entre 98 y 114 minutos desde almacenamiento en red. El repositorio ocupa 1.411,7 GB y, en el momento de la consulta, acumulaba 16 descargas y 0 likes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atención MLA; cuantización weight-only servida con kernels Marlin de vLLM |
| Parametros totales | 2.739.158.274.816 (≈2,74 billones); el autor declara 2,8 T |
| Parametros activos | ~104.000 millones (104 B) por token |
| Longitud de contexto | 8.192 tokens en la receta de referencia (max_model_len); contexto nativo de Kimi K3 no disponible |
| Tipos de cuantizacion | int4 channelwise symmetric (expertos enrutados), int4 group size 128 symmetric (proyecciones self_attn.*), int8 channelwise symmetric (expertos compartidos); activaciones BF16; empaquetado compressed-tensors pack-quantized. Embeddings, lm_head, gates del router, norms y torre de visión permanecen en BF16 |
| Idiomas soportados | no disponible |
| Licencia | kimi-k3-license (etiquetada como "other" en Hugging Face) |
| Formato de pesos | safetensors con compressed-tensors; requiere vLLM y trust_remote_code |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Kimi K3: un transformer de mezcla de expertos con 896 expertos enrutados por capa en 92 capas MoE, expertos compartidos y atención MLA (el autor indica que el KV cache en fp8 es rechazado en Ampere precisamente por MLA). El repositorio conserva la torre de visión en BF16 (la pipeline es image-text-to-text) y no modifica embeddings, lm_head, gates del router ni normas. No se documenta en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF/DPO en el modelo base.

El proceso de cuantización reencoda los pesos desde MXFP4/BF16 a compressed-tensors con round-to-nearest, sin datos de calibración ("no dataset is baked into these weights"), y aplica búsqueda de clip en expertos enrutados y expertos compartidos. Los errores se midieron haciendo un round-trip de cada tensor por `compress()`/`decompress()`; el propio autor advierte que el error de pesos es un proxy y no una medida de calidad.

| Componente | Esquema | Tamaño | Error RMS añadido |
|---|---|---|---|
| Expertos enrutados (896 × 92 capas MoE) | int4, channelwise, simétrico, RTN + búsqueda de clip | 1.267,88 GiB | 8,07 % frente a los valores MXFP4 publicados |
| Atención (todas las self_attn.*proj) | int4, group size 128, simétrico, RTN | 16,85 GiB | 10,32 % frente a BF16 |
| Expertos compartidos | int8, channelwise, simétrico, RTN + búsqueda de clip | 11,32 GiB | 0,95 % frente a BF16 |
| Embeddings, lm_head, gates del router, norms y torre de visión | BF16 sin cambios | ~16,5 GiB | — |
| Total | | ~1.314,6 GiB | |

La elección de cuantización channelwise responde a una restricción de memoria: durante la preparación posterior a la carga, la ruta Marlin MoE de vLLM materializa las escalas de cuantización en la GPU, donde el offloader de CPU no llega, por lo que el conjunto de escalas debe caber en la VRAM restante. Para los expertos de K3 eso supone unos 158 GB en MXFP4, unos 39,6 GB en int4 g128 y unos 1,5 GB en channelwise; como Marlin solo admite group sizes {-1, 32, 64, 128}, channelwise era el único esquema viable, a costa de ~1,1 puntos más de error de pesos frente a g128. Los expertos compartidos se ejecutan en todos los tokens y residen en GPU, por lo que pasarlos a int8 reduce su error del 10,15 % al 0,95 % a cambio de +5,4 GiB y sin ralentización medible.

## Capacidades

- Generación de texto con modo thinking: la plantilla de chat de K3 vive en `tokenization_kimi.py` (código personalizado, no un `chat_template` Jinja) y activa el pensamiento por defecto con `thinking_effort="max"`; puede bajarse a `"low"`.
- Razonamiento: GPQA Diamond medido por el autor en 0,843 ± 0,026 con esfuerzo bajo (198 preguntas, 1 epoch).
- Visión e image-text-to-text: la torre de visión se mantiene en BF16; la entrada de imagen se verificó a través de `LLM.chat()` con `chat_template_kwargs={"thinking": True, "thinking_effort": "low"}`.
- OCR y comprensión de documentos: OCRBench 0,879 ± 0,010 sobre 1.000 muestras con esfuerzo bajo.
- Tool calling / function calling: no disponible; no se documenta en la model card.
- Agentes y razonamiento multi-paso: no confirmado; el modo thinking permite cadenas de razonamiento largas, pero no hay datos de rendimiento agéntico publicados.
- Capacidades multilingües: no disponible.
- Parámetros de muestreo publicados por Moonshot para evaluación: temperature=1.0, top_p=0.95.

## Casos de uso

- Auditoría de resultados de Kimi K3 en hardware limitado: con una A100 de 80 GB y ~1,3 TB de RAM se puede reproducir GPQA Diamond usando el verificador oficial Kimi-Vendor-Verifier y comparar contra las puntuaciones publicadas por Moonshot.
- Generación de datos sintéticos por lotes: a ~1 tok/s no es interactivo, pero un job nocturno con 32 peticiones concurrentes rinde ~1,6 tok/s agregados; sirve para producir corpus de instrucciones o respuestas destiladas donde la latencia no importa.
- Procesamiento OCR y documental en cola: con OCRBench 0,879 resulta adecuado para digitalizar y extraer información de documentos en lotes planificados, no para atención en tiempo real.
- Investigación en cuantización: el repositorio documenta el error RMS por componente y justifica decisiones concretas (channelwise frente a g128, int8 en expertos compartidos), lo que lo convierte en un caso de estudio reproducible de RTN sin calibración sobre un MoE de escala trillón.
- Razonamiento científico tolerante a latencia: GPQA Diamond 0,843 en modo low permite integrarlo en pipelines de evaluación de preguntas de nivel doctorado donde esperar minutos por respuesta es aceptable.
- Verificación de licencia y conformidad: al ser una cuantización derivada del K3 original, permite validar los requisitos de kimi-k3-license y los flujos de redistribución antes de comprometerse con el modelo completo.
- Pruebas de infraestructura de offload CPU/GPU: sirve para medir la viabilidad real de servir MoE masivos con expertos en RAM del host, incluida la planificación de ancho de banda PCIe y el dimensionado de KV cache (108.544 tokens en BF16 con max_model_len=8192).

## Benchmarks y rendimiento

| Benchmark | Esta compilación (int4, esfuerzo bajo) | Kimi K3 oficial (precisión completa, esfuerzo máximo) |
|---|---|---|
| OCRBench (1.000 muestras) | 0,879 ± 0,010 | 0,89 |
| GPQA Diamond (198 preguntas, 1 epoch) | 0,843 ± 0,026 | 0,935 |

Advertencia del autor: las cifras de esta compilación se obtuvieron con `thinking_effort="low"`, mientras que las oficiales son con esfuerzo `max`, y no existe referencia pública de esfuerzo bajo, por lo que la comparación no es equivalente; cada diferencia mezcla pérdida por cuantización y reducción del razonamiento, y no se pueden separar. Ambas se ejecutaron con el Kimi-Vendor-Verifier de Moonshot (commit `3dad...`, truncado en la model card).

| Métrica de rendimiento | Valor |
|---|---|
| Carga del modelo | 98–114 min desde almacenamiento en red |
| Memoria de GPU | 46,15 GiB de pesos; 69,1 de 79,3 GB usados con gpu_memory_utilization=0.90 |
| KV cache | 108.544 tokens (BF16) con max_model_len=8192 |
| Decode, petición única | 0,91–0,96 tok/s |
| Decode, 32 concurrentes | ~1,6 tok/s agregados (solo ~1,7× respecto a uno) |
| Prefill | ~49 s por forward pass + ~11 ms/token (512–4.096 tokens); un prompt de 4.096 tokens tarda ~94 s (~44 tok/s) |

El decode está limitado por ancho de banda: unos 28 GiB de pesos de expertos cruzan PCIe por cada token generado, a 28,7 GB/s (91 % de gen4 x16), lo que explica que el batching apenas mejore el rendimiento agregado.

## Requisitos de hardware

- GPU: 1 × A100-SXM4-80GB (compute capability 8.0), PCIe gen4 x16. El autor indica que otras configuraciones no se han probado.
- RAM del host: ~1,3 TB consumidos por los expertos descargados a CPU (probado en una máquina de 2 TB).
- Disco: ~1,3 TiB (el repositorio pesa 1.411,7 GB).
- VRAM: 46,15 GiB de pesos en GPU y 69,1 de 79,3 GB ocupados con `gpu_memory_utilization=0.90`; el KV cache en fp8 es rechazado en Ampere para MLA.
- GPU de consumo: no cabe. No hay variante para RTX 4090, RTX 5090 ni GPUs de gama alta doméstica, porque el requisito combinado es 80 GB de VRAM más ~1,3 TB de RAM.
- Despliegue: exclusivamente vLLM 0.28.0 con compressed-tensors 0.17.0 y PyTorch 2.13.0, con `linear_backend="marlin"`, `cpu_offload_gb=1400`, `cpu_offload_params=["experts"]`, `enforce_eager=True` y `trust_remote_code=True`. No hay soporte GGUF, llama.cpp, Ollama ni TGI en la información disponible.
- Variables de entorno obligatorias: `VLLM_WEIGHT_OFFLOADING_DISABLE_PIN_MEMORY=1` (sin ella vLLM fija los pesos dos veces y la carga falla); no definir `PYTORCH_CUDA_ALLOC_CONF=expandable_segments:True` (incompatible con el offload UVA, falla con "cudaHostAlloc failed").
- Latencia y throughput: solo se documentan para la configuración de referencia (véase la tabla de rendimiento de la sección anterior).

## Comparativa con modelos similares

| Modelo | Parámetros totales / activos | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Fluffy/Kimi-K3-W4A16-RTN | 2,74 B / ~104 B | 8.192 tokens en la receta de referencia | OCRBench 0,879; GPQA Diamond 0,843 (esfuerzo bajo) | kimi-k3-license ("other") | safetensors + compressed-tensors, vLLM 0.28.0, 1×A100 80GB + ~1,3 TB RAM |
| moonshotai/Kimi-K3 (base, MXFP4/BF16) | 2,8 B / 104 B | no disponible | OCRBench 0,89; GPQA Diamond 0,935 (esfuerzo máximo) | kimi-k3-license | pesos originales; no cabe en una sola A100 de 80 GB |
| Otras cuantizaciones int4 de K3 para Ampere | no disponible | no disponible | no disponible | no disponible | el autor afirma que no existía ninguna compilación de K3 orientada a Ampere para vLLM |

No se han proporcionado datos de otros modelos comparables de la misma categoría en la información disponible.

## Limitaciones y advertencias

- Rendimiento: ~1 tok/s en petición única y ~1,6 tok/s con 32 concurrentes; el propio autor enmarca el modelo como algo "útil si tienes una A100 y quieres ejecutar K3, aunque sea a duras penas".
- Requisitos extremos: ~1,3 TB de RAM y ~1,3 TiB de disco, además de la A100 de 80 GB; inviable en la mayoría de entornos de desarrollo.
- Cuantización sin calibración: RTN puro con búsqueda de clip; error RMS añadido del 8,07 % en expertos enrutados y del 10,32 % en atención. El autor subraya que el error de pesos es un proxy, no una medida de calidad.
- Evaluación no equivalente: las cifras se midieron con esfuerzo bajo frente al esfuerzo máximo oficial; la caída de GPQA Diamond de 0,935 a 0,843 mezcla pérdida por cuantización y menor razonamiento y no se puede descomponer.
- Sesgos: no disponible; no se publica ningún análisis de sesgo específico de esta compilación.
- Alucinación: riesgo esperable en un modelo de razonamiento de gran escala, pero no hay mediciones específicas para esta cuantización; a ~1 tok/s no resulta práctico como fuente de verdad interactiva.
- Idiomas y cobertura multilingüe: no disponible.
- Licencia: kimi-k3-license, marcada como "other" en Hugging Face; hay que revisar el archivo LICENSE antes de cualquier uso comercial y no se confirma el permiso de redistribución de la cuantización.
- Producción: solo probado en una configuración concreta (1×A100 80GB, PCIe gen4 x16, máquina de 2 TB, vLLM 0.28.0); sin `VLLM_WEIGHT_OFFLOADING_DISABLE_PIN_MEMORY=1` la carga falla a mitad.
- Seguridad de ejecución: la plantilla de chat está implementada en `tokenization_kimi.py` y exige `trust_remote_code=True`, lo que implica ejecutar código del repositorio.
- Ecosistema: sin soporte GGUF, llama.cpp, Ollama ni TGI, y sin variantes de 2 bits o para GPUs de consumo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Fluffy/Kimi-K3-W4A16-RTN
- Modelo base: https://huggingface.co/moonshotai/Kimi-K3
- Licencia: archivo LICENSE del repositorio de Hugging Face (kimi-k3-license)
- compressed-tensors: https://github.com/neuralmagic/compressed-tensors
- Kimi-Vendor-Verifier (verificador usado en la evaluación): https://github.com/MoonshotAI/Kimi-Vendor-Verifier
- vLLM: https://github.com/vllm-project/vllm
- Nota sobre la búsqueda web: no se encontraron enlaces relevantes al modelo; los resultados devueltos correspondían a traducciones del término "fluffy", un gestor de mods y una marca de pancakes, sin relación con Kimi K3 ni con esta cuantización.
