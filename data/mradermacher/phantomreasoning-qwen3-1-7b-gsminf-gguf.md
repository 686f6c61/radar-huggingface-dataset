# mradermacher/PhantomReasoning-Qwen3-1.7B-gsminf-GGUF

## Resumen

PhantomReasoning-Qwen3-1.7B-gsminf-GGUF es la version cuantizada en formato GGUF del modelo kilian-group/PhantomReasoning-Qwen3-1.7B-gsminf, un ajuste fino del modelo base Qwen3 de 1.700 millones de parametros orientado a razonamiento multi-salto y a la resolucion de problemas matematicos del tipo GSM-Infinite. El trabajo de cuantizacion lo firma mradermacher, un autor habitual en la publicacion de versiones GGUF de modelos open source, y ofrece un abanico de cuantizaciones estaticas que van desde Q2_K (1,0 GB) hasta f16 (4,2 GB), ademas de una variante con imatrix publicada en un repositorio aparte.

El modelo resuelve un problema concreto: permitir ejecutar localmente, en hardware de consumo, un modelo pequeno especializado en cadenas de razonamiento largas y verificables, algo que los modelos generalistas de 1-2 mil millones de parametros suelen hacer mal. El ajuste fino se ha realizado con GRPO (Group Relative Policy Optimization) mediante la libreria TRL sobre el dataset kilian-group/phantom-reasoning, una tecnica de aprendizaje por refuerzo que premia respuestas correctas en problemas de razonamiento.

La relevancia actual del modelo radica en su tamano reducido (2.031.739.904 parametros reales segun safetensors) combinado con una licencia Apache 2.0 totalmente permisiva y una disponibilidad inmediata en GGUF, lo que lo hace apto para prototipado rapido, experimentacion con tecnicas de RL para razonamiento y despliegue en entornos con recursos limitados. Esta ficha describe la version cuantizada; las capacidades y limitaciones heredan del modelo base de kilian-group.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen3) |
| Parametros totales | 2.031.739.904 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 (estaticas); variantes imatrix en repositorio i1 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (tambien safetensors en el modelo base) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer decoder-only derivado de Qwen3, con 2.031.739.904 parametros totales. El ajuste fino que da lugar al modelo base se realizo mediante GRPO (Group Relative Policy Optimization) usando la libreria TRL, una tecnica de aprendizaje por refuerzo que optimiza la politica del modelo comparando grupos de respuestas generadas para una misma pregunta y premiando las que conducen a resultados correctos. Este enfoque se ha aplicado sobre el dataset kilian-group/phantom-reasoning, orientado a tareas de razonamiento multi-salto y a la variante GSM-Infinite de problemas matematicos.

El modelo base del que deriva esta version cuantizada es kilian-group/PhantomReasoning-Qwen3-1.7B-gsminf. La model card del repositorio GGUF no detalla el numero de tokens de entrenamiento, la composicion exacta del dataset ni si hubo fases adicionales de SFT o DPO; esa informacion no esta disponible en la documentacion proporcionada. La cuantizacion la ha realizado mradermacher con su pipeline habitual (quantize_version 2, output_tensor_quantised 1, convert_type hf), generando cuantizaciones estaticas y, en repositorio separado, cuantizaciones ponderadas con imatrix.

## Capacidades

- Generacion de texto en ingles con enfasis en cadenas de razonamiento explicito (reasoning traces).
- Razonamiento multi-salto: el ajuste con GRPO sobre phantom-reasoning busca mejorar la capacidad de encadenar pasos intermedios antes de dar una respuesta final.
- Resolucion de problemas matematicos, en particular los del tipo GSM-Infinite (variantes de GSM8K con enunciados extendidos o infinitos).
- Formato conversacional: la model card del repositorio incluye la etiqueta conversational, por lo que el modelo esta preparado para plantillas de chat.
- Compatibilidad con endpoints: la etiqueta endpoints_compatible sugiere que puede servirse mediante infraestructura de inferencia estandar.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y multi-step reasoning: el entrenamiento con GRPO apunta a razonamiento multi-paso, aunque no se documentan capacidades de agente con uso de herramientas.
- Capacidades multilingues: limitadas al ingles segun la etiqueta language: en.
- Capacidades especiales (vision, audio, thinking mode explicito): no disponible en la informacion proporcionada.

## Casos de uso

