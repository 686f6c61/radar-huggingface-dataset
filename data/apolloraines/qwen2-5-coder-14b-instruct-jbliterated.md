# ApolloRaines/Qwen2.5-Coder-14B-Instruct-Jbliterated

## Resumen

Qwen2.5-Coder-14B-Instruct-Jbliterated es una variante modificada del modelo Qwen2.5-Coder-14B-Instruct de Alibaba Qwen, publicada por el usuario ApolloRaines bajo el marco que el autor denomina "jBlaze precision neural surgery" o "jbliteration". El objetivo declarado es eliminar el comportamiento de rechazo (refusal) mediante cirugía directa de pesos, sin entrenamiento por gradientes ni parches en tiempo de inferencia. El modelo conserva la arquitectura y el conocimiento del modelo base, pero los pesos ya no codifican la disposición aprendida a rechazar peticiones.

El modelo base es un transformer decoder-only de 14.770.033.664 parámetros (aproximadamente 14,8 mil millones), especializado en generación de código y conversación técnica, con licencia Apache 2.0. Esta variante mantiene esa licencia y se distribuye en formatos safetensors y GGUF, lo que facilita su despliegue tanto con transformers como con llama.cpp u Ollama.

La relevancia de esta ficha es doble: por un lado, documenta un modelo de código de tamano medio con contexto largo y buen rendimiento en tareas de programación; por otro, ilustra una técnica controvertida de modificación de pesos orientada a seguridad ofensiva y análisis defensivo, cuyas implicaciones éticas y de uso deben evaluarse con cuidado antes de cualquier despliegue en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2.5), basada en Qwen/Qwen2.5-Coder-14B-Instruct |
| Parametros totales | 14.770.033.664 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-Coder-14B-Instruct soporta 32.768 tokens nativos y hasta 131.072 con RoPE scaling, segun la documentacion de Qwen; no confirmado para esta variante) |
| Tipos de cuantizacion | safetensors en precision completa (fp16/bf16 segun el repo); GGUF disponible en el repositorio (niveles concretos no especificados) |
| Idiomas soportados | en (ingles declarado en la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

La arquitectura corresponde integramente al modelo base Qwen2.5-Coder-14B-Instruct: un transformer decoder-only con atención por causalidad, normalización RMSNorm, activación SwiGLU y embeddings rotatorios (RoPE). No se ha realizado ningún entrenamiento adicional sobre esta variante; la modificación consiste exclusivamente en una intervención sobre los pesos ("weight surgery") que busca identificar y neutralizar la dirección latente asociada al comportamiento de rechazo. El autor afirma que el método "jbliteration" es una versión de precisión de la abliteración estándar, diseñada para preservar las capacidades del modelo en lugar de degradarlas de forma colateral.

No se dispone de información sobre el número de tokens de entrenamiento del modelo base, la composición del dataset, ni si hubo fases de RLHF o DPO en su construcción original dentro de la información proporcionada. El autor menciona que el pipeline ha sido actualizado y que este modelo será re-procesado con la versión mejorada, lo que sugiere que la intervención actual puede no ser la definitiva. Tampoco se documentan innovaciones de inferencia como decodificación especulativa o atención lineal; el modelo hereda las características estándar de la familia Qwen2.5.

## Capacidades

- Generación de texto y código en inglés, con especial énfasis en lenguajes de programación y tareas de ingeniería de software.
- Razonamiento técnico y resolución de problemas de programación, incluyendo depuración y explicación de código.
- Conversación multi-turno con mantenimiento de contexto (longitud exacta no confirmada para esta variante).
- Generación de código para múltiples lenguajes, aunque la model card no detalla la lista exacta.
- Capacidad de análisis de código potencialmente malicioso o "hostil", que es el caso de uso declarado por el autor para justificar la eliminación del rechazo.
- No se documenta soporte explícito de tool calling, function calling ni modo agente en la información disponible, aunque el modelo base Qwen2.5-Coder-Instruct sí lo soporta; no confirmado para esta variante.
- No se documentan capacidades de visión, audio ni modo "thinking" explícito.

## Casos de uso

- Análisis defensivo de malware: el modelo puede leer y explicar código malicioso sin activar rechazos, lo que permite a equipos de respuesta a incidentes reconstruir cadenas de ataque y entender el comportamiento de muestras sospechosas.
- Revisión de código en pipelines de CI/CD: integrado como paso de revisión automatizada, puede detectar patrones inseguros, malas prácticas y vulnerabilidades en pull requests, aprovechando su especialización en código.
- Red teaming y pruebas de seguridad ofensiva: útil para generar y evaluar payloads de prueba en entornos controlados, así como para simular escenarios de ataque y validar defensas.
- Asistente de programación para desarrolladores: autocompletado, generación de tests unitarios, refactorización y explicación de fragmentos de código complejos en inglés.
- Documentación técnica automatizada: generación de comentarios, docstrings y documentación de API a partir del código fuente, con capacidad de manejar repositorios grandes si el contexto lo permite.
- Investigación en alineación y seguridad de IA: el modelo sirve como caso de estudio para analizar cómo se codifica el rechazo en los pesos y qué coste tiene su eliminación, útil para quienes investigan técnicas de edición de modelos.
- Formación y concienciación en ciberseguridad: en entornos educativos controlados, permite mostrar ejemplos reales de código malicioso y su análisis sin las interrupciones que imponen los guardarraíles comerciales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta variante en la información disponible. El autor menciona un dato de retención de capacidad medido en otro modelo de su colección (Sharona, Qwen3.5-27B), con MMLU de 77,89 % frente a 76,84 % del baseline, pero no aporta cifras para Qwen2.5-Coder-14B-Instruct-Jbliterated. No se inventan números.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 28-30 GB solo para los pesos, más overhead de activaciones y KV cache; se recomienda un mínimo de 32 GB de VRAM para contexto moderado.
- VRAM estimada en cuantización GGUF Q4_K_M: aproximadamente 9-10 GB, lo que permite ejecución en GPUs de consumo como RTX 3090, RTX 4080 o RTX 4090.
- VRAM estimada en cuantización GGUF Q8_0: aproximadamente 16-17 GB, viable en RTX 4090 (24 GB) o A100 40 GB.
- GPUs recomendadas para precisión completa: A100 40/80 GB, H100 80 GB, o múltiples GPUs consumer con device_map="auto".
- Cabe en GPU de consumo: sí, en cuantizaciones GGUF de 4 a 8 bits en RTX 3090/4080/4090; en fp16 no cabe en GPUs de 24 GB sin offloading.
- Opciones de despliegue: transformers (con device_map="auto"), llama.cpp, Ollama (si se publica la conversión correspondiente), vLLM y TGI (compatibilidad no confirmada explícitamente en la model card, pero el modelo base es compatible con estas herramientas).
- El autor promociona DeepswapLLM como alternativa para ejecutar el modelo en GPUs con VRAM insuficiente mediante streaming de capas; no se aportan cifras de latencia o throughput verificables.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen2.5-Coder-14B-Instruct-Jbliterated | 14,77 B | no disponible (base: 32K nativo) | Apache 2.0 | safetensors, GGUF | Variante sin rechazo, inglés, enfocada a seguridad ofensiva/defensiva |
| Qwen/Qwen2.5-Coder-14B-Instruct | 14,77 B | 32.768 tokens nativo (131.072 con RoPE scaling) | Apache 2.0 | safetensors, GGUF | Modelo base original, con alineación de seguridad estándar |
| DeepSeek-Coder-V2-Lite-Instruct | 15,7 B (2,4 B activos, MoE) | 128K | DeepSeek License | safetensors | Alternativa MoE con contexto muy largo y buen rendimiento en código |
| CodeLlama-13B-Instruct | 13 B | 16K | Llama 2 Community License | safetensors, GGUF | Modelo de código de Meta, licencia restrictiva para uso comercial |

La comparación con el modelo base es la más directa: esta variante modifica únicamente el comportamiento de rechazo, por lo que en tareas de código debería rendir de forma similar al original. Frente a DeepSeek-Coder-V2-Lite, este último ofrece mayor contexto y arquitectura MoE con menor coste de inferencia por token activo, pero con una licencia más restrictiva. CodeLlama-13B-Instruct queda por detrás en contexto y licencia.

## Limitaciones y advertencias

- La eliminación del rechazo puede facilitar usos dañinos: el propio autor reconoce que "estos pesos pueden hacer tanto bien como mal". No debe desplegarse en aplicaciones orientadas al público sin capas adicionales de moderación.
- El modelo está declarado únicamente en inglés; el rendimiento en castellano u otros idiomas no está garantizado y probablemente sea inferior al del modelo base.
- Riesgo de alucinación inherente a los modelos de 14 B, especialmente en tareas de razonamiento complejo o generación de código en lenguajes poco representados.
- La modificación de pesos puede degradar capacidades de forma no documentada; el autor no publica benchmarks específicos para esta variante, solo para otro modelo de su colección.
- El autor advierte que el modelo publicado es una "demo" a fuerza parcial y que será re-procesado con un pipeline mejorado; esto implica que la versión actual puede quedar obsoleta y que su comportamiento no es estable a largo plazo.
- La licencia Apache 2.0 permite uso comercial, pero el uso de un modelo sin rechazo en producción conlleva responsabilidad legal y ética sobre el contenido generado; se recomienda evaluar el cumplimiento normativo (por ejemplo, la AI Act europea) antes de desplegarlo.
- No se documentan sesgos específicos, pero al derivar de Qwen2.5-Coder-Instruct hereda los sesgos del corpus de entrenamiento original, no auditados en esta variante.
- La falta de soporte multilingüe declarado limita su uso en entornos hispanohablantes sin un ajuste adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ApolloRaines/Qwen2.5-Coder-14B-Instruct-Jbliterated
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-14B-Instruct
- Repositorio DeepswapLLM: https://github.com/apolloraines/DeepswapLLM
- Modelo relacionado (pipeline actualizado): https://huggingface.co/ApolloRaines/Llama-3.3-8B-Instruct-128K-Jbliterated
- Perfil del autor: https://www.linkedin.com/in/apollo-raines/
