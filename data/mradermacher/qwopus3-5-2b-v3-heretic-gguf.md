# mradermacher/Qwopus3.5-2B-v3-heretic-GGUF

## Resumen

Qwopus3.5-2B-v3-heretic-GGUF es la distribucion en formato GGUF del modelo tvall43/Qwopus3.5-2B-v3-heretic, una variante "abliterated" o "decensored" derivada de la familia Qwen 3.5, con aproximadamente 1.880 millones de parametros (1.881.825.088 exactos segun los pesos en safetensors). El modelo lo publica mradermacher, un conocido cuantizador de la comunidad de HuggingFace que genera versiones GGUF estaticas e imatrix de modelos populares para su uso en llama.cpp y entornos de inferencia local. La relevancia de esta ficha radica en que ofrece una version ligera, cuantizada y sin filtros de rechazo, pensada para experimentacion, investigacion sobre alineamiento y despliegues en hardware modesto.

La etiqueta "heretic" y "abliterated" indica que el modelo base ha sido sometido a una tecnica de ablacion de direcciones de rechazo en el espacio de activaciones, orientada a eliminar las negativas sistematicas del modelo original ante ciertas peticiones. Esto lo aleja de un uso comercial responsable generalista y lo acerca a casos de investigacion, pruebas de robustez y generacion creativa sin restricciones. El contexto, la composicion exacta del dataset de entrenamiento y los detalles de la ablacion no estan documentados en la informacion disponible.

La ficha se centra en la version GGUF publicada por mradermacher, que incluye 11 cuantizaciones estaticas desde Q2_K (1,1 GB) hasta f16 (3,9 GB), todas compatibles con llama.cpp, Ollama y otros runners que consumen el formato. Existe ademas una variante con cuantizacion ponderada/imatrix en el repositorio hermano del mismo autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen 3.5, segun tag `qwen3_5`); detalles no disponibles |
| Parametros totales | 1.881.825.088 (aprox. 1,88 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K (estaticas); variante imatrix en repositorio separado |
| Idiomas soportados | en (segun model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors disponibles en el modelo base) |

## Arquitectura y entrenamiento

El modelo base es tvall43/Qwopus3.5-2B-v3-heretic, una variante derivada de la familia Qwen 3.5 (tag `qwen3_5` en la model card). Se trata de un transformer decoder-only de aproximadamente 1,88 mil millones de parametros. La informacion disponible no detalla el numero de capas, dimensiones ocultas, atencion (MHA/GQA), tipo de tokenizador ni longitud de contexto nativa; tampoco se documenta el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO.

La innovacion tecnica diferencial es el proceso de "abliteration" o "decensoring" aplicado por el autor del modelo base (tvall43), que consiste en identificar y ablacionar direcciones de activacion asociadas a la negativa del modelo a responder ciertas peticiones. El resultado es un modelo que reduce los rechazos sistematicos, a costa de posibles degradaciones en coherencia, seguridad y fidelidad factual. La cuantizacion publicada por mradermacher es estatica (no imatrix en este repositorio) y se genero con `quantize_version: 2` y `output_tensor_quantised: 1`, segun los metadatos de la model card.

## Capacidades

- Generacion de texto conversacional en ingles, orientada a dialogos multi-turno.
- Reduccion de rechazos ante peticiones que el modelo original filtraria (comportamiento "uncensored").
- Generacion creativa sin restricciones tematicas aparentes.
- Compatible con `text-generation-inference` (tag) y con runners GGUF como llama.cpp, Ollama y derivados.
- Soporte de tool calling y function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: solo `en` declarado; el resto no disponible.
- Capacidades especiales (thinking mode, vision, audio): no documentadas.

## Casos de uso

- Investigacion sobre alineamiento y seguridad: el modelo permite estudiar el efecto de la ablacion de direcciones de rechazo comparando respuestas con el modelo base original sin ablacionar, en un entorno controlado y con hardware de gama baja.
- Pruebas de robustez y red teaming: util para evaluar como responde un modelo de 2 B sin filtros ante prompts adversarios, midiendo la tasa de cumplimiento y la calidad de las respuestas.
- Generacion creativa sin restricciones: escritura de ficcion, guiones o narrativa que requiera tematicas que otros modelos rechazan, con la ventaja de que el modelo cabe en 1,4 GB en Q4_K_M.
- Despliegue local en hardware modesto: al ocupar entre 1,1 y 3,9 GB segun cuantizacion, puede ejecutarse en portatiles, mini-PC y GPUs de gama baja para asistentes personales offline.
- Prototipado rapido de chatbots: su tamano reducido permite iterar rapidamente en pipelines de conversacion antes de escalar a modelos mayores.
- Educacion y demostraciones: util para explicar en talleres como funciona la cuantizacion GGUF y el efecto de la ablacion, con un modelo que se carga en segundos.
- Evaluacion de cuantizaciones: el repositorio ofrece 11 variantes, lo que permite medir el impacto de la cuantizacion en calidad y latencia sobre un mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto): entre 1,1 GB (Q2_K) y 3,9 GB (f16); Q4_K_M ocupa 1,4 GB.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM para Q4_K_M con contexto moderado; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son sobradamente suficientes.
- Cabe en GPU consumer: si, en practicamente cualquier GPU dedicada moderna e incluso en iGPU con memoria unificada suficiente.
- Opciones de despliegue: llama.cpp, Ollama, text-generation-inference (tag), y runners compatibles con GGUF. El modelo base esta en safetensors para transformers.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por tamano, se espera un throughput alto en GPU consumer, pero no se aportan numeros.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwopus3.5-2B-v3-heretic-GGUF (este) | 1,88 B | no disponible | Apache 2.0 | GGUF | Variante abliterated, solo en |
| tvall43/Qwopus3.5-2B-v3-heretic | 1,88 B | no disponible | Apache 2.0 | safetensors | Modelo base sin cuantizar |
| Qwen 3.5 2B (familia original) | ~2 B | no disponible | no disponible | safetensors | Modelo de referencia con filtros |
| Otros GGUF de ~2 B (p. ej. Llama 3.2 1B/3B) | 1-3 B | variable | variable | GGUF | Alternativas de tamano similar; datos concretos no disponibles |

