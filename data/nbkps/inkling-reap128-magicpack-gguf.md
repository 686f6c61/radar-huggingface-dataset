# nbKPS/inkling-reap128-magicpack-gguf

## Resumen

Inkling-Small REAP128 Magicpack es una compilación de cuantizaciones GGUF del modelo multimodal Inkling-Small de ThinkingMachines, podada mediante REAP (expert pruning guiado por saliencia de enrutamiento) para reducir los expertos enrutados de 256 a 128 por capa. El modelo base declara 276B parámetros totales con 12B activos (arquitectura MoE con visión y audio), aunque los safetensors del repositorio registran 134.785.203.754 parámetros totales, cifra que no concuerda con la model card y que conviene verificar antes de usarlo como referencia de tamaño. El autor de la adaptación es nbKPS (KPS Labs), con tres DGX Spark en octubre de 2026.

La relevancia de esta ficha está en que empaqueta un MoE multimodal de gran tamaño para servir en un único nodo DGX Spark / GB10 mediante llama.cpp, con una receta de cuantización mixta ("Magicpack") que mantiene q8_0 en atención, expertos compartidos, embeddings y salida, y comprime solo los expertos enrutados. Se ofrecen dos builds: `magicpack-g` (56 GiB, IQ3_S/IQ3_XXS) y `magicpack-d-mxfp4-mxfp4` (70 GiB, MXFP4). La licencia es "other" heredada del modelo base, sin idiomas declarados en la ficha de HuggingFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (texto + vision + audio); expertos enrutados podados de 256 a 128 por capa |
| Parametros totales | 134.785.203.754 segun safetensors del repo; la model card declara 276B totales (discrepancia sin resolver) |
| Parametros activos | 12B (segun model card) |
| Longitud de contexto | 327.680 tokens en la configuracion de servicio recomendada (`-c 327680`) |
| Tipos de cuantizacion | `magicpack-g`: IQ3_S / IQ3_XXS en expertos enrutados; `magicpack-d-mxfp4-mxfp4`: MXFP4; q8_0 en atencion, expertos compartidos, embeddings y salida; F32 en `attn_rel_proj` y shortconvs; torres de vision y audio en F16 (`mmproj-inkling-f16.gguf`) |
| Idiomas soportados | no disponible |
| Licencia | other (aplica la licencia del modelo base ThinkingMachines/Inkling-Small) |
| Formato de pesos | GGUF (shards divididos, apuntar a `*-00001-of-*.gguf`); BF16 denso disponible en repos separados |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE multimodal con expertos enrutados y expertos compartidos, torres de visión y audio, y mecanismos de atención con proyecciones relativas (`attn_rel_proj`) y convoluciones cortas ("shortconvs") que la receta Magicpack fija en F32 para preservar la aritmética del bias relativo. La poda REAP reduce los expertos enrutados de 256 a 128 por capa usando un criterio de saliencia REAP multiplicado por el recuento de enrutamiento ("sum"), seleccionado mediante evaluación de kept-mask de cada candidato. Estos cortes son "vanilla": no hay healing ni post-entrenamiento posterior a la poda.

La cuantización emplea una imatrix calculada sobre el propio modelo podado en dos pasadas (semilla, imatrix de la pasada 1, referencia iq4_xs, y luego mezcla de imatrices frescas y amplias con pesos φ+e). Los datos de entrenamiento del modelo base (número de tokens, composición del dataset, RLHF/DPO) no están disponibles en la información proporcionada. Los pesos BF16 densos resultantes de la poda son públicos en `nbKPS/inkling-reap128-bf16` y `nbKPS/inkling-reap192-bf16`.

## Capacidades

