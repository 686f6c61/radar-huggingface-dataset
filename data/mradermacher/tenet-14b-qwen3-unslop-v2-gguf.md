# mradermacher/Tenet-14B-Qwen3-Unslop-v2-GGUF

## Resumen

Tenet-14B-Qwen3-Unslop-v2-GGUF es la distribucion en formato GGUF del modelo Tenet-14B-Qwen3-Unslop-v2, un ajuste fino del modelo base mr-andrey-isachenko/Tenet-14B-Qwen3-Unslop-v2. El modelo original parte de la familia Qwen3 (segun los tags y la nomenclatura) y ha sido sometido a un proceso de "unslop" (eliminacion de sesgos de estilo y respuestas genericas) y tecnicas de abliteration/uncensoring, orientado a tareas de razonamiento, codigo, uso de herramientas y flujos agenticos. Esta version GGUF la publica mradermacher, un conocido cuantizador de la comunidad de Hugging Face, y permite ejecutar el modelo en hardware de consumo mediante llama.cpp y derivados.

El modelo cuenta con aproximadamente 14.768 millones de parametros (14,7B), lo que lo situa en la franja de modelos medianos que caben en GPUs de consumo con cuantizaciones agresivas. La licencia es Apache 2.0, lo que facilita el uso comercial, y el idioma declarado es unicamente ingles. El repositorio incluye 11 cuantizaciones estaticas que van desde Q2_K (5,9 GB) hasta Q8_0 (15,8 GB), cubriendo un rango amplio de requisitos de VRAM.

La relevancia de esta ficha radica en que el modelo combina varias tendencias actuales: ajuste fino sobre Qwen3 para razonamiento con modo thinking, entrenamiento con GRPO (segun los tags), capacidades agenticas y de tool-use, y una variante "abliterated/uncensored" que reduce los rechazos del modelo. No obstante, la informacion publica disponible es escasa y no se han publicado benchmarks verificables en la documentacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Qwen3, segun nomenclatura y tags) |
| Parametros totales | 14.768.307.200 (14,7B) |
| Parametros activos | no disponible (no es MoE segun la informacion) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (y F16 segun metadatos de cuantizacion) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de cuantizaciones); el modelo base en safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only derivado de Qwen3, segun la nomenclatura del modelo base y los tags `qwen3` y `reasoning`/`thinking`. El modelo original ha sido ajustado mediante "unslop" (una tecnica de refinamiento para eliminar respuestas genericas o excesivamente formateadas) y, segun los tags, mediante GRPO (Group Relative Policy Optimization), una variante de RL usada para mejorar razonamiento. Tambien aparece el tag `abliterated`, que indica que se ha aplicado una tecnica de abliteration para reducir los rechazos del modelo (eliminacion de la direccion de refusal en el espacio de activaciones).

No se dispone de informacion detallada sobre el numero de tokens de entrenamiento, la composicion del dataset ni los detalles exactos del pipeline de RLHF/DPO. Los tags mencionan `fp8`, `vllm` y `openrouter`, lo que sugiere que el modelo esta pensado para despliegue en produccion con vLLM y su publicacion en OpenRouter. Esta version concreta es una cuantizacion estatica (no weighted/imatrix, segun la model card) realizada por mradermacher con su pipeline de cuantizacion version 2.

## Capacidades

- Generacion de texto conversacional multi-turno.
- Razonamiento con modo "thinking" (segun los tags `reasoning` y `thinking`).
- Generacion de codigo (tag `coding`).
- Uso de herramientas y function calling (tag `tool-use`).
- Flujos agenticos y razonamiento multi-paso (tag `agentic`).
- Variante "uncensored/abliterated": menor tasa de rechazos ante peticiones que el modelo base rechazaria.
- Capacidades multilingues: limitadas al ingles segun el campo `language`.
- No se declaran capacidades de vision, audio ni multimodalidad.

## Casos de uso