La comparacion cuantitativa con alternativas no puede completarse porque no se han publicado benchmarks del modelo en la informacion disponible.

## Limitaciones y advertencias

- Modelo "abliterated"/"uncensored": reduce deliberadamente los rechazos, lo que implica mayor riesgo de generar contenido danino, sesgado o inexacto sin advertencia.
- La ablacion puede degradar la coherencia, la fidelidad factual y la calidad general respecto al modelo original.
- Riesgo elevado de alucinacion, especialmente en tareas factuales y de razonamiento complejo, agravado por el tamano reducido (1,88 B).
- Solo se declara soporte de ingles; el rendimiento en castellano no esta garantizado ni documentado.
- Longitud de contexto no documentada; no se recomienda asumir ventanas largas sin verificacion empirica.
- Licencia Apache 2.0 permite uso comercial, pero el contenido generado puede violar normativas locales o terminos de servicio de plataformas; la responsabilidad recae en el desplegador.
- No apto para produccion en casos que requieran seguridad, moderacion o precision factual sin capas adicionales de filtrado.
- El repositorio ocupa 18,1 GB por incluir todas las cuantizaciones; descargar solo la variante necesaria.
- Los metadatos de la model card no documentan el proceso exacto de ablacion ni el dataset de entrenamiento, lo que dificulta la reproducibilidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Qwopus3.5-2B-v3-heretic-GGUF
- Modelo base: https://huggingface.co/tvall43/Qwopus3.5-2B-v3-heretic
- Variante imatrix: https://huggingface.co/mradermacher/Qwopus3.5-2B-v3-heretic-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Qwopus3.5-2B-v3-heretic-GGUF
- Peticiones de modelos del autor: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
