# ngqtrung/video-hopchain-8b-standard-rl

and answer in <answer>\boxed{...}</answer>
- Benchmarks table provided.
- Evaluation setup: lmms-eval at 100 frames per video, at most 501,760 pixels per frame, 33,792-token context, at most 16,384 generated tokens.

Architecture: Qwen3-VL-8B — Qwen3-VL architecture. Details of the architecture are not fully in the provided info; I should say "no disponible" for what's unknown but I can describe it as a vision-language transformer (ViT encoder + language decoder) based on Qwen3. Careful: I shouldn't invent. I can say the architecture is that of Qwen3-VL (vision-language transformer) — that's reasonably supported by tags and base model. I'll note specifics as not available.

Longitud de contexto: evaluation used 33,792-token context; native context of Qwen3-VL-8B is not in the info — I could mention 33.792 tokens as evaluation config. Better say "no disponible (la evaluación del paper usa 33.792 tokens de contexto)". Hmm, the field should be honest. I'll put "no disponible en la informacion proporcionada (la evaluacion del paper usa 33.792 tokens)".

Quantization types: weights BF16; no GGUF/quantizations listed. Say "no disponible (pesos en BF16 en el repositorio)".

Idiomas: en.

Format: safetensors.

Benchmarks table — include.

Comparativa: Qwen3-VL-8B-Instruct (base), Video-HopChain-8B final, and maybe Qwen2.5-VL? Not in info. I'll compare base model and final model — but those aren't "similares" alternatives exactly. I can compare with Qwen3-VL-8B-Instruct and the final Video-HopChain-8B. Other alternatives: no disponible. Maybe mention that no se dispone de datos de otros modelos comparables en la información.

