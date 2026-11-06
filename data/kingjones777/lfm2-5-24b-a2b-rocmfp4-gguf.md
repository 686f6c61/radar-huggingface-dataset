# kingjones777/LFM2.5-24B-A2B-ROCmFP4-GGUF

## Resumen

LFM2.5-24B-A2B-ROCmFP4-GGUF es una cuantización de 4 bits en formato GGUF del modelo LiquidAI/LFM2.5-24B-A2B, publicada por el usuario kingjones777. El modelo base es un transformer de mezcla de expertos (MoE) desarrollado por Liquid AI, con 23.971.587.712 parámetros totales y aproximadamente 2.000 millones de parámetros activos por token (top-4 sobre 64 expertos). Esta versión concreta emplea el tipo de tensor propietario ROCmFP4, pensado específicamente para GPUs integradas AMD con arquitectura gfx1151 (Strix Halo, Ryzen AI Max+ 395, Radeon 8060S).

La relevancia de esta ficha radica en que no se trata de una cuantización estándar de llama.cpp, sino de un artefacto optimizado para hardware AMD concreto: los ficheros usan tipos de tensor ROCmFP4 (identificadores 100 y superiores) que la build oficial de llama.cpp no puede cargar, y requieren el runtime Super ROC del propio autor. El resultado es un fichero de 13,6 GB que alcanza 4,53 bits por peso y que, según las mediciones del autor, obtiene una perplejidad de 14,2330 en wikitext-2, mejor que el Q4_K_M estándar (15,3536) y peor que el fichero QAD del proveedor (13,9774).

El modelo conserva la arquitectura híbrida del original: 40 capas (30 de convolución corta con doble compuerta y 10 de atención con grouped-query attention), 2 capas densas iniciales, tamaño oculto de 2048, vocabulario de 128K con embeddings atados y contexto nativo de 131K tokens. Está pensado para servir en local sobre un único SoC AMD con memoria unificada de 128 GB, con un rendimiento medido de 2.459 tok/s en prefill y 97,8 tok/s en generación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE híbrido: 40 capas (30 de convolución corta con doble compuerta + 10 de grouped-query attention), 2 capas densas iniciales, tamaño oculto 2048, vocabulario 128K con embeddings atados |
| Parametros totales | 23.971.587.712 |
| Parametros activos | Aproximadamente 2.000 millones (MoE con 64 expertos, top-4) |
| Longitud de contexto | 131.072 tokens nativos (la receta de servicio del autor usa 32.768) |
| Tipos de cuantizacion | Q4_0_ROCMFP4 para expertos, atención, proyecciones de convolución corta y feed-forward denso; Q6_K para el embedding de tokens (también cabeza de salida atada); F32 para routers, normas, `exp_probs_b` y estado de convolución corta. Media de 4,53 bits por peso |
| Idiomas soportados | no disponible |
| Licencia | lfm1.0 (etiquetada como "other" en Hugging Face) |
| Formato de pesos | GGUF (un único fichero: `LFM2.5-24B-A2B-Q4_0_ROCMFP4_LEAN.gguf`, 13.578.191.040 bytes) |

## Arquitectura y entrenamiento

El modelo base LFM2.5-24B-A2B es un transformer de mezcla de expertos con 64 expertos y enrutamiento top-4. La arquitectura combina 30 capas de convolución corta con doble compuerta y 10 capas de atención con grouped-query attention, precedidas por 2 capas densas. El tamaño oculto es de 2048, el vocabulario de 128K tokens con embeddings atados a la cabeza de salida, y el contexto nativo alcanza los 131.072 tokens. El modelo no incluye cabeza MTP (multi-token prediction).

Sobre el entrenamiento del modelo base no se proporciona información en la documentación disponible (número de tokens, composición del dataset, uso de RLHF o DPO). Lo que sí está documentado es el proceso de cuantización de esta versión: se parte del fichero QAD (quantization-aware) de 4 bits del proveedor, se reconvierte a F16 con `llama-quantize --allow-requantize` y se aplica la receta LEAN con `gufo-quant`, usando el preset de protección `lfm2moe-v0`, que se reduce a una única regla: mantener `token_embd.weight` en Q6_K. El resultado son 428 tensores a 4,53 bits por peso. El autor justifica construir desde el fichero QAD en lugar de desde BF16 porque la misma receta LEAN sobre BF16 da perplejidad 16,0320 (1,044 veces el Q4_K_M estándar), mientras que sobre QAD da 14,2330 (0,927 veces).

