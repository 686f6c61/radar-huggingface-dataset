# kabcnd/Kenzan-Flint-40B-Hepta48Up-GGUF

## Resumen

Kenzan-Flint-40B-Hepta48Up es una cuantización GGUF de un modelo de lenguaje Mixture-of-Experts (MoE) derivado del modelo base Tencent-Hunyuan/Hunyuan-A52B-Instruct. Lo desarrolla el usuario independiente kabcnd y está diseñado específicamente para ejecutarse en Apple Silicon con 16 GB de memoria unificada, en concreto un Mac mini M6. El modelo combina una "columna vertebral" de alta precisión con expertos ternarios de baja precisión (1,75 bits por peso) para reducir el tamaño del fichero a 9,77 GiB manteniendo 39,79 mil millones de parámetros totales y 2,54 mil millones activos por token.

La relevancia del modelo radica en su estrategia de compresión agresiva: utiliza pesos ternarios `PTQ1_0` en los expertos enrutados y cuantizaciones mixtas (`Q8_0`, `Q6_K`, `Q5_K`, `IQ4_XS`, `Q4_0`) en atención, embeddings y expertos compartidos. Esto permite desplegar un MoE de casi 40B en hardware de consumo con ventanas de contexto de hasta 262.144 tokens, algo inusual en esta clase de tamaño.

El modelo soporta inglés, ruso y chino, e incluye un modo de razonamiento (`<think>`) con formato tipo DeepSeek. Requiere un runtime parcheado (`PrismML-Eng/llama.cpp`) porque el `llama.cpp` estándar no puede cargar los pesos ternarios empaquetados ni los metadatos de rotación de fase Hadamard.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE), 48 capas, 256 expertos enrutados + 1 compartido, top-8 routing |
| Parametros totales | 39,79B |
| Parametros activos | 2,54B por token |
| Longitud de contexto | 262.144 tokens (configurado y verificado en el runtime) |
| Tipos de cuantizacion | Mixta: expertos enrutados `PTQ1_0` (ternario, 1,75 bpw), `Q4_0` con FWHT_512 en capas pin, `Q8_0` embeddings, `Q6_K` cabeza de salida, `Q5_K`/`IQ4_XS` atención y expertos compartidos, KV cache `q4_0` |
| Idiomas soportados | en, ru, zh |
| Licencia | other (ver limitaciones) |
| Formato de pesos | GGUF (fichero `Kenzan-Flint-40B-Hepta48Up-Q4_0-M6-16G.gguf`, 9,768 GiB) |

## Arquitectura y entrenamiento

El modelo es un MoE transformer con 48 capas, 256 expertos enrutados más un experto compartido y enrutamiento top-8, heredado de Hunyuan-A52B-Instruct. La innovación principal es la cuantización post-entrenamiento (PTQ) híbrida: los expertos enrutados se comprimen a pesos ternarios (`PTQ1_0`, 1,75 bpw), mientras que un "Always-On Backbone" mantiene alta precisión en embeddings (`Q8_0`), cabeza de salida (`Q6_K`), atención y expertos compartidos (`Q5_K`/`IQ4_XS`). Siete capas concretas (`down_exps` en `{8, 12, 20, 40, 44, 46, 48}` más `blk.48.ffn_up_exps`) se anclan en `Q4_0` con transformada rápida de Walsh-Hadamard de bloque 512 (`FWHT_512`), lo que el autor denomina "pin grid" o rejilla de anclaje.

No se dispone de información sobre el número de tokens de entrenamiento ni sobre la composición del dataset de preentrenamiento o ajuste fino del modelo base. El autor menciona "semanas de cirugía Hadamard" como trabajo de cuantización, pero no detalla procesos de RLHF o DPO. El modelo incluye decodificación especulativa mediante `ngram-map-k (3x4)` y requiere kernels Metal parcheados para multiplicación multi-columna de pesos ternarios, gather-MV fusionado para expertos y `popcnt` SIMD por hardware.

## Capacidades

- Generación de texto y razonamiento con modo `thinking` (`<think>`), con formato de razonamiento tipo DeepSeek y presupuesto configurable (`--reasoning-budget -1` para terminación natural).
- Generación de código, según la model card ("code cleanly").
- Capacidades multilingües en inglés, ruso y chino; el autor advierte que penalizaciones de frecuencia degradan la morfología cirílica.
- Soporte de plantillas Jinja (`--jinja`) para formateo de conversaciones.
- Decodificación especulativa integrada mediante `ngram-map-k`.
- No se menciona soporte explícito de tool calling, function calling, visión, audio ni agentes multi-paso en la información disponible.

## Casos de uso

- Asistente local en Mac mini de 16 GB: el modelo cabe en 9,77 GiB de fichero y ~12,5 GiB de RSS con contexto completo, por lo que puede ejecutarse como servicio `llama-server` en un equipo de consumo sin GPU dedicada.
- Procesamiento de documentos largos: con 262.144 tokens de contexto y KV cache `q4_0`, permite analizar libros, expedientes o bases de código extensas en una sola pasada.
- Generación de código en local: el autor destaca generación de código limpia; puede integrarse en editores o pipelines mediante la API compatible de `llama-server` en el puerto configurado.
- Razonamiento con trazas: el modo `<think>` con formato DeepSeek permite obtener cadenas de razonamiento para depuración o tareas matemáticas y lógicas.
- Atención multilingüe en inglés, ruso y chino: útil para traducción o atención al cliente en esos idiomas, con la advertencia de no aplicar penalización de frecuencia.
- Prototipado de investigación sobre MoE ternarios: sirve para estudiar el impacto de cuantizaciones mixtas y Hadamard en calidad (PPL) y velocidad en Apple Silicon.
- Servicio de inferencia local con throughput moderado: 72–82 t/s de generación y 438–448 t/s de ingestión de prompt permiten uso interactivo en un solo usuario.

