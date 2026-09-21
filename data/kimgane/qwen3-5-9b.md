# KImgane/Qwen3.5-9B

## Resumen

KImgane/Qwen3.5-9B es un ajuste fino publicado por el usuario KImgane sobre el modelo base Qwen/Qwen3.5-9B-Base, de la familia Qwen3.5 de Alibaba. El repositorio contiene pesos en formato safetensors compatibles con la libreria transformers y con el pipeline image-text-to-text, lo que indica que conserva el encoder de vision del modelo original. El dato real de safetensors cifra el total en 9.653.104.368 parametros (aproximadamente 9,65 mil millones), con un tamano de repositorio de 19,3 GB, coherente con pesos en precision de 16 bits.

La model card publicada en el repositorio reproduce el contenido de la ficha oficial de Qwen3.5-9B y no aporta informacion especifica sobre el proceso de ajuste: no se documentan el dataset utilizado, el metodo de entrenamiento, el numero de tokens de refinamiento ni los hiperparametros. Tampoco se declaran idiomas soportados a nivel de repositorio ni resultados de evaluacion propios del ajuste. Por tanto, todas las capacidades descritas deben atribuirse a la arquitectura y al entrenamiento del modelo base, no a una validacion especifica de esta variante.

La relevancia de este modelo reside en su arquitectura hibrida: combina capas de Gated DeltaNet (atencion lineal) con capas de Gated Attention y una red feed-forward, con un contexto nativo de 262.144 tokens extensible hasta 1.010.000. La model card del autor menciona ademas el uso de Mixture-of-Experts disperso, aunque no se especifica el numero de parametros activos. Con 10 descargas y 0 likes en el momento de la consulta, se trata de un repositorio practicamente sin validacion por parte de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con encoder de vision; capas hibridas de Gated DeltaNet (atencion lineal) y Gated Attention con FFN; la model card menciona MoE disperso sin detallar configuracion |
| Parametros totales | 9.653.104.368 (segun safetensors); la model card indica 9B |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.010.000 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | la model card del modelo base declara 201 idiomas y dialectos; el repositorio de KImgane no declara idiomas |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Dimension oculta | 4096 |
| Numero de capas | 32 |
| Disposicion interna | 8 x (3 x (Gated DeltaNet -> FFN) -> 1 x (Gated Attention -> FFN)) |
| Token embedding / salida | 248.320 (con padding) |
| Dimension intermedia FFN | 12.288 |
| Gated DeltaNet | 32 cabezas de atencion lineal para V, 16 para QK, dimension de cabeza 128 |
| Gated Attention | 16 cabezas para Q, 4 para KV, dimension de cabeza 256, dimension RoPE 64 |
| MTP | entrenado con multi-steps |

## Arquitectura y entrenamiento

La arquitectura descrita en la model card es un modelo de lenguaje causal con encoder de vision. El bloque se repite 8 veces con el patron 3 x (Gated DeltaNet -> FFN) mas 1 x (Gated Attention -> FFN). Las capas de Gated DeltaNet emplean atencion lineal con 32 cabezas para V y 16 para QK con dimension de cabeza 128, mientras que las capas de Gated Attention usan 16 cabezas para Q y 4 para KV con dimension de cabeza 256 y RoPE de dimension 64. La dimension oculta es 4096, la dimension intermedia del FFN es 12.288 y el vocabulario (con padding) es de 248.320 entradas. La model card menciona tambien el uso de Mixture-of-Experts disperso y entrenamiento con multi-step MTP (multi-token prediction), aunque no se detalla el numero de expertos ni los parametros activos.

En cuanto a los datos de entrenamiento, la informacion disponible corresponde a la fase de preentrenamiento y postentrenamiento del modelo base Qwen3.5-9B: fusion temprana sobre tokens multimodales, escalado de aprendizaje por refuerzo en entornos multiagente y cobertura de 201 idiomas. No se especifica el numero de tokens de preentrenamiento, la composicion del dataset ni si se emplearon tecnicas concretas de alineacion como RLHF o DPO. Tampoco hay informacion alguna sobre el ajuste fino realizado por KImgane: se desconoce si uso SFT, LoRA, DPO u otro metodo, y sobre que datos.

