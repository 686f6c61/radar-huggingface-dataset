# mradermacher/Tenet-14B-Qwen3-Unslop-v2-GGUF

## Resumen

Tenet-14B-Qwen3-Unslop-v2 es un modelo de lenguaje de 14.768.307.200 parámetros (aproximadamente 14,8 mil millones) desarrollado por mr-andrey-isachenko, del que esta ficha documenta la versión cuantizada en formato GGUF publicada por mradermacher. El modelo parte de la familia Qwen3 y ha sido sometido a un proceso de ajuste fino con GRPO (Group Relative Policy Optimization) orientado a razonamiento explícito (thinking mode), uso de herramientas (tool-use) y comportamiento agéntico, además de un proceso de "unslop" destinado a eliminar el estilo de respuesta acartonado típico de modelos alineados de forma agresiva.

La relevancia de esta publicación radica en que combina dos elementos poco habituales: por un lado, etiquetas que indican un proceso de "abliteration" (eliminación de rechazos) y contenido "uncensored", lo que lo sitúa en la categoría de modelos sin filtros de seguridad estrictos; por otro, mantiene capacidades declaradas de razonamiento, coding y agentic tool-use, lo que lo hace atractivo para entornos de investigación y desarrollo donde se requiere control total sobre el comportamiento del modelo.

La versión documentada aquí es una conversión estática a GGUF con cuantizaciones desde Q2_K hasta Q8_0, pensada para inferencia local con llama.cpp y derivados. El repositorio ocupa 102 GB e incluye todos los niveles de cuantización publicados. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales, si bien conviene revisar las implicaciones del proceso de abliteration en contextos de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3), con modo de razonamiento (thinking) |
| Parametros totales | 14.768.307.200 (aprox. 14,8 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (estaticas); versiones i1 (imatrix/weighted) en repo separado |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen3, un transformer decoder-only con atención completa estándar y soporte nativo de modo de razonamiento (thinking mode), que genera una cadena de pensamiento antes de la respuesta final. Sobre esta base, el autor aplicó un ajuste fino con GRPO, un algoritmo de optimización por política relativa a grupos que se emplea habitualmente para reforzar capacidades de razonamiento y resolución de problemas multi-paso. Las etiquetas del repositorio indican también un proceso de "unslop", orientado a reducir el estilo formulaico y excesivamente cauteloso de las respuestas, y un proceso de "abliteration" que elimina los mecanismos de rechazo aprendidos durante el alineamiento.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni los detalles exactos del pipeline de RLHF/DPO/GRPO en la información proporcionada. Las etiquetas mencionan también "fp8" y "vllm", lo que sugiere que el modelo base puede desplegarse en FP8 con vLLM y que se ha probado en OpenRouter. La versión documentada aquí es una cuantización estática realizada con herramientas de llama.cpp, con conversión desde safetensors y sin datos adicionales sobre calibración (las versiones con imatrix están en un repositorio aparte).

## Capacidades

- Generación de texto conversacional en inglés, con soporte de modo de razonamiento explícito (thinking) que separa el proceso interno de la respuesta final.
- Razonamiento multi-paso y resolución de problemas, reforzado mediante GRPO según las etiquetas del autor.
- Generación de código y tareas de programación (etiqueta "coding").
- Uso de herramientas y function calling (etiquetas "tool-use" y "agentic"), orientado a flujos agénticos.
- Comportamiento sin filtros de rechazo (etiquetas "abliterated" y "uncensored"), lo que implica que el modelo no declinará peticiones por motivos de seguridad aprendidos.
- Capacidades multilingües limitadas: el campo de idiomas solo declara inglés.
- No se declaran capacidades de visión, audio ni multimodalidad en la información disponible.

## Casos de uso

- Investigación sobre alineamiento y seguridad: el modelo permite estudiar el comportamiento de un LLM tras abliteration, comparando sus respuestas con las del Qwen3 original para analizar qué rechazos se han eliminado y cómo afecta al estilo.
- Agentes autónomos de desarrollo: gracias a las etiquetas de tool-use y agentic, puede integrarse en bucles de razonamiento que invocan APIs, ejecutan comandos o consultan documentación, con la ventaja de que el modo thinking permite trazar el plan antes de actuar.
- Generación de código en pipelines locales: con cuantizaciones Q4_K_M (9,1 GB) o Q5_K_M (10,6 GB) cabe en GPUs de consumo y puede usarse como asistente de programación en entornos sin conexión, sin depender de APIs externas.
- Prototipado de asistentes conversacionales sin restricciones de contenido: útil en entornos de ficción, roleplay o generación creativa donde los filtros de seguridad de modelos alineados resultan limitantes, siempre con las salvaguardas externas adecuadas.
- Evaluación de cuantizaciones: al publicarse 11 niveles de cuantización estática más una familia i1 con imatrix, sirve como banco de pruebas para medir la degradación de calidad en razonamiento y código según el nivel de compresión.
- Despliegue en hardware modesto: la cuantización Q2_K (5,9 GB) permite ejecutar el modelo en GPUs de 8 GB o en CPU con RAM suficiente, lo que facilita experimentación en portátiles y estaciones de trabajo sin aceleradores de gama alta.
- Fine-tuning posterior sobre dominio específico: al estar bajo Apache 2.0 y en formato GGUF, puede servir de base para LoRA o adaptaciones en llama.cpp, aunque el formato GGUF no es el ideal para entrenamiento (conviene partir del safetensors original).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto): Q2_K ≈ 5,9 GB; Q3_K_S ≈ 6,8 GB; Q4_K_S ≈ 8,7 GB; Q4_K_M ≈ 9,1 GB; Q5_K_M ≈ 10,6 GB; Q6_K ≈ 12,2 GB; Q8_0 ≈ 15,8 GB. Añadir entre 1 y 3 GB adicionales para la caché KV según longitud de contexto y número de capas en GPU.
- GPU recomendadas: RTX 4090 (24 GB) para Q8_0 con contexto amplio; RTX 4080/4070 Ti Super (16 GB) para Q6_K o Q5_K_M; RTX 4060 Ti 16 GB o RTX 3080 (10-12 GB) para Q4_K_M; GPUs de 8 GB para Q2_K o Q3_K_S. Para despliegue en servidor, A100 40/80 GB o H100 permiten Q8_0 con contexto largo y mayor throughput.
- Cabe en GPU de consumo: sí, desde Q2_K en 8 GB hasta Q8_0 en 24 GB. Las cuantizaciones Q4_K_M y Q5_K_M son las recomendadas por el autor por su equilibrio velocidad/calidad.
- Opciones de despliegue: llama.cpp, Ollama (mediante importación de GGUF), LM Studio, llama-cpp-python, y servidores compatibles con la API de OpenAI (el repo incluye la etiqueta "endpoints_compatible"). Para el modelo base en safetensors: vLLM (con soporte FP8) y transformers.
- Latencia y throughput: no disponibles en la información proporcionada. Como referencia orientativa, un modelo de ~14,8 B en Q4_K_M suele generar entre 20 y 40 tokens/s en una RTX 4090 con llama.cpp, pero este dato no está confirmado por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Tenet-14B-Qwen3-Unslop-v2 (esta ficha) | 14,8 B | no disponible | Apache 2.0 | GGUF, safetensors | Abliterated, thinking, GRPO, tool-use |
| Qwen3-14B (base oficial) | 14,8 B | no disponible | Apache 2.0 | safetensors, GGUF | Alineamiento estándar, sin abliteration |
| Qwen2.5-14B-Instruct | 14,7 B | 32.768 tokens (referencia de la familia) | Apache 2.0 | safetensors, GGUF | Sin modo thinking nativo |
| Mistral-Nemo-12B-Instruct | 12 B | 128.000 tokens (referencia) | Apache 2.0 | safetensors, GGUF | Alternativa europea de tamaño similar |

