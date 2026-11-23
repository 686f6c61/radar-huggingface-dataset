# akal-lm/Akal-1B-GGUF

## Resumen

Akal-1B es una cuantización GGUF optimizada del modelo Gemma-3-1B-IT de Google DeepMind, desarrollada por Muhammad Luqni Baehaqi bajo la organización Akal LM Initiative. Su objetivo es ofrecer inferencia de un LLM conversacional en hardware de bajos recursos sin GPU dedicada, como portátiles de empresa, mini-PC industriales, terminales punto de venta o pasarelas IoT. El modelo parte de los 999.885.952 parámetros del Gemma-3-1B-IT original y se distribuye en formato GGUF Q4_K_M con un peso aproximado de 762 MB.

La innovación principal es el uso de una matriz de importancia (imatrix) específica para indonesio durante la cuantización, lo que según el autor permite preservar mejor la fidelidad conversacional y de razonamiento en ese idioma. Se distribuye junto a un ecosistema de modelos complementarios para RAG y decodificación especulativa: Akal-Embed-GGUF, Akal-Rerank-GGUF y Akal-Nano-270M-GGUF.

El modelo está orientado explícitamente a entornos de borde con CPU, con objetivos declarados de menos de 300 ms hasta el primer token y entre 21 y 28 tokens por segundo en CPUs de portátiles y mini-PC convencionales. Soporta indonesio e inglés, y su licencia es la Gemma de Google, con las restricciones que ello implica para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3), cuantizado a GGUF |
| Parametros totales | 999.885.952 (1,00B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q4_K_M (cuantizacion principal publicada); otras variantes no disponibles |
| Idiomas soportados | indonesio (id), ingles (en) |
| Licencia | Gemma (Google) |
| Formato de pesos | GGUF (llama.cpp) |
| Tamano del repo | 7,3 GB |
| Tamano del modelo cuantizado | ~762 MB (Q4_K_M) |
| Modelo base | google/gemma-3-1b-it |
| Libreria | gguf |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

Akal-1B no es un modelo entrenado desde cero, sino una cuantización del Gemma-3-1B-IT de Google. La arquitectura subyacente es la de Gemma 3 en su variante de 1B parámetros, un transformer decoder-only con atención multi-cabeza estándar. El proceso de compresión aplicado es una cuantización de bloques a Q4_K_M mediante llama.cpp, guiada por una importance matrix (imatrix) construida específicamente sobre corpus en indonesio. El autor afirma que esta imatrix permite preservar la fidelidad conversacional y de razonamiento en indonesio mejor que una cuantización genérica, y que el resultado ofrece hasta un 300% más de throughput y un 70% menos de huella de RAM frente a runtimes comunitarios no vectorizados.

No se dispone de información sobre el volumen de tokens de entrenamiento original de Gemma-3-1B-IT, la composición del dataset ni si hubo fases de RLHF o DPO, más allá de lo que publique la documentación oficial de Google para el modelo base. Tampoco se detalla en la información proporcionada el proceso exacto de construcción de la imatrix (tamaño del corpus, composición, metodología de ponderación). El autor publica dos preprints académicos (Vol. 1 sobre el LLM de borde y Vol. 3 sobre cirugía en el espacio de pesos, decodificación especulativa y reranking) que presumiblemente contienen estos detalles, pero su contenido no está disponible en la información consultada.

## Capacidades

- Generación de texto conversacional en indonesio e inglés, con corrección gramatical y reformulación de registro informal a formal.
- Razonamiento básico y respuesta a preguntas de conocimiento general, limitado por su tamaño de 1B parámetros.
- Resumen y pulido de textos cortos: memorandos, correos, notas de campo.
- Clasificación de texto y extracción de entidades estructuradas (nombres, identificadores de pedido, esquemas JSON simples).
- Enrutamiento de intenciones en sistemas de atención al cliente o microservicios.
- Integración en pipelines RAG locales junto a modelos de embedding y reranking del mismo autor (Akal-Embed, Akal-Rerank).
- Escritura de scripts cortos (menos de 30 líneas según el autor) y explicación de sintaxis de programación básica.
- Compatibilidad con endpoints (tag `endpoints_compatible` en Hugging Face).
- Decodificación especulativa mediante el modelo borrador Akal-Nano-270M-GGUF del mismo ecosistema.
- No se documenta soporte explícito de tool calling, function calling ni modo de razonamiento extendido (thinking mode) en la información disponible.

## Casos de uso

- Asistentes de borde sin conexión: el modelo se ejecuta íntegramente en CPU con menos de 950 MB de RAM, lo que permite desplegarlo en terminales de fábrica, quioscos de venta o sistemas de inventario de almacén sin conectividad fiable a internet.
- RAG local sobre documentación interna: combinado con Akal-Embed (119 MB) y Akal-Rerank, permite responder preguntas sobre procedimientos operativos, manuales internos o catálogos de producto sin enviar datos a la nube, lo que facilita el cumplimiento de normativas de privacidad.
- Clasificación y enrutamiento de tickets de soporte: el modelo puede clasificar consultas entrantes y dirigirlas al microservicio o cola correspondiente, con la ventaja de ejecutarse en la misma máquina que el backend sin coste de API.
- Extracción de entidades en formularios y pedidos: conversión de texto libre en JSON estructurado con nombres, identificadores y campos simples, adecuado para digitalización de documentación en pymes.
- Corrección y formalización de textos en indonesio: normalización de comunicaciones internas, notas de campo y correos hacia un registro más formal, aprovechando la imatrix específica de ese idioma.
- Agentes de voz interactivos de baja latencia: con objetivos de menos de 300 ms hasta el primer token y 21-28 tokens/s en CPU, puede servir como backend conversacional de altavoces inteligentes o sistemas de atención telefónica local.
- Resumen de actas y memorandos en entornos de oficina: condensación de documentos cortos directamente en el portátil del empleado, sin depender de servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor menciona en la model card comparaciones empíricas frente a Sahabat-AI 8B/9B, SEA-LION v3 8B, Merak-7B, Meta Llama-3.2-1B y Alibaba Qwen2.5-1.5B, y remite al preprint Akal_Edge_LLM_Research_Paper.pdf para los datos, pero las cifras concretas no están incluidas en la información proporcionada. Los únicos datos de rendimiento declarados son los objetivos de inferencia en CPU: menos de 300 ms de TTFT y 21-28 tokens/s.

## Requisitos de hardware

- RAM estimada para inferencia: menos de 950 MB con la cuantización Q4_K_M publicada (~762 MB de pesos).
- VRAM: no requiere GPU; el modelo está diseñado para inferencia exclusiva en CPU.
- GPU recomendadas: no aplica; cualquier GPU con suficiente VRAM podría ejecutarlo, pero no es el objetivo del proyecto.
- Cabe en cualquier portátil, mini-PC o dispositivo de borde con al menos 1 GB de RAM disponible.
- Opciones de despliegue: llama.cpp como runtime principal; al estar en formato GGUF es compatible con Ollama y otros frontends basados en llama.cpp. No se documenta soporte de vLLM ni TGI en la información disponible.
- Latencia y throughput declarados por el autor: TTFT inferior a 300 ms y 21-28 tokens/s en CPUs de portátiles y mini-PC convencionales, con hasta un 300% más de throughput que runtimes comunitarios no vectorizados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Akal-1B-GGUF | 1,00B | no disponible | id, en | Gemma | GGUF Q4_K_M | Cuantización con imatrix en indonesio, orientado a CPU |
| google/gemma-3-1b-it | 1,00B | no disponible | multilingue | Gemma | safetensors | Modelo base original; requiere más recursos y no está optimizado para CPU |
| Meta Llama-3.2-1B | 1,2B | no disponible | multilingue | Llama 3.2 | safetensors, GGUF | Alternativa de tamaño similar citada por el autor; sin imatrix específica de indonesio |
| Alibaba Qwen2.5-1.5B | 1,5B | no disponible | multilingue | Apache 2.0 | safetensors, GGUF | Alternativa algo mayor citada por el autor; licencia más permisiva |

No se dispone de datos de rendimiento comparativo en la información proporcionada para establecer diferencias cuantitativas entre estos modelos.

## Limitaciones y advertencias

- Con 1B parámetros, el conocimiento paramétrico del mundo es limitado; sin RAG es propenso a respuestas imprecisas o desactualizadas en preguntas de cultura general.
- No es adecuado para ingeniería de software autónoma multiarchivo, refactorización de repositorios ni depuración de lógica asíncrona compleja.
- No es apto para razonamiento matemático de varios pasos, pruebas formales ni lógica simbólica profunda sin herramientas externas de cálculo.
- Riesgo de alucinación inherente a modelos de este tamaño, especialmente fuera de los dominios cubiertos por la imatrix (indonesio) o sin contexto RAG.
- La imatrix está optimizada para indonesio; el rendimiento en inglés puede degradarse más que en una cuantización genérica, aunque no se aportan datos que lo confirmen.
- Licencia Gemma de Google: impone restricciones de uso comercial y obligaciones de atribución; conviene revisar los términos completos antes de un despliegue en producción.
- La longitud de contexto no está documentada en la información disponible, lo que dificulta planificar conversaciones multi-turno largas o RAG con muchos fragmentos.
- No se documenta soporte de tool calling ni function calling, lo que limita su uso en pipelines de agentes que requieran invocación estructurada de herramientas.
- El repo ocupa 7,3 GB, probablemente por incluir múltiples cuantizaciones y los preprints; conviene descargar solo el archivo Q4_K_M necesario.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/akal-lm/Akal-1B-GGUF
- Modelo base: https://huggingface.co/google/gemma-3-1b-it
- Modelo de embedding complementario: https://huggingface.co/akal-lm/Akal-Embed-GGUF
- Reranker complementario: https://huggingface.co/akal-lm/Akal-Rerank-GGUF
- Modelo borrador para decodificación especulativa: https://huggingface.co/akal-lm/Akal-Nano-270M-GGUF
- Preprint Vol. 1 (Edge LLM): https://huggingface.co/akal-lm/Akal-1B-GGUF/resolve/main/Akal_Edge_LLM_Research_Paper.pdf
- Preprint Vol. 3 (arquitectura y decodificación especulativa): https://huggingface.co/akal-lm/Akal-1B-GGUF/resolve/main/Akal_Vol3_Architecture_Research_Paper.pdf
- Repositorio llama.cpp: https://github.com/ggml-org/llama.cpp
- Perfil del autor: https://huggingface.co/luqni
