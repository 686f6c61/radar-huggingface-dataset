# mradermacher/B0-27B-i1-GGUF

## Resumen

B0-27B-i1-GGUF es la versión cuantizada en formato GGUF del modelo B0-27B, un merge de modelos de la familia Qwen (la etiqueta del repositorio indica "qwen3.8") publicado por schneewolflabs y cuantizado por mradermacher. El modelo base cuenta con 27.320.697.856 parámetros (aproximadamente 27,3 mil millones) y está orientado a casos de uso conversacionales, agentes y tool-use. Esta ficha se centra en la distribución GGUF, que permite ejecutar el modelo en hardware de consumo mediante llama.cpp y derivados.

El modelo es un merge que combina pesos afinados con DPO sobre diversos datasets, entre ellos colecciones de nbeerbower (weasel-dpo, grok-politically-incorrect-dpo, seX-ai-dpo) y de schneewolflabs (i-DPO, Luna-DPO, egirl-delegation-dpo, egirl-hemlock-dpo, destructo-dpo), además de MahouMix-v1 de flammenai. La licencia declarada es Apache 2.0 y el único idioma soportado oficialmente es el inglés. El repositorio incluye cuantizaciones con imatrix desde Q2_K hasta Q6_K, con tamaños que van de 11,0 GB a 22,5 GB.

La relevancia de esta ficha radica en que ofrece una vía práctica para desplegar un modelo de 27B en GPUs de consumo o en servidores modestos, con una amplia gama de niveles de cuantización que permiten ajustar el equilibrio entre calidad y requisitos de memoria. No obstante, la información pública disponible es escasa: no se detallan la longitud de contexto, los datos exactos de entrenamiento ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (merge de modelos de la familia Qwen; detalles no disponibles) |
| Parametros totales | 27.320.697.856 (~27,3 B) |
| Parametros activos | No aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (con imatrix) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones i1 con imatrix); el modelo base en safetensors |
| Tamano del repositorio | 218,6 GB (incluye todas las cuantizaciones) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base B0-27B. Por los tags del repositorio ("qwen3.8", "merge", "agents", "tool-use") y el recuento de parámetros (27,3 B), se trata de un transformer denso derivado de la familia Qwen, fusionado mediante técnicas de model merging a partir de múltiples variantes afinadas con DPO. Los datasets de preferencia empleados incluyen weasel-dpo, grok-politically-incorrect-dpo, seX-ai-dpo, i-DPO, Luna-DPO, MahouMix-v1, egirl-delegation-dpo, egirl-hemlock-dpo y destructo-dpo, lo que sugiere un ajuste orientado a conversación, roleplay y alineamiento con preferencias específicas.

No se especifican el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo fases de RLHF adicionales más allá del DPO implícito en los datasets de preferencia. La cuantización i1 de mradermacher emplea ficheros imatrix (un fichero de 0,1 GB incluido en el repositorio) para mejorar la calidad de las cuantizaciones de baja precisión, y ofrece tanto cuantizaciones estáticas (repositorio B0-27B-GGUF) como dinámicas i1. No se documentan innovaciones arquitectónicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional multi-turno en inglés.
- Soporte de agentes y tool calling / function calling, según los tags del repositorio ("agents", "tool-use").
- Razonamiento multi-paso orientado a tareas de agente.
- Capacidades de roleplay y conversación con personalidad, derivadas de los datasets DPO de roleplay incluidos.
- No se documentan capacidades de visión, audio ni modo de razonamiento extendido (thinking mode).
- Capacidades multilingües limitadas al inglés según la model card.

## Casos de uso

