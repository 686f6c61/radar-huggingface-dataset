# dealignai/ERNIE-5.5-Flash-Preview-UNCENSORED-NVFP4

## Resumen

ERNIE-5.5-Flash-Preview-UNCENSORED-NVFP4 es una cuantización a nivel de pesos del modelo base `baidu/ERNIE-5.5-Flash-Preview-BF16`, publicada por el colectivo DealignAI. El modelo conserva la arquitectura original de ERNIE 5.5 Flash Preview (un transformer híbrido MoE de 43 capas con 512 expertos enrutados y 10 activos por token, más un experto compartido) y aplica una cuantización ModelOpt `W4A16_NVFP4` sobre los expertos enrutados, manteniendo en BF16 sin pérdida las capas de atención, expertos compartidos, embeddings, router y normalización.

El interés principal de esta ficha es doble. Por un lado, es una de las primeras distribuciones públicas de ERNIE 5.5 Flash Preview en formato NVFP4 (FP4 E2M1 con escalas FP8 E4M3 de grupo 16 y activaciones BF16), un formato pensado para las GPU Blackwell. Por otro, el autor elimina deliberadamente los mecanismos de rechazo del modelo base ("direct weight-level uncensored release"), sin SFT, DPO ni LoRA, lo que lo convierte en un caso de estudio de "desalineación por cuantización" más que en un modelo nuevo.

El modelo declara 154.604.013.126 parámetros totales (unos 154,6 mil millones) y un contexto nativo de 1.048.576 tokens (1M). Incluye pesos de decodificación especulativa DSpark y conserva el soporte de tool calling y los modos de razonamiento `off`/`low`/`medium`/`high`. Se distribuye bajo una licencia comunitaria propia (`dealignai-community-v0.3`) y requiere `vllm` con soporte específico para ERNIE.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `Ernie5_5_MoeForCausalLM`, transformer híbrido MoE de 43 capas (512 expertos enrutados, 10 activos por token + experto compartido) |
| Parámetros totales | 154.604.013.126 (~154,6 B) |
| Parámetros activos | 10 expertos enrutados + 1 compartido por token (recuento exacto de parámetros activos no disponible) |
| Longitud de contexto | 1.048.576 tokens (1M) nativos |
| Tipos de cuantización | ModelOpt `W4A16_NVFP4` (FP4 E2M1, escalas FP8 E4M3 de grupo 16, activaciones BF16) en expertos enrutados; resto en BF16 sin pérdida. Existe release hermano en MXFP4 |
| Idiomas soportados | no disponible |
| Licencia | `dealignai-community-v0.3` (etiquetada como `other`) |
| Formato de pesos | safetensors (74 shards, ~170,3 GiB), librería `vllm` |

## Arquitectura y entrenamiento

El modelo base ERNIE 5.5 Flash Preview es un transformer híbrido de mezcla de expertos (MoE) de 43 capas con 512 expertos enrutados, de los cuales se activan 10 por token más un experto compartido, lo que da un total de ~154,6 mil millones de parámetros. La variante publicada aquí no introduce ningún entrenamiento adicional: es una conversión pura de pesos desde el checkpoint BF16 de Baidu. La cuantización `W4A16_NVFP4` se aplica únicamente a los expertos enrutados (64.512 matrices principales + 4.608 de DSpark MTP), mientras que las 17,97 GiB de capas no-expertas se conservan en BF16 íntegro.

La innovación técnica del release es doble. Primero, el uso de NVFP4 con escalas FP8 de grupo 16 sobre los expertos, un esquema que reduce el peso por GPU a ~87,9 GiB con TP=2 y ~46,8 GiB con TP=4, manteniendo activaciones BF16 para preservar la precisión de la atención. Segundo, la inclusión de los pesos de borrador DSpark (decodificación especulativa) ya cuantizados, lo que permite acelerar la generación sin un modelo borrador separado. El autor afirma que el proceso de "descensura" es estrictamente a nivel de pesos (sin SFT, DPO, LoRA ni datos sintéticos), aunque no documenta qué transformación concreta se aplicó. No se dispone de información sobre el dataset de entrenamiento original, el número de tokens ni si el modelo base usó RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento con modos configurables `off`, `low`, `medium` y `high` (parser `ernie5`).
- Razonamiento multi-paso y cadenas de pensamiento largas (CoT), verificado hasta 8.192 tokens de pensamiento en las pruebas del autor.
- Soporte de tool calling / function calling (parsers `ernie5`, `--enable-auto-tool-choice`).
- Capacidades de agente con contexto de hasta 1M tokens, verificado end-to-end a 1.041.479 tokens con tool calling.
- Decodificación especulativa mediante pesos borrador DSpark incluidos en el bundle.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo "sin rechazos" (uncensored): el autor reporta 0 rechazos duros o suaves en el conjunto HarmBench-320.
- No se mencionan capacidades de visión, audio ni multimodalidad; el modelo base se describe como text-only.

