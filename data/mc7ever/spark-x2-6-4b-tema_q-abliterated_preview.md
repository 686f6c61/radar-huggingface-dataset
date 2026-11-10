# MC7ever/Spark-X2.6-4B-Tema_Q-Abliterated_preview

## Resumen

Spark-X2.6-4B-Tema_Q-Abliterated_preview es una variante del modelo Spark-X2.6-4B, un LLM compacto de 4.112 millones de parámetros desarrollado por XHToken y orientado a despliegue en dispositivo (on-device). Esta versión concreta ha sido publicada por el usuario MC7ever y aplica sobre los pesos del modelo base la herramienta de abliteración Tema_Q-Abliterated v1.1.1 (algoritmo SCAPE), que elimina el comportamiento de rechazo mediante la ablación de una dirección de rechazo en los pesos, manteniendo una divergencia KL baja respecto al modelo original (0.0353).

El modelo base Spark-X2.6-4B es la evolución del Spark-X2.5-4B y conserva exactamente la misma arquitectura, logrando sus mejoras mediante un post-entrenamiento refinado. Según su model card, destaca en tareas de código, agentes, contexto largo, multilingüismo y razonamiento, con un rendimiento que iguala o supera a modelos de aproximadamente 9B parámetros en varios benchmarks. Incorpora un presupuesto de razonamiento configurable en tres niveles (none, low, high).

La relevancia de esta ficha radica en que combina dos aspectos poco habituales: un modelo base de pequeño tamaño pensado para inferencia en el borde y una modificación de pesos que elimina los rechazos. El resultado es un modelo conversacional con licencia Apache 2.0, soporte para inglés y chino, y compatibilidad con el ecosistema transformers, vLLM y conversión a llama.cpp, aunque con las advertencias de seguridad que implica la eliminación de salvaguardas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (arquitectura idéntica a Spark-X2.5-4B; detalles internos no disponibles) |
| Parametros totales | 4.112.079.360 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el modelo base se describe como de "long-context") |
| Tipos de cuantizacion | no disponible (compatible con conversión a llama.cpp y despliegue en vLLM) |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (transformers); conversión a GGUF posible vía llama.cpp |

## Arquitectura y entrenamiento

El modelo base Spark-X2.6-4B es un transformer decoder-only de 4.112 millones de parámetros que, según la model card, mantiene exactamente la misma arquitectura que Spark-X2.5-4B. Las mejoras de capacidad se atribuyen íntegramente a un post-entrenamiento mejorado, que según la documentación del autor refuerza las capacidades de código, uso de herramientas en flujos agénticos, planificación multi-paso, contexto largo, multilingüismo y razonamiento. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas concretas de RLHF o DPO.

La modificación que define esta publicación es la abliteración aplicada con Tema_Q-Abliterated v1.1.1, que utiliza el algoritmo SCAPE como objetivo surrogate para evaluar candidatos de búsqueda unas 49 veces más rápido que la evaluación por generación completa convencional. La herramienta busca, capa por capa, una dirección de ablación (direction_index por capa) y aplica pesos de ablación sobre las proyecciones attn.o_proj (max_weight 1.43, min_weight 1.43, kernel_shape flat) mientras deja mlp.down_proj con peso 0.0 (es decir, sin ablación efectiva en esa proyección). El resultado declarado es de 0 rechazos en 100 generaciones completas, con una divergencia KL de 0.0353 respecto al modelo base y una comprobación de colapso (collapse check) satisfactoria.

## Capacidades

- Generación de texto conversacional multi-turno en inglés y chino.
- Razonamiento con presupuesto de pensamiento configurable en tres niveles (none, low, high), heredado del modelo base, que permite equilibrar calidad, latencia y coste de inferencia.
- Capacidades de código y ingeniería de software reforzadas en el post-entrenamiento del modelo base.
- Flujos agénticos: uso complejo de herramientas, planificación multi-paso y ejecución de tareas encadenadas.
- Contexto largo, según las mejoras declaradas del modelo base.
- Capacidades matemáticas y de conocimiento general, evaluadas en los benchmarks del modelo base.
- Comportamiento sin rechazos: la abliteración elimina las respuestas de negativa del modelo base.
- Compatibilidad con transformers (requiere transformers==4.57.1 y trust_remote_code=True), vLLM y conversión a llama.cpp.

## Casos de uso

- Asistentes conversacionales en dispositivo: el modelo, con 4.112 millones de parámetros, está pensado para ejecutarse en hardware de borde; su licencia Apache 2.0 permite integrarlo en aplicaciones comerciales de escritorio o móviles sin restricciones de uso.
- Agentes autónomos con uso de herramientas: el modelo base fue post-entrenado específicamente para flujos agénticos con uso complejo de herramientas y planificación multi-paso, lo que permite construir pipelines de automatización de tareas con llamadas a APIs.
- Generación de código en asistentes de desarrollo: las mejoras declaradas en código e ingeniería de software lo hacen adecuado para autocompletado, explicación y refactorización dentro de IDE, con la ventaja de poder ejecutarse localmente sin enviar código a terceros.
- Procesamiento de documentos largos en inglés y chino: el soporte de contexto largo del modelo base permite resumir, extraer y responder preguntas sobre documentos extensos en ambos idiomas.
- Investigación sobre alineación y seguridad: al ser una variante abliterada con métricas documentadas (0/100 rechazos, KL 0.0353), resulta útil para estudiar el efecto de la ablación de direcciones de rechazo sobre el comportamiento y la calidad del modelo.
- Generación de contenido creativo sin restricciones de rechazo: para aplicaciones de ficción, guiones o narrativa donde el comportamiento de negativa del modelo base resulta un obstáculo, con la advertencia de que la ausencia de salvaguardas exige moderación externa.
- Despliegue en entornos con recursos limitados: la eficiencia de inferencia declarada, comparable o mejor que Qwen3.5-4B y Gemma-E4B según el autor, permite servir el modelo en GPUs de consumo o incluso en CPU tras conversión a GGUF.

