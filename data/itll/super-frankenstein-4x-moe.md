# ITLL/SUPER.Frankenstein.4X.MoE

## Resumen

SUPER.Frankenstein.4X.MoE es un modelo de clasificación de secuencias publicado por ITLL en Hugging Face. No es un modelo generativo: es un clasificador encoder-only orientado a tareas de seguridad de LLM (detección de prompt injection, jailbreak y guardrails), enrutamiento semántico y clasificación de calidad de datos. Su nombre y su tarjeta describen una arquitectura de mezcla de expertos (MoE) en la que cuatro modelos completos se mantienen congelados y se conectan mediante adaptadores entrenables que proyectan sus representaciones a un espacio compartido de 512 dimensiones, con una compuerta top-k también entrenable.

El modelo se presenta como una alternativa ligera y desplegable en local (incluye pesos en safetensors y exportaciones ONNX/ONNX Runtime cuantizadas para inferencia en CPU y en dispositivo) para tareas de filtrado y moderación que normalmente se resuelven con clasificadores dedicados más pequeños o con llamadas a LLM generativos. Por su vocabulario de etiquetas (prompt-injection-detection, jailbreak-detection, guardrails, quality-classifier, data-curation) apunta a pipelines de seguridad de agentes, RAG y curación de datos de preentrenamiento.

La información pública disponible es muy escasa: la model card está truncada, no se declaran parámetros totales, longitud de contexto, licencia ni idiomas de forma explícita, y el repositorio ocupa 6,1 GB, coherente con el empaquetado de cuatro modelos completos. Cualquier dato no confirmado en la información proporcionada se marca como no disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE de cuatro expertos congelados (encoders tipo ModernBERT/mmBERT según etiquetas) unidos por adaptadores entrenables a un espacio compartido de 512 dimensiones y compuerta top-k entrenable |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (top-k no especificado) |
| Longitud de contexto | no disponible (etiqueta "long-context" presente, sin cifra) |
| Tipos de cuantización | no disponible (se mencionan exportaciones ONNX cuantizadas para CPU/on-device) |
| Idiomas soportados | no disponible (etiquetas "multilingual", "english", "german") |
| Licencia | no disponible |
| Formato de pesos | safetensors; exportaciones ONNX / ONNX Runtime |
| Tarea | sequence-classification / text-classification (binaria y zero-shot) |
| Tamaño del repositorio | 6,1 GB |
| Descargas / likes | 0 / 2 |

## Arquitectura y entrenamiento

La arquitectura descrita en la model card es un ensamblaje tipo "Frankenstein": cuatro modelos completos se conservan exactamente como se publicaron en el directorio `experts/` y permanecen congelados durante el entrenamiento. Sobre ellos se entrenan adaptadores que proyectan las salidas de cada experto a un espacio latente común de 512 dimensiones, más una compuerta top-k entrenable que decide qué expertos contribuyen a cada ejemplo. Es, por tanto, una MoE de fusión tardía con enrutamiento aprendido, no una MoE generativa con expertos FFN internos.

El autor no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo RLHF/DPO. La lista de datasets asociados es enorme y heterogénea: corpus web y científicos (fineweb, fineweb-2, finepdfs, peS2o, arxiv), código (github-code, commitpack, StackExchange), datos multilingües (HPLT2.0, sangraha, aya_dataset, sib200), datos de seguridad y jailbreak (wildjailbreak, wildguardmix, deepset/prompt-injections, hackaprompt, Lakera/gandalf_ignore_instructions, Nemotron-Safety-Guard) y datos de clasificación y enrutamiento (clinc_oos, banking77, amazon_massive, ag_news, dbpedia_14, tasksource/typed-decisions). Esta mezcla sugiere un entrenamiento multitarea orientado a clasificación, enrutamiento y moderación más que a generación. No se documentan innovaciones como decodificación especulativa ni atención lineal.

## Capacidades

