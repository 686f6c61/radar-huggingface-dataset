# IndrasMirror/Inkling-2-Mini-XQ-Uncensored

## Resumen

Inkling-2-Mini-XQ-Uncensored es una cuantización GGUF de precisión mixta del modelo base thinkingmachines/Inkling-2-Mini, publicada por el usuario IndrasMirror. El modelo original es un transformer tipo MoE con arquitectura "looped" (capas recurrentes) de 26.070 millones de parámetros totales, de los cuales aproximadamente 3.000 millones están activos por token (unos 5.400 millones efectivos, ya que las capas 6 a 17 se ejecutan tres veces). Incorpora visión (pipeline image-text-to-text) y un contexto declarado de hasta 1 millón de tokens.

La particularidad de esta versión es doble. Por un lado, se ha aplicado el método Unbound v2 de nokeepai para eliminar el comportamiento de rechazo ("refusal") de los pesos de atención, dando lugar a un modelo "uncensored" o "abliterated". Por otro, se ha recuantizado con el pipeline XQ de IndrasMirror, que combina expertos en precisión mixta (unos 4,0 bits por peso de media, con 13 de las 24 capas conservando los expertos NVFP4 oficiales bit a bit) y un backbone denso en Q8_0, resultando en un archivo de 13,93 GB.

El modelo está pensado para ejecutarse en GPUs de consumo, en particular una RTX 4090 de 24 GB, sobre el motor Xolotl (MIT), que incluye decodificación especulativa DSpark (MTP), caché K/V cuantizada y servidor compatible con las APIs de OpenAI y Anthropic. La licencia es Apache 2.0 y el único idioma declarado es el inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE "looped" (`inkling2_loop`), 24 capas físicas, 48 slots de caché, 744 tensores |
| Parametros totales | 26.070.390.272 (26,07 B) |
| Parametros activos | ~3 B por token (oficial); ~5,4 B efectivos por token (capas 6-17 ejecutadas 3 veces) |
| Longitud de contexto | 1M tokens (modelo base); 512K verificados en una RTX 4090 de 24 GB con `--kv-type k8v4` |
| Tipos de cuantizacion | GGUF de precisión mixta XQ: expertos enrutados ~4,0 bits/peso de media (NVFP4 bit a bit en 13 de 24 capas, Q2_0, IQ3/IQ4), backbone denso Q8_0; caché K/V q8_0 o k8v4 |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (archivo de 13,93 GB) |

## Arquitectura y entrenamiento