## Casos de uso

- Análisis de repositorios y documentación extensa: con 1M tokens de contexto, el modelo puede ingerir un árbol de código completo, issues y documentación en una sola pasada para responder preguntas de arquitectura o generar resúmenes de cambios. Es adecuado por su ventana nativa y su soporte de tool calling para consultar ficheros.
- Agentes autónomos de larga duración: el soporte de tool calling y los modos de razonamiento permiten construir bucles de planificación-ejecución-verificación con historial de conversación muy largo, sin truncar el estado intermedio.
- Generación de código en pipelines de CI/CD: el modelo puede invocarse desde `vllm` como servidor OpenAI-compatible para revisar diffs, sugerir parches o generar tests, aprovechando la decodificación especulativa DSpark para reducir latencia.
- Investigación sobre alineación y seguridad: al ser una versión "uncensored" con métricas de cumplimiento publicadas (HarmBench-320), sirve como caso de estudio controlado para medir cómo la cuantización y la manipulación de pesos afectan a los rechazos.
- Procesamiento de contratos y expedientes legales: la ventana de 1M tokens permite cargar expedientes completos y hacer preguntas de trazabilidad entre cláusulas, con citas a fragmentos concretos.
- Asistencia técnica interna con contexto de base de conocimiento: el modelo puede mantener conversaciones multi-turno con un corpus de manuales y tickets inyectado en el contexto, usando tool calling para consultar sistemas internos.
- Evaluación de modelos en hardware Blackwell: al ser un release NVFP4, es útil para validar rendimiento y precisión de este formato frente a BF16 y MXFP4 en GPUs de nueva generación.

## Benchmarks y rendimiento

El autor solo publica resultados de cumplimiento (compliance) en HarmBench-320, no benchmarks de capacidad (MMLU, HumanEval, GSM8K, etc.). Se reproducen a continuación los datos disponibles, con decodificación greedy (`temperature=0`, `seed=11`, `max_tokens=8192`).

| Benchmark y subconjunto (razonamiento `high`) | n | Cumplidos (total + parcial) | Rechazos | Bucles a 8k | Topes no-bucle a 8k |
|---|---:|---:|---:|---:|---:|
| HarmBench-320 — Standard | 159 | 155/159 (97,5%) | 0 (0,0%) | 1 (0,6%) | 3 (1,9%) |
| HarmBench-320 — Contextual | 81 | 79/81 (97,5%) | 0 (0,0%) | 1 (1,2%) | 1 (1,2%) |
| HarmBench-320 — Ex-Copyright | 240 | 234/240 (97,5%) | 0 (0,0%) | 2 (0,8%) | 4 (1,7%) |
| HarmBench-320 — Copyright | 80 | 77/80 (96,2%) | 0 (0,0%) | 3 (3,8%) | 0 (0,0%) |
| HarmBench-320 — Todos | 320 | 311/320 (97,2%) | 0 (0,0%) | 5 (1,6%) | 4 (1,2%) |

Por temática, el autor reporta 100% de cumplimiento en químico/biológico (42/42), desinformación (54/54), actividades ilegales (53/53), acoso (21/21) y daño genérico (18/18), y 88,5% en cibercrimen (46/52). No se han publicado resultados de benchmarks de capacidad en la información disponible.

## Requisitos de hardware