- Generación de texto conversacional con modo de razonamiento (`--reasoning-format auto`).
- Procesamiento multimodal: visión y audio mediante `mmproj-inkling-f16.gguf` (torres nunca cuantizadas).
- Tool calling / function calling mediante plantilla Jinja parcheada (`Inkling.patched.jinja`) que sustituye `tojson(sort_keys=true)` por `tojson`, ya que minja no implementa la variante con ordenación de claves.
- Razonamiento multi-paso y uso como agente: la model card reporta resultados en un examen agéntico propio (Hermes agentic board) con tareas de coding, operaciones de flota ("Casey Factor") y tareas diarias.
- Soporte de gramáticas lazy en llama.cpp para forzar el parser de tool calls sobre `<|content_invoke_tool_json|>`.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Servicio de agente autónomo en un único DGX Spark: el modelo se despliega con llama.cpp y `--jinja`, con gramática lazy armada sobre `<|content_invoke_tool_json|>` para eliminar fugas de tool calls (0 fugas en 437+ turnos según la model card), lo que lo hace apto para pipelines agénticos con muchas llamadas a herramientas.
- Asistente de coding en producción: la model card reporta puntuación 1.000 en el "core" de coding de su board agéntico, por lo que puede integrarse en revisión de código, generación de parches y tareas de CI/CD que requieran tool calling fiable.
- Operaciones de flota e infraestructura ("Casey Factor", 0.948): tareas de fleet-ops con múltiples pasos y verificación externa, adecuadas por la ventana de 327.680 tokens que permite mantener estado operativo prolongado.
- Conversación multimodal con audio y visión: gracias a `mmproj-inkling-f16.gguf`, puede atender consultas que combinen capturas, documentos escaneados o audio transcrito en un mismo contexto largo.
- Procesamiento de documentos extensos: con 327.680 tokens de contexto y `--cache-type-k q8_0`, es viable resumir o extraer información de corpus largos en una sola pasada, con V cache obligatoriamente en f16.
- Despliegue en hardware de gama workstation: el build `magicpack-g` de 56 GiB está dimensionado para un solo DGX Spark / GB10 con `-ngl 999` y `-fa on`, permitiendo servir 5 slots paralelos (`--parallel 5`) con `-ub 1024 -b 2048`.
- Evaluación comparativa de poda: al publicarse los BF16 densos kept-mask (`inkling-reap128-bf16`, `inkling-reap192-bf16`), sirve como referencia para estudiar el impacto de REAP y de la cuantización mixta sobre calidad (top-1 y KL frente a BF16 del teacher).

## Benchmarks y rendimiento

Datos publicados por el autor en la model card (board agéntico propio Hermes, no benchmarks estándar como MMLU o HumanEval):

| Build | Expertos enrutados (gate/up · down) | Tamano | Teacher top-1 · KL vs BF16 (78k pos) | Hermes agentic board |
|---|---|---|---|---|
| `magicpack-g` | IQ3_S · IQ3_XXS (gate/up de capas 38-41 en IQ3_XXS) | 56 GiB | 0.710 · 0.972 | 0.848 (core 1.000 · CF 0.948 · daily 72.5 · Opus 85.3) |
| `magicpack-d-mxfp4-mxfp4` | MXFP4 · MXFP4 | 70 GiB | 0.704 · 1.020 | no disponible |

