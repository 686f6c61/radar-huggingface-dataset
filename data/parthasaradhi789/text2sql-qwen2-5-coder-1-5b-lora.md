# parthasaradhi789/text2sql-qwen2.5-coder-1.5b-lora

## Resumen

El modelo `text2sql-qwen2.5-coder-1.5b-lora` es un ajuste fino supervisado (SFT) del modelo base `unsloth/Qwen2.5-Coder-1.5B-Instruct-bnb-4bit`, publicado por el usuario parthasaradhi789 en Hugging Face. Su nombre indica una especialización en la tarea de conversión de lenguaje natural a SQL (text-to-SQL), aunque la model card no documenta explícitamente el conjunto de datos de entrenamiento ni las métricas de evaluación obtenidas. El ajuste se ha realizado con TRL 0.22.2 sobre el stack de Transformers 4.57.6, PyTorch 2.14.1+cu130 y la librería Unsloth para entrenamiento eficiente en memoria.

El modelo hereda la arquitectura del Qwen2.5-Coder-1.5B-Instruct, un transformer decoder-only de 1.500 millones de parámetros desarrollado por Alibaba Cloud, con una ventana de contexto de 32.768 tokens y capacidades de generación de código. Al tratarse de un ajuste LoRA/QLoRA sobre una versión cuantizada en 4 bits (bnb-4bit), el repositorio ocupa 0,2 GB y está pensado para escenarios de generación SQL de bajo coste computacional, despliegue en GPU de consumo y prototipado rápido.

La relevancia de esta ficha es doble: por un lado, documenta un caso típico de especialización vertical de un modelo pequeño para una tarea concreta; por otro, sirve como advertencia sobre la escasez de información publicada (sin licencia explícita, sin idiomas declarados, sin benchmarks ni detalles del dataset), lo que limita seriamente su uso en producción sin una evaluación adicional por parte del integrador. El modelo tiene 0 descargas y 0 likes en el momento de la consulta, y se creó el 13 de noviembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-Coder), ajuste fino LoRA sobre base cuantizada bnb-4bit |
| Parametros totales | 1.500 millones (1.5B) en el modelo base; el adaptador LoRA añade un número no especificado de parámetros entrenables |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (heredada del Qwen2.5-Coder-1.5B-Instruct; no confirmada explícitamente en la model card) |
| Tipos de cuantizacion | Base en bnb-4bit (bitsandbytes 4 bits); el adaptador se publica en safetensors; no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card incluye el campo `licence: license` sin contenido) |
| Formato de pesos | safetensors (adaptador LoRA); el modelo base referenciado está en bnb-4bit |

## Arquitectura y entrenamiento

El modelo es un ajuste fino por SFT de un transformer decoder-only de la familia Qwen2.5-Coder, en su variante Instruct de 1.5B parámetros. El entrenamiento se realizó con TRL 0.22.2 (SFTTrainer) sobre el checkpoint `unsloth/Qwen2.5-Coder-1.5B-Instruct-bnb-4bit`, que ya incorpora cuantización de 4 bits mediante bitsandbytes. El uso de Unsloth sugiere entrenamiento con LoRA o QLoRA para reducir el consumo de VRAM, aunque la model card no especifica el rango del adaptador, el alpha, la tasa de aprendizaje, el número de pasos ni el tamaño del dataset. Tampoco se documenta si hubo fases de RLHF o DPO posteriores al SFT.

La model card no incluye información sobre la composición del corpus text-to-SQL utilizado (esquemas, dialectos SQL, pares pregunta-consulta), ni sobre el número de tokens de entrenamiento, ni sobre técnicas de aumento de datos. El run de Weights & Biases enlazado (`text2sql-specialist/runs/379av0n3`) es la única fuente potencial de detalles de entrenamiento, pero sus métricas no se reproducen en la documentación del modelo. No se documentan innovaciones técnicas adicionales más allá del uso de Unsloth y TRL.

## Capacidades

