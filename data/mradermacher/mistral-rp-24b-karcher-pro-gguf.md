# mradermacher/Mistral-RP-24b-karcher-pro-GGUF

## Resumen

Mistral-RP-24b-karcher-pro-GGUF es la versión cuantizada en formato GGUF del modelo Mistral-RP-24b-karcher-pro, un merge de modelos basado en la arquitectura Mistral publicado por el usuario win10 en Hugging Face. La cuantización la firma mradermacher, un conocido generador de cuantizaciones GGUF de la comunidad, que distribuye hasta once variantes de precisión distintas (desde Q2_K hasta Q8_0) para facilitar la inferencia en hardware de consumo mediante llama.cpp y derivados.

El modelo original es un merge construido con mergekit, orientado a roleplay y conversación (RP, role-play), como indica su nombre. Con 23.572.403.200 parámetros totales (aproximadamente 23,6 mil millones), se sitúa en la franja de modelos de tamaño medio-grande, lo que permite obtener calidad de conversación notable a costa de requisitos de memoria considerables. El repositorio GGUF ocupa 161,4 GB, reflejando la suma de todas las variantes de cuantización disponibles.

La relevancia de esta ficha radica en que permite ejecutar localmente un modelo de roleplay de 24B sin necesidad de GPUs de datacenter, eligiendo el equilibrio entre calidad y VRAM según la cuantización. No obstante, la información pública es muy escasa: no se detallan la composición del merge, los datos de entrenamiento, la longitud de contexto ni los benchmarks, por lo que muchas especificaciones deben marcarse como no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Mistral, según nomenclatura del modelo) |
| Parámetros totales | 23.572.403.200 (23,6B) |
| Parámetros activos | no disponible (no es MoE según los datos disponibles) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (estáticas); variantes imatrix en repo i1-GGUF |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones); el modelo base presumiblemente en safetensors |
| Modelo base | win10/Mistral-RP-24b-karcher-pro |
| Método de creación | mergekit (merge de modelos) |
| Tamaño del repo | 161,4 GB |

## Arquitectura y entrenamiento

El modelo original es un merge creado con mergekit a partir de modelos no especificados públicamente. La nomenclatura "Mistral-RP" sugiere una base de la familia Mistral (probablemente Mistral Small o un fine-tune derivado) orientada a roleplay. Al tratarse de un merge, no hay un entrenamiento desde cero: la técnica combina los pesos de varios modelos (posiblemente mediante SLERP, TIES, DARE u otro método de mergekit) para fusionar capacidades de distintos fine-tunes. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en los modelos componentes.

La innovación técnica de esta ficha concreta no está en el modelo, sino en la cuantización: mradermacher ofrece cuantizaciones estáticas (las listadas en la tabla) y un repositorio separado con cuantizaciones ponderadas/imatrix (i1-GGUF), que suelen ofrecer mejor calidad por bit que las estáticas equivalentes. Las cuantizaciones IQ (como IQ4_XS) emplean cuantización con importancia para preservar mejor los pesos relevantes. El modelo no incorpora mecanismos como decodificación especulativa ni atención lineal según la información disponible.

## Capacidades