- Clasificación de secuencias y clasificación binaria (por ejemplo, prompt injection sí/no).
- Clasificación zero-shot mediante etiquetas semánticas.
- Detección de prompt injection directa e indirecta, incluida la que llega vía herramientas o RAG.
- Detección de jailbreak y de intentos de elusión de guardrails.
- Enrutamiento semántico de consultas a dominios o intenciones (decision-model, routing).
- Clasificación de calidad de texto para curación de datos de preentrenamiento (quality-classifier, data-filtering).
- Capacidades multilingües declaradas por etiquetas (multilingual, english, german), sin lista cerrada de idiomas.
- Exportación ONNX/ONNX Runtime cuantizada para inferencia local en CPU y en dispositivo.
- No se documentan generación de texto libre, tool calling generativo, agentes multi-paso ni visión/audio.

## Casos de uso

- Guardrail de entrada en aplicaciones LLM: el clasificador evalúa cada prompt de usuario y bloquea o marca los que superan un umbral de probabilidad de inyección, antes de enviarlo al modelo generativo.
- Protección de agentes con herramientas: inspecciona las respuestas de herramientas y documentos recuperados para detectar prompt injection indirecta en flujos RAG o de function calling.
- Enrutamiento de consultas en un asistente multi-dominio: clasifica la intención o el dominio del mensaje (estilo clinc_oos/banking77) para dirigirlo al subagente o base de conocimiento adecuada.
- Moderación de contenido en foros y comentarios: clasificación binaria/multiclase de toxicidad y contenido inseguro usando los datos de civil_comments y wildguardmix del entrenamiento.
- Curación de datasets de preentrenamiento: filtrado de documentos por calidad y por riesgo de contaminación antes de incorporarlos a un corpus, aprovechando la faceta de quality-classifier.
- Detección de jailbreak en producción: capa de defensa en un gateway de API que puntúa cada petición y aplica políticas de bloqueo o revisión humana.
- Clasificación de tickets y correo: categorización automática de mensajes entrantes en un sistema de soporte, con la ventaja de poder ejecutarse en CPU sin GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Tamaño del repositorio: 6,1 GB, lo que sugiere pesos en fp32/fp16 de varios cientos de millones de parámetros por experto; el consumo real de VRAM depende de cuántos expertos se activen por consulta (top-k no documentado).
- Inferencia en CPU: viable según las etiquetas del autor (local-inference, on-device, cpu, onnxruntime, quantized), con las exportaciones ONNX cuantizadas.
- GPU: no se especifican modelos recomendados (A100, H100, RTX 4090). Al ser un encoder de clasificación, debería caber en GPUs de consumo, pero no hay cifras confirmadas.
- Despliegue: safetensors con Transformers; ONNX Runtime para CPU/edge; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI (son frameworks para modelos generativos).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye resultados de benchmarks ni comparaciones con otros clasificadores de prompt injection o guardrails (por ejemplo, ProtectAI, Meta Prompt Guard o Llama Guard), por lo que no es posible establecer una comparación rigurosa.

## Limitaciones y advertencias

- La model card está truncada y no declara licencia; no se puede confirmar el uso comercial ni las obligaciones de atribución de los cuatro expertos subyacentes. El autor advierte explícitamente de que hay que revisar la licencia de cada experto.
- No se publican parámetros, contexto, idiomas exactos ni umbrales de calibración, lo que dificulta evaluar su robustez en producción.
- Riesgo de falsos positivos y negativos en la detección de inyecciones: los clasificadores de seguridad son sensibles a ataques adversariales y a la distribución del dominio.
- El rendimiento multilingüe está declarado solo por etiquetas; no hay evaluación por idioma.
- Al ser un clasificador, no genera texto ni razona; no debe usarse como sustituto de un LLM en tareas generativas.
- El ensamblaje de cuatro expertos congelados implica mayor coste de memoria que un clasificador único del mismo rendimiento, sin datos que lo justifiquen.
- Repositorio con 0 descargas y 2 likes: sin validación comunitaria ni reportes independientes.

## Enlaces

- Hugging Face: https://huggingface.co/ITLL/SUPER.Frankenstein.4X.MoE
- No se han encontrado en la información proporcionada papers, blogs, repositorios de código ni demos adicionales.