El modelo base Inkling-2-Mini emplea una arquitectura de mezcla de expertos con atención de posición relativa, convoluciones cortas y un esquema "looped": las capas 6 a 17 se ejecutan tres veces, lo que eleva el cómputo efectivo por token por encima del recuento oficial de parámetros activos. Dispone de 128 expertos enrutados con top-8 por token. El grafo de forward de la implementación en Xolotl está portado de llama.cpp (PR #32694, de Pedro Cuenca, MIT), con kernels CUDA fusionados propios para el bucle, la atención relativa, las convoluciones cortas y el MoE (unas 1.400 invocaciones de kernel por token, frente a ~6.000 en un port directo).

Sobre el entrenamiento del modelo base no se proporciona información en la documentación disponible (número de tokens, composición del dataset, RLHF/DPO). Lo que sí se documenta es el post-procesado: la edición de los pesos de atención con el método Unbound v2 de nokeepai (120 tensores exactos, que incluyen edición de rechazo y un fine-tune de auto-destilación) y la posterior recuantización XQ. La innovación técnica destacable es la decodificación especulativa DSpark (MTP) con hasta 7 tokens redactados por paso y rollback exacto del estado convolucional recurrente, además de la caché K/V cuantizada con rotación de Hadamard para contexto largo.

## Capacidades

- Generación de texto conversacional multi-turno en inglés.
- Razonamiento con modo "thinking" controlable mediante el parámetro `reasoning_effort` del servidor.
- Capacidades de visión: entrada image-text-to-text con torre de visión cargable en el motor (`--mmproj`).
- Soporte de tool calling / function calling en el servidor compatible con OpenAI y Anthropic.
- Decodificación especulativa (DSpark/MTP) para acelerar la generación, especialmente en código y matemáticas.
- Contexto muy largo: hasta 512K tokens en una sola GPU de 24 GB con caché K/V cuantizada.
- Comportamiento "uncensored": según el autor, 79,0 % de respuestas útiles y 0 % de rechazos en el protocolo de evaluación de nokeep (281 peticiones dañinas retenidas, juez Jev), con el modo thinking desactivado.

## Casos de uso

- Asistencia conversacional de contexto largo: el modelo puede mantener conversaciones multi-turno con documentos extensos gracias a su ventana de hasta 512K tokens en una RTX 4090, lo que permite adjuntar bases de código o expedientes completos sin fragmentar.
- Generación de código en pipelines de CI/CD: el soporte de tool calling y la decodificación especulativa DSpark (hasta ~150 tok/s en código con el drafter) lo hacen adecuado para autocompletado, revisión de parches y generación de tests en entornos de integración.
- Análisis de documentos con imágenes: al ser image-text-to-text, puede procesar capturas, diagramas o páginas escaneadas junto con texto para extraer información estructurada.
- Agentes autónomos multi-paso: la combinación de tool calling, razonamiento con `reasoning_effort` y contexto largo permite construir agentes que encadenan llamadas a herramientas sobre estados de conversación extensos.
- Despliegue en hardware de consumo: con 13,93 GB de pesos y opción `--vram-budget-mib` para mantener los expertos más usados en VRAM y el resto en RAM fijada, puede servirse en GPUs de 24 GB o menores con degradación controlada de rendimiento.
- Investigación sobre alineación y edición de pesos: al ser una variante "abliterated" documentada con protocolo de evaluación propio, sirve para estudiar el comportamiento de modelos sin rechazo y comparar con el base.
- Procesamiento por lotes de texto largo: con 4.190 tok/s de prefill en un prompt de 32K, es viable para tareas de resumen o extracción sobre corpus de gran tamaño en una sola máquina.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Los únicos datos de rendimiento documentados son de velocidad de inferencia y de la evaluación de "uncensored usefulness" del autor:

| Metrica | Valor |
|---|---|
| Decodificación, RTX 4090, prompt 2,8K, greedy | 113 tok/s |
| Decodificación con drafter DSpark | 140 tok/s |
| Prefill, prompt 32K (servido) | 4.190 tok/s (32K tokens en 7,8 s) |
| Decodificación con `--kv-type k8v4` a 7K / 30K / 117K | 127 / 118 / 100 tok/s |
| Contexto 512K, prompt de 477.603 tokens: prefill / decode | ~2.600 / 56 tok/s |
| Parent NVFP4 de 22,9 GB en el mismo motor | 89 tok/s decode; 137 con DSpark |
| Respuestas útiles sin thinking (protocolo nokeep, 281 peticiones) | 79,0 % |
| Tasa de rechazo (mismo protocolo) | 0 % |

## Requisitos de hardware

- VRAM estimada: el archivo GGUF ocupa 13,93 GB; con caché K/V `k8v4` y contexto de 512K el uso medido es de 23,4 GB (6,8 GiB solo de K/V), incluyendo drafter y torre de visión.
- GPU recomendadas: RTX 4090 (24 GB) es la referencia documentada; funciona en GPUs de 24 GB o menores usando `--vram-budget-mib` para descargar expertos a RAM fijada.
- Cabe en GPU de consumo: sí, en RTX 4090 y previsiblemente en otras tarjetas de 24 GB; en tarjetas menores requiere presupuesto de VRAM ajustado.
- Opciones de despliegue: motor Xolotl (MIT) con servidor compatible con OpenAI y Anthropic; el modelo también es compatible con otros motores que soporten la arquitectura `inkling2_loop` (el autor menciona reportes de 125-140 tok/s en RTX 3090 con otros motores). No se documenta soporte en vLLM, llama.cpp estándar, Ollama o TGI en la información disponible.
- Latencia y throughput: ver tabla de benchmarks; el prefill a 32K tarda 7,8 s y la decodificación en contexto de 477K cae a ~56 tok/s.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Inkling-2-Mini-XQ-Uncensored (este) | 26,07 B totales / ~3 B activos | 1M (512K en 24 GB) | Apache 2.0 | GGUF, 13,93 GB | Variante uncensored, visión, motor Xolotl |
| thinkingmachines/Inkling-2-Mini (base) | 26,07 B totales / ~3 B activos | 1M | Apache 2.0 | Pesos originales | Sin edición de rechazo; referencia de comportamiento |
| Parent NVFP4 de 22,9 GB | 26,07 B totales / ~3 B activos | 1M | Apache 2.0 | NVFP4 | 89 tok/s decode en Xolotl; mayor tamaño |
| nokeepai/Inkling-2-Mini-Unbound v2 (Q8_0) | 26,07 B totales / ~3 B activos | 1M | Apache 2.0 | GGUF Q8_0 | 80,8 % respuestas útiles en el mismo protocolo, al doble de tamaño |

No se dispone de datos de benchmarks estándar para comparar rendimiento de calidad frente a alternativas de otros linajes.

## Limitaciones y advertencias

- Solo inglés: el modelo declara únicamente el idioma `en`, por lo que el rendimiento en castellano u otros idiomas no está garantizado.
- Modelo "uncensored"/"abliterated": la edición de rechazo elimina salvaguardas de seguridad, lo que implica riesgo de generar contenido dañino, sesgado o ilegal; no es adecuado para aplicaciones orientadas al público sin filtros adicionales.
- Riesgo de alucinación inherente a los modelos generativos; no se documentan evaluaciones de factualidad.
- La evaluación de "usefulness" procede del propio autor con su protocolo y juez (Jev), sin validación independiente.
- El rendimiento documentado depende del motor Xolotl; en otros motores las cifras de velocidad y el soporte de contexto largo pueden diferir.
- La arquitectura `inkling2_loop` es poco común; el soporte en ecosistemas estándar (vLLM, Ollama, TGI) no está confirmado en la información disponible.
- Aunque la licencia es Apache 2.0, el uso comercial de una variante sin rechazo puede conllevar obligaciones regulatorias adicionales según la jurisdicción.
- El contexto de 512K en 24 GB depende de la caché K/V cuantizada `k8v4`, que introduce una degradación medida (diferencia media absoluta de NLL de 0,0454 frente a f16, cuyo suelo run-to-run es 0,0395).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/IndrasMirror/Inkling-2-Mini-XQ-Uncensored
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Método Unbound v2 de nokeepai: https://huggingface.co/nokeepai/Inkling-2-Mini-Unbound
- Motor Xolotl: https://github.com/Indras-Mirror/Xolotl
- Changelog de Xolotl: https://github.com/Indras-Mirror/Xolotl/blob/main/docs/xolotl/CHANGELOG.md
- Strata (base del motor): https://github.com/Niko1221/Strata
- Port del forward en llama.cpp (PR #32694): https://github.com/ggml-org/llama.cpp/pull/32694
- Basalt (kernels de atención portados): https://github.com/jesdga95/basalt
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
