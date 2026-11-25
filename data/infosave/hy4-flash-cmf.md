# infosave/Hy4-flash-cmf

## Resumen

Hy4-flash-cmf es una distribución cuantizada del modelo Tencent Hy4-flash, publicada por el usuario infosave en formato CMF (Cortiq Model Format) para su uso con cortiq, un motor de inferencia escrito en Rust que no depende de Python ni de frameworks de machine learning. El modelo base, publicado por Tencent el 17 de noviembre de 2026, es un transformer de tipo Mixture of Experts con 220 000 millones de parámetros totales y 12 000 millones activos, diseñado para generación de texto multilingüe (inglés, chino y ruso) y con una torre de visión incluida en los pesos aunque el motor cortiq solo procesa texto por ahora.

La relevancia de esta publicación radica en que hace ejecutable un modelo de 220B en hardware de consumo y en GPUs profesionales de gama alta mediante cuantizaciones agresivas (q4tp y q2tp) y una gestión de memoria que combina VRAM y RAM del sistema: los expertos enrutados viven en memoria host y la GPU conserva los más calientes. Según la model card, en una RTX PRO 6000 de 96 GB el archivo q2tp alcanza 65,1 tok/s de decodificación, y con solo 24 GB de VRAM asignados mantiene 37,4 tok/s.

El modelo emplea una arquitectura con 512 expertos de los que se enrutan 16 por token, atención mixta (30 capas de ventana deslizante y 12 capas de atención dispersa), cuatro flujos residuales y tablas de bigramas y trigramas (Engram) consultadas en cuatro capas. Los archivos CMF ocupan entre 122,8 GB y 150,5 GB, lo que exige planificación cuidadosa del almacenamiento y de la jerarquía de memoria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atención mixta (30 capas sliding-window + 12 capas sparse), 4 flujos residuales y tablas Engram (bigramas/trigramas) en 4 capas |
| Parametros totales | 220B (modelo base Tencent Hy4-flash) |
| Parametros activos | 12B (16 de 512 expertos enrutados por token, latente de 1536) |
| Longitud de contexto | No disponible de forma explícita; la model card menciona degradación de rendimiento en Vulkan más allá de 2048 tokens (el indexador de las capas sparse pasa a la CPU) |
| Tipos de cuantizacion | q4tp (expertos gate/up 4-bit, down 4-bit, resto 8-bit), q2tp (expertos gate/up 2-bit, down 4-bit, resto 4-bit), q2tp-sfq (q2tp con calibración SFq: escala por canal en el latente y GPTQ con refinamiento de código) |
| Idiomas soportados | Inglés, chino, ruso |
| Licencia | tencent-hy-license (licencia propia de Tencent, etiquetada como "other") |
| Formato de pesos | CMF (Cortiq Model Format), archivos mapeados en memoria; convertidos desde la release FP8 del modelo base (e4m3 con escalas de bloque 128×128) más los shards de atención en bf16 |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos con 220B parámetros totales y 12B activos. La arquitectura combina 30 capas de atención de ventana deslizante con 12 capas de atención dispersa, mantiene cuatro flujos residuales en paralelo y añade un mecanismo denominado Engram que consulta tablas de bigramas y trigramas en cuatro capas, una innovación orientada a capturar patrones locales de secuencia sin coste de atención. El enrutamiento selecciona 16 de 512 expertos por token sobre un latente de 1536 dimensiones.

La información disponible no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en el modelo base. Los archivos CMF se obtuvieron convirtiendo la release FP8 del modelo (e4m3 con escalas de bloque 128×128, decodificadas de forma exacta) y superponiendo los shards de atención en bf16 del repositorio original. La variante q2tp-sfq aplica una calibración específica sobre los expertos enrutados: escala por canal en el latente y GPTQ con refinamiento de código, calibrada sobre 98 304 tokens de texto en inglés, chino y Rust, lo que mejora la perplejidad en código a costa de empeorarla en prosa. La torre de visión viaja incluida en los archivos, aunque cortiq solo lee texto actualmente.

## Capacidades