- Asistente de codigo en local: con la cuantizacion Q4_K_M (9,1 GB) el modelo puede ejecutarse en una GPU de consumo de 12-16 GB y usarse como asistente de programacion en IDE mediante llama.cpp u Ollama, aprovechando su entrenamiento en codigo y tool-use.
- Agente autonomo con function calling: el tag `agentic` y `tool-use` sugieren que el modelo esta entrenado para invocar herramientas; puede integrarse en frameworks como LangChain o smolagents para tareas de automatizacion con APIs externas.
- Razonamiento con cadena de pensamiento: el modo thinking permite usarlo en tareas de analisis que requieren pasos intermedios explicitos, como resolucion de problemas logicos o analisis de datos.
- Despliegue en produccion con vLLM: al estar etiquetado con `vllm` y `openrouter`, el modelo base esta pensado para servirse con vLLM; la version GGUF es mas adecuada para entornos sin GPU de datacenter.
- Experimentacion en investigacion sobre abliteration: util para estudiar el efecto de la eliminacion de la direccion de refusal en modelos Qwen3 de 14B, comparando con el modelo base.
- Prototipado en hardware de consumo: las cuantizaciones Q2_K (5,9 GB) y Q3_K_S (6,8 GB) permiten ejecutar el modelo en GPUs de 8 GB, lo que facilita pruebas locales sin infraestructura dedicada.
- Generacion de texto creativo sin filtros restrictivos: la variante uncensored puede usarse en entornos controlados donde se requiere menor tasa de rechazos (con las advertencias eticas correspondientes).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto): Q2_K ~5,9 GB; Q3_K_S ~6,8 GB; Q4_K_S ~8,7 GB; Q4_K_M ~9,1 GB; Q5_K_M ~10,6 GB; Q6_K ~12,2 GB; Q8_0 ~15,8 GB; F16 ~29,5 GB.
- GPU recomendadas: RTX 3060 12 GB o RTX 4070 para Q4_K_M; RTX 4080/4090 (16-24 GB) para Q5/Q6/Q8; A100/H100 para F16 o despliegue con mayor paralelismo.
- Cabe en GPU de consumo: si, desde 8 GB con Q2_K/Q3_K_S hasta 24 GB con Q8_0.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python; el modelo base (safetensors) con vLLM o TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Tenet-14B-Qwen3-Unslop-v2 (este) | 14,7B | no disponible | Apache 2.0 | GGUF / safetensors | Ajuste Qwen3 con unslop, GRPO y abliteration |
| Qwen3-14B (base de referencia) | ~14B | no disponible | Apache 2.0 | safetensors / GGUF | Modelo original de Alibaba; sin ajuste comunitario |
| Otros 14B de la comunidad | no disponible | no disponible | variable | GGUF | No se dispone de datos comparativos verificables |

No se dispone de datos de rendimiento comparativo verificables en la informacion proporcionada; la comparativa se limita a parametros y licencia.

## Limitaciones y advertencias

- Solo soporta ingles de forma declarada; el rendimiento en castellano no esta garantizado.
- La naturaleza "abliterated/uncensored" implica menor tasa de rechazos: riesgo de generar contenido inapropiado o danino; requiere filtros externos en produccion.
- Riesgo de alucinacion inherente a los modelos de 14B, especialmente en tareas de razonamiento largo.
- No se han publicado benchmarks; el rendimiento real es desconocido y debe validarse empiricamente.
- Las cuantizaciones Q2_K y Q3_K_S degradan notablemente la calidad; la model card recomienda Q4_K_S o superior.
- No se dispone de informacion sobre la longitud de contexto soportada; el uso con contextos largos no esta garantizado.
- El proceso de "unslop" y abliteration puede alterar el comportamiento del modelo base de formas no documentadas.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base original (Qwen3) y del ajuste de mr-andrey-isachenko.
- No se dispone de informacion sobre sesgos especificos medidos.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Tenet-14B-Qwen3-Unslop-v2-GGUF
- Modelo base: https://huggingface.co/mr-andrey-isachenko/Tenet-14B-Qwen3-Unslop-v2
- Pagina de overview de cuantizaciones: https://hf.tst.eu/model#Tenet-14B-Qwen3-Unslop-v2-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y peticiones de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
- nethype GmbH: https://www.nethype.de/