- Generación de texto conversacional y roleplay en inglés, propósito principal del modelo según su nombre.
- Conversaciones multi-turno con mantenimiento de personaje y contexto narrativo (la longitud exacta de contexto no está documentada).
- Capacidades de razonamiento general heredadas de los modelos base del merge, aunque no verificadas mediante benchmarks.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingües: limitadas al inglés según la model card.
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Roleplay y narrativa interactiva: el modelo está específicamente afinado para mantener personajes y tramas coherentes en conversaciones largas, siendo su uso natural en aplicaciones de ficción interactiva y chatbots de entretenimiento.
- Asistentes conversacionales especializados en inglés: puede desplegarse como backend de un chatbot con personalidad definida, aprovechando su naturaleza de modelo de rol para respuestas consistentes en tono y estilo.
- Generación de diálogos para guiones y videojuegos: útil para prototipar conversaciones de NPCs con variedad estilística, ejecutándose localmente con llama.cpp para iterar sin costes de API.
- Experimentación e investigación en merges: sirve como caso de estudio de cómo un merge de modelos se comporta tras cuantización agresiva (Q2_K, Q3_K), comparando calidad frente a las variantes Q6_K y Q8_0.
- Despliegue en hardware de consumo: con la cuantización Q4_K_M (14,4 GB) puede ejecutarse en GPUs de 16 GB o en configuraciones CPU+GPU, permitiendo probar un modelo de 24B sin infraestructura de datacenter.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece once variantes, lo que permite medir el impacto de la cuantización en la calidad de roleplay y coherencia narrativa con una misma base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización, solo pesos): Q2_K ≈ 9,0 GB; Q3_K_S ≈ 10,5 GB; Q3_K_M ≈ 11,6 GB; Q3_K_L ≈ 12,5 GB; IQ4_XS ≈ 13,0 GB; Q4_K_S ≈ 13,6 GB; Q4_K_M ≈ 14,4 GB; Q5_K_S ≈ 16,4 GB; Q5_K_M ≈ 16,9 GB; Q6_K ≈ 19,4 GB; Q8_0 ≈ 25,2 GB. Añadir entre 1 y 3 GB adicionales para el contexto KV cache según la longitud de contexto configurada.
- GPU recomendadas: RTX 4090 (24 GB) para Q6_K o Q8_0 con contexto moderado; RTX 4080/4070 Ti Super (16 GB) para Q4_K_M; GPUs de 12-16 GB para Q3_K_L o IQ4_XS; A100/H100 para despliegues concurrentes con contexto largo.
- ¿Cabe en GPU de consumo? Sí: las cuantizaciones Q4_K_M y Q5_K_M caben en GPUs de 16 GB; Q6_K y Q8_0 requieren 24 GB (RTX 3090/4090). Las variantes Q2_K y Q3_K caben en GPUs de 10-12 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python, text-generation-webui y cualquier runtime compatible con GGUF. vLLM y TGI no soportan GGUF de forma nativa sin conversión a otro formato.
- Latencia y throughput: no disponibles (no documentados por el autor).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|
| Mistral-RP-24b-karcher-pro (este) | 23,6B | no disponible | no disponible | GGUF | Roleplay (merge) |
| Mistral Small 24B (oficial) | 24B | 32K (según versión) | Apache 2.0 (versiones recientes) | safetensors, GGUF | Propósito general |
| Yi-34B (01-ai) | 34B | 200K | Apache 2.0 | safetensors, GGUF | Propósito general |
| Command R 35B (Cohere) | 35B | 128K | CC-BY-NC 4.0 | safetensors | RAG y herramientas |

La comparación es aproximada: no se dispone de benchmarks del modelo de esta ficha para contrastar rendimiento real frente a estas alternativas. Mistral Small 24B es el pariente arquitectónico más cercano y ofrece licencia Apache 2.0 y contexto documentado, ventajas claras para producción frente a este merge de licencia no especificada. Yi-34B y Command R 35B son alternativas de tamaño superior con contextos mucho mayores y documentación completa.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; verificar la licencia del modelo base win10/Mistral-RP-24b-karcher-pro antes de cualquier despliegue en producción.
- Idiomas: solo inglés documentado; el rendimiento en castellano no está verificado y probablemente sea degradado.
- Longitud de contexto no documentada: limita la planificación de aplicaciones con contexto largo.
- Riesgo de alucinación: inherente a los modelos de lenguaje; en roleplay puede manifestarse como inconsistencias narrativas o invención de hechos dentro de la ficción.
- Sesgos: al ser un merge de fine-tunes de roleplay, puede heredar sesgos de los datasets de conversación de sus componentes, sin documentación disponible al respecto.
- Sin benchmarks: no hay evidencia publicada de calidad objetiva; la elección entre cuantizaciones debe basarse en pruebas propias.
- Cuantizaciones agresivas (Q2_K, Q3_K_S) degradan notablemente la coherencia; el autor recomienda Q4_K_S o Q4_K_M como equilibrio.
- Modelo de nicho: 158 descargas y 1 like en el momento de la consulta indican poca validación comunitaria.
- Repositorio de 161,4 GB: descargar solo el archivo de cuantización deseado, no el repo completo.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Mistral-RP-24b-karcher-pro-GGUF
- Modelo base: https://huggingface.co/win10/Mistral-RP-24b-karcher-pro
- Cuantizaciones imatrix (i1): https://huggingface.co/mradermacher/Mistral-RP-24b-karcher-pro-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Mistral-RP-24b-karcher-pro-GGUF
- Preguntas frecuentes y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- mergekit (herramienta de merge): https://github.com/arcee-ai/mergekit