Referencias adicionales de la model card: el suelo kept-mask del corte (modelo podado antes de cuantizar) es 0.733 · 0.87; la referencia iq4_xs lee 0.716 · 0.963, de modo que `magicpack-g` queda a 0.006 de top-1 de la referencia con 56 GiB frente a 68 GiB. Para escala, Inkling-Small completo en NVFP4 sobre dos nodos lee 0.902 en el mismo board. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada: 56 GiB para `magicpack-g` y 70 GiB para `magicpack-d-mxfp4-mxfp4`, más el `mmproj` F16; la model card aconseja presupuestar 12-30 GiB de deriva de memoria bajo carga sobre la memoria libre tras la carga para elegir el número de slots.
- GPU recomendadas: DGX Spark / GB10 (objetivo declarado, un solo nodo); no hay datos para A100, H100 o RTX 4090 en la información disponible.
- Consumer GPU: no disponible; los tamaños de 56-70 GiB exceden la VRAM típica de GPU de consumo, aunque no se confirma en la model card.
- Despliegue: llama.cpp (rama `add-inkling`) con `llama-server`, `-ngl 999`, `-fa on`, `-c 327680`, `--parallel 5`, `-ub 1024`, `-b 2048`, `--cache-type-k q8_0`, `--jinja`, `--reasoning-format auto` y `--chat-template-file Inkling.patched.jinja`. Otras opciones (vLLM, TGI, Ollama) no están documentadas para este build.
- Restricciones de serving: la V cache debe mantenerse en f16 en esta arquitectura; sin la plantilla parcheada, toda petición con herramientas devuelve 500.
- Latencia y throughput: no disponibles; la model card solo aporta parámetros de sampling (temperature 0.85, min_p 0.05, top_p 1, top_k off) que maximizaron la puntuación agéntica.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Inkling-Small REAP128 Magicpack (este) | 134.785.203.754 segun safetensors; 276B/12B activos segun card | 327.680 | GGUF (56/70 GiB) | other | HuggingFace `nbKPS/inkling-reap128-magicpack-gguf` |
| Inkling-Small completo NVFP4 | 276B / 12B activos | no disponible | NVFP4 | other (base) | Referenciado en la card; requiere dos nodos |
| `nbKPS/inkling-reap192-bf16` | no disponible | no disponible | BF16 denso | other (base) | HuggingFace |
| `nbKPS/inkling-reap128-bf16` | no disponible | no disponible | BF16 denso | other (base) | HuggingFace |

Comparativa con alternativas de otros autores: no disponible en la información proporcionada.

## Limitaciones y advertencias

- Discrepancia de parámetros: los safetensors registran 134.785.203.754 totales frente a los 276B/12B activos de la model card; verificar la cifra real antes de planificar recursos.
- Licencia "other" heredada de ThinkingMachines/Inkling-Small: revisar los términos del modelo base antes de cualquier uso comercial; la ficha no detalla restricciones.
- Sin healing ni post-entrenamiento: la poda REAP128 degrada calidad respecto al modelo completo (0.848 frente a 0.902 en el board agéntico del autor, aunque medido en configuraciones distintas).
- Fugas de tool calls: el parser upstream de Inkling no arma gramática de tool call, por lo que aproximadamente el 1 % de los turnos agénticos puede filtrar la llamada como texto si no se activa la gramática lazy; con ella, 0 fugas en 437+ turnos.
- Plantilla de chat obligatoria: sin `Inkling.patched.jinja`, toda petición con herramientas devuelve 500 por `tojson(sort_keys=true)` no implementado en minja.
- Caché V: debe permanecer en f16; usar otra cuantización para V puede romper la arquitectura.
- Deriva de memoria: presupuestar 12-30 GiB adicionales bajo carga al dimensionar slots.
- Idiomas: no declarados; riesgo de rendimiento desigual fuera de los idiomas predominantes del entrenamiento (no disponible).
- Riesgo de alucinación y sesgos: no documentados en la información disponible; aplican los del modelo base.
- Los benchmarks reportados son de un board privado del autor (Hermes agentic exam) y no son comparables directamente con MMLU, HumanEval o GSM8K.

## Enlaces

- HuggingFace del build: https://huggingface.co/nbKPS/inkling-reap128-magicpack-gguf
- Modelo base: https://huggingface.co/ThinkingMachines/Inkling-Small
- BF16 kept-mask REAP128: https://huggingface.co/nbKPS/inkling-reap128-bf16
- BF16 kept-mask REAP192: https://huggingface.co/nbKPS/inkling-reap192-bf16
- llama.cpp (rama `add-inkling`): no disponible como enlace directo en la información proporcionada
- Papers, blogs, demos o repos adicionales: no disponibles en la información proporcionada