## Capacidades

Las siguientes capacidades se derivan de la model card del modelo base Qwen3.5-9B reproduccion en el repositorio; no hay evaluacion independiente del ajuste de KImgane.

- Generacion de texto y razonamiento en tareas de conocimiento general y STEM.
- Comprension visual: el pipeline declarado es image-text-to-text y la arquitectura incluye encoder de vision.
- Generacion de codigo e integracion en flujos de agentes, segun los benchmarks declarados por el autor del modelo base.
- Capacidades de agente y razonamiento multi-paso: la model card menciona entrenamiento con RL sobre entornos multiagente.
- Cobertura multilingue amplia: 201 idiomas y dialectos declarados en la ficha del modelo base.
- Prediccion multi-token (MTP) entrenada con varios pasos, lo que habilita tecnicas de decodificacion especulativa.
- Soporte de tool calling / function calling: no se documenta explicitamente en la informacion disponible.
- Modo thinking explicito: no se documenta para esta variante en la informacion disponible.

## Casos de uso

- Analisis de documentos extensos con imagenes: gracias a los 262.144 tokens de contexto nativo y al encoder de vision, el modelo puede procesar informes con tablas, graficos y texto largo en una sola pasada, evitando estrategias de troceado.
- Inspeccion de capturas y diagramas tecnicos en soporte interno: el pipeline image-text-to-text permite adjuntar una imagen de error o un diagrama de arquitectura y obtener una explicacion textual en el mismo turno.
- Asistente conversacional multilingue: la cobertura declarada de 201 idiomas lo hace adecuado para productos con usuarios en multiples regiones que requieren respuestas en el idioma del usuario.
- Indexacion y resumen de repositorios de documentacion: con contexto de cientos de miles de tokens se pueden resumir manuales tecnicos completos y extraer respuestas a preguntas concretas.
- Prototipado de agentes con multiples pasos: la model card menciona entrenamiento con RL en entornos multiagente, lo que lo hace candidato para flujos donde el modelo encadena busquedas, calculos y llamadas a herramientas.
- Generacion y revision de codigo en pipelines internos: puede integrarse como paso de revision automatica, siempre que se valide previamente su rendimiento real, ya que no hay evaluacion publicada de este ajuste.
- Extraccion estructurada de informacion de PDFs y facturas con componentes visuales: la combinacion de vision y contexto largo permite procesar documentos completos sin perder el contexto de tablas y anexos.

## Benchmarks y rendimiento

Los unicos datos disponibles provienen de la model card del modelo base. La tabla original esta truncada en la informacion proporcionada, por lo que solo se recogen las filas completas.

| Benchmark | GPT-OSS-120B | GPT-OSS-20B | Qwen3-Next-80B-A3B-Thinking | Qwen3-30BA3B-Thinking-2507 | Qwen3.5-9B | Qwen3.5-4B |
|---|---|---|---|---|---|---|
| MMLU-Pro | 80,8 | 74,8 | 82,7 | 80,9 | 82,5 | 79,1 |
| MMLU-Redux | 91,0 | 87,8 | 92,5 | 91,4 | no disponible | no disponible |

No se han publicado resultados de benchmarks especificos del ajuste KImgane/Qwen3.5-9B en la informacion disponible.

## Requisitos de hardware

Las cifras siguientes son estimaciones calculadas a partir del numero de parametros confirmado por safetensors (9.653.104.368), no datos publicados por el autor.

- Pesos en FP16/BF16: aproximadamente 19,3 GB, coherente con el tamano del repositorio.
- Pesos en INT8: aproximadamente 9,7 GB.
- Pesos en INT4: aproximadamente 4,8 GB a 5,5 GB, mas overhead de cache y runtime.
- Cache KV reducida: la disposicion hibrida solo incluye 8 capas de Gated Attention (4 cabezas KV, dimension 256) frente a 24 capas de atencion lineal, lo que en principio reduce el crecimiento del cache respecto a un transformer denso equivalente. No hay mediciones publicadas de este efecto para este modelo.
- GPU de datacenter: A100 40 GB, A100 80 GB, H100 80 GB y H200 resultan adecuadas para inferencia en BF16 sin cuantizar.
- GPU de consumo: una RTX 4090 (24 GB) puede ejecutar el modelo en BF16 al limite de memoria, y con holgura si se cuantiza a INT8 o INT4. Tarjetas de 16 GB requieren cuantizacion a 4 bits.
- Despliegue: la model card indica compatibilidad con Hugging Face Transformers, vLLM, SGLang y KTransformers. No se menciona compatibilidad explicita con llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible. No se han publicado mediciones para este repositorio.