La comparación con Qwen3-14B es la más directa: comparten arquitectura y tamaño, pero Tenet añade abliteration, unslop y ajuste GRPO. Frente a Qwen2.5-14B-Instruct, la diferencia principal es el modo thinking y el pipeline de RL. Mistral-Nemo ofrece contexto mucho mayor según su documentación oficial, pero no se dispone de datos de rendimiento comparables en la información proporcionada para esta ficha.

## Limitaciones y advertencias

- El proceso de abliteration elimina los rechazos aprendidos: el modelo puede generar contenido dañino, ilegal o éticamente problemático sin filtros internos. Es imprescindible aplicar salvaguardas externas en cualquier despliegue de producción.
- Riesgo de alucinación inherente a los LLM de 14 B, especialmente en modo thinking con cadenas de razonamiento largas, donde los errores pueden propagarse sin corrección.
- Idiomas: solo se declara inglés. El rendimiento en castellano no está garantizado y probablemente sea inferior al de modelos multilingües específicos.
- Longitud de contexto no documentada en esta ficha; conviene consultar la model card del modelo base (mr-andrey-isachenko/Tenet-14B-Qwen3-Unslop-v2) antes de diseñar aplicaciones con contexto largo.
- Las cuantizaciones bajas (Q2_K, Q3_K_S) degradan notablemente la calidad, especialmente en tareas de razonamiento y código; el autor recomienda Q4_K_M o superiores.
- Aunque la licencia Apache 2.0 permite uso comercial, el proceso de abliteration puede entrar en conflicto con las políticas de uso de plataformas de despliegue (OpenRouter, clouds con filtros) y con obligaciones regulatorias (por ejemplo, la AI Act europea en materia de transparencia y evaluación de riesgos).
- El repositorio tiene muy pocas descargas (404) y ningún "like", lo que indica escasa validación comunitaria; no hay benchmarks publicados que respalden las capacidades declaradas.
- El tamaño del repo (102 GB) incluye todas las cuantizaciones; descargar solo el archivo GGUF deseado, no el repositorio completo.

## Enlaces

- Repositorio Hugging Face (esta versión GGUF): https://huggingface.co/mradermacher/Tenet-14B-Qwen3-Unslop-v2-GGUF
- Modelo base: https://huggingface.co/mr-andrey-isachenko/Tenet-14B-Qwen3-Unslop-v2
- Cuantizaciones i1 (imatrix): https://huggingface.co/mradermacher/Tenet-14B-Qwen3-Unslop-v2-i1-GGUF
- Página de overview del autor de cuantizaciones: https://hf.tst.eu/model#Tenet-14B-Qwen3-Unslop-v2-GGUF
- FAQ y peticiones de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Gráfico comparativo de perplejidad por cuantización (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
