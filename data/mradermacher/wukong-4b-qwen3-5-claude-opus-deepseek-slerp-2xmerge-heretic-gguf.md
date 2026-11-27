# mradermacher/Wukong-4B-Qwen3.5-Claude-Opus-DeepSeek-SLERP-2xMerge-heretic-GGUF

## Resumen

Wukong-4B-Qwen3.5-Claude-Opus-DeepSeek-SLERP-2xMerge-heretic es un modelo de lenguaje de 4.326 millones de parámetros (4,3B) obtenido mediante la fusión de dos modelos derivados de la familia Qwen 3.5, empleando la técnica SLERP (Spherical Linear Interpolation) en un merge 2x. El modelo original fue publicado por el usuario xtools-at, y esta ficha corresponde a la versión cuantizada en formato GGUF publicada por mradermacher, un conocido autor de cuantizaciones estáticas para llama.cpp y ecosistemas compatibles.

El modelo está orientado a tareas de razonamiento, generación de código, uso de herramientas (tool calling / function calling) y flujos agénticos. Según las etiquetas y datasets declarados en la model card, se ha destilado parcialmente a partir de trazas de razonamiento de Claude Opus 4.6 y 4.7, así como de trazas agénticas de Hermes, lo que sugiere un entrenamiento orientado a reproducir cadenas de pensamiento de modelos de mayor tamaño. La variante "heretic" indica que ha sido sometida a un proceso de "decensoring" o reducción de rechazos (ablación de comportamientos de negativa), lo que afecta directamente a sus políticas de seguridad.