- Agentes conversacionales con tool calling: el modelo puede integrarse en frameworks de agentes (LangChain, LlamaIndex, smolagents) para invocar APIs y ejecutar flujos multi-paso, aprovechando su soporte declarado de tool-use.
- Asistentes de atención al cliente en inglés: despliegue local con llama.cpp u Ollama para gestionar conversaciones multi-turno sin depender de APIs externas, con la ventaja de privacidad que ofrece la inferencia local.
- Roleplay y generación creativa: los datasets DPO de roleplay y narrativa (Luna-DPO, egirl-*, MahouMix) hacen del modelo un candidato para aplicaciones de ficción interactiva y personajes conversacionales.
- Prototipado en hardware de consumo: la cuantización i1-Q4_K_M (16,9 GB) permite ejecutar el modelo en una GPU de 24 GB como la RTX 4090, facilitando experimentación local sin infraestructura de datacenter.
- Automatización de tareas de oficina en inglés: resumen, redacción y reescritura de documentos mediante pipelines batch con llama.cpp, aprovechando el equilibrio calidad/tamaño de las cuantizaciones Q4 y Q5.
- Investigación sobre merging y cuantización: el repositorio sirve como caso de estudio para evaluar el impacto de las cuantizaciones i1 con imatrix frente a las estáticas en un modelo de 27B.
- Despliegue en servidores con una sola GPU: las cuantizaciones Q5_K_M (19,6 GB) y Q6_K (22,5 GB) caben en GPUs de 24 GB, permitiendo servir el modelo con vLLM (si soporta el formato) o llama.cpp server.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (incluyendo overhead de contexto): i1-Q2_K ~11-13 GB; i1-IQ3_M ~13-15 GB; i1-Q4_K_M ~17-19 GB; i1-Q5_K_M ~20-22 GB; i1-Q6_K ~23-25 GB.
- GPU recomendadas: RTX 4090 (24 GB) para cuantizaciones Q4_K_M a Q6_K; RTX 3090 (24 GB) equivalente; A100 40/80 GB o H100 para precisión completa o contextos largos; GPUs de 16 GB (RTX 4080, 4060 Ti 16 GB) solo para cuantizaciones Q3 o inferiores.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 con cuantizaciones Q4-Q6; en GPUs de 16 GB con Q3 o IQ3; en GPUs de 12 GB solo con Q2 (calidad degradada).
- Opciones de despliegue: llama.cpp, Ollama (importando el GGUF), llama-cpp-python, LM Studio, text-generation-webui. vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones, por lo que para esos motores habría que usar el modelo base en safetensors.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| B0-27B-i1-GGUF | 27,3 B | No disponible | Apache 2.0 | GGUF (i1, imatrix) | Merge orientado a agentes y roleplay; solo inglés |
| Qwen2.5-32B-Instruct | 32,5 B | 128K (según model card oficial) | Apache 2.0 | safetensors, GGUF | Modelo base de referencia de la familia Qwen; multilingüe |
| Gemma-2-27B-it | 27 B | 8K | Gemma license | safetensors, GGUF | Tamaño comparable; licencia más restrictiva |
| Mistral-Small-24B-Instruct | 24 B | 32K | Apache 2.0 | safetensors, GGUF | Alternativa europea de tamaño similar con soporte multilingüe |

La comparativa se basa en características públicas de modelos de tamaño similar; no se dispone de datos de rendimiento comparativo para B0-27B.

## Limitaciones y advertencias

- Solo soporta inglés según la model card; el rendimiento en castellano no está garantizado ni documentado.
- Al ser un merge de modelos afinados con DPO sobre datasets de roleplay y preferencias específicas, puede presentar sesgos de estilo y contenido derivados de esos datasets (incluidos datasets con contenido políticamente incorrecto o para adultos).
- Riesgo de alucinación inherente a los modelos de 27B sin datos de evaluación publicados; no hay benchmarks que permitan estimar su fiabilidad.
- La longitud de contexto no está documentada, lo que dificulta planificar despliegues con ventanas largas.
- Aunque la licencia es Apache 2.0, los datasets de entrenamiento pueden tener sus propias restricciones; conviene revisar las licencias de los datasets de preferencia antes de un uso comercial.
- Las cuantizaciones de baja precisión (Q2, Q3) degradan la calidad de forma notable; para producción se recomienda Q4_K_M o superior.
- No se documentan evaluaciones de seguridad ni de alineamiento más allá del DPO de los datasets.
- El repositorio tiene muy pocas descargas (476) y ningún like, lo que indica una adopción limitada y escasa validación por la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/B0-27B-i1-GGUF
- Modelo base: https://huggingface.co/schneewolflabs/B0-27B
- Cuantizaciones estáticas: https://huggingface.co/mradermacher/B0-27B-GGUF
- Página de descargas del cuantizador: https://hf.tst.eu/model#B0-27B-i1-GGUF
- FAQ y peticiones de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Dataset weasel-dpo: https://huggingface.co/datasets/nbeerbower/weasel-dpo
- Dataset grok-politically-incorrect-dpo: https://huggingface.co/datasets/nbeerbower/grok-politically-incorrect-dpo
- Dataset seX-ai-dpo: https://huggingface.co/datasets/nbeerbower/seX-ai-dpo
- Dataset i-DPO: https://huggingface.co/datasets/schneewolflabs/i-DPO
- Dataset Luna-DPO: https://huggingface.co/datasets/schneewolflabs/Luna-DPO
- Dataset MahouMix-v1: https://huggingface.co/datasets/flammenai/MahouMix-v1
- Dataset egirl-delegation-dpo: https://huggingface.co/datasets/schneewolflabs/egirl-delegation-dpo
- Dataset egirl-hemlock-dpo: https://huggingface.co/datasets/schneewolflabs/egirl-hemlock-dpo
- Dataset destructo-dpo: https://huggingface.co/datasets/schneewolflabs/destructo-dpo
