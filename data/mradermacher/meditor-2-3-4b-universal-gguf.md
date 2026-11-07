# mradermacher/Meditor-2-3.4B-Universal-GGUF

## Resumen

Meditor-2-3.4B-Universal-GGUF es la distribucion en formato GGUF del modelo Meditor-2-3.4B-Universal, publicado por el usuario Yo-Purple y cuantizado por mradermacher, un perfil conocido en Hugging Face por generar versiones cuantizadas de modelos abiertos para su uso con llama.cpp y LM Studio. El modelo base emplea una arquitectura de tipo `qwen2_moe` con mezcla de expertos jerarquica (hierarchical MoE), segun las etiquetas declaradas por el autor, y cuenta con 3.511.666.688 parametros totales segun los pesos en safetensors del repositorio base.

La propuesta del modelo gira en torno a tres ejes declarados en sus etiquetas: una ventana de contexto de 500.000 tokens, capacidades de razonamiento y soporte de tool calling (toolformer). El repositorio incluye cuantizaciones estaticas desde Q2_K hasta f16, lo que permite desplegar el modelo en hardware de consumo con requisitos de VRAM que van desde aproximadamente 1,4 GB hasta 7,1 GB segun el nivel de cuantizacion.

Es relevante ahora porque combina un tamano reducido (3,4B parametros) con una arquitectura MoE y un contexto declarado muy amplio, lo que lo situa en la categoria de modelos pequenos orientados a agentes y tareas de contexto largo. No obstante, la model card es muy escasa: no se detallan datos de entrenamiento, composicion del dataset ni resultados de benchmarks, por lo que muchas especificaciones deben considerarse no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen2_moe con hierarchical MoE (hmoe), segun etiquetas del autor |
| Parametros totales | 3.511.666.688 |
| Parametros activos | no disponible |
| Longitud de contexto | 500.000 tokens (declarado en etiquetas) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (repositorio de cuantizaciones); el modelo base usa safetensors |

## Arquitectura y entrenamiento

El modelo base se declara como `qwen2_moe`, es decir, un transformer con mezcla de expertos basado en la familia Qwen2, combinado con etiquetas que indican `smollm2`, `moe`, `hierarchical-moe` y `hmoe`. Esto sugiere una arquitectura derivada de SmolLM2 con capas MoE jerarquicas, aunque la model card no proporciona detalles sobre el numero de expertos, el enrutamiento, la dimension oculta ni la configuracion exacta de las capas. Tampoco se especifica cuantos parametros estan activos por token, dato clave en un modelo MoE.

No hay informacion publicada sobre el volumen de tokens de entrenamiento, la composicion del dataset, el uso de RLHF o DPO, ni sobre innovaciones tecnicas concretas como decodificacion especulativa o atencion lineal. Las etiquetas mencionan `500k-context`, `reasoning` y `toolformer`, lo que indica que el autor declara soporte de contexto largo, razonamiento y entrenamiento orientado a uso de herramientas, pero sin documentacion tecnica que lo respalde en la model card. Esta version concreta es una cuantizacion estatica generada por mradermacher; existe tambien una variante con cuantizaciones ponderadas/imatrix en el repositorio `mradermacher/Meditor-2-3.4B-Universal-i1-GGUF`.

## Capacidades

- Generacion de texto conversacional en ingles, segun la etiqueta `conversational` y el idioma declarado.
- Razonamiento (etiqueta `reasoning`), sin detalle sobre si existe un modo de pensamiento explicito.
- Tool calling / function calling (etiqueta `toolformer`), orientado a integracion con herramientas externas.
- Contexto largo declarado de hasta 500.000 tokens, adecuado para documentos extensos o historiales de conversacion prolongados.
- Arquitectura MoE, que en teoria permite mayor capacidad con un coste de computo por token inferior al de un modelo denso equivalente, aunque no se especifican los parametros activos.
- Compatibilidad con LM Studio (etiqueta `lmstudio`) y con el ecosistema GGUF de llama.cpp.
- Capacidades multilingues: solo ingles declarado; no se documentan otros idiomas.
- No se declaran capacidades de vision, audio ni otros modalidades.

## Casos de uso

