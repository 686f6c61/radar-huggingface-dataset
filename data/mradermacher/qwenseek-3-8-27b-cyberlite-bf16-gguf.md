# mradermacher/Qwenseek-3.8-27B-CyberLite-BF16-GGUF

## Resumen

Qwenseek-3.8-27B-CyberLite-BF16 es un modelo de lenguaje de 27.320.697.856 parámetros (aproximadamente 27,3 mil millones) derivado del modelo base `trjxter/Qwenseek-3.8-27B-CyberLite-BF16`, publicado por el usuario mradermacher en formato GGUF para inferencia local. El modelo original se construye sobre la familia Qwen (etiquetas `qwen3_5` y `qwen3.8`) y ha sido afinado mediante SFT sobre LoRA/QLoRA con destilación de profesor a partir de dos datasets de razonamiento y seguridad (DeepSeek-V4-Flash-0731 y DeepSeek-V4-Pro-Reasoning). La especialización declarada es el razonamiento, la generación de código, la ingeniería de software, el tool calling, los flujos agénticos y la ciberseguridad defensiva con red team controlado.

Este repositorio concreto no contiene los pesos originales en safetensors, sino las cuantizaciones estáticas generadas por mradermacher a partir del modelo BF16 del autor original. El repositorio ocupa 189,2 GB e incluye un rango amplio de cuantizaciones GGUF (desde Q2_K de 11,0 GB hasta Q8_0 de 29,1 GB), además de dos ficheros `mmproj` que indican soporte multimodal (visión) en el modelo subyacente. La licencia es Apache 2.0 y el único idioma declarado es el inglés.