## Capacidades

- Generación de texto conversacional y de propósito general, con pipeline `text-generation` y etiqueta `conversational`.
- Razonamiento multi-paso y uso de herramientas: la model card reporta 7/7 llamadas correctas con `tool_choice: required` y 6/7 con `tool_choice: auto` en el conjunto de pruebas del autor.
- Llamadas a herramientas en formato pythonic propio del modelo, incluyendo llamadas requeridas, con nombre, en paralelo y en streaming.
- Generación de código: medida a 101,8 tok/s de media en 6 prompts de hasta 256 tokens.
- Capacidades multilingües: no disponible (no se documentan idiomas soportados).
- No se documentan capacidades de visión, audio ni modo thinking explícito para esta variante.

## Casos de uso

- Asistente conversacional local en estación de trabajo AMD Strix Halo: el modelo cabe en los 128 GB de memoria unificada del Ryzen AI Max+ 395 y permite servir un asistente multi-turno con contexto de 32K sin depender de la nube, a 97,8 tok/s de generación.
- Automatización de agentes con tool calling: las llamadas a herramientas en formato pythonic, incluyendo paralelas y en streaming, permiten construir agentes que consulten APIs, ejecuten comandos o encadenen pasos, con una tasa de acierto reportada de 7/7 en modo requerido.
- Generación de código en local para equipos con hardware AMD: la velocidad medida de 101,8 tok/s en prompts de código lo hace viable para autocompletado y generación de funciones en un IDE, sin GPU dedicada.
- Procesamiento de documentos largos: con 131K tokens de contexto nativo, admite resumir o extraer información de contratos, informes o expedientes completos en una sola pasada, siempre que se ajuste el parámetro `--context` del servidor.
- Servicio de inferencia con caché de prompt para aplicaciones interactivas: la caché de prompt funciona (un prompt repetido de 2.412 tokens alcanza el primer token en 2,2 ms), lo que reduce la latencia percibida en asistentes con system prompt fijo.
- Prototipado e investigación sobre cuantización de bajo bit: el fichero sirve como referencia reproducible de la receta LEAN y del formato ROCmFP4, con perplejidad y ratios publicados frente a Q4_K_M y QAD, útil para estudiar el impacto de la cuantización en modelos MoE.
- Despliegue en entornos con restricciones de conectividad o privacidad: al ejecutarse íntegramente en local sobre un único SoC, permite procesar datos sensibles sin salida a internet.

## Benchmarks y rendimiento

Perplejidad en wikitext-2 test (contexto de 512 tokens, 320 chunks) con llama.cpp build ROCmFPX; ratio frente al Q4_K_M estándar, menor es mejor:

| Build | Perplejidad | Ratio vs stock |
|---|---|---:|
| Vendor QAD-Q4_0 | 13,9774 | 0,910 |
| Este fichero (LEAN desde QAD) | 14,2330 | 0,927 |
| Stock Q4_K_M | 15,3536 | 1,000 |
| LEAN desde BF16 | 16,0320 | 1,044 |

En el runtime Super ROC, el mismo fichero da 14,5655 en la ruta de decode y 14,5154 en prefill por lotes, frente a 14,5560 en llama.cpp (build ROCmFPX) con el mismo fichero y texto.

Rendimiento medido en AMD Ryzen AI Max+ 395 (Radeon 8060S, gfx1151), 128 GB, ROCm 7.13.0, una petición a la vez, temperatura 0, caché de prompt fría y sin drafter:

| Medición | Resultado |
|---|---:|
| Procesamiento de prompt, prompt de 1.518 tokens | 2.459,2 tok/s |
| Generación tras ese prompt (hasta 256 tokens) | 97,8 tok/s |
| Generación de código, 6 prompts, hasta 256 tokens, media (rango) | 101,8 tok/s (101,7-101,8) |
| Tokens draft aceptados en esos prompts | sin drafter |
| Llamadas a herramientas correctas, `tool_choice` required / auto | 7/7 / 6/7 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/memoria: el fichero GGUF ocupa 13,6 GB; en un SoC con memoria unificada se recomienda disponer de al menos 16-24 GB libres para el modelo más el contexto y el runtime. Con contexto de 32K hay que sumar la caché KV correspondiente.
- GPU validadas: AMD Ryzen AI Max+ 395 con Radeon 8060S (gfx1151, Strix Halo), 128 GB de memoria, ROCm 7.13.0. Es el único hardware con mediciones publicadas.
- GPU consumer: no cabe en GPUs consumer de 8-12 GB. En tarjetas de 16 GB el fichero de 13,6 GB dejaría margen muy ajustado para contexto. No hay mediciones publicadas en A100, H100 ni RTX 4090.
- Opciones de despliegue: runtime Super ROC (`superroc serve ... llm -m ... --context 32768`), del autor del modelo. La build estándar de llama.cpp no carga estos ficheros porque usan tipos de tensor ROCmFP4 (100 y superiores); se requiere una build ROCmFPX para mediciones equivalentes.
- Latencia y throughput: 2.459,2 tok/s de prefill con prompt de 1.518 tokens, 97,8 tok/s de generación y 101,8 tok/s en código, en el hardware indicado y con una sola petición concurrente.
- Aceleración especulativa: el modelo no incluye cabeza MTP. Los drafters DSpark funcionan de forma exacta (texto idéntico a sin drafter) pero a aproximadamente la mitad de velocidad, por lo que el autor recomienda servir sin drafter. No se midió ningún drafter DSpark para el modelo de 24B.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / cuantización | Licencia | Notas |
|---|---|---|---|---|---|
| Este fichero (LFM2.5-24B-A2B ROCmFP4 LEAN) | 24B totales, ~2B activos | 131K | GGUF ROCmFP4, 4,53 bpw, 13,6 GB | lfm1.0 | Solo runtime Super ROC / build ROCmFPX; perplejidad 14,2330 |
| LiquidAI/LFM2.5-24B-A2B (QAD-Q4_0 del proveedor) | 24B totales, ~2B activos | 131K | GGUF Q4_0 cuantización-aware | lfm1.0 | Perplejidad 13,9774; referencia de calidad del proveedor |
| LFM2.5-24B-A2B Q4_K_M estándar | 24B totales, ~2B activos | 131K | GGUF Q4_K_M | lfm1.0 | Perplejidad 15,3536; cargable en llama.cpp estándar |

No se dispone de datos de benchmarks estándar ni de comparaciones con modelos de otros fabricantes en la información proporcionada.

## Limitaciones y advertencias

- Compatibilidad restringida: los tipos de tensor ROCmFP4 (100 y superiores) no los carga la build estándar de llama.cpp; sin el runtime Super ROC o una build ROCmFPX el fichero es inutilizable.
- Hardware validado muy concreto: las mediciones corresponden únicamente a gfx1151 (Strix Halo). No hay datos de rendimiento en otras GPU AMD ni en NVIDIA.
- Pérdida de calidad frente al QAD del proveedor: la perplejidad sube de 13,9774 a 14,2330 (ratio 0,927 frente a Q4_K_M), aceptable pero no idéntica al fichero de referencia.
- Riesgo de alucinación: inherente a los modelos de lenguaje; no se documentan evaluaciones de fidelidad factual ni de tasas de alucinación.
- Sesgos: no se documentan análisis de sesgo para el modelo base ni para esta cuantización.
- Idiomas: no se especifican los idiomas soportados, por lo que el rendimiento fuera del inglés es desconocido.
- Sin cabeza MTP y con drafters DSpark que degradan la velocidad a la mitad; el autor recomienda no usar decodificación especulativa con este modelo.
- Tool calling no perfecto: 6/7 en modo `auto`, lo que implica fallos ocasionales en la selección automática de herramientas.
- Licencia lfm1.0: es una licencia propia de Liquid AI con posibles restricciones para uso comercial; debe revisarse el texto completo antes de desplegar en producción.
- Repositorio con 90 descargas y 0 likes: validación comunitaria muy limitada; conviene tratar las mediciones como no replicadas de forma independiente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/kingjones777/LFM2.5-24B-A2B-ROCmFP4-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B
- Licencia LFM1.0: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B/blob/main/LICENSE
- Runtime Super ROC: https://github.com/kingjones30/superroc
