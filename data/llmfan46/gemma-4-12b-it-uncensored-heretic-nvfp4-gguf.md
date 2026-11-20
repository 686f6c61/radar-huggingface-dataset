# llmfan46/gemma-4-12B-it-uncensored-heretic-NVFP4-GGUF

## Resumen

`llmfan46/gemma-4-12B-it-uncensored-heretic-NVFP4-GGUF` es una cuantizacion en formato GGUF NVFP4 del modelo `llmfan46/gemma-4-12B-it-uncensored-heretic`, a su vez una version "abliterada" (decensurada) de `google/gemma-4-12B-it`. El autor, llmfan46, es un contribuidor independiente que publica versiones sin restricciones de contenido de modelos populares mediante la herramienta Heretic v1.2.0 y el metodo Arbitrary-Rank Ablation (ARA). El modelo resuelve el problema de los rechazos y evasivas del modelo original ante ciertas peticiones, reduciendo la tasa de rechazo de 99/100 a 6/100 segun las metricas del autor, manteniendo una divergencia KL de 0.1203 respecto al original.

Arquitectura y tamano: se trata de un transformer denso de 11.907.350.904 parametros (aproximadamente 11,9 mil millones), heredado de la familia Gemma 4 de Google. El pipeline declarado es `any-to-any`, lo que sugiere capacidades multimodales de entrada y salida, aunque la model card no detalla que modalidades concretas cubre. El repositorio ocupa 8,3 GB, coherente con una cuantizacion de 4 bits de un modelo de ~12B.