Hardware: 8.77B params, BF16 → ~17.5 GB weights, plus vision encoder and KV cache. On consumer GPU: RTX 4090 24GB fits BF16 tightly; but video frames at 501,760 px/frame and 33,792 context → long context KV cache large. Note this is an estimate—I should mark estimates as estimates (they're derived, labelled "estimacion"). The instruction says don't invent data; hardware estimates are reasonable to provide as estimates with clear labelling.

Let me compute: 8.767B params × 2 bytes = ~17.5 GB. That matches repo size 17.5 GB. Plus activations and KV cache. For 33,792 tokens context, KV cache depends on layers/heads — unknown. I'll say "no disponible" for exact, and give rough guidance.

Deployment options: transformers (documented usage), plus vLLM/SGLang likely supported since it's Qwen3-VL based — but I shouldn't assert. I'll say the model card documents transformers; other runtimes not documented → "no documentado". Tags mention endpoints_compatible (HF Inference Endpoints). I can mention that.

Latency/throughput: no disponible.

Limitations: English only, hallucination in video reasoning, benchmark metrics low in-domain (13.4% in-domain accuracy — poor on the target multi-hop task), it's a baseline/checkpoint, not final model. GRPO trained on 24 frames while evaluated at 100 frames — distribution mismatch? That's an observed fact from the card; I can mention as a caveat carefully. License apache-2.0 (inherited), permits commercial use.

Also note it's step-80 of stage 1 and that it's intended as an intermediate checkpoint.

Let's write enlaces: HF model, HF final model, dataset, project page, GitHub, arXiv, collection, aimodels.fyi.

Now formatting: headings with only first word capitalized: "## Resumen", "## Especificaciones tecnicas", "## Arquitectura y entrenamiento", "## Capacidades", "## Casos de uso", "## Benchmarks y rendimiento", "## Requisitos de hardware", "## Comparativa con modelos similares", "## Limitaciones y advertencias", "## Enlaces".

Write it.

For "Parametros activos" — only if MoE. It's dense, so omit or say "no aplica (modelo denso)". I'll say "no aplica (no es MoE)".

Casos de uso min 6.

Let me draft the benchmarks table with the three rows given.

I'll write now.## Resumen

Video-HopChain-8B (standard RL stage) es un checkpoint intermedio de la familia Video-HopChain, desarrollada por Nguyen Quang Trung y colaboradores (NTU Singapur, entre otras afiliaciones recogidas en el paper arXiv:2609.25773). Se trata de un ajuste por aprendizaje por refuerzo del modelo multimodal Qwen3-VL-8B-Instruct, con 8.767.123.696 parametros (unos 8,77 mil millones) y pesos en BF16, orientado a razonamiento multi-salto sobre video. El modelo resuelve preguntas de video QA en las que la evidencia esta repartida en distintos momentos del video, de modo que un atajo de un solo fotograma no basta para responder.

Tecnicamente es la fila "+ standard RL" de la Tabla 1 del paper y corresponde al paso 80 del primer stage de entrenamiento. Se entreno con GRPO sobre una mezcla general de video QA de 105.993 filas (LLaVA-Video 72.421, STAR 11.455, CLEVRER 8.220, NExT-QA 7.549 y PerceptionTest 6.348) a 24 fotogramas, sin usar datos de Video-HopChain ni Confidence-Gated Exploration (CGE). Por eso no debe confundirse con el modelo final: es la linea base y el punto de partida de los dos entrenamientos de segunda etapa.

Su relevancia es doble. Por un lado, sirve para reproducir los resultados del paper y como referencia comparativa frente al modelo final. Por otro, muestra de forma medible como el RL sobre una mezcla general de video QA mejora el rendimiento multimodal agregado (media de 52,3 a 55,4 puntos en ocho benchmarks) sin mejorar en absoluto el desempeno in-domain en preguntas multi-salto de Video-HopChain (13,4 % en ambos casos).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language transformer basada en Qwen3-VL (encoder visual + decodificador de lenguaje); detalles de capas y atencion no disponibles |
| Parametros totales | 8.767.123.696 (8,77 B) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada; la evaluacion del paper usa 33.792 tokens de contexto y hasta 16.384 tokens generados |
| Tipos de cuantizacion | No disponible; los pesos del repositorio estan en BF16 y no se documentan variantes GGUF, AWQ o GPTQ |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-VL-8B-Instruct, un transformer multimodal que combina un encoder de vision con un decodificador de lenguaje, y conserva su procesador y su pipeline `video-text-to-text`. La model card no detalla el numero de capas, la dimension oculta, el mecanismo de atencion ni la resolucion nativa del encoder visual, por lo que esos datos quedan como no disponibles. Si se especifica el preprocesado de video usado en el entrenamiento: 24 fotogramas por video.

El entrenamiento de esta etapa consiste en GRPO (Group Relative Policy Optimization), una variante de RLVR (reinforcement learning with verifiable rewards), aplicado sobre una mezcla de video QA de 105.993 filas procedente de cinco fuentes: LLaVA-Video (72.421), STAR (11.455), CLEVRER (8.220), NExT-QA (7.549) y PerceptionTest (6.348). No se emplearon datos de Video-HopChain ni la tecnica de Confidence-Gated Exploration que distingue al modelo final. El checkpoint corresponde al paso 80 de este primer stage y se diseno explicitamente como linea base y como punto de partida de las dos ejecuciones de segunda etapa.

Una innovacion relevante es el formato de razonamiento impuesto durante el entrenamiento: el modelo debe razonar dentro de etiquetas `<think>...</think>` y emitir la respuesta final en `<answer>\boxed{...}</answer>`. La model card advierte que hay que usar el mismo system prompt que en entrenamiento, disponible en las filas del dataset, para obtener el comportamiento esperado. En evaluacion se uso `lmms-eval` con 100 fotogramas por video, un maximo de 501.760 pixeles por fotograma, 33.792 tokens de contexto y hasta 16.384 tokens generados.

## Capacidades

- Generacion de texto y razonamiento multimodal sobre video, con cadena de pensamiento explicita en `<think>` y respuesta final en `<answer>\boxed{...}</answer>`.
- Video question answering de proposito general: comprension de acciones, objetos, temporalidad y causalidad en clips cortos y medios.
- Razonamiento multi-salto sobre video, con evidencia distribuida en el tiempo, aunque con rendimiento in-domain limitado en este checkpoint (13,4 % en el split reservado de Video-HopChain).
- Percepcion visual detallada y composicion de escenas, segun los resultados en Perception-Comp (34,3 %) y Video-MMMU (63,0 %).
- Razonamiento de largo contexto sobre video, con buenos resultados en LongVideo-Reason (76,1 %) y VRBench (77,6 %).
- Procesamiento de imagenes ademas de video, heredado de la base Qwen3-VL-Instruct (tag `image-text-to-text`).
- Soporte de despliegue en Hugging Face Inference Endpoints (tag `endpoints_compatible`).
- No se documenta en la informacion disponible soporte explicito de tool calling, function calling, agentes, audio ni otros idiomas distintos del ingles.

## Casos de uso

- Reproduccion de resultados academicos: cargar este checkpoint y evaluarlo con `lmms-eval` bajo la configuracion del paper (100 fotogramas, 501.760 pixeles por fotograma, 33.792 tokens de contexto) permite replicar la fila "+ standard RL" de la Tabla 1.
- Linea base para ablations de RL: cualquier investigacion que quiera medir el efecto de un reward adicional, de CGE o de datos sinteticos multi-salto necesita un punto de partida identico, y este checkpoint es exactamente el que el paper usa como origen de sus dos runs de segunda etapa.
- Analisis de video largo en investigacion: con 76,1 % en LongVideo-Reason y 77,6 % en VRBench, es util para prototipos de resumen y localizacion de eventos en grabaciones extensas donde la evidencia aparece en momentos separados.
- Anotacion asistida de conjuntos de datos de video: generar respuestas razonadas en formato `<think>`/`<answer>` sobre clips sin etiquetar, que luego se revisan manualmente antes de incorporarlos a un corpus de entrenamiento.
- Auditoria de robustez temporal: al rendir 34,3 % en Perception-Comp y 47,4 % en Video-Holmes, sirve para estudiar en que tipo de preguntas temporales y de composicion falla un modelo RL de video antes del entrenamiento especifico multi-salto.
- Investigacion en verificacion de recompensas: dado que es un modelo entrenado con RLVR y GRPO, es un sujeto adecuado para estudiar como se comporta la exploracion del modelo cuando se le da recompensa verificable sobre respuestas de video.
- Experimentos de eficiencia de inferencia: al ser un checkpoint BF16 de 17,5 GB con contexto de decenas de miles de tokens y 100 fotogramas de entrada, permite medir coste real de memoria y latencia de pipelines multimodales largos.
- Educacion e investigacion docente: como modelo pequeno (8,77 B) y con licencia Apache 2.0, es viable para cursos y talleres sobre RL aplicado a modelos multimodales sin depender de pesos propietarios.

## Benchmarks y rendimiento

Resultados de la model card, en porcentaje de exactitud, evaluados con `lmms-eval` a 100 fotogramas por video, maximo de 501.760 pixeles por fotograma, contexto de 33.792 tokens y hasta 16.384 tokens generados. "In-domain" es el split reservado de 1.000 preguntas de Video-HopChain.

| Modelo | Video-MME | Perception-Comp | Video-MMMU | Video-Holmes | VCRBench | MMR-V | LongVideo-Reason | VRBench | media | in-domain |
|---|---|---|---|---|---|---|---|---|---|---|
| Qwen3-VL-8B-Instruct | 64,0 | 28,1 | 63,5 | 40,7 | 32,0 | 42,7 | 72,6 | 74,7 | 52,3 | 13,4 |
| Este modelo (+ standard RL) | 65,8 | 34,3 | 63,0 | 47,4 | 35,9 | 43,4 | 76,1 | 77,6 | 55,4 | 13,4 |
| Video-HopChain-8B (final) | 69,2 | 37,4 | 67,5 | 48,6 | 44,9 | 46,6 | 78,9 | 81,0 | 59,3 | 23,2 |

VCRBench se reporta sobre su subconjunto de opcion multiple. El salto de este checkpoint respecto a la base se concentra en Perception-Comp (+6,2), Video-Holmes (+6,7), VRBench (+2,9) y LongVideo-Reason (+3,5), mientras que en Video-MMMU baja 0,5 puntos y en in-domain no hay mejora alguna.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 17,5 GB solo para los pesos (coincide con el tamano del repositorio de 17,5 GB), mas activaciones del encoder visual y cache KV. La cache KV a 33.792 tokens de contexto depende del numero de capas y cabezas, dato no disponible, por lo que el total exacto no puede calcularse con la informacion proporcionada.
- GPU de datacenter recomendadas: A100 40/80 GB, H100 80 GB o L40S 48 GB para trabajar comodamente con 100 fotogramas y contexto largo.
- GPU de consumo: una RTX 4090 o RTX 3090 de 24 GB puede alojar los pesos BF16, pero el margen es estrecho y la configuracion de evaluacion del paper (100 fotogramas a 501.760 pixeles y 33.792 tokens) probablemente exige cuantizacion o reducir fotogramas y contexto. En 16 GB o menos no cabe en BF16.
- Cuantizacion: la model card solo publica pesos BF16; no se documentan versiones GGUF, AWQ ni GPTQ, por lo que el despliegue en llama.cpp u Ollama no esta soportado de fabrica y requeriria convertir los pesos por cuenta propia.
- Opciones de despliegue: `transformers` con `Qwen3VLForConditionalGeneration` y `AutoProcessor`, tal como documenta el autor, con `dtype="auto"` y `device_map="auto"`. Tambien esta marcado como compatible con HF Inference Endpoints. No se documentan recetas para vLLM, SGLang, TGI o llama.cpp.
- Latencia y throughput: no disponibles. La propia configuracion de evaluacion (hasta 16.384 tokens generados y 100 fotogramas de entrada por video) implica una carga de inferencia alta en terminos de prefill visual y decodificacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento (media de 8 benchmarks) | In-domain Video-HopChain | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este modelo (standard RL) | 8,77 B | No disponible; evaluado a 33.792 tokens | 55,4 | 13,4 | Apache 2.0 | Hugging Face, safetensors BF16 |
| Qwen3-VL-8B-Instruct (base) | No disponible en la informacion proporcionada | No disponible | 52,3 | 13,4 | Apache 2.0 (heredada del base) | Hugging Face |
| Video-HopChain-8B (final) | No disponible en la informacion proporcionada | No disponible | 59,3 | 23,2 | Apache 2.0 | Hugging Face, safetensors |

No se dispone en la informacion proporcionada de datos de benchmarks de otros modelos de video de tamano comparable (por ejemplo alternativas de 7-9 B de otras familias), por lo que la comparativa se limita a los tres checkpoints de la propia familia Video-HopChain y Qwen3-VL.

## Limitaciones y advertencias

- Es un checkpoint intermedio, no un modelo final. Corresponde al paso 80 del primer stage y no incorpora los datos de Video-HopChain ni Confidence-Gated Exploration, por lo que su rendimiento in-domain (13,4 %) esta muy por debajo del modelo final (23,2 %).
- El desempeno en razonamiento multi-salto sobre video es bajo en terminos absolutos: 13,4 % de exactitud en el split reservado de 1.000 preguntas, apenas identico al de Qwen3-VL-8B-Instruct. No es apto para produccion en tareas de multi-hop video reasoning.
- Riesgo de alucinacion: como modelo generativo multimodal, puede producir descripciones o respuestas plausibles no sustentadas en el video. La estructura `<think>`/`<answer>` no garantiza que el razonamiento intermedio sea fiel a la evidencia visual.
- Solo se declara soporte de ingles. No hay datos de rendimiento en castellano ni en otros idiomas, y la tokenizacion y el entrenamiento estan orientados a `en`.
- Desajuste potencial entre entrenamiento y evaluacion: el RL se hizo a 24 fotogramas mientras que los benchmarks se reportan a 100 fotogramas. El comportamiento en regimenes de distinto numero de fotogramas no esta caracterizado en la informacion disponible.
- Dependencia del prompt: el autor indica que debe usarse el mismo system prompt que en entrenamiento, disponible en las filas del dataset. Otros prompts pueden degradar el formato de salida y la calidad de la respuesta.
- Idiomas, sesgos demograficos y sesgos de dominio no estan documentados ni evaluados en la informacion proporcionada.
- Licencia Apache 2.0: permite uso comercial y modificacion, con obligacion de conservar avisos de licencia y atribucion. No se documentan restricciones adicionales, aunque el modelo base Qwen3-VL-8B-Instruct debe verificarse por separado.
- Sin adopcion registrada: 0 descargas y 0 likes en el momento de la consulta, y el repositorio se creo el 29 de septiembre de 2026. No hay historial de uso en produccion ni reportes de terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ngqtrung/video-hopchain-8b-standard-rl
- Modelo final: https://huggingface.co/ngqtrung/video-hopchain-8b
- Dataset: https://huggingface.co/datasets/ngqtrung/video-hopchain
- Coleccion Video HopChain: https://huggingface.co/collections/ngqtrung/video-hopchain
- Paper (arXiv:2609.25773): https://arxiv.org/abs/2609.25773
- Version HTML del paper: https://arxiv.org/html/2609.25773v1
- Pagina del proyecto: https://ngquangtrung57.github.io/video-hopchain-page/
- Codigo: https://github.com/ngquangtrung57/video-hopchain
- Resumen del paper en aimodels.fyi: https://www.aimodels.fyi/papers/arxiv/video-hopchain-multi-hop-questions-confidence-gated
