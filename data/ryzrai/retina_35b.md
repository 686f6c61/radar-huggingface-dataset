# ryzrAI/Retina_35B

## Resumen

Retina 35B es un modelo de mezcla de expertos (MoE) desarrollado por Virtual Eyes, distribuido en Hugging Face por el usuario ryzrAI. Está especializado en ciberseguridad y diseñado para soportar flujos de trabajo agénticos de largo horizonte, es decir, tareas que requieren múltiples pasos de razonamiento y ejecución de herramientas a lo largo de muchas iteraciones. El modelo se publica exclusivamente en formato GGUF cuantizado Q4_K_M para su uso con llama.cpp, lo que facilita su despliegue en entornos locales y servidores autoalojados.

La arquitectura declarada es A3B MoE, con 35.505.251.456 parámetros totales según los pesos en safetensors y una ventana de contexto nativa de 262.144 tokens. El autor indica que la arquitectura subyacente sigue las directrices de Qwen3.5-35B-A3B, si bien este GGUF concreto no incluye escalado YaRN y no ha sido validado en la longitud extendida de 1.010.000 tokens que dicha arquitectura permite. La relevancia actual del modelo radica en su orientación a seguridad y automatización agéntica con contexto muy largo, aunque su adopción es todavía incipiente: no registra descargas ni interacciones en el momento de redactar esta ficha.

La información pública disponible es escasa. La model card se limita a describir el archivo GGUF, los parámetros recomendados de inferencia y un ejemplo de petición a la API compatible con OpenAI de llama-server. No se detallan datos de entrenamiento, licencia, idiomas soportados ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) A3B, basada en las directrices de Qwen3.5-35B-A3B |
| Parametros totales | 35.505.251.456 (35,5 mil millones) |
| Parametros activos | no disponible (la nomenclatura A3B sugiere aproximadamente 3 mil millones activos, sin confirmación oficial) |
| Longitud de contexto | 262.144 tokens nativos; la arquitectura de referencia permite hasta 1.010.000 con escalado YaRN, no validado en este GGUF |
| Tipos de cuantizacion | Q4_K_M (única disponible en el repositorio) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (archivo `Retina-35B-Q4_K_M.gguf`) |

## Arquitectura y entrenamiento

Retina 35B emplea una arquitectura de mezcla de expertos con 35,5 mil millones de parámetros totales. El autor la describe como A3B, siguiendo la guía de arquitectura de Qwen3.5-35B-A3B, lo que implica un diseño transformer con capas MoE en las que solo se activa un subconjunto de parámetros por token. No se especifican el número exacto de expertos, la proporción de activación, el número de capas ni otras características estructurales internas.

No hay información pública sobre el volumen de tokens de entrenamiento, la composición del dataset, el uso de RLHF, DPO u otras técnicas de alineación, ni sobre innovaciones técnicas como decodificación especulativa o atención lineal. Tampoco se documenta el proceso de especialización en ciberseguridad ni qué datos o metodología se emplearon para ello. La model card únicamente confirma que el modelo fue evaluado con decodificación greedy (temperatura 0,0) en los experimentos reportados por el autor.

## Capacidades

- Generación de texto conversacional con plantilla de chat Jinja, servida mediante el endpoint `/v1/chat/completions` compatible con la API de OpenAI.
- Razonamiento agéntico de largo horizonte, según la descripción del autor, orientado a tareas que encadenan múltiples pasos.
- Especialización declarada en ciberseguridad, sin detalle sobre las tareas concretas cubiertas (análisis de vulnerabilidades, respuesta a incidentes, etc.).
- Soporte de contexto largo de hasta 262.144 tokens, suficiente para analizar repositorios de código, registros extensos o documentación técnica voluminosa.
- Capacidades multimodales potenciales: el autor indica que puede cargarse un proyector multimodal compatible mediante `--mmproj`, aunque dicho proyector no se incluye en el repositorio y no se confirma el soporte de visión.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible.

## Casos de uso