## Benchmarks y rendimiento

La model card del modelo base incluye gráficas de benchmarks (agent, code, math, general y knowledge) frente a modelos on-device de tamaño similar, pero los valores numéricos no están disponibles en la información proporcionada. Los únicos datos cuantitativos publicados corresponden a la evaluación de la abliteración:

| Metrica | Valor |
|---|---|
| Rechazos (generación completa) | 0/100 |
| Divergencia KL respecto al modelo base | 0.0353 |
| Comprobación de colapso | OK |

No se han publicado resultados numéricos de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 8,2 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomienda una GPU con 12-16 GB.
- Cuantización a 8 bits: en torno a 4-5 GB de pesos, viable en GPUs de consumo con 8 GB.
- Cuantización a 4 bits (GGUF Q4): en torno a 2,5-3 GB, cabe en GPUs de consumo de gama media (RTX 3060 12 GB, RTX 4060 Ti 16 GB) y en muchas GPUs de 8 GB.
- GPU recomendadas para producción: A100, H100 o L40S para servir en BF16 con concurrencia; RTX 4090 para desarrollo y despliegue de un solo usuario.
- El modelo base está diseñado explícitamente para inferencia on-device, por lo que también es viable en CPU tras conversión a GGUF.
- Opciones de despliegue: transformers (versión 4.57.1, con trust_remote_code=True), vLLM y llama.cpp (conversión a GGUF).
- Latencia y throughput estimados: no disponibles en la información proporcionada; el autor afirma una eficiencia de inferencia comparable o mejor que Qwen3.5-4B y Gemma-E4B, sin cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Spark-X2.6-4B-Tema_Q-Abliterated_preview | 4,11B | no disponible | Apache 2.0 | Variante abliterada, 0/100 rechazos, KL 0.0353 |
| Spark-X2.6-4B (base) | 4,11B | no disponible | Apache 2.0 | Modelo original con salvaguardas |
| Qwen3.5-4B | no disponible | no disponible | no disponible | Referencia de eficiencia citada por el autor |
| Gemma-E4B | no disponible | no disponible | no disponible | Referencia de eficiencia citada por el autor |

El autor sitúa a Spark-X2.6-4B a la altura o por encima de modelos de aproximadamente 9B parámetros en varios benchmarks y con eficiencia de inferencia comparable a Qwen3.5-4B y Gemma-E4B. No se dispone de cifras detalladas para una comparación cuantitativa más precisa.

## Limitaciones y advertencias

- La abliteración elimina el comportamiento de rechazo: el modelo responderá a solicitudes que el modelo base rechazaría, lo que exige moderación externa en cualquier despliegue de producción.
- Riesgo de alucinación inherente a un modelo de 4B parámetros; no se han publicado evaluaciones de factualidad en la información disponible.
- El proceso de ablación puede degradar sutilmente la calidad en algunas áreas; el autor reporta una KL de 0.0353 y comprobación de colapso superada, pero no se detallan evaluaciones exhaustivas de regresión.
- Idiomas limitados a inglés y chino; el rendimiento en castellano no está documentado.
- Longitud de contexto no especificada en la información disponible, aunque el modelo base se describe como de contexto largo.
- Licencia Apache 2.0 permite uso comercial, pero el publicador de esta variante (MC7ever) no es el desarrollador original (XHToken); conviene verificar la procedencia de los pesos.
- Requiere trust_remote_code=True y una versión concreta de transformers (4.57.1), lo que añade riesgo de compatibilidad en entornos gestionados.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: no hay validación comunitaria independiente de su comportamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MC7ever/Spark-X2.6-4B-Tema_Q-Abliterated_preview
- Modelo base: https://huggingface.co/XHToken/Spark-X2.6-4B
- Herramienta de abliteración Tema_Q-Abliterated: https://github.com/ek15072809/Tema_Q-Abliterated
- Slack de SparkLLM: https://join.slack.com/t/tokenspark/shared_invite/zt-432qf8l2f-5~dLyXv8uETr0P0UuC07nw
- Discord de SparkLLM: https://discord.gg/kTDE2Hg8aw
- YouTube de SparkLLM: https://www.youtube.com/@SparkLLM
- dev.to de SparkLLM: https://dev.to/sparkllm
- Bluesky de SparkLLM: https://bsky.app/profile/sparkllm.bsky.social
- X de SparkLLM: https://x.com/sparkllm
- Zhihu de SparkLLM: https://www.zhihu.com/people/zhiikz7qh7m
