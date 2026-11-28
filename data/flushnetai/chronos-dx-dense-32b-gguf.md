# FlushnetAI/Chronos-DX-Dense-32B-GGUF

## Resumen

Chronos-DX Dense 32B es un modelo de lenguaje denso de 32.085 millones de parámetros (32.085B) desarrollado por Flushnet AI y distribuido exclusivamente en formato GGUF cuantizado a Q3_K. Se presenta como un modelo para generación de texto local y aplicaciones de IA, con áreas de conocimiento declaradas que abarcan ingeniería de software, matemáticas, ciencia, negocios, redacción y humanidades. La información pública disponible es deliberadamente limitada: el autor declara que Chronos-DX emplea una arquitectura propietaria cuyos detalles internos no se han divulgado.

El aspecto más relevante técnicamente es que, al no existir el tipo de arquitectura nativo de Chronos-DX en llama.cpp, la exportación GGUF se ha adaptado al tipo de arquitectura `qwen2` y a un formato de tensores compatible. Esto permite ejecutar el modelo con llama.cpp y Ollama estándar, pero implica que la etiqueta `qwen2` que muestra Hugging Face es un identificador de compatibilidad del export, no una descripción de la arquitectura real del modelo.

El modelo es relevante para quien busque un LLM de 32B ejecutable localmente en hardware de consumo, pero la falta de transparencia sobre arquitectura, datos de entrenamiento, licencia e idiomas soportados limita seriamente su evaluación rigurosa y su uso en producción. No se han publicado benchmarks ni una model card técnica convencional.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Propietaria (Chronos-DX); export GGUF adaptado al tipo `qwen2` para compatibilidad con llama.cpp |
| Parámetros totales | 32.085.082.112 (32.085B) |
| Parámetros activos | ~32B (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q3_K (único artefacto publicado en el repositorio) |
| Idiomas soportados | no disponible (la model card menciona "contenido multilingüe y traducción" sin especificar idiomas) |
| Licencia | no disponible |
| Formato de pesos | GGUF (`Chronos-DX-Dense-32B-Q3_K.gguf`) |
| Tamaño del repositorio | 13,8 GB |
| Versiones | v1.0, v1.1 |
| Tokenizer | no disponible (se indica que para vLLM/Transformers se requiere un tokenizer compatible aparte) |

## Arquitectura y entrenamiento

Flushnet AI declara que Chronos-DX tiene "su propia arquitectura propietaria", sin desvelar si es un transformer denso convencional, una variante con atención lineal u otra familia. El dato confirmado es que es un modelo denso de 32.085B parámetros, es decir, todos los parámetros se activan en cada token generado. Para hacerlo ejecutable en llama.cpp, la exportación se ha mapeado al tipo de arquitectura `qwen2` y a un formato de tensores compatible, lo que sugiere un stack de atención y capas proyectadas compatible con ese esquema, pero no se detalla qué componentes difieren del mismo.

No se ha publicado información sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF, DPO u otras técnicas de alineación, ni innovaciones técnicas como decodificación especulativa o atención lineal. La model card únicamente enumera áreas de conocimiento (tecnología, campos cuantitativos, negocios, lenguaje e investigación/cultura) y ofrece servicios de entrenamiento, personalización, integración RAG y "reparación de modelos" bajo petición, lo que sugiere que el modelo puede adaptarse mediante encargo pero no documenta el proceso base.

## Capacidades

- Generación de texto conversacional en modo chat (pipeline `text-generation`, tag `conversational`).
- Razonamiento técnico en áreas declaradas: ingeniería de software, arquitectura de sistemas, infraestructura cloud, IA y ciencia de datos.
- Capacidades cuantitativas: matemáticas, lógica y materias científicas y técnicas.
- Redacción y comunicación, incluyendo contenido multilingüe y traducción (idiomas concretos no especificados).
- Conocimiento de negocio: estrategia, gestión, operaciones, economía y finanzas.
- Educación, historia y humanidades.
- Ejecución local con API compatible con OpenAI mediante `llama-server` (`/v1/chat/completions`).
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades especiales (modo thinking, visión, audio): no disponible (no documentado).

## Casos de uso

- Asistencia técnica local y privada: el modelo puede desplegarse con Ollama o llama.cpp en una máquina local y usarse como asistente de programación y arquitectura de sistemas sin enviar datos a la nube, lo que encaja con el enfoque "Local Private Secure" que promociona el autor.
- Chat de soporte en entornos aislados: al ejecutarse mediante `llama-server` con endpoint compatible con OpenAI, puede integrarse en aplicaciones internas de atención al cliente o helpdesk en redes sin acceso a internet.
- Generación y revisión de documentación técnica: adecuado para redactar y revisar documentación de software, guías de operaciones y material de formación técnica, dada su área de conocimiento declarada en ingeniería y cloud.
- Apoyo a tareas cuantitativas y analíticas: resolución de problemas de matemáticas, lógica y estadística en cuadernos de trabajo o pipelines internos, con la salvedad de que no hay benchmarks que respalden su precisión.
- Redacción y traducción de contenido: generación de textos de negocio y marketing y traducción de material multilingüe, siempre que se valide la calidad en los idiomas concretos de interés, ya que no se especifican idiomas soportados.
- Prototipado de aplicaciones de IA en local: servir como backend de un prototipo de chatbot o asistente mediante la API OpenAI-compatible de llama.cpp, evitando costes de API externa durante la fase de desarrollo.
- Formación y consultoría interna: respuestas sobre economía, gestión e historia para equipos que necesiten un asistente de conocimiento general ejecutado en su propia infraestructura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el artefacto Q3_K ocupa aproximadamente 13,8 GB en disco; en ejecución se necesita esa cantidad más el espacio para el contexto KV, por lo que se estima un mínimo práctico de ~16 GB de VRAM para contexto corto y más para contextos largos (la longitud de contexto no está documentada).
- GPU recomendadas: para un modelo denso de 32B en Q3_K, GPU de 24 GB (RTX 3090, RTX 4090) permiten cargar el modelo completo con margen limitado para contexto; A100 40/80 GB y H100 ofrecen holgura y mayor throughput.
- GPU de consumo: cabe en RTX 3090/4090 (24 GB) en Q3_K; en GPUs de 16 GB o menos requeriría descarga parcial a CPU (offloading) mediante llama.cpp, con caída de velocidad.
- Despliegue: Ollama (`ollama pull hf.co/FlushnetAI/Chronos-DX-Dense-32B-GGUF:Chronos-DX-Dense-32B-Q3_K.gguf`) y llama.cpp (`llama-cli`, `llama-server`) son las vías recomendadas y verificadas por el autor. vLLM y Transformers se describen como "condicionales" y no verificados para este artefacto de 32B; requieren tokenizer y configuración compatibles.
- Aplicaciones de escritorio: LM Studio y otros runtimes compatibles con GGUF pueden importar el archivo, con compatibilidad dependiente de versión y hardware.
- Latencia y throughput: no disponibles (no publicados).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización publicada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Chronos-DX Dense 32B | 32,085B denso | no disponible | Q3_K (GGUF) | no disponible | Hugging Face (GGUF), Ollama |
| Alternativas de ~32B denso de código abierto (p. ej. Qwen2.5-32B, Gemma 2 27B, Mistral Small 24B) | 24-32B | 32K-128K según modelo | múltiples (GGUF, safetensors, AWQ, etc.) | Apache 2.0 / licencias abiertas según modelo | Hugging Face, Ollama, vLLM, etc. |

No se dispone de datos de benchmarks de Chronos-DX que permitan una comparación cuantitativa con alternativas de su categoría. La comparación se limita a parámetros, formato y disponibilidad; en transparencia (arquitectura documentada, licencia, idiomas, contexto) y en variedad de cuantizaciones, las alternativas abiertas de ~24-32B ofrecen información pública considerablemente mayor.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; esto es un bloqueo para producción hasta aclararlo con el autor.
- Arquitectura propietaria y no documentada: no se conocen detalles de atención, contexto máximo ni tokenizer, lo que impide planificar con precisión memoria, latencia y límites de entrada.
- Longitud de contexto desconocida: no se puede garantizar el manejo de conversaciones o documentos largos.
- Idiomas no especificados: la afirmación de capacidades multilingües no viene acompañada de lista de idiomas ni de evaluaciones; el rendimiento en castellano es incierto.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad en MMLU, HumanEval, GSM8K ni otras tareas; el riesgo de alucinación y de errores en matemáticas o código no está caracterizado.
- Única cuantización Q3_K: la cuantización de 3 bits puede degradar la calidad frente a Q4/Q5; no hay artefactos de mayor precisión publicados.
- Compatibilidad frágil: el GGUF está adaptado al tipo `qwen2`; cargarlo en vLLM o Transformers no está verificado y requiere tokenizer y configuración compatibles no incluidas en el repositorio.
- Actualizaciones manuales: las copias locales no se actualizan solas; hay que repetir la descarga para obtener revisiones nuevas.
- Baja tracción comunitaria: 174 descargas y 0 likes en el momento de la consulta, sin documentación de sesgos ni de datos de entrenamiento.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/FlushnetAI/Chronos-DX-Dense-32B-GGUF
- Página del modelo en Flushnet: https://www.flushnet.net/ai/chronos-dx/
- Demo local privada en navegador: https://www.flushnet.net/chronos-secure/secure-webchat/
- Página de Ollama del proyecto: https://ollama.com/marcheseluciano/Chronos-DX-Dense-32B-GGUF
- Solicitud de entrenamiento y personalización: https://www.flushnet.net/chronos-dx-model-request/
- Sitio del autor: https://www.flushnet.net/
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Guía GGUF de vLLM: https://docs.vllm.ai/en/latest/features/quantization/gguf/
- Documentación GGUF de Transformers: https://huggingface.co/docs/transformers/main/quantization/gguf
- LM Studio: https://lmstudio.ai/