La relevancia actual radica en su naturaleza decensurada: es una opcion para desarrolladores que necesitan un modelo con menos restricciones de contenido para tareas de investigacion, generacion creativa sin filtros o evaluacion de robustez, a costa de asumir los riesgos eticos y legales asociados. La licencia declarada es Apache 2.0, aunque el enlace de licencia apunta a los terminos de Gemma 4 de Google, lo que introduce ambiguedad sobre las condiciones reales de uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Gemma 4), pipeline `any-to-any` |
| Parametros totales | 11.907.350.904 (~11,9B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | NVFP4 GGUF (cuantizacion de 4 bits en formato GGUF) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 (con enlace a la licencia de Gemma 4 de Google) |
| Formato de pesos | GGUF (variante NVFP4); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de la familia Gemma 4, con 11,9 mil millones de parametros. Sobre el se aplico una ablacion de direcciones en el espacio de activaciones mediante Heretic v1.2.0 con el metodo Arbitrary-Rank Ablation (ARA). Los parametros de ablacion publicados son: `start_layer_index` 24, `end_layer_index` 40, `preserve_good_behavior_weight` 0.7201, `steer_bad_behavior_weight` 0.0067, `overcorrect_relative_weight` 0.9541 y `neighbor_count` 15. El componente objetivo de la ablacion fue `attn.o_proj`, es decir, la proyeccion de salida de la atencion en las capas 24 a 40.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO en el modelo original, ya que la model card no los detalla. La innovacion tecnica destacable es el uso de ARA para reducir rechazos preservando el comportamiento general, medido mediante divergencia KL (0.1203) y tasa de rechazo (6/100 frente a 99/100 del original). La cuantizacion NVFP4 reduce el peso a 8,3 GB, facilitando el despliegue en hardware con VRAM limitada.

## Capacidades

- Generacion de texto conversacional multi-turno, segun el tag `conversational`.
- Razonamiento y conocimiento general, con un 73,02% de acierto en MMLU tras la ablacion (76,17% en el original).
- Pipeline `any-to-any`, lo que sugiere soporte multimodal de entrada y salida, aunque no se detallan las modalidades concretas.
- Respuestas con menos rechazos y evasivas: 6/100 frente a 99/100 del original en la metrica del autor.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo thinking, vision o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion sobre alineacion y seguridad: el modelo permite estudiar como la ablacion de direcciones afecta a la tasa de rechazo y a la calidad general, comparando con el original mediante KL y MMLU.
- Generacion creativa sin filtros: escritura de ficcion, guiones o narrativa que requiera tematicas adultas o controvertidas, donde el modelo original rechazaria la peticion.
- Evaluacion de robustez de filtros: usar el modelo como generador adversarial para probar sistemas de moderacion de contenido en pipelines de produccion.
- Despliegue en hardware de consumo: al ocupar 8,3 GB en GGUF NVFP4, puede ejecutarse en GPUs con 12-16 GB de VRAM mediante llama.cpp u Ollama, lo que facilita prototipado local.
- Experimentacion con cuantizacion NVFP4: comparar la calidad de esta cuantizacion frente a otras (Q4_K_M, Q5_K_M) en tareas de razonamiento y conocimiento.
- Base para fine-tuning sin restricciones: servir como punto de partida para ajustes especificos donde el modelo original introduciria sesgos de rechazo.
- Analisis de sesgos y contenido danino: generar respuestas sin censura para auditar que tipo de contenido produce el modelo y disenar mitigaciones.

## Benchmarks y rendimiento

| Benchmark | Este modelo (Heretic) | Original (gemma-4-12B-it) |
|---|---|---|
| MMLU (accuracy global) | 73,02% (5127/7021) | 76,17% (5348/7021) |
| MMLU fallos de parseo | 74 | 177 |
| Tasa de rechazo | 6/100 | 99/100 |
| Divergencia KL | 0.1203 | 0 (por definicion) |

Resultados MMLU por asignatura destacados (Heretic frente a original, donde se dispone de ambos): `professional_law` 0.6064, `moral_scenarios` 0.6946, `miscellaneous` 0.8512, `professional_psychology` 0.8228, `high_school_psychology` 0.9148, `high_school_macroeconomics` 0.8680, `elementary_mathematics` 0.8370, `high_school_mathematics` 0.3150, `college_mathematics` 0.3455, `college_chemistry` 0.3191, `high_school_computer_science` 0.9615, `management` 0.9400. Los datos por asignatura del modelo Heretic aparecen truncados en la model card; solo se dispone del global.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio GGUF NVFP4 ocupa 8,3 GB, por lo que se necesita al menos ~9-10 GB de VRAM para cargar los pesos, mas overhead de contexto KV cache.
- GPU recomendadas: RTX 4090 (24 GB), RTX 4080 (16 GB), RTX 4070 Ti Super (16 GB), A100 (40/80 GB), H100 (80 GB).
- Cabe en GPU de consumo: si, en GPUs con 12 GB o mas (RTX 3060 12 GB, RTX 4070 12 GB, RTX 4060 Ti 16 GB), dependiendo de la longitud de contexto.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; el tag `endpoints_compatible` sugiere compatibilidad con endpoints de Hugging Face. vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU | Licencia | Formato |
|---|---|---|---|---|---|
| gemma-4-12B-it-uncensored-heretic-NVFP4-GGUF (este) | ~11,9B | No disponible | 73,02% | Apache 2.0 | GGUF NVFP4 |
| google/gemma-4-12B-it (original) | ~11,9B | No disponible | 76,17% | Gemma 4 license | Safetensors |
| llmfan46/gemma-4-12B-it-uncensored-heretic (base) | ~11,9B | No disponible | No disponible | Apache 2.0 | Safetensors |

No se dispone de datos de benchmarks de modelos comparables de otros autores en la informacion proporcionada. La comparativa se limita a las variantes del mismo modelo.

## Limitaciones y advertencias

- La ablacion reduce la calidad general: MMLU cae de 76,17% a 73,02%, una perdida de ~3,15 puntos porcentuales.
- Divergencia KL de 0.1203 respecto al original, lo que indica cambios en la distribucion de salida que pueden afectar a la coherencia en tareas especificas.
- Modelo decensurado: puede generar contenido danino, ofensivo o ilegal; no es apto para produccion sin moderacion adicional.
- Ambiguedad de licencia: se declara Apache 2.0 pero se enlaza la licencia de Gemma 4 de Google, que puede imponer restricciones adicionales al uso comercial.
- Idiomas soportados no documentados; el rendimiento multilingue es incierto.
- Longitud de contexto no disponible; no se puede planificar su uso en tareas de contexto largo sin verificar.
- La cuantizacion NVFP4 puede degradar aun mas la calidad frente al modelo base en safetensors; no se publican benchmarks de la version cuantizada.
- El autor indica que ha alcanzado el limite de almacenamiento gratuito de Hugging Face, lo que pone en riesgo la disponibilidad futura del repositorio.
- Riesgo de alucinacion inherente a modelos de ~12B, agravado por la ablacion.

## Enlaces

- Hugging Face: https://huggingface.co/llmfan46/gemma-4-12B-it-uncensored-heretic-NVFP4-GGUF
- Modelo base (safetensors): https://huggingface.co/llmfan46/gemma-4-12B-it-uncensored-heretic
- Modelo original de Google: https://huggingface.co/google/gemma-4-12B-it
- Heretic (herramienta de ablacion): https://github.com/p-e-w/heretic
- Metodo ARA (PR): https://github.com/p-e-w/heretic/pull/211
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Ko-fi del autor: https://ko-fi.com/llmfan46
- Patreon del autor: https://patreon.com/LLMfan46