- Generación de texto multilingüe en inglés, chino y ruso.
- Razonamiento y respuesta directa: el flag `--no-think` solicita respuestas sin cadena de pensamiento, lo que implica que el modelo base soporta un modo de razonamiento explícito.
- Generación de código: la variante q2tp-sfq está específicamente calibrada para mejorar el rendimiento en código (Rust como referencia de evaluación).
- Procesamiento de lenguaje natural general con contexto largo, limitado en la práctica por la gestión de memoria del motor y por la degradación de las capas sparse más allá de 2048 tokens en el backend Vulkan.
- Capacidad de visión presente en los pesos (torre de visión incluida), pero no accesible a través de cortiq en la versión documentada.
- Servido mediante API compatible con OpenAI: el comando `cortiq serve` expone el endpoint `/v1/chat/completions`.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado explícitamente en la información proporcionada.

## Casos de uso

- Inferencia local de un modelo de 220B en estación de trabajo con GPU profesional: con una RTX PRO 6000 de 96 GB y el archivo q2tp se obtienen 65,1 tok/s, suficiente para asistentes interactivos de código o documentación sin depender de APIs externas.
- Despliegue en GPUs de 24 GB con offloading a RAM: limitando la VRAM a 24 GB, q2tp mantiene 37,4 tok/s y q4tp 25,8 tok/s, lo que permite servir el modelo en una RTX 4090 o similar para tareas de generación por lotes y chat.
- Generación y revisión de código en pipelines de CI/CD: la variante q2tp-sfq reduce la perplejidad en Rust de 4,64 a 4,30 respecto a q2tp, lo que la hace preferible para tareas de autocompletado y revisión de código en ese lenguaje.
- Procesamiento de documentación en chino e inglés: la perplejidad en documentación china es de 36,08 (q2tp) y 39,13 (q4tp) en ventanas de 512 tokens, adecuada para resumen y extracción de información en corpus bilingües.
- Servicio de chat con API compatible con OpenAI: `cortiq serve` expone `/v1/chat/completions`, lo que permite integrar el modelo en aplicaciones existentes que ya consumen la API de OpenAI sin cambiar el cliente.
- Evaluación e investigación de cuantización extrema: los tres archivos (q4tp, q2tp, q2tp-sfq) permiten comparar el impacto de cuantizaciones de 2 y 4 bits en perplejidad y en velocidad sobre el mismo modelo base, con datos publicados de WikiText-2, documentación china y código Rust.
- Despliegue multiplataforma vía wgpu: el backend Vulkan/DX12/Metal permite ejecutar el modelo en la GPU a través de wgpu (45,1 tok/s con q2tp en la RTX PRO 6000), útil en entornos donde CUDA no está disponible.

## Benchmarks y rendimiento

Calidad (perplejidad, ventanas de 512 tokens; menor es mejor):

| Archivo | WikiText-2 | Documentación china | Código Rust |
|---|---:|---:|---:|
| q4tp | 35,80 | 39,13 | 3,92 |
| q2tp | 32,98 | 36,08 | 4,64 |
| q2tp-sfq | 42,20 | 41,83 | 4,30 |

Decodificación en CUDA sobre RTX PRO 6000 (96 GB), 256 tokens tras un prompt de 1000 tokens de WikiText-2, modo greedy y `--no-think`:

| Límite de VRAM | q2tp (tok/s) | Primer token q2tp (s) | q4tp (tok/s) | Primer token q4tp (s) | Pico q2tp / q4tp (GB) |
|---:|---:|---:|---:|---:|---:|
| 96 GB | 65,1 | 15,5 | 55,3 | 19,7 | 60,5 / 86,5 |
| 48 GB | 53,1 | 18,0 | 38,1 | 21,1 | 45,6 / 45,8 |
| 24 GB | 37,4 | 19,6 | 25,8 | 25,0 | 23,6 / 23,7 |
| 16 GB | 29,7 | 17,9 | 19,0 | 23,5 | 15,8 / 16,0 |
| 12 GB | 24,0 | 18,0 | no disponible | no disponible | 11,8 / no disponible |

Decodificación en Vulkan (wgpu) sobre la misma tarjeta:

| Presupuesto de pesos | q2tp (tok/s) | Primer token q2tp (s) | q4tp (tok/s) | Primer token q4tp (s) | Pico q2tp / q4tp (GB) |
|---:|---:|---:|---:|---:|---:|
| Sin límite | 45,1 | 31,8 | 37,4 | 27,1 | 62,3 / 88,5 |
| 24 GB | 36,4 | 59,4 | 27,9 | 125,5 | 32,4 / 33,7 |

