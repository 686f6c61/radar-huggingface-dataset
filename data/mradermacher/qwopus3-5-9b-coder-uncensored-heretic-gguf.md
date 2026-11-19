# mradermacher/Qwopus3.5-9B-Coder-UNCENSORED-heretic-GGUF

## Resumen

Qwopus3.5-9B-Coder-UNCENSORED-heretic-GGUF es una distribucion de pesos cuantizados en formato GGUF del modelo xtools-at/Qwopus3.5-9B-Coder-UNCENSORED-heretic, publicada por el usuario mradermacher, especializado en la conversion de modelos a formatos ligeros para inferencia local. El modelo subyacente es un fine-tuning de tipo LoRA/SFT sobre una base de la familia Qwen 3.5 (etiqueta qwen3_5), orientado a generacion de codigo, razonamiento con cadena de pensamiento, uso de herramientas y function calling, con un proceso de "abliteration" o decensurado que elimina parte de los rechazos de seguridad del modelo original.

El modelo cuenta con 9.197.093.888 parametros totales (aproximadamente 9,2 mil millones), lo que lo situa en la categoria de modelos medianos aptos para GPU de consumo con cuantizaciones agresivas. Los datos de la model card no especifican la longitud de contexto, aunque la pertenencia a la familia Qwen 3.5 sugiere ventanas amplias; no obstante, este dato no se confirma en la informacion disponible y se marca como no disponible.