## Comparativa con modelos similares

La comparacion se limita a los modelos que aparecen en la tabla de benchmarks de la model card, ya que no hay datos verificables de otras alternativas.

| Modelo | Parametros | MMLU-Pro | Licencia | Contexto | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-9B (base de este ajuste) | 9B (9,65B en safetensors) | 82,5 | apache-2.0 | 262.144 tokens, extensible a 1.010.000 | pesos abiertos en Hugging Face |
| Qwen3.5-4B | no disponible | 79,1 | no disponible | no disponible | pesos abiertos en Hugging Face |
| Qwen3-30BA3B-Thinking-2507 | 30B totales, 3B activos (segun nomenclatura) | 80,9 | no disponible | no disponible | pesos abiertos en Hugging Face |
| Qwen3-Next-80B-A3B-Thinking | 80B totales, 3B activos (segun nomenclatura) | 82,7 | no disponible | no disponible | pesos abiertos en Hugging Face |
| GPT-OSS-20B | 20B (segun nomenclatura) | 74,8 | no disponible | no disponible | pesos abiertos |
| GPT-OSS-120B | 120B (segun nomenclatura) | 80,8 | no disponible | no disponible | pesos abiertos |

El dato destacable es que Qwen3.5-9B obtiene 82,5 en MMLU-Pro con 9B de parametros, por encima de GPT-OSS-120B (80,8) y de Qwen3-30BA3B-Thinking-2507 (80,9), y a 0,2 puntos de Qwen3-Next-80B-A3B-Thinking (82,7). Se trata de cifras declaradas por el fabricante del modelo base y no replicadas de forma independiente para este ajuste.

## Limitaciones y advertencias

- El repositorio no documenta el proceso de ajuste fino: se desconoce el dataset, el metodo y los objetivos, por lo que no hay garantia de que el comportamiento se mantenga alineado con el modelo base.
- Con 10 descargas y 0 likes, el modelo carece practicamente de validacion por parte de la comunidad.
- No se han publicado benchmarks del ajuste. Los resultados de la tabla corresponden al modelo base Qwen3.5-9B y no son extrapolables a esta variante.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; no se documentan mitigaciones especificas en este repositorio.
- Sesgos: no se documenta ninguna evaluacion de sesgos ni de seguridad para este ajuste ni para el modelo base en la informacion disponible.
- Idiomas: aunque el modelo base declara 201 idiomas, el repositorio no especifica que idiomas conserva el ajuste. No hay datos sobre el castellano en particular.
- Licencia: apache-2.0 permite uso comercial, pero se recomienda verificar la licencia enlazada en la model card (https://huggingface.co/Qwen/Qwen3.5-9B/blob/main/LICENSE) por si impone condiciones adicionales.
- El campo de parametros activos no esta disponible pese a que la model card menciona MoE disperso, lo que impide estimar con precision el coste real de inferencia.
- Ausencia de informacion sobre cuantizaciones oficiales: cualquier GGUF o AWQ disponible seria de terceros y no estaria validado por el autor.
- Las fechas del repositorio (creacion y ultima actualizacion el 21 de septiembre de 2026) no permiten determinar si el proyecto sigue mantenido.

## Enlaces

- Repositorio del modelo: https://huggingface.co/KImgane/Qwen3.5-9B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-9B/blob/main/LICENSE
- Blog de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Qwen Chat: https://chat.qwen.ai

Nota: la busqueda web realizada no devolvio ningun resultado relevante sobre este modelo; los enlaces obtenidos correspondian a foros de Autodesk sin relacion con el contenido de esta ficha.
