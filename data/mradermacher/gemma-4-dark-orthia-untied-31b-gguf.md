# mradermacher/Gemma-4-Dark-Orthia-Untied-31B-GGUF

## Resumen

Gemma-4-Dark-Orthia-Untied-31B-GGUF es una colección de cuantizaciones estáticas en formato GGUF del modelo Nimbz/Gemma-4-Dark-Orthia-Untied-31B, realizadas por mradermacher, un cuantizador muy prolífico de la comunidad de Hugging Face. El modelo base es un merge creado con mergekit a partir de la familia Gemma 4 de Google, con unos 31-32 mil millones de parámetros, y está orientado a roleplay, escritura creativa, narrativa y conversación, con un perfil "dark" caracterizado por un bajo nivel de rechazos (low-refusal) y contenido para adultos (nsfw), por lo que el repositorio está marcado como "not-for-all-audiences".

El sufijo "Untied" indica que el modelo utiliza embeddings de entrada y cabeceras de salida (lm_head) sin atar (untied), una variante arquitectónica respecto al Gemma original que puede beneficiar la calidad de generación en modelos de este tamaño. El rol de esta ficha es prácticamente el de un repositorio de cuantizaciones: mradermacher no modifica el modelo, solo lo convierte a GGUF en múltiples niveles de precisión (desde Q2_K hasta Q8_0) para que pueda ejecutarse en hardware de consumo con llama.cpp, Ollama, LM Studio u otros runtimes compatibles. También existe una versión con cuantizaciones weighted/imatrix de mayor calidad en un repositorio hermano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Gemma 4), merge con mergekit, embeddings y lm_head sin atar (untied) |
| Parametros totales | 32.106.631.740 (~31B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (además de imatrix en el repo hermano) |
| Idiomas soportados | inglés (en) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (el modelo base está en safetensors) |

## Arquitectura y entrenamiento

El modelo base, Nimbz/Gemma-4-Dark-Orthia-Untied-31B, es un merge (fusión de pesos) creado con mergekit sobre modelos de la familia Gemma 4 de Google, de tipo transformer denso con aproximadamente 31 mil millones de parámetros. El tag "untied-lm_head" señala que se han desatado las matrices de embedding de entrada y salida, de modo que la cabecera de salida es una matriz independiente, lo que aumenta ligeramente el número de parámetros pero puede mejorar la calidad de la distribución de salida. No se dispone de información sobre el método de merge concreto (linear, SLERP, TIES, DARE, etc.), ni sobre los modelos componentes exactos.

Sobre el entrenamiento no hay datos publicados en la información disponible: no consta el número de tokens, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO. Dado su etiquetado (roleplay, creative writing, dark, low-refusal, nsfw), es razonable asumir que los componentes del merge incluyen fine-tunings comunitarios orientados a escritura creativa sin restricciones, pero esto no está documentado en la model card. La contribución de mradermacher se limita a la conversión a GGUF con cuantizaciones estáticas k-quants e i-quants, sin alterar los pesos del modelo base.

## Capacidades

- Generación de texto creativo: narrativa, storytelling y prosa de larga extensión, según los tags del modelo.
- Roleplay y roleplay de personajes (character-rp): conversaciones sostenidas interpretando personajes.
- Conversación general con estilo orientado a ficción y escritura sin filtros.
- Bajo nivel de rechazos (low-refusal): el modelo está fusionado para minimizar las negativas del asistente, incluido contenido para adultos (nsfw) y temáticas oscuras (dark).
- Idioma principal: inglés; no se declara soporte multilingüe.
- No hay información disponible sobre capacidades de razonamiento formal, matemáticas, visión, audio, tool calling, function calling ni soporte de agentes.

## Casos de uso

- Roleplay interactivo de personajes: el modelo puede encarnar personajes en conversaciones multi-turno en clientes como SillyTavern, LM Studio o koboldcpp, gracias a su perfil character-rp y low-refusal.
- Escritura de ficción oscura: generación de novelas, relatos o escenas con temática adulta o violenta donde otros modelos alineados se niegan a continuar.
- Narrativa colaborativa: el usuario dirige la trama y el modelo genera continuaciones coherentes en sesiones largas de storytelling.
- Asistente de escritura creativa: brainstorming de tramas, desarrollo de personajes y diálogos para guiones o novelas.
- Chatbots de personaje para proyectos personales: despliegue local de un bot conversacional con personalidad definida, sin depender de APIs externas.
- Experimentación con merges: dado que es un merge comunitario untied, sirve como base de estudio para quienes investigan técnicas de fusión de modelos sobre Gemma.
- Prototipado local sin censura: evaluación de comportamientos low-refusal en entornos controlados y con audiencia adulta.

No es un modelo adecuado para asistentes de productividad, generación de código, atención al cliente ni tareas de razonamiento estructurado: no hay evidencia de que esté optimizado para ello.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un merge orientado a escritura creativa y roleplay, la evaluación habitual de estos modelos se realiza mediante arenas de preferencia humana (como EQ-Bench o arenas de roleplay), pero no hay datos concretos en la model card ni en la información proporcionada.

## Requisitos de hardware

Los requisitos dependen directamente de la cuantización elegida (tamaños de archivo publicados en la model card; a estos hay que sumar la memoria para el KV cache, que crece con el contexto):

- Q2_K (12,5 GB): cabe en GPUs de consumo de 16 GB (RTX 4060 Ti 16GB, RTX 4080) o parcialmente offloaded en 12 GB.
- Q3_K_S / Q3_K_M / Q3_K_L (14,5-17,3 GB): GPUs de 16-24 GB.
- IQ4_XS (17,7 GB) y Q4_K_S / Q4_K_M (18,7-19,6 GB): RTX 3090, RTX 4090 (24 GB) con contexto moderado; es el rango recomendado por el autor por equilibrio calidad/velocidad.
- Q5_K_S / Q5_K_M (22,4-22,9 GB): RTX 3090/4090 ajustadas, o Mac con 32 GB de memoria unificada.
- Q6_K (26,5 GB): RTX 5090 (32 GB), A100 40GB o Mac de 32-36 GB.
- Q8_0 (34,2 GB): A100 40GB, H100, RTX 5090 con offload o Mac Studio de 48+ GB.
- En CPU con RAM suficiente (16-64 GB según quant), funciona vía llama.cpp u Ollama con velocidades de unos pocos tokens/segundo en hardware de escritorio moderno.

Runtimes compatibles: llama.cpp, Ollama, LM Studio, koboldcpp, text-generation-webui y cualquier backend GGUF. No se publican cifras de latencia ni throughput concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Orientacion | Licencia |
|---|---|---|---|---|
| Gemma-4-Dark-Orthia-Untied-31B (este) | ~31B | GGUF (estaticos e imatrix) | Roleplay, escritura creativa, low-refusal | apache-2.0 |
| Mistral-Small-24B-Instruct (variantes finetuned) | ~24B | safetensors, GGUF | Uso general, con finetunings RP comunitarios | apache-2.0 |
| Qwen3-32B | ~32B | safetensors, GGUF | Razonamiento, codigo, uso general | apache-2.0 |
| Gemma 3 27B (base de Google) | ~27B | safetensors, GGUF | Uso general, multimodal | Licencia Gemma (restricciones de uso) |

Frente a alternativas de tamaño similar, este modelo se diferencia por su especialización en roleplay y escritura sin filtros, frente a Qwen3-32B (orientado a razonamiento y código) o el Gemma 3 27B oficial (uso general con alineación estándar y licencia Gemma, más restrictiva que apache-2.0). Su ventaja práctica es la licencia apache-2.0 del merge y la amplia disponibilidad de cuantizaciones; su inconveniente es la falta de datos de benchmarks y su enfoque narrow.

## Limitaciones y advertencias

- Contenido para adultos y temáticas oscuras: el repositorio está marcado "not-for-all-audiences"; su uso debe restringirse a audiencias adultas y a contextos donde este contenido sea legal y apropiado.
- Bajo nivel de rechazos: la ausencia de filtros implica un riesgo elevado de generar contenido ofensivo, dañino o inapropiado; no debe desplegarse en producción orientada a usuarios finales sin salvaguardas adicionales.
- Alucinaciones: al ser un merge orientado a ficción, no está alineado para factualidad; esperaría alta tasa de invención de datos en tareas informativas.
- Idioma: solo declara soporte de inglés; el rendimiento en castellano no está documentado y probablemente sea inferior o inconsistente.
- Longitud de contexto: no disponible en la información proporcionada; debe verificarse en la config del modelo base antes de planificar sesiones largas.
- Sin datos de benchmarks: no hay evidencia cuantitativa de capacidades de razonamiento, código o matemáticas.
- Licencia: apache-2.0 es permisiva y permite uso comercial, pero el contenido generado puede estar sujeto a la normativa aplicable; los términos de la licencia de Gemma original de Google pueden ser relevantes según la procedencia de los componentes del merge.
- Calidad de cuantización: las quants Q2_K y Q3_K_M degradan notablemente la calidad; el autor recomienda Q4_K_S/Q4_K_M como punto de equilibrio y ofrece quants imatrix de mayor calidad en el repositorio hermano.

## Enlaces

- Repositorio GGUF estáticos: https://huggingface.co/mradermacher/Gemma-4-Dark-Orthia-Untied-31B-GGUF
- Repositorio GGUF weighted/imatrix: https://huggingface.co/mradermacher/Gemma-4-Dark-Orthia-Untied-31B-i1-GGUF
- Modelo base: https://huggingface.co/Nimbz/Gemma-4-Dark-Orthia-Untied-31B
- Página de descargas de mradermacher: https://hf.tst.eu/model#Gemma-4-Dark-Orthia-Untied-31B-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Notas sobre calidad de quants (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Empresa del cuantizador: https://www.nethype.de/
