# AnubysIII/GLM-5.3-Flash-Q8attn-Q4Kexp-GGUF

## Resumen

GLM-5.3-Flash-Q8attn-Q4Kexp-GGUF es una cuantización GGUF del modelo base zai-org/GLM-5.3-Flash, un transformer de tipo mixture-of-experts (MoE) con 320.759.404.382 parámetros totales y aproximadamente 17.000 millones activos, distribuidos en 288 expertos enrutados más un experto compartido. La cuantización la publica AnubysIII (Sovereign Games LLC) y está diseñada específicamente para ejecutarse en una única GPU de consumo combinada con abundante memoria RAM del sistema, no en un clúster de aceleradores.

La estrategia de cuantización es mixta: los tensores de atención, los bloques de atención lineal, el indexer, el experto compartido, las tres capas FFN densas, la cabeza MTP, los embeddings y la salida se mantienen en Q8_0, mientras que solo los expertos enrutados (`ffn_{gate,up,down}_exps`) se rebajan a Q4_K. El resultado ocupa 185 GB (4,6 bits por peso) frente a los 341 GB de un Q8_0 completo, y permite mantener la parte Q8 (unos 11 GB) en la GPU mientras los expertos se sirven desde RAM.

Es relevante porque demuestra una ruta práctica de despliegue de un MoE de 320B en hardware de gama alta de consumo (una RTX 3080 de 20 GB más 190 GB de RAM), con decodificación especulativa mediante MTP y soporte multimodal image-text-to-text a través de un proyector de visión. La licencia MIT del modelo base y de esta cuantización facilita el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con bloques de atención lineal, indexer, 3 capas FFN densas y cabeza MTP (multi-token prediction) |
| Parametros totales | 320.759.404.382 (320B) |
| Parametros activos | ~17B (288 expertos enrutados + 1 experto compartido) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta: Q8_0 (atención, atención lineal, indexer, experto compartido, 3 capas FFN densas, cabeza MTP, embeddings, salida) + Q4_K (expertos enrutados); 4,6 bits por peso efectivos; proyector de visión mmproj-F16 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (4 shards: `GLM-5.3-Flash-Q8attn-Q4Kexp-0000N-of-00004.gguf`) + `mmproj-F16.gguf` |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE con 320B parámetros totales y unos 17B activos por token, compuesto por 288 expertos enrutados más un experto compartido. La arquitectura incorpora bloques de atención lineal junto a atención convencional, un componente indexer, tres capas FFN densas y una cabeza MTP (multi-token prediction) que permite decodificación especulativa. El pipeline declarado es image-text-to-text, con un proyector de visión separado en formato F16.

Esta cuantización se genera a partir del GGUF Q8_0 de Unsloth usando su imatrix, mediante `llama-quantize --allow-requantize` con la regla `--tensor-type "ffn_.*_exps=q4_K"` sobre el Q8_0 de origen. Se construyó con llama.cpp `f3363593f` (octubre de 2026), que introduce soporte para GLM5-Next y MTP; se requiere esa build o posterior. Los detalles de entrenamiento del modelo base (número de tokens, composición del dataset, RLHF/DPO) no están disponibles en la información proporcionada.

## Capacidades

- Generación de texto conversacional y razonamiento multi-turno, con modo thinking que permanece activo incluso cuando se configura `enable_thinking=false`.
- Procesamiento multimodal image-text-to-text mediante `mmproj-F16.gguf` (proyector de visión procedente de Unsloth, sin modificar).
- Decodificación especulativa con MTP (`--spec-type draft-mtp --spec-draft-n-max 2`), que incrementa el throughput de generación.
- Soporte de tool calling / function calling: no confirmado en la información disponible (el tag `endpoints_compatible` sugiere compatibilidad con endpoints, pero no se detalla).
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingües: no disponible (los idiomas no están listados).
- Ejecución con offload de expertos a CPU/RAM (`-ncmoe 99`), manteniendo los tensores Q8 en GPU.

## Casos de uso

- Despliegue de un MoE de 320B en una estación de trabajo con una sola GPU de consumo: con `-ngl 99 -ncmoe 99` el modelo corre en una RTX 3080 de 20 GB más ~190 GB de RAM, útil para laboratorios que no disponen de clústeres multi-GPU.
- Asistente conversacional local con contexto largo: el modelo gestiona diálogos multi-turno y, con un ubatch grande (`-b 8192 -ub 4096`), procesa prompts de 4096 tokens a 140 tok/s, adecuado para resúmenes de documentos extensos.
- Análisis de imágenes y documentos escaneados: el pipeline image-text-to-text con `mmproj-F16.gguf` permite describir imágenes, extraer texto de capturas y responder preguntas sobre contenido visual.
- Generación de código en entornos con MTP: con decodificación especulativa n=2 el servidor alcanza 11,7 tok/s frente a 8,9 tok/s sin MTP, útil para autocompletado y revisión de código en pipelines internos.
- Evaluación e investigación de arquitecturas MoE con atención lineal: la mezcla Q8/Q4 permite estudiar el impacto de la cuantización de expertos con una perplexity medida de 2,647 ± 0,049 en wikitext-2.
- Prototipado de aplicaciones multimodales con llama.cpp: al estar en formato GGUF y requerir solo `llama-server`, se integra fácilmente en demos y entornos de desarrollo sin infraestructura dedicada.
- Pruebas de decodificación especulativa MTP: permite medir la ganancia de throughput de la cabeza MTP en hardware consumer antes de decidir un despliegue mayor.