La relevancia de esta ficha radica en que ofrece un modelo compacto (4,3B) con capacidades declaradas de razonamiento y agentes, cuantizado en múltiples formatos GGUF (desde Q2_K hasta f16), lo que permite su despliegue en hardware de consumo. La licencia Apache 2.0 facilita su uso comercial, aunque la naturaleza "heretic" y la falta de benchmarks publicados exigen cautela en entornos de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso derivado de Qwen 3.5 (fusión SLERP de dos modelos) |
| Parametros totales | 4.326.350.848 (4,3B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; además mmproj-Q8_0 y mmproj-f16 (suplemento multimodal) |
| Idiomas soportados | en, zh, es, ru, ja |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo es el resultado de una fusión 2x mediante SLERP entre dos modelos derivados de Qwen 3.5, una arquitectura transformer densa. El identificador incluye referencias a "Claude-Opus" y "DeepSeek", lo que apunta a que los modelos fusionados fueron destilados a partir de trazas de razonamiento generadas por Claude Opus 4.6 y 4.7, así como de trazas agénticas de Hermes. Los datasets declarados son Jackrong/Claude-opus-4.6-TraceInversion-9000x, Jackrong/Claude-opus-4.7-TraceInversion-5000x y lambda/hermes-agent-reasoning-traces, lo que confirma un entrenamiento orientado a imitar cadenas de razonamiento y comportamiento agéntico de modelos de referencia.

La innovación técnica principal es el propio proceso de fusión: SLERP interpola esféricamente los pesos de dos modelos para combinar capacidades sin necesidad de un entrenamiento adicional completo. La variante "heretic" implica un proceso de ablación de direcciones de rechazo (refusal directions) en el espacio de activaciones, típicamente mediante técnicas como abliteration, que reduce la probabilidad de que el modelo decline peticiones. No se dispone de información sobre el número total de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron fases de RLHF o DPO sobre el merge.

## Capacidades

- Generación de texto conversacional multi-turno en inglés, chino, español, ruso y japonés.
- Razonamiento explícito (etiqueta "reasoning") orientado a cadenas de pensamiento destiladas de Claude Opus.
- Generación de código y tareas de programación (etiqueta "coding").
- Matemáticas y disciplinas STEM/ciencia (etiquetas "math", "stem", "science").
- Uso de herramientas y function calling (etiquetas "tool-use", "function-calling").
- Comportamiento agéntico y razonamiento multi-paso (etiqueta "agent", dataset de trazas agénticas de Hermes).
- Capacidad multimodal: el repositorio incluye archivos mmproj (Q8_0 y f16), lo que indica soporte de entrada de imágenes mediante proyector multimodal en llama.cpp.
- Modo "uncensored"/"decensored": reducción deliberada de rechazos de seguridad.

## Casos de uso

- Asistente de código en local: el modelo puede integrarse en editores o pipelines de CI/CD para autocompletado y generación de funciones, aprovechando su especialización en coding y su tamaño reducido (2,9 GB en Q4_K_M) para ejecutarse en estaciones de trabajo sin GPU dedicada de gran VRAM.
- Agente autónomo con tool calling: gracias a las trazas agénticas de Hermes y la etiqueta de function calling, puede orquestar llamadas a APIs y ejecutar flujos multi-paso en entornos controlados donde se requiera un modelo pequeño y desplegable en local.
- Razonamiento matemático y STEM en entornos educativos o de investigación: útil para resolver problemas paso a paso con cadenas de razonamiento, siempre que se valide la corrección de las respuestas por su tendencia a la alucinación.
- Procesamiento multilingüe ligero: atención al cliente o traducción asistida en inglés, chino, español, ruso y japonés, desplegable en servidores modestos mediante llama.cpp u Ollama.
- Análisis de imágenes con texto (multimodal): usando los archivos mmproj junto con el modelo principal en llama.cpp, puede describir o razonar sobre imágenes en aplicaciones de accesibilidad o documentación técnica.
- Experimentación en investigación sobre fusión de modelos y destilación de razonamiento: sirve como caso de estudio reproducible de merge SLERP y ablación de rechazos para investigadores que estudian alineación y seguridad.
- Generación de contenido sin restricciones en entornos de investigación controlada: la variante "heretic" permite estudiar comportamientos del modelo sin las negativas habituales, aunque con las advertencias de seguridad correspondientes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización: Q2_K ~2,1 GB; Q3_K_M ~2,5 GB; Q4_K_M ~2,9 GB; Q5_K_M ~3,3 GB; Q6_K ~3,7 GB; Q8_0 ~4,7 GB; f16 ~8,8 GB. Añadir ~0,5-0,8 GB si se usa el proyector multimodal (mmproj).
- GPU recomendadas: cualquier GPU consumer con 4 GB o más de VRAM para cuantizaciones Q4/Q5 (RTX 3060, RTX 4060, RTX 4090). Para f16 se recomienda una GPU con 12 GB o más (RTX 3090, RTX 4090, A100, H100).
- Cabe en GPU consumer: sí, en la mayoría de tarjetas modernas con 6-8 GB de VRAM usando Q4_K_M o Q5_K_M; también puede ejecutarse en CPU con llama.cpp, aunque con mayor latencia.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y servidores compatibles con GGUF. El modelo base en safetensors puede servirse con vLLM o TGI, pero esta versión GGUF está pensada para llama.cpp y derivados.
- Latencia y throughput estimados: no disponible (no se han publicado mediciones).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Wukong-4B-Qwen3.5-...-heretic (este) | 4,3B | no disponible | Apache 2.0 | GGUF, safetensors | Merge SLERP, destilado de Claude Opus, decensored |
| Qwen2.5-3B-Instruct | 3,1B | 32K (típico en la familia) | Apache 2.0 | safetensors, GGUF | Modelo base oficial, sin decensoring |
| Llama-3.2-3B-Instruct | 3,2B | 128K | Llama 3.2 Community | safetensors, GGUF | Licencia restrictiva para algunos usos |
| Phi-3.5-mini-instruct | 3,8B | 128K | MIT | safetensors, GGUF | Fuerte en razonamiento y código |

La comparativa es orientativa: no se dispone de benchmarks del modelo Wukong que permitan una comparación cuantitativa directa con estas alternativas.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay evidencia cuantitativa de su rendimiento en MMLU, HumanEval, GSM8K u otras pruebas, lo que impide validar las capacidades declaradas.
- Riesgo elevado de alucinación: al ser un modelo de 4,3B destilado de trazas de modelos mayores, puede reproducir estilo de razonamiento sin la misma fiabilidad factual.
- Naturaleza "heretic"/"uncensored": la ablación de rechazos reduce las salvaguardas de seguridad, por lo que puede generar contenido inapropiado o dañino; no recomendado para aplicaciones de cara al público sin filtros adicionales.
- Sesgos conocidos: no documentados en la información disponible; los sesgos de los datasets de trazas de Claude y Hermes pueden propagarse al modelo fusionado.
- Limitaciones de contexto e idioma: la longitud de contexto no está especificada; los idiomas oficialmente soportados son en, zh, es, ru y ja, con calidad probablemente desigual fuera del inglés y el chino.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero la procedencia de los datos de destilación (trazas de Claude Opus) puede plantear dudas legales sobre los términos de uso de los modelos originales.
- Caveat de producción: al ser un merge experimental sin evaluación, no se recomienda su despliegue en producción sin una batería de pruebas propia y filtros de seguridad.

## Enlaces

- Hugging Face (GGUF): https://huggingface.co/mradermacher/Wukong-4B-Qwen3.5-Claude-Opus-DeepSeek-SLERP-2xMerge-heretic-GGUF
- Modelo base: https://huggingface.co/xtools-at/Wukong-4B-Qwen3.5-Claude-Opus-DeepSeek-SLERP-2xMerge-heretic
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Wukong-4B-Qwen3.5-Claude-Opus-DeepSeek-SLERP-2xMerge-heretic-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Wukong-4B-Qwen3.5-Claude-Opus-DeepSeek-SLERP-2xMerge-heretic-GGUF
- Dataset de trazas Claude Opus 4.6: https://huggingface.co/datasets/Jackrong/Claude-opus-4.6-TraceInversion-9000x
- Dataset de trazas Claude Opus 4.7: https://huggingface.co/datasets/Jackrong/Claude-opus-4.7-TraceInversion-5000x
- Dataset de trazas agénticas Hermes: https://huggingface.co/datasets/lambda/hermes-agent-reasoning-traces
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Peticiones de cuantización del autor: https://huggingface.co/mradermacher/model_requests
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