- Generación de texto y código: hereda las capacidades del Qwen2.5-Coder-1.5B-Instruct, incluyendo generación de código en múltiples lenguajes y razonamiento básico.
- Conversión text-to-SQL: el ajuste está orientado a transformar preguntas en lenguaje natural en consultas SQL, aunque no se documenta el dialecto (PostgreSQL, MySQL, SQLite, etc.) ni el esquema de evaluación.
- Formato conversacional: el pipeline de ejemplo usa mensajes con rol `user`, lo que indica que el modelo conserva la interfaz de chat del modelo base.
- Tool calling / function calling: no documentado en la model card; heredable potencialmente del base Qwen2.5-Coder-Instruct, pero sin verificación.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades multilingües: no documentadas; el modelo base Qwen2.5 soporta varios idiomas, pero el ajuste fino puede haber degradado el multilingüismo.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Prototipado de asistentes text-to-SQL en entornos de desarrollo: el modelo puede integrarse en un pipeline que reciba una pregunta en lenguaje natural y un esquema de base de datos, y devuelva una consulta SQL candidata para revisión humana. Su tamaño de 1.5B permite iterar rápidamente en local.
- Generación de consultas SQL en herramientas de BI internas: dado su bajo coste de inferencia, puede desplegarse como servicio auxiliar que sugiera consultas a analistas no técnicos, siempre con validación posterior.
- Educación y formación en SQL: el modelo puede usarse como generador de ejemplos de consultas a partir de enunciados, útil en entornos docentes donde no se requiere precisión de producción.
- Automatización de tareas de extracción de datos en scripts de ETL: para transformar especificaciones en lenguaje natural en consultas SQL sencillas dentro de pipelines internos, con revisión previa a la ejecución.
- Evaluación comparativa de técnicas de ajuste fino: dado que el repositorio documenta el stack (TRL, Unsloth, bnb-4bit), sirve como referencia reproducible para estudiar el efecto del SFT en modelos pequeños para tareas verticales.
- Despliegue en GPU de consumo para demos: con 1.5B parámetros y pesos en 4 bits, cabe en GPUs de 8 GB o menos, lo que permite demos locales con Ollama o llama.cpp tras convertir el adaptador.
- Filtrado y preprocesado de consultas en asistentes de bases de datos: el modelo puede clasificar o reescribir consultas SQL generadas por otros sistemas antes de su ejecución, como capa de post-procesado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye métricas de exactitud de ejecución (execution accuracy), exactitud de coincidencia (exact match), BLEU, ni comparaciones con modelos text-to-SQL de referencia como Spider, BIRD o WikiSQL. Tampoco se documenta el rendimiento del modelo base Qwen2.5-Coder-1.5B-Instruct en estas tareas dentro de la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador LoRA en safetensors ocupa aproximadamente 0,2 GB; el modelo base en bnb-4bit requiere en torno a 1-2 GB de VRAM para los pesos, más overhead de activaciones y KV cache (que crece con la longitud de contexto).
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para contextos cortos; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son válidas. Para contextos largos (32k tokens) se recomienda al menos 16 GB por el KV cache.
- Cabe en GPU de consumo: sí, en GPUs con 6-8 GB o más (RTX 3060, RTX 4060, RTX 3070, etc.), especialmente con cuantización adicional a GGUF Q4.
- Opciones de despliegue: Transformers con `pipeline` (como muestra la model card), vLLM, TGI, llama.cpp u Ollama tras convertir el adaptador LoRA a GGUF y fusionarlo con el base. El adaptador puede cargarse con PEFT sobre el modelo base cuantizado.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| text2sql-qwen2.5-coder-1.5b-lora | 1.5B | 32.768 (heredado, no confirmado) | Text-to-SQL (SFT) | no disponible | Hugging Face, 0 descargas |
| Qwen2.5-Coder-1.5B-Instruct | 1.5B | 32.768 | Código general | Apache 2.0 (modelo base) | Hugging Face, ampliamente usado |
| Defog SQLCoder-7B | 7B | 4.096 | Text-to-SQL | CC BY-SA 4.0 | Hugging Face |
| Picard/autres text-to-SQL ligeros | variable | variable | Text-to-SQL | variable | no disponible |

La comparación con SQLCoder u otros modelos text-to-SQL especializados no puede completarse con datos de rendimiento porque la model card no publica métricas. El modelo base Qwen2.5-Coder-1.5B-Instruct sí cuenta con benchmarks públicos de generación de código (HumanEval, MBPP) y licencia Apache 2.0, lo que contrasta con la ausencia de licencia explícita en este ajuste.

## Limitaciones y advertencias

- Licencia no especificada: la model card incluye `licence: license` sin contenido, lo que impide determinar si el uso comercial está permitido. No debe desplegarse en producción sin aclarar este punto con el autor.
- Idiomas no declarados: no se documenta qué idiomas soporta el ajuste; el modelo base Qwen2.5 es multilingüe, pero el SFT puede haber degradado lenguas distintas del inglés.
- Dataset de entrenamiento no documentado: se desconoce la composición, el dialecto SQL, el esquema y el tamaño del corpus, lo que impide evaluar sesgos y cobertura.
- Riesgo de alucinación: como todo modelo generativo pequeño, puede producir consultas SQL sintácticamente válidas pero semánticamente incorrectas, o inventar tablas y columnas inexistentes.
- Sin benchmarks publicados: no hay evidencia de exactitud de ejecución ni comparaciones con modelos text-to-SQL de referencia.
- Modelo base cuantizado en 4 bits: el ajuste se realizó sobre bnb-4bit, lo que puede introducir una pérdida de precisión adicional respecto a un ajuste sobre pesos completos.
- Repositorio sin descargas ni likes: no hay evidencia de uso comunitario ni de validación externa.
- Contexto largo heredado pero no verificado: aunque el modelo base soporta 32k tokens, no se ha confirmado que el ajuste conserve esa ventana ni su calidad en contextos largos.
- Fecha de creación futura en los metadatos (2026-11-13): conviene verificar la integridad de los metadatos antes de confiar en ellos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/parthasaradhi789/text2sql-qwen2.5-coder-1.5b-lora
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-Coder-1.5B-Instruct-bnb-4bit
- Run de entrenamiento en Weights & Biases: https://wandb.ai/parthasaradhimunakala-parthasaradhi-site/text2sql-specialist/runs/379av0n3
- Repositorio TRL: https://github.com/huggingface/trl
- Repositorio Unsloth: https://github.com/unslothai/unsloth
- Documentación de Qwen2.5-Coder: https://qwenlm.github.io/blog/qwen2.5-coder/