El primer token se mide desde un proceso en frío e incluye la construcción del plan y el llenado del tier de RAM (unos 15 s, una vez por proceso); la lectura del prompt de 1000 tokens tarda 4 s en la tarjeta completa. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: desde 12 GB (q2tp con pico de 11,8 GB) hasta 86,5 GB (q4tp con la tarjeta completa). q4tp requiere al menos 16 GB; por debajo de 12 GB sus slots de expertos no caben y el prompt cae al host.
- GPU recomendadas: NVIDIA RTX PRO 6000 Blackwell (96 GB) es la plataforma de referencia medida; cualquier GPU con 16-24 GB o más puede ejecutar q2tp con offloading, incluida la RTX 4090.
- Cabe en GPU de consumo: sí, con q2tp y al menos 12-16 GB de VRAM, siempre que se disponga de RAM suficiente para el tier de expertos (hasta 86 GB) y las tablas Engram (63 GB, leídas desde la caché de páginas).
- Opciones de despliegue: cortiq 0.9.6 o superior, con backend CUDA (`--features cuda`, requiere libnvrtc y libcublas de CUDA 12.x en tiempo de ejecución) o wgpu (`CMF_GPU=wgpu`, cubre Vulkan, DX12 y Metal). El servidor se lanza con `cortiq serve`. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: primer token de 15,5-25 s en CUDA (incluye inicialización) y decodificación de 65,1 tok/s (q2tp, 96 GB) a 24,0 tok/s (q2tp, 12 GB). En Vulkan, primer token de 27,1-125,5 s y decodificación de 27,9-45,1 tok/s.
- Almacenamiento: los archivos CMF ocupan 122,8 GB (q2tp y q2tp-sfq) y 150,5 GB (q4tp); el repositorio completo suma 396,2 GB.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Formato / motor |
|---|---|---|---|---|---|
| Hy4-flash-cmf (esta ficha) | 220B | 12B | no disponible | tencent-hy-license | CMF / cortiq |
| Tencent Hy4-flash (base) | 220B | 12B | no disponible | tencent-hy-license | safetensors FP8 + bf16 / ecosistema estándar |
| Alternativas de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

La información proporcionada no incluye datos de rendimiento de otros modelos de la misma categoría, por lo que no es posible establecer una comparación cuantitativa con alternativas. La comparación más directa disponible es con el propio modelo base: la cuantización q4tp degrada la perplejidad en WikiText-2 de los 35,80 publicados frente al modelo FP8 original (cuyo valor no se incluye en la información).

## Limitaciones y advertencias

- Licencia tencent-hy-license: es una licencia propia de Tencent etiquetada como "other"; deben revisarse sus términos antes de cualquier uso comercial, ya que la información disponible no detalla las restricciones.
- Idiomas limitados a inglés, chino y ruso; no hay soporte declarado de castellano.
- La cuantización de 2 bits penaliza el código más que la prosa (perplejidad en Rust de 4,64 frente a 3,92 en q4tp); la variante sfq corrige parcialmente el código pero empeora la prosa (WikiText-2 de 42,20 frente a 32,98).
- La torre de visión está presente en los pesos pero cortiq solo procesa texto, por lo que las capacidades multimodales no son utilizables.
- En el backend Vulkan, el prompt se procesa en trozos de 16 tokens y, más allá de 2048 tokens de contexto, el indexador de las capas sparse se ejecuta en la CPU, con la consiguiente degradación de rendimiento.
- El rendimiento depende críticamente de la RAM disponible: con menos de 86 GB el motor mantiene un tier menor y lee el resto desde el archivo, lo que ralentiza cada experto que falla.
- El primer token tiene una latencia alta (15-25 s en CUDA, hasta 125 s en Vulkan con límite de 24 GB) debido a la inicialización del plan y del tier de RAM.
- No se han publicado datos sobre sesgos, tasas de alucinación ni evaluaciones de seguridad del modelo base en la información disponible.
- Dependencia de un motor poco extendido (cortiq, versión 0.9.6 o superior) sin soporte documentado en vLLM, llama.cpp, Ollama o TGI, lo que limita la integración con infraestructura existente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/infosave/Hy4-flash-cmf
- Modelo base: https://huggingface.co/tencent/Hy4-flash
- Motor cortiq (GitHub): https://github.com/infosave2007/cmf
- Gráfico de rendimiento por tamaño de tarjeta: https://huggingface.co/infosave/Hy4-flash-cmf/resolve/main/assets/perf_cuda_en.png