- Analisis de documentos largos: el contexto declarado de 500.000 tokens permite procesar informes, expedientes o bases de codigo extensas en una sola pasada, sin fragmentacion, en tareas de resumen o extraccion de informacion.
- Agentes con uso de herramientas: la etiqueta `toolformer` sugiere que el modelo puede generar llamadas a funciones, lo que lo hace apto para orquestar APIs en flujos de automatizacion con llama.cpp o LM Studio.
- Asistente conversacional local: con cuantizaciones Q4_K_M de 2,2 GB, puede ejecutarse en portatiles con GPU integrada o en CPU, ofreciendo un asistente en ingles sin dependencia de la nube.
- Razonamiento multi-paso en entornos con recursos limitados: su tamano reducido y su naturaleza MoE permiten desplegarlo en estaciones de trabajo modestas para tareas de planificacion y descomposicion de problemas.
- Prototipado rapido de pipelines RAG: el contexto largo facilita inyectar grandes volumentes de contexto recuperado sin truncar, util para validar arquitecturas de recuperacion antes de migrar a modelos mayores.
- Educacion y experimentacion: al ser un modelo pequeno con licencia Apache 2.0, es adecuado para fines docentes, pruebas de cuantizacion y comparativas de arquitecturas MoE en entornos academicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion: Q2_K ~1,4 GB; Q3_K_S ~1,7 GB; Q3_K_M ~1,8 GB; Q3_K_L ~2,0 GB; IQ4_XS ~2,0 GB; Q4_K_S ~2,1 GB; Q4_K_M ~2,2 GB; Q5_K_S ~2,5 GB; Q5_K_M ~2,6 GB; Q6_K ~3,0 GB; Q8_0 ~3,8 GB; f16 ~7,1 GB. Hay que anadir memoria para el contexto KV, que con 500.000 tokens puede ser considerable y depende de la configuracion de llama.cpp.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM puede ejecutar las cuantizaciones Q4 y Q5; para f16 se recomienda una GPU con 8 GB o mas (RTX 3060 Ti, RTX 4060 Ti, RTX 4070). En entornos profesionales, A100 o H100 no son necesarias por el tamano del modelo, pero permitirian contextos muy largos con mayor throughput.
- Cabe en GPU consumer: si, practicamente en cualquier GPU moderna con 4-8 GB de VRAM, e incluso en CPU con llama.cpp.
- Opciones de despliegue: llama.cpp, LM Studio (soporte declarado), Ollama (via importacion de GGUF), y servidores compatibles con la API de OpenAI (etiqueta `endpoints_compatible`). vLLM y TGI no estan confirmados para este formato GGUF concreto.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Meditor-2-3.4B-Universal (este) | 3,51B | 500k (declarado) | Apache 2.0 | GGUF / safetensors | MoE jerarquica, solo ingles, sin benchmarks publicados |
| SmolLM2-1.7B | 1,7B | 8k tipico | Apache 2.0 | safetensors / GGUF | Modelo denso pequeno de Hugging Face; referencia por la etiqueta `smollm2` |
| Qwen2-1.5B / Qwen2.5-3B | 1,5B / 3B | 32k (Qwen2.5) | Apache 2.0 | safetensors / GGUF | Familia base de la arquitectura `qwen2_moe`; contexto menor |
| Phi-3-mini | 3,8B | 4k-128k segun variante | MIT | safetensors / GGUF | Denso, con benchmarks publicados; contexto muy inferior |

La comparativa es aproximada: no hay datos de rendimiento del modelo para confrontar con las alternativas, y los parametros activos del MoE no estan disponibles, lo que impide estimar su coste real de inferencia frente a modelos densos de tamano similar.

## Limitaciones y advertencias

- Model card muy escasa: no hay informacion sobre datos de entrenamiento, numero de expertos, parametros activos ni proceso de alineacion, lo que dificulta evaluar su calidad real.
- Ausencia total de benchmarks publicados; no se puede verificar el rendimiento declarado en razonamiento, tool calling o contexto largo.
- El contexto de 500.000 tokens es una declaracion del autor en etiquetas, no una especificacion documentada; el uso real con contextos muy largos puede degradar la calidad y disparar el consumo de memoria KV.
- Solo idioma ingles declarado; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Riesgo de alucinacion inherente a modelos de este tamano, agravado por la falta de evaluaciones publicadas.
- Sesgos desconocidos: al no documentarse el dataset, no se pueden anticipar sesgos de genero, raza o ideologicos.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; conviene validar el modelo en el dominio concreto antes de produccion.
- La cuantizacion introduce perdida de calidad adicional, especialmente en Q2_K y Q3; para produccion se recomienda Q5_K_M o superior.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Meditor-2-3.4B-Universal-GGUF
- Modelo base: https://huggingface.co/Yo-Purple/Meditor-2-3.4B-Universal
- Cuantizaciones imatrix/ponderadas: https://huggingface.co/mradermacher/Meditor-2-3.4B-Universal-i1-GGUF
- Pagina de overview del autor para este modelo: https://hf.tst.eu/model#Meditor-2-3.4B-Universal-GGUF
- Solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Perfil de mradermacher en Hugging Face: https://huggingface.co/mradermacher/models
- Guia de uso de GGUF (README de referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