La relevancia de esta publicacion radica en dos factores: por un lado, ofrece cuantizaciones estaticas listas para usar en llama.cpp y entornos compatibles (desde Q2_K de 4,0 GB hasta f16 de 18,5 GB), lo que facilita el despliegue en hardware modesto; por otro, el caracter "uncensored/heretic" del modelo lo hace atractivo para investigacion sobre alineacion, red teaming y generacion de contenido sin filtros, aunque con las advertencias eticas y legales correspondientes. La licencia declarada es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen 3.5, segun etiqueta qwen3_5); detalles internos no disponibles |
| Parametros totales | 9.197.093.888 (~9,2 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS, f16, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | en, zh, es, ru, ja |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base en safetensors |
| Tamano del repo | 85,1 GB (incluye todas las cuantizaciones) |
| Modelo base | xtools-at/Qwopus3.5-9B-Coder-UNCENSORED-heretic |
| Tipo de pipeline | no disponible |

## Arquitectura y entrenamiento

El modelo base es un fine-tuning de la familia Qwen 3.5, segun la etiqueta qwen3_5 y la nomenclatura del repositorio. La model card del repositorio GGUF no detalla la arquitectura interna (numero de capas, dimensiones, atencion, etc.), por lo que los datos estructurales concretos se marcan como no disponibles. El proceso de entrenamiento declarado combina LoRA y SFT (supervised fine-tuning), con datasets orientados a trazas de razonamiento agente y a la inversion de trazas de modelos Claude (lambda/hermes-agent-reasoning-traces, Jackrong/Claude-opus-4.7-TraceInversion-5000x y Jackrong/Claude-opus-4.6-TraceInversion-9000x), lo que sugiere un enfasis en razonamiento multi-paso, uso de herramientas y generacion de codigo.

La innovacion principal de esta variante es el proceso "heretic/abliterated/decensored", una tecnica de modificacion de pesos que reduce la tendencia del modelo a rechazar peticiones (refusals), habitualmente mediante la ablacion de direcciones de activacion asociadas a la negativa. No se especifica en la informacion disponible ni el numero de tokens de entrenamiento, ni la composicion exacta del dataset, ni si hubo etapas de RLHF o DPO adicionales. La publicacion de mradermacher es unicamente una conversion a GGUF con cuantizaciones estaticas; no se ofrecen cuantizaciones ponderadas ni imatrix en el momento de la publicacion, segun indica el propio autor.

## Capacidades

- Generacion de texto y razonamiento con cadena de pensamiento (chain-of-thought), segun las etiquetas reasoning y chain-of-thought.
- Generacion y asistencia de codigo (etiqueta coder), incluyendo tareas de programacion y posiblemente explicacion de codigo.
- Soporte de tool calling y function calling (etiquetas tool-use y function-calling).
- Capacidades de agente y razonamiento multi-paso (etiqueta agent), reforzadas por los datasets de trazas de agente empleados en el entrenamiento.
- Capacidades multimodales: el repositorio incluye archivos mmproj (mmproj-Q8_0 y mmproj-f16), lo que indica soporte de entrada visual en el modelo base, aunque no se detalla el alcance.
- Multilingue en ingles, chino, espanol, ruso y japones.
- Comportamiento decensurado/abliterated: menor tasa de rechazos ante peticiones que el modelo original rechazaria.
- Conversacional (etiqueta conversational) y compatible con endpoints de text-generation-inference.

## Casos de uso

- Generacion de codigo en pipelines de desarrollo: el modelo puede integrarse en herramientas de autocompletado o revision de codigo, aprovechando su especializacion coder y su soporte de function calling para invocar linters o ejecutores de tests.
- Agentes autonomos con uso de herramientas: gracias a las etiquetas agent y tool-use, puede orquestar llamadas a APIs externas en flujos multi-paso, por ejemplo para tareas de automatizacion de oficina o extraccion de datos.
- Investigacion sobre alineacion y red teaming: la variante abliterated permite estudiar el comportamiento del modelo ante peticiones sensibles sin la capa de rechazo, util para auditar sesgos y riesgos.
- Asistencia conversacional multilingue: con soporte de en, zh, es, ru y ja, puede desplegarse en atencion al cliente o asistentes internos para organizaciones con presencia en esos mercados, aunque la longitud de contexto no esta confirmada.
- Despliegue local en estaciones de trabajo: las cuantizaciones Q4_K_S (5,6 GB) y Q4_K_M permiten ejecutar el modelo en GPU de consumo con 8-12 GB de VRAM, lo que facilita prototipado sin infraestructura cloud.
- Generacion de documentacion tecnica y explicacion de codigo: el modelo puede resumir repositorios o explicar fragmentos de codigo en varios idiomas, aprovechando su entrenamiento en trazas de razonamiento.
- Educacion y tutoria en programacion: puede generar explicaciones paso a paso de algoritmos y ejercicios, con la advertencia de que el modo decensurado requiere supervision en entornos educativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio GGUF no incluye tablas de MMLU, HumanEval, GSM8K ni metricas comparativas. El unico dato de rendimiento indirecto es el grafico de perplejidad de tipos de cuantizacion enlazado por el autor (comparativa generica de calidades de cuantizacion, no especifica del modelo).

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion: Q2_K ~4,0 GB; Q3_K_S ~4,5 GB; Q4_K_S ~5,6 GB; Q6_K ~7,7 GB; Q8_0 ~9,9 GB; f16 ~18,5 GB. A estas cifras hay que sumar el overhead de contexto KV cache, que depende de la longitud de contexto configurada.
- GPU recomendadas: para f16, una A100 40 GB o H100; para Q8_0, una RTX 4090 (24 GB) o A10G; para Q6_K, una RTX 4080/4090 o similar con 12-16 GB; para Q4_K_S, una RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4070.
- Cabe en GPU de consumo: si, en cuantizaciones Q2_K a Q6_K con GPUs de 8-16 GB; Q8_0 requiere al menos 12 GB libres y f16 no es practico en consumer.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF. El modelo base tambien es compatible con transformers y text-generation-inference (etiquetas del repo).
- Latencia y throughput: no disponibles en la informacion proporcionada. Dependeran del hardware, la cuantizacion y la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwopus3.5-9B-Coder-UNCENSORED-heretic-GGUF | ~9,2 B | no disponible | Apache 2.0 | GGUF | Variante decensurada, orientada a codigo y agentes |
| Modelo base xtools-at/Qwopus3.5-9B-Coder-UNCENSORED-heretic | ~9,2 B | no disponible | Apache 2.0 | safetensors | Mismo modelo sin cuantizar; referencia para comparar perdida por cuantizacion |
| Qwen 3.5 base (familia) | no disponible | no disponible | no disponible | no disponible | Modelo original de la familia; no se dispone de ficha concreta en la informacion |

No se dispone de datos de benchmarks ni de especificaciones detalladas de modelos comparables en la informacion proporcionada, por lo que la comparativa cuantitativa no esta disponible.

## Limitaciones y advertencias

- El proceso de abliteration/decensurado reduce los rechazos de seguridad, lo que incrementa el riesgo de generar contenido danino, ofensivo o ilegal; no es recomendable su uso en produccion orientada al publico sin filtros adicionales.
- Riesgo de alucinacion inherente a los modelos de ~9 B, especialmente en tareas de razonamiento complejo o datos factuales.
- La longitud de contexto no esta confirmada en la informacion disponible; no debe asumirse una ventana amplia sin verificacion empirica.
- El soporte multilingue declarado (en, zh, es, ru, ja) no garantiza calidad uniforme; el espanol puede presentar un rendimiento inferior al ingles.
- Aunque la licencia es Apache 2.0, el uso comercial de una variante decensurada puede conllevar riesgos reputacionales y de cumplimiento normativo (por ejemplo, en la UE con la AI Act); se recomienda revision legal.
- Las cuantizaciones de baja calidad (Q2_K, Q3_K_M) degradan notablemente la coherencia; para produccion se recomienda Q4_K_S o superior.
- No hay cuantizaciones ponderadas/imatrix disponibles en el momento de la publicacion, lo que limita la relacion calidad-tamano frente a otras distribuciones.
- El modelo tiene 0 descargas y 1 like en el momento de la consulta, lo que indica ausencia de validacion comunitaria y de reportes de uso en produccion.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Qwopus3.5-9B-Coder-UNCENSORED-heretic-GGUF
- Modelo base: https://huggingface.co/xtools-at/Qwopus3.5-9B-Coder-UNCENSORED-heretic
- Pagina de descargas del autor: https://hf.tst.eu/model#Qwopus3.5-9B-Coder-UNCENSORED-heretic-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de perplejidad por tipo de cuantizacion: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Dataset lambda/hermes-agent-reasoning-traces: https://huggingface.co/datasets/lambda/hermes-agent-reasoning-traces
- Dataset Jackrong/Claude-opus-4.7-TraceInversion-5000x: https://huggingface.co/datasets/Jackrong/Claude-opus-4.7-TraceInversion-5000x
- Dataset Jackrong/Claude-opus-4.6-TraceInversion-9000x: https://huggingface.co/datasets/Jackrong/Claude-opus-4.6-TraceInversion-9000x
