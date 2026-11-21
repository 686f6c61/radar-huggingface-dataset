# mradermacher/SDRL-Qwen3-32B-GGUF

## Resumen

SDRL-Qwen3-32B-GGUF es la distribucion en formato GGUF del modelo SDRL-Qwen3-32B, publicado por el usuario mradermacher a partir del modelo base tokentideAI/SDRL-Qwen3-32B. Se trata de un ajuste fino del conocido Qwen3-32B orientado a optimisation, operations research, reinforcement learning y meta-solvers con Gurobi, segun las etiquetas declaradas por el autor. El modelo hereda la arquitectura transformer densa de Qwen3 con 32.762.123.264 parametros totales.

El repositorio no contiene pesos originales en safetensors, sino una coleccion de cuantizaciones GGUF estaticas generadas con llama.cpp, pensadas para su uso en entornos de inferencia local o servidores con llama.cpp, Ollama o similares. El tamano del repositorio es de 224,0 GB, lo que refleja la suma de todas las variantes de cuantizacion disponibles, desde Q2_K (12,4 GB) hasta Q8_0 (34,9 GB).

Es relevante para desarrolladores e investigadores que trabajan en problemas de optimisation combinatoria y operations research y quieren ejecutar un modelo especializado en resolucion de problemas con solvers como Gurobi sin depender de infraestructura de GPU de gran escala. La licencia Apache 2.0 permite uso comercial, si bien el idioma declarado es unicamente ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3) |
| Parametros totales | 32.762.123.264 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (estaticas) y variantes i1/imatrix en repo separado |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base es un ajuste fino de Qwen3-32B, un transformer denso de aproximadamente 32,7 mil millones de parametros. La model card del repositorio GGUF no documenta el proceso de entrenamiento del modelo original tokentideAI/SDRL-Qwen3-32B: no se especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF, DPO o aprendizaje por refuerzo supervisado. Las etiquetas sugieren un entrenamiento orientado a tareas de optimisation y operations research con integracion de Gurobi como meta-solver, pero no hay detalle tecnico publicado.

La unica innovacion documentada en este repositorio es la propia cuantizacion: mradermacher ha generado cuantizaciones estaticas con llama.cpp (convert_type hf, quantize_version 2) y ofrece ademas variantes ponderadas/imatrix en el repositorio SDRL-Qwen3-32B-i1-GGUF. No se documentan tecnicas como decodificacion especulativa, attention linear o modos de pensamiento extendido en la informacion disponible.

## Capacidades

- Generacion de texto en ingles, con especializacion declarada en optimisation, operations research y reinforcement learning.
- Razonamiento orientado a la formulacion y resolucion de problemas con solvers (Gurobi como meta-solver segun las etiquetas).
- Soporte de tool calling / function calling: no documentado explicitamente en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado explicitamente.
- Capacidades multilingues: limitadas al ingles segun el campo `language`.
- Capacidades especiales (vision, audio, thinking mode): no disponible en la informacion proporcionada.

## Casos de uso

- Formulacion automatica de modelos de programacion lineal y entera: el modelo puede transformar descripciones en lenguaje natural de un problema de negocio en formulaciones LP/MILP estructuradas, aprovechando su ajuste fino en operations research.
- Generacion de scripts de Gurobi: dado un problema descrito, el modelo puede producir codigo Python con la API de Gurobi (definicion de variables, restricciones y funcion objetivo), lo que acelera la prototipizacion de solvers.
- Asistencia en investigacion de operations research: analisis y explicacion de formulaciones clasicas (transporte, asignacion, scheduling, ruteo) y comparacion de alternativas de modelado.
- Educacion y formacion tecnica: generacion de explicaciones paso a paso sobre metaheuristicas y metodos exactos, util en cursos de optimisation y reinforcement learning.
- Preprocesamiento de pipelines de RL: redaccion de funciones de recompensa, entornos y configuraciones de experimentos para frameworks de reinforcement learning.
- Despliegue en entornos con recursos limitados: gracias a las cuantizaciones Q4_K_M (19,9 GB) o Q3_K_M (16,1 GB), el modelo puede ejecutarse en estaciones de trabajo con una sola GPU de 24 GB o en configuraciones CPU+GPU mixtas con llama.cpp.
- Integracion en herramientas internas de consultoria analitica: consultas sobre modelado matematico y revision de formulaciones antes de enviarlas a un solver de produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 12-14 GB con Q2_K, 16-18 GB con Q3_K_M, 19-21 GB con Q4_K_M, 23-25 GB con Q5_K_M, 27-29 GB con Q6_K y 35-37 GB con Q8_0 (estimaciones a partir del tamano de fichero GGUF mas overhead de contexto KV).
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M o Q3_K_L; A100 40 GB o H100 para Q6_K y Q8_0; multiples GPU consumer para las variantes de mayor tamano.
- Cabe en GPU consumer: si, en RTX 3090/4090 (24 GB) con cuantizaciones Q4_K_M o inferiores; en GPUs de 16 GB solo con Q2_K o Q3_K_S y contexto reducido.
- Opciones de despliegue: llama.cpp, Ollama, servidores compatibles con endpoints (tag `endpoints_compatible`), y cualquier runtime que consuma GGUF. vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| SDRL-Qwen3-32B-GGUF | 32,7 B | no disponible | Apache 2.0 | GGUF | Ajuste fino especializado en optimisation/OR |
| Qwen3-32B (original) | 32,7 B | no disponible en esta ficha | Apache 2.0 | safetensors, GGUF | Modelo base generalista |
| Qwen2.5-32B | 32,7 B | no disponible en esta ficha | Apache 2.0 | safetensors, GGUF | Generacion anterior, sin especializacion OR |
| Llama-3.1-70B | 70 B | no disponible en esta ficha | Llama 3.1 Community | safetensors, GGUF | Mayor capacidad pero requiere mucha mas VRAM |

La comparacion se limita a datos publicos de categoria; no hay benchmarks del modelo especializado que permitan comparar rendimiento en tareas de optimisation frente a estos modelos.

## Limitaciones y advertencias

- Idiomas: el modelo declara unicamente ingles; el rendimiento en castellano no esta verificado y probablemente sera inferior al de modelos multilingues.
- Alucinacion: al ser un ajuste fino sobre Qwen3-32B, conserva el riesgo de generar formulaciones o codigo de Gurobi plausibles pero incorrectos; requiere validacion con el solver antes de uso en produccion.
- Sesgos: no se documentan sesgos conocidos en la model card; al entrenarse sobre datos no especificados, no se puede auditar la composicion del dataset.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo base tokentideAI/SDRL-Qwen3-32B no documenta terminos adicionales; conviene verificar su model card antes de despliegues comerciales.
- Contexto: la longitud de contexto no esta documentada en este repositorio, por lo que no se puede garantizar el comportamiento en conversaciones largas.
- Cuantizaciones de baja calidad: Q2_K y Q3_K_M degradan notablemente la calidad (el propio autor marca Q3_K_M como "lower quality"); para tareas de razonamiento matematico se recomienda Q5_K_M o superior.
- Formato: los pesos estan unicamente en GGUF; para usar transformers nativo o vLLM hay que recurrir al modelo base original.
- Repositorio grande: 224 GB en total; descargar solo el fichero de cuantizacion necesario.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/SDRL-Qwen3-32B-GGUF
- Modelo base: https://huggingface.co/tokentideAI/SDRL-Qwen3-32B
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/SDRL-Qwen3-32B-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#SDRL-Qwen3-32B-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de modelos del autor: https://huggingface.co/mradermacher/model_requests