Su relevancia práctica radica en que permite ejecutar un modelo de 27B especializado en código, agentes y seguridad en hardware de consumo mediante cuantizaciones de 4 bits, algo imposible con los pesos BF16 completos. No obstante, se trata de un modelo derivado de un fine-tuning comunitario, no de un lanzamiento oficial de Alibaba, y no se han publicado resultados de benchmarks en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen; etiquetas `qwen3_5`, `qwen3.8`); detalles de capas y atención no disponibles |
| Parametros totales | 27.320.697.856 (27,3B) |
| Parametros activos | no disponible (no se declara arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, además de mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base del autor original está en BF16 |
| Tamano del repositorio | 189,2 GB |
| Cuantizacion mas pequena | Q2_K, 11,0 GB |
| Cuantizacion mas grande | Q8_0, 29,1 GB |
| Descargas | 349 |
| Libreria declarada | transformers |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de las etiquetas del repositorio, que apuntan a la familia Qwen (`qwen3_5`, `qwen3.8`). Se trata, por tanto, de un transformer decoder-only de 27,3 mil millones de parámetros, sin indicios de arquitectura MoE (no se declaran parámetros activos). El modelo subyacente incorpora componentes multimodales, como demuestra la presencia de los ficheros `mmproj-Q8_0.gguf` y `mmproj-f16.gguf` en el repositorio, que son el proyector multimodal que acompaña a los pesos principales en el ecosistema llama.cpp.

El proceso de entrenamiento declarado por el autor original combina SFT con LoRA y QLoRA y destilación de profesor (*teacher distillation*) a partir de dos datasets: `trjxter/DeepSeek-V4-Flash-0731-Teacher-Distillation-40513x` (40.513 ejemplos) y `trjxter/DeepSeek-V4-Pro-Reasoning-8000x` (8.000 ejemplos de razonamiento). Las etiquetas del modelo indican especialización en razonamiento, código, tool calling, comportamiento agéntico y ciberseguridad (defensiva y red team controlado). No se especifican el número total de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron fases de RLHF o DPO; estos datos figuran como no disponibles. La innovación técnica destacable es la cuantización estática realizada por mradermacher; el autor indica que las cuantizaciones ponderadas con imatrix no estaban disponibles en el momento de la publicación.

## Capacidades

- Generación de texto y razonamiento multi-paso, con énfasis en cadenas de razonamiento derivadas de la destilación de un modelo profesor de la familia DeepSeek-V4.
- Generación y edición de código, con especialización declarada en ingeniería de software.
- Tool calling y function calling, según las etiquetas `tool-calling` y `agentic` del repositorio.
- Flujos agénticos: planificación, ejecución de acciones y razonamiento encadenado orientado a tareas.
- Capacidades multimodales: la presencia de ficheros `mmproj` sugiere soporte de entrada visual, aunque el alcance exacto no está documentado.
- Ciberseguridad: orientación a seguridad defensiva y red team controlado, según las etiquetas `defensive-security` y `controlled-red-team`.
- Multilingüismo limitado: el único idioma declarado es el inglés (`en`).
- Modo conversacional, compatible con endpoints y con la librería `transformers` para los pesos originales.

## Casos de uso

- Asistente de revisión de código en CI/CD: el modelo puede analizar diffs y proponer correcciones en pipelines automatizados, aprovechando su especialización en ingeniería de software y su soporte de tool calling para consultar repositorios o ejecutar linters.
- Agente de resolución de incidencias: con capacidad agéntica y de razonamiento multi-paso, puede encadenar consultas a APIs, lectura de logs y generación de parches en un bucle de herramientas.
- Análisis de seguridad defensiva: revisión de configuraciones, detección de patrones de riesgo en código y generación de recomendaciones de mitigación, dentro del marco de red team controlado que declara el modelo.
- Automatización de tareas de desarrollo en local: al disponer de cuantizaciones de 11 a 29 GB, puede desplegarse en estaciones de trabajo con GPU de consumo para asistencia de código sin enviar datos a la nube.
- Generación de documentación técnica: a partir de código fuente y trazas, el modelo puede redactar documentación y explicaciones paso a paso, apoyándose en su modo de razonamiento.
- Prototipado de agentes con tool calling: útil para validar arquitecturas de agentes y esquemas de function calling antes de migrar a modelos mayores, gracias a su licencia Apache 2.0 y su despliegue sencillo con llama.cpp u Ollama.
- Experimentación en investigación sobre destilación: el modelo y sus datasets asociados permiten estudiar el efecto de la destilación de profesor en dominios de código y seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización: Q2_K 11,0 GB; Q3_K_S 12,4 GB; Q3_K_M 13,6 GB; Q3_K_L 14,7 GB; IQ4_XS 15,5 GB; Q4_K_S 15,9 GB; Q4_K_M 16,9 GB; Q5_K_S 19,1 GB; Q5_K_M 19,6 GB; Q6_K 22,5 GB; Q8_0 29,1 GB. A estas cifras hay que sumar el espacio de la caché KV, que depende del contexto configurado.
- GPU recomendadas: para Q4_K_M y superiores, GPU con 24 GB o más (RTX 3090, RTX 4090, A10G, L4 de 24 GB); para Q6_K y Q8_0, A100 40 GB, H100 o configuraciones multi-GPU.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 (24 GB) con cuantizaciones Q4_K_M o inferiores; en GPUs de 16 GB (RTX 4060 Ti, RTX 4070 Ti SUPER) solo con Q2_K o Q3_K_S y contexto reducido, o mediante offload parcial a CPU.
- Opciones de despliegue: llama.cpp y sus frontends (Ollama, LM Studio, llama-cpp-python), así como servidores compatibles con GGUF. Los pesos originales en BF16 pueden servirse con vLLM o TGI, pero no están incluidos en este repositorio.
- Latencia y throughput: no disponibles; dependerán de la GPU, la cuantización y la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwenseek-3.8-27B-CyberLite-BF16 (este, GGUF) | 27,3B | no disponible | Apache 2.0 | GGUF | Fine-tuning comunitario especializado en código, agentes y seguridad; sin benchmarks publicados |
| Qwen2.5-Coder-32B-Instruct | 32,5B | 131.072 tokens | Apache 2.0 | safetensors, GGUF | Modelo oficial de Alibaba especializado en código, con benchmarks publicados |
| Qwen2.5-32B-Instruct | 32,8B | 131.072 tokens | Apache 2.0 | safetensors, GGUF | Modelo oficial generalista de tamaño comparable |
| DeepSeek-Coder-V2-Lite-Instruct | 15,7B (2,4B activos, MoE) | 128.000 tokens | DeepSeek License | safetensors | Alternativa MoE eficiente en cómputo para código |

La comparación debe tomarse con cautela: los datos de los modelos alternativos provienen de sus fichas oficiales y no de una evaluación conjunta; para este modelo no hay cifras de rendimiento verificables.

## Limitaciones y advertencias

- No se han publicado benchmarks; el rendimiento real en código, razonamiento y seguridad es desconocido y debe validarse antes de usarlo en producción.
- Modelo derivado de un fine-tuning comunitario, no de un lanzamiento oficial de Alibaba; la calidad puede degradarse respecto al modelo Qwen base en tareas generales.
- Único idioma declarado: inglés. El rendimiento en castellano no está documentado y probablemente sea inferior.
- Longitud de contexto no documentada; planificar despliegues con contextos conservadores y verificar el límite real en el tokenizador y la configuración de llama.cpp.
- Riesgo de alucinación inherente a los modelos de 27B, agravado por la falta de evaluación publicada y por el entrenamiento con destilación sobre datos sintéticos.
- El sesgo específico de los datasets de destilación (DeepSeek-V4) puede transferirse al modelo; no se documentan análisis de sesgo.
- La orientación a ciberseguridad y red team controlado exige políticas de uso claras: el modelo podría generar contenido ofensivo si se le induce, pese a la etiqueta de seguridad defensiva.
- Las cuantizaciones de baja precisión (Q2_K, Q3_K_S) degradan la calidad; para tareas de razonamiento se recomienda Q5_K_M o superior.
- No hay cuantizaciones ponderadas con imatrix disponibles según el autor, lo que limita la calidad de las cuantizaciones pequeñas.
- Aunque la licencia es Apache 2.0, conviene revisar las condiciones del modelo base original y de los datasets de destilación antes de un uso comercial.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Qwenseek-3.8-27B-CyberLite-BF16-GGUF
- Modelo base BF16: https://huggingface.co/trjxter/Qwenseek-3.8-27B-CyberLite-BF16
- Dataset de destilación Flash: https://huggingface.co/datasets/trjxter/DeepSeek-V4-Flash-0731-Teacher-Distillation-40513x
- Dataset de razonamiento Pro: https://huggingface.co/datasets/trjxter/DeepSeek-V4-Pro-Reasoning-8000x
- Página de descargas del cuantizador: https://hf.tst.eu/model#Qwenseek-3.8-27B-CyberLite-BF16-GGUF
- Preguntas frecuentes y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Análisis de tipos de cuantización de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