- VRAM estimada: el bundle pesa ~170,3 GiB. Con tensor parallelism TP=2 se requieren ~87,9 GiB por GPU; con TP=4, ~46,8 GiB por GPU. No cabe en una sola GPU de consumo.
- GPU recomendadas: el autor apunta a 2–4 NVIDIA DGX Spark (Blackwell, SM12.1) como plataforma de referencia. El formato NVFP4 requiere soporte de FP4 nativo, por lo que las GPU Hopper (H100) y Ampere (A100) no son el objetivo; en Blackwell (B200/B300, RTX 50xx) es donde tiene sentido.
- GPU de consumo: no cabe en ninguna RTX 4090 (24 GB) ni en GPUs de 48 GB; requiere al menos dos aceleradores de ~90 GiB o cuatro de ~48 GiB.
- Opciones de despliegue: `vllm` con soporte `vLLM-ERNIE` (parsers `--reasoning-parser ernie5`, `--tool-call-parser ernie5`, `--enable-auto-tool-choice`), o el runtime específico `github.com/jjang-ai/ernie-5.5-dgx-spark` para DGX Spark con kernels Triton HCA BF16 fusionados y colectivos `sparknet` 200GbE.
- Latencia y throughput: no disponibles. El autor menciona que la decodificación especulativa DSpark y los kernels personalizados buscan reducir la latencia, pero no publica cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ERNIE-5.5-Flash-Preview-UNCENSORED-NVFP4 (este) | ~154,6 B (MoE) | 1M | NVFP4 W4A16 | dealignai-community-v0.3 | Hugging Face, `vllm` |
| ERNIE-5.5-Flash-Preview-UNCENSORED-MXFP4 (hermano) | ~154,6 B (MoE) | 1M | MXFP4 + FP8 atención | dealignai-community-v0.3 | Hugging Face |
| baidu/ERNIE-5.5-Flash-Preview-BF16 (base) | ~154,6 B (MoE) | 1M | BF16 | licencia de Baidu (no disponible en detalle) | Hugging Face |

No se dispone de datos de benchmarks de capacidad que permitan comparar el rendimiento frente a alternativas de la misma categoría (por ejemplo, otros MoE de ~150 B con contexto de 1M). La comparación se limita a parámetros, contexto, formato y licencia.

## Limitaciones y advertencias

- El modelo es una versión "uncensored": el autor reporta 0 rechazos en HarmBench-320, incluyendo temas de químicos/biológicos, cibercrimen y desinformación. No es apto para despliegues públicos sin moderación externa.
- Riesgo elevado de alucinación en contextos de 1M tokens: aunque el autor verifica 1.041.479 tokens, no publica métricas de fidelidad (p. ej., RULER o Needle-in-a-Haystack).
- El proceso de "descensura" no está documentado técnicamente; no se especifica qué pesos se modificaron ni con qué criterio, lo que dificulta auditar el comportamiento.
- La licencia `dealignai-community-v0.3` es propia y puede imponer restricciones al uso comercial; debe revisarse el fichero LICENSE antes de producción. El modelo base de Baidu puede tener condiciones adicionales.
- Idiomas soportados no disponibles: no se puede garantizar calidad multilingüe más allá del inglés/chino esperado en ERNIE.
- El formato NVFP4 requiere hardware Blackwell; en GPUs Hopper o Ampere el modelo no se puede ejecutar de forma nativa.
- El autor solicita atribución a DealignAI al alojar, usar, cuantizar o derivar del modelo; conviene verificar si es un requisito legal o una petición.
- No hay datos de benchmarks de capacidad, por lo que no se puede evaluar la degradación de precisión introducida por la cuantización NVFP4 frente al BF16 original.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción ni de validación independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dealignai/ERNIE-5.5-Flash-Preview-UNCENSORED-NVFP4
- Modelo base: https://huggingface.co/baidu/ERNIE-5.5-Flash-Preview-BF16
- Release hermano MXFP4: https://huggingface.co/dealignai/ERNIE-5.5-Flash-Preview-UNCENSORED-MXFP4
- Licencia: https://huggingface.co/dealignai/ERNIE-5.5-Flash-Preview-UNCENSORED-NVFP4/blob/main/LICENSE
- Runtime para DGX Spark: https://github.com/jjang-ai/ernie-5.5-dgx-spark
- Perfil del autor: https://huggingface.co/dealignai
- X/Twitter del autor: https://x.com/dealignai
