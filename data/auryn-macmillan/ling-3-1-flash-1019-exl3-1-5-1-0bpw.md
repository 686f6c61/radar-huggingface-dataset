# auryn-macmillan/Ling-3.1-flash-1019-EXL3-1.5-1.0bpw

## Resumen

Ling-3.1-flash-1019-EXL3-1.5-1.0bpw es una cuantización de precisión mixta del modelo inclusionAI/Ling-3.1-flash-1019, un transformer MoE híbrido de 560.000 millones de parámetros totales y 25.000 millones activos por token, con una ventana de contexto de 1 millón de tokens. La ha producido el usuario auryn-macmillan con exllamav3 1.6.6 sobre cinco RTX 3090, y su objetivo es concreto: eliminar por completo el offload de expertos a CPU que sí requiere la variante de 2,0 bpw, de modo que la decodificación no pague el coste de ida y vuelta por el bus del host.

El modelo base emplea una arquitectura híbrida que combina atención lineal KDA con atención latente agrupada (gated MLA) en solo 9 de sus 72 capas, lo que hace que el coste de contexto sea casi despreciable: unos 0,91 GiB de caché KV a 256K tokens en Q4. La cuantización reparte los expertos enrutados en dos mitades: 34 capas a 1,5 bpw y otras 34 a 1,0 bpw, con una media de 1,25 bpw sobre el 97 % de los pesos que son expertos y una media global de aproximadamente 1,29 bpw.

Es relevante ahora porque demuestra que un MoE de escala frontera puede servirse íntegramente en VRAM en hardware de consumo profesional (5× RTX 3090, unos 117 GB utilizables), sin offload, manteniendo el pool completo de 262.144 tokens y hasta 4 sesiones concurrentes. El precio es una degradación de calidad asumida en los expertos a 1,0 bpw, que el autor advierte que aparece primero en razonamiento multi-paso largo e idiomas poco representados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE híbrido (BailingMoeV3 / `bailing_hybrid`): 63 capas con atención lineal KDA y 9 capas con gated MLA |
| Parametros totales | 50.376.907.584 (según safetensors del repo); el modelo base declara 560B totales / 25B activos |
| Parametros activos | 25B (según model card del cuantizador, referido al modelo base) |
| Longitud de contexto | 262.144 tokens configurados en `tabby_config.yml`; el modelo base declara 1M |
| Tipos de cuantizacion | EXL3 (trellis, codebook `mul1`, `out_scales` auto), media ~1,29 bpw; expertos enrutados a 1,5 y 1,0 bpw; shared experts 5,0; KDA y MLP denso 4,0; MLA y `lm_head` 6,0; MTP 4,0; embeddings, norms, router y convoluciones KDA sin cuantizar |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (EXL3), con `quantization_config.json`, `recipe/ling-1.5-1.0bpw.yaml` y `tabby_config.yml`; requiere exllamav3 ≥ 1.6.6 |

## Arquitectura y entrenamiento

El modelo base es un MoE híbrido con 72 capas: 63 usan KDA (atención lineal con estado recurrente de tamaño fijo) y solo 9 conservan atención por token mediante gated MLA, que almacena un latente de 512 valores más una clave RoPE de 64 valores. Cada capa MoE empaqueta 512 expertos enrutados en un único `MultiLinear` de `BlockSparseMLP`, lo que impone una restricción clave del proceso de cuantización: exllamav3 exige un único bitrate por capa, de modo que no es posible mezclar 1,5 y 1,0 bpw dentro de una misma capa.

La receta aplicada deriva de la receta `ling-tp2` publicada con la release EXL3 de Ling-3.1 y se calibró con 250 filas × 2.048 columnas de datos estándar de exllamav3. La elección de qué 34 capas reciben el 1,5 bpw se hizo a partir del `proxy_err` por tensor registrado durante la conversión a 2,0 bpw: se promovieron las capas cuyos expertos cuantizan peor (dispersión de ~1,53× entre capas), concretamente las capas 6–20, 43–45, 48–53 y 55–64. La dispersión de error dentro de una capa es de solo ~1,17×, por lo que la granularidad por capa pierde poco frente a una hipotética mezcla por experto. Se conserva una capa MTP (nextn, capa 72) a 4 bpw para decodificación especulativa con `draft_mode: mtp`.

No se dispone de información sobre el dataset de preentrenamiento, el número de tokens, ni sobre etapas de RLHF o DPO del modelo base en la información proporcionada.

## Capacidades

- Generación de texto y conversación multi-turno, con plantilla de chat propia (`chat_template.jinja`).
- Razonamiento de contexto largo: el pool de 262.144 tokens con caché KV de ~0,91 GiB en Q4 permite trabajar con documentos muy extensos sin penalización de memoria.
- Decodificación especulativa mediante la capa MTP incluida (`draft_mode: mtp`, `draft_num_tokens: 5`).
- Concurrencia: la configuración de referencia admite `max_batch_size: 4` con 4 sesiones simultáneas de 256K (`cache_size: 1048576`).
- Capacidades multilingües: no disponibles como dato verificado; el autor advierte que la degradación por la cuantización agresiva se manifiesta antes en idiomas poco representados.
- Tool calling, function calling y comportamiento de agente: no disponible en la información proporcionada.
- Visión y audio: no disponible en la información proporcionada.

## Casos de uso