- Análisis de registros de seguridad: el modelo puede procesar volúmenes extensos de logs y eventos de red dentro de su ventana de 262.144 tokens para identificar patrones anómalos o indicios de intrusión, aunque no se documenta su precisión en esta tarea.
- Revisión de código en busca de vulnerabilidades: con contexto largo puede ingerir módulos completos o varios archivos de un repositorio y señalar prácticas inseguras, siempre que se valide su calidad con pruebas propias dado que no hay benchmarks publicados.
- Automatización de respuesta a incidentes: su orientación a flujos agénticos permite encadenar pasos de triaje, recopilación de evidencias y generación de informes, integrándose mediante la API de llama-server.
- Asistente conversacional autoalojado: el despliegue con llama.cpp y la API compatible con OpenAI facilitan integrarlo en aplicaciones internas donde los datos no pueden salir de la infraestructura.
- Procesamiento de documentación técnica extensa: resúmenes y consultas sobre manuales, políticas de seguridad o normativas que superan la ventana de modelos convencionales.
- Análisis de conversaciones multi-turno con memoria larga: atención al cliente o soporte técnico donde el historial completo cabe en el contexto sin truncamiento.
- Prototipado de agentes con herramientas: aunque el soporte de tool calling no está confirmado, la plantilla Jinja y el endpoint de chat permiten experimentar con orquestación externa de herramientas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El repositorio ocupa 21,7 GB, correspondientes al archivo GGUF cuantizado Q4_K_M; se necesita al menos esa cantidad de memoria para cargar los pesos.
- La ventana nativa de 262.144 tokens exige memoria adicional considerable para la caché KV; el autor advierte explícitamente que el contexto completo requiere "mucha memoria" y recomienda reducir `num_ctx` si el modelo no carga o va lento.
- GPU recomendadas: no disponible. Por tamaño, el modelo no cabe en GPUs de consumo con 8-16 GB de VRAM en su configuración completa; sería necesario repartir capas entre GPU y CPU o usar hardware con 24 GB o más (RTX 4090, A100, H100), sin datos oficiales de rendimiento.
- Despliegue: llama.cpp mediante `llama-server` con `--ctx-size 262144`, `--jinja` y `--metrics`; también compatible con Ollama, que lee el archivo `params` del repositorio y fija `num_ctx` a 262.144, temperatura 0 y `num_predict` a 1.024.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Retina 35B | 35,5 mil millones (MoE A3B) | 262.144 tokens | no disponible | GGUF Q4_K_M | Especializado en ciberseguridad; sin benchmarks publicados |
| Qwen3.5-35B-A3B | 35 mil millones (MoE A3B) | hasta 1.010.000 con YaRN | no disponible en esta ficha | safetensors, GGUF | Arquitectura de referencia citada por el autor |
| Alternativas de ciberseguridad de tamaño similar | no disponible | no disponible | no disponible | no disponible | No se dispone de información verificada |

La comparación con Qwen3.5-35B-A3B es la única sustentada por la documentación, ya que el propio autor declara que Retina sigue esa arquitectura. No se dispone de datos de rendimiento comparativos.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada sobre MMLU, HumanEval, GSM8K ni métricas de ciberseguridad que permitan evaluar su calidad real.
- Licencia no especificada: no puede confirmarse si el uso comercial está permitido; es imprescindible contactar con el autor antes de cualquier despliegue en producción.
- Idiomas no documentados: se desconoce si el modelo funciona correctamente en castellano u otros idiomas distintos del inglés.
- Riesgo de alucinación inherente a los modelos generativos, agravado por la falta de evaluación independiente, especialmente crítico en un dominio como la ciberseguridad donde un falso positivo o negativo tiene consecuencias operativas.
- Contexto extendido no validado: el autor advierte que el GGUF no incluye escalado YaRN y que el modelo no ha sido probado a 1.010.000 tokens, por lo que usar longitudes superiores a 262.144 no está soportado.
- El proyector multimodal no se incluye en el repositorio; el soporte de visión queda sin confirmar.
- Soporte de tool calling no documentado, pese a la orientación agéntica declarada.
- Modelo sin tracción pública (0 descargas, 0 likes) y con un único archivo cuantizado, lo que limita la reproducibilidad y el soporte de la comunidad.
- El autor recomienda temperatura 0,0; no hay datos sobre el comportamiento con muestreo estocástico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ryzrAI/Retina_35B
- Arquitectura de referencia Qwen3.5-35B-A3B: https://huggingface.co/Qwen/Qwen3.5-35B-A3B