## Benchmarks y rendimiento

Calidad medida por el autor:

| Metrica | Valor |
|---|---|
| Perplexity wikitext-2 (test, 40 chunks de 512 tokens) | 2,647 ± 0,049 |
| Referencia Q8_0 | no disponible (fuente eliminada antes de medir) |

Rendimiento medido en una RTX 3080 20 GB + 2x EPYC 7402 (Rome, AVX2, 16 canales DDR4), con `-ngl 99 -ncmoe 99 -t 40 -fa on`:

| Escenario | tok/s |
|---|---|
| Generación (llama-bench tg) | 9,5 |
| Servidor, código, sin MTP | 8,9 |
| Servidor, código, MTP (`--spec-type draft-mtp --spec-draft-n-max 2`) | 11,7 |
| Prompt de 4096 tokens (`-b 8192 -ub 4096`) | 140 |
| Prompt de 512 tokens (ub 2048) | 23 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM: unos 11 GB para la parte Q8 en GPU con `-ngl 99 -ncmoe 99`; con MTP n=2 y `-b 4096 -ub 2048` el servidor consumió 19,25 GB de los 20 GB de la tarjeta.
- RAM del sistema: aproximadamente 190 GB más el espacio necesario para el contexto.
- GPU recomendadas: RTX 3080 20 GB (medida por el autor); cualquier GPU con ~11-20 GB de VRAM y buen ancho de banda sirve para la parte Q8, ya que los expertos se ejecutan desde RAM.
- ¿Cabe en consumer GPU? Sí, con offload de expertos a RAM; no cabe entera en VRAM de consumo.
- Almacenamiento: 186,3 GB para el repo completo (4 shards GGUF + proyector).
- Opciones de despliegue: llama.cpp / `llama-server` (build `f3363593f` o posterior, imprescindible para GLM5-Next y MTP); otros runtimes no confirmados.
- Latencia y throughput: 9,5 tok/s de generación en el hardware medido; 11,7 tok/s con MTP; 140 tok/s de prefill con prompt de 4096 tokens. El rendimiento está limitado por el ancho de banda de memoria del sistema para los expertos Q4_K.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| GLM-5.3-Flash-Q8attn-Q4Kexp-GGUF (esta ficha) | 320B totales / ~17B activos | no disponible | Q8_0 + Q4_K mixta (185 GB) | MIT | Offload de expertos a RAM; MTP; vision |
| zai-org/GLM-5.3-Flash (base) | 320B totales / ~17B activos | no disponible | safetensors (sin cuantizar) | MIT | Modelo original |
| unsloth/GLM-5.3-Flash-GGUF (Q8_0) | 320B totales / ~17B activos | no disponible | Q8_0 (341 GB) | MIT | Fuente de esta cuantización; mayor tamaño, mayor fidelidad |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada; la única métrica disponible es la perplexity de esta cuantización (2,647 ± 0,049), sin cifra equivalente para el Q8_0 de origen.

## Limitaciones y advertencias

- Perplexity medida sin referencia Q8_0: el autor eliminó la fuente antes de medir, por lo que no se puede cuantificar la pérdida de calidad frente a Q8_0.
- Thinking mode siempre activo: incluso con `enable_thinking=false` el modelo sigue en modo razonamiento, lo que aumenta la longitud de las respuestas y el coste de generación.
- Requisito de build específica de llama.cpp (`f3363593f` de octubre de 2026 o posterior); builds anteriores no soportan GLM5-Next ni MTP.
- Consumo de RAM elevado (~190 GB más contexto): inviable en equipos con menos memoria; el throughput depende del ancho de banda de la RAM del sistema.
- Contexto máximo no documentado: no se puede planificar el truncado de prompts con un límite conocido.
- Idiomas soportados no documentados: riesgo de comportamiento irregular fuera del inglés y del chino.
- Riesgo de alucinación inherente a modelos generativos, no evaluado en esta cuantización; sin benchmarks de MMLU/HumanEval/GSM8K publicados.
- Tool calling y capacidades de agente no confirmadas explícitamente; validar antes de integrar en pipelines automatizados.
- Licencia MIT permite uso comercial, pero conviene revisar las condiciones del modelo base y del proyector de visión de Unsloth.
- Repo con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria adicional.

## Enlaces

- Hugging Face (esta cuantización): https://huggingface.co/AnubysIII/GLM-5.3-Flash-Q8attn-Q4Kexp-GGUF
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- GGUF Q8_0 e imatrix de Unsloth: https://huggingface.co/unsloth/GLM-5.3-Flash-GGUF
- Repositorio llama.cpp: https://github.com/ggml-org/llama.cpp