- Servicio de inferencia local de contexto largo: desplegado con TabbyAPI y `max_seq_len: 262144`, el modelo puede procesar documentos completos (informes, expedientes, bases de código) en una sola pasada sin offload de expertos, lo que evita la latencia del bus host en cada token decodificado.
- Análisis de repositorios y bases de código: con 256K tokens de contexto efectivos y 4 sesiones concurrentes, encaja en tareas de revisión y navegación de código de gran tamaño donde el coste de caché KV sería prohibitivo en un transformer denso.
- Resumen y extracción sobre corpus documentales: la atención lineal KDA mantiene un estado recurrente de tamaño fijo (~1,2 GiB independientemente de la longitud), lo que permite procesar flujos documentales largos con memoria estable.
- Asistente conversacional multi-turno autoalojado: la plantilla de chat y el pipeline `text-generation` permiten integrarlo en un backend propio; la licencia MIT facilita su uso interno y comercial sin restricciones adicionales.
- Experimentación e investigación en cuantización extrema: la receta por tensor incluida (105k entradas) sirve como referencia reproducible para estudiar el impacto de 1,0 bpw en expertos enrutados frente a 1,5 bpw.
- Prototipado de agentes con contexto masivo: la decodificación especulativa MTP acelera la generación en cargas con muchos tokens de salida, útil en bucles de razonamiento de varios pasos, siempre que se acepte la degradación documentada en razonamiento largo.
- Evaluación comparativa de recetas de cuantización: al mantener idénticos los bitrates de todo lo que no son expertos enrutados respecto al build de 2,0 bpw, permite aislar el efecto de bajar los expertos a 1,0/1,5 bpw sobre las mismas prompts.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que las cifras de rendimiento «se rellenan en el momento de la publicación» y que la comparación de calidad frente al build de 2,0 bpw se hizo mediante comparación directa sobre las mismas prompts, no con una suite de benchmarks.

## Requisitos de hardware

- VRAM estimada: ~92,4 GiB de pesos + ~5 GiB de workspace y transitorios de dequantización + 1–4 GiB de caché. Presupuesto total sobre 5× RTX 3090 (≈117 GB utilizables, menos ~3 GB de un servicio STT residente).
- Reparto de GPU de referencia: `gpu_split: [22.0, 22.0, 22.0, 19.0, 22.0]`.
- Caché KV: 0,24 GiB a 64K, 0,47 GiB a 128K, 0,91 GiB a 256K en Q4 (1,47 GiB en Q8 a 256K). Pool de estado recurrente de ~1,2 GiB independiente de la longitud de contexto; los checkpoints recurrentes viven en RAM del sistema (`sysmem_recurrent_cache`, 4 GB por defecto).
- GPU recomendadas: 5× RTX 3090 (24 GB) es la configuración validada. No hay datos publicados para A100, H100 o RTX 4090; por el tamaño de pesos (~92,4 GiB), un solo acelerador de 80 GB no es suficiente sin offload.
- ¿Cabe en GPU de consumo? Sí, en el conjunto de 5× RTX 3090 descrito; no cabe en una única GPU de consumo.
- Opciones de despliegue: exclusivamente exllamav3 ≥ 1.6.6, de forma directa o a través de TabbyAPI. No es usable con transformers, vLLM ni llama.cpp.
- Latencia y throughput: no disponibles; la model card no publica cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Despliegue |
|---|---|---|---|---|---|
| Ling-3.1-flash-1019-EXL3-1.5-1.0bpw (este) | 560B totales / 25B activos (base); 50,4B en safetensors del repo | 262.144 configurados (1M en el base) | EXL3 ~1,29 bpw, sin offload | MIT | exllamav3 ≥ 1.6.6, TabbyAPI |
| auryn-macmillan/Ling-3.1-flash-1019-EXL3-2.0bpw | mismo modelo base | mismo modelo base | EXL3 2,0 bpw, ~52 GB de expertos en CPU | MIT | exllamav3, TabbyAPI |
| inclusionAI/Ling-3.1-flash-1019 (FP8) | 560B totales / 25B activos | 1M | FP8 | MIT | SGLang / vLLM según la model card upstream |

No se dispone de datos de rendimiento comparado entre estas variantes en la información proporcionada; la única referencia cualitativa es que el build de 2,0 bpw ofrece mejor calidad a cambio de offload de expertos a CPU.

## Limitaciones y advertencias

- Los expertos a 1,0 bpw son una cuantización agresiva: el autor espera que la degradación aparezca primero en razonamiento multi-paso largo y en idiomas poco habituales.
- La conversión se hizo desde la release FP8 con los datos de calibración estándar de exllamav3; la validación de calidad es una comparación directa sobre las mismas prompts, no una suite de benchmarks.
- El repositorio no es compatible con transformers, vLLM ni llama.cpp; las instrucciones SGLang/vLLM de la model card upstream no aplican.
- Dependencia estricta de exllamav3 ≥ 1.6.6 y del soporte de `BailingMoeV3ForCausalLM` / `bailing_hybrid`.
- La decodificación especulativa MTP añade una capa draft a 4 bpw: su fidelidad respecto al modelo completo no está cuantificada en la información disponible.
- No hay datos publicados de sesgos, tasa de alucinación ni evaluación multilingüe para esta variante.
- Licencia MIT en el modelo base y en la cuantización, sin restricciones comerciales declaradas; conviene verificar los términos de exllamav3 (MIT) para el runtime.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en producción ni validación independiente.

## Enlaces

- Repositorio de la cuantización: https://huggingface.co/auryn-macmillan/Ling-3.1-flash-1019-EXL3-1.5-1.0bpw
- Variante de 2,0 bpw: https://huggingface.co/auryn-macmillan/Ling-3.1-flash-1019-EXL3-2.0bpw
- Modelo base: https://huggingface.co/inclusionAI/Ling-3.1-flash-1019
- exllamav3 (turboderp): https://github.com/turboderp-org/exllamav3
- TabbyAPI: https://github.com/theroyallab/tabbyAPI