## Benchmarks y rendimiento

Datos medidos por el autor en Mac mini M6 con 16 GB de memoria unificada, Metal, `-ngl 99 --no-host -fa on -c 262144`, KV cache `q4_0` y decodificación especulativa `ngram-map-k (3x4)`:

| Metrica | Valor | Notas |
|---|---|---|
| Tamano del GGUF | 9,768 GiB (10.487.781.312 B) | Cabe en 16 GB de memoria unificada |
| RSS del proceso (`-c 262144`) | ~12,5 GiB (74,5% de RAM) | Contexto completo de 262.144 tokens activo |
| WikiText-2 Dev (`c512`) PPL | 25,0629 ± 0,7085 | −0,2295 frente a baseline HeptaCore (z = −4,21) |
| WikiText-2 Holdout (`c512`) PPL | 23,6362 ± 0,6664 | −0,3683 frente a baseline HeptaCore (z = −8,14) |
| NLP Article (`c256`) PPL | 7,9485 ± 1,0448 | −0,2221 frente a baseline HeptaCore (z = −2,87) |
| Throughput de generación (`tg`) | 72,3–82,3 t/s (pico 94,2 t/s) | Router en vivo, puerto 11434 |
| Ingestión de prompt (`pp`) | 438–448 t/s (pico 669,5 t/s) | Metal FlashAttention con batching 512 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Las cifras anteriores son métricas de perplejidad y rendimiento del runtime, no de calidad en tareas.

## Requisitos de hardware

- VRAM/memoria: ~12,5 GiB de RSS con contexto completo de 262.144 tokens y KV cache `q4_0`; el fichero pesa 9,768 GiB.
- Hardware objetivo: Apple Silicon con 16 GB de memoria unificada (Mac mini M6). No se documentan requisitos para GPU NVIDIA o AMD.
- GPU de consumo: cabe en Apple Silicon de 16 GB; no hay datos sobre RTX 4090 u otras GPU consumer.
- Despliegue: exclusivamente con el runtime parcheado `PrismML-Eng/llama.cpp` (`prism-b12128-d7b2896` o superior) con parche de arquitectura Flint y lista blanca Hadamard (`libllama.0.7.0.dylib` / `ggml-metal`). El `llama.cpp` estándar no puede cargar estos GGUF. Se incluye `tools/kenzan_router.py`.
- Variables de entorno Metal obligatorias: `GGML_METAL_PTQ1_MULTICOL=1`, `GGML_METAL_FUSE_GATHER_MV=1`, `GGML_METAL_TENSOR_ENABLE=1`, `GGML_METAL_SHARED_BUFFERS_ENABLE=1`, `GGML_METAL_Q1_0_POPCNT=1`.
- Latencia y throughput: 72,3–82,3 t/s de generación (pico 94,2 t/s) y 438–448 t/s de prompt (pico 669,5 t/s) en Mac mini M6.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kenzan-Flint-40B-Hepta48Up | 39,79B | 2,54B | 262.144 | other | GGUF, runtime parcheado |
| Tencent-Hunyuan-A52B-Instruct (base) | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| Baseline HeptaCore (mencionado por el autor) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para comparar parámetros, contexto, rendimiento o licencia con alternativas de la misma categoría. La model card solo referencia el modelo base Hunyuan-A52B-Instruct y un baseline interno denominado HeptaCore, sin especificar sus características.

## Limitaciones y advertencias

- Licencia "other": no se detallan los términos; es imprescindible revisar las condiciones del modelo base Hunyuan-A52B-Instruct antes de cualquier uso comercial.
- Requiere runtime parcheado no estándar: el `llama.cpp` oficial no carga estos pesos; esto complica el despliegue, la portabilidad y el mantenimiento.
- Solo validado en Apple Silicon 16 GB (Mac mini M6); no hay datos de funcionamiento en otras plataformas.
- Idiomas limitados a inglés, ruso y chino; no se documenta soporte de español.
- La cuantización ternaria de 1,75 bpw puede degradar calidad en tareas sensibles; las únicas métricas publicadas son de perplejidad, no de tareas.
- El autor advierte que penalizaciones de frecuencia pequeñas (0,025–0,04) degradan la morfología cirílica y ralentizan la generación de código.
- Riesgo de alucinación y sesgos: no se documentan evaluaciones de sesgo ni de robustez.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; modelo recién publicado (12 de noviembre de 2026) y sin validación comunitaria.
- No se documenta soporte de tool calling ni de agentes, lo que limita su uso en pipelines automatizados complejos.

## Enlaces

- Hugging Face: https://huggingface.co/kabcnd/Kenzan-Flint-40B-Hepta48Up-GGUF
- Modelo base: https://huggingface.co/Tencent-Hunyuan/Hunyuan-A52B-Instruct
- Runtime parcheado: `PrismML-Eng/llama.cpp` (referenciado en la model card, sin URL directa disponible)
- Donaciones del autor: https://ko-fi.com/kabcpc
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la información disponible.