- Prototipado de razonamiento local en hardware de consumo: con la cuantizacion Q4_K_M (1,4 GB) el modelo cabe en cualquier GPU consumer con 4 GB o mas de VRAM, lo que permite experimentar con cadenas de razonamiento sin depender de la nube.
- Investigacion en RL para razonamiento: al ser un ajuste GRPO sobre Qwen3-1.7B con licencia Apache 2.0, sirve como punto de partida reproducible para estudiar como afecta el RL a las trazas de razonamiento en modelos pequenos.
- Evaluacion de tecnicas de cuantizacion: el repositorio ofrece 12 niveles de cuantizacion estatica mas variantes imatrix, lo que permite medir el impacto de la compresion en tareas de razonamiento multi-salto con un mismo modelo base.
- Generacion de soluciones matematicas paso a paso en entornos educativos o de autoformacion, usando la cuantizacion Q5_K_M o Q6_K para preservar la calidad de las cadenas de razonamiento.
- Despliegue en dispositivos con poca memoria (edge, portatiles sin GPU dedicada) mediante llama.cpp u Ollama con la cuantizacion Q4_K_S (1,3 GB), adecuada para demos y pruebas de concepto.
- Benchmarking de pipelines de inferencia: al ser un modelo pequeno y con multiples cuantizaciones, es util para medir throughput y latencia de vLLM, llama.cpp o TGI en distintas configuraciones de hardware antes de escalar a modelos mayores.
- Filtrado y generacion de datos sinteticos de razonamiento: el modelo puede generar trazas de razonamiento que, revisadas, sirvan para aumentar datasets de entrenamiento de modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto): Q2_K ~1,0 GB; Q3_K_S ~1,1 GB; Q4_K_M ~1,4 GB; Q5_K_M ~1,6 GB; Q6_K ~1,8 GB; Q8_0 ~2,3 GB; f16 ~4,2 GB. Hay que anadir memoria para el contexto KV, que depende de la longitud de contexto configurada (no documentada).
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM puede ejecutar las cuantizaciones Q4 y Q5 (GTX 1650, RTX 3050, RTX 4060, etc.). Para f16 se recomienda al menos 6-8 GB (RTX 3060, RTX 4060 Ti). En A100, H100 o RTX 4090 el modelo ocupa una fraccion minima de la memoria y el cuello de botella sera el ancho de banda, no la VRAM.
- Cabe en GPU consumer: si, en practicamente todas las GPU consumer modernas con 4 GB o mas, usando cuantizaciones Q4 o superiores.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; para las versiones safetensors del modelo base, vLLM, TGI o transformers.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| PhantomReasoning-Qwen3-1.7B-gsminf (este, GGUF) | 2,03 B | no disponible | Apache 2.0 | GGUF | Ajuste GRPO para razonamiento multi-salto y GSM-Infinite |
| Qwen3-1.7B (base) | 1,7 B aprox. | no disponible | Apache 2.0 | safetensors, GGUF | Modelo generalista del que deriva; sin ajuste especifico de razonamiento |
| DeepSeek-R1-Distill-Qwen-1.5B | 1,5 B | no disponible | MIT | safetensors, GGUF | Destilado de razonamiento muy popular en el mismo rango de tamano |
| Qwen2.5-Math-1.5B | 1,5 B | no disponible | Apache 2.0 | safetensors, GGUF | Especializado en matematicas, sin entrenamiento RL explicito documentado en esta ficha |

La comparacion cuantitativa de rendimiento entre estos modelos no esta disponible en la informacion proporcionada; los datos de la tabla se limitan a parametros, licencia y formato.

## Limitaciones y advertencias

- El modelo solo declara soporte de ingles; su uso en castellano u otros idiomas no esta garantizado y probablemente degrade la calidad de las respuestas.
- Al ser un ajuste fino con RL sobre un modelo de 1,7 B, el riesgo de alucinacion en cadenas de razonamiento largas es alto: las trazas pueden parecer plausibles sin ser correctas, especialmente en problemas matematicos fuera de la distribucion de GSM-Infinite.
- No se documentan sesgos especificos, pero al derivar de Qwen3 hereda los sesgos del corpus de entrenamiento original, no auditados en esta ficha.
- La longitud de contexto no esta disponible; no se debe asumir una ventana grande para tareas de documento largo.
- Las cuantizaciones Q2_K y Q3_K pueden degradar de forma notable la calidad del razonamiento; para tareas sensibles se recomienda Q5_K_M o superior, o las variantes imatrix del repositorio i1.
- La licencia Apache 2.0 permite uso comercial sin restricciones adicionales, pero el autor de la cuantizacion no ofrece garantias sobre el comportamiento del modelo en produccion.
- El modelo base tiene pocas descargas y likes (885 descargas, 0 likes en el momento de la consulta), lo que indica poca validacion comunitaria; conviene evaluarlo con benchmarks propios antes de adoptarlo.
- No hay informacion sobre tool calling ni capacidades de agente; no se debe asumir su disponibilidad en pipelines que dependan de function calling.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/PhantomReasoning-Qwen3-1.7B-gsminf-GGUF
- Modelo base: https://huggingface.co/kilian-group/PhantomReasoning-Qwen3-1.7B-gsminf
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/PhantomReasoning-Qwen3-1.7B-gsminf-i1-GGUF
- Dataset de entrenamiento: https://huggingface.co/datasets/kilian-group/phantom-reasoning
- Pagina de resumen del autor para este modelo: https://hf.tst.eu/model#PhantomReasoning-Qwen3-1.7B-gsminf-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
